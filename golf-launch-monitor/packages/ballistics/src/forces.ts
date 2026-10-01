/**
 * Instantaneous forces on the ball (docs/physics-model.md §2). Public, allocation-friendly
 * wrapper around the same evaluation the integrator uses.
 */
import type { BallAerodynamicsProfile, EnvironmentProfile, Vec3 } from "@glm/shared-types";
import { AERO_OUT_LENGTH, createFlightContext, evaluateAerodynamics } from "./dynamics";

export type AccelerationBreakdown = {
  /** (0, 0, -g), m/s^2. */
  readonly gravity: Vec3;
  /** Drag acceleration, antiparallel to the air velocity, m/s^2. */
  readonly drag: Vec3;
  /** Magnus (lift) acceleration, along unit(omega x v_air), m/s^2. */
  readonly lift: Vec3;
  /** gravity + drag + lift, m/s^2. */
  readonly total: Vec3;
  /** |v_ball - wind|, m/s. */
  readonly airSpeedMps: number;
  readonly reynolds: number;
  /** |omega_perp| * r / |v_air| (0 when |v_air| < 1e-6). */
  readonly spinParameter: number;
  readonly dragCoefficient: number;
  readonly liftCoefficient: number;
};

function isFiniteVec(v: Vec3): boolean {
  return Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z);
}

/**
 * Translational acceleration of the ball for the given world-frame velocity and spin.
 * Throws if the profile names an unknown model or lacks a required parameter, and throws a
 * RangeError for non-finite inputs or inputs so large that the forces overflow double
 * precision (|v| ~ 1e154 m/s and beyond). Never returns NaN or Infinity: the lift direction
 * is skipped when |v_air| < 1e-6 m/s or the perpendicular spin is < 1e-9 rad/s.
 */
export function computeAcceleration(
  velocityMps: Vec3,
  angularVelocityRadPerSec: Vec3,
  environment: EnvironmentProfile,
  profile: BallAerodynamicsProfile,
): AccelerationBreakdown {
  if (!isFiniteVec(velocityMps) || !isFiniteVec(angularVelocityRadPerSec)) {
    throw new RangeError(
      `computeAcceleration: velocityMps and angularVelocityRadPerSec must have finite components, got ` +
        `v = (${velocityMps.x}, ${velocityMps.y}, ${velocityMps.z}), omega = (${angularVelocityRadPerSec.x}, ${angularVelocityRadPerSec.y}, ${angularVelocityRadPerSec.z})`,
    );
  }
  const ctx = createFlightContext(environment, profile);
  const out = new Float64Array(AERO_OUT_LENGTH);
  evaluateAerodynamics(
    ctx,
    velocityMps.x,
    velocityMps.y,
    velocityMps.z,
    angularVelocityRadPerSec.x,
    angularVelocityRadPerSec.y,
    angularVelocityRadPerSec.z,
    out,
  );
  for (let i = 0; i <= 10; i++) {
    if (!Number.isFinite(out[i] as number)) {
      throw new RangeError(
        "computeAcceleration: the aerodynamic forces overflow double precision for these inputs " +
          `(|v| = ${Math.hypot(velocityMps.x, velocityMps.y, velocityMps.z).toExponential(2)} m/s); physical ball speeds are below ~100 m/s`,
      );
    }
  }
  const gravity: Vec3 = { x: 0, y: 0, z: -ctx.gravity };
  const drag: Vec3 = { x: out[0] as number, y: out[1] as number, z: out[2] as number };
  const lift: Vec3 = { x: out[3] as number, y: out[4] as number, z: out[5] as number };
  return {
    gravity,
    drag,
    lift,
    total: { x: drag.x + lift.x, y: drag.y + lift.y, z: drag.z + lift.z + gravity.z },
    airSpeedMps: out[6] as number,
    reynolds: out[7] as number,
    spinParameter: out[8] as number,
    dragCoefficient: out[9] as number,
    liftCoefficient: out[10] as number,
  };
}
