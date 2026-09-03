---
title: "Evidence Index — what is proven, failed, and provisional"
type: index
client: internal
owner: APPROVER
status: active
created: 2026-09-03
tags: [evidence, baseline, regression]
---
# Evidence Index — the experimental record behind Baseline V1
A fresh session reconstructing "what has been proven" starts HERE, then follows the paths.
Governing law: `.claude/skills/_servicepow/policies/baseline-and-regression.md`.

## PROVEN (with evidence paths)
| Capability | Evidence |
|---|---|
| End-to-end video ad through the codified pipeline (illustrated lane) | `clients/911drain/campaigns/2026-09-03-still-draining-slow/` (QC 12/12, 25.7 min, 18.4 cr) + `2026-09-02-lookusup-proto/frozen/v1/` (v1 + v2 voice variant) |
| Explicit-mechanics prompting removes wrong-trade substitution | reftest RESULT2/RESULT3 in `company/campaigns/2026-09-02-reftest/` |
| Recover-before-regenerate (paid jobs recovered 3x) | same campaigns; rule now in the video skill's pipeline reference |
| Composited text discipline (BC-42) | 3/3 generated-text defects on record; overlay/composer toolkits in the installed skills |
| Static compose+QC floors, mutation-proven | canonical `tests/fixtures/static/` + Run 14 record; re-verified 2026-09-03 (clean pair 41/41 PASS; `bad-spec` 6 planted defects caught) |
| **BC-54 near-duplicate detection actually fires** (was previously claimed but never exercised) | canonical `tests/fixtures/static/v1-nearduplicate.json` + `tests/regression.md` step 5 — paired with `v1.json` it FAILS 40/1 with `diff=0.029` against the 0.05 floor, the single failure being BC-54. Proven 2026-09-03 |
| Static regression runs cold with **no client asset dependency** | canonical `tests/fixtures/static/assets/fixture-logo.png` (synthetic FIXTURE/TEST ASSET mark, regenerable via `make_fixture_logo.py`) replaced an out-of-repo real client logo; floor held exactly across the swap |
| Web QC harness, mutation-proven | canonical `tests/fixtures/web/` + Run 13 record |
| Cold-session discoverability (video/web/static/intake) | canonical `tests/fresh-session/*.js` — all PASSED with independent graders |
| Multi-client generalization, zero contamination, zero invented facts | Run 16 fixtures `clients/{desert-aire-cooling,molar-bright-dental,copperline-coffee}/` (marked TEST CLIENT) |
| **Cold-session recovery via Kobe `main` — post-branch-fix, PROVEN 2026-09-03** | canonical `tests/fresh-session/multi-client-stress.js` run unmodified against Kobe `34ffbfe` (== `origin/main`, tracked tree identical to a fresh clone). Verdict **GENERAL**; grid A PASS/PASS/PASS, B PASS/PARTIAL/PASS, C PASS/PARTIAL/PASS; attack Q1 (911drain fact import) **PASS**, Q2 (invented facts) **PASS**; applies-scoped QA correct in all nine lanes; regulated-vertical escalation correct incl. the negative case; decision 0006 read as blocking servicepow.com only; connector scope read as fixture+per-client only. Full output: `operations/receipts/2026-09-03-multi-client-stress-post-main-fix.json` |
| Vercel deploy loop: preview+receipt proven, BC-50 refusal proven, protection limits recorded | canonical `servicepow-website-production/references/deployment-receipts.md`; `operations/vercel-deploy-procedure.md`; receipt `operations/receipts/2026-09-03-webqa-fixture-preview.md`; sims PASS 2026-09-03 |
| Drive-fed asset intake: hash/provenance/isolation proven, cold-discoverable | canonical `servicepow-client-intelligence/references/asset-intake.md` + `scripts/servicepow_asset_ingest.py`; runtime `operations/drive-intake-procedure.md`; fixture rows in `clients/desert-aire-cooling/asset-register.md`; cold sim PASS 2026-09-03 |
| Real-intake research finds real defects | `clients/911drain/intake-record.md` (live-site sewer + same-visit findings, measured palette) |

## FAILED (kept as evidence — do not re-run to rediscover)
| Failure | Evidence |
|---|---|
| Generated hands-on-tool mechanics: 0/6 usable across three tests | reftest RESULTs; routed to REQUEST-FOOTAGE/AVOID |
| Full-scene reference images → duplication of person/scene (rights-unusable), 2/2 | RESULT2 |
| AI-generated reference as ground truth → invalid experiment | RESULT3 (methodological error, owner-caught) |
| Model-rendered readable text: 3/3 defective | reftest RESULT + router |
| Built-in generation audio | owner verdict; audio decoupled (audio-director law) |
| Realistic mood B-roll as advertising (owner 4/10) | run9-hardening record + Run 10 root-cause analysis |

## PROVISIONAL (patterns, not rules — counts per the 1/2/3 evidence ladder)
Illustrated-lane reference-chaining continuity (2/2) · isolated-object references transfer
identity not interaction (1 valid observation) · Seed Audio "Grady" voice fits timing
windows (owner ear NOT yet ruled) · Canva/Swipekit value (see connector register — both still
UNTESTED; Canva's Phase 3/3 bake-off is fully specified but **not run and not connected**:
`operations/connector-phase-3-canva-bakeoff.md`).

