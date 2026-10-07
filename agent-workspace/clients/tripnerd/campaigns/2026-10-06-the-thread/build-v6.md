# TN-R02 "The thread" v6 — build record (phone-style thread, three messages, applause not eruption)

**Client:** TripNerd · **Owner / APPROVER:** Karl · **Date:** 2026-10-07 (early UTC) · **Format:** Instagram Reel, 9:16, 1080x1920, 24 fps, 19.58 s · **Supersedes:** v5 (`build-v5.md`)

**Owner's note on v5 (01:38 UTC, verbatim):** "Make the text as formatted like Apple text messages, like iPhone, and only have like two or three messages and make it a lot slower and stop making the caddy and the golfer hug. And the ball never goes in, so don't make them too excited, just like clapping because it was a good shot. make these fixes and then give me the advert back."

**Status:** v6 master built, machine-QC'd, frame-checked, speech-screened, uploaded and byte-verified; the dual gate launched on the frozen master (verdict appended to §5 when it lands). Owner review pending; TripNerd's approver pending; the post must carry the platform AI label and the caption line. Two rows need the APPROVER's explicit acceptance (§4).

## 1. Links (Higgsfield private storage; master and sheet verified byte-for-byte after upload)
| File | Link | Bytes | MD5 |
|---|---|---|---|
| Master (mixed, 19.58 s) | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/ee193f15-8a24-49a0-bcf9-b5dd852d602f.mp4 | 13,569,300 | `993bba8d07edd90112c3a8333f961c12` |
| Contact sheet (2 fps, 8x5) | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/da10c3cf-c822-4e79-b1a5-ca4234614149.jpg | 94,109 | `f99e7d50c4f2f25c581ddc3651cf7a24` |
| Build kit (scripts, params, packet, README) | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/8618ffa1-ff71-4675-acb9-61760ffcf905.zip | 20,831 | `a1fa6266ca04a1dd30fc2eacac5d8e83` |

## 2. What changed from v5 (16.79 s → 19.58 s)
| Element | v5 | v6 | Why |
|---|---|---|---|
| The thread | a dark custom chat, twelve messages over 7.7 s | a white phone-style thread in the look of a current phone messaging app: grey received bubbles with tails, one blue sent bubble, a typing indicator, day/time separators, a "Delivered" receipt, initials avatars, "The golf trip ›" header; three messages a year apart ("Golf trip this year?" / "next year for sure" / "Booked. TripNerd."), 10.25 s; no platform name, icons or status bar | the owner's ask: iPhone-style, two or three messages, a lot slower. The names Jake and Ryan and the messages are fictional (my call; the owner can rename) |
| The gallery | the three spring up, the crowd waves, the two women hug; a golfer and caddie embrace on the far green | a new take from the owner's still with the golfer and caddie cloned out: the three stand in place and applaud, the crowd behind applauds, cut before the woman on the right turns (source 0.9–4.3 s) | the owner's ask: no hug, applause not excitement (the ball never goes in); the caddie's venue-specific uniform (the v4 gate's S3) leaves with him |
| Sound | the real V24 roar at −5/−4 dB, whoosh −9, thump −6 | the same V24 crowd at −11/−10 dB (reads as applause), whoosh −12, thump −10, the Kling applause at −4 carrying the gallery | an applause-level beat, not a roar |
| The whip | 7 frames (0.29 s) | 10 frames (0.42 s) | clears the registry's 0.4 s flash-cut floor that the v4 critic flagged as unaccepted |
| Loop seam | the card fades to the chat's dark grey | fades to white | the thread now opens white |
| Timeline | thread 0–7.7 · landing 7.7–10.6 · whip 10.6–10.89 · gallery 10.89–13.89 · card 13.89–16.79 | thread 0–10.25 (crossfade 9.95–10.25) · landing to 12.85 (push from 12.25, half speed 12.45–12.85) · whip 12.85–13.27 · gallery 13.27–16.67 (headline from 13.72) · card 16.67–19.58 · label 9.95–16.57 | |

