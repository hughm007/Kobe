---
title: Open Questions
type: profile
client: internal
owner: Karl
status: active
created: 2026-08-24
updated: 2026-08-25
tags: [company, onboarding, blockers]
---

# Open Questions

The unknowns in this workspace, consolidated and ordered by how much each one unblocks.
The agent cannot invent these answers — they're facts about Service Pow that only the
humans at Service Pow hold.

Rows are grouped, so one row here may resolve several `NEEDS INPUT` markers in the file
it points to. Open that file to see the specific fields.

**How to use this:** answer top-down. Each answer goes into the file named in the
"Lands in" column, and the row gets ticked here. You don't need to do it in one sitting;
the first block alone unblocks most day-to-day work.

**Agent's job:** keep this list current. When you hit a gap mid-task, add a row. When a
file gets filled in, tick the row and note the date. Don't let this drift out of sync
with the `NEEDS INPUT` markers in the files themselves.

> **2026-08-25 sync:** the Drive company OS ("ServicePow OS 2") was ingested into this
> workspace. It answered most of Tiers 1–3 — those rows moved to Answered. What it
> *surfaced* is a new class of open item: business risks recorded nowhere (percentages,
> unsigned claims, unverified licence scope). Those are now Tier 1, because they carry
> real commercial exposure, not just missing context.

---

## Tier 1 — business risk, not admin

| ✓ | Question | Lands in |
|---|---|---|
| ☐ | **911 Drain: what revenue % and exit % do Service Pow and McVicker actually hold?** Recorded nowhere. Largest commercial exposure on the books. | `../clients/911drain/client-brief.md` |
| ☐ | **911 Drain: claims sheet is unsigned** (9 items + the trip/call-out/diagnostic-fee question to add). No claim ships without Will's signature. | `../clients/911drain/client-brief.md` |
| ☐ | **911 Drain: does CR-37 cover advertised sewer repair?** Verify with Will or the AZ ROC. Until then no asset carries "sewer" — and the wrap already does (tagline drift). | `../clients/911drain/brand-guide.md` |
| ☐ | 911 Drain: "daily POV videos" promise vs. ~4 finished ads/month real capacity — stale promise or unkept one? Needs Karl + Will. | `../clients/911drain/client-brief.md` |
| ☐ | 36-month exit strategy: terms, targets, milestones — none recorded. | `../clients/911drain/client-brief.md` |
| ✅ | ~~**2026-09-03 — the Kobe remote's default branch did not contain the durable record.**~~ **RESOLVED same day.** `main` created at the proven HEAD (the stale default was a strict ancestor — fast-forward, no merge, nothing deleted) and set as the remote default; old branches retained, the one superseded commit preserved as tag `archive/env-file-setup-vfr4ix`. Verified by cold clone. | [`../operations/repo-and-branches.md`](../operations/repo-and-branches.md) — **done** |
| ⛔ | **NEW 2026-09-03 — servicepow.com has two production realities.** The live site is the Vercel `plumbing` project (Cursor-built, Ops SaaS at `/app`); the workspace doctrine and `servicepow-v2` describe a different site. **OWNER DECISION REQUIRED — no session may resolve, merge, retire or redefine either side; `plumbing` is READ-ONLY.** Five sub-questions and the amendment procedure are in the decision record. Blocks servicepow.com only — not client work, not connector testing. | [`../knowledge/decisions/0006-servicepow-com-production-reality.md`](../knowledge/decisions/0006-servicepow-com-production-reality.md) |

## Tier 2 — client-facing gaps

| ✓ | Question | Lands in |
|---|---|---|
| ☐ | **Wave Reaction: who are they, what stage, what's the play?** Folder exists; brief is `NEEDS INPUT` throughout. | `../clients/wavereaction/client-brief.md` |
| ☐ | TripNerd: when does the email play start, and what list are we mailing? Zero live deliverables to date. | `../clients/tripnerd/client-brief.md` |
| ☐ | Brand voice attributes for Service Pow itself, defined by contrast | `brand/brand-voice.md` |
| ☐ | Two worked copy examples — one on-brand, one off-brand | `brand/brand-voice.md` |
| ◐ | Service Pow's own logo files, colors (HEX), typefaces — **DIRECTION SELECTED 2026-08-30: A, THE FRAME, anchor `#17457A`. TYPOGRAPHY DECIDED 2026-09-04: Fraunces · Work Sans · JetBrains Mono** ([decision 0007](../knowledge/decisions/0007-typography-system.md), OFL, client-facing use covered). Colour, layout, app-mark reduction and type are decided and recorded in `brand/visual-identity.md`. **Still open:** the wordmark/lockup artwork (now unblocked), vector masters into `assets/` with a pointer file, and the production `tokens.css` swap (owner-deferred). | `brand/visual-identity.md` |
| ☐ | Nameable clients, case studies and results we're permitted to cite | `company-profile.md` |
| ⚠ | **NEW 2026-08-31 — the intro video's endcard points at a spec ad that does not exist.** "See one made for your business ↓" promises a finished demo one scroll below the hero; no finished Service Pow spec ad exists anywhere (`assets/` holds a README). **Needs: whose trade does the demo depict, and what rights posture?** Then it gets built through the full pipeline — it IS the product being sold. Ship-blocking for the homepage (bar-raiser C10), not for the film gate | `campaigns/2026-08-26-intro-video/` |
| ☐ | **NEW 2026-08-31 — contract terms in one sentence** (month-to-month? lock-in?). Nothing exists in `pricing-and-packaging.md`, which bars the strongest available trust string ("No lock-in.") from every surface | `pricing-and-packaging.md` |
| ✅ | ~~**2026-08-30 — the site's primary button offers a "free growth audit" that exists in no company file.**~~ **ANSWERED by the Owner 2026-08-31 and documented.** The audit is a live Service Pow lead-generation offer: a free, no-obligation review of a prospect's current marketing and growth system. Scope, deliverable, terms (free · no purchase required · no obligation) and the four things it must never promise are now written into [`services.md` §0](services.md). It is the film's single conversion path — **pain → capability → proof → free growth audit** — which also resolves the conflict with the spec-ad CTA: the endcard becomes `Get your free growth audit.` and the spec-ad line is dropped from the film. **Standing condition:** the audit must be seeded earlier in the film so the endcard is never new information (`campaigns/2026-08-26-intro-video/repair-board.md` R6) | `company/services.md` — **done** |

