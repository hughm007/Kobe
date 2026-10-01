# Validation protocol

**Applies to:** `@glm/validation` (`packages/validation/src`), schema `glm-schema-0.1.0`,
coordinate system `glm-world-1.0`.

> **Status: nothing in this repository is VERIFIED.** No hardware measurement and no reference
> measurement exists (`datasets/raw-shots/` and `datasets/reference-measurements/` are empty).
> The tooling below is TESTED on hand-built inputs, and the end-to-end checks are TESTED on
> **synthetic** data only. Validation against real shots is Planned (Phase 3) — not implemented.

Related: [coordinate-system.md](coordinate-system.md) (definitions and signs; binding),
[sensor-specification.md](sensor-specification.md), [calibration-procedure.md](calibration-procedure.md),
[physics-model.md](physics-model.md), [terrain-model.md](terrain-model.md),
[limitations.md](limitations.md), [product-requirements.md](product-requirements.md) §8 (phase
acceptance), [../datasets/reference-measurements/README.md](../datasets/reference-measurements/README.md).

## 1. What validation means here

**Validation** = quantified agreement between this system and an **independent reference
instrument** on the **same physical shots**, captured at the same time, analyzed with
pre-registered rules, and reported on **held-out** data only. A metric may be called
**VERIFIED** only for the conditions tested (clubs, speeds, ball, lighting, setup) and only as
"agreement with *make / model / firmware*". The reference has its own error, so
`error = ours − reference` contains both systems' errors.

Two different questions, kept apart:

| Question | Metrics | Where it can be answered |
|---|---|---|
| Does the sensor + estimator measure launch correctly? | Ball speed, vertical and horizontal launch, total spin, spin axis | Indoors, against a reference that observes the launch |
| Do the flight and ground models predict where the ball goes? | Carry, carry lateral, apex, descent, total | Only against **observed** flights. In a bay the flight ends at the screen, so a reference's carry and total there are themselves model outputs: the comparison is model-vs-model. Ground results are additionally provisional ([terrain-model.md](terrain-model.md)). |

To isolate our flight model from our launch errors, simulate from the **reference's** launch
values and compare with the reference's observed flight (Planned, Phase 7 — not implemented).

**Not validation:** synthetic recovery tests (the same physics generates the truth and fits it),
the plausibility envelope ([physics-model.md](physics-model.md) §9, circular), and golden tests
(change detection).

## 2. What exists now

| Component | API | Status | Tests (by behavior) |
|---|---|---|---|
| Error statistics | `errorStats`, `pairedErrors`, `groupedErrorStats`, `binLabel`, `intervalCoverage`, `formatStat`, `accuracyTableMarkdown` | TESTED | `stats.test.ts`: hand-computed values for odd and even n; missing pairs skipped and counted, never zero-filled; zero treated as data; NaN throws; a group with only missing values throws by default; `__proto__` group kept; half-open bins; closed-interval coverage |
| Partitions with held-out guard | `assignPartition`, `partitionUnit`, `fnv1a32`, `fmix32`, `PARTITION_ALGORITHM`, `DEFAULT_PARTITION_FRACTIONS`, `PartitionedDataset` | TESTED | `partition.test.ts`: published FNV-1a and MurmurHash3 test vectors; literal partition vectors other tools must reproduce; ≈ 60/20/20 over 10k sequential ids; salt reshuffles; bad fractions rejected; every item in exactly one partition, order-independent; held-out refused without the exact purpose and acknowledgement; every access logged; held-out items unreachable except through the guard; duplicate ids rejected |
| Reference normalization | `ReferenceMeasurementSchema`, `normalizeReference`, `compareToReference`, `REFERENCE_METRIC_DEFINITIONS`, `COMPARABLE_METRICS` | TESTED | `reference.test.ts`: exact unit factors and sign flips, each logged; no-op when conventions match; unknown units (incl. `Object.prototype` names), wrong dimensions and foreign definitions refused; landing-at-launch-height carry and other landing metrics refused; unknown carry definition and unknown ball-speed point refused; malformed records throw; errors computed in our sign convention |
| Synthetic self-consistency | `tests/integration/pipeline.test.ts` | TESTED (synthetic only) | "recovers launch conditions from noisy observations within tight tolerances" (ball speed < 0.25 m/s, launch angles < 0.2°, spin < max(60 rpm, 5 %), default synthetic noise) |
| Uncertainty calibration | `tests/integration/uncertainty-calibration.test.ts` | TESTED (synthetic only) | "1-sigma ball speed and launch angle intervals cover the truth ~68 % of the time" (80 seeded shots; accepted band 0.52–0.84, about ±3 binomial SD); "the Monte Carlo 90 % carry interval covers the true carry most of the time" (24 shots, 40 samples, ≥ 70 %) |
| Replay truth check | `tests/replay/replay.test.ts` | TESTED (synthetic only) | "estimated launch conditions match the header truth (validation use of truth only)" |
| Golden regression | `tests/golden/golden.test.ts` | TESTED | Detects any change (1e-9 relative); says nothing about correctness |

