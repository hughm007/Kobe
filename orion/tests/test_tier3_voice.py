"""Tier 3 — the ears and mouth, tested to the seams.

Live audio, Deepgram and ElevenLabs need a real machine and real keys; what is
verified here is everything around them: the formatter, the sentence buffer,
the state machine, barge-in, echo suppression, latency marks, and that voice
mode drives the exact same brain as text mode.
"""

import threading
import time

import pytest

from orion.agent import Agent
from orion.provider import FakeProvider, text_response
from orion.voice.audio import FakePlayer
from orion.voice.conversation import EchoGuard, VoiceConversation
from orion.voice.format import spoken_text
from orion.voice.latency import TurnTimer
from orion.voice.sentences import SentenceBuffer
from orion.voice.stt import DeepgramStream, FakeSTT, TranscriptEvent
from orion.voice.tts import FakeTTS


# ------------------------------------------------------------- the formatter

def test_markdown_becomes_speakable_prose():
    text = (
        "### Recommendation\n"
        "**Option 2** is the strongest choice because:\n"
        "- Lower risk\n"
        "- Better ROI\n"
    )
    spoken = spoken_text(text)
    assert "#" not in spoken and "*" not in spoken and "-" not in spoken.splitlines()[0]
    assert "Option 2 is the strongest choice" in spoken
    assert "Lower risk." in spoken  # bullet became a sentence


def test_urls_paths_code_and_emoji_are_naturalised():
    text = (
        "See https://example.com/long/path?q=1 and `clients/911drain/client-brief.md`.\n"
        "```python\nprint('hi')\n```\n"
        "Done 🚀"
    )
    spoken = spoken_text(text)
    assert "https://" not in spoken
    assert "the link on screen" in spoken
    assert "client brief file" in spoken
    assert "print(" not in spoken
    assert "🚀" not in spoken


def test_tables_read_as_lists():
    text = "| Client | Status |\n|---|---|\n| 911 Drain | active |\n"
    spoken = spoken_text(text)
    assert "|" not in spoken
    assert "911 Drain, active" in spoken


# -------------------------------------------------------- the sentence buffer

def test_phrases_release_at_sentence_boundaries():
    buffer = SentenceBuffer()
    out = []
    for delta in ["The numbers are work", "able. But the asking price ", "is too high. How"]:
        out.extend(buffer.feed(delta))
    assert out == ["The numbers are workable.", "But the asking price is too high."]
    assert buffer.flush() == "How"


def test_short_openers_are_not_shipped_alone():
    buffer = SentenceBuffer()
    out = buffer.feed("Yes. The plan is sound and we should proceed today. ")
    assert out and out[0].startswith("Yes. The plan is sound")


def test_abbreviations_and_numbered_lists_do_not_split():
    buffer = SentenceBuffer()
    out = buffer.feed("We need e.g. a brief. Then we move fast. ")
    assert out[0] == "We need e.g. a brief."
    assert out[1] == "Then we move fast."


def test_flush_returns_the_tail_once():
    buffer = SentenceBuffer()
    buffer.feed("no punctuation here")
    assert buffer.flush() == "no punctuation here"
    assert buffer.flush() is None


# ------------------------------------------------------------- the echo guard

def test_own_voice_is_recognised_and_real_speech_is_not():
    guard = EchoGuard(similarity=0.75)
    guard.spoke("The asking price is too high for that property.")
    assert guard.is_echo("the asking price is too high for that property")
    assert guard.is_echo("asking price is too high")          # partial leak
    assert not guard.is_echo("Orion stop talking for a second")  # a real interruption


# ------------------------------------------------------------------ latency

def test_latency_report_reads_as_a_breakdown():
    timer = TurnTimer()
    for mark in ("t0_speech_end", "t1_transcript", "t2_agent_in",
                 "t3_first_token", "t4_first_phrase", "t5_tts_first_byte", "t6_audio_start"):
        timer.mark(mark)
        time.sleep(0.001)
    report = timer.report()
    assert "TOTAL speech→speech" in report
    assert "tts first byte" in report


# ----------------------------------------------------------- the controller

def _make_convo(config, provider_script, stt_events, **kwargs):
    provider = FakeProvider(provider_script)
    agent = Agent(config, provider, mode="voice")
    stt = FakeSTT(stt_events)
    tts = FakeTTS()
    player = FakePlayer()
    convo = VoiceConversation(
        agent, stt, tts, player,
        voice_config=config.voice, say=lambda s: None, show=lambda s: None,
    )
    return convo, agent, provider, tts, player


def _wait(predicate, timeout=3.0):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if predicate():
            return True
        time.sleep(0.01)
    return False


def test_a_spoken_turn_flows_through_the_same_brain(config):
    convo, agent, provider, tts, player = _make_convo(
        config,
        ["Conclusion: the brief is empty. Fix that before any client work happens."],
        [TranscriptEvent("start"), TranscriptEvent("final", "what do we know about nine one one drain")],
    )
    convo.run()
    assert _wait(lambda: convo.turns_completed == 1)
    # Same agent core: the voice turn is in the same history a typed turn uses.
    assert agent.messages[0]["content"] == "what do we know about nine one one drain"
    # The voice-mode system prompt was used, persona intact.
    assert "spoken to right now" in provider.calls[0]["system"]
    assert "Batman" in provider.calls[0]["system"]
    # Something was spoken, already formatted.
    assert _wait(lambda: len(tts.spoken) >= 1)
    assert player.fed, "audio reached the player"


