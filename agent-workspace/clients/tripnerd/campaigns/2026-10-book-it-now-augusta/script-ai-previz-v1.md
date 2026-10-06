---
title: "TripNerd — 'Book It Now' all-AI pre-viz, frame by frame (Higgsfield)"
type: brief
client: tripnerd
owner: Karl
status: draft
created: 2026-10-06
updated: 2026-10-06
tags: [previz, animatic, higgsfield, seedance, augusta, frame-by-frame]
---

# "Book It Now": all-AI pre-viz (Higgsfield)

> ⚠️ **INTERNAL PRE-VIZ, NOT FOR POSTING.** This version locks the story, timing and framing cheaply. Every AI frame is a **slot**: the slot map (§4) says what real footage, or what approval, replaces it before anything posts.
>
> **Why it can't post as-is:**
> - TripNerd's agreed rule is "AI never creates a person, a voice or a testimonial".
> - AI shots of an Augusta trip would read as a record of the package that never happened.

**Format:**
- Instagram Reel, 9:16, 1080×1920, about 24 s.
- No spoken lines; all text is added in the editor.

## 1. Continuity bible (use on every frame)

| Item | Lock |
|---|---|
| **Mike** (the lead) | Man about 40, short brown hair, light stubble, medium build. **Identity reference: `@image1` = your couch still (Higgsfield media `389ec001`).** Attach it to every frame Mike is in |
| Mike, couch wardrobe | Charcoal crew-neck tee, heather-grey joggers, black socks |
| Mike, Augusta wardrobe | Navy golf polo (plain, no logo), khaki chinos, **plain navy lanyard with a blank white card** (no text, no artwork) |
| The phone | Black smartphone, thin bezel. **The screen is always plain white** (the DM is added in the editor) |
| Buddies (3) | **B1:** tall, light-blue polo, sunglasses pushed up. **B2:** stocky, white polo, khaki cap with no logo. **B3:** lean, pale-green polo. All in plain fabrics, no logos, each with the same plain navy lanyard and blank card |
| Couch world | Warm 3200K lamps, night; beige sofa, navy cushions, wood coffee table, dark tumbler, remote; the TV is **out of frame or a soft unreadable glow** |
| Augusta world | Southern spring golden hour (5600K → 3500K); tall loblolly pines; white columns; a covered veranda; a generic manicured fairway; azalea-free borders |
| **Never in any frame** | Lettering of any kind, logos, badge artwork, tournament flags, leaderboards, a stone bridge over water, grandstands with branding, a recognisable real course |

## 2. Frame by frame

| # | Time (s) | Beat | How it's made | On-screen text (editor) |
|---|---|---|---|---|
| 1 | 0.0–2.4 | Mike slumped on the couch, scrolling | **HF-1** image-to-video from your couch still | "Augusta week. Still on the couch?" |
| 2 | 2.4–4.0 | His phone POV: he types | **HF-2** phone close-up, blank white screen | (DM UI added: "AUGUSTA" typed and sent) |
| 3 | 4.0–7.6 | TripNerd's auto-reply lands | **No generation:** the code-built DM screen (already made) | (the reply and the "Get the Augusta details" button) |
| 4 | 7.6–8.8 | Thumb hovers, then presses | **HF-3** thumb press on a blank screen | (button-press flash) |
| 5 | 8.8–10.4 | **Match cut on the tap:** same hand, same phone, now on a sunlit veranda; lanyard swings into frame | **HF-4** | — |
| 6 | 10.4–12.0 | Look left: B1 and B2 mid-laugh, drinks in hand | **HF-5** | — |
| 7 | 12.0–13.6 | Look right: B3 hands Mike a drink | **HF-6** | — |
| 8 | 13.6–15.6 | Look out: veranda view over pines and a fairway | **HF-7** (no people) | "Daily hospitality" |
| 9 | 15.6–17.4 | A brick colonial home at dusk, windows glowing | **HF-8** (no people) | "Private executive home" |
| 10 | 17.4–19.0 | A hosted spread under a white tent | **HF-9** (no people) | "Food & drink included" |
| 11 | 19.0–21.0 | Mike exhales and half-smiles toward the view | **HF-10** (no lip movement) | "Way better than the couch." |
| 12 | 21.0–24.0 | End card | Editor (already made) | Inclusions · "DM 'AUGUSTA' to @tripnerd" · independence line |

