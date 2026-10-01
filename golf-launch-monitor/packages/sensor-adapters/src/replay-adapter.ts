import { deepFreeze } from "@glm/shared-types";
import type {
  CalibrationInput,
  CalibrationResult,
  DataOrigin,
  RawSensorObservation,
  ReplayHeader,
  SensorAdapter,
  SensorCapabilities,
  SensorConfiguration,
  SensorHealth,
  Unsubscribe,
} from "@glm/shared-types";
import { unsetClock } from "./clock";
import type { UtcClock } from "./clock";
import { AdapterLifecycle, ReentrantEmissionError } from "./lifecycle";
import type { AdapterState } from "./lifecycle";
import { observationKindsOf, REPLAY_SHOT_GAP_S } from "./adapter-support";
import type { StartCaptureEmission } from "./adapter-support";
import { ObservationHub } from "./observation-hub";
import { checkReplayContent } from "./replay-format";
import type { ReplayContent } from "./replay-format";

/**
 * Split a replay's observations into shots. Returns the exclusive end index of each shot.
 *
 * Rule: a health, ball-address or trigger observation starts a NEW shot when the current shot
 * already contains a trigger and the observation is more than REPLAY_SHOT_GAP_S (1 s) after
 * that shot's most recent trigger. Consequently:
 * - pre-shot health/address observations belong to the shot whose trigger follows them;
 * - triggers within 1 s of each other form one trigger group (multi-source triggering) and
 *   stay in one shot, as do the ball-position and spin observations that follow them;
 * - a replay without any trigger is a single shot.
 * File order is used as recorded (timestamps are not re-sorted).
 */
export function replayShotEndIndices(observations: readonly RawSensorObservation[]): number[] {
  const ends: number[] = [];
  let lastTriggerS: number | null = null;
  observations.forEach((observation, i) => {
    const startsShot = observation.kind === "health" || observation.kind === "ball-address" || observation.kind === "trigger";
    if (startsShot && lastTriggerS !== null && observation.timestampS - lastTriggerS > REPLAY_SHOT_GAP_S) {
      ends.push(i);
      lastTriggerS = null;
    }
    if (observation.kind === "trigger") lastTriggerS = observation.timestampS;
  });
  if (observations.length > 0) ends.push(observations.length);
  return ends;
}

/** The observations of each shot, using the rule of replayShotEndIndices. */
export function splitReplayIntoShots(observations: readonly RawSensorObservation[]): RawSensorObservation[][] {
  const shots: RawSensorObservation[][] = [];
  let start = 0;
  for (const end of replayShotEndIndices(observations)) {
    shots.push(observations.slice(start, end));
    start = end;
  }
  return shots;
}

export type ReplaySensorAdapterOptions = {
  /** Adapter id; defaults to the header's sensorConfiguration.sensorId. Observations keep their recorded sensorId. */
  readonly sensorId?: string;
  readonly startCaptureEmits?: StartCaptureEmission;
  readonly clock?: UtcClock;
};

/**
 * Plays back a parsed replay file through the SensorAdapter interface. Live recordings are
 * relabelled dataOrigin "replay"; synthetic and manual recordings keep their origin so they
 * can never be mistaken for measurements. Emission is synchronous (see SyntheticSensorAdapter).
 */
export class ReplaySensorAdapter implements SensorAdapter {
  readonly id: string;
  readonly capabilities: SensorCapabilities;
  readonly header: ReplayHeader;

  private readonly observations: readonly RawSensorObservation[];
  private readonly shotEnds: readonly number[];
  private readonly hub = new ObservationHub();
  private readonly lifecycle: AdapterLifecycle;
  private readonly clock: UtcClock;
  private readonly startCaptureEmits: StartCaptureEmission;
  private cursor = 0;

