# Video-production toolkit — canonical home
Installed with the skill; these are THE tools the workflow names. Copies elsewhere in a
deployment workspace are consumers, not sources.

| Tool | Job |
|---|---|
| `servicepow_video.py` | state ledger · preflight (BC-43) · generate with recover-before-regenerate · plan/variant economics · uniform-timebase assemble · freeze/verify (targeted-revision proof) · econ |
| `servicepow_qc.py` | QA1 machine harness (masters + clips; `--endcard N` exempts a designed static endcard) |
| `servicepow_overlay.py` | composited text overlays (BC-42) — JSON spec -> transparent PNG; text is never model-rendered |
| `servicepow_kenburns.sh` | illustrated-lane motion: still -> 1080x1920 push/pan clip |
| `servicepow_source_qc.py` | source-QC harness (BC-26..BC-28: ASR-verified speech-free beds, declared-lines match, burned-text safe area) |
| `servicepow_performance_qc.py` | speech-pacing gate (BC-32) |
| `servicepow_biomech_qc.py` | impossible-human-speed gate (BC-33 — conditional: only when generated people appear) |

## Environment bootstrap (one-time per machine)
`servicepow_qc.py` and `servicepow_overlay.py` need numpy + Pillow. The system Python is
often externally managed (PEP 668), so use a venv next to the scripts:
```
python3 -m venv .qcvenv && .qcvenv/bin/pip install numpy Pillow
.qcvenv/bin/python servicepow_qc.py --preflight
```
Also required on PATH: `ffmpeg`, `ffprobe`, the `higgsfield` CLI (authenticated). The voice
route is proven by preflight producing real audio, never asserted.

## Plan schema
`servicepow_video.py init --plan <file>` consumes the schema shown in
`../templates/plan-example.json` — concepts (id, visual, body_shots, body_prompts[]),
hooks (id, prompt_template with `{concept}`), cta.prompt.

## Platform notes (honest limits)
Overlay fonts are macOS paths (Arial at the system Supplemental dir) — on another OS, point
BOLD/REG at any TTF. Output geometry is 1080x1920 (9:16); other aspects need a spec change.
