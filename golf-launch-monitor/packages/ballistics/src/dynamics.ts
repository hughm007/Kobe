/**
 * Internal equations of motion shared by forces.ts, flight.ts and propagate.ts, so every
 * public entry point evaluates exactly the same model. Hot paths work on scalars and
 * preallocated Float64Arrays; the public API wraps them in Vec3 objects.
 *
 * State layout (9-dim): [px, py, pz, vx, vy, vz, wx, wy, wz] in SI, world frame.
 */
import type { BallAerodynamicsProfile, EnvironmentProfile, Vec3 } from "@glm/shared-types";
import { resolveProfileModels } from "./aero-models";
import type { CoefficientModel, SpinDecayModel } from "./aero-models";

/** Below this air speed (m/s) the lift direction is undefined: no lift, S = 0. */
export const MIN_AIR_SPEED_FOR_LIFT_MPS = 1e-6;
/** Below this perpendicular spin (rad/s) the Magnus direction is undefined: no lift. */
export const MIN_PERPENDICULAR_SPIN_RAD_PER_SEC = 1e-9;

export type FlightContext = {
  readonly environment: EnvironmentProfile;
  readonly profile: BallAerodynamicsProfile;
  readonly rho: number;
  readonly mu: number;
  readonly gravity: number;
  readonly windX: number;
  readonly windY: number;
  readonly windZ: number;
  readonly massKg: number;
  readonly areaM2: number;
  readonly diameterM: number;
  readonly radiusM: number;
  readonly drag: CoefficientModel;
  readonly dragParams: Readonly<Record<string, number>>;
  readonly lift: CoefficientModel;
  readonly liftParams: Readonly<Record<string, number>>;
  readonly spinDecay: SpinDecayModel;
  /** Mutable scratch reused across evaluations (models must not retain it). */
  readonly aeroState: { speedMps: number; reynolds: number; spinParameter: number };
  readonly decayInput: { speedMps: number; angularSpeedRadPerSec: number; airDensityKgM3: number };
};

function requirePositiveFinite(label: string, value: number): void {
  if (!(Number.isFinite(value) && value > 0)) {
    throw new RangeError(`${label} must be a positive finite number, got ${value}`);
  }
}

/** Validates the profile geometry and resolves its models. Throws with a descriptive message. */
export function createFlightContext(environment: EnvironmentProfile, profile: BallAerodynamicsProfile): FlightContext {
  const id = `ball profile "${profile.id}"`;
  requirePositiveFinite(`${id} massKg`, profile.massKg);
  requirePositiveFinite(`${id} diameterM`, profile.diameterM);
  requirePositiveFinite(`${id} crossSectionAreaM2`, profile.crossSectionAreaM2);
  requirePositiveFinite(`${id} momentOfInertiaKgM2`, profile.momentOfInertiaKgM2);
  const models = resolveProfileModels(profile);
  // Density may be tiny (near-vacuum checks) but must be a finite non-negative number.
  if (!(Number.isFinite(environment.airDensityKgM3) && environment.airDensityKgM3 >= 0)) {
    throw new RangeError(`environment airDensityKgM3 must be finite and >= 0, got ${environment.airDensityKgM3}`);
  }
  requirePositiveFinite("environment airDynamicViscosityPaS", environment.airDynamicViscosityPaS);
  requirePositiveFinite("environment gravityMps2", environment.gravityMps2);
  const w = environment.windMps;
  if (!Number.isFinite(w.x) || !Number.isFinite(w.y) || !Number.isFinite(w.z)) {
    throw new RangeError("environment windMps components must be finite");
  }
  return {
    environment,
    profile,
    rho: environment.airDensityKgM3,
    mu: environment.airDynamicViscosityPaS,
    gravity: environment.gravityMps2,
    windX: w.x,
    windY: w.y,
    windZ: w.z,
    massKg: profile.massKg,
    areaM2: profile.crossSectionAreaM2,
    diameterM: profile.diameterM,
    radiusM: profile.diameterM / 2,
    drag: models.drag,
    dragParams: profile.dragModelParams,
    lift: models.lift,
    liftParams: profile.liftModelParams,
    spinDecay: models.spinDecay,
    aeroState: { speedMps: 0, reynolds: 0, spinParameter: 0 },
    decayInput: { speedMps: 0, angularSpeedRadPerSec: 0, airDensityKgM3: 0 },
  };
}

