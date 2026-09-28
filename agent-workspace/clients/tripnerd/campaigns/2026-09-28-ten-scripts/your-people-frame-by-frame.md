---
title: "TripNerd — YOUR PEOPLE (30 s) — frame-by-frame production brief for ChatGPT + Higgsfield"
type: storyboard
client: tripnerd
campaign_id: 2026-09-28-ten-scripts
status: STORYBOARD v3 — two Skeptic Pass 1 rounds applied; awaiting owner approval (approval = storyboard and spend sign-off)
created: 2026-09-28
updated: 2026-09-28
tags: [campaign, storyboard, shotlist, higgsfield, chatgpt]
---

# YOUR PEOPLE — 30 s, 16:9 — frame-by-frame brief

**From:** Service Pow Campaign Director. **For:** ChatGPT, generating one frame at a time in Higgsfield, with the
owner locking each frame before the next.

## 0. Read this first, ChatGPT

0. **Format.** The master is **16:9**, for YouTube, desktop and 16:9 in-feed placements, like the owner's last two
   approved spots. A vertical 9:16 version is a separate film with its own storyboard (F7's line-up does not fit
   a vertical crop). Do not crop this one.
1. **Work order is not film order.** Build the **master plate (F7 start still)** first. It fixes the cast, the
   clothes, the suite and the light. Every other still is made *from* it as a reference.
2. **Two steps per generated frame:** Step A makes the still, Step B animates it. The one end still (F8) is **made
   by editing the approved start still** with a masked inpaint, never generated fresh, so everything outside the
   mask stays pixel-identical. Show the owner every still before animating it.
3. **Settings.**
   - Stills: **Nano Banana 2**, 4K, 16:9, with the listed references attached.
   - Motion: **Kling 3.0**, mode **4k**, **5 s**, sound **off**, `start_image` = the approved still, and
     `end_image` = the approved end still where one is listed.
   - F7 only: **Seedance 2.5**, mode `omni_reference`, `start_image` + `end_image`, **1080p**, 5 s, audio off.
4. **One frame is not generated at all: F4 is a real phone clip.** Never animate a hand in close-up. In F7 the
   camera stays locked in the generation, and the camera move is done in the edit.
5. **No text, logo or mark is ever asked of the model.** Every prompt ends with a lock that keeps every surface
   free of lettering. Captions, the end card and the logo go on in the edit.
6. **Two takes per shot, then change the prompt.** A third identical re-roll is wasted. Use the frame's fallback.
7. **Lettering sweep, every time.** After every still, zoom to 200 % on the grandstand fascia, the big screen,
   the roof flags, the pin flag, caps, clothing, cups and the lanyard card. Any glyph or logo-like shape gets
   inpainted to blank before the still is animated. After every animation, scrub frame by frame over the same
   places, and reject the take if any glyph appears. The big screen stays soft, showing indistinct colour.
8. **Crowds stay out of the danger zone.** The near spectator bank directly below the suite stays **below the
   rail line and out of view** in every generated shot. The far bank and grandstand stay soft (shallow depth of
   field) in F1, F2, F3, F5 and F8. In F7 the far crowd is small.
9. **Structural sweep after every animation** (the "structural list" in the reject lines): balusters stay the same
   count and stay straight · hands stay on the rail without fusing into it or sliding · clear cups keep their shape
   and level · no crowd figure boils, melts or loops · ears, necks and collars hold their shape through head moves ·
   caps, sunglasses and collars face the right way when seen from behind · no face turns toward the lens.
10. **Reject any take that fails an item on its checklist.** A face turning to camera, a hand going wrong, or
   lettering appearing anywhere are the failures that make this look fake.
11. **Re-check prices in Higgsfield before starting.** Section 8 is an estimate from earlier jobs.
12. **Disclosure:** the finished film contains realistic generated people. Switch on the AI-content label on
   Meta, TikTok and YouTube.

## 1. The advert in one paragraph

A warm voice names the people a host would bring: the client they've chased for a year, the two who hit the
number, the brother-in-law who won't stop talking about this place, and their dad. Each is shown in a quiet
moment at the front of a TripNerd suite over the 17th, from behind or in rear profile, and one real hand. Then
the gallery goes silent, a putter clicks, and after the roll the roar hits. Nobody in the suite cheers. They ease
upright, one after another, and dad leans into his son. The camera eases back to show they were all standing
together the whole time. In the roar, the son looks at his dad instead of the green. **Hospitality. Handled.**

| Spine | |
|---|---|
| Core message | You bring the people. TripNerd handles everything else. |
| Primary emotion | Pride in the people you brought, felt quietly |
| Viewer starts | "Hospitality ads are all drinks and logos." |
| Viewer ends | "I know exactly who I'd bring." |
| Narrative question | Who are these people, and why are they here? |
| Payoff | Stillness inside the roar: they're together, and the son looks at his dad |
| CTA logic | The viewer has just cast their own list, so "Talk to a Nerd" is the next step |

## 2. Reference pack (real, cited, in Higgsfield already)

