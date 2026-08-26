---
name: servicepow-human-performance-realism
description: >
  Directs generated people as actors rather than subjects — defining what a character wants,
  feels, thinks, what just happened, who they are looking at, what they are trying not to show
  and at what intensity — then inspecting generated footage for the physical tells that betray
  synthetic humans: eyes, gaze, blinks, jaw, mouth, micro-expressions, posture, breathing,
  balance, weight, hands, grip, object contact, gait and reaction delay. Use when writing
  performance direction into a storyboard and when reviewing generated footage containing people.
  Do NOT use for consistency between shots (servicepow-continuity-supervisor) or for shot framing
  and cut logic (servicepow-cinematography-editor).
license: Proprietary — Service Pow internal. Not for redistribution.
metadata:
  version: 1.0.0
  wave: 1
  owns_bible_sections: [characters, performance-direction]
---

# Human Performance Realism

## PURPOSE

Believable people. The audience cannot articulate why a generated human feels wrong, but they
always feel it — and it costs the ad its credibility in under a second.

**Realism comes from restrained physical behaviour, not from more acting.**

## TRIGGER

Storyboard contains people · writing performance direction · reviewing generated footage with
humans · "this person looks fake / dead-eyed / robotic" · casting a spokesperson.

## REQUIRED INPUTS

- Bible sections 4–6 (spine, script, shot list)
- The shot's emotional job from the beat map

## OPTIONAL INPUTS

Real reference footage of the real behaviour · casting references · client crew footage

## WORKFLOW

1. **Write the actor's brief per character, per beat** — not adjectives, but state:
   what they **want** · what they **feel** · what they **think** · what **just happened** · who
   they are **looking at** · what they are **trying not to show** · emotional **intensity** (1–10,
   and it is usually lower than instinct suggests).
2. **Source the emotion like a prop.** Take it from a real account where one exists. *"Tired,
   vindicated" from a real crew account produced a usable performance where "relieved" produced
   "pleased".* Precise emotional language generates precise behaviour.
3. **Write restraint into the direction explicitly.** State what they do *not* do: does not smile,
   does not gesture, does not look at camera.
4. **Inspect generated footage** against `references/realism-inspection.md` — eyes and gaze first,
   then hands and object contact, then weight and breathing.
5. **Rule:** ACCEPT · FIX (reframe/crop away the failure) · REGENERATE (with a changed
   performance brief, not just a reroll) · REDESIGN THE SHOT (frame out what cannot be generated).
6. **Write Bible section 7.**

## DECISION RULES

- **Reject on sight:** dead eyes · constant smiling · constant gesturing · robotic movement ·
  perfect symmetry · instant reactions · excessive acting.
- **The pause is the performance.** A held beat before a line reads as thought; an instant
  response reads as a machine.
- **Reaction delay is the cheapest realism there is.** Humans react late. Generated humans react
  on the frame.
- **Do not generate celebrations at readable distance (LB25).** Back-of-head, stillness, small
  business. Performed joy is the most reliably fake thing a model produces.
- **A visible speaking mouth with no audio is worse than no shot.** If the line is cut, the shot
  changes.
- **When a performance cannot be generated believably, reframe it.** Hands, backs, partial faces
  and over-shoulder framings carry emotion without asking the model for what it cannot do.
- **The "during" state of real work is real footage.** No performance direction rescues a
  generated version of skilled labour.

## OUTPUT CONTRACT

Bible section 7: character list, per-beat actor briefs, restraint instructions. Per-shot
inspection verdicts on generated footage with the specific tell identified.

## QUALITY GATES

- Every character has want / feel / think / just-happened / looking-at / hiding / intensity
- Restraint stated explicitly per shot
- Every generated human shot inspected against the checklist before it enters the cut
- No accepted shot exhibits a reject-on-sight tell

## FAILURE CONDITIONS

Raise a CONFLICT when: a beat requires a performance the models cannot deliver (precise hand
work, sustained emotional close-up, readable joy) · no real reference exists for a behaviour the
ad depends on.

## HANDOFF

→ `servicepow-storyboard-director` (direction folds into shots) and
`servicepow-higgsfield-production` (performance requirements constrain routing). Findings feed
`servicepow-creative-critic`.

## REFERENCE FILES

- `references/realism-inspection.md` — the full physical inspection list
- `agent-workspace/playbooks/ads/video-production.md` — LB25, emotion-as-prop learnings

## LEARNING BEHAVIOR

Performance briefs that produced believable results are logged with the exact wording — the
phrasing is the reusable asset. Failures are logged with the tell that gave them away.
