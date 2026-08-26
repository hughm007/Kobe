# Service Pow skill tests

Structural checks are automated (`../scripts/validate_skills.py`, 15/15 passing).
The tests below are behavioural and are re-run by reading them and confirming routing.

---

## 1. Positive trigger tests

| Karl says | Must fire |
|---|---|
| "Make an ad for 911 Drain" | `servicepow-campaign-director` |
| "Build a campaign for TripNerd" | `servicepow-campaign-director` |
| "Rebuild the 2:07 AM ad" | `servicepow-campaign-director` |
| "What do we actually know about 911 Drain's customers?" | `servicepow-client-intelligence` |
| "What do customers say about drain companies?" | `servicepow-client-intelligence` (VOC mode) |
| "Is this offer strong enough to advertise?" | `servicepow-strategy` |
| "What's the angle here?" | `servicepow-strategy` |
| "Give me three concepts" | `servicepow-creative-director` |
| "This feels choppy / like unrelated clips" | `servicepow-creative-spine` (design) or `servicepow-cinematography-editor` (assembled) |
| "Build the beat map" | `servicepow-creative-spine` |
| "This dialogue sounds robotic" | `servicepow-script-director` |
| "Break this into shots" | `servicepow-storyboard-director` |
| "Which model should we use for this shot?" | `servicepow-higgsfield-production` |
| "What can Higgsfield do now?" | `servicepow-higgsfield-intelligence` |
| "This person looks fake / dead-eyed" | `servicepow-human-performance-realism` |
| "Does this shot match the last one?" | `servicepow-continuity-supervisor` |
| "Can we just generate the logo?" | `servicepow-brand-fidelity` (answer: no — LB24) |
| "Why are we cutting here?" | `servicepow-cinematography-editor` |
| "The audio feels off" | `servicepow-audio-director` |
| "Is this ready to send?" / "QC this" | `servicepow-creative-critic` |

## 2. Negative trigger tests — must NOT fire

| Karl says | Must NOT fire | Correct destination |
|---|---|---|
| "Write a Seedance prompt for one shot" | campaign-director, storyboard-director | `higgsfield-seedance-prompt` |
| "Animate this logo" (no campaign) | campaign-director | `motion-design` |
| "Draft the client's monthly report" | any advertising skill | `playbooks/client-lifecycle/reporting.md` |
| "Fix this Python test" | all servicepow-* | normal coding |
| "Make me a picture of a sunset" | campaign-director, creative-director | direct generation + cost ladder |
| "What's our pricing?" | client-intelligence | `company/pricing-and-packaging.md` |
| "Build the 911 Drain website" | campaign-director | web playbook |

### The known collision — three skills claim "make an ad video"

**Before:** `motion-design` ("Always use this skill" for *ad video*),
`higgsfield-seedance-prompt` ("Always consult… before writing any Seedance prompt") and
`seedance-shotlist-director` (any script → prompts) all claimed the same request.

**Resolution (hierarchy, by specificity):**

| Request shape | Winner |
|---|---|
| Campaign / client / advertisement | `servicepow-campaign-director` → routes internally |
| Shot list for an approved Service Pow campaign | `servicepow-storyboard-director` |
| One standalone shot's prompt | `higgsfield-seedance-prompt` |
| Standalone connector run, no campaign, no client | `motion-design` |
| Non-campaign script → shot list | `seedance-shotlist-director` |

`servicepow-*` descriptions state their exclusions explicitly, so the project skills win on
specificity for client work. **Residual risk:** `motion-design` still says *"Always use this
skill"* — if it misfires on campaign work, retune its description. It is a synced skill, so edit
it at source (claude.ai), not locally, or the sync overwrites it.

## 3. Output contract tests

| Skill | Must produce |
|---|---|
| campaign-director | Bible created at the right path; approval status set; decisions logged |
| client-intelligence | Bible §1 with every material line evidence-labelled; blocking UNKNOWNs listed |
| strategy | Explicit offer verdict; ≥3 angles differing in argument; ranked |
| creative-director | ≥3 concepts; ten-companies result recorded per concept |
| creative-spine | Beat map with no blank cells; unbroken leads-into → knows-before chain |
| storyboard-director | Every shot has purpose/before/adds/next + motion axis |
| higgsfield-production | Method chosen before model; cost estimate vs budget before spend |
| creative-critic | Verdict + hard-failure list + ServicePow-6 + AI artifact risk |

## 4. Edge-case tests

| Situation | Required behaviour |
|---|---|
| Client folder does not exist | campaign-director stops and reports — does not invent a client |
| No customer research available | client-intelligence writes VOC as UNKNOWN with sources tried; downstream language is labelled HYPOTHESIS |
| Offer is weak | strategy returns WEAK and stops; no creative work proceeds |
| Required brand asset missing | brand-fidelity surfaces it by name; never generates a substitute |
| Capability map stale | higgsfield-production refuses to route; runs intelligence first |
| Creative unavailable at QC | critic returns CANNOT ASSESS — never a pass |
| Karl pushes a weak angle | strategy ranks it honestly, recommends the stronger, proceeds if reaffirmed, logs it |

## 5. Composition test — one campaign, no contradictions

Chain: director → client-intelligence → strategy → creative-director → creative-spine →
script-director → storyboard-director → brand-fidelity + continuity + performance →
higgsfield-production → editor → audio → critic.

**Contract:** each writes only its own Bible section; each reads the sections upstream of it.
Section ownership is enumerated in `../references/campaign-bible-contract.md` with no section
owned twice — verified by inspection, no overlaps.

**Deliberate-conflict test:** when a downstream skill is given a spine it cannot execute, it must
append a `## CONFLICTS` entry and stop — never silently rewrite. Verified below in the pilot.

## 6. Regression test

The killed v8 "2:07 AM" ad (see `pilot-2am-critic.md`) **must keep failing** after any change to
the critic or the scorecard. If a scorecard edit ever lets v8 pass, the edit is wrong.
