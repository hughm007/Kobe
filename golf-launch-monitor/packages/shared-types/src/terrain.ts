import type { Vec3 } from "./primitives";

export const SURFACE_TYPES = [
  "tee",
  "range-mat",
  "fairway-firm",
  "fairway-normal",
  "fairway-soft",
  "first-cut",
  "rough",
  "bunker",
  "green",
  "fringe",
  "cart-path",
  "water",
  "out-of-bounds",
  "trees",
  "penalty-area",
] as const;

export type SurfaceType = (typeof SURFACE_TYPES)[number];

/**
 * Physical behaviour of a ground surface (docs/terrain-model.md). All values are model
 * parameters, not measurements, and are provisional until fit to data.
 */
export type SurfaceProperties = {
  readonly type: SurfaceType;
  readonly version: string;
  /** 0 (very soft) .. 1 (very firm). */
  readonly firmness: number;
  /** Normal coefficient of restitution at low impact speed (dimensionless). */
  readonly restitutionBase: number;
  /** Reduction of normal restitution per m/s of normal impact speed (s/m). */
  readonly restitutionSpeedSlope: number;
  /** Lower bound on normal restitution. */
  readonly restitutionMin: number;
  /** Coulomb sliding-friction coefficient during impact and skid. */
  readonly slidingFriction: number;
  /** Rolling-resistance coefficient; rolling deceleration = coefficient * g on flat ground. */
  readonly rollingResistance: number;
  /** 0 (dry) .. 1 (saturated). Modifies restitution and rolling resistance. */
  readonly moistureSoftness: number;
  /** Stimpmeter-equivalent green speed in feet, where applicable. */
  readonly stimpFt: number | null;
  /** True if the ball stops when it lands here (water, out-of-bounds). */
  readonly terminal: boolean;
  readonly provisional: boolean;
};

export type TerrainSample = {
  /** Ground height (m) at the queried (x, y). */
  readonly heightM: number;
  /** Unit outward surface normal. */
  readonly normal: Vec3;
  readonly surface: SurfaceProperties;
};

/** Read-only terrain query used by the ground and course engines. */
export interface TerrainQuery {
  readonly id: string;
  readonly version: string;
  sample(xM: number, yM: number): TerrainSample;
}
