---
name: servicepow-strategy
description: >
  Advertising strategy for the strategy phase of a Service Pow campaign: judges whether the
  offer and positioning are strong enough to advertise (STRONG / ADEQUATE / WEAK, and WEAK stops
  the work), then turns confirmed client and customer intelligence into a full strategy — target,
  awareness level, objective, core message, THE ANGLE, promise, proof strategy, objection
  strategy, platform, CTA and success metric — with multiple genuinely different angles ranked
  rather than one assumed. Activates when the Campaign Director invokes the strategy phase, or
  when the user explicitly asks for advertising strategy, positioning judgment, angle development
  or angle pressure-testing, or suspects the message (not the creative) is why a campaign
  underperforms. It says plainly when a weak offer, not weak creative, is the problem. Not for
  creative concepts or scripts, and never to rubber-stamp a preferred angle; generic advertising
  requests belong to servicepow-campaign-director.
license: Proprietary — Service Pow internal. Not for redistribution.
metadata:
  version: 2.0.0
---

# Strategy

## PURPOSE

Decide what we are saying, to whom, and why they should believe it — and refuse to paper over a
weak business proposition with better film-making.

The offer verdict is an input to strategy, not a separate deliverable: this skill owns the offer
gate as a hard blocking step, and it owns THE ANGLE — the single definition of the campaign's
argument that all downstream creative work consumes.

## TRIGGER

Activates when (a) the Campaign Director invokes this phase (strategy), or (b) the user
explicitly asks for advertising strategy, positioning or offer-strength judgment, angle
development, angle ranking, or pressure-testing of a proposed angle — including when an existing
campaign is underperforming and the message is suspected. Generic advertising requests belong to
servicepow-campaign-director.

Typical entry points: after servicepow-client-intelligence completes · "what should we say" ·
"what's the angle" · the APPROVER proposes an angle and wants it pressure-tested.

## INPUTS

Required:
- The ground-truth and voice-of-customer intelligence in the Campaign Bible (path provided by
  the Campaign Director), populated by servicepow-client-intelligence
- Campaign objective and platform intent

Optional: budget · the APPROVER's preferred angle · prior campaign results · competitor
positioning · the client KB (positioning and ICP notes, pricing and packaging, compliance
constraints on what may be claimed, ad history, angle-performance history).

## WORKFLOW

1. **Run the offer gate first.** Answer, in order: What are we selling? Who is it for? Why
   should they care? Why this company? Why now? Why should they believe it? What reduces their
   risk? What action do we want? Then rule: **STRONG / ADEQUATE / WEAK**.
2. **If WEAK — stop and say so.** Name what would fix the proposition (a real guarantee, a
   sharper audience, a reason-to-believe, a price change). Do not proceed to angles.
3. **Set the frame:** target · awareness level (unaware → most aware) · objective · KPI.
4. **Generate three or more genuinely different angles.** Different *arguments*, not different
   adjectives. Each states: the claim, who it lands hardest on, the proof it needs, the
   objection it must survive.
5. **Rank them** on: relevance to the confirmed customer · strength of available proof ·
   differentiation · production feasibility · fit to platform and awareness level. Consult the
   client KB where it exists: angle-performance history informs the ranking, and the client's
   recent ad history informs rotation — the angle is chosen here, and its rotation is verified
   downstream at BC-24, so do not pick an angle the client just ran without saying why.
6. **Recommend one**, with the runner-up and what would make you switch.
7. **Define** core message, core promise, proof strategy, objection strategy, CTA, success
   metric. The core message must let a viewer pass the comprehension bar in
   `../servicepow-creative-director/references/advertising-standard.md`. Every claim the
   strategy relies on is mapped to an existing Evidence Record or to a concrete plan to obtain
   one, per `../_servicepow/policies/claims-and-proof.md`.
8. **Write the strategy section of the Campaign Bible** (structure and section ownership per
   `../servicepow-campaign-director/references/bible-contract.md`), including the offer verdict
   and its reasoning.

