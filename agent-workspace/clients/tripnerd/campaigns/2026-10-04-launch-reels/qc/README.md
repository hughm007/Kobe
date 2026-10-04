# QC receipts: launch Reels

- `2026-10-04-v2-master-qc-receipt.txt`: `servicepow_qc.py --master` on Augusta v2, including the sha256. All checks PASS except audio (no track in the file).
- `2026-10-04-v3-per-shot-gate-ledger.jsonl`: the per-shot `--gate-clips` md5 ledger for Augusta v3.
  - Shots s0–s2 and s4–s6 PASS.
  - The card (s3) went FAIL → FAIL → INDETERMINATE (0.69 against the 0.6 calm floor). It needs human eyes at the BC-25 watch.
  - The harness writes this ledger next to its own script. It was moved here so the installed skill folder stays a clean install.

- `2026-10-04-v4-master-qc-receipt.txt`: `servicepow_qc.py --master` on Augusta v4 (sha256 93744a1b…). **Every check PASSES**, audio included (48 kHz stereo; −13.9 LUFS integrated, true peak −2.0 dBTP, measured with ffmpeg ebur128).
- `2026-10-04-v4-per-shot-gate-ledger.jsonl`: per-shot `--gate-clips` on v4. **All seven shots PASS at the standard floor**, the racing clock included.

The video files themselves are not committed (media). They live in the session scratchpad and were sent to Karl.
