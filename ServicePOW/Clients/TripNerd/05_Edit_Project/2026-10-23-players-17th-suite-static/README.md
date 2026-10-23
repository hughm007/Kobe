---
title: "TripNerd THE PLAYERS 2027 17th hole suite static (4:5, A/B/C) — build record"
type: report
client: tripnerd
owner: Karl
status: draft
created: 2026-10-23
updated: 2026-10-23
tags: [static-ads, players, tpc-sawgrass, real-photos, ticket]
---

# THE PLAYERS 2027 — "The island green, from the suite." (A/B/C)

**Brief (owner, 2026-10-23):**
- Instagram static, 1080×1350, sRGB, PNG + high-quality JPG.
- Real photo P085 only, plus the original logo. No AI imagery; no added, removed or altered people.
- Copy:
  - headline "The island green, from the suite.";
  - sub "Bring your group to the 17th.";
  - ticket "THE PLAYERS · MARCH 2027" with ✓ 17th Hole Suite, ✓ Food & drink included, ✓ Hotel included;
  - CTA "Talk to a Nerd · Link in bio".
- Banned words: VIP, exclusive, private, owns, handled, best, #1, guaranteed, Book now, DM us. Don't claim TripNerd owns the suite.
- Versions:
  - **A** "Clean premium": ticket lower-right, CTA centred, vignette.
  - **B** "Spotlight the 17th": A plus a thin circle on the island green with a "The 17th" label; ticket lower-left.
  - **C** "Bold band": blue gradient band over the top 22%, larger ticket tilted 2.5°, CTA bottom-left.

**Outputs** in [`../../06_Review_Exports/2026-10-23-players-17th-suite-static/`](../../06_Review_Exports/2026-10-23-players-17th-suite-static/), all with an embedded sRGB profile:

| File | MD5 |
|---|---|
| `TN-PLAYERS-17-suite-A.png` / `.jpg` | `605c5b59f4c8d0431a12f43747893698` / `a4532445fff3af84657966e59f01c8c2` |
| `TN-PLAYERS-17-suite-B.png` / `.jpg` | `8bd094a72bc167d313a906a3ef8ce201` / `c39e35bbee0766d4129aba8210aa374b` |
| `TN-PLAYERS-17-suite-C.png` / `.jpg` | `3367a133adb6475671241a586880bdb5` / `379b8be1949a517dc019975617311b5e` |
| `TN-PLAYERS-17-suite-A-B-C-side-by-side.jpg` | review sheet |
| `grid_3x4_check.jpg` | the 3:4 grid-thumbnail preview (34 px trimmed each side) |

**Build:** [`build.py`](build.py), run as `build.py P085.jpg logo.png FONT_DIR OUT_DIR`.
- **Sources:**
  - P085 (2000×1500, MD5 `6132a7464098cf067a65a7e5d68208fd`);
  - the original logo (MD5 `66c112d84c3175a0800e5644602f94f2`), scaled only;
  - Montserrat Medium, SemiBold, Bold and ExtraBold (Google Fonts).
- **Crop:** source x 560–1760, full height, scaled ×0.9.
- **Grade:** global only.
  - Brightness ×1.05, slightly warm.
  - Saturation +3%, with an extra +16% on greens and +12% on water hues.
  - A/B: a soft vignette and a top scrim so the white type reads on the light roof.
- **Ticket:** same family as the Phoenix Reel ticket.
  - Logo header strip and cream body.
  - Dashed perforation, notches and a scalloped edge.
  - A stamp with the full logo inside.

## Checks (2026-10-23)

| Check | A | B | C |
|---|---|---|---|
| (a) Green and lake in frame | Island green whole | Island green whole | Island green whole |
| (b) Logo original, undistorted, uncropped | Pass | Pass | Pass |
| (c) Ticket fully visible: wordmark and 3 lines | Pass | Pass | Pass |
| (d) Text clear of the island green, faces, crowd band and other text | Pass | Pass | Pass, after the fix |
| (e) Spelling exact; banned words | Pass, none | Pass, none | Pass, none |
| (f) 3:4 grid thumbnail | Pass | Pass | Pass |
| Nothing in the outer 60 px | Pass | Pass | Pass |

Notes on the checks:
- **(a) Limit:** the lake and the hill crowd continue past the right edge of the photo itself, so no crop can show them fully. The photo is 4:3, so a 4:5 window is only 1200 px wide.
- **(b)** Logo file MD5 verified; the logo is only scaled proportionally.
- **(d) How it was checked:** an automated box test against the protected band (y 480–915), plus a visual check.
- **(d) The fix:** C's first render put the tilted ticket's top edge near the seated guest's head. It was moved down to y 924 and narrowed to 510 px.
- **(d) B's circle:** it sits on the island green as intended; its label sits over the trees.
- **(e)** Copy constants scanned automatically.
- **(f)** The headline, ticket and CTA all survive the trim.
- **Crop trade-off:** the far-left guest in the visor falls outside a window that keeps the green centre-right. The seated suite guests at the rail are kept.

**Status:** owner review. Not approved; nothing posted.
- **Consent:** guests' faces are visible. They are covered by TripNerd's standing consent ("Always assume that").
- **Third-party marks:** "THE PLAYERS" is the event name, used as a date and place line. No PGA TOUR or tournament logo is used.
