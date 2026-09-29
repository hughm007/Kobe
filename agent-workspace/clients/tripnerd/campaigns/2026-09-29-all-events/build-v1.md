---
title: "TripNerd — THEIR CAMERA ROLL build v1 (25 s master + 15 s cutdown)"
type: report
client: tripnerd
campaign_id: 2026-09-29-all-events
owner: Karl
status: active
created: 2026-09-29
updated: 2026-09-29
tags: [build, video, camera-roll, motion-design, real-photos, 9x16, qa]
---

# THEIR CAMERA ROLL — build v1

**Status: OWNER APPROVED 2026-09-29 (25 s)**, ranked by the owner above the 8.4 hosting spot; no numeric score given. See `../../Client approved adverts/2026-09-29-their-camera-roll-25s.md`. The 15 s cutdown was not separately reviewed. **Paid use is still blocked** on the items under *Must clear*.

## Deliverables (FACT)

| Cut | Link (Higgsfield media) | Spec | MD5 |
|---|---|---|---|
| 25 s master | [`ea121491`](https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/ea121491-9b8a-4203-8430-a8e3b4676c1c.mp4) | 1080x1920 · 30 fps · H.264 yuv420p bt709 · AAC 320k 48 kHz stereo · 25.00 s · 84 MB | `0479255e61a0ca5b0c5cf4580bd561af` |
| 15 s cutdown | [`594c1292`](https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/594c1292-eaf5-46ba-a763-fdfd453aacf9.mp4) | same spec · 15.00 s · 53 MB | `1dac2c3730e1dc89c39e60587527a5cb` |

- **Silent masters** (sandbox only): `b111812330d5dc7e857b86bca5b9cd63` (25 s) and `8b4a056d70a553abc8d5cccd279e497c` (15 s).
- **Mixes:** `1a6db8b5d5bd283a39449a4f46c2cad1` (25 s) and `5ce4e410237c27e7005b8ea77183dbf5` (15 s).
- **Review sheets:**
  - Contact sheets: [25 s `2d0f865d`](https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/2d0f865d-21f1-4521-b6e8-6729d5600570.jpg), [15 s `656dc25e`](https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/656dc25e-8939-4721-a2e7-4dc3b002bdcd.jpg).
  - Flash-cut frame-check: [`51a93d27`](https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/51a93d27-ed9c-45cf-8bae-39995c23531f.jpg).
  - Tone before/after: [`bda1b051`](https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/bda1b051-a468-44af-8096-a4ccb4126656.jpg) and [`b4b0484b`](https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/b4b0484b-1a24-4ff2-a876-250ee75aae4b.jpg).
  - Gallery vetting sheet: [`b6c482d7`](https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/b6c482d7-427b-40c4-bb60-e68b7ae775cf.jpg).
- **Build scripts:** `build-v1/`
  - `setup.sh` stages the inputs.
  - `render.py` is the frame renderer; run `python3 render.py master|cut15 [full|stills t1,t2,…]`.
  - `audio.py` is the sound design and mix.
  - They ran in the Higgsfield sandbox (this container has no ffmpeg and cannot reach the media CDN).

## What is real, what was touched, what was made

| Element | Source | Treatment |
|---|---|---|
| 10 hero photos | TripNerd's own "NERDS in Action" gallery (tripnerd.com/nerds): gallery 09, 078, 020, 026, 030, 01, 062, 022, 085, 084 | Higgsfield `upscale_image` (2k), then Adobe `image_apply_auto_tone`. Faces checked unchanged and sharper. Toned copies are saved as Higgsfield media (IDs in `build-v1/setup.sh`). In the edit: a soft highlight glow, and nothing else |
| Grid and filmstrip tiles | 71 of the 85 gallery photos | Square crops only |
| The "comes alive" clip | Our real suite video V23 (`d925d5be`), source 29.8–33.2 s | Higgsfield `upscale_video` to 1080p/30; light contrast, saturation and glow grade |
| The roar | Our real V24 (`2911d9d6`), picture source 13.6–15.8 s; audio pre-laps from 13.3 s | Same upscale and grade; 7 % punch-in at the cut |
| Crowd and suite sound | Real audio from V23 and V24 (the murmur bed is V24 at 19–28 s) | Level and fades only. Sync was verified by cross-correlation against the upscaled clips (r = 1.00) |
| Camera-roll interface, captions, event list, end card | Composited in code (Inter / Montserrat, real logo file `46ae277a`) | A generic design, not Apple's |
| Music bed and interface sounds | Synthesised in code: 120 bpm drums and sub, shutter, taps, swipes, riser, end sting | **Placeholder.** Swap in a licensed track before paid use; the edit is cut on a 120 bpm grid |

