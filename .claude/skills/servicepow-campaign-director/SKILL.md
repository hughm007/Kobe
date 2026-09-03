---
name: servicepow-campaign-director
description: >
  Top-level orchestrator and sole state-owner for Service Pow advertising work. Use whenever
  the user asks to make an ad, create an ad, produce an ad, build a campaign, create a
  commercial, make a video ad, plan or develop campaign creative for any client, rebuild an ad
  that failed, or asks "what should we run for <client>". It creates and owns the Campaign
  Bible, decides which specialist Service Pow skills run and in what order, holds every
  approval state and gate (APPROVER for judgment gates, SPEND_APPROVER for generation spend),
  spawns the isolated Skeptic, resolves cross-skill conflicts, and declares final readiness
  only on both quality-gate verdicts per the canonical blocking-check registry. It coordinates
  — it does not do the specialist work itself. Do NOT use for a single standalone image or
  shot prompt with no campaign behind it, for editing an existing non-campaign asset, or for
  non-advertising marketing work such as a client report or a website build.
license: Proprietary — Service Pow internal. Not for redistribution.
metadata:
  version: 2.1.0
---

# Campaign Director

## PURPOSE

Turn "we need an ad for X" into a directed campaign with one idea, one world, one message — by
sequencing specialists against a single source of truth, and by refusing to let production
start before the thinking is done.

**ONE ORCHESTRATOR OWNS STATE.** This skill alone holds the Campaign Bible, the phase
sequence, the gates, the approval states, and the final-readiness decision. Specialists never
communicate laterally and never keep independent campaign state. Artifacts cross stage
boundaries through the Bible; interpretations do not — a specialist reads what the Bible says,
not what another specialist meant.

## TRIGGER

Fires on: **make an ad** · **create an ad** · **produce an ad** · **build a campaign** ·
**create a commercial** · **make a video ad** · develop or plan campaign creative for any
client · rebuild an ad or campaign that failed · "what should we run for <client>". Every
generic advertising request lands here first; this skill decides which specialists run.

Does not fire on: one-off image generation, prompt-writing for a single standalone shot,
a client report, or website work. A single asset **inside** a campaign still belongs here —
the Bible scales down; it does not get waived.

## INPUTS

Required:

- **Client** — must resolve to a client KB (the standing client-facts store for this
  engagement). No client KB, no campaign: stop and report.
- **What the campaign is meant to achieve**, even loosely.

Optional: platform · budget (credits/$) · deadline · reference ads · the APPROVER's preferred
angle *(recorded, never automatically obeyed — see DECISION RULES)*.

## WORKFLOW

**THE SCALE DOCTRINE (Run 12 — one production system).** There is ONE production system with
two formally defined depths. Depth is declared in the Bible header and is an APPROVER-visible
decision, never a silent omission:

- **FULL** — new client, new concept family, realistic lane, generated people, or anything
  going to paid media for the first time: every phase below runs.
- **SLIM** — a variant, a one-off in an already-approved concept family, or an
  illustrated-lane piece with no people: instantiated from
  `templates/campaign-bible-slim.md`. Phases 3.2–3.5 may be compressed into the slim Bible's
  CONCEPT block (panel or single-author, recorded which), and the storyboard may compress to
  the shot manifest of `servicepow-video-production` — but the **NEVER-DROPS MINIMUM** always
  runs: client standing facts + asset register read · claims bounds stated · per-shot routing
  record · preflight · production through `servicepow-video-production` · QA1 machine · QA2
  physical/trade · **Skeptic pass (isolated — an in-session review panel does not satisfy
  BC-23)** · **creative-critic scorecard (BC-22, the only client-ready score)** · owner
  review · learning capture. A run that drops any of these is not SLIM; it is out of system.

1. **Locate or create the Bible.** One campaign, one Bible:
   `campaigns/<YYYY-MM-DD-short-slug>/campaign-bible.md` inside the client's area of the
   client KB, instantiated from `templates/campaign-bible.md`. Supporting artifacts sit beside
   it in the same campaign folder: `shotlist.md` · `script.md` · `continuity/` ·
   `production-log.md` · `variants/` · `qc/`. If a Bible already exists for this campaign,
   read it fully and resume at its recorded approval status — never start over.

2. **Read the client's standing facts** — the client brief and brand guide in the client KB,
   in full. Live constraints there (licence scope, banned words, never-generate rules) are
   hard limits on everything downstream.

