# Golf Launch Monitor

A local-first golf launch monitor and ball-flight simulator, written in TypeScript. It turns
sensor observations of a golf shot into a launch state (ball speed, launch angles, 3D spin
vector) in which **every value carries its provenance**: measured, estimated, assumed,
calculated, synthetic, manual or unavailable. It then simulates the flight, bounce and roll,
with uncertainty intervals.

This directory is a self-contained npm-workspaces monorepo. It sits inside an unrelated
repository; see [docs/repository-inspection.md](docs/repository-inspection.md).

## What this is, and what it is not

| It is | It is not |
|---|---|
| Typed data contracts with per-value provenance, runtime validation and JSON Schemas | A working launch monitor. No camera, radar or hybrid driver exists; those adapters are stubs that refuse to produce data. |
| A launch-state estimator (robust multi-frame fit, spin resolution, confidence and validity model) | Validated. Nothing here has been checked against a real launch monitor or real measurements. |
| An air-flight model (RK4, Reynolds- and spin-dependent drag and lift, spin decay) with **provisional** coefficients | Accurate to any stated tolerance. There is no claim of professional-grade accuracy and no equivalence with any commercial launch monitor. |
| A ground model (crater-tilted bounce, skid, speed-dependent roll) that is **provisional**: total and rollout are model-dependent | Suitable for betting, certified competition or safety-critical decisions. Practice and casual simulation only. |
| Synthetic, replay and developer manual-entry data sources; local storage and CSV/JSON export; a presentation layer; accuracy-validation tooling; a desktop range UI | Connected to any server. Nothing uploads data. |

Read [docs/limitations.md](docs/limitations.md) before using any number, and
[docs/safety.md](docs/safety.md) before hitting a real ball near any equipment.

## Status

