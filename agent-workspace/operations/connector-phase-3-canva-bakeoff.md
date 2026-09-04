---
title: "Connector Phase 3/3 — Canva controlled bake-off (SPECIFICATION, not yet run)"
type: procedure
client: internal
owner: APPROVER
status: probe-complete — Outcome B recorded 2026-09-04 (register/Evidence Index/run ledger)
created: 2026-09-03
tags: [connectors, canva, static, bake-off, regression]
---
# Connector Phase 3/3 — Canva controlled bake-off

**State 2026-09-04: §4 step 2 executed read-only → Outcome B.** Read access PROVEN; zero brand
kits/templates/autofill designs; manifest-grade geometry reachable only through an editing
transaction → REJECTED for the gated lane, PROVISIONAL candidate for the ungated handoff use.
Verdict and evidence live in `connector-register.md` and `knowledge/EVIDENCE-INDEX.md`; nothing
below was altered. Steps 3-5 are **not** authorised — they require the owner's decision recorded
in the register's next-gate cell. This document existed so the test was specified *before* it ran
and could not be redesigned around its own result; that held.

Governing law: `.claude/skills/_servicepow/policies/baseline-and-regression.md` §4 —
connectors augment the system, never redesign it; one successful test is PROVISIONAL, not
doctrine; **a connector that improves one capability while degrading another fails its
regression test by definition.**
Spend law: `.claude/skills/_servicepow/policies/generation-and-spend.md`.
Brand law: `.claude/skills/_servicepow/policies/brand-assets.md`.

## 1. What is being compared

| | Incumbent | Challenger |
|---|---|---|
| Path | `servicepow_static_compose.py` → `servicepow_static_qc.py` | Canva MCP brand-template autofill → export |
| Proven floor | clean pair **41/41 PASS**; planted defects **6 caught**; BC-54 near-duplicate **fires** | none — UNTESTED |
| Cost | **0 credits**, seconds per export | unknown; Canva plan + API limits to be established |
| Contract | compose-time manifest: per-element boxes, font px, measured contrast | PNG export; manifest availability is the open question |

**The judge is our QC battery, not the artwork.** "Looks better" is not a verdict. The bake-off
asks one question: can Canva-produced statics clear the *same machine gates on the same class
of evidence*, without weakening any gate?

## 2. The crux — the manifest gap

BC-52 is explicit: *"Measured from the compose manifest — exports without a manifest cannot
pass."* Our composer measures geometry, type size and contrast **at compose time**. Canva
returns a rendered image. So the probe in §4 step 2 resolves the test into one of three
outcomes, decided **before** any artwork is produced:

- **Outcome A — Canva exposes element geometry and typography.** A manifest adapter can be
  written that emits the same contract from Canva's own numbers. The full bake-off proceeds and
  a real parity comparison is possible.
- **Outcome B — geometry is not exposed; only the PNG is.** BC-52 would drop from
  *machine-measured* to *post-hoc inferred* (OCR/vision guesswork about which text sits where,
  against which local background). That is a **capability degradation**, and §4 rejects it by
  definition. → **REJECTED for the gated production lane.** Canva may still be recorded
  PROVISIONAL for an *ungated* use (e.g. a client-editable handoff file produced *after* our
  own gated export exists), which changes nothing about how ads are gated.
- **Outcome C — export cannot hit exact placement pixels, or the API refuses programmatic
  export at our plan level.** BC-51 requires exact dimensions, "never close." → **REJECTED.**

Recording the outcome letter is mandatory whichever way it lands. A B or C result is a real
finding worth keeping, not a failed session.

## 3. Fixtures — exact, and no client material

All inputs come from the canonical fixture set. **No client content, no client brand asset, and
no live campaign work goes through Canva during the bake-off.**

| Role | File |
|---|---|
| Story variant | `tests/fixtures/static/v1.json` |
| Square variant | `tests/fixtures/static/v2.json` |
| Planted-defect variant | `tests/fixtures/static/bad-spec.json` |
| Near-duplicate variant | `tests/fixtures/static/v1-nearduplicate.json` |
| Facts (required + barred strings) | `tests/fixtures/static/facts.json` |
| Brand mark | `tests/fixtures/static/assets/fixture-logo.png` |

The fixture mark matters here specifically: it means **no real client's identity asset is
uploaded to a third-party service to run this test.** If the bake-off later needs a second
content set for the PROVEN bar (§6), it uses a second *fixture* client, never a live one.

## 4. Protocol

