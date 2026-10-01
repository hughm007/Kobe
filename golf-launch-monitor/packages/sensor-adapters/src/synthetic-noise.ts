import { deepFreeze, TriggerSourceSchema } from "@glm/shared-types";
import type { TriggerSource } from "@glm/shared-types";

/**
 * Error model applied by the synthetic shot generator. Every field is a TEST SETTING that
 * describes how imperfect the simulated sensor is; none of it is a claim about any real
 * launch monitor.
 */
export type SyntheticNoiseModel = {
  /** Nominal capture rate of the simulated tracker, frames per second. */
  readonly frameRateHz: number;
  /** Number of post-launch frames attempted (before dropouts). */
  readonly frameCount: number;
  /** Index of the first post-launch frame: frame k is nominally at launch + (startDelayFrames + k) / frameRateHz. */
  readonly startDelayFrames: number;
  /** Per-axis Gaussian noise (1 sigma) of the reported 3D ball positions, m. */
  readonly positionSigmaM: { readonly x: number; readonly y: number; readonly z: number };
  /** Reported covariance = diag(sigma^2) * scale. 1 = honest; != 1 simulates a mis-reported noise level. */
  readonly reportedCovarianceScale: number;
  /** Sigma of (true frame time - reported frame time), s: simulates clock synchronisation error. */
  readonly timestampJitterS: number;
  /** Probability that a frame produces no observation. */
  readonly dropoutProbability: number;
  /** Probability that a frame's position gets a gross error of magnitude outlierMagnitudeM in a random direction. */
  readonly outlierProbability: number;
  readonly outlierMagnitudeM: number;
  /** null = spin is not observed (no spin observation is emitted). */
  readonly spin: null | {
    /** Per-axis Gaussian noise (1 sigma) of the reported angular velocity, rad/s. */
    readonly sigmaRadPerSec: number;
    readonly validObservationCount: number;
    readonly fitResidualRad: number;
    readonly qualityFlags: readonly string[];
  };
  /** One trigger observation per entry, at launch + latencyS + N(0, latencySigmaS). */
  readonly triggerSources: readonly {
    readonly source: TriggerSource;
    readonly latencyS: number;
    readonly latencySigmaS: number;
    readonly confidence: number;
  }[];
  /** Flags reported by the ball-address observation. */
  readonly address: { readonly inHittingZone: boolean; readonly ballCount: number; readonly stationary: boolean };
};

/**
 * Default synthetic test settings. These are deliberately "clean" values for unit and
 * integration tests, not a model of any device:
 * - 1000 fps, 20 frames starting 1 frame after launch (a 20 ms tracking window);
 * - 1 mm per-axis position sigma, honestly reported (covariance scale 1);
 * - perfect clock sync, no dropouts, no outliers (the outlier magnitude only matters
 *   once outlierProbability is raised);
 * - spin observed with 6 rad/s per-axis sigma (about 2 % of a 300 rad/s spin vector; an
 *   absolute test setting, not a spin value used for physics), 20 valid observations,
 *   0.01 rad fit residual;
 * - a single ideal synthetic trigger (zero latency, zero jitter, confidence 1);
 * - one stationary ball in the hitting zone at address.
 */
export const DEFAULT_SYNTHETIC_NOISE: SyntheticNoiseModel = deepFreeze<SyntheticNoiseModel>({
  frameRateHz: 1000,
  frameCount: 20,
  startDelayFrames: 1,
  positionSigmaM: { x: 0.001, y: 0.001, z: 0.001 },
  reportedCovarianceScale: 1,
  timestampJitterS: 0,
  dropoutProbability: 0,
  outlierProbability: 0,
  outlierMagnitudeM: 0.05,
  spin: { sigmaRadPerSec: 6, validObservationCount: 20, fitResidualRad: 0.01, qualityFlags: ["synthetic"] },
  triggerSources: [{ source: "synthetic", latencyS: 0, latencySigmaS: 0, confidence: 1 }],
  address: { inHittingZone: true, ballCount: 1, stationary: true },
});

function fail(context: string, field: string, requirement: string, value: unknown): never {
  throw new RangeError(`${context}: ${field} must be ${requirement}, got ${JSON.stringify(value) ?? String(value)}`);
}

function requireFinite(context: string, field: string, value: number): void {
  if (typeof value !== "number" || !Number.isFinite(value)) fail(context, field, "a finite number", value);
}

function requireNonNegative(context: string, field: string, value: number): void {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    fail(context, field, "a finite number >= 0", value);
  }
}

function requireNonNegativeInt(context: string, field: string, value: number): void {
  if (!Number.isInteger(value) || value < 0) fail(context, field, "an integer >= 0", value);
}

function requireProbability(context: string, field: string, value: number): void {
  if (typeof value !== "number" || !(value >= 0 && value <= 1)) fail(context, field, "in [0, 1]", value);
}

