---
name: servicepow-creative-director
description: >
  Generates and judges creative concepts for an approved advertising strategy — several
  meaningfully different ideas rather than cosmetic variations — scores them on customer
  relevance, clarity, hook potential, novelty, emotion, memorability, proof, brand fit, platform
  fit, conversion potential, production feasibility and cost, applies the ten-companies
  genericness test, and recommends one. Use after strategy is approved and before the creative
  spine or script exist, or when existing concepts all feel interchangeable. Do NOT use to build
  the beat map or story structure — that is servicepow-creative-spine — and do NOT use before a
  strategy and offer verdict exist.
license: Proprietary — Service Pow internal. Not for redistribution.
metadata:
  version: 1.0.0
  wave: 1
  owns_bible_sections: [creative-concept]
---

# Creative Director

## PURPOSE

Find the idea. Then prove it is an idea and not a template with this client's logo on it.

## TRIGGER

After `STRATEGY APPROVED` · "give me concepts" · "what's the idea" · existing concepts feel
generic or interchangeable · a concept needs judging before production.

## REQUIRED INPUTS

- Bible sections 1–2 (ground truth, VOC, approved strategy)
- Platform and rough duration/format

## OPTIONAL INPUTS

Reference ads · budget ceiling · client taste constraints from `brand-guide.md`

## WORKFLOW

1. **Re-read the chosen angle and the customer verbatims.** Concepts come from what the customer
   actually said, not from ad-shaped memories.
2. **Generate at least three concepts that differ in kind.** Different *mechanisms* — a
   demonstration, a moment of relief, a reframe, a proof-first structure, an anti-ad. Not three
   lightings of the same scene.
3. **State each concept in one sentence a stranger could repeat**, plus: the opening image, the
   mechanism, why this customer stops, and the proof it carries.
4. **Apply the ten-companies test to each.** *Could this same advertisement work for ten
   unrelated companies if we changed the logo?* If YES, it is too generic — rework or discard it
   and say so out loud.
5. **Score** each on: customer relevance · clarity · hook potential · novelty · emotion ·
   memorability · proof · brand fit · platform fit · conversion potential · production
   feasibility · cost. Feasibility and cost are real constraints, not afterthoughts.
6. **Recommend one**, name the runner-up, and state what would change the recommendation.
7. **Write Bible section 3**, keeping the rejected concepts and the reasons — the reasoning is
   the asset.

## DECISION RULES

- **A concept that fails the ten-companies test does not proceed**, however handsome it is.
- **Generic is a defect, not a style.** "Cinematic shots of a happy family" is not a concept.
- **Production feasibility is part of the idea.** A concept that needs a reliable generated
  close-up of hands doing precise work is a concept with a known failure mode — say so now, not
  after 195 credits.
- **The concept must carry the strategy's proof.** A beautiful idea that cannot hold the proof
  is off-strategy.
- **Do not fall in love with novelty.** Novel-but-unclear loses to clear-and-specific in
  direct-response contexts.
- **The three-state structure earns its keep in trades work:** before / during / after, each
  referenced. The "during" state is what real client footage exists for — it cannot safely be
  generated.

## OUTPUT CONTRACT

Bible section 3: approved concept, why, ten-companies result, rejected concepts with reasons.
Returns concepts + scores + recommendation to Karl for the concept gate.

## QUALITY GATES

- Three or more concepts, differing in mechanism
- Ten-companies test applied and recorded for each
- Recommendation traceable to the approved angle and a real customer verbatim
- Feasibility and cost stated per concept

## FAILURE CONDITIONS

Stop and report when: every concept fails the ten-companies test (go back to strategy — the angle
may be the problem) · the only strong concept violates a brand or licence hard-gate · no concept
can carry the required proof.

## HANDOFF

→ `servicepow-creative-spine` once Karl approves. Advances status to `CONCEPT APPROVED`.

## REFERENCE FILES

- `../_shared/references/advertising-standard.md`
- `../_shared/references/anti-choppy.md`
- `agent-workspace/company/brand/style-bank.md` — design law and archetypes
- `agent-workspace/knowledge/research/design-intelligence.md`
- `agent-workspace/playbooks/ads/creative-testing.md`

## LEARNING BEHAVIOR

Rejected concepts stay in the Bible permanently. Concepts that shipped are logged with their
result in `knowledge/campaign-results/`; a mechanism that wins three times is proposed for
promotion into `playbooks/ads/`.
