---
title: "Service Pow intro video — Revision 3 repair board"
type: report
client: internal
owner: Karl
status: draft
created: 2026-08-31
updated: 2026-08-31
tags: [company, video, intro-video, repair, gate]
---

# Repair board — one round, every finding

Consolidates the machine QC, the Skeptic's 37 blocking findings and Kobe's hard fail into a single
Revision-3 rebuild. **Base: the challenger's spine** (both gates converge on it), with the control's
substantiated claims transplanted in. Piecemeal fixes are barred — this board is the whole round,
and both gates re-run in full on frozen artifacts afterward.

## A. Copy and claims (gate-forced, ruling-independent)

| # | Change | Answers |
|---|---|---|
| R1 | `Can't get pulled.` **cut.** The control's labelled compliance triple transplanted in — three ticks, three labels: `Disclosure handled` / `No fake testimonials` / `Claims substantiated` | Skeptic L2-01 S4 (unsubstantiatable guarantee) · L1-11 (naked ticks) · Kobe transplant 1 |
| R2 | Turnaround claim restored verbatim-faithful: **`5–7 business days from your footage`**, and the offer line's hold raised from **1.4s to ≥3.0s** | Kobe hard-failure 9c (both cuts) · Skeptic L2-02 · check-32 class, second occurrence |
| R3 | `Nobody comes to your site.` → **`No film crew. No shoot day.`** | Skeptic L1-02 S4 (self-refuting on a website; "site" ≠ jobsite) |
| R4 | `So it doesn't look fake.` **cut.** The footage beat asserts ownership (`Your van. Your street.`) and nothing more until a real clip exists; the realism claim returns only over real footage | Skeptic L1-03/L3-02 S4 · Kobe hard-failure 12a — a cartoon cannot demonstrate realism |
| R5 | The film **names what it sells** in the grid beat: `4 video ads · 2 ideas × 2 hooks` | Skeptic L1-01 S4 (product never named in 60 muted seconds) |
| R6 | Endcard: wordmark + **`See one made for your business ↓`** — an on-page instruction that restates the signed spec-ad payoff and points down the page the viewer is on. `Get your free growth audit.` is **out until the audit exists in `services.md`** (Owner question standing); if it lands, it must also be seeded earlier so the endcard is never new information | Skeptic L1-05/L2-03 S4 · Kobe hard-failure 11 · playbook line 199 |

## B. Structure (Kobe's one edit + Skeptic's loop findings)

| # | Change | Answers |
|---|---|---|
| R7 | **Open on the product.** Frame 1 carries ink and motion: the grid already drawing, the hand+phone in frame. `2 ideas × 2 hooks` legible inside 6s. The pain beats compress to one and move to second position — on a homepage the visitor already self-selected | Kobe hook 3/10 + Hook Law · Skeptic L2-07 · DR lens ratio (9.5s pain vs 1.4s offer) |
| R8 | **The loop never goes blank.** The seam hands off through a drawn state — endcard resolves into the opening grid stroke, corner wordmark persists across the seam. Seam must be matched AND non-empty; PSNR re-measured with that dual target | Skeptic LP-01/LP-06 S4 · Kobe ("seamless because it joins nothing to nothing") |
| R9 | **Every string into the 15–70% safe band** (blocking check 28); corner wordmark relocated; endcard CTA sized for a 390px viewport | Skeptic L2-06 S4 — 10 of 13 strings currently at 81–94% · L1-13 |
| R10 | Wordless holes filled or closed — no gap over ~2.5s without a readable string; the 4.4s hole at 41.8–46.2 is absorbed by R1's labelled triple | Skeptic L1-06 |
| R11 | Loop sentence audited end-to-start: last string → first string must read sanely in sequence | Skeptic LP-02 |

## C. Draughtsmanship

| # | Change | Answers |
|---|---|---|
| R12 | **Every stroke is a hand-drawn wobble line** — ruler-straight `lineD` retired film-wide. Kills the seven surviving frozen sections; on-style regardless | Machine QC after-boil residue |
| R13 | Hand v5: stray stroke closed, wrist implied, legible as a hand at 100% | Kobe hard-failure 3 · Skeptic L3-03 |
| R14 | Van v5: US profile, ladder rack, roofline meets cab, wheels cut out of the chassis line, **one rendering language** (drawn shadow, not gaussian blur) | Skeptic L3-04/L3-07 |
| R15 | Grid claim and grid content co-timed: the four panels fill **while** `2 ideas × 2 hooks` is on screen, not after it leaves | Skeptic L1-10 |

## D. Process and harness (recorded, some need rulings)

| # | Item | State |
|---|---|---|
| P1 | **Artifacts freeze during a gate** — gates run on copies with recorded SHA-256 | Rule adopted (Kobe flag 2) |
| P2 | Harness `--allow-silent` for muted-hero masters, or a recorded deviation per master | Needs playbook ruling |
| P3 | `--expect` strings must avoid apostrophes (OCR limitation, proven) | Recorded |
| P4 | `no-flash-cuts` false-positive on multi-frame wipes | Closed by Kobe's frame-check; harness fix optional |
| P5 | Check 19 (page parity) unrunnable from container; check 25 (human watch) is the Owner's tick | Owner |
| P6 | Learning candidate: *offer/price line gets the shortest hold* — second occurrence (911 Drain price line, this offer line). Promotes to the playbook at a third | `knowledge/learnings/` |
| P7 | **Freeze gate cannot see designed micro-motion**: 12 fps / ~320px mean-diff (< 0.35/255) misses a full-res 10 Hz boil measured at 33–34 dB per group boundary. Needs a calm-window exemption (the motion gate has one) or a full-res sub-check before failing a declared hold. Evidence in `gate-record.md` §2f | Needs playbook ruling |
| P8 | OCR expect-strings cannot read digits reliably (`4 video` fails while `video ads` passes, string verified on-frame) — expects should avoid leading numerals, same class as the apostrophe | Recorded |

## Owner inputs that gate the LAST steps only

1. **The growth audit** — real? contents? unconditionally free? → decides R6's final string.
2. **A rights-clear clip** → the only thing that lets the realism claim back in (R4).
3. **Brand direction A/B/C** — still open; one variable, applied at any point.

Nothing above blocks R1–R15. Build now, re-gate once, swap the endcard string if the audit answer
arrives before sign-off.
