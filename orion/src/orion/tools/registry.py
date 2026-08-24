"""The tool registry.

Each tool is a name, a description written for a reader (the model picks tools
by reading these — "Search Service Pow's workspace for..." beats "search()"),
a strict typed schema, and a Python function. The whole registry is handed to
the model every turn; when the model asks for a tool by name, `dispatch` runs
it and returns the result — or the failure, in plain language, for the model to
reason about. A failed tool is a feature, never a crash.

Every tool declares whether it is *consequential*. Read-only lookups run
freely; anything that sends, spends, deletes or overwrites must pass the
confirmation gate (Tier 6) before it runs.
"""

from __future__ import annotations

import inspect
import typing
from dataclasses import dataclass, field
from typing import Any, Callable, get_args, get_origin

_PY_TO_JSON = {str: "string", int: "integer", float: "number", bool: "boolean"}


class ToolError(RuntimeError):
    """A tool failed in a way the model should hear about, in plain language.

    Raise this inside a tool with a message written for a reader. Anything
    else that escapes a tool is caught and wrapped too — the loop never dies
    because a tool did.
    """


@dataclass
class ToolResult:
    """What a tool run produced, ready to feed back to the model."""

    content: str
    is_error: bool = False


@dataclass
class Tool:
    name: str
    description: str
    func: Callable[..., str]
    input_schema: dict[str, Any]
    consequential: bool = False
    # Some tools are consequential only sometimes — write_draft gates on
    # overwrite but a new file writes freely. Set a predicate over the
    # arguments for that; `consequential=True` gates every call.
    consequential_when: Callable[[dict[str, Any]], bool] | None = None
    # One line shown to Karl when this tool asks for confirmation, e.g.
    # "overwrite {path}". Formatted with the tool's arguments.
    describe_action: str = ""

    def to_api(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "input_schema": self.input_schema,
            # Strict: the model's arguments must validate exactly. No freeform
            # blobs to guess at, and typos in argument names fail fast.
            "strict": True,
        }

    def is_consequential(self, arguments: dict[str, Any]) -> bool:
        if self.consequential:
            return True
        if self.consequential_when is not None:
            try:
                return bool(self.consequential_when(arguments))
            except Exception:  # noqa: BLE001 — when in doubt, gate it
                return True
        return False

    def action_summary(self, arguments: dict[str, Any]) -> str:
        template = self.describe_action or f"run {self.name}"
        try:
            return template.format(**arguments)
        except (KeyError, IndexError):
            return f"{template} ({arguments})"


def _annotation_to_schema(annotation: Any) -> dict[str, Any]:
    if annotation in _PY_TO_JSON:
        return {"type": _PY_TO_JSON[annotation]}
    origin = get_origin(annotation)
    if origin is typing.Literal:
        values = list(get_args(annotation))
        return {"type": "string", "enum": values}
    if origin in (list, typing.List):
        (item_type,) = get_args(annotation) or (str,)
        return {"type": "array", "items": _annotation_to_schema(item_type)}
    raise TypeError(
        f"Tool parameters must be str, int, float, bool, Literal or list — got {annotation!r}. "
        "Keep tool inputs explicit and simple."
    )


def _build_schema(func: Callable[..., str], param_docs: dict[str, str]) -> dict[str, Any]:
    signature = inspect.signature(func)
    hints = typing.get_type_hints(func)
    properties: dict[str, Any] = {}
    required: list[str] = []

    for name, param in signature.parameters.items():
        schema = _annotation_to_schema(hints.get(name, str))
        if name in param_docs:
            schema["description"] = param_docs[name]
        if param.default is inspect.Parameter.empty:
            required.append(name)
        else:
            schema["default"] = param.default
        properties[name] = schema

    return {
        "type": "object",
        "properties": properties,
        "required": required,
        "additionalProperties": False,
    }


class ToolRegistry:
    def __init__(self) -> None:
        self._tools: dict[str, Tool] = {}

    def add(self, tool_obj: Tool) -> None:
        if tool_obj.name in self._tools:
            raise ValueError(f"A tool named {tool_obj.name!r} is already registered.")
        self._tools[tool_obj.name] = tool_obj

    def get(self, name: str) -> Tool | None:
        return self._tools.get(name)

    def names(self) -> list[str]:
        return list(self._tools)

    def to_api(self) -> list[dict[str, Any]]:
        return [t.to_api() for t in self._tools.values()]

    def __len__(self) -> int:
        return len(self._tools)

    def dispatch(self, name: str, arguments: dict[str, Any]) -> ToolResult:
        """Run a tool by name. Failures come back as results, never exceptions.

        The model reasoning over a failed tool result is a feature: it can
        recover, retry differently, or explain the problem to Karl.
        """
        tool_obj = self._tools.get(name)
        if tool_obj is None:
            return ToolResult(
                f"There is no tool called {name!r}. Available: {', '.join(self._tools)}.",
                is_error=True,
            )
        try:
            return ToolResult(str(tool_obj.func(**arguments)))
        except ToolError as exc:
            return ToolResult(str(exc), is_error=True)
        except TypeError as exc:
            return ToolResult(
                f"Bad arguments for {name}: {exc}", is_error=True
            )
        except Exception as exc:  # noqa: BLE001 — the loop must survive any tool
            return ToolResult(
                f"{name} failed unexpectedly: {type(exc).__name__}: {exc}", is_error=True
            )


def tool(
    registry: ToolRegistry,
    *,
    description: str,
    consequential: bool = False,
    describe_action: str = "",
    param_docs: dict[str, str] | None = None,
    name: str | None = None,
):
    """Register a function as a tool. The schema is derived from its signature."""

    def decorate(func: Callable[..., str]) -> Callable[..., str]:
        registry.add(
            Tool(
                name=name or func.__name__,
                description=description,
                func=func,
                input_schema=_build_schema(func, param_docs or {}),
                consequential=consequential,
                describe_action=describe_action,
            )
        )
        return func

    return decorate
