# Product requirements

**Product:** golf-launch-monitor (`golf-launch-monitor-0.1.0`, `SOFTWARE_VERSION` in `@glm/shot-pipeline`).
**Document date:** 2026-10-01. **Applies to:** schema `glm-schema-0.1.0`, coordinate system
`glm-world-1.0`, physics `glm-physics-0.1.0-provisional`, estimator `glm-launch-fit-0.1.0`. The
ground-model version changes often (an upgrade is in progress); every shot records the version
it used, and [terrain-model.md](terrain-model.md) describes the current one.

> **Current state in one sentence.** The Phase 0 and Phase 1 *library* software runs end to end
> on synthetic, replay and developer-manual data and is covered by passing automated tests. **No
> hardware exists, nothing has been measured, and nothing is VERIFIED against real-world data.**
> See [limitations.md](limitations.md) before using any number, and [safety.md](safety.md)
> before hitting a ball.

## 1. Status vocabulary

These words are used exactly as defined. The same words are used in [limitations.md](limitations.md).

| Status | Meaning |
|---|---|
| **CREATED** | A file or package scaffold exists. Its behavior is not complete. |
| **IMPLEMENTED** | Code exists and does what the requirement says. No automated test exercises it. |
| **TESTED** | Automated tests exist and pass (`npx vitest run`). They check the code against its own specification, synthetic data, or closed-form mechanics. They do **not** check it against reality. |
| **VERIFIED** | Checked against independent real-world measurements. **Nothing in this repository is VERIFIED.** |
| **Planned (Phase N) — not implemented** | Required, but no code exists yet. |

Snapshot: on 2026-10-01, before the ground-model v0.2 edits began,
`npx vitest run --project packages` passed every test file. That project covers
`packages/*/test` and the repository-level `tests/integration`, `tests/golden` and
`tests/replay`. `@glm/shot-pipeline` and `@glm/shot-simulator` have no package-local tests; the
repository-level tests exercise them end to end.

## 2. Product goal

A local-first launch monitor and practice simulator for a home garage. It turns sensor observations
of a golf shot into launch conditions, then into a simulated ball flight and roll. Every number
shows where it came from, how confident the system is, and what it depends on.

The product is useful only if it is honest. A clearly labeled "unavailable" is better than a
plausible-looking guess.

## 3. Users and setting

| Aspect | Requirement |
|---|---|
| Players | 1–2 players per session, right- or left-handed. Each player has a profile (name, handedness). |
| Place | A home garage or similar indoor bay: an impact screen or net a few meters from the tee, limited ceiling height and side clearance. Setup hazards are covered in [safety.md](safety.md). |
| Display | Desktop-first, legible from the hitting position (large type, dark theme by default). |
| Network | None required. All data stays on the local machine (§7, area K). |
| Expertise | Golfers see golfer units (yd, mph, °, rpm). An engineering-precision view exposes SI values, covariances and fit diagnostics. |

## 4. Principles

1. **Auditable measurement.** Every launch value is a `Measurement<T>` with `source`, `confidence`,
   optional `uncertainty` and `qualityFlags`. Every calculated result is a `CalculatedValue<T>`
   that lists the provenance of each input. Every `ShotRecord` stores the versions that produced
   it: coordinate system, schema, calibration, sensor configuration, ball profile, physics and
   ground model, estimator and software.
2. **Provenance never upgrades.** A value derived from several inputs takes the *least*
   trustworthy input's label (`combineSources`, `worstBadge`). Synthetic data is labeled
   `synthetic` and manual data `manual`; neither is ever `measured-*`. Estimated spin stays
   estimated.
3. **No fake precision.**
   - An unavailable value renders as "—", never 0.
   - A wide interval renders as a range ("Carry 163–171 yd").
   - Invalid shots show no carry or total, only the reason.
   - Clubs never carry a distance.
   - No single universal C_D, C_L or spin value is used as "golf physics".
