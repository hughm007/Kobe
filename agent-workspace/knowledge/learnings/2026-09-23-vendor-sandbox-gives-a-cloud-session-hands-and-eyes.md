---
title: "A vendor's cloud sandbox plus a second connector's image fetch gives a cloud session hands and eyes"
type: learning
client: tripnerd
owner: Karl
status: active
created: 2026-09-23
updated: 2026-09-23
tags: [video-production, higgsfield, cloud-session, egress, qc, pipeline]
---

# A vendor's cloud sandbox plus a second connector's image fetch gives a cloud session hands and eyes

> Extends [Cloud-generated media cannot cross the egress wall](2026-08-31-generated-media-cannot-cross-the-egress-wall.md)
> and [Build where the assets are](2026-08-31-build-where-the-assets-are.md): the wall is real, but the build can move to the vendor's side of it.

## What we did

TripNerd 17th-hole 30s advert v3b, 2026-09-22/23, in a Claude Code cloud session whose egress policy
blocks Higgsfield's media host (CDN 403 on every CONNECT), with no ffmpeg locally and the client media
library on the owner's Mac. Nine Seedance 2.5 clips (≈540 credits) plus three voice takes.

## What happened

| Need | What worked | What did not |
|---|---|---|
| Cut, grade, caption, mix, normalise | `sandbox_exec` (Higgsfield's own Linux box: ffmpeg, Pillow, fonts, internet to its CDN); build script uploaded as a general file, run in the background, outputs PUT back to presigned S3 slots | local ffmpeg via pip installs fine but has nothing to cut |
| See any frame or sheet | Adobe `asset_inline_preview` fetches a public CDN URL and returns the image into context | base64 through sandbox stdout truncates at ~10k chars; Wikipedia and vendor hosts are blocked to WebFetch |
| Get owner-supplied photos in | `media_upload` presigned PUT from the local shell (the S3 upload host is allowed) | the upload widget never produced a file in this client |
| Prior-session clips | reusable by job id; their MP4s carried **no audio track** (bed had to be lifted from a clip that did) | assuming generated clips all carry audio |
| Batch submission | resubmit with `declined_preset_id` when items come back `submission_failed` with a preset recommendation (7 of 8 did) | treating the recommendation as an error |

Turnaround: roughly 45 minutes from first generation to a QC'd 30s master, two renders (one fix for an
ffmpeg input-index bug, one for audio and a cut shot). MCP client timeout is 60s per sandbox call
regardless of the tool's own timeout, so long steps must run in the background and be polled.

**Source:** this session's transcript; `clients/tripnerd/deliverables/17th-hole-v3-build/`.

## What we think it means

A cloud session is a viable production seat for Higgsfield work, not only a drafting seat, provided the
assembly runs inside the vendor's sandbox and QC runs on frame sheets pulled back through a connector
that can fetch public URLs. The remaining gap is audio: nobody in the loop can hear the mix, so the
owner's end-to-end watch (LB29) is load-bearing, not a formality.

**Confidence:** Medium. One production, one vendor; the CDN allow-list and the Adobe fetch behaviour
could change without notice.

## How far it generalises

- ☐ Specific to this client
- ☐ Likely true for this industry / audience type
- ☑ Likely true for this channel generally (any Higgsfield build from a cloud session)
- ☐ Probably a general principle

Transfers wherever the vendor offers a sandbox with internet access to its own storage and some
connector in the session can fetch a public image URL.

## What we'd do next

Fold the pattern into the production playbook as the cloud-session variant of "build where the
assets are": generate → sandbox-cut → sheet → connector-preview → owner watch. Add "probe every
reused clip for an audio stream" to preflight.

## Promotion

- ☑ Added to [`../index.md`](../index.md)
- ☑ Seen before? [generated-media-cannot-cross-the-egress-wall](2026-08-31-generated-media-cannot-cross-the-egress-wall.md), [build-where-the-assets-are](2026-08-31-build-where-the-assets-are.md)
- ☐ Third occurrence → promote into a playbook and link back from here

## Related
- `clients/tripnerd/deliverables/2026-09-23-17th-hole-30s-v3.md`
