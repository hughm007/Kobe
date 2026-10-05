---
title: "TripNerd — Augusta cheap eats Reel — production log"
type: report
client: tripnerd
owner: Karl
status: active
created: 2026-10-05
updated: 2026-10-05
tags: [production-log, reel, augusta]
---

# Production log

## Where things are
| Item | Location |
|---|---|
| Campaign Bible (single source of truth) | [campaign-bible.md](campaign-bible.md) |
| Shot list (ten fields per shot) | [shotlist.md](shotlist.md) |
| Keyword DM reply | [dm-reply.md](dm-reply.md) |
| Evidence records | [../../evidence-records.md](../../evidence-records.md) |
| Skeptic verdicts (verbatim) | [qc/](qc/) |
| Approval page (storyboard, animatic, decisions) | Artifact: see the link recorded in the 2026-10-05 entry below |
| Edit kit ZIP (overlays, boards, renderer, README) | Higgsfield storage: https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/87a1bdbf-3c9f-4f03-8b38-1aeb8ab90c8e.zip (2,284,514 bytes, 43 files; HTTP 200 verified 2026-10-05) |
| Build scripts | [build/](build/) — `render.js` (overlays + boards + text-band check), `page.py` + `page-template.html` (approval page), `scores.example.json` |

Binaries (PNG/JPG/ZIP) are not committed; they rebuild from `build/` in a minute.

## Rebuild
```
# fonts: Poppins 600/700/800 + Inter 500/600/700, latin subset, inlined as data: URLs
FONTS_CSS=fonts-embed.css node build/render.js out tripnerd-logo-white.png [scores.json]
python3 build/page.py out build/page-template.html approval.html qc/<latest-skeptic>.txt
```
The renderer prints a text-band check (every text block inside y 288–1344 px and x ≤ 940 px).

## Shoot-day checklist (after the gates clear)
- [ ] Consent email from the on-camera Nerd on file (filmed, named, posted)
- [ ] Tasting sheet written **before** filming (order + scores)
- [ ] Two identical sandwiches in white deli paper; ice cream sandwich last
- [ ] No packaging, labels, logo clothing or appliance badges in frame
- [ ] Exposure and white balance locked; one daylight window
- [ ] Receipt photographed whole (for EV-tripnerd-010), filmed on the total line only
- [ ] VO for shots 2 and 8 recorded at the counter right after the takes
- [ ] List of homemade vs store-bought items (for the caption)

Consent email template (plain language; use TripNerd's own release if it has one):
> I agree that TripNerd may film me for an Instagram Reel about Augusta food, show my first
> name on screen, and post the video on TripNerd's social channels. — [Name], [date]

## Entries
### 2026-10-05
- Campaign opened at depth FULL; Bible, shot list, evidence records written.
- Meta Ad Library references pulled (active US video ads; copy and thumbnails read, videos
  not watched frame by frame). Library IDs in Bible §3.
- Real TripNerd wordmark fetched in the Higgsfield sandbox (SHA-256 `11bfe474…6f00b40`).
- Overlays and boards rendered locally (Playwright, inlined fonts); edit kit re-rendered in the
  Higgsfield sandbox and uploaded to Higgsfield storage. **0 generation credits used.**
- Skeptic Pass 1 (isolated subagent): BLOCK. Repairs made per Bible §14; regression pass run
  with a fresh packet.
- After the regression packet was assembled, two DM lines changed (free public phones,
  grandstands note) — each now carries an Evidence ID; re-check at the next Skeptic pass.
- Story kit AUGUSTA reply replaced with the evidence-checked version.
