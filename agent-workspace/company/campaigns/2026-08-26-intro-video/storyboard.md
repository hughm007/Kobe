---
title: "Service Pow intro video — Storyboard (60s hero) — REVISION 2"
type: report
client: internal
owner: Karl
status: draft
created: 2026-08-28
updated: 2026-08-28
tags: [company, video, intro-video, storyboard, code-rendered]
---

# Storyboard — Service Pow intro video

**Revision 2** — lockstep with `script.md` Revision 2. **Built and rendered**; every Draw field below now describes what is actually on screen, not what was intended. Ten scenes, 60.0s, 30 fps, frames 0–1799.
**Source for every scene is `code-rendered`.** There is no generated image, no generated video, no
generated logo anywhere in this file. That is not a limitation being worked around — it is the
argument the film is making.

---

## The visual system (settled before scene 1, so it is not re-invented per scene)

| Element | Spec | Why |
|---|---|---|
| Ground | Off-white board `#F7F5F0` | Paper, not screen. Reads as thinking-in-progress |
| Ink | `#1A1A1A`, stroke 5px at 1080p | Marker weight. Contrast vs ground computed in build, printed to console |
| Accent | **single CSS variable `--accent`, provisional `#1B5FA8`** | One line changes the whole film when the real brand colour arrives |
| Accent rule | Accent is used for **strokes, fills and ticks only — never for text** | Body text stays ink, so the 4.5:1 text requirement is satisfied by construction and does not depend on which colour Wyatt picks |
| Type | **Liberation Sans** throughout — 700 letterspaced for the wordmark, 400 for everything else | The only quality sans in the container. No webfont fetch: the render must be reproducible offline, and the egress proxy would block a font CDN anyway |
| **Division of labour** | **The marker draws pictures. Type is type.** No hand-lettering, ever | Hand-lettering the company name would be *drawing a mark* — the one thing LB24 forbids. Typesetting it keeps the endcard honestly provisional |
| The ad vocabulary | One shared `adSketch`/`adFinal` pair — frame, horizon, subject block, accent shape, caption bar, play glyph — used at four sizes | The lone hook ad (S1), the four grid cells (S3/S4) and the compliance ad (S7) are literally the same object. The snap at 20.4 pays off a shape the viewer met at second 1 |
| Draw-on | SVG `stroke-dasharray` / `stroke-dashoffset` as a pure function of `t` | Deterministic. Frame N always renders identically |
| **The snap** | Line art → finished, in **2 frames (0.067s)**, then a 4-frame settle overshoot | The signature move. It must feel like a cut, not a dissolve — a dissolve says "morph", a cut says "built" |
| Motion law | Everything is `f(t)`. No `requestAnimationFrame`, no CSS transition, no randomness without a fixed seed | Re-render on any machine = identical bytes |

---

## Scene table

Ten fields per scene. `Canvas` is this film's equivalent of Camera — there is no lens, so it
records framing and board movement.

---

### S1 · HOOK — "the one-ad problem"

| Field | Value |
|---|---|
| **Window** | 0.0 – 7.0s · frames 0–209 |
| **Canvas** | Static, full board, centred. No move. The stillness is the point: nothing is happening, which is the client's actual experience of their last campaign |
| **Draw** | 0.6–2.6 marker draws **one ad in the shared sketch vocabulary** — frame, subject block, badge, caption slot, play glyph — at 800×450, x420 · 2.4–3.2 a large `?` draws to its right · 5.0–7.0 the whole group dims to 38% opacity |
| **Source** | code-rendered |
| **Burned** | T1 `One ad. One guess.` (3.4–6.6) |
| **VO** | "Most marketing money buys one ad. One idea. One guess. No way to know what worked." |
| **Audio** | Marker squeak on each draw-on (synthesised, short). No music until 7.0 |
| **Why it exists** | Self-selection. A viewer who has never bought marketing does not recognise this and should leave now |
| **Failure mode** | **This failed on the first render and was fixed.** The original was a rectangle with three lines inside, which cold-read as *a note or a document*, not an ad. Rebuilt on the ad vocabulary — caption slot and play glyph do the work. Still worth a cold-read at the gate: a viewer who does not read "ad" in the first 3 seconds is not in the film |

---

### S2 · WHO — "who is saying this"

