# Product requirements

**Product:** golf-launch-monitor (`golf-launch-monitor-0.1.0`, `SOFTWARE_VERSION` in `@glm/shot-pipeline`).
**Document date:** 2026-10-01. **Applies to:** schema `glm-schema-0.1.0`, coordinate system
`glm-world-1.0`, physics `glm-physics-0.1.0-provisional`, ground model
`glm-ground-0.2.0-provisional`, terrain `glm-terrain-0.2.0`, shot simulator `glm-shot-sim-0.1.0`,
estimator `glm-launch-fit-0.1.0`. Every shot records the versions it used
([architecture.md §7](architecture.md#7-versioning-and-contracts)).

> **Current state in one sentence.** The Phase 0 and Phase 1 software, libraries and desktop
> range UI, runs end to end on synthetic, replay and developer-manual data and is covered by
> passing automated tests. **No hardware exists, nothing has been measured, and nothing is
> VERIFIED against real-world data.** See [limitations.md](limitations.md) before using any
> number, and [safety.md](safety.md) before hitting a ball.

## 1. Status vocabulary

These words are used exactly as defined. The same words are used in [limitations.md](limitations.md).

| Status | Meaning |
|---|---|
| **CREATED** | A file or package scaffold exists. Its behavior is not complete. |
| **IMPLEMENTED** | Code exists and does what the requirement says. No automated test exercises it. |
| **TESTED** | Automated tests exist and pass (`npx vitest run`). They check the code against its own specification, synthetic data, or closed-form mechanics. They do **not** check it against reality. |
| **VERIFIED** | Checked against independent real-world measurements. **Nothing in this repository is VERIFIED.** |
| **Planned (Phase N) — not implemented** | Required, but no code exists yet. |

Snapshot: on 2026-10-01, after ground model v0.2 and the desktop UI landed, `npx vitest run`
passed every test file. The run has two Vitest projects: `packages` (`packages/*/test` and the
repository-level `tests/integration`, `tests/golden` and `tests/replay`) and `desktop-ui`
(`apps/desktop-ui/test`, 79 tests in jsdom). Every package, including `@glm/shot-pipeline` and
`@glm/shot-simulator`, has package-local tests. `npx tsc -p tsconfig.json --noEmit` and
`npm run build --workspaces --if-present` also passed.

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
   it: coordinate system, schema, calibration, sensor configuration, ball profile, physics,
   ground model and shot simulator (one physics tag), estimator and software.
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
| Uncertainty | Covariance or sigma from the launch fit or spin estimate | Monte Carlo p05 / p50 / p95 of **launch** velocity and spin uncertainty only; model error is not included ([limitations.md](limitations.md#uncertainty-and-confidence)) |
| Confidence | Launch-data confidence: `LaunchState.overallConfidence` (fit, sensor, calibration, trigger, ball zone, spin) | Flight-model confidence: `ShotResult.simulationConfidence`, capped by the ball profile's ceiling and the spin's own confidence; each metric carries its own capped confidence. The UI shows the two separately. |
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
UI tests are in `apps/desktop-ui/test` (names quoted).

| Mode | Purpose | Phase | Status |
|---|---|---|---|
| Safety | First-run checklist that must be acknowledged before the range screen unlocks; always reachable | 1 | TESTED ("blocks the range screen until the checklist is acknowledged…"). Content: [safety.md](safety.md). |
| Setup | Data source, player, club, ball profile, environment (shows derived air density and which fields are defaults) | 1 | TESTED ("shows the derived air density and which environment fields are defaults", "lists camera, radar and hybrid as disabled with the honest no-driver message"). |
| Calibration | Calibration status (none / red / yellow / green). Phase 1 shows "No calibration: synthetic/replay mode", or a replay's recorded calibration, with the wizard disabled. | 2 | Status screen TESTED ("calibration shows the Phase 1 status and disabled wizard…"). Contract types and `calibrationFactor` TESTED. Calibration procedure: Planned (Phase 2) — not implemented. |
| Range | Hit synthetic shots, step through replays, developer manual entry; shot card; 2D tracer (side and top views) | 1 | TESTED (pipeline, simulator, presentation; UI "hits a synthetic shot, shows the card…", tracer tests). |
| Review | One shot in full: sources, uncertainty, fit diagnostics, confidence factors, versions, skipped-simulation reason | 1 | Data in `ShotRecord` TESTED; screen IMPLEMENTED (no dedicated UI test). |
| History | Session shot list, delete session, CSV/JSON export | 1 | Persistence and export TESTED; UI export TESTED (CSV header checked in "hits a synthetic shot…"); UI delete-session IMPLEMENTED. |
| Players | Add, edit and delete players (optionally with their shots) | 1 | TESTED ("adds, edits and deletes a player…"). |
| Equipment | Bag of clubs (label, category, optional static loft, **no distances**); ball profiles with limitations | 1 | TESTED ("equipment shows the bag without distances and every ball profile's warnings"). |
| Diagnostics | Adapter health, pipeline timing, storage integrity, versions | 1 | TESTED ("diagnostics shows versions and runs the storage integrity check"). |
| Settings | Units, precision, generic spin fallback (default OFF), raw-observation retention (default OFF), Monte Carlo samples (default 100), theme, developer mode | 1 | TESTED ("generic spin fallback and raw-observation consent default OFF…", "the Monte Carlo field commits on blur…", state tests). |
| Course | Play holes on terrain with lies, penalties, scoring | 5 | Planned (Phase 5) — not implemented. Shown as a disabled entry (TESTED). Region terrain and surface catalog exist (TESTED). Penalty at rest: water TESTED, out-of-bounds and penalty area IMPLEMENTED only. |
| Putting | Green model, putting stroke, hole capture | 6 | Planned (Phase 6) — not implemented. Shown as a disabled entry (TESTED). |

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
| C4 | Manual entry adapter, developer testing only, labeled `manual`, including typed spin. | TESTED (adapter, pipeline and UI); its spin quality fields are placeholders, see [limitations.md](limitations.md#sensors-and-data-sources) | `manual-and-hardware.test.ts`; `shot-pipeline/test/process.test.ts`; `apps/desktop-ui/test/shot-card.test.tsx` ("a developer manual shot is MANUAL everywhere…") |
| C5 | Camera, radar and hybrid adapters are honest placeholders. `connect`, `startCapture` and `calibrate` throw `HardwareNotAvailableError`; health is `disconnected`; they never emit. | TESTED (as placeholders; no driver exists) | `manual-and-hardware.test.ts` |
| C6 | Camera driver, trigger hardware, 2D detection, stereo 3D reconstruction. | Planned (Phase 2) — not implemented | — |
| C7 | Radar and hybrid drivers. | Not implemented; no phase assigned in the product owner's plan (§9) | — |

### D. Shot pipeline (`@glm/shot-pipeline`, `@glm/launch-state`)

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| D1 | Segment the observation stream into shots with a pre/post-trigger window (0.25 s / 0.5 s by default). Triggers within 10 ms of the first are one impact (`TRIGGER_CLUSTER_WINDOW_S`). A later trigger inside the shot window (screen or net impact) is kept as evidence (`lateTriggers`), excluded from the impact time, reported in a warning, and never opens a new shot. | TESTED | `shot-pipeline/test/segmentation.test.ts` (incl. "regression: a screen-impact trigger 40 ms later neither shifts the impact time nor opens a phantom shot"); `tests/integration/pipeline.test.ts` |
| D2 | Trigger fusion: subtract known per-source latency, take the median, combine confidences. A spread over 3 ms halves the confidence and warns. | TESTED | `shot-pipeline/test/segmentation.test.ts` (`fuseTriggers` block) |
| D3 | Launch fit: weighted nonlinear least squares whitened by each observation's covariance, robust outlier rejection, gravity-only seed fit, then a drag/lift-aware refit at the launch reference time (closest approach to the address position, not the trigger time). Covariance is inflated by max(1, χ²/dof). | TESTED | `launch-state/test/fit.test.ts`; `shot-pipeline/test/process.test.ts` ("launch reference time…"); integration "recovers launch conditions…", "outliers are rejected…" |
| D4 | A failed fit (e.g. fewer than 2 usable frames) gives an `invalid` state in which every launch value is `unavailable`. | TESTED | `build.test.ts`; integration "too few frames…" |
| D5 | Scoring eligibility: only live, valid, simulated shots may update an official score; synthetic, manual, replayed, provisional and invalid shots never do. | TESTED (unit level for every origin and validity; no live data exists) | `shot-pipeline/test/process.test.ts` ("only valid, simulated, live shots are eligible"); integration asserts `scoring.eligible === false` for synthetic |
| D6 | Every shot records the physics version tag `<air>+<ground>+<shot simulator>`. | TESTED | `process.test.ts` ("records the air model, ground model and shot simulator versions") |

### E. Spin (`@glm/launch-state` `resolveSpin`)

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| E1 | Mode hierarchy: (1) a spin observation that passes the quality gate; (2a) the player's own measured history (≥ 5 shots, same club category, ±15 % ball speed); (2b) per-club prior; (3) generic fallback **only if the user allowed it**; otherwise `unavailable`. | TESTED | `spin.test.ts` |
| E2 | A spin observation that fails the gate is never reported as measured; the reason becomes a warning. | TESTED | `spin.test.ts` |
| E2a | Developer-typed spin is labeled `manual` (never `synthetic` or `measured-*`); the shot stays provisional. | TESTED | `shot-pipeline/test/process.test.ts` ("labels typed-in launch and spin values MANUAL…") |
| E3 | Club-prior spin is labeled `estimated-club-model` with a 35 % sigma (isotropic covariance σ²·I on the vector). The spin axis is `unavailable` (zero tilt assumed for simulation), and curve is withheld. | TESTED | `spin.test.ts`; `shot-simulator/test/simulator.test.ts`; integration "club-model estimate…" |
| E4 | Unavailable spin: no simulation and an explicit reason. Ball speed and launch angles are kept. | TESTED | Integration "unavailable spin without a club or fallback…" |
| E5 | Spin measured from images (marked ball), with measured vs estimated modes kept apart and spin-quality diagnostics. | Planned (Phase 3) — not implemented. The MODE-1 quality gate that such a measurement must pass is TESTED. Dimple tracking is named in the contract but not planned. | [spin-measurement.md §4](spin-measurement.md#4-planned-phase-3-marked-ball-spin-measurement--not-implemented) |

### F. Confidence and validity

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| F1 | Overall confidence = weighted geometric mean of factor scores. A blocking factor or overall < 0.35 ⇒ `invalid`. Overall < 0.7, spin not from an observation, or manual data ⇒ `provisional`. | TESTED | `confidence.test.ts` |
| F2 | Calibration `none` or `red` blocks live and replay data; synthetic and manual data do not depend on calibration. | TESTED (unit level; no live data exists) | `confidence.test.ts` |
| F3 | Ball outside the hitting zone, multiple balls, or a failed or disconnected sensor ⇒ `invalid` with the reason preserved. | TESTED | `confidence.test.ts` (factor level); `segmentation.test.ts` (each shot is gated by its own health report, not the next shot's, in streaming and flush mode); integration "ball outside the calibrated hitting zone…". No end-to-end integration test yet feeds a failed health report through `processShot`. |
| F4 | Calculated-metric confidence is capped. Caps: ball-profile ceiling (0.4–0.6) and spin confidence. Factors: × 0.75 for ground metrics, × 0.6 for lateral/ground metrics with an assumed spin axis, × 0.9 outdoors with defaulted environment fields. The flight-model confidence (`simulationConfidence`) uses the same caps without the per-metric factors. | Spin cap TESTED; the three factors IMPLEMENTED only | `shot-simulator/test/simulator.test.ts` ("estimated spin: … confidence capped by the spin's own"); integration "generic fallback…"; `shot-simulator/src/metrics.ts` |
| F5 | The UI shows launch-data confidence and flight-model confidence separately, each explained in a tooltip. | IMPLEMENTED | `apps/desktop-ui/src/components/ShotCard.tsx` |

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
| H3 | Bounce (crater-tilted impact), skid and speed-dependent roll to rest, ground model v0.2; signed along-track bounce and roll distances ([coordinate-system.md §5](coordinate-system.md#5-derived-flight-metrics)). | TESTED against mechanics, invariants and a common-knowledge envelope, **not data**; provisional | `ground-physics/test/*`, `terrain-engine/test/terrain.test.ts` |
| H4 | Lie at rest; penalty strokes for water, out of bounds and penalty areas. | Lie mapping TESTED; water penalty TESTED; out-of-bounds and penalty-area penalties IMPLEMENTED only | `terrain.test.ts`; `shot-simulator/test/simulator.test.ts` ("assigns a penalty when the ball finishes in water") |
| H5 | Course terrain from height maps; hole and cup capture. | Planned (Phases 5–6) — not implemented | [terrain-model.md §1.1](terrain-model.md) |

### I. Uncertainty (`@glm/shot-simulator`)

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| I1 | Seeded Monte Carlo propagation of launch velocity and spin uncertainty through air and ground simulation. Reports p05 / p50 / p95 per metric (default 100 samples in a range session). | TESTED | `tests/integration/uncertainty-calibration.test.ts`; `shot-simulator/test/simulator.test.ts` ("Monte Carlo is deterministic for a seed…") |
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
| K2 | Delete a player (with or without their shots), delete a session (cascades to its shots), delete a shot, clear everything. | Repository functions TESTED. The UI exposes delete player (TESTED) and delete session (IMPLEMENTED); deleting a single shot or clearing everything has no UI control yet. | Repository contract tests; `app.test.tsx` |
| K3 | CSV export: sign convention in column names, empty cell for unavailable, formula-injection guard. Versioned JSON export and validated import. | TESTED | `export.test.ts` |
| K4 | No network access in any package or in the UI. | IMPLEMENTED (by inspection: no source makes network calls; the UI's production build adds a Content-Security-Policy that forbids third-party origins). No automated test. | `apps/desktop-ui/vite.config.ts` |

### L. Validation tooling (`@glm/validation`) and datasets

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| L1 | Error statistics: bias, MAE, RMSE, median, p95 \|error\|. Missing values are skipped and counted, never zero-filled. | TESTED | `stats.test.ts` |
| L2 | Deterministic train / validation / held-out partitions. Held-out access needs an explicit acknowledgment and is logged. | TESTED | `partition.test.ts` |
| L3 | Reference-monitor comparison converts units and signs explicitly. A metric with a different definition (e.g. carry to launch height vs first ground contact) is refused, not compared, unless the caller asserts per shot that our first contact was within ±0.05 m of launch height; the assertion is logged. | TESTED | `reference.test.ts` |
| L4 | Synthetic replay dataset and golden summary. Regenerating gives byte-identical files; replay is deterministic. | TESTED | `tests/golden/golden.test.ts` |
| L5 | Real reference measurements (`datasets/reference-measurements/`, `datasets/raw-shots/`, `datasets/calibration/` are empty). | Planned (Phase 7; our side of each pair needs the Phase 2 capture) — not implemented | [validation-protocol.md](validation-protocol.md) |
| L6 | Stable, capture-time shot ids, so re-processing a recording keeps pairs and partitions. | Planned (Phase 7) — not implemented. Ids are assigned at processing time today. | [validation-protocol.md §3.3](validation-protocol.md#33-pairing) |

### M. Desktop UI (`apps/desktop-ui`)

React 19 + Vite. The Phase 1 UI is built and TESTED: 79 tests in `apps/desktop-ui/test` (jsdom,
Testing Library) passed on 2026-10-01. It runs on synthetic, replay and developer manual data
only.

| ID | Requirement | Status | Evidence (`apps/desktop-ui/test/…`) |
|---|---|---|---|
| M1 | The pipeline runs in a module Web Worker, with an in-process runner of the same interface. | TESTED | `runner.test.ts`; `invalid-and-worker.test.tsx` ("forwards messages both ways and turns a worker crash into an error…") |
| M2 | Every metric shows its badge and opens a detail panel (definition, units, status, dependencies, confidence, limitations). | TESTED | `shot-card.test.tsx` ("clicking a metric opens the detail panel…") |
| M3 | A permanent data-origin banner is shown for non-live data; no synthetic, manual or estimated value is ever shown as MEASURED. | TESTED | `shot-card.test.tsx` ("a synthetic record shows the SYNTHETIC banner and never a MEASURED badge", "a developer manual shot is MANUAL everywhere…") |
| M4 | Unavailable values show "—"; wide intervals show ranges. | TESTED | `shot-card.test.tsx` ("unavailable spin shows —…", "a wide carry interval renders as a range…") |
| M5 | Invalid shots show the rejection reasons and the skipped-simulation reason instead of carry, total and a trajectory. | TESTED | `invalid-and-worker.test.tsx`; `app.test.tsx` ("shows the skipped reason for a no-spin shot and never a carry number") |
| M6 | Hardware sources are listed but disabled with the honest message. | TESTED | `app.test.tsx`; `pipeline-logic.test.ts` ("hardware sources are never selectable in Phase 1…") |
| M7 | Safety gate before the range screen. | TESTED | `app.test.tsx`, `state.test.ts` |
| M8 | Course and putting appear as disabled "not built yet" entries. | TESTED | `app.test.tsx` ("course play and putting are visible but disabled") |
| M9 | Launch-data confidence and flight-model confidence are shown separately. | IMPLEMENTED | `src/components/ShotCard.tsx` |
| M10 | Replayed shots keep the file's origin; player, handedness and club come from the current Setup (the replay format has none) and the card says so. | TESTED | `runner.test.ts` ("plays a replay file one shot at a time and keeps its synthetic origin"); `shot-card.test.tsx` ("…says where player and club came from") |
| M11 | Shots, sessions and players are stored locally (IndexedDB, in-memory fallback with a notice); settings in local storage; CSV/JSON export. | Saving a shot, CSV export and settings-storage fallbacks TESTED (tests use an in-memory repository); the IndexedDB selection and its in-memory fallback IMPLEMENTED | `app.test.tsx` ("hits a synthetic shot, … saves the shot locally", "renders with defaults when local storage is unavailable or throws"), `state.test.ts` |
| M12 | No network calls and no analytics. | IMPLEMENTED (by inspection and the production-build Content-Security-Policy) | `vite.config.ts` |

### N. Safety and privacy

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| N1 | First-run safety acknowledgment covering [safety.md](safety.md); always reachable afterwards. | TESTED | `apps/desktop-ui/test/app.test.tsx` ("blocks the range screen until the checklist is acknowledged…", "remembers an earlier acknowledgement…") |
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

The phase numbering is the product owner's plan and is binding for code comments, the UI and
every document. Status words are those of §1.

| Phase | Scope | Status |
|---|---|---|
| 0 | **Foundation**: repository inspection, architecture and coordinate-system docs, data contracts and JSON Schemas, units library, core math, synthetic fixtures, deterministic physics-test harness, replay-file interface, persistence, validation tooling, CI | **TESTED** on synthetic and replay data. CI runs pass ([repository-inspection.md](repository-inspection.md) §6). |
| 1 | **Range MVP (no true spin)**: setup, sensor-adapter interfaces with replay and synthetic sources, calibration data model, ball-at-address contract, shot-event pipeline (segmentation, trigger fusion), launch state from 3D observations, spin resolution without measurement (estimated, user-allowed fallback or unavailable; synthetic spin observations in tests), confidence and validity, air physics with a clearly identified provisional aerodynamic baseline, provisional ground model, Monte Carlo, presentation, range UI, shot history, confidence and warning UI, CSV/JSON export. No course play. | **TESTED** on synthetic, replay and manual data: libraries and the desktop UI. Ground model v0.2 is provisional. Nothing VERIFIED. |
| 2 | **Calibration and stereo vision**: camera driver and capture service, hardware triggers, frame buffer, intrinsic/extrinsic/target-line calibration with quality checks and status ([calibration-procedure.md](calibration-procedure.md)), ball-at-address detection, 2D tracking, stereo triangulation ([vision-pipeline.md](vision-pipeline.md)), camera health. First measured launch positions. | Not started. Contracts, stubs and `calibrationFactor` exist (TESTED). |
| 3 | **Spin**: marked-ball spin measurement, measured vs estimated spin modes kept apart end to end, spin-quality diagnostics ([spin-measurement.md](spin-measurement.md) §4) | Not started. Spin resolution and the MODE-1 quality gate exist (TESTED). |
| 4 | **Club data and practice analytics**: club-delivery data with explicit reference points and sign conventions; practice statistics | Not started. Club fields exist in the contract and are always `unavailable`. |
| 5 | **Course play**: height-map terrain, lies, penalties, scoring (provisional shots only as a casual-mode override) | Not started. Region terrain, surface catalog and water penalty exist (TESTED). |
| 6 | **Putting**: green model, putting capture profile and launch fit, skid/roll on greens, hole capture ([putting-model.md](putting-model.md)) | Not started. Skid, roll and the Stimp relation exist (TESTED). |
| 7 | **Validation and hardening**: reference-monitor import, accuracy dashboard, held-out accuracy report, release readiness ([validation-protocol.md](validation-protocol.md)). Fitting aerodynamic and ground parameters to measured trajectories with held-out validation, and model-error uncertainty, belong here. Only then can a metric become VERIFIED, scoped to the conditions tested (§8). | Not started. Error statistics, partitions with a held-out guard and reference normalization exist (TESTED); no data. |

**Not assigned to any phase** in the product owner's plan: radar and hybrid drivers (C7), packaging
as an installable desktop application, and the separate `services/` processes listed in
[architecture.md §9](architecture.md#9-planned-services--not-built).

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

- [architecture.md](architecture.md): layers, packages, provenance model, confidence, uncertainty, process model.
- [coordinate-system.md](coordinate-system.md): axes, signs, spin conventions, metric definitions.
- [sensor-specification.md](sensor-specification.md): adapter contract, driver requirements, camera targets, triggers.
- [calibration-procedure.md](calibration-procedure.md): planned calibration (Phase 2).
- [vision-pipeline.md](vision-pipeline.md): planned Stages A–D, implemented launch fit (Stage E).
- [spin-measurement.md](spin-measurement.md): spin modes and the planned marked-ball method (Phase 3).
- [physics-model.md](physics-model.md): air-flight model, provisional coefficients, sources.
- [terrain-model.md](terrain-model.md): terrain, surfaces, bounce and roll (current ground-model version).
- [putting-model.md](putting-model.md): planned putting model (Phase 6).
- [validation-protocol.md](validation-protocol.md): validation tooling and the first real campaign (Phase 7).
- [limitations.md](limitations.md): what the numbers cannot tell you.
- [safety.md](safety.md): physical setup and data-privacy precautions.
- [repository-inspection.md](repository-inspection.md): Phase 0 report and CI status.
