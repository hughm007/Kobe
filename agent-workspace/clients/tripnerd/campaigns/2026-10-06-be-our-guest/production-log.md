---
title: "TripNerd — Be Our Guest — production log"
type: report
client: tripnerd
owner: Karl
status: active
created: 2026-10-06
updated: 2026-10-06
tags: [production-log, reel, real-footage]
---

# Production log

## Where things are
| Item | Location |
|---|---|
| Campaign Bible | [campaign-bible.md](campaign-bible.md) |
| EDL + footage log | [shotlist.md](shotlist.md) |
| **Master v1.4a** (15.0 s, balcony open, 1080×1920, 24 fps, H.264 + AAC 48 kHz, −16.6 LUFS, −2.1 dBTP) | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/4dbb2e1f-4386-43ef-aed8-8decad475f05.mp4 — sha256 `00affd65daeacd79176fe2f04fa06ceb1699f762882370eb21b008ee508235fa` |
| Contact sheet v1.4a | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/886a4a85-89a9-4262-957f-2c1770b7aaab.jpg |
| Master v1.4 (superseded: limiter auto-level, −14.6 LUFS) | `…/9cac3c27-446f-45a0-a0a6-fe9e5e3b7f67.mp4` |
| Master v1.3 (superseded) (15.0 s owner trim, 1080×1920, 24 fps, H.264 + AAC 48 kHz, −16.0 LUFS) | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/78460e4e-64b4-49fe-b715-0ae3c12cff4e.mp4 — sha256 `03b641aa79735f95e0186452f164476c0f3b0cd9234cf20fc7ba0ab90cb5ed46` |
| Contact sheet v1.3 | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/447c1228-bc23-47f2-aef8-629180d25c9c.jpg |
| Master v1.2 (20.4 s, superseded) | `…/ab7ead09-531c-4b93-a52b-0f3924bd7d6b.mp4` — sha256 `3e1b64d6…a25c6` |
| Contact sheet v1.2 (1 frame/s) | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/be880782-46f4-4191-88e4-45f2babd6e09.jpg |
| Superseded masters | v1 (21.0 s, TV in suite shot, logo-wall shot): `…/8a4f9cef-af2b-48b8-8edb-85a9c5e0d901.mp4` · v1.1 (V18 failed motion gate): `…/ac78e4f8-0512-4154-8c1c-77fab98ec082.mp4` |
| Source bundle (13 Drive videos + sha256 + probe) | Higgsfield storage `…/8bfb305f-798c-4318-8b87-7fbffd85fe65.zip` (109,951,843 bytes). Contains guest footage — treat the link as private |
| Build scripts | [build/](build/) — `cover_logo.py` (placard logo clearance), `overlays.js` (supers + text-band check), `assemble.py` (EDL, grade, audio levelling, concat) |
| QC | [qc/](qc/) |

## Rebuild (Higgsfield sandbox)
```
unzip <bundle>.zip                      # src/*.mp4 + sha256.txt (verify: cd src && sha256sum -c ../sha256.txt)
python3 cover_logo.py src/TN_2026-03-12_the-players_V23.mp4 s1c.mp4 1.2 3.6
NODE_PATH=/usr/local/lib/node_modules node overlays.js . logo.png
python3 assemble.py tripnerd-be-our-guest-v1-4a-master.mp4     # cover_logo.py no longer used (door shot removed)
python3 servicepow_qc.py tripnerd-be-our-guest-v1-4a-master.mp4 --master --aspect 9:16 --duration 15.0 --endcard 3.0
```

## Spend
0 generation credits.

## Entries
### 2026-10-06
- Owner opened the two Drive folders to link access; all 13 videos pulled (sizes match Drive) and
  bundled into Higgsfield storage (HTTP 200). Owner asked to switch folders back to Restricted.
- Footage reviewed by eye; V12 and V15 excluded (All Access branding / repost watermarks);
  scoreboard frames and the suite TV avoided.
- Door placard: "THE PLAYERS" half covered with a flat colour fill, tracked per frame (54/58
  frames detected, smoothed); checked on four frames.
- v1 built → v1.1 (TV removed from suite shot, logo-wall shot cut) → v1.2 (V18 replaced after
  failing the clip motion gate).
- QA1 on v1.2 (canonical harness, sandbox copy sha256 `cd48e662…`): preflight PASS; 10/10
  conformed segments PASS; master PASS 12/12; ASR 0 speech; text band 6/6. Output:
  [qc/2026-10-06-qa1.txt](qc/2026-10-06-qa1.txt).
- Dual gate launched on frozen v1.2 (fresh critic agent + isolated Skeptic agent).
- Owner trim → v1.3 (15.0 s): views run cut; "THE VIEW" + "TripNerd's spot / Right on the 17th /
  Where would you sit?" beat. QA1: 7/7 conformed segments PASS, master PASS 12/12, −16.0 LUFS,
  LRA 5.6, ASR 0 speech, text band 7/7. Uploaded (HTTP 200, confirmed).
- Dual gate on v1.2 returned: critic HARD FAIL 6.5 ± 1.5; Skeptic BLOCK (placard logo visible in
  frames 0–3 under a mis-tracked patch; consent unknown; empty suite; late island green; audio
  jumps; homepage CTA). Verbatim in qc/.
- Owner: "TripNerd's got the best spot." + guest consent confirmed by Jason (standing).
- v1.4 → v1.4a: balcony-reveal open, suite-in-use shot, TripNerd named in the hook, continuous crowd
  bed, "2027 packages: link in bio". v1.4 limiter auto-level pushed −14.6 LUFS / −0.6 dB → fixed
  (level=0): v1.4a −16.6 LUFS, −2.1 dBTP. QA1: 6/6 segments PASS, master PASS, ASR 0, text band 7/7.
- Final dual gate launched on v1.4a (fresh critic + isolated Skeptic).
