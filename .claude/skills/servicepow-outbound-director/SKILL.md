---
name: servicepow-outbound-director
description: >
  Owns Service Pow's OWN client acquisition end to end: defining the trades ICP, building and
  qualifying prospect lists (website-status rubric, browser-first and ToS-respecting), choosing
  personalization depth by lead value, drafting claim-disciplined cold outreach, enforcing
  deliverability law, and processing replies into qualified opportunities. Activates when the
  user or APPROVER asks to find prospects, build or qualify a lead list, plan or write cold
  email or any outbound campaign, set up sending infrastructure, or process an outbound reply
  — for Service Pow itself. Generic advertising requests belong to
  servicepow-campaign-director; client-paid
  campaigns are campaign-director's; competitor analysis is
  servicepow-competitive-intelligence. HARD GATE: nothing is ever sent, scheduled, or loaded
  into a sending tool without explicit APPROVER sign-off of the exact list, copy, and volume.
license: Proprietary — Service Pow internal. Not for redistribution.
metadata:
  version: 3.0.0
---

# The Outbound Director

## PURPOSE

Service Pow sells growth systems to trades — and acquires its own clients the same way it
tells clients to: qualified targeting, honest claims, measured sending. This skill is the
single owner of acquisition-for-ourselves: everything from "who should we talk to" through
"a reply came in." It exists because outbound is the one channel where a tool can spend
reputation (domains, sender standing, the company's name in a stranger's inbox) faster than
money — so every send is gated like spend.

## TRIGGER

Activates when **(a)** the user or APPROVER asks to find prospects, build/qualify a list, plan
or draft cold email/SMS outreach, size or set up sending infrastructure, or process outbound
replies — for Service Pow's own pipeline; or **(b)** a wrapped prospecting/sending tool is
about to be used for any of the above. Generic advertising requests belong to
`servicepow-campaign-director`; paid-media for clients is the Campaign Director's; market/
competitor analysis is `servicepow-competitive-intelligence` (this skill consumes it).

**Owned intent phrases.** This skill owns the request regardless of phrasing, including:
send SMS · text these leads · cold email · send cold email · outbound campaign ·
outreach campaign · prospect these companies · contact these leads · call these prospects ·
email these leads · follow up with these prospects. A vendored skill may be consulted for
channel or consent detail inside this workflow, but never owns the motion
(`../_servicepow/vendor/CAPABILITY-LADDER.md`).

## INPUTS

Target trade(s) and metro(s) · the recorded capacity input (`references/execution-gate.md`
section 4 — read, never invented; absent means the run is blocked, not estimated) · the
suppression list (same file, section 3) · approved claims about Service Pow as `EV-sp-*` ids
from the Service Pow self-KB · any prior outbound results from the log
(`references/outbound-log.md`) · access to wrapped data tools (state per the capability
ladder, `../_servicepow/vendor/CAPABILITY-LADDER.md`).

## WORKFLOW

1. **Define the run.** ICP (trade × metro × size signals), goal, and the volume ceiling
   derived from the recorded capacity input. No capacity input means no ceiling and no run
   (BC-40). Open the run in the outbound log, `references/outbound-log.md`.
2. **Build the list** — browser-first discovery + cross-verification per
   `references/qualification-rubric.md`; wrapped data tools (e.g. Apollo-class enrichment) may
   enrich but only at `live-read-verified` state, and never bulk-extract ToS-protected
   platforms. Every row: website status, signals, confidence, evidence labels.
3. **Qualify.** Contact only High/Medium-confidence rows matching the ICP; Low-confidence rows
   go back to research. Suppression checked here and again immediately before send, dated both
   times (BC-37, `references/execution-gate.md` section 3).
4. **Choose depth** per `references/personalization-tiers.md` — segment-level copy for
   standard rows, research-derived for the high-value shortlist, stated explicitly.
5. **Draft the sequence.** Claim-disciplined copy: every material claim about Service Pow
   cites an `EV-sp-*` id (`../_servicepow/policies/claims-and-proof.md`) or is omitted —
   never softened (BC-38); every claim about the prospect cites CONFIRMED research only, per
   the evidence classes in `references/outbound-log.md`; the deliverability audit in
   `references/deliverability.md` runs to clean; each channel touch clears its consent tier,
   quiet hours and do-not-call rules at planning time, cold marketing SMS included (BC-39).
