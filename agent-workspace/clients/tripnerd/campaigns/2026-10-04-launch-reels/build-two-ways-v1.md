---
title: "TripNerd Reel 01 'Two ways to see the 17th' (H1) — build v1 record: cut to the approved storyboard, QC, links"
type: report
client: tripnerd
campaign_id: 2026-10-04-launch-reels
owner: Karl
status: draft
created: 2026-10-06
updated: 2026-10-06
tags: [campaign, reel, build-record, qc, real-footage, launch-reels]
---

# Two ways to see the 17th — H1, build v1

**Status: DRAFT v1 BUILT (2026-10-06), for the Wed 7 Oct 12 PM ET slot; owner review and TripNerd's approver pending.** Nothing is posted.

**Built to:** the storyboard Karl approved on 2026-10-04 in the "TripNerd Growth strategy" chat — `edit-plan-01-two-ways-17th.md` and `shotlist.md` on branch `claude/admiring-mendel-aqjyaw` (not yet merged here). This record and the script live in the same campaign folder so the two branches converge on merge. Script: [`build/build_twoways.py`](build/build_twoways.py).

## Deliverable (FACT)
- **File:** `TN-R01-two-ways-17th-H1-v1.mp4`, 23,419,894 bytes, MD5 `09ea4569ca274205a23fe24768666a5a`.
- **Specs:** 1080x1920 (9:16), 30 fps, 318 frames, 10.600 s. H.264 CRF 16 yuv420p bt709, AAC 192 kbps 48 kHz stereo. Integrated loudness −13.95 LUFS, true peak −1.00 dBTP. Real footage and real sound only; no music; nothing generated; no AI label needed.
- **Zip (forced download):** `TN-R01-two-ways-17th-H1-v1.zip`, 23,415,484 bytes, MD5 `c512ece5377c7555b9ec3cc370ed7f18`; the MP4 inside is byte-identical.
- **Contact sheet (3 fps):** `TN-R01-two-ways-17th-H1-v1-sheet.jpg`.
- **Links:** see "Location" below.

## The cut, as built (seq seconds)
| # | Seq | Source | Picture | Text |
|---|---|---|---|---|
| S1 | 0.0–4.5 | V16 / "Gallery walk 1" (`e037067e-8eef-4b07-a3d2-9de4bc5b694b`, 404x720/30, upscaled to 1080p/30) 2.0–6.5 | Fans walk the path beside the hospitality stands; the island green opens on the right | "Two ways to see the 17th." (0.1–2.0) · "1. The path." (2.0–4.5) |
| S2 | 4.5–5.5 | V23 (`d925d5be…`, upscaled 1080p/30) 4.2–5.2, **1.5x crop anchored right** | Walking under the suite banner: the crop keeps **TRIPNERD** and drops the tournament name on the banner's left half | — |
| S3 | 5.5–7.9 | V24 (`2911d9d6…`, upscaled 1080p/30) 8.4–10.8 | Seated at the rail behind a guest's cap; the green below; the hush | "2. The rail." (6.0–7.9) |
| S4 | 7.9–9.4 | V24 13.4–14.9 | The putt drops; the crowd erupts (no board in frame) | — |
| S5 | 9.4–10.6 | V24 14.9–16.1, 103 % push | The roar settles over the green | "Who are you bringing?" (9.2–10.6) |

