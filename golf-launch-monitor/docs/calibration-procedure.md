# Calibration procedure

**Applies to:** coordinate system `glm-world-1.0` ([coordinate-system.md](coordinate-system.md)),
the `CalibrationRecord` contract in `packages/shared-types/src/calibration.ts`, and the camera
rig described in [sensor-specification.md](sensor-specification.md).

> **Status: Planned (Phase 2) — not implemented.** What exists is the **data model** (the
> `CalibrationRecord` contract, its zod schema and JSON Schema, the `green` / `yellow` / `red` /
> `none` status type) and **how a status affects a shot** (`calibrationFactor`, TESTED). There is
> no calibration wizard, no ChArUco or checkerboard detection, no intrinsic, stereo or
> world-frame solver, and no calibration data. Every numeric threshold below is a PROVISIONAL
> proposal with its arithmetic, not a tested or tuned value. Nothing here is VERIFIED.

Related: [sensor-specification.md](sensor-specification.md) (camera targets, health metrics),
[validation-protocol.md](validation-protocol.md), [safety.md](safety.md) (§6 mounting, §8
lasers and IR), [../datasets/calibration/README.md](../datasets/calibration/README.md) (storage).

## 1. Status

| Item | Status | Where |
|---|---|---|
| `CalibrationRecord`, `CameraIntrinsics`, `CameraExtrinsics`, `WorldFrameCalibration`, `CalibrationQualityReport`, `PerCameraQuality`, `CalibrationPatternSpec`, `CalibrationStatus` | TESTED (schemas, type parity, replay round trip "round-trips a replay with a calibration record") | `@glm/shared-types` |
| `SensorAdapter.calibrate(CalibrationInput) → CalibrationResult` | Contract CREATED; no adapter calibrates anything. The existing responses are TESTED: hardware stubs throw `HardwareNotAvailableError`; synthetic and manual return `{ record: null, status: "none" }`; replay returns the record stored in its header | `@glm/sensor-adapters` |
| `calibrationFactor(status, dataOrigin)` | TESTED ("calibrationFactor: red blocks live/replay; none is acceptable only for synthetic/manual") | `@glm/launch-state` |
| Replay header calibration must use `glm-world-1.0` | IMPLEMENTED (a mismatch is rejected; no test covers this branch) | `replay-format.ts` `validateHeader` |
| Code that computes a status from a quality report | Planned (Phase 2) — not implemented. No function evaluates the rules in §10. | — |
| Wizard, board detection, solvers, movement detection | Planned (Phase 2) — not implemented | [architecture.md](architecture.md) §9 (`services/calibration`) |
| Use of `worldFrame` by the physics | Not implemented. No code reads `worldFrame`; range sessions use `createFlatRangeTerrain` with its own `teeHeightM` option (default 0). | `@glm/shot-pipeline` `createRangePipelineConfig` |

The replay CLI (`npm run replay`) and the desktop UI process a replay with the calibration
stored in its header, so a live recording keeps the calibration it was captured with.

## 2. What a calibration produces and how it affects shots

A `CalibrationRecord` (JSON, one per calibrated rig configuration):

| Field | Content |
|---|---|
| `version` | Unique, immutable id. Each shot stores it as `LaunchState.calibrationVersion` (`"uncalibrated"` when there is none). |
| `sensorConfigurationVersion`, `coordinateSystemVersion` | The rig configuration and coordinate convention it is valid for. |
| `pattern` | `charuco` \| `checkerboard`, `squaresX`, `squaresY` (> 1), `squareSizeM`, `markerSizeM` and `dictionary` (ChArUco only). |
| `intrinsics[]` | Per camera: `fxPx`, `fyPx`, `cxPx`, `cyPx`, `skew`, Brown–Conrady `k1 k2 p1 p2 k3`, `imageSize`, `deviceConfigurationHash` (§3). |
| `extrinsics[]` | Per camera: `rotationWorldToCamera` (3×3, row-major), `translationM`; `p_cam = R·p_world + t`, OpenCV camera axes ([coordinate-system.md](coordinate-system.md) §7). |
| `worldFrame` | `addressPointM`, `targetLineUnit`, `groundPlane {normal, offsetM}`, `screenPlane \| null`, `teeHeightM`, `method` (`alignment-stick` \| `laser` \| `target-marker` \| `board-on-ground` \| `manual`). |
| `quality` | §10. |
| `status`, `statusReasons` | `green` \| `yellow` \| `red` \| `none`, with one reason per non-green check. |
| `artifactPaths` | Retained images and reports, only with diagnostic consent (§12). |

