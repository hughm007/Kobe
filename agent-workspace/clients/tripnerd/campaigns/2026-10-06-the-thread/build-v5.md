---
title: "TripNerd 'The thread' (TN-R02) — build v5 record: v4 lengthened (the landing earlier, the ball hangs longer, the gallery held through the apex, a longer card)"
type: report
client: tripnerd
campaign_id: 2026-10-06-the-thread
owner: Karl
status: draft
created: 2026-10-07
updated: 2026-10-07
tags: [campaign, reel, build-record, qc, ai-footage, disclosure, instagram]
---

# The thread — build v5

**Owner's note on v4 (2026-10-07, 01:12):** "Make the advert a little bit longer, feels too rushed." Everything else in [`build-v4.md`](build-v4.md) stands (provenance, the flag fix, the scoreboard removal, the lanyard and headline calls, the policy deviations, the design panel). This record holds only what changed.

**Status:** v5 master built, machine-QC'd, frame-checked, speech-screened, uploaded and byte-verified; the dual gate: running on the frozen master (launched 01:25 UTC); verdicts appended to §4 when it lands. Owner review pending; TripNerd's approver pending; the post must carry the platform AI label and the caption line.

## 1. Links (Higgsfield private storage; verified byte-for-byte after upload)
| File | Link | Size | MD5 |
|---|---|---|---|
| Master, 16.79 s, 1080x1920, 24 fps | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/cbfda285-85c6-4e86-af47-e6aefb0578a4.mp4 | 14,490,659 B | `f04446784ff90e24727a0fc1920aee1e` |
| Contact sheet (2 fps, 4x9) | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/65fd0f46-2ade-4e52-beac-24a988a9964c.jpg | 620,693 B | `41af1cd9f0803178f4a87e88325db10d` |
| Build kit (scripts, flag fix, params, packet, README) | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/645079c0-f0cc-480a-9dc3-911bc775a41b.zip | 18,944 B | `9dba60200ea352d3c94a3017147e0a78` |

