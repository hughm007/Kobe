import { PHYSICS_MODEL_VERSION } from "@glm/ballistics";
import { dot, normSq, sub } from "@glm/core-math";
import { GROUND_MODEL_VERSION } from "@glm/ground-physics";
import {
  ballZoneFactor,
  buildLaunchState,
  calibrationFactor,
  fitLaunchState,
  gravityOnlyTrajectoryModel,
  type LaunchFitFailure,
  type LaunchFitSuccess,
  launchMeasurementsFromFit,
  type PlayerSpinHistoryEntry,
  resolveSpin,
  sensorHealthFactor,
  type SpinResolution,
  triggerFactor,
} from "@glm/launch-state";
import {
  type BallAerodynamicsProfile,
  type BallPosition3dObservation,
  type CalibrationRecord,
  type ClubCategory,
  type ConfidenceFactor,
  type DataOrigin,
  deepFreeze,
  type EnvironmentProfile,
  type Handedness,
  type LaunchState,
  type Measurement,
  type MeasurementSource,
  SCHEMA_VERSION,
  type ScoringEligibility,
  type SensorConfiguration,
  type ShotRecord,
  ShotRecordSchema,
  type ShotResult,
  type SimulationSettings,
  type SpinObservation,
  type TerrainQuery,
  type TriggerSource,
  type Vec3,
} from "@glm/shared-types";
import { SHOT_SIMULATOR_VERSION, simulateShot } from "@glm/shot-simulator";
import { createAeroTrajectoryModel } from "./models";
import type { ShotObservationGroup } from "./segmenter";
import { fuseTriggers } from "./triggers";

export const SOFTWARE_VERSION = "golf-launch-monitor-0.1.0";

/** Everything the pipeline needs to turn one shot's observations into a ShotRecord. */
export type PipelineConfig = {
  readonly sessionId: string;
  readonly playerId: string | null;
  readonly handedness: Handedness;
  readonly clubId: string | null;
  readonly clubCategory: ClubCategory | null;
  readonly ballProfile: BallAerodynamicsProfile;
  readonly environment: EnvironmentProfile;
  readonly terrain: TerrainQuery;
  readonly simulationSettings: SimulationSettings;
  readonly dataOrigin: DataOrigin;
  readonly sensorConfiguration: SensorConfiguration;
  readonly calibration: CalibrationRecord | null;
  /** Spin MODE 3: only when the user explicitly allows a generic fallback. */
  readonly allowGenericSpinFallback: boolean;
  /** Retain raw observations in the shot record (privacy/storage consent). */
  readonly storeRawObservations: boolean;
  readonly playerSpinHistory: readonly PlayerSpinHistoryEntry[];
  /** Known per-source trigger latency to subtract (e.g. microphone sound travel), s. */
  readonly triggerLatencyS?: Partial<Record<TriggerSource, number>>;
  /** Injected for determinism: the library never reads clocks or random sources itself. */
  readonly nextShotId: () => string;
  readonly nowUtc: () => string;
};

/**
 * Provenance label for values measured by this data stream. Synthetic and manual streams are
 * never labelled as measured, whatever the sensor configuration claims.
 */
export function measuredSourceFor(dataOrigin: DataOrigin, configuration: SensorConfiguration): MeasurementSource {
  if (dataOrigin === "synthetic") return "synthetic";
  if (dataOrigin === "manual") return "manual";
  switch (configuration.kind) {
    case "camera":
      return "measured-camera";
    case "radar":
      return "measured-radar";
    case "hybrid":
      return "measured-hybrid";
    case "synthetic":
      return "synthetic";
    case "manual":
      return "manual";
    case "replay":
      throw new Error(
        "Replay sensor configuration must describe the original device (camera/radar/hybrid), not 'replay'.",
      );
  }
}

/**
 * Whether a shot may update an official (non-casual) score. Only live, valid, simulated
 * shots qualify; synthetic, manual, replayed, provisional and invalid shots never do.
 */
