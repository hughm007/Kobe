# calibration/

This is a local store for calibration inputs and results: board images and one
`CalibrationRecord` per calibrated rig configuration. **Everything in this folder except this
README is git-ignored** (see `../../.gitignore`).

## Status

**Empty. Calibration is Planned (Phase 2) — not implemented.**

| Exists today | Does not exist |
|---|---|
| The `CalibrationRecord` contract (`@glm/shared-types`) and its JSON Schema, `packages/shared-types/schemas/calibration-record.schema.json` | A calibration solver: intrinsics, extrinsics, stereo, target line |
| `calibrationFactor` in `@glm/launch-state`, which turns a calibration status into a confidence factor | Board detection, image capture, a calibration wizard |
| `SensorAdapter.calibrate()` in the contract. Hardware stubs reject it with `HardwareNotAvailableError`; replay adapters report the calibration stored in the replay header. | Any calibration data |

## Planned format (from the contract)

A `CalibrationRecord`, stored as JSON, contains:

| Field | Content |
|---|---|
| `version` | Unique, immutable id. Every shot records the calibration it was measured with (`LaunchState.calibrationVersion`). Shots without one record `uncalibrated`. |
| `sensorConfigurationVersion`, `coordinateSystemVersion` | The rig configuration and coordinate convention it applies to. A replay header's calibration must match this build's coordinate system. |
| `pattern` | `charuco` or `checkerboard`: square count and size (m); marker size and dictionary for ChArUco |
| `intrinsics[]` | Per camera: pinhole focal lengths and principal point (px), skew, Brown–Conrady distortion (k1, k2, p1, p2, k3), and a hash of the locked device settings. A settings mismatch invalidates the calibration. |
| `extrinsics[]` | Per camera: world → camera rotation and translation, OpenCV camera frame ([../../docs/coordinate-system.md](../../docs/coordinate-system.md) §7) |
| `worldFrame` | Address point, target-line unit vector, ground plane, optional screen plane, tee height, method (alignment stick, laser, target marker, board on ground, manual) |
| `quality` | RMS reprojection error (px), per-camera board coverage and image count, stereo epipolar error, known-length relative error, target-line error (rad) |
| `status`, `statusReasons` | `green`, `yellow`, `red` or `none`, with reasons |
| `artifactPaths` | Local paths to retained images and reports (only with diagnostic consent) |

Acceptance thresholds for reprojection, epipolar and target-line errors are **not defined
yet**. They will be set with the Phase 2 calibration work.

## How calibration status affects shots (implemented)

`calibrationFactor` (`@glm/launch-state`, weight 1.5 in the confidence model):

| Status | Live or replayed sensor data | Synthetic or manual data |
|---|---|---|
| `green` | Score 1 | Score 1 |
| `yellow` | Score 0.6, with a warning to recalibrate | Score 0.6 |
| `red` | **Blocking**: the shot is invalid | Score 0.5; the data do not depend on calibration |
| `none` | **Blocking**: the shot is invalid | Score 1; no calibration is required |

## Privacy

Calibration images show the user's room or garage, and possibly people. That is why this
folder is git-ignored. Images are retained only with diagnostic consent (`artifactPaths`).
Nothing uploads them.
