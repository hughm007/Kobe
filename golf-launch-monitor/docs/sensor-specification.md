# Sensor specification

**Applies to:** coordinate system `glm-world-1.0`, schema `glm-schema-0.1.0`, replay format
`glm-replay-1`. Contract source: `packages/shared-types/src/sensor.ts`. Adapters:
`@glm/sensor-adapters`.

> **Status: no sensor hardware is supported.** The camera, radar and hybrid adapters are
> placeholders that throw `HardwareNotAvailableError` (which points to this document). Every
> observation the software has ever processed came from the synthetic, replay or developer
> manual-entry adapters. The hardware profile in §5 is a set of **engineering targets derived
> from kinematics**, not a tested design. Nothing here is VERIFIED.

Related: [coordinate-system.md](coordinate-system.md) (frames, signs, session clock; binding),
[calibration-procedure.md](calibration-procedure.md), [validation-protocol.md](validation-protocol.md),
[safety.md](safety.md) (mounting, shank zone, IR eye safety, flicker),
[limitations.md](limitations.md), [../datasets/README.md](../datasets/README.md) (replay format).

Status words: CREATED, IMPLEMENTED, TESTED (automated tests exist and pass), VERIFIED (checked
against independent real-world data), as defined in [product-requirements.md](product-requirements.md) §1.

## 1. Status

| Item | Status | Evidence / location |
|---|---|---|
| `SensorAdapter` contract, observation types, zod schemas, JSON Schemas | TESTED | `shared-types/test/schemas.test.ts`, `type-parity.test.ts` |
| `SyntheticSensorAdapter` + generator | TESTED | `sensor-adapters/test/synthetic-*.test.ts` |
| `ReplaySensorAdapter` + `glm-replay-1` reader/writer | TESTED | `sensor-adapters/test/replay.test.ts`, `tests/replay`, `tests/golden` |
| `ManualEntryAdapter` (developer testing only) | TESTED | `sensor-adapters/test/manual-and-hardware.test.ts` |
| `CameraLaunchMonitorAdapter`, `RadarLaunchMonitorAdapter`, `HybridFusionAdapter` | CREATED as placeholders; their refusal behavior is TESTED | `manual-and-hardware.test.ts` ("connect, startCapture and calibrate reject with HardwareNotAvailableError", "reports disconnected and never emits") |
| Shot segmentation with the frame-buffer window | TESTED end to end (one trigger per shot); multi-trigger clustering IMPLEMENTED only | `shot-pipeline/src/segmenter.ts`; `tests/integration/pipeline.test.ts` |
| Trigger fusion | IMPLEMENTED (single-trigger path exercised end to end; disagreement path has no test) | `shot-pipeline/src/triggers.ts` |
| Camera health metric ids (`CAMERA_HEALTH_METRIC_IDS`) | CREATED (ids only; nothing computes them) | `shared-types/src/sensor.ts` |
| Camera driver, capture service, hardware frame buffer, trigger hardware, 2D detection, stereo triangulation, image-based spin | Planned (Phase 2) — not implemented | [architecture.md](architecture.md) §9 |
| Radar and hybrid drivers | Planned (Phase 7) — not implemented | [product-requirements.md](product-requirements.md) C7 |

## 2. The `SensorAdapter` contract

Every source, real or simulated, implements one interface. The UI and the shot pipeline talk
only to it (`ShotPipeline` subscribes to `subscribeToObservations`), never to a device.

| Member | Contract |
|---|---|
| `id` | Sensor id; equals `getConfiguration().sensorId` and every observation's `sensorId`. |
| `capabilities` | What the source provides (§2.1). Frozen. |
| `connect()` / `disconnect()` | Open / release the device. `disconnect()` is safe from any state. |
| `startCapture()` / `stopCapture()` | Begin / end emitting observations. A sensor emits only while capturing. |
| `subscribeToObservations(cb)` | Returns an `Unsubscribe`. Delivers `RawSensorObservation`s in time order per sensor. |
| `getHealth()` | `SensorHealth` (§2.3). |
| `getConfiguration()` | `SensorConfiguration` (§2.4). Its `version` is stored on every shot (`LaunchState.sensorConfigurationVersion`). |
| `calibrate(input)` | `CalibrationInput` → `CalibrationResult` ([calibration-procedure.md](calibration-procedure.md)). |

**Invariants every adapter must keep** (enforced by schemas, the replay parser, or the pipeline
as noted):

