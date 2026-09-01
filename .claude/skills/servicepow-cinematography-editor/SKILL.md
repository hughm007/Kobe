---
name: servicepow-cinematography-editor
description: >
  Edit-assembly and screen-grammar specialist. Makes a finished piece feel intentionally
  filmed and edited rather than assembled from clips — sequencing footage by the beat map,
  requiring a stated reason for every cut, setting pacing against the story's emotional
  shape, and serving as the single owner of screen grammar: the 180-degree line, screen
  direction, eyelines, character geography, object position across the cut, and match on
  action. Activates when (a) the Campaign Director invokes the cinematography-and-edit
  phase, or (b) the user explicitly asks to sequence footage into a cut, review an assembly
  for sequence logic, fix a piece that feels choppy or arbitrarily assembled, or check
  screen direction or the 180-degree line. Generic advertising requests belong to
  servicepow-campaign-director. Not for designing shots that do not exist yet
  (servicepow-storyboard-director) or for judging whether a performance is believable
  (servicepow-human-performance-realism).
license: Proprietary — Service Pow internal. Not for redistribution.
metadata:
  version: 2.0.0
---

# Cinematography and Edit

## PURPOSE

The difference between a film and a reel of generations is that every cut in a film was
decided. This skill makes each cut answer for itself. It is also the single home of screen
grammar for the whole pipeline: when any other skill needs a ruling on the 180-degree line or
screen direction, the ruling happens here — the continuity phase's camera checklist defers
those rows to this skill rather than duplicating them.

## TRIGGER

Activates when (a) the Campaign Director invokes this phase (cinematography and edit — run
when footage is being sequenced into a cut and again when an assembly is reviewed), or (b)
the user explicitly asks to sequence generated or real footage into a cut, review an
assembly for sequence logic, diagnose "this feels choppy" / "why does this not flow", decide
pacing, or verify screen grammar (180-degree line, screen direction, eyelines, geography).
Generic advertising requests belong to servicepow-campaign-director. Not for designing shots
that do not exist yet — that is servicepow-storyboard-director — and not for judging whether
a performance is believable, which belongs to servicepow-human-performance-realism.

## INPUTS

Required:
- From the Campaign Bible (path provided by the Campaign Director; section assignments per
  `../servicepow-campaign-director/references/bible-contract.md`): the beat map and the shot
  list.
- The available footage.

Optional: music bed and its structure · platform pacing norms and safe areas for the
delivery aspect · reference ad teardowns.

## WORKFLOW

1. **Order shots by the beat map**, not by which came out best. Quality of a clip is not a
   placement argument.
2. **State the reason for every cut**, drawn from the permitted-reason list (see DECISION
   RULES). A cut with no reason on that list does not exist yet — it is a splice.
3. **Interrogate each transition** with the transition questions in
   `../servicepow-creative-spine/references/anti-choppy.md` — applied there, not restated
   here. Every answer must resolve to a reason on the permitted list.
4. **Check the grammar** against the SCREEN GRAMMAR section below, and record a verdict per
   scene: PASS · DELIBERATE BREAK (motivated, recorded, APPROVER-accepted) · FAIL.
5. **Set pacing against the beat map's emotional shape** — not a uniform rhythm. Faster into
   tension, held on payoff. The proven pacing pattern and the rhythm-break rule live in
   `../servicepow-creative-spine/references/anti-choppy.md`; apply them, do not reinvent
   them.
6. **Audit for the reject list** (see DECISION RULES), run the shuffle test and the trade
   rule from `../servicepow-creative-spine/references/anti-choppy.md` on the assembly, and
   cut anything that survives only on beauty.
7. **Write the edit annex** into the Campaign Bible at the location the Campaign Director
   assigns (per the bible contract): cut list with reasons, pacing notes, grammar verdicts.

## SCREEN GRAMMAR (CANONICAL: screen-grammar)

This skill is the **single owner** of screen grammar. The continuity supervisor's checklist
and every other skill defer their 180-degree-line and screen-direction rows here; these
rules are not duplicated anywhere else.

- **180-degree line.** Establish the axis of action for each scene and keep the camera on
  one side of it. Crossing is legal only through a neutral (on-axis) shot, a visible
  on-screen camera move across the line, or a deliberate, motivated break recorded in the
  edit annex and accepted by the APPROVER.
- **Screen direction.** A subject exiting frame left enters the next shot frame right.
  Travel direction persists across cuts within a scene; a direction flip needs a stated
  story reason, not an accident of generation.
- **Eyelines.** In shot/reverse-shot, eyelines converge; a look off-screen must be answered
  by the thing the look implies, at the height and side the look establishes.
- **Character geography.** The viewer always knows who is where relative to whom.
  Re-establish after any spatial change; never let a cut silently teleport a character.
- **Object position across the cut.** Props hold frame side and orientation through the
  join. (Object STATE over story time — wet stays wet, set-down stays down — belongs to
  servicepow-continuity-supervisor; this rule covers cut-to-cut positional legibility only.)
- **Match on action.** Wherever two shots share a movement, cut during the movement — the
  join hides inside motion and the two shots read as one world.

