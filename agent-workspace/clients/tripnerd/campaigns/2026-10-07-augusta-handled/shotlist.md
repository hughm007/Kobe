---
title: "TripNerd 'Augusta, handled' 15 s — shot manifest and routing record"
type: report
client: tripnerd
campaign_id: 2026-10-07-augusta-handled
owner: Karl
status: draft
created: 2026-10-07
updated: 2026-10-07
tags: [shot-manifest, routing, real-footage, seedance, augusta]
---

# Shot manifest — 15.0 s, 9:16, 1080×1920, 30 fps

## A6 (current, the posting master): 20.0 s
A5's edit with the real shots upscaled. **Picture:** V19 (shot 1) and V25 (shot 4) now come from Topaz Video 2160p upscales of the same frames (REAL-ASSET, upscaled; no content generated). **Sound:** identical to A5. **Export:** one high-quality encode.

## A5: 20.0 s (owner: slower voice, voice on every line)
| # | Time | Picture | Super / sound |
|---|---|---|---|
| 1 | 0.0–3.0 | V19 hook | "Augusta is the bucket-list moment." · music from 0.21 s |
| 2 | 3.0–5.3 | House push-in | "Planning it shouldn't be the hard part." |
| 3 | 5.3–12.3 | Veranda + checklist | Host voice reads the list 5.40–12.11 (atempo 1.08); ticks 6.44 / 7.68 / 9.44 / 10.88 |
| 4 | 12.3–14.9 | V25 | "Bring your people." → "Enjoy the moment." · voice 12.40–14.62 |
| 5 | 14.9–17.51 (hard cut on the drop) | Clip A end shot, as A4 | "Let TripNerd handle the details." · voice 15.15–17.24 |
| 6 | 17.51–20.0 | Camera-roll card, as A4 | Voice "All done with TripNerd!" 17.62–19.13 (no caption) |

## A4: 18.12 s
| # | Time | Picture (route) | Super / sound |
|---|---|---|---|
| 1 | 0.0–3.0 | V19 hook, as A3 (REAL-ASSET) | "Augusta is the bucket-list moment." · Golden Storm groove (track from 2.11 s) |
| 2 | 3.0–5.5 | House push-in, as A3 (REFERENCE-GROUNDED) | "Planning it shouldn't be the hard part." |
| 3 | 5.5–10.95 | Veranda + checklist, as A3 (REFERENCE-GROUNDED) | Voice (the hosting-spot host's, Seed Audio `505d1f23`) 5.50–10.85; ticks 6.38 / 7.38 / 8.86 / 9.96; music ducked 9 dB |
| 4 | 10.95–13.0 | V25, as A3 (REAL-ASSET) | "Bring your people." → "Enjoy the moment." |
| 5 | 13.0–15.62 (hard cut on the drop) | Owner's clip A (Seedance `adac6b4d`), re-upscaled to 4k (`a852db04`), flag cleaned (`flagfix3`) and gallery cleaned (`gallfix`). Source 0–2.62 s: the whip-tilt down from the pines, the flag, the ball rolling in to sit beside the cup. 9:16 window centred on the flagstick, easing 1.0→1.4×, cup at 75 % height (`endclip.py`) (owner's GENERATE clip) | "Let TripNerd handle the details." 13.3–15.58 · the track's drop at 13.0 |
| 6 | 15.62–18.12 (hard cut on the beat) | TripNerd's approved camera-roll card (`card.py`): blue gradient slides up over the end shot, real logo `46ae277a`, "Now booking 2027", "Talk to a Nerd" pill with the tap, tripnerd.com (COMPOSITE) | the card's whoosh, kick (on the beat), tap; music fades over the last 0.6 s |

## v3 timing (superseded by A4)
**v3 timing:** hook 0–3.0 · house 3.0–5.5 · list 5.5–10.95 (veranda stretched 1.14× to fill it) · V25 10.95–13.0 · lockup 13.0–15.0.
Audio: original music bed (`build/music.py`) throughout, ducked 9 dB under the voice; voice = Seed Audio "Miles" (`d6217608`, atempo 1.04) reading
"With TripNerd, enjoy course access, private executive accommodations, daily hospitality, and concierge support." at 5.5–10.83 s;
ticks at 6.32 / 7.24 / 8.74 / 9.78 s (on the words). B3 has no on-screen AI label. The table below is the v1/v2 timing.

Beat times are the centres of 0.25 s crossfades. Supers are composited (Pillow, Montserrat ExtraBold/SemiBold; build script [`build/assemble.py`](build/assemble.py)).

