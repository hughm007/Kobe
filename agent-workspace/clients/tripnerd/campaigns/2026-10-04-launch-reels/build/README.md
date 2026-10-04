---
title: "Build scripts — Augusta, by the clock (v4)"
type: brief
client: tripnerd
owner: Karl
status: active
created: 2026-10-04
updated: 2026-10-04
tags: [client, instagram, reel, build, music]
---

# Build scripts: "Augusta, by the clock" (v5 current, v4 kept)

These scripts rebuild the masters exactly.
- **v5 (current):** `render_v5.py` + `music_v5.py` + `marks.py`, using photos IMG_1901, 1995, 2004 and 2030 (pines only). Master: −14.1 LUFS, −2.1 dBTP, 7.833 s. Audio master: `volume=1.95dB` then the same limiter.
- **v4:** `render_v4.py` + `music.py` + `marks_v4.py`.

The media itself is not committed (photos have guest faces; video is large).

| Script | What it does |
|---|---|
| `marks.py` | Removes the non-TripNerd marks from the five photos, with conventional retouching only (clone, heal, blur; no AI). Coordinates are in source-photo pixels. |
| `music.py` | Synthesises the original music bed (seed 7, so the output is the same every run). No samples, no voices. ServicePOW owns it. |
| `render_v4.py` | Renders the silent 1080×1920 30 fps master: pans, the racing clock, and text in Inter. |

## Rebuild
Working folder layout (the scripts use relative paths):
```
work/
  fonts/inter_1.ttf (Inter SemiBold), fonts/inter_2.ttf (Inter ExtraBold)   # Google Fonts
  tn_assets/IMG_1901.JPG, IMG_1933.JPG, IMG_1995.JPG, IMG_1998.JPG, IMG_2004.JPG   # Drive folder 0AJj-fhf07xDjUk9PVA
  reel03/marks.py, reel03/music.py, reel03/render_v4.py
```
From `work/`, with Python 3, Pillow (with raqm) and numpy installed, plus ffmpeg:
```
python3 reel03/render_v4.py reel03/v4-silent.mp4
python3 reel03/music.py reel03/music_bed_raw.wav
ffmpeg -i reel03/music_bed_raw.wav -af "volume=2.1dB,alimiter=limit=0.79:attack=1:release=60:level=disabled" reel03/music_bed_master.wav
ffmpeg -i reel03/v4-silent.mp4 -i reel03/music_bed_master.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -ar 48000 -ac 2 -shortest -movflags +faststart TN-R03-augusta-by-the-clock-H3-v4.mp4
```
Expected: 11.733 s, −13.9 LUFS integrated, true peak −2.0 dBTP. QC receipts are in [`../qc/`](../qc/).
