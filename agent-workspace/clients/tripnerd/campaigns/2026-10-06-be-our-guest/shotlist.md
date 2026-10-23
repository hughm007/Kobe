---
title: "TripNerd — Be Our Guest — EDL and footage log (v1.6)"
type: report
client: tripnerd
owner: Karl
status: active
created: 2026-10-06
updated: 2026-10-06
tags: [shotlist, edl, footage-log]
---

# EDL — v1.6 (16.2 s · 9:16 · 1080×1920 · 24 fps) — owner: "feels rushed" → longer, even beats

Two payoff variants, identical except the panel's first line: **A** "TripNerd's got the best spot." · **B** "This is TripNerd's spot."

| # | Master time | Source (Drive) | In–out (s) | Picture | Super | Conformed sha256 (clip gate PASS) |
|---|---|---|---|---|---|---|
| 1 | 0.0–3.6 | TN_2026-03-14_the-players_V24 | 13.6–17.2 | The 17th erupts as the ball stops by the pin; 1.15× punch-in anchored top-right (drops the foreground head) | POV: you're TripNerd's guest at The Players (0–2.0) → THE 17TH (2.3–3.6) | 989b6bde… |
| 2 | 3.6–4.5 | TN_2026-03-12_the-players_V23 | 18.65–19.55 | TripNerd logo wall + counter | THE SUITE (in) | 9f82afa6… |
| 3 | 4.5–6.6 | V23 | 48.6–50.7 | Guests on the suite's covered balcony (no TV, cans, event cups) | THE SUITE (holds, out) | e551e75c… |
| 4 | 6.6–9.8 | V23 | 24.5–27.7 | Door-to-balcony reveal: island green (1.12× punch-in) | THE VIEW | 5a4b0592… |
| 5 | 9.8–13.2 | V23 | 50.7–54.1 | Guests at the rail table over the course | A or B line / Where would you sit — rail or table? / Tell us below. | c14434e2… |
| 6 | 13.2–16.2 | V24 | 9.0–12.0 | Through the suite windows under navy scrim | End card: wordmark · Be our guest. · 2027 packages: link in bio | fa76455e… |

v1.5 → v1.6: beats 3.2/0.9+1.3/2.4/4.2/3.0 → 3.6/0.9+2.1/3.2/3.4/3.0 s; suite-guest shot V23 40.4–41.7 (legible "THE PLAYERS"
cups, Michelob ULTRA can, hat band — both v1.5-B gates) replaced by V23 48.6–50.7; panel starts after the walk-past; bed V07 0–16.2 s.

Audio: each shot's own location sound (high-pass 100 Hz) with a 0.3 s tail under the next shot (the hook's roar 0.6 s, as
an L-cut); continuous crowd bed from V07 0.5–15.5 s (TripNerd's 2024 footage from the 17th walkway; ASR speech-free) at
−23 vs −21 LUFS body; one measured static gain (+1.2 dB) to −16 LUFS + limiter (−2.5 dBTP); 0.8 s fade at the end. Ships
with ORIGINAL AUDIO.

Changed vs v1.4a (gate findings → fix): roar moment now inside 2 s (hook 7) · panel lowered and shrunk so the course stays
visible (S2 occlusion) · suite beat = logo wall + guests at tables, no phones/whip/fan/TV (S2) · "THE VIEW" now shows the
island green (S1) · public bystander and repeated end plate gone (S1) · audio holes and end-card collapse fixed (S2,
audio 6) · comment prompt gives two options (S2) · B variant without the superlative (S4).
Superseded EDLs: v1.4a / v1.3 / v1.2 — see git history of this file.

## Footage log (all 13 Drive videos)
| Clip | Res / fps / s | Content | Use |
|---|---|---|---|
| masters-week V19 (2025-04-10) | 404×720 · 30 · 23.3 | Hospitality lawn at sunset: lounge furniture, guests at white tables, clubhouse | Unused (Players-only cut); good for an Augusta-week piece |
| masters-week V25 (2026-04-11) | 404×720 · 30 · 3.9 | Live acoustic musician, pavilion dining | Unused; identifiable faces |
| the-players V07 (2024-03-16) | 404×720 · 30 · 16.6 | Crowds at the 17th from the walkway | v1.6: audio bed only (0–16.2 s, ASR speech-free) |
| V08 (2024-03-17) | 404×720 · 30 · 25.6 | 17th green, crowds; scoreboard "Wyndham Clark" at 0 s and later | Used 3.0–6.0 only (#10) |
| V12 (2025-03-13) | 404×720 · 30 · 58.4 | Empty-suite walkthrough — **"All Access Golf Travel & Events" suite signage** | **Excluded** (other company's branding) |
| V13 (2025-03-14) | 404×720 · 30 · 15.1 | Crowd on the path by the 17th, lens flare | Spare |
| V14 (2025-03-14) | 404×720 · 30 · 18.7 | 17th crowds; scoreboard "Rory McIlroy" | Spare (avoid scoreboard) |
| V15 (2025-03-14) | 404×720 · 30 · 21.0 | **Repost with "@allaccessgte / @allaccess_events" watermarks + "@justinthomas34 … course record" caption** | **Excluded** (not TripNerd's) |
| V16 (2025-03-15) | 404×720 · 30 · 13.9 | Crowd walking toward the 17th | Used (#7) |
| V17 (2025-03-15) | 404×720 · 30 · 13.9 | Same length/size as V16, different hash | Not reviewed in detail |
| V18 (2025-03-15) | 404×720 · 30 · 9.3 | Gallery behind a tee, players; static | Cut (motion gate 0.56) |
| V23 (2026-03-12) | 720×1280 · 24 · 54.1 | TripNerd suite: TRIPNERD door placard (with The Players mark), logo wall, interior, suite TV with broadcast, balcony over the 17th, guests | v1.6: 18.65–19.55, 48.6–50.7, 24.5–27.7, 50.7–54.1; TV frames and event-branded cups excluded |
| V24 (2026-03-14) | 720×1280 · 24 · 31.1 | From the suite balcony: 17th, crowd, roar at 13.5 s; scoreboard "Scheffler" at 7.0–8.2 s | v1.6: 13.6–17.2 (hook), 9.0–12.0 (end plate); scoreboard avoided |
