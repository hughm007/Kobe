---
title: "Reference frames described from memory were wrong; view every reference at full size before citing or attaching it"
type: learning
client: tripnerd
owner: Karl
status: active
created: 2026-09-28
updated: 2026-09-28
tags: [storyboard, references, real-reference-law, generation, marks, skeptic]
---

# Reference frames described from memory were wrong; view every reference at full size before citing or attaching it

## What we did

TripNerd YOUR PEOPLE storyboard (a 30 s generation-first spot for ChatGPT + Higgsfield). Four frames were cropped
from the owner's real suite footage to remove a burned-in caption. They were then listed as "clean" generator
references, each with a one-line description. Those descriptions were written from memory of thumbnails and never
checked against the frames at full size. Five isolated Skeptic Pass 1 rounds judged the storyboard. None of them
could see the frames, only their descriptions.

## What happened

In round five the Skeptic flagged, in general terms, that "clean" frames might still carry in-scene marks. The
Director then viewed all four frames at 1280x600 for the first time.

| Frame | Described as | Actually shows |
|---|---|---|
| `4ec88dba` | "A real guest at the window, from behind" | The big screen with three real players' headshots and broadcast graphics; no guest |
| `4c463ea4` | Rail, ledge, column, green | All of that, plus the big screen, the roof flags and a labelled water bottle |
| `7c9be9e1` | The view, plus "a light suite chair back lower left" | The view and a real guest; the "chair" is an unclear grey arch down in the crowd |
| `fe30cf32` | "The tree island with the yellow ring" | A real guest's head at a window column; no tree island is visible |

The consequences:
- `4ec88dba` was listed for attachment on F1 and F5. The generator would have received real player faces and
  broadcast graphics.
- A chair used as the foreground occlusion in three shots had no real reference at all.

**Source:** the storyboard v1–v5 reference tables compared with the frames viewed full-size on 2026-09-28. Details
are in `clients/tripnerd/campaigns/2026-09-28-ten-scripts/campaign-bible.md` §14 (fifth run, Director's finding).

## What we think it means

- **A reference citation is only as good as the last time someone looked at the pixels.** The Real-Reference
  Law's "the citation is the evidence" fails silently when the citation's description is wrong.
- The isolated Skeptic cannot catch this. It judges the packet's description, not the image.
- **The fix is procedural.**
  - Before a frame is cited or attached, the Director views it at full size.
  - Any mark, screen, flag, label or real person is cropped or blurred out, and the cleaned crop gets a new media
    ID.
  - The original frame is listed as never-attach.
- This took one sandbox call and no credits.

**Confidence:** High for this case (every error is verifiable against the frames). Medium that it generalises. It
will recur whenever references are catalogued from thumbnails.

## What changes

The YOUR PEOPLE brief v6 attaches only three mark-free crops (R-VIEW `1f4a5b57`, R-FRAME `2f8b2d78`, R-RAIL
`6a26be6c`). All four source frames are never-attach, and the chair was removed. Candidate for the storyboard
playbook: **"view every reference at full size before citing it"**. Promote it if it recurs.
