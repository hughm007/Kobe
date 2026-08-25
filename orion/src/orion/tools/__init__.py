"""The hands — tools the agent can call.

Adding a capability means writing one self-contained tool module and importing
it in `default_registry()` below. The agent loop never changes.
"""

from .registry import Tool, ToolRegistry, tool  # noqa: F401


def default_registry(config) -> "ToolRegistry":
    """Every tool Orion ships with, registered against this config."""
    from . import creative, drafts, memory_tools, workspace, worklog

    registry = ToolRegistry()
    workspace.register(registry, config)
    drafts.register(registry, config)
    creative.register(registry, config)
    worklog.register(registry, config)
    memory_tools.register(registry, config)

    # Karl's always-ask list from orion.toml wins over what code declared:
    # adding a tool name there gates it with no code change.
    for name in getattr(config, "gate", None).always_confirm if getattr(config, "gate", None) else ():
        tool_obj = registry.get(name)
        if tool_obj is not None:
            tool_obj.consequential = True
    return registry
