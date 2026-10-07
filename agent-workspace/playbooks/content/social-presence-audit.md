---
title: "Social and online-presence audit: what works from a cloud session, and its limits"
type: playbook
client: internal
owner: Karl
status: active
created: 2026-09-30
updated: 2026-09-30
tags: [content, social, audit, presence, client-intelligence, method]
source: TripNerd presence audit, 2026-09-30 (clients/tripnerd/marketing-plan/2026-09-30-online-presence-audit.md)
---

# Online-presence audit

**Use when:** a client wants a growth plan for social and search, before any strategy is written. It feeds `servicepow-client-intelligence`. Pair it with [`../ads/real-material-intake.md`](../ads/real-material-intake.md) for the asset side.

**Output:** one dated audit file in the client's folder: a register of every channel, each number labeled CONFIRMED / INFERRED / UNKNOWN with its source, plus an UNKNOWN list that names who can answer.

## Method that worked (all from the Higgsfield sandbox, about 45 minutes with retries)

| Need | What worked | Limit |
|---|---|---|
| Find the client's own accounts | Extract every external link from the website home page and footer, then check each one | Accounts the site does not link can still exist (TripNerd's TikTok, YouTube and X were unlinked) |
| Find unlinked accounts | Try the obvious handles (`/@brand`), then verify ownership from the bio: it must name the client's website or use the client's brand phrases or hashtags | A handle that exists is not automatically theirs. Log it INFERRED until the client confirms |
| LinkedIn company page | The public page returns the follower count in its meta tags, the employee count and description in its JSON-LD, and about ten recent posts with relative dates | No engagement counts in the public HTML |
| TikTok profile | The public page embeds the profile data: created date, followers, videos, likes, bio | Counts are a snapshot |
| YouTube | The public feed `youtube.com/feeds/videos.xml?channel_id=…` lists the latest videos with dates and views; the channel page shows "doesn't have any content" for an empty channel | Subscriber counts are hidden in newer page layouts |
| Instagram post dates | The post URL code decodes to the post's upload date (the code is a base-64 encoding of the media ID, whose high bits are a millisecond timestamp) | Only for posts that surface in search, and it is INFERRED, not read |
| Facebook and Instagram numbers | Search-engine snippets sometimes show a like count | Undated and often stale (Facebook's "talking about this" metric was retired, so a snippet that shows it is old). **Never cite it as current** |
| Website technical baseline | Crawl the sitemap with parallel fetches: titles, descriptions, social preview tags, canonical tags, noindex, status codes, word counts, tracking scripts | Match meta tags in **both attribute orders** (`content=` before or after `property=`); a single-order check wrongly reported no social tags on the first pass |
| Review sites and listings | Search for each by name | A missing search result is not proof of absence. The BBB blocks bots |
| Search visibility | A few non-branded queries for the client's headline products, noting who appears | The search tool is not a rank tracker. The real data is Search Console |

## Do not
- Log in, use a scraping service, or work around a login wall. Log the number UNKNOWN and ask the client for an export or access.
- Quote a follower count without its source and date.
- Treat an unlinked handle as the client's until the bio or the client confirms it.
- Repeat the client's own unsupported claims ("#1", "100% guarantee", "VIP") in anything we make. Record them as risks.

## The checklist
1. Website crawl: links, tags, tracking, sitemap, metadata, forms, email capture.
2. Every social channel: linked or not, verified how, size, activity, who runs it.
3. Video hosting: which account owns the videos.
4. Listings and reviews: Google Business Profile, BBB, industry sites.
5. Business details (name, address, phone) compared across every source.
6. The client's own claims on its profiles.
7. A peer set as the platforms see it (LinkedIn "Similar pages") and from search, to be confirmed with the client.
8. An UNKNOWN list with the role that can answer each and what it blocks.
9. Only then, a short "what this points to" section, labeled INFERRED or HYPOTHESIS.
