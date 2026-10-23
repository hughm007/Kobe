---
title: "TripNerd Phoenix: 'Down there / Up here' (A) and near-miss (B), build v1"
type: report
client: tripnerd
owner: Karl
status: draft
created: 2026-10-19
updated: 2026-10-19
tags: [client, phoenix-open, reel, real-footage, build]
---

# Build v1: version A and version B

**Owner instructions (2026-10-19):**
- solid caption panels over the WM/FedEx wall band are approved;
- build A;
- build the near-miss opener as B.

**Concept source:** [`../grok-challenge/reconciliation.md`](../grok-challenge/reconciliation.md) §3.

**Routes:**
- every shot is REAL-ASSET or EDIT-ONLY;
- **no generation, no spend, no AI upscaling, no frame interpolation, no blur.**

## Deliverables (scratchpad; media not committed)

| File | Length | SHA-256 |
|---|---|---|
| `TripNerd_Phoenix_DownThereUpHere_A_v1.mp4` | 13.0 s | `906ecba6…69dcb03` |
| `TripNerd_Phoenix_NearMiss_B_v1.mp4` | 14.8 s | `5162abfa…125aefe` |
| silent masters `silentA.mp4` / `silentB.mp4` | — | `23a68f3b…` / `c5691a82…` |

**Format, both files:**
- video: H.264 High, 1080x1920, 30 fps;
- audio: AAC 48 kHz, 192 kbps.

## Shot manifest

| Beat | A | B | Source (in–out) | Card | Panel |
|---|---|---|---|---|---|
| Open | 0.0–1.8 | — | V02 / IMG_0192 [0.0–2.25], every 24 fps frame shown once at 30 fps (1.25x, no duplicate-frame judder) | "Down there, shoulder to shoulder." | Fixed y 960–1110, over the wall band |
| Open | — | 0.0–3.6 | V04 / IMG_0097 [8.4–12.0]. Strike at 0.3; crowd swell peaks at 2.3 (−12 dBFS RMS at source 10.7) | "Watch the flag." → "Almost." at 2.2 | y 700–830 (no wall in this shot) |
| Suite | 1.8–3.8 | 3.6–5.6 | V01 / IMG_0075 [0.0–2.0] | A: "Up here: shade and a rail." · B: "Now see it from up here." | Fixed y 960–1110 |
| Action | 3.8–7.3 | 5.6–9.1 | V03 / IMG_0112 [2.47–5.97]. Starts after the zoom has settled, so the scoreboard and player names are out | "Pros play right below." | **Tracked**: the wall is detected in every frame and median-smoothed (`render.py` `wall_band`) |
| Proof | 7.3–10.0 | 9.1–11.8 | P08, static 4:5 crop x380–1260 y900–2000 (Grok's crop, verified), plus a "2024" label (proven via P09) | "Your group, rail side." | y 296–436 |
| End | 10.0–13.0 | 11.8–14.8 | The owner-approved Camera Roll end card (logo, "Now booking 2027", "Talk to a Nerd"). "tripnerd.com" replaced by "Link in bio"; the tap-ripple artifact on the pill was removed by redrawing it | — | — |

**Audio:**
- real clip audio only, from the clip on screen;
- the photo and end-card beats carry V03's tail and then V02's ambience from the same hole;
- 15 ms fades at every cut, a 1.6 s fade-out at the end;
- loudnorm 2-pass. **A: −14.0 LUFS / −1.0 dBTP. B: −14.1 LUFS / −1.0 dBTP.**
- No music or added sound effects.

## QC
- **QA1 (FACT):**
  - durations exact (390 and 444 frames);
  - A/V lengths match;
  - **no near-duplicate frames inside any video beat**;
  - cuts land on the planned frames.
- **Panel coverage (FACT):** checked at full size on V01, V02 and V03. Every WM/FedEx band and the circular event logo sit under the panels. **Left visible:** tiny, unreadable signage on the far skybox fronts (V01/V02 around y 850–950).
- **Residual risks (owner to accept or fix):**
  1. **P08:** a red flag with black/white curves is partly visible behind the guest in beige. It is probably a team flag; no text is legible.
  2. **V04:** a small club crest on the spectator's jacket.
  3. **"Almost." (B):** the ball is only a few pixels wide. In frames 9.0–11.4 s it travels to the flagstick and ends beside it, and the crowd swell peaks then. That supports "almost", but it is not proven. Confirm from the original at full size.
  4. **Softness:** sources are 720p copies scaled 1.5x with lanczos. They will look soft next to native 1080p. The originals fix this with the same render scripts.
  5. **"Your group, rail side." implies the 2027 package includes rail-side seats.** This needs an Evidence Record from TripNerd before paid use.
- **Dual gate (critic + isolated skeptic): NOT RUN.** These files are owner-review drafts, not client-ready.
- **Owner review:** PENDING.

## Rebuild
`python3 render.py A silentA.mp4 && python3 mix.py A silentA.mp4 out.mp4` (same for B). Paths at the top of each script.
