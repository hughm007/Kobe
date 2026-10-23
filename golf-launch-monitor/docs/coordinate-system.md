# Coordinate system

**Version:** `glm-world-1.0` (`COORDINATE_SYSTEM_VERSION` in `@glm/shared-types`).
Every launch state, calibration record, replay file, and shot record stores this version.
Changing any rule below requires a new version string and a migration note in this file.

## 1. World frame

Right-handed Cartesian frame, SI units (meters, seconds).

| Axis | Direction |
|---|---|
| **+X** | Forward along the calibrated target line, toward the impact screen / target. |
| **+Y** | The golfer's **left** when facing the target. |
| **+Z** | Vertically up (opposite to gravity). |

- **Origin:** the calibrated ball center at address (`WorldFrameCalibration.addressPointM`,
  normally `(0, 0, 0)`).
- **Target line:** `WorldFrameCalibration.targetLineUnit`. +Z is defined by gravity, not by the
  floor, so on a sloped floor the target line is the **horizontal projection** of the surveyed
  target direction; the world frame is constructed so that this horizontal line is +X. The
  (possibly tilted) floor is described separately by `WorldFrameCalibration.groundPlane`.
- **Ground:** the ground is **not** assumed to be flat or level. Terrain is queried through
  `TerrainQuery.sample(x, y)`, which returns a height and a unit surface normal. On a flat
  range the ground plane is `z = -(ballRadius + teeHeight)`, because the origin is the ball
  *center*, not the ground contact point.

The frame does not change with handedness. A left-handed golfer uses the same axes; only
golfer-facing labels (draw/fade, in-to-out) change (§6).

## 2. Units

Internal computation uses SI only: m, s, kg, rad, m/s, rad/s, kg/m³, Pa, K or °C for
environment inputs. Conversion to yd, ft, in, mph, degrees, rpm happens only in the display
and export layers (`@glm/units`).

**Contract exception (documented, deliberate):** the `LaunchState` data contract mandates
golfer-facing scalar fields in degrees and rpm (`verticalLaunchAngleDeg`,
`horizontalLaunchAngleDeg`, `totalSpinRpm`, `spinAxisTiltDeg`, club `*Deg` fields). These are
**derived** from the SI vectors and are never read by physics or estimation code. The
authoritative values are `ballPositionM`, `velocityMps`, and `angularVelocityRadPerSec`.

## 3. Launch angles

Given launch velocity **v** = (vx, vy, vz):

```
ballSpeed              = |v|
verticalLaunchAngle    = atan2(vz, sqrt(vx² + vy²))     // positive = upward
horizontalLaunchAngle  = atan2(vy, vx)                    // positive = LEFT of target line
```

Both angles are right-hand-rule rotations: vertical about the horizontal axis to the golfer's
right, horizontal about +Z. **Internal sign: positive horizontal angle = left.** This is the
opposite of the "positive = right" convention common on commercial launch-monitor displays;
golfer-facing output therefore never shows a bare signed horizontal angle — it shows a
magnitude with an explicit `L` / `R` label (e.g. `2.1° R`). CSV/JSON exports name the column
with its convention (`horizontal_launch_deg_left_positive`).

## 4. Spin

### 4.1 Authoritative representation

Spin is the 3D angular-velocity vector **ω** (rad/s, world frame). The direction is the
rotation axis by the right-hand rule; the magnitude is the angular speed. "Backspin" and
"sidespin" are **never** stored as authoritative values; they are derived for display only.

```
totalSpinRpm = |ω| · 60 / (2π)
```

### 4.2 Pure backspin

