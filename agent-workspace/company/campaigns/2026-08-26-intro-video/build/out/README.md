---
title: "Service Pow intro video — render outputs (pointer)"
type: report
client: internal
owner: Karl
status: active
created: 2026-08-28
updated: 2026-08-28
tags: [company, video, intro-video, build]
---

# Render outputs

`*.mp4` is excluded by `agent-workspace/.gitignore` — this is a git repo, not a DAM
(CLAUDE.md §6). The video is not stored here because **it does not need to be**: the render is
deterministic, so the file is reproducible byte-for-byte from `scenes.html` at any time.

## What was rendered — 2026-08-28

| | |
|---|---|
| File | `servicepow-intro-60s-v1-provisional-endcard.mp4` |
| ffprobe | 1920×1080 · yuv420p · 30/1 fps · **1800 frames** · **60.000000 s** · 1,434,476 bytes |
| Audio | **none — this is a silent picture cut.** The VO in `script.md` §2 is written and timed to the frame but has not been recorded |
| Endcard | **provisional, type-only.** No logo file exists (`assets/` holds a README). The filename must keep `-provisional-endcard` until one does |
| Delivered to | Owner, in session, for critique. **Not published anywhere** |

## Reproduce it

```
cd build
python3 render.py --all --out full          # ~145s, 1800 PNGs into frames/full/
./render.sh full 0 servicepow-intro-60s-v1-provisional-endcard
```

`render.sh` prints its own ffprobe evidence. `frames/` is gitignored for the same reason.

## Contact sheets (these ARE committed — they are small and they are the record)

- `contact-beats-1-5.png` — HOOK · WHO · PACKS sketch · THE SNAP · REAL+AI · open board
- `contact-beats-6-9.png` — SAFE · BUILD · START · END

## Not yet built

The 20s social cutdown (`script.md` §6) is spec-only and stays that way until the 60s is signed.
It is a **re-render at new timings**, not a crop — burned text at 20s pace needs its own cps pass.
