"""Microphone capture and speaker playback.

Both wrap `sounddevice` and both are import-guarded: the text path must never
break because a machine has no working audio stack. The Player is the barge-in
surface — `stop()` silences Orion mid-word by flushing the buffer.
"""

from __future__ import annotations

import queue
import threading
import time


class AudioError(RuntimeError):
    """An audio-device failure, phrased for a human."""


def _sounddevice():
    try:
        import sounddevice  # noqa: PLC0415 — imported lazily on purpose
        return sounddevice
    except ImportError as exc:
        raise AudioError(
            "Audio support isn't installed. Run `uv sync --extra voice` inside orion/."
        ) from exc
    except OSError as exc:  # PortAudio missing
        raise AudioError(
            f"The system audio library isn't available ({exc}). "
            "On macOS: `brew install portaudio`. On Debian/Ubuntu: `apt install libportaudio2`."
        ) from exc


class Microphone:
    """Continuous 16-bit mono capture. Chunks land in `chunks` as raw bytes."""

    def __init__(self, sample_rate: int, chunk_ms: int = 50) -> None:
        self.sample_rate = sample_rate
        self.chunk_frames = int(sample_rate * chunk_ms / 1000)
        self.chunks: "queue.Queue[bytes]" = queue.Queue(maxsize=512)
        self._stream = None

    def start(self) -> None:
        sd = _sounddevice()

        def _callback(indata, frames, time_info, status) -> None:
            try:
                self.chunks.put_nowait(bytes(indata))
            except queue.Full:
                pass  # drop rather than block the audio thread

        try:
            self._stream = sd.RawInputStream(
                samplerate=self.sample_rate,
                blocksize=self.chunk_frames,
                channels=1,
                dtype="int16",
                callback=_callback,
            )
            self._stream.start()
        except Exception as exc:  # noqa: BLE001
            raise AudioError(
                f"Couldn't open the microphone ({exc}). Is one connected, and does "
                "the terminal have microphone permission?"
            ) from exc

    def stop(self) -> None:
        if self._stream is not None:
            try:
                self._stream.stop()
                self._stream.close()
            finally:
                self._stream = None


class Player:
    """Streamed PCM playback with instant cancellation.

    `feed()` appends audio; a background OutputStream drains it. `stop()`
    flushes everything queued — that is what makes interruption feel instant.
    `is_playing` (with a short tail) is what the echo guard reads.
    """

    TAIL_SECONDS = 0.35  # how long after the buffer drains we still count as "speaking"

    def __init__(self, sample_rate: int) -> None:
        self.sample_rate = sample_rate
        self._buffer = bytearray()
        self._lock = threading.Lock()
        self._stream = None
        self._last_audible = 0.0
        self.on_first_audio = None  # optional callback for latency T6

    def start(self) -> None:
        sd = _sounddevice()

        def _callback(outdata, frames, time_info, status) -> None:
            needed = len(outdata)
            with self._lock:
                take = min(needed, len(self._buffer))
                if take:
                    outdata[:take] = bytes(self._buffer[:take])
                    del self._buffer[:take]
                    self._last_audible = time.monotonic()
                    if self.on_first_audio is not None:
                        callback, self.on_first_audio = self.on_first_audio, None
                        try:
                            callback()
                        except Exception:  # noqa: BLE001
                            pass
                if take < needed:
                    outdata[take:] = b"\x00" * (needed - take)

        try:
            self._stream = sd.RawOutputStream(
                samplerate=self.sample_rate, channels=1, dtype="int16", callback=_callback
            )
            self._stream.start()
        except Exception as exc:  # noqa: BLE001
            raise AudioError(
                f"Couldn't open the speakers ({exc}). Check the output device."
            ) from exc

    def feed(self, pcm: bytes) -> None:
        with self._lock:
            self._buffer.extend(pcm)

    def stop_playback(self) -> None:
        """Silence immediately: flush everything queued. The stream stays open."""
        with self._lock:
            self._buffer.clear()

    @property
    def is_playing(self) -> bool:
        with self._lock:
            if self._buffer:
                return True
            return (time.monotonic() - self._last_audible) < self.TAIL_SECONDS

    def close(self) -> None:
        if self._stream is not None:
            try:
                self._stream.stop()
                self._stream.close()
            finally:
                self._stream = None


class FakePlayer:
    """Playback for tests: records bytes, reports is_playing from a flag."""

    def __init__(self) -> None:
        self.fed: list[bytes] = []
        self.stopped_count = 0
        self.playing = False
        self.on_first_audio = None

    def start(self) -> None:
        pass

    def feed(self, pcm: bytes) -> None:
        self.fed.append(pcm)
        self.playing = True
        if self.on_first_audio is not None:
            callback, self.on_first_audio = self.on_first_audio, None
            callback()

    def stop_playback(self) -> None:
        self.stopped_count += 1
        self.playing = False

    @property
    def is_playing(self) -> bool:
        return self.playing

    def close(self) -> None:
        pass