Run on 2026-10-01: `npx vitest run packages/validation` → 3 files, 41 tests passed;
`npx vitest run tests/integration` → 2 files, 15 tests passed.

**Not implemented (Planned, Phase 3):** a loader for reference files, a pairing tool, a report
generator, experiment tracking (§7), paired version-comparison statistics (§8), a documented
carry-at-launch-height conversion (§5.3), and any real data.

## 3. Dataset format

### 3.1 Our side

| Artifact | Format | Location |
|---|---|---|
| Raw recording | `glm-replay-1` JSON Lines with `dataOrigin: "live"`, the device's `sensorConfiguration` (camera/radar/hybrid) and its `CalibrationRecord` in the header ([../datasets/README.md](../datasets/README.md)) | `datasets/raw-shots/` (git-ignored) |
| Processed shots | `ShotRecord`s in the `glm-shot-export` JSON envelope; each records coordinate-system, schema, calibration, sensor-configuration, ball-profile, physics (`air+ground` tag), estimator and software versions | `datasets/raw-shots/` |

`compareToReference` needs our values in SI and our sign conventions:

| Metric | Our field | Conversion |
|---|---|---|
| `ballSpeed` | `launch.ballSpeedMps.value` | m/s, none |
| `verticalLaunch`, `horizontalLaunch`, `spinAxis` | `launch.verticalLaunchAngleDeg`, `horizontalLaunchAngleDeg` (+left), `spinAxisTiltDeg` (+curves right) | deg → rad |
| `totalSpin` | `launch.totalSpinRpm.value` | rpm → rad/s |
| `carry`, `carryLateral` (+left), `total`, `apexHeight` | `result.metrics.carryM`, `carryLateralM`, `totalM`, `apexHeightM` | m, none |
| `descentAngle` | `result.metrics.descentAngleRad` | rad, none |

An unavailable value is passed as `null` and is skipped and counted, never compared as 0.

### 3.2 Reference side (`ReferenceMeasurementSchema`, strict)

One JSON object per shot; proposed file `<campaign>.reference.jsonl` in
`datasets/reference-measurements/` (no loader enforces this yet). Values below are
illustrative placeholders, not data:

```json
{"referenceId":"ref-0001","shotId":"<our ShotRecord.shotId>",
 "device":{"make":"<make>","model":"<model>","firmware":"<version or null>"},
 "metrics":{"ballSpeed":{"value":0,"unit":"mph","definition":"glm:ball-speed"},
            "horizontalLaunch":{"value":0,"unit":"deg","definition":"glm:horizontal-launch-angle"}},
 "conventions":{"horizontalAngleSign":"right-positive","spinAxisSign":"right-positive",
                "lateralSign":"right-positive","carryDefinition":"unknown","ballSpeedReference":"unknown"},
 "notes":""}
```

Units must be `@glm/units` ids (`m`, `yd`, `ft`, `m/s`, `mph`, `km/h`, `rad`, `deg`, `rad/s`,
`rpm`, …). The `definition` field is an **assertion** by whoever writes the record that the
device's metric matches ours (§5.1). With `ballSpeedReference: "unknown"`, as in this example,
ball speed is refused until the device's measurement point is documented (§5.2).

### 3.3 Pairing

