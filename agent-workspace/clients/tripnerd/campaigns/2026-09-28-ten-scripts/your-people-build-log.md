---
title: "TripNerd — YOUR PEOPLE — frame-by-frame build log"
type: production-log
client: tripnerd
campaign_id: 2026-09-28-ten-scripts
created: 2026-09-28
updated: 2026-09-28
---

# YOUR PEOPLE — build log

Built one frame at a time with the owner, who approves each frame before the next. Brief:
`your-people-frame-by-frame.md` (v9). Balance at start: 12,824 credits (live, 2026-09-28).

## Live tool facts found during the build
- **FACT (2026-09-28):** Nano Banana 2 rejects the `mask` media role ("Unknown media role: mask") at both
  cost check and generation, although `models_explore` lists it. Masked edits in the brief (F7 end still,
  F8 end still) are done instead as a whole-image edit, then only the masked patch is composited back onto
  the approved still in the Higgsfield sandbox (feathered 4 px), so every pixel outside the mask is unchanged.
- **FACT:** Nano Banana 2, 4k, one image = 3 credits (live cost check).

## F7 master still
| Item | Value |
|---|---|
| Source | Made earlier today in ChatGPT + Higgsfield: `fea8b8f3` → `813e4cb8` → `38971ee2` → `1fc54fea` → `65a347b3` → `5045d452` (GPT Image 2.5 edits, 3840x2160) |
| Checks passed | six in order and colours; columns both ends and top frame; caps forwards, guest 4 bare-headed, hand in pocket; son's hand on dad's far shoulder, five normal fingers; all backs to camera, equally sharp; no lettering on clothes; background unreadable; open-shade light |
| Faults found at zoom | a fragment of a third cup across the woman's forearm; a white napkin-like smudge on the black ledge |
| Fix | two Nano Banana 2 edit takes (`f6950e94` used, `889b5aac` rejected: fleck and smudge remained), 6 credits; patches composited at (918–958, 1112–1180) and (898–976, 1390–1428) |
| Result | **F7 master v2**: PNG media `6551ac57-4ce2-4ff6-86ab-b6e04310578c`, JPEG `a508efb8-e5f3-49bf-9fea-fbb3f46a6390` |
| Open judgment calls | the island green itself is not identifiable (view reads as water, green bank, grandstands); the soft foreground shoulder is only a sliver, so the occlusion beat will not read |
| Status | **APPROVED by owner 2026-09-28**; both judgment calls accepted |

**Owner direction (standing, all later frames):** wherever the green or course shows, it must read as the 17th,
or at least as a tournament course of the kind TripNerd sells packages for (water, the green's wooden edge,
packed grandstands).

## F7 end still (dad's head tipped toward his son)
| Item | Value |
|---|---|
| Prompt route | two Nano Banana 2 takes (`94b53f23`, `1aee99b1`) **rejected**: both turned the head into profile (brim and cheek visible) instead of a 15° tip |
| Method used | geometric: dad's head cut out (OpenCV GrabCut in the Higgsfield sandbox), rotated 15° toward the son about the base of the neck, background behind it cloned level from the adjacent soft grandstand; then a Nano Banana 2 blend pass on that guide (`ec221f28` used; `6bc8d060` straightened the tip, not used; earlier pass on a rougher guide `bcfa871a`/`253cec3b` kept a tilted background band, not used); only the head area of the blend pass composited onto master v2 |
| Result | **F7 end still**: PNG `0acd03d4-aae1-4598-bc82-f52cac2b32a4`, JPEG `b4d3f303-badb-4955-968f-7de2f873e656`; pixels outside (2977–3422, 486–891) identical to master v2 |
| Checks | back of cap still to camera, no face, collar and son's hand unchanged, background level, neck joins collar |
| Status | **APPROVED by owner 2026-09-28** |

