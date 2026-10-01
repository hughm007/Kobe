# Spin: representation, resolution modes, and the planned measurement method

**Document date:** 2026-10-01. **Applies to:** estimator `glm-launch-fit-0.1.0`
(`ESTIMATOR_VERSION`, `@glm/launch-state`), coordinate system `glm-world-1.0`.
Status words are defined in [product-requirements.md §1](product-requirements.md#1-status-vocabulary).

> **Status in one paragraph.** Spin **resolution**, the choice of where a shot's spin comes from
> (`resolveSpin` in `packages/launch-state/src/spin.ts`), is **IMPLEMENTED and TESTED**. Spin
> **measurement** from camera images is **Planned (Phase 3) — not implemented**
> (§4). [product-requirements.md §9](product-requirements.md#9-phase-plan) and
> [sensor-specification.md](sensor-specification.md) currently list image-based spin under
> Phase 2 instead; the phase numbering has to be reconciled. In this build, every spin value is
> one of:
> - synthetic;
> - developer-typed (labeled synthetic);
> - estimated from a player or club model;
> - a user-allowed generic assumption;
> - unavailable.
>
> Nothing is **VERIFIED** against real measurements.

---

## 1. Representation

| Quantity | Definition | Where |
|---|---|---|
| **ω** (authoritative) | 3D angular-velocity vector, rad/s, world frame, right-hand rule. Stored as `LaunchState.angularVelocityRadPerSec: Measurement<Vec3>`, with a 3×3 covariance in (rad/s)² when known. | [coordinate-system.md §4.1](coordinate-system.md#41-authoritative-representation) |
| Total spin | `totalSpinRpm = ‖ω‖·60/(2π)`. Derived, stored with provenance. | `deriveTotalSpinRpm` |
| Spin-axis tilt α | `atan2(−ω·û, ω·r̂)` in the launch-direction frame {d̂, r̂, û}. **Positive = curves right.** Derived and stored. | [§4.3](coordinate-system.md#43-launch-direction-frame-and-spin-axis-tilt), `deriveSpinAxisTiltDeg` |
| Rifle spin | `ω·d̂`, spin about the flight direction. It produces no Magnus force ([physics-model.md §2](physics-model.md#2-forces)). | `spinComponentsRpm` (not stored) |
| Backspin / sidespin | **Display only**, never stored: `total·cos α` and `total·sin α` (sidespin positive = curves right, shown with an L/R label). | `@glm/presentation` |

Pure backspin for a ball moving along +X is ω ∥ −Y. Physics and estimation read only the SI
vectors; the degree/rpm scalars are a documented contract exception
([coordinate-system.md §2](coordinate-system.md#2-units)).

**When a derived value is `unavailable` (never a number):**

| Condition | Flag |
|---|---|
| Launch velocity ≈ 0 or vertical (the frame {d̂, r̂, û} is undefined) | `spin-axis-undefined-zero-velocity` / `…-vertical-velocity` |
| No spin perpendicular to v | `spin-axis-undefined-no-perpendicular-spin` |
| Perpendicular spin < 3 σ of its own noise (`SPIN_AXIS_MIN_SIGNAL_TO_NOISE`), e.g. a measured ~0 rpm knuckleball | `spin-axis-undefined-spin-below-noise` |
| Backspin or sidespin display when either total spin or tilt is unavailable | display shows "—" |

**Notes**

- Uncertainty of total spin and tilt is propagated to first order from the ω covariance (and
  the velocity covariance, for tilt). Tests check it against Monte Carlo within 10 %.
- **Near zero, |ω| is biased upward.** The norm of a noisy zero vector follows a χ distribution
  with 3 degrees of freedom. With the default synthetic noise (6 rad/s per axis) its mean is
  ≈ 91 rpm (*calculated*: σ·2√(2/π)).
- **Display components with rifle spin.** `total·cos α` and `total·sin α` follow
  coordinate-system.md §4.3 and are exact when rifle spin is zero. When ω has a rifle
  component, they overstate the true components by `|ω|/|ω⊥|`. `spinComponentsRpm` computes
  the exact projections but is not used by the display. Club-prior and generic-fallback spin
  has no rifle component.

---

## 2. Resolution order (`resolveSpin`)

```
spin observations of this shot ──► MODE 1 measured (quality gate)
        │ none passes
        ▼
launch velocity available and not vertical? ── no ──► unavailable
        │ yes
        ▼
club category known? ── yes ──► MODE 2a player history (≥ 5 matching measured shots)
        │                          │ too few
        │                          ▼
        │                       MODE 2b club prior (none for putter)
        │ no / no prior
        ▼
allowGenericFallback? ── yes ──► MODE 3 generic assumption
        │ no
        ▼
   unavailable
```

`SpinMode` on the launch state: `measured` | `estimated` (2a and 2b) |
`assumed-generic-fallback` | `unavailable`. Every rejected spin observation produces a warning
naming its sequence number and reasons ("…Spin is not reported as measured."). A failed gate
**never** yields measured spin.

### 2.1 MODE 1 — measured (`SpinObservation` passes the quality gate)

Quality gate (`SPIN_QUALITY_THRESHOLDS`, **provisional**, to be tuned on reference data):

| Check | Threshold |
|---|---|
| ω finite; covariance 3×3, finite, positive definite | required |
| `validObservationCount` (orientation estimates in the rotation fit) | ≥ 4 |
| `fitResidualRad` (RMS rotational-fit residual) | ≤ 0.06 rad (≈ 3.4°) |
| Relative σ: `σ(‖ω‖) / max(‖ω‖, 100 rad/s)` | ≤ 15 %. The 100 rad/s (≈ 955 rpm) floor keeps genuine low-spin shots measurable. |
| Magnitude | ≤ 15,000 rpm |
| Blocking quality flags | `occluded`, `aliasing-risk`, `ambiguous-rotation`, `insufficient-features`, `motion-blur` |

Behavior:

- **Selection.** If several observations pass, the best is chosen by smallest covariance trace,
  then smallest residual, then most observations, then sequence.
- **Confidence.** Let `q = 1 − max(relσ/0.15, residual/0.06)`, with q = 0 at the gate limits.
  Confidence is `0.95·(1 − 0.4·(1 − q))`, from 0.57 to 0.95. The spin factor scores `0.8 + 0.2·q`.
- **Label.** The stream's measured label (`measured-camera`, …). A `method: "synthetic"`
  observation is **always** relabeled `synthetic`, with a warning when the stream claimed
  otherwise.
- Total spin and tilt are derived from the selected ω (and the launch velocity, for tilt).

Where MODE-1 observations come from today:

| Source | Method | Notes |
|---|---|---|
| Synthetic generator | `synthetic` | Default noise 6 rad/s per axis, 20 orientations, 0.01 rad residual. These are test settings. |
| Developer manual entry | `synthetic` | Flag `manual-entry`. The quality fields are placeholders: count 10, residual 0. |
| Replay files | as recorded | A replay can *claim* camera data. Its provenance is only as good as its author ([limitations.md](limitations.md)). |
| Camera | `marked-ball` | Planned (Phase 3) — not implemented (§4) |

`spinMode: "measured"` therefore means "came through the MODE-1 observation path". The
provenance badge (`synthetic`, `measured-camera`, …) says what it really is.

### 2.2 MODE 2a — estimated from the player's history

| Rule | Value |
|---|---|
| Entries used | Same club category; source in `measured-camera` / `measured-radar` / `measured-hybrid` only; finite values; spin ≥ 0; ball speed within ±15 % of this shot's |
| Minimum entries | 5 (`PLAYER_HISTORY_MIN_ENTRIES`). With 1–4 a warning says how many were found. |
| Rate | median; `σ = max(1.4826·MAD, 10 % of median)` |
| Tilt | median; `σ = max(1.4826·MAD, 10 % of abs(median), 2°)` |
| Vector | `ω = rate·(cos α r̂ − sin α û)` oriented by this shot's velocity; covariance `σ_S²(j_S j_Sᵀ + d̂d̂ᵀ) + σ_α² j_α j_αᵀ`. The d̂d̂ᵀ term gives rifle spin the rate variance, which keeps the matrix positive definite. |
| Label / confidence | `estimated-player-model`; rate and tilt 0.5; vector `min(0.5, velocity confidence)`; spin factor 0.55 |
| Warning | "Spin estimated from player profile; shot-shape accuracy reduced." |

**Unreachable in Phase 1.** No measured shots exist, and range sessions pass an empty history.

### 2.3 MODE 2b — estimated from a club prior (`CLUB_SPIN_PRIORS`)

| Category | Prior (rpm) | Basis (TrackMan PGA Tour averages) |
|---|---|---|
| driver | 2,686 | driver |
| fairway-wood | 3,655 | 3-wood |
| hybrid | 4,437 | hybrid |
| long-iron | 4,733 | mean of 3- and 4-iron (4,630, 4,836) |
| mid-iron | 6,229.7 | mean of 5-, 6- and 7-iron (5,361, 6,231, 7,097) |
| short-iron | 8,322.5 | mean of 8- and 9-iron (7,998, 8,647) |
| wedge | 9,304 | pitching wedge (the only wedge in the table) |
| putter | none | A putt has no meaningful launch-spin prior, so the result is unavailable. |

| Rule | Value |
|---|---|
| Relative σ | 35 % for every category; isotropic covariance `(0.35·‖ω‖)²·I` on the vector |
| Axis | Tilt is **unavailable** (flag `spin-axis-not-estimable-from-club-model`). The vector assumes zero tilt (flag `spin-axis-assumed-zero`) only so the shot can be simulated. |
| Label / confidence | `estimated-club-model`; rate 0.25; vector `min(0.25, velocity confidence)`; spin factor 0.3 |
| Warnings | "Spin estimated from club model; shot-shape accuracy reduced." and "Spin axis cannot be estimated from a club model; zero axis tilt (no curve) is assumed for simulation." |

**Provenance of the numbers.** They are widely reproduced tour averages: *secondary source, not
verified on page*. A later TrackMan table, reported in secondary sources and also not verified,
gives somewhat different values (for example driver 2,545 rpm). Tour players differ from a
garage golfer in speed, attack angle, strike and ball, hence the wide σ and the low confidence.
These are priors. They are never measurements and never club distances.

### 2.4 MODE 3 — generic assumption (only when the user allowed it)

| Rule | Value |
|---|---|
| Rate | Spin parameter `S = r‖ω‖/‖v‖ = 0.15` (`GENERIC_SPIN_PARAMETER`, a policy value with no cited source), so `‖ω‖ = 0.15·‖v‖/r`, r = 0.021335 m |
| σ | 50 %, isotropic |
| Axis | Zero tilt assumed; tilt unavailable (`spin-axis-not-estimable-generic-fallback`) |
| Label / confidence | `assumed-generic-fallback`. Rate and vector depend on the velocity: `min(0.1, velocity confidence)`. Spin factor 0.1. |
| Default | **Off.** `createRangePipelineConfig` sets `allowGenericSpinFallback: false`. |
| Warning | "Generic spin assumption in use (user-allowed fallback); carry, curve, descent and roll are generic, not specific to this shot." |

*Calculated* illustration of how generic it is: 167 mph → 5,012 rpm (driver prior 2,686);
120 mph → 3,602 rpm (7-iron tour average 7,097). The same rule gives driver-speed shots too
much spin and iron shots too little.

### 2.5 Unavailable

All three values (`angularVelocityRadPerSec`, `totalSpinRpm`, `spinAxisTiltDeg`) are
`unavailable`, with confidence 0 and flags explaining why. Reasons include:

- no spin observation passed the gate and no estimate applies;
- the club is unknown or a putter, and the fallback is not allowed;
- the launch velocity is unavailable or vertical.

The product warning is *"Spin unavailable; carry, curve, descent and roll cannot be calculated
credibly."*

---

## 3. Effect on provenance, validity and confidence

| Mode | ω source | Total spin source | Tilt | ω confidence | Spin factor (score, weight) | Best validity | Simulation |
|---|---|---|---|---|---|---|---|
| measured, sensor stream | `measured-*` | same as ω | derived from ω and v | 0.57–0.95 | 0.8–1.0, 1.5 | valid | yes |
| measured, synthetic stream | `synthetic` | `synthetic` | derived | 0.57–0.95 | 0.8–1.0, 1.5 | valid (never score-eligible) | yes |
| measured, manual stream | `synthetic` | `synthetic` | derived | 0.57–0.95 | 0.8–1.0, 1.5 | provisional | yes |
| estimated (player) | `estimated-player-model` | same | estimated, σ ≥ 2° | ≤ 0.5 | 0.55, 1.5 | provisional | yes |
| estimated (club) | `estimated-club-model` | same | unavailable (0 assumed) | ≤ 0.25 | 0.3, 1.5 | provisional | yes; curve withheld |
| assumed-generic-fallback | `assumed-generic-fallback` | same | unavailable (0 assumed) | ≤ 0.1 | 0.1, 1.5 | provisional | yes; curve withheld |
| unavailable | `unavailable` | `unavailable` | `unavailable` | 0 | 0, **weight 0** | provisional | **withheld** |

"Best validity" is the most the spin mode allows; other factors (calibration, fit,
ball zone, sensor health) can still make the shot invalid.

**Provenance rules**

- A value derived from several inputs takes the worst input label (`combineSources`). Order
  from worst: unavailable > assumed-generic-fallback > estimated-club-model >
  estimated-player-model > synthetic > manual > measured. Mixed measured kinds become
  `measured-hybrid`.
- Model labels outrank stream-origin labels. A club-prior vector oriented by a synthetic
  velocity is labeled `estimated-club-model`, and its confidence is the lower of the two. The
  synthetic origin is not lost: it is carried by `dataOrigin`, the data-origin banner, and
  `CalculatedValue.dependsOnSynthetic`.
- Provenance is never upgraded. An estimate cannot become measured downstream.

**Validity** (`aggregateConfidence`). A launch state is at best **provisional** whenever
`spinMode ≠ "measured"`, and always for manual data. Unavailable spin does **not** invalidate
the shot:

- Ball speed and launch angles remain genuine values of the stream.
- The spin factor has weight 0, so missing spin does not drag their confidence to zero.
- Every spin-dependent output is withheld instead. `simulateShot` returns no result, and the
  record carries `simulationSkippedReason`: *"Spin unavailable; … Measure spin, select a club
  for an estimate, or explicitly allow the generic spin fallback."*
- The launch fit's aero refit then assumes zero Magnus lift, with a warning
  ([vision-pipeline.md §3.1](vision-pipeline.md#31-sequence-in-the-shot-pipeline-processshot)).

**Confidence caps on calculated metrics** (`buildShotMetrics`, `@glm/shot-simulator`):

```
confidence(metric) = min( ballProfile.confidenceCeiling,      // 0.6 baseline … 0.4 generic ball
                          ω confidence,                        // spin cap
                          overallConfidence · envFactor · classFactor )
```

| Item | Factor or rule |
|---|---|
| `envFactor` | 0.9 if outdoor with any defaulted environment field, else 1 |
| `classFactor`, ground metrics (total, total lateral, bounce, roll) | × 0.75 |
| `classFactor`, lateral and ground metrics when the axis was assumed (club prior, generic fallback) | × 0.6 |
| Curve when the axis was assumed | `null` (flag `spin-axis-unavailable`): a fabricated zero is never shown |
| Curve for a measured spin with an undefined axis (≈ 0 spin) | Still computed: no Magnus side force exists to fabricate |
| `dependsOnEstimated` on every calculated metric | `true` when any input is estimated, assumed or manual |

So carry from club-prior spin can never show more than 0.25 confidence, and from the generic
fallback no more than 0.1, whatever the launch fit quality. Total, bounce and roll are also
**provisional and model-dependent**: the ground model is being revised
([terrain-model.md](terrain-model.md)).

---

## 4. Planned (Phase 3): marked-ball spin measurement — not implemented

No code in this section exists. The contract it must fill already exists: `SpinObservation`
with `method: "marked-ball"`, a world-frame ω, a covariance, `validObservationCount`,
`fitResidualRad` and `qualityFlags`. Its output then passes the MODE-1 gate (§2.1) unchanged.
Numbers marked *calculated* are arithmetic, not device specifications. Proposed camera targets
(exposure, frame rate, resolution) are in [sensor-specification.md §5](sensor-specification.md).

### 4.1 Principle

The ball carries a known marker pattern. At each exposure the ball's **3D orientation** is
estimated. A constant angular velocity is then fitted to the orientation sequence.

### 4.2 Marker pattern requirements

- **No rotational symmetry.** A pattern with n-fold symmetry about the spin axis cannot tell a
  rotation θ from θ + 2π/n, which divides the aliasing limit (§4.5) by n.
- Distinct, individually identifiable features (shape or color coded) spread over the sphere,
  so that at least three non-collinear features are visible to each camera at every exposure,
  whatever the ball's orientation at address.
- High contrast against the white cover and the dimple shading under the planned
  illumination. Features large enough to survive the spin blur in §4.6.
- The marked ball must match the ball profile in use. Whether markings change the
  aerodynamics is **unknown** (not measured).

### 4.3 Orientation at each exposure

1. Detect marker features in each camera image.
2. Back-project each feature as a ray and intersect it with the ball sphere (center from
   Stage D, [vision-pipeline.md §2.4](vision-pipeline.md#24-stage-d--matching-triangulation-reprojection-error),
   known radius). This gives world-frame 3D points on the ball surface.
3. Match the points to the known marker layout and solve the rotation (orthogonal Procrustes /
   Wahba via SVD). Propagate a covariance from the point noise.
4. With two cameras, combine both views and check that they agree.

Orientation is solved **in 3D, not from 2D image rotation**. As the ball moves, each camera
sees it from a changing direction. A 1 m track viewed at 2 m from its midpoint changes the
viewing direction by 2·atan(0.5/2) = 28.1° (*calculated*). A 2D method would report that
parallax as spin.

### 4.4 Rotation fit across exposures

| Item | Planned method |
|---|---|
| Model | `R(t) = Exp((t − t_ref)·[ω]×) · R₀`, with constant world-frame ω |
| Why ω can be constant | With the provisional spin-decay time constant τ ≈ 20 s ([physics-model.md §8.1](physics-model.md#81-provisional-baseline-parameters-and-their-basis)), ‖ω‖ changes by ≈ 0.1 % over a 20 ms window (*calculated*). |
| Unknowns | ω (3) and R₀ (3) |
| Residual | `ξ_k = Log(R(t_k) · R_kᵀ)`, weighted by each orientation's covariance |
| Initialization | Minimal rotations between consecutive exposures, unwrapped consistently (§4.5) |
| Solver | Gauss–Newton / Levenberg–Marquardt on SO(3) |
| Covariance | Normal matrix inflated by max(1, χ²/dof), as in Stage E |
| Outputs | `angularVelocityRadPerSec`, `covarianceRad2PerS2`, `validObservationCount` (orientations used), `fitResidualRad` (RMS of ‖ξ_k‖), `qualityFlags` |

### 4.5 Aliasing limits

From one exposure interval Δt, a rotation is known only modulo a full turn. The minimal
rotation reading is at most a half turn (about the axis or its reverse). Without prior knowledge
of the spin direction, spin is therefore **unaliased only if |ω|·Δt < π**:

```
max unaliased spin (rpm) = 30 · f        (f = 1/Δt, exposures per second)
```

| Rate (exposures/s) | Δt | Max unaliased (rpm) | Rotation per interval at 2,686 rpm | at 9,304 rpm | at 15,000 rpm |
|---|---|---|---|---|---|
| 240 | 4.17 ms | 7,200 | 67.2° | 232.6° **aliased** | 375.0° **aliased** |
| 500 | 2.00 ms | 15,000 | 32.2° | 111.6° | 180.0° (at the limit) |
| 1,000 | 1.00 ms | 30,000 | 16.1° | 55.8° | 90.0° |
| 2,000 | 0.50 ms | 60,000 | 8.1° | 27.9° | 45.0° |
| 5,000 | 0.20 ms | 150,000 | 3.2° | 11.2° | 18.0° |

(*Calculated.* 2,686 and 9,304 rpm are the driver and wedge priors of §2.3; 15,000 rpm is the
gate's plausibility cap.)

- **Wagon-wheel example** (*calculated*). A 9,304 rpm wedge at 240 exposures/s turns 232.6° per
  interval. The minimal reading is 127.4° about the **opposite** axis: about 5,096 rpm of
  topspin instead of 9,304 rpm of backspin.
- **A known axis sign doubles the limit** to 60·f. But that "knowledge" is an assumption. The
  planned method does not use it by default; if it is ever used, the observation must be flagged.
- **More equally spaced frames do not help.** A constant-ω fit has the same aliases
  `ω + k·(2π/Δt)·â`.
- **Unequal intervals do help.** With interval ratio `Δt₁/Δt₂ = p/q` in lowest terms, the
  aliases first coincide at `2πp/Δt₁`, which raises the limit by a factor p. For example,
  1.0 ms and 1.25 ms (p/q = 4/5) give 120,000 rpm instead of 30,000. The margin under noise
  must be checked; this is a design option, not a decision.
- **Practical limit.** Marker visibility and feature matching limit the rotation per interval
  well before π. That threshold is to be set from Phase 3 data.
- The method must raise the existing **blocking** flag `aliasing-risk` near either limit, or
  when alias candidates cannot be separated.

### 4.6 Quality checks

| Check | Rule | Status |
|---|---|---|
| Orientation count | ≥ 4 (gate) | Gate TESTED; producer planned |
| Rotation-fit residual | ≤ 0.06 rad (gate) | Gate TESTED; producer planned |
| Relative σ of ‖ω‖ | ≤ 15 % (gate) | Gate TESTED; producer planned |
| Plausibility | ≤ 15,000 rpm (gate) | Gate TESTED; producer planned |
| Too few identifiable markers | flag `insufficient-features` (blocking) | Planned |
| Marker hidden by club, shaft or hands near impact | flag `occluded` (blocking) | Planned |
| Only a symmetric subset of the pattern visible | flag `ambiguous-rotation` (blocking) | Planned |
| Near the aliasing limit (§4.5) | flag `aliasing-risk` (blocking) | Planned |
| Marker smear too large for its size | flag `motion-blur` (blocking) | Planned |
| Consecutive-interval rotations agree with constant ω | within noise | Planned |
| Two cameras agree on ω | within covariance | Planned |
| No prior "corrects" a measured axis or rate | rule | Planned |

Marker smear from spin alone (*calculated*: surface speed r|ω|, r = 21.3 mm), on top of the
whole-ball translational blur in
[vision-pipeline.md §2.3](vision-pipeline.md#23-stage-c--early-flight-2d-tracking):

| Spin | Surface speed | Smear in 20 µs | Smear in 100 µs |
|---|---|---|---|
| 2,686 rpm | 6.0 m/s | 0.12 mm | 0.60 mm |
| 9,304 rpm | 20.8 m/s | 0.42 mm | 2.08 mm |
| 15,000 rpm | 33.5 m/s | 0.67 mm | 3.35 mm |

**Before any spin value can be VERIFIED**, it must be compared with an independent reference
instrument, using accuracy targets set in advance (see the
[phase plan](product-requirements.md#9-phase-plan)). The contract also names
`dimple-tracking` and `radar-doppler` methods. Neither is planned in detail here, and neither
is implemented.

---

## 5. What is tested

`npx vitest run packages/launch-state` passed (6 files, 90 tests) and
`npx vitest run tests/integration` passed (2 files, 15 tests) on 2026-10-01.

| Behavior | Test |
|---|---|
| Gate pass, stream label kept; synthetic never labeled measured; best observation chosen | `resolveSpin MODE 1` block (spin.test.ts) |
| Gate failure never yields measured spin; falls through with an explanation | `never reports measured spin when the gate fails …` |
| Measured ~0 rpm keeps its rate, reports no axis | `a measured ~0 rpm (knuckleball) spin …` |
| Player history precedence, MAD σ, filters (measured only, category, ±15 % speed) | `resolveSpin MODE 2` block |
| Club priors: labels, 35 % σ, tilt unavailable, zero tilt assumed, no putter prior | `club priors are labelled …`, `documents the tour-average mapping …` |
| Generic fallback only when allowed; velocity-dependent provenance and confidence | `resolveSpin MODE 3` block |
| Unavailable: all three values null, product warning, zero non-blocking factor | `unavailable: …`, `cannot estimate spin without a launch direction` |
| Sign and frame conventions, tilt round trip to 1e-9, rifle spin does not change tilt | derive.test.ts |
| First-order σ of total spin and tilt within 10 % of Monte Carlo | `first-order uncertainty propagation agrees with Monte Carlo …` |
| Unavailable spin → no simulation; club estimate → provisional, curve null; fallback → carry confidence ≤ spin confidence | `spin modes end-to-end` (tests/integration/pipeline.test.ts) |
| Draw curves left, fade curves right (measured synthetic spin) | `draw curves left, fade curves right …` |

---

## 6. Limitations

- **No spin is measured.** Every MODE-1 value in this build is synthetic or developer-typed.
- **Quality-gate thresholds and confidence mappings are provisional.** They are policy values,
  not calibrated probabilities.
- **Club priors are coarse.** They come from tour averages (secondary sources) and use one prior
  per category. They carry no axis, so curve is withheld and offline values assume a straight
  shot.
- **The generic fallback describes no actual shot.** It is off by default.
- **The player-history model has never run on real data** (no measured history exists).
- **The spin axis keeps its world-frame direction in flight** (no precession;
  [physics-model.md §12](physics-model.md#12-limitations)).

## Related documents

- [coordinate-system.md](coordinate-system.md): ω, tilt and sign conventions
- [vision-pipeline.md](vision-pipeline.md): the launch fit that uses the resolved spin
- [sensor-specification.md](sensor-specification.md): what a spin-producing driver must emit
- [physics-model.md](physics-model.md): Magnus lift, spin decay, spin parameter S
- [limitations.md](limitations.md): what this build cannot tell you
