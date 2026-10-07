---
title: "TripNerd — what music the niche's longest-running video ads use, and the cleared track chosen for Augusta A4 (2026-10-07)"
type: research
client: tripnerd
owner: Karl
status: active
created: 2026-10-07
updated: 2026-10-07
tags: [meta-ad-library, music, reels, licensing, competitive-intelligence]
---

# Music in the niche's longest-running video ads, and what TripNerd can legally use

**Question:** the owner asked for "better music". He wanted the most popular Instagram Reels in TripNerd's niche, with music in the background, and a track TripNerd could use with no legal issue. Decision fed: the bed for the Augusta advert A4 (`campaigns/2026-10-07-augusta-handled/`).

## Method and limits (FACT)
- **The ads:** the video ads behind the Library IDs in [the competitive picture of 2026-10-06](2026-10-06-competitive-picture-meta-ad-library.md). They were fetched again on 2026-10-07 from the public Ad Library pages with Playwright in the Higgsfield sandbox: 11 video files from 6 advertisers.
- **What "popular" means here:** the Ad Library shows no plays, likes or spend for commercial ads. As in the competitive picture, the proxy is **days running**: Epic Golf Club 206, TrueFan 175, Black Tomato 172, On Location 67, Liverpool FC 54.
- **What was measured per file:**
  - duration;
  - seconds of detected speech (faster-whisper with VAD);
  - a tempo estimate (spectral-flux autocorrelation, so octave errors are possible);
  - spectral centroid;
  - integrated loudness (ffmpeg ebur128).
- **Hallucinations:** whisper invents one-word "speech" on loud music ("You"). Those rows are marked music-only.

## What they use (CONFIRMED OBSERVATION from the files)
| Advertiser (days running) | File | Length | Speech | Tempo (est.) | Loudness | Reading |
|---|---|---|---|---|---|---|
| Epic Golf Club (206) | 2094062278049538 #0 | 53.7 s | 2.4 s, sung lyric ("Sweet dreams, I'm made of …") | ~117 BPM | −8.9 LUFS | a licensed pop song with vocals under on-screen text |
| Epic Golf Club | 2094062278049538 #1 | 6.2 s | none | ~129 BPM | −14.5 LUFS | upbeat instrumental |
| Black Tomato (172) | 3894421070859564 #0 | 20.1 s | music only | ~78 BPM | −14.9 LUFS | slow cinematic bed |
| Black Tomato | 3894421070859564 #1 | 10.3 s | none | n/a (sparse) | −14.2 LUFS | minimal bed with silences |
| TrueFan Travel (175) | 1703713157483657 #0 | 40.7 s | 35.2 s spoken host VO | ~80 BPM (161 halved) | −18.8 LUFS | talking host over a low bed |
| TrueFan Travel | 1703713157483657 #1 | 25.6 s | none | ~136 BPM | −12.8 LUFS | upbeat instrumental |
| On Location (67) | 1531342008003718 #0 | 31.3 s | music only | ~89 BPM | −17.8 LUFS | cinematic build |
| On Location | 1531342008003718 #1 | 8.0 s | none | ~83 BPM | −14.1 LUFS | cinematic |
| NFL via On Location | 1383911276591603 #0 | 15.6 s | none | ~86 BPM | −7.9 LUFS | loud stadium-style bed |
| Liverpool FC (54) | 1359090269544806 | 15.0 s | none | ~80 BPM (161 halved) | −16.8 LUFS | instrumental |

**Pattern:**
1. The beds are instrumental, under on-screen text. Only TrueFan uses a talking host.
2. Two tempo families:
   - an upbeat ~117–136 BPM family, led by Epic Golf Club, the closest golf-trip peer and the longest runner;
   - a cinematic ~78–89 BPM family (Black Tomato, On Location, NFL).
3. The beds are mastered loud (−8 to −15 LUFS).
4. The longest-running golf-trip advertiser leans on an energetic, recognisable pop track.

## What TripNerd can and cannot use (FACT about licensing; RECOMMENDATION marked)
- **Not usable:**
  - the songs in these ads, which are licensed to those advertisers (or are commercial recordings like the Epic Golf track);
  - trending Instagram audio, because Meta's music library for business accounts and ads does not carry trending commercial songs, and ads using it get muted or rejected.
- **Usable:** a track whose licence names online ads and social posts. Mixkit's Stock Music Free License does ("Social Media video posts", "Online marketing ads", no attribution). Evidence: [`../campaigns/2026-10-07-augusta-handled/qc/music-licence.md`](../campaigns/2026-10-07-augusta-handled/qc/music-licence.md).
- **RECOMMENDATION, taken for A4:** bake a cleared track into the master rather than adding music in the Instagram app. It plays the same organic and paid, nothing gets muted, and the Reel credits as TripNerd's original audio.

## The pick for Augusta A4
- **Track:** Mixkit #470 "Golden Storm" (Diego Nava). Elegant, positive electronic, about 126 BPM, no vocals: the upbeat family the golf-trip leader runs, but clean and premium rather than a pop cover.
- **Shortlist:** 11 Mixkit tracks were measured (tempo, energy curve, vocals by ASR). "Golden Storm" won on structure: a steady groove, a breath, then a drop at 15.11 s that can land on the cut into the ball-landing clip.
- **Alternate:** #31 "Dreaming Big" (cinematic family).
- **Rejected:** #923 "Yeah Yeah", which has sung vocals.
- **Not tested (hypothesis):** whether the upbeat family or the cinematic family converts better for TripNerd. That is a cheap A/B on the same cut (swap the bed, keep the picture) once the advert is cleared to post.