1. **World frame, SI.** Positions in m, spin in rad/s, covariances in m² / (rad/s)², all in the
   `glm-world-1.0` frame. Nothing downstream of an adapter sees device coordinates
   ([coordinate-system.md](coordinate-system.md) §7).
2. **Session clock.** `timestampS` is seconds on the shared session clock (§9).
3. **Order.** Per sensor, `sequence` strictly increases and `timestampS` does not go backwards.
   The segmenter assumes time order; the replay parser warns (does not reorder) on violations.
4. **Honest provenance.** `capabilities.isHardware` is true only for physical devices.
   `SyntheticSensorAdapter` rejects a configuration whose `kind` is not `"synthetic"` or whose
   description lacks the word "synthetic". A `live`/`replay` file must describe a camera, radar
   or hybrid device and may not contain `synthetic`/`manual` triggers or `method: "synthetic"`
   spin (`replay-format.ts`). Values from synthetic or manual streams are never labeled
   `measured-*` (`measuredSourceFor` in `@glm/shot-pipeline`).
5. **No fabricated observations.** A quantity the device did not observe is not emitted. Missing
   spin means no `spin` observation, never a zero vector.
6. **Honest covariance.** Reported covariances drive the fit weighting, the confidence model and
   the Monte Carlo intervals; under-reporting noise makes every downstream interval too narrow.

**Lifecycle (software adapters, `AdapterLifecycle`).**

```
disconnected --connect()------> connected --startCapture()--> capturing
                                connected <--stopCapture()--- capturing
any state    --disconnect()---> disconnected   (stops a running capture first)
```

Invalid transitions throw `SensorStateError` (names the adapter, action and state). Calling
`emitNextShot()`, `startCapture()`, `reset()` or `submitManualLaunch()` from inside an
observation callback throws `ReentrantEmissionError`. A subscriber that throws is isolated
(`ObservationHub` records `lastError`; other subscribers still receive the observation).

### 2.1 Capabilities

| Field | Meaning |
|---|---|
| `kind` | `camera` \| `radar` \| `hybrid` \| `replay` \| `synthetic` \| `manual` |
| `isHardware` | True only for adapters backed by physical hardware |
| `dataOrigin` | `live` \| `replay` \| `synthetic` \| `manual` (stream-level provenance) |
| `observationKinds` | Kinds the adapter can emit (§2.2) |
| `measuresBallPosition3d`, `measuresSpin`, `measuresClubData`, `providesTrigger` | Declared abilities. `measuresClubData` is false everywhere (club data: Planned, Phase 4). |
| `requiresCalibration` | True for the hardware stubs; false for synthetic, replay, manual |
| `nominalFrameRateHz` | Nominal rate, or null when unknown (all hardware stubs) |

### 2.2 Observation kinds (`RawSensorObservation`)

Common fields: `sensorId`, `sequence` (integer ≥ 0, monotonic per sensor), `timestampS`.

| Kind | Key fields | Used by the pipeline today | Emitted today by |
|---|---|---|---|
| `trigger` | `triggerSource`, `confidence` ∈ [0, 1] | Opens a shot; fused (§7) | synthetic, manual |
| `ball-address` | `positionM`, `stationary`, `inHittingZone`, `ballCount`, `confidence` | Latest one in the pre-trigger window feeds `ballZoneFactor` (outside zone or >1 ball ⇒ blocking) and the launch reference time | synthetic, manual |
| `ball-detection-2d` | `cameraId`, `frameIndex`, `centerPx {u, v}`, `radiusPx`, `confidence` | Not read by `processShot` (kept in raw observations only) | nothing |
| `ball-position-3d` | `frameIndex`, `positionM`, `covarianceM2` (3×3), `reprojectionErrorPx \| null`, `detectionConfidence`, `cameraIds` | Input to the launch fit | synthetic, manual |
| `spin` | `method` (`marked-ball` \| `dimple-tracking` \| `radar-doppler` \| `synthetic`), `angularVelocityRadPerSec`, `covarianceRad2PerS2`, `validObservationCount`, `fitResidualRad`, `qualityFlags` | Spin MODE 1 if it passes the quality gate (§10) | synthetic, manual (as `method: "synthetic"`) |
| `health` | `health: SensorHealth` | Latest one before the shot closes feeds `sensorHealthFactor` | synthetic (metrics empty) |

### 2.3 Health