## DECISION RULES

### The permitted-reason list (CANONICAL: cut-reasons)

Permitted reasons for a cut: action · new information · reaction · emotional change ·
rhythm · product reveal · visual match · story progression.

This list is the single enumeration of cut reasons in the system — other skills cite it,
they do not copy or count it. A transition that cannot claim one of these reasons is a
splice, not a cut.

### Assembly rules

- **Reject on sight:** random scene changes · meaningless B-roll · unrelated establishing
  shots · unmotivated slow motion · floating AI camera movement · flashy transitions with no
  purpose.
- **Dissolve-only editing is a symptom, not a style** — it usually means the cuts had no
  reasons, so everything was softened. Earn hard cuts.
- **The motion floor is real** (BC-31: every shot names a motion axis; BC-08 and BC-09
  measure it per clip and per master shot). Slow motion is the documented repeat offender —
  uniform slowness fails the gate.
- **No opening dead-space** (BC-14). The first frame does work from frame one; a slow reveal
  at the top is a scroll-past on every feed platform.
- **No flash cuts** (BC-10). Rhythm is built with cut lengths above the flash-cut floor, not
  with subliminal splices.
- **Cut on action** wherever two shots share a movement — see SCREEN GRAMMAR.
- **Individual excellence never outranks the sequence.** The shuffle test and the trade rule
  in `../servicepow-creative-spine/references/anti-choppy.md` govern this at assembly; a
  shot that damages the sequence is removed or redesigned regardless of what it cost. Sunk
  credits are not an argument.
- **Length serves the beat.** Do not hold a shot because the generation was expensive; do
  not trim a payoff because the reel is dense.
- **Framing and cut choices respect the delivery platform's safe areas** for the aspect
  named in the shot list — a cut that lands critical action under UI chrome fails at
  delivery even if it plays clean in the timeline.
- **Real and generated takes competing for one slot** are chosen per the footage hierarchy
  in `../_servicepow/policies/realism-and-disclosure.md`, then by sequence fit — never by
  clip beauty.

## QUALITY GATES

- Every cut has a reason from the permitted list
- Every scene has a screen-grammar verdict; any break is DELIBERATE, motivated, recorded,
  and APPROVER-accepted
- Motion axis present in every clip and master shot (BC-08, BC-09, BC-31)
- No opening dead-space (BC-14) · no flash cuts (BC-10)
- Zero shots retained purely on visual merit

## ESCALATION

Raise a CONFLICT to the Campaign Director — never resolved laterally with another
specialist — when: the beat map cannot be realised with the footage that exists · a required
transition has no motivating action and no other permitted reason · sequence coherence
cannot be reached without new shots. Deliberate grammar breaks and final-cut risk are
accepted by the APPROVER, not waived by this skill. Park per the never-stall rule in
`../_servicepow/data/roles.md`: state what is awaited, prepare the recommendation, move on.

## POLICY BINDINGS

- `../_servicepow/policies/generation-and-spend.md` — governs every recommendation for
  replacement or missing shots: new footage is generation spend, live tool state is queried
  at run time, and the SPEND_APPROVER gate applies before anything is regenerated.
- `../_servicepow/policies/realism-and-disclosure.md` — governs the footage hierarchy when
  real and generated takes compete for the same slot in the cut.
- `../_servicepow/policies/brand-assets.md` — product-reveal cuts must not crop or obscure
  brand marks; mark correctness itself stays with servicepow-brand-fidelity under this
  policy and is never ruled on here.
- `../_servicepow/data/blocking-checks.yaml` — the canonical blocking-check registry; this
  skill's cut list must pass its machine and hybrid edit gates (BC-08, BC-09, BC-10, BC-14,
  BC-31), and the edit annex records any named acceptance those checks require.
- `../_servicepow/data/roles.md` — OPERATOR assembles the cut and states the reasons;
  APPROVER accepts deliberate grammar breaks and final-cut risk; SPEND_APPROVER authorizes
  any new generation the edit demands; the never-stall rule applies at this skill's
  escalations.

## OUTPUT CONTRACT

The edit annex written into the Campaign Bible at its assigned location (per
`../servicepow-campaign-director/references/bible-contract.md`): the cut list with a stated
reason per transition, pacing notes, and per-scene screen-grammar verdicts.

Returned to the Campaign Director: the assembled sequence order, any shots recommended for
removal, any shots the sequence still needs (a generation request, subject to the spend
gate), and any open CONFLICT.

## HANDOFF

Return control to the Campaign Director, who routes downstream: the assembled cut feeds
servicepow-audio-director (audio bridges the cuts the editor chose) and then
servicepow-creative-critic; missing or replacement footage routes to
servicepow-higgsfield-production through the spend gate; suspected cross-shot drift noticed
during assembly routes to servicepow-continuity-supervisor.

Learning: cut patterns that survived QC and performed are logged as structures in the client
KB's campaign-results log; assemblies rejected on sequence logic are logged with the
specific transition that failed, so the reject list grows from evidence, not taste.
