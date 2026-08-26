---
name: servicepow-higgsfield-production
description: >
  Decides how each approved shot is actually produced — full generation, reference-driven
  generation, real product in AI environment, real footage plus AI, compositing, traditional
  editing or hybrid — then routes it to a model with a stated reason, a backup, references,
  known risks, credit cost and a regeneration strategy, following the Service Pow cost ladder so
  exploration happens on cheap models and premium renders are single and final. Use after a shot
  list is approved and before any credits are spent, or whenever a generation is about to be
  fired. Do NOT use to research what models exist (that is servicepow-higgsfield-intelligence)
  and do NOT use to write the shot list.
license: Proprietary — Service Pow internal. Not for redistribution.
metadata:
  version: 1.0.0
  wave: 1
  owns_bible_sections: [production-plan, model-routing, credit-budget, production-risks]
  absorbs: credit-guard
---

# Higgsfield Production

## PURPOSE

Get each shot made the cheapest way that meets its objective — and stop the two classic money
fires: premium renders fired before the idea is settled, and batches fired before one test.

**THE SHOT CHOOSES THE MODEL. The model never dictates the creative.**

## TRIGGER

After `STORYBOARD APPROVED` · "how do we make this shot" · "which model" · before any Higgsfield
generation for campaign work · a shot failed and needs a different production method.

## REQUIRED INPUTS

- Bible section 6 + `shotlist.md` (shots with model *requirements*)
- Current `higgsfield-capability-map.md`
- Credit budget for the campaign

## OPTIONAL INPUTS

Real client assets · brand kit · character/product references · deadline

## WORKFLOW

1. **Check the map's freshness.** If the rows you need are stale, run
   `servicepow-higgsfield-intelligence` first. Routing on stale facts is how expensive mistakes
   start.
2. **Choose the production method per shot, before choosing any model:**
   full generation · reference-driven generation · real product + AI environment · real footage +
   AI · compositing · traditional editing · hybrid.
   *Marks, packaging text, UI and legal copy are always composite (LB24). The "during" state of
   real work is real footage.*
3. **Climb the cost ladder** — `references/cost-ladder.md`. Never start at the top.
4. **Route each shot** with: shot objective · requirements · model · **why** · backup model ·
   references · physical prompt · known risks · **credit cost** · regeneration strategy.
5. **Price before committing.** Read the real cost; do not assume a tier. Sum the plan and
   compare to budget *before* the first generation.
6. **Generate in the right order:** cheapest proof of the idea first, one test before any batch,
   premium render last and once.
7. **Log every generation** to `agent-workspace/knowledge/production-log/` — model, settings,
   references, expected vs actual, cost.
8. **Write Bible section 10.**

## DECISION RULES

- **Explore cheap, finish expensive.** Composition is settled on the cheapest capable model.
- **One test before any batch.** Never fire six premium generations simultaneously — that is a
  recorded 195-credit lesson, not a hypothetical.
- **Prefer an edit to a re-roll.** `outpaint`, `upscale`, `reframe`, `remove_background` fix more
  than they are given credit for; an all-crop outpaint is served locally free.
- **Reuse identity instead of re-rolling for it** — references, brand kit, product and avatar
  entries exist precisely to stop consistency re-rolls.
- **Turn off what you are not using.** Generated audio you will replace with a licensed track is
  paid-for waste (`sound: 'off'` on Kling).
- **Sunk credits never justify a weak clip.** ~⅓ of generated material ships; that is the
  expected rate.
- **Diagnose configuration before blaming the model** — and price the model before assuming it.
- **Spending is Karl's.** Generation runs behind the two-step confirmation gate; the plan and its
  cost are presented before anything is fired.

## OUTPUT CONTRACT

Bible section 10: method + routing per shot, total credit estimate vs budget, risks, regeneration
strategy. Returns the routing table and cost estimate for Karl's approval **before** spend.

## QUALITY GATES

- Every shot has a method chosen before a model
- Every routed shot names a reason and a backup
- Total estimated cost stated and compared to budget
- Composite shots flagged; no shot routes a mark or legal text to a generator
- Cheapest-capable-model rule visibly applied at each ladder rung

## FAILURE CONDITIONS

Stop and raise rather than spend when: estimated cost exceeds budget · a shot needs a capability
listed as a known failure mode · the map is stale for a decisive row · required references do not
exist.

## HANDOFF

→ generation → `servicepow-continuity-supervisor` (drift checks between generations) →
`servicepow-cinematography-editor`. Failures return here for re-routing.

## REFERENCE FILES

- `references/cost-ladder.md` — the ladder, with real numbers
- `../servicepow-higgsfield-intelligence/references/higgsfield-capability-map.md`
- `agent-workspace/playbooks/ads/video-production.md` — frame-vs-clip-vs-master cost logic

## LEARNING BEHAVIOR

Every generation writes a production-log row (model, settings, expected, actual, failure, cause,
correction, cost). Repeated failures become routing rules only after the EXPERIMENTAL → REPEATED
→ VALIDATED path — one bad generation never rewrites routing.
