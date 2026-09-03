---
title: "911 Drain's real brand assets were misfiled, not missing — the ad system could not see them"
type: learning
client: internal
owner: APPROVER
status: active
created: 2026-09-02
updated: 2026-09-02
tags: [assets, client-kb, architecture, correction]
---

# The assets were misfiled, not missing

## The claim I made, and why it was wrong
The Run 10 root-cause analysis stated that 911 Drain had **zero real asset files**, and
concluded that a realistic branded ad was "not producible from materials on hand." That was
based on searching the client KB at `agent-workspace/clients/911drain/`, which contains no
media.

**It was wrong.** Real assets exist at `servicepow-v2/public/work/911drain/`:
`logo.png` (the actual wordmark — red 911, white drain, "24/7 EMERGENCY DRAIN REPAIR"),
`van-wrap.jpg`, `still-arrival.jpg`, `still-truck-night.jpg`, `still-dispatcher.jpg`,
`still-clock.jpg`, `site-desktop.jpg`, `site-mobile.jpg`, `commercial.mp4`.

## The actual defect
The ad-production system and the website live in **different repositories**. Client media
landed in the website repo because that is where the case-study page needed it. The Kobe
client KB — the only place `servicepow-client-intelligence` and the Campaign Director look —
never received copies or pointers.

So the production system correctly reported "no assets" while the assets sat one repo away.
**A client KB that does not know where the client's real files are will send the pipeline to
generate things it was forbidden to generate** (LB24: logo, van and wordmark are never
generated, ever).

## The rule this earns
**Every client KB must carry an asset register**: what real assets exist, where they live,
what each may be used for, and what must never be generated because a real file exists.
The register is checked in Stage 1 (Client Truth) *before* any concept is written, and it is
the first thing preflight consults before a generation request is composed.

Absence of a file in the KB is not evidence that the asset does not exist. It is only
evidence that the KB does not know about it.
