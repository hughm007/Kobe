---
title: "0008 — Real client material is the default picture source for client video adverts"
type: decision
client: internal
owner: Karl
status: active
created: 2026-09-29
updated: 2026-09-29
tags: [decision, video, advertising, real-footage, routing, generation]
---

# 0008 — Real client material is the default picture source for client video adverts

**Status:** Accepted
**Date:** 2026-09-29
**Decided by:** Karl (owner), on approving THEIR CAMERA ROLL: "we need to be able to capitalize on the real client footage and this advert is a good example of that, this was better than the other advert you created that was client approved."

## Context

Four owner verdicts in 27 days line up with how much of each picture was the client's real material:
- generated realistic B-roll scored 4/10;
- a generated-people spot was killed;
- a mostly real cut with one generated aerial scored 8.4;
- an all-real camera-roll advert was ranked above the 8.4.

Evidence: `knowledge/learnings/2026-09-29-real-client-material-plus-motion-design-outranked-generation.md`.

Before this, our default for a new advert was to design shots and then route each one. The installed video-production skill already said "routing a hard shot to real footage is success". But generation remained the default route, and real footage was the exception we reached for when generation failed.

## Options considered

| Option | Pros | Cons |
|---|---|---|
| A. Generation-led (design shots, generate them) | Any shot we can imagine; no dependence on the client | Owner verdicts 4/10 and killed; realism failures on people and hands; costly |
| B. Strengths-only hybrid (generate only what models do well, real material for the rest) | 8.4 on record; landmark aerials look great | Still depends on generation for the hero picture; mixed resolutions cost points |
| **C. Real client material first, with motion design and touch-up (generation fills gaps only)** | Ranked highest by the owner; authentic by construction; 20 credits; fast once tooled | Limited by what the client has shot; needs guest consent and rights care; resolution capped by the source (mitigated by upscaling) |

## Decision

**C.** Every client video advert starts from an inventory of the client's real footage and photos: their website gallery, reviews with photos, Drive, phone videos, staff footage. The concept is designed around that material.
- Motion design (interface devices, typography, transitions, sound design) carries the story.
- Higgsfield and Adobe are used for touch-up: upscale, tone, clean-up and reframing.
- Generation is used only where no real material exists for a beat, and only for subjects models do well (landmarks, environments, abstract motion), never for the client's customers or staff.
- Option B remains the fallback when a needed beat has no real material. Option A is not used for people.

## Why

The owner's verdicts are the datum. Real material is also the only thing a competitor cannot copy, and it needs no AI disclosure.

## Consequences

- **Intake:** "what real material exists?" becomes the first production question, and missing material is requested early (`servicepow-video-production/references/real-footage-requests.md`).
- **Tooling:** the camera-roll recipe is the first reusable real-material route (`playbooks/ads/recipes/camera-roll-real-photos.md`). More devices should follow: before/after swipes, review cards over job photos, a map of trips.
- **Rights:** consent and marks checks move to the front of the build, because real guests and real venues appear on screen (the TripNerd brief's rule on guest releases applies).
- **Canonical:** the installed skills are a generated consumer of `~/servicepow-ai-os` and are not hand-edited here. **Proposed canonical change**, to be applied in the canonical repository under the baseline law (BASELINE → change → regression → evidence):
  - `servicepow-video-production` DECISION RULES gains "real client material first; generation fills gaps";
  - shot routing (`servicepow-higgsfield-production`) lists REAL-ASSET + motion design as the first route, ahead of GENERATE.
