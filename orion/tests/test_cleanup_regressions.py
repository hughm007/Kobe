"""Regressions for the 2026-09-28 repo-cleanup knots: each test fails on the old code."""

import inspect

import pytest

import orion.prompts
from orion.audit import AuditLog
from orion.config import ConfigError, load_config
from orion.hud.bus import EventBus
from orion.jobs import CodingJobManager, FakeRunner, Job, JobPolicy, SdkRunner
from orion.notices import NoticeBoard


def test_sdk_permission_callback_returns_sdk_permission_types(monkeypatch, tmp_path):
    """The SDK raises TypeError unless can_use_tool returns PermissionResult objects,
    which used to fail every tool call a delegated job made — allowed ones included."""
    sdk = pytest.importorskip("claude_agent_sdk")
    captured = {}

    def fake_query(*, prompt, options):
        captured["can_use_tool"] = options.can_use_tool

        async def _no_messages():
            return
            yield  # pragma: no cover — makes this an async generator

        return _no_messages()

    monkeypatch.setattr(sdk, "query", fake_query)
    project = tmp_path / "site"
    project.mkdir()
    job = Job(id="job_test", task="noop", project="site")
    SdkRunner().run(job, JobPolicy(project_dir=project), on_progress=lambda _msg: None)

    import asyncio
    cb = captured["can_use_tool"]
    allowed = asyncio.run(cb("Read", {"file_path": str(project / "index.html")}, None))
    denied = asyncio.run(cb("Edit", {"file_path": str(tmp_path / "outside.txt")}, None))
    assert isinstance(allowed, sdk.PermissionResultAllow)
    assert isinstance(denied, sdk.PermissionResultDeny)
    assert "contained" in denied.message


def _manager(config, projects_root):
    config.raw.setdefault("claude_code", {})["projects_root"] = str(projects_root)
    return CodingJobManager(
        config, EventBus(), NoticeBoard(config.state_path("notices.jsonl")),
        AuditLog(config.state_path("audit.jsonl")), runner=FakeRunner(),
    )


@pytest.mark.parametrize("project", [".", "orion", "orion/src"])
def test_delegated_job_cannot_run_in_or_around_orion(config, project):
    """projects_root defaulted to the repo that contains Orion, so a job could edit
    orion.toml's gate and deny lists. Anything at, inside, or around Orion is refused."""
    manager = _manager(config, config.home.parent)
    with pytest.raises(ValueError, match="contains Orion itself"):
        manager.resolve_project(project)


def test_sibling_project_under_same_root_still_allowed(config):
    manager = _manager(config, config.home.parent)
    assert manager.resolve_project("agent-workspace").name == "agent-workspace"


def test_unknown_gate_key_fails_loud(tmp_path):
    """AGENT.md named the key `consequential`; the loader silently dropped it,
    leaving the confirmation gate empty. A misspelled gate key must now fail."""
    (tmp_path / "orion.toml").write_text('[gate]\nconsequential = ["forget"]\n')
    with pytest.raises(ConfigError, match="always_confirm"):
        load_config(tmp_path)
    (tmp_path / "orion.toml").write_text('[gate]\nalways_confirm = ["forget"]\n')
    assert load_config(tmp_path).gate.always_confirm == ("forget",)


def test_system_prompt_date_format_is_portable():
    """`%-d` is glibc/BSD-only; Windows strftime raises ValueError on it."""
    assert "%-" not in inspect.getsource(orion.prompts)
