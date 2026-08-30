---
title: "Service Pow website redesign — audit and implementation plan"
type: report
client: internal
owner: Karl
status: draft
created: 2026-08-30
updated: 2026-08-30
tags: [company, website, redesign, design-system, plan]
---

# Service Pow website redesign — audit and implementation plan

**Scope.** Redesign servicepow.com: design system, homepage, desktop scaling, typography and
hierarchy, portfolio/case-study system, Growth System section, navigation, mobile, and a video
integration component that accepts the intro film later without a redesign.

**Not in scope.** The intro video itself — another agent owns it. This plan treats it as an
external asset arriving at a defined contract (§7). Nothing here reads from or writes to that
agent's files beyond the format spec already recorded in its campaign bible.

**Branch discipline.** Nothing merges to main until instructed.

---

## 1. Audit — what exists

### 1.1 Where the site actually lives

| Fact | Value | How established |
|---|---|---|
| Vercel project | `plumbing` (`prj_eXLRwGJoerKCDlM0KuuYRyd9DcIk`) | Vercel MCP |
| Team | `karlmalik's projects`, Pro plan | Vercel MCP |
| Domains | `servicepow.com`, `www.servicepow.com` + 3 preview aliases | Vercel MCP |
| Source repo | **`github.com/karlmalik/Plumbing`** | Vercel project link |
| Framework | Next.js (App Router, RSC payload present), Node 24.x | Vercel + live HTML |
| Last production deploy | `dpl_EbGSrGHhtpDmxmoePiepeS1Dasmq`, READY | Vercel MCP |
| Styling | Tailwind-shaped utility CSS, single compiled stylesheet | live HTML |
| Fonts | two `next/font` variables (`__variable_eb41fe`, `__variable_f367f3`) | live HTML |

The project name `plumbing` is a leftover from an earlier build; it now serves Service Pow's own
site. Worth renaming when convenient — it makes the Vercel dashboard misleading.

**The codebase is not in this repository and not on this machine.** This repo (`Kobe`) is the agent
workspace plus the `orion` macOS app. A full-machine search found no Next.js project. `gh` is not
installed and git has no credential helper configured, so `karlmalik/Plumbing` cannot currently be
cloned. **This blocks tasks 1 (code audit) and 3–12 (all build work).** See §9.

### 1.2 The live homepage, as it stands

Section order today: hero → problem (3 items) → services (4 pillars) → why → how it works (4
steps) → results (911 Drain) → packages → guarantee → FAQ → about → footer.

**Hero.** H1 "Complete marketing for local trades"; sub "The job goes to whoever calls back first.
We make sure that's you." CTAs "Get your free growth audit" and "Skip to Results."

**Service pillars.** 01 Get Found · 02 Get Leads · 03 Close Leads · 04 Retain & Grow.

**Pricing on the page.** Foundations: Brand Kit from $2,500 · Website Build from $4,500 · Field
Presence from $1,500 · Video/Commercials from $2,000. Growth System retainers: Social Launch
$1,200/mo · Lead Engine $2,500/mo ("most clients start here") · Full Pipeline $4,500/mo. Add-ons
include LSA management at $500/mo or 15% of spend.

**Footer.** "A HFM Holdings company" · sales@servicepow.com · (520) 341-8183 · client portal ·
LinkedIn, X, email.

### 1.3 Defects and risks found on the live site

