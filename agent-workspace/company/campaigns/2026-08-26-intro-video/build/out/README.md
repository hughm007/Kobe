---
title: "Service Pow intro video — render outputs (pointer)"
type: report
client: internal
owner: Karl
status: active
created: 2026-08-28
updated: 2026-08-31
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

## Delivery encodes — 2026-08-31 (`out/delivery/`)

| File | Size | Target | Verdict |
|---|---|---|---|
| `hero-h264.mp4` (crf23, faststart, no audio) | **2.76 MB** | ≤5 MB | ✅ |
| `hero-vp9.webm` (crf36) | 3.23 MB | ≤4 MB | ✅ |
| `poster.png` / `poster.webp` (frame 0) | 63 KB / 16 KB | — | ✅ |

**Boil survival at delivery bitrate — verified by eye, not by the number.** The 200% crop compare
(`crop-src-f750.png` vs `crop-h264-f750.png`, committed) shows clean marker edges with no mosquito
noise and no vector-smoothing at crf23. The crop PSNR of 21.97 dB is confounded: the extraction
landed on a neighboring 10 Hz boil state, so the metric measured the boil's own stroke jitter, not
codec damage — the same instrument lesson as gate-record §2f, third instance of "check the
instrument before trusting the number."

Embed contract for the site build: `../site-handoff/hero-embed.html` (WCAG 2.2.2 pause + 1.2.1
text alternative + reduced-motion + play() fallback + letterbox rule + the check-19 ship list).

## Round 4 — the enriched master, 2026-08-31

| | |
|---|---|
| File | `servicepow-intro-60s-rev3b.mp4` |
| ffprobe | 1920x1080 · yuv420p · 30/1 fps · **1800 frames** · **60.000000 s** · 5,046,402 bytes |
| Changed vs `-rev3` | exactly three runs, everything else byte-identical: **28.0-30.0s** (B4 `streetWorld`), **38.7-45.3s** (`SV3` continuity fix), **49.3-52.7s** (B7 `streetWorld`) |
| Audio | **still none.** ElevenLabs is 403 at the egress gateway and there is no local TTS — see `../voiceover-script.md` §5 |
| Generated assets | **zero.** 14 plates were made and refused; see `../gate-record.md` round 4 |
| Gate status | **not re-gated.** Round-3 verdicts do not transfer to this master |

Delivery encodes re-cut from it: `hero-h264.mp4` 3.18 MB (crf23, ≤5 MB ✅) ·
`hero-vp9.webm` 3.59 MB (crf36, <=4 MB target) ·
posters unchanged (frame 0 is byte-identical).

Loop handoff re-measured, unchanged: **PSNR(1799 -> 0) = 24.013 dB**, frames 0 and 1799
byte-identical to the previous master.

Frozen with hashes at `gates/round4-enriched/` (gitignored locally; SHA256SUMS is the record).

```
python3 render.py --cut rev3 --all --out rev3b
./render.sh rev3b 0 servicepow-intro-60s-rev3b
python3 visual-density.py frames/rev3 frames/rev3b     # the before/after delta
```

## Round 5 — the hook, 2026-08-31 (current master)

| | |
|---|---|
| File | `servicepow-intro-60s-rev3c.mp4` |
| ffprobe | 1920x1080 · yuv420p · 30/1 fps · **1800 frames** · **60.000000 s** · 5,208,487 bytes |
| Changed vs `-rev3b` | **B1 only** (sketch timing). Every other beat byte-identical |
| Loop seam | **PSNR(1799 -> 0) = 24.013 dB**, frames 0 and 1799 byte-identical across rounds 4 and 5 |
| Delivery | `hero-h264.mp4` 3.14 MB (<=5 ✅) · `hero-vp9.webm` 3.74 MB (<=4 ✅) · posters unchanged |
| Frozen | `gates/round5-hook/` — master `4276ead2…`, scenes.html `4fa55a76…`, frames-manifest `8a484338…` |
| Gate status | **NOT re-gated.** Round-3 verdicts do not transfer |

```
python3 render.py --cut rev3 --all --out rev3c
./render.sh rev3c 0 servicepow-intro-60s-rev3c
python3 visual-density.py frames/rev3b frames/rev3c
```

## Round 6 — gate fixes, 2026-08-31 (CURRENT MASTER)

| | |
|---|---|
| File | `servicepow-intro-60s-rev3d.mp4` |
| ffprobe | 1920x1080 · yuv420p · 30/1 fps · **1800 frames** · **60.000000 s** · 5,062,642 bytes |
| Fixes vs `-rev3c` | the three blockers the dual gate upheld: B7 street leaking outside its frame, the 0.3s near-blank at 23.1s, B6 annotations orphaned after their labels |
| Loop seam | PSNR(1799 -> 0) = **24.013 dB**, unchanged since Rev 3 |
| Delivery | `hero-h264.mp4` **3.00 MB** (<=5 ✅) · `hero-vp9.webm` **3.61 MB** (<=4 ✅) |
| Frozen | `gates/round6-gatefix/` — master `98f65579…`, scenes.html `cbc92c71…`, frames-manifest `297579fa…` |
| Gate status | **BLOCK was issued against `-rev3c`. `-rev3d` fixes all three upheld blockers but has NOT itself been gated.** |

Measured against the originally delivered Rev 3: B4 chroma 8.85 -> 10.24, B7 8.10 -> 8.69,
B1 coverage 5.38% -> 6.16%, film-wide chroma 7.68 -> 8.01. B7 coverage reads 15.44 -> 15.20
**because the leaked silhouette pixels outside the frame are now correctly clipped away.**

```
python3 render.py --cut rev3 --all --out rev3d
./render.sh rev3d 0 servicepow-intro-60s-rev3d
python3 visual-density.py frames/rev3 frames/rev3d
```

