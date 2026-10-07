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

## §13 Critic — master v2 (md5 01f6de85…)
**VERDICT: HARD FAIL.** ServicePow-6: 6.8 ± 1.5. Scores:

| Axis | Score |
|---|---|
| Doesn't-look-AI | 6 |
| Hook | 6 |
| Human presence | 7 |
| Format fit | 8 |
| Audio | 7 |
| Message + CTA | 7 |

AI-artifact risk: 6/10.

Hard failures:
1. **#4 Broken product (wrong geometry).** The "17th Hole VIP Suite" is shown as a generic parkland green, not the island green the package sells.
2. **#2/#10.** The ball sits on the lip and never visibly drops. The cup has no pin while a flag stands elsewhere on the green. The caption "watching on someone else's phone" plays over a clear-view shot.

Contributing:
- The hook reads as "fans filming a celebrity".
- The match cut framing is weak.
- The cheer bridge drops to a hush.
- The suite celebration is quieter than the gallery eruption.
- The end card is about 4.3s, long for the placement.

Receipts accepted: BC-01–07, 11, 12, 21, 27, 42. BC-41 FAILED. Many harness receipts are still missing (BC-08/09/10/13/14/15/26/28/30/32/33).

CLAUDE-CAUGHT learnings: a real-venue product rendered as a generic venue; a payoff generated as a static near-miss; a pin/cup state error.

## §14 Skeptic — Pass 3, master v2 (verbatim)
```
SKEPTIC VERDICT — Pass 3
Verdict: BLOCK
Findings:
- [S3] 11.3–12.9s / industry-professional + competitor lens — The payoff ball never drops: it sits motionless on the cup lip for ~1.5s, nudges once, and the cut comes; the ad's defining moment is never shown and the ball hanging on the lip reads as broken physics.
- [S3] 11.3–12.9s / industry-professional lens — The upright yellow flag stands well behind the cup in frame, so the ball is rolling toward a hole with no flagstick while a different pin stands across the green — any golfer reads this as not the hole in play.
- [S3] 10.0–11.0s and 15.5–18.0s / client + truth lens (claims-and-proof) — The "17th Hole VIP Suite" label sits on a parkland green ringed by oaks with no water; TripNerd's only evidenced 17th Hole suite is at THE PLAYERS/TPC Sawgrass, whose 17th is the famous island green, so golf viewers will recognise the label/picture as fake; the specific elevated front-row view straight onto the green is also presented as fact while CLIENT-FACTS list "exact suite vantage" as unconfirmed.
- [S2] 13.0–15.5s / continuity + claims lens — In the guest's reaction close-up the background is ground-level with spectators walking on the fairway at eye height just below the rail, contradicting the elevated greenside suite of the wide shots; premium vantage appears inconsistent/unsubstantiated.
- [S2] 18.5–22.5s / continuity lens — Celebration relocates to a shaded bar counter overlooking an empty course with no crowd and different trees; plays as a separate location, not the same suite at the same moment, and the brief's "celebrating with companions" happens divorced from the action.
- [S2] 6.3–7.5s / target-customer + realism lens — The fan's "late reaction" is a wide open-mouthed sideways shout at readable distance; reads as angry yelling (or as him speaking the VO line) rather than relatable frustration at missing the moment — the performed big-emotion-on-generated-person risk named in the realism policy.
- [S2] 13.0–13.6s / realism lens — Guest's first reaction is a large theatrical "O" mouth in close-up; reads performed rather than in-the-moment and is held long enough for viewers to clock it as synthetic.
- [S2] 7.0s and 14.8s / brand-assets lens — Small generated emblem on the hero's quarter-zip (left chest, round badge in the crowd shot, small mark in the suite close-up); policy names generated pseudo-marks on clothing a defect.
- [S2] 0.0–2.0s / first-3s lens — Opening fan's expression is near-neutral/stern and the phones blocking him show black screens; the "can't see the action" frustration is not legible in the first second without the caption.
- [S2] 9.5–11.0s / audio + brief lens — Momentary loudness drops to about −25 to −34 LUFS across the phone-to-suite match cut; the cut is not carried by a crowd-cheer sound bridge (cheer only returns ~11.5s, after the cut).
- [S1] 1.5–2.0s / audio — Brief momentary dip to −29.6 LUFS at the cut between the first two crowd shots; audible hole in the room tone.
- [S1] whole piece / technical — Integrated −14.9 LUFS, true peak −1.0 dBFS, LRA 6.7 LU acceptable for Reels; transcribed VO matches the intended script word-for-word and captions match VO; end card (real logo lockup, "Be there for the moment.", "Explore your next event", tripnerd.com) sits clear of the bottom 20% and right edge; no third-party marks found. (Recorded for the clean areas — no defect.)
Tests: weakest-2s = 11.3–13.3s (hanging ball + wrong pin + theatrical "O" reaction) — not survivable, it is the payoff. First-3s = phones-in-the-way image clear, frustration weak (S2). Persuasion = problem/solution arc and VO are tight but the payoff moment is never delivered. Cheese = low; copy restrained. Trust = undermined by the 17th Hole label on a non-island green and the unconfirmed vantage. AI-detection = high risk at the ball-on-lip shot and the two big-emotion close-ups.
Isolation: packet verified; production reasoning, cost, draft history, and other
evaluators' output withheld.
```

