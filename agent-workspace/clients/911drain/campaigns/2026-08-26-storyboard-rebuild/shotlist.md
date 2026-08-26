---
title: "911 Drain — Storyboard Rebuild — Shotlist (ten fields)"
type: report
client: 911drain
owner: Karl
status: draft
created: 2026-08-26
updated: 2026-08-26
tags: [campaign, storyboard, shotlist]
---

# Shotlist — "Look Us Up" pack

Every shot carries **all ten fields** (story job · action · camera · lighting · audio · text ·
source · Real-ref · Angle · Motion). No eleventh field. Hero beats (hooks and payoff) are marked
for the 3-draft rule. The **Angle is identical on every shot in the pack: risk removal — verify
before you trust** — stated once here and repeated in each shot's tenth-to-second field anyway,
because the form is the enforcement.

**Shot-length arithmetic:** 16.5s total ÷ 6 shots per variant = **2.75s average ≥ 1.3s floor ✓**.
Longest pure-AI shot: 3.0s ≤ 5s ✓. Endcard 3.0s within the 2–3s feed rule ✓.

---

## Variant hooks (HERO BEATS — 3-draft rule)

```
Shot A1 — 0.0–2.5s   [VARIANT A LEAD HOOK — HERO]
Story job:   hook — self-select the mid-emergency viewer and pose the trust question
Action:      kitchen sink, tap RUNNING, grey-clear water visibly rising toward the rim in real
             time; a hand enters and shuts the tap at 1.6s exactly as "Step 1" completes; the
             water stops rising but does not drain
Camera:      locked CU on the basin, slight natural breathing; tap handle and water surface both
             in frame (the running tap is the honesty of the shot)
Lighting:    warm kitchen practicals, late-day window fill — same bulb temperature as S2/S5
Audio:       tap run + rising gurgle; the gurgle keeps going after the tap stops (the tell)
Text:        "Drain backed up? Step 1: stop running the water." → "Step 2: know who you're
             letting in." (both mid-safe, white)
Source:      pure AI + why: no real footage exists; fluid-at-CU is a low-tell class; no people
             beyond one entering hand
Real-ref:    CITED — https://www.zoomdrain.com/blog/2026/march/what-to-do-when-your-basement-floor-drain-is-bac/
             and https://environmentmasters.com/5-reasons-theres-water-backing-up-in-your-kitchen-sink/
             — observed: stop-water-use is the real first advice; backups present as slow rise,
             gurgle, air bubbles, one side of a double sink first. The shot copies: rise not
             gush, gurgle continuing after shutoff, bubbling at the drain mouth
Angle:       risk removal — verify before you trust
Motion:      TWO AXES (hero): subject travel through depth (water level climbing the basin) +
             foreground occlusion event (the hand entering to kill the tap)
```

```
Shot B1 — 0.0–2.5s   [VARIANT B HOOK — HERO]
Story job:   hook — dread: delay has a price, the slow way of choosing is too slow
Action:      macro: grey (NEVER brown — graded soapy-grey, no solids) water advances across a
             tile grout line toward the fringe of a hallway rug; it reaches the first fibers at
             2.3s
Camera:      macro, floor level, locked; the grout line runs diagonally toward the rug
Lighting:    cool hallway spill against the warm world beyond the doorway — the wrongness reads
             in the temperature
Audio:       faint trickle, house tone; no music
Text:        "Water damage doesn't wait for you to read reviews." (mid-safe, white)
Source:      pure AI + why: no real footage; macro fluid on tile is a low-tell class; zero people
Real-ref:    CITED — https://www2.minneapolismn.gov/government/departments/public-works/surface-water-sewers/home-sewer-maintenance/home-sewer-problems
             and https://www.zoomdrain.com/blog/2026/march/what-to-do-when-your-basement-floor-drain-is-bac/
             — observed: backup water spreads at floor level slowly and keeps coming while
             fixtures are used; damage grows with sitting time. The shot copies: slow advance,
             thin sheet not a wave, the rug as the stake
Angle:       risk removal — verify before you trust
Motion:      TWO AXES (hero): subject travel through depth (waterline advancing toward the rug)
             + focus change (rack from grout line to rug fibers at 2.0s)
```

```
Shot C1 — 0.0–2.5s   [VARIANT C HOOK — HERO]
Story job:   hook — curiosity: a code exists that identifies who you admit
Action:      ECU real phone screen: a thumb types 3-6-6-8… into the Arizona ROC contractor-search
             field; typing is quick then hesitates half a beat before the last digit (real
             typing behavior); C1 is the same continuous action S2 completes
Camera:      ECU over-shoulder, screen filling ~90% of frame width — the Skeptic's survival
             condition: digits legible at feed size or the hook dies
Lighting:    phone screen as key in a dim kitchen; one warm practical behind
Audio:       six soft key taps (the sonic hook), room tone
Text:        "Six digits tell you exactly who you're letting in." (upper-safe, white; changed
             from "who's really licensed" after the Skeptic attack — see hook-tournament.md)
Source:      REAL — screen recording of the actual roc.az.gov search UI (a generated government
             UI would be a fabricated record — LB24 class); thumb is a real macro hand plate or
             AI hand at ECU with the screen composited real
Real-ref:    CITED — https://roc.az.gov/contractor-search (the search itself) and
             https://roc.az.gov/sites/default/files/2022-07/20201221-Guide.pdf (AZ ROC consumer
             guide) — observed: the search accepts a 6-digit license number; results display
             status, license class, and complaint history. The shot IS the reference, performed
Angle:       risk removal — verify before you trust
Motion:      TWO AXES (hero): subject travel (thumb across the keypad) + light change (screen
             refresh as the field populates)
```

