import { angularVelocityFromSpin } from "@glm/launch-state";
import { DEFAULT_SYNTHETIC_NOISE, type SyntheticNoiseModel, type SyntheticShotSpec } from "@glm/sensor-adapters";
import type { ClubCategory, Vec3 } from "@glm/shared-types";
import { degToRad, mphToMps, rpmToRadPerSec } from "@glm/units";

/**
 * A synthetic shot described in golfer terms. These are TEST INPUTS for the deterministic
 * pipeline (straight, draw, fade, high, low, no-spin); they are not measurements and not
 * claims about any real golfer. Signs follow docs/coordinate-system.md: horizontal launch
 * positive = left, spin-axis tilt positive = curves right.
 */
export type SyntheticFixture = {
  readonly id: string;
  readonly description: string;
  readonly clubCategory: ClubCategory;
  readonly ballSpeedMph: number;
  readonly verticalLaunchDeg: number;
  readonly horizontalLaunchDegLeftPositive: number;
  readonly totalSpinRpm: number;
  readonly spinAxisDegRightPositive: number;
};

export const SYNTHETIC_FIXTURES: readonly SyntheticFixture[] = [
  {
    id: "straight-driver",
    description: "Straight driver; launch values match widely published tour-average inputs.",
    clubCategory: "driver",
    ballSpeedMph: 167,
    verticalLaunchDeg: 10.9,
    horizontalLaunchDegLeftPositive: 0,
    totalSpinRpm: 2686,
    spinAxisDegRightPositive: 0,
  },
  {
    id: "draw-driver",
    description: "Right-handed draw: starts 2° right, spin axis tilted 6° left (curves left).",
    clubCategory: "driver",
    ballSpeedMph: 165,
    verticalLaunchDeg: 11.5,
    horizontalLaunchDegLeftPositive: -2,
    totalSpinRpm: 2600,
    spinAxisDegRightPositive: -6,
  },
  {
    id: "fade-driver",
    description: "Right-handed fade: starts 2° left, spin axis tilted 6° right (curves right).",
    clubCategory: "driver",
    ballSpeedMph: 163,
    verticalLaunchDeg: 12,
    horizontalLaunchDegLeftPositive: 2,
    totalSpinRpm: 2900,
    spinAxisDegRightPositive: 6,
  },
  {
    id: "high-7-iron",
    description: "High 7-iron: higher launch and spin than the standard fixture.",
    clubCategory: "mid-iron",
    ballSpeedMph: 118,
    verticalLaunchDeg: 21,
    horizontalLaunchDegLeftPositive: 0,
    totalSpinRpm: 8000,
    spinAxisDegRightPositive: 0,
  },
  {
    id: "low-7-iron",
    description: "Low 7-iron: lower launch and spin than the standard fixture.",
    clubCategory: "mid-iron",
    ballSpeedMph: 122,
    verticalLaunchDeg: 12,
    horizontalLaunchDegLeftPositive: 0,
    totalSpinRpm: 5500,
    spinAxisDegRightPositive: 0,
  },
  {
    id: "standard-7-iron",
    description: "7-iron; launch values match widely published tour-average inputs.",
    clubCategory: "mid-iron",
    ballSpeedMph: 120,
    verticalLaunchDeg: 16.3,
    horizontalLaunchDegLeftPositive: 0,
    totalSpinRpm: 7097,
    spinAxisDegRightPositive: 0,
  },
  {
    id: "no-spin-knuckleball",
    description: "Zero-spin shot: no Magnus lift; spin axis is undefined and must be reported unavailable.",
    clubCategory: "mid-iron",
    ballSpeedMph: 110,
    verticalLaunchDeg: 14,
    horizontalLaunchDegLeftPositive: 0,
    totalSpinRpm: 0,
    spinAxisDegRightPositive: 0,
  },
];

/** Launch velocity and spin vectors (world frame, SI) for a golfer-terms fixture. */
export function fixtureLaunchVectors(fixture: SyntheticFixture): { velocityMps: Vec3; angularVelocityRadPerSec: Vec3 } {
  const speed = mphToMps(fixture.ballSpeedMph);
  const vla = degToRad(fixture.verticalLaunchDeg);
  const hla = degToRad(fixture.horizontalLaunchDegLeftPositive);
  const velocityMps: Vec3 = {
    x: speed * Math.cos(vla) * Math.cos(hla),
    y: speed * Math.cos(vla) * Math.sin(hla),
    z: speed * Math.sin(vla),
  };
  const angularVelocityRadPerSec =
    fixture.totalSpinRpm === 0
      ? { x: 0, y: 0, z: 0 }
      : angularVelocityFromSpin({
          totalSpinRadPerSec: rpmToRadPerSec(fixture.totalSpinRpm),
          spinAxisTiltRad: degToRad(fixture.spinAxisDegRightPositive),
          velocity: velocityMps,
        });
  return { velocityMps, angularVelocityRadPerSec };
}

/** Builds a synthetic shot spec whose ball starts at the address origin. */
export function fixtureShotSpec(
  fixture: SyntheticFixture,
  options: { seed: number; launchTimeS?: number; noise?: SyntheticNoiseModel },
): SyntheticShotSpec {
  const { velocityMps, angularVelocityRadPerSec } = fixtureLaunchVectors(fixture);
  return {
    label: fixture.id,
    positionM: { x: 0, y: 0, z: 0 },
    velocityMps,
    angularVelocityRadPerSec,
    launchTimeS: options.launchTimeS ?? 1,
    seed: options.seed,
    noise: options.noise ?? DEFAULT_SYNTHETIC_NOISE,
  };
}

export function getFixture(id: string): SyntheticFixture {
  const fixture = SYNTHETIC_FIXTURES.find((f) => f.id === id);
  if (!fixture) throw new Error(`Unknown synthetic fixture "${id}".`);
  return fixture;
}
