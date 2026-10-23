---
title: "An all-AI scenario ad fails for a client that sells real experiences — real footage has to carry the people beats"
type: learning
client: tripnerd
owner: Karl
status: active
created: 2026-10-06
updated: 2026-10-06
tags: [ai-video, realism, client-rules, skeptic, critic, higgsfield, kling]
---

# An all-AI scenario ad fails for a client that sells real experiences — real footage has to carry the people beats

## What we did
Built "One Text", a 15 s TripNerd Reel made entirely from generated scenes (Kling 3.0 pro
image-to-video from GPT Image keyframes): a texting hook, a walk through a clubhouse, six friends
at a terrace rail, an end card with the real logo. 40.75 credits; machine QC passed 12/12.

## What happened
| Gate | Result |
|---|---|
| QA1 machine harness | PASS (all rows) |
| Creative critic (ServicePow-6) | HARD FAIL 5.8 ± 1.5 (floor 8.0) |
| Skeptic Pass 3 (isolated) | BLOCK — 1 × S4, 3 × S3 |

**Source:** `clients/tripnerd/campaigns/2026-10-06-one-text/qc/` (verbatim verdicts).

Both independent reviewers converged on the same root causes:
1. The client's own approved plan bans AI people; the master had zero real footage to "bridge".
2. A fictional venue under an AI label undercuts a brand whose live ads claim real guests
   ("the experience company that had to fake the experience").
3. Generic: the logo-swap test fails — any concierge could run it; the product (marquee sports
   access) is never shown.
4. Technical clean ≠ good: near-silent audio and a hero footwear change across clips
   (white → black → white) passed the machine harness and my own QA2.

## What we think it means
For clients who sell a real, visitable experience (hospitality, travel, venues), generated
people should not carry the story. Real client footage carries every people beat; AI is limited
to short, labelled, person-free bridges (or hands-only POV). Check the client's own AI rules at
concept stage, not at the gate: the concept pack offered all-AI concepts to the owner, and the
owner picked one.

Process fixes: QA2 must compare wardrobe item by item across clips (shoes included); preflight
runs before generation; audio gets a real bed before the gate.

**Confidence:** Medium — one ad, two independent reviewers agreeing; no audience data (never posted).
