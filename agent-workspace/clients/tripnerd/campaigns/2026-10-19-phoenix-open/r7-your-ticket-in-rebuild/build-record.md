---
title: Phoenix Open Reel 3 "Your Ticket In" rebuild, build record
type: report
client: tripnerd
owner: Karl
status: draft
created: 2026-10-20
updated: 2026-10-20
tags: [reels, phoenix-open, video-production]
---

# Reel 3 "Your Ticket In": rebuild per BRIEF.md + owner updates (2026-10-20)

**Status:** the silent picture is rendered (17.63 s, 529 frames). The mix is waiting on the music MP3; Pixabay can't be reached from the build container, so the owner downloads the chosen track.

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

- **Claims Jason has not yet confirmed in writing:** FOOD + DRINK INCLUDED, HOTEL ✓, faces, and the Feb 2027 package.
- "PHOENIX OPEN" appears on the ticket, as the brief asks. That is a tournament trademark in on-screen text.
