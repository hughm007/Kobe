---
title: "Phoenix Reel 3 AI fly-up: model check, frame clean-up and credit quote (NOT generated)"
type: report
client: tripnerd
owner: Karl
status: draft
created: 2026-10-19
updated: 2026-10-19
tags: [client, phoenix-open, ai-video, spend-gate]
---

# AI fly-up: quote for SPEND_APPROVER (Wyatt)

**Source:** Wyatt's handoff `TripNerd_Phoenix_Higgsfield_Flyup_Handoff.zip`:
- START_crowd (V02 at 0.3 s);
- END_suite_rail (V01 at 0.2 s);
- ALT_END_P08_rail;
- the prompt, used verbatim.

**Status:** nothing generated, 0 credits spent.

## Model check (live `models_explore`, 2026-10-19)
- **Kling 2.5 Turbo / Kling 2.1:** not in the catalogue. The Kling models listed are 3.0 Turbo (start frame only), v3.0, and **3.0 Omni (Frames)** `kling_o3_flf`, which accepts start_image and end_image, takes 3–15 s, and offers std / pro / 4K.
- **Veo 3.1 (first/last):** only **Veo 3.1 Lite** `veo3_1_lite` is listed (start and end frames; 4/6/8 s).
- **Recommended: `kling_o3_flf`, pro, 4 s, sound off, 9:16.**

## Quote (`get_cost`, nothing submitted; prompt only, no frames attached; re-quote with frames before firing)

| Model / mode | 4 s, 9:16, silent |
|---|---|
| Kling 3.0 Omni (Frames), std | 4 credits |
| **Kling 3.0 Omni (Frames), pro** | **5 credits** |
| Kling 3.0 Omni (Frames), 4K | 24 credits |
| Veo 3.1 Lite | 6 credits |

- **Plan:** 2 tries maximum, so at most **10 credits** (pro).
- **Balance:** 3,603.64 credits (Ultra).

## Frame clean-up (done, local only)
- **The handoff frames carry legible sponsor marks:**
  - START: FedEx and WM along the far wall;
  - END: FedEx and WM along the wall;
  - ALT: WM, FedEx and event marks.
- A first/last-frame model reproduces those frames, so the marks would land in the clip and fail the handoff's own QA.
- **The fix:** `*_clean.png` versions with hand-placed patches in the wall's own colour (`flyup_frame_patch.py`). No blur, no AI.
- **Leftover:** ALT's patches are slightly greyer than its white wall (ALT is backup only).

## Flags for Wyatt
1. **The prompt's geography vs the frames.** Both frames were shot from the same suite, looking across the tee/desert side. Neither shows the green-and-bunker the prompt flies over, and the start frame is from above, not "low inside" the crowd. The model will invent the middle, which raises the morphing risk. The handoff's own fallback (a simple crowd-to-rail rise) is the lower-risk prompt.
2. **The opener becomes synthetic.** Keep the "This is the 16th." card on the real bunker blast, not on the AI clip. Policy: no documentary caption on a synthetic shot.
3. **Disclosure:** the platform AI toggle must be ON for this Reel (`_servicepow/policies/realism-and-disclosure.md` §3). Output name: `TN-PHX-R3_flyup_AI.mp4`.

## Execution: try 1 (2026-10-19, approved by owner: "whichever model will give the best quality and fit")
- **Model:** `kling_o3_flf` (Kling 3.0 Omni Frames), pro, 4 s, sound off, 9:16.
- **Frames:** start = media `441493d1…` (START_crowd_clean), end = media `bf535b97…` (END_suite_rail_clean).
- **Prompt:** the handoff's **fallback** (a crowd-to-rail move matching the real frames), not the verbatim fly-over-the-green prompt.
- **Job:** `b2a9b47a-5bb9-4479-944f-a64accf08950`. Output: 1080x1920, 24 fps, 97 frames, 4.04 s.
- **Spend:** quote 5 credits (re-quoted with frames attached); the balance went from 3,603.64 to **3,598.64 (actual 5)**. Try 2 not used.

