---
title: "For a physical macro beat, test three reference-driven models at 720p before the 1080p final; the cheapest one won"
type: learning
client: tripnerd
owner: Karl
status: active
created: 2026-09-23
updated: 2026-09-23
tags: [video, higgsfield, seedance, gemini, wan, realism, cost-ladder, prompt-craft]
---

# Reference-driven macro beat: Gemini beat Seedance and Wan, and a number in the prompt became a drawing

**Context.** The owner rejected the v3b ball-drop as fake (ball and hole). The fix was
real references (Commons photos of a cup with its white liner, a ball beside a cup, the
17th island green) and a three-model test at 720p, same prompt, before any 1080p spend.

**Observation (one instance, 2026-09-23, TripNerd 17th-hole v4).**

| Model | Cost 720p 5 s | Result |
|---|---|---|
| Seedance 2.5 omni_reference | ≈20 credits | Ignored the cup references: dark, oversized hole, the same failure the owner rejected. Background (grandstand, palms) was the best of the three. |
| Gemini Omni Flash 1.1 reference-to-video | 15 credits | Cup with white liner and clean edge, believable roll and lip catch, soft blurred bulkhead/water/grandstand behind. Winner. |
| Wan 3.0 | 8.75 credits | Realistic cup and ball but a flat top-down frame with no setting; the ball stayed visible bouncing in the cup. |

**Second observation, same session.** The Gemini prompt said the cup is "108 mm across".
At 720p nothing happened. Both 1080p finals drew a "108 mm" dimension label with arrows on
the cup for the first 1.0–1.5 s, then it faded. The fix in the cut was to start the shot
after the label disappears; the fix in the prompt is to describe size by comparison ("the
ball is a bit under half the width of the cup") and never write a measurement with a unit
into a prompt for this model. Also "no printed marks" did not remove a faint alignment line
on the ball in either 1080p take.

**Falsifiable claims.**
1. For a close-up physical beat with real photo references, Gemini Omni Flash 1.1 adheres
   to the reference object better than Seedance 2.5 omni_reference. One test; needs a
   second beat (a different object) to promote.
2. Measurements with units in a Gemini 1.1 prompt are at risk of being rendered as
   annotations at 1080p. Two of two 1080p takes, zero of one 720p take.

**What changes next time.** Run the 720p three-model test by default for any macro/physics
beat (under 45 credits total), write sizes as comparisons, and budget one extra second at
the head of each take for artefacts to clear.
