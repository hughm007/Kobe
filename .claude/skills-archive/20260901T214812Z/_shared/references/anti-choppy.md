# The anti-choppy law

**The quality unit is the complete advertisement. Not the clip.**

Do not optimize individual clips independently at the expense of the finished ad. This is the
single most common way AI-produced advertising fails: every shot is defensible alone, and the
sequence is incoherent.

## The eight questions — asked of every shot

1. Why does this shot exist?
2. What came before it?
3. What does it add that the previous shot did not?
4. Why does the next shot follow *this* one?
5. Does it match the same world?
6. Does it support the same message?
7. Does it maintain character / product / location continuity?
8. Does audio connect it to its neighbours?

A shot that cannot answer 1, 3 or 4 is filler. **Cut it or redesign it.**

## The shuffle test — the one-line version of all eight

> **If any two beats could swap places and nobody would notice, the flow is broken.**

Run it on the beat map, on the script and on the assembled cut. It is faster than the eight
questions and it fails in exactly the same place, which is why it survives as the field test.
When it fails, **rewrite the connection** — do not reorder and hope.

## Smooth Advert Flow — the law at every stage

Every advert plays as **one connected story**: hook → main message → visual scenes → CTA, with a
clear beginning, middle and end. Never choppy, disconnected, rushed, confusing, random, robotic,
or like separate clips placed next to each other. Each stage has its own version of the law:

| Stage | What it means there |
|---|---|
| **Script** | The hook leads directly into the main message; every beat sets up the next; the CTA lands as the *obvious next step* of the story |
| **Generation** | Each scene visually leads into the next — shared subject, direction, location, or cause→effect. **Flow cannot be edited into scenes that do not connect** |
| **Edit** | Every join must answer the shot before it. Fix order: reorder/trim → B-roll bridge → regen |
| **QC** | The cold viewer explicitly checks flow — any stitched-together joint or bolted-on CTA gets flagged |

**Pacing is the suspense engine — and it is cutting rhythm, never slow motion.** The proven
pattern: a near-still opening held slightly too long → accelerating cut lengths (2.0s → 1.4s →
1.0s → 0.8s) → a rhythm break into one long held beat for the payoff. **The break in rhythm is
what makes the payoff read as significant.**

## The failure shape to design against

> COOL AI CLIP → DIFFERENT COOL AI CLIP → DIFFERENT COOL AI CLIP → PRODUCT → CTA

That is not an advertisement. It is a reel of generations with a logo at the end. The finished
piece must feel **intentionally conceived, directed, filmed, edited and mixed** — as if one
person with one idea made every choice.

## The trade rule

If a shot is individually excellent but damages sequence coherence: **remove or redesign it.**
Individual excellence never outranks the sequence. Two related failures to name out loud:

- *Sunk credits.* Money already spent generating a shot is not a reason to keep it. Roughly a
  third of generated material ships; that is the expected rate, not a problem to fix by
  lowering the bar.
- *Beauty as justification.* "It looks amazing" is not an answer to question 3.

## The in-world reason test (LB31)

Every on-screen action needs a reason **inside the scene**. "To show the viewer the product" is
not a reason inside the scene — it is a reason outside it. If a character does something only
because the ad needs it shown, the audience feels the strings.

## Where this is enforced

- `servicepow-creative-spine` — builds the beat map that makes coherence possible upfront
- `servicepow-storyboard-director` — every shot declares purpose, before, adds, next
- `servicepow-cinematography-editor` — every cut declares its reason
- `servicepow-creative-critic` — "random disconnected scene" is a **hard failure**, not a score