/** Throws a RangeError naming the offending field if the noise model is not usable. */
export function validateSyntheticNoiseModel(noise: SyntheticNoiseModel, context = "SyntheticNoiseModel"): void {
  if (typeof noise.frameRateHz !== "number" || !Number.isFinite(noise.frameRateHz) || noise.frameRateHz <= 0) {
    fail(context, "noise.frameRateHz", "a finite number > 0", noise.frameRateHz);
  }
  requireNonNegativeInt(context, "noise.frameCount", noise.frameCount);
  requireNonNegativeInt(context, "noise.startDelayFrames", noise.startDelayFrames);
  requireNonNegative(context, "noise.positionSigmaM.x", noise.positionSigmaM.x);
  requireNonNegative(context, "noise.positionSigmaM.y", noise.positionSigmaM.y);
  requireNonNegative(context, "noise.positionSigmaM.z", noise.positionSigmaM.z);
  requireNonNegative(context, "noise.reportedCovarianceScale", noise.reportedCovarianceScale);
  requireNonNegative(context, "noise.timestampJitterS", noise.timestampJitterS);
  requireProbability(context, "noise.dropoutProbability", noise.dropoutProbability);
  requireProbability(context, "noise.outlierProbability", noise.outlierProbability);
  requireNonNegative(context, "noise.outlierMagnitudeM", noise.outlierMagnitudeM);
  if (noise.spin !== null) {
    requireNonNegative(context, "noise.spin.sigmaRadPerSec", noise.spin.sigmaRadPerSec);
    requireNonNegativeInt(context, "noise.spin.validObservationCount", noise.spin.validObservationCount);
    requireNonNegative(context, "noise.spin.fitResidualRad", noise.spin.fitResidualRad);
    if (!Array.isArray(noise.spin.qualityFlags) || noise.spin.qualityFlags.some((f) => typeof f !== "string")) {
      fail(context, "noise.spin.qualityFlags", "an array of strings", noise.spin.qualityFlags);
    }
  }
  noise.triggerSources.forEach((trigger, i) => {
    const prefix = `noise.triggerSources[${i}]`;
    if (!TriggerSourceSchema.safeParse(trigger.source).success) {
      fail(context, `${prefix}.source`, `one of ${TriggerSourceSchema.options.join(", ")}`, trigger.source);
    }
    requireFinite(context, `${prefix}.latencyS`, trigger.latencyS);
    requireNonNegative(context, `${prefix}.latencySigmaS`, trigger.latencySigmaS);
    requireProbability(context, `${prefix}.confidence`, trigger.confidence);
  });
  requireNonNegativeInt(context, "noise.address.ballCount", noise.address.ballCount);
  if (typeof noise.address.inHittingZone !== "boolean" || typeof noise.address.stationary !== "boolean") {
    fail(context, "noise.address.inHittingZone/stationary", "booleans", noise.address);
  }
}

/**
 * Flatten a noise model into the numeric key/value map stored in SyntheticTruth.noiseModel.
 * Booleans become 1/0 and `spin.observed` records whether spin was observed. String-valued
 * settings (trigger source names, spin quality flags) cannot be represented in a numeric
 * map and are omitted; they are visible in the observations themselves.
 */
export function flattenSyntheticNoiseModel(noise: SyntheticNoiseModel): Record<string, number> {
  const flat: Record<string, number> = {
    frameRateHz: noise.frameRateHz,
    frameCount: noise.frameCount,
    startDelayFrames: noise.startDelayFrames,
    "positionSigmaM.x": noise.positionSigmaM.x,
    "positionSigmaM.y": noise.positionSigmaM.y,
    "positionSigmaM.z": noise.positionSigmaM.z,
    reportedCovarianceScale: noise.reportedCovarianceScale,
    timestampJitterS: noise.timestampJitterS,
    dropoutProbability: noise.dropoutProbability,
    outlierProbability: noise.outlierProbability,
    outlierMagnitudeM: noise.outlierMagnitudeM,
    "spin.observed": noise.spin === null ? 0 : 1,
  };
  if (noise.spin !== null) {
    flat["spin.sigmaRadPerSec"] = noise.spin.sigmaRadPerSec;
    flat["spin.validObservationCount"] = noise.spin.validObservationCount;
    flat["spin.fitResidualRad"] = noise.spin.fitResidualRad;
  }
  flat["triggerSources.count"] = noise.triggerSources.length;
  noise.triggerSources.forEach((trigger, i) => {
    flat[`triggerSources.${i}.latencyS`] = trigger.latencyS;
    flat[`triggerSources.${i}.latencySigmaS`] = trigger.latencySigmaS;
    flat[`triggerSources.${i}.confidence`] = trigger.confidence;
  });
  flat["address.inHittingZone"] = noise.address.inHittingZone ? 1 : 0;
  flat["address.ballCount"] = noise.address.ballCount;
  flat["address.stationary"] = noise.address.stationary ? 1 : 0;
  return flat;
}
