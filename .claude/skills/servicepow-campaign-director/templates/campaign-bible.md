---
title: "<CLIENT> — <CAMPAIGN NAME>"
type: campaign-bible
client: <client-slug>
campaign_id: <YYYY-MM-DD-short-slug>
status: DRAFT
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
tags: [campaign, bible]
---

# <CLIENT> — <CAMPAIGN NAME>

> **This file is the single source of truth for this campaign.** One campaign, one idea, one
> world, one message. Every skill reads it before acting and writes only its own section —
> section ownership, read/write rules and the approval-state chain are defined in the Campaign
> Director's bible contract. Disagreement goes to `## CONFLICTS` — never a silent rewrite.
>
> Evidence labels are mandatory on every material statement:
> **CONFIRMED · INFERRED · UNKNOWN · HYPOTHESIS**.

| | |
|---|---|
| **Campaign ID** | |
| **Client** | |
| **Product / service** | |
| **Platform(s)** | |
| **Objective** | |
| **KPI + target** | |
| **Budget (credits / $)** | |
| **Approval status** | DRAFT |

---

## 1. Ground truth
*Owner: `servicepow-client-intelligence` (including §1.1 and §1.2). Never invent. Label
everything.*

**Business:**
**Product / service:**
**Geography / service area:**
**Pricing / offer mechanics:**
**Competitors:**
**Differentiation:**
**Proof available (Evidence Record IDs where filed):**
**Objections:**
**Buying process:**
**Existing assets:**
**Constraints (legal, licence, brand):**

### 1.1 Voice of customer
*Real customer language only. No invented personas. Cite sources.*

**Repeated pains:**
**Desired outcomes:**
**Customer's own words (verbatim):**
**Buying triggers:**
**Fears:**
**High-intent moments:**

### 1.2 Open UNKNOWNs blocking work
| Question | Blocks | Role that can answer |
|---|---|---|
| | | |

---

## 2. Strategy
*Owner: `servicepow-strategy`.*

### Offer verdict
**Is the offer strong enough to advertise?** STRONG / ADEQUATE / WEAK — *no prettier video
fixes a weak proposition; if WEAK, say what would fix it before spending.*
**Reasoning:**

**Target:**
**Awareness level:**
**Core message:**
**THE ANGLE (chosen, and the ranked alternatives):**
**Core promise:**
**Proof strategy (Evidence Record citations or acquisition plan):**
**Objection strategy:**
**Platform:**
**CTA:**
**Success metric:**

---

## 3. Creative concept and pack
*Owner: `servicepow-creative-director`.*

**APPROVED CONCEPT FAMILY:**
**Why this one:**
**ANGLE (one line, inherited from §2):**
**Client's last three angles** *(pasted as rotation evidence — no paste means the angle gate
(BC-24) did not run):*
1.
2.
3.

**Anti-Generic Gate — logo-swap and memory tests (BC-24):** *(Could a competitor run this
exact ad changing only logo, name and CTA? YES → rework a meaningful element.)*

**Stakes check:** wants · could miss · continues if unsolved · success feels like · why now

### The pack — 3–5 hook variants
*(One concept family, shared body/payoff/CTA, different opening. A single one-off ad is the
exception and needs a reason written here.)*

| Variant | Hook mechanism | First frame / action / text / audio | Why this target stops | Expected failure mode |
|---|---|---|---|---|
| A (lead) | | | | |
| B | | | | |
| C | | | | |

**Hook Tournament:** ___ candidates in → ___ survivors. *(Or the written exemption and its
reason.)*

**Rejected concepts and beaten hooks, and why:** *(kept — the reasoning is the asset, and the
beaten hooks are where the next pack starts)*

---

## 4. Creative spine
*Owner: `servicepow-creative-spine`. The anti-choppy authority.*

**Core message:**
**Core promise:**
**Primary emotion:**
**Viewer starting state:**
**Viewer ending state:**
**Narrative question:**
**Why the viewer keeps watching:**
**Final payoff:**
**CTA logic:** *(why this action follows naturally from what they just saw)*

### Beat map
| # | What viewer knows before | What happens | What viewer knows after | Emotional change | Why this beat exists | Leads into |
|---|---|---|---|---|---|---|
| 1 | | | | | | |

---

## 5. Script
*Owner: `servicepow-script-director`. Written to be spoken, not read. Includes performance
marks, per-beat mapping, timing estimate, Evidence Record IDs beside every claim, and the
verbatim declared-lines list (the downstream input for BC-27).*

---

## 6. Storyboard
*Owner: `servicepow-storyboard-director`. No filler shots — every shot earns its place.
Full storyboard with all ten fields per shot lives in `shotlist.md` beside this file;
summary here.*

| # | Beat | Dur | Story job | Source (generate / reference / real / composite) | Motion axis (BC-31) | Real reference cited (BC-34) |
|---|---|---|---|---|---|---|
| | | | | | | |

**Visual language:**
**Camera language:**
**Lighting language:**
**Colour language:**
**Feeling Spec:** *(pointer or inline)*
**Sound Spine:** *(pointer or inline)*

---

