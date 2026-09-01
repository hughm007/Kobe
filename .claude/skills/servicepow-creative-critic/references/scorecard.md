# Critic scorecard

> **This file does not own the blocking-check list.** The delivery gates live in the canonical
> blocking-check registry (`../../_servicepow/data/blocking-checks.yaml`) and nowhere else.
> Read them there; never quote a count from here — there isn't one to quote.
>
> This file owns the *procedure*: the order of operations, the critic's own semantic
> hard-failure list, the axis cards, the **ServicePow-6** (its single home — registry check
> BC-22 cites this skill), the AI-artifact risk scale, the verdict rules, the Direct-Response
> lens, and the report format.

## Order of operations (do not reorder)

1. Stranger watch — one pass, delivery size and speed, sound on
2. The five viewer questions
3. Semantic hard-failure sweep (§1)
4. Registry verification — every canonical blocking check has a receipt (§2)
5. Axis scoring (§3) + AI-artifact risk
6. ServicePow-6 ruling (§4) and verdict (§6)
7. Direct-Response lens (§7) — ADVISORY, after the verdict, never instead of it

**Taste never overrides a technical or legal failure.** Registry verification runs before
aesthetic judgment for that reason. **A gate that could not run is a BLOCK, not a note.**

---

## 1. Semantic hard failures — any hit = NOT CLIENT READY

These are the critic's own judgment calls. They sit *alongside* the registry's blocking checks,
not inside them.

| # | Failure | Note |
|---|---|---|
| 1 | Random disconnected scene | The anti-choppy law: every scene must earn its connection to the next |
| 2 | Story that does not make sense | |
| 3 | Major face or hand issue | At delivery size on the master. Focal shot-level tells are `servicepow-human-performance-realism`'s reject-on-sight before assembly; this row catches what survived into the cut |
| 4 | Broken product | Wrong geometry counts |
| 5 | Incorrect branding | Near-correct branding is incorrect; the standard is `../../_servicepow/policies/brand-assets.md` (registry gate BC-21) |
| 6 | Major continuity error | |
| 7 | Bad dialogue lip sync | |
| 8 | Unusable audio | The judgment call a meter cannot make — mud, garble, distraction. BC-04/BC-05 own the measurable floors |
| 9 | Wrong CTA | Asks the wrong action for the objective. BC-15 verifies the strings are present and BC-19 verifies the destination — this row judges whether the ask itself is right |
| 10 | Visuals contradicting the script | |

**Do not average these away.** A 9.2 mean with a wrong logo is not a 9.2 — it is a reshoot.

### Failures the registry gates mechanically — cite the check, never re-derive it by eye

| Judgment temptation | Registry gate |
|---|---|
| Unsupported claim | **BC-16** — the bar is a filed Evidence Record per `../../_servicepow/policies/claims-and-proof.md` |
| Synthetic person presented as a real customer, reviewer or endorser | **BC-17** — standard per `../../_servicepow/policies/realism-and-disclosure.md` |
| Missing AI disclosure | **BC-18** |
| Ad-to-landing-page parity | **BC-19** — the page is *opened*, not inferred |
| Uncleared rights | **BC-20** |
| On-screen text present but unreadable / too fast | **BC-32** — measured, not eyeballed |
| Uncited or unopenable real reference per scene | **BC-34** — enforced at the storyboard gate |

The measured or filed version wins. The critic verifies the receipt; a failed or missing
receipt on any of these is a HARD FAIL, but the standard belongs to the check and its policy.

## 2. Registry verification

Verify every check in the canonical blocking-check registry has a receipt: **passed / failed /
could not run**, by BC id. Not reproduced here.

Two the critic must confirm rather than assume:

- **BC-19, ad-to-landing-page parity** — *open the page*; do not infer it.
- **BC-25, a human watched it end to end** — the critic cannot supply this. Record whether it
  happened, honestly.

## 3. Axis scoring (1–10, each with a stated reason)

**Strategy layer:** strategy · hook · clarity · customer relevance · creative idea
**Story layer:** story · sequence coherence · scene-to-scene logic · emotion · memorability
**Craft layer:** human realism · physics · product fidelity · continuity · camera · lighting ·
editing · audio · voice · lip sync
**Commercial layer:** brand fit · CTA · platform fit

