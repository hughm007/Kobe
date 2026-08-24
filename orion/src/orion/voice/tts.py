"""The mouth — ElevenLabs streaming text-to-speech, behind a seam.

Contract: give it a phrase, it yields raw PCM chunks as they arrive. The
pipeline starts playback on the first chunk, so Orion begins speaking while
the response — and even this phrase's own audio — is still being generated.
Nothing outside this module knows ElevenLabs exists.
"""

from __future__ import annotations

import os
import threading
from typing import Iterator

import httpx

API_BASE = "https://api.elevenlabs.io"


class TTSError(RuntimeError):
    """A text-to-speech failure, phrased for a human."""


class ElevenLabsSpeaker:
    def __init__(self, voice_config, api_key: str | None = None) -> None:
        self.config = voice_config
        self.api_key = (api_key or os.environ.get("ELEVENLABS_API_KEY", "")).strip()
        # Set to abort an in-flight synthesis mid-stream (barge-in).
        self.cancel = threading.Event()

    def _require_key(self) -> None:
        if not self.api_key:
            raise TTSError(
                "ElevenLabs is not configured. Add ELEVENLABS_API_KEY to orion/.env."
            )

    def stream_phrase(self, text: str) -> Iterator[bytes]:
        """Synthesize one phrase; yield PCM chunks as they arrive.

        Stops immediately — mid-download — if `self.cancel` is set.
        """
        self._require_key()
        cfg = self.config
        url = f"{API_BASE}/v1/text-to-speech/{cfg.effective_voice_id}/stream"
        params = {"output_format": cfg.tts_output_format}
        body = {
            "text": text,
            "model_id": cfg.effective_tts_model,
        }
        headers = {"xi-api-key": self.api_key}

        try:
            with httpx.Client(timeout=httpx.Timeout(30.0, connect=10.0)) as client:
                with client.stream("POST", url, params=params, json=body, headers=headers) as response:
                    if response.status_code == 401:
                        raise TTSError(
                            "ElevenLabs rejected the API key. Check ELEVENLABS_API_KEY in orion/.env."
                        )
                    if response.status_code == 404:
                        raise TTSError(
                            f"ElevenLabs can't find voice '{cfg.effective_voice_id}'. "
                            "Check ELEVENLABS_VOICE_ID — is that voice in your library?"
                        )
                    if response.status_code >= 400:
                        detail = response.read().decode("utf-8", "replace")[:200]
                        raise TTSError(f"ElevenLabs error (HTTP {response.status_code}): {detail}")
                    for chunk in response.iter_bytes(chunk_size=4096):
                        if self.cancel.is_set():
                            return
                        if chunk:
                            yield chunk
        except httpx.HTTPError as exc:
            raise TTSError(f"Couldn't reach ElevenLabs: {exc}") from exc

    def synthesize(self, text: str) -> bytes:
        """Whole-phrase synthesis, for the dev tests."""
        return b"".join(self.stream_phrase(text))


class FakeTTS:
    """A scripted mouth: records what would have been spoken, yields dummy PCM."""

    def __init__(self, chunk: bytes = b"\x00\x01" * 160, chunks_per_phrase: int = 4) -> None:
        self.spoken: list[str] = []
        self.cancel = threading.Event()
        self._chunk = chunk
        self._count = chunks_per_phrase

    def stream_phrase(self, text: str) -> Iterator[bytes]:
        self.spoken.append(text)
        for _ in range(self._count):
            if self.cancel.is_set():
                return
            yield self._chunk

    def synthesize(self, text: str) -> bytes:
        return b"".join(self.stream_phrase(text))
