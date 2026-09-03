---
title: "Video creative funnel and shot-level model router"
type: reference
client: internal
owner: APPROVER
status: active
created: 2026-09-02
updated: 2026-09-02
tags: [video, funnel, routing, qa]
---

# The video ad production funnel
> **OWNERSHIP MOVED (2026-09-02):** the shot-level ROUTER and its rules now live canonically
> in the installed skill `servicepow-higgsfield-production` (`references/shot-routing.md`),
> and the executable pipeline in `servicepow-video-production`. This document remains as the
> funnel narrative; where they disagree, the installed skills win.

**Governing principle: the danger is not ugly imagery. It is beautiful imagery for a weak
advertisement.** Everything before Stage 8 is free. Generation is the expensive part and it
comes late on purpose.

## Stages 1-7 — no generation, no spend
1. **CLIENT TRUTH.** Who the client is · what they actually sell · who buys · why · what
   problems cause action · differentiators · **verified claims** · proof that exists ·
   **the asset register (what real files exist and where)** · what may never be generated or
   claimed · desired customer action. *No concept enters production without this.*
2. **CUSTOMER / MARKET INTELLIGENCE.** Pains, desires, purchase triggers, objections,
   anxieties, misconceptions, decision criteria, local competitors, competitor messaging and
   creative patterns, category cliches, underserved angles. Label every line FACT /
   OBSERVATION / INFERENCE / HYPOTHESIS. The output is better ad ideas, not a research report.
3. **MESSAGE TERRITORIES.** Materially different territories appropriate to this client —
   not a checklist applied mechanically.
4. **CONCEPT COMPETITION.** 8-12 materially distinct concepts. A concept is a central idea,
   never a shot. "Close-up of wrench" is not a concept. Each records: name · audience ·
   customer tension · central idea · hook · message · proof/mechanism · offer · CTA · why it
   should work · what makes it different · required assets · generation difficulty ·
   expected cost · risk · best platform.
5. **CONCEPT SCORE.** Scroll-stop · relevance · clarity · believability · persuasive power ·
   client differentiation · emotional energy · proof strength · platform fit · production
   feasibility · asset availability · variant potential. **"Looks cinematic" may not dominate.**
   Advance ~3.
6. **ADVERSARIAL CONCEPT REVIEW.** Could this advertise any company? Any plumber? Where is
   the business? What does the viewer learn? Where is the offer and the CTA? Are we leaning on
   cinematic imagery because the idea is weak? Does it require the generator to do something
   it is historically bad at? Kill weak concepts; do not repair indefinitely.
7. **HOOK TOURNAMENT.** Hooks are **ideas, not camera moves**. A tracking shot is not a hook.
   Score on first-second attention, curiosity, specificity, relevance, believability, message
   fit, visual possibility.

## Stage 8 — SHOT JOB DESIGN
Every shot declares a JOB: hook · problem demonstration · service demonstration · proof ·
mechanism · transition · brand · offer · CTA.
**Test: if this shot were removed, what would the ad lose?** If the answer is "mostly
atmosphere", challenge it or cut it. No cinematic filler.

## Stage 9 — SHOT RISK CLASSIFICATION, then route
| Risk | Contents | Requirement |
|---|---|---|
| LOW | environment, scenery, broad atmosphere | route and generate |
| MEDIUM | human presence, vehicle, work setting | route + review |
| HIGH | hands · tools · phones · screens · machinery · text · logos · precise trade work · anatomy · specific product interaction | **reference image mandatory where feasible**, plus correctness QA |

## THE SHOT-LEVEL MODEL ROUTER (provisional — learns from outcomes)
| Shot job | Provisional route |
|---|---|
| Neighbourhood / residential exterior / arrival environment / service-area atmosphere | **Soul Location** candidate |
| Realistic general motion | **Seedance 2.0** candidate |
| Illustrated / graphic / explainer / diagram | **Nano Banana** candidate (Lane B) |
| Cheap previs, concept test, blocking | **Veo 3.1 Lite** — never a client-grade final |
| Specialised tool / device / trade interaction | reference-grounded generation + mechanical QA; **model chosen only after a controlled test** |
| Client brand assets — logo, van, wordmark | **real supplied files. Never generated (LB24)** |
| Voiceover | separate audio subsystem — not a video-model feature |

