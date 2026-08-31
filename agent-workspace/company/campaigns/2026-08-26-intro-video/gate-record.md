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

## 2f. Round 2 machine QC — the freeze gate's instrument limit, measured

Rev 3 collapsed frozen time from 43.7s to **5.6s**, all inside the B6 compliance hold, and the
harness still fails it — including after the beat's ticks, quote glyphs and label chip joined the
boil. Reading the detector explained why: `freeze_and_black` decodes at **12 fps, ~320px wide**,
and calls frames identical when **mean whole-frame luma diff < 0.35/255**. A 2–3px stroke shimmer
at 1080p is sub-pixel after that downscale; the instrument is calibrated to catch stuck encodes in
footage masters, and physically cannot see designed micro-motion.

Full-resolution evidence, inside the failing window (39.2–44.5s):

| Pair | PSNR | Meaning |
|---|---|---|
| 1249 → 1250 (same boil group) | **82.9 dB** | held, as a hold should be |
| 1250 → 1251 (group boundary) | **33.8 dB** | the 10 Hz boil — real change, visible at full res |
| 1253 → 1254 (group boundary) | **32.9 dB** | same |

**Resolution: recorded as a harness finding (P7), not decorated away.** The B6 hold is a
storyboard-declared calm beat with a live 10 Hz boil; adding macro-motion to satisfy a downscaled
mean would damage the beat to please the instrument. Same class as the silent-audio gap: the freeze
gate needs either a calm-window exemption (the motion gate already has one) or a full-resolution
sub-check before failing a declared hold. Until the playbook rules, this FAIL stands on the sheet
with this explanation beside it — visible, not waved away.

Also confirmed in round 2: the OCR expect-miss on `4 video ads.` is the numeral — `video ads`
passes, `4 video` fails, and the frame shows the string at 64px. Harness limitation class two
(after the curly apostrophe): digits.

**Freeze-rule breach, disclosed:** the B6 boil re-render touched `frames/rev3/` while round-2 gate
agents may still have been reading individual frames from the live directory. The hashed master and
contact sheet the gates anchor to were untouched; the delta is additive stroke jitter in one beat.
The final verification round runs on a fully frozen frame set.

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

## 4. Kobe creative critic — ServicePow-6 + the Direct-Response lens — **HARD FAIL, both cuts**

| Axis | Challenger | Control |
|---|---|---|
| Doesn't-look-AI | 7 | 7 |
| Hook inside 2s | 3 | 2 |
| Human presence | 4 | 1 |
| Format fit | 5 | 4 |
| Audio design | 1 | 1 |
| Message + CTA clarity | 4 | 5 |
| **Score (floor 8.0)** | **4.0** | **3.3** |

**Nine semantic hard failures** across the two cuts — any one means NOT CLIENT READY. The three
heaviest: the unsupported-claim triple (`Can't get pulled.` · the growth-audit CTA · "business"
dropped from the turnaround claim in **both** cuts), the self-refuting strings, and the control's
footage beat illustrated by an empty grey rectangle.

**AI-artifact risk: 2/10 challenger, 1/10 control** — said plainly by the critic: *"the realism
problem this playbook was built to solve does not exist in this artifact. Everything wrong with
these films is a writing, pacing, claims and finishing problem — not a generation problem."*

**Recommendation: take the CHALLENGER's spine** (wins 4 of 6 axes; the only human presence and the
only real product demonstration) **and transplant three things from the control**: the labelled
compliance triple, a named destination on the endcard, and the footage-hero phrasing — the last only
when a real clip exists to put in the plate.

**Kobe's single highest-leverage edit: open on the product, not the pain.** Grid already drawing at
frame 1, `2 ideas × 2 hooks` inside six seconds, the reclaimed ~9s given to the offer line (currently
the SHORTEST hold in the film at ~1.4s — the exact defect class of the 911 Drain price line, second
occurrence) and to the endcard.

**Disputes resolved by Kobe's frame-check:**
- `no-flash-cuts` is a **FALSE POSITIVE** — its own detection: 6–7 real transitions, minimum gap
  2.60s, no shot under 0.4s. The harness counts each frame of a multi-frame wipe as a cut. §2d closed.
