---
title: "TripNerd 'The thread' (TN-R02) — build v3 record: the owner's two clips after the thread (the landing, the suite erupting)"
type: report
client: tripnerd
campaign_id: 2026-10-06-the-thread
owner: Karl
status: draft
created: 2026-10-07
updated: 2026-10-07
tags: [campaign, reel, build-record, qc, ai-footage, disclosure, brand-fidelity, instagram]
---

# The thread — build v3

**Owner's note (2026-10-06, 23:37):** "you're just using the wrong footage after"; supplied two clips to add after the text messages, blended so the ad flows, and asked for a finished product. The two files are byte-identical to two generations in the owner's Higgsfield account (MD5 `43777a5e…` = Seedance 2.5 job `adac6b4d`, the ball landing; MD5 `023fd915…` = Kling 3.0 job `0c1646c7`, the suite erupting).

**Status:** v3 master built, machine-QC'd, frame-checked, speech-screened, uploaded and byte-verified; the dual gate ran on the frozen master (§6). **One brand-fidelity finding is the owner's call (§3). Owner review pending; TripNerd's approver pending; the post must carry the platform AI label and the caption line.**

## 1. Links (Higgsfield private storage; verified byte-for-byte after upload)
| File | Link | Size | MD5 |
|---|---|---|---|
| Master, 16.6 s, 1080x1920, 24 fps | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/35ee82e9-3f33-4ebe-ad66-1e78bdba43ec.mp4 | 12,484,620 B | `acf8ec1b4303cc7d69fc54ad2a1322de` |
| Contact sheet (2 fps, 4x9) | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/29d82f55-4a88-454a-9607-6996ba3e72a1.jpg | 467,819 B | `8992a54d1fe5f9feb0f1448864de6edf` |
| Build kit (scripts, packet, README) | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/87ee24f9-7bc0-4b0c-bb46-8a6208919b94.zip | 11,276 B | `1007d4bdb79d18ac19e374fd65744b34` |

## 2. As built (16.6 s, 24 fps)
| Time | Picture | Source | Sound |
|---|---|---|---|
| 0.0–7.7 | The thread, as v2 with the slow drift raised to 16 px/s | composited (`build/render_thread_v3.py`) | tones, the 'sent' swoosh |
| 7.7–11.9 | GENERATED: the green, the plain yellow flag, azaleas and the gallery in green chairs; the ball comes in, bounces, rolls and stops by the hole. 9:16 window of the 16:9 source, held on the flag; 0.3 s crossfade in and out. On-screen label "Scenes dramatized" 8.0–10.5 s | owner's Seedance 2.5 clip `adac6b4d` (source 0.7–4.9 s), Higgsfield 4k upscale job `823251fb` | the clip's own generated sound (−9 dB) over TripNerd's real gallery murmur |
| 11.6–16.6 | GENERATED: the suite, the TV showing the ball by the hole, the men watch and erupt. 9:16 window starts on the TV and pans left to the men over 1.2–2.8 s of the clip. Lockup from 15.0 s in the upper band (pill y 300–706), the last 0.25 s fades to dark grey | owner's Kling 3.0 clip `0c1646c7` (source 0.0–5.0 s), Higgsfield 4k upscale job `dd8edf76` | the clip's own sound (−4 dB; the cheer) with TripNerd's real crowd swell (V24, shaped) under the eruption |

