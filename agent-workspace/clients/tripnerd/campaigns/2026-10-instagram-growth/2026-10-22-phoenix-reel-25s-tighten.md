---
title: "Phoenix Open Reel: 31 s to 24.4 s tighten (v1 preview)"
type: report
client: tripnerd
owner: Karl
status: draft
created: 2026-10-22
updated: 2026-10-22
tags: [reel, phoenix-open, edit]
---

# Phoenix Open Reel: tighten to 24.4 s (v1 PREVIEW)

**Sources:**
- Karl's zips part 1 and part 2: real clips with no text, photos, `TripNerd_logo_ORIGINAL.png` (same sha256 as the committed brand logo).
- **No project files for the old cut existed in this workspace.** So the ticket, corner card, captions and end card were rebuilt in code to match the old render.
- **Stamp:** lifted from the old render's pixels, then rotated -21.5° to match the logo's upright orientation (template match against the logo mascot).
- **Music:** the old cut's own track, re-edited on its beat grid (82 BPM):
  - head trimmed by 0.73 s;
  - the drop lands on the stamp→bunker hard cut at 9.83 s;
  - 8 beats removed at the end-card cut so the outro plays under the end card;
  - 1.5 s fade-out.

**Timeline (s):**

| Time | Shot |
|---|---|
| 0–2.52 | Aerial |
| 2.52–6.18 | Suite (both captions) |
| 6.18–9.83 | Ticket: full 1.26 s, push 1.0 s, spin 1.2 s, hold 0.2 s |
| 9.83 | **Hard cut** |
| 9.83–12.76 | Bunker |
| 12.76–15.68 | Inside the 16th (the ticket shrinks into the card) |
| 15.68–18.61 | Eat |
| 18.61–21.53 | Fairmont |
| 21.53–24.39 | End card |

All other cuts are 0.4 s dissolves centred on beats.

**QC:**
- **Duration:** 24.39 s, 1080×1920 at 30 fps.
- **Loudness:** −14.1 LUFS, −1.5 dBTP.
- **Banned words:** none (OCR).
- **Stamp:** the pre-spin (0° locked) frame vs the post-spin frame differs by a mean of 0.2/255, so it lands upright.

**Open:**
- **Food clip:** not supplied (a placeholder slate sits in the shot).
- **Suite:** Karl's 9:16 suite clip not supplied; the 04_green_vertical_A_left photo with a push-in stands in.
- **The drinks check** can't be done until the food clip arrives.
- **Claims to confirm with TripNerd:** LOGE suite, hotel included, Fairmont, Feb 2027.

**sha256:** 4d451f8ad687ddb799e6230be13dfd290c06b34a62c668f01eef58ac0fee3976

## v2 (food clip inserted)
- **Food clip:** Karl's `TripNerd_PHX_food_9x16.mp4`, 1080×1920 at 24 fps, 4.04 s; its audio is not used.
- **Why it's retimed:** both cups are fully inside the frame only in its last ~0.3 s. So the shot plays at real speed, then eases to a stop over its last 1.8 s, using 120 fps motion-interpolated frames. Both cups are fully in frame from 17.9 s to the dissolve.
- **Source limit:** the left cup's lime wedge runs off the left edge in every frame of the source.
- **Note:** the clip looks AI-generated (styled golden-hour food), so the Reel needs Instagram's AI label unless TripNerd confirms it is real footage.
- **Measured:** 24.39 s, −14.1 LUFS, −1.5 dBTP.
- **sha256:** 4433c3a8ddce1172a9e651705b570743abd899872b149c008ecf32930525c279
