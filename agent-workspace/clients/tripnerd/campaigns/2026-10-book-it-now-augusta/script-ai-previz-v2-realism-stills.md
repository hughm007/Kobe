---
title: "TripNerd — 'Book It Now' AI pre-viz stills, realism pass (v2)"
type: report
client: tripnerd
owner: Karl
status: draft
created: 2026-10-06
updated: 2026-10-06
tags: [higgsfield, previz, ai-stills, augusta, realism]
---

# "Book It Now": AI pre-viz stills, realism pass (v2)

> **INTERNAL PRE-VIZ, NOT FOR POSTING.**
> - These are AI start-frames for the animatic in [`script-ai-previz-v1.md`](script-ai-previz-v1.md). Every AI frame still maps to the real replacement and gate in that file's slot map.
> - TripNerd's rule ("AI never creates a person, a voice or a testimonial") still binds anything posted.

## What was asked, and what was run
**Karl, 2026-10-06:** "generate all the frames into Higgsfield… let me see them". He added: "Do not worry about capping the credits… highest quality possible… we're focusing on realism and quality."

**What ran:**
- **Main set:** all 9 generated frames (2, 4, 5, 6, 7, 8, 9, 10, 11) at the top setting priced by the runtime: `gpt_image_2_5` flare, quality **max**, **4k** (2160×3840), two takes each.
- **Alternate full set:** the same 9 frames on `nano_banana_pro` at 4k, one take each.
- **Realism shootout:** the two hardest people frames, 6 (two buddies laughing) and 11 (Mike's exhale), also on `gpt_image_2_5` sunburst max 4k, `seedream_v4_5` high, `soul_2` 2k and `kling_omni_image` 2k.
- **The shootout ran alongside the main set, not before it.** That avoided a round-trip while Karl waited. If he prefers a shootout model, the 9 frames are re-run on it.
- **The prompts were rewritten for realism** compared with v1:
  - full-frame camera, lens and f-stop;
  - real skin and fabric imperfections;
  - candid timing;
  - "no retouching / no CGI look".
- **Every v1 content lock is kept:** plain fabrics, blank lanyard cards, a plain white phone screen, no recognisable course, "nothing written, printed or embroidered anywhere".
- **Mike's frames (2, 4, 5, 11)** carry Karl's couch still `389ec001` as the identity reference. The server records confirm it reached every one of those jobs.
- **Frames 1, 3 and 12 aren't generated:** Karl's couch still, and the code-built DM screen and end card.

**Index key:** index = frame × 10 + slot.

| Slot | Model and settings |
|---|---|
| 1, 2 | `gpt_image_2_5` flare, max, 4k |
| 3 | `nano_banana_pro`, 4k |
| 4 | `gpt_image_2_5` sunburst, max, 4k |
| 5 | `seedream_v4_5`, high |
| 6 | `soul_2`, 2k |
| 7 | `kling_omni_image`, 2k |

## Spend (FACT, from `balance`)
- **Before:** 11,102.90 credits. **After:** 10,763.66. **Spent: 339.24 credits.**
- **That equals the sum of the runtime `get_cost` prices for the 35 delivered images.**
  - The 3 jobs that failed and were re-run (indices 82, 91, 112) show no charge in the balance. That is an inference from this arithmetic.
- **Batch 1 (earlier the same day, superseded):**
  - 9 frames on `gpt_image_2_5` flare, quality high, 2k, at 2.75 credits each = 24.75 credits (`get_cost` price).
  - It was submitted before the balance reading above.
  - Job IDs: frame 2 `ed5de660`, 4 `6a0c174f`, 5 `87a7ce81`, 6 `1a6923b0`, 7 `aa92d429`, 8 `1147decc`, 9 `982118c4`, 10 `702be7c7`, 11 `f2de2e26`.
  - Its exact prompt text was not recoverable in this session's records. It was based on the v1 script blocks.

## Delivered jobs (server records)
| Index | Frame | Model and settings | Output (px) | `@image1` | Credits | Job ID |
|---|---|---|---|---|---|---|
| 21 | 2 | gpt_image_2_5 flare · max · 4k (take 1) | 2160×3840 | 389ec001 | 15 | `16207890-fd43-4d38-b5e6-0e883748b8ac` |
| 22 | 2 | gpt_image_2_5 flare · max · 4k (take 2) | 2160×3840 | 389ec001 | 15 | `c5435047-1625-4469-b14c-0bbe08fd4786` |
| 23 | 2 | nano_banana_pro · 4k (served as nano_banana_2) | 3072×5504 | 389ec001 | 4 | `a8f10c72-90de-4b65-9957-ab9f07f3960d` |
| 41 | 4 | gpt_image_2_5 flare · max · 4k (take 1) | 2160×3840 | 389ec001 | 15 | `767ed821-5263-4185-8576-4144c943d2ee` |
| 42 | 4 | gpt_image_2_5 flare · max · 4k (take 2) | 2160×3840 | 389ec001 | 15 | `837aa913-3cf3-4a7b-b1c0-c25233e14a70` |
| 43 | 4 | nano_banana_pro · 4k (served as nano_banana_2) | 3072×5504 | 389ec001 | 4 | `0c3dc892-3d48-41d7-b0ba-8baaeb420b9f` |
| 51 | 5 | gpt_image_2_5 flare · max · 4k (take 1) | 2160×3840 | 389ec001 | 15 | `7545e502-5135-47ae-840d-2be4ce226487` |
| 52 | 5 | gpt_image_2_5 flare · max · 4k (take 2) | 2160×3840 | 389ec001 | 15 | `2f7bf9cb-58a5-4f8b-9aac-39da5c4ab8a2` |
| 53 | 5 | nano_banana_pro · 4k (served as nano_banana_2) | 3072×5504 | 389ec001 | 4 | `216fc294-4609-4a90-90cd-16acb2ce3e5d` |
| 61 | 6 | gpt_image_2_5 flare · max · 4k (take 1) | 2160×3840 | — | 15 | `9410d8d8-24f8-488e-9d38-f6831de6e7a2` |
| 62 | 6 | gpt_image_2_5 flare · max · 4k (take 2) | 2160×3840 | — | 15 | `c63a2f37-ad6a-4543-8d9b-f8b9c6365759` |
| 63 | 6 | nano_banana_pro · 4k (served as nano_banana_2) | 3072×5504 | — | 4 | `5605326f-9479-4105-bd5b-7b088830de59` |
| 64 | 6 | gpt_image_2_5 sunburst · max · 4k | 2160×3840 | — | 15 | `8151a3a9-3533-4a7f-8366-84f5354b789b` |
| 65 | 6 | seedream_v4_5 · high | 2880×5120 | — | 1 | `da12c64f-01db-42ee-8789-8235fa4d63d9` |
| 66 | 6 | soul_2 · 2k | 1152×2048 | — | 0.12 | `514e19f2-1c34-45c7-9922-a9283563542c` |
| 67 | 6 | kling_omni_image · 2k | 1536×2720 | — | 0.5 | `47ec8ccb-fef4-48b7-8add-b8e17a7e1aea` |
| 71 | 7 | gpt_image_2_5 flare · max · 4k (take 1) | 2160×3840 | — | 15 | `dcc0c25b-55c1-4257-9b8e-6ae197bffe15` |
| 72 | 7 | gpt_image_2_5 flare · max · 4k (take 2) | 2160×3840 | — | 15 | `7233c107-6b03-41bc-9b20-d29f03beb67b` |
| 73 | 7 | nano_banana_pro · 4k (served as nano_banana_2) | 3072×5504 | — | 4 | `d663c040-6376-477d-8e52-f2caaa8768f2` |
| 81 | 8 | gpt_image_2_5 flare · max · 4k (take 1) | 2160×3840 | — | 15 | `a61ea764-3ac8-4c5e-865d-7d6f1fde6e10` |
| 82 | 8 | gpt_image_2_5 flare · max · 4k (take 2) | 2160×3840 | — | 15 | `cc481e3e-b18b-4266-8ae5-cd47435b2227` |
| 83 | 8 | nano_banana_pro · 4k (served as nano_banana_2) | 3072×5504 | — | 4 | `703cb76f-3523-4395-9015-782ae4b32a0d` |
| 91 | 9 | gpt_image_2_5 flare · max · 4k (take 1) | 2160×3840 | — | 15 | `be06b87d-f70a-4101-85db-b33896cb8e60` |
| 92 | 9 | gpt_image_2_5 flare · max · 4k (take 2) | 2160×3840 | — | 15 | `4b278d70-f52c-45cb-b668-3e3ae9bbd2df` |
| 93 | 9 | nano_banana_pro · 4k (served as nano_banana_2) | 3072×5504 | — | 4 | `c76e38da-025a-49a6-bc54-556e48d7c392` |
| 101 | 10 | gpt_image_2_5 flare · max · 4k (take 1) | 2160×3840 | — | 15 | `3bf66465-5949-4021-a4a4-c3c7207f7386` |
| 102 | 10 | gpt_image_2_5 flare · max · 4k (take 2) | 2160×3840 | — | 15 | `57577e29-b255-48a7-8c2c-3b6d3e05ec25` |
| 103 | 10 | nano_banana_pro · 4k (served as nano_banana_2) | 3072×5504 | — | 4 | `15218a94-ac65-4b8a-8dd9-282b5238f6bc` |
| 111 | 11 | gpt_image_2_5 flare · max · 4k (take 1) | 2160×3840 | 389ec001 | 15 | `59f9292f-c3bb-4239-946b-a84b5eff01f7` |
| 112 | 11 | gpt_image_2_5 flare · max · 4k (take 2) | 2160×3840 | 389ec001 | 15 | `83623baf-6552-4c42-892d-0ddc03370aed` |
| 113 | 11 | nano_banana_pro · 4k (served as nano_banana_2) | 3072×5504 | 389ec001 | 4 | `43b71271-cb1f-4a58-a139-07a3f397b82f` |
| 114 | 11 | gpt_image_2_5 sunburst · max · 4k | 2160×3840 | 389ec001 | 15 | `7a6c05bf-7eb6-4a12-8b97-d67f0216d52f` |
| 115 | 11 | seedream_v4_5 · high | 2880×5120 | 389ec001 | 1 | `9b93fb8f-c600-414f-b490-92db0a643a0c` |
| 116 | 11 | soul_2 · 2k | 1152×2048 | 389ec001 | 0.12 | `29755ca6-e454-4ebb-bf09-755fcc23069e` |
| 117 | 11 | kling_omni_image · 2k | 1536×2720 | 389ec001 | 0.5 | `e6d1e8a4-e353-440e-9438-747fece2bcd9` |

Total from get_cost prices: 339.24 credits across 35 images.

**Failed, then re-run once with identical settings:**

| Index | Failed job | Re-run (delivered above) |
|---|---|---|
| 82 | `459efc09` | `cc481e3e` |
| 91 | `a591a1d4` | `be06b87d` |
| 112 | `952cc13d` | `83623baf` |

The tool returned no failure reason.

## What the server records show (FACT; I could not look at the pictures)
- **The images can't be opened from this container.** Higgsfield's file host returns 403 here, so **no visual QC was done by me**. Karl judges realism in the gallery.
- **The `nano_banana_pro` jobs are recorded as model `nano_banana_2`,** at 3072×5504. The tool routed them that way. Treat slot 3 as "Nano Banana (as served)".
- **`soul_2` replaced the frame-11 prompt (index 116).**
  - With Karl's still attached (role `image`), it switched on prompt enhancement and swapped the prompt for its own description of the couch still: man on a sofa, TV showing a football game.
  - **Index 116 is off-brief. Reject it.**
  - `soul_2` with an image is unsuitable for identity-locked frames here.
  - Its frame-6 job (66, no image) kept the prompt as written.
- **`soul_2` "2k" delivered 1152×2048** (recorded as quality "1080p").
- **Sizes:**
  - `kling_omni_image` 2k: 1536×2720;
  - `seedream_v4_5` high: 2880×5120;
  - `gpt_image_2_5` 4k: 2160×3840.
  - All are at or above the 1080×1920 delivery frame.

## How to pick (Karl)
For each frame, keep one take that passes the reject list in [`script-ai-previz-v1.md`](script-ai-previz-v1.md#reject-a-take-if). Reject a take that shows any of:
- any text, logo, number, badge art or flag (including on lanyards, caps, glasses and the phone);
- Mike's face drifting from the couch still;
- deformed hands or fingers, or a glass changing shape;
- a phone screen that isn't plain white;
- any course feature that could be a real, recognisable course.

**Next:** tell me the index you keep per frame, and whether one model clearly reads as most real.
- I'll re-run any frame with no keeper on that model.
- Then we move to image-to-video on the picks: Seedance 2.5 or Cinema Studio 3.0 at native 1080p, priced from the runtime before anything is fired.

## Exact prompts sent (take 1; every model and take used the same text per frame)
### Frame 2 (HF-2)
```
Candid over-the-shoulder photograph taken at night in a lived-in living room. The man is the man in the reference image: same hands, same charcoal crew-neck tee, heather-grey joggers, same beige sofa and lamp-lit room. He holds a black thin-bezel smartphone in both hands at lap height, screen facing the camera and filling the central third of the frame, both thumbs resting on the lower third of the screen mid-typing. The phone screen is a blank, evenly lit, plain white panel from edge to edge with nothing displayed on it. Shot on a full-frame camera with a 50mm lens at f/2: focus on the thumbs and the phone's edge, his joggers and the sofa cushions falling into soft blur. Warm 3200K table-lamp light from the side; the white screen throws a cool glow onto his thumbs. Real hands: knuckle creases, fine hairs, faint veins, short unmanicured nails, natural skin tone variation. The tee sleeve is slightly creased; the joggers show fabric texture and light pilling. Fine natural grain, true-to-life colour, no retouching, no smooth CGI look. Vertical 9:16. Nothing written or printed anywhere in the frame.
```

### Frame 4 (HF-3)
```
Candid close-up photograph taken at night in a lived-in living room. The man is the man in the reference image: same hands, same charcoal crew-neck tee sleeve, heather-grey joggers below. He holds a black thin-bezel smartphone in his left hand at chest height, screen facing the camera; his right thumb hovers about a centimetre above the lower-middle of the screen, a split second before pressing. The phone screen is a blank, evenly lit, plain white panel from edge to edge with nothing displayed on it. Shot on a full-frame camera with a 50mm lens at f/1.8, tight framing on the phone and thumb, the room behind falling into warm blur. Warm 3200K lamp light from the side, the white screen lighting the underside of the thumb. Real hands: knuckle creases, a small hangnail, fine hairs, faint veins, unmanicured nails. Fine natural grain, true-to-life colour, no retouching, no smooth CGI look. Vertical 9:16. Nothing written or printed anywhere in the frame.
```

### Frame 5 (HF-4)
```
Candid late-afternoon photograph on the covered veranda of a Southern hospitality house in spring. The man is the man in the reference image (same face, hair, skin tone and build), now dressed in a plain navy short-sleeve golf polo and khaki chinos. Framed like a phone close-up: his right hand holds the same black smartphone low at his side in the lower third of the frame, screen turned toward his leg; at the top of the frame a plain navy lanyard with a blank white card swings against his polo. Behind him, out of focus: white painted columns, tall loblolly pines, warm golden light. Full-frame camera, 50mm lens at f/1.8, shallow depth of field. Golden-hour sun at about 4000K from frame left with warm rim light on his hand and knuckles. Real skin texture, fine arm hair, natural creases and stitching on the polo, a slight twist in the lanyard cord. Caught mid-moment, unposed. Fine natural grain, true-to-life colour, no retouching, no CGI look. The lanyard card is completely blank white. Vertical 9:16. Nothing written, printed or embroidered anywhere.
```

### Frame 6 (HF-5)
```
Candid documentary photograph on a covered veranda at golden hour in spring. Two male friends in their early forties caught mid-laugh, facing each other in three-quarter view, neither looking at the camera. On the left, a tall man in a plain light-blue polo with sunglasses pushed up on his head, shoulders shaking with laughter, holding a clear glass of iced drink. On the right, a stocky man in a plain white polo and a plain khaki cap, head tipped back laughing, eyes crinkled shut, holding a clear glass. Each wears a plain navy lanyard with a blank white card. Foreground: the softly blurred edge of a white wooden veranda railing. Behind: white columns, tall pines and a warm evening sky. Full-frame camera, 35mm lens at f/2.8, medium shot, natural depth of field. Golden sun at about 4000K from frame right, warm rim light on hair and ears. Real faces: visible skin pores, laugh lines, uneven stubble, flushed cheeks, a touch of sunburn on the nose, natural facial asymmetry, real slightly imperfect teeth. Fabric creases, condensation on the glasses. True-to-life colour, fine natural grain, no beauty retouching, no airbrushed skin, no CGI look. Vertical 9:16. Plain fabrics, plain glasses, blank cards: nothing written, printed or embroidered anywhere.
```

### Frame 7 (HF-6)
```
Point-of-view candid photograph on a covered veranda at golden hour in spring. A lean man in his late thirties in a plain pale-green polo stands at frame right, smiling warmly as he holds a clear glass with ice out toward the camera at arm's length; the viewer's own hand, in a navy polo sleeve, reaches in from the lower left to take it. He wears a plain navy lanyard with a blank white card. Behind: white columns and tall pines, softly blurred. Full-frame camera, 50mm lens at f/2, medium close-up. Golden-hour light at about 4000K from frame left. Real skin: pores, crow's feet, light stubble, a slightly lopsided genuine smile; condensation droplets on the glass, clear ice with natural bubbles. A creased polo collar. Fine natural grain, true-to-life colour, no retouching, no CGI look. Vertical 9:16. Nothing written, printed or embroidered anywhere.
```

### Frame 8 (HF-7)
```
Travel photograph taken from a covered veranda at golden hour, looking out over a quiet, generic golf fairway lined with tall loblolly pines. Foreground: a white painted column at frame left with slightly worn paint, a white wooden railing. Midground: a manicured lawn sloping to a fairway with natural mowing stripes and a few uneven patches. Background: tall pines and a warm, hazy sky. Low sun at about 3500K behind the pines, long shadows across the grass, gentle atmospheric haze. Full-frame camera, 24mm lens at f/8, sharp throughout. Empty of people. Only grass, trees, railing and sky: no flags, signs, water, bridges or grandstands. Fine natural grain, true-to-life colour, no CGI render look. Vertical 9:16.
```

### Frame 9 (HF-8)
```
Architectural photograph at blue hour: a two-storey red-brick colonial home among tall pines, black shutters, white-trimmed windows, every window glowing warm, the front door lit by a simple lantern. Foreground: lawn, flowering shrubs and a brick path. Background: pine silhouettes against a deep blue sky. Full-frame camera on a tripod, 35mm lens at f/8, verticals straight. Sky about 8500K, window light about 3200K. Real materials: weathered brick with uneven mortar lines, a little moss near the foundation, pine needles scattered on the path. Empty of people. Plain door and walls with no house number and no signage. Fine natural grain, true-to-life colour, no CGI render look. Vertical 9:16.
```

### Frame 10 (HF-9)
```
Food photograph of a hosted buffet under a white event tent at golden hour: silver chafing dishes with lids partly open, a large bowl of fresh green salad, a tray of pastries, a bowl of fruit, sunflowers in plain glass vases, a white linen tablecloth. Low angle along the table, the dishes receding toward the open tent flap and tall pines outside. Full-frame camera, 35mm lens at f/2.8, focus on the nearest dish. Warm 4000K light glowing through the tent fabric. Real details: a few crumbs on the linen, slight wrinkles in the tablecloth, faint fingerprints on a serving spoon, uneven browning on the pastries. Plain unmarked serving ware; no bottles, labels, signs or menu cards. Empty of people. Fine natural grain, true-to-life colour. Vertical 9:16.
```

### Frame 11 (HF-10)
```
Candid close portrait on a covered veranda at golden hour in spring. The man is the man in the reference image (same face, hair, stubble, skin tone and build), now in a plain navy golf polo with a plain navy lanyard and a blank white card. He leans his forearms on a white wooden railing, a clear glass of iced drink in one hand, looking out to frame left over tall pines, seen in three-quarter profile from frame right. He has just exhaled: shoulders relaxed, a small closed-mouth half-smile. Full-frame camera, 85mm lens at f/2, medium close-up, the pines behind in soft blur. Low golden sun at about 3500K lighting his face from frame left. Real skin: visible pores, fine lines at the eyes, uneven stubble, a slight sun flush, a stray hair; polo fabric creased at the shoulder. Fine natural grain, true-to-life colour, no beauty retouching, no airbrushing, no CGI look. Vertical 9:16. Nothing written, printed or embroidered anywhere.
```