| Media ID | What it is | Use it for |
|---|---|---|
| `7c9be9e1-854e-41df-ac65-87e6b711d174` | Owner's real suite footage, 21.5 s, **caption cropped off** | The view; the white frame of the open front; a real guest from behind; a light suite chair back lower left |
| `4c463ea4-4ff9-4da6-a1ce-7cdbf90577f0` | Real suite footage, 22.0 s, clean | The white round-tube rail with balusters, the black drink ledge, the white column, the green |
| `4ec88dba-99c1-453b-99d1-6479e11a32fc` | Real suite footage, 22.5 s, clean | A real guest at the window, from behind |
| `fe30cf32-bd71-4f0b-812f-de7d72c3c07c` | Real suite footage, 23.0 s, clean | The tree island with the yellow ring, the light |
| `4824f6d7-6c23-49ec-a36d-6300cccf7981` | End card, 1920x1080, "Talk to a Nerd" | F9, used as is |
| `46ae277a-7897-4574-b995-38097233d77c` | Official TripNerd colour logo | Only for the edit, never for generation |

**Never attach** the earlier uncropped frames (`c2a0c138`, `9111e76a`, `e5329451`, `4b183815`) or the sheet
`802db49f`. They carry a burned-in "REAL SUITE FOOTAGE" caption that invites the generator to paint text.

Stream any of them at `https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/<media id>.jpg`
(the card and logo are `.png`).

**For reading only, never uploaded to a generator** (they show tournament badges and real guests' faces): Drive
IMG_2031 (guests with arms across shoulders), IMG_2036 (a group from behind), IMG_1928 (cups at chest height).

**On the owner's computer:** V24 10.0–11.2 s (the gallery holding its breath) · V24 13.4–16.4 s and V08 (a roar,
**not cleared**, see section 6) · the raw suite clips without the burned-in caption (needed for F6's upgrade).

## 3. Continuity bible — hold these in every frame

**Location (matched to the real footage).** A raised hospitality suite, one level above a spectator bank that
slopes down to the water. The front is open between square white steel columns. Along the front runs a white
round-tube railing with vertical balusters. Just inside it is a flat black-topped drink ledge on white brackets.
Across a narrow inlet of water sit the island green's wooden bulkhead edge and the green, a packed bank beyond, and
a large two-storey white hospitality grandstand with a white roof. It has small plain flags along the roof and a
large screen at its right end showing soft, unreadable colour. To the right is the small round tree island ringed
with yellow flowers. **The green's size follows the lens (ESTIMATE, from `4c463ea4`, a phone's roughly 63–70° view):** at 63° (F7)
the green's wooden edge spans about the middle 60 % of the frame, the same share as the reference; at 47° (F1, F2,
F3, F5) it fills the background behind the subjects, soft; at 29° (F8) only a soft slice of green shows. The view
is the product, so it is never shown closer or bigger than that.

**Light.** Bright, slightly hazy afternoon sun, high, behind the camera on the left. Pale blue-white sky, about
5600 K. Crisp short shadows. Sparkle on the water.

**Camera.** Always on the suite side, behind the guests. Nobody looks into the lens, and no face is ever turned
toward it. Lenses: 63° wide, 47° medium, 29° close. Movement is slow and motivated: pushes, trucks and one
pull-back.

**Colour.** Natural daylight. Plain clothes in muted colours, except one loud solid polo for the brother-in-law.

**Cast and wardrobe (left to right along the rail).** Everything plain, solid colour and unbranded.

| # | Who | Wardrobe | Hands |
|---|---|---|---|
| 1 | **The client**, man, early 50s, short salt-and-pepper hair | **Charcoal-grey** quarter-zip, khaki trousers, plain black lanyard with a blank white card | Both hands resting on the rail |
| 2 | **The two, her**: woman, early 30s, dark hair in a low ponytail | **Sage-green** button-down, sleeves rolled, white trousers | Clear plastic cup held at chest height |
| 3 | **The two, him**: man, early 30s | White polo, plain light-grey cap | Clear plastic cup held at chest height |
| 4 | **The brother-in-law**, man, mid-40s | **Loud solid tangerine polo**, khaki shorts, sunglasses pushed up on his head | Clear cup in his right hand at chest height |
| 5 | **The son (the host)**, man, early 40s, dark hair | Navy polo | Right arm across dad's shoulders, left hand on the rail |
| 6 | **Dad**, man, early 70s, white hair | Plain tan cap, plain light-blue oxford shirt, a plain gold wedding band on his **left** hand, a steel watch on his left wrist with the face turned to the inside | Both hands on the rail |

**Colour check from behind:** charcoal, sage, white, tangerine, navy, light blue. No two neighbours match.

**Temporal state.** Cups stay in hands, at chest height, all film. Nothing is ever set on the round rail. Hands on
the rail stay on the rail. The son's
arm is across dad's shoulders in every frame they share, and it never "lands". The sunglasses stay on 4's head.

## 4. Actor briefs (every generated person)

