# Putting model

**Document date:** 2026-10-01. Status words are defined in
[product-requirements.md §1](product-requirements.md#1-status-vocabulary).

> **Status: Planned (Phase 6) — not implemented.** There is no putting mode in this build:
> - no putting capture profile and no putt launch fit;
> - no green height map, no cup, no hole capture;
> - no putting metrics.
>
> This document records what already exists that a putting model would build on (§1), and the
> planned model (§2). Every literature value here is a *secondary source, not verified on page*:
> the research proxy blocked page fetches. Nothing is **VERIFIED** against real measurements.

Frames and signs follow [coordinate-system.md](coordinate-system.md). Ground behavior in
detail is in [terrain-model.md](terrain-model.md), which describes the version in use: ground
model v0.2 (`glm-ground-0.2.0-provisional`: crater impact and speed-dependent rolling
resistance). **Roll, total and every ground number below are provisional and
model-dependent**; terrain-model.md is the authority.

---

## 1. What exists today

### 1.1 Building blocks

| Component | What the code does | Status |
|---|---|---|
| Skid → true roll (`simulateRoll`, `@glm/ground-physics`; [terrain-model.md §4](terrain-model.md#4-skid-and-roll-simulateroll)) | Sliding with Coulomb friction μ and the matching torque, then pure rolling. The transition is located exactly inside a step, at `v = (v_t − k·r·Ω)/(1 + k)` (Ω = backspin about the rolling axis, k = I/(m r²)); with no spin, at `v0/(1 + k)`. Strong backspin can reverse the ball. While rolling, spin is tied to velocity (`ω = n × v / r`). Reports `skidDistanceM` and `rollStartPositionM`. | TESTED: `skids a no-spin ball into pure roll at v0 / (1 + k) …`, `strong backspin while skidding reverses the ball (spin-back)` |
| Speed-dependent rolling resistance (ground model v0.2; [terrain-model.md §4](terrain-model.md#4-skid-and-roll-simulateroll)) | On level ground `a(v) = c0·g·(1 + β·v²)` with c0 = `SurfaceProperties.rollingResistance` (low-speed coefficient), `β = 0.0065 s²/ft² = 0.06997 s²/m²` (`ROLLING_RESISTANCE_BETA_S2_PER_M2`). Stopping distance `ln(1 + β v0²)/(2 c0 g β)`. | TESTED: `stops a rolling ball at ln(1 + beta v^2) / (2 c0 g beta) within 0.1 % …` |
| Stimpmeter relation (`rollingResistanceFromStimp`, `@glm/terrain-engine`; [terrain-model.md §5](terrain-model.md#5-stimpmeter-relation-rollingresistancefromstimp)) | `c0 = ln(1 + β v0²)/(2 g β d)`, d = Stimp ft × 0.3048, release speed `v0 = 1.83 m/s` (6.00 ft/s, **provisional**). The ramp-exit skid is ignored. | TESTED: `a simulated Stimpmeter roll reproduces the Stimp distance within 1 %` |
| Per-green speed | `withSurfaceOverrides` re-derives c0 from an overridden `stimpFt` (or the reverse) and rejects disagreeing pairs. A modified surface is re-versioned and marked provisional. | TESTED |
| Slopes | Tangential gravity `g·sin θ/(1 + k)` while rolling. The ball rests only when the slope cannot overcome the static resistance (`‖g_t‖/(1 + k) ≤ c0·g_n`). | TESTED on planes: `keeps rolling down a slope …(8 deg)`, `rolls up a steep slope, stops momentarily and comes back down`, `stops on a gentle slope (1 deg) …` |
| Bounce | Impact model for a ball that leaves the surface (crater tilt in v0.2); hops with outgoing normal speed below 0.25 m/s end in skid/roll. | TESTED (terrain-model.md §3, §6) |
| Terrain | Planes and polygon regions with per-region surfaces. Height maps are a documented extension, not built ([terrain-model.md §1.1](terrain-model.md#11-extending-to-real-courses-height-maps)). | Planes/regions TESTED; height maps not implemented |

The ground-physics and terrain-engine suites passed on 2026-10-01
(`npx vitest run packages/ground-physics packages/terrain-engine`) against ground model v0.2.
They test mechanics and invariants, not measured putts.

**Speed dependence: the sources conflict.**

- A patent attributes `ρ = (0.7028/s)(1 + 0.0065 v²)` to Penner (2002): rolling resistance
  rises with speed. It is self-consistent only with v in ft/s, and it was not traced to the paper.
- Another account reports the opposite: a slightly larger retarding force at low speed (about
  10 % over a 14 ft putt).

Both are *secondary sources, not verified on page*. β is applied to every surface and at every
speed, which is an extrapolation ([terrain-model.md](terrain-model.md)).

*Calculated* with the v0.2 relation on a level Stimp-10 green (c0 = 0.0503 at the time of
writing). The ball rolls purely from the start and skid is ignored:

| Roll distance | 1 m | 3 m | 5 m | 10 m |
|---|---|---|---|---|
| Starting roll speed | 1.01 m/s | 1.81 m/s | 2.43 m/s | 3.77 m/s |

The speed factor `1 + β v²` is 1.12 at 1.31 m/s and 1.28 at 2 m/s.

### 1.2 What happens to a putt in this build

Do not use the range pipeline for putting. Its results for a putt are not meaningful:

- **Spin.** The `putter` category has no spin prior, so spin is `unavailable` and simulation is
  withheld unless a spin observation is supplied. If the user allows the generic fallback, it
  assigns a full-swing-style spin (S = 0.15) that has nothing to do with putting
  ([spin-measurement.md §2.4](spin-measurement.md#24-mode-3--generic-assumption-only-when-the-user-allowed-it)).
- **Launch fit.** The launch fit models free flight. A ball rolling on the green is supported
  by it, so a gravity-only model expects a drop of ½·g·t² ≈ 2 mm over 20 ms (*calculated*) that
  never happens. That biases the fitted vertical velocity.
- **Ball profiles.** Their applicability range is 25–85 m/s. Putts (≈ 1–4 m/s for 1–10 m rolls,
  §1.1) are outside it and get applicability warnings.
- **Terrain.** Range sessions use a flat `fairway-normal` plane: no green, no cup.
- The desktop UI shows Putting as a disabled entry ("Phase 6 — not built yet"; TESTED:
  "course play and putting are visible but disabled").

---

## 2. Planned model (Phase 6) — not implemented

### 2.1 Phases of a putt

| Phase | Planned treatment |
|---|---|
| Launch | Ball velocity (mostly horizontal, small launch angle), spin vector (backspin, topspin and sidespin components from ω, [spin-measurement.md §1](spin-measurement.md#1-representation)), start direction relative to the aim line. The ball starts **on** the surface. |
| Hop / bounce | If the launch lifts the ball off the surface: the existing impact model and bounce threshold. |
| Skid | Coulomb sliding until the contact point stops slipping (existing). |
| True roll | Spin tied to velocity, speed-dependent resistance, slope pull (existing, extended to height maps). |
| Cup interaction | New: rim contact, flight over the hole, far-wall collision (§2.5–2.7). |
| Rest / holed | New outcome classification. |

Skid illustration (*calculated*, rigid-body mechanics, k = 0.4): a putt launched at 2 m/s with
no spin on the catalog green (μ = 0.30) skids `12 v0²/(49 μ g) = 0.33 m` and enters true roll at
`5/7 · v0 = 1.43 m/s`, a 28.6 % speed drop. A real putter impact also sets a launch angle and
spin, so real skid can differ. One study reports true roll after 3.94 in on its
highest-friction surface (μ = 0.40) and 16.77 in on its lowest (μ = 0.11), from 30 putts per
surface filmed at 360 fps over the first 40 cm (Griffiths & McKenzie; *secondary source, not
verified on page*). Its putt speeds are not known here, so the numbers are not directly
comparable.

### 2.2 Green slope and break

- **Geometry.** A green height map with C1 interpolation (bicubic or Catmull–Rom), so normals
  do not jump between cells. The normal comes from the same interpolant as the height
  ([terrain-model.md §1.1](terrain-model.md#11-extending-to-real-courses-height-maps)).
- **Break is integrated, never rule-based.** The path follows from integrating the slope pull
  `g·sin θ/(1 + k)` and the resistance along the actual surface. There is no "aim N cups"
  heuristic.
- **Gaps that must close first.** The roll snaps to the local tangent plane, which is exact only
  for planes, and a crest never launches the ball ([terrain-model.md §1.1, §9](terrain-model.md)).
  Both matter more on contoured greens.

### 2.3 Stimp profile

A per-green (or per-region) speed record that replaces the single catalog value:

| Field | Purpose |
|---|---|
| Stimp reading (ft) and release speed | c0 through the Stimp relation (§1.1). The release speed of 1.83 m/s is provisional; other sources quote 1.94 m/s and 2.41 m/s. |
| Measurement metadata | Date, direction(s), notch used (2013 half-length notch readings are doubled: USGA, *secondary source, not verified on page*). |
| Slope correction | A Stimp taken on a slope needs correction. A formula `2·S_up·S_down/(S_up + S_down)` circulates, commonly attributed to Brede; its origin is **untraced** (*secondary source, not verified on page*). It is planned as an input procedure only after it is checked. |
| Grain and mowing direction | Not modeled. Planned as a direction-dependent c0; the functional form is to be chosen from data. |
| Moisture | The existing linear moisture factor. Applying it to a Stimp read in the same wet conditions double-counts it ([terrain-model.md §3](terrain-model.md#3-impact-model-resolveimpact)). |

**Air drag is already inside c0.** The Stimpmeter roll includes air drag, so a Stimp-derived c0
already contains it. *Calculated* with an assumed C_D ≈ 0.5 (Re ≈ 3×10³–1×10⁴, below every
aero model's validity range), drag is 2 % / 6 % / 14 % of the Stimp-10 rolling deceleration at
1 / 2 / 4 m/s. The planned model must either leave drag out on greens or model it and re-derive
c0 consistently, never both.

### 2.4 Cup geometry

| Item | Value | Source |
|---|---|---|
| Hole diameter | 4¼ in = 107.95 mm (radius R ≈ 54.0 mm) | Rules of Golf, definition of "Hole" (*secondary source, not verified on page*) |
| Hole depth | ≥ 4 in (101.6 mm) | same |
| Liner | If used, sunk ≥ 1 in (25.4 mm) below the surface; outer diameter ≤ 4¼ in | same |
| Ball radius | r = 21.335 mm (profile diameter 42.67 mm) | ball profile ([physics-model.md §8](physics-model.md#8-shipped-ball-profiles)) |

Planned geometry:

- The rim is a circle on the local green surface. Rim tilt follows the green slope.
- The wall is a vertical cylinder. The bottom (or liner) is a flat floor.
- Contacts are sphere-edge contacts at the rim and sphere-cylinder contacts at the wall, all
  resolved with the existing impulse model.
- Worn or raised rims, the flagstick and the cup liner's own edge are not modeled; they are not
  planned in this document.

### 2.5 Capture speed — two literature values that disagree

| Source | Value | Conditions |
|---|---|---|
| B. W. Holmes, "Putting: How a golf ball and hole interact", *Am. J. Phys.* 59(2), 129 (1991) | **1.626 m/s** maximum for capture | Equations of motion for a ball meeting the hole. Uniform ball that neither skids nor bounces. Also reports that a smaller ball is easier to sink and a ball with a larger moment of inertia harder. *Secondary source, not verified on page.* |
| A. R. Penner, "The physics of putting", *Can. J. Phys.* 80, 83–96 (2002) | `v_max = (2R − r)·√(g/(2r))` ≈ **1.31 m/s** with R = 5.40 cm, r = 2.135 cm | Centered putt. Also reports that a downhill putt is much more likely to drop than the equivalent uphill putt. *Secondary source, not verified on page.* |

- **The two values differ by about 24 %.** A plausible reading (my reconstruction, not checked
  against either paper) is that Penner's simple formula is a free-fall criterion. The ball
  leaves the near rim, and its center travels `2R − r` before its front reaches the far wall.
  If in that time it has fallen at least one radius (`½ g t² ≥ r`), the far rim strikes it at
  or above its equator and it stays in. Solving gives the formula exactly. Holmes integrates
  the full ball–hole equations of motion, which can capture balls this criterion rejects. The
  difference is then a difference in capture criteria, not an error in either; this is
  unconfirmed.
- **Notation conflict in the snippets.** The formula was also quoted as `(2R − r)·√(g/2R)`,
  which gives 0.83 m/s. Only `√(g/(2r))` reproduces the stated 1.31 m/s.
- Patent snippets quote 1.56 m/s (downhill) and 1.63 m/s (uphill) thresholds of untraced
  origin, possibly a misreading of Holmes. They are not used.

**Plan.** Capture is an **outcome of the contact dynamics** in §2.4, not a hard-coded speed
threshold. The two literature values serve only as plausibility checks of the implemented
model: centered, no-skid, level-green entry speeds near the boundary. Which one the model
matches has to be reported, not tuned away. Resolving the discrepancy needs the primary papers
and measured putts.

### 2.6 Lip-outs — only where physically justified

- A lip-out is reported only when the simulated rim contact produces it. That is an off-center
  entry and an entry speed and spin for which the ball rides the rim and leaves. A ball whose
  center never passes over the hole (impact offset |b| ≥ R, approximately) cannot drop.
- **No random lip-outs.** The physics stays deterministic: there are no probabilistic "lip-out
  rates", no scripted animations, and no outcome tuned for drama.
- Uncertainty comes only from launch-measurement uncertainty through the existing Monte Carlo.
  A planned "holed in X % of samples" figure must be labeled as covering launch uncertainty
  only, not model error ([limitations.md](limitations.md)).
- Off-center entries cross a shorter chord, `2·√(R² − b²)`, so by the same free-fall argument
  they tolerate less speed (*qualitative, my reasoning*). This is where rim interactions, and
  any lip-outs, should come from.

### 2.7 Putting metrics (all planned)

| Metric | Definition | Provenance |
|---|---|---|
| Ball speed | ‖v‖ at launch | stream label (measured / synthetic / manual) |
| Launch angle | Vertical angle at launch (+ up) | stream label |
| Start direction | Horizontal launch angle relative to the **aim line**, magnitude with L/R | stream label |
| Launch spin | Total, backspin/topspin, sidespin, derived from ω ([spin-measurement.md §1](spin-measurement.md#1-representation)) | measured or `unavailable`; no putter prior exists |
| Skid distance | Distance the ball bounces or slides before true roll | calculated |
| Roll speed | Speed at the onset of true roll | calculated |
| Speed drop | `1 − roll speed / ball speed` | calculated |
| Total distance | Launch to rest, horizontal | calculated, provisional |
| Distance past / short | Signed along the aim line, relative to the hole | calculated |
| Entry speed and entry offset b | At the rim crossing | calculated |
| Outcome | holed / lip-out / miss | calculated (§2.5–2.6) |
| Break | Maximum lateral deviation from the start line | calculated |

The skid distance, roll speed and speed drop definitions match those TrackMan publishes for
putting (*secondary source, not verified on page*). Putter delivery (face, path, loft) is
club-delivery data: Planned (Phase 4) — not implemented. Every calculated value carries the
ground-model version and the Stimp profile it used.

### 2.8 Separate putting capture profile

Putting needs its own `SensorConfiguration`, with its own `version` recorded on every putt,
because the full-swing assumptions do not hold:

| Aspect | Why it differs |
|---|---|
| Speed range | About 1–4 m/s instead of 25–85 m/s: about 1.8 mm of travel per frame at 1000 fps for a 3 m putt (*calculated*). Plausibility gates need their own ranges. |
| Trigger | A soft putter strike may not trigger a microphone reliably. Ball-motion triggering from Stage A/C ([vision-pipeline.md](vision-pipeline.md)) is the planned primary source. |
| Field of view | Low, along the green surface. The track must cover the skid-to-roll transition (up to ~0.4 m in the study above). |
| Launch fit | A `TrajectoryModel` with ground contact (skid/roll on the calibrated green plane) instead of free flight. The injected-model interface of `fitLaunchState` already allows this. |
| Spin | Marked-ball measurement at low rates ([spin-measurement.md §4](spin-measurement.md#4-planned-phase-3-marked-ball-spin-measurement--not-implemented)). Per-interval rotation is small, so aliasing is not the constraint; resolving small topspin/backspin rates is. |
| Calibration | The green plane and the aim line, in addition to the camera calibration. |

### 2.9 Path to trust

| Step | Status |
|---|---|
| Closed-form checks: Stimp round trip, skid-to-roll speed and distance, incline rest condition | Existing ground model: TESTED |
| Cup dynamics vs. the two literature capture values | Planned (Phase 6) |
| Comparison with measured putts (speed, skid, roll-out, holed/missed) on greens with a known Stimp, against accuracy targets set in advance | Planned (Phase 7, validation and hardening, after the Phase 6 model exists). Only then could a putting metric become VERIFIED, and only for the tested conditions. |

## Related documents

- [terrain-model.md](terrain-model.md): surfaces, impact, skid/roll, Stimp relation (authoritative for the ground model)
- [spin-measurement.md](spin-measurement.md): spin representation and modes
- [vision-pipeline.md](vision-pipeline.md): capture stages and the launch fit
- [product-requirements.md](product-requirements.md#9-phase-plan): phase plan
- [limitations.md](limitations.md): what this build cannot tell you
