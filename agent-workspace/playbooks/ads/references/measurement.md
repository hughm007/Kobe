---
title: "Measurement — machine QC, the inspection protocols and the Skeptic gate"
type: playbook
client: internal
owner: Karl
status: active
created: 2026-08-26
updated: 2026-08-26
tags: [ads, qc, measurement, thresholds, canonical]
source: servicepow-ad-producer v4.0 §7–§7D (2026-08-20), imported verbatim 2026-08-26. See decision 0005.
---

# Measurement

> **Canonical home for QC thresholds and inspection protocols.** Load at QC time only.
>
> **⚠ SCRIPT GAP:** the four scripts referenced below (`servicepow_qc.py`,
> `servicepow_source_qc.py`, `servicepow_performance_qc.py`, `servicepow_biomech_qc.py`) are
> **not in this repo** — only their usage and thresholds are. Until the source is added,
> checks 8–15, 26–28, 32 and 33 are enforced by **judgment, not measurement**, and any claim that
> they were "run" is an LB29 violation. Paste the scripts to close this.
>
> Thresholds marked PROVISIONAL are exactly that — the motion floor is anchored on n=2.

## 7. MACHINE QC — the code-enforced gate

`scripts/servicepow_qc.py` runs inside the Higgsfield sandbox (ffmpeg + numpy preinstalled). The sandbox is ephemeral — **cat the script in at the start of every QC step**, then:

```
python3 servicepow_qc.py clip1.mp4 clip2.mp4          # source clips
python3 servicepow_qc.py final.mp4 --master --sheet    # edited master + contact sheet
```

| Check | Threshold | Catches |
|---|---|---|
| motion-gate (clips) | edge travel ≥ 1.6 px/frame (PROVISIONAL — anchored on 2 clips: rejected 1.00 / accepted 2.90; tighten with every scored clip) · storyboard-declared calm/stillness beats run with `--calm FILE` (threshold 0.6 — still catches frozen) | slow motion & floaty drift — the #1 AI tell |
| no-frozen-sections | no freeze > 0.7s (endcard exempt) | dead frames, stills-as-video |
| resolution / fps / pix_fmt | ≥1080p, 24fps, masters yuv420p 8-bit | spec drops |
| audio-48k-stereo (masters) | 48000 Hz / 2ch | concat failures, resample bugs |
| audio-peak / not-silent | ≤ −0.5 dB max, > −45 dB mean | clipping and silent ships |
| no-black-sections | no black ≥ 0.3s | gaps, failed joins |
| no-flash-cuts (masters) | no shot < 0.4s (scene-detect based — a designed whip transition can false-trigger; frame-check before trusting a FAIL on a whip-heavy edit) | flash-cut edits |
| aspect / duration | `--aspect W:H --duration S` vs probe (±2%) | wrong-placement or wrong-length delivery |
| hook-motion (masters, WARN) | first 1.2s edge travel ≥ 1.0 (validated on Reversal v3: 1.09 near-still rain open → PASS) | static opens that kill thumbstop (LB36) |
| oner-check (clips) | reports model-inserted cuts | LB18 violations |
| contact-sheet | writes frame grid | frame-step review material |

Rules: **exit 1 = the file is dead** until fixed and re-run. The pasted output table IS the evidence. Thresholds change only with owner sign-off and a validation run against known-good/known-bad clips. When a new failure mode gets caught by a client, the first question is "what check would have caught this?" — and it gets added to the script, not just the prose.

### 7A. Source-side QC — blocking 26–28

`servicepow_qc.py` interrogates the **output**. This one interrogates the **inputs and the
finished speech**, which is where the 2026-08-19 defects lived. Run it, paste the output.

```
# before any audio is looped or layered under anything  (blocking 26)
python3 servicepow_source_qc.py --bed roomtone.wav

# on every finished master  (blocking 27)
python3 servicepow_source_qc.py --master hookA.mp4 \
    --expect-line "Thanks for calling 911 Drain, what's going on?" \
    --expect-line "Okay, that's the price before I start. You good with it? Yeah. Go ahead."

# on every master carrying burned text  (blocking 28)
python3 servicepow_source_qc.py --safe-area hookA.mp4

# prove the gates can fail — run this whenever the script changes  (LB40)
python3 servicepow_source_qc.py --self-test
```

`--master` fails if a declared line appears zero times, twice, or if undeclared speech is
present — which is exactly how a looped bed, a duplicated beat, or a half-cut line shows up.
`--safe-area` fails if any burned text sits outside 15%–70% of frame height, the strip where
TikTok's caption block and the Reels username bar land.

---

## 7B. THE EYES PROTOCOL — seeing frames without a browser

Claude's local shell **cannot** reach the Higgsfield CDN (403), but the Higgsfield sandbox can — and Claude CAN natively view local image files. The validated bridge:

