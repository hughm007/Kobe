---
title: "TripNerd Phoenix v2 'This is the 16th.': energy rebuild, build record"
type: report
client: tripnerd
owner: Karl
status: draft
created: 2026-10-19
updated: 2026-10-19
tags: [client, phoenix-open, reel, real-footage, build, music]
supersedes: ../build-v1/build-record.md (v1 A/B; the near-miss opener is cut)
---

# Phoenix v2: build record

**Brief (owner, 2026-10-19):**
- Open at 0.0 on the bunker blast: slow motion that snaps to real speed on a bass hit, with the real crowd layered in. Card: "This is the 16th."
- Crowd-to-suite whip, about 0.5 s per shot. The music drop lands on the suite rail.
- 8–10 cuts in 12–15 s, on a 120 BPM grid.
- Speed ramps, punch-ins, swooshes and impacts on the cuts.
- Bold white animated text. Logos covered only where they appear.
- No banned words.
- "Your group, rail side." stays DRAFT until Jason confirms rail access.
- Music: a free Pixabay track chosen by the owner, built into the MP4.

## Deliverables (scratchpad; media not committed)

| File | What | SHA-256 |
|---|---|---|
| `TripNerd_Phoenix_v2_TEMPBEAT_DRAFT.mp4` | Picture plus real audio plus SFX plus a **temporary synthesised 120 BPM beat** (preview only; replaced by the Pixabay track) | `e707c37b…7fb67305` |
| `TripNerd_Phoenix_v2_FX-only_DRAFT.mp4` | Picture plus real audio plus SFX, with **no music**, ready for the track | `8e4d1628…e166e47d43` |
| `silent_v2.mp4` | Silent picture master | `c5f59cb7…0079eb4` |

**Format:**
- 13.0 s, 390 frames, 1080x1920, 30 fps, H.264 High;
- AAC 48 kHz, 192 kbps;
- TEMPBEAT: −13.7 LUFS / −3.5 dBTP. FX-only: −14.6 LUFS / −1.0 dBTP.

## Cut list (120 BPM: 1 beat = 0.5 s = 15 frames)

| # | Time | Source | Move | Card | Sound |
|---|---|---|---|---|---|
| 1 | 0.0–2.0 | V03 src 2.82–3.22 at **0.2x** (impact at about 2.87 s, so the blast is on screen from the first frames) | Slow drift-out 1.08→1.0 | **"This is the 16th."** pops in at 0.0 | Reverse swell plus muffled real murmur |
| 1b | 2.0–3.0 | V03 src 3.22–4.22, **snaps to real speed at 2.0** | — | The card bumps on the hit | **Bass hit at 2.0**, plus this shot's own real crowd swell layered in (V03 src 4.6–6.6, retimed about 1.5 s earlier) |
| 2 | 3.0–3.5 | V02 src 0.30, at 1.25x (24 fps frames shown one-for-one) | Whip in, punch-in 1.12 | — | Swoosh |
| 3 | 3.5–4.0 | V01 src 2.0–2.75, at 1.5x | Whip in, punch-in 1.1 | — | Swoosh plus riser |
| 4 | **4.0**–5.0 | V01 src 0.0–1.0, suite rail | Whip in. **DROP at 4.0** | "From up here." | Impact; the drop |
| 5 | 5.0–5.5 | V01 src 1.0–1.5 | Punch-in 1.3 on the rail | "From up here." (held) | — |
| 6 | 5.5–7.0 | V03 src 4.47–5.97, real speed | — | "Pros play right below." | Real crowd swell, in sync with the picture; impact |
| 7 | 7.0–8.0 | V03 src 5.97–6.97 | Jump punch-in 1.28 | (held) | Impact |
| 8 | 8.0–10.0 | P08 4:5 crop plus "2024" | Hard punch-in 1.12 at 9.0 | **"Your group, rail side." (DRAFT)** | Impact; ambience (V02) |
| 9 | 10.0–13.0 | Approved end card, animated: logo settles, the pill pops, "Link in bio" | — | — | Impact; ambience fades out |

**8 cuts** (at 3.0, 3.5, 4.0, 5.0, 5.5, 7.0, 8.0, 10.0) plus one speed-ramp snap at 2.0.

## Methods, disclosed
- **Slow motion (shot 1):** DIS optical-flow in-betweens (non-generative interpolation, 5 frames for every real one). Checked at full size: impact, plume and follow-through, with no visible warping.
- **Logos:** removed by **flat fills in the wall's own colour, only on the sponsor-wall rows, tracked frame by frame**. Bright foreground (pillars, the flag) is protected. No blur, no AI.
  - The bunker shot reads as a blank wall.
  - The distant band in the suite and crowd shots reads as a plain grey strip.
- **SFX:** synthesised in code (bass hit, impacts, whooshes, riser, reverse swell). No licence needed.
- **The temp beat is synthesised placeholder music,** not a final.
- **Real audio:** clip audio only. Shot 6's crowd swell is the shot's own reaction in sync. The hook layer reuses that same swell about 1.5 s early, under the snap.

## Music hand-off
- Send the Pixabay track (file, or page plus download).
- I'll lay it so **its drop lands at 4.0 s**, trim and fade at 13.0, and duck the real crowd and SFX under it.
- Re-render the mix with `mix2.py`, swapping the temp beat for the track.
- **Check the track page for any "Content ID"/claim note before posting.** Pixabay's licence allows commercial use, but some tracks are registered with Content ID.

## Open
1. "Your group, rail side.": **DRAFT** until Jason confirms rail access in writing. A safe swap if needed: "Bring your crew."
2. Originals of V01, V02 and V03 (1080p/4K) for sharpness. Same scripts.
3. P08 partial team flag; V01 face (relying on the owner-stated face approval, not yet in writing).
4. Dual gate (critic plus isolated skeptic): **not run**. Owner review: PENDING.
