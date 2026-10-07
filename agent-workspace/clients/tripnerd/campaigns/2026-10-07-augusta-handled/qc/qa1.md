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
