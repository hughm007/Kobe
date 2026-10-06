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
- **Video resolution isn't exposed by the Drive API.**
  - Whether V23 and V24 are Taylor's originals at 1080p or more, or the 720p copies, is UNVERIFIED.
  - The existence of Topaz upscales suggests they're below 1080p.
  - Check with ffprobe before using them as a master.

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
