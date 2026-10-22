---
title: "TripNerd Phoenix Open Reel — '16th Hole LOGE Suite' → '16th Hole Suite' (frame patch)"
type: report
client: tripnerd
owner: Karl
status: draft
created: 2026-10-22
updated: 2026-10-22
tags: [phoenix-open, reel, text-fix, video]
---

# One-line text change on the Phoenix Open Reel (2026-10-22)

**Ask (owner):** change the first checklist line on the ticket and on the corner card from "16th Hole LOGE Suite" to "16th Hole Suite". Everything else stays identical.

**Input:** the owner's upload `TripNerd_PhoenixOpen_25s_small.mp4`.
- MD5 `397d2944744f3cb138bcac0edc717bb9`.
- 30.98 s despite the "25s" in the name; 929 frames; 1080×1920; 30 fps.
- No project files or source clips for this cut exist on any branch of this repo, so the rendered frames were patched.

**Output:** [`../../06_Review_Exports/2026-10-22-phoenix-open-16th-hole-suite/TripNerd_PhoenixOpen_25s_small_16thHoleSuite.mp4`](../../06_Review_Exports/2026-10-22-phoenix-open-16th-hole-suite/)
- 929 frames, 30 fps, 1080×1920, H.264 High at 5.6 Mb/s (original 4.4), 21.4 MB.
- Audio stream-copied, bit-identical: audio MD5 `670f78fc…` on both files.

## Method
1. **Track:** `track.py` uses SIFT and a RANSAC homography from a clean reference ticket (13.5 s) to every frame.
2. **Patch, opaque frames** (`patch.py`; 465 frames covering the full ticket, the push-in, the shrink and the corner card):
   - inside line 1 only, the frame's own "Suite" pixels move left by the width of "LOGE ", leaving the same word gap;
   - the vacated letters are refilled row by row from the plain background beside them, which follows the paper, the checked-row highlight band and the lighting;
   - font, size, weight, colour and alignment are therefore the original pixels;
   - the checkbox and tick animation are outside the edited area.
3. **Cross-fades** (30 frames: 228–243, 388–395, 838–843):
   - two candidates per frame: in-frame, or the neighbouring opaque frame's change applied through a per-frame fitted blend curve;
   - the candidate with the least residual letter energy where "Suite" used to be is kept;
   - 52 frames were skipped, where the line is off-screen during the stamp zoom.

## Known limitation
Over the busy crowd shot, the fade-in frames 236–241 (about 0.2 s, ticket opacity 25–85 %) keep a faint trace of the old "Suite" outline mid-dissolve. Every opaque frame, the 13.0 s fade and the end fade are clean.
