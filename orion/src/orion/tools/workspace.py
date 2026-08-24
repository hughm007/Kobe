"""Answer from the workspace — the read-only capability.

Search and read the Service Pow office so Orion answers from what is actually
written down, not from what it imagines. Read-only and path-confined, so these
run freely with no confirmation.
"""

from __future__ import annotations

import re
from pathlib import Path

from ._shared import rel, resolve_inside, untrusted
from .registry import ToolError, ToolRegistry, tool

MAX_RESULTS = 30
MAX_FILE_CHARS = 24_000
SNIPPET_CHARS = 160


def _iter_markdown(workspace: Path):
    for path in sorted(workspace.rglob("*.md")):
        if any(part.startswith(".") for part in path.relative_to(workspace).parts):
            continue
        yield path


def register(registry: ToolRegistry, config) -> None:
    workspace: Path = config.workspace

    @tool(
        registry,
        description=(
            "Search Service Pow's workspace — client briefs, playbooks, brand voice, "
            "pricing, decisions, learnings, the worklog. Case-insensitive match on "
            "file paths and file contents. Use this first whenever a question is "
            "about Service Pow, a client, or how the work is done; then read the "
            "promising files in full with read_workspace_file."
        ),
        param_docs={
            "query": "Words to look for, e.g. '911 drain brief' or 'brand voice'.",
            "folder": "Optional: confine the search to one folder, e.g. 'clients' or 'playbooks'.",
        },
    )
    def search_workspace(query: str, folder: str = "") -> str:
        terms = [t for t in re.split(r"\s+", query.strip().lower()) if t]
        if not terms:
            raise ToolError("Give me at least one word to search for.")

        root = resolve_inside(workspace, folder) if folder.strip() else workspace
        if not root.exists():
            raise ToolError(f"There is no folder called '{folder}' in the workspace.")

        hits: list[str] = []
        for path in _iter_markdown(root):
            relative = rel(workspace, path)
            try:
                text = path.read_text(encoding="utf-8", errors="replace")
            except OSError:
                continue
            lower = text.lower()
            path_hit = all(t in relative.lower() for t in terms)
            content_hit = all(t in lower for t in terms)
            if not (path_hit or content_hit):
                continue

            snippet = ""
            if content_hit:
                idx = min((lower.find(t) for t in terms if t in lower), default=0)
                start = max(0, idx - 40)
                snippet = " — …" + " ".join(
                    text[start : start + SNIPPET_CHARS].split()
                ) + "…"
            hits.append(f"{relative}{snippet}")
            if len(hits) >= MAX_RESULTS:
                hits.append(f"(stopped at {MAX_RESULTS} results — narrow the query)")
                break

        if not hits:
            return (
                f"Nothing in the workspace matches {query!r}. Either it isn't written "
                "down, or different words were used — try fewer or broader terms."
            )
        return untrusted("workspace search", "\n".join(hits))

    @tool(
        registry,
        description=(
            "Read one file from Service Pow's workspace, in full. Use after "
            "search_workspace, or when you already know the path — e.g. "
            "'clients/911drain/client-brief.md' or 'operations/worklog.md'."
        ),
        param_docs={"path": "Path relative to the workspace root."},
    )
    def read_workspace_file(path: str) -> str:
        target = resolve_inside(workspace, path)
        if target.is_dir():
            entries = sorted(p.name + ("/" if p.is_dir() else "") for p in target.iterdir())
            listing = "\n".join(entries) or "(empty folder)"
            return untrusted(f"folder listing: {path}", listing)
        if not target.is_file():
            raise ToolError(
                f"There is no file at '{path}'. Use search_workspace to find the "
                "right path — don't guess filenames."
            )
        text = target.read_text(encoding="utf-8", errors="replace")
        if len(text) > MAX_FILE_CHARS:
            text = text[:MAX_FILE_CHARS] + f"\n\n[truncated — file is {len(text):,} chars]"
        return untrusted(f"file: {rel(workspace, target)}", text)
