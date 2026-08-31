---
title: "Code-rendered draw-on films are 70%+ still images unless every stroke boils"
type: learning
client: internal
owner: Karl
status: active
created: 2026-08-31
updated: 2026-08-31
tags: [video, animation, code-rendered, qc]
---

# Code-rendered draw-on films are 70%+ still images unless every stroke boils

## What happened
| Cut | Frozen (machine QC) | State |
|---|---|---|
| Control | **43.6s of 60.0s (73%)**, longest 6.9s | draw-on → dead hold |
| Challenger | 43.7s (73%) | same — inherent to the technique, not the script |
| + 10 Hz boil (`seed + floor(frame/3)*7919`) | 15.5s | survivors = un-wobbled straight strokes |
| + every stroke hand-drawn (`wline`) | **6.8s → 5.6s**, all in declared calm holds | full-res boundary PSNR 33–34 dB = real visible shimmer |

## Mechanism
`f(t)` animation moves only what a curve tells it to move; between beats nothing is told to move.
Traditional hand-drawn animation never has this problem because redrawing IS the medium — the boil.
A marker film without a boil is a slideshow with animated transitions, and on an autoplay-muted
looping hero it reads as a stalled video.

## The rule this earns
In a code-rendered marker film, **the boil is part of the ground, not a decoration**: every stroke
seeds on `boil()` from the first line of code, straight ruler lines don't exist (`wline`
everything), and the freeze check runs on the first render, not at the gate.
