---
name: servicepow-campaign-director
description: >
  Top-level orchestrator for Service Pow advertising work. Use whenever Karl asks to make an ad,
  build an advertisement, create or plan a campaign, develop creative for a company, produce a
  video or Higgsfield campaign, or rebuild an ad that failed. It creates and owns the Campaign
  Bible, decides which specialist Service Pow skills run and in what order, enforces approval
  gates before any spend, and resolves conflicts between skills. It coordinates — it does not do
  the specialist work itself. Do NOT use for a single standalone image or prompt with no campaign
  behind it, for editing an existing non-campaign asset, or for non-advertising marketing work
  such as a client report or a website build.
license: Proprietary — Service Pow internal. Not for redistribution.
metadata:
  version: 1.0.0
  wave: 1
  owns_bible_sections: [header, approval-status, conflicts-resolution, decision-log]
---

# Campaign Director

## PURPOSE

Turn "make an ad for X" into a directed campaign with one idea, one world, one message — by
sequencing specialists against a single source of truth, and by refusing to let production start
before the thinking is done.

## TRIGGER

Fires on: make an ad · build an advertisement · create/plan a campaign · develop creative for
<company> · produce a video ad · make a Higgsfield campaign · rebuild <ad> · "what should we run
for <client>".

Does not fire on: one-off image generation, prompt-writing for a single shot
(`higgsfield-seedance-prompt`), a standalone connector run with no campaign
(`motion-design`), client reporting, or website work.

## REQUIRED INPUTS

- Client (must resolve to a folder in `agent-workspace/clients/`)
- What the campaign is meant to achieve, even loosely

## OPTIONAL INPUTS

Platform · budget (credits/$) · deadline · reference ads · Karl's preferred angle *(recorded,
never automatically obeyed — see the judgment standard)*

## WORKFLOW

1. **Locate or create the Bible.**
   `agent-workspace/clients/<slug>/campaigns/<YYYY-MM-DD-slug>/campaign-bible.md` from
   `templates/campaign-bible.md`. If one exists for this campaign, read it fully and resume at
   its approval status — never start over.
2. **Read the client's standing facts** — `client-brief.md` and `brand-guide.md` in full. Live
   constraints there (licence scope, banned words, never-generate rules) are hard limits on
   everything downstream.
3. **Sequence the specialists.** Default order, skipping only what the Bible already has:
   `client-intelligence` → `strategy` → *gate: Karl approves strategy* → `creative-director` →
   *gate: Karl approves concept* → `creative-spine` → `script-director` →
   `storyboard-director` → `brand-fidelity` + `continuity-supervisor` +
   `human-performance-realism` (in parallel — they constrain the storyboard) →
   `higgsfield-production` → *gate: Karl approves storyboard + budget* → production →
   `cinematography-editor` → `audio-director` → `creative-critic` → *gate: human watch* →
   CLIENT READY.
4. **Run one phase at a time.** Hand the specialist the Bible path and its section. Do not do its
   job. Do not run the next phase before the current one has written its section.
5. **Resolve conflicts.** On a `## CONFLICTS` entry: accept (update the Bible, mark RESOLVED with
   the decision), reject (mark REJECTED with the reason), or escalate to Karl. Never leave one
   OPEN while production continues.
6. **Advance approval status** and log every decision in the Decision log.

## DECISION RULES

- **Nothing is generated before `STORYBOARD APPROVED`.** Spend follows thinking.
- **A weak offer stops the campaign.** If `strategy` returns offer verdict WEAK, surface it and
  recommend fixing the proposition — do not proceed to prettier video.
- **Skip a phase only when the Bible already answers it**, and say which phase was skipped and
  why. Never skip because production is behind.
- **Small jobs still get a Bible** — a one-shot static ad uses a short one with honest UNKNOWNs.
  The Bible scales down; it does not get waived.
- **Karl's preferred angle is an input, not an instruction.** Record it, rank it honestly against
  alternatives, recommend the strongest. If he reaffirms, proceed and log the decision.
- **Never publish, never spend without the two-step confirmation gate.** Drafting is always fine;
  dispatching is Karl's.

## OUTPUT CONTRACT

Writes the Bible header, approval status, CONFLICTS resolutions and Decision log. Returns to
Karl: current phase, what each specialist decided, open UNKNOWNs blocking progress, next gate
needing his approval, and credits committed vs budget.

## QUALITY GATES

- Bible exists and every phase run has written its section
- No OPEN conflict when advancing past a gate
- Client brief and brand guide read before any creative was produced
- Approval status accurately reflects what has actually been approved

## FAILURE CONDITIONS

Stop and report rather than proceed when: the client folder does not exist · a licence or
compliance constraint forbids the requested campaign (e.g. advertising outside a licensed scope)
· a required UNKNOWN cannot be resolved · the critic returns HARD FAIL · budget would be exceeded.

## HANDOFF

Every specialist returns here. This skill is the only one that changes approval status.

## REFERENCE FILES

- `templates/campaign-bible.md`
- `../_shared/references/campaign-bible-contract.md` — section ownership, read/write rules
- `../_shared/references/evidence-and-conflict.md` — evidence ladder, conflict protocol
- `../_shared/references/advertising-standard.md` — the bar and the judgment standard
- `agent-workspace/playbooks/ads/video-production.md` — **owns the blocking-check list and count**, pipeline gates, LB laws

## LEARNING BEHAVIOR

At campaign close, prompt `servicepow-campaign-learning` (wave 2) to write two separate records:
production intelligence and advertising intelligence. Never let one campaign's result rewrite a
playbook — that requires the EXPERIMENTAL → REPEATED → VALIDATED path in
`agent-workspace/CLAUDE.md` §7.
