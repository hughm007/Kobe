# Air-flight physics model

**Versions:** physics `glm-physics-0.1.0-provisional` (`PHYSICS_MODEL_VERSION`), environment
`glm-env-0.1.0` (`ENVIRONMENT_MODEL_VERSION`), both in `@glm/ballistics`.
**Status: PROVISIONAL.** The equations are standard; the aerodynamic coefficients are
**not fit to data** (§8, §9). Read §12 (limitations) before using any number from this model.

This document covers **air flight only**: from a ball state to the next ground contact.
Bounce and roll belong to `@glm/ground-physics` ([terrain-model.md](terrain-model.md));
uncertainty propagation (Monte Carlo) belongs to `@glm/shot-simulator` (summary in §14, details
in [architecture.md §5](architecture.md#5-uncertainty-propagation)). Frames, axes and spin conventions are those of
[coordinate-system.md](coordinate-system.md) (`glm-world-1.0`): +X target line, +Y golfer's
left, +Z up, spin as a 3D angular-velocity vector ω (rad/s), SI units throughout.

## 1. State

The integrated state is 9-dimensional: position **p** (m), velocity **v** (m/s) and angular
velocity **ω** (rad/s), all world frame, ball center.

## 2. Forces

```
dp/dt = v
dv/dt = g_vec + a_drag + a_lift
dω/dt = (d|ω|/dt) · ω/|ω|            (spin-decay model, §3.3; axis direction preserved)
```

| Term | Equation |
|---|---|
| Gravity | `g_vec = (0, 0, −g)`, `g = environment.gravityMps2` (default 9.80665 m/s²) |
| Air-relative velocity | `v_air = v − wind` (`wind = environment.windMps`, the direction the air moves toward) |
| Reynolds number | `Re = ρ · |v_air| · d / μ` |
| Perpendicular spin | `ω⊥ = ω − (ω·û)û`, `û = v_air/|v_air|` |
| Spin parameter | `S = |ω⊥| · r / |v_air|`, `r = d/2` |
| Drag | `a_drag = −½ ρ A C_D |v_air| v_air / m` |
| Magnus (lift) | `a_lift = ½ ρ A C_L |v_air|² / m · unit(ω⊥ × v_air)` |

`A = πd²/4`, `m`, `d` from the ball profile; `ρ`, `μ` from the environment profile.

**Perpendicular-spin rule.** Only the component of ω perpendicular to the air velocity
produces a Magnus force and enters S. Spin about the flight direction (rifle spin, ω ∥ v_air)
produces no lift and no spin-induced drag. Because `ω × v_air = ω⊥ × v_air`, the lift direction
is the usual `unit(ω × v_air)`.

Sign checks (coordinate-system.md §4.2–4.3, covered by tests): backspin ω ∥ −Y with v ∥ +X
gives lift along +Z; a positive spin-axis tilt gives a −Y (rightward) force.

**Safeguards (no NaN).** If `|v_air| < 1e-6 m/s`, S = 0 and there is no lift (the direction is
undefined); if `|ω⊥| < 1e-9 rad/s` there is no lift. The spin-decay rate is clamped to `≤ 0`.
`computeAcceleration` throws a `RangeError` for non-finite velocity or spin components, and for
inputs so large that the forces overflow double precision (|v| of order 1e154 m/s and beyond),
instead of returning NaN or Infinity. Inside the integrator a non-finite state ends the flight
as `numerical-failure` (§5).

## 3. Aerodynamic model registry

A ball profile names a model id for drag, lift and spin decay, and supplies the parameters.
An id names a **functional form**; changing a form requires a new id and a physics version
bump. `getDragModel` / `getLiftModel` / `getSpinDecayModel` throw on unknown ids;
`resolveProfileModels(profile)` additionally throws if a required parameter is missing,
non-finite, or physically meaningless (e.g. `reWidth ≤ 0`).

Each coefficient model declares a **validity** range (Re and S) — the range over which the
functional form has (secondary-source) literature support. Coefficient *values* are
provisional even inside it.

### 3.1 Drag `drag-re-spin-v0`

```
C_D = cdSupercritical + cdCrisisRise / (1 + exp((Re − reCritical)/reWidth)) + cdSpinSlope · S
```

A logistic drag rise below the dimpled-ball critical Reynolds number (the drag crisis), and a
linear growth of drag with spin parameter. Above the crisis the drag is Re-independent,
consistent with Bearman & Harvey's observation that above the dimple-triggered critical Re the
forces depend little on Re. Validity: `4e4 ≤ Re ≤ 2.5e5`, `0 ≤ S ≤ 0.4`.

| Parameter | Meaning | Constraint |
|---|---|---|
| `cdSupercritical` | C_D above the crisis at S = 0 | > 0 |
| `cdCrisisRise` | Extra C_D far below the crisis | ≥ 0 |
| `reCritical` | Re at the logistic midpoint | > 0 |
| `reWidth` | Logistic width in Re | > 0 |
| `cdSpinSlope` | dC_D/dS | ≥ 0 |

### 3.2 Lift `lift-spin-power-v0`

```
C_L = min(clMax, clCoefficient · S^clExponent)   for S > 0;   C_L = 0 for S ≤ 0
```

The power-law form reported by Smits & Smith (1994); the coefficients here are our own
provisional choice (§8.1). C_L is never negative: the reverse-Magnus regime is **not**
modelled (§12). Validity: `4e4 ≤ Re ≤ 2.5e5`, `0.02 ≤ S ≤ 0.4`.

| Parameter | Meaning | Constraint |
|---|---|---|
| `clCoefficient` | Power-law prefactor | > 0 |
| `clExponent` | Power-law exponent | > 0 |
| `clMax` | Cap on C_L | ≥ 0 |

### 3.3 Spin decay

`spin-decay-moment-v0` — aerodynamic spin-down torque (form after Tavares, Shannon & Melvin 1999):

```
I dω/dt = −r ρ A C_M v²,  C_M = cmSpinSlope · S,  S = |ω| r / v
⇒ d|ω|/dt = −ρ A cmSpinSlope r² |ω| v / I
```

Time constant `τ = I / (ρ A cmSpinSlope r² v)`, inversely proportional to air speed. Here `v`
is the air speed and `|ω|` the **total** spin (rifle spin is also slowed by skin friction).

| Parameter | Meaning | Constraint |
|---|---|---|
| `cmSpinSlope` | dC_M/dS | ≥ 0 |

`spin-decay-exponential-v0` — comparison model, `d|ω|/dt = −|ω| / tauS` (speed-independent).

| Parameter | Meaning | Constraint |
|---|---|---|
| `tauS` | Decay time constant, s | > 0 |

The decay changes only the spin **magnitude**; the spin axis keeps its world-frame direction
(gyroscopic stiffness). No precession or nutation is modelled.

**Stiffness limit.** Spin is integrated by the same explicit RK4 as the rest of the state. For
`d|ω|/dt = −|ω|/τ` one RK4 step multiplies the spin by `1 + z + z²/2 + z³/6 + z⁴/24`, `z = −h/τ`,
which exceeds 1 (the spin would **grow**) once `h/τ > ≈ 2.785`. Two checks keep the "spin only
decays" invariant:

- `simulateFlightSegment` and `propagatePositions` throw a `RangeError` before integrating if
  the profile's parameters give `τ < 4·timestepS` (`MIN_SPIN_DECAY_TIME_CONSTANT_STEPS`) at the
  top of its applicability envelope (maximum applicable speed and spin; the moment model's rate
  grows with speed). Realistic time constants (≈ 10–30 s) are ~10⁴ steps.
- During integration, a step whose start state has `h/τ > 1` (`MAX_SPIN_DECAY_STEP_RATIO`, e.g.
  far above the profile's speed range), or that increases |ω| or reverses the spin axis, ends
  the flight as `numerical-failure` with a warning (`propagatePositions` throws). Up to
  `h/τ ≈ 1.6` the RK4 spin factor falls monotonically, so with `h/τ ≤ 1` samples and contact
  states taken by partial steps also show spin only decaying.

## 4. Integrator

- **Classical fixed-step RK4** on the 9-dim state, default `timestepS = 0.001` s
  (`DEFAULT_SIMULATION_SETTINGS`); accepted range `(0, 0.05]` s.
- The integration grid is `t_k = k · timestepS` from the segment start; full steps are exactly
  `timestepS`, and only a final step that would overshoot `maxFlightTimeS` is shortened.
- **Output samples** are taken every `outputSampleIntervalS` (default 0.01 s) by a *partial*
  RK4 step from the preceding grid point (or the grid state itself when a sample time falls on
  the grid). Sampling therefore never perturbs the integration grid, and carry does not depend
  on the output interval.
- **Determinism:** no randomness, no clocks; identical inputs give bit-identical results **on the
  same JavaScript engine**. `Math.exp`/`Math.pow` are implementation-approximated in ECMAScript,
  so different engines (or versions) may differ in the last bits.
- **Convergence:** driver carry at 1 ms vs 0.25 ms differs by < 0.05 m (test); observed
  difference is ~1e-13 m because contact time is located independently of the step size (§5).

Sample and event times are **absolute**: `tS = startTimeS + elapsed` (launch-relative clock,
coordinate-system.md §8). `startTimeS` defaults to 0 and must be finite and `≥ 0` (throws
otherwise), so every time in an `AirFlightResult` is non-negative.

## 5. Ground-contact event detection and termination

**Clearance.** With `terrain.sample(x, y)` returning the ground height `h` and unit outward
normal **n** directly below the ball center,

```
g = (p − (x, y, h)) · n − r = (z − h) n_z − r
```

For a plane this is the exact perpendicular distance from the ball surface to the plane, so on a
slope the ball touches when its center is one radius from the surface **along the normal**,
not vertically (coordinate-system.md §5).

**Detection.** Contact is the first step on which `g` crosses from `> 0` to `≤ 0` (the ball
moving toward the surface). The crossing time is bracketed by **bisection** over partial RK4
steps of length τ ∈ (0, h] from the step start, until the bracket is ≤ 1e-7 s
(`CONTACT_TIME_TOLERANCE_S`; requirement ≤ 1e-6 s). The reported contact state is the bracket
end with `g ≤ 0` (the ball has just reached the surface), and its terrain sample is returned
with it.

**Segments that start near the surface** (`g ≤ 1e-9 m`: a ball at address on the ground plane,
or a `"bounce-air"` segment handed over by the ground model) follow the initial normal velocity
`v·n`:

| Start | Rule |
|---|---|
| `0 < g ≤ 1e-9`, `v·n < 0` (above, approaching) | Ordinary crossing: located by bisection as above. |
| `g ≤ 0`, `v·n < 0` (touching or inside, moving **into** the surface, e.g. a topped shot) | Contact is reported at the **start state** (`contact.timeS = startTimeS`, `flightTimeS = 0`, one sample). Stepping first would report it a full step late with the ball embedded (≈ 6 mm for a 70 m/s, −5° launch at 1 ms). |
| `v·n ≥ 0` (moving away or along the surface) | No contact until the ball has separated (`g > 1e-9`). If it never separates and its normal velocity turns inward (`v·n ≤ 0`) at the end of a step, contact is reported at the end of **that** step (e.g. a putt-like state moving along the ground, or a bounce with negligible outward speed, hands back after one step). |

A zero-length segment therefore only occurs when the ball is already in contact and moving
into the surface; a well-formed `"bounce-air"` hand-over (moving away) never produces one.

**Termination** (`AirFlightResult.termination`):

| Value | Meaning |
|---|---|
| `ground-contact` | Contact found; `contact` is non-null; the final sample is the contact state. |
| `max-time` | `maxFlightTimeS` elapsed without contact; `contact` is null. |
| `numerical-failure` | A step produced a non-finite state, or the spin decay could not be resolved by the timestep (§3.3). Integration stops at the last valid state, a warning explains it, `contact` is null. Positions are never NaN. |

**Apex** is the maximum z over the grid states and the contact state:
`apex.heightAboveLaunchM = max z − initial z`.

**Applicability warnings** (stated once each, human-readable) are raised for the segment's
initial state when the ball speed is outside `profile.applicableSpeedRangeMps`, the spin is
outside `profile.applicableSpinRangeRpm`, or Re / S are outside a coefficient model's validity
range. A grazing contact shorter than one step can be missed (inherent to fixed-step event
detection); invalid terrain samples (non-finite height or zero normal) throw.

## 6. Ground-free propagation for estimators

`propagatePositions(p0, v0, ω0, dtS, environment, profile, { timestepS? })` returns the ball
center at each requested elapsed time with the **same force model, the same RK4 grid and the
same partial-step rule** as `simulateFlightSegment`, but no ground. Times must be finite,
`≥ 0`, and non-decreasing (throws otherwise). At a flight sample's elapsed time the returned
position equals that sample's position bit-for-bit (same timestep). A non-finite integration
or an unresolvable spin decay (§3.3) throws instead of returning NaN or amplified spin.

## 7. Environment model

`createEnvironmentProfile(input)` returns a validated, deep-frozen `EnvironmentProfile`.
Air density and viscosity are **always computed**, never accepted as input.

| Quantity | Formula / constant |
|---|---|
| Saturation vapour pressure (Buck 1981, over water) | `p_sat[hPa] = 6.1121 · exp((18.678 − T/234.5) · (T/(257.14 + T)))`, T in °C |
| Vapour / dry partial pressures | `p_v = RH · p_sat(T)`, `p_d = p − p_v` |
| Moist-air density | `ρ = p_d/(R_d T_K) + p_v/(R_v T_K)`, `R_d = 287.058`, `R_v = 461.495` J/(kg·K) |
| Viscosity (Sutherland) | `μ = μ0 (T_K/T0)^1.5 (T0 + S)/(T_K + S)`, `μ0 = 1.716e-5` Pa·s, `T0 = 273.15` K, `S = 110.4` K |
| ISA station pressure | `p = p0 (1 − 0.0065 h / 288.15)^5.25588`, 0 ≤ h ≤ 11 000 m (throws outside) |

Humid air is **less** dense than dry air at the same pressure. Neglected: the vapour-pressure
enhancement factor and non-ideal compressibility (< 0.5 %), and humidity's effect on viscosity
(~1 %). Reference values: dry air at 20 °C, 101 325 Pa: 1.2041 kg/m³; default (20 °C, 50 % RH):
1.1988 kg/m³; μ(20 °C) = 1.813e-5 Pa·s; ISA p(1500 m) = 84 556 Pa.

**Defaults and provenance.** Missing (omitted / `undefined`) fields default to 20 °C, RH 0.5,
altitude 0 m, wind 0, `indoorMode: true`, g = 9.80665 m/s², each with `fieldSource: "default"`.
Supplied fields get `"user"` unless `input.fieldSources` overrides them with `"user"`,
`"sensor"` or `"derived"` (the last for values the caller computed, e.g. station pressure from a
reported QNH). Rejected, so that a made-up value can never carry user or sensor provenance:
`null` for any field (an unavailable measurement must be omitted, not passed as null); an
override for a field that was not supplied; `"default"` for a supplied value; any other string;
and unknown `fieldSources` keys. If pressure is missing and altitude is supplied, pressure is
derived from the ISA troposphere (`"derived"`); with neither, 101 325 Pa (`"default"`). `pressurePa` is the
absolute **station** pressure, not a weather report's sea-level pressure; prefer a measured
value — the ISA derivation assumes the standard temperature profile. Below sea level a measured
pressure is required.

**Validation (throws with an actionable message):** temperature −40…55 °C; pressure
30 000…115 000 Pa (catches hPa/inHg unit mistakes); RH 0…1 (catches percentages); altitude
−500…9000 m; |wind| ≤ 40 m/s and finite; gravity 9.5…10.0 m/s²; non-zero wind with
`indoorMode: true` is rejected (pass `indoorMode: false` for outdoor conditions).

## 8. Shipped ball profiles

There is **no ball-model-specific aerodynamic data in this repository.** All four profiles
use identical, provisional aerodynamic parameters; they differ only in confidence ceiling,
warnings and limitations. All are `source: "default"`, version `0.1.0-provisional`.

| Id | Confidence ceiling | Notes |
|---|---|---|
| `premium-urethane-baseline` (default) | 0.6 | Parameters referenced to premium-ball tour averages (§9); no specific ball measured. |
| `two-piece-distance-baseline` | 0.55 | Same aerodynamics as baseline (stated in limitations). Lower spin of two-piece balls must come from the measured launch spin. |
| `range-ball-practice` | 0.5 | Same aerodynamics; prominent warning that range / limited-flight balls vary widely and real carry may be substantially shorter. |
| `generic-fallback` | 0.4 | Same aerodynamics; unknown ball. |

Common physical properties: mass 0.04593 kg and diameter 0.04267 m (Rules of Golf limits:
mass ≤ 45.93 g, diameter ≥ 42.67 mm); `A = πd²/4 = 1.4300e-3 m²`; moment of inertia
`0.4 m r² = 8.363e-6 kg·m²` (uniform sphere; patent literature gives 7.0e-6…9.5e-6 kg·m² for
multilayer balls, so the uniform value sits inside the reported span). Applicable ranges:
ball speed 25…85 m/s (≈ 56…190 mph, Re ≈ 7e4…2.4e5 at default conditions), spin 1000…10 000 rpm.

The ceilings are policy values, not statistics: the baseline is capped at 0.6 because its
coefficients are unfitted; the others are lower because they additionally assume, without
evidence, that their ball type flies like the baseline.

### 8.1 Provisional baseline parameters and their basis

| Model | Parameter | Value | Basis (none of these is a fit) |
|---|---|---|---|
| drag | `cdSupercritical` | 0.20 | Supercritical C_D ≈ 0.2 after the crisis (Alam et al. 2010; Lyu et al. 2018, secondary). |
| drag | `cdCrisisRise` | 0.30 | Gives non-spinning C_D ≈ 0.45 at Re 5e4 and ≈ 0.21 at Re 1e5 (Lyu et al.: ≈ 0.5 and ≈ 0.2). |
| drag | `reCritical` | 6.5e4 | Crisis between 5e4 and 1e5 for dimpled balls (Alam; Lyu). |
| drag | `reWidth` | 1.0e4 | Crisis essentially complete by Re ≈ 1e5. |
| drag | `cdSpinSlope` | 0.25 | Smits & Smith quoted slope 0.18. Gives C_D = 0.225 at S = 0.1 and 0.275 at S = 0.3 (Re 1.5e5) — **below** Bearman & Harvey's ≈ 0.27–0.32 for S > 0.1 (see the note below this table). |
| lift | `clCoefficient` | 0.5 | With the exponent below: C_L 0.071 / 0.158 / 0.274 at S = 0.02 / 0.1 / 0.3, close to Bearman & Harvey's ≈ 0.08 → 0.25 over S 0.02–0.3. |
| lift | `clExponent` | 0.5 | Smits & Smith exponent is 0.4; 0.5 lowers C_L at driver-like S (0.54·S^0.4 gives 0.197 at S = 0.08 vs 0.142 here). |
| lift | `clMax` | 0.35 | Cap above the supported S range (reached at S ≈ 0.49). |
| spin decay | `cmSpinSlope` | 0.012 | Tavares et al. (1999) C_M ≈ 0.012 S. Gives τ ≈ 20.0 s at 100 mph in the default environment (literature: 18.9 s Tavares; 23.8 s Smits & Smith; "≈ 4 %/s" rule of thumb with no primary source). |

Launch-state coefficients at the two envelope conditions (default environment):
driver Re = 2.11e5, S = 0.080, C_D = 0.220, C_L = 0.142; 7-iron Re = 1.51e5, S = 0.296,
C_D = 0.274, C_L = 0.272.

**The drag is lower than both cited spinning-ball sources, and the lift is lower too.** At
S = 0.1–0.3 the model's C_D is ≈ 0.045 below Bearman & Harvey's values (0.225 vs ≈ 0.27 at
S = 0.1; 0.275 vs ≈ 0.32 at S = 0.3). At the driver launch state the quoted Smits & Smith formula
gives C_D = 0.24 + 0.18·0.0804 + 0.06·sin(π(2.11e5 − 9e4)/2e5) = 0.311, ≈ 0.09 above the
model's 0.220, and C_L = 0.54·0.0804^0.4 = 0.197 vs the model's 0.142 (at the 7-iron state,
S = 0.296 lies outside that formula's stated validity). The low drag and the low lift largely
offset each other in carry, apex and descent, which is why both choices pass the plausibility
envelope (§9) — the parameters are not identifiable from it. Treat the individual coefficients,
and any quantity sensitive to drag and lift separately (e.g. wind response, ball speed at
landing), as unvalidated.

## 9. Plausibility envelope — a sanity check, NOT validation

Tests (`packages/ballistics/test/plausibility-envelope.test.ts`) fly two widely published
TrackMan PGA Tour averages (secondary sources) in the default indoor environment, no wind, on
flat ground at launch height (ball center at z = 0, ground plane z = −r). Flat ground at launch
height is used because TrackMan's carry and max height are understood to assume landing at
launch height (*secondary source, not verified on page*: TrackMan's definition pages could not
be fetched, and the definition was not read first-hand):

| Shot | Launch | Target (tolerance) | This model |
|---|---|---|---|
| Driver | 167 mph, 10.9°, 2686 rpm | carry 275 yd (±6 %), apex 32 yd (±20 %), descent 37° (±6°) | 270.5 yd, 31.0 yd, 37.0°; 6.52 s; 2016 rpm at landing |
| 7-iron | 120 mph, 16.3°, 7097 rpm | carry 172 yd (±6 %), apex 32 yd (±20 %), descent 50° (±6°) | 171.3 yd, 31.7 yd, 50.6°; 6.24 s; 5862 rpm at landing |

**Why this is not validation.** The same public averages were used to *choose* the parameters
in §8.1, so agreement with them is circular and is **not evidence of accuracy**. Moreover, the
two averages cannot identify the parameters: many distinct drag/lift parameter sets satisfy
every envelope criterion. The test file pins two of them besides the baseline —
(clCoefficient 0.4, clExponent 0.4, cdSupercritical 0.20, cdSpinSlope 0.20) and
(clCoefficient 0.6, clExponent 0.6, cdSupercritical 0.18, cdSpinSlope 0.30), other parameters
as in §8.1 — whose launch-state C_D and C_L differ from the baseline's by up to 0.015–0.026
(≈ 5–10 %). The envelope
only guards against regressions that would make the default physics implausible. Real validation requires
independent measured trajectories (e.g. per-shot radar/camera tracks across clubs and
conditions) and a proper fit with held-out data.

Other computed sensitivities (unvalidated): driver carry +4.6 % at 1600 m altitude
(ρ = 0.987 kg/m³); −16.5 m with a 5 m/s headwind, +12.5 m with a 5 m/s tailwind.

## 10. Applicability ranges

| Item | Range | Outside the range |
|---|---|---|
| Drag form | 4e4 ≤ Re ≤ 2.5e5, 0 ≤ S ≤ 0.4 | Launch warning; extrapolated |
| Lift form | 4e4 ≤ Re ≤ 2.5e5, 0.02 ≤ S ≤ 0.4 | Launch warning; extrapolated. Zero-spin (knuckle) shots warn because the low-S regime is unsupported |
| Shipped profiles | 25…85 m/s, 1000…10 000 rpm | Launch warning |
| Buck p_sat fit | ≈ −40…50 °C | Environment accepts −40…55 °C |
| ISA pressure | 0…11 km | Throws |

High-spin wedge shots (S > 0.4) and slow chips are outside the supported range and are
flagged; Re/S are checked at segment start only, although S grows and Re falls during flight.

## 11. Sources

The sandbox could not fetch source pages. Every item below comes from search-result snippets
or secondary sources (patent background text, summaries) and is labelled
**"secondary source, not verified on page."** None of the numbers has been checked against the
primary publication.

- Smits & Smith (1994), *Science and Golf II* — driver-range model as quoted in
  patent background text: C_D = 0.24 + 0.18 S + 0.06 sin(π(Re − 90 000)/200 000),
  C_L = 0.54 S^0.4, stated validity 70 000 < Re < 210 000 and 0.08 < S < 0.2 (raw data
  40k < Re < 250k, 0.04 < S < 1.4); spin-decay τ ≈ 23.8 s at 100 mph. *Secondary source, not
  verified on page.*
- Bearman & Harvey (1976), *Aeronautical Quarterly* — Re 40k–240k, S 0.02–0.3;
  C_L rising ≈ 0.08 → 0.25 with S; C_D ≈ 0.27 → 0.32 for S > 0.1; weak Re dependence above the
  critical Re. *Secondary source, not verified on page.*
- Alam et al. (2010) — drag crisis near Re_D ≈ 1e5, C_D dropping to ≈ 0.20. *Secondary
  source, not verified on page.*
- Lyu et al. (2018), 13 production balls — non-spinning C_D ≈ 0.5 at Re 5e4 and ≈ 0.2 at
  1e5; 18 m carry spread across ball models. *Secondary source, not verified on page.*
- Lyu, Kensrud & Smith (2020) — reverse Magnus (negative lift) for
  5e4 < Re < 7e4 at low spin. *Secondary source, not verified on page.* (Not modelled.)
- Tavares, Shannon & Melvin (1999) — spin-decay torque I dω/dt = −r ρ A C_M v²,
  C_M ≈ 0.012 S, τ ≈ 18.9 s at 100 mph. *Secondary source, not verified on page.*
- Golf-ball moment of inertia 70–95 g·cm² (patents). *Secondary source, not verified on page.*
- Rules of Golf ball limits (mass ≤ 45.93 g, diameter ≥ 42.67 mm). *Secondary source, not
  verified on page.*
- TrackMan PGA Tour averages (driver and 7-iron, §9). *Secondary source, not verified on page;
  used only as a plausibility envelope.*
- TrackMan's carry and max-height definitions (landing at launch height, §9). *Secondary source,
  not verified on page*: the definition pages were not fetched.
- Buck (1981; "Arden Buck" equation) saturation vapour pressure; Sutherland's law constants; ISA troposphere
  constants. *Secondary source, not verified on page* (standard reference values).

## 12. Limitations

1. **Provisional coefficients.** Not fit to measured trajectories or wind-tunnel data for any
   ball; the plausibility envelope is circular (§9).
2. **No ball-model differences.** All shipped profiles share one parameter set.
3. **No reverse-Magnus regime** (negative lift at 5e4 < Re < 7e4 and low spin); C_L ≥ 0 always.
4. **No ball-orientation, seam or dimple-pattern effects**; the ball is aerodynamically
   axisymmetric.
5. **No spin-axis precession**: the spin axis keeps its world-frame direction; only the
   magnitude decays.
6. **Validity checked at segment start only**; mid-flight excursions of Re/S (e.g. low Re near
   landing) are not flagged.
7. **Single deterministic trajectory.** This package computes one trajectory per launch state.
   The Monte Carlo in `@glm/shot-simulator` samples launch velocity and spin only; aerodynamic
   **parameter** uncertainty is not propagated anywhere (§14).
8. **Environment simplifications**: ideal-gas moist air, humidity ignored in viscosity, ISA
   temperature profile assumed when deriving pressure from altitude; wind is uniform and steady
   (no gradient with height, no gusts).
9. **Contact geometry** uses the terrain sample directly below the ball center: exact for
   planes, approximate for strongly curved or near-vertical surfaces; contacts shorter than one
   timestep can be missed.

## 13. Versioning

Any change that can alter a simulated number — an equation, a constant, a default parameter, a
shipped profile, or the integrator — requires bumping `PHYSICS_MODEL_VERSION` (or
`ENVIRONMENT_MODEL_VERSION` for §7) in the same commit, and a new model id if a functional form
changes. Results record the model version, model ids and timestep so stored shots stay
interpretable.

## 14. Uncertainty propagation (summary)

The air model itself is deterministic. `runMonteCarlo` in `@glm/shot-simulator` turns launch
uncertainty into intervals ([architecture.md §5](architecture.md#5-uncertainty-propagation) has
the full description):

- **Sampled:** the launch velocity (from the fit covariance) and the launch spin vector (from its
  covariance, whether measured, estimated or assumed). Each sample is flown through this air
  model and the ground model.
- **Integration:** the RK4 step is at least `MONTE_CARLO_MIN_TIMESTEP_S` = 4 ms (the reported
  trajectory uses the 1 ms default; carry is insensitive to the step because contact time is
  located by bisection, §4–5). p05 / p50 / p95 are reported per metric.
- **Samples:** 100 by default in a range session (`DEFAULT_MONTE_CARLO_SAMPLES`); 0 (disabled)
  in `DEFAULT_SIMULATION_SETTINGS`. Seeded, so deterministic.
- **Not included:** model and coefficient error (the drag, lift and spin-decay parameters of §8.1
  and the functional forms of §3), environment uncertainty, ground-model parameters, ball-to-ball
  variation and launch-position uncertainty. The intervals therefore understate real-world
  uncertainty; the plausibility envelope (§9) shows that parameter sets differing by about
  5–10 % in C_D and C_L are equally consistent with the only reference numbers available.
