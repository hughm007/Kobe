---
title: "TripNerd — footage usage ledger and the untouched pool"
type: report
client: tripnerd
owner: Karl
status: active
created: 2026-10-12
tags: [client, footage, ledger, no-duplicates]
---

# TripNerd footage usage ledger (2026-10-12)

**Rule this file serves:** new October adverts use only footage no built cut has used, approved or draft.
Built from every remote branch (newest copy of each file); see the per-advert record on those branches for detail.

## Status facts
- **No TripNerd advert is recorded as posted** (run-4 `08_Performance/README.md`; growth tracker has no `posted` row).
- Approved: Hosting spot drone opening v2 (owner score 8.4) · Their Camera Roll 25 s (owner approved 2026-09-29) · **Augusta, handled A6 (approved by Jason)**. · **Daytona suite Reel 18 s (owner approved 2026-10-19)**; register: `ServicePOW/Clients/TripNerd/07_Client_Approved/README.md`.
- The 2026-10-12 "unused footage" scripts checked only two approved adverts, so Script 2 reuses draft footage (V24 0–2, 10.0–11.2; V23 39–41, 48.5–51 all appear in draft cuts). **Do not build Script 2 as written.**

## Already used (do not reuse)
| Source | Approved adverts | Drafts / killed builds |
|---|---|---|
| V23 (Players suite, 54.1 s) | picture 29.8–33.2 | 1.2–3.6, 4.2–5.2, 10.3–12.3, 18.65–19.55, 24.0–27.7, 30.0–32.2, 40.4–41.7, 46.0–48.0, 48.6–54.1 |
| V24 (Players suite, 31.1 s) | picture 13.6–15.8; audio 13.3–16.9, 19–27 | picture 0.2–1.6, 8.4–22.0; audio 0–3.8, 8.0–28 |
| V05 (Daytona 2024) | Daytona 18 s: picture 0.0-3.5; audio 0.0-3.5, 3.5-8.0 | earlier Daytona drafts (see campaign folder) |
| V06 (Daytona 2024) | Daytona 18 s: picture 2.00-3.47; audio 0.0-2.25, 2.0-4.0, 4.0-6.0 | earlier Daytona drafts |
| Daytona photos | Daytona 18 s: hospitality-suite, Photo A (gallery_05, as Kling burnout), Photo B (gallery_07), father-son, wow-guests | — |
| V16 | — | picture 2.0–6.5, 8.5–10.0; audio 2.0–13.9 |
| V07 | — | picture 8.5–10.0 (and 1.0–4.6, 14.8–16.2 if HF 2585923a = V07); audio bed 0–16.2 |
| V08 | — | picture 3.0–6.0 |
| V18 | — | Be Our Guest v1.1 (seconds unknown) |
| V19 (Augusta lawn) | 2.4–5.525 | same |
| V25 (Augusta musician) | 0–2.725 | 2.35–3.87, ~1.67–3.9 |
| Owner cut 17a07624 | 18.0–23.9 | — |
| IMG_ photos | — | 1901, 1907, 1915, 1916, 1926, 1930, 1932, 1933, 1985, 1989, 1995, 1998, 2004, 2023, 2030, 2034, 2036 |
| P### photos | — | P026, P035, P115, P139, P150, P155 (P082 in owner's own cut) |
| NERDS website gallery | 10 heroes + 71 tiles in Their Camera Roll | — |

## The untouched pool
**Videos never cut:** V01–V04, V20–V22 (Phoenix, 7) · V09–V11 (Derby) · V13 (path to 17, flare) · V14 (17th crowds; scoreboard) · V17 (possible duplicate of V16) · Daytona 2022 suite tour `553c8ee2`. Excluded for third-party branding: V12, V15.
**Twelve of these (V01–V06, V09–V11, V20–V22) have never been watched or logged.** Their content is unknown.

**Unused stretches of V23 (no built cut):** 0–1.2, 5.2–10.3 (avoid the event banner at 3.5–5.5), 12.3–18.65 (TV at 17.5: crop), 19.55–24.0 (TVs at 19.8, 20.5), 27.7–29.5, 33.25–40.4, 41.7–46.0 (faces), 48.0–48.6.
These alone make a complete door-to-rail walk: 0–1.2 → 5.5–10.3 → 12.3–18.6 → 21–24 → 33.3–38.5.

**Unused photos:** every P### except those above (about 124 Augusta-week photos, plus 55 Players/Derby/Phoenix photos never reviewed). IMG_1913, 1917, 2016, 2031, 2033 unused. Do not use IMG_1899, 1900, 1909, 1926–1930, 1987–1989, 2003 (marks, badges or TV).

## Known gaps
- Posted status and what TripNerd itself has posted are unknown: ask Jason.
- V07 and V13 Higgsfield mappings are inferred from clip length.
- Source timecodes are missing for the owner's own edits (17 v15, Augusta Narrated) and Be Our Guest v1/v1.1.
