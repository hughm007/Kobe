---
title: "TripNerd — where the real footage lives (Google Drive)"
type: profile
client: tripnerd
owner: Karl
status: active
created: 2026-10-06
updated: 2026-10-06
tags: [footage, google-drive, assets, pointer, augusta, shortlist]
---

# TripNerd real footage: location pointer

**This is a pointer, not the media.** Per CLAUDE.md §6, binaries live in Drive, not in this repo.

## Where
- **Google Drive** (connected account; the Drive owner is the Wyatt account in [`operations/connector-register.md`](../../operations/connector-register.md)).
- **Folder:** My Drive → **"TripNerd real client footage"** (folder id `1JmmJksP2kD3eNd-_0het2ZEDK3qEqUNz`).
- **Organised 2026-10-06** at Karl's request so ChatGPT can reach it. Karl chose to **move** the existing folders rather than copy them.

| Subfolder | Contents | Notes |
|---|---|---|
| Originals by event (was `media`) | 185 photos and 25 videos in 5 event folders: masters-week 130 + 2, the-players 23 + 11, kentucky-derby 22 + 3, phoenix-open 10 + 7, daytona 0 + 2 | Named `TN_<date>_<event>_P###/V##`; P001–P185 and V01–V25 have no gaps. 355.7 MiB |
| AI-upscaled copies (Topaz) - NOT originals (was `media-upscaled`) | 4 videos: V13, V16, V23 and V24 `_topaz1080` | AI-processed. Never use as proof of detail; never as a native-1080p master |
| Augusta week 2026 - iPhone originals (IMG_) | 29 iPhone photos, IMG_1899–IMG_2036 (moved from the My Drive root) | The Augusta-week set used in Book It Now and the Group Chat. Same file IDs as before |
| READ ME - TripNerd real footage (Google Doc) | Folder map, counts, known issues, usage rules | Written for ChatGPT and any human reader |

