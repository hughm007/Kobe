---
name: servicepow-continuity-supervisor
description: >
  Cross-shot world-consistency specialist. Stops separately generated shots from feeling like
  separate worlds by writing continuity bibles (characters, products, locations, lighting,
  camera, colour, audio expectations) before generation, checking every new shot for drift
  against them, and tracking temporal state so objects do not reset, people do not teleport,
  clothing does not change and products do not mutate between shots. Activates when (a) the
  Campaign Director invokes the continuity-supervision phase, or (b) the user explicitly asks
  for a continuity check, a cross-shot drift review, a continuity bible, or "does this shot
  match the others". Generic advertising requests belong to servicepow-campaign-director. Not
  for judging a single human performance (servicepow-human-performance-realism) or for
  brand-mark correctness (servicepow-brand-fidelity — this skill only flags suspected mark
  drift to it).
license: Proprietary — Service Pow internal. Not for redistribution.
metadata:
  version: 2.0.0
---

# Continuity Supervisor

## PURPOSE

One world across many generations. Each generation is independent and has no memory of the
last — this skill is that memory. It writes the rules of the world before the first credit is
spent, checks each new shot against them, and tracks what state everything should be in at
every point in the story.

## TRIGGER

Activates when (a) the Campaign Director invokes this phase (continuity supervision — run as a
storyboard constraint before generation, as a drift check after each new shot, and again when
a cut is assembled), or (b) the user explicitly asks for a continuity check, a cross-shot
drift review, a continuity bible, or whether a shot matches the rest of a sequence — including
"it looks right alone but wrong in sequence". Generic advertising requests belong to
servicepow-campaign-director.

## INPUTS

**Required**
- The Campaign Bible's shot list / storyboard and character sections (locations per the bible
  contract — `../servicepow-campaign-director/references/bible-contract.md`)
- Any already-generated shots for this campaign

**Optional**
- Real client assets and reference images (the client KB) · brand kit

## WORKFLOW

1. **Write the continuity bibles before the first generation** — cheap now, impossible later:
   - **Characters:** face, hair, body, clothing (every item), accessories, emotional
     progression across the beat map
   - **Products:** geometry, packaging, scale, colour, materials, orientation. Brand-mark
     CORRECTNESS is not in scope here — that is servicepow-brand-fidelity's gate under
     `../_servicepow/policies/brand-assets.md`; this bible pins the product's physical
     identity so it cannot mutate between shots
   - **Locations:** architecture, layout, props, furniture, weather, time of day
   - **Lighting:** direction, quality, temperature
   - **Camera:** lens family, height, movement philosophy (edit-time grammar such as the
     180-degree line and screen direction is enforced by
     `../servicepow-cinematography-editor/SKILL.md`)
   - **Colour:** palette, white balance, grade
   - **Audio expectations:** ambience and music state per beat, recorded for the audio
     director — bed and room-tone continuity is enforced by
     `../servicepow-audio-director/SKILL.md`
2. **Bind each bible to a real reference** wherever one exists — a cited image or asset beats
   a paragraph of description.
3. **Check every new generation against the bibles**, field by field, using
   `references/continuity-checklist.md`. Note drift precisely ("cuff changed from rolled to
   buttoned"), not vaguely ("looks different").
4. **Track temporal continuity across the sequence:** what state should each object, person
   and location be in at this point in the story? Wet floor stays wet. Sleeves stay rolled. A
   tool set down stays down.
5. **Rule on each drift:** ACCEPT (invisible at delivery size and speed — recorded anyway) ·
   FIX (edit tools) · REGENERATE (with tightened references) · RAISE CONFLICT (the shot list
   demands consistency the models cannot hold).
6. **Write the continuity annex** into the Campaign Bible at the location the Campaign
   Director assigns (per the bible contract), with per-shot verdicts and the running temporal
   state table.

## DECISION RULES

- **Continuity is judged at delivery size and speed**, not frame-by-frame at 400%. A
  difference no viewer can see at the delivery aspect on the delivery device is not a defect;
  one they can see is.
- **Faces, products and legible text are zero-tolerance.** These are the drifts audiences
  notice and clients reject.
- **Suspected brand-mark drift is flagged to servicepow-brand-fidelity, never ruled on here.**
  One owner per gate; this skill's verdicts cover product/world/wardrobe/light continuity.
- **Lighting direction changing between adjacent shots reads as a different world** even when
  everything else matches — check it every time.
- **Prefer reference-driven generation over prompt description** for anything that must match.
- **Regeneration is not the first tool.** An edit op is cheaper than a re-roll; try FIX before
  REGENERATE. Regeneration is generation spend and goes through the spend gate
  (`../_servicepow/policies/generation-and-spend.md`).
- **Two tightened regenerations is the ceiling.** Drift that recurs after two means the shot
  needs a different production method, not a third attempt — RAISE CONFLICT.
- **A continuity error that survives to the master is a rebuild.** That is why this skill runs
  between generations, not at the end.

## QUALITY GATES

- All seven bibles exist before the first generation
- Every generated shot has a recorded drift verdict
- Zero unresolved face / product / legible-text drift
- Temporal state tracked across the full sequence
- Every suspected brand-mark drift handed to servicepow-brand-fidelity, none ruled here

## FAILURE CONDITIONS

Raise a CONFLICT (resolved by the Campaign Director; risk acceptances belong to the APPROVER)
when: the shot list requires consistency the current models cannot hold · required references
do not exist · drift keeps recurring after two tightened regenerations.

## POLICY BINDINGS

- `../_servicepow/policies/brand-assets.md` — owns brand-mark truth; this skill flags
  suspected mark drift to servicepow-brand-fidelity and never rules on mark correctness.
- `../_servicepow/policies/generation-and-spend.md` — governs every REGENERATE verdict: live
  tool state is queried at run time, and regeneration spend passes the SPEND_APPROVER gate.
- `../_servicepow/policies/realism-and-disclosure.md` — governs the footage hierarchy behind
  reference-driven fixes; real client media outranks tighter synthetic references when usable.
- `../_servicepow/data/blocking-checks.yaml` — the canonical blocking-check registry; this
  skill's drift verdicts feed the human-judgement checks (e.g. BC-21 routes through
  brand-fidelity, BC-25's end-to-end watch is where surviving continuity errors are caught).
- `../_servicepow/data/roles.md` — OPERATOR runs the checks and records verdicts; APPROVER
  accepts risk on unresolved or recurring drift; SPEND_APPROVER authorizes regeneration.

## OUTPUT CONTRACT

The continuity annex written into the Campaign Bible at its assigned location (per
`../servicepow-campaign-director/references/bible-contract.md`): the seven bibles,
per-shot drift verdicts (specific field, ruling, action), and the running temporal state
table. Returns to the Campaign Director the drift list, anything requiring regeneration, and
any open CONFLICT.

## HANDOFF

Drift needing a new production approach → `servicepow-higgsfield-production`. Suspected
brand-mark drift → `servicepow-brand-fidelity`. All routes run VIA the Campaign
Director (no lateral state): clean sequence → next phase
`servicepow-cinematography-editor`; audio expectations per beat →
`servicepow-audio-director`. Findings feed `servicepow-creative-critic`.

## REFERENCE FILES

- `references/continuity-checklist.md` — field-by-field check list with ownership pointers

## LEARNING BEHAVIOR

Every drift is logged to the client KB's production log with the model, settings and cause as
observed at run time. Drift that recurs for the same model becomes a validated routing note in
that log, which `servicepow-higgsfield-production` consults when routing shots — a note is
written after repetition, never after one occurrence.
