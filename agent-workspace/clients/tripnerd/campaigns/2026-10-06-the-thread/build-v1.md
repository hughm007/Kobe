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

**Status (updated):** the owner likes the thread and rejects the stills after it; direction for v2 in [`creative-direction-v2.md`](creative-direction-v2.md). v1 master built, machine-QC'd, frame-checked, speech-screened, uploaded and byte-verified. The dual quality gate (Skeptic Pass 3, Critic scorecard) ran on the frozen master; verdicts in §6. **Owner review pending. Nothing posts without the owner and TripNerd's approver.**

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
Isolated workflow agents, packet-only. Verdicts received so far (all nine agents reported; 23.6 minutes, 840k subagent tokens).

| Lens | Verdict | Blocking findings | What they change |
|---|---|---|---|
| Client | PASS | none (S2: the wall graphic is never whole in frame during the pan; the chat's "badges" and "the house" set up one event while the footage shows another; the ® on the logo; two empty rooms carry the premium feel) | v2 names the event (the owner's direction) and raises the brand earlier |
| Target customer | BLOCK | **S3: the newest chat bubble lands at 92–97 % of frame height, inside the Reels UI zone** (a layout bug: the anchor was added to the list top; fix: anchor the newest bubble at about 60 %). S2: the lockup's handle sits in the bottom zone; the first second is two-thirds empty; the suite photo reads as an empty breakout room; rights for the gallery faces not stated | both layout fixes go into v2; the stills go (the owner's note) |
| Industry professional | BLOCK | **S3: the same UI-zone bug** (the "Booked" bubble at rows 1769–1865 of 1920). S2: a dead first 2.5 s; the month separators are set at timestamp size in mid-grey although they carry the whole joke; a soft dark obstruction (the shooter's hat or hand) pinned to the lower-left corner at 11.4–12.9 s; the in-clip push-in smears the far crowd; the two stills are slideshow filler and do not grade with the video; the lockup reads for about one second; the loop restarts with a flash from the brightest frame to an empty dark header. S1: the fake-chat format is a recognised template; venue recognisable, rights to state | all of it goes into v2: bigger separators, a live first second, crop the corner obstruction, no digital push on the video, a longer lockup, a loop seam, and the stills go |
| Competitor | BLOCK | **S4: the tournament footage has no stated owner or licence in the packet** (a packet omission: V24 is TripNerd's own recording under Taylor's standing authorisation of 2026-09-28, which the verification step is given). S3: the picture names a venue the text does not | resolved by evidence; v2's event choice removes the mismatch |

| Critic (ServicePow-6) | REVISE | Midpoint **7.5 ± 1.5** (floor 8.0): doesn't-look-AI 9 · hook inside 2 s 7 · human presence 7 · format fit 7 · audio design 8 (from measured facts) · message + CTA clarity 7. AI-artefact risk **2/10**. Formal hard failure: the packet carried no registry receipts (BC-16/17/18/19/20/21/25/32) and no Campaign Bible, so readiness is CANNOT ASSESS by the scorecard's own rule; the Critic called it "a verification block, not a defect seen on screen". | v2's packet states provenance, disclosure and the receipts; the "no verb in the close" note stands for the owner |
| Verification (4 blocking findings, each attacked by a fresh agent) | all upheld | The two UI-zone findings confirmed by pixel measurement (bubble rows 1770–1865 of 1920); the provenance omission confirmed as a packet fact; the venue mismatch confirmed from the frames | v2 fixes all four by design |

Carried into v2 as rules: bubble anchor at ~60 %, lockup bottom at or above 65 %, drop the years from the separators, confirm the ® with TripNerd, state footage provenance in every packet.

## 7. Decision log
| Date | Decision | By |
|---|---|---|
| 2026-10-06 | Build script 1 "The thread" now | Karl (APPROVER) |
| 2026-10-06 | Thread copy event-agnostic ("Golf trip. This year?"); the Drive check-in photo replaced by the suite-wall photo; 4 credits of touch-up upscales; the flash-cut row overridden on frame-check evidence | Claude (director), recorded for the owner |
