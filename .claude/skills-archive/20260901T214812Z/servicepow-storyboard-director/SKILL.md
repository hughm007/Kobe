---
name: servicepow-storyboard-director
description: >
  Converts an approved creative spine and script into the mandatory storyboard artifact — the
  shot-by-shot document written before any image is generated, where every shot carries the ten
  required fields: story job, action, camera, lighting, audio, text, source, a cited real
  reference, the pack's angle, and a named motion axis. Also produces the Feeling Spec and Sound
  Spine. Every shot must earn its place; filler shots are cut, not improved. Use after the spine
  and script are approved and before any keyframe or video credit is spent. Do NOT use for a
  single standalone shot prompt (use higgsfield-seedance-prompt), do NOT use before a beat map
  exists, and do NOT add an eleventh field.
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
2. **Write every shot with all TEN fields** (see `references/shot-fields.md`): story job ·
   action · camera · lighting · audio · text · source · **Real-ref (cited)** · **Angle** ·
   **Motion**. A blank field is unfinished work. **Do not invent an eleventh** — a new box is
   SOP bloat papering over an enforcement failure.
3. **Declare what each shot contributes** — attention, understanding, proof, emotion, desire or
   action. A shot contributing none is cut, not improved.
4. **Run the real-reference law (LB30/LB51).** Real footage of the real event is consulted
   before the shot is designed, **cited and openable**, naming the specific observed behaviors
   copied. No reference found is written as the exact `NO REFERENCE FOUND — HIGH RISK` entry and
   surfaced to Karl by name — never accepted silently. It binds the **keyframe** as well as the
   motion. **State amendment:** a shot depicting a state change (broken/working, before/after)
   references **each state separately** and names the observable difference in one line — an
   unreferenced transition is an unsubstantiated claim in visual form.
5. **Mark the "during" state.** In trades work the before/after states can be staged; the
   *during* state is what real client footage exists for and generally cannot be generated
   safely. Flag those shots for real footage.
6. **Name a motion axis for every shot** (check 31) — which of the five axes (camera
   translation · subject travel through depth · foreground occlusion · focus change · light
   change) **and how it is achieved**. Hero beats name two. Static beauty fails the motion floor.
7. **Declare the Angle once for the whole pack** — the same argument on every shot in every
   variant, and it must differ from this client's previous deliverable (LB37). Storyboard the
   shared body once; storyboard **each hook variant's opening shots separately**.
8. **Write the Feeling Spec and, where sound is meaningful, the Sound Spine** — both are required
   at this gate, not later. An emotion with no observable on-screen cause is a wish.
9. **Check the shot-length arithmetic:** total ÷ shot count ≥ 1.3s; pure-AI shots ≤5s (static
   people-free environment shots may hold to 7s). Mark hero beats for the 3-draft rule.
10. **Set model requirement per shot** — the *requirement*, not the model. ("Needs consistent
   face across three shots"; "needs legible on-screen text".) `higgsfield-production` chooses.
11. **Write Bible section 6** and the full list to `shotlist.md`. The storyboard **is the
    Master Timeline seed** — clip order, story jobs, audio spine, continuity locks per joint.

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

- Every shot has **all ten fields** filled — counted, not assumed
- Every shot names a motion axis and how it is achieved; hero beats name two
- Angle stated, identical across the pack, and different from the last deliverable
- Every action passed the In-World Reason Test
- References cited and openable, or the exact HIGH RISK line written and surfaced by name
- Feeling Spec exists with a cause per emotional beat; Sound Spine exists where sound is meaningful
- Flow reads as one story, not a list of shots
- Composite shots marked wherever marks or text appear
- Karl has seen the storyboard for anything concept-level

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
