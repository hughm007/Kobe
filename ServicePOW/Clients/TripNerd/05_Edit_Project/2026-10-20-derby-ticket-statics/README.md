---
title: "TripNerd Kentucky Derby ticket-stub statics (4:5) — build record"
type: report
client: tripnerd
owner: Karl
status: draft
created: 2026-10-20
updated: 2026-10-20
tags: [static-ads, derby, louisville, real-photos, ticket]
---

# Derby ticket-stub statics, v1 (2026-10-20)

**Brief (owner):**
- Rebuild his two drafts as a paper ticket stub over a real event photo.
- Use the original logo top-left.
- Add an "Ours:" Polaroid of TripNerd's check-in table, so each ad shows something only a TripNerd guest gets.
- Banned words: handled, VIP, exclusive, owns, private, best, #1, guaranteed, "DM us", "book now", tag a friend.
- Real photos only, light grade, no blur, no face edits.

**Outputs** (1080×1350 PNG) in [`../../06_Review_Exports/2026-10-20-derby-ticket-statics/`](../../06_Review_Exports/2026-10-20-derby-ticket-statics/):

| File | Main photo | MD5 |
|---|---|---|
| `TN-DERBY-01-everyones-filming-it.png` | P050 (the race with phones up), left 4:5 window | `cf2dbc6b9bad52207ce651b0f8cee1bb` |
| `TN-DERBY-02-the-bubblys-cold.png` | P179 (the couple with champagne), top 4:5 window | `810eeb682bdfb5ab74b227d5e49531e3` |

**Build:** [`build.py`](build.py), run with `build.py SRC FONTS OUT`.
- **Sources:** Drive `kentucky-derby/` P050 and P179, and IMG_1901 (TripNerd check-in table, Augusta-week folder).
- **Logo:** the real logo, git copy of 46ae277a (MD5 `66c112d8…`).
- **Fonts:** Courier Prime (ticket), Caveat (the "Ours:" label); both OFL, from Google Fonts.

## How each brief item was met
- **Logo top-left:** the real file, scaled proportionally only. It is not redrawn, recoloured or stretched.
- **Stamp:** the brief asked for a stamp made from the real mascot, and also said never to recolour the logo. To honour both:
  - the mascot is cropped from the logo file and keeps its original colours;
  - only its opacity is distressed (an ink-fade mask);
  - the ring and circular text ("TRIPNERD • FAN EXPERIENCES • LOUISVILLE") are our ink.
- **Ticket:**
  - tilted −4° (Ad 1) and +3.5° (Ad 2), with a soft shadow;
  - torn zigzag top and bottom, a perforation line, and a paper grain with edge wear.
- **Checklist:** "HANDLED" is gone. SEATS, HOTEL and RIDES read "✓ BOOKED"; FOOD + DRINK reads "INCLUDED". The tick is drawn as a vector, because the font has no ✓ glyph.
- **No blur:**
  - **Ad 1:** the TwinSpires/SAP tent sits under the Polaroid; the Longines board and the infield screen are cropped out.
  - **Ad 2:** the Veuve Clicquot label and the woman's Churchill Downs cup box sit under the ticket. Only the foil neck shows; the text on it is unreadable at full size.
- **Faces:** the ticket and the Polaroid cover no guest's face (checked at 1:1). Grading is global only (colour 1.10, contrast 1.06, brightness 1.02).

## Jason must confirm before posting
1. **Date:** Derby day Sat May 1, 2027. It is a Saturday; confirm TripNerd sells the 2027 Derby.
2. **SEATS — BOOKED,** and **"SECTION: TRIPNERD":** does TripNerd have its own section or block, or only seats?
3. **HOTEL — BOOKED:** is a hotel included in every Derby package?
4. **RIDES — BOOKED:** is transport included, and which legs?
5. **FOOD + DRINK — INCLUDED:** all day, or hospitality only?
6. **Consent:**
   - the couple in P179;
   - the three staff at the check-in table (IMG_1901);
   - the IMG_1901 table is from Augusta week, not the Derby. Confirm the same check-in setup is used at the Derby, or supply a Derby check-in photo.