## Campaign Director ruling after v2 (STOP AND REPORT)
- **Edit-level fixes go into v3 at zero spend:**
  - the ball drop now completes on screen;
  - the insert is cropped to remove the stray flag;
  - the label becomes "VIP Suite" (no "17th Hole");
  - the shout and the "O"-mouth frames are trimmed;
  - a cheer bridge and room-tone fill are added.
- **The binding blocker is not fixable by more generic generation.** The package being sold is a specific real venue (the 17th-hole suite at the island green). A generated generic green misrepresents it, and an AI rendering of the real venue raises a third-party venue/trademark question and is still a synthetic depiction of a real product.
- **The correct fix is real footage of the actual suite view.** TripNerd's Drive archive holds THE PLAYERS clips, including 17th-hole crowd footage; files larger than about 5 MB could not be pulled through the Drive connector, and the transfer to the production sandbox was denied by the session classifier.
- **Owner decisions required:**
  - (a) supply or approve transfer of real suite/17th footage;
  - (b) or approve a generic, unnamed "VIP suite" positioning, with the CTA pointing to a general page rather than THE PLAYERS page;
  - (c) or rule on rendering the island green (needs a trademark check).
- **Client confirmations also required:** vantage, seated or standing, group size, food and drink.

## OWNER REDIRECT (2026-10-06): Augusta version, v4 draft
**APPROVER direction:** set the ad at Augusta; 15–20s; the camera stays on the packed-in fan; the crowd faces one way; the ball lands with backspin and sticks near the pin; the two women hug, frozen as a captured photo; the man content and smiling, not laughing; cheering only at the climax; no 17th-hole suite.

**Fact check (verified 2026-10-06):**

| Question | Source | Finding | Consequence |
|---|---|---|---|
| What TripNerd sells at Augusta | tripnerd.com/events/augusta-experience | Private Executive Home · Course Passes Included · Daily Hospitality · TripNerd Hosted · Food & Drink Included; FAQ: "Augusta has grandstands that are first come first serve as well as a single folding chair per person rule." | No reserved hole or seat exists |
| Phones | golfmonthly.com and nbc reports | Phones are banned for patrons on all days | The phone device was removed |
| Photos from the grounds | golfmonthly.com | Commercial use is restricted to licensed media | No Augusta course imagery was used; the course look is built from generic prompts |

The patio is built from TripNerd's own site photo (`tripnerd-augusta-experience-2022-0213.jpg`) as a reference.

**APPROVER choices (AskUserQuestion):** "Honest Augusta"; VO2 = "…and all you can see is the back of someone's hat."

