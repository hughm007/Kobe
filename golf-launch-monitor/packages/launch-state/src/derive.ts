import { cross, dot, horizontalNorm, isFiniteVec, norm } from "@glm/core-math";
import type { Matrix, Measurement, Vec3 } from "@glm/shared-types";
import { DEG_PER_RAD, RPM_PER_RAD_PER_SEC, uniqueStrings } from "./constants";
import { combineSources, isAvailable, makeMeasurement, unavailableMeasurement } from "./measurement";

/**
 * Launch-angle and spin derivations, conventions exactly as docs/coordinate-system.md §3-4:
 *   ballSpeed = |v|, vertical = atan2(vz, |v_xy|) (+ up), horizontal = atan2(vy, vx) (+ LEFT),
 *   frame d = v/|v|, r = normalize(d x Z) (golfer's right of flight), u = r x d,
 *   spin-axis tilt = atan2(-w.u, w.r) (+ = curves RIGHT), rifle spin = w.d.
 * Numeric helpers work in SI/radians; the Measurement-level derive* functions produce the
 * golfer-facing deg / rpm scalars the LaunchState contract mandates, with provenance and
 * first-order uncertainty.
 */

/** Below this speed the flight direction (and every angle relative to it) is undefined. */
export const MIN_DIRECTION_SPEED_MPS = 1e-6;
/** |v_xy| / |v| below this: v is treated as vertical (r = d x Z undefined). ~0.2 arcsec. */
export const MIN_HORIZONTAL_FRACTION = 1e-6;
/** Spin about axes perpendicular to v below this: tilt undefined (pure rifle / zero spin). */
export const MIN_PERPENDICULAR_SPIN_RAD_PER_SEC = 1e-6;
/**
 * Measurement-level tilt additionally requires the perpendicular spin to exceed this many
 * standard deviations of its own noise (when a covariance is known). Below that the axis
 * direction is dominated by noise, e.g. a measured ~0 rpm knuckleball, and is reported
 * unavailable instead of as a random angle.
 */
export const SPIN_AXIS_MIN_SIGNAL_TO_NOISE = 3;

export type LaunchDirectionFrame = {
  /** Unit flight direction. */
  readonly d: Vec3;
  /** Unit horizontal vector to the golfer's right of the flight direction. Pure backspin is w || r. */
  readonly r: Vec3;
  /** Unit vector perpendicular to v, "up-ish". */
  readonly u: Vec3;
};

export function ballSpeedMps(v: Vec3): number {
  return norm(v);
}

/** atan2(vz, sqrt(vx^2 + vy^2)), radians, positive = upward. */
export function verticalLaunchAngleRad(v: Vec3): number {
  return Math.atan2(v.z, horizontalNorm(v));
}

/** atan2(vy, vx), radians, positive = LEFT of the target line (right-hand rotation about +Z). */
export function horizontalLaunchAngleRad(v: Vec3): number {
  return Math.atan2(v.y, v.x);
}

/** |w|, rad/s. */
export function spinRateRadPerSec(omega: Vec3): number {
  return norm(omega);
}

/** The launch-direction frame {d, r, u}, or null if |v| ~ 0 or v is vertical. */
export function launchDirectionFrame(v: Vec3): LaunchDirectionFrame | null {
  if (!isFiniteVec(v)) return null;
  const speed = norm(v);
  if (!(speed > MIN_DIRECTION_SPEED_MPS)) return null;
  const h = horizontalNorm(v);
  if (!(h > MIN_HORIZONTAL_FRACTION * speed)) return null;
  const d = { x: v.x / speed, y: v.y / speed, z: v.z / speed };
  // normalize(d x Z) = (vy, -vx, 0) / |v_xy|, written out to avoid a second normalisation.
  const r = { x: v.y / h, y: -v.x / h, z: 0 };
  const u = cross(r, d);
  return { d, r, u };
}

/**
 * Spin-axis tilt alpha = atan2(-w.u, w.r), radians; positive = axis rotated right-hand about
 * the flight direction = ball curves RIGHT. Rifle spin (w.d) does not affect it. Null when the
 * frame is undefined or the spin perpendicular to v is ~0.
 */
