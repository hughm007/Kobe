# Terrain and ground model

**Versions:** terrain representation and surface catalog `glm-terrain-0.1.0`
(`TERRAIN_MODEL_VERSION`, `@glm/terrain-engine`); bounce / skid / roll model
`glm-ground-0.1.0-provisional` (`GROUND_MODEL_VERSION`, `@glm/ground-physics`).
Changing any equation or default here requires a version bump in the same commit.

> **Status: PROVISIONAL.** Every surface parameter is a model parameter chosen to be
> physically *ordered*, not fit to measurements. Ground results (bounce, roll, total) are
> much less trustworthy than air results (carry). See §9.

All quantities are SI and use the world frame in [coordinate-system.md](coordinate-system.md):
+X toward the target, +Y to the golfer's left, +Z up; the origin is the ball **centre** at
address. Positions reported by the ground model are ball-centre positions.

Ground behaviour is separate from air flight. Neither package imports `@glm/ballistics`: the
hops between bounces are flown by a `HopSimulator` callback injected by the caller.

---

## 1. Terrain representation

`TerrainQuery.sample(x, y)` returns `{ heightM, normal, surface }`: the ground height under
`(x, y)`, the unit outward normal, and the `SurfaceProperties` there.

| Factory | Geometry | Surface |
|---|---|---|
| `createPlaneTerrain({ id, version?, pointOnPlaneM, normal, surface })` | Infinite plane `n · (p − p0) = 0`; `z(x, y) = p0.z − (n.x (x − p0.x) + n.y (y − p0.y)) / n.z`. The normal is normalised and must have `n.z > 0` (a height field); otherwise it throws. | One surface (catalog type or validated properties). |
| `createFlatRangeTerrain({ ballRadiusM, teeHeightM = 0, surface = "fairway-normal" })` | Level plane `z = −(ballRadius + teeHeight)`, because the origin is the ball centre at address. | One surface. |
| `createRegionTerrain({ id, base, regions })` | Height and normal always from `base`. | Overridden inside polygons; later regions win; even-odd (crossing-number) point-in-polygon with half-open edges. |

Queries with non-finite coordinates throw instead of returning NaN. Samples and surfaces are
frozen.

### 1.1 Extending to real courses (height maps)

The `TerrainQuery` interface is already the course contract; a course terrain only needs a new
geometry source:

