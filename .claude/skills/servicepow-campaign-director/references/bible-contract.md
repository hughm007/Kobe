# The Campaign Bible — contract

One campaign. One idea. One world. One message. The Bible is how that is enforced across
specialist skills that never see each other's reasoning. This file and
`../templates/campaign-bible.md` are the **only** home of Bible structure and ownership;
section numbers below match the template exactly.

**ONE ORCHESTRATOR OWNS STATE.** `servicepow-campaign-director` alone holds the Bible, the
sequence, the gates, the approval states, and final readiness. Specialists never communicate
laterally and never keep independent campaign state. Artifacts cross stage boundaries through
the Bible; interpretations do not.

## Where it lives

In the campaign folder inside the client KB:

```
<client KB>/campaigns/<campaign-id>/campaign-bible.md
```

Campaign id: `YYYY-MM-DD-short-slug`. The Campaign Director provides the concrete path to
every specialist it invokes — no skill hardcodes it.

**Client facts live in the client KB, never inside a skill.** Skills are permanent Service Pow
rules; the Bible is this client, this campaign, right now.

Supporting artifacts sit beside it in the same campaign folder:
`shotlist.md` · `script.md` · `continuity/` · `production-log.md` · `variants/` · `qc/`.

## Who writes what

Each section has exactly one writing skill. **Only the owner writes its section.** Everyone
else reads. This is what stops a dozen skills reinventing the creative direction.

| § | Bible section | Written by |
|---|---|---|
| — | Header, approval status | `servicepow-campaign-director` |
| 1 | Ground truth — **including §1.1 Voice of customer and §1.2 Open UNKNOWNs** | `servicepow-client-intelligence` |
| 2 | Strategy: offer verdict, target, awareness level, core message, THE ANGLE, promise, proof strategy, objection strategy, platform, CTA, success metric | `servicepow-strategy` |
| 3 | Creative concept and pack: concept family, the pack's hook variants, gates evidence, rejected concepts and beaten hooks | `servicepow-creative-director` |
| 4 | Creative spine: primary emotion, viewer start/end state, narrative question, payoff, CTA logic, beat map | `servicepow-creative-spine` |
| 5 | Script (with declared-lines list) | `servicepow-script-director` |
| 6 | Storyboard: shot summary, visual/camera/lighting/colour language, Feeling Spec, Sound Spine | `servicepow-storyboard-director` |
| 7 | Cast and performance: characters, actor briefs, inspection verdicts | `servicepow-human-performance-realism` |
| 8 | Continuity annex: the seven bibles (character, product, location, lighting, camera, colour, audio-consistency), drift verdicts, temporal state | `servicepow-continuity-supervisor` |
| 9 | Brand and product fidelity: references, identity-asset inventory, COMPOSITE determinations, legal copy, review verdicts | `servicepow-brand-fidelity` |
| 10 | Production plan: methods, model routing, credit budget/spent, regeneration strategy, risks | `servicepow-higgsfield-production` |
| 11 | Audio design: audio language, music direction, silence, per-cut bridging, crowd vocals | `servicepow-audio-director` |
| 12 | Edit logic: cut reasons, pacing, screen grammar | `servicepow-cinematography-editor` |
| 13 | QC verdict (gate 1 of 2): verdict, scores, hard failures, registry status | `servicepow-creative-critic` |
| 14 | Skeptic verdicts (gate 2 of 2), all passes | `servicepow-campaign-director` — transcribing the isolated Skeptic subagent's verdict blocks **verbatim**; content authored by `servicepow-skeptic`, which never writes the Bible itself |
| 15 | CONFLICTS | appended by any skill; resolved only by `servicepow-campaign-director` |
| 16 | Decision log | `servicepow-campaign-director` |

Two ownership boundaries that are easy to blur, drawn precisely:

- **Voice of customer is §1.1, nested inside Ground truth.** It has no separate owner — it is
  `servicepow-client-intelligence` territory like the rest of §1.
- **Audio appears twice by design.** §8's audio bible is cross-shot **consistency**
  expectations (room tone and ambience that must hold across shots) and belongs to
  `servicepow-continuity-supervisor`; §11 is the audio **design** itself and belongs to
  `servicepow-audio-director`. Neither writes the other's entry.

## Read/write rules

1. **Read the Bible before acting.** A skill that starts work without reading it is guessing.
2. **Write only your own section.** Need something changed elsewhere? Raise a CONFLICT — the
   protocol and entry format live in
   `../../servicepow-client-intelligence/references/evidence-ladder.md`.
3. **Never delete another skill's content.** Append, or raise a conflict.
4. **Label every material statement** with the evidence ladder (CONFIRMED / INFERRED /
   UNKNOWN / HYPOTHESIS), defined in the same reference.
5. **Approval status gates production.** Nothing is generated while spend has not been
   authorized through the chain below.
6. **`## CONFLICTS` is append-only** until the Campaign Director resolves an entry.
7. **Only the Campaign Director changes approval status.**

## Approval states

`DRAFT` → `STRATEGY APPROVED` → `CONCEPT APPROVED` → `STORYBOARD APPROVED` →
`IN PRODUCTION` → `QC PASSED` → `CLIENT READY` → `DELIVERED`

Every transition is role-bound (roles defined in `../../_servicepow/data/roles.md`; the
never-stall parking rule there governs waiting at any of these gates):

| Transition | Gate |
|---|---|
| → `STRATEGY APPROVED` | APPROVER approves the strategy (§2); a WEAK offer verdict stops the chain |
| → `CONCEPT APPROVED` | APPROVER approves the concept and pack (§3) |
| → `STORYBOARD APPROVED` | APPROVER approves the storyboard (§6) — after brand-fidelity COMPOSITE marking, Skeptic Pass 1, and the actor briefs; the storyboard-stage registry checks (BC-24, BC-31, BC-34) are settled here |
| → `IN PRODUCTION` | SPEND_APPROVER authorizes the priced plan (§10) through the two-step gate in `../../_servicepow/policies/generation-and-spend.md`; generation spend begins only after this point |
| → `QC PASSED` | **Both** independent gates recorded: the critic's verdict (§13, BC-22) **and** the Skeptic's Pass 3 verdict (§14, BC-23). Neither waits for, nor sees, the other; the Campaign Director sequences them independently and gates on both. After a repair, only the gates invalidated by the changed elements re-run (targeted re-verification, proven by hash) |
| → `CLIENT READY` | A human has watched the master end to end (BC-25), the Human Taste Gate is answered, the full canonical blocking-check registry (`../../_servicepow/data/blocking-checks.yaml`) verifies, and the APPROVER signs final readiness |
| → `DELIVERED` | CLIENT_APPROVER sign-off on the deliverable |

## Minimum viable Bible

A campaign does not need every section filled to start — it needs the sections its current
phase requires, and honest UNKNOWNs everywhere else. A Bible full of invented certainty is
worse than a short one full of marked gaps.
