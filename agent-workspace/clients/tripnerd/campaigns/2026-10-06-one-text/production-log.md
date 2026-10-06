---
title: "TripNerd — One Text — production log"
type: report
client: tripnerd
owner: Karl
status: active
created: 2026-10-06
updated: 2026-10-06
tags: [production-log, reel, one-text]
---

# Production log

## Where things are
| Item | Location |
|---|---|
| Campaign Bible | [campaign-bible.md](campaign-bible.md) |
| Shot list (as built) | [shotlist.md](shotlist.md) |
| **Master v1** (15.0 s, 1080×1920, 24 fps, H.264 + AAC 48 kHz) | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/1ceaddff-63bf-42de-8516-67d19150575b.mp4 — sha256 `40d527cd303a14205b1c815fb45f3768e492203e9ed9d1ea66d9d2836dae30e1` |
| Contact sheet v1 (1 frame/s) | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/109d87a8-c68c-4392-a91d-e3cc83b5a80e.jpg |
| Build scripts | [build/](build/) — `overlays.js` (composited text + text-band check), `blur_screen.py` (tracked phone-screen blur), `assemble.sh` (EDL, SFX bed, uniform-timebase concat) |
| QC output | [qc/](qc/) |

Binaries are not committed (they live in Higgsfield storage); they rebuild from `build/` plus
the Higgsfield job IDs in the shot list.

## Rebuild (Higgsfield sandbox)
```
# clips: download the four Kling results named in shotlist.md as s1raw.mp4 s2.mp4 s3.mp4 s4.mp4
python3 blur_screen.py s1raw.mp4 s1.mp4 3.0
NODE_PATH=/usr/local/lib/node_modules node overlays.js . logo.png      # real white wordmark, sha256 11bfe474…6f00b40
bash assemble.sh tripnerd-one-text-v1-master.mp4
python3 servicepow_qc.py tripnerd-one-text-v1-master.mp4 --master --aspect 9:16 --duration 15 --endcard 3.3
```

## Spend (credits, live prices queried 2026-10-06)
| Item | Model | Credits |
|---|---|---|
| Terrace keyframe ×2 (picked 1) | GPT Image 2.5 | 0.50 |
| Shot 2 test clip (5 s) | Kling 3.0 pro, silent | 8.75 |
| Shots 1 and 3 (5 s each) | Kling 3.0 pro, silent | 17.50 |
| Shot 4 (8 s) | Kling 3.0 pro, silent | 14.00 |
| **Total** | | **40.75** (balance 10,763.66 → 10,722.91; estimate ≈71; cap 200) |
No rejected generations; no retries.

## Entries
### 2026-10-06
- Owner ordered the build of concept #2 "One Text". Bible opened (FULL depth, owner-directed
  first artifact). Storyboard revised against the realism floor and the live-ad rotation (see
  shotlist "Rejected").
- One test clip first (shot 2): accepted on inspection. Then shots 1, 3, 4. QA2 by eye on
  contact sheets and full-resolution stills: shot 3 trimmed to end before a model-painted EXIT
  sign; shot 1's phone screen (fake chat text + AI-drawn logo) blurred frame by frame with a
  brightness tracker — checked on six frames across the window, unreadable throughout.
- Overlays rendered with real type; text-band check 6/6 inside y 288–1344, x ≤ 940.
- Master assembled and uploaded (HTTP 200, media confirmed).
- QA1 (canonical `servicepow_qc.py`, sandbox copy sha256-matched `cd48e662…`): preflight PASS;
  master OVERALL PASS (12/12 rows). Raw Kling clips are 1076×1924 (4 px under the 1080 floor) →
  conformed to 1080×1920 exactly as used in the edit; all four conformed clips PASS (shot 4 on
  the declared calm floor). ASR on master audio: 0 speech segments. Output in
  [qc/2026-10-06-qa1.txt](qc/2026-10-06-qa1.txt).
- Owner asked mid-build to use real TripNerd footage where it looks best. Drive media archive is
  owner-only (not link-shared), so the Higgsfield sandbox cannot download it. Real-footage mix
  parked on one owner action (see Bible §16).
