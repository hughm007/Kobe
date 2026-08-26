---
title: Video Production — how ads get made and what stops them shipping
type: playbook
client: internal
owner: Karl
status: active
created: 2026-08-25
updated: 2026-08-26
tags: [ads, video, quality, qc, canonical]
source: Drive "ServicePow OS 2" — 08_VIDEO_QUALITY_STANDARDS.md, 19_PRODUCTION_LEARNINGS.md, 17_REJECTED_CREATIVE_LIBRARY.md, 00 §18-45 (synced 2026-08-25); v4.0 deltas reconstructed from CLAIM_servicepow-ad-producer_v4.0 + the 35_ install ledger (2026-08-26). See decision 0004.
---

# Video production

> ## ⚠ THIS FILE OWNS THE BLOCKING-CHECK LIST AND ITS COUNT
> **Canonical (decision [0004](../../knowledge/decisions/0004-canonical-source-of-truth.md),
> 2026-08-26).** The blocking checks, the standing laws and the storyboard gate live here and
> nowhere else. Every other file — skills, scorecards, Drive mirrors, the claude.ai
> `servicepow-ad-producer` skill — **points at this file and must not restate the count** (LB50:
> one number, one file; and within a file, one place).
>
> This inverts the previous line, which said the claude.ai skill won on conflict. A canonical
> source that the tools doing the work cannot read is not canonical.

**Where production runs:** the graphics/edit layer is Remotion — code-rendered, delegated to
Claude Code (`delegate_coding_task`) since it needs Node + Chromium. Generation runs through
Higgsfield, routed by `servicepow-higgsfield-production`. **Orion's lane: concepts, hooks,
scripts, storyboards, briefs, QC thinking, and drafting — production spend and publishing are
always Karl's.**

## The pipeline (never bypass a gate because production is behind)

BRIEF → CONCEPTS (A believable / B creative / C performance; recommend one) → concept
gate → SCRIPT → script gate → STORYBOARD → storyboard gate → real/AI decision →
REFERENCES → KEYFRAMES → keyframe gate → GENERATION → take selection → EDIT → rough cut
→ QC → revision → **human watch** → CLIENT READY → client review → FINAL → publish →
performance analysis → learning logged.

**The still frame is where quality is cheap:** frame fix = 1 image job · clip fix =
130+ credits · master fix = a rebuild. Catch it early or pay for it late.

<!-- CANONICAL: blocking-check-count = 34 -->
## What blocks delivery — **34 blocking checks**

- **Machine QC** (1–15): resolution/fps/format · true loudness (LUFS) · no frozen or
  black sections · motion floor per clip AND per master shot (slow-mo is the documented
  5-of-7 failure) · no flash cuts · aspect + duration declared and matched · no
  letterbox · opening dead-space · expected strings (phone, URL, client) OCR-verified
  on screen.
- **Compliance** (16–20): every claim substantiated in writing or absent · **no
  synthetic person as customer/reviewer/endorser** · platform AI disclosure set ·
  ad-to-landing-page parity confirmed by opening the page · rights cleared.
- **Human** (21–25): correct client + brand assets · ServicePow-6 score ≥8 with no axis
  ≤6 · independent skeptic pass · angle declared and rotated · **a human watched it end
  to end** (the only semantic gate — proven three times in one day).
- **Source-side** (26–28): looped/layered audio ASR-proven speech-free BEFORE use ·
  master speech matches declared lines exactly · burned text inside the 15–70% platform
  safe area.
- **Enforcement** (29–31): preflight proven before spend · every clip gate-passed by
  md5 · every shot names a motion axis.
- **v4.0 additions (32–34):**
  - **32 — performance gate.** Spoken and on-screen delivery is *measured*, not eyeballed.
    The recorded failing case is the 911 Drain price line at **~242 WPM**: too fast to be
    read or heard. Measured by `servicepow_performance_qc.py`.
  - **33 — impossible human speed.** Biomechanical plausibility: no human moves that fast.
    Measured by `servicepow_biomech_qc.py`. (This is LB52 in check form — the ceiling, not
    just the floor.)
  - **34 — cited real reference.** The enforcement arm of LB51: every shot claiming a real
    reference names one that can be opened *now*. *(The v4.0 claim file calls 34
    "sport/domain accuracy"; the install ledger calls it "cited real reference" — resolve
    against the skill text when it is available.)*

**A gate that could not run is a BLOCK, not a note.** "QC not run" stops delivery.

## The storyboard gate — **ten required fields, and there is no eleventh**

`Real-ref` has existed since v3.1. The defect was never a missing field — it was a field that
accepted an unverifiable answer. v4.0 deliberately **refused to add an eleventh box**, because a
duplicate box papers over an enforcement failure instead of fixing it. Field detail:
[`.claude/skills/servicepow-storyboard-director/references/shot-fields.md`](../../../.claude/skills/servicepow-storyboard-director/references/shot-fields.md).