| # | Finding | Severity | Evidence |
|---|---|---|---|
| D1 | The four-stat row renders **0 / 0 / 0+ / 0**. The real values are in the RSC payload (`1`, `30 days`, `12+`, `4`) but the server-rendered spans are `0` — an animated counter that starts at zero. Without JS (and for any user whose animation never fires) the page states zero of everything. | **High** | live HTML: `>0</span>`, `>0+</span>`; payload `\"value\":\"30 days\"`, `\"12+\"`, `\"4\"` |
| D2 | Those four stats are **claim surfaces** under `operations/compliance.md` and the Style Bank's "results metrics are a claim surface" rule. "30 days typical launch window" and "12+ monthly content assets" need written substantiation. | **High** | style-bank.md, design-intelligence.md tripwires |
| D3 | The page sells **Local Services Ads management** as a purchasable add-on. `company/services.md` states LSA is "**still in research (Hugh owns it). Not live, not applied to any client — never describe it as running.**" The live site contradicts a standing workspace rule. | **High** | services.md §3 vs. live packages section |
| D4 | Live pricing and the workspace rate card **do not match**. Site: retainers $1,200–$4,500/mo, builds $2,500–$4,500. Workspace: retainer floor $1,500/mo, pilot pack $1,200. Social Launch at $1,200/mo sits **below the $1,500 retainer floor**, which `pricing-and-packaging.md` says nobody quotes below without logged approval. | **High** | pricing-and-packaging.md vs. live packages |
| D5 | The Results section already publishes **911 Drain** work. `OPEN-QUESTIONS.md` Tier 2 records "nameable clients, case studies and results we're permitted to cite" as still open, and Tier 1 records 911 Drain's **claims sheet as unsigned** and the **CR-37 sewer scope as unverified**. | **High** | OPEN-QUESTIONS.md Tier 1 + Tier 2 |
| D6 | Positioning mismatch. The site sells a full-stack local-trades growth system including an AI receptionist. `company/services.md` names **AI video ad production as the primary offering** and the tested-variation pack as the unit of sale. These are two different companies on paper. | **High** | services.md vs. live site |
| D7 | The "zoomed-in" desktop feel — diagnosis deferred until the repo is readable, but the shape is familiar and the fix is specified in §4.2. | Medium | reported; to confirm in code |
| D8 | Hero offers two competing CTAs ("Get your free growth audit" / "Skip to Results"). The Hero-Centric and Trust+Conversion patterns both call for **one** primary action. | Medium | design-intelligence.md |

D1–D6 are content and compliance problems that a redesign does not fix by itself. They need
Karl's decisions (§9), not design work.

### 1.4 Standards that govern this build

Read and applied: `brand/style-bank.md`, `knowledge/research/design-intelligence.md`,
`knowledge/decisions/0002-web-delivery-model.md`, `playbooks/web/website-build.md`,
`company/positioning-and-icp.md`, `company/services.md`, `company/pricing-and-packaging.md`,
`brand/visual-identity.md`, `brand/brand-voice.md`, `company/OPEN-QUESTIONS.md`, and the
2026-08-28 identity-directions proposal.

**The governing routing.** Style Bank vertical table: *Agency & creative (Service Pow itself) →
archetype **I** (experimental agency), A/D alt.* Archetype I = "one 3D/gradient hero as the sole
chromatic event." Service Pow's own site sits under **taste anxiety**, answered by restraint.

**The one governed conflict, resolved.** Archetype I wants the accent spent on a single hero
chromatic event. The Trust & Authority + Conversion pattern requires "accent reserved for the CTA
only." `design-intelligence.md` states the rule for exactly this case: **where pattern and
archetype disagree on a required element, the pattern wins.** Resolution: accent is spent on the
**primary CTA** and on the **single hero event** — and on nothing else anywhere on the site. No
accent body text, no accent section headers, no decorative accent rules.

**Two blockers inside the standards themselves.**
- `visual-identity.md` is `NEEDS INPUT` in all seven sections. The three identity directions
  (A THE FRAME `#17457A` · B THE CUT `#C2361B` · C THE MARK `#A85B00`) are built and awaiting
  Karl's selection. **No direction is selected**, so the site has no logo, no accent and no
  typeface of record.
- `brand-voice.md` is `NEEDS INPUT` end to end. Every headline I write is therefore a proposal
  against an undefined voice.

Mitigation in §3: the design system is built so the accent is **one token**, and the identity
choice is a one-line change rather than a re-skin.

---

## 2. Build sequencing

Eleven work items in dependency order. Items 0–2 must land before any component is styled.

```
0  Repo access + local run              ← BLOCKED, see §9
1  Design tokens + Tailwind theme
2  Primitives (container, section, type, button, link)
3  ServicePowHeroVideo (placeholder-complete)
4  Navigation + footer
5  Homepage sections, in pattern order
6  Growth System section
7  Portfolio / case-study system
8  Desktop scaling pass
9  Mobile + responsive pass
10 Accessibility + performance gates
11 Visual testing
```

---

## 3. The design system

Delivered as `src/styles/tokens.css` (CSS custom properties) plus a Tailwind theme that consumes
them. One source of truth; Tailwind never hard-codes a value.

### 3.1 Color

Near-achromatic ground, one accent, per archetype I.

