"""The daily sweep for open loops going quiet.

Service Pow is one person with no second reviewer, so the real failure mode
isn't a missed metric — it's silence: a worklog that stops, an active client
with an empty brief, drafts that never became deliverables. Quiet by default;
only a blocking condition on the active account earns an interruption.
"""

from __future__ import annotations

import re
from datetime import date, datetime

# Entry headings only ("## 2026-08-25 — …"): a date mentioned inside an entry
# body ("launch scheduled for 2026-12-01") is not a journal entry, and a
# future one would silently suppress the gone-quiet check.
DATE_RE = re.compile(r"^##\s+(\d{4}-\d{2}-\d{2})", re.MULTILINE)
NEEDS_INPUT_RE = re.compile(r"NEEDS INPUT", re.IGNORECASE)
# A snapshot-table row whose value cell is blank: "| **Website** | |"
EMPTY_FIELD_RE = re.compile(r"^\|[^|]+\|\s*\|\s*$", re.MULTILINE)


def _last_worklog_date(worklog_text: str) -> date | None:
    today = date.today()
    dates = []
    for match in DATE_RE.finditer(worklog_text):
        try:
            parsed = date.fromisoformat(match.group(1))
        except ValueError:
            continue
        if parsed <= today:  # a future-dated heading can't mean "recently active"
            dates.append(parsed)
    return max(dates) if dates else None


def _brief_is_empty(brief_path) -> bool:
    if not brief_path.is_file():
        return True
    text = brief_path.read_text(encoding="utf-8", errors="replace")
    body = re.sub(r"^---.*?---", "", text, flags=re.DOTALL).strip()
    # Empty means "not safe to work from": either nearly no content, or the
    # structure is there but the substance is still placeholders and blanks.
    placeholders = len(NEEDS_INPUT_RE.findall(body)) + len(EMPTY_FIELD_RE.findall(body))
    return len(body) < 200 or placeholders >= 3


def run(config, board, settings) -> None:
    workspace = config.workspace
    worklog_gap_days = int(settings.get("worklog_gap_days", 3))
    stale_draft_days = int(settings.get("stale_draft_days", 7))
    active_clients = [
        s.strip() for s in str(settings.get("active_clients", "911drain")).split(",") if s.strip()
    ]

    # 1. Worklog gone quiet — the habit that holds the office together.
    worklog = workspace / "operations" / "worklog.md"
    if worklog.is_file():
        last = _last_worklog_date(worklog.read_text(encoding="utf-8", errors="replace"))
        if last is not None:
            gap = (date.today() - last).days
            if gap >= worklog_gap_days:
                board.post(
                    "open_loops", "notify",
                    f"No worklog entry for {gap} days (last: {last}). "
                    "Worth a one-line catch-up entry.",
                    dedupe_key="standing",
                )

    # 2. An active client with an empty brief blocks all client-facing work.
    for slug in active_clients:
        brief = workspace / "clients" / slug / "client-brief.md"
        if _brief_is_empty(brief):
            board.post(
                "open_loops", "interrupt",
                f"Active client '{slug}' still has an empty brief — no client-facing "
                "work for them is safe to produce until it's filled in.",
                dedupe_key="standing",
            )

    # 3. Drafts that stopped moving.
    stale: list[str] = []
    for path in workspace.rglob("*.md"):
        if any(part.startswith(".") for part in path.relative_to(workspace).parts):
            continue
        try:
            head = path.read_text(encoding="utf-8", errors="replace")[:400]
        except OSError:
            continue
        if "status: draft" not in head:
            continue
        age_days = (datetime.now() - datetime.fromtimestamp(path.stat().st_mtime)).days
        if age_days >= stale_draft_days:
            stale.append(f"{path.relative_to(workspace)} ({age_days}d)")
    if stale:
        listing = "; ".join(stale[:4]) + ("…" if len(stale) > 4 else "")
        board.post(
            "open_loops", "log",
            f"{len(stale)} draft(s) untouched for {stale_draft_days}+ days: {listing}",
            dedupe_key="standing",
        )
