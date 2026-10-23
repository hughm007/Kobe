---
title: "Ship every advert with its editable project; patching a rendered video is a last resort"
type: learning
client: tripnerd
owner: Karl
status: active
created: 2026-10-23
updated: 2026-10-23
tags: [video-production, delivery, text-fix, project-files, claims]
---

# Ship every advert with its editable project; patching a rendered video is a last resort

## What we did
The owner asked for one word to come out of TripNerd's Phoenix Open Reel: "16th Hole LOGE Suite" had to become "16th Hole Suite", on the ticket and on the shrunken corner card. Everything else had to stay identical.

Another session had built the Reel, and none of its project files, source clips or build scripts were in this repo on any branch. So the change was made on the rendered frames:
- **Tracking:** SIFT with a homography located the ticket in each frame.
- **Opaque frames:** the frame's own "Suite" pixels moved left by the width of "LOGE ". The vacated letters were refilled row by row from the plain background beside them.
- **Cross-fades:** the change was applied through a blend curve fitted per frame. For each fade frame, whichever candidate left the less residual was kept.

## What happened (FACT)
| Frame type | Frames | Result |
|---|---|---|
| Opaque ticket and corner card, any scale (incl. the 4–5× push-in and the checked-row highlight band) | 465 | Clean; original glyphs, so font, weight, colour and alignment match exactly |
| Cross-fades over a plain background (13.0 s fade, end-card fade) | ~14 | Clean |
| Cross-fade over a busy crowd shot (fade-in at ~7.9 s) | 6 (236–241) | A faint outline of the old word remains mid-dissolve |
| Audio | all | Stream copy, bit-identical |

What it took:
- **Effort:** about 2 hours of iteration.
- **Failed attempts first:**
  - a subtraction against a reference frame left ghosts, because the ticket drifts sub-pixel;
  - a linear-light blend model left a yellow cast and a ghost;
  - a texture-strip fill picked up the perforation and the wrong band colour.
- **Approval:** the owner approved the result.

**Sources:**
- the build record: `ServicePOW/Clients/TripNerd/05_Edit_Project/2026-10-22-phoenix-open-16th-hole-suite-fix/README.md`;
- the approval record: `07_Client_Approved/2026-10-23-phoenix-open-reel-31s.md`.

## What we think it means
- **Every delivered advert keeps its editable project in the client's 05 folder:**
  - the build script or editor project;
  - the source clips, fonts and logo;
  - the exact text strings.

  A wording change is then a re-render. Without it, it is a rescue with known limits. This is now the standing rule in `07_Client_Approved/README.md`.
- **Claim words go through the claims check before the first render.** "LOGE" was a product claim TripNerd didn't confirm, the same kind of error as "Suites" for Augusta. Each cost a revision after the client saw the work.
- **When a rendered-frame patch is unavoidable:**
  - **Move the advert's own glyphs;** never retype text in a lookalike font.
  - **Refill from the same frame, row by row.** That follows highlights, lighting and scale.
  - **Treat cross-fades separately, and say plainly that they are the weak point.** Over a busy background, a dissolve cannot be fully cleaned without the source layers.
- **Check the duration, not the filename.** The "25s" file ran 30.98 s.

**Confidence:** High for the mechanics (measured frame by frame). The rule is the owner's explicit approval condition only by inference; he approved the file without comment.