Status words are defined in [product-requirements.md §1](docs/product-requirements.md#1-status-vocabulary):

- **CREATED**: a scaffold exists; its behaviour is not complete.
- **IMPLEMENTED**: works; no automated test exercises it.
- **TESTED**: automated tests exist and pass. They check against specifications, synthetic data
  or closed-form mechanics, not reality.
- **VERIFIED**: checked against independent real-world data.

**Nothing in this repository is VERIFIED.** Every number produced so far comes from synthetic,
replayed-synthetic or manually entered input.

| Area | Status |
|---|---|
| Contracts, JSON Schemas, core math, units and formatting | TESTED |
| Synthetic, replay and developer manual sensor adapters | TESTED |
| Camera, radar and hybrid adapters | Stubs that throw `HardwareNotAvailableError`; the refusal is TESTED. Camera driver: Planned (Phase 2) — not implemented. Radar and hybrid drivers: not implemented, no phase assigned. |
| Shot segmentation and trigger fusion | TESTED (`packages/shot-pipeline/test`). Triggers within 10 ms fuse as one impact; a later trigger inside the shot window (e.g. the ball hitting the screen) is kept as evidence with a warning and never opens a phantom shot. |
| Launch-state estimator (multi-frame fit, confidence, validity) | TESTED, on synthetic data only |
| Spin modes: measured (observation through a quality gate), estimated (player history, club prior), user-allowed generic fallback, unavailable | Resolution TESTED. No spin is measured from images: marked-ball measurement is Planned (Phase 3) — not implemented. |
| Air flight ([physics-model.md](docs/physics-model.md)) | TESTED; coefficients provisional, not fit to data |
| Terrain and ground, ground model v0.2 ([terrain-model.md](docs/terrain-model.md)) | TESTED against mechanics and a common-knowledge plausibility envelope, not against data; provisional. Drives reach that envelope only because a rolling-resistance term reported for putting speeds (*secondary source, not verified on page*) is extrapolated to fairway roll speeds. |
| Shot simulator and Monte Carlo uncertainty | TESTED (`packages/shot-simulator/test` and `tests/`). Intervals cover launch velocity and spin uncertainty only. |
| Persistence and export, presentation | TESTED |
| Validation tooling: error statistics, partitions, reference normalization | TESTED. No reference data exists. |
| Desktop range UI (`apps/desktop-ui`) | TESTED (79 tests on 2026-10-01, jsdom). Synthetic, replay and developer manual data only. |
| Camera capture, calibration, stereo vision | Planned (Phase 2) — not implemented |
| Club delivery data and practice analytics | Planned (Phase 4) — not implemented |
| Course play / putting | Planned (Phase 5 / Phase 6) — not implemented |
| Validation against a reference instrument: reference-monitor import, accuracy dashboard, held-out report, release readiness | Planned (Phase 7) — not implemented. The tooling above exists; there is no data. |
| CI (`../.github/workflows/golf-launch-monitor.yml`) | IMPLEMENTED: typecheck, tests, JSON-Schema freshness, workspace builds. The three most recent runs passed (see [repository-inspection.md](docs/repository-inspection.md) §6). |

Phases follow the product owner's plan ([phase plan](docs/product-requirements.md#9-phase-plan)):
0 Foundation · 1 Range MVP (no true spin) · 2 Calibration and stereo vision · 3 Spin ·
4 Club data and practice analytics · 5 Course play · 6 Putting · 7 Validation and hardening.

## Quickstart

Requires Node.js ≥ 22 and npm (tested with Node 22.22 and npm 10.9). Run every command from
this directory.

```bash
npm ci                                     # install exactly what package-lock.json pins
npm run check                              # typecheck + every test (packages, integration, replay, golden, desktop UI)
npm run build --workspaces --if-present    # production build of the desktop UI (apps/desktop-ui/dist)
npm run datasets:generate                  # regenerate datasets/synthetic + datasets/golden-tests
npm run replay -- datasets/synthetic/range-fixtures.jsonl   # replay through the pipeline; prints a table
npm run dev --workspace @glm/desktop-ui    # desktop range UI (Vite dev server)
```

- `datasets:generate` **overwrites committed files.** A diff means a model, estimator or
  fixture changed. Review it, explain it in the commit, and bump the model version if numbers
  moved.
- `replay` options: `--mc <n>` sets the Monte Carlo sample count (default 100);
  `--json out.json` writes the full shot records as a JSON export.
  - The CLI uses the calibration recorded in the replay header, the default indoor
    environment and the `premium-urethane-baseline` ball. Replay files carry no player or club,
    so the CLI attributes shots to no player and no club (right-handed labels); the desktop UI
    attributes replayed shots to the player and club of its current Setup and says so.
  - The table's validity column (e.g. `valid`) only says that the pipeline's checks passed on
    that input. For synthetic input it says nothing about real-world accuracy.
  - The **total** column comes from the provisional ground model. Spinless low shots keep
    skipping: the synthetic knuckleball runs about 83 yd past its 93 yd carry (a known
    limitation, pinned by tests; see [terrain-model.md](docs/terrain-model.md) §7.3).
- Other scripts: `npm run typecheck`, `npm test`, `npm run schemas:generate` (regenerates
  `packages/shared-types/schemas/`; a test fails when they are stale).

## Repository map

```
golf-launch-monitor/
├── apps/desktop-ui/        React + Vite range UI; the shot pipeline runs in a Web Worker
├── packages/               Libraries, consumed as TypeScript source (@glm/<name>)
│   ├── shared-types/       Contracts, zod schemas, generated JSON Schemas (schemas/), versions
│   ├── core-math/          Vectors, linear algebra, seeded RNG, statistics
│   ├── units/              Exact conversions, golfer/engineering formatting
│   ├── sensor-adapters/    Synthetic, replay, manual adapters; hardware stubs; replay format
│   ├── launch-state/       Launch fit, spin resolution, confidence, LaunchState
│   ├── ballistics/         Environment, aerodynamic models, ball profiles, RK4 flight
│   ├── terrain-engine/     Terrain queries, surface catalog, Stimp relation, rolling-resistance law
│   ├── ground-physics/     Crater-tilted impact, skid, roll, rest
│   ├── shot-simulator/     Air + ground simulation, metrics with provenance, Monte Carlo
│   ├── shot-pipeline/      Segmentation, trigger fusion, two-pass fit, ShotRecord, fixtures
│   ├── persistence/        Local repositories (memory, IndexedDB, JSON directory), CSV/JSON export
│   ├── presentation/       Badges, metric definitions, display values, banners
│   └── validation/         Error statistics, dataset partitions, reference comparison
├── scripts/                generate-datasets, replay, generate-schemas (run with tsx)
├── tests/                  Cross-package tests: integration/, replay/, golden/
├── datasets/               synthetic/, golden-tests/, raw-shots/, calibration/, reference-measurements/
└── docs/                   Design documents (below)
```

## Documentation

| Document | Contents |
|---|---|
| [docs/product-requirements.md](docs/product-requirements.md) | Requirements by area with status, acceptance criteria, phase plan, non-goals |
| [docs/limitations.md](docs/limitations.md) | What the numbers cannot tell you; read before using any number |
| [docs/safety.md](docs/safety.md) | Physical setup precautions (screen, clearance, shank zone, illuminators), privacy, product limits |
| [docs/architecture.md](docs/architecture.md) | Layers and data flow, packages, provenance model, confidence, uncertainty propagation, determinism, versioning, process model, planned services, key decisions, known gaps |
| [docs/coordinate-system.md](docs/coordinate-system.md) | Axes, signs, spin vector and spin-axis tilt, metric definitions, display rules (binding) |
| [docs/sensor-specification.md](docs/sensor-specification.md) | Sensor-adapter contract, adapters today, driver requirements, camera engineering targets, frame buffer, triggers, health metrics, time sync |
| [docs/calibration-procedure.md](docs/calibration-procedure.md) | Planned camera and world-frame calibration, quality metrics and green/yellow/red rules (Phase 2) |
| [docs/vision-pipeline.md](docs/vision-pipeline.md) | Stages A–E: the planned ball detection and stereo stages, and the implemented multi-frame launch fit |
| [docs/spin-measurement.md](docs/spin-measurement.md) | Spin representation, resolution modes, effect on confidence, the planned marked-ball measurement (Phase 3) |
| [docs/physics-model.md](docs/physics-model.md) | Air-flight equations, aerodynamic models, environment, ball profiles, plausibility envelope, uncertainty propagation, sources, limitations |
| [docs/terrain-model.md](docs/terrain-model.md) | Terrain, surface catalog, crater impact, skid and roll, Stimpmeter relation, plausibility envelope, limitations |
| [docs/putting-model.md](docs/putting-model.md) | What exists for putting and the planned putting model (Phase 6) |
| [docs/validation-protocol.md](docs/validation-protocol.md) | What validation means here, the tooling, reference mapping, partitions, the first real campaign (Phase 7) |
| [docs/repository-inspection.md](docs/repository-inspection.md) | Phase 0 inspection of the host repository, toolchain, risks, extraction plan, CI status |
| [datasets/README.md](datasets/README.md) | Dataset folders, file formats, privacy, regeneration |

## Honesty statement

- **No real measurements yet.** Every result so far comes from synthetic, replayed-synthetic or
  developer manual input, and each is labelled that way end to end. Synthetic values are never
  labelled measured, and no value's provenance is ever upgraded.
- **Physics is provisional.**
  - Aerodynamic coefficients were chosen to be plausible, not fit to data. The plausibility
    envelope against widely published TrackMan PGA Tour averages is circular, because the same
    averages guided the choice; it is a sanity check, not validation.
  - Ground parameters are judgements. Total and rollout are more model-dependent than carry.
- **Literature is unverified.** The literature figures in
  [physics-model.md](docs/physics-model.md), [terrain-model.md](docs/terrain-model.md),
  [spin-measurement.md](docs/spin-measurement.md) and [putting-model.md](docs/putting-model.md)
  are labelled *secondary source, not verified on page*, because the build sandbox could not
  open source pages.
- **Confidence is a heuristic.** Confidence scores and validity thresholds are provisional
  engineering choices, not calibrated probabilities. The UI shows two of them separately:
  launch-data confidence (fit, sensor, calibration, spin) and flight-model confidence (capped by
  the provisional ball and ground models and by the spin that drove the flight).
- **Monte Carlo intervals are partial.** They sample launch velocity and spin only. Model and
  coefficient error, environment and ground parameters are not included.
- **The end-to-end tests are circular for physics.** They compare the pipeline with synthetic
  truth generated by the same physics model. They test the software, not the physics.
