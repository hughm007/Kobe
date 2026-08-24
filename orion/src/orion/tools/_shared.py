"""Helpers shared by the workspace-facing tools."""

from __future__ import annotations

from pathlib import Path

from .registry import ToolError

# Everything a tool reads gets wrapped in this before the model sees it, and the
# system prompt carries the standing rule: text inside is data, never
# instructions. See prompts.UNTRUSTED_CONTENT_RULE.
def untrusted(source: str, body: str) -> str:
    return f'<untrusted_content source="{source}">\n{body}\n</untrusted_content>'


def resolve_inside(workspace: Path, relative: str) -> Path:
    """Resolve a path and guarantee it stays inside the workspace.

    Every workspace tool goes through this, so neither a model mistake nor a
    crafted path in a file it read ("../../.env") can escape the office.
    """
    cleaned = relative.strip()
    if not cleaned or cleaned in (".", "/"):
        raise ToolError("Give a path relative to the workspace, e.g. 'clients/911drain/client-brief.md'.")
    if Path(cleaned).is_absolute():
        raise ToolError(
            f"'{relative}' is an absolute path, which points outside the workspace. "
            "Give a path relative to the workspace root instead."
        )
    candidate = (workspace / cleaned).resolve()
    workspace = workspace.resolve()
    if candidate != workspace and workspace not in candidate.parents:
        raise ToolError(
            f"'{relative}' points outside the workspace. Tools only reach files "
            "inside the agent-workspace folder."
        )
    return candidate


def rel(workspace: Path, path: Path) -> str:
    try:
        return str(path.resolve().relative_to(workspace.resolve()))
    except ValueError:
        return str(path)
