---
title: "Book It Now v4: the couch-to-Augusta transformation (script and generation plan)"
type: brief
client: tripnerd
owner: Karl
status: active
created: 2026-10-06
updated: 2026-10-06
tags: [reel, augusta, higgsfield, seedance, transformation, ai-motion]
---

# Book It Now v4: couch to Augusta

## Karl's direction (2026-10-06, APPROVER and SPEND_APPROVER)

- **No still images in this advert.** Every shot moves (his note: "I hate still images… in this instance it does not look good").
- **After the tap, cut back to the guy on the couch; he transforms from his couch onto a couch at Augusta.** It is "a big reality change: the couch compared to being at the event".
- **AI scope:** motion on **people-free** real photos only, plus the existing couch actor. No AI replicas of guests (chosen 2026-10-06).
- **Spend:** up to **600 credits** on Seedance 2.5, drafts first (approved 2026-10-06; live prices: 1080p 5 s = 60, 480p draft 5 s = 15; balance 10,248.4 before any v4 spend).
- **Blocked until** the four Higgsfield hosts are on this environment's allowed domains: `upload.higgsfield.ai`, `d2ol7oe51mr4n9.cloudfront.net`, `d8j0ntlcm91z4.cloudfront.net` and `d3u0tzju9qaucj.cloudfront.net`.

**Changes an earlier decision.** On 2026-10-05 the rule was "AI couch skit, real Augusta (no AI people at Augusta)". v4 puts the same AI actor on the real hospitality lawn for the transformation landing. This is Karl's call as APPROVER. **TripNerd's AI rule still binds:** the written ask to Jason must now cover the actor appearing at the venue too ([`asks-for-tripnerd.md`](asks-for-tripnerd.md)).

## Why start-and-end frames instead of a Genjutsu preset

Genjutsu's "World Shift" is a motion-transfer preset. It copies the motion and the shifting worlds from another creator's driving video. The landing would not be TripNerd's real lawn.

A Seedance 2.5 clip with **start frame = the couch** and **end frame = the actor on the real P005 lounge sofa** lands exactly on TripNerd's venue. That keeps the payoff honest: the couches he lands on are the ones guests actually used.

## Beat sheet (9:16, about 24 s)