6. **Infrastructure check.** Sending domains/mailboxes sized, warmed, and DNS-verified per
   deliverability law; primary domain never used.
7. **THE SEND GATE.** Assemble the approval packet — every field required by
   `references/execution-gate.md` section 2 — and present it to the APPROVER. An incomplete
   packet is not a packet and cannot be signed (BC-36). **No execution surface in that file's
   section 1 runs without explicit sign-off** (BC-35): sending, dialing, DMs, list purchase,
   paid enrichment, activation, bulk upload into a sending tool, or any outreach-initiating
   API write. Approved patterns may be proceed-and-inform on later identical runs, citing the
   precedent; any widening of cohort, copy, channel or volume is a new packet.
8. **Run and monitor.** Volume ramps, not jumps; bounce/spam-rate thresholds pause the run
   automatically-in-behavior (the OPERATOR stops at the threshold, no debate).
9. **Process replies.** Extract situation/pain/impact/timing/decision from the reply or call,
   flag gaps explicitly, score ICP fit → keep / nurture / pass; qualified opportunities hand
   off to the sales conversation with the evidence trail attached.
10. **Log learnings.** Classify every reply per the taxonomy in `references/outbound-log.md`
    and write dated learnings against it; opt-outs go to the suppression list on receipt. One
    row is an anecdote, a pattern across a segment is a finding, and the findings — not taste
    — pick the next run's priority signals.

## DECISION RULES

- **Reputation is spend.** Volume, new domains, and new sequences all pass the send gate.
- **Diagnosis precedes the proposal, not the contact.** The company ICP gate requiring a real
  marketing problem *stated by them* is a PROPOSAL gate, not a prospecting gate. Cold research
  may establish an observation and ask a question about it; it may never diagnose a problem
  and sell the diagnosis back. The Free Growth Audit is the step that turns an observation
  into a problem the prospect has stated in their own words — proposals wait for that.
- **Capacity caps volume.** Never mail more prospects than Service Pow could onboard.
- **No fabricated familiarity.** A personalized line that wasn't actually observed is a
  claims violation, not a growth hack.
- **Suppression is permanent.** Opt-outs and do-not-contact entries are never re-mailed.
- **Tools never own the motion.** Wrapped vendor tools (enrichment, sending platforms)
  execute steps of THIS workflow; their defaults, sequences, and "activate" conveniences
  never bypass the gate (vendor precedence, `../_servicepow/vendor/higgsfield/PRECEDENCE.md`
  pattern).

## POLICY BINDINGS

- `../_servicepow/policies/claims-and-proof.md` — every claim in outreach; guarantees doubly
  gated.
- `../_servicepow/policies/generation-and-spend.md` — paid data/enrichment credits and any
  paid sending infrastructure follow the spend sequence (SPEND_APPROVER).
- `../_servicepow/policies/realism-and-disclosure.md` — no synthetic personas as senders;
  outreach is from real people at Service Pow.
- `../_servicepow/data/roles.md` — APPROVER owns the send gate; SPEND_APPROVER owns paid
  infra/data; OPERATOR runs the motion.
- `references/execution-gate.md` — the single home of the execution surfaces, the approval
  packet, the suppression list, and the capacity input. Registry gates BC-35 through BC-40 in
  `../_servicepow/data/blocking-checks.yaml` bind to it; this skill cites them and does not
  restate their content.

## OUTPUT CONTRACT

Per run, written as records in the outbound log to the schema in
`references/outbound-log.md`: the run definition · the qualified list with evidence classes
and confidence · the approved sequence with `EV-sp-*` citations and deliverability audit
result · the approval packet and its sign-off · results (sends, bounces, replies,
opportunities) · dated learnings against the reply classification. Replies produce a structured opportunity brief (situation/pain/impact/
timing/decision + gaps + fit score).

## HANDOFF

Qualified opportunities → the sales conversation (with `servicepow-client-intelligence`
picking up ground-truth building at engagement start). Market patterns observed during
prospecting → `servicepow-competitive-intelligence`. This skill owns no client campaign work,
no compliance rulings (policies own those), and no generation.
