import { horizontalDistance, horizontalNorm, norm } from "@glm/core-math";
import { groundDistances } from "@glm/ground-physics";
import {
  type AirFlightResult,
  type BallAerodynamicsProfile,
  type CalculatedValue,
  type CalculationInput,
  type EnvironmentProfile,
  ESTIMATED_SOURCES,
  type GroundMotionResult,
  type LandingResult,
  type LaunchState,
  type ShotMetrics,
  type Vec3,
} from "@glm/shared-types";

/** Plain numeric metrics computed from one trajectory, before provenance is attached. */
export type RawMetrics = {
  readonly carryM: number;
  readonly carryLateralM: number;
  readonly totalM: number;
  readonly totalLateralM: number;
  readonly bounceDistanceM: number;
  readonly rollDistanceM: number;
  readonly apexHeightM: number;
  readonly apexDistanceM: number;
  readonly flightTimeS: number;
  readonly descentAngleRad: number;
  readonly landingSpeedMps: number;
  readonly landingDirectionRad: number;
  readonly curveM: number | null;
  readonly spinAtLandingRadPerSec: number;
};

export const RAW_METRIC_KEYS: readonly (keyof RawMetrics)[] = [
  "carryM",
  "carryLateralM",
  "totalM",
  "totalLateralM",
  "bounceDistanceM",
  "rollDistanceM",
  "apexHeightM",
  "apexDistanceM",
  "flightTimeS",
  "descentAngleRad",
  "landingSpeedMps",
  "landingDirectionRad",
  "curveM",
  "spinAtLandingRadPerSec",
];

/**
 * Signed perpendicular offset (+left) of `point` from the horizontal line through `origin`
 * along the horizontal direction of `direction`. Null if the direction has no horizontal part.
 */
export function signedOffsetFromLine(origin: Vec3, direction: Vec3, point: Vec3): number | null {
  const h = horizontalNorm(direction);
  if (!(h > 1e-9)) return null;
  const ux = direction.x / h;
  const uy = direction.y / h;
  const dx = point.x - origin.x;
  const dy = point.y - origin.y;
  return ux * dy - uy * dx;
}

/**
 * Definitions follow docs/coordinate-system.md §5. Lateral values are measured from the target
 * line (+X through the address point, i.e. world y), curve from the start line.
 */
export function computeRawMetrics(
  launchPositionM: Vec3,
  launchVelocityMps: Vec3,
  airFlight: AirFlightResult,
  landing: LandingResult,
  ground: GroundMotionResult,
): RawMetrics {
  const v = landing.velocityMps;
  const distances = groundDistances(landing.positionM, ground);
  return {
    carryM: horizontalDistance(launchPositionM, landing.positionM),
    carryLateralM: landing.positionM.y,
    totalM: horizontalDistance(launchPositionM, ground.restPositionM),
    totalLateralM: ground.restPositionM.y,
    bounceDistanceM: distances.bounceDistanceM,
    rollDistanceM: distances.rollDistanceM,
    apexHeightM: airFlight.apex.heightAboveLaunchM,
    apexDistanceM: horizontalDistance(launchPositionM, airFlight.apex.positionM),
    flightTimeS: airFlight.flightTimeS,
    descentAngleRad: Math.atan2(-v.z, horizontalNorm(v)),
    landingSpeedMps: norm(v),
    landingDirectionRad: Math.atan2(v.y, v.x),
    curveM: signedOffsetFromLine(launchPositionM, launchVelocityMps, landing.positionM),
    spinAtLandingRadPerSec: norm(landing.angularVelocityRadPerSec),
  };
}

type MetricClass = "flight" | "lateral" | "curve" | "ground";

const METRIC_SPECS: Record<keyof RawMetrics, { unit: string; cls: MetricClass }> = {
  carryM: { unit: "m", cls: "flight" },
  carryLateralM: { unit: "m", cls: "lateral" },
  totalM: { unit: "m", cls: "ground" },
  totalLateralM: { unit: "m", cls: "ground" },
  bounceDistanceM: { unit: "m", cls: "ground" },
  rollDistanceM: { unit: "m", cls: "ground" },
  apexHeightM: { unit: "m", cls: "flight" },
  apexDistanceM: { unit: "m", cls: "flight" },
  flightTimeS: { unit: "s", cls: "flight" },
  descentAngleRad: { unit: "rad", cls: "flight" },
  landingSpeedMps: { unit: "m/s", cls: "flight" },
  landingDirectionRad: { unit: "rad", cls: "lateral" },
  curveM: { unit: "m", cls: "curve" },
  spinAtLandingRadPerSec: { unit: "rad/s", cls: "flight" },
};

/**
 * Confidence multipliers on top of the launch state's overall confidence (which already
 * includes spin quality). Provisional; documented in docs/physics-model.md.
 */
export const METRIC_CONFIDENCE_FACTORS = {
  /** Lateral metrics when the spin axis was not measured and zero tilt was assumed. */
  lateralWithAssumedAxis: 0.6,
  /** Bounce/roll/total use the provisional ground model and default surface parameters. */
  groundModel: 0.75,
  /** Outdoor simulation with any environment field left at its default. */
  defaultedOutdoorEnvironment: 0.9,
} as const;

