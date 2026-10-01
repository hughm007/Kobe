# Terrain and ground model

**Versions:** terrain representation and surface catalog `glm-terrain-0.2.0`
(`TERRAIN_MODEL_VERSION`, `@glm/terrain-engine`); bounce / skid / roll model
`glm-ground-0.2.0-provisional` (`GROUND_MODEL_VERSION`, `@glm/ground-physics`).
Changing any equation or default here requires a version bump in the same commit.

> **Status: PROVISIONAL.** Every surface parameter is a model parameter chosen to be
> physically *ordered*, not fit to measurements. Ground results (bounce, roll, total) are
> much less trustworthy than air results (carry). See §9.

**What changed in 0.2.0** (from `glm-ground-0.1.0-provisional` / `glm-terrain-0.1.0`): the
0.1.0 rigid-surface impulse kept 45–65 % of the horizontal landing speed and a constant,
Stimp-calibrated rolling resistance let that ball run, so a 271 yd drive ran 97 yd and a
93 yd knuckleball ran 272 yd (§7.1). 0.2.0 adds Penner's crater tilt of the contact plane
(§3.1), makes `firmness` its physical input (§2), makes rolling resistance speed-dependent
(§4, §5) with the speed term bounded by the sliding friction (a rolling ball never
decelerates faster than a sliding one, §4), and re-grades the catalog's firmness so that
fairways are firmer than greens (§2). What brings the drives into the plausibility envelope is
mainly the extrapolated speed term, not the crater (§7.3 attribution table).

All quantities are SI and use the world frame in [coordinate-system.md](coordinate-system.md):
+X toward the target, +Y to the golfer's left, +Z up; the origin is the ball **centre** at
address. Positions reported by the ground model are ball-centre positions.

Ground behaviour is separate from air flight. Neither package imports `@glm/ballistics`: the
hops between bounces are flown by a `HopSimulator` callback injected by the caller.
`@glm/ground-physics` depends on `@glm/terrain-engine` (the speed coefficient β is shared).

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
`version` is `glm-terrain-0.2.0` and `provisional` is `true` for every row. "crater" is
`craterScale` (§3.1), derived from firmness. `c0` is the **low-speed** rolling-resistance
coefficient (§4). "Stimp-eq." is the Stimpmeter reading that `c0` implies under the 0.2.0
relation (§5); it is shown for comparison only (`stimpFt` is stored only for the green).

| Surface | firmness | crater | e base | e slope (s/m) | e min | μ slide | c0 | Stimp-eq. (ft) | moisture | stimpFt | terminal |
|---|---|---|---|---|---|---|---|---|---|---|---|
| tee | 0.70 | 0.60 | 0.46 | 0.022 | 0.11 | 0.40 | 0.13 | 3.9 | 0 | null | false |
| range-mat | 0.90 | 0.20 | 0.60 | 0.012 | 0.30 | 0.45 | 0.10 | 5.0 | 0 | null | false |
| fairway-firm | 0.85 | 0.30 | 0.52 | 0.020 | 0.15 | 0.40 | 0.09 | 5.6 | 0 | null | false |
| fairway-normal | 0.75 | 0.50 | 0.47 | 0.022 | 0.12 | 0.40 | 0.12 | 4.2 | 0 | null | false |
| fairway-soft | 0.40 | 1.20 | 0.32 | 0.020 | 0.08 | 0.45 | 0.17 | 3.0 | 0 | null | false |
| first-cut | 0.50 | 1.00 | 0.36 | 0.022 | 0.10 | 0.45 | 0.20 | 2.5 | 0 | null | false |
| rough | 0.30 | 1.40 | 0.25 | 0.020 | 0.06 | 0.50 | 0.35 | 1.4 | 0 | null | false |
| bunker | 0.10 | 1.80 | 0.10 | 0.010 | 0.02 | 0.60 | 0.80 | 0.6 | 0 | null | false |
| green | 0.50 | 1.00 | 0.45 | 0.022 | 0.12 | 0.30 | 0.05033 | 10.0 | 0 | 10 | false |
| fringe | 0.50 | 1.00 | 0.40 | 0.022 | 0.11 | 0.35 | 0.11 | 4.6 | 0 | null | false |
| cart-path | 1.00 | 0 | 0.78 | 0.004 | 0.60 | 0.55 | 0.06 | 8.4 | 0 | null | false |
| water | 0 | — | 0 | 0 | 0 | 0 | 0 | — | 1 | null | **true** |
| out-of-bounds | 0.30 | — | 0.25 | 0.020 | 0.06 | 0.50 | 0.35 | 1.4 | 0 | null | **true** |
| trees | 0.45 | 1.10 | 0.35 | 0.020 | 0.08 | 0.50 | 0.25 | 2.0 | 0 | null | false |
| penalty-area | 0.30 | — | 0.25 | 0.020 | 0.06 | 0.50 | 0.35 | 1.4 | 0 | null | **true** |

Changed from 0.1.0: firmness of tee (0.55 → 0.70), range-mat (0.85 → 0.90), fairway-firm
(0.75 → 0.85), fairway-normal (0.60 → 0.75) and green (0.65 → 0.50); restitutionBase of tee
(0.42 → 0.46), fairway-firm (0.50 → 0.52) and fairway-normal (0.42 → 0.47); the green's
`c0` (0.05602 → 0.05033, same 10 ft Stimp under the new relation). The other `c0` values are
unchanged numbers, now read as low-speed coefficients.

**Basis (all provisional):**

- **Firmness → crater.** Since 0.2.0 firmness has a physical role: it sets the crater tilt
  (§3.1) through `craterScale = (1 − firmness) / (1 − 0.5)`. The green (0.5) is the reference
  (`CRATER_REFERENCE_FIRMNESS`), because Penner's crater law was reportedly fitted to an
  impact on "a typical green". The re-grading is a **judgement**: receptive greens are taken
  to deform more under a landing ball than fairways (pitch marks are characteristic of greens),
  and a normal fairway's pitch mark is taken to be about half as steep as a green's
  (`craterScale` 0.5); firm fairways and mats less, the cart path not at all. The 0.5 for the
  normal fairway was **chosen with the plausibility envelope in view** (§7.3): with the 0.1.0
  grading (normal fairway slightly softer than the green, i.e. craterScale 1.14 relative to
  it) a tour 7-iron spun back off the fairway.
