---
title: "Typography systems study — three candidates, identical layout, owner decision pending"
type: research
client: internal
owner: APPROVER
status: awaiting-owner-visual-decision
created: 2026-09-04
updated: 2026-09-04
tags: [brand, typography, identity, the-frame, study, test-disposable]
---
# Typography systems — controlled comparison (2026-09-04)

**Decision status: NONE. No typeface is approved.** `visual-identity.md` is unchanged and its
Typography section is still `NEEDS INPUT`. This folder holds the evidence for the owner's
visual decision, nothing more.

## Why this ran locally and not in Canva
The owner authorised a disposable Canva typography test; the Canva connector cannot execute it
(no blank-design creation, no font-family parameter in any edit operation, weight limited to
`normal|bold` — see `operations/connector-register.md`). The study moved to the controlled local
path: a **test-scoped renderer** (`render.py`) that emits the canonical static composer's exact
PNG + manifest contract, gated by the **canonical, unmodified** `servicepow_static_qc.py`.
The canonical composer itself was not changed — it hardcodes one font pair and takes no
per-block family, and extending it is a proven-capability change that goes through the
baseline law, not through a study.

## Controls — identical on every page
1080×1080 (`feed-square`) · 54px safe zone · background `#FAF8F5` · primary `#12161B` ·
secondary `#39414C` · meta `#5F6875` · CTA fill `#17457A` with `#FAF8F5` label · 8px chip
radius (`--sp-radius-sm`/`md`) · no gradients, shadows, images, logo, or blue decoration.
Sizes are the fixture-calibrated set the static QC floors were proven against: eyebrow 28 ·
headline 92 · support 44 · CTA 56 · meta 28. Copy is the owner's test copy, verbatim.
Only the fonts differ between pages.

## The three systems as rendered
| Page | Display | Body | CTA | Mono / meta | Axes set |
|---|---|---|---|---|---|
| 1 Editorial Frame | Fraunces **300** | Work Sans 400 | Work Sans 700 | JetBrains Mono 400 | Fraunces opsz **92**, Softness **0**, Wonky **0** (its file defaults are wght 900 / opsz 9 / Wonky 1 — every axis was set explicitly) |
| 2 Systematic Precision | IBM Plex Serif **300** (static Light) | IBM Plex Sans 400 | IBM Plex Sans 600 | IBM Plex Mono 400 (static) | Plex Sans Width 100 |
| 3 Newsroom Frame | Instrument Serif 400 (only weight that exists) | Source Sans 3 400 | Source Sans 3 700 | Source Code Pro 400 | — |

All requested weights were applied exactly; **no substitutions**. Fonts are OFL 1.1 files
fetched from `github.com/google/fonts` (`ofl/<family>/`) and are **not** committed here
(binary rule, `assets/README.md`); they are reproducible from the table below.

| File | Source path under `ofl/` | sha256 (16) |
|---|---|---|
| Fraunces-VF.ttf | `fraunces/Fraunces[SOFT,WONK,opsz,wght].ttf` | 177ff6c0f14e5550 |
| WorkSans-VF.ttf | `worksans/WorkSans[wght].ttf` | f50f61f2ba738e23 |
| JetBrainsMono-VF.ttf | `jetbrainsmono/JetBrainsMono[wght].ttf` | 48715a42ec242c21 |
| IBMPlexSerif-Light.ttf | `ibmplexserif/IBMPlexSerif-Light.ttf` | 698bad1d5e52004c |
| IBMPlexSans-VF.ttf | `ibmplexsans/IBMPlexSans[wdth,wght].ttf` | 3b031aa421617420 |
| IBMPlexMono-Regular.ttf | `ibmplexmono/IBMPlexMono-Regular.ttf` | 6a3412f058c7d8df |
| InstrumentSerif-Regular.ttf | `instrumentserif/InstrumentSerif-Regular.ttf` | 498efd461f6ddfcb |
| SourceSans3-VF.ttf | `sourcesans3/SourceSans3[wght].ttf` | 042fe2cc0b933e32 |
| SourceCodePro-VF.ttf | `sourcecodepro/SourceCodePro[wght].ttf` | b400fc584e10aff2 |

## Quality checks — canonical `servicepow_static_qc.py`, unmodified
**STATIC-QC: PASS (75 passed, 0 failed, 3 exports).** BC-51 exact 1080×1080 and size budget ·
BC-52 every element inside the safe zone, every size at or above its floor, measured contrast
5.32 / 17.13 / 9.74 / 9.13 / 5.32 (all ≥ 4.5) · BC-53 CTA present · BC-55 required strings
present, barred superlatives/guarantee words (claims-and-proof §1) absent · BC-54 pairwise
diffs 0.052 / 0.067 / 0.063 — just above the 0.05 near-duplicate floor, which is the correct
reading for a same-layout comparison set. Geometry is identical page to page; only glyph
widths differ (headline right edges 792 / 772 / 812).

## Files
`exports/*.png` + `*.manifest.json` (per page) · `comparison-sheet.png` · `render.py` ·
`facts.json`. Names carry `TEST-DISPOSABLE` — nothing here is a deliverable.

## Not done, by instruction
No winner selected · `visual-identity.md` untouched · baseline not advanced · nothing created
in Canva · fonts not uploaded anywhere.
