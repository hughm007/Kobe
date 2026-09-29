---
title: "Recipe: THE CAMERA ROLL, a real-photo motion-design advert (25 s + 15 s, 9:16)"
type: playbook
client: internal
owner: Karl
status: active
created: 2026-09-29
updated: 2026-09-29
tags: [ads, video, recipe, routine, real-footage, motion-design, 9x16, camera-roll]
source: TripNerd THEIR CAMERA ROLL build v1, owner approved 2026-09-29 and ranked above the 8.4 hosting spot
---

# THE CAMERA ROLL

**What it is:** a phone camera roll of the client's real customers. It is a scrolling grid that someone taps into, then swipes through event by event, with dates and places in the header. One photo turns out to be a video that comes alive, and the moment hits (for TripNerd, the crowd roar). Then it collapses back into dozens more, and ends on a list, the line and the card.

**Why it works:** every picture is real, and the format itself is authentic, because everyone scrolls their own camera roll. The motion design does the storytelling that generation used to be asked to do.

Decision `knowledge/decisions/0008-real-client-material-first-for-video-ads.md` makes this kind of route the default.

**Reference implementation:** `clients/tripnerd/campaigns/2026-09-29-all-events/build-v1/`
- `setup.sh` stages the inputs;
- `render.py` renders frames (both cuts from one file);
- `audio.py` does the sound design and mix.

Record and QA: `…/2026-09-29-all-events/build-v1.md`. Owner verdict: `clients/tripnerd/Client approved adverts/2026-09-29-their-camera-roll-25s.md`.

## Use it when
- The client has **at least 8 real photos across at least 3 occasions** (events, jobs, locations) and **at least 1 real phone video** with a moment in it.
- The message is breadth or envy: "look what our customers get", "we do all of it".
- Not for a single-offer or price advert. Pair it with a direct-response challenger if the objective is leads at a target cost.

## Inputs
| Input | TripNerd example | Rule |
|---|---|---|
| Photo pool for the grid | 85 photos on tripnerd.com/nerds (scraped in the sandbox) | Vet every photo on one numbered contact sheet. Drop third-party marks, celebrities, broadcasts, sponsor boards, team jerseys, minors (unless consented) and anything that might be a restricted venue |
| Heroes, one per occasion (4) | Derby, Daytona, Phoenix 16th, and a Sawgrass video | Each needs a verifiable place and month for the header; label anything unverified as an ASSUMPTION |
| Flicks (3–5) | Phoenix couple, pit lane, Phoenix group, Sawgrass trio, **logo wall last** | End on a brand-bearing real photo if one exists |
| One video with a moment | V23 (to the rail), then V24 (the roar) | The picture must be free of marks in the used range; the audio must be free of speech (run a whisper screen) |
| Logo | real file only | Never regenerated |
| Copy | hook, a place and month per hero, an event list, the payoff line, the CTA | Every line through the claims check (see below) |

## Timeline template (seconds; 30 fps)
| 25 s | 15 s | Beat |
|---|---|---|
| 0–1.25 | 0–1.05 | Grid momentum flick (starts at rest so frame 0 is crisp), hook as the big title, finger tap on hero 1 |
| 1.25–1.65 | 1.05–1.40 | Shared-element expand from the tile into the viewer |
| 1.65–9.3 | 1.40–6.3 | Heroes 1–4 with 0.3 s swipes; the header crossfades place and month; slow push of 0.05× per s |
| 9.3–13.0 | 6.3–8.3 | Video still with a ▶ badge; it comes alive and grows to full screen, chrome fades |
| 13.0–15.0 | 8.3–9.8 | Hard cut to the moment, with a 7 % punch and a white flash of 0.12 s. **The only hard cut** |
| 15.0–17.5 | 9.8–11.3 | Flicks at 0.5 s each (0.2 s swipe + 0.3 s hold) |
| 17.5–18.55 | 11.3–12.2 | Collapse into the tile, then pinch out from 4 to 6 columns and dim to 40 % |
| 18.15–20.5 | — | Event list, one line every 0.3 s |
| 20.62–22.5 | 11.8–13.0 | Payoff line, then the question |
| 22.5–25.0 | 13.0–15.0 | Brand card slides up: logo, eyebrow, CTA pill with a finger tap, URL |

