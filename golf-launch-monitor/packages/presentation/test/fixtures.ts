/** Test fixtures: contract-valid LaunchState / ShotMetrics built by hand (no other package's factories). */
import {
  type CalculatedValue,
  type CalculationInput,
  COORDINATE_SYSTEM_VERSION,
  deepFreeze,
  type LaunchState,
  type Measurement,
  type MeasurementSource,
  SCHEMA_VERSION,
  type ShotMetrics,
  type Uncertainty,
  type UncertaintyInterval,
  type Vec3,
} from "@glm/shared-types";

export function meas(
  value: number,
  unit: string,
  source: Exclude<MeasurementSource, "unavailable"> = "measured-camera",
  confidence = 0.9,
  extra: { uncertainty?: Uncertainty; qualityFlags?: readonly string[] } = {},
): Measurement<number> {
  return {
    value,
    unit,
    source,
    confidence,
    ...(extra.uncertainty === undefined ? {} : { uncertainty: extra.uncertainty }),
    qualityFlags: extra.qualityFlags ?? [],
  };
}

export function unavailable<T = number>(unit: string, qualityFlags: readonly string[] = []): Measurement<T> {
  return { value: null, unit, source: "unavailable", confidence: 0, qualityFlags };
}

function vecMeas(value: Vec3, unit: string, source: Exclude<MeasurementSource, "unavailable">): Measurement<Vec3> {
  return { value, unit, source, confidence: 0.9, qualityFlags: [] };
}

/** A right-handed, measured-camera shot: 70.1 m/s, 16.2° up, 2.1° right, 6430 rpm, axis 3.4° right. */
export function makeLaunch(overrides: Partial<LaunchState> = {}): LaunchState {
  const base: LaunchState = {
    schemaVersion: SCHEMA_VERSION,
    shotId: "shot-0001",
    sessionId: "session-0001",
    playerId: null,
    timestampUtc: "2026-10-01T18:00:00.000Z",
    coordinateSystemVersion: COORDINATE_SYSTEM_VERSION,
    calibrationVersion: "cal-test-1",
    sensorConfigurationVersion: "sensor-test-1",
    ballProfileVersion: "ball-test-1",
    physicsModelVersion: "physics-test-1",
    estimatorVersion: "estimator-test-1",
    dataOrigin: "live",
    handedness: "right",
    clubId: null,
    ballId: null,
    launchTimeS: 0,
    ballPositionM: vecMeas({ x: 0, y: 0, z: 0 }, "m", "measured-camera"),
    velocityMps: vecMeas({ x: 67.18, y: -2.465, z: 19.56 }, "m/s", "measured-camera"),
    angularVelocityRadPerSec: vecMeas({ x: 0, y: -672, z: -40 }, "rad/s", "measured-camera"),
    spinMode: "measured",
    ballSpeedMps: meas(70.1, "m/s"),
    verticalLaunchAngleDeg: meas(16.2, "deg"),
    horizontalLaunchAngleDeg: meas(-2.1, "deg"),
    totalSpinRpm: meas(6430, "rpm"),
    spinAxisTiltDeg: meas(3.4, "deg"),
    clubSpeedMps: unavailable("m/s"),
    smashFactor: unavailable(""),
    attackAngleDeg: unavailable("deg"),
    clubPathDeg: unavailable("deg"),
    faceToTargetDeg: unavailable("deg"),
    faceToPathDeg: unavailable("deg"),
    dynamicLoftDeg: unavailable("deg"),
    dynamicLieDeg: unavailable("deg"),
    impactLocationMm: unavailable("mm"),
    closureRateDegPerSec: unavailable("deg/s"),
    lowPointM: unavailable("m"),
    fitDiagnostics: null,
    confidenceFactors: [],
    overallConfidence: 0.9,
    validity: "valid",
    warnings: [],
    rejectionReasons: [],
  };
  return deepFreeze({ ...base, ...overrides }) as LaunchState;
}

const MEASURED_FLIGHT_INPUTS: readonly CalculationInput[] = [
  { field: "velocityMps", source: "measured-camera" },
  { field: "angularVelocityRadPerSec", source: "measured-camera" },
];

export function calc(
  value: number | null,
  unit: string,
  opts: {
    inputs?: readonly CalculationInput[];
    dependsOnEstimated?: boolean;
    dependsOnSynthetic?: boolean;
    confidence?: number;
    interval?: UncertaintyInterval;
    qualityFlags?: readonly string[];
  } = {},
): CalculatedValue<number> {
  return {
    value,
    unit,
    kind: "calculated",
    inputs: opts.inputs ?? MEASURED_FLIGHT_INPUTS,
    dependsOnEstimated: opts.dependsOnEstimated ?? false,
    dependsOnSynthetic: opts.dependsOnSynthetic ?? false,
    confidence: opts.confidence ?? (value === null ? 0 : 0.85),
    ...(opts.interval === undefined ? {} : { interval: opts.interval }),
    qualityFlags: opts.qualityFlags ?? [],
    modelVersion: "flight-test-1",
  };
}

export function interval(p05: number, p50: number, p95: number, unit: string): UncertaintyInterval {
  return { p05, p50, p95, unit, sampleCount: 500 };
}

/** Plausible 7-iron metrics, all calculated from measured inputs. */
export function makeShotMetrics(overrides: Partial<ShotMetrics> = {}): ShotMetrics {
  const base: ShotMetrics = {
    carryM: calc(152.705, "m"),
    carryLateralM: calc(-3.2, "m"),
    totalM: calc(160.2, "m"),
    totalLateralM: calc(-3.6, "m"),
    bounceDistanceM: calc(5.1, "m"),
    rollDistanceM: calc(2.4, "m"),
    apexHeightM: calc(29.87, "m"),
    apexDistanceM: calc(88.3, "m"),
    flightTimeS: calc(6.25, "s"),
    descentAngleRad: calc(0.6458, "rad"),
    landingSpeedMps: calc(22.4, "m/s"),
    landingDirectionRad: calc(-0.035, "rad"),
    curveM: calc(-1.6, "m"),
    spinAtLandingRadPerSec: calc(560, "rad/s"),
  };
  return deepFreeze({ ...base, ...overrides }) as ShotMetrics;
}
