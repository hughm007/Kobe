---
title: "TripNerd — where the real footage lives (Google Drive)"
type: profile
client: tripnerd
owner: Karl
status: active
created: 2026-10-06
updated: 2026-10-06
tags: [footage, google-drive, assets, pointer]
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
