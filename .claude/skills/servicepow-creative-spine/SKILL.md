---
name: servicepow-creative-spine
description: >
  Turns an approved creative concept into ONE coherent advertisement rather than a sequence of
  unrelated clips — defining core message, core promise, primary emotion, the viewer's starting
  and ending state, the narrative question, why the viewer keeps watching, the final payoff and
  the CTA logic, then building the beat map where every beat declares what the viewer knows
  before and after, the emotional change, why it exists and what it leads into. This is the
  anti-choppy authority for the campaign. Use after a concept is approved and before any script,
  shot list or generation. Do NOT use to write dialogue or shots — those follow from the spine.
license: Proprietary — Service Pow internal. Not for redistribution.
metadata:
  version: 1.0.0
  wave: 1
  owns_bible_sections: [creative-spine, beat-map]
  criticality: high
---

# Creative Spine

## PURPOSE

Make the ad feel like one advertisement. Every later skill is downstream of this; if the spine is
weak, no amount of production quality rescues the sequence.

## TRIGGER

After `CONCEPT APPROVED` · "structure this" · "build the beat map" · an existing ad feels choppy,
disjointed, or like unrelated clips · before any script or storyboard work.

## REQUIRED INPUTS

- Bible sections 2–3 (approved strategy, approved concept)
- Target duration and platform

## OPTIONAL INPUTS

Reference ad structural teardowns · music intent

## WORKFLOW

1. **Fix the spine in one pass** — these are decisions, not options:
   core message · core promise · primary emotion (**one**) · viewer starting state · viewer
   ending state · narrative question · why the viewer keeps watching · final payoff · CTA logic.
2. **State the CTA logic explicitly:** why does the requested action follow *naturally* from what
   the viewer just experienced? If the CTA needs a hard turn to arrive, the spine is wrong.
3. **Build the beat map.** For every beat: what the viewer knows before · what happens · what the
   viewer knows after · emotional change · **why this beat exists** · what it naturally leads into.
4. **Delete beats that fail their own row.** A beat where "knows before" equals "knows after" and
   the emotion is unchanged is not a beat — it is decoration.
5. **Check the chain.** Each beat's "leads into" must match the next beat's "knows before". A
   break in that chain is where an ad becomes choppy — fix it here, where it costs nothing.
6. **Write Bible section 4.**

## DECISION RULES

- **One primary emotion.** Two is a symptom of two ads.
- **A shot must never exist solely because it looks good.** That is the whole law —
  `../_shared/references/anti-choppy.md`.
- **Every beat changes something** — what the viewer knows, or how they feel. Preferably both.
- **The narrative question is what holds attention.** Name it; if you cannot, the viewer will not
  stay past the hook.
- **The payoff must answer the narrative question**, not a different one.
- **Short does not mean shapeless.** A 15-second ad has three or four beats with the same
  obligations, not zero.
- **In-world reason test (LB31)** applies to every beat: the action has a reason inside the scene.

## OUTPUT CONTRACT

Bible section 4: full spine + beat map table. Every beat row complete — no blanks. Returns the
spine and beat count with the chain-check result.

## QUALITY GATES

- Exactly one primary emotion
- Every beat row fully populated
- The "leads into" → "knows before" chain is unbroken end to end
- Payoff answers the stated narrative question
- CTA follows without a hard turn

## FAILURE CONDITIONS

Raise a CONFLICT rather than proceeding when: the approved concept cannot produce a coherent
beat chain · the duration cannot hold the beats the concept needs · the concept's payoff does
not answer any question the ad raises.

## HANDOFF

→ `servicepow-script-director`, then `servicepow-storyboard-director`. Both are bound by this
spine; neither may change it without a CONFLICT entry.

## REFERENCE FILES

- `../_shared/references/anti-choppy.md` — the eight questions, the failure shape
- `../_shared/references/advertising-standard.md`
- `agent-workspace/playbooks/ads/video-production.md` — three-state structure, LB31

## LEARNING BEHAVIOR

Beat structures that survive QC and perform are logged to `knowledge/campaign-results/` as
structures, not just as ads. Structures that failed are kept with the diagnosis — a broken chain
is the most reusable lesson in the system.
