---
title: "Randy's Rooter & Plumbing (Midland, TX): prospect brief and spec static ad"
type: brief
client: internal
owner: Karl
status: draft
created: 2026-10-20
updated: 2026-10-20
tags: [prospect, plumbing, spec-ad, static, meta]
---

# Randy's Rooter & Plumbing LLC: prospect (spec work, not a client)

**Status:** spec ad built to pitch them. It is internal only: nothing is posted or sent without Karl. Every file is marked CONCEPT.

## What their ad is
- **Their Facebook post** (sent by Karl on 2026-10-20) is a stock-style photo of onions, 600×380.
- It has no headline, no plumbing message, no offer, no CTA and no logo or brand.

## Facts (all UNVERIFIED until checked with the company or on its own website or Facebook page)

| Item | Value | Source |
|---|---|---|
| Name | Randy's Rooter & Plumbing LLC (Karl first wrote "Randy Rooster") | iBegin, Yext |
| Area | Midland, TX and nearby areas, since 2001; family-owned | iBegin / Yext listing copy |
| Services | Drain cleaning, hydro-jetting, camera inspection, sewer cleaning, slab leaks, water heaters | iBegin |
| Phone | (432) 520-3030 (iBegin, Yellow Pages); Yellow Pages also lists (432) 701-0339 | Listings conflict: **confirm before any use** |
| Address | 309 W Cowden Ave vs 309 W Washington Ave vs PO Box 4365 | Conflicting, so **not used** |
| Google rating | 3.8 from 63 reviews (via Expertise.com) | Not used in the ad. It's a sales-call point: reviews are an opportunity |

Sources: https://www.ibegin.com/directory/visit/10548388 · https://directory.yext.com/en/randy-s-rooter-3620052651 · https://www.yellowpages.com/midland-tx/plumbers · https://www.expertise.com/tx/midland/plumbing

## Spec ad (v1)
- **Angle:** keep their onion photo and make it a kitchen-drain tip that leads to a drain-cleaning call. Timed for Thanksgiving (26 Nov 2026).
- **Hooks:**
  - H1 "Onion skins: great in the pot. Bad in the pipe."
  - H2 "Thanksgiving cooking? Keep peels and grease out of the sink."
  - H3 "Cooked with onions? Bin the skins."
- **Body:** "Thin peels can mat together in the line. Grease hardens as it cools. Trash them both."
- **CTA block:** "Drain already slow? Randy's Rooter clears kitchen drains in Midland." / "Call (432) 520-3030".

**Claim notes:**
- "Grease hardens as it cools" is well established.
- "Peels can mat together" is worded as a **can**, on purpose. InSinkErator markets higher-end disposers as able to grind onion skins, so the ad never says peels *will* clog. Randy's should confirm they're happy to give this as a plumber's tip.
- The "Brown Friday" (busiest plumbing day) statistic exists, but it is **Roto-Rooter's own figure**, and Roto-Rooter is a Midland competitor, so it is not used.

**Asset notes:**
- The photo is their own post's image, whose rights are unknown (it looks like stock). It's used in a 720 px panel, at about a 1.2× upscale, so it stays sharp.
- **The production version needs** their own or a licensed photo and their real logo. The v1 uses a plain text wordmark as a placeholder.

**Build and QC:**
- Built in code from scratchpad `randys_rooter/build.py`: 6 PNGs (3 hooks × feed 1080×1350 and Story 1080×1920).
- **Machine QC:**
  - **Static QC:** the distinctness checks pass.
  - **Manifest checks:** FAIL, because the hand-built comps emit no manifest. The phone-number check failed for the same reason.
  - **Direct OCR:** the phone number reads on all 6, and no barred words are present.
- **Not gated** (no critic or Skeptic pass), because this is spec work.

## Pitch points for Karl
1. The current post says nothing about plumbing; a scroller can't tell who posted it or why.
2. The new version keeps their idea and adds a reason to care, a reason to call, and the number.
3. **Test:** H1 vs H2 as a small boosted local test. Their 3.8 Google rating is a second offer: review generation.