## 3. The Higgsfield frames

**Settings for every frame:**
- **9:16**, **native 1080p**, **audio off**.
- **Model:** Seedance 2.5 (start with its cheap 480p *preview* and finish the same take at 1080p) or Cinema Studio Video 3.0 at 1080p.
- **Avoid:** Grok Imagine Lite (its 1080p is upscaled) and MiniMax H3 Max (768p maximum).
- **Length:** generate the minimum (4–5 s) and trim in the edit.
- **Workflow:** image prompt → pick the best still → video prompt with that still as the start frame. Attach `@image1` wherever Mike appears.

### HF-1: Couch (frame 1)
**Start frame:** your existing couch still (`389ec001`), cropped to 9:16 around Mike.
**Video prompt:**
```
SCENE CONTEXT
Night, a lived-in living room. Mike lies back on a beige sofa scrolling his phone, bored.

ACTIVE REFERENCES
@image1: man about 40, short brown hair, light stubble, charcoal tee, grey joggers, black socks, phone in right hand. 100% matches the reference.

FIRST FRAME / BLOCKING
Mike centre-left, reclined, legs stretched to frame right, phone at chest height, eyes on the screen.

FORMAT MODE
One continuous shot, the camera does not cut on its own.

OPTICS
Medium-wide, 47° field of view, gentle depth of field.

CAMERA
Slow push-in toward Mike at 0.5 km/h, chest height, steady.

ACTION
His thumb flicks up the screen twice, slowly. He exhales through his nose, shoulders sink a little deeper into the cushions. Eyes stay on the phone.

LIGHTING
Warm 3200K lamp light from frame left, soft cool flicker on his face from a screen off frame right.

STYLE
Photoreal, natural skin texture, soft film grain.

POSITIVE LOCKS
Same face and clothes throughout. Phone stays in his right hand. Room stays still.
```

### HF-2: Phone POV, blank screen (frame 2)
**Image prompt:**
```
SCENE CONTEXT
Close-up over Mike's shoulder of his hands holding a black smartphone in a warm living room at night.

ACTIVE REFERENCES
@image1: same man's hands and charcoal tee sleeve, grey joggers below. 100% matches the reference.

FIRST FRAME / BLOCKING
Vertical 9:16. Phone held in both hands at lap height, screen facing camera, filling the central third. Screen evenly lit plain white, edge to edge.

OPTICS
Close-up, 29° field of view, shallow depth of field, focus on the screen edge and thumbs.

LIGHTING
Warm 3200K lamp light, screen glow lighting the thumbs.

STYLE
Photoreal, natural skin, soft grain.

POSITIVE LOCKS
Screen is a flat, blank, uniform white panel. Thumbs rest at the lower third of the screen.
```
**Video prompt:**
```
One continuous shot. The camera holds steady with a slight handheld breath. Both thumbs tap the lower part of the plain white screen in a quick typing rhythm for two seconds, then the right thumb taps once more and lifts. Screen stays plain white. Photoreal.
```

### HF-3: The tap (frame 4)
**Image prompt:** the same as HF-2, with the right thumb hovering 1 cm above the lower-middle of the screen.
**Video prompt:**
```
One continuous shot. Slow push-in toward the phone at 0.5 km/h. The right thumb hovers over the lower-middle of the plain white screen, pauses half a second, then presses down firmly once and holds. Screen stays plain white. Photoreal, natural skin.
```
**Editor:** composite the DM and button onto the white screen, then the press flash.