---

## Shared body (identical across variants)

```
Shot S2 — 2.5–6.5s   [verify beat — the concept's proof]
Story job:   proof — the official check exists, performed, and this company passes it
Action:      the typed number completes; the result row loads: license 366870, class, ACTIVE
             status visible; one confirm tap; a half-beat hold on the status line
Camera:      ECU on screen continuing C1's framing (variants A/B cut into it; C flows); slow
             2% push toward the status line as it loads
Lighting:    as C1 — phone key light, warm practical behind
Audio:       one confirm tap; room tone; the gurgle from A's world is gone here — this beat is
             already calmer
Text:        "Every Arizona contractor has a number." (lower-safe) + persistent badge begins:
             "AZ ROC 366870" (lower-safe corner, stays through S5)
Source:      REAL — screen recording of the actual public search result for 366870; nothing
             generated on the screen, ever
Real-ref:    CITED — https://roc.az.gov/contractor-search + consumer guide PDF (fields shown:
             status, class, complaints). Also https://azroc.my.site.com/AZRoc/s/contractor-search
             (the search UI itself). The recording is the reference
Angle:       risk removal — verify before you trust
Motion:      focus change (rack thumb → status line as the result loads); secondary: screen
             content change (load event) — named because "locked phone shot" alone would fail
             the axis test
```

```
Shot S3 — 6.5–9.5s   [arrival]
Story job:   proof — what verified looks like at your front door
Action:      from inside the hallway: homeowner opens the front door; the technician stands
             ~5 ft BACK from the threshold in clear view, photo ID badge visible on the chest,
             tool bag in the left hand, and does not step forward until the homeowner steps
             aside; marked van soft-focus at the curb ONLY if the real wrap file is composited —
             otherwise the van stays out of frame
Camera:      MS from inside the hallway, eye level, one slow 30 cm push toward the doorway
Lighting:    hard daylight in the door frame against the dim warm hallway — the outside is
             bright, not threatening
Audio:       door latch, distant street; a muffled "morning" pitched below lip-sync readability
Text:        none (badge and distance are the message)
Source:      pure AI + why: no real crew footage yet; the tech's face held at non-readable
             distance / partly turned BY DESIGN; no logo or wordmark generated — wrap appears
             only as composited real art or not at all (LB24)
Real-ref:    CITED — https://egia.org/wp-content/themes/EGIA/documents/perfectServiceCall.pdf
             (EGIA "The Perfect Service Call") — observed: the professional stands back from
             the door in clear view, photo ID visible, waits to be invited; marked van, company
             clothing. The shot copies: the stand-back distance, the visible ID, the wait
Angle:       risk removal — verify before you trust
Motion:      camera translation (the slow push) + foreground occlusion event (the door edge
             wiping the frame as it opens)
```

```
Shot S4 — 9.5–12.0s   [the work — the unfakeable middle]
Story job:   proof — the licensed competence, physically happening
Action:      top-down CU at a shower drain: gloved hands feed the auger cable in — one hand
             feeding, one on the drum crank — two pushes to resistance; the standing water ring
             at the drain mouth visibly drops
Camera:      top-down CU, locked with slight breathing; drum edge in frame (the tool is real
             and identifiable)
Lighting:    one hard work light from the left — honest, unglamorous
Audio:       the drum's ratchet; then water beginning to give — the first "right" water sound
             of the ad
Text:        none
Source:      REAL CLIENT FOOTAGE REQUIRED — the "during" state is never generated (standing
             law). This shot is the media ask to Will's crew (phone-rig POV, one job, ~30s of
             usable material). If no footage lands before production: the shot is REDESIGNED to
             aftermath-only — it is never generated
Real-ref:    CITED — https://www.thisoldhouse.com/bathrooms/how-to-snake-a-clogged-drain and
             https://www.youtube.com/watch?v=ZDaJchBnFn8 + https://www.youtube.com/watch?v=_nxvMioXWW4
             — observed: two-handed operation (feed + crank), drum kept near the drain mouth,
             feed-until-resistance rhythm, slow steady pace not fast. The shot copies exactly
             those hand mechanics
Angle:       risk removal — verify before you trust
Motion:      subject travel through depth (cable feeding INTO the drain) + light/subject change
             (the water ring dropping)
```

