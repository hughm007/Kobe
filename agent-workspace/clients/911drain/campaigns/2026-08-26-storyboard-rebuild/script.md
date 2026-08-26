---
title: "911 Drain — Storyboard Rebuild — Script — REVISION 8"
type: report
client: 911drain
owner: Karl
status: draft
created: 2026-08-26
updated: 2026-08-26
tags: [campaign, script, revision-8]
---

# Script — "Look Us Up" pack (3 variants × 17.0s, 9:16) — REVISION 8

**Revision 8 changes (round-9 findings; changelog in `shotlist.md`):** rhythm ratio synced to
150/67 ≈ 2.2 (F9-1) · the S2 tap audio variant-scoped so A/B's mix can't desync the proof
beat (F9-5).

**Revision 7 changes (round-8 findings; changelog in `shotlist.md`):** the strap and endcard
carry the licensed name form "911 Drain LLC" (R8-F3) · A1 card 2's above-ceiling read routed
as sign-off residual (c) — the completeness claim is now true (R8-F1) · "911 Drain." VO window
label synced to 11.5–13.3 (R8-F9).

**Revision 6 changes (round-7 findings; changelog in `shotlist.md`):** endcard number + ROC
line set from frame one (R7-F2) · both then-known above-ceiling reads named honestly and
routed to the sign-off sheet (R7-F5) · version hygiene (R7-F9).

**Revision 5 changes (round-6 findings; changelog in `shotlist.md`):** the S2 caption's exit
rides 1.0s into S3 (3.0–7.0s — character-rate arithmetic, not WPM: ~70 chars needs ~4.0s) ·
the info strap's onset moves to **5.5s** so the proof beat reads insert-then-caption only
(trade: 3.0s of early callability) · A1's card split retimes to **1.5s** · the strap dwell
arithmetic below is corrected (R6-F10c).

**Revision 4 changes (round-5 findings; changelog in `shotlist.md`):** S2 caption regains the
venue — **"Every licensed AZ contractor is publicly checkable — state registrar."** (F-4;
onset moves to 3.0s, putting the 9 words exactly at the 180-WPM reading ceiling — the beat is
frozen, F-6) · CTA J-cut pulled to **13.4** so the 8-word line reads at 150 WPM with a real
em-dash pause (F-13).

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
| 2.5–6.0 | S2 verify | "Every licensed AZ contractor is publicly checkable — state registrar." (onset 3.0s, **exits 7.0s** — R6-F2 tail ride) + info strap enters at **5.5s** (R6-F2 retime), runs through S5: "911 Drain LLC · ROC 366870 · 480-992-3541" (65%, black backing chip; licensed name form — R8-F3) | "Before you let anyone in — check them." | variant-scoped (round-9 F9-5): **C** — six key taps + one confirm tap (typing began in C1); **A/B** — the final completing tap(s) + one confirm tap only (S2 opens with the number completing); room tone |
| 6.0–9.0 | S3 arrival | no NEW text — the caption completes its exit at 7.0s; the strap continues | **none (F11)** | door latch, evening street tone; no dialogue |
| 9.0–11.5 | S4 work | "Licensed. Look us up." (round-4 F3) | — (the ratchet is the line) | auger drum ratchet, water starting to give |
| 11.5–14.0 | S5 payoff | "Licensed. Verifiable." | "911 Drain." (11.5–13.3); CTA line J-cuts in at 13.4 (round-5 F-13) | tap opens, the pour, room tone resolving |
| 14.0–17.0 | S6 endcard | "480-992-3541" (large) · "911 Drain LLC · ROC 366870 — look us up." (licensed name — R8-F3) · **real logo lockup only** (Owner ruling: no burned tagline — the 24/7 line lives inside the logo art); number + ROC line set from FRAME ONE (R7-F2) | "…the number's on your screen — look us up." (**ends by 16.6 — F17**) | bed resolves to one low note, then silence + 0.4s clean tail |

## Variant hook text

- **A:** "Backed up? Stop the water." (0.0–**1.5** — R6-F3 retime: 26 chars at the 15–17 cps
  comfort rate) → "Who do you let in?" (**1.5**–2.5, 5 words — F7; its exact 1.0s floor, a
  glance question; exits at the S2 cut)
