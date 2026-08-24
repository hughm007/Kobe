"""OrionSession: wake, listen, sleep — with the mic provably off in standby."""

import json
import time
import urllib.request

from orion.agent import Agent
from orion.hud.bus import EventBus
from orion.hud.server import HudServer, HudState
from orion.provider import FakeProvider, text_response
from orion.tools import default_registry
from orion.voice.session import OrionSession
from orion.voice.stt import FakeSTT, TranscriptEvent
from orion.voice.tts import FakeTTS
from orion.voice.audio import FakePlayer


class FakeMic:
    """A microphone whose on/off state the tests can interrogate."""

    def __init__(self) -> None:
        import queue
        self.chunks = queue.Queue()
        self.live = False

    def start(self) -> None:
        self.live = True

    def stop(self) -> None:
        self.live = False


def make_session(config, *, provider=None, stt_events=None, follow_up=None, idle=None):
    bus = EventBus()
    agent = Agent(config, provider or FakeProvider([]), tools=default_registry(config))
    session = OrionSession(config, agent, bus)
    if follow_up is not None:
        session.follow_up_seconds = follow_up
    if idle is not None:
        session.idle_seconds = idle

    fakes = {"mic": FakeMic(), "stt": FakeSTT(stt_events or [], stay_open=True), "tts": FakeTTS(), "player": FakePlayer()}

    def open_pipeline():
        from orion.voice.conversation import VoiceConversation
        from orion.confirm import TwoStepGate

        session._mic, session._stt = fakes["mic"], fakes["stt"]
        session._speaker, session._player = fakes["tts"], fakes["player"]
        fakes["mic"].start()
        session._convo = VoiceConversation(
            agent, fakes["stt"], fakes["tts"], fakes["player"],
            voice_config=config.voice, say=lambda s: None, show=lambda s: None,
            on_hud=session._relay,
        )
        session.conversation = session._convo
        agent.set_mode("voice")
        session._previous_confirm = agent.confirm
        agent.confirm = TwoStepGate(session._convo.ask_confirmation)
        session._pump_running.set()
        import threading
        threading.Thread(target=session._run_conversation, daemon=True).start()

    session._open_pipeline = open_pipeline
    return session, bus, agent, fakes


def _wait(predicate, timeout=3.0):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if predicate():
            return True
        time.sleep(0.02)
    return False


def _kinds(bus):
    return [e["kind"] for e in bus.recent()]


def _states(bus):
    return [e.get("state") for e in bus.recent() if e["kind"] == "voice.state"]


# ------------------------------------------------------------ wake/standby

def test_wake_goes_waking_then_listening_and_standby_stops_everything(config):
    session, bus, agent, fakes = make_session(config)
    outcome = session.wake()
    assert outcome["ok"] and outcome["state"] == "LISTENING"
    assert _states(bus)[:2] == ["WAKING", "LISTENING"]
    assert fakes["mic"].live, "microphone is capturing while awake"
    assert agent.mode == "voice"

    session.standby(reason="test")
    assert session.state == "STANDBY"
    assert not fakes["mic"].live, "STANDBY means the microphone is off"
    assert fakes["stt"].stopped, "STANDBY means the Deepgram stream is closed"
    assert agent.mode == "text"
    assert session.conversation is None


def test_wake_is_idempotent_no_duplicate_pipelines(config):
    session, bus, agent, fakes = make_session(config)
    session.wake()
    first_convo = session.conversation
    outcome = session.wake()
    assert outcome["already_awake"] is True
    assert session.conversation is first_convo, "no second conversation was built"


def test_a_spoken_turn_flows_while_awake_and_survives_into_history(config):
    session, bus, agent, fakes = make_session(
        config,
        provider=FakeProvider(["The schedule is clear tomorrow."]),
        stt_events=[TranscriptEvent("final", "what's on my schedule tomorrow")],
    )
    session.wake()
    assert _wait(lambda: any(m["role"] == "assistant" for m in agent.messages))
    assert agent.messages[0]["content"] == "what's on my schedule tomorrow"
    assert _wait(lambda: len(fakes["tts"].spoken) >= 1), "the reply was spoken"