| Who | Wants | Feels | Just happened | Looks at | Hides | Intensity | Never does |
|---|---|---|---|---|---|---|---|
| Client | To be impressed without showing it | Quiet surprise at how close it is | The host handed him a drink and stepped back | The green | That he's impressed | 3/10 | Smile, gesture, turn his face toward camera |
| The two | To enjoy it without a scene | Pride, ease | The host told them why they're here | The green; one small glance at each other | How proud they are | 3/10 | Clink, laugh, raise their cups |
| Brother-in-law | To be the expert | Delight | He's been describing this hole all day | One spot on the green | Nothing, but only from behind | 5/10 | Show his face, wave his arm about |
| Dad | To take it in | Moved, keeps it inside | His son's arm came around him | The green, steady | That he's moved | 3/10 outside | Turn round, move his hands |
| Son (host) | For his dad to have this | Quiet satisfaction | He brought everyone | The green, then his dad (F8) | How much it means | 3/10 | Show his face |

## 5. The frames

| Frame | Time | Length | Made how | Line |
|---|---|---|---|---|
| F1 | 0.00–4.25 | 4.25 s | GEN still → Kling | "The client you've been chasing… for a year." |
| F2 | 4.25–8.25 | 4.00 s | GEN still → Kling | "The two who hit the number." |
| F3 | 8.25–12.75 | 4.50 s | GEN still → Kling | "Your brother-in-law… who has not shut up about this place." |
| F4 | 12.75–15.00 | 2.25 s | **REAL phone clip** | "Your dad." |
| F5 | 15.00–18.75 | 3.75 s | GEN still → Kling | silence |
| F6 | 18.75–20.75 | 2.00 s | GEN still → Kling (background soft) | the click at 18.95, the roll, silence |
| F7 | 20.75–25.25 | 4.50 s | GEN still → Seedance, locked camera; push-out in the edit | THE ROAR · "Bring your people." |
| F8 | 25.25–27.00 | 1.75 s | GEN start still + edited end still → Kling | roar tail |
| F9 | 27.00–30.00 | 3.00 s | Composite end card | "Hospitality. … Handled." |

**Build order:** F7 still → F1 → F2 → F3 → F5 → F6 → F8 start → F8 end (edit) → animate each → F4 shoot →
assemble.

**The lettering lock.** Paste this line at the end of every still and motion prompt below. It is already
included in each one.
> *Every surface stays free of lettering: clothes, caps, the lanyard card, cups, the flag, the grandstand fascia, the roof flags and the big screen.*

---

### F7 — THE ROAR (master plate) · 20.75–25.25 · HERO · build this first