**No generated people, venues, voices or footage.** Generation spend for this build: **0**. Touch-up spend (Higgsfield transactions, FACT) was **20.18 credits**: 10 image upscales × 2, plus two video upscales at 0.10 and 0.08. The Adobe auto-tone ran on the Adobe account; no credit figure is reported.

### Gallery photos left out of the grid (vetted on sheet `b6c482d7`)
| Gallery number | Reason |
|---|---|
| 063 | An apparent Pro Football Hall of Famer (gold jacket) |
| 074 | "Kentucky Derby" rose backdrop (a mark) |
| 040 | NFL team jersey |
| 017 | NASCAR broadcast on a TV, with driver names |
| 013 | THE PLAYERS logo on the suite TV |
| 070, 071, 072, 076 | Possible Augusta; never shown |
| 077 | Staff photo with a Nike logo |
| 037 | Hockey Canada shirt |
| 023 | Leaf-logo team shirts |
| 039 | Venue sign |
| 05 | Sunoco sign |

## As built (both cuts share one renderer)

| 25 s | 15 s | Beat |
|---|---|---|
| 0.00–1.25 | 0.00–1.05 | Camera-roll grid, momentum flick, finger tap on the Derby tile. Hook **"Their camera roll / this year."** |
| 1.25–1.65 | 1.05–1.40 | Shared-element expand from the tile into the viewer (blurred ambient background, header, filmstrip) |
| 1.65–9.30 | 1.40–6.30 | Swipes with motion blur. Derby Day · May · Louisville, KY → (they dressed up) → Race Day · February · Daytona Beach, FL → The 16th · February · Scottsdale, AZ. The 15 s cut skips the "(they dressed up)" beat |
| 9.30–13.00 | 6.30–8.30 | 17 at Sawgrass · March · Ponte Vedra Beach, FL. The still has a ▶ 0:05 badge, then **comes alive** and grows to full screen |
| 13.00–15.00 | 8.30–9.80 | Hard cut to the real roar (the only hard cut) |
| 15.00–17.50 | 9.80–11.30 | Rapid flicks, 0.5 s each. 25 s: Phoenix couple, Daytona pit lane, Phoenix group, Sawgrass trio, TripNerd logo wall. 15 s: Derby attire, Phoenix couple, logo wall |
| 17.50–18.55 | 11.30–12.20 | Collapse back into its grid tile, then pinch out to 6 columns (dozens of real trips) |
| 18.15–20.50 | — | Event list: Derby Day. Daytona. The 16th in Phoenix. 17 at Sawgrass. The big game. Nashville. + more. |
| 20.62–22.50 | 11.80–13.00 | **We have everything. / Which one's yours?** |
| 22.50–25.00 | 13.00–15.00 | Blue end card: real logo, Now booking 2027, a **Talk to a Nerd** pill (a finger taps it), tripnerd.com |

## QA

**QA1: machine harness** (`servicepow_qc.py`, byte-identical copy run in the sandbox; preflight PASS, self-tests trip). FACT:

| Check | 25 s | 15 s |
|---|---|---|
| resolution / fps / pix_fmt | 1080x1920 · 30.000 · yuv420p PASS | same PASS |
| audio 48 kHz stereo; peak ≤ −0.5 dB | PASS · peak −1.4 dB, mean −14.6 dB | PASS · peak −1.4 dB |
| frozen sections (end card exempt: 2.5 s / 2.0 s) | PASS | PASS |
| black sections | PASS | PASS |
| motion gate / hook motion | 19.41 / 14.65 PASS | 30.87 / 13.51 PASS |
| aspect 9:16, duration | PASS · 25.00 s | PASS · 15.00 s |
| no flash cuts | **FAIL as reported** (11 detected, 5 < 0.4 s) | **FAIL as reported** (12 detected, 7 < 0.4 s) |