- The key is `ReferenceMeasurement.shotId` = our `ShotRecord.shotId`.
- **Rule (Planned — not implemented):** shot ids are assigned once, at capture, and preserved
  when a recording is re-processed. Today ids come from the injected `nextShotId` at processing
  time (e.g. `deterministicIds()` yields `shot-0001`, `shot-0002`, …), so re-processing with a
  different id provider would change ids, and with them the partitions (§4).
- A campaign manifest (proposal) lists per shot: capture index, our `shotId`, the reference's
  own row id and time, player, club, ball, session, and notes (mishit, suspected mispair).
- Unpaired shots and shots with ambiguous pairing are counted and reported, never dropped
  silently.

## 4. Partitions and the held-out rule

`assignPartition(shotId, salt)` maps each shot to `training` (60 %), `validation` (20 %) or
`held-out-test` (20 %) by `u = fmix32(fnv1a32(salt + ":" + shotId)) / 2³²`
(`PARTITION_ALGORITHM = "glm-partition-fnv1a32-fmix32-v1"`). A shot's partition depends only on
`(salt, shotId)`: it does not change as the dataset grows or is reordered, and other tools can
reproduce it from the published test vectors.

`PartitionedDataset` exposes `training()`, `validation()` and `sizes()` freely. `heldOutTest()`
returns the held-out items only for `{ purpose: "final-accuracy-report", acknowledgement: "I will
not tune models on these results" }` and logs every access (`heldOutAccessLog()`).

**Rules:**

1. **Never tune on held-out data.** Tuning includes aerodynamic and ground parameters,
   estimator settings, spin-gate, confidence and calibration thresholds, noise models, outlier
   and exclusion rules, and bin edges.
2. **Tune on training; choose between candidates on validation.**
3. **Fix the salt and fractions before data collection** and record them. Changing the salt
   after seeing results moves held-out shots into training.
4. **Decide exclusions before opening the held-out set**, and report exclusion counts per
   partition.
5. **One look per frozen model.** If anything is changed after the held-out results are seen,
   that held-out set no longer gives an unbiased estimate for the changed model; collect new
   held-out data (a new campaign).
6. **Correlated shots.** A per-shot split puts shots from the same session, player and
   calibration in every partition, so it does not measure performance on a *new* setup. Also
   report a grouped hold-out (whole sessions or players). Grouped partitioning is not
   implemented; the key today is `shotId` only.

## 5. Reference-monitor mapping

### 5.1 Definitions

A reference metric is compared only if it declares our definition id
(`REFERENCE_METRIC_DEFINITIONS`):

| Metric | `definitionId` | Our definition | SI unit | Sign field | Landing metric |
|---|---|---|---|---|---|
| `ballSpeed` | `glm:ball-speed` | \|v\| of the ball center at launch | m/s | — | no |
| `verticalLaunch` | `glm:vertical-launch-angle` | atan2(vz, √(vx² + vy²)), + up | rad | — | no |
| `horizontalLaunch` | `glm:horizontal-launch-angle` | atan2(vy, vx) from the target line, **+ left** | rad | `horizontalAngleSign` | no |
| `totalSpin` | `glm:total-spin` | \|ω\| at launch | rad/s | — | no |
| `spinAxis` | `glm:spin-axis-tilt` | tilt about the launch velocity, **+ curves right** ([coordinate-system.md](coordinate-system.md) §4.3) | rad | `spinAxisSign` | no |
| `carry` | `glm:carry` | horizontal distance to **first ground contact** | m | — | yes |
| `carryLateral` | `glm:carry-lateral` | offset from the target line at first contact, **+ left** | m | `lateralSign` | yes |
| `total` | `glm:total` | horizontal distance to rest | m | — | no |
| `apexHeight` | `glm:apex-height` | max ball-center height − launch ball-center height | m | — | no |
| `descentAngle` | `glm:descent-angle` | angle below horizontal at first contact | rad | — | yes |

`normalizeReference` throws on a malformed record. Otherwise it marks a metric **incompatible**
(excluded, with a reason) when: the name is not comparable; the definition differs; it is a
landing metric and `carryDefinition` is `landing-at-launch-height` or `unknown`; it is ball speed
and `ballSpeedReference` is `unknown`; the unit is unknown; or the unit's dimension is wrong.
Compatible values are converted to SI and sign-flipped into our convention, and every
conversion and flip is logged in `conversionsApplied`. `compareToReference` then gives one row
per metric with `error = ours − reference`, or a "not compared: …" note.

