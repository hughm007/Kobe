---
title: "911 Drain — Baseline Report (storyboard-level rebuild, paper run)"
type: report
client: 911drain
owner: Karl
status: active
created: 2026-08-26
updated: 2026-08-26
tags: [campaign, baseline, qc, gate]
---

# 911 DRAIN BASELINE REPORT

**What this is:** the first execution, ever, of the Service Pow campaign pipeline — run end to
end through every stage that exists, at zero generation cost, to establish a trustworthy
before-picture. Scope approved in advance: paper baseline, hard stop at the spend boundary
(Gate 1.5). Repo state at run: branch `claude/voice-first-agent-core-dysy9h`, baseline commits
`f453d3e` (pre-run) → `c837056` (artifacts) → `ebce0cd` (Kobe verdict) → this report's commit.

---

## Execution

**SUCCESS** — as a process run. Every stage that exists in the system executed: S0 client
knowledge → strategy → concept + Hook Tournament (isolated Skeptic attack) → spine → script →
ten-field storyboard → Skeptic Pass 1 (isolated) → Kobe cold run → this report. The campaign is
**correctly blocked** at the quality gate (see below) — a quality outcome, not a crash.

**Context for every reader: there is no campaign-runner software.** The pipeline is a
model-executed process defined by 16 skills + the production playbook. The only automated
components are the skill validator and the Orion test suite (both green, below). Verified
exhaustively — across all repo history, no campaign/video/QC code has ever existed.

## Runtime failures

**None.** No dependency errors, no missing-file crashes, no API failures. The automated
components ran clean:

```
$ python3 .claude/skills/_shared/scripts/validate_skills.py   # 2026-08-26T05:54:49Z
Validated 16 skills in .claude/skills
Single-source rule (LB50): blocking-check count, LB1-52, HB1-14, owned thresholds
All structural checks passed.        exit=0

$ ./.venv/bin/python -m pytest tests -q                       # 2026-08-26T05:54:54Z
161 passed in 17.59s                 exit=0
```

## Campaign outputs (exact paths, all under `clients/911drain/campaigns/2026-08-26-storyboard-rebuild/`)

| Artifact | File |
|---|---|
| Campaign Bible (14 sections + Status Header, gate verdicts recorded) | `campaign-bible.md` |
| Hook Tournament record (10 in → 3 out, isolation record, repairs) | `hook-tournament.md` |
| Timed script + pace/dwell arithmetic | `script.md` |
| Ten-field storyboard, 8 shots, Feeling Spec + Sound Spine | `shotlist.md` |
| This report + verbatim gate appendices | `2026-08-26-baseline-report.md` |

Zero binaries produced (paper run). Zero Higgsfield credits spent (`§10: Spent to date: 0`).

## Behavior Test Results (tests 6a–6d, `.claude/skills/_shared/tests/trigger-and-composition-tests.md`)

