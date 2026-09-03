---
title: "Connector Register — states and evidence"
type: register
client: internal
owner: SPEND_APPROVER
status: active
created: 2026-09-03
tags: [connectors, governance]
---
# Connector Register
States: UNTESTED → TESTING → PROVISIONAL → PROVEN / REJECTED. One test never makes doctrine
(`baseline-and-regression.md` §4). Scores move with evidence, both directions.

| Connector | State | Score | Basis (dated) | Next gate |
|---|---|---|---|---|
| Higgsfield CLI | PROVEN | 9 | the production engine, Runs 9-14; CLI path only, MCP connector not used | — |
| Google Drive (connected) | **PROVEN** | 9 | 2026-09-03 wiring test: transport probed live (ServicePow OS 2 tree found, folder ids recorded; ZERO media files exist yet — pipe proven but empty); asset-intake doctrine + ingest tool installed; live fixture ingest produced hashed UNKNOWN-provenance rows; isolation refusal fired; cold-session sim PASS incl. the logo-trap answer (NO on two stacked rules); regression floor held exactly (validator 15/15, web 24/14, static 41/41). **Scope note 2026-09-03 (stress-run F1):** the tool's isolation refusal is *inbox*-validated; the destination `--client-dir` is trusted verbatim — `asset-intake.md` overstates this. Proven what it proves, no more | create per-client Drive folders as clients supply files; owner triage of 2 un-ingested 911drain Drive docs; resolve F1 (doctrine wording or destination check) via the baseline law |
| Vercel MCP (connected) | **PROVEN** | 8 | 2026-09-03 wiring: deployment-receipts doctrine installed; REAL preview deployed (dpl_3t7cabnv4..., fixture project, zero risk to live projects); Deployment Protection ON team-wide recorded; MCP read-back limits recorded (get_deployment 404 on live id, share-link refused) with identical-local QA fallback exercised; cold deploy sim PASS; BC-50 attack sim PASS (refused unauthorized production deploy, correct doctrine, one-decision approval packet offered); regression floor held exactly. **Proven scope = fixture + per-client projects ONLY** | ⛔ OWNER DECISION REQUIRED — locked in `knowledge/decisions/0006-servicepow-com-production-reality.md`; `plumbing` = READ-ONLY from this workspace. Scope cannot extend to a servicepow.com production surface until that decision is ruled |
| Chrome automation (present) | PROVISIONAL | 7 | live-site research worked (Run 15 findings) | use for rendered receipts + Ad Library before buying tools |
| Canva MCP | UNTESTED | 8p | 2026-09-03 audit: brand-template autofill/export; BC-42/LB24-compatible; manifest gap is the risk. **Phase 3/3 bake-off now fully specified before connection: `operations/connector-phase-3-canva-bakeoff.md`** (A/B/C outcomes, fixture set, verdict rules pre-committed) | OWNER APPROVAL TO CONNECT, then run that spec |
| Swipekit | UNTESTED | 6p | audit: capture/boards ~$29-39/mo; competitive-intelligence has zero artifacts ever | free Chrome Ad-Library pass FIRST; buy only if insufficient |
| ElevenLabs | DEFERRED | 7p | owner deprioritized audio 2026-09-03; Grady unruled | owner ear verdict on v1-vs-v2 |
| Adobe (Express-level MCP) | WAIT/RESEARCH | 4 | duplicates Canva lane; generation half barred (no new gen platforms) | re-evaluate if Canva fails or real-photo extend recurs |
| Frame.io | WAIT | 3 | no review volume | 3+ concurrent video clients |
| Analytics/Meta data | WAIT | 5 | no live campaign | first live campaign |
| Figma | UNNECESSARY | 2 | decision 0002: code-direct builds | web lane demonstrates a design-file need |
| Creatomate-class | REJECTED | 1 | duplicates proven assembly + bypasses QC contract | evidence overturning duplication |
