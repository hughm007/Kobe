/**
 * Pure decision logic shared by the worker and the UI:
 * - UI side: app selections -> serialisable PipelineSettings;
 * - worker side: PipelineSettings + the active adapter -> PipelineConfig for @glm/shot-pipeline.
 * No Worker, DOM or clock access here; ids and time are injected.
 */
import { createEnvironmentProfile, getBallProfile } from "@glm/ballistics";
import type { CalibrationRecord, Club, DataOrigin, Player, SensorConfiguration } from "@glm/shared-types";
import { createRangePipelineConfig, DEFAULT_MONTE_CARLO_SAMPLES, type PipelineConfig } from "@glm/shot-pipeline";
import type { PipelineSettings } from "../worker/protocol";
import { environmentInput, type EnvironmentSettings } from "./environment";

/** Upper bound offered in Settings: Monte Carlo cost grows linearly (~10 ms per sample for a driver). */
export const MAX_MONTE_CARLO_SAMPLES = 1000;
export { DEFAULT_MONTE_CARLO_SAMPLES };

export function clampMonteCarloSamples(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_MONTE_CARLO_SAMPLES;
  return Math.min(MAX_MONTE_CARLO_SAMPLES, Math.max(0, Math.round(n)));
}

export type PipelineSelections = {
  readonly sessionId: string;
  readonly player: Player | null;
  readonly club: Club | null;
  readonly ballProfileId: string;
  readonly environment: EnvironmentSettings;
  readonly monteCarloSamples: number;
  readonly allowGenericSpinFallback: boolean;
  readonly retainRawObservations: boolean;
};

/**
 * Without a player the pipeline uses right-handed labels (the createRangePipelineConfig
 * default); handedness never changes physics, only draw/fade wording.
 */
export function buildPipelineSettings(s: PipelineSelections): PipelineSettings {
  return {
    sessionId: s.sessionId,
    playerId: s.player?.id ?? null,
    handedness: s.player?.handedness ?? "right",
    clubId: s.club?.id ?? null,
    // The category enables the club-model spin estimate when spin is not observed.
    clubCategory: s.club?.category ?? null,
    ballProfileId: s.ballProfileId,
    environment: environmentInput(s.environment),
    monteCarloSamples: clampMonteCarloSamples(s.monteCarloSamples),
    allowGenericSpinFallback: s.allowGenericSpinFallback,
    storeRawObservations: s.retainRawObservations,
  };
}

/** What the active adapter contributes to the configuration. */
export type SourceContext = {
  readonly sensorConfiguration: SensorConfiguration;
  readonly dataOrigin: DataOrigin;
  /** A replay's recorded calibration; null for synthetic/manual streams. */
  readonly calibration: CalibrationRecord | null;
};

export type IdSource = {
  readonly nextShotId: () => string;
  readonly nowUtc: () => string;
};

/** Throws (with the ballistics package's message) on an invalid environment or unknown ball. */
export function buildPipelineConfig(settings: PipelineSettings, source: SourceContext, ids: IdSource): PipelineConfig {
  const environment = createEnvironmentProfile(settings.environment);
  const ballProfile = getBallProfile(settings.ballProfileId);
  return createRangePipelineConfig({
    sessionId: settings.sessionId,
    environment,
    sensorConfiguration: source.sensorConfiguration,
    dataOrigin: source.dataOrigin,
    nextShotId: ids.nextShotId,
    nowUtc: ids.nowUtc,
    ballProfile,
    simulationSettings: { monteCarloSamples: clampMonteCarloSamples(settings.monteCarloSamples) },
    overrides: {
      playerId: settings.playerId,
      handedness: settings.handedness,
      clubId: settings.clubId,
      clubCategory: settings.clubCategory,
      allowGenericSpinFallback: settings.allowGenericSpinFallback,
      storeRawObservations: settings.storeRawObservations,
      calibration: source.calibration,
    },
  });
}
