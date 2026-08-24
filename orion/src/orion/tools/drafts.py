"""Draft copy and messages — the writing capability.

Drafting is always fine; dispatching is not (AGENT.md §3, CLAUDE.md §10).
This tool writes drafts into the workspace with the required frontmatter.
Creating a new file runs freely. Overwriting an existing one is consequential
and stops at the confirmation gate — that's Karl's "never delete or overwrite
without asking" rule with teeth.
"""

from __future__ import annotations

from datetime import date
from pathlib import Path

from ._shared import rel, resolve_inside
from .registry import ToolError, ToolRegistry, tool

# Where drafts are allowed to land. Deliberately narrow: Orion drafts
# deliverables and notes; it does not rewrite playbooks or the constitution
# from a tool call.
ALLOWED_ROOTS = ("clients", "inbox", "knowledge/research")


def register(registry: ToolRegistry, config) -> None:
    workspace: Path = config.workspace

    def _frontmatter(title: str, doc_type: str, client: str, status: str) -> str:
        today = date.today().isoformat()
        return (
            "---\n"
            f"title: {title}\n"
            f"type: {doc_type}\n"
            f"client: {client}\n"
            "owner: Karl\n"
            f"status: {status}\n"
            f"created: {today}\n"
            f"updated: {today}\n"
            "---\n\n"
        )

    @tool(
        registry,
        description=(
            "Write a draft into the workspace — a client email, ad copy, a proposal, "
            "a content piece, research notes. Adds the standard frontmatter block "
            "automatically. Drafts land under clients/<slug>/deliverables/ (or "
            "clients/<slug>/notes/, inbox/, knowledge/research/). Writing a NEW file "
            "is always fine; OVERWRITING an existing file needs Karl's confirmation. "
            "Read the client's brand-guide.md before drafting anything in their voice."
        ),
        consequential=False,  # made consequential per-call: only overwrite gates
        describe_action="write draft {path}",
        param_docs={
            "path": (
                "Where the draft goes, relative to the workspace, kebab-case, .md — "
                "e.g. 'clients/911drain/deliverables/2026-08-24-launch-email.md'."
            ),
            "title": "Human title for the frontmatter, e.g. 'Launch announcement email'.",
            "doc_type": "Frontmatter type: brief, report, research, or draft copy under 'brief'.",
            "client": "Client slug this belongs to, or 'internal'.",
            "body": "The full markdown body of the draft, without frontmatter.",
        },
    )
    def write_draft(path: str, title: str, doc_type: str, client: str, body: str) -> str:
        target = resolve_inside(workspace, path)
        relative = rel(workspace, target)

        if not relative.endswith(".md"):
            raise ToolError("Drafts are markdown — the path must end in .md.")
        if not any(relative == r or relative.startswith(r + "/") for r in ALLOWED_ROOTS):
            raise ToolError(
                f"Drafts can't be written to '{relative}'. Allowed locations: "
                + ", ".join(f"{r}/" for r in ALLOWED_ROOTS)
                + ". Playbooks, company files and CLAUDE.md are edited by Karl, not by a tool."
            )
        if not body.strip():
            raise ToolError("The draft body is empty. Write the content first.")

        existed = target.is_file()
        target.parent.mkdir(parents=True, exist_ok=True)
        content = _frontmatter(title.strip(), doc_type.strip() or "brief", client.strip() or "internal", "draft") + body.strip() + "\n"
        target.write_text(content, encoding="utf-8")

        verb = "Overwrote" if existed else "Wrote"
        return (
            f"{verb} {relative} ({len(content):,} chars, status: draft). "
            "It stays a draft until Karl reviews it — nothing goes out without approval."
        )

    def _would_overwrite(arguments: dict) -> bool:
        try:
            return resolve_inside(workspace, str(arguments.get("path", ""))).is_file()
        except Exception:  # noqa: BLE001 — a path we can't judge gets gated
            return True

    # Overwrite is the consequential edge of write_draft: a new file writes
    # freely, clobbering an existing one stops at the confirmation gate.
    write_draft_tool = registry.get("write_draft")
    write_draft_tool.consequential_when = _would_overwrite
    write_draft_tool.describe_action = "OVERWRITE the existing file {path}"