**QA, done at full size in the Higgsfield sandbox:**
- **Motion:** a smooth pan from the GA crowd past the canopy pillar to the rail. Guests in the end frame match the real frame.
- **Faces and crowd:** no warped faces, extra limbs, melting or flicker seen at full size on 4 sampled frames.
- **FAIL as delivered:** **the model invented legible sponsor wordmarks on the far wall** ("TROOIN", a misspelt **Troon**, a real golf-management company, plus two more boxes).
- **Fix chosen:** paint the wall band out with the wall's own colour, as on every real shot (`renderC.py` → `render2.paint_out`). It's free and deterministic; a re-roll could invent marks again.
- **Incidental apparel logos** on caps carry over from the real end frame (as in the source footage).

**Assembly blocked on transfer:** this container's network blocks Higgsfield's CDN. The owner downloads the clip and uploads it here, then `renderC.py` + `mixC.py` build Reel 3 / version C (14.0 s; the drop at 2.0 lands on the real bunker blast).

## Owner review of try 1, and the redo request (2026-10-19)
**Owner verdict on try 1: REJECTED.**
- No aerial: it's a sideways wipe.
- The crowd is frozen.
- "TROON" is legible.

**Lesson:** a first-and-last-frame model given two frames from the same vantage interpolates a pan between them. It cannot invent an aerial.

**Redo spec (owner):**
- Image-to-video, **start frame only**: a real bunker/green frame.
- The owner's drone-reveal prompt plus a negative prompt.
- 9:16, about 4 s, the best Kling or Veo model.
- Quote first, 2 tries maximum.
- **Edit:** the drone reveal (about 2 s), card "This is the 16th.", then a hard cut on the music hit to the real suite rail, card "Now watch it from up here."

**Start frame:** `drone/START_green_bunker_clean.png` (V03 src about 5.03 s).
- Green, flag and bunker, with the player seen from behind.
- Wall logos painted out in the wall's own colour; residual specks removed.

**Quotes (`get_cost`, 9:16, 4 s, nothing submitted):**

| Model | Per try | 2 tries |
|---|---|---|
| Veo 3.1 preview (best variant), high | **40** | 80 |
| Veo 3.1 preview, ultra | 60 | 120 |
| Kling 3.0, pro, silent | 7 | 14 |

**Notes:**
- `negative_prompt` is not a documented parameter on either model. The API accepted it without error, but it may be ignored. The prompt already carries the exclusions.
- **Policy flag:** "This is the 16th." over a generated stadium reveal frames synthetic footage as the real venue (`realism-and-disclosure.md` §1). Suggested swap: **"Picture the 16th."**

## Drone reveal: execution (2026-10-19/20)
**Owner approved:** Veo 3.1 (`veo3_1`, variant `veo-3-1-preview`, quality high), 9:16, 4 s, start frame media `48c59f54…`, **80 credits max**.
**Card:** the owner kept "This is the 16th." after the policy flag. This is recorded as the owner's decision.

| Try | Job | Prompt | Result (full-size QA in the Higgsfield sandbox) |
|---|---|---|---|
| 1 | `7ab0214c-99a7-48bc-96b8-29e6887c3b3d` | Owner's prompt verbatim plus the negative prompt (passed through) | **Not a high rise:** a continuous pull-back and tilt-up from the green that reveals invented **towering multi-tier grandstands** (the real 16th's stands are lower). The crowd is **alive** (fans clapping in the foreground, backs of heads). **Invented pseudo-text boards** ("O6AN'S", "KIEI") appear from about 2.4 s; a small illegible emblem sits on the upper facade from about 1.3 s. |
| 2 | `b74c06f5-8666-4d29-8dc7-c23c15bc1575` | The same, with an explicit vertical climb and "all walls, boards and banners are plain blank white" | **Clean:** no text or logos found. But the **motion is weak:** a slow pull-back and slight tilt, the stands barely change, and the player stands still. No aerial. |

- **Spend:** 2 × 40 = **80 credits** (balance 3,598.64 → **3,518.64**). The cap is reached; no further tries without new approval.
- **Finding:** with a ground-level phone start frame, Veo keeps the camera plausible for that vantage and will not take it "high into the sky". A true aerial needs either an already-elevated start frame or text-to-video. Text-to-video would fully invent the venue.
- **Assembly:** `renderD.py` + `mixD.py`, dry-run verified with a stand-in hook. The timeline is 14.0 s:
  - 0–2 s: drone + "This is the 16th.";
  - **2.0: hit, then a hard cut to the real rail** with "Now watch it from up here.";
  - 3.5: the real blast (slow motion, snap at 5.5);
  - 6.5: "Pros play right below.";
  - 9.0: the rail photo (DRAFT line);
  - 11.0: end card.