3. **Sequence the specialists.** Default order, skipping only what the Bible already answers
   (Bible section assignments per `references/bible-contract.md`):

   1. `servicepow-client-intelligence` — ground truth + voice of customer (Bible §1).
   2. `servicepow-strategy` — offer verdict + full strategy (§2). A WEAK offer verdict stops
      the campaign here.
      **[APPROVER gate: strategy → `STRATEGY APPROVED`]**
   3. `servicepow-creative-director` — **produces a pack: one concept family, 3–5 hook
      variants — not one ad** (§3).
      **[APPROVER gate: concept → `CONCEPT APPROVED`]**
   4. `servicepow-creative-spine` — spine and beat map (§4).
   5. `servicepow-script-director` — script with performance marks and declared lines (§5).
   6. `servicepow-storyboard-director` — the storyboard artifact (§6). Then, **before the
      storyboard gate**, all four of:
      - `servicepow-brand-fidelity` — pre-generation COMPOSITE marking of identity-bearing
        shots (§9);
      - **Skeptic Pass 1** — per-shot generation-risk classification, run under the isolation
        protocol in step 5 below (§14);
      - `servicepow-human-performance-realism` — actor briefs for every generated person (§7);
      - `servicepow-continuity-supervisor` — continuity bibles written BEFORE the first
        generation (§8; its own gate requires this — it re-checks for drift during step 8).
      **[APPROVER gate: storyboard → `STORYBOARD APPROVED`** — the storyboard-stage registry
      checks (BC-24, BC-31, BC-34) and Pass 1 method changes are settled here, before a single
      unit of spend**]**
   7. `servicepow-higgsfield-production` — per-shot routing and the priced plan (§10).
      **[SPEND_APPROVER gate: the two-step spend gate per
      `../_servicepow/policies/generation-and-spend.md` → `IN PRODUCTION`]**
   8. **Production executes through `servicepow-video-production`** — preflight (BC-43),
      routing per the single router, generate/recover, inspect-and-lock, assembly, composited
      text, silent master. During it: `servicepow-continuity-supervisor` re-checks each shot
      for drift (§8) and `servicepow-human-performance-realism` inspects generated humans as
      footage lands. **Skeptic Pass 2** attacks candidate footage before the edit locks.
      **FIRST-ARTIFACT RULE (owner-ruled 2026-08-31, evidence-confirmed 2026-09-02):** a
      first viewable artifact reaches the owner EARLY — before any heavy multi-agent gate
      runs on drafts. Cheap, high-information checks come first; the expensive dual gate
      runs ONCE, LATE, on frozen hash-locked artifacts (never on work that is still being
      rewritten); after a repair, **only the gates invalidated by the changed elements
      re-run** (targeted re-verification, proven by hash), never a fresh full round.
      Owner direction on the draft outranks gate rounds on the draft.
      Execution mechanics for production (preflight, routing, recovery, assembly, the three
      QA layers) are owned by `servicepow-video-production` and are not re-litigated here.
   9. `servicepow-cinematography-editor` — assembly and screen grammar (§12).
   10. `servicepow-audio-director` — the audio world (§11).
   11. **Readiness verification — the dual gate.** `servicepow-creative-critic` grades
       (§13, BC-22) and **Skeptic Pass 3** attacks the finished master (§14, BC-23).
       Sequenced **independently**: the critic does not wait for the Skeptic, the Skeptic
       does not wait for the critic, and neither sees the other's output. Gate on **both**.
       On both verdicts landing clean the Bible records `QC PASSED`, then:
       **[APPROVER gate: readiness — human watch (BC-25), Human Taste Gate, every
       APPLICABLE registry check verified (per each check's `applies` field — checks scoped
       to other deliverable types or motions are recorded N/A, not blocking) →
       `CLIENT READY`]**
   12. Delivery on CLIENT_APPROVER sign-off → `DELIVERED`, then learning capture (step 8).

4. **Run one phase at a time.** Hand the specialist the Bible path and its assigned section.
   Do not do its job. Do not run the next phase before the current one has written its
   section. Where the sequence lists parallel constraint work (step 3.6, 3.8), the phases may
   run concurrently but each still writes only its own section.

5. **Skeptic invocation protocol.** Every Skeptic pass (and every post-repair regression
   re-run) is spawned in a **fresh subagent** — new context, no conversation history — handed
   ONLY the Isolation Packet defined in `../servicepow-skeptic/SKILL.md`. Never include
   production reasoning, cost or spend detail, draft history, or any other evaluator's output
   in the packet. Transcribe the returned verdict block **verbatim** into Bible §14 — the
   isolated subagent never writes the Bible itself. A `SKEPTIC VOID` return is a delivery
   block at BC-23, never a pass.

6. **Resolve conflicts.** On a `## CONFLICTS` entry: accept (update the Bible, mark RESOLVED
   with the decision), reject (mark REJECTED with the reason — the record matters), or
   escalate to the APPROVER. Never advance past a gate while a conflict is OPEN.

7. **Advance approval status** — this skill alone changes it — and log every decision in the
   Decision log (§16).

8. **Campaign close: learning capture.** Write two separate records into the client KB —
   production intelligence (what the tools did) and advertising intelligence (what the market
   did) — each finding tagged by who caught it. A single campaign's result never rewrites
   company doctrine; it is logged as a candidate for validation, nothing more.