| Token | Role | Value |
|---|---|---|
| `--ink-900` | primary text | near-black, not `#000` |
| `--ink-600` | secondary text | ≥4.5:1 on paper |
| `--ink-400` | tertiary / meta | large text only, ≥3:1 |
| `--paper` | page ground | off-white |
| `--paper-raised` | card ground | one step from paper |
| `--rule` | hairline borders | archetype I uses borders, not shadows |
| `--accent` | **the single chromatic event** | **awaiting identity selection** |
| `--accent-ink` | text on accent | measured to ≥4.5:1 |

**Rules.** Accent appears on the primary CTA and the hero event, nowhere else. Accent is never
used for body text — the identity proposal makes this a construction rule, so text contrast is
satisfied regardless of which direction is chosen. Elevation is carried by **tone and hairline
rule**, not shadow.

**Contrast is measured, not asserted.** A script computes every foreground/background pair used in
the build and fails if any body pair is under 4.5:1 or any large-text pair under 3:1 — the same
discipline the identity boards used, where each board printed its own ratios.

### 3.2 Typography

Two families (display + text), loaded via `next/font` — self-hosted, no render-blocking external
request. **The real typeface is not yet chosen and must be licensed for client-facing use**
(`visual-identity.md` requires the licence recorded). Until then the system ships on a documented
stand-in and the swap is one token.

Base 16px. Fluid scale using `clamp()` so type grows **sub-linearly** with the viewport — this is
the core of the desktop-scaling fix:

| Step | Mobile | Desktop | Notes |
|---|---|---|---|
| `--fs-display` | 40px | 72px | hero H1 only |
| `--fs-h1` | 32px | 52px | |
| `--fs-h2` | 26px | 38px | |
| `--fs-h3` | 21px | 26px | |
| `--fs-body` | 16px | 17px | grows barely — deliberate |
| `--fs-small` | 14px | 14px | fixed |

Body copy stays near 16–17px at every width. The current site's zoomed feel comes largely from body
and heading sizes that keep growing with the viewport; here they stop.

Measure capped at **66ch** for body, **20ch** for display headings. Line height 1.5 body, 1.1
display. Headings semantic and in order — no `h3` used because it looks right.

### 3.3 Space, radius, motion

Spacing on a 4px base: `4 8 12 16 24 32 48 64 96 128`. Section rhythm **steps at breakpoints**
rather than scaling continuously — a section that is 64px-padded on mobile becomes 96px, then
128px, and stops. It does not keep growing on a 2560px display.

Radius: small and consistent (archetype I restraint) — `--radius-sm 4px`, `--radius-md 8px`, and a
pill only on the primary CTA if the chosen direction calls for it.

Motion: all transitions ≤200ms, ease-out. **`prefers-reduced-motion` respected everywhere** — it
disables counters, parallax, autoplay and scroll reveals, and the page must read completely with
every effect disabled.

### 3.4 Container ladder

The second half of the scaling fix. Three widths, not one:

| Container | Max width | Use |
|---|---|---|
| `--w-prose` | 720px | body copy, FAQ, case-study narrative |
| `--w-content` | 1200px | standard sections, cards, grids |
| `--w-wide` | 1440px | hero, portfolio grid, full-bleed media |

Gutters: 20px mobile, 32px tablet, 48px desktop. Beyond 1440px the content stops widening and the
page gains margin — it does not magnify.

---

## 4. Homepage redesign

### 4.1 Section order

Pattern: **Trust & Authority + Conversion** (the buyer is a trades owner; competence must be
established before the ask). Look: archetype I restraint.

1. **Hero** — H1, one-line sub, **one** primary CTA, and the single chromatic event.
   `<ServicePowHeroVideo />` sits here. Fixes D8 by removing the second CTA.
2. **Proof strip** — restrained, no badge wall, no metric tiles until D2/D5 are resolved.
3. **The problem** — three items, kept; it is the strongest copy on the current site.
4. **What we do** — the four pillars, restructured (§5).
5. **The Growth System** — §5.
6. **Selected work** — portfolio entry points (§6).
7. **How it works** — four steps.
8. **Packages** — gated on the D3/D4 pricing decision.
9. **FAQ** — kept; strong and long-tail useful.
10. **Close** — single CTA restating the hero promise.

### 4.2 Desktop scaling — the specific fix

Five changes, in order of effect:

1. **Fluid type with a ceiling** (§3.2) — headings and body stop growing at the top breakpoint.
2. **Container ladder** (§3.4) — content caps at 1200/1440px; wide screens gain margin.
3. **Stepped section padding** (§3.3) — vertical rhythm stops scaling past desktop.
4. **Hero height by content, not `100vh`** — `min-height` with a sensible cap, so a short viewport
   is not cropped and a tall one is not a wall of empty space.
5. **Grid density increases with width** — the pillar grid goes 1 → 2 → 4 columns; cards do not
   simply inflate to fill the row.

Verified at 1280 / 1440 / 1920 / 2560px in §8.

### 4.3 Typography and hierarchy

One display face for H1/H2, text face everywhere else. Exactly one H1 per page. Eyebrow labels in
small caps with letter-spacing rather than a second color. No all-caps body. No accent-colored
headings.

---

## 5. The Growth System section

The name is already live and already the retainer tier structure, so it is grounded, not invented.
Three tiers — Social Launch, Lead Engine, Full Pipeline — with Lead Engine marked as the common
entry.

**Design.** A three-column comparison at ≥1024px collapsing to a stacked accordion on mobile, with
the recommended tier expanded by default. Feature rows aligned across tiers so scanning down a
column is honest. One accent CTA on the recommended tier only; the other two get a neutral action.

**Three constraints from the workspace, applied.**
- **LSA cannot appear as a live service** until D3 is resolved. The current site sells it.
- **No tier prices below the $1,500/mo retainer floor** without Karl's logged approval; Social
  Launch at $1,200/mo currently does.
- **Every number in this section is a claim surface.** "30 days," "12+ assets," any lead or
  ROI figure needs written substantiation before it ships.

Until those resolve, this section is built with the real structure and the copy marked
`NEEDS-SUBSTANTIATION`, so it is complete as design and unshippable as claim — deliberately.

---

## 6. Portfolio / case-study system

**Architecture.** Content as typed data, not hand-built pages.

```
src/content/cases/<slug>.mdx        frontmatter + narrative
src/lib/cases.ts                    typed loader, Zod-validated at build
app/work/page.tsx                   index grid
app/work/[slug]/page.tsx            case study, generateStaticParams
```

Frontmatter contract:

```yaml
slug, client, trade, year
summary                  # one line, no metrics
services: []
hero: { type: image|video, src, poster, alt }
gallery: []              # each with alt text — required, build fails without
metrics: []              # each REQUIRES substantiation: true + source
permission:              # cited | anonymized | internal-only
  granted: bool
  scope: string
featured: bool
```

**The compliance gate is in the build, not in a reviewer's memory.** A case study with
`permission.granted: false` cannot render publicly. A `metrics` entry without `substantiation`
fails the build. This directly encodes the Tier 1/Tier 2 items in `OPEN-QUESTIONS.md` — 911 Drain's
claims sheet is unsigned and the citable-client list is unanswered, so the system must refuse to
publish rather than rely on someone remembering.

