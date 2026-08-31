---
title: Knowledge Index
type: research
client: internal
owner: Karl
status: active
created: 2026-08-24
updated: 2026-08-25
tags: [index, knowledge]
---

# Knowledge Index

The curated map of what this office knows. Read it at the start of a session; update it
whenever you add to `knowledge/`.

This is a map, not an archive. Keep entries to one line each — enough to know whether to
open the file.

---

## Decisions

| Date | Decision | Status |
|---|---|---|
| 2026-08-24 | [Workspace structure and conventions](decisions/0001-workspace-structure.md) | Accepted |
| 2026-08-24 | [Websites built as code with Claude, hosted on Vercel](decisions/0002-web-delivery-model.md) | Accepted |
| 2026-08-25 | [Orion and the Company OS — who governs what](decisions/0003-orion-and-the-company-os.md) | Accepted |

## Learnings

Grouped by theme. Add themes as they emerge — don't force a learning into a heading that
doesn't fit.

### Advertising
- [2026-08-25 — Checks beat prose](learnings/2026-08-25-checks-beat-prose.md): the v8
  "2:07 AM" kill showed binary blocking checks catch what quality prose never does;
  the 31-check gate exists because scores alone passed a dead ad.
- [2026-08-26 — Correctness is the floor, conversion is the objective](learnings/2026-08-26-correctness-floor-conversion-objective.md):
  Owner-directed promotion; produced the DR lens and the Performance Challenger Rule.
- [2026-08-31 — Frames catch what code review cannot](learnings/2026-08-31-frames-catch-what-code-review-cannot.md):
  15 defects across 3 build rounds, all invisible to clean code — **third occurrence, promoted** (probe-pass advisory in the video playbook).
- [2026-08-31 — Claim qualifiers drop in re-transcription](learnings/2026-08-31-claim-qualifiers-drop-in-transcription.md):
  the same qualifier dropped twice by the same author; the fix is single-source claims, never retyping.
- [2026-08-31 — The offer line gets the shortest hold](learnings/2026-08-31-offer-line-shortest-hold.md):
  second occurrence after the 911 Drain price line; sort the string table by dwell before render.
- [2026-08-31 — Placement-relative copy reading](learnings/2026-08-31-placement-relative-copy-reading.md):
  four S3/S4s from strings that self-refuted on their own surface, picture, or loop order.
- [2026-08-31 — Code-rendered films freeze without a boil](learnings/2026-08-31-code-rendered-films-freeze-without-a-boil.md):
  73% still images until every stroke boiled; measured down to declared calm holds.

### Clients and process (advertising ops)
- [2026-08-31 — Gates need frozen artifacts](learnings/2026-08-31-gates-need-frozen-artifacts.md):
  two mid-gate mutations in three days; freeze with SHA-256 before any gate runs.
- [2026-08-31 — Harness instrument limits](learnings/2026-08-31-harness-instrument-limits.md):
  four measured limits (silent masters, freeze-gate downscale blindness, wipe false-positives, OCR digits/apostrophes); read the instrument before trusting a FAIL.
- [2026-08-31 — A judged panel beat solo authorship](learnings/2026-08-31-judged-panel-beat-solo-authorship.md):
  0-blocking checker round one vs 37 blocking findings solo; gate-verdict update pending.

### Web
*None yet.*

### Content
*None yet.*

### Clients and process
*None yet.*

## Research

| Date | Subject | File |
|---|---|---|
| 2026-08-25 | Design intelligence — the ServicePow Style Bank archetypes, hard laws, and how they translate to static + motion work | [research/design-intelligence.md](research/design-intelligence.md) |

---

## Patterns to watch

Where a theme is forming but hasn't earned a playbook change yet. When something here
reaches three supporting learnings, promote it into the relevant playbook and move it to
the section below.

| Pattern | Supporting learnings | Confidence |
|---|---|---|
| Binary gates outperform judgment scores for creative QA | 1 (checks-beat-prose) | Forming — already codified as the playbook's blocking-check list, so treat as adopted practice pending local evidence |
| Rendered frames catch what code review cannot | **3** (three build rounds, one file) | **Promoted 2026-08-31** — probe-pass advisory in `playbooks/ads/video-production.md` |
| Claim qualifiers drop on every re-transcription | 2 (this file + the 08-28 control catch) | Watching — promote on a third |
| The offer/price line gets the shortest hold | 2 (911 Drain price line · intro offer line) | Watching — a third promotes it into check 32's scope for burned text |
| "Secondary-location" resolution misses (a fix applied at the named spot while other cells still assert the old answer) | 3 (911 Drain rounds 10, 14, 15) | **Due for promotion** — evidence in the 911 Drain campaign bible §14; needs its learning file written and a playbook line |
| Flash-cut detector false-positives on multi-frame wipes | 2 (gate rounds 1 and 2) | Watching — harness fix proposed (P4) |

## Promoted to playbooks

Learnings that graduated into settled practice. Kept here so the evidence trail behind a
playbook rule stays visible.

| Pattern | Playbook | Learnings behind it |
|---|---|---|
| Blocking checks + ServicePow-6 scoring before any ad ships | [playbooks/ads/video-production.md](../playbooks/ads/video-production.md) | Imported from the Drive OS (19_PRODUCTION_LEARNINGS); local trail starts with checks-beat-prose |
| Performance Challenger Rule — production QA paired with performance-marketing QA; clever-mechanism packs ship a problem/solution-first challenger and the market decides | [playbooks/ads/video-production.md](../playbooks/ads/video-production.md) (Doctrine, advisory tier) + the creative-critic Direct-Response lens | [correctness-floor-conversion-objective](learnings/2026-08-26-correctness-floor-conversion-objective.md) — promoted at occurrence #1 by explicit Owner directive, recorded as such |
