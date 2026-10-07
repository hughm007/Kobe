---
title: "For a world-famous landmark, the image model's own memory of the place beat photo references, and a satellite tile is the cheapest geometry check"
type: learning
client: tripnerd
owner: Karl
status: active
created: 2026-09-23
updated: 2026-09-23
tags: [image, higgsfield, nano-banana, realism, references, landmark, geometry-check, qc]
---

# Famous landmark: model memory beat references; check geometry against a satellite tile

**Context.** Frame 1 of the TripNerd 17th-hole advert (v6, frame-by-frame) is a drone
view of the island green at TPC Sawgrass. The owner asked for a five-minute realism
review: "make sure there is no way you can make it better". The first still (job 7dbb2185)
had been made with three real photo references and looked photographic, but a check
against the real layout showed two errors a golf fan would catch: the walkway was drawn
as a long wide grass tongue instead of a short narrow bulkheaded neck, and the front pot
bunker was missing.

**How the layout was verified.** Public satellite tiles of the hole were stitched in the
vendor sandbox (three zoom levels, north up) and viewed next to the two Commons
tournament photos. The tiles were captured during a tournament build-out, so they also
showed where the hospitality structures and the grandstand really stand. Cost: nothing.
Time: four tool calls. This settled which real vantage point the frame corresponds to
(behind the green on the 18th-tee side, looking back toward the tee) and what must be in
it (bunker at the far-left edge of the green, short walkway to the near-right bank, tree
island one green-width beyond on the left).

**Observation (2026-09-23, four Nano Banana 2 4K stills, same layout text).**

| Run | References attached | Result |
|---|---|---|
| 301 (high, 70 m) | none (submitted by mistake) | Accurate hole: bunker, short narrow walkway, crisp bulkhead, tee-side suites and grandstand. Reads as a real drone photo. |
| 302 (low, 40 m) | none | Accurate green and bunker; walkway rendered as a wide plank dock. |
| 303 (high, 70 m) | 2014 tournament photo, satellite tile, sunset photo, 1990s aerial | Layout right, but the walkway was packed with a crowd of spectators walking on it (imported from the crowd in the reference photo), which is both wrong and an LB25 risk at 4K. |
| 304 (low, 40 m) | same four | Best of the set: accurate bunker, short walkway, bulkhead planks large and sharp, flag, no people near camera. |

The earlier referenced still (7dbb2185, three references) was the least accurate of all
five on the walkway and bunker.

**What we think it means.** For a landmark the model has seen thousands of times, its
own memory of the place carries the geometry; references mainly import the *incidental*
content of the reference photo (crowds, watermark bands, the photo's own crop) and can
override the prompt's layout. References remain essential for places the model does not
know (a client's suite interior, a local shopfront). The prompt still has to name the
layout facts explicitly; both good runs had the bunker and walkway spelled out in words.

**Confidence:** Medium. One landmark, one model, one session, five stills. The
satellite-tile check is High confidence as a method: it is cheap, deterministic and
caught two errors that three rounds of visual QC against oblique photos had missed.

## How far it generalises

- ☑ Likely true for any landmark with heavy public photo coverage (stadiums, famous holes,
  city skylines): try a text-only still first, then decide whether references add anything.
- ☑ Probably a general principle for QC: when the subject is a real place, check the
  generated geometry against a plan view, not only against oblique photos.
- ☐ Not tested on Seedream or on video models.

## What we'd do next

For the next landmark frame: one text-only still and one referenced still at 2K, compare
on a plan-view checklist (what must be where), then spend 4K only on the winner. Add the
plan-view check to the still-first gate for real places.

## Promotion

- ☑ Added to [`../index.md`](../index.md)
- ☐ Seen before? First occurrence.
- ☐ Third occurrence → promote into a playbook and link back from here

## Related

- [2026-09-23 reference-driven macro beat](2026-09-23-reference-driven-macro-beat-model-test.md) — the opposite case: for an object the model does not know (a specific cup), references were what made it right.
- Deliverable: `clients/tripnerd/deliverables/2026-09-23-17th-hole-v6-frame-log.md` (frame 1 realism review).
