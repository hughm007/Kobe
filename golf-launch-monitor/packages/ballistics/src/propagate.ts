/**
 * Ground-free trajectory propagation for launch-state estimators (docs/physics-model.md §6).
 *
 * Uses the same force model, the same fixed RK4 grid (steps of exactly `timestepS` from
 * t = 0) and the same partial-step rule for off-grid times as simulateFlightSegment, so a
 * requested time equal to a flight sample's elapsed time returns that sample's position
 * bit-for-bit (given the same timestep).
 */
import type { BallAerodynamicsProfile, EnvironmentProfile, Vec3 } from "@glm/shared-types";
import {
  assertSpinDecayResolvable,
  createFlightContext,
  isFiniteState,
  Rk4Stepper,
  spinDecayStepFailure,
  stateFromVectors,
} from "./dynamics";
import { DEFAULT_SIMULATION_SETTINGS, MAX_TIMESTEP_S } from "./flight";

export type PropagateOptions = {
  /** Fixed RK4 grid step, s (default DEFAULT_SIMULATION_SETTINGS.timestepS). */
  readonly timestepS?: number;
};

/**
 * Ball-center positions at elapsed times `dtS` (s since the state p0/v0/omega0), with no
 * ground. `dtS` must be finite, >= 0 and non-decreasing. Throws if the integration becomes
 * non-finite or the spin decay cannot be resolved by the timestep (never returns NaN or
 * spin-amplified positions), and if the profile's spin-decay model is too stiff for it.
 */
export function propagatePositions(
  p0: Vec3,
  v0: Vec3,
  omega0: Vec3,
  dtS: readonly number[],
  environment: EnvironmentProfile,
  profile: BallAerodynamicsProfile,
  options?: PropagateOptions,
): Vec3[] {
  const dt = options?.timestepS ?? DEFAULT_SIMULATION_SETTINGS.timestepS;
  if (!(Number.isFinite(dt) && dt > 0 && dt <= MAX_TIMESTEP_S)) {
    throw new RangeError(`propagatePositions: timestepS must be in (0, ${MAX_TIMESTEP_S}] s, got ${dt}`);
  }
  for (let i = 0; i < dtS.length; i++) {
    const t = dtS[i] as number;
    if (!Number.isFinite(t) || t < 0) {
      throw new RangeError(`propagatePositions: dtS[${i}] must be a finite time >= 0 s, got ${t}`);
    }
    if (i > 0 && t < (dtS[i - 1] as number)) {
      throw new RangeError(`propagatePositions: dtS must be non-decreasing, but dtS[${i}] = ${t} < dtS[${i - 1}] = ${dtS[i - 1]}`);
    }
  }
  const ctx = createFlightContext(environment, profile);
  const stepper = new Rk4Stepper(ctx);
  const timeEps = dt * 1e-9;
  let cur = stateFromVectors(p0, v0, omega0, "propagatePositions state");
  assertSpinDecayResolvable(ctx, dt, "propagatePositions");
  let next: Float64Array = new Float64Array(9);
  const probe = new Float64Array(9);
  let k = 0;
  const out: Vec3[] = [];

  for (const t of dtS) {
    while ((k + 1) * dt <= t + timeEps) {
      stepper.step(cur, dt, next);
      if (!isFiniteState(next)) {
        throw new Error(`propagatePositions: integration became non-finite near t = ${((k + 1) * dt).toFixed(4)} s (numerical failure)`);
      }
      const spinFailure = spinDecayStepFailure(stepper, cur, next);
      if (spinFailure !== null) {
        throw new Error(
          `propagatePositions: spin decay could not be integrated near t = ${((k + 1) * dt).toFixed(4)} s: ${spinFailure}; spin-decay model "${ctx.spinDecay.id}" is too stiff for timestepS ${dt} s (numerical failure)`,
        );
      }
      const swap = cur;
      cur = next;
      next = swap;
      k++;
    }
    const elapsed = k * dt;
    let s = cur;
    if (Math.abs(t - elapsed) > timeEps) {
      stepper.step(cur, t - elapsed, probe);
      if (!isFiniteState(probe)) {
        throw new Error(`propagatePositions: integration became non-finite near t = ${t.toFixed(4)} s (numerical failure)`);
      }
      s = probe;
    }
    out.push({ x: s[0] as number, y: s[1] as number, z: s[2] as number });
  }
  return out;
}