export function spinAxisTiltRad(omega: Vec3, v: Vec3): number | null {
  const f = launchDirectionFrame(v);
  if (!f || !isFiniteVec(omega)) return null;
  const a = dot(omega, f.r);
  const b = -dot(omega, f.u);
  if (!(Math.hypot(a, b) > MIN_PERPENDICULAR_SPIN_RAD_PER_SEC)) return null;
  return Math.atan2(b, a);
}

export type SpinComponentsRpm = {
  /** Component about r (pure backspin axis). Equals totalSpinRpm * cos(tilt) when rifling is 0. */
  readonly backspinRpm: number;
  /** Component about -u; positive = curves right. Equals totalSpinRpm * sin(tilt) when rifling is 0. */
  readonly sidespinRpm: number;
  /** Component about the flight direction d (no Magnus force). */
  readonly riflingRpm: number;
};

/**
 * Display-only decomposition of w into orthogonal components about r, -u and d (rpm). Never
 * stored as authoritative spin. Null when the launch-direction frame is undefined.
 */
export function spinComponentsRpm(omega: Vec3, v: Vec3): SpinComponentsRpm | null {
  const f = launchDirectionFrame(v);
  if (!f || !isFiniteVec(omega)) return null;
  return {
    backspinRpm: dot(omega, f.r) * RPM_PER_RAD_PER_SEC,
    sidespinRpm: -dot(omega, f.u) * RPM_PER_RAD_PER_SEC,
    riflingRpm: dot(omega, f.d) * RPM_PER_RAD_PER_SEC,
  };
}

export type AngularVelocityFromSpinInput = {
  /** |w|, rad/s (includes rifle spin if any). */
  readonly totalSpinRadPerSec: number;
  /** Positive = curves right. */
  readonly spinAxisTiltRad: number;
  readonly velocity: Vec3;
  /** Spin about the flight direction, rad/s; |rifling| <= total. Default 0. */
  readonly riflingRadPerSec?: number;
};

/**
 * w = |w_perp| (cos a r - sin a u) + rifling d with |w_perp| = sqrt(total^2 - rifling^2), so
 * |w| = totalSpinRadPerSec and spinAxisTiltRad(w, v) = a. Throws when the frame is undefined.
 */
export function angularVelocityFromSpin(input: AngularVelocityFromSpinInput): Vec3 {
  const total = input.totalSpinRadPerSec;
  const tilt = input.spinAxisTiltRad;
  const rifling = input.riflingRadPerSec ?? 0;
  if (!Number.isFinite(total) || total < 0) throw new Error(`angularVelocityFromSpin: total spin must be finite and >= 0, got ${total}`);
  if (!Number.isFinite(tilt)) throw new Error(`angularVelocityFromSpin: tilt must be finite, got ${tilt}`);
  if (!Number.isFinite(rifling)) throw new Error(`angularVelocityFromSpin: rifling must be finite, got ${rifling}`);
  if (Math.abs(rifling) > total * (1 + 1e-12)) {
    throw new Error(`angularVelocityFromSpin: |rifling| (${rifling}) exceeds total spin (${total})`);
  }
  const f = launchDirectionFrame(input.velocity);
  if (!f) throw new Error("angularVelocityFromSpin: launch-direction frame undefined (zero or vertical velocity)");
  const perp = Math.sqrt(Math.max(0, total * total - rifling * rifling));
  const c = perp * Math.cos(tilt);
  const s = perp * Math.sin(tilt);
  return {
    x: c * f.r.x - s * f.u.x + rifling * f.d.x,
    y: c * f.r.y - s * f.u.y + rifling * f.d.y,
    z: c * f.r.z - s * f.u.z + rifling * f.d.z,
  };
}

// ---------------------------------------------------------------------------
// Measurement-level derivations with first-order uncertainty propagation
// ---------------------------------------------------------------------------

type Grad3 = readonly [number, number, number];

type Derivation =
  | {
      readonly ok: true;
      readonly value: number;
      /** d(output)/d(input_i), output units per input unit; null = Jacobian undefined at this point. */
      readonly gradients: readonly (Grad3 | null)[];
      readonly extraFlags?: readonly string[];
    }
  | { readonly ok: false; readonly flag: string };

type NamedInput = { readonly name: string; readonly measurement: Measurement<Vec3> };

