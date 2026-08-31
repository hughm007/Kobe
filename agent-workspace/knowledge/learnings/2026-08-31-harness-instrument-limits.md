---
title: "The machine QC harness has four measured instrument limits — check the instrument before trusting a FAIL"
type: learning
client: internal
owner: Karl
status: active
created: 2026-08-31
updated: 2026-08-31
tags: [qc, harness, tooling]
---

# The machine QC harness has four measured instrument limits — check the instrument before trusting a FAIL

## The four, with evidence (all from the intro-video campaign)
| Limit | Evidence | Status |
|---|---|---|
| **No silent-master mode** — auto-fails audio checks on a cut the playbook itself declares muted-first | control + challenger + Rev 3 all FAIL audio-48k/peak by design | needs `--allow-silent` or a recorded deviation per master (playbook ruling pending) |
| **Freeze gate blind to micro-motion** — 12fps/~320px mean-diff (<0.35/255) cannot see a 2–3px 10 Hz boil | full-res PSNR inside the "frozen" hold: 82.9 dB within a boil group, **33–34 dB at every group boundary** | P7 — needs calm-window exemption or full-res sub-check |
| **flash-cut false positives on multi-frame wipes** | round 1: Kobe's frame-check found 6–7 real transitions vs 15 reported, none under 0.4s; round 2 pending same check | frame-check before trusting, twice confirmed |
| **OCR expect-strings can't read curly apostrophes or leading digits** | `You paid. It didn't ring.` fails whole, all substrings pass; `4 video` fails while `video ads` passes, string verified on-frame at 64px | write expects without punctuation or leading numerals |

## The rule this earns
A FAIL is a claim by an instrument, and instruments have ranges. Before repairing the artifact,
read the check's implementation and reproduce the measurement at full fidelity; **fix the film only
when the film is wrong**. Never silently pass a FAIL either — a standing limit gets recorded next
to the result, every time, until the harness ruling lands.
