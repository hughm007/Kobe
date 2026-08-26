---
name: servicepow-script-director
description: >
  Writes advertising scripts that sound like a human being speaking rather than marketing copy
  read aloud — controlling spoken sentence length, cadence, pauses, breathing, hesitation,
  interruption, emotion and subtext, and keeping visuals, dialogue, voiceover and story all
  saying the same thing. Use after the creative spine and beat map are approved, when a script
  sounds robotic or corporate, or when dialogue must be written for generated performers. Do NOT
  use to invent story structure (that is servicepow-creative-spine) and do NOT use for written
  copy such as emails, landing pages or static ad headlines.
license: Proprietary — Service Pow internal. Not for redistribution.
metadata:
  version: 1.0.0
  wave: 1
  owns_bible_sections: [script]
---

# Script Director

## PURPOSE

Words that survive being spoken by a person. Most AI ad scripts fail not because the idea is
wrong but because no human talks like that.

## TRIGGER

After the beat map is approved · "write the script" · "this dialogue sounds robotic/corporate" ·
voiceover needed for an approved storyboard.

## REQUIRED INPUTS

- Bible section 4 (spine + beat map)
- Client `brand-guide.md` — voice, banned words, required legal lines

## OPTIONAL INPUTS

Customer verbatims from section 1 · casting intent · music intent · duration per beat

## WORKFLOW

1. **Write to the beat map, beat by beat.** Each line serves a beat's stated job. A line that
   serves no beat is cut.
2. **Write for the mouth, not the page.** Short spoken sentences. Contractions. One idea per
   breath. Read it aloud and time it — spoken words per second is the real duration constraint.
3. **Mark the performance in the script**: pauses, breaths, hesitations, interruptions, where a
   sentence changes speed. *Uniform slowness is its own robot — real speech changes speed within a
   sentence.*
4. **Use the customer's own words** where evidence exists. Their language converts because it is
   already how they think about the problem.
5. **Check subtext.** What is the character not saying? Restrained lines outperform explicit ones.
6. **Align the four channels:** visuals, dialogue, voiceover and story must communicate the same
   idea. If the voiceover explains what the picture already shows, cut the voiceover.
7. **Compliance pass:** every claim on the signed claims sheet, required legal lines present,
   banned words absent. Then write Bible section 5.

## DECISION RULES

- **Ban list:** corporate AI copy · fake enthusiasm · unnecessary exposition · marketing clichés ·
  any line no human would say unprompted. "Are you tired of…" and "You won't believe…" need a
  strategic justification or they do not ship.
- **The pause is the performance.** Silence carries more than an extra clause.
- **Do not narrate the visible.** A payoff without a visible cause is an assertion — show the
  labour instead of describing it.
- **A visible speaking mouth with no audio is worse than no shot** — if a line is cut, the shot
  changes too. Raise it with the storyboard.
- **Client voice outranks Service Pow voice** in the client's own materials.
- **Never write a testimonial for a synthetic person.** Never as a customer; fine as an actor —
  see `agent-workspace/operations/compliance.md`.

## OUTPUT CONTRACT

Bible section 5: script with performance marks, per-beat mapping, and timing estimate. Flags any
line whose claim is not yet substantiated.

## QUALITY GATES

- Every line maps to a beat
- Read-aloud timing fits the target duration
- No banned-list constructions without stated justification
- Claims substantiated or flagged; legal lines present
- Four channels aligned (nothing narrating what is already shown)

## FAILURE CONDITIONS

Raise a CONFLICT when: the beat map needs more time than the format allows · a required claim is
unsubstantiated · the client's voice and the strategy's angle contradict each other.

## HANDOFF

→ `servicepow-storyboard-director`. Performance marks feed
`servicepow-human-performance-realism`; audio intent feeds `servicepow-audio-director`.

## REFERENCE FILES

- `../_shared/references/advertising-standard.md`
- `agent-workspace/clients/<slug>/brand-guide.md` — voice, banned words
- `agent-workspace/operations/compliance.md` — claims, synthetic-person rule
- `agent-workspace/playbooks/ads/video-production.md` — speech-realism learnings

## LEARNING BEHAVIOR

Lines that failed on watch (robotic, unsayable, mistimed) are logged to
`knowledge/production-log/` with the diagnosis. Phrasing patterns that repeatedly survive are
proposed for the brand guide, not silently adopted.
