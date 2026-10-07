---
title: "TripNerd 'Augusta, handled' 15 s — production log"
type: report
client: tripnerd
campaign_id: 2026-10-07-augusta-handled
owner: Karl
status: draft
created: 2026-10-07
updated: 2026-10-07
tags: [production-log, spend, deliverables, higgsfield, augusta]
---

# Production log

## Deliverables (Higgsfield private storage; each verified byte-for-byte after upload)
| File | Link | MD5 | State |
|---|---|---|---|
| **Draft A2** (real hook, golfer cropped) — current | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/97637010-4025-4fc3-a680-18128c639ef7.mp4 | `4f71f1d70e0473671f857dac5726593e` | for owner review |
| Draft B1 (owner's clip A as hook) — **held** | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/2286c4e1-91ae-458c-8ae3-f3c821107fd5.mp4 | `67598ccdf93d87b0546c5d33bd552978` | for owner review; not postable (see Bible) |
| Draft A1 — superseded | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/c36828cd-e322-4673-bf66-27db0f5ec495.mp4 | `6138ec2717a70554ae1c26ab051ba05c` | superseded by A2: a golfer on West Lake's fairway was visible at the right edge in the first ~0.5 s, under the Augusta line |

All three: 15.000 s, 1080×1920, 30 fps, yuv420p, H.264 CRF 16, silent AAC 48 kHz stereo track. Build script MD5 (A2 and B1 differ only in the variant-A hook crop): [`build/assemble.py`](build/assemble.py) `7982d6ab…` for A2.

## Spend (Higgsfield transactions, FACT)
| UTC | Item | Credits |
|---|---|---|
| 00:37:50 | Bytedance image upscale (house photo, `92511aad`) | −2 |
| 00:37:51 | Bytedance image upscale (veranda photo, `68e1a1b4`) | −2 |
| 00:57:38 | Seedance 2.5, house, 4 s 1080p (`ddb843fe`) | −48 |
| 00:57:42 | Seedance 2.5, veranda take 1, 5 s (`f2cd4537`, rejected) | −60 |
| 01:04:36 | Seedance 2.5, veranda retake, 5 s (`f2a20ca1`) | −60 |
| | **Total this build** | **−172** (cap 400; estimate was ≤ 220) |

Every job was cost-preflighted (`get_cost`: 2 / 48 / 60). Two earlier Seedance submissions were rejected by validation before any charge (start image requires `mode: omni_reference`). **Ledger note (FACT):** the same window shows other spends that are not this build's (Seedance 2.5 −60 at 00:41, −96 at 00:52; Kling v3.0 −25 at 00:52; Nano Banana 2.1 −3 at 00:50) — the owner's other session. Balance after this build: 8,622.05.

## Timeline
- 00:18–00:36 — sources pulled into the Higgsfield sandbox from Drive (link-shared `masters-week/`), contact sheets, marks/faces/TV inspection; TripNerd's live Augusta page read (claims + non-affiliation wording); TripNerd's published house and veranda photos found and imported.
- 00:37–01:05 — upscales, 9:16 crops, Seedance takes, take review (one rejection, one retake).
- 01:05–01:19 — layers, pipeline test render, scrims and lockup offset, final renders A1/B1, uploads, QA1.
- 01:21–01:27 — frame review caught the golfer in A1's first frames; A2 rendered with a 1.22× left-anchored punch-in; verified frame by frame.

## Observations (production intelligence — candidates, not doctrine)
1. **Seedance 2.5 + start image:** `generate_video` requires `mode: "omni_reference"`; the server maps `start_image` to `reference_images`, so the first frame is not locked. Both kept takes still reproduced the source photo closely in frame 0 — check frame 0 and the last frame against the source every time.
2. **"Lateral dolly past columns" invents foreground architecture** (a dark pillar wiped the frame). "Gentle drift + push-in; nothing enters the frame; nothing passes in front of the camera" fixed it on the next take.
3. **Drive → sandbox:** `https://drive.usercontent.google.com/download?id=<id>&export=download&confirm=t` works from the Higgsfield sandbox for link-shared folders (sizes matched Drive).
4. **This container cannot reach Higgsfield's CDN** (proxy 403), so deliverables are shared as Higgsfield links, not attached files.
5. **Frame review beats contact sheets at thumbnail size:** the golfer in A1 was invisible on the 2 fps 225 px grid and obvious on a full-width crop of the first second.
