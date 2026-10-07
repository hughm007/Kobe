# TN-R02 "The thread" v7 — build record (owner's v7 notes: real phone behaviour, 8 s thread, no label, drone transition, the turn and toast)

**Client:** TripNerd · **Owner / APPROVER:** Karl · **Date:** 2026-10-07 · **Format:** Instagram Reel, 9:16, 1080x1920, 24 fps, 23.00 s · **Supersedes:** v6.1 (`build-v6.1.md`)

**Owner ask (2026-10-07, verbatim in substance):** the texts float up, which a real phone does not do; replicate the phone completely with no legal issues; texting 8 s, not 10; find a workaround to remove "Scenes dramatized" and its grey highlight completely; transition to an aerial view that comes down and toward the TripNerd guests and around to behind them celebrating; if it can be done with good realism, the guy turns around and says "Thanks to TripNerd" and raises a drink, if that is allowed at Augusta; use the voice of the host from the first client-approved advert; build it and return a viewable link.

**Status:** v7 master built, machine-QC'd, speech-screened, uploaded and byte-verified; the dual gate launched on the frozen master (verdicts in §5). Owner review pending; TripNerd's approver pending.

## 1. Links (Higgsfield private storage; verified byte-for-byte after upload)
| File | Link | Bytes | MD5 |
|---|---|---|---|
| Master (mixed, 23.00 s) | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/806a5ea7-012e-4a71-9445-e4c72998ec40.mp4 | 32,580,680 | `b99e998de1e22d133f11205f3546efc5` |
| Contact sheet (2 fps, 8x6) | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/4ccb2e2f-2395-42b1-863c-d1cccd9d6e30.jpg | 550,167 | `69317d5994a9a26a3b0545aae6e86fa1` |
| Build kit (scripts, params, README) | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/e1236d79-6439-4bff-a782-9eb23fe261f1.zip | 23,273 | `4a70712fb45024a6262f548ff6d0833e` |
| Cleaned landing clip (recovery copy) | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/07124341-d23c-4d71-8970-10df7dcb4dce.mp4 | — | `7283e9171cc769609f2dd194f3b2d069` (byte-identical to the v6.1 record) |
| Turn shot, cap fix only (recovery copy) | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/50038716-9b03-4ebe-bf0d-5bb4160126cb.mp4 | — | `128011c0939c1c8c3755adf761ab6586` |

Superseded before anyone saw it: a first v7 master (`…/e7d3e9c6-0372-4b3a-8de9-0385a5ee78f8.mp4`, MD5 `6a451f77…`) built before I found the generated marks on the polo sleeve; its sheet `98ef5a30` and kit `379a7aca` go with it. Do not use.

## 2. What changed, and how each owner note was handled
| Owner note | v7 | Status |
|---|---|---|
| Texts float up; replicate the phone | New renderer (`build/render_thread_v7.py`). Messages are pinned under the header and never move once on screen (v6.1 bottom-anchored the stack, drifted it up 14 px/s and slid each message up 110 px: that was the float). Received: the typing dots appear in the message's own slot with a small spring and grow into the bubble in place. Sent: "Booked. TripNerd." is typed into a compose field, the send arrow appears, the bubble lifts from the field into its slot in 0.26 s (the app's own send motion), the field clears, "Delivered". A generic status bar (6:31, bars, battery) and a home-indicator bar were added for realism. | Done |
| No legal issues with the phone look | No platform name, no platform icons, no "iMessage" placeholder (the field says "Message"), Inter (OFL) rather than the platform's own font, generic drawn status icons. Colours and bubble shapes are generic. The look still imitates one phone's messaging app; that is the competitor lens's standing S2, not a mark. | Done; residual trade-dress risk recorded |
| Texting 8 s, not 10 | Thread 0–8.0 s (crossfade 7.7–8.0). | Done |
| Remove "Scenes dramatized" and its grey highlight | Removed entirely. The company policy (`_servicepow/policies/realism-and-disclosure.md` §3) makes the platform AI-content toggle the disclosure mechanism, not on-screen copy; the post must carry the toggle and a caption line. An on-screen label is only required for EU-targeted delivery (EU AI Act Art. 50); this ad must not be EU-targeted without one. | Done, with a posting condition |
| Transition to an aerial that comes down toward the guests and around to behind them celebrating | Two drone takes generated (Kling 3.0 pro, 6 s, silent). The orbit take (side start, arcing round to behind them, job `3808bf50`) delivered the arc but the tree line dissolves into smoke around 2.8 s, a second flag appears and small figures show on the green; rejected. The descent take (job `e89748b8`, start high behind the gallery, glides down and in, ends at eye level behind the three applauding) is used. It does not orbit. The hole's layout reshapes gradually during the descent (recorded). | Done as a descent; the orbit is not in this cut |
| The guy turns, says "Thanks to TripNerd", raises a drink | Built as a turn, a toast with a plain clear cup, and a spoken line, from one Kling 3.0 pro take with its own audio (job `be334396`). The line is **"Told you we'd make it."**, not "Thanks to TripNerd": a generated person crediting the brand is a synthetic customer endorsement, which company law forbids and the FTC rule on fake testimonials covers; disclosure does not cure it (`realism-and-disclosure.md` §2). The card carries TripNerd. | Done with a changed line |
| Use the host's voice from the first approved advert | Not done. The upload of the host's voice for cloning was blocked by this session's permission check as personal biometric data. The line uses the video model's own generated voice. | Blocked; owner decision |
| Is a drink allowed at Augusta | FACT (checked 2026-10-07): beer is sold to patrons at the concession stands, $6 a cup at the 2026 tournament (thegolfnewsnet.com 2026 concessions menu; golfmonthly.com), and drunk on the grounds. The real cups carry the tournament's mark, so the cup here is plain. Platform alcohol rules apply to the ad: age-gate the audience to 21+ in the US. | Recorded |

