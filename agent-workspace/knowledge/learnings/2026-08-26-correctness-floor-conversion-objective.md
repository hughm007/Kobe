---
title: "Production QA cannot see persuasion — correctness is the floor, conversion is the objective"
type: learning
client: 911drain
owner: Karl
status: active
created: 2026-08-26
updated: 2026-08-26
tags: [ads, direct-response, qc, kobe-system, owner-caught]
---

# Production QA cannot see persuasion — correctness is the floor, conversion is the objective

> Twelve adversarial gate rounds made a storyboard nearly impossible to attack — and the
> Owner's read still found the commercial weakness in one sitting, because no gate in the
> system was asking whether the phone would ring.

## What we did

The 911 Drain "Look Us Up" pack (2026-08-26): twelve isolated Skeptic Pass-1 rounds on the
storyboard, converging 7 blocking findings → 0 across eight blocks and four conditional
passes; ~50 defects caught pre-spend at $0. The Owner then read the board twice.

## What happened

| Metric | Production QA (the gates) | The Owner's read |
|---|---|---|
| Compliance/claims defects found | dozens, all fixed | 0 new |
| Execution/spec defects found | dozens, all fixed | 0 new |
| Commercial-structure findings | **0 in twelve rounds** | trust-first ordering caps conversion; no plumbing visible until 9s of 17s; CTA educates instead of asking; a caption "written by a lawyer"; a 3s scene not earning its 17.6% of runtime |

**Source:** Campaign Bible §14 (rounds 1–12) and the Owner's two reads, recorded verbatim-
faithfully in `knowledge/production-log/2026-08-26-lookusup-pass1-findings.md`.

## What we think it means

An adversarial gate tuned to risk, compliance, and executability will drive those defect
classes to zero while remaining structurally blind to persuasion — and a system with only
that gate will polish an ad into defensibility rather than conversion. The Owner's framing,
adopted as doctrine: *"If we removed 30% of the cleverness and made this 30% more
persuasive, would the phone ring more?"* **Confidence: High** for "the gates measured what
they were built to measure and nothing else" (directly observed); **Medium** for "the
challenger structure converts better" — that is exactly what the market test exists to find
out, and nobody gets to decide it on paper.

## How far it generalises

- [ ] Specific to this client
- [ ] Industry/audience
- [ ] Channel
- [x] General principle of the production system: every QA regime optimizes the ad toward
  what it can see. Pair production QA with performance-marketing QA, always.

## What we'd do next

Run the control-vs-challenger test (metric chain: 3-sec hold → 25% view → CTR → calls →
CPQL) and bring the numbers back to this file — the market's answer upgrades or downgrades
the Medium confidence above.

## Promotion

- [x] Added to `../index.md`
- [x] Seen before? No prior occurrence — this is occurrence #1
- [x] Promoted immediately — NOT by the three-occurrence rule but by **explicit Owner
  directive** ("I would explicitly correct in the Kobe system"): the Performance Challenger
  Rule now lives in `../../playbooks/ads/video-production.md` (Doctrine, advisory tier) and
  the Direct-Response lens in the `servicepow-creative-critic` scorecard. Recorded honestly
  as directive-driven promotion, occurrence count 1.

## Related

- `../production-log/2026-08-26-lookusup-pass1-findings.md` — the full gate history and both
  Owner reads
- `../../clients/911drain/campaigns/2026-08-26-storyboard-rebuild/challenger-board.md` — the
  first challenger built under the rule
