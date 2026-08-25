"""Delegated coding jobs — Orion handing real work to Claude Code.

A job is Claude Code running a task in one project directory, in the
background: the voice turn that starts it returns immediately, Orion keeps
listening, and the outcome comes back as a spoken announcement (if awake) and
a held notice (so it is never lost).

Two standing rules shape everything here:

- Background work never hangs on an absent human. A running job never stops
  to ask permission — anything Orion wouldn't allow unattended is DENIED
  inside the job by policy (the can_use_tool callback), with the reason
  recorded. Drafting is fine; dispatching needs Karl (CLAUDE.md §10).
- Jobs are contained. Each runs inside one project directory under
  [claude_code].projects_root, with a per-job dollar budget and turn cap.
"""

from __future__ import annotations

import re
import secrets
import threading
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Protocol


# Dispatch and exfiltration patterns denied in EVERY job, regardless of what
# orion.toml says — config patterns ADD to this baseline, they never replace
# it, so an edited (or truncated) config can't quietly open the door. Regex
# over command text is defense-in-depth, not a security boundary: it will
# overblock (git stash push) and a determined prompt injection can dodge it —
# which is why jobs also can't use web tools and denials are always recorded
# for Karl to see. Overblocking is safe: a denial is a message, not a crash.
BASELINE_DENY = (
    r"\bgit\b[^\n]*\bpush\b",          # any spelling: git push, git -c x push…
    r"force-with-lease",
    r"\bgh\b[^\n]*\b(pr|release)\b",
    r"\b(npm|yarn|pnpm)\b[^\n]*\bpublish\b",
    r"\bdeploy\b",
    r"\b(vercel|netlify|heroku|wrangler|flyctl)\b",
    r"\b(curl|wget|nc|ncat|netcat|ssh|scp|sftp|rsync|ftp|telnet)\b",
    r"\b(mail|sendmail|mutt)\b",
)

# Files whose names have no business in a job's shell command: reading them
# is the first step of exfiltrating a credential.
SENSITIVE_PATH_RE = re.compile(
    r"\.env\b|\.pem\b|\.key\b|id_rsa|id_ed25519|\.ssh\b|\.aws\b|\.netrc\b|\.npmrc\b",
    re.IGNORECASE,
)

# Tool-input keys that carry shell text (checked against SENSITIVE_PATH_RE)
# and keys that carry file paths (checked for containment).
_COMMAND_KEYS = ("command", "script")
_PATH_KEYS = ("file_path", "path", "notebook_path", "cwd")


@dataclass
class JobPolicy:
    """What a job may touch. Built from [claude_code] in orion.toml."""

    project_dir: Path
    deny_patterns: tuple = ()
    max_turns: int = 50
    max_budget_usd: float = 5.0

    def check_tool_use(self, tool_name: str, tool_input: dict) -> str | None:
        """Return a denial reason, or None to allow.

        The dispatch guardrail lives here: pushes, deploys, publishes and
        outbound sends are denied inside the job — Karl reviews and ships.
        """
        blob = f"{tool_name} {tool_input}".lower()
        for pattern in (*BASELINE_DENY, *self.deny_patterns):
            if re.search(pattern, blob):
                return (
                    "Orion guardrail: drafting is fine, dispatching is not. "
                    f"'{pattern}' actions need Karl's explicit sign-off outside this job. "
                    "Leave the work committed locally / in the working tree instead."
                )
        # Shell commands must not touch credential files.
        for key in _COMMAND_KEYS:
            raw = tool_input.get(key)
            if isinstance(raw, str) and SENSITIVE_PATH_RE.search(raw):
                return (
                    "Orion guardrail: that command references a credential or key "
                    "file. Jobs never read secrets — work with the project's code only."
                )
        # Path containment for file tools.
        for key in _PATH_KEYS:
            raw = tool_input.get(key)
            if isinstance(raw, str) and raw.strip():
                candidate = Path(raw)
                if not candidate.is_absolute():
                    candidate = self.project_dir / candidate
                try:
                    candidate.resolve().relative_to(self.project_dir.resolve())
                except ValueError:
                    return (
                        f"Orion guardrail: this job is contained to {self.project_dir}. "
                        "Work only inside the project directory."
                    )
        return None


