---
title: "911 Drain — Client Asset Register"
type: register
client: 911drain
owner: APPROVER
status: active
created: 2026-09-02
updated: 2026-09-02
tags: [assets, register, brand, compliance]
---

# 911 Drain — Client Asset Register

**Mandatory read before any concept is written.** The question this file answers is:
*what real material already exists that should appear in this ad?*

**Why this file exists:** the production system reported "no assets" for this client and was
therefore routed toward generating a van — which LB24 forbids outright — while these files
sat in a different repository. Absence from the KB was never evidence of absence in the world.
See `knowledge/learnings/2026-09-02-asset-discoverability-is-a-production-capability.md`.

**⚠ PROVENANCE IS UNCONFIRMED.** These files were discovered in the website repo. Whether
each is a real photograph, a client-supplied file, or an AI-generated still made for the
case-study page **has not been confirmed with the owner**. The brief describes the van wrap as
a "settled, original mockup", and the site is documented as carrying decorative AI brand
artwork — so provenance genuinely cannot be assumed either way. Every row is therefore
`VERIFIED REAL: UNKNOWN` until Will or the owner confirms. **A row at UNKNOWN may not be used
as though it were real client footage in a client-facing ad.**

Canonical location (all rows): `servicepow-v2/public/work/911drain/`

| ID | Type | File | sha256 | Verified real | Approved | Generatable | Must use real | Brand critical | Restrictions |
|---|---|---|---|---|---|---|---|---|---|
| SP-911-001 | LOGO / WORDMARK | `logo.png` (729x285) | 052c9548 | **UNKNOWN** | UNKNOWN | **NO — LB24** | **YES** | **YES** | Never generated, ever. Tagline reads "24/7 EMERGENCY DRAIN REPAIR" — see tagline drift below |
| SP-911-002 | VAN / VEHICLE | `van-wrap.jpg` (846x467) | adf6f240 | **UNKNOWN** — brief calls it a mockup | UNKNOWN | **NO — LB24** | **YES** | **YES** | Wrap carries "DRAIN & SEWER REPAIR" — **"sewer" is UNVERIFIED scope. A van is an advertisement.** |
| SP-911-003 | FOOTAGE STILL | `still-arrival.jpg` | 5b9b495c | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | no | Arrival/exterior context |
| SP-911-004 | FOOTAGE STILL | `still-truck-night.jpg` | ca37c9e2 | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | no | Night exterior |
| SP-911-005 | FOOTAGE STILL | `still-dispatcher.jpg` | 256190cb | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | no | Depicts a person — consent/rights unconfirmed |
| SP-911-006 | FOOTAGE STILL | `still-clock.jpg` | 25c9b19d | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | no | Time/urgency motif |
| SP-911-007 | VIDEO | `commercial.mp4` (1152x648) | 4529061c | UNKNOWN | **NO** | n/a | n/a | no | **Video Pack 01 was killed on owner watch 2026-08-20. Nothing has ever published. Do not reuse as approved work.** |
| SP-911-008 | WEB SCREENSHOT | `site-desktop.jpg` | dae674b9 | yes (screenshot) | UNKNOWN | n/a | n/a | no | Proof-of-work only |
| SP-911-009 | WEB SCREENSHOT | `site-mobile.jpg` | ec3f3774 | yes (screenshot) | UNKNOWN | n/a | n/a | no | Proof-of-work only |
| SP-911-010 | POSTER | `commercial-poster.jpg` | fe1278f7 | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | no | Poster frame for 007 |

## Non-file assets that still bind production
| ID | Type | Value | Restriction |
|---|---|---|---|
| SP-911-020 | LICENCE / ROC | **AZ ROC 366870, CR-37 Plumbing, residential only, expires 2028-07-31** | **Must appear in advertising, inside the platform-safe area** |
| SP-911-021 | PHONE | 480-992-3541 | — |
| SP-911-022 | SCOPE LIMIT | CR-37 is **residential only** | No ad, page or claim may market commercial work |
| SP-911-023 | UNVERIFIED SCOPE | "sewer" | **No asset may carry "sewer" until verified with Will or the ROC** |
| SP-911-024 | CLAIMS SHEET | 9 items, **UNSIGNED** | No claim ships without written substantiation |
| SP-911-025 | TAGLINE DRIFT | Logo says "DRAIN REPAIR", wrap says "DRAIN & SEWER REPAIR" | Pick one and record it before any asset carries either |

## MISSING — the highest-value gap, per the client brief
**Real repair footage: POV before / during / after from the crew.** Recorded in the brief as
*"free, unfakeable, and exactly what the 'during' state needs — it cannot safely be
generated."* This remains the single most valuable acquisition for this account, and it is an
owner/client action, not a generation problem.
