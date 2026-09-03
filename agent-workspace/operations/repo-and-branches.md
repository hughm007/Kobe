---
title: "Repositories and branches — the recovery path"
type: procedure
client: internal
owner: APPROVER
status: active
created: 2026-09-03
tags: [git, recovery, durability, onboarding]
---
# Repositories and branches — how a stranger recovers this system

**A fresh clone of the default branch is the entry point. No branch knowledge required.**

| Repo | Remote | Default branch | Holds |
|---|---|---|---|
| Canonical OS | `hughm007/servicepow-ai-os` | `main` | policies, blocking-check registry, skills, profiles, fixtures, regression harness, baseline registry |
| This workspace (Kobe) | `hughm007/Kobe` | **`main`** | the durable record: evidence index, connector register, run ledger, worklog, decisions, client state, installed skills |
| Website deployment | `hughm007/servicepow-v2` | `main` | the website profile install + site |

Start at Kobe's `agent-workspace/CLAUDE.md`, then `knowledge/EVIDENCE-INDEX.md`.

## Branch model
- **`main` is the operating system.** All three repos. It is what a plain `git clone` gives you.
- Session branches (`claude/<topic>-<id>`) are working branches. **Merge or fast-forward them
  into `main` when the work is durable** — the record is not durable until it is on `main`.
- The `baseline-v1` tag is the restore point and lives on the remote in all three repos.

## The 2026-09-03 defect this file exists to prevent
Kobe's remote default branch was `claude/agent-workspace-setup-vgoi8u` — the *first* session
branch ever created. Every later session branched onward, but the default was never moved and
no `main` existed. It drifted **106 commits** behind. A plain clone of Kobe returned a workspace
with no Baseline V1, no evidence index, no connector register, no run ledger, no decisions —
i.e. the durability law's core promise was false for anyone who did the normal thing.

**Fixed by fast-forward, not merge:** the stale default was a *strict ancestor* of the working
branch (zero unique commits), so `main` was created at the proven HEAD and set as the remote
default. No history was rewritten and nothing was deleted.

**Old branches are kept, not destroyed:**
- `claude/agent-workspace-setup-vgoi8u` — fully contained in `main`; retained as history.
- `claude/env-file-setup-vfr4ix` — one unique commit (a 4-line `.env` gitignore) whose content
  is present verbatim in the root `.gitignore` on `main`. Superseded, not merged; preserved as
  tag **`archive/env-file-setup-vfr4ix`** so it stays discoverable.
- `claude/voice-first-agent-core-dysy9h` — the branch the work was on; `main` is at its HEAD.

**Standing rule:** if you finish durable work on a session branch, get it onto `main` before the
session ends. A record only reachable by knowing a branch name is not a durable record.

## Stranded work found 2026-09-03 (owner/next-session review)
Local git worktree `.claude/worktrees/vivid-drifting-walrus/` on branch `worktree-vivid-drifting-walrus`
(`7f4cc87`) holds **two commits not on `main`**: "Direction A selected: the identity system, and
the design brief for the site redesign" and its worklog entry (7 files, incl. `tokens.css`). It is
local only — a fresh clone does not see it — but it is exactly the class of defect this file exists
for. Review, merge or cherry-pick what is still wanted into `main`, then `git worktree remove`.
Keep the branch.

## Housekeeping (recorded, not urgent)
`install.py` displaces the previous skill install into `.claude/skills-archive/<timestamp>/` on
every run. These snapshots are untracked and accumulate (11 as of 2026-09-03). They are
recoverable from canonical at any tagged commit, so they are noise rather than evidence. Decide
whether to gitignore or prune them; do not let it expand a production run.
