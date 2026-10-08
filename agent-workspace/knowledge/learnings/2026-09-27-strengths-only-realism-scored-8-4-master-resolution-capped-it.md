---
title: "Strengths-only production scored 8.4/10 with the owner; the whole deduction was master resolution, not creative"
type: learning
client: tripnerd
owner: Karl
status: active
created: 2026-09-27
updated: 2026-09-27
tags: [advertising, video, realism, resolution, owner-score]
---

# Strengths-only production scored 8.4/10 with the owner; the whole deduction was master resolution, not creative

## What we did

TripNerd hosting spot, 25.8 s, 16:9. Body from the owner's reference cut (attributed by the owner to
ChatGPT Astra 6) plus the owner's own 720p re-cut with real suite footage; this workspace added the
brand-blue end card, the polo wordmark fix and a drone opening with the title re-set. Generation was
used only where it is strong (an aerial of a world-famous hole); everything brand-bearing was the real
file composited; people and the suite were real footage. Spend: none in this workspace.

## What happened

Owner score 8.4/10 (2026-09-27). Idea: "great". Execution: "great". Realism: credited to using only
strengths. The one deduction: "the quality of the advert full screen looks low".

| Metric | Value | Source |
|---|---|---|
| Owner score | 8.4 / 10 | owner message, 2026-09-27 |
| Deduction named | picture quality at full screen | same |
| Body master | 1280x720 export, Lanczos-upscaled to 1080p | build record 2026-09-25 |
| Opening master | native 1920x1080 | same |

**Source:** owner's message in the session of 2026-09-27; `ServicePOW/Clients/TripNerd/Client approved adverts/`.

## What we think it means

Two claims. (1) The strengths-only doctrine holds with this owner: generate only what the model does
well, composite real marks, use real footage for people and place — realism is what earned the score.
(2) Resolution is a scored attribute of the deliverable, not a technical footnote: a native-resolution
opening next to an upscaled body made the softness obvious, and it cost about 1.5 points on its own.
The fix was known before delivery (flagged in the build record) and still shipped, because the 720p
export was the only body available at the time.

**Confidence:** Medium — one advert, one reviewer, no market data; the resolution claim is
mechanically certain, the score attribution is the owner's own words.

## How far it generalises

- ☑ Specific to this client
- ☑ Likely true for this industry / audience type
- ☑ Likely true for this channel generally
- ☑ Probably a general principle — never assemble on a sub-1080p body; get the native export or raw clips first

## What we'd do next

Re-master this advert at native resolution once the owner supplies the raw suite clips or a 1080p/4K
export of the cut (the 0–20 s body already exists at 1080p). The canonical blocking-check registry
already carries a "Resolution" check, but it reads the master's container against the placement spec,
which a 720p body upscaled into a 1080p file passes. Proposal for the registry owner: extend that
check's description to "and no source segment upscaled to reach it" so the rule keeps its one home.

## Promotion

- ☑ Added to [`../index.md`](../index.md)
- ☐ Seen before? Link the earlier learnings:
- ☐ Third occurrence → promote into a playbook and link back from here

## Related

- `ServicePOW/Clients/TripNerd/05_Edit_Project/2026-09-24-hosting-spot/2026-09-25-hosting-spot-drone-opening.md`
- `ServicePOW/Clients/TripNerd/05_Edit_Project/2026-09-24-hosting-spot/2026-09-24-hosting-spot-endcard-fix.md`
- `playbooks/ads/recipes/hosting-spot-20s.md`