@dataclass
class Job:
    id: str
    task: str
    project: str
    status: str = "running"       # running | done | failed
    started_at: float = field(default_factory=time.time)
    finished_at: float | None = None
    result: str = ""
    error: str = ""
    cost_usd: float = 0.0
    turns: int = 0
    denials: list[str] = field(default_factory=list)

    def summary(self) -> str:
        elapsed = (self.finished_at or time.time()) - self.started_at
        head = f"{self.id} [{self.status}] {self.project}: {self.task[:80]}"
        tail = f" — {elapsed:.0f}s, {self.turns} turns, ${self.cost_usd:.2f}"
        if self.status == "failed":
            tail += f" — {self.error}"
        elif self.result:
            tail += f"\n{self.result[:600]}"
        if self.denials:
            tail += f"\n(blocked by guardrail: {len(self.denials)} attempt(s) — e.g. {self.denials[0][:120]})"
        return head + tail


class CoderRunner(Protocol):
    """Seam to the Claude Agent SDK, so everything else tests with a fake."""

    def run(self, job: Job, policy: JobPolicy, on_progress) -> None:
        """Execute the task; fill job.result/cost/turns; raise on failure."""


class SdkRunner:
    """The real thing: Claude Code via the claude-agent-sdk package."""

    def run(self, job: Job, policy: JobPolicy, on_progress) -> None:
        import asyncio

        try:
            from claude_agent_sdk import ClaudeAgentOptions, query
        except ImportError as exc:
            raise RuntimeError(
                "The Claude Agent SDK isn't installed. Run `uv pip install claude-agent-sdk` "
                "inside orion/."
            ) from exc

        async def _permission(tool_name, tool_input, _context):
            reason = policy.check_tool_use(tool_name, dict(tool_input or {}))
            if reason is not None:
                job.denials.append(f"{tool_name}: {reason}")
                on_progress(f"blocked {tool_name} (guardrail)")
                return {"allowed": False, "reason": reason}
            return {"allowed": True}

        options = ClaudeAgentOptions(
            cwd=str(policy.project_dir),
            permission_mode="acceptEdits",
            can_use_tool=_permission,
            max_turns=policy.max_turns,
            max_budget_usd=policy.max_budget_usd,
            # Build-never-ship: a contained job has no reason to talk to the
            # web, and a web request is also the easy exfiltration channel a
            # prompt injection in the project's files would reach for.
            disallowed_tools=["WebFetch", "WebSearch"],
            system_prompt=(
                "You are doing delegated work for Service Pow via Orion, Karl's "
                "assistant. Work only inside this project. Do not push, deploy, "
                "publish, or send anything anywhere — leave changes in the working "
                "tree for Karl to review. Finish with a short plain summary of what "
                "changed and what he should look at."
            ),
        )

        async def _run() -> None:
            async for message in query(prompt=job.task, options=options):
                kind = type(message).__name__
                if kind == "AssistantMessage":
                    job.turns += 1
                    on_progress(f"working… (turn {job.turns})")
                elif kind == "ResultMessage":
                    job.result = str(getattr(message, "result", "") or "")
                    job.cost_usd = float(getattr(message, "total_cost_usd", 0.0) or 0.0)

        asyncio.run(_run())


class FakeRunner:
    """Scripted Claude Code for tests: exercises progress, policy and outcome."""

    def __init__(self, *, result: str = "Done.", cost: float = 0.42,
                 tool_uses: list | None = None, fail: str = "") -> None:
        self.result = result
        self.cost = cost
        self.tool_uses = tool_uses or []
        self.fail = fail

    def run(self, job: Job, policy: JobPolicy, on_progress) -> None:
        for tool_name, tool_input in self.tool_uses:
            reason = policy.check_tool_use(tool_name, tool_input)
            if reason is not None:
                job.denials.append(f"{tool_name}: {reason}")
                on_progress(f"blocked {tool_name} (guardrail)")
            else:
                job.turns += 1
                on_progress(f"ran {tool_name}")
        if self.fail:
            raise RuntimeError(self.fail)
        job.result = self.result
        job.cost_usd = self.cost