| # | Time (s) | Picture | Source | On-screen text |
|---|---|---|---|---|
| 1 | 0.0–2.2 | He scrolls on the couch, sighs | AI motion from the couch still (TV cropped out) | "Augusta week. Still on the couch?" |
| 2 | 2.2–3.8 | DM: types AUGUSTA, sends | Code-built UI (moves) | — |
| 3 | 3.8–7.0 | Auto-reply lands, with the button | Code-built UI | (the reply) |
| 4 | 7.0–8.0 | Thumb taps "Get the Augusta details" | AI motion of the phone still; **our DM tracked onto the screen frame by frame** (AI can't garble it) | — |
| 5 | 8.0–13.0 | Back on the couch: he lowers the phone, the room peels away into daylight, his couch becomes the lounge sofa on the hospitality lawn | Seedance start-and-end frames (the transformation) | "TripNerd hosted" on landing |
| 6 | 13.0–14.8 | Push toward the front door | AI motion of P035 (event flag cropped out) | "Private executive home" |
| 7 | 14.8–17.4 | Live music on the veranda, then a pan to guests on the lawn | **Real video V25** (404×720, Lanczos up, no AI) | "Daily hospitality" |
| 8 | 17.4–19.0 | Slow slide across the desserts | AI motion of P150 (venue card softened) | "Food & drink included" |
| 9 | 19.0–21.4 | Dusk: fire tables flicker, clubhouse lights on | AI motion of P078 | "Way better than the couch." |
| 10 | 21.4–24.4 | End card | Code | "Augusta week with TripNerd" · private executive home · daily hospitality · food & drink · DM "AUGUSTA" to @tripnerd · independence line (inside the safe band) |

## Generation plan (Seedance 2.5, 9:16, no audio; 480p draft first, keepers finalized at 1080p)

| Clip | Inputs | Prompt (positive locks; no text, logos, flags or extra people in every prompt) |
|---|---|---|
| Couch | start = couch crop | Evening living room, warm 3200K lamp light. The man on the sofa scrolls his phone with his thumb, glances up, exhales, looks back down. Slight handheld drift. Nothing else changes. |
| Phone tap | start = v3.1 phone frame | Close-up of two hands holding a phone. The right thumb moves down and gives the blue button one firm tap, then lifts slightly. Camera static; the screen stays bright. |
| End frame (image) | refs = couch still (actor) + P005 lawn | The same man, same face and build, seated relaxed on the grey wicker lounge sofa in the lawn photo, drink in hand. The lawn, pines and fairway are exactly as in the photo. Navy golf polo, khaki shorts. Afternoon sun. |
| Transformation | start = couch crop, end = end frame | One continuous shot. He lowers his phone; the living room's walls and ceiling peel away into bright spring daylight; the floor becomes a manicured lawn; his indoor couch reshapes into the grey wicker lounge sofa; his t-shirt becomes a navy polo. He ends seated on the hospitality lawn, smiling. Slow push-in, photoreal. |
| House | start = P035 crop | Slow forward dolly toward the front door of this red-brick colonial house, late-afternoon sun, leaves stirring. The house, windows, shutters and garden stay exactly as they are. |
| Desserts | start = P150, tight crop below the venue card (no blur) | Slow sideways slide across the buffet: macarons in front, dessert bars behind, soft window light, shallow depth of field. The food is unchanged. |
| Dusk lawn | start = P078 crop | Slow push-in across the lawn at dusk; the fire-table flames flicker, the clubhouse string lights glow, the sky fades from peach to blue. The furniture stays as it is. |

**Estimated spend:** drafts about 105, two end-frame image takes about 30, and 1080p finals about 372, so **about 507 of the 600 approved**. Actuals come from `get_cost` and the balance before and after.

**QC on every AI clip** (by eye, once downloadable), checking for:
- changes to the real place (house details, food, furniture);
- extra people;
- text or logos;
- warping.

A clip that alters the real place is rejected. AI must not "improve" what TripNerd actually provides.

## Carried in from the v3 gate ([`qc/gate-v3-2026-10-06.md`](qc/gate-v3-2026-10-06.md))

| v3 finding (verified) | v4 response |
|---|---|
| Frozen stills; "slideshow" camera (critic) | Every shot moves: AI motion on people-free real photos, the transformation clip and the V25 real video |
| Phone composite seams (S3 forensic, held) | Fixed in v3.1 (screen corners fitted to the real edges). In v4 the DM is tracked onto the moving phone frame by frame with the same edge fit |
| Reply too long to read (critic, completeness) | Reply cut to 29 words ([`auto-reply-setup.md`](auto-reply-setup.md)); hold kept at ≥3.2 s |
| "Course passes" reads as tournament access (S3, held) | Removed from the reply and the end card until TripNerd defines it in writing |
| Implies the course is Augusta National (S3, held) | The landing caption names the place honestly ("TripNerd hosted", on the hospitality lawn). No tournament language; the independence line stays on the end card |
| "Private executive home" over an unconfirmed house (S3, held) | Stays a posting gate: TripNerd confirms P035 is the guest home. If not, the beat is cut |
| Recognisable guests in P155 (S3, held) | P155 dropped. V25 (real video, guests) needs consent |
| Softened dessert card reads as a censor block (S3, held) | No blur: the desserts start image is a tighter crop below the card (the AI renders at 1080p, so no upscale) |
| CTA button and "AUGUSTA" bubble outside the safe band; disclaimer at 71–74% of height (S2) | DM layout moved inside x 60–960 and y 15–70%; the end-card disclaimer moved up into the band |
| Thin audio: hiss bed, tap spikes, music deferred (critic 4/10) | Real mix in the master: transformation whoosh and lift, room-to-outdoor ambience bridge, taps brought down. Music is still Karl's in-app choice, so it gets a phone listen before posting |
| Skeptic VOID | The v4 Pass 3 is invoked with the packet path only, as a fresh agent |

## Posting gates added by v4

- **Jason's written OK covers the actor at the venue,** not only on the couch.
- **The whole Reel carries Instagram's AI label.**
- **The venue's OK covers the lawn background (P005) and the house (P035).** TripNerd also confirms the house is the home it provides.
- **V25 shows guests and a musician:** consent is needed, and V25's own audio is **not** used (the song's rights are unknown).
- **Never imply the course is Augusta National** ([EV-tripnerd-010](../../evidence-register.md)).
