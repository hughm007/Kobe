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

**Re-run on the boiled master:** frozen time **43.7s → ~15.5s** (17 sections → 7). The seven
survivors are the elements the boil does not reach — beats built from plain straight strokes
(`lineD` road lines, the van and shopfront paths, the checklist ticks) and the blank open. The fix
carried into the repair round as a build rule: **every stroke is a hand-drawn wobble line** —
ruler-straight lines are off-style for a marker film regardless, and wobble lines boil for free.
The remaining `no-frozen-sections` FAIL is therefore expected to clear in the repair render, and
must be proven there, not asserted here.

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

## 3. Skeptic — isolated, four lenses — VERDICT: **BLOCK**

Ran against the pre-boil challenger master, in isolation (it disclosed reading `build/out/README.md`,
which was not on the prohibited list, and re-derived every fact it used from the frames itself).

**Driving count: 14 × S4, 23 × S3.** One S3 blocks; there are thirty-seven.

### The four findings that would each block on their own

| # | Finding | Class |
|---|---|---|
| 1 | **`So it doesn't look fake.` is written across a cartoon.** The film's one realism claim sits on the least real image in it — the company's stated moat, refuted by its own hero in a single screenshot | Self-refuting claim — S4 |
| 2 | **`Can't get pulled.`** is an absolute guarantee about third-party platform moderation, from a company `company-profile.md` records as never having shipped a paid ad. `compliance.md`: "No written confirmation = the claim is absent" | Unsubstantiated guarantee — S4 |
| 3 | **`Get your free growth audit.`** — the film's only CTA names an offer that exists in no company document, has no destination, and is new information at the endcard | Unbacked offer — S4 (independently caught 2026-08-30, now gate-confirmed) |
| 4 | **The loop joins a blank frame to a blank frame.** "Seamless" was technically true and substantively empty: ~2.9s of dead cream at every pass, and the loop's real sentence is *"Get your free growth audit → [blank] → You paid. It didn't ring."* | Loop design — S4 |

### Findings that are MINE, stated as such

- **I reintroduced the 5–7 days defect.** On 2026-08-28 I caught the VO dropping "business days, from
  receipt of client assets" and fixed it in the control's burned text. In the challenger I wrote
  `4 ads · 5–7 days` — both qualifiers dropped again, by me, in the very cut built to fix claim
  hygiene. Second occurrence of the class, same author.
- **The unlabeled checklist is my own earlier "fix".** I moved the compliance labels out of the
  burned text into the VO to stop the picture and voice duplicating — on a film with **no audio**.
  Result: three checkmarks proving nothing. The de-duplication was right for a sound-on film and
  wrong for this placement.
- **Blocking check 28 (text safe-area, 15–70% of frame height) fails on 10 of 13 strings** —
  measured at 81–94%. I never ran the check. On a mobile hero crop that band is exactly what gets
  cut. Wholesale layout violation, mine.
- **`Nobody comes to your site.`** — I meant *jobsite*; on a website it reads as *website* and
  self-refutes in placement. Copy defect, mine.
- **The Hook Law fails**: frame 1 is 0.000% ink. The film opens on a blank screen.

### Findings mooted or partially mooted by the boil (§2b)

The pixel-level freeze findings (L1-08, LP-04 in part) are addressed by the 10 Hz boil. **The
composition-level stillness is not**: 26.8–32.8 remains six seconds where only the caption changes,
and ~31% of runtime still carries no words. Shimmering lines do not fix an empty message hole.

### Disputed / needs frame-check

- `no-flash-cuts` overlap: the 2-frame snap is a transition inside a shot, not a shot. Harness says
  frame-check before trusting; still pending.
- L3-03's "play glyph is a literal `>`": it is a drawn triangle at low draw-progress in that frame;
  at full draw it closes. Partially an artifact of sampling mid-draw — but if a sampled frame reads
  that way, a paused viewer sees the same thing, so the finding stands at S2 for the sketch state.

## 4. Kobe creative critic — ServicePow-6 + the Direct-Response lens

*(pending — cold read of both contact sheets before any campaign document)*

## 5. Verdict

*(pending both gates)*