## DECISION RULES

- **Do not automatically agree with the APPROVER's angle.** Rank it honestly among the
  alternatives. If it loses, say why and recommend the winner. If the APPROVER reaffirms,
  proceed and log the decision.
- **Awareness level drives structure.** A most-aware audience needs the offer early; an unaware
  audience needs the problem first. Getting this wrong wastes the hook.
- **No proof, no claim.** An angle whose proof is UNKNOWN is a hypothesis — label it HYPOTHESIS
  and state what evidence would confirm it. Prefer angles that can demonstrate over angles that
  must assert. Evidence labels (CONFIRMED / INFERRED / UNKNOWN / HYPOTHESIS) follow
  `../servicepow-client-intelligence/references/evidence-ladder.md`; do not restate the ladder.
- **One core message.** If the strategy needs two, it is two campaigns.
- **Platform is a strategic choice, not a distribution afterthought** — it constrains length,
  hook speed and CTA.
- **Emergency/high-intent categories invert the usual rules:** speed, availability and proof of
  competence outrank brand charm. Do not import DTC playbooks into an emergency-service
  category.
- **Evidence, not repetition, promotes an angle.** One campaign's result never promotes an angle
  to doctrine; three do. Record angle performance (angle, audience, platform, spend, result) in
  the client KB at campaign close so ranking improves on evidence.

## QUALITY GATES

- Offer verdict stated explicitly, never skipped
- Three or more angles that differ in argument, not wording
- Chosen angle traceable to a CONFIRMED customer pain or desire
- Every claim mapped to proof (a citable Evidence Record or a plan to obtain one), or labelled
  HYPOTHESIS
- Success metric is measurable and named

## FAILURE CONDITIONS

Stop and escalate to the Campaign Director (and the APPROVER) when: the offer verdict is WEAK ·
the only viable angle depends on an unsubstantiated claim · the platform is incompatible with
the objective · required proof is UNKNOWN and unobtainable before the deadline. Escalation
follows the never-stall rule in `../_servicepow/data/roles.md`: park with a status header,
prepare the recommendation, move on.

## POLICY BINDINGS

- `../_servicepow/policies/claims-and-proof.md` — governs every claim an angle depends on: the
  evidence bar, Evidence Records the proof strategy must cite or plan, guarantee rules, and
  ad-to-destination parity the promise and CTA must survive.
- `../_servicepow/policies/realism-and-disclosure.md` — constrains the proof strategy: what
  synthetic media may and may not be framed as, which limits which demonstrations an angle can
  legitimately promise.
- `../_servicepow/data/blocking-checks.yaml` — the canonical blocking-check registry; this
  skill's outputs feed BC-16 (claim substantiation) and BC-24 (angle declared and rotated), which
  are enforced downstream at delivery.
- `../_servicepow/data/roles.md` — defines the APPROVER role that holds the strategy gate, and
  the never-stall rule for parked gates.

## OUTPUT CONTRACT

The strategy section of the Campaign Bible, containing: offer verdict + reasoning · target ·
awareness level · core message · THE ANGLE (the chosen angle, stated as claim + who it lands
hardest on + its proof + the objection it survives) with ranked alternatives · core promise ·
proof strategy (Evidence Record citations or acquisition plan; hypotheses labelled) · objection
strategy · platform choice · CTA · success metric.

Returns the offer verdict and the ranked angles to the APPROVER for the strategy gate. A WEAK
verdict is itself a complete, valid output of this skill.

## HANDOFF

→ `servicepow-creative-director` after the APPROVER approves the strategy. Advances campaign
status to `STRATEGY APPROVED`.

This skill is the **single owner of THE ANGLE definition**: the creative director consumes the
approved angle exactly as written here and does not redefine, broaden, or swap it. Any
downstream desire to change the angle returns to this skill for re-ranking and a fresh APPROVER
decision. All sequencing and campaign state remain with servicepow-campaign-director.
