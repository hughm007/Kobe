---
title: "Service Pow intro video — gate record"
type: report
client: internal
owner: Karl
status: draft
created: 2026-08-30
updated: 2026-08-30
tags: [company, video, intro-video, qc, gate]
---

# Gate record — intro video

First time either quality gate has run on this campaign, and the first time the machine harness has
run at all. Everything below is pasted output or a measured number.

---

## 1. PREFLIGHT — blocking check 29

`python3 playbooks/ads/scripts/servicepow_qc.py --preflight`

```
PREFLIGHT — servicepow_qc.py (rebuilt 2026-08-26)
  ffmpeg: present
  ffprobe: present
  numpy: present
  OCR (expect-strings): available
  self-test planted-freeze detected: yes
  self-test planted-black  detected: yes
  self-test still-clip fails motion gate: yes (score 0.0, density 0.0)
PREFLIGHT: PASS — paste this output before any generation (blocking check 29)
```

**Process miss, recorded rather than buried:** the playbook says to run this *before any other
work*. The entire film was built without it. It passes, so nothing is invalidated — but the order
was wrong and that is a fault in how this campaign was run, not a formality.

## 2. Machine QC — first run, both cuts, BEFORE the motion fix

| Check | Control | Challenger |
|---|---|---|
| resolution / fps / pix_fmt / aspect / duration | PASS | PASS |
| motion-gate | — | PASS (7.00 px/frame) |
| no-black-sections | PASS | PASS |
| **no-frozen-sections** | **FAIL** | **FAIL** |
| **audio-48k-stereo · audio-peak** | **FAIL** | **FAIL** |
| **no-flash-cuts** | **FAIL** (15 cuts, 7 shots < 0.4s) | **FAIL** (12 cuts, 6 shots < 0.4s) |
| hook-motion | WARN — unmeasurable first 1.2s | WARN — same |
| **OVERALL** | **FAIL** | **FAIL** |

### 2a. The freeze finding — the most important thing the gate produced

| | control | challenger |
|---|---|---|
| frozen sections | 20 | 17 |
| **total frozen** | **43.6s of 60.0s = 73%** | **43.7s of 60.0s = 73%** |
| longest single freeze | **6.9s** | **5.2s** |

**Nearly three quarters of this film is a still image.** The drawings animate on, then stop dead
while the viewer reads. That is how a slideshow works, not an animation — and on an autoplay-muted
**looping** hero it will read as a stalled or broken video.

Both cuts score the same, so this is **inherent to how the film was built**, not to either script.
I did not find this. The machine did.

### 2b. The fix — an animation boil, not a way to beat the detector

Traditional 2D hand-drawn animation redraws its lines every few frames so they shimmer. Applied
here: every `wobbleRect` / `wobRound` seed now includes `floor(frame / 3) * 7919`, so all marker
line art is re-wobbled at 10 Hz, and finished (filled) ads keep a **drawn, boiling edge** instead of
a dead vector rectangle.

This is a perceptible change, not a metric dodge: a marker line that breathes reads as *alive*,
which is precisely what this film claims about the company that made it. A sub-pixel drift would
have satisfied the detector and fixed nothing; that was considered and rejected.

Verified: `PSNR(frame 300, frame 301)` was **inf** (pixel-identical) before, **43.45 dB** after.

### 2c. `audio-*` FAIL is a harness gap, not a film defect — but it needs a ruling

Both cuts are silent by design. `video-production.md` step 4b: *"homepage heroes and most feed
placements autoplay MUTED — the story must land with zero audio… the audio bed is a bonus layer."*
The harness has **no flag for a legitimately silent hero cut**, so it auto-fails one the playbook
explicitly permits. Either the harness needs an `--allow-silent` (or placement-aware) mode, or every
silent hero master needs a recorded Owner deviation. **Left as a finding for the playbook, not
waved away.**

### 2d. `no-flash-cuts` FAIL — needs a frame-check before it is accepted

The harness itself says *"frame-check before trusting a FAIL on a whip-heavy edit."* The candidates
are the board wipes (0.5–0.6s) and the **snap**, which is 2 frames by design. A 2-frame snap is a
transition inside a shot, not a shot. Frame-check pending; recorded as unresolved rather than
dismissed.

### 2e. OCR miss was typography, not a missing string

`expect:You paid. It didn't ring.` → **FAIL, not found**. But run as separate substrings:

```
expect:You paid   PASS   found on screen
expect:It didn    PASS   found on screen
expect:ring       PASS   found on screen
```

The string is on screen. The full-string match fails on the **curly apostrophe (U+2019)**, which the
OCR does not return faithfully. The typography is correct and stays; the harness limitation is
recorded, and `--expect` strings should avoid apostrophes.

## 3. Skeptic — isolated, four lenses

*(pending — running in an isolated context with no production reasoning; forbidden from reading
the challenger board, the benefit audit, the script, the storyboard or the worklog)*

## 4. Kobe creative critic — ServicePow-6 + the Direct-Response lens

*(pending — cold read of both contact sheets before any campaign document)*

## 5. Verdict

*(pending both gates)*
