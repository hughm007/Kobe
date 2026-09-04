---
title: "0007 — Service Pow typography system: Fraunces · Work Sans · JetBrains Mono"
type: decision
client: internal
owner: Karl
status: accepted
created: 2026-09-04
updated: 2026-09-04
tags: [decision, brand, typography, identity, the-frame]
---

# 0007 — Service Pow typography system

**Status:** Accepted
**Date:** 2026-09-04
**Decided by:** Owner (APPROVER), on visual review of the controlled study in
[`company/brand/explorations/2026-09-04-typography-systems/`](../../company/brand/explorations/2026-09-04-typography-systems/README.md)

## Context

Direction A — THE FRAME — was selected on 2026-08-30 (`visual-identity.md`), with typography
explicitly left open: every exploration board was set in Liberation Sans as a stand-in, the
website tokens shipped "STAND-IN STACKS", and the licence had to cover client-facing use.
Typography carries recognition in this identity by design ("the blue is the anchor, not the
atmosphere"), so the choice could not stay open once Service Pow-branded work resumed.

Constraints: premium creative-and-technology register; never generic SaaS, construction,
cyberpunk, insurance, or template; must work across websites, static ads, video ads,
presentations, proposals and social; highly readable; enough weights for a full hierarchy;
licensed for commercial, client-facing use; and — to keep Canva viable during its trial —
preferably present in Canva's library so nothing is uploaded or purchased.

## Options considered

Three systems were rendered on identical 1080×1080 pages (same layout, colours, sizes and
copy; only the fonts differed) and gated by the canonical static QC — **PASS 75/75**.

| System | Display · Body · Mono | Pros | Cons |
|---|---|---|---|
| **1 Editorial Frame** | Fraunces · Work Sans · JetBrains Mono | Typography genuinely carries recognition; hairline-contrast display echoes the bracket mark; optical-size axis gives a true display cut; strongest Canva-availability evidence (all three free-tier per 2026 sources) | Fraunces' Softness/Wonky axes can tip decorative if misused — needs a hard rule; Work Sans is common in UIs |
| 2 Systematic Precision | IBM Plex Serif · Plex Sans · Plex Mono | Complete pre-matched family; deepest weights; most readable | IBM's own identity face; reads "technology company" first; least distinctive |
| 3 Newsroom Frame | Instrument Serif · Source Sans 3 · Source Code Pro | Most distinctive display; single-weight restraint | Display has one weight only — hierarchy by size alone; fashionable enough to date |

## Decision

**System 1 is the Service Pow typography system.** Display **Fraunces** · body **Work Sans**
· metadata/technical **JetBrains Mono**. All three OFL 1.1, verified from Google Fonts'
`METADATA.pb`; self-hosted on the web under OFL; used inside Canva from its library.

### Operating rules (owner-stated, verbatim in substance)

**Fraunces — display only**
- **400 is the standard display weight** for static advertisements, video advertisements,
  social media, presentations, and normal website headings.
- **300 only for oversized display text at 72px or larger**, and only when legibility is
  visually verified.
- **WONK = 0**, always. **SOFT between 0 and 25.**
- Optical size is **explicitly controlled** wherever the production environment supports it.
- Never for paragraphs, legal text, buttons, or dense UI.

**Work Sans — the default functional typeface** across web, advertising, presentations and
documents
- **400** body copy · **500** supporting text and interface labels · **600** subheadings and
  emphasised information · **700 CTA labels only**.

**JetBrains Mono — metadata and technical text**
- **400** metadata, captions, technical labels, measurements, and controlled eyebrow text ·
  **500** limited emphasis.
- Never for long body copy or primary headlines.

No other weights, variants, italics-as-roles, or pairings are approved by this decision.

## Why

Of the three, only System 1 makes the typeface do the identity's stated job — carry
recognition while the blue stays an anchor. Fraunces at large optical size is a
hairline-contrast serif, the same register the identity names for the hairline bracket
lockup; Work Sans holds the functional load at small sizes (legal lines at 28px measured
5.32:1); JetBrains Mono gives the "precision, measurement" voice a home without touching
headlines. The known risk — Fraunces' expressive axes — is closed by rule rather than by
choosing a duller face.

## Consequences

- **Easier:** Service Pow-branded work can proceed with a real type system; the hairline
  lockup and wordmark are unblocked (they were waiting on this face).
- **Harder:** every production surface must be able to set Fraunces' axes; where it cannot
  (some tools expose fixed instances only), 400 is the fallback and 300 is not used.
- **Accepted cost:** Work Sans is not rare. Recognition rides on Fraunces and composition.
- **Revisit if:** legibility of Fraunces 300/400 fails a real-size check on a real surface;
  Canva turns out not to carry any of the three (availability evidence is third-party until
  seen in the editor); or a licence question arises that OFL does not settle.
- **Not decided here:** the wordmark/lockup artwork, vector masters into `assets/`, imagery
  style, brand voice, template locations, and the production `tokens.css` swap (the tokens
  still carry the stand-in stacks by owner instruction — change deferred).

## Related

- `company/brand/visual-identity.md` — Typography section now records this system
- `company/brand/explorations/2026-09-04-typography-systems/` — the study (retained)
- `company/brand/explorations/2026-08-28-identity-directions/proposal.md` — Direction A
- `company/OPEN-QUESTIONS.md` — identity row updated
- `operations/connector-register.md` — Canva row (why the study ran locally)
