import type { SurfaceProperties, Vec3 } from "@glm/shared-types";
import { addScaled, cross, dot, isFiniteVec, norm, normalize, scale, sub } from "@glm/core-math";
import { ballConstants, type BallInertiaProfile } from "./ball";
import { effectiveRestitution } from "./surface-response";

export type ImpactInput = {
  readonly velocityMps: Vec3;
  readonly angularVelocityRadPerSec: Vec3;
  /** Outward surface normal at the contact (normalised here). */
  readonly normal: Vec3;
  readonly surface: SurfaceProperties;
  readonly ballProfile: BallInertiaProfile;
};

export type ImpactRegime = "sliding" | "rolling-at-separation";

export type ImpactResult = {
  readonly velocityMps: Vec3;
  readonly angularVelocityRadPerSec: Vec3;
  /** "rolling-at-separation": friction stopped the contact-point slip during the impact. */
  readonly regime: ImpactRegime;
  /** Incoming normal speed into the surface (>= 0), m/s. */
  readonly normalImpactSpeedMps: number;
  readonly restitution: number;
  /** Normal impulse magnitude, N*s. */
  readonly normalImpulseNs: number;
  /** Tangential (friction) impulse magnitude, N*s, applied opposite the incoming slip. */
  readonly tangentialImpulseNs: number;
};

/** Slip speeds below this are treated as zero (no defined friction direction), m/s. */
const SLIP_EPSILON_MPS = 1e-12;

/**
 * Rigid-sphere impulse model with Coulomb friction (docs/terrain-model.md §3).
 *
 * Contact point relative to the centre: -r n. Contact slip velocity u = v_t + omega x (-r n).
 *   Normal impulse        Jn = m (1 + e) |v_n|
 *   Slip-stopping impulse J* = |u| / (1/m + r^2/I)
 *   Tangential impulse    Jt = min(J*, mu Jn)  (J* <= mu Jn -> "rolling-at-separation")
 *   v'     = v_t - (Jt/m) u_hat - e v_n n        (v_n = v . n < 0)
 *   omega' = omega + (r Jt / I) (n x u_hat)
 * Sign check: v = +X, omega = 0 on flat ground -> u_hat = +X, n x u_hat = +Y, so omega_y
 * becomes positive (forward roll, top of the ball moving forward). Backspin (omega_y < 0)
 * adds to the forward slip, so friction pushes harder backward.
 *
 * Angular momentum about the contact point is conserved and kinetic + rotational energy
 * never increases. A ball already separating (v . n >= 0) is returned unchanged.
 */
export function resolveImpact(input: ImpactInput): ImpactResult {
  const { velocityMps: v, angularVelocityRadPerSec: omega, surface } = input;
  if (!isFiniteVec(v) || !isFiniteVec(omega) || !isFiniteVec(input.normal)) {
    throw new RangeError("resolveImpact: velocity, angular velocity and normal must be finite");
  }
  const n = normalize(input.normal);
  if (n === null) throw new RangeError("resolveImpact: normal must be non-zero");
  const ball = ballConstants(input.ballProfile);
  const { massKg: m, radiusM: r, inertiaKgM2: I } = ball;

  const vn = dot(v, n);
  const vt = addScaled(v, n, -vn);
  const contactArm = scale(n, -r);
  const slip = addScaled(vt, cross(omega, contactArm), 1);
  const slipSpeed = norm(slip);

  if (vn >= 0) {
    return {
      velocityMps: v,
      angularVelocityRadPerSec: omega,
      regime: slipSpeed < SLIP_EPSILON_MPS ? "rolling-at-separation" : "sliding",
      normalImpactSpeedMps: 0,
      restitution: effectiveRestitution(surface, 0),
      normalImpulseNs: 0,
      tangentialImpulseNs: 0,
    };
  }

  const normalSpeed = -vn;
  const e = effectiveRestitution(surface, normalSpeed);
  const jn = m * (1 + e) * normalSpeed;
  const mu = Math.max(0, surface.slidingFriction);

  let jt = 0;
  let regime: ImpactRegime = "rolling-at-separation";
  let vOut = vt;
  let omegaOut = omega;
  const slipDir = slipSpeed < SLIP_EPSILON_MPS ? null : normalize(slip);
  if (slipDir !== null) {
    const jStop = slipSpeed / (1 / m + (r * r) / I);
    if (jStop <= mu * jn) {
      jt = jStop;
    } else {
      jt = mu * jn;
      regime = "sliding";
    }
    vOut = addScaled(vt, slipDir, -jt / m);
    omegaOut = addScaled(omega, cross(n, slipDir), (r * jt) / I);
  }
  vOut = addScaled(vOut, n, e * normalSpeed);

  if (!isFiniteVec(vOut) || !isFiniteVec(omegaOut)) {
    throw new Error("resolveImpact: non-finite result");
  }
  return {
    velocityMps: vOut,
    angularVelocityRadPerSec: omegaOut,
    regime,
    normalImpactSpeedMps: normalSpeed,
    restitution: e,
    normalImpulseNs: jn,
    tangentialImpulseNs: jt,
  };
}

/** Velocity of the contact point (-r n from the centre) relative to the ground, m/s. */
export function contactSlipVelocity(velocityMps: Vec3, angularVelocityRadPerSec: Vec3, normal: Vec3, radiusM: number): Vec3 {
  return sub(velocityMps, cross(angularVelocityRadPerSec, scale(normal, radiusM)));
}
