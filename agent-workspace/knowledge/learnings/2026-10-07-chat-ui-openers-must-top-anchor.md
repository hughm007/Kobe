---
title: "A bottom-anchored phone-chat opener puts every new message under the platform UI — top-anchor short threads"
type: learning
client: internal
owner: Karl
status: active
created: 2026-10-07
updated: 2026-10-07
tags: [video, paid-social, safe-area, bc-28, chat-ui, motion-graphics]
---

# A bottom-anchored phone-chat opener puts every new message under the platform UI

## What we did

The TripNerd "Golf Boys → TripNerd. Booked." 9:16 ad opens with a 6.7s animated group chat:
- full-screen phone UI;
- typing indicators, then message bubbles popping in;
- the hook line, and the only brand mention before the end card, is the last bubble ("TripNerd. Booked.").

The first build anchored the thread to the bottom, above the compose bar, and scrolled it up as each bubble arrived. That is how a long thread behaves in a real messaging app.

## What happened

The isolated Skeptic and the Creative Critic both failed the cut on BC-28 (burned text inside 15–70% of frame height). An adversarial verifier then measured the frames.

| Element | Bottom-anchored (v9) | Top-anchored (v9.1) |
|---|---|---|
| Hook bubble | 71–82% of height | 23–32% |
| Each new bubble / typing indicator | 79–88% | 23–69.5% (last line) |
| "TripNerd. Booked." | 83.5–88.3% height, to 95% width | inside 23–69.5% |
| Status-bar time / "iMessage" placeholder | 3% / 92–96% (text, plus an Apple wordmark) | removed (icons only, empty compose field) |
| Opening frame | ~75% empty white, first bubble at 0.35s | hook bubble on screen from 0.15s |

**Source:**
- v9 gate run `wf_b353dfc5-571`: Skeptic and Critic reports plus verifier pixel measurements.
- v9.1 measurement: `cf10/` frames, bounding rows of non-background pixels per frame.
- Script: `clients/tripnerd/campaigns/2026-10-06-missing-the-moment/v9.1/chat-animation.py`.

## What we think it means

Bottom anchoring is the natural "realistic" choice, but in 9:16 paid social it parks the newest line, which is the line the viewer is reading, under the caption and username overlay. A short thread (six bubbles or fewer) top-anchored under the header is just as true to life, because real apps top-anchor until the screen fills, and it keeps every word in the safe band. Phone chrome text is burned text too: the status-bar clock, the placeholder, and the platform name.

**Confidence:** High for the geometry, which is measured. Not yet tested: whether a top-anchored opener stops the scroll as well as the bottom-anchored one.

## How far it generalises

- ☐ Specific to this client
- ☐ Likely true for this industry / audience type
- ☑ Likely true for this channel generally (any 9:16 placement with bottom overlays)
- ☐ Probably a general principle

It transfers to any on-screen UI mock: chat, notifications, search bars, DMs.

## What we'd do next

- Make "top-anchor, no platform wordmarks, chrome text only inside 15–70%" the default for any phone-UI motion graphic.
- Run the source-QC `--safe-area` check on the chat frames before assembly rather than at the gate.

## Promotion

- ☐ Added to [`../index.md`](../index.md)
- ☐ Seen before? Related: [`2026-08-31-placement-relative-copy-reading.md`](2026-08-31-placement-relative-copy-reading.md)
- ☐ Third occurrence → promote into a playbook and link back from here

## Related

- `clients/tripnerd/campaigns/2026-10-06-missing-the-moment/campaign-bible.md` (v9 gate, v9.1 repair)