/** The 3x3 covariance of a vector measurement, null if absent, "invalid" if malformed. */
function vectorCovariance(m: Measurement<Vec3>): Matrix | null | "invalid" {
  const cov = m.uncertainty?.covariance;
  if (cov === undefined) return null;
  if (cov.length !== 3) return "invalid";
  for (const row of cov) {
    if (row.length !== 3) return "invalid";
    for (const v of row) if (!Number.isFinite(v)) return "invalid";
  }
  return cov;
}

/**
 * g C g^T. Round-off on a positive semi-definite C (e.g. g in its null space) is clamped to 0;
 * a clearly negative result (indefinite C) returns NaN so the caller flags the covariance.
 */
function quadraticForm(g: Grad3, c: Matrix): number {
  let s = 0;
  let magnitude = 0;
  for (let i = 0; i < 3; i++) {
    const row = c[i] as ReadonlyArray<number>;
    for (let j = 0; j < 3; j++) {
      const term = (g[i] as number) * (row[j] as number) * (g[j] as number);
      s += term;
      magnitude += Math.abs(term);
    }
  }
  if (s >= 0) return s;
  return s >= -1e-12 * magnitude ? 0 : Number.NaN;
}

/**
 * Confidence multiplier for a derived value whose uncertainty could not be propagated (flag
 * "uncertainty-covariance-invalid" or "uncertainty-not-propagated-singular-jacobian").
 * Provisional.
 */
export const UNPROPAGATED_UNCERTAINTY_CONFIDENCE_SCALE = 0.5;

/**
 * Shared skeleton: unavailable/non-finite inputs -> unavailable output with a specific flag;
 * otherwise provenance = combineSources(inputs), confidence = min(inputs) (scaled by
 * UNPROPAGATED_UNCERTAINTY_CONFIDENCE_SCALE if propagation failed), flags carried forward, and
 * sigma_out = sqrt(sum_i g_i C_i g_i^T) (inputs treated as independent).
 */
function deriveScalar(
  inputs: readonly NamedInput[],
  unit: string,
  compute: (values: readonly Vec3[]) => Derivation,
): Measurement<number> {
  const inheritedFlags = uniqueStrings(inputs.flatMap((i) => i.measurement.qualityFlags));
  const missing = inputs.filter((i) => !isAvailable(i.measurement)).map((i) => `${i.name}-unavailable`);
  if (missing.length > 0) return unavailableMeasurement(unit, [...inheritedFlags, ...missing]);
  const values = inputs.map((i) => i.measurement.value as Vec3);
  const nonFinite = inputs.filter((_, k) => !isFiniteVec(values[k] as Vec3)).map((i) => `${i.name}-non-finite`);
  if (nonFinite.length > 0) return unavailableMeasurement(unit, [...inheritedFlags, ...nonFinite]);

  const result = compute(values);
  if (!result.ok) return unavailableMeasurement(unit, [...inheritedFlags, result.flag]);
  if (!Number.isFinite(result.value)) return unavailableMeasurement(unit, [...inheritedFlags, "derivation-non-finite"]);

  const flags = [...inheritedFlags, ...(result.extraFlags ?? [])];
  let variance = 0;
  let propagated = 0;
  let missingCovariance = 0;
  let failure: string | null = null;
  for (let k = 0; k < inputs.length; k++) {
    const cov = vectorCovariance((inputs[k] as NamedInput).measurement);
    if (cov === null) {
      missingCovariance++;
      continue;
    }
    if (cov === "invalid") {
      failure = "uncertainty-covariance-invalid";
      continue;
    }
    const g = result.gradients[k];
    if (g === null || g === undefined) {
      failure = "uncertainty-not-propagated-singular-jacobian";
      continue;
    }
    const q = quadraticForm(g, cov);
    if (!(q >= 0)) {
      failure = "uncertainty-covariance-invalid";
      continue;
    }
    variance += q;
    propagated++;
  }

  let sigma: number | null = null;
  if (failure !== null) flags.push(failure);
  else if (propagated > 0) {
    sigma = Math.sqrt(variance);
    if (missingCovariance > 0) flags.push("uncertainty-partial");
  }

  // A value whose uncertainty could not be propagated (invalid input covariance, singular
  // Jacobian) is less trustworthy than its inputs: its confidence is scaled down.
  const confidence = Math.min(...inputs.map((i) => i.measurement.confidence)) * (failure !== null ? UNPROPAGATED_UNCERTAINTY_CONFIDENCE_SCALE : 1);
  return makeMeasurement({
    value: result.value,
    unit,
    source: combineSources(inputs.map((i) => i.measurement.source)) as Exclude<Measurement<number>["source"], "unavailable">,
    confidence,
    ...(sigma !== null && Number.isFinite(sigma) ? { uncertainty: { sigma, unit } } : {}),
    qualityFlags: flags,
  });
}

