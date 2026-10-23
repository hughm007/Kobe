/**
 * Synthetic-sensor noise presets offered on the Range screen. Every value is a TEST SETTING for
 * the synthetic generator (how imperfect the simulated sensor is); none of them describes or
 * claims the accuracy of any real launch monitor.
 */
import { DEFAULT_SYNTHETIC_NOISE, type SyntheticNoiseModel } from "@glm/sensor-adapters";
import { deepFreeze } from "@glm/shared-types";
import { NOISE_PRESET_IDS, type NoisePresetId } from "../worker/protocol";

export type NoisePreset = {
  readonly id: NoisePresetId;
  readonly label: string;
  readonly description: string;
  readonly noise: SyntheticNoiseModel;
};

const base = DEFAULT_SYNTHETIC_NOISE;

export const NOISE_PRESETS: readonly NoisePreset[] = deepFreeze([
  {
    id: "clean",
    label: "Clean",
    description: "Default generator settings: 1 mm position noise, perfect clock sync, no dropouts, spin observed.",
    noise: base,
  },
  {
    id: "realistic",
    label: "Realistic noise (test setting)",
    description:
      "3 mm position noise, 20 µs timestamp jitter, 5 % dropped frames, 3 % gross outliers, noisier spin and trigger. " +
      "A stress setting for the estimator, not a model of any device.",
    noise: {
      ...base,
      frameCount: 16,
      positionSigmaM: { x: 0.003, y: 0.003, z: 0.003 },
      timestampJitterS: 0.00002,
      dropoutProbability: 0.05,
      outlierProbability: 0.03,
      outlierMagnitudeM: 0.04,
      spin: { sigmaRadPerSec: 15, validObservationCount: 12, fitResidualRad: 0.03, qualityFlags: ["synthetic"] },
      triggerSources: [{ source: "synthetic", latencyS: 0, latencySigmaS: 0.0002, confidence: 0.9 }],
    },
  },
  {
    id: "poor-sync",
    label: "Poor clock sync",
    description:
      "0.4 ms frame-timestamp jitter and a jittery, low-confidence trigger: exercises outlier rejection and confidence downgrades.",
    noise: {
      ...base,
      timestampJitterS: 0.0004,
      triggerSources: [{ source: "synthetic", latencyS: 0, latencySigmaS: 0.002, confidence: 0.6 }],
    },
  },
  {
    id: "no-spin-observed",
    label: "No spin observed",
    description:
      "Ball positions are tracked but no spin observation is emitted. Spin becomes ESTIMATED (club model, if a club is selected), " +
      "ASSUMED (only if the generic fallback is allowed in Settings) or UNAVAILABLE.",
    noise: { ...base, spin: null },
  },
]) as readonly NoisePreset[];

export function getNoisePreset(id: NoisePresetId): NoisePreset {
  const preset = NOISE_PRESETS.find((p) => p.id === id);
  if (preset === undefined) {
    throw new RangeError(`Unknown noise preset "${String(id)}". Known presets: ${NOISE_PRESET_IDS.join(", ")}`);
  }
  return preset;
}
