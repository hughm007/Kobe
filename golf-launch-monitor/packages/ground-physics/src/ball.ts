import type { BallAerodynamicsProfile } from "@glm/shared-types";

/** The inertial part of a ball profile; any BallAerodynamicsProfile satisfies it. */
export type BallInertiaProfile = Pick<BallAerodynamicsProfile, "massKg" | "diameterM" | "momentOfInertiaKgM2">;

export type BallConstants = {
  readonly massKg: number;
  readonly radiusM: number;
  readonly inertiaKgM2: number;
  /** Dimensionless inertia ratio k = I / (m r^2); 0.4 for a uniform solid sphere. */
  readonly inertiaRatio: number;
};

export function ballConstants(profile: BallInertiaProfile): BallConstants {
  const { massKg, diameterM, momentOfInertiaKgM2 } = profile;
  for (const [name, value] of [
    ["massKg", massKg],
    ["diameterM", diameterM],
    ["momentOfInertiaKgM2", momentOfInertiaKgM2],
  ] as const) {
    if (!Number.isFinite(value) || value <= 0) {
      throw new RangeError(`Ball profile ${name} must be positive and finite, got ${value}`);
    }
  }
  const radiusM = diameterM / 2;
  return {
    massKg,
    radiusM,
    inertiaKgM2: momentOfInertiaKgM2,
    inertiaRatio: momentOfInertiaKgM2 / (massKg * radiusM * radiusM),
  };
}