- **Restitution** is now evaluated on Penner's tilted-frame normal speed `v′` (§3.1), which is
  the argument of Penner's (2002, "The run of a golf ball", eq. 5) turf fit
  `e = 0.510 − 0.0375 v′ + 0.000903 v′²` (v′ ≤ 20 m/s; 0.120 above) — *secondary source, not
  verified on page*. The green row is a line through that shape. **Re-check in the correct
  frame:** over v′ = 2–20 m/s the catalog line (0.45 − 0.022 v′, floor 0.12) has an rms error of
  0.0136 against the polynomial; the least-squares line with the same floor (0.455, 0.022)
  has 0.0125, so the row is kept. Its largest error is −0.033 at v′ = 2 m/s (0.406 against
  0.439), with a near-equal −0.031 at 15 m/s, where the line reaches the floor early. At
  Penner's reference impact (18.6 m/s at 44.4°, θc = 15.4°)
  `v′` = 16.07 m/s and the catalog gives e = 0.120 against Penner's 0.141.

  | v′ (m/s) | 2 | 5 | 10 | 15 | 16.07 | 20 |
  |---|---|---|---|---|---|---|
  | Penner polynomial | 0.439 | 0.345 | 0.225 | 0.151 | 0.141 | 0.121 |
  | catalog green | 0.406 | 0.340 | 0.230 | 0.120 | 0.120 | 0.120 |

  Because `v′ ≥ |v_n|`, the same rows now give lower restitution for oblique landings than
  in 0.1.0. The first impacts of the fixture drives and 7-irons (v′ = 16.5–21.4 m/s on the
  normal fairway) land on the floor (`e min`); low, shallow landings do not (the knuckleball's
  v′ = 13.9 m/s gives e = 0.163 on the normal fairway), and neither do the later, slower
  bounces.
- **Restitution (other turf rows)** are judgement, ordered by firmness: a firmer playable
  surface never has a lower `restitutionBase` (tested), so the fairways and the tee, now firmer
  than the green, are slightly livelier than it (firm fairway > normal fairway > tee > green).
  Whether real fairways bounce livelier than greens is **not established** here.
- **Cart path.** A golf ball on a rigid surface rebounds far more than on turf; e = 0.78 with
  a small speed slope is a judgement for asphalt/concrete, not a measurement. Firmness 1: no
  crater, so the cart path is exactly the 0.1.0 rigid-surface impact.
- **Range mat.** Livelier than turf (pad over a hard base); a judgement.
- **Sliding friction μ.** Lab putting surfaces measured μ = 0.11–0.40 (Griffiths & McKenzie,
  *secondary source, not verified on page*). Turf values are placed at 0.30 (green) to 0.60
  (sand). A Penner run-model value "about 0.4" circulates but was not found in any source.
- **Low-speed rolling resistance c0** (deceleration / g on flat ground as v → 0). Green from
  the Stimp relation (§5) at 10 ft. Other surfaces are Stimp-equivalent guesses, ordered
  green < cart path < firm fairway < range mat < fringe < normal fairway < tee < soft fairway
  < first cut < trees < rough < bunker. The speed term (§4) applies to every surface with the
  green's β — an extrapolation (§9) — and is bounded by each row's μ (§4).
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

A rigid sphere strikes a rigid plane with Coulomb friction, solved as a single impulse; the
plane is the **crater-tilted** contact plane of §3.1, not the undisturbed surface.

**Notation.** `m` mass, `r = diameter / 2`, `I` moment of inertia, `k = I / (m r²)` (taken from
the ball profile; 0.4 for a uniform solid sphere). `n` = unit outward surface normal (normalised
on input). Incoming velocity `v`, spin `ω` (rad/s, right-hand rule, world frame).

### 3.1 Crater tilt (Penner 2002)

A landing ball presses a pitch mark into the turf and climbs out over its front wall. Penner
("The run of a golf ball", 2002) models this by treating the turf as rigid but tilted through a
critical angle θc, the mean slope of the crater — *secondary source, not verified on page*.
The product form below is supported by one secondary citation and three independent code
implementations that cite Penner, but every search snippet garbled it and the research digest
flags it as an inference that must be checked against the paper before it is relied on.

```
v_n = v · n (< 0),   v_t = v − v_n n,   t̂ = v_t / |v_t|
θ_i = atan2(|v_n|, |v_t|)                                   impact angle below the surface plane
θc  = 15.4° · (|v| / 18.6 m/s) · (θ_i / 44.4°) · craterScale(surface)
θc  ← min(θc, 30°, θ_i, 90° − θ_i)
n'  = cos θc · n − sin θc · t̂                               tilted toward the incoming ball
v'  = |v · n'| = |v_t| sin θc + |v_n| cos θc                 Penner's v'
craterScale = (1 − firmness) / (1 − 0.5)                     1 for the green, 0 for firmness 1
```

At Penner's reference impact (18.6 m/s at 44.4° on the reference green) θc = 15.4° and
v′ = 16.07 m/s. A driver landing at 25 m/s and 37° on the normal fairway gets θc = 8.6°; a
7-iron at 20 m/s and 50° gets θc = 9.3°.

**Clamps (judgement, documented in `crater.ts`).**

- **30° (`CRATER_MAX_ANGLE_DEG`)**, twice the reference angle. The law is a one-point linear
  fit; a "crater" much steeper than that is a buried ball (plugging), which is not modelled.
- **θ_i**: the crater's mean slope never exceeds the path that dug it. At the reference
  θc / θ_i = 0.35; this cap only binds for fast, shallow landings on soft ground.
- **90° − θ_i**: the incidence angle in the tilted frame, θ_i + θc, stays ≤ 90°. Beyond that the
  incoming tangential velocity would reverse (the ball would strike the back of the crater
  wall). It also makes the tilt vanish continuously for a vertical drop (symmetric crater);
  with no tangential velocity there is no tilt direction and θc = 0.
  **Consequence for steep landings.** This clamp binds for θ_i > 90° / (1 + 0.347 (v/18.6 m/s)
  craterScale), about 61° at 25 m/s on the green and 73° on the normal fairway. Above that θc
  *falls* as θ_i rises, so the crater's backward kick shrinks toward the symmetric
  vertical-drop limit and a steeper landing finishes slightly **less** far behind its pitch
  mark (25 m/s, 250 rad/s on the green: −6.7 yd at 65°, −4.2 yd at 85°; tested). "A steeper
  landing runs less" (§7.3) therefore holds only below the clamp. A smooth taper instead of the
  hard `min` would remove the kink but not the trend, which follows from the vertical-drop
  limit.