| Field | |
|---|---|
| Story job | Payoff: all six were at one rail. The roar hits and they hold together. Emotion and understanding. |
| Action | The guests ease a few centimetres upright, **not in unison**: onsets staggered between 0.1 and 0.4 s apart, dad last. Hands on the rail stay on the rail, and cups stay at chest height. Dad leans slightly into his son, whose arm is already across his shoulders. Nobody raises an arm. The far crowd stays soft and is **not animated to rise**; the roar carries the eruption. |
| Camera | **Locked in the generation.** One wide still, 63°, eye level, 5 m behind, with the suite's white open-front frame along the top and the soft back of a light-grey suite chair in the lower-left corner already in it. The move is done **in the edit**: start at 112 % scale on the guests and ease out to 100 % over 4.5 s, revealing the frame edge and the chair. |
| Lighting | Continuity light. |
| Audio | The licensed roar at 20.75, mixed as the off-screen crowd directly below the suite (close) plus the far bank (distant). VO "Bring your people." at 22.80. |
| Text | Caption "Bring your people." 22.80–24.50 |
| Source | GEN: one Nano Banana 2 still; Seedance 2.5 animates the guests with a locked camera; the push-out is an edit move |
| Real-ref | V24 13.4–16.4 s (a real roar moment); clean suite frames `7c9be9e1` (the open front's white frame, the light-grey chair) and `4c463ea4` (rail, ledge, view, scale) |
| Angle | You bring the people; TripNerd handles everything else |
| Motion | **HERO, two axes:** **camera translation** (the push-out, built in the edit) and a **foreground occlusion event** (the frame edge and the chair back revealed by the push-out) |

**Step A: still.** Nano Banana 2, 4K, 16:9. References: `7c9be9e1…`, `4c463ea4…`, `fe30cf32…`.
```
Photorealistic 16:9 photograph from inside a raised hospitality suite at a professional golf tournament, eye level, five metres behind six guests standing at the front of the suite with their backs to the camera. Match the suite, the square white steel columns, the white frame of the open front, the white round-tube railing with vertical balusters, the black-topped drink ledge and the view in the reference images exactly. The white frame of the open front runs along the top edge of the image, and the soft back of a light-grey suite chair like the one in the reference sits in the lower-left corner, out of focus.
The six guests fill the middle of the frame with open space on both sides, left to right: (1) a man in his early 50s with short salt-and-pepper hair, charcoal-grey quarter-zip, khaki trousers, a plain black lanyard, both hands resting on the rail; (2) a woman in her early 30s with dark hair in a low ponytail, sage-green button-down with rolled sleeves, white trousers, holding a plain clear plastic cup at chest height; (3) a man in his early 30s in a white polo and plain light-grey cap worn forwards, holding a plain clear plastic cup at chest height; (4) a man in his mid-40s in a loud solid tangerine polo and khaki shorts, sunglasses pushed up on his head facing forwards, holding a plain clear cup at chest height; (5) a man in his early 40s with dark hair in a navy polo, left hand on the rail, his right arm resting across the shoulders of (6) an older man in his early 70s with fair skin and white hair, a plain tan cap worn forwards and a plain light-blue oxford shirt, both hands on the rail. All six lean very slightly toward the rail.
The guests' bodies and the railing hide the spectator bank directly below the suite. Over the rail, across a narrow inlet of water: the island green's wooden bulkhead edge spanning about the middle sixty percent of the frame, the green, a crowded far bank and a large two-storey white hospitality grandstand with a white roof, all slightly soft with distance and haze; the small round tree island ringed with yellow flowers on the right.
Bright, slightly hazy afternoon sun high behind the camera on the left, pale blue-white sky, about 5600 K, crisp short shadows, sparkle on the water. Natural colour, a real live-event photograph. Every guest faces the green. Every surface stays free of lettering: clothes, caps, the lanyard card, cups, the flag, the grandstand fascia, the roof flags and the big screen, which shows only soft indistinct colour.
```
**Check before approving:** six people in this order and these colours · caps and sunglasses facing forwards ·
all backs to camera · nobody at the frame edges · the near bank hidden · rail, balusters, columns, frame and chair
match the real footage · the green at the target size · lettering sweep clean.

**Step B: motion.** Seedance 2.5, `omni_reference`, `start_image` = approved still, 1080p, 5 s (use 4.5 s), 16:9,
audio off.
```
SCENE CONTEXT
Afternoon at a professional golf tournament. Six guests stand at the front of a raised hospitality suite, backs to camera, watching the island green across a narrow inlet of water. A putt drops out of view and the six guests react with small, natural movements.

ACTIVE REFERENCES
@image1: the start frame. Six guests, the white round-tube railing, the white columns, the white frame of the open front, the chair back, the island green and the grandstand, 100% matches the reference. Left to right: man in a charcoal-grey quarter-zip; woman in a sage-green shirt with a low dark ponytail holding a clear cup; man in a white polo and grey cap holding a clear cup; man in a tangerine polo with sunglasses on his head holding a clear cup; younger man in a navy polo with his right arm across the shoulders of an older man in a tan cap and light-blue shirt.

LOCATION MAP
Foreground: the soft chair back in the lower-left corner; the white frame of the open front along the top. Midground: the railing and the backs of the six guests across the middle of the frame, open space at both edges; the spectator bank directly below the suite hidden behind the rail and the guests. Background: the island green's wooden edge, a crowded far bank and the white grandstand, soft with distance and haze.

FIRST FRAME / BLOCKING
The shot opens exactly on @image1: all six leaning very slightly toward the rail.

FORMAT MODE
One continuous shot, the camera does not cut on its own.

OPTICS
Wide shot, 63° field of view, rectilinear, natural motion blur.

CAMERA
Locked off on a tripod at eye level; the frame stays exactly as @image1 for the whole shot. Natural daylight tonality, clean highlight roll-off.

ACTION
0.0s to 0.5s — everyone still.
0.5s — the man in the tangerine polo straightens a few centimetres.
0.6s — the woman and the man in the grey cap straighten a few centimetres, cups staying at chest height.
0.8s — the man in the charcoal quarter-zip straightens, his hands staying on the rail.
0.9s — the older man leans slightly into the younger man's arm; the younger man stays steady.
1.0s to 4.5s — everyone holds still, watching; a breeze moves shirts and hair.

PERFORMANCE
Everyone stays seen from behind for the whole shot. Small, natural, slightly different movements.

PHYSICS
Drinks stay level in the cups; hands stay in contact with the rail as arms straighten; the older man's weight shifts toward the younger man.

LIGHTING
Bright, slightly hazy afternoon sun high behind the camera on the left, 5600K, pale blue-white sky, crisp short shadows, sparkle on the water.

STYLE
Photoreal live-event footage, clean and sharp, natural colour, fine grain.

OUTPUT SETTINGS
16:9, 1080p, real time, 24 fps.

POSITIVE LOCKS
The camera stays locked. The same six guests in the same clothes and the same left-to-right order for the whole shot. Faces stay turned toward the green. Arms stay low; hands on the rail stay on the rail; cups stay at chest height. The far crowd and grandstand stay still and soft. Every surface stays free of lettering: clothes, caps, the lanyard card, cups, the flag, the grandstand fascia, the roof flags and the big screen.
```
**In the edit:** scale 112 % → 100 % over the 4.5 s on an ease-out curve, anchored on the guests.
**Reject if:** anything on the structural list fails · any face turns toward camera · any arm goes up · the camera
moves · the far crowd moves. **Fallback:** Kling 3.0 4k with the same still and this text: *"Locked-off camera. At
half a second the six guests straighten a few centimetres, one after another; hands on the rail stay on the rail
and cups stay at chest height; the older man leans slightly into the younger man's arm; everyone keeps facing the
green. Every surface stays free of lettering."*

---

### F1 — THE CLIENT · 0.00–4.25

| Field | |
|---|---|
| Story job | Hook and first name. Attention: every host has this client. |
| Action | Hands on the rail, he takes in the view. One slow breath; his shoulders settle. |
| Camera | Medium-close, 47°, **2.5 m behind him and slightly to his left**: the back of his head, his left ear and only the edge of his cheek. No jaw or mouth in view. Slow push-in; the soft back of a light-grey suite chair in the lower-left foreground slides out of frame. |
| Lighting | Continuity light, sun on the edge of his ear. |
| Audio | Bed: wind, far murmur. VO at 0.40. |
| Text | Caption "The client you've been chasing… for a year." 0.40–3.50 |
| Source | GEN: still derived from the master, animated on Kling 3.0 |
| Real-ref | Suite frames `4ec88dba` / `7c9be9e1` (a real guest seen from behind, looking out; the light-grey suite chair) |
| Angle | You bring the people; TripNerd handles everything else |
| Motion | **Camera translation** (push-in) and a **foreground occlusion event** (the chair back leaves frame) |

**Step A: still.** References: **approved F7 still**, `4ec88dba…`.
```
Same place, same light and same man as person 1 in the first reference image: early 50s, short salt-and-pepper hair, charcoal-grey quarter-zip, plain black lanyard. Photorealistic 16:9 medium-close shot from 2.5 metres behind him and slightly to his left, at shoulder height: the back of his head, his left ear and only the outer edge of his cheek, both hands resting on the white round-tube railing. He looks out at the island green across the inlet, soft in the distance with shallow depth of field, the far bank and the white grandstand beyond. The spectator bank directly below the suite stays hidden below the rail line. The soft back of a light-grey suite chair, like the one in the reference, stands out of focus in the lower-left foreground. The other guests are soft shapes at the right edge. Bright, slightly hazy afternoon sun high behind the camera on the left, about 5600 K, sunlight on the edge of his ear. A real live-event photograph, natural colour. Every surface stays free of lettering: clothes, caps, the lanyard card, cups, the flag, the grandstand fascia, the roof flags and the big screen.
```
**Step B: motion.** Kling 3.0, 4k, 5 s, sound off. Use 4.25 s.
```
The camera pushes in very slowly toward the man while the soft chair back in the lower-left foreground slides out of the frame. He keeps looking out at the green, his head still. His shoulders rise and settle once with a slow breath. A light breeze moves the edge of his collar. The far crowd moves gently. Steady, realistic camera, one continuous shot. Every surface stays free of lettering.
```
**Reject if:** his jaw or mouth comes into view · his head turns toward camera · the lanyard card shows writing.
**Fallback:** move the camera fully behind him (back of head and shoulders only). **Also reject if** anything on the structural list fails.

---

### F2 — THE TWO · 4.25–8.25

| Field | |
|---|---|
| Story job | Second name: the reward angle for the corporate host. Emotion. |
| Action | Side by side at the rail, cups held still at chest height. At about 1.8 s she tips her head a little toward him and he nods once. |
| Camera | Medium, 47°, from directly behind at 2.5 m. Slow truck right. |
| Lighting | Continuity light. |
| Audio | Bed. VO at 4.60. |
| Text | Caption "The two who hit the number." 4.60–6.70 |
| Source | GEN: still from the master, animated on Kling 3.0 |
| Real-ref | IMG_1928 (reading only: cups at chest height); suite frame `4ec88dba` |
| Angle | You bring the people; TripNerd handles everything else |
| Motion | **Camera translation** (truck right) |

**Step A: still.** References: **approved F7 still**, `4c463ea4…`.
```
Same place, same light and the same two people as persons 2 and 3 in the first reference image: on the left a woman in her early 30s with dark hair in a low ponytail and a sage-green button-down with rolled sleeves; on the right a man in his early 30s in a white polo and plain light-grey cap. Photorealistic 16:9 medium shot from directly behind them at 2.5 metres, waist up. They stand side by side at the white round-tube railing, shoulders a hand's width apart, each holding a plain clear plastic cup still at chest height. The spectator bank directly below the suite stays hidden below the rail line. Beyond the rail, the water, the island green and the white grandstand, soft with shallow depth of field. Bright, slightly hazy afternoon sun high behind the camera on the left, about 5600 K. A real live-event photograph, natural colour. Every surface stays free of lettering: clothes, caps, the lanyard card, cups, the flag, the grandstand fascia, the roof flags and the big screen.
```
**Step B: motion.** Kling 3.0, 4k, 5 s, sound off. Use 4.0 s.
```
The camera trucks slowly to the right behind the two of them. Their cups stay still at chest height. At about two seconds the woman tips her head slightly toward the man, and he nods once, both still facing the green. A light breeze moves her ponytail. Steady, realistic camera, one continuous shot. Every surface stays free of lettering.
```
**Reject if:** a cup moves, merges or tips · either face turns to camera · extra fingers. **Fallback:** no head
movement; the truck alone.

---

### F3 — THE BROTHER-IN-LAW · 8.25–12.75

| Field | |
|---|---|
| Story job | Third name: the laugh. Emotion (warmth) and attention. |
| Action | He is mid-story. He leans a few degrees toward guest 3 on his left and turns his head left, away from the camera, as if telling him something. His free left hand rests on the rail. His cup stays level in his right hand. No pointing. The voice-over carries "has not shut up". |
| Camera | Medium, 47°, behind him and slightly to his right. Slow push-in. |
| Lighting | Continuity light; the tangerine polo is the loudest colour in the film. |
| Audio | Bed. VO at 8.60, a smile in the voice. |
| Text | Caption "Your brother-in-law… who has not shut up about this place." 8.60–12.40 |
| Source | GEN: one still from the master, animated on Kling 3.0 |
| Real-ref | Suite frame `4ec88dba` (a real guest at the front, from behind); IMG_1928 (reading only) |
| Angle | You bring the people; TripNerd handles everything else |
| Motion | **Camera translation** (push-in) |

**Step A: still.** References: **approved F7 still**, `4c463ea4…`.
```
Same place, same light and the same man as person 4 in the first reference image: mid-40s, loud solid tangerine polo, khaki shorts, sunglasses pushed up on his head facing forwards. Photorealistic 16:9 medium shot from behind him and slightly to his right. He stands at the white round-tube railing, his left hand resting on it, a plain clear plastic cup held level in his right hand at chest height; beside him on the left, the white-polo shoulder of the man in the grey cap. The spectator bank directly below the suite stays hidden below the rail line. The far bank and the white grandstand are soft, with shallow depth of field. Bright, slightly hazy afternoon sun high behind the camera on the left, about 5600 K. A real live-event photograph. Every surface stays free of lettering: clothes, caps, the lanyard card, cups, the flag, the grandstand fascia, the roof flags and the big screen.
```
**Step B: motion.** Kling 3.0, 4k, 5 s, sound off. Use 4.5 s.
```
The camera pushes in slowly toward the man from behind. He leans a few degrees toward the man on his left and turns his head to the left, away from the camera, as if telling him something; his shoulders move a little as he talks. His left hand stays on the rail and the cup in his right hand stays level at chest height. A light breeze moves his shirt. Steady, realistic camera, one continuous shot. Every surface stays free of lettering.
```
**Reject if:** anything on the structural list fails · his face turns toward the camera · the sunglasses flip.
**Fallback:** the lean alone, no head turn.

---

### F4 — YOUR DAD (the hand) · 12.75–15.00 · REAL

| Field | |
|---|---|
| Story job | The turn. The film goes quiet on one name. Emotion. |
| Action | An older man's **left** hand, wedding band on, rests on a white round rail in sun. Still. |
| Camera | Phone or camera, 4K. Close detail. The focus pull happens **in camera**: tap to focus on the rail edge, then on the knuckles. A slow hand-held push-in. |
| Lighting | Real afternoon sun from behind. No moving shadows. |
| Audio | The murmur starts to drop. VO "Your dad." at 13.10, quiet and slow. |
| Text | Caption "Your dad." 13.10–14.60 |
| Source | **REAL**: shoot it. The **left** hand of a fair-skinned man in his early 70s with age spots, matching the dad, wearing a plain gold wedding band, resting on a **white-painted round-tube railing** like the suite's, in bright hazy sun. A **plain light-blue oxford cuff** at the wrist. A steel watch with its face turned to the inside of the wrist. Shoot near water or grass, so the soft background carries blue, green and white like the suite's view. A signed likeness release from the hand's owner. |
| Real-ref | The clip itself is real |
| Angle | You bring the people; TripNerd handles everything else |
| Motion | **Focus change** (in camera) and **camera translation** (the slow push) |

**How to shoot it (5 minutes):** 4K, 24 or 30 fps, lock exposure on the hand, rail in the foreground at an angle,
background as bright bokeh. Three takes of 8 seconds. Send the best one.
**Fallback 1 (still real):** licensed real stock footage of an older man's hand resting on a white railing in sun,
checked for the left hand, the band and no visible watch face.
**Fallback 2 (last resort):** one Nano Banana 2 still framed **wide**: the oxford cuff, the wrist and a hand small in
the frame on the rail. The focus change and push are built in the edit with a blur ramp and a 3 % scale move, with
no generator animation. Reject on any anatomy fault at 200 % zoom.

---

### F5 — DAD AND SON · 15.00–18.75 · HERO

| Field | |
|---|---|
| Story job | Reveal who the "you" is: the host, standing with his father. Emotion. |
| Action | The son's arm already rests across dad's shoulders, and it never lands. Both watch the green. Dad's shoulders rise and fall with one slow breath. |
| Camera | Medium, 47°, from directly behind at 2.5 m. Slow push-in; the soft back of a light-grey suite chair in the lower-right foreground slides out of frame. |
| Lighting | Continuity light. |
| Audio | No VO. The murmur falls away. |
| Text | None |
| Source | GEN: still from the master, animated on Kling 3.0 |
| Real-ref | IMG_2031 (reading only: real guests with arms across shoulders) |
| Angle | You bring the people; TripNerd handles everything else |
| Motion | **HERO, two axes:** **camera translation** (push-in) and a **foreground occlusion event** (the chair back leaves frame) |

**Step A: still.** References: **approved F7 still**, `4ec88dba…`, `7c9be9e1…`.
```
Same place, same light and the same two men as persons 5 and 6 in the first reference image: on the left a man in his early 40s with dark hair in a navy polo; on the right an older man in his early 70s with white hair, a plain tan cap and a plain light-blue oxford shirt. Photorealistic 16:9 medium shot from directly behind them at 2.5 metres. The younger man's right arm rests across the older man's shoulders; his left hand is on the white round-tube railing; the older man has both hands on the railing. Both look out across the inlet at the island green and the white grandstand, soft with shallow depth of field. The spectator bank directly below the suite stays hidden below the rail line. The soft back of a light-grey suite chair, like the one in the reference, sits out of focus in the lower-right foreground. Bright, slightly hazy afternoon sun high behind the camera on the left, about 5600 K. A real live-event photograph, natural colour. Every surface stays free of lettering: clothes, caps, the lanyard card, cups, the flag, the grandstand fascia, the roof flags and the big screen.
```
**Step B: motion.** Kling 3.0, 4k, 5 s, sound off. Use 3.75 s.
```
The camera pushes in slowly toward the two men while the soft chair back in the lower-right foreground slides out of the frame. The younger man's arm stays resting across the older man's shoulders the whole time. The older man's shoulders rise and fall with one slow breath. A light breeze moves their shirts. Both keep looking at the green. Steady, realistic camera, one continuous shot. Every surface stays free of lettering.
```
**Reject if:** anything on the structural list fails · the arm slides, detaches or grows · either face turns · the cap shows writing. **Fallback:** the two
stand shoulder to shoulder with no arm.

---

### F6 — THE HUSH · 18.75–20.75

| Field | |
|---|---|
| Story job | Tension: everyone holds their breath, then the click. Attention before the payoff. |
| Action | Dad and son, perfectly still, shoulders and the backs of their heads sharp. Beyond them the green, the crowd and the grandstand are only soft shapes and colour, so no player, ball or hole can be read. |
| Camera | Close, 29°, over their shoulders from directly behind. Focus stays on the shoulders. Very slow push-in. |
| Lighting | Continuity light. |
| Audio | Near silence, wind only. **The putter click at 18.95**, somewhere beyond them. The ball rolls unheard for 1.8 s. Silence. |
| Text | None |
| Source | GEN: one still from the approved F5 still, animated on Kling 3.0 |
| Real-ref | IMG_2031 (reading only); V24 10.0–11.2 s for the held breath |
| Angle | You bring the people; TripNerd handles everything else |
| Motion | **Camera translation** (push-in) |

**Step A: still.** References: **approved F5 still**.
```
The same two men, place and light as the reference image. Photorealistic 16:9 close shot, 29° lens, from directly behind them over their shoulders: the back of the older man's tan cap and white hair, his light-blue oxford collar, the younger man's navy shoulder and his arm across the older man's shoulders, all in sharp focus. Beyond them everything is a soft blur of green grass, water and a pale crowd with no readable detail. Bright, slightly hazy afternoon sun from behind the camera on the left, about 5600 K. A real live-event photograph. Every surface stays free of lettering.
```
**Step B: motion.** Kling 3.0, 4k, 5 s, sound off. Use 2.0 s.
```
The camera pushes in very slowly. The two men hold perfectly still, holding their breath; the only movement is a light breeze in the older man's white hair at the edge of his cap. The background stays a soft blur. One continuous shot. Every surface stays free of lettering.
```
**Reject if:** anything on the structural list fails · the background comes into focus · either head turns.

---

### F8 — THE BUTTON · 25.25–27.00

| Field | |
|---|---|
| Story job | The last beat: in the roar, the son looks at his dad, not the green. Emotion. |
| Action | The son turns his head about 45 degrees to the right, toward his father, so it moves away from the camera. Dad keeps watching the green. |
| Camera | Close, 29°, **directly behind the son**, so a 45-degree turn shows only the back and edge of his head. Slight handheld sway. |
| Lighting | Continuity light. |
| Audio | The roar's tail. |
| Text | None |
| Source | GEN: start and end stills from the F5 still, animated between them on Kling 3.0 |
| Real-ref | IMG_2031 (reading only) |
| Angle | You bring the people; TripNerd handles everything else |
| Motion | **Focus change** (focus follows the son's head to his father) |

**Step A1: start still.** Reference: **approved F5 still**.
```
The same two men, place and light as the reference image. Photorealistic 16:9 close shot from directly behind the younger man, at shoulder height, 1.5 metres away: the back of his head and his navy polo in the foreground, his right arm across the older man's shoulders; the older man in the plain tan cap on the right, looking out at the green. Both face the green. Across the water the crowd is on its feet, small and soft with shallow depth of field. The spectator bank directly below the suite stays hidden below the rail line. Bright, slightly hazy afternoon sun, about 5600 K. A real live-event photograph. Every surface stays free of lettering: clothes, caps, the lanyard card, cups, the flag, the grandstand fascia, the roof flags and the big screen.
```
**Step A2: end still, made from the start still.** Nano Banana 2, `is_inpaint`, input = the approved start still,
mask over the younger man's head, neck and collar.
```
Inside the mask only: the younger man's head turned about 45 degrees to the right, toward the older man, with his neck and collar turning naturally with it, so the back and right edge of his head show and none of his face. Same hair, same light. Everything outside the mask stays exactly as it is. Every surface stays free of lettering.
```
**Step B: motion.** Kling 3.0, 4k, 5 s, sound off, `start_image` + `end_image`. Use the turn, about 1.75 s.
```
The younger man slowly turns his head about 45 degrees to the right toward the older man, arriving at the end frame; his neck turns naturally with it and his face stays hidden from the camera. The older man keeps looking out at the green. Slight handheld sway; focus follows the younger man's head as it turns. One continuous shot. Every surface stays free of lettering.
```
**Reject if:** anything on the structural list fails · the son's brow, nose or eyelashes break past the edge of his head · the arm changes. **Fallback:** cut F8 and hold F7 to 26.60.

---

### F9 — END CARD · 27.00–30.00

Composited, no generation. Use `4824f6d7-6c23-49ec-a36d-6300cccf7981` as is: brand blue, the real logo,
"Hospitality. Handled.", a white "Talk to a Nerd" pill, tripnerd.com. A 0.4 s crossfade from F8 runs from 26.60
to 27.00. **Motion:** camera translation, a slow 2 % scale push across the three seconds. VO "Hospitality. …
Handled." at 27.40.

## 6. Voice-over and sound

| Time | Line | Delivery |
|---|---|---|
| 0.40 | "The client you've been chasing… for a year." | Warm, conversational, like listing names to a friend |
| 4.60 | "The two who hit the number." | Slight pride |
| 8.60 | "Your brother-in-law… who has not shut up about this place." | A smile in the voice, a touch faster |
| 13.10 | "Your dad." | Quieter, slower, pitch drops. Then nothing. |
| 22.80 | "Bring your people." | Close to the mic, under the roar |
| 27.40 | "Hospitality. … Handled." | Plain and confident, on near silence |

**Casting:** a warm voice, 40s to 50s, unhurried, the host's friend rather than an announcer. A real human read is
strongly preferred. A generated voice is the fallback, and it must pass a listen first.

**Muted viewers:** the story reads without sound. The captions carry every line, the far crowd visibly rises and the
six ease upright, and the payoff is the son's look in F8.

**Sound spine (one continuous bed):** open-air suite ambience: soft wind, far gallery murmur, the odd flag halyard
tick, faint glassware. The murmur holds through F1–F3. It drops about 4 dB and loses its top end across F4–F5.
F6 is wind only: the **putter click at 18.95**, 1.8 s of held silence while the ball rolls, then **the roar at
20.75**, peaking around 21.5. It ducks 6 dB under "Bring your people." and fades over 1.5 s into the card. No
music. Master at −14 LUFS, true peak −1 dBTP.

**Roar source (default: licensed).** The roar is a **licensed sound-effects library crowd roar**, bought for this
film, unless Taylor confirms **in writing** that V24 or V08 were filmed on site by TripNerd staff or guests. Only
then may the client recording replace it. Never use a roar lifted from a broadcast. **Mix:** the crowd directly
below the suite is off-screen and close, so it is the loud layer; the far bank is a distant layer under it. That
matches the picture, where the far crowd rises small across the water.

## 7. Assembly

- **Timeline:** as in the table in section 5. Hard cuts, except the 0.4 s crossfade into the card.
- **Captions** (sound-off viewers): white, sentence case, lower left inside the title-safe area, soft 60 % shadow,
  matching the approved hosting spot's caption style. Each caption appears on its VO line and leaves 0.3 s after it.
- **Grade:** one pass over the whole film so generated and real shots share contrast and saturation, plus fine grain.
- **Export:** 1920x1080, 24 fps, H.264, yuv420p, bt709, faststart.
- **9:16 version:** a separate compose. Regenerate each still at 9:16 with the approved 16:9 still as reference.
  Keep captions above the bottom 15 % and below the top 8 %.
- **Who assembles:** ChatGPT's editor, CapCut, or Claude in the Higgsfield sandbox (as for the approved spot). F7's
  push-out is a 112 % → 100 % scale move in the edit.

## 8. Money and time (ESTIMATE, re-price in Higgsfield before starting)

| Item | Count | Unit (from earlier jobs) | Subtotal |
|---|---|---|---|
| Nano Banana 2 4K stills (F7, F1, F2, F3, F5, F6, F8 start, F8 inpaint; two takes each) | 16 | ≈ 3 credits | ≈ 50 |
| Kling 3.0 4k, 5 s (F1, F2, F3, F5, F6, F8, two takes each) | 12 | ≈ 30 credits | ≈ 360 |
| Seedance 2.5, 1080p, 5 s (F7, two takes) | 2 | ≈ 60 credits | ≈ 120 |
| **Total** | | | **≈ 530 credits** |

F4 is a phone shoot. The licensed roar is a separate small purchase.

## 9. Compliance

- The logo appears only on the end card, composited from the real file. No logos or lettering are generated.
- No tournament marks, player names, scoreboards or readable signs. "THE PLAYERS" is not used.
- No claims beyond the brand line. No "VIP", prices, dates or service promises.
- Generated people are actors in a scenario, never customers giving a testimonial. The one real person (the F4
  hand) signs a release.
- The view is never shown closer or larger than it is from the suite.
- AI disclosure is switched on at upload on every platform.

## 10. Skeptic Pass 1

Every round's verdict is recorded verbatim in `campaign-bible.md` §14.
