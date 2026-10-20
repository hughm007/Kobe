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
