---
title: "TripNerd Phoenix v2 version C: AI crowd-to-suite fly-up (spec; NOT generated)"
type: brief
client: tripnerd
owner: Karl
status: draft
created: 2026-10-19
updated: 2026-10-19
tags: [client, phoenix-open, ai-video, spend-gate]
---

# Version C: AI fly-up from the crowd to the suite (awaiting SPEND_APPROVER)

**Status: written, not generated.** No credits spent.

## What changes from v2
Shots 2–3 (the two whips, 3.0–4.0 s) are replaced by **one continuous AI camera move**. It starts on our real general-admission crowd frame and ends on our real suite-rail frame, then cuts into the real suite footage on the 4.0 s drop. Everything else is identical to v2.

## Inputs (real frames, logos already painted out; scratchpad `phxbuild/versionC/`)
- **start_image:** `C_start_GA_crowd_V02.png`, V02 src about 0.4 s: the packed crowd below the rail, the stands and the green.
- **end_image:** `C_end_suite_rail_V01.png`, V01 src 0.1 s: the canopy, pillar and guests at the rail.

**Note:** both were shot from the same suite, so the move is a **pull-back and turn** (crowd below → the rail you're standing at), not a literal flight up from the ground. That keeps the model inside the real geometry and reduces invented content.

## Model options (live catalogue, 2026-10-19; re-check at approval)
Each of these accepts both start_image and end_image:

| Model | Durations | Resolution |
|---|---|---|
| FLUX 3 Video | 5–20 s | 720p–4K |
| MiniMax H3 | 4–15 s | 2K |
| MiniMax H3 Max | 5–15 s | 480/768p |

- **Price:** not returned by the catalogue. **It is quoted from the runtime at approval, before anything is fired.**
- **Balance at writing:** 3,603.64 credits (Ultra plan).
- **Plan:** 1 test generation of 5 s, silent (any bundled audio unused), then speed-ramped to about 1.0–1.5 s in the edit. Maximum 2 retries.

## Prompt (positive phrasing, single shot)
```
SCENE CONTEXT
One continuous handheld phone shot inside a covered hospitality suite above a desert golf stadium hole on a bright midday. The camera begins looking down over a packed standing crowd below the suite's glass rail and pulls back and turns left to reveal the shaded suite rail with seated guests.

FIRST FRAME / BLOCKING
Matches the start image exactly: packed crowd in the lower half, desert landscaping, green fairway and the long white two-tier grandstand across the middle, deep blue sky above.

FORMAT MODE
One continuous shot, the camera does not cut on its own. Ends matching the end image exactly: white fabric pillar on the left, white canopy overhead, guests in caps at the rail in the lower right.

OPTICS
Phone wide lens, 63° field of view, rectilinear, deep focus.

CAMERA
Handheld at standing eye height inside the suite. Smooth fast pull-back and left pan at 15 km/h equivalent, strong motion blur during the middle of the move, settling for the last 0.5 s.

ACTION
Crowd members below shift their weight and turn their heads naturally. Guests at the rail stay seated and still, watching the hole.

LIGHTING
Hard midday desert sun from upper right, 5600K, crisp shadows; the canopy casts soft shade over the rail.

STYLE
Photoreal smartphone video, natural color, fine sensor noise.

POSITIVE LOCKS
Grandstand, canopy, pillar and rail geometry stay identical to the start and end images. The wall below the grandstand stays plain and blank. Every person keeps their clothing and position.
```

## Risks and rules
- **Invented people:** the in-between frames will contain generated crowd faces. Mitigation: it is used at about 1 s with motion blur, as a transition only. Never freeze-framed or captioned as real.
- **Disclosure:** realistic generated imagery of a real place and event, so **the platform AI toggle is ON for version C**, per `_servicepow/policies/realism-and-disclosure.md` §3. On-screen copy says nothing apologetic.
- **Marks:** the model may re-invent sponsor logos on the wall or boards. Inspect every frame and reject any output with a legible third-party mark (no blur allowed).
- **QA:** a full-size frame review, then the dual gate on the finished C cut.
- **Gate:** SPEND_APPROVER approval of the quoted price, per `_servicepow/policies/generation-and-spend.md`.