`SensorHealth = { sensorId, status, checkedUtc, metrics[], messages[], calibrationStatus }` with
`status` ∈ `ok | degraded | failed | disconnected` and each `HealthMetric =
{ id, label, value | null, unit, status: ok | warn | fail | unknown, detail }`.

How health affects a shot today (`sensorHealthFactor`, `@glm/launch-state`, weight 1, all
PROVISIONAL policy values):

| Condition | Factor score | Effect |
|---|---|---|
| No health observation before the shot | 0.6 | warning |
| `failed` or `disconnected` | 0 | **blocking** ⇒ launch `invalid` |
| `degraded` | ≤ 0.6 | warning |
| Worst metric status `ok` / `unknown` / `warn` / `fail` | 1 / 0.9 / 0.7 / 0.4 (minimum over metrics) | warn/fail details become warnings |
| `sync-drift` at `warn` / `fail` | capped at 0.6 / 0.4 | adds "Camera synchronization drift detected; launch direction may be unreliable." |

A `fail` metric alone is **not** blocking. Conditions that must stop measurement (e.g. a moved
camera) must also drive the calibration status to `red`, which is blocking for live and replay
data ([calibration-procedure.md](calibration-procedure.md) §11).

### 2.4 Configuration

`SensorConfiguration = { sensorId, version, kind, description, cameras[], triggerSources[],
frameBuffer, storeRawCaptures }`. `version` must change whenever anything that can change a
measurement changes (camera, lens, mount, settings, firmware, trigger hardware).

`CameraDeviceConfiguration = { cameraId, model, resolution {widthPx, heightPx}, frameRateHz,
exposureUs, shutter: global | rolling | unknown, syncMode: hardware | software | none, fixedFocus }`.

`FrameBufferConfiguration = { preTriggerS, postTriggerS }`; the default synthetic, manual and
placeholder configurations use 0.25 s / 0.5 s (§6); a replay uses the one in its header.
`storeRawCaptures` is the raw-frame retention consent; no adapter produces frames yet, so
`ShotRecord.rawCapturePaths` is always empty.

## 3. Adapters today

