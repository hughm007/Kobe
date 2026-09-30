---
title: "Real-material intake: find every real photo, video, review and claim a client already has, before concept work"
type: playbook
client: internal
owner: Karl
status: active
created: 2026-09-30
updated: 2026-09-30
tags: [ads, video, intake, asset-register, real-footage, claims]
source: TripNerd 2026-09-22 to 2026-09-30; learning 2026-09-30-the-client-website-is-part-of-the-asset-register; decision 0008
---

# Real-material intake

**Why:** decision [0008](../../knowledge/decisions/0008-real-client-material-first-for-video-ads.md) makes real client material the default picture source. That only works if the register is complete. On TripNerd, days of searching Drive and Higgsfield missed five videos, 15 attributed reviews and the published package lines; they were on the client's own site.

**When:** at the start of any video or static advert for a client, before concept work, and again whenever a client sends new material. It is the "asset register" question that `servicepow-video-production` makes mandatory.

**Time:** about 15 minutes for the crawl, plus the owner's answers.

## Steps

1. **Crawl the client's website** (home, every service or event page, `/reviews`, `/about`, the blog index).
   - The local proxy usually blocks client sites. Fetch from the Higgsfield sandbox (`sandbox_exec`), and keep the HTML in one command: sandbox files vanish between calls.
   - **Videos:** search the raw HTML case-insensitively for `vimeo`, `youtu`, `wistia`, `vidyard` and `.mp4`/`.webm`/`.mov`. Embeds are often **URL-encoded** (`vimeo.com%2Fvideo%2F…`). Read length, title and upload date from the platform's public oEmbed. **Do not download platform-hosted video.** Ask the client for the masters.
   - **Reviews:** copy them **verbatim with the name as shown**, and note where they come from (Google, Facebook). Mark each one: usable, names a third-party mark, private or sensitive, or weak.
   - **Claims:** copy the published package or offer lines per page and the disclaimers ("not affiliated with…"). Note any **internal contradiction** between pages (dates, prices, inclusions).
   - **Images:** list every non-logo image (prefer the original over the resized copy). Build one numbered contact sheet and **view it**. Classify each as real client photo, stock, or unsure, by eye, and say it is provisional.
2. **Then the other shelves:** Higgsfield videos and images, Drive, the owner's computer (raw clips, originals), and large files the connectors cannot carry (a `.mov` over the connector limit needs a link from the client).
3. **Write the inventory** into the campaign folder (`real-material-inventory.md`): videos, reviews, claims, image classification, inconsistencies. Link it from the Bible's CLIENT TRUTH line.
4. **Write the asks** as one consolidated request to the client: masters of every video, original full-resolution photos, permission to quote reviewers by name, written confirmation of any package line that will appear in an advert, staff and guest consent, and fixes for any inconsistency on their own site.
5. **Only then** write concepts. Mark each idea's material as available now or needing an ask.

## Rules this intake enforces
- **Reviews:** verbatim only, with attribution. No star ratings and no counts without an Evidence Record. Never pair a quote with a photo that implies the reviewer is in it. Never use a private or sensitive review.
- **Published claims** satisfy destination parity but are not Evidence Records. An email from the client confirming the wording is enough to make one.
- **Stock and event-organizer images are not the client's photos.** Their rights are unknown; they do not enter a build.
- **Third-party marks** in any image, review or claim stay out.

## Traps already hit
- Searching for `vimeo.com/video/` returns nothing; the embeds are encoded.
- A crawl shows what is published, not what exists. Videos on a site can be the client's best footage or a logo animation: the thumbnail is one frame, so watch before counting it.
- Higgsfield's upload call can fail for a whole session. The Adobe block-upload bridge can carry an image to a viewer (see `knowledge/learnings/2026-09-29-adobe-touch-up-on-higgsfield-media-needs-a-bridge.md`).
