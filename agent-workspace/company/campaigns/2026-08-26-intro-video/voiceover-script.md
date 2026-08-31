---
title: "Intro video — voiceover script, bed and mix spec (Revision 2, audit-corrected)"
type: brief
client: internal
owner: Karl
status: active
created: 2026-08-31
updated: 2026-08-31
tags: [intro-video, audio, voiceover, blocked]
---

# Intro video — voiceover script, bed and mix spec

> **Status: PRODUCED 2026-08-31.** The voiceover exists and is in the delivered master.
> Owner instruction: *"any captions you planned to have is what the voice over will
> read"* — so the VO reads the fifteen burned strings verbatim rather than the separate
> script in §2, which is kept below as the alternative take.
>
> **Nobody has heard it yet.** It was generated, placed, mixed and measured, but this
> container cannot play audio. Loudness and speech-presence are verified numerically
> (§7); the performance is not.

## 1. What this is for — read this before budgeting it

The homepage hero **autoplays muted and has no unmute affordance**, which is the
Owner's own approved placement decision and the playbook's stated design target.
So ~100% of hero viewers receive none of this. That is not an argument against
making it — it is an argument about where it gets used:

| Placement | Gets the VO? |
|---|---|
| Homepage hero (autoplay, muted, looping) | **No** — muted by design |
| 20-second social cutdown | Yes |
| Sales-call send / click-through page | Yes |

The film must continue to work with the sound off. Every line below is written to
**add** to the picture, never to explain it.

## 2. The script

Timed at **140 words per minute**, which is the unhurried read the mix spec asks
for. The first draft was budgeted at 158 wpm; at a real read that produced five
collisions, including 0.46s of voice over the B4 snap and 0.53s across the loop
seam. All ten lines were re-timed and four were rewritten.

| # | Beat | In | Out | Line |
|---|---|---|---|---|
| 1 | B1 | 1.0 | 5.29 | "You never really know which ad works until it's running." |
| 2 | B1 | 6.0 | 9.43 | "So you don't bet the month on one." |
| 3 | B2 | 10.4 | 14.69 | "The worst part isn't the money. It's not knowing why." |
| 4 | B3 | 16.2 | 19.63 | "You keep working, same as any other week." |
| 5 | B3 | 20.4 | 23.83 | "Nothing to set up. No one to book." |
| 6 | B4 | 24.6 | 27.17 | "Because that part actually is you." |
| 7 | B5 | 30.8 | 33.80 | "So the next one isn't another guess." |
| 8 | B6 | 40.0 | 44.29 | "A pile of rules sits behind all this. We keep track." |
| 9 | B7 | 49.4 | 51.97 | "Judge the work, not the promise." |
| 10 | B8 | 52.7 | 58.70 | "You're busy running the jobs. Your marketing should be busy bringing in the next one." |

**89 words.** you/your = 6, we/our = 1 → **6:1**, against a ≥3:1 target and the
control's measured 4:4. One audience signal ("running the jobs"). Two benefit
connectives, against zero in the control.

### Hard timing constraints, all satisfied

- **Nothing crosses the B4 snap at 27.400.** Line 6 ends 27.17, and the snap plus
  `AI builds the rest.` play in real silence — 3.63s of it before line 7.
- **Nothing crosses the loop seam at 58.9.** Line 10 ends 58.70.
- **No gap shorter than a breath.** Tightest inter-line gap is 0.57s (5→6); the
  draft had three under 0.40s, one at 0.20s.
- **Line 7 is out by 33.80**, clear of `5–7 business days from your footage.`
  entering at 34.1 — that string carries both legal qualifiers and must be read,
  not talked over.

### What changed from the draft, and why

| Line | Defect found in audit | Fix |
|---|---|---|
| 1 | "Nobody really knows…" — an absolute, no "you", and on an agency's own homepage it reads as the agency admitting it can't predict either | "You never really know…" — adds the missing "you", kills the absolute |
| 5 | "lose a day" duplicated the burned string `No shoot day.` 0.4s away | "Nothing to set up. No one to book." |
| 7 | **Hard-constraint breach.** "you find out why" promises causal knowledge a 4-variant pack cannot produce, and re-widened a claim the board narrowed on 2026-08-30 to "keep the one that pulls" | "So the next one isn't another guess." — asserts nothing about performance |
| 8 | "rules you don't have to learn / We already did" — an assurance Service Pow cannot underwrite, adjacent to the `Can't get pulled.` S4 that blocked round 1 | "A pile of rules sits behind all this. We keep track." |
| 9 | Opened "So you're", as line 2 did — register tic | "Judge the work, not the promise." |

## 3. The bed

**Mood:** competence-calm. The bible's stated primary emotion is relief that
someone has a system, not excitement. Reference is one person working in a small
room, not a brand film. **Nothing swells and there is no riser** — this is a
60-second loop on a homepage, and a track that peaks becomes unbearable on the
fourth pass.

**Instrumentation**, four elements, all quiet:
1. Felt/muted upright piano — single notes and open fifths, F major, no modulation.
   Felt piano is wood and cloth; it sounds like paper, which is what the picture is
   made of.
2. A low sine-ish pad. Floor, not colour. Mostly felt rather than heard.
3. **The pulse is the marker** — recorded felt-tip on cartridge paper, edited to an
   eighth-note feel and left slightly loose. The film's rhythm section should be the
   sound of the thing the film is made of.
4. Two celeste strikes only, on the two snaps (27.400 and 48.800). The only two
   moments in the film that are allowed to sparkle.

