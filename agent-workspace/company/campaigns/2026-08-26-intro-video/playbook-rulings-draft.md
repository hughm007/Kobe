---
title: "Two playbook ruling drafts — silent masters (P2) and the freeze gate's calm window (P7)"
type: report
client: internal
owner: Karl
status: draft
created: 2026-08-31
updated: 2026-08-31
tags: [playbook, qc, harness, ruling]
---

# Draft amendments for Owner ratification — video-production.md QC harness

Both are drafted from measured evidence (`gate-record.md` §2f, `learnings/2026-08-31-harness-instrument-limits.md`).
Neither is applied: the playbook owns its blocking-check list single-source, and these change gate
behavior, so they need the Owner's yes.

## P2 — placement-aware audio mode

**Problem.** Step 4b declares homepage heroes autoplay MUTED with audio as a bonus layer, but the
harness auto-fails any master without an audio stream (checks 4/5). Every silent-by-design hero
master fails the gate it was built to.

**Draft ruling.** `servicepow_qc.py --master` gains `--placement hero-muted`, under which checks
4/5 report `N/A (declared muted placement)` instead of FAIL, and the declaration is echoed in the
output so it is always visible on the sheet. Any other placement keeps the hard FAIL. The blocking
check list and count are unchanged — this re-scopes two existing checks by declared placement,
mirroring how `--calm` already re-scopes the motion floor.

## P7 — the freeze gate gets a full-resolution sub-check before failing a declared hold

**Problem.** `freeze_and_black` decodes at 12fps/~320px and calls frames identical under a mean
whole-frame luma diff of 0.35/255. A 10 Hz marker boil moving 2–3px strokes at 1080p is sub-pixel
after that downscale: measured 82.9 dB within a boil group and **33–34 dB at every 3-frame group
boundary** (real, visible change) inside a window the gate reports as frozen.

**Draft ruling.** When a freeze run overlaps a `--calm`-declared window, before reporting FAIL the
harness re-tests that window at native resolution on consecutive-frame pairs; if native-res change
is present at ≥1 Hz (any pair under ~50 dB), report
`HELD (declared calm; native-res motion verified at N Hz)` instead of FAIL. Undeclared freezes keep
the hard FAIL — the stuck-encode case this check exists for is untouched.

## Not drafted, deliberately

The flash-cut false-positive (P4) stays a frame-check instruction rather than a code change — two
occurrences; a third earns the amendment per the promotion rule.
