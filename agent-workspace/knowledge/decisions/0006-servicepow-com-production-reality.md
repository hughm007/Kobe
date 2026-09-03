---
title: "0006 — servicepow.com production reality: two parallel sites"
type: decision
client: internal
owner: Karl
status: OWNER DECISION REQUIRED — do not resolve in-session
created: 2026-09-03
updated: 2026-09-03
tags: [web, vercel, conflict, owner-decision, read-only]
---

# 0006 — servicepow.com production reality

> ## ⛔ OWNER DECISION REQUIRED — LOCKED
> **No Claude session may resolve this.** Not by merging, deploying, modifying, retiring,
> redefining, or "clarifying" either side. Not as a side effect of unrelated work. The
> conflict stays open until the owner rules, and the ruling is recorded here by amendment.
>
> **Standing rule while open: the `plumbing` Vercel project is READ-ONLY from this
> workspace.** It may be read as evidence. It may never be deployed to, modified, promoted,
> paused, renamed, or linked to a new repo from here. `servicepow-v2` likewise continues
> unchanged — neither side advances while the question is open.
>
> This is a blocker on **servicepow.com itself only**. It does **not** block client work, the
> video/static lanes, connector testing (including the Canva bake-off), or any other workspace
> activity. Do not treat it as a general freeze.

**Status:** open. Discovered 2026-09-03 during Connector Phase 2/3 (Vercel wiring).

## The conflict

Two different live realities exist for the same domain.

**Reality 1 — the `plumbing` project (LIVE).** Probed live 2026-09-03.
- Vercel team "karlmalik's projects" (`team_yHNWG8PHWgZ40mHIpLuUfo2L`), Pro plan.
- The team's only standing project: **`plumbing`** ← private repo `karlmalik/Plumbing`.
- **This is the live servicepow.com.** Latest production deploy 2026-09-02, actively
  developed via Cursor — i.e. it has a development path that does not run through this
  workspace or its gates.
- Contains an internal **Ops SaaS at `/app`**: leads → quotes → invoices, Supabase auth,
  SendGrid, staff portals, LSA/review tooling, a $597 answering product, an AI Visibility SKU.

**Reality 2 — the workspace doctrine site.**
- `decision 0002` (web delivery model, status `active`) and the `servicepow-v2` repo describe
  a **different** servicepow.com: code-direct builds, gated through
  `servicepow-website-production`, QC harness, deployment receipts, BC-50 approval on
  production.
- `servicepow-v2` carries the `baseline-v1` tag and is a validated deployment target.

Both are real. Neither is wrong on its own terms. They cannot both be servicepow.com.

## Why a session must not settle it

The two realities encode different answers to questions only the owner can answer: whether
servicepow.com is a marketing site or the front door of a product; whether the Ops SaaS is the
business or a tool for it; which SKUs are real and sellable; and whether the site's development
path should be inside this workspace's gates at all. Choosing a side silently would also
retire real, shipped, revenue-bearing software — the exact "capability floor moves down" event
`baseline-and-regression.md` §2 exists to prevent.

## What the owner is being asked to decide

1. **Which reality is canonical for servicepow.com?**
2. **What happens to the other** — retired, kept as a separate property on its own domain or
   subdomain, or merged (and if merged, in which direction)?
3. **Does decision 0002 stand, get amended, or get superseded?**
4. **Does the `plumbing` project ever come inside this workspace's gates**, or does it stay an
   externally-developed property that the workspace only reads?
5. **What is the Vercel connector's proven scope** — fixture and per-client projects only (its
   current, honest state), or a production surface?

## Consequences while open

- The Vercel connector's PROVEN rating covers **fixture and per-client projects only**. It
  cannot be extended to a servicepow.com production surface until Q5 is answered.
- `operations/vercel-deploy-procedure.md` carries the same read-only rule at the point of use;
  it points here and does not restate the decision.
- The connector register's Vercel row carries this as its owner-triage item.

## Amendment procedure

When the owner rules: record the ruling and its date in this file, change `status`, update
decision 0002 (amend or supersede — do not delete), update the Vercel row in
`operations/connector-register.md`, and re-run the regression floor before anything about
either site changes. The ruling is not in force until it is written here.
