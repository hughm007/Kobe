---
name: servicepow-video-production
description: >
  The executable production spine for Service Pow video advertisements — codified from the
  first complete client-brand production (2026-09-02). Owns the path from approved concept to
  delivered, QA-passed advertisement: capability-aware shot design, per-shot risk routing,
  preflight before any generation spend, generate/composite/illustrate/real-asset/request-
  footage selection, recovery before regeneration, uniform-timebase assembly, the silent
  visual master, composited text, decoupled audio, the three QA layers, targeted revision,
  and learning capture. Activates for any request to produce, assemble, revise, or export a
  video advertisement or ad variant once a concept exists. Strategy, concepts and scripts
  belong to the campaign chain; this skill turns them into the finished file.
license: Proprietary — Service Pow internal. Not for redistribution.
metadata:
  version: 1.1.0
---

# Video Production — the executable spine

## PURPOSE

One production proved the path; this skill keeps it. The advertisement is the product;
individual AI shots are replaceable components. The system's job is to know what to make,
how to make it, what not to attempt, and when to ask the client for something real.

## TRIGGER

Activates when a concept/script exists and the request is to produce, assemble, revise,
export, or variant a video advertisement. Upstream (strategy, concept, script, storyboard)
belongs to the campaign chain; per-shot vendor mechanics belong to
`../servicepow-higgsfield-production/` (which owns routing); this skill owns the end-to-end
execution and its gates.

## INPUTS

The approved concept/script with timing table · the client KB **including the asset
register** (real files, provenance, what must never be generated) · the capability evidence
in `../servicepow-higgsfield-production/references/shot-routing.md` · **this skill's own
toolkit in `scripts/`** — `scripts/servicepow_video.py` (state ledger, preflight, generate/
recover, assemble, freeze/verify, econ), `scripts/servicepow_qc.py` (QA1 harness),
`scripts/servicepow_overlay.py` (composited text), `scripts/servicepow_kenburns.sh`
(illustrated-lane motion), with environment bootstrap in `scripts/README.md` and the plan
schema in `templates/plan-example.json`.

## WORKFLOW

1. **Client truth + assets.** Read the brief, brand guide, compliance constraints, and the
   asset register. The register question is mandatory: *what real material already exists
   that should appear in this ad?* Absence from the register is evidence about the register,
   not the world.
2. **Capability-aware shot design.** Design the ad around what the stack does well. Every
   shot declares a JOB; a shot whose removal costs only atmosphere is cut. Shots the stack
   repeatedly fails at (see routing evidence) are designed OUT, not attempted harder —
   without ever accepting inaccuracy as the price.
3. **Risk routing per shot** — the canonical route enum owned by
   `../servicepow-higgsfield-production/references/shot-routing.md` (GENERATE /
   REFERENCE-GROUNDED / COMPOSITE / ILLUSTRATE / REAL-ASSET / REQUEST-FOOTAGE / EDIT-ONLY /
   AVOID). Readable text,
   numbers, offers and disclosures are **always composited**, never generated (BC-42).
   Real footage requests use `references/real-footage-requests.md` and go to the owner
   explicitly.
4. **PREFLIGHT before any spend** (BC-43): toolchain present · delivery path proven · model
   can reach the QC floors it will be graded against · prompts clear the motion floor ·
   voice route proven by producing audio, not asserted.
5. **Generate / produce.** Silent visual masters only (`generate_audio false`). Every
   client-side failure checks the vendor job list before paying again — completed jobs are
   recovered, not regenerated. Every asset is ingested with hash + version into the state
   ledger.
6. **INSPECT before accept** — every generated asset individually, against
   `references/qa2-physical-realism.md`. Rejections carry a structured reason; accepted
   assets LOCK.
7. **Assemble.** Uniform timebase always (`fps=30,settb=AVTB` concat filter — never
   stream-copy concat across mixed-fps sources). Composite text layers. Endcard from real
   brand files only.
8. **Audio, decoupled** (per `../servicepow-audio-director/`): script → voice → **trim
   silence before judging fit** → mix → loudness QA. A voice that cannot fit the locked
   timing windows fails before taste enters.
9. **QA, three layers, in order:** QA1 technical (machine harness) · QA2 physical + trade
   realism (BC-41, `references/qa2-physical-realism.md`) · QA3 advertising self-check
   (`references/qa3-precheck.md`) feeding the **single readiness authority:
   `../servicepow-creative-critic/` owns THE client-ready score (ServicePow-6, BC-22)** —
   this skill's client_confidence field is a logging signal, never a rival verdict. The
   Skeptic pass (BC-23) runs isolated: a fresh agent with an Isolation Packet; an
   in-session review panel does not satisfy it.
10. **Targeted revision.** Freeze → repair only the failed element → verify by hash that
    everything else is byte-identical. Approved work never regresses.
11. **Owner review** — the owner's scores are the datum; they are recorded, never invented.
12. **Delivery + learning capture.** Export specs verified; observations logged per
    `references/pipeline.md` §Learning; failures become durable rules only with repeated
    evidence.

## DECISION RULES

- **Design around capability; never around accuracy.** Routing a hard shot to real footage
  is success, not failure.
- **Recover before regenerate.** A client-side failure is not a generation failure.
- **The visual master is silent.** No model is chosen for its bundled audio.
- **Text is composited.** If a viewer must read it, a model must not paint it.
- **One good result is an observation, two a pattern, three a candidate rule.**

## QUALITY GATES

BC-41 (physical + trade realism) · BC-42 (composited text discipline) · BC-43 (preflight
before spend) · plus the existing master checks BC-01..BC-15 via the machine harness and
the dual gate (critic + skeptic) run once, late, on frozen artifacts.

## POLICY BINDINGS

- `../_servicepow/policies/claims-and-proof.md` — every claim in copy or on screen.
- `../_servicepow/policies/generation-and-spend.md` — the cost ladder; preflight is step 0.
- `../_servicepow/policies/realism-and-disclosure.md` — disclosure duties for generated media.
- `../_servicepow/data/roles.md` — the owner/APPROVER owns scores and final readiness.

## OUTPUT CONTRACT

Per ad, in the client KB campaign folder: the shot manifest with routes and states · the
frozen, hash-locked master (silent) and delivered master (mixed) · QC results for all three
layers · the structured observation log rows · any real-footage requests issued · the owner
review record (scores PENDING until actually given).

## HANDOFF

Concept/script defects → back to the campaign chain. Vendor/model routing evidence →
`../servicepow-higgsfield-production/`. Live performance data, when campaigns run →
the learning loop. This skill owns no strategy, no claims rulings, and no spend approvals.

## REFERENCE FILES

- `references/pipeline.md` — the executable path, stage by stage, with the proven fixes.
- `references/qa2-physical-realism.md` — the QA2 checklist and rejection vocabulary.
- `references/real-footage-requests.md` — the request format and standing 911-class examples.
- `references/qa3-precheck.md` — the pre-critic advertising self-check (no verdict authority).
- `scripts/README.md` — the toolkit, environment bootstrap, and platform limits.
- `templates/plan-example.json` — the plan schema `scripts/servicepow_video.py init` consumes.
