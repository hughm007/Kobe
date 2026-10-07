---
title: "Broadcast commentary and a gallery roar in an AI cut: hushed TTS controls, one roar source, and word-level transcript QC"
type: learning
client: tripnerd
owner: Karl
status: active
created: 2026-09-23
updated: 2026-09-23
tags: [audio, higgsfield, seed_audio, commentary, sound-design, qc]
---

# What we learned building the v5 audio without being able to hear it

**Context.** The owner wanted a golf commentator through the putt and a real-sounding gallery roar, with no narrator before the end card. Nobody in the cloud session can hear audio.

**Observations (2026-09-23, TripNerd 17th-hole v5).**
1. `seed_audio` exposes `loudness_rate` (−50…100), `speech_rate` (−50…100) and `pitch_rate` (−12…12). Lines generated at loudness −25 / rate −10 / pitch −1 came out 10–25% longer than the plain takes (e.g. "Tremaine… this for birdie, at seventeen." 5.4 s vs 4.9 s). Budget the timeline from measured speech ends, not from the script.
2. Word-level transcription with faster-whisper (base, int8) in the vendor sandbox is a usable text QC: it caught a doubled name in one take ("Whitlock Whitlock"), a "putt"→"part" reading in another, and confirmed every used line. Generate three voices per line and keep the set whose transcripts are all clean.
3. Generated roar SFX (mirelo_text_to_audio, 12 s) have their own shape: one take had a quiet 3.7 s hush then a single attack at 4.4 s (usable: place it so the attack lands 150 ms after the drop and the hush plays under the stroke); the other had two attacks (rejected). Measure RMS per window before placing; never trust the prompt's timing.
4. Research on real broadcast calls: hushed read before the ball goes, silence through the stroke, sparse reads during the roll, a two-word burst on the make, then the commentator lays out and the crowd carries the back half. Never say the result before it happens; never echo a famous signature call.
5. Shell gotcha in `sandbox_exec`: `cd dir && a && (b) & c` backgrounds the whole `cd && … (b)` chain, so `c` runs in the old directory. Use `;` or a subshell for the whole line.

**Falsifiable claim.** For any ad with a sports-broadcast register, the hushed-control TTS plus a single measured roar source will read more real than plain TTS and per-clip native crowd; needs an owner listen to confirm (nobody here has heard it).
