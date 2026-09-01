---
name: servicepow-creative-spine
description: >
  Turns an approved concept pack into the story spine and beat map that make ONE coherent
  advertisement rather than a sequence of unrelated clips: the nine spine decisions (core
  message, core promise, one primary emotion, viewer starting state, viewer ending state,
  narrative question, why the viewer keeps watching, final payoff, CTA logic), then a beat map
  where every beat declares what the viewer knows before and after, the emotional change, why
  the beat exists, and what it leads into — one shared body, payoff, and CTA for the whole pack
  plus a separate opening beat block per hook variant, with Smooth Advert Flow and the shuffle
  test enforced on every variant. Single owner of the anti-choppy doctrine cited by the
  storyboard, edit, and critique phases. Activates when the Campaign Director invokes the spine
  phase, or when the user explicitly asks for story structure, a beat map, or a diagnosis of an
  ad that feels choppy, disjointed, or like unrelated clips. Not for writing dialogue or shots —
  those follow from the spine. Generic advertising requests belong to
  servicepow-campaign-director.
license: Proprietary — Service Pow internal. Not for redistribution.
metadata:
  version: 2.0.0
---

# Creative Spine

## PURPOSE

Make the ad feel like one advertisement. Every later phase is downstream of this; if the spine
is weak, no amount of production quality rescues the sequence.

**The spine is built once for the pack.** The deliverable is one concept family × 3–5 hook
variants: **shared body, payoff and CTA; a different opening.** So the spine — message, promise,
emotion, narrative question, payoff, CTA logic — is decided once and is identical across every
variant. Only the **first beat block differs**, and each variant's opening must still hand off
cleanly into the shared body. A hook that needs its own body is a second concept, not a variant,
and goes back to `servicepow-creative-director`.

This skill is also the **single owner of the anti-choppy doctrine** —
`references/anti-choppy.md`. The storyboard, edit, and critique phases cite that file; no other
skill carries a copy.

## TRIGGER

Activates when (a) the Campaign Director invokes this phase (spine), or (b) the user explicitly
asks for spine work: "structure this", "build the beat map", story-structure design for an
approved concept, or a diagnosis of an existing ad that feels choppy, disjointed, or like
unrelated clips placed next to each other. Generic advertising requests belong to
servicepow-campaign-director. Do not activate before a concept is approved, and do not use this
skill to write dialogue or shots — those follow from the spine.

## INPUTS

Required:
- The approved strategy and approved concept, read from the Campaign Bible (path provided by
  the Campaign Director; section assignments per
  `../servicepow-campaign-director/references/bible-contract.md`).
- Target duration and platform.

Optional: reference-ad structural teardowns · music intent.

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
   "knows before".** That equality is the first mechanical invariant: it is what makes the body
   reusable. Where it fails, the hook is rewritten, never the body.
5. **Delete beats that fail their own row.** A beat where "knows before" equals "knows after" and
   the emotion is unchanged is not a beat — it is decoration.
6. **Check the chain, once per variant.** Each beat's "leads into" must match the next beat's
   "knows before", from that variant's hook all the way to the CTA — the second mechanical
   invariant. A break in that chain is where an ad becomes choppy; fix it here, where it costs
   nothing.
7. **Run the shuffle test on every variant** (`references/anti-choppy.md`). If any two beats
   could swap and nobody would notice, the flow is broken — rewrite the connection, do not
   reorder and hope.
8. **Write the spine section of the Campaign Bible** at the location the Campaign Director
   assigns (per the bible contract): one spine, one shared beat map, and the per-variant hook
   blocks.

## DECISION RULES

- **One primary emotion.** Two is a symptom of two ads.
- **A shot must never exist solely because it looks good.** That is the whole law —
  `references/anti-choppy.md`.
- **Every beat changes something** — what the viewer knows, or how they feel. Preferably both.
- **The narrative question is what holds attention.** Name it; if you cannot, the viewer will not
  stay past the hook.
- **The payoff must answer the narrative question**, not a different one.
- **Short does not mean shapeless.** A 15-second ad has three or four beats with the same
  obligations, not zero.
- **The in-world reason test applies to every beat:** the action has a reason inside the scene
  (`references/anti-choppy.md`).
- **The variants share a spine or they are not variants.** Different arguments across hooks means
  the pack is really several concepts — that is a concept problem, raised as a CONFLICT.
- **Every variant is a whole ad.** A hook that only works because the viewer saw a sibling
  variant first does not work; each is shown to a cold viewer alone.
- **The core promise is claim-shaped.** Nothing enters the spine as promise or payoff that the
  client cannot substantiate downstream per the claims policy.

## POLICY BINDINGS

- `../_servicepow/policies/claims-and-proof.md` — governs the core promise and final payoff
  decided here: both are claim-shaped and must be substantiable with an Evidence Record before
  delivery.
- `../_servicepow/policies/realism-and-disclosure.md` — constrains which hook and payoff
  mechanisms may involve synthetic people; the spine must not depend on a mechanism that policy
  forbids.
- `../_servicepow/data/blocking-checks.yaml` — the canonical blocking-check registry; the beat
  map built here is what downstream flow enforcement is judged against — disconnected flow is a
  hard failure at the critic's score floor (BC-22), and the hook block designed here is what the
  opening dead-space check (BC-14) later measures.
- `../_servicepow/data/roles.md` — role definitions; CONFLICTs raised by this skill go to the
  APPROVER, and the never-stall rule applies while a decision is awaited.

## OUTPUT CONTRACT

The spine section of the Campaign Bible (location assigned by the Campaign Director per
`../servicepow-campaign-director/references/bible-contract.md`): the full nine-decision spine +
the shared beat map table + one opening beat block per hook variant. Every beat row complete —
no blanks. Returns to the Campaign Director: the spine, the beat count, the variant count, and
the chain-check and shuffle-test result **for each variant**.

## QUALITY GATES

- Exactly one primary emotion, shared by the whole pack
- Every beat row fully populated
- The "leads into" → "knows before" chain is unbroken end to end, **per variant**
- Every variant's hook block hands off into the shared body's first "knows before"
- Shuffle test run on every variant
- Payoff answers the stated narrative question
- CTA follows without a hard turn

## FAILURE CONDITIONS

Raise a CONFLICT to the APPROVER rather than proceeding when: the approved concept cannot
produce a coherent beat chain · the duration cannot hold the beats the concept needs · the
concept's payoff does not answer any question the ad raises · **a hook variant cannot reach the
shared body without rewriting it** (that hook belongs to a different concept).

## HANDOFF

Return control to the Campaign Director, who routes downstream: the script phase
(`servicepow-script-director`) writes to this beat map, then the storyboard phase
(`servicepow-storyboard-director`) converts it to shots. Both are bound by this spine; neither
may change it without a CONFLICT entry. A hook that needs its own body goes back to
`servicepow-creative-director` as a second concept.

## REFERENCE FILES

- `references/anti-choppy.md` — the canonical anti-choppy doctrine: the eight questions, the
  shuffle test, Smooth Advert Flow, the pacing pattern, the trade rule, the in-world reason
  test, the failure shape. Downstream skills cite this copy; no other copy exists.
- `../servicepow-creative-director/references/advertising-standard.md` — the pack shape and
  advertising standard this spine serves.

## LEARNING BEHAVIOR

Beat structures that survive QC and perform are logged as **structures** in the client KB
production log, not just as ads. Structures that failed are kept with the diagnosis — a broken
chain is the most reusable lesson in the system.
