---
title: "TripNerd Phoenix Reel 3 'Your Seat's On This Ticket': build v1"
type: report
client: tripnerd
owner: Karl
status: draft
created: 2026-10-20
updated: 2026-10-20
tags: [client, phoenix-open, reel, real-footage, build]
---

# Reel 3: build v1 (owner script, 2026-10-20)

- **Script:** the owner's final script (merged after the Grok/ChatGPT review), built as written.
- **Spec:** 17.0 s, 510 frames, 1080x1920, 30 fps, H.264 + AAC 48 kHz.

## Owner rule changes in this script (recorded)
- **Sponsor and event logos in real footage are left as filmed** (no blur, no crop, no cover). This reverses the earlier cover approach for this version.
- **No AI** in the main version. The AI pull-back is a separate test only.

## Build
| # | Time | Shot | Text | Notes |
|---|---|---|---|---|
| 1 | 0–0.5 | Black | — | Low-passed real crowd murmur |
| 2 | 0.5–3.0 | Ticket slides up (−4°, soft shadow), push-in toward "THE 16TH" | "Your seat's on this ticket." | Paper snap; murmur swells |
| 3 | 3.0–7.5 | 2-frame white flash → V03 1.9–6.4 s, original framing | "This is the 16th." at 3.97 s (the sand blast) | Real audio; temp-beat drop at 5.5 s on the roar |
| 4 | 7.5–11.5 | V01 0–4.0 s, natural pan | "Filmed from our seats." | Suite ambience low |
| 5 | 11.5–13.5 | P05, static, on a blurred fill of itself | "Bring your crew." | One real V04 cheer |
| 6 | 13.5–17.0 | End card: logo, "Phoenix 2027", ticket slides back in stamped, "Talk to a Nerd", "Link in bio" | — | Crowd tail; beat resolves |

**Ticket and stamp:** composited in code from the real TripNerd logo and mascot pixels (taken from the approved end card); text set in Montserrat.
- **NOT matched to the Derby static:** that file isn't in the repo or the uploads. **NEEDS INPUT:** the Derby static, to match its ticket style.
- **Fallback flags in `renderR3.py`:**
  - argument 2 = card-4 text ("Filmed on our trip.");
  - argument 3 = 0 drops "SECTION: THE 16TH".

## Deliverables (scratchpad)
| File | Loudness | SHA-256 (first 16) |
|---|---|---|
| `TripNerd_Phoenix_R3_YourSeatsOnThisTicket_TEMPBEAT.mp4` | −13.9 LUFS / −1.7 dBTP | `0dbe4e5389f21402` |
| `…_NoMusic.mp4` | −14.0 LUFS / −1.2 dBTP | `62d0e9ee0ecb62da` |

- **Drive link:** NOT made. The Drive connector takes inline base64 only, and the file is too large; the owner uploads it manually.

## Open
- Wyatt's Pixabay track (the drop goes at 5.5 s).
- Jason's written confirmations (seats; 2027 package; faces).
- Derby static for ticket matching.
- Dual gate not run. **Owner review: PENDING.**

## v5 (owner script v5, 2026-10-20): AI ticket opener, STOPPED at QA
- **Generation:** Veo 3.1 preview high, 4 s, 9:16, the owner's prompt and negative prompt verbatim. Job `32283283-3226-43ef-85e9-ed03f0c54f4f`. **40 credits** (one try, under the per-try level the owner approved earlier). Balance 3,092.14 → 3,052.14.
- **QA FAIL (full size):**
  1. **It reads as a baseball stadium,** not the 16th: a red-dirt warning track along the field, MLB-style light-tower press boxes, a flat oval outfield.
  2. **The camera is not locked off:** it dollies forward and up about 30% of frame height. The stub slides off the bottom; curtains swing in from about 3 s.
  3. **No rack focus:** the background just sharpens as the camera moves.
  4. **Passes:** blank stub (no text), no hands or faces, condensation on the glass.
- **Not built further; no more spend.**
- **Prepared:** `renderR5.py` (the stub face is perspective-warped and blur-matched to the stub's own focus every frame) and `mixR5.py` (one music track, real audio only on V03, ducked about 40% under the swing, slammed back at 5.6 s).
- **Blocked on:**
  - an opener decision;
  - Wyatt's Pixabay track file.
- **No-AI alternative mocked:** `r3/opener_alt_mock.jpg`, the ticket graphic over the **real P02 photo of the 16th from the suite**, with a blur-based rack focus between ticket and stadium. Free, and truthful about the venue.
