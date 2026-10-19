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