Timeline: thread 0–8.0 (crossfade 7.7–8.0) · landing 7.7–9.8 (bounce ~8.05, half speed 8.5–9.3 over the last of the roll, ball stops dead 9.30 about three ball-widths short, push-in 1.0→1.32x from 8.3, held at rest to 9.8) · drone 9.8–15.55 (headline "FIRST SIGHT / OF IT. / With TripNerd." 11.2–15.5) · turn 15.55–20.09 (line ~19.15–19.80) · card 20.09–23.0 (fade to white for the loop).

## 3. Provenance and spend (FACT)
- **Stills (GPT Image 2.5, high, 2k, 2.75 credits each, cost preflighted):** standing-and-applauding still with the plain cup `31ecfd1e` (from the cleaned course plate `ac6e7b91`); high aerial from behind `d6d17933`; high side aerial `9ce7dc96` (start of the rejected orbit take).
- **Video (Kling 3.0 pro, cost preflighted):** drone descent `e89748b8` (6 s, silent, 10.5 credits; start `d6d17933`, end `31ecfd1e`); drone orbit `3808bf50` (6 s, silent, 10.5 credits; rejected); turn and toast `be334396` (5 s, sound on, 12.5 credits; start `31ecfd1e`).
- **Total spend this cycle: 41.75 credits** (balance 8,057.95 → 8,016.20, measured; it matches the per-job sum, so no other spend landed on the account in between).
- **Touch-ups, no generation:** the landing clip re-cleaned with the unchanged `flagfix2.py` and `gallfix.py` (output byte-identical to v6.1); the course plate rebuilt by `build/plate.py` (farfix4's plate step); the turn shot's generated cap badge filled with the cap's navy (`build/capfix.py`); small generated light marks on the polo sleeve filled with the polo's navy (`build/sleevefix.py`; it also flattens a few bright fold highlights on navy fabric, including a background spectator's shorts).
- **Real:** TripNerd's V16 gallery murmur and V24 crowd; the real logo file on the card.
- **Blocked by the session's permission system (not retried, per its instruction):** the voice-clone upload; a Seedance cost preflight; a second pair of turn-shot takes.

## 4. QC (FACT)
- Harness (`build/qc_master.py`, the master checks of `servicepow_qc.py` extracted verbatim, md5 `605bf81e…`; the full harness is md5 `321ef0b7…`): resolution, fps, pix_fmt, audio 48k stereo, peak and level, black, motion (7.36), flash cuts (2 detected, none < 0.4 s), aspect and duration PASS; hook motion WARN (0.01, the thread opens still); **frozen sections FAIL** on the thread's holds (0.1+1.2, 1.3+1.6, 3.0+0.9, 4.0+1.2, 5.3+0.8, 6.4+1.3 s): the designed pauses between messages, recorded for the APPROVER, not passed.
- Loudness −14.00 LUFS, true peak −0.99 dBTP. Speech screen (faster-whisper + VAD): one segment, "Told you we'd make it".
- Native inspection: cap and polo clean at 17.6, 18.5, 19.4, 20.0 s; a faint smooth oval remains where the cap badge was, with a thin light arc on its left edge on the closest frames; a thin second white pole with a teal base stands beside the flagstick in the drone's last seconds and the turn shot (it is in the owner's still); the line is spoken while the cup is at his mouth, so the lips are partly hidden.
- Not verified: a human end-to-end watch at phone size; lip-sync beyond frame inspection; the drone's terrain reshaping at full speed by a person.

## 5. Dual gate (isolated agents on the frozen master MD5 `b99e998d…`; packet md5 `43000a2e…`)
Pending; rows are added as each verdict lands.

## 6. Decision log
- The orbit was attempted and rejected on realism; the descent ships. A second orbit attempt would cost about 10.5 credits a take with the same failure risk.
- The spoken line was changed from "Thanks to TripNerd" to "Told you we'd make it." on law, not taste. The owner can have the brand line said by a real, consenting TripNerd customer or host on camera.
- The voice clone waits on the owner: confirm the host in the approved advert consented to voice reuse (or that the voice is a licensed or generated one TripNerd controls) and approve the upload; the line can then be re-voiced with no new video generation.

## 7. Open items for the owner
Watch it end to end at phone size · accept or reject the thread's holds · the voice (consent and approval for the clone) · the venue look (still uncleared; it evokes one famous club and tournament, and that club is known for enforcing its marks and ticket terms) · 21+ age targeting and the AI-content toggle at posting, and no EU targeting without an on-screen label · TripNerd's approver · the headline wording.
