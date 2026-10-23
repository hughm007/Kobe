---
title: "TripNerd Phoenix Reel 3 'Your Ticket In': build record"
type: report
client: tripnerd
owner: Karl
status: draft
created: 2026-10-20
updated: 2026-10-20
tags: [client, phoenix-open, reel, build, ai-shot-1]
---

# "Your Ticket In": owner brief 2026-10-20

**Spec:** 16.5 s, 495 frames, 1080x1920, 30 fps.

**INTERNAL AI NOTE:**
- **Shot 1 (0.0–1.2 s) is AI:** a still of the first frame of Wyatt's Higgsfield drink+ticket clip (the start image was GPT Image 2.5, job `a5697fad…`).
- Everything else is real footage or overlay graphics.
- Per the owner, there is no on-screen AI label.

## Deviations from the brief (with reasons)
1. **V01 starts at 2.45 s, not 2.0 s.** The pole crosses the frame from 2.0 to 2.4 s, and the brief says to cut before it. From 2.45 s the pan runs the desert into the 16th green (green from about 4.4 s).
2. **The drop sits at 7.9 s.** The real crowd roar in V03 starts at about 4.8 s raw. Sand contact is at about 2.87 s raw, not 2.6 s, so the "This is the 16th." card lands at 5.97 s.
3. **Source paths** (`/workspace/...`) don't exist in this environment. The same files are used from session uploads: V01 = `IMG_0075`, V03 = `IMG_0112`, P05.

## Blocking assets (preview has marked slots)
- **The AI first frame:** Higgsfield's CDN isn't reachable from this container.
- **Guest photos 3 and 4:**
  - Drive `phoenix-open` has P001 and P052–P060, but the connector returns only inline base64 (about 1 MB each, not feasible).
  - Local Phoenix photos with faces: only P05 and P02 (P03, P04, P08 and P09 are backs).
- **Wyatt's Pixabay track:** `mixR6.py` takes the file and a start offset.
- **Drive link:** the connector can't upload a file this size.

## Claim flag
**"Food & drink included."** is an offer claim with no Evidence Record (`_servicepow/policies/claims-and-proof.md`). It needs Jason's written confirmation before posting.

## Photos used so far
1. P05 (owner-mandated): crop centred left, three guests, one with a drink, mostly profile.
2. P02 (cleaned): the smiling guest, thumbs-up.
