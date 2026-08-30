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

## Also rendered — 2026-08-30, the benefit-led challenger

| File | ffprobe |
|---|---|
| `servicepow-intro-60s-challenger-v1.mp4` | 1920×1080 · yuv420p · 30fps · 1800 frames · **60.000000 s** · 1,107,843 bytes |
| `compare-control-vs-challenger.mp4` | 1920×552 · 30fps · 1800 frames · 60.000000 s — the two cuts side by side |

**Loop handoff, measured** (`./loopcheck.sh full challenger`) — `video-production.md` step 4b says a
hard cut back to frame 1 reads broken on an autoplay hero:

| Cut | PSNR(frame 1799 → frame 0) |
|---|---|
| control | **19.51 dB** — a hard cut |
| challenger | **inf** — the frames are pixel-identical. Seamless |

Both are silent picture cuts. Per step 4b that is the correct target for an autoplay-muted hero;
audio is a bonus layer, not a blocker.

## Reproduce it

```
cd build
python3 render.py --all --out full                        # control,    ~145s
python3 render.py --cut challenger --all --out challenger  # challenger, ~180s
./render.sh full 0 servicepow-intro-60s-v1-provisional-endcard
./render.sh challenger 0 servicepow-intro-60s-challenger-v1
./loopcheck.sh full challenger      # prints the loop-handoff PSNR for both
./compare.sh                        # side-by-side MP4
```

`render.sh` prints its own ffprobe evidence. `frames/` is gitignored for the same reason.

## Contact sheets (these ARE committed — they are small and they are the record)

- `contact-beats-1-5.png` — HOOK · WHO · PACKS sketch · THE SNAP · REAL+AI · open board
- `contact-beats-6-9.png` — SAFE · BUILD · START · END

## Not yet built

The 20s social cutdown (`script.md` §6) is spec-only and stays that way until the 60s is signed.
It is a **re-render at new timings**, not a crop — burned text at 20s pace needs its own cps pass.
