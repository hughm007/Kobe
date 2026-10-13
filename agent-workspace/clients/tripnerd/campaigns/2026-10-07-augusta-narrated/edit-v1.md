---
title: TripNerd "Augusta Narrated" — owner's edit v1 (voice swap, roar, zoom lock)
type: report
client: tripnerd
owner: Karl
status: active
created: 2026-10-07
updated: 2026-10-07
tags: [video, reel, augusta, voiceover, sound-design, edit]
---

# TripNerd "Augusta Narrated" — owner's edit, v1 (2026-10-07)

**Source (owner upload):** `TripNerd_Augusta_Narrated.mp4`, 1080x1920, 30 fps, 772 frames, 25.73 s, −16.8 LUFS, MD5 `6e0da7e97039b874a2c7715a43ff0e6c`.
**Voice reference (owner upload):** `One-static-shot-of-a-fictional-adult-mal….mp4`, 16.06 s, MD5 `981ba63df5201f3b824c60bb792baa99`. It reads the whole script in one voice: "With TripNerd / course access / private executive accommodations / daily hospitality and concierge support / Bring your people / Enjoy the moment / And feel the roar / All handled / by TripNerd". It is not the recording used in the advert (cross-correlation ≤ 0.32 for every phrase).

## Owner asks (verbatim in substance)
1. Use this voice for "Bring your people" and "Enjoy the moment".
2. On the roar shot, voice and caption "and hear the roar" (or better wording).
3. End with a voice line along the lines of "All done with TripNerd!", no caption.
4. Don't zoom in more than the screenshot; keep the same clip, manage the zoom.
5. (Mid-build) When the roar line plays, add an Augusta-style roar: cheering, clapping.

## Delivered (sent to the owner in the app; not uploaded to storage: this container cannot reach the upload service)
| File | MD5 | What differs |
|---|---|---|
| `TripNerd_Augusta_Narrated_edit.mp4` (main) | `7971b3281aa74eeeb06fdd714becf7ef` | "And hear the roar." (voice + caption) and "All done with TripNerd!" (voice only), both generated in the reference voice |
| `TripNerd_Augusta_Narrated_edit_alt.mp4` | `f24cc2b8bc9519c76607b542fd6791c5` | "And feel the roar." and "All handled by TripNerd.", both the reference voice's own recording |
Both: 772 frames, 25.74 s, −16.9 LUFS integrated, −1.2 dBTP; everything before 15.3 s (audio) and outside frames 545–682 (picture) is the owner's edit, re-encoded once (CRF 15).

## How each ask was met (FACT unless marked)
- **Old narrator removed from 15.3 s:** the advert's audio split into vocal and accompaniment stems locally (UVR MDX-Net Voc FT via sherpa-onnx); from 15.3 s the mix is the accompaniment stem (0.2 s crossfade in a pause). Old narration timings measured on the vocal stem: Bring 15.90, Enjoy 17.62, roar line 19.45, "All handled" 23.22, "by TripNerd" 24.48.
- **New lines:** "Bring your people." (clip 7.60–8.50 s) at 15.78 s; "Enjoy the moment." (clip 9.15–10.25 s) at 17.51 s; each level-matched to the old line it replaces. Roar line at 19.34 s; closing line from 22.95 s (main) / 23.06 s (alt).
- **"Hear the roar" and "All done with TripNerd" are not in the reference recording.** For the main version they were generated locally from the reference voice with a zero-shot speech model (ZipVoice distill, sherpa-onnx; nothing uploaded anywhere). A speech recogniser reads both back correctly. Measured timbre distance to the real voice: real-vs-real 14.7–21.9, generated 26.2–28.7, the advert's old narrator 31.3; pitch within the real voice's range. **Not verified by ear.** The alt version uses only the real recording.
- **Roar:** the gallery's own generated cheers from the two golf clips (landing clip 1.4–5.0 s; second clip 1.2–4.5 s, "YEAH!") layered with synthesised applause, a short room reverb, soft-limited; rises as the ball lands (19.1 s), sits ducked under the line, opens at 20.75 s, carries into the card and fades by 25.7 s; the music dips 3 dB under it. No real recorded crowd was available in this container that was free of music (the approved advert's roar and the owner's suite footage both measured as music-led).
- **Caption:** composited in the edit's own style, measured from the original: DejaVu Sans Bold 64 px, white, centred on x 536, ink top at y 334, soft shadow; same in/out dissolves (in 18.17–18.50 s, out 22.43–22.77 s).
- **Zoom:** the advert already used the full-height 9:16 window of the 1080p source (a 1.78x upscale) and added no digital zoom; the creeping zoom was the source clip's own camera push (13 % by source 1.92 s, 21 % by the end of the window) played at 0.3125x. The shot is rebuilt from the source with that push and tilt locked at the shot's opening framing (ECC affine per source frame, quadratic-smoothed; the thin borders a later frame no longer covers filled from the opening frame with a 14 px feather). ASSUMPTION: "my last screenshot" = the shot's opening framing; no screenshot came with the message.
- **Also in the rebuilt shot:** in-between frames are motion-interpolated (nearest warped frame, so the small ball never doubles); the faint generated emblem on the flag is painted out (brand-assets policy; it was visible in the owner's cut).
- **Timing preserved:** the shot keeps the original mapping, source time = 0.917 + (ad time − 18.667) × 0.3125, window x 657.

## Open items
- The owner should listen to the two generated lines in the main version; the alt exists if they sound off.
- No on-screen AI disclosure is in this cut (as the owner's own edit); the New York synthetic-performer rule recorded in `../2026-10-06-the-thread/build-v7.md` applies if the people on screen are generated.
- Not gated (no Skeptic/Critic run on this edit); the owner asked for a direct fix pass.

## Scripts (`build/`)
`sep.py` stem separation · `seg_asr.py` phrase transcription (offline Whisper base.en) · `clone.py` the two generated lines · `roar_shot.py` the rebuilt golf shot · `final.py main|safe` picture splice, caption, dissolves, voice, roar, loudness.