### AI-artifact risk (1–10, separate) — the master-level authority

Judged on the assembled master at delivery size and speed, **including the cumulative weight of
non-focal/background tells** forwarded by `servicepow-human-performance-realism` (which owns
focal-area reject-on-sight at the shot level, before assembly). A master can fail here on
accumulation even when every shot passed individually.

| Score | Means |
|---|---|
| 1–3 | No distracting synthetic tells at delivery size and speed |
| 4–6 | Tells visible on a second watch — acceptable only with a stated reason |
| 7–8 | Reads synthetic on first watch — **revise** |
| 9–10 | Obviously synthetic — **not client ready** |

## 4. ServicePow-6 — the only client-ready score (single home; registry gate BC-22)

doesn't-look-AI · hook inside 2s · human presence · format fit · audio design ·
message + CTA clarity

**Floor 8.0 AND no axis ≤ 6.** Both, or not client ready. Report as `midpoint ± 1.5` and gate
on the midpoint — never as a decimal truth, never with a calibration offset applied.

## 5. The 9-axis rough card — work-in-progress only

hook · visual realism · brand accuracy · camera · continuity · audio · offer clarity · CTA ·
scroll-stop

Built to fix an edit fast. **It may never clear a deliverable for a client** — only the
ServicePow-6 does that.

## 6. Verdict

| Verdict | Condition |
|---|---|
| **HARD FAIL** | Any semantic hard failure (§1), or any blocking check failed or missing its receipt |
| **REVISE** | No hard failure, but ServicePow-6 midpoint below floor or any axis ≤ 6 |
| **CLIENT READY** | No hard failure, every blocking check verified run and passed, ServicePow-6 midpoint ≥ 8.0, no axis ≤ 6 — satisfies BC-22; the Campaign Director combines it with the Skeptic's BC-23 verdict for the readiness call |
| **CANNOT ASSESS** | Creative or Bible unavailable, or a gate could not be run — never a pass |

For a **pack**: the lead variant is scored in full; each sibling on hook, flow and CTA only.
A sibling failing any of those three does not ship, whatever the lead scored.

## 7. The Direct-Response lens (ADVISORY — never a floor, never an axis, never a verdict input)

Run AFTER the verdict, never instead of it. It answers *would the phone ring more?* — so
production QA ("is it correct?") always travels with performance-marketing QA ("will someone
care?"). Its output is a note in the QC-verdict Bible section, clearly labeled ADVISORY. It
cannot block, cannot clear, and adds no axis to the client-ready score.

| Read | Question |
|---|---|
| **Time-to-value-proposition** | At what second does a cold viewer first see the thing they are actually buying (the problem being solved)? Is anything cleverer than the sale sitting in front of it? |
| **CTA directness** | Does the close ASK — a verb, the brand, the action — or does it educate one more time? |
| **Persuasion vs. cleverness** | Name the ad's cleverest element. If it were removed and the freed seconds given to problem/solution/CTA, would a stranger be more or less likely to act? |
| **Challenger exists** | Does a problem/solution-first challenger cut exist for market testing? If not, the exemption is written down, by name, and surfaced to the APPROVER |

## Report format

```
VERDICT: <one of the four>
FIRST REACTION (stranger watch): <honest, one line>
FIVE QUESTIONS: who / why / what / believe / next
SEMANTIC HARD FAILURES: <list with shot number / timestamp, or "none">
REGISTRY VERIFICATION: <passed / failed / could not run — by BC id>
SERVICEPOW-6: <per-axis> -> <midpoint ± 1.5>
AI ARTIFACT RISK: <n>/10 — <what gives it away>
TOP 3 REASONS NOT TO SHIP: 1. 2. 3.
FIX PER FAILURE: <specific, routed to the owning skill>
HUMAN WATCHED END TO END: <yes/no> (BC-25 — not the critic's to tick)
HUMAN TASTE GATE: <the APPROVER's answer, recorded — or AWAITING>
ADVISORY (Direct-Response lens): <notes>
```
