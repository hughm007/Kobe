---
name: servicepow-client-intelligence
description: >
  Establishes the factual ground truth about a client and their customers before any creative
  work begins — business, product, geography, pricing, offer, competitors, differentiation,
  proof, objections, buying process, brand, existing assets, constraints — plus voice-of-customer
  research into how real customers actually describe the problem. Every conclusion is labelled
  CONFIRMED, INFERRED, UNKNOWN or HYPOTHESIS, and client facts are never invented. Use at the
  start of any campaign, when onboarding a client, or when creative work has stalled because
  nobody can answer who the customer is. Do NOT use to write strategy or messaging — that is
  servicepow-strategy — and do NOT use for competitor creative teardowns.
license: Proprietary — Service Pow internal. Not for redistribution.
metadata:
  version: 1.0.0
  wave: 1
  owns_bible_sections: [ground-truth, voice-of-customer, open-unknowns]
  absorbs: voice-of-customer
---

# Client Intelligence

## PURPOSE

Know the business and its customers before spending a dollar or a creative idea on them. Produce
facts with sources, not a plausible-sounding picture.

*(This skill absorbs voice-of-customer: both establish ground truth, share the same evidence
ladder, write to the same Bible section and always run together. Splitting them added a hop and
no clarity. VOC remains a mandatory phase within the workflow and can be run alone.)*

## TRIGGER

Campaign start · client onboarding · "what do we know about <client>" · "who is the customer
for <client>" · creative work blocked by missing facts · VOC-only requests ("what do customers
actually say about X").

## REQUIRED INPUTS

- Client slug and its `client-brief.md`
- The campaign's Bible path (or a note that this is standalone research)

## OPTIONAL INPUTS

Client website · review sources · competitor list · sales-call notes · prior campaigns

## WORKFLOW

1. **Harvest what we already hold.** Read `client-brief.md`, `brand-guide.md`,
   `access-and-accounts.md`, prior campaigns, and `agent-workspace/company/` for the Service Pow
   side. Most "research" is already written down; do not re-derive it.
2. **Fill the business picture** across: business · product/service · geography/service area ·
   pricing and offer mechanics · competitors · differentiation · proof available · objections ·
   buying process · existing assets · constraints (legal, licence, brand).
3. **Voice of customer — real language only.** Where tools permit: reviews, comments, forums,
   search behaviour, customer questions, competitor reviews, sales conversations, support
   issues, testimonials. Extract repeated pains · desired outcomes · **verbatim customer
   words** · buying triggers · fears · high-intent moments.
4. **Label everything** with the evidence ladder. Cite the source for each CONFIRMED.
5. **List the UNKNOWNs that block work**, who can answer each, and what it blocks.
6. **Write the Bible's Ground truth and Voice of customer sections.** Nothing else.

## DECISION RULES

- **Never invent a client fact.** No plausible pricing, no assumed service area, no imagined
  testimonial. UNKNOWN is a valid and respected answer.
- **No invented personas.** "Busy homeowner, 35–54, values convenience" is not research; it is
  filler. Either quote real customers or mark the gap UNKNOWN.
- **Customer language beats marketing language.** When a customer says "backed up" and the brand
  says "drainage remediation", the customer wins in the ad copy.
- **A claim destined for the finished ad must be CONFIRMED and on the signed claims sheet.** If
  it is not, flag it now — not at QC.
- **Licence and scope constraints are ground truth, not footnotes.** Record them where downstream
  skills will see them.

## OUTPUT CONTRACT

Bible sections 1 (Ground truth, Voice of customer, Open UNKNOWNs). Every material line carries an
evidence label. Every CONFIRMED carries a source. Returns a short summary plus the blocking
UNKNOWN list.

## QUALITY GATES

- No unlabelled material statement
- At least one real customer verbatim, or VOC explicitly marked UNKNOWN with what was tried
- Constraints from the brand guide carried forward verbatim
- Zero invented facts (self-check: could I point at a source for every CONFIRMED?)

## FAILURE CONDITIONS

Stop and escalate when: the client folder or brief does not exist · a constraint makes the
campaign unlawful or off-licence · every material fact would be INFERRED (that is not a
foundation to build on — get Karl to fill the gaps first).

## HANDOFF

→ `servicepow-strategy`. Blocking UNKNOWNs go to `servicepow-campaign-director` for escalation.

## REFERENCE FILES

- `../_shared/references/evidence-and-conflict.md`
- `references/voc-method.md` — where to look, what to extract, how to cite
- `agent-workspace/clients/<slug>/client-brief.md`, `brand-guide.md`
- `agent-workspace/operations/compliance.md` — claims discipline

## LEARNING BEHAVIOR

Newly confirmed durable client facts are written back to `client-brief.md` (with source and
date) so the next campaign starts warmer. Campaign-specific findings stay in the Bible. A
resolved UNKNOWN is ticked in `agent-workspace/company/OPEN-QUESTIONS.md`.
