---
title: "Higgsfield sandbox work must run under one background lease and persist each result as it is made"
type: learning
client: internal
owner: Karl
status: active
created: 2026-10-07
updated: 2026-10-07
tags: [higgsfield, sandbox, tooling, video-production, voice]
---

# Higgsfield sandbox work must run under one background lease and persist each result as it is made

## What we did
Built TripNerd's Augusta A4 (18 s Reel) in the Higgsfield cloud sandbox on 2026-10-07. The build ran:
- staging from Drive and the Higgsfield CDN;
- 4k frame-by-frame clean-ups of about 3 minutes each;
- tracking, rendering, the QC harness, and uploads.

The work spanned two plan-mode pauses and long local-writing gaps.

## What happened (FACT)
| Event | Effect |
|---|---|
| Sandbox discarded after idle gaps (three times in one afternoon) | Lost: staged sources, a Demucs install, two finished 4k clean-ups (`A4k_clean2`), and the other session's `owner/` files |
| Long jobs started with `nohup` from a foreground `sandbox_exec` | Died with the sandbox; only `background:true` calls hold the 15-minute lease |
| One `background:true` pipeline (stage → clean → upload → render → QC → upload) | The full A4 build ran in about 2 minutes of compute without loss |
| `sandbox_exec` given a 13 kB base64 blob | Refused ("bring the file in by its URL"); plain-text heredocs of our own scripts were accepted and hash-verified against the repo |
| A failed render followed by an unguarded PUT | Uploaded an empty file to a reserved slot (never confirmed) |
| `create_voice_from_confirmed_audio` with all three custom-voice slots used | Refused, no charge. Seed Audio with `medias:[{role:"audio_references"}]` cloned the voice per request instead (0.8 credits a take) |

**Source:** this session's tool results; the campaign's production log (`clients/tripnerd/campaigns/2026-10-07-augusta-handled/production-log.md`, observations 8–13).

## What we think it means
- Treat the sandbox as a disposable worker.
  - Write every step into one script and launch it with `background:true`.
  - PUT each durable intermediate (cleaned clips, stems, the build kit) to Higgsfield storage the moment it exists, guarded by a size check.
  - Re-stage from URLs, never from memory.
- Keep scripts in the repo and send them as plain text with an MD5 check. Base64 relays are refused.
- When a workspace hits its saved-voice limit, use a per-request audio reference rather than deleting someone's saved voice.

**Confidence:** High for the lease and refusal behaviour (observed repeatedly in one session). Medium for the audio-reference clone's likeness: measured only by median pitch (95 Hz against the host's 107 Hz); a human listen is pending.
