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
| **A6 — the posting master for Instagram** (A5 with the two real phone shots upscaled by Topaz Video and one top-quality encode: H.264 High 4.2, 1080×1920, 30 fps, ~17.6 Mb/s, AAC 320 kb/s) | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/d22feed8-c96a-4d1c-b11c-0731f4284b43.mp4 | `d02414b97d91636fa2c7fdaf10f94169` | **the file to post**; same holds as A4/A5 (Meta AI label on; TripNerd's OK on the AI voice, generated gallery, venue look, "Now booking 2027") |
| A6 first render (ByteDance 2k "ugc" upscales) — rejected by frame review | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/048766c4-30f7-4660-b607-ef908b5d335d.mp4 | `03bb1af85e6854bfbdf415cdbb08df76` | do not use: foliage rendered with a painted texture (worst on the hook's tree line) |
| **A5 — 20 s, slower voice, voice on every line** ("Bring your people. Enjoy the moment.", "Let TripNerd handle the details.", "All done with TripNerd!" into the card, no caption) | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/569dd524-c571-4324-b4be-ef71f6020bbb.mp4 | `b3b109ec64adf73b8f77040c07cd84c5` | superseded by A6 (same edit and mix; A6 is the upscaled, higher-bitrate master) |
| **A4 — the advert opening on real footage, with the owner's five notes** (ball-landing end shot centred on the cup, Mixkit "Golden Storm", the hosting-spot host's voice, the camera-roll end card) | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/e2a6d45d-bf9e-44b0-a9bc-03a5725a5a51.mp4 | `7c406481dbf56a63f188fca12565e583` | for owner review; posts only with Meta's AI label on and TripNerd's OK (AI voice, generated gallery, venue look, four lines) |
| A4 pre-limiter render (−0.8 dBTP), superseded by the row above | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/fea4e2d6-48b2-479d-b86e-551f29331162.mp4 | — | superseded (same picture; true peak 0.2 dB hotter) |
| Clip A, 4k, flag emblem and gallery cleaned (`A4k_clean3`, source 0–3.33 s) | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/e45b00b6-b2ff-42d1-b285-5684c3fc85b7.mp4 | `eb69e0bf23c2378d4f274cf8db2826b4` | working source for the end shot |
| A4 build kit (scripts) | media `da49208d-4f50-4b72-91e5-80f41ce478c4` (.tar.gz) | `dc9a3ba5…` | kit as of the first pipeline run; the repo `build/` is current (SAR fix, limiter) |
| **B3** (owner's clip A hook, no on-screen AI label, music + voice) — **NOT POSTABLE: its hook (raw clip A 0.7–3.8 s) carries the generated flag emblem at ~1.5–1.7 s** (see [`qc/qa1.md`](qc/qa1.md) correction) | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/fef11705-f599-4073-b08a-c2b2fed58335.mp4 | `5d3b4f7e7d5593d22b315e6ba27f2c35` | withdrawn: do not post; a rebuild would take its hook from the cleaned clip |
| **A3** (real hook, music + voice) — superseded by A4 at the owner's request; still the version with no generated people on screen | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/847424f8-5a7f-4eb4-9a21-d402b2c44a89.mp4 | `d65b9adbb42800cf02148fc378ebb45d` | for owner review |
| Draft A2 (real hook, golfer cropped) — superseded by A3 | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/97637010-4025-4fc3-a680-18128c639ef7.mp4 | `4f71f1d70e0473671f857dac5726593e` | for owner review |
| Draft B1 (owner's clip A as hook, AI label) — superseded by B3 | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/2286c4e1-91ae-458c-8ae3-f3c821107fd5.mp4 | `67598ccdf93d87b0546c5d33bd552978` | for owner review; not postable (see Bible) |
| Draft A1 — superseded | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/c36828cd-e322-4673-bf66-27db0f5ec495.mp4 | `6138ec2717a70554ae1c26ab051ba05c` | superseded by A2: a golfer on West Lake's fairway was visible at the right edge in the first ~0.5 s, under the Augusta line |

A6: 20.00 s, 1080×1920, 30 fps, yuv420p, H.264 High@4.2 (x264 veryslow, CRF 14, maxrate 30 Mb/s), 17.3 Mb/s video, BT.709 tagged, AAC-LC 320 kb/s 48 kHz stereo, faststart, 44.0 MB; −14.2 LUFS, true peak −1.2 dBFS, LRA 8.5 LU. Built by [`build/assemble6.py`](build/assemble6.py) (run from commit `198c36e`; the later header edit is comment-only) with [`build/mix5.py`](build/mix5.py) `e77e4dbb…`; the end shot and card intermediates at CRF 8 (sed in the run), so the master takes one lossy generation. Sources: V19 2.0–6.0 s and V25 (whole) uploaded as media `0a6a38fe` / `a905e0cb`, upscaled by Topaz Video 2160p (jobs `299ab2b2` → `562eb92d…`, `c70356ed` → `93c2572e…`, 2160×3840, 30 fps).
A5: 20.00 s, same spec as A4 (CRF 16, AAC 192 kb/s), 11.7 Mb/s; voice lines 5.40–12.11 (list, atempo 1.08, pauses >0.20 s cut to 0.15) · 12.40–14.62 · 15.15–17.24 · 17.62–19.13; ticks 6.44/7.68/9.44/10.88; music from 0.21 s so the drop lands on the cut at 14.9 s; −14.24 LUFS / −1.21 dBTP mix. Build: [`build/mix5.py`](build/mix5.py), [`build/assemble5.py`](build/assemble5.py) `d62aa3d6…`.
A4: 18.13 s (declared 18.12), 1080×1920, 30 fps, yuv420p, H.264 CRF 16, AAC 192 kb/s 48 kHz stereo, −14.0 LUFS integrated, true peak −0.9 dBFS on the encoded file (the WAV mix −14.21 LUFS / −1.20 dBTP; AAC adds ~0.3 dB). Timeline: hook 0–3.0 · house 3.0–5.5 · list 5.5–10.95 (voice 5.5–10.85, ticks 6.38/7.38/8.86/9.96) · V25 10.95–13.0 · hard cut on the music's drop to the end shot 13.0–15.62 · hard cut on the beat to the card 15.62–18.12.
A4 build files (repo = the run): [`build/pipeline.sh`](build/pipeline.sh) (order of work), [`build/track.py`](build/track.py) `50c5db1a…`, [`build/flagfix3.py`](build/flagfix3.py) `f25c8e83…`, [`build/gallfix_a4.py`](build/gallfix_a4.py) (the other session's `gallfix.py`, paths only), [`build/flagsheet.py`](build/flagsheet.py), [`build/endclip.py`](build/endclip.py) `caeaaa9a…`, [`build/card.py`](build/card.py) `16688d66…`, [`build/mix4.py`](build/mix4.py) `4bdf7ccc…`, [`build/assemble4.py`](build/assemble4.py) `e450c0ac…`. Stems: mix.wav `609a69c9…`, endclip.mp4 `9989dfea…`, card.mp4 `1e62f57f…`. Voice take used: Seed Audio `505d1f23` (WAV MD5 `8793efd2…`).

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
| 11:56:27 | A4: Bytedance video upscale, clip A to 4k (`a852db04`; the owner's 4k file could not leave this container) | −0.4 |
| 12:13:08 | A4: Seed Audio 1.0 take 1, host-voice reference, speech_rate +10 (`3355bf7c`, 6.0 s — too long, not used) | −0.8 |
| 12:33:30 | A4: Seed Audio 1.0 take 2, host-voice reference, speech_rate +22 (`505d1f23`, used) | −0.8 |
| 13:14:43–13:15:01 | A5: Seed Audio 1.0, four lines in the host voice (list `20458c82` −0.8, bring `91777367` −0.3, handle `155f5d6a` −0.3, done `9e5d6cc0` −0.2) | −1.6 |
| 16:40:22–24 | A6: Bytedance video upscale 2k "ugc", V19 segment and V25 (`66aaa88d`, `2bffad90`; rejected, painted foliage) | −0.31 |
| 16:49:36–38 | A6: Topaz Video 2160p, V19 segment and V25 (`299ab2b2`, `c70356ed`; used) | −10 |
| | **Total this build** | **−187.51** (cap 400) |

A4 note: `create_voice_from_confirmed_audio` was refused before any charge ("Voice limit reached"; the three custom-voice slots hold "WYATT-ENTHUSIASM", "REAL-Wyatt" and "me", none deleted). The Adobe `media_enhance_speech` tasks (`4d275132…`, `cc09e63f…`) cost no Higgsfield credits; their results could not be fetched (no poll tool in this client). The Seedance 2.5 (−60, −60, −54, −48) and Kling spends between 06:33 and 12:33 are the owner's other session, not this build.

Every job was cost-preflighted (`get_cost`: 2 / 48 / 60). Two earlier Seedance submissions were rejected by validation before any charge (start image requires `mode: omni_reference`). **Ledger note (FACT):** the same window shows other spends that are not this build's (Seedance 2.5 −60 at 00:41, −96 at 00:52; Kling v3.0 −25 at 00:52; Nano Banana 2.1 −3 at 00:50) — the owner's other session. Balance after this build: 8,622.05.

## Timeline
- 00:18–00:36 — sources pulled into the Higgsfield sandbox from Drive (link-shared `masters-week/`), contact sheets, marks/faces/TV inspection; TripNerd's live Augusta page read (claims + non-affiliation wording); TripNerd's published house and veranda photos found and imported.
- 00:37–01:05 — upscales, 9:16 crops, Seedance takes, take review (one rejection, one retake).
- 01:05–01:19 — layers, pipeline test render, scrims and lockup offset, final renders A1/B1, uploads, QA1.
- 01:21–01:27 — frame review caught the golfer in A1's first frames; A2 rendered with a 1.22× left-anchored punch-in; verified frame by frame.
- 07:00–07:20 (A4) — niche ads measured for music; Mixkit licence captured; 11 Mixkit tracks measured; host speech cut and separated (Demucs); The thread's records read (the flag emblem finding).
- 11:55–13:02 (A4) — sandbox reset recovery; 4k re-upscale; voice takes 1–2; ball/stick tracking; flag fix v3 and native-4k emblem check; end shot, card, mix; render, QA1, BC-26/27, final upload byte-verified.

## Observations (production intelligence — candidates, not doctrine)
1. **Seedance 2.5 + start image:** `generate_video` requires `mode: "omni_reference"`; the server maps `start_image` to `reference_images`, so the first frame is not locked. Both kept takes still reproduced the source photo closely in frame 0 — check frame 0 and the last frame against the source every time.
2. **"Lateral dolly past columns" invents foreground architecture** (a dark pillar wiped the frame). "Gentle drift + push-in; nothing enters the frame; nothing passes in front of the camera" fixed it on the next take.
3. **Drive → sandbox:** `https://drive.usercontent.google.com/download?id=<id>&export=download&confirm=t` works from the Higgsfield sandbox for link-shared folders (sizes matched Drive).
4. **This container cannot reach Higgsfield's CDN** (proxy 403), so deliverables are shared as Higgsfield links, not attached files.
5. **Frame review beats contact sheets at thumbnail size:** the golfer in A1 was invisible on the 2 fps 225 px grid and obvious on a full-width crop of the first second.
6. **Seed Audio pauses are not silence:** the comma gaps in the Miles take carry breath/room tone (only ~0.1 s drops below −40 dB), so pause-trimming saved nothing; a 4 % `atempo` (pitch kept) fitted the line instead. Plan list beats from the measured read, not the word count.
7. **Whisper spells the brand "Trip nerd" / "Tripp Nerd"** — normalise brand names before the BC-27 compare.
8. **Cloning a voice with no free voice slot:** Seed Audio takes `medias:[{role:"audio_references", value:<confirmed audio media>}]` and reads the prompt in that voice per request, so no saved voice is needed. Measured on take 2: median F0 95 Hz against the host stem's 107 Hz; take 1 99 Hz. Karl's ear is the final check.
9. **Speech isolation without Adobe:** `media_enhance_speech` started but this client exposes no poll tool for it. Demucs htdemucs (CPU torch, about 1 min to install) separated the host from the spot's music bed cleanly (vocal-stem floor −62 dB against the mix's −33 dB).
10. **The committed flag fix was not enough on this upscale:** `flagfix2.py` (local contrast) left recognisable half-erased emblem outlines on frames 8–11, 15–18, 26–31 and 38–43 at native 4k. `flagfix3.py` fills the emblem's holes in the yellow-component mask, inpaints strokes darker than the local flag luminance (Telea), median-smooths the interior (25 px) and feathers it. Checked on all 59 flag frames at native resolution: no emblem; f24–f27 keep a few-pixel dark dash at a fold crease.
11. **Higgsfield sandbox persistence:** the sandbox is discarded about 10 s after the last call unless a `background:true` job holds its 15-minute lease. `nohup` from a foreground call does not hold it. Three resets this round lost two clean-ups and the staging. What worked: one background pipeline (`build/pipeline.sh`) that stages, builds and PUTs each durable result to Higgsfield storage as soon as it exists. Also: `sandbox_exec` now refuses large base64 payloads; write scripts as plain heredocs and verify their MD5 against the repo.
12. **ffmpeg concat after a punch-in:** a `scale` to a non-uniform size leaves SAR 21087:21088 and `concat` refuses it; `setsar=1` before the concat. Guard every PUT on file size: one failed render uploaded an empty file to a slot (`d2bba6be`, never confirmed).
13. **The ball never drops in clip A:** measured closest approach 145 px (4k) from the cup at source 2.33–2.42 s; it then rolls about 700 px left and stops. The end shot leaves at source 2.62 s, while the ball is still beside the cup.
14. **Upscaling low-res phone footage (404×720) for a 1080×1920 master:** ByteDance video upscale ("ugc", 2k, 0.15 credits per 4 s) sharpened hard edges and kept faces true, but turned foliage into a painted, posterised texture, visible at phone scale on the hook's tree line against the sky. Topaz Video (2160p, 5 credits per clip) kept trees natural and faces true, and was sharper than Lanczos. A 50/50 blend of ByteDance and Lanczos reduced the texture but did not remove it. Check foliage at 1:1 against the sky, not only faces.
15. **A5's voice spend was 1.6 credits, not 3.2:** Seed Audio bills by length (0.2–0.8 per line). The 3.2 quoted to the owner at A5 assumed 0.8 per take; the ledger is the source.
16. **The repository is public** (GitHub reports `visibility: public`): client documents, Drive IDs of link-shared folders and media links are readable by anyone. Raised with the owner; no frames with close faces were added to the repo in A6.
