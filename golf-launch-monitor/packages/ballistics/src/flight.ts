/**
 * Air-flight integration from a ball state to the next ground contact
 * (docs/physics-model.md §4-5). Bounce and roll are NOT handled here: the result's
 * `contact` is the hand-off point to the ground-physics package.
 */
import { deepFreeze } from "@glm/shared-types";
import type {
  AirFlightResult,
  BallAerodynamicsProfile,
  EnvironmentProfile,
  FlightTermination,
  SimulationSettings,
  TerrainQuery,
  TerrainSample,
  TrajectorySample,
  Vec3,
} from "@glm/shared-types";
import {
  AERO_OUT_LENGTH,
  assertSpinDecayResolvable,
  createFlightContext,
  evaluateAerodynamics,
  isFiniteState,
  Rk4Stepper,
  spinDecayStepFailure,
  stateFromVectors,
} from "./dynamics";
import type { FlightContext } from "./dynamics";

export { MAX_SPIN_DECAY_STEP_RATIO, MIN_SPIN_DECAY_TIME_CONSTANT_STEPS } from "./dynamics";
import { PHYSICS_MODEL_VERSION } from "./versions";

export type BallState = {
  readonly positionM: Vec3;
  readonly velocityMps: Vec3;
  readonly angularVelocityRadPerSec: Vec3;
};

export const DEFAULT_SIMULATION_SETTINGS: SimulationSettings = deepFreeze({
  timestepS: 0.001,
  maxFlightTimeS: 20,
  maxGroundTimeS: 30,
  outputSampleIntervalS: 0.01,
  monteCarloSamples: 0,
  monteCarloSeed: 1,
});

export type FlightSegmentOptions = {
  readonly environment: EnvironmentProfile;
  readonly ballProfile: BallAerodynamicsProfile;
  readonly terrain: TerrainQuery;
  readonly settings: SimulationSettings;
  /** Absolute time of `initial` on the launch-relative clock, s (default 0; must be >= 0). */
  readonly startTimeS?: number;
  /** Phase label for samples; "bounce-air" segments start in contact moving away. Default "air". */
  readonly phase?: "air" | "bounce-air";
};

export type FlightContact = {
  /** Absolute time of first ground contact, s. */
  readonly timeS: number;
  /** Ball state at contact (ball within one radius of the surface along its normal). */
  readonly state: BallState;
  readonly terrain: TerrainSample;
};

export type FlightSegmentResult = {
  readonly airFlight: AirFlightResult;
  readonly contact: FlightContact | null;
};

/** Contact time is located to within this bracket width, s (spec: <= 1e-6 s). */
export const CONTACT_TIME_TOLERANCE_S = 1e-7;
/** A segment that starts in contact counts as separated once the clearance exceeds this, m. */
export const SEPARATION_CLEARANCE_M = 1e-9;
/** Largest accepted fixed timestep, s. Coarser steps are rejected rather than silently inaccurate. */
export const MAX_TIMESTEP_S = 0.05;
const MAX_OUTPUT_SAMPLES = 1_000_000;
const RAD_PER_SEC_PER_RPM = (2 * Math.PI) / 60;

/** Throws on settings that cannot produce a meaningful air-flight integration. */
export function validateFlightSettings(settings: SimulationSettings): void {
  const { timestepS, maxFlightTimeS, outputSampleIntervalS } = settings;
  if (!(Number.isFinite(timestepS) && timestepS > 0 && timestepS <= MAX_TIMESTEP_S)) {
    throw new RangeError(`settings.timestepS must be in (0, ${MAX_TIMESTEP_S}] s, got ${timestepS} (default 0.001)`);
  }
  if (!(Number.isFinite(maxFlightTimeS) && maxFlightTimeS > 0)) {
    throw new RangeError(`settings.maxFlightTimeS must be a positive finite number of seconds, got ${maxFlightTimeS}`);
  }
  if (!(Number.isFinite(outputSampleIntervalS) && outputSampleIntervalS > 0)) {
    throw new RangeError(`settings.outputSampleIntervalS must be a positive finite number of seconds, got ${outputSampleIntervalS}`);
  }
  if (maxFlightTimeS / outputSampleIntervalS > MAX_OUTPUT_SAMPLES) {
    throw new RangeError(
      `settings.outputSampleIntervalS ${outputSampleIntervalS} s would retain more than ${MAX_OUTPUT_SAMPLES} samples over maxFlightTimeS ${maxFlightTimeS} s`,
    );
  }
}

function vecAt(s: Float64Array, offset: number): Vec3 {
  return { x: s[offset] as number, y: s[offset + 1] as number, z: s[offset + 2] as number };
}

function arrayToBallState(s: Float64Array): BallState {
  return { positionM: vecAt(s, 0), velocityMps: vecAt(s, 3), angularVelocityRadPerSec: vecAt(s, 6) };
}

