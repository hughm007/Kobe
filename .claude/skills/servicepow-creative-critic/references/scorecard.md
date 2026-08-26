# Critic scorecard

## Order of operations (do not reorder)

1. Stranger watch — one pass, delivery size and speed, sound on
2. The five viewer questions
3. Hard-failure sweep
4. Machine + compliance checks
5. Axis scoring
6. ServicePow-6 ruling

**Taste never overrides a technical or legal failure.** Machine and compliance run first for that
reason.

---

## 1. Hard failures — any hit = NOT CLIENT READY

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
| 13 | **Text present but unreadable** | On screen too briefly to read at delivery speed — same defect as absent, plus wasted frames *(added from the v8 pilot)* |
| 14 | **Uncited or unopenable reference** | A shot claiming a real reference that cannot be opened now — LB30/LB51 *(added from the v8 pilot)* |

**Do not average these away.** A 9.2 mean with a wrong logo is not a 9.2 — it is a reshoot.

## 2. Compliance sweep (hard failures too)

- Every claim substantiated in writing, or absent
- No synthetic person presented as a customer, reviewer or endorser
- Platform AI disclosure set where required
- Ad-to-landing-page parity — **open the page and confirm**
- Rights cleared for music, footage, likeness
- Required licence/legal copy present, legible, inside the safe area
- Nothing advertised outside the client's licensed scope
- **Reference citation audit** — every shot claiming a real reference names one that can be
  opened **now**. Missing or unopenable = hard failure #14, surfaced to Karl by name, never
  accepted silently (LB30/LB51). Verification honesty (LB29): a check not actually run is
  recorded as not run, never as passed.

## 3. Machine checks (from the production playbook)

Resolution/fps/format · true loudness (LUFS) · no frozen or black sections · motion floor per
clip **and** per master shot · no flash cuts · aspect + duration declared and matched · no
letterbox · no opening dead-space · expected strings (phone, URL, client name) verified on screen ·
burned text inside the 15–70% safe area · looped/layered audio proven speech-free · master speech
matches declared lines.

**On-screen text dwell time** — every string the viewer is expected to read (price, phone, URL,
licence number, CTA) must be on screen long enough to read at delivery speed. Rule of thumb:
a short string ≥1s, a phone or licence number ≥2s. **Presence is not legibility** — text that
flashes is hard failure #13. *(This is the check the v8 "2:07 AM" price line escaped.)*

**A gate that could not run is a BLOCK, not a note.**

## 4. Axis scoring (1–10, each with a stated reason)

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

## 5. ServicePow-6 — the only client-ready score

doesn't-look-AI · hook inside 2s · human presence · format fit · audio design ·
message + CTA clarity.

**Floor 8.0 overall AND no axis ≤ 6.** Both, or not client ready.

## 6. Verdict

| Verdict | Condition |
|---|---|
| **HARD FAIL** | Any hard failure or compliance failure |
| **REVISE** | No hard failure, but ServicePow-6 below floor or an axis ≤6 |
| **CLIENT READY** | No hard failure, ServicePow-6 ≥8.0, no axis ≤6, all gates actually run |
| **CANNOT ASSESS** | Creative or Bible unavailable, or a gate could not be run — never a pass |

## Report format

```
VERDICT: <one of the four>
FIRST REACTION (stranger watch): <honest, one line>
FIVE QUESTIONS: who ☐ why ☐ what ☐ believe ☐ next ☐
HARD FAILURES: <list with shot number / timestamp, or "none">
SERVICEPOW-6: <per-axis> → <mean>
AI ARTIFACT RISK: <n>/10 — <what gives it away>
TOP 3 REASONS NOT TO SHIP: 1. 2. 3.
FIX PER FAILURE: <specific, routed to the owning skill>
HUMAN WATCHED END TO END: ☐ (LB29 — not the critic's to tick)
```