**Sound:** S1 the real walla from the gallery clip (fades under the J-cut at 4.2–4.8); S2–S3 V23's suite ambience from the banner walk-in at −4 dB, left to fall quiet for the hush; S4–S5 V24's own roar, audio leading the picture cut by 0.1 s, tail decaying under the hold. Static gain to −14 LUFS with a true-peak limiter at −1 dBTP (loudnorm's dynamic fallback would have flattened the walla–hush–roar shape).

## Where this differs from the approved board, and why
1. **S2 is 1.0 s instead of 1.5 s and cropped 1.5x to the right.** The banner reads "THE PLAYERS · TRIPNERD · B1.1"; at 1.35x the tail of the tournament name still peeked in at 5.4 s. The tournament name is a third-party mark (client brief), so the crop is tighter and the shot ends at source 5.2 s. S3 takes the 0.5 s (2.4 s of hush instead of 1.9 s). Total still 10.6 s.
2. **No V08 roar layer.** V08 exists only on the owner's computer (the 2026-10-04 search found no copy). V24's own roar carries the hit; the board's own fallback.
3. **Loudness by static gain and limiter**, not loudnorm (see above). Target met: see QC.
4. **Fonts:** Montserrat ExtraBold 76 px, white with a soft shadow, upper third at y = 330 (the board said "a clean bold sans" pending the brand font).

## Provenance and rights (FACT)
- All three clips are TripNerd's own (standing authorization; library clearance recorded by Karl 2026-10-04). Upscales are touch-ups (Higgsfield bytedance 1080p/30, preset ugc): V23 job `2f22b3aa-6584-4f87-b514-7674f106ac72`, Gallery walk 1 job `745c171d-9c82-4adb-915a-b9a2f0cf6874`; V24's from the ROAR build (`da1caa66…`). Nothing generated.
- **Marks:** the tournament name on the S2 banner is cropped out; no scoreboard, player name or broadcast graphic in S3–S5 (V24's board ranges 2.5–7.5 and 23.5–31 are outside the cut); in S1 a distant video board is visible at a few dozen pixels, unreadable at delivery size (frame-checked at 1.5, 2.5 and 3.5 s); the stands' flags are unreadable.
- **People:** S1 is a public crowd walking toward the camera (faces incidental, no one the subject); S3 is the back of a guest's cap; players on the green are small and unnamed. Covered by the library clearance for organic use; paid use would still want the usual releases.
- **Claims:** none on screen. The caption names the tournament only to say where guests go, per the plan's posting rules, with the non-affiliation line.

## QC (FACT, 2026-10-06)
- **QC1 harness** `servicepow_qc.py` (md5 `321ef0b7…`, preflight PASS) `--master --aspect 9:16 --duration 10.6` → **OVERALL PASS**: resolution, fps, pix_fmt, audio 48k stereo, peak −1.9 dB / mean −18.3 dB, no frozen, no black, motion 58.75 px/frame, hook motion 26.53, no flash cuts (0 detected cuts), aspect, duration 10.60 s.
- **Loudness:** −13.95 LUFS integrated, −1.00 dBTP (static gain +0.25 dB after the pre-mix normalisation; limiter engaged on the roar only).
- **Speech screen:** faster-whisper `tiny` returned one low-confidence fragment ("You", avg log-prob −1.28, language probability 0.21) over the opening walla: the known hallucination on crowd noise (see the harness-limits learning, addendum 2026-10-06). The source clips carry no speech in the ranges used (Gallery walk 1: none; V23 4.2–8.1: no speech detected; V24 13.2–16.6: the roar, no words). **Verdict: no speech.**
- **Contact sheet** viewed (32 frames at 3 fps): the walk, both cards, the TRIPNERD banner crop with no tournament text, the rail hush with "2. The rail.", the eruption, the push with "Who are you bringing?". As designed.
- **Upscaler note:** the gallery-clip upscale came back 1080x1926; the build scales it to 1080x1920 (a 0.3 % resample, invisible).
- **Not run:** Skeptic Pass 3 and the Critic scorecard — the board's own checklist asks for both before TripNerd's approval batch.

## Spend (FACT)
- Two `upscale_video` jobs: V23 full clip **1.08 credits** (20:57:13 UTC), Gallery walk 1 **0.28 credits** (21:04:01 UTC); **1.36 credits in all**. The V24 upscale was already paid for by the ROAR build (0.62). Generation: none.

## Location (permanent, Higgsfield storage; public to anyone with the URL)
- Stream (mp4): `https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/1730af06-486a-4a4b-80ed-041a76264365.mp4`
- Download (zip): `https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/9049ba2c-3f4b-4656-bc17-553301f1b1de.zip`
- Contact sheet: `https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/5cdd0592-0064-40aa-b508-fd95a0bde720.jpg`
- **Verified 2026-10-06:** all three links answer HTTP 200 with the right byte counts; a fresh download of the mp4 and the zip matched the MD5s above (media `1730af06…` video, `9049ba2c…` file, `5cdd0592…` image, all confirmed). Re-verify before relying on them later.

## Caption (DRAFT, per the board; TripNerd approves)
> Two ways to see the 17th at THE PLAYERS. We'll take the rail.
> Who are you bringing? Send this to them.
> Talk to a Nerd: link in bio.
> TripNerd is not sponsored by, affiliated with, or a partner of the tournament, the PGA TOUR or the venue.
> #TripNerd #spreadtheNERD #islandgreen #golftrip

- Cover frame: S3 (the rail view), subject centred for the 4:5 grid crop. Original audio. Posted from Business Suite at Wed 7 Oct 12:00 PM ET once approved; a Story push within 15 minutes.
- Trial variant H10 ("The path or the rail?" / "The path." / "The rail." / "Which one are you?") renders from the same script with `--variant H10` if a Friday Trial is wanted.