type Clearance = {
  /** Signed distance of the ball surface from the terrain along the normal, m. */
  readonly gapM: number;
  /** Ball velocity along the outward unit normal, m/s (> 0 = moving away). */
  readonly normalSpeedMps: number;
  readonly sample: TerrainSample;
};

/**
 * g = (p - groundPointBelow) . n - r with groundPointBelow = (x, y, height(x, y)) and n the
 * unit outward normal there. For a plane this is the exact perpendicular clearance.
 */
function clearance(terrain: TerrainQuery, s: Float64Array, radiusM: number): Clearance {
  const x = s[0] as number;
  const y = s[1] as number;
  const sample = terrain.sample(x, y);
  const n = sample.normal;
  const nn = Math.sqrt(n.x * n.x + n.y * n.y + n.z * n.z);
  if (!Number.isFinite(sample.heightM) || !(nn > 0) || !Number.isFinite(nn)) {
    throw new Error(
      `terrain "${terrain.id}" returned an invalid sample at (${x}, ${y}): heightM=${sample.heightM}, normal=(${n.x}, ${n.y}, ${n.z})`,
    );
  }
  const gapM = (((s[2] as number) - sample.heightM) * n.z) / nn - radiusM;
  const normalSpeedMps = ((s[3] as number) * n.x + (s[4] as number) * n.y + (s[5] as number) * n.z) / nn;
  return { gapM, normalSpeedMps, sample };
}

function formatRange(min: number, max: number, digits: number): string {
  return `${min.toFixed(digits)}-${max.toFixed(digits)}`;
}

/** Human-readable applicability warnings for the segment's initial state, each stated once. */
function launchApplicabilityWarnings(
  ctx: FlightContext,
  s: Float64Array,
  phase: "air" | "bounce-air",
): string[] {
  const warnings: string[] = [];
  const profile = ctx.profile;
  const label = phase === "air" ? "Launch" : "Bounce-segment start";
  const vx = s[3] as number;
  const vy = s[4] as number;
  const vz = s[5] as number;
  const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);
  const sr = profile.applicableSpeedRangeMps;
  if (speed < sr.min || speed > sr.max) {
    warnings.push(
      `${label} ball speed ${speed.toFixed(1)} m/s is ${speed < sr.min ? "below" : "above"} the applicable range of ball profile "${profile.id}" (${formatRange(sr.min, sr.max, 1)} m/s); aerodynamic coefficients are extrapolated.`,
    );
  }
  const wx = s[6] as number;
  const wy = s[7] as number;
  const wz = s[8] as number;
  const spinRpm = Math.sqrt(wx * wx + wy * wy + wz * wz) / RAD_PER_SEC_PER_RPM;
  const rr = profile.applicableSpinRangeRpm;
  if (spinRpm < rr.min || spinRpm > rr.max) {
    warnings.push(
      `${label} spin ${spinRpm.toFixed(0)} rpm is ${spinRpm < rr.min ? "below" : "above"} the applicable range of ball profile "${profile.id}" (${formatRange(rr.min, rr.max, 0)} rpm); lift and spin decay are extrapolated.`,
    );
  }

  const aero = new Float64Array(AERO_OUT_LENGTH);
  evaluateAerodynamics(ctx, vx, vy, vz, wx, wy, wz, aero);
  const reynolds = aero[7] as number;
  const spinParameter = aero[8] as number;
  const models = [ctx.drag, ctx.lift];
  const reOutside = models.filter((m) => reynolds < m.validity.reynolds.min || reynolds > m.validity.reynolds.max);
  if (reOutside.length > 0) {
    warnings.push(
      `${label} Reynolds number ${reynolds.toExponential(2)} is outside the validity range of ${reOutside
        .map((m) => `${m.id} (${m.validity.reynolds.min.toExponential(1)}-${m.validity.reynolds.max.toExponential(1)})`)
        .join(" and ")}.`,
    );
  }
  const sOutside = models.filter(
    (m) => spinParameter < m.validity.spinParameter.min || spinParameter > m.validity.spinParameter.max,
  );
  if (sOutside.length > 0) {
    warnings.push(
      `${label} spin parameter ${spinParameter.toFixed(3)} is outside the validity range of ${sOutside
        .map((m) => `${m.id} (${formatRange(m.validity.spinParameter.min, m.validity.spinParameter.max, 2)})`)
        .join(" and ")}.`,
    );
  }
  return warnings;
}

function toSample(s: Float64Array, tS: number, phase: "air" | "bounce-air"): TrajectorySample {
  return {
    tS,
    positionM: vecAt(s, 0),
    velocityMps: vecAt(s, 3),
    angularVelocityRadPerSec: vecAt(s, 6),
    phase,
  };
}

