# Phoenix pack: Step 1 blind analysis (Grok)

**Two rules from the pack are overridden by Wyatt:**
1. **Faces are cleared.** Jason (TripNerd CEO) has approved faces in all real TripNerd footage given to ServicePOW. The only face flag left is identifiable pro athletes in *paid* use.
2. **No blurring.** Marks are removed by cropping, reframing or trimming. Anything that can't be removed that way is flagged.

TripNerd's own banned words also apply: VIP, exclusive, owns, private, handled, best, number-one, guaranteed, "DM us", "send this to…", tag-a-friend, and "Book now" unless confirmed. Cards are 6 words max. Event names stay in the caption only. Photos are static, with no AI upscaling.

## 1. Asset labels

| ID | What it shows (literal) | Job | Quality | Marks | Faces / likeness | Date / place evidence | Verdict |
|---|---|---|---|---|---|---|---|
| P01 | 16th green from high up under a cloudy sky; scoreboard with 3 player headshots; giant turf "WM" | none | Weak: 958×1704 at 144 dpi, the only file with EXIF. A screenshot, not a camera original | Turf WM, scoreboard (#ThePeoplesOpen + WM), FedEx and WM wall | Pro headshots on the board | Cloudy, unlike the other 16th shots, so likely a different session | **EXCLUDE**. Too many marks to crop, and it's a screenshot |
| P02 | 4 men at the skybox rail. Grey-polo guest smiling, hand on chest; cactus-shirt guest seen from behind; green below | proof | Good | WM on the wall at head height, Nike swoosh on the polo, RECYCLE boards, part of the turf WM | Guests (cleared) | None | **BACKUP**. The only smile in the set, but the wall logo and swoosh can't be cropped out |
| P03 | Portrait of the same group and moment as P04 | none | Good | 2 big WM boards, turf WM, FedEx | Guests | None | **EXCLUDE**. Near-duplicate of P04 and full of marks |
| P04 | Landscape of the same scene | none | Good | Boards, turf WM, FedEx, Nike | Guests | "16" tower sign | **EXCLUDE**. Duplicate, can't be cropped clean |
| P05 | 3 men at the rail with a drink, under a canopy and pillar | context | Good | "Supporting communities" boards with WM, turf WM, FedEx | Guests | None | **BACKUP**. Marks run through the frame |
| P06 | Resort patio breakfast: mugs, palms, pool, sun flare | context | Good | None legible | None | None, nothing ties it to the event or our hotel | **BACKUP**. Mood only; can't be labelled as our hotel |
| P07 | Fans walking into a PGA TOUR Fan Shop tent, with a Phoenix Open clock | none | Good | Logos everywhere | Backs | Event logo only | **EXCLUDE**. It's a sponsor tent |
| P08 | Portrait: guests in a different skybox (dark roof) standing at the rail over the green | proof | Good | Scoreboard ad "best seats… 2025 WM Phoenix Open", wall logos, "CH…" cap, a red/black/white striped banner (no legible mark) | Guests | The board's "2025" is an ad for next year, **not** the capture year | **USE WITH FIXES**. 4:5 crop at x380–1260, y900–2000 removes the board, wall and cap |
| P09 | Landscape of the same people and moment as P08 | proof doc | Good | "WELCOME TO THE 2024 WM PHOENIX OPEN" board, wall logos | Guests | **The only year proof in the set: 2024** | **BACKUP**. Keep it as evidence, not on screen |
| P10 | Augusta National clubhouse with an eclipse multi-exposure composite | none | Edited composite, not iPhone | Augusta itself | None | Wrong event | **EXCLUDE**. Doesn't belong and isn't a real single photo |
| V01 | 0.0–2.0 s: skybox POV past a canopy pillar, guest in sunglasses. 2.0–4.2: pan over the stands and desert. 4.5+: green, turf WM, scoreboard, "16" | hook | Good, steady | Wall WM and FedEx run through every frame (y≈955–1050 on a 1920 frame); turf WM and board from 4.5 s | Guests | "16" sign. Light is midday and clear | **USE WITH FIXES**. Trim to 0.0–4.2; the wall band is flagged |
| V02 | The same pan as V01 from about V01's 1.5 s mark, taken separately (different audio, 24 fps) | none | Good | Same as V01; turf WM from 4.0 s | Crowd | None | **BACKUP**. Redundant with V01 |
| V03 | 0–2.0: scoreboard (SPIETH / HOFFMAN / KITAYAMA) and "16". 2.3–8.2: pro in a blue top plays a bunker shot (strike at about 2.4–2.6), then watches | proof / payoff | Good, a slight digital zoom | Scoreboard, "16", FedEx and WM wall in the top third (y≈290–745) | Pro is distant, face soft; names are on the board | Board names are a lead to check externally, not on screen | **USE WITH FIXES**. In at ≥2.3 s; the wall band is flagged |
| V04 | A different hole: pro chips from the rough by the gallery rope (strike at about 7.9–8.0). The ball rolls past the pin and stops about a foot away (10.4–11.6). Crowd reacts | hook | Shaky handheld; 3.0–5.0 shows feet, a tree and empty cans | Player cap and chest logos, cans (trim), media bib at 14.5+ | **Pro identifiable** at 1.0–2.5, 5.5–7.5 and 14.5–17.3 | Late low sun and clouds, so a different time or day. Not the 16th | **USE WITH FIXES**. Use only 8.6–12.2 (ball and roar, no player, no signage) |

**Audio** (RMS per 0.5 s): there is no big roar or ace anywhere.
- V01: flat around −22 dB, with a mild swell at 8.0–10.0 (−16 dB) that matches no visible event.
- V02: flat.
- V03: strike spike at 2.4 s, then a swell of about +6 dB at 4.5–7.5. The ball's result can't be read at 720p.
- V04: the only real reaction, peaking at −3 dBFS at 10.5–11.2 as the ball slides past the pin.

**V04 GPS:** 33.6419, −111.9212 is about 0.83 km (0.5 mi) northwest of the 16th-hole coordinates. The frames show play inside the ropes, with homes and a Spanish-style building behind, so it is **on the course, not a hotel or parking lot**. I can't prove which hole from the media.

## 2. Problems with the set
- **Under no-blur plus no-marks, no 16th-hole wide shot is clean.** The wall logos sit across the middle of every V01, V02 and V03 frame. Cropping a 720p vertical file means a soft zoom. The only fix that isn't a blur is to place each text card as a solid panel over the wall band. That is still masking, so **Wyatt needs to approve it**, or we get cleaner footage.
- Duplicates: V01/V02, P03/P04, P08/P09.
- P10 is Augusta and a composite. P01 is a screenshot.
- **Year trap:** P08's "2025" is a ticket ad. P09 proves the photos were taken in 2024, and only P08 and P09.
- **V04 isn't the 16th.** Never cut it so it reads as the view from the seat.
- **Two different skyboxes** (P02–P05 vs P08/P09). Which one is TripNerd's is unknown.
- The "embedded GPS" isn't in the delivered files (ffprobe shows encoder tags only), so we're taking it on trust.
- Capture dates are unknown, and lighting differs (V04 and P01 vs the rest).
- No food, service, host or arrival footage. Nothing shows the product beyond a rail view.

## 3. Concepts (edit times; source in/out in brackets)
End card for all: original TripNerd logo, "Talk to a Nerd" and a separate "Link in bio" line. Native audio only, with an optional licensed bed at −18 dB.

**C1: "Almost." (hook on the near-miss)**. A real near-miss stops the scroll, then I pivot to the seat.
- 0.0–3.6 V04 [8.6–12.2]. "Watch the ball." The roar lands at 1.9–2.6, then "Almost." at 2.6.
- 3.6–5.6 V01 [0.0–2.0]. "Now picture this view."
- 5.6–8.6 V03 [2.3–5.3]. "Right above the green." Strike at 5.7, then the swell.
- 8.6–11.6 P08 (static 4:5 crop). "Bring your people."
- 11.6–15.0 End card.
- **Hook:** a moving ball heading at the pin, with a sound-off card.
- **Audience:** golf fans and friend groups.
- **Risk:** the opener isn't the 16th or the suite, so it could read as the view from the seat.

**C2: "Want this seat?" (suite POV)**
- 0.0–2.0 V01 [0.0–2.0]. "Want this seat?"
- 2.0–4.2 V01 [2.0–4.2]. "The whole stadium, right there."
- 4.2–7.7 V03 [2.3–5.8]. "Pros play right below."
- 7.7–10.2 P08 static. "Your group, rail side."
- 10.2–12.2 V03 [5.8–7.8]. "Got questions? Ask a Nerd."
- 12.2–15.5 End card.
- **Hook:** a pillar reveal into the stadium.
- **Audience:** both.
- **Risk:** the opening 2 seconds are slow, with no payoff on the 16th.

**C3: "Host clients here?" (corporate)**
- 0.0–2.5 P08 static. "Hosting clients in February?"
- 2.5–4.5 V01 [0.0–2.0]. "Shade, seats, the green."
- 4.5–8.0 V03 [2.3–5.8]. "Close enough to hear it."
- 8.0–10.2 V01 [2.0–4.2]. "Ask what's included."
- 10.2–13.5 End card.
- **Audience:** corporate hosts.
- **Risk:** a static opener holds poorly, and there's no hosting footage at all.

**C4: "Coffee, then this" (day-in-the-life)**
- 0.0–2.0 P06 static. "Coffee first."
- 2.0–4.5 V01 [0.0–2.5]. "Then this."
- 4.5–7.5 V03 [2.3–5.3]. "Then this."
- 7.5–11.1 V04 [8.6–12.2]. "Then… almost."
- 11.1–13.6 P08. "With your people."
- 13.6–16.6 End card.
- **Audience:** friend groups, built for sends.
- **Risk:** P06 implies a hotel or breakfast is included, which is an unproven package claim. It also mixes holes.

## 4. Ranking
1. **C1**
2. C2
3. C3
4. C4

**Make C1 first.** It holds best: frames 1 to 3 carry the set's only real tension and payoff (the ball sliding past the pin, a −3 dBFS reaction), and it reads with sound off. "Almost." is the moment people send on. The second half moves straight to the suite POV and "Talk to a Nerd" for enquiries.

C2 is the safer product shot but holds worse. C3 serves the corporate audience, but its static opener costs hold. C4 carries claim risk.

## 5. What's missing
1. Clean suite footage that doesn't show the wall: tight guest reactions, food and drink, hosts, the arrival.
2. A real tee shot on the 16th with the crowd roaring, filmed from TripNerd's seats.
3. Confirmation of which skybox is TripNerd's.
4. Written 2027 package contents (seats, food, hotel, transport).
5. Original camera files with EXIF dates and GPS.
6. The hotel's name for P06.
7. Wyatt's decision on solid text panels over the wall band.
8. Athlete clearance before any paid use of V03 or V04.
