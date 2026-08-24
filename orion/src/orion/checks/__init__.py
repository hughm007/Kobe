"""Scheduled checks. Each module exposes run(config, board, settings)."""

from . import inbox_triage, open_loops

AVAILABLE = {
    "inbox_triage": inbox_triage.run,
    "open_loops": open_loops.run,
}
