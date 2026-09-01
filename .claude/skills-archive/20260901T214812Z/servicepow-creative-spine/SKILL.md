---
name: servicepow-creative-spine
description: >
  Turns an approved concept pack into ONE coherent advertisement rather than a sequence of
  unrelated clips — defining core message, core promise, primary emotion, the viewer's starting
  and ending state, the narrative question, why the viewer keeps watching, the final payoff and
  the CTA logic, then building the beat map where every beat declares what the viewer knows
  before and after, the emotional change, why it exists and what it leads into. Builds ONE shared
  body, payoff and CTA for the whole pack plus a separate opening beat block per hook variant,
  and enforces Smooth Advert Flow and the shuffle test on every variant. This is the anti-choppy
  authority for the campaign. Use after a concept is approved and before any script, shot list or
  generation. Do NOT use to write dialogue or shots — those follow from the spine.
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

**The spine is built once for the pack.** The deliverable is one concept family × 3–5 hook
variants: **shared body, payoff and CTA; a different opening.** So the spine — message, promise,
emotion, narrative question, payoff, CTA logic — is decided once and is identical across every
variant. Only the **first beat block differs**, and each variant's opening must still hand off
cleanly into the shared body. A hook that needs its own body is a second concept, not a variant,
and goes back to `servicepow-creative-director`.

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
3. **Build the shared beat map** — body, payoff, CTA. For every beat: what the viewer knows
   before · what happens · what the viewer knows after · emotional change · **why this beat
   exists** · what it naturally leads into.
4. **Build one opening beat block per hook variant.** Each carries its own hook mechanism and its
   own "what the viewer knows after" — and **every one of them must equal the shared body's first
   "knows before".** That equality is what makes the body reusable; where it fails, the hook is
   rewritten, never the body.
5. **Delete beats that fail their own row.** A beat where "knows before" equals "knows after" and
   the emotion is unchanged is not a beat — it is decoration.
6. **Check the chain, once per variant.** Each beat's "leads into" must match the next beat's
   "knows before", from that variant's hook all the way to the CTA. A break in that chain is where
   an ad becomes choppy — fix it here, where it costs nothing.
7. **Run the shuffle test on every variant.** If any two beats could swap and nobody would notice,
   the flow is broken — rewrite the connection, do not reorder and hope.
8. **Write Bible section 4** — one spine, one shared beat map, and the per-variant hook blocks.

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
- **The variants share a spine or they are not variants.** Different arguments across hooks means
  the pack is really several concepts — that is a concept problem, raised as a CONFLICT.
- **Every variant is a whole ad.** A hook that only works because the viewer saw a sibling variant
  first does not work; each is shown to a cold viewer alone.

## OUTPUT CONTRACT

Bible section 4: full spine + the shared beat map table + one opening beat block per hook variant.
Every beat row complete — no blanks. Returns the spine, the beat count, the variant count, and the
chain-check and shuffle-test result **for each variant**.

## QUALITY GATES

- Exactly one primary emotion, shared by the whole pack
- Every beat row fully populated
- The "leads into" → "knows before" chain is unbroken end to end, **per variant**
- Every variant's hook block hands off into the shared body's first "knows before"
- Shuffle test run on every variant
- Payoff answers the stated narrative question
- CTA follows without a hard turn

## FAILURE CONDITIONS

Raise a CONFLICT rather than proceeding when: the approved concept cannot produce a coherent
beat chain · the duration cannot hold the beats the concept needs · the concept's payoff does
not answer any question the ad raises · **a hook variant cannot reach the shared body without
rewriting it** (that hook belongs to a different concept).

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