def test_streaming_reply_is_spoken_phrase_by_phrase(config):
    convo, agent, provider, tts, player = _make_convo(
        config,
        ["The numbers are workable. But the asking price is too high. Walk away."],
        [TranscriptEvent("final", "how does the property look")],
    )
    convo.run()
    assert _wait(lambda: len(tts.spoken) >= 3)
    assert tts.spoken[0] == "The numbers are workable."
    assert tts.spoken[1] == "But the asking price is too high."


def test_multi_turn_context_carries_across_spoken_turns(config):
    convo, agent, provider, tts, player = _make_convo(
        config,
        [
            "The asking price is about forty thousand over market.",
            "Forty thousand over.",
            "Offer market value minus repairs.",
            "Yes — walking away stays on the table.",
            "Then we are done here.",
        ],
        [
            TranscriptEvent("final", "how does the property look"),
            TranscriptEvent("final", "how high"),
            TranscriptEvent("final", "so what do we offer"),
            TranscriptEvent("final", "and if they refuse"),
            TranscriptEvent("final", "good, that's all"),
        ],
    )
    # Sequential turns: each final waits for the previous to finish.
    convo.start()
    for event in convo.stt.events():
        convo.handle_event(event)
        _wait(lambda: convo.state == "LISTENING" and convo._phrases.empty(), timeout=3)
        _wait(lambda: not convo._agent_thread or not convo._agent_thread.is_alive(), timeout=3)
    convo.shutdown()

    assert convo.turns_completed == 5
    # Turn 2 ("how high") saw turn 1 in history — context, not isolated messages.
    second_call = provider.calls[1]["messages"]
    assert second_call[0]["content"] == "how does the property look"
    assert second_call[-1]["content"] == "how high"


def test_barge_in_stops_playback_and_cancels_generation(config):
    long_reply = " ".join(f"Sentence number {i} of a very long briefing." for i in range(50))
    convo, agent, provider, tts, player = _make_convo(
        config,
        [long_reply, "Understood."],
        [],
    )
    convo.start()
    convo.handle_event(TranscriptEvent("final", "give me the full briefing"))
    assert _wait(lambda: player.fed, timeout=3), "Orion started speaking"

    # Karl interrupts: "Orion, stop."  Playback must stop and the turn cancel.
    player.playing = True
    interrupted_turn_cancel = convo.cancel_generation
    convo.handle_event(TranscriptEvent("final", "orion stop"))
    assert player.stopped_count >= 1, "speaker was silenced"
    assert interrupted_turn_cancel.is_set(), "the interrupted turn's generation was cancelled"
    # The interruption itself became the next turn.
    assert _wait(lambda: any(
        m["content"] == "orion stop" for m in agent.messages if m["role"] == "user"
    ), timeout=3)
    convo.shutdown()


def test_orion_does_not_answer_its_own_voice(config):
    convo, agent, provider, tts, player = _make_convo(
        config,
        ["The asking price is too high."],
        [],
    )
    convo.start()
    convo.handle_event(TranscriptEvent("final", "how does the property look"))
    assert _wait(lambda: convo.turns_completed == 1, timeout=3)

    # Playback is running and the mic hears Orion's own sentence.
    player.playing = True
    convo.echo_guard.spoke("The asking price is too high.")
    before = len(provider.calls)
    convo.handle_event(TranscriptEvent("final", "the asking price is too high"))
    time.sleep(0.2)
    assert len(provider.calls) == before, "self-echo must not become a turn"
    convo.shutdown()


def test_tts_failure_degrades_to_text_not_a_crash(config):
    class BrokenTTS(FakeTTS):
        def stream_phrase(self, text):
            raise RuntimeError("ElevenLabs is not configured. Add ELEVENLABS_API_KEY to .env.")
            yield  # pragma: no cover

    provider = FakeProvider(["Short answer."])
    agent = Agent(config, provider, mode="voice")
    warnings = []
    convo = VoiceConversation(
        agent, FakeSTT([TranscriptEvent("final", "hello")]), BrokenTTS(), FakePlayer(),
        voice_config=config.voice, say=warnings.append, show=lambda s: None,
    )
    convo.run()
    assert _wait(lambda: convo.turns_completed == 1)
    assert _wait(lambda: any("ELEVENLABS_API_KEY" in w for w in warnings))
    assert _wait(lambda: any("replies continue on screen" in w for w in warnings))


