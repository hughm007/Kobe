import { isFiniteVec, ZERO } from "@glm/core-math";
import { deepFreeze } from "@glm/shared-types";
import type {
  CalibrationInput,
  CalibrationResult,
  Matrix,
  RawSensorObservation,
  SensorAdapter,
  SensorCapabilities,
  SensorConfiguration,
  SensorHealth,
  Unsubscribe,
  Vec3,
} from "@glm/shared-types";
import { unsetClock } from "./clock";
import type { UtcClock } from "./clock";
import { vecWithoutNegativeZero } from "./adapter-support";
import { AdapterLifecycle, ReentrantEmissionError } from "./lifecycle";
import type { AdapterState } from "./lifecycle";
import { ObservationHub } from "./observation-hub";
import type { TruthPropagator } from "./synthetic-generator";

export const MANUAL_ENTRY_WARNING =
  "Manual entry adapter: FOR DEVELOPER TESTING ONLY. Launch conditions are typed in by hand; they are not measurements and must never be presented as hardware or launch-monitor data.";

/** Frame rate of the noise-free positions emitted per manual launch (a test setting), Hz. */
export const MANUAL_FRAME_RATE_HZ = 1000;
/** Number of ball-position-3d observations emitted per manual launch. */
export const MANUAL_FRAME_COUNT = 10;
/** Tiny reported variance so downstream estimators treat the points as near-exact, m^2 or (rad/s)^2. */
export const MANUAL_VARIANCE = 1e-8;
/** The address observation precedes the manual launch by this much, s. */
export const MANUAL_ADDRESS_LEAD_S = 0.1;
/**
 * DEVELOPER PLACEHOLDERS for the quality fields of the manual spin observation. No rotation
 * was observed or fitted: the spin is typed in. The count mirrors the emitted frame count and
 * the residual is 0 only so that the typed value can exercise the measured-spin code path;
 * they are not quality statistics. dataOrigin "manual", method "synthetic" and the
 * "manual-entry" quality flag mark the value as not measured.
 */
export const MANUAL_SPIN_PLACEHOLDER_OBSERVATION_COUNT = MANUAL_FRAME_COUNT;
export const MANUAL_SPIN_PLACEHOLDER_FIT_RESIDUAL_RAD = 0;

export type ManualLaunchInput = {
  readonly velocityMps: Vec3;
  /** null = spin not provided: no spin observation is emitted. */
  readonly angularVelocityRadPerSec: Vec3 | null;
  readonly launchTimeS: number;
};

export type ManualEntryAdapterOptions = {
  readonly propagate: TruthPropagator;
  readonly sensorId?: string;
  /** Ball-center position at launch; default the world origin (calibrated address point). */
  readonly launchPositionM?: Vec3;
  readonly clock?: UtcClock;
};

const diag = (v: number): Matrix => [
  [v, 0, 0],
  [0, v, 0],
  [0, 0, v],
];

/**
 * DEVELOPER TESTING ONLY. Turns hand-typed launch conditions into an observation stream so
 * the pipeline and UI can be exercised without hardware. It is never hardware: capabilities
 * say isHardware false / dataOrigin "manual", and getHealth() repeats the warning.
 *
 * Each submitManualLaunch() emits, in time order: a ball-address observation (launch - 0.1 s),
 * a "manual" trigger at launch, 10 noise-free ball-position-3d observations at 1000 fps
 * (frames 1..10 after launch, covariance diag(1e-8) m^2), and, only if spin was given, a spin
 * observation (method "synthetic", qualityFlags ["manual-entry"]; its count/residual fields
 * are placeholders, see MANUAL_SPIN_PLACEHOLDER_OBSERVATION_COUNT). Without spin the positions
 * are propagated with zero angular velocity; over 10 ms the Magnus contribution is negligible.
 */
export class ManualEntryAdapter implements SensorAdapter {
  readonly id: string;
  readonly capabilities: SensorCapabilities;

  private readonly propagate: TruthPropagator;
  private readonly launchPositionM: Vec3;
  private readonly hub = new ObservationHub();
  private readonly lifecycle: AdapterLifecycle;
  private readonly clock: UtcClock;
  private readonly configuration: SensorConfiguration;
  private nextSequence = 0;
  private lastTimestampS = -Infinity;

  constructor(options: ManualEntryAdapterOptions) {
    if (typeof options.propagate !== "function") throw new TypeError("ManualEntryAdapter: propagate must be a function");
    this.id = options.sensorId ?? "manual-dev";
    this.propagate = options.propagate;
    this.launchPositionM = options.launchPositionM ?? ZERO;
    if (!isFiniteVec(this.launchPositionM)) throw new RangeError("ManualEntryAdapter: launchPositionM must be finite");
    this.lifecycle = new AdapterLifecycle(this.id);
    this.clock = options.clock ?? unsetClock;
    this.capabilities = deepFreeze<SensorCapabilities>({
      kind: "manual",
      isHardware: false,
      dataOrigin: "manual",
      observationKinds: ["ball-address", "trigger", "ball-position-3d", "spin"],
      measuresBallPosition3d: true,
      measuresSpin: true,
      measuresClubData: false,
      providesTrigger: true,
      requiresCalibration: false,
      nominalFrameRateHz: MANUAL_FRAME_RATE_HZ,
    });
    this.configuration = deepFreeze<SensorConfiguration>({
      sensorId: this.id,
      version: "manual-dev-config-1",
      kind: "manual",
      description: `DEVELOPER TESTING ONLY: launch conditions entered by hand, not measured. ${MANUAL_ENTRY_WARNING}`,
      cameras: [],
      triggerSources: ["manual"],
      frameBuffer: { preTriggerS: 0.25, postTriggerS: 0.5 },
      storeRawCaptures: true,
    });
  }

