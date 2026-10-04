---
title: "Monday 5 Oct Story — gate log"
type: report
client: tripnerd
owner: Karl
status: active
created: 2026-10-04
updated: 2026-10-04
tags: [client, instagram, stories, qc, gates]
---

# Monday 5 Oct Story (poll): gate log

Every version went to a fresh critic and a fresh isolated Skeptic, each in its own folder. Images are not committed because they show guests' faces. They live in the session scratchpad and are rebuilt from `tripnerd-launchweek-poll-H1-story-v4.spec.json`.

| Version | What it was | Critic | Skeptic | Key findings |
|---|---|---|---|---|
| v1 | `TN-story-01-morning-poll-bg.png`: bar set-up at 9:05, "Thursday in Augusta. / 9:05 AM, on the veranda." | not gated | not gated | Superseded before gating: liquor labels, a bartender, the bar being set up, an unconfirmed place |
| v2 | Upscaled pine canopy, "Augusta week. / Been, or bucket list?" | **HARD FAIL 6.4** (BC-52 contrast 3.1–3.7:1; BC-51 not sRGB; no human presence) | **BLOCK** (S4: in October, "Augusta week" reads as "it's tournament week now") | Generic, the question duplicated, soft upscale |
| v3 | Lawn group at native resolution, hand layout, "Augusta in April. / Our guests, Thursday 9 April 2026." | — | **BLOCK** (S4 ×2: no filed venue confirmation; no client consent confirmation. S3: the tournament Thursday plus a golf-course backdrop implies on-grounds, where phones are barred) | The poll band is only about 380 px |
| v4 | v3 composed through `servicepow_static_compose` (Inter, chips, CTA, sRGB); static QC 17/17 PASS | **HARD FAIL 7.4** (BC-53 logo: no approved logo file; BC-16/20/21 records missing; BC-55 human half: the date and photo carry a "Masters" meaning without the word) | see below | The poll band is about 260 px. "Been" has no object |

## Conclusion (campaign-director, 2026-10-04)
- **The blockers are client inputs, not production:**
  - the venue's city and name;
  - guest consent, in writing from TripNerd;
  - whether a Masters-week trip is offered at all;
  - real logo files.
- **No Augusta-themed Story can clear until TripNerd answers.** All of these are asked for in [`../2026-10-04-message-to-tripnerd.md`](../2026-10-04-message-to-tripnerd.md).
- **The next version, once TripNerd replies:**
  - name the venue, with no tournament date;
  - put the real logo file on it;
  - ask a poll that names the trip;
  - reserve a measured poll band;
  - grade a device screenshot.