export function scoringEligibility(
  dataOrigin: DataOrigin,
  launch: LaunchState,
  result: ShotResult | null,
): ScoringEligibility {
  const no = (reason: string): ScoringEligibility => ({ eligible: false, reason, overriddenByUser: false });
  if (dataOrigin === "synthetic") return no("Synthetic data never counts toward a score.");
  if (dataOrigin === "manual") return no("Manual developer entry never counts toward a score.");
  if (dataOrigin === "replay") return no("Replayed shots never count toward a live score.");
  if (launch.validity === "invalid") return no("Invalid shot; see rejection reasons.");
  if (launch.validity === "provisional") return no("Provisional shot; allowed only as a casual-mode override.");
  if (!result) return no("Shot could not be simulated.");
  return { eligible: true, reason: "Valid live shot.", overriddenByUser: false };
}

/** The velocity measurement exactly as buildLaunchState will record it for this fit. */
function velocityMeasurement(fit: LaunchFitSuccess, source: MeasurementSource): Measurement<Vec3> {
  return launchMeasurementsFromFit(fit, source).velocityMps;
}

/**
 * Launch reference time: the moment the fitted trajectory passes closest to the verified
 * address position (the ball leaving the tee), clamped to not exceed the first observation.
 * Falls back to the fit's own reference time without an address observation.
 */
function launchReferenceTime(fit: LaunchFitSuccess, address: Vec3 | null, firstObservationS: number): number {
  if (!address) return fit.referenceTimeS;
  const speedSq = normSq(fit.velocityMps);
  if (!(speedSq > 1e-6)) return fit.referenceTimeS;
  const dt = dot(sub(address, fit.positionM), fit.velocityMps) / speedSq;
  return Math.min(fit.referenceTimeS + dt, firstObservationS);
}

export type ProcessShotOutput = {
  readonly record: ShotRecord;
  readonly fitAttempts: readonly (LaunchFitSuccess | LaunchFitFailure)[];
};

/**
 * Turns one shot's observations into a fully provenanced ShotRecord:
 * trigger fusion -> gravity-only seed fit -> spin resolution -> drag/lift-aware refit at the
 * launch reference time -> confidence/validity -> simulation (if valid) -> scoring eligibility.
 */