**Effect on a shot (implemented).** `calibrationFactor` has weight 1.5 in the confidence model:

| Status | Live or replayed sensor data | Synthetic or manual data |
|---|---|---|
| `green` | score 1 ("Calibration verified (green).") | score 1 |
| `yellow` | score 0.6, warning "Calibration is marginal (yellow); recalibration recommended." | score 0.6 |
| `red` | **blocking** ⇒ `invalid`: "Calibration failed (red); recalibrate before measuring shots." | score 0.5 |
| `none` | **blocking** ⇒ `invalid`: "No calibration; measured shots cannot be trusted without one." | score 1 |

## 3. Before calibrating

1. **Final rig.** Cameras, lights and mounts are in their shot-taking positions and rigidly
   fixed, with tethers on overhead devices ([safety.md](safety.md) §6). Anything that moves
   after calibration invalidates it.
2. **Locked settings.** Resolution, region of interest, binning, frame rate, exposure, gain,
   focus, aperture and zoom are fixed; auto-exposure, auto-gain, auto-focus and auto white
   balance are off. The calibration is valid only for these settings. Proposal: compute
   `deviceConfigurationHash` as a SHA-256 of a canonical JSON of the locked settings plus the
   camera serial and firmware (the contract says only "hash"; the algorithm is not specified).
3. **Shot lighting.** Calibrate under the illumination used for shots (e.g. the IR strobe).
   Assumption to check on the real rig: focus, and therefore intrinsics, can differ between
   visible and IR light.
4. **Warm-up.** Run cameras and lights at operating temperature before capturing. Assumption:
   thermal drift can move focus and the principal point; its size on the chosen hardware is
   unknown and should be measured once by repeating the intrinsic calibration cold and warm.
5. **Sensor configuration version** is fixed and recorded in the record.
6. **Nobody in frame.** Calibration images may be retained (§12); keep people out of view.

## 4. Calibration board

- **ChArUco preferred.** Each chessboard corner is identified by its neighboring ArUco
  markers, so a board that is only partly in view still yields labeled corners. That is what
  makes it practical to cover the image corners, where lens distortion is largest. A plain
  checkerboard is allowed (`type: "checkerboard"`) but must be fully visible in every image.
- **Pattern spec** is recorded exactly: `squaresX`, `squaresY`, `squareSizeM`, and for ChArUco
  `markerSizeM` and `dictionary` (e.g. `"DICT_5X5_100"`).
- **Measure, do not trust the print.** Printers rescale. Measure across many squares with a
  steel rule and record the measured size: if 10 squares measure 299.4 mm, `squareSizeM` =
  0.02994. A scale error here passes 1:1 into every distance and into ball speed (§9).
- **Flat, rigid, matte.** Mount on a rigid flat backing; a matte surface avoids strobe glare.
- **Size (proposal).** Squares at least ~15 px wide at the farthest pose; a board large enough
  to fill much of the view at the capture distance for intrinsics, and to be seen by both
  cameras at once for stereo.

## 5. Step 1 — intrinsics, per camera

1. Capture **≥ 20 sharp views** (provisional) per camera:
   - covering the whole image, including the corners and edges;
   - at several distances spanning the capture volume (address point and first ≥ 0.5 m of
     flight, [sensor-specification.md](sensor-specification.md) §5);
   - with the board tilted about both of its axes (proposal: 20–45°); fronto-parallel views
     alone do not separate focal length from distance.
   With a ≤ 50 µs strobe-lit exposure, hand-held board motion is negligible: 0.5 m/s × 50 µs =
   25 µm.
