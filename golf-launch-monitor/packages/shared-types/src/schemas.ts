/**
 * Runtime schemas (zod) mirroring the TypeScript contracts. Used to validate data that
 * crosses a trust boundary: replay files, persisted shot records, imports, and exports.
 *
 * test/type-parity.test.ts proves at compile time that every schema's inferred type is
 * mutually assignable with its hand-written contract, so the two cannot drift silently.
 * scripts/generate-schemas.ts emits JSON Schema files from these definitions.
 */
import { z } from "zod";
import { CLUB_CATEGORIES } from "./equipment";
import { MEASUREMENT_SOURCES } from "./measurement";
import { SURFACE_TYPES } from "./terrain";

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export const Vec3Schema = z.strictObject({ x: z.number(), y: z.number(), z: z.number() });
export const MatrixSchema = z.array(z.array(z.number()));
export const IsoUtcTimestampSchema = z.iso.datetime();
export const NumericRangeSchema = z
  .strictObject({ min: z.number(), max: z.number() })
  .refine((r) => r.min <= r.max, { message: "min must be <= max" });
const UnitInterval = z.number().min(0).max(1);
const NonNegative = z.number().min(0);
const Positive = z.number().gt(0);

// ---------------------------------------------------------------------------
// Measurement provenance
// ---------------------------------------------------------------------------

export const MeasurementSourceSchema = z.enum(MEASUREMENT_SOURCES);

export const UncertaintySchema = z.strictObject({
  sigma: NonNegative.optional(),
  lower: z.number().optional(),
  upper: z.number().optional(),
  covariance: MatrixSchema.optional(),
  unit: z.string(),
});

/**
 * Schema for Measurement<T>. Enforces the provenance invariants:
 * value === null <=> source === "unavailable", and unavailable => confidence === 0.
 */
export function measurementSchema<T extends z.ZodType>(value: T) {
  return z
    .strictObject({
      value: value.nullable(),
      unit: z.string(),
      source: MeasurementSourceSchema,
      confidence: UnitInterval,
      uncertainty: UncertaintySchema.optional(),
      qualityFlags: z.array(z.string()),
    })
    .superRefine((raw, ctx) => {
      // The generic value type is opaque to TypeScript here; read the invariant fields only.
      const m = raw as unknown as { value: unknown; source: string; confidence: number };
      const isNull = m.value === null;
      const isUnavailable = m.source === "unavailable";
      if (isNull && !isUnavailable) {
        ctx.addIssue({
          code: "custom",
          path: ["source"],
          message: "a null value must have source 'unavailable'",
        });
      }
      if (!isNull && isUnavailable) {
        ctx.addIssue({
          code: "custom",
          path: ["value"],
          message: "source 'unavailable' requires a null value",
        });
      }
      if (isUnavailable && m.confidence !== 0) {
        ctx.addIssue({
          code: "custom",
          path: ["confidence"],
          message: "unavailable measurements must have confidence 0",
        });
      }
    });
}

export const CalculationInputSchema = z.strictObject({
  field: z.string(),
  source: MeasurementSourceSchema,
});

export const UncertaintyIntervalSchema = z.strictObject({
  p05: z.number(),
  p50: z.number(),
  p95: z.number(),
  unit: z.string(),
  sampleCount: z.number().int().min(0),
});

export function calculatedValueSchema<T extends z.ZodType>(value: T) {
  return z.strictObject({
    value: value.nullable(),
    unit: z.string(),
    kind: z.literal("calculated"),
    inputs: z.array(CalculationInputSchema),
    dependsOnEstimated: z.boolean(),
    dependsOnSynthetic: z.boolean(),
    confidence: UnitInterval,
    interval: UncertaintyIntervalSchema.optional(),
    qualityFlags: z.array(z.string()),
    modelVersion: z.string(),
  });
}

// ---------------------------------------------------------------------------
// Equipment
// ---------------------------------------------------------------------------

