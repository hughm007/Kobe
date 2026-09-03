---
name: servicepow-storyboard-director
description: >
  Converts an approved creative spine and script into the mandatory storyboard artifact — the
  shot-by-shot document written before any image is generated, where every shot carries the ten
  required fields: story job, action, camera, lighting, audio, text, source, a cited real
  reference, the pack's Angle, and a named motion axis. Also produces the Feeling Spec and Sound
  Spine. Activates when the Campaign Director invokes the storyboard phase, or when the user
  explicitly asks to storyboard an approved script, break a script into shots, build or audit a
  shot list, or write a Feeling Spec or Sound Spine. Not for generic advertising requests
  (those belong to servicepow-campaign-director), not before a beat map exists, not for a single
  standalone shot prompt, and never for adding an eleventh field.
license: Proprietary — Service Pow internal. Not for redistribution.
metadata:
  version: 2.1.0
---

# Storyboard Director

## PURPOSE

Turn story into shots that a producer can execute and a critic can defend — where each shot's
right to exist is written down before anyone spends a credit. The storyboard is the artifact the
storyboard-gate checks in the canonical blocking-check registry
(`../_servicepow/data/blocking-checks.yaml`) are enforced against: BC-34 (real reference cited
per scene) and BC-31 (motion axis named per shot) both bind here, before a keyframe exists. This
skill is also the single home of the per-shot duration and motion thresholds (see DECISION
RULES) — the retired production playbook is no longer canonical for them.

## TRIGGER

Activates when (a) the Campaign Director invokes this phase (storyboard), or (b) the user
explicitly asks for storyboard work: "storyboard this", "break this into shots", "build the shot
list", "audit this shot list for filler", or a Feeling Spec / Sound Spine. Generic advertising
requests belong to servicepow-campaign-director. Do not activate before a beat map and an
approved script exist, and do not use this skill for a single standalone shot prompt — that is
production routing, not storyboarding.

## INPUTS

Required:
- The beat map and approved script from the Campaign Bible (path provided by the Campaign
  Director)
- Platform, aspect ratio, target duration

Optional: reference footage · location constraints · available real client assets (the client
KB) · budget ceiling

## WORKFLOW

1. **Map beats to shots.** A beat may need one shot or several; a shot never spans two beats.
2. **Write every shot with all TEN fields** (see `references/shot-fields.md`): story job ·
   action · camera · lighting · audio · text · source · **Real-ref (cited)** · **Angle** ·
   **Motion**. A blank field is unfinished work. **Do not invent an eleventh** — a new box is
   SOP bloat papering over an enforcement failure.
3. **Declare what each shot contributes** — attention, understanding, proof, emotion, desire or
   action. A shot contributing none is cut, not improved.
4. **Run the real-reference law (BC-34).** Real footage of the real event is consulted before
   the shot is designed, **cited and openable**, naming the specific observed behaviors copied.
   Where no reference exists, the exact `NO REFERENCE FOUND — HIGH RISK` entry is written and
   surfaced to the APPROVER — never accepted silently by the OPERATOR. The reference binds the
   **keyframe** as well as the motion. **State amendment:** a shot depicting a state change
   (broken/working, before/after) references **each state separately** and names the observable
   difference in one line — an unreferenced transition is an unsubstantiated claim in visual
   form, and claims are governed by `../_servicepow/policies/claims-and-proof.md`.
5. **Mark the "during" state.** In trades work the before/after states can be staged; the
   *during* state is what real client footage exists for and generally cannot be generated
   safely. Flag those shots for real footage.
6. **Name a motion axis for every shot (BC-31)** — which of the five axes (defined in
   `references/shot-fields.md`, field 10) **and how it is achieved**. Hero beats name two.
   Static beauty fails the motion floor.
7. **Declare the Angle once for the whole pack** — the same argument on every shot in every
   variant, and it must differ from this client's previous deliverable (rotation is enforced
   downstream at BC-24). Storyboard the shared body once; storyboard **each hook variant's
   opening shots separately**.
8. **Write the Feeling Spec and, where sound is meaningful, the Sound Spine** — both are
   required at this gate, not later. An emotion with no observable on-screen cause is a wish.
9. **Check the shot-length arithmetic** against the thresholds in DECISION RULES. Mark hero
   beats **HERO** for extra draft depth at the cheap rungs (the 3-draft rule); the spend itself
   is disciplined by `../_servicepow/policies/generation-and-spend.md`.