## v1.1 of Ad 1 (2026-10-20): polish of the client-approved version

The owner reports Ad 1 is client approved. His polish brief: keep all copy, the ticket, the stamp and the logo, and refine the Polaroid, the spacing and the finish.

**File:** `TN-DERBY-01-everyones-filming-it-v1.1.png`, MD5 `a36d9af3fa3b4bc8634fcdafbaf3e4f4`.

**Ticket unchanged:** the ticket interior is pixel-identical to v1 (max difference 0, compared after the 20 px lift). The logo is the same file and the same placement.

**What changed:**
- **Polaroid:**
  - 25 % larger; tilt +7°, opposite to the ticket's −4°;
  - stronger soft shadow; grain on the white card border;
  - "Ours:" set larger (Caveat Bold, 40 → 46 px at 1x scale);
  - the photo inside is cropped tight on the TripNerd banner and the flowers, with no faces. No hospitality photo was attached, so this is the brief's fallback.
- **Spacing:**
  - ticket lifted 20 px; its lowest edge is at y 664, and the outer rail is at y ≈ 703;
  - Polaroid lowest edge at y 685; all horses fully visible;
  - Polaroid more than 40 px from the logo.
- **Finish:** photo only, colour 1.10 → 1.13 and contrast 1.06 → 1.08.
- **Disclosed retouch:** two third-party sign graphics sit on the rail line, so the lifted Polaroid could no longer cover them, and blur is banned. They were painted out by hand (no AI), using the plain surface beside each:
  - the "twinspires" lettering on the navy tent fascia, filled with the fascia colour;
  - the SAP banner on the rail wall, replaced with the wall section 60 px to its right, so the rail stays continuous.

  No people or other objects were touched or added. To revert, remove `retouch=` from the v1.1 spec. The signs then show, and the only way to hide them would be to let the Polaroid touch the rail.

## v2 of Ad 1 (2026-10-20): engagement pass on the client-approved v1

**Base:** the approved v1, as the owner attached it, not v1.1. The copy, ticket layout, Polaroid crop and position, and logo file and placement are unchanged.

**File:** `TN-DERBY-01-everyones-filming-it-v2.png`, MD5 `49e69bc8a4a43eba14af57bd5a852c7a`.

**Verified unchanged:**
- The headline-to-checklist region of the ticket is pixel-identical to v1 (max difference 0).
- The logo pixels are identical to v1.
- The build now reproduces v1, v1.1 and Ad 2 byte for byte. A label offset changed in the v1.1 round had broken this; it is fixed.

**What changed:**
- **Crowd:** the lower crowd is darkened and desaturated by 12 % on a smooth ramp from y 760 to 860, above which the horses and rail are untouched. Mean luminance of the bottom third went from 121.4 to 106.3.
- **Polaroid photo:** warmer and brighter (brightness 1.08, a slight red lift, a slight blue cut).
- **Depth:**
  - three-layer shadows on the ticket and Polaroid (contact, mid, ambient);
  - the ticket's bottom-right corner is lifted: lighter paper, an extra shadow underneath and no crease line;
  - the paper grain is unchanged.
- **One human detail:** a small hand-drawn arrow from "Ours:" to the TripNerd banner.
- **Stamp:**
  - freshly inked in a deeper blue, with a slight ink spread on the ring and type;
  - uneven density, heavier on one side; rotated −14°;
  - the mascot is still cropped from the real logo file, in original colours.
- **Not done, on purpose:** the optional "ticket over a raised phone" pop-out. The ticket sits in the sky, and the nearest phones are about 70 px below it. Moving it would change the approved layout and pull the eye down before the headline.

**Caption (owner to approve), 67 characters:** "Filming it or living it? 🐎 Tell us which one you were on Derby Day."
**Hashtags:** #DerbyDay #Louisville #TripNerd #FanExperiences #BucketListTravel
**Trademark caution:** "Kentucky Derby" is a registered mark of Churchill Downs, so #KentuckyDerby is left off the paid version. "Derby Day" is used descriptively.