## F7 animation
| Item | Value |
|---|---|
| Settings | Kling 3.0, mode 4k, sound off, 4 s, 16:9, start = master v2 `6551ac57`, end = end still `0acd03d4`; brief's F7 motion prompt; Higgsfield's "IN THE DARK" preset suggestion declined |
| Live facts | **FACT:** 24 credits per 4 s take; `end_image` works in mode 4k (the brief's untested point is now tested); output 3840x2160, 24 fps, 97 frames, 4.04 s |
| Take A | `0af7b910-294d-4937-9c69-28fe1b7d5235`: head lean slow and continuous from ~1.0 s to the last frame (still moving at the cut) |
| Take B | `d1c0aede-24f8-4cff-a100-d13d9861f99f`: head still until ~2.5 s, deliberate ~1 s lean, settled by 3.5 s; brim edge peeks a few px during the lean |
| Checks (both) | first frame = master, last frame = end still (mean diff 2.8 / 2.7, compression level); static structure drift ≤0.17 px (camera locked); other five heads change ≤1.8 (breathing only); no warping of cap, hair, neck or son's hand in mid-motion frames |
| Recommendation | Take B: the lean lands just after "Bring your people." (22.05) and settles 0.5 s before the cut to F8 |
| Status | **REJECTED by owner**: "looks very fake… everyone not move and just the older man tilt his head… basic, boring, not realistic". Director agrees: both takes break the brief's own "no figure frozen like a mannequin" rule (other five heads change ≤1.8 over 4 s). Root cause: the locked start/end method left the generator no room; the stillness concept was over-tightened across eight risk rounds. |

## Real client footage: how guests actually behave (studied 2026-09-28, owner's instruction)
Sources in Higgsfield media: `d925d5be` (= V23, 54 s, 720x1280, suite walk-through) and `2911d9d6` (= V24, 31 s,
suite view of the 17th, the roar). Other client phone clips: `45e0a985`, `2585923a`, `e037067e` (walking in the
gallery). Reading only; faces are real guests and never go to a generator.
- **FACT:** guests are never a still line. Within any 5 s: weight shifts, a head turns to the neighbour and back,
  a drink lifts, a hand goes to sunglasses or cap, a glance over the shoulder (V23 41–48 s).
- **FACT:** pairs and threes talk sideways, heads turned toward each other, bodies still facing the green (V23 41–43 s,
  49–51 s).
- **FACT:** at the front ledge people lean on forearms or perch on high stools; drinks sit on the ledge (V23 50–53 s;
  V24 0–1 s).
- **FACT:** the arms-up reaction happens in the gallery below; in the suite the reaction is smaller: standing
  taller, leaning forward, turning to each other (V24 15–19 s).
- **FACT:** even a guest simply watching sways and moves his hands (V23 43–48 s).
- **FACT:** the real view from the suite shows the lake and the island green (a small green ringed with yellow
  flowers) with grandstands behind (V23 29–36 s, V24 8.5–9 s).

## F7 animation, round 2 (reactions from the real footage)
| Item | Value |
|---|---|
| Method | start image only (master v2 `6551ac57`), no end image, Kling 3.0 4k, 5 s, sound off, locked-off camera (push stays in the edit); scripted small reactions taken from the footage above; faces kept away from the camera; no generated clapping (house rule, owner agreed) |
| Cost | **FACT:** 30 credits per 5 s take (live); two takes = 60 |
| Takes | C `0f0bdb10-d94f-4294-895e-b05b79c27baf`, D `76e7a550-51ad-4cc2-84f7-9a327fc34f90` (both 3840x2160, 24 fps, 121 frames) |
| Checks | all six now move (head-region change 20–87 vs ≤1.8 in round 1); camera drift ≤1 px; no single-frame pops except the son's arm re-wrapping at 2.5 s (C); cups upright; son's and dad's faces hidden in C |
| Take C | reactions start ~1.0 s; client nods and straightens; the woman turns to the man in white (profile with a smile visible for ~1 s at 1.5–2.0 s), then puts her arm round his waist; he drinks; brother-in-law leans on the rail; son pulls dad in until their heads touch (3.5–5.0 s), faces hidden |
| Take D | similar, but dad turns into a smiling three-quarter profile at 2.5 s (a generated face performing emotion) and ends in a two-armed hug; rejected on the face |
| Recommendation | Take C, used 1.0–5.0 s. Flags for the owner: the woman's smiling profile (~1 s, small in the wide frame); the pair now reads as a couple. C's head-to-head ending is the payoff the brief gave to F8, so F8 is up for review. |
| Status | awaiting owner decision |

Spend so far this build: 132 credits (24 stills, 48 F7 round 1, 60 F7 round 2).

**Learning:** asking the image model to "tip the head" produces a turn toward profile. A geometric rotation plus a
blend pass holds the exact angle. Use the same route for F8's end still (the son's 30° turn).

