---
title: "A drawing helper written for a full-bleed call will leak when reused inside a frame — and the full-bleed call will never show it"
type: learning
client: internal
owner: Karl
status: active
created: 2026-08-31
updated: 2026-08-31
tags: [video-production, code-rendered, qc, gates]
---

# A drawing helper written for a full-bleed call will leak when reused inside a frame — and the full-bleed call will never show it

## What we did

Intro-video round 4. Added `streetWorld(x,y,w,h,hz,sc,seed)` to `build/scenes.html` to
replace the two flat rectangles that B4 and B7 had been resolving into. Called it twice:
once full-bleed at B4 `(0,0,1920,1080)`, once into an inset picture frame at B7
`(564,194,992,555)`.

## What happened

The helper deliberately overdraws its own bounds so its content is not visibly cropped:
the treeline loop runs `let sx = x - 40` … `while(sx < x + w + 40)`, and a cloud centre
can reach `x + w*0.96` with a half-width of `w*0.20`, i.e. `x + w*1.16`.

At B4 that is invisible — the SVG canvas clips it. At B7 it landed **on the page**.

| | Frame 1530, B7 |
|---|---|
| Stray silhouette pixels left of the frame | **1,917** |
| Stray silhouette pixels right of the frame | **1,628** |
| Colour | `#7C8B86` at 0.30 over cream = RGB(210,213,208) |
| Duration | all 126 frames of the beat, 4.2s |

A grey tree dome and a roof floated on bare cream beside the picture frame, next to the
word "first", for the entire hold of the film's only Owner-signed line.

**Source:** measured on `build/frames/rev3c/01530.png`; fix verified on `rev3d` at 8 and
19 residual pixels (antialiasing at the clip boundary).

## What we think it means

**The claim: a region-drawing helper must clip to its own region, at the helper, not at
the call site.** Overdraw-then-rely-on-the-canvas is a hidden dependency on the caller's
geometry, and it is invisible in exactly the case you write first — the full-bleed one.
The second call site is where it fails, and by then the helper looks proven.

The corollary matters more than the bug: **the call site that would reveal the defect is
the one you add later.** Testing the helper where you wrote it can never find this.

**Confidence: High.** Measured at the pixel, cause read in source, fix re-measured.

## How far it generalises

- ☑ Probably a general principle — any function that draws, writes or lays out into a
  rectangle it was handed

The same shape appears wherever a routine is given bounds and trusts something downstream
to enforce them: canvas and SVG drawing, PDF and print layout, cropping and thumbnailing,
anything that composites into a sub-rect.

## How it was caught, and what that says about the gate

**Not** by code review, **not** by the machine QC, and **not** by me looking at the
contact sheet — I had looked at B7 twice and not seen it. It was caught by two independent
Skeptic lenses that opened individual frames and measured pixel runs outside the frame
stroke, and it was then upheld by adversarial verification while nine of twelve other
blocking findings were killed.

That is the third occurrence of *rendered frames catch what code review cannot* — already
promoted to a Probe Pass advisory in `playbooks/ads/video-production.md`. It is the first
occurrence of the narrower rule that **the probe pass must include the frame regions
OUTSIDE any drawn frame or mask**, not just the content inside it.

## What we'd do next

Add to the Probe Pass advisory: for any beat that composites into a sub-rect, sample the
margin *outside* the rect and assert it equals the ground colour. That is a two-line check
and it would have caught this before the gate did.

## Promotion

- ☑ Added to [`../index.md`](../index.md)
- ☑ Second occurrence of "verify the tool/helper's reach before building on it" — see the
  egress learning. Third occurrence → promote both into one playbook preflight.

## Related

- `2026-08-31-frames-catch-what-code-review-cannot.md` (promoted)
- `2026-08-31-generated-media-cannot-cross-the-egress-wall.md`
