---
title: Production Intelligence Log
type: research
client: internal
owner: Karl
status: active
created: 2026-08-26
updated: 2026-08-26
tags: [production, higgsfield, learning, models]
---

# Production intelligence

**What makes AI production succeed.** One file per meaningful generation event or failure.

This ledger answers *"how do we make the thing"*. It is deliberately kept separate from
[`../campaign-results/`](../campaign-results/README.md), which answers *"did the thing sell"*.

> **Never confuse "this model generated the clip well" with "this advertisement made people buy."**
> A clip can be flawless and the ad can fail. An ad can win with an imperfect clip. Merging these
> two ledgers is how an agency starts optimising for the wrong thing.

## Filename

`YYYY-MM-DD-<short-slug>.md` — e.g. `2026-08-26-seedance-hand-detail-fail.md`

## What each entry records

| Field | Notes |
|---|---|
| Model + version | Exactly as routed |
| Shot type | What was being attempted |
| Prompt | Verbatim — the phrasing is the reusable asset |
| References used | Which, and how bound |
| Settings | Resolution, mode, duration, audio on/off |
| Expected result | What we thought would happen |
| Actual result | What happened |
| Failure | If any — the specific tell |
| Cause | Our diagnosis (configuration before model, always) |
| Correction | What we changed |
| Result of correction | Did it work |
| Cost | Credits spent, including failed attempts |
| Status | EXPERIMENTAL / REPEATED / VALIDATED |

## Learning safety

- **EXPERIMENTAL** — observed once. Interesting. Changes nothing.
- **REPEATED** — observed again, independently. Goes on the watch list in
  [`../index.md`](../index.md).
- **VALIDATED** — three or more independent confirmations. **Only now** may it change routing in
  the capability map or a rule in a playbook.

**One failed generation never rewrites Service Pow's operating rules.**

## Failures are kept

A failed test is not deleted or quietly superseded. Record what failed, why we think it failed,
how we changed it, and whether the change worked. The failure record is often worth more than the
success — it is what stops the same 32.5 credits being spent on the same mistake next quarter.

## Catch attribution

Tag every caught problem **CLAUDE-CAUGHT** or **OWNER-CAUGHT**. The ratio is the KPI of a system
learning to see. Problems the owner caught that Claude missed are the highest-value entries here:
each one should become a new check.