function copyTerrainSample(sample: TerrainSample): TerrainSample {
  return { heightM: sample.heightM, normal: { ...sample.normal }, surface: { ...sample.surface } };
}

/**
 * Integrates air flight with fixed-step classical RK4 until ground contact, the time limit,
 * or a numerical failure. Deterministic: the same inputs give bit-identical output on the
 * same JavaScript engine (Math.exp/Math.pow are implementation-approximated, so results can
 * differ in the last bits across engines).
 *
 * Ground contact is the first step on which the clearance g crosses from > 0 to <= 0; the
 * crossing time is then bracketed to CONTACT_TIME_TOLERANCE_S by bisection over partial RK4
 * steps from the step start, and the reported contact state is the bracket end with g <= 0.
 * A segment that starts above the surface but within the separation tolerance and moving
 * toward it is an ordinary crossing. A segment that starts touching or inside the surface
 * (g <= 0) while moving INTO it (v.n < 0, e.g. a topped shot) reports contact at its start
 * state (zero length: the contact is already happening). Otherwise a segment that starts in
 * contact (g <= 1e-9, e.g. a ball on the ground or a bounce moving away) must first separate;
 * if it never separates and its normal velocity turns inward, contact is reported at the end
 * of that step.
 *
 * Throws (RangeError) on invalid settings, a negative or non-finite startTimeS, a non-finite
 * initial state, an invalid profile, or a spin-decay model too stiff for the timestep.
 */