For a ball moving along +X, backspin (top of the ball moving back toward the golfer) is
ω pointing along **−Y** (toward the golfer's right):

- surface velocity at the top of the ball: (−Ŷ) × (+Ẑ) = −X̂ (moves backward) ✔
- Magnus direction: ω × v ∝ (−Ŷ) × (+X̂) = +Ẑ (lift) ✔

### 4.3 Launch-direction frame and spin-axis tilt

Spin-axis tilt is measured relative to the launch velocity **v**:

```
d̂ = v / |v|                       // flight direction
r̂ = normalize(d̂ × Ẑ)              // horizontal, to the golfer's right of the flight direction
û = r̂ × d̂                         // perpendicular to v, "up-ish"
```

Pure backspin is ω ∥ r̂. A tilted spin axis is

```
ω = |ω| · (cos α · r̂ − sin α · û)  +  (rifle spin along d̂)
spinAxisTilt α = atan2(−ω·û, ω·r̂)
riflingSpin   = ω·d̂     // spin about the flight direction; produces no Magnus force
```

**Sign: positive tilt = the axis is rotated right-hand about the flight direction = the
ball curves RIGHT.** Check with v ∥ +X, α > 0: ω = |ω|(0, −cos α, −sin α), so
ω × v̂ = |ω|(0, −sin α, cos α): a −Y (rightward) component. ✔
This matches the "positive spin axis = curves right" convention used by commercial
launch-monitor displays, so tilt is shown as a magnitude with an `L`/`R` label anyway.

In this decomposition |ω| inside the parentheses is the spin **perpendicular** to the flight
direction, |ω⊥| = |ω × d̂|; rifle spin is the separate component ω·d̂, and the tilt is computed
from ω⊥ only. Measured golf shots carry little rifle spin, but the definitions stay exact.

Derived display components (golfer familiarity only):

```
backspinRpm  = |ω⊥| · cos α · 60/(2π)   // component about r̂
sidespinRpm  = |ω⊥| · sin α · 60/(2π)   // positive = curves right
riflingRpm   = (ω·d̂) · 60/(2π)
```

Using `totalSpinRpm · cos α` instead overstates both components when rifle spin is present.

The definition is undefined when |v| ≈ 0 or v is vertical (d̂ ∥ Ẑ); derivation functions
return `unavailable` in that case rather than a number.

## 5. Derived flight metrics

All distances are **horizontal** (XY-plane) distances measured from the launch point. Lateral
values are signed, **positive = left** of the target line (+Y). Bounce and roll are signed
along-track displacements, so that bounce + roll equals the net ground travel even when a
high-spin shot checks or spins back (docs/terrain-model.md §6).

| Metric | Definition |
|---|---|
| Carry | Horizontal distance from launch to first ground contact. |
| Carry lateral (offline at carry) | Signed perpendicular offset from the target line at first contact. |
| Total | Horizontal distance from launch to the final resting position. |
| Total lateral (offline at rest) | Signed perpendicular offset from the target line at rest. |
| Apex height | Maximum ball-center height minus launch ball-center height. |
| Descent angle | Angle of the velocity below horizontal at first contact: atan2(−vz, √(vx²+vy²)). |
| Landing direction | atan2(vy, vx) of the velocity at first contact (+left). |
| Curve | Signed perpendicular offset of the landing point from the **start line** (the line through the launch point along the horizontal launch direction), +left. |
| Bounce distance | Signed horizontal displacement along the landing heading from first contact to the start of continuous rolling (negative if the ball spins back). |
| Roll distance | Signed horizontal displacement along the landing heading while rolling (negative if the ball spins back). |

Ground contact is detected when the ball center comes within one ball radius of the terrain
along the surface normal.

## 6. Handedness

Handedness never changes axes or internal signs. It changes golfer-facing **labels** only:

| Ball behaviour (world) | Right-handed label | Left-handed label |
|---|---|---|
| Curves right (positive tilt) | Fade / slice | Draw / hook |
| Curves left (negative tilt) | Draw / hook | Fade / slice |

Club path / face angles (Phase 4) are stored in the world frame with the same right-hand
rotation about +Z (positive = left); "in-to-out" and "open/closed" are derived labels that
depend on handedness and are documented in that phase.

## 7. Camera-to-world transform

Camera extrinsics follow OpenCV conventions: the camera frame is +x right, +y down,
+z forward (optical axis), and

```
p_cam = R_wc · p_world + t      (CameraExtrinsics.rotationWorldToCamera, translationM)
p_world = R_wcᵀ · (p_cam − t)
```

Intrinsics use the pinhole model with Brown–Conrady distortion (k1, k2, p1, p2, k3) in
pixel units. Every sensor adapter converts its observations into the world frame before
emitting them; nothing downstream of an adapter sees device coordinates.

## 8. Time

Observations carry `timestampS` on a shared **session clock** (seconds). Adapters convert
device clocks to it and report residual synchronisation drift as a health metric. A launch
state's `launchTimeS` is the session-clock time its position/velocity refer to; flight
samples use `tS` = seconds since that launch reference time.

## 9. Display conversion rules

| Quantity | Internal | Golfer display | Engineering display |
|---|---|---|---|
| Distance | m | yd (0 dp), or m (0 dp) | m (3 dp) |
| Height | m | yd or ft (0 dp) | m (3 dp) |
| Lateral | m, +left | `12 yd L` / `3 yd R` | signed m (3 dp) |
| Speed | m/s | mph (1 dp) or km/h | m/s (3 dp) |
| Angles | rad | degrees (1 dp) with `L`/`R` where lateral | degrees (3 dp) |
| Spin | rad/s | rpm, rounded to 10 | rpm (1 dp) |

Exact conversion constants: 1 yd = 0.9144 m, 1 ft = 0.3048 m, 1 in = 0.0254 m,
1 mph = 0.44704 m/s, 1 rpm = 2π/60 rad/s. When an uncertainty interval is wide (see
`@glm/units` formatting rules), golfer display shows a range (`Carry 163–171 yd`) instead of a
single number.
