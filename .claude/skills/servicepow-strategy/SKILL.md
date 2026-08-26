---
name: servicepow-strategy
description: >
  Judges whether the offer and positioning are strong enough to advertise, then turns client and
  customer intelligence into advertising strategy — target, awareness level, objective, core
  message, angle, promise, proof, objection strategy, platform, CTA and success metric — with
  multiple angles ranked rather than one assumed. Use after client intelligence and before any
  creative concept work, or when an existing campaign is underperforming and the message may be
  the cause. It will say plainly when a weak offer, not weak creative, is the problem. Do NOT use
  to generate creative concepts or scripts, and do NOT use it to rubber-stamp a preferred angle.
license: Proprietary — Service Pow internal. Not for redistribution.
metadata:
  version: 1.0.0
  wave: 1
  owns_bible_sections: [offer-verdict, strategy]
  absorbs: offer-positioning
---

# Strategy

## PURPOSE

Decide what we are saying, to whom, why they should believe it — and refuse to paper over a weak
business proposition with better film-making.

*(This skill absorbs offer-positioning: the offer verdict is an input to strategy, not a separate
deliverable, and both write the same Bible section. It survives here as a hard blocking gate.)*

## TRIGGER

After `servicepow-client-intelligence` · "what should we say" · "what's the angle" · campaign
underperforming and message suspected · Karl proposes an angle and wants it pressure-tested.

## REQUIRED INPUTS

- Bible section 1 (Ground truth + Voice of customer), populated
- Campaign objective and platform intent

## OPTIONAL INPUTS

Budget · Karl's preferred angle · prior campaign results · competitor positioning

## WORKFLOW

1. **Run the offer gate first.** Answer, in order: What are we selling? Who is it for? Why should
   they care? Why this company? Why now? Why should they believe it? What reduces their risk?
   What action do we want? Then rule: **STRONG / ADEQUATE / WEAK**.
2. **If WEAK — stop and say so.** Name what would fix the proposition (a real guarantee, a
   sharper audience, a reason-to-believe, a price change). Do not proceed to angles.
3. **Set the frame:** target · awareness level (unaware → most aware) · objective · KPI.
4. **Generate three or more genuinely different angles.** Different *arguments*, not different
   adjectives. Each states: the claim, who it lands hardest on, the proof it needs, the objection
   it must survive.
5. **Rank them** on: relevance to the confirmed customer · strength of available proof ·
   differentiation · production feasibility · fit to platform and awareness level.
6. **Recommend one**, with the runner-up and what would make you switch.
7. **Define** core message, core promise, proof strategy, objection strategy, CTA, success metric.
8. **Write Bible section 2.**

## DECISION RULES

- **Do not automatically agree with Karl's angle.** Rank it honestly among the alternatives. If
  it loses, say why and recommend the winner. If he reaffirms, proceed and log it.
- **Awareness level drives structure.** A most-aware audience needs the offer early; an unaware
  audience needs the problem first. Getting this wrong wastes the hook.
- **No proof, no claim.** An angle whose proof is UNKNOWN is a hypothesis — label it and say what
  evidence would confirm it.
- **One core message.** If the strategy needs two, it is two campaigns.
- **Platform is a strategic choice, not a distribution afterthought** — it constrains length,
  hook speed and CTA.
- **Emergency/high-intent categories invert the usual rules:** speed, availability and proof of
  competence outrank brand charm. Do not import DTC playbooks into a trades emergency.

## OUTPUT CONTRACT

Bible section 2: offer verdict + reasoning, target, awareness level, core message, chosen angle
with ranked alternatives, promise, proof strategy, objection strategy, CTA, success metric.
Returns the verdict and the ranked angles to Karl for the strategy gate.

## QUALITY GATES

- Offer verdict stated explicitly, never skipped
- Three or more angles that differ in argument, not wording
- Chosen angle traceable to a CONFIRMED customer pain or desire
- Every claim mapped to proof, or labelled HYPOTHESIS
- Success metric is measurable and named

## FAILURE CONDITIONS

Stop and escalate when: offer verdict is WEAK · the only viable angle depends on an unsubstantiated
claim · the platform is incompatible with the objective · required proof is UNKNOWN and
unobtainable before the deadline.

## HANDOFF

→ `servicepow-creative-director` after Karl approves the strategy. Advances status to
`STRATEGY APPROVED`.

## REFERENCE FILES

- `../_shared/references/advertising-standard.md` — the five things the viewer must understand
- `../_shared/references/evidence-and-conflict.md`
- `agent-workspace/company/positioning-and-icp.md`, `pricing-and-packaging.md`
- `agent-workspace/operations/compliance.md` — what may be claimed at all

## LEARNING BEHAVIOR

Angle performance is written to `knowledge/campaign-results/` at campaign close — angle, audience,
platform, spend, result — so angle selection improves on evidence. One campaign never promotes an
angle to doctrine; three do.
