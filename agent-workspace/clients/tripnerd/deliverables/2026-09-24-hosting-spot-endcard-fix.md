---
title: "TripNerd 20 s hosting spot — end card replaced (owner reference file)"
type: deliverable
client: tripnerd
owner: Karl
status: delivered for owner watch
created: 2026-09-24
updated: 2026-09-24
tags: [client, deliverable, video, endcard, 16x9]
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
