"""Notices — what the heartbeat wants Karl to see.

The rule that keeps proactivity from failing silently: **catch-up-on-return,
never deliver-once-and-lose-it.** A notice raised while Karl's interface is
closed is *held* in state/notices.jsonl until he is back, then shown. Every
notice is dismissible; quiet ones accumulate in the log, and only
level="interrupt" items are pushed into his attention.
"""

from __future__ import annotations

import json
import secrets
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
    """The single place surfaced items land, shared by heartbeat and REPL."""

    def __init__(self, path: Path) -> None:
        self.path = path

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
        notices = self._load()
        for notice in notices:
            if ids is None or notice.id in ids:
                notice.seen = True
        self._write(notices)

    def dismiss(self, notice_id: str) -> bool:
        notices = self._load()
        hit = False
        for notice in notices:
            if notice.id == notice_id or notice_id == "all":
                notice.dismissed = True
                hit = True
        self._write(notices)
        return hit
