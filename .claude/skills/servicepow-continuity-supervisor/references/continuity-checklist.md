# Continuity checklist

Run against every newly generated shot, against the bibles in the Campaign Bible section 8.
Judge at **delivery size and speed**. Record drift precisely, not impressionistically.

## Zero tolerance (any drift = FIX or REGENERATE)

- **Face** — bone structure, age read, distinguishing features, skin tone
- **Product** — geometry, packaging, proportions, colour, materials, orientation
- **Legible text** — any readable word on screen, including signage and vehicle wraps
- **Brand marks** — see `servicepow-brand-fidelity`; these should be composited, not generated

## Characters

| Field | Check |
|---|---|
| Hair | length, style, parting, wet/dry |
| Clothing | every garment, colour, fit, **sleeves rolled or not**, tucked or not |
| Accessories | watch, glasses, gloves, badge, lanyard — present on the correct wrist/side |
| Body | build, height relative to props and doorways |
| Emotional progression | matches the beat map — a character cannot be relieved before the fix |
| Dirt / wear / sweat | accumulates forward in time, never resets |

## Products

Geometry · packaging · scale relative to hands and environment · colour under this shot's light ·
materials and finish · logo placement and orientation · which way it faces.

## Locations

Architecture · room layout · prop positions · furniture · weather · time of day · light through
windows consistent with stated time.

## Lighting

Direction (key from the same side) · quality (hard/soft) · colour temperature · practical sources
visible in frame and consistent between shots.

## Camera

Lens family (a long-lens ad does not suddenly go wide-angle) · height · movement philosophy ·
**180-degree line** maintained · screen direction consistent.

## Colour

Palette · white balance · grade. A shot that grades differently reads as a different day.

## Audio

Room tone matches the space · ambience continuous across the cut · music state consistent with
the beat · one continuous audio bed (LB26).

## Temporal state tracking

Keep a running state table for the sequence. At each shot, what should be true?

| Element | After shot N | Notes |
|---|---|---|
| Floor | wet | stays wet until the fix beat |
| Sleeves | rolled | rolled from shot 3 onward |
| Tool | on the floor, right of frame | set down in shot 5 |

**Objects do not reset. People do not teleport. Clothes do not randomly change. Products do not
mutate.**

## Verdicts

- **ACCEPT** — invisible at delivery size and speed. Record it anyway.
- **FIX** — correctable with an edit op (cheaper than regeneration; try this first).
- **REGENERATE** — with tightened references, not just a reworded prompt.
- **RAISE CONFLICT** — the requirement exceeds what the models can hold; the shot needs a
  different production method.
