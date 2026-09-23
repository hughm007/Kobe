---
title: "TripNerd — 17th-hole advert v6, frame-by-frame build log"
type: deliverable
client: tripnerd
owner: Karl
status: in progress — frames are locked one at a time with the owner
created: 2026-09-23
updated: 2026-09-23
tags: [client, deliverable, video, 17th-hole]
supersedes: 2026-09-23-17th-hole-v5.md (method change: owner and agent lock each frame together before moving on)
---

# v6 frame log

Working method from 2026-09-23 evening: one frame (one clip, 3–5 s) at a time, built, watched by the owner, corrected, locked, then the next. Nothing is assembled until all frames are locked.

## Frame 1 — the hook (aerial of the island green) — PROPOSED, awaiting owner lock

**Why this hook (agent's call between the two owner-approved options):** the muffled-roar-behind-the-door hook is audio-led, and most social viewing starts muted; the island green from the air is recognisable to a golf fan in under a second with the sound off, and environments plus camera moves are the models' strength. The muffled-roar idea is kept for frame 2 (the door) as a sound bridge.

**Preview (3.3 s, 1080x1920, 24 fps, captions composited):**
`https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/789bcb9e-da27-4922-9c17-6d67a92dc671.mp4`
QC frame strip: `…/b04e9b9c-ddab-46df-bf16-5a5c64b5f3c5.jpg`

**How it was made (still-first, then animate):**
1. Real references from Wikimedia Commons: an aerial of the hole (`TournamentPlayersClub Sawgrass17thHole.jpg`, public domain, imported as e8f362f0) and two elevated tournament-day photos from the 2014 Players set (CC BY 2.0, watermark band cropped off before use; 33fe5c97, db720ce7), plus the crowd panorama already on file (32591000).
2. Three stills generated against those references; the Nano Banana Pro 4K still (job 7dbb2185) matched the real geometry (island, bulkhead, walkway, tree island with red flowers, suites across the water) and was chosen over a Seedream still (stylised suites).
3. The chosen still animated at 4K by Kling 3.0 (job d55620e3, 2148x3856): a slow forward drift and rise. The Gemini 4K take from the same still (3ee9960b) broke continuity at 3.3 s and was rejected. Two direct reference-to-video takes without a still (Seedance b013d38d, Gemini 900ba5a2) were geometrically weaker.
4. Used 0.0–3.3 s of the Kling take, downscaled to 1080p, no grain, CRF 15. Captions "You know this hole." (0.5–1.9 s) and "You've never sat here." (1.9–3.25 s). Native ambience only (wind, distant murmur).

**Rules:** LB24 no marks generated (suites' banners plain); LB25 no faces (people are dots); LB30 real references drove the still; no claims.
**Spend for frame 1:** 244 credits (8,161.04 → 7,917.04): 4 video takes at 4K/1080p, 3 stills, 3 exploratory takes.
**Open on this frame:** owner watch; caption wording and whether to keep captions on the hook at all; final length (3.0–3.5 s); whether the drone should end closer to the suites (a second take can start from the same still).

## Assets that carry over unchanged if the owner keeps them
Door approach (real sign photo clip s01), 10 s continuous walk-in (w0), static putter (s03), single stroke (s05), real-speed ball drop (b1), cup thrust and turn (c1), commentator lines (Barrett preset, hushed controls), roar (roar1), owner end-card line (me1). Each will be re-presented as its own frame for lock.

## Owner photo library
FACT: this session has no connector to Apple Photos or iCloud; it cannot see the owner's Photos app. Google Drive is connected: a shared folder of the TripNerd photos and videos can be read from here and pulled into the build.