## 7. Cast and performance
*Owner: `servicepow-human-performance-realism`.*

**Characters:**
**Character references (real files, cited):**
**Per-beat actor briefs (want / feel / think / just happened / looking at / hiding /
intensity):**
**Restraint instructions:**
**Inspection verdicts on generated footage (ACCEPT / FIX / REGENERATE / REDESIGN SHOT, with
the specific tell):**

---

## 8. Continuity annex
*Owner: `servicepow-continuity-supervisor`. Detail in `continuity/`. The audio entry here is
cross-shot CONSISTENCY expectations only — audio design belongs to §11.*

**Character bible:**
**Product bible:**
**Location bible:**
**Lighting bible:**
**Camera bible:**
**Colour bible:**
**Audio bible (room tone / ambience expectations that must hold across shots):**
**Per-shot drift verdicts (field · ruling · action):**
**Temporal state table:**

---

## 9. Brand and product fidelity
*Owner: `servicepow-brand-fidelity`. Identity assets enter production only as real client
files, composited — per the company brand-assets policy (BC-21).*

**Brand references (real client files, cited):**
**Product references:**
**Identity-asset inventory (each identity asset → the real file it traces to; missing assets
named):**
**Per-shot COMPOSITE determinations (recorded in the storyboard's source field):**
**Legal / licence copy that must appear, with placement constraints:**
**Review verdicts per asset (PASS / FAIL + reason):**

---

## 10. Production plan
*Owner: `servicepow-higgsfield-production`. The shot chooses the method; the method and live
tool state choose the model — models, costs and balances are queried at run time per the
generation-and-spend policy, never written here as fixed facts.*

**Production method per shot:** full generation / reference-driven / real product + AI env /
real footage + AI / compositing / traditional edit / hybrid
**Model routing (per-shot table with reason, backup, references, risks, expected cost):**
**Credit budget:**   **Spent to date:**
**Regeneration strategy:**
**Known production risks:**

---

## 11. Audio design
*Owner: `servicepow-audio-director`. Cross-shot audio consistency expectations live in §8;
this section is the audio design itself.*

**Audio language (room-tone map per location, ambience, foley, product sounds):**
**Music direction (keyed to the beat map, with the state change per beat):**
**Silence placement (with the beat each silence serves):**
**Per-cut audio bridging (J-cuts, L-cuts, sound bridges, keyed to the cut list):**
**Crowd-vocal treatment per crowd shot:**
**Beds routed to speech-free verification (BC-26):**
**Declared lines confirmed verbatim for master speech verification (BC-27):** ☐

---

## 12. Edit logic
*Owner: `servicepow-cinematography-editor`.*

**Cut list with a stated reason per transition:**
**Pacing notes:**
**Screen grammar (180-degree line / screen direction / eyelines / geography / match on
action):**

---

## 13. QC verdict — gate 1 of 2: the score
*Owner: `servicepow-creative-critic`. Independent evaluation — issued without reference to,
or waiting on, §14.*

**Verdict:** NOT RUN / HARD FAIL / REVISE / CLIENT READY / CANNOT ASSESS
**Card used:** ServicePow-6 (client-facing) / rough card *(rough cuts only — may never clear
a deliverable)*
**ServicePow-6 result:** *(reported as `midpoint ± 1.5`, gated on the midpoint, no offset
applied — BC-22)*
**Lead variant scored in full:**   **Siblings scored on hook / flow / CTA:**
**AI-artifact risk (n/10) and what gives it away:**
**Registry verification status (passed / failed / could-not-run, by BC id):**
**Semantic hard failures (timestamps or shot numbers, or "none"):**
**Specific fix per failure, routed to the owning skill:**
**Human watched end to end (BC-25):** ☐
**Human Taste Gate (answered by the APPROVER — proud to put our name on this?):** ☐

---

## 14. Skeptic verdicts — gate 2 of 2: the attack
*Written by: `servicepow-campaign-director`, transcribing the isolated Skeptic subagent's
verdict blocks verbatim; content authored by `servicepow-skeptic`, which never receives
production reasoning and never writes this file itself. Both gates must pass; a score never
argues down a severity (BC-23).*

| Pass | Artifact | When | Verdict (PASS / CONDITIONAL / BLOCK / VOID / NOT RUN) | Highest severity |
|---|---|---|---|---|
| 1 | storyboard | before any generation spend | | |
| 2 | candidate footage | before the edit locks | | |
| 3 | finished master | before delivery | | |

**Verdict transcripts (verbatim):**

**Findings (S3 or S4 blocks; a VOID blocks):**
**CONDITIONAL acceptances (each issue individually, accepted by the APPROVER):**
**Re-run after repair (fresh subagent, fresh packet):** ☐

---

## 15. CONFLICTS
*Append-only. Raised by any skill, resolved only by `servicepow-campaign-director`.*

<!-- ### CONFLICT <date> · raised by <skill> · status: OPEN
**Approved decision:**
**Problem:**
**Evidence:**
**Proposed change:**
**Cost of not changing:**
-->

## 16. Decision log
| Date | Decision | By (role) | Why |
|---|---|---|---|
| | | | |