## DECISION RULES

- **Nothing is generated before `STORYBOARD APPROVED`.** Spend follows thinking. This skill
  owns WHEN generation may begin; the spend policy owns HOW spend is disciplined once it may.
- **Two gates, both binding.** The critic grades (BC-22) and the Skeptic attacks (BC-23).
  Never run one instead of the other, never let a good score argue down an S3/S4 finding, and
  never let either evaluator see or wait on the other — you sequence them independently and
  gate on both.
- **After any repair, both gates re-run.** A fix that was never re-attacked is a fix on trust.
- **A weak offer stops the campaign.** If strategy returns offer verdict WEAK, surface it and
  recommend fixing the proposition — do not proceed to prettier video.
- **Skip a phase only when the Bible already answers it**, and record which phase was skipped
  and why. Never skip because production is behind.
- **The deliverable is a pack.** Body, payoff and CTA are produced once and reused; only the
  hooks differ. A single one-off ad is the exception and the reason goes in the Decision log.
- **Small jobs still get a Bible** — a one-shot static ad uses a short one with honest
  UNKNOWNs. The Bible scales down; it does not get waived.
- **The APPROVER's preferred angle is an input, not an instruction.** Record it, rank it
  honestly against alternatives, recommend the strongest. If the APPROVER reaffirms, proceed
  and log the decision.
- **Never publish, never spend, without the role-bound gate.** Drafting is always fine;
  dispatching belongs to the gate's role-holder. A gate whose role-holder is away is parked
  per the never-stall rule in `../_servicepow/data/roles.md` — prepared, awaited, and never
  skipped.
- **No lateral state.** A specialist that needs another specialist's output reads the Bible;
  a specialist that disagrees with the Bible raises a CONFLICT. Anything else is two brains.

## POLICY BINDINGS

- `../_servicepow/data/blocking-checks.yaml` — the canonical blocking-check registry; final
  readiness requires every APPLICABLE check verified (per the registry `applies` field), and this skill gates readiness specifically on
  BC-22 (critic score floor), BC-23 (Skeptic verdict), and BC-25 (human watch), with BC-24,
  BC-31 and BC-34 settled at the storyboard gate.
- `../_servicepow/data/roles.md` — defines APPROVER, SPEND_APPROVER, and CLIENT_APPROVER,
  the roles every gate in this skill binds to; owns the never-stall parking rule.
- `../_servicepow/policies/generation-and-spend.md` — governs the SPEND_APPROVER two-step
  gate and all spend discipline once this skill permits generation to begin.
- `../_servicepow/policies/claims-and-proof.md` — governs the claim-substantiation state this
  skill must see satisfied before advancing to delivery (BC-16, BC-19, BC-20).
- `../_servicepow/policies/realism-and-disclosure.md` — governs the synthetic-person and
  disclosure conditions verified at the readiness gate (BC-17, BC-18, BC-25).
- `../_servicepow/policies/brand-assets.md` — governs the identity-asset rules this skill
  enforces through the brand-fidelity phase (BC-21).

## OUTPUT CONTRACT

Writes to the Bible (and nothing else — every other section belongs to its owning skill per
`references/bible-contract.md`): the campaign header, the approval status, the Skeptic verdict
transcripts (§14, verbatim), CONFLICTS resolutions, and the Decision log.

Returns to the user and the gate's role-holder at every stop: current phase · what each
specialist decided · open UNKNOWNs blocking progress · the next gate and which role it awaits ·
spend committed versus budget.

## QUALITY GATES

- The Bible exists and every phase that ran has written its assigned section
- No OPEN conflict when advancing past any gate
- Client brief and brand guide read before any creative was produced
- Approval status reflects only what the named role actually approved — never an assumed yes
- Every Skeptic pass was run through the isolation protocol; every verdict is transcribed
  verbatim; no VOID was treated as anything but a block
- Both readiness verdicts (BC-22, BC-23) exist and were produced independently
- Every decision, skip, exception, and risk acceptance appears in the Decision log

## FAILURE CONDITIONS

Stop and report rather than proceed when: the client KB does not exist · a licence or
compliance constraint forbids the requested campaign · a required UNKNOWN cannot be resolved ·
the critic returns HARD FAIL · the Skeptic returns an S3/S4 finding or a VOID · budget would
be exceeded.

## HANDOFF

Every specialist returns here — there is no other route between phases. This skill is the only
one that changes approval status, the only one that spawns the Skeptic, and the only one that
declares CLIENT READY. Fixes are routed to the owning skill with the finding attached; both
quality gates re-run after the fix lands. At campaign close, learning capture (WORKFLOW step
8) is this skill's last act before DELIVERED.

## REFERENCE FILES

- `templates/campaign-bible.md` — the Bible template (instantiated per campaign)
- `references/bible-contract.md` — section ownership, read/write rules, approval-state chain.
  These two files are the only home of Bible structure and ownership.