- Check 14 opening dead-space: the harness says WARN-unmeasurable; Kobe measured frame 0 at 0.000%
  ink and calls it a FAIL in substance. Accepted.

**Process finding, accepted as a rule:** the masters and frame directories mutated *during* the gate
(the boil re-render ran underneath the review). **New rule: artifacts are frozen for the duration of
a gate — gates run on copies with recorded hashes.** The critic gated the pre-boil masters; its
verdict stands for those, and the repair render gets a fresh full gate anyway.

**Could not run:** check 19 landing-page parity (egress-blocked — Owner must supply the page or
eyeball it) · check 25 human-watched-end-to-end (Owner's tick, not the critic's).

## 5. Verdict

| Gate | Result |
|---|---|
| Machine QC | FAIL (freeze fixed by boil + wobble-everything rule; silent-audio needs a harness ruling; flash-cuts false-positive closed) |
| Skeptic | **BLOCK** — 14 S4 / 23 S3 |
| Kobe | **HARD FAIL** — 4.0 / 3.3 against a floor of 8.0 |

**NOT CLIENT READY — nothing ships.** Both gates independently converge on the same repair: the
challenger's spine, the control's substantiated claims, a product-first open, and every string
re-laid into the safe band. One consolidated repair round (`repair-board.md`), then **both gates
re-run in full on frozen artifacts.** This is the 911 Drain pattern at round one — roughly fifty
defects caught at $0 before the homepage did the catching.


---

# ROUND 2 — Rev 3 on frozen artifacts (2026-08-31)

20 agents: 8 beat inspectors → adversarial refutation → Skeptic Pass 3 (isolated) + Kobe (cold,
comparative). Frozen set: `build/gates/round2-rev3/` (SHA-256 recorded).

## Inspectors: 30 findings → 10 blocking candidates → **2 survived refutation** (8 refuted)

| # | Confirmed S3 | Fix applied same day |
|---|---|---|
| 1 | B3: the van's ladder-rack stroke escaped the phone-screen clip, crossing the bezel and ending on a fingertip (4s steady state) | The in-screen jobsite group is now clipped to the screen rect AND rotated with the phone; composition re-laid so van and shopfront sit on the horizon with the job-arrow connecting them |
| 2 | B8: the endcard wordmark's ink center sat at x=1034.5 vs underline/CTA at ~958 — an SVG text-anchor bug, static for the film's longest hold | Wordmark repositioned so ink centers at 960; the retraction lerp follows. Verified on the re-rendered frame |

## Skeptic Pass 3: **0 × S4, 1 × S3, 5 × S2, 6 × S1** (round 1: 14 S4 / 23 S3)

*"The repair held everywhere except the one promise the film makes about the page beneath it."*

- **The S3 (page parity):** `See one made for your business ↓` requires a real below-fold
  fulfillment — a finished spec ad, or a reworded instruction (e.g. `Get one made for your
  business ↓` pointing at a request form). Converges independently with the bar-raiser's gap #1.
  **Page-side, Owner-facing; the film's wording swaps in one line + a 6s re-render either way.**
