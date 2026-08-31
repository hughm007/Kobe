---
title: Intro video — whiteboard explainer asset manifest
type: brief
client: internal
owner: Karl
status: draft
created: 2026-08-31
updated: 2026-08-31
tags: [intro-video, higgsedit, whiteboard, assets]
---

# Whiteboard explainer — asset manifest

Owner reference: the TripNerd explainer on tripnerd.com — hand-drawn whiteboard
animation where a visible hand draws each element in. Owner's words: *"the guy is
drawing everything into animation so the video is engaging — that is what we are
missing."* The dark editorial direction from cut 02 is **dropped**; ground returns to
white.

## Art — 14 illustrations, 14 credits (nano_banana @ 1 cr/image)

Style pinned to Higgsfield's **Whiteboard Doodle** explainer preset
(`b347d852-98fc-4013-92b7-6b0219fb21be`), resolved to style-reference media
`558502e7-b2a2-4fca-87d1-c000fd401508` and passed on every call, so all fourteen come
out of one hand.

Every prompt carries **NO text, NO words, NO letters, NO logos** — generated lettering is
both an AI tell and a claims risk. All burned copy stays type in the timeline, where it
is governed.

| # | Subject | Serves |
|---|---|---|
| 1 | Owner at a desk, arms folded, silent phone | R1 `You paid. It didn't ring.` |
| 2 | Four advert cards in a row | R2 `We build four.` |
| 3 | Owner shrugging, question marks | R3 `still don't know why` |
| 4 | Tradesman filming himself on a phone | R4 `clips off your phone` |
| 5 | Film crew + lights + clapperboard, struck out | R5 `No film crew. No shoot day.` |
| 6 | Plain work van on a suburban street | R6 `Your van. Your street.` |
| 7 | Frames assembling from pieces, cogs | R7 `AI builds the rest.` |
| 8 | Four ads, one circled, arrow climbing | R8 `Keep the one that pulls.` |
| 9 | Calendar + delivery arrow | R9 `5–7 business days` |
| 10 | Clipboard, three ticks, shield | R10–R12 trust stack |
| 11 | One hand passing a finished ad to another | R13 `before you ask` |
| 12 | Magnifier over a rising chart | R14 the audit |
| 13 | Owner shaking hands with an advisor | R15 endcard |
| 14 | **Photographic hand holding a black marker** | the drawing hand |

Contact sheet (all 14):
https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/000bc29e-fd47-4026-a79f-684f502e8bc6.png

**Note:** item 2 was first refused as a false-positive NSFW block ("four smartphone
screens standing in a row"); resubmitted as "four advert cards" and passed.

## Voice audition — 5 candidates, 20 fragments, 5.0 credits

The Owner's voice brief (2026-08-31) specifies a premium American male commercial
narrator, low-to-mid baritone, **145–155 wpm, never rushed**, with deliberate pauses so
short lines land.

**There is no text-to-voice-design here.** `create_voice` clones from a *recording*;
`seed_audio` and `text2speech_v2` take a voice id, not a style description. So the brief
splits into two halves: **timbre** is chosen by ear from presets, and **performance** —
pace, pauses, per-beat energy — is executed in the mix, where each line is a separate
clip placed on the timeline.

Auditions are assembled to the Owner's own example, with real silence:
`You paid.` · 0.42s · `It didn't ring.` · 0.80s · `Don't bet your spend on one ad.` ·
0.50s · `We build four.`

Measured pace, 15 words over the speech-only duration:

| Voice | Speech | Pace | vs 145–155 |
|---|---|---|---|
| Grady | 7.58s | **119 wpm** | too slow |
| Emmett | 7.24s | **124 wpm** | too slow |
| **Reid** | 5.76s | **156 wpm** | ✅ in band |
| Desmond | 7.94s | **113 wpm** | too slow |
| **Dylan** | 5.88s | **153 wpm** | ✅ in band |

All five generated at `speech_rate +6/+10` (pain lines slower, solution lines lifted) —
the differences above are the voices' own natural pace, not the settings. This is the
measured explanation for the "slow and groggy" note on the Holden master.

| Voice | Audition |
|---|---|
| A · Grady | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/8d1dce27-ec98-4a28-b823-1ae833abe373.mp3 |
| B · Emmett | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/49639553-b322-4623-b10a-0e3df5a7611a.mp3 |
| **C · Reid** | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/2ab0a8bf-c799-4aa1-8e4d-9e9abbc117e9.mp3 |
| D · Desmond | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/3214eeb0-987f-4edd-ad2b-b5ab338edd7d.mp3 |
| **E · Dylan** | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/6f1bfb2e-6214-4b60-982c-58651bdba4c4.mp3 |

## The emotional arc, as parameters

The brief's arc maps onto per-line `speech_rate` / `loudness_rate`, since every line is
its own generation:

| Beat | Direction | Setting |
|---|---|---|
| The problem (R1, R3) | restrained seriousness | rate +6, loudness +4 |
| The solution (R2, R4–R7) | more energy and confidence | rate +10, loudness +6 |
| The creative (R8, R9) | controlled momentum | rate +8, loudness +6 |
| The proof (R10–R12) | calm certainty | rate +4, loudness +4 |
| The CTA (R15) | invitation, not pitch — slower, lower energy, more confident | rate −4, loudness +2 |

## Spend this round

| | Credits |
|---|---|
| First audition (5 lines, later superseded — wrong pace) | 1.0 |
| Second audition (20 fragments, Owner's pause structure) | 4.0 |
| Art (14 images) | 14.0 |
| **Total** | **19.0** |

`nano_banana` preflighted at **1 credit per image**, not the 0.12 estimated in the plan —
the plan's ~1.6 credit figure for art was wrong and the real number is 14.

## Still open

1. **Voice not chosen.** Nothing further generates until the Owner picks. The full
   15-line re-cut is 3.0 credits and is wasted on the wrong voice.
2. **No music.** Higgsfield is speech-only and declines music generation. Owner's
   decision 2026-08-31: build now, leave the track wired and open, he supplies a
   licensed track (Artlist / Epidemic) and it mixes in. **The audio is not finished
   until that lands** — this is a stated gap, not an oversight.
3. `edit.jsx` not yet rebuilt for the whiteboard vocabulary.
