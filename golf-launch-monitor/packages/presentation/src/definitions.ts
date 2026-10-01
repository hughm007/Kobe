/**
 * Metric definitions shown in tooltips and used to pick a formatter.
 *
 * Launch definitions follow docs/coordinate-system.md §3–4; flight-metric definitions repeat the
 * §5 table verbatim (a test parses the doc and checks this). Club-delivery conventions are
 * Phase 4 and marked provisional where the contract does not yet document a sign.
 */
import { deepFreeze } from "@glm/shared-types";

export type MetricId =
  | "ballSpeed"
  | "verticalLaunch"
  | "horizontalLaunch"
  | "totalSpin"
  | "spinAxis"
  | "backspin"
  | "sidespin"
  | "carry"
  | "carryLateral"
  | "total"
  | "totalLateral"
  | "bounceDistance"
  | "rollDistance"
  | "apexHeight"
  | "apexDistance"
  | "flightTime"
  | "descentAngle"
  | "landingSpeed"
  | "landingDirection"
  | "curve"
  | "spinAtLanding"
  | "clubSpeed"
  | "smashFactor"
  | "attackAngle"
  | "clubPath"
  | "faceToTarget"
  | "faceToPath"
  | "dynamicLoft"
  | "dynamicLie"
  | "closureRate"
  | "lowPoint";

export const METRIC_IDS: readonly MetricId[] = Object.freeze([
  "ballSpeed",
  "verticalLaunch",
  "horizontalLaunch",
  "totalSpin",
  "spinAxis",
  "backspin",
  "sidespin",
  "carry",
  "carryLateral",
  "total",
  "totalLateral",
  "bounceDistance",
  "rollDistance",
  "apexHeight",
  "apexDistance",
  "flightTime",
  "descentAngle",
  "landingSpeed",
  "landingDirection",
  "curve",
  "spinAtLanding",
  "clubSpeed",
  "smashFactor",
  "attackAngle",
  "clubPath",
  "faceToTarget",
  "faceToPath",
  "dynamicLoft",
  "dynamicLie",
  "closureRate",
  "lowPoint",
]);

export type MetricCategory = "launch" | "calculated" | "club-delivery" | "display-derived";

/**
 * Which formatter renders the metric. The baseline set is extended with "side-spin"
 * (sidespin with an L/R label), "angular-rate" (closure rate in °/s) and "short-length"
 * (low point in in/cm), which no baseline kind can render honestly.
 */
export type FormatKind =
  | "distance"
  | "height"
  | "lateral"
  | "speed"
  | "angle"
  | "horizontal-angle"
  | "spin-axis"
  | "spin"
  | "side-spin"
  | "duration"
  | "ratio"
  | "angular-rate"
  | "short-length";

export type MetricDefinition = {
  readonly id: MetricId;
  readonly label: string;
  readonly shortLabel: string;
  readonly category: MetricCategory;
  readonly definition: string;
  /** SI unit the quantity is computed in internally ("1" = dimensionless). */
  readonly internalUnit: string;
  readonly signConvention: string | null;
  /** LaunchState / environment fields (and models) the value depends on. */
  readonly dependsOn: readonly string[];
  readonly limitations: readonly string[];
  readonly formatKind: FormatKind;
};

const LAUNCH_FIT_LIMITATION =
  "Derived from the fitted launch velocity; accuracy depends on calibration, frame timing and the number of tracked observations.";
const SPIN_LIMITATION =
  "Only as good as the spin source: a measured spin vector, an estimate from a player/club model, or a user-allowed generic fallback. Check the provenance badge.";
const MODEL_LIMITATION =
  "Calculated by the flight model from the launch state; not observed. Depends on the ball aerodynamics profile, air density and wind.";
const SPIN_SENSITIVE_LIMITATION =
  "Sensitive to spin: if spin is estimated or assumed, this value inherits that uncertainty.";
const GROUND_LIMITATION =
  "Depends on the ground model and surface properties (firmness, friction, slope); more model-dependent than carry.";
const CLUB_LIMITATION =
  "Unavailable unless a club sensor measured it for this shot; never inferred from ball data alone.";
