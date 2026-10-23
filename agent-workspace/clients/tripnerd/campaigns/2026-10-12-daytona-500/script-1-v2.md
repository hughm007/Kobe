---
title: "TripNerd Daytona Script 1 v2 'Race day, by the clock': cold review and refined script"
type: brief
client: tripnerd
campaign_id: 2026-10-12-daytona-500
owner: Karl
status: draft
created: 2026-10-13
updated: 2026-10-13
tags: [client, daytona, reel, script, review, real-footage]
supersedes: script-1-build-spec.md (v1 shot list; its layout and post-package sections still apply where not changed here)
---

# Script 1 v2: "Race day, by the clock"

## 1. What the cold reviews found in v1
Three reviews ran on 2026-10-13, each in a fresh context with no access to the production reasoning:
- **Creative Critic** (scored the plan): CANNOT ASSESS, because nothing is rendered. **Predicted HARD FAIL, 5.8 ± 1.5.**
- **Skeptic** (attacked the plan): **BLOCK**, with 3 S4 and 7 S3 findings.
- **Hook tournament:** 10 opening candidates, 3 survived.

I checked the main findings against the media myself (FACT):

| v1 problem | Who caught it | Severity |
|---|---|---|
| The track photo (gallery_08) shows apparent minors with no releases, a legible "VIP" credential, NASCAR, speedway and brand logos, and implies 2027 track and garage access | All three | S4 / hard fail |
| 2022 suite footage sits under "February 2027 · Your seats" with no 2022 label | Skeptic | S4 |
| Offer claims (seats, hospitality, hotel) have no Evidence Record | Skeptic, critic | S4 |
| gallery_05 (6:56 PM) and gallery_01 are **the same burnout moment**, but were shown as a progression | Critic, skeptic | Hard fail / S2 |
| "Full-field pass" sound over a single car's burnout | All three | Hard fail / S3 |
| The 2022 suite video shows **empty pre-race stands**, not "packed" (my description was wrong); gallery_05 is full night, not "dusk" | Critic, skeptic | S2 |
| Text outside Instagram's safe area; the offer first appears at 12.4 s and is small | Critic, skeptic | S3 |
| A "Hendrick" banner in gallery_07 (the planned cover); the Sunoco sign | All three | S3 |
| Possible speech in the suite video's audio at 6–8 s (my own transcription read words there at low confidence) | Skeptic; my audio check | S1–S2 |

**Plan choice:** neither v1 option survives. Plan A (5.8 predicted, blocked) and Plan B (about 5.5) are both replaced by the v2 cut below. **v2 is the best predicted outcome** because it:
- needs no consent;
- makes almost no unconfirmed claims;
- opens on the strongest frame in the folder.

## 2. The refined script (v2): 16.4 s, 9:16, real media only

**The arc in one line:** open on the night burnout with a guest filming it → rewind the clock → headsets on over pit road → back to 6:56 PM, the wide reveal of the guests → the clock rolls to FEB 21, 2027 → TripNerd's real seats and tent, labelled 2022 → the end card.

