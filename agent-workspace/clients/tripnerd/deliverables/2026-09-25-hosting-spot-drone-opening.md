---
title: "TripNerd hosting spot (25.8 s owner cut) — opening clip replaced with the drone shot"
type: deliverable
client: tripnerd
owner: Karl
status: delivered for owner watch
created: 2026-09-25
updated: 2026-09-25
tags: [client, deliverable, video, opening-swap, 16x9]
---

# Opening swap on `TripNerdFix3_3.MOV`

**Owner ask (2026-09-25):** take out the first clip of the advert and substitute the drone footage supplied; return a finished advert.

**Inputs, FACT:**
- `TripNerdFix3_3.MOV` — the advert, owner's own export: 1280x720, 24 fps, 25.792 s, AAC 48 kHz, −16.7 LUFS. Spine: title aerial 0–4 · food 4–6 · drinks 6–8 · connections 8–10 (polo already reads "TripNerd") · flag/crowd 10–13 · host 13–17 · "REAL SUITE FOOTAGE" 17–24 · blue end card 24–25.8. Higgsfield media 17a07624.
- `hf_20260925_181400_….mp4` — the "drone footage": a Higgsfield export, 1920x1080, HEVC 10-bit, 24 fps, 5.05 s, near-silent track (−41 LUFS). Top-down orbit of the island green pulling out to the grandstands. Media 4d26298d. Being an `hf_` export it is a generation, not camera footage (realism-and-disclosure policy applies; the owner supplied it as drone footage).

**What was done:**
1. Opening (0–4.04 s): drone frames 23–119 (97 frames), 10-bit → yuv420p, no grade change. Its own audio dropped.
2. The original opening's overlays were re-set on it so the film keeps its grammar: "THE PLAYERS" (Montserrat Bold, cap 58 px, x 66, top 823 at 1080p), "VIP ON 17" (cap 23 px, gold 207/187/137, x 72, top 933), the real logo wordmark top-right (283 px wide, right edge 1843, top 62), all with a 55 % soft shadow and the original's fade-in (0.04–0.21 s), measured from the owner's frames by diff.
3. Body from source frame 97 onward, Lanczos-upscaled 1280x720 → 1920x1080, untouched otherwise. **Found and fixed:** in the owner's export the title and wordmark layers overrun the picture cut by one frame (source frame 96 = food with the title on it). The body therefore starts one frame later and the opening runs one frame longer (97 frames), so audio sync is unchanged.
4. Audio: the .MOV track copied bit-for-bit (loudness identical before/after). Output 1920x1080, 24 fps, 619 frames, 25.792 s, H.264 CRF 16, faststart.

**Files:**
- Delivered: `https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/1b529e1a-4591-4dfb-bd2b-d22255c0a4fe.mp4` (v2)
- QC (2 fps whole film, 8 fps first 5 s, title side-by-side vs original, cut frames): `…/880f8541-6c2a-4f7d-a85b-7d6275fb7ea9.jpg`
- v1 (superseded: ExtraBold title, one leaked title frame at 4.0 s): `…/412a658a-9153-48dd-bf3b-e1a76f07c590.mp4`, QC `…/d5436046-…jpg`
- Analysis sheets: advert `…/55f7b839-…jpg`, drone `…/b5b0eba3-…jpg`, title crops `…/70d465ff-…jpg`
- Scripts: `17th-hole-v3-build/title_overlay.py`, `17th-hole-v3-build/opening_swap.sh`

**Not verified:** watched on contact sheets and frame crops, not in motion. The 720p → 1080p upscale of the body is real: the body is no sharper than the owner's 720p export; if a 1080p export of this cut exists, re-run takes a minute.

**Flags carried:** "THE PLAYERS" registered tournament mark in the title (owner kept it in their own cut); "VIP" claim; likeness consent for host, guests and the suite footage; loudness −16.7 LUFS against −14 delivery spec (re-normalise at master); the drone opening is a generation supplied as footage.

**Spend:** none (sandbox only).
