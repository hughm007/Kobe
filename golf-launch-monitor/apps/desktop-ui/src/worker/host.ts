/**
 * The pipeline host: owns the sensor adapters and the ShotPipeline and turns UI messages into
 * worker messages. It runs inside the Web Worker (pipeline.worker.ts) or, as a fallback, on the
 * UI thread (runner.ts). Messages are processed strictly in arrival order.
 */
import { createEnvironmentProfile, getBallProfile } from "@glm/ballistics";
import {
  ManualEntryAdapter,
  parseReplay,
  ReplaySensorAdapter,
  SyntheticSensorAdapter,
} from "@glm/sensor-adapters";
import type { SensorAdapter, ShotRecord } from "@glm/shared-types";
import { createTruthPropagator, fixtureShotSpec, getFixture, ShotPipeline } from "@glm/shot-pipeline";
import { randomId } from "../ids";
import { buildPipelineConfig, type IdSource, type SourceContext } from "../pipeline/config";
import { manualLaunchVectors } from "../pipeline/manual";
import { getNoisePreset } from "../pipeline/noise-presets";
import type {
  ManualLaunchFields,
  NoisePresetId,
  PipelineSettings,
  ReplayHeaderSummary,
  ShotSourceKind,
  UiToWorkerMessage,
  WorkerToUiMessage,
} from "./protocol";

export type HostDependencies = IdSource & {
  /** Monotonic milliseconds, used only to report processing time. */
  readonly nowMs: () => number;
};

type ReplaySession = {
  readonly adapter: ReplaySensorAdapter;
  readonly pipeline: ShotPipeline;
  readonly shotCount: number;
  delivered: number;
};

export const NOT_CONFIGURED_MESSAGE =
  "The pipeline is not configured yet. Check the Setup screen (environment and ball) and try again.";

/** Launch time of a manual shot on its adapter's session clock, s (any positive value works). */
const MANUAL_LAUNCH_TIME_S = 1;
const SYNTHETIC_SENSOR_ID = "synthetic-1";

