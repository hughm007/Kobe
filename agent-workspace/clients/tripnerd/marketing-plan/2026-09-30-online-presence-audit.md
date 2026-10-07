---
title: "TripNerd — online presence audit (step 1 of the growth plan)"
type: report
client: tripnerd
owner: Karl
status: active
created: 2026-09-30
updated: 2026-09-30
tags: [client, audit, social, online-presence, baseline, client-intelligence]
---

# TripNerd — online presence audit, 2026-09-30

Ground truth for the follower and presence growth plan (`README.md` in this folder). Labels follow the evidence ladder: **CONFIRMED** (primary source, cited), **INFERRED** (reasoning stated), **UNKNOWN** (not established), **HYPOTHESIS** (a bet to test). Research only: nothing was published, posted, bought or logged into.

## Summary

1. **LinkedIn is the live channel.** 1,296 followers, and about ten posts in the last three weeks (CONFIRMED). Everything else is weak, stale or unverifiable.
2. **Seven social or video presences exist**, but **only three are linked from the website** (Facebook, Instagram, LinkedIn). TikTok has 4 followers and is dormant. YouTube is an empty channel. X is probably theirs but unlinked. Their five videos sit on **a personal Vimeo account**, not a brand account.
3. **Facebook and Instagram numbers are not verifiable from here.** Facebook's only figure is an undated search snippet (2,731 likes). Instagram shows no figure. Owner-side exports decide the baseline.
4. **The website is capturing data but not growing an audience.** It carries GA4, Meta Pixel, LinkedIn Insight and HubSpot scripts, but **has no email signup anywhere**, no social preview image on the home page, no canonical tags on any of 52 pages, and event-page descriptions with template errors ("oceanfront hotel" on a Louisville page).
5. **TripNerd did not appear in search results for its own headline events** (Kentucky Derby hospitality, THE PLAYERS 17th-hole suite). Official sellers and peers did (INFERRED; needs Search Console data).
6. **The business details disagree across platforms** (Chicago on the site and LinkedIn; Waunakee and Glendale, Wisconsin on BBB and Facebook).
7. **Several claims on TripNerd's own profiles have no evidence behind them** ("#1 Fan Concierge Service Company in the Industry", "100% Guarantee", "VIP"). We must not repeat them in anything we produce.

## 1. Method and limits (read this before trusting a number)

- **Tools:** the Higgsfield sandbox (this container cannot reach tripnerd.com or the social networks), public profile pages, YouTube's public feed, Vimeo's public oEmbed, search-engine snippets.
- **Blocked or walled:** Facebook and Instagram return login walls (HTTP 400 and 429); BBB sits behind a bot check (403); LinkedIn, TikTok, X, Pinterest and YouTube returned public pages. The session's web fetch tool is blocked from all three big networks.
- **Not done, on purpose:** no logins, no third-party scraping services and no attempt to get around a login wall. Numbers behind a wall are logged UNKNOWN for the owner to supply.
- **Search results are not rankings.** The search tool I used is not a rank tracker; the search-visibility section is a pointer, not a measurement.
- **Dates:** everything was read on 2026-09-30.

## 2. Presence register: every channel found