1. **Height map.** A regular grid `h[i][j]` with origin, spacing and a georeference to the
   world frame (the course's tee box / target line define +X). Height by bilinear
   interpolation (C0) or, for smooth putting surfaces, bicubic / Catmull–Rom (C1) so that
   normals do not jump at cell edges.
2. **Normal from the gradient.** `n = normalize(−∂h/∂x, −∂h/∂y, 1)`, evaluated from the same
   interpolant as the height so height and normal stay consistent.
3. **Surfaces.** Wrap the height-map terrain with `createRegionTerrain` using surveyed
   polygons (green, fringe, bunkers, water, out-of-bounds, penalty areas). Grain, mowing
   direction and per-green Stimp readings attach to the green regions via
   `withSurfaceOverrides`.
4. **Versioning.** The terrain `id` names the course and hole; `version` identifies the
   survey / data release. Both are recorded in `PhysicsProvenance`.

The roll integrator already samples the terrain at the contact point (`centre − r n`) at
every step and snaps the centre to distance `r` along the local normal, so it works on curved
terrain as long as curvature is small over one step (~mm). Two gaps remain for real courses:
the roll keeps the ball on the surface (a crest never launches it), and the snap uses the
local tangent plane, which is exact only for planar terrain.

---

## 2. Surface catalog (`SURFACE_CATALOG`)

`moistureSoftness` is 0 for every playable row, so the catalog holds **dry reference** values.
`version` is `glm-terrain-0.1.0` and `provisional` is `true` for every row.
"Stimp-eq." is the Stimpmeter reading that the rolling-resistance value implies (§5); it is
shown for comparison only (`stimpFt` is stored only for the green).

| Surface | firmness | e base | e slope (s/m) | e min | μ slide | c_rr | Stimp-eq. (ft) | moisture | stimpFt | terminal |
|---|---|---|---|---|---|---|---|---|---|---|
| tee | 0.55 | 0.42 | 0.022 | 0.11 | 0.40 | 0.13 | 4.3 | 0 | null | false |
| range-mat | 0.85 | 0.60 | 0.012 | 0.30 | 0.45 | 0.10 | 5.6 | 0 | null | false |
| fairway-firm | 0.75 | 0.50 | 0.020 | 0.15 | 0.40 | 0.09 | 6.2 | 0 | null | false |
| fairway-normal | 0.60 | 0.42 | 0.022 | 0.12 | 0.40 | 0.12 | 4.7 | 0 | null | false |
| fairway-soft | 0.40 | 0.32 | 0.020 | 0.08 | 0.45 | 0.17 | 3.3 | 0 | null | false |
| first-cut | 0.50 | 0.36 | 0.022 | 0.10 | 0.45 | 0.20 | 2.8 | 0 | null | false |
| rough | 0.30 | 0.25 | 0.020 | 0.06 | 0.50 | 0.35 | 1.6 | 0 | null | false |
| bunker | 0.10 | 0.10 | 0.010 | 0.02 | 0.60 | 0.80 | 0.7 | 0 | null | false |
| green | 0.65 | 0.45 | 0.022 | 0.12 | 0.30 | 0.05602 | 10.0 | 0 | 10 | false |
| fringe | 0.50 | 0.40 | 0.022 | 0.11 | 0.35 | 0.11 | 5.1 | 0 | null | false |
| cart-path | 1.00 | 0.78 | 0.004 | 0.60 | 0.55 | 0.06 | 9.3 | 0 | null | false |
| water | 0 | 0 | 0 | 0 | 0 | 0 | — | 1 | null | **true** |
| out-of-bounds | 0.30 | 0.25 | 0.020 | 0.06 | 0.50 | 0.35 | 1.6 | 0 | null | **true** |
| trees | 0.45 | 0.35 | 0.020 | 0.08 | 0.50 | 0.25 | 2.2 | 0 | null | false |
| penalty-area | 0.30 | 0.25 | 0.020 | 0.06 | 0.50 | 0.35 | 1.6 | 0 | null | **true** |

**Basis (all provisional):**

- **Restitution (green row).** A straight-line fit, over 2–15 m/s, to the *shape* of Penner's
  (2002, "The run of a golf ball", eq. 5) turf restitution
  `e = 0.510 − 0.0375 v′ + 0.000903 v′²` (v′ ≤ 20 m/s; 0.120 above) — *secondary source, not
  verified on page*. In Penner's model `v′` is **not** the plain normal speed. It is the normal
  speed in an impact frame tilted by his crater angle θc (§9):
  `v′ = v_h sin θc + |v_z| cos θc` (v_h horizontal speed along the track, v_z vertical).
  This model has no crater tilt, so the catalog applies the
  fitted line to the plain normal speed `|v_n|`. That is an **uncalibrated simplification**,
  not Penner's model. At Penner's reference impact (18.6 m/s at 44.4°, so `|v_n|` = 13.0 m/s
  and θc = 15.4°), his model gives `v′` = 16.1 m/s and e = 0.141. The catalog gives
  e(13.0) = 0.164, which is 16 % higher. The tangential behaviour also differs, because the
  contact plane is not tilted. The table compares the two curves as functions of their own
  speed argument `s`. It shows that the line follows the polynomial's shape. It does **not**
  show that the two models agree for the same impact:

  | speed argument s (m/s) | 2 | 5 | 10 | 15 | 20 |
  |---|---|---|---|---|---|
  | Penner polynomial, s = θc-rotated normal speed v′ | 0.439 | 0.345 | 0.225 | 0.151 | 0.121 |
  | catalog green, s = plain normal speed \|v_n\| | 0.406 | 0.340 | 0.230 | 0.120 | 0.120 |

- **Restitution (other turf rows)** are judgement, ordered by firmness:
  firm fairway > green > normal fairway ≈ tee > fringe > first cut > trees > soft fairway >
  rough > bunker. No per-surface data were available. The green's place in this order comes
  from the Penner-shaped fit (which, as above, overstates e at Penner's reference impact),
  not from a green-versus-fairway comparison. Whether real greens bounce livelier than normal
  fairways is **not established** here.
- **Cart path.** A golf ball on a rigid surface rebounds far more than on turf; e = 0.78 with
  a small speed slope is a judgement for asphalt/concrete, not a measurement.
- **Range mat.** Livelier than turf (pad over a hard base); a judgement.
- **Sliding friction μ.** Lab putting surfaces measured μ = 0.11–0.40 (Griffiths & McKenzie,
  *secondary source, not verified on page*). Turf values are placed at 0.30 (green) to 0.60
  (sand). A Penner run-model value "about 0.4" circulates but was not found in any source.
- **Rolling resistance c_rr** (deceleration / g on flat ground). Green from the Stimp
  relation (§5) at 10 ft. Other surfaces are Stimp-equivalent guesses, ordered
  green < cart path < firm fairway < range mat < fringe < normal fairway < tee < soft fairway
  < first cut < trees < rough < bunker. The cart path value is a guess kept just above the
  green's; a smooth concrete path may roll faster.
- **Firmness** is descriptive in this model version (course logic, a future crater model); the
  impact model uses restitution and friction directly. It is set so that, across playable
  rows, a firmer surface never has a lower `restitutionBase` (tested). For example, the green
  (0.65) sits between firm fairway (0.75) and normal fairway (0.60), matching its restitution.
- **Terminal surfaces** stop the ball on entry. Their other values are placeholders that the
  ground model never reads. `trees` is the ground beneath a canopy; canopy collisions are not
  modelled.

`getSurface(type)` throws a `RangeError` for anything that is not a `SurfaceType`. That
includes inherited object keys such as `"constructor"` and `"__proto__"`.

Every surface, whether from the catalog, `withSurfaceOverrides` or explicit properties, is
validated:

- `SurfacePropertiesSchema`.
- `restitutionMin ≤ restitutionBase`.
- Finiteness.
- **water and out-of-bounds must be terminal.** A *playable* penalty area (`terminal: false`)
  is allowed, because golf lets a ball be played from one. Other types may be marked terminal
  explicitly.
- **Stimp consistency.** If `stimpFt` is not null, `rollingResistance` must be within 1 % of
  `rollingResistanceFromStimp(stimpFt)` at the default release speed, so the displayed green
  speed is the one the physics rolls at. A surface with zero rolling resistance has no finite
  Stimp, so it needs `stimpFt: null`.

`withSurfaceOverrides(base, overrides)` returns a validated, deep-frozen surface. It follows
these rules:

- **Re-versioning.** If any field other than `version` changes, including `type` and
  `provisional`, and no `version` is given, the result gets `version = base.version + "+custom"`
  and `provisional = true`. A hand-modified surface never carries the catalog version or
  passes as fitted.
- **Clearing `provisional`.** Setting `provisional: false` requires an explicit, new
  `version` that names the fit.
- **Green speed.** Overriding only `stimpFt` re-derives `rollingResistance`. Overriding only
  `rollingResistance` on a surface with a Stimp reading re-derives `stimpFt`. Giving both
  requires them to agree.

`surfaceToLie`: `range-mat → range`, `fairway-* → fairway`, every other type maps to the lie of
the same name.

---

## 3. Impact model (`resolveImpact`)

Rigid sphere on a rigid surface with Coulomb friction, solved as a single impulse.

**Notation.** `m` mass, `r = diameter / 2`, `I` moment of inertia, `k = I / (m r²)` (taken from
the ball profile; 0.4 for a uniform solid sphere). `n` = unit outward surface normal (normalised
on input). Incoming velocity `v`, spin `ω` (rad/s, right-hand rule, world frame).

```
v_n  = v · n                    (< 0 for an incoming ball)
v_t  = v − v_n n
contact point relative to the centre:  −r n
u    = v_t + ω × (−r n)          contact-point slip velocity
e    = effectiveRestitution(surface, |v_n|)
Jn   = m (1 + e) |v_n|           normal impulse
J*   = |u| / (1/m + r²/I)        tangential impulse that would stop the slip
Jt   = J*      if J* ≤ μ Jn     → regime "rolling-at-separation"
       μ Jn    otherwise         → regime "sliding"
v'   = v_t − (Jt/m) û − e v_n n
ω'   = ω + (r Jt / I) (n × û)    û = u / |u|
```

`J*` follows from requiring the post-impact slip to vanish: an impulse `−J û` at the contact
changes the slip by `−J (1/m + r²/I) û`, using `(n × û) × n = û`.

**Sign conventions (tested).**

- Ball moving +X with no spin lands on flat ground: `u = +X`, `n × û = Ẑ × X̂ = +Ŷ`, so
  `ω_y > 0` after impact. That is forward roll: the top of the ball moves forward
  (`ω × (r Ẑ)` points +X).
- Backspin is `ω_y < 0` (coordinate-system.md §4.2). The contact point of a backspinning ball
  moves *forward* (`ω × (−r Ẑ)` points +X), which adds to the forward slip. Friction then
  pushes the ball backward harder. With enough backspin on a steep enough landing, `v'_x < 0`
  (the ball checks and spins back). Topspin does the reverse and can increase `v'_x`.
- When friction suffices, the ball leaves rolling: `v'_t = (v_t − k r Ω)/(1 + k)` for backspin
  `Ω` about the rolling axis. For no spin this is `v_t / (1 + k)`.

**Invariants (tested on 2000 random impacts).** Kinetic + rotational energy never increases.
The normal speed is multiplied by `e ≤ 1`. Angular momentum about the contact point
(`m r n × v + I ω`) is conserved exactly, because every impulse acts at the contact point.
`Jt ≤ μ Jn`. A ball whose velocity is already separating (`v · n ≥ 0`) is returned unchanged.

**Effective restitution and moisture** (`effectiveRestitution`, `effectiveRollingResistance`).
`|v_n|` is the plain normal impact speed. There is no crater tilt; see §2 for how this differs
from Penner's restitution.

```
e_dry = clamp(restitutionBase − restitutionSpeedSlope · |v_n|, restitutionMin, restitutionBase)
e     = e_dry · (1 − 0.3 · moistureSoftness)
c_eff = rollingResistance · (1 + 0.5 · moistureSoftness)
```

The moisture factors (`MOISTURE_RESTITUTION_REDUCTION = 0.3`,
`MOISTURE_ROLLING_RESISTANCE_GAIN = 0.5`) are provisional judgements: a saturated surface
returns 30 % less normal speed and has 1.5× the rolling deceleration. Sliding friction is unchanged. Stimp
and `rollingResistance` are dry reference values. If a Stimp reading was taken under the
current wet conditions, applying `moistureSoftness` as well double-counts the moisture
effect on rolling.

---

## 4. Skid and roll (`simulateRoll`)

**Contact geometry.** At every step the terrain is sampled at the contact point
`centre − r n`. The sampled normal is normalised; a zero, non-finite or non-upward normal
(`n_z ≤ 0`) throws a `RangeError`. The centre is snapped along the local normal to distance
`r` from the local tangent plane (`centre = ground point + r n`), and the velocity is
projected onto the tangent plane (`v ← v − (v·n) n`). Gravity `G = (0, 0, −g)` splits into the normal load
`g_n = g n_z` and the tangential pull `g_t = G + g_n n` (`|g_t| = g sin θ` on a slope of angle θ).

**Sliding phase** (`|u| ≥ slipToRollToleranceMps`, `u = v + ω × (−r n)`). Kinetic friction
`μ m g_n` acts opposite the slip, with the matching torque:

```
dv/dt = g_t − μ g_n û
dω/dt = (μ g_n / (k r)) (n × û)
d|u|/dt = g_t · û − μ g_n (1 + 1/k)          (constant on a plane)
```

The instant at which the slip reaches zero is located inside the step. That is why a no-spin
ball on flat ground switches to rolling at exactly `v = v0 / (1 + k)` (5/7 v0 for k = 0.4)
after a skid distance `(v0² − (v0/(1+k))²) / (2 μ g)` (= 12 v0² / (49 μ g) for k = 0.4). A
backspinning ball rolls at `(v − k r Ω)/(1 + k)`, which is negative (spin-back) when
`k r Ω > v`. Rolling resistance is not applied while sliding, because Coulomb friction
dominates.

**Rolling phase.** The spin is tied to the velocity, `ω = (n × v) / r`. Twist about the
normal is discarded because no pivot-friction model exists, and it does not affect the path.

```
dv/dt = g_t / (1 + k) − c_rr g_n v̂
```

On flat ground the deceleration is `c_rr g`, so a ball rolling at `v` stops after `v² / (2 c_rr g)`.
At (near) zero speed the resistance opposes the slope pull up to its limit. Once rolling, the
ball never returns to sliding. That transition would need `tan θ > μ (1 + k)/k`, about 46°
for μ = 0.3.

**Rest.** The ball is at rest when `speed < restSpeedMps` **and** the slope cannot overcome
rolling resistance, `|g_t| / (1 + k) ≤ c_rr g_n`. On the 10 ft green (c_rr = 0.056,
k ≈ 0.4) that threshold is a slope of about 4.5°. On steeper slopes the ball keeps rolling
downhill. When the slope cannot overcome resistance, the exact stopping instant inside a step
is located.

**Terminal surfaces** stop the ball when its contact point enters them (checked every step).

**Integration.** Fixed-step midpoint (RK2), `rollTimestepS = 1 ms` by default. It is exact for
the piecewise-constant accelerations of a ball on a plane. Integration is deterministic, and a
non-finite state throws instead of producing NaN. `startTimeS` must be ≥ 0, because times are
seconds since launch. Samples have phase `"roll"` and absolute times, and the series ends on
the final state. Samples are emitted on the grid `startTimeS + i · outputSampleIntervalS`,
with at most one per integration step. The next grid time is computed in closed form, so an
interval below the timestep, or below one ulp of `t`, cannot stall the loop.

`skidDistanceM` is the horizontal displacement from the start of the roll phase to the onset
of pure rolling. `rollStartPositionM` is the ball centre at that onset, or null if the ball
never stopped slipping.

---

## 5. Stimpmeter relation (`rollingResistanceFromStimp`)

A ball released at `v0` that rolls `d` on a level green at constant deceleration has
`a = v0² / (2 d)`. With the contract definition `c_rr = a / g`:

```
c_rr = v0² / (2 · stimpFt · 0.3048 · g)        g = 9.80665 m/s² (standard gravity)
stimpFt = v0² / (2 · c_rr · g · 0.3048)        (inverse)
```

**Release speed `v0 = 1.83 m/s` (6.00 ft/s)** is `STIMPMETER_RELEASE_SPEED_MPS`. Sources: the
USGA Stimpmeter description (ball released from the notch 30 in from the tapered end when the
bar reaches about 20°) and Penner (2002), "The physics of putting", Can. J. Phys. 80, 83–96.
Both are *secondary sources, not verified on page*. Holmes (1986) is reported to give 72 in/s,
which is the same value. Patents quote 1.94 m/s and 2.41 m/s; these conflict, so the
constant is PROVISIONAL and a parameter of both functions.

At Stimp 10 ft: `c_rr = 1.83² / (2 · 3.048 · 9.80665) = 0.05602`, a deceleration of
0.549 m/s².

*Consistency check (secondary sources, my arithmetic).* Penner reports a green rolling
coefficient range 0.065–0.196, with very fast greens rolling about 12 ft and very slow about
4 ft. If his deceleration is `(5/7) ρ g`, that maps to `c_rr ≈ 0.046–0.140`, or Stimp
≈ 12.1–4.0 ft, which matches his stated end-points. The catalog green (0.056) is inside
that range.

Known approximations: the ball's exit from the V-groove (where it is not in pure roll on the
green) is ignored. Green deceleration is treated as speed-independent; sources conflict on
the sign and size of any speed dependence (§9). The patent relation `g·h = a·d` is **not**
used; it implies an exit speed of about 2.26 m/s, inconsistent with the measured 1.83 m/s.

---

## 6. Ground-motion sequencing (`simulateGroundMotion`)

```
contact ← first contact (from air flight; time ≥ 0)
if contact surface is terminal → end: "terminal-surface", no bounce
loop:
  resolve impact → record BounceEvent (incoming/outgoing v, ω, surface, regime)
  if (v'·n) > minBounceNormalSpeedMps  and  bounces < maxBounces  and  time remains:
      hop(state, t) → samples (tagged "bounce-air" by the caller) + next contact
      hop timing invalid → throw (see below)
      next contact on a terminal surface → end: "terminal-surface"
      hop without contact → end: "max-time" (a hop reporting "numerical-failure" throws)
      hop contact after the time limit → end: "max-time" at the last sample within it
  else:
      roll from the post-impact state with the normal velocity removed → end
```

| Setting (`DEFAULT_GROUND_SETTINGS`) | Value | Basis |
|---|---|---|
| `rollTimestepS` | 0.001 s | Integrator accuracy (exact on planes; < 0.1 mm stopping error). |
| `restSpeedMps` | 0.01 m/s | Below display resolution; the stopping-distance error is v²/(2 c g) < 0.1 mm on a green. |
| `minBounceNormalSpeedMps` | 0.25 m/s (**provisional**) | A hop with this normal speed rises v²/(2g) ≈ 3 mm (~15 % of the radius, below turf blade height) for ~50 ms. A rigid-surface model cannot resolve that meaningfully. |
| `maxBounces` | 20 | Safety bound. On turf and mats (e ≤ 0.6) the threshold is reached in under 10 bounces; a fast, steep landing on the cart path (e ≈ 0.78) needs up to about 17. |
| `slipToRollToleranceMps` | 1e-3 m/s | Numerical tolerance only (the crossing is located exactly). |

**Hop contract.** The `HopSimulator` must return absolute times. `contact.timeS` must be
later than the hop's start time. Sample times must be finite, non-decreasing and inside
`[start, contact.timeS]`; with no contact, they only need to be at or after the start.
Anything else throws a descriptive `Error` and is never silently dropped. Two cases are
tolerated: rounding of up to 1e-9 · max(1, t) s at the window edges, and a sample at an
instant already recorded (the contact instant shared by consecutive segments), which is kept
once. Samples after the ground time limit are cut there.

`maxGroundTimeS` is measured from the first contact. `GroundMotionResult` holds
`modelVersion`, `bounces`, `samples` (hop samples then roll samples, strictly increasing
times), `rollStartPositionM` (onset of pure rolling, after any skid), `restPositionM` (ball
centre), `restTimeS`, `termination` (`rest` | `terminal-surface` | `max-time`) and
`finalSurface`. The result is deep-frozen.

**Distances** (`groundDistances(firstContactM, result)`). These are **signed along-track**
displacements: horizontal displacement projected on the landing heading `û`, the horizontal
direction of `bounces[0].incomingVelocityMps`. If there was no bounce, or the landing was
vertical, `û` is +X (the target line).

- bounce = `(rollStartPositionM − firstContact) · û`. This covers bouncing plus skid,
  matching the "bouncing/sliding until it starts to roll" definition of skid distance.
- roll = `(rest − rollStartPositionM) · û`.
- If the ball never rolled, bounce = `(rest − firstContact) · û` and roll = 0.

So `bounce + roll` is always the net along-track ground displacement. A ball that checks and
spins back gets a **negative** value: for example, a bounce of +1.12 m and a roll of −1.50 m
give a net of −0.38 m. For a shot that lands and runs straight, carry + bounce + roll equals
total. These values are displacements, not path lengths. Sideways ground movement, such as a
kick off a side slope, is excluded; the lateral offset at rest is reported separately.

---

## 7. Illustrative behaviour (model output, NOT data)

Flat terrain, the test ball (k ≈ 0.407), a gravity-only hop, illustrative landing states
(speed @ descent angle, backspin). Ground travel is first contact → rest, in metres.

| Surface | 25 m/s @ 38°, 250 rad/s | 20 m/s @ 48°, 600 rad/s | 18 m/s @ 52°, 800 rad/s |
|---|---|---|---|
| fairway-firm | 101 | 26 | 9 |
| fairway-normal | 73 | 18 | 6 |
| fairway-soft | 51 | 12 | 4 |
| green | 154 | 39 | 14 |
| rough | 25 | 6 | 2 |

These runs are almost certainly **far too long** for the faster, shallower landings (a drive
does not run 70 m on a normal fairway, and a mid-iron does not run 40 m on a green). The cause
is structural, not a parameter typo. A rigid-surface impulse that sticks leaves the ball
rolling at `(v_t − k r Ω)/(1 + k)`, which is roughly 45–65 % of its horizontal landing speed
for these cases (more if it is still sliding). A constant rolling resistance calibrated on slow (Stimp-speed) rolls then lets
that ball run a long way. Real turf removes far more horizontal speed at impact (crater /
pitch-mark deformation) and appears to resist fast-moving balls more. **Total distance from
this model must not be presented as accurate.** Carry does not depend on it.

---

## 8. Tests that pin the model

`packages/terrain-engine/test` and `packages/ground-physics/test` check the following:

- Plane heights, normals and slope.
- The flat-range plane at `−(r + tee)`.
- Region precedence and the even-odd rule.
- Stimp at 10 ft and the round trip.
- Vertical-drop rebound `e·v` (height ratio `e²`).
- A frictionless surface preserves tangential velocity and spin.
- The forward-spin sign and regime classification.
- Backspin spin-back and topspin speed gain.
- Energy, normal-momentum and contact-angular-momentum invariants.
- Flat stopping distance `v²/(2 c g)` within 1 %.
- Skid to `v0/(1 + k)`, with k from the profile.
- Steep-slope roll-away and gentle-slope stop.
- Terminal entry.
- Multi-bounce sequences with decreasing heights.
- Determinism, monotonic sample times and schema validity.
- Signed spin-back distances, where bounce + roll equals the net ground displacement.
- Rejection of hops with relative, backward, zero-length, out-of-window, unordered or
  non-finite times, and of a negative first-contact time.
- A sub-ulp output interval does not hang.
- Normalisation of a non-unit terrain normal, and rejection of a degenerate one.
- Rejection of inherited object keys as surface types.
- Override provenance: type, provisional, terminal and Stimp consistency.
- Firmness ordering of restitution.
- Polygons with 200 000 vertices.

---

## 9. Limitations

- **Rigid-surface impulse.** There is no turf deformation and no pitch-mark / crater model.
  Penner (2002, "The run of a golf ball", reported as eq. 8, p. 934) tilts the impact frame by
  a critical angle `θc = 15.4° × (v_i / 18.6 m/s) × (θ_i / 44.4°)`. This is linear in impact
  speed and in impact angle (a product), and equals 15.4° at his reference impact. His
  restitution is then evaluated at the normal speed in that tilted frame (§2). This is a
  *secondary source, not verified on page*. The form is reported by one secondary citation
  and by three independent code implementations that cite Penner. Penner reportedly fitted it
  to a single measured impact. It should be checked against the paper before it is
  implemented. That model is what lets wedges check and spin back at realistic descent
  angles. Without it, this model needs unrealistically steep landings or high spin to spin a
  ball back, and it over-predicts run (§7).
- **Biber et al. (2023).** They reportedly measured more than 1000 bounces by video on two
  turf samples, described as one artificial and one from a typical tee, so not a green. They
  found that rigid-bounce-with-friction models, including Penner's modification, fit worse
  than an empirical piecewise-affine map. This is a *secondary source, not verified on page*;
  the turf description and the result could not be checked.
- **Parameters not fit to data.** Restitution, friction, rolling resistance, moisture factors
  and the bounce threshold are judgements anchored to a handful of secondary-source numbers.
- **No grain, mowing direction or wet-turf dynamics.** Moisture is a linear scaling of
  restitution and rolling resistance only. There is no plugging, splash, or wet friction.
- **Speed-independent rolling resistance.** Sources conflict: one reports a slightly *larger*
  retarding force at low speed (~10 % over a 14 ft putt), while a patent attributes to Penner
  `ρ = (0.7028/s)(1 + 0.0065 v²)` (ft/s units), which *rises* with speed. Both are
  *secondary sources, not verified on page*.
- **Roll stays on the surface.** Crests do not launch the ball, rolling never reverts to
  sliding, and twist spin about the normal is dropped at roll onset.
- **No hole / cup capture, no flagstick, no tree-canopy collisions, no bunker lip
  geometry** in this version.
- **Total distance is more model-dependent than carry.** Ground results inherit every
  limitation above and should carry wider uncertainty than air results.

---

## 10. Sources and honesty labels

The research proxy blocked page fetches. Every literature figure below comes from search
snippets and is labelled *secondary source, not verified on page*. None has been checked
against the primary text.

- A. R. Penner, "The run of a golf ball", Can. J. Phys. 80, 931–940 (2002),
  doi:10.1139/p02-035. Turf restitution polynomial (in the θc-rotated normal speed) and
  critical-angle model `θc = 15.4° (v/18.6 m/s)(θ/44.4°)`. Both are known only from
  secondary citations and code implementations.
- A. R. Penner, "The physics of putting", Can. J. Phys. 80, 83–96 (2002),
  doi:10.1139/p01-137. Stimp exit speed 1.83 m/s and the green rolling coefficient range.
- USGA, "USGA Introduces Updated Stimpmeter" (2013) and the Stimpmeter description: 6.00 ft/s
  release, 30 in notch, about 20° release angle.
- S. J. Haake, PhD thesis, Aston University (1989): green impact photography and two-layer
  Kelvin–Voigt turf.
- S. W. Biber, K. M. Jones, A. R. Champneys, R. Green, R. Szalai, "Measurements and linearized
  models for golf ball bounce", Sports Engineering (2023), arXiv 2302.02758. One secondary
  bibliography gives this title; a search snippet adds "on a green", which conflicts with its
  own description of the turfs. The exact title is unverified.
- I. Griffiths, R. McKenzie (Swansea), putting-surface friction and skid-to-roll on lab
  surfaces (μ = 0.11–0.40).
- D. G. Alciatore, "TP B-5" (billiards technical proof): skid distance 12 v²/(49 μ g) and
  5/7 v. This is also standard rigid-body mechanics, re-derived in §4.

Well-established mechanics used without literature dependence: the rigid-sphere impulse with
Coulomb friction, the skid-to-roll transition at `v0/(1 + k)`, and rolling down an incline at
`g sin θ/(1 + k)`.