### HF-4: Match cut, arrival (frame 5)
**Image prompt:**
```
SCENE CONTEXT
Late afternoon on a covered veranda of a Southern hospitality house. Mike's hand still holds the same black phone, now at his side.

ACTIVE REFERENCES
@image1: same man, now in a plain navy golf polo, khaki chinos, plain navy lanyard with a blank white card. 100% matches the reference.

FIRST FRAME / BLOCKING
Vertical 9:16. Same framing as the phone close-up: his hand and phone in the lower third, the lanyard card swinging into frame from the top. Behind: white columns, tall pines, soft golden light.

OPTICS
Close-up, 29° field of view, shallow depth of field.

LIGHTING
Golden-hour sun at 4000K from frame left, warm rim light on the hand.

STYLE
Photoreal, natural skin, soft grain.

POSITIVE LOCKS
Blank white lanyard card. Plain polo fabric. Same phone as the couch shots.
```
**Video prompt:**
```
One continuous shot. The camera tilts up from his hand to his chest at 1 km/h as he lowers the phone. The lanyard card settles against his polo. Background pines sway gently. Photoreal.
```

### HF-5: Look left, buddies laughing (frame 6)
**Image prompt:**
```
SCENE CONTEXT
On the covered veranda at golden hour, two friends of Mike laugh mid-conversation, drinks in hand.

LOCATION MAP
Foreground: veranda railing, edge of frame. Midground: B1 (tall, light-blue polo, sunglasses pushed up) and B2 (stocky, white polo, plain khaki cap), each holding a clear glass. Background: white columns, tall pines, warm sky.

FIRST FRAME / BLOCKING
Vertical 9:16, as Mike's eye-line turning left: both men facing each other three-quarter to camera, mid-laugh.

OPTICS
Medium shot, 47° field of view.

PERFORMANCE
Genuine laugh: eyes crinkle, B2 tips his head back, B1's shoulders shake; neither looks at the camera.

LIGHTING
Golden hour at 4000K from frame right, warm rim light.

STYLE
Photoreal, natural skin texture, soft grain.

POSITIVE LOCKS
Plain clothing, plain glasses, plain navy lanyards with blank cards.
```
**Video prompt:**
```
One continuous shot. The camera pans left at 2 km/h, as Mike turning his head, settling on the two laughing friends. B2 tips his head back laughing; B1 raises his glass slightly. Photoreal.
```

### HF-6: Look right, the drink (frame 7)
**Image prompt:**
```
SCENE CONTEXT
On the veranda, B3 (lean, pale-green polo) turns and offers Mike a clear glass with ice.

FIRST FRAME / BLOCKING
Vertical 9:16, Mike's point of view: B3 at frame right, arm extended toward camera holding the glass, smiling. Columns and pines behind.

OPTICS
Medium close-up, 29° field of view.

LIGHTING
Golden hour at 4000K from frame left.

STYLE
Photoreal, natural skin, soft grain.

POSITIVE LOCKS
Plain glass, plain clothing, blank lanyard card.
```
**Video prompt:**
```
One continuous shot. B3 steps half a pace forward and holds the glass out toward the camera; Mike's hand enters from frame bottom-left and takes it. Ice shifts in the glass. Photoreal.
```

### HF-7: The view (frame 8, no people)
**Image prompt:**
```
SCENE CONTEXT
The view from a covered veranda at golden hour over a quiet, generic golf fairway lined with tall pines.

LOCATION MAP
Foreground: white column at frame left, veranda railing. Midground: manicured lawn and fairway. Background: tall loblolly pines, warm sky.

OPTICS
Wide, 63° field of view.

LIGHTING
Low sun at 3500K behind the pines, long shadows across the grass.

STYLE
Photoreal, soft grain.

POSITIVE LOCKS
Empty of people. Plain grass, trees and sky.
```
**Video prompt:**
```
One continuous shot. Slow push past the column toward the railing at 1 km/h. Pine tops sway gently; long shadows hold still. Photoreal.
```

### HF-8: The private home (frame 9, no people)
**Image prompt:**
```
SCENE CONTEXT
Dusk outside a two-storey red-brick colonial home among tall pines, every window glowing warm.

LOCATION MAP
Foreground: lawn and flowering shrubs. Midground: brick facade, black shutters, white-trimmed windows, lit front door. Background: pines against a deep blue sky.

OPTICS
Wide, 47° field of view.

LIGHTING
Blue dusk sky at 8500K, warm 3200K window light.

STYLE
Photoreal, architectural, soft grain.

POSITIVE LOCKS
Empty of people. Plain door and walls, no house number or signage.
```
**Video prompt:**
```
One continuous shot. Slow forward glide toward the front door at 1 km/h. A light breeze moves the shrubs; window light stays steady. Photoreal.
```

