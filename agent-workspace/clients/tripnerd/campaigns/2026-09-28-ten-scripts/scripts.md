---
title: "TripNerd — ten advert scripts (15–30 s) and the Higgsfield top three"
type: campaign-script
client: tripnerd
campaign_id: 2026-09-28-ten-scripts
status: DRAFT — awaiting owner (APPROVER) choice
created: 2026-09-28
updated: 2026-09-28
tags: [campaign, scripts, pack]
---

# TripNerd — ten advert scripts

**Read with:** `media-catalog.md` (what each source ID is and whether it is usable) and `campaign-bible.md`
(ground truth, strategy assumptions, decision log). Durations are 15–30 s. Every source is tagged
**REAL** (client photo or video), **GEN** (generated; disclosure on every platform), **EXISTS** (a
generated asset already made, no new spend), **COMP** (composited real logo or typed text, never
model-rendered), or **SFX/VO**.

**House rules baked into every script:** no generated face performs emotion at readable distance (real
faces are exempt); pure-generated shots hold ≤ 5 s; one continuous sound bed per film; no superlatives, no
prices, no dates, no "VIP" until the package sheet backs it; the tournament house is "tournament week", never
named; the suite door sign carries a tournament mark (owner's call, flagged); end card = real logo file on
brand blue, "Hospitality. Handled.", "Talk to a Nerd", tripnerd.com.

**Voice direction for every VO line:** one idea per breath, contractions, real pauses marked "…", never
uniform speed. A line that narrates what the picture already shows gets cut.

---

## 1 · THE EMPTY SUITE — 20 s · 9:16 (16:9 compose available)

**One line:** the suite at 6:40 a.m., set and silent, then the same rail at 2:52 p.m. when 17 goes off.
**Mechanism:** before/after by time, one location. **Memory test:** "the empty suite with the ice already in the bucket."

| Time | Picture | Source | Text / VO | Sound |
|---|---|---|---|---|
| 0.0–2.5 | Suite door sign in dawn light, nobody there | REAL V23 2.4–4.6 | **6:40 a.m.** | birds, a mower far off |
| 2.5–5.0 | Inside: the TripNerd wall, chairs squared, TVs dark | REAL owner suite clip (raw needed) or GEN push-in from a real frame (start_image) | **Everything's ready.** | ice poured into a bucket (foley) |
| 5.0–8.0 | Macro: glasses in a row, a lemon wheel, the first pour | GEN macro, no readable hands, ≤ 3 s | — | the pour, one clink |
| 8.0–11.0 | The rail, empty chairs, the island green beyond | REAL balcony clip from the owner's cut, or P082 as start_image | **Row: none.** | wind in the flag |
| 11.0–11.5 | Black | — | — | a putter's click |
| 11.5–15.0 | Same rail, packed, the roar | REAL V24 13.4–16.4 (or g3 from P013, backs) | **2:52 p.m.** | THE ROAR (V08 layered) |
| 15.0–17.0 | Guests at the rail, backs, cups up | REAL V23 51.4–53.4 | **You just have to show up.** | roar settling |
| 17.0–20.0 | End card | COMP | VO: "Hospitality. … Handled." | bed fades |

**Production (Higgsfield):** two generated shots at most (the empties and the macro pour), both things the
models do well; everything else real. Realism rides on the raw suite clips. **Flags:** V23 door sign mark;
consent for any face in V23/V24; disclosure. **ESTIMATE:** 2–4 generations.

---

## 2 · THE TEXT — 18 s · 9:16

**One line:** a host texts a client the four words that end the conversation.
**Mechanism:** a device (typed message thread) — composited type, never model text. **Memory test:** "the '…the 17 seventeen?' reply."

| Time | Picture | Source | Text / VO | Sound |
|---|---|---|---|---|
| 0.0–4.0 | Phone thread, full frame. Host types: **Got us the suite on 17 Saturday. Don't make plans.** | COMP UI | — | keys, send whoosh |
| 4.0–7.0 | Reply bubble: **…the 17 seventeen?** Host: **Yeah.** | COMP UI | — | silence, then a crowd far away rising under |
| 7.0–12.0 | Suite door sign → walk-in → the rail | REAL V23 2.4 · EXISTS w0 · REAL V23 51.4 | — | ambience up |
| 12.0–15.0 | The roar; backs rise, cups up | REAL V24 13.4 · EXISTS g1 (≤ 2.3 s) | — | THE ROAR |
| 15.0–18.0 | End card | COMP | VO: "Bring the people who deserve it. … Talk to a Nerd." | bed out |

**Production:** the UI is built in the sandbox (Pillow/ffmpeg), zero generation; the body is real plus one
existing clip. **Compliance:** a fictional invitation, not a review or endorsement — the host praises nothing;
the reply is a question. **Flags:** the "Saturday" word is fine; no date, no price. **ESTIMATE:** 0–1 generations.

---

## 3 · ROW 58 — 20 s · 9:16 — *the owner's approved hook (brief: "a man visibly unhappy with where he's sitting → where TripNerd seats him")*

**One line:** Row 58 versus no row at all.
**Mechanism:** seat contrast. **Memory test:** "Row 58 / Row: none."

| Time | Picture | Source | Text / VO | Sound |
|---|---|---|---|---|
| 0.0–3.0 | From behind: a man in a high, far seat, the green a postage stamp below, shoulders down | GEN (Nano Banana still → Kling start_image), back of head only, ≤ 3 s, generic venue | **Row 58.** | wind, PA echo |
| 3.0–5.0 | His hand around a warm cup, foam gone | GEN macro, hand at rest | **Can't see the flag.** | — |
| 5.0–5.5 | Black | — | — | putter click |
| 5.5–10.0 | The seat's view from the suite rail over 17 | REAL balcony clip (preferred) or EXISTS frame 2 | **Row: none.** | flag snapping, hush |
| 10.0–14.0 | The roar; the rail crowd rises | REAL V24 13.4 · EXISTS g3 | — | THE ROAR |
| 14.0–17.0 | Guests laughing inside | REAL V23 41.2–43.2 (consent) | — | roar into laughter |
| 17.0–20.0 | End card | COMP | VO: "Where you sit … is the whole story. Talk to a Nerd." | — |

**Production:** the one generated person is a back of a head and a hand — inside the strengths. **Risk:**
the owner already found the generated seat's-view "fake"; use the real balcony clip for 5.5–10.0 and this
script is safe. **ESTIMATE:** 2–3 generations.

---

## 4 · THE LIST — 30 s · 16:9 (9:16 recompose)

**One line:** the host's to-do list, struck through one item at a time by the real thing happening.
**Mechanism:** demonstration (real). **Memory test:** "the list crossing itself out."

| Time | Picture | Source | Text / VO | Sound |
|---|---|---|---|---|
| 0.0–3.0 | Black; a cursor types **Tickets** | COMP | — | keys |
| 3.0–6.0 | **Hotel · Transfers · Bar · Food · Who sits where** stack up, faster | COMP | — | keys accelerating; a sigh |
| 6.0–8.0 | The list freezes | — | VO: "Or…" | silence |
| 8.0–11.0 | Check-in table, the drape, staff at work — push-in | REAL IMG_1901 (staff consent) | **Tickets** strikes through | room tone, a laugh off-mic |
| 11.0–14.0 | The porch bar, course behind, the bartender pours | REAL IMG_1932 (start_image, small motion) | **Bar** strikes | pour, ice |
| 14.0–17.0 | Tent buffet in sun; dessert table | REAL IMG_2034 · IMG_1998 | **Food** strikes | — |
| 17.0–20.0 | Suite door sign, walk-in | REAL V23 2.4 · EXISTS w0 | **Hotel · Transfers** strike *(only if the package includes them — UNKNOWN)* | — |
| 20.0–24.0 | The rail over 17, the roar | REAL V24 | **Who sits where** strikes → **Handled.** | THE ROAR |
| 24.0–27.0 | Guests at the rail | REAL V23 51.4 | VO: "You bring the people. … We do the rest." | — |
| 27.0–30.0 | End card | COMP | — | — |

**Production:** almost no generation — four real photos with motion, real video, typed text. **Flags:** every
struck word is a claim about what the package includes → needs the package sheet as an Evidence Record before
it ships; the house and the suite are different venues, so the film says "tournament week" and never one day.
**ESTIMATE:** 0–2 generations.

---

## 5 · THE ROAR — 15 s · 9:16

**One line:** eleven seconds of sound, one second of picture, and you know where you want to be.
**Mechanism:** audio-first hook. **Memory test:** "the ad that was black until the roar."

| Time | Picture | Source | Text / VO | Sound |
|---|---|---|---|---|
| 0.0–4.0 | Black | — | **Sound on.** (small, top) | birds, ice in a glass, low murmur, a hushed commentator line (existing Barrett preset) |
| 4.0–5.0 | Black | — | — | the putt: a click, then 0.6 s of nothing |
| 5.0–7.3 | Picture snaps on: the balcony erupting, backs | EXISTS g1 (P085) | — | THE ROAR (V08) |
| 7.3–11.0 | The rail, real, the roar still going | REAL V24 13.4–16.4 | **You'll know when it happens.** | roar |
| 11.0–13.0 | Guests at the rail, cups up | REAL V23 51.4 | **Be where it happens.** | roar settling |
| 13.0–15.0 | End card | COMP | — | bed out |

**Production:** the cheapest film here; one existing clip, two real ones. **Risk:** feeds default to sound
off — the "Sound on." cue and the two captions carry it; test a captioned variant with a waveform line.
**ESTIMATE:** 0–1 generations.

---

## 6 · YOUR PEOPLE — 30 s · 16:9 (the corporate lane)

**One line:** a roll call of the people worth bringing, each one answered by a real frame.
**Mechanism:** second-person roll call. **Memory test:** "Your dad."

VO (warm, unhurried, a pause after every name):
> "The client you've been chasing for a year. … The two who hit the number. … Your brother-in-law, who has not shut up about this place. … Your dad."
> (over the roar, quieter) "Bring your people. … We'll handle the rest."

| Time | Picture | Source |
|---|---|---|
| 0.0–4.0 | Lawn group from behind, grill smoke, the fence and pines | REAL IMG_2036 (Ken Burns) |
| 4.0–8.0 | The porch bar, course behind, golden light | REAL IMG_1915 (pull-out) |
| 8.0–12.0 | Tent buffet, flowers | REAL IMG_2034 |
| 12.0–16.0 | Guests laughing inside the suite | REAL V23 41.2–43.2 (consent) |
| 16.0–20.0 | "Your dad." → two backs at the rail, the green beyond | REAL V23 51.4 / P082 |
| 20.0–24.0 | The roar | REAL V24 13.4 |
| 24.0–27.0 | Guests at the rail | REAL V23 |
| 27.0–30.0 | End card | COMP |

**Production:** photo motion and real video only; the VO is the film. **Flags:** consent for every face; the
brother-in-law line is a tone choice for the owner. Mixes the house and the suite → "tournament week" framing.
**ESTIMATE:** 0 generations (VO via seed_audio or a human read).

---

## 7 · SAME PUTT — 20 s · 9:16 split (top/bottom)

**One line:** the same putt on a bar TV and from the rail; only one of them shakes the frame.
**Mechanism:** simultaneous contrast. **Memory test:** "the split screen where the bottom half shook."

| Time | Top half | Bottom half | Source | Text | Sound |
|---|---|---|---|---|---|
| 0.0–3.0 | A bar TV, golf on, hands and a glass, screen unreadable | The real balcony view over 17 | GEN top (≤ 3 s) · REAL bottom | **Same putt.** | bar murmur / live hush |
| 3.0–8.0 | The stroke, tiny on the screen | The gallery holding its breath | GEN top · REAL V24 10.0–11.2 | — | tinny TV / real silence |
| 8.0–10.0 | A small "yes" off-screen | THE ROAR | SFX · REAL V24 13.4 | — | thin vs full |
| 10.0–14.0 | — (bottom takes the frame) | Rail crowd, guests | EXISTS g3 · REAL V23 | **Different seat.** | roar |
| 14.0–17.0 | — | Guests at the rail | REAL V23 51.4 | **Hospitality. Handled.** | — |
| 17.0–20.0 | End card | | COMP | — | — |

**Production:** the split is an ffmpeg job; the TV must show an unreadable, generic screen (broadcast
rights) — a defocused screen is the honest version. **Risk:** timing the two halves to one putt is
editorial work, not generation. **ESTIMATE:** 1–2 generations.

---

## 8 · TALK TO A NERD — 15 s · 9:16 · motion graphics

**One line:** the nerd tells you three things and where to click.
**Mechanism:** brand device (the mascot). **Memory test:** "the nerd head that peeked in."

| Time | Picture | Source | Text |
|---|---|---|---|
| 0.0–2.0 | Brand-blue field; the nerd-head mark slides in from the edge (the real file moved, never redrawn) | COMP | — |
| 2.0–5.0 | The drone orbit of the 17th behind a card | EXISTS | **You know the hole.** |
| 5.0–8.0 | The rail view | REAL balcony clip | **You've never sat here.** |
| 8.0–11.0 | Check-in table · bar · buffet, three quick pushes | REAL IMG_1901 · 1915 · 2034 | **Bar. Chef. Your name at the door.** *(package facts — UNKNOWN, confirm)* |
| 11.0–13.0 | The mark settles by the CTA | COMP | **Talk to a Nerd.** |
| 13.0–15.0 | URL card | COMP | tripnerd.com |

**Production:** built entirely in the sandbox; zero realism risk; zero new generation. **Weakness:** the least
emotional of the ten — a retargeting or follow-up unit, not the opener. **ESTIMATE:** 0 generations.

---

## 9 · DAY ONE, DAY TWO, DAY THREE — 30 s · 16:9 (the house product, unnamed tournament week)

**One line:** three days at a TripNerd house beside the course, told in day cards and nothing else.
**Mechanism:** journey in chapters. **Memory test:** "Day Three: the bar with the course behind it at six o'clock."

| Time | Picture | Source | Text | Sound |
|---|---|---|---|---|
| 0.0–4.6 | Sunrise drive-up through the pines | EXISTS d81 / c11 | **Day One.** | tyres on gravel, birds |
| 4.6–8.0 | The check-in table, the drape, staff | REAL IMG_1901 · IMG_1917 (badge cropped) | — | a "morning" off-mic |
| 8.0–11.0 | Lanyards on the table, macro | REAL IMG_1917 crop (no badge) or GEN plain lanyard with the real logo composited | — | — |
| 11.0–15.0 | The porch bar being set, bottles, the course behind | REAL IMG_1915 (pull-out) | **Day Two.** | ice, glass |
| 15.0–18.0 | Tent buffet in sun; dessert table | REAL IMG_2034 · IMG_1998 | — | — |
| 18.0–22.0 | Lawn group from behind with drinks, grill | REAL IMG_2036 | **Day Three.** | murmur, a laugh |
| 22.0–25.0 | The bar at golden hour, the bartender's real smile | REAL IMG_1932 (small motion) | — | a roar rolls in from the course (V08, distant) |
| 25.0–27.0 | Backs turn toward the course | REAL IMG_2033 (Ken Burns) | VO: "Tournament week. … Handled." | roar |
| 27.0–30.0 | End card | COMP | — | — |

**Production:** almost entirely real photos with motion; one existing clip; one optional macro. **Flag:** this
sells the house product and says "tournament week" only — it must never cut to the TPC Sawgrass suite, which is
a different event. **ESTIMATE:** 0–1 generations.

---

## 10 · ONE PUTT — 15 s · 9:16 (rebuilt from assets that exist)

**One line:** the 17th-hole spine at its shortest.
**Mechanism:** the putt as payoff. **Memory test:** "the ball on the lip."

| Time | Picture | Source | Text | Sound |
|---|---|---|---|---|
| 0.0–3.0 | Drone orbit of the island green | EXISTS | **You know this hole.** | wind, murmur |
| 3.0–5.0 | Putter face behind the ball | EXISTS g10 / s03 | — | hush |
| 5.0–8.0 | Stroke from behind the hole | EXISTS g6 / s05 | — | click |
| 8.0–10.0 | Ball catches the lip, drops | EXISTS g7 / b1 | — | rattle |
| 10.0–12.0 | The roar | REAL V24 13.4 | — | THE ROAR |
| 12.0–13.5 | The balcony rises, backs | EXISTS g1 | **You've never sat here.** | roar |
| 13.5–15.0 | End card | COMP | **Talk to a Nerd.** | — |

**Production:** zero new generation; every generated shot ≤ 3 s and cut on sound. **Risk:** these are the shots
the owner has called "fake" at length; at this cut rate they read as inserts, but the owner has to watch it.
**ESTIMATE:** 0 generations.

---

## The top three for Higgsfield (quality · realism · flow)

Scored 1–5 on what Higgsfield's current models can deliver (image-to-video from real frames and macro
empties are reliable; generated people at readable distance are not), on how much of the film is real, and
on whether the cut flows as one piece.

