/**
 * Test fixtures are produced by the REAL pipeline (in-process runner -> PipelineHost ->
 * @glm/shot-pipeline), never hand-written. Monte Carlo counts are kept small for speed.
 * Do not pin carry/total numbers: the ground model is being revised concurrently.
 */
import { InMemoryRepository } from "@glm/persistence";
import type { ShotRecord } from "@glm/shared-types";
import { vi } from "vitest";
import { buildPipelineSettings } from "../src/pipeline/config";
import { DEFAULT_ENVIRONMENT_SETTINGS } from "../src/pipeline/environment";
import type { AppRuntime } from "../src/state/AppContext";
import { DEFAULT_BAG, type StorageLike } from "../src/state/settings";
import type { NoisePresetId, PipelineSettings, UiToWorkerMessage, WorkerToUiMessage } from "../src/worker/protocol";
import { createPipelineRunner, type InProcessPipelineRunner } from "../src/worker/runner";

export const TEST_MC_SAMPLES = 12;

export function counterIds(prefix = "id"): () => string {
  let n = 0;
  return () => `${prefix}-${String(++n).padStart(4, "0")}`;
}

export function steppingClock(startMs = Date.UTC(2026, 9, 1, 12, 0, 0)): () => string {
  let t = startMs;
  return () => new Date((t += 1000)).toISOString();
}

export function testRunner(shotIdPrefix = "shot"): InProcessPipelineRunner {
  return createPipelineRunner({ nextShotId: counterIds(shotIdPrefix), nowUtc: steppingClock(), nowMs: () => 0 });
}

export type SettingsPatch = {
  readonly clubCategory?: "driver" | "mid-iron" | null;
  readonly allowGenericSpinFallback?: boolean;
  readonly storeRawObservations?: boolean;
  readonly monteCarloSamples?: number;
};

export function testPipelineSettings(patch: SettingsPatch = {}): PipelineSettings {
  const club = patch.clubCategory
    ? (DEFAULT_BAG.find((c) => c.category === patch.clubCategory) ?? null)
    : null;
  return buildPipelineSettings({
    sessionId: "session-test",
    player: null,
    club,
    ballProfileId: "premium-urethane-baseline",
    environment: DEFAULT_ENVIRONMENT_SETTINGS,
    monteCarloSamples: patch.monteCarloSamples ?? TEST_MC_SAMPLES,
    allowGenericSpinFallback: patch.allowGenericSpinFallback ?? false,
    retainRawObservations: patch.storeRawObservations ?? false,
  });
}

/** Sends messages and collects every worker message until the queue is idle. */
export async function exchange(runner: InProcessPipelineRunner, messages: readonly UiToWorkerMessage[]): Promise<WorkerToUiMessage[]> {
  const received: WorkerToUiMessage[] = [];
  const off = runner.onMessage((m) => received.push(m));
  for (const m of messages) runner.send(m);
  await runner.idle();
  off();
  return received;
}

export function shotsOf(messages: readonly WorkerToUiMessage[]): ShotRecord[] {
  return messages.flatMap((m) => (m.type === "shot" ? [m.record] : []));
}

export function errorsOf(messages: readonly WorkerToUiMessage[]): string[] {
  return messages.flatMap((m) => (m.type === "error" ? [m.message] : []));
}

/** One synthetic ShotRecord from the real pipeline. */
export async function syntheticRecord(
  fixtureId: string,
  noisePreset: NoisePresetId,
  seed: number,
  patch: SettingsPatch = {},
): Promise<ShotRecord> {
  // Distinct, readable ids per fixture so records from separate runners never collide.
  const runner = testRunner(`shot-${fixtureId}-${noisePreset}-${seed}`);
  const messages = await exchange(runner, [
    { type: "configure", config: testPipelineSettings(patch) },
    { type: "hit-synthetic", fixtureId, seed, noisePreset },
  ]);
  runner.dispose();
  const errors = errorsOf(messages);
  if (errors.length > 0) throw new Error(errors.join("; "));
  const [record] = shotsOf(messages);
  if (record === undefined) throw new Error("no shot produced");
  return record;
}

