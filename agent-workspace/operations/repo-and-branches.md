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

## Stranded work — found 2026-09-03, resolved 2026-09-04
A locked local worktree (`.claude/worktrees/vivid-drifting-walrus/`, branch
`worktree-vivid-drifting-walrus`) held two commits never merged to `main`, from a session on
2026-08-30 whose base predated the 08-31 work. Inspected individually, not merged blind:

| Commit | Contents | On `main` already? | Still relevant? | Disposition |
|---|---|---|---|---|
| `935db03` | **The owner's Service Pow identity decision** — Direction A "THE FRAME", anchor `#17457A`, the two-weight reduction system, app mark SVG, `tokens.css`, `contrast.py` (20/20 pairs measured), a 433-line servicepow.com audit (`plan.md`) that recorded the `plumbing` fact four days before Connector Phase 2 did | **No** — `main` still showed the identity as "IN PROGRESS, three directions sent for selection" | **Yes** — Service Pow's own brand; unblocks the endcard accent and every Service Pow-branded asset | **Preserved selectively**: the 4 new files and `visual-identity.md` taken whole (main unchanged since the base); `OPEN-QUESTIONS.md` updated for the identity row **only** — the branch's copy predated the 08-31 answers, so main's later state wins for every other row; `plan.md` bannered to point at decision 0006 |
| `7f4cc87` | Its worklog entry (63 lines) | No | Yes — history | Spliced into `worklog.md` in chronological position with a recovery note |

Worktree removed (`git worktree remove`), branch kept, commits tagged
`archive/worktree-vivid-drifting-walrus`. A future cold session finding that branch should treat
it as **preserved, not pending** — nothing on it is missing from `main`.

## Housekeeping (recorded, not urgent)
`install.py` displaces the previous skill install into `.claude/skills-archive/<timestamp>/` on
every run. These snapshots are untracked and accumulate (11 as of 2026-09-03). They are
recoverable from canonical at any tagged commit, so they are noise rather than evidence. Decide
whether to gitignore or prune them; do not let it expand a production run.
