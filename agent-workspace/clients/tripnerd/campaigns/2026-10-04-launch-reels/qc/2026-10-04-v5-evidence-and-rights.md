---
title: "Augusta, by the clock v5 — evidence and rights records (BC-15/16/19/20/21/24/26/27)"
type: report
client: tripnerd
owner: Karl
status: active
created: 2026-10-04
updated: 2026-10-04
tags: [client, instagram, reel, evidence, rights, qc]
---

# Evidence and rights: "Augusta, by the clock" v5

**Master:** `TN-R03-augusta-by-the-clock-H3-v5.mp4`, sha256 `7315856054bcfc2c36f00b8710d109429fb963ce2f38c2d9513e7227e2a901a7`. It is 7.83 s long, 1080×1920 at 30 fps, with AAC 48 kHz stereo audio.

## BC-16: every claim and its Evidence Record

| EV-id | On-screen claim | Evidence | Label |
|---|---|---|---|
| EV-TN-AUG-01 | "9:03 AM", "5:44 PM", "5:48 PM" | EXIF DateTimeOriginal on the originals, read with Pillow: IMG_1901 `2026:04:09 09:03:55`; IMG_1995 `17:44:55`; IMG_2004 `17:48:39`. OffsetTimeOriginal is `-04:00` (Eastern daylight time). Camera: Apple iPhone 15 Plus. Source: Drive folder `0AJj-fhf07xDjUk9PVA`. Times are shown to the minute, rounded down. | CONFIRMED |
| EV-TN-AUG-02 | "Thursday" | 2026-04-09, the EXIF date, was a Thursday (Python `calendar`). | CONFIRMED |
| EV-TN-AUG-03 | "in Augusta" | The files carry no GPS. The evidence is circumstantial but consistent: the −04:00 offset (Georgia is on EDT in April); Masters-branded caps, badges and folders in other frames of the same roll (IMG_1899, 1926, 1989, 2030); a TV leaderboard of that week's field (IMG_2003); TripNerd sells Augusta experiences (client brief); and TripNerd approved an "Augusta" carousel in September (invoice TN-2026-09). | INFERRED, strong. **TripNerd's approval of this post confirms it** |
| EV-TN-AUG-04 | "hosted by TripNerd." | TripNerd's branded check-in table with staff (IMG_1901); a TripNerd staff badge on a lanyard (IMG_2030); TripNerd's "Private Party" banner (IMG_1985); the client brief describes TripNerd as running hosted event trips. | CONFIRMED |
| — | The racing clock, 9:04 AM → 5:43 PM | Shows only that time passed between two EXIF-timed photos. It makes no claim about what happened in that window. | Not a claim |
| — | "Who would you bring?" | A question. Nothing is offered: no dates, prices or availability. | Not a claim |

## BC-20: rights

| Item | Status | Basis |
|---|---|---|
| **Music** | CONFIRMED, owned by ServicePOW | An original composition synthesised in code: [`../build/music_v5.py`](../build/music_v5.py), deterministic, seed 7. Oscillators and noise only: no samples, third-party recordings or voices. |
| **Photos** | CONFIRMED by the APPROVER | Karl, 2026-10-04: "everything in the TripNerd library is cleared to post and use". **Recommended:** a one-line written confirmation from TripNerd on file. |
| **Likeness** (the family of six, the three women at 5:44, two TripNerd staff at check-in) | CONFIRMED by the APPROVER, under the same library clearance | No venue staff or third-party public figures appear in v5. **Recommended:** TripNerd confirms its guests agreed to social use. |
| **Third-party logos** | Removed | By conventional retouching (no AI), coordinates in [`../build/marks.py`](../build/marks.py): Ole Miss and Polo (cloned from the adjacent fabric); New Balance and On shoes, the Apple laptop, a jacket logo, a belt-bag logo and the venue name on a cup (healed); the Purell label and the event program card (healed to plain). The pinstripe moiré is softened by 1.3 px. **TripNerd's own mark is kept unaltered.** |
| **Fonts** | CONFIRMED | Inter, under the SIL Open Font License. |

## BC-21: correct client, correct brand assets
- PASS. The only brand asset is TripNerd's real tablecloth logo, in camera in IMG_1901. It is not regenerated or redrawn.
- The full wordmark and mascot stay in frame through S1.

## BC-24: angle and the Anti-Generic Gate (campaign-director record; APPROVER confirms)
- **Angle:** "Be there, from TripNerd's seat: real footage, original sound" (Bible §3). The September adverts used a suite walk-through and "Hospitality. Handled.", and this angle differs from both.
- **Logo-swap test:** put a competitor's logo on it and it breaks. The branded table, the "hosted by TripNerd" line and TripNerd's own guests and day belong to TripNerd. PASS.
- **Memory test:** "the clock that races through the day". PASS.

## BC-15: expected strings
- N/A. No phone number, URL or offer is declared on screen.
- On-screen strings, for the record:
  - "9:03 AM", "Thursday in Augusta," and "hosted by TripNerd.";
  - the clock;
  - "5:44 PM";
  - "5:48 PM" and "Who would you bring?".
- OCR is unavailable here (no tesseract). The strings were checked by eye on extracted frames.

## BC-19: destination
This is an organic post. The path is profile → bio link → tripnerd.com. **Karl confirms in the app that the bio link opens tripnerd.com**; Instagram is egress-blocked here.

## BC-26 / BC-27: ASR. **NOT RUN, so BLOCKING until run**
- **Harness results:**
  - `servicepow_source_qc.py --bed`: UNVERIFIED (exit 2). Its advisory voice-band ratio is 0.50, which is context only. Receipt: [`2026-10-04-v5-bc26-bed-check.txt`](2026-10-04-v5-bc26-bed-check.txt).
  - `--master`: UNVERIFIED. Receipt: [`2026-10-04-v5-bc27-master-speech-check.txt`](2026-10-04-v5-bc27-master-speech-check.txt).
- **Why:** openai-whisper's model hosts (openaipublic.azureedge.net, huggingface.co) are denied by this environment's network policy.
- **Fallback tried:** PocketSphinx, an offline model from PyPI. It is **not valid**: it "heard" words in the pure-oscillator bed, and its voice detector flagged the whole 7.8 s as speech. A speech control (the v15 voice-over) also transcribed as nonsense. Recorded as attempted and inconclusive. It is not a pass.
- **Speech-free by construction** (the source contains no voice material) is true, but it is not the registry's test.
- **To close:**
  - **Option 1:** on any machine with internet, `pip install openai-whisper`, then run:
    - `python3 servicepow_source_qc.py --bed music_v5_master.wav`
    - `python3 servicepow_source_qc.py --master TN-R03-augusta-by-the-clock-H3-v5.mp4`

    Both should report no speech.
  - **Option 2:** allow `huggingface.co` and `openaipublic.azureedge.net` in this environment's network settings, and Claude runs both.
