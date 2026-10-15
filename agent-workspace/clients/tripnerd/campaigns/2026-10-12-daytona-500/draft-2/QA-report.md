# TripNerd Daytona Beach Reel: Draft 2 QA report and grade

**Status: NOT publish-ready.** Draft 2 is technically complete, and both photos are in. It scores **64/100**, which is below the 70 revision band. Guest consent and the 2027 offer are still unconfirmed by TripNerd (section 6).

**What changed from Draft 1** (owner direction, 15 Oct 2026):
1. **Photos A and B** are now in beats 4–5. They are the originals from tripnerd.com, with checksums matching the website files.
2. **No person is blurred.** Removed:
   - all 10 face masks;
   - the 4 masks that covered people's clothing (two crew firesuits, a "43" hoodie, an official's jacket).

   Only third-party logos, signs and screens are masked.

**Checked on the rendered MP4** `TripNerd-Daytona-Beach-Reel-DRAFT-2.mp4`, with every frame extracted.

## 1. Grade (TripNerd 100-point rubric, same one used for the scripts)

| Category | Pts | Draft 1 | Draft 2 | Evidence (Draft 2) |
|---|---|---|---|---|
| 1. Hook (first 1–3 s) | 20 | 13 | 13 | Real night pit-road pan with real sound and a "Sound on" cue. But it is a 720p source, logo blur patches sit on the pit boxes, and the line is an instruction, not intrigue |
| 2. Storytelling and retention | 15 | 6 | 10 | The arc now plays through: Draft 1 had 5.5 s of grey slates mid-video. Time order still jumps: 2024 night → 2024 day → 2023 4:54 PM → 2023 6:56 PM |
| 3. Brand recognition | 15 | 8 | 8 | TripNerd first appears at 14.0 s (end card). No brand cue in the first 3 s |
| 4. Emotional appeal | 15 | 6 | 10 | Guests are visible: headsets on, watching, filming the burnout. There is still no reaction shot, and hospitality/comfort is shown only by cups on the counter |
| 5. Authenticity | 10 | 7 | 8 | All real media, with year labels matching the source dates (photos EXIF-verified). Blur patches still make the video beats look edited |
| 6. Visual and audio quality | 10 | 4 | 5 | Sources are enlarged: V05 1.5×, V06 2.7×, photos 2.5×, with conventional scaling only. Large blur patches show in beats 1, 3 and 6. Audio is real, continuous, −13.9 LUFS |
| 7. Engagement | 5 | 3 | 3 | Closing question "Where would your crew sit?" |
| 8. Call to action | 5 | 3 | 3 | End card "tripnerd.com" plus the caption link in bio. No action verb, and no confirmed offer behind it |
| 9. Reels optimisation | 5 | 3 | 4 | Full-bleed 9:16 throughout, text inside the safe band, 16 s |
| **Total** | **100** | **53** | **64** | Draft 1 was below 70 (rewrite band). Draft 2 is also below 70, 6 points short of "revisions required" |

**Why the finished video scores below the v6 script (76):**
- The script grade assumed TripNerd would be named by 3 s and that the pictures would be clean.
- The render shows the cost of 720p footage around pit boxes covered in sponsor marks.
- The production-brief text never names TripNerd before the end card.

**Highest-value fixes (estimates):**
1. **Brand in the first 3 s** (+3–4): for example, the TripNerd logo or "TripNerd guests" on beat 1. This needs no new material.
2. **Fix the time order** (+1–2): run 4:54 PM → 6:56 PM → night, or drop beat 3. The photo-to-video order is a choice; the years stay labelled either way.
3. **Original-resolution video from TripNerd** (+2–3): tighter logo masks and sharper beats 1, 3 and 6.
4. **Written confirmation of the 2027 offer**, so the end card can carry an action line such as "Plan your 2027 trip" (+2–3).

## 2. Technical checks (measured)

