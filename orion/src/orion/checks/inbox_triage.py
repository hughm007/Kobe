"""Watch agent-workspace/inbox/ for untriaged drop-offs.

CLAUDE.md §5: the inbox is a front desk, not storage — anything in it is
supposed to be triaged out within a session. A file sitting there means work
is waiting, so this is the check that escalates: quiet at first sighting,
an interruption once it has been ignored past the configured age.
"""

from __future__ import annotations

import time


def run(config, board, settings) -> None:
    inbox = config.workspace / "inbox"
    if not inbox.is_dir():
        return
    escalate_hours = float(settings.get("escalate_after_hours", 4))

    waiting = [
        p for p in sorted(inbox.iterdir())
        if p.is_file() and p.name != "README.md" and not p.name.startswith(".")
    ]
    if not waiting:
        return

    oldest_age_hours = max((time.time() - p.stat().st_mtime) / 3600 for p in waiting)
    names = ", ".join(p.name for p in waiting[:5]) + ("…" if len(waiting) > 5 else "")
    level = "interrupt" if oldest_age_hours >= escalate_hours else "notify"
    board.post(
        "inbox_triage",
        level,
        f"{len(waiting)} untriaged file(s) in inbox/: {names}",
        dedupe_key="standing",
    )
