---
title: "TripNerd — client-approved video adverts"
type: register
client: tripnerd
owner: Karl
status: active
created: 2026-10-19
tags: [client, approved, video, register]
---

# TripNerd client-approved video adverts

One row per approved advert. Media is never committed to git: each row names the file and its
SHA-256 so the master can be matched wherever it is stored (Drive, phone, editor).

| # | Advert | Length | Approved | Approved by | Record |
|---|---|---|---|---|---|
| 1 | Hosting spot, drone opening v2 | — | before 2026-10-12 | owner (score 8.4) | see `../campaigns/2026-10-12-unused-footage-plan/footage-usage-ledger.md` |
| 2 | Their Camera Roll | 25 s | 2026-09-29 | owner | same ledger |
| 3 | Augusta, handled A6 | — | before 2026-10-12 | Jason | same ledger |
| 4 | **Daytona suite Reel, 18 s, boxed + logo, moving burnout** | 18.0 s | 2026-10-19 | owner (Karl) | below |

## 4. Daytona suite Reel (TN-DAYTONA-001)

- **Master file:** `TripNerd-Daytona-Reel-18s-BOXED-LOGO-burnout-video.mp4`
  SHA-256 `3172dafabd7e61a637d2c56ef79f961af659b2483e0835a473bfda3deb1e843d`
- **Spec:** 1080x1920, 30 fps, 540 frames, H.264 + AAC 48 kHz, faststart; -14.0 LUFS, -1.8 dBTP.
- **Build:** `../campaigns/2026-10-12-daytona-500/final-18s/` (`final_cut_v3.py logo video`,
  `build_card_open2s.py`, `compose_music_v3.py`, QA JSON). Process: `../../../playbooks/ads/real-media-reel.md`.
- **Posting:** set the platform AI-content toggle (the burnout and the TV picture in the opener
  are AI animations of real photos). Caption: `../campaigns/2026-10-12-daytona-500/client-review/caption.txt`.
- **Open items (do not block approval):** father-son and wow-guests photos carry no year because
  no shoot date exists for them; add the years if TripNerd supplies them. End card reads
  "Daytona 2027." because bookability for 2027 is not confirmed by Jason.

| Time (s) | Picture | Sound |
|---|---|---|
| 0.0-2.0 | Lanyard entrance: suite photo, TripNerd card lifts on a drawn strap (STAFF print correct), TV picture AI-animated; "Our Daytona suite."; white-out 1.7-2.0 | Composed music build; real V06 audio 4.0-6.0 s, low-passed |
| 2.0-4.0 | V06 2.00-3.47 s (73%), "This beats watching from home." · 2024 | First music hit; real V06 audio 2.0-4.0 s; music -6 dB |
| 4.0-7.5 | V05 0.0-3.5 s, real speed, "Race weekend, the TripNerd way." · 2024 | Real V05 audio 0.0-3.5 s; music -6 dB |
| 7.5-9.0 | Photo B (native size, blurred fill, logo), "Headsets on. Drinks up." · 2023 | Music |
| 9.0-10.2 | Father-son photo, "Thumbs up from the seats." | Music |
| 10.2-11.5 | Wow-guests photo, "Bring your people." | Music |
| 11.5-14.5 | Burnout: Kling 3.0 Pro animation of Photo A, real speed, "The burnout. The memories." · 2023 | Real V06 0.0-2.25 s then V05 3.5-8.0 s, roar peaks at 14.5; music -6 dB |
| 14.5-18.0 | Brand-blue end card "Daytona 2027. / Talk to a Nerd / tripnerd.com", fade to black 17.6-18.0 | Final chord at 14.5; roar decays with it |