**Launch state.** 911 Drain runs as `permission: anonymized` ("an East Valley emergency drain
company") with **no metrics**, unless Karl confirms otherwise. The work itself — brand, site, wrap,
commercial — is showable; the numbers and possibly the name are not yet.

**Design.** Grid of stills at `--w-wide`; each card is image-led with a one-line summary and no
metric tile. Detail page: hero media → context → what we made → the assets → next case. Narrative
column at `--w-prose`.

---

## 7. `<ServicePowHeroVideo />` — the integration contract

Built now, complete, with no video file. The final asset drops in without a redesign.

**Spec from the other agent's campaign bible (read-only):** `60s 16:9 hero + 20s social cutdown`.
The component is built to 16:9 as primary with a 9:16 variant for the cutdown.

```tsx
<ServicePowHeroVideo
  src="/video/intro-hero.mp4"          // arrives later
  srcWebm="/video/intro-hero.webm"     // optional
  poster="/video/intro-hero-poster.jpg"
  captions="/video/intro-hero.en.vtt"  // required when src is present
  title="What Service Pow does"
  aspect="16:9"                        // | "9:16"
  variant="hero"                       // | "inline" | "background"
/>
```

**Behavior contract.**

| Concern | Decision |
|---|---|
| Layout stability | Aspect-ratio box reserves exact space from first paint. CLS contribution **0**, with or without the file. |
| Missing file | Renders a branded slate at the correct ratio — final layout, obvious placeholder. No broken player, no layout shift when the real file lands. |
| Loading | `preload="none"`, poster only, video fetched on play. Below-fold instances lazy-mount via `IntersectionObserver`. |
| Reduced motion | No autoplay under `prefers-reduced-motion`. Poster + explicit play control. |
| Background variant | `muted playsInline loop`, decorative, `aria-hidden`, still no autoplay under reduced motion. |
| Accessibility | Real `<track kind="captions">`; keyboard-operable controls with visible focus; ≥44px touch targets; accessible name from `title`. |
| Files | Assets land in `public/video/`. **This plan does not create, move or modify anything in that directory** — the other agent owns delivery into it. |

**Integration when the asset arrives:** drop the files into `public/video/` at the names above.
No component change, no layout change, no redesign. If the delivered aspect differs from 16:9, the
only change is the `aspect` prop.

---

## 8. Testing

**Visual.** Playwright + pinned Chromium, matching the deterministic pattern already used by
`shoot.py` and the video build. Playwright is **not currently installed on this machine** — the
existing script points at a Linux container path (`/opt/pw-browsers/...`), so this needs a local
install before task 12 can run.

Screenshots at **375 / 768 / 1024 / 1280 / 1440 / 1920 / 2560** for every page, committed to the
redesign folder so the scaling fix is reviewable as evidence rather than assertion. The 1920 and
2560 shots are the ones that prove D7 is fixed.

**Automated gates, run in CI on every preview deploy.**
- Contrast: every token pair measured; body <4.5:1 fails the build.
- Axe accessibility scan: zero criticals.
- Keyboard traversal of every interactive element; focus rings never removed.
- Lighthouse on the preview URL; CLS < 0.1 and no regression against the current live baseline.
- Reduced-motion pass: the page renders and reads completely with all animation disabled.
- Build-time content validation: no unsubstantiated metric, no un-permissioned case study, no
  missing alt text.

**Baseline first.** Before changing anything, capture the current live site's Lighthouse and
screenshots at all seven widths — the rebuild is judged against a measured baseline, per the
website-build playbook's rebuild rule.

---

## 9. Blockers

**B1 — Repository access. Hard blocker on all build work.**
`github.com/karlmalik/Plumbing` is not on this machine, `gh` is not installed, and git has no
credentials. Nothing in §2–§8 can start. Any of these unblocks it: install and authenticate `gh`;
add a GitHub SSH key and grant this session permission to use it; or clone the repo somewhere I can
read. It should be cloned as **its own repo, not inside `Kobe`** — the website-build playbook
requires client and project sites to stay in their own repositories.

**B2 — Identity direction not selected.** A, B or C. This sets the accent, the mark, the favicon
and the hero event. I can build every token, primitive and component without it and swap one
variable when it lands — but the site cannot ship, and cannot be honestly reviewed, on a
placeholder accent. C is the only direction the proposal says yields a real favicon.

**B3 — Positioning contradiction (D6).** The live site and `company/services.md` describe two
different businesses. The redesign copy has to follow one of them. My read: the **live site is
current reality** and the workspace docs are behind, but that is Karl's call and it changes most of
the homepage copy.

**B4 — LSA (D3).** The site sells it; the workspace forbids describing it as running. Either the
workspace rule is stale and should be updated, or the section comes off the site. It cannot stay
as-is.

**B5 — Pricing (D4).** Live tiers versus the rate-card floors, including one tier below the
$1,500/mo floor. Needs either a repriced tier or a logged approval.

**B6 — Case-study permissions (D5).** What may be named, and with which numbers. Until answered,
the portfolio ships anonymized and metric-free by construction.

**B7 — Brand voice.** `brand-voice.md` is `NEEDS INPUT` throughout. Headlines will be written as
proposals, flagged for Karl's approval rather than presented as on-brand.

**B8 — Playwright not installed locally.** Needed for task 12. Small install; noted so it is not a
surprise at the end.

---

## 10. What I can do while B1 is open

Not nothing, but not much of the real work:

- The full token layer (`tokens.css`) and Tailwind theme, written and contrast-validated
  standalone against direction A, B and C so the moment B2 resolves the answer is already built.
- `<ServicePowHeroVideo />` written against the contract in §7, testable in isolation.
- The case-study schema, loader and build-time compliance validator (§6).
- Copy proposals for the homepage, marked as proposals pending B7.

All of it lands in this folder and moves into the site repo once B1 clears.