- **B:** "Still comparing plumbers?" (0.4–2.5 — a question, not a claim)
- **C:** "Look them up first." (0.2–2.5 — round-4 F9: differentiated from A's question; a
  claim-2 imperative; the typing visual carries the code idea)

## Pace arithmetic — design check, now machine-verifiable

> The rebuilt `servicepow_performance_qc.py` (playbooks/ads/scripts/) measures the rendered VO
> at production. The table below is the *design* against its thresholds: no line > 175 WPM ·
> CTA line ≤ 165 · a slow anchor ≤ 155 · rhythm ratio ≥ 1.15 · a breath ≥ 0.40s.

| Line | Words | Window | WPM | Ceiling | OK? |
|---|---|---|---|---|---|
| "Before you let anyone in — check them." | 7 | 3.5s | 120 | 175 | ✓ (slow anchor ✓ ≤155) |
| "911 Drain." | 2 | 1.8s (11.5–13.3; 13.3–13.4 is the pause before the J-cut — R8-F9 label sync) | 67 | 175 | ✓ |
| "…the number's on your screen — look us up." (CTA) | 8 | 3.2s (J-cut 13.4–16.6 — F17: the last word clears the final frame; round-5 F-13: start pulled to 13.4 so the em-dash pause has real slack) | **150** | **165** | ✓ |
| Rhythm ratio (fastest 150 / slowest 67 — round-9 F9-1: 63 was the stale pre-R8-F9 value) | — | — | ≈2.2 | ≥1.15 | ✓ |
| Breaths | — | ≥0.40s held (the S2→S5 VO gap is 5.5s) | — | ≥0.40s | ✓ |

**The digits are deliberately not voiced** — ten digits cannot stay under the CTA ceiling in
the endcard window; the on-screen number carries it (3.0s ≥ the 2s phone-number dwell floor)
and the VO directs eyes to it. Flagged for Karl at the storyboard gate.

## Text-legibility dwell design (every burned string)

| String | Words | On screen | Floor | OK? |
|---|---|---|---|---|
| A card 1 "Backed up? Stop the water." | 5 | 1.5s (R6-F3 retime) | ≥1s | ✓ floor — but **≈17.3 cps, just ABOVE the 15–17 ceiling** (R7-F5: structurally unfixable inside the 2.5s hook; on the sign-off sheet for Karl's named accept/decline, not concealed by a checkmark) |
| A card 2 "Who do you let in?" | 5 | 1.0s + exits at the cut (its exact floor) | ≥1s | ✓ floor — but **≈18.0 cps, ABOVE the 15–17 ceiling** (R8-F1: routed to the sign-off sheet as residual (c) for Karl's named accept/decline — no concealment) |
| B line "Still comparing plumbers?" | 3 | 2.1s | ≥1s | ✓ |
| C line "Look them up first." | 4 | 2.3s | ≥1s | ✓ |
| S2 caption (incl. "— state registrar.") | 9 (~70 chars) | 4.0s (onset 3.0s, exits 7.0s — R6-F2 tail ride into S3) | ≥1s | ✓ floor — but **≈17.5 cps, just ABOVE the 15–17 ceiling** (R7-F5 wording fix: "at the edge" understated it; the beat is frozen (F-6) and the residual sits on the sign-off sheet for Karl's named accept/decline) |
| Info strap "911 Drain LLC · ROC 366870 · 480-992-3541" (R8-F3 licensed form, ≈4.9 cps) | 6 | 8.5s persistent (5.5–14.0s, R6-F2 onset retime) + 3.0s endcard = **11.5s total number-on-screen** (R6-F10c: the old "14.5s (S2→S5)" conflated the strap window with the total) | ≥2s license + phone | ✓ — on screen continuously for the ad's back 11.5s; VO "the number's on your screen" (13.4–16.6) stays true across the strap→endcard handoff |
| S4 line "Licensed. Look us up." | 4 | 2.5s | ≥1s | ✓ |
| S5 line | 2 | 2.5s | ≥1s | ✓ |
| Phone number | 1 string | 3.0s | ≥2s phone number | ✓ |

## Spoken-language rules applied

Contractions yes; no slang; "we/you" direct address; the emergency is never joked about; every
word a homeowner would say. No line requires a breathless read; the ad ends quieter than the
feed it sits in. US vocabulary throughout. The payoff is domestic and wordless: water freely
draining, a glass filled at the tap, the windowsill plant watered — no drinking (F14).
