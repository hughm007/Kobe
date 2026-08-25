"""Notices — what the heartbeat wants Karl to see.

The rule that keeps proactivity from failing silently: **catch-up-on-return,
never deliver-once-and-lose-it.** A notice raised while Karl's interface is
closed is *held* in state/notices.jsonl until he is back, then shown. Every
notice is dismissible; quiet ones accumulate in the log, and only
level="interrupt" items are pushed into his attention.
"""

from __future__ import annotations

import contextlib
import json
import secrets
import threading
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path

LEVELS = ("log", "notify", "interrupt")  # calm ledger → worth a line → worth breaking in


@dataclass
class Notice:
    id: str
    check: str
    level: str
    text: str
    created: str
    seen: bool = False
    dismissed: bool = False

    @classmethod
    def new(cls, check: str, level: str, text: str) -> "Notice":
        if level not in LEVELS:
            level = "log"
        return cls(
            id=f"ntc_{secrets.token_hex(4)}",
            check=check,
            level=level,
            text=" ".join(text.split()),
            created=datetime.now().isoformat(timespec="seconds"),
        )


class NoticeBoard:
    """The single place surfaced items land, shared by heartbeat and REPL.

    Several threads (job workers, HUD handlers, the REPL) and even a second
    process (the heartbeat) mutate the same file with load-modify-rewrite, so
    every mutation runs under a per-path in-process lock plus an advisory file
    lock — otherwise two writers silently revert each other and a "held, never
    lost" notice gets lost.
    """

    _locks: dict[str, threading.Lock] = {}
    _locks_guard = threading.Lock()

    def __init__(self, path: Path) -> None:
        self.path = path
        key = str(path.resolve()) if path.exists() else str(path)
        with NoticeBoard._locks_guard:
            self._lock = NoticeBoard._locks.setdefault(key, threading.Lock())

    @contextlib.contextmanager
    def _exclusive(self):
        """In-process lock + cross-process advisory flock for one mutation."""
        with self._lock:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            lock_path = self.path.with_suffix(".lock")
            handle = open(lock_path, "a+")
            try:
                try:
                    import fcntl

                    fcntl.flock(handle, fcntl.LOCK_EX)
                except (ImportError, OSError):
                    pass  # no flock here — the in-process lock still holds
                yield
            finally:
                handle.close()  # closing releases any flock

    def _load(self) -> list[Notice]:
        if not self.path.is_file():
            return []
        notices = []
        for line in self.path.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            try:
                data = json.loads(line)
                known = {f for f in Notice.__dataclass_fields__}
                notices.append(Notice(**{k: v for k, v in data.items() if k in known}))
            except (json.JSONDecodeError, TypeError):
                continue
        return notices

    def _write(self, notices: list[Notice]) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(
            "\n".join(json.dumps(asdict(n), ensure_ascii=False) for n in notices)
            + ("\n" if notices else ""),
            encoding="utf-8",
        )

    # ------------------------------------------------------------------ api

    def post(self, check: str, level: str, text: str, *, dedupe_key: str | None = None) -> Notice | None:
        """Add a notice. With dedupe_key, an open notice from the same check
        with the same text is not repeated — a standing condition surfaces
        once, not every tick."""
        with self._exclusive():
            notices = self._load()
            if dedupe_key is not None:
                for existing in notices:
                    if (
                        existing.check == check
                        and not existing.dismissed
                        and existing.text == text
                    ):
                        return None
            notice = Notice.new(check, level, text)
            notices.append(notice)
            self._write(notices)
            return notice

    def pending(self) -> list[Notice]:
        """Everything not yet dismissed — held for Karl however long he was away."""
        return [n for n in self._load() if not n.dismissed]

    def unseen(self) -> list[Notice]:
        return [n for n in self._load() if not n.seen and not n.dismissed]

    def mark_seen(self, ids: list[str] | None = None) -> None:
        with self._exclusive():
            notices = self._load()
            for notice in notices:
                if ids is None or notice.id in ids:
                    notice.seen = True
            self._write(notices)

    def dismiss(self, notice_id: str) -> bool:
        with self._exclusive():
            notices = self._load()
            hit = False
            for notice in notices:
                if notice.id == notice_id or notice_id == "all":
                    notice.dismissed = True
                    hit = True
            self._write(notices)
            return hit
