/**
 * Hand-built, schema-valid test records. Built here (not imported from the pipeline
 * packages) so persistence tests do not depend on packages developed in parallel.
 * Values are arbitrary but self-consistent test data, not claims about real golf shots.
 */
import {
  COORDINATE_SYSTEM_VERSION,
  PlayerSchema,
  SCHEMA_VERSION,
  SessionSchema,
  ShotRecordSchema,
  type CalculatedValue,
  type LaunchState,
  type Measurement,
  type MeasurementSource,
  type Player,
  type Session,
  type ShotMetrics,
  type ShotRecord,
  type ShotResult,
} from "@glm/shared-types";

export function measured<T>(value: T, unit: string, source: MeasurementSource = "synthetic", confidence = 0.9): Measurement<T> {
  return { value, unit, source, confidence, qualityFlags: [] };
}

export function unavailable<T>(unit: string): Measurement<T> {
  return { value: null, unit, source: "unavailable", confidence: 0, qualityFlags: ["not-measured"] };
}

export function calculated(
  value: number | null,
  unit: string,
  extra: Partial<CalculatedValue<number>> = {},
): CalculatedValue<number> {
  return {
    value,
    unit,
    kind: "calculated",
    inputs: [{ field: "velocityMps", source: "synthetic" }],
    dependsOnEstimated: false,
    dependsOnSynthetic: true,
    confidence: 0.8,
    qualityFlags: [],
    modelVersion: "test-physics-0",
    ...extra,
  };
}

export function makePlayer(id: string, createdUtc = "2026-10-01T10:00:00.000Z"): Player {
  return PlayerSchema.parse({ id, displayName: `Player ${id}`, handedness: "right", createdUtc }) as Player;
}

export function makeSession(id: string, startedUtc = "2026-10-01T10:00:00.000Z"): Session {
  return SessionSchema.parse({
    schemaVersion: SCHEMA_VERSION,
    id,
    startedUtc,
    endedUtc: null,
    dataOrigin: "synthetic",
    sensorConfigurationVersion: "sensor-cfg-test-1",
    calibrationVersion: "cal-test-1",
    playerIds: [],
    label: `Session ${id}`,
  }) as Session;
}

export type ShotOptions = {
  readonly shotId: string;
  readonly sessionId: string;
  readonly playerId?: string | null;
  readonly createdUtc?: string;
  readonly withResult?: boolean;
  readonly launchOverrides?: Partial<LaunchState>;
  readonly metricOverrides?: Partial<ShotMetrics>;
  readonly resultWarnings?: readonly string[];
  readonly simulationSkippedReason?: string | null;
};

const ZERO = { x: 0, y: 0, z: 0 };

export function makeLaunch(o: ShotOptions): LaunchState {
  return {
    schemaVersion: SCHEMA_VERSION,
    shotId: o.shotId,
    sessionId: o.sessionId,
    playerId: o.playerId === undefined ? null : o.playerId,
    timestampUtc: o.createdUtc ?? "2026-10-01T10:00:00.000Z",
    coordinateSystemVersion: COORDINATE_SYSTEM_VERSION,
    calibrationVersion: "cal-test-1",
    sensorConfigurationVersion: "sensor-cfg-test-1",
    ballProfileVersion: "ball-test-1",
    physicsModelVersion: "test-physics-0",
    estimatorVersion: "estimator-test-1",
    dataOrigin: "synthetic",
    handedness: "right",
    clubId: "club-7i",
    ballId: null,
    launchTimeS: 0,
    ballPositionM: measured(ZERO, "m"),
    velocityMps: measured({ x: 50, y: 1, z: 15 }, "m/s"),
    angularVelocityRadPerSec: measured({ x: 0, y: -600, z: 20 }, "rad/s"),
    spinMode: "measured",
    ballSpeedMps: measured(52.21, "m/s"),
    verticalLaunchAngleDeg: measured(16.7, "deg"),
    horizontalLaunchAngleDeg: measured(-1.5, "deg"),
    totalSpinRpm: measured(5733, "rpm"),
    spinAxisTiltDeg: measured(-2.25, "deg"),
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
    overallConfidence: 0.85,
    validity: "valid",
    warnings: [],
    rejectionReasons: [],
    ...o.launchOverrides,
  };
}