### HF-9: The spread (frame 10, no people)
**Image prompt:**
```
SCENE CONTEXT
A hosted buffet under a white event tent at golden hour: silver chafing dishes, fresh salad, pastries, a bowl of fruit, sunflowers in vases.

FIRST FRAME / BLOCKING
Vertical 9:16, low angle along the table, dishes receding toward the tent opening and pines.

OPTICS
Medium, 47° field of view, shallow depth of field on the nearest dish.

LIGHTING
Warm 4000K light through the tent walls.

STYLE
Photoreal food styling, soft grain.

POSITIVE LOCKS
Plain unmarked serving ware. No bottles with labels.
```
**Video prompt:**
```
One continuous shot. Slow slide along the table at 1 km/h. Steam rises gently from the chafing dishes. Photoreal.
```

### HF-10: Mike's exhale (frame 11)
**Image prompt:**
```
SCENE CONTEXT
On the veranda at golden hour, Mike leans on the railing with a drink, looking out over the pines.

ACTIVE REFERENCES
@image1: same man in the plain navy polo with the blank lanyard card. 100% matches the reference.

FIRST FRAME / BLOCKING
Vertical 9:16, three-quarter profile from frame right, Mike looking out to frame left.

OPTICS
Medium close-up, 29° field of view.

PERFORMANCE
A slow exhale, shoulders drop, a small half-smile forms; lips stay closed.

LIGHTING
Low golden sun at 3500K on his face from frame left.

STYLE
Photoreal, natural skin texture, soft grain.

POSITIVE LOCKS
Same face as the couch shots. Mouth closed.
```
**Video prompt:**
```
One continuous shot. The camera holds steady. Mike breathes out slowly, shoulders lower, a closed-mouth half-smile appears; he takes a small sip. Photoreal.
```

### Reject a take if…
- Any **text, logo, number, badge art or flag** appears, including on lanyards, caps, glasses or the phone.
- Mike's face drifts from `@image1`, or any lips move as if speaking.
- Hands or fingers deform, the glass changes shape, or the phone screen shows anything but plain white.
- The course looks like a **real, recognisable** one (water hazard with a stone bridge, grandstands, a scoreboard).
- The result is below native 1080p, or upscaled.

## 4. Slot map: what replaces each AI frame before posting

| Frame | AI now | Before posting | Gate |
|---|---|---|---|
| 1, 2, 4, 11 | Mike (AI actor) | Keep **only** with Jason's written OK for an AI actor in a clearly staged skit; otherwise re-shoot with a real person on a phone | TripNerd's AI rule |
| 3, 12 | Code-built DM / end card | Keep | The "AUGUSTA" auto-reply live with the exact text, plus a named DM owner |
| 5 | AI arrival on a veranda | **Real:** the TripNerd check-in table or banner from Augusta week | Venue OK, consent |
| 6, 7 | AI buddies and drink | **Real** guests and bar (IMG_1932 or new photos) | Guest and staff consent |
| 8 | AI veranda view | **Real** veranda or course view (new photo without people) | Venue OK |
| 9 | AI brick home | **Real** photos of TripNerd's executive home | TripNerd to send |
| 10 | AI buffet | **Real** IMG_1998 or IMG_2034 | Venue OK |

**Rule for the final cut:** an AI person never sits next to real footage in a way that suggests they were there. Mike stays in the couch skit; the trip itself is shown with real material.

## 5. Build order (cheapest first)
1. **HF-1, HF-2, HF-3** (the couch skit). These may survive into the final if Jason agrees.
2. **HF-7, HF-8, HF-9** (no people): quick, low risk.
3. **HF-4, HF-5, HF-6, HF-10** (people at Augusta): the riskiest generations, and replaced by real footage anyway. Make them last, and only as good as the pre-viz needs.

**Upload the takes here once they're done.** Higgsfield's file servers are blocked from this workspace, so I can't download them myself. I'll cut the pre-viz animatic with the DM screens and end card, then swap in real footage slot by slot.