/** Ball speed |v| (m/s) with sigma from the velocity covariance; gradient v/|v|. */
export function deriveBallSpeedMps(velocity: Measurement<Vec3>): Measurement<number> {
  return deriveScalar([{ name: "velocity", measurement: velocity }], "m/s", ([v]) => {
    const vv = v as Vec3;
    const s = norm(vv);
    const gradient: Grad3 | null = s > MIN_DIRECTION_SPEED_MPS ? [vv.x / s, vv.y / s, vv.z / s] : null;
    return { ok: true, value: s, gradients: [gradient] };
  });
}

/** Vertical launch angle (deg, + up). Unavailable for |v| ~ 0. */
export function deriveVerticalLaunchAngleDeg(velocity: Measurement<Vec3>): Measurement<number> {
  return deriveScalar([{ name: "velocity", measurement: velocity }], "deg", ([v]) => {
    const vv = v as Vec3;
    const s = norm(vv);
    if (!(s > MIN_DIRECTION_SPEED_MPS)) return { ok: false, flag: "vertical-launch-angle-undefined-zero-velocity" };
    const h = horizontalNorm(vv);
    const s2 = s * s;
    // d/dv atan2(vz, h) = (-vz vx / (h s^2), -vz vy / (h s^2), h / s^2); singular at h = 0.
    const gradient: Grad3 | null =
      h > MIN_HORIZONTAL_FRACTION * s
        ? [(-vv.z * vv.x * DEG_PER_RAD) / (h * s2), (-vv.z * vv.y * DEG_PER_RAD) / (h * s2), (h * DEG_PER_RAD) / s2]
        : null;
    return { ok: true, value: verticalLaunchAngleRad(vv) * DEG_PER_RAD, gradients: [gradient] };
  });
}

/** Horizontal launch angle (deg, + LEFT). Unavailable for |v| ~ 0 or vertical v. */
export function deriveHorizontalLaunchAngleDeg(velocity: Measurement<Vec3>): Measurement<number> {
  return deriveScalar([{ name: "velocity", measurement: velocity }], "deg", ([v]) => {
    const vv = v as Vec3;
    const s = norm(vv);
    if (!(s > MIN_DIRECTION_SPEED_MPS)) return { ok: false, flag: "horizontal-launch-angle-undefined-zero-velocity" };
    const h = horizontalNorm(vv);
    if (!(h > MIN_HORIZONTAL_FRACTION * s)) {
      return { ok: false, flag: "horizontal-launch-angle-undefined-vertical-velocity" };
    }
    const h2 = h * h;
    // d/dv atan2(vy, vx) = (-vy / h^2, vx / h^2, 0).
    const gradient: Grad3 = [(-vv.y * DEG_PER_RAD) / h2, (vv.x * DEG_PER_RAD) / h2, 0];
    return { ok: true, value: horizontalLaunchAngleRad(vv) * DEG_PER_RAD, gradients: [gradient] };
  });
}

/** Total spin |w| in rpm (display unit) with sigma from the angular-velocity covariance. */
export function deriveTotalSpinRpm(angularVelocity: Measurement<Vec3>): Measurement<number> {
  return deriveScalar([{ name: "angular-velocity", measurement: angularVelocity }], "rpm", ([w]) => {
    const ww = w as Vec3;
    const s = norm(ww);
    const k = RPM_PER_RAD_PER_SEC;
    const gradient: Grad3 | null = s > MIN_PERPENDICULAR_SPIN_RAD_PER_SEC ? [(k * ww.x) / s, (k * ww.y) / s, (k * ww.z) / s] : null;
    return { ok: true, value: s * k, gradients: [gradient] };
  });
}

