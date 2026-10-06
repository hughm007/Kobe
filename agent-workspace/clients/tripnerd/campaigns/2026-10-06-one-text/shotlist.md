---
title: "TripNerd — One Text — shot list (as built, v1)"
type: report
client: tripnerd
owner: Karl
status: active
created: 2026-10-06
updated: 2026-10-06
tags: [shotlist, reel, one-text]
---

# Shot list — v1 as built (15.0 s · 9:16 · 1080×1920 · 24 fps)

Master is 24 fps because every Kling 3.0 source is 24 fps (no frame-rate conversion judder).

| # | Master time | Job | Source (Higgsfield job) | Route | Motion axis | Burned-in text | Audio | Real reference (BC-34) |
|---|---|---|---|---|---|---|---|---|
| 1 | 0.0–3.0 | Hook: the text | Keyframe 129 cropped to 9:16 (media `c0e37da4…`) → Kling 3.0 pro i2v job `c6b39ca2…` (0.0–3.0) | GENERATE + COMPOSITE (bubbles, real logo avatar). Phone screen blurred on every frame by `build/blur_screen.py` (model painted fake chat text and an AI-drawn logo) | Handheld drift L→R, thumb taps; bubble slide-ups | "6 of us. / Can you make it happen?" → typing dots → "On it." | send at 0.05 s, receive at 1.75 s | Text-thread hook: NO REFERENCE PULLED — HIGH RISK surfaced to APPROVER (competitor research running) |
| 2 | 3.0–5.8 | Hallway → doorway | Keyframe 145 → Kling job `ff7f370b…` (0.6–3.4) | GENERATE | Gimbal follow forward at walking pace | none | whoosh at cut, room tone fades in | TripNerd's own Sep 26 Reel (real suite footage) for what a full hospitality room looks like |
| 3 | 5.8–8.1 | Through the room | Keyframe 144 → Kling job `ed318f08…` (0.1–2.4; cut before a model-painted EXIT sign at ~2.5 s) | GENERATE | Rising forward glide over tables | none | room tone | as shot 2 |
| 4 | 8.1–15.0 | Payoff: the six at the rail, stillness; end card from 11.7 | New keyframe `04249205…` (GPT Image 2.5, refs 137 + 145) → Kling job `5fcdf435…` (8 s, 0.0–6.9) | GENERATE (calm beat, declared) + COMPOSITE end card | Slow push-in; breeze; friend's hand on shoulder | End card: real wordmark · "It starts with one text." · "DM @tripnerd with your group size." | outdoor air | as shot 2 |

## Continuity
Hero: navy polo with white collar, navy shorts, white sneakers, short brown hair — seen only
from behind. Light: late afternoon, sun from frame left. Room: white panelling, woven wicker
pendants, open French doors (145 and 144 share it). Shot 1 shows only hands and a grey sleeve.

## Rejected from the pitched sequence (and why)
| Pitched | Why it is out |
|---|---|
| 133 / 123 hug at the doorway | Performed emotion at readable distance; face-forward AI people |
| 115 group cheering | Performed celebration (realism floor) |
| 103 terrace over an island green | Repeats the Sep 26 ad's island green; strong event association |
| 119 / 120 / 117 phone screens | AI-written text and an AI-drawn TripNerd logo on screen |
