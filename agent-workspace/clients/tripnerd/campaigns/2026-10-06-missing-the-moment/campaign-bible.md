---
title: TripNerd Missing the Moment — Campaign Bible
type: brief
client: tripnerd
owner: Karl
status: draft
created: 2026-10-06
updated: 2026-10-06
tags: [video-ad,meta,reels,the-players]
---

# Campaign Bible — TripNerd · "Missing the Moment" · 2026-10-06
DEPTH: FULL (generated people, realistic lane, first paid-media run of this concept)
FORMAT: 27.5s · 9:16 · 1080×1920 · 30fps · IG/FB Reels & Stories
APPROVAL STATUS: **IN PRODUCTION → master v1 built; dual gate running. NOT CLIENT READY.**

## Client truth read
- `../../client-brief.md`, `../../brand-guide.md` (brand guide is an unfilled template; brand values below taken from tripnerd.com CSS — INFERRED, needs CLIENT_APPROVER).
- Prior failures on this account: hook absent / uniformly slow ("The Seat"), killed on first watch ("The Reversal"), compliance-fatal synthetic testimonial ("The Parking Lot"). This cut opens on the problem at frame 1, has no synthetic testimonial, and carries no first-person customer claims.
- The approved-and-unstarted "owner's-hook rebuild" (a man unhappy with where he is → where TripNerd puts him; payoff on a face) is the same mechanism. This campaign effectively executes it.

## Claims bounds
| Shown / said | Basis | Status |
|---|---|---|
| Elevated covered viewing area beside the green, clear view of play | tripnerd.com THE PLAYERS 2027 page: "17th Hole VIP Luxury Suite · Best View on the Course" | CLIENT-PUBLISHED; **CLIENT_APPROVER confirm for this ad** |
| Companions in the same area | Not stated | **CONFIRM** |
| Food/drink | Site: "Full Open Bar & Food Within Suite". **Not shown** in v1 | n/a |
| Event identity | Not named; no tournament, venue, sponsor or network marks; generic green (not the island green) | Deliberate, to avoid third-party mark risk |
| Same moment on both sides | Implied (dramatisation) | Fine with actor framing |

## Decisions log
1. Event: golf / THE PLAYERS. TripNerd has a real archive there, plus a client-published suite package. Masters ruled out (strictest mark and camera policy). Super Bowl ruled out (NFL marks).
2. VO2 changed from the brief to "…and you're watching it on someone else's phone." It pays off the phone insert and the screen-through match cut.
3. Real archive clip V18 (THE PLAYERS 2025, obstructed view) was intended for shot 2. The transfer from this container to the production sandbox was **denied by the session's safety classifier** (data-exfiltration rule). Shot 2 was generated instead. To use the real clip, the owner must permit the transfer or assemble locally.
4. Shot 1 v1 rejected at inspection: head occluded, reads as headless; garbled shirt text. Re-rendered (v2 passes).
5. Transition push-in v1 and v2 missed the phone; v3 is centred at (0.54, 0.34) with a 4.6× push and lands.
6. Voice: preset "Miles" (seed_audio). Transcript verified word-for-word with faster-whisper. Chosen over "Grady" for tighter line segmentation.
7. AI disclosure: the platform AI toggle **must be ON** when uploading (realistic generated people). No on-screen disclaimer.

## Routing record (all Higgsfield; model chosen from live tool state on 2026-10-06)
Keyframes: gpt_image_2_5 (anchors, rung 1) → nano_banana_2 2k with anchor references (continuity). Motion: kling3_0 pro 5s with native ambience per shot. VO: seed_audio. Assembly, mix, end card: Higgsfield sandbox (ffmpeg/ImageMagick/sox). Logo: real file from the tripnerd.com CDN, composited.

## Spend
Approved cap 450 credits (SPEND_APPROVER, this session). Actual at master v1: **143.3 credits** (balance 10,722.3 → 10,579).

## Deliverables
- Master v1: https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/4d9fa573-c70e-42fd-9709-ac677520f896.mp4 (md5 20649acea401e51cc42a2a18b65ed4d1)
- `script.md` (shot list as designed), `captions.srt`

## §13 Critic — master v1 (md5 20649ace…)
**VERDICT: HARD FAIL.** Grounds: no registry receipts supplied, and semantic hard failure #6 (continuity break at 16.83s, midday → golden-hour light inside the "same moment" payoff). ServicePow-6: 6.2 ± 1.5, below the 8.0 floor. Scores:

| Axis | Score |
|---|---|
| Doesn't-look-AI | 6 |
| Hook | 5 |
| Human presence | 7 |
| Format fit | 7 |
| Audio | 5 |
| Message + CTA | 7 |

AI-artifact risk: 5/10.

Ranked fixes:
1. Re-light the 16.8–23.7s payoff so the light matches.
2. Make the obstruction and frustration read in frame 1, plus a visible late reaction.
3. Audio: fill the ambience hole at 4.98–6.25s, build a cheer swell across the cut, add a breath between VO lines 2 and 3, and remove the dead air on the end card.
4. Move the URL above the Reels UI zone, and add motion to the card or trim its hold.
5. Remove the phone-screen ghost circle.
6. Show one beat of what is bought.
7. Supply registry receipts and open the landing page (BC-19).

Learnings flagged CLAUDE-CAUGHT: the light break and the end-card dead air.

## §14 Skeptic — Pass 3, master v1 (verbatim)
```
SKEPTIC VERDICT — Pass 3
Verdict: BLOCK
Findings:
- [S3] 11.0–23.5s / target-customer + industry-professional lens — Brief requires "same event and same defining moment on both sides," but the payoff never shows one: frames sampled every 0.4s from 11.7–14.1s show the green, flag and spectator ring with no golfer, no ball, no putt dropping; 18–23s celebrations are directed at an empty green. The phone screen at 10.6–11.5s does show a ball rolling (no flag/hole in that frame). A golf fan sees the crowd cheering at nothing.
- [S3] 10.9–11.6s / screen-through transition — The "match cut" does not match: the phone screen shows a flat, ground-level view with a ball in the lower centre and a shallow spectator line directly behind it; it cuts to a high, wide balcony view of a different green layout (flag, front-left bunker, large ring of crowd) with the ball gone. The "same moment from a premium vantage" promise breaks at the exact point the ad depends on.
- [S3] 11.5–23.5s / target-customer + client lens — The frustrated fan (navy quarter-zip, white cap) is never paid off; the payoff follows a different person (woman in light-blue polo and companion). The "you're watching it on someone else's phone" → "experience it differently" argument has no before/after for the same guest, so the man's story is unresolved and the transformation reads as a stock swap.
- [S3] 11.5–23.5s / claims (implied) — The payoff implies a standing, front-rail balcony directly above the green, for a pair of guests, as what "your next event" with TripNerd delivers. CLIENT-FACTS lists exact suite location/vantage, seated vs standing, and group size as NOT confirmed by the client for this ad; the public site supports "Best View on the Course" only for one package (THE PLAYERS 17th suite), and the end card's "Explore your next event" generalises that implied vantage to every event. Unconfirmed items are not flagged anywhere in the master — blocks until client confirmation or the depiction is generalised.
- [S2] 11.5–18.0s vs 18.0–23.5s / continuity — Two lighting worlds on the premium side: 11.5–21s hard midday sun, short shadows, white sky, cool grade; 21–23.5s two-shot is warm, low-angle golden-hour light. Undercuts "real-time reaction to the same moment."
- [S2] 0.0–3.0s / brand-assets + realism lens — Foreground spectator's navy shirt carries a white oval chest/shoulder mark with garbled pseudo-lettering and his cap a small pseudo-emblem — generated mark-like artwork (neither a clean blank nor a real licensed mark) on screen in the hook; partially in the bottom ~20% Reels UI zone, which only partly hides it.
- [S2] 7.0–9.0s / brief, performance — "Crowd erupts at a big moment he misses and he reacts late": arms and phones go up around him but he keeps a neutral forward gaze; no late reaction lands before the cut to phone POV. Beat reads passive, not missed.
- [S2] 1.5–2.5s / target-customer lens — In this push-in the protagonist stands head-and-shoulders above the crowd with an apparently clear sightline, weakening the "can't see the action" premise; the obstruction only becomes convincing at 3–5s (camera tower) and 9–11s (someone else's phone).
- [S2] 11.0–14.2s / audio — VO "experience it differently, with TripNerd" (words 11.4–14.2s) starts 0.4s after "phone" (11.0s) and runs straight across the crowd-cheer sound bridge and match cut; the brief asks for room for crowd sound, and the key moment's cheer is stepped on by narration. (Loudness checked: −14.4 LUFS integrated, −1.1 dBTP — acceptable.)
- [S2] 0.0–23.5s / sound-off placement — No on-screen text for 23.5s and captions ship only as SRT; the premise-carrying VO line ("watching it on someone else's phone") reaches sound-off viewers only if the platform displays the SRT. In Stories especially, brand and idea do not appear until the end card.
- [S2] whole master / disclosure (policy 2) — Realistic generated people throughout, incl. a readable-distance face close-up at 15–18s; whether the platform AI-content disclosure toggle is set cannot be verified from the artifact — must be confirmed at upload before this ships.
- [S1] 3.0–5.0s / weakest-2s — The wide crowd shot dominated by the TV-camera tower and phones is the weakest two seconds; protagonist absent, story pauses (survivable).
- [S1] 2.5–5.0s / industry-professional lens — Generic Florida moss oaks; if aimed at THE PLAYERS package buyers, the payoff green is not an island green and the bunker/water right edge would not match the 17th — minor since the event is not named on screen.
Checks with no finding: first-3s opens immediately on a frustrated-not-mocked fan; VO transcription matches intended script word-for-word (pause correctly placed after "attend" at 19.96–21.32s); woman's face close-up 15–18s shows natural eyes/teeth/skin with no dead-eye or hand defects on raised arms at 18–21s; wardrobe consistent within each side; no synthetic testimonial or endorsement framing; end card logo matches packet description (nerd-head mark, TripNerd® wordmark, "FAN EXPERIENCES"), copy correct, CTA ~61% frame height outside bottom-20% UI zone; no legible league/venue/sponsor marks; cheese and trust tests otherwise clean — persuasion fails mainly through the three narrative S3s above.
Isolation: packet verified; production reasoning, cost, draft history, and other
evaluators' output withheld.
```

