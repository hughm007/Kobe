---
name: servicepow-client-intelligence
description: >
  Establishes the factual ground truth about a client and their customers before any creative
  work begins — business, product/service, geography and service area, pricing and offer
  mechanics, competitors, differentiation, available proof, objections, buying process, brand,
  existing assets, and constraints — plus voice-of-customer research into how real customers
  describe the problem in their own words. Every conclusion is labelled CONFIRMED, INFERRED,
  UNKNOWN or HYPOTHESIS; client facts are never invented, and facts destined to become claims
  are routed into Evidence Records. Activates when the Campaign Director invokes the
  client-intelligence phase, or when the user explicitly asks for client research, client
  onboarding intake, ground-truth work, or voice-of-customer research ("what do we know about
  this client", "who is the customer", "what do customers actually say about X"). Not for
  writing strategy or messaging (that is servicepow-strategy) and not for competitor creative
  teardowns. Generic advertising requests belong to servicepow-campaign-director.
license: Proprietary — Service Pow internal. Not for redistribution.
metadata:
  version: 2.0.0
---

# Client Intelligence

## PURPOSE

Know the business and its customers before spending a dollar or a creative idea on them.
Produce facts with sources, not a plausible-sounding picture.

Voice-of-customer research is a mandatory phase of this skill, not a separate one: ground truth
and VOC share the same evidence ladder, write to the same Bible section, and always run
together. VOC can also be run alone on request.

This skill owns the evidence ladder and conflict protocol
(`references/evidence-ladder.md`). Other skills cite it as
`../servicepow-client-intelligence/references/evidence-ladder.md`.

## TRIGGER

Activates when (a) the Campaign Director invokes this phase (client intelligence / ground
truth), or (b) the user explicitly asks for client research, client onboarding intake,
ground-truth work, or voice-of-customer research — "what do we know about this client", "who
is the customer", "what do customers actually say about X" — or when creative work is blocked
because nobody can answer who the customer is. VOC-only requests activate step 3 alone.
Generic advertising requests belong to servicepow-campaign-director.

## INPUTS

Required:
- Client identity and access to the client KB
- The Campaign Bible (path provided by the Campaign Director), or a note that this is
  standalone research

Optional: client website · review sources · competitor list · sales-call notes · prior
campaigns

## WORKFLOW

1. **Harvest what we already hold.** Read the client KB — brief, brand guide, access and
   account notes, prior campaigns — and Service Pow's own records for our side of the
   relationship. Most "research" is already written down; do not re-derive it.
2. **Fill the business picture** across: business · product/service · geography/service area ·
   pricing and offer mechanics · competitors · differentiation · proof available · objections ·
   buying process · existing assets · constraints (legal, licence, brand).
3. **Voice of customer — real language only** (method: `references/voc-method.md`). Where
   tools permit: reviews, comments, forums, search behaviour, customer questions, competitor
   reviews, sales conversations, support issues, testimonials. Extract repeated pains ·
   desired outcomes · **verbatim customer words** · buying triggers · fears · high-intent
   moments.
4. **Label everything** with the evidence ladder (`references/evidence-ladder.md`). Cite the
   source for each CONFIRMED.
5. **Route prospective claims into Evidence Records.** Any fact that could surface in a
   deliverable as a factual, comparative, or performance claim is filed as — or flagged as
   needing — an Evidence Record per `../_servicepow/policies/claims-and-proof.md` §2. The
   OPERATOR requests substantiation from the CLIENT_APPROVER now, not at QC.
6. **List the UNKNOWNs that block work** — for each: which role can answer it
   (CLIENT_APPROVER for client facts, APPROVER for internal calls), and what it blocks.
7. **Write the Bible's Ground truth and Voice of customer sections.** Nothing else.

## DECISION RULES

- **Never invent a client fact.** No plausible pricing, no assumed service area, no imagined
  testimonial. UNKNOWN is a valid and respected answer.
- **No invented personas.** "Busy homeowner, 35–54, values convenience" is not research; it is
  filler. Either quote real customers or mark the gap UNKNOWN.
- **Customer language beats marketing language.** When a customer says "backed up" and the
  brand says "drainage remediation", the customer wins in the ad copy.
- **A claim destined for a finished deliverable must be CONFIRMED and carried by a filed
  Evidence Record** (`../_servicepow/policies/claims-and-proof.md` §2; registry gate BC-16).
  If it is not, flag it now — a claim discovered unsubstantiated at QC forces a rebuild.
- **Licence and scope constraints are ground truth, not footnotes.** Record them where
  downstream skills will see them.

## POLICY BINDINGS

- `../_servicepow/policies/claims-and-proof.md` — the evidence standard for every fact
  gathered here that may surface as a claim; intake files Evidence Records per §2, with
  substantiation from the CLIENT_APPROVER (registry gate BC-16).
- `../_servicepow/policies/realism-and-disclosure.md` — bounds what VOC findings may become
  on screen: customer verbatims inform copy, but synthetic-people limits (§2, registry gate
  BC-17) govern any depiction or endorsement built from them.
- `../_servicepow/policies/brand-assets.md` — governs the brand identity assets and brand
  constraints inventoried during intake; recorded constraints feed BC-21.
- `../_servicepow/data/blocking-checks.yaml` — the canonical blocking-check registry; ground
  truth gathered here feeds BC-16 (claim substantiation), BC-19 (offer, price, and
  service-area facts used for ad-to-destination parity), and BC-20 (rights confirmations).
- `../_servicepow/data/roles.md` — role definitions and the never-stall rule; blocking
  UNKNOWNs bind to the CLIENT_APPROVER (client facts) or APPROVER (internal calls).

## OUTPUT CONTRACT

The Bible's Ground truth, Voice of customer, and Open UNKNOWNs sections. Every material line
carries an evidence label. Every CONFIRMED carries a source. Every prospective claim carries an
Evidence Record ID or a logged substantiation request. Returns a short summary plus the
blocking-UNKNOWN list (each with the role that can answer it and what it blocks).

## QUALITY GATES

- No unlabelled material statement
- At least one real customer verbatim, or VOC explicitly marked UNKNOWN with what was tried
- Constraints from the client's brand guide carried forward verbatim
- Zero invented facts (self-check: could I point at a source for every CONFIRMED?)
- Every prospective claim has an EV- ID or a pending substantiation request logged

## FAILURE CONDITIONS

Stop and escalate when: the client KB does not exist · a constraint makes the campaign
unlawful or off-licence (→ APPROVER) · every material fact would be INFERRED — that is not a
foundation to build on. In that last case the OPERATOR asks the CLIENT_APPROVER to fill
client-fact gaps and the APPROVER to make internal calls before any downstream skill runs.

## LEARNING BEHAVIOR

Newly confirmed durable client facts are written back to the client KB (with source and date)
so the next campaign starts warmer. Campaign-specific findings stay in the Bible. A resolved
UNKNOWN is marked resolved in the client KB's open-questions record.

## HANDOFF

→ `servicepow-strategy`. Blocking UNKNOWNs go to `servicepow-campaign-director` for
escalation. Disagreements with an approved upstream decision follow the conflict protocol in
`references/evidence-ladder.md` — never a silent fix.