## The standing laws (each one was paid for)

- **Logo Law (LB24):** marks come from real client files, composited — never painted by
  a model. A nearly-right mark reads faker than none.
- **Performed-Emotion Ban (LB25):** no generated celebrations at readable distance —
  back-of-head, stillness, small business.
- **Crowd-Voice Law (LB26):** unspecified crowd vocals are gibberish; one scripted
  chant with rhythm or strip intelligibility; ONE continuous audio bed per ad.
- **Phone-Is-The-Camera (LB27):** no second phone, no screens shown to camera.
- **Verification Honesty (LB29):** never claim QC that wasn't machine-checked AND
  human-watched. Trusting the prompt over the pixels shipped a hovering man.
- **In-World Reason Test (LB31):** every on-screen action needs a reason inside the
  scene. "To show the viewer the product" is not one. (The spinning-lanyard man and the
  home-screen-to-camera woman both died on this.)
- **LB49 — VAD by safe error direction.** An ASR gate chooses its voice-activity detection
  by which error direction is safe to be wrong in.
- **LB50 — one number, one file.** A count written in two files drifted in six hours.
  A count lives in exactly one file — **and within that file, in exactly one place.**
  Every summary points at it rather than restating it. *(The second half was earned on day
  one of v4.0: a session misread the release note because the note restated a count.)*
- **LB51 — THE UNIVERSAL REAL-REFERENCE LAW** (supersedes LB30). Real footage of the real
  event is consulted before the storyboard, **cited and openable** — "I looked" is not
  evidence. No reference found = surfaced to the owner by name, never accepted silently.
  - **Amendment — reference the STATE, not just the scene** (owner-ordered 2026-08-20,
    in force): where a shot depicts a **state** — broken/working, before/after,
    dirty/clean, failing/fixed — **each state is referenced separately.** One reference for
    "a drain" is not compliance. `Real-ref` carries the **BEFORE** source + observable
    markers, the **AFTER** source + observable markers, and **THE DIFFERENCE** — what the
    viewer must *see* change, in one line. If that line cannot be written, the shot pair
    proves nothing and goes back to the board.
  - **Why:** the transition *is* the proof. An unreferenced transition is an unsubstantiated
    claim in visual form — adjacent to checks 16–20, not merely to craft.
  - **Why trades are the hardest case:** the viewer is a domain expert in the exact moment
    depicted. A homeowner with a blocked drain has stood over that drain. Generic "AI
    plumbing" reads false instantly to the only person who matters. **Real client jobsite
    footage beats any generated pair, and it is free.**
- **One-sided checks are half checks (LB52):** every floor gets asked what its ceiling
  is (a crowd moving faster than humanly possible once passed everything). Now enforced as
  check 33.
- **Three-state structure:** before / during / after, each referenced — and the
  "during" state is what real client footage exists for; it cannot safely be generated.
- **The Claude-Catch Law:** noticing an obvious problem creates an obligation — if it
  violates written law, fix it and report; if it's a judgment call, ask before delivery
  with a recommendation and cost. The spec is not a shield. Tag catches
  CLAUDE-CAUGHT / OWNER-CAUGHT; the ratio is the KPI of a system learning to see.

## Scoring — the ServicePow 6 (the only client-ready score)

doesn't-look-AI · hook inside 2s · human presence · format fit · audio design ·
message + CTA clarity. **Floor 8.0, no axis ≤ 6.** Machine QC and compliance run BEFORE
any score — taste never overrides a technical or legal failure. Nothing is CLIENT READY
without both the scorecard pass and an independent skeptic pass.

## Hard-won craft (from the production learnings)

A visible speaking mouth with no audio is worse than no shot · a payoff without a
visible cause is an assertion — show the labour · diagnose configuration before blaming
the model · price the model before assuming it · uniform slowness is its own robot —
real speech changes speed within a sentence · emotion is sourced like a prop (real
accounts gave "tired, vindicated" where "relieved" produced "pleased") · the pause is
the performance · reference the format, not just the moment · ~⅓ of generated material
ships; sunk credits never justify weak clips · separate the brief by placement — a muted
homepage hero and a scroll-stopping feed ad are different films.

## QC scripts (live in the claude.ai skill package — source not yet in this repo)

| Script | Version | State |
|---|---|---|
| `servicepow_qc.py` | v1.6 | `--preflight`, `--gate-clips`, clip-gate ledger |
| `servicepow_source_qc.py` | v1.1 | source verification |
| `servicepow_performance_qc.py` | v1.1 | check 32. Self-test 6/6; **ASR boundary UNVERIFIED** |
| `servicepow_biomech_qc.py` | v1.0 | check 33. Self-test exits 0 |

**Gap:** the source is not in this repo, so checks 32–33 are currently enforced by judgment
rather than measurement here. Paste the scripts to close it.
