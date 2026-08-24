"""Latency instrumentation, T0-T6.

Latency is the whole experience in voice. Every turn gets a breakdown so slow
stages are visible immediately instead of felt vaguely.

    T0  user stopped speaking (end of turn detected)
    T1  final transcript in hand
    T2  transcript handed to the agent
    T3  first token back from the model
    T4  first complete phrase sent to TTS
    T5  first audio bytes back from TTS
    T6  sound starts playing
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field

MARKS = ("t0_speech_end", "t1_transcript", "t2_agent_in", "t3_first_token",
         "t4_first_phrase", "t5_tts_first_byte", "t6_audio_start")


@dataclass
class TurnTimer:
    marks: dict = field(default_factory=dict)

    def mark(self, name: str) -> None:
        if name in MARKS and name not in self.marks:  # first occurrence wins
            self.marks[name] = time.monotonic()

    def _delta_ms(self, a: str, b: str) -> float | None:
        if a in self.marks and b in self.marks:
            return (self.marks[b] - self.marks[a]) * 1000
        return None

    def report(self) -> str:
        parts = []
        for label, a, b in (
            ("stt", "t0_speech_end", "t1_transcript"),
            ("agent first token", "t2_agent_in", "t3_first_token"),
            ("first phrase", "t3_first_token", "t4_first_phrase"),
            ("tts first byte", "t4_first_phrase", "t5_tts_first_byte"),
            ("playback start", "t5_tts_first_byte", "t6_audio_start"),
            ("TOTAL speech→speech", "t0_speech_end", "t6_audio_start"),
        ):
            delta = self._delta_ms(a, b)
            if delta is not None:
                parts.append(f"{label} {delta:.0f}ms")
        return "latency: " + " · ".join(parts) if parts else "latency: (incomplete turn)"
