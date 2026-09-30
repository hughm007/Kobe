---
title: "A client's own website is part of its asset register: a 15-minute crawl found five videos, 15 attributed reviews and published package lines that days of searching Drive and Higgsfield had missed"
type: learning
client: tripnerd
owner: Karl
status: active
created: 2026-09-30
updated: 2026-09-30
tags: [assets, intake, real-footage, client-website, claims, inventory]
---

# A client's own website is part of its asset register

> Extends [Client assets were misfiled, not missing](2026-09-02-client-assets-were-misfiled-not-missing.md) and decision [0008](../decisions/0008-real-client-material-first-for-video-ads.md).

## What we did

TripNerd, 2026-09-22 to 2026-09-30. Finding real footage took days: 100 Higgsfield videos probed, 29 Drive photos read, a 578 MB `.mov` noted and never opened, and the NERDS photo gallery found on 2026-09-29. The owner then asked for five more real-footage adverts, so on 2026-09-30 the rest of tripnerd.com was crawled from the Higgsfield sandbox (this container cannot reach the site): home page, `/reviews`, `/about` and six event pages. Two tool calls, then one numbered contact sheet of the 55 event-page images.

## What happened (FACT)

| Found on the website, not in the register | Count | Why it matters |
|---|---|---|
| Hosted videos (Vimeo) | 5 (two are real suite tours, March 2026 and 2022; one is a Derby film I have not seen) | Real suite footage we did not know we had. The owner has said Derby media exists; the Derby film is the likeliest match |
| Attributed Google reviews, verbatim | 15 (9 usable, 6 barred for marks, sensitivity or weakness) | The voice of real customers, which no advert had used |
| Published package lines per event | 6 pages | Partly answers the "package sheet" blocker (needs an Evidence Record) |
| Real-looking TripNerd photos on the event pages beyond the NERDS gallery | roughly 15–20 of 55 (by eye; the rest look like stock) | More Daytona, Phoenix, THE PLAYERS and Augusta-house photos |
| Internal inconsistency on the live site | 1 (THE PLAYERS 2027 dates: "March 11-14" on the home page, "not yet officially set" in the FAQ) | An advert stating those dates would have failed destination parity |

**Two process traps hit on the way:**
- My first embed search found no video, because the Vimeo embeds are URL-encoded inside the page (`vimeo.com%2Fvideo%2F…`). A search for `vimeo.com/video/` returns nothing. A case-insensitive search for `vimeo` found all five.
- Higgsfield's upload call failed repeatedly that day. The Adobe block-upload bridge ([learning](2026-09-29-adobe-touch-up-on-higgsfield-media-needs-a-bridge.md)) carried the two review sheets instead.

## What we think it means

The register is not complete until the client's public web presence has been read as an asset source. The website is the one place the client has already chosen and published its own best material, with attribution and claims. It is also the destination every advert must match.

**Confidence:** Medium. One client; the site was unusually rich. The routine costs about 15 minutes, so the bar for repeating it is low.

**Caveat:** finding a video is not having the video. Nothing was downloaded from Vimeo, and the masters are still a request to TripNerd (better quality, and no platform-terms question).

## How far it generalises

- ☐ Specific to this client
- ☑ Likely true for this industry / audience type (any client with a site, reviews and a video or two)
- ☐ Likely true for this channel generally
- ☐ Probably a general principle

## What we did with it

The routine is now a playbook: [`playbooks/ads/real-material-intake.md`](../../playbooks/ads/real-material-intake.md). It runs before any concept work for a client. The inventory is in `clients/tripnerd/campaigns/2026-09-30-five-more-real-footage/real-material-inventory.md`.
