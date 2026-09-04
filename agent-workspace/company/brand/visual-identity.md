---
title: Service Pow Visual Identity
type: profile
client: internal
owner: Karl
status: draft
created: 2026-08-24
updated: 2026-09-04
tags: [company, brand, design, visual]
---

# Service Pow Visual Identity

How Service Pow looks. Used for anything Service-Pow-branded: the site, decks, proposals,
social templates, invoices.

For client work, use the client's own brand guide — never Service Pow's.

> **Direction selected 2026-08-30 — A, THE FRAME, anchor `#17457A`.** Owner decision against
> [`explorations/2026-08-28-identity-directions/proposal.md`](explorations/2026-08-28-identity-directions/proposal.md).
> Colour and layout below are decided. **Typography decided 2026-09-04 —
> [decision 0007](../../knowledge/decisions/0007-typography-system.md): Fraunces · Work Sans ·
> JetBrains Mono.** Tokens ship in
> [`../website/2026-08-30-redesign/tokens.css`](../website/2026-08-30-redesign/tokens.css)
> (still carrying the stand-in stacks by owner instruction — the token swap is deferred);
> ratios are measured by `contrast.py` in the same folder, 20/20 pairs passing.

**The governing principle.** The blue is the *anchor*, not the atmosphere. Recognition is
carried by typography, composition, whitespace and the work itself. The blue appears only where
a decision is being made — CTAs, interaction states, navigation moments, diagram emphasis, the
mark. Service Pow should read as a premium creative and technology company that happens to be
exceptionally good at marketing home-service businesses — never as a trades template.

**Deliberately not:** AI startup · generic SaaS · construction company · cyberpunk · neon tech ·
corporate insurance. **Aiming at:** precision, confidence, capability, creative intelligence,
measurable growth. Timeless over trendy.

## Logo

**Direction A — THE FRAME.** Everything Service Pow makes lives inside a frame: an ad, a page,
a shot. The mark is that frame, drawn as two corner brackets.

**The reduction system — one idea at two weights.** The proposal flagged Direction A's real
weakness: brackets need something inside them, so the mark reduces badly. Resolved by changing
weight, not mark:

| Size | Treatment |
|---|---|
| Large — lockup, site header, endcard | Hairline brackets around the wordmark. Airy, editorial. |
| Icon — favicon, app mark, avatar, watermark | The frame becomes **solid mass**: a filled `#17457A` tile with two heavy brackets knocked out at top-left and bottom-right. Nothing depends on a hairline surviving, and the asymmetric diagonal is the signature. |

Drawn on a 32-unit grid because 32×32 is a real favicon size, not an abstraction. Verified
legible at 16px against real favicons.
Master: [`../website/2026-08-30-redesign/identity/mark-app.svg`](../website/2026-08-30-redesign/identity/mark-app.svg).
Preview of the full system: artifact "The Frame".

**Clear space:** one bracket-arm length on every side. **Minimum size:** 16px for the app mark;
the hairline lockup is not used below 120px wide — below that, the app mark replaces it.

**Misuse — never do this:** don't stretch or rotate · don't recolour the tile · don't add
effects, shadows or gradients · don't place the hairline lockup on busy imagery (use the solid
app mark) · don't rebuild the brackets at a different weight ratio · don't set the wordmark in any
typeface other than Fraunces (decision 0007) · don't put a letter inside the brackets.

## Color

Near-achromatic ground, one anchor. Full scale with interaction states in
[`../website/2026-08-30-redesign/tokens.css`](../website/2026-08-30-redesign/tokens.css) —
this table is the decision layer.

| Role | Name | HEX | Notes |
|---|---|---|---|
| Primary / anchor | Service Pow blue | `#17457A` | The brand value. 9.13:1 against paper in both directions |
| Interaction — hover | blue-700 | `#133B69` | |
| Interaction — pressed | blue-800 | `#0F3157` | |
| Inverted ground | blue-900 | `#0B2340` | Full-section inversion, used sparingly |
| Focus on dark | blue-400 | `#3C7CBF` | Non-text indicator, 3.63:1 on blue-900 |
| Neutral / text | ink-900 | `#12161B` | Cool near-black — sits with the blue, never `#000` |
| Text secondary | ink-700 | `#39414C` | 9.74:1 on paper |
| Text meta | ink-500 | `#5F6875` | 5.32:1 on paper |
| Background | paper | `#FAF8F5` | **Warm** off-white, not sterile white |
| Background raised | paper-raised | `#FFFFFF` | Pure white reserved for lift — elevation by tone |
| Hairline | rule | `#E4DFD8` | Borders, never shadows |
| Secondary accent | signal-700 | `#8A5310` | **Optional and deliberately hard to reach.** Data-positive emphasis in diagrams and charts only. Never a CTA, never a heading, never decoration |