## Known issues (from the read-only inventory, 2026-10-06)
- **Possible duplicates by identical byte size** (not checked): V16 and V17; photos P025/P101, P109/P115, P090/P091 and P092/P096.
- **Odd dates in masters-week:** P051 (2023-11-01), P070 (2024-03-28).
- **IMG_2041** is a 0-byte failed upload. It was left in the My Drive root and needs re-uploading from the phone.
- **Video resolution** (the Drive API doesn't expose it; measured 2026-10-06 where the file could be downloaded):

  | File | Measured | How |
  |---|---|---|
  | V16 (`TN_2025-03-15_the-players_V16.mp4`) | **404×720**, H.264, 30 fps, 13.9 s, bt709 | FACT: ffprobe, after a byte-exact download (5,295,386 bytes, sha256 `bbcc6fdd…8c9b58`). `creation_time` 2026-08-25 (a re-encode date; the event was 2025-03-15). No camera make or model tags. This is the known low-resolution copy, not a phone original |
  | V23 (18.3 MB), V24 (12.2 MB) | **Not measured** | The Drive connector refuses downloads over 10 MB. INFERENCE: these are the 720×1280 copies, not Taylor's originals. Evidence: (1) V16 from the same batch is the known copy; (2) Topaz 1080 upscales exist for exactly V13, V16, V23 and V24, which only makes sense for clips below 1080p |
  | V08 (9.8 MB) | Not measured | The download crashed the connector |

  - **Taylor's originals are still owed.** R01 Two ways, the C03 rail frames and the Group Chat F9–F11 stay blocked.
  - **Karl can confirm in 30 seconds:** download V23, then on a Mac use Get Info → More Info → Dimensions, or on Windows Properties → Details → Frame width and height.

## Augusta "watching view" shortlist (scanned 2026-10-06)
Karl asked for real Augusta course views from where TripNerd guests watch. Every masters-week photo and V25 was reviewed by eye: the 12 dated 2023–2024, all 118 dated 9–12 Apr 2026 (EXIF; 13 files carry a filename date one day later, which looks like the UTC date), and the 29 IMG_ originals. Downloads were byte-exact against Drive.

**Key finding (INFERENCE, strong):** the course seen from TripNerd's hospitality lawn and veranda is most likely **the venue's own course, not Augusta National**. People are playing golf on it in P026, P119, P125, P135, P137, P143 and P146. Never caption these shots as Augusta National or "the Masters". TripNerd confirms the venue (setup checklist item 17).

| Group | Files (Drive id) | What it shows | Gate |
|---|---|---|---|
| No recognisable faces | P026 `1kZ8rb-QUlS1h2lEBkZHPx85t3JajQh2o`; P119 `1KwhPFJTvD13cZZtOsKxI6_OwifNL6eWP`; P115 `1CFAQKHMveqkCMbG10CNEQSrVodl2iX0x`; P109 `1TFIUGqeUTOeao5cmiZuGGCa7sb9T7Ebg`; P036 `11IcASIKe9P7jKUIAGsRv0Oz0FZMvtaSR`; P155 `1hgukPM4e6vUTcS5-stvCK3sxLOVotrso`; plus P005, P076, P078 (2024) | Along the fence down the fairway; the hospitality lawn toward the course; the view from under the veranda | Venue confirmation |
| Guests watching, from behind | P126 `10dyyC_FpwiX27-xtjsHzHXnkA7GGLaYN`; P139 `1TcBey8OgodVfLZi4oRrN82GfUn493yg6`; P140 `1I4Qp3aUhYWPa87GSwYnVcpqjECfroS9q`; P029 `1NnvvUNe3MAYRYc6nF6xoR3y2a-IzBO7y`; P103 `11JiojrkVauE4tGKSKMzbu5GtGuJAtoys` | Guests lined along the white fence looking out at the course | Venue confirmation + guest consent |
| Veranda, faces | P117 `1pCFD-uksfbPhA0lSZ5A8wga9zmiiWKte` (bartender); P107 `1H1QPn0fFLBOzvsN8axzA4Vbs-lHquvSb`; IMG_1915, IMG_1932, IMG_2016 | Veranda bar or tables with the course beyond | + staff and guest consent |
| House | P035 `1hNSdt0CjVZXW8rgAi9TU1oscPa6cOdYy` | Brick colonial house, no people. A small yellow flag by the door looks like an event flag: crop it out | Not confirmed as the TripNerd house |
| Video | V25 `1o5qgIWsBSFuujQ4eZOCJPyCt07ekZ3-a` | 3.9 s, **404×720**, AAC stereo. Veranda live music, then a pan to the lawn and course | Below the 1080 master rule; faces at tables |
| Inside Augusta National | P072, P074, P077 (8 Apr 2024, a practice day) | Fairway and green from patron ground level | **Exclude from ads.** The patron policy allows practice-day photos for personal use only |
| Exclude: marks or TV | P028 (tournament booklets with the logo); P094 and P141 (Private Party banner with flag imagery); P128 (event flag on the house); P045, P046, P162, P164, P165 (shirts with a yellow emblem, unverified mark); P147 (banner art); TV broadcast on screen in P020, P088, P100, P032, P116, P121, P124, P127, P136, P073; P006, P071, P075 (2024 marks); P051, P070 (look like stock or press, ASSUMPTION) | — | Do not use |

Picks were sent to Karl as originals on 2026-10-06 (scratchpad zip, not committed).

## Deliberately left out (not clearly TripNerd footage)
- IMG_2446, IMG_2447 and IMG_8378 (Feb 2025; possibly personal).
- `copy_F51AFE0D….mov` (552 MiB, Dec 2025; never identified).
- `TripNerd_Slide4_Review_1080x1350.png` (a designed draft carrying an unverified quote).
- The `TripNerdSocialDirection` slides.
- The September invoice in the ServicePow OS.

## Usage status
- **INTERNAL** until TripNerd confirms the venue and guest consent.
- No event marks and no "Masters" in posts.
- No AI-generated or AI-altered people, voices or testimonials (TripNerd's rule).
- **ChatGPT access:** connecting ChatGPT to this Google account exposes the whole Drive, including other clients and the ServicePow OS. **Recommended:** share only this folder with a separate Google account and connect that one, mirroring [`operations/grok-setup.md`](../../operations/grok-setup.md) §7.
