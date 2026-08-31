---
title: Intro video — higgsedit cut
type: brief
client: internal
owner: Karl
status: active
created: 2026-08-31
updated: 2026-08-31
tags: [intro-video, higgsedit, production]
---

# The higgsedit cut

`edit.jsx` is the whole film. Re-running it reproduces the entire timeline; nothing is
hand-authored in `project.json`.

## Current artifacts

| | |
|---|---|
| **Cut 02 (current)** | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/359ae484-179f-49ec-9ae0-589b59bb4a8c.mp4 |
| **Contact sheet, 30 tiles @ 2s** | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/6b87a268-7de8-47ed-8254-c4e3d01f1d7d.png |
| Cut 01 (superseded — two blank frames) | https://d2ol7oe51mr4n9.cloudfront.net/user_3F0i4XLf4zirKambECqGr0AGq93/027ec176-f178-488e-b824-f2c601dce212.mp4 |
| Voiceover source (15 lines, Holden, 3.0 credits) | `../voiceover-script.md` §7 |

Measured on cut 02: 1920×1080 · h264 · 30 fps · **1800 frames** · **60.000000s** ·
aac 48 kHz stereo · **−13.9 LUFS**, **−1.0 dBTP**, LRA 4.1 · speech in all twelve 5s
buckets · **0 blank frames** at 2 Hz sampling.

## Rebuild it

Everything runs in the Higgsfield sandbox (`sandbox_exec`), which is where the assets are.

```sh
higgsedit init sp --size 1920x1080 --fps 30
mkdir -p sp/media
# the voiceover master, picture stripped -- audio is the spine
curl -fsSL -o /tmp/vo.mp4 '<voiceover master url>'
ffmpeg -nostdin -y -i /tmp/vo.mp4 -vn -c:a copy sp/media/narration.m4a
higgsedit fonts add sp Anton Inter:400 Inter:600 Inter:700
curl -fsSL -o sp/edit.jsx 'https://raw.githubusercontent.com/hughm007/Kobe/<sha>/agent-workspace/company/campaigns/2026-08-26-intro-video/higgsedit/edit.jsx'
cd sp && higgsedit build edit.jsx          # timeline + proof frames (Chrome)
higgsedit render . --engine node --out renders/cut.mp4   # ~35s, no Chrome
```

The sandbox is reclaimed shortly after a call ends, so run long steps with
`background: true` (15-minute lease) and poll the log. Every command must be
self-contained.

## Constraints this file is under

- **Timings are locked** to `TEXTS_R3` in `../build/scenes.html`. The voiceover is already
  produced and mixed against those exact in/out points; moving a beat desyncs the audio.
- **Copy is locked** to the Rev 4 table and the Owner's rulings — pain-first opening,
  `Get your free growth audit.` as the single CTA, the audit seeded at 50.6s so the
  endcard is never new information.
- **Claim boundaries** from `company/services.md` §0: no revenue promise, no guaranteed
  results, no private-account analysis, nothing about un-supplied information.
- No price, no client name, no invented metric, no generated brand mark.

## Open, for the Owner

1. **The dark ground is a direction proposal, not a decision.** `GROUND`/`INK` at the top
   of `edit.jsx` flip it back to the approved warm paper in one edit. `ACCENT` is the
   approved `#1B5FA8` lifted to `#3C86D8` so it reads on dark; `ACCENT_D` keeps the
   approved value for large fills.
2. **No generated imagery yet.** Every pixel is a native clip. Stills would cost roughly
   1.5 credits (12 images at the 0.12 cr rate); Seedance motion is 32.5 cr/clip. Neither
   fires without a stated count and a go.
3. **Eight thin frames remain** at the hard cuts (sd 3.5–7.9, 299–608 colours). Not blank,
   but quiet. The opening frame is the thinnest — worth attention given `hook inside 2s`
   was already a scoring axis at 6.
4. **Not gated.** Machine QC only, deliberately — see
   `knowledge/learnings/2026-08-31-first-artifact-in-ten-minutes.md`.
