---
title: "The more of the picture that is real client material, the higher the owner rates the advert; real photos and video plus motion design outranked everything generated"
type: learning
client: tripnerd
owner: Karl
status: active
created: 2026-09-29
updated: 2026-09-29
tags: [advertising, video, real-footage, motion-design, owner-score, routing]
---

# The more of the picture that is real client material, the higher the owner rates the advert

## What we did

TripNerd THEIR CAMERA ROLL, 2026-09-29. It is a 25 s 9:16 advert (plus a 15 s cutdown) built only from TripNerd's real material:
- 10 guest photos from the client's own website gallery;
- 71 more as grid tiles;
- two real suite videos (the reveal and the crowd roar).

Higgsfield and Adobe were used only for touch-up (2k upscale, 1080p video upscale, auto-tone). The storytelling came from motion design built in code: a phone camera roll that flicks, taps open, swipes through the events, lets the video "come alive", then collapses into dozens of trips. Spend was 20.18 credits, with no generation.

## What happened: the owner's verdicts across Service Pow's video work, same owner

| Advert | Share of picture that is real client material | Generation used for | Owner verdict | Source |
|---|---|---|---|---|
| 911 Drain realistic lane (runs 9–10, 2026-09-02) | none | all picture (realistic mood B-roll) | **4/10** | `operations/run-ledger.md`, `knowledge/EVIDENCE-INDEX.md` FAILED |
| TripNerd YOUR PEOPLE cut v1 (2026-09-29) | small (reference frames only) | people, performances, voice | **Killed:** "sucks, i hate it scratch the whole advert idea" | `ServicePOW/Clients/TripNerd/05_Edit_Project/2026-09-28-ten-scripts/your-people-build-log.md` |
| TripNerd hosting spot, drone opening (2026-09-27) | most (the body is the owner's cut with real suite footage) | the opening aerial of a famous hole | **8.4/10.** "the realism was there"; the deduction was resolution | `Client approved adverts/2026-09-25-…md` |
| **TripNerd THEIR CAMERA ROLL (2026-09-29)** | **all** | nothing (touch-up only) | **Approved, ranked above the 8.4:** "we need to be able to capitalize on the real client footage and this advert is a good example of that" | `Client approved adverts/2026-09-29-their-camera-roll-25s.md` |

Sample: four verdicts, one owner, two clients, 27 days. The ranking is monotonic in real-material share.

## What we think it means

For this owner and these clients, **real client material is the strongest picture source we have**.
- Generation earns its place only where it is demonstrably strong: a famous landmark, a gap no real clip covers, or touch-up.
- The creative leverage moves from *making* pictures to *designing how real pictures are shown*. The camera-roll device turned 10 still photos into a story because the format itself is authentic: everyone scrolls their own camera roll.
- It is also cheaper (20 credits against hundreds for generated cuts) and faster: two cuts rendered in 44 s once the renderer existed.

**Confidence: Medium.**
- These are owner-preference verdicts, not market data. No CTR, CPA or thumb-stop numbers exist yet.
- The four adverts also differ in concept and format, so real-material share is not the only variable.
- Still, the direction is consistent across four verdicts, and the owner has now stated it as direction.

**The next evidence to collect:** a paid hook test of the camera-roll body against a generated-heavy control, on the same audience and budget.

## How far it generalises

- ☐ Specific to this client
- ☑ Likely true for this industry / audience type (experience and hospitality; anything whose customers take photos)
- ☐ Likely true for this channel generally
- ☐ Probably a general principle

Most service businesses have real job photos and phone videos. The same route should work wherever the client has a gallery, reviews with photos, or staff phone footage.

## What we did with it

Promoted at three or more supporting verdicts (see `knowledge/index.md` → Promoted to playbooks):
- **Decision:** `knowledge/decisions/0008-real-client-material-first-for-video-ads.md`, real client material is the default picture source.
- **Recipe:** `playbooks/ads/recipes/camera-roll-real-photos.md`, the repeatable build with the reference code.
- **Router:** `playbooks/ads/references/creative-funnel-and-router.md` gains Lane C (real material plus motion design).
