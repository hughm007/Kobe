---
title: Worklog
type: profile
client: internal
owner: Karl
status: active
created: 2026-08-24
updated: 2026-08-26
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

## 2026-08-26 — Two sources of truth eliminated; repo is canonical

**Did:** Traced `servicepow-ad-producer` v4.0. It exists nowhere on this machine — four
references, zero copies — but Drive holds a full record of it. Read the v4.0 claim, the install
ledger and the LB51 amendment, and reconstructed its deltas into
`tmp/servicepow-ad-producer-v4-export.md` (labelled RECONSTRUCTED, not ported). Merged what was
missing into `playbooks/ads/video-production.md`: **LB49, LB50 (with its day-one amendment),
LB51 + the state amendment, LB52 as check 33, and blocking checks 32–34 — count 31 → 34.**
Inverted the precedence line: the playbook now owns the check list, and the claude.ai skill is a
downstream consumer. The critic scorecard and shot-fields stopped restating and now point.

**Decided:** [Decision 0004](../knowledge/decisions/0004-canonical-source-of-truth.md) — one
rule, one home. Repo canonical for production law; Drive keeps the historical ledger; client
state lives in `clients/`. Rationale: a canonical source the working tools cannot read is not
canonical, and git structurally prevents the fork class Drive's concurrency protocol works around.

**Learned:** My v8 pilot's two findings (#13 unreadable text, #14 uncited reference) **already
existed in v4.0 as measured checks 32 and 34** — with a WPM threshold and a script, where mine had
judgment. Two independent routes found the same holes; the measured version wins. Also: the Drive
ledger's own "silo fork" entry describes this repo — the facts it recorded as missing from the
Project are exactly the ones we ingested on 08-25.

**Open:** The v4.0 skill body was never read — §8B, HB1–14 and the exact wording of checks 32–34
are still missing, and the claim file and install ledger disagree on what check 34 is. The four QC
scripts' source is not here, so checks 32–33 are enforced by judgment rather than measurement.
**Paste the real v4.0 SKILL.md to close all of it.**

**Next:** Karl pastes v4.0; diff reconstruction against it, correct, delete the export. Then the
911 Drain storyboard-level rebuild — which now fails the gate on record.

## 2026-08-26 — Service Pow operating intelligence: 15 project skills

**Did:** Audited every installed skill (all 11 valid; found a three-way trigger collision between
`motion-design`, `higgsfield-seedance-prompt` and `seedance-shotlist-director`, and that none of
them know Service Pow exists). Built 15 project skills at `.claude/skills/` encoding the
company's own advertising judgment end to end: campaign-director → client-intelligence →
strategy → creative-director → creative-spine → script-director → storyboard-director →
brand-fidelity / continuity / performance → higgsfield-intelligence + production →
cinematography-editor → audio-director → creative-critic. Added the **Campaign Bible** as the
single source of truth (one owning skill per section, append-only CONFLICTS, no silent rewrites),
a dated Higgsfield capability map seeded from live account data, the credit cost ladder, and two
separate learning ledgers (`knowledge/production-log/`, `knowledge/campaign-results/`).

**Decided:** Six merges/rejections rather than 22 files — voice-of-customer into
client-intelligence, offer-positioning into strategy as a blocking gate, credit-guard into
higgsfield-production, and claims-check/client-onboarding/client-reporting rejected as
duplicating existing playbooks. Skills are procedure; playbooks stay the content. Reasoning is in
`.claude/skills/README.md`.

**Learned:** The pilot mattered. Running the critic against the killed v8 "2:07 AM" caught only
3 of its 5 documented failures — legibility dwell time and reference-citation audit were missing.
Both are now hard failures (#13, #14). A critic that passes known-bad work is worse than none.

**Open:** `servicepow-ad-producer` v4.0 still lives in the claude.ai workspace and is referenced
as canonical by `playbooks/ads/video-production.md` — export it so anything it holds that the
playbooks missed gets folded in, then retire that line. `motion-design` still says "always use
this skill" and is synced, so it must be retuned at source. Critic perception is unverified until
it runs on a real cut.

**Next:** Run one live campaign end to end on the Mac; then wave 2 (hook-lab,
reference-ad-intelligence, platform-adaptation, experiment-design, campaign-learning).

## 2026-08-25 — Orion's marketing hands + full code autopsy

**Did:** Part B — `make_static_ad` tool (pixel-exact self-contained HTML ads in
`clients/<slug>/deliverables/`, PNG export when Chromium is present, safe areas
and contrast checks built in, overwrite gated), a business snapshot digested
into Orion's system prompt from `company/`, and the Remotion video path named in
the Claude Code delegation tool. Part C — three independent review passes over
`orion/` (concurrency, correctness, security); every confirmed finding fixed
with a regression test: production barge-in (the cancel signal was being
swallowed by the provider), Ctrl-C-proof tool history, per-model API
capabilities (haiku/efforts), voice-pipeline races (echo guard, gate question
overlap, stale mic pump, announcement vs live turn), job-sandbox hardening
(baseline denylist config can't erase, credential-file reads denied, no web
tools in jobs), HUD CSRF/DNS-rebinding protection, lock-protected notices.
161 tests green; end-to-end driven smoke green.

**Learned:** the config-overrides-code pattern had quietly dropped exfil
patterns from the job denylist — safety baselines now live in code and config
only extends them.

**Open:** unchanged from the ingestion entry (Tier 1 risk items). The Mac app
needs a rebuild on Karl's machine to pick up nothing — no Swift changes this
session.

**Next:** Karl reviews the report; first real deliverable through the new gate
(a 911 Drain static ad is the obvious candidate — blocked only on the claims
sheet signature for any claim-bearing copy).

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
