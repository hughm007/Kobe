---
name: servicepow-higgsfield-production
description: >
  Per-shot production routing for Higgsfield generation work, and the live vendor-capability
  intelligence that routing depends on. Decides how each approved shot is actually produced —
  full generation, reference-driven generation, real product in an AI environment, real footage
  plus AI, compositing, traditional editing, or hybrid — then routes it to a model chosen from
  live tool state with a stated reason, a backup, references, known risks, an expected cost
  priced by the runtime, and a regeneration strategy, and presents the priced plan to the
  SPEND_APPROVER before anything is fired. Activates when (a) the Campaign Director invokes the
  production-routing phase, or (b) the user explicitly asks how a shot should be produced, which
  model or method fits a shot, for a per-shot routing plan or generation cost estimate, what the
  Higgsfield toolset can currently do, or for re-routing after a failed generation. Generic
  advertising requests belong to servicepow-campaign-director. Not for writing the shot list and
  not for post-generation QC.
license: Proprietary — Service Pow internal. Not for redistribution.
metadata:
  version: 2.2.0
---

# Higgsfield Production

## PURPOSE

Get each shot made the cheapest way that meets its objective — and interrupt the two classic
money fires named in the spend policy: premium renders fired before the idea is settled, and
batches fired before one test.

**THE SHOT CHOOSES THE MODEL. The model never dictates the creative.** A model's signature look
is a reason to pick it only when the shot already wants that look.

This skill also owns the intelligence its routing depends on: what the vendor toolset can do
right now is queried live and date-stamped at decision time, never remembered. Today's best
model is not a permanent fact, and routing on stale beliefs is how expensive mistakes start.

## TRIGGER

Activates when (a) the Campaign Director invokes this phase (production routing — after
`STORYBOARD APPROVED`, before any generation spend, and again whenever a shot fails and needs a
different production method), or (b) the user explicitly asks how a shot should be produced,
which model or method fits a shot, for a per-shot routing plan or a generation cost estimate,
what the Higgsfield toolset can currently do, or for re-routing after a failed generation.
Generic advertising requests belong to servicepow-campaign-director.

## INPUTS

**Required**
- The Campaign Bible's approved shot list / storyboard section (location per the bible
  contract — `../servicepow-campaign-director/references/bible-contract.md`), with
  each shot's *requirements* (what it must achieve, not which model to use)
- The campaign's generation budget
- Access to the Higgsfield CLI/connector available in the session

**Optional**
- Real client assets · brand kit · character/product/avatar references (the client KB) ·
  deadline · the client KB production log (prior failures and validated routing notes)

## WORKFLOW

1. **LIVE TOOL STATE.** Query the runtime at decision time, via whichever vendor CLI/connector
   the session provides: the model catalogue (model list), per-model parameters, durations,
   resolutions and cost-relevant levers (model get), pricing for the intended settings
   (generate cost), and plan/balance (account status). Date-stamp what was learned. Anything
   learned that changes routing — a new model, a price shift, a capability change — is recorded
   in the client KB with source, date, and evidence status. Model IDs, prices, plans, and
   balances are never written into durable doctrine (`../_servicepow/policies/generation-and-spend.md` §1);
   an undated capability claim is treated as unknown.
2. **Choose the production method per shot, before any model is named**, using the canonical
   route enum (GENERATE / REFERENCE-GROUNDED / COMPOSITE / ILLUSTRATE / REAL-ASSET /
   REQUEST-FOOTAGE / EDIT-ONLY / AVOID) — per
   `references/shot-routing.md`, the single home of the routing table, its evidence, and the
   preflight-before-spend and recover-before-regenerate rules (registry gate BC-43): hybrids are declared as a primary route plus
   modifiers. Method is constrained by policy before
   preference: shots containing exact identity assets are COMPOSITE shots
   (`../_servicepow/policies/brand-assets.md`), and the footage hierarchy plus the
   skilled-labour-in-progress rule (`../_servicepow/policies/realism-and-disclosure.md`)
   decide when a beat is real footage rather than generated. A shot resolved to real footage,
   traditional editing, or pure compositing exits model selection entirely.
3. **Place each generated shot on the cost ladder** (`../_servicepow/policies/generation-and-spend.md` §2),
   entering at rung 1; a legitimate skip is stated in the routing reason per that policy.
4. **Route each shot** with a full routing record (`templates/routing-record.md`): shot
   objective · requirements · method · ladder rung · model (from live state) · why this model ·
   backup model · references used · physical prompt · known risks with evidence status ·
   expected cost as priced by the runtime · regeneration strategy. Apply the standing savings
   rules of the spend policy §3 shot by shot, naming in the routing reason which ones bind.
5. **Price the plan before committing.** Every cost read from the runtime, never assumed from a
   remembered tier. Sum the plan and compare to the campaign budget *before* the first
   generation.
6. **Present the plan to the SPEND_APPROVER** through the two-step gate
   (`../_servicepow/policies/generation-and-spend.md` §1): the routing table and total expected
   cost versus budget. Nothing fires before approval; BC-29 preflight must pass before any
   generation.
