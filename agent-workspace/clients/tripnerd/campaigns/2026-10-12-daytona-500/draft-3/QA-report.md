# TN-DAYTONA-001 · Draft 3 QA report

**Status: NOT publish-ready.** The check "no visible third-party logos" fails on 0.0–9.5 s and **cannot be fixed by cropping or trimming the brief's locked source windows**. Everything else passes on the rendered file. Decision needed in section 3.

File: `TripNerd-Daytona-Beach-Reel-DRAFT-3.mp4`. Measured on the export, all 384 frames extracted.

## 1. Brief checklist

| Check | Result | Evidence |
|---|---|---|
| Format | ✅ PASS | 16.000 s; 1080×1920; H.264 High yuv420p 24 fps, 384 frames; AAC 48 kHz stereo 192 kbps |
| Timeline | ✅ PASS | 60 / 48 / 60 / 60 / 84 / 72 frames = 0–2.5 / 2.5–4.5 / 4.5–7.0 / 7.0–9.5 / 9.5–13.0 / 13.0–16.0 s |
| Copy matches the brief exactly | ✅ PASS | All six cards match word for word. No retired lines, no timestamps |
| Six-word limit (years included) | ✅ PASS | 6 · 6 · 4 · 5 · 5 · 6 |
| Text inside y 288–1344 | ✅ PASS | All boxes in band. Year labels sit top-right at y 312 on every picture beat |
| No editorial blur or overlays on the picture | ✅ PASS | The Draft 3 build has no mask or blur step. Framing is crop-only |
| **No visible third-party logos** | ❌ **FAIL** | 0.0–7.0 s (both videos) and 7.0–9.5 s (Photo B). See section 2 |
| No placeholders | ✅ PASS | None |
| No close-up children | ✅ PASS | None seen. One Photo B guest has their face covered by their hands (adult-looking hands and wristband); age not confirmable |
| Source selections | ✅ PASS | V06 2.000–3.475 s (frames 60–104), crop x 640–1045 · V05 0.000–1.958 s (frames 0–47), full frame · V05 3.000–5.458 s (frames 72–131), full frame · Photo B crop x 590–1024 · Photo A crop x 360–772, y 0–733 |
| V06 at 60% | ✅ PASS | 60 output frames from 1.5 s of source (0.025 s per output frame), plain frame repeats, no interpolation |
| Static photos | ✅ PASS | Every frame of each photo beat is the same source image. Mean pixel difference in the export is 0.005 (compression noise only) |
| Burnout car and smoke unobstructed | ✅ PASS | Copy at y 400–479; car and smoke at y 930–1061 |
| Drink visible (Photo B) | ✅ PASS | Plastic cups, cans and water bottles on the counter |
| No booking, access, price or availability claims | ✅ PASS | Planning language only. Banned words are absent from the video and caption |
| Caption | ✅ PASS | `caption.txt` matches the brief byte for byte |
| Audio | ✅ PASS by measurement · ⚠️ **not heard by ear** | Section 4 |

## 2. Third-party marks still visible (no blur was used, by instruction)