```
Shot S5 — 12.0–13.5s   [payoff — HERO, 3-draft rule]
Story job:   payoff — control regained; the house sounds normal again
Action:      from behind at counter height: the homeowner sets the kettle back on the hob
             without hurry; the shoulders drop ~2 cm on one exhale; in the foreground sink
             corner, water runs freely down the now-clear drain
Camera:      MCU from behind / three-quarter, static; face NEVER visible
Lighting:    the same warm kitchen practicals as A1/S2 — one world, one hour
Audio:       kettle click; free-running water (the same water, now healthy); room tone resolving
Text:        "Licensed. Local. Verifiable." (mid-safe)
Source:      pure AI + why: no talent exists; the from-behind framing deletes the face/lip-sync
             risk class entirely; relief is posture-only — no performed joy (LB25)
Real-ref:    NO REFERENCE FOUND — HIGH RISK — "the specific micro-behavior of post-repair
             relief at a kitchen counter (shoulders, kettle, pace)" — what would help: any real
             customer B-roll, or one reference clip of someone resuming an interrupted domestic
             task. Surfaced to Karl in the Bible Status Header; not accepted silently
Angle:       risk removal — verify before you trust
Motion:      TWO AXES (hero): subject travel (kettle to hob + the shoulder drop) + light change
             (steam wisp catching the practical as the kettle lands)
```

```
Shot S6 — 13.5–16.5s   [CTA endcard]
Story job:   CTA — the number, and the invitation to do what the ad just did
Action:      black brand field; the real logo file fades in (fade-in only, per endcard rule);
             type sets beneath it; a ≤5% red luminance pulse keeps the frame alive; 2% slow
             scale drift across the full 3.0s so no frame is static
Camera:      graphic card (no camera); the drift is the motion
Lighting:    n/a — brand black; red reserved exactly here (red = brand, never alarm)
Audio:       the bed resolves to one low note, then silence — the ad ends quieter than the feed
Text:        "480-992-3541" (large, ≥2s dwell ✓ at 3.0s) · "ROC 366870 — look us up." ·
             "24/7 EMERGENCY DRAIN REPAIR" (logo tagline ONLY — the wrap's "& SEWER" line never
             appears; tagline-drift rule) — all inside the 15–70% safe area
Source:      COMPOSITE FROM REAL FILES ONLY — logo is the real asset; every character burned in
             post; nothing brand-bearing generated (LB24)
Real-ref:    exempt — graphic card, no real-world scene depicted; direct-address format carries
             the In-World Reason
Angle:       risk removal — the CTA literally invites verification
Motion:      light change (logo fade-in + red pulse) + micro scale drift — named, because a
             static endcard is a dead frame
```

---

## Feeling Spec (Emotion Causality — every feeling has an on-screen cause)

| Beat | Feeling (specific) | Observable on-screen cause |
|---|---|---|
| Hook A | jolt → guided | water rising in real time; the step text arriving as the hand kills the tap |
| Hook B | dread | the waterline touching the first rug fibers |
| Hook C | curiosity | digits going into an official form; the pre-last-digit hesitation |
| B2 | assurance | the ACTIVE status line loading on the state site |
| B3 | safety | the tech's stand-back distance and visible ID; the wait |
| B4 | competence-calm | the cable's steady feed; the water ring dropping |
| B5 | control regained (relief) | the shoulder drop; the kettle landing; water running free |
| B6 | resolve | the number large and still; the invitation to verify |

Arc lands the CTA as the emotionally obvious next step: the viewer has watched the check work —
the CTA is that same act, made theirs.

## Sound Spine (muted-first; one bed, LB26)

| Time | Diegetic | Music | SFX | VO | Silence | Emotional purpose |
|---|---|---|---|---|---|---|
| 0–2.5 | variant (gurgle / trickle / key taps) | none | — | none | — | wrongness (A/B) or focus (C) |
| 2.5–6.5 | taps → confirm tap, room tone | none | — | "Before you let anyone in — check them." | — | control arriving |
| 6.5–9.5 | latch, street, muffled greeting | none | — | "This is what licensed looks like." | — | safety |
| 9.5–12.0 | drum ratchet, water giving | none | — | — | — | competence (the ratchet IS the line) |
| 12.0–13.5 | kettle click, free water | none | — | "911 Drain." | — | relief |
| 13.5–16.5 | — | one low resolving note | — | "The number's on your screen — look us up first." | tail | resolve — end quieter than the feed |

**Sonic hook decision:** the six key taps (C-variant native; echoed at S2 in all variants).
Muted placements lose nothing: every beat's meaning is carried by picture + burned text.

## Storyboard-gate self-check (the S2 gate line)

- All TEN fields filled on every shot — counted: 10 × 8 shots ✓
- Every action passed the In-World Reason Test (no action exists to show the viewer a logo; the
  phone check, the stand-back, the kettle are all things these people would do unobserved) ✓
- Flow reads as one story per variant (chain + shuffle in the Bible §4) ✓
- Feeling Spec with a cause per beat ✓ · Sound Spine present ✓
- CITED Real-ref on 7 of 8 shots; **1 × NO REFERENCE FOUND — HIGH RISK (S5), surfaced by name** ✓
- Karl has seen the storyboard: **PENDING — parked at owner gate (Status Header)** ☐
