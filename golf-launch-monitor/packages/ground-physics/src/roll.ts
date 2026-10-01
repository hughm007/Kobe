import {
  deepFreeze,
  type SurfaceProperties,
  type SurfaceType,
  type TerrainQuery,
  type TrajectorySample,
  type Vec3,
} from "@glm/shared-types";
import { add, addScaled, cross, dot, horizontalDistance, isFiniteVec, norm, normalize, scale } from "@glm/core-math";
import { ballConstants, type BallInertiaProfile } from "./ball";
import { effectiveRollingResistance } from "./surface-response";

export type RollSettings = {
  /** Fixed integration step, s. */
  readonly timestepS: number;
  /** Duration limit of this roll phase, measured from startTimeS, s. */
  readonly maxTimeS: number;
  readonly outputSampleIntervalS: number;
  readonly restSpeedMps: number;
  readonly slipToRollToleranceMps: number;
};

export type RollInput = {
  /** Ball centre, m. Projected onto the surface (centre = ground point + r n) before integrating. */
  readonly positionM: Vec3;
  /** Normal component is removed before integrating. */
  readonly velocityMps: Vec3;
  readonly angularVelocityRadPerSec: Vec3;
  readonly terrain: TerrainQuery;
  readonly ballProfile: BallInertiaProfile;
  readonly gravityMps2: number;
  /** Absolute time (s since the launch reference) at which the roll phase starts. */
  readonly startTimeS: number;
  readonly settings: RollSettings;
};

export type RollTermination = "rest" | "terminal-surface" | "max-time";

export type RollResult = {
  /** Phase "roll", absolute times, strictly increasing. Includes the skid portion. */
  readonly samples: readonly TrajectorySample[];
  /** Ball centre where the phase ended. */
  readonly restPositionM: Vec3;
  readonly restTimeS: number;
  readonly termination: RollTermination;
  readonly finalSurface: SurfaceType;
  /** Horizontal displacement from the phase start to the onset of pure rolling (or to the end if it never rolled), m. */
  readonly skidDistanceM: number;
  /** Ball centre where pure rolling began, or null if the ball never stopped slipping. */
  readonly rollStartPositionM: Vec3 | null;
};

/** Speeds below this have no defined direction; rolling resistance then opposes the slope pull. */
const DIRECTION_EPSILON_MPS = 1e-9;

type Frame = {
  readonly positionM: Vec3;
  readonly normal: Vec3;
  readonly surface: SurfaceProperties;
};

function assertSetting(name: string, value: number, allowZero: boolean): void {
  if (!Number.isFinite(value) || value < 0 || (!allowZero && value === 0)) {
    throw new RangeError(`simulateRoll: ${name} must be ${allowZero ? "non-negative" : "positive"} and finite, got ${value}`);
  }
}

function tangential(v: Vec3, n: Vec3): Vec3 {
  return addScaled(v, n, -dot(v, n));
}

/**
 * Skid-and-roll on terrain with a fixed-step midpoint (RK2) integrator, which is exact for
 * the piecewise-constant accelerations of a ball on a plane (docs/terrain-model.md §4).
 *
 * Contact: centre = ground point + r n. Gravity splits into g_n = g n_z (into the surface)
 * and the tangential pull g_t = (0, 0, -g) + g_n n.
 * Sliding (|u| >= tolerance, u = v + omega x (-r n)):
 *   dv/dt = g_t - mu g_n u_hat,   d omega/dt = (mu g_n / (k r)) (n x u_hat)
 *   the slip then shrinks at mu g_n (1 + 1/k) on flat ground; the zero crossing is located
 *   within the step so that no-spin sliding ends exactly at v0 / (1 + k).
 * Rolling (omega = (n x v) / r):
 *   dv/dt = g_t / (1 + k) - c_rr g_n v_hat
 * Rest: speed < restSpeed AND |g_t| / (1 + k) <= c_rr g_n; the exact stopping point within a
 * step is located when the slope cannot overcome rolling resistance. Terminal surfaces stop
 * the ball on entry (checked at the contact point at every step).
 */
