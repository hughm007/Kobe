# POLICY — GENERATION AND SPEND
Always-on company law. The single home of spend discipline for AI generation. Skills reference
this file; they do not restate it. Lineage: the Service Pow cost ladder + two-step spend gate,
reconciled per Run 2 Phase 9 — live tool state is queried, never hardcoded.

## 1. The sequence — no vendor default bypasses it
For any campaign/client generation spend, in order:
1. **Method before model.** The shot chooses a production method (real footage / composite /
   generated; see `policies/realism-and-disclosure.md`) before any model is named.
2. **Inspect live tool state.** Available models, workflows, params, plan, and balance are
   queried from the runtime (e.g. `higgsfield model list`, `higgsfield account status`,
   `higgsfield generate cost …`) at decision time, and every external tool operation is
   classified per the capability ladder (`vendor/CAPABILITY-LADDER.md`) — plans rely only on
   live-verified states. **Model IDs, plans, and credit balances are
   never hardcoded in doctrine** — any such number found in an active file is stale by
   definition and a validator failure.
3. **Expected cost stated** where the runtime can price it; summed for the plan.
4. **Apply this policy** (ladder, §2; savings rules, §3).
5. **SPEND_APPROVER approval** through the two-step gate: the plan and its cost are presented,
   and approval is given, before anything is fired. Drafting is always free; dispatching is the
   SPEND_APPROVER's. Vendor one-shot conveniences (fire-and-wait flags) are used only AFTER the
   gate, never instead of it. A pattern the SPEND_APPROVER has already approved in the client
   KB is proceed-and-inform, citing the precedent.
6. **Execute**, then report actual spend against estimate.

## 2. The cost ladder — never start above rung 1
Quality is cheap at the still frame and expensive at the master: fixing a frame is one image
job, fixing a clip is a video generation, fixing a master is a rebuild. The **ratios** are
stable even as models and prices change — exploration costs pennies; premium video costs
orders of magnitude more. Therefore:
- **Rung 1 — explore composition** on the cheapest capable image model (iterate freely; this is
  the only nearly-free rung).
- **Rung 2 — lock text and detail** on a text-capable image model once composition is settled.
  Identity assets are still composited, never generated (`policies/brand-assets.md`).
- **Rung 3 — cheap motion test** at low resolution: does the motion, performance, and physics
  hold?
- **Rung 4 — one premium final.** One generation, not a batch.

Which concrete model serves each rung is read from live tool state (§1.2), never from this file.

Legitimate skip: a shot already proven at rungs 1–3 in this campaign, re-rendered after a small
prompt change, may go straight to rung 4 — say so in the routing reason. "Deadline" is not a
legitimate reason.

## 3. Standing savings rules
One test before any batch · edit, don't re-roll (outpaint/upscale/reframe/remove-background) ·
reuse identity inputs (brand kit, product, avatar, references) to stop consistency re-rolls ·
don't pay for generated audio you will replace · right resolution for the placement · fast/mini
variants for tests, full quality for finals only · price before committing · check balance
before a batch and report spend after.

## 4. The two failure patterns to interrupt
**Premium-first** ("fire the expensive model to see if the idea works" — the idea is tested at
rung 1 for a fraction of a credit) and **batch-before-test** (one test tells you whether the
other five were worth firing).

## 5. Enforcement
Pre-spend gates live in the blocking-check registry (BC-29 preflight; BC-24/BC-34 storyboard
gates precede all spend). The Campaign Director owns WHEN generation may begin
(`STORYBOARD APPROVED`); this policy owns HOW spend is disciplined once it may.
