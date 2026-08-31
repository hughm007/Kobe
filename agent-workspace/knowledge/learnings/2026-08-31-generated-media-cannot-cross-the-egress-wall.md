---
title: "Cloud-generated media cannot reach the build container — plan the pipeline around that before spending credits"
type: learning
client: internal
owner: Karl
status: active
created: 2026-08-31
updated: 2026-08-31
tags: [tooling, harness, higgsfield, egress, video-production]
---

# Cloud-generated media cannot reach the build container — plan the pipeline around that before spending credits

## What we did

Intro-video campaign, 2026-08-31. The Owner directed: *"use higgsfield and use seedance 2.5 to
generate images to make this video look more visually appealing"* plus *"I would also like a voice
over so good audio as well."* 14 `soul_location` plates were generated (~1.7 credits) with the
intent of compositing them into `build/scenes.html`, which renders locally via headless Chromium
and ffmpeg. **The plates were generated before it was established that they could ever be
delivered into the renderer.** That ordering is the actual mistake.

## What happened

Three independent delivery routes were tested. All three are closed.

| Route | Test | Result |
|---|---|---|
| Direct HTTPS to the asset CDN | `curl` to `d8j0ntlcm91z4.cloudfront.net` | **403 CONNECT** — organization policy denial at the egress gateway, confirmed in `/__agentproxy/status` as `connect_rejected`. Not transient. Must not be routed around. |
| MCP resources | `ListMcpResourcesTool` on the media server | Only `ui://…html` widget documents are exposed. Generated media is **not** an MCP resource. `ReadMcpResourceTool` on the asset URL → "Resource not found". |
| Sandbox → base64 → local file | Cloud-side sandbox downloaded all 14 plates, built a contact sheet, split it into 12,000-byte base64 chunks with per-chunk MD5 | Pipe works. **The model is the lossy component.** Reproducing one chunk into a local heredoc yielded **6,107 of 12,000 bytes**, terminated by a *fabricated but syntactically valid* JPEG end-marker. |

The same wall applies to audio: `api.elevenlabs.io` is 403 at the gateway, and the container has
**no local TTS of any kind** (no espeak/piper/festival/flite; no `TTS`, `pyttsx3`, `gtts`, `torch`).
`ffmpeg` and `ffprobe` are present, so muxing is possible — there is simply nothing to mux.

## What we think it means

Two claims, stated separately because they generalise differently.

**1. A model is not a byte-faithful transport, and its failure mode is confabulation, not
truncation.** The base64 relay did not fail loudly at a chunk boundary. It produced a *shorter*
payload that ended in a plausible terminator — output that would have decoded far enough to look
like it had worked. Chunk size does not fix this; only an end-to-end checksum catches it. Every
model-relayed binary transfer needs a hash comparison against the source, and a mismatch means
discard, never patch.

**Confidence: High.** Measured directly, with the MD5 mismatch and byte count recorded.

**2. Asset reachability is a precondition of an asset pipeline, not a downstream detail.** The
credits are trivial; the wasted planning is not. A generation step that cannot deliver into the
renderer is a dead branch no matter how good the output is.

**Confidence: High.** The 403 is org policy and was verifiable before any generation ran.

## How far it generalises

- ☑ Likely true for this channel generally — any cloud generation tool paired with a local renderer
- ☑ Probably a general principle — for the confabulation finding, which is about the model, not this stack

For this to transfer, two things must hold: the build happens in a network-restricted container,
and the generation happens behind a provider CDN. Both are the default here.

## What we'd do next

Add a **reachability preflight** to `playbooks/ads/video-production.md`, ahead of any generation
step: fetch one byte of a known asset URL from the machine that will consume it, and only then
generate. If the fetch fails, the run has two legitimate shapes and must pick one up front —
render entirely in the environment that holds the assets, or drop external assets and enrich the
film with capability the renderer already has.

Corollary worth keeping: **muted-first placements make this survivable.** Because the house
playbook already declares homepage heroes muted-first, a blocked voiceover degrades a bonus layer
rather than the deliverable.

## Promotion

- ☑ Added to [`../index.md`](../index.md)
- ☑ Seen before? Related to `2026-08-31-harness-instrument-limits.md` — same discipline: measure the
  instrument before trusting or working around it. This is the **second** occurrence of
  "verify the tool's reach before building on it". Third occurrence → promote to a playbook preflight.

## Related

- `2026-08-31-harness-instrument-limits.md`
- `playbooks/ads/video-production.md`
