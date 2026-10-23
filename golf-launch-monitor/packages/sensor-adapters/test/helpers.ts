import type { RawSensorObservation, Vec3 } from "@glm/shared-types";
import { DEFAULT_SYNTHETIC_NOISE } from "../src/index";
import type { SyntheticNoiseModel, SyntheticShotSpec, TruthPropagator } from "../src/index";

/** Straight-line (force-free) test propagator: p(t) = p0 + v0 t. Enforces the dt contract. */
export const straightLine: TruthPropagator = (p0, v0, _omega0, dtS) => {
  dtS.forEach((t, i) => {
    if (!(t >= 0)) throw new Error(`straightLine: dt[${i}] = ${t} < 0`);
    if (i > 0 && t < dtS[i - 1]!) throw new Error(`straightLine: dt not ascending at ${i}`);
  });
  return dtS.map((t) => ({ x: p0.x + v0.x * t, y: p0.y + v0.y * t, z: p0.z + v0.z * t }));
};

export const LAUNCH_POSITION: Vec3 = { x: 0, y: 0, z: 0 };
export const LAUNCH_VELOCITY: Vec3 = { x: 60, y: -1.5, z: 16 };
export const LAUNCH_OMEGA: Vec3 = { x: 0, y: -280, z: 25 };

export function makeSpec(overrides: Partial<SyntheticShotSpec> = {}, noise: Partial<SyntheticNoiseModel> = {}): SyntheticShotSpec {
  return {
    label: "test-shot",
    positionM: LAUNCH_POSITION,
    velocityMps: LAUNCH_VELOCITY,
    angularVelocityRadPerSec: LAUNCH_OMEGA,
    launchTimeS: 2,
    seed: 1234,
    ...overrides,
    noise: { ...DEFAULT_SYNTHETIC_NOISE, ...(overrides.noise ?? {}), ...noise },
  };
}

export function ofKind<K extends RawSensorObservation["kind"]>(
  observations: readonly RawSensorObservation[],
  kind: K,
): Extract<RawSensorObservation, { kind: K }>[] {
  return observations.filter((o): o is Extract<RawSensorObservation, { kind: K }> => o.kind === kind);
}

export function truthAt(dt: number): Vec3 {
  return {
    x: LAUNCH_POSITION.x + LAUNCH_VELOCITY.x * dt,
    y: LAUNCH_POSITION.y + LAUNCH_VELOCITY.y * dt,
    z: LAUNCH_POSITION.z + LAUNCH_VELOCITY.z * dt,
  };
}
