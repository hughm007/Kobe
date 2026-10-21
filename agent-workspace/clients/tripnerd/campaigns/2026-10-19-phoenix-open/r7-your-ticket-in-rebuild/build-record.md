---
title: Phoenix Open Reel 3 "Your Ticket In" rebuild, build record
type: report
client: tripnerd
owner: Karl
status: active
created: 2026-10-20
updated: 2026-10-20
tags: [reels, phoenix-open, video-production]
---

# Reel 3 "Your Ticket In": rebuild per BRIEF.md + owner updates (2026-10-20)

**Status: DELIVERED 2026-10-20.** `TripNerd_PHX_Reel3_YourTicketIn_FINAL.mp4` is 17.70 s, 531 frames, 1080x1920, 30 fps, H.264 + AAC, measured at −14.1 LUFS / −1.2 dBTP. The MP4 was sent in chat; the binary lives outside the repo, and `contact7.jpg` is its contact sheet.

**Music:** [EDM Hybrid Intro (Tidal Rush, Hype Build), OpenMindAudio](https://pixabay.com/music/electro-edm-hybrid-intro-tidal-rush-hype-build-456799/). Pixabay Content License; not Content-ID registered; the owner downloaded the MP3.

**Owner sign-offs:**
- V01 starts at 2.5 s.
- Photos run 2 beats each.
- The logo file stands in for "TRIPNERD FAN EXPERIENCES".
- FOOD + DRINK INCLUDED and HOTEL ✓ (both on TripNerd's public Phoenix Open page).
- "PHOENIX OPEN" appears as factual text only, with no tournament marks.

## Measured on the delivered MP3

- **Drop attack:** 46.5205 s.
- **Kick grid:** 124.0 BPM, with a beat at 46.532 s. The hi-hats sit on the off-beat at +0.24 s.
- **Sync:** the drop attack is locked to the flash frame at 5.100 s, so the music starts at 41.4205 s in the track. In the final file the drop attack measures at 5.105 s.
- **Cut frames:** 269, 299, 328, 357, 386, 415, 444, each within 16.5 ms (half a frame) of a beat. The file ends at frame 531 (17.70 s), which is beat +26.
- **Levels:** worst 0.5 s dip after the drop is −1.6 dB. The music fades out (cos²) over the last 1.0 s.
- **Audio rules:** no clink and no crowd tail, per the owner's final rule that only music plus V03 crowd is heard.

## Superseded plan, kept for the record

## Inputs

- `TripNerd_PHX_Reel3_BUILD.zip`: `BRIEF.md`, V01, V03, P01/P02/P04/P05/P08/P09, `TripNerd_logo_ORIGINAL.png`.
- `opener.mp4`: Higgsfield AI clip, 1080x1912, 24 fps, 3.04 s.

## Owner updates that override BRIEF.md

1. **Opener is slowed, not frozen.**
   - Source 0.00–0.90 s plays at 50% speed using DIS optical-flow in-betweens, giving 1.8 s.
   - The cup smear starts at about 1.04 s in the source, so it is never shown.
   - The ticket face is tracked to the stub with an LK feature + RANSAC homography for each source frame; corners are in `quads.json`.
2. **Claude picks the music.**
   - Candidates were scored in the Higgsfield sandbox; only non-Content-ID tracks were kept.
   - Each track was checked for: at least 5.1 s of lower energy before the drop, no 0.5 s block more than 4.5 dB below the median in the 13 s after it, and BPM from a comb filter locked to the drop.

## Timeline (124.45 BPM grid)

| Time (s) | Shot |
|---|---|
| 0–1.8 | Opener + tracked ticket, "Your ticket in." |
| 1.8–4.1 | V01 from 2.5 s (the canopy pole is in frame until 2.45 s) |
| 4.1–5.1 | Ticket rises and pushes into the stamp |
| 5.1 | **White flash = DROP** |
| 5.1–8.97 | V03 from 1.9 s (8 beats), "This is the 16th." |
| 8.97–14.73 | P05, P08, P02, P04, P09, P01: 2 beats each, hard cuts |
| 14.73–17.63 | End card |

## Mix plan (`mixR7.py`)

- One track, never ducked.
- V03 sits about 9 dB under the music, with a 0.4 s crowd tail.
- Ice clink at 0.0 s, at −12 dB.
- −14 LUFS / −1 dBTP.

## Open items

- Written confirmation is still pending for guest faces and the Feb 2027 package. The owner approved the food/drink and hotel lines from the public page.

## v2 revision (2026-10-21), owner revision pass

**Delivered:**
- `TripNerd_PHX_Reel3_YourTicketIn_v2.mp4`, without the hotel line: 17.40 s, 522 frames, −14.0 LUFS / −1.0 dBTP.
- `_v2_HOTEL.mp4`, which adds P06 with "Hotel included.": 18.37 s, 551 frames.

The owner's reply left both hotel options in, so both were rendered. The main cut drops P06 because nothing confirms it is the package hotel.

**Built with:** `renderR8.py` + `mixR7.py` (V03 source start now comes from the meta file; 10 ms fade-in when the music starts mid-track).

**Changes from v1:**
- **Ticket sequence.** Rise (1 beat), then a perfectly still hold (2 beats; frames 130–158 are identical), then a push into the stamp (1 beat). The original logo file then does a 360° Y-axis perspective spin (2 beats, smootherstep). The back half shows the logo un-mirrored. The spin lands on the exact original pixels (880×324) on frame 201; the white flash/drop is frame 202 (6.733 s).
- **Music.** The drop is unchanged at 46.5205 s, so the music now starts at 39.787 s in the track. Every section boundary sits on the 124 BPM kick grid; the worst cut-to-beat error is 16.5 ms.
- **Photos.** Matched to the real inclusions:
  - P03 + P09: "Hole 16."
  - P02 + P04: "Food & drink included." (water bottles on the rail; cup in hand in P04)
  - [P06: "Hotel included." — HOTEL cut only]
  - **Dropped:** P08 (same scene as P09, the reported repeat), P01 (soft), P05 (same scene as P02/P04), P07 (fan shop), P10 (Augusta).
  - No photo shows food.
- **Captions.** All cut on with no scale animation. The earlier "zoom" was the caption pop-in; the photo pixels were already static. Photo captions moved to y = 480, clear of faces.
- **V03.** Starts at 3.6 s, once the spectator's head and the rail are out of the bottom-left. This loses the sand blast (visible 2.9–3.2 s).
- **Opener.**
  - Source 0.00–0.72 s, giving 1.43 s at 50% speed. The cup rim warps from source frame ~18.
  - The ticket quad is 5% larger, so no AI-stub edge or teeth show. The source stub has no printed text (contrast-checked).
- **End card.** The logo is at a fixed 880×324 with no scale-in (v1 measured correct; the 0.92→1.0 scale-in was the only shape change). Its elements cut on beats.
- **Muxing.** `-shortest` trimmed 2 end-card frames on v2, so it was remuxed. Fix the mux step before reuse.

## v3 revision (2026-10-21, second pass)

**Delivered:** `TripNerd_PHX_Reel3_YourTicketIn_v3.mp4`, 19.80 s, 594 frames, −14.0 LUFS / −1.2 dBTP.

**Built with:** `renderR9.py` + `ticket9.py` (the ticket drawn at 4× size, with the stamp as its own layer) + `mixR7.py`. The v2 mux issue is fixed by remuxing the silent video with the mixed audio.

**Changes from v2:**
- **Stamp spin.** The Y-axis logo spin is replaced by a FLAT stamp turn: the whole stamp (ring text + mascot) rotates 360° clockwise about its own centre.
  - Smootherstep easing, 2 beats (5.77–6.73 s).
  - The camera is locked at the end of the push, so there's no squish or blur.
  - The landing frame (201) is asserted identical to the pre-spin frame (172) in the raw render.
  - The end-card logo does not spin.
- **Photos**, each static with one caption:

  | Photo | Crop | Caption |
  |---|---|---|
  | P09 | cover, cx 0.55 | "Hole 16." |
  | P02 | cover, cx 0.22 | "Hole 16." |
  | P05 | box 0,450,558,1442 (guest holding a cup) | "Drinks in hand." |
  | P04 | box 0,364,639,1500 (cup in hand + bottle) | "Drinks in hand." |

  - P03 is removed (the green-hat photo the owner flagged). The P04/P05 crops exclude the green-hat man entirely.
  - There is no food photo in the pack, so the caption reads "Drinks in hand." The ticket still says FOOD + DRINK INCLUDED.
- **P06 hotel ending.**
  - P06 pans for 5 beats (14.50–16.90 s) with no caption. The first 30% eases in, then it holds a constant 5.88 px/frame.
  - The end-card foreground enters at that same speed and decelerates to rest over 18 frames. The background stays static.
- **Opener.** Unchanged from v2: the slowed clip move with no added drift (the owner clarified "locked").
- **Checks.**
  - The drop audio is 5 ms after the flash.
  - Every cut is within 16.5 ms of a beat.
  - All four captioned photos are static (P04's only change is 17 px of codec flicker, zero shift).

## v4 revision (2026-10-21, third pass): sell TripNerd AT the Phoenix Open

**Delivered:** `TripNerd_PHX_Reel3_YourTicketIn_v4.mp4`, 19.80 s, 594 frames, −14.0 LUFS / −1.2 dBTP. Built with `renderR10.py`, `timing_r10.json` and `mixR7.py`, then remuxed.

**Caption arc** (owner-supplied copy; one caption per shot, on for the whole shot; white on a black plate at alpha 170, y = 460):

| Shot | Caption |
|---|---|
| Opener | "Phoenix Open 2027." |
| V01 | "Everyone wants the 16th." |
| Ticket | "TripNerd gets you in." |
| V03 | "Hole 16. With TripNerd." |
| P02 | "Your spot at the 16th." |
| P05 crop | "Food & drink included." |
| P06 pan | "Hotel included." |
| End card | "The Phoenix Open, done the TripNerd way." + padded "Talk to a Nerd" button (78/40 px padding) + "Link in bio" |

No banned words (checked).

**Changes from v3:**
- **Opener:** REAL source frames 0–22 only, at near real time, with no synthesized frames. It now runs 0.93 s, and V01 becomes 6 beats.
- **Push:** ease-in-out on one scale factor. Every push and turn frame is asserted to have a stamp aspect within ±0.5% (measured 0.998–1.003). v3 had also measured round, so the "squish" was the hard-accelerating push.
- **Photos:** P09 (backs of heads, pillars) and P04 (back of head, pole) dropped. Three photos remain: P02, the P05 crop and P06.
- **Ghost-caption bug** (found in QA): the ticket background was taken from the captioned V01 frame. It now uses the clean frame.

**Checks:**
- Every shot start is within 16 ms of a beat.
- The drop audio lands 5 ms after the flash.
- The stamp landing frame is identical to the pre-turn frame.
- P05 shows a drink but no food (no food photo exists).

## FINAL (2026-10-21): TripNerd is the hero, scheduled to post 12pm ET

**Delivered:** `TripNerd_PHX_Reel3_FINAL.mp4`, 19.33 s, 580 frames, −14.1 LUFS / −1.4 dBTP.
- **Drop:** frame 217 (7.233 s); the music starts at 39.287 s in the track.
- **Built with:** `renderR11.py`, `timing_r11.json` and `mixR7.py`, then remuxed.

**Shots and captions:**

| Shot | Caption |
|---|---|
| Opener: real frames 0–22, held (~65% speed) | "Phoenix Open 2027." |
| V01 | "Everyone wants the 16th." |
| Ticket at 1.06×, hold 1.47 s; push to S = 2.8 so the caption sits on the ticket's blue band; flat CW stamp turn | "TripNerd gets you in." |
| V03 from 3.6 s | "Hole 16. With TripNerd." |
| WEB_crowd | "This is the 16th." |
| WEB_suite | "Your 16th Hole LOGE Suite." (approved; TripNerd's site lists "16th Hole LOGE Suite Tickets") |
| WEB_bar | "Food & drink included." |
| WEB_hotel pan | "Hotel included." |
| End card | "The Phoenix Open, the TripNerd way." + "Talk to a Nerd" (96/46 px padding) + "Link in bio" |

**How it was built:**
- **Web photos:** split from the owner's strip at 300×201 px each (the thumbnails, not the 800×535 / 1920×1280 originals named in the brief). Shown sharp at 2.4× (720×482) over a blurred, darkened fill of themselves.
- **Hero shot:** WEB_hero not used (optional; also a thumbnail).
- **Grade:** one warm/bright grade on footage and photos only, never on the logo or ticket.
- **Checks:**
  - Stamp aspect 0.997–1.002.
  - The landing frame equals the pre-turn frame.
  - Every shot starts within 17 ms of a beat.
  - The drop audio lands 5 ms after the flash.
  - The photos and the hold are static (codec noise only).
  - No banned words.

**Open:**
- Replace the web thumbnails with the originals when TripNerd sends them, then re-render (`renderR11.py` takes them as-is; switch the card scale to native).

## v5 (2026-10-21): v4 + new ending "From the noise to the quiet"

**Delivered:** `TripNerd_PHX_Reel3_v5_quiet.mp4`, 19.33 s, 580 frames, −14.0 LUFS / −1.2 dBTP. Built with `renderR12.py`, `timing_r12.json` and `mixR12.py`.

**Kept section:** 0–14.50 s is v4 unchanged. The owner's attached file was byte-identical to our v4. Decoded frames 0–434 differ from v4 by a mean of 0.000, and the audio for 0–13.9 s is within 0.04 dB of v4.

**New ending:**

| Time (s) | Beat | Picture | Audio |
|---|---|---|---|
| 14.00–14.50 | 15 → 16 | (food & drink photo) | V03 roar (source 6.25–6.75 s) swells over the music, ending ~5 dB above it; the loudest 0.4 s window of the Reel at −9.5 dB |
| 14.50 | 16 | Hard cut to FSP_01 (Fairmont pool); caption "Stay at the Fairmont Scottsdale Princess." | Music ducks to −30 dB in 30 ms (the quiet measures −35 dB); crowd cut; synthesized pool ambience (band-limited noise swells + soft drips, no voices) |
| 14.50–14.80 | — | Hotel ticket slides up into the lower-middle: same paper and header band with the original logo, plus one real-text line, "HOTEL: Fairmont Scottsdale Princess" | Quiet + water |
| 14.80–14.97 | — | Stamp (`stamp_k`, a geometric circle) presses down: uniform scale 1.6→1.0 on a square raster, so it can't go oval | Quiet + water |
| 14.967 | 17 | Stamp lands | Music back at full (8 ms ramp); attack measured at 14.978 s |
| 16.90 | 21 | Cut to the v4 end card (unchanged), which arrives at the pan speed | — |
| 16.90–19.33 | 21 → 26 | End card holds | Music fades over the last second |

**Fairmont photo:**
- Both attachments arrived as 2000×1333 chat images, not the 6720×4480 original.
- To honor the no-upscaling rule, it runs at native pixels as a 1080×1333 band (y 293–1626) with a blurred extension fill, panning 360 px.
- Swap in the original for a true full-bleed 9:16 crop.

**Checks:** no banned words.

## FINAL Explore cut (2026-10-21): "TripNerd is how you do the Phoenix Open"

**Delivered:** `TripNerd_PHX2027_Reel_FINAL_Explore.mp4`, 19.87 s, 596 frames.
- **Loudness:** −14.8 LUFS / −1.2 dBTP. The audio was trimmed 0.7 dB after a −0.6 dBTP master.
- **Built with:** `final13.py` (shared pieces), `renderR13.py`, `mixR13.py` and `timing_r13.json`.

**Assets:**
- Photo pack 01, 03, 04, 05, 06b.
- The owner's opener, V03, and the AI food clip `hf_20261021_175347…` (0:02–0:04).
- The original logo file and the EDM Hybrid Intro track.

**Timeline:** drop at 6.30 s (frame 189); music starts at 40.221 s in the track.

| Time (s) | Shot | Caption |
|---|---|---|
| 0–1.47 | 01 aerial, push 1.0→1.3 (ease-out) on the stadium at (2240, 1280) | "The loudest hole in golf." |
| 1.47–2.93 | 05 | "Everyone wants the 16th." (the "20,000" figure is unconfirmed: sources say 17k–20k+) |
| 2.93–4.37 | Opener, real frames 0–22 held (~63%) | "Here's how you get in." |
| 4.37–6.30 | Tall `SuiteTicket`: 3 INCLUDED rows; stamp alone in the stub; flat CW spin over the last 2 beats; the landing frame is asserted identical to the hold | — |
| 6.30 | DROP flash | — |
| 6.30–9.20 | V03 from 3.6 s | "Hole 16. With TripNerd." |
| 9.20–11.63 | 03 → 04 | "Your view from the 16th Hole LOGE Suite." |
| 11.63–13.57 | Food clip, 9:16 crop at cx 0.47 | "Food & drink included." |
| 13.57–14.07 | V03 6.5 s, roar +5 dB over the music: the loudest 0.4 s at −8.7 dB | — |
| 14.07–16.97 | 06b Fairmont pan (620 source px). 150 ms duck to −30 dB + water; mini ticket; stamp beside the text at 14.533 s; music fully back on the kick at 14.537 s (100 ms fade-up) | "Then you stay here." |
| 16.97–19.87 | End card (padded button); last 9 frames crossfade into frame 1 for the loop (last frame vs frame 1 mean difference 0.5) | — |

**How it was built:**
- **Captions:** all the same size (Montserrat ExtraBold 70) at y = 340, centred at x = 500 (clear of the right-side UI), on a light translucent bar with a subtle shadow.
- **Grade:** a warm/bright grade with +12% saturation and +7% contrast on all footage. Never applied to the logo or ticket graphics.

**Deviations:**
- **02_tee_16th:** 1856×1044, too small for 9:16 without upscaling, so 05 takes shot 2 and the suite POV is 03 → 04 (two cuts).
- **06b chosen** over 06: 06 can't be verified as the Fairmont.
- **The food clip is 1080p**, so its 9:16 crop is enlarged 1.78× (the only enlarged source).

**IG caption:**
> The loudest hole in golf, from your own seat in the 16th Hole LOGE Suite. ⛳🔥 / Food & drink included. Then back to the Fairmont Scottsdale Princess. / Who are you bringing to the 16th? 👇 / #WMPhoenixOpen #PhoenixOpen #Scottsdale #GolfTrip #TripNerd

**Cover:** frame 0 (the aerial with the hook text).

## "Ticket checklist" FINAL (2026-10-21)

**Delivered:** `TripNerd_PHX2027_Reel_Checklist_FINAL.mp4`, 21.78 s, 653 frames, −14.0 LUFS / −1.0 dBTP. Built with `renderR14.py`, `mixR14.py` and `timing_r14.json`.

**Timeline:** drop on the flash at 7.233 s; music starts at 39.287 s in the track; every cut is within 13 ms of a beat.

| Time (s) | Beats | Shot | Caption |
|---|---|---|---|
| 0–1.93 | 4 | Drone 0:00–0:02, crop centred on the 16th | "Phoenix Open 2027." |
| 1.93–4.33 | 5 | V01 pan from 2.5 s | "Everyone wants the 16th." |
| 4.33–5.80 | 3 | Opener: real frames 0–22 held (~65%), the checklist ticket tracked on the stub | "TripNerd gets you in." |
| 5.80–7.23 | 1 + 2 | Push into the stub stamp (one scale factor), then a flat CW 360° spin; the landing frame is asserted identical | — |
| 7.23 | — | Flash / DROP | — |
| 7.23–9.67 | 5 | V03 from 3.6 s, its only use; crowd 7 dB under the music | "Do the Phoenix Open with TripNerd." |
| 9.67–10.63 | 2 | Ticket ck1: slides in, line-1 check draws on the beat | — |
| 10.63–12.57 | 4 | Suite: V01 0.0–1.93 s (guests at the rail; doesn't overlap the pan segment) | "Your 16th Hole LOGE Suite." |
| 12.57–13.53 | 2 | Ticket ck2 | — |
| 13.53–15.00 | 3 | Food stack: two 1215×1077 windows downscaled into 1080×957 panels, ~55% speed from real frames | "Food & drink included." |
| 15.00–15.97 | 2 | Ticket ck3 | — |
| 15.97–18.37 | 5 | 06 pan (06 shows mission-style buildings beside the TPC tents) | "Fairmont Scottsdale Princess included." |
| 18.37–21.78 | 7 | End card: "Do the trip right with TripNerd.", filled "Talk to a Nerd" + outlined "Link in bio" buttons | — |

**Ticket:** one `ChecklistTicket` design throughout:
- Header band with the original logo.
- 3 real-text lines with checkboxes; checks are drawn-on strokes.
- A highlight tint on the active line.
- The stamp alone in the perforated stub, asserted not to overlap any text.

**Sound:** hotel cut ducks to −35 dB for one beat, with water ambience, and the music is back on the kick at 16.438 s.

**Motion check** (decoded output):
- Every video segment changes frame to frame.
- Longest hold: 3 frames in the food stack and 2 in the opener (both held real frames at reduced speed); 0 in the others.
- The only still is the hotel photo.

**Known compromise:** the tilt-down food clip puts food in every top band. The caption sits over the counter and glasses, but the tip of one topping touches it in the last ~0.15 s.
