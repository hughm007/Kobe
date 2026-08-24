"""Tier 2 — the hands: tools the agent chooses, runs, and reasons over."""

import shutil
from pathlib import Path

import pytest

from orion.agent import DECLINED_MESSAGE, UNATTENDED_MESSAGE, Agent
from orion.provider import FakeProvider, text_response, tool_response
from orion.tools import default_registry
from orion.tools.registry import ToolRegistry, ToolResult, tool

REPO = Path(__file__).resolve().parents[2]


@pytest.fixture
def sandbox(config, tmp_path):
    """A disposable copy of the real workspace, so write tools can run for real."""
    ws = tmp_path / "agent-workspace"
    shutil.copytree(config.workspace, ws)
    object.__setattr__(config, "workspace", ws)
    return config


@pytest.fixture
def registry(sandbox):
    return default_registry(sandbox)


# ------------------------------------------------------------------ registry

def test_schemas_are_strict_and_typed(registry):
    for spec in registry.to_api():
        assert spec["strict"] is True
        assert spec["input_schema"]["additionalProperties"] is False
        assert "required" in spec["input_schema"]
        assert spec["description"], f"{spec['name']} has no description for the model to read"


def test_unknown_tool_is_an_answer_not_a_crash(registry):
    result = registry.dispatch("launch_missiles", {})
    assert result.is_error
    assert "no tool called" in result.content


def test_a_failing_tool_returns_plain_language_to_the_model(registry):
    result = registry.dispatch("read_workspace_file", {"path": "does/not/exist.md"})
    assert result.is_error
    assert "no file at" in result.content
    assert "Traceback" not in result.content


def test_an_unexpected_exception_is_contained(sandbox):
    registry = ToolRegistry()

    @tool(registry, description="Always explodes.")
    def broken() -> str:
        raise ValueError("boom")

    result = registry.dispatch("broken", {})
    assert result.is_error
    assert "boom" in result.content


# ------------------------------------------------------------ workspace read

def test_search_finds_the_client_brief(registry):
    result = registry.dispatch("search_workspace", {"query": "911drain"})
    assert not result.is_error
    assert "clients/911drain/client-brief.md" in result.content


def test_read_wraps_content_as_untrusted_data(registry):
    result = registry.dispatch("read_workspace_file", {"path": "CLAUDE.md"})
    assert not result.is_error
    assert result.content.startswith("<untrusted_content")
    assert "Service Pow" in result.content


def test_paths_cannot_escape_the_workspace(registry):
    for sneaky in ("../AGENT.md", "clients/../../orion/orion.toml", "/etc/hosts"):
        result = registry.dispatch("read_workspace_file", {"path": sneaky})
        assert result.is_error, sneaky
        assert "outside the workspace" in result.content


def test_search_miss_is_honest(registry):
    result = registry.dispatch("search_workspace", {"query": "zanzibar quantum yak"})
    assert not result.is_error
    assert "Nothing in the workspace matches" in result.content


# ------------------------------------------------------------------ drafting

def test_new_draft_gets_frontmatter_and_lands_in_deliverables(sandbox, registry):
    result = registry.dispatch(
        "write_draft",
        {
            "path": "clients/911drain/deliverables/2026-08-24-test-email.md",
            "title": "Test email",
            "doc_type": "brief",
            "client": "911drain",
            "body": "Hello.",
        },
    )
    assert not result.is_error, result.content
    written = (sandbox.workspace / "clients/911drain/deliverables/2026-08-24-test-email.md").read_text()
    assert written.startswith("---\n")
    assert "status: draft" in written
    assert "Hello." in written


def test_drafts_cannot_touch_playbooks_or_the_constitution(registry):
    for path in ("playbooks/web/website-build.md", "CLAUDE.md", "company/services.md"):
        result = registry.dispatch(
            "write_draft",
            {"path": path, "title": "x", "doc_type": "brief", "client": "internal", "body": "x"},
        )
        assert result.is_error, path


def test_overwrite_is_consequential_but_new_file_is_not(sandbox, registry):
    write_draft = registry.get("write_draft")
    fresh = {"path": "clients/911drain/deliverables/new-file.md"}
    existing = {"path": "clients/911drain/client-brief.md"}
    assert write_draft.is_consequential(fresh) is False
    assert write_draft.is_consequential(existing) is True


# ------------------------------------------------------------------- worklog

def test_worklog_append_only_adds_a_dated_entry(sandbox, registry):
    before = (sandbox.workspace / "operations/worklog.md").read_text()
    result = registry.dispatch(
        "append_worklog", {"summary": "Test entry", "details": "- did a thing"}
    )
    assert not result.is_error
    after = (sandbox.workspace / "operations/worklog.md").read_text()
    assert after.startswith(before), "existing worklog content must be untouched"
    assert "Test entry" in after


