"""The HUD: a live view of the same agent, never a second brain."""

import json
import time
import urllib.error
import urllib.request

from orion.agent import Agent
from orion.hud.bus import EventBus
from orion.hud.server import HudServer, HudState
from orion.notices import NoticeBoard
from orion.provider import FakeProvider, text_response, tool_response
from orion.tools import default_registry


def _get(url):
    with urllib.request.urlopen(url, timeout=5) as response:
        return response.status, response.read()


def _post(url, payload):
    request = urllib.request.Request(
        url, data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"}, method="POST",
    )
    with urllib.request.urlopen(request, timeout=5) as response:
        return response.status, json.loads(response.read())


def make_server(config, provider):
    bus = EventBus()
    agent = Agent(
        config, provider, tools=default_registry(config),
        on_event=lambda kind, data: bus.publish(kind, data),
    )
    state = HudState(config, agent, bus, board=NoticeBoard(config.state_path("notices.jsonl")))
    return HudServer(state, port=0).start(), bus, agent


# ------------------------------------------------------------------- the bus

def test_bus_delivers_and_backfills():
    bus = EventBus(history=5)
    bus.publish("a", {"n": 1})
    bus.publish("b", {"n": 2})
    _, q = bus.subscribe(replay=True)
    assert q.get_nowait()["kind"] == "a"
    assert q.get_nowait()["kind"] == "b"
    bus.publish("c")
    assert q.get_nowait()["kind"] == "c"


def test_bus_ring_buffer_is_bounded():
    bus = EventBus(history=3)
    for i in range(10):
        bus.publish(f"e{i}")
    assert [e["kind"] for e in bus.recent()] == ["e7", "e8", "e9"]


# ---------------------------------------------------------------- the server

def test_page_is_served_and_self_contained(config):
    server, bus, agent = make_server(config, FakeProvider([]))
    try:
        status, body = _get(server.url + "/")
        assert status == 200
        html = body.decode()
        assert "ORION" in html and "AI VOICE SYSTEM" in html
        # Self-contained: no external scripts, styles or fonts.
        assert "http://" not in html.replace(server.url, "").replace("http://127.0.0.1", "")
        assert "https://" not in html
        assert "<script src" not in html and "<link" not in html
    finally:
        server.stop()


def test_state_snapshot_reports_the_real_agent(config):
    server, bus, agent = make_server(config, FakeProvider([]))
    try:
        _, body = _get(server.url + "/state")
        state = json.loads(body)
        assert state["name"] == "Orion"
        assert state["provider"] == "fake"
        tool_names = {t["name"] for t in state["tools"]}
        assert "search_workspace" in tool_names
        assert next(t for t in state["tools"] if t["name"] == "forget")["gated"] is True
        assert state["checks"]["brain"] is True     # fake provider counts as ready
        assert state["checks"]["ears"] is False     # no Deepgram key in tests
    finally:
        server.stop()


def test_say_routes_through_the_same_agent_and_streams_events(config):
    provider = FakeProvider(
        [tool_response("search_workspace", {"query": "brief"}),
         text_response("Conclusion: the brief is empty.")]
    )
    server, bus, agent = make_server(config, provider)
    try:
        _, q = bus.subscribe(replay=False)
        status, reply = _post(server.url + "/say", {"text": "what do we know?"})
        assert reply["ok"] is True

        deadline = time.monotonic() + 5
        kinds = []
        while time.monotonic() < deadline and "turn.end" not in kinds:
            try:
                kinds.append(q.get(timeout=0.5)["kind"])
            except Exception:  # noqa: BLE001
                pass
        assert "turn.start" in kinds
        assert "tool.run" in kinds, "the HUD sees the tool light up"
        assert "turn.delta" in kinds, "the reply streams to the page"
        assert "turn.end" in kinds
        # Same brain: the turn is in the agent's own history.
        assert agent.messages[0]["content"] == "what do we know?"
    finally:
        server.stop()


def test_empty_say_is_rejected(config):
    server, bus, agent = make_server(config, FakeProvider([]))
    try:
        try:
            _post(server.url + "/say", {"text": "  "})
            raised = False
        except urllib.error.HTTPError as exc:
            raised = exc.code == 400
        assert raised
    finally:
        server.stop()


def test_dismiss_clears_a_notice(config):
    server, bus, agent = make_server(config, FakeProvider([]))
    try:
        notice = server.state.board.post("probe", "notify", "look at this")
        _, reply = _post(server.url + "/dismiss", {"id": notice.id})
        assert reply["ok"] is True
        _, body = _get(server.url + "/state")
        assert json.loads(body)["notices"] == []
    finally:
        server.stop()


def test_interrupt_reaches_the_conversation(config):
    server, bus, agent = make_server(config, FakeProvider([]))
    try:
        class Probe:
            def __init__(self):
                self.hits = 0
            def interrupt(self):
                self.hits += 1

        _, reply = _post(server.url + "/interrupt", {})
        assert reply["ok"] is False, "no live voice conversation to stop"
        probe = Probe()
        server.state.conversation = probe
        _, reply = _post(server.url + "/interrupt", {})
        assert reply["ok"] is True and probe.hits == 1
    finally:
        server.stop()