2. Detect corners with sub-pixel refinement. (No detector exists; a vision library has not been
   chosen. The camera conventions already follow OpenCV.)
3. Solve the pinhole model with Brown–Conrady distortion (`k1 k2 p1 p2 k3`); fix `skew` = 0
   unless the data require it.
4. Reject views whose own RMS reprojection error exceeds 2× the median (provisional) and
   re-solve.
5. **Held-out view check (proposal).** Solve on 80 % of the views and report the reprojection
   error on the other 20 %; a held-out error above 1.5× the fitted RMS suggests over-fitted
   distortion terms or a non-flat board.
6. Record per camera: `rmsReprojectionErrorPx`, `imageCount` (accepted views), and
   `boardCoverageScore` ∈ [0, 1]. Proposed definition: split the image into an 8 × 6 grid; the
   score is the fraction of cells containing at least one detected corner across all accepted
   views.

## 6. Step 2 — extrinsics and stereo

1. Capture **≥ 15 hardware-synchronized view pairs** (provisional) with the board visible to
   both cameras, spread through the shared capture volume.
2. Solve the relative pose with intrinsics fixed.
3. Record `stereoEpipolarErrorPx`: the mean distance (px) of corresponding corners from their
   epipolar lines (null for a single camera).
4. Triangulate the board corners and compare the square spacing with `squareSizeM` (a first
   scale check; the independent one is §8).
5. Express each camera pose in the world frame (§7) as `rotationWorldToCamera` and
   `translationM`.

## 7. Step 3 — world frame

The world frame is fixed by [coordinate-system.md](coordinate-system.md) §1: origin at the ball
**center** at address, +X along the target line, +Y to the golfer's left, +Z up (opposite to
gravity). The ground is not assumed flat or level.

1. **Vertical (+Z).** From a reference whose level is verified (a bar or the board checked with
   a spirit level or digital inclinometer) or from a device accelerometer. Using the mat normal
   as vertical is an **assumption** that must be recorded (it caps the status at yellow, §10);
   garage floors are not necessarily level.
2. **Ground plane.** A board laid flat on the hitting mat, or triangulated mat points; store
   as `groundPlane` in the world frame. If the floor slopes, its normal differs from +Z: record
   it, do not force it.
3. **Address point.** Triangulate the center of a ball placed on the address spot (needs the
   Phase 2 ball detector). This defines the origin; `addressPointM` is then (0, 0, 0).
   Consistency check: the center's height above `groundPlane` should equal r + `teeHeightM`.
4. **Tee height.** `teeHeightM` = height of the bottom of the ball above the mat (0 for mat
   shots), measured with a rule or from step 3. The flat-range terrain puts the ground at
   z = −(r + tee). The calibrated value applies to every shot until changed; per-shot tee
   height is not modeled.