export const HandednessSchema = z.enum(["right", "left"]);
export const ClubCategorySchema = z.enum(CLUB_CATEGORIES);
export const ClubSchema = z.strictObject({
  id: z.string().min(1),
  label: z.string(),
  category: ClubCategorySchema,
  staticLoftDeg: z.number().nullable(),
});
export const PlayerSchema = z.strictObject({
  id: z.string().min(1),
  displayName: z.string(),
  handedness: HandednessSchema,
  createdUtc: IsoUtcTimestampSchema,
});

// ---------------------------------------------------------------------------
// Launch state
// ---------------------------------------------------------------------------

export const ValiditySchema = z.enum(["valid", "provisional", "invalid"]);
export const DataOriginSchema = z.enum(["live", "replay", "synthetic", "manual"]);
export const SpinModeSchema = z.enum(["measured", "estimated", "assumed-generic-fallback", "unavailable"]);

export const ConfidenceFactorSchema = z.strictObject({
  id: z.string(),
  label: z.string(),
  score: UnitInterval,
  weight: NonNegative,
  detail: z.string(),
  blocking: z.boolean(),
});

export const LaunchFitDiagnosticsSchema = z.strictObject({
  model: z.string(),
  observationCount: z.number().int().min(0),
  inlierCount: z.number().int().min(0),
  timeSpanS: NonNegative,
  rmsResidualM: NonNegative,
  maxResidualM: NonNegative,
  iterations: z.number().int().min(0),
  converged: z.boolean(),
  positionCovarianceM2: MatrixSchema,
  velocityCovarianceM2PerS2: MatrixSchema,
});

export const ImpactLocationSchema = z.strictObject({ heelToe: z.number(), lowHigh: z.number() });

const NumberMeasurementSchema = measurementSchema(z.number());
const Vec3MeasurementSchema = measurementSchema(Vec3Schema);

export const LaunchStateSchema = z.strictObject({
  schemaVersion: z.string(),
  shotId: z.string().min(1),
  sessionId: z.string().min(1),
  playerId: z.string().nullable(),
  timestampUtc: IsoUtcTimestampSchema,

  coordinateSystemVersion: z.string(),
  calibrationVersion: z.string(),
  sensorConfigurationVersion: z.string(),
  ballProfileVersion: z.string(),
  physicsModelVersion: z.string(),
  estimatorVersion: z.string(),

  dataOrigin: DataOriginSchema,
  handedness: HandednessSchema,
  clubId: z.string().nullable(),
  ballId: z.string().nullable(),
  launchTimeS: z.number().nullable(),

  ballPositionM: Vec3MeasurementSchema,
  velocityMps: Vec3MeasurementSchema,
  angularVelocityRadPerSec: Vec3MeasurementSchema,
  spinMode: SpinModeSchema,

  ballSpeedMps: NumberMeasurementSchema,
  verticalLaunchAngleDeg: NumberMeasurementSchema,
  horizontalLaunchAngleDeg: NumberMeasurementSchema,
  totalSpinRpm: NumberMeasurementSchema,
  spinAxisTiltDeg: NumberMeasurementSchema,

  clubSpeedMps: NumberMeasurementSchema,
  smashFactor: NumberMeasurementSchema,
  attackAngleDeg: NumberMeasurementSchema,
  clubPathDeg: NumberMeasurementSchema,
  faceToTargetDeg: NumberMeasurementSchema,
  faceToPathDeg: NumberMeasurementSchema,
  dynamicLoftDeg: NumberMeasurementSchema,
  dynamicLieDeg: NumberMeasurementSchema,
  impactLocationMm: measurementSchema(ImpactLocationSchema),
  closureRateDegPerSec: NumberMeasurementSchema,
  lowPointM: NumberMeasurementSchema,

  fitDiagnostics: LaunchFitDiagnosticsSchema.nullable(),
  confidenceFactors: z.array(ConfidenceFactorSchema),
  overallConfidence: UnitInterval,
  validity: ValiditySchema,
  warnings: z.array(z.string()),
  rejectionReasons: z.array(z.string()),
});