| Field | Value |
|---|---|
| **Window** | 7.0 – 15.0s · frames 210–449 |
| **Canvas** | 7.0–7.6 the board's marks slide left and off (a wipe, as if an arm cleared it). Then static |
| **Draw** | 8.0–9.6 `SERVICE POW` hand-letters on · 9.6–10.2 an accent underline sweeps beneath it · 10.6 film-frame icon draws + label · 11.6 browser-window icon + label · 12.6 phone icon + label. All three persist |
| **Source** | code-rendered |
| **Burned** | T2 `SERVICE POW` (8.0–15.0) · T3 `video ads` (10.6–14.6) · T4 `websites` (11.6–14.6) · T5 `social` (12.6–14.6) |
| **VO** | "Service Pow makes video ads. We also build the sites and run the social around them." |
| **Audio** | Music enters at 7.0, low, one sustained pad. Marker squeaks continue |
| **Why it exists** | Names the company at second 8, not second 50. The 911 Drain read scored the identity beat as the weakest thing in that film; the correction is applied here from the start |
| **Failure mode** | Three icons in four seconds reads as a feature list, not a company. **If it fails:** hold the wordmark alone to 10.6 and drop `social` to a spoken-only mention |

---

### S3 · PACKS-A — "the grid"

| Field | Value |
|---|---|
| **Window** | 15.0 – 20.4s · frames 450–611 |
| **Canvas** | Board clears (wipe left, 15.0–15.4). Canvas pushes in ~4% over the scene — the only camera move in the film, and it lands on the offer |
| **Draw** | 15.4–16.4 a 2×2 grid of four empty frames draws · 16.4 header text · 17.0–20.0 each of the four cells fills with a **different** rough sketch — four distinct compositions, never four copies |
| **Source** | code-rendered |
| **Burned** | T6 `2 concepts × 2 hooks` (16.4–20.4) |
| **VO** | "You don't get one video. Two concepts, two hooks —" |
| **Audio** | Four soft marker strokes, one per cell, on the beat |
| **Why it exists** | Makes the unit of sale visible. `services.md`: "the unit of sale is a tested-variation pack, never a single video" |
| **Failure mode** | Four cells that look alike destroy the entire argument — the viewer sees one idea printed four times, which is *worse* than one ad. **This is the highest-risk drawing in the film** |

---

### S4 · PACKS-B — "the snap" ★ signature scene

| Field | Value |
|---|---|
| **Window** | 20.4 – 26.0s · frames 612–779 |
| **Canvas** | Static, holding the pushed-in framing |
| **Draw** | **20.4–20.47 (2 frames): all four cells snap from line art to finished** — solid plate, accent shape, caption bar, play triangle · 20.47–20.6 a 4-frame overshoot settle · 21.0–23.0 a counter ticks 1·2·3·4 across the cells · 23.2 the days line appears beneath |
| **Source** | code-rendered |
| **Burned** | T7 `4 finished ads` (20.2–23.0) · **T8 `5–7 days from your footage` (23.2–25.8)** — supersedes the original T8, carries the conditional from `script.md` §4a |
| **VO** | "— four finished ads in five to seven business days. Four chances, not one guess." |
| **Audio** | One hard transient on the snap. The loudest single moment in the film |
| **Why it exists** | The concept in one frame: rough thinking becomes finished work. Every other snap in the film is a callback to this one |
| **Failure mode** | **If "finished" doesn't look meaningfully better than "sketch", the whole film is decoration.** This is the scene to render and judge before building anything else — it is the 10-second proof segment |

---

### S5 · REAL+AI — "the plate stays"

| Field | Value |
|---|---|
| **Window** | 26.0 – 33.0s · frames 780–989 |
| **Canvas** | Clear (26.0–26.4), pull back to full board |
| **Draw** | 26.4–27.4 a 1340×754 frame draws in line art · 28.0 a **440×548 portrait plate** drops into its centre, landing with a soft contact shadow · 28.4–29.2 line art builds an environment around it (road line, two buildings, sky strokes) · **30.0 the environment snaps to finished while the plate does not change by one pixel** |
| **Source** | code-rendered. **The plate is a code-drawn gradient + seeded grain, carrying four white film-frame corner ticks.** The ticks say *this is footage* without inventing a single pixel of content. It is not a photograph and does not pretend to be one. See failure mode |
| **Burned** | T9 `Your footage stays the hero` (29.4–33.0) |
| **VO** | "It won't look like a robot made it. Your footage stays the hero — AI builds the world around it." |
| **Audio** | A soft physical thud when the plate drops. The snap transient again at 30.0, quieter than S4 |
| **Why it exists** | The moat, in one picture: *the thing that stays untouched is yours*. `services.md` calls the hybrid promise "the moat". **Composition note from the build:** the plate is deliberately large and **crosses the horizon**, because the first attempt sat it small and wholly above the road line and it read as a screen inside a screen — the exact opposite of "your footage is the hero" |
| **Failure mode** | **Known weakness, recorded not hidden:** a grey code-drawn plate is a weak stand-in for real footage, and this beat is about realism. The honest options are (a) ship the placeholder and let the label do the work, (b) composite a real, rights-clear clip Wyatt supplies, (c) cut the beat. **(b) is the right answer if a clip exists** — flagged to Owner |

