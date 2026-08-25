"""The switchable brain: aliases, persistence, pricing, and the gate."""

import json

import pytest

from orion.agent import Agent
from orion.provider import (
    EFFORT_LEVELS, MODEL_CATALOG, FakeProvider, TurnResult, Usage,
    load_model_override, resolve_effort, resolve_model, save_model_override,
    text_response,
)
from orion.tools import default_registry
from orion.tools.model_tools import register as register_model_tools


# ----------------------------------------------------------------- resolving

def test_aliases_and_full_ids_resolve():
    assert resolve_model("fable") == "claude-fable-5"
    assert resolve_model("OPUS") == "claude-opus-5"
    assert resolve_model("claude-haiku-4-5") == "claude-haiku-4-5"
    for bad in ("gpt5", "", "claude-9"):
        with pytest.raises(ValueError):
            resolve_model(bad)


def test_the_way_karl_actually_says_it_resolves():
    """Voice transcripts say 'fable 5', 'fable five', 'claude fable 5' —
    every natural form must reach the same model."""
    for spoken in ("fable 5", "Fable 5", "claude fable 5", "fable five", "fable-5"):
        assert resolve_model(spoken) == "claude-fable-5", spoken
    assert resolve_model("opus 5") == "claude-opus-5"
    assert resolve_model("haiku 4.5") == "claude-haiku-4-5"
    assert resolve_model("haiku four point five") == "claude-haiku-4-5"
    assert resolve_model("opus 4.8") == "claude-opus-4-8"
    assert resolve_effort("effort medium") == "medium"
    assert resolve_effort("extra high") == "xhigh"
    assert resolve_effort("maximum") == "max"


def test_efforts_resolve_and_reject():
    assert resolve_effort("HIGH") == "high"
    for level in EFFORT_LEVELS:
        assert resolve_effort(level) == level
    with pytest.raises(ValueError):
        resolve_effort("maximum overdrive")


# --------------------------------------------------------------- persistence

def test_the_choice_survives_a_restart_and_is_deletable(config):
    assert load_model_override(config) == ("claude-opus-5", "medium")  # toml defaults
    save_model_override(config, "claude-fable-5", "high")
    assert load_model_override(config) == ("claude-fable-5", "high")
    # Karl deletes the file → back to orion.toml.
    config.state_path("model-override.json").unlink()
    assert load_model_override(config) == ("claude-opus-5", "medium")


def test_a_mangled_override_falls_back_instead_of_crashing(config):
    config.state_path("model-override.json").write_text("{not json", encoding="utf-8")
    assert load_model_override(config) == ("claude-opus-5", "medium")
    config.state_path("model-override.json").write_text(
        json.dumps({"model": "gpt5", "effort": "silly"}), encoding="utf-8"
    )
    assert load_model_override(config) == ("claude-opus-5", "medium")


# ------------------------------------------------- the real provider's kwargs

def test_requests_carry_the_switched_model_and_effort(config, monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-test")
    from orion.provider import AnthropicProvider

    provider = AnthropicProvider(config)
    assert provider.active_model == "claude-opus-5"
    provider.set_model("fable", "high")
    kwargs = provider._request_kwargs(system="s", messages=[], tools=None)
    assert kwargs["model"] == "claude-fable-5"
    assert kwargs["output_config"] == {"effort": "high"}
    assert kwargs["thinking"] == {"type": "adaptive"}  # Fable 5 compatible
    assert provider.prices() == (10.0, 50.0)
    # Persisted for the next start.
    assert load_model_override(config) == ("claude-fable-5", "high")


# ------------------------------------------------------------------- pricing

def test_cost_tally_follows_the_active_model(config):
    provider = FakeProvider([
        TurnResult(content=[{"type": "text", "text": "a"}],
                   usage=Usage(input_tokens=1_000_000, output_tokens=0), model="fake"),
        TurnResult(content=[{"type": "text", "text": "b"}],
                   usage=Usage(input_tokens=1_000_000, output_tokens=0), model="fake"),
    ])
    agent = Agent(config, provider)
    provider.set_model("opus")
    agent.run_turn("one")           # 1M in at $5
    provider.set_model("fable")
    agent.run_turn("two")           # 1M in at $10
    assert agent.cost_usd == pytest.approx(15.0)


def test_lifetime_cost_prefers_recorded_per_turn_cost(config):
    from orion.audit import AuditLog

    audit = AuditLog(config.state_path("audit.jsonl"))
    audit.log("turn.end", {"input_tokens": 1_000_000, "output_tokens": 0, "cost_usd": 10.0})
    audit.log("turn.end", {"input_tokens": 1_000_000, "output_tokens": 0})  # legacy entry
    tokens_in, _, cost = audit.lifetime_cost(5.0, 25.0)
    assert tokens_in == 2_000_000
    assert cost == pytest.approx(10.0 + 5.0)


# ------------------------------------------------------------------ the gate

def test_switching_by_voice_is_gated_and_works_when_confirmed(config):
    registry = default_registry(config)
    provider = FakeProvider([text_response("Switched.")])
    register_model_tools(registry, config, provider)

    switch = registry.get("set_model")
    assert switch.consequential, "changing a setting is on the never-list"
    assert "fable" in switch.action_summary({"model": "fable", "effort": "high"})

    result = registry.dispatch("set_model", {"model": "fable", "effort": "high"})
    assert not result.is_error
    assert provider.active_model == "claude-fable-5"
    assert provider.active_effort == "high"
    assert "$10/$50" in result.content

    bad = registry.dispatch("set_model", {"model": "gpt5", "effort": "high"})
    assert bad.is_error

    status = registry.dispatch("current_model", {}).content
    assert "claude-fable-5" in status and "high" in status