`craterScale` is linear in `1 − firmness` because that is the simplest monotone map through
the two anchors (1 at the reference green, 0 on a rigid surface). It is a **provisional
judgement**; firmness has no measured stiffness behind it.

### 3.2 Impulse in the tilted frame

```
v_n' = v · n' (< 0),   v_t' = v − v_n' n'
contact point relative to the centre:  −r n'
u    = v_t' + ω × (−r n')        contact-point slip velocity
e    = effectiveRestitution(surface, v')
Jn   = m (1 + e) v'              normal impulse (along n')
J*   = |u| / (1/m + r²/I)        tangential impulse that would stop the slip
Jt   = J*      if J* ≤ μ Jn     → regime "rolling-at-separation"
       μ Jn    otherwise         → regime "sliding"
v_out = v_t' − (Jt/m) û + e v' n'
ω_out = ω + (r Jt / I) (n' × û)  û = u / |u|
```

`J*` follows from requiring the post-impact slip to vanish: an impulse `−J û` at the contact
changes the slip by `−J (1/m + r²/I) û`, using `(n' × û) × n' = û`. Outgoing velocity and spin
are world-frame vectors; the next hop or roll uses the **true** normal `n` (§6).

What the tilt does: v′ > |v_n|, so the normal impulse is larger and the restitution lower;
the larger `Jn` raises the friction limit, so impacts stick more often; the ball leaves along
the tilted plane, i.e. climbing out of the crater (steeper rebound, less horizontal speed);
and the rebound along `n'` has a backward horizontal component `e v′ sin θc`. With strong
backspin and a steep landing the ball can leave backward (it checks at the pitch mark).

**Sign conventions (tested, θc = 0).**

- Ball moving +X with no spin lands on flat ground: `u = +X`, `n × û = Ẑ × X̂ = +Ŷ`, so
  `ω_y > 0` after impact. That is forward roll: the top of the ball moves forward
  (`ω × (r Ẑ)` points +X).
- Backspin is `ω_y < 0` (coordinate-system.md §4.2). The contact point of a backspinning ball
  moves *forward* (`ω × (−r Ẑ)` points +X), which adds to the forward slip. Friction then
  pushes the ball backward harder. Topspin does the reverse and can increase `v'_x`.
- When friction suffices, the ball leaves rolling: `v'_t = (v_t − k r Ω)/(1 + k)` for backspin
  `Ω` about the rolling axis. For no spin this is `v_t / (1 + k)`.

**Invariants (tested on 2000 random impacts on every playable catalog surface, crater on).**
They are the 0.1.0 invariants re-derived for the tilted frame:

- Kinetic + rotational energy never increases (the impulse algebra is dissipative whatever
  the plane's orientation).
- The speed along `n'` is reversed and scaled by `e ≤ 1`: `v_out · n' = e v′ ≥ 0`. Along the
  **true** normal neither "≥ 0" nor "≤ |v_n|" holds any more: the ball climbs out of the crater
  (it can leave faster along `n` than it arrived) or comes back out of it.
- Angular momentum about the contact point `−r n'` (`m r n' × v + I ω`) is conserved exactly,
  because every impulse acts at that point.
- `Jt ≤ μ Jn`; `v′ ≥ |v_n|` (guaranteed by the 90° − θ_i clamp); `n'` is a unit vector in the
  plane of `n` and `v`, with `n' · n = cos θc`, leaning against `v_t`.
- A ball whose velocity is already separating from the true surface (`v · n ≥ 0`) is returned
  unchanged (θc = 0).
- **Rigid limit.** For firmness 1 (craterScale 0), `n' = n` and the result is bit-for-bit the
  0.1.0 impact (tested against a verbatim copy of the 0.1.0 algebra on 500 random impacts).

`ImpactResult` reports `impactAngleRad`, `craterAngleRad`, `effectiveNormal`,
`normalImpactSpeedMps` (true normal), `effectiveNormalImpactSpeedMps` (v′), `restitution`,
the impulses and the regime.

### 3.3 Effective restitution and moisture

`effectiveRestitution(surface, v′)`, `effectiveRollingResistance(surface)`:

```
e_dry = clamp(restitutionBase − restitutionSpeedSlope · v′, restitutionMin, restitutionBase)
e     = e_dry · (1 − 0.3 · moistureSoftness)
c0_eff = rollingResistance · (1 + 0.5 · moistureSoftness)
```

The moisture factors (`MOISTURE_RESTITUTION_REDUCTION = 0.3`,
`MOISTURE_ROLLING_RESISTANCE_GAIN = 0.5`) are provisional judgements: a saturated surface
returns 30 % less normal speed and has 1.5× the low-speed rolling deceleration. Sliding
friction and the crater size are unchanged by moisture. Stimp and `rollingResistance` are
dry reference values. If a Stimp reading was taken under the current wet conditions,
applying `moistureSoftness` as well double-counts the moisture effect on rolling.

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
`k r Ω > v`.

Rolling resistance is **not** applied while sliding. In the contact-pressure picture used for
the bound below, rolling resistance is the moment of the contact pressure acting ahead of the
centre: on a sliding ball it does not change the translational deceleration (`μ g_n`,
Coulomb), but it slows the spin-up and so delays roll onset. Leaving it out makes the run
somewhat **longer** than the fully consistent version of that picture (see "Model uncertainty"
below).

**Rolling phase — speed-dependent resistance (new in 0.2.0).** The spin is tied to the
velocity, `ω = (n × v) / r`. Twist about the normal is discarded because no pivot-friction
model exists, and it does not affect the path.

```
dv/dt = g_t / (1 + k) − c(|v|) g_n v̂
c(v)  = min(c0 (1 + β v²), max(c0, μ))         β = ROLLING_RESISTANCE_BETA_S2_PER_M2 = 0.06997 s²/m²
```

`c0` is `SurfaceProperties.rollingResistance` (with moisture), the low-speed coefficient; `μ`
is `slidingFriction`. β is one exported constant in `@glm/terrain-engine`, shared with the
Stimp relation (§5); its basis and unit are discussed in §5. `c(v)` is
`rollingDecelerationCoefficient` in `@glm/terrain-engine`.

**The μ bound (mechanics, not a fit).** With rolling resistance as the moment of the contact
pressure acting ahead of the centre (the usual picture on a deformable surface), the only
force that decelerates a rolling ball on level ground is contact friction, and Coulomb's law
bounds it at `μ m g_n`. A ball asked to decelerate harder slips, and a slipping ball
decelerates at exactly `μ g_n`. So a rolling ball can never decelerate faster than a sliding
one. Unbounded, β broke that: on the normal fairway the rolling deceleration passed `μ g` at
5.8 m/s, and at the fixtures' roll-phase starts (§7.3) `1 + β v²` reached ×7.7 (straight
driver, 9.8 m/s) and ×20 (knuckleball, 16.5 m/s), 2.4 g. The bound applies above
`v_b = √((μ/c0 − 1)/β)` (`rollingResistanceBoundSpeedMps`) and caps the multiplier at `μ/c0`:

| Surface | c0 | μ | v_b (m/s) | max multiplier μ/c0 |
|---|---|---|---|---|
| green | 0.0503 | 0.30 | 8.42 | 5.96 |
| fairway-firm | 0.09 | 0.40 | 7.02 | 4.44 |
| fairway-normal | 0.12 | 0.40 | 5.77 | 3.33 |
| tee | 0.13 | 0.40 | 5.45 | 3.08 |
| fairway-soft | 0.17 | 0.45 | 4.85 | 2.65 |
| rough | 0.35 | 0.50 | 2.47 | 1.43 |
| cart-path | 0.06 | 0.55 | 10.80 | 9.17 |
| bunker | 0.80 | 0.60 | 0 | 1 (c0 ≥ μ: constant c0) |

A surface whose low-speed `c0` already reaches `μ` (the bunker's sand-ploughing guess) keeps
`c0` at every speed, so `c0`, the Stimp relation and the rest thresholds are unchanged. On a
slope the bound uses `μ g_n` alone and ignores the slope's share of the friction demand.

On flat ground the ball rolling at `v0` stops after (`flatRollingDistanceM(c0, v0, g, μ)`)

```
v0 ≤ v_b:  d = ln(1 + β v0²) / (2 c0 g β)                                  (→ v0² / (2 c0 g) as β v0² → 0)
           t = atan(√β v0) / (c0 g √β)
v0 > v_b:  d = (v0² − v_b²) / (2 μ* g) + ln(1 + β v_b²) / (2 c0 g β)        μ* = max(c0, μ)
           t = (v0 − v_b) / (μ* g) + atan(√β v_b) / (c0 g √β)
```

At putting speeds the speed term is small (+23 % deceleration at the 1.83 m/s Stimp release).
At fairway roll speeds it dominates: ×2.75 at 5 m/s on the normal fairway, and from 5.8 m/s the
bound (×3.33). A ball rolling at 8 m/s on the normal fairway stops after 11.2 m, 41 % of the
constant-resistance 27.2 m (unbounded: 10.3 m).

**Model uncertainty: the resistance torque while slipping.** The bound is the exact
translational motion of the contact-pressure picture only while it is active. That picture,
applied consistently, would also keep the ball slipping (decelerating at `μ g_n`) after `c(v)`
drops below `μ`, until its spin catches up, and would apply the same torque during the
initial skid. A 1-D calculation of that version (normal fairway, k = 0.4, not the integrator)
from the fixtures' roll-phase starts (all already rolling, §7.3) gives runs shorter by about
3.3 yd (straight driver, 9.8 m/s), 2.6 yd (fade, 9.1 m/s), 0.6 yd (low 7-iron, 7.4 m/s) and
3.4 yd (knuckleball, 16.5 m/s). 0.2.0 keeps the simpler bound; the difference is a stated
model uncertainty (§9). While the bound is active the ball is reported as rolling
(`ω = (n × v) / r`) although that picture would have it slipping; its path is the same, its
reported spin is not.

At (near) zero speed the resistance opposes the slope pull up to its static limit `c0 g_n`.
Once rolling, the ball never returns to sliding. That transition would need
`tan θ > μ (1 + k)/k`, about 46° for μ = 0.3.

**Rest.** The ball is at rest when `speed < restSpeedMps` **and** the slope cannot overcome
the static resistance, `|g_t| / (1 + k) ≤ c0 g_n`. On the 10 ft green (c0 = 0.0503,
k ≈ 0.4) that threshold is a slope of about 4.0°. On steeper slopes the ball keeps rolling
downhill. When the slope cannot overcome resistance, the stopping instant inside a step is
located (exact for constant deceleration; the speed term is below 1e-6 at the speeds
involved).

**Terminal surfaces** stop the ball when its contact point enters them (checked every step).

**Integration.** Fixed-step midpoint (RK2), `rollTimestepS = 1 ms` by default. It is exact for
the piecewise-constant sliding accelerations on a plane and second-order accurate for the
speed-dependent rolling deceleration: rolling stops within about 1e-4 (relative) of the
closed form, bounded or not (tested to 0.1 %). Integration is deterministic, and a non-finite
state throws instead of producing NaN. `startTimeS` must be ≥ 0, because times are seconds since launch. Samples have
phase `"roll"` and absolute times, and the series ends on the final state. Samples are emitted
on the grid `startTimeS + i · outputSampleIntervalS`, with at most one per integration step.
The next grid time is computed in closed form, so an interval below the timestep, or below
one ulp of `t`, cannot stall the loop.

`skidDistanceM` is the horizontal displacement from the start of the roll phase to the onset
of pure rolling. `rollStartPositionM` is the ball centre at that onset, or null if the ball
never stopped slipping.

---

## 5. Stimpmeter relation (`rollingResistanceFromStimp`)

A ball leaving the Stimpmeter rolling at `v0` and stopping after `d = stimpFt · 0.3048 m` on a
level green under the §4 deceleration `a(v) = c0 g (1 + β v²)` gives

```
c0      = ln(1 + β v0²) / (2 g β d)                 g = 9.80665 m/s² (standard gravity)
stimpFt = ln(1 + β v0²) / (2 c0 g β) / 0.3048       (inverse; = flatRollingDistanceM(c0, v0) / 0.3048)
```

At Stimp 10 ft: `c0 = ln(1 + 0.06997 · 1.83²) / (2 · 9.80665 · 0.06997 · 3.048) = 0.05033`
(0.1.0: 0.05602 from `v0² / (2 d g)`; the ball now decelerates harder while fast, so the
low-speed coefficient that rolls the same 10 ft is 10 % smaller). A simulated Stimp roll
reproduces the reading within 1 % (tested at 8, 10 and 13 ft; the actual error is ~3e-5).
The μ bound of §4 binds only above 8.4 m/s on the green, far above the release speed, so it
does not enter the Stimp relation.

**β and its unit.** A US patent family (7713148 / 8444149 / 8757625) attributes to Penner (2002)
the green rolling-friction relation `ρ = (0.7028 / s)(1 + 0.0065 v²)`, s = Stimp reading in
feet — *secondary source, not verified on page; not traced to the paper*. The relation is
self-consistent **only with v in ft/s**: with deceleration `(5/7) ρ g`, g = 32.17 ft/s² and the
6 ft/s Stimp release it reproduces a roll distance of exactly s (to 0.2 %), and its
constant-ρ equivalents at 12 ft and 4 ft are 0.065 and 0.196, Penner's quoted range. Read with
v in m/s it misses the Stimp definition by 10 %. So β = 0.0065 s²/ft² = **0.06997 s²/m²**
(`PENNER_ROLLING_BETA_S2_PER_FT2`, `ROLLING_RESISTANCE_BETA_S2_PER_M2`; the unit check is a
test). This is a **unit inference from internal consistency**, not a reading of the source.

**Release speed `v0 = 1.83 m/s` (6.00 ft/s)** is `STIMPMETER_RELEASE_SPEED_MPS`. Sources: the
USGA Stimpmeter description (ball released from the notch 30 in from the tapered end when the
bar reaches about 20°) and Penner (2002), "The physics of putting", Can. J. Phys. 80, 83–96.
Both are *secondary sources, not verified on page*. Holmes (1986) is reported to give 72 in/s,
which is the same value. Patents quote 1.94 m/s and 2.41 m/s; these conflict, so the
constant is PROVISIONAL and a parameter of both functions.

Known approximations: the ball's exit from the V-groove (where it is not in pure roll on the
green) is ignored. One source reports the opposite speed dependence (a slightly *larger*
retarding force at low speed, ~10 % over a 14 ft putt); 0.2.0 follows the Penner-attributed
relation. The patent relation `g·h = a·d` is **not** used; it implies an exit speed of about
2.26 m/s, inconsistent with the measured 1.83 m/s.

