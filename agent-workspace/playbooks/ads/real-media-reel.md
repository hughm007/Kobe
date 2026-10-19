---
title: Real-media Reel — the process that produced the approved TripNerd Daytona Reel
type: playbook
client: internal
owner: Karl
status: active
created: 2026-10-19
updated: 2026-10-19
tags: [ads, video, reel, instagram, process, owner-preferences]
source: TN-DAYTONA-001, built 2026-10-12 to 2026-10-19 over ~10 owner review rounds; approved 2026-10-19.
---

# Real-media Reel (photos + phone clips → 15-20 s Instagram Reel)

Use this when a client has real event photos and short phone clips and wants a vertical Reel.
It replays what got TripNerd's Daytona Reel approved, minus the rounds we wasted.
Worked example and code: `clients/tripnerd/campaigns/2026-10-12-daytona-500/final-18s/`
(`final_cut_v3.py`, `build_card_open2s.py`, `compose_music_v3.py`). Approved master:
`clients/tripnerd/deliverables/approved-video-adverts.md` #4. Company law and the
blocking-check registry still apply; this file does not restate them.

## 0. Owner preferences (standing)
- **AI is allowed in any advert for any client** unless the owner says otherwise for that job.
  Use it without asking. The owner judges whether it looks too AI. Only drop an AI shot
  yourself if it is plainly, badly fake. Do not offer "all-real" fallbacks by default.
  (Full rule: `.claude/ADVERT-BRIEF.md`.) Platform AI-content toggle still goes on at posting.
- Send a short explanation of what you think the owner wants **before** building anything new
  and novel (an intro animation, a new concept). Build only after the owner confirms.
- Deliver fast: when asked for options, render both and send both in one message.
- Never blur people. Sponsor logos in frame are fine.
- Music must be free and safe on Instagram. Composing an original track (FluidSynth +
  FluidR3_GM, MIT) has been the reliable route; Pixabay is blocked from the build container.

## 1. Intake (before any build)
1. Fill the eight-field Advert Brief (`.claude/ADVERT-BRIEF.md`) and read the client folder.
2. **Date every source from its own metadata** (`ffprobe` creation_time / QuickTime date,
   EXIF DateTimeOriginal). Year labels go only on sources with a real date. Website copies
   carry no EXIF: ask the client for the year, never guess.
3. Log which footage seconds each beat uses in the client's footage-usage ledger.

## 2. Structure that got approved (18 s, 30 fps, 1080x1920)
| Beat | Length | Content |
|---|---|---|
| Opener | 2.0 s | Branded "entrance" (the TripNerd lanyard card lifting off the suite photo), white-out 1.7-2.0 s landing on the first music hit |
| Live clip 1 | 2.0 s | Strongest real race clip, own audio |
| Live clip 2 | 3.5 s | Real speed, no loop, no slow-mo |
| Photos | 1.2-1.5 s each | Static, one short line each, year label top-right |
| Payoff | 3.0 s | Moving shot (an AI animation of a real photo is fine) with the crowd/engine sound peaking at the cut |
| End card | 3.5 s | The client's approved brand card; fade (0.3-0.5 s) at the very end, not a hard cut |

Copy: at most six words per card, one idea per card, all text inside y 288-1344.

## 3. Layout: what the owner chose and why
- Landscape photos in a 9:16 frame: **boxed at native size on a blurred fill of the same photo,
  with the client logo fixed below the photo** (static, centred, ~y 1410-1540, original logo
  file). The owner read small boxes with an empty blur as "cropped"; the logo makes the space
  intentional. Full-bleed crops were the alternative: they cut people and need ~3.6x enlargement.
- Video clips stay full screen; keep the logo in the same position over them.
- No Ken Burns, zoom or pan on photos unless asked.

## 4. Sound
- Music: through-composed (no loops), first hit on the opener's white-out, final chord on the
  end-card cut, ring-out to the end.
- Real clip audio under each clip; music ducked about 6 dB under real sound.
- Payoff sound: real crowd/engine audio from unused seconds of the same footage, built to peak
  at the end-card cut and decay with the final chord.
- Master: -14 LUFS integrated, true peak ≤ -1 dBTP (two-pass loudnorm, linear).

## 5. Traps we hit (avoid them)
- **Drawn lanyard strap printed text mirrored**: when mapping a texture along a curve, texture
  column 0 must land on the strap's left edge. Check any drawn text at full size.
- **Free rope end curled into a hook**: pin the strap's top end where it leaves the original
  photo; it then hangs as a natural curve.
- An animated element must play what is really there (the TV must show its own picture moving,
  not random footage).
- AI upscaling of client originals was blocked (Drive files owner-only); a light non-AI pass
  (denoise → Lanczos → two-scale unsharp) was accepted.
- Higgsfield: Seedance queued ~45 min then failed (refunded); Grok Video 1.5 and Kling 3.0 Pro
  delivered. Get spend approval with the live price before generating.

## 6. QA before sending
Duration and frame count · LUFS and true peak (`ebur128`) · faststart · every text box inside
the band · words per card · a contact sheet of key frames looked at by eye · say plainly what
was not checked (e.g. not watched with sound on a phone).
