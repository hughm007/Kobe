---
title: Service Pow Visual Identity
type: profile
client: internal
owner: Karl
status: draft
created: 2026-08-24
updated: 2026-08-30
tags: [company, brand, design, visual]
---

# Service Pow Visual Identity

How Service Pow looks. Used for anything Service-Pow-branded: the site, decks, proposals,
social templates, invoices.

For client work, use the client's own brand guide — never Service Pow's.

> **Direction selected 2026-08-30 — A, THE FRAME, anchor `#17457A`.** Owner decision against
> [`explorations/2026-08-28-identity-directions/proposal.md`](explorations/2026-08-28-identity-directions/proposal.md).
> Colour and layout below are now decided. **Typography is still open** — the licensed face
> has not been chosen. Tokens ship in
> [`../website/2026-08-30-redesign/tokens.css`](../website/2026-08-30-redesign/tokens.css);
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
app mark) · don't rebuild the brackets at a different weight ratio · don't set the wordmark in a
substitute typeface once the real face is licensed · don't put a letter inside the brackets.

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

**NEEDS INPUT:**

| Role | Typeface | Weight | Notes |
|---|---|---|---|
| Headings | | | |
| Body | | | |
| UI / small print | | | |
| Web fallback stack | | | |

Include licensing — self-hosted, Google Fonts, Adobe Fonts, or a purchased license — and
whether that license covers client-facing use.

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