### 5.2 Sign conventions (TrackMan as the expected first reference)

TrackMan's own definition pages could not be fetched for this project (the research sandbox
blocked page fetches; [physics-model.md](physics-model.md) §11), so no TrackMan definition or
sign convention has been read first-hand.
The "expected" column is the convention commonly shown on commercial displays, as described in
[coordinate-system.md](coordinate-system.md) §3 and §4.3, and in
[physics-model.md](physics-model.md) §9 for carry. **Secondary source, not verified on page.**
Confirm each row from the device's documentation for the installed firmware, then confirm it
empirically in the pilot (§10, step 5).

| Quantity | Ours | Expected on the reference | Declare | Result |
|---|---|---|---|---|
| Launch direction | + = left | + = right | `horizontalAngleSign: "right-positive"` | flipped |
| Spin axis | + = curves right | + = curves right | `spinAxisSign: "right-positive"` | not flipped |
| Side / offline | + = left | + = right | `lateralSign: "right-positive"` | flipped |
| Carry | to first ground contact | to where the ball descends through launch height | `carryDefinition: "landing-at-launch-height"` | carry, carry lateral and descent angle **refused** (§5.3) |
| Ball-speed point | ball center | not documented here | `ballSpeedReference: "unknown"` until documented | ball speed **refused** until confirmed |

Definition risks to settle **before** asserting a definition id:

- **Spin axis frame.** Ours is the tilt about the launch velocity. If a device measures tilt in a
  different frame, the two differ at higher launch angles even with matching signs.
- **Height.** Ours is ball-center height above the launch ball-center height.
- **Total.** Indoors a device's total is its own roll model, not an observation.
- **Target line.** Both systems must aim at the same physical line (one alignment stick). A
  misalignment ε appears as a constant bias of ε in horizontal launch and of D·tan ε in lateral
  offsets, and cannot be attributed to either system without a third measurement.

### 5.3 Carry definitions

| `carryDefinition` | What happens |
|---|---|
| `first-ground-contact` | Compared (same as ours). |
| `landing-at-launch-height` | Carry, carry lateral and descent angle refused. |
| `unknown` | Same three refused. |

In the current range configuration (`createRangePipelineConfig`: flat terrain, tee height 0),
our first contact happens when the ball center comes back down to z = 0, the address ball-center
height, so for shots off the mat the two definitions coincide. Off a tee of height h our carry
ends h lower: at a 40° descent that adds h / tan 40° of horizontal travel (25 mm tee → 3.0 cm).
**No option exists to assert this equivalence**, and declaring `first-ground-contact` for a
device that uses launch height would be a false declaration. A documented conversion (an
explicit "landed at launch height" assertion, or our own carry-at-launch-height metric computed
from the trajectory) is Planned (Phase 3) — not implemented.

## 6. Metrics and statistics to report

For each comparable metric, overall and per group, report `groupedErrorStats` output (rendered
with `accuracyTableMarkdown`):

| Statistic | Field | Meaning |
|---|---|---|
| n, skipped | `n`, `skipped` | Pairs compared; pairs with a missing side |
| Bias | `bias` | Mean signed error (ours − reference): systematic offset (calibration, alignment, definitions) |
| MAE | `mae` | Mean \|error\| |
| RMSE | `rmse` | √mean(error²); RMSE² = bias² + SD²·(n − 1)/n |
| Median, median abs | `medianSigned`, `medianAbs` | Robust center and spread |
| p95 abs | `p95Abs` | 95th percentile of \|error\| (Hyndman–Fan type 7) |
| SD | `standardDeviation` | Sample SD (n − 1) of signed errors: random spread |

Always report **bias and spread separately**; calibration and alignment errors are biases
([calibration-procedure.md](calibration-procedure.md) §9) and do not shrink with more shots.