// ---------------------------------------------------------------------------
// Physics profiles and terrain
// ---------------------------------------------------------------------------

export const EnvironmentFieldSourceSchema = z.enum(["sensor", "user", "default", "derived"]);

export const EnvironmentProfileSchema = z.strictObject({
  version: z.string(),
  temperatureC: z.number().min(-60).max(70),
  pressurePa: z.number().min(30000).max(115000),
  relativeHumidity: UnitInterval,
  altitudeM: z.number().min(-500).max(9000),
  airDensityKgM3: Positive,
  airDynamicViscosityPaS: Positive,
  windMps: Vec3Schema,
  gravityMps2: Positive,
  indoorMode: z.boolean(),
  fieldSources: z.strictObject({
    temperatureC: EnvironmentFieldSourceSchema,
    pressurePa: EnvironmentFieldSourceSchema,
    relativeHumidity: EnvironmentFieldSourceSchema,
    altitudeM: EnvironmentFieldSourceSchema,
    windMps: EnvironmentFieldSourceSchema,
  }),
});

export const BallProfileSourceSchema = z.enum(["default", "reference-data-fit", "lab-fit", "user-calibrated"]);

const ParamsSchema = z.record(z.string(), z.number());

export const BallAerodynamicsProfileSchema = z.strictObject({
  id: z.string().min(1),
  name: z.string(),
  version: z.string(),
  massKg: Positive,
  diameterM: Positive,
  crossSectionAreaM2: Positive,
  momentOfInertiaKgM2: Positive,
  dragModelId: z.string(),
  dragModelParams: ParamsSchema,
  liftModelId: z.string(),
  liftModelParams: ParamsSchema,
  spinDecayModelId: z.string(),
  spinDecayModelParams: ParamsSchema,
  applicableSpeedRangeMps: NumericRangeSchema,
  applicableSpinRangeRpm: NumericRangeSchema,
  source: BallProfileSourceSchema,
  confidenceCeiling: UnitInterval,
  limitations: z.array(z.string()),
  warnings: z.array(z.string()),
});

export const SurfaceTypeSchema = z.enum(SURFACE_TYPES);

export const SurfacePropertiesSchema = z.strictObject({
  type: SurfaceTypeSchema,
  version: z.string(),
  firmness: UnitInterval,
  restitutionBase: UnitInterval,
  restitutionSpeedSlope: NonNegative,
  restitutionMin: UnitInterval,
  slidingFriction: NonNegative,
  rollingResistance: NonNegative,
  moistureSoftness: UnitInterval,
  stimpFt: Positive.nullable(),
  terminal: z.boolean(),
  provisional: z.boolean(),
});

// ---------------------------------------------------------------------------
// Shot result
// ---------------------------------------------------------------------------

export const TrajectoryPhaseSchema = z.enum(["air", "bounce-air", "roll"]);

export const TrajectorySampleSchema = z.strictObject({
  tS: z.number(),
  positionM: Vec3Schema,
  velocityMps: Vec3Schema,
  angularVelocityRadPerSec: Vec3Schema,
  phase: TrajectoryPhaseSchema,
});

export const SimulationSettingsSchema = z.strictObject({
  timestepS: Positive,
  maxFlightTimeS: Positive,
  maxGroundTimeS: Positive,
  outputSampleIntervalS: Positive,
  monteCarloSamples: z.number().int().min(0),
  monteCarloSeed: z.number().int(),
});

export const AirFlightResultSchema = z.strictObject({
  modelVersion: z.string(),
  integrator: z.strictObject({ method: z.literal("rk4"), timestepS: Positive }),
  dragModelId: z.string(),
  liftModelId: z.string(),
  spinDecayModelId: z.string(),
  samples: z.array(TrajectorySampleSchema),
  termination: z.enum(["ground-contact", "max-time", "numerical-failure"]),
  flightTimeS: NonNegative,
  apex: z.strictObject({
    timeS: NonNegative,
    positionM: Vec3Schema,
    heightAboveLaunchM: z.number(),
  }),
  applicabilityWarnings: z.array(z.string()),
});

