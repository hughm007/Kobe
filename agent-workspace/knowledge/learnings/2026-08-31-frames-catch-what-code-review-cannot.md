---
title: "Rendered frames catch defects code review cannot — in every build round, without exception"
type: learning
client: internal
owner: Karl
status: active
created: 2026-08-31
updated: 2026-08-31
tags: [video, qa, code-rendered, process]
---

# Rendered frames catch defects code review cannot — in every build round, without exception

## What we did
Three build rounds of the Service Pow intro video (control, challenger, Rev 3), each written as
deterministic rendering code that parsed, ran, and produced zero JS diagnostics — then probed by
actually looking at sampled frames before the full render.

## What happened
| Round | Code state | Defects found only by looking at frames |
|---|---|---|
| Control (08-28) | clean, 0 JS errors | **7** — hook read as a note, checklist floated, primitives were bare rectangles, van hovered off its road |
| Challenger (08-30) | clean | **4+2** — draw staging never completed (open-hook thumbs), orphaned ticks, grounding, caption collision |
| Rev 3 (08-31) | clean | **4** — overlay didn't rotate with the phone, CTA hit the frame, string over a dimmed cell, patch slip |

**15 defects, 3/3 rounds, zero caught by the code path.** The code was correct every time; the
pictures were wrong every time.

## Why (mechanism, not vibes)
Rendering code describes geometry relationally; composition errors are emergent — two correct
elements colliding, a correct draw curve that never reaches 1.0, a correct transform applied to the
wrong nesting level. Only the raster shows the interaction.

## The rule this earns
**No full render, and no gate, before a probe pass: render ~12 spread frames plus every snap/seam
frame and look at each one as a stranger.** Third confirmed occurrence → promoted to the video
playbook as an advisory build-stage line (see index).