- S2s: grid cells were four unrelated layouts (fixed same day — rows are now concept siblings,
  columns the hooks); 16:9 depiction of a product that ships native 9:16 (accepted with rationale:
  the film makes no aspect claim; needs the Owner's named acceptance at sign-off); agency register
  in "concepts/hooks/pulls" (accepted: two are services.md verbatim; "pulls" is trade vernacular);
  horizontal crop risk on the left rail (discharged: the embed contract mandates
  letterbox-never-crop); zero seconds of a real ad (deferred to the below-fold proof — which is
  why the S3 must clear).
- Loop/seam/muted read: **checked, clean** — every 10s entry window gives a legible statement in ~8s.

## Kobe: **ServicePow-6 midpoint 8.2 — above the 8.0 floor. No axis ≤ 6. Zero semantic hard failures (all 12 checked).**

| Axis | R1 | R2 |
|---|---|---|
| Doesn't-look-AI | 7 | **9** |
| Hook inside 2s | 3 | **8** |
| Human presence | 4 | **7** |
| Format fit | 5 | **9** |
| Audio design | 1 | **7** (placement rule applied and stated) |
| Message + CTA | 4 | **9** |

Verdict **REVISE, "nothing wrong with the film; the label is procedural"** — withheld on three
unrun gates only: check 19 (the page doesn't exist yet), check 25 (no human has cold-watched any
cut), and check 23 (no Skeptic artifact was filed in the campaign folder at review time — this
section IS that filing). The audio-family checks await the P2 ruling.

## Polish pass applied after the verdicts (one pass, scoped by them)

Inspector S3 ×2 fixed · rows-as-siblings · boil phase de-sync (the picture no longer pulses on one
clock) · global ease-out on every draw-on · B3 composition re-laid. Final render re-measured and
re-frozen as `gates/round3-final/`.

## What remains, and whose it is

| Item | Whose |
|---|---|
| The S3: below-fold spec ad exists, or the instruction rewords | **Owner** (site build) — the film accepts either in one line |
| Check 25: a human cold-watch, muted, on a phone, with the 10-second questions | **Owner, ~5 minutes** |
| Check 19: open the live page beside the film | **Owner** (egress-blocked from the container) |
| P2/P7 harness rulings | **Owner ratifies** (`playbook-rulings-draft.md`) |
| 16:9-depiction S2 named-human acceptance | **Owner**, at sign-off |
| Brand A/B/C · growth-audit reconciliation · rights-clear clip · demo-spec-ad trade · contract terms | **Owner**, standing |


## Final machine QC — the delivered master, every line adjudicated

`servicepow_qc.py --master --calm --endcard 6.6` on the frozen `servicepow-intro-60s-rev3.mp4`:

| Line | Result | Adjudication |
|---|---|---|
| resolution · fps · pix_fmt · aspect · duration · no-black · motion-gate | **PASS** | — |
| expects: `video ads` · `concepts` · `business days from your footage` · `before you ask` · `See one made for your business` | **PASS** | — |
| audio-48k · audio-peak | FAIL | **Standing limit P2** — silent by design per step 4b; ruling drafted, Owner ratifies |
| no-frozen-sections (4 windows, all inside B6's declared calm hold) | FAIL | **Standing limit P7** — instrument blind to the 10 Hz boil at 12fps/320px; full-res evidence §2f |
| hook-motion | WARN | Recorded — frame 1 carries ink and a moving marker stroke; the instrument's edge-travel floor is calibrated for footage |
| no-flash-cuts (18 "cuts") | FAIL | **False-positive class, THIRD occurrence** (Kobe frame-checked rounds 1 and 2: multi-frame wipes counted as cuts, no real shot under 0.4s). Per the promotion rule this now earns the harness amendment — added to `playbook-rulings-draft.md` |
| expect `Disclosure handled` | FAIL | **OCR glyph class #3, verified**: `isclosure` PASS, `handled` PASS — only the leading capital D fails, grazed by the boiling tick's stroke tip at sampled instants. String on screen 39.0–45.1 at 44px, legible on the final sheet |

**Every FAIL on the delivered master is either a recorded instrument limit with measured evidence,
or a verified false positive — none is a defect in the film.** The honest sheet ships with the
artifact; nothing was suppressed to make it read clean.

---

# Round 4 — the enrichment round (2026-08-31)

Triggered by the Owner: *"use higgsfield and use seedance 2.5 to generate images to
make this video look more visually appealing"* + *"I would also like a voice over."*

Frozen artifacts: `build/gates/round4-enriched/` — master
`5f52c965…`, scenes.html `1425d4ba…`, frames-manifest `b77055f5…`.

## 1. The plate question, judged and refused

15 agents: three independent design spines (diegetic-only / world-plates /
restraint), two lenses each, a synthesis, then three adversarial refutations.

| Spine | Mean | Regress risk |
|---|---|---|
| world | 8.0 | yes |
| diegetic | 8.0 | yes |
| restraint | 7.5–8.5 | **no** |

The synthesis picked an amended world spine — 2 plates, above the horizon only.
**All three refutations returned `refuted: true`.** The three findings that killed it:

1. **"Not AI" is a boolean, not a ratio.** The film scores 9 on *Doesn't-look-AI*.
   One photograph spends that; 85% ink does not buy it back.
2. **The horizon clip inverts the cel/background relationship.** `vanArt`
   (scenes.html:690) emits its contact ellipse at `cy=770, ry=7.8` — centred on the
   clip line — so 7.8px of the van's only ground-contact cue would be painted onto
   photographed sky. Same at B7 (`cy=R7HZ=660`).
3. **The grade loses colour.** A graded plate measures **chroma 8.84** against
   `skyGrad`'s **15.50**. The photograph would make the frame *less* colourful than
   the gradient it replaced.

Independently of the verdict, the plates could not have shipped: generated media
cannot reach this container (three routes tested — see the egress learning). Two
independent reasons, same answer. **Zero plates in the film.**

## 2. What shipped instead

Exactly three changed runs, confirmed by frame diff against the previous master
(every other sampled frame byte-identical):

| Run | Change |
|---|---|
| 28.0–30.0s | `streetWorld()` at B4 |
| 38.7–45.3s | `SV3` 1 → 0, the compliance-beat continuity fix |
| 49.3–52.7s | `streetWorld()` at B7 |

**The B6 defect.** `r5b` marks cell 0 as the winner three ways — accent circle, tick,
and `dimLosers && i!==0` — and `r3sourceScreen` renders the phone mini-ad as
`adFinal(...,0)`. `r6b` set `SV3=1`, so the beat burning *Disclosure handled / No fake
testimonials / Claims substantiated* annotated a **different ad than the one the film
had just declared the winner**. Survived two full gate rounds. Frame-checked at 32.0s
and 43.0s after the fix: the circled winner and the annotated compliance ad now match.

## 3. Measured delta

| Metric | Before | After |
|---|---|---|
| B4 chroma | 8.85 | **10.24** |
| B7 chroma | 8.10 | **8.74** |
| Film-wide chroma | 7.68 | 8.02 |
| Coverage | 15.30% | 15.31% |
| Loop seam PSNR(1799→0) | 24.013 dB | **24.013 dB** (frames 0/1799 byte-identical) |
| Master size | 4,907,027 | 5,046,402 (+2.8%) |

Measured with `build/visual-density.py`, added this round so "more visually
appealing" is a delta rather than an opinion.

## 4. QC adjudication

Unchanged from round 3: the two audio FAILs (P2, silent by design), `no-flash-cuts`
(P4, known false positive), `hook-motion` WARN.

**One new line: a fifth frozen window, `53.9s+4.7s`.** Adjudicated as a **P7 instance,
not a regression**:

- The B8/endcard source frames are **byte-identical** between the two renders
  (`maxdiff 0` across 53.7–58.8s). The film did not change there. The detector's
  verdict flipped because earlier frames changed the encoder's bit allocation and
  that hold sits on the threshold.
- At full resolution, **30 of 30 adjacent frame pairs in the window differ**, PSNR
  35.9–51.7 dB. The endcard is actively redrawing at 10 Hz. The check works at
  12fps/~320px with a <0.35/255 mean-diff floor and cannot see it.

Recorded, not gamed. Adding motion to an endcard purely to satisfy a mis-calibrated
detector would be exactly the instrument-gaming the house rule forbids.

## 5. Still open

- **Dual re-gate not run.** This master is not gate-cleared; the round-3 verdicts
  (Skeptic 0 S4 / 1 S3, Kobe 8.2) do **not** transfer. Skeptic + Kobe on the changed
  beats is the next step.
- **The hook is still the weakest beat**: 5.4% coverage, `hook-motion` 0.24 against a
  floor of 1.0. Diagnosed, not addressed — it needs its own round.
- **Audio not produced.** See `voiceover-script.md` §5.
