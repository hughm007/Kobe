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

## v3 (B3 `5d3b4f7e…`, A3 `d65b9adb…`) — current
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
