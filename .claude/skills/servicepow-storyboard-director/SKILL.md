---
name: servicepow-storyboard-director
description: >
  Converts an approved creative spine and script into an intentional shot list where every shot
  declares its beat, duration, purpose, what came before, what it adds, what comes next, subject,
  action, performance, gaze, shot size, camera, lens feel, movement, light, environment, product,
  props, dialogue, audio, transition, reference, model requirement and continuity notes. Every
  shot must contribute to attention, understanding, proof, emotion, desire or action — filler
  shots are cut. Use after the spine and script are approved and before any production or model
  routing. Do NOT use for a single standalone shot prompt (use higgsfield-seedance-prompt) and
  do NOT use before a beat map exists.
license: Proprietary — Service Pow internal. Not for redistribution.
metadata:
  version: 1.0.0
  wave: 1
  owns_bible_sections: [shot-list, visual-language, camera-language]
  supersedes: seedance-shotlist-director
---

# Storyboard Director

## PURPOSE

Turn story into shots that a producer can execute and a critic can defend — where each shot's
right to exist is written down before anyone spends a credit.

*(Supersedes the generic `seedance-shotlist-director` for Service Pow campaign work: that skill
produces shot lists with no knowledge of the Bible, the blocking-check gate or the client's
constraints. Use it only for non-campaign, non-client shot lists.)*

## TRIGGER

After the script is approved · "storyboard this" · "break this into shots" · "build the shot
list" · an existing shot list needs auditing for filler.

## REQUIRED INPUTS

- Bible sections 4–5 (beat map, script)
- Platform, aspect ratio, target duration

## OPTIONAL INPUTS

Reference footage · location constraints · available real assets · budget ceiling

## WORKFLOW

1. **Map beats to shots.** A beat may need one shot or several; a shot never spans two beats.
2. **Write every shot with the full field set** (see `references/shot-fields.md`). The four that
   do the real work: **purpose · what came before · what this adds · what comes next.**
3. **Declare what each shot contributes** — attention, understanding, proof, emotion, desire or
   action. A shot contributing none is cut, not improved.
4. **Run the real-reference law (LB51).** Real footage of the real event is consulted before
   the shot is designed, **cited and openable**. No reference found is surfaced to Karl by name —
   never accepted silently. **State amendment:** a shot depicting a state change (broken/working,
   before/after) references **each state separately** and names the observable difference in one
   line — an unreferenced transition is an unsubstantiated claim in visual form.
5. **Mark the "during" state.** In trades work the before/after states can be staged; the
   *during* state is what real client footage exists for and generally cannot be generated
   safely. Flag those shots for real footage.
6. **Name a motion axis for every shot** (check 31) — what actually moves, and why. Static
   beauty fails the motion floor.
7. **Set model requirement per shot** — the *requirement*, not the model. ("Needs consistent
   face across three shots"; "needs legible on-screen text".) `higgsfield-production` chooses.
8. **Write Bible section 6** and the full list to `shotlist.md`.

## DECISION RULES

- **No filler shots.** The eight anti-choppy questions are applied to every shot before it enters
  the list.
- **Every shot needs an in-world reason (LB31).** "To show the viewer the product" is not one.
- **Text and marks are not generated** — logo, wordmark, packaging text, legal copy come from
  real files and are composited (LB24). Mark those shots as composite shots here.
- **Design out the known failure modes.** Precise hand work, readable text, crowds, celebrations
  at readable distance (LB25) and unspecified crowd vocals (LB26) all fail predictably — design
  the shot to avoid them rather than hoping the model copes.
- **Opening dead-space is a blocking failure.** The first frame works from frame one.
- **Burned text sits inside the 15–70% platform safe area.**
- **Shot length follows the beat, not the model's default duration.**

## OUTPUT CONTRACT

Bible section 6 (summary table + visual/camera language) and `shotlist.md` (full fields per
shot). Each shot flagged: generate / reference-driven / real footage / composite. Returns shot
count, total duration, and the list of shots needing real assets.

## QUALITY GATES

- Every shot has purpose / before / adds / next filled
- Every shot names a motion axis
- Every shot declares one or more of attention, understanding, proof, emotion, desire, action
- References cited and openable, or the gap surfaced by name
- Composite shots marked wherever marks or text appear

## FAILURE CONDITIONS

Raise a CONFLICT when: a beat cannot be shot within the duration · a required shot depends on a
reference that does not exist · the shot list needs a capability the capability map marks as a
known failure mode.

## HANDOFF

→ `servicepow-brand-fidelity`, `servicepow-continuity-supervisor` and
`servicepow-human-performance-realism` (they constrain the list) → then
`servicepow-higgsfield-production` for routing.

## REFERENCE FILES

- `references/shot-fields.md` — the full per-shot field set
- `../_shared/references/anti-choppy.md`
- `agent-workspace/playbooks/ads/video-production.md` — **owns the blocking-check list and count**, LB laws, safe areas

## LEARNING BEHAVIOR

Shots cut at QC are logged to `knowledge/production-log/` with which question they failed. A
shot type that repeatedly fails is proposed as a design rule — after three occurrences, not one.
