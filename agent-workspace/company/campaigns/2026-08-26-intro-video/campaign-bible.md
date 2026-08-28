---
title: "Service Pow — company introductory video (60s, website hero) — Campaign Bible"
type: report
client: internal
owner: Karl
status: draft
created: 2026-08-26
updated: 2026-08-26
tags: [company, video, intro-video, code-rendered]
---

# Campaign Bible — Service Pow intro video

**What this is:** the ~60s animated explainer for the Service Pow homepage, in the style
Wyatt cited (TripNerd's whiteboard scribe). **Method: code-rendered vector animation** —
zero AI generation, zero credits, deterministic re-renders.

## STATUS HEADER

**Owner decisions (in-session, 2026-08-26):** method = code-rendered vectors · job = explain
what Service Pow does · format = 60s 16:9 hero + 20s social cutdown · **service list = only
what is live** · endcard = provisional type-only wordmark · look = whiteboard + one accent
(placeholder, one variable).

**Open / NOT VERIFIED — `servicepow.com` could not be read.** Three attempts, three refusals,
recorded rather than worked around:

| Attempt | Result |
|---|---|
| `curl https://www.servicepow.com/` | `CONNECT tunnel failed, response 403` |
| `WebFetch` | `EGRESS_BLOCKED` |
| Web search | not indexed |

The proxy's own documentation says a 403 means *"the destination host is not allowed by your
organization's egress policy… do not retry or route around it — report the blocked host."* The
in-container Chromium goes through the same proxy, so driving a browser at it fails identically;
that is not a route around a policy denial and was not attempted. **The URL itself is
CONFIRMED** — the Owner supplied it in session — and it is on the endcard. The site's headline,
subhead, palette and logo remain unread.

**Still requested from Wyatt (only he can see them):** (1) the site's headline + subhead,
(2) the brand colour(s), (3) a logo file into `assets/`. Until they arrive the video is built
from the canonical workspace files, the accent is one CSS variable, and the endcard is a
labelled provisional treatment.

## 1. Ground truth — CONFIRMED (every line traceable)

| Fact | Source |
|---|---|
| Marketing company; video, ads, websites and the wider marketing umbrella | `company/company-profile.md`, `CLAUDE.md` |
| **Primary offering: AI video ad production.** "The unit of sale is a tested-variation pack, never a single video" | `company/services.md` |
| Pilot pack: **2 concepts x 2 hooks = 4 finished ads**, one strategy call, **5-7 business days** from receipt of client assets | `company/services.md` |
| Starter retainer: 4 finished ads/month, angle rotation guaranteed, monthly performance report, one strategy call/month | `company/services.md` |
| **"Hybrid real+AI is the default promise"** - client's real footage as hero shots, AI environments and B-roll; "this beats the 'it looks AI' objection and is the moat" | `company/services.md` |
| Websites and landing pages **built as code with Claude, hosted on Vercel** | `company/services.md`, decision 0002 |
| Motion graphics / edit layer - **code-rendered** end cards, lower thirds, word-synced captions, kinetic type; "it never generates a logo" | `company/services.md` |
| Social strategy is a live service line | `company/services.md` |
| Differentiators: the spec ad made before they ask - realism discipline - **"platform-safe AI ads"** (disclosure handled, no fake testimonials, claims substantiated) - **"tested variants, not single guesses"** | `company/positioning-and-icp.md` |
| Wedge: home services and local trades - "the WEDGE, not the ceiling" | `company/positioning-and-icp.md` |
| Style Bank archetype for Service Pow itself: **I (experimental agency)**, A/D alt; accessibility (4.5:1) outranks fidelity | `company/brand/style-bank.md` |

## 2. Ground truth - BARRED FROM THIS VIDEO (the honest narrowing)

| Excluded | Why - quoted |
|---|---|
| **Email marketing** | "Status: runbook written, test rig ... not yet started." Not a live capability |
| **Google LSA pay-per-lead** | "still in research (Hugh owns it). **Not live, not applied to any client - never describe it as running**" |
| Client names / logos (911 Drain, TripNerd) | Real clients, but naming them publicly is their consent to give, not ours to assume |
| Any results metric, win rate, or "trusted by N" | No substantiated figures exist; the Style Bank's own rule - "every conversion surface is a claim surface" |
| Prices | Not decided for a public surface; the video sells the first step, not a number |
| A logo | None exists (`assets/` holds only a README); logos are real files, never generated (LB24) |

## 3. Spine

- **Core message:** Service Pow makes ads that don't look like AI made them - and gives you
  tested variants instead of one expensive guess.
- **Core promise:** four finished, tested ads built on your own real footage.
- **Primary emotion:** relief that someone has a system (competence-calm), not excitement.
- **Viewer start state:** has bought marketing before and can't tell what worked.
- **Viewer end state:** understands the offer and what the first step is.
- **Narrative question:** "why would this be different from the last thing I paid for?"
- **Payoff:** the spec ad - we'll make one for your business before you ask.
- **CTA logic:** one step, no price, no pressure: see one made for you.

## 4. Beat map (six fields per beat)

| Beat | Knows before | What happens | Knows after | Emotion | Why it exists | Leads into |
|---|---|---|---|---|---|---|
| HOOK | marketing is a gamble I keep losing | one lonely ad frame is drawn, then a question mark | that is exactly my problem | recognition | self-selection | so what is the alternative? |
| WHO | so what is the alternative? | the name is written; three live services appear | a marketing company that makes video, ads and sites | orientation | names the company early | what do they actually do? |
| PACKS | what do they actually do? | 2 concepts x 2 hooks sketch snaps into 4 finished ads | you get four tested variants, not one guess | interest | the primary offering, as the unit of sale | but will it look AI? |
| REAL+AI | but will it look AI? | a real phone clip drops into a drawn scene; both snap real | your own footage is the hero; AI does the rest | reassurance | the moat, in one picture | is it safe to run? |
| SAFE | is it safe to run? | a checklist ticks: disclosure - no fake testimonials - claims substantiated | it is built not to get me in trouble | trust | the differentiator competitors ignore | what else can they do? |
| BUILD | what else can they do? | wireframe snaps to a live site; end card, captions, lower third | they build the surrounding pieces too | breadth | websites + motion + social, all live | how do I start? |
| START | how do I start? | one ad draws itself for YOUR business | they will show me before I pay | low-risk curiosity | the spec-ad differentiator IS the CTA | (endcard) |
| END | - | wordmark + URL settle | where to go | resolve | the close | - |

**Chain check:** each "leads into" equals the next "knows before" (verified) · **Shuffle
test:** PACKS before REAL+AI is the objection order (offer, then the doubt it raises); SAFE
cannot precede the AI admission; START must follow proof.

## 5. Gates

| Gate | When | State |
|---|---|---|
| Skeptic Pass 1 | on the storyboard, before the full render | PENDING |
| Kobe (creative critic) + DR lens | on the finished cut - **the first watchable artifact this pipeline has produced** | PENDING |
| Owner sign-off | before anything is published to the site | PENDING |

### Build status - 2026-08-28

| | |
|---|---|
| Method | Deterministic frame clock -> Chromium screenshots -> ffmpeg. Every pixel is a pure function of the frame number; re-rendering produces identical output |
| Toolchain | node 22.22.2 · ffmpeg 6.1.1 · Chromium 1194 at a pinned path (the Playwright package expects build 1234; we point at the binary the image has rather than downloading one the proxy would block) |
| Spend | **$0. Zero credits. Zero generative calls.** |
| Contrast | Measured at render time and printed, not asserted: ink/ground 15.97:1 · accent/ground 5.93:1 · light/plate 12.40:1 |
| Files | `build/scenes.html` (the film) · `build/render.py` (frames) · `build/render.sh` (frames -> MP4) |
| Defects caught by looking at frames | **Seven**, all in storyboard Rev 2's revision log. The most instructive: the hook cold-read as *a note*, not an ad |

## Decision log

| Date | Decision | By | Why |
|---|---|---|---|
| 2026-08-26 | Code-rendered vector animation, not AI-generated and not a live shoot | Owner (Wyatt) | A whiteboard scribe is a hand drawing a logo - the two things generation is worst at; code is free, deterministic, and never fabricates a mark |
| 2026-08-26 | Only-live services; email and LSA excluded | Owner (Wyatt) | Their own files bar it - "never describe it as running" |
| 2026-08-26 | Provisional type-only endcard, labelled | Owner (Wyatt) | No logo file exists; a mark is never generated (LB24) |
| 2026-08-26 | Whiteboard + one accent as a single variable | Owner (Wyatt) | No brand palette exists yet; one line changes it later at zero cost |
| 2026-08-26 | The video is built the way the company works - code-rendered, no generated mark | Claude (recorded) | The method performs the thesis it describes |
| 2026-08-28 | One shared ad vocabulary used at four sizes, not per-scene drawings | Claude (recorded) | The lone hook ad, the four grid cells and the compliance ad are the same object, so the snap at 0:20 pays off a shape the viewer met at second 1 |
| 2026-08-28 | The marker draws pictures; type is type. No hand-lettering | Claude (recorded) | Hand-lettering the company name is *drawing a mark* - the one thing LB24 forbids. Typesetting keeps the endcard honestly provisional |
| 2026-08-28 | The 5-7 day conditional moves into the burned text, not the VO | Claude (recorded) | `services.md` says "from receipt of client assets"; the VO dropped the condition and a viewer would hear it as "from hiring you". The burn carries the qualifier without wrecking the read |
| 2026-08-28 | "We make the first one before you ask" left in, marked UNSIGNED | Claude (escalated) | It is the only line in the film a viewer can hold us to - a capacity decision, not a copy decision. Three options in `script.md` §4b |
