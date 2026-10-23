import type { SurfaceProperties, Vec3 } from "@glm/shared-types";
import { addScaled, cross, dot, isFiniteVec, norm, normalize, scale, sub } from "@glm/core-math";
import { ballConstants, type BallConstants, type BallInertiaProfile } from "./ball";
import { craterAngleRad } from "./crater";
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
  /** Impact angle below the TRUE surface plane, rad (0 grazing, pi/2 vertical; 0 if separating). */
  readonly impactAngleRad: number;
  /** Crater tilt theta_c of the effective contact plane, rad (0: rigid surface, vertical drop or separating). */
  readonly craterAngleRad: number;
  /** Unit normal of the tilted (effective) contact plane the impulse acts on; the true normal if theta_c = 0. */
  readonly effectiveNormal: Vec3;
  /** Incoming speed into the TRUE surface, |v . n| (>= 0), m/s. */
  readonly normalImpactSpeedMps: number;
  /** Incoming speed into the effective plane, |v . n'| (Penner's v'), m/s; restitution is evaluated on it. */
  readonly effectiveNormalImpactSpeedMps: number;
  readonly restitution: number;
  /** Normal impulse magnitude along the effective normal, N*s. */
  readonly normalImpulseNs: number;
  /** Tangential (friction) impulse magnitude in the effective plane, N*s, applied opposite the incoming slip. */
  readonly tangentialImpulseNs: number;
};

/** Slip / tangential speeds below this are treated as zero (no defined direction), m/s. */
const SLIP_EPSILON_MPS = 1e-12;

/**
 * Impact with a crater-tilted contact plane (docs/terrain-model.md §3), after Penner (2002).
 *
 * Crater tilt. With n the true unit normal, v_n = v . n < 0, v_t = v - v_n n, t = v_t / |v_t|,
 * impact angle theta_i = atan2(|v_n|, |v_t|) and theta_c = craterAngleRad(surface, |v|, theta_i):
 *   n' = cos(theta_c) n - sin(theta_c) t        (tilted toward the incoming ball)
 *   |v . n'| = |v_t| sin(theta_c) + |v_n| cos(theta_c)        (Penner's v')
 * The rigid-sphere impulse below is then applied in that tilted frame; outgoing velocity and spin
 * are world-frame vectors. The next hop or roll uses the TRUE normal (the crater is local).
 *
 * Rigid-sphere impulse with Coulomb friction, contact point -r n' from the centre, slip
 * u = v_t' + omega x (-r n') with v_t' = v - (v . n') n':
 *   e  = effectiveRestitution(surface, |v . n'|)
 *   Jn = m (1 + e) |v . n'|,   J* = |u| / (1/m + r^2/I),   Jt = min(J*, mu Jn)
 *   v'     = v_t' - (Jt/m) u_hat + e |v . n'| n'
 *   omega' = omega + (r Jt / I) (n' x u_hat)
 * Sign check (theta_c = 0): v = +X, omega = 0 on flat ground -> n x u_hat = +Y, forward roll.
 *
 * Invariants (any theta_c): kinetic + rotational energy never increases; the speed along n'
 * is reversed and scaled by e <= 1; angular momentum about the contact point -r n' is
 * conserved (every impulse acts there). A ball separating from the TRUE surface (v . n >= 0)
 * is returned unchanged. theta_c = 0 (rigid surface, firmness 1) is exactly the plain
 * rigid-surface model.
 */
export function resolveImpact(input: ImpactInput): ImpactResult {
  const { velocityMps: v, angularVelocityRadPerSec: omega, surface } = input;
  if (!isFiniteVec(v) || !isFiniteVec(omega) || !isFiniteVec(input.normal)) {
    throw new RangeError("resolveImpact: velocity, angular velocity and normal must be finite");
  }
  const n = normalize(input.normal);
  if (n === null) throw new RangeError("resolveImpact: normal must be non-zero");
  const ball = ballConstants(input.ballProfile);

  const vn = dot(v, n);
  if (vn >= 0) {
    const slip = addScaled(addScaled(v, n, -vn), cross(omega, scale(n, -ball.radiusM)), 1);
    return {
      velocityMps: v,
      angularVelocityRadPerSec: omega,
      regime: norm(slip) < SLIP_EPSILON_MPS ? "rolling-at-separation" : "sliding",
      impactAngleRad: 0,
      craterAngleRad: 0,
      effectiveNormal: n,
      normalImpactSpeedMps: 0,
      effectiveNormalImpactSpeedMps: 0,
      restitution: effectiveRestitution(surface, 0),
      normalImpulseNs: 0,
      tangentialImpulseNs: 0,
    };
  }

  const vt = addScaled(v, n, -vn);
  const vtSpeed = norm(vt);
  const impactAngle = Math.atan2(-vn, vtSpeed);
  // No tangential direction (vertical drop): the crater is symmetric and does not tilt.
  const thetaC = vtSpeed < SLIP_EPSILON_MPS ? 0 : craterAngleRad(surface, norm(v), impactAngle);
  let nEff = n;
  if (thetaC > 0) {
    const tilted = normalize(addScaled(scale(n, Math.cos(thetaC)), vt, -Math.sin(thetaC) / vtSpeed));
    if (tilted === null) throw new Error("resolveImpact: degenerate tilted normal");
    nEff = tilted;
  }

  const impulse = rigidImpulse(v, omega, nEff, surface, ball);
  if (!isFiniteVec(impulse.velocityMps) || !isFiniteVec(impulse.angularVelocityRadPerSec)) {
    throw new Error("resolveImpact: non-finite result");
  }
  return {
    ...impulse,
    impactAngleRad: impactAngle,
    craterAngleRad: thetaC,
    effectiveNormal: nEff,
    normalImpactSpeedMps: -vn,
  };
}

type RigidImpulse = Pick<
  ImpactResult,
  | "velocityMps"
  | "angularVelocityRadPerSec"
  | "regime"
  | "effectiveNormalImpactSpeedMps"
  | "restitution"
  | "normalImpulseNs"
  | "tangentialImpulseNs"
>;

/** Rigid-sphere Coulomb impulse against the plane with unit normal n (requires v . n < 0). */
function rigidImpulse(v: Vec3, omega: Vec3, n: Vec3, surface: SurfaceProperties, ball: BallConstants): RigidImpulse {
  const { massKg: m, radiusM: r, inertiaKgM2: I } = ball;
  const vn = dot(v, n);
  const vt = addScaled(v, n, -vn);
  const slip = addScaled(vt, cross(omega, scale(n, -r)), 1);
  const slipSpeed = norm(slip);

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
  return {
    velocityMps: vOut,
    angularVelocityRadPerSec: omegaOut,
    regime,
    effectiveNormalImpactSpeedMps: normalSpeed,
    restitution: e,
    normalImpulseNs: jn,
    tangentialImpulseNs: jt,
  };
}

/** Velocity of the contact point (-r n from the centre) relative to the ground, m/s. */
export function contactSlipVelocity(velocityMps: Vec3, angularVelocityRadPerSec: Vec3, normal: Vec3, radiusM: number): Vec3 {
  return sub(velocityMps, cross(angularVelocityRadPerSec, scale(normal, radiusM)));
}
