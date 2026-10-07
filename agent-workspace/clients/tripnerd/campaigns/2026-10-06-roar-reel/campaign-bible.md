---
title: "TripNerd ROAR — kinetic word column over the real 17th-hole roar (8 s Reel, 9:16), SLIM Bible"
type: brief
client: tripnerd
campaign_id: 2026-10-06-roar-reel
owner: Karl
status: draft
created: 2026-10-06
updated: 2026-10-06
tags: [campaign, reel, instagram, real-footage, kinetic-type, motion-design, 9x16, organic]
---

# ROAR (SLIM Bible)

**Ask (owner, 2026-10-06):** "make a TripNerd version with the roar clip", after seeing Roadtrips' Instagram Reel `DLnBJwfC1iX` (@roadtripsinc, 2 Jul 2025: the word "CHEER" stacked down the frame over fans in red; 18 likes, 0 comments at the time we looked). Only the reel's public preview was seen (cover frame and caption); the motion itself was not.

**Why SLIM:** a zero-generation organic Reel from material already cleared and already used in the approved camera-roll advert (decision 0008). The gates that matter still run (QC1 harness, speech screen, marks and faces check, claims check, owner review). No Skeptic or Critic pass has run; this is a draft for the owner, not a client-ready master.

## 1. What it is
- **Device:** one word, stacked nine rows deep in a condensed display face, over TripNerd's own suite-rail footage of 17. The word is **QUIET** while the gallery holds its breath, then snaps to **ROAR** on the real hit and pulses with the real crowd level. The brand lands on a brand-blue pill at the end. The last frame cuts back to the first, so it loops.
- **Why this and not a copy of the reference:** the reference hammers one word over generic fan footage. Ours has a turn (quiet → roar) that the footage actually contains, and the audio is TripNerd's own recording of the moment. A competitor can borrow the type treatment; it cannot borrow this sound from this seat.
- **Role:** awareness. Built to be watched to the end (8 s, one promise, one payoff), replayed (seamless loop) and sent ("send this to whoever you'd bring"). Fits the launch plan's Feel · Fans row.
- **Length and format:** 8.0 s, 1080x1920, 30 fps, captions not needed (no speech). Sound on is the point; it still reads muted because the word column tells the story.

## 2. Timeline (film seconds; film 0.0 = V24 source 11.4 s)
| Film | Source (V24) | Picture | Word column | Sound |
|---|---|---|---|---|
| 0.0–1.85 | 11.4–13.25 | Inside the suite looking out to the green past a guest's cap; the window frame | QUIET, 55 %, 0.92 scale, breathing slowly, drifting up 10 px/s | real murmur, −26 to −31 dB RMS |
| 1.85–2.1 | 13.25–13.5 | The green, the flag, the gallery still | QUIET contracts to 0.85 and brightens (the inhale) | a soft 0.3 s "inhale" (filtered noise) |
| **2.1** | **13.5** | **The hit:** 4 % punch-in settling over 0.5 s; a two-frame flash | **ROAR** snaps in at 1.18 → 1.0 over 0.18 s with a 6-frame shake | the real roar (peaks −12 dB RMS at 14.0) plus a sub impact |
| 2.1–6.0 | 13.5–17.4 | The gallery erupting across the water, arms up in front | ROAR at full, scrolling up 60 px/s, scale 1 + 0.07 × crowd level | the real roar, sustained to about 18.0 |
| 6.0–8.0 | 17.4–19.4 | The roar decays; arms still up | Column fades to 20 % | real decay to −25 dB by 18.5 |
| 6.0–8.0 | | **Lockup** fades in over 0.4 s: brand-blue pill (the approved end-card blue), the real logo at 560 px, "Hospitality. Handled.", "@tripnerd"; pill bottom at y = 1481 (above the 420 px UI zone) | | |
| 8.0 → 0.0 | | Loop seam: the roar frame cuts to the quiet suite frame | | |

