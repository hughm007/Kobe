---
title: "TripNerd — YOUR PEOPLE — frame-by-frame build log"
type: production-log
client: tripnerd
campaign_id: 2026-09-28-ten-scripts
created: 2026-09-28
updated: 2026-09-29
---

# YOUR PEOPLE — build log

**CLOSED 2026-09-29: concept killed by the owner after cut v1. Kept as a record only.**

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
| Status | **APPROVED by owner 2026-09-29: Take C, use 1.0–5.0 s** |

## Status check in Higgsfield (2026-09-29, live)
Balance 12,494.39. A parallel session (ChatGPT, 2026-09-29 17:43–18:07 UTC) added, not yet reviewed here:
F1 animation `4a88d0b9` (from still `b925a1b6`); F2 still fixes `6bc5d061` → `35fc8f2b` and animation `533aefc4`;
F3 animation `35724e68` (from `bb3e823c`); F5 animation `abff2da3` (locked 3 s, from `44349026`); F4 generated
fallback still fix `ac6e7f7a` (from `2a11b105`); its own locked F7 `8e04c238` (end `523943a7`, from the old master;
superseded by Take C). Stills still unanimated: F6 `7578680b`, F8 start `8afce220`. All of these stills were made from
the old master `5045d452`, not master v2.

## F6 animation (son and dad, the held breath)
| Item | Value |
|---|---|
| Start still | ChatGPT's `7578680b` had dad on the left of his son, the reverse of F5 and F7 (screen-direction break). Fixed by mirroring (soft background, no text): `3a442d8e-9aa3-4c26-968f-d14bee61d23b` |
| Round 1 | Kling 3.0 4k, 3 s, sound off, start image only, 2 takes (36 credits): A `e35ec584-56db-4036-b51e-cc5b8aa6ea3c`, B `66850040-dd38-4d7d-b542-b32223dad60f` (3852x2152, 73 frames) |
| Take B timing (FACT, frame sheet) | dad's chin lift 2.3–2.7 s; son's hand lifts for a shoulder tap only at ~2.9 s; the clip ends at 3.04 s, so the tap never lands |
| Owner direction (2026-09-29) | prefers B if the shoulder tap completes before the clip ends |
| Round 2 | (a) two 5 s retakes from the mirrored still with the tap placed mid-clip: `2e3e76f1-47b3-4c11-b8dd-91667cc6834d`, `f33ce30e-554c-40a9-be56-19ee2d5b0ee4` (60 credits); (b) two 3 s continuations of Take B from its frame 66 (2.75 s, before the hand lifts; media `0b87f34e-dc1b-4ae0-85f8-7b4ded4004d0`): `574d220d-ec68-4726-8c4f-b44463ee8c1e`, `8934a4b9-7426-4d8f-a1fc-9028b33e6aaa` (36 credits) |
| Edit slot | F6 grows from 2 s to 3 s (18–21) because F7 uses only Take C 1.0–5.0 s (4 s, as approved) at 21–25 |
| Round 2 checks (FACT) | continuation 1 (`574d220d`) joined as B frames 0–65 + continuation: seam frame difference 2.85 vs 2.25–2.9 between B's own frames; camera push continuous across the join (drift -0.52 px vs -0.68 before, -0.65 after). Continuation 2 (`8934a4b9`) stalls the push for one frame after the join. In both, the son's hand lifts to about head height between pats (three pats in 1, at ~3.8–4.6 s of the joined clip). Retake r1 (`2e3e76f1`): smaller tap at ~3.6–4.3 s, then the hand rests. Retake r2 (`f33ce30e`): quick tap at ~3.0–3.7 s. Only the hand region of r1/r2 was checked. |
| Previews | B + tap, join 1 (recommended): media `bb4455ec-11bd-4eba-8b80-848d3d7f948e` (1920x1080, 5.79 s); join 2: `02a9ecef-e1d7-4377-adb0-24456dd2a74f` |
| Planned edit window | joined clip 2.0–5.0 s (chin lift 2.3–2.7, pats 3.8–4.6, settle) |
| Status | **APPROVED by owner 2026-09-29: join 2** (B frames 0–65 + continuation `8934a4b9` frames 1–72). Its first frame (a near-duplicate of B's frame 66) is dropped, which removes the one-frame stall in the push. Used 2.0–5.0 s = B[48:66] + continuation[1:55]. |

## Voiceover (seed_audio, REAL-Wyatt), whisper screen (FACT)
| Line | Takes | Screen |
|---|---|---|
| 1 client | `d97fcc8a`, `08e612e5` | both correct words; both hold a long pause before "for a year" (~1 s and ~2 s), to be tightened in the edit |
| 2 the two | `47a503ac` (1.28 s), `25056a7b` (1.32 s) | both correct |
| 3 brother-in-law | `69b4927f`, `b6eaf7c7` | 69b4927f transcribes as "showed up" (rejected); b6eaf7c7 correct, 4.6 s with a 0.86 s pause after "brother-in-law" |
| 4 dad | `bfb140cc` (1.34 s, peak -0.2 dBFS) | correct; the 429 take never ran |
| 5 bring your people | `3fadb631` (1.56 s lead-in), `6b7c879d` (peak -0.0 dBFS) | both correct |
| 6 hospitality handled | `4c7bce28` (no pause, 2.52 s), `a2726b57` (1.26 s pause; transcribes as "Handle.") | 4c7bce28 safer on the last word |

## Cut v1 (assembled 2026-09-29, Higgsfield sandbox; script `your-people-cut-v1.py`)
| Item | Value |
|---|---|
| Timeline | F1 0–4.25 (`4a88d0b9` 0–4.25 s) · F2 4.25–8.25 (`533aefc4` 0–4.0) · F3 8.25–12.75 (`35724e68` 0–4.5) · F4 12.75–15.00 (still `ac6e7f7a`, brief fallback 2: blur ramp over 0.15–1.15 s + 3 % push) · F5 15–18 (`abff2da3`, 105 % push) · F6 18–21 (approved join 2, 2.0–5.0 s) · F7 21–25 (Take C 1.0–5.0 s, 108 % push anchored upper-right third) · F9 25–30 (card `4824f6d7`, 2 % push). F8 cut per the brief's fallback; hard cuts throughout |
| VO (REAL-Wyatt) | placed at 0.40 (`d97fcc8a`, ends 3.90), 4.60 (`47a503ac`, 5.74), 8.60 (`b6eaf7c7`, pause 0.76→0.40 s, 12.70), 13.10 (`bfb140cc`, pause 0.67→0.30 s, 14.60), 23.05 (`3fadb631`, 23.95), 26.40 (`4c7bce28`, own 0.99 s pause kept, 29.18) |
| Captions | Montserrat ExtraBold 46 px (the only weight installed in the sandbox), white, lower left at the 10 % title-safe line, 60 % soft shadow; on with each line, off 0.3 s after it; none on the card (the card carries its line) |
| Sound bed | client audio V24 only, no library audio. Murmur: V24 19.0–28.0 → 0–9.0; V24 0.0–3.8 → 8.8–12.6; V24 21.5–26.95 low-passed, -4 dB falling to -14 dB → 12.4–17.95. Hush, rise and roar: V24 10.15–22.35 → 17.80–30.0 (V24's roar break 13.35 s lands on the F7 cut at 21.00), -12 dB hush to 19.4, rising to full by 20.95, fading after 24.8 to -26 dB by 26.2. Ducks -3 dB under each VO, -6 dB under "Bring your people." |
| Master (FACT, measured) | video 1920x1080, 24 fps, 720 frames, 30.00 s, H.264 yuv420p bt709, faststart; audio AAC 320k: **-14.21 LUFS, -1.30 dBTP**, LRA 17.4 (peak limiter + linear gain, so the hush-to-roar range survives) |
| Speech check (FACT, whisper on the master) | only the six scripted lines are recognised, in order; no other intelligible words in the bed |
| Deliverable | media `fe4d67c6-5383-4cb2-b717-71999781c0cc` (61 MB); review sheet `613fc6b1` |
| Not done | no human listen yet (VO and bed judged by transcript and levels only); no grade pass beyond one fine grain (all shots share the master's lineage); the 9:16 version; Skeptic Pass 3 and the critic verdict |
| Status | **REJECTED 2026-09-29: owner killed the whole concept** ("sucks, i hate it scratch the whole advert idea"). Build closed; no further spend. |
 (this session): 264 credits (24 stills, 48 F7 round 1, 60 F7 round 2, 36 F6 round 1, 96 F6 round 2); VO 3.3. Assembly: 0 credits.

**Learning:** asking the image model to "tip the head" produces a turn toward profile. A geometric rotation plus a
blend pass holds the exact angle. Use the same route for F8's end still (the son's 30° turn).

