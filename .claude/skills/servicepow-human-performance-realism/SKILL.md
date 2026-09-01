---
name: servicepow-human-performance-realism
description: >
  Directs generated people as actors rather than subjects — defining what a character wants,
  feels, thinks, what just happened, who they are looking at, what they are trying not to show
  and at what intensity — then inspecting generated footage for the physical tells that betray
  synthetic humans: eyes, gaze, blinks, jaw, mouth, micro-expressions, posture, breathing,
  balance, weight, hands, grip, object contact, gait and reaction delay. Activates when the
  Campaign Director invokes the performance-direction / realism-QC phase, or when the user
  explicitly asks for performance direction, actor briefs for generated people, a realism
  inspection of footage containing humans, or help with a person who looks fake, dead-eyed or
  robotic. Not for cross-shot consistency (servicepow-continuity-supervisor), shot framing or
  cut logic (servicepow-cinematography-editor), or generic advertising requests
  (servicepow-campaign-director).
license: Proprietary — Service Pow internal. Not for redistribution.
metadata:
  version: 2.0.0
---

# Human Performance Realism

## PURPOSE

Believable people. The audience cannot articulate why a generated human feels wrong, but they
always feel it — and it costs the work its credibility in under a second.

**Realism comes from restrained physical behaviour, not from more acting.**

## TRIGGER

Activates when (a) the Campaign Director invokes this phase (performance direction & realism
QC — the storyboard-constraint pass run in parallel with brand fidelity and continuity, and
the review of generated footage containing people), or (b) the user explicitly asks for
performance direction, actor briefs for generated characters, a realism inspection of footage
with humans, help casting a spokesperson character, or a diagnosis of a person who looks fake,
dead-eyed or robotic. Generic advertising requests belong to servicepow-campaign-director.

Out of scope: consistency of a character between shots (servicepow-continuity-supervisor);
shot framing and cut logic (servicepow-cinematography-editor).

## INPUTS

Required:

- The Campaign Bible's spine, script, and shot-list sections (path provided by the Campaign
  Director)
- The shot's emotional job from the beat map

Optional:

- Real reference footage of the real behaviour, casting references, and client crew footage
  from the client KB

## WORKFLOW

1. **Write the actor's brief per character, per beat** — not adjectives, but state:
   what they **want** · what they **feel** · what they **think** · what **just happened** · who
   they are **looking at** · what they are **trying not to show** · emotional **intensity**
   (1–10, and it is usually lower than instinct suggests).
2. **Source the emotion like a prop.** Take it from a real account where one exists. *"Tired,
   vindicated" from a real crew account produced a usable performance where "relieved" produced
   "pleased".* Precise emotional language generates precise behaviour.
3. **Write restraint into the direction explicitly.** State what they do *not* do: does not
   smile, does not gesture, does not look at camera.
4. **Check every skilled-labour beat against the footage hierarchy** in
   `../_servicepow/policies/realism-and-disclosure.md` §1 before direction is finalized:
   prefer real footage for skilled labour in progress; a synthetic depiction is permissible
   only under that policy's illustrative (non-documentary) framing and carries elevated
   realism QC — mark such shots ELEVATED-QC in the direction. A storyboard shot that presents
   synthetic skilled labour as documentary record is a footage-rule violation: raise a
   CONFLICT to the Campaign Director.
