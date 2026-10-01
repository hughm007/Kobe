/**
 * Placeholders for the physical sensors described in docs/sensor-specification.md. No driver
 * exists yet, so these adapters never produce data: connect(), startCapture() and
 * calibrate() reject with HardwareNotAvailableError, and health is always "disconnected".
 * Their capabilities describe what the sensor class is specified to provide, flagged as
 * hardware/live, so UI code can be built against them without any fake numbers.
 */
import { deepFreeze } from "@glm/shared-types";
import type {
  CalibrationInput,
  CalibrationResult,
  ObservationKind,
  RawSensorObservation,
  SensorAdapter,
  SensorCapabilities,
  SensorConfiguration,
  SensorHealth,
  SensorKind,
  Unsubscribe,
} from "@glm/shared-types";
import { unsetClock } from "./clock";
import type { UtcClock } from "./clock";
import { ObservationHub } from "./observation-hub";

export const SENSOR_SPECIFICATION_DOC = "docs/sensor-specification.md";

export class HardwareNotAvailableError extends Error {
  override readonly name = "HardwareNotAvailableError";
  readonly sensorKind: SensorKind;

  constructor(sensorKind: SensorKind, label: string, action: string) {
    super(
      `${label}: cannot ${action}: no ${label} driver is implemented yet. This adapter is a placeholder; ` +
        `see ${SENSOR_SPECIFICATION_DOC} for the requirements a driver must meet.`,
    );
    this.sensorKind = sensorKind;
  }
}

export type HardwareStubOptions = {
  readonly sensorId?: string;
  readonly clock?: UtcClock;
};

type HardwareProfile = {
  readonly kind: "camera" | "radar" | "hybrid";
  readonly label: string;
  readonly defaultSensorId: string;
  readonly observationKinds: readonly ObservationKind[];
  readonly measuresSpin: boolean;
};

abstract class HardwareStubAdapter implements SensorAdapter {
  readonly id: string;
  readonly capabilities: SensorCapabilities;
  private readonly hub = new ObservationHub();
  private readonly clock: UtcClock;
  private readonly profile: HardwareProfile;

  protected constructor(profile: HardwareProfile, options: HardwareStubOptions) {
    this.profile = profile;
    this.id = options.sensorId ?? profile.defaultSensorId;
    this.clock = options.clock ?? unsetClock;
    this.capabilities = deepFreeze<SensorCapabilities>({
      kind: profile.kind,
      isHardware: true,
      dataOrigin: "live",
      observationKinds: profile.observationKinds,
      measuresBallPosition3d: true,
      measuresSpin: profile.measuresSpin,
      // Club data is a later phase for every sensor class; not claimed until implemented.
      measuresClubData: false,
      providesTrigger: true,
      requiresCalibration: true,
      // Unknown until a concrete device is configured.
      nominalFrameRateHz: null,
    });
  }

  private unavailable(action: string): HardwareNotAvailableError {
    return new HardwareNotAvailableError(this.profile.kind, this.profile.label, action);
  }

  async connect(): Promise<void> {
    throw this.unavailable("connect()");
  }

  /** Nothing to release: a stub can never be connected. */
  async disconnect(): Promise<void> {}

  async startCapture(): Promise<void> {
    throw this.unavailable("startCapture()");
  }

  /** Nothing to stop: a stub can never capture. */
  async stopCapture(): Promise<void> {}

  /** Subscriptions are accepted (so UI wiring can be tested) but nothing is ever emitted. */
  subscribeToObservations(callback: (observation: RawSensorObservation) => void): Unsubscribe {
    return this.hub.subscribe(callback);
  }

  async getHealth(): Promise<SensorHealth> {
    return deepFreeze<SensorHealth>({
      sensorId: this.id,
      status: "disconnected",
      checkedUtc: this.clock(),
      metrics: [],
      messages: [
        `No ${this.profile.label} driver is implemented yet; this adapter is a placeholder and produces no data. See ${SENSOR_SPECIFICATION_DOC}.`,
      ],
      calibrationStatus: "none",
    });
  }

  getConfiguration(): SensorConfiguration {
    return deepFreeze<SensorConfiguration>({
      sensorId: this.id,
      version: `placeholder-${this.profile.kind}-0`,
      kind: this.profile.kind,
      description: `PLACEHOLDER: no ${this.profile.label} driver is implemented; this configuration describes no real device (${SENSOR_SPECIFICATION_DOC}).`,
      cameras: [],
      triggerSources: [],
      frameBuffer: { preTriggerS: 0.25, postTriggerS: 0.5 },
      storeRawCaptures: false,
    });
  }

  async calibrate(_input: CalibrationInput): Promise<CalibrationResult> {
    throw this.unavailable("calibrate()");
  }
}

/** Placeholder for the high-speed stereo camera launch monitor. */
export class CameraLaunchMonitorAdapter extends HardwareStubAdapter {
  constructor(options: HardwareStubOptions = {}) {
    super(
      {
        kind: "camera",
        label: "camera launch monitor",
        defaultSensorId: "camera-1",
        observationKinds: ["health", "ball-address", "trigger", "ball-detection-2d", "ball-position-3d", "spin"],
        measuresSpin: true,
      },
      options,
    );
  }
}

/** Placeholder for a Doppler radar launch monitor. */
export class RadarLaunchMonitorAdapter extends HardwareStubAdapter {
  constructor(options: HardwareStubOptions = {}) {
    super(
      {
        kind: "radar",
        label: "radar launch monitor",
        defaultSensorId: "radar-1",
        observationKinds: ["health", "trigger", "ball-position-3d", "spin"],
        measuresSpin: true,
      },
      options,
    );
  }
}

/** Placeholder for camera + radar fusion. */
export class HybridFusionAdapter extends HardwareStubAdapter {
  constructor(options: HardwareStubOptions = {}) {
    super(
      {
        kind: "hybrid",
        label: "hybrid camera/radar fusion",
        defaultSensorId: "hybrid-1",
        observationKinds: ["health", "ball-address", "trigger", "ball-detection-2d", "ball-position-3d", "spin"],
        measuresSpin: true,
      },
      options,
    );
  }
}