/** App-layer id/clock sources. Library packages never read clocks or random sources themselves. */
export function defaultHostDependencies(): HostDependencies {
  return {
    nextShotId: randomId,
    nowUtc: () => new Date().toISOString(),
    nowMs: () => globalThis.performance.now(),
  };
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export class PipelineHost {
  private settings: PipelineSettings | null = null;
  private replay: ReplaySession | null = null;
  private lastAdapter: SensorAdapter | null = null;
  private chain: Promise<void> = Promise.resolve();

  constructor(
    private readonly emit: (message: WorkerToUiMessage) => void,
    private readonly deps: HostDependencies,
  ) {}

  /** Queue a message; the returned promise settles when it (and everything before it) is done. */
  handle(message: UiToWorkerMessage): Promise<void> {
    const run = this.chain.then(() => this.process(message)).catch((error: unknown) => {
      this.emit({ type: "error", message: errorText(error) });
    });
    this.chain = run;
    return run;
  }

  /** Resolves once every queued message has been processed. */
  idle(): Promise<void> {
    return this.chain;
  }

  private async process(message: UiToWorkerMessage): Promise<void> {
    switch (message.type) {
      case "configure":
        return this.configure(message.config);
      case "hit-synthetic":
        return this.busy(() => this.hitSynthetic(message.fixtureId, message.seed, message.noisePreset));
      case "load-replay":
        return this.busy(() => this.loadReplay(message.text, message.fileName ?? null));
      case "replay-next-shot":
        return this.busy(() => this.replayNextShot());
      case "manual-launch":
        return this.busy(() => this.manualLaunch(message));
      case "request-health":
        return this.reportHealth();
      default: {
        const unknown: never = message;
        throw new Error(`Unknown message ${JSON.stringify(unknown)}`);
      }
    }
  }

  private async busy(work: () => Promise<void>): Promise<void> {
    this.emit({ type: "busy", busy: true });
    try {
      await work();
    } finally {
      this.emit({ type: "busy", busy: false });
    }
  }

  private requireSettings(): PipelineSettings {
    if (this.settings === null) throw new Error(NOT_CONFIGURED_MESSAGE);
    return this.settings;
  }

  private configure(settings: PipelineSettings): void {
    // Validate before accepting so a bad environment never reaches a shot.
    createEnvironmentProfile(settings.environment);
    getBallProfile(settings.ballProfileId);
    this.settings = settings;
    if (this.replay !== null) {
      this.replay.pipeline.updateConfig(this.configFor(settings, this.replaySource(this.replay.adapter)));
    }
  }

  private configFor(settings: PipelineSettings, source: SourceContext) {
    return buildPipelineConfig(settings, source, { nextShotId: this.deps.nextShotId, nowUtc: this.deps.nowUtc });
  }

  private replaySource(adapter: ReplaySensorAdapter): SourceContext {
    return {
      sensorConfiguration: adapter.getConfiguration(),
      dataOrigin: adapter.capabilities.dataOrigin,
      calibration: adapter.header.calibration,
    };
  }

  private truthPropagator(settings: PipelineSettings) {
    return createTruthPropagator(createEnvironmentProfile(settings.environment), getBallProfile(settings.ballProfileId));
  }

  /**
   * Runs `deliver` with listeners on the pipeline and returns the records it produced. Shot
   * errors are collected rather than lost inside the adapter's subscriber isolation.
   */
  private collect(pipeline: ShotPipeline, deliver: () => void): ShotRecord[] {
    const records: ShotRecord[] = [];
    const errors: Error[] = [];
    const offShot = pipeline.onShot((r) => records.push(r));
    const offError = pipeline.onError((e) => errors.push(e));
    try {
      deliver();
      pipeline.flush();
    } finally {
      offShot();
      offError();
    }
    if (errors.length > 0) throw new Error(errors.map((e) => e.message).join("; "));
    return records;
  }

  private emitShots(records: readonly ShotRecord[], startedMs: number, source: ShotSourceKind): void {
    const processingMs = this.deps.nowMs() - startedMs;
    for (const record of records) this.emit({ type: "shot", record, processingMs, source });
  }

  private async hitSynthetic(fixtureId: string, seed: number, presetId: NoisePresetId): Promise<void> {
    const settings = this.requireSettings();
    if (!Number.isSafeInteger(seed) || seed < 0) throw new Error(`Seed must be a non-negative integer, got ${seed}.`);
    const fixture = getFixture(fixtureId);
    const noise = getNoisePreset(presetId).noise;
    const started = this.deps.nowMs();
    const adapter = new SyntheticSensorAdapter({
      sensorId: SYNTHETIC_SENSOR_ID,
      shots: [fixtureShotSpec(fixture, { seed, noise })],
      propagate: this.truthPropagator(settings),
      startCaptureEmits: "none",
      clock: this.deps.nowUtc,
    });
    const pipeline = new ShotPipeline(
      adapter,
      this.configFor(settings, {
        timestampSigmaS: noise.timestampJitterS,
        sensorConfiguration: adapter.getConfiguration(),
        dataOrigin: adapter.capabilities.dataOrigin,
        calibration: null,
      }),
    );
    this.lastAdapter = adapter;
    pipeline.attach();
    try {
      await adapter.connect();
      await adapter.startCapture();
      const records = this.collect(pipeline, () => adapter.emitNextShot());
      await adapter.stopCapture();
      if (records.length === 0) throw new Error(`Synthetic fixture "${fixtureId}" produced no shot.`);
      this.emitShots(records, started, "synthetic");
    } finally {
      pipeline.detach();
    }
    await this.reportHealth();
  }

  private async loadReplay(text: string, fileName: string | null): Promise<void> {
    const settings = this.requireSettings();
    const parsed = parseReplay(text);
    const adapter = new ReplaySensorAdapter(parsed, { startCaptureEmits: "none", clock: this.deps.nowUtc });
    const pipeline = new ShotPipeline(adapter, this.configFor(settings, this.replaySource(adapter)));
    if (this.replay !== null) this.replay.pipeline.detach();
    pipeline.attach();
    await adapter.connect();
    await adapter.startCapture();
    this.replay = { adapter, pipeline, shotCount: adapter.shotCount, delivered: 0 };
    this.lastAdapter = adapter;
    const h = adapter.header;
    const header: ReplayHeaderSummary = {
      formatVersion: h.formatVersion,
      coordinateSystemVersion: h.coordinateSystemVersion,
      recordedDataOrigin: h.dataOrigin,
      playbackDataOrigin: adapter.capabilities.dataOrigin,
      createdUtc: h.createdUtc,
      description: h.description,
      sensorId: h.sensorConfiguration.sensorId,
      sensorKind: h.sensorConfiguration.kind,
      sensorDescription: h.sensorConfiguration.description,
      sensorConfigurationVersion: h.sensorConfiguration.version,
      calibrationVersion: h.calibration?.version ?? null,
      calibrationStatus: h.calibration?.status ?? "none",
      hasSyntheticTruth: h.syntheticTruth !== null,
    };
    this.emit({ type: "replay-loaded", fileName, shotCount: adapter.shotCount, header, warnings: [...parsed.warnings] });
    await this.reportHealth();
  }

  private async replayNextShot(): Promise<void> {
    const replay = this.replay;
    if (replay === null) throw new Error("No replay file is loaded. Load one on the Range screen first.");
    this.requireSettings();
    const started = this.deps.nowMs();
    const step = { more: false };
    const records = this.collect(replay.pipeline, () => {
      step.more = replay.adapter.emitNextShot();
    });
    const more = step.more;
    if (more) replay.delivered += 1;
    const exhausted = !more || replay.delivered >= replay.shotCount;
    this.emitShots(records, started, "replay");
    this.emit({ type: "replay-progress", delivered: replay.delivered, shotCount: replay.shotCount, exhausted });
    if (more && records.length === 0) {
      throw new Error(`Replay shot ${replay.delivered} contained no trigger observation, so no shot was produced.`);
    }
  }

  private async manualLaunch(fields: ManualLaunchFields): Promise<void> {
    const settings = this.requireSettings();
    const vectors = manualLaunchVectors(fields);
    if (!vectors.ok) throw new Error(`Manual entry rejected: ${vectors.errors.join(" ")}`);
    const started = this.deps.nowMs();
    const adapter = new ManualEntryAdapter({ propagate: this.truthPropagator(settings), clock: this.deps.nowUtc });
    const pipeline = new ShotPipeline(
      adapter,
      this.configFor(settings, {
        sensorConfiguration: adapter.getConfiguration(),
        dataOrigin: adapter.capabilities.dataOrigin,
        calibration: null,
      }),
    );
    this.lastAdapter = adapter;
    pipeline.attach();
    try {
      await adapter.connect();
      await adapter.startCapture();
      const records = this.collect(pipeline, () => {
        adapter.submitManualLaunch({
          velocityMps: vectors.velocityMps,
          angularVelocityRadPerSec: vectors.angularVelocityRadPerSec,
          launchTimeS: MANUAL_LAUNCH_TIME_S,
        });
      });
      await adapter.stopCapture();
      this.emitShots(records, started, "manual");
    } finally {
      pipeline.detach();
    }
    await this.reportHealth();
  }

  private async reportHealth(): Promise<void> {
    const adapter = this.lastAdapter;
    if (adapter === null) {
      this.emit({ type: "health", health: null, adapterKind: null });
      return;
    }
    this.emit({ type: "health", health: await adapter.getHealth(), adapterKind: adapter.capabilities.kind });
  }
}