## Build steps (all in the Higgsfield sandbox; this container has no ffmpeg and cannot reach the media CDN)
1. **Stage.**
   - Write `setup.sh` (idempotent; pulls from durable URLs).
   - Start every heavy step as a background job.
   - The sandbox is discarded without a lease. See `knowledge/learnings/2026-09-29-adobe-touch-up-on-higgsfield-media-needs-a-bridge.md`.
2. **Vet the pool.** Build one numbered contact sheet, view it, write the exclusion list into the config (`EXCL`).
3. **Touch up the heroes.**
   - Higgsfield `upscale_image` (bytedance 2k, 2 credits each) and `upscale_video` (about 0.1 credits per clip).
   - Adobe `image_apply_auto_tone` through the block-upload bridge (resolve the redirect, PUT over HTTP/1.1).
   - `media_import_url` the Adobe outputs so they are durable.
   - View a before/after sheet and keep the better version per photo.
4. **Configure.** In `render.py`, change only the configuration block:
   - `SEQ` (the order);
   - `HDR` (title and place/month);
   - `FOC` (the push focus per photo);
   - `EXCL`/`HERO` (gallery numbers);
   - the `SEGS` timings;
   - `LISTW`, the hook lines, the payoff lines and the card lines;
   - the logo path and colours.
5. **Stills first.** Run `python3 render.py master stills t1,t2,…` (about 5 s for 38 frames). View the sheet, fix the layout, then render both cuts in full (44 s for both on 8 cores).
6. **Sound (`audio.py`).**
   - Real ambience and the real moment, aligned to the upscaled clips by cross-correlation.
   - UI and camera sounds.
   - A **licensed** music bed on a 120 bpm grid (the synthesised bed is a placeholder only).
   - A breakdown before the moment at about −20 LUFS momentary, not quieter.
   - Master at −14 LUFS integrated, TP ≤ −1 dBTP (limiter at 192 kHz, iterate the gain).
7. **Mux**, keeping the silent master and the mix as separate files.
8. **QA:**
   - `servicepow_qc.py --master --aspect 9:16 --duration N --endcard 2.5`;
   - expect a flash-cut **false positive** from the flick, swipes and pinch, so frame-check it at 12 fps and record the limit;
   - a whisper speech screen;
   - a momentary-loudness profile;
   - contact sheets.
9. **Deliver:**
   - upload the MP4 (stream link) **and a zip** (a forced-download link);
   - an optional Adobe Creative Cloud copy;
   - write the build record;
   - once the owner approves, add a pointer file to the client's approved folder.

## Copy and claims rules
- **Headers:** an event nickname, then month and city. Never the event's registered name or logo unless the client approves.
- **Months:** state a month only when the event only happens then, or the photo is dated. Otherwise mark it as an ASSUMPTION or drop the month.
- **"This year" style lines** need the photo dates.
- **Absolutes** ("everything") are the owner's call; always have a softer line ready.
- **CTA and eyebrow** must match the live site (ad-to-destination parity).

## Must clear before paid use
- **People:** guest releases or event-terms consent, plus **parental consent for any minor** (or swap the photo).
- **Music:** a licensed track.
- **Marks:** incidental marks noted and accepted by the client.
- **Checks:** the Skeptic pass and the Critic scorecard on the frozen master.

## Next variants to build from the same renderer
- An opening hook test on the same body: "Their camera roll this year." vs the 2027 CALENDAR vs a review card opener.
- Single-event seasonal cutdowns: a Derby-only spring flight, Phoenix and Daytona in winter.
- A 4:5 feed version (the viewer box reflows; the grid gets 4 columns).
- A config-driven renderer (a JSON config instead of editing `render.py`). Regression test it by comparing stills pixel-for-pixel against the v1 reference.