7. **Execute approved generations in ladder order:** cheapest proof of the idea first, one test
   before any batch, premium final last and once — the sequencing discipline is the spend
   policy's; this step is where it is physically obeyed.
8. **Log every generation** to the client KB production log — model, settings, references,
   expected vs actual, cost, date — and report actual spend against estimate.
9. **Write the production-plan section** of the Campaign Bible at the location the Campaign
   Director assigns (per the bible contract).

## DECISION RULES

- **The shot chooses the model; the model never dictates the creative.** If a shot's routing
  reason reads "because this model is impressive," it is not a reason.
- **Method before model, per shot.** Model selection begins only after the method question is
  settled — and only for shots whose method involves generation.
- **Evidence discipline for capability claims:** DOCUMENTED (vendor docs/API) < VENDOR CLAIM
  (marketing) < INDEPENDENT TEST (credible third party) < SERVICE POW TEST (we ran it). Where
  they disagree, our own test wins for our work. Undated is unusable.
- **Cheap facts are still facts.** Low-cost model behaviour is recorded as carefully as
  premium behaviour — the cheap models carry most of the exploration work.
- **Do not extrapolate from one generation.** One failure is EXPERIMENTAL; it becomes a
  routing rule only through the EXPERIMENTAL → REPEATED → VALIDATED path.
- **Diagnose configuration before blaming the model** — and price the model before assuming a
  tier. Most "model failures" are settings, references, or prompt physics.
- **Prefer an edit to a re-roll, and reuse identity instead of re-rolling for it** — routed
  per the savings rules in the spend policy §3; the routing record's regeneration strategy
  says which edit ops are the first resort for that shot.
- **Sunk credits never justify a weak clip.** Roughly a third of generated material ships;
  that is the expected rate, not a failure — plan and budget accordingly.
- **Spending authority is the SPEND_APPROVER's.** This skill drafts and prices; it never
  fires ahead of the gate.

## QUALITY GATES

- Every shot has a method chosen before a model is named
- Every routed shot carries a reason, a backup, known risks, and a regeneration strategy
- Every model and cost in the plan traces to a live runtime query from this session, dated
- Total expected cost stated and compared to budget before the gate
- COMPOSITE shots flagged; no exact identity asset routed to a generator
- Ladder rung stated per shot; any skip justified in the routing reason
- The plan reached the SPEND_APPROVER before any generation fired; BC-29 preflight pasted

## FAILURE CONDITIONS

Stop and raise to the Campaign Director (risk acceptances belong to the APPROVER) rather than
spend when: expected cost exceeds budget · a shot needs a capability our own production log
records as a SERVICE POW TEST failure mode · the runtime cannot be queried (never route on
remembered facts) · required references do not exist · a routed model has disappeared from the
live catalogue.

## POLICY BINDINGS

- `../_servicepow/policies/generation-and-spend.md` — the sequence, cost ladder, standing
  savings rules, live-tool-state requirement, and two-step SPEND_APPROVER gate that this
  skill executes shot by shot.
- `../_servicepow/policies/brand-assets.md` — decides which shots are COMPOSITE; exact
  identity assets are never routed to a generator by this skill.
- `../_servicepow/policies/realism-and-disclosure.md` — the footage hierarchy and
  synthetic-people constraints that settle a shot's method before any model is considered.
- `../_servicepow/data/blocking-checks.yaml` — the canonical blocking-check registry; BC-29
  (preflight before generation) gates every firing this skill plans, and BC-24 / BC-34 must
  already be green before this phase spends anything.
- `../_servicepow/data/roles.md` — OPERATOR builds the plan, runs live queries, and executes
  approved generations; SPEND_APPROVER authorizes spend; APPROVER accepts high-risk routings.

## OUTPUT CONTRACT

The production-plan section written into the Campaign Bible at its assigned location (per
`../servicepow-campaign-director/references/bible-contract.md`): the per-shot routing
table with every routing-record field, total expected cost versus budget, plan-level risks,
and the regeneration strategy. The routing table and priced plan are returned to the
SPEND_APPROVER through the two-step gate **before** any spend; the Campaign Director receives
what was routed, what is blocked, and any open conflict.

## HANDOFF

Approved plan → OPERATOR executes generation in ladder order, returning to the Campaign
Director between phases (no lateral state): drift checks by
`servicepow-continuity-supervisor`, then assembly by `servicepow-cinematography-editor`. Failed generations return here for re-routing, with the
failure logged first. Capability learnings land in the client KB per LEARNING BEHAVIOR.

## REFERENCE FILES

- `templates/routing-record.md` — the per-shot routing record every shot in the plan fills

## LEARNING BEHAVIOR

Every generation writes a production-log row in the client KB — model, settings, references,
expected vs actual, failure, cause, correction, cost — date-stamped at run time. Failure modes
observed on our own work carry SERVICE POW TEST status, the only status measured on our
output. A finding becomes a routing rule only through EXPERIMENTAL → REPEATED → VALIDATED; one
bad generation never rewrites routing. Model IDs, prices, plans, and balances appear only in
dated log rows and session notes — never in this skill's doctrine.
