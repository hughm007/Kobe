"""The conversation controller — the state machine that makes voice feel live.

    LISTENING  the mic streams to Deepgram; Orion waits
    THINKING   a final transcript went into the brain; text is streaming back
    SPEAKING   phrases are being synthesized and played

Rules it enforces:

- One brain. The final transcript goes into the exact same Agent.run_turn as a
  typed message. Same prompt, memory, tools, gate, context.
- Barge-in. If Karl starts speaking while Orion is THINKING or SPEAKING:
  playback stops now, queued phrases are dropped, in-flight TTS is aborted,
  and generation itself is cancelled. Then Orion listens.
- No listening to itself. The mic never closes (that would kill barge-in);
  instead, while audio is playing, transcripts that closely match what Orion
  just said are recognised as its own voice leaking into the mic and dropped.
  Real interruptions — which don't sound like Orion's sentence — get through.
- Everything visible. The transcript of what Deepgram heard prints next to the
  reply, so a wrong answer is diagnosable as ears-vs-brain at a glance.
"""

from __future__ import annotations

import difflib
import queue
import re
import threading
from collections import deque
from typing import Callable

from .format import spoken_text
from .latency import TurnTimer
from .sentences import SentenceBuffer

PHRASE_END = None  # sentinel on the phrase queue: the reply is complete


def _normalise(text: str) -> str:
    return re.sub(r"[^a-z0-9 ]", "", text.lower()).strip()


class EchoGuard:
    """Decides whether a transcript is Orion's own voice coming back in."""

    def __init__(self, similarity: float) -> None:
        self.similarity = similarity
        self._recent: deque[str] = deque(maxlen=6)

    def spoke(self, phrase: str) -> None:
        self._recent.append(_normalise(phrase))

    def is_echo(self, transcript: str) -> bool:
        heard = _normalise(transcript)
        if not heard:
            return True  # nothing intelligible — treat as noise
        for said in self._recent:
            if not said:
                continue
            if heard in said:
                return True
            ratio = difflib.SequenceMatcher(None, heard, said).ratio()
            if ratio >= self.similarity:
                return True
        return False