export function processShot(group: ShotObservationGroup, config: PipelineConfig): ProcessShotOutput {
  const g = config.environment.gravityMps2;
  const measuredSource = measuredSourceFor(config.dataOrigin, config.sensorConfiguration);
  const ballObservations = group.observations.filter(
    (o): o is BallPosition3dObservation => o.kind === "ball-position-3d",
  );
  const spinObservations = group.observations.filter((o): o is SpinObservation => o.kind === "spin");
  const trigger = fuseTriggers(group.triggers, config.triggerLatencyS);
  const extraWarnings: string[] = [...(trigger?.warnings ?? [])];
  if (group.lateTriggers.length > 0 && trigger) {
    const delaysMs = group.lateTriggers.map((t) => ((t.timestampS - trigger.timeS) * 1000).toFixed(0));
    extraWarnings.push(
      `Ignored ${group.lateTriggers.length} later trigger event(s) ${delaysMs.join(", ")} ms after impact (e.g. screen or net impact); impact time uses the first trigger cluster only.`,
    );
  }
  const firstObservationS = ballObservations.reduce((m, o) => Math.min(m, o.timestampS), Number.POSITIVE_INFINITY);

  const seedRef = trigger && Number.isFinite(firstObservationS) ? Math.min(trigger.timeS, firstObservationS) : null;
  const seed = fitLaunchState(ballObservations, {
    trajectoryModel: gravityOnlyTrajectoryModel(g),
    referenceTimeS: seedRef,
  });
  const fitAttempts: (LaunchFitSuccess | LaunchFitFailure)[] = [seed];

  let finalFit: LaunchFitSuccess | LaunchFitFailure = seed;
  let spin: SpinResolution | null = null;
  const spinInput = (velocity: Measurement<Vec3>) => ({
    spinObservations,
    velocity,
    clubCategory: config.clubCategory,
    playerSpinHistory: config.playerSpinHistory,
    allowGenericFallback: config.allowGenericSpinFallback,
    measuredSource,
  });

  if (seed.ok) {
    const seedSpin = resolveSpin(spinInput(velocityMeasurement(seed, measuredSource)));
    const omega = seedSpin.angularVelocity.value ?? { x: 0, y: 0, z: 0 };
    if (seedSpin.angularVelocity.value === null) {
      extraWarnings.push("Launch fit assumed no Magnus lift because spin is unavailable.");
    }
    const referenceTimeS = launchReferenceTime(seed, group.address?.positionM ?? null, firstObservationS);
    const refined = fitLaunchState(ballObservations, {
      trajectoryModel: createAeroTrajectoryModel(config.environment, config.ballProfile, omega),
      referenceTimeS,
    });
    fitAttempts.push(refined);
    if (refined.ok) {
      finalFit = refined;
      // Re-resolve so the spin-axis frame uses the final launch velocity.
      spin = resolveSpin(spinInput(velocityMeasurement(refined, measuredSource)));
    } else {
      finalFit = seed;
      spin = seedSpin;
      extraWarnings.push(`Drag-aware refit failed (${refined.reason}); using the gravity-only fit.`);
    }
  }

  const calibrationStatus = config.calibration?.status ?? "none";
  const factors: ConfidenceFactor[] = [
    calibrationFactor(calibrationStatus, config.dataOrigin),
    triggerFactor(trigger ? trigger.confidence : null),
    ballZoneFactor(group.address),
    sensorHealthFactor(group.health),
  ];

  const shotId = config.nextShotId();
  const timestampUtc = config.nowUtc();
  const launch = buildLaunchState({
    shotId,
    sessionId: config.sessionId,
    playerId: config.playerId,
    timestampUtc,
    handedness: config.handedness,
    clubId: config.clubId,
    ballId: config.ballProfile.id,
    dataOrigin: config.dataOrigin,
    calibrationVersion: config.calibration?.version ?? "uncalibrated",
    sensorConfigurationVersion: config.sensorConfiguration.version,
    ballProfileVersion: `${config.ballProfile.id}@${config.ballProfile.version}`,
    physicsModelVersion: physicsVersionTag(),
    fit: finalFit,
    measuredSource,
    spin,
    extraFactors: factors,
    extraWarnings,
  });

  const simulation = simulateShot(launch, {
    environment: config.environment,
    ballProfile: config.ballProfile,
    terrain: config.terrain,
    settings: config.simulationSettings,
  });
  const result = simulation.ok ? simulation.result : null;

  const record: ShotRecord = {
    schemaVersion: SCHEMA_VERSION,
    shotId,
    sessionId: config.sessionId,
    createdUtc: timestampUtc,
    dataOrigin: config.dataOrigin,
    softwareVersion: SOFTWARE_VERSION,
    sensorConfiguration: config.sensorConfiguration,
    rawObservations: config.storeRawObservations ? group.observations : null,
    rawCapturePaths: [],
    launch,
    result,
    simulationSkippedReason: simulation.ok ? null : simulation.reason,
    scoring: scoringEligibility(config.dataOrigin, launch, result),
  };
  ShotRecordSchema.parse(record);
  return { record: deepFreeze(record) as ShotRecord, fitAttempts };
}

/** Physics version recorded on the launch state: air model + ground model + shot simulator. */
export function physicsVersionTag(): string {
  return `${PHYSICS_MODEL_VERSION}+${GROUND_MODEL_VERSION}+${SHOT_SIMULATOR_VERSION}`;
}