class CodingJobManager:
    def __init__(self, config, bus, board, audit=None, *, runner: CoderRunner | None = None,
                 announce=None) -> None:
        self.config = config
        self.bus = bus
        self.board = board
        self.audit = audit
        self.announce = announce or (lambda text: None)  # spoken if Orion is awake
        settings = config.raw.get("claude_code", {})
        self.projects_root = Path(
            str(settings.get("projects_root", "~/Kobe"))
        ).expanduser()
        self.max_turns = int(settings.get("max_turns", 50))
        self.max_budget = float(settings.get("max_budget_usd_per_job", 5.0))
        # Config patterns are EXTRAS on top of BASELINE_DENY, which always
        # applies — an emptied config list still leaves the baseline standing.
        self.deny_patterns = tuple(settings.get("deny_patterns", []))
        self.runner = runner or SdkRunner()
        self.jobs: dict[str, Job] = {}
        self._lock = threading.Lock()

    # ------------------------------------------------------------------ api

    def resolve_project(self, project: str) -> Path:
        cleaned = project.strip().strip("/")
        if not cleaned:
            raise ValueError("Name the project directory the task should run in.")
        candidate = (self.projects_root / cleaned).resolve()
        try:
            candidate.relative_to(self.projects_root.resolve())
        except ValueError:
            raise ValueError(
                f"'{project}' is outside {self.projects_root} — jobs only run under it."
            ) from None
        if not candidate.is_dir():
            raise ValueError(
                f"There is no project directory at {candidate}. "
                f"Projects live under {self.projects_root}."
            )
        return candidate

    def running_job(self) -> Job | None:
        with self._lock:
            return next((j for j in self.jobs.values() if j.status == "running"), None)

    def start(self, task: str, project: str) -> Job:
        if not task.strip():
            raise ValueError("The task is empty — say what Claude Code should do.")
        project_dir = self.resolve_project(project)
        job = Job(id=f"job_{secrets.token_hex(3)}", task=task.strip(), project=project_dir.name)
        # One lock over check-and-insert: two concurrent starts must not both
        # pass the one-job-at-a-time check.
        with self._lock:
            active = next((j for j in self.jobs.values() if j.status == "running"), None)
            if active is not None:
                raise ValueError(
                    f"One job at a time: {active.id} is still working on '{active.task[:60]}'. "
                    "Check it with check_coding_job, or wait for it to finish."
                )
            self.jobs[job.id] = job
        policy = JobPolicy(
            project_dir=project_dir, deny_patterns=self.deny_patterns,
            max_turns=self.max_turns, max_budget_usd=self.max_budget,
        )
        threading.Thread(target=self._work, args=(job, policy), daemon=True).start()
        self.bus.publish("job.started", {"id": job.id, "task": job.task, "project": job.project})
        return job

    # ----------------------------------------------------------------- work

    def _work(self, job: Job, policy: JobPolicy) -> None:
        def on_progress(line: str) -> None:
            self.bus.publish("job.progress", {"id": job.id, "text": line})

        try:
            self.runner.run(job, policy, on_progress)
            job.status = "done"
        except Exception as exc:  # noqa: BLE001 — a dead job is an outcome, not a crash
            job.status = "failed"
            job.error = str(exc)
        job.finished_at = time.time()

        if self.audit is not None:
            self.audit.log("job.finished", {
                "id": job.id, "status": job.status, "project": job.project,
                "task": job.task, "cost_usd": job.cost_usd, "turns": job.turns,
                "denials": len(job.denials), "error": job.error,
            })
        self.bus.publish("job.done", {
            "id": job.id, "status": job.status, "cost_usd": job.cost_usd,
            "result": job.result[:300], "error": job.error,
        })

        if job.status == "done":
            spoken = (
                f"The Claude Code task in {job.project} is done — "
                f"{job.turns} steps, about {self._spoken_cost(job.cost_usd)}. "
                "The changes are in the working tree for your review."
            )
            self.board.post(
                "claude_code", "notify",
                f"Job {job.id} done in {job.project}: {job.task[:80]} "
                f"(${job.cost_usd:.2f}). Review the diff before anything ships.",
            )
        else:
            spoken = f"The Claude Code task in {job.project} failed: {job.error[:120]}"
            self.board.post(
                "claude_code", "interrupt",
                f"Job {job.id} FAILED in {job.project}: {job.error[:160]}",
            )
        self.announce(spoken)

    @staticmethod
    def _spoken_cost(cost: float) -> str:
        if cost <= 0:
            return "no cost recorded"
        if cost < 1:
            return f"{round(cost * 100)} cents"
        return f"{cost:.2f} dollars"