/** One developer manual-entry ShotRecord from the real pipeline (ManualEntryAdapter). */
export async function manualRecord(): Promise<ShotRecord> {
  const runner = testRunner("shot-manual");
  const messages = await exchange(runner, [
    { type: "configure", config: testPipelineSettings() },
    {
      type: "manual-launch",
      ballSpeedMph: 150,
      verticalLaunchDeg: 12,
      horizontalLaunchDegLeftPositive: -3,
      totalSpinRpm: 2500,
      spinAxisDegRightPositive: 4,
    },
  ]);
  runner.dispose();
  const errors = errorsOf(messages);
  if (errors.length > 0) throw new Error(errors.join("; "));
  const [record] = shotsOf(messages);
  if (record === undefined) throw new Error("no manual shot produced");
  return record;
}

/** The first shot of a replay file played through the real ReplaySensorAdapter. */
export async function replayRecord(text: string): Promise<ShotRecord> {
  const runner = testRunner("shot-replay");
  const messages = await exchange(runner, [
    { type: "configure", config: testPipelineSettings() },
    { type: "load-replay", text, fileName: "replay.jsonl" },
    { type: "replay-next-shot" },
  ]);
  runner.dispose();
  const errors = errorsOf(messages);
  if (errors.length > 0) throw new Error(errors.join("; "));
  const [record] = shotsOf(messages);
  if (record === undefined) throw new Error("no replay shot produced");
  return record;
}

/**
 * Every place a text calls something "measured" without negating it ("not measured", "never
 * measured", "unmeasured" are honest disclaimers). Case-insensitive, so lowercase enum values
 * such as a raw SpinMode "measured" are caught as well as the MEASURED badge.
 */
export function measuredClaims(text: string): string[] {
  const cleaned = text.replace(/\b(?:not|never)\s+(?:been\s+)?measured\b/gi, "").replace(/\bunmeasured\b/gi, "");
  return [...cleaned.matchAll(/.{0,30}\bmeasured\b.{0,30}/gi)].map((m) => m[0]);
}

export function memoryStorage(initial: Record<string, string> = {}): StorageLike & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => {
      data.set(k, v);
    },
  };
}

export function testRuntime(overrides: Partial<AppRuntime> = {}): AppRuntime & { runner: InProcessPipelineRunner } {
  const runner = testRunner();
  return {
    runner,
    repository: new InMemoryRepository(),
    storageDescription: "In-memory test repository",
    storagePersistent: false,
    settingsStorage: memoryStorage(),
    newId: counterIds("ui"),
    nowUtc: steppingClock(),
    download: vi.fn(),
    ...overrides,
  } as AppRuntime & { runner: InProcessPipelineRunner };
}

/**
 * An INVALID record from the real pipeline: the synthetic ball is reported outside the hitting
 * zone (a generator test setting no Range preset offers), which the launch estimator rejects.
 */
export async function invalidRecord(): Promise<ShotRecord> {
  const { createEnvironmentProfile, getBallProfile } = await import("@glm/ballistics");
  const { DEFAULT_SYNTHETIC_NOISE, SyntheticSensorAdapter } = await import("@glm/sensor-adapters");
  const { createTruthPropagator, fixtureShotSpec, getFixture, ShotPipeline } = await import("@glm/shot-pipeline");
  const { buildPipelineConfig } = await import("../src/pipeline/config");
  const settings = testPipelineSettings({ monteCarloSamples: 0 });
  const adapter = new SyntheticSensorAdapter({
    shots: [
      fixtureShotSpec(getFixture("standard-7-iron"), {
        seed: 31,
        noise: { ...DEFAULT_SYNTHETIC_NOISE, address: { inHittingZone: false, ballCount: 1, stationary: true } },
      }),
    ],
    propagate: createTruthPropagator(createEnvironmentProfile(settings.environment), getBallProfile(settings.ballProfileId)),
  });
  const config = buildPipelineConfig(
    settings,
    { sensorConfiguration: adapter.getConfiguration(), dataOrigin: "synthetic", calibration: null },
    { nextShotId: counterIds("invalid"), nowUtc: steppingClock() },
  );
  const pipeline = new ShotPipeline(adapter, config);
  const records: ShotRecord[] = [];
  pipeline.onShot((r) => records.push(r));
  pipeline.attach();
  await adapter.connect();
  await adapter.startCapture();
  pipeline.flush();
  const [record] = records;
  if (record === undefined) throw new Error("no shot produced");
  return record;
}
