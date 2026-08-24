"""Development tests for each voice layer, runnable on their own.

    uv run orion-voicetest check      startup preflight only
    uv run orion-voicetest mic        TEST 1  mic → Deepgram (live transcript)
    uv run orion-voicetest tts        TEST 2  text → ElevenLabs → speakers
    uv run orion-voicetest stt-agent  TEST 3  speak → Orion answers in text
    uv run orion-voicetest agent-tts  TEST 4  type → Orion answers aloud
    uv run orion-voicetest pipeline   TEST 5/6/7  the full conversation
                                      (interrupt it and hold multiple turns)

Each stage is testable alone so when something misbehaves you know which layer
is at fault instead of debugging all of them at once.
"""

from __future__ import annotations

import sys
import threading

from ..agent import Agent
from ..config import get_config
from ..provider import build_provider
from ..tools import default_registry
from .audio import AudioError, Microphone, Player
from .preflight import run_preflight
from .stt import DeepgramStream
from .tts import ElevenLabsSpeaker, TTSError

USAGE = "usage: orion-voicetest {check|mic|tts|stt-agent|agent-tts|pipeline}"


def _pump_mic_to_stt(mic: Microphone, stt: DeepgramStream, running: threading.Event) -> None:
    while running.is_set():
        try:
            chunk = mic.chunks.get(timeout=0.5)
        except Exception:  # noqa: BLE001 — queue.Empty
            continue
        try:
            stt.audio_in.put(chunk, timeout=0.5)
        except Exception:  # noqa: BLE001 — queue.Full: drop, don't stall audio
            pass


def cmd_check() -> int:
    config = get_config()
    print("\nOrion voice preflight:\n")
    results, ok = run_preflight(config)
    for result in results:
        print(result.line())
    print()
    if not ok:
        print("Voice mode can't start yet — fix the ✗ lines above.\n")
        return 1
    soft_failures = [r for r in results if not r.ok]
    if soft_failures:
        print("Voice mode can start, but Orion will be text-only on the reply side\n"
              "until the ✗ lines above are fixed.\n")
    else:
        print("All clear.\n")
    return 0


def cmd_mic() -> int:
    """TEST 1: speak, watch the live and final transcripts. No brain, no voice."""
    config = get_config()
    stt = DeepgramStream(config.voice)
    mic = Microphone(config.voice.sample_rate)
    try:
        mic.start()
    except AudioError as exc:
        print(f"\n  {exc}\n")
        return 1

    print("\nSpeak. Interim lines overwrite; ‹final› lines are what Orion would hear.")
    print("Ctrl-C to stop.\n")
    running = threading.Event()
    running.set()
    pump = threading.Thread(target=_pump_mic_to_stt, args=(mic, stt, running), daemon=True)
    pump.start()
    try:
        for event in stt.events():
            if event.kind == "interim":
                print(f"\r… {event.text[:100]:<100}", end="", flush=True)
            elif event.kind == "final":
                print(f"\r‹final› {event.text:<94}")
            elif event.kind == "error":
                print(f"\n  {event.text}")
                return 1
    except KeyboardInterrupt:
        pass
    finally:
        running.clear()
        stt.stop()
        mic.stop()
    print("\ndone.\n")
    return 0


def cmd_tts() -> int:
    """TEST 2: a fixed line through ElevenLabs to the speakers."""
    config = get_config()
    text = "Good evening. Orion is online."
    speaker = ElevenLabsSpeaker(config.voice)
    player = Player(config.voice.tts_sample_rate)
    print(f'\nSynthesizing: "{text}"')
    print(f"voice {config.voice.effective_voice_id} · model {config.voice.effective_tts_model}\n")
    try:
        player.start()
        for chunk in speaker.stream_phrase(text):
            player.feed(chunk)
        import time
        while player.is_playing:
            time.sleep(0.1)
    except (TTSError, AudioError) as exc:
        print(f"  {exc}\n")
        return 1
    finally:
        player.close()
    print("If you heard that, the mouth works.\n")
    return 0


def _build_agent(config, mode: str) -> Agent:
    from ..memory import MemoryStore

    provider = build_provider(config)
    memories = MemoryStore(config.state_path("memory.jsonl")).as_prompt_section()
    return Agent(config, provider, tools=default_registry(config), mode=mode, memories=memories)