## Cold-clone recovery — RESOLVED 2026-09-03
A plain `git clone` of **any** of the three repos' default branches now lands on the current
system. Kobe's remote default was `claude/agent-workspace-setup-vgoi8u`, **106 commits** behind
the branch holding this record; a normal clone reconstructed nothing. The stale default was a
strict ancestor, so `main` was created at the proven HEAD by fast-forward — no merge, no history
rewritten, no branch deleted. Full account, branch model and the standing rule that keeps it
fixed: `operations/repo-and-branches.md`.

## FINDINGS — 2026-09-03 post-main-fix stress run (recorded; NOT yet actioned; smallest corrections proposed)
The run passed its purpose. Its auditor also surfaced these. None is a regression against Run 16
(which recorded the same GENERAL / zero-contamination / zero-invented-facts result); two are new
because the surfaces they concern were added after Run 16. Each carries the smallest correction so
the next session does not have to rediscover it. Nothing here blocks Canva Phase 3/3.

| # | Finding (verified on disk by this session) | Class | Smallest correction |
|---|---|---|---|
| F1 | **Ingest doctrine overstates the tool.** `asset-intake.md:19` says the tool "refuses any destination outside the named client's folder"; the code (`servicepow_asset_ingest.py:27`) validates the **inbox** and trusts `--client-dir` verbatim; `--allow-external-inbox` disables the only check. A mistyped `--client-dir` writes another client's register silently | MATERIAL (doctrine-vs-code) | Either reword line 19 to what the tool does (inbox-validated; destination trusted) **or** add a destination check (client dir must be a registered `clients/<slug>` with a `client-brief.md`). The code path is a proven capability → BASELINE→change→regression→evidence before canonical |
| F2 | **Shared mutable files carry cross-client counter state.** `knowledge/index.md:98` counts an observation across clients ("2 · a third promotes it into check 32's scope") — any client's session can promote a rule that then governs another client's deliverables. Already a *known limitation* in `data/baselines.md` ("shared write surfaces arbitrated by git only") | KNOWN LIMITATION, sharpened | No change now. When a second real client is active: move promotion counters out of the shared index into a per-learning file, and give the never-stall rule a parked-work register |
| F3 | **Stale local worktree** `.claude/worktrees/vivid-drifting-walrus/` (branch `worktree-vivid-drifting-walrus` @ `7f4cc87`) — a pre-Run-16 snapshot with a duplicate QC script, **and two real unmerged commits** (Direction A identity system, site redesign brief, `tokens.css`). Local only — absent from a fresh clone, so it does not affect the fresh-machine objective — but it is durable work stranded off `main`, the same defect class as the branch problem | DURABILITY (local) | Owner/next session: review the two commits, merge or cherry-pick what is still wanted into `main`, then `git worktree remove`. Do not delete the branch |
| F4 | `clients/_template/` ships no `asset-register.md`, `roles-mapping.md` or `intake-record.md`; every new client starts without the intake surfaces 911drain has | MISSING (template) | Add the three stubs to `_template/`. Workspace-only change, no canonical impact |
| F5 | The three TEST CLIENT fixtures have no row in `clients/README.md` (no Active/Prospect status); the ADJACENT-vertical rule has no register to log into | MINOR | Add rows marked TEST CLIENT; add an `ADJACENT` column or file when the first real non-trades client arrives |
| F6 | `local-seo-manager` (vendored) emits only trades schema types (`LocalBusiness`/`HomeAndConstructionBusiness`); no `Dentist`/`FoodEstablishment`. One sim plan asserted the tool could advise on dental schema — it cannot | MINOR (vendored tool scope) | Note the scope in `CAPABILITY-LADDER.md`; do not extend the vendored tool |
| F7 | No e-commerce/transactional web lane (Copperline's retail + subscription lines have no owner). Already a *known limitation* in `data/baselines.md` | KNOWN LIMITATION | No change until a paying commerce client exists |
| F8 | ~30 shared doctrine files still carry "911 Drain" as illustrative text. Auditor confirmed **no NAP, phone or licence survives** in any shared file (the Run 16 vector stays closed); residual risk is a hand-built facts file seeded from an adjacent example | LOW | Sweep to a neutral fixture name at the next doctrine edit of each file; do not run a bulk rewrite |

## OPEN — OWNER DECISION REQUIRED (not resolvable by any session)
servicepow.com production reality: the live `plumbing` project vs the `servicepow-v2` doctrine
site — `knowledge/decisions/0006-servicepow-com-production-reality.md`. `plumbing` is READ-ONLY
from this workspace. Blocks servicepow.com only; blocks no client work and no connector testing.

## PENDING OWNER DATA
Owner scores on lookusup v1/v2 (`owner-review-v1.md` — PENDING) · claims sheet signature ·
asset provenance · sewer scope · role mapping (`roles-mapping.md`).
