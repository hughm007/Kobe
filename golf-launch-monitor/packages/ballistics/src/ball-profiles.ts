/**
 * Shipped ball aerodynamics profiles (docs/physics-model.md §8).
 *
 * HONESTY NOTE: this repository contains NO ball-model-specific aerodynamic data. All four
 * profiles use the same provisional coefficient parameters, chosen to be physically
 * plausible against secondary-source literature values and to land two public tour-average
 * launch conditions inside a plausibility envelope. That envelope is a sanity check, not
 * validation: the same averages were used to choose the parameters. The profiles differ
 * only in their stated confidence ceiling, warnings and limitations.
 */
import { deepFreeze } from "@glm/shared-types";
import type { BallAerodynamicsProfile } from "@glm/shared-types";

/** Rules of Golf limits: mass <= 45.93 g, diameter >= 42.67 mm. Shipped profiles use the limits. */
export const RULES_BALL_MASS_KG = 0.04593;
export const RULES_BALL_DIAMETER_M = 0.04267;

const MASS_KG = RULES_BALL_MASS_KG;
const DIAMETER_M = RULES_BALL_DIAMETER_M;
const RADIUS_M = DIAMETER_M / 2;
/** pi * d^2 / 4. */
const CROSS_SECTION_AREA_M2 = (Math.PI * DIAMETER_M * DIAMETER_M) / 4;
/**
 * Uniform-sphere value 0.4*m*r^2 ~ 8.36e-6 kg*m^2. Patent literature (secondary) gives
 * 7.0e-6..9.5e-6 kg*m^2 for multilayer balls; the uniform value sits inside that span and
 * no ball-specific value is available.
 */
const MOMENT_OF_INERTIA_KG_M2 = 0.4 * MASS_KG * RADIUS_M * RADIUS_M;

export const PROVISIONAL_PROFILE_VERSION = "0.1.0-provisional";

/**
 * Provisional baseline parameters (NOT fit to data). Basis for each value is in
 * docs/physics-model.md §8.1.
 */
export const PROVISIONAL_DRAG_PARAMS: Readonly<Record<string, number>> = Object.freeze({
  cdSupercritical: 0.2,
  cdCrisisRise: 0.3,
  reCritical: 6.5e4,
  reWidth: 1.0e4,
  cdSpinSlope: 0.25,
});

export const PROVISIONAL_LIFT_PARAMS: Readonly<Record<string, number>> = Object.freeze({
  clCoefficient: 0.5,
  clExponent: 0.5,
  clMax: 0.35,
});

export const PROVISIONAL_SPIN_DECAY_PARAMS: Readonly<Record<string, number>> = Object.freeze({
  cmSpinSlope: 0.012,
});

const COMMON_LIMITATIONS: readonly string[] = [
  "Provisional coefficients chosen for physical plausibility; NOT fit to measured trajectories or wind-tunnel data for any ball.",
  "Parameters were tuned so two public tour-average launch conditions land inside a plausibility envelope; agreement with those averages is therefore not evidence of accuracy.",
  "Reverse Magnus (negative lift) reported at roughly 5e4 < Re < 7e4 with low spin is not modelled.",
  "No dependence on ball orientation, seam or dimple pattern; no spin-axis precession.",
  "Coefficient forms are supported for roughly 4e4 < Re < 2.5e5 and 0.02 < S < 0.4; outside that range values are extrapolated.",
  "Mass and diameter are the Rules of Golf limits (45.93 g, 42.67 mm); moment of inertia is the uniform-sphere value.",
];

