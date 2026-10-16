# TN-DAYTONA-001 · Client-review cut · QA report

File: `TripNerd-Daytona-Reel-CLIENT-REVIEW.mp4`. All checks were measured on the exported file. **Audio measured; listening check pending Wyatt.**

## Owner decisions applied (16 Oct 2026)
These override the brief where the two conflict:

| Item | Brief says | Owner decision | What I did |
|---|---|---|---|
| Upscaling | No AI upscaling | Upscale with Higgsfield only if it won't look AI-touched | **Not done; blocker.** V05/V06 are owner-only in Drive and this workspace can't upload to Higgsfield. Used the non-AI quality pass instead (light denoise, Lanczos enlargement, two-scale sharpening). |
| TV picture and burnout | Real footage only | AI is fine if it's not obvious | Kept both. TV: Grok Video 1.5 animation of the suite photo's own screen. Burnout: Kling 3.0 Pro animation of Photo A. **Neither is recorded footage.** |
| End card | Navy, "Daytona Beach 2027 / Plan yours" | Blue "Talk to a Nerd" card | Used the owner-supplied card unaltered. It says "Now booking 2027", which is **booking language**; the brief allows that only if bookability is confirmed. |
| Music | Licensed track, licence recorded | Fine if free and legally safe on Instagram | Kept the original composition (see Music). |

## Timeline (30 fps, 495 frames)
| Time | Shot | Copy |
|---|---|---|
| 0.0–1.5 | Lanyard opener: card lifts, holds 0.6–1.0, 1.5 turns, white at 1.47 | Our Daytona suite. |
| 1.5–4.0 | V06 2.000–3.500 s at a constant 60% (75 frames, plain frame repeats), 0.23 s dip from white | This beats watching from home. · 2024 |
| 4.0–5.5 | V05 0.000–1.458 s (steady pit-road view, no whip pan) | Race weekend, the TripNerd way. · 2024 |
| 5.5–7.5 | Photo B, static | Headsets on. Drinks up. · 2023 |
| 7.5–9.5 | tripnerd-daytona_father-son-seats.jpg, whole photo on navy, static | Thumbs up from the seats. |
| 9.5–11.0 | tripnerd-daytona_wow-guests.jpg, whole photo on navy, static | Bring your people. |
| 11.0–13.5 | Burnout: Kling clip (job 0ad498ed) frames 44–103 | The burnout. The memories. (no year) |
| 13.5–16.5 | Owner-approved end card | (artwork) |

## Checks
| Check | Result |
|---|---|
| Format | 16.500 s · 1080×1920 · 30 fps · H.264 High yuv420p · AAC LC stereo 48 kHz · fast-start (moov before mdat) · 16.4 MB ✅ |
| Loudness | −14.4 LUFS integrated, true peak −2.1 dBTP ✅ |
| Text | All boxes inside y 288–1344. Max 6 words per card including years. Copy matches the brief. Clear of faces, logo, car and smoke ✅ |
| Photos | Static. Father-son and wow-guests shown whole (no faces cropped) ✅ |
| V06 speed | 60% ✅ |
| Logo | End card is owner artwork, unaltered. Badge mascot is the original file. **The badge wordmark was recoloured navy** to match the printed card (owner-approved 16 Oct), which conflicts with the brief's "do not redraw". ⚠️ |
| Burnout provenance | **Not authentic recorded footage.** It is an AI animation of Photo A (real photo, EXIF 2023-02-19 18:56). No year shown. ⚠️ |
| Burnout sound | **None genuine.** The Kling clip was rendered without sound, and no real burnout audio exists. Music only over the burnout; nothing manufactured. |
| Real sound | 0–1.5 muffled real V06 sound · 1.5–4.0 real V06 2.0–4.5 s · 4.0–5.5 real V05 0.0–1.5 s, faded out by 5.5. No loop, none over photos or the end card ✅ |
| Music | Ducked about 6 dB under real sound with 0.25 s ramps. Quiet build under the opener, full entry on the white cut at 1.5 s, final hit on the end card at 13.5 s, fades over 15.5–16.5 ✅ (measured) |

## Music record
- **Title / creator:** "TN Daytona bed v2", an original composition written in code for this advert (Service Pow, 16 Oct 2026).
- **How it was made:** rendered with FluidSynth using the FluidR3_GM instrument library (MIT licence).
- **Licensing:** no third-party recording or composition is used, so there's no licence to hold and no Content ID registration to match.
- **Caveat:** it was composed by an AI assistant, which the brief's "no AI music" rule would cover. The owner accepted it on 16 Oct as long as it's free and legally clean.

## Unresolved
1. Higgsfield upscaling: needs V05/V06 uploaded to Higgsfield by the owner, or link-shared.
2. Sign-off for the AI TV and AI burnout before posting.
3. "Now booking 2027" needs bookability confirmed.
4. Listening check (Wyatt): opener-to-pack-pass entry, the duck, the cut into the burnout, and the final fade.
