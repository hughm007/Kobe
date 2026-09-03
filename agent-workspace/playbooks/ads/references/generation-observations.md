---
title: "Generation observation log — schema and current evidence"
type: reference
client: internal
owner: APPROVER
status: active
created: 2026-09-02
updated: 2026-09-02
tags: [video, models, routing, learning-data]
---

# Generation observation log

Every generated asset produces one structured row. The point is to be able to answer
*"for a plumber actively using a tool, which generation path has historically passed most
often?"* rather than *"which model do we like?"*

## Row schema
`model · model_version · shot_job · risk_class · reference_used · reference_type ·
prompt_version · generation_cost · generation_time · accept_reject · failure_reason ·
realism_score · physical_correctness_score · advertising_usefulness_score ·
client_confidence_score`

`failure_reason` is a closed vocabulary: `AI_LOOK · BAD_ANATOMY · BAD_DEVICE · WRONG_TOOL ·
MECHANICALLY_IMPOSSIBLE · WRONG_TRADE · GENERIC · OFF_BRAND · BAD_MOTION ·
UNUSABLE_COMPOSITION · BAD_TEXT · CONTINUITY_FAILURE · WEAK_PERFORMANCE`.

## Risk classes — HIGH-RISK is no longer one category
Splitting it, because each needs different references, models and QA:

| Class | Contents | Evidence so far |
|---|---|---|
| LOW | environment, scenery, broad atmosphere | Soul Location observed strong on residential exteriors |
| MEDIUM | human presence, vehicle, work setting | untested under control |
| **HIGH-DEVICE** | phones, screens, interfaces | Seedance failed no-reference (Run 9). **Under test now.** |
| **HIGH-HUMAN/HAND** | hands, anatomy, contact | untested |
| **HIGH-TRADE/MECHANICAL** | tools, fittings, procedures | Cinematic Studio failed (wrench orientation); Seedance rendered wrong trade entirely |
| **HIGH-TEXT/UI** | on-screen text, call UI, captions | untested |
| **HIGH-BRAND/LOGO** | logo, wordmark, van wrap | **not a generation class — real files only (LB24)** |
| **HIGH-PRODUCT** | specific product interaction | untested |

A result in one HIGH class is **not** evidence for another. A device pass says nothing about
mechanical correctness.

## Known model constraints (measured, 2026-09-02)
- `seedance_2_0`: supports `image_references` (max 9; 12 total refs). **No seed parameter** —
  reproducibility cannot be seed-pinned, which is why reliability needs a repeat generation.
  `generate_audio` defaults **true** and must be set false for a silent visual master.
- `veo3_1_lite`: **no resolution parameter** — cannot reach 1080p, cannot pass the resolution
  gate. Cheap previs only (4 cr vs 36 cr; ~40s vs ~3min).
