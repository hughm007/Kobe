"""OrionSession — the state manager that makes Orion wake and sleep.

One object owns the voice lifecycle, so the terminal (/voice), the HUD's wake
button, and the Mac app's hotkey all call the same two verbs:

    wake()      STANDBY → WAKING → LISTENING: open the mic, connect Deepgram,
                attach the conversation to the same agent core.
    standby()   stop Deepgram, stop the microphone, silence playback, detach.
                In STANDBY nothing streams anywhere — that is the privacy
                contract, not an optimisation.

Session states (published as voice.state on the bus, rendered by the HUD):

    STANDBY · WAKING · LISTENING · PROCESSING · SPEAKING · EXECUTING_TOOL · ERROR

Timers, from [session] in orion.toml:
    follow_up_seconds  after Orion finishes speaking, how long it keeps
                       listening for a follow-up before going to standby
    idle_seconds       hard ceiling on any wake without interaction

The agent's brain is untouched: this class only manages ears, mouth and state.
"""

from __future__ import annotations

import threading
import time

ACTIVE_STATES = ("WAKING", "LISTENING", "PROCESSING", "SPEAKING", "EXECUTING_TOOL")

# What the conversation controller publishes → what the HUD state machine shows.
_STATE_ALIASES = {"THINKING": "PROCESSING", "IDLE": "STANDBY"}

# Friendly labels for tool activity, spoken by the HUD's EXECUTING_TOOL state.
TOOL_LABELS = {
    "search_workspace": "SEARCHING WORKSPACE",
    "read_workspace_file": "READING FILES",
    "write_draft": "WRITING DRAFT",
    "append_worklog": "UPDATING WORKLOG",
    "write_learning": "RECORDING LEARNING",
    "remember": "ACCESSING MEMORY",
    "forget": "ACCESSING MEMORY",
    "list_memories": "ACCESSING MEMORY",
    "delegate_coding_task": "DELEGATING TO CLAUDE CODE",
    "check_coding_job": "CHECKING CODE JOB",
    "list_coding_jobs": "CHECKING CODE JOBS",
}