- **Blocked:** the clip has to be downloaded by the owner (Higgsfield's CDN is blocked from this container).

### Try 3: owner-requested redo of try 1 ("the golf ball disappears")
- **Diagnosis:** the real ball is in the start frame, but it is about 6 px wide (at x≈477, y≈987, just left of and above the flagstick base). The model treated it as noise. The dark object behind the flag is a course camera on a stand, not the ball.
- **Change:** same model, settings and frame. The prompt states that a single white ball rests motionless left of the flagstick, stays visible in every frame and is kept in view near the centre; "disappearing ball, vanishing objects" was added to the negative prompt. Higgsfield's "IN THE DARK" preset suggestion was declined as unrelated.
- **Job:** `8ceb52c4-e296-47e2-ae8d-e25a538d8155`. **40 credits**, approved by the owner's "redo, try one"; this one try is above the earlier 80 cap. Total drone spend so far: 120.
- **QA (full size):**
  - **Ball: PASS.** It is visible left of the flagstick in every sampled frame from 0.0 to 3.95 s and shrinks naturally with the pull-back.
  - **Move:** a continuous pull-back and tilt-up that reveals packed stands; the crowd is alive. Still not a high aerial.
  - **Text: FAIL after about 2.0 s.** A dark board reading "RGFTOH" enters at the left edge, and tiny marks appear on the upper facade boards by 3.9 s. The edit uses about 0–2.0 s; the board's entry at the left edge is handled by a slight punch-in or trim at assembly, then checked frame by frame.

### Owner review of try 3: "feels dead". Next spec
- **The owner wants the player to hit the shot**, the crowd to erupt (as energetic as real, or more), and only the camera angle to change (a pull-back and rise).
- **Root cause:** the start frame was taken *after* the shot (the player standing still), so there was nothing to animate.
- **New start frame:** `drone/START_backswing_clean.png`, V03 src 2.62 s, at the top of the backswing. Wall logos painted out and specks removed; no rail banner in this frame.
- **Prompt:** swing → sand explodes → the ball arcs onto the green and stops left of the flagstick, staying visible → the stands erupt → the camera rises and pulls back from impact.
- **Quotes:** Veo 3.1 preview, high, 9:16: **6 s = 60 credits** (recommended, for room to land the action and the climb); 4 s = 40.
- **Policy notes:**
  - The crowd eruption is generated, and stronger than the real recorded reaction. That is the owner's creative choice, with the AI toggle ON.
  - The pro is recognisable from the real event: organic use only until cleared.

### Try 4: energetic version (owner: 6 s, "hit the shot, crowd roars, then zoom out")
- **Start frame:** the owner's `TN-PHX_bunker_address.png` (V03 at about 2.0 s, the player at address, 720x1280).
  - **It carried** the WM Phoenix Open scoreboard, the "50/50 RAFFLE / #ThePeoplesOpen / $35,840 GUARANTEED JACKPOT" line, and FedEx and WM on the wall.
  - **Cleaned in the Higgsfield sandbox:** the wall rows filled with the wall's own colour (stopping before the camera operator); the frame cropped below the scoreboard (613x1090 → 1080x1920, a 1.17x reframe).
  - Uploaded from the sandbox as media `546b67ef-5b0e-4b17-b9a7-b809b2eb8cbd`.
- **Model:** `veo3_1`, veo-3-1-preview, high, 6 s, 9:16. Native audio prompted as a club thud then a crowd roar.
- **Job:** `3745604e-3453-4fc0-a3f8-8072aa7b1fe8`. **60 credits** (balance 3,478.64 → **3,418.64**).
- **Total AI spend on the Phoenix hook:** 5 (Kling) + 40 + 40 + 40 + 60 = **185 credits**.
- **QA (full size):**
  - **Swing: PASS.** The backswing and downswing play out; the sand explodes at about 2.3 s.
  - **Crowd: PASS, strong.** The stands erupt with arms up from about 3.4 s. Native audio goes from −35 to −12 dB at 3.5 s (a real roar build). Foreground spectators are seen from behind.
  - **Camera:** a pull-back and tilt-up from impact, revealing packed multi-tier stands. A clear reveal, but not a very high aerial.
  - **Text/logos: PASS.** Walls blank; no lettering found in the revealed stands.
  - **Ball: FAIL.** It leaves with the sand spray, but no ball is found on the green from about 3.3 s (white-blob search plus zoomed flag crops). No visible landing, backspin or stop.
- **Recommendation to the owner:** keep this take (energy and roar) and add a **broadcast-style ball tracer**: a composited graphic arc and landing marker, as TV does, honest as a graphic. Or a 5th try from a tighter start frame (another 60).

### Owner review of try 4: REJECTED
- The AI regenerated the swing: the ball and backspin are gone, the club warps, the impact sounds like a driver "ping", and there's no aerial.
- **New owner spec: real shot untouched + AI pull-back only.**

**1. The real segment:**
- V03 (`IMG_0112`) **1.90 → 4.70 s**, 84 frames, picture and swing untouched (1.5x lanczos scale only), real audio.
- **Ball path, measured:** after the splash it is visible on the green left of the flagstick from about 4.3 s, moves back away from the pin, and stops at about 4.9–5.3 s. **The cut at 4.70 s** catches it mid spin-back.
- **The standing wall-logo cover is kept** (wall rows only; it does not touch the swing) so the AI start frame and the real clip match.
- ⚠ **Flag:** 1.90–2.45 s is the phone's zoom-in, and **the WM Phoenix Open scoreboard is legible** (event logo, "50/50 RAFFLE", "#ThePeoplesOpen", jackpot line, and the pro's name at about 1.9 s). Alternative: start at 2.47 s, which still shows the full downswing (impact about 2.87 s).

