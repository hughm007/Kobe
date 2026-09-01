# Continuity checklist

Run against every newly generated shot, against the continuity annex in the Campaign Bible
(at the location assigned per
`../../servicepow-campaign-director/references/bible-contract.md`).
Judge at **delivery size and speed**. Record drift precisely, not impressionistically.

## Zero tolerance (any drift = FIX or REGENERATE)

- **Face** — bone structure, age read, distinguishing features, skin tone
- **Product** — geometry, packaging, proportions, colour, materials, orientation
- **Legible text** — any readable word on screen, including signage and vehicle wraps
- **Brand marks** — DEFER to `../../servicepow-brand-fidelity/SKILL.md`, the single owner of
  mark correctness under `../../_servicepow/policies/brand-assets.md` (BC-21). Here: flag any
  suspected mark drift to brand-fidelity; do not rule on it.

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

Geometry · packaging · scale relative to hands and environment · colour under this shot's
light · materials and finish · which way it faces. Mark placement looking wrong → flag to
brand-fidelity (see Zero tolerance).

## Locations

Architecture · room layout · prop positions · furniture · weather · time of day · light
through windows consistent with stated time.

## Lighting

Direction (key from the same side) · quality (hard/soft) · colour temperature · practical
sources visible in frame and consistent between shots.

## Camera

| Field | Check |
|---|---|
| Lens family | a long-lens sequence does not suddenly go wide-angle |
| Height | consistent with the bible's stated camera height |
| Movement philosophy | matches the bible (locked / handheld / drifting) |
| 180-degree line | DEFER — verify per the editor's grammar, `../../servicepow-cinematography-editor/SKILL.md` (single owner) |
| Screen direction | DEFER — verify per the editor's grammar, `../../servicepow-cinematography-editor/SKILL.md` (single owner) |

## Colour

Palette · white balance · grade. A shot that grades differently reads as a different day.

## Audio

| Field | Check |
|---|---|
| Ambience vs beat | ambience and music state consistent with the beat map's expectations recorded in the bible |
| Room tone | DEFER — enforced by `../../servicepow-audio-director/SKILL.md` (single owner); pass it the space description per shot |
| Continuous bed | DEFER — bed continuity across cuts is enforced by `../../servicepow-audio-director/SKILL.md` |

## Temporal state tracking

Keep a running state table for the sequence. At each shot, what should be true?

| Element | After shot N | Notes |
|---|---|---|
| Floor | wet | stays wet until the fix beat |
| Sleeves | rolled | rolled from shot 3 onward |
| Tool | on the floor, right of frame | set down in shot 5 |

**Objects do not reset. People do not teleport. Clothes do not randomly change. Products do
not mutate.**

## Verdicts

- **ACCEPT** — invisible at delivery size and speed. Record it anyway.
- **FIX** — correctable with an edit op (cheaper than regeneration; try this first).
- **REGENERATE** — with tightened references, not just a reworded prompt. Regeneration is
  spend: `../../_servicepow/policies/generation-and-spend.md` applies.
- **RAISE CONFLICT** — the requirement exceeds what the models can hold; the shot needs a
  different production method.