| # | Time | Picture | Source (route) | Super | Motion |
|---|---|---|---|---|---|
| 1A | 0.0–3.0 | Sunset over TripNerd's hospitality lawn: lounge sofas, the pavilion, guests small | V19 2.4–5.5 s, Lanczos 404×720 → 1080×1920 then a 1.22× punch-in anchored left (keeps a golfer on West Lake's fairway out of frame); no AI (REAL-ASSET) | Augusta is the bucket-list moment. | Handheld walk toward the pavilion |
| 1B | 0.0–3.0 | The ball lands and rolls by the pin (plain yellow flag, azaleas, generated gallery) | Owner's Seedance 2.5 clip `adac6b4d` (MD5 `43777a5e…`), source 0.7–3.8 s, 9:16 window x=730 (owner's GENERATE clip) | same + "AI-generated scene" label 0.25–2.85 s | Ball travel |
| 2 | 3.0–5.6 | TripNerd's Private Executive Home | Seedance 2.5 `ddb843fe` (omni_reference, start image = TripNerd's published "private-executive-home" photo, bytedance 4k upscale `92511aad`, 9:16 crop) (REFERENCE-GROUNDED, people-free) | Planning it shouldn't be the hard part. | Slow push-in to the door |
| 3 | 5.6–10.4 | TripNerd's veranda: white-clothed tables, columns, lawn | Seedance 2.5 `f2a20ca1` (start image = TripNerd's published veranda photo, upscale `68e1a1b4`, 9:16 crop) (REFERENCE-GROUNDED, people-free) | With TripNerd: ✓ Course access ✓ Private executive accommodations ✓ Daily hospitality ✓ Concierge support (items at 6.05 / 6.85 / 7.65 / 8.45 s) | Gentle drift right + push-in |
| 4 | 10.4–12.8 | Live music on TripNerd's veranda → columns, tents, guests | V25 0.0–2.65 s, Lanczos up, own audio muted (REAL-ASSET) | Bring your people. → Enjoy the moment. (11.45 s) | Handheld pan |
| 5 | 12.8–15.0 | Lockup over V25's tail (2.4–3.87 s slowed 1.62×, blurred σ22) | Real logo file (tripnerd.com `@3x`, 1633×601) on brand-blue pill (82,142,224) (COMPOSITE) | Let TripNerd handle the details. · [Get the Augusta details] · @tripnerd | Background motion + 16 px/s lockup drift |

## Routing record (per shot, with reasons)
- **1A REAL-ASSET:** the only TripNerd video with a sunset over its own Augusta-week hospitality lawn; 2.4–5.5 s is the one stretch with neither the West Lake golfers (0–3.0 s, right edge — cropped) nor the pavilion TVs showing the golf broadcast (≥5.9 s).
- **1B owner's GENERATE clip:** Karl's own generation, used unchanged; held variant (generated crowd + Augusta trade dress).
- **2 and 3 REFERENCE-GROUNDED:** no TripNerd video of the house or a people-free veranda exists. TripNerd's own published photos (people-free) are animated; Seedance 2.5's `start_image` maps to `reference_images` in `omni_reference` mode (not frame-locked), so every take was checked frame 0 and last frame against the source photo.
- **4 REAL-ASSET:** V25 is TripNerd's own veranda recording; guests covered by Jason's standing consent; the performer's consent is an open item.
- **5 COMPOSITE:** identity marks only from the real logo file; never generated (BC-21/BC-42).

## Takes
| Job | Shot | Credits | Verdict | Reason |
|---|---|---|---|---|
| `92511aad` | house photo 4k upscale | 2 | used | — |
| `68e1a1b4` | veranda photo 4k upscale | 2 | used | — |
| `ddb843fe` | 2 house push-in (4 s, 1080p) | 48 | **LOCKED** | frame 0 matches the photo; push to the door; no flags, no people |
| `f2cd4537` | 3 veranda lateral dolly (5 s) | 60 | **REJECTED** | invented a dark foreground pillar wiping across most of the frame |
| `f2a20ca1` | 3 veranda drift + push (5 s) | 60 | **LOCKED** | holds the photo; nothing invented in frame |

## Source hashes (MD5)
v19 `c5520914…` · v25 `ce2d6cb2…` · clipA `43777a5e…` · house `89f259dc…` · veranda (rejected) `80fa69ca…` · veranda2 `f1f98070…` · house 9:16 still `c29be884…` · veranda 9:16 still `00725c5f…`