---

## 6. Ground-motion sequencing (`simulateGroundMotion`)

```
contact ← first contact (from air flight; time ≥ 0)
if contact surface is terminal → end: "terminal-surface", no bounce
loop:
  resolve impact (crater-tilted plane, §3) → record BounceEvent (incoming/outgoing v, ω, surface, regime)
  if (v_out · n) > minBounceNormalSpeedMps  and  bounces < maxBounces  and  time remains:   (n = TRUE normal)
      hop(state, t) → samples (tagged "bounce-air" by the caller) + next contact
      hop timing invalid → throw (see below)
      next contact on a terminal surface → end: "terminal-surface"
      hop without contact → end: "max-time" (a hop reporting "numerical-failure" throws)
      hop contact after the time limit → end: "max-time" at the last sample within it
  else:
      roll from the post-impact state with the (true-)normal velocity removed → end
```

The crater is local to the impact, so the hop decision, the hop and the roll all use the
**true** surface normal. After a hard check the outgoing velocity can point slightly *into* the
true surface (`v_out · n < 0`: the ball comes back out of the pitch mark down its back wall);
the ball then rolls with that component removed.

| Setting (`DEFAULT_GROUND_SETTINGS`) | Value | Basis |
|---|---|---|
| `rollTimestepS` | 0.001 s | Integrator accuracy (sliding exact on planes; rolling stops within about 1e-4 of the closed form, §4). |
| `restSpeedMps` | 0.01 m/s | Below display resolution; the stopping-distance error is about v²/(2 c0 g) ≈ 0.1 mm on a green. |
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

## 7. Illustrative behaviour and plausibility envelope (model output, NOT data)

### 7.1 Fixture shots through the full stack

`npm run datasets:generate`: synthetic sensor → launch-state fit → air flight → ground, on the
default flat `fairway-normal` range; values from the golden file
`datasets/golden-tests/range-fixtures.golden.json`. Yards; ground = total − carry.

| Fixture | carry | total 0.1.0 | ground 0.1.0 | total 0.2.0 | ground 0.2.0 |
|---|---|---|---|---|---|
| straight-driver | 270.9 | 368.1 | 97.2 | 307.5 | 36.6 |
| draw-driver | 267.1 | 367.1 | 99.9 | 304.6 | 37.5 |
| fade-driver | 265.8 | 354.1 | 88.3 | 299.2 | 33.4 |
| high-7-iron | 158.5 | 171.4 | 12.9 | 160.2 | 1.7 |
| low-7-iron | 181.9 | 230.3 | 48.3 | 202.7 | 20.7 |
| standard-7-iron | 171.4 | 193.1 | 21.7 | 179.2 | 7.8 |
| no-spin-knuckleball | 93.4 | 365.9 | 272.5 | 176.8 | 83.4 |

Carry is unchanged (the air model is untouched). The driver now leaves its first impact at
about 12.0 m/s horizontal and 4.6 m/s vertical (0.1.0: 15.0 and 2.1) and bounces 6 times.
Every fixture ends its last bounce already rolling (`rolling-at-separation`), so the roll
phase starts with no skid, at 9.8 / 9.9 / 9.1 m/s (straight / draw / fade driver), 1.1 / 7.4 /
3.3 m/s (high / low / standard 7-iron) and 16.5 m/s (knuckleball).

### 7.2 Isolated ground model

Flat terrain, the test ball (k ≈ 0.407), a gravity-only hop (no drag, so hops run longer
than in the full stack), illustrative landing states (speed @ descent angle, backspin). Ground
travel first contact → rest, metres; 0.1.0 in parentheses. Negative = the ball finished behind
its pitch mark.