const CLUB_SIGN_PROVISIONAL =
  "Phase 4 club-delivery conventions are provisional until documented in docs/coordinate-system.md.";

const FLIGHT_INPUTS = Object.freeze([
  "ballPositionM",
  "velocityMps",
  "angularVelocityRadPerSec",
  "environment.airDensityKgM3",
  "environment.windMps",
  "environment.gravityMps2",
  "ballAerodynamicsProfile",
]);
const GROUND_INPUTS = Object.freeze([...FLIGHT_INPUTS, "terrain", "surfaceProperties"]);

function def(d: MetricDefinition): MetricDefinition {
  return Object.freeze({ ...d, dependsOn: Object.freeze([...d.dependsOn]), limitations: Object.freeze([...d.limitations]) });
}

export const METRIC_DEFINITIONS: Readonly<Record<MetricId, MetricDefinition>> = Object.freeze({
  // --- Launch (§3, §4) -------------------------------------------------------------------
  ballSpeed: def({
    id: "ballSpeed",
    label: "Ball Speed",
    shortLabel: "Ball Spd",
    category: "launch",
    definition: "Magnitude |v| of the ball's launch velocity at the launch reference time.",
    internalUnit: "m/s",
    signConvention: null,
    dependsOn: ["velocityMps"],
    limitations: [LAUNCH_FIT_LIMITATION],
    formatKind: "speed",
  }),
  verticalLaunch: def({
    id: "verticalLaunch",
    label: "Launch Angle",
    shortLabel: "Launch",
    category: "launch",
    definition: "Vertical launch angle of the launch velocity: atan2(vz, √(vx²+vy²)).",
    internalUnit: "rad",
    signConvention: "positive = upward",
    dependsOn: ["velocityMps"],
    limitations: [LAUNCH_FIT_LIMITATION],
    formatKind: "angle",
  }),
  horizontalLaunch: def({
    id: "horizontalLaunch",
    label: "Launch Direction",
    shortLabel: "Direction",
    category: "launch",
    definition: "Horizontal launch angle of the launch velocity relative to the target line: atan2(vy, vx).",
    internalUnit: "rad",
    signConvention: "stored positive = left of the target line; shown as a magnitude with L / R",
    dependsOn: ["velocityMps"],
    limitations: [
      LAUNCH_FIT_LIMITATION,
      "Relative to the calibrated target line; a misaligned calibration shifts every direction.",
    ],
    formatKind: "horizontal-angle",
  }),
  totalSpin: def({
    id: "totalSpin",
    label: "Total Spin",
    shortLabel: "Spin",
    category: "launch",
    definition: "Magnitude of the 3D spin (angular-velocity) vector: |ω| · 60 / (2π) rpm.",
    internalUnit: "rad/s",
    signConvention: null,
    dependsOn: ["angularVelocityRadPerSec"],
    limitations: [SPIN_LIMITATION],
    formatKind: "spin",
  }),
  spinAxis: def({
    id: "spinAxis",
    label: "Spin Axis",
    shortLabel: "Axis",
    category: "launch",
    definition:
      "Tilt of the spin axis about the flight direction, measured from pure backspin: atan2(−ω·û, ω·r̂).",
    internalUnit: "rad",
    signConvention: "positive = axis tilted so the ball curves right; shown as a magnitude with L / R",
    dependsOn: ["angularVelocityRadPerSec", "velocityMps"],
    limitations: [SPIN_LIMITATION, "Undefined when ball speed is ~0 or the launch is vertical."],
    formatKind: "spin-axis",
  }),

  // --- Display-derived (§4.3: golfer familiarity only, never stored) --------------------
  backspin: def({
    id: "backspin",
    label: "Backspin",
    shortLabel: "Back",
    category: "display-derived",
    definition: "Component of total spin about the horizontal axis to the right of the flight direction: totalSpin · cos(spinAxis).",
    internalUnit: "rad/s",
    signConvention: "positive = backspin (top of the ball moving back toward the golfer)",
    dependsOn: ["totalSpinRpm", "spinAxisTiltDeg"],
    limitations: [
      "Derived for display only from total spin and spin-axis tilt; never stored or used by physics.",
      "Unavailable whenever total spin or spin-axis tilt is unavailable.",
      SPIN_LIMITATION,
    ],
    formatKind: "spin",
  }),
  sidespin: def({
    id: "sidespin",
    label: "Sidespin",
    shortLabel: "Side",
    category: "display-derived",
    definition: "Component of total spin that tilts the axis away from pure backspin: totalSpin · sin(spinAxis).",
    internalUnit: "rad/s",
    signConvention: "positive = curves right; shown as a magnitude with L / R",
    dependsOn: ["totalSpinRpm", "spinAxisTiltDeg"],
    limitations: [
      "Derived for display only from total spin and spin-axis tilt; never stored or used by physics.",
      "Unavailable whenever total spin or spin-axis tilt is unavailable.",
      SPIN_LIMITATION,
    ],
    formatKind: "side-spin",
  }),

  // --- Calculated flight metrics (§5) -----------------------------------------------------
  carry: def({
    id: "carry",
    label: "Carry",
    shortLabel: "Carry",
    category: "calculated",
    definition: "Horizontal distance from launch to first ground contact.",
    internalUnit: "m",
    signConvention: null,
    dependsOn: FLIGHT_INPUTS,
    limitations: [MODEL_LIMITATION, SPIN_SENSITIVE_LIMITATION, "Landing height depends on the terrain model."],
    formatKind: "distance",
  }),
  carryLateral: def({
    id: "carryLateral",
    label: "Carry Side",
    shortLabel: "Side",
    category: "calculated",
    definition: "Signed perpendicular offset from the target line at first contact.",
    internalUnit: "m",
    signConvention: "stored positive = left of the target line; shown as a magnitude with L / R",
    dependsOn: FLIGHT_INPUTS,
    limitations: [MODEL_LIMITATION, SPIN_SENSITIVE_LIMITATION, "Strongly affected by spin-axis tilt and crosswind."],
    formatKind: "lateral",
  }),
  total: def({
    id: "total",
    label: "Total",
    shortLabel: "Total",
    category: "calculated",
    definition:
      "Horizontal distance from launch to the final resting position. Total is more model-dependent than carry because ground conditions drive bounce and roll.",
    internalUnit: "m",
    signConvention: null,
    dependsOn: GROUND_INPUTS,
    limitations: [MODEL_LIMITATION, SPIN_SENSITIVE_LIMITATION, GROUND_LIMITATION],
    formatKind: "distance",
  }),
  totalLateral: def({
    id: "totalLateral",
    label: "Total Side",
    shortLabel: "Tot Side",
    category: "calculated",
    definition: "Signed perpendicular offset from the target line at rest.",
    internalUnit: "m",
    signConvention: "stored positive = left of the target line; shown as a magnitude with L / R",
    dependsOn: GROUND_INPUTS,
    limitations: [MODEL_LIMITATION, SPIN_SENSITIVE_LIMITATION, GROUND_LIMITATION],
    formatKind: "lateral",
  }),
  bounceDistance: def({
    id: "bounceDistance",
    label: "Bounce",
    shortLabel: "Bounce",
    category: "calculated",
    definition: "Horizontal distance from first contact to the start of continuous rolling.",
    internalUnit: "m",
    signConvention: null,
    dependsOn: GROUND_INPUTS,
    limitations: [GROUND_LIMITATION, SPIN_SENSITIVE_LIMITATION],
    formatKind: "distance",
  }),
  rollDistance: def({
    id: "rollDistance",
    label: "Roll",
    shortLabel: "Roll",
    category: "calculated",
    definition: "Horizontal distance covered while rolling.",
    internalUnit: "m",
    signConvention: null,
    dependsOn: GROUND_INPUTS,
    limitations: [GROUND_LIMITATION, SPIN_SENSITIVE_LIMITATION],
    formatKind: "distance",
  }),
  apexHeight: def({
    id: "apexHeight",
    label: "Height",
    shortLabel: "Apex",
    category: "calculated",
    definition: "Maximum ball-center height minus launch ball-center height.",
    internalUnit: "m",
    signConvention: null,
    dependsOn: FLIGHT_INPUTS,
    limitations: [MODEL_LIMITATION, SPIN_SENSITIVE_LIMITATION],
    formatKind: "height",
  }),
  apexDistance: def({
    id: "apexDistance",
    label: "Apex Distance",
    shortLabel: "Apex Dist",
    category: "calculated",
    definition: "Horizontal distance from launch to the apex.",
    internalUnit: "m",
    signConvention: null,
    dependsOn: FLIGHT_INPUTS,
    limitations: [MODEL_LIMITATION, SPIN_SENSITIVE_LIMITATION],
    formatKind: "distance",
  }),
  flightTime: def({
    id: "flightTime",
    label: "Hang Time",
    shortLabel: "Hang",
    category: "calculated",
    definition: "Time from the launch reference time to first ground contact.",
    internalUnit: "s",
    signConvention: null,
    dependsOn: FLIGHT_INPUTS,
    limitations: [MODEL_LIMITATION, SPIN_SENSITIVE_LIMITATION],
    formatKind: "duration",
  }),
  descentAngle: def({
    id: "descentAngle",
    label: "Land Angle",
    shortLabel: "Land Ang",
    category: "calculated",
    definition: "Angle of the velocity below horizontal at first contact: atan2(−vz, √(vx²+vy²)).",
    internalUnit: "rad",
    signConvention: "positive = descending",
    dependsOn: FLIGHT_INPUTS,
    limitations: [MODEL_LIMITATION, SPIN_SENSITIVE_LIMITATION],
    formatKind: "angle",
  }),
  landingSpeed: def({
    id: "landingSpeed",
    label: "Landing Speed",
    shortLabel: "Land Spd",
    category: "calculated",
    definition: "Magnitude of the ball velocity at first contact.",
    internalUnit: "m/s",
    signConvention: null,
    dependsOn: FLIGHT_INPUTS,
    limitations: [MODEL_LIMITATION, SPIN_SENSITIVE_LIMITATION],
    formatKind: "speed",
  }),
  landingDirection: def({
    id: "landingDirection",
    label: "Landing Direction",
    shortLabel: "Land Dir",
    category: "calculated",
    definition: "atan2(vy, vx) of the velocity at first contact (+left).",
    internalUnit: "rad",
    signConvention: "stored positive = left of the target line; shown as a magnitude with L / R",
    dependsOn: FLIGHT_INPUTS,
    limitations: [MODEL_LIMITATION, SPIN_SENSITIVE_LIMITATION],
    formatKind: "horizontal-angle",
  }),
  curve: def({
    id: "curve",
    label: "Curve",
    shortLabel: "Curve",
    category: "calculated",
    definition:
      "Signed perpendicular offset of the landing point from the start line (the line through the launch point along the horizontal launch direction), +left.",
    internalUnit: "m",
    signConvention: "stored positive = left of the start line; shown as a magnitude with L / R",
    dependsOn: FLIGHT_INPUTS,
    limitations: [MODEL_LIMITATION, SPIN_SENSITIVE_LIMITATION, "Strongly affected by spin-axis tilt and crosswind."],
    formatKind: "lateral",
  }),
  spinAtLanding: def({
    id: "spinAtLanding",
    label: "Landing Spin",
    shortLabel: "Land Spin",
    category: "calculated",
    definition: "Magnitude of the spin (angular-velocity) vector at first contact.",
    internalUnit: "rad/s",
    signConvention: null,
    dependsOn: FLIGHT_INPUTS,
    limitations: [MODEL_LIMITATION, SPIN_SENSITIVE_LIMITATION, "Depends on the spin-decay model of the ball profile."],
    formatKind: "spin",
  }),

  // --- Club delivery (Phase 4) ------------------------------------------------------------
  clubSpeed: def({
    id: "clubSpeed",
    label: "Club Speed",
    shortLabel: "Club Spd",
    category: "club-delivery",
    definition: "Speed of the clubhead immediately before impact.",
    internalUnit: "m/s",
    signConvention: null,
    dependsOn: ["clubSpeedMps"],
    limitations: [CLUB_LIMITATION],
    formatKind: "speed",
  }),
  smashFactor: def({
    id: "smashFactor",
    label: "Smash Factor",
    shortLabel: "Smash",
    category: "club-delivery",
    definition: "Ball speed divided by club speed.",
    internalUnit: "1",
    signConvention: null,
    dependsOn: ["smashFactor", "ballSpeedMps", "clubSpeedMps"],
    limitations: [CLUB_LIMITATION, "Inherits the uncertainty of both ball speed and club speed."],
    formatKind: "ratio",
  }),
  attackAngle: def({
    id: "attackAngle",
    label: "Attack Angle",
    shortLabel: "AoA",
    category: "club-delivery",
    definition: "Vertical direction of the clubhead's motion at impact relative to horizontal.",
    internalUnit: "rad",
    signConvention: "positive = upward (ascending blow)",
    dependsOn: ["attackAngleDeg"],
    limitations: [CLUB_LIMITATION, CLUB_SIGN_PROVISIONAL],
    formatKind: "angle",
  }),
  clubPath: def({
    id: "clubPath",
    label: "Club Path",
    shortLabel: "Path",
    category: "club-delivery",
    definition: "Horizontal direction of the clubhead's motion at impact relative to the target line.",
    internalUnit: "rad",
    signConvention: "world frame, right-hand about +Z: stored positive = left; shown as a magnitude with L / R",
    dependsOn: ["clubPathDeg"],
    limitations: [
      CLUB_LIMITATION,
      "In-to-out / out-to-in labels depend on handedness and are not shown here (Phase 4).",
    ],
    formatKind: "horizontal-angle",
  }),
  faceToTarget: def({
    id: "faceToTarget",
    label: "Face Angle",
    shortLabel: "Face",
    category: "club-delivery",
    definition: "Horizontal direction the clubface points at impact relative to the target line.",
    internalUnit: "rad",
    signConvention: "world frame, right-hand about +Z: stored positive = left; shown as a magnitude with L / R",
    dependsOn: ["faceToTargetDeg"],
    limitations: [CLUB_LIMITATION, "Open / closed labels depend on handedness and are not shown here (Phase 4)."],
    formatKind: "horizontal-angle",
  }),
  faceToPath: def({
    id: "faceToPath",
    label: "Face to Path",
    shortLabel: "F2P",
    category: "club-delivery",
    definition: "Face angle minus club path at impact.",
    internalUnit: "rad",
    signConvention: "stored positive = face points left of the path; shown as a magnitude with L / R",
    dependsOn: ["faceToPathDeg"],
    limitations: [CLUB_LIMITATION, CLUB_SIGN_PROVISIONAL],
    formatKind: "horizontal-angle",
  }),
  dynamicLoft: def({
    id: "dynamicLoft",
    label: "Dynamic Loft",
    shortLabel: "Dyn Loft",
    category: "club-delivery",
    definition: "Loft actually delivered by the clubface at impact (not the static loft of the club).",
    internalUnit: "rad",
    signConvention: "positive = face pointing upward",
    dependsOn: ["dynamicLoftDeg"],
    limitations: [CLUB_LIMITATION, CLUB_SIGN_PROVISIONAL],
    formatKind: "angle",
  }),
  dynamicLie: def({
    id: "dynamicLie",
    label: "Dynamic Lie",
    shortLabel: "Dyn Lie",
    category: "club-delivery",
    definition: "Lie angle of the club at impact.",
    internalUnit: "rad",
    signConvention: "provisional: not yet documented by the data contract",
    dependsOn: ["dynamicLieDeg"],
    limitations: [CLUB_LIMITATION, CLUB_SIGN_PROVISIONAL],
    formatKind: "angle",
  }),
  closureRate: def({
    id: "closureRate",
    label: "Closure Rate",
    shortLabel: "Closure",
    category: "club-delivery",
    definition: "Rate at which the clubface rotates closed just before impact.",
    internalUnit: "rad/s",
    signConvention: "provisional: not yet documented by the data contract",
    dependsOn: ["closureRateDegPerSec"],
    limitations: [CLUB_LIMITATION, CLUB_SIGN_PROVISIONAL],
    formatKind: "angular-rate",
  }),
  lowPoint: def({
    id: "lowPoint",
    label: "Low Point",
    shortLabel: "Low Pt",
    category: "club-delivery",
    definition: "Position of the lowest point of the clubhead's arc relative to the ball.",
    internalUnit: "m",
    signConvention: "provisional: positive = ahead of the ball (toward the target, +X); not yet documented by the data contract",
    dependsOn: ["lowPointM"],
    limitations: [CLUB_LIMITATION, CLUB_SIGN_PROVISIONAL],
    formatKind: "short-length",
  }),
});

