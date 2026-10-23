---
title: "TripNerd — YOUR PEOPLE (30 s) — frame-by-frame production brief for ChatGPT + Higgsfield"
type: storyboard
client: tripnerd
campaign_id: 2026-09-28-ten-scripts
status: STORYBOARD v9 — FINAL for handoff to ChatGPT; rights cleared 2026-09-28 (Taylor's standing authorization); the owner approves each still before it is animated
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
1. **Rights: cleared.** Taylor has authorised the use of all TripNerd photos, videos and assets in its
   advertising (standing authorization, filed 2026-09-28 in the client brief and the campaign bible). That covers
   showing the suite and the view, and attaching the reference crops to the generators. The real suite footage
   shows guests standing at the rail over 17 (V23 51.4–53.4 s). What it cannot cover stays out: no tournament
   name, mark, player or sign (rule 7, section 9). Roles: the SPEND_APPROVER releases spend, and the APPROVER
   signs off the storyboard and any creative option.
2. **Work order is not film order.** The **F7 still is made and approved before any other still.** It fixes the
   cast, the clothes, the suite and the light. Every other still is made *from* it.
3. **Two steps per generated frame:** Step A makes the still, Step B animates it. F5, F7 and F8 are generated
   with a **locked frame between two stills at the same framing**, and the clip is used in full.
   - **The end stills:** F7's and F8's are made by masked inpaint of the approved start still, and F5's is the
     approved still itself. None is generated fresh, and none is cropped.
   - **The generator's job:** breathing, the breeze, and at most one head move.
   - **The push:** each of these three shots gets its push-in in the edit, as a scale on the 4K clip. The film
     exports at 1920x1080, so a push of 5–8 % costs no visible resolution.
   - **What this trades away:** an edit push is a zoom without parallax. That is the accepted cost of keeping the
     generator's job this small.
   - **Approval:** show the owner every still before animating it.
4. **Settings** (checked in Higgsfield's live model listing on 2026-09-28).
   - **Stills:** **Nano Banana 2**, resolution `4k`, 16:9, with the listed references attached. The listing offers
     `4k`, 16:9, and `is_inpaint` with a `mask`.
   - **Motion, every generated frame:** **Kling 3.0**, mode **4k**, sound **off**, `start_image` = the approved
     still, plus `end_image` for F5, F7 and F8. Length as listed per frame. The listing gives 3–15 s, the modes
     std, pro and 4k, and the image roles start_image and end_image.
   - **Not yet tested in a run:** `end_image` in mode 4k. The first F7 take proves it. If 4k refuses an end image,
     run F5, F7 and F8 in mode `pro`, upscale them to match, and grade them against F6.
5. **One frame is not generated at all: F4 is a real phone clip.** Never animate a hand in close-up.
6. **Cast crops: the cast's identity check.** As soon as the F7 still is approved, crop each guest out of the 4K
   still (head to hips, 2x upscale is fine) and save them as **C1–C6**, numbered as in the cast table. Attach the
   listed crops to every later still. Before approving any still, put it next to its crops at the same size and
   check build, hair colour and length, cap shape and colour, shirt shade, and who stands on which side. Any
   drift is a re-roll, not a fix in the edit. The close shots of dad and son (F6, F8) are also checked against each
   other at 100 %: ear shape, hairline, nape and collar.
7. **Everything past the rail stays soft, in every generated shot.** Singles and pairs are shot on a 29° lens and
   F7 on 47°, with shallow depth of field focused on the guests.
   - **Focus follows distance.** Anyone standing at the rail beside the subject is exactly as sharp as the subject.
     Past the rail, focus falls off gradually: the water softens, and the green, the crowds, the grandstands, the
     flags and the big screen become soft colour and shape.
   - **No person, player, flag design, sign or screen image past the rail is ever readable.** This rule keeps
     crowds, tournament marks and players out of the film.
   - **Reject a cut-out, portrait-mode look:** halos or hard edges around hair, caps, cups or balusters.
8. **No text, logo or mark is ever asked of the model.** Each prompt ends with a lettering line that names **only
   the surfaces in that shot**. Captions, the end card and the logo go on in the edit.
9. **Two takes per shot, then change the prompt.** A third identical re-roll is wasted. Use the frame's fallback.
10. **Lettering sweep, every time.** After every still, zoom to 200 % on:
    - clothing and caps;
    - the lanyard strap and its card;
    - the two cups and dad's wedding band;
    - the white window frame and columns;
    - the whole soft background, for any shape that reads as a letter, logo, flag design or screen picture.

    Any such shape gets inpainted to plain before the still is animated. After every animation, scrub frame by
    frame over the same places, and reject the take if one appears.
11. **Structural sweep after every animation** (the "structural list" in the reject lines):
    - balusters, where they show, and the rows of bolt holes on the white columns keep their count and stay
      straight;
    - hands on the rail stay on it without fusing or sliding;
    - the two clear cups keep their shape and level;
    - ears, necks and collars hold their shape through head moves;
    - caps and collars face the right way when seen from behind, and caps stay put on heads;
    - no rhythmic bouncing of shoulders, no head bobbing, and no figure frozen like a mannequin for a whole take;
    - the son's right hand on dad's far shoulder (in frame in F5, F6 and F7) shows at most five fingers, stays
      resting in one place, and never merges into the shirt or slides; it rides with dad's shoulder when he
      breathes or tips his head;
    - nothing past the rail sharpens into a readable person or shape;
    - the soft foreground extra in F7 never turns or shows a face;
    - no face turns toward the lens.
12. **Reject any take that fails an item on its checklist.** A face turning to camera, a hand going wrong, or
    lettering appearing anywhere are the failures that make this look fake.
13. **Re-check prices in Higgsfield before starting.** Section 8 is an estimate from earlier jobs.
14. **Disclosure:** the finished film contains realistic generated people. Switch on the AI-content label on
    Meta, TikTok and YouTube.

## 1. The advert in one paragraph

A warm voice names the people a host would bring: the client they've chased for a year, the two who hit the
number, the brother-in-law who won't stop talking about this place, and their dad. Each is shown in a quiet
moment at the front of a TripNerd suite over the 17th, from behind, and one real hand. Then the gallery hushes,
a low "ooh" rises as a putt tracks, and the roar breaks. We cut wide for the first time: all six have been
standing together at the one rail. Nobody cheers. Dad tips his head toward his son. In the roar, the son turns to
look at his dad instead of the green. **Hospitality. Handled.**

| Spine | |
|---|---|
| Core message | You bring the people. TripNerd handles everything else. |
| Primary emotion | Pride in the people you brought, felt quietly |
| Viewer starts | "Hospitality ads are all drinks and logos." |
| Viewer ends | "I know exactly who I'd bring." |
| Narrative question | Who are these people, and why are they here? |
| Payoff | Stillness inside the roar: they're together, and the son looks at his dad |
| CTA logic | The viewer has just cast their own list, so "Talk to a Nerd" is the next step |

## 2. Reference pack (real, mark-free, in Higgsfield already)

Attach **only** these three frames to the generator. Each is a crop of the owner's real suite footage, checked at
full size on 2026-09-28. The crops were made as follows:
- **Left out:** no big screen, flag, bottle label or real guest is in any of them.
- **Removed:** the signs and the figures on the green were cloned out with the surrounding grass and crowd before
  softening, so no patch or silhouette is left.
- **Softened:** the view is softened throughout (rule 7). Only the suite's own structure is sharp.

| Name | Media ID | What it shows |
|---|---|---|
| **R-VIEW** | `aaf2c1f4-1d4a-47c5-937d-e976d968a60c` | The view from the suite, all soft: the water, the island green and its wooden bulkhead edge, the far bank as colour, the white grandstand's lower storeys, the near bank below |
| **R-FRAME** | `f564a3a2-ef84-4214-a078-e7436a5592cc` | The suite's white steel window column with a row of bolt holes and the white top frame, sharp; the view past it, soft |
| **R-RAIL** | `6a26be6c-afce-4497-b14a-f91daed07530` | The suite's white railing with vertical balusters and the black ledge post (a soft 720p crop) |
| Card | `4824f6d7-6c23-49ec-a36d-6300cccf7981` | End card, 1920x1080, "Talk to a Nerd". F9, used as is |
| Logo | `46ae277a-7897-4574-b995-38097233d77c` | Official TripNerd colour logo. Only for the edit, never for generation |

Stream any of them at `https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/<media id>.jpg`
(the card and logo are `.png`).

**Never attach to a generator:**

| Media ID | Why |
|---|---|
| `4ec88dba` | The big screen shows three real players' headshots and broadcast graphics |
| `4c463ea4` | The big screen, the roof flags and a labelled water bottle |
| `7c9be9e1` | A real guest, the roof flags, a sign and figures on the green |
| `fe30cf32` | A real guest's head and a sign |
| `1f4a5b57`, `2f8b2d78` | Superseded crops: they still hold figures on the green and blurred sign patches |
| `c2a0c138`, `9111e76a`, `e5329451`, `4b183815`, sheet `802db49f` | A burned-in "REAL SUITE FOOTAGE" caption |

`7c9be9e1` and `fe30cf32` are cited as **reading-only** references for how the real footage looks: shot over
another guest's soft shoulder or head, with the view beyond.

**Reading only, never uploaded to a generator** (tournament badges and real guests' faces): Drive IMG_2031 (guests
with arms across shoulders), IMG_2036 (a group from behind), IMG_1928 (cups at chest height).

**On the owner's computer:** V24 10.0–11.2 s (the gallery holding its breath) · V24 13.4–16.4 s and V08 (a real
roar, cleared, see section 6).

## 3. Continuity bible — hold these in every frame

**Location (matched to the real footage).**
- **The suite:** a hospitality suite raised well above a packed spectator bank that slopes down to the water. Its
  front is open between white steel window columns, each with a row of bolt holes, under a white top frame. Along
  the front runs a white metal railing with vertical balusters, beside a black drink ledge.
- **The view:** across a narrow inlet of water are the island green's wooden bulkhead edge and the green, a packed
  far bank, and large two-storey white grandstands.
- **Rule 7 applies:** in this film all of the view is soft colour and shape. It is never shown closer or larger
  than it looks from the suite.

**Light.** The guests stand in the **open shade** of the suite, under its roof and white top frame, as in the real
footage (R-FRAME: the column is evenly lit, with no hard sun on it).
- **On the guests:** soft, even daylight on their backs and shoulders, with a gentle brighter edge where the high
  afternoon sun, behind the camera on the left, reaches past the top frame.
- **Beyond the rail:** the view is bright, hazy afternoon sun. The sky is pale blue-white, about 5600 K, and the
  water has a soft sparkle.

**Camera.** Always on the suite side, behind the guests. Nobody looks into the lens, and no face is ever turned
toward it. Lenses: 29° for singles and pairs; 47° only for F7, the one wide shot. Shallow depth of field that
follows distance (rule 7). Movement is slow and motivated: every shot is a slow push. The real footage is often shot
over another guest's soft shoulder, and F7 does the same: a soft extra guest, seen only as a shoulder, stands near
the camera.

**Colour.** Natural daylight. Plain clothes in muted colours, except one loud solid polo for the brother-in-law.

**Cast and wardrobe (left to right along the rail).** Everything plain, solid colour and unbranded.

| # | Who | Wardrobe | Hands |
|---|---|---|---|
| 1 | **The client**, man, early 50s, short salt-and-pepper hair | **Charcoal-grey** quarter-zip, khaki trousers, plain black lanyard with a blank white card | Both hands resting on the rail |
| 2 | **The two, her**: woman, early 30s, dark hair in a low ponytail | **Sage-green** button-down, sleeves rolled, white trousers | Clear plastic cup in her left hand at chest height, right hand on the rail |
| 3 | **The two, him**: man, early 30s | White polo, plain light-grey cap, light-grey chinos | Clear plastic cup in his right hand at chest height, left hand on the rail |
| 4 | **The brother-in-law**, man, mid-40s, short sandy-brown hair, bare head | **Loud solid tangerine polo**, khaki shorts | Left hand on the rail, right hand in his shorts pocket |
| 5 | **The son (the host)**, man, early 40s, dark hair | Navy polo, stone chinos | Right arm across dad's shoulders, left hand on the rail |
| 6 | **Dad**, man, early 70s, fair skin, white hair | Plain tan cap, plain light-blue oxford shirt, tan trousers, a plain gold wedding band on his **left** hand, no watch | Both hands on the rail |
| — | **Soft foreground extra** (F7 only) | Dark-grey shirt; only a soft shoulder, near the camera | Out of frame |

**Colour check from behind:** charcoal, sage, white, tangerine, navy, light blue. No two neighbours match.

**Temporal state.**
- There are only two cups (guests 2 and 3). They stay in hand at chest height all film.
- Nothing is ever set on the rail. Hands on the rail stay on the rail, and 4's right hand stays in his pocket.
- The son's arm is across dad's shoulders in every frame they share (F5, F6, F7, F8), his right hand resting on
  dad's far shoulder, and it never "lands".
- From the end of F7 onward, dad's head stays tipped toward his son.

## 4. Actor briefs (every generated person)

| Who | Wants | Feels | Just happened | Looks at | Hides | Intensity | Never does |
|---|---|---|---|---|---|---|---|
| Client | To be impressed without showing it | Quiet surprise at how close it is | The host handed him a drink and stepped back | The green | That he's impressed | 3/10 | Smile, gesture, turn his face toward camera |
| The two | To enjoy it without a scene | Pride, ease | The host told them why they're here | The green | How proud they are | 3/10 | Clink, laugh, raise their cups |
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
| F5 | 15.00–18.00 | 3.00 s | GEN still → Kling, locked (same still as end), push in the edit | the murmur falls to a hush |
| F6 | 18.00–20.00 | 2.00 s | GEN still → Kling | hush, then the rising "ooh" |
| F7 | 20.00–24.00 | 4.00 s | GEN still + inpainted end still → Kling, locked; push in the edit | THE ROAR · "Bring your people." |
| F8 | 24.00–27.00 | 3.00 s | GEN still + inpainted end still → Kling, locked; push in the edit | roar tail |
| F9 | 27.00–30.00 | 3.00 s | Composite end card, hard cut in | "Hospitality. … Handled." |

No generated shot is longer than 4.5 s on screen in the main cut, or longer than 5.0 s in any fallback.

**Build order:** F7 still → F7 end still (edit) → cast crops C1–C6 → F1 → F2 → F3 → F5 → F6 → F8
start → F8 end (edit) → animate each → F4 shoot → assemble.

---

### F7 — THE ROAR (master still) · 20.00–24.00 · HERO · build this first

| Field | |
|---|---|
| Story job | Payoff: the first wide shot, and all six were at the one rail together. The roar breaks and they hold. Emotion and understanding. |
| Action | The six stand shoulder to shoulder at the rail, in stillness inside the roar. At about 1 s **dad tips his head about 15° toward his son**. That is the only action. Everyone breathes and a light breeze moves shirts and hair. Hands stay on the rail and the two cups stay at chest height. Past the rail the soft shapes of people on the green and the far bank shift gently; nothing there can be read. |
| Camera | Medium wide, **47°**, eye level, 5 m behind the six, shallow depth of field focused on them. A white steel window column stands just left of guest 1 and another beyond dad on the right, under the white top frame. A soft extra guest's shoulder fills only the outer lower-left corner, near the camera. **Locked in the generation**, between the master and its inpainted end still at the same framing; the 4 s take is used in full. **In the edit:** scale 100 % → 108 % over the 4.0 s, anchored on the upper-right third, so the frame pushes in and the extra's shoulder leaves at the lower-left. |
| Lighting | Continuity light: the guests in the suite's open shade, the view bright. |
| Audio | The licensed outdoor golf-gallery roar (section 6) breaks at 20.00. VO "Bring your people." at 22.05. |
| Text | Caption "Bring your people." 22.05–23.75 |
| Source | GEN: one Nano Banana 2 still and its edited end still, animated between them on Kling 3.0 |
| Real-ref | `7c9be9e1` (reading only: real footage shot over a guest's soft shoulder, the view beyond); R-VIEW, R-FRAME, R-RAIL (the suite and the view); V24 13.4–16.4 s (a real roar from the suite) |
| Angle | You bring the people; TripNerd handles everything else |
| Motion | **HERO, two axes, both built in the edit:** **camera translation** (the 108 % push) and a **foreground occlusion event** (the soft extra's shoulder leaves the frame). This is the rule 3 trade: a zoom without parallax, accepted to keep generation minimal. |

**Step A1: master still.** Nano Banana 2, `4k`, 16:9. References: R-VIEW, R-FRAME, R-RAIL.
```
Photorealistic 16:9 photograph from inside a raised hospitality suite at a professional golf tournament, eye level, five metres behind six guests standing shoulder to shoulder at the open front of the suite with their backs to the camera, 47-degree lens, shallow depth of field focused on the guests. Match the suite in the reference images: a white steel window column with a row of bolt holes stands just left of the guests and another beyond them on the right, the white top frame runs across the top of the opening, a white metal railing with vertical balusters and a black drink ledge along the front.
The six guests fill the middle of the frame, left to right: (1) a man in his early 50s with short salt-and-pepper hair, charcoal-grey quarter-zip, khaki trousers, a plain black lanyard, both hands resting on the rail; (2) a woman in her early 30s with dark hair in a low ponytail, sage-green button-down with rolled sleeves, white trousers, a plain clear plastic cup in her left hand at chest height, her right hand on the rail; (3) a man in his early 30s in a white polo, plain light-grey cap worn forwards and light-grey chinos, a plain clear plastic cup in his right hand at chest height, his left hand on the rail; (4) a man in his mid-40s with short sandy-brown hair and no hat, in a loud solid tangerine polo and khaki shorts, his left hand on the rail and his right hand in his shorts pocket; (5) a man in his early 40s with dark hair, navy polo and stone chinos, left hand on the rail, his right arm resting across the shoulders of (6) an older man in his early 70s with fair skin and white hair, a plain tan cap worn forwards, a plain light-blue oxford shirt and tan trousers, both hands on the rail, a plain gold band on his left hand. The younger man's right hand rests relaxed on the older man's far shoulder, fingers together.
In the extreme lower-left corner, close to the camera and completely out of focus, the soft shoulder of another guest in a dark-grey shirt, filling only the outer edge of the frame.
The guests stand in the open shade of the suite roof: soft, even daylight on their backs, with a gentle brighter edge on hair and shoulders. They are all equally sharp. Past the railing, in bright hazy afternoon sun, focus falls off gradually with distance: the pale blue-grey water, the bright green of the green with a few soft, unreadable shapes of people on it, the soft brown band of its wooden edge, a pale mottled band of spectators and the white shapes of grandstands. No individual person, flag, sign or screen picture past the railing can be made out. Pale blue-white sky, about 5600 K. Natural colour, a real live-event photograph. Every guest faces the green. Every surface stays free of lettering: clothes, caps, the lanyard and its card, the two cups, the white window frame and columns, and the soft background.
```
**Check before approving:**
- six people, in this order and these colours;
- a column at each end and the top frame across the top;
- caps facing forwards, and guest 4 bare-headed;
- 4's right hand fully in his pocket;
- the son's hand resting on dad's far shoulder, with at most five fingers and all of them normal;
- every back to the camera, and the extra only a shoulder in the outer lower-left corner;
- the six equally sharp, with no halo around any of them;
- nothing past the rail readable;
- rail, balusters and columns match R-RAIL and R-FRAME;
- the lettering sweep is clean.

**Step A2: end still, made from the master.** Nano Banana 2, `is_inpaint`, input = the approved master still. Draw
the mask over dad's head and neck only; his collar stays outside the mask.
```
Inside the mask only: the older man's head tipped about fifteen degrees toward the younger man beside him, cap still worn forwards, neck following naturally; still facing the green, no face showing. Everything outside the mask stays exactly as it is. Every surface stays free of lettering.
```
No crop: the end still keeps the master's framing. That is the **F7 end still**. F8 also uses it as a reference.
**Check:** dad's cap faces forwards · his collar and the son's hand are unchanged · everything outside the mask is
identical to the master.

**Step B: motion.** Kling 3.0, 4k, **4 s**, sound off, `start_image` = the master still, `end_image` = the end still.
**Use all 4 s**, so the shot ends on the end still.
```
Locked-off camera, one continuous shot, arriving at the end frame. At about one second the older man in the tan cap slowly tips his head toward the younger man beside him. Everyone breathes quietly and keeps facing the green; a light breeze moves shirts and hair. Past the railing the soft background shifts gently. Every surface stays free of lettering.
```
**Reject if:**
- anything on the structural list fails;
- any face turns toward the camera;
- any arm moves;
- anyone other than dad turns their head;
- the extra turns;
- anything past the rail becomes readable.

**Fallbacks, in order:**
1. **No head tip:** the master still as both start and end still. Dad stays upright into F8, so F8's start still
   is rebuilt with dad upright and its "dad's head resets upright" reject is dropped.
2. **A 3 s take on the same two stills, used in full.** A shorter interpolation drifts less.
   - F7 runs 20.00–23.00.
   - F8 is generated at 4 s and used in full (23.00–27.00).
   - "Bring your people." moves to 21.60, with its caption at 21.60–22.95.
3. **If both fail:** stop and send the takes to the Campaign Director before spending more.

> **Creative option for the APPROVER:** five of the six stay still under the roar. That is the concept ("nobody
> cheers"), but a golf-literate viewer may expect a small reaction. If the APPROVER wants one, it is added as a
> second inpainted change in the end still (for example guest 4's head lifting slightly). It is not added by
> prompt.

---

### F1 — THE CLIENT · 0.00–4.25

| Field | |
|---|---|
| Story job | Hook and first name. Attention: every host has this client. |
| Action | Hands on the rail, he takes in the view. One slow breath; his shoulders settle. |
| Camera | Medium-close, **29°**, **2.5 m behind him and slightly to his left**: the back of his head, his left ear and only the edge of his cheek. No jaw or mouth in view. At the right edge, the back of the woman's head and her sage-green shoulder, as sharp as he is. Slow push-in. |
| Lighting | Continuity light: open shade, a gentle bright edge on his ear. |
| Audio | Bed: wind, far murmur. VO at 0.40. |
| Text | Caption "The client you've been chasing… for a year." 0.40–3.50 |
| Source | GEN: still from the master, animated on Kling 3.0 |
| Real-ref | R-FRAME (the real column and frame); `fe30cf32` (reading only: a real guest at the opening, from behind) |
| Angle | You bring the people; TripNerd handles everything else |
| Motion | **Camera translation** (push-in) |

**Step A: still.** References: **approved F7 still**, crops **C1** and **C2**, R-FRAME.
```
Same place, same light and same man as person 1 in the first reference image: early 50s, short salt-and-pepper hair, charcoal-grey quarter-zip, plain black lanyard. Photorealistic 16:9 medium-close shot, 29-degree lens, shallow depth of field, from 2.5 metres behind him and slightly to his left, at shoulder height: the back of his head, his left ear and only the outer edge of his cheek, both hands resting on the white railing, a white steel window column with bolt holes at the left edge. At the right edge, the back of the head and the sage-green shoulder of the woman beside him, as sharp as he is. Past the railing, focus falls off into a soft blur of water, green and pale crowd with nothing readable. He stands in the soft open shade of the suite roof, with a gentle brighter edge on his ear; the view beyond is in bright hazy afternoon sun, about 5600 K. A real live-event photograph, natural colour. Every surface stays free of lettering: their clothes, the lanyard and its card, the white column, and the soft background.
```
**Step B: motion.** Kling 3.0, 4k, 5 s, sound off. Use 4.25 s.
```
The camera pushes in very slowly toward the man. He keeps looking out at the green, his head still. His shoulders rise and settle once with a slow breath. The woman beside him stays still, facing the green. A light breeze moves the edge of his collar. The soft background shifts gently. Steady, realistic camera, one continuous shot. Every surface stays free of lettering.
```
**Reject if:** anything on the structural list fails · his jaw or mouth comes into view · either head turns toward
camera.
**Fallback:** move the camera fully behind him (back of head and shoulders only).

---

### F2 — THE TWO · 4.25–8.25

| Field | |
|---|---|
| Story job | Second name: the reward angle for the corporate host. Emotion. |
| Action | Side by side, shoulders a hand's width apart, cups held still at chest height, both watching the green. Only breath moves. The voice-over carries "hit the number". |
| Camera | Medium, **29°**, from directly behind at 2.5 m, framed **from mid-chest up**, so the rail and balusters sit below the frame. ESTIMATE: the frame is about 1.3 m wide at them, so the neighbours' heads fall outside it. Slow push-in, which narrows the frame, so no one new comes into it. |
| Lighting | Continuity light. |
| Audio | Bed. VO at 4.60. |
| Text | Caption "The two who hit the number." 4.60–6.70 |
| Source | GEN: still from the master, animated on Kling 3.0 |
| Real-ref | IMG_1928 (reading only: cups at chest height); R-VIEW (the view's colours) |
| Angle | You bring the people; TripNerd handles everything else |
| Motion | **Camera translation** (push-in) |

**Step A: still.** References: **approved F7 still**, crops **C2** and **C3**, R-VIEW.
```
Same place, same light and the same two people as persons 2 and 3 in the first reference image: on the left a woman in her early 30s with dark hair in a low ponytail and a sage-green button-down with rolled sleeves; on the right a man in his early 30s in a white polo and plain light-grey cap. Photorealistic 16:9 medium shot, 29-degree lens, shallow depth of field, from directly behind them at 2.5 metres, framed from mid-chest up so the railing is below the frame. They stand side by side, shoulders a hand's width apart, each holding a plain clear plastic cup still at chest height, both equally sharp. Past them, focus falls off into a soft blur of water, green and pale crowd with nothing readable. Soft open shade of the suite roof on the guests; the view beyond in bright hazy afternoon sun, about 5600 K. A real live-event photograph, natural colour. Every surface stays free of lettering: their clothes, his cap, the two cups, and the soft background.
```
**Step B: motion.** Kling 3.0, 4k, 5 s, sound off. Use 4.0 s.
```
The camera pushes in slowly toward the two of them. They stand still, watching the green, breathing; their cups stay still at chest height. A light breeze moves her ponytail. Steady, realistic camera, one continuous shot. Every surface stays free of lettering.
```
**Reject if:** anything on the structural list fails · a cup moves, merges or tips · either head turns · another
head enters the frame.
**Fallback:** a slower push over the same still.

---

### F3 — THE BROTHER-IN-LAW · 8.25–12.75

| Field | |
|---|---|
| Story job | Third name: the laugh. Emotion (warmth) and attention. |
| Action | He stands at the rail facing the green, head steady. His shoulders rise and settle once with a slow breath. Nothing else moves. The loud shirt and the smile in the voice-over carry "has not shut up". |
| Camera | Head and shoulders, **29°**, from **directly behind at 1.5 m**, shoulder height. ESTIMATE: the frame is about 0.8 m wide at him. His neighbours stand shoulder to shoulder about 0.5 m to either side, so their heads fall outside the frame, and at most a sliver of shoulder shows at either edge, as sharp as he is. Slow push-in. |
| Lighting | Continuity light; the tangerine polo is the loudest colour in the film. |
| Audio | Bed. VO at 8.60, a smile in the voice. |
| Text | Caption "Your brother-in-law… who has not shut up about this place." 8.60–12.40 |
| Source | GEN: still from the master, animated on Kling 3.0 |
| Real-ref | `fe30cf32` (reading only: a real guest's head from behind at the opening) |
| Angle | You bring the people; TripNerd handles everything else |
| Motion | **Camera translation** (push-in) |

**Step A: still.** References: **approved F7 still**, crop **C4**.
```
Same place, same light and the same man as person 4 in the first reference image: mid-40s, short sandy-brown hair, no hat, loud solid tangerine polo. Photorealistic 16:9 head-and-shoulders shot from directly behind him at 1.5 metres, shoulder height, 29-degree lens, shallow depth of field: the back of his head and his tangerine shoulders filling the middle of the frame, both ears showing evenly, no face. At the frame edges, at most a sliver of a neighbour's shoulder, as sharp as he is, with no other head in the frame. Past him, focus falls off into a soft blur of water, green and pale crowd with nothing readable. Soft open shade of the suite roof on the guests; the view beyond in bright hazy afternoon sun, about 5600 K. A real live-event photograph. Every surface stays free of lettering: his clothes and the soft background.
```
**Step B: motion.** Kling 3.0, 4k, 5 s, sound off. Use 4.5 s.
```
The camera pushes in slowly toward the man from behind. He keeps facing the green, his head steady; his shoulders rise and settle once with a slow breath. A light breeze moves his shirt. Steady, realistic camera, one continuous shot. Every surface stays free of lettering.
```
**Reject if:** anything on the structural list fails · his head turns · any part of his face shows · another head
enters the frame.
**Fallback:** the push-in alone, with no shoulder movement.

---

### F4 — YOUR DAD (the hand) · 12.75–15.00 · REAL

| Field | |
|---|---|
| Story job | The turn. The film goes quiet on one name. Emotion. |
| Action | An older man's **left** hand, wedding band on, rests on a white-painted rail in sun. Still. |
| Camera | Phone, 4K, on its **2x or 3x lens** so the perspective matches the generated long-lens shots, braced or on a mini tripod. Close detail. Focus **pulled in camera** with a manual focus control, for example the free Blackmagic Camera app: slowly, over about one second, from the rail edge to the knuckles. Not Cinematic or Portrait mode. The push is added in the edit as a slow 3 % scale move. |
| Lighting | Open shade (under a porch roof or an awning): soft, even light on the hand, with a bright sunlit background, matching the guests in the suite's shade. No moving shadows. |
| Audio | The murmur starts to drop. VO "Your dad." at 13.10, quiet and slow. |
| Text | Caption "Your dad." 13.10–14.60 |
| Source | **REAL**: shoot it. The **left** hand of a fair-skinned man in his early 70s with age spots, matching the dad, wearing a plain gold wedding band, resting on a **white-painted metal rail** like the suite's (R-RAIL), in open shade with a bright sunlit background. A **plain light-blue oxford cuff** at the wrist. **No watch.** Shoot near water or grass, so the soft background carries blue, green and white like the suite's view. A signed likeness release from the hand's owner. |
| Real-ref | The clip itself is real |
| Angle | You bring the people; TripNerd handles everything else |
| Motion | **Focus change** (in camera) and **camera translation** (the edit push) |

**How to shoot it (5 minutes):** 4K, 24 or 30 fps, the 2x or 3x lens, lock exposure on the hand, rail in the
foreground at an angle, background as bright bokeh. Three takes of 8 seconds. Send the best one.
**Match it to the generated shots around it:**
- **Rail:** gloss white paint, like R-RAIL.
- **Light:** open shade on the hand and a bright background, as in every generated shot.
- **Texture:** in the edit, apply the same grade and fine grain as the film, and a slight softening if the phone's
  sharpening shows.
- **Reject:** a focus pull that hunts, or any halo around the fingers or the ring.

**Fallback 1 (still real):** licensed real stock footage. Stock that matches all of these at once is unlikely, so
the real shoot is the dependable route. **Every one of these must match, or the clip is not used:**
- the **left** hand of a **fair-skinned man in his early 70s** with age spots;
- a plain gold band on the ring finger;
- a **light-blue oxford cuff**;
- **no watch**;
- resting still on a **white-painted rail**;
- soft light on the hand with a bright background;
- a soft blue, green and white background.

**Fallback 2 (last resort):** one Nano Banana 2 still framed **wide**: the oxford cuff, the wrist and a hand small
in the frame on the rail. The still's prompt ends *"Every surface stays free of lettering: the cuff, the ring and
the soft background."* The focus change and push are built in the edit with a blur ramp and a 3 % scale move, with
no generator animation. Reject on any anatomy fault at 200 % zoom.

---

### F5 — DAD AND SON · 15.00–18.00

| Field | |
|---|---|
| Story job | Reveal who the "you" is: the host, standing with his father. Emotion. |
| Action | The son's arm already rests across dad's shoulders, and it never lands. Both stand still, watching the green, breathing naturally. No directed movement. |
| Camera | Medium, **29°**, from directly behind at 2.5 m. ESTIMATE: the frame is about 1.3 m wide at them, so the neighbours' heads fall outside it. **Locked in the generation**, with the approved still as both start and end still, so the arm and hand are pinned at both ends. The 3 s take is used in full. **In the edit:** scale 100 % → 105 %, centred on the two men. |
| Lighting | Continuity light. |
| Audio | No VO. The murmur falls away to a hush. |
| Text | None |
| Source | GEN: one still from the master, animated on Kling 3.0 with the same still as start and end |
| Real-ref | IMG_2031 (reading only: real guests with arms across shoulders) |
| Angle | You bring the people; TripNerd handles everything else |
| Motion | **Camera translation** (the 105 % edit push; see rule 3) |

**Step A1: still.** References: **approved F7 still**, crops **C5** and **C6**.
```
Same place, same light and the same two men as persons 5 and 6 in the first reference image: on the left a man in his early 40s with dark hair in a navy polo; on the right an older man in his early 70s with fair skin, white hair, a plain tan cap and a plain light-blue oxford shirt. Photorealistic 16:9 medium shot, 29-degree lens, shallow depth of field, from directly behind them at 2.5 metres. The younger man's right arm rests across the older man's shoulders, his right hand relaxed on the older man's far shoulder with the fingers together; his left hand is on the white railing; the older man has both hands on the railing, a plain gold band on his left hand. Both look out at the green, equally sharp, in the soft open shade of the suite roof. Past the railing, in bright hazy sun, focus falls off into a soft blur of water, green and pale crowd with nothing readable. A real live-event photograph, natural colour. Every surface stays free of lettering: their clothes, the tan cap, and the soft background.
```
**Step A2: end still.** The approved F5 still itself. There is no crop and no inpaint.

**Step B: motion.** Kling 3.0, 4k, **3 s**, sound off, `start_image` + `end_image`. **Use all 3 s.**
```
Locked-off camera, one continuous shot. The younger man's arm stays resting across the older man's shoulders the whole time, his hand still on the far shoulder. Both stand still, breathing naturally, looking at the green. A light breeze moves their shirts. Every surface stays free of lettering.
```
**Reject if:** anything on the structural list fails · the arm slides, detaches or grows · either face turns.
**Fallback:** a second take with the prompt shortened to *"Locked-off camera. The two men stand still, breathing.
Every surface stays free of lettering."*

---

### F6 — THE HUSH · 18.00–20.00

| Field | |
|---|---|
| Story job | Tension: everyone holds their breath as the putt tracks. Attention before the payoff. |
| Action | Dad and son hold still, breathing quietly, their shoulders and the backs of their heads sharp. Beyond them the green, the crowd and the grandstand are only soft shapes and colour, so no player, ball or hole can be read. |
| Camera | Close, 29°, **1.2 m** behind them at shoulder height, over their shoulders. Focus stays on the shoulders. Very slow push-in. |
| Lighting | Continuity light. |
| Audio | A hush, wind only. From about 18.45 a low gallery "ooh" rises as the putt tracks. |
| Text | None |
| Source | GEN: one still from the approved F5 still, animated on Kling 3.0 |
| Real-ref | IMG_2031 (reading only); V24 10.0–11.2 s for the held breath |
| Angle | You bring the people; TripNerd handles everything else |
| Motion | **Camera translation** (push-in) |

**Step A: still.** References: **approved F5 still**, crops **C5** and **C6**.
```
The same two men, place and light as the reference image. Photorealistic 16:9 close shot, 29-degree lens, shallow depth of field, from 1.2 metres directly behind them at shoulder height, over their shoulders: the back of the older man's tan cap and white hair, his light-blue oxford collar, the younger man's navy shoulder and his arm across the older man's shoulders, all in sharp focus. Beyond them everything is a soft blur of green grass, water and a pale crowd with no readable detail. Soft open shade of the suite roof on the two men; the view beyond in bright hazy afternoon sun, about 5600 K. A real live-event photograph. Every surface stays free of lettering: their clothes, the tan cap, and the soft background.
```
**Step B: motion.** Kling 3.0, 4k, 5 s, sound off. Use 2.0 s.
```
The camera pushes in very slowly. The two men hold still, breathing quietly, watching. The background stays a soft blur. One continuous shot. Every surface stays free of lettering.
```
**Reject if:** anything on the structural list fails · the background comes into focus · either head turns · the cap
shifts.
**Fallback:** a slower push over the same still.

---

### F8 — THE BUTTON · 24.00–27.00

| Field | |
|---|---|
| Story job | The last beat: in the roar, the son looks at his dad, not the green. Emotion. |
| Action | The son's forearm is still across dad's back; his hand on dad's far shoulder is just outside the frame. Dad's head is still tipped toward him, exactly as in the F7 end still. The son turns his head **about 30°** to the right, toward his father, away from the lens. The turn stops when the back of his head is square to the camera and both ears show evenly. His collar stays with his shoulders. Dad keeps watching the green. |
| Camera | Close, 29°, **2 m behind the son and about 30° to his left**. Dad's head and near shoulder sit at the right edge; his far shoulder and the son's hand fall just outside the frame, and the forearm across his back carries the embrace. At the start we see the son's left ear and the edge of his cheek, as in F1. At the end we see the square-on back of his head. **Locked in the generation**, between the start still and its inpainted end still at the same framing; the 3 s take is used in full, from the son still facing the green to the completed turn. **In the edit:** scale 100 % → 105 %, centred on the son's head. |
| Lighting | Continuity light. |
| Audio | The roar's tail, fading to near silence by 26.80, before the card's line at 27.40. |
| Text | None |
| Source | GEN: start still from the F5 still; end still made from it by masked inpaint at the same framing; Kling 3.0 between them |
| Real-ref | IMG_2031 (reading only) |
| Angle | You bring the people; TripNerd handles everything else |
| Motion | **Camera translation** (the 105 % edit push; see rule 3) |

**Step A1: start still.** References: **approved F5 still**, **approved F7 end still** (for dad's head tip),
**approved F6 still** (for the heads' detail), crops **C5** and **C6**.
```
The same two men, place and light as the reference images. Photorealistic 16:9 close shot, 29-degree lens, shallow depth of field, from 2 metres behind the younger man and about thirty degrees to his left, at shoulder height: the back of his head, his left ear and only the edge of his cheek, his navy polo in the foreground, his right forearm resting across the older man's back; the older man's head in the plain tan cap and his near shoulder at the right edge of the frame, his far shoulder and the younger man's hand just outside the frame; the older man's head is tipped about fifteen degrees toward the younger man exactly as in the reference, looking out at the green. Both in the soft open shade of the suite roof. Past the railing everything is a soft blur of water, green and pale crowd in bright hazy sun, with nothing readable. A real live-event photograph. Every surface stays free of lettering: their clothes, the tan cap, and the soft background.
```
**Check:**
- dad's head tip and cap match the F7 end still;
- the son's hand is outside the frame, and only the forearm crosses dad's back;
- the heads match the approved F6 still at 100 %: ear shape, hairline, nape and collar.

**Step A2: end still, made from the start still.** Nano Banana 2, `is_inpaint`, input = the approved start still.
Draw the mask over the younger man's head and neck only; his collar stays outside the mask.
```
Inside the mask only: the younger man's head turned about thirty degrees to the right, toward the older man, so the back of his head is square to the camera with both ears showing evenly and none of his face; his neck turns naturally above a collar that stays with his shoulders. Same hair, same light. Everything outside the mask stays exactly as it is. Every surface stays free of lettering.
```
No crop: the end still keeps the start still's framing.
**Check:** both ears even · no cheek, brow, nose or lashes · the collar unchanged · the forearm and dad unchanged.

**Step B: motion.** Kling 3.0, 4k, **3 s**, sound off, `start_image` + `end_image`. **Use all 3 s.**
```
Locked-off camera, one continuous shot, arriving at the end frame. The younger man holds for a moment, then slowly turns his head about thirty degrees to the right toward the older man, his collar staying with his shoulders, his face hidden from the camera. His forearm stays resting across the older man's back. The older man keeps his head tipped toward him and keeps looking out at the green. Every surface stays free of lettering.
```
**Reject if:**
- anything on the structural list fails;
- any cheek, brow, nose or lashes show;
- the collar turns with the head;
- the forearm moves, lifts or disappears, or a hand comes into the frame;
- dad's head resets upright;
- the son's head starts the shot turned, rather than facing the green.

**Fallback:** cut F8. Re-run F7 as a **5 s** take on the same two stills, used in full (20.00–25.00). The card cuts in
at 25.00 and holds 5.0 s, and its line moves to 26.40.

---

### F9 — END CARD · 27.00–30.00

Composited, no generation. Use `4824f6d7-6c23-49ec-a36d-6300cccf7981` as is: brand blue, the real logo,
"Hospitality. Handled.", a white "Talk to a Nerd" pill, tripnerd.com.
- **Transition:** a hard cut from F8 at 27.00, so the son's completed turn is not dissolved.
- **Motion:** a slow 2 % scale push in the edit across the three seconds. It is a flat card, so this is a scale move, not a camera move.
- **VO:** "Hospitality. … Handled." at 27.40.

## 6. Voice-over and sound

| Time | Line | Delivery |
|---|---|---|
| 0.40 | "The client you've been chasing… for a year." | Warm, conversational, like listing names to a friend |
| 4.60 | "The two who hit the number." | Slight pride |
| 8.60 | "Your brother-in-law… who has not shut up about this place." | A smile in the voice, a touch faster |
| 13.10 | "Your dad." | Quieter, slower, pitch drops. Then nothing. |
| 22.05 | "Bring your people." | Close to the mic, under the roar |
| 27.40 | "Hospitality. … Handled." | Plain and confident, on near silence |

**Casting:** a warm voice, 40s to 50s, unhurried, the host's friend rather than an announcer. A real human read is
strongly preferred. A generated voice is the fallback, and it must pass a listen first.

**Muted viewers:** the story reads without sound. The captions carry every line. The cut to the first wide shot in
F7 shows all six together, dad tips his head toward his son, and the payoff is the son's look in F8.

**Sound spine (one continuous bed, no music).**
- **F1–F3:** open-air suite ambience: soft wind, far gallery murmur, faint glassware. The murmur holds.
- **F4–F5:** the murmur drops about 4 dB, loses its top end, and falls away to a hush by 17.75.
- **F6:** a hush, wind only. From about **18.45** a low gallery "ooh" rises as the putt tracks. There is no putter
  click: it would not carry across the water.
- **F7:** **the roar breaks at 20.00** and peaks around 20.75. It ducks 6 dB under "Bring your people."
- **F8 into F9:** the roar fades over F8 to near silence by 26.80, before the card's line at 27.40.
- **Master:** −14 LUFS, true peak −1 dBTP.

**Sources: every crowd sound is licensed.** The murmur, the hush, the "ooh" and the roar, including both the close
and the distant layer of the roar, all come from a **licensed sound-effects library of outdoor golf galleries**,
bought for this film.
- **What the roar must be:** a spread-out, open-air crowd with applause mixed through it. Ideally it includes the
  rising "ooh" as a putt tracks.
- **Search terms:** "golf gallery roar putt", "golf crowd applause outdoor".
- **Reject:** stadium, arena, football and indoor crowds. A golf-literate viewer hears the difference at once.
- **Screen every bed** by listening with headphones. Reject any intelligible name, fan shout or PA announcement.
- **Client recordings (V24, V08):** cleared under Taylor's standing authorization. The real roar from the suite
  may replace or sit under the library roar if it passes the same headphone screen and is clean enough (phone
  audio often carries wind and clipping). Never use a roar lifted from a broadcast.
- **Mix:** the crowd directly below the suite is off-screen and close, so it is the loud layer. The far bank is a
  distant layer under it.

## 7. Assembly

- **Timeline:** as in the table in section 5. Hard cuts throughout, including into the card.
- **Captions** (sound-off viewers): white, sentence case, lower left inside the title-safe area, soft 60 % shadow,
  matching the approved hosting spot's caption style. Each caption appears on its VO line and leaves 0.3 s after it.
- **Grade:**
  - Match F4 (the real phone clip) to F3 and F5 side by side first.
  - Then one pass over the whole film, and one fine grain over everything.
  - Every generated shot is Kling 3.0 4k. If F5, F7 and F8 had to run in mode `pro`, upscale them and match them
    to F6 side by side before the global pass.
- **Export:** 1920x1080, 24 fps, H.264, yuv420p, bt709, faststart.
- **9:16 version:** a separate compose. Regenerate each still at 9:16 with the approved 16:9 still as reference.
  Keep captions above the bottom 15 % and below the top 8 %.
- **Edit pushes:**
  - F4: 3 %.
  - F5: 100 % → 105 %, centred on the two men.
  - F7: 100 % → 108 %, anchored on the upper-right third, so the extra's shoulder leaves at the lower-left.
  - F8: 100 % → 105 %, centred on the son's head.
  - F9: 2 %.

  Each push runs across the shot's full length on an ease-in-out curve. The generated clips are 4K and the export
  is 1080p, so these pushes cost no visible resolution.
- **Who assembles:** ChatGPT's editor, CapCut, or Claude in the Higgsfield sandbox (as for the approved spot). No
  compositing layers are needed.

## 8. Money and time (ESTIMATE, re-price in Higgsfield before starting)

| Item | Count | Unit (from earlier jobs) | Subtotal |
|---|---|---|---|
| Nano Banana 2 4K stills and inpaints (F7, F7 end, F1, F2, F3, F5, F6, F8 start, F8 end; two takes each) | 18 | ≈ 3 credits | ≈ 55 |
| Kling 3.0 4k (F1, F2, F3, F6 at 5 s; F7 at 4 s; F5 and F8 at 3 s; two takes each) | 14 | ≈ 30 credits (shorter clips may cost less) | ≈ 420 |
| **Total, before any fallback** | | | **≈ 475 credits** |

F4 is a phone shoot. The licensed crowd audio is a separate small purchase.

## 9. Compliance

- The logo appears only on the end card, composited from the real file. No logos or lettering are generated.
- No tournament marks, player names, scoreboards or readable signs. "THE PLAYERS" is not used. Everything past the
  rail is soft (rule 7), and only mark-free, player-free reference crops are attached (section 2).
- No claims beyond the brand line. No "VIP", prices, dates or service promises.
- Generated people are actors in a scenario, never customers giving a testimonial. The one real person (the F4
  hand) signs a release.
- The view is never shown closer or larger than it is from the suite.
- AI disclosure is switched on at upload on every platform.
- **Venue and footage rights: cleared (2026-09-28).** Taylor has authorised the use of all TripNerd photos,
  videos and assets in its advertising, as a standing authorization. That covers the on-site footage, its use as
  generation references, and showing the suite and its view. The real footage shows guests at the rail over 17
  (V23), so the film's front-rail group is true to the product.
- **What the authorization cannot cover:** the tournament's own marks, name, players and signage. None appear
  (rule 7 and the lines above). No identifiable real guest appears either.

## 10. Skeptic Pass 1

Every round's verdict is recorded verbatim in `campaign-bible.md` §14.
