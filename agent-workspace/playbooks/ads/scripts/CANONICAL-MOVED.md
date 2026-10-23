# FROZEN — historical toolkit copy (Run 12). DO NOT RUN THESE SCRIPTS.
The canonical source of the video toolkit is the installed skill:
`.claude/skills/servicepow-video-production/scripts/` — all seven tools: `servicepow_video.py`,
`servicepow_qc.py`, `servicepow_overlay.py`, `servicepow_kenburns.sh`, `servicepow_source_qc.py`,
`servicepow_performance_qc.py`, `servicepow_biomech_qc.py`. Edit canonical, reinstall.

Six files here are byte-identical to canonical (verified 2026-09-28). **`servicepow_video.py`
here is OLDER and unsafe**: it assembles with the ffmpeg concat *demuxer* (the frozen-tail defect
the canonical uniform-timebase law fixed), and it lacks the canonical recovery-matching law (no
`run_started` check), so it can ingest an earlier run's completed paid job as the current shot.
Kept only as evidence per
`_servicepow/policies/baseline-and-regression.md` §3.

`servicepow_clip_ledger.jsonl` here is the historical clip-gate ledger — evidence, keep it.
