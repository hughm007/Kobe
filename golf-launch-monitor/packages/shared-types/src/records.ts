import type { CalibrationRecord } from "./calibration";
import type { DataOrigin, LaunchState } from "./launch-state";
import type { IsoUtcTimestamp, Matrix, Vec3 } from "./primitives";
import type { RawSensorObservation, SensorConfiguration } from "./sensor";
import type { ShotResult } from "./shot-result";

export type Session = {
  readonly schemaVersion: string;
  readonly id: string;
  readonly startedUtc: IsoUtcTimestamp;
  readonly endedUtc: IsoUtcTimestamp | null;
  readonly dataOrigin: DataOrigin;
  readonly sensorConfigurationVersion: string;
  readonly calibrationVersion: string;
  readonly playerIds: readonly string[];
  readonly label: string;
};

export type ScoringEligibility = {
  /** Whether this shot may update an official (non-casual) score. */
  readonly eligible: boolean;
  readonly reason: string;
  /** True if a user explicitly overrode an ineligible shot in casual mode. */
  readonly overriddenByUser: boolean;
};

/**
 * Everything retained for one shot: raw evidence, every version that produced the result,
 * the launch state, and the physical result. A shot whose launch state is invalid keeps its
 * observations and diagnostics; `result` is null when simulation was not possible.
 */
export type ShotRecord = {
  readonly schemaVersion: string;
  readonly shotId: string;
  readonly sessionId: string;
  readonly createdUtc: IsoUtcTimestamp;
  readonly dataOrigin: DataOrigin;
  readonly softwareVersion: string;
  readonly sensorConfiguration: SensorConfiguration;
  /** Raw observations for this shot, or null if storage consent was not given. */
  readonly rawObservations: readonly RawSensorObservation[] | null;
  /** Local paths to raw frame captures, if retained. */
  readonly rawCapturePaths: readonly string[];
  readonly launch: LaunchState;
  readonly result: ShotResult | null;
  readonly simulationSkippedReason: string | null;
  readonly scoring: ScoringEligibility;
};

/**
 * Ground truth for a synthetic shot. Stored only in synthetic replay files and consumed only
 * by validation tooling; the measurement pipeline never reads it.
 */
export type SyntheticTruth = {
  readonly label: string;
  readonly positionM: Vec3;
  readonly velocityMps: Vec3;
  readonly angularVelocityRadPerSec: Vec3;
  readonly launchTimeS: number;
  readonly seed: number;
  readonly noiseModel: Readonly<Record<string, number>>;
};

export type ReplayHeader = {
  readonly type: "header";
  readonly formatVersion: string;
  readonly coordinateSystemVersion: string;
  readonly dataOrigin: DataOrigin;
  readonly createdUtc: IsoUtcTimestamp;
  readonly description: string;
  readonly sensorConfiguration: SensorConfiguration;
  readonly calibration: CalibrationRecord | null;
  /** Present only for synthetic files; one entry per shot in file order. */
  readonly syntheticTruth: readonly SyntheticTruth[] | null;
};

export type ReplayObservationRecord = {
  readonly type: "observation";
  readonly observation: RawSensorObservation;
};

/** One line of a replay JSON Lines file. The first line is always the header. */
export type ReplayRecord = ReplayHeader | ReplayObservationRecord;

/** Re-exported for convenience in record consumers. */
export type { Matrix };