| Surface | 25 m/s @ 38°, 250 rad/s | 20 m/s @ 48°, 600 rad/s | 18 m/s @ 52°, 800 rad/s |
|---|---|---|---|
| fairway-firm | 41.1 (101) | 13.5 (26) | 3.9 (9) |
| fairway-normal | 32.2 (73) | 7.7 (18) | 1.4 (6) |
| fairway-soft | 15.3 (51) | 0.5 (12) | −1.0 (4) |
| green | 36.8 (154) | 3.0 (39) | −1.0 (14) |
| rough | 9.3 (25) | 0.0 (6) | −0.6 (2) |
| tee | 30.1 | 6.2 | 0.7 |
| first-cut | 19.1 | 1.6 | −0.5 |
| fringe | 24.0 | 2.0 | −0.7 |
| bunker | 4.2 | 0.0 | −0.6 |
| range-mat | 61.1 | 21.1 | 6.7 |
| cart-path (rigid) | 143.0 | 65.7 | 30.6 |

The cart path has no crater, so it keeps the 0.1.0 impact and only gains the speed-dependent
roll: a kick off a path still runs a very long way. A high-spin wedge checks on the green and
on soft turf and finishes about a metre behind its pitch mark. On a firmer green a
steep, high-spin wedge first bounces forward and then runs back (tested), the behaviour
Penner reportedly describes for firm greens.

### 7.3 Plausibility envelope (a sanity check, NOT validation)

**Honesty caveat.** The targets below are **common knowledge, not a sourced dataset**: tour
drives are commonly quoted as running about 20–30 yd beyond tour-average carry on firm
fairways, and high-spin mid and short irons stop within a few yards. The **same targets were
used to choose parameters** (above all the normal fairway's crater size, §2), so agreement is
**not evidence of accuracy**. The envelope only guards against regressions to implausible
ground behaviour.

| Shot (flat `fairway-normal`) | target ground travel | full stack (fixture, §7.1) | isolated model (test state) |
|---|---|---|---|
| straight driver | 10–40 yd | 36.6 yd | 36.4 yd (25 m/s @ 37°, 250 rad/s) |
| draw / fade driver | similar | 37.5 / 33.4 yd | 36.5 / 33.3 yd |
| standard 7-iron | 0–10 yd | 7.8 yd | 6.9 yd (20 m/s @ 50°, 600 rad/s) |
| high 7-iron | 0–6 yd (no spin-back) | 1.7 yd | 1.5 yd (21 m/s @ 56°, 700 rad/s) |
| low 7-iron | 3–25 yd | 20.7 yd | 20.4 yd (21 m/s @ 38°, 470 rad/s) |
| no-spin knuckleball | finite, < 2 × carry (93 yd) | 83.4 yd | 159.2 yd (36 m/s @ 17°, gravity-only hops) |

Pinned by `packages/ground-physics/test/plausibility-envelope.test.ts` (isolated model) and,
indirectly, by the golden file. The drivers sit near the top of their band. The isolated
knuckleball runs almost twice as far as the full-stack one because its gravity-only hops have
no air drag, which matters for a ball that skips at 15–25 m/s (see "firmness alone" below).

**Attribution (what brings the shots into the envelope).** Full-stack fixture landings, the real
flight hop, ground travel in yards on the normal fairway, one ingredient changed at a time
(computed with a scratch script, not a test; rows differ from total − carry by ≤ 0.1 yd of
rounding):

| Variant | straight | draw | fade | std 7-i | high 7-i | low 7-i | knuckle |
|---|---|---|---|---|---|---|---|
| **0.2.0** (crater + β, bounded by μ) | 36.6 | 37.5 | 33.4 | 7.8 | 1.7 | 20.7 | 83.4 |
| crater off (firmness 1 on the row) | 38.8 | 39.8 | 36.1 | 13.1 | 9.5 | 23.4 | 98.6 |
| β off (constant c0) | 64.6 | 66.3 | 57.4 | 9.2 | 1.7 | 35.1 | 169.1 |
| β read literally as 0.0065 s²/m² | 54.6 | 55.9 | 49.5 | 9.0 | 1.7 | 31.5 | 114.9 |
| no μ bound (first 0.2.0 draft) | 33.5 | 34.1 | 31.2 | 7.8 | 1.7 | 20.2 | 61.8 |
| crater off and β off (0.1.0 physics, 0.2.0 catalog) | 96.9 | 99.7 | 88.2 | 21.9 | 13.0 | 48.5 | 257.3 |

- **The drivers reach the envelope only through β.** With constant rolling resistance they
  run 57–66 yd; read literally (no unit conversion) β leaves them at about 50–56 yd. β is a
  putting-green relation (reported, secondary; unit inferred, §5) extrapolated to fairway
  speeds and bounded by μ (§4). β was **not** chosen from the envelope (its unit follows from the §5 consistency
  check, the bound from mechanics), but nothing measured supports it at these speeds.
- **The crater shortens every fixture, drives only a little.** Turning it off adds 2.2–2.7 yd
  to the drives, 2.7–7.8 yd to the irons and 15 yd to the knuckleball. The irons' stopping
  behaviour is where the crater matters.
- **The μ bound lengthens fast rolls.** Without it (first 0.2.0 draft) a rolling ball
  decelerated up to 2.4 g, far harder than a sliding one; with it the drives gain 2.2–3.4 yd and
  the knuckleball 21.6 yd. Before the bound, turning the crater *off* shortened the drives
  (33.5 → 26.8 yd) and the knuckleball (61.8 → 49.6 yd): the crater's higher hops escaped the
  inflated rolling deceleration. With the bound the crater acts in the physical direction for
  every fixture.
- With the 0.1.0 firmness grading (fairway softer than the green) the crater made a tour
  7-iron spin back off a normal fairway (−0.4 yd; high 7-iron −5.2 yd; the same with or
  without the μ bound). Re-grading fairways as firmer than greens (§2) is what keeps irons at
  or ahead of their pitch mark; that is a judgement made with this envelope in view.
- The high 7-iron sits only ~1.5 yd ahead of its pitch mark: small changes in landing spin or
  angle move it to zero. That margin is model behaviour, not a measured fact.

**Physical directions** (pinned by the same test file, isolated model): a steeper landing (below
the 90° − θ_i clamp, §3.1), more backspin, an uphill slope (4° downhill > flat > 3° uphill >
6° uphill) and a softer catalog row (soft < normal < firm fairway; rough < normal) each give
less ground travel. The catalog rows differ in `c0`, restitution and μ as well as firmness, so
that comparison does not isolate the crater.

**Firmness alone** (the normal-fairway row with only `firmness` overridden, i.e. only the
crater size changes). Ground travel in yards:

| firmness (craterScale) | 0.3 (1.4) | 0.5 (1.0) | 0.6 (0.8) | 0.7 (0.6) | 0.75 (0.5) | 0.8 (0.4) | 0.9 (0.2) | 1.0 (0) |
|---|---|---|---|---|---|---|---|---|
| full stack: straight driver | 16.0 | 28.1 | 32.6 | 35.9 | 36.6 | 37.6 | 38.4 | 38.8 |
| full stack: fade driver | 11.1 | 23.8 | 28.7 | 32.4 | 33.4 | 34.5 | 35.6 | 36.1 |
| full stack: standard 7-iron | −2.6 | 0.3 | 2.8 | 6.2 | 7.8 | 9.4 | 11.8 | 13.1 |
| full stack: high 7-iron | −6.1 | −3.7 | −1.2 | 0.4 | 1.7 | 3.3 | 6.7 | 9.5 |
| full stack: low 7-iron | 10.3 | 16.7 | 18.9 | 20.5 | 20.7 | 21.4 | 22.8 | 23.4 |
| full stack: **knuckleball** | 79.8 | 84.0 | 83.9 | 83.3 | 83.4 | 83.7 | 85.8 | 98.6 |
| isolated (drag-free hops): driver | 19.1 | 30.2 | 33.8 | 36.3 | 36.4 | 36.8 | 35.8 | 35.4 |
| isolated (drag-free hops): **knuckleball** | 209.5 | 244.0 | 218.2 | 175.6 | 159.2 | 146.8 | 127.8 | 130.0 |

(Draw driver as straight, +0.7 to +1.0 yd. Full stack via a scratch script; isolated pinned by
the test.) In the full stack a softer surface gives less ground travel for every driver and
iron fixture over the whole range. It does **not** hold as a general model property:

- **Skipping landings flatten or reverse it.** A fast, shallow, spinless landing leaves its first impact
  rolling and then skips: at each grazing impact the tilted plane redirects the tangential
  speed upward almost without loss (only the speed along `n'` is reduced by `e`), so the
  crater's "ramp" keeps the hops alive. In the full stack, air drag on those hops roughly
  cancels the crater's speed loss (knuckleball flat at 83–84 yd for firmness 0.5–0.8, only
  the extremes in the physical order). With drag-free hops a softer surface makes the
  knuckleball run **farther** (244 yd at firmness 0.5 vs 130 yd rigid); the test pins this as a
  known limitation (§9).