class VoiceConversation:
    """Wires mic → STT → agent → formatter → TTS → player, with barge-in.

    Every collaborator is injected, so the whole controller runs under test
    with fakes — the only things that need a real machine are the devices and
    the two web APIs.
    """

    def __init__(
        self,
        agent,
        stt,                      # DeepgramStream or FakeSTT
        tts,                      # ElevenLabsSpeaker or FakeTTS
        player,                   # Player or FakePlayer
        *,
        voice_config,
        say: Callable[[str], None] = print,       # status lines to the terminal
        show: Callable[[str], None] = print,      # transcripts and replies
    ) -> None:
        self.agent = agent
        self.stt = stt
        self.tts = tts
        self.player = player
        self.config = voice_config
        self.say = say
        self.show = show

        self.echo_guard = EchoGuard(voice_config.self_echo_similarity)
        self.cancel_generation = threading.Event()
        self._phrases: "queue.Queue[str | None]" = queue.Queue()
        self._speaker_thread: threading.Thread | None = None
        self._agent_thread: threading.Thread | None = None
        self._running = threading.Event()
        self.state = "LISTENING"
        self.timer: TurnTimer | None = None
        self.turns_completed = 0
        # While a confirmation is pending, final transcripts are answers to the
        # gate, not new turns.
        self._confirm_answers: "queue.Queue[str]" = queue.Queue()
        self._awaiting_confirmation = threading.Event()

    # ------------------------------------------------------------- lifecycle

    def start(self) -> None:
        self._running.set()
        self._speaker_thread = threading.Thread(target=self._speak_loop, daemon=True)
        self._speaker_thread.start()

    def shutdown(self) -> None:
        self._running.clear()
        self.interrupt()
        self.stt.stop()
        self._phrases.put(PHRASE_END)

    # ------------------------------------------------------------ the events

    def run(self) -> None:
        """Consume STT events until shutdown. Blocks; run on the main thread."""
        self.start()
        try:
            for event in self.stt.events():
                if not self._running.is_set():
                    break
                self.handle_event(event)
            # The event stream ended on its own (connection closed, or a fake
            # ran out of script) — let the in-flight turn finish speaking
            # rather than cutting Orion off mid-sentence.
            self._wait_idle()
        finally:
            self.shutdown()

    def _wait_idle(self, timeout: float = 5.0) -> None:
        import time as _time

        thread = self._agent_thread
        if thread is not None:
            thread.join(timeout)
        deadline = _time.monotonic() + timeout
        while not self._phrases.empty() and _time.monotonic() < deadline:
            _time.sleep(0.01)

    def handle_event(self, event) -> None:
        kind = event.kind
        if kind == "error":
            self.say(f"⚠ {event.text}")
            return

        if kind == "start":
            self._maybe_barge_in(transcript=None)
            return

        if kind == "interim":
            return  # displayed only in the dev mic test; too noisy live

        if kind in ("eager", "resumed"):
            # EagerEndOfTurn warm-up is a future optimisation; TurnResumed
            # needs no action because we only act on final transcripts.
            return

        if kind == "final":
            transcript = event.text.strip()
            if not transcript:
                return
            if self._is_self_echo(transcript):
                return
            if self._awaiting_confirmation.is_set():
                self._confirm_answers.put(transcript)
                return
            if self.state in ("THINKING", "SPEAKING") or self.player.is_playing:
                # A real interruption — whether generation is still running or
                # only the audio tail is still draining from the speakers.
                self.interrupt()
            self._begin_turn(transcript)

    # ------------------------------------------------------------- barge-in

    def _is_self_echo(self, transcript: str) -> bool:
        if self.state == "LISTENING" and not self.player.is_playing:
            return False
        return self.player.is_playing and self.echo_guard.is_echo(transcript)

    def _maybe_barge_in(self, transcript: str | None) -> None:
        if not self.config.barge_in:
            return
        if self.state not in ("THINKING", "SPEAKING"):
            return
        # StartOfTurn fires before there is a transcript to test against the
        # echo guard — only silence playback once we know it isn't Orion's own
        # voice, i.e. either playback already ended or a non-echo final came in.
        if transcript is None and self.player.is_playing:
            return
        self.interrupt()
        self.say("· listening")

    def interrupt(self) -> None:
        """Stop everything Orion is saying or about to say. Immediately."""
        self.cancel_generation.set()      # 4. abort the model's generation
        self.tts.cancel.set()             # 3. abort in-flight synthesis
        self._drain_phrases()             # 2. drop queued phrases
        self.player.stop_playback()       # 1. silence the speakers
        self.state = "LISTENING"

    def _drain_phrases(self) -> None:
        try:
            while True:
                self._phrases.get_nowait()
        except queue.Empty:
            pass

    # ------------------------------------------------------------- the turn

    def _begin_turn(self, transcript: str) -> None:
        self.timer = TurnTimer()
        self.timer.mark("t0_speech_end")
        self.timer.mark("t1_transcript")
        self.show(f"you (heard) › {transcript}")
        self.say("· thinking")

        # Fresh flags for the new turn.
        self.cancel_generation = threading.Event()
        self.tts.cancel = threading.Event()
        self.state = "THINKING"

        self._agent_thread = threading.Thread(
            target=self._agent_turn, args=(transcript,), daemon=True
        )
        self._agent_thread.start()

    def _agent_turn(self, transcript: str) -> None:
        timer = self.timer
        cancel = self.cancel_generation
        buffer = SentenceBuffer()

        def on_delta(chunk: str) -> None:
            if timer:
                timer.mark("t3_first_token")
            for phrase in buffer.feed(chunk):
                self._queue_phrase(phrase, timer)

        if timer:
            timer.mark("t2_agent_in")
        try:
            reply = self.agent.run_turn(transcript, on_text_delta=on_delta, cancel=cancel)
        except Exception as exc:  # noqa: BLE001 — a dead turn must not kill the loop
            self.say(f"⚠ {exc}")
            self.state = "LISTENING"
            return

        if not cancel.is_set():
            tail = buffer.flush()
            if tail:
                self._queue_phrase(tail, timer)
            self._phrases.put(PHRASE_END)
            self.show(f"{self.agent.config.name} › {reply}")
            self.turns_completed += 1

    def _queue_phrase(self, phrase: str, timer: TurnTimer | None) -> None:
        speakable = spoken_text(phrase)
        if not speakable:
            return
        if timer:
            timer.mark("t4_first_phrase")
        self.state = "SPEAKING"
        self._phrases.put(speakable)

    # -------------------------------------------------------- confirmation

    def ask_confirmation(self, question: str) -> str | None:
        """Speak the gate's question, then wait for Karl's spoken answer.

        Called from the agent thread mid-turn. The question bypasses the
        phrase queue (which belongs to the reply) and is spoken directly.
        Returns None on timeout — the gate treats that as a decline, so an
        unattended question can never hang the turn.
        """
        self.show(f"{self.agent.config.name} asks › {question}")
        self._drain_answers()
        self._awaiting_confirmation.set()
        try:
            try:
                for chunk in self.tts.stream_phrase(spoken_text(question)):
                    self.player.feed(chunk)
            except Exception as exc:  # noqa: BLE001 — question still shown on screen
                self.say(f"⚠ {exc}")
            timeout = getattr(self.agent.config.gate, "voice_timeout_seconds", 30.0)
            try:
                answer = self._confirm_answers.get(timeout=timeout)
            except queue.Empty:
                self.say("· no answer — treating that as a no")
                return None
            self.show(f"you (heard) › {answer}")
            return answer
        finally:
            self._awaiting_confirmation.clear()

    def _drain_answers(self) -> None:
        try:
            while True:
                self._confirm_answers.get_nowait()
        except queue.Empty:
            pass

    # ---------------------------------------------------------- the speaker

    def _speak_loop(self) -> None:
        while self._running.is_set():
            try:
                phrase = self._phrases.get(timeout=0.25)
            except queue.Empty:
                continue
            if phrase is PHRASE_END:
                self._finish_turn()
                continue
            if self.tts.cancel.is_set():
                continue

            timer = self.timer
            if timer and self.player.on_first_audio is None:
                self.player.on_first_audio = lambda t=timer: t.mark("t6_audio_start")
            try:
                first = True
                for chunk in self.tts.stream_phrase(phrase):
                    if first and timer:
                        timer.mark("t5_tts_first_byte")
                        first = False
                    if self.tts.cancel.is_set():
                        break
                    self.player.feed(chunk)
                else:
                    self.echo_guard.spoke(phrase)
            except Exception as exc:  # noqa: BLE001 — voice down ≠ Orion down
                self.say(f"⚠ {exc}")
                self.say("  (voice output failed — replies continue on screen)")

    def _finish_turn(self) -> None:
        if self.state == "SPEAKING" or self.state == "THINKING":
            self.state = "LISTENING"
        if self.timer and self.config.latency_log:
            self.say("· " + self.timer.report())
        self.timer = None
