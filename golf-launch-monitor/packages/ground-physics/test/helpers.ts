import type { BallAerodynamicsProfile, TerrainQuery, TrajectorySample, Vec3 } from "@glm/shared-types";
import { addScaled, dot } from "@glm/core-math";
import type { HopSimulator } from "../src/index";

export const G = 9.80665;

/**
 * Test-only ball: USGA-limit mass and diameter with I = 8.5e-6 kg m^2, so k = I/(m r^2) is
 * ~0.4066, deliberately NOT 0.4, to prove the model reads k from the profile.
 */
export const TEST_BALL: BallAerodynamicsProfile = {
  id: "test-ball",
  name: "Test ball (fixture)",
  version: "test-1",
  massKg: 0.04593,
  diameterM: 0.04267,
  crossSectionAreaM2: Math.PI * 0.021335 * 0.021335,
  momentOfInertiaKgM2: 8.5e-6,
  dragModelId: "none",
  dragModelParams: {},
  liftModelId: "none",
  liftModelParams: {},
  spinDecayModelId: "none",
  spinDecayModelParams: {},
  applicableSpeedRangeMps: { min: 0, max: 100 },
  applicableSpinRangeRpm: { min: 0, max: 12000 },
  source: "default",
  confidenceCeiling: 0.5,
  limitations: ["test fixture"],
  warnings: [],
};

export const R = TEST_BALL.diameterM / 2;
export const K = TEST_BALL.momentOfInertiaKgM2 / (TEST_BALL.massKg * R * R);

/** Uniform solid sphere (k = 0.4 exactly) with the same mass and radius. */
export const UNIFORM_BALL = { ...TEST_BALL, id: "uniform", momentOfInertiaKgM2: 0.4 * TEST_BALL.massKg * R * R };

/**
 * Gravity-only (vacuum, spin carried unchanged) hop for PLANAR terrain: the clearance along
 * the normal is exactly quadratic in time, gap(t) = gap0 + (v.n) t + (G.n) t^2 / 2, so the
 * next contact (gap = 0 while approaching) is solved in closed form.
 */
export function gravityHop(terrain: TerrainQuery, radiusM: number, g = G, sampleIntervalS = 0.005): HopSimulator {
  return (state, startTimeS) => {
    const s0 = terrain.sample(state.positionM.x, state.positionM.y);
    const n = s0.normal;
    const ground: Vec3 = { x: state.positionM.x, y: state.positionM.y, z: s0.heightM };
    const gap0 = dot({ x: 0, y: 0, z: state.positionM.z - ground.z }, n) - radiusM;
    const vn = dot(state.velocityMps, n);
    const an = -g * n.z;
    // gap0 + vn t + an t^2 / 2 = 0, larger root (an < 0).
    const disc = vn * vn - 2 * an * gap0;
    const tContact = (-vn - Math.sqrt(Math.max(0, disc))) / an;
    const gravity: Vec3 = { x: 0, y: 0, z: -g };
    const stateAt = (t: number) => ({
      positionM: addScaled(addScaled(state.positionM, state.velocityMps, t), gravity, 0.5 * t * t),
      velocityMps: addScaled(state.velocityMps, gravity, t),
    });
    const samples: TrajectorySample[] = [];
    for (let t = 0; t < tContact; t += sampleIntervalS) {
      const s = stateAt(t);
      samples.push({ tS: startTimeS + t, ...s, angularVelocityRadPerSec: state.angularVelocityRadPerSec, phase: "bounce-air" });
    }
    const end = stateAt(tContact);
    samples.push({ tS: startTimeS + tContact, ...end, angularVelocityRadPerSec: state.angularVelocityRadPerSec, phase: "bounce-air" });
    return {
      samples,
      termination: "ground-contact",
      contact: {
        timeS: startTimeS + tContact,
        positionM: end.positionM,
        velocityMps: end.velocityMps,
        angularVelocityRadPerSec: state.angularVelocityRadPerSec,
        terrain: terrain.sample(end.positionM.x, end.positionM.y),
      },
    };
  };
}

export function kineticEnergy(m: number, inertia: number, v: Vec3, w: Vec3): number {
  return 0.5 * m * dot(v, v) + 0.5 * inertia * dot(w, w);
}
