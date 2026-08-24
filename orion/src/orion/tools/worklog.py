"""Capture to the worklog — the end-of-session habit, without opening an editor.

CLAUDE.md §4 calls the worklog entry "the single most important habit in this
workspace". These tools are append-only or create-new-file-only, so they run
freely: nothing here can destroy or rewrite history.
"""

from __future__ import annotations

import re
from datetime import date
from pathlib import Path

from ._shared import rel
from .registry import ToolError, ToolRegistry, tool

SLUG_RE = re.compile(r"[^a-z0-9]+")


def _slugify(text: str) -> str:
    return SLUG_RE.sub("-", text.lower()).strip("-")[:60]


def register(registry: ToolRegistry, config) -> None:
    workspace: Path = config.workspace
    worklog = workspace / "operations" / "worklog.md"
    learnings_dir = workspace / "knowledge" / "learnings"

    @tool(
        registry,
        description=(
            "Append a dated entry to the Service Pow worklog "
            "(operations/worklog.md) — what was done, what was decided, what's "
            "still open. Use at the end of a piece of work, or whenever Karl says "
            "to log something. Append-only: existing entries are never touched."
        ),
        param_docs={
            "summary": "One line: what this session or piece of work was.",
            "details": (
                "The entry body: what was done, decisions made, what's still open. "
                "Markdown bullets welcome."
            ),
        },
    )
    def append_worklog(summary: str, details: str) -> str:
        if not summary.strip():
            raise ToolError("The worklog entry needs a one-line summary.")
        if not worklog.is_file():
            raise ToolError(
                f"The worklog is missing at {rel(workspace, worklog)} — the workspace "
                "may not be checked out correctly."
            )
        today = date.today().isoformat()
        entry = f"\n## {today} — {summary.strip()}\n\n{details.strip()}\n"
        with worklog.open("a", encoding="utf-8") as fh:
            fh.write(entry)
        return f"Appended to operations/worklog.md under '{today} — {summary.strip()}'."

    @tool(
        registry,
        description=(
            "Record a learning in knowledge/learnings/ — one specific, falsifiable "
            "observation from real work ('carousels beat statics for this client in "
            "Q3', not 'video is good'). Creates a new dated file; never edits an "
            "existing one. Use when something happened that should change how the "
            "next campaign, build or pitch is run."
        ),
        param_docs={
            "title": "Short name for the learning, e.g. 'Short subject lines lift opens'.",
            "client": "Client slug it came from, or 'internal'. Anonymise before generalising.",
            "body": (
                "What happened, the evidence (with numbers and where they came from), "
                "and what to do differently next time."
            ),
            "tags": "Comma-separated topic tags, e.g. 'email, subject-lines'.",
        },
    )
    def write_learning(title: str, client: str, body: str, tags: str = "") -> str:
        if not title.strip() or not body.strip():
            raise ToolError("A learning needs both a title and a body.")
        today = date.today().isoformat()
        slug = _slugify(title)
        if not slug:
            raise ToolError("Couldn't make a filename out of that title — use plain words.")
        target = learnings_dir / f"{today}-{slug}.md"
        if target.exists():
            raise ToolError(
                f"{rel(workspace, target)} already exists. Learnings are immutable — "
                "pick a different title, or record this as a new observation."
            )
        tag_list = ", ".join(t.strip() for t in tags.split(",") if t.strip())
        content = (
            "---\n"
            f"title: {title.strip()}\n"
            "type: learning\n"
            f"client: {client.strip() or 'internal'}\n"
            "owner: Karl\n"
            "status: active\n"
            f"created: {today}\n"
            f"updated: {today}\n"
            f"tags: [{tag_list}]\n"
            "---\n\n"
            f"{body.strip()}\n"
        )
        learnings_dir.mkdir(parents=True, exist_ok=True)
        target.write_text(content, encoding="utf-8")
        return (
            f"Recorded {rel(workspace, target)}. If this shows up two more times, "
            "promote it into the relevant playbook."
        )
