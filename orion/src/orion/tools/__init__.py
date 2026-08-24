"""The hands — tools the agent can call.

Adding a capability means writing one self-contained tool module and importing
it in `default_registry()` below. The agent loop never changes.
"""

from .registry import Tool, ToolRegistry, tool  # noqa: F401


def default_registry(config) -> "ToolRegistry":
    """Every tool Orion ships with, registered against this config."""
    from . import drafts, workspace, worklog

    registry = ToolRegistry()
    workspace.register(registry, config)
    drafts.register(registry, config)
    worklog.register(registry, config)
    return registry
