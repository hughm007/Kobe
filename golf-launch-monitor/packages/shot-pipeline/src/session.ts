import { DEFAULT_SIMULATION_SETTINGS, getBallProfile } from "@glm/ballistics";
import type {
  BallAerodynamicsProfile,
  EnvironmentProfile,
  SensorConfiguration,
  SimulationSettings,
} from "@glm/shared-types";
import { createFlatRangeTerrain } from "@glm/terrain-engine";
import type { PipelineConfig } from "./process";

/** Default Monte Carlo sample count for range sessions (see docs/architecture.md). */
export const DEFAULT_MONTE_CARLO_SAMPLES = 100;

export type RangeSessionOptions = {
  readonly sessionId: string;
  readonly environment: EnvironmentProfile;
  readonly sensorConfiguration: SensorConfiguration;
  readonly dataOrigin: PipelineConfig["dataOrigin"];
  readonly nextShotId: () => string;
  readonly nowUtc: () => string;
  readonly ballProfile?: BallAerodynamicsProfile;
  readonly simulationSettings?: Partial<SimulationSettings>;
  readonly overrides?: Partial<PipelineConfig>;
};

/**
 * PipelineConfig for a flat driving range (fairway-normal surface), no player/club selected,
 * spin fallback disabled. The numeric raw observations (3D positions, triggers, spin and health
 * reports; no images) ARE retained in every shot record by default so a stored shot can be
 * re-fitted after an estimator or physics change (requirement §0.9); override
 * storeRawObservations: false to opt out. Camera frames (rawCapturePaths) are never written here.
 */
export function createRangePipelineConfig(options: RangeSessionOptions): PipelineConfig {
  const ballProfile = options.ballProfile ?? getBallProfile("premium-urethane-baseline");
  return {
    sessionId: options.sessionId,
    playerId: null,
    handedness: "right",
    clubId: null,
    clubCategory: null,
    ballProfile,
    environment: options.environment,
    terrain: createFlatRangeTerrain({ ballRadiusM: ballProfile.diameterM / 2 }),
    simulationSettings: {
      ...DEFAULT_SIMULATION_SETTINGS,
      monteCarloSamples: DEFAULT_MONTE_CARLO_SAMPLES,
      ...options.simulationSettings,
    },
    dataOrigin: options.dataOrigin,
    sensorConfiguration: options.sensorConfiguration,
    calibration: null,
    allowGenericSpinFallback: false,
    storeRawObservations: true,
    playerSpinHistory: [],
    nextShotId: options.nextShotId,
    nowUtc: options.nowUtc,
    ...options.overrides,
  };
}

/** Deterministic id/clock sources for tests, golden files, and replays. */
export function deterministicIds(prefix = "shot"): { nextShotId: () => string; nowUtc: () => string } {
  let n = 0;
  let t = Date.UTC(2026, 0, 1, 12, 0, 0);
  return {
    nextShotId: () => `${prefix}-${String(++n).padStart(4, "0")}`,
    nowUtc: () => new Date((t += 1000)).toISOString(),
  };
}
