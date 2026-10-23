---
title: "Roadtrips' top 3 Reels vs TripNerd's — teardown and build plan"
type: research
client: tripnerd
owner: Karl
status: active
created: 2026-10-06
updated: 2026-10-06
tags: [competitor, roadtrips, instagram, reels, teardown]
---

# Roadtrips' top 3 Reels vs TripNerd's — teardown and build plan

**Method:** public Instagram feed data for @roadtripsinc and @tripnerd pulled in the Higgsfield
sandbox on 2026-10-06 (300 Roadtrips posts scanned → 17 videos). Each Reel downloaded and
watched as contact sheets; cut counts by ffmpeg scene detection; speech by faster-whisper
(tiny.en); loudness by ebur128.

**Limits (read first):** organic play counts only (Instagram counts replays, so short loops
inflate them; if a post was boosted, paid plays may be included — not knowable here). Older
posts have had longer to accumulate plays. n = 3 competitor posts + 1 TripNerd post on small
accounts — this is directional, not proof. Roadtrips' follower count could not be read.

## The numbers

| Reel | Date | Length | Plays | Likes | Comments |
|---|---|---|---|---|---|
| Roadtrips #1 [DAtnRWSSMcP](https://www.instagram.com/reel/DAtnRWSSMcP/) — "Welcome to the Summer Games with Roadtrips" (Paris) | 2024-10-04 | 68.5 s | 3,237 | 64 | 2 |
| Roadtrips #2 [C7efcjTAdBb](https://www.instagram.com/reel/C7efcjTAdBb/) — Monaco Grand Prix guests | 2024-05-27 | 4.0 s | 2,711 | 42 | 0 |
| Roadtrips #3 [DI4MfIrgTn0](https://www.instagram.com/reel/DI4MfIrgTn0/) — brand film "Where your love of travel intersects with your passion for sport" | 2025-04-25 | 55.4 s | 2,121 | 42 | 6 |
| Roadtrips median video (17) | | | 775 | 25 | |
| Roadtrips [DLnBJwfC1iX](https://www.instagram.com/reel/DLnBJwfC1iX/) (stock crowds + event list) | 2025-07-02 | 11.4 s | 461 (14th of 17) | 18 | 0 |
| **TripNerd best ever** [CtWo0F9u_zx](https://www.instagram.com/reel/CtWo0F9u_zx/) — "VIP suite tour", 17th Hole Island Suite | 2023-06-11 | 86.7 s | **7,147** | 40 | 0 |
| TripNerd Sep 26 Reel (host + suite footage, "Hospitality. Handled.") | 2026-09-26 | 25.8 s | 104 | 2 | 0 |
| TripNerd Sep 30 Reel (camera-roll grid) | 2026-09-30 | 25.0 s | 137 | 3 | 1 |

## What each one is

**Roadtrips #1 — "be our guest" documentary (best).** Cinematic real footage of real guests at
the Paris Games: title "Welcome to the Summer Games with Roadtrips" over a street crowd → hotel
arrival → welcome amenities on the bed → hospitality credentials in hand → champagne bar →
hospitality room → stadium (track, basketball) → crowd → breakfast → guest leaving the hotel →
logo. 35 cuts, ~1.9 s average shot, music only, no voice, logo at start and end only. Caption:
"what it means to be our guest".

**Roadtrips #2 — the 4-second loop.** iPhone clips from the Monaco GP: guest looking down at the
track → track → guest with credential → club banner → silhouette at an arched window over the
harbour → two glasses clinking over the view. Music with lyrics. 4 s, so it loops; plays are
inflated by replays.

**Roadtrips #3 — brand film.** Horizontal footage cards on a navy background (not native 9:16),
search-bar motif, narrated: "Imagine a world where travel is more than just a destination… Allow
us to take care of all the details… So, let's go." Most comments of the three (6).

**TripNerd 2023 — raw suite walkthrough.** One continuous phone walk through an empty 17th Hole
Island Suite and out to the rail, with a static "Watch this video!!" box. No edit, no music
design. Still TripNerd's most-played video and 2× Roadtrips' best.

## What the winners share (hypotheses, n is small)
1. **Real place, real guests, real access.** The four best videos (Roadtrips #1, #2, #3's footage,
   TripNerd 2023) show the actual premium space or experience. Stock crowds + event list was
   Roadtrips' 14th of 17.
2. **"What it's like to be there" framing** — POV or documentary, not a sales list.
3. **Music-led, little talking.** Only the brand film has VO.
4. **Logo light** — start/end only.
5. **Short loops collect replays** (#2).
6. **Nobody engineers comments** — 0–6 comments everywhere. Open lane for TripNerd's engagement goal.

## How Claude Code builds the TripNerd versions

| Format | Based on | TripNerd build | Source footage | Claude Code does | Humans supply | Claude Code fit (1–10) |
|---|---|---|---|---|---|---|
| A. "Be our guest" | Roadtrips #1 | 20–30 s cut: arrival → credential → suite → the view → food/drinks → the moment → logo; title "Players week with TripNerd" (event name only as where guests went) | Drive `media/the-players`, `masters-week` | Contact sheets, shot selection, sequencing, cuts to a target BPM, colour match, stabilise, real-logo titles, captions, safe zones, QC harness, isolated critic + Skeptic | Footage access, guest consent, music picked in-app, posting | 8 |
| B. 4-second loops | Roadtrips #2 | 3–5 single-moment loops (toast over the course, credential reveal, doors opening onto the course) | Same | Find loopable moments, seamless loop points, batch variants | Same | 9 |
| C. Suite tour 2.0 | TripNerd 2023 | 30–45 s POV walkthrough, hook naming the place, comment prompt ("Which hole would you pick?") | Existing walkthroughs in the archive, or a new phone walk filmed by a Nerd | Trim, stabilise, hook text, captions, comment-prompt end card | A new walkthrough if the archive has none | 8 |
| D. Brand film with VO | Roadtrips #3 | Not now — needs a real Nerd's voice (no AI voice, TripNerd rule) and is the least native format | — | Script, edit | Real VO | 6 |
| One Text v2 | — | Format A with the text-thread hook | Same | As A | As A | 8 |

**Test plan:** A, B and C posted as Trial Reels (non-followers first); compare 3-second hold,
completion, sends and comments after 72 h; scale the winner. Same Drive share unlocks all three.
