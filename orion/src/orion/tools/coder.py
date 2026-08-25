"""Delegate coding work — Orion's hands for real software tasks.

Claude Code does the building; Orion stays the front of house. Delegation is
always consequential: it edits a repository and spends API money, so the
two-step gate speaks before anything starts. The job itself runs in the
background — Orion answers immediately and reports back when it's done.
"""

from __future__ import annotations

from ..jobs import CodingJobManager
from .registry import ToolError, ToolRegistry, tool


def register(registry: ToolRegistry, config, manager: CodingJobManager) -> None:
    @tool(
        registry,
        description=(
            "Hand a real coding task to Claude Code, running in the background in "
            "one project directory — build a page, fix a bug, add a feature, "
            "refactor. Use when Karl asks for actual software work on a site or "
            "repo, not for questions. The task should say concretely what to do "
            "and how to know it's done. Returns a job id immediately; the "
            "conversation continues while it works, and completion is announced. "
            "The job can edit files and run commands inside the project only — it "
            "can never push, deploy, publish, or send anything."
        ),
        consequential=True,
        describe_action='hand this task to Claude Code in "{project}": {task}',
        param_docs={
            "task": "What Claude Code should do, concretely, including how to verify it.",
            "project": (
                "The project directory name under the projects root "
                "(e.g. '911drain-site'). Ask Karl if you don't know it."
            ),
        },
    )
    def delegate_coding_task(task: str, project: str) -> str:
        try:
            job = manager.start(task, project)
        except ValueError as exc:
            raise ToolError(str(exc)) from exc
        return (
            f"Started {job.id}: Claude Code is working on it in {job.project}. "
            "Karl can keep talking — completion will be announced and noted. "
            "Status any time via check_coding_job."
        )

    @tool(
        registry,
        description=(
            "Status of a delegated Claude Code job — running/done/failed, what it "
            "produced, cost, and anything the guardrail blocked. No id = the most "
            "recent job."
        ),
        param_docs={"job_id": "The id from delegate_coding_task, e.g. job_a1b2c3. Optional."},
    )
    def check_coding_job(job_id: str = "") -> str:
        jobs = manager.jobs
        if not jobs:
            return "No coding jobs have been run this session."
        if job_id.strip():
            job = jobs.get(job_id.strip())
            if job is None:
                raise ToolError(
                    f"No job called {job_id!r}. Known: {', '.join(jobs)}."
                )
        else:
            job = max(jobs.values(), key=lambda j: j.started_at)
        return job.summary()

    @tool(
        registry,
        description="List every Claude Code job from this session, newest first.",
    )
    def list_coding_jobs() -> str:
        jobs = sorted(manager.jobs.values(), key=lambda j: j.started_at, reverse=True)
        if not jobs:
            return "No coding jobs have been run this session."
        return "\n".join(
            f"{j.id} [{j.status}] {j.project}: {j.task[:70]} (${j.cost_usd:.2f})"
            for j in jobs
        )
