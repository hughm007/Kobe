import { addMatrices } from "@glm/core-math";
import { COORDINATE_SYSTEM_VERSION, deepFreeze, LaunchStateSchema, MEASURED_SOURCES, SCHEMA_VERSION } from "@glm/shared-types";
import type {
  ConfidenceFactor,
  DataOrigin,
  Handedness,
  ImpactLocation,
  IsoUtcTimestamp,
  LaunchState,
  Matrix,
  Measurement,
  MeasurementSource,
  SpinMode,
  Vec3,
} from "@glm/shared-types";
import { aggregateConfidence, fitQualityFactor, launchKinematicsFactor, observationCountFactor } from "./confidence";
import { uniqueStrings } from "./constants";
import { deriveBallSpeedMps, deriveHorizontalLaunchAngleDeg, deriveVerticalLaunchAngleDeg } from "./derive";
import type { LaunchFitFailure, LaunchFitSuccess } from "./fit";
import { makeMeasurement, unavailableMeasurement } from "./measurement";
import { SPIN_UNAVAILABLE_WARNING, type SpinResolution, unavailableSpinFactor } from "./spin";
import { ESTIMATOR_VERSION } from "./version";

/** Labels allowed for values this sensor stream measured itself (never estimated/unavailable). */
const ALLOWED_MEASURED_LABELS: ReadonlySet<MeasurementSource> = new Set<MeasurementSource>([
  ...MEASURED_SOURCES,
  "synthetic",
  "manual",
]);

function requireMeasuredLabel(source: MeasurementSource, fn: string): Exclude<MeasurementSource, "unavailable"> {
  if (!ALLOWED_MEASURED_LABELS.has(source)) {
    throw new Error(`${fn}: measuredSource must be a measured-*, "synthetic" or "manual" label, got "${source}"`);
  }
  return source as Exclude<MeasurementSource, "unavailable">;
}

/**
 * What the launch fit itself cannot see about its own position and velocity, applied to each
 * launch value (not only to overallConfidence), so no value looks more certain than the
 * evidence behind it:
 * - confidenceCap: shot-level sensor evidence that affects every tracked position
 *   (calibration, sensor health including sync drift; see launchValueSensorEvidence);
 * - extra covariance: model error outside the fit covariance, e.g. the refit's dependence on
 *   an unmeasured spin, added to the fit covariance blocks;
 * - qualityFlags: why, on position and velocity (the derived scalars inherit them).
 */
export type LaunchValueAdjustment = {
  readonly confidenceCap?: number;
  readonly extraPositionCovarianceM2?: Matrix;
  readonly extraVelocityCovarianceM2PerS2?: Matrix;
  readonly qualityFlags?: readonly string[];
};

function adjustedCovariance(base: Matrix, extra: Matrix | undefined, name: string): Matrix {
  if (extra === undefined) return base;
  if (extra.length !== 3 || extra.some((row) => row.length !== 3 || row.some((v) => !Number.isFinite(v)))) {
    throw new Error(`launchMeasurementsFromFit: ${name} must be a finite 3x3 matrix`);
  }
  return addMatrices(base, extra);
}

/**
 * Position and velocity measurements from a successful fit, labelled with the stream's
 * measured source. Uncertainty: the fit covariance blocks plus any extra covariance from the
 * adjustment. Confidence: the lower of the fit-quality score (judged on that total velocity
 * covariance), the observation-count score and the adjustment's confidenceCap. Use this to feed
 * resolveSpin with the same velocity measurement buildLaunchState will record (pass the same
 * adjustment to both).
 */
export function launchMeasurementsFromFit(
  fit: LaunchFitSuccess,
  measuredSource: MeasurementSource,
  adjustment: LaunchValueAdjustment = {},
): { readonly positionM: Measurement<Vec3>; readonly velocityMps: Measurement<Vec3> } {
  const source = requireMeasuredLabel(measuredSource, "launchMeasurementsFromFit");
  const cap = adjustment.confidenceCap ?? 1;
  if (!(Number.isFinite(cap) && cap >= 0 && cap <= 1)) {
    throw new Error(`launchMeasurementsFromFit: confidenceCap must be in [0, 1], got ${cap}`);
  }
  const positionCovariance = adjustedCovariance(
    fit.diagnostics.positionCovarianceM2,
    adjustment.extraPositionCovarianceM2,
    "extraPositionCovarianceM2",
  );
  const velocityCovariance = adjustedCovariance(
    fit.diagnostics.velocityCovarianceM2PerS2,
    adjustment.extraVelocityCovarianceM2PerS2,
    "extraVelocityCovarianceM2PerS2",
  );
  const quality = fitQualityFactor({ ...fit.diagnostics, velocityCovarianceM2PerS2: velocityCovariance }, fit).score;
  const confidence = Math.min(quality, observationCountFactor(fit.diagnostics.inlierCount).score, cap);
  const qualityFlags = [...fit.qualityFlags, ...(adjustment.qualityFlags ?? [])];
  return {
    positionM: makeMeasurement<Vec3>({
      value: fit.positionM,
      unit: "m",
      source,
      confidence,
      uncertainty: { covariance: positionCovariance, unit: "m" },
      qualityFlags,
    }),
    velocityMps: makeMeasurement<Vec3>({
      value: fit.velocityMps,
      unit: "m/s",
      source,
      confidence,
      uncertainty: { covariance: velocityCovariance, unit: "m/s" },
      qualityFlags,
    }),
  };
}