---

### S6 · REAL+AI-B — "depth"

| Field | Value |
|---|---|
| **Window** | 33.0 – 36.5s · frames 990–1094 |
| **Canvas** | Static. Two background layers drift at different rates (parallax as a function of `t`) |
| **Draw** | 33.2 second environment layer slides in behind · 34.4 third layer, slower · 35.6 all layers settle; the plate remains the only unmoved element on screen |
| **Source** | code-rendered |
| **Burned** | T10 `AI builds the rest` (33.2–36.2) |
| **VO** | "Shots that used to need a crew." |
| **Audio** | Pad opens up. First moment of scale in the film |
| **Why it exists** | Turns "AI helps" into "AI does the expensive part". The parallax is doing the persuading, not the words |
| **Failure mode** | Parallax on flat line art can read as cheap 2000s motion-graphics. **If it fails:** hold the layers still and let a single wide layer draw instead |

---

### S7 · SAFE — "the boring differentiator"

| Field | Value |
|---|---|
| **Window** | 36.5 – 44.5s · frames 1095–1334 |
| **Canvas** | Clear (36.5–36.9). Static, slightly tighter than full board |
| **Draw** | 36.9–37.9 a list rule draws at x182 · **37.4–38.2 a finished ad fades in at x1040, 700×394 — the thing the list is annotating** · 38.6 tick 1 + **a disclosure label lands on the ad** · 40.4 tick 2 + **a testimonial quote is drawn onto the ad, then struck through in accent** · 42.2 tick 3 + **an accent rule lands under the ad's claim line** · 44.0–44.5 a hand-drawn circle closes around the list |
| **Source** | code-rendered |
| **Burned** | T11 `Disclosure handled` (38.6–44.4) · T12 `No fake testimonials` (40.4–44.4) · T13 `Claims substantiated` (42.2–44.4) |
| **VO** | "It has to be safe to run. Disclosure handled. No fake testimonials. Every claim backed up." |
| **Audio** | Three tick sounds, dry and quiet. Music drops to almost nothing — this beat is spoken, not sold |
| **Why it exists** | `positioning-and-icp.md` names "platform-safe AI ads" a differentiator. It is the one competitors will not copy because it costs them speed |
| **Failure mode** | **A ticking checklist is the single most generic visual in explainer video, and the first render proved it** — three lines on an empty board, floating. Mitigation applied: the list now annotates a real ad, so each tick lands a visible change on a visible thing. Ticks stay in the marker language and the closing circle is a hand gesture, not a UI animation. **Still open:** the cumulative-stack cps rule in `script.md` §3a is unsettled and this is the scene it governs |

---

### S8 · BUILD — "where it lands"

| Field | Value |
|---|---|
| **Window** | 44.5 – 52.5s · frames 1335–1574 |
| **Canvas** | Clear (44.5–44.8). Static |
| **Draw** | 45.0–46.4 a browser wireframe draws (800×452, centred) · **47.2 snap → live site** (filled hero, accent button, type bars) · 49.2 **three mini ads fade in across the bottom** · 49.6 captions type on inside mini 1 · 50.6 an end card wipes across mini 2 · 51.6 a lower third slides into mini 3 |
| **Source** | code-rendered |
| **Burned** | T14 `The page it lands on` (46.4–49.4) · T15 `Captions. End cards. Titles.` (49.6–52.4) |
| **VO** | "The ad needs somewhere to land. We build the page, the captions, the end cards — in code." |
| **Audio** | Keyboard-adjacent tick on the caption type-on. Music rebuilds |
| **Why it exists** | Breadth without a feature list — and the three motion primitives are literally the thing being described, rendering themselves. The medium is the receipt |
| **Failure mode** | Three sub-events in 3 seconds is a lot. **Fixed from the first render:** the primitives originally floated as bare rectangles in a right-hand column — a caption bar with nothing to caption is just a rectangle. Each now plays *inside a mini ad*, so it reads as the thing it is. **If it still fails:** cut the lower third, keep captions and end card |

---

### S9 · START — "one for you"

