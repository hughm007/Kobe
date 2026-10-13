---
title: "Recipe: the 20-second hosting spot (reverse-engineered from TripNerd_20s_1080p_1.mp4)"
type: playbook
client: tripnerd
owner: Karl
status: active
created: 2026-09-24
updated: 2026-09-24
tags: [ads, video, recipe, routine, tripnerd, hospitality, 16x9]
source: owner-supplied reference advert, analysed 2026-09-24 (scene cuts by ffmpeg, words by faster-whisper, frames by contact sheet)
---

# The 20-second hosting spot

A repeatable routine for a hospitality advert in the shape the owner approved on 2026-09-24. It is
a "sell the hosting, not the sport" spot: one landmark, three sensory proofs, the moment, the host,
the card. Run it as written; change only the inputs table and the copy table.

## What the reference is, measured (FACT)

| | |
|---|---|
| File | 1920x1080, 30 fps, H.264 yuv420p limited range, AAC 48 kHz stereo, 20.000 s |
| Loudness | −15.6 LUFS integrated, −2.0 dBFS peak |
| Scene cuts | 4.0 · 6.0 · 8.0 · 10.0 · 13.0 · 17.0 |
| Logo | small white wordmark top-right for the whole film (watermark), not the character lockup |
| Captions | white, bold, all caps, lower-left, with a thin vertical rule at the left and a translucent dark band across the lower fifth; one or two words each |
| Voice | one male voice, unhurried, slight smile; no music bed audible on the sheet (not heard here, LB29) |
| End card | 3.0 s static; dark green, typed wordmark, tagline above the logo, gold CTA, URL (replaced 2026-09-24, see below) |

### Beat map (what the viewer knows before and after each beat)

| Time | Beat | What is on screen | Caption | Voice (measured) | Job of the beat |
|---|---|---|---|---|---|
| 0.0–4.0 | Landmark | Golden-hour wide of the island green, the tree, the water | "THE PLAYERS / VIP ON 17" title lower-left | 2.3–4.8 "Imagine your clients right here," | Place the viewer somewhere they already want to be. |
| 4.0–6.0 | Proof 1 | Macro: gloved hand sets a plated canapé | "THE FOOD." | 5.1–5.6 "the food," | First sensory proof. Caption and voice say the same word. |
| 6.0–8.0 | Proof 2 | Macro: beer poured, head rising | "THE DRINKS." | 6.3–7.3 "the drinks," | Second proof, same rhythm. |
| 8.0–10.0 | Proof 3 | Four guests at a high-top in the suite, green behind, glasses up | "THE CONNECTIONS." | 8.3–9.4 "the connections," | The real product: the people you bring. |
| 10.0–13.0 | The moment | The green and flag, packed grandstand behind | none | 10.0–12.2 "and that roar." | The payoff the sport gives you for free. Sound carries it. |
| 13.0–17.0 | The host | One man on the suite balcony turns to camera, raises a beer | "HOSPITALITY. HANDLED." | 14.9–16.7 "Now this is how you host." | The promise, said by a person, to the buyer. |
| 17.0–20.0 | The card | Logo, tagline, CTA, URL | — | 17.6–18.1 "Make it happen." 18.6–19.4 "tripnerd.com" | Tell them what to do. |

**The pattern underneath:** 4 · 2 · 2 · 2 · 3 · 4 · 3. One long establishing beat, three fast identical proofs (each caption is the noun the voice says at that moment), one held moment with no caption, one human beat with the promise line, one card. The three-proof list is what makes it feel like a real advert: it is a rhythm, and the viewer learns the rhythm on proof one and rides it.

**Why it works (RECOMMENDATION-grade reading, not measured):** the buyer is a host, not a fan. Every beat answers "what will my guests get", and the only sport beat is the roar, which is the one thing a host cannot buy anywhere else. The sound-off viewer gets the same story from the captions alone.

**Sources, honestly:** which shots are real footage and which are generated could not be established from the file. The host beat carries a branded polo and reads as real; the food and drink macros read as stock or generated. Treat the routine as source-agnostic: the table below says where each beat should come from for TripNerd.

## Inputs (fill before running)