5. **Target line** (`method`):

   | Method | Procedure |
   |---|---|
   | `alignment-stick` | A straight stick on the mat pointing at the target, with two high-contrast marks ≥ 1 m apart; triangulate both marks. |
   | `laser` | A laser line or dot from the address area to the target; triangulate two points on the beam. Use only a laser whose class permits it; never at eye level ([safety.md](safety.md) §8). |
   | `target-marker` | A marker at the target (e.g. screen center); the line runs from the address point to it. |
   | `board-on-ground` | The ground board's x-axis aligned to the target; the alignment itself still needs a stick or laser. |
   | `manual` | The user enters the direction. No physical measurement: yellow at best (§10). |

   Then +X = target direction projected onto the horizontal plane (perpendicular to +Z),
   +Y = Ẑ × X̂ (left), and check X̂ × Ŷ = Ẑ. This is the rule of
   [coordinate-system.md §1](coordinate-system.md#1-world-frame): +Z is defined by gravity, the
   target line is the horizontal projection of the surveyed direction, and a tilted floor is
   described separately by `groundPlane`. On a level floor the projection lies in the ground
   plane; on a sloped floor it does not, and that is intended.
6. **Target-line verification.** Measure the line a second, independent way (another method,
   or tape-measured points on the line) and record the angle between the two as
   `targetLineErrorRad` (null if not verified). Example uncertainty: marks 1.2 m apart, each
   located to ±2 mm across the line: σ ≈ √2 × 2 mm / 1.2 m = 2.4 mrad = 0.135°.
7. **Screen plane** (optional): triangulated screen markers, stored as `screenPlane`. No code
   uses it yet.

## 8. Step 4 — known-length verification

1. Use a rigid bar with two marks whose separation is measured with a steel rule or caliper,
   **not** used in the solve, with a length comparable to the tracked path (0.5–1 m).
2. Triangulate it at several poses: along the target line, across it, diagonal, near and far.
3. Record the worst signed `knownLengthRelativeError` = (L_measured − L_true) / L_true (null if
   not done).
4. A golf ball's diameter is a weak check only: 0.1 mm of diameter error is already 0.23 %.

This check is also the quick **re-verification** before a session (§11).

## 9. How calibration errors bias launch values

Random noise averages out over shots; these errors do **not**. They show up as bias in
validation ([validation-protocol.md](validation-protocol.md) §6).

| Calibration error | Effect on launch values | Example |
|---|---|---|
| Scale error s (board size, stereo baseline) | Ball speed and all distances × (1 + s) | s = 0.5 % ⇒ 0.375 m/s at 75 m/s (0.84 mph) |
| Target-line error ε | Horizontal launch offset by ε; start-line offset D·tan ε at distance D | ε = 0.25° ⇒ 0.65 m at 150 m; 0.1° ⇒ 0.26 m |
| Vertical error δ, tilted toward / away from the target | Vertical launch offset by δ | δ = 0.5° ⇒ 0.5° |
| Vertical error δ, tilted sideways | Horizontal launch offset ≈ δ·tan θ_v | δ = 1°, θ_v = 15° ⇒ 0.27° |
| Camera moved by p px (Z = 1.5 m, f = 1500 px) | Position error ≈ p mm and direction error ≈ 0.038°·p near the address point | p = 1 ⇒ 1 mm, 0.038° |

## 10. Quality metrics and the green / yellow / red rules (PROVISIONAL)

Recorded in `CalibrationQualityReport`: `rmsReprojectionErrorPx`, `perCamera[]`
(`rmsReprojectionErrorPx`, `boardCoverageScore`, `imageCount`), `stereoEpipolarErrorPx`,
`knownLengthRelativeError`, `targetLineErrorRad`, `evaluatedUtc`.

**Proposed rules — not implemented, not tuned, no external source.** Status = `red` if any check
is red; else `yellow` if any check is yellow; else `green`. `none` = no record.

| Check | Green | Yellow | Red | Basis |
|---|---|---|---|---|
| RMS reprojection error, each camera | ≤ 0.3 px | ≤ 0.6 px | > 0.6 px | Judgment; compatible with the 0.2 px detection noise assumed in [sensor-specification.md](sensor-specification.md) §5 |
| Board coverage, each camera | ≥ 0.7 | ≥ 0.5 | < 0.5 | Uncovered image regions leave distortion unconstrained |
| Accepted views, each camera | ≥ 20 | ≥ 12 | < 12 | Judgment |
| Stereo epipolar error | ≤ 0.3 px | ≤ 0.6 px | > 0.6 px | Judgment |
| \|Known-length error\| | ≤ 0.2 % | ≤ 0.5 %, or not measured | > 0.5 % | 0.2 % ⇒ 0.15 m/s and 0.5 % ⇒ 0.375 m/s at 75 m/s (§9) |
| Target-line error | ≤ 0.1° | ≤ 0.25°, not verified, or `method: "manual"` | > 0.25° | 0.1° ⇒ 0.26 m, 0.25° ⇒ 0.65 m at 150 m |
| Vertical reference | Verified level reference | Assumed from the mat normal | — | §7 step 1 |
| World frame present | Yes | — | Missing | Without it there is no target line |
| `deviceConfigurationHash` matches the running cameras | Yes | — | No | Intrinsics belong to the locked settings |
| `coordinateSystemVersion` | `glm-world-1.0` | — | Anything else | Already rejected in replay headers (§1) |
| `camera-movement` health metric | ok | warn (> 0.5 px) | fail (> 1.5 px) | [sensor-specification.md](sensor-specification.md) §8 |
| Age since last verification | < 30 days | ≥ 30 days | — | Prompts the §8 re-check |

Each non-green check adds one `statusReasons` line naming the value and the limit, e.g.
"Known-length error 0.42 % exceeds the green limit 0.2 % (yellow limit 0.5 %)". The thresholds
must be re-set from the first real rigs, using only data that is not later used to report
accuracy ([validation-protocol.md](validation-protocol.md) §4).

## 11. Movement detection, expiry and recalibration (Planned, Phase 2)

**Movement detection (proposal).** Fix small ArUco markers to the floor and wall in each
camera's view, outside the swing and ball areas. Record their image positions at calibration.
Re-detect them at session start and periodically from pre-trigger frames, and report the
largest shift as the `camera-movement` health metric: warn above 0.5 px, fail above 1.5 px.
On fail, the calibration status becomes `red` (blocking); on warn, `yellow`.

**Expiry.** `CalibrationRecord` has no expiry field. Proposal: compute age from `createdUtc` (§10).
Records are immutable, so a successful re-verification (§8) is saved as a **new** record version
with the same intrinsics and extrinsics and a new quality report.

**Recalibrate when:**

- a camera, lens, mount or light is moved, bumped or struck by a ball;
- focus, aperture, zoom, resolution, region of interest, binning, frame rate or exposure changes,
  or camera firmware changes (the settings hash no longer matches);
- the sensor configuration version changes;
- the mat or the target moves (world frame only);
- `camera-movement` fails, or the §8 known-length check leaves the green band;
- launch-fit residuals or `sync-drift` trend upward across sessions on the same rig;
- the age limit is reached.

## 12. Retained artifacts and consent

- **Default (no consent):** keep only the `CalibrationRecord` (numbers, no images);
  `artifactPaths` is empty.
- **With diagnostic consent:** keep board images, per-view detections and the solver report under
  `datasets/calibration/` (git-ignored) and list them in `artifactPaths`. This allows re-solving
  with a better solver later.
- Calibration images show the user's room and possibly people. Nothing is uploaded. Deleting
  the artifacts must not delete the record that shots reference.

## 13. Wizard flow and API (Planned, Phase 2)

`calibrate({ kind: "intrinsic" | "extrinsic" | "world-frame" | "full", pattern, imagePaths,
knownLengthM | null })` returns `{ record | null, status, messages }`.

Proposed wizard steps: (1) safety and rig check; (2) lock and hash settings; (3) intrinsic capture
with a live coverage map; (4) stereo capture; (5) vertical, ground, address, tee height and
target line; (6) known-length check; (7) review the quality report, status and reasons; (8) save
an immutable record and choose artifact retention. Until then the desktop UI's Calibration
screen shows the status ("No calibration: synthetic/replay mode", or the calibration recorded in
a replay file), the meaning of green / yellow / red / none, what Phase 2 calibration will
require, and the wizard buttons disabled with the reason (TESTED: "calibration shows the Phase 1
status and disabled wizard with an explanation").

## 14. Open items

- No solver, detector, wizard or calibration data exist.
- Every threshold in §5, §6, §10 and §11 is a proposal.
- The contract comment on `WorldFrameCalibration.targetLineUnit` still says "in the ground
  plane"; [coordinate-system.md §1](coordinate-system.md#1-world-frame) (binding) defines it as
  the horizontal projection. The two agree only on a level floor (§7 step 5).
- How "up" is measured on the rig is undecided (§7 step 1).
- `deviceConfigurationHash` has no specified algorithm (§3).
- Per-shot tee height is not modeled; `worldFrame` is not read by any code yet.
- Radar or hybrid devices have no pose field in `CalibrationRecord`.