class OrionSession:
    def __init__(self, config, agent, bus, *, say=None) -> None:
        self.config = config
        self.agent = agent
        self.bus = bus
        self.say = say or (lambda line: None)   # terminal status line, if any

        session_config = config.raw.get("session", {})
        self.follow_up_seconds = float(session_config.get("follow_up_seconds", 30))
        self.idle_seconds = float(session_config.get("idle_seconds", 120))

        self.state = "STANDBY"
        self.state_detail = ""
        self._lock = threading.RLock()
        self._convo = None
        self._mic = None
        self._player = None
        self._stt = None
        self._speaker = None
        self._pump_running = threading.Event()
        self._previous_confirm = None
        self._last_activity = time.monotonic()
        self._last_level: dict[str, float] = {}
        self._watchdog: threading.Thread | None = None
        # The HUD server reads this to route /interrupt; None = no live voice.
        self.conversation = None

    # -------------------------------------------------------------- state

    def _set_state(self, state: str, detail: str = "") -> None:
        state = _STATE_ALIASES.get(state, state)
        self.state = state
        self.state_detail = detail
        payload = {"state": state}
        if detail:
            payload["detail"] = detail
        self.bus.publish("voice.state", payload)

    def touch(self) -> None:
        self._last_activity = time.monotonic()

    @property
    def active(self) -> bool:
        return self.state in ACTIVE_STATES

    # --------------------------------------------------------------- wake

    def wake(self) -> dict:
        """STANDBY → LISTENING. Idempotent: an already-awake Orion just
        resets its timers and reports where it is — never a second mic,
        never a second Deepgram stream."""
        with self._lock:
            if self.active:
                self.touch()
                self.bus.publish("session.wake", {"already": True, "state": self.state})
                return {"ok": True, "state": self.state, "already_awake": True}

            self._set_state("WAKING")
            self.say("· waking")
            try:
                self._open_pipeline()
            except Exception as exc:  # noqa: BLE001 — surfaced, never swallowed
                self._teardown_pipeline()
                self._set_state("ERROR", str(exc))
                self.say(f"⚠ {exc}")
                # ERROR is recoverable: it is not an active state, so the next
                # wake() starts again from a clean pipeline.
                return {"ok": False, "state": "ERROR", "error": str(exc)}

            self.touch()
            self._ensure_watchdog()
            self._set_state("LISTENING")
            self.say("· listening")
            return {"ok": True, "state": "LISTENING", "already_awake": False}

    def _open_pipeline(self) -> None:
        from .audio import Microphone, Player
        from .conversation import VoiceConversation
        from .stt import DeepgramStream
        from .tts import ElevenLabsSpeaker
        from ..confirm import TwoStepGate

        config = self.config
        self._stt = DeepgramStream(config.voice)
        self._speaker = ElevenLabsSpeaker(config.voice)
        self._mic = Microphone(config.voice.sample_rate)
        self._player = Player(config.voice.tts_sample_rate)
        self._mic.start()
        self._player.start()
        self._player.on_feed = lambda chunk: self._level("out", chunk)

        self._convo = VoiceConversation(
            self.agent, self._stt, self._speaker, self._player,
            voice_config=config.voice,
            say=self.say,
            show=self.say,
            on_hud=self._relay,
        )
        self.conversation = self._convo
        self.agent.set_mode("voice")
        self._previous_confirm = self.agent.confirm
        # No terminal in app mode: confirmation is spoken, timeout = decline.
        self.agent.confirm = TwoStepGate(self._convo.ask_confirmation)

        self._pump_running.set()
        threading.Thread(target=self._pump_mic, daemon=True).start()
        threading.Thread(target=self._run_conversation, daemon=True).start()

    def _pump_mic(self) -> None:
        import queue as queue_module

        while self._pump_running.is_set():
            mic, stt = self._mic, self._stt
            if mic is None or stt is None:
                return
            try:
                chunk = mic.chunks.get(timeout=0.5)
            except queue_module.Empty:
                continue
            self._level("mic", chunk)
            try:
                stt.audio_in.put(chunk, timeout=0.5)
            except queue_module.Full:
                pass

    def _run_conversation(self) -> None:
        convo = self._convo
        if convo is None:
            return
        try:
            convo.run()
        except Exception as exc:  # noqa: BLE001
            self.bus.publish("hud.error", {"text": str(exc)})
        # The STT stream ended (standby, or a connection Deepgram closed).
        if self.active and self._convo is convo:
            self.standby(reason="voice stream ended")

    # ------------------------------------------------------------ standby

    def standby(self, reason: str = "requested") -> dict:
        """Stop hearing, stop speaking, stop streaming. Fully.

        After this returns: no microphone capture, no audio to Deepgram, no
        ElevenLabs synthesis, no playback. The brain and the HUD stay warm so
        the next wake is instant.
        """
        with self._lock:
            if not self.active and self._convo is None:
                self._set_state("STANDBY", reason)
                return {"ok": True, "state": "STANDBY", "already": True}
            self._teardown_pipeline()
            self._set_state("STANDBY", reason)
            self.say(f"· standby ({reason})")
            self.bus.publish("session.standby", {"reason": reason})
            return {"ok": True, "state": "STANDBY"}

    def _teardown_pipeline(self) -> None:
        self._pump_running.clear()
        convo, self._convo = self._convo, None
        self.conversation = None
        if convo is not None:
            try:
                convo.shutdown()          # stops STT stream + playback + TTS
            except Exception:  # noqa: BLE001
                pass
        for closer, attr in (("stop", "_stt"), ("stop", "_mic"), ("close", "_player")):
            device = getattr(self, attr)
            setattr(self, attr, None)
            if device is not None:
                try:
                    getattr(device, closer)()
                except Exception:  # noqa: BLE001
                    pass
        self._speaker = None
        if self._previous_confirm is not None or self.agent.mode == "voice":
            self.agent.set_mode("text")
            self.agent.confirm = self._previous_confirm
            self._previous_confirm = None

    # ------------------------------------------------------------- events

    def _relay(self, kind: str, data: dict) -> None:
        """Conversation events flow through here on their way to the bus, so
        the session can keep its own state and timers in sync."""
        if kind == "voice.state":
            raw = data.get("state", "")
            mapped = _STATE_ALIASES.get(raw, raw)
            if mapped == "STANDBY" and self.active:
                mapped = "LISTENING"  # a finished turn returns to listening, not sleep
            self.touch()
            self._set_state(mapped)
            return
        self.bus.publish(kind, data)

    def note_agent_event(self, kind: str, data: dict) -> None:
        """Called by the app's composite on_event for every agent event."""
        if kind in ("turn.start", "turn.end", "turn.delta", "gate.decision"):
            self.touch()
        if not self.active:
            return
        if kind == "tool.start":
            label = TOOL_LABELS.get(data.get("tool", ""), "EXECUTING TASK")
            self._set_state("EXECUTING_TOOL", label)
        elif kind == "tool.run" and self.state == "EXECUTING_TOOL":
            self._set_state("PROCESSING")

    def _level(self, source: str, chunk: bytes) -> None:
        """Real audio amplitude → the HUD, throttled to ~12 events/s."""
        now = time.monotonic()
        if now - self._last_level.get(source, 0.0) < 0.08:
            return
        self._last_level[source] = now
        import array

        samples = array.array("h")
        samples.frombytes(chunk[: min(len(chunk) - (len(chunk) % 2), 2048)])
        if not samples:
            return
        rms = (sum(s * s for s in samples) / len(samples)) ** 0.5
        self.bus.publish(
            "audio.level", {"source": source, "level": round(min(1.0, rms / 6000.0), 3)}
        )

    # ----------------------------------------------------------- watchdog

    def _ensure_watchdog(self) -> None:
        if self._watchdog is not None and self._watchdog.is_alive():
            return
        self._watchdog = threading.Thread(target=self._watch, daemon=True)
        self._watchdog.start()

    def _watch(self) -> None:
        while True:
            time.sleep(1.0)
            if not self.active:
                continue
            quiet_for = time.monotonic() - self._last_activity
            if self.state == "LISTENING" and quiet_for > self.follow_up_seconds:
                self.standby(reason=f"no speech for {int(self.follow_up_seconds)}s")
            elif quiet_for > self.idle_seconds:
                self.standby(reason=f"idle for {int(self.idle_seconds)}s")

    def announce(self, text: str) -> None:
        """Speak one line proactively if Orion is awake; otherwise stay quiet —
        the notice board already holds the news for Karl's return."""
        convo = self._convo
        if convo is None or not self.active:
            return
        try:
            self.touch()
            convo._queue_phrase(text, None)
            convo._phrases.put(None)  # PHRASE_END — return to LISTENING after
        except Exception:  # noqa: BLE001
            pass

    # --------------------------------------------------------------- quit

    def shutdown(self) -> None:
        self.standby(reason="quit")