0. **Owner approves the connection.** Not before.
1. **Snapshot the baseline.** Re-run `tests/regression.md` steps 1-6 and record the numbers.
   This is the floor the connector must not move.
2. **Read-only capability probe.** Enumerate the connector's tools. Establish, without
   producing artwork: does brand-template autofill return element geometry, font sizes and
   colors? Can export be pinned to exact pixel dimensions? What does the plan permit? →
   resolves Outcome A / B / C. **If B or C, stop here and record the verdict.**
3. **Build the manifest adapter** (Outcome A only): map Canva's element response to our
   manifest contract — `placement`, `size`, `safe`, `elements[]{role, box, font_px, contrast}`.
   The adapter is *test-scoped*; it is not installed into `skills/` at this stage.
4. **Produce both paths from identical input.** Same copy, same fixture mark, same palette,
   same placements. Incumbent: compose + QC. Challenger: autofill + export + adapter + the
   **identical, unmodified** `servicepow_static_qc.py`.
5. **Run the defect cases through Canva too.** Reproduce `bad-spec.json` and
   `v1-nearduplicate.json` as Canva artifacts and gate them. **A challenger whose output our
   gates cannot fail is worse than useless** — a path that silently passes planted defects is
   an immediate REJECTED regardless of how the clean case scored.

## 5. Scoring — five recorded dimensions

Every score cites a file or a tool output. No dimension is scored from impression.

| # | Dimension | Passing evidence |
|---|---|---|
| 1 | Gate parity | Canva exports clear the identical battery on **measured** inputs, matching the incumbent's counts |
| 2 | Defect detectability | `bad-spec` and near-duplicate equivalents still FAIL, with the same gate ids firing |
| 3 | BC-42 composited text | text is real glyphs, never model-rendered (Canva is typographic — expected PASS, still verified) |
| 4 | Brand truth (`brand-assets.md`, LB24 lineage) | the supplied mark is placed as supplied and never regenerated, restyled or auto-traced |
| 5 | Cost and time | credits/plan cost and wall-clock per export, against 0 credits and seconds |

## 6. Verdict rules — pre-committed

Fixed before the test runs so the result cannot be rationalised afterward.

- **PROVEN** requires **all** of: gate parity on machine-measured inputs (dimension 1); planted
  defects still caught (dimension 2); dimensions 3 and 4 clean; a **second independent fixture
  content set** reproducing the result; and the full regression floor held **exactly**. One
  clean run never reaches PROVEN.
- **PROVISIONAL** — one clean run, or a clean run in an ungated use only. Recorded with its
  date and its next gate. Not doctrine, not routed to client work.
- **REJECTED** — Outcome B or C; any gate degraded from machine-measured to human-inferred; any
  planted defect passing; any regression-floor number below baseline; or any requirement to
  weaken, skip or fork a gate to accommodate the tool.
- A tie goes to the incumbent. The composer is proven, free and already gated; "as good as" is
  not a reason to adopt.

## 7. Regression and durability requirements

- Nothing installs into `skills/` until the verdict is PROVEN. The adapter stays test-scoped.
- The **full** floor re-runs after the bake-off: validator, registry count, web good/bad,
  static clean/bad, BC-54 duplicate case, video preflight — all must match `data/baselines.md`.
- Result is written durably **whatever it is**: connector register row (state, score, dated
  basis, next gate), Evidence Index row (PROVEN table, or the FAILED table — failures are kept
  precisely so nobody re-runs them to rediscover), run ledger line, committed in canonical and
  Kobe.
- **Documentation repair never advances the baseline.** Only a material capability improvement,
  proven by the floor, justifies BASELINE V2 with its own tag.

## 8. Spend rules

- The probe (§4 step 2) is read-only and must cost nothing.
- Any paid plan, credit purchase or per-export cost requires the full
  `generation-and-spend.md` sequence — method → live tool state → expected cost → policy →
  **SPEND_APPROVER** → execute. No vendor default bypasses it.
- **No media generation of any kind** in this phase. The bake-off composes text and a supplied
  mark; it does not buy or generate imagery.
- If Canva's free tier cannot complete §4, that is a cost finding to record and bring to the
  owner — not a reason to spend.

## 9. Out of scope

Video, website and outbound lanes are untouched. The `plumbing` / servicepow-v2 production
conflict (`decisions/0006-servicepow-com-production-reality.md`) is **unrelated and must not be
resolved, referenced as settled, or worked around by this phase.**