| Adapter | `kind` / `dataOrigin` / `isHardware` | What it does | Calibration |
|---|---|---|---|
| `SyntheticSensorAdapter` | synthetic / synthetic / false | Emits deterministic shots from `SyntheticShotSpec`s: health at launch − 0.5 s, ball-address at − 0.1 s, one trigger per configured source, one `ball-position-3d` per frame (truth from an **injected** propagator + configured noise, dropouts, outliers, timestamp jitter), and one `spin` observation if spin is observed. All randomness from `createRng(seed)`. Truth is available only through `getSyntheticTruth()` for validation tooling. | `calibrate()` → `{ record: null, status: "none" }` |
| `ReplaySensorAdapter` | replay / `live` relabeled `replay`; `synthetic`/`manual` keep their origin / false | Plays back a validated `glm-replay-1` file. Splits shots when a health/address/trigger observation is > 1 s after the current shot's last trigger. `emitNextShot()` steps one shot. | `calibrate()` returns the header's `CalibrationRecord` (cannot recalibrate) |
| `ManualEntryAdapter` | manual / manual / false | **Developer testing only.** `submitManualLaunch()` emits an address observation, a `manual` trigger, 10 noise-free positions at 1000 fps (covariance 1e-8 m²), and spin (if given) as `method: "synthetic"` with flag `manual-entry`; its count/residual fields are placeholders. See [limitations.md](limitations.md#sensors-and-data-sources) for the resulting SYNTHETIC spin badge. | `{ record: null, status: "none" }` |
| `CameraLaunchMonitorAdapter`, `RadarLaunchMonitorAdapter`, `HybridFusionAdapter` | camera / radar / hybrid, `live`, true | **Placeholders.** `connect()`, `startCapture()`, `calibrate()` reject with `HardwareNotAvailableError`; `disconnect()`/`stopCapture()` are no-ops; subscriptions are accepted but nothing is ever emitted; `getHealth()` is always `disconnected`; configuration version `placeholder-<kind>-0` with no cameras and no trigger sources. Capabilities describe the sensor *class* (e.g. `measuresSpin: true`), not a device; `nominalFrameRateHz` is null. | Throws |

The synthetic noise model (`DEFAULT_SYNTHETIC_NOISE`: 1000 fps, 20 frames, 1 mm per-axis
position σ, no jitter, no dropouts, ideal trigger, 6 rad/s per-axis spin σ) is a **test
setting**, not a description of any real sensor.

## 4. Requirements for a hardware driver

`HardwareNotAvailableError` says "see docs/sensor-specification.md for the requirements a driver
must meet". A driver replacing a stub is acceptable only when it satisfies all of the following.
Each item needs an automated test (with recorded data where hardware is involved) before the
driver is called TESTED.

1. Implements every `SensorAdapter` member with the invariants of §2; `capabilities` state only
   what the device actually measures.
2. Converts device coordinates to the world frame using the active `CalibrationRecord`; refuses
   to start capture (or reports calibration `none`/`red`) when no valid calibration matches the
   current device settings (`CameraIntrinsics.deviceConfigurationHash`).
3. Reports a **covariance for every position and spin observation** derived from the measured
   detection/triangulation noise, not a constant chosen to look good.
4. Timestamps every frame on the session clock (§9) and reports residual synchronization error
   as the `sync-drift` metric.
5. Emits `health` observations with the camera metrics of §8, at least before every shot.
6. Emits triggers (§7) with honest confidence; suppresses or flags non-impact events
   (§7, "screen-impact hazard").
7. Spin, if claimed, comes from observing this ball (`marked-ball`, `dimple-tracking` or
   `radar-doppler`), with `validObservationCount`, `fitResidualRad` and the blocking quality flags
   of §10 set truthfully.
8. Records sessions to `glm-replay-1` with `dataOrigin: "live"` and the full configuration and
   calibration in the header, so every shot can be re-processed and validated later.
9. Retains raw frames only when `storeRawCaptures` is true (consent), referenced from
   `ShotRecord.rawCapturePaths`.
10. Meets, or reports that it does not meet, the hardware targets of §5.

## 5. Recommended garage camera profile (engineering targets)

These are **targets derived from kinematics and from thresholds already in the code**, not
measured performance of any product. They must be confirmed on a real rig.

**Assumed design envelope** (sizing assumptions, not data): ball speed 25–85 m/s and spin
1,000–10,000 rpm (the applicable ranges of the shipped ball profiles,
[physics-model.md](physics-model.md) §8); vertical launch 0–45°; horizontal launch ±20°. Ball
diameter D = 42.67 mm (Rules of Golf minimum; secondary source).

### 5.1 Kinematics that drive the targets

Ball travel per frame, Δx = v / f:

| v | 500 fps | 1000 fps | 2000 fps | 4000 fps |
|---|---|---|---|---|
| 30 m/s (67 mph) | 6.0 cm | 3.0 cm | 1.5 cm | 0.75 cm |
| 75 m/s (168 mph) | 15.0 cm | **7.5 cm** (1.76 D) | 3.75 cm | 1.88 cm |
| 85 m/s (190 mph) | 17.0 cm | 8.5 cm (1.99 D) | 4.25 cm | 2.12 cm |

Example: 75 m/s ÷ 1000 frames/s = 0.075 m = 7.5 cm per frame.

Translational motion blur during one exposure, b = v · t_exp:

| v | 20 µs | 50 µs | 100 µs | 1 ms |
|---|---|---|---|---|
| 30 m/s | 0.60 mm | 1.50 mm | 3.0 mm | 30 mm |
| 75 m/s | 1.50 mm | **3.75 mm** (8.8 % of D) | 7.5 mm | 75 mm (1.76 D) |
| 85 m/s | 1.70 mm | 4.25 mm (10.0 % of D) | 8.5 mm | 85 mm |

Example: 75 m/s × 50 × 10⁻⁶ s = 3.75 × 10⁻³ m ≈ 3.8 mm. A 1 ms exposure smears the ball over
more than its own diameter.

Rotation per frame, θ = (rpm / 60) · 360° / f, and surface speed ω·r (r = 21.335 mm):

| Spin | ω | Surface speed | 1000 fps | 2000 fps | Rotation in a 50 µs exposure |
|---|---|---|---|---|---|
| 3,000 rpm | 314 rad/s | 6.7 m/s | 18°/frame | 9°/frame | 0.9° |
| 10,000 rpm | 1,047 rad/s | 22.3 m/s | 60°/frame | 30°/frame | 3.0° |
| 15,000 rpm (gate limit, §10) | 1,571 rad/s | 33.5 m/s | 90°/frame | 45°/frame | 4.5° |

A rotation of 180° or more between frames is ambiguous for a pattern with no symmetry; a pattern
with k-fold rotational symmetry is ambiguous at 180°/k. At 1000 fps, 180°/frame is 30,000 rpm.

### 5.2 Requirements

| ID | Requirement | Target | Derivation |
|---|---|---|---|
| S1 | Stereo cameras | **≥ 2** cameras with overlapping views of the address point and the first ≥ 0.5 m of flight | Triangulation needs ≥ 2 views per frame; `ball-position-3d` carries `cameraIds`. |
| S2 | Shutter | **Global** shutter (`shutter: "global"`) | A rolling shutter exposes rows at different times. If the ball spans 10 % of a frame read out in 1 ms, its top and bottom are exposed 0.1 ms apart: 75 m/s × 0.1 ms = 7.5 mm of shear (18 % of D). |
| S3 | Exposure | **≤ 50 µs**; ≤ 20 µs preferred for spin features | Blur ≤ 10 % of D at 85 m/s: t ≤ 0.10 × 42.67 mm / 85 m/s = 50 µs. At 20 µs the blur is 1.7 mm (4 % of D) at 85 m/s. |
| S4 | Frame rate | **≥ 1000 fps** | (a) Full observation-count score needs ≥ 6 post-impact positions (`observationCountFactor`); at 85 m/s six frames at 1000 fps span 6 × 8.5 cm = 51 cm. (b) At 15,000 rpm, 1000 fps gives 90°/frame, half the 180° ambiguity limit (the margin is a design choice). |
| S5 | Tracked path | **≥ 0.5 m** of the initial flight in both views; longer is better | Precision is set mainly by path length and frame count (§5.3). |
| S6 | Synchronization | Hardware-triggered exposures (`syncMode: "hardware"`); inter-camera exposure offset **≤ 10 µs** (target ≤ 1 µs) | Offset δt makes the two views see different ball positions: 85 m/s × 10 µs = 0.85 mm; × 1 µs = 0.085 mm. Software sync with ~1 ms jitter would give 85 mm. |
| S7 | Optics | Fixed focal length, **locked focus, aperture and zoom**; auto-exposure, auto-gain and auto-focus off | Intrinsics are valid only for the settings hashed into `deviceConfigurationHash`; any change invalidates calibration. The whole capture volume must be inside the depth of field (check with `focus-sharpness` at its near and far ends). |
| S8 | Resolution / scale | Ball ≥ ~40 px across over the capture volume (≈ 1 mm/px); per-frame 3D position noise **≤ 1 mm** (1σ per axis) | Example geometry (assumed): f = 1500 px, 1280 px wide (≈ 46° horizontal field of view, 1.28 m wide at 1.5 m) gives 1 mm/px and a 43 px ball at 1.5 m. Spin from markings or dimples needs more pixels on the ball; size it with the spin method (Phase 2). |
| S9 | Illumination | **IR strobe synchronized to the exposure**, or flicker-free continuous light; no visible strobes | Short exposures need intense light. Mains-powered lights can flicker at 100/120 Hz ([safety.md](safety.md) §9); at 1000 fps one flicker period spans 10 / 8.3 frames, i.e. the same order as the ball window, so brightness changes from frame to frame within one shot. Eye safety: [safety.md](safety.md) §8. |
| S10 | Mounting | Rigid mounts with a secondary tether for overhead devices; movement monitored (`camera-movement`) | 1 px of image shift at 1.5 m with f = 1500 px is 1 mm and 0.038°. A bumped camera silently biases direction. |
| S11 | Placement | Outside the swing arc and the shank zone, protected from rebounds; no tripods in the stance area | [safety.md](safety.md) §4–§6. The golfer and club must not occlude the ball at address or in the first frames of flight. |
| S12 | Interface and memory | Sustain W × H × bytes × fps per camera, or buffer on the camera | §6. |

**Stereo depth precision** (parallel-axis approximation, assumed numbers):
σ_depth ≈ Z² · σ_d / (f · B), σ_lateral ≈ Z · σ_u / f. With Z = 1.5 m, f = 1500 px,
baseline B = 0.5 m and 0.2 px disparity / centroid noise (an assumption to be measured):
σ_depth ≈ 2.25 × 0.2 / (1500 × 0.5) = 0.6 mm and σ_lateral ≈ 1.5 × 0.2 / 1500 = 0.2 mm.
Halving the baseline to 0.25 m doubles σ_depth (1.2 mm).

### 5.3 Precision budget: frames, path length and noise

For a straight-line fit through N equally spaced positions with per-axis noise σ_p, the
velocity standard error per axis is

```
σ_v = σ_p · sqrt(12 / (N (N² − 1))) / Δt        (Δt = 1/f)
    = σ_p · sqrt(12 (N − 1) / (N (N + 1))) / T  (T = (N − 1) Δt, the tracked time span)
σ_angle ≈ σ_v / v = σ_p · sqrt(12 (N − 1) / (N (N + 1))) / L   (L = v·T, tracked path length)
```

| σ_p = 1 mm, 1000 fps | N = 6 | N = 10 | N = 20 |
|---|---|---|---|
| σ_v per axis | 0.24 m/s | 0.11 m/s | 0.039 m/s |
| √3 · σ_v (the fit-quality metric √trace(Cov_v)) | 0.41 m/s | 0.19 m/s | 0.067 m/s |
| Launch-angle σ at 75 m/s | 0.18° | 0.084° | 0.030° |

The launch-fit quality ramp scores √trace(Cov_v) ≤ 0.2 m/s as good and ≥ 1.5 m/s as poor
(`FIT_QUALITY_THRESHOLDS`, provisional). With 1 mm noise at 1000 fps that needs about 10
frames. Doubling the frame rate over the **same** path (twice the frames) improves σ_angle by
only about √2; at a fixed frame count σ_angle falls in proportion to the path length L, and at
a fixed frame rate a longer path also adds frames.

| σ_angle (σ_p = 1 mm) | N = 6 | N = 10 | N = 20 |
|---|---|---|---|
| L = 0.3 m | 0.23° | 0.19° | 0.14° |
| L = 0.5 m | 0.14° | 0.11° | 0.084° |
| L = 0.8 m | 0.086° | 0.071° | 0.053° |

For scale: a 0.1° start-direction error is 150 m × tan 0.1° = 0.26 m off line after 150 m of
straight travel (geometry only, no curve). These are random-error figures; calibration
errors (scale, target line, vertical) add **biases** that averaging does not remove
([calibration-procedure.md](calibration-procedure.md) §9).

For comparison, the synthetic integration test ("recovers launch conditions from noisy
observations within tight tolerances") uses 20 frames at 1000 fps with 1 mm noise and asserts
errors below 0.25 m/s and 0.2°; that checks the estimator against its own physics, not a
camera.

## 6. Frame buffer: 0.25 s pre-trigger, 0.5 s post-trigger

**Implemented (TESTED end to end):** `ShotSegmenter` opens a shot on a trigger and collects every
observation in `[trigger − preTriggerS, trigger + postTriggerS]`. Before a trigger it keeps a
ring of observations no older than `preTriggerS`. The shot closes when an observation arrives
after the window, or on `flush()`. It requires `preTriggerS ≥ 0` and `postTriggerS > 0`.

**Planned (Phase 2) — not implemented:** a hardware ring buffer of raw frames with the same
window, from which detection runs after the trigger.

| Window | Why |
|---|---|
| 0.25 s before | Ball-at-address check: the latest `ball-address` observation at or before the first trigger feeds `ballZoneFactor` and the launch reference time. Trigger latency: a microphone 1–3 m from the ball hears impact 2.9–8.7 ms late (distance / 343 m/s). Phase 4 club data needs the downswing frames. |
| 0.5 s after | Flight to the screen: at 3 m it takes 40 ms at 75 m/s, 150 ms at 20 m/s, 300 ms at 10 m/s, so 0.5 s covers any ball faster than 3 m / 0.5 s = 6 m/s. Slower rolls (putting, Phase 6) need a different window. |

Memory and bandwidth, uncompressed 8-bit monochrome at 1000 fps:

| Region of interest | Per frame | Per camera | 0.75 s, 2 cameras |
|---|---|---|---|
| 1280 × 1024 | 1.31 MB | 1.31 GB/s | 1.97 GB |
| 640 × 480 | 0.31 MB | 0.31 GB/s | 0.46 GB |

Example: 1280 × 1024 px × 1 byte × 1000 fps × 0.75 s × 2 cameras = 1.97 × 10⁹ bytes. The capture
path must sustain this or crop to a region of interest; frames written to disk are governed by
`storeRawCaptures`.

## 7. Triggers and fusion

| `TriggerSource` | Physical principle | Latency to correct | Known false triggers | Status |
|---|---|---|---|---|
| `microphone` | Impact sound | distance / speed of sound (≈ 343 m/s at 20 °C): 1 m ≈ 2.9 ms | Other sounds, practice swings brushing the mat, **the ball hitting the screen** | Planned (Phase 2) |
| `beam-break` | Light barrier just ahead of the ball | gap / ball speed (e.g. 5 cm at 30 m/s ≈ 1.7 ms) | The club breaking the beam | Planned (Phase 2) |
| `ball-motion` | Ball leaves its address position in camera frames | up to one frame period | Ball nudged at address | Planned (Phase 2) |
| `club-proximity` | Club approaching the ball | fires **before** impact | Waggles, practice swings | Planned (Phase 2) |
| `synthetic`, `manual` | Software only | 0 | — | TESTED; forbidden in `live`/`replay` files |

**Fusion (`fuseTriggers`, IMPLEMENTED):** triggers within `TRIGGER_CLUSTER_WINDOW_S` = 50 ms of a
shot's first trigger are one impact. Each source's known latency
(`PipelineConfig.triggerLatencyS`) is subtracted, the corrected times are combined by their
median, confidence = 1 − Π(1 − cᵢ), and a spread above `TRIGGER_AGREEMENT_TOLERANCE_S` = 3 ms
halves the confidence and adds a warning. (3 ms is 22.5 cm of ball travel at 75 m/s.)

**Role in the pipeline.** The trigger opens the shot window, seeds the gravity-only fit's
reference time (`min(trigger, first position)`), and contributes `triggerFactor` (weight 0.5,
score 0.3 + 0.7·c; 0.5 with no trigger). The final launch reference time is where the fitted
trajectory passes closest to the verified address position, so trigger timing does not set the
launch values directly.

**Screen-impact hazard (observed in the current segmenter; no code change made).** A second
trigger from the ball striking the screen behaves as follows (checked by feeding
`ShotSegmenter` and `fuseTriggers` directly on 2026-10-01):

- within 50 ms of impact (e.g. 40 ms: 3 m at 75 m/s) it joins the shot: the median of two
  times is their mean (fused time 20 ms late), confidence is halved and a "disagree by 40.0 ms"
  warning appears;
- later than 50 ms (e.g. 100 ms) it closes the shot and opens a phantom shot containing no ball
  positions; `processShot` turns that into an extra `invalid` record ("No post-impact ball
  positions; launch state cannot be fitted.").

A driver must therefore not report screen or net impacts as `trigger` observations (or must
suppress triggers for a hold-off period after a shot). A segmentation hold-off is Planned —
not implemented.

## 8. Camera health metrics

The ids are fixed in `CAMERA_HEALTH_METRIC_IDS`. **Nothing computes them yet** (Planned,
Phase 2). Thresholds below are PROVISIONAL proposals with their arithmetic; they are not in
the code and must be tuned on a real rig.

| Id | Measures (unit) | Proposed warn / fail | Basis |
|---|---|---|---|
| `resolution` | Delivered vs configured image size (px) | — / any mismatch | Intrinsics are tied to resolution; mismatch also breaks the calibration hash. |
| `frame-rate` | Measured from frame timestamps (Hz) | < 99 % / < 95 % of configured | Fewer frames in the window (S4); dropped frames counted separately. |
| `exposure-blur` | v_max · t_exp at the top of the envelope (mm) | > 10 % / > 25 % of D (4.3 / 10.7 mm) | S3. |
| `dropped-frames` | Missing frames in the shot window (count) | any / fewer than 6 usable positions | 6 positions = full `observationCountFactor`; fewer than 2 is blocking in the fit. |
| `sync-drift` | Inter-camera exposure offset, and session-clock residual (µs) | > 10 µs / > 50 µs | 85 m/s × 10 µs = 0.85 mm; × 50 µs = 4.25 mm. Already wired: warn/fail adds the sync warning (§2.3). |
| `focus-sharpness` | Edge sharpness of fixed targets vs the value at calibration (ratio) | < 0.8 / < 0.5 | Focus drift moves centroids and widens detections. |
| `dynamic-range-clipping` | Fraction of ball pixels at 0 or full scale (%) | > 1 % / > 5 % | Clipped ball pixels lose marking/dimple contrast needed for spin. |
| `ball-zone-visibility` | Cameras that see the address point and first 0.5 m unobstructed (count) | < all / < 2 | Triangulation needs ≥ 2 views (S1). |
| `background-quality` | Ball-to-background contrast in the hitting zone (ratio) | to be set from data | Low contrast raises detection noise and false detections. |
| `lighting-flicker` | Peak-to-peak brightness modulation of a static region across frames (%) | > 5 % / > 20 % | S9; 100/120 Hz flicker changes brightness within one shot. |
| `camera-movement` | Shift of fixed reference features vs calibration (px) | > 0.5 px / > 1.5 px | 1 px ≈ 1 mm and 0.038° at 1.5 m with f = 1500 px. On fail the calibration must turn `red` ([calibration-procedure.md](calibration-procedure.md) §11). |
| `calibration-validity` | Calibration status, settings-hash match, age | `yellow` / `red` or hash mismatch | Mirrors `SensorHealth.calibrationStatus`. |

## 9. Time synchronization

Implemented contract: every observation carries `timestampS` on one **session clock**;
adapters convert device clocks to it ([coordinate-system.md](coordinate-system.md) §8). The
synthetic generator models clock error with `timestampJitterS` (true frame time ≠ reported time);
the replay parser warns on per-sensor timestamps that go backwards.

Requirements for drivers (Planned, Phase 2):

1. **Per-frame hardware timestamps** latched by the camera, not host arrival times. Proposed
   convention: the timestamp is the **mid-exposure** instant (the blurred ball's centroid
   corresponds to it). The contract does not state this yet.
2. **Clock mapping.** Fit offset and drift from each device clock to the session clock; report
   the residual as `sync-drift`. A frame-time error δt puts the ball v·δt off its true position
   along the path: 10 µs → 0.75 mm at 75 m/s.
3. **Inter-camera sync** by a shared hardware trigger (S6), verified each session.
4. **Trigger latencies** measured per source and configured in `triggerLatencyS`.
5. **Monotonic per sensor**; never reorder or invent timestamps to hide gaps.

## 10. Spin observations: what the estimator accepts

A `spin` observation is used as measured spin (MODE 1) only if it passes
`assessSpinObservation` (`SPIN_QUALITY_THRESHOLDS`, provisional, TESTED in `spin.test.ts`):
finite vector; positive-definite covariance; `validObservationCount` ≥ 4; `fitResidualRad`
≤ 0.06 rad (≈ 3.4°); spin-rate σ ≤ 15 % of max(|ω|, 100 rad/s); |ω| ≤ 15,000 rpm; none of the
blocking flags `occluded`, `aliasing-risk`, `ambiguous-rotation`, `insufficient-features`,
`motion-blur`. A driver must raise `aliasing-risk` when the rotation per frame approaches the
pattern's ambiguity limit (§5.1) and `motion-blur` when S3 is not met. Spin with
`method: "synthetic"` on a non-synthetic stream is relabeled synthetic, never measured.

## 11. Radar and hybrid adapters (Planned, Phase 7 — not implemented)

Expectations for any future driver (no device has been chosen):

- **Radar** emits `trigger`, `ball-position-3d` (world frame, with covariance) and, if it
  measures spin, `spin` with `method: "radar-doppler"`. Values are labeled `measured-radar`.
  The contract has **no** raw radar observation (range, radial velocity, angles); the driver
  must convert tracks to world-frame positions and propagate their covariance honestly.
- Indoors the flight before the screen is short (3 m at 75 m/s is 40 ms); a radar driver must
  report how many independent measurements support each value, so the fit and spin gate can
  score it.
- A radar needs a pose in the world frame. `CalibrationRecord` has only camera intrinsics and
  extrinsics; a radar pose has no field yet (open item).
- **Hybrid** fusion emits all kinds on one session clock, with camera and radar time-aligned to
  the S6/§9 standard; values are labeled `measured-hybrid`. A value derived from both device
  types becomes `measured-hybrid` through `combineSources`; it is never upgraded beyond its
  weakest input.

## 12. Open items

- No hardware has been selected, bought or tested; every target in §5 is unconfirmed.
- Contract gaps (no change made): timestamp convention (mid-exposure) is not stated in the
  contract; no per-frame exposure/gain metadata; no raw radar observation type; no radar pose
  in `CalibrationRecord`; `ball-detection-2d` is defined but unused by the pipeline.
- Screen-impact triggers (§7) need a driver-side rule or a segmentation hold-off.
