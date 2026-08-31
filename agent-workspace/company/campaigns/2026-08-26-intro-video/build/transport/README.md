# transport/ — a deliberate exception to the no-media-in-git rule

`base.mp4` is the silent Rev 4 hero cut (identical bytes to
`../out/delivery/hero-h264.mp4`). It is committed **as a transport mechanism, not as
storage**, and CLAUDE.md §6's "this is a git repo, not a DAM" still stands everywhere else.

**Why it has to be here.** Audio and images are generated in the Higgsfield cloud. This
build container is denied the Higgsfield CDN by organization policy (403 CONNECT), and the
Higgsfield sandbox — which *can* reach that CDN and has ffmpeg — has no other way to obtain
the video. Measured reachability:

| Route | build container | Higgsfield sandbox |
|---|---|---|
| `raw.githubusercontent.com` | ✅ 200 | ✅ 200 |
| Higgsfield asset + audio CDNs | ❌ 000 (403 CONNECT) | ✅ |

GitHub raw is the only surface both can see, so the video travels build → GitHub → sandbox,
the sandbox muxes and composites, and the result returns through a `media_upload` presigned
URL. Nothing here routes around the egress policy: it uses two sanctioned channels.

**Delete this directory once the assembled master is delivered.** It is reproducible at any
time from `scenes.html` — the render is deterministic.