def test_follow_up_window_expiry_returns_to_standby(config):
    session, bus, agent, fakes = make_session(config, follow_up=0.3, idle=60)
    session.wake()
    assert session.state == "LISTENING"
    assert _wait(lambda: session.state == "STANDBY", timeout=5)
    assert not fakes["mic"].live
    reason = next(e for e in bus.recent() if e["kind"] == "session.standby")
    assert "no speech" in reason["reason"]


def test_activity_resets_the_follow_up_clock(config):
    session, bus, agent, fakes = make_session(config, follow_up=0.6, idle=60)
    session.wake()
    for _ in range(3):
        time.sleep(0.3)
        session.note_agent_event("turn.delta", {})  # Orion mid-reply = activity
        assert session.state != "STANDBY"
    assert _wait(lambda: session.state == "STANDBY", timeout=5)


def test_error_wake_is_reported_and_recoverable(config):
    session, bus, agent, fakes = make_session(config)

    calls = {"n": 0}
    real_open = session._open_pipeline

    def failing_open():
        calls["n"] += 1
        if calls["n"] == 1:
            raise RuntimeError("Couldn't open the microphone (no input device)")
        real_open()

    session._open_pipeline = failing_open
    outcome = session.wake()
    assert outcome["ok"] is False and outcome["state"] == "ERROR"
    assert "microphone" in outcome["error"]
    # Recoverable: the next wake starts clean and succeeds.
    assert session.wake()["ok"] is True


def test_tool_activity_becomes_executing_tool_state(config):
    session, bus, agent, fakes = make_session(config)
    session.wake()
    session.note_agent_event("tool.start", {"tool": "search_workspace"})
    assert session.state == "EXECUTING_TOOL"
    assert session.state_detail == "SEARCHING WORKSPACE"
    session.note_agent_event("tool.run", {"tool": "search_workspace"})
    assert session.state == "PROCESSING"


def test_real_audio_levels_are_published(config):
    session, bus, agent, fakes = make_session(config)
    session.wake()
    loud = (b"\x00\x40" * 512)   # constant high amplitude
    session._level("mic", loud)
    session._last_level.clear()
    session._level("out", b"\x00\x00" * 512)
    levels = [e for e in bus.recent() if e["kind"] == "audio.level"]
    by_source = {e["source"]: e["level"] for e in levels}
    assert by_source["mic"] > 0.5, "a loud mic chunk reads loud"
    assert by_source["out"] == 0.0, "silence reads silent"


# --------------------------------------------------------- the control API

def make_app_server(config, provider=None):
    bus = EventBus()
    agent = Agent(config, provider or FakeProvider([]), tools=default_registry(config))
    session = OrionSession(config, agent, bus)
    state = HudState(config, agent, bus, session=session)
    return HudServer(state, port=0).start(), session, bus


def _post(url, payload=None):
    request = urllib.request.Request(
        url, data=json.dumps(payload or {}).encode(),
        headers={"Content-Type": "application/json"}, method="POST",
    )
    with urllib.request.urlopen(request, timeout=5) as response:
        return json.loads(response.read())


def test_health_reports_pid_and_state(config):
    server, session, bus = make_app_server(config)
    try:
        with urllib.request.urlopen(server.url + "/health", timeout=5) as response:
            health = json.loads(response.read())
        assert health["ok"] and health["state"] == "STANDBY"
        assert isinstance(health["pid"], int)
    finally:
        server.stop()


def test_wake_endpoint_reports_audio_failure_honestly(config):
    """In this container there is no microphone: /wake must say so, not
    pretend. On a real Mac the same endpoint opens the pipeline."""
    server, session, bus = make_app_server(config)
    try:
        outcome = _post(server.url + "/wake")
        assert outcome["ok"] is False
        assert outcome["state"] == "ERROR"
        assert "audio" in outcome["error"].lower() or "sounddevice" in outcome["error"].lower() \
            or "microphone" in outcome["error"].lower() or "uv sync" in outcome["error"]
    finally:
        server.stop()


def test_standby_and_quit_endpoints(config):
    server, session, bus = make_app_server(config)
    try:
        outcome = _post(server.url + "/standby")
        assert outcome["ok"] is True and session.state == "STANDBY"
        _post(server.url + "/quit")
        assert server.state.quit_event.wait(timeout=3), "quit sets the shutdown event"
    finally:
        server.stop()