10. **Set the model requirement per shot** — the *requirement*, not the model. ("Needs
    consistent face across three shots"; "needs legible on-screen text".) Production chooses the
    model from live tool state at run time; nothing here names one.
11. **Write the storyboard section of the Campaign Bible** (placed per the Campaign Director's
    contract) **and the full list to `shotlist.md`** in the campaign workspace. The storyboard
    **is the assembly-manifest seed (consumed as the shot manifest of `../servicepow-video-production/`)** — clip order, story jobs, audio spine, continuity locks per
    joint.

## DECISION RULES

- **Duration and motion thresholds — single home of these thresholds.** No other active file may
  restate the numbers; downstream QC reads them from here.
  - **Average shot length:** total duration ÷ shot count ≥ **1.3s**.
  - **Shot-Length Law:** pure-AI shots hold the screen **≤5s by default** (openers/action 2–4s,
    faces 2–5s). The one exception is a static-subject environment shot with no visible people,
    which may hold to **7s**.
  - **Tell window:** synthetic tells — breathing regularity, eye tracking — surface around
    **8s**. Generate 6–8s takes for the edit room, but cut before the tell window.
  - **Motion floor:** every shot names one motion axis and how it is achieved; **hero beats name
    two** (BC-31). "The camera is locked and the subject talks" is not an axis.
- **No filler shots.** The anti-choppy questions
  (`../servicepow-creative-spine/references/anti-choppy.md`) are applied to every shot before it
  enters the list.
- **Every action needs an in-world reason.** "To show the viewer the product" is not one — see
  the In-World Reason Test under field 2 of `references/shot-fields.md`.
- **Text and marks are not generated.** Logo, wordmark, packaging text, legal copy come from
  real files and are composited (`../_servicepow/policies/brand-assets.md`). Mark those shots
  **COMPOSITE** here, at the board.
- **Design out the known failure modes.** Precise hand work, readable generated text, crowds,
  celebrations at readable distance, and unspecified crowd vocals all fail predictably — design
  the shot to avoid them rather than hoping the model copes.
- **Opening dead-space is a blocking failure (BC-14).** The first frame works from frame one.
- **Burned text sits inside the platform safe area (BC-28).**
- **Shot length follows the beat, not the model's default duration.**

## QUALITY GATES

- Every shot has **all ten fields** filled — counted, not assumed
- Every shot names a motion axis and how it is achieved; hero beats name two (BC-31)
- Angle stated, identical across the pack, and different from the last deliverable
- Every action passed the In-World Reason Test
- References cited and openable, or the exact HIGH RISK line written and surfaced to the
  APPROVER (BC-34)
- Feeling Spec exists with a cause per emotional beat; Sound Spine exists where sound is
  meaningful
- Flow reads as one story, not a list of shots
- COMPOSITE marked wherever marks or exact identity text appear
- The APPROVER has seen the storyboard for anything concept-level, before any generation

## LEARNING BEHAVIOR

Shots cut at QC are logged to the client KB's production log with which question they failed. A
shot type that repeatedly fails is proposed as a design rule — after three occurrences, not one.

## POLICY BINDINGS

- `../_servicepow/policies/brand-assets.md` — decides which shot contents force a COMPOSITE
  flag at the board; brand-truth review happens downstream (BC-21).
- `../_servicepow/policies/claims-and-proof.md` — governs any factual or comparative claim a
  shot visualizes, including before/after state changes (BC-16); the storyboard cites Evidence
  Records, it never invents them.
- `../_servicepow/policies/realism-and-disclosure.md` — governs the footage hierarchy behind
  the Source field and the limits on synthetic people in casting and action.
- `../_servicepow/policies/generation-and-spend.md` — governs how the model requirements this
  skill records become spend: method before model, live tool state queried at run time, nothing
  fired before the storyboard gate.
- `../_servicepow/data/blocking-checks.yaml` — the canonical blocking-check registry; this
  skill enforces BC-31 and BC-34 at the storyboard gate and designs to BC-14, BC-24, BC-28.
- `../_servicepow/data/roles.md` — role definitions; every risk acceptance raised here binds to
  the APPROVER role, never to a person.

## OUTPUT CONTRACT

- The Campaign Bible's storyboard section (summary table + visual/camera language), placed per
  the Campaign Director's contract
- `shotlist.md` in the campaign workspace: all ten fields per shot, each shot flagged
  **generate / reference-driven / real footage / composite**, hero beats marked HERO
- The Feeling Spec; the Sound Spine where sound is meaningful
- Returned to the caller: shot count, total duration, the list of shots needing real assets,
  and every `NO REFERENCE FOUND — HIGH RISK` entry awaiting APPROVER acceptance

## HANDOFF

→ Back to the Campaign Director, which routes the storyboard through the constraint reviews
(brand fidelity, continuity, human-performance realism — they constrain the list) and then to
production routing. Specialists never hand off laterally; the Campaign Director owns sequencing
and state.

Raise a **CONFLICT** to the Campaign Director instead of handing off when: a beat cannot be
shot within the target duration · a required shot depends on a reference that does not exist ·
the shot list needs a capability the capability map marks as a known failure mode.
