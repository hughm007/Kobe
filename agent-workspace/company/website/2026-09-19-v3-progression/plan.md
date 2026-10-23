---
title: "Service Pow V3 website — progression plan and owner decision memo"
type: report
client: internal
owner: Karl
status: draft — awaiting owner decisions
created: 2026-09-19
updated: 2026-09-19
tags: [company, website, v3, audit, decision-memo, design-system, plan]
inputs:
  - "External audit: servicepow-v3-website-audit.md (2026-09-19, live browser inspection of localhost:4312)"
  - "company/website/2026-08-30-redesign/plan.md (prior audit, D1–D8, B1–B8)"
  - "knowledge/decisions/0006, 0007 · company/brand/* · company/services.md · company/evidence-records.md"
  - ".claude/skills/servicepow-website-production/references/web-qa-gates.md (BC-44..BC-50)"
---

# Service Pow V3 website — progression plan

> **How this was produced.** The audit PDF was read in full. Every claim in it was then checked
> against this workspace. Six independent analysis lenses (audit reconciliation, governance/claims,
> engineering, conversion, visual craft, motion) were run over both, three competing design
> directions were developed and judged, and the whole result was attacked twice — once on evidence
> and fabrication, once on commercial value. What survived is below. Corrections the adversarial
> passes forced are marked **[corrected]**.
>
> **Evidence labels are used throughout: FACT · ASSUMPTION · ESTIMATE · RECOMMENDATION.**

---

## Bottom line

The V3 build is competent and is not the problem. Four owner decisions, costing about an hour,
determine roughly half of all the work anyone could do to it — and none of the expensive work
should start before they land.

Three things are true at once and they have to be said plainly:

1. **V3 cannot legally reach servicepow.com today.** Decision 0006 is LOCKED. FACT.
2. **The site currently publishes the claims it cannot support and omits the one it can.** Two
   named clients with no permission record, a contract term that contradicts `services.md`, and a
   price below the hard floor — while `EV-sp-001` and `EV-sp-002`, the two APPROVED evidence
   records, appear nowhere. FACT.
3. **The website is probably not the bottleneck.** Distribution is. The single highest-value
   action available to this company is not on the audit's list and is not a website task —
   see §8.

On the creative brief: the ask for "advanced" is right, and the reference points are wrong for
this buyer. The good news is that the sanctioned answer already exists, already paid for, and is
sitting on no page. See §5.

---

## 1. The four decisions only Karl can make

Three separate analysis passes recommended writing this memo and none of them wrote it. This is it.
Everything in §3 onward is sequenced behind these.

### D-1 — Which servicepow.com is real, and does V3 ever get the domain?

**Status:** LOCKED owner decision. FACT — `knowledge/decisions/0006-servicepow-com-production-reality.md`,
verbatim: *"`servicepow-v2` likewise continues unchanged — neither side advances while the question
is open."*

Today servicepow.com is served by the Vercel `plumbing` project (repo `karlmalik/Plumbing`,
developed via Cursor, READ-ONLY from this workspace). It contains a working Ops SaaS at `/app` —
leads → quotes → invoices, Supabase auth, SendGrid, staff portals, a $597 answering product. FACT.

**The question nobody in the analysis asked, and it is the important one:** `plumbing` is live,
revenue-bearing and actively developed. Is V3 the right thing to be building at all? And if V3
takes the apex, **what happens to `/app` and its authenticated users?** V3 does not contain it.
Retiring it is exactly the "capability floor moves down" event `baseline-and-regression.md` §2
exists to prevent.

**What to decide:** 0006's five questions, plus the `/app` question above.

**If the answer is "keep building V3 locally for now"** — that is a legitimate answer, but it must
be written into 0006 as an explicit carve-out by its own amendment procedure. A running dev server
is not permission. RECOMMENDATION.