## 4. The mix

- **48 kHz stereo**, 24-bit WAV master; AAC-LC 192 kbps in the MP4.
- **−14 LUFS** integrated, true peak **−1.0 dBTP**, LRA 5–7 LU. Tight range on
  purpose: a hero is played quietly on a laptop, and a wide LRA means the quiet
  lines vanish and the snaps startle.
- Three buses — VO / BED / SPOT — so ducking can be surgical.
- Sidechain the BED from the VO: ratio 3:1, depth −5 dB, 120 ms release.

**Note on QC check P2.** Adding a soundtrack would mechanically clear the standing
`audio-48k-stereo` / `audio-peak` FAILs, but it **does not retire the P2 ruling**.
The silent hero and the 20s cutdown still need a legitimate-silence mode in the
harness. P2 would be sidestepped for one file, not solved.

## 5. Why this is not produced — measured, not assumed

| Route | Test | Result |
|---|---|---|
| ElevenLabs (wired in `orion/src/orion/voice/tts.py`) | `curl https://api.elevenlabs.io/v1/voices` | **403 CONNECT** at the egress gateway (organization policy). Keys are SET in `orion/.env` and were never printed; they are unusable from here regardless. |
| Local TTS | `which espeak espeak-ng festival flite piper`; python `TTS`/`piper`/`pyttsx3`/`gtts`/`torch` | **None installed.** |
| Cloud generation → local mux | See `knowledge/learnings/2026-08-31-generated-media-cannot-cross-the-egress-wall.md` | Generated media cannot reach this container. `ffmpeg` and `ffprobe` are present, so muxing works — there is simply nothing to mux. |

**To produce it, one of these has to happen** (Owner's call):

1. Generate the VO and bed in a Higgsfield session and download them in a browser,
   then mux locally. Exact count and credit cost to be stated before anything fires.
2. Run ElevenLabs from a machine that is not behind this egress policy.
3. Have the egress policy extended to `api.elevenlabs.io` for this workspace.

## 6. Open items for the Owner

- **The audience signal is spent twice.** The burned string `Your van. Your street.`
  is copy, not picture, and it is a stronger trade signal than "running the jobs."
  The burned line is locked and gate-passed, so the VO's signal is the removable
  one. Recorded rather than actioned — the Owner authored the B8 line himself as
  the tone target and should be the one who decides.
- **Line 8 is a knowing acceptance, not an accident.** "We keep track" is a
  competence claim from a company `company-profile.md` records as never having
  shipped a paid ad. It is defensible — learning the rules is not shipping ads, and
  `operations/compliance.md` is a real artifact — but it should be accepted at
  sign-off rather than arrive by default.
- **Adding audio produces a NEW master.** `gates/round3-final/` is silent. The
  campaign's own rule is that both gates re-run in full on frozen artifacts after
  any repair, so the 8.2 and the 0-S4 Skeptic verdict do not transfer to a scored
  cut.

---

## 7. What was actually produced — 2026-08-31

**Engine:** Higgsfield `seed_audio`, preset voice **Holden** (male, US), 15 separate
generations at 0.2 credits each = **3.0 credits**. ElevenLabs stayed unreachable; the
Owner's instruction *"use higgsfield to make the voiceover"* is what unblocked this.

**Script:** the fifteen burned strings, read verbatim. `5–7` was spoken as
"Five to seven" so the reader would not say the en dash.

**Placement.** The generated files carry leading and trailing silence, so the lines were
placed by measured file duration rather than by caption in-time, then re-spaced to remove
five collisions. Final delays (ms): 500 · 3800 · 10700 · 15500 · 19000 · 24200 · 27200 ·
31000 · 34100 · 38600 · 41100 · 44600 · 47200 · 50300 · 53900. Tightest inter-line gap
0.22s; nothing crosses the loop seam at 58.9s.

**Mix.** `adelay` per line → `amix` (normalize off) → `loudnorm I=-14 TP=-1.0 LRA=9` →
48 kHz → `apad whole_dur=60`. Muxed with `-c:v copy`, so **the picture is not re-encoded**
and the gated video is bit-for-bit intact. AAC 192 kbps stereo.

**Measured on the delivered file:**

| | |
|---|---|
| Integrated loudness | **−13.9 LUFS** (target −14) |
| True peak | **−1.0 dBFS** |
| Loudness range | 4.3 LU |
| Duration / frames | **60.000000 s · 1800 frames** |
| Speech present | every 5-second bucket, RMS 2150–4410 |
| Round-trip | downloaded from the delivery URL, **md5 matches** the built file |

This also clears standing limit **P2** for this master — `audio-48k-stereo` and
`audio-peak` now pass. It does **not** retire P2: the silent hero and the 20s cutdown
still need a legitimate-silence mode in the harness.

## 8. How it was assembled — the route, for the next person

The build container is denied the Higgsfield CDN by organization policy; the Higgsfield
sandbox can reach it and has ffmpeg but no browser. Measured:

| Route | build container | sandbox |
|---|---|---|
| `raw.githubusercontent.com` | ✅ 200 | ✅ 200 |
| Higgsfield asset + audio CDN | ❌ 403 CONNECT | ✅ |
| S3 bucket, unsigned GET | ❌ 403 AccessDenied | — |

So: video travels **build → GitHub → sandbox**, audio is generated **Higgsfield → sandbox**,
the sandbox muxes, and the result returns through a **`media_upload` presigned PUT**, which
is the one writable channel out of the sandbox. Both channels are sanctioned; nothing
routes around the egress policy.