| Channel | URL or handle | Linked from website? | What is verified (and how) | Followers / size | Activity | Status |
|---|---|---|---|---|---|---|
| **LinkedIn company page** | `linkedin.com/company/tripnerd` | **Yes** | Public page fetched. Name "TripNerd, LLC"; slogan and description below; Chicago address; 29 employees in the page's schema (members who list TripNerd, not staff count) | **1,296** (CONFIRMED, page meta) | **10 visible posts dated 1 day to 3 weeks ago** (INFERRED from relative timestamps) | **Active** |
| **Facebook page** | `facebook.com/TripNerdFanExperience` | **Yes** | Login wall from here. Search snippets of the public page: name "TripNerd", tagline "SPREADtheNERD!", location Waunakee WI, reviews tab exists, native videos (titles in §7) | **2,731 likes, "156 talking about this"** per an undated snippet (the "talking about this" metric has been retired by Facebook, so the snippet is old; treat as stale) | UNKNOWN | **Exists; numbers stale or unknown** |
| **Instagram** | `instagram.com/tripnerd` | **Yes** | Login wall (HTTP 429). Two public post URLs surfaced in search; their dates decode from the URL codes to **2023-03-18** ("Sneak peek!! Q2 NEW website launch…") and **2025-10-04** ("It's simply the BEST in golf! The TripNerd 17th Hole 'Island…'") (INFERRED from the decode) | UNKNOWN | UNKNOWN (two dated posts only) | **Exists; size and cadence unknown** |
| **TikTok** | `tiktok.com/@tripnerd` | **No** | Public profile fetched. Bio: "What sporting event is on your bucket list? ⛳️🏀🏈⚾️🏎🏇 tripnerd.com". Created **2022-04-05**. The bio names the website, so it is TripNerd's | **4 followers, 4 videos, 14 likes** (CONFIRMED) | Dormant | **Claimed, unused** |
| **YouTube** | channel `UCpFWBQIOwCfkdeoJyANsHdA` (`youtube.com/@TripNerd`) | **No** | Channel page and public feed fetched. Created **2025-03-23**, page says "This channel doesn't have any content", no description | 0 videos | None | **Empty; ownership UNKNOWN** (no proof it is TripNerd's; INFERRED from the name) |
| **X (Twitter)** | `x.com/tripnerd` | **No** | Public page fetched. Bio: "Allow us to help you and your clients gain access to bucket list experiences that will create lifelong memories. #spreadtheNERD". The hashtag matches Facebook's tagline, so **INFERRED theirs** | UNKNOWN | UNKNOWN | **Probably theirs; unlinked** |
| **Pinterest** | `pinterest.com/tripnerd` | **No** | The page responds, but its content could not be read | UNKNOWN | UNKNOWN | **Unverified; low priority** |
| **Vimeo** | five videos under the account "Jason Driscoll" (`vimeo.com/user117769548`, a Plus account) | Embedded on the site | oEmbed author and upload dates (see `../campaigns/2026-09-30-five-more-real-footage/real-material-inventory.md` §1) | 5 videos, 2020–2026 | Latest upload 2026-03-12 | **Hosted on a personal account, not a brand account** (INFERRED from the author name; ownership and transfer risk) |
| **Google Business Profile and reviews** | the site links "Read all Google Reviews" to a Google search for "TripNerd, LLC Chicago" | **Yes** | The site shows 15 named reviews (verbatim in the inventory). The profile itself could not be read | The brief says **43 five-star Google reviewers** (from the 2026-08-25 company OS; not re-verified today) | UNKNOWN | **Count and rating UNKNOWN** |
| **BBB** | `bbb.org/us/il/chicago/profile/travel-services/tripnerd-llc-0654-1000122800` | **Yes** (plus an "A rating" badge image on the site) | Page blocked (403). Search snippet: categories Event Ticket Sales, Travel Agency, Concert Promoters; two Wisconsin locations (Waunakee and Glendale) | n/a | n/a | **Rating UNKNOWN. Verify before anyone quotes "A rating"** |
| **Other review sites** (Yelp, Trustpilot, Tripadvisor) | none found in search | No | Absence from search results is not proof of absence | n/a | n/a | **UNKNOWN** |
| **Press and media coverage** | none found in search | No | Same caveat | n/a | n/a | **UNKNOWN** |

**LinkedIn description (CONFIRMED, their words):** "Ultimate Fan Experiences. Sports fanatic trips! Over 20 years of direct industry experience in delivering bucket list events to corporate America. Super Bowl, Phoenix Open, THE PLAYERS, Final Four, Ryder Cup, Golf MAJORS, Country Music Awards, and much more…" Slogan: "Ultimate Fan Experiences! Partner with the #1 Fan Concierge Service Company in the Industry. Trip like a Nerd."

## 3. What TripNerd posts on LinkedIn (CONFIRMED from the public page)

The ten visible posts are long text posts in one consistent, polished corporate voice. Media type, reaction counts and comment counts are **UNKNOWN** (none appears in the public HTML). Themes, newest first:

1. The value of a great experience lasts after the event ("the story clients bring up months later").
2. The person who ends up managing the group gets to enjoy it too.
3. Experiences worth doing right, without compromises.
4. Access is not reserved for people with the right connections.
5. Premium experiences are much more than securing a ticket.
6. Client entertainment beyond another restaurant reservation.
7. The gap between "bucket list" and "on your calendar".
8. The work behind the scenes starts much earlier.
9. "Access Nerd. Hospitality Nerd. Accommodations Nerd. Logistics Nerd. On-site Nerd."
10. Augusta as a lifelong goal that rewards early planning.

**Reading (INFERRED):** the audience is corporate hosts and group organizers, which matches the client brief's higher-ticket B2B track. The nine-themes-in-three-weeks cadence suggests a scheduler or an agency; **who runs it is UNKNOWN.** The posts are all words: nothing seen uses the real photos or videos we now hold.

**LinkedIn's "Similar pages" (peer set as LinkedIn sees it, not a verified competitor list):** All Access GTE, FlexEvents LLC, Premier Golf Travel Arrangements, Your Golf Travel, 8AM Travel, Elevate Golf, Golfbreaks, USGA.

## 4. Website: technical and search baseline (CONFIRMED, fetched 2026-09-30)

| Item | Finding |
|---|---|
| Platform | Webflow; site design credited to Peacetime Propaganda in the footer |
| Size | 52 URLs in the sitemap. Sitemap `lastmod` runs 2026-02-05 to **2026-09-14**, so the site is being edited |
| Speed | Home page 78 KB, downloaded in 0.26 s from the sandbox. A full Lighthouse run could not be done (the public API quota was exhausted), so mobile performance is **UNKNOWN** |
| Redirects | `http://tripnerd.com` goes to `https://www.tripnerd.com` (correct) |
| Social preview tags | `og:title`, `og:description` and `twitter:card` are present on the home page, but **`og:image` exists on only 5 of 52 pages (the blog posts)**. Shared links from the home and event pages carry no image (HYPOTHESIS: weaker link previews) |
| Canonical tags | **None on any of the 52 pages** |
| Structured data | **None** (no JSON-LD) |
| `noindex` | 21 pages carry it (including the property pages) |
| Sitemap hygiene | One listed URL returns **404** (`/properties/3705-inverness-way---allen`). The 22 property pages carry surnames in their URLs (INFERRED: the Augusta executive homes) |
| Event-page descriptions | **Templated, with errors:** "…with VIP seats, hospitality suite, and oceanfront hotel" appears on the Derby, Augusta, CMA Fest, Phoenix, Super Bowl and THE PLAYERS pages (an oceanfront hotel in Louisville, Nashville and Augusta); the CMA, Phoenix and Super Bowl descriptions have a blank date ("…hotel. packages available."); Augusta says "April 2026 & 2027" while the page says 2027 and 2028 |
| Thin pages | Daytona, Phoenix, Super Bowl, CMA, F1 and tennis event pages hold about 170–240 words each. Derby, THE PLAYERS, Augusta and US Open Golf hold about 665–690 |
| Calendar pages | `/calendar/*` meta descriptions are 23–41 characters |
| Blog | **5 posts** between 2025-07-19 and 2026-06-28: about one every two months |
| Email capture | **None.** One form (the contact form), no newsletter or subscribe text anywhere |
| Accessibility basics | 0 of 25 home-page images lack alt text (good) |

## 5. Tracking and owned-audience plumbing

| Tool | Finding (CONFIRMED from page source) |
|---|---|
| Google Analytics 4 | Installed: `G-YYWZH6HL7E` |
| Meta Pixel | Installed: `1326206675807966` (conversion events fired: UNKNOWN) |
| LinkedIn Insight Tag | Installed (partner ID not recorded) |
| HubSpot | A HubSpot script is present. Whether HubSpot is the CRM or email tool is **UNKNOWN** |
| Google Tag Manager | **Absent** |
| Google Ads tag | **Absent** |
| TikTok pixel | **Absent** |
| Cookie-consent banner | **None detected** (checked for the common consent-tool names only, so not exhaustive). Three advertising trackers are installed. **Flag for the client's counsel** (not legal advice) |
| Email platform | **UNKNOWN.** The client brief records nine years of past attendees and no signup form anywhere |
| Whether any paid ads run | **UNKNOWN** (the Meta Ad Library needs the owner's view) |

## 6. Reviews, proof assets and video

- **15 named Google reviews** are shown on the site, verbatim with usability flags, in `../campaigns/2026-09-30-five-more-real-footage/real-material-inventory.md` §2.
- **Five videos** (two real suite tours, a Derby film, a brand film, a 2020 whiteboard explainer): same file, §1. Facebook holds native copies of at least "What Is The TripNerd Experience?" and "TripNerd Commercial".
- **Other Facebook video titles seen in search snippets:** "Wait for it… #militaryappreciation #theplayers", "16th Hole Phoenix Open – TripNerd" ("Good morning from the most electric hole in golf! #tripnerd #spreadtheNERD #16th"), and "Did You Know? The Notorious 16th Hole is the loudest hole in golf!". Hashtags in use: **#spreadtheNERD**, #tripnerd.

## 7. Search visibility snapshot (INFERRED; the tool is not a rank tracker)

| Query | What came back | TripNerd in the results? |
|---|---|---|
| Kentucky Derby hospitality packages, suites, corporate hosting | Churchill Downs (official suites), SportsTraveler brochures, a Derby Experiences page ("Official Experience Package Provider to Churchill Downs"), Pearl | **No** |
| THE PLAYERS Championship 17th hole hospitality suite package | tpc.com and theplayers.com (official hospitality), Golfbreaks, SportsTraveler, GolfWRX | **No** |
| Brand queries | TripNerd's LinkedIn page, a LinkedIn cover-photo result and a third-party company profile | Yes (LinkedIn) |

**Candidate peers for step 4 (to be confirmed with the client; UNKNOWN which ones TripNerd actually competes with):** SportsTraveler, Derby Experiences, Golfbreaks, All Access GTE, FlexEvents, Premier Golf Travel.

## 8. Consistency of business details (NAP)

| Source | Name | Address | Phone |
|---|---|---|---|
| Website footer and LinkedIn | TripNerd, LLC | 514 N Peshtigo Ct, Suite #3711, Chicago, IL 60611 | (608) 438-2050 |
| BBB (snippet) | TripNerd LLC | 114 E Main St Ste 221, Waunakee, WI 53597; and 2916 W Vera Ave, Glendale, WI 53209 | 608-438-2050; 414-434-0704 |
| Facebook (snippet) | TripNerd | Waunakee, WI | not seen |

The phone number is a Wisconsin number. The client brief already notes that the Chicago address "resolves to a residential condo" and is the CAN-SPAM address. **Which address is the legal business address is UNKNOWN.** This matters for listings, Google Business Profile, and any email program.

## 9. Claims on TripNerd's own profiles (carried as risk; not ours to fix)

| Claim | Where | Status |
|---|---|---|
| "#1 Fan Concierge Service Company in the Industry" | home meta description, about page, LinkedIn slogan | No Evidence Record. **Do not repeat** |
| "100% Guarantee" | about page | No Evidence Record. A guarantee needs the business's confirmation that it will honor it |
| "VIP" (event names, descriptions, reviews) | site, meta descriptions | No evidence behind it. Our standing rule keeps it out of our copy |
| "The loudest hole in golf" | Facebook video | A superlative; same rule |
| "Over 20 years of direct industry experience" | LinkedIn | A years-in-business claim; needs an Evidence Record before we use it |
| "BBB A rating" | badge on the site | Rating unverified (BBB blocked to us) |

## 10. UNKNOWNs that block the plan

| Question | Who can answer | What it blocks |
|---|---|---|
| Can we get admin or analyst access to the Facebook and Instagram accounts (Meta Business), the LinkedIn page, GA4, Google Business Profile, Search Console, HubSpot, and YouTube/TikTok/X? | CLIENT_APPROVER | The real baseline: followers, reach, engagement, traffic, leads |
| Who runs the social accounts today (staff, Peacetime Propaganda, a scheduler) and how are posts approved? | CLIENT_APPROVER | Step 6 (workflow), and whether we replace or join the current approach |
| What does "growth" mean to TripNerd in numbers and in time, and what budget exists per month for content and for paid? | CLIENT_APPROVER and APPROVER | Targets and the measurement window (the workspace's advertising rules require an objective, a target cost-per-outcome, an audience and a window before spend) |
| Which events are the commercial priority over the next six to nine months, and which audience is the priority: corporate hosts or individual fans? | CLIENT_APPROVER | Platform roles and the content calendar |
| Is the YouTube channel, the TikTok account and the X account TripNerd's, and are the logins held? | CLIENT_APPROVER | Step 7 (profile cleanup), and whether to claim or retire them |
| Who owns the Vimeo account? Can the videos move to a brand account, and where are the masters? | CLIENT_APPROVER | The video library and every video-forward idea |
| Which business address is the legal one, and is the BBB record current? | CLIENT_APPROVER | Listings, email compliance, the "A rating" line |
| Size and health of the email list (nine years of attendees) | CLIENT_APPROVER | The owned-audience step |

## 11. What this points to (INFERRED or HYPOTHESIS, to be tested, not decided)

1. **Followers are a weak goal on their own.** TripNerd sells high-ticket packages to a small set of buyers, often corporate. A follower matters only if it is a buyer, a referrer or proof. **RECOMMENDATION:** make qualified inquiries the north star, with followers, email signups and search visibility as leading indicators, and set the targets only after the baseline is real (step 2).
2. **LinkedIn is where the corporate-host buyer is reachable today** (HYPOTHESIS; the page already has momentum and the audience fits). Facebook and Instagram probably carry the individual-fan buyer. TikTok and YouTube are unbuilt.
3. **The richest unused asset is content, not a channel:** real photos, suite tours, 15 named reviews and six published package pages (decision 0008). LinkedIn currently posts none of it.
4. **The owned audience is the gap with the largest upside per dollar** (HYPOTHESIS): nine years of attendees, no signup form, no email program.
5. **Fix the plumbing before spending to grow:** social preview images, canonical tags, event-page descriptions, Tag Manager and conversion events, one business address. These are cheap and they make every later post and ad work harder.

## Addendum 2026-10-04 — Instagram figures stated in the owner's growth plan

The owner's 12-page Instagram growth plan (digest: [`2026-10-04-instagram-growth-plan-digest.md`](2026-10-04-instagram-growth-plan-digest.md)) states for `instagram.com/tripnerd`, "observed 11 Sep 2026": **4,730 followers, 253 median Reel views, 0 Reels in the 20 days before that audit, 3.2 posts a week, mostly static graphics.** This audit could not read the profile on 2026-09-30 (login wall), so the §2 row stays UNKNOWN from our own observation; the plan's figures are carried as **stated, not verified by us**. The plan itself re-baselines from Instagram Insights in week one, which settles it. Who observed the 11 Sep figures, and from which account, is an open question.