## Repair round 1 (decision)
Both gates block v1, and the APPROVER's spend cap still has room. Repairs are routed as follows:
- **The same man is paid off in the suite.** This matches the client brief's approved "owner's-hook" mechanism.
- **A visible ball drop.**
- **A phone screen that shows the same green** as the payoff.
- **The hook is rebuilt** with phones walling him in.
- **The late reaction is re-performed.**
- **The payoff is relit to one midday look.**
- **The suite beat now shows drinks and food.** This is client-published ("Full Open Bar & Food Within Suite") and still needs CLIENT_APPROVER confirmation.
- **Audio:** room tone fill, breath between lines, the VO kept off the cheer, and an applause tail through the card.
- **End card:** content moved up; slow push for motion.
- **Captioned feed version** for sound-off viewing.
- **Package super** "17th Hole VIP Suite" to scope the vantage claim to the package it belongs to.

## Master v2 (repair round 1), 2026-10-06
- Feed (burned captions): https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/00a2e895-e714-474e-92fa-d7ee2c3f7a34.mp4 (md5 01f6de852b0be950000d190846660c99)
- Clean (no captions): https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/9d5a43c1-d28b-4258-ab2b-e63e32add134.mp4 (md5 d4c6b9b5951349c32225d9716233a19c)

**Structure:**

| Time | Shot |
|---|---|
| 0–2.2 | Hook: fan walled in by phones |
| 2.2–4.0 | His point of view |
| 4.0–5.6 | Hush |
| 5.6–8.0 | Eruption and late reaction |
| 8.0–9.7 | Stranger's phone, push into the screen, bloom |
| 9.7–11.4 | **Same man** at the suite rail, same green; label "17th Hole VIP Suite" |
| 11.4–13.0 | Close-up of the ball dropping into the cup |
| 13.0–15.4 | His reaction |
| 15.4–18.4 | High-five with friends (midday light, matched) |
| 18.4–22.9 | Drinks and food in the suite |
| 22.9–27.5 | End card (moved up, slow push, applause tail and low thump) |

**VO placement:** VO3 now sits after the putt-drop roar, at 13.1s.

**QA1 receipts (sandbox, feed master):**

| Check | Result |
|---|---|
| Format | h264, 1080×1920, yuv420p, 30fps; AAC 48 kHz stereo; 27.500s |
| Loudness | I −14.9 LUFS, LRA 6.7, TP −1.0 dBFS |
| freezedetect / blackdetect / silencedetect (−45 dB, 0.5s) | none |
| ASR | all 4 lines present, no undeclared speech |

**Spend:** total 263.3 credits against the 450 cap (balance 10,722.3 → 10,459).

**Known residual (flagged to the gates):** generated pseudo-emblems on some clothing (for example a small chest mark on the lead in the eruption shot).

Both gates re-run fresh and isolated on v2; results below.
