---
title: "Service POW website V4 — THE FRAME on white (landing page rebuild)"
type: report
client: internal
owner: Karl
status: preview build on a branch — awaiting owner review; NOT deployed (BC-50)
created: 2026-09-20
updated: 2026-09-21
tags: [company, website, v4, landing-page, design-system, the-frame, preview]
repo: hughm007/servicepow-v2
branch: claude/v4-frame-landing
commit: 38b9e44
inputs:
  - "Owner brief 2026-09-20: 'too bland, don't like the landing page, could look cleaner'; references uxstudioteam.com, majortom.com"
  - "servicepow-site-current_2.zip (V3 screenshots only — no source), README-FOR-CLAUDE-CODE.md, capture-screenshots.mjs"
  - "servicepow_explainer_compressed.mp4 (2:02, 1920×1080 H.264 + AAC, 24.4 MB)"
  - "2026-09-19-v3-progression/plan.md (the decision memo this build acts on)"
---

# Service POW website V4 — THE FRAME on white

## Read this first

**The V3 build in the owner's screenshots is not in any repository.** `hughm007/servicepow-v2`
has one branch, `main`, and it holds the earlier DISPATCH concept (dark hero, orange accent,
"The job goes to whoever calls back first", six disciplines, three tiers). Vercel has no
`servicepow-v2` project — only `plumbing`. So the gold/Archivo V3 at `localhost:4312` exists only
on Karl's disk. **FACT.**

This rebuild therefore started from `main` and produced a **new** landing page and design system
on branch `claude/v4-frame-landing`. It does not port V3; it replaces the direction. If Karl wants
anything from V3 carried over (the static-ad tiles, the TripNerd carousel, page copy), V3 must be
pushed first — then it is a port, not a rebuild.

**Preview only.** Nothing was deployed. Decision 0006 still bars servicepow-v2 from the domain,
and BC-50 requires explicit approval for any production deploy. Run it locally:

```bash
git clone https://github.com/hughm007/servicepow-v2 -b claude/v4-frame-landing
cd servicepow-v2 && npm install && npm run build && npm start   # http://localhost:3000
```

## What was built

**Direction — THE FRAME, on white.** The identity of record applied, instead of a third
unrecorded palette:

| Axis | Decision | Source |
|---|---|---|
| Ground | paper `#FAF8F5` · raised `#FFFFFF` · sunk `#F2EFEA` · hairlines `#E4DFD8`, no shadows, no gradients | `visual-identity.md`, `tokens.css` |
| Ink | `#12161B` / `#39414C` / `#5F6875` | `tokens.css` |
| Accent | blue `#17457A` **only** on the primary CTA, links, focus, active nav, the one route line. One inverted band (`#0B2340`) on the homepage: the system diagram. Footer inverted. | `visual-identity.md` "where the blue is allowed" |
| Type | **Fraunces** 400 display, opsz stepped 48/72/96/144, SOFT ≤ 10, WONK 0 · **Work Sans** text, 700 reserved for CTA labels · **JetBrains Mono** eyebrows, captions, figures (tabular) | decision 0007 |
| Signature | `.frame` — two opposing corner brackets (TL/BR) on every framed object: hero plate, work plate, the bench, the film, the offer panel | mark-app.svg reduced to structure |
| Controls | 4px radius, 48px min-height, 15px/700 sentence-case labels | `tokens.css` radius; rule 2 (≥44px targets) |
| Motion | entrance-only reveals (0.55s), images enter by clip-path never opacity, resting state = finished state (`no-js` until hydrated), reduced-motion honoured, **global smooth-scroll removed** (it animated the router's scroll-to-top — the "landed mid-page" defect in the V3 README) | |

**Homepage, in order (≈7,770 px at 1440; ≈10,050 px at 390):**

1. **Hero** — eyebrow · H1 **"You paid. / It didn't ring."** (the film's owner-reviewed opening
   line) · sub · primary "Get your free growth audit" + secondary "See the work →" · the real
   2:30 AM plate from the 911drain film in a bracket frame · proof strip of three practice
   statements (built for the four trades · launch timeline in writing · no fake reviews, no
   invented numbers).
2. **Featured work** — "One brand, four surfaces." 911drain site (large, framed), wrap concept,
   film-still tile linking to the launch film. Scope-only copy, no metrics.
3. **The system** — "Most trade marketing is a pile of vendors. Yours should be one system." Seven
   stages in V3's compliant naming (Get found → Get attention → Understand the offer → Build trust
   → **Make contact easy** → Stay visible → Measure interest), sticky scroll-drawn route on desktop,
   vertical rail on mobile, full list always in the DOM.
4. **Method** — "Four tested ads, not one guess." The tested-variation pack (EV-sp-002) drawn as a
   2×2 Concept × Hook bench, beside the **2:02 explainer** (poster-first, click-to-play, sound on,
   native controls after start, caption auto-detect).
