---
title: "911 Drain — Storyboard Rebuild — Script — REVISED"
type: report
client: 911drain
owner: Karl
status: draft
created: 2026-08-26
updated: 2026-08-26
tags: [campaign, script, revision-3]
---

# Script — "Look Us Up" pack (3 variants × 17.0s, 9:16) — REVISION 3

**Revision 3 changes (traced in `shotlist.md`'s changelog):** C1 card → **"Who are you letting
in?"** and S2 caption → **"Any licensed Arizona contractor is publicly checkable — state
registrar."** (F2 closed — every line now sits inside the three registered claims or asks a
question; the registration queue is empty) · A1 cards retimed (1.2s split) and card 2 →
"Who do you let in?" (F7) · CTA VO ends by **16.6s** (F17).

**Designed muted-first:** the burned text carries the entire story at zero volume; VO is the
bonus layer. **Claim-free** — no price, no speed promise, no guarantee, no "sewer", no
"commercial". The only numbers are the phone number and the license number, both facts.

## Timing spine (shared body; hook varies)

| Time | Shot | Burned text (muted carrier) | VO (sound-on bonus) | Diegetic audio |
|---|---|---|---|---|
| 0.0–2.5 | Hook (A/B/C) | per variant, below | — | per variant |
| 2.5–6.0 | S2 verify | "Any licensed Arizona contractor is publicly checkable — state registrar." (onset 3.2s) + persistent badge from here through S5: "ROC 366870" | "Before you let anyone in — check them." | six key taps, one confirm tap, room tone |
| 6.0–9.0 | S3 arrival | none — the wait is the shot | **none (F11)** | door latch, evening street tone; no dialogue |
| 9.0–11.5 | S4 work | "Licensed. On the job." | — (the ratchet is the line) | auger drum ratchet, water starting to give |
| 11.5–14.0 | S5 payoff | "Licensed. Verifiable." | "911 Drain." (11.5–13.4); CTA line J-cuts in at 13.5 | tap opens, the pour, room tone resolving |
| 14.0–17.0 | S6 endcard | "480-992-3541" (large) · "ROC 366870 — look us up." · "24/7 EMERGENCY DRAIN REPAIR" | "…the number's on your screen — look us up." (**ends by 16.6 — F17**) | bed resolves to one low note, then silence + 0.4s clean tail |

## Variant hook text

- **A:** "Backed up? Stop the water." (0.0–1.2) → "Who do you let in?" (1.2–2.5, 5 words —
  F7; exits at the S2 cut)
- **B:** "Still comparing plumbers?" (0.4–2.5 — a question, not a claim)
- **C:** "Who are you letting in?" (0.2–2.5 — F2: a pure question; the typing visual carries
  the code idea)

## Pace arithmetic — design check, now machine-verifiable

> The rebuilt `servicepow_performance_qc.py` (playbooks/ads/scripts/) measures the rendered VO
> at production. The table below is the *design* against its thresholds: no line > 175 WPM ·
> CTA line ≤ 165 · a slow anchor ≤ 155 · rhythm ratio ≥ 1.15 · a breath ≥ 0.40s.

| Line | Words | Window | WPM | Ceiling | OK? |
|---|---|---|---|---|---|
| "Before you let anyone in — check them." | 7 | 3.5s | 120 | 175 | ✓ (slow anchor ✓ ≤155) |
| "911 Drain." | 2 | 1.9s (11.5–13.4) | 63 | 175 | ✓ |
| "…the number's on your screen — look us up." (CTA) | 8 | 3.1s (J-cut 13.5–16.6 — F17: the last word clears the final frame) | **155** | **165** | ✓ |
| Rhythm ratio (fastest 155 / slowest 63) | — | — | 2.5 | ≥1.15 | ✓ |
| Breaths | — | ≥0.40s held (the S2→S5 VO gap is 5.5s) | — | ≥0.40s | ✓ |

**The digits are deliberately not voiced** — ten digits cannot stay under the CTA ceiling in
the endcard window; the on-screen number carries it (3.0s ≥ the 2s phone-number dwell floor)
and the VO directs eyes to it. Flagged for Karl at the storyboard gate.

## Text-legibility dwell design (every burned string)

| String | Words | On screen | Floor | OK? |
|---|---|---|---|---|
| A card 1 "Backed up? Stop the water." | 5 | 1.2s | ≥1s | ✓ |
| A card 2 "Who do you let in?" | 5 | 1.3s + exits at the cut | ≥1s | ✓ |
| B line "Still comparing plumbers?" | 3 | 2.1s | ≥1s | ✓ |
| C line "Who are you letting in?" | 5 | 2.3s | ≥1s | ✓ |
| S2 caption | 9 | 2.8s (onset 3.2s) | ≥1s | ✓ |
| "ROC 366870" badge | 2 | 14.5s persistent (S2→S5, F13 fixed) | ≥2s license number | ✓ |
| S4 line | 4 | 2.5s | ≥1s | ✓ |
| S5 line | 2 | 2.5s | ≥1s | ✓ |
| Phone number | 1 string | 3.0s | ≥2s phone number | ✓ |

## Spoken-language rules applied

Contractions yes; no slang; "we/you" direct address; the emergency is never joked about; every
word a homeowner would say. No line requires a breathless read; the ad ends quieter than the
feed it sits in. US vocabulary throughout. The payoff is domestic and wordless: water freely
draining, a glass filled at the tap, the windowsill plant watered — no drinking (F14).
