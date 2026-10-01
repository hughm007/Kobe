import { createEnvironmentProfile, DEFAULT_INDOOR_ENVIRONMENT, getBallProfile } from "@glm/ballistics";
import {
  DEFAULT_SYNTHETIC_NOISE,
  defaultSyntheticSensorConfiguration,
  SyntheticSensorAdapter,
  type SyntheticNoiseModel,
} from "@glm/sensor-adapters";
import type { ShotRecord } from "@glm/shared-types";
import {
  createRangePipelineConfig,
  createTruthPropagator,
  deterministicIds,
  fixtureShotSpec,
  getFixture,
  type PipelineConfig,
  ShotPipeline,
} from "@glm/shot-pipeline";

export const ENV = DEFAULT_INDOOR_ENVIRONMENT;
export const BALL = getBallProfile("premium-urethane-baseline");
export const TRUTH = createTruthPropagator(ENV, BALL);

export { createEnvironmentProfile, DEFAULT_SYNTHETIC_NOISE };

export function noise(patch: Partial<SyntheticNoiseModel> = {}): SyntheticNoiseModel {
  return { ...DEFAULT_SYNTHETIC_NOISE, ...patch };
}

/** Runs synthetic fixtures end-to-end through the real adapter and pipeline. */
export async function runSynthetic(
  shots: readonly { fixtureId: string; seed: number; noise?: SyntheticNoiseModel }[],
  overrides: Partial<PipelineConfig> = {},
  monteCarloSamples = 0,
): Promise<ShotRecord[]> {
  const sensorConfiguration = defaultSyntheticSensorConfiguration("synthetic-1");
  const adapter = new SyntheticSensorAdapter({
    sensorId: "synthetic-1",
    shots: shots.map((s) => fixtureShotSpec(getFixture(s.fixtureId), { seed: s.seed, ...(s.noise ? { noise: s.noise } : {}) })),
    propagate: TRUTH,
    configuration: sensorConfiguration,
  });
  const config = createRangePipelineConfig({
    sessionId: "session-test",
    environment: ENV,
    sensorConfiguration,
    dataOrigin: "synthetic",
    ...deterministicIds(),
    simulationSettings: { monteCarloSamples },
    overrides,
  });
  const pipeline = new ShotPipeline(adapter, config);
  const records: ShotRecord[] = [];
  pipeline.onShot((r) => records.push(r));
  pipeline.attach();
  await adapter.connect();
  await adapter.startCapture();
  pipeline.flush();
  await adapter.stopCapture();
  return records;
}
