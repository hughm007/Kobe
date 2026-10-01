import { deepFreeze } from "@glm/shared-types";
import type {
  CalibrationInput,
  CalibrationResult,
  RawSensorObservation,
  SensorAdapter,
  SensorCapabilities,
  SensorConfiguration,
  SensorHealth,
  SyntheticTruth,
  Unsubscribe,
} from "@glm/shared-types";
import { unsetClock } from "./clock";
import type { UtcClock } from "./clock";
import { AdapterLifecycle, ReentrantEmissionError } from "./lifecycle";
import type { AdapterState } from "./lifecycle";
import { observationKindsOf } from "./adapter-support";
import type { StartCaptureEmission } from "./adapter-support";
import { ObservationHub } from "./observation-hub";
import {
  defaultSyntheticSensorConfiguration,
  generateSyntheticSession,
  SYNTHETIC_HEALTH_MESSAGE,
} from "./synthetic-generator";
import type { SyntheticShotSpec, TruthPropagator } from "./synthetic-generator";

export type SyntheticSensorAdapterOptions = {
  readonly sensorId?: string;
  readonly shots: readonly SyntheticShotSpec[];
  readonly propagate: TruthPropagator;
  /**
   * Defaults to defaultSyntheticSensorConfiguration(sensorId). Its sensorId must match, its kind
   * must be "synthetic" and its description must say the data are synthetic: this is what gets
   * stored with shots and replays, so it may never describe a hardware sensor.
   */
  readonly configuration?: SensorConfiguration;
  /** Shot i launches at i * shotSpacingS + its own launchTimeS. Default 5 s. */
  readonly shotSpacingS?: number;
  readonly firstSequence?: number;
  readonly startCaptureEmits?: StartCaptureEmission;
  /** Supplies SensorHealth.checkedUtc; the library never reads the wall clock. */
  readonly clock?: UtcClock;
  /** Session-time-0 epoch (Unix ms) for checkedUtc inside emitted health observations. Default 0. */
  readonly sessionEpochUnixMs?: number;
};

/**
 * A software sensor that replays deterministic synthetic shots (generateSyntheticShot) as a
 * live-looking observation stream. All shots are generated eagerly in the constructor, so
 * invalid specs, propagator failures and overlapping shots fail fast.
 *
 * Emission is synchronous: observations reach subscribers inside startCapture() /
 * emitNextShot() before they return. A subscriber may call stopCapture() or disconnect()
 * during delivery: delivery then halts at the next observation boundary and the remaining
 * observations stay queued for the next startCapture()/emitNextShot(). Calling emitNextShot(),
 * startCapture() or reset() from inside a callback throws ReentrantEmissionError (nested
 * delivery would break time order for the other subscribers). Observations never contain
 * truth; getSyntheticTruth() exists for validation tooling only.
 */
export class SyntheticSensorAdapter implements SensorAdapter {
  readonly id: string;
  readonly capabilities: SensorCapabilities;

  private readonly configuration: SensorConfiguration;
  /** Every shot's observations, concatenated in time order. */
  private readonly observations: readonly RawSensorObservation[];
  /** Exclusive end index (into observations) of each shot. */
  private readonly shotEnds: readonly number[];
  private readonly truths: readonly SyntheticTruth[];
  private readonly hub = new ObservationHub();
  private readonly lifecycle: AdapterLifecycle;
  private readonly clock: UtcClock;
  private readonly startCaptureEmits: StartCaptureEmission;
  /** Index of the next observation to deliver. */
  private cursor = 0;

  constructor(options: SyntheticSensorAdapterOptions) {
    const sensorId = options.sensorId ?? options.configuration?.sensorId ?? "synthetic-1";
    if (options.configuration !== undefined && options.configuration.sensorId !== sensorId) {
      throw new RangeError(
        `SyntheticSensorAdapter: sensorId ${JSON.stringify(sensorId)} does not match configuration.sensorId ${JSON.stringify(options.configuration.sensorId)}`,
      );
    }
    if (options.configuration !== undefined) {
      if (options.configuration.kind !== "synthetic") {
        throw new RangeError(
          `SyntheticSensorAdapter: configuration.kind must be "synthetic", got ${JSON.stringify(options.configuration.kind)}; ` +
            "a synthetic sensor must never be described as hardware (use defaultSyntheticSensorConfiguration).",
        );
      }
      if (!/synthetic/i.test(options.configuration.description)) {
        throw new RangeError(
          "SyntheticSensorAdapter: configuration.description must state that the data are synthetic " +
            `(it must contain the word "synthetic"), got ${JSON.stringify(options.configuration.description)}`,
        );
      }
    }
    this.id = sensorId;
    this.configuration = options.configuration ?? defaultSyntheticSensorConfiguration(sensorId);
    this.lifecycle = new AdapterLifecycle(sensorId);
    this.clock = options.clock ?? unsetClock;
    this.startCaptureEmits = options.startCaptureEmits ?? "all";

    const session = generateSyntheticSession(options.shots, options.propagate, {
      sensorId,
      firstSequence: options.firstSequence ?? 0,
      ...(options.shotSpacingS !== undefined ? { shotSpacingS: options.shotSpacingS } : {}),
      ...(options.sessionEpochUnixMs !== undefined ? { sessionEpochUnixMs: options.sessionEpochUnixMs } : {}),
    });
    this.observations = Object.freeze([...session.observations]);
    let end = 0;
    this.shotEnds = session.shots.map((shot) => (end += shot.observations.length));
    this.truths = deepFreeze([...session.truths]) as readonly SyntheticTruth[];

    const shots = options.shots;
    this.capabilities = deepFreeze<SensorCapabilities>({
      kind: "synthetic",
      isHardware: false,
      dataOrigin: "synthetic",
      observationKinds: observationKindsOf(session.observations),
      measuresBallPosition3d: true,
      measuresSpin: shots.some((s) => s.noise.spin !== null),
      measuresClubData: false,
      providesTrigger: shots.some((s) => s.noise.triggerSources.length > 0),
      requiresCalibration: false,
      nominalFrameRateHz: shots[0]?.noise.frameRateHz ?? null,
    });
  }