| Rank | Script | Quality | Realism | Flow | Generations (ESTIMATE) | Why |
|---|---|---|---|---|---|---|
| **1** | **1 · The Empty Suite** | 5 | 5 | 5 | 2–4 | One location, one time jump, the real roar as the hinge; the only generated shots are empties and a pour, which the models do best. Needs the raw suite clips. |
| **2** | **5 · The Roar** | 4 | 5 | 5 | 0–1 | Sound does the work; picture is real plus one existing clip. Cheapest strong film. Sound-off risk handled by captions. |
| **3** | **9 · Day One, Day Two, Day Three** | 4 | 5 | 4 | 0–1 | Built from the best real photos with motion, no generated people; sells the house product honestly. Flow depends on the day cards and the bed. |

**Runner-up:** 3 · Row 58 — the owner's approved hook, one generated back-of-head; safe only with the real
balcony clip in the payoff. **Cheapest to test first:** 5, 8, 10 (no spend). **Strategically strongest for
the corporate lane:** 6 · Your People (needs guest consent or it is backs only, as written).

## What would materially change these scripts

1. Which product the campaign is for: the suite on 17, the tournament-week house, or both (the photos are one, the videos the other).
2. Guest consent: which groups have signed. Without it every people shot stays backs and profiles, as written.
3. The package sheet (what is included) — it decides the words in 4 and 8 and the "VIP" question everywhere.
4. Format first: 9:16 or 16:9. Your last two were 16:9; the 17th-hole work is 9:16.
5. The raw suite clips and the 25-video library at full resolution (or `Catalog.csv`) — the single biggest lever on the quality score.
