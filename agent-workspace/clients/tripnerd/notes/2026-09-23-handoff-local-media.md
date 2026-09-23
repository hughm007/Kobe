---
title: "Handoff: TripNerd 17th-hole advert, continue from the owner's computer"
type: note
client: tripnerd
created: 2026-09-23
---

# Handoff for a Claude session running on the owner's computer

**Why:** the owner's TripNerd photos and videos are already sorted into category folders on their computer. A cloud session cannot reach that computer; a session started there can read the folders directly and upload full-size video to Higgsfield without the Google Drive size limits.

**Where the work stands:** repo `hughm007/Kobe`, branch `claude/brave-mendel-0vxkwj`. Read `clients/tripnerd/deliverables/2026-09-23-17th-hole-v6-frame-log.md` first.
- Method: one frame at a time, built, watched by the owner, locked, then the next. Never assemble ahead of the owner.
- Frame 1: LOCKED (aerial of the island green, captions "You know this hole." / "You've never sat here.").
- Frame 2: seat's-view reverse angle, owner said it "still kind of seems fake"; not locked.
- Next: frame 3, built alone, from real footage if a suitable clip exists.
- The v7 full-cut draft was set aside by the owner.

**First steps on the owner's computer:**
1. List the category folders and their contents (names, durations, resolution) so the owner and agent can see what exists.
2. Shortlist real clips for frame 3 and the frames after it: anything at the 17th hole at TPC Sawgrass; walking into a TripNerd suite or hospitality space; guests reacting (cheering, toasting); wide views from TripNerd seats.
3. Upload the shortlisted files to Higgsfield with `media_upload` (PUT from the local shell, then `media_confirm`).
4. Write `clients/tripnerd/notes/media-manifest.md`: one row per uploaded file with category folder, file name, duration, what it shows, Higgsfield media id, and whether faces are visible (consent needed for ads).
5. Commit and push the manifest to the same branch, so any session can build from it.

**Rules that still apply:** real logos only as real files; no generated faces at readable distance; guest consent before faces go in an ad; tournament marks flagged; owner locks each frame.
