"""Switching the brain — by voice or text, whenever Karl sees fit.

Changing the model is changing a setting, which is on Karl's never-without-
asking list, so `set_model` is consequential: the two-step gate speaks first.
The choice persists in state/model-override.json (plain JSON — delete it to
return to orion.toml's defaults).
"""

from __future__ import annotations

from ..provider import EFFORT_LEVELS, MODEL_ALIASES, MODEL_CATALOG
from .registry import ToolError, ToolRegistry, tool


def register(registry: ToolRegistry, config, provider) -> None:
    @tool(
        registry,
        description=(
            "Switch which Claude model powers Orion, and at what effort, starting "
            "with the very next reply. Models (cheapest to most capable): haiku, "
            "sonnet, opus, fable — full ids also accepted. Effort: low, medium, "
            "high, xhigh, max (higher = deeper thinking, slower and costlier "
            "replies). Use when Karl asks for a different model or more/less "
            "thinking. The choice persists across restarts."
        ),
        consequential=True,
        describe_action="switch the brain to {model} at {effort} effort",
        param_docs={
            "model": "Which model: fable, opus, sonnet, haiku, or a full claude-… id.",
            "effort": "Thinking depth: low, medium, high, xhigh, or max.",
        },
    )
    def set_model(model: str, effort: str) -> str:
        if not callable(getattr(provider, "set_model", None)):
            raise ToolError("This provider can't switch models (fake provider in tests).")
        try:
            active_model, active_effort = provider.set_model(model, effort)
        except ValueError as exc:
            raise ToolError(str(exc)) from exc
        price_in, price_out = MODEL_CATALOG.get(active_model, (0, 0))
        return (
            f"Brain switched: {active_model} at {active_effort} effort, effective "
            f"immediately and kept across restarts (${price_in:.0f}/${price_out:.0f} "
            "per million tokens in/out). Delete state/model-override.json to return "
            "to the orion.toml defaults."
        )

    @tool(
        registry,
        description=(
            "Which model and effort Orion is running on right now, with its "
            "pricing, plus the available alternatives."
        ),
    )
    def current_model() -> str:
        active = getattr(provider, "active_model", config.model.name)
        effort = getattr(provider, "active_effort", config.model.effort)
        price_in, price_out = MODEL_CATALOG.get(
            active, (config.model.price_input_per_mtok, config.model.price_output_per_mtok)
        )
        aliases = ", ".join(f"{k}→{v}" for k, v in sorted(MODEL_ALIASES.items()))
        return (
            f"Active: {active} at {effort} effort "
            f"(${price_in:.0f}/${price_out:.0f} per MTok in/out).\n"
            f"Shortcuts: {aliases}. Efforts: {', '.join(EFFORT_LEVELS)}."
        )