| Check | Result |
|---|---|
| Duration | 16.000 s, matching across container, video and audio ✅ |
| Video | 1080 × 1920, H.264 High, yuv420p, 24 fps, 384 frames ✅ |
| Audio | AAC 48 kHz stereo 192 kbps. −13.9 LUFS integrated, true peak −3.3 dBFS ✅ |
| Seam (7.0–7.5 s) | Largest sample step 0.065 (0.123 elsewhere), so no click. No silent gaps ✅ |
| Text inside y 288–1344 | All boxes in band ✅ |
| Words per card | 2 · 5 · 4 · 3 · 5 · 5 · 6 (counts include year labels) ✅ |
| Banned language (video + caption) | None ✅ |

## 3. Beat by beat

| # | Output | Source | On-screen text |
|---|---|---|---|
| 1 | 0.0–2.0 | V05 frames 72–119 | "Sound on. 🏁" |
| 2 | 2.0–4.5 | V05 frames 0–59 | "Night over pit road." · 2024 |
| 3 | 4.5–7.0 | V06 frames 60–104, centre crop, 60% speed | "Daytime. Engines on." · 2024 |
| 4 | 7.0–9.5 | **Photo B** `tripnerd_gallery_07.jpg` (EXIF 2023-02-19 16:54:45 −05:00). Crop x 560–994, static | "4:54 PM." · 2023 |
| 5 | 9.5–12.5 | **Photo A** `tripnerd_gallery_05.jpg` (EXIF 2023-02-19 18:56:07 −05:00). Crop x 350–784, static | "6:56 PM." / "Still filming." · 2023 |
| 6 | 12.5–14.0 | V05 frames 204–239 | "Where would / your crew sit?" |
| 7 | 14.0–16.0 | End card: original logo on #5896E9 plate, navy #202838 | "Daytona Beach plans · February 2027" / "tripnerd.com" |

**Photo files:**
- Photo A md5 `fd62449bc6df2137685ae5c4aedf0757`, Photo B md5 `65870483ae99c3d48ab1da7ef6ef2eed`. Both are 1024 × 771, Pixel 6 Pro, and identical to the files on tripnerd.com.
- **Photo A crop:** moved right of the planned framing, so the Sunoco sign is out of frame instead of showing as a large grey blur. The new framing centres the burnout car and a guest in a headset filming it.

## 4. Masks (logos only)

| Area | Masks |
|---|---|
| Video beats | Unchanged logo and sign masks from Draft 1 (pit-box sponsor marks, Sunoco, screens, tower/wall lettering, Team Penske, scanner, bottles) |
| Coca-Cola can, beat 2 | Tightened to the can: the old loose mask looked like a blurred head |
| Photo B | Menards lettering (×2), Hendrick Motorsports banner, two Coca-Cola cans, "LEGACY" team lettering (letters only) |
| Photo A | Cap emblem, bag lettering, cart lettering |

**Left visible by decision:**
- the car livery in Photo A (no readable sponsor text);
- a guest's shirt print (unreadable);
- phone screens (they show the race, no branding).

**Now unmasked because they are on people:**
- crew firesuit patches, the "43" hoodie graphic and the official's jacket in beats 1 and 3;
- at this resolution none of them is readable as a brand at normal viewing size.

**One limit of this check:** reviewed at 1:1 and 2–3× on sampled frames, not frame by frame for beats 1, 3 and 6. Those beats' logo masks are the same as Draft 1, which was swept at the time.

## 5. Audio
Unchanged from Draft 1:
- Real V05 sound runs throughout, with the seam crossfade at 7.0–7.5 s inside the Photo B beat.
- It tapers under the end card, from −21 dB at 14 s to −40 dB at 16 s.
- Measured only. **Not heard by ear.**

## 6. Open before publishing
1. **Guest consent.** People are no longer blurred, by owner direction. That overrides the production brief's original "no identifiable faces" rule.
   - The Drive READ ME still says media stays internal until TripNerd confirms guest consent and venue use.
   - TripNerd publishing Photos A and B on its own site supports their use but is not documented consent. V05 and V06 have no consent record.
2. **The caption says "Real TripNerd guests."** That claim is now supported by Photos A and B (TripNerd's gallery). It is not established for the people in V05/V06.
3. **Brand colours** (navy #202838 is marked INFERRED in the brand guide) need TripNerd's confirmation.
4. **Score 64 is below the 70 revision band.** Apply fix 1 (brand in the first 3 s) and fix 2 (time order) before sending to TripNerd.
