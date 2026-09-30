# 2026-09-29 — Website refinement pass (design cleanup, not a redesign)

**Repo:** `hughm007/servicepow-v2` @ `claude/v4-frame-landing` — `6acab60` … `7338a98`
(10 commits, `Refine 1/n` → `9/n` plus a hero accessibility fix).
**Baseline before the pass:** `122b99b` (on the remote branch; also tagged locally as
`baseline/pre-refinement-2026-09-29` — the tag push was refused by the session's git proxy, so the
commit SHA is the restore point: `git checkout 122b99b -- .`).
**Preview (private):** https://claude.ai/artifact/UUbKD8g9NTi7MzZgDagdLt (version 20). Not deployed —
servicepow.com is untouched; production still needs decision 0006 + a BC-50 approval line.

## Owner brief (paraphrased)

Remove irrelevant and repeated content from source; one strict type scale as tokens; one primary
CTA per page with clearly secondary actions; one accent; a consistent spacing scale, shared grid and
shared components. Keep structure, branding, routing and behaviour; no new features or
dependencies; small commits; screenshot every page and verify visually.

## Owner decisions (2026-09-29 — "go" on the plan)

| # | Decision | Applied |
|---|---|---|
| 1 | Remove four home sections: proof strip, Our Promise, home sample-audit preview, seven-stage diagram | Yes — the sample preview stays on /growth-audit, the stage explorer on /about. Launch gate 8 (promise sign-off) closed in `CONTENT-NEEDED.md` |
| 2 | Header "Free growth audit" becomes an outline button | Yes |
| 3 | Resting gold glow only on dark grounds; hover pop/lean stays on every button | Yes |
| 4 | Keep the /work WORK wordmark as the one documented size exception | Yes (`.wordmark-fill`) |
| 5 | Plumbing H1 reads as an aim: "Marketing built to book jobs, not just clicks." | Yes |
| — | Does the free audit cover social media? (the site's lists disagree) | **Open** — left as is; see `../OPEN-QUESTIONS.md` |

## What changed

- **Content:** home −30% desktop / −31% phone (11,640 → 8,186 px; 18,379 → 12,592 CSS px);
  /growth-audit −24% / −19%. Repeated sections and lines cut on every page; the three non-audit
  FAQs moved to /pricing. Dead code removed (unused exports, JSON keys, CSS, 16 legacy colour
  aliases, 4 images, BeforeAfter slot, ~140 stray Tailwind utilities from docs folders).
- **Compliance fix found in audit:** the case-study ad note was missing "Shown as delivered" and
  "No campaign results are claimed." — now the single approved note everywhere.
- **Typography:** 8 `@theme` tokens with line-height/tracking/weight companions (poster, title,
  heading, subheading, item, lede, body 17/1.6, caption 14); Tailwind's default scale cleared; ~70
  one-off sizes removed; Work Sans 400/600/700; nothing below 14px; no italics.
- **Hierarchy:** one solid gold primary per view, `.btn-lg` (56px) for the page's primary action;
  outline secondaries; gold reserved for decisions; muted eyebrows/numerals on dark.
- **Layout:** tokens for page-top, header height, 12-col gutter, section-head gap, text and heading
  measures, error colours; shared `CtaBand`, `SectionHeader`, `Breadcrumbs`, `IndexList` and
  `.pill` / `.callout` / `.panel` / `.card-link` / `.ruled-list`; three section grounds.

## Follow-up — Working-with steps as a sequence (`a39439a`)

Owner found the home "Working with ServicePOW" section bland and asked about per-step photos.
Recommended against stock/AI imagery (no real process photos exist; generic pictures read as
filler). Owner chose: the four steps as one numbered row joined by a thin line, gold marker on
01. Built as a horizontal row from 1024px, a vertical rail below it; header now full width; the
two notes each span two steps. Build clean, e2e 61/61, screenshots at 1440 and 390 reviewed.

**Then (`aa27089`):** the steps are clickable. Clicking anywhere on a step (or its marker by
keyboard; 44px targets, `aria-pressed`) makes it the focal point: gold marker with a halo, a
one-off pop (marker 2.2x burst + ring; text lifts 14px, scales 1.08 desktop / 1.05 phone from
its left edge), then it settles. Step 01 is the resting focus; nothing animates on load. Peak
frame measured clear of the next column; no horizontal overflow at 390. e2e 61/61.

**Then (`18663e5`) — home 911drain case card, owner chose option 1 of 3.** Measured problem at
1440: the copy column ended at 479 of 1,038px (54% empty), and the held third ad shrank the ad
frame to 2/3 width, leaving ~320px of dead space between ads and copy. Fix: ads fill a 7-col
media column; ad note at caption size; copy column (5) = one-line objective + "What we built"
(the five deliverables, sourced from the case study's own system list — no new claims, no
metrics) + disclosure + link. From 1280px the site shot grows (2:1 minimum) so both columns end
level — measured equal at 1920/1440/1366/1280; 768–1279px stacks the work above a two-column
story/scope row. e2e 61/61, no horizontal overflow at any width tested.
Open: the "Static ad set" line names three ads ("hard water, a clogged drain, and the
after-hours call") but the third is held (sewer-scope), so two show — the same line is on the
case study page.

**Then (`06edf7c`) — brand accents on Selected Work** (owner: the cream section read blank next
to the rest of the page). Within the site's own palette rules (gold is fill, line and marker on
cream, never text): a gold highlighter band behind "job to do." (sweeps in with the reveal;
static with no JS / reduced motion — both checked), the steps' gold diamond as a marker on the
eyebrow and on each "What we built" row, the chip as a night badge with gold type, ad-frame
brackets in gold-ink. `.gem` and `.hl` are reusable if the owner wants them on other cream
sections. Note: `company/brand/visual-identity.md` still describes the superseded blue/Fraunces
direction; the live site system is gold/night/cream in `globals.css`.

**Then (`e46abc5`):** the highlight is a full-height gold block behind "job to do." (owner: the
half band stopped below the j's dot). From 1280px the section header and the 911drain article
share one 12-column grid via subgrid, so the story/scope column starts level with the eyebrow
and fills the corner beside the heading (owner: that corner read empty); section ~150px
shorter; columns still end level (measured 1280–1920). Learned: items that overlap a grid row
need explicit column starts, or auto-placement pushes them into new implicit columns.

**Then (`73c249b`):** the highlight is scroll-linked (owner: make it fill as you scroll from
the hero down). `ScrollHighlight.tsx` sets `--hl` 0–1 from the heading's position: 0 until the
heading rises past the bottom edge, 1 when it reaches the top third, reversing on scroll up.
Measured by wheel-scrolling at 1440×900 and 390×667, on both the Next build and the static
preview bundle; full with no JS and with reduced motion. The old timed sweep fired on page
load on desktop, before the visitor scrolled — why the owner never saw it.

**Then (`017a9e9`) — home "What we do" filled** (owner: too much blank space). Measured at 1440:
intro column content ended at 463 of 728px; three of five discipline names wrapped to 2–3
lines in a 4/12 name track while each promise was one short line. Fix: name on one line; the
promise beside the discipline's service list (services.json — no new claims), from 1024px only;
trade chips moved under the pricing line; gold marker on the eyebrow; intro column sticky on
screens >=1024x800 (`.stick-tall`), releasing where the list ends. Section 958 -> 1,067px at
1440; phone 1,514 -> 1,583px. One full e2e run failed the phone action-bar test once (scrolls
to ~1,860px; this section starts at 3,108px on phones); it passed 5/5 isolated and 61/61 on the
full rerun — cause not identified, logged here in case it recurs.

**Then (`a10631e`) — two owner-reported bugs.** (1) "Pages don't go back to the top": in
Chromium only a link to the *current* page (Home at the foot of home) kept the position;
other routes reset. Fixed anyway for every path: `RouteFocus` sets the window to the top
instantly after each pathname change (smooth scrolling can stretch or interrupt the router's
jump; the owner's viewer may differ from Chromium), skipping Back/Forward and #section links;
same-page link clicks scroll to the top. Verified on the Next build and the static preview
(1440 and 390; header, footer, same-page; Back restores; /services#brand still lands on the
section). (2) "The glow disappears when scrolling": not scroll-linked — the breathing glow
dimmed to 0.35 every 4.8s. Now pulses 0.8–1 (measured min 0.80 over 10s incl. scrolling); the
scroll highlight also no longer unwinds on scroll-up. Not reproduced in the owner's own
browser (WebKit untested here).

**Then (`db0e634`) — missed-call calculator as a draggable chart** (owner asked for a graph
with missed calls on the y-axis and money on the x-axis). Built with the conventional axes
instead — calls along the bottom, dollars up the side — because "higher = more money lost"
reads faster and dollar labels fit on phones; dragging up still raises the count (the marker
follows the pointer's height). Swap is small if the owner insists. **Changed an approved
rule:** the calculator had no defaults (brief P2-2); it now opens on the placeholder example
(12 calls, 40%, $350) tagged "Example numbers" until the visitor changes anything — no
announcement and no `calculator-used` event for the example; still never an industry
average; the action stays a phone call, never the audit (EV-sp-001). Needs owner
confirmation. Learned: `Intl.NumberFormat` compact notation renders "$0.0" in Node and "$0"
in Chromium — a hydration mismatch (React #418) caught only by the console-error e2e test;
chart labels are hand-formatted now.

**Then (`23ee77e`) — mobile pass** (owner: nothing cut off or left out on phones). Automated
audit of 16 routes × 9 sizes (320–430 portrait, 667×375 and 844×390 landscape, 768): sideways
scroll, elements past the screen edge, text clipped by its box, tap targets < 24px, text < 14px,
inputs < 16px (iOS focus zoom), and every line of desktop text checked for on phones. Plus four
parallel visual reviews of 36 contact sheets (every page at 320 and 390), each finding
re-verified before acting. Fixed: the home service lists hidden on phones (restored); a race
where the calculator chart widened its column 19px past a 320px screen (grid locked to
`minmax(0,1fr)`, chart fills its box); chart tick labels under the readouts; 32px sliders
(now 44px); video start button overlapping the native control bar on small players; the phone
action bar leaving only 237px of page in landscape (hidden under 480px tall); the gallery index
badge covering the client's wordmark; a cut-off placeholder; stranded words/separators.
Rejected as capture artifacts after checking on a real scroll: "missing" footer logo and blank
case-study images (lazy images a one-shot full-page capture never scrolls to). Final audit:
144/144 clean; e2e 61/61. Not verified: Safari/iOS and real devices.

**Then (`40514c8`, `c71985a`, preview v20) — "clicking Work from the foot of home lands at the
foot of Work" (owner, again).** Root cause, found by tracing: the preview exporter
(`scratchpad/export-site.py`) injects a document click handler that turns every internal link
into a full page load and calls `stopImmediatePropagation()`, so no site code ever saw the
click; and the owner's viewer evidently puts the previous scroll position back after a load
(a simulated scroll-restoring host reproduced the exact symptom). Fix: `src/lib/open-at-top.ts`
(inline script) — a plain same-site link click (no #section) leaves a short-lived
sessionStorage note; the next page holds the top through load and ~2.5s after, stopping on any
scroll/tap/key; the exporter shim now leaves the same note; RouteFocus drops the note 3s after a
client-side change (the router can start one and fall back to a full load). Verified: with the
simulated restoring host and without, 1440 and 390, Work/Services/Trades/About from the page
foot → 0; Back and #section links unchanged; e2e 61/61. Refresh lands ~200–300px short on the
static preview both before and after (pre-existing, not from this change). Not verified in the
owner's actual viewer — only its behaviour was simulated.

**Then (`77d658e`, preview v21) — home hero: ServicePOW first, as three POW comic panels**
(owner: put ServicePOW first, not a client ad or the "2 a.m. search" idea; chose the
comic-panel direction over an annotated ad). The hero's right column is now `PowStrip`: three
panels drawn in code in the logo's own style (gold burst, ink line, cream halftone): Brand (a
plain van gets a "YOUR NAME" wrap, POW!), Websites (a phone whose Call button rings, RING!),
Ads (four ads dealt out, one lifts with a check, BAM!). Captions are the existing approved
one-liners from services.json (no new claims); each panel links to its discipline on
/services. The entrance plays once on reveal; without JS or with reduced motion the finished
frame shows. The explainer video moved to "Working with ServicePOW". Copy and strip sit side by
side from 1280px; below that the strip sits full width under the copy, since three panels
beside the copy at 1024px were unreadably small. Found and fixed during checks: (1) the
bursts' landing animation gave phones a 21–24px horizontal scroll (Chromium counted the
animated burst), so the hero now clips sideways overflow, as the process section already did;
(2) the phone action-bar tap-size test failed 2 of 25 runs because it measured the button
mid-slide (47.99994px against 48). It now waits for the slide to finish: 30/30. Verified: build
and `tsc` clean; e2e 61/61; home CTA inside 375×667 (546px); no page overflow at 320–1440;
mobile audit (7 sizes × 16 routes) identical to the previous baseline; screenshots reviewed at
390, 768, 1024, 1280 and 1440. Not verified: Safari/iOS; the art has not been seen on a real
phone.

**Then (`195b269`) — TripNerd "Their camera roll" vertical ad, built in and held** (owner:
put the new TripNerd ad on the site where it fits). The 25-second 9:16 ad now fills the two
existing video-ad spots: home case 02 (under 911drain; it replaces the held Players cut there)
and `/work#video-ads`. Layout: story, a timecoded beat list (0:00 hook, 0:01 four albums, 0:18
the list, 0:23 the ask) and the film at phone width in the 911drain ad set's corner-bracket
frame; `VideoPlayer` gained `aspect="9:16"`. Web encode 720×1280 H.264, 8.9 MB (owner's file
22.8 MB), indistinguishable at display size in a frame comparison. **Still held**
(`published: false`, files in `pending-assets/tripnerd/`): no written TripNerd permission is on
file. Verified in the held state: build and `tsc` clean, e2e 61/61, held-work test now also
requires both new files to 404. **Not verified:** the ad switched on. A local build with it on
was blocked by the session's permission system (it copies held TripNerd files into `public/`),
so the on-state layout has not been rendered or screenshotted, and the TripNerd review preview
(https://claude.ai/artifact/CkaL1QXjwKKkCvgrBP43Yi) was not rebuilt. Go-live checks are in
`pending-assets/README.md`: written permission; photos confirmed as real TripNerd trips that
TripNerd may show; captions if the ad has speech.

## Verified

| Check | Result |
|---|---|
| `tsc --noEmit`, `next build` | clean at every commit |
| Playwright e2e (incl. axe WCAG 2A/2AA on every route) | 61/61 at every commit (one test retired with the home diagram; its coverage stays on /about) |
| Full-page screenshots, 16 routes × 1440 and 390 | reviewed; no horizontal overflow |
| Hero primary CTA inside 375×667 | 14/14 routes |
| `next dev` starts and serves pages | yes (200 on /, /work, /pricing, /growth-audit, /services) |
| Static preview bundle hydrates | yes (5 routes checked) |

**Not verified:** Safari/iOS and real devices (all renders are Chromium); Lighthouse; video
playback (the test Chromium has no H.264); the TripNerd review preview was not rebuilt (still the
pre-pass site around the held ad).

## Learned

- A spacing token named `block` or `grid` makes Tailwind v4 emit `inline-block` / `inline-grid`
  **sizing** utilities, silently breaking the display classes (a chip squeezed to 48px). Token
  names now avoid display keywords (`sect-head`, `column`).
- Running `next dev` writes `.next/dev/types`, which the tsconfig includes; the static export then
  fails its type check because those types reference the stashed routes. Delete `.next/dev` before
  `export-site.py build`.
