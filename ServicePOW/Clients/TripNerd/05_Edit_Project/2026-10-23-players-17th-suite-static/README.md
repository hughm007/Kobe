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
| `TN-PLAYERS-17-suite-A.png` / `.jpg` | `8c3d6e41659eb53b0151640d6c548c8f` / `8cdabff5fa29e2592d6a03c8aede170a` |
| `TN-PLAYERS-17-suite-B.png` / `.jpg` | `1047ad493e01a42e76dcfb5383b3573e` / `6f1edc6b9f50f0975e772d2130bbdae2` |
| `TN-PLAYERS-17-suite-C.png` / `.jpg` | `539ec74d8e2ab2bc426352673107bafc` / `a61eaf610d034b00020d36347f217905` |
| `TN-PLAYERS-17-suite-A-B-C-side-by-side.jpg` | review sheet |
| `grid_3x4_check.jpg` | the 3:4 grid-thumbnail preview (34 px trimmed each side) |

**Vape removal (owner request, 2026-10-23):** two disposable vapes on the counter were removed. One stood on the phone; the other lay on the napkin.
- **Why it matters for the ad:** Meta restricts ads that show vaping products, so this also clears a policy risk.
- **Method:** [`vape_fix.py`](vape_fix.py), run as `vape_fix.py P085.jpg P085_novape.png`. No generative tools:
  - **Mask:** the convex hull of each vape's teal pixels, dilated.
  - **Standing vape:** filled with OpenCV Telea inpaint from the phone and counter separately, split along the phone's top edge, which was measured either side of the vape.
  - **Lying vape:** Telea inpaint, with the arm's skin kept out of the fill sources.
  - **Grain:** matched to the surrounding surface.
- **Result:** 9,363 source pixels changed. The clean source `P085_novape.png` has MD5 `26e75371fa509c35fd1bc20560d56366`.
- **Scope:** in the adverts only the box x 0–78, y 804–1005 changed. Every layout box is identical to the first render.

**Build:** [`build.py`](build.py), run as `build.py P085_novape.png logo.png FONT_DIR OUT_DIR`.
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

## Final client-ready pass (owner, 2026-10-23)
**Built:** [`final.py`](final.py), run as `final.py P085_novape.png logo.png FONT_DIR OUT_DIR`.
- It is **version A plus three changes**. It imports `build.py`, so the grade, headline, subline, ticket design and text, CTA, fonts and logo come from the same code.
- **Outputs:**

  | File | MD5 |
  |---|---|
  | `TN-PLAYERS-17-suite-FINAL.png` | `3c681dee60283fffc53de7f5ef2084d6` |
  | `TN-PLAYERS-17-suite-FINAL.jpg` | `369d77ed5c1a76896093c5143d9aaf2f` |

### The three changes
1. **Ticket:** scaled to 80% (452×262 → 362×210, proportional) and moved to the bottom-right, at (658, 996)–(1019, 1205).
   - It sits inside the 60 px margins and stays above the CTA line, because the centred CTA pill (y 1222–1274) is unchanged.
   - Its top edge is below the heads of the guests at the rail.
2. **Island green highlight:** a soft white glow, drawn only on lake pixels within about 18 px of a traced outline of the island and bulkhead.
   - Measured: 0 px of glow and 0 px of overlay on the island.
   - Label "The 17th": Montserrat Bold 34 with a soft shadow, over the trees.
   - A thin pointer runs from the label to the water just right of the island's tip.
3. **Bottom edge:** cropped higher. The source window is x 584–1736, y 0–1440 (was 560–1760, 0–1500).
   - The guest's hand and arm (source y ≥ 1455) and the chair stub beside it fall outside the frame.
   - No retouching.

### Checks
| Check | Result |
|---|---|
| (a) Ticket fully visible | Pass: logo, "TripNerd" wordmark, strip, stamp, 3 lines |
| (a) Ticket covers no faces | Pass |
| (b) Glow subtle, label readable on a phone | Pass, checked at a 390 px-wide phone preview |
| (c) Bottom edge | Pass: no hand, no cut stub |
| (d) Island green, lake and crowd in frame | Island green whole; lake and crowd as before (see the earlier crop limit) |
| (e) Logo | Pass: original file, scaled proportionally only |
| (f) 3:4 grid thumbnail | Pass |

Notes on (c): the left edge still cuts a cup on the counter and the seated guests at the rail, as in every earlier version. These were left as they are: the brief limited changes to the bottom edge and said no other people or objects get changed.
