---
title: "Adobe touch-up on Higgsfield media works only through a block-upload bridge, and the sandbox forgets everything without a lease"
type: learning
client: tripnerd
owner: Karl
status: active
created: 2026-09-29
updated: 2026-09-29
tags: [video-production, higgsfield, adobe, sandbox, pipeline, tooling]
---

# Adobe touch-up on Higgsfield media works only through a block-upload bridge, and the sandbox forgets everything without a lease

> Extends [A vendor's cloud sandbox gives a cloud session hands and eyes](2026-09-23-vendor-sandbox-gives-a-cloud-session-hands-and-eyes.md).

## What we did

TripNerd THEIR CAMERA ROLL build, 2026-09-29, from a Claude Code cloud session. The owner asked for Higgsfield *and* Adobe on the finishing. We ran ten Higgsfield-upscaled guest photos (2k PNG) through Adobe `image_apply_auto_tone`.

## What happened

| Step | What failed | What worked (FACT) |
|---|---|---|
| Hand Adobe the Higgsfield result URL | "URL domain not whitelisted" for the generation CDN (`d8j0ntlcm91z4.cloudfront.net`) | Nothing direct; a bridge is needed |
| Block upload: `asset_initialize_file_upload`, then PUT the bytes from the sandbox to the `at.adobe.com` transfer link | `curl -L -X PUT` failed on 9 of 9 files with `(92) Stream error in the HTTP/2 framing layer`, 4 retries each | Resolve the short link's redirect first (`curl -w '%{redirect_url}'`, no body). Then PUT to the S3 target with `--http1.1`: **9 of 9 returned 200 on the first try**, then `asset_finalize_file_upload` |
| Auto-tone | none | One call per 10 images; returns `photoshop-api.adobe.io` short URLs (PNG) |
| Keep the Adobe output | The short URLs' lifetime is unknown | `media_import_url` accepts the Adobe short URL, so the output becomes permanent Higgsfield media (10 of 10) |
| Keep sandbox files between calls | Staged inputs (≈200 MB) vanished between calls once no background job was running | A background job holds a 15-minute lease. Stage from durable URLs with an idempotent `setup.sh` (re-staging took about 1 minute) |
| Preview any sheet | none | `asset_inline_preview` fetches the Higgsfield *upload* CDN (`d2ol7oe51…`); keep the size at 3000 px or less |

Result: auto-tone improved all ten photos (flat, hazy upscales gained contrast and colour) with faces unchanged. Owner verdict on the film is pending.

**Source:** this session's transcript and the campaign record `clients/tripnerd/campaigns/2026-09-29-all-events/build-v1.md`.

## What we think it means

Adobe can be a touch-up stage in a Higgsfield build, but only through the block-upload bridge. Budget one extra round of tool calls per batch of ten. Treat the Higgsfield sandbox as stateless: every build starts from a setup script that pulls from durable media URLs, and long steps run as background jobs.

**Confidence:** Medium. One session. The HTTP/2 failure may be transient on Adobe's side, but the redirect-then-HTTP/1.1 route is strictly more robust either way.

## How far it generalises

- ☐ Specific to this client
- ☐ Likely true for this industry / audience type
- ☑ Likely true for this channel generally (any Higgsfield + Adobe build from a cloud session)
- ☐ Probably a general principle

## What we'd do next

Put the redirect-then-HTTP/1.1 PUT into the video-production toolkit as a helper the next time Adobe is in the chain, and keep a `setup.sh` in every build folder.