| Input | TripNerd default | Rule |
|---|---|---|
| Landmark shot | The 17th at TPC Sawgrass, golden hour, drone or generated from the model's own memory of the hole (see learning 2026-09-23 famous-landmark) | No tournament marks in the frame. |
| Proof 1 food | Real plating from a TripNerd event if it exists, else macro generation (Gemini 1.1 or Seedance 2.5, reference-driven) | Macro physics is a strength; no hands with faces. |
| Proof 2 drink | Same | Same. |
| Proof 3 people | Real guests from the client library, backs and profiles, or a real photo animated with `start_image` | Faces need consent before they run as an ad. Never generated faces at readable distance. |
| The moment | Real crowd footage (the roar) if any exists; else the generated green and grandstand at distance, people as dots | The roar sound must be real or a real-sounding single source (LB26). |
| The host | Real footage of the client's host, to camera, one line | Never generated. If no host footage exists, replace the beat with a real guest-reaction clip and let the voice carry the line. |
| Voice | Cloned voice of the client host with consent, or a preset voice | One voice for the whole film. |
| Copy | See table below | Two words per caption, one noun each. No superlatives. |
| Logo | Official colour lockup `46ae277a…png` (Higgsfield) / `tripnerd_color_3x.png` (owner's machine) | Real file only, composited. |
| Brand blue | #5896E9 (site) · logo navy #202838 · logo blue #18A0F0 | End card on brand blue or navy, never green. |

## Copy table (edit here, nowhere else)

| Slot | Reference | Notes |
|---|---|---|
| Title | THE PLAYERS / VIP ON 17 | "THE PLAYERS" is a registered tournament mark. Flag to the client before paid media; the safe form is "17th hole · TPC Sawgrass" or "VIP on 17". |
| Voice line 1 | Imagine your clients right here, the food, the drinks, the connections, and that roar. | Keep the list of three. |
| Captions | THE FOOD. / THE DRINKS. / THE CONNECTIONS. | Nouns only, in voice order. |
| Voice line 2 | Now this is how you host. | The promise. |
| Caption 4 | HOSPITALITY. HANDLED. | Doubles as the brand tagline on the card. |
| Voice line 3 | Make it happen. tripnerd.com | CTA, spoken. |
| Card | logo · Hospitality. Handled. · REQUEST VIP PACKAGE DETAILS · tripnerd.com | Tagline below the logo. |

## Build steps (the routine)

1. **Intake.** Pull the client library (Drive folder or the owner's categorised folders). List every clip that could fill a beat in the table above. Real beats first; generation only for gaps.
2. **Spine check.** Confirm the seven beats and the 4·2·2·2·3·4·3 timing on paper. Write the copy table. Stop and get the owner's yes on copy before any spend.
3. **Landmark still and take.** Text-only 4K still of the landmark first, references only if the model does not know the place; animate with Kling 3.0 4K, slow move. (Learnings 2026-09-23.)
4. **Proof macros.** Three-model 720p test if generated (Seedance / Gemini / Wan), then 1080p on the winner. Describe sizes by comparison, never with units (learning 2026-09-23 macro beat).
5. **People beats.** Real footage or real photo with `start_image`. Backs, profiles, dots. Consent list written before the cut.
6. **Voice.** Record or generate the three lines. Word-level transcript with faster-whisper; place captions on the measured word times, not on guesses.
7. **Assemble.** `clients/tripnerd/deliverables/17th-hole-v3-build/build_v7.py` with the shots JSON template beside this file (`hosting-spot-20s.shots.json`): video and still shots, captions, placed audio tracks, end card from the real logo file. Uniform timebase, one bed, loudnorm −14 LUFS / −1 dBTP.
8. **End card.** `gen_card.py` (in the same build folder) with the brand blue, the logo file, tagline below the logo, CTA pill, URL. Crossfade 0.4 s from the last shot.
9. **QC.** Contact sheet at 2 fps for the whole film and 4 fps for the last five seconds; ffprobe (1920x1080 or 1080x1920, yuv420p, tv range, bt709); loudness; transcript check of every caption against its voice word; brand-fidelity pass on the logo; claims pass on every word on screen; consent list; tournament marks. **Wardrobe wordmark check:** zoom every garment, cap, bag or glass that carries the brand and read the spelling letter by letter; generated embroidery misspells (the reference shot read "TripNers"). Fix by tracked composite of the real logo file (`17th-hole-v3-build/polofix.py`), never by regenerating the shot.
10. **Deliver.** Upload, owner watch with sound (nobody here can hear it), one round of notes, lock.

## Variants this routine supports without changing the spine

- 9:16 vertical: same beats, captions move to the lower third centre, logo watermark top-left.
- 15 s: drop the moment beat to 2 s and the host beat to 3 s (4·2·2·2·2·3 = 15).
- Another venue: swap the landmark, the title and the roar; the three proofs and the host line stay.

## Related

- `clients/tripnerd/deliverables/2026-09-24-hosting-spot-endcard-fix.md` (the end card replacement on the reference file)
- `knowledge/learnings/2026-09-23-famous-landmark-model-memory-beats-references.md`
- `knowledge/learnings/2026-09-23-reference-driven-macro-beat-model-test.md`
- `playbooks/ads/video-production.md` (blocking tier) and the canonical blocking-check registry

## Swapping the opening shot (added 2026-09-25)
Replace the picture only; the audio bed stays. Re-set the opening overlays on the new shot from the measured positions (`17th-hole-v3-build/title_overlay.py`), fade-in included, and concat with the body (`17th-hole-v3-build/opening_swap.sh`). Before trusting the cut point, diff the frames either side of it: phone editors let text layers overrun a cut by a frame (the owner's export did), so start the body on the first clean frame and lengthen the opening by the same count. Record: `clients/tripnerd/deliverables/2026-09-25-hosting-spot-drone-opening.md`.
