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

## Frame 1 — the hook (aerial of the island green) — LOCKED 2026-09-23 (owner kept the recommended cut v2b: still 304 / Kling take 404, 3.3 s, both captions, ends wide)

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
**Locked as v2b.** Earlier open items, now closed by the lock: caption wording and whether to keep captions on the hook at all; final length (3.0–3.5 s); whether the drone should end closer to the suites (a second take can start from the same still).


### Frame 1 realism review (owner asked: "make sure there's no way you can make it better", 2026-09-23 evening)

**What was checked.** The first still (7dbb2185) was compared against the real layout, not just against oblique photos: public satellite tiles of the hole were stitched in the vendor sandbox at three zoom levels (media 40609fe3 / 734f17b0 / f45d6817, then re-centred ad4b9efe / 31348a51) and read next to the Commons photos (contact sheets b8547a8d, 94a84eb8). The tiles were captured mid build-out, so they also show where the hospitality structures and the grandstand really stand. The viewpoint of the frame is the classic behind-the-green position (18th-tee side, looking back toward the tee): walkway to the near-right bank, tree island one green-width beyond on the left, tee-side suites across the water. That part was right.

**Two errors a golf fan would catch in the first still:** the walkway was a long wide grass tongue (real: a short narrow bulkheaded neck) and the front pot bunker was missing.

**Fix: four new Nano Banana 2 4K stills, same layout text.** 301/302 went out without references by mistake; 303/304 carried the 2014 photo, the satellite tile, a CC BY-SA sunset photo of the green (imported 075709df, reference only, not in the ad) and the public-domain aerial. Result: 301 and 304 are accurate (bunker, short walkway, crisp bulkhead planks); 303 put a crowd on the walkway (wrong, and an LB25 risk at 4K); 302 drew the walkway as a plank dock. The model's own memory of this landmark carried the geometry; the references mostly imported crowd from the reference photo. Learning filed: `knowledge/learnings/2026-09-23-famous-landmark-model-memory-beats-references.md`. Comparison sheet: `…/b30b9118-4ffe-4910-a011-c38c0911a938.jpg`.

**Two Kling 3.0 4K takes** (30 credits each, same forward-drift-and-rise prompt): 401 from still 301 (job 7feba77f) and 404 from still 304 (job bb4eb9ba). Frame sheets: `…/2c94bb16-9301-4d2b-b840-735c22e6c158.jpg` (401), `…/18b9b39b-f356-4afc-925a-508129788744.jpg` (404). Both hold geometry for the full 5 s; no morphing seen on the 0.25 s sheets.

**Previews (0.0–3.3 s, 1080x1920, 24 fps, captions composited, native ambience normalised to −16 LUFS; audio not heard, LB29):**
- **v2b (recommended)** from still 304 / take 404: `https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/7636b096-aa84-4962-939e-1f7257770019.mp4` — green large in the lower half with readable bulkhead planks and grass texture, pot bunker, short walkway, tree island centred, suites across the top for the whole shot.
- **v2a (alternate)** from still 301 / take 401: `https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/c89d5283-7953-4c7c-9aa5-a7bfefd1ded3.mp4` — the postcard angle: whole hole with the walkway landing on the near bank, faster drift, the green leaves the bottom of frame by 3 s.
- QC strips of both previews: `…/cf28b6b1-d8bd-45c3-b0de-6c0b7fe871c1.jpg`.
- The v1 preview (`…/789bcb9e…mp4`) is superseded but kept.

**Real footage search (FACT):** Adobe Stock has no TPC Sawgrass footage or stills (searched, generic courses only). Flickr aerials of the hole are all-rights-reserved or non-commercial. Wikimedia Commons has no video and no tournament-day aerial. Getty has editorial drone stills, unusable for an advert. So the frame stays generated and disclosed; real client footage would still replace it if TripNerd has drone of the hole.

**Spend for the review:** 72 credits (7,917.04 → 7,845.04): 4 stills at 3 each, 2 Kling 4K takes at 30 each. Frame 1 total to date: 316 credits.

## Frame 2 — the arrival (after the aerial) — IDEATION, five flow options put to the owner 2026-09-23
See the owner message of this date; the log is updated once an option is chosen.

## Assets that carry over unchanged if the owner keeps them
Door approach (real sign photo clip s01), 10 s continuous walk-in (w0), static putter (s03), single stroke (s05), real-speed ball drop (b1), cup thrust and turn (c1), commentator lines (Barrett preset, hushed controls), roar (roar1), owner end-card line (me1). Each will be re-presented as its own frame for lock.

## Owner photo library
FACT: this session has no connector to Apple Photos or iCloud; it cannot see the owner's Photos app. Google Drive is connected: a shared folder of the TripNerd photos and videos can be read from here and pulled into the build.
