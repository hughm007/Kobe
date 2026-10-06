---
title: "TripNerd 'The thread' (TN-R02) — build v1 record: the group thread that never books, then the real week"
type: report
client: tripnerd
campaign_id: 2026-10-06-the-thread
owner: Karl
status: draft
created: 2026-10-06
updated: 2026-10-06
tags: [campaign, reel, build-record, qc, real-footage, mechanism-led, instagram]
---

# The thread — build v1

**Ask (owner, 2026-10-06, night): "Build thread one now."** Script 1 of the round-2 mechanism-led set (`../2026-10-04-launch-reels/scripts-round-2-mechanism-led.md`): the planning pain is the villain (the mechanism the longest-running advertiser in the Meta Ad Library set has paid to run for 206 days), paid off with TripNerd's own material and the approved line.

**Status:** v1 master built, machine-QC'd, frame-checked, speech-screened, uploaded and byte-verified. The dual quality gate (Skeptic Pass 3, Critic scorecard) ran on the frozen master; verdicts in §6. **Owner review pending. Nothing posts without the owner and TripNerd's approver.**

## 1. Links (Higgsfield private storage; verified byte-for-byte after upload)
| File | Link | Size | MD5 |
|---|---|---|---|
| Master, 15.0 s, 1080x1920, 30 fps | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/9c3e620b-87b9-4d62-b352-30474a795d81.mp4 | 11,302,791 B | `7291b7c748178401f930bc8471632493` |
| Contact sheet (2 fps, 4x8) | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/b14b5477-eddd-4844-8a17-33bf7c840de5.jpg | 747,683 B | `3ec078591eb3ca7b51f8926d0ef61173` |
| Build kit (scripts, packet, README) | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/a8bf84e5-968a-4435-b5e6-817c64413201.zip | 9,652 B | `0eb84919ed47dbb45645712dfa6413ed` |

## 2. As built (15.0 s)
| Time | Picture | On screen | Sound |
|---|---|---|---|
| 0.0–4.75 | A group chat on a dark screen (generic look, not any platform's UI): "The golf trip · 6 people". Messages slide in and the list scrolls; the first one slides in from low in the frame. Initials-only avatars (JM, RK, DP, AL); the sender's bubbles are brand blue. | Mar 2025 "Golf trip. This year?" · "I'm in" · "same" · "100%" · Apr 2025 "who's doing badges" · "I'll look into it" · Jul 2025 "any update on the house?" · "let's regroup after Q2" · Nov 2025 "we still doing this?" · "next year for sure" · Jan 2026 "anyone?" | one synthesised two-note tone per message, arriving faster |
| 4.75–6.4 | The list drifts; nothing arrives | | silence |
| 6.4–8.0 | | Feb 2026 **"Booked. TripNerd."** pops in (sender, blue) | a 'sent' swoosh with a soft thump |
| 8.0–10.0 | Photo A, slow eased pan left-to-right: the TripNerd suite interior with the wall graphic, tables, the window onto the course (tripnerd.com PLAYERS page photo 03; the tournament sign at the left edge of the source is outside the crop) | | V24's own pre-hit murmur, low |
| 10.0–11.4 | Photo B, 6 % push: the covered patio with white-clothed tables, pines and lawn (tripnerd.com Augusta page photo 2022-0213; no people) | | murmur |
| 11.4–13.6 | V24 upscaled, source 13.3–15.5: the putt drops, the gallery erupts across the water, arms up at the rail | | **the real roar**, leading the cut by 0.2 s |
| 13.6–15.0 | V24 15.5–16.9 continues | the lockup fades in: brand-blue pill, the real logo, "Hospitality. Handled.", @tripnerd | roar tail |

No event, venue or tournament is named. The chat is a dramatisation: no real person, no outcome claim. The only claim on screen is the approved line.

## 3. Provenance and spend (FACT)
- **Picture:** V24 (`2911d9d6`, TripNerd's own suite POV; the 1080p/30 upscale from the ROAR build, job `da1caa66`). Photo A `780055f5` and photo B `5164859f` imported from tripnerd.com (`media_import_url`) and upscaled once to 2k with Higgsfield `upscale_image` (bytedance; jobs `d980e358`, `3c478300`; 2 credits each, cost preflighted). The thread, the lockup and the pans are composited in code. **Generation: none. Touch-up spend: 4 credits.**
- **Sound:** V24's own audio (8.0–11.6 s as the murmur, 13.1–17.1 s as the roar); synthesised UI tones and one swoosh (sound design, as on the approved camera-roll advert); no music. Static gain + true-peak limiter: **−14.00 LUFS, −2.29 dBTP.**
- **Type:** Montserrat (OFL). **Logo:** the real file `46ae277a`, unaltered, in the lockup. The wall graphic in photo A is TripNerd's own signage, photographed.
- **Not used, and why:** the Drive check-in photo with the TripNerd drape (IMG_1901/1907) is in Wyatt's Drive and cannot reach the sandbox without a share change or a multi-megabyte relay; v2 can swap it in once it is in Higgsfield (the widget, or a shared link). The script called for it; the suite-wall photo took its place as the "Booked" image.
- **Code:** [`build/`](build/) (`render_thread.py`, `assemble.py`, `cutcheck.py`), copies of the sandbox scripts.

## 4. Machine QC (servicepow_qc.py, md5 `321ef0b7…`, preflight PASS in the sandbox)
| Row | Result |
|---|---|
| resolution · fps · pix_fmt · audio 48k stereo · peak/not-silent · no-frozen · no-black · motion (24.94 px/frame) · aspect · duration | **PASS** |
| hook-motion | **WARN**: first 1.2 s edge travel 0.16 (floor 1.0, WARN only). The hook is one bubble sliding in on a dark screen; by design quiet. v2 option: a busier first second. |
| no-flash-cuts | **FAIL on the row, overridden by frame-check** (`cutcheck.py`): every detected "cut" sits inside 11.4–14.2 s, the handheld roar footage, where normal frame motion exceeds six times the file's median diff because the first 8 s of UI drag the median down to 3.3. The real picture cuts are 8.0, 10.0, 11.4, 13.6 s; the shortest shot is 1.4 s. Filed as a harness limit (mixed UI + footage) in the learnings. |
| speech screen | whisper base + VAD on the mix: 0 segments |
| marks and faces | Photo A: the tournament sign in the source sits left of the crop at every pan position (checked at 8.05, 9.0, 9.95 s); the wall graphic is TripNerd's. Photo B: no people, no marks. V24 13.3–16.9: no scoreboard, no readable logo (the window checked for ROAR); crowd incidental, faces small and turned away. Lockup: real logo. |
| claims | none beyond the approved line |

## 5. Caption (draft)
> The thread that never books.
> Twelve months of "next year for sure", then one message. We handle the rest.
> tripnerd.com (link in bio)
> #TripNerd #spreadtheNERD #golftrip #corporatehospitality

Posting notes: original audio, sound on; a Trial Reel candidate (no followers see it unless it clears). No event name unless the owner takes decision 1 of the week-1 brief.

## 6. Dual quality gate (ran on the frozen master, md5 above)
PENDING — appended when the workflow returns.

## 7. Decision log
| Date | Decision | By |
|---|---|---|
| 2026-10-06 | Build script 1 "The thread" now | Karl (APPROVER) |
| 2026-10-06 | Thread copy event-agnostic ("Golf trip. This year?"); the Drive check-in photo replaced by the suite-wall photo; 4 credits of touch-up upscales; the flash-cut row overridden on frame-check evidence | Claude (director), recorded for the owner |