/**
 * Output of one aerodynamic evaluation. Index layout of `out` (length 15):
 * 0-2 drag accel, 3-5 lift accel, 6 air speed, 7 Re, 8 S, 9 C_D, 10 C_L,
 * 11 d|omega|/dt, 12-14 unused.
 */
export const AERO_OUT_LENGTH = 15;

/**
 * Drag and Magnus accelerations for ball velocity v and spin omega (world frame).
 *
 * v_air = v - wind. Drag = -0.5*rho*A*C_D*|v_air|*v_air/m. Lift direction is
 * unit(omega_perp x v_air) with magnitude 0.5*rho*A*C_L*|v_air|^2/m, where omega_perp is the
 * spin component perpendicular to v_air: rifle spin (omega parallel to v_air) produces no
 * Magnus force and does not enter the spin parameter.
 */
export function evaluateAerodynamics(
  ctx: FlightContext,
  vx: number,
  vy: number,
  vz: number,
  wx: number,
  wy: number,
  wz: number,
  out: Float64Array,
): void {
  const ax = vx - ctx.windX;
  const ay = vy - ctx.windY;
  const az = vz - ctx.windZ;
  const speed = Math.sqrt(ax * ax + ay * ay + az * az);
  const reynolds = (ctx.rho * speed * ctx.diameterM) / ctx.mu;

  let spinParameter = 0;
  let px = 0;
  let py = 0;
  let pz = 0;
  let perp = 0;
  if (speed >= MIN_AIR_SPEED_FOR_LIFT_MPS) {
    // omega_perp = omega - (omega . u) u, u = v_air/|v_air|
    const along = (wx * ax + wy * ay + wz * az) / (speed * speed);
    px = wx - along * ax;
    py = wy - along * ay;
    pz = wz - along * az;
    perp = Math.sqrt(px * px + py * py + pz * pz);
    spinParameter = (perp * ctx.radiusM) / speed;
  }

  const state = ctx.aeroState;
  state.speedMps = speed;
  state.reynolds = reynolds;
  state.spinParameter = spinParameter;
  const cd = ctx.drag.evaluate(state, ctx.dragParams);
  const cl = ctx.lift.evaluate(state, ctx.liftParams);

  const dragFactor = (-0.5 * ctx.rho * ctx.areaM2 * cd * speed) / ctx.massKg;
  out[0] = dragFactor * ax;
  out[1] = dragFactor * ay;
  out[2] = dragFactor * az;

  out[3] = 0;
  out[4] = 0;
  out[5] = 0;
  if (speed >= MIN_AIR_SPEED_FOR_LIFT_MPS && perp >= MIN_PERPENDICULAR_SPIN_RAD_PER_SEC) {
    // c = omega_perp x v_air, |c| = |omega_perp| |v_air| (perpendicular by construction)
    const cx = py * az - pz * ay;
    const cy = pz * ax - px * az;
    const cz = px * ay - py * ax;
    const cn = Math.sqrt(cx * cx + cy * cy + cz * cz);
    if (cn > 0) {
      const liftFactor = (0.5 * ctx.rho * ctx.areaM2 * cl * speed * speed) / (ctx.massKg * cn);
      out[3] = liftFactor * cx;
      out[4] = liftFactor * cy;
      out[5] = liftFactor * cz;
    }
  }

  const spin = Math.sqrt(wx * wx + wy * wy + wz * wz);
  let spinRate = 0;
  if (spin > 0) {
    const input = ctx.decayInput;
    input.speedMps = speed;
    input.angularSpeedRadPerSec = spin;
    input.airDensityKgM3 = ctx.rho;
    spinRate = Math.min(0, ctx.spinDecay.angularDeceleration(input, ctx.profile));
  }

  out[6] = speed;
  out[7] = reynolds;
  out[8] = spinParameter;
  out[9] = cd;
  out[10] = cl;
  out[11] = spinRate;
}

/**
 * State derivative. Spin MAGNITUDE decays per the spin-decay model while the spin axis
 * direction is preserved (gyroscopic stiffness; no precession is modelled).
 */
