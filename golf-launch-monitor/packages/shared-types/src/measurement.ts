import type { Matrix } from "./primitives";

/**
 * Where a value came from. This label travels with the value from the sensor adapter all
 * the way to the display layer and exports. It is never upgraded (e.g. estimated -> measured).
 *
 * Extensions beyond the baseline contract:
 * - "synthetic": produced by the deterministic synthetic generator. Never presented as measured.
 * - "assumed-generic-fallback": a generic fallback the user explicitly allowed (spin MODE 3).
 */
export const MEASUREMENT_SOURCES = [
  "measured-camera",
  "measured-radar",
  "measured-hybrid",
  "estimated-player-model",
  "estimated-club-model",
  "assumed-generic-fallback",
  "manual",
  "synthetic",
  "unavailable",
] as const;

export type MeasurementSource = (typeof MEASUREMENT_SOURCES)[number];

/** Sources that represent a physical measurement of this shot by a sensor. */
export const MEASURED_SOURCES: ReadonlySet<MeasurementSource> = new Set([
  "measured-camera",
  "measured-radar",
  "measured-hybrid",
]);

/** Sources that represent a model guess rather than an observation of this shot. */
export const ESTIMATED_SOURCES: ReadonlySet<MeasurementSource> = new Set([
  "estimated-player-model",
  "estimated-club-model",
  "assumed-generic-fallback",
]);

export type Uncertainty = {
  /** One standard deviation, in `unit`. */
  readonly sigma?: number;
  /** Lower bound of a stated interval, in `unit`. */
  readonly lower?: number;
  /** Upper bound of a stated interval, in `unit`. */
  readonly upper?: number;
  /** Covariance for vector-valued measurements (row-major, `unit` squared). */
  readonly covariance?: Matrix;
  readonly unit: string;
};

/**
 * A single value with provenance.
 *
 * Invariants (enforced by the schema and by every factory):
 * - `value === null`  <=>  `source === "unavailable"`.
 * - `source === "unavailable"`  =>  `confidence === 0`.
 * - `confidence` is in [0, 1].
 */
export type Measurement<T> = {
  readonly value: T | null;
  readonly unit: string;
  readonly source: MeasurementSource;
  readonly confidence: number;
  readonly uncertainty?: Uncertainty;
  readonly qualityFlags: readonly string[];
};

/** One input that a calculated value depends on, with that input's provenance. */
export type CalculationInput = {
  /** Field path on the LaunchState / environment, e.g. "angularVelocityRadPerSec". */
  readonly field: string;
  readonly source: MeasurementSource;
};

/** Percentile summary from Monte Carlo propagation of launch uncertainty. */
export type UncertaintyInterval = {
  readonly p05: number;
  readonly p50: number;
  readonly p95: number;
  readonly unit: string;
  readonly sampleCount: number;
};

/**
 * A value calculated by a model (carry, apex, descent angle, ...), as opposed to a value
 * observed by a sensor. Carries the provenance of every input it depends on so that the UI
 * can say, for example, "carry depends on estimated spin".
 */
export type CalculatedValue<T> = {
  readonly value: T | null;
  readonly unit: string;
  readonly kind: "calculated";
  readonly inputs: readonly CalculationInput[];
  /** True if any input is estimated, assumed, or manual. */
  readonly dependsOnEstimated: boolean;
  /** True if any input is synthetic. */
  readonly dependsOnSynthetic: boolean;
  readonly confidence: number;
  readonly interval?: UncertaintyInterval;
  readonly qualityFlags: readonly string[];
  /** Version of the model that produced the value. */
  readonly modelVersion: string;
};