  /**
   * The content is checked like a file read with parseReplay (header versions, schema and
   * origin consistency; provenance of every observation), so in-memory content cannot relabel
   * synthetic data as a live recording. Throws ReplayFormatError.
   */
  constructor(replay: ReplayContent, options: ReplaySensorAdapterOptions = {}) {
    checkReplayContent(replay);
    const { header } = replay;
    this.header = header;
    this.observations = [...replay.observations];
    this.shotEnds = replayShotEndIndices(this.observations);
    this.id = options.sensorId ?? header.sensorConfiguration.sensorId;
    this.lifecycle = new AdapterLifecycle(this.id);
    this.clock = options.clock ?? unsetClock;
    this.startCaptureEmits = options.startCaptureEmits ?? "all";

    const kinds = observationKindsOf(this.observations);
    const dataOrigin: DataOrigin = header.dataOrigin === "live" ? "replay" : header.dataOrigin;
    this.capabilities = deepFreeze<SensorCapabilities>({
      kind: "replay",
      isHardware: false,
      dataOrigin,
      observationKinds: kinds,
      measuresBallPosition3d: kinds.includes("ball-position-3d"),
      measuresSpin: kinds.includes("spin"),
      measuresClubData: false,
      providesTrigger: kinds.includes("trigger"),
      requiresCalibration: false,
      nominalFrameRateHz: header.sensorConfiguration.cameras[0]?.frameRateHz ?? null,
    });
  }

  get state(): AdapterState {
    return this.lifecycle.state;
  }

  get shotCount(): number {
    return this.shotEnds.length;
  }

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
   * With startCaptureEmits "all" (default), delivers every remaining observation in file order
   * before resolving. A subscriber that calls stopCapture() or disconnect() halts delivery at
   * the next observation; the rest is delivered by a later startCapture() or emitNextShot().
   */
  async startCapture(): Promise<void> {
    this.assertNotDelivering("startCapture()");
    this.lifecycle.startCapture();
    if (this.startCaptureEmits === "all") this.emitUntil(this.observations.length);
  }

  async stopCapture(): Promise<void> {
    this.lifecycle.stopCapture();
  }

  /**
   * Deliver from the current position through the end of the next shot (see
   * replayShotEndIndices). Returns false when the replay is exhausted. Requires capture.
   */
  emitNextShot(): boolean {
    this.assertNotDelivering("emitNextShot()");
    this.lifecycle.requireCapturing("emitNextShot()");
    const end = this.shotEnds.find((e) => e > this.cursor);
    if (end === undefined) return false;
    this.emitUntil(end);
    return true;
  }

  /**
   * Rewind to the start of the replay; state and subscribers are kept. The recorded
   * observations are replayed unchanged (same timestamps and sequence numbers), so consumers
   * must treat a rewind as a new session.
   */
  reset(): void {
    this.assertNotDelivering("reset()");
    this.cursor = 0;
  }

  subscribeToObservations(callback: (observation: RawSensorObservation) => void): Unsubscribe {
    return this.hub.subscribe(callback);
  }

  async getHealth(): Promise<SensorHealth> {
    const calibrationStatus = this.header.calibration?.status ?? "none";
    const messages = [
      `Replay of recorded data (recorded dataOrigin "${this.header.dataOrigin}", created ${this.header.createdUtc}); not a live measurement.`,
    ];
    if (this.header.calibration === null) messages.push("The replay contains no calibration record.");
    else messages.push(`Calibration ${this.header.calibration.version} recorded with status ${calibrationStatus}.`);
    return deepFreeze<SensorHealth>({
      sensorId: this.id,
      status: this.lifecycle.isConnected ? "ok" : "disconnected",
      checkedUtc: this.clock(),
      metrics: [],
      messages,
      calibrationStatus,
    });
  }

  getConfiguration(): SensorConfiguration {
    return this.header.sensorConfiguration;
  }

  /** Replays cannot recalibrate: reports the calibration stored in the header. */
  async calibrate(_input: CalibrationInput): Promise<CalibrationResult> {
    const record = this.header.calibration;
    return deepFreeze<CalibrationResult>({
      record,
      status: record?.status ?? "none",
      messages: [
        record === null
          ? "Replays cannot recalibrate; this replay contains no calibration record."
          : `Replays cannot recalibrate; reporting calibration ${record.version} stored in the replay header.`,
      ],
    });
  }

  /**
   * Deliver observations up to index `end` (exclusive) one at a time while capture is active.
   * Each observation reaches every subscriber; then the state is re-checked, so stopping or
   * disconnecting from inside a callback takes effect at the next observation boundary.
   */
  private emitUntil(end: number): void {
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
