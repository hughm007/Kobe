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
| **B3 — the advert** (owner's clip A hook, no on-screen AI label, music + voice) | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/fef11705-f599-4073-b08a-c2b2fed58335.mp4 | `5d3b4f7e7d5593d22b315e6ba27f2c35` | for owner review; posts only with Meta's AI label on, TripNerd's OK on the AI voice and the four lines |
| **A3** (real hook, music + voice) — safe alternative | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/847424f8-5a7f-4eb4-9a21-d402b2c44a89.mp4 | `d65b9adbb42800cf02148fc378ebb45d` | for owner review |
| Draft A2 (real hook, golfer cropped) — superseded by A3 | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/97637010-4025-4fc3-a680-18128c639ef7.mp4 | `4f71f1d70e0473671f857dac5726593e` | for owner review |
| Draft B1 (owner's clip A as hook, AI label) — superseded by B3 | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/2286c4e1-91ae-458c-8ae3-f3c821107fd5.mp4 | `67598ccdf93d87b0546c5d33bd552978` | for owner review; not postable (see Bible) |
| Draft A1 — superseded | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/c36828cd-e322-4673-bf66-27db0f5ec495.mp4 | `6138ec2717a70554ae1c26ab051ba05c` | superseded by A2: a golfer on West Lake's fairway was visible at the right edge in the first ~0.5 s, under the Augusta line |

v3 (B3, A3): 15.000 s, 1080×1920, 30 fps, yuv420p, H.264 CRF 16, AAC 192 kb/s 48 kHz stereo, −13.7 LUFS integrated / −1.0 dBTP (ebur128 on the encoded file; the WAV mix measured −14.16 LUFS). Earlier drafts: silent AAC track.
v3 build files: [`build/music.py`](build/music.py) (MD5 `4349c5da…`), [`build/mix.py`](build/mix.py) (`1c99d499…`), [`build/assemble.py`](build/assemble.py) (`05949a97…`). Stems: music.wav `d6f89124…`, mix.wav `a7b342a7…`, vo_edit.wav `d3a2e2a6…`.
Earlier drafts: Build script MD5 (A2 and B1 differ only in the variant-A hook crop): [`build/assemble.py`](build/assemble.py) `7982d6ab…` for A2.

## Spend (Higgsfield transactions, FACT)
| UTC | Item | Credits |
|---|---|---|
| 00:37:50 | Bytedance image upscale (house photo, `92511aad`) | −2 |
| 00:37:51 | Bytedance image upscale (veranda photo, `68e1a1b4`) | −2 |
| 00:57:38 | Seedance 2.5, house, 4 s 1080p (`ddb843fe`) | −48 |
| 00:57:42 | Seedance 2.5, veranda take 1, 5 s (`f2cd4537`, rejected) | −60 |
| 01:04:36 | Seedance 2.5, veranda retake, 5 s (`f2a20ca1`) | −60 |
| 05:24:06 | Seed Audio 1.0 voice take 1, Miles, default speed (`68729dd1`, 7.2 s — too long, not used) | −0.8 |
| 05:24:11 | Seed Audio 1.0 voice take 2, Miles, speech_rate +10 (`d6217608`, used; atempo 1.04 in the mix) | −0.8 |
| | **Total this build** | **−173.6** (cap 400) |

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
6. **Seed Audio pauses are not silence:** the comma gaps in the Miles take carry breath/room tone (only ~0.1 s drops below −40 dB), so pause-trimming saved nothing; a 4 % `atempo` (pitch kept) fitted the line instead. Plan list beats from the measured read, not the word count.
7. **Whisper spells the brand "Trip nerd" / "Tripp Nerd"** — normalise brand names before the BC-27 compare.