  get state(): AdapterState {
    return this.lifecycle.state;
  }

  get lastError(): unknown {
    return this.hub.lastError;
  }

  async connect(): Promise<void> {
    this.lifecycle.connect();
  }

  async disconnect(): Promise<void> {
    this.lifecycle.disconnect();
  }

  async startCapture(): Promise<void> {
    this.lifecycle.startCapture();
  }

  async stopCapture(): Promise<void> {
    this.lifecycle.stopCapture();
  }

  /**
   * DEVELOPER TESTING ONLY. Emit the observations of one hand-entered launch (synchronously)
   * and return the ones delivered. Requires an active capture; launchTimeS must be later than
   * every previously emitted observation so per-sensor timestamps stay monotonic. If a
   * subscriber stops capture or disconnects during delivery, the rest of the launch is
   * dropped (a stopped sensor emits nothing). Calling this from inside an observation
   * callback throws ReentrantEmissionError.
   */
  submitManualLaunch(input: ManualLaunchInput): readonly RawSensorObservation[] {
    if (this.hub.isDelivering) throw new ReentrantEmissionError(this.id, "submitManualLaunch()");
    this.lifecycle.requireCapturing("submitManualLaunch()");
    const { velocityMps, angularVelocityRadPerSec, launchTimeS } = input;
    if (velocityMps === null || typeof velocityMps !== "object" || !isFiniteVec(velocityMps)) {
      throw new RangeError("submitManualLaunch: velocityMps must be a finite Vec3 (m/s)");
    }
    if (angularVelocityRadPerSec !== null && !isFiniteVec(angularVelocityRadPerSec)) {
      throw new RangeError("submitManualLaunch: angularVelocityRadPerSec must be a finite Vec3 (rad/s) or null");
    }
    if (typeof launchTimeS !== "number" || !Number.isFinite(launchTimeS)) {
      throw new RangeError("submitManualLaunch: launchTimeS must be a finite number (s, session clock)");
    }
    const addressTimeS = launchTimeS - MANUAL_ADDRESS_LEAD_S;
    if (!(addressTimeS > this.lastTimestampS)) {
      throw new RangeError(
        `submitManualLaunch: launchTimeS ${launchTimeS} s is too early; its address observation (launch - ${MANUAL_ADDRESS_LEAD_S} s) ` +
          `must come after the previous observation at ${this.lastTimestampS} s.`,
      );
    }

    const dts = Array.from({ length: MANUAL_FRAME_COUNT }, (_, k) => (k + 1) / MANUAL_FRAME_RATE_HZ);
    const positions = this.propagate(this.launchPositionM, velocityMps, angularVelocityRadPerSec ?? ZERO, dts);
    if (!Array.isArray(positions) || positions.length !== dts.length || !positions.every((p) => isFiniteVec(p))) {
      throw new RangeError(`submitManualLaunch: propagator must return ${dts.length} finite positions`);
    }

    const sensorId = this.id;
    const next = (): number => this.nextSequence++;
    const observations: RawSensorObservation[] = [
      {
        kind: "ball-address",
        sensorId,
        sequence: next(),
        timestampS: addressTimeS,
        positionM: vecWithoutNegativeZero(this.launchPositionM),
        stationary: true,
        inHittingZone: true,
        ballCount: 1,
        confidence: 1,
      },
      { kind: "trigger", sensorId, sequence: next(), timestampS: launchTimeS, triggerSource: "manual", confidence: 1 },
    ];
    positions.forEach((p, k) => {
      observations.push({
        kind: "ball-position-3d",
        sensorId,
        sequence: next(),
        timestampS: launchTimeS + dts[k]!,
        frameIndex: k + 1,
        positionM: vecWithoutNegativeZero(p),
        covarianceM2: diag(MANUAL_VARIANCE),
        reprojectionErrorPx: null,
        detectionConfidence: 1,
        cameraIds: [],
      });
    });
    if (angularVelocityRadPerSec !== null) {
      observations.push({
        kind: "spin",
        sensorId,
        sequence: next(),
        timestampS: launchTimeS + (MANUAL_FRAME_COUNT + 1) / MANUAL_FRAME_RATE_HZ,
        method: "synthetic",
        angularVelocityRadPerSec: vecWithoutNegativeZero(angularVelocityRadPerSec),
        covarianceRad2PerS2: diag(MANUAL_VARIANCE),
        validObservationCount: MANUAL_SPIN_PLACEHOLDER_OBSERVATION_COUNT,
        fitResidualRad: MANUAL_SPIN_PLACEHOLDER_FIT_RESIDUAL_RAD,
        qualityFlags: ["manual-entry"],
      });
    }
    for (const observation of observations) deepFreeze(observation);
    this.lastTimestampS = observations[observations.length - 1]!.timestampS;
    // One observation at a time: a subscriber that stops capture halts delivery.
    let delivered = 0;
    while (delivered < observations.length && this.lifecycle.state === "capturing") {
      this.hub.publish(observations[delivered]!);
      delivered += 1;
    }
    return observations.slice(0, delivered);
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
      messages: [MANUAL_ENTRY_WARNING],
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
      messages: ["Manual entry adapter (developer testing only) does not use calibration."],
    });
  }
}
