# TripNerd Daytona Beach Reel: Draft 1 QA report

**Status: NOT publish-ready.** Two required assets (Photo A and Photo B) could not be accessed. Beats 4–5 are labelled placeholder slates. Consent and claim checks are also open (see section 4).

**Checked on the rendered MP4** `TripNerd-Daytona-Beach-Reel-DRAFT-1.mp4` (every frame extracted from the export), not on the timeline.

## 1. Technical checks (measured)

| Check | Result |
|---|---|
| Duration | 16.000 s (container, video and audio) ✅ |
| Resolution and aspect | 1080 × 1920, 9:16 ✅ |
| Video | H.264 High, yuv420p, 24 fps, 384 frames ✅ (V05's native rate is 24 fps; V06 is 30 fps, sampled down) |
| Audio | AAC, 48 kHz stereo, 192 kbps ✅ |
| Loudness | −13.9 LUFS integrated; true peak −3.3 dBFS (no clipping) ✅ |
| Text inside y = 288–1344 | All boxes in band, including the year labels, the end-card text and the logo ✅ |
| Words per card | Beat 1: 2 · Beat 2: 5 · Beat 3: 4 · Beat 6: 5 · Beat 7: 6 ✅. Beats 4–5 exceed six words only because of the placeholder tags, which are removed when the photos are added |
| Banned language (video + caption) | None found ✅ |

## 2. Beat by beat

| # | Output | Source used (verified) | On-screen text | Notes |
|---|---|---|---|---|
| 1 | 0.0–2.0 | V05 3.000–4.958 s (frames 72–119) | "Sound on. 🏁" | As locked |
| 2 | 2.0–4.5 | V05 0.000–2.458 s (frames 0–59) | "Night over pit road." · 2024 | **Fallback used.** Nothing on record shows the people in V05 are TripNerd guests, or that these are TripNerd's seats. The pit-road location is visible in frame (pit boxes directly below) |
| 3 | 4.5–7.0 | V06 frames 60–104 (2.000–3.467 s), centre crop 405×720, 60% speed by plain frame repetition, V06 audio muted | "Daytime. Engines on." · 2024 | **Fallback used.** No guest headsets are visible in the centre crop (one person in the pit area wears headphones; not a guest) |
| 4 | 7.0–9.5 | **PLACEHOLDER**: Photo B not accessible | "4:54 PM." · 2023 | See section 3 |
| 5 | 9.5–12.5 | **PLACEHOLDER**: Photo A not accessible | "6:56 PM. Still filming." · 2023 | See section 3 |
| 6 | 12.5–14.0 | V05 8.500–9.958 s (frames 204–239), forward | "Where would your crew sit?" | **Cleared, so no fallback.** Sunoco is in frame only for 8.50–8.62 s (3 frames), blurred and desaturated, and confirmed unrecognisable in the export; from 8.67 s it has left the frame. 7.0–8.5 s and 3.0–4.5 s are not used |
| 7 | 14.0–16.0 | Static end card | "Daytona Beach plans · February 2027" / "tripnerd.com" | Original logo file (sha256 `1c4996e5…caa51`), scaled only. Navy #202838 |

## 3. Missing assets (not substituted)

- **Photo B** = TripNerd website photo `gallery_07.jpg`. Camera time 2023-02-19 16:54, Pixel 6 Pro, per `footage-inventory.md`.
- **Photo A** = TripNerd website photo `gallery_05.jpg`. Camera time 2023-02-19 18:56.
- **Why they're missing:**
  - They are **not in the Drive folder "TripNerd real client footage"**. Its READ ME lists the Daytona folder as 2 videos only.
  - They exist on tripnerd.com, which this environment cannot reach.
- **The year labels ("2023") and times** come from that inventory record; I could not re-check them against the files.
- **To finish:** upload both original photos (full size, with camera data) or add them to `Originals by event / daytona`. The build is scripted, so dropping them in and re-checking masks takes minutes.

## 4. Clearance

| Check | Result |
|---|---|
| Third-party logos | Masked, tracked with the camera and re-checked on the export at 1:1 and 3× zoom: Sunoco; the Pennzoil/Shell pit box (canopy roundels, panels, "AAA", lower panel, screens); Hendrick/blue pit box; McDonald's; RFK; Team Penske; Coca-Cola can and Diet Coke can; labelled water bottles; red scanner; broadcast TV screens; tower and wall lettering; a "43" team graphic on a hoodie; the "OFFICIAL" jacket. Car liveries are motion-blurred with no readable text ✅ |
| Faces | Blurred: the guest in glasses and headset (beat 2), the second guest in cap and headset, one pit-area profile (beat 1), four spectator profiles, two crew faces, and a man in a blue cap (beat 3). The rest are backs of heads or too small to recognise ✅ |
| Children | None seen in close-up ✅ |
| Mask slips | None found in the frame sweep (every 6th frame plus every Sunoco frame) ✅ |
| Static photos | Not testable until the photos are supplied |

## 5. Audio

- **Real V05 audio only**, continuous for all 16 s, original speed, no reversing, no voiceover or added effects.
- **Seam moved (deviation, for a reason).** V05's own sound fades from about −11 dB (4–5 s) to −44 dB by 10 s, after the field has passed. A copy restarted at 10.0 s, as the brief locks it, would sit on a near-silent dip and then jump about 24 dB.
- **Where it is now:** the second copy (from source 0.0 s) starts at **output 7.0 s**, with a **0.5 s equal-power crossfade (7.0–7.5 s) inside the Photo B beat**. The levels either side match within about 1 dB.
- **Measured at the seam:** at most about a 3 dB dip, and no click (largest sample step 0.065, against 0.123 elsewhere in the file).
- **Side effect:** the second copy reaches the source's natural fade, so the **audio tapers under the end card** (about −21 dB at 14 s down to −40 dB at 16 s).
- **Not heard by ear.** These are measurements; I can't listen to audio. Please listen to 6.8–7.8 s and to the end card.

## 6. Open issues before this can be published

1. Supply **Photos A and B**. Then check their faces, phone screen and logos, and confirm they stay static.
2. **The caption says "Real TripNerd guests."** In this draft, no shot is verified as TripNerd guests. That becomes true only once Photos A and B, TripNerd's own guest photos, are in the cut.
3. **Brand colours.** The brand guide marks navy #202838 as "INFERRED". Its logo rule is "on navy, place the logo on a #5896E9 plate", so the end card does that. TripNerd should confirm both.
4. **Rights and consent.** The Drive READ ME rule still applies: internal until TripNerd confirms venue OK and guest consent. Videos V05 and V06 are labelled 2024 from their filenames (TN_2024-02-19). The container dates were rewritten on upload (2026-09-22), so the camera date can't be confirmed from the file.
5. **Visible blur.** At 720p the pit boxes are covered in sponsor marks, so beats 1, 3 and 6 show soft blur patches. Original-resolution files from TripNerd would allow tighter masks.
6. **Beat 3 is soft.** The brief's 9:16 centre crop of 1280×720 footage is enlarged about 2.7× (conventional resampling, no AI).
