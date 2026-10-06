---
title: "TripNerd 'The thread' (TN-R02) — build v2 record: Augusta week, real house + Higgsfield course, AI label accepted"
type: report
client: tripnerd
campaign_id: 2026-10-06-the-thread
owner: Karl
status: draft
created: 2026-10-06
updated: 2026-10-06
tags: [campaign, reel, build-record, qc, ai-footage, disclosure, augusta, instagram]
---

# The thread — build v2

**Owner's decisions (2026-10-06, late):** Augusta; accept the AI label; green chairs in; "build it". Assumed where unanswered: "badges" and "the house" stay (they match the published package); the Drive house photos remain unreachable, so the website house photo and the owner's porch clip carry the house.

**Status:** v2 master built, machine-QC'd, frame-checked, speech-screened, uploaded and byte-verified; the dual gate ran on the frozen master (§6). **Owner review pending; TripNerd's approver pending. The post must carry the platform AI label and the caption line. Nothing posts without both approvals.**

## 1. Links (Higgsfield private storage; verified byte-for-byte after upload)
| File | Link | Size | MD5 |
|---|---|---|---|
| Master, 16.0 s, 1080x1920, 24 fps | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/7513e7f6-5b80-4dcf-96ce-36d643d4c003.mp4 | 11,440,115 B | `d14b3cafae52fc827384da7c3e8a31bf` |
| Contact sheet (2 fps, 4x8) | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/14f8f37b-6208-4018-b40a-7b641a55a380.jpg | 895,497 B | `d3ab386ed17d7cd0e7ba6916757af6bf` |
| Build kit (scripts, packet, README) | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/ec4448a9-8bde-4e19-ac36-adc8d9873eba.zip | 11,133 B | `41508906b70749a2fb8c3c59267f6cc2` |