export type BuildMetricsInput = {
  readonly launch: LaunchState;
  readonly raw: RawMetrics;
  readonly intervals: Partial<Record<keyof RawMetrics, { p05: number; p50: number; p95: number; sampleCount: number }>>;
  readonly monteCarloFlags: readonly string[];
  readonly environment: EnvironmentProfile;
  readonly ballProfile: BallAerodynamicsProfile;
  readonly modelVersion: string;
};

function isEstimatedLike(source: CalculationInput["source"]): boolean {
  return ESTIMATED_SOURCES.has(source) || source === "manual";
}

export function buildShotMetrics(input: BuildMetricsInput): {
  metrics: ShotMetrics;
  simulationConfidence: number;
  warnings: string[];
} {
  const { launch, raw, intervals, environment, ballProfile } = input;
  const inputs: CalculationInput[] = [
    { field: "ballPositionM", source: launch.ballPositionM.source },
    { field: "velocityMps", source: launch.velocityMps.source },
    { field: "angularVelocityRadPerSec", source: launch.angularVelocityRadPerSec.source },
  ];
  const dependsOnEstimated = inputs.some((i) => isEstimatedLike(i.source));
  const dependsOnSynthetic = inputs.some((i) => i.source === "synthetic");
  // The spin axis is "assumed" when spin was estimated (or fallback) without an axis. A measured
  // spin with an undefined axis (e.g. ~zero spin) produces no Magnus side force, so curve is
  // still well defined there.
  const axisAssumed =
    launch.angularVelocityRadPerSec.qualityFlags.includes("spin-axis-assumed-zero") ||
    (launch.spinAxisTiltDeg.value === null && launch.spinMode !== "measured");

  const defaultedFields = Object.entries(environment.fieldSources)
    .filter(([, source]) => source === "default")
    .map(([field]) => field);
  const envFactor =
    !environment.indoorMode && defaultedFields.length > 0 ? METRIC_CONFIDENCE_FACTORS.defaultedOutdoorEnvironment : 1;

  const commonFlags: string[] = [...input.monteCarloFlags];
  if (ballProfile.source === "default") commonFlags.push(`ball-profile-provisional:${ballProfile.id}`);
  if (defaultedFields.length > 0) commonFlags.push(`environment-defaulted:${defaultedFields.join(",")}`);
  if (launch.spinMode !== "measured") commonFlags.push(`spin-${launch.spinMode}`);

  const base = launch.overallConfidence * envFactor;
  const ceiling = ballProfile.confidenceCeiling;
  // Every calculated flight/ground metric depends on spin (Magnus lift, curve, bounce spin), so
  // none can be more trustworthy than the spin that drove it: a club-model estimate or a
  // generic fallback caps carry, curve, descent and roll at that spin's own confidence.
  const spinCap = launch.angularVelocityRadPerSec.confidence;
  const warnings: string[] = [];

  const make = (key: keyof RawMetrics): CalculatedValue<number> => {
    const spec = METRIC_SPECS[key];
    const flags = [...commonFlags];
    let factor = 1;
    let value = raw[key];
    if (spec.cls === "ground") {
      factor *= METRIC_CONFIDENCE_FACTORS.groundModel;
      flags.push("ground-model-provisional");
    }
    if ((spec.cls === "lateral" || spec.cls === "ground") && axisAssumed) {
      factor *= METRIC_CONFIDENCE_FACTORS.lateralWithAssumedAxis;
      flags.push("spin-axis-assumed-zero");
    }
    if (spec.cls === "curve" && axisAssumed) {
      // Curve is driven by spin-axis tilt; with an unmeasured axis it would be a fabricated zero.
      value = null;
      flags.push("spin-axis-unavailable");
    }
    const interval = value === null ? undefined : intervals[key];
    const confidence = value === null ? 0 : Math.min(ceiling, spinCap, base * factor);
    return {
      value,
      unit: spec.unit,
      kind: "calculated",
      inputs,
      dependsOnEstimated,
      dependsOnSynthetic,
      confidence: Math.max(0, Math.min(1, confidence)),
      ...(interval ? { interval: { ...interval, unit: spec.unit } } : {}),
      qualityFlags: flags,
      modelVersion: input.modelVersion,
    };
  };

  if (axisAssumed && launch.spinMode !== "unavailable") {
    warnings.push("Spin axis not measured; curve is unavailable and offline values assume a zero spin axis.");
  }
  warnings.push("Total, bounce and roll use a provisional ground model; total is more model-dependent than carry.");

  const metrics: ShotMetrics = {
    carryM: make("carryM"),
    carryLateralM: make("carryLateralM"),
    totalM: make("totalM"),
    totalLateralM: make("totalLateralM"),
    bounceDistanceM: make("bounceDistanceM"),
    rollDistanceM: make("rollDistanceM"),
    apexHeightM: make("apexHeightM"),
    apexDistanceM: make("apexDistanceM"),
    flightTimeS: make("flightTimeS"),
    descentAngleRad: make("descentAngleRad"),
    landingSpeedMps: make("landingSpeedMps"),
    landingDirectionRad: make("landingDirectionRad"),
    curveM: make("curveM"),
    spinAtLandingRadPerSec: make("spinAtLandingRadPerSec"),
  };
  const simulationConfidence = Math.max(0, Math.min(1, Math.min(ceiling, spinCap, base)));
  return { metrics, simulationConfidence, warnings };
}
