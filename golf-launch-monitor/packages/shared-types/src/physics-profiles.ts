import type { NumericRange, Vec3 } from "./primitives";

/** Where an environment field's value came from. */
export type EnvironmentFieldSource = "sensor" | "user" | "default" | "derived";

/**
 * Air and gravity conditions for a simulation.
 *
 * `pressurePa` is the ABSOLUTE (station) pressure at the hitting location, not the
 * sea-level-corrected pressure reported by weather services. `airDensityKgM3` is derived
 * from temperature, pressure, and humidity by the ballistics package; `altitudeM` is used
 * only to derive station pressure when no pressure reading is available.
 */
export type EnvironmentProfile = {
  readonly version: string;
  readonly temperatureC: number;
  readonly pressurePa: number;
  /** 0 to 1. */
  readonly relativeHumidity: number;
  readonly altitudeM: number;
  readonly airDensityKgM3: number;
  /** Air dynamic viscosity used for Reynolds number, Pa*s. */
  readonly airDynamicViscosityPaS: number;
  /** Wind velocity in the world frame (the direction the air moves toward), m/s. */
  readonly windMps: Vec3;
  readonly gravityMps2: number;
  readonly indoorMode: boolean;
  readonly fieldSources: {
    readonly temperatureC: EnvironmentFieldSource;
    readonly pressurePa: EnvironmentFieldSource;
    readonly relativeHumidity: EnvironmentFieldSource;
    readonly altitudeM: EnvironmentFieldSource;
    readonly windMps: EnvironmentFieldSource;
  };
};

export type BallProfileSource = "default" | "reference-data-fit" | "lab-fit" | "user-calibrated";

/**
 * Aerodynamic and inertial description of a ball model. The model ids select functional
 * forms registered in the ballistics package; the params parameterize them. No profile is
 * universal; every shipped profile states its limitations.
 */
export type BallAerodynamicsProfile = {
  readonly id: string;
  readonly name: string;
  readonly version: string;

  readonly massKg: number;
  readonly diameterM: number;
  readonly crossSectionAreaM2: number;
  /** Moment of inertia about a diameter, kg*m^2. */
  readonly momentOfInertiaKgM2: number;

  readonly dragModelId: string;
  readonly dragModelParams: Readonly<Record<string, number>>;
  readonly liftModelId: string;
  readonly liftModelParams: Readonly<Record<string, number>>;
  readonly spinDecayModelId: string;
  readonly spinDecayModelParams: Readonly<Record<string, number>>;

  readonly applicableSpeedRangeMps: NumericRange;
  readonly applicableSpinRangeRpm: NumericRange;

  readonly source: BallProfileSource;
  /** Upper bound on simulation confidence when this profile is used (0..1). */
  readonly confidenceCeiling: number;
  readonly limitations: readonly string[];
  /** Warnings shown prominently whenever this profile is selected. */
  readonly warnings: readonly string[];
};
