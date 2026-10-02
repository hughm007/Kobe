---
title: "Drive binaries reach the container byte-exact via saved tool results"
type: learning
client: internal
owner: Karl
status: active
created: 2026-10-02
updated: 2026-10-02
tags: [tooling, drive, connectors, assets, egress]
---

# Drive binaries reach the container byte-exact via saved tool results

## What we did
TripNerd deck v3 needed TripNerd's own photos, which existed only in Google Drive. The
2026-08-31 learning ([generated media cannot cross the egress wall](2026-08-31-generated-media-cannot-cross-the-egress-wall.md))
established that the model is not a byte-faithful conduit, so retyping base64 was ruled out.

## What happened
`download_file_content` on a 0.5–1.7 MB JPEG returns more text than the tool-result limit, so the
harness **saves the full JSON result to a file** under `~/.claude/projects/.../tool-results/` and
returns only the path. Decoding that file locally (`json.load` → `base64.b64decode`) produced
29/29 byte-exact JPEGs: decoded size equal to Drive's `fileSize`, valid `FFD8…FFD9` markers. The
bytes never passed through the model.

## What it means
- The egress wall still holds for the Higgsfield CDN; **Drive is a working binary intake route**
  as long as the file is large enough to be saved rather than inlined. (Tiny files would come back
  inline — untested; don't route binaries that way.)
- Drive image metadata exposes no labels for phone photos; build a labelled contact sheet with
  ffmpeg and look, rather than guessing what a file shows.
- Doctrine still applies after the transfer: provenance starts UNKNOWN; record what was used.

## Evidence
Session 2026-10-02; files IMG_1899–IMG_2036 from Drive folder 0AJj-fhf07xDjUk9PVA.