export const LandingResultSchema = z.strictObject({
  timeS: NonNegative,
  positionM: Vec3Schema,
  velocityMps: Vec3Schema,
  angularVelocityRadPerSec: Vec3Schema,
  surface: SurfaceTypeSchema,
  surfaceNormal: Vec3Schema,
});

export const BounceEventSchema = z.strictObject({
  index: z.number().int().min(0),
  timeS: NonNegative,
  positionM: Vec3Schema,
  incomingVelocityMps: Vec3Schema,
  outgoingVelocityMps: Vec3Schema,
  incomingAngularVelocityRadPerSec: Vec3Schema,
  outgoingAngularVelocityRadPerSec: Vec3Schema,
  surface: SurfaceTypeSchema,
  regime: z.enum(["sliding", "rolling-at-separation"]),
});

export const GroundMotionResultSchema = z.strictObject({
  modelVersion: z.string(),
  bounces: z.array(BounceEventSchema),
  samples: z.array(TrajectorySampleSchema),
  rollStartPositionM: Vec3Schema.nullable(),
  restPositionM: Vec3Schema,
  restTimeS: NonNegative,
  termination: z.enum(["rest", "terminal-surface", "max-time"]),
  finalSurface: SurfaceTypeSchema,
});

export const LieTypeSchema = z.enum([
  "range",
  "tee",
  "fairway",
  "first-cut",
  "rough",
  "bunker",
  "green",
  "fringe",
  "cart-path",
  "water",
  "out-of-bounds",
  "penalty-area",
  "trees",
  "unknown",
]);

export const PenaltySchema = z.strictObject({
  kind: z.enum(["water", "out-of-bounds", "penalty-area", "unplayable"]),
  strokes: z.number().int().min(0),
  reason: z.string(),
});

export const ScoringEventSchema = z.strictObject({
  kind: z.enum(["holed", "on-green", "penalty"]),
  detail: z.string(),
});

const CalculatedNumberSchema = calculatedValueSchema(z.number());

export const ShotMetricsSchema = z.strictObject({
  carryM: CalculatedNumberSchema,
  carryLateralM: CalculatedNumberSchema,
  totalM: CalculatedNumberSchema,
  totalLateralM: CalculatedNumberSchema,
  bounceDistanceM: CalculatedNumberSchema,
  rollDistanceM: CalculatedNumberSchema,
  apexHeightM: CalculatedNumberSchema,
  apexDistanceM: CalculatedNumberSchema,
  flightTimeS: CalculatedNumberSchema,
  descentAngleRad: CalculatedNumberSchema,
  landingSpeedMps: CalculatedNumberSchema,
  landingDirectionRad: CalculatedNumberSchema,
  curveM: CalculatedNumberSchema,
  spinAtLandingRadPerSec: CalculatedNumberSchema,
});

export const PhysicsProvenanceSchema = z.strictObject({
  physicsModelVersion: z.string(),
  groundModelVersion: z.string(),
  ballProfileId: z.string(),
  ballProfileVersion: z.string(),
  environment: EnvironmentProfileSchema,
  terrainId: z.string(),
  terrainVersion: z.string(),
  settings: SimulationSettingsSchema,
});

export const ShotResultSchema = z.strictObject({
  launch: LaunchStateSchema,
  airFlight: AirFlightResultSchema,
  landing: LandingResultSchema,
  groundMotion: GroundMotionResultSchema,
  finalPositionM: Vec3Schema,
  finalLie: LieTypeSchema,
  penalties: z.array(PenaltySchema),
  scoringEvent: ScoringEventSchema.nullable(),
  simulationConfidence: UnitInterval,
  metrics: ShotMetricsSchema,
  physics: PhysicsProvenanceSchema,
  warnings: z.array(z.string()),
});

// ---------------------------------------------------------------------------
// Calibration
// ---------------------------------------------------------------------------

