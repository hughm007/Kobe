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
