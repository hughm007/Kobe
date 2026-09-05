---
name: servicepow-static-ads
description: >
  Execution owner for static advertising deliverables: turns an approved concept pack into
  export-ready static ad sets — concept x hook x placement structure, visual hierarchy and
  layout law, controlled typographic composition (critical text is never model-rendered),
  brand application from real assets, platform-exact dimensions and safe zones, executable
  static QA, targeted revision, and learning capture. Activates when a client needs static
  ads, social image ads, promotional graphics, offer creatives, or retargeting images for
  Meta, Instagram, Facebook or similar placements. Campaign strategy, concepts and hooks
  come from the campaign chain; this skill turns them into finished, sized, QA-passed files.
license: Proprietary — Service Pow internal. Not for redistribution.
metadata:
  version: 1.0.0
---

# Static Ads — the execution owner

## PURPOSE

Statics are the highest-frequency, fastest-turnaround deliverable an agency sells — and the
lane where model weaknesses (warped text, fake logos, generic template look) are most
instantly visible to a client. This skill exists so a ten-ad order is a production run, not
an improvisation: composition is controlled, text is typographic, marks are real files, and
every export is measured against its placement spec before anyone sees it.

## TRIGGER

Activates when **(a)** the Campaign Director invokes static production for an approved
concept pack, or **(b)** a client or the owner asks for static ads / image ads /
promotional graphics / offer or retargeting creatives. Strategy, concept families and hook
tournaments belong to the campaign chain (`servicepow-strategy`,
`servicepow-creative-director`); claims rulings to policy; this skill owns execution and
its deliverable-specific gates only.

## INPUTS

The approved concept pack and hook set (Bible §3, or the SLIM Bible's CONCEPT block) · the
client KB **including the asset register** (real marks and photos, hashed; never-generate
rules) · verified claims as `EV-` records · the placement order (which platforms/formats,
how many variants) · this skill's toolkit in `scripts/` (see `scripts/README.md`) · layout
law in `references/layout-and-hierarchy.md` · the placement matrix in
`references/placements-and-export.md`.

## WORKFLOW

1. **CLIENT TRUTH + ASSETS.** Read the KB and asset register. NAP, licence, offer terms and
   barred words are recorded — they will be gate-checked verbatim (BC-55). Real marks and
   photos are the first-choice imagery.
2. **VARIANT MATRIX.** From the approved pack: concepts x hooks x placements, enumerated
   before any asset work. Shared elements (background family, logo block, CTA block) are
   produced once and reused; only the varying layer changes per variant (the video lane's
   variant economics, applied to statics).
3. **ELEMENT ROUTING** — per element, using the canonical route enum (single owner:
   `../servicepow-higgsfield-production/references/shot-routing.md`):
   backgrounds/scenes → GENERATE, ILLUSTRATE or REAL-ASSET · client marks/vehicles/faces →
   **REAL-ASSET only** · product/tool imagery → REAL-ASSET or REFERENCE-GROUNDED with QA2 ·
   **ALL readable text — headlines, offers, prices, phone numbers, CTAs, disclaimers —
   → COMPOSITE (typographic), never model-rendered** (BC-42). Elements the models are weak
   at are designed out, not attempted harder.
4. **COPY.** Headline/support/CTA per hook, claim-disciplined (`EV-` cited or absent),
   written to the length budgets in the layout law (a headline that only fits at 4:5 is not
   a headline).
5. **COMPOSITION.** `scripts/servicepow_static_compose.py` renders each variant per
   placement from a layout spec: background fitted per aspect, real logo placed, text blocks
   set typographically on the grid, safe zones respected — and emits a **manifest** of every
   placed element for machine QA. Hand-built comps are allowed but must emit the same
   manifest.
6. **BRAND CHECK.** `servicepow-brand-fidelity` verdict per variant: real marks, correct
   colors, no re-drawn identity (shared organ, not restated here).
7. **EXPORT.** Platform-exact dimensions, format and size budgets per
   `references/placements-and-export.md`; deliverable naming per its §naming.
8. **STATIC QA — the gate battery** (definitions in `references/static-qa-gates.md`):
   BC-51 placement spec exact · BC-52 safe zones + legibility floor (measured from the
   manifest: min sizes, contrast, zone occupancy) · BC-53 hierarchy + CTA · BC-54 variant
   distinctiveness (pairwise difference scored, then judged) · BC-55 client information
   verbatim — plus shared BC-16/20/21 (claims, rights, brand), BC-41/42 where anything was
   generated. Run `scripts/servicepow_static_qc.py` per export.
9. **ADVERSARIAL REVIEW — shared dual gate.** `servicepow-creative-critic` (BC-22, the
   single client-ready score — a beautiful graphic that does not sell, communicate, or
   belong to the client fails here) and an ISOLATED Skeptic pass (BC-23). Once, late, on
   the frozen export set.
10. **TARGETED REVISION.** Re-compose only the failing variant/element from the spec;
    approved variants are hash-frozen and never regress. Re-run only invalidated gates.
11. **OWNER REVIEW.** Scores recorded, never invented.
12. **DELIVERY + LEARNING.** Export set + manifests + gate receipts to the client KB
    deliverables area; which hooks/layouts drove results feeds back when placements run.

## TEMPLATE-BOUND EDITING — the Canva channel

A second, narrower path for statics that must stay client-editable: a human instantiates an
approved Service Pow Brand Template into a design; this skill replaces the client-specific
text inside an editing transaction and decides commit or cancel with the copy-fit gate
(`references/canva-copy-fit-gate.md`, tool `scripts/servicepow_canva_fit.py`). The gate reads
the geometry back before any commit and refuses wrapping, container growth, safe-zone breaches
and new overlaps; on refusal it cancels the transaction and offers shorter copy. It never
changes size, position or copy on its own. Everything committed this way is still a draft
until steps 6, 8 and 9 above have run on it. Runtime facts for the connected account live in
the deployment's operations procedure, not here.

## DECISION RULES

- **Text is typographic. Always.** If a viewer must read it, a model must not paint it.
- **The register before the generator** — a real photo of the client's van beats any
  generated stand-in, and marks are never generated at all.
- **Variants must differ where it matters** — a hook change with identical layout is one ad
  exported twice; BC-54 exists to say so.
- **Design around capability.** Known-weak generation classes (readable text, precise
  products, faces) are routed out at step 3, not fixed in QA.

## QUALITY GATES

BC-51..BC-55 (`applies: static`) + shared BC-16/20/21/22/23 and BC-41/42 for generated
elements. Definitions: `references/static-qa-gates.md`.

## POLICY BINDINGS

- `../_servicepow/policies/claims-and-proof.md` — every claim on every export.
- `../_servicepow/policies/brand-assets.md` — real marks only, never re-drawn.
- `../_servicepow/policies/realism-and-disclosure.md` — generated imagery duties.
- `../_servicepow/policies/generation-and-spend.md` — any paid generation for backgrounds.
- `../_servicepow/data/roles.md` — APPROVER owns readiness; owner review is the datum.

## OUTPUT CONTRACT

Per order, in the client KB campaign folder: the variant matrix · layout specs + manifests ·
the export set (placement-named files, hash-frozen on approval) · gate receipts (BC-51..55 +
shared) · dual-gate verdicts · owner review record · dated learnings.

## HANDOFF

Concept/hook weaknesses → back to the campaign chain. Landing-page/parity issues →
`servicepow-website-production` (BC-19 is checkable there). Placement/spend execution when
campaigns go live → the analytics/ab-testing advisors under their own gates. This skill
owns no strategy, no claims rulings, no video, no websites.