**Claims shown:** the group sits in folding chairs at the green (true for any badge holder; no reservation is implied); patio hospitality (published); end-card line "Course passes · Private home · Daily hospitality" (published package highlights); eyebrow "THE AUGUSTA EXPERIENCE" (TripNerd's product name). No Masters marks, wordmarks or "Masters" text. Flags are plain yellow; chairs are plain green.

**Legal flag for the owner:** using "Augusta" in paid ads relies on descriptive use (TripNerd's site carries a non-affiliation disclaimer). Augusta National enforces its marks aggressively, so a check is recommended before spend. The course look (pines, azaleas, plain yellow flag) evokes Augusta; no protected marks appear.

**v4 masters (20.0s; −14.1 LUFS; 1080×1920, 30fps):**
- Captioned: https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/6ae26de3-fe23-4de0-9beb-03fad1e3a276.mp4 (md5 ec1a4780126ccc849cd58c941fcd78d0)
- Clean: https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/f390e7da-fd30-42cc-8e90-d87269b6551a.mp4 (md5 39ee426013d7e2f2f7bf4b2dc9bc9a9e)

**Structure:**

| Time | Shot |
|---|---|
| 0–3.0 | Packed fan, camera on him |
| 3.0–4.6 | His point of view |
| 4.6–7.3 | Crowd rises and blocks him |
| 7.3–8.3 | Clear wide view of the green |
| 8.3–10.9 | Ball lands, checks back and sticks (1.5× punch-in); the only roar |
| 10.9–12.9 | The women hug |
| 12.9–13.6 | Photo-capture freeze with shutter |
| 13.6–15.6 | He sits content, looking around |
| 15.6–17.4 | TripNerd hospitality patio |
| 17.4–20.0 | End card |

**Status:** owner first-artifact review (FIRST-ARTIFACT RULE). The dual gate runs once, on the frozen cut, after owner direction. NOT client ready.

**Spend:** 377.9 of the 450 cap (balance 10,344.4).

## Owner inputs (2026-10-06, after v4)
1. **`TripNerd-Augusta-watching-view-picks-INTERNAL.zip`:** 17 TripNerd photos from Augusta week (2024/2026) plus clip V25. Its README says: internal, NOT cleared to post; faces need consent; the course seen beyond the fence is most likely the venue's own course, NOT Augusta National (INFERENCE); never caption it as Augusta National or the Masters.
   **Use:** text and visual guidance for the hospitality beat only (grey wicker sectionals and fire tables, high-tops draped in black, white picket fence, tall pines, white tents, string lights, columned veranda with hanging ferns).
   **Not used as generation inputs:** they are not cleared, and moving client media to the vendor was previously denied by the session classifier. The files were not uploaded anywhere. To get exact-match fidelity, the owner can upload the no-face picks (P115, P109, P036, P155, P078, P005) to Higgsfield directly.
2. **Reference sheet (owner-uploaded to Higgsfield):** frames from Augusta National's own broadcast of the 12th hole, marked "REFERENCE ONLY — not for use in any TripNerd advert".
   **Use:** as behaviour guidance only, written into the prompt. The broadcast is filmed from an elevated position on a long lens; the ball arrives from above and lands near or past the pin with one short hop, checks, and settles 2–5 ft away; the ball is small on screen.
   **Not used as a generation input:** the frames are copyrighted and show the 12th hole, so using them would replicate a protected, identifiable venue.

## v5 shot pass (workflow, credit-capped at 68.5 of the remaining 72)
Shots regenerated:
- ball (broadcast framing);
- ball-flight insert;
- blocked beat (keeps him visible);
- hospitality lawn at golden hour.

Each shot keeps a fallback to its v4 clip.

## Owner notes round 2 (after v4) → v5b
Owner notes:
1. The hero must face the same way as the crowd.
2. Keep the wide POV angle but make it realistic.
3. Celebration beat: shot from behind him, everyone's hands up clapping, he looks around and can't see.
4. The ball must never disappear and must stay white; it can bounce and must stop close to the pin (3–7 ft).

**Spend gate:** the SPEND_APPROVER raised the cap from 450 to **520** (AskUserQuestion, approved). The workflow shot pass was stopped before the "blocked" shot started, because owner note 1 superseded it. Two renders already in flight (a broadcast-style ball and a ball-flight insert) were charged and inspected: the ball never reads, so neither was used.

**How each note was solved:**

| Note | Solution |
|---|---|
| 1 | New keyframe (nano_banana_2_1, 4K) from behind and to the right of the hero, everyone facing the green; Kling Pro motion. |
| 2 | 4K-realism re-render of the POV composition (nano_banana_2_1, 4K), then a second edit pass to remove an Augusta-like white scoreboard and wall behind the green. Motion in **Kling 4K mode**. |
| 3 | New keyframe from the same camera position as note 1 with the crowd's hands raised. Kling attempt 1 rejected (only a few hands up; he smiled). Attempt 2 accepted: a dense wall of raised clapping hands, his face never toward camera, frustrated. |
| 4 | **Composited CG ball, not generated.** It is drawn on the locked-off green plate (from the v4 ball clip) with a physics path: steep entry from the top, landing about 2 m past the hole, one short hop, spin back, stop about 0.35 m (≈1.2 ft) to the front-right of the cup. Swept-sphere motion blur keeps it opaque white on every frame. It has a perspective-scaled size (cup ≈ 70 px, ball ≈ 23–28 px), a contact shadow, matched softness and grain, and a synthesized thud and tap. The plate's own generated ball is painted out from a clean frame (camera verified static: green-region frame difference ≤ 3/255). The gallery begins clapping on the plate exactly when the CG ball stops. |

The owner's reference sheet (Augusta National 12th-hole broadcast frames) was used only as behaviour guidance: the composite matches its "drops in from above, one hop, checks, settles within 2–5 ft" behaviour.

Composite file: https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/7b633df5-e73c-4e19-9869-169188f74974.mp4

**v5b structure (20.6s):**

| Time | Shot |
|---|---|
| 0–3.0 | Hero from behind |
| 3.0–4.2 | Realistic POV |
| 4.2–8.9 | Hands-up wall, hero looking around |
| 8.9–9.6 | Clear wide green |
| 9.6–12.4 | Ball lands 10.2, hops 10.46, stops 11.22; roar 11.25 |
| 12.4–14.4 | Hug |
| 14.4–15.1 | Photo freeze |
| 15.1–16.7 | Content close-up |
| 16.7–18.2 | Patio |
| 18.2–20.6 | End card |

VO2 now ends (8.82s) before the cut to the clear green, so "back of someone's hat" plays over the hands.

**v5b masters (20.6s, 1080×1920, 30fps; −14.2 LUFS, TP −1.4 dBFS; ASR: all 4 VO lines, no undeclared speech):**
- Captioned: https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/adbd7624-d5d7-4382-9db8-7a5397496619.mp4 (md5 e5bae388f74749a5c418d0d8732ad347)
- Clean: https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/7e072ed0-fc7d-497f-be05-d0d79212b594.mp4 (md5 f0562f0e70f309552308a4e6ce5d2a82)

**Spend:** this campaign's own jobs total about 486.4 of the 520 cap (balance 10,722.3 → 9,931.9).

**Unattributed charges on the account (not made by this session):**

| Time (UTC) | Charge | Credits |
|---|---|---|
| 22:37:01 | Seedance 2.5 | −60 |
| 22:38:03 | Bytedance Image Upscale | −2 |
| 22:38:05 | Bytedance Image Upscale | −2 |
| 22:42:43 | Seedance 2.5 | −240 |
| **Total** | | **−304** |

This session never called Seedance or upscale. The source is unknown (another user or session on the same Higgsfield account?). Owner to confirm.

**Status:** owner review (first-artifact rule). The dual gate runs on the locked cut. NOT CLIENT READY.

---

## v6: slower, continuous opening (2026-10-06)

**Owner note (verbatim):** "Seems rushed. Try to like slow down. The clips or just don't have so many cuts like in the beginning when it's the guy in the crowd like just don't have any cuts just have him waiting there and chilling and then something big happens and he's just trying to look around everyone's clapping you can't really see and then show like the angle he has of a bunch of people in front of him"

**Change:** the 0–8s opening is now ONE uncut take. It replaces the v5b opening cuts (o1 + hands).
- Source: Kling 3.0 pro, 10s, sound on, job f9d556b4-32e3-4239-bbad-d0b53e7d8b8c (25 credits).
  - Start frame: b3c7125f (him from behind, waiting).
  - End frame: c9ed1ecb (hands-up crowd, same angle).
- Shot QA:
  - scene-cut detection found 0 cuts;
  - his face never turns to camera (profile only when he looks around);
  - crowd audio stays quiet to about 5.0s, then roars;
  - hands go up from 6.0–6.5s;
  - he turns and looks around from about 8.5s.
- Used window: source 1.5–9.5s, giving 3.5s of calm waiting → eruption → him looking around.
- The cut then goes straight to his blocked POV (wall of people), then the ball composite.

**Timeline (21.9s):**

| Time | Shot |
|---|---|
| 0–8.0 | long take |
| 8.0–10.2 | POV |
| 10.2–13.0 | ball composite (stays white, stops ~3–7 ft from pin) |
| 13.0–15.0 | hug |
| 15.0–15.8 | photo freeze |
| 15.8–18.0 | him content |
| 18.0–19.6 | patio |
| 19.6–21.9 | end card |

The cut count drops from 10 to 8, and the opening has none. Build script: `assemble-v6.sh`.

**v6 masters (21.9s, 1080×1920, 30fps; −14.1 LUFS, TP −1.0 dBFS):**
- ASR of the first 10.5s: VO1 and VO2 verbatim over the crowd roar.
- CDN copy md5 matches the build.
- Captioned: https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/a2aff897-056d-4a13-876c-fc428ecbd2d3.mp4 (md5 44969110e3a2bf8da2fe6899ca1a3b84)
- Clean: https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/12d4eab3-fbd7-430d-8638-7f805fca72ba.mp4 (md5 eb563925f9b32cb6b074170e99cc2617)

**Spend:** about 511.4 of the 520 cap. Any further generation needs SPEND_APPROVER sign-off.

**Known compromise:** the crowd erupts in the long take before the ball-landing shot. The order reads as reaction → what he missed, so the roar is heard twice (once at the eruption, once on the ball shot).

**Status:** owner review. The dual gate runs on the locked cut. NOT CLIENT READY.

---

## v7: shorter, more TripNerd, broadcast ball (2026-10-06)

**Owner notes (summary):**
- Cut the POV shot.
- 14–18s.
- VO: "the biggest moment of the day… and you can't even see it", then the TripNerd payoff.
- A more realistic ball drop, using the owner's broadcast reference sheet.
- TripNerd lanyards on the guests and a TripNerd cap on him.

**Approvals (AskUserQuestion):**
- SPEND_APPROVER: "use what you need for quality, flow and realism … no spending cap."
- VO: the safe rewrite.

**Claim handling:**
- Owner's line "right-on-the-ropes view / never outside of a moment" is NOT used. It is unsupported: the FAQ says grandstands are first-come and there are no reserved spots.
- VO3 is now "With TripNerd, you're not just at the event. You're in it."

**Reference sheet:** the owner's sheet is copyrighted Masters broadcast frames, marked reference-only. Used only as a framing guide; no frames used.

**Production:**
- Ball plate: new broadcast-telephoto keyframe (nano_banana_2_1 4K), re-composed so the pin sits at about 74% of frame height, above the platform-UI zone. Animated with Kling 3.0 Pro (job 872af706).
- CG ball (`ball-comp-v7.py`, r=8px at the cup, HX/HY 413/1425):
  - lands about 3 m past the pin;
  - checks, then spins back;
  - rests about 1 m (≈3.4 ft) from the cup;
  - always white.
- Bug fixed: a masked PIL paste squared alpha, making the moving ball invisible.
- Guests:
  - Edited the 4K keyframes (blank navy cap and cards, #2ea3f2 lanyards).
  - Composited the real logo file onto them before animation (brand-asset law §1).
  - Animated with Kling: hug c282a54b; close-up f80eac85.
- Close-up card: flickered navy/grey in the Kling output. Fixed with per-frame tracked replacement (`card-fix-v7.py`, OpenCV). The cap logo held.

**Timeline (17.8s):**

| Time | Shot |
|---|---|
| 0–8.6 | long take (LONG_IN 1.4) |
| 8.6–11.0 | ball |
| 11.0–13.0 | hug |
| 13.0–13.8 | photo |
| 13.8–15.6 | close-up |
| 15.6–17.8 | end card |

VO1 at 0.3, VO2 (new, seed_audio Miles) at 4.85, VO3 (new) at 11.3. Patio shot dropped. Build script: `assemble-v7.sh`.

**v7 masters (17.8s, −14.4 LUFS, −1.0 dBTP):**
- ASR: all VO lines verbatim.
- Captioned: https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/7a4dffcb-009e-4674-ad25-948f7edbd7ca.mp4 (md5 e354b50ea641c050d7d5162742b757fa)
- Clean: https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/00f08c25-0afb-4359-a8e9-f439e387c879.mp4 (md5 d6319399b797f206e955e7d507bc5004)

**Spend:**
- v7 jobs: 67.3 credits (4× Kling 12.5, 7× Nano Banana 2.1, 2× Seed Audio). Campaign total about 578.7.
- Further account charges NOT made by this session, 22:59–23:35 UTC, 187.5 credits total:

| Time (UTC) | Charge | Credits |
|---|---|---|
| 22:59 | Kling | −14 |
| 23:09 | upscale | −2 |
| 23:12 | GPT Image 2.5 Flare ×2 | −30 |
| 23:15 | Seedance 2.5 | −60 |
| 23:16 | Seedance 2.5 | −15 |
| 23:28 | Seedance 2.5 | −60 |
| 23:35 | GPT Image 2.0 | −6.5 |

**Gate:**
- First Skeptic run VOIDED itself: the packet was not in the isolation format and carried draft history. Re-run with a clean packet.
- Critic running.

**Status:** awaiting dual-gate verdicts. NOT CLIENT READY until both pass.

### v7 dual gate (fresh, isolated; Skeptic on a clean isolation packet)

**SKEPTIC Pass 3: BLOCK.**

S4 findings:
- 11.0–15.6: the payoff visually implies the unsupported "ropeside view" claim. Problem → solution: front-row chairs at the rope.
- End card "THE AUGUSTA EXPERIENCE" plus the Augusta/broadcast look: rights not cleared.

S3 findings:
- Branded caps, lanyards and badges are unconfirmed. A badge on a lanyard also reads as the entry credential.
- 11–13: performed celebration (open-mouth screams); realism §4.
- Persuasion: what TripNerd actually sells (home, hospitality, hosting) is never shown.

S2 findings:
- Freeze at 13.0–13.8 (BC-06).
- Low motion in the close-up (BC-09).
- Rope line through the captions.
- First 3s: static backs of heads (BC-14).
- He smiles at the turn, not frustration.
- Leap-and-hug is out of scale for a 3 ft shot.
- Cap logo reads flat, not stitched.
- CTA/destination match unverified (BC-19).
- Subline lacks EV-ids.

S1 finding: card tagline is unreadable.

**CRITIC: HARD FAIL.** ServicePow-6 score 6.5 (floor 8.0); weakest axes are hook 5 and audio 6. AI-artifact risk 5/10.

S3 findings:
- Crowd claps 3.6–8.3 but the ball lands 9.22, with two roars: effect before cause.
- Implied better-view claim, no evidence (BC-16).

S2 findings:
- The man grins/laughs in the hug shot; the women scream.
- White cap → navy cap: the same man may read as two people.
- Augusta trade dress (BC-20).

S1 findings:
- Rope strikes through the caption.
- End card is half-built at 15.6, with dim eyebrow/URL.
- Freeze needs a BC-06 exception.

Weakest 2s: 0.0–2.0. Registry receipts missing.

**Routing:**
- Concept-level (OWNER/CLIENT): the core promise "you can't see it → TripNerd guests can" needs either CLIENT_APPROVER written substantiation of what TripNerd does on-course to secure viewing, or a re-spine around proven benefits.
- Augusta rights: owner/legal.
- Merch confirmation: client.
- Zero-spend craft fixes (queued):
  - captions above the rope;
  - end card built by 15.6 with AA contrast;
  - motion on the freeze and close-up;
  - single-roar audio logic.
- Regeneration fixes (spend approved):
  - calmer hug (closed-mouth joy, man content);
  - stitched-look cap.

**Status:** BLOCKED. NOT CLIENT READY. Awaiting owner decision on the claim spine.

---

## v8: new concept, "Golf Boys → TripNerd. Booked." (2026-10-07)

**Owner direction (summary):**
1. Opening: a full-screen phone group chat, bubbles popping up, ending "TripNerd. Booked.".
2. Hyper music starts on that bubble.
3. Pan to the owner's golf-shot clip, with the crowd roar building as the ball nears the hole.
4. Pan to the TripNerd guests clapping in their seats.
5. Camera goes aerial, comes beside them, then settles behind them: the man and two women stand clapping and cheering, and the golfer and caddie hug on the green while everyone celebrates.
6. End card.

**Owner assets used (all owner-generated in Higgsfield):**
- Golf clip: hf 80981ec6 (md5 6f76e4c5…, matches the upload).
- Behind-view still: 5cbb4036.
- Chat mock-up: 9892db06, used as copy reference only; the chat is rebuilt as animation.

**Build:**
- Chat: `v8/chat-animation.py`.
  - Generic messaging UI, no Apple marks. Liberation Sans plus Noto emoji.
  - Seven bubbles, trimmed for readability.
  - "bucket list shit" changed to "Bucket list": Meta ad policy bars profanity.
- Golf: owner clip reframed 16:9 → 9:16 with a crop that tracks both the flag and the ball (`v8/golf-crop-track.py`). Clip from 0.8s, 4.24s long.
- Camera move:
  - Start frame: hugkey, the front view with the real logo composited.
  - End frame: owner behind-view, mirrored for correct 180° geography; recomposed to 9:16 with the trio standing and cheering (nano_banana_2_1 8a359df0).
  - Removed for rights and garbled text: the Masters-style leaderboard and the caddie's bib lettering.
  - Both models rendered it. Chosen: Seedance 2.5 c77899f4 (1080p, 8s). It has the elevated near-aerial move and natural, closed-mouth reactions.
  - Rejected: Kling fc0ab8e4 (skipped the aerial; logos crisper).
- Music: original synthesized 140 BPM bed (`v8/music-synth.py`), no licensing exposure. It starts on "Booked", builds with a riser into the celebration, and ends on a final hit at the end card.
- Crowd audio:
  - owner clip audio plus the long-take crowd, ramping up to the ball reaching the cup;
  - the Seedance roar and applause over the celebration.
- End card: built from the real logo file. Built by 0.4s; contrast raised; CTA "Book now".

**Timeline (19.74s):**

| Time | Shot |
|---|---|
| 0–5.6 | chat ("TripNerd. Booked." at 4.55, music in) |
| 5.3 | whip-pan |
| 5.3–9.54 | golf (ball at the cup ≈ 8.7–9.0) |
| 9.24 | whip-pan |
| 9.24–17.24 | celebration orbit |
| 17.24–19.74 | end card |

**Master:** https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/0dc0974f-33d9-47c1-bf17-7d59be214cfa.mp4 (md5 d273ac3949e92790c2d6aacab0039c40). −14.6 LUFS, −1.0 dBTP, 1080×1920, 30fps.

**Spend (this session, v8):** 124 credits (Nano 3, Kling 25, Seedance 96). Other account charges in this window match the owner's own Higgsfield work.

**Known risks for the gate:**
- **Rights:**
  - "Augusta" and "Players" named in the chat; THE PLAYERS is a PGA TOUR mark.
  - Augusta look and caddie white coveralls (Masters trade dress).
  - End-card eyebrow "THE AUGUSTA EXPERIENCE".
- **Implied claim:** guests ropeside at the green at the winning putt. There is no "can't see" contrast now, but the vantage is still implied.
- **Brand:** logos on the cap and cards are soft in the Seedance render (animated from the composited real file). Needs a brand-fidelity check.
- **Disclosure:** AI people throughout; AI disclosure toggle ON at upload.
- **Audio:** not human-auditioned (QA was by meters only); the synthesized music needs a listen.

**Status:** owner first-artifact review. Dual gate runs on the locked cut. NOT CLIENT READY.