## 2. What changed from v4 (15.38 s → 16.79 s)
| Beat | v4 | v5 | Why |
|---|---|---|---|
| The landing | source 0.7–3.3 s (2.8 s on screen); the half-speed beat ran 3.1–3.3 s, in which the ball drifts away from the cup | source 0.4–3.1 s (2.9 s on screen): the ball is in the air longer, and the half-speed beat is now 2.9–3.1 s, the last 0.2 s of its approach, so the shot ends at the ball's closest point (inside a foot) and the ball is never seen leaving | the beat the owner called out, plus the v4 gate's buyer lens: "the eruption is not earned, the ball is visibly rolling away" (S3, upheld by the picture) |
| The gallery | source 1.45–3.45 s (2.0 s), cut before the hug | source 1.15–4.15 s (3.0 s): the first rise is in, and the cut now comes 0.7 s into the two women's embrace; for that last 0.7 s their faces are in profile at readable distance | "feels too rushed"; the owner asked for the longer hold; ESTIMATE: that last 0.7 s is the part a Skeptic will pause |
| The headline | from 0.25 s after landing; no scrim | from 0.45 s after landing; a soft dark scrim behind the block; "With TripNerd." 54 px (was 46) | lets the rise read before the type; the v4 gate's client lens: the line was the least legible text in the piece |
| The card | 2.6 s | 2.9 s | breathing room; loop fade unchanged |
| Label | 8.0–12.7 s | 7.7–13.8 s | now starts with the crossfade (the v4 gate's client lens: it started 0.3 s after the first generated pixel) and covers both generated shots through to the card |
| Sound | as v4 | as v4, re-fitted to the new times (the roar leads the half-speed beat; opens on the whip at 10.6 s; ducks on the card at 13.89 s) | |

Timeline: thread 0–7.7 · landing 7.7–10.6 (punch-in from 10.0, half speed 10.2–10.6) · whip 10.6–10.89 · gallery 10.89–13.89 · card 13.89–16.79.

## 3. Machine QC (servicepow_qc.py, md5 `321ef0b7…`)
| Check | Result | Detail |
|---|---|---|
| resolution, fps, pix_fmt, audio format | PASS | 1080x1920, 24.000, yuv420p, 48 kHz stereo |
| audio peak / not silent | PASS | |
| no frozen sections | PASS | none > 0.7 s (card exempt as the endcard window) |
| no black sections | PASS | none ≥ 0.3 s |
| motion gate | PASS | |
| hook motion | WARN | first 1.2 s edge travel 0.30 (WARN only; the chat opens quietly by design) |
| no flash cuts | FAIL on the harness row, PASS on the frame-check | the detector counts the crossfade (7.92–8.08), the whip (10.67–10.83) and the loop fade (16.67–16.75) as several cuts each; `build/cutcheck_v5.py`: real picture cuts at 7.85, 10.6, 10.89 and 13.89 s; the whip (0.29 s) is the only shot under 0.4 s, by design |
| aspect, duration | PASS | 9:16; declared 16.792 s, got 16.79 s |
| **OVERALL** | **FAIL on the harness, PASS after the frame-check** (the same false positive as v4) | |
| loudness | n/a | −14.05 LUFS integrated, −0.99 dBTP (static gain +5.01 dB into a true-peak limiter) |
| speech screen (faster-whisper base + VAD) | n/a | 0 segments |
| frames viewed | n/a | stills at 7.8, 8.6, 9.6, 10.1, 10.3, 10.55, 10.75, 11.0, 11.4, 11.9, 12.5, 13.1, 13.6, 13.85, 14.1, 16.5 s: the label is on from the crossfade, the flag is plain, the ball sits by the cup at the cut, the headline reads over the scrim, the embrace is in the last frames, the card holds |

## 4. Dual quality gate
Ran 01:25–02:03 UTC on the frozen v5 master (MD5 `f0444678…`, 16.79 s): four Skeptic lenses on the Isolation Packet, the Critic scorecard, and fresh verifiers on every blocking finding (10 isolated agents, 38.2 min). **Verdict: three lenses BLOCK, the client lens PASS; Critic 7.2 ± 1.5 (7 / 7 / 7 / 8 / 7 / 7), NOT CLIENT READY, HARD FAIL on receipts; AI-artifact risk 4/10. All five blocking findings upheld by the verifiers.** Superseded by v6 (`build-v6.md`) on the owner's 01:38 note; the v4 gate is in `build-v4.md` §6.

| Lens | Verdict | Blocking (S3) | Notable S2 | Where it stands |
|---|---|---|---|---|
| Target customer | BLOCK | the putt visibly misses: the ball tracks left of the cup and rolls away through the push-in and the half-speed tail, then the gallery erupts (verified with a 100 px grid and a lighten-composite trail of every 0.1 s frame); the generated shots carry one venue's trade dress (white caddie coveralls, a stone arch bridge on the far green) | the chat's middle run is still rushed (five bubbles in 1.5 s); the foreground man is a frozen cut-out for the last 2.2 s of the eruption; seats with no view; the headline names an arrival; the harness receipt was for v4, not this master; the pending Evidence Record; "dramatized" is not "generated"; the dark cold open | in v6 the reaction is applause for a near miss (the owner's premise: "the ball never goes in"), the caddie is gone, the thread has three messages over 10 s and opens white; the far-green bridge and the sightline are in the owner's assets (open) |
| Client (TripNerd) | PASS | none | the gallery shot is a pastiche of one venue via elements beyond azaleas and pines; the flag ghost on a native frame; the implied badges/house claim without an Evidence Record or parity receipt; the trio behind a standing crowd under a headline about seeing it; S1s: "badges" is the tournament's own vocabulary, tiny generated apparel emblems, caption wording not in the packet | the badges/house lines are gone from the v6 thread; the rest are the owner's and the client's open items |
| Industry professional | BLOCK | the putt never goes in on screen (the ball rolls left past the hole 10.0–10.54 s); the far green carries the venue's caddie uniform and an all-green-clad official | the whip is built with hard vertical seams and a flat-fill region (the critic saw the seam at native x≈840); the headline sits over the man's raised hand; geography, light and lens change across the whip; the chairs slide on a locked camera; the hug gets no beat before the card; the dark cold open; S1s on the label dropping two frames early, small chat type, the loop seam colour, the crossfade superimposing UI on the green | the whip render seam is a real defect to fix in the whip renderer (recorded, not yet fixed); the loop seam colour is fixed in v6; the rest are in the owner's assets or his calls |
| Competitor | BLOCK | the white-coverall caddies with green caps on the green for the full 3 s, centre frame under the headline | logo-shaped roundels on the chair backs and an emblem on a cap in the Kling eruption; a specific tournament implied with no affiliation disclaimer on the card; the headline and "badges" imply access without receipts; the disclosure wording and size; rights to the real crowd audio recorded inside a venue; S1s: the flag trace, a credential/garment tag, the putt never dropping, the device being logo-swappable | the caddie is removed in v6 (new take); the chair-back marks are checked in the v6 gate on the new clip; the affiliation disclaimer is in the caption draft and could go on the card (owner's call); V24 is TripNerd's own recording, a rights receipt for it is the client's to file |

**Critic's hard failures:** BC-19 parity (not run), BC-25 human watch (owner), BC-16 Evidence Record, BC-33 biomechanics receipt, BC-30 per-clip gate, BC-29/43 preflight receipt, BC-24, BC-41 QA2, BC-10 flash cuts (the 0.29 s whip unaccepted; lengthened to 0.42 s in v6), receipt provenance (the harness block in the v5 packet was headed with the v4 filename and carried no MD5 binding; v6 binds the harness output to the delivered file by MD5), BC-22 score floor. Semantic sweep: none. The critic's notes also record that the ball is last seen about a foot short-left of the cup and never drops, that the golfer and caddy are already embracing 0.3 s after the ball arrives, and the whip seam.

**Correction to this record (FACT, measured by two verifiers and re-checked on the v6 frames):** the half-speed beat does not end on the ball's closest point. The ball passes the cup on the left at about source 2.75–2.9 s and the last 0.2 s of source (0.4 s on screen, at half speed) show it rolling away, about a foot past. The wording above ("ends at the ball's closest point… never seen leaving") was wrong. The v6 packet repeated it; `build-v6.md` carries the correction.

## 5. Decision log
| Date | Decision | By |
|---|---|---|
| 2026-10-07 | Longer; "feels too rushed" | Karl (APPROVER) |
| 2026-10-07 | +0.3 s on the ball in the air, the half-speed beat moved onto the approach so the ball never leaves the cup on screen, +1.0 s on the gallery (through the turn, short of the embrace), +0.3 s on the card, a scrim under the headline, the label from the crossfade; nothing regenerated, no spend | Claude (director) |
