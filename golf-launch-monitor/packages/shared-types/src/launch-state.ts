import type { Handedness } from "./equipment";
import type { Measurement } from "./measurement";
import type { IsoUtcTimestamp, Matrix, Vec3 } from "./primitives";

export type Validity = "valid" | "provisional" | "invalid";

/**
 * Where the shot's data stream came from. Orthogonal to per-value MeasurementSource:
 * a replay of a real camera capture is `dataOrigin: "replay"` with `measured-camera` values.
 */
export type DataOrigin = "live" | "replay" | "synthetic" | "manual";

/**
 * How the spin vector used for simulation was obtained (docs/spin-measurement.md).
 * - measured: from ball-surface observation of this shot.
 * - estimated: from a player/club model with stated uncertainty.
 * - assumed-generic-fallback: generic value, only when the user explicitly allowed it.
 * - unavailable: no credible spin; spin-dependent outputs are unavailable or low confidence.
 */
export type SpinMode = "measured" | "estimated" | "assumed-generic-fallback" | "unavailable";

/** One contributor to the overall confidence score. */
export type ConfidenceFactor = {
  readonly id: string;
  readonly label: string;
  /** 0 (worst) .. 1 (best). */
  readonly score: number;
  /** Relative weight in the aggregate. */
  readonly weight: number;
  readonly detail: string;
  /** If true, this factor alone forces validity "invalid". */
  readonly blocking: boolean;
};

/** Diagnostics from the multi-frame launch-state fit (docs/vision-pipeline.md, Stage E). */
export type LaunchFitDiagnostics = {
  readonly model: string;
  readonly observationCount: number;
  readonly inlierCount: number;
  readonly timeSpanS: number;
  readonly rmsResidualM: number;
  readonly maxResidualM: number;
  readonly iterations: number;
  readonly converged: boolean;
  /** 3x3 covariance of the fitted launch position, m^2. */
  readonly positionCovarianceM2: Matrix;
  /** 3x3 covariance of the fitted launch velocity, (m/s)^2. */
  readonly velocityCovarianceM2PerS2: Matrix;
};

export type ImpactLocation = {
  /** Positive toward the toe, mm from face center. */
  readonly heelToe: number;
  /** Positive toward the crown, mm from face center. */
  readonly lowHigh: number;
};

/**
 * The launch conditions of one shot, with full provenance.
 *
 * Authoritative values are the SI vectors `ballPositionM`, `velocityMps`, and
 * `angularVelocityRadPerSec`. The scalar `*Deg` / `*Rpm` fields are mandated by the data
 * contract for golfer-facing use and are always derived from those vectors; physics code
 * never reads them.
 */
export type LaunchState = {
  readonly schemaVersion: string;
  readonly shotId: string;
  readonly sessionId: string;
  readonly playerId: string | null;
  readonly timestampUtc: IsoUtcTimestamp;

  readonly coordinateSystemVersion: string;
  readonly calibrationVersion: string;
  readonly sensorConfigurationVersion: string;
  readonly ballProfileVersion: string;
  readonly physicsModelVersion: string;
  readonly estimatorVersion: string;

  readonly dataOrigin: DataOrigin;
  readonly handedness: Handedness;
  readonly clubId: string | null;
  readonly ballId: string | null;

  /** Sensor-clock time (s) that the position/velocity refer to (launch reference time). */
  readonly launchTimeS: number | null;

  readonly ballPositionM: Measurement<Vec3>;
  readonly velocityMps: Measurement<Vec3>;
  readonly angularVelocityRadPerSec: Measurement<Vec3>;
  readonly spinMode: SpinMode;

  readonly ballSpeedMps: Measurement<number>;
  readonly verticalLaunchAngleDeg: Measurement<number>;
  /** Right-hand rotation about +Z: positive = left of the target line. */
  readonly horizontalLaunchAngleDeg: Measurement<number>;

  readonly totalSpinRpm: Measurement<number>;
  /** Right-hand rotation of the spin axis about the velocity: positive = curves right. */
  readonly spinAxisTiltDeg: Measurement<number>;

  // Optional club delivery data. Every field is `unavailable` unless a sensor measured it.
  readonly clubSpeedMps: Measurement<number>;
  readonly smashFactor: Measurement<number>;
  readonly attackAngleDeg: Measurement<number>;
  readonly clubPathDeg: Measurement<number>;
  readonly faceToTargetDeg: Measurement<number>;
  readonly faceToPathDeg: Measurement<number>;
  readonly dynamicLoftDeg: Measurement<number>;
  readonly dynamicLieDeg: Measurement<number>;
  readonly impactLocationMm: Measurement<ImpactLocation>;
  readonly closureRateDegPerSec: Measurement<number>;
  readonly lowPointM: Measurement<number>;

  readonly fitDiagnostics: LaunchFitDiagnostics | null;
  readonly confidenceFactors: readonly ConfidenceFactor[];
  readonly overallConfidence: number;
  readonly validity: Validity;
  readonly warnings: readonly string[];
  readonly rejectionReasons: readonly string[];
};
