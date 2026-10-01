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
| A ground model (bounce, skid, roll) that is **provisional**: total and rollout are model-dependent | Suitable for betting, certified competition or safety-critical decisions. Practice and casual simulation only. |
| Synthetic, replay and developer manual-entry data sources; local storage and CSV/JSON export; a presentation layer; accuracy-validation tooling | Connected to any server. Nothing uploads data. |

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
| Synthetic, replay and manual sensor adapters | TESTED |
| Camera, radar and hybrid adapters | Stubs that throw `HardwareNotAvailableError`: TESTED. Drivers: camera Planned (Phase 2) — not implemented; radar and hybrid not implemented (see the [phase plan](docs/product-requirements.md#9-phase-plan)). |
| Launch-state estimator | TESTED, on synthetic data only |
| Air flight ([physics-model.md](docs/physics-model.md)) | TESTED; coefficients provisional, not fit to data |
| Terrain and ground ([terrain-model.md](docs/terrain-model.md)) | TESTED; provisional. Ground model v0.2 (crater impact, speed-dependent rolling resistance) in progress at the time of writing. |
| Shot pipeline and simulator, Monte Carlo uncertainty | TESTED end-to-end (`tests/`); no package-level unit tests |
| Persistence and export, presentation, validation tooling | TESTED. No reference data exists for the validation tooling. |
| Desktop range UI (`apps/desktop-ui`) | In progress (CREATED) |
| Camera capture, calibration, vision | Planned (Phase 2) — not implemented |
| Validation against a reference instrument | Tooling TESTED; no data. Proposed as Phase 3 in the [phase plan](docs/product-requirements.md#9-phase-plan). |
| Club delivery data | Planned (Phase 4) — not implemented |
| Course play / putting | Planned (Phase 5 / Phase 6) — not implemented |
| CI (`../.github/workflows/golf-launch-monitor.yml`) | CREATED; runs so far have failed (see [repository-inspection.md](docs/repository-inspection.md) §6) |

## Quickstart

Requires Node.js ≥ 22 and npm (tested with Node 22.22 and npm 10.9). Run every command from
this directory.

```bash
npm ci                                     # install exactly what package-lock.json pins
npm run check                              # typecheck + every test (unit, integration, replay, golden)
npm run datasets:generate                  # regenerate datasets/synthetic + datasets/golden-tests
npm run replay -- datasets/synthetic/range-fixtures.jsonl   # replay through the pipeline; prints a table
npm run dev --workspace @glm/desktop-ui    # desktop range UI (in progress)
```

- `datasets:generate` **overwrites committed files.** A diff means a model, estimator or
  fixture changed. Review it, explain it in the commit, and bump the model version if numbers
  moved.
- `replay` options: `--mc <n>` sets the Monte Carlo sample count (default 100);
  `--json out.json` writes the full shot records as a JSON export.
  - The table's validity column (e.g. `valid`) only says that the pipeline's checks passed on
    that input. For synthetic input it says nothing about real-world accuracy.
  - The **total** column comes from the provisional ground model. At the time of writing it is
    implausible for some shots (very long run-outs); see [terrain-model.md](docs/terrain-model.md).
- Other scripts: `npm run typecheck`, `npm test`, `npm run schemas:generate` (regenerates
  `packages/shared-types/schemas/`; a test fails when they are stale).

## Repository map

```
golf-launch-monitor/
├── apps/desktop-ui/        React + Vite range UI; the pipeline runs in a Web Worker (in progress)
├── packages/               Libraries, consumed as TypeScript source (@glm/<name>)
│   ├── shared-types/       Contracts, zod schemas, generated JSON Schemas (schemas/), versions
│   ├── core-math/          Vectors, linear algebra, seeded RNG, statistics
│   ├── units/              Exact conversions, golfer/engineering formatting
│   ├── sensor-adapters/    Synthetic, replay, manual adapters; hardware stubs; replay format
│   ├── launch-state/       Launch fit, spin resolution, confidence, LaunchState
│   ├── ballistics/         Environment, aerodynamic models, ball profiles, RK4 flight
│   ├── terrain-engine/     Terrain queries, surface catalog, Stimp relation
│   ├── ground-physics/     Bounce, skid, roll, rest
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
| [docs/architecture.md](docs/architecture.md) | Layers and data flow, packages, provenance model, confidence, uncertainty, determinism, versioning, process model, planned services, key decisions, known gaps |
| [docs/coordinate-system.md](docs/coordinate-system.md) | Axes, signs, spin vector and spin-axis tilt, metric definitions, display rules (binding) |
| [docs/physics-model.md](docs/physics-model.md) | Air-flight equations, aerodynamic models, environment, ball profiles, plausibility envelope, sources, limitations |
| [docs/terrain-model.md](docs/terrain-model.md) | Terrain, surface catalog, impact, skid and roll, Stimpmeter relation, limitations |
| [docs/repository-inspection.md](docs/repository-inspection.md) | Phase 0 inspection of the host repository, toolchain, risks, extraction plan, CI status |
| [datasets/README.md](datasets/README.md) | Dataset folders, file formats, privacy, regeneration |

Code comments also refer to `docs/sensor-specification.md`, `docs/vision-pipeline.md`,
`docs/spin-measurement.md` and `docs/calibration-procedure.md`. **These are not written yet.**

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
  [physics-model.md](docs/physics-model.md) and [terrain-model.md](docs/terrain-model.md) are
  labelled *secondary source, not verified on page*, because the build sandbox could not open
  source pages.
- **Confidence is a heuristic.** Confidence scores and validity thresholds are provisional
  engineering choices, not calibrated probabilities.
- **Monte Carlo intervals are partial.** They reflect launch-measurement noise only, not model
  error.
- **The end-to-end tests are circular for physics.** They compare the pipeline with synthetic
  truth generated by the same physics model. They test the software, not the physics.