**Flash-cut FAIL, frame-checked.** This is the harness's documented whip-edit limit (`knowledge/learnings/2026-08-31-harness-instrument-limits.md`). The frame-check sheet `51a93d27` shows every flagged spike sits inside a continuous designed move:
- the grid flick at 0.08–0.67 s;
- the expand at 1.5 s;
- the swipes at 5.17, 9.17 and 15.08 s;
- the pinch-out at 18.17 s.

The only hard cut is 13.0 s (V23 to the roar; 8.3 s in the cutdown), and both shots around it run longer than 0.4 s. The shortest designed hold is a 0.3 s rest inside the 0.5 s flicks. **Verdict: no real flash cuts.** The limit is recorded here and the FAIL is not silently passed.

**Loudness** (ffmpeg loudnorm, FACT):
| Cut | Integrated | True peak | LRA |
|---|---|---|---|
| 25 s | −13.98 LUFS | −1.39 dBTP | 11.6 LU |
| 15 s | −13.92 LUFS | −1.38 dBTP | 9.3 LU |

- **Momentary profile:** about −13.5 in the grooves and about −21 in the pre-roar breakdown (raised from about −27 after the first pass). The roar peaks near −8.5, making it the loudest moment by design.
- **Speech screen:** faster-whisper found **0 segments** in either mix, so there are no intelligible words.

**Not done yet:**
- QA2 physical realism: not applicable to untouched photos, but the owner should watch the upscales in motion.
- The Skeptic pass (isolated) and the Critic scorecard.
- The owner's end-to-end watch with sound (nobody in this loop can hear the mix).

## On-screen copy: claim check
| Line | Basis | Label |
|---|---|---|
| Their camera roll this year. | Owner-approved script. The photo dates are unknown; they may not all be from 2026 | **ASSUMPTION.** Confirm the photos are this season's, or drop "this year" (one-line change) |
| Derby Day · May · Louisville, KY | The Kentucky Derby is run in May at Churchill Downs, Louisville; the twin spires are in the photo | FACT |
| Race Day · February · Daytona Beach, FL | TripNerd's only Daytona package is the Daytona 500 (February), but the photo's own race is not verified | **ASSUMPTION** |
| The 16th · February · Scottsdale, AZ | The Phoenix Open is in February at TPC Scottsdale; the photo was identified as the Phoenix suite | ASSUMPTION (strong) |
| 17 at Sawgrass · March · Ponte Vedra Beach, FL | Our V23 footage from the 17th-hole suite; THE PLAYERS is held in March | FACT |
| Event list | TripNerd's featured events (site read 2026-09-29), in shorthand | FACT |
| We have everything. | The owner's line; an absolute | Puffery. The owner's call; alternative ready: "Pick your event." |
| Now booking 2027 · Talk to a Nerd · tripnerd.com | Site: "Now Booking in 2026 & 2027", "Talk to a Nerd" | FACT as of 2026-09-29; recheck at launch |

## Must clear before paid use
1. **Guest consent (BC-20).** Identifiable guests appear in every hero photo and many tiles; Taylor confirms marketing consent for paid amplification. **The Daytona hero (gallery 020) shows a child:** it needs a parent's consent, or swap it for the pit-lane photo (gallery 01, a 1-minute re-render).
2. **Music.** Replace the synthesised placeholder bed with a licensed 120 bpm track (the edit's grid).
3. **Marks (ESTIMATE, not legal advice).**
   - Churchill Downs' twin spires are in the Derby hero, incidentally.
   - Small sponsor signs sit in the Phoenix and Daytona photos, and a university cap in the Sawgrass trio.
   - Event names are shorthand only and no event logos appear. TripNerd decides whether full names are wanted.
4. **The "this year", Daytona month and "We have everything" calls** above.
5. **Derby source.** The Derby images are TripNerd's website photos. No Derby files were found in the repo, Drive or Higgsfield under any Derby name; if the owner has Derby video, it replaces a still.