## 2. As built (16.0 s, 24 fps throughout: the Kling clips are native 24)
| Time | Picture | Source | Sound |
|---|---|---|---|
| 0.0–8.0 | The thread, v2: the list hangs from 60 % of frame height and grows upward (the newest bubble never enters the Reels UI zone); month separators without years, set larger and brighter; "haha let's go" after "100%"; the first bubble slides in from low in the frame; after "Booked. TripNerd." the list settles upward so nothing freezes | composited (`build/render_thread_v2.py`) | synthesised tones per message, the 'sent' swoosh |
| 8.0–9.2 | The real brick house among pines, 6 % push | tripnerd.com Augusta page photo, Higgsfield 2k upscale (job `46759aab`, 2 credits) | the real gallery murmur rises (Gallery walk 1, TripNerd's own recording, shaped) |
| 9.2–10.5 | GENERATED: the porch at golden hour, three guests at the table. On-screen label **"Course scenes dramatised"** 9.2–11.7 s | owner's Kling 3.0 clip `448b8e8f` | murmur |
| 10.5–11.8 | GENERATED: gallery POV under the pines, straw hats | owner's Kling clip `57eb5c7e` | murmur, present |
| 11.8–12.5 | GENERATED: the ball through the pines | owner's Kling clip `288abcb7` | murmur |
| 12.5–14.6 | GENERATED: the green, the plain yellow flag, azaleas and the seated gallery in green chairs; the ball drops in, lands past the flag, spins back and stops by the hole | owner's Kling clip `379c3ae7` | hush, then the real crowd swell from 14.15 s (V24, low-passed) |
| 14.6–16.0 | GENERATED: the man in the chair, content (1.28x, top-anchored so his face stays above the lockup); the lockup fades in at 14.6, pill bottom at 1240 px; the last 0.25 s fades to the chat's dark grey for the loop | owner's Kling clip `36068f8b`; brand files | the swell decays under the lockup |

No event, venue or tournament is named. The chat is a dramatisation; the generated people are actors in a scenario, never customers or endorsers. The only claim on screen is the approved line.

## 3. Provenance, disclosure and spend (FACT)
- **Real:** the thread (composited); the house photo (TripNerd's own, Taylor's standing authorisation); the gallery murmur and the crowd swell (TripNerd's own recordings V16 and V24); the logo file `46ae277a`, unaltered.
- **Generated:** five Kling 3.0 clips made in the owner's Higgsfield account on 2026-10-06 (the owner's own session; spend on them is the owner's, visible in the ledger as Kling v3.0 entries). This build generated nothing new. **Touch-up spend by this build: 2 credits** (one image upscale).
- **Disclosure, per `_servicepow/policies/realism-and-disclosure.md` §3:** on-screen label at first exposure of generated imagery (9.2 s, 2.5 s, 36 px on a dark pill, inside the clear zone), the platform AI toggle on posting, and the caption line "Course scenes dramatised." The owner accepted the label on 2026-10-06.
- **Trade dress:** no tournament or venue name, no logo flags (plain yellow), no green jackets, no broadcast graphics. The green folding chairs stay by the owner's decision; the non-affiliation line stays in the caption.
- **Code:** [`build/render_thread_v2.py`](build/render_thread_v2.py), [`build/assemble_v2.py`](build/assemble_v2.py), [`build/cutcheck_v2.py`](build/cutcheck_v2.py).

## 4. Machine QC (servicepow_qc.py, md5 `321ef0b7…`)
| Row | Result |
|---|---|
| resolution · fps (24.000) · pix_fmt · audio 48k stereo · peak/not-silent (peak −1.0 dB, mean −20.9 dB) · no-frozen · no-black · motion (22.69 px/frame) · aspect · duration (16.00 s) | **PASS** |
| hook-motion | **WARN**: first 1.2 s edge travel 0.29 (floor 1.0, WARN only); the hook is one bubble sliding in on a dark screen, by design. |
| no-flash-cuts | **FAIL on the row, overridden by frame-check** (`cutcheck_v2.py`): the two sub-0.4 s "shots" are at 15.83 and 15.92 s, inside the 0.25 s fade to dark at the tail, not cuts; the real picture cuts are 8.0, 9.2, 10.5, 11.8, 12.5, 14.6 s and the shortest shot is 0.7 s. Filed in the harness learnings. |
| loudness | −14.01 LUFS integrated, −1.00 dBTP (static gain + true-peak limiter) |
| speech screen | whisper base + VAD on the mix: 0 segments |
| marks, faces, trade dress (frame check at 2 fps plus close-ups at 9.6, 12.9, 13.5, 14.2, 14.8, 15.4 s) | the flag is plain yellow; no tournament name, logo, jacket or broadcast graphic in any generated frame; the gallery wears caps and straw hats without readable marks at delivery size; the real house photo carries no mark; the lockup is the real logo file and sits on the man's torso, not his face; the disclosure line is legible at phone size (36 px on a dark pill, inside the clear zone) |
| Reels clear zone | newest chat bubble bottoms out at 1150 px (60 %); lockup bottom at 1240 px (65 %); disclosure line at 1140–1204 px |

## 5. Caption (draft)
> The thread that never books.
> Twelve months of "next year for sure", then one message. Course scenes dramatised.
> tripnerd.com (link in bio)
> TripNerd is not sponsored by, affiliated with, or a partner of any tournament or venue.
> #TripNerd #spreadtheNERD #golftrip #corporatehospitality

Posting notes: original audio, sound on; set the AI label; no event name unless the owner takes decision 1 of the week-1 brief; a Trial Reel candidate.

## 6. Dual quality gate (ran on the frozen master)
GATE_TABLE

## 7. Decision log
| Date | Decision | By |
|---|---|---|
| 2026-10-06 | Augusta; AI label accepted; green chairs in; build v2 | Karl (APPROVER) |
| 2026-10-06 | 24 fps master (the generated clips are native 24); the Sawgrass roar replaced by a shaped crowd swell under an Augusta picture; the final shot re-framed so the lockup never covers a face; the on-screen disclosure line added per policy | Claude (director), recorded for the owner |