export type BuildLaunchStateInput = {
  readonly shotId: string;
  readonly sessionId: string;
  readonly playerId: string | null;
  readonly timestampUtc: IsoUtcTimestamp;
  readonly handedness: Handedness;
  readonly clubId: string | null;
  readonly ballId: string | null;
  readonly dataOrigin: DataOrigin;
  readonly calibrationVersion: string;
  readonly sensorConfigurationVersion: string;
  readonly ballProfileVersion: string;
  readonly physicsModelVersion: string;
  readonly fit: LaunchFitSuccess | LaunchFitFailure;
  /** Label for values this stream measured ("measured-camera", "synthetic", ...). */
  readonly measuredSource: MeasurementSource;
  /** Null = spin was not resolved (treated as unavailable). Ignored when the fit failed. */
  readonly spin: SpinResolution | null;
  /**
   * Calibration / trigger / ball-zone / sensor-health / other factors. The builder adds
   * "fit-quality", "observation-count", "launch-kinematics" and "spin-quality" itself; passing
   * those ids throws.
   */
  readonly extraFactors: readonly ConfidenceFactor[];
  readonly extraWarnings?: readonly string[];
  /**
   * Per-value evidence for the fitted position/velocity (see LaunchValueAdjustment). Pass the
   * same object given to launchMeasurementsFromFit for the spin resolution. Default: none.
   */
  readonly launchValueAdjustment?: LaunchValueAdjustment;
};

const BUILT_IN_FACTOR_IDS = new Set(["fit-quality", "observation-count", "launch-kinematics", "spin-quality"]);
const NO_CLUB_SENSOR = ["no-club-sensor"] as const;

/** Phase 1 has no club sensor: every club-delivery field is unavailable. */
function clubDeliveryUnavailable() {
  return {
    clubSpeedMps: unavailableMeasurement<number>("m/s", NO_CLUB_SENSOR),
    smashFactor: unavailableMeasurement<number>("ratio", NO_CLUB_SENSOR),
    attackAngleDeg: unavailableMeasurement<number>("deg", NO_CLUB_SENSOR),
    clubPathDeg: unavailableMeasurement<number>("deg", NO_CLUB_SENSOR),
    faceToTargetDeg: unavailableMeasurement<number>("deg", NO_CLUB_SENSOR),
    faceToPathDeg: unavailableMeasurement<number>("deg", NO_CLUB_SENSOR),
    dynamicLoftDeg: unavailableMeasurement<number>("deg", NO_CLUB_SENSOR),
    dynamicLieDeg: unavailableMeasurement<number>("deg", NO_CLUB_SENSOR),
    impactLocationMm: unavailableMeasurement<ImpactLocation>("mm", NO_CLUB_SENSOR),
    closureRateDegPerSec: unavailableMeasurement<number>("deg/s", NO_CLUB_SENSOR),
    lowPointM: unavailableMeasurement<number>("m", NO_CLUB_SENSOR),
  };
}

/**
 * Assemble the LaunchState for one shot. A failed fit yields an invalid state whose launch
 * values are all unavailable (never fabricated); a successful fit yields measured position and
 * velocity with derived scalars, spin from the resolution, and confidence/validity from
 * aggregateConfidence. The result is schema-validated (throws on violation) and deep-frozen.
 */