def cmd_stt_agent() -> int:
    """TEST 3: speak → Deepgram → Orion → text reply. No ElevenLabs involved."""
    from .conversation import VoiceConversation
    from .audio import FakePlayer
    from .tts import FakeTTS

    config = get_config()
    agent = _build_agent(config, mode="voice")
    stt = DeepgramStream(config.voice)
    mic = Microphone(config.voice.sample_rate)
    try:
        mic.start()
    except AudioError as exc:
        print(f"\n  {exc}\n")
        return 1

    convo = VoiceConversation(
        agent, stt, FakeTTS(), FakePlayer(), voice_config=config.voice
    )
    print("\nSpeak; Orion replies in text. Ctrl-C to stop.\n")
    running = threading.Event()
    running.set()
    threading.Thread(target=_pump_mic_to_stt, args=(mic, stt, running), daemon=True).start()
    try:
        convo.run()
    except KeyboardInterrupt:
        pass
    finally:
        running.clear()
        convo.shutdown()
        mic.stop()
    return 0


def cmd_agent_tts() -> int:
    """TEST 4: type a message → Orion answers aloud. No Deepgram involved."""
    from .format import spoken_text
    from .sentences import SentenceBuffer

    config = get_config()
    agent = _build_agent(config, mode="voice")
    speaker = ElevenLabsSpeaker(config.voice)
    player = Player(config.voice.tts_sample_rate)
    try:
        player.start()
    except AudioError as exc:
        print(f"\n  {exc}\n")
        return 1

    print("\nType; Orion speaks. Blank line to stop.\n")
    try:
        while True:
            line = input("you › ").strip()
            if not line:
                break
            buffer = SentenceBuffer()
            phrases: list[str] = []

            def on_delta(chunk: str) -> None:
                phrases.extend(buffer.feed(chunk))

            reply = agent.run_turn(line, on_text_delta=on_delta)
            tail = buffer.flush()
            if tail:
                phrases.append(tail)
            print(f"{config.name} › {reply}")
            try:
                for phrase in phrases:
                    for chunk in speaker.stream_phrase(spoken_text(phrase)):
                        player.feed(chunk)
            except TTSError as exc:
                print(f"  {exc}")
            import time
            while player.is_playing:
                time.sleep(0.1)
    except (KeyboardInterrupt, EOFError):
        pass
    finally:
        player.close()
    print()
    return 0


def cmd_pipeline() -> int:
    """TESTS 5–7: the full conversation. Interrupt it; hold five turns."""
    from .conversation import VoiceConversation

    config = get_config()
    results, ok = run_preflight(config)
    for result in results:
        print(result.line())
    if not ok:
        print("\nFix the ✗ lines above first.\n")
        return 1

    agent = _build_agent(config, mode="voice")
    stt = DeepgramStream(config.voice)
    speaker = ElevenLabsSpeaker(config.voice)
    mic = Microphone(config.voice.sample_rate)
    player = Player(config.voice.tts_sample_rate)
    try:
        mic.start()
        player.start()
    except AudioError as exc:
        print(f"\n  {exc}\n")
        return 1

    convo = VoiceConversation(agent, stt, speaker, player, voice_config=config.voice)
    print(f"\n{config.name} is listening. Speak naturally; interrupt freely. Ctrl-C to stop.\n")
    running = threading.Event()
    running.set()
    threading.Thread(target=_pump_mic_to_stt, args=(mic, stt, running), daemon=True).start()
    try:
        convo.run()
    except KeyboardInterrupt:
        pass
    finally:
        running.clear()
        convo.shutdown()
        mic.stop()
        player.close()
    print(f"\n{convo.turns_completed} turns completed.\n")
    return 0


COMMANDS = {
    "check": cmd_check,
    "mic": cmd_mic,
    "tts": cmd_tts,
    "stt-agent": cmd_stt_agent,
    "agent-tts": cmd_agent_tts,
    "pipeline": cmd_pipeline,
}


def main() -> int:
    if len(sys.argv) != 2 or sys.argv[1] not in COMMANDS:
        print(USAGE)
        return 2
    return COMMANDS[sys.argv[1]]()


if __name__ == "__main__":
    raise SystemExit(main())
