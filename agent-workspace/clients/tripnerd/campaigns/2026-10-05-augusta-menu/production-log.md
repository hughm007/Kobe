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
| Approval page (storyboard, animatic, decisions) | https://claude.ai/artifact/DoHBvb7sknuCgYH5KCVuHq (private to Karl's account until shared) |
| Edit kit ZIP v3, two-judge table (overlays, boards, renderer, README) | Higgsfield storage: https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/075ee53a-4d0d-4d6a-9797-062593825eec.zip (2,409,612 bytes, 41 files; HTTP 200 verified 2026-10-05; sandbox copy of render.js hash-matched to the repo). v2 (https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/994882d6-25b5-4fac-b33a-9c3dfe0c4d06.zip) is superseded. v1 (https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/87a1bdbf-3c9f-4f03-8b38-1aeb8ab90c8e.zip) is superseded. |
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
- [ ] Consent emails from **both** judges on file (scope in shotlist.md prerequisite 1) + CLIENT_APPROVER written confirmation
- [ ] Location OK and frame checked (no window views, mail, house numbers, photos, screens)
- [ ] Props: white tablecloth, five plain cloches, two dry-erase paddles + markers, plain plates
- [ ] Phone 1 on a tripod (locked two-shot); phone 2 handheld for cloche lifts and close-ups
- [ ] Both judges bite, write and raise their paddles live for every item; scores read off the footage into scores.json
- [ ] Two identical sandwiches in white deli paper; ice cream sandwich last
- [ ] No packaging, labels, logo clothing or appliance badges in frame
- [ ] Exposure and white balance locked; one daylight window
- [ ] Receipt photographed whole (for EV-tripnerd-010), filmed on the total line only
- [ ] VO for shots 2 and 8 (Nerd A) recorded at the table right after the takes
- [ ] List of homemade vs store-bought items (for the caption)

Consent email template (plain language; use TripNerd's own release if it has one):
> (One email per judge.) I agree that TripNerd may use my likeness, voice and first name in its Augusta food Reel,
> its alternative openings and test versions, the caption and the related direct-message
> reply, on TripNerd's Instagram and Facebook, for as long as the posts stay up. I can withdraw
> by emailing [address]; TripNerd will archive the posts within two business days. — [Name], [date]

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
- Skeptic Pass 1-R (fresh subagent, fresh packet): BLOCK. Second repair round: live verdicts,
  NERDNOTES on both routes, single DM message, "ours: homemade / store-bought" on every card,
  2026 on every price, offer line on screen in shot 9, cards anchored to the band's bottom
  edge (a worst-case render — longest name, two-line item, $123.45 — passes 22/22).
- Next Pass 1 regression deferred until consent, EV sign-off, CONFLICT C1 ruling and ManyChat
  test are in (Bible §16).
- Edit kit v2 uploaded to Higgsfield storage (HTTP 200 verified). Approval page published:
  https://claude.ai/artifact/DoHBvb7sknuCgYH5KCVuHq. Story kit page republished (v5) with the
  evidence-checked AUGUSTA reply.
- Owner asked for AI-generated judges; declined for the posted ad (Bible §16). Owner chose two
  real Nerds at a judging table. Shot list, Bible, renderer (two scores + average per card,
  rank computed from the averages, two-name caption) and approval page rebuilt. Worst-case
  render (long names, ties, $123.45) passes the text-band check 22/22. Edit kit v3 uploaded to
  Higgsfield storage; approval page republished (v2/v3).
