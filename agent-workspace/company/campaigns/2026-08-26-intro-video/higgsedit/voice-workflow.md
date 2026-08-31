---
title: Voiceover — performance-first workflow
type: brief
client: internal
owner: Karl
status: active
created: 2026-08-31
updated: 2026-08-31
tags: [intro-video, voiceover, speech-to-speech, higgsfield]
---

# Voiceover — performance-first, not TTS-first

**Owner directive, 2026-08-31.** Stop auditioning stock TTS voices. The Owner records a
human scratch read of the full script; that recording supplies **cadence, pauses,
emphasis, emotional arc, timing, energy, breath and CTA delivery**. Its purpose is *not*
timbre. The performance is then transferred into a professional male commercial voice by
speech-to-speech. **No TTS clip ships as the final voiceover.**

## What is actually available here — verified, not assumed

| | |
|---|---|
| ElevenLabs API credential | **MISSING** (four standard env names checked) |
| `api.elevenlabs.io` from this container | **HTTP 000** — refused at the egress gateway |
| ElevenLabs Voice Library | **NOT reachable.** `text2speech_v2` has an `elevenlabs` *engine* variant, but it takes Higgsfield voice ids — it does not expose the Library |
| Speech-to-speech | **YES** — Higgsfield `voice_change`: *"replace the spoken voice while keeping the original timing"* |
| Target voice pool | ~30 male Higgsfield presets, plus cloned `element` voices |

So the Owner's workflow is deliverable; the voice *pool* is Higgsfield's, not ElevenLabs'.

**A correction owed:** the 5-voice audition on 2026-08-31 was drawn from page one of
`list_voices` and presented as a shortlist. There are ~30 male voices. The sample was
unrepresentative and was described as more than it was.

## The pipeline, verified 2026-08-31

`voice_change` takes a **video_id**, not audio. So audio is wrapped in a trivial still
video, transferred, and the audio extracted back out:

```sh
ffmpeg -f lavfi -i color=c=black:s=640x360:r=25 -i read.wav \
       -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest src.mp4
# media_upload -> PUT -> media_confirm(type=video) -> voice_change -> jobs_wait
ffmpeg -i out.mp4 -vn -ac 1 -ar 48000 out.wav
```

### Timing preservation — measured

Silence maps of source vs. transferred output, `silencedetect=noise=-38dB:d=0.20`:

| Pause | Source | Output | Drift |
|---|---|---|---|
| 1 | 0.7267 | 0.7254 | 1.3 ms |
| 2 | 1.7238 | 1.7351 | 11.3 ms |
| 3 | 3.1079 | 3.1052 | 2.7 ms |
| 4 | 5.8328 | 5.8380 | 5.2 ms |
| 5 | 6.9657 | 6.9569 | 8.8 ms |

**Max drift 11 ms over 7.5 s.** Duration 7.4805 → 7.5233 s (+0.6%). The performance
survives. Loudness drops ~3 LU (−20.4 → −23.5 LUFS) — a gain change, corrected by
`loudnorm` in the mix, not a defect.

The probe source was an existing TTS clip used **only to prove the mechanism** before the
Owner spent time recording. It is not a candidate for the film.

## The architecture this unlocks

The Owner's continuous take becomes **the master clock**. The film is re-timed to the
read, rather than the read being forced into a grid built around a slow synthetic voice.
Beat boundaries in `edit.jsx` get derived from the measured silence map of his recording.

## What is not permitted

Cloning a named commercial voice artist's voice without a licence. Cloning the Owner's
own voice is fine; a professional timbre must come from a pool where the licence is
already granted (the Higgsfield presets) or from a voice the Owner has licensed.

## Sequence

1. Owner records one continuous take of all 15 lines, film order, his own pacing.
2. Measure his silence map, per-line durations and wpm.
3. Transfer through 8–10 male candidates; return the best 5 for the Owner to rank on
   naturalness, authority, warmth, premium commercial quality, Service Pow fit, and
   absence of AI artifacts. A candidate that degrades materially is rejected, not
   repaired.
4. Owner picks. Full read transferred through that voice, mixed, film re-timed to it.
5. Music slot still open — Higgsfield cannot generate music; the Owner supplies a
   licensed track.