**Test 1 — 6a Pack test: PASS.** The run produced a pack, not an ad: one concept family
("Look Us Up") × 3 genuinely different hooks (utility-command / macro-dread / curiosity-code),
shared body-payoff-CTA, per-variant chain and shuffle checks. The variants differ in mechanism
and target state (mid-emergency vs pre-need), not in edit. Evidence: Bible §3–§4;
`hook-tournament.md` (the Skeptic independently confirmed the 3-survivor spread "splits cleanly
across the two declared viewer states").

**Test 2 — 6b Field test: PASS.** Every shot carries exactly the ten fields — counted, 10 × 8
shots, no eleventh invented, the old 24-field set nowhere in use. 7/8 Real-refs cited and
openable; 1 declared `NO REFERENCE FOUND — HIGH RISK` and surfaced by name (the compliant path
for a missing reference). Evidence: `shotlist.md` (self-check section) + independent
confirmation in both gate outputs.

**Test 3 — 6c Independence test: PASS.** The Skeptic was invoked three times (hook attack,
Pass 1), each in a fresh context given the artifact + brief only. Provenance notes referencing
earlier reasoning were redacted from the artifact before handoff. Both Skeptic outputs open with
their own disclosure ("run blind… not seen the production reasoning") and every finding reacts
to artifact text, not to rationale — e.g., it attacked the C1 Source field's own escape hatch
and the S3 badge/Source contradiction, both discoverable only from the artifact itself.
Evidence: isolation record in `hook-tournament.md`; disclosure lines in Appendices B–C.

**Test 4 — 6d Two-gate test: PASS (as exercisable at paper stage).** Both gates ran
independently and both bind: Kobe returned CANNOT ASSESS (never a pass; zero numeric scores
emitted, so no score exists to argue down a severity) and the Skeptic returned BLOCK (7 × S3);
the campaign director holds status DRAFT/blocked with **both** verdicts recorded, and the
Status Header states the storyboard cannot proceed even with owner approval until the S3s close
and a fresh Pass 1 re-runs. Honest caveat: the test's sharpest scenario — a *passing* Kobe
score coexisting with an S3 — could not arise, because nothing scoreable exists; that scenario
re-tests at the first footage-stage run.

## QC Results — the blocking-check list at the paper boundary

*(The playbook owns the list and its count — this table audits each check's runnability, it does not restate the number.)*

Per LB29, a check not actually run is recorded NOT RUN — never claimed.

| Checks | Status at baseline | Reason |
|---|---|---|
| 1–15 machine (res/fps/LUFS/motion/dead-space/expected-strings…) | **NOT RUN** | No rendered media exists AND `servicepow_qc.py` absent from repo |
| 16 every claim substantiated | **RAN at design — FAIL as-written** | The Skeptic found a fourth claim: **"Local."** in S5 text, outside the 3-item register (licensed · checkable · phone) with the claims sheet unsigned. A real catch by the gate |
| 17 no synthetic testimonial / AI person as real customer | RAN at design — pass (no testimonial framing anywhere) | Final verification on renders |
| 18 platform AI disclosure | **NOT RUN — and flagged undecided** (Skeptic S3 #7) | Set at publish; posture must be decided pre-spend |
| 19 ad-to-landing-page parity | NOT RUN | Needs final ad + live page |
| 20 rights cleared | NOT RUN (design-clean: no music, no third-party assets) | Cleared at delivery |
| 21 correct client + brand assets | **PARTIAL** | Client correct; real asset files not in hand (locations NEEDS INPUT) |
| 22 ServicePow-6 ≥ 8 | **NOT RUN — blocking** | Nothing to watch; Kobe: CANNOT ASSESS |
| 23 Skeptic verdict PASS/accepted | **FAIL at present** | Pass 1 = **BLOCK (7 × S3)** |
| 24 angle declared + rotated + Anti-Generic | **RAN — PASS** | Angle declared; rotation evidence pasted (one prior deliverable exists — honest reduction); logo-swap PASS. Skeptic's strategic note on category-education recorded for Karl |
| 25 human watched end to end | **NOT RUN — blocking** | Nothing exists to watch |
| 26–28 source-side (bed ASR / speech-match / safe-area) | **NOT RUN** | No audio/master; `servicepow_source_qc.py` absent. Safe-area *designed* in-spec; Skeptic demands stated Y-positions per placement before lock |
| 29 `--preflight` passed and pasted | **NOT RUN — blocks all generation spend** | Script absent. The playbook's own words: "a session whose harness cannot self-test does not spend credits" |
| 30 `--gate-clips` per clip | NOT RUN | No clips; script absent |
| 31 motion axis named per shot / motion floor | **Axis half: RAN — PASS** (every shot names axis + method; hero beats name two) | Floor half NOT RUN (measurement) |
| 32 performance gate (WPM) | **NOT RUN** | Script absent. Design arithmetic done in `script.md` (all lines ≤ ceilings on paper) — labeled a plan, not a measurement |
| 33 biomech gate | NOT RUN | Script absent; no footage |
| 34 real-reference in the tenth field | **RAN — PASS pending owner acknowledgment** | 7/8 cited + 1 surfaced HIGH RISK by name; "Claude never accepts that entry alone" → Karl's acknowledgment required |

## Quality Gate

**FAIL — reached and failed for the correct reasons.** (RULE 9 category B, with one structural
addition.)

**Why, precisely:**
1. **Content defects the gate caught** (would block even with footage and scripts in hand):
   the seven Skeptic S3s — the generated-badge/Source contradiction, the unregistered "Local."
   claim, the 24/7-vs-daylight-"morning" contradiction, the unverified live ROC record, the
   EXTREME-risk arrival shot, the unapproved S4 contingency, the undecided AIGC labeling
   posture. Plus Kobe's independent catches (feed-size death of the verify beat without a
   punch-in; S5 as the highest-risk credit; hook B the weak sibling; no lead variant named).
2. **Structural unrunnability** (a baseline finding, not a crash): checks 1–15, 26–30, 32–33
   cannot run for any campaign until the four QC scripts exist; check 29's own text blocks
   generation spend outright until then.
3. **Nothing to watch** (by design of the paper scope): checks 22 and 25 are correctly
   unreachable, and both gates said so instead of passing — Kobe's contract line "unverifiable
   is not the same as passed" held under test.

**What did NOT happen:** no crash was mislabeled a quality failure; no check was claimed run
that wasn't; no score was used to argue down a severity; nothing generated, spent, published.

## Five judged checks

The five that remain subjective (human/model judgment) even when footage exists: **21** (correct
client/assets), **22** (ServicePow-6 scoring), **23** (Skeptic severities), **24** (angle +
anti-generic), **25** (the human watch). Additionally — until the missing scripts land — checks
**8–15, 26–28, 32, 33** are *supposed* to be measured but can currently only be judged, which
the repo itself brands an LB29 violation if ever claimed as "run" (SCRIPT GAP banner,
`measurement.md:17-21`).

## Four QC scripts

**They do not exist and never have.** `servicepow_qc.py`, `servicepow_source_qc.py`,
`servicepow_performance_qc.py`, `servicepow_biomech_qc.py`: cited 49 times across 7 markdown
files; never a file in any of the repo's 24 commits, any branch, any stash (full
`git ls-tree -r` enumeration over `git rev-list --all`; zero dangling objects). A fifth phantom
(`servicepow_clip_ledger.jsonl`, "written automatically") has no writer. Thresholds and usage
survive in `playbooks/ads/references/measurement.md`; source must be pasted or rebuilt.
Related defect: the validator's reference-path check is regex-anchored to `.md`, so these 49
broken `.py` references are invisible to it (`validate_skills.py:141`).

## Cost (Wyatt asked)

- **This baseline: 0 credits, $0.**
- **Full production of this pack, when unblocked:** ≈ **500–900 credits** (keyframes ~5–50 ·
  cheap-tier drafts ~180–375 · premium finals ~325–455, per the dated capability map's measured
  costs; only recorded full production day: 1,892; stop-loss flag ~2,800/day). Balance
  **8,918.4 credits** at last verification (2026-08-25) → a pack ≈ 6–10% of balance. Credits are
  prepaid on the Ultra plan — no new cash until a top-up; the credit→dollar rate is **NOT
  VERIFIED** in the repo. The Skeptic's forced changes *reduce* the estimate: A1/B1/S5 shot
  practical and S3 restructured to one figure could cut generation volume by a third or more.

## Current bottleneck

**The four missing QC scripts.** One absence blocks two different ways at once: check 29 forbids
any generation spend until the harness can self-test, and checks 1–15/26–28/30/32–33 are
unmeasurable without it — so even a perfectly revised storyboard cannot legally spend a credit
or clear the back half of the gate. Everything else on the critical path (the seven S3s, the
claims-sheet signature, the S4 media ask, the asset file locations) is decision-or-effort;
this one is tooling, it is cheap, and both gates independently named it first. Close behind it:
**the claims sheet signature** (it caused the "Local." block and bans every quantitative
message) and **the S4 real-footage ask** to Will's crew.

## Evidence

- Campaign artifacts: the five files listed above (this folder)
- Gate outputs verbatim: Appendices A–C below
- Automated baselines: Phase-0 outputs quoted above (scratchpad copies: `phase0-validator.txt`,
  `phase0-orion-suite.txt`, session-local)
- Repo-forensics for the "no runner / no scripts / prose-only record" claims: full-history
  enumeration summarized in `knowledge/decisions/0005` context and this session's audit;
  SCRIPT GAP banner at `playbooks/ads/references/measurement.md:17-21`; v8 record at
  `clients/911drain/client-brief.md:63-65` and `.claude/skills/_shared/tests/pilot-2am-critic.md`
- Git: `f453d3e` → `c837056` → `ebce0cd` → this commit (the baseline is the commit hash)

## What happens next (parked for Karl — nothing proceeds without these)

1. Read Bible Status Header → take decisions 1–2 (strategy, concept/pack).
2. Authorize the revision pass on §14's queue → fresh Skeptic Pass 1 on the revised board.
3. Sign the claims sheet with Will (unblocks any quantitative message, cures the "Local." class).
4. Send the S4 media ask (one job, phone rig, ~30s usable).
5. Decide: paste/rebuild the four QC scripts (the bottleneck; also the precondition of spend).

---

# APPENDIX A — Hook Tournament: Skeptic attack (verbatim)

Run isolated, 2026-08-26. Input: client facts + constraints + the 10 candidates only.

> H1 "Six digits" — Target mid-scroll: a government web form is close to the least arresting
> visual on the feed; the mid-emergency viewer gets zero drain relevance and scrolls. The
> curiosity beat depends entirely on reading the burned line, but it does land inside 2s and
> the digit-typing is a genuine oddity. Serves only the save-the-number segment. Client: opens
> on the state regulator's site, not the brand; "who's REALLY licensed" leans on doubt about
> everyone else — but the underlying fact is true and publicly substantiated. Industry pro:
> nobody searches ROC by license number; homeowners search by company name — staged, cosmetic,
> not fatal. Competitor: fully logo-swappable by any licensed competitor; ownable only by
> whoever runs it first. Production: trivially buildable (real recording, real thumb at macro);
> real risk: roc.az.gov UI type is not built for feed legibility — needs an aggressive ECU or
> it dies. Compliance: clean. Severity S2. VERDICT: SURVIVE — conditionally, trust-segment
> variant only.
>
> H2 "The whole ad" — self-aware anti-ads are a worn template; the payoff gives the emergency
> viewer nothing. The copy is a lie inside its own hook — "This is the whole ad" fronting a
> 15-second ad. "They spent money to show you a black screen" writes itself. A faint red pulse
> behind static type is a static open trying to lawyer past the motion floor — the named
> blocking failure, walked into. Severity S3. VERDICT: KILL.
>
> H3 "Water doesn't wait" — macro dread works muted; motion intrinsic; the second-person threat
> lands under 1s; the flinch is also the stop. The one thing Will should fear: if the water
> grades brown it reads as sewage — the exact scope problem the word-ban fences off; must be
> art-directed grey/soapy, no solids. Credible to a pro; copyable but craft-dependent;
> "fear ad" mockery weak because the fear is proportionate and true. No people, no marks,
> cheap to make. The line is a statement about water, not a performance claim. Severity S2.
> VERDICT: SURVIVE.
>
> H4 "Guessing vs knowing" — a vertical split gives each screen a quarter of an already-small
> frame; neither side readable, so the contrast that IS the mechanism does not exist at feed
> size. Same licensing lane as H1, executed worse; the pack cannot carry both. Severity S3.
> VERDICT: KILL.
>
> H5 "East Valley callout" — a targeting label, not an emotion or question; postcard motion,
> dramatically dead; the required beat never lands inside 2.0s — the hook's one job. The single
> most copyable open in local services. Severity S3. VERDICT: KILL.
>
> H6 "Stranger in your house" — it stops the thumb, then makes the viewer feel unsafe about
> the exact transaction the client sells. The next backlit man with a toolbox at a customer's
> door is HIS technician; the ad teaches the customer to read that image as home invasion.
> Breaks the stated voice (panicked, not urgent). Hands competitors their counter-creative.
> Full-body generated human at threshold carries gait/weight tells even with the face hidden.
> Severity S3. VERDICT: KILL.
>
> H7 "UGC direct address" — cannot be made under the constraints: no real talent; a generated
> talking head at selfie distance is the highest-risk banned class. The mechanism is spoken
> dialogue on a MUTED feed. A staged homeowner presented as genuine is a fabricated implied
> testimonial with an unsigned claims sheet, plus synthetic-person platform exposure.
> Severity S4. VERDICT: KILL.
>
> H8 "Stop using water" — "Drain backed up?" self-selects the mid-emergency viewer in half a
> second; visibly rising water is intrinsic frame-1 motion; utility earns trust instead of
> asking for it. The declared risk (take the advice and scroll) is the weakest failure mode in
> the set — the person whose sink is backing up is not solved by step 1 and stays for step 2.
> "Stop running the water" is correct first advice; a real plumber endorses it. Staging trap:
> water cannot visibly rise with no faucet running — show the tap ON. Cheapest build in the
> set. Clean. Severity S2. VERDICT: SURVIVE.
>
> H9 "Fridge magnet" — the payoff object's numbers are unreadable at feed size; ten words on a
> slow push with no tension; the 2.0s beat window is gone before the object is found. Charming
> on a storyboard, invisible on a phone. Practical fridge needed; heavy small-object
> compositing for a payoff that still will not read. "The calmest house on the street" is an
> avoidable comparative with an UNSIGNED claims sheet. Severity S3. VERDICT: KILL.
>
> H10 "Which one gets in" — "Only one of these is verifiable" is a comparative superiority
> claim, and it is FALSE on its face — every licensed contractor in Arizona is verifiable on
> the same website. An unsigned claims sheet means no such claim survives even when true; this
> one is untrue. Invites a competitor complaint with the false statement burned into the
> creative as evidence. The heaviest build in the set in service of a line that cannot ship.
> Severity S4. VERDICT: KILL.
>
> SURVIVORS — exactly 3 (no padding): 1. H8 (the only hook that stops the exact person the
> client needs, works fully muted, cheapest compliant build, mildest worst case). 2. H3 (dread
> + intrinsic motion lands the beat under 1s with zero audio and zero people; its one serious
> wound closes in the grade, not the concept). 3. H1 (everything it says is true and buildable
> today; covers the save-the-number segment; run as the trust variant, never the lead, and only
> with an ECU that makes the digits legible). Pack note: H1 and H4 were the same idea — H4's
> death is a worse execution of a surviving mechanism. The three survivors split cleanly across
> the two declared viewer states, which is the only reason a 3-survivor pack is defensible
> rather than thin.

# APPENDIX B — Kobe (creative critic), cold run — key sections verbatim

> Run: 2026-08-26, cold context, no creator reasoning supplied.
>
> VERDICT: CANNOT ASSESS — NOT CLIENT READY. DELIVERY BLOCKED. Per contract, exactly applied:
> the creative is unavailable — there is nothing to watch, so the ServicePow-6 cannot run; the
> machine gates could not be run (and currently cannot ever run — the scripts do not exist),
> and a gate that could not be run is a BLOCK; "QC not run" stops delivery; unverifiable is not
> passed. No storyboard, script, spine, or Feeling Spec — however sound on paper — can
> substitute for watching the work. The 9-axis rough card was not used and could never clear a
> deliverable anyway. Nothing in this report is a pass. … It is not a judgment that the
> campaign is bad. The paper is largely strong. It is a statement that no clearable deliverable
> exists and the machinery to clear one is not in place.
>
> Steps recorded NOT RUN, each with reason: stranger watch (nothing to watch) · machine QC
> (no media AND scripts absent — double block) · rendered-frame compliance · AI-artifact rating
> · 9-axis rough card · ServicePow-6 · pack scoring (also: no lead variant designated) ·
> human-watch record: "NO — nothing exists to watch."
>
> The 12 storyboard-stage advisory findings (abridged titles; full text in the agent record):
> 1 QC tooling is a blocker in its own right — build the scripts before the first credit.
> 2 S5 payoff: highest-risk credit in the plan, no reference — never a premium render in this
> state. 3 The arrival shot's "visible ID" is a brand-fidelity trap — generated badge = generated
> brand mark; declare the source in writing first. 4 The verify beat will not read at feed size
> without a hard punch-in on the status line. 5 The screen recording needs a compliance
> frame-script (what is searched, shown, cropped; recapture before delivery). 6 Pacing
> arithmetic is tight and unproven — verify the verify-beat and endcard minimums; WPM by
> arithmetic is a plan, not a measurement. 7 Hook B is the weak sibling — sharpen or first to
> replace. 8 Payoff loop closure uneven across variants (C closes on the endcard — make it a
> documented choice). 9 "ROC in-safe on every ad" — resolve per-creative vs persistent in
> writing. 10 Auger footage must read interior residential (scope optics). 11 Claim sweep must
> run on the full text of all eight shots + full VO. 12 Name the lead variant (A is the natural
> lead on paper; the decision must exist before pack scoring can run).

# APPENDIX C — Skeptic Pass 1 (pre-spend storyboard attack) — verbatim risk table + verdict

> DISCLOSURE: This pass was run blind. I have not seen the production reasoning, concept
> rationale, model-routing decisions, or any prior review's output.
>
> RISK TABLE: A1 pure-AI **HIGH** (fluid two-state behavior + hand-grip on tap + timed event in
> one 2.5s shot — the mitigation reduces count, not class) · B1 pure-AI **MEDIUM** (macro fluid
> creep achievable; rack focus in post; rug-fiber wicking risk) · C1 **MEDIUM as written /
> LOW-MEDIUM with the AI-hand escape hatch struck** · S2 **LOW** (real recording; the risk is
> compliance, not generation) · S3 **EXTREME** (two interacting generated humans, restraint
> choreography, asserted-not-enforceable face distance, mouth movement invited by the muffled
> "morning", generated camera push, badge contradiction — highest-risk shot on the board by a
> wide margin) · S4 **LOW generation / SERIOUS dependency** (footage does not exist; the
> aftermath-only contingency is not pre-approved and re-gates if triggered) · S5 **HIGH**
> (self-declared no-reference; hand-object contact + micro-performance + second fluid + steam —
> which is also a physics error, a just-set kettle does not steam — inside 1.5s) · S6 **LOW**.
>
> Structural observation driving the forced changes: A1, B1, S5 are brand-free generic domestic
> actions — any producer with a phone shoots all three in one afternoon for effectively zero
> cost. "No real client footage exists" justifies AI for shots that need the CLIENT. It does
> not justify AI for shots that need a sink. The storyboard has defaulted to "pure AI" where
> pure AI is the hardest and least necessary route.
>
> Forced production-method changes: A1 → practical, or split fluid from hand into separate
> shots, or keyframe-bounded with the shutoff on a cut. C1 → strike "AI hand at ECU" entirely;
> film a real person actually doing the search. S3 → homeowner-POV restructure (delete the
> second generated human), badge composited-real-at-shape-distance or cut, van out of frame
> unless the wrap composite is proven on a static test frame, kill the spoken "morning", no
> generated push. S4 → ships only with real footage; contingency re-gates. S5 → practical, or
> one class only (delete foreground water + steam, keyframe poses, extend to ≥2.5s).
>
> Four-lens and compliance findings: S3-class ×7 (arrival shot EXTREME · generated badge =
> fabricated credential in an ad about verifying credentials · "Local." is a fourth claim
> outside the register · 24/7 tagline vs hard-daylight "morning" arrival — "Call the 24/7 guys,
> they'll see you after breakfast" · the live ROC record unverified: legal-name match,
> complaint rows, ACTIVE status, and the class-line "sewer" leak vector must be checked from
> actual pixels before approval · S4 dependency · AIGC labeling posture undecided for a
> trust-premise ad). S2-class ×12 including: "Every Arizona contractor has a number" is false
> as written (handyman exemption) — insert "licensed" · "exactly who you're letting in"
> overclaims (the lookup identifies the entity, not the person) · VO "This is what licensed
> looks like" welds conduct to licensure — an implied claim outside the register · A1 text
> density ~16 words/2.5 muted seconds · a 5.5s burned-text blackout across S3–S4 on a
> muted-first platform · safe-area positions asserted, never specified — require stated
> Y-positions per placement · ROC branding and the client logo must never share a frame ·
> story seams (kitchen problem / shower fix / kitchen payoff; B's hallway flood never resolved
> on screen). S1 notes: "hob"/kettle Britishism in an Arizona kitchen (a tap-filled glass
> resolves the drain story better) · sanitized grey water reads staged to pros only — correct
> trade · expect a "911" emergency-services platform flag; keep the ROC record ready.
>
> VERDICT — PASS 1: BLOCK. No generation spend. The storyboard's spine is genuinely good — the
> real-screen verification beat is the strongest trust mechanic on the board precisely because
> it refuses to generate the one thing that must be real — but Pass 1 blocks on any S3, and
> there are seven, every one fixable on paper. Resubmit the revised storyboard for a fresh
> Pass 1. The concept does not need rescuing; the board needs the seven S3s closed before it
> earns a single credit.
