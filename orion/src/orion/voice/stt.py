"""The ears — Deepgram streaming speech-to-text, behind a seam.

The contract is small: feed audio chunks in, get `TranscriptEvent`s out.
Nothing outside this module knows Deepgram exists, so the transcriber can be
swapped (or faked in tests) without touching the pipeline.

Engine "flux" uses Deepgram Flux — a conversational model with turn detection
built in: it tells us when Karl starts speaking, when he's finished, and when
a pause was just a pause (TurnResumed), which is exactly what an open-mic
assistant needs. Engine "nova" is the classic /v1/listen streaming fallback
with endpointing, kept one config line away in case Flux misbehaves.
"""

from __future__ import annotations

import json
import os
import queue
import threading
import urllib.parse
from dataclasses import dataclass
from typing import Iterator

# Event kinds, engine-neutral:
#   start   — speech began (barge-in trigger)
#   interim — partial transcript, display only
#   eager   — Flux EagerEndOfTurn: probably finished, good moment to warm up
#   resumed — false alarm, the turn continues (cancel eager work)
#   final   — the turn is over; .text is what was said
#   error   — something broke; .text explains it in plain language
EventKind = str


@dataclass
class TranscriptEvent:
    kind: EventKind
    text: str = ""
    confidence: float = 0.0


class STTError(RuntimeError):
    """A speech-to-text failure, phrased for a human."""


AUDIO_CHUNK_SENTINEL = None  # push into the audio queue to close the stream


