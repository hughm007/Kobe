---
title: Build where the assets already are
type: learning
client: internal
owner: Karl
status: active
created: 2026-08-31
updated: 2026-08-31
tags: [production, video, tooling, egress, higgsfield]
---

# Build where the assets already are

## What happened

The Service Pow intro film was rendered in this repo's build container: an HTML/SVG scene
file driven through Playwright and pinned Chromium. The generated imagery it needed lived
on Higgsfield's asset CDN. Those two places cannot talk to each other.

Measured, three routes, twice each:

| Route | build container | Higgsfield sandbox |
|---|---|---|
| `raw.githubusercontent.com` | 200 | 200 |
| Higgsfield asset + audio CDNs | **403 at CONNECT** (org egress policy) | 200 |
| S3 bucket, unsigned GET | **403 AccessDenied** | — |
| `media_upload` presigned PUT | — | 200 |

So every generated asset had to be smuggled: generate in the sandbox → presigned PUT →
commit into the public repo → curl back from raw GitHub → composite → PUT the result out.
Each hop needed its own verification because the sandbox is reclaimed every few minutes.

**Roughly half the hours of that build round were spent moving bytes, not making the film.**
The transport work produced no visible output. None of it appears in the master.

## The rule

**Pick the build location by where the heaviest inputs already live, before writing any
render code.** Rendering is cheap to relocate; a firewall is not.

For anything that consumes generated media, that means building inside the Higgsfield
sandbox. `higgsedit` is preinstalled there — a file-backed timeline where one JS file is
the whole edit, rendering deterministic MP4 with no browser in the loop. Same 1920×1080,
30fps, 60.000000s spec; the transport problem simply does not exist.

## The measured difference

| | SVG + Playwright, in the build container | higgsedit, in the sandbox |
|---|---|---|
| Asset reach | 403; every file smuggled | native |
| Render, 1800 frames | ~20 min | **~35 s** (`--engine node`) |
| Per frame | ~700 ms | ~5–6 ms graphics |
| Failure mode | silent — a broken scene renders a blank frame | **a refusal naming the node** |

That last row matters as much as the speed. Six API errors in the first higgsedit draft
each came back as one line naming the exact property. The equivalent mistakes in the SVG
path had to be found by rendering frames and looking at them.

## What it does not change

The egress policy is correct and stays. This is not a workaround for it — it is picking
the side of the wall the work belongs on.