  get state(): AdapterState {
    return this.lifecycle.state;
  }

  get shotCount(): number {
    return this.shotEnds.length;
  }

  /** Shots not yet completely delivered since construction or the last reset(). */
  get remainingShotCount(): number {
    return this.shotEnds.filter((end) => end > this.cursor).length;
  }

  /** Most recent value thrown by a subscriber (subscribers are isolated from each other). */
  get lastError(): unknown {
    return this.hub.lastError;
  }

  get subscriberErrorCount(): number {
    return this.hub.subscriberErrorCount;
  }

  async connect(): Promise<void> {
    this.lifecycle.connect();
  }

  async disconnect(): Promise<void> {
    this.lifecycle.disconnect();
  }

  /**
   * Starts capture; with startCaptureEmits "all" every remaining observation is delivered
   * before this resolves (unless a subscriber stops capture first, see the class comment).
   */
  async startCapture(): Promise<void> {
    this.assertNotDelivering("startCapture()");
    this.lifecycle.startCapture();
    if (this.startCaptureEmits === "all") this.deliverUntil(this.observations.length);
  }

  async stopCapture(): Promise<void> {
    this.lifecycle.stopCapture();
  }

  /**
   * Deliver the rest of the next (or partially delivered) shot, synchronously. Returns false
   * when every shot has been delivered. Requires an active capture.
   */
  emitNextShot(): boolean {
    this.assertNotDelivering("emitNextShot()");
    this.lifecycle.requireCapturing("emitNextShot()");
    const end = this.shotEnds.find((e) => e > this.cursor);
    if (end === undefined) return false;
    this.deliverUntil(end);
    return true;
  }

  /**
   * Rewind to the first shot. Lifecycle state and subscribers are kept. Re-emitted shots are
   * identical (same timestamps and sequence numbers), so consumers must treat a rewind as a
   * new session.
   */
  reset(): void {
    this.assertNotDelivering("reset()");
    this.cursor = 0;
  }

  subscribeToObservations(callback: (observation: RawSensorObservation) => void): Unsubscribe {
    return this.hub.subscribe(callback);
  }

  async getHealth(): Promise<SensorHealth> {
    return deepFreeze<SensorHealth>({
      sensorId: this.id,
      status: this.lifecycle.isConnected ? "ok" : "disconnected",
      checkedUtc: this.clock(),
      metrics: [],
      messages: [SYNTHETIC_HEALTH_MESSAGE],
      calibrationStatus: "none",
    });
  }

  getConfiguration(): SensorConfiguration {
    return this.configuration;
  }

  async calibrate(_input: CalibrationInput): Promise<CalibrationResult> {
    return deepFreeze<CalibrationResult>({
      record: null,
      status: "none",
      messages: ["Synthetic adapter does not use calibration."],
    });
  }

  /** Ground truth per shot, in shot order. For validation tooling only. */
  getSyntheticTruth(): readonly SyntheticTruth[] {
    return this.truths;
  }

  /** The complete observation stream (all shots), e.g. for writing a replay file. */
  getGeneratedObservations(): readonly RawSensorObservation[] {
    return this.observations;
  }

  /**
   * Deliver observations up to index `end` (exclusive) one at a time while capture is active.
   * Each observation reaches every subscriber; then the state is re-checked, so stopping or
   * disconnecting from inside a callback takes effect at the next observation boundary.
   */
  private deliverUntil(end: number): void {
    while (this.cursor < end && this.lifecycle.state === "capturing") {
      const observation = this.observations[this.cursor]!;
      this.cursor += 1;
      this.hub.publish(observation);
    }
  }

  private assertNotDelivering(action: string): void {
    if (this.hub.isDelivering) throw new ReentrantEmissionError(this.id, action);
  }
}