- **Drag-free drives flatten above firmness 0.8** (36.8 → 35.4 yd rigid): without drag the
  crater's higher hops cost nothing in the air.
- The crater's ramp effect is part of Penner's model (it is what gives the steeper rebound),
  but the law was fitted to one steep impact and is extrapolated here to repeated grazing
  impacts, where no ploughing loss limits it.

---

## 8. Tests that pin the model

`packages/terrain-engine/test` and `packages/ground-physics/test` check the following:

- Plane heights, normals and slope; the flat-range plane at `−(r + tee)`; region precedence
  and the even-odd rule; polygons with 200 000 vertices.
- Stimp: the closed form at 10 ft (c0 = 0.05033), the round trip, Stimp distance = closed-form
  rolling distance, the β unit (the reported relation reproduces the Stimp definition only in
  ft/s), and a simulated Stimp roll within 1 % at 8, 10 and 13 ft.
- μ bound: `rollingDecelerationCoefficient` = min(c0 (1 + β v²), max(c0, μ)), the bound speeds
  (5.77 m/s normal fairway, 8.42 m/s green, 0 for c0 ≥ μ), the bounded closed-form distance and
  its continuity at the bound speed.
- Catalog: schema, versions, terminal rows, ordering, firmness grading (green = crater
  reference, fairways firmer), firmness ordering of restitution, override provenance, Stimp
  consistency, rejection of inherited object keys.
- Crater: `craterScale` anchors and monotonicity, θc = 15.4° at Penner's reference, linearity,
  every clamp, zero tilt for rigid / vertical / zero-speed impacts; v′ = 16.07 m/s and the tilt
  direction at the reference impact.
- Rigid limit: firmness 1 reproduces the 0.1.0 impact bit-for-bit (500 random impacts).
- Impulse algebra on a rigid surface: vertical drop `e·v`, frictionless, forward-spin sign and
  regime, low-friction sliding, backspin spin-back and topspin speed gain, sloped normal.
- Invariants with the crater on (2000 random impacts): energy, tilted-frame restitution,
  angular momentum about `−r n'`, `Jt ≤ μ Jn`, clamp bounds, geometry of `n'`, v′ ≥ |v_n|.
- Roll: flat stopping distance and time from the bounded closed form (0.1 %, 1–12 m/s on
  green, normal fairway and rough), a rolling deceleration of exactly μ g above the bound and
  c0 (1 + β v²) g below it, skid to `v0/(1 + k)`,
  8° roll-away against the tanh solution, 1° downhill stop against its closed form, terminal
  entry, determinism, sample timing, sub-ulp output interval, normal normalisation.
- Ground motion: multi-bounce sequences with decreasing heights, determinism, schema validity,
  hop-contract rejections, signed spin-back distances (rigid green; firm vs reference green).
- Plausibility envelope and physical directions (§7.3), including firmness alone (drivers and
  irons, firmness 0.3–0.8; irons to 1.0) and, as **known limitations**, the drag-free
  knuckleball's reversed firmness response, the flat drag-free driver above firmness 0.8 and the
  steep-landing reversal beyond the 90° − θ_i clamp.

---

## 9. Limitations

