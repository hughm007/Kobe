# Placements and export standards — the matrix statics are measured against
Single home of placement specs. BC-51 checks exports against THIS table; update it from
platform documentation with a dated source when specs change — never from memory.

## Placement matrix (Meta family, 2026-09 baseline)
| Key | Use | Pixels | Aspect | Safe zone (essential content) |
|---|---|---|---|---|
| `feed-square` | FB/IG feed | 1080x1080 | 1:1 | 5% margin all sides |
| `feed-portrait` | FB/IG feed (preferred) | 1080x1350 | 4:5 | 5% margin all sides |
| `story` | IG/FB Stories, Reels | 1080x1920 | 9:16 | **top 15% and bottom 20% clear** of essential text/logo/CTA (platform UI overlays), 6% side margins |
| `link` | FB link/right-column | 1200x628 | 1.91:1 | 5% margin all sides |

## Export standards
Format: PNG (graphics/text-heavy) or JPG q90+ (photographic) · sRGB · no alpha in final
exports · per-file budget under the platform cap with headroom (target < 8MB) · exact pixel
dimensions, never "close" (BC-51 is exact-match) · one file per placement per variant.

## Text-in-image discipline
Keep image text concise — headline + support + CTA, not paragraphs; the ad copy field
carries the rest. All text typographic per BC-42 (never model-rendered). Legibility floor
lives in the layout law and is measured at export size.

## Naming
`<client>-<campaign>-<concept>-<hook>-<placement>-v<n>.<ext>`
e.g. `911drain-clogfacts-C1-H2-story-v1.png` — the name IS the variant-matrix coordinate.

## Variant matrix rule
The order is enumerated as concepts x hooks x placements BEFORE production. Shared layers
(background family, logo block, CTA block) build once; the varying layer is declared per
variant. BC-54 scores pairwise distinctiveness across the delivered set.