5. **Five disciplines** — index rows → `/services#key`.
6. **Four trades** — index rows → `/trades/*`.
7. **Process + offer** — Audit · Build · Launch · Improve, then the free growth audit in a framed
   panel with "What's inside" (EV-sp-001 deliverables) and **"What it will never promise"** (the
   four §0 boundaries, printed at the point of the ask).

**Sub-pages** re-skinned through token aliases (`signal-*`, `pow-*`, `ink-*`, `n-*` → the new
palette) so the whole site is coherent from one file; CTAs converted to the `.btn` system; the
uppercase-tracked Archivo styles removed.

## Claims removed or corrected

Every one of these traces to the 2026-09-19 memo and the evidence records.

| Was | Now | Why |
|---|---|---|
| "RETAINERS ARE MONTH-TO-MONTH" (ticker, pricing H1 "Cancel anytime", FAQ, PlanCompare footer) | "Scope, term, and launch timeline in writing before kickoff" | no contract term on file; `services.md` says 3-month minimum; forbidden in advance by the 2026-08-31 bar-raiser |
| Local Services Ads (system stage 03, Demand discipline, Lead Engine item, plumbing play, schema `knowsAbout`) | removed | `services.md` §3: "never describe it as running" |
| 24/7 AI answering / receptionist (stage 04, Conversion discipline, Full Pipeline, Why POW, trades demo, growth-audit caption, metadata) | removed; "Make contact easy" = click-to-call, booking paths, forms that reach a person, tracking | the `plumbing` Ops SaaS product — decision 0006's other reality |
| Social Launch "From $1,200/mo" | "From $1,500/mo" | `pricing-and-packaging.md` hard floor; nothing quoted below it without logged approval — **owner to confirm the number** |
| Full Pipeline tier | removed | owner's V3 shows two tiers; its core was the answering product |
| Growth-audit form: Company required, phone required | Company removed (approved 2026-09-18 list), phone optional, website/GBP link added | conversion memo; `/api/lead` allow-list updated |
| Six disciplines (Brand/Web/Demand/Conversion/Retention/Measurement) | five (Brand / Websites / Advertising & creative / Social & Google presence / Strategy & audits) | owner's V3 taxonomy, compliant |

**Kept, deliberately:** 911drain shown by name, scope-only, no metrics — because it is the only
work on file and the owner's own V3 shows it. The CLIENT_APPROVER gap (D-2 in the memo) is still
open and still Karl's.

## Verified

| Check | Result |
|---|---|
| `npm run build` (Next 16.3.3, Turbopack) · `tsc --noEmit` | clean |
| Playwright: horizontal overflow + console errors, 9 routes × 360/390/768/1440 | 0 overflow, 0 errors |
| axe WCAG 2A/2AA on `/`, `/pricing`, `/growth-audit`, `/work/911drain` | 0 violations (after moving the footer wordmark back to SVG text) |
| Lead form without `LEAD_WEBHOOK_URL` | shows the call-us fallback, never a false success |
| Full-page captures, all 12 routes × 1440 & 390 | reviewed; slices in `evidence/` |
| Explainer encode | 1280×720 H.264 CRF 27 + AAC 96k, faststart, **7.3 MB** (spec ≤ 8 MB), poster from t=15s |

**Not verified:** Lighthouse (not run here — BC-48 receipt still owed); Safari/iOS (all renders are
Chromium); the explainer's captions (none exist — WCAG 1.2.2, `CONTENT-NEEDED.md` item 1).

## Owner decisions this build makes visible

1. **Type and colour.** This is the identity of record (Direction A + decision 0007). If Karl
   prefers V3's Archivo/gold, it is a three-line swap in `layout.tsx` + `globals.css` — but then
   0007 and `visual-identity.md` must be amended, not silently overridden again.
2. **$1,500/mo.** The entry tier now sits at the documented floor. Confirm, or log an approval for
   a lower number.
3. **911drain naming** (unchanged from the memo).
4. **V3.** Push it, or accept that V4 replaces it. Anything in V3 not in `main` (static ad tiles,
   TripNerd carousel, the ticker) is currently unrecoverable from any repo.
5. **Deploy path.** Decision 0006 is unchanged. This branch previews locally; it does not reach
   servicepow.com without the ruling and a BC-50 approval line.

## Files

- `evidence/` — before (V3 screenshots the owner supplied) and after (V4 renders at 1440 and 390).
- Source: `hughm007/servicepow-v2` @ `claude/v4-frame-landing` (`38b9e44`); design note at
  `docs/06-THE-FRAME-ON-WHITE.md`; asset gaps at `CONTENT-NEEDED.md`.
- The 24 MB explainer master is not committed anywhere (repo policy: large binaries stay out);
  the 7.3 MB web encode is in `public/brand/`.