export function stateDerivative(ctx: FlightContext, s: Float64Array, out: Float64Array, aero: Float64Array): void {
  const wx = s[6] as number;
  const wy = s[7] as number;
  const wz = s[8] as number;
  evaluateAerodynamics(ctx, s[3] as number, s[4] as number, s[5] as number, wx, wy, wz, aero);
  out[0] = s[3] as number;
  out[1] = s[4] as number;
  out[2] = s[5] as number;
  out[3] = (aero[0] as number) + (aero[3] as number);
  out[4] = (aero[1] as number) + (aero[4] as number);
  out[5] = (aero[2] as number) + (aero[5] as number) - ctx.gravity;
  const spin = Math.sqrt(wx * wx + wy * wy + wz * wz);
  if (spin > 0) {
    const k = (aero[11] as number) / spin;
    out[6] = k * wx;
    out[7] = k * wy;
    out[8] = k * wz;
  } else {
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
  }
}

/** Classical fourth-order Runge-Kutta stepper with preallocated scratch buffers. */
export class Rk4Stepper {
  private readonly k1 = new Float64Array(9);
  private readonly k2 = new Float64Array(9);
  private readonly k3 = new Float64Array(9);
  private readonly k4 = new Float64Array(9);
  private readonly tmp = new Float64Array(9);
  private readonly aero = new Float64Array(AERO_OUT_LENGTH);
  private readonly ctx: FlightContext;
  /**
   * h/tau of the most recent step: its size times the spin-decay rate |d|omega|/dt| / |omega|
   * at its start state (0 without spin). Read by spinDecayStepFailure.
   */
  lastSpinDecayStepRatio = 0;

  constructor(ctx: FlightContext) {
    this.ctx = ctx;
  }

  /** out = RK4 step of size h from s. `out` may alias `s`. */
  step(s: Float64Array, h: number, out: Float64Array): void {
    const { k1, k2, k3, k4, tmp, aero, ctx } = this;
    stateDerivative(ctx, s, k1, aero);
    const w2 = (s[6] as number) ** 2 + (s[7] as number) ** 2 + (s[8] as number) ** 2;
    const dw2 = (k1[6] as number) ** 2 + (k1[7] as number) ** 2 + (k1[8] as number) ** 2;
    this.lastSpinDecayStepRatio = w2 > 0 ? h * Math.sqrt(dw2 / w2) : 0;
    for (let i = 0; i < 9; i++) tmp[i] = (s[i] as number) + 0.5 * h * (k1[i] as number);
    stateDerivative(ctx, tmp, k2, aero);
    for (let i = 0; i < 9; i++) tmp[i] = (s[i] as number) + 0.5 * h * (k2[i] as number);
    stateDerivative(ctx, tmp, k3, aero);
    for (let i = 0; i < 9; i++) tmp[i] = (s[i] as number) + h * (k3[i] as number);
    stateDerivative(ctx, tmp, k4, aero);
    const h6 = h / 6;
    for (let i = 0; i < 9; i++) {
      out[i] =
        (s[i] as number) + h6 * ((k1[i] as number) + 2 * (k2[i] as number) + 2 * (k3[i] as number) + (k4[i] as number));
    }
  }
}

/**
 * Smallest spin-decay time constant, in integrator timesteps, that a profile's parameters may
 * produce anywhere in its applicability envelope. Explicit RK4 applied to
 * d|omega|/dt = -|omega|/tau multiplies the spin by 1 + z + z^2/2 + z^3/6 + z^4/24 per step
 * (z = -h/tau), which exceeds 1 — spin GROWS — once h/tau > ~2.785. tau >= 4 h keeps the update
 * accurate (relative error < 1e-4 per step).
 */
export const MIN_SPIN_DECAY_TIME_CONSTANT_STEPS = 4;

/**
 * Largest h/tau accepted at run time (states outside the envelope, e.g. far above its top
 * speed). The RK4 spin factor decreases monotonically in h/tau up to ~1.6, so with h/tau <= 1
 * every partial step (samples, contact bisection) also shows spin only decaying.
 */
export const MAX_SPIN_DECAY_STEP_RATIO = 1;

const RAD_PER_SEC_PER_RPM = (2 * Math.PI) / 60;

