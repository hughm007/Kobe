# Critic scorecard

> **This file does not own the blocking-check list or its count.**
> The checks live in
> [`agent-workspace/playbooks/ads/video-production.md`](../../../../agent-workspace/playbooks/ads/video-production.md)
> and nowhere else (LB50 — one number, one file; decision 0004). **Read them there.** Never quote
> a count from here; there isn't one to quote.
>
> This file owns the *procedure*: the order of operations, the critic's own semantic hard-failure
> list, the axis scores and the verdict rules.

## Order of operations (do not reorder)

1. Stranger watch — one pass, delivery size and speed, sound on
2. The five viewer questions
3. Semantic hard-failure sweep (below)
4. **Machine + compliance checks — run the full blocking-check list from the playbook**
5. Axis scoring
6. ServicePow-6 ruling

**Taste never overrides a technical or legal failure.** Machine and compliance run before
aesthetic judgment for that reason. **A gate that could not run is a BLOCK, not a note.**

---

## 1. Semantic hard failures — any hit = NOT CLIENT READY

These are the critic's own judgment calls. They sit *alongside* the playbook's blocking checks,
not inside them.

| # | Failure | Note |
|---|---|---|
| 1 | Random disconnected scene | The anti-choppy law |
| 2 | Story that does not make sense | |
| 3 | Major face or hand issue | |
| 4 | Broken product | Wrong geometry counts |
| 5 | Incorrect branding | Near-correct is incorrect (LB24) |
| 6 | Major continuity error | |
| 7 | Bad dialogue lip sync | |
| 8 | Unusable audio | |
| 9 | Unsupported claim | Must be on the signed claims sheet |
| 10 | Fake testimonial | Synthetic person as customer/reviewer/endorser |
| 11 | Wrong CTA | Wrong action, wrong number, wrong destination |
| 12 | Visuals contradicting the script | |

**Do not average these away.** A 9.2 mean with a wrong logo is not a 9.2 — it is a reshoot.

### Two failures the playbook already owns — do not duplicate them here

| Was | Now |
|---|---|
| ~~#13 text present but unreadable~~ | **Blocking check 32 — performance gate.** Superior: measured, not eyeballed, with a recorded threshold case (the 911 Drain price line at ~242 WPM) and a script. Run the check; do not re-derive it |
| ~~#14 uncited or unopenable reference~~ | **Blocking check 34 + LB51.** Includes the state amendment: a before/after shot references **each state separately** and names the observable difference |

*(Both were found independently by the v8 pilot on 2026-08-26 and already existed in
ad-producer v4.0 as measured checks. The measured version wins — see decision 0004.)*

## 2. Compliance and machine sweep

**Run the full list from the playbook.** It is not reproduced here. It covers machine QC,
compliance, human gates, source-side checks, enforcement, and the v4.0 performance, biomechanical
and real-reference gates.

Two that the critic must confirm rather than assume:
- **Ad-to-landing-page parity** — *open the page*, do not infer it.
- **Human watched end to end** (LB29) — the critic cannot supply this. Record whether it happened.

## 3. Axis scoring (1–10, each with a stated reason)

**Strategy layer:** strategy · hook · clarity · customer relevance · creative idea
**Story layer:** story · sequence coherence · scene-to-scene logic · emotion · memorability
**Craft layer:** human realism · physics · product fidelity · continuity · camera · lighting ·
editing · audio · voice · lip sync
**Commercial layer:** brand fit · CTA · platform fit

### AI artifact risk (1–10, separate)

| Score | Means |
|---|---|
| 1–3 | No distracting synthetic tells at delivery size and speed |
| 4–6 | Tells visible on a second watch — acceptable only with a stated reason |
| 7–8 | Reads synthetic on first watch — **revise** |
| 9–10 | Obviously synthetic — **not client ready** |

## 4. ServicePow-6 — the only client-ready score

doesn't-look-AI · hook inside 2s · human presence · format fit · audio design ·
message + CTA clarity. **Floor 8.0 AND no axis ≤ 6.** Both, or not client ready.

## 5. Verdict

| Verdict | Condition |
|---|---|
| **HARD FAIL** | Any semantic hard failure, or any blocking check failed |
| **REVISE** | No hard failure, but ServicePow-6 below floor or an axis ≤6 |
| **CLIENT READY** | No hard failure, all blocking checks passed and actually run, ServicePow-6 ≥8.0, no axis ≤6 |
| **CANNOT ASSESS** | Creative or Bible unavailable, or a gate could not be run — never a pass |

## Report format

```
VERDICT: <one of the four>
FIRST REACTION (stranger watch): <honest, one line>
FIVE QUESTIONS: who / why / what / believe / next
SEMANTIC HARD FAILURES: <list with shot number / timestamp, or "none">
BLOCKING CHECKS: <pass / which failed / which could not be run>
SERVICEPOW-6: <per-axis> -> <mean>
AI ARTIFACT RISK: <n>/10 — <what gives it away>
TOP 3 REASONS NOT TO SHIP: 1. 2. 3.
FIX PER FAILURE: <specific, routed to the owning skill>
HUMAN WATCHED END TO END: <yes/no> (LB29 — not the critic's to tick)
```
