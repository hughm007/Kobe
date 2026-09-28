---
title: "TripNerd — YOUR PEOPLE — frame-by-frame build log"
type: production-log
client: tripnerd
campaign_id: 2026-09-28-ten-scripts
created: 2026-09-28
updated: 2026-09-28
---

# YOUR PEOPLE — build log

Built one frame at a time with the owner, who approves each frame before the next. Brief:
`your-people-frame-by-frame.md` (v9). Balance at start: 12,824 credits (live, 2026-09-28).

## Live tool facts found during the build
- **FACT (2026-09-28):** Nano Banana 2 rejects the `mask` media role ("Unknown media role: mask") at both
  cost check and generation, although `models_explore` lists it. Masked edits in the brief (F7 end still,
  F8 end still) are done instead as a whole-image edit, then only the masked patch is composited back onto
  the approved still in the Higgsfield sandbox (feathered 4 px), so every pixel outside the mask is unchanged.
- **FACT:** Nano Banana 2, 4k, one image = 3 credits (live cost check).

## F7 master still
| Item | Value |
|---|---|
| Source | Made earlier today in ChatGPT + Higgsfield: `fea8b8f3` → `813e4cb8` → `38971ee2` → `1fc54fea` → `65a347b3` → `5045d452` (GPT Image 2.5 edits, 3840x2160) |
| Checks passed | six in order and colours; columns both ends and top frame; caps forwards, guest 4 bare-headed, hand in pocket; son's hand on dad's far shoulder, five normal fingers; all backs to camera, equally sharp; no lettering on clothes; background unreadable; open-shade light |
| Faults found at zoom | a fragment of a third cup across the woman's forearm; a white napkin-like smudge on the black ledge |
| Fix | two Nano Banana 2 edit takes (`f6950e94` used, `889b5aac` rejected: fleck and smudge remained), 6 credits; patches composited at (918–958, 1112–1180) and (898–976, 1390–1428) |
| Result | **F7 master v2**: PNG media `6551ac57-4ce2-4ff6-86ab-b6e04310578c`, JPEG `a508efb8-e5f3-49bf-9fea-fbb3f46a6390` |
| Open judgment calls | the island green itself is not identifiable (view reads as water, green bank, grandstands); the soft foreground shoulder is only a sliver, so the occlusion beat will not read |
| Status | awaiting owner approval |

Spend so far this build: 6 credits.
