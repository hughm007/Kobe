---
title: "Decouple audio from visual generation — never pick a video model for its bundled audio"
type: learning
client: internal
owner: APPROVER
status: active
created: 2026-09-02
updated: 2026-09-02
tags: [audio, video, architecture]
---

# Audio is a separate subsystem

## Owner verdict
Generated audio failed the quality bar outright. Treat it as a **failed subsystem**, not as a
reason to downgrade the visual system — the two were being judged as one thing and they are
not one thing.

## The rule
1. **Visual generation produces a silent visual master.** That is the deliverable of the
   video lane.
2. Audio is produced afterwards as its own chain: script -> voice selection -> voice
   generation or recording -> music -> SFX -> mix -> loudness and clarity QA.
3. **Never select a generation model because it conveniently bundles audio.** Visual quality
   outranks built-in audio in model routing, always.
4. **No deliverable may be classified CLIENT READY while obviously synthetic or poor audio
   remains in it.**

## Where the audio route stands today, honestly
`say` (macOS) is present and produces real, ffprobe-verified audio at zero cost. It is
adequate for animatic and internal cut reference. **It is system TTS and has not been judged
against a client-facing bar.** Whether it clears that bar is a creative judgement for the
APPROVER, not a technical one.

An ElevenLabs-class integration is a **candidate**, not a decision. Nothing is to be
installed or connected until the audio subsystem's actual requirements are specified and the
spend passes SPEND_APPROVER.

## Audio QA, when it is built
Human naturalness · cadence · emotional fit · pronunciation · local service-business
credibility · pacing against the edit · music balance · intelligibility · synthetic artifacts
· CTA emphasis.
