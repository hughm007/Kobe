# 2026-09-29 — Website refinement pass (design cleanup, not a redesign)

**Repo:** `hughm007/servicepow-v2` @ `claude/v4-frame-landing` — `6acab60` … `7338a98`
(10 commits, `Refine 1/n` → `9/n` plus a hero accessibility fix).
**Baseline before the pass:** `122b99b` (on the remote branch; also tagged locally as
`baseline/pre-refinement-2026-09-29` — the tag push was refused by the session's git proxy, so the
commit SHA is the restore point: `git checkout 122b99b -- .`).
**Preview (private):** https://claude.ai/artifact/UUbKD8g9NTi7MzZgDagdLt (version 12). Not deployed —
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