| # | Time | Media (exact) | Clock / date line | Caption (inside the picture, on a scrim) | Sound |
|---|---|---|---|---|---|
| 1 | 0.0–2.4 | **Still** gallery_05 (camera time 2023-02-19 18:56), full frame. The Sunoco sign hand-blurred (no generative fill). Push-in 1.00→1.06 toward the car. At 1.0 s a thin ring highlights the lower-left guest's raised phone | **6:56 PM** · "Sun, Feb 19, 2023" | "Still filming." | Engine held at high revs, tyre squeal, crowd cheering (licensed; one car, matching the picture) |
| 2 | 2.4–3.0 | Transition: the frame slides down; the clock **spins backward** 6:56 → 4:54 | rolling | "Rewind." | Rewind whir, backward ticks |
| 3 | 3.0–6.0 | **Still** gallery_07 (16:54), the "Hendrick" banner and painted track logo hand-blurred, right ~12 % cropped (profile faces, and clear of the Reels buttons). Push-in toward the red headsets | **4:54 PM** | "Headsets on." | A race pack passing in the distance (a car is visibly on track here) plus crowd |
| 4 | 6.0–6.5 | Transition: slide up; the clock rolls forward 4:54 → 6:56 | rolling | — | Ticks, engine rising |
| 5 | 6.5–9.0 | **Still** gallery_05 again, the **wide reveal**: the beat 1 crop eases out to show the guests in the foreground watching and filming. Same moment, so the clock stays 6:56 | **6:56 PM** | "Still here." | Burnout audio peaks with the crowd roar, then a **hard cut** to near-silence at 9.0 |
| 6 | 9.0–9.6 | **The clock payoff:** the 150 px odometer rolls "6:56 PM" → **"FEB 21, 2027"**; the date line becomes "Daytona Beach" | **FEB 21, 2027** · "Daytona Beach" | — | One heavy tick; room tone fades in |
| 7 | 9.6–11.6 | **Video**, TripNerd's suite tour, source **42.0–44.0 s** (the host out of frame, the medical vehicle gone; pit boxes and pit road from TripNerd's seats). Crop toward 4:3 (about 960x720, 1.125x): bottom-left banner and painted lettering out, tower lettering out. Small corner label: **"TripNerd seats · 2022"** | FEB 21, 2027 (held) | "Where would your group sit?" | Real room tone from 30–34 s of the same video (no speech); distant PA |
| 8 | 11.6–13.4 | **Video**, suite tour source **6.2–7.8 s**, cropped to the left ~860 px: the TripNerd gate sign, palm planter and tent; bystanders out of frame. Label: **"TripNerd's tent · 2022"** | FEB 21, 2027 (held) | "Your turn. Send this to your crew." | Clean room tone (**not** the clip's own 6–8 s audio, which may contain speech) |
| 9 | 13.4–16.4 | **End card**: the approved brand-blue gradient, the **real logo file**, one entrance move (logo settles 0.3 s) | — | Headline **"Your group's timestamps start here."** · "Daytona Beach · Feb 21, 2027" · white pill **"Talk to a Nerd"** | One engine rev, then the music button |

**Media mix:**
- **Stills:** 3 beats from 2 real photos, gallery_05 used twice (tight, then wide).
- **Video:** 2 real clips from the 2022 suite tour.
- **Graphics:** the clock, captions and end card, all composited.
- **Sound:** licensed effects and music, plus real room tone.
- **Nothing generated.** No AI upscaling or frame interpolation (it would invent detail on faces and text).

**Layout (fixes the safe-area failure):**
- Clock at y 290–420 (130–150 px Montserrat ExtraBold); date line at y 430–470.
- Picture 1080 wide, 4:3 (about 813 tall), at y 490–1303.
- Captions inside the picture's lower band, on a dark scrim, at y 1190–1290.
- **Every readable element sits between y 288 and 1344** (Reels UI clear). The key content sits inside the 4:5 grid crop.

**Cover:** beat 1 frame with "6:56 PM". It matches the hook, and a sent Reel shows its cover in the DM thread.

**Caption (draft):**
> 4:54 PM, headsets on. 6:56 PM, still filming. Who's filming for your group next February? 🏁
> One real TripNerd race day, told by the photos' own timestamps.
> Daytona Beach · Feb 21, 2027. Talk to a Nerd at the link in bio.
> #spreadtheNERD

- **Package lines** ("seats over pit road, hospitality and the hotel") go in **only** after TripNerd confirms them in writing.
- **The race name** goes in only if TripNerd agrees, with their disclaimer: "TripNerd is not sponsored by, affiliated with, or a partner of NASCAR or The Daytona 500."

**Optional B hook, for a Trial Reel test** (from the tournament): replace beats 1–2 with gallery_07, marks blurred. Small text: "We're called TripNerd, so:"; big text: "Race day, timestamped." Then "4:54 PM", with three shutter clicks. Judge on 3-second hold and sends per reach, not average watch time.

## 3. Predicted quality (ESTIMATE; not a gate result)

| Axis (ServicePow-6) | v1 predicted (critic) | v2 my estimate | Why it moves |
|---|---|---|---|
| Doesn't look AI | 9 | 9 | All real |
| Hook inside 2 s | 5 | 7 | Opens on the most kinetic real frame, with the device (a phone filming) in shot |
| Human presence | 6 | 6.5 | Guests filming and in headsets; still no faces (by design, for consent) |
| Format fit | 5 | 6.5 | Safe-area layout, bigger frames, two video beats; still mostly stills on 1024 px sources |
| Audio | 5 | 7 | Sound now matches each picture; real room tone without speech |
| Message + CTA | 5 | 7 | The clock pays off in the 2027 date at 9.0 s; a question CTA and a send ask on screen |

- **v2 midpoint about 7.2 ± 1.5.** That is still below the 8.0 client-ready floor on paper.
- **What lifts it to about 8:**
  - the **phone originals** of gallery_05 and gallery_07 (sharper, bigger crops);
  - the **2024 race-day clips** from Drive, if they show racing with real sound (real motion and audio, replacing beat 3 or 7).
- **The rendered cut still needs the attack review and the quality score** before it goes to TripNerd.

## 4. Still open before Friday
1. **TripNerd, in writing:**
   - that they own the gallery photos and may use them in ads, and that the photos show their guests;
   - the camera times (phone clock, Eastern);
   - whether to name the race;
   - the 2027 package lines (only if they want them in the caption).
2. **Sound licence:** which library. None is on record.
3. **Owner:** attach the Drive clips `TN_2024-02-19_daytona_V05/V06.mp4` and, ideally, the phone originals of gallery_05 and gallery_07.
4. **Build access:** Higgsfield was failing to connect on 2026-10-13, and this container had no outbound access. The media must be attached, or Higgsfield must reconnect, before Wednesday's build.

## 5. Learning (recorded)
**What went wrong:** I described stills and video windows from contact sheets ("dusk", "packed grandstand", a separate "under the lights" moment), and the cold reviewers caught all three. The 2026-10-07 rule "never describe a generated clip from a contact sheet" applies to real media too.

**The rule:** describe every picture from a full-size view, and look for near-duplicate stills before sequencing them as a progression.