/** The LaunchState scalar field behind each launch / club metric, and the unit it is stored in. */
export type LaunchField = {
  readonly field: string;
  /** Unit of the stored value (contract exception: degrees / rpm, §2). */
  readonly unit: "m/s" | "deg" | "rpm" | "deg/s" | "m" | "1";
};

/**
 * Display-derived metrics (backspin, sidespin) have no entry: they are never stored (§4.1) and are
 * derived only by presentLaunchState from totalSpinRpm and spinAxisTiltDeg together, so that their
 * badge combines both inputs' provenance. presentMeasurement therefore rejects them.
 */
export const LAUNCH_FIELD_FOR_METRIC: Readonly<Partial<Record<MetricId, LaunchField>>> = deepFreeze({
  ballSpeed: { field: "ballSpeedMps", unit: "m/s" },
  verticalLaunch: { field: "verticalLaunchAngleDeg", unit: "deg" },
  horizontalLaunch: { field: "horizontalLaunchAngleDeg", unit: "deg" },
  totalSpin: { field: "totalSpinRpm", unit: "rpm" },
  spinAxis: { field: "spinAxisTiltDeg", unit: "deg" },
  clubSpeed: { field: "clubSpeedMps", unit: "m/s" },
  smashFactor: { field: "smashFactor", unit: "1" },
  attackAngle: { field: "attackAngleDeg", unit: "deg" },
  clubPath: { field: "clubPathDeg", unit: "deg" },
  faceToTarget: { field: "faceToTargetDeg", unit: "deg" },
  faceToPath: { field: "faceToPathDeg", unit: "deg" },
  dynamicLoft: { field: "dynamicLoftDeg", unit: "deg" },
  dynamicLie: { field: "dynamicLieDeg", unit: "deg" },
  closureRate: { field: "closureRateDegPerSec", unit: "deg/s" },
  lowPoint: { field: "lowPointM", unit: "m" },
});