function makeMetrics(overrides: Partial<ShotMetrics> = {}): ShotMetrics {
  return {
    carryM: calculated(150.25, "m", { interval: { p05: 145.5, p50: 150.25, p95: 155, unit: "m", sampleCount: 200 } }),
    carryLateralM: calculated(-3.5, "m"),
    totalM: calculated(160, "m", { interval: { p05: 152, p50: 160, p95: 168, unit: "m", sampleCount: 200 } }),
    totalLateralM: calculated(-4, "m"),
    bounceDistanceM: calculated(6, "m"),
    rollDistanceM: calculated(3.75, "m"),
    apexHeightM: calculated(28.5, "m"),
    apexDistanceM: calculated(85, "m"),
    flightTimeS: calculated(6.25, "s"),
    descentAngleRad: calculated(Math.PI / 4, "rad"),
    landingSpeedMps: calculated(20, "m/s"),
    landingDirectionRad: calculated(-0.03, "rad"),
    curveM: calculated(-1.25, "m"),
    spinAtLandingRadPerSec: calculated(450, "rad/s"),
    ...overrides,
  };
}

function makeResult(launch: LaunchState, o: ShotOptions): ShotResult {
  const rest = { x: 160, y: -4, z: -0.02 };
  return {
    launch,
    airFlight: {
      modelVersion: "test-physics-0",
      integrator: { method: "rk4", timestepS: 0.001 },
      dragModelId: "test-drag",
      liftModelId: "test-lift",
      spinDecayModelId: "test-decay",
      samples: [],
      termination: "ground-contact",
      flightTimeS: 6.25,
      apex: { timeS: 3, positionM: { x: 85, y: -1, z: 28.5 }, heightAboveLaunchM: 28.5 },
      applicabilityWarnings: [],
    },
    landing: {
      timeS: 6.25,
      positionM: { x: 150.25, y: -3.5, z: -0.02 },
      velocityMps: { x: 14, y: -0.4, z: -14 },
      angularVelocityRadPerSec: { x: 0, y: -450, z: 10 },
      surface: "fairway-normal",
      surfaceNormal: { x: 0, y: 0, z: 1 },
    },
    groundMotion: {
      modelVersion: "test-ground-0",
      bounces: [],
      samples: [],
      rollStartPositionM: { x: 156.25, y: -3.8, z: -0.02 },
      restPositionM: rest,
      restTimeS: 9,
      termination: "rest",
      finalSurface: "fairway-normal",
    },
    finalPositionM: rest,
    finalLie: "fairway",
    penalties: [],
    scoringEvent: null,
    simulationConfidence: 0.75,
    metrics: makeMetrics(o.metricOverrides),
    physics: {
      physicsModelVersion: "test-physics-0",
      groundModelVersion: "test-ground-0",
      ballProfileId: "ball-test",
      ballProfileVersion: "ball-test-1",
      environment: {
        version: "env-test-1",
        temperatureC: 20,
        pressurePa: 101325,
        relativeHumidity: 0.5,
        altitudeM: 0,
        airDensityKgM3: 1.2,
        airDynamicViscosityPaS: 1.81e-5,
        windMps: ZERO,
        gravityMps2: 9.80665,
        indoorMode: false,
        fieldSources: {
          temperatureC: "user",
          pressurePa: "user",
          relativeHumidity: "user",
          altitudeM: "user",
          windMps: "user",
        },
      },
      terrainId: "flat-test",
      terrainVersion: "1",
      settings: {
        timestepS: 0.001,
        maxFlightTimeS: 20,
        maxGroundTimeS: 30,
        outputSampleIntervalS: 0.01,
        monteCarloSamples: 200,
        monteCarloSeed: 7,
      },
    },
    warnings: o.resultWarnings ? [...o.resultWarnings] : [],
  };
}

/** A complete, schema-valid ShotRecord (validated before it is returned). */
export function makeShot(o: ShotOptions): ShotRecord {
  const launch = makeLaunch(o);
  const withResult = o.withResult ?? true;
  const record: ShotRecord = {
    schemaVersion: SCHEMA_VERSION,
    shotId: o.shotId,
    sessionId: o.sessionId,
    createdUtc: o.createdUtc ?? "2026-10-01T10:00:00.000Z",
    dataOrigin: "synthetic",
    softwareVersion: "0.1.0-test",
    sensorConfiguration: {
      sensorId: "synthetic-1",
      version: "sensor-cfg-test-1",
      kind: "synthetic",
      description: "test fixture",
      cameras: [],
      triggerSources: ["synthetic"],
      frameBuffer: { preTriggerS: 0.25, postTriggerS: 0.5 },
      storeRawCaptures: false,
    },
    rawObservations: null,
    rawCapturePaths: [],
    launch,
    result: withResult ? makeResult(launch, o) : null,
    simulationSkippedReason: withResult ? null : (o.simulationSkippedReason ?? "launch state invalid"),
    scoring: { eligible: false, reason: "synthetic data", overriddenByUser: false },
  };
  const parsed = ShotRecordSchema.safeParse(record);
  if (!parsed.success) throw new Error(`fixture invalid: ${JSON.stringify(parsed.error.issues[0])}`);
  return record;
}