/**
 * Analytic gradients of alpha = atan2(b, a) with a = w.r, b = -w.u, written in velocity
 * components: r = (vy, -vx, 0)/h, u = (-vx vz, -vy vz, h^2)/(h s), so
 *   a = (wx vy - wy vx)/h,   b = (vz (wx vx + wy vy) - wz h^2)/(h s).
 * alpha is invariant to |v| (only the direction matters), so grad_v . v = 0.
 */
function tiltGradients(w: Vec3, v: Vec3, f: LaunchDirectionFrame): { gw: Grad3; gv: Grad3 } {
  const a = dot(w, f.r);
  const b = -dot(w, f.u);
  const q = a * a + b * b;
  // d alpha / d w = (a * (-u) - b * r) / q
  const gw: Grad3 = [(-a * f.u.x - b * f.r.x) / q, (-a * f.u.y - b * f.r.y) / q, (-a * f.u.z - b * f.r.z) / q];

  const h = Math.hypot(v.x, v.y);
  const s = Math.hypot(h, v.z);
  const dh = [v.x / h, v.y / h, 0];
  const dNa = [-w.y, w.x, 0];
  const da = [0, 1, 2].map((i) => ((dNa[i] as number) - a * (dh[i] as number)) / h) as [number, number, number];
  const D = h * s;
  const dD = [(v.x * (s * s + h * h)) / (h * s), (v.y * (s * s + h * h)) / (h * s), (h * v.z) / s];
  const dNb = [v.z * w.x - 2 * w.z * v.x, v.z * w.y - 2 * w.z * v.y, w.x * v.x + w.y * v.y];
  const db = [0, 1, 2].map((i) => ((dNb[i] as number) - b * (dD[i] as number)) / D) as [number, number, number];
  const gv: Grad3 = [(a * db[0] - b * da[0]) / q, (a * db[1] - b * da[1]) / q, (a * db[2] - b * da[2]) / q];
  return { gw, gv };
}

/**
 * Spin-axis tilt (deg, + = curves right) from the angular velocity and launch velocity.
 * Provenance combines both inputs. Unavailable (never a number) when v is ~0 or vertical, when
 * there is no spin perpendicular to v, or when that spin is below SPIN_AXIS_MIN_SIGNAL_TO_NOISE
 * times its own noise.
 */
export function deriveSpinAxisTiltDeg(angularVelocity: Measurement<Vec3>, velocity: Measurement<Vec3>): Measurement<number> {
  return deriveScalar(
    [
      { name: "angular-velocity", measurement: angularVelocity },
      { name: "velocity", measurement: velocity },
    ],
    "deg",
    ([w, v]) => {
      const ww = w as Vec3;
      const vv = v as Vec3;
      const f = launchDirectionFrame(vv);
      if (!f) {
        return {
          ok: false,
          flag: norm(vv) > MIN_DIRECTION_SPEED_MPS ? "spin-axis-undefined-vertical-velocity" : "spin-axis-undefined-zero-velocity",
        };
      }
      const tilt = spinAxisTiltRad(ww, vv);
      if (tilt === null) return { ok: false, flag: "spin-axis-undefined-no-perpendicular-spin" };
      const cov = vectorCovariance(angularVelocity);
      if (cov !== null && cov !== "invalid") {
        const perp = Math.hypot(dot(ww, f.r), dot(ww, f.u));
        const r: Grad3 = [f.r.x, f.r.y, f.r.z];
        const u: Grad3 = [f.u.x, f.u.y, f.u.z];
        const perpSigma = Math.sqrt(Math.max(0, (quadraticForm(r, cov) + quadraticForm(u, cov)) / 2));
        if (perp < SPIN_AXIS_MIN_SIGNAL_TO_NOISE * perpSigma) {
          return { ok: false, flag: "spin-axis-undefined-spin-below-noise" };
        }
      }
      const { gw, gv } = tiltGradients(ww, vv, f);
      const toDeg = (g: Grad3): Grad3 => [g[0] * DEG_PER_RAD, g[1] * DEG_PER_RAD, g[2] * DEG_PER_RAD];
      return { ok: true, value: tilt * DEG_PER_RAD, gradients: [toDeg(gw), toDeg(gv)] };
    },
  );
}
