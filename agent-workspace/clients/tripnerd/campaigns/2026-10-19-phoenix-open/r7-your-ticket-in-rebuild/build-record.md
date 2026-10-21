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