export const ImageSizeSchema = z.strictObject({
  widthPx: z.number().int().gt(0),
  heightPx: z.number().int().gt(0),
});

export const BrownConradyDistortionSchema = z.strictObject({
  model: z.literal("brown-conrady"),
  k1: z.number(),
  k2: z.number(),
  p1: z.number(),
  p2: z.number(),
  k3: z.number(),
});

export const CameraIntrinsicsSchema = z.strictObject({
  cameraId: z.string().min(1),
  imageSize: ImageSizeSchema,
  fxPx: Positive,
  fyPx: Positive,
  cxPx: z.number(),
  cyPx: z.number(),
  skew: z.number(),
  distortion: BrownConradyDistortionSchema,
  deviceConfigurationHash: z.string(),
});

export const CameraExtrinsicsSchema = z.strictObject({
  cameraId: z.string().min(1),
  rotationWorldToCamera: MatrixSchema,
  translationM: Vec3Schema,
});

export const PlaneSchema = z.strictObject({ normal: Vec3Schema, offsetM: z.number() });

export const WorldFrameCalibrationSchema = z.strictObject({
  addressPointM: Vec3Schema,
  targetLineUnit: Vec3Schema,
  groundPlane: PlaneSchema,
  screenPlane: PlaneSchema.nullable(),
  teeHeightM: NonNegative,
  method: z.enum(["alignment-stick", "laser", "target-marker", "board-on-ground", "manual"]),
});

export const CalibrationStatusSchema = z.enum(["green", "yellow", "red", "none"]);

export const PerCameraQualitySchema = z.strictObject({
  cameraId: z.string(),
  rmsReprojectionErrorPx: NonNegative,
  boardCoverageScore: UnitInterval,
  imageCount: z.number().int().min(0),
});

export const CalibrationQualityReportSchema = z.strictObject({
  rmsReprojectionErrorPx: NonNegative,
  perCamera: z.array(PerCameraQualitySchema),
  stereoEpipolarErrorPx: NonNegative.nullable(),
  knownLengthRelativeError: z.number().nullable(),
  targetLineErrorRad: z.number().nullable(),
  evaluatedUtc: IsoUtcTimestampSchema,
});

export const CalibrationPatternSpecSchema = z.strictObject({
  type: z.enum(["charuco", "checkerboard"]),
  squaresX: z.number().int().gt(1),
  squaresY: z.number().int().gt(1),
  squareSizeM: Positive,
  markerSizeM: Positive.nullable(),
  dictionary: z.string().nullable(),
});

export const CalibrationRecordSchema = z.strictObject({
  version: z.string().min(1),
  createdUtc: IsoUtcTimestampSchema,
  sensorConfigurationVersion: z.string(),
  coordinateSystemVersion: z.string(),
  pattern: CalibrationPatternSpecSchema,
  intrinsics: z.array(CameraIntrinsicsSchema),
  extrinsics: z.array(CameraExtrinsicsSchema),
  worldFrame: WorldFrameCalibrationSchema.nullable(),
  quality: CalibrationQualityReportSchema,
  status: CalibrationStatusSchema,
  statusReasons: z.array(z.string()),
  artifactPaths: z.array(z.string()),
});

// ---------------------------------------------------------------------------
// Sensors and observations
// ---------------------------------------------------------------------------

export const SensorKindSchema = z.enum(["camera", "radar", "hybrid", "replay", "synthetic", "manual"]);
export const TriggerSourceSchema = z.enum([
  "microphone",
  "beam-break",
  "ball-motion",
  "club-proximity",
  "synthetic",
  "manual",
]);

export const HealthMetricSchema = z.strictObject({
  id: z.string(),
  label: z.string(),
  value: z.number().nullable(),
  unit: z.string(),
  status: z.enum(["ok", "warn", "fail", "unknown"]),
  detail: z.string(),
});

export const SensorHealthSchema = z.strictObject({
  sensorId: z.string(),
  status: z.enum(["ok", "degraded", "failed", "disconnected"]),
  checkedUtc: IsoUtcTimestampSchema,
  metrics: z.array(HealthMetricSchema),
  messages: z.array(z.string()),
  calibrationStatus: CalibrationStatusSchema,
});

