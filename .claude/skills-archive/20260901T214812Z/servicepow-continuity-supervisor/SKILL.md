---
name: servicepow-continuity-supervisor
description: >
  Stops separately generated shots from feeling like separate worlds. Establishes and enforces
  continuity bibles for characters, products, locations, lighting, camera, colour and audio, and
  tracks temporal continuity so objects do not reset, people do not teleport, clothing does not
  change and products do not mutate between shots. Use before generation to set the rules, during
  generation to check each new shot for drift, and when reviewing an assembled cut for continuity
  errors. Do NOT use to judge whether a single human performance is believable (that is
  servicepow-human-performance-realism) or to protect brand mark accuracy (servicepow-brand-fidelity).
license: Proprietary — Service Pow internal. Not for redistribution.
metadata:
  version: 1.0.0
  wave: 1
  owns_bible_sections: [continuity-rules, continuity-bibles]
  criticality: high
---

# Continuity Supervisor

## PURPOSE

One world across many generations. Each generation is independent and has no memory of the last —
this skill is that memory.

## TRIGGER

Before generation (set the rules) · after each new shot (drift check) · assembling a cut ·
"does this match" · a shot looks right alone but wrong in sequence.

## REQUIRED INPUTS

- Bible sections 6–7 (shot list, characters)
- Any already-generated shots for this campaign

## OPTIONAL INPUTS

Real client assets · reference images · brand kit

## WORKFLOW

1. **Write the bibles before the first generation** — cheap now, impossible later:
   - **Characters:** face, hair, body, clothing (every item), accessories, emotional progression
   - **Products:** geometry, packaging, scale, colour, materials, logos, orientation
   - **Locations:** architecture, layout, props, furniture, weather, time of day
   - **Lighting:** direction, quality, temperature
   - **Camera:** lens family, height, movement philosophy
   - **Colour:** palette, white balance, grade
   - **Audio:** ambience, room tone, music continuity
2. **Bind each bible to a real reference** wherever one exists — a cited image or asset beats a
   paragraph of description.
3. **Check every new generation against the bibles**, field by field. Note drift precisely
   ("cuff changed from rolled to buttoned"), not vaguely ("looks different").
4. **Track temporal continuity across the sequence:** what state should each object, person and
   location be in at this point in the story? Wet floor stays wet. Sleeves stay rolled. A tool set
   down stays down.
5. **Rule on each drift:** ACCEPT (invisible at delivery size and speed) · FIX (edit tools) ·
   REGENERATE (with tightened references) · RAISE CONFLICT (the shot list demands something the
   models cannot hold).
6. **Write Bible section 8** and keep detail in `continuity/`.

## DECISION RULES

- **Continuity is judged at delivery size and speed**, not frame-by-frame at 400%. A difference no
  viewer can see at 9:16 on a phone is not a defect; one they can is.
- **Faces, products and legible text are zero-tolerance.** These are the drifts audiences notice
  and clients reject.
- **Lighting direction changing between adjacent shots reads as a different world** even when
  everything else matches — check it every time.
- **Prefer reference-driven generation over prompt description** for anything that must match.
- **Regeneration is not the first tool.** Try an edit op before paying to re-roll.
- **A continuity error that survives to the master is a rebuild.** That is why this runs between
  generations, not at the end.

## OUTPUT CONTRACT

Bible section 8 + `continuity/` bibles. Per-shot drift verdicts with the specific field, the
ruling and the action. Returns the drift list and anything requiring regeneration.

## QUALITY GATES

- All seven bibles exist before the first generation
- Every generated shot has a recorded drift verdict
- Zero unresolved face / product / text drift
- Temporal state tracked across the full sequence

## FAILURE CONDITIONS

Raise a CONFLICT when: the shot list requires consistency the current models cannot hold ·
required references do not exist · drift keeps recurring after two tightened regenerations
(the shot needs a different production method, not a third attempt).

## HANDOFF

Drift needing a new production approach → `servicepow-higgsfield-production`. Clean sequence →
`servicepow-cinematography-editor`. Findings feed `servicepow-creative-critic`.

## REFERENCE FILES

- `references/continuity-checklist.md` — field-by-field check list
- `../_shared/references/anti-choppy.md`
- `agent-workspace/playbooks/ads/video-production.md`

## LEARNING BEHAVIOR

Every drift is logged to `knowledge/production-log/` with model, settings and cause. Recurring
drift by model becomes a routing note in the capability map — after repetition, never after one.
