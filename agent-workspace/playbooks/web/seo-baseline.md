---
title: SEO Baseline
type: playbook
client: internal
owner: NEEDS INPUT
status: active
created: 2026-08-24
updated: 2026-08-24
tags: [web, seo, technical, launch]
---

# SEO Baseline

**When to use:** every site Service Pow ships, and as an audit of any site we inherit.

This is the floor, not a strategy. It's the work that stops a site being invisible.
Ranking competitively for contested terms is a separate, ongoing engagement — don't let
a client conflate the two, and don't let a proposal imply the baseline will produce
rankings on its own.

---

## Crawlability

- ☐ `robots.txt` present and not blocking anything important
- ☐ No stray `noindex` — check the live domain after launch, not staging
- ☐ XML sitemap generated, accurate, and submitted to Search Console
- ☐ One canonical version of the site (www vs non-www, http vs https) with the rest redirecting
- ☐ Canonical tags on pages that need them
- ☐ No orphan pages — everything important is reachable by link
- ☐ Site returns proper status codes: 200 for real pages, 301 for moves, 404 for gone

## On-page

For every page that matters:

- ☐ **Title tag** — unique, descriptive, front-loaded with the term that matters.
      Roughly 50–60 characters before truncation.
- ☐ **Meta description** — written as ad copy for the search result, not a keyword dump.
      Roughly 150–160 characters. It doesn't affect ranking; it affects clicks.
- ☐ **One H1**, matching the page's actual purpose
- ☐ Heading hierarchy in order — H2s under the H1, H3s under H2s. Don't pick headings for
      their size.
- ☐ Descriptive URL slug, lowercase, hyphenated, no dates unless the content is dated
- ☐ Internal links to related pages with meaningful anchor text — not "click here"
- ☐ Image alt text that describes the image
- ☐ Content that actually answers the query the page targets

## Technical

- ☐ HTTPS everywhere, valid certificate, no mixed content
- ☐ Mobile-friendly and tested on a real device
- ☐ Page speed: compressed images in modern formats, correctly sized, lazy-loaded below
      the fold; scripts audited for anything that isn't earning its weight
- ☐ Structured data where it fits — Organization, LocalBusiness, Product, Article, FAQ,
      Breadcrumb. Only mark up what's genuinely on the page.
- ☐ No duplicate content across URLs
- ☐ Language and region declared if relevant

## Local

Where the client serves a geographic area:

- ☐ Google Business Profile claimed, complete and accurate
- ☐ NAP — name, address, phone — identical everywhere it appears, on-site and off
- ☐ LocalBusiness structured data with the correct address and hours
- ☐ Location pages for each area served, with genuinely distinct content
      *(near-duplicate location pages are worse than one good one)*
- ☐ Consistent listings on the major directories for the client's market

## Measurement

- ☐ Search Console verified, sitemap submitted, no coverage errors outstanding
- ☐ Analytics recording organic sessions and conversions
- ☐ **Baseline recorded before any changes** — rankings, organic traffic, top landing
      pages, conversion rate. Without a baseline there's no way to demonstrate the work
      did anything, and no way to notice when something breaks.

---

## Migration warning

Every SEO disaster we can prevent is a redirect that didn't get built. On any rebuild or
domain change:

1. Crawl the old site and export **every** URL.
2. Pull the pages with traffic, backlinks or rankings.
3. Map each to a new destination — a real equivalent, not a blanket redirect to the
   homepage, which search engines treat as a soft 404.
4. Implement as 301s, not 302s.
5. Test every one after launch.
6. Watch Search Console for a month.

## Honesty rules

- Never guarantee rankings. Nobody can.
- Never present a traffic figure without its source and date.
- Never claim a ranking improvement without a before-figure recorded at the time.
- If a client's expectations and their budget don't meet, say so in writing early.

## Related

- [`website-build.md`](website-build.md)
- [`../client-lifecycle/reporting.md`](../client-lifecycle/reporting.md)
