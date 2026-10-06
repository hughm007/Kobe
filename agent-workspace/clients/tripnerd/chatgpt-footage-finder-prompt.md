---
title: "TripNerd — ChatGPT prompt: find and use the real footage in Drive"
type: template
client: tripnerd
owner: Karl
status: active
created: 2026-10-06
updated: 2026-10-06
tags: [chatgpt, google-drive, footage, prompt]
---

# ChatGPT prompt: find TripNerd's real footage

**Use:** paste the block below into ChatGPT after its Google Drive connection is set up.
- Recommended: connect a separate Google account that has only this folder shared to it. See [`footage-drive-location.md`](footage-drive-location.md).
- Update the counts here if the folder changes.

```
You're helping me (Karl, Service Pow) with marketing for our client TripNerd, a company that hosts guests at big sporting events. All of TripNerd's real photos and videos are in my Google Drive. Use the Google Drive connection to find them.

WHERE TO LOOK
- Folder: "TripNerd real client footage" (in My Drive).
- Open the Google Doc inside it first: "READ ME - TripNerd real footage". Follow it.
- Only use this folder. Ignore everything else in my Drive (other clients, internal documents).
- If browsing the folder doesn't work, search Drive for file names starting with "TN_" or "IMG_".

WHAT'S IN THE FOLDER
1. "Originals by event": 185 photos and 25 videos in 5 subfolders.
   - masters-week: 130 photos, 2 videos
   - the-players: 23 photos, 11 videos (V23 and V24 are the 17th-hole clips)
   - kentucky-derby: 22 photos, 3 videos
   - phoenix-open: 10 photos, 7 videos
   - daytona: 2 videos
   File names: TN_<YYYY-MM-DD>_<event>_P### for photos and V## for videos.
   Example: TN_2026-03-12_the-players_V23.mp4
2. "AI-upscaled copies (Topaz) - NOT originals": 4 PLAYERS videos (V13, V16, V23, V24) upscaled by AI.
   Never treat these as originals or as proof of fine detail.
3. "Augusta week 2026 - iPhone originals (IMG_)": 29 iPhone photos, IMG_1899 to IMG_2036.

YOUR FIRST TASK
1. Confirm you can open the folder and the READ ME. If you can't open something, tell me exactly what, and don't guess.
2. Give me an inventory table: event | date range (from the file names) | number of photos | number of videos | video file names.
3. Tell me honestly whether you can SEE the photos and videos themselves or only their names. Test on TN_2026-03-12_the-players_V23.mp4 and IMG_1907.JPG, and describe what each one actually shows. If you can only see file names, say so.

QUALITY NOTE
- Some videos are low-resolution copies. V16 measures 404x720. V23 and V24 are probably 720x1280 copies (not yet confirmed).
- Don't recommend any clip as the main footage for a finished ad without checking its resolution first. TripNerd's standard is at least 1080p.

RULES (ALWAYS)
- Internal use only until TripNerd confirms the venue OK and guest consent. Many guests can be recognised.
- Nothing meant for posting may show event logos or tournament marks, or use the word "Masters".
- Never AI-generate or alter people, faces, voices or testimonials using this footage. Real footage is the proof.
- Describe only what a file actually shows. Go by the file name for event and date. If what you see contradicts the name, flag it.
- Label what you tell me: FACT (you saw it in the file), ASSUMPTION, or UNKNOWN.
```
