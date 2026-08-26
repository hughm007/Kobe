# The Campaign Bible — contract

One campaign. One idea. One world. One message. The Bible is how that is enforced across
fifteen skills that never see each other's reasoning.

## Where it lives

```
agent-workspace/clients/<client-slug>/campaigns/<campaign-id>/campaign-bible.md
```

Campaign id: `YYYY-MM-DD-short-slug` (e.g. `2026-08-26-2am-rebuild`).

**Client facts live in the workspace, never inside a skill.** Skills are permanent Service Pow
rules; the Bible is this client, this campaign, right now. The template lives at
`.claude/skills/servicepow-campaign-director/templates/campaign-bible.md`.

Supporting artefacts sit beside it in the same campaign folder:
`shotlist.md` · `script.md` · `continuity/` · `production-log.md` · `variants/` · `qc/`.

## Who writes what

Each section has exactly one owning skill. **Only the owner writes its section.** Everyone else
reads. This is what stops fifteen skills reinventing the creative direction.

| Bible section | Owner skill |
|---|---|
| Campaign header, approval status, CONFLICTS resolution | `servicepow-campaign-director` |
| Ground truth: business, customer, geography, pricing, competitors, proof, objections, buying process, assets, voice-of-customer | `servicepow-client-intelligence` |
| Offer verdict, positioning, target, awareness level, core message, angle, promise, objection strategy, platform, KPI, CTA | `servicepow-strategy` |
| Approved concept, **the pack's hook variants**, rejected concepts and beaten hooks and why | `servicepow-creative-director` |
| Creative spine, primary emotion, viewer start/end state, narrative question, payoff, beat map | `servicepow-creative-spine` |
| Script | `servicepow-script-director` |
| Shot list, visual/camera language | `servicepow-storyboard-director` |
| Characters, performance direction | `servicepow-human-performance-realism` |
| Continuity rules, character/product/location/lighting/colour/audio bibles | `servicepow-continuity-supervisor` |
| Product references, brand references, brand hard-gates | `servicepow-brand-fidelity` |
| Model routing, credit budget, regeneration strategy, known production risks | `servicepow-higgsfield-production` |
| Audio language, music direction | `servicepow-audio-director` |
| Edit logic, cut reasons | `servicepow-cinematography-editor` |
| QC verdict, scores, hard failures | `servicepow-creative-critic` |
| Skeptic findings and severities (all three passes) | `servicepow-skeptic` |

## Read/write rules

1. **Read the Bible before acting.** A skill that starts work without reading it is guessing.
2. **Write only your own section.** Need something changed elsewhere? Conflict protocol —
   `evidence-and-conflict.md`.
3. **Never delete another skill's content.** Append, or raise a conflict.
4. **Label every material statement** with the evidence ladder (CONFIRMED / INFERRED /
   UNKNOWN / HYPOTHESIS).
5. **Approval status gates production.** Nothing is generated while status is `DRAFT`. Karl
   approves the concept and the storyboard before spend — the two-step gate applies.
6. **`## CONFLICTS` is append-only** until the director resolves an entry.

## Approval states

`DRAFT` → `STRATEGY APPROVED` → `CONCEPT APPROVED` → `STORYBOARD APPROVED` →
`IN PRODUCTION` → `QC PASSED` → `CLIENT READY` → `DELIVERED`

Spend on generation begins only at `STORYBOARD APPROVED`. `CLIENT READY` requires **both** gates
— the critic's pass and a clear Skeptic pass 3 — **and** a human having watched it end to end
(LB29 — the only semantic gate).

## Minimum viable Bible

A campaign does not need every section filled to start — it needs the sections its current
phase requires, and honest UNKNOWNs everywhere else. A Bible full of invented certainty is
worse than a short one full of marked gaps.