**Where the blue is allowed:** primary CTA and its states · focus rings · link text · active nav
item and the header hairline on scroll · the one diagram line carrying the argument · the mark,
favicon, and sparing full-section inversion.

**Where it is not:** headings · body text · eyebrow labels · section backgrounds used for
variety rather than meaning · decorative rules, dividers, bullets, icon fills · card borders,
tags, chips · gradients of any kind · a second CTA competing with the primary one.

**Accessibility:** body text must meet WCAG AA contrast (4.5:1; 3:1 for large text) against its
background. Measured, not asserted — `contrast.py` fails the build on any violation. The system
rule that accent is never used for body text means text contrast holds by construction.

**Accessibility:** body text must meet WCAG AA contrast (4.5:1; 3:1 for large text)
against its background. If a brand color fails on white, record the compliant
alternative here rather than letting each designer improvise one.

## Typography

**Decided 2026-09-04 — [decision 0007](../../knowledge/decisions/0007-typography-system.md).**
Owner-approved on visual review of the controlled three-system study
([`explorations/2026-09-04-typography-systems/`](explorations/2026-09-04-typography-systems/README.md),
canonical static QC 75/75). All three faces are **OFL 1.1** (verified from Google Fonts
metadata): licensed for commercial, client-facing use, self-hosted on the web, and used from
Canva's library — nothing uploaded, nothing purchased.

| Role | Typeface | Weights | Rules |
|---|---|---|---|
| Display | **Fraunces** | **400 standard** for static ads, video ads, social, presentations and normal web headings · **300 only ≥72px** with legibility visually verified | **WONK = 0** · **SOFT 0–25** · optical size explicitly controlled where the environment allows · never paragraphs, legal text, buttons or dense UI |
| Body / functional | **Work Sans** | **400** body · **500** supporting text and interface labels · **600** subheadings and emphasised information · **700 CTA labels only** | The default functional face across web, advertising, presentations and documents |
| Metadata / technical | **JetBrains Mono** | **400** metadata, captions, technical labels, measurements, controlled eyebrow text · **500** limited emphasis | Never long body copy or primary headlines |

**Web fallback stacks** live in `tokens.css` and are unchanged for now (owner-deferred):
the production token swap is a separate, gated change. No other weights, variants or
pairings are approved.

**Still open in this section:** the wordmark/lockup artwork (now unblocked) and vector
masters into `assets/` with a pointer file.

## Imagery and graphics

**NEEDS INPUT:** Photography style, illustration or iconography style, treatment of
screenshots and mockups, use of texture or gradient, and any stock library the company
has a license for.

## Layout

Decided 2026-08-30 alongside the colour system. Values live in
[`../website/2026-08-30-redesign/tokens.css`](../website/2026-08-30-redesign/tokens.css).

**Containers — three widths, not one.** Prose 720px · content 1200px · wide 1440px. Gutters
20/32/48px. **Past 1200px the page gains margin, not scale** — this is the fix for the
zoomed-in desktop feeling.

**Spacing:** 4px base — 4 8 12 16 24 32 48 64 96 128. Section rhythm **steps** at breakpoints
(64 → 96 → 128px) and then stops, rather than scaling continuously.

**Type scale:** fluid via `clamp()`, growing sub-linearly and stopping. Body moves 16 → 17px
across the entire viewport range; display stops at 72px. Measure capped at 66ch body, 20ch
display.

**Radius:** small and consistent — 4px and 8px. The app-mark tile uses a proportional 22%.

**Borders and shadows:** hairline rules, **no shadows anywhere**. Elevation is carried by tone
(paper → paper-raised) and by the rule.

**Buttons:** one primary per view, filled `#17457A` with paper label; secondary is ink text with
a hairline border; focus ring always visible, never removed. Touch targets ≥44px.

**Motion:** transitions ≤200ms, ease-out. `prefers-reduced-motion` respected everywhere — the
page must read completely with every effect disabled.

## Templates

**NEEDS INPUT:** Where the working templates live — deck, proposal, social, document.
Point to them; don't duplicate them into this repo.
