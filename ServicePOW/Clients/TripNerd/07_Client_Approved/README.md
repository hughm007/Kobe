---
title: "TripNerd — Client approved adverts"
type: profile
client: tripnerd
owner: Karl
status: active
created: 2026-09-27
updated: 2026-10-23
tags: [client, approved, adverts, index]
---

# TripNerd — Client approved adverts

Adverts the owner has signed off, with the score and the reason. Each entry has a record file with the download links and the checksum, so the file can always be pulled and verified.
Video bytes stay out of git (workspace rule: `assets/README.md`, large binaries → pointer file), with one owner-requested exception:
the 2026-10-08 Augusta file (13.7 MB) sits in this folder, because this workspace could not upload it to Higgsfield.

| Approved | Advert | Score | Pointer | Master | What the score says |
|---|---|---|---|---|---|
| 2026-09-27 | Hosting spot, 25.8 s, 16:9, drone opening ("THE PLAYERS / VIP ON 17" → food → drinks → connections → roar → host → real suite footage → card) | **8.4 / 10** | [2026-09-25-hosting-spot-drone-opening-1080p.md](2026-09-25-hosting-spot-drone-opening-1080p.md) | 1920x1080 container, body upscaled from the owner's 720p export | Idea and execution rated great; the deduction is picture quality at full screen (body is a 720p upscale). Realism came from using only what generation does well and real material for the rest. |
| 2026-09-29 | **THEIR CAMERA ROLL**, 25 s, 9:16: a phone camera roll of real TripNerd guests at every event (grid → tap → Derby, Daytona, Phoenix → our Sawgrass suite video "comes alive" → the real roar → flicks → event list → "We have everything. Which one's yours?" → card) | **Approved; ranked by the owner above the 8.4** (no number given) | [2026-09-29-their-camera-roll-25s.md](2026-09-29-their-camera-roll-25s.md) | 1080x1920, native; built from real photos and real video, touch-up only (upscale, auto-tone), no generation | "We need to be able to capitalize on the real client footage and this advert is a good example of that." All real material, with the motion design doing the storytelling. |
| 2026-10-08 | **AUGUSTA, HANDLED**, 20 s, 9:16: real hospitality-lawn hook → TripNerd's house and veranda with the checklist read by the hosting-spot host's voice → "Bring your people. Enjoy the moment." → the ball-landing end shot → "All done with TripNerd!" into the camera-roll card | **7.7 / 10** (owner). Client approved by **Jason (TripNerd)** | [2026-10-08-augusta-handled-20s.md](2026-10-08-augusta-handled-20s.md) · file: [mp4](2026-10-08-augusta-handled-20s-client-approved.mp4) | 1080x1920 30 fps, the A6 master (Topaz-upscaled real shots) re-encoded at 5.3 Mb/s | "I just really don't like how the house is a still image and it looks fake." The house shot is TripNerd's published photo animated as a slow push-in, and it reads as a still. Everything else passed. |
| 2026-10-20 | **DERBY static**, 4:5: "Everyone's filming it. You're living it." A paper ticket stub over real phones-up crowd footage, with an "Ours:" photo of the TripNerd check-in table | Client approved by **Jason** (no score) | [2026-10-20-derby-everyones-filming-it.md](2026-10-20-derby-everyones-filming-it.md) · file: [png](2026-10-20-derby-everyones-filming-it-client-approved.png) | 1080×1350, real photos, real logo file | The ticket over real event footage, with proof only a TripNerd guest gets. |
| 2026-10-23 | **PHOENIX OPEN Reel**, 31 s, 9:16: aerial → suite → the ticket (push, stamp spin) → bunker → "Inside the 16th" with the corner card → food → Fairmont → end card | Client approved by **Jason** (no score) | [2026-10-23-phoenix-open-reel-31s.md](2026-10-23-phoenix-open-reel-31s.md) · file: [mp4](2026-10-23-phoenix-open-reel-31s-client-approved.mp4) | 1080×1920, 30 fps; the owner's cut with "16th Hole Suite" | Approved once the ticket said only what TripNerd sells (no "LOGE"). |

**Standing rule from this approval:** the owner scores realism and idea first; the one thing that
cost points was master resolution. Never accept a sub-1080p body as a master again — ask for the
native export or the raw clips before assembly.

**Standing rule from the 2026-09-29 approval:** real client material comes first. The owner ranked an advert
built entirely from TripNerd's own photos and suite video (with Higgsfield and Adobe used only
for touch-up) above the partly generated 8.4. Every new advert starts from the client's real
footage and photo inventory, and generation fills gaps only
(`knowledge/decisions/0008-real-client-material-first-for-video-ads.md`).

**Standing rule from the 2026-10-08 approval (7.7):** an animated still photo reads as fake to the owner, even when the motion is a real push-in. Shoot or source real video of every location that carries a claim (the house), or cut the shot. Never animate a photo to stand in for footage of the product.

**Standing rule from the 2026-10-23 approval:** every delivered advert ships with its editable project: the build script or editor project, the source clips, fonts and logo, all in the 05 folder. Changing one word in the Phoenix Open Reel took a frame-by-frame patch, because its project never reached this repo, and a faint trace remains in one cross-fade. With the project, it is a one-line edit.

**Claims on client-approved adverts (owner, 2026-10-23):** when Jason approves an advert, the claims in it (inclusions, dates, venues) are TripNerd's to stand behind. We still flag any claim we can't source, in the build record, before he sees it. After his approval, an unsourced claim is no longer a hold on our side. This does not cover consent or third-party trademarks.