**Groups** (`groupedErrorStats` with a key function; `binLabel` for continuous variables). Bin by
the **reference** value or by an independent variable, never by our own measured value (that
would correlate the bin with our error). Bin edges are fixed in the campaign plan.

| Group | Key | Example edges (proposal) |
|---|---|---|
| Club | `launch.clubId` or the club's category | — |
| Ball speed | reference ball speed | 30, 40, 50, 60, 70 m/s |
| Spin | reference total spin | 2,000, 3,000, 4,500, 6,000, 8,000 rpm |
| Launch angle | reference vertical launch | 5, 10, 15, 20, 25, 30° |
| Player | `launch.playerId` | — |
| Setup | `sensorConfiguration.version` + `launch.calibrationVersion` (+ lighting note) | — |
| Confidence tier | `confidenceLabel(launch.overallConfidence)`: high ≥ 0.8, medium ≥ 0.5, low > 0, none | — |
| Validity, spin source | `launch.validity`; `launch.totalSpinRpm.source` | — |

**Checks on our own uncertainty and confidence:**

- **Coverage.** The fraction of reference values inside our ±1σ (expect ≈ 0.68) and inside our
  Monte Carlo p05–p95 (`intervalCoverage`, expect ≈ 0.90). The reference's own error widens
  the observed spread (Var(ours − ref) = Var(our error) + Var(reference error) if independent),
  so measured coverage understates ours. Monte Carlo intervals include launch noise only
  ([limitations.md](limitations.md#uncertainty-and-confidence)), so flight-metric coverage is
  expected to be low until model error is included.
- **Confidence ordering.** Errors should shrink from low to medium to high tier. If they do
  not, the confidence model needs retuning (on training data only).

**Sample size arithmetic.** SE(bias) = SD / √n; for a hypothetical SD of 1 m/s, n = 100 gives
0.1 m/s. A coverage estimate has SD √(p(1 − p)/n): 0.03 at p = 0.9, n = 100. With type-7
quantiles, p95 at n = 20 sits between the 19th and 20th sorted values ((n − 1)·0.95 = 18.05,
0-based), i.e. near the maximum; proposal: report p95 only for groups with n ≥ 40 and flag
smaller groups.

**Always report what was not compared:** invalid shots (with `rejectionReasons`), skipped
simulations (`simulationSkippedReason`), incompatible metrics (with reasons), unpaired shots and
missing values, per partition.

## 7. Experiment tracking (Planned — not implemented)

Every run, including failed and negative ones, writes a manifest (proposal) with:

| Group | Fields |
|---|---|
| Identity | run id, campaign id, created time, purpose (`development` \| `model-selection` \| `final-accuracy-report`) |
| Code | git commit, `SOFTWARE_VERSION` |
| Versions | schema, coordinate system, physics tag (`PHYSICS_MODEL_VERSION+GROUND_MODEL_VERSION`), environment model, estimator, ball profile(s), sensor configuration(s), calibration version(s), replay format |
| Data | input files with SHA-256 hashes, shot counts |
| Partition | `PARTITION_ALGORITHM`, salt, fractions, `sizes()`, `heldOutAccessLog()` |
| Reference | make, model, firmware, declared conventions, definition-mapping source (document and version) |
| Settings | Monte Carlo samples and seeds, timesteps, `triggerLatencyS`, generic spin fallback on/off |
| Outputs | accuracy tables, `conversionsApplied`, `incompatible`, exclusion counts |

## 8. Physics-version comparison

1. The recorded observation streams are the fixed input. Re-process them with each candidate
   version, keeping the same shot ids (§3.3) so pairs and partitions do not move; every
   `LaunchState` records `physicsModelVersion` (air + ground tag) and `estimatorVersion`.
2. Compare candidates on the **validation** partition with paired per-shot differences,
   Δᵢ = |e_new,ᵢ| − |e_old,ᵢ| on the same shots, alongside both versions' error tables. A
   significance test or bootstrap is Planned — not implemented.
3. Compare launch metrics too: the drag-aware refit uses the air model, so a physics change can
   move ball speed and angles slightly.
4. Evaluate only the finally selected version on held-out data (§4, rule 5).
5. **Total and rollout are provisional and model-dependent.** The ground model is being upgraded
   (v0.2: crater impact and speed-dependent rolling resistance); see
   [terrain-model.md](terrain-model.md). Treat total comparisons as model-vs-model unless the
   reference observed the roll.
6. A version bump that moves numbers also changes the golden files; regenerate and explain them
   ([../datasets/README.md](../datasets/README.md)).

## 9. Acceptance thresholds

**None exist. They are TBD from data.** [product-requirements.md](product-requirements.md) §8
requires per-metric targets written down before the main data collection. Proposed process:

1. Propose candidate targets from the reference device's first-party stated tolerance (if any),
   from repeatability and agreement measured in the pilot campaign (§10, step 5), and from what
   matters on the course (e.g. 0.1° of start direction is 0.26 m at 150 m).
2. Freeze them in [product-requirements.md](product-requirements.md) before the main campaign:
   per metric, a bias limit, a p95 |error| limit, the conditions, and a minimum n.
3. A metric becomes VERIFIED only if it meets its frozen targets on the held-out partition; the
   claim names the reference device and the conditions.

No number in this repository is a target. The synthetic test tolerances (0.25 m/s, 0.2°) and the
plausibility envelope (±6 % carry) check software and sanity, not accuracy.

## 10. First real validation campaign: step by step

Preconditions (Planned, Phase 2): a working camera driver ([sensor-specification.md](sensor-specification.md)
§4), a green calibration ([calibration-procedure.md](calibration-procedure.md)), access to a
reference device, and the safety checklist ([safety.md](safety.md)).

1. **Write the plan, before any data.** Metrics in scope; conditions (clubs, ball model,
   players, lighting); target sample sizes per group; partition salt and fractions; exclusion
   rules; bin edges; statistics; pilot plan. Commit it.
2. **Reference conventions.** From the device's documentation for its firmware, record every
   definition and sign convention used in §5. Anything not confirmed is declared `unknown` and
   is refused, never guessed.
3. **Setup.** Align both devices to the same physical target line; reach green calibration and
   pass the known-length check; record environment (temperature, pressure, humidity), ball
   model and lighting.
4. **Capture and pair.** One shot at a time; wait until both devices have registered it; log
   capture index, reference row id, player, club and notes (mishit, double trigger).
5. **Pilot campaign** (its own campaign id, never part of a final report; ~30–50 shots,
   provisional). Hit deliberate pushes, pulls, draws and fades to confirm signs; check pairing,
   conversion logs and incompatible lists; measure repeatability; fix the procedure; then freeze
   thresholds (§9).
6. **Main collection.** Spread shots across clubs, speeds and players; randomize club order
   within a session so drift (light, temperature, fatigue) is not confounded with club; collect
   over several sessions and days; re-verify calibration every session; keep invalid shots.
7. **Process.** Replay the recordings with fixed versions; export `ShotRecord`s; write reference
   records; run `normalizeReference` and `compareToReference`; save conversion and
   incompatibility logs; apply the pre-registered exclusions.
8. **Partition and develop.** Build a `PartitionedDataset` with the pre-registered salt; tune on
   training; choose on validation; write a manifest for every run (§7).
9. **Freeze.** Bump and record all versions; no further changes.
10. **Final report.** Open the held-out set once with the exact purpose and acknowledgement;
    produce the grouped tables and coverage figures; include the manifest, the access log and
    all exclusion counts; publish negative results too.
11. **Status.** Mark a metric VERIFIED only where §9 is met, scoped to the conditions and the
    named reference; everything else stays TESTED. Update
    [product-requirements.md](product-requirements.md) and [limitations.md](limitations.md).
12. **Afterwards.** Any model change makes the old held-out result stale for that version; the
    next campaign needs new held-out data.

## 11. Limits and open items

- Agreement with one reference is not absolute accuracy; the reference's own error is unknown
  unless its maker documents it.
- Indoors the flight ends at the screen, so no device observes carry, apex or total there; a
  reference's values for them are its own model outputs.
- Per-shot partitions leak session and player effects (§4, rule 6).
- Missing tooling: reference loader, pairing tool, report generator, run manifests, paired
  version statistics, carry-at-launch-height conversion, grouped partitions.
- Stable capture-time shot ids are not implemented (§3.3).