function makeProfile(
  fields: Pick<BallAerodynamicsProfile, "id" | "name" | "confidenceCeiling" | "limitations" | "warnings"> & {
    readonly applicableSpeedRangeMps?: BallAerodynamicsProfile["applicableSpeedRangeMps"];
    readonly applicableSpinRangeRpm?: BallAerodynamicsProfile["applicableSpinRangeRpm"];
  },
): BallAerodynamicsProfile {
  return {
    id: fields.id,
    name: fields.name,
    version: PROVISIONAL_PROFILE_VERSION,
    massKg: MASS_KG,
    diameterM: DIAMETER_M,
    crossSectionAreaM2: CROSS_SECTION_AREA_M2,
    momentOfInertiaKgM2: MOMENT_OF_INERTIA_KG_M2,
    dragModelId: "drag-re-spin-v0",
    dragModelParams: { ...PROVISIONAL_DRAG_PARAMS },
    liftModelId: "lift-spin-power-v0",
    liftModelParams: { ...PROVISIONAL_LIFT_PARAMS },
    spinDecayModelId: "spin-decay-moment-v0",
    spinDecayModelParams: { ...PROVISIONAL_SPIN_DECAY_PARAMS },
    applicableSpeedRangeMps: fields.applicableSpeedRangeMps ?? { min: 25, max: 85 },
    applicableSpinRangeRpm: fields.applicableSpinRangeRpm ?? { min: 1000, max: 10000 },
    source: "default",
    confidenceCeiling: fields.confidenceCeiling,
    limitations: fields.limitations,
    warnings: fields.warnings,
  };
}

export const DEFAULT_BALL_PROFILE_ID = "premium-urethane-baseline";

export const BALL_PROFILES: readonly BallAerodynamicsProfile[] = deepFreeze([
  makeProfile({
    id: "premium-urethane-baseline",
    name: "Premium urethane-cover ball (provisional baseline)",
    confidenceCeiling: 0.6,
    limitations: [
      ...COMMON_LIMITATIONS,
      "Baseline profile: the provisional parameters are referenced to premium-ball tour averages, but no specific ball model was measured.",
    ],
    warnings: ["Provisional aerodynamic model: not fit to data. Treat simulated carry and height as approximate."],
  }),
  makeProfile({
    id: "two-piece-distance-baseline",
    name: "Two-piece distance ball (same provisional aerodynamics as baseline)",
    confidenceCeiling: 0.55,
    limitations: [
      ...COMMON_LIMITATIONS,
      "Uses EXACTLY the same aerodynamic parameters as premium-urethane-baseline: no two-piece-ball data is available, so no aerodynamic difference is modelled.",
      "Lower spin typical of two-piece balls must come from the measured launch spin, not from this profile.",
    ],
    warnings: [
      "Provisional aerodynamic model: not fit to data.",
      "No ball-specific data: aerodynamics are identical to the premium baseline profile.",
    ],
  }),
  makeProfile({
    id: "range-ball-practice",
    name: "Range / practice ball (same provisional aerodynamics as baseline; low confidence)",
    confidenceCeiling: 0.5,
    limitations: [
      ...COMMON_LIMITATIONS,
      "Uses EXACTLY the same aerodynamic parameters as premium-urethane-baseline: no range-ball data is available.",
      "Range balls (including deliberately limited-flight balls) vary widely in construction, wear, compression and dimple condition; real carry may be substantially shorter than simulated.",
    ],
    warnings: [
      "Range and limited-flight balls vary widely; this profile has no range-ball data and uses the premium baseline aerodynamics.",
      "Simulated distances are likely optimistic for limited-flight or worn range balls.",
      "Provisional aerodynamic model: not fit to data.",
    ],
  }),
  makeProfile({
    id: "generic-fallback",
    name: "Generic fallback ball (unknown ball model)",
    confidenceCeiling: 0.4,
    limitations: [
      ...COMMON_LIMITATIONS,
      "Fallback for an unknown ball: uses EXACTLY the same aerodynamic parameters as premium-urethane-baseline.",
    ],
    warnings: [
      "Ball model unknown: generic fallback profile with low confidence.",
      "Provisional aerodynamic model: not fit to data.",
    ],
  }),
]);

export const BALL_PROFILE_IDS: readonly string[] = Object.freeze(BALL_PROFILES.map((p) => p.id));

export function getBallProfile(id: string): BallAerodynamicsProfile {
  const profile = BALL_PROFILES.find((p) => p.id === id);
  if (profile === undefined) {
    throw new Error(`Unknown ball profile id "${id}". Shipped profiles: ${BALL_PROFILE_IDS.join(", ")}`);
  }
  return profile;
}
