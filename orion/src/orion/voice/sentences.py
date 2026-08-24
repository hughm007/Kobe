"""Sentence buffering for streamed speech.

The brain streams text token by token; ElevenLabs wants natural phrases. This
accumulates deltas and releases a phrase as soon as one is complete, so Orion
starts speaking while the rest of the reply is still being written.
"""

from __future__ import annotations

import re

# A phrase boundary: sentence punctuation followed by whitespace, or a newline.
_BOUNDARY = re.compile(r"(?<=[.!?])[\"')\]]*\s+|\n+")
# Don't split right after e.g. "1." or "Dr." — cheap guards for common cases.
_BAD_TAIL = re.compile(r"(?:\b(?:mr|mrs|ms|dr|st|vs|etc|e\.g|i\.e)|\b\d)\.$", re.IGNORECASE)

MIN_PHRASE_CHARS = 12  # don't ship "Yes." alone if more is milliseconds away
MAX_BUFFER_CHARS = 400  # ...but never sit on a huge unpunctuated run


class SentenceBuffer:
    def __init__(self) -> None:
        self._buffer = ""

    def feed(self, delta: str) -> list[str]:
        """Add a streamed delta; return any phrases now ready to speak."""
        self._buffer += delta
        ready: list[str] = []
        while True:
            cut = self._find_break()
            if cut is None:
                break
            ready.append(self._buffer[:cut].strip())
            self._buffer = self._buffer[cut:]
        return [r for r in ready if r]

    def _find_break(self) -> int | None:
        """The end index of the next speakable phrase, or None to keep waiting.

        Scans boundaries in order, skipping ones that fall after an
        abbreviation ("e.g.", "1.") or would ship a fragment too short to be
        worth a synthesis round-trip — those merge into the next sentence.
        """
        pos = 0
        while True:
            match = _BOUNDARY.search(self._buffer, pos)
            if match is None:
                if len(self._buffer) >= MAX_BUFFER_CHARS:
                    return len(self._buffer)  # unpunctuated run — ship it anyway
                return None
            head = self._buffer[: match.start()].rstrip()
            if _BAD_TAIL.search(head) or len(head.strip()) < MIN_PHRASE_CHARS:
                pos = match.end()
                continue
            return match.end()

    def flush(self) -> str | None:
        """The stream ended; return whatever is left."""
        tail = self._buffer.strip()
        self._buffer = ""
        return tail or None