5. **Write the performance-direction section of the Campaign Bible** — character list,
   per-beat actor briefs, restraint instructions (section assignment per the Campaign
   Director's contract).
6. **Inspect generated footage** against `references/realism-inspection.md` — eyes and gaze
   first, then hands and object contact, then weight and breathing. ELEVATED-QC shots get
   heightened scrutiny on hands, tools, and contact.
7. **Rule per shot:** ACCEPT · FIX (reframe/crop away the failure) · REGENERATE (with a
   *changed* performance brief, never the same prompt again) · REDESIGN THE SHOT (change the
   framing, or route to real footage per the footage hierarchy).
8. **Raise a CONFLICT to the Campaign Director** when: a beat requires a performance the
   models cannot deliver (precise hand work, sustained emotional close-up, readable joy) · no
   real reference exists for a behaviour the work depends on · a synthetic skilled-labour shot
   is framed as documentary (step 4).
9. **Log learning.** Performance briefs that produced believable results are logged with the
   exact wording — the phrasing is the reusable asset. Failures are logged with the tell that
   gave them away.

## DECISION RULES

- **Reject on sight (focal area):** dead eyes · constant smiling · constant gesturing ·
  robotic movement · perfect symmetry · instant reactions · excessive acting.
- **Tell-tolerance boundary — where this skill's authority ends.** The reject-on-sight list is
  **binding for focal-area tells at the shot level, pre-assembly**: any listed tell in the
  focal area of the frame (the subject the viewer is directed at — faces, the hands doing the
  featured action, anything the edit points attention to) fails the shot before it enters the
  cut, no negotiation. Tells in **non-focal/background** humans (extras, mid-ground
  passers-by, incidental hands at frame edge) are *noted, not auto-rejected* here — they are
  forwarded to `servicepow-creative-critic`, whose separate AI-artifact risk score governs
  cumulative non-focal tells at the master level, judged at delivery size and speed. This
  skill never accepts a focal tell on the theory that the critic will catch it, and never
  blocks a master over a background tell alone — that call belongs to the critic's score.
- **Reaction delay is the cheapest realism there is.** Humans react late. Generated humans
  react on the frame. A held beat before a line reads as thought; an instant response reads
  as a machine.
- **Shared performance maxims are canonical in `../servicepow-script-director/SKILL.md`** —
  the pause-as-performance rule and the visible-speaking-mouth/audio rule live there; this
  skill enforces their footage-level consequences: a mouth visibly speaking against cut or
  mismatched audio fails inspection, and the shot changes, not just the audio.
- **Performed emotion at readable distance** falls under the performed-emotion ban of
  `../_servicepow/policies/realism-and-disclosure.md` §4 — direct payoffs within that ban's
  permitted forms. Performed joy is the most reliably fake thing a model produces.
- **When a performance cannot be generated believably, reframe it.** Hands, backs, partial
  faces and over-shoulder framings carry emotion without asking the model for what it cannot
  do (see the framing escape hatch in `references/realism-inspection.md`).
- **Skilled labour in progress is the highest-risk class of shot.** Prefer real footage per
  `../_servicepow/policies/realism-and-disclosure.md` §1; synthetic depictions require that
  policy's illustrative (non-documentary) framing and elevated realism QC. Violations are
  CONFLICTs to the Campaign Director, not judgement calls made here.
- **Generated people appear only within the synthetic-people rule** of
  `../_servicepow/policies/realism-and-disclosure.md` §2 (registry gate BC-17) — what a
  generated person may be presented *as* is decided by that policy, not by this skill.

## POLICY BINDINGS

- `../_servicepow/policies/realism-and-disclosure.md` — §1 governs when a skilled-labour shot
  may be synthetic and the framing and elevated QC it then carries; §2 governs what a
  generated person may be presented as; §4 sets the realism floor and performed-emotion ban
  this skill's inspections enforce.
- `../_servicepow/data/blocking-checks.yaml` — the canonical blocking-check registry; this
  skill's inspections feed BC-17 (synthetic-person presentation), BC-33 (impossible-human-speed
  gate) and the human-watch gate BC-25; machine motion gates (e.g. BC-06, BC-08, BC-09) run in
  the QC harness, not here.
- `../_servicepow/data/roles.md` — role definitions: the OPERATOR runs briefs and inspections;
  the APPROVER accepts residual realism risk (e.g. BC-33 VELOCITY/BURST warnings and
  CONFLICT resolutions escalated past the Campaign Director).
- `../_servicepow/policies/generation-and-spend.md` — governs REGENERATE verdicts: a changed
  brief is drafted free, but re-dispatch passes through the spend gate and live tool state is
  queried at run time.

## QUALITY GATES

- Every character has want / feel / think / just-happened / looking-at / hiding / intensity
- Restraint stated explicitly per shot
- Every skilled-labour beat checked against the footage hierarchy; synthetic ones marked
  ELEVATED-QC with illustrative framing confirmed
- Every generated human shot inspected against `references/realism-inspection.md` before it
  enters the cut
- No accepted shot exhibits a focal-area reject-on-sight tell
- Non-focal tells recorded and forwarded to the creative critic, never silently dropped

## OUTPUT CONTRACT

- The Campaign Bible's performance-direction section: character list, per-beat actor briefs,
  restraint instructions (section assignment per the Campaign Director's contract).
- Per-shot inspection verdicts (ACCEPT / FIX / REGENERATE / REDESIGN SHOT) on generated
  footage, each naming the specific tell identified and whether it is focal or non-focal;
  non-focal tell notes packaged for the creative critic.
- CONFLICT entries to the Campaign Director where the workflow requires them.
- Learning-log entries: believable brief wordings verbatim; failures with the betraying tell.

## HANDOFF

→ `servicepow-storyboard-director` (direction folds into shots) and
`servicepow-higgsfield-production` (performance requirements constrain routing). Inspection
findings — including non-focal tell notes — feed `servicepow-creative-critic`, whose
AI-artifact risk score owns the master-level call. Control returns to the Campaign Director.

## REFERENCE FILES

- `references/realism-inspection.md` — the full physical inspection list, verdicts, and the
  focal/non-focal boundary
