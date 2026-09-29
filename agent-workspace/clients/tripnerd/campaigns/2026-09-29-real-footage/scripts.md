---
title: "TripNerd — five scripts built on real client footage"
type: scripts
client: tripnerd
campaign_id: 2026-09-29-real-footage
owner: Karl
status: DRAFT (awaiting the owner's pick)
created: 2026-09-29
updated: 2026-09-29
tags: [campaign, scripts, real-footage, 9x16]
---

# Five scripts, real footage first

**Rules every script follows**
- Every picture is TripNerd's own footage (`footage-log.md`). AI is used only for minor fixes:
  - upscaling the low-resolution clips;
  - cleanup;
  - reframing;
  - removing a burned-in caption.
- No generated people, no generated venue, no synthetic voice.
- **Master format:** 9:16, 1080x1920, 24 fps. From it we cut a 4:5 for the Meta feed and a 15 s version.
  - All the footage is vertical.
  - Meta, TikTok and YouTube Shorts guidance all favour native 9:16, the key message in the first 3 s, and burned-in captions.
- **Sound:** real audio only. The suite ambience comes from V23 and the roar from V24. V08 is used if the owner supplies it.
  - **Voice:** no voice-over by default; the captions carry the words. If a voice is wanted, a real person records it on a phone (Wyatt or the owner, about 10 minutes).
- **End card:** composited from the real logo file (`46ae277a`): "Hospitality. Handled." / **Talk to a Nerd** / tripnerd.com. The old card's "Request VIP package details" line is not used ("VIP" has no evidence behind it).
- **Marks and faces:**
  - THE PLAYERS, the scoreboard, player names and broadcast TVs are cropped out.
  - Guest faces appear only with consent. Every default beat below uses backs, wides or crowds.
- **Timecodes** below are film time. The **Source** column gives the clip and its source seconds.

---

## 1 · SAME HOLE — 25 s (15 s cutdown)

**One line:** the same 17th two ways: squeezed in the crowd, or at the rail above it.
**Memory line:** "Same hole. Different day."
**Why it should work:** everyone who has been to 17 remembers the crush. The contrast shows what the money buys (the door, the shade, the food, the rail, the view) without a single claim, and the footage proves it because both halves are real and from the same day.

| Time | Picture | Source | Text on screen | Sound |
|---|---|---|---|---|
| 0.0–3.0 | Shoulder to shoulder in the public gallery, walking | Gallery walk 1 `e037067e` 0.0–3.0 | **How most people see 17.** | the crowd, close and loud (its own audio) |
| 3.0–5.0 | The camera tilts up from the crowd to the suites above it | Gallery 2 `2585923a` 14.0–16.6 | small TripNerd logo appears top-left | crowd |
| 5.0–7.0 | **Hard cut:** through the suite's glass doors | V23 0.5–2.5 | **How you could.** | the crowd drops away; suite ambience |
| 7.0–8.5 | The TripNerd logo wall | V23 6.3–7.8 | — | ambience |
| 8.5–10.5 | The buffet counter, the lamps (TV cropped out) | V23 16.0–18.0 | — | a plate, cutlery (V23) |
| 10.5–16.5 | Out to the rail: the island green and the packed gallery below | V23 25.0–31.0 | — | wind, far gallery |
| 16.5–20.5 | The green from the suite, the gallery erupts, arms up | V24 14.0–18.0 | **Same hole.** | THE ROAR (V24 12.5–) |
| 20.5–22.0 | Guests at the tables watching the green, from behind | V23 48.5–50.0 | **Different day.** | roar tail |
| 22.0–25.0 | End card | COMP | Hospitality. Handled. · Talk to a Nerd · tripnerd.com | near silence |

**15 s cutdown:** 0–2.5 gallery · 2.5–4 doors · 4–8.5 the rail · 8.5–11.5 roar · 11.5–15 card.
**Minor AI fixes:**
- Upscale the three gallery shots (404x720) and V23/V24 (720p), unless the originals arrive.
- Stabilise the gallery walk (ffmpeg, not AI).

**Risk:** the gallery clips are the softest footage on file. That is acceptable for the "crowd" half, because rough phone footage reads as the crowd, but it must not be worse than the suite half.

---

## 2 · POV: YOU BOOKED IT — 30 s (15 s cutdown)

**One line:** one continuous first-person walk from the door to the rail, cut like a guest's own Reel.
**Memory line:** "the walk from the door to the rail."
**Why it should work:**
- It is the most native format on Reels and TikTok, and the most obviously real.
- It opens on the strongest frame, the rail over the island green, for 1.5 s.
- Then it rewinds to the door and makes the viewer walk there.

| Time | Picture | Source | Text on screen | Sound |
|---|---|---|---|---|
| 0.0–1.5 | Flash-forward: at the rail, the island green, the packed gallery | V23 31.0–32.5 | **POV: you're the one who booked it.** | a roar sting (V24) |
| 1.5–3.5 | Through the glass doors | V23 0.5–2.5 | **Walk in.** | door, ambience |
| 3.5–5.5 | The TRIPNERD banner (the TripNerd half), then the logo wall | V23 4.8–5.8 + 6.3–7.3 | — | ambience |
| 5.5–9.0 | The suite, guests heading out (speed-ramped 1.5x) | V23 8.5–13.5 | — | chatter bed, no words |
| 9.0–11.5 | The buffet counter (TV cropped) | V23 16.0–18.5 | **Grab a plate.** ⚠ | ambience |
| 11.5–14.0 | Through to the balcony opening | V23 21.5–24.0 | — | the gallery rising in the distance |
| 14.0–21.0 | Out to the rail: the reveal of the green | V23 24.5–31.5 | **Then this.** | wind, gallery |
| 21.0–25.5 | The gallery erupts below | V24 14.0–18.5 | — | THE ROAR |
| 25.5–26.5 | Guests at the tables, from behind | V23 49.0–50.0 | — | roar tail |
| 26.5–30.0 | End card | COMP | Hospitality. Handled. · Talk to a Nerd | — |

⚠ **"Grab a plate"** implies food is included. Keep it only if the package sheet confirms that; otherwise leave the beat without text.
**Minor AI fixes:** upscale V23 and V24; crop the THE PLAYERS half of the banner and the TVs.
**Upgrade:** if the faces are consented, add guests laughing (V23 41.5–43.5) as a 1 s beat after the roar. Real faces laughing are the strongest proof of the experience, and the one thing this cut lacks without them.

---

## 3 · NEXT YEAR — 25 s (15 s cutdown)

**One line:** a group chat that has said "next year" for three years; then someone books it.
**Memory line:** "Stop saying next year."
**Why it should work:**
- The text-thread hook is readable in about 1 s, and everyone has this group chat.
- It turns TripNerd's year-out buying cycle into the reason to act now.
- The line "Stop saying next year" comes from an August spec ad already on file (`e7a5df33`, generated). This script rebuilds it with real footage.

| Time | Picture | Source | Text on screen | Sound |
|---|---|---|---|---|
| 0.0–3.5 | A phone thread, composited (real UI, no AI), over the gallery crowd blurred behind it. It reads: *"17 next year?"* · *"next year for sure"* · *"ok NEXT year"*, each stamped with the year | COMP over `2585923a` 0.0–3.5 | the thread | message pops |
| 3.5–5.0 | A new bubble: **"Booked it. Suite on 17."** | COMP | — | send whoosh |
| 5.0–7.0 | Through the glass doors | V23 0.5–2.5 | — | ambience |
| 7.0–8.5 | The logo wall | V23 6.3–7.8 | — | ambience |
| 8.5–15.0 | Out to the rail, the island green | V23 25.0–31.5 | — | wind, gallery |
| 15.0–19.0 | The gallery erupts | V24 14.0–18.0 | — | THE ROAR |
| 19.0–21.0 | Guests at the tables, from behind | V23 48.5–50.5 | **Stop saying next year.** | roar tail |
| 21.0–25.0 | End card | COMP | Talk to a Nerd · tripnerd.com | — |

**Compliance:** the thread is a dramatisation, not a customer review. Nobody is presented as a real customer, and no names or photos appear in the thread.
**Risk:** if the owner saw the August spec and disliked it, this line carries that baggage. Ask before building.

---

## 4 · CLIENT DAY — 30 s (the corporate lane)

**One line:** the host's to-do list for a client day at 17, ticking itself off as the real day happens.
**Memory line:** "the to-do list that ticks itself."
**Why it should work:** it speaks to the higher-ticket buyer, the company hosting clients or a team. It demonstrates the handling instead of claiming it.

| Time | Picture | Source | Text on screen | Sound |
|---|---|---|---|---|
| 0.0–2.5 | The packed gallery | `2585923a` 0.0–2.5 | **Taking 8 clients to 17?** | crowd |
| 2.5–5.0 | The gallery walk | `e037067e` 0.0–2.5 | a list types itself: Tickets · Shade · Food · Drinks · A view | keys |
| 5.0–7.0 | Through the doors | V23 0.5–2.5 | Tickets ✓ ⚠ | ambience |
| 7.0–9.0 | The covered suite interior | V23 9.0–11.0 | Shade ✓ | ambience |
| 9.0–11.5 | The buffet counter | V23 16.0–18.5 | Food ✓ ⚠ | plates |
| 11.5–13.0 | A drinks shot | **gap:** no clean real drinks shot without faces (V23 44.5 has one, but with a face) | Drinks ✓ ⚠ | pour |
| 13.0–19.0 | Out to the rail, the view | V23 25.0–31.0 | A view ✓ | wind |
| 19.0–23.0 | The gallery erupts | V24 14.0–18.0 | The moment ✓ | THE ROAR |
| 23.0–26.0 | Guests at the tables, from behind | V23 48.5–51.5 | **You just host.** | roar tail |
| 26.0–30.0 | End card | COMP | Hospitality. Handled. · Talk to a Nerd | — |

⚠ **Every tick is a claim about the package.** This script cannot ship until TripNerd confirms what is included, and it needs a real drinks shot (or a consented V23 44.5).

---

## 5 · WAIT FOR IT — 20 s (sound-first)

**One line:** the held breath, then the roar, and only then the reveal of where you were standing.
**Memory line:** "wait for it… the roar."

| Time | Picture | Source | Text on screen | Sound |
|---|---|---|---|---|
| 0.0–3.0 | Backs of two guests at the rail, 17 below | V24 0.2–2.2 | **Sound on. Wait for it.** | clean murmur (V24 0–3.8) |
| 3.0–6.0 | Wide from the rail | V23 30.0–33.0 | **Everybody's holding their breath.** | the hush (V24 10.2–12.5) |
| 6.0–10.0 | The gallery erupts | V24 13.0–17.0 | — | THE ROAR |
| 10.0–13.0 | A guest at the rail, hand to her head | V23 27.5–30.5 | — | roar |
| 13.0–16.0 | Guests at the tables, from behind | V23 48.5–51.5 | **Now hear it from here.** | roar tail |
| 16.0–20.0 | End card | COMP | Talk to a Nerd | — |

**Weakness:** it depends on sound, and Meta feeds start muted. The payoff shot is the softest in the set: V24, 720p and zoomed.

---

# My ranking (ESTIMATE: my judgment, not performance data)

| Rank | Script | Score /10 | Why |
|---|---|---|---|
| **1** | **SAME HOLE** | **8.5** | Strongest problem→solution contrast, clearest value in 5 s, and every frame is real. The one risk is the soft gallery clips |
| **2** | **POV: YOU BOOKED IT** | **8.0** | The most native and believable format; opens on the best frame. Gets its most emotional beat only if guest faces are consented |
| **3** | **NEXT YEAR** | **7.5** | The best written hook, tied to the year-out buying window. The thread is composited rather than footage, and the line's August history is unknown |
| 4 | CLIENT DAY | 7.0 | The best fit for the highest-value buyer, but blocked until the package sheet confirms every tick |
| 5 | WAIT FOR IT | 6.5 | Depends on sound; the payoff shot is the weakest footage |

**Build recommendation:**
- Scripts 1, 2 and 3 share the same body (doors → logo → rail → roar → card); only the first 3–5 s differ.
- Build the body once, cut the three openings, and run them as a hook test on paid social. That tests which opening wins with real money, instead of choosing by taste.
- Cost: no generation spend beyond upscaling (priced at routing time).