class DeepgramStream:
    """One live transcription session over a websocket.

    Run `events()` on a consumer thread; push PCM chunks (16-bit mono at the
    configured sample rate) into `audio_in`. Reconnects once on an unexpected
    drop; auth failures are reported clearly, not retried forever.
    """

    def __init__(self, voice_config, api_key: str | None = None) -> None:
        self.config = voice_config
        self.api_key = (api_key or os.environ.get("DEEPGRAM_API_KEY", "")).strip()
        self.audio_in: "queue.Queue[bytes | None]" = queue.Queue(maxsize=256)
        self._stop = threading.Event()
        self._nova_parts: list[str] = []  # is_final segments awaiting utterance end

    # ------------------------------------------------------------------ setup

    def url(self) -> str:
        cfg = self.config
        if cfg.stt_engine == "flux":
            params = {
                "model": cfg.stt_model_flux,
                "encoding": "linear16",
                "sample_rate": str(cfg.sample_rate),
                "eot_threshold": str(cfg.eot_threshold),
            }
            if cfg.eager_eot_threshold:
                params["eager_eot_threshold"] = str(cfg.eager_eot_threshold)
            return "wss://api.deepgram.com/v2/listen?" + urllib.parse.urlencode(params)
        params = {
            "model": cfg.stt_model_fallback,
            "encoding": "linear16",
            "sample_rate": str(cfg.sample_rate),
            "channels": "1",
            "interim_results": "true",
            "vad_events": "true",
            "utterance_end_ms": "1200",
            "endpointing": "500",
            "smart_format": "true",
        }
        return "wss://api.deepgram.com/v1/listen?" + urllib.parse.urlencode(params)

    def stop(self) -> None:
        self._stop.set()
        try:
            self.audio_in.put_nowait(AUDIO_CHUNK_SENTINEL)
        except queue.Full:
            pass

    # ------------------------------------------------------------------ loop

    def events(self) -> Iterator[TranscriptEvent]:
        if not self.api_key:
            yield TranscriptEvent(
                "error",
                "Deepgram is not configured. Add DEEPGRAM_API_KEY to orion/.env.",
            )
            return
        try:
            from websockets.sync.client import connect  # type: ignore
            import websockets
        except ImportError:
            yield TranscriptEvent(
                "error",
                "The websockets package isn't installed. Run `uv sync --extra voice`.",
            )
            return

        attempts = 0
        while not self._stop.is_set() and attempts < 2:  # one automatic reconnect
            attempts += 1
            try:
                with connect(
                    self.url(),
                    additional_headers={"Authorization": f"Token {self.api_key}"},
                    max_size=2**22,
                ) as ws:
                    attempts = 0  # a good connection resets the retry budget
                    sender = threading.Thread(
                        target=self._pump_audio, args=(ws,), daemon=True
                    )
                    sender.start()
                    try:
                        for raw in ws:
                            if self._stop.is_set():
                                break
                            if isinstance(raw, bytes):
                                continue
                            event = self._parse(json.loads(raw))
                            if event is not None:
                                yield event
                    finally:
                        sender.join(timeout=2)
            except Exception as exc:  # noqa: BLE001 — classified right below
                message = str(exc)
                if any(code in message for code in ("401", "403", "Unauthorized", "Forbidden")):
                    yield TranscriptEvent(
                        "error",
                        "Deepgram rejected the API key. Check DEEPGRAM_API_KEY in orion/.env.",
                    )
                    return
                if self._stop.is_set():
                    return
                if attempts >= 2:
                    yield TranscriptEvent(
                        "error",
                        f"Lost the Deepgram connection and couldn't reconnect ({message}). "
                        "Check the network, then restart voice mode.",
                    )
                    return
                yield TranscriptEvent("interim", "(reconnecting to Deepgram…)")

    def _pump_audio(self, ws) -> None:
        try:
            while not self._stop.is_set():
                try:
                    chunk = self.audio_in.get(timeout=0.5)
                except queue.Empty:
                    continue
                if chunk is AUDIO_CHUNK_SENTINEL:
                    ws.send(json.dumps({"type": "CloseStream"}))
                    return
                ws.send(chunk)
        except Exception:  # noqa: BLE001 — the reader loop reports the failure
            pass

    # ------------------------------------------------------------------ parse

    def _parse(self, msg: dict) -> TranscriptEvent | None:
        if self.config.stt_engine == "flux":
            return self._parse_flux(msg)
        return self._parse_nova(msg)

    def _nova_final(self) -> TranscriptEvent | None:
        text = " ".join(self._nova_parts).strip()
        self._nova_parts.clear()
        return TranscriptEvent("final", text) if text else None

    @staticmethod
    def _parse_flux(msg: dict) -> TranscriptEvent | None:
        if msg.get("type") == "Error":
            return TranscriptEvent("error", f"Deepgram error: {msg.get('description', msg)}")
        if msg.get("type") != "TurnInfo":
            return None
        event = msg.get("event", "")
        text = (msg.get("transcript") or "").strip()
        confidence = float(msg.get("end_of_turn_confidence") or 0.0)
        if event == "StartOfTurn":
            return TranscriptEvent("start")
        if event == "Update" and text:
            return TranscriptEvent("interim", text)
        if event == "EagerEndOfTurn" and text:
            return TranscriptEvent("eager", text, confidence)
        if event == "TurnResumed":
            return TranscriptEvent("resumed", text)
        if event == "EndOfTurn" and text:
            return TranscriptEvent("final", text, confidence)
        return None

    def _parse_nova(self, msg: dict) -> TranscriptEvent | None:
        msg_type = msg.get("type", "")
        if msg_type == "SpeechStarted":
            return TranscriptEvent("start")
        if msg_type == "UtteranceEnd":
            # Endpointing missed the pause but the utterance is over — flush.
            return self._nova_final()
        if msg_type == "Results":
            alt = (msg.get("channel", {}).get("alternatives") or [{}])[0]
            text = (alt.get("transcript") or "").strip()
            if not text:
                return None
            if msg.get("is_final"):
                self._nova_parts.append(text)
                if msg.get("speech_final"):
                    return self._nova_final()
                return TranscriptEvent("eager", " ".join(self._nova_parts))
            return TranscriptEvent("interim", text)
        if msg_type == "Error":
            return TranscriptEvent("error", f"Deepgram error: {msg}")
        return None


class FakeSTT:
    """Scripted ears for tests: yields a fixed sequence of events.

    stay_open=True mimics the real stream, which stays connected after the
    scripted events until stop() — what session-lifecycle tests need.
    """

    def __init__(self, events: list[TranscriptEvent], *, stay_open: bool = False) -> None:
        self._events = list(events)
        self.stay_open = stay_open
        self.audio_in: "queue.Queue[bytes | None]" = queue.Queue()
        self.stopped = False

    def stop(self) -> None:
        self.stopped = True

    def events(self) -> Iterator[TranscriptEvent]:
        import time as time_module

        index = 0
        while not self.stopped:
            if index < len(self._events):
                yield self._events[index]
                index += 1
            elif self.stay_open:
                time_module.sleep(0.05)  # keep the stream open for late events
            else:
                return