Unchanged: the landing cut (the owner's Seedance clip, flag emblem painted out; see the correction below), the headline "FIRST SIGHT / OF IT. / With TripNerd." over a scrim, the brand-blue card from the real logo file, the label "Scenes dramatized" from the first generated pixel to the card.

**Correction (FACT, measured on native crops at 12.10, 12.30, 12.50, 12.65, 12.75 and 12.84 s, and by the v5 gate's two verifiers):** the landing's half-speed beat does not end on the ball's closest point, as the v5 record and the v6 packet said. The ball passes the cup on its left at about 12.3–12.5 s and the last 0.4 s on screen show it rolling away, about a foot past, as the shot ends. In this cut that is the story the owner specified ("the ball never goes in"): a near miss, and applause for a good shot. Ending the shot 0.2 s earlier, on the closest point, is a one-line change in `params_v6.json` (A_SLOW 2.30, A_OUT 2.50) if the owner prefers the ball to finish beside the hole; not made without him, because it would also need a fresh gate.

## 3. Provenance, disclosure, brand fidelity, trade dress, spend (FACT unless marked)
- **Start image:** the owner's GPT Image 2 still (`8dec124e`, 2880x2880) with the scoreboard already replaced (v4) and now the golfer and caddie on the far green replaced by the green beside them (a feathered clone of the still's own pixels, box x 1118–1330, y 935–1300, no generation), cropped and recomposited into the v4 outpaint at full resolution: `start_v6.png`, MD5 `366d501aed8c357873d630f77ad31d4a`, media `aaf05937`. Viewed before generation: an empty green with the yellow flag, chairs and crowd intact.
- **Applause clip:** Kling 3.0 pro, 5 s, 9:16, sound on, job `7bc4c0e2-34c1-49f1-9f6a-2355f68e01e5`, MD5 `00298daecaacbcff829a2326be8f377a`, 1080x1920 24 fps 5.04 s. Prompt (mine): the three stand up in place and applaud, the man claps at chest height and nods, the women clap and lean slightly toward each other, the crowd behind stands and applauds with a few hands raised briefly, feet on the grass, chairs planted, backs and profiles to camera, plain blank lanyard straps, a slow handheld push, the empty green and the yellow flag beyond; sound: applause and murmur only. Cost preflighted with `get_cost` (12.5 credits) before submission; the preset recommendation ("IN THE DARK") was declined and the literal prompt submitted. Inspected at 4 fps on a contact sheet and at native crops (1.5, 3.0, 4.3, 4.8 s): the rise starts at about 1.0 s, everyone stays on their feet in place, no jump, no embrace; the woman on the right turns toward the others after 4.5 s, so the cut leaves at 4.3 s; lanyards are plain straps; caps and visor carry no mark; a small generic garment tag sits at the man's collar (illegible at native resolution, the same class the v4 competitor lens flagged). Speech screen on the clip's audio: 0 segments.
- **Spend (FACT, ledger):** Kling v3.0 −12.5 credits at 01:42:48 UTC. Nothing else by this build (the outpaint from v4 was reused). Balance before the build 8,417.05 (01:40 UTC). **Ledger note:** the other spends in the same window (Kling v3.0 −25 at 01:41, Seedance 2.5 −84 twice at 01:41, Nano Banana 2.1 −3 four times at 01:27–01:31) are the owner's own work in the account, not this session's.
- **Disclosure:** on-screen "Scenes dramatized" from the crossfade (9.95 s) to 16.57 s, over both generated shots; the platform AI label and the caption line at posting (owner accepted 2026-10-06). Generated people are actors in a scenario, never customers or endorsers; nobody speaks (speech screen on the mix: 0 segments).
- **Brand fidelity:** the real logo file on the card, unaltered; lanyards plain straps; no mark on caps, visor, chairs or flag in the new clip at native crops; the landing clip's flag emblem stays painted out (checked at 11.45 s). The thread carries "Booked. TripNerd." as composited type.
- **Trade dress:** the caddie in white coveralls is gone (removed from the still before generation). Still present and the owner's standing clearance item: the venue-evoking ensemble of yellow flag, azaleas, pines and green folding chairs; the green tops on two seated patrons and the small generated tags on chair backs in the owner's landing clip (not recoloured or painted; his call). No event, venue or tournament is named; the thread no longer mentions badges or a house.
- **The phone look (design choice, recorded):** the thread is styled after a current phone messaging app (bubble shapes, colours, typing dots, receipts) without its name, icons, status bar or carrier; fictional names and messages. The owner asked for exactly this look; the client lens of the gate is briefed to judge the trade-dress exposure, and the owner decides.
- **Realism:** the performed reaction is reduced to applause per the owner's ask; faces stay turned away or in part profile; the realism floor's "no performed celebration at readable distance" is now met in spirit (an applause, not a celebration) and the owner's override of 2026-10-07 is recorded.
- **Fonts:** Inter (OFL) for the thread, Montserrat (OFL) for the headline and card.

## 4. Machine QC (servicepow_qc.py, md5 `321ef0b7…`, run on the delivered file by MD5)
| Row | Result | Note |
|---|---|---|
| resolution, fps, pix_fmt, audio format | PASS | 1080x1920, 24.000, yuv420p, 48 kHz stereo |
| audio peak / not silent | PASS | peak −1.0 dB, mean −20.3 dB |
| no frozen sections | **FAIL on the harness, recorded for the APPROVER** | four runs flagged: 0.1–1.8, 2.1–4.3, 5.0–5.9, 6.3–8.2 s. These are the holds between the three messages on the white thread (the only motion is a 14 px/s drift and the typing dots; the detector's threshold is a mean luma change of 0.35 per frame at 160 px). They are the pacing the owner asked for ("a lot slower"), not a stuck render; the frames were viewed. Not passed by me: the owner accepts the holds or asks for a faster thread (the timings are one list in `build/render_thread_v6.py`). |
| no black sections | PASS | |
| motion gate | PASS | edge travel 7.54 px/frame |
| hook motion | WARN | first 1.2 s edge travel 0.03 (WARN only; the thread opens on an empty header and the typing dots) |
| no flash cuts | **FAIL on the harness, PASS after the frame-check** | the harness compares each frame change with the global median, and the still thread collapses that median, so it flags every frame of live motion (35 "cuts"). `build/cutcheck_v6.py` uses a rolling ±1 s median: real picture cuts at 10.1 (crossfade), 12.85 and 13.27 (the whip) and 16.67 s (the card); the shortest shot is the 0.42 s whip, above the 0.4 s floor. |
| aspect, duration | PASS | 9:16; declared 19.584 s, got 19.58 s |
| **OVERALL** | **FAIL on the harness** (the two rows above), nothing else | |
| loudness | n/a | −14.10 LUFS integrated, −0.99 dBTP (static gain +3.63 dB into a true-peak limiter) |
| speech screen (faster-whisper base + VAD) | n/a | 0 segments on the mix; 0 on the Kling stem |
| frames viewed | n/a | stills at 1.0, 3.0, 6.6, 9.7 s (thread), 10.3 and 11.45 s (flag, clean), 12.10–12.84 s (the ball, native crops: passes the cup on the left, rolls about a foot past), 12.9–13.3 s (whip; native crops at 12.95, 13.05 and 13.15 s show the whip's streak made of stitched vertical bands with a soft seam at native x≈840, the v5 gate's finding; a renderer defect, visible on a paused frame, recorded for the next build), 13.3, 14.5, 15.0, 16.45 s (gallery; headline over the scrim; collar tag at native crop), 19.3 and 19.42 s (card fading to white) |

## 5. Dual quality gate
Pending (launched 02:03 UTC on master MD5 `993bba8d…`: four Skeptic lenses on `packet_v6.md`, the Critic scorecard, then verifiers on every S3/S4). The v4 gate is folded into `build-v4.md` §6; the v5 gate is still running and will be folded into `build-v5.md` §4.

## 6. Decision log
| Date | Decision | By |
|---|---|---|
| 2026-10-07 | iPhone-style thread, two or three messages, a lot slower; no golfer/caddie hug; the ball never goes in, so applause, not excitement; "make these fixes and give me the advert back" | Karl (APPROVER) |
| 2026-10-07 | Fictional first names Jake and Ryan; three messages a year apart; no platform name, icons or status bar; the holds between messages kept as asked (harness freeze row recorded, not passed) | Service Pow (this build) |
| 2026-10-07 | Golfer and caddie cloned out of the owner's still before the new take (also removes the caddie-uniform cue the v4 gate blocked on); one Kling 3.0 pro take, 12.5 credits, on the owner's "make these fixes" instruction and the v4 precedent | Service Pow (this build) |
| 2026-10-07 | The whip lengthened to 0.42 s; the loop seam fades to white; the crowd sound 6 dB lower | Service Pow (this build) |
| 2026-10-07 | The landing's end kept as in v5 (the ball seen rolling a foot past the cup at half speed), after measuring that it does not end on the closest point; the v5/v6 wording corrected; the 0.2 s retime offered to the owner | Service Pow (this build) |

## 7. Open (not started without the owner)
Owner review of v6 · the freeze-row acceptance (or a faster thread) · the landing's end (keep the near miss, or retime 0.2 s to end on the closest point) · the whip renderer's vertical seam (the v5 gate's finding; to fix in the renderer before the next build) · the phone-look trade-dress call · the headline wording ("SEE IT FIRST-HAND." remains the compliance alternative) · TripNerd's approver · the platform AI label at posting · the package sheet as evidence if "badges"/"the house" ever return to the copy · the bio-link parity check before posting · the green tops and chair-back tags in the owner's landing clip · the chairs-behind-a-standing-crowd staging in his still · the ® on the logo file. Nothing posted.