export const CameraDeviceConfigurationSchema = z.strictObject({
  cameraId: z.string().min(1),
  model: z.string(),
  resolution: ImageSizeSchema,
  frameRateHz: Positive,
  exposureUs: Positive,
  shutter: z.enum(["global", "rolling", "unknown"]),
  syncMode: z.enum(["hardware", "software", "none"]),
  fixedFocus: z.boolean(),
});

export const FrameBufferConfigurationSchema = z.strictObject({
  preTriggerS: NonNegative,
  postTriggerS: NonNegative,
});

export const SensorConfigurationSchema = z.strictObject({
  sensorId: z.string().min(1),
  version: z.string().min(1),
  kind: SensorKindSchema,
  description: z.string(),
  cameras: z.array(CameraDeviceConfigurationSchema),
  triggerSources: z.array(TriggerSourceSchema),
  frameBuffer: FrameBufferConfigurationSchema,
  storeRawCaptures: z.boolean(),
});

const ObservationBaseShape = {
  sensorId: z.string().min(1),
  sequence: z.number().int().min(0),
  timestampS: z.number(),
};

export const TriggerObservationSchema = z.strictObject({
  ...ObservationBaseShape,
  kind: z.literal("trigger"),
  triggerSource: TriggerSourceSchema,
  confidence: UnitInterval,
});

export const BallAddressObservationSchema = z.strictObject({
  ...ObservationBaseShape,
  kind: z.literal("ball-address"),
  positionM: Vec3Schema,
  stationary: z.boolean(),
  inHittingZone: z.boolean(),
  ballCount: z.number().int().min(0),
  confidence: UnitInterval,
});

export const BallDetection2dObservationSchema = z.strictObject({
  ...ObservationBaseShape,
  kind: z.literal("ball-detection-2d"),
  cameraId: z.string().min(1),
  frameIndex: z.number().int(),
  centerPx: z.strictObject({ u: z.number(), v: z.number() }),
  radiusPx: Positive,
  confidence: UnitInterval,
});

export const BallPosition3dObservationSchema = z.strictObject({
  ...ObservationBaseShape,
  kind: z.literal("ball-position-3d"),
  frameIndex: z.number().int(),
  positionM: Vec3Schema,
  covarianceM2: MatrixSchema,
  reprojectionErrorPx: NonNegative.nullable(),
  detectionConfidence: UnitInterval,
  cameraIds: z.array(z.string()),
});

export const SpinObservationSchema = z.strictObject({
  ...ObservationBaseShape,
  kind: z.literal("spin"),
  method: z.enum(["marked-ball", "dimple-tracking", "radar-doppler", "synthetic"]),
  angularVelocityRadPerSec: Vec3Schema,
  covarianceRad2PerS2: MatrixSchema,
  validObservationCount: z.number().int().min(0),
  fitResidualRad: NonNegative,
  qualityFlags: z.array(z.string()),
});

export const HealthObservationSchema = z.strictObject({
  ...ObservationBaseShape,
  kind: z.literal("health"),
  health: SensorHealthSchema,
});

export const RawSensorObservationSchema = z.discriminatedUnion("kind", [
  TriggerObservationSchema,
  BallAddressObservationSchema,
  BallDetection2dObservationSchema,
  BallPosition3dObservationSchema,
  SpinObservationSchema,
  HealthObservationSchema,
]);

export const ObservationKindSchema = z.enum([
  "trigger",
  "ball-address",
  "ball-detection-2d",
  "ball-position-3d",
  "spin",
  "health",
]);

export const SensorCapabilitiesSchema = z.strictObject({
  kind: SensorKindSchema,
  isHardware: z.boolean(),
  dataOrigin: DataOriginSchema,
  observationKinds: z.array(ObservationKindSchema),
  measuresBallPosition3d: z.boolean(),
  measuresSpin: z.boolean(),
  measuresClubData: z.boolean(),
  providesTrigger: z.boolean(),
  requiresCalibration: z.boolean(),
  nominalFrameRateHz: Positive.nullable(),
});