## Tier 3 — commercial terms not covered by the pricing doc

| ✓ | Question | Lands in |
|---|---|---|
| ☐ | Payment terms, minimum term, notice period | `pricing-and-packaging.md` |
| ☐ | Is media spend billed through us or paid direct? | `pricing-and-packaging.md` |
| ☐ | Who owns assets and accounts when a client leaves? | `pricing-and-packaging.md` |

## Tier 4 — operational

| ✓ | Question | Lands in |
|---|---|---|
| ☐ | Which timezone is the working day for deadlines and scheduling? (Likely America/Phoenix given 911 Drain, but unconfirmed) | `company-profile.md` |
| ☐ | Any contractors, freelancers or partners used regularly beyond McVicker Consulting? | `company-profile.md` |
| ☐ | What tools do we use — CMS, ad platforms, analytics, PM, email, design, storage? (Partial: Vercel, Drive, Higgsfield, Remotion known) | `../operations/tools-and-stack.md` |
| ☐ | Where do credentials live — which password manager? | `../operations/tools-and-stack.md` |
| ☐ | What's the standard client reporting cadence and format? | `../playbooks/client-lifecycle/reporting.md` |
| ☐ | Standard contract, SOW and proposal templates — where do they live? | `../templates/` |
| ☐ | Capacity check: the 4-ads/month working ceiling is an assumption — measure actual pilot hours per finished ad and revisit | `../operations/worklog.md` |

## Tier 5 — nice to have

| ✓ | Question | Lands in |
|---|---|---|
| ☐ | Founding story | `company-profile.md` |
| ☐ | Platform certifications and partnerships | `company-profile.md` |

---

## Answered

Move rows here as they're resolved, with the date. Keeps the live list short without
losing the record of what was decided when.

| Date | Question | Answer summary | Recorded in |
|---|---|---|---|
| 2026-08-24 | Which English? | **US English** — workspace converted throughout | `brand/brand-voice.md` |
| 2026-08-24 | Where based / how? | **Remote**, not location-tied | `company-profile.md` |
| 2026-08-24 | Quoting currency? | **USD** | `pricing-and-packaging.md` |
| 2026-08-24 | Team and sign-off? | **Karl** — owns relationships, delivery and final sign-off | `company-profile.md` |
| 2026-08-24 | Ad platforms? | Meta (FB + IG), Google, TikTok, LinkedIn, plus client-directed | `services.md` |
| 2026-08-24 | Website platform? | **Built as code with Claude, hosted on Vercel** | `services.md`, decision 0002 |
| 2026-08-24 | Current clients? | 911 Drain (partnership), TripNerd (active), WaveReaction (unknown — see Tier 2) | `../clients/README.md` |
| 2026-08-25 | What does 911 Drain do, who buys, what do we measure? | Emergency **residential** drain repair, East Valley AZ; ROC 366870 CR-37; site live 2026-07-28; LSA-first channel plan | `../clients/911drain/client-brief.md` |
| 2026-08-25 | What services / terms for 911 Drain? | **Not a retainer — revenue + exit % partnership** with Will (owner) and McVicker (sales). Percentages themselves still unrecorded → Tier 1 | `../clients/911drain/client-brief.md` |
| 2026-08-25 | One-line description of Service Pow | Digital marketing + creative production + AI marketing for local service businesses — full profile ingested from the Drive OS | `company-profile.md` |
| 2026-08-25 | Positioning / ICP / anti-profile | Ingested from 00_MASTER_OS + 22_BIZDEV_PIPELINE — authenticity-over-artificial stance, local service ICP, decline rules | `positioning-and-icp.md` |
| 2026-08-25 | Pricing model, rate card, floors, discounting | Ingested from 14_PRICING_AND_SCOPE_RULES — floors are hard; remaining terms (payment/media/ownership) → Tier 3 | `pricing-and-packaging.md` |
| 2026-08-25 | Services beyond web and ads? Engagement shapes? | Web, ads, creative/video production, AI marketing, email, lead-gen, automation; project + retainer + partnership | `services.md` |
| 2026-08-25 | Approval steps for going live? | Yes — the blocking checks + ServicePow-6 scoring from the video-production playbook (which owns the list and the count), plus Orion's confirmation gate | `../playbooks/ads/video-production.md`, `../operations/compliance.md` |
| 2026-08-25 | Messaging pillars / how we counter competitors | Authenticity > artificial; checks-not-vibes quality; code-built delivery speed | `positioning-and-icp.md` |
| 2026-08-25 | Work we explicitly don't do | Fake reviews/testimonials as a customer (FTC), unlicensed-scope claims, fabricated metrics | `operations/compliance.md` → summarized in `company-profile.md` |