- **The crater is a tilted rigid plane, not turf.** Penner's critical-angle law is a linear
  fit through **one** measured impact (18.6 m/s, 44.4°, on a green from Haake's data), known here
  only from secondary sources; its exact form was not verified on the page. It is extrapolated
  to drives (25–36 m/s), steep wedges and every surface. The 30°, θ_i and 90° − θ_i clamps are
  judgements. There is no crater depth, no energy spent ploughing, no rim the ball must clear.
- **Firmness alone is not monotone for skipping balls.** On repeated grazing impacts the
  tilted plane redirects the tangential speed upward almost without loss, so a fast, shallow,
  spinless landing keeps skipping; with drag-free hops a softer surface then runs much farther
  (§7.3), and in the full stack the knuckleball is flat at 83–84 yd for firmness 0.5–0.8.
  "Softer → less" holds in the full stack for the driver and iron fixtures only. A ploughing
  loss would be needed to fix this; there is no data to size it.
- **Steep landings.** Above the 90° − θ_i clamp (~61° at 25 m/s on the green) a steeper landing
  finishes less far behind its pitch mark (§3.1).
- **Firmness is not measured.** `craterScale = 2 (1 − firmness)` and the catalog firmness
  values are judgements; the claim that fairways deform less than greens is common-knowledge
  reasoning, not data, and was made with the §7.3 envelope in view.
- **No plugging.** A ball that would bury (soft rough, bunker, wet turf) is still bounced
  off a tilted plane; the 30° cap is where that picture stops being meaningful.
- **No moisture dynamics.** Moisture scales restitution and low-speed rolling resistance
  linearly; it does not deepen the crater, change friction, or cause splash.
- **No grass layer.** Long grass between ball and soil (first cut, rough, fliers) reduces
  friction and spin in reality; here first cut and rough behave like softer soil, so a
  high-spin iron can check in the rough.
- **Speed-dependent roll is extrapolated, and the drives depend on it.** β comes from a green
  relation reportedly fitted at putting speeds (≤ ~2 m/s); 0.2.0 applies it to every surface
  and to roll speeds up to 16.5 m/s. Unbounded, `1 + β v²` would reach ×7.7 at the straight
  driver's 9.8 m/s roll-phase start and ×20 at the knuckleball's 16.5 m/s; the μ bound caps it
  at μ/c0 (×3.33 on the normal fairway, reached at 5.8 m/s; §4). Without β the drives run
  57–66 yd instead of 33–38 yd (§7.3), so their totals rest on this extrapolation. Its unit is
  inferred from internal consistency (§5). Another source reports the opposite trend at
  putting speeds.
- **The μ bound is approximate.** It is the exact translational motion of the contact-pressure
  picture only while it is active; applying that picture's resistance torque consistently
  (during the skid and while the spin catches up after the bound releases) would shorten the
  fixture runs by up to about 3.4 yd (§4). On a slope the bound ignores the slope's share of
  the friction demand.
- **No grain or mowing direction.** Green speed is isotropic.
- **Biber et al. (2023)** reportedly measured more than 1000 bounces by video on two turf
  samples (described as one artificial and one from a typical tee, so not a green) and found
  rigid-bounce-with-friction models, including Penner's modification, fit worse than an
  empirical piecewise-affine map — *secondary source, not verified on page*. The crater model
  is therefore a structurally better-motivated rigid model, not a validated one.
- **No real turf data.** Restitution, friction, rolling resistance, crater size, moisture
  factors and the bounce threshold are judgements anchored to a handful of secondary-source
  numbers. Nothing here was fitted to measured ball bounces or rolls.
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

| Source | Used for | Label |
|---|---|---|
| A. R. Penner, "The run of a golf ball", Can. J. Phys. 80, 931–940 (2002), doi:10.1139/p02-035 | Crater (critical-angle) law `θc = 15.4° (v/18.6 m/s)(θ/44.4°)`, the tilted-frame speed v′, the turf restitution polynomial in v′, the reference impact | *secondary source, not verified on page*; the law's exact form is inferred from secondary citations and three code implementations |
| A. R. Penner, "The physics of putting", Can. J. Phys. 80, 83–96 (2002), doi:10.1139/p01-137 | Stimp exit speed 1.83 m/s; green ρ range 0.065–0.196 (used in the β unit check) | *secondary source, not verified on page* |
| US patents 7713148 / 8444149 / 8757625 (citing Penner 2002) | `ρ = (0.7028/s)(1 + 0.0065 v²)` → β | *secondary source, not verified on page; not traced to Penner*; unit (ft/s) inferred from internal consistency (§5) |
| USGA, "USGA Introduces Updated Stimpmeter" (2013) and the Stimpmeter description | 6.00 ft/s release, 30 in notch, about 20° release angle | *secondary source, not verified on page* |
| S. J. Haake, PhD thesis, Aston University (1989) | Origin of Penner's reference impact; two green types (topspin vs retained backspin) | *secondary source, not verified on page* |
| S. W. Biber, K. M. Jones, A. R. Champneys, R. Green, R. Szalai, Sports Engineering (2023), arXiv 2302.02758 | Limitation: rigid-plus-friction models (incl. Penner's) fit measured bounces worse than an empirical map | *secondary source, not verified on page*; exact title unverified |
| S. W. Biber, A. R. Champneys, R. Szalai, IMA J. Appl. Math. 88(3) (2023), arXiv 2208.11685 | Describes Penner's tilt as a modification for elasto-plasticity | *secondary source, not verified on page* |
| I. Griffiths, R. McKenzie (Swansea) | Putting-surface friction μ = 0.11–0.40 and skid-to-roll | *secondary source, not verified on page* |
| D. G. Alciatore, "TP B-5" (billiards technical proof) | Skid distance 12 v²/(49 μ g) and 5/7 v | standard rigid-body mechanics, re-derived in §4 |
| Coulomb friction with rolling resistance as a contact-pressure moment | The μ bound on the rolling deceleration (§4) | standard rigid-body mechanics, no literature dependence; the pressure-moment picture is a modelling choice |
| Common knowledge (no source) | §7.3 envelope targets: tour drives run ~20–30 yd past carry on firm fairways; high-spin irons stop within a few yards; pitch marks are characteristic of greens | **not a sourced dataset**; used to choose parameters |

Well-established mechanics used without literature dependence: the rigid-sphere impulse with
Coulomb friction (in any plane orientation), the skid-to-roll transition at `v0/(1 + k)`,
rolling down an incline at `g sin θ/(1 + k)`, the Coulomb bound `|a| ≤ μ g_n` on a rolling
ball decelerated by contact friction alone, and the closed-form integrals of
`dv/dt = −(A + B v²)` used for the rolling distance, time and the slope tests.