**This table is provisional and must not be frozen.** It updates from accepted/rejected data.

## Stage 10 — CHEAP FIRST-ARTIFACT TEST
Produce the best 3-5 seconds only. Would I keep watching? Does it look real? Does it feel like
an ad? Does it feel like *this business*? Do I understand something? Would Service Pow show
this to the client? **If not, STOP** — diagnose the earliest failing stage. Never generate
another 30 seconds to rescue a weak opening.

## Stage 11 — GENERATE -> INSPECT -> ACCEPT/REJECT -> LOCK
Only inspected, accepted, locked assets may proceed. **Rejection reasons are structured data**,
one of: `AI_LOOK · BAD_ANATOMY · BAD_DEVICE · WRONG_TOOL · MECHANICALLY_IMPOSSIBLE ·
WRONG_TRADE · GENERIC · OFF_BRAND · BAD_MOTION · UNUSABLE_COMPOSITION · BAD_TEXT ·
CONTINUITY_FAILURE · WEAK_PERFORMANCE`.
Every record carries `model x shot_job x risk x verdict x reason`, which is what makes the
router learn a **failure rate per model per shot type** instead of an opinion.

## Stage 12 — ASSEMBLY
**Generation creates raw material. Assembly creates the advertisement.** Edit, pacing, text,
branding (real assets), voice, music, SFX, CTA. Never expect the generator to finish the ad.

## Stage 13 — THREE QA LAYERS, all must pass
- **QA1 TECHNICAL** — resolution, aspect, audio, frames, export, safe area, mobile
  readability, artifacts. *(Existing `servicepow_qc.py` covers most of this.)*
- **QA2 PHYSICAL / REALISM** — anatomy, device correctness, tool correctness, trade
  correctness, brand correctness, continuity, physical plausibility. **NEW — nothing covered
  this before.**
- **QA3 ADVERTISING** — hook, clarity, persuasion, proof, brand, offer, CTA, pacing,
  memorability, client confidence. **NEW — nothing covered this before.**

## Stage 14 — CLIENT-CONFIDENCE GATE
*"Would Service Pow confidently show this to the owner and say: we made this for your
business, and this is the quality you are paying us for?"* Score 1-10. **Below 8 is not
client-ready.** Scores are never inflated to complete a run.

## Stage 15 — VARIANT ENGINE
Only after the base ad works. Vary the smallest useful layer — hook, opening shot, message
angle, CTA, offer, voice, text, order — preserving approved assets. Never rebuild the whole ad.

## Stage 16 — PERFORMANCE LEARNING
When ads run live: hook rate, watch time, hold rate, CTR, CPC, CPL, leads, calls, conversion,
client feedback — joined back to concept, hook, shot types, models, edit, offer and CTA. This
is how Service Pow learns what *sells* rather than what looks good.

## THE THREE STATES — never collapsed
**TECHNICALLY FUNCTIONAL** (the pipeline ran) != **CREATIVELY ACCEPTABLE** (meets our
internal standard) != **CLIENT READY** (we would deliver it and charge for it).

## TWO PRODUCTION LANES — kept separate, judged separately
- **LANE A — REALISTIC SERVICE-BUSINESS VIDEO.** Primary. Currently ~4/10 owner-rated.
- **LANE B — ILLUSTRATED / GRAPHIC / EXPLAINER.** Secondary but **currently stronger
  (~7/10)**. Genuinely better for: explaining a process, simplifying an abstract offer,
  education, animated hooks, diagram storytelling, pain-point visualisation, retargeting,
  hybrid real-footage-plus-illustration.
A strong illustrated ad is not inferior for failing to be photoreal. **Lane B's higher score
must not be allowed to disguise Lane A's weakness** — they are scored on separate scales and
never mixed by accident.