**2. AI start frame:** `real/LAST_frame_real_4.70.png`, the painted, despecked last frame (1080x1920). Prompt and negative prompt exactly as given by the owner.

**Quotes (4 s, 9:16):**

| Model | Per try | 2 tries |
|---|---|---|
| Veo 3.1 preview high | 40 | 80 |
| Kling 3.0 pro, silent | 7 | 14 |

**3. Stitch plan:**
- Play the AI clip's 24 fps frames one-for-one at 30 fps (1.25x, no duplicate-frame judder).
- A 3-frame dissolve from the real last frame into AI frame 0 hides any small colour shift.

**4. Audio plan:**
- Real V03 audio throughout the real part (the real sand splash).
- The real crowd swell is boosted after the ball lands.
- Under the aerial: real Phoenix crowd roars (V03 tail plus V04's real swell, plus suite ambience), boosted.
- No synthesised impacts or metallic sounds. Final mix −14 LUFS / −1 dBTP.

### One continuous shot: real 2.47 → 5.03 s plus a Kling pull-back (owner: "Kling first, start at 2.47")
- **Start frame:** the owner uploaded media `855433bb…`. That is `START_green_bunker_clean.png` (V03 at about 5.03 s), not the 4.70 frame; verified in the sandbox.
  - **No re-upload needed:** the real clip now runs to that exact frame (ball spun back, settling).
  - `stitchE.py` ends the real part on the identical PNG, so the AI clip continues from the same pixels.
- **Kling:** `kling3_0` pro, 6 s, silent, 9:16. Job `70ba6e1a-b4b4-4d39-9330-8186b7dec3cb`. **10.5 credits** (quoted with the frame attached).
- **QA (full size):**
  - First frame matches the real frame.
  - A smooth slow pull-back and tilt-up; the stands cheer with arms raised, natural at this distance.
  - Walls plain; one tiny illegible dark sign.
  - Invented background: pines, trees and buildings (not Scottsdale desert).
  - **Not a high aerial** (consistent with every model from a ground-level start frame).
- **Build plan:**
  - `stitchE.py`: 78 real frames, then Kling 24→30 fps via optical-flow in-betweens; 3-frame dissolve at the join; about 8.6 s.
  - `mixE.py`: real-only audio, the real splash, +6 dB crowd after landing, a layered real-crowd crescendo under the aerial, −14 LUFS. Dry-run verified with a stand-in.
- **Blocked:** the owner downloads the Kling clip and uploads it here (Higgsfield's CDN is blocked from this container).

### Owner prompt v2: "TPC Scottsdale enclosed stadium" aerial from the ball-on-green frame (2026-10-20)
- **Owner image:** `images/30.webp` (720x1280). This is the raw V03 frame at about 4.8–5.0 s: the golfer standing, the ball near the flag. **It carries the WM Phoenix Open and FedEx wall logos.**
- **Cleaned:** `hold/TN-PHX_ball_on_green_clean.png`, 1080x1920. Wall rows 406–609 are filled with the wall's own colour and despecked; nothing else is changed.
- **Prompt:** the owner's prompt, audio line and negative prompt verbatim; 9:16, 6 s, start frame only.

**Quotes (with the "IN THE DARK" preset suggestion declined):**

| Model | Credits |
|---|---|
| Veo 3.1 preview high, 6 s | **60** (recommended: proven on this scene, native crowd audio, accepts the negative prompt) |
| Cinema Studio 3.0, 1080p, audio, 6 s | 78 |

- **Blocked:** the owner uploads the cleaned PNG to Higgsfield and sends the media_id; this container cannot upload.
- **Note:** the prompt names TPC Scottsdale; the generated venue is synthetic, so the AI toggle stays ON.

### Veo run on the owner's TPC Scottsdale prompt (2026-10-20)
- **Uploaded media `9d5a35ad…` (`TN-PHX_V03_lastframe.png`) was the RAW frame** (WM Phoenix Open and FedEx on the wall).
  - Cleaned in the Higgsfield sandbox: wall rows 403–613 filled with the wall's own colour.
  - Re-uploaded from the sandbox as **`59b82fa7-9d57-44e1-a365-8d1e170294fb`** and used as the start frame.
- **Run:** `veo3_1` preview high, 6 s, 9:16. The owner's prompt, audio line and negative prompt verbatim.
  - Job `e55473f1-edc0-4f28-a923-4f964d6e6ee0`. **60 credits.**
- **QA (full size):**

| Check | Result |
|---|---|
| Golfer still, start frame matched | ✅ |
| Camera eases to a hold for the final second | ✅ |
| Setting | ✅ Sonoran desert, saguaros, mountains, a two-storey skybox building, packed stands |
| Camera height | ⚠ A pull-back and tilt-up ending in a view across the hole from stand level, with fan heads in the foreground. **Not a high aerial.** |
| Crowd | ⚠ Mostly standing, small movements; little visible clapping or cheering |
| Text | ❌ **Legible pseudo-text on navy boards** ("Ivodecees / BHO 201…") at wall level, left and right, in the final 2–3 s |
| Native audio | ❌ **Fades** (−30 → −39 dB) instead of swelling; it would be replaced by the real-crowd mix |

### DELIVERED: one-shot v1, `TN-PHX_bunker_oneshot_AI_v1.mp4` (owner: "trim to 1.5–2 s, after the real V03, flow smoothly")
- **Frame match:** the Veo start image is **V03's very last frame** (8.14 s; best-match error 6.8 vs ≥12 for its neighbours).
  - The real part therefore runs **2.47 s → 8.14 s** (171 frames, 5.70 s): the real swing, splash, ball landing and spin-back, and the golfer standing during the real crowd reaction.
  - Untouched apart from the standing wall-logo cover and despeck.
- **AI part:** the whole 6 s Veo move retimed into **2.0 s** (59 frames).
  - Smoothstep easing: it starts at the real shot's pace and settles into the hold. Optical-flow in-betweens; a 4-frame dissolve at the join.
  - **The two invented lettered navy boards are covered** with the wall's own colour, keyframe-tracked and snapped to the board pixels. Verified at full size from 6.2 s to the end.
- **Sound (real recordings only):**
  - V03's audio with its real splash; the real crowd +6 dB after the ball lands.
  - Under the aerial: the V03 crowd carried on, V04's real roar (peak placed on the hold), V02 and V01 stadium bed, all ramped.
  - Ends at its loudest (−13 dB per 0.25 s on the final hold).
  - **−14.3 LUFS integrated, −3.4 dBTP.** No synthesised sounds, no music.
- **Checks:**
  - **Spec:** 7.67 s, 1080x1920, 30 fps, H.264 plus AAC.
  - **Join:** smooth (frame difference 1–3 at frame 171; no spike).
  - **Mid-move motion:** a smooth peak (no jump).
- **SHA-256 (first 16):** `295c396438c9961f`
- **Not run:** dual gate. **Owner review:** PENDING. The AI toggle is required.