**Consequence of not deciding:** every repo-specific item in §3 Stage 2 onward is at-risk spend.
If 0006 resolves in favour of `plumbing`, the component fixes, the CI harness, the ground system,
the three interactive moments and the hero integration are all thrown away. The workspace-side work
(copy, identity ruling, permissions, contract terms, the film's gate) survives either ruling.

### D-2 — May we name 911 Drain and TripNerd? And was the TripNerd asset ever run?

**Status:** explicit written prohibition, currently being violated. FACT —
`company/evidence-records.md`, §"AWAITING EVIDENCE — not usable in any copy", first row:
*"Named client work / case study | CLIENT_APPROVER confirmation to use the client name and outcome
| No client-side confirmation on file"*, under the heading *"None has a record, so none may appear
— not softened, not hedged, absent."*

V3 names 911 Drain on the homepage, `/work` (full case study) and `/about` (the whole narrative).
FACT — audit copy reference.

**The audit graded this item green.** It checked the *framing* ("one real project, not an implied
roster") and marked "Reframe the single-client proof — Appears done." The framing is indeed fixed.
The *permission* is not, and it is an OPEN-QUESTIONS Tier 1 item with an unsigned claims sheet.
The auditor had no workspace access and could not have known. **[corrected]** — this is a gap in
what the auditor could see, not a failure of the audit.

**TripNerd is the worse half, and nobody had flagged it.** FACT —
`clients/tripnerd/client-brief.md`: *"**Creative health RED. TripNerd currently has ZERO live
deliverables.**"* Named assets: "The Reversal" v3 **killed 2026-08-20**; "The Parking Lot"
**rejected 2026-08-21, compliance-fatal, unrepairable** — a synthetic person delivering a
first-person customer testimonial, FTC Fake Reviews Rule.

The V3 homepage shows a "TripNerd 4:5 carousel (three of six slides shown)." FACT — audit.
**Whether the displayed carousel is an approved asset, an unapproved one, or the compliance-fatal
one is UNKNOWN and needs a source check before anything else happens to that section.**

Two further points on the same asset:
- TripNerd is premium sports hospitality. The hero ticker directly above reads "BUILT FOR PLUMBING ·
  HVAC · ELECTRICAL · ROOFING". The proof band contradicts the positioning. ASSUMPTION that this
  reads as incoherent to a trades buyer; the mismatch itself is FACT.
- Bundled with D-2 and outranking it: **does CR-37 cover advertised sewer repair?** OPEN-QUESTIONS
  Tier 1. The recorded wrap tagline is "DRAIN & SEWER REPAIR" against a logo reading "DRAIN REPAIR"
  — the recorded tagline drift. **[corrected]** — an earlier draft of this analysis quoted a
  different string; that string was the deliberately-bad counterexample in the brand guide, not the
  live asset. If the wrap image appears on V3 and "sewer" is legible, a licence-scope exposure on a
  real licensed contractor is published. Whether it is rendered: UNKNOWN, needs source check.

**What to decide:** two emails (Will; TripNerd). Until they land, `plan.md` §6's specified launch
state applies: `permission: anonymized` — "an East Valley emergency drain company" — metric-free.

### D-3 — Which identity is canonical?

**Status:** three mutually incompatible identities are live at once. FACT.

| Source | Ground | Action colour | Radius | Type |
|---|---|---|---|---|
| **Shipped V3** | `#F6F4EF` | gold `#F4B318` | `0` | Archivo · Hanken Grotesk |
| **`tokens.css` / `visual-identity.md`** (of record) | `#FAF8F5` | blue `#17457A` | 4 / 8px | stand-in stacks |
| **Decision 0007** (accepted, owner-approved) | — | — | — | **Fraunces · Work Sans · JetBrains Mono** |
| **The intro film** | `#F7F5F0` | — | — | — |

A grep of the entire workspace for `Archivo`, `Hanken` and `F4B318` returns **zero hits**. FACT.
So V3's accent colour and typeface pairing were chosen in a session and never recorded — the exact
failure mode that produces a re-derivation of the same finding at the next audit.

**One nuance that cuts in V3's favour. [corrected]** — `style-bank.md` routes Service Pow itself to
"**I, A/D alt**". Archetype **D** is brutalist: *"massive condensed type, 0px containers, B/W + one
signal color."* So **radius 0 is a sanctioned alternate for the company site**, not a violation. An
earlier reading of this analysis treated radius 0 as off-system by citing the trades-client row
("D for one loud campaign page") — that is a different row. Radius 0 is defensible. The
*undocumented* part is the problem, not the value.

**Options, honestly costed:**

| Option | What it takes | Cost | Risk |
|---|---|---|---|
| **A — Re-skin V3 to the record** | three-line token swap to blue + the 0007 faces; re-run `contrast.py` | ~half a day | Karl may simply prefer the gold |
| **B — Ratify V3's palette** | one `contrast.py` run on the gold pairs + a three-line amendment to `visual-identity.md` and 0007 | ~2 hours | none, if the contrast passes |
| ~~C — Full evidence rebuild to supersede 0007~~ | **CUT.** Rebuilding licence evidence, a controlled comparison and a formal supersession to ratify a palette the owner may not want is process for its own sake. | weeks | — |

**RECOMMENDATION: A or B, decided by taste, in one sitting — but one hard constraint either way.
Gold `#F4B318` must never be used as text.** Measured 1.69–1.75:1 against the page ground. It is a
fill colour for a button with dark text on it, nothing else. That costs nothing to honour.

**Consequence of not deciding:** every item in §6 (the pixel punch list) is derived from the
palette. Doing that work first means doing it twice.

### D-4 — Contract terms, in one sentence

**Status:** the site states a term the workspace says we do not offer. FACT.

V3's hero ticker: "RETAINERS ARE MONTH-TO-MONTH". `services.md` §1: the starter retainer has a
**"3-month minimum"**. OPEN-QUESTIONS Tier 2 records contract terms as unanswered:
*"Nothing exists in `pricing-and-packaging.md`."*

This was predicted and forbidden in advance. FACT —
`knowledge/research/2026-08-31-hero-video-bar-raiser.md`: *"IF `pricing-and-packaging.md` … documents
no-lock-in terms, add ONE trust-beat string … If undocumented: add nothing, log the question in
OPEN-QUESTIONS.md. **Never invent the offer.**"* The question was logged. The string was invented
anyway, on a different surface.

**What to decide:** one sentence — minimum term, notice period. (Payment terms already exist:
*"pilot 100% up front; retainers monthly in advance; work pauses at 7 days overdue. No net-30."*
**[corrected]** — an earlier reading said payment terms were absent; they are not.)

**Interim action, no decision needed:** the string comes off the ticker today. An unbacked
commercial commitment is worse than a missing one.

### Also needing Karl, but smaller

- **D-5 — The $1,200 Social Launch tier** sits below the `$1,500/mo` hard floor.
  `pricing-and-packaging.md`: nobody quotes below a floor "without Karl's explicit, logged approval."
  Either reprice, or log the approval. Also: the documented third tier "Full Pipeline" has vanished
  from the page and **there is no workspace record of why it existed or why it went** —
  **[corrected]**, the "lacked distinct documented scope" phrase is the audit's, sourced to "earlier
  notes" this workspace does not contain.
- **D-6 — Does the imagery rule exist?** "Avoid ghosted/faded imagery" is cited as standing law by
  the audit and by three analysis lenses. **It does not exist anywhere in this workspace.**
  `visual-identity.md` §Imagery is `NEEDS INPUT`. Either write it in, or stop citing it. FACT.
- **D-7 — Account provisioning.** `operations/tools-and-stack.md` has **blank rows** for Domains/DNS,
  Analytics, Tag management and Search Console. FACT. Every "wire GA4" recommendation assumes a
  property, a container and a verified Search Console that are not on record. Decision 0002 warned:
  *"DNS control needs to be established during onboarding, not on launch day."* `sales@servicepow.com`
  implies MX on the same zone, so a cutover touches mail.

---

## 2. What the audit got right, and what it could not see

**The audit is honest, well-evidenced and worth acting on.** It distinguishes VERIFIED from
OBSERVED, it declines to claim screenshots it could not export, and its technical findings
reference is accurate. Treat it as a good document with a bounded viewpoint.

**Three caveats that change how to read it:**

1. **Everything was measured against a dev server.** FACT — the audit header reads
   "localhost:4312 (the active V3 dev build)". In Next.js dev, `next/image` serves unoptimised
   sources, HMR mounts differ, and React StrictMode double-renders. **Four findings may be dev-only
   artifacts: the duplicate DOM, the ghosted mockups, the `/pricing` innerText result, and the
   upscaled thumbnail.** The single cheapest action in this whole document is:
   `npm run build && npm start`, then re-probe. Ten minutes. Do it before opening a component.
2. **The Priority-1 table is graded against a document that does not exist here.** The "fixes Karl
   approved on 2026-09-18" list is nowhere in the workspace — the worklog's last entry is
   2026-09-06. FACT. Every "still outstanding" verdict inherits that uncertainty.
3. **Two numbers it relays are not workspace policy. [corrected]**
   - *"Lighthouse ≥90-95"* — BC-48 contains **no score target**. Its actual defaults are
     **LCP < 2.5s on throttled mobile, CLS < 0.1**, "measured, not asserted — receipt filed."
   - *"the ~14px floor typically recommended for interactive text"* — unsourced. The only written
     numbers are **16px base** and **≥44px touch targets** (`design-intelligence.md` rules 2 and 6).
     The CTA recommendation below is re-derived from those, not from the 14px figure.

**Root causes worth recording** (all ASSUMPTION until confirmed against source):

| Audit finding | Most likely cause | Confirming diagnostic |
|---|---|---|
| Hero H1 `font-size: 43.578px` | The clamp is evaluating at a narrow viewport, or the hero is under-scaled. `--sp-fs-display` is specified 40→72px; 43.578 is near the *floor*. The hero may simply not be using the display step. | Read the computed value at 1440px and compare to the token |
| `line-height: 40.963px` (0.940×) | A unitless sub-1 display leading applied globally. Defensible at 72px, crowding at 43px. | Set leading as a rule *by size*, not one value (§6) |
| CTA at 11.52px (`0.72rem`) | Not a token value — an ad-hoc size | Grep for `0.72rem` / `text-[11.52px]` |
| Duplicate "Get found" node | A desktop copy and a mobile copy both mounted, or a motion wrapper cloning children | Production build first; then `document.querySelectorAll` count |
| Ghosted mockups | An entrance animation whose *rest* state is a low opacity | Fixed structurally by Rule 1 in §7 regardless of cause |
| `/pricing` ~3,000 chars | Client-side mount-on-scroll — **or** `content-visibility: auto`, or a Suspense boundary. `innerText` cannot distinguish these. **ASSUMPTION, not FACT** | `curl` the route and read the raw HTML |

---

## 3. The sequence

The rule that orders everything: **do the portable work first and the repo-specific work last.**
Text, decisions and permissions survive a 0006 ruling either way. A `clip-path` reveal does not.

### Stage 0 — This week, no decisions needed (≈1 day total)

| # | Action | Why |
|---|---|---|
| 0.1 | Remove "RETAINERS ARE MONTH-TO-MONTH" from the ticker | Unbacked commercial commitment (D-4) |
| 0.2 | Anonymize 911 Drain; pull or verify the TripNerd carousel | No CLIENT_APPROVER record exists (D-2) |
| 0.3 | Reprice or log-approve the $1,200 tier | Hard floor breach (D-5) |
| 0.4 | `npm run build && npm start`, re-probe the four suspect findings | May void four items before any code is touched |
| 0.5 | Read the **live** servicepow.com and report what is published there | See §8 — the violations are on the visible site, not just this one |
| 0.6 | Write the 0006 decision memo to Karl (§1) | Unblocks everything |

### Stage 1 — Owner decisions (≈1 hour of Karl's time)

D-1 through D-4, plus D-5/6/7. **Gate: nothing in Stage 2+ starts until D-1 and D-3 are ruled.**

### Stage 2 — Foundation (only after D-1 permits and D-3 is ruled)

| # | Action | Notes |
|---|---|---|
| 2.1 | Apply the D-3 ruling as tokens; re-run `contrast.py` | 20 pairs currently pass, all 20 **[corrected]** — extend the pair list with any new tokens |
| 2.2 | Swap to the decision-0007 faces | Currently deferred by owner instruction; the mono is load-bearing and `ui-monospace` resolves differently per OS |
| 2.3 | Confirm where `/growth-audit` submissions actually go; wire the webhook; real test submission with confirmed receipt | Closes BC-45. **Note the honest framing:** no leads are being lost today — this is a pre-launch task, not a leak (§8) |
| 2.4 | Rewrite the homepage copy around the four differentiators (§4) | The most durable artifact here; survives any 0006 ruling |
| 2.5 | Server-render the below-fold content **if 0.4 confirms it is client-mounted** | Do not rewrite architecture on an unconfirmed premise |
| 2.6 | Fix the duplicate staircase DOM — one tree, progressively enhanced | |
| 2.7 | GA4 + consent-aware loading, gated on `VERCEL_ENV === 'production'` | Requires D-7 account provisioning first |
| 2.8 | Two CI gates only: **token-literal lint** (build fails on any hex in component CSS) and the **copy-boundary lint** on the growth-audit block | Makes D-3 and the §0 claim boundaries structurally unrepeatable |

**Deliberately deferred from Stage 2:** LocalBusiness schema. BC-49 requires it, but Service Pow is
remote with no confirmed public address, city or hours (FACT — `company-profile.md`, OPEN-QUESTIONS
Tier 4). Shipping a fabricated address to satisfy a gate is worse than failing the gate. Resolve
D-7 first, then ship `Organization` + `ProfessionalService` with `areaServed` and no street address.

### Stage 3 — Craft (the "every pixel" pass — §6)

Only after the palette is ruled. ESTIMATE: 2–3 days for items 1–20 of the punch list.

### Stage 4 — The film and the three moments (§5, §7)

Gated on the film clearing BC-22 + BC-23 at rev4.

---

## 4. The conversion gap — the biggest finding that is not a bug

**The four defensible differentiators are absent from the site.** FACT —
`positioning-and-icp.md` names them:

1. **The spec ad made for their business before they ask** — "cost structure makes this affordable
   as a first cold touch; nobody else's does."
2. **Realism discipline** — real logos, real references, hybrid real+AI; the answer to "it looks AI."
3. **"Platform-safe AI ads"** — disclosure handled, no fake testimonials, claims substantiated.
   *"Cheap competitors ignore this; it removes a risk the client didn't know they had."*
4. **Tested variants, not single guesses** — "you're getting four tested variants, not one."

The V3 homepage instead says *"Good work deserves to get noticed"* and *"Websites, ads, and content
that get you chosen."* Those sentences would fit any agency in any category — which is precisely
what the generic-design kill in `web-qa-gates.md` exists to catch.

**And the site sells a different business than the workspace does.** `services.md` §1: the primary
offering is AI video ad production and **the unit of sale is a tested-variation pack, never a single
video** (pilot: 2 concepts × 2 hooks = 4 finished ads, 5–7 business days). V3's "What we do" lists
five generic disciplines. This is `plan.md` defect **D6**, still open.

**Meanwhile the two APPROVED evidence records — `EV-sp-001` (the free growth audit) and `EV-sp-002`
(the tested-variation pack) — appear nowhere on the site.** That is the claim inversion in one
sentence: running every claim we cannot support, omitting both that we can.

**The copy already exists and is better than anything on the page.** The intro film's lines, all
owner-reviewed:

> "You paid. It didn't ring. And you still don't know why."
> "Don't bet your spend on one ad. We build four."
> "Your part: clips off your phone. No film crew. No shoot day."
> "Your van. Your street. AI builds the rest."
> "Keep the one that pulls. 5–7 business days from your footage."
> "Disclosure handled. No fake testimonials. Claims substantiated."

**RECOMMENDATION: "You paid. It didn't ring." becomes the H1.** It is already produced, already
owner-reviewed, and it is the only owner-register language Service Pow owns. Mark all other new copy
PROPOSAL — `brand-voice.md` is `NEEDS INPUT` end to end, so every headline is a proposal against an
undefined voice.

**On the offer:** keep the Free Growth Audit as the primary conversion for now. The spec ad is the
stronger *message* but cannot be the *offer* yet — zero finished Service Pow spec ads exist
(FACT — `assets/` contains only a README; OPEN-QUESTIONS Tier 2 ⚠). See §8.

**On the form:** remove Company (approved, still shipped). Keep name, email, trade, city/service
area, and the free-text problem field — that last one is the highest-signal field on the form and
the one that makes the first call useful. Phone optional. Make the post-submit state state a
speed-to-lead promise you will actually keep.

---

## 5. The honest answer on "advanced"

You asked for the site to look advanced — the @webloved reference, Spline/Three.js scenes,
Apple-level polish. Two things are true.

**First: your instinct is backed by your own law, not opposed by it.** `style-bank.md` routes
Service Pow to archetype **I — experimental agency**, whose signature is *"one 3D/gradient hero as
the sole chromatic event."* And `plan.md` §1.4 already adjudicated the conflict with the
Trust+Conversion pattern: **the accent is spent on the primary CTA and the single hero event, and on
nothing else anywhere on the site.** So one hero moment is sanctioned. A site full of spectacle is
not.

**Second: ambient WebGL is closed off, for a reason you already wrote down.** `visual-identity.md`
bans gradients outright and permits the blue only "where a decision is being made." Archetype I's
chromatic event can only be chromatic in the brand blue — so a Spline gradient scene is barred by
the colour law, not merely inadvisable. And `design-intelligence.md` sets the rule priority
top-down: **1 Accessibility · 2 Touch · 3 Performance · … · 7 Animation.** Motion is subordinate to
the first three by your own ordering.

**So what is the sanctioned single hero event? The film you have already made and have not shipped.**

A 60-second, deterministically-rendered, seamlessly-looping film of the company's own work is a
stronger chromatic event than a library gradient blob — because the blob is available to everyone
and the film is not. It also closes most of the ambition gap the audit named, for the cost of a
re-render rather than a new build.

**The film's real state, stated exactly:**

- Latest cut is **rev4**: 1920×1080, 30fps, 1800 frames, 60.000s. Opens on "You paid. It didn't
  ring." at 0.5s; seeds "Get your free growth audit. ↓" at 50.6s. FACT.
- A WCAG-complete embed already exists — `site-handoff/hero-embed.html`: pause control (2.2.2), HTML
  text alternative (1.2.1), reduced-motion, iOS `play()` rejection fallback, letterbox-not-crop. FACT.
- **rev4 is NOT gated.** *"Gate status: NOT gated. New copy, new artifact. The round-6 verdicts were
  issued against `-rev3c`."* FACT. It cannot ship until BC-22 + BC-23 re-run on rev4.
- **The H.264 master must be re-encoded. [corrected]** — `agent-workspace/.gitignore:35` is `*.mp4`
  under "Large binaries — commit a pointer file instead", so the missing MP4 is policy, not loss;
  `hero-vp9.webm` *is* tracked, which is an inconsistency worth fixing. Whether the file still
  exists on your machine is unknown. Safari/iOS has no source until it does.
- **The poster cannot carry the hero alone. [corrected]** — `poster.png` was opened: a small grey
  "SERVICE POW" wordmark, two empty outlined rectangles, a partial frame, a hand holding a phone.
  **No headline, no offer, no legible copy.** A poster-first hero is still right for LCP, but the
  H1 and CTA must carry the argument.

**Sequence:** rule the palette (D-3) → re-render the film at brand values (free and deterministic;
it needs re-gating anyway) → encode the H.264 → run BC-22/BC-23 on the new artifact → integrate
inside the bracket frame, poster-first, never the LCP element.

**The design direction, chosen:** of three developed and judged, **THE PROOF ENGINE** wins — the
site demonstrates the product by running it in front of you. It scored 8/10 on the buyer lens
against 6 and 5; it lost by one point on brand-law/engineering, and every point of that is
graftable. The deciding argument is your own brief: you asked for a site that shows we change
marketing *with our system*. One direction typesets the system, one frames it, this one runs it.

Grafted in, non-negotiable:
- **The reveal inversion** (from Editorial): content ships at `opacity: 1`; JS adds the hiding class
  before paint. Five lines. It permanently kills the ghosted-hero failure mode, and it is inherently
  SSR-safe.
- **The bracket as layout primitive** at a fixed 2:1 arm:gap ratio, two opposing corners only —
  Proof Engine had no frame motif, which is strange for an identity called THE FRAME.
- **The printed scope panel at the close** (from Instrument): the four things `services.md` §0 says
  the audit must *never* promise, set in mono beside the form, plus "free · no purchase required ·
  no obligation." Printing your own limits at the point of the ask is the most disarming move
  available when selling to someone who has been burned.
- **The focus-ring override on the inverted section** — `#17457A` on `#0B2340` is near-invisible;
  use `--sp-blue-400`. Make it a named BC-47 build rule.

**One honest warning.** You will probably prefer the direction that photographs best in a static
comp. The winning direction looks like *tables* in a screenshot and only becomes impressive when
driven. So do not review it as comps — build the one interactive module first and put it on your
phone. Thirty seconds of dragging converts "table" into the thing you asked for.

---

## 6. The pixel punch list

Ordered by value per unit of effort. Items 1–6 are the ones a visitor notices. Everything is
keyed to `tokens.css`.

| # | Defect | Fix |
|---|---|---|
| 1 | CTA type 11.52px in a ~34px button | Work Sans **700**, **15px**, padding **14px 24px**, **min-height 48px**. Derived from the written rules (16px base, ≥44px targets), not the audit's unsourced 14px floor |
| 2 | Hero leading 0.940× | Unitless and **stepped by size**: ~1.05 below 56px, ~0.95 at ≥64px. Never one global sub-1 value |
| 3 | Mockups ghosted on some loads | `clip-path` wipe at full opacity. **Images never animate opacity** |
| 4 | Thumbnail 101×218 rendered 139×300 | Re-export at 2×; add a build-time guard that fails on `naturalWidth < clientWidth × 2` |
| 5 | Duplicate staircase DOM | One tree, progressively enhanced, serving both breakpoints |
| 6 | ~110px dead space in the 390px hero | Use `padding-block`, never `margin-block`, at section boundaries. Note the benign explanation: two adjacent sections at `--sp-section-y: 64px` = ~128px of legitimate rhythm. Confirm before "fixing" |
| 7 | 1px hairlines soften at 2dppx | `0.5px` at `min-resolution: 2dppx`, stepped to `--sp-rule-strong` |
| 8 | `--sp-rule` is only 1.16:1 on `paper-sunk` | Step to `--sp-rule-strong` (measured **1.45:1** **[corrected]** — 1.56:1 is against `paper`, not `sunk`) |
| 9 | No dark-ground rule token | Add `--sp-rule-dark #1E3A5C` — the one dramatic section is otherwise the one flat section |
| 10 | Single `-0.02em` tracking applied at every display size | Tracking table by step: looser small, tighter large. `-0.02em` at 72px reads loose |
| 11 | Mono eyebrows likely over-tracked at 0.12em | `0.08em` — mono already has wide sidebearings |
| 12 | Mono eyebrow with no structural partner | Label + gap + hairline to the container edge. Turns a fashion eyebrow into an instrument panel |
| 13 | Proportional figures in the pricing table | `font-feature-settings: "tnum"`, lining numerals |
| 14 | No widow control on a four-line hero | `text-wrap: balance` on headings, `pretty` on paragraphs, plus a `ch` cap |
| 15 | `font-optical-sizing` automatic | Set `none` + explicit stepped `opsz`. Without it Fraunces at 72px renders with *text*-grade contrast — losing the exact quality it was chosen for |
| 16 | Synthetic bold possible on a variable face | `font-synthesis: none` |
| 17 | Fraunces axes unconstrained | **WONK = 0** always; **SOFT capped at 10**, not the permitted 25, with the reason written into `tokens.css`. **Do not use Fraunces 300 anywhere** — two independent directions reached this separately |
| 18 | `hero-embed.html` hard-codes `#F7F5F0`, `#1A1A1A`, `#1B5FA8` | Replace with `var(--sp-paper)`, `var(--sp-ink-900)`, `var(--sp-focus)` — stops the component drifting again |
| 19 | Nine sections read as nine bands | Change ground tone at most 1 section in 3; vary container width at seams; let one element cross every seam |
| 20 | Every section a centred column | Three sanctioned compositions, no two consecutive the same. Composition, not palette, is what reads as designed |
| 21 | Bracket mark used only as a logo | Use it as the frame on every framed object — two opposing corners, never four |
| 22 | Card boundary is the only affordance | Focus ring + a full tonal step on hover. A 1.25:1 border cannot carry interactivity |
| 23 | Generic device bezel mockups | Flat plate + bracket frame + mono spec caption. Bezel mockups are the single most templated element on agency sites |
| 24 | `contrast.py` blind to new tokens | Extend `T` and `PAIRS` whenever a token is added, or "measured, not asserted" quietly becomes asserted |

**Cut deliberately** (see §9): the grain/noise layer, a fourth ground tone, and measured hanging
punctuation.

---

## 7. The motion system

Three rules, then the tokens. The rules matter more than the tokens.

**Rule 1 — The default is the finished state.** No element's base CSS is hidden. Hiding is scoped to
`html.js`, set by an inline head script before paint:

```html
<script>document.documentElement.classList.add('js')</script>
```
```css
html.js [data-enter] { opacity: 0; transform: translateY(var(--sp-move-md)); }
[data-enter] {
  transition: opacity   var(--sp-dur-entrance) var(--sp-ease-entrance),
              transform var(--sp-dur-entrance) var(--sp-ease-entrance);
  transition-delay: var(--enter-delay, 0ms);
}
html.js [data-enter].is-in { opacity: 1; transform: none; }
```

This one pattern gives, free: the JS-off fallback, the crawler fallback, the hydration-stall
fallback, and the structural fix for the ghosted hero. It also makes the existing
`prefers-reduced-motion` block in `tokens.css` automatically correct, because the reduced-motion
resting state becomes the *finished* state rather than the *start* state.

**Rule 2 — Images never animate opacity.** `<img>`, `<picture>`, poster or SVG enters by `clip-path`
wipe or `transform` at full opacity, or it does not animate. Text may fade.

**Rule 3 — Two duration classes, separated.** State transitions keep the 200ms ceiling already
decided. Entrance/choreography is a new, documented class — a seven-item stagger cannot happen
inside 200ms, and pretending otherwise is how an undocumented value enters a build.

```css
/* state — the 200ms rule, unchanged */
--sp-dur-instant:   80ms;   --sp-dur-fast: 120ms;   --sp-dur: 200ms;  /* hard cap */

/* entrance & choreography — the documented extension */
--sp-dur-entrance: 320ms;   --sp-dur-transform: 480ms;   --sp-dur-scene: 640ms;

/* easing — four curves. No spring, no overshoot, anywhere. */
--sp-ease:          cubic-bezier(0.2,  0, 0.2, 1);
--sp-ease-entrance: cubic-bezier(0.16, 1, 0.3, 1);
--sp-ease-inout:    cubic-bezier(0.65, 0, 0.35, 1);
--sp-ease-exit:     cubic-bezier(0.4,  0, 1,   1);

/* travel — >24px reads as a page assembling itself */
--sp-move-sm: 8px;  --sp-move-md: 16px;  --sp-move-lg: 24px;

/* stagger — total span is capped, so count sets the interval */
--sp-stagger: 70ms;         /* ≤5 siblings */
--sp-stagger-tight: 45ms;   /* 6–8 siblings; >8 stagger by row, never by item */
--sp-enter-at: 85%;
```

Absolute limits: no property animates longer than 640ms; no section's choreography spans more than
900ms end to end; no overshoot, spring or bounce anywhere — overshoot is the signature of the
playful-consumer archetype this identity explicitly avoids.

**This is an APPROVER change** — it extends a value decided in `visual-identity.md`. Per baseline
law: BASELINE → change → regression test → evidence → canonical.

### The three moments

**Moment 1 — "How It Connects", the seven-stage staircase.** Already the intended signature and
currently broken by the duplicate DOM. Rebuild as one tree, revealed by row (never by item, at seven
items). Add a fourth field per stage: **what this stage does NOT include**, taken verbatim from the
exclusions already written in `services.md`. That pre-empts the exact post-sale dispute that produced
your buyer's last bad agency experience, and costs zero new content.

**Moment 2 — "Ad Creative" becomes a variant test bench.** This is the strongest "we changed
marketing" proof available, because it *is* the product: 2–3 concepts × hook variants. A 2×2 rack,
CSS-only, that works at 390px unchanged. Real material exists —
`clients/911drain/campaigns/2026-08-26-storyboard-rebuild/hook-tournament.md` records 10 hook
candidates with mechanism, verdict, worst finding and severity, attacked in isolation, 3 surviving.
Showing ten hooks in, three out, with the kill reason printed, answers "do these people know
something I don't" better than any amount of motion.

> **Hard compliance wall:** no performance number may appear anywhere in this module, and it must be
> built so it *cannot* render one. Performance results sit in AWAITING EVIDENCE. "Tested" will be
> read as "tested in market" no matter what the strapline says — so say explicitly what was tested
> (the concept, adversarially, before spend) and what was not.
>
> **And check first:** publishing a client's adversarial kill sheet, even anonymized, exposes 911
> Drain's licence-scope reasoning — the same CR-37 material sitting unverified in Tier 1. This needs
> CLIENT_APPROVER, not just an anonymization pass.

**Moment 3 — The final CTA.** A converging close with the printed scope panel beside it.

**The performance contract:** compositor-only properties (`transform`, `opacity`, `clip-path`); no
layout-thrashing properties animated, ever; the 3.61 MB hero WebM lazy and poster-first so it is
never the LCP element; mobile downgrade path defined per moment. Measured against BC-48's real
defaults — **LCP < 2.5s throttled mobile, CLS < 0.1** — with a filed receipt.

**Technology:** the three moments above need **no animation library**. Total ESTIMATE under 15 KB of
JavaScript, mostly one shared IntersectionObserver. On GSAP: the audit says it is "already cleared
for commercial use per your build notes." **Those notes are not in this workspace and its licence
terms are not asserted here.** If GSAP is wanted, verify the licence from the source first — the
precedent is decision 0007, which verified OFL from Google Fonts' `METADATA.pb` rather than from
recollection.

**Cursor/pointer interaction layer: no.** It is a tell of a template-y creative-agency site, and it
does not exist on the device your buyer is holding.

---

## 8. The uncomfortable part

Two findings that reframe everything above. Both survived the adversarial pass; neither is
comfortable.

**8.1 — Roughly a third of the urgency in the audit and in this analysis is manufactured.**
V3 has no visitors and cannot have one while 0006 stands. So "the lead form may be a black hole",
"every lead is gone", "a prospect's consultant can check that in one keystroke" — all describe a dev
server on your laptop. The commercial cost today is **zero**. These are real pre-launch tasks with
no clock on them, not leaks. The word "blocker" should come off every item whose only harm is "a
visitor would experience X."

**8.2 — The violations are published somewhere else, and nobody is looking at it.**
`plan.md` §1.3 is headed, verbatim, *"Defects and risks found on the **live site**"*, and recorded on
2026-08-30: LSA sold as a purchasable add-on against a standing rule that forbids describing it as
running; retainers below the floor; 911 Drain published against an unsigned claims sheet; and
"30 days typical launch window" / "12+ monthly content assets" as unsubstantiated claim surfaces
rendering as **0 / 0 / 0+ / 0** without JS.

Those were on **servicepow.com**, not on V3. Whether they are still live today is unknown —
nobody has checked since. 0006 permits *reading* `plumbing` as evidence; it forbids writing. So the
honest action is a 15-minute read of the live domain and a one-page report to you. **Fixing the
invisible copy while the original stays published is the clearest case of activity mistaken for
progress in this whole exercise.** That is Stage 0.5, and it may be the highest-value hour in this
document.

**8.3 — The website is probably not the bottleneck.**
The company's position: one client it may not name, zero finished spec ads, no measurement, and a
website nobody can visit. The documented acquisition engine does not use the website —
`sales-process.md`: *"the spec ad IS the credibility argument. Show, then talk, then price,"*
cadence "day 0 the ad."

**The single highest-expected-value action available is not on the audit's list and is not a website
task: build one finished Service Pow spec ad.** It is differentiator #1. It is logged as a ⚠ Tier 2
open question. It does not exist — `assets/` holds only a README. It is also the missing proof asset
the site needs, so it serves both jobs at once. Every analysis lens noticed the gap and every one of
them filed it as "LATER."

RECOMMENDATION: if there is a choice between three weeks on V3 and two weeks on a spec ad plus a
prospect list, take the spec ad.

---

## 9. What was deliberately cut, and why

Recording these so they are not re-derived next time.

| Cut | Why |
|---|---|
| Paper grain / noise layer | A build-time asset pipeline that invalidates every measured ratio in `contrast.py` until re-run, and its own spec reduces it to α 0.015 on mobile — where the buyer is. Nobody perceives a 1.73 L\* texture |
| A fourth ground tone (`--sp-paper-deep`) | Two new contrast pairs for a footer |
| Measured hanging punctuation with per-glyph sidebearings | Named by its own author as "the most invisible-until-you-see-it craft item." Correct — invisible |
| Full identity supersession with evidence rebuild (D-3 option C) | Weeks of process to ratify a palette the owner may not want |
| Nine of twelve proposed CI gates | Playwright is not installed (`plan.md` B8). Ship the two that convert a recurring human miss into a machine stop; the rest is governance theatre for a one-person agency |
| Ambient WebGL / Spline scene | Barred by the colour law (no gradients; blue only where a decision is made), and subordinate to rules 1–3 of the rule priority |
| Scroll-jacking, parallax, cursor layer | Fails the register and the device |

**A note on this document's own bias.** The underlying analysis produced 131 findings covering an
ESTIMATE of ~25 unique defects — the CTA tap target appeared five times, the duplicate DOM five
times. Volume is not rigor, and a long document argues for a long project by its length alone. The
real shape is: **four decisions, one day of Stage 0, and a craft pass.** Do not let the page count
talk you into a three-week build on a locked branch.

---

## 10. Open unknowns — needs source check, not a guess

1. Whether the four suspect audit findings survive a production build (Stage 0.4).
2. Where `/growth-audit` submissions currently go.
3. Whether the TripNerd carousel on the homepage is an approved asset — and whether it is the
   compliance-fatal one.
4. Whether the 911 Drain wrap image is rendered on V3 and whether "sewer" is legible in it.
5. Whether the H.264 master still exists on Karl's machine.
6. Whether the live servicepow.com still carries the 2026-08-30 violations.
7. Whether "Full Pipeline" was cut deliberately.
8. Whether a GA4 property, GTM container and verified Search Console exist at all.
9. The URL inventory and redirect map for the rebuild — **BC-49 requires "redirects mapped on
   rebuilds"** and `site-process.md` warns *"Every SEO disaster we can prevent is a redirect that
   didn't get built."* Nobody has enumerated V3's or the live site's URL surface.
10. Cross-browser: every number in the audit is a Chromium DOM read. Safari is where the missing
    H.264, `clip-path`, `text-wrap: balance` and `100dvh` all diverge — and it is the buyer's browser.

---

*No performance figure, conversion rate, benchmark or study appears in this document. Where reasoning
replaces citation it is labelled. `style-bank.md` constraint 6 applies throughout:
verified-as-extracted ≠ verified-as-effective.*