| Output | Source | Marks | Can cropping fix it? |
|---|---|---|---|
| 0.00–2.50 | V06 2.0–3.5 s | Pennzoil/Shell pit box: canopy roundels from 0.33 s, PENNZOIL/Shell/AAA panel from 1.25 s, a red lettered box. Broadcast TV screens on two pit boxes. Grandstand-top lettering | **No.** The camera pans about 390 px across this window, so the pit box (about 260 px wide) moves from x 284–544 to x 676–936. Every 9:16 window crosses it |
| 2.50–4.50 | V05 0.0–2.0 s | Tower lettering, painted wall lettering, Team Penske banner, blue/McDonald's/RFK pit-box signs, TV screens, a Coca-Cola can and a Diet Coke can on the rail, a red scanner | **No.** The marks fill the middle of the pit-road overview. Removing them leaves sky or empty rail at over 2.5× enlargement |
| 4.50–6.62 | V05 3.0–5.1 s | The same pit-road marks, then the Pennzoil/Shell pit box dominating the whip pan (4.67–6.62 s) and a Coca-Cola box | **No** |
| 6.62–7.00 | V05 5.1–5.5 s (the brief's extra 0.5 s) | No legible marks. **Camera:** a fast pan (about 38 px per frame against a 16.5 px median earlier), so the field is motion-blurred | n/a |
| 7.00–9.50 | Photo B | MENARDS lettering on a pit box and its canopy. Coca-Cola cans on the counter. A "…ck" fragment of the Hendrick Motorsports banner at the left edge | **No.** The right-hand Coca-Cola can sits among the seated group, and Menards is mid-frame. Any full-height 9:16 crop includes both; a shorter crop means about 4–5× enlargement |
| 9.50–13.00 | Photo A | None legible. The Sunoco sign is out of frame; a bag's lettering is trimmed off the bottom edge (3.5% of height). Left in: an unbranded cap emblem and illegible cart lettering | n/a |
| 13.00–16.00 | End card | Original TripNerd logo only | n/a |

Car liveries are motion-blurred, with no readable sponsor text, in every video beat.

## 3. Decision needed (pick one)

1. **Accept incidental marks in real race footage** (recommended if this Reel is to keep this footage).
   - Approve visible background sponsor marks: no blur, no featured or close-up logos, caption disclaimer kept.
   - Needs Jason's written OK plus APPROVER sign-off, because it changes the brand-asset rule for this asset.
   - With that approval, Draft 3 as rendered is ready for its next review.
2. **Re-cut around logo-light real media** (changes the locked timeline, so it needs your approval).
   - **Beat 1:** V06 3.5–5.0 s (frames 105–149) at 60%, crop x 180–585.
     - The pack passes through frames 105–125. The Pennzoil box stays right of x 702 and the Sunoco sign left of about x 160 throughout.
     - Checked on stills: what remains is motion-blurred liveries, small lettering on officials' vests and a fire-rescue cart.
   - **Beats 2–3 (V05):** no V05 window gives 4.5 s without marks. The cleanest stretches are 5.1–5.5 s (field passing, fast pan) and 8.5–9.1 s. Sunoco is in frame from about 5.8 to 8.5 s.
   - **Photo B:** no crop clears it, so it would need a different 2023 guest photo from the TripNerd gallery (not yet reviewed).
3. **Ask TripNerd for more Daytona footage** (other clips, or original-resolution files).

## 4. Audio (rebuilt)

- **One uninterrupted V05 bed at original speed.** V06 is muted. No music, voiceover or added effects.
- **Pass 1:** V05 0.0 → 9.0 s at output 0.0 → 9.0 s. **Pass 2:** V05 0.0 → 8.0 s at output 8.0 → 16.0 s.
- **Loop:** a 1.0 s equal-power crossfade at **8.0–9.0 s**, entirely under Photo B.
  - During the crossfade the outgoing pass is only crowd sound (−31 to −40 dB in the source), while the incoming pass is the field approaching. So no doubled engines.
- **0:07 is no longer a seam.** It is continuous pass-1 sound: −18.4 to −20.5 dB per 100 ms, no step.
- **Why a gain ride was needed:** V05 holds full level for only about 7.25 s (source 0.0–7.25 s at −21 to −10 dB). It then fades to −44 dB as the field leaves. 16 s from one loop therefore needs a lift on the two receding tails.
  - The ride is slow and applies only below a −17 dB floor. It lifts at most +10.5 dB (250 ms average), mainly at 7.25–8.5 s and 15.25–16.0 s, plus about +4 dB on the clip's quiet first 0.25 s. It adds no new sound.
- **Measured:**
  - −13.9 LUFS integrated, true peak −3.2 dBFS, no clipping.
  - Largest step between 250 ms windows: 2.9 dB. Deepest point anywhere: −22.5 dB. End card stays between −20.4 and −14.0 dB.
  - No gaps under −45 dB. Largest sample step at the loop is 0.045 (0.130 elsewhere in the file), so no click.
- **Not done:** "adjust the crossfade by listening". I can't hear audio, so this is measurement only. Please listen to 7.5–9.5 s and 15–16 s.

## 5. Source and date verification

| Asset | Year on screen | Records | Confidence |
|---|---|---|---|
| V05 | 2024 | Capture timestamp inside the file (QuickTime `udta/date`): **2024-02-19 18:47:20 −05:00**. Filename `TN_2024-02-19_daytona_V05`. The 2024 race ran Mon 19 Feb 2024, green flag 4 pm ET (postponed by rain) | High. Caveat: both video files carry a provenance note that they passed through a Claude tool with origin "unknown", so their earlier file history can't be traced |
| V06 | 2024 | Embedded date **2024-02-19 18:52:54 −05:00**, matching filename and race date | High, same caveat. Note: 18:52 is after sunset, so Draft 2's "Daytime" label would have been wrong; Draft 3 doesn't use it |
| Photo B | 2023 | EXIF **2023-02-19 16:54:45 −05:00** (Pixel 6 Pro). The 2023 race ran 19 Feb 2023. Byte-identical to the file on tripnerd.com | High |
| Photo A | 2023 | EXIF **2023-02-19 18:56:07 −05:00**, same race date, byte-identical to the file on tripnerd.com | High |

Time of day was not inferred from how the pictures look.

## 6. Other notes

- **Enlargement:** V06 is 2.67× (soft; the brief's window needs a 405-px-wide crop), V05 is 1.5×, Photo B 2.49×, Photo A 2.62×. No AI upscaling.
- **Roof structure:** the blue canopy edge shows at the top of beats 1, 4 and 5. Cropping it out would mean more enlargement, so I kept the wider framing.
- **Not done:** the advert brief's operator confirmation step. The eight-field brief is taken directly from the Draft 3 brief: objective is planning visits to tripnerd.com; verified offer is none, by design (planning language only).
- **Consent:** guest consent and venue use are still unconfirmed in the Drive READ ME. Jason's approval of faces is noted in the brief; get it in writing for the file.
