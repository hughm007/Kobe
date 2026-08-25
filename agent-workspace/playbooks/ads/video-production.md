---
title: Video Production — how ads get made and what stops them shipping
type: playbook
client: internal
owner: Karl
status: active
created: 2026-08-25
updated: 2026-08-25
tags: [ads, video, quality, qc]
source: Drive "ServicePow OS 2" — 08_VIDEO_QUALITY_STANDARDS.md, 19_PRODUCTION_LEARNINGS.md, 17_REJECTED_CREATIVE_LIBRARY.md, 00 §18-45 (synced 2026-08-25). Canonical enforcement lives in the servicepow-ad-producer skill (claude.ai workspace); on any conflict of substance, the skill wins.
---

# Video production

**Where production actually runs:** the `servicepow-ad-producer` skill (v4.0) in the
claude.ai workspace drives generation through Higgsfield; the graphics/edit layer
(end cards, captions, counters) is Remotion — code-rendered, which Orion can delegate to
Claude Code (`delegate_coding_task`) since it needs Node + Chromium. **Orion's lane:
concepts, hooks, scripts, storyboards, briefs, QC thinking, and drafting — production
spend and publishing are always Karl's.**

## The pipeline (never bypass a gate because production is behind)

BRIEF → CONCEPTS (A believable / B creative / C performance; recommend one) → concept
gate → SCRIPT → script gate → STORYBOARD → storyboard gate → real/AI decision →
REFERENCES → KEYFRAMES → keyframe gate → GENERATION → take selection → EDIT → rough cut
→ QC → revision → **human watch** → CLIENT READY → client review → FINAL → publish →
performance analysis → learning logged.

**The still frame is where quality is cheap:** frame fix = 1 image job · clip fix =
130+ credits · master fix = a rebuild. Catch it early or pay for it late.

## What blocks delivery (summary of the 31 blocking checks)

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

**A gate that could not run is a BLOCK, not a note.** "QC not run" stops delivery.

## The standing laws (each one was paid for)

- **Logo Law (LB24):** marks come from real client files, composited — never painted by
  a model. A nearly-right mark reads faker than none.
- **Real-Reference Law (LB30/LB51):** real footage of the real event is consulted before
  the storyboard, **cited and openable** — "I looked" is not evidence. No reference
  found = surfaced to the owner by name, never accepted silently.
- **In-World Reason Test (LB31):** every on-screen action needs a reason inside the
  scene. "To show the viewer the product" is not one. (The spinning-lanyard man and the
  home-screen-to-camera woman both died on this.)
- **Performed-Emotion Ban (LB25):** no generated celebrations at readable distance —
  back-of-head, stillness, small business.
- **Crowd-Voice Law (LB26):** unspecified crowd vocals are gibberish; one scripted
  chant with rhythm or strip intelligibility; ONE continuous audio bed per ad.
- **Phone-Is-The-Camera (LB27):** no second phone, no screens shown to camera.
- **Verification Honesty (LB29):** never claim QC that wasn't machine-checked AND
  human-watched. Trusting the prompt over the pixels shipped a hovering man.
- **Three-state structure:** before / during / after, each referenced — and the
  "during" state is what real client footage exists for; it cannot safely be generated.
- **One-sided checks are half checks (LB52):** every floor gets asked what its ceiling
  is (a crowd moving faster than humanly possible once passed everything).
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
