import type { CalibrationPatternSpec, CalibrationRecord, CalibrationStatus, ImageSize } from "./calibration";
import type { DataOrigin } from "./launch-state";
import type { IsoUtcTimestamp, Matrix, Vec3 } from "./primitives";

export type SensorKind = "camera" | "radar" | "hybrid" | "replay" | "synthetic" | "manual";

export type TriggerSource =
  | "microphone"
  | "beam-break"
  | "ball-motion"
  | "club-proximity"
  | "synthetic"
  | "manual";

export type ObservationKind = RawSensorObservation["kind"];

export type SensorCapabilities = {
  readonly kind: SensorKind;
  /** True only for adapters backed by physical hardware. */
  readonly isHardware: boolean;
  readonly dataOrigin: DataOrigin;
  readonly observationKinds: readonly ObservationKind[];
  readonly measuresBallPosition3d: boolean;
  readonly measuresSpin: boolean;
  readonly measuresClubData: boolean;
  readonly providesTrigger: boolean;
  readonly requiresCalibration: boolean;
  readonly nominalFrameRateHz: number | null;
};

export type HealthStatus = "ok" | "degraded" | "failed" | "disconnected";
export type HealthMetricStatus = "ok" | "warn" | "fail" | "unknown";

/** Camera health metric ids (docs/sensor-specification.md). */
export const CAMERA_HEALTH_METRIC_IDS = [
  "resolution",
  "frame-rate",
  "exposure-blur",
  "dropped-frames",
  "sync-drift",
  "focus-sharpness",
  "dynamic-range-clipping",
  "ball-zone-visibility",
  "background-quality",
  "lighting-flicker",
  "camera-movement",
  "calibration-validity",
] as const;

export type HealthMetric = {
  readonly id: string;
  readonly label: string;
  readonly value: number | null;
  readonly unit: string;
  readonly status: HealthMetricStatus;
  readonly detail: string;
};

export type SensorHealth = {
  readonly sensorId: string;
  readonly status: HealthStatus;
  readonly checkedUtc: IsoUtcTimestamp;
  readonly metrics: readonly HealthMetric[];
  readonly messages: readonly string[];
  readonly calibrationStatus: CalibrationStatus;
};

export type CameraDeviceConfiguration = {
  readonly cameraId: string;
  readonly model: string;
  readonly resolution: ImageSize;
  readonly frameRateHz: number;
  readonly exposureUs: number;
  readonly shutter: "global" | "rolling" | "unknown";
  readonly syncMode: "hardware" | "software" | "none";
  readonly fixedFocus: boolean;
};

export type FrameBufferConfiguration = {
  /** Retained before the trigger, s (>= 0.25 by default). */
  readonly preTriggerS: number;
  /** Retained after the trigger, s (>= 0.5 by default). */
  readonly postTriggerS: number;
};

export type SensorConfiguration = {
  readonly sensorId: string;
  /** Unique version id; every shot records the configuration it was captured with. */
  readonly version: string;
  readonly kind: SensorKind;
  readonly description: string;
  readonly cameras: readonly CameraDeviceConfiguration[];
  readonly triggerSources: readonly TriggerSource[];
  readonly frameBuffer: FrameBufferConfiguration;
  /** Whether raw frames/logs may be stored (privacy/storage consent). */
  readonly storeRawCaptures: boolean;
};

type ObservationBase = {
  readonly sensorId: string;
  /** Monotonic per-sensor sequence number. */
  readonly sequence: number;
  /** Time on the shared session clock, s. Adapters convert device clocks to this. */
  readonly timestampS: number;
};

/** A candidate impact event from one trigger source. */
export type TriggerObservation = ObservationBase & {
  readonly kind: "trigger";
  readonly triggerSource: TriggerSource;
  readonly confidence: number;
};

/** Ball-at-address verification (docs/vision-pipeline.md, Stage A). */
export type BallAddressObservation = ObservationBase & {
  readonly kind: "ball-address";
  readonly positionM: Vec3;
  readonly stationary: boolean;
  readonly inHittingZone: boolean;
  readonly ballCount: number;
  readonly confidence: number;
};

/** A 2D ball detection in one camera image (Phase 2 vision pipeline). */
export type BallDetection2dObservation = ObservationBase & {
  readonly kind: "ball-detection-2d";
  readonly cameraId: string;
  readonly frameIndex: number;
  readonly centerPx: { readonly u: number; readonly v: number };
  readonly radiusPx: number;
  readonly confidence: number;
};

/** A reconstructed 3D ball center in the world frame. */
export type BallPosition3dObservation = ObservationBase & {
  readonly kind: "ball-position-3d";
  readonly frameIndex: number;
  readonly positionM: Vec3;
  /** 3x3 covariance of the position, m^2. */
  readonly covarianceM2: Matrix;
  readonly reprojectionErrorPx: number | null;
  readonly detectionConfidence: number;
  readonly cameraIds: readonly string[];
};

export type SpinMeasurementMethod = "marked-ball" | "dimple-tracking" | "radar-doppler" | "synthetic";

/** A direct observation of the ball's angular velocity. */
export type SpinObservation = ObservationBase & {
  readonly kind: "spin";
  readonly method: SpinMeasurementMethod;
  readonly angularVelocityRadPerSec: Vec3;
  /** 3x3 covariance, (rad/s)^2. */
  readonly covarianceRad2PerS2: Matrix;
  readonly validObservationCount: number;
  /** RMS rotational-fit residual, radians. */
  readonly fitResidualRad: number;
  readonly qualityFlags: readonly string[];
};

export type HealthObservation = ObservationBase & {
  readonly kind: "health";
  readonly health: SensorHealth;
};

/** Every observation a sensor adapter may emit, in the common world frame. */
export type RawSensorObservation =
  | TriggerObservation
  | BallAddressObservation
  | BallDetection2dObservation
  | BallPosition3dObservation
  | SpinObservation
  | HealthObservation;

export type Unsubscribe = () => void;

export type CalibrationInput = {
  readonly kind: "intrinsic" | "extrinsic" | "world-frame" | "full";
  readonly pattern: CalibrationPatternSpec;
  /** Local paths to captured calibration images. */
  readonly imagePaths: readonly string[];
  /** Optional known physical length (m) used for scale verification. */
  readonly knownLengthM: number | null;
};

export type CalibrationResult = {
  readonly record: CalibrationRecord | null;
  readonly status: CalibrationStatus;
  readonly messages: readonly string[];
};

/**
 * Every sensor (real or simulated) implements this interface. The UI never depends on a
 * specific device; it talks only to this contract.
 */
export interface SensorAdapter {
  readonly id: string;
  readonly capabilities: SensorCapabilities;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getHealth(): Promise<SensorHealth>;
  startCapture(): Promise<void>;
  stopCapture(): Promise<void>;
  subscribeToObservations(callback: (observation: RawSensorObservation) => void): Unsubscribe;
  getConfiguration(): SensorConfiguration;
  calibrate(input: CalibrationInput): Promise<CalibrationResult>;
}
