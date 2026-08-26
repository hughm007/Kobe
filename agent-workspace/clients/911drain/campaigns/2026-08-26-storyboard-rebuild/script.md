---
title: "911 Drain — Storyboard Rebuild — Script"
type: report
client: 911drain
owner: Karl
status: draft
created: 2026-08-26
updated: 2026-08-26
tags: [campaign, script]
---

# Script — "Look Us Up" pack (3 variants × ~16.5s, 9:16)

**Designed muted-first:** the burned text beats carry the entire story at zero volume; VO is the
bonus layer for the sound-on minority. **Claim-free throughout** — no price, no speed promise,
no guarantee, no "sewer", no "commercial". The only numbers in the ad are the phone number and
the license number, both facts.

## Timing spine (shared body; hook varies)

| Time | Shot | Burned text (muted carrier) | VO (sound-on bonus) | Diegetic audio |
|---|---|---|---|---|
| 0.0–2.5 | Hook (A/B/C) | per variant, below | — (hooks are text-only by design) | per variant |
| 2.5–6.5 | S2 verify | "Every Arizona contractor has a number." + persistent lower-safe badge from here on: "AZ ROC 366870" | "Before you let anyone in — check them." | six key taps, one confirm tap, room tone |
| 6.5–9.5 | S3 arrival | none | "This is what licensed looks like." | door latch, distant street, muffled greeting (non-lip-sync) |
| 9.5–12.0 | S4 work | none | — (the ratchet is the line) | auger drum ratchet, water starting to give |
| 12.0–13.5 | S5 calm | "Licensed. Local. Verifiable." | "911 Drain." | kettle click, water running free, room tone resolving |
| 13.5–16.5 | S6 endcard | "480-992-3541" (large) · "ROC 366870 — look us up." · "24/7 EMERGENCY DRAIN REPAIR" | "The number's on your screen — look us up first." | bed resolves to one low note, then silence |

## Variant hook text

- **A:** "Drain backed up? Step 1: stop running the water." (0.0–1.6) → "Step 2: know who you're
  letting in." (1.6–2.5, holds into S2's first frames)
- **B:** "Water damage doesn't wait for you to read reviews." (0.4–2.5)
- **C:** "Six digits tell you exactly who you're letting in." (0.4–2.5)

## Pace arithmetic — paper design check

> **Label per LB29:** this is the *design* of check 32's discipline done by arithmetic on the
> page. The real check 32 measures rendered audio with `servicepow_performance_qc.py`, which is
> **not in the repo — measurement NOT RUN.** Thresholds designed to: no line > 175 WPM; any
> price/offer/CTA line ≤ 165 WPM; a slow anchor ≤ 155 WPM; a real breath ≥ 0.40s.

| Line | Words | Window | WPM | Ceiling | OK? |
|---|---|---|---|---|---|
| "Before you let anyone in — check them." | 7 | 4.0s | 105 | 175 | ✓ (slow anchor ✓ ≤155) |
| "This is what licensed looks like." | 6 | 3.0s | 120 | 175 | ✓ |
| "911 Drain." | 2 | 1.5s | 80 | 175 | ✓ |
| "The number's on your screen — look us up first." (CTA line) | 9 | 3.0s | 180 → **stretched to 3.4s incl. S6 tail = 159** | **165** | ✓ at 3.4s — **direction: unhurried; if the read lands hot, cut "first"** (8 words / 3.4s = 141) |
| Breaths | — | ≥0.40s gap held between every VO line (gaps are 1.0s+) | — | ≥0.40s | ✓ |

**The digits are deliberately not voiced.** Speaking ten digits in the endcard window can't stay
under the 165 WPM CTA ceiling (10 words / 3.5s = 171). Muted-first design makes the on-screen
number the carrier: it holds the screen **3.0s ≥ the 2s phone-number dwell floor**. The VO
directs eyes to it instead. (The brand guide's "480 number spoken as digits" governs how the
number is said when it is said — it is not a mandate to voice it in every asset; flagged for
Karl with the storyboard approval.)

## Text-legibility dwell design (every burned string)

| String | Words | On screen | Floor | OK? |
|---|---|---|---|---|
| A hook step 1 | 8 | 1.6s | ≥1s short string | ✓ |
| A hook step 2 | 7 | 0.9s + holds into S2 ≈ 1.7s total | ≥1s | ✓ |
| B hook line | 9 | 2.1s | ≥1s | ✓ |
| C hook line | 8 | 2.1s | ≥1s | ✓ |
| S2 caption | 6 | 4.0s | ≥1s | ✓ |
| "AZ ROC 366870" badge | 3 | 14.0s persistent | ≥2s licence number | ✓ |
| S5 line | 3 | 1.5s | ≥1s | ✓ |
| Phone number | 1 string | 3.0s | ≥2s phone number | ✓ |

## Spoken-language rules applied

Contractions yes; no slang; "we/you" direct address; the emergency is never joked about; every
word a homeowner would say ("backed up," not "drainage event"). No line requires a breathless
read; the ad ends quieter than the feed it sits in.
