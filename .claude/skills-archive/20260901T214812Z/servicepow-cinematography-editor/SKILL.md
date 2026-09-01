---
name: servicepow-cinematography-editor
description: >
  Makes the finished advertisement feel intentionally filmed and edited rather than assembled
  from clips — governing shot size, lens language, camera movement, composition, screen
  direction, eyelines, the 180-degree rule, match on action, character geography, cut timing,
  pacing and transitions, and requiring every cut to state its reason. Use when sequencing
  generated or real footage into a cut, when reviewing an assembly for sequence logic, or when an
  ad feels choppy or arbitrarily assembled. Do NOT use to design shots that do not exist yet
  (servicepow-storyboard-director) or to judge whether a performance is believable.
license: Proprietary — Service Pow internal. Not for redistribution.
metadata:
  version: 1.0.0
  wave: 1
  owns_bible_sections: [edit-logic, cut-reasons]
---

# Cinematography and Edit

## PURPOSE

The difference between a film and a reel of generations is that every cut in a film was decided.
This skill makes each cut answer for itself.

## TRIGGER

Assembling a cut · reviewing an assembly · "this feels choppy" · "why does this not flow" ·
sequencing generated footage · deciding pacing.

## REQUIRED INPUTS

- Bible sections 4, 6 (beat map, shot list)
- The available footage

## OPTIONAL INPUTS

Music bed and its structure · platform pacing norms · reference ad teardowns

## WORKFLOW

1. **Order shots by the beat map**, not by which came out best. Quality of a clip is not a
   placement argument.
2. **State the reason for every cut.** Permitted reasons: action · new information · reaction ·
   emotional change · rhythm · product reveal · visual match · story progression. A cut with no
   reason on this list does not exist yet — it is a splice.
3. **Ask the three questions at each transition:** Why are we cutting now? Why is this the next
   image? What does this add?
4. **Check the grammar:** screen direction · eyelines · the 180-degree line · character geography
   (the viewer always knows who is where) · object position across the cut · match on action.
5. **Set pacing against the beat map's emotional shape** — not a uniform rhythm. Faster into
   tension, held on payoff.
6. **Audit for the reject list** (below) and cut anything that survives only on beauty.
7. **Write Bible section 12.**

## DECISION RULES

- **Reject:** random scene changes · meaningless B-roll · unrelated establishing shots ·
  unmotivated slow motion · floating AI camera movement · flashy transitions with no purpose.
- **Dissolve-only editing is a symptom**, not a style — it usually means the cuts had no reasons,
  so everything was softened. Earn hard cuts.
- **The motion floor is real** (check 31): every clip and every master shot must carry motion.
  Slow-motion is the documented repeat offender — uniform slowness fails.
- **No opening dead-space.** The first frame does work from frame one; a slow reveal at the top
  is a scroll-past on every feed platform.
- **Cut on action** wherever two shots share a movement — it hides the join and reads as one world.
- **A beautiful shot that damages the sequence is removed or redesigned.** Sunk credits are not an
  argument.
- **Length serves the beat.** Do not hold a shot because the generation was expensive.

## OUTPUT CONTRACT

Bible section 12: the cut list with a stated reason per transition, pacing notes, grammar
verdicts. Returns the assembled sequence order and any shots recommended for removal.

## QUALITY GATES

- Every cut has a reason from the permitted list
- 180 line and screen direction hold, or the break is deliberate and motivated
- Motion axis present in every clip and master shot
- No opening dead-space
- Zero shots retained purely on visual merit

## FAILURE CONDITIONS

Raise a CONFLICT when: the beat map cannot be realised with the footage that exists · a required
transition has no motivating action and no other reason · sequence coherence cannot be reached
without new shots.

## HANDOFF

→ `servicepow-audio-director` (audio bridges the cuts) → `servicepow-creative-critic`.
Missing footage → `servicepow-higgsfield-production`.

## REFERENCE FILES

- `../_shared/references/anti-choppy.md` — the eight questions
- `agent-workspace/playbooks/ads/video-production.md` — motion floor, dead-space, safe areas

## LEARNING BEHAVIOR

Cut patterns that survived QC and performed are logged as structures in
`knowledge/campaign-results/`. Assemblies rejected on sequence logic are logged with the specific
transition that failed.
