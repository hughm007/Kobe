---
title: "TripNerd R01 'Two ways to watch the 17th': ChatGPT build prompt v2 (fact-checked)"
type: brief
client: tripnerd
owner: Karl
status: active
created: 2026-10-06
updated: 2026-10-06
tags: [reel, r01, chatgpt, build-prompt, the-17th]
---

# R01 "Two ways to watch the 17th": ChatGPT build prompt v2

**Slot:** Wed 7 Oct 2026, 12 PM ET.
**Status:** TripNerd's approver must say yes today. The approver is still not named (tracker).

**Karl's decisions (6 Oct):**
- **Native clips.** Cut from the native V23 and V24, not the Topaz upscales. This logs the override "720p copies acceptable for this item".
- **Drop both AI bridges.** Use real-footage whips.
- **The Reel contains no AI.** There's no AI label and no disclosure line.
- **v2.4:** B09 is now "Tickets get you in. / TripNerd gets you this."; rewording any on-screen string is forbidden (ChatGPT's first export changed B07).
- **v2.3:** a downloadable kit (prompt, end card built from the real logo file, fonts). The videos are attached from Drive by their original names.
- **v2.2:** set line breaks and a 64 px size for every string, measured with Montserrat ExtraBold. That fixes the H3 line (it can't fit in 2 lines) and the hook's lone "17th".
- **v2.1 (6 Oct, later):** end card 2.00 s (17.25 s total), H2/H3 required for Trial Reels, a clean export for Wyatt's polish pass, B04 re-described.

## 1. What changed from Grok's brief, and why

| Item in Grok's brief | Finding | Change |
|---|---|---|
| Main segments cut from V24U and V16U (`_topaz1080`) | These are AI-upscaled, and the AI touches real people's faces. The brief bans enhancing people | Cut from the native V24 and V23 (Drive → Originals by event → the-players). Topaz preserves timing, so the timecodes are unchanged |
| B08 from V16U | Native V16 measures **404×720** (ffprobe, 6 Oct). Too soft for 1080×1920 | V24 0.10–2.00. The footage log shows guests' backs at the rail, with 17 below |
| AI-01 and AI-02 scenery bridges | They put 1.2 s of AI, plus an AI label and a disclosure, on an otherwise all-real Reel. ChatGPT's image generator doesn't output 1080×1920 directly | Real whips built from neighbouring footage, with the same timing |
| "Lunch + open bar inside" | The record supports "food" and "open bar": tripnerd.com's PLAYERS page lists "Full Open Bar & Food Within Suite" (EV-tripnerd-004 evidence). "Lunch" isn't on record, and an earlier piece was blocked on "Lunch" | **"Food + open bar inside"** |
| "Our suite on the 17th." | CONFIRMED by record (EV-tripnerd-002, 006). Karl (6 Oct) wanted stronger "only through TripNerd" marketing. "Only" and "exclusive" are unprovable (other guests can use the venue's hospitality) and banned | **v2.4: "Tickets get you in. / TripNerd gets you this."** Supported by tripnerd.com's PLAYERS page, which sells the "17th Hole … Luxury Suite" (EV-tripnerd-004 evidence) |
| ChatGPT's first export (6 Oct) | ChatGPT rewrote B07 as **"The bar is steps away."** (unapproved; "steps" is only INFERRED, EV-003). B08 shows guests' faces inside the suite and a Titleist cap logo, not "backs at the rail" | The prompt now forbids rewording. The review copy was patched to the approved B07 line and the new B09 line (v2). B08 is flagged for consent |
| "2 · In the suite, out of the sun" | The V23 log shows an indoor lounge in the suite. INFERRED | Kept; ChatGPT must confirm B06 is indoors |
| B07 on screen for 1.15 s | Breaks the brief's own minimum of 1.2 s per line | B07 1.25 s, B08 1.90 s; the beat total is unchanged |
| B07 source V23 8.60–9.75 | The footage log puts the buffet counter at V23 16–19 s. We can't confirm 8.60 shows food | ChatGPT checks the frame; the fallback is V23 16.00–17.25 |
| H3 "100,000+ balls a year end up in this water" | It's an estimate, and published figures vary from about 70k to 150k ([golf.com](https://golf.com/travel/15-numbers-know-island-green-17th-hole/), [Wikipedia](https://en.wikipedia.org/wiki/TPC_at_Sawgrass)) | **"An estimated 100,000 balls a year land in this water."** |
| H2 and H3 open on the hush, then B03 repeats the same hush frames | Repeated footage 1.2 s apart reads as a glitch | The first 5.2 s are reordered for the variants (hush → roar → rail); nothing repeats |
| Caption "with lunch and the AC on", "everybody ends up at the rail" | Not on record | "food and an open bar", "you'll want to be at the rail" |
| Alt line "Most fans watch from the stands. This is where TripNerd puts you." | It generalises about other fans, and implies a guaranteed seat | Rewritten (§4) |
| Ban on V24 13.55–15.30 (the Camera Roll overlap) | Our record shows the Camera Roll cut used V24 13.4–14.9 | Ban widened to **13.40–15.30** |
| Gold #e6a310, navy #07283d, Poppins | Not in TripNerd's brand record. The C02 carousel (Thu 8) and the client-approved September end card use Montserrat ExtraBold, Inter, navy #202838 and blue #18A0F0. #2ea3f2 is widely used as the default accent of the Divi WordPress theme ([Divi Engine](https://diviengine.com/2-things-you-should-change-on-every-divi-site-you-build/)), so it may be a theme default rather than a chosen brand colour (UNVERIFIED for tripnerd.com, which is blocked from here) | Montserrat ExtraBold + Inter, navy #202838, #18A0F0 underline. **Kit v2.3 end card: the real logo file on #5896E9 (the brand guide's logo blue).** Wyatt's #2ea3f2 card can be swapped in. Ask TripNerd for their exact brand blue |
| Six Meta Ad Library references (pacing models) | UNVERIFIED: facebook.com is blocked from here. The pacing they describe (hook in 2 s, layered proof, reveal around 12 s, brand end) is standard and is kept | Kept out of the build prompt; ChatGPT can't watch them anyway |
| "Normalise peaks to about −3 dBFS" | Instagram plays at about −14 LUFS; peak normalising alone leaves the loudness unpredictable | −14 LUFS integrated, true peak ≤ −1 dBTP |
| End card held for 3.75 s | Watch time is one of Instagram's three main ranking signals (Adam Mosseri, Jan 2025). A long static ending invites a scroll before the loop | **End card 2.00 s; the Reel is 17.25 s.** The roar fades across the end card so the loop back into B01's roar feels continuous |
| Hook variants "if time allows" | The hook is the biggest lever on reach, and we don't know which wins | **H2 and H3 are required.** Post them as Trial Reels (non-followers first) |
| B04 described as a reaction "on the roar" | Our footage log puts V23 24 s at the walk out onto the balcony (view of the island green), filmed on a different day from the V24 roar | B04 is "the view opens"; no roar expected in the sound |
| ChatGPT is the final finisher | ChatGPT puts the cut together but can't watch the result and refine it the way an editor would | ChatGPT also exports a **no-text clean cut, the text PNGs and a timing sheet**, so Wyatt can do a 20-minute polish in CapCut or Edits |

## 2. How to hand it to ChatGPT (kit v2.3)
**Kit** `TN_R01_ChatGPT_kit.zip` (sent in the Claude chat; rebuild with the steps in the worklog). It contains:
- `START-HERE.txt`;
- `PROMPT_for_ChatGPT.txt`;
- `11_ENDCARD.png`: the committed logo file (sha256 `1c4996e5…caa51`) composited, unaltered, onto #5896E9, the brand guide's logo blue. Logo box x 190–830, y 620–856;
- `Montserrat-ExtraBold.ttf` and `Inter-Medium.otf` (both under the SIL Open Font Licence).

**The two videos aren't in the zip.** The Drive connector refuses downloads over 10 MB, so Karl attaches them from Drive in ChatGPT:
- `TN_2026-03-14_the-players_V24.mp4` (12.2 MB)
- `TN_2026-03-12_the-players_V23.mp4` (18.3 MB)
- Location: Drive → TripNerd real client footage → Originals by event → the-players.
- No renaming is needed; the prompt recognises the original names. **Never the `_topaz1080` files.**

**Steps in ChatGPT:**
1. New chat.
2. **+** → upload `TN_R01_ChatGPT_kit.zip`.
3. **+** → "Add from Google Drive" (or download then upload) → the two video files.
4. Paste the contents of `PROMPT_for_ChatGPT.txt`, then send.

**Wyatt's own end card** (#2ea3f2) can replace `11_ENDCARD.png` under the same file name, but then the logo box coordinates in the prompt must change.

## 3. The prompt (paste into ChatGPT as one message, with the files attached)

```
You are the video editor for TripNerd's Instagram. Build ONE finished, client-ready Instagram Reel from the files attached, using your Python and ffmpeg tools. The client approves this today and it posts tomorrow, so accuracy matters more than flair. Work through the steps in order and show the evidence for each check. If something can't be done exactly as written, STOP and tell me. Don't improvise a substitute.

THE REEL IN ONE LINE
"Two ways to watch the 17th": the hush and the roar at the island-green 17th, seen from TripNerd's suite (first at the rail, then inside), ending on TripNerd's brand. 17.25 seconds, built to loop. Real footage only. No AI-generated or AI-enhanced frames anywhere.

FILES ATTACHED
1. TN_R01_ChatGPT_kit.zip. Unzip it first with Python. It contains:
   - 11_ENDCARD.png: the end card, TripNerd blue (#5896E9) with the real TripNerd logo already placed (logo box x 190-830, y 620-856)
   - Montserrat-ExtraBold.ttf and Inter-Medium.otf (the fonts)
   - PROMPT_for_ChatGPT.txt (a copy of these instructions) and START-HERE.txt (ignore)
2. TN_2026-03-14_the-players_V24.mp4, called "V24" below: real footage, the view of the 17th from TripNerd's suite (hush, putt, roar).
3. TN_2026-03-12_the-players_V23.mp4, called "V23" below: real footage, a walk through TripNerd's suite out to the rail.
Never use any file with "topaz" in its name (those are AI-upscaled). If V24, V23, the end card or either font is missing, stop and tell me which.

STEP 0: TOOLS AND SOURCES (report the results)
1. Run `ffmpeg -version`. If it isn't available, use `imageio_ffmpeg.get_ffmpeg_exe()`. Tell me which one you used.
2. ffprobe both videos and paste: width, height, rotation, fps, duration, audio streams.
3. I expect about 720x1280 vertical at 24 to 30 fps. If either video is landscape, or narrower than 720 px, stop and tell me.

STEP 1: CUT LIST (authoritative; times in seconds)
Output 1080x1920, 30 fps constant frame rate. Every beat comes from the videos. Never animate a still.

Beat | Reel time   | Length | Source, in to out              | On-screen text
B01  | 0.00-1.50   | 1.50   | V24 15.55-17.05 (the roar)     | "Two ways to watch the 17th" + "Ponte Vedra Beach, FL"
B02  | 1.50-2.70   | 1.20   | V24 9.00-10.20                 | "1 · At the rail"
B03  | 2.70-5.20   | 2.50   | V24 10.20-12.70 (the hush)     | none, let it breathe
B04  | 5.20-6.60   | 1.40   | V23 24.00-25.40 (the view opens) | none
W1   | 6.60-7.20   | 0.60   | V23 25.40-25.70, then V23 6.70-7.00 | none (whip, see Step 3)
B06  | 7.20-8.80   | 1.60   | V23 7.00-8.60                  | "2 · In the suite, out of the sun"
B07  | 8.80-10.05  | 1.25   | V23 8.60-9.85                  | "Food + open bar inside"
B08  | 10.05-11.95 | 1.90   | V24 0.10-2.00                  | none, the build
B09  | 11.95-14.65 | 2.70   | V24 17.05-19.75 (second roar)  | "Tickets get you in. / TripNerd gets you this."
W2   | 14.65-15.25 | 0.60   | V24 19.75-20.35                | none (whip and dip, see Step 3)
B11  | 15.25-17.25 | 2.00   | 11_ENDCARD.png                 | "Trip like a Nerd." + "Which way are you watching?"
Total = 17.25 s. Assert the sum in code.

Cut rules:
- NEVER use V24 13.40-15.30 (TripNerd already ran an ad with it).
- B01 and B09 are two different moments; they must not overlap.
- If V24 ends before 20.35 s, end W2 where V24 ends and lengthen the end card so the total stays 17.25 s. Tell me if you did.
- Converting to 30 fps: duplicate frames only (fps=30). NEVER use motion interpolation (minterpolate, RIFE, optical flow). It warps people.
- Scale with Lanczos straight to 1080x1920 (the sources are already 9:16). No AI upscaling, no face or skin enhancement, no sharpening, no denoise, no stabilisation. Never crop through anyone's head.

STEP 2: LOOK BEFORE YOU BUILD
Extract the middle frame of every beat, look at each one, and describe it to me in one line. Then check:
- B07 must visibly show food or a bar. If it doesn't, use V23 16.00-17.25 (the buffet counter) for B07 instead, and tell me.
- B06 must be inside the suite. If it's outdoors, tell me before going on.
- No beat may show a tournament logo, leaderboard, scoreboard, broadcast graphic, or a recognisable pro filling the frame. If one appears, punch in by up to 115% to crop it out without cutting off anyone's head. If you can't, tell me which beat.
- B01 must read as the roar at the island green.
- B04 should show the walk out to the rail with the island green opening up. If it doesn't, tell me what it shows.
- If a TripNerd logo wall or banner is visible anywhere, keep it (it's real branding). Only crop out tournament or sponsor marks.

STEP 3: TRANSITIONS
- Every join is a hard cut, except:
- W1 (6.60-7.20): a fast horizontal whip. First 0.30 s: V23 25.40-25.70, with horizontal motion blur ramping up. Last 0.30 s: V23 6.70-7.00, with the blur ramping down so B06 starts sharp.
- W2 (14.65-15.25): the same whip on V24 19.75-20.35, dipping to the end card's blue over the last 0.20 s.
- No Ken Burns, no zooms on stills, no flashy effects, no glitch or flash frames.

STEP 4: COLOUR
- One warm-neutral look for the whole Reel, matched to V24. Nudge V23 towards V24 (warmer if it's cooler). Small moves only: no heavy LUT, no orange-and-teal.
- Never smooth skin or alter people in any way.

STEP 5: TEXT (render every line as a transparent PNG with Python PIL and the attached fonts; don't use ffmpeg drawtext)
- SAFE ZONE, a hard rule: all text inside x 60-960 and y 270-1530 of the 1080x1920 frame. Nothing in the bottom 390 px or the right-hand 120 px, which Instagram's caption and buttons cover.
- Hook and labels: Montserrat ExtraBold, 64 px, line height 78 px, white text on a navy #202838 rounded pill at 85% opacity, 24 px corner radius, 28 px side padding. Left edge of the pill at x = 72, top of the text block at y = 400. Use EXACTLY the line breaks given below (shown as " / "); don't auto-wrap. Every line fits: the widest is 774 px at 64 px, and the space inside the pill is 832 px.
- Hook (B01) only: a 4 px #18A0F0 underline under the last hook line. The hook is ON from the very first frame (no fade-in), because it is the cover. Under the hook, "Ponte Vedra Beach, FL" in Inter Medium 34 px, white, on a navy pill at 70%. In H2 and H3, the first line is also ON from the very first frame.
- Every other line: 6-frame fade in, 4-frame fade out, on screen for its whole beat (at least 1.2 s).
- End card (B11): use 11_ENDCARD.png exactly as supplied. NEVER redraw, recolour, trace, move or regenerate the logo. Add "Trip like a Nerd." in Montserrat ExtraBold 88 px (736 px wide) with its top at y = 950, and "Which way are you watching?" in Inter Medium 44 px (627 px wide) with its top at y = 1075. Both navy #202838, centred on x = 510 (the middle of the safe zone), below the logo (which ends at y = 856). Never put white text on the blue end card.
- EXACT strings with EXACT line breaks (" / " means a new line). Copy them character for character, including " · " (space, middle dot, space):
  B01 hook: Two ways to watch / the 17th
  B01 pin:  Ponte Vedra Beach, FL
  B02:      1 · At the rail
  B06:      2 · In the suite, / out of the sun
  B07:      Food + open bar inside
  B09:      Tickets get you in. / TripNerd gets you this.
  B11:      Trip like a Nerd.
  B11:      Which way are you watching?
  H2 first line: Everyone goes quiet / for this one…
  H3 first line: An estimated 100,000 / balls a year land / in this water.   (the only 3-line text; on screen for 2.5 s)
- No other text anywhere: no subtitles, hashtags, emoji, handles, prices, "tag a friend", or "comment X".
- NEVER rewrite, shorten, "improve" or replace any on-screen string. Every word is approved by the client exactly as written.

STEP 6: SOUND
- Natural sound from the clips only. No music (we add music in Instagram later), no voiceover, no AI audio.
- A 2-frame audio crossfade at every cut, so there are no clicks.
- Keep the B03 hush quiet; don't boost it.
- Let the B09 roar carry through W2 and fade out across the whole end card (to about -20 dB at 17.25 s), so the loop back into B01's roar feels continuous. No silent gap.
- Loudness: two-pass loudnorm to -14 LUFS integrated, true peak no higher than -1 dBTP. Report the measured values.

STEP 7: EXPORT
1. TN_R01_two-ways-17th_v1.mp4: H.264 High, yuv420p, 1080x1920, 30 fps CFR, 12-16 Mbps, AAC 48 kHz stereo at 256 kbps, +faststart, under 100 MB.
2. TN_R01_two-ways-17th_v1_silent.mp4: the same picture with a silent AAC track.
3. TN_R01_review-small.mp4: the same cut, 720x1280 at 3 Mbps, UNDER 9 MB (for our quality check).
4. TN_R01_clean_no-text.mp4: the same cut and sound with NO text overlays, plus every text overlay as its own transparent PNG (TN_R01_text_B01.png and so on) and TN_R01_timing.csv (beat, start, end, text file, fade in/out frames). Our editor uses these for a polish pass.
5. TN_R01_cover.png: 1080x1920, a B01 frame with the hook. Keep the hook inside the centre 1080x1350 so the profile-grid crop still shows it.
6. TN_R01_contact-sheet.jpg: one frame per beat in order, each labelled with its beat and time. The client approves from this.
7. REQUIRED, after v1 is exported: two hook variants for testing. Only 0.00-5.20 changes; from 5.20 on, everything is identical to v1 (also 17.25 s), with the same export settings as item 1:
   - H2 (TN_R01_v1_H2.mp4): 0.00-2.50 V24 10.20-12.70 (hush) with "Everyone goes quiet for this one…" | 2.50-4.00 V24 15.55-17.05 (roar) with "Two ways to watch the 17th" + "Ponte Vedra Beach, FL" | 4.00-5.20 V24 9.00-10.20 with "1 · At the rail".
   - H3 (TN_R01_v1_H3.mp4): the same as H2, but the first line is "An estimated 100,000 balls a year land in this water."

STEP 8: SELF-CHECK. Report each line as PASS or FAIL, with the evidence.
- ffprobe of every export: resolution, fps, duration (17.25 +/- 0.04 s), codecs, bitrate, file size.
- Measured loudness and true peak.
- The beat table with the actual source in and out times you used, and any swap (for example B07).
- Every on-screen string matches the exact list, with the exact line breaks; the pixel box of each text block is inside the safe zone; each is on screen for at least 1.2 s.
- None of these appear anywhere on screen: Masters, VIP, official, partner, sponsor, PGA TOUR, THE PLAYERS, TPC Sawgrass, golf major, #1, guarantee, best, ultimate, world-class, unforgettable, exclusive, limited, sold out, any price.
- No AI-generated or AI-enhanced frame, and no frame interpolation, was used.
- V24 13.40-15.30 was not used.
- The logo area of the end card is pixel-identical to 11_ENDCARD.png (compare the crops).
Then give me download links to every file.
```

## 3b. Wyatt's polish pass (about 20 minutes, after ChatGPT's export)
1. **Import** `TN_R01_clean_no-text.mp4` into CapCut or Edits, along with the text PNGs, placed with `TN_R01_timing.csv`.
2. **Polish only:**
   - the whip feel at W1 and W2;
   - text entrances (a simple slide-up or fade);
   - a final colour match.
   - **Don't change** cut points, wording, the end card or the logo. No AI effects, no auto-captions, no stock music.
3. **Export** 1080×1920, 30 fps, high quality. Also export a 720×1280 copy under 9 MB for our check.
4. **If there's no time,** ChatGPT's `TN_R01_two-ways-17th_v1.mp4` is the version to approve and post.

## 4. Caption (for posting; not burned in)

> Two ways to watch the island-green 17th in Ponte Vedra Beach ⛳ At the rail for the shot, or inside our suite with food and an open bar. When the roar hits, you'll want to be at the rail.
> Which way are you watching? 👇
> #tripnerd #spreadtheNERD #golftrip #golffans #pontevedrabeach

**Posting plan:**
- **H1 (v1)** posts to the feed on Wed 7 Oct at 12 PM.
- **H2 and H3** go up as **Trial Reels** (shown to non-followers first) the same afternoon. Use the same caption. Check the toggle in the app: it's available to professional accounts, but not confirmed on TripNerd's.
- **After 48 hours,** compare views and average watch time in Insights. If a variant clearly beats H1, use its opening for the next cut.

**Trial Reel alternative first lines** (the footage stays the same):
1. "Bucket-list golf week, but where do you actually watch from?"
2. "The stands, or the suite? This is the view from TripNerd's suite on 17."
3. "At the rail for the shot. Or inside the suite, out of the sun."

**Music** (Wyatt adds it in Instagram from the commercial-use library; never baked in):
- Warm, confident, sunny; a light groove; 100–108 BPM.
- No vocals over the hook.
- Dip the music under the B09 roar.

## 5. Approval message to TripNerd: NOT SENT (Karl sends; fill in the approver)

> Hi [name], here's tomorrow's Reel for 12 PM: "Two ways to watch the 17th". It's 17 seconds, all your own footage from the suite on 17, with no AI. The video, the caption and a one-page contact sheet are attached. Could you reply by [time] today with:
> 1. OK to post as is, or what to change?
> 2. Are these lines right: "Tickets get you in. TripNerd gets you this." and "Food + open bar inside" (both from your PLAYERS page, which sells the 17th-hole suite with food and an open bar)?
> 3. OK to show the guests who appear in these clips?
>
> Nothing posts without your yes. Thanks, Karl

## 6. Before it posts (gates)
- **A named TripNerd approver's written yes.** The approver is still unnamed (tracker).
- **Karl watches it on his phone with sound** (BC-25).
- **Our QC:** upload `TN_R01_review-small.mp4` (under 9 MB) to the Drive footage folder, or send it here. I run the master QC, then the critic and the isolated Skeptic. **Without that, it's ChatGPT-checked, not Service Pow gated.**
- **No link-in-bio line**, so BC-19 isn't needed for this post.
- **No AI in the cut, so no AI label.** If ChatGPT reports that it used any AI step, the label applies and this changes.
