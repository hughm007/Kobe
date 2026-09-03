# Test 1 — device reference grounding. RESULT.
Date 2026-09-02 · model seedance_2_0 · 1080p · 4s · 16:9 · std · generate_audio false
Single variable: presence of `--image-references refs/phone-incoming-call-REAL.jpeg`
Prompt byte-identical across all three. No seed parameter exists on this model.

## Scores (10-point device gate)
| # | Criterion | A' no-ref | B ref | C ref |
|---|---|---|---|---|
| 1 | Device geometry | 6 | 8 | **9** |
| 2 | Screen / bezel realism | 6 | 8 | **9** |
| 3 | Incoming-call UI plausibility | 5 | 7 | **9** |
| 4 | Perspective | 7 | 8 | **9** |
| 5 | Reflections / materials | 6 | **9** | 8 |
| 6 | Contact with surface | 7 | **9** | **9** |
| 7 | Object consistency through motion | 7 | 8 | **9** |
| 8 | General photorealism | 7 | **9** | **9** |
| 9 | Reference adherence | n/a | 7 | **9** |
| 10 | **CLIENT CONFIDENCE** | **5** | **7.5** | **8.5** |

PASS CONDITION (>=8 client confidence, no material device defect): **C PASSES. B narrowly fails. A' fails.**

## Explicit defect inspection
| Defect check | A' | B | C |
|---|---|---|---|
| Camera lenses | plausible | plausible | plausible |
| Buttons / ports | soft | speaker grille + port correct | port correct |
| Phone thickness | too thin, elongated | correct | correct |
| Screen edges | ok | ok | ok |
| **Impossible / garbled text** | **YES — illegible** | **YES — button labels garbled** | **minor — caller name "Sarah Miller" legible; status-bar time illegible** |
| Malformed icons | call buttons mid-screen, wrong position | no | no |
| Duplicated UI elements | no | no | no |
| Warped corners | slight | no | no |
| Geometry change over time | minor | no | **no — stable f6 to f90** |
| Answer/decline convention | scrambled | **inverted vs reference** (green left) | **correct** (red left / green right) |

## What improved, and by what
- **Run 9 -> A' is a PROMPT effect, not a reference effect.** The Run 9 phone was a featureless
  blue glow; A' has a real call UI. The only change was describing the UI in the prompt.
  Naming what must appear on a screen is itself a large lever.
- **A' -> B/C is the REFERENCE effect.** Environment became a genuine residential kitchen,
  device proportions corrected, materials and surface contact became convincing, and the call
  UI moved to a plausible layout.
- Both levers are real. The reference is not solely responsible for the total gain, and
  reporting it as such would overstate the hypothesis.

## What did NOT improve
- **On-screen text remains the weak point in all three.** B's button labels are garbled;
  C's status-bar time is illegible. Text/UI is a distinct high-risk class and reference
  grounding only partially addressed it.
- Reference adherence is imperfect: B inverted the answer/decline convention present in the
  reference. The model treats the reference as a style and layout prior, not a spec.

## Reliability
**1 of 2 reference runs cleared the gate** (C 8.5, B 7.5). With no seed parameter available,
run-to-run variance is real and unpinnable. A single passing generation is not evidence of a
reliable path — it is evidence that the path *can* pass.

## Cost and time
| Run | Credits | Time |
|---|---|---|
| A' no-ref | 36 | 183s |
| B ref | 36 | 194s |
| C ref | 36 | 154s |
| **Total** | **108** | **~8.9 min** |

## Structured observations (schema per playbooks/ads/references/generation-observations.md)
```
seedance_2_0 | HIGH-DEVICE | ref=none  | promptv2 | 36cr | 183s | REJECT | BAD_DEVICE,BAD_TEXT | realism 7 | phys 6 | adv 5 | conf 5.0
seedance_2_0 | HIGH-DEVICE | ref=photo | promptv2 | 36cr | 194s | REJECT | BAD_TEXT           | realism 9 | phys 8 | adv 7 | conf 7.5
seedance_2_0 | HIGH-DEVICE | ref=photo | promptv2 | 36cr | 154s | ACCEPT | -                  | realism 9 | phys 9 | adv 8 | conf 8.5
```

## VERDICT
**DID REFERENCE GROUNDING MATERIALLY SOLVE THE DEVICE FAILURE? — PARTIAL.**

It materially improved device realism under this tested configuration: +2.5 and +3.5 client
confidence over a controlled same-prompt control, and one run cleared the >=8 bar with no
material device defect. That is a real, measured effect, not a hoped-for one.

It is PARTIAL and not YES because: only 1 of 2 reference runs passed; on-screen text failed
in every run including the passing one; the model treats the reference as a prior rather than
a spec (B inverted the button convention); and no seed control exists to make any of it
repeatable on demand.

**Scope limit, stated explicitly:** this says *"reference grounding improved DEVICE realism
under this tested configuration."* It says **nothing** about mechanical or trade correctness,
hands, or text/UI — those are separate high-risk classes and remain untested.