export function simulateFlightSegment(initial: BallState, options: FlightSegmentOptions): FlightSegmentResult {
  const { settings, terrain } = options;
  validateFlightSettings(settings);
  const startTimeS = options.startTimeS ?? 0;
  if (!(Number.isFinite(startTimeS) && startTimeS >= 0)) {
    throw new RangeError(`startTimeS must be a finite time >= 0 s on the launch-relative clock, got ${startTimeS}`);
  }
  const phase = options.phase ?? "air";
  const ctx = createFlightContext(options.environment, options.ballProfile);
  const stepper = new Rk4Stepper(ctx);
  const radiusM = ctx.radiusM;

  const dt = settings.timestepS;
  const maxT = settings.maxFlightTimeS;
  const interval = settings.outputSampleIntervalS;
  const timeEps = dt * 1e-9;

  let cur = stateFromVectors(initial.positionM, initial.velocityMps, initial.angularVelocityRadPerSec, "initial state");
  assertSpinDecayResolvable(ctx, dt, "simulateFlightSegment");
  let next: Float64Array = new Float64Array(9);
  const probe = new Float64Array(9);
  const hiState = new Float64Array(9);

  const warnings = launchApplicabilityWarnings(ctx, cur, phase);
  const samples: TrajectorySample[] = [toSample(cur, startTimeS, phase)];
  const launchZ = cur[2] as number;
  let apexZ = launchZ;
  let apexElapsed = 0;
  let apexPos = vecAt(cur, 0);

  const initialClearance = clearance(terrain, cur, radiusM);
  const movingInward = initialClearance.normalSpeedMps < 0;
  // Touching or inside the surface and moving into it: contact is happening now. Stepping first
  // would report it a full step late with the ball embedded in the ground.
  const startsInContactMovingInward = initialClearance.gapM <= 0 && movingInward;
  // Above the surface (even within the separation tolerance) and approaching it: an ordinary
  // crossing that bisection locates. Otherwise a start within the tolerance must separate first.
  let separated = initialClearance.gapM > SEPARATION_CLEARANCE_M || (initialClearance.gapM > 0 && movingInward);
  let gapPrev = initialClearance.gapM;

  let nextSampleIndex = 1;
  let k = 0;
  let elapsed = 0;
  let termination: FlightTermination = "max-time";
  let contact: FlightContact | null = null;
  let finalState: Float64Array = cur;
  let finalElapsed = 0;
  if (startsInContactMovingInward) {
    termination = "ground-contact";
    contact = {
      timeS: startTimeS,
      state: arrayToBallState(cur),
      terrain: copyTerrainSample(initialClearance.sample),
    };
  }

  /** Emit regular samples with elapsed time in (stepStart, until], `until` inclusive unless excluded. */
  const emitSamples = (stepStart: Float64Array, stepStartElapsed: number, h: number, stepEnd: Float64Array, until: number, inclusive: boolean): void => {
    for (;;) {
      const te = nextSampleIndex * interval;
      if (inclusive ? te > until + timeEps : te >= until - timeEps) break;
      if (Math.abs(te - (stepStartElapsed + h)) <= timeEps) {
        samples.push(toSample(stepEnd, startTimeS + te, phase));
      } else {
        stepper.step(stepStart, te - stepStartElapsed, probe);
        // A partial step from a finite state whose full step is finite should be finite;
        // never emit a NaN sample if it is not.
        if (isFiniteState(probe)) samples.push(toSample(probe, startTimeS + te, phase));
      }
      nextSampleIndex++;
    }
  };

  while (!startsInContactMovingInward) {
    if (elapsed >= maxT - timeEps) {
      termination = "max-time";
      finalState = cur;
      finalElapsed = elapsed;
      break;
    }
    const lastStep = (k + 1) * dt > maxT - timeEps;
    const h = lastStep ? maxT - elapsed : dt;
    const endElapsed = lastStep ? maxT : (k + 1) * dt;
    stepper.step(cur, h, next);
    if (!isFiniteState(next)) {
      termination = "numerical-failure";
      finalState = cur;
      finalElapsed = elapsed;
      warnings.push(
        `Integration produced a non-finite state between t = ${(startTimeS + elapsed).toFixed(4)} s and ${(startTimeS + endElapsed).toFixed(4)} s; flight stopped (numerical failure) and later results are unavailable.`,
      );
      break;
    }
    const spinFailure = spinDecayStepFailure(stepper, cur, next);
    if (spinFailure !== null) {
      termination = "numerical-failure";
      finalState = cur;
      finalElapsed = elapsed;
      warnings.push(
        `Spin decay could not be integrated between t = ${(startTimeS + elapsed).toFixed(4)} s and ${(startTimeS + endElapsed).toFixed(4)} s: ${spinFailure}; spin-decay model "${ctx.spinDecay.id}" is too stiff for timestepS ${dt} s at this air speed. Flight stopped (numerical failure) and later results are unavailable.`,
      );
      break;
    }
    const c = clearance(terrain, next, radiusM);

    let contactTau: number | null = null;
    let contactSample: TerrainSample | null = null;
    if (separated) {
      if (gapPrev > 0 && c.gapM <= 0) {
        // Bisection on partial RK4 steps from the step start: g(lo) > 0 >= g(hi).
        let lo = 0;
        let hi = h;
        hiState.set(next);
        let hiSample = c.sample;
        while (hi - lo > CONTACT_TIME_TOLERANCE_S) {
          const mid = 0.5 * (lo + hi);
          stepper.step(cur, mid, probe);
          if (!isFiniteState(probe)) {
            lo = mid;
            continue;
          }
          const pc = clearance(terrain, probe, radiusM);
          if (pc.gapM <= 0) {
            hi = mid;
            hiState.set(probe);
            hiSample = pc.sample;
          } else {
            lo = mid;
          }
        }
        contactTau = hi;
        contactSample = hiSample;
      }
    } else if (c.gapM > SEPARATION_CLEARANCE_M) {
      separated = true;
    } else if (c.normalSpeedMps <= 0) {
      // Started in contact and never separated: hand back to the ground model now.
      contactTau = h;
      hiState.set(next);
      contactSample = c.sample;
    }

    if (contactTau !== null && contactSample !== null) {
      const contactElapsed = elapsed + contactTau;
      emitSamples(cur, elapsed, h, next, contactElapsed, false);
      if ((hiState[2] as number) > apexZ) {
        apexZ = hiState[2] as number;
        apexElapsed = contactElapsed;
        apexPos = vecAt(hiState, 0);
      }
      termination = "ground-contact";
      finalState = hiState;
      finalElapsed = contactElapsed;
      contact = {
        timeS: startTimeS + contactElapsed,
        state: arrayToBallState(hiState),
        terrain: copyTerrainSample(contactSample),
      };
      break;
    }

    emitSamples(cur, elapsed, h, next, endElapsed, true);
    if ((next[2] as number) > apexZ) {
      apexZ = next[2] as number;
      apexElapsed = endElapsed;
      apexPos = vecAt(next, 0);
    }
    gapPrev = c.gapM;
    const swap = cur;
    cur = next;
    next = swap;
    k++;
    elapsed = endElapsed;
  }

  const lastSample = samples[samples.length - 1] as TrajectorySample;
  if (Math.abs(lastSample.tS - (startTimeS + finalElapsed)) > timeEps) {
    samples.push(toSample(finalState, startTimeS + finalElapsed, phase));
  }

  const airFlight: AirFlightResult = {
    modelVersion: PHYSICS_MODEL_VERSION,
    integrator: { method: "rk4", timestepS: dt },
    dragModelId: ctx.drag.id,
    liftModelId: ctx.lift.id,
    spinDecayModelId: ctx.spinDecay.id,
    samples,
    termination,
    flightTimeS: finalElapsed,
    apex: {
      timeS: startTimeS + apexElapsed,
      positionM: apexPos,
      heightAboveLaunchM: apexZ - launchZ,
    },
    applicabilityWarnings: warnings,
  };
  return deepFreeze({ airFlight, contact });
}
