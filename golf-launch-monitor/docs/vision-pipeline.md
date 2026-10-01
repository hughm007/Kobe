# Vision pipeline (Stages A–E)

**Document date:** 2026-10-01. **Applies to:** estimator `glm-launch-fit-0.1.0`
(`ESTIMATOR_VERSION`, `@glm/launch-state`), coordinate system `glm-world-1.0`.
Status words (CREATED, IMPLEMENTED, TESTED, VERIFIED, Planned) are defined in
[product-requirements.md §1](product-requirements.md#1-status-vocabulary).

> **Status in one paragraph.** Only **Stage E**, the multi-frame launch fit, exists. It is
> **IMPLEMENTED and TESTED on synthetic 3D ball positions**: positions generated in the tests or
> by the synthetic sensor adapter, never by a camera. **Stages A–D** (seeing the ball in camera
> images) are **Planned (Phase 2) — not implemented**: there is no camera driver, no image
> processing and no calibration solver. Nothing in this pipeline is **VERIFIED** against real
> measurements.

Frames, axes, signs and the camera model follow [coordinate-system.md](coordinate-system.md).
Spin is resolved separately ([spin-measurement.md](spin-measurement.md)). Known gaps are listed in
[limitations.md](limitations.md).

---

## 1. Overview

| Stage | Job | Emits (contract type in `@glm/shared-types`) | Status |
|---|---|---|---|
| A | Ball at address: one stationary ball inside the calibrated hitting zone | `BallAddressObservation` | Planned (Phase 2) — not implemented. Its consumer `ballZoneFactor` is TESTED. |
| B | Trigger confirmation: when impact happened | `TriggerObservation` | Hardware triggers: Planned (Phase 2) — not implemented. Fusion (`fuseTriggers`) is IMPLEMENTED and runs end to end with one synthetic trigger; the path for disagreeing sources has no automated test. |
| C | Early-flight 2D tracking in each camera | `BallDetection2dObservation` | Planned (Phase 2) — not implemented |
| D | Multi-camera matching, triangulation, reprojection error | `BallPosition3dObservation` (world-frame center and 3×3 covariance) | Planned (Phase 2) — not implemented |
| E | Multi-frame launch fit: launch position and velocity with covariance | `LaunchFitSuccess` / `LaunchFitFailure`, `LaunchFitDiagnostics` | **IMPLEMENTED, TESTED (synthetic)** |

```
camera frames ──► A address ─┐
trigger sources ─► B trigger ─┤   (A–D: Planned, Phase 2)
camera frames ──► C 2D track ─► D 3D points ─┐
                                             ▼
   RawSensorObservation stream (today: synthetic generator, replay file, developer manual entry)
                                             ▼
   ShotSegmenter (@glm/shot-pipeline) ─► processShot ─► Stage E fit ─► spin ─► LaunchState
```

Today the observation stream comes only from `SyntheticSensorAdapter`, `ReplaySensorAdapter` or
the developer-only `ManualEntryAdapter` (`@glm/sensor-adapters`). The camera, radar and hybrid
adapters are stubs that throw `HardwareNotAvailableError`.

---

## 2. Stages A–D: intended design (Planned (Phase 2) — not implemented)

None of this section exists as code. It records the intended design and the contract each stage
must satisfy so that Stage E can consume it unchanged. Numbers marked *calculated* are
arithmetic from stated inputs. They are not device specifications or measurements.

**Common requirements**

- Every stage works in calibrated cameras (`CalibrationRecord`: pinhole intrinsics,
  Brown–Conrady distortion, world-to-camera extrinsics; OpenCV axes,
  [coordinate-system.md §7](coordinate-system.md#7-camera-to-world-transform)). The planned
  calibration is described in [calibration-procedure.md](calibration-procedure.md).
- Camera engineering targets (frame rate, exposure, resolution, sync, frame buffer) and the
  health metrics are proposed in [sensor-specification.md](sensor-specification.md).
- Every observation carries `timestampS` on the shared session clock: the mid-exposure time of
  its frame, with device clocks converted by the adapter.
- Nothing downstream of an adapter sees camera coordinates. Stage D emits world-frame points.

### 2.1 Stage A — ball at address

| Step | Intended method |
|---|---|
| Region | Hitting zone around `WorldFrameCalibration.addressPointM`, projected into each camera. |
| Detect | Circular blob of the expected pixel radius (≈ f·r/Z from calibration) and contrast. |
| Confirm | Stereo-triangulate the candidate. Count balls in the zone. |
| Stationary | Position spread over a short window of frames below a threshold (value to be set from Phase 2 data). |
| Emit | `BallAddressObservation { positionM, stationary, inHittingZone, ballCount, confidence }` |

What already consumes it (code exists):

- `ballZoneFactor` (`@glm/launch-state`, TESTED). More than one ball, or a ball outside the
  zone, is **blocking**: the shot is `invalid`. No observation scores 0.6. Zero balls scores
  0.4, a ball that is not stationary scores 0.5, and a verified ball scores `0.5 + 0.5·confidence`.
- `ShotSegmenter` keeps the latest address observation at or before the first trigger, inside
  the pre-trigger window.
- The address position sets the launch reference time (§3.1, step 4).

### 2.2 Stage B — trigger confirmation

Contract trigger sources: `microphone`, `beam-break`, `ball-motion`, `club-proximity` (plus
`synthetic`, `manual`).

What exists (`@glm/shot-pipeline`, IMPLEMENTED):

- `ShotSegmenter` opens a shot on a trigger. It collects observations in
  `[trigger − preTriggerS, trigger + postTriggerS]` (`FrameBufferConfiguration`). Triggers within
  50 ms of the first one (`TRIGGER_CLUSTER_WINDOW_S`) count as the same impact.
- `fuseTriggers` subtracts a per-source latency, which the caller supplies; no device latencies
  are known. It takes the median of the corrected times and sets confidence = `1 − Π(1 − cᵢ)`.
  The confidence is halved, with a warning, when sources disagree by more than 3 ms
  (`TRIGGER_AGREEMENT_TOLERANCE_S`).
- `triggerFactor` scores `0.3 + 0.7·confidence`. With no trigger, it scores 0.5 and the impact
  time is inferred from ball motion.

Intended (not implemented): a trigger is *confirmed* only when Stage A saw a stationary ball
and Stage C sees that ball leave the address region within the trigger window. Today any trigger
opens a shot.

### 2.3 Stage C — early-flight 2D tracking

| Step | Intended method |
|---|---|
| Background model | Per-camera model of the static scene (for example a running median or a per-pixel Gaussian mixture), updated only while no shot is active, so the club, the golfer and the ball stand out as foreground. |
| Candidates | Foreground blobs filtered by the expected ball radius at the predicted depth, by circularity and by contrast. The club head and shaft are the main confusers near impact. |
| Kalman filter | One filter per camera in pixel space, state `(u, v, u̇, v̇)` (optionally with acceleration), seeded at the address position. Its prediction gates the search window and associates detections across frames. |
| Emit | `BallDetection2dObservation { cameraId, frameIndex, centerPx, radiusPx, confidence }` |

Why frame rate and exposure matter (*calculated*, 75 m/s ball speed):

| Frame rate (fps) | Ball travel per frame | In ball diameters (42.67 mm) |
|---|---|---|
| 240 | 312.5 mm | 7.3 |
| 1000 | 75.0 mm | 1.8 |
| 2000 | 37.5 mm | 0.9 |

Translational motion blur is `v · t_exposure`: 1.5 mm at 20 µs and 7.5 mm at 100 µs. A global
shutter avoids rolling-shutter skew (`CameraDeviceConfiguration.shutter` records it). Camera
health metric ids for these conditions already exist in the contract (`exposure-blur`,
`dropped-frames`, `sync-drift`, …); no code computes them.

### 2.4 Stage D — matching, triangulation, reprojection error

| Step | Intended method |
|---|---|
| Synchronization | Hardware-synchronized exposures preferred (`syncMode`). Residual drift is reported as the `sync-drift` health metric, which `sensorHealthFactor` already turns into the product warning *"Camera synchronization drift detected; launch direction may be unreliable."* |
| Matching | Pair detections across cameras by the epipolar constraint and each camera's Kalman prediction. |
| Triangulation | Undistort, linear (DLT) triangulation, then nonlinear refinement minimizing reprojection error. |
| Covariance | Propagate pixel noise through the projection Jacobian. The result is anisotropic (depth is worse than lateral), which is why Stage E whitens with a full 3×3 covariance. |
| Gate | Reject points whose reprojection error exceeds a threshold, to be set from Phase 2 calibration data. |
| Emit | `BallPosition3dObservation { positionM, covarianceM2, reprojectionErrorPx, detectionConfidence, cameraIds }` |

Illustrative stereo arithmetic (*calculated* with assumed parameters, not a design: range
Z = 2 m, baseline B = 0.5 m, focal length f = 1500 px, 0.3 px matching noise):
`σ_Z ≈ Z²·σ/(f·B) = 1.6 mm` in depth versus `σ_X ≈ Z·σ/f = 0.4 mm` laterally.

**What Stage E needs from Stage D.** Honest covariances: Stage E weights by them and inflates its
own covariance when residuals exceed them (§3.6). World-frame positions. Session-clock
timestamps. A covariance that is not symmetric positive definite makes Stage E reject that
point.

---

## 3. Stage E — multi-frame launch fit (IMPLEMENTED, TESTED on synthetic observations)

Code: `fitLaunchState` and `gravityOnlyTrajectoryModel` in `packages/launch-state/src/fit.ts`;
the sequence around it in `processShot` (`packages/shot-pipeline/src/process.ts`); the
drag- and lift-aware model `createAeroTrajectoryModel` in `packages/shot-pipeline/src/models.ts`.

### 3.1 Sequence in the shot pipeline (`processShot`)

1. **Trigger fusion.** Seed reference time = `min(fused trigger time, first ball observation)`.
   With no trigger it is the earliest observation.
2. **Gravity-only seed fit.** `p(t) = p0 + v0·t − ½·g·t²·Ẑ`, g from the environment profile.
3. **Spin resolution** with the seed velocity ([spin-measurement.md](spin-measurement.md)). If
   spin is unavailable, the refit uses ω = 0 and warns *"Launch fit assumed no Magnus lift
   because spin is unavailable."*
4. **Launch reference time.** The moment the seed's straight-line track `p0 + v0·t` passes
   closest to the address position: `t_ref = t_seed + (a − p0)·v0 / |v0|²`, clamped to be no
   later than the first ball observation. Without an address observation, or with
   `|v0|² ≤ 1e-6`, the seed's own reference time is kept. Gravity is ignored over this shift.
   The shift is normally small, because the seed reference time is already at or before the
   first frame.
5. **Drag- and lift-aware refit** at `t_ref` with the injected model `aero-rk4:<ballProfileId>`.
   It calls `propagatePositions` from `@glm/ballistics` (same forces as the flight simulator,
   [physics-model.md §6](physics-model.md#6-ground-free-propagation-for-estimators)) with
   RK4 at 0.5 ms and the **fixed** spin vector from step 3. Spin is not estimated by the fit.
6. **Result.** If the refit succeeds it is the final fit, and spin is re-resolved with the
   refit velocity (the spin-axis frame depends on it). If it fails, the seed fit is kept with
   the warning *"Drag-aware refit failed (…); using the gravity-only fit."*
7. **Launch state.** `buildLaunchState` labels position and velocity with the stream's source
   (`measured-camera`, … or `synthetic` / `manual`), attaches the fit covariance blocks as
   uncertainty, and records the final fit's reference time as `launchTimeS` (`t_ref`, or the
   seed's reference time after a failed refit). A failed fit yields an **invalid** state
   with every launch value `unavailable`; no number is fabricated.

**Why the refit exists** (*calculated*, noise-free synthetic positions at 1000 fps, frames at
1–20 ms after launch, truth generated with the same provisional physics):

| Fixture | True speed | Gravity-only fit | Bias | RMS residual of the biased fit |
|---|---|---|---|---|
| Driver, 167 mph | 74.656 m/s | 74.416 m/s | −0.24 m/s (−0.32 %) | 0.40 mm |
| 7-iron, 120 mph | 53.645 m/s | 53.491 m/s | −0.15 m/s (−0.29 %) | 0.31 mm |

Drag slows the ball during the capture window. A gravity-only fit therefore reads ball speed
low, and its residuals stay well below plausible per-point noise, so the bias is invisible in
the residuals. With the same spin vector, the aero refit recovers the truth to < 1e-5 m/s. That
agreement is **circular** (same physics generated and fitted the data). It shows the bias
mechanism, not real-world accuracy. Against real data the refit inherits the provisional
coefficients ([physics-model.md §8](physics-model.md#8-shipped-ball-profiles)) and any spin
error.

### 3.2 Estimation problem

- **Parameters:** θ = (p0, v0) at the reference time: six unknowns (m, m/s).
- **Trajectory model:** any `TrajectoryModel { id, predict(p0, v0, dtS[]) }`. It is injected, so
  `@glm/launch-state` does not depend on `@glm/ballistics`. The model id is recorded in
  `LaunchFitDiagnostics.model`.
- **Whitening:** for observation i with covariance Σᵢ = LᵢLᵢᵀ (Cholesky), the residual is
  `rᵢ = Lᵢ⁻¹ (model(θ; tᵢ − t_ref) − yᵢ)`. The cost is `χ² = Σ‖rᵢ‖²`. Each point's full 3×3
  covariance is used, not just its diagonal.
- **Jacobian:** central differences through the model, with steps 1e-6 m for position and
  1e-5 m/s for velocity, then whitened.

### 3.3 Input screening (before fitting)

Observations are sorted by time. Nothing throws for bad data; problems become flags, warnings
and `rejectedSequences`.

| Condition | Effect | Flag |
|---|---|---|
| Not an object, wrong `kind`, non-finite time or position | Dropped | `malformed-observations-rejected` |
| Earlier than the reference time | Excluded | `observations-before-reference-excluded` |
| Covariance not 3×3, not symmetric (relative 1e-9), or not positive definite | Dropped | `non-pd-covariance-rejected` |
| Fewer than 2 usable positions | **Failure** | `insufficient-observations` |
| Usable positions span no time | **Failure** | `zero-time-span` |

### 3.4 Solver

- **Initial guess:** a per-axis weighted polynomial (quadratic with ≥ 4 points, else linear;
  weights 1/variance from the covariance diagonal). The quadratic term absorbs gravity and drag
  curvature, so v0 starts close to the answer.
- **Levenberg–Marquardt** (damped Gauss–Newton with Marquardt diagonal scaling `H(1 + λ)`):
  λ starts at 1e-3. It is divided by 10 after an accepted step and multiplied by 10 after a
  rejected one, with up to 30 tries per iteration. The run is converged when no damped step
  lowers the cost, when the step is negligible, or when the cost decrease is ≤ 1e-9·max(1, χ²).
  At most `maxIterations` (default 50) iterations are run; otherwise the fit is flagged
  `fit-not-converged`.
- A model that throws or returns non-finite positions makes the fit fail with reason text; it
  does not throw.

### 3.5 Robust outlier rejection (≥ 5 usable positions)

Outliers are screened so that they cannot hide by dragging the fit toward themselves. The
classic failure mode is two bad frames at the end of a short track: they have the most leverage
on velocity and absorb most of their own residual.

1. **Least-trimmed-squares (LTS) start.** The fit is linearized at the all-data solution (exact
   for gravity-only; aero curvature is negligible at this step). Every pair of observations
   (2 × 3 equations = 6 unknowns) is solved exactly. Each pair is scored by the sum of the
   h smallest squared whitened norms, `h = ⌊(n + 3)/2⌋`. From the 10 best pairs, concentration
   steps (FAST-LTS style, at most 20) refit on the h best points until the subset is stable.
   The best objective wins. The procedure is deterministic and tolerates up to `n − h` outliers.
2. **Leverage-corrected residuals.** With whitened Jacobian block Jᵢ and
   `Mᵢ = Jᵢ (J_Sᵀ J_S)⁻¹ Jᵢᵀ` over the fit set S, an observation's standardized squared norm is
   `rᵢᵀ (I − Mᵢ)⁻¹ rᵢ` if it is in S and `rᵢᵀ (I + Mᵢ)⁻¹ rᵢ` if it is outside (a prediction).
   Under honest Gaussian noise both are χ²(3). Raw norms would be biased low for high-leverage
   members and high for excluded end-of-track points, which could then never be re-admitted.
3. **Robust noise scale.** `s = √(median(norm²) / 2.365974)` (median of χ²(3)), clamped to
   [1, 3]. It is estimated at the LTS solution, re-estimated once at the first least-squares fit
   on the LTS-screened set, and then frozen. `s > 1` means the reported covariances are
   optimistic for the whole track: the threshold then follows the actual scatter instead of
   discarding most of the data.
4. **Rule.** Reject observations whose standardized norm exceeds `4.0 · s`
   (`outlierThresholdSigma`, default 4.0). Refit. Run at most 3 rounds (the LTS-scored round
   counts) and never drop below `min(n, minObservations)` (default 3). Every round re-scores
   **all** candidates, so a good point excluded earlier can come back. Under honest noise,
   4.0 on a 3-D whitened norm rejects a good point with probability `P(χ²(3) > 16) ≈ 0.11 %`
   (*calculated*).
5. Rejections are reported as flag `outliers-rejected` plus a warning that names the sequence
   numbers and the effective threshold (for example "above 5.32 sigma (4 sigma x robust noise
   scale 1.33)").

With fewer than 5 usable positions, no outlier rejection runs.

### 3.6 Covariance

```
Cov(θ) = (Jᵀ J)⁻¹ · max(1, χ²/dof),     dof = 3·n_inliers − 6
```

The 6×6 order is (px, py, pz, vx, vy, vz). Inflating by χ²/dof keeps the covariance honest when
residuals exceed the reported noise. Above χ²/dof = 4 the fit adds flag
`position-noise-understated` and the warning *"Ball-position residuals exceed the reported noise
(chi^2/dof = …); launch uncertainty was inflated accordingly."* A singular normal matrix is a
failure (`fit-degenerate`). The position and velocity 3×3 blocks become
`LaunchFitDiagnostics.positionCovarianceM2` / `velocityCovarianceM2PerS2` and the
`uncertainty.covariance` of the launch measurements. Ball speed and launch angles get
first-order σ from them (`@glm/launch-state` `derive*`).

This covariance describes **random** position noise only. Correlated, systematic errors are not
in it: a calibration bias, a clock offset common to all frames, or a wrong trajectory model.

### 3.7 Few frames and the minimal two-frame fit

| Inliers | Behavior |
|---|---|
| 2 | Allowed. Six equations for six unknowns, so `dof = 0`: no residual check and no covariance inflation are possible. Flag `minimal-two-frame-fit`. `observationCountFactor` scores 0.35. |
| < `minObservations` (default 3) | Flag `below-min-observations` plus a warning. |
| < 6 | Warning *"Insufficient post-impact frames for high-confidence ball speed."* `observationCountFactor` scores 0.5 (3), 0.65 (4), 0.8 (5). |
| ≥ 6 | `observationCountFactor` scores 1. |

### 3.8 Outputs

`LaunchFitSuccess`: `positionM`, `velocityMps`, `covariance6`, `referenceTimeS`, `diagnostics`,
`inlierSequences`, `rejectedSequences` (malformed, early, non-PD and outliers), `qualityFlags`,
`warnings`, `chiSquare`, `degreesOfFreedom`, `covarianceScale`, `outlierNoiseScale`.

`LaunchFitDiagnostics` (stored on the `LaunchState`): `model`, `observationCount` (usable
positions after screening), `inlierCount`, `timeSpanS` (first to last inlier), `rmsResidualM` /
`maxResidualM` (unwhitened distances), `iterations`, `converged`, and the two covariance blocks.

`LaunchFitFailure`: `reason` (human-readable; it becomes a rejection reason on the invalid
launch state), `qualityFlags`, `warnings`. Invalid **options** throw: no trajectory model,
`minObservations < 2`, `outlierThresholdSigma ≤ 0`, a non-integer or non-positive
`maxIterations`, or a non-finite `referenceTimeS`.

### 3.9 How the fit feeds confidence

`fitQualityFactor` (weight 2) is the minimum of four ramps, halved if the fit did not converge:

- RMS residual (good ≤ 3 mm, poor ≥ 20 mm);
- velocity σ = √trace(Cov_v) (good ≤ 0.2 m/s, poor ≥ 1.5 m/s);
- inlier fraction (1 at ≥ 0.8, 0.7 at ≥ 0.6, else 0.4);
- χ²/dof (good ≤ 4, poor ≥ 9).

`observationCountFactor` has weight 1. Position and velocity confidence is the lower of the two
scores.

`aggregateConfidence` combines these with the calibration, trigger, ball-zone, sensor-health and
spin factors as a weighted geometric mean. Validity follows from it:

- **invalid:** any blocking factor, or an overall score below 0.35;
- **provisional:** an overall score below 0.7, spin not measured, or manual data;
- **valid:** otherwise.

All thresholds are **provisional** engineering choices, not fitted to reference data. The
confidences are policy scores, not probabilities. See
[spin-measurement.md §3](spin-measurement.md#3-effect-on-provenance-validity-and-confidence) for
how spin enters.

### 3.10 What is tested

`npx vitest run packages/launch-state` passed (6 files, 90 tests) and
`npx vitest run tests/integration` passed (2 files, 15 tests) on 2026-10-01. Test data are
synthetic. Positions in `fit.test.ts` are gravity-only tracks generated in the test with a
seeded RNG: 2 ms frame spacing and an anisotropic covariance per point (σ 1.5 / 2 / 4 mm along a
random rotation), with noise drawn from exactly that covariance.

| Behavior | Test (file) |
|---|---|
| Exact recovery from noise-free positions | `recovers the exact state from noise-free observations` (fit.test.ts) |
| Errors within the reported covariance on fixed seeds | `recovers truth from noisy gravity-only observations within 3 sigma …` |
| **Calibrated covariance**: 1-σ ball-speed coverage 0.68 ± 0.07 over 300 seeded trials; every parameter calibrated; ≤ 6 false rejections in 3000 points | `reports a CALIBRATED covariance …` |
| χ²/dof inflation with optimistic reported noise, no data discarded | `inflates the covariance by chi2/dof …` |
| Injected outliers rejected and truth recovered | `rejects injected outliers and still recovers the truth` |
| Two adjacent end-of-track outliers (masking) caught in ≥ 97 of 100 seeds | `rejects two adjacent outliers at the end of the track (masking) …` |
| Effective threshold reported in the warning | `reports the effective outlier threshold …` |
| No rejection below 5 points; never below `minObservations` | two tests |
| Two-frame minimal fit flagged; < 6 frames warns | two tests |
| Screening: early, non-PD, null covariance/position, null entries | three tests |
| Injected model used through `predict()` (toy linear-drag model with a closed form) | `uses the injected trajectory model …` |
| Failure instead of throw for a broken model; option validation | `returns a failure (not a throw) …` |
| End to end through the synthetic adapter and `processShot`: speed within 0.25 m/s, launch angles within 0.2°, outliers rejected, too few frames gives no numbers, an outside-zone ball is invalid | `tests/integration/pipeline.test.ts` |
| 1-σ ball-speed and launch-angle intervals cover the truth ≈ 68 % (80 seeds, 3-sd binomial band) | `tests/integration/uncertainty-calibration.test.ts` |

**Not directly tested:** the closest-approach reference time and the seed → refit sequence in
`processShot` are exercised only end to end. No test asserts `launchTimeS` from the pipeline or
the refit-failure fallback. The synthetic generator uses the same physics as the aero model, so
the end-to-end recovery numbers are **not** accuracy evidence.

### 3.11 Limitations

- **Synthetic only.** No real camera has produced a position. Nothing is VERIFIED.
- **Circular end-to-end checks.** Truth and fit share one physics model.
- **Spin is an input, not an output,** of the refit. An estimated or wrong spin biases the
  drag/lift correction. With unavailable spin, Magnus lift is assumed zero.
- **No clock-offset or sync estimation.** Timestamp error enters as unmodeled position error and
  can only show up through χ²/dof.
- **Independent-noise assumption.** Correlated errors (calibration bias, common clock offset)
  are not represented, so the covariance can understate systematic error.
- **Straight-line closest approach** for the reference time (gravity ignored over the shift from
  the seed reference time).
- **All thresholds provisional:** the outlier threshold of 4.0, the noise-scale cap of 3, the
  minimum observation counts, and the fit-quality ramps.

---

## Related documents

- [coordinate-system.md](coordinate-system.md): frames, signs, camera model, time
- [spin-measurement.md](spin-measurement.md): spin modes and the planned marked-ball method
- [physics-model.md](physics-model.md): forces used by the aero refit
- [sensor-specification.md](sensor-specification.md): adapter contract, camera targets, triggers, health
- [calibration-procedure.md](calibration-procedure.md): planned camera and world-frame calibration
- [architecture.md](architecture.md): package map and planned `services/vision`
- [limitations.md](limitations.md): everything this build cannot tell you
