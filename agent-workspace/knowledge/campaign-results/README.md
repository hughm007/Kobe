---
title: Advertising Intelligence Log
type: research
client: internal
owner: Karl
status: active
created: 2026-08-26
updated: 2026-08-26
tags: [campaigns, performance, learning, results]
---

# Advertising intelligence

**What makes customers respond.** One file per campaign, updated as results arrive.

This ledger answers *"did the advertisement work"*. It is deliberately kept separate from
[`../production-log/`](../production-log/README.md), which answers *"did the generation work"*.

> **Never confuse "this model generated the clip well" with "this advertisement made people buy."**

## Filename

`YYYY-MM-DD-<client>-<campaign-slug>.md`

## What each entry records

| Field | Notes |
|---|---|
| Company / client | |
| Audience | As targeted, and as actually reached |
| Offer | The proposition, not the creative |
| Hook | The opening, verbatim |
| Angle | Which of the ranked alternatives ran |
| Creative spine | Core message, primary emotion, structure |
| Story structure | Beat count and shape |
| Platform + placement | |
| Spend | |
| Retention | Hold rate / watch-through where available |
| CTR · CPC | |
| Leads · qualified leads | Qualified is the number that matters |
| CPA · conversion rate | |
| Revenue · ROAS | Where attributable |
| What we think caused the result | Explicitly a hypothesis |
| Status | EXPERIMENTAL / REPEATED / VALIDATED |

## Reporting discipline

Numbers reported here must be traceable to a named source file or platform export. An
unattributable number is worse than a missing one — it will be repeated to a client later.

Report **what happened → what it means → what we're doing about it**, in that order.

## Learning safety

- **EXPERIMENTAL** — one campaign. A result, not a lesson.
- **REPEATED** — the same pattern in a second, independent campaign.
- **VALIDATED** — three or more. **Only now** may it change a playbook or become doctrine.

**One campaign result never rewrites the operating rules.** A hook that won once won once; the
market, the season, the budget and the competitor set all moved too.

## Losses are kept

A losing campaign is usually the more instructive file. Record what we expected, what happened,
and the honest diagnosis — including "we do not know why". Deleting losses turns the ledger into
a highlight reel and destroys its predictive value.

## Feeding the loop

Confirmed patterns graduate into [`../../playbooks/ads/`](../../playbooks/ads/) via the promotion
path in [`../../CLAUDE.md`](../../CLAUDE.md) §7, with a link back to the campaigns that earned
them.
