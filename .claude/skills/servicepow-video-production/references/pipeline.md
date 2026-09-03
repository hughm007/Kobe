# The executable pipeline — stage by stage, with the proven fixes
Codified from the first complete client-brand production (17s 9:16, machine QC 12/12,
2026-09-02). Each rule below was paid for; do not re-learn them.

## Stage rules that came from real failures
| Stage | Rule | What it cost to learn |
|---|---|---|
| Preflight | Verify the model exposes the resolution QC will demand | 20 cr on a model with no >=720p param |
| Preflight | Scan prompts for motion language before spend | 8 near-static prompts headed for the motion gate |
| Generate | `generate_audio false` always — silent visual master | Owner verdict: built-in audio fails the bar |
| Generate | Content moderation can false-positive on benign trade content ("nsfw" on a dripping pipe); plan schedule slack for it | 1 blocked job, auto-refunded |
| Recover | On ANY client-side failure, check the vendor job list before regenerating — completed jobs are already paid for | 3 incidents, 108 cr recovered |
| Recover | A missing file during an ACTIVE run is not evidence of failure — check completion first | 1 false tooling conclusion, retracted |
| Assemble | Never stream-copy concat across mixed-fps sources; use the concat FILTER with fps=30,settb=AVTB | A silently frozen tail that ate the endcard |
| Assemble | The machine harness's frozen-section gate catches concat corruption — read its finding before assuming "designed endcard" | The same incident, initially misread |
| Audio | Trim leading/trailing silence before judging whether a voice fits a timing window | A 3.58s line that was really 1.69s |
| Audio | Voice selection floor: fits the locked timing windows first, taste second | 1 candidate voice eliminated on pacing |
| Audio | Mux at 48kHz explicitly (`aresample=48000`) — mixes inherit odd rates | 1 QC audio failure |
| Text | Composite from real glyphs (PNG overlay). ffmpeg may lack drawtext; render via Pillow | 3/3 generated-text runs had defects |
| Brand | Real files only, hash-verified against the asset register (LB24) | The rule held; keep it held |
| Physics | Opaque metal stays closed and opaque; leak action shows EXTERNALLY (drip from nut, moisture, puddle); sink water goes faucet -> basin -> drain | 1 rejected output with an open pipe end |
| References | Full-scene reference images cause DUPLICATION of scene/person, not principle transfer — rights-unusable | 2/2 copied outputs |
| References | Never use an AI-generated image as ground-truth reference for judging physical correctness | 1 invalid experiment |
| Variants | Shared elements generate once and are inherited; hooks vary | 43% reuse before any spend |

## Learning capture
Every generated asset writes one observation row:
`model · shot_job · risk_class · reference_used · prompt_version · cost · time ·
accept/reject · failure_reason (closed vocabulary) · realism · physical · advertising ·
client_confidence`
Rejection vocabulary lives in `qa2-physical-realism.md`. One result = observation; two
similar = provisional pattern; three controlled = candidate rule; cross-client = capability.

## The economics to record per ad
brief -> first viewable time · brief -> client-ready time · credits · rejected generations ·
targeted repairs vs full rebuilds · reuse % · human interventions · owner score.
The target curve: ad #2 for a client measurably cheaper than ad #1.
