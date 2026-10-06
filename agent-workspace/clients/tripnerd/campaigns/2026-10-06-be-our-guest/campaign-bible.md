---
title: "TripNerd — Be Our Guest (Players week, real footage)"
type: campaign-bible
client: tripnerd
campaign_id: 2026-10-06-be-our-guest
status: DRAFT
created: 2026-10-06
updated: 2026-10-06
tags: [campaign, bible, instagram, reel, awareness, real-footage, the-players]
---

# TripNerd — Be Our Guest

> Single source of truth. Evidence labels: **CONFIRMED · INFERRED · UNKNOWN · HYPOTHESIS**.

| | |
|---|---|
| **Campaign ID** | 2026-10-06-be-our-guest |
| **Client** | TripNerd (tripnerd.com) |
| **Product** | Brand awareness; downstream = The Players hospitality (suite on the 17th). tripnerd.com/events/the-players-championship live, "March 2027 packages available" (CONFIRMED, fetched 2026-10-06) |
| **Platform** | Instagram Reels, organic first (Trial Reel), 9:16, 1080×1920, 24 fps, 20.4 s |
| **Objective / KPI** | Awareness + engagement: 3-second hold, completion, sends, comments. Targets UNKNOWN (no baseline beyond public plays: Sep 26 = 104, Sep 30 = 137) |
| **Budget** | 0 generation credits (real footage, no AI) |
| **Depth** | FULL (new concept family, real people). Phases answered by standing documents recorded as skips in §16 |
| **Approval status** | **IN PRODUCTION — v1.2 master frozen; dual gate running.** Not postable until consent (C4) is on file |

## 1. Ground truth (skipped as a fresh run — see client brief, content system, Drive register)
- Source: TripNerd's own Drive archive `media/` (masters-week, the-players), pulled 2026-10-06, all 13 file sizes matched Drive, bundle stored in Higgsfield (sha256 list in the bundle).
- Footage review (by eye, contact sheets + full-res stills): see [shotlist.md](shotlist.md) §Footage log.
- Excluded: V15 (someone else's repost — "@allaccessgte / @allaccess_events" watermarks + burned-in player caption), V12 (filmed inside an "All Access Golf Travel & Events" suite — another company's branding), any frame with scoreboards naming pros (Scheffler, Clark, McIlroy, Thomas), the suite TV showing the golf broadcast.

## 2. Strategy (skipped — 90-day plan)
Show, don't list: put the viewer in TripNerd's suite on the 17th. Pattern evidence (directional, n small): TripNerd's own most-played video is a raw suite walkthrough (7,147 plays); Roadtrips' best Reel is a "be our guest" documentary (3,237) — [teardown](../../notes/2026-10-06-roadtrips-top-reels-teardown.md). Comment prompt added for the engagement goal (nobody in the category asks).

## 3. Concept
**Be Our Guest** — POV arrival through TripNerd's own branded suite door → suite → balcony → the 17th → the crowd → payoff at the table → end card. Owner-selected 2026-10-06 ("using TripNerd's real client footage and using the Be Our Guest format as a guide").
Rotation vs live ads (BC-24): no host to camera, no photo grid, no island-green open, no slogan reuse; the arrival door is not in the Sep 26 ad. Overlap: the suite interior and balcony view come from the same 2026 visit as the Sep 26 ad's "real suite footage" — different moments and structure; the stand-alone logo-wall shot was cut to reduce overlap.

## 4–5. Script (supers only, no VO)
- 0.0–2.4 "POV: you're our guest at The Players" (event name used only to say where guests are)
- Labels: "THE SUITE" · "THE BALCONY" · "THE 17TH"
- 14.9–17.4 "Where would you sit? / Tell us in the comments."
- End card: real wordmark · "Be our guest." · "Plan your group's trip at tripnerd.com"
Claims: none numeric. "Suite… on the 17th" is shown in TripNerd's own footage and stated on its site.

## 6. Storyboard / EDL
[shotlist.md](shotlist.md).

## 7. Cast
Real guests and crowds. Guests shown mostly from behind/side. **Consent for identifiable guests: UNKNOWN** → C4.

## 9. Brand fidelity
Wordmark = real file (sha256 `11bfe474…6f00b40`). Door placard: "THE PLAYERS" half covered with a flat colour fill (no AI) so no event logo appears. Suite logo wall is TripNerd's real signage.

## 10. Production
Higgsfield sandbox, ffmpeg: lanczos scale to 1080×1920 (no AI upscaling — would need an AI label under TripNerd's rule), mild contrast/saturation/unsharp, 24 fps uniform timebase, concat filter. 0 credits.

## 11. Audio
Each shot's own location sound, levelled per source and loudness-normalised (−16 LUFS, −1.5 dBTP). No music in the file; pick a track in-app from Instagram's commercial-use library at posting. ASR: no speech.

## 13. QC verdict — critic (BC-22)
PENDING.

## 14. Skeptic (BC-23)
PENDING.

## 15. CONFLICTS
| ID | Conflict | Status |
|---|---|---|
| C4 | Identifiable guests (balcony table, balcony watchers, suite) — TripNerd rule: identifiable guests only with consent | **OPEN — CLIENT_APPROVER confirms consent (or names who is staff)** |
| C5 | Most sources are 404×720; scaled ×2.67 — softness at full screen | OPEN — accept, or supply the Topaz 1080p versions of V13/V16/V23/V24 (Drive `media-upscaled/`, AI upscale = labelled per TripNerd rule) or original camera files |

## 16. Decision log
| Date | Decision | By |
|---|---|---|
| 2026-10-06 | Build "Be Our Guest" from real TripNerd footage | Owner |
| 2026-10-06 | Owner switched masters-week and the-players folders to "anyone with the link"; 13 videos pulled and bundled into Higgsfield storage; owner asked to switch back to Restricted | Owner / OPERATOR |
| 2026-10-06 | Excluded V12 and V15 (other companies' branding/watermarks), scoreboard frames (pro names/photos), suite TV (broadcast) | OPERATOR |
| 2026-10-06 | Door placard event logo covered with a flat fill (logo clearance, not alteration of meaning) | OPERATOR |
| 2026-10-06 | v1 → v1.1: suite shot moved past the TV; stand-alone logo-wall shot cut (Sep 26 overlap, brand-time budget) | OPERATOR |
| 2026-10-06 | v1.1 → v1.2: V18 tee-shot shot failed the clip motion gate (0.56 < 1.6) → replaced with V16 crowd shot (22.6) | OPERATOR |
| 2026-10-06 | Phases 1, 2, 4, 5 skipped as fresh runs (answered by standing documents + teardown) | OPERATOR |