4. **SI inside, golfer units at the edge.** Conversions happen only in display and export
   (`@glm/units`, [coordinate-system.md §2, §9](coordinate-system.md)).
5. **Deterministic.** Library code reads no clocks and no `Math.random()`. Randomness uses
   `createRng(seed)`; ids and timestamps are injected. The same inputs give identical records
   on the same JavaScript engine.
6. **Local and private by default.** No network calls. Raw observations are retained only with
   explicit consent (off by default). Users can delete their data ([safety.md §11](safety.md)).
7. **Fail safely.** A failed fit, missing spin, a ball outside the hitting zone, or a failed
   sensor produces `invalid` or `provisional` output with a stated reason. It never produces a
   fabricated number.

## 5. Launch conditions vs calculated results

| | Launch conditions (`LaunchState`) | Calculated results (`ShotMetrics`) |
|---|---|---|
| What | Ball state just after impact | Model outputs computed from the launch state |
| Authoritative form | SI vectors: `ballPositionM`, `velocityMps`, `angularVelocityRadPerSec` (spin ω, 3D) | `CalculatedValue<number>` per metric, SI units |
| Golfer-facing fields | Ball speed, vertical launch, horizontal launch (internal +left; shown as `L`/`R`), total spin, spin-axis tilt (+ = curves right). Derived from the vectors only. Backspin and sidespin exist for display only. | Carry, carry lateral, apex height and distance, flight time, descent angle, landing speed and direction, curve, spin at landing (**air model**). Total, total lateral, bounce, roll (**air + ground model**). |
| Provenance | `measured-camera` / `measured-radar` / `measured-hybrid` / `estimated-player-model` / `estimated-club-model` / `assumed-generic-fallback` / `manual` / `synthetic` / `unavailable` | Badge CALCULATED, plus `dependsOnEstimated` and `dependsOnSynthetic` and the list of input sources |
| Uncertainty | Covariance or sigma from the launch fit or spin estimate | Monte Carlo p05 / p50 / p95 of **launch** uncertainty only ([limitations.md](limitations.md#uncertainty-and-confidence)) |
| Phase 1 reality | **Never measured.** Every value is `synthetic`, `manual`, estimated, assumed or `unavailable`. | Inherits that. Total, bounce and roll are more model-dependent than carry. |

Club-delivery fields (club speed, smash factor, attack angle, path, face angles, dynamic loft and
lie, impact location, closure rate, low point) exist in the contract. They are always
`unavailable` (flag `no-club-sensor`). Club data is Planned (Phase 4) — not implemented.

Measurement vocabulary used in the UI and the docs:

- **Source labels:** measured, estimated, assumed, calculated, synthetic, manual, unavailable.
- **Validity:** `valid`, `provisional`, `invalid`.
- **Confidence:** a 0–1 policy score, labeled high (≥ 0.8), medium (≥ 0.5), low (> 0) or none (0).

## 6. Modes

Each mode builds on the packages below it. Statuses describe the code as of the document date.

| Mode | Purpose | Phase | Status |
|---|---|---|---|
| Safety | First-run checklist that must be acknowledged; product limits | 1 | UI: CREATED (in progress). Content: [safety.md](safety.md). |
| Setup | Data source, player, club, ball profile, environment (shows derived air density and which fields are defaults) | 1 | Libraries TESTED (adapters, `createEnvironmentProfile`, ball profiles). UI: CREATED (in progress). |
| Calibration | Calibration status (none / red / yellow / green). Phase 1 shows "no calibration: synthetic/replay mode". | 2 | Contract types and `calibrationFactor` TESTED. Calibration procedure: Planned (Phase 2) — not implemented. |
| Range | Hit synthetic shots, step through replays, shot card, 2D tracer (side and top views) | 1 | Pipeline, simulator and presentation TESTED. UI: CREATED (in progress). |
| Review | One shot in full: sources, uncertainty, fit diagnostics, confidence factors, versions, skipped-simulation reason | 1 | Data in `ShotRecord` TESTED. UI: CREATED (in progress). |
| History | Session shot list, delete session, CSV/JSON export | 1 | Persistence and export TESTED. UI: CREATED (in progress). |
| Players | Add, edit and delete players (optionally with their shots) | 1 | Repository TESTED. UI: CREATED (in progress). |
| Equipment | Bag of clubs (label, category, optional static loft, **no distances**); ball profiles with limitations | 1 | Contract and profiles TESTED. UI: CREATED (in progress). |
| Diagnostics | Adapter health, pipeline timing, storage integrity, versions | 1 | `getHealth`, `integrityReport` TESTED. UI: CREATED (in progress). |
| Settings | Units, precision, generic spin fallback (default OFF), raw-observation retention (default OFF), Monte Carlo samples (default 100), theme, developer mode | 1 | Pipeline options TESTED. UI: CREATED (in progress). |
| Course | Play holes on terrain with lies, penalties, scoring | 5 | Planned (Phase 5) — not implemented. Region terrain and surface catalog exist (TESTED). Shot penalties at rest are IMPLEMENTED only. |
| Putting | Green model, putting stroke, hole capture | 6 | Planned (Phase 6) — not implemented. |

## 7. Requirements by area

**Evidence** names the test file(s) or the source of the requirement. Test file paths are
relative to the package (`packages/<pkg>/test/…`) or to the repository root (`tests/…`).

### A. Data contract and provenance (`@glm/shared-types`, `@glm/launch-state`)

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| A1 | `Measurement<T>` invariants: `value === null` ⇔ `source === "unavailable"`; unavailable ⇒ confidence 0; confidence ∈ [0, 1]; finite values only. | TESTED | `shared-types/test/schemas.test.ts`, `launch-state/test/measurement.test.ts` |
| A2 | Contract objects are deep-frozen; schemas are strict (unknown fields rejected). | TESTED | `schemas.test.ts`, persistence immutability tests |
| A3 | Generated JSON Schemas stay in sync with the zod schemas and TypeScript types. | TESTED | `schemas.test.ts` (generated-files check), `type-parity.test.ts` |
| A4 | Derived values take the worst input provenance; a mixture of measured kinds becomes `measured-hybrid`. | TESTED | `launch-state/test/measurement.test.ts` (`combineSources`) |
| A5 | Synthetic or manual streams can never produce a `measured-*` label. | TESTED | `build.test.ts` ("never labels synthetic data as measured"), `tests/integration/pipeline.test.ts`, `tests/replay/replay.test.ts` |
| A6 | Every shot records the versions that produced it (§4.1). | TESTED | Schema-required fields; validated on every save and pipeline output |

### B. Coordinates, units and display (`@glm/units`, `@glm/presentation`)

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| B1 | World frame `glm-world-1.0` (+X target, +Y left, +Z up; spin tilt + = curves right). Lateral output is shown as a magnitude with `L`/`R`. | TESTED | Ballistics force sign tests; `display.test.ts` ("-2.1 deg -> '2.1° R'") |
| B2 | Exact conversion constants; rounding half away from zero; no `NaN` text. | TESTED | `units/test/conversions.test.ts`, `format.test.ts` |
| B3 | A range replaces a single number when the 90 % interval is wide. For distance: wider than 3 yd or 3 % of p50. Speed, spin, angle and duration have their own thresholds. | TESTED | `format.test.ts`, `display.test.ts` ("'163–171 yd' for an 8 yd carry interval") |
| B4 | Handedness changes labels only (draw / fade / hook / slice), never physics signs. | TESTED | `shape-and-banners.test.ts` |
| B5 | Metric definitions (definition, units, dependencies, limitations). Flight definitions match [coordinate-system.md §5](coordinate-system.md) verbatim. | TESTED | `definitions.test.ts` |

### C. Sensor adapters (`@glm/sensor-adapters`)

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| C1 | One `SensorAdapter` contract for every source; the UI never depends on a specific device. | TESTED | `synthetic-adapter.test.ts`, `replay.test.ts`, `manual-and-hardware.test.ts` |
| C2 | Synthetic adapter: observations are a pure function of (spec, seed, injected truth propagator). The noise model is a test setting, not a device model. | TESTED | `synthetic-generator.test.ts`, `synthetic-adapter.test.ts` |
| C3 | Replay JSON Lines format `glm-replay-1`. Versions must match exactly (no silent migration). A `live`/`replay` file must describe camera, radar or hybrid hardware and may not contain synthetic spin or synthetic/manual triggers. | TESTED | `replay.test.ts` |
| C4 | Manual entry adapter, developer testing only, labeled `manual`. | TESTED (adapter); see the spin-labeling note in [limitations.md](limitations.md#sensors-and-data-sources) | `manual-and-hardware.test.ts` |
| C5 | Camera, radar and hybrid adapters are honest placeholders. `connect`, `startCapture` and `calibrate` throw `HardwareNotAvailableError`; health is `disconnected`; they never emit. | TESTED (as placeholders; no driver exists) | `manual-and-hardware.test.ts` |
| C6 | Camera driver, trigger hardware, 2D detection, stereo 3D reconstruction. | Planned (Phase 2) — not implemented | — |
| C7 | Radar and hybrid drivers. | Planned (Phase 7) — not implemented | — |

### D. Shot pipeline (`@glm/shot-pipeline`, `@glm/launch-state`)

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| D1 | Segment the observation stream into shots with a pre/post-trigger window. Triggers within 50 ms are one impact. | Segmentation TESTED end to end; multi-trigger clustering IMPLEMENTED only (no pipeline test uses more than one trigger per shot) | `tests/integration/pipeline.test.ts` (one record per shot); `src/segmenter.ts` |
| D2 | Trigger fusion: subtract known per-source latency, take the median, combine confidences. A spread over 3 ms halves the confidence and warns. | IMPLEMENTED (single-trigger path exercised end to end; disagreement path untested) | `src/triggers.ts` |
| D3 | Launch fit: weighted nonlinear least squares whitened by each observation's covariance, robust outlier rejection, gravity-only seed fit, then a drag/lift-aware refit at the launch reference time. Covariance is inflated by max(1, χ²/dof). | TESTED | `launch-state/test/fit.test.ts`; integration "recovers launch conditions…", "outliers are rejected…" |
| D4 | A failed fit (e.g. fewer than 2 usable frames) gives an `invalid` state in which every launch value is `unavailable`. | TESTED | `build.test.ts`; integration "too few frames…" |
| D5 | Scoring eligibility: only live, valid, simulated shots may update an official score; synthetic, manual, replayed, provisional and invalid shots never do. | TESTED for synthetic; live branch IMPLEMENTED only (no live data exists) | Integration asserts `scoring.eligible === false` for synthetic |

### E. Spin (`@glm/launch-state` `resolveSpin`)

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| E1 | Mode hierarchy: (1) a spin observation that passes the quality gate; (2a) the player's own measured history (≥ 5 shots, same club category, ±15 % ball speed); (2b) per-club prior; (3) generic fallback **only if the user allowed it**; otherwise `unavailable`. | TESTED | `spin.test.ts` |
| E2 | A spin observation that fails the gate is never reported as measured; the reason becomes a warning. | TESTED | `spin.test.ts` |
| E3 | Club-prior spin is labeled `estimated-club-model` with a 35 % sigma. The spin axis is `unavailable` (zero tilt assumed for simulation), and curve is withheld. | TESTED | `spin.test.ts`; integration "club-model estimate…" |
| E4 | Unavailable spin: no simulation and an explicit reason. Ball speed and launch angles are kept. | TESTED | Integration "unavailable spin without a club or fallback…" |
| E5 | Spin measured from images (marked ball or dimple tracking). | Planned (Phase 2) — not implemented | — |

### F. Confidence and validity

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| F1 | Overall confidence = weighted geometric mean of factor scores. A blocking factor or overall < 0.35 ⇒ `invalid`. Overall < 0.7, spin not from an observation, or manual data ⇒ `provisional`. | TESTED | `confidence.test.ts` |
| F2 | Calibration `none` or `red` blocks live and replay data; synthetic and manual data do not depend on calibration. | TESTED (unit level; no live data exists) | `confidence.test.ts` |
| F3 | Ball outside the hitting zone, multiple balls, or a failed or disconnected sensor ⇒ `invalid` with the reason preserved. | TESTED | `confidence.test.ts`; integration "ball outside the calibrated hitting zone…" |
| F4 | Calculated-metric confidence is capped. Caps: ball-profile ceiling (0.4–0.6) and spin confidence. Factors: × 0.75 for ground metrics, × 0.6 for lateral/ground metrics with an assumed spin axis, × 0.9 outdoors with defaulted environment fields. | IMPLEMENTED (spin cap TESTED end to end) | `shot-simulator/src/metrics.ts`; integration "generic fallback…" |

### G. Air-flight physics (`@glm/ballistics`) — details in [physics-model.md](physics-model.md)

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| G1 | 9-state RK4 (position, velocity, spin vector): gravity, drag C_D(Re, S), Magnus lift from perpendicular spin, spin decay. Ground-contact time located by bisection (tests require ≤ 1e-6 s). | TESTED | `forces.test.ts`, `flight.test.ts`, `aero-models.test.ts`, `propagate.test.ts` |
| G2 | Environment: moist-air density and viscosity always computed, never input. Every field records its provenance (`default`, `user`, `sensor`, `derived`). Input ranges are validated. | TESTED | `environment.test.ts` |
| G3 | Ball profiles name model ids and parameters, applicable ranges, a confidence ceiling, limitations and warnings. | TESTED | `aero-models.test.ts` |
| G4 | Plausibility envelope against two public tour averages: a **sanity check, not validation**. | TESTED | `plausibility-envelope.test.ts` |
| G5 | Aerodynamic parameters fit to measured trajectories; ball-specific profiles. | Planned (Phase 7) — not implemented | — |

### H. Terrain and ground (`@glm/terrain-engine`, `@glm/ground-physics`) — details in [terrain-model.md](terrain-model.md)

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| H1 | Terrain queries: plane, flat range at `z = −(r + tee)`, polygon surface regions. | TESTED | `terrain.test.ts` |
| H2 | Provisional surface catalog. Hand overrides are re-versioned and never pass as fitted. | TESTED | `terrain.test.ts` |
| H3 | Bounce, skid and roll to rest; signed along-track bounce and roll distances. | TESTED against mechanics and invariants, **not data**; provisional; under revision | `ground-physics/test/*` |
| H4 | Lie at rest; penalty strokes for water, out of bounds and penalty areas. | Lie mapping TESTED; penalties IMPLEMENTED only | `terrain.test.ts`; `shot-simulator/src/simulate.ts` |
| H5 | Course terrain from height maps; hole and cup capture. | Planned (Phases 5–6) — not implemented | [terrain-model.md §1.1](terrain-model.md) |

### I. Uncertainty (`@glm/shot-simulator`)

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| I1 | Seeded Monte Carlo propagation of launch velocity and spin uncertainty through air and ground simulation. Reports p05 / p50 / p95 per metric (default 100 samples in a range session). | TESTED | `tests/integration/uncertainty-calibration.test.ts` |
| I2 | On synthetic data, the reported 1σ ball-speed and launch-angle intervals cover the truth about 68 % of the time, and the 90 % carry interval covers the true carry in most trials. | TESTED (synthetic only; truth uses the same physics) | `uncertainty-calibration.test.ts` |
| I3 | Uncertainty from physics-model and ground-model error. | Planned (Phase 7) — not implemented | [limitations.md](limitations.md#uncertainty-and-confidence) |

### J. Presentation (`@glm/presentation`)

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| J1 | Badges MEASURED / ESTIMATED / ASSUMED / CALCULATED / SYNTHETIC / MANUAL / UNAVAILABLE. Only `measured-*` maps to MEASURED. On a synthetic or manual stream, `measured-*` labels are downgraded. | TESTED | `provenance.test.ts`, `display.test.ts` |
| J2 | A calculated value names its non-measured inputs ("Calculated; depends on estimated spin"). | TESTED | `display.test.ts` |
| J3 | Data-origin banner for every non-live origin ("SYNTHETIC DATA — generated for testing, not measured."). The validity banner passes rejection reasons and warnings through verbatim. | TESTED | `shape-and-banners.test.ts` |

### K. Persistence and export (`@glm/persistence`)

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| K1 | Local repositories: IndexedDB (browser), one JSON file per record (Node, atomic writes), in-memory. Every save and load is schema-validated. Corrupt records are excluded from lists and reported, never repaired. | TESTED | `indexeddb.test.ts`, `json-directory.test.ts`, `memory.test.ts` |
| K2 | Delete a player (with or without their shots), delete a session (cascades to its shots), delete a shot, clear everything. | TESTED | Repository contract tests |
| K3 | CSV export: sign convention in column names, empty cell for unavailable, formula-injection guard. Versioned JSON export and validated import. | TESTED | `export.test.ts` |
| K4 | No network access in any package. | IMPLEMENTED (by inspection; no package source makes network calls) | — |

### L. Validation tooling (`@glm/validation`) and datasets

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| L1 | Error statistics: bias, MAE, RMSE, median, p95 \|error\|. Missing values are skipped and counted, never zero-filled. | TESTED | `stats.test.ts` |
| L2 | Deterministic train / validation / held-out partitions. Held-out access needs an explicit acknowledgment and is logged. | TESTED | `partition.test.ts` |
| L3 | Reference-monitor comparison converts units and signs explicitly. A metric with a different definition (e.g. carry to launch height vs first ground contact) is refused, not compared. | TESTED | `reference.test.ts` |
| L4 | Synthetic replay dataset and golden summary. Regenerating gives byte-identical files; replay is deterministic. | TESTED | `tests/golden/golden.test.ts` |
| L5 | Real reference measurements (`datasets/reference-measurements/`, `datasets/raw-shots/`, `datasets/calibration/` are empty). | Planned (Phases 2–3) — not implemented | — |

### M. Desktop UI (`apps/desktop-ui`)

The Phase 1 UI is being built now. At the document date the package is **CREATED**: source files
are being written and no UI tests exist yet. Requirements, all Phase 1:

- Pipeline runs in a Web Worker, with an in-process fallback.
- Every metric shows its badge and a detail panel.
- A permanent data-origin banner is shown for non-live data.
- Unavailable values show "—"; wide intervals show ranges.
- Invalid shots show the skipped-simulation reason instead of carry and total.
- Hardware sources are shown but disabled with the honest message.
- Safety gate before the range screen.
- Course and putting appear as disabled "not built yet" entries.
- No network calls and no analytics.

Update this section when the UI tests land.

### N. Safety and privacy

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| N1 | First-run safety acknowledgment covering [safety.md](safety.md); always reachable afterwards. | CREATED (UI in progress) | — |
| N2 | Raw observations are stored in a shot record only with consent; the default is off. | TESTED | Integration "raw observations are retained only with consent", "…invalid, no simulation" (`rawObservations === null`) |
| N3 | Raw camera frames (`rawCapturePaths`) are retained only with diagnostic consent. | Planned (Phase 2) — not implemented (no frames exist; always empty) | — |

## 8. Acceptance criteria for phase completion

A phase is complete only when **all** of the following hold.

1. Every requirement assigned to the phase is TESTED. `npm run check` (typecheck and all tests)
   passes.
2. Tests can fail. They assert specific numbers, signs and error cases, not just "is defined".
3. Every new data path has a test showing that synthetic, manual, estimated and assumed values
   never appear as MEASURED, and that unavailable values never appear as numbers.
4. Any change to a model, constant or default bumps its version string in the same commit.
   Golden files are regenerated and the diff is explained.
5. This file's status columns and [limitations.md](limitations.md) are updated. No document
   claims more than the evidence shows.

Phases that involve hardware also need evidence against reality before any metric may be called
VERIFIED.

6. Collect launch data alongside an **independent** reference instrument. Normalize it with
   `@glm/validation` (refusing incompatible definitions).
7. Write the numeric accuracy targets per metric **before** data collection and record them
   here. No targets are set yet.
8. Report error statistics (L1) on the **held-out** partition only, never on data used for
   tuning.
9. Scope a VERIFIED status to the conditions tested: clubs, speeds, lighting, ball type and
   setup.

## 9. Phase plan

Where the phase numbers come from:

- Code comments name Phase 2 (vision pipeline, calibration) and Phase 4 (club delivery).
- The Phase 1 UI specification names Phase 5 (course) and Phase 6 (putting).
- [architecture.md](architecture.md) uses the same Phases 0–2 and 4–6, assigns no work to
  Phase 3, and does not use Phase 7. The scopes of Phases 3 and 7 below are a proposal made in
  this document.

| Phase | Scope | Status |
|---|---|---|
| 0 | Foundations: data contracts and JSON Schemas, coordinate system, units, core math, persistence, replay format, synthetic generator, validation tooling | **Software complete; TESTED** on synthetic and replay data |
| 1 | Range mode without hardware: shot pipeline, launch fit, spin resolution, confidence and validity, air physics, provisional ground model, Monte Carlo, presentation, desktop UI | **Library software complete; TESTED** on synthetic, replay and manual data. Desktop UI: CREATED, in progress. Ground model under revision. |
| 2 | Camera hardware: device driver, trigger hardware, calibration (ChArUco intrinsics, extrinsics, target line, reprojection-error checks), ball detection and stereo 3D reconstruction, spin from ball markings or dimples, sensor health. First measured launch data. | Not started |
| 3 | Validation: compare measured launch data (including spin) against an independent reference instrument, using accuracy targets set in advance (§8). Only then can a launch metric become VERIFIED, scoped to the conditions tested. | Not started |
| 4 | Club-delivery data and its sign conventions | Not started |
| 5 | Course play: height-map terrain, lies, penalties, scoring (provisional shots only as a casual-mode override) | Not started |
| 6 | Putting: green model, putting launch, hole capture | Not started |
| 7 | Radar and hybrid sensors. Fit aerodynamic and ground parameters to measured full-flight trajectories, with held-out validation. Model-error uncertainty. | Not started |

## 10. Non-goals

- **Betting or wagering** of any kind.
- **Certified or sanctioned competition** use, handicap submission, or equipment conformance
  testing.
- **Safety-critical decisions.** The product does not judge whether a setup is safe;
  [safety.md](safety.md) gives general precautions only.
- **Claims of parity with commercial or professional launch monitors.** The product makes no
  accuracy claim until the criteria in §8 are met, and then only for the conditions tested.
- **Hard-coded club distances,** or a single "universal" golf-ball aerodynamic model.
- **Cloud accounts, uploads, telemetry or analytics.**

## Related documents

- [architecture.md](architecture.md): layers, packages, provenance model, process model.
- [coordinate-system.md](coordinate-system.md): axes, signs, spin conventions, metric definitions.
- [physics-model.md](physics-model.md): air-flight model, provisional coefficients, sources.
- [terrain-model.md](terrain-model.md): terrain, surfaces, bounce and roll (current ground-model version).
- [limitations.md](limitations.md): what the numbers cannot tell you.
- [safety.md](safety.md): physical setup and data-privacy precautions.
