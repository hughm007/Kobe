---
title: "Higgsfield plan review — usage vs plan (2026-10-06)"
type: report
client: internal
owner: Karl
status: active
created: 2026-10-06
updated: 2026-10-06
tags: [higgsfield, tooling, spend]
---

# Higgsfield plan review (2026-10-06)

**Sources:** Higgsfield MCP `balance`, `show_plans_and_credits`, full `transactions` history (2,017 rows, 2026-06-11 → 2026-10-06; aggregated by subagent from per-day transcription). Public plan prices from third-party pricing pages (not Higgsfield's own page).

## Current account (FACT)
- Plan label: `ultra`. Balance 10,763.66 credits on 2026-10-06.
- Grant: **+9,000 credits on the 26th of each month** (~02:28 UTC). Unused subscription credits are wiped at each renewal.
- One purchased top-up: +5,000 on 2026-07-16. Top-up credits last 90 days.
- **What we pay for the 9,000 tier: UNKNOWN.** The MCP doesn't expose it. Standard Ultra is 3,000/mo, so this is a scaled Ultra tier.

## Usage (FACT, net of refunds)
| Billing cycle (26th→26th) | Granted | Expired unused | Used (approx.) |
|---|---|---|---|
| Jun 26 → Jul 26 | 9,000 (+5,000 top-up) | 0 | ≥ 9,000 |
| Jul 26 → Aug 26 | 9,000 | 4,974.51 | ~4,000 |
| Aug 26 → Sep 26 | 9,000 | 2,466.95 | ~6,500 |
| Sep 26 → Oct 6 (10 days) | 9,000 | — | ~1,900 |

Calendar months: Jul 8,346 · Aug 4,047 · Sep 7,037. **7,441 credits expired in Aug–Sep.**
Video drives spend: Seedance 2.0/2.5 = 64% of all credits; Kling 3.0 next. Statics (GPT Image, Nano Banana) are a few hundred a month.

## Options (public prices, ESTIMATE)
| Option | Credits/mo | Price/mo | $/credit |
|---|---|---|---|
| Plus | 1,200 | $47 annual / $59 monthly | $0.039–0.049 |
| Ultra | 3,000 | $99 annual / $129 monthly | $0.033–0.043 |
| Top-up packs (90-day life) | 500–4,000 | $26–$190 | $0.0475–0.052 |
| Auto-refill | — | — | $0.055 |

Ultra annual + top-ups at our real usage: ~$148 (4,000-credit month) · ~$265 (6,500) · ~$384 (9,000). Three-cycle average ≈ **$265/month**.

## Recommendation
Keep the 9,000 tier only if it costs less than ~$265/month. Otherwise move to **Ultra 3,000 + 4,000-credit top-ups bought only when the balance drops under ~1,000**. Top-up credits last 90 days instead of being wiped monthly, which removes the expiry waste.
Pick annual ($99) only if Service Pow is sure to keep generating for 12 months; monthly ($129) otherwise.
