---
title: "TripNerd 20 s hosting spot — end card replaced (owner reference file)"
type: deliverable
client: tripnerd
owner: Karl
status: delivered for owner watch (polo fix v6)
created: 2026-09-24
updated: 2026-09-24
tags: [client, deliverable, video, endcard, polo-fix, 16x9]
---

# End card fix on `TripNerd_20s_1080p_1.mp4`

**Owner ask (2026-09-24):** fix the end card of the supplied 20 s advert so it is clean, in TripNerd's colours, with a tagline that makes sense below the logo. Then reverse-engineer the build into a routine (see `playbooks/ads/recipes/hosting-spot-20s.md`).

**Source, FACT:** 1920x1080, 30 fps, 20.000 s, −15.6 LUFS. Original card 17.0–20.0 s: dark green, typed "TripNerd®" wordmark (not the logo file), "THIS IS HOW YOU HOST." above the mark, gold "REQUEST VIP PACKAGE DETAILS", "TripNerd.com". Imported to Higgsfield as 4a8873be.

**What changed:** only the picture from 16.6 s to 20.0 s. A 0.4 s crossfade from the host shot into a static card on brand blue #5896E9 (site blue; the logo's own navy is #202838 and its blue #18A0F0) with a 6 % darkening gradient toward the bottom, the official colour logo lockup (real file 46ae277a, composited, LB24), tagline **"Hospitality. Handled."** below the logo (the film's own last caption, so the card repeats the promise the host just made), a white pill **REQUEST VIP PACKAGE DETAILS**, and **tripnerd.com**. Audio is the original track, untouched (loudness identical before and after). The navy alternate was rendered and kept (`card_navy.png` in the sandbox; comparison sheet d82d28a2).

**Files:**
- Fixed advert: `https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/f0158273-d5c1-4eb8-a768-296f211d62de.mp4`
- New card PNG: `…/bbd4bea0-d41b-4e40-b5c1-7de4024dfc37.png` · A/B sheet (original, blue, navy): `…/d82d28a2-a257-4aa3-b25d-e5e200e3ad6e.jpg`
- QC (2 fps whole film, 4 fps last 5 s): `…/af29c3f5-6255-4ed4-a60c-41e082d66104.jpg` · source sheets 323dacca, 32582776
- Scripts: `17th-hole-v3-build/gen_card.py`, `17th-hole-v3-build/endcard_swap.sh`

**Flags carried, not fixed (not in scope of the ask):** the opening title "THE PLAYERS" is a registered tournament mark; "VIP" is a claim to check against the package; the host's and guests' likeness need consent on file; sources of the food, drink and guest shots are unknown. Loudness is −15.6 LUFS against the −14 delivery spec; re-normalise at master.

**Spend:** none (no generation).

---

## Polo wordmark fix (owner ask, 2026-09-24, later)

**Owner ask:** "the ladies polo says 'TripNers' instead of 'TripNerd' — fix that, then give me the advert back."

**FACT:** in the connections shot (8.0–10.0 s) the woman's polo carries a generated embroidery reading "TripNers" (52x16 px at 1080p, chest left). Nothing else in the film carries the misspelling (checked the 2 fps sheet and the 4 fps 7.5–10.5 s sheet).

**What changed (8.0–10.0 s only; rest of the picture and all audio untouched):**
1. The 60 frames of the shot were exported as PNG. The misspelt text was tracked frame by frame (template match, ±70 px window, 5-frame moving average; scores 0.40–0.60 so the track never fell back).
2. The old text pixels were filled with the surrounding fabric colour (soft mask, cloth texture kept).
3. The real wordmark from the official logo file (46ae277a, white "TripNerd®" block) was composited at 9 px high, centred on the old text, alpha-masked to navy fabric only (so hair, skin and the placket never take the mark), with a 1 px relief shadow under the strokes and its brightness matched to the original stitching. Real logo file only, per brand-assets policy.
4. The 60 frames were re-encoded as a segment and overlaid on the source, then the end card (unchanged from the fix above) was re-applied. H.264 CRF 16, 30 fps, faststart. Loudness identical (−15.6 LUFS / −2.0 dBFS).

**Iterations (all in the vendor sandbox, no generation spend):** v4 at the old text's width (wordmark only 6 px tall, read weak), v5 brightness-matched (still weak, same cause), **v6 sized by height + relief — delivered**.

**Files:**
- Delivered advert v6 (end card + polo fix): `https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/54897828-2a64-483a-a7ed-885c1df986ad.mp4`
- Polo before/after zoom (frames 1, 16, 31, 46, 60 of the shot): `…/557c81c1-0c0f-4526-8759-e96261218c31.jpg` · whole-film QC: `…/735ca042-7b8f-4798-9c77-69fe2e7b39dc.jpg`
- Earlier passes kept for the record: v5 `…/0b31b2a3-65e2-4ed6-abe4-0ff5ec973f8d.mp4`; v4 `…/5ef179fe-2f0d-40fb-9edb-ad6a1c871b58.mp4`; zooms a76c8a5b (v4), 7ee29a72 (v5)
- Script: `17th-hole-v3-build/polofix.py` (the v6 pass; inputs: `polo/f%03d.png`, `logo.png`)

**Not verified:** the fix was checked on contact sheets and 4x zoom crops of five frames, not by playing the shot in motion. Rolling shutter or a fabric fold could show a one-frame wobble the sheets would not catch; the owner should watch 8–10 s at full screen once.

**Learning:** generated "brand" embroidery on wardrobe is a known failure of image-to-video models; the recipe now says to check every garment for the wordmark spelling before delivery (step added to `playbooks/ads/recipes/hosting-spot-20s.md`).