1. **In the sandbox** (one atomic command — it's ephemeral): download the clip/master → extract the frame(s) with ffmpeg → shrink with PIL to ~320px wide, JPEG quality ~70, **keeping the file ≤ ~12.5 KB** (larger base64 gets truncated in the tool output and the file is corrupted — always verify the `B64_END` marker printed after the blob) → `base64 -w0` the file between `B64_START`/`B64_END` markers.
2. **Locally:** write the blob to a file via heredoc, `base64 -d` it, then view the decoded JPEG directly with the Read tool. No re-encode needed — validated end-to-end on a real master frame.
3. **Detail checks use CROPS, not downscales:** a 320px full frame verifies posture, composition, blocking, and gross defects — it CANNOT verify logo spelling, face-identity drift, or corner watermarks. For those, crop the region of interest at native resolution in the sandbox (a 300×300px native crop fits the same 12.5KB budget at full detail) and transfer the crop.
4. Contact sheets: same mechanics; for a sheet whose base64 exceeds ~16K chars, print it in deterministic chunks (`cut -c`) across back-to-back sandbox calls. *Chunked transfer is designed but NOT yet validated — it may not be claimed as gate evidence until validated once.*

**When mandatory:** hook + payoff frames after keyframe compositing; first/mid/last frames of every finals-quality clip; hook / payoff / endcard frames of every master before Kobe scoring — full frame for composition PLUS native crops for any logo/face check the shot requires. Cost is ~5–8K tokens per frame — spend it on hero beats, not every frame. This closes the gap that shipped a hovering man: **never claim visual QC without either this protocol or actual playback.**

## 7C. THE DESCRIBE-BACK GATE — independent machine viewing

`video_analysis_create` (Higgsfield MCP, video_input_id = the master's media id) returns a scene-by-scene description of what an independent model actually SEES and HEARS — completed in ~30–60s on a 10s master, **zero credits** (verified by balance diff).

- Prerequisite: the master must exist as a Higgsfield media id — sandbox-assembled masters are uploaded via `media_upload` → PUT → `media_confirm` (the same upload the delivery flow already performs) before analysis.
- Run it on **every assembled master** before Kobe scoring. Compare each returned scene against the storyboard: actions, objects, audio ("rhythmic chant of 'Defense! Defense'" confirmed our chant reads; "cartoon character illustration and brand markings" confirmed the badge reads as printed).
- **Any mismatch = investigate before scoring**: an object the storyboard doesn't have, an action described differently than intended, audio described as unclear/garbled, or a scene label that doesn't match the story job. **Arbitration: human eyes (Eyes Protocol frames or playback) decide — a describe-back mismatch triggers investigation, never an automatic kill** (the analysis model can misread too).
- **If the service fails at gate time** (its sibling virality_predictor failed twice on 2026-08-17): substitute Eyes Protocol frames + human watch, and log "Describe-Back UNAVAILABLE — substituted" in the ad package. Confidence: validated on ONE run; "free" verified by balance-diff that day — re-verify the zero-charge per session.
- Short clips analyze most reliably; keep masters under ~60s per analysis.
- Note: `virality_predictor` was tested 2026-08-17 and **failed on both attempts** (terminal job failure, no output, no charge). Not part of the pipeline; re-test occasionally — if it starts working, evaluate as an additional hook/retention signal, advisory only.

> **⚠ ONE CORRECTION (2026-08-26):** v4.0 records `virality_predictor` as having *"failed on both
> attempts"* on 2026-08-17 and excludes it from the pipeline. **That is now stale** — the tool is
> live in the Higgsfield MCP today. v4.0's own instruction stands: re-test, and if it works treat
> it as an **advisory** hook/retention signal only. It is never a gate.

## 7D. THE SKEPTIC GATE — mandatory, cannot be skipped

Kobe grades the work. **The Skeptic attacks it.** Both are required.

- **Pass 1 — after storyboard approval, BEFORE generation.** Every major AI shot classified LOW/MEDIUM/HIGH/EXTREME generation risk; HIGH and EXTREME get their production method changed (real, hybrid, keyframe, simpler action, different angle, or removed) *before* credits are spent. This is the cheapest gate in the system.
- **Pass 2 — on candidate footage.** Normal-view first impression, then forensic sweep, then the focal-area rule.
- **Pass 3 — after assembly and Kobe.** Four lenses (target customer, client, industry professional, competitor), plus the weakest-2s, first-3s, persuasion, cheese, trust and AI-detection tests.

**Invoke the `servicepow-skeptic` skill.** Give it the file, the brief, the client facts and the claims — **not** the production reasoning, the credit cost, or which drafts came before. Independence is the point: a reviewer who knows why a compromise seemed reasonable will accept it.

**Severity:** S3 or S4 = automatic delivery block. A CONDITIONAL PASS must list every remaining issue individually with severity, accepted by a named human — never a blanket "minor issues." **After any repair, re-run the Skeptic (regression check).**