def test_learning_is_a_new_file_and_never_overwrites(sandbox, registry):
    args = {"title": "Carousels beat statics", "client": "internal", "body": "Evidence here.", "tags": "ads"}
    first = registry.dispatch("write_learning", args)
    assert not first.is_error
    second = registry.dispatch("write_learning", args)
    assert second.is_error
    assert "already exists" in second.content


# ------------------------------------------------------------ the agent loop

def test_agent_chains_tools_then_answers(sandbox):
    registry = default_registry(sandbox)
    provider = FakeProvider(
        [
            tool_response("search_workspace", {"query": "911drain brief"}),
            tool_response(
                "read_workspace_file",
                {"path": "clients/911drain/client-brief.md"},
                tool_use_id="toolu_2",
            ),
            text_response("Conclusion: the brief is empty. Fill it before client work."),
        ]
    )
    agent = Agent(sandbox, provider, tools=registry)
    reply = agent.run_turn("What do we know about 911 Drain?")

    assert "Conclusion" in reply
    assert len(provider.calls) == 3
    # The tool result travelled back to the model, wrapped as untrusted data.
    fed_back = provider.calls[1]["messages"][-1]["content"][0]
    assert fed_back["type"] == "tool_result"
    assert "<untrusted_content" in fed_back["content"]


def test_tool_failure_reaches_the_model_as_is_error(sandbox):
    provider = FakeProvider(
        [
            tool_response("read_workspace_file", {"path": "nope/missing.md"}),
            text_response("That file doesn't exist — want me to search instead?"),
        ]
    )
    agent = Agent(sandbox, provider, tools=default_registry(sandbox))
    reply = agent.run_turn("Read the missing file.")
    assert "doesn't exist" in reply
    fed_back = provider.calls[1]["messages"][-1]["content"][0]
    assert fed_back.get("is_error") is True


def test_runaway_tool_chains_hit_the_iteration_limit(sandbox):
    object.__setattr__(sandbox.conversation, "max_tool_iterations", 3)
    provider = FakeProvider(
        [tool_response("search_workspace", {"query": "x"}, tool_use_id=f"t{i}") for i in range(10)]
    )
    agent = Agent(sandbox, provider, tools=default_registry(sandbox))
    reply = agent.run_turn("loop forever")
    assert len(provider.calls) == 3
    assert "safety limit" in reply


def test_consequential_action_with_no_confirmer_is_declined(sandbox):
    """Nobody there = no. The heartbeat can never assume permission."""
    provider = FakeProvider(
        [
            tool_response(
                "write_draft",
                {
                    "path": "clients/911drain/client-brief.md",  # exists → overwrite
                    "title": "x", "doc_type": "brief", "client": "911drain", "body": "clobber",
                },
            ),
            text_response("Understood — I left the brief alone."),
        ]
    )
    agent = Agent(sandbox, provider, tools=default_registry(sandbox))
    agent.run_turn("Overwrite the 911 Drain brief.")

    fed_back = provider.calls[1]["messages"][-1]["content"][0]
    assert fed_back.get("is_error") is True
    assert UNATTENDED_MESSAGE in fed_back["content"]
    # And the file is genuinely untouched.
    assert "clobber" not in (sandbox.workspace / "clients/911drain/client-brief.md").read_text()


def test_declined_confirmation_is_reported_not_crashed(sandbox):
    provider = FakeProvider(
        [
            tool_response(
                "write_draft",
                {
                    "path": "clients/911drain/client-brief.md",
                    "title": "x", "doc_type": "brief", "client": "911drain", "body": "clobber",
                },
            ),
            text_response("Left it alone."),
        ]
    )
    asked = []

    def deny(summary: str, name: str) -> bool:
        asked.append((summary, name))
        return False

    agent = Agent(sandbox, provider, tools=default_registry(sandbox), confirm=deny)
    agent.run_turn("Overwrite the brief.")
    assert asked and asked[0][1] == "write_draft"
    assert "OVERWRITE" in asked[0][0]
    fed_back = provider.calls[1]["messages"][-1]["content"][0]
    assert DECLINED_MESSAGE in fed_back["content"]


def test_approved_consequential_action_runs(sandbox):
    provider = FakeProvider(
        [
            tool_response(
                "write_draft",
                {
                    "path": "clients/911drain/client-brief.md",
                    "title": "Brief v2", "doc_type": "brief", "client": "911drain", "body": "Approved rewrite.",
                },
            ),
            text_response("Done."),
        ]
    )
    agent = Agent(sandbox, provider, tools=default_registry(sandbox), confirm=lambda s, n: True)
    agent.run_turn("Rewrite the brief, I confirm.")
    assert "Approved rewrite." in (sandbox.workspace / "clients/911drain/client-brief.md").read_text()