export function buildLaunchState(input: BuildLaunchStateInput): LaunchState {
  requireMeasuredLabel(input.measuredSource, "buildLaunchState");
  // Synthetic and manual streams are never labelled as measured (product law).
  if ((input.dataOrigin === "synthetic" || input.dataOrigin === "manual") && input.measuredSource !== input.dataOrigin) {
    throw new Error(
      `buildLaunchState: dataOrigin "${input.dataOrigin}" requires measuredSource "${input.dataOrigin}", got "${input.measuredSource}"`,
    );
  }
  for (const f of input.extraFactors) {
    if (BUILT_IN_FACTOR_IDS.has(f.id)) {
      throw new Error(`buildLaunchState: extraFactors must not contain built-in factor "${f.id}"`);
    }
  }
  const fit = input.fit;
  const factors: ConfidenceFactor[] = [];
  const warnings: string[] = [];

  let positionM: Measurement<Vec3>;
  let velocityMps: Measurement<Vec3>;
  let angularVelocityRadPerSec: Measurement<Vec3>;
  let totalSpinRpm: Measurement<number>;
  let spinAxisTiltDeg: Measurement<number>;
  let spinMode: SpinMode;

  if (fit.ok) {
    ({ positionM, velocityMps } = launchMeasurementsFromFit(fit, input.measuredSource, input.launchValueAdjustment));
    factors.push(
      fitQualityFactor(fit.diagnostics, fit),
      observationCountFactor(fit.diagnostics.inlierCount),
      launchKinematicsFactor(fit.velocityMps),
    );
    warnings.push(...fit.warnings);
    if (input.spin) {
      spinMode = input.spin.spinMode;
      angularVelocityRadPerSec = input.spin.angularVelocity;
      totalSpinRpm = input.spin.totalSpinRpm;
      spinAxisTiltDeg = input.spin.spinAxisTiltDeg;
      factors.push({ ...input.spin.confidenceFactor });
      warnings.push(...input.spin.warnings);
    } else {
      spinMode = "unavailable";
      angularVelocityRadPerSec = unavailableMeasurement<Vec3>("rad/s", ["spin-not-resolved"]);
      totalSpinRpm = unavailableMeasurement<number>("rpm", ["spin-not-resolved"]);
      spinAxisTiltDeg = unavailableMeasurement<number>("deg", ["spin-not-resolved"]);
      factors.push(unavailableSpinFactor());
      warnings.push(SPIN_UNAVAILABLE_WARNING);
    }
  } else {
    // No credible launch: nothing about this shot's kinematics is reported as a number.
    const flags = uniqueStrings(["launch-fit-failed", ...fit.qualityFlags]);
    positionM = unavailableMeasurement<Vec3>("m", flags);
    velocityMps = unavailableMeasurement<Vec3>("m/s", flags);
    angularVelocityRadPerSec = unavailableMeasurement<Vec3>("rad/s", flags);
    totalSpinRpm = unavailableMeasurement<number>("rpm", flags);
    spinAxisTiltDeg = unavailableMeasurement<number>("deg", flags);
    spinMode = "unavailable";
    factors.push({
      id: "fit-quality",
      label: "Launch fit quality",
      score: 0,
      weight: 2,
      detail: fit.reason,
      blocking: true,
    });
    warnings.push(...fit.warnings);
  }
  factors.push(...input.extraFactors.map((f) => ({ ...f })));

  const aggregate = aggregateConfidence(factors, { spinMode, dataOrigin: input.dataOrigin });
  const rejectionReasons = fit.ok ? aggregate.rejectionReasons : uniqueStrings([fit.reason, ...aggregate.rejectionReasons]);
  const validity = fit.ok ? aggregate.validity : "invalid";

  const state: LaunchState = {
    schemaVersion: SCHEMA_VERSION,
    shotId: input.shotId,
    sessionId: input.sessionId,
    playerId: input.playerId,
    timestampUtc: input.timestampUtc,

    coordinateSystemVersion: COORDINATE_SYSTEM_VERSION,
    calibrationVersion: input.calibrationVersion,
    sensorConfigurationVersion: input.sensorConfigurationVersion,
    ballProfileVersion: input.ballProfileVersion,
    physicsModelVersion: input.physicsModelVersion,
    estimatorVersion: ESTIMATOR_VERSION,

    dataOrigin: input.dataOrigin,
    handedness: input.handedness,
    clubId: input.clubId,
    ballId: input.ballId,
    launchTimeS: fit.ok ? fit.referenceTimeS : null,

    ballPositionM: positionM,
    velocityMps,
    angularVelocityRadPerSec,
    spinMode,

    ballSpeedMps: deriveBallSpeedMps(velocityMps),
    verticalLaunchAngleDeg: deriveVerticalLaunchAngleDeg(velocityMps),
    horizontalLaunchAngleDeg: deriveHorizontalLaunchAngleDeg(velocityMps),
    totalSpinRpm,
    spinAxisTiltDeg,

    ...clubDeliveryUnavailable(),

    fitDiagnostics: fit.ok ? structuredClone(fit.diagnostics) : null,
    confidenceFactors: factors,
    overallConfidence: aggregate.overallConfidence,
    validity,
    warnings: uniqueStrings([...warnings, ...aggregate.warnings, ...(input.extraWarnings ?? [])]),
    rejectionReasons,
  };

  if (input.dataOrigin === "synthetic" || input.dataOrigin === "manual") {
    for (const [key, value] of Object.entries(state)) {
      const source = (value as { source?: unknown } | null)?.source;
      if (typeof source === "string" && MEASURED_SOURCES.has(source as MeasurementSource)) {
        throw new Error(`buildLaunchState: ${key} is labelled "${source}" in a ${input.dataOrigin} launch state`);
      }
    }
  }
  LaunchStateSchema.parse(state);
  // Clone first: guarantees a fully frozen tree even if an input was only shallow-frozen, and
  // never freezes objects the caller still owns.
  return deepFreeze(structuredClone(state)) as LaunchState;
}
