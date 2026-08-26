---
title: "0005 — v4.0 consolidated: v4.0's content, the skills' structure"
type: decision
client: internal
owner: Karl
status: accepted
created: 2026-08-26
updated: 2026-08-26
tags: [architecture, canonical, ad-producer, skills, consolidation]
---

# 0005 — v4.0's content, the skills' structure

**Status:** Accepted, 2026-08-26. Builds on [`0004`](0004-canonical-source-of-truth.md), which
made this repo canonical. 0004 was decided **without** the real v4.0 file in hand; this decision
records what changed once it was read.

## Context

0004 established *where* rules live. It was implemented against a **reconstruction** of
`servicepow-ad-producer` v4.0, assembled from the Drive claim file and install ledger, because no
copy of the skill existed on this machine. Karl then pasted the genuine file: **v4.0 ServicePow
Video OS — Operating Manual, 2026-08-20, 631 lines.**

The reconstruction was directionally right and materially incomplete. It captured v4.0's *deltas*
and almost none of the operating system underneath them — roughly 10 of 52 lessons, none of the
14 hard boundaries, none of the three inspection protocols, and no thresholds at all.

The headline finding on reading the real file:

> **v4.0 is a deep content system with a shallow structure. The skills are a good structure with
> shallow content.** Neither should replace the other.

v4.0 diagnoses its own problem in §8B: *"The audit counted ~600 discrete checks per ad across this
skill, the lesson bank, four overlapping final checklists and the Skeptic passes. That is not
rigour — for a one-person shop it guarantees silent skipping, and a check everyone skips is worse
than no check."* Its answer was **tiering** — a small blocking set, everything else advisory.
Progressive disclosure across skills and reference files is the same answer executed structurally.

## Decision

**Import v4.0's content whole; keep the skills' structure; give every rule exactly one home.**

| Home | Owns |
|---|---|
| `playbooks/ads/video-production.md` | The blocking checks and their count · the S0–S9 pipeline and its gates · ServicePow-6 + the AUTOMATIC FAIL list · Real-Media-First · the client KB spec |
| `playbooks/ads/references/lesson-bank.md` | **LB1–LB52 verbatim**, with their origin stories |
| `playbooks/ads/references/hard-boundaries.md` | **HB1–HB14 verbatim**, including HB8's gate chain |
| `playbooks/ads/references/prompt-craft.md` | Production Law · the 5X bar · the locked Style Prefix · the 14 AI-tells · the 3-Draft Rule · the credit stop-loss |
| `playbooks/ads/references/measurement.md` | The threshold tables · script usage · Eyes Protocol · Describe-Back · the clip-gate ledger |
| `.claude/skills/servicepow-*/SKILL.md` | **Procedure only** — when to run, in what order, what to hand on. A skill never restates a law |
| `higgsfield-capability-map.md` | Everything volatile — model names, credit baselines, provisional thresholds — dated and labelled |
| `clients/<slug>/`, Campaign Bible, the two ledgers | State |

**HB8's precedence line travels with the content:** the authority to win a conflict now sits on
the file that holds the rules, not on an unreachable one.

### The seven conflicts, resolved

| # | Conflict | Resolution |
|---|---|---|
| 1 | Unit of work: v4.0 a **pack**, mine one ad | **v4.0.** `creative-director` and `creative-spine` adopted pack mode + the Hook Tournament |
| 2 | Storyboard fields: v4.0 **ten**, mine 24 | **v4.0.** `shot-fields.md` collapsed to the ten. My 24-field set was exactly the SOP bloat v4.0 refuses |
| 3 | One critic vs. two gates | **v4.0.** `creative-critic` is now **Kobe only**; the new `servicepow-skeptic` carries the adversary, without the production reasoning |
| 4 | v4.0's own count: §8B says 34, three other places say 31 | **34.** Corrected on import; v4.0 violated its own LB50 three times |
| 5 | v4.0's own field count: §S2 says ten, §8B says "eleventh" | **Tenth.** Corrected on import |
| 6 | Check 34's identity: claim file said sport/domain accuracy | **Cited real reference**, per the real file |
| 7 | Rough card vs. one scorecard | **v4.0's two tiers.** The 9-axis card fixes rough cuts and may never clear a deliverable |

Two things of mine survived because they are strictly additive: the **LB51 state amendment**
(owner-ordered 2026-08-26, post-dating v4.0) and the machine-enforced structural validation of the
skill system itself.

### What was deliberately not imported

- **The v3.5–v3.9 changelog preamble** — Drive's change log already holds it.
- **The LB renumbering table** — bookkeeping for citations that no longer exist.
- **The Install-Proof Rule and "announce v4.0 on load"** — they solve *"is the skill actually
  installed?"*, a claude.ai packaging problem. In git the file **is** the proof.
- **Drive's concurrency / LOCK / RETIRED protocol** — another tool's bookkeeping; already rejected
  on 2026-08-25.
- **Empty pattern-library scaffolding** (hook swipe file, human-moment index, sound index) and the
  Brand Device Kit build-out — v4.0 itself calls these optional until they earn their place.
- **The stage-hat names** (Paul / Steve / D-Wade) — personal shorthand. The load-bearing part is
  **One Brain**: they are hats worn by one director, never agent handoffs, and artifacts cross
  stage boundaries while interpretations never do. That doctrine was kept; the names were not.
  "Kobe" stays, because it is the name of the score.

### What was corrected rather than imported

`virality_predictor` is recorded in v4.0 as *"failed both attempts — not part of the pipeline"*
(2026-08-17). That is stale: the tool is live in the MCP and its schema was read on 2026-08-25. It
is held as **advisory only, never a gate**, with a re-test noted.

### How claims are stored

v4.0's research anchors — Meta's 1.1M creatives, $1.29B across 578,750 creatives, Taboola's 500M
impressions, the WPM figures — are load-bearing but were **not independently verified here**. They
are stored labelled *source: ad-producer v4.0, 2026-08-20*: CONFIRMED as "v4.0 states this", not
as "this is measured truth". The same applies to the n=2 taste-offset history.

## Consequences

**Good**

- Every lesson, boundary, threshold and protocol that changes what gets made now sits in a file
  the working tools can actually read.
- The ~600-checks-per-ad problem is answered structurally: blocking checks in the playbook,
  advisory content in reference files loaded only at the stage that needs them.
- Volatile facts have dates. A stale model name is now visibly stale rather than quietly wrong.
- Kobe and the Skeptic can no longer trade against each other, because they are different skills
  with different inputs.

**Costs and open risks**

- **The four QC scripts' source is still absent.** Checks 26–28, 32 and 33 are enforced by
  judgment, and are labelled as such. They are not measured until the scripts land in
  `playbooks/ads/scripts/`.
- Two files v4.0 cites — its creative-performance engine reference and its shot-motion-and-staging
  reference — were never pasted. The Hook Tournament's full mechanics and the five motion axes'
  detail live there.
- The `servicepow-skeptic` skill's own text from v4.0 was never provided; the skill here was
  written from v4.0 §7D's description of it.
- More files means more places to look. The mitigation is mechanical: the validator fails the
  build if a number is defined in two places.

## Alternatives rejected

**Keep v4.0 as the canonical monolith.** Rejected: unreachable from Claude Code, and v4.0's own
§8B says the monolith guarantees silent skipping.

**Keep the skills and summarize v4.0.** Rejected: the summary is what we already had, and it lost
42 of 52 lessons and every threshold.

**Merge everything into one giant playbook.** Rejected for the reason v4.0 gives for its own
tiering — a document nobody can hold is a document nobody runs.
