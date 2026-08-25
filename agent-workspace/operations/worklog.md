---
title: Worklog
type: profile
client: internal
owner: Karl
status: active
created: 2026-08-24
updated: 2026-08-25
tags: [operations, log]
---

# Worklog

The office journal. **Newest entry at the top.**

Every working session ends with an entry here. It is the single most important habit in
this workspace: it's how the next session — days later, or by someone else entirely —
picks up without re-deriving everything.

## Entry format

```markdown
## YYYY-MM-DD — Short description

**Did:** what actually happened
**Decided:** any choices made, and why (significant ones also go to knowledge/decisions/)
**Learned:** anything worth keeping (detail goes to knowledge/learnings/)
**Open:** what's unfinished, blocked, or waiting on someone
**Next:** the obvious next action
```

Keep entries short. This is a log, not a report — three lines that are actually written
beat a page that isn't.

---

## 2026-08-25 — Drive company OS ingested; Orion tailored to Service Pow

**Did:** Read the canonical Drive folder "ServicePow OS 2" (the storage map there
declares the Drive copies canonical) and distilled the live docs into this workspace —
15 new/updated files, each citing its Drive source and sync date in frontmatter:
company profile, services, positioning/ICP, pricing floors, sales process, email
marketing playbook, video-production gate (31 blocking checks + ServicePow-6),
compliance rules, the Style Bank design research, and real briefs for 911 Drain
(partnership structure, CR-37 residential-only, live blockers) and TripNerd. Filled
911 Drain's brand guide from known brand facts. Re-tiered `company/OPEN-QUESTIONS.md`
around business risk. Updated `CLAUDE.md` §1 (clients row) and §13.

**Decided:** [Decision 0003](../knowledge/decisions/0003-orion-and-the-company-os.md)
— Orion keeps its own constitution and gate; the Company OS governs marketing quality
and compliance; the mapping between the two is recorded once, not re-litigated per task.

**Abandoned deliberately:** all RETIRED_*/LOCK_* Drive copies, the change-log
mechanics, the other assistant's concurrency protocol, and the personal weekly
checklist — bookkeeping for a different tool, not knowledge.

**Learned:** [Checks beat prose](../knowledge/learnings/2026-08-25-checks-beat-prose.md)
— the v8 "2:07 AM" kill is why binary blocking checks now gate creative work here too.

**Open:** the Tier 1 risk items (unrecorded partnership percentages, unsigned claims
sheet, sewer-scope verification, capacity vs. the daily-video promise); Wave Reaction's
identity; ElevenLabs key still unverified from this container (egress-blocked).

**Next:** Part B — wire the business snapshot into Orion's system prompt and add the
static-ad drafting tool; then the code autopsy (Part C).

## 2026-08-24 — Tier 1 answered; workspace populated

**Did:** Converted the whole workspace from UK to US English (17 spellings, plus a GBP
example changed to USD) — it had been drafted in UK English before the variant was
confirmed. Filled Tier 1 of `OPEN-QUESTIONS.md` into the company files: Karl as sole
owner and approver, remote operating model, USD, the four ad platforms plus
client-directed, and the Claude-built / Vercel-hosted web stack. Created client folders
for 911 Drain (active) and TripNerd and WaveReaction (prospects).

**Decided:**
- Recorded [decision 0002](../knowledge/decisions/0002-web-delivery-model.md) — websites
  built as code with Claude, hosted on Vercel. Written up as an existing practice rather
  than a new choice, because its consequences were undocumented and they're significant.
- Prospects live in `clients/` with `status: prospect` rather than in a separate folder,
  with a hard rule that prospect work is research and drafts only — no builds, no spend,
  nothing sent without Karl's go-ahead.
- Noted in `services.md` that Instagram is a Meta placement rather than a separate ad
  platform. It's one account, not two, and the distinction matters for how campaigns get
  structured and reported.

**Learned:** Nothing from client work yet — still no history to learn from.

**Open:** **911 Drain's brief is empty.** It's the active account and the agent knows
nothing about the business beyond the name. The name implies emergency drain services;
that's flagged in the brief as an unconfirmed inference, explicitly not a fact, so it
can't leak into copy or targeting. Also open: Service Pow's own brand voice and visual
identity, pricing figures, and Tiers 2–5.

**Next:** Fill `clients/911drain/client-brief.md` — what the business does, who buys,
what we're accountable for, and how we're measured. That single file unblocks all real
work on the main account.

---

## 2026-08-24 — Workspace scaffolded

**Did:** Built the `agent-workspace/` structure from empty: root `CLAUDE.md`, folder
READMEs throughout, `company/` identity files, the `clients/_template/` structure, eight
playbooks across web / ads / content / client lifecycle, six document templates, and the
`knowledge/` system with its index, glossary and templates.

**Decided:** Structure and conventions recorded in
[`../knowledge/decisions/0001-workspace-structure.md`](../knowledge/decisions/0001-workspace-structure.md)
— structured folders governed by a root `CLAUDE.md` constitution; playbooks and learnings
kept separate with an explicit promotion path between them; unknowns marked rather than
guessed.

**Learned:** Nothing yet — the office has no history to learn from. That starts with the
first real piece of client work.

**Open:** Every Service Pow specific. Real clients, brand voice, pricing, tool stack and
platforms are all `NEEDS INPUT`, collected in
[`../company/OPEN-QUESTIONS.md`](../company/OPEN-QUESTIONS.md).

**Next:** Work through Tier 1 of `OPEN-QUESTIONS.md`. Seven answers — writing variant,
location, currency, team, ad platforms, web platform, current clients — unblock most
day-to-day work in here.

## 2026-08-24 — Orion built: the voice-first agent harness (Tiers 0–6)

- Built `orion/` at the repo root: Karl's voice-first assistant. Spec and
  guardrails live in `AGENT.md` (repo root) — the persona there is read
  verbatim into the system prompt at runtime.
- Six tiers, each tested before the next: text brain → tool registry
  (workspace search/read, gated drafts, append-only worklog + learnings,
  memory) → continuous voice (Deepgram Flux → same brain → ElevenLabs, with
  barge-in and self-echo suppression) → durable memory → heartbeat
  (inbox_triage + open_loops checks, held notices, quiet hours, kill switch)
  → rails (two-step confirmation gate — yes, then the exact word "confirm" —
  audit trail, config-over-code).
- 79 automated tests pass with no API keys. Live voice needs Karl's machine
  and keys: see `orion/VERIFY.md`. ElevenLabs key still missing; Deepgram key
  was never actually received despite being referenced — both flagged.
- Decisions of note: manual agent loop (gate sits between tool choice and
  execution, identical for typed/spoken/heartbeat turns); everything read is
  wrapped untrusted; heartbeat turns get no confirmer at all, so unattended
  consequential actions decline by default.
- Open: fill in the two keys, run VERIFY.md tier by tier, then tune
  `[voice]` thresholds to taste.