/**
 * Throws if the profile's spin-decay PARAMETERS are too stiff for the timestep: the local time
 * constant |omega| / |d|omega|/dt| at the top of the profile's applicability envelope (maximum
 * applicable speed and spin; the moment model's rate grows with speed) is shorter than
 * MIN_SPIN_DECAY_TIME_CONSTANT_STEPS steps. States outside the envelope are covered at run time
 * by spinGrewOrReversed. Skipped if the profile's ranges are not positive finite numbers.
 */
export function assertSpinDecayResolvable(ctx: FlightContext, timestepS: number, label: string): void {
  const speed = ctx.profile.applicableSpeedRangeMps.max;
  const spin = ctx.profile.applicableSpinRangeRpm.max * RAD_PER_SEC_PER_RPM;
  if (!(Number.isFinite(speed) && speed > 0 && Number.isFinite(spin) && spin > 0)) return;
  const rate = -Math.min(
    0,
    ctx.spinDecay.angularDeceleration({ speedMps: speed, angularSpeedRadPerSec: spin, airDensityKgM3: ctx.rho }, ctx.profile),
  );
  const tau = rate > 0 ? spin / rate : Number.POSITIVE_INFINITY;
  const minTau = MIN_SPIN_DECAY_TIME_CONSTANT_STEPS * timestepS;
  if (!(tau >= minTau)) {
    throw new RangeError(
      `${label}: spin-decay model "${ctx.spinDecay.id}" of ball profile "${ctx.profile.id}" has a time constant of ` +
        `${tau.toPrecision(3)} s at ${speed.toFixed(1)} m/s air speed (top of the profile's applicable range), shorter than ` +
        `${MIN_SPIN_DECAY_TIME_CONSTANT_STEPS} timesteps (${minTau} s); fixed-step RK4 cannot resolve it and would make the ` +
        "spin grow. Check the spin-decay parameters (realistic time constants are ~10-30 s) or reduce timestepS",
    );
  }
}

/**
 * True if a step from `s` to `next` increased |omega| or reversed the spin axis. Aerodynamic
 * torque only removes spin, so either means the decay was too stiff for the step (the
 * integrator's amplification factor exceeded 1), not physics.
 */
function spinGrewOrReversed(s: Float64Array, next: Float64Array): boolean {
  const ax = s[6] as number;
  const ay = s[7] as number;
  const az = s[8] as number;
  const bx = next[6] as number;
  const by = next[7] as number;
  const bz = next[8] as number;
  const before = ax * ax + ay * ay + az * az;
  const after = bx * bx + by * by + bz * bz;
  return after > before * (1 + 1e-12) || ax * bx + ay * by + az * bz < 0;
}

export function isFiniteState(s: Float64Array): boolean {
  for (let i = 0; i < 9; i++) if (!Number.isFinite(s[i] as number)) return false;
  return true;
}

/** Packs world-frame vectors into a 9-dim state; throws on any non-finite component. */
export function stateFromVectors(positionM: Vec3, velocityMps: Vec3, angularVelocityRadPerSec: Vec3, label: string): Float64Array {
  const s = new Float64Array([
    positionM.x,
    positionM.y,
    positionM.z,
    velocityMps.x,
    velocityMps.y,
    velocityMps.z,
    angularVelocityRadPerSec.x,
    angularVelocityRadPerSec.y,
    angularVelocityRadPerSec.z,
  ]);
  if (!isFiniteState(s)) throw new RangeError(`${label} must have finite position, velocity and angular velocity`);
  return s;
}

/**
 * Why the step just taken by `stepper` from `s` to `next` cannot be trusted to decay the spin
 * (decay unresolved: h/tau > MAX_SPIN_DECAY_STEP_RATIO, or the spin grew / reversed), or null.
 * Callers stop with a numerical failure rather than report amplified spin as physics.
 */
export function spinDecayStepFailure(stepper: Rk4Stepper, s: Float64Array, next: Float64Array): string | null {
  const ratio = stepper.lastSpinDecayStepRatio;
  if (ratio > MAX_SPIN_DECAY_STEP_RATIO) {
    return `the spin-decay time constant fell below one timestep (h/tau = ${ratio.toPrecision(3)})`;
  }
  if (spinGrewOrReversed(s, next)) return "the spin magnitude increased or the spin axis reversed";
  return null;
}
