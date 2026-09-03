---
title: "Model performance observations — provisional, from the Run 9/10 test only"
type: learning
client: internal
owner: APPROVER
status: active
created: 2026-09-02
updated: 2026-09-02
tags: [video, models, routing, provisional]
---

# Model performance observations (PROVISIONAL — re-evaluate as models change)

**These are observations from one owner review of one test batch. They are not permanent
claims about any model.** Re-test on a controlled shot spec before treating any line as
settled. Every row must be re-validated when a vendor ships a new version.

| Generator | Observed strength | Observed weakness | Provisional role |
|---|---|---|---|
| **Soul Location** | Residential exteriors, neighbourhoods, streets, surrounding scenery — among the strongest realistic output observed | Not evidence of strength for anything else | Candidate for neighbourhood establishing, residential exteriors, arrival environments, service-area atmosphere |
| **Seedance 2.0** | Generally realistic; stronger than Veo 3.1 Lite on much photoreal motion | **Phone/device output read as obviously AI.** Object correctness and object-scene interaction failed the "real phone someone owns" test | Realistic-motion candidate, but device/tool/hand/screen shots need reference grounding + object QA |
| **Veo 3.1 Lite** | Cheap (4 cr vs 36 cr at 1080p). Fast (~40s vs ~3min) | Below Seedance and Soul Location on observed realism. **Exposes no resolution >=1080p — structurally cannot pass our resolution gate** | Cheap previs / concept testing lane. Not a client-grade final lane |
| **Nano Banana (illustrated)** | Illustrated/drawn imagery materially cleaner, more controlled, more communicative. Owner ~7/10 vs ~4/10 realistic | Not photoreal, by design | Deserves its own intentional production lane, not treated as failed realism |
| **Cinematic Studio Image** | High apparent realism | **Mechanically wrong** — wrench positioned/oriented incorrectly relative to the fitting | Never accept on visual appeal alone; must clear trade-correctness QA |

## The architectural conclusion
**Stop searching for one best video model.** The right abstraction is a **shot-level router**:
the job of the shot selects the generation method. A campaign does not have a model; a shot
does. The router is provisional and must learn from accepted/rejected outcomes.

## The non-obvious one
**Beautiful B-roll is not evidence of a good advertisement.** Run 9 produced technically
competent, well-lit, correctly-exposed footage that advertised nothing. Visual quality and
advertising quality are independent axes, and only one of them was being measured.
