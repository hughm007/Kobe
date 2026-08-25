---
title: Design Intelligence — patterns and palettes by vertical
type: research
client: internal
owner: Karl
status: active
created: 2026-08-25
updated: 2026-08-25
tags: [design, uiux, web, landing-pages]
source: Drive "ServicePow OS 2" — 41_UIUX_DESIGN_INTELLIGENCE.md (frozen snapshot of ui-ux-pro-max v2.13.0, extracted 2026-08-20; CONFIDENCE ASSUMPTION — design conventions, not measured results; synced 2026-08-25)
---

# Design intelligence

**This owns the PATTERN (section order, required elements). The Style Bank owns the
LOOK (archetype, palette). Where they disagree on a required element, the pattern wins.
A client's brand standards outrank everything here.** Never presented to a client as
proven — the vendor publishes no outcome data.

## Rule priority (work top-down; 1–2 non-negotiable on anything we ship)
1 **Accessibility** (4.5:1 body contrast, alt text, keyboard nav — never remove focus
rings) · 2 **Touch** (≥44px targets, loading feedback — never hover-only) ·
3 Performance (lazy images, CLS < 0.1) · 4 Style consistency (SVG icons, never emoji) ·
5 Mobile-first layout · 6 Type & color (16px base, semantic tokens) · 7 Animation
(reduced-motion respected) · 8 Forms (visible labels, error beside the field) ·
9 Navigation · 10 Charts.

## The four landing patterns Service Pow uses
- **Trust & Authority + Conversion** (trades, legal, medical, B2B): hero credibility →
  proof (logos, certs, stats) → solution → CTA path. Accent reserved for the CTA only.
- **Hero-Centric** (hospitality, restaurant, real estate): full-bleed hero → value strip
  → proof → ONE primary CTA.
- **Scroll-Triggered Storytelling** (travel, experiences): hook → problem → journey →
  climax CTA; must still read with all scroll effects disabled.
- **Conversion-Optimized** (booking, lead capture): shortest path to the form; urgency
  coloring only where a real constraint exists (a claim surface!).

## Vertical quick sheet (snapshot values — starting directions, not gospel)
- **Home services / trades (911 Drain):** Trust+Conversion pattern, flat accessible
  style; primary #1E40AF, CTA #EA580C; Poppins/Open Sans. **Phone number and
  licence/certifications are structural, not decorative** — hard `must_have`.
- **Travel (TripNerd):** storytelling + hero; brand standards win outright; mobile
  booking is a hard constraint; corporate-hospitality buyers deserve their own track.
- Adjacent verticals (restaurant, beauty, real estate, legal, medical, dental,
  automotive, weddings, booking): each has a pattern+palette row in the Drive source —
  re-extract rather than extrapolate when one becomes a live deal.

⚠ **Compliance tripwires in these patterns:** case results, before/after galleries,
results metrics and urgency coloring are all claim surfaces —
`../../operations/compliance.md` governs every one, on pages as much as ads.