## 3. Provenance, disclosure, brand fidelity, spend (FACT)
- **Real:** the thread (composited); the gallery murmur (V16) and the crowd swell (V24), TripNerd's own recordings; the logo file `46ae277a`, unaltered, in the lockup.
- **Generated:** both clips after the thread, made in the owner's account (his spend; the ledger shows Seedance 2.5 −240 at 22:42 and Kling v3.0 entries). This build generated nothing. **Touch-up spend by this build:** two 4k video upscales (ledger figures in the worklog).
- **Brand fidelity (hard gate, `servicepow-brand-fidelity`): FAIL in the source, mitigated in the cut, the owner decides.** Clip B's wall carries a *generated rendering* of the TripNerd mark: the nerd head has no glasses and a different line weight (checked at full resolution against the real file). The 9:16 window keeps that wall out of frame except a possible sliver of blue hair at the right edge in the first second, and the real logo file carries the brand in the lockup. Lanyards in the same clip carry small generated "TripNerd" text and one cap carries a small red generated badge; both are unreadable at delivery size but are regenerated marks by the rule. The policy says identity assets enter production only as real files, never regenerated. Options: accept as mitigated (the owner's call, recorded), or regenerate clip B with a blank wall and plain lanyards.
- **Disclosure, per `_servicepow/policies/realism-and-disclosure.md` §3:** on-screen label at first generated frame (8.0 s, 2.5 s, 40 px on a dark pill at 59–63 % of frame height, inside the clear zone), the platform AI toggle on posting, the caption line. The owner accepted the label on 2026-10-06.
- **Trade dress:** no tournament or venue name, no logo flags (plain yellow), no green jackets, no broadcast graphics; the green folding chairs stay by the owner's decision.
- **Code:** [`build/render_thread_v3.py`](build/render_thread_v3.py), [`build/assemble_v3.py`](build/assemble_v3.py), [`build/cutcheck_v3.py`](build/cutcheck_v3.py).

## 4. Machine QC (servicepow_qc.py, md5 `321ef0b7…`)
| Check | Result | Detail |
|---|---|---|
| resolution | PASS | 1080x1920 |
| fps | PASS | 24.000 |
| pix_fmt | PASS | yuv420p |
| audio 48 kHz stereo | PASS | 48000 Hz / 2 ch |
| audio peak / not silent | PASS | peak −1.0 dB, mean −20.0 dB |
| no frozen sections | PASS | none > 0.7 s |
| no black sections | PASS | none ≥ 0.3 s |
| motion gate | PASS | edge travel 19.19 px/frame (floor 1.6) |
| hook motion | WARN | first 1.2 s edge travel 0.30 (floor 1.0, WARN only): the chat opens quietly by design; the first bubble slides in over 0.6 s |
| no flash cuts | PASS | 0 detected cuts. Frame-check (`build/cutcheck_v3.py`): real picture cuts at 7.85 and 11.75 s, shortest shot 3.9 s |
| aspect | PASS | declared 9:16, got 1080x1920 |
| duration | PASS | declared 16.6 s, got 16.60 s |
| **OVERALL** | **PASS** | |
| loudness (ffmpeg loudnorm measurement) | n/a | −14.03 LUFS integrated, −1.00 dBTP (static gain +3.55 dB into a true-peak limiter) |
| speech screen (faster-whisper base + VAD) | n/a | 0 speech segments |
| frames viewed | n/a | contact sheets (2 fps) and stills at 8.3, 9.6, 11.75, 13.6, 15.4 s: the label reads, the window stays on the flag, the men's faces stay clear of the lockup |

## 5. Caption (draft)
> The thread that never books.
> Twelve months of "next year for sure", then one message. Scenes dramatized.
> tripnerd.com (link in bio)
> TripNerd is not sponsored by, affiliated with, or a partner of any tournament or venue.
> #TripNerd #spreadtheNERD #golftrip #corporatehospitality

Posting notes: original audio, sound on; set the AI label; no event name unless the owner takes decision 1 of the week-1 brief.

## 6. Dual quality gate (ran on the frozen master)
GATE_TABLE

## 7. Decision log
| Date | Decision | By |
|---|---|---|
| 2026-10-06 | Replace the v2 payoff with the owner's two clips, blended; deliver as a finished product | Karl (APPROVER) |
| 2026-10-07 | 9:16 moving windows instead of letterboxing; the window keeps the generated wall mark out of frame; the clips' own sound used under disclosure with the real recordings beneath; the brand-fidelity finding recorded for the owner rather than silently passed | Claude (director) |
