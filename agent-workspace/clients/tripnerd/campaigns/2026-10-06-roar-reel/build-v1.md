---
title: "TripNerd ROAR Reel — build v1 record (8 s, 9:16): deliverable, QC, provenance"
type: report
client: tripnerd
campaign_id: 2026-10-06-roar-reel
owner: Karl
status: draft
created: 2026-10-06
updated: 2026-10-06
tags: [campaign, reel, build-record, qc, real-footage, kinetic-type]
---

# ROAR v1 — build record

**Status: DRAFT v1 BUILT, owner review pending.** Bible: [`campaign-bible.md`](campaign-bible.md). Scripts: [`build/`](build/).

## Deliverable (FACT)
- **File:** `TripNerd-ROAR-8s-v1.mp4`, 18,365,672 bytes, MD5 `600551b3b1fe39e776737e78ee12af2a`.
- **Specs:** 1080x1920 (9:16), 30 fps, 240 frames, 8.000 s. H.264 (CRF 16, yuv420p, bt709), AAC 192 kbps 48 kHz stereo. Integrated loudness −14.5 LUFS, true peak −0.98 dBTP.
- **Zip (forced download):** `TripNerd-ROAR-8s-v1.zip`, 18,362,804 bytes, MD5 `2774d7bc196e1f02b61e93f9d380a7f0`; the MP4 inside is byte-identical.
- **Links:** see the "Location" section below (filled in when the upload lands).

## Build (as run, 2026-10-06, Higgsfield sandbox)
1. `setup.sh`: V24 original (`2911d9d6…`, 720x1280/24, 31.1 s), the 2026-10-06 upscale (`hf_20261006_203459_da1caa66…`, 1080x1920/30, 31.1 s), the real logo, Anton and Montserrat (OFL). Audio window extracted from the **original** V24 at 11.4–19.4 s (48 kHz stereo).
2. `audio_roar.py`: per-frame crowd level (RMS, fast attack / slow release; 0 at −26 dB, 1 at −12 dB; peak at film 2.47 s) saved for the renderer; a 0.3 s filtered-noise inhale at 1.8 s and a sub impact at 2.1 s added; two-pass `loudnorm` to −14 LUFS / −1 dBTP (pre-mix −13.46 LUFS).
3. `render_roar.py --src src/up.mp4 --t0 11.4`: 240 frames composed in PIL/numpy (word column pre-rendered at 1.25x with a baked shadow; per-frame scale, scroll, pulse, hit shake, 2-frame flash, 4 % punch-in; lockup pill from 6.0 s), piped to x264. Stills mode used for three review sheets before the full render.
4. Mux: video copy + AAC 192k, `+faststart`.

**Iterations on the stills (all before the final render):**
- v-a: a small persistent `@tripnerd` top-left collided with the QUIET column (five letters fill the width) — dropped; the handle lives in the lockup instead.
- v-b: the lockup on a white pill made the wordmark vanish — the logo's wordmark is white (65 % of its opaque pixels are light). Sampling "blue" from the logo gave an icy tint (214,237,252) that was no better.
- v1: the pill uses the approved camera-roll end-card blue (gradient (90,152,234)→(72,132,214); flat (82,142,224) here), white line and handle. Reads cleanly over the crowd.

## QC (FACT, 2026-10-06)
**QC1 harness** `servicepow_qc.py` (md5 `321ef0b7166be6c71236a928c3dee980`, preflight PASS; transferred by heredoc in two halves and byte-verified): `--master --aspect 9:16 --duration 8` → **OVERALL PASS** (resolution, fps, pix_fmt, audio 48k stereo, peak −1.0 dB / mean −17.5 dB, no frozen, no black, motion 10.24 px/frame, hook motion 4.48, no flash cuts: 0 detected cuts, aspect, duration 8.00 s).

**Loudness:** −14.51 LUFS integrated, −0.98 dBTP (ffmpeg loudnorm measurement on the muxed file).

**Speech screen:** faster-whisper `tiny` on the mix returned seven low-confidence segments of "No, no" (average log-prob −0.92, language probability 0.27) spread evenly across a continuous crowd roar: the model's known hallucination on noise, not words. The footage log's earlier screen of V24 found no speech in 12.5–19 s, and the window's only speech (3.8–5.8 s) is outside the cut. **Verdict: no speech.** A larger-model re-run is cheap if anyone doubts it.

**Marks and faces:** frames at 1 fps across 8–20 s and full-resolution frames at 14.5 s and 17.2 s were viewed: no scoreboard, no broadcast graphic, no readable logo or sponsor board; the pavilion across the water carries no readable signage at delivery size. Foreground at 0–1.85 s is the back of a guest's cap; the crowd is a crowd. Covered by the standing library clearance (2026-10-04) and the client brief; the file is still an organic draft, not paid media.

**Contact sheet (3 fps, 24 frames):** viewed; QUIET phase, the hit, the ROAR phases and the lockup all as designed. `TripNerd-ROAR-8s-v1-sheet.jpg`.

**Not run:** Skeptic Pass 3, Critic scorecard (SLIM draft). Required before any paid use.

## Spend (FACT)
- Higgsfield `upscale_video`, bytedance 1080p/30 preset ugc, on the full 31 s V24: one job, **0.62 credits** (transaction "Bytedance Video Upscale", 2026-10-06 20:34:59 UTC). The tool does not price upscales before running.
- Generation: none.

## Location (permanent, Higgsfield storage; public to anyone with the URL)
- Stream (mp4): `https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/a99eece2-a8f5-484b-851a-1685f0f4c9b5.mp4`
- Download (zip, forces a save): `https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/705b1fa5-23c0-4fc8-a85d-ab7b92b6bd32.zip`
- Contact sheet (3 fps): `https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/ba1b5085-798e-422d-9056-973a7c17972c.jpg`
- Uploads returned HTTP 200 and were confirmed (media `a99eece2…` video, `705b1fa5…` file, `ba1b5085…` image). **Verified 2026-10-06:** all three links answer 200 with the right byte counts, and a fresh download of the mp4 and the zip matched the MD5s above. Re-verify before relying on them later.

## What the owner should watch for (ESTIMATE, my own read)
- The QUIET opening is 1.85 s of a cap and a window frame before the green clears. It is honest POV ("from the suite") and sets up the turn, but it is the least pretty 1.85 s of the piece. If retention data says the open loses people, the fix is a tighter 1.2 s hold.
- The column at 1.0 scale is dense; on a small phone the crowd behind it is partly covered during the roar. That is the format. If it feels heavy, drop ROWS to 7 and PITCH to 330.
- Loop seam: the cut from the roar frame back to the quiet suite frame is a hard cut by design (the reel restarts); it reads as intended on loop.
