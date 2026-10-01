# Architecture

This document explains how the golf-launch-monitor workspace is built: its layers, packages,
provenance model, determinism, versioning, contracts, and process model. It also lists what is
planned but not built. It describes the code in `packages/`, `scripts/` and `tests/` as of
2026-10-01. Where this document and the code disagree, the code is authoritative.

Related documents:

- [product-requirements.md](product-requirements.md): requirements, status, phase plan;
- [limitations.md](limitations.md): what the numbers cannot tell you;
- [coordinate-system.md](coordinate-system.md): axes, signs, spin conventions (binding);
- [physics-model.md](physics-model.md): air flight;
- [terrain-model.md](terrain-model.md): terrain, bounce and roll;
- [repository-inspection.md](repository-inspection.md): Phase 0 report;
- [safety.md](safety.md): physical setup;
- [../datasets/README.md](../datasets/README.md): data formats.

**Status vocabulary.** The words are defined in
[product-requirements.md §1](product-requirements.md#1-status-vocabulary):

| Status | Meaning |
|---|---|
| CREATED | A file or package scaffold exists; its behaviour is not complete. |
| IMPLEMENTED | Code exists and does what is required; no automated test exercises it. |
| TESTED | Automated tests exist and pass. They check the code against its own specification, synthetic data or closed-form mechanics, **not** against reality. |
| VERIFIED | Checked against independent real-world measurements. **Nothing in this repository is VERIFIED.** No reference-monitor data and no hardware exist yet. |
| Planned (Phase N) — not implemented | Required, but no code exists yet. |

Phase numbers, as used in code comments and the project plan:

| Phase | Scope |
|---|---|
| 0 | Repository inspection and foundation |
| 1 | Range mode with synthetic, replay and developer manual data |
| 2 | Camera capture, calibration, vision |
| 4 | Club delivery data |
| 5 | Course play |
| 6 | Putting |

Phases 3 and 7 do not appear in code. [product-requirements.md §9](product-requirements.md#9-phase-plan)
proposes them: Phase 3 for validation against a reference instrument, Phase 7 for radar/hybrid
sensors and fitted model parameters. Where this document says "no phase assigned", see that
proposal.

---

## 1. Layers and data flow

```
Sensor adapter: synthetic | replay | manual (dev) | camera / radar / hybrid stubs
  |  RawSensorObservation stream: world frame, shared session clock (s)
  v
Segmentation + trigger fusion ............................. @glm/shot-pipeline
  |  ShotObservationGroup: triggers, observations in the frame-buffer window, address, health
  v
Launch fit, pass 1: gravity-only seed (Stage E) ............ @glm/launch-state  fitLaunchState
  v
Spin resolution with the seed velocity ..................... @glm/launch-state  resolveSpin
  v
Launch fit, pass 2: drag + Magnus trajectory model ......... propagatePositions from @glm/ballistics
  v
Spin re-resolution -> confidence factors -> validity ....... @glm/launch-state
  v
LaunchState: one Measurement<T> per field, schema-validated, deep-frozen
  v
Shot simulator ............................................. @glm/shot-simulator  simulateShot
  |  air flight (@glm/ballistics) -> first contact -> bounce / skid / roll (@glm/ground-physics;
  |  hops flown by @glm/ballistics) on terrain (@glm/terrain-engine) -> metrics + Monte Carlo
  v
ShotResult (one CalculatedValue<T> per metric), or a simulationSkippedReason
  v
ShotRecord: versions, sensor configuration, raw observations (only with consent), scoring eligibility
  v
@glm/persistence (store, export) . @glm/presentation (display) . @glm/validation (accuracy tooling)
  v
apps/desktop-ui (in progress; the pipeline runs in a Web Worker)
```

| Stage | Code | What it does | Status |
|---|---|---|---|
| Sensor adapters | `@glm/sensor-adapters` | Implement the `SensorAdapter` contract. **Synthetic** runs a deterministic generator over an injected truth propagator, plus configurable noise: timestamp jitter, dropouts, outliers, trigger latency and optimistic reported covariance. **Replay** plays back JSON Lines files; it relabels a live recording as `replay`. **Manual** is developer entry only. **Camera / radar / hybrid** are stubs: `connect`, `startCapture` and `calibrate` reject with `HardwareNotAvailableError`. | TESTED, including the stubs' refusal to produce data. The drivers themselves: camera Planned (Phase 2) — not implemented; radar and hybrid not implemented, no phase assigned. |
| Segmentation | `ShotSegmenter` | A trigger opens a shot. The shot collects observations in `[t − preTriggerS, t + postTriggerS]`, taken from the adapter's frame-buffer configuration. Triggers within 50 ms of the first one count as one impact. The shot keeps the latest address and health observations. | TESTED (end-to-end only) |
| Trigger fusion | `fuseTriggers` | Subtracts each source's known latency and takes the median time. Confidence is `1 − ∏(1 − cᵢ)`. Confidence is halved, with a warning, if the sources disagree by more than 3 ms. | TESTED (end-to-end only) |
| Launch fit ("Stage E") | `fitLaunchState` | Fits position p₀ and velocity v₀ at a reference time by weighted nonlinear least squares (Levenberg–Marquardt). Each residual is whitened by the Cholesky factor of its observation covariance. A least-trimmed-squares start and outlier rejection run when at least 5 observations are usable (4σ threshold; robust noise scale capped at 3×). Covariance is inflated by max(1, χ²/dof). With fewer than two usable positions, or positions spanning no time, the fit fails with a reason and produces no numbers. Fewer than 6 inliers add a warning. | TESTED |
| Two-pass fit | `processShot` | **Pass 1:** gravity-only model; reference time = min(fused trigger, first observation). **Pass 2:** drag + Magnus model (the simulator's RK4 force model, 0.5 ms step) with the pass-1 spin. Its reference time is the launch reference time: the closest approach to the verified address point, never later than the first observation. If pass 2 fails, pass 1 is used with a warning. If spin is unavailable, pass 2 assumes ω = 0 and adds a warning. | TESTED (end-to-end) |
| Spin resolution | `resolveSpin` | **MODE 1**, measured: a spin observation that passes `SPIN_QUALITY_THRESHOLDS`. **MODE 2**, estimated (needs a selected club category): from the player's history of *measured* shots with that category (at least 5 within ±15 % ball speed), otherwise from a per-club prior with 35 % σ and an assumed zero axis tilt. With no hardware, no measured history exists yet, so only the club prior can fire today. **MODE 3**, assumed: a generic spin parameter S = 0.15, only when the user explicitly allowed it. Otherwise spin is `unavailable`. | TESTED |
| Confidence and validity | `aggregateConfidence` and factor builders | See §4. | TESTED |
| LaunchState | `buildLaunchState` | Assembles the contract. A failed fit makes every kinematic field `unavailable` and the validity `invalid`. Club-delivery fields are always `unavailable` because there is no club sensor. It refuses `measured-*` labels in synthetic or manual states, schema-validates and deep-freezes. | TESTED |
| Shot simulator | `simulateShot` | Returns a reason instead of a result for an invalid launch or unavailable spin. Otherwise it runs RK4 air flight to first contact, then ground motion with an injected hop simulator. It produces metrics with provenance and Monte Carlo intervals (§5). Physics details: [physics-model.md](physics-model.md), [terrain-model.md](terrain-model.md). | TESTED (end-to-end only; no package-level tests) |
| ShotRecord | `processShot` | Adds versions, the sensor configuration, raw observations (only when `storeRawObservations` is on), any skipped reason, and scoring eligibility. Schema-validates and deep-freezes. | TESTED (end-to-end) |
| Persistence | `@glm/persistence` | In-memory, IndexedDB (browser) and JSON-directory (Node) repositories. Records are validated on save **and** on load; corrupt records are excluded from lists and reported, never silently repaired. CSV and JSON export. Nothing uploads. | TESTED |
| Presentation | `@glm/presentation` | Provenance badges, metric definitions, display values, validity and data-origin banners, shot-shape labels by handedness. An unavailable value renders as "—"; a wide interval renders as a range. | TESTED |
| UI | `apps/desktop-ui` | See §8. | In progress (CREATED) |

**Ground results are provisional.** Total, bounce and roll come from the ground model. That
model is being upgraded at the time of writing (crater impact and speed-dependent rolling
resistance; ground model v0.2). Treat total and rollout as model-dependent; see
[terrain-model.md](terrain-model.md). Carry does not depend on the ground model.

---

## 2. Packages

Every package lives in `packages/<name>`, is named `@glm/<name>` and is consumed as TypeScript
source (`exports` points to `./src/index.ts`); packages have no build step. Node-only code sits
behind separate entry points, `@glm/sensor-adapters/node` and `@glm/persistence/node`, so browser
bundles never import `node:fs`.

| Package | Responsibility | Imports (`@glm/*`, from `src/`) | Status |
|---|---|---|---|
| `shared-types` | Data contracts (TypeScript types), zod runtime schemas, JSON Schema generation, version constants, `deepFreeze`. Only third-party dependency: zod. | — | TESTED |
| `core-math` | Vec3; small dense linear algebra (Cholesky, solve, SPD inverse); seeded RNG (xoshiro128\*\* via splitmix32); statistics. | shared-types (types only) | TESTED |
| `units` | Exact unit conversions. Golfer and engineering formatting with L/R labels and ranges; non-finite values throw. | — | TESTED |
| `ballistics` | Environment (moist-air density, Sutherland viscosity, ISA pressure); aerodynamic model registry; ball profiles; RK4 flight with contact detection; ground-free propagation for estimators. | shared-types | TESTED. Coefficients are provisional ([physics-model.md](physics-model.md)). |
| `terrain-engine` | Terrain queries (plane, flat range, polygon regions); surface catalog; Stimpmeter relation. | core-math, shared-types | TESTED. Surface parameters are provisional. |
| `ground-physics` | Impact, skid, roll, rest. Hops between bounces are flown by an injected callback. | core-math, shared-types | TESTED. Provisional; v0.2 upgrade in progress. |
| `launch-state` | Measurement factories, `combineSources`, angle/spin derivations with first-order uncertainty, launch fit, spin resolution, confidence model, `buildLaunchState`. | core-math, shared-types | TESTED on synthetic data only |
| `sensor-adapters` | Adapter lifecycle; synthetic generator and adapter; replay format and adapter; manual adapter; hardware stubs. | core-math, shared-types | TESTED |
| `shot-simulator` | Air + ground trajectory, metrics with provenance, Monte Carlo intervals. | ballistics, core-math, ground-physics, shared-types, terrain-engine | TESTED through `tests/` only |
| `shot-pipeline` | Segmenter, trigger fusion, two-pass fit orchestration, `processShot`, `ShotPipeline`, synthetic fixtures, range-session config. | ballistics, core-math, ground-physics, launch-state, sensor-adapters, shared-types, shot-simulator, terrain-engine, units | TESTED through `tests/` only |
| `persistence` | `LocalRepository` (in-memory, IndexedDB, JSON directory); CSV/JSON export with unit- and sign-named columns and a spreadsheet formula-injection guard. | shared-types, units | TESTED (IndexedDB via fake-indexeddb) |
| `presentation` | Badges, `METRIC_DEFINITIONS`, `presentLaunchState` / `presentShotMetrics`, banners, `shotShapeLabel`. | shared-types, units | TESTED |
| `validation` | Error statistics, deterministic train/validation/held-out partitions with a logged held-out guard, reference-monitor normalisation and comparison. | core-math, units | TESTED. No reference data exists. |
| `apps/desktop-ui` | Range-mode UI (§8). | declares ballistics, launch-state, persistence, presentation, sensor-adapters, shared-types, shot-pipeline, terrain-engine, units | In progress |

**Layering rule.** A lower layer never imports a higher one. Where a lower layer needs physics,
the physics is injected:

- `TrajectoryModel` into `launch-state`;
- `TruthPropagator` into `sensor-adapters`;
- `HopSimulator` into `ground-physics`.

Only `shot-simulator` and `shot-pipeline` combine the physics packages.

**Cross-package tests** live in `tests/`:

| Path | What it checks |
|---|---|
| `tests/integration` | End-to-end pipeline behaviour, spin modes, failure modes, determinism. A coverage check of the reported uncertainty on synthetic data. |
| `tests/replay` | Byte-identical round trip; synthetic provenance survives replay; recovered launch values match the header truth. |
| `tests/golden` | The committed dataset equals the generator output; replay reproduces the golden summary; two runs are byte-identical. |

---

## 3. Provenance model

### 3.1 `Measurement<T>`: an observed or estimated value

Every launch value is a `Measurement<T>`: `value`, `unit`, `source`, `confidence` ∈ [0, 1],
optional `uncertainty` (σ, interval and/or covariance) and `qualityFlags`. These invariants
are enforced by the zod schema and by the only factories that build measurements,
`makeMeasurement` and `unavailableMeasurement`:

- `value === null` ⇔ `source === "unavailable"`;
- `unavailable` ⇒ `confidence === 0`;
- no NaN or ±Infinity anywhere in the value or its uncertainty.

| `MeasurementSource` | Meaning | Badge (`@glm/presentation`) |
|---|---|---|
| `measured-camera`, `measured-radar`, `measured-hybrid` | Observed by a physical sensor for this shot. **No driver exists, so nothing currently produces these labels.** | MEASURED |
| `estimated-player-model` | From this player's own measured history | ESTIMATED |
| `estimated-club-model` | From a per-club prior | ESTIMATED |
| `assumed-generic-fallback` | Generic value; only when the user allowed it | ASSUMED |
| `manual` | Typed in by a developer | MANUAL |
| `synthetic` | Produced by the synthetic generator | SYNTHETIC |
| `unavailable` | No credible value | UNAVAILABLE |

The data stream fixes the label of "measured" values (`measuredSourceFor`):

- synthetic stream → `synthetic`;
- manual stream → `manual`;
- live or replayed stream → `measured-<sensor kind>`.

A replay of real sensor data therefore keeps its `measured-*` labels, while the shot-level
`dataOrigin` (`live | replay | synthetic | manual`) records that it was played back.
`buildLaunchState` throws if a synthetic or manual launch state contains any `measured-*` label.

### 3.2 `combineSources`: derived values inherit the worst input

A value computed from several inputs gets the label of its least trustworthy input. Precedence,
worst first:

```
unavailable > assumed-generic-fallback > estimated-club-model > estimated-player-model
            > synthetic > manual > measured-*   (one measured kind -> that kind; mixed -> measured-hybrid)
```

Model-derived labels (assumed, estimated) outrank stream-origin labels (synthetic, manual), so
an estimate is always shown as an estimate. The synthetic or manual origin is not lost. It is
carried by `dataOrigin`, by the data-origin banner and by `CalculatedValue.dependsOnSynthetic`.

`@glm/presentation` mirrors the same order for badges (`PROVENANCE_SEVERITY`: MEASURED < MANUAL <
SYNTHETIC < ESTIMATED < ASSUMED < UNAVAILABLE). Each package's tests pin its own order; no
test compares the two automatically. A derived scalar
(for example ball speed from the velocity vector) gets:

- provenance `combineSources(inputs)`;
- confidence `min(input confidences)`, halved (`UNPROPAGATED_UNCERTAINTY_CONFIDENCE_SCALE`) if its
  uncertainty could not be propagated;
- first-order σ from the input covariances.

Provenance is never upgraded anywhere in the pipeline or the display layer.

### 3.3 `CalculatedValue<T>`: a model output

Simulator outputs (carry, total, apex, descent, curve, …) are `CalculatedValue<T>` with
`kind: "calculated"`. Each one carries:

- `inputs[]`, the provenance of position, velocity and spin;
- `dependsOnEstimated`, true if any input is estimated, assumed or manual;
- `dependsOnSynthetic`;
- `confidence`;
- an optional Monte Carlo `interval` (p05 / p50 / p95);
- `qualityFlags`;
- `modelVersion`.

The presentation layer gives them the badge CALCULATED plus secondary badges (ESTIMATED,
ASSUMED, MANUAL or SYNTHETIC) from their inputs. A calculated metric with no value shows
UNAVAILABLE and "—".

### 3.4 Shot-level labels

| Field / helper | Rule |
|---|---|
| `dataOriginBanner(origin)` | `null` for live data. Fixed text for the other origins, e.g. "SYNTHETIC DATA — generated for testing, not measured." |
| `validityBanner(launch)` | Rejection reasons, then warnings, passed through verbatim. |
| `scoring` (`scoringEligibility`) | Only **live, valid, simulated** shots are eligible. Synthetic, manual, replayed, provisional and invalid shots never are. |
| `rawObservations` | Stored only when `storeRawObservations` is on (default off); otherwise `null`. |
| `simulationSkippedReason` | Set instead of a result when the launch is invalid or spin is unavailable. Nothing is fabricated. |

**Synthetic records can be `valid`.** For synthetic data, `validity` and `overallConfidence`
describe how well the pipeline handled generated observations; they say nothing about
real-world accuracy. The calibration factor scores 1 for synthetic data ("No calibration
required"). Likewise, `spinMode: "measured"` on a synthetic record means the MODE 1 path
(observed spin) was taken; the spin's `source` is still `synthetic`.

---

## 4. Confidence and validity

`overallConfidence` is the weighted geometric mean of factor scores,
`∏ sᵢ^(wᵢ/Σw)`. A single weak factor therefore drags the result down, and any zero-score
factor forces 0.

| Factor | Weight | Blocking when |
|---|---|---|
| Launch fit quality (residual, velocity σ, inlier fraction, χ²/dof, convergence) | 2 | Fit failed |
| Calibration | 1.5 | Live or replay data with calibration `red` or `none` |
| Spin quality | 1.5 (0 when spin is unavailable) | — |
| Post-impact frames | 1 | Fewer than 2 positions |
| Ball at address | 1 | More than one ball, or ball outside the hitting zone |
| Sensor health | 1 | Sensor failed or disconnected |
| Impact trigger | 0.5 | — |

Unavailable spin gets weight 0, so it does not drag down the measured ball values. It still
makes the shot `provisional`, and the simulator withholds every spin-dependent output.

Validity rules:

| Validity | When |
|---|---|
| `invalid` | Any factor is blocking, or overall < 0.35. |
| `provisional` | Overall < 0.70, **or** spin was not measured (MODE 2/3 or unavailable), **or** the data were entered manually. |
| `valid` | Otherwise. |

Calculated metrics are capped by:

- the launch confidence;
- the spin's own confidence;
- the ball profile's `confidenceCeiling` (0.4–0.6 for the shipped provisional profiles);
- `METRIC_CONFIDENCE_FACTORS` in `@glm/shot-simulator`: ground metrics × 0.75; lateral and
  ground metrics × 0.6 when the spin axis was assumed; × 0.9 for an outdoor environment with
  defaulted fields.

Curve is `unavailable` when the spin axis was assumed (club prior or generic fallback: zero tilt).

**All weights, thresholds, ramps and caps are provisional engineering choices.** None is fit to
reference data. A confidence value is a heuristic score, not a calibrated probability.

---

## 5. Uncertainty propagation

| Quantity | Method | Status |
|---|---|---|
| Launch position and velocity | 6×6 fit covariance from the whitened Jacobian, inflated by max(1, χ²/dof). | TESTED on synthetic data |
| Derived scalars (speed, angles, spin rate, axis tilt) | First-order (gradient) propagation of input covariances. | TESTED |
| Estimated spin | Relative σ: 35 % for the club prior, from the MAD for player history, 50 % for the generic fallback. | TESTED |
| Flight and ground metrics | Monte Carlo (`runMonteCarlo`). Samples the launch velocity from its covariance, and the spin from its covariance (measured) or a relative σ on its magnitude (estimated). Reports p05/p50/p95 when at least max(10, ⌈n/2⌉) samples succeed. Seeded with `monteCarloSeed`; uses an RK4 step of at least 4 ms. Default n = 100 for range sessions (`DEFAULT_MONTE_CARLO_SAMPLES`); 0 disables it. | TESTED |

What the Monte Carlo **does not** include:

- launch-position uncertainty;
- aerodynamic and ground **model-parameter** uncertainty;
- environment uncertainty.

Its intervals therefore cover launch-measurement noise only. They understate real-world
uncertainty, most of all for total, bounce and roll.

`tests/integration/uncertainty-calibration.test.ts` checks, on synthetic data, that:

- the 1σ ball-speed and launch-angle intervals contain the truth in 52–84 % of 80 seeded shots
  (nominal 68 %);
- the Monte Carlo p05–p95 carry interval (40 samples) contains the true carry in at least 70 %
  of 24 seeded 7-iron shots (nominal 90 %).

The synthetic truth uses the same physics as the simulator. This test therefore checks the
estimator and the propagation, not the physics.

---

## 6. Determinism

- **Seeded randomness only.** `createRng(seed)` from `@glm/core-math` is the only source of
  randomness. It is used for synthetic noise (seed per shot spec) and for Monte Carlo
  (`SimulationSettings.monteCarloSeed`). Library code under `packages/*/src` contains no
  `Math.random`, `Date.now` or `new Date()`.
- **Injected ids and clocks.** `PipelineConfig.nextShotId` and `nowUtc` are inputs, and
  adapters take a `UtcClock`. Without one, adapters report `1970-01-01T00:00:00.000Z` on
  purpose. `deterministicIds()` supplies fixed sequences for tests, golden files and replays.
  Only the application layer (UI, CLI) reads real clocks.
- **Fixed integration grids.** RK4 air flight and midpoint ground integration use fixed steps.
  Output sampling never perturbs the integration grid ([physics-model.md](physics-model.md) §4).
- **Canonical serialisation.** A replay file parses and re-serialises byte-identically. The
  golden test requires two replays of the committed dataset to give byte-identical shot records.
- **Limit.** Results are bit-identical on the same JavaScript engine. `Math.exp` and `Math.pow`
  are implementation-approximated, so different engines may differ in the last bits.

---

## 7. Versioning and contracts

### 7.1 Every model and format is versioned

| Constant | Package | Value at time of writing | Recorded in |
|---|---|---|---|
| `COORDINATE_SYSTEM_VERSION` | shared-types | `glm-world-1.0` | LaunchState, replay header, CalibrationRecord, JSON export envelope |
| `SCHEMA_VERSION` | shared-types | `glm-schema-0.1.0` | LaunchState, ShotRecord, Session, JSON export envelope, JSON Schema `$id` |
| `REPLAY_FORMAT_VERSION` | shared-types | `glm-replay-1` | Replay header `formatVersion` (mismatch is rejected, never migrated) |
| `PHYSICS_MODEL_VERSION` | ballistics | `glm-physics-0.1.0-provisional` | `AirFlightResult.modelVersion`, `ShotResult.physics`, `CalculatedValue.modelVersion`; LaunchState `physicsModelVersion` = `<physics>+<ground>` |
| `ENVIRONMENT_MODEL_VERSION` | ballistics | `glm-env-0.1.0` | `EnvironmentProfile.version` (stored whole in `ShotResult.physics.environment`) |
| `GROUND_MODEL_VERSION` | ground-physics | changing (v0.2 in progress); see [terrain-model.md](terrain-model.md) | `GroundMotionResult.modelVersion`, `ShotResult.physics.groundModelVersion` |
| `TERRAIN_MODEL_VERSION` | terrain-engine | `glm-terrain-0.1.0` | Surface `version`, terrain `version` → `ShotResult.physics.terrainVersion` |
| `ESTIMATOR_VERSION` | launch-state | `glm-launch-fit-0.1.0` | `LaunchState.estimatorVersion` |
| `SOFTWARE_VERSION` | shot-pipeline | `golf-launch-monitor-0.1.0` | `ShotRecord.softwareVersion` |
| Ball profile `id@version` | ballistics | e.g. `premium-urethane-baseline@0.1.0-provisional` | `LaunchState.ballProfileVersion`, `ShotResult.physics` |
| `SensorConfiguration.version` | per adapter | e.g. `synthetic-config-1` | `LaunchState.sensorConfigurationVersion`; full configuration in ShotRecord |
| `CalibrationRecord.version` | (Phase 2) | `uncalibrated` when none | `LaunchState.calibrationVersion` |
| `SHOT_EXPORT_FORMAT_VERSION` | persistence | `1` | JSON export envelope |
| `INDEXED_DB_VERSION` | persistence | `1` | IndexedDB database version |
| `PARTITION_ALGORITHM` | validation | `glm-partition-fnv1a32-fmix32-v1` | Dataset partition assignment |
| `SHOT_SIMULATOR_VERSION` | shot-simulator | `glm-shot-sim-0.1.0` | **Not recorded in any output** (§12) |

The rule, stated in the model docs and in code comments: any change that can alter a stored or
simulated number bumps the relevant version in the same commit. A changed golden summary
(`datasets/golden-tests`) is the review signal.

### 7.2 Contracts: TypeScript types + zod schemas + JSON Schema

- **TypeScript types** in `@glm/shared-types` are the hand-written contracts. They are deeply
  readonly.
- **zod schemas** validate at runtime and enforce cross-field invariants. Validation happens at
  every boundary: replay lines, repository save and load, export parse, and `LaunchState`,
  `ShotResult` and `ShotRecord` construction.
- **Compile-time parity.** `packages/shared-types/test/type-parity.test.ts` asserts
  mutual assignability and equal keys between each contract and its schema's inferred type.
  A drift fails `npm run typecheck`, not only `npm test`.
- **JSON Schema** files in `packages/shared-types/schemas/` are generated by
  `npm run schemas:generate`. A unit test and the CI workflow both fail when the committed files
  are stale. Some invariants (e.g. "null value ⇔ unavailable") cannot be expressed in JSON
  Schema; each file's description says so.
- **Immutability.** Factories return `deepFreeze`d objects. Repositories return frozen copies.

---

## 8. Process model

| Component | Today | Status |
|---|---|---|
| Libraries (`packages/*`) | TypeScript with no Node APIs outside the `/node` entry points; the only browser I/O is IndexedDB in `@glm/persistence`. They run in Node, in a browser main thread, or in a Web Worker. | TESTED |
| CLI scripts (`scripts/`) | `tsx` scripts: dataset generation, replay, schema generation. | `scripts/datasets.ts` (dataset build, replay, summary): TESTED through `tests/golden`. The CLI wrappers `replay.ts`, `generate-datasets.ts` and `generate-schemas.ts`: IMPLEMENTED. |
| Desktop UI (`apps/desktop-ui`) | React 19 + Vite local web app; design being implemented at the time of writing. The shot pipeline (adapters, `ShotPipeline`, Monte Carlo) runs in a module **Web Worker**, so propagation never blocks the UI; the typed message protocol is in `src/worker/protocol.ts`. An in-process runner with the same interface serves tests and environments without workers. Shots, sessions and players go to IndexedDB through `IndexedDbRepository`. `vite.config.ts` injects a Content-Security-Policy into production builds that forbids third-party origins (offline-first: no network calls, no CDNs, no analytics). | In progress (CREATED); check `apps/desktop-ui` for current state |
| Native capture service | A process near the cameras and sensors that captures frames and timestamps at high rate and streams observations to the app. | Planned (Phase 2) — not implemented |
| Desktop packaging | Packaging as an installable desktop application. | Planned — not implemented; no phase assigned |

---

## 9. Planned `services/` — NOT built

There is no `services/` directory. The seams exist as contracts and stubs only:

| Planned service | Purpose | What exists today | Status |
|---|---|---|---|
| `services/capture` | Camera, radar and microphone drivers; frame buffering; device-clock sync | `SensorAdapter` contract, `FrameBufferConfiguration`, camera health metric ids, hardware stubs that throw `HardwareNotAvailableError` | Planned (Phase 2) — not implemented |
| `services/vision` | Ball detection, stereo triangulation, ball-at-address check, spin from ball markings or dimples | Observation kinds `ball-detection-2d`, `ball-position-3d`, `ball-address`, `spin` in the contract; nothing produces them from images | Planned (Phase 2) — not implemented |
| `services/calibration` | Intrinsic, extrinsic and world-frame (target-line) calibration from ChArUco or checkerboard boards; quality report | `CalibrationRecord` contract and JSON Schema, `calibrationFactor`; no solver | Planned (Phase 2) — not implemented |
| `services/sensor-fusion` | Combining camera, radar and trigger sources | Trigger fusion (`fuseTriggers`) and the launch fit run in-process in `@glm/shot-pipeline` / `@glm/launch-state`; no multi-sensor fusion | Planned — not implemented; no phase assigned |
| `services/physics` | Physics as a separate service | Physics runs in-process as libraries (`ballistics`, `terrain-engine`, `ground-physics`, `shot-simulator`) | Planned — not implemented; no phase assigned |

---

## 10. Requested layout vs. what exists

| Requested area | Where it lives now | Status |
|---|---|---|
| `apps/` (desktop UI) | `apps/desktop-ui` | In progress |
| `services/capture`, `vision`, `calibration` | Not present (seams in §9) | Planned (Phase 2) — not implemented |
| `services/sensor-fusion` | Partly in-process: `@glm/shot-pipeline` (trigger fusion), `@glm/launch-state` (fit) | Partial; separate service not implemented |
| `services/physics` | In-process libraries: `@glm/ballistics`, `@glm/terrain-engine`, `@glm/ground-physics`, `@glm/shot-simulator` | Libraries TESTED; separate service not implemented |
| `packages/` (shared libraries) | 13 packages (§2) | TESTED |
| `datasets/synthetic`, `datasets/golden-tests` | Present; generated by `npm run datasets:generate` | TESTED (golden test) |
| `datasets/raw-shots`, `datasets/calibration` | Present; git-ignored except their README | Empty; no capture exists |
| `datasets/reference-measurements` | Present | Empty; no reference data |
| `docs/` | This file plus the documents linked at the top | — |
| `tests/` | `tests/integration`, `tests/replay`, `tests/golden` | TESTED |
| CI | `.github/workflows/golf-launch-monitor.yml` in the parent repository (path-filtered) | CREATED; see [repository-inspection.md](repository-inspection.md) §6 for run status |

---

## 11. Key decisions

| Decision | Rationale | Trade-off |
|---|---|---|
| **TypeScript monorepo** | One language for the browser UI, the Web Worker running the physics, and Node tooling. Strict types catch unit and sign mistakes at the boundaries (units are carried in field names). | Heavy computer vision (Phase 2) may need native code; that is why a separate capture/vision service is planned. |
| **npm workspaces** (no Nx, Turborepo or pnpm) | Uses only the toolchain found in Phase 0 (Node 22, npm 10). Packages are consumed as source, so there is no build graph to maintain. | No task caching; the full test run is the unit of CI. |
| **zod + TypeScript contracts, with compile-time parity and generated JSON Schema** | Types alone cannot reject a malformed replay file or a corrupt stored record at runtime; zod can, and it enforces the provenance invariants. Parity tests stop the two definitions drifting. JSON Schema lets non-TypeScript tools (Python analysis, a future native service) read the data. | Two definitions per contract, kept in sync by the parity test. |
| **Two-pass launch fit** | The gravity-only pass is robust and needs no spin; it seeds the fit and the spin-axis frame. The drag + Magnus pass removes the low ball-speed bias of ignoring drag, using the same force model as the simulator. Falling back to pass 1 keeps a usable (flagged) result if pass 2 fails. | A second fit per shot through the RK4 propagator (far costlier than pass 1's closed form). Pass 2 inherits the provisional aerodynamic coefficients. |
| **Monte Carlo uncertainty** | Carry, apex and total are nonlinear functions of the launch state, with event detection (contact) and regime switches (bounce, skid, roll). Sampling the full simulation needs no Jacobians through the integrator. It is deterministic with a seed and runs off the UI thread. | Cost is n trajectories per shot (4 ms step). Only launch noise is sampled (§5). |
| **Local-first storage** | Shot data and calibration images are personal and can show the user's home. The product must work offline (garage, range). Nothing in `@glm/persistence` uploads. | No sync or backup across devices; the user exports manually (CSV/JSON). |
| **Injected physics and clocks** | Keeps lower layers independent of models (§2) and keeps every result reproducible (§6). | More parameters to pass; `PipelineConfig` carries `nextShotId` and `nowUtc`. |
| **Never fabricate** | Unavailable spin, a failed fit or an invalid launch produce `unavailable` values or a skipped reason, never placeholder numbers. Hardware stubs throw instead of emitting data. | Some shots show fewer numbers; the honesty is the product requirement. |

---

## 12. Known gaps (as of 2026-10-01)

- **`SHOT_SIMULATOR_VERSION` is not recorded.** The Monte Carlo design (e.g. the 4 ms minimum
  step, the interval rules) can change stored intervals without a recorded version change.
- **The replay CLI ignores header calibration.** `scripts/datasets.ts` `runReplay` builds its
  config with `createRangePipelineConfig`, which sets `calibration: null`. Replaying a **live**
  recording with `npm run replay` would therefore make every shot invalid ("No calibration").
  Synthetic replays are unaffected.
- **No package-level tests** for `shot-pipeline` and `shot-simulator`. They are covered only
  end-to-end in `tests/`.
- **Documents referenced from code comments but not yet written:** `docs/sensor-specification.md`,
  `docs/vision-pipeline.md`, `docs/spin-measurement.md`, `docs/calibration-procedure.md`.
- **Monte Carlo is not documented in physics-model.md.** Comments in `@glm/shot-simulator` and
  `@glm/shot-pipeline` point to physics-model.md for Monte Carlo settings and metric confidence
  factors. That document does not cover them; §4–5 above do. Its §12 item 7 also says that
  "launch-state and parameter uncertainty propagation" lives in `@glm/shot-simulator`. The
  simulator propagates launch uncertainty only (§5).
- **Reference carry comparison is all-or-nothing.** `normalizeReference` excludes carry, carry
  lateral and descent angle for any device that declares carry "landing at launch height". No
  option exists to assert flat ground at tee height, the case in which the definitions agree
  ([../datasets/reference-measurements/README.md](../datasets/reference-measurements/README.md)).
- **Nothing is VERIFIED.** No hardware driver, no calibration, no reference-monitor data.
  Every number produced so far comes from synthetic, replayed-synthetic or manually entered
  input.
