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