export function simulateRoll(input: RollInput): RollResult {
  const { terrain, settings } = input;
  const g = input.gravityMps2;
  assertSetting("gravityMps2", g, false);
  assertSetting("timestepS", settings.timestepS, false);
  assertSetting("maxTimeS", settings.maxTimeS, true);
  assertSetting("outputSampleIntervalS", settings.outputSampleIntervalS, false);
  assertSetting("restSpeedMps", settings.restSpeedMps, true);
  assertSetting("slipToRollToleranceMps", settings.slipToRollToleranceMps, false);
  // Times are seconds since the launch reference (contract: non-negative).
  if (!Number.isFinite(input.startTimeS) || input.startTimeS < 0) {
    throw new RangeError(`simulateRoll: startTimeS must be finite and >= 0, got ${input.startTimeS}`);
  }
  if (!isFiniteVec(input.positionM) || !isFiniteVec(input.velocityMps) || !isFiniteVec(input.angularVelocityRadPerSec)) {
    throw new RangeError("simulateRoll: initial state must be finite");
  }

  const ball = ballConstants(input.ballProfile);
  const r = ball.radiusM;
  const k = ball.inertiaRatio;
  const dt = settings.timestepS;
  const endTimeS = input.startTimeS + settings.maxTimeS;
  const gravity: Vec3 = { x: 0, y: 0, z: -g };

  /** Samples the terrain at the contact point (centre - r n) and snaps the centre to distance r. */
  const frameAt = (centre: Vec3, normalGuess: Vec3): Frame => {
    const sample = terrain.sample(centre.x - r * normalGuess.x, centre.y - r * normalGuess.y);
    const n = unitUpwardNormal(sample.normal);
    const ground: Vec3 = { x: centre.x - r * normalGuess.x, y: centre.y - r * normalGuess.y, z: sample.heightM };
    // Signed distance of the centre from the local tangent plane, exact for planar terrain.
    const distance = dot({ x: centre.x - ground.x, y: centre.y - ground.y, z: centre.z - ground.z }, n);
    return { positionM: addScaled(centre, n, r - distance), normal: n, surface: sample.surface };
  };

  // Initial frame: guess the normal from the sample directly below the centre.
  let frame = frameAt(input.positionM, unitUpwardNormal(terrain.sample(input.positionM.x, input.positionM.y).normal));
  frame = frameAt(frame.positionM, frame.normal);
  let p = frame.positionM;
  let n = frame.normal;
  let v = tangential(input.velocityMps, n);
  let w: Vec3 = { ...input.angularVelocityRadPerSec };
  let t = input.startTimeS;
  const startPosition = p;

  const slipOf = (vel: Vec3, omega: Vec3, normal: Vec3): Vec3 => add(vel, cross(omega, scale(normal, -r)));
  const rollingOmega = (vel: Vec3, normal: Vec3): Vec3 => scale(cross(normal, vel), 1 / r);

  let rolling = norm(slipOf(v, w, n)) < settings.slipToRollToleranceMps;
  let rollStart: Vec3 | null = null;
  if (rolling) {
    rollStart = p;
    w = rollingOmega(v, n);
  }

  const samples: TrajectorySample[] = [];
  const pushSample = (): void => {
    const last = samples[samples.length - 1];
    if (last !== undefined && !(t > last.tS)) return;
    samples.push({ tS: t, positionM: p, velocityMps: v, angularVelocityRadPerSec: w, phase: "roll" });
  };
  pushSample();
  const sampleOriginS = t;
  const sampleIntervalS = settings.outputSampleIntervalS;
  let nextSampleT = sampleOriginS + sampleIntervalS;
  /**
   * Emits a sample when t reaches the next output time, then moves that time to the first grid
   * point after t in closed form. (Repeatedly adding the interval never advances when the
   * interval is below one ulp of t, which would hang; at most one sample per step results.)
   */
  const maybeSample = (): void => {
    if (t < nextSampleT - 1e-9) return;
    pushSample();
    nextSampleT = sampleOriginS + (Math.floor((t + 1e-9 - sampleOriginS) / sampleIntervalS) + 1) * sampleIntervalS;
  };

  let termination: RollTermination = "max-time";
  const maxIterations = Math.ceil(settings.maxTimeS / dt) * 2 + 16;

  for (let iteration = 0; ; iteration++) {
    frame = frameAt(p, n);
    p = frame.positionM;
    n = frame.normal;
    const surface = frame.surface;
    if (surface.terminal) {
      termination = "terminal-surface";
      break;
    }
    const remaining = endTimeS - t;
    if (!(remaining > 1e-12) || iteration >= maxIterations) {
      termination = "max-time";
      break;
    }
    const h = Math.min(dt, remaining);
    v = tangential(v, n);

    const gN = g * n.z;
    const gT = addScaled(gravity, n, gN);
    const mu = Math.max(0, surface.slidingFriction);
    const cRR = effectiveRollingResistance(surface);

    if (!rolling) {
      const u0 = slipOf(v, w, n);
      const u0Speed = norm(u0);
      if (u0Speed < settings.slipToRollToleranceMps) {
        rolling = true;
        rollStart = p;
        w = rollingOmega(v, n);
      } else {
        const slideDerivs = (vel: Vec3, omega: Vec3): { a: Vec3; wDot: Vec3 } => {
          const uHat = normalize(slipOf(vel, omega, n));
          if (uHat === null) return { a: gT, wDot: { x: 0, y: 0, z: 0 } };
          return {
            a: addScaled(gT, uHat, -mu * gN),
            wDot: scale(cross(n, uHat), (mu * gN) / (k * r)),
          };
        };
        const uHat0 = scale(u0, 1 / u0Speed);
        // Rate of change of the slip speed along its initial direction (constant on a plane).
        const slipRate = dot(gT, uHat0) - mu * gN * (1 + 1 / k);
        const d0 = slideDerivs(v, w);
        if (slipRate < 0 && u0Speed + slipRate * h <= 0) {
          // Slip reaches zero inside this step: advance exactly to that instant, then roll.
          const tau = u0Speed / -slipRate;
          p = addScaled(addScaled(p, v, tau), d0.a, 0.5 * tau * tau);
          v = addScaled(v, d0.a, tau);
          t += tau;
          frame = frameAt(p, n);
          p = frame.positionM;
          n = frame.normal;
          v = tangential(v, n);
          w = rollingOmega(v, n);
          rolling = true;
          rollStart = p;
        } else {
          const vHalf = addScaled(v, d0.a, h / 2);
          const wHalf = addScaled(w, d0.wDot, h / 2);
          const d1 = slideDerivs(vHalf, wHalf);
          p = addScaled(p, vHalf, h);
          v = addScaled(v, d1.a, h);
          w = addScaled(w, d1.wDot, h);
          t += h;
        }
        assertFiniteState(p, v, w);
        maybeSample();
        continue;
      }
    }

    // Rolling phase.
    const gTMag = norm(gT);
    const slopeDrive = gTMag / (1 + k);
    const resistance = cRR * gN;
    const canOvercome = slopeDrive > resistance;
    const speed = norm(v);
    if (speed < settings.restSpeedMps && !canOvercome) {
      v = { x: 0, y: 0, z: 0 };
      w = { x: 0, y: 0, z: 0 };
      termination = "rest";
      break;
    }
    const rollAccel = (vel: Vec3): Vec3 => {
      const s = norm(vel);
      const drive = scale(gT, 1 / (1 + k));
      if (s > DIRECTION_EPSILON_MPS) return addScaled(drive, vel, -resistance / s);
      // At (near) zero speed static resistance opposes the slope pull, up to its limit.
      if (!canOvercome || gTMag === 0) return { x: 0, y: 0, z: 0 };
      return scale(gT, (slopeDrive - resistance) / gTMag);
    };
    const a0 = rollAccel(v);
    if (!canOvercome && speed > DIRECTION_EPSILON_MPS) {
      const speedRate = dot(a0, v) / speed;
      if (speedRate < 0 && speed + speedRate * h <= 0) {
        // Comes to rest inside this step: advance exactly to the stopping instant.
        const tau = speed / -speedRate;
        p = addScaled(addScaled(p, v, tau), a0, 0.5 * tau * tau);
        t += tau;
        v = { x: 0, y: 0, z: 0 };
        w = { x: 0, y: 0, z: 0 };
        assertFiniteState(p, v, w);
        frame = frameAt(p, n);
        p = frame.positionM;
        n = frame.normal;
        termination = frame.surface.terminal ? "terminal-surface" : "rest";
        break;
      }
    }
    const vHalf = addScaled(v, a0, h / 2);
    const a1 = rollAccel(vHalf);
    p = addScaled(p, vHalf, h);
    v = addScaled(v, a1, h);
    w = rollingOmega(v, n);
    t += h;
    assertFiniteState(p, v, w);
    maybeSample();
  }

  // Final state: replaces a sample already taken at the same instant so the series ends on it.
  const lastSample = samples[samples.length - 1];
  if (lastSample !== undefined && !(t > lastSample.tS)) samples.pop();
  samples.push({ tS: t, positionM: p, velocityMps: v, angularVelocityRadPerSec: w, phase: "roll" });
  const result: RollResult = {
    samples,
    restPositionM: p,
    restTimeS: t,
    termination,
    finalSurface: frame.surface.type,
    skidDistanceM: horizontalDistance(startPosition, rollStart ?? p),
    rollStartPositionM: rollStart,
  };
  return deepFreeze(result);
}

/**
 * The contract promises a unit, upward normal; normalise anyway so a slightly non-unit normal
 * (e.g. from an interpolated height map) cannot skew g_n, g_t or the centre snap, and reject
 * a zero, non-finite or non-upward one with a validation error.
 */
function unitUpwardNormal(raw: Vec3): Vec3 {
  const n = isFiniteVec(raw) ? normalize(raw) : null;
  if (n === null || !(n.z > 0)) {
    throw new RangeError(`simulateRoll: terrain normal must be finite, non-zero and upward (z > 0), got (${raw.x}, ${raw.y}, ${raw.z})`);
  }
  return n;
}

function assertFiniteState(p: Vec3, v: Vec3, w: Vec3): void {
  if (!isFiniteVec(p) || !isFiniteVec(v) || !isFiniteVec(w)) {
    throw new Error("simulateRoll: non-finite state (numerical failure)");
  }
}