def test_stt_error_is_reported_plainly(config):
    provider = FakeProvider([])
    agent = Agent(config, provider, mode="voice")
    warnings = []
    convo = VoiceConversation(
        agent,
        FakeSTT([TranscriptEvent("error", "Deepgram rejected the API key. Check DEEPGRAM_API_KEY in orion/.env.")]),
        FakeTTS(), FakePlayer(),
        voice_config=config.voice, say=warnings.append, show=lambda s: None,
    )
    convo.run()
    assert any("DEEPGRAM_API_KEY" in w for w in warnings)


# ------------------------------------------------------- the Deepgram parser

def test_flux_url_and_events(config):
    stream = DeepgramStream(config.voice, api_key="test")
    url = stream.url()
    assert url.startswith("wss://api.deepgram.com/v2/listen?")
    assert "model=flux-general-en" in url
    assert "sample_rate=16000" in url
    assert "eot_threshold=0.7" in url

    assert stream._parse({"type": "TurnInfo", "event": "StartOfTurn"}).kind == "start"
    final = stream._parse(
        {"type": "TurnInfo", "event": "EndOfTurn", "transcript": "hello there",
         "end_of_turn_confidence": 0.93}
    )
    assert final.kind == "final" and final.text == "hello there"
    assert stream._parse({"type": "TurnInfo", "event": "TurnResumed"}).kind == "resumed"
    assert stream._parse({"type": "Metadata"}) is None


def test_nova_fallback_accumulates_segments(config):
    object.__setattr__(config.voice, "stt_engine", "nova")
    stream = DeepgramStream(config.voice, api_key="test")
    assert "v1/listen" in stream.url()

    def results(text, is_final, speech_final=False):
        return {
            "type": "Results", "is_final": is_final, "speech_final": speech_final,
            "channel": {"alternatives": [{"transcript": text, "confidence": 0.9}]},
        }

    assert stream._parse(results("how does", False)).kind == "interim"
    assert stream._parse(results("how does the", True)).kind == "eager"
    final = stream._parse(results("property look", True, speech_final=True))
    assert final.kind == "final"
    assert final.text == "how does the property look"


def test_missing_deepgram_key_yields_a_clear_error(config):
    stream = DeepgramStream(config.voice, api_key="")
    events = list(stream.events())
    assert events[0].kind == "error"
    assert "DEEPGRAM_API_KEY" in events[0].text


# ---------------------- regressions from the live speaker-echo incident ----

def test_echo_is_caught_even_after_playback_has_stopped():
    """Deepgram's transcript of Orion's speech lands seconds after the audio
    ends — the guard must not depend on 'is playing right now'."""
    guard = EchoGuard(similarity=0.75)
    guard.spoke("The switch didn't go through.")
    guard.spoke("The confirmation didn't register on my end, so I'm still on opus five.")
    # No player involved at all — content alone must be enough.
    assert guard.is_echo("the confirmation didn't register on my end so I'm still on opus five")


def test_concatenated_multi_phrase_echo_is_caught():
    """A long reply echoes back as several spoken phrases joined into one
    transcript — exactly what looped live on speakers."""
    guard = EchoGuard(similarity=0.75)
    guard.spoke("The switch didn't go through.")
    guard.spoke("Say the word and I'll fire it again.")
    guard.spoke("Worth checking whether the confirmation dialog is actually appearing on your screen.")
    monologue = ("the switch didn't go through say the word and I'll fire it again "
                 "worth checking whether the confirmation dialog is actually appearing on your screen")
    assert guard.is_echo(monologue)
    # Genuinely new speech sharing a couple of words still gets through.
    assert not guard.is_echo("actually switch to fable five right now")


def test_spoken_confirmation_survives_its_own_echo(config):
    """The gate's question echoing back must not consume the answer slot,
    and Karl's short 'yes'/'confirm' must never be eaten by the guard —
    even though the spoken question itself contains the word 'confirm'."""
    import threading
    from orion.confirm import TwoStepGate

    provider = FakeProvider([])
    agent = Agent(config, provider, mode="voice")
    convo = VoiceConversation(
        agent, FakeSTT([]), FakeTTS(), FakePlayer(),
        voice_config=config.voice, say=lambda s: None, show=lambda s: None,
    )

    def feed_answers():
        for step, real_answer in enumerate(("yes", "confirm")):
            deadline = time.monotonic() + 2
            while not convo._awaiting_confirmation.is_set() and time.monotonic() < deadline:
                time.sleep(0.01)
            # First the question itself echoes back through the mic…
            question_echo = (
                "I'm about to switch the brain to claude fable five at medium effort "
                "this is on your always ask list should I go ahead"
                if step == 0 else
                "are you sure you want to confirm say confirm to proceed"
            )
            convo.handle_event(TranscriptEvent("final", question_echo))
            # …then Karl actually answers.
            convo.handle_event(TranscriptEvent("final", real_answer))
            while convo._awaiting_confirmation.is_set() and time.monotonic() < deadline:
                time.sleep(0.01)

    thread = threading.Thread(target=feed_answers, daemon=True)
    thread.start()
    gate = TwoStepGate(convo.ask_confirmation)
    approved = gate("switch the brain to claude-fable-5 at medium effort", "set_model")
    thread.join(timeout=5)
    assert approved is True, "the echoed question must not decline the gate; Karl's words must"
