---
name: servicepow-higgsfield-intelligence
description: >
  Maintains Service Pow's current, dated knowledge of Higgsfield — available models, tools,
  workflows, reference support, camera and audio capabilities, editing and product workflows,
  duration and resolution limits, credit costs, and known failure modes — in a capability map
  where every claim carries a source, a verification date and a status of DOCUMENTED, VENDOR
  CLAIM, INDEPENDENT TEST or SERVICE POW TEST. Use when routing decisions depend on what a model
  can currently do, when the capability map is stale, when a new model appears, or when a
  generation failed in a way that should be recorded. Do NOT use to choose a model for a specific
  shot — that is servicepow-higgsfield-production.
license: Proprietary — Service Pow internal. Not for redistribution.
metadata:
  version: 1.0.0
  wave: 1
  maintains: references/higgsfield-capability-map.md
---

# Higgsfield Intelligence

## PURPOSE

Keep what we believe about the tools true and dated. Today's best model is not a permanent fact,
and a stale capability map produces confident, expensive mistakes.

## TRIGGER

Capability map older than its refresh interval · "what can Higgsfield do now" · "is there a
better model for X" · a new model or tool appears · a generation failed in an informative way ·
before a large or unusual production commitment.

## REQUIRED INPUTS

- The current capability map
- Access to the Higgsfield connector (`models_explore`, `balance`, `transactions`)

## OPTIONAL INPUTS

Vendor docs/changelog · independent tests · Service Pow's own production log

## WORKFLOW

1. **Read the map first** and note what is stale (past its verify-by date) or unlabelled.
2. **Query the live source of truth** — `models_explore` for the catalogue, per-model parameters,
   durations, resolutions and cost-relevant options; `balance` for plan and credits;
   `transactions` for what generations actually cost us.
3. **Update entries** with SOURCE · DATE VERIFIED · STATUS. Downgrade anything that can no longer
   be confirmed rather than leaving it looking current.
4. **Record failure modes from our own production log** as SERVICE POW TEST — the most valuable
   status, because it is the only one measured on our work.
5. **Note cost-relevant parameters explicitly** (quality/mode tiers, resolution, audio on/off,
   batch size) — these are the levers `higgsfield-production` pulls.
6. **Never rewrite a skill to name a "best model."** The map holds the facts; skills hold the
   procedure.

## DECISION RULES

- **Status discipline:** DOCUMENTED (vendor docs/API) < VENDOR CLAIM (marketing) <
  INDEPENDENT TEST (credible third party) < **SERVICE POW TEST** (we ran it). Where they
  disagree, ours wins for our work.
- **Undated is unusable.** An entry without a verification date is treated as unknown.
- **Cheap facts are still facts.** Record the low-cost models as carefully as the premium ones —
  they carry most of the exploration work.
- **Do not extrapolate from one generation.** One failure is EXPERIMENTAL; a pattern needs
  repetition before it becomes a routing rule.
- **Credits are live data, never hardcoded prose.** Read them; do not remember them.

## OUTPUT CONTRACT

Updated `references/higgsfield-capability-map.md`, every changed row carrying source, date and
status. Returns: what changed, what went stale, what newly matters for routing.

## QUALITY GATES

- Every entry has SOURCE, DATE VERIFIED, STATUS
- No entry asserts "best" without a stated task and date
- Known failure modes list reflects our own production log
- Cost-relevant parameters captured per model

## FAILURE CONDITIONS

Report rather than guess when: the connector is unavailable · vendor docs contradict observed
behaviour (record both, prefer ours) · a model in the map has disappeared from the catalogue.

## HANDOFF

→ `servicepow-higgsfield-production` consumes the map for routing.

## REFERENCE FILES

- `references/higgsfield-capability-map.md` — the living map
- `agent-workspace/knowledge/production-log/` — our own test results

## LEARNING BEHAVIOR

This skill *is* the learning mechanism for production capability. It writes only to the map and
the production log — never into another skill's rules. Promotion of a capability finding into a
playbook follows the EXPERIMENTAL → REPEATED → VALIDATED path.
