---
title: "TripNerd — boost brief and approval order (October 2026)"
type: template
client: tripnerd
owner: Karl
status: active
created: 2026-10-05
updated: 2026-10-05
tags: [client, instagram, boost, paid, approval, spend, test-month]
---

# Boost brief and approval

**State on 2026-10-05: no boost is approved.** TripNerd hasn't set a ceiling, and the ad account isn't in partner access.

**What TripNerd was asked** (PDF page 2; plan [§5b](../2026-10-test-month-plan.md)):
- No boost until a Reel proves itself organically. **From week 3** (19 Oct on), boost **the best organic Reel only**.
- TripNerd sets the ceiling (**$250–$500 suggested for October**).
- **On top of the $1,500**, paid to Meta from TripNerd's ad account. Nothing is spent without TripNerd's sign-off.
- **Reported separately** from organic.

**Two things to keep in mind:**
- **Boost follows inflate the follower count.** The November review reads **organic follows only**. Keep every boost's results in their own table (Monday report §8).
- **Running boosts is ServicePOW labor that isn't priced in the $1,500.** Whether to charge for it is **Karl's call**.

## 1. The brief (fill one per boost)

| Field | What goes in it | This boost |
|---|---|---|
| **Post** | The Reel, its date, and why it's "the best organic Reel": its follows and sends per reach from the Monday report, with the source | |
| **Objective** | One goal. For October, follows: pick the goal in Meta's boost flow that leads there (check the live options; profile visits is the likely fit) | |
| **Audience** | Who sees it, written plainly (for example, people interested in golf events in TripNerd's markets). **NEEDS INPUT** each time: TripNerd's markets and whether to include past engagers | |
| **Ceiling** | The total TripNerd approved in writing, in USD. Never above it | |
| **Dates** | Start and end dates (ET). Not before week 3 | |
| **Success measure** | The number that says it worked (for example, cost per follow or cost per profile visit), and the level we'd call good. **NEEDS INPUT**: no benchmark is agreed | |
| **Stop rule** | When we stop early: the ceiling is reached; the end date passes; the cost per result runs above [level] after [time]; a comment or brand problem; TripNerd asks to stop | |
| **Organic vs paid kept separate** | How the results are split: the boost's own results from Meta's boost results (or Ads Manager) go in Monday report §8 only. Organic follows are read from Insights. Which Insights views separate paid from organic is UNVERIFIED: check live, and never subtract by guesswork | |
| **Spend record** | Who approved, when, the amount, and the actual spend at the end | |

## 2. Approval order (in this order, no skipping)

| Step | What | Who | Done when | Recorded in |
|---|---|---|---|---|
| 1 | **TripNerd's written yes, with the amount** | TripNerd (Jason or the named approver) | An email or message giving the ceiling in USD, for this boost or for October | Approvals log (§3); tracker → Decisions |
| 2 | **Karl as SPEND_APPROVER** | Karl | Karl approves this brief (post, ceiling, dates, stop rule) per [`generation-and-spend.md`](../../../../../../.claude/skills/_servicepow/policies/generation-and-spend.md) and the SPEND_APPROVER gate | Approvals log |
| 3 | **Ad account added to partner access** | TripNerd's portfolio admin; Karl tests | In TripNerd's business portfolio: Settings → Users → Partners → ServicePOW → add the ad account. Karl confirms it shows in ServicePOW's portfolio. It's excluded until now ([`meta-partner-access.md`](../../../../../playbooks/client-lifecycle/meta-partner-access.md) step 4). Which permission level to grant: check Meta's live options | [`../../../access-and-accounts.md`](../../../access-and-accounts.md) (pointer only) |
| 4 | **The boosted Reel re-checked by the campaign director** | `servicepow-campaign-director` | The Reel passes again as a paid piece, against the canonical blocking-check registry (campaign README §6: a Reel that will be boosted goes through the campaign director first). Organic approval isn't enough | The Reel's campaign Bible (campaign director) |
| 5 | **Reporting** | Karl / Claude | The boost's results are in Monday report §8, apart from organic, with the source and date range. Actual spend against the ceiling | Monday report §8; approvals log (actual spend) |

Only after step 4 does anyone press Boost. **Nothing is spent on silence**, and a change to the amount, the post or the dates goes back to step 1.

Reporting and audit of paid results can use `claude-ads-audit` (audit and reporting only; it never changes the account).

## 3. Approvals log

| Date | Post | TripNerd's yes (amount, who, where) | SPEND_APPROVER | Ad account in partner access | Campaign director re-check | Dates run | Actual spend | Report |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |
