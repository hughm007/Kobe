---
title: "TripNerd Daytona 500 — Script 1 'Race day, by the clock': build spec for Friday 16 Oct"
type: brief
client: tripnerd
campaign_id: 2026-10-12-daytona-500
owner: Karl
status: draft
created: 2026-10-13
updated: 2026-10-13
tags: [client, daytona, reel, build-spec, real-footage, instagram]
---

# Script 1, "Race day, by the clock": build spec

**Target:** Instagram Reel on @tripnerd, **Friday 16 October 2026, 11 AM ET** (the plan's Friday slot).
**Length:** 17 s · 1080x1920 · 30 fps.
**Sources:** [`footage-inventory.md`](footage-inventory.md), [`scripts.md`](scripts.md) #1.

## 1. The answer: what media makes up this advert

| Type | What | Count | Why |
|---|---|---|---|
| **Stills (real photos)** | TripNerd's own race-day photos from 19 Feb 2023, with gentle push-in motion | 4 | They hold the real race moments (track, pit road, dusk, under the lights). The camera clock gives each one a true timestamp |
| **Video (real)** | Two segments of TripNerd's 2022 suite tour video | 2 | Real motion and room tone in the closing beats; the TripNerd tent and the seats over pit road |
| **Graphics (composited)** | The clock, captions, end card, real TripNerd logo | — | Readable text is never generated |
| **Sound (licensed, plus real room tone)** | Crowd and engine sound effects, a light music bed, the video's own ambience | — | No real race audio is in hand yet |
| **Generated media** | **None** | 0 | Your standing rule: real client material only. No AI animation of the photos either (that would invent motion that never happened) |

**No upscaling needed.** The layout shows each photo full width (1080 px) inside the vertical frame, over a blurred fill. The photos are 1024 px wide, so they are shown at about 1.05x (sharp), and the video is shown smaller than its native size. That avoids the soft-picture problem that cost the hosting spot points, and needs no spend.

**Upgrade slot:** if the two 2024 race-day clips in Drive (`TN_2024-02-19_daytona_V05/V06.mp4`) show real racing with real sound, one of them replaces the "under the lights" still and its audio replaces the licensed engines. Attach them by Wednesday to make Friday.

## 2. Shot list (Plan A)

Times are in the advert. Beats 1–4 are 2023; beats 5–6 are 2022.

| # | Time | Media | Source (exact) | Treatment | Clock (big) | Caption (under the picture) | Sound |
|---|---|---|---|---|---|---|---|
| 1 | 0.0–3.0 | Still | `gallery_08.jpg` 768x1024 (camera time 2023-02-19 12:26) | Portrait frame, 720 px wide (shown slightly smaller than its native size), push-in 1.00→1.05 toward the signatures on the start/finish line | **12:26 PM** | "On the track before the race." **(DRAFT)** | Frontstretch crowd walla, distant PA (no words) |
| ↳ | 3.0–3.4 | Transition | — | Swipe up (like scrolling a camera roll), 12 px motion blur. **The clock digits roll forward** like an odometer | 12:26 → 4:54 | — | Soft whoosh, mechanical clock ticks |
| 2 | 3.4–6.4 | Still | `gallery_07.jpg` 1024x771 (16:54) | 1080x813 frame, push-in 1.00→1.04 | **4:54 PM** | "Seats over pit road." **(DRAFT)** | A pack of cars passes in the distance (doppler) |
| ↳ | 6.4–6.8 | Transition | — | Swipe and clock roll | 4:54 → 6:56 | — | Whoosh, ticks |
| 3 | 6.8–9.6 | Still | `gallery_05.jpg` 1024x771 (18:56). **Crop the Sunoco sign, top left** | 1080x813 frame, push-in 1.00→1.04 | **6:56 PM** | "Still here." | A closer pass; crowd building |
| ↳ | 9.6–9.9 | Transition | — | Swipe. **The clock fades out:** this photo has no camera time, so none is shown | — | — | Engines rising |
| 4 | 9.9–12.4 | Still | `gallery_01.jpg` 1024x683 (no camera time; night, tyres smoking) | 1080x720 frame, push-in 1.00→1.08, a two-frame 1.5 % nudge on the engine peak (10.9 s) | (none) | "Under the lights." | **Peak:** full-field pass, tyre squeal, crowd roar, then **hard cut to silence** at 12.4 |
| 5 | 12.4–13.7 | Video | Suite tour `553c8ee2` **6.2–7.5 s** (the TripNerd tent and sign, no faces) | 1080x608 frame, plays real time | (none) | Kicker changes to "February 2027." · caption "Check in with us." | The video's own room tone (real); music re-enters softly |
| 6 | 13.7–15.2 | Video | Suite tour **34.0–35.5 s** (pit road from the seats) | 1080x608 frame, real time | (none) | "Your seats. Over pit road." **(DRAFT)** | Room tone plus a distant engine |
| 7 | 15.2–17.0 | End card | Approved brand-blue card: gradient (90,152,234)→(72,132,214), **real logo file** from tripnerd.com (`…_tripnerd-fan-experiences_logo@3x.png`) | Logo settles in 0.3 s | — | "Daytona Beach · February 2027" · white pill **"Talk to a Nerd"** · tripnerd.com | One engine rev blip under the logo; music button |

**Honesty rules built into the shot list:**
- Beats 1–4 are one real day (19 Feb 2023) and say so in small type ("Sun, Feb 19, 2023" under the clock).
- Beats 5–6 are from 2022 and carry no clock. The kicker switches to "February 2027", so they read as the offer, not as the same day.
- Beat 4 has no recorded time, so it shows none.

## 3. Layout and type (all text inside Instagram's safe zones)
- **Canvas:** 1080x1920.
- **Background:** each beat's own picture scaled to fill, blurred about 40 px, darkened 35 %.
- **Picture frame:** 28 px rounded corners and a soft shadow (the same look as the approved Camera Roll).
  - Landscape frames at y 600–1413 (photos) or 640–1248 (video).
  - The portrait frame at y 580–1540.
- **Kicker:** "A real TripNerd race day" (beats 1–4) / "February 2027" (beats 5–6). Montserrat SemiBold 34 px, tracking +6 %, 80 % white, centred at y 300.
- **Clock:** Montserrat ExtraBold 150 px, white, soft shadow, centred at y 360–500. Date line "Sun, Feb 19, 2023" in Montserrat Medium 36 px at y 520.
- **Caption:** Montserrat Bold 54 px, white, under the frame (y about 1450, or 1300 under video).
- **Safe zones:** nothing readable above y 280 or below y 1600 (Reels UI). The key content sits inside the 1080x1350 centre band, so the 4:5 profile-grid crop shows it.
- **Fonts:** Montserrat (open licence; matches the earlier TripNerd builds). It is **not** a confirmed TripNerd brand font.

## 4. Sound design (built separately, then mixed)
- **Licensed sound effects:** frontstretch crowd, distant and close stock-car passes, tyre squeal, crowd roar, one rev, swipe whooshes, clock ticks.
- **Real audio:** the suite video's own room tone (beats 5–6).
- **Music:** a light licensed bed, about 120 bpm, ducked under the engines; it drops out at 12.4 s with everything else and returns softly.
  - **Option:** export without music and add a track in Instagram from Meta's commercial audio library. Business accounts are limited to that library anyway.
- **Mix target:** −14 LUFS integrated, −1 dBTP, intelligible with the sound off (the captions carry the story).
- **NEEDS INPUT:** which sound-effects and music library Service Pow licenses. None is on record; Artlist and Epidemic were only named as options. Without one, the engine sounds have to come from the 2024 clips or a public-domain (CC0) library.

## 5. Plan B (if Plan A's dependencies miss Thursday noon)
**Trigger:**
- no consent for the group in `gallery_08` (two or three look like teenagers); or
- no confirmation that the 2027 package includes track access.

**What changes:**
- Drop beat 1. Open on `gallery_07` at **4:54 PM** with the kicker "A real TripNerd race day".
- Every remaining beat shows guests from behind or crowds only, so **no consent dependency remains**.
- Length about 14 s. Estimated quality 7.5 instead of 8.0: the track moment is the strongest hook.

## 6. Post package (what gets handed over with the file)
- **File:** `TripNerd_Daytona_by-the-clock_v1.mp4`
  - H.264 High, 1080x1920, 30 fps, AAC 48 kHz stereo 192 kbps, −14 LUFS.
  - Plus a cutdown with no music, for adding sound in-app.
- **Cover:** frame from beat 2 (the seats over pit road) with "4:54 PM", designed for the 4:5 grid crop.
- **Caption (draft, version A: no race name):**
  > One real TripNerd race day, by the timestamps on our guests' phones. 🏁
  > 12:26 on the track. 4:54 over pit road. Still there under the lights.
  > Daytona Beach, February 2027: seats over pit road, hospitality and the hotel handled.
  > Send this to the friend you're bringing. Talk to a Nerd at the link in bio.
  > #spreadtheNERD
- **Caption, version B (if TripNerd names the race):** the same, with "Daytona 500" in line 3, plus TripNerd's own line: "TripNerd is not sponsored by, affiliated with, or a partner of NASCAR or The Daytona 500."
- **Alt text:** "TripNerd guests at a February race day: on the track at 12:26 PM, in seats over pit road at 4:54 PM, at dusk at 6:56 PM, and under the lights; then TripNerd's hospitality tent and the view over pit road."
- **Post type (RECOMMENDATION):** a regular Reel, not a Trial Reel. This is the seasonal sell, and followers should see it. Use the Trial toggle for a hook test later.
- **Who posts:** the owner or TripNerd. Service Pow has no partner access to the account.

## 7. Schedule to Friday (ESTIMATE)

| Day | What | Who |
|---|---|---|
| **Tue 13** | Owner approves this spec. One message to TripNerd: consent for `gallery_08` (and the parents of any minors), the 2027 package lines by email, race name yes or no, approver for Friday. Owner attaches V05/V06. Owner names the sound library. | Owner |
| **Wed 14** | Build v1 (Plan A and Plan B from one render script, adapted from the approved Camera Roll renderer). Internal checks: frames at full size, mark sweep, timing, loudness. | Service Pow |
| **Wed 14 evening** | The attack review and the quality score, run on the frozen file | Service Pow |
| **Thu 15, noon** | Owner review. **Plan A or B decided** on TripNerd's answers. | Owner |
| **Thu 15, end of day** | TripNerd's approver signs off the file and the caption | TripNerd |
| **Fri 16, 11 AM ET** | Posted; Story share within the hour | Owner or TripNerd |

**Plan rule:** if TripNerd's approval misses Thursday, the post moves to the next slot rather than going out unapproved.

## 8. Blockers and risks, stated plainly
1. **Build environment.** The footage and photos are reachable only from the Higgsfield sandbox, which **failed to connect** at the time of writing (2026-10-13). This session's container has no outbound access right now (all test requests failed). Wednesday's build needs either Higgsfield reconnected, or the owner to attach the six photos and the suite video.
2. **Consent and claims:** gallery_08 (minors) and "on the track" / "seats over pit road" need TripNerd's answers. Plan B covers the consent risk.
3. **Sound licence:** see §4.
4. **The 2024 clips are unseen.** They may beat everything here, or be unusable.
5. **Quality ceiling:** estimated 8.0 for Plan A, 7.5 for Plan B. Not yet verified: nothing is built, and the gates have not run.
