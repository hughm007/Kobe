# Test 2 — mechanical / trade reference grounding. RESULT: FAIL (for an unexpected reason)
2026-09-02 · seedance_2_0 · 1080p · 4s · 16:9 · audio off · prompt byte-identical across D/E/F
Single variable: `--image-references refs/wrench-ref-B.jpg` (plumber, red pipe wrench, chrome P-trap)

## Scores (mechanical gate)
| Criterion | D no-ref | E ref | F ref |
|---|---|---|---|
| Correct trade | 9 | 10 | 10 |
| Correct tool | 9 | 10 | 10 |
| Correct tool orientation | 5 | 9 | 9 |
| Correct contact with fitting | **4** | 9 | 9 |
| Plausible hand placement | 7 | 9 | 9 |
| Plausible force direction | 5 | 9 | 9 |
| Plausible plumbing configuration | 6 | 9 | 9 |
| Realistic body position | 7 | 9 | 9 |
| No impossible geometry | **5** | 9 | 9 |
| No wrong-trade objects | 10 | 10 | 10 |
| General realism | 8 | 9 | 9 |
| Obvious AI artifacts | 5 | 8 | 8 |
| **CLIENT CONFIDENCE** | **5** | **3** | **3** |

**All three FAIL. The reference runs fail despite near-perfect mechanics.**

## Why E and F fail
**They reproduced the reference image rather than extracting its physics.** Both outputs
contain the same man, the same grey t-shirt, the same face, the same red wrench, the same
chrome trap and the same tiling as the source photograph. F differs from E only in framing.

The instruction was *extract physical correctness, do not copy styling*. The model does not
do that. Given a full-scene reference it behaves as an image-to-video engine.

Consequences that make the output unusable regardless of mechanical quality:
- reproduces an **identifiable person** who has not consented and is not the client's crew
- reproduces a third-party photograph — a rights exposure, and Service Pow is an interested
  party on this account so compliance binds harder, not softer
- it is not "made for your business" in any sense; it is someone else's photo, animated
- it does not generalise — it cannot be pointed at the client's own sink, crew or van

Mechanically excellent. Commercially unusable. **Beautiful-but-wrong was the expected failure;
correct-but-uncopyable is the actual one.**

## Why D fails
No copying, original scene, correct trade, correct tool, believable P-trap and supply stops —
the wrong-trade failure from Run 9 is **completely gone**. But the mechanics are wrong:
at f12 the jaws grip **air** to the right of the trap with an apparent duplicate handle
bottom-right; at f60 contact lands on the curved trap body rather than a nut, and the pipe run
appears duplicated. A plumber would see it immediately.

## Effect decomposition
- **PROMPT EFFECT — large, positive, free.** Naming the mechanics explicitly ("jaws closed
  horizontally around the chrome P-trap nut and turning it") eliminated the wrong-trade
  substitution outright. Run 9 gave a woodworking bench; D gave a correct bathroom plumbing
  scene. This is the cheapest lever available and it is doing real work.
- **REFERENCE EFFECT — fixes mechanics, but by duplication, not by learning.** The gain is
  real and useless.
- **MODEL / RANDOM EFFECT — low variance.** E and F copied consistently. This is not noise;
  it is how the mechanism behaves. D's duplicated handle and pipe run are model weakness on
  hands-plus-tools.
- **RELIABILITY — 2 of 2 reference runs duplicated.** Reliably unusable is still reliable, and
  that consistency is itself the finding.

## The refined pattern (PROVISIONAL — 2 tests, not a rule)
| Test | Reference content | Model behaviour |
|---|---|---|
| 1 phone | **isolated object** on a plain surface | **generalised** — new kitchen, new counter, new framing |
| 2 wrench | **full scene with a person** | **duplicated** — same person, same room, same everything |

Hypothesis worth testing: **reference composition determines whether the model generalises or
copies.** Isolated-subject references may transfer properties; full-scene references may be
reproduced wholesale. Two observations. Not a routing rule.

## Cost and time
D 152s · E 238s · F 204s · **108 credits · ~9.9 min**

## Structured observations
```
seedance_2_0 | HIGH-TRADE | ref=none        | promptv1 | 36cr | 152s | REJECT | MECHANICALLY_IMPOSSIBLE,BAD_ANATOMY | phys 5 | adv 5 | conf 5
seedance_2_0 | HIGH-TRADE | ref=scene+person| promptv1 | 36cr | 238s | REJECT | OFF_BRAND,RIGHTS_DUPLICATION        | phys 9 | adv 3 | conf 3
seedance_2_0 | HIGH-TRADE | ref=scene+person| promptv1 | 36cr | 204s | REJECT | OFF_BRAND,RIGHTS_DUPLICATION        | phys 9 | adv 3 | conf 3
```