/** The ShotMetrics field behind each calculated metric, stored in SI. */
export type ShotMetricsField = {
  readonly field:
    | "carryM"
    | "carryLateralM"
    | "totalM"
    | "totalLateralM"
    | "bounceDistanceM"
    | "rollDistanceM"
    | "apexHeightM"
    | "apexDistanceM"
    | "flightTimeS"
    | "descentAngleRad"
    | "landingSpeedMps"
    | "landingDirectionRad"
    | "curveM"
    | "spinAtLandingRadPerSec";
  readonly unit: "m" | "s" | "rad" | "m/s" | "rad/s";
};

export const SHOT_METRICS_FIELD_FOR_METRIC: Readonly<Partial<Record<MetricId, ShotMetricsField>>> = deepFreeze({
  carry: { field: "carryM", unit: "m" },
  carryLateral: { field: "carryLateralM", unit: "m" },
  total: { field: "totalM", unit: "m" },
  totalLateral: { field: "totalLateralM", unit: "m" },
  bounceDistance: { field: "bounceDistanceM", unit: "m" },
  rollDistance: { field: "rollDistanceM", unit: "m" },
  apexHeight: { field: "apexHeightM", unit: "m" },
  apexDistance: { field: "apexDistanceM", unit: "m" },
  flightTime: { field: "flightTimeS", unit: "s" },
  descentAngle: { field: "descentAngleRad", unit: "rad" },
  landingSpeed: { field: "landingSpeedMps", unit: "m/s" },
  landingDirection: { field: "landingDirectionRad", unit: "rad" },
  curve: { field: "curveM", unit: "m" },
  spinAtLanding: { field: "spinAtLandingRadPerSec", unit: "rad/s" },
});
