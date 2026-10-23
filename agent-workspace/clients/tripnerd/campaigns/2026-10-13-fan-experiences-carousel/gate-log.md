---
title: "TripNerd — C03 Fan Experiences carousel: gate log"
type: report
client: tripnerd
owner: Karl
status: active
created: 2026-10-05
updated: 2026-10-05
tags: [gate, critic, skeptic, carousel]
---

# C03 gate log

The dual gate runs on a **frozen** set:
- a critic in a fresh `gate_fanexp_v<n>_critic_<epoch>/` folder;
- an isolated Skeptic in `gate_fanexp_v<n>_skeptic_<epoch>/`, after a clean contamination grep.

Both are spawned in the same message, and both verdicts are transcribed verbatim below. The delivery checks are the canonical blocking-check registry (`_servicepow/data/blocking-checks.yaml`).

| Round | Set | Machine QC | Critic | Skeptic | Result |
|---|---|---|---|---|---|
| v1 | 7 cards, c1 and c3 with labelled empty frames (sha256: [`qc/v1/sha256-v1.txt`](qc/v1/sha256-v1.txt)) | static QC exit 0; extra checks exit 0 | **NOT RUN.** The set is incomplete | **NOT RUN** | **HELD** for the 17th-hole rail frames |