| Field | Value |
|---|---|
| **Window** | 52.5 – 57.2s · frames 1575–1715 |
| **Canvas** | Clear (52.5–52.8). Push in ~3% through the scene |
| **Draw** | 52.8–53.6 a single 16:9 frame draws, faster than S1's · 53.6–54.6 a line-art local business inside it (a work van, a shopfront awning) · **55.4 snap → finished** — the S4 move, now applied to the viewer's own business. Both objects sit on the road line with soft contact shadows, and **the van's livery panel is left blank with an accent outline** |
| **Source** | code-rendered |
| **Burned** | T16 `We make the first one before you ask.` (54.0–57.2) |
| **VO** | "So we'll make one for your business — before you ask." |
| **Audio** | The snap transient, third and final use. Music resolves |
| **Why it exists** | The CTA *is* the differentiator, so it gets the film's signature move instead of a button. The viewer has now seen the snap happen to a generic ad (S4) and to a real clip (S5); here it happens to them |
| **Failure mode** | **This is the claim that creates an obligation** — see `script.md` §4b, unsigned. Also: if the van/awning reads as "plumber", the film has silently capped itself on the wedge; the drawing is kept generic-trade. **Fixed from the first render:** the wheels floated above the road and the cab did not connect to the box, so it read as a trailer. Geometry corrected — wheel bottoms land exactly on the road line |

---

### S10 · END — "the provisional card"

| Field | Value |
|---|---|
| **Window** | 57.2 – 60.0s · frames 1716–1799 |
| **Canvas** | Static, centred |
| **Draw** | 57.2–57.4 all marks retract (un-draw in reverse — the board empties) · 57.4 `SERVICE POW` centres · 57.8 accent underline draws to full width · 58.0 `servicepow.com` appears beneath · 59.4–60.0 hold, dead still |
| **Source** | code-rendered |
| **Burned** | T17 `SERVICE POW` (57.4–60.0) · T18 `servicepow.com` (58.0–60.0) |
| **VO** | none — the film ends in silence |
| **Audio** | Music resolves at 58.4 and stops. 1.6s of near-silence to close |
| **Why it exists** | One job per card: where to go. No CTA line here — the CTA was made at S9, and stacking a third string breaks the cps budget (`script.md` §3) |
| **Failure mode** | **PROVISIONAL TREATMENT — TYPE ONLY.** No logo exists (`assets/` holds a README and nothing else) and a mark is never generated (LB24). This card is a placeholder for a real lockup and every export must carry `-provisional-endcard` in its filename until a logo file lands in `assets/` |

---

## Scene-to-scene checks

**Snap discipline** — the signature move fires exactly three times: S4 (the offer), S5 (the moat),
S9 (the viewer). Three is a pattern; four would be a tic. S8's wireframe→site is deliberately a
*softer* version (6 frames, no overshoot) so it reads as a cousin, not a repeat.

**Clear-the-board rhythm** — the board wipes at 7.0 · 15.0 · 26.0 · 36.5 · 44.5 · 52.5. Six clears
in 60s, average 8.6s apart, longest gap 11.0s (PACKS, correctly the longest beat).

**Camera moves** — two, both push-ins, both on beats that are asking for something (S3 the offer,
S9 the CTA). Every other scene is locked off.

**Colour budget** — accent appears at 9.6 (wordmark rule), 20.4 (the snap), 38.6/40.4/42.2 (ticks),
47.2 (site button), 55.4 (final snap), 57.8 (endcard rule). Seven appearances, each on a beat that
matters. The film is monochrome the rest of the time, which is what makes the accent mean anything.

**Chain check vs the bible's beat map** — S1→S2→S3+S4→S5+S6→S7→S8→S9→S10 maps one-to-one onto
HOOK→WHO→PACKS→REAL+AI→SAFE→BUILD→START→END. No beat added, none dropped, none reordered.

---

## Open items carried into the gate

| # | Item | Owner |
|---|---|---|
| O1 | C10 "before you ask" creates an operational obligation — three options in `script.md` §4b | **Wyatt** |
| O2 | S5's plate is a code-drawn stand-in for real footage in a beat *about* real footage | **Wyatt** — a rights-clear clip fixes it |
| O3 | The cumulative-stack cps rule (`script.md` §3a) is proposed, not settled — governs S7 | Skeptic |
| O4 | `--accent` is provisional; brand colour unknown | **Wyatt** |
| O5 | Endcard is a provisional type-only treatment; no logo file exists | **Wyatt** |
| O6 | servicepow.com is egress-blocked from this container — the live site's copy is unread | **Wyatt** (paste it, or it stays NOT VERIFIED) |

---

## Revision log

| Rev | Date | Change |
|---|---|---|
| 1 | 2026-08-28 | First draft. Ten scenes, visual system settled up front, snap budget fixed at three, six open items carried to the gate. |
| 2 | 2026-08-28 | **Built.** Seven defects found by looking at rendered frames rather than at the code, and fixed: S1 cold-read as a note not an ad · the accent rule crossed the wordmark · cell accent shapes collided with caption bars and all four captions sat in the same slot · S5's plate read as a screen-in-a-screen · S7's checklist floated on an empty board · S8's primitives were bare rectangles · S9's van floated above the road with a detached cab. Three new visual-system rules recorded (type/marker division of labour, the shared ad vocabulary, the font). No timing or copy changed. |
