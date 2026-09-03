---
name: servicepow-website-production
description: >
  Owns website and landing-page production for Service Pow clients end to end: client truth
  and asset intake, site research and strategy, information architecture, copy, design,
  build, the executable web QA gates (responsive, functional, accessibility, performance,
  SEO, client-information correctness), adversarial review, revision, deployment-gated
  delivery, and learning capture. Activates when a client needs a website, landing page,
  site rebuild, or page-level conversion work. Advertising campaigns stay with
  servicepow-campaign-director; this skill owns the site the ads land on. Production
  deployment always requires explicit human approval — preview builds only by default.
license: Proprietary — Service Pow internal. Not for redistribution.
metadata:
  version: 1.1.0
---

# Website Production — the owner

## PURPOSE

A website is Service Pow's highest-ticket single deliverable and the destination every ad
must honor (ad-to-destination parity is registry law). This skill exists so a website
request is never improvised: one owner, one workflow, executable gates, and the same shared
intelligence — client truth, brand fidelity, claims law, dual review, learning — that the
video lane uses. No parallel systems.

## TRIGGER

Activates when **(a)** a client (or Service Pow itself) needs a new website, landing page,
rebuild, or page-level conversion work, or **(b)** the Campaign Director routes ad-to-
destination parity failures here for repair. Advertising creative belongs to
`servicepow-campaign-director`; local search fundamentals may consult the vendored
`local-seo-manager`; visual direction may consult the vendored `frontend-design` — both are
subordinate advisors inside THIS workflow, never owners.

## INPUTS

The client KB **including the asset register** (real marks, provenance, never-generate
rules) · the client's existing site if any · verified claims as `EV-` records
(`../_servicepow/policies/claims-and-proof.md` — a claim without a record does not appear
on the site) · this skill's own toolkit in `scripts/` (see `scripts/README.md`) · the
process detail in `references/site-process.md` and the gate definitions in
`references/web-qa-gates.md`.

## WORKFLOW

1. **CLIENT TRUTH.** `servicepow-client-intelligence` ground truth + the asset register.
   The register question is mandatory: what real material exists (logo files, photos,
   licence numbers, reviews, service lists)? NAP (name/address/phone), licence, hours and
   service scope are recorded with sources — they will be gate-checked verbatim (BC-46).
2. **RESEARCH.** Their customers, their market, their competitors' sites (structure and
   conversion patterns, never copied), their current site's failures if one exists.
   Evidence classes labeled per the shared method.
3. **BRAND/ASSET INTAKE.** Real files into the register, hashed. Marks are never
   recreated (`../_servicepow/policies/brand-assets.md`). Gaps become explicit client
   requests, not improvisations.
4. **SITE STRATEGY.** Who lands here, from where, to do what; the one primary conversion
   action; the offer; the proof plan (only filed `EV-` claims). A site without a stated
   conversion objective does not proceed.
5. **INFORMATION ARCHITECTURE.** Page list, per-page job, primary CTA per page, navigation.
   Every page answers: if removed, what does the visitor lose?
6. **COPY.** Claim-disciplined, per `references/site-process.md` §copy: plain-spoken,
   scannable, benefit-led; every factual claim carries an `EV-` id or is absent.
7. **DESIGN + BUILD.** Per `references/site-process.md` §build: responsive from the first
   commit, semantic and accessible as built (not retrofitted), performance as built
   (image budgets, lazy loading), forms wired for real submission tests, analytics-ready.
   Distinctive-not-generic is a gate, not a taste note (the AI-look kill applies to sites
   as it does to ads). **Preview deployments for every review round, each with a filed
   receipt** (`references/deployment-receipts.md`); step-8 gates run against the real
   preview URL, never simulated evidence.
8. **EXECUTABLE QA — the web gate battery** (BC-44..BC-49, definitions in
   `references/web-qa-gates.md`): responsive/no-overflow at the width battery · functional
   (links, buttons, **forms submitted as a real test**) · accessibility floor ·
   performance floor · SEO baseline · client-information correctness against the KB.
   Run via `scripts/servicepow_web_qc.py` (static checks) and the Playwright battery
   `scripts/web-qa.spec.template.ts` (rendered checks). Receipts into the project QA log.
9. **ADVERSARIAL REVIEW — shared dual gate.** `servicepow-creative-critic` (BC-22 — the
   single client-ready score, sites included) and an ISOLATED Skeptic pass (BC-23; the
   Isolation Packet carries the preview URL, page inventory, and client facts). Run once,
   late, on a frozen build (commit-pinned preview).
10. **TARGETED REVISION.** Fix the failing page/component; re-run only the invalidated
    gates; prove untouched pages unchanged (build diff / route-level checks).
11. **OWNER REVIEW.** Scores recorded, never invented.
12. **DEPLOYMENT — human-gated (BC-50).** Preview is the default terminal state. Production
    deploy/domain cutover happens only on explicit operator/APPROVER approval, recorded as the `approval` line of
    the production deployment receipt (`references/deployment-receipts.md`) — a production
    deploy without that line is a BC-50 violation regardless of mechanism. Post-launch: the checklist in `references/site-process.md` §post-launch
    (redirects, indexing, form deliverability re-test).
13. **LEARNING CAPTURE.** What converted, what the client corrected, which gate caught
    what — dated, into the shared learnings system.

## DECISION RULES

- **The register before the generator.** Real photos and real marks always beat generated
  stand-ins; generated imagery on a client site follows the same routing law as ads
  (readable text composited, marks never generated, disclosure per policy).
- **A form that was never test-submitted is a broken form.** The gate is the submission.
- **Preview is not launch.** No production deploy without the human gate — ever.
- **Shared system first.** Client truth, claims, brand, critic, skeptic, learning are the
  same organs the video lane uses; this skill adds web-specific gates, not rival systems.

## QUALITY GATES

BC-44 responsive · BC-45 functional · BC-46 client-information correctness · BC-47
accessibility · BC-48 performance · BC-49 SEO baseline · BC-50 deployment approval — all
`applies: web` — plus the shared BC-16/20/21 (claims, rights, brand; BC-19 parity is an AD gate — this lane is its destination side) and the
dual gate BC-22/BC-23.

## POLICY BINDINGS

- `../_servicepow/policies/claims-and-proof.md` — site copy claims; guarantees doubly gated.
- `../_servicepow/policies/brand-assets.md` — real marks only.
- `../_servicepow/policies/realism-and-disclosure.md` — generated imagery on client sites.
- `../_servicepow/policies/generation-and-spend.md` — any paid generation for site assets.
- `../_servicepow/data/roles.md` — APPROVER owns readiness + the deploy gate.

## OUTPUT CONTRACT

Per project, in the client KB: the strategy + IA record · the copy deck with `EV-`
citations · the build (repo/preview URLs, commit-pinned) · gate receipts for BC-44..BC-49 ·
dual-gate verdicts · the deploy-approval record (BC-50) · post-launch checklist result ·
dated learnings.

## HANDOFF

Ad campaigns for the finished site → `servicepow-campaign-director` (parity now checkable).
Local-search execution beyond the baseline → the vendored `local-seo-manager` inside this
workflow. Ongoing performance/cost tuning → the pinned Vercel skills as advisors. This
skill owns no ad creative, no claims rulings, and no outbound.

## REFERENCE FILES

- `references/site-process.md` — discovery through post-launch.
- `references/web-qa-gates.md` — BC-44..BC-50 definitions.
- `references/deployment-receipts.md` — preview→gate→approve→deploy loop + receipt format.
- `scripts/README.md` — the executable toolkit.