## 3. Provenance (FACT)
- **Picture:** V24 (`2911d9d6-b5c8-4b80-b158-6139277672e1`, TripNerd's own suite POV, 720x1280 24 fps), upscaled once to 1080x1920/30 with Higgsfield `upscale_video` (bytedance, preset ugc) on 2026-10-06: job `da1caa66-da93-4beb-9987-188ac87e660e`, output `hf_20261006_203459_….mp4`. Touch-up only; nothing generated.
- **Sound:** V24's own audio from the same window, loudness-normalised. No music. The only added sounds are a 0.3 s filtered-noise "inhale" and a sub impact on the hit (UI sound design, as on the approved advert).
- **Type:** Anton (SIL Open Font License, Google Fonts) for the column; Montserrat (OFL) for the line and handle.
- **Logo:** the real TripNerd PNG (`46ae277a-7897-4574-b995-38097233d77c`, 1633x601). Never regenerated.
- **Spend:** one `upscale_video` job, 0.62 credits. Generation: none.
- **Code:** [`build/render_roar.py`](build/render_roar.py), [`build/audio_roar.py`](build/audio_roar.py), [`build/setup.sh`](build/setup.sh).

## 4. Rules applied
- **Marks:** the window 11.4–19.4 s contains no scoreboard, no broadcast graphic, no readable logo (frames checked at 1 fps and at full resolution at 14.5 and 17.2 s; the pavilion across the water carries no readable signage at delivery size). V24's scoreboard ranges (2.5–7.5, 23.5–31) are outside the cut. Players on the green are small and unnamed. "17" never appears on screen; no tournament name anywhere in the picture.
- **Faces:** the foreground at 0–1.85 is the back of a guest's cap; the crowd is a crowd (no one is the subject; faces are small, incidental and turned to the green). Consistent with the standing library clearance recorded 2026-10-04 and the client brief.
- **Claims:** none on screen. "Hospitality. Handled." is the line already approved on the hosting spot. No "loudest", no "VIP", no numbers.
- **Audio rights:** TripNerd's own recording; no third-party music (Instagram business accounts cannot use the trending catalogue).
- **AI:** upscale only. No generation, no AI label needed; check the first upload for an automatic label from metadata.

## 5. Caption (draft, version A; version B drops the event name)
> Quiet. Then this.
> 17 from the rail, the way our guests hear it. Real sound, turn it up.
> Send this to whoever you'd bring. March 2027 is open.
> tripnerd.com (link in bio)
> TripNerd is not sponsored by, affiliated with, or a partner of the tournament, the PGA TOUR or the venue.
> #TripNerd #spreadtheNERD #islandgreen #golftrip #corporatehospitality

- Version B, line 2: "The island green from the rail, the way our guests hear it." (no event or venue name; the disclaimer line can then go).
- Alt text: "A stacked word, QUIET then ROAR, over a hospitality-suite view of an island green as the crowd erupts."
- Posting note: original audio; no Story push if it runs as a Trial Reel.

## 6. Gates and status
| Gate | Status |
|---|---|
| Marks and faces (frame check) | PASS on the frames checked (see §4) |
| Claims | PASS (no claims) |
| QC1 harness, loudness, speech screen | see [`build-v1.md`](build-v1.md) |
| Skeptic Pass 3 / Critic scorecard | **not run** (SLIM draft); run before paid use |
| Owner review | **pending** |
| TripNerd approver | **pending** (nothing posts without it) |

## 7. Decision log
| Date | Decision | By |
|---|---|---|
| 2026-10-06 | Build a TripNerd version of the Roadtrips kinetic-word format on the roar clip; real material only, zero generation | Karl (APPROVER), executed as SLIM |
| 2026-10-06 | Word pair QUIET → ROAR (golf-native, and the footage contains the turn) rather than one repeated word; brand on the approved end-card blue, since the wordmark is white | Claude (director) |
