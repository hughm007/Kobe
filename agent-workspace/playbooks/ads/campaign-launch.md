---
title: Campaign Launch
type: playbook
client: internal
owner: NEEDS INPUT
status: active
created: 2026-08-24
updated: 2026-08-24
tags: [ads, paid-media, campaign, launch]
---

# Campaign Launch

**When to use:** any paid campaign, on any platform.
**NEEDS INPUT:** platform-specific build steps once the platforms are confirmed in
[`../../company/services.md`](../../company/services.md). The structure below holds
regardless of channel.

---

## The gate

**No budget is spent until all five are written down and agreed:**

1. **Objective** — the business outcome, not the platform metric. "40 qualified enquiries
   a month", not "reach".
2. **Target cost per outcome** — what the client can afford to pay for that outcome, and
   the reasoning behind the number.
3. **Audience** — who, and why them.
4. **Measurement** — what we're tracking, where it's tracked, and *verified as working*.
5. **Window** — how long before we judge it, and what a decision looks like at that point.

If any of the five is missing, the campaign isn't ready. This gate exists because
campaigns without it can't be evaluated, only argued about.

---

## 1. Plan

- Objective and target cost per outcome, from the gate above
- Budget, and how it splits across campaigns or platforms
- Audience definition — and the reasoning, so it can be revisited later
- Offer: what the ad actually asks the person to do, and why they'd want to
- Landing destination: does it exist, does it match the ad's promise, does it convert?
  *An ad pointing at a weak page is money spent teaching the platform to find people who
  don't convert.*
- Competitive scan — what everyone else in this market is saying, so we don't say it too
- Compliance check: platform policies, regulated claims, required disclosures

Write it into the client's `campaigns/` folder before building anything.

## 2. Build

- Account structure that reflects the strategy and can actually be read in reporting
- Naming convention applied consistently — future you needs to filter on it
- Audiences and exclusions set, including excluding existing customers where relevant
- Budget and bidding configured to the strategy, not the default
- Schedule, geography, placements and devices deliberately chosen
- Creative uploaded — each variant tied to a hypothesis
  (see [`creative-testing.md`](creative-testing.md))
- Tracking: conversion events, UTM parameters, pixel/tag verified firing
- Frequency caps and negative keywords / exclusions where the platform supports them

## 3. Pre-launch QA

- ☐ Every link tested — correct destination, correct UTMs, no broken parameters
- ☐ **Conversion tracking fires a real test conversion** before spend starts
- ☐ Landing page loads fast on mobile and matches the ad's promise
- ☐ Budget and schedule correct — check for a daily budget that's actually the monthly one
- ☐ Geography and audience correct — a mis-set radius burns budget quietly
- ☐ Ad copy proofread; claims are ones the client can substantiate
- ☐ Creative renders correctly in every placement, including crops
- ☐ Client approval on record for creative and claims
- ☐ Exclusions applied
- ☐ Someone is genuinely ready to handle the leads this produces

## 4. Launch and early watch

- Confirm delivery started and spend is pacing as expected
- **First 24 hours:** check for the loud failures — no delivery, runaway spend,
  disapprovals, broken destination. Don't optimise yet.
- **First week:** let the platform learn. Resist reacting to early noise; premature
  changes reset learning and cost more than the impatience saves.
- Verify conversions are recording against real outcomes, not phantom events

## 5. Optimise

Change one meaningful thing at a time, and write down what you changed and why. A
campaign with an undocumented change history can't be learned from.

- Compare against the target cost per outcome, not against yesterday
- Cut what's clearly failing once it's had enough data to be clearly failing
- Scale what's working — gradually; step changes in budget disrupt delivery
- Refresh creative before fatigue shows in the numbers, not after
- Feed learnings to [`../../knowledge/learnings/`](../../knowledge/learnings/) as you go,
  not at the end when you've forgotten the detail

## 6. Report and close

- Report against the objective set in the gate — see
  [`../client-lifecycle/reporting.md`](../client-lifecycle/reporting.md)
- Write the postmortem into `knowledge/learnings/`, **whether it won or lost**. Losses
  usually teach more, and they're the ones that get quietly skipped.

---

## Common failures

| Failure | Prevention |
|---|---|
| Launched without verified conversion tracking | Fire a real test conversion before spend |
| Judged after three days | Agree the measurement window at the gate |
| Great ad, weak landing page | Assess the destination before booking budget |
| Broke a winner by changing five things at once | One variable at a time, logged |
| Budget set daily when the client meant monthly | It's on the QA checklist. Read it twice. |
| Client can't handle the lead volume | Ask in planning who's answering the phone |
| "It didn't work" with no record of what was tried | Log every change as you make it |

## Related

- [`creative-testing.md`](creative-testing.md)
- [`../client-lifecycle/reporting.md`](../client-lifecycle/reporting.md)
- [`../../templates/campaign-brief.md`](../../templates/campaign-brief.md)
