---
title: "Augusta, handled — QA1 machine results"
type: report
client: tripnerd
campaign_id: 2026-10-07-augusta-handled
owner: Karl
status: draft
created: 2026-10-07
updated: 2026-10-07
tags: [qa1, machine-qc]
---

# QA1 — machine harness

## A6 (`d02414b97d91636fa2c7fdaf10f94169`) — current, the posting master
Harness `servicepow_qc.py` (MD5 `321ef0b7…`), `--master --aspect 9:16 --duration 20 --endcard 2.49`: **OVERALL PASS**.
1080×1920 · 30.000 fps · yuv420p · 48 kHz / 2 ch · peak −1.2 dB, mean −17.0 dB · no frozen or black sections · motion 10.53 px/frame · 1 detected cut, no shot under 0.4 s · duration 20.00 s.

- **Encode (ffprobe):** H.264 High, level 4.2, 17.3 Mb/s video; BT.709 primaries, transfer and matrix tagged; AAC-LC 320 kb/s 48 kHz stereo; faststart; 44.0 MB. A5 for comparison: 11.7 Mb/s.
- **Loudness (ebur128 on the encoded file):** −14.2 LUFS integrated, true peak −1.2 dBFS, LRA 8.5 LU. BC-05 PASS; the −1 dBTP production target is met.
- **BC-27 (ASR on the master, faster-whisper base.en):** "With TripNerd, enjoy course access, private executive accommodations, daily hospitality, and concierge support." 0.0–12.8 s · "Bring your people, enjoy the moment." 12.8–15.3 s · "Let TripNerd handle the details, all done with TripNerd." 15.3–19.1 s. Matches the declared lines. The mix is identical to A5's (same script, inputs and printed timings).
- **Upscale review (frames viewed at 1:1 on the 1080-wide master):**
  - ByteDance 2k "ugc": faces true, hard edges sharper, but the foliage turns into a painted, posterised texture (worst on the hook's tree line against the sunset). **Rejected.**
  - Topaz 2160p: natural trees, sharper furniture, fence and people than A5. The musician and the close guest keep their real features, with nothing invented. **Used.** See [`A6-upscaler-compare-hook.jpg`](A6-upscaler-compare-hook.jpg) (A5 Lanczos | ByteDance | Topaz) and [`A6-hook-A5-vs-A6.jpg`](A6-hook-A5-vs-A6.jpg).
- **Framing:** the hook keeps A5's left-anchored 1.22× punch-in (one resample from the upscale). The West Lake golfer stays out of frame.
- **Frames viewed:** [`A6-frames.jpg`](A6-frames.jpg) (1.5, 4.0, 8.0, 12.6, 14.2, 16.0, 17.0, 18.8 s; tiled in name order). Supers, panel, end shot and card match A5.
- **Upload:** PUT 200; re-downloaded MD5 equals the render.

## A5 (`b3b109ec64adf73b8f77040c07cd84c5`) — superseded by A6
Harness OVERALL PASS (20.00 s), −14.2 LUFS, true peak −1.2 dBFS. ASR on the master found every line in order: the list 4.8–11.9 s · "Bring your people, enjoy the moment" 12.7–14.4 s · "Let TripNerd handle the details" 15.2–16.8 s · "All done with TripNerd" 17.7–19.0 s (no caption, as asked).

## A4 (`7c406481dbf56a63f188fca12565e583`) — superseded by A5/A6
Harness `servicepow_qc.py` (MD5 `321ef0b7…`, written into a reset sandbox as source and hash-verified), `--master --aspect 9:16 --duration 18.12 --endcard 2.5`:
**OVERALL PASS.**

| Row | Result |
|---|---|
| resolution | 1080×1920 |
| fps | 30.000 |
| pix_fmt | yuv420p |
| audio | 48 kHz / 2 ch |
| peak / mean | −1.0 dB peak, −16.1 dB mean |
| frozen sections | none |
| black sections | none |
| motion | 11.93 px/frame |
| hook motion | 9.96 (in `qc/harness.txt` of the first render; same picture) |
| flash cuts | 1 detected cut, no shot under 0.4 s |
| aspect | PASS |
| duration | 18.13 s against 18.12 declared |

- **Loudness (ffmpeg ebur128 on the encoded file):** −14.0 LUFS integrated, true peak −0.9 dBFS, LRA 7.5 LU. The WAV mix measured −14.21 LUFS / −1.20 dBTP; AAC adds about 0.3 dB. BC-05 (integrated loudness within the declared −14 target) PASS. Our own −1 dBTP production target is missed by 0.1 dB on the encoded file, recorded as is.
- **BC-26 (bed speech-free):** faster-whisper base.en, VAD off, on `out/music4.wav` (the Mixkit bed as mixed). One segment, the token "MUSIC" (no_speech 0.20, logprob −1.18); no confident speech. PASS.
- **BC-27 (speech matches the declared line):** the edited voice reads "With trip nerd, enjoy course access, private executive accommodations, daily hospitality, and concierge support." It matches the owner's line; the ASR spells the brand phonetically. PASS.
- **Sync:**
  - the voice runs 5.50–10.85 s and the panel holds to 10.85 s;
  - the ticks land on the spoken words (6.38 / 7.38 / 8.86 / 9.96 s);
  - the music's drop lands on the cut into the end shot: mix RMS −20 dB at 12.9 s, then −8 dB at 13.0 s.
- **Centring (from `endclip.json`):** the 9:16 window holds the flagstick at 0.50 of frame width from the moment the flag is in view. It eases from 1.0× to 1.4× and the cup ends at 75 % of frame height. At the cut (source 2.62 s) the ball sits beside the cup.
- **Flag emblem (BC-21 / trade dress):** the cleaned 4k source `A4k_clean3` (`eb69e0bf…`) was checked on all 59 frames where the flag is in view, at native resolution (sheets `fl_f3_*`). No emblem is visible. Frames 24–27 keep a few-pixel dark dash at a fold crease, which does not read as a mark.
- **Frames viewed:**
  - [`A4-frames.jpg`](A4-frames.jpg): 1.0, 4.0, 7.7, 10.0, 11.8, 14.2, 15.4, 17.7 s;
  - [`A4-endshot-frames.jpg`](A4-endshot-frames.jpg): 13.1–15.9 s;
  - [`A4-card-frames.jpg`](A4-card-frames.jpg): 15.7–18.0 s;
  - the 2 fps contact sheet.
- **BC-28 (safe area):** all burned text sits between 18 % and 65 % of frame height (supers at 24–36 %, the checklist panel 18–55 %, the card's text 36–65 %).
- **Not run:** BC-15 OCR (no tesseract in the sandbox; supers verified by eye in the frame strips).

## Correction to v3 (recorded 2026-10-07, A4 build)
The v3 line "B3 frames 0.2 / 1.0 / 2.0 / 2.8 s … full-resolution flag crops: plain yellow, no emblem" **was wrong**. Clip A's flag carries a generated, tournament-style outline emblem (a map-and-flag drawing) from about source 1.5 to 1.7 s, and fainter on neighbouring frames. B3's hook uses raw clip A 0.7–3.8 s, so it contains the emblem. The Thread v3 gate had already upheld this as S4 (`origin/claude/brave-mendel-0vxkwj`, the-thread/build-v3.md). The 1080p frame crops at four sample times missed it.

**B3 is withdrawn: do not post.** Any rebuild of B takes its hook from the cleaned 4k clip.

## v3 (B3 `5d3b4f7e…`, A3 `d65b9adb…`) — superseded by A4
Same harness (MD5 `321ef0b7…`, re-staged in a reset sandbox and hash-verified), `--master --aspect 9:16 --duration 15 --endcard 2.0`:
**OVERALL PASS on both.** resolution 1080×1920 · fps 30.000 · yuv420p · audio 48 kHz / 2 ch · peak −1.0 dB, mean −16.9 dB ·
no frozen sections · no black sections · motion 7.44 (B3) / 7.83 (A3) px/frame · hook motion 9.83 / 9.96 · 0 flash cuts ·
aspect and duration (15.00 s) PASS. Loudness (ffmpeg ebur128, B3): −13.7 LUFS integrated, true peak −1.0 dBFS, LRA 8.8 LU.
- **BC-26** (bed speech-free): faster-whisper base.en, VAD off, on the music stem → no words (one punctuation token). PASS.
- **BC-27** (speech matches declared line): transcript of the edited voice = "With Tripp Nerd enjoy course access, private executive
  accommodations, daily hospitality and concierge support." — matches the declared line (ASR spells the brand phonetically). PASS.
- Ticks land on the words (from the transcript timestamps): 6.32 / 7.24 / 8.74 / 9.78 s; the panel holds to 10.85 s; the voice ends 10.83 s.
- B3 frames 0.2 / 1.0 / 2.0 / 2.8 s: no on-screen label. Full-resolution flag crops: plain yellow, no emblem.

## v1/v2 (superseded)

Harness: `servicepow_qc.py` (canonical, MD5 `321ef0b7166be6c71236a928c3dee980`), run in the Higgsfield sandbox:
`python3 servicepow_qc.py <file> --master --aspect 9:16 --duration 15 --endcard 2.2`

| Row | A2 (`4f71f1d7…`) | B1 (`67598ccd…`) |
|---|---|---|
| resolution | PASS 1080×1920 | PASS |
| fps | PASS 30.000 | PASS |
| pix_fmt | PASS yuv420p | PASS |
| audio-48k-stereo | PASS | PASS |
| audio-peak/not-silent | **FAIL** (silent track, −91 dB) | **FAIL** (same) |
| no-frozen-sections | PASS | PASS |
| no-black-sections | PASS | PASS |
| motion-gate | PASS 7.64 px/frame | PASS 7.16 |
| hook-motion | PASS 9.96 | PASS 9.83 |
| no-flash-cuts | PASS (0 shots < 0.4 s) | PASS |
| aspect | PASS | PASS |
| duration | PASS 15.00 s | PASS 15.00 s |
| **OVERALL** | **FAIL — audio only** | **FAIL — audio only** |

**Reading:** every picture row passes. The audio FAIL is the declared silent master (plan approved by Karl:
no AI voice or music; audio chosen at posting). BC-04 passes on format; **BC-05 is OPEN, not passed**, until a
licensed music track or Karl's own recorded VO is mixed in (target −14 LUFS / −1 dBTP), then QA1 re-runs.

Not run: BC-15 `--expect` (OCR is not installed in the sandbox; every super was instead verified by eye in
the frame grid [`A2-frames.jpg`](A2-frames.jpg)); BC-26/27 N/A (no speech, no bed); BC-28 safe area checked by
layout — all burned text sits between 15.9 % (lockup headline at the end of its drift) and 62.7 % (the B label)
of frame height, inside the registry's 15–70 % band.
