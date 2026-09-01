---
name: servicepow-competitive-intelligence
description: >
  Analyzes competitors' advertisements, offers, funnels, creative mechanisms, and market
  positioning to sharpen Service Pow strategy — for a client engagement or for Service Pow
  itself. Produces an evidence-labeled Competitive Picture: per-competitor offer, audience,
  hooks, angles, creative mechanism, visual language, CTA, funnel structure, landing-page
  behavior, proof mechanisms, positioning, strengths, weaknesses; cross-competitor patterns;
  and differentiation opportunities with recommended tests. Activates when (a) the Campaign
  Director or servicepow-strategy requests competitive input, or (b) the user explicitly asks
  to analyze competitors, research a competitor's ads or funnel, map a market's advertising, or
  find differentiation opportunities. Generic advertising requests belong to
  servicepow-campaign-director. Analysis only: it never copies competitor creative, and it owns
  no campaign execution, no compliance ruling, no spend, and no generation.
license: Proprietary — Service Pow internal. Not for redistribution.
metadata:
  version: 2.0.0
---

# Competitive Intelligence

## PURPOSE

Anyone can look at a competitor's ad. The discipline here is extracting the **mechanism** —
why the ad works, who it is aimed at, what the offer really is, where the funnel takes the
click — and separating what was actually observed from what is merely inferred, so strategy
built on top of it stands on evidence rather than vibes. The output is a reusable Competitive
Picture that feeds strategy, creative, prospecting, and website conversion — never a template
to imitate.

## TRIGGER

Activates when **(a)** the Campaign Director or `servicepow-strategy` requests competitive
input for an engagement, or **(b)** the user explicitly asks to analyze competitors, research a
competitor's advertising or funnel, map a market's advertising landscape, or find
differentiation opportunities. Generic advertising requests belong to
`servicepow-campaign-director`.

Not for: judging Service Pow's own creative (`servicepow-creative-critic` /
`servicepow-skeptic`), building the client's own ground truth (`servicepow-client-intelligence`),
or ruling on what may be claimed (policy owns that).

## INPUTS

Required: the market/vertical and geography, and whose benefit the analysis serves (a named
client engagement or Service Pow itself). Useful: competitor names if known, the client's
current offer summary from `servicepow-client-intelligence`, prior Competitive Pictures for
delta analysis, access to ad libraries / competitor sites / review platforms.

## WORKFLOW

1. **Frame the question.** What decision will this analysis feed (angle choice, offer design,
   pitch, website conversion)? Scope the competitor set: direct locals, category leaders, and
   one or two out-of-category operators worth studying for mechanism.
2. **Collect observations.** Ad libraries (Meta Ad Library, Google Ads Transparency, TikTok
   Creative Center), competitor websites and landing pages, review platforms, social profiles,
   local search results. Record WHERE and WHEN each observation was made — an observation
   without a source and date is not an observation.
3. **Extract per competitor** (the extraction schema in `references/extraction-schema.md`,
   every field labeled per the evidence ladder):
   competitor · offer · target audience · hooks (verbatim where observed) · angles ·
   creative mechanism (what does the work: demonstration, social proof, fear, price, speed,
   identity) · visual language · CTA · funnel structure (ad → destination → capture →
   follow-up, as far as observable) · landing-page behavior (what the page actually does when
   opened: parity with the ad, capture friction, mobile behavior) · proof mechanisms (reviews,
   guarantees, credentials, before/afters — and whether they look substantiated) ·
   positioning · strengths · weaknesses.
4. **Label every material line** using the evidence ladder
   (`../servicepow-client-intelligence/references/evidence-ladder.md`), mapped to this skill's
   five output labels: **CONFIRMED OBSERVATION** (seen directly, source + date recorded) ·
   **EVIDENCE** (artifact in hand supporting a conclusion) · **INFERENCE** (reasoned from
   observations — say from what) · **UNKNOWN** (could not be determined — say what would
   resolve it) · **SERVICE POW OPPORTUNITY** (a differentiation opening, argued from the
   labeled lines above it).
5. **Find cross-competitor patterns.** What does everyone in this market say, show, promise,
   and ignore? A pattern shared by every competitor is a convention — and every convention is
   a candidate to break deliberately.
6. **Derive opportunities and tests.** Each SERVICE POW OPPORTUNITY names: the gap · the
   evidence it rests on · which consumer (strategy angle, creative concept, offer design,
   website conversion, prospecting/pitch) it feeds · a recommended test with a falsifiable
   expectation. Opportunities recommend tests; they never promise outcomes.
7. **Write the Competitive Picture** to the client KB (or the Service Pow KB for internal
   work) and hand off per contract.

## DECISION RULES

- **Analyze mechanisms, never copy creative.** Competitor material is studied for WHY it
  works. No competitor copy, script, layout, or visual is reproduced into Service Pow or
  client work — a finding is expressed as a mechanism ("demonstrates same-day response with
  timestamped footage"), never as material to reuse.
- **Observation beats recall.** Open the actual ad library, the actual landing page. If it
  was not opened, it is UNKNOWN — not INFERENCE.
- **Date everything.** Competitive facts decay; every Picture carries its collection dates,
  and re-use of a Picture older than a quarter requires a delta pass.
- **Competitor claims are observations about their marketing, not facts about their
  business.** "Competitor claims 30-minute response" is CONFIRMED OBSERVATION of the claim;
  whether they deliver it is UNKNOWN unless evidenced.
- **No fabricated competitor weaknesses.** A weakness must be observed or evidenced. Wishful
  reading of a competitor is worse than no analysis.

## POLICY BINDINGS

- `../_servicepow/policies/claims-and-proof.md` — anything from this analysis that becomes a
  claim in Service Pow or client material needs its own Evidence Record; a competitor
  comparison in an ad is a comparative claim under that policy.
- `../_servicepow/policies/realism-and-disclosure.md` — governs any creative work downstream;
  this skill only informs it.
- `../_servicepow/data/roles.md` — outputs go to the OPERATOR/APPROVER; this skill holds no
  approval authority.

## OUTPUT CONTRACT

The **Competitive Picture**: scope + collection dates · per-competitor extractions (schema
fields, every material line labeled CONFIRMED OBSERVATION / EVIDENCE / INFERENCE / UNKNOWN) ·
cross-competitor patterns · SERVICE POW OPPORTUNITY list with evidence chains and recommended
tests · open UNKNOWNs with what would resolve each. Filed in the relevant KB, dated.

## HANDOFF

Consumers: `servicepow-strategy` (offer verdict and angle selection) ·
`servicepow-creative-director` (concept/hook differentiation and the Anti-Generic Gate) ·
`servicepow-client-intelligence` (market context joins ground truth) · website conversion and
prospecting/pitch work (opportunity and pattern sections). This skill owns no campaign
execution, no compliance ruling, no spend, and no generation; disagreements about what an
engagement should DO with a finding are resolved by the Campaign Director.