export const CalibrationInputSchema = z.strictObject({
  kind: z.enum(["intrinsic", "extrinsic", "world-frame", "full"]),
  pattern: CalibrationPatternSpecSchema,
  imagePaths: z.array(z.string()),
  knownLengthM: Positive.nullable(),
});

export const CalibrationResultSchema = z.strictObject({
  record: CalibrationRecordSchema.nullable(),
  status: CalibrationStatusSchema,
  messages: z.array(z.string()),
});

// ---------------------------------------------------------------------------
// Records and replay files
// ---------------------------------------------------------------------------

export const SessionSchema = z.strictObject({
  schemaVersion: z.string(),
  id: z.string().min(1),
  startedUtc: IsoUtcTimestampSchema,
  endedUtc: IsoUtcTimestampSchema.nullable(),
  dataOrigin: DataOriginSchema,
  sensorConfigurationVersion: z.string(),
  calibrationVersion: z.string(),
  playerIds: z.array(z.string()),
  label: z.string(),
});

export const ScoringEligibilitySchema = z.strictObject({
  eligible: z.boolean(),
  reason: z.string(),
  overriddenByUser: z.boolean(),
});

export const ShotRecordSchema = z.strictObject({
  schemaVersion: z.string(),
  shotId: z.string().min(1),
  sessionId: z.string().min(1),
  createdUtc: IsoUtcTimestampSchema,
  dataOrigin: DataOriginSchema,
  softwareVersion: z.string(),
  sensorConfiguration: SensorConfigurationSchema,
  rawObservations: z.array(RawSensorObservationSchema).nullable(),
  rawCapturePaths: z.array(z.string()),
  launch: LaunchStateSchema,
  result: ShotResultSchema.nullable(),
  simulationSkippedReason: z.string().nullable(),
  scoring: ScoringEligibilitySchema,
});

export const SyntheticTruthSchema = z.strictObject({
  label: z.string(),
  positionM: Vec3Schema,
  velocityMps: Vec3Schema,
  angularVelocityRadPerSec: Vec3Schema,
  launchTimeS: z.number(),
  seed: z.number().int(),
  noiseModel: z.record(z.string(), z.number()),
});

export const ReplayHeaderSchema = z.strictObject({
  type: z.literal("header"),
  formatVersion: z.string(),
  coordinateSystemVersion: z.string(),
  dataOrigin: DataOriginSchema,
  createdUtc: IsoUtcTimestampSchema,
  description: z.string(),
  sensorConfiguration: SensorConfigurationSchema,
  calibration: CalibrationRecordSchema.nullable(),
  syntheticTruth: z.array(SyntheticTruthSchema).nullable(),
});

export const ReplayObservationRecordSchema = z.strictObject({
  type: z.literal("observation"),
  observation: RawSensorObservationSchema,
});

export const ReplayRecordSchema = z.discriminatedUnion("type", [
  ReplayHeaderSchema,
  ReplayObservationRecordSchema,
]);

/** Top-level schemas exported as JSON Schema files by scripts/generate-schemas.ts. */
export const EXPORTED_SCHEMAS = {
  "launch-state": LaunchStateSchema,
  "shot-result": ShotResultSchema,
  "shot-record": ShotRecordSchema,
  session: SessionSchema,
  "raw-sensor-observation": RawSensorObservationSchema,
  "replay-header": ReplayHeaderSchema,
  "replay-record": ReplayRecordSchema,
  "calibration-record": CalibrationRecordSchema,
  "sensor-configuration": SensorConfigurationSchema,
  "environment-profile": EnvironmentProfileSchema,
  "ball-aerodynamics-profile": BallAerodynamicsProfileSchema,
  "surface-properties": SurfacePropertiesSchema,
  player: PlayerSchema,
  club: ClubSchema,
} as const;
