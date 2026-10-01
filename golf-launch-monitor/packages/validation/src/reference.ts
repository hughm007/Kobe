/**
 * Comparison against a reference launch monitor.
 *
 * Commercial devices differ from us in units, sign conventions and, most dangerously, in
 * metric definitions (e.g. "carry" to where the ball crosses launch height vs. to first
 * ground contact). normalizeReference converts units and signs explicitly and records each
 * step; a metric whose definition differs from ours with no documented conversion is
 * reported as INCOMPATIBLE and excluded — never silently compared.
 */
import { z } from "zod";
import { convert, dimensionOf, UNIT_IDS, type UnitId } from "@glm/units";

// ---------------------------------------------------------------------------
// Reference measurement record
// ---------------------------------------------------------------------------

const SignConventionSchema = z.enum(["right-positive", "left-positive"]);

export const ReferenceConventionsSchema = z.strictObject({
  /** Horizontal launch angle sign. Ours: left-positive (docs/coordinate-system.md §3). */
  horizontalAngleSign: SignConventionSchema,
  /** "right-positive" = positive tilt means the ball curves right (ours). */
  spinAxisSign: SignConventionSchema,
  /** Lateral offsets (carry lateral). Ours: left-positive. */
  lateralSign: SignConventionSchema,
  /** Where the device ends carry. Ours: first ground contact. */
  carryDefinition: z.enum(["first-ground-contact", "landing-at-launch-height", "unknown"]),
  /** Point whose speed is reported. Ours: ball centre. */
  ballSpeedReference: z.enum(["ball-center", "unknown"]),
});

export const ReferenceMetricValueSchema = z.strictObject({
  value: z.number(),
  unit: z.string().min(1),
  /** The device's definition of the metric, as a definition id (see REFERENCE_METRIC_DEFINITIONS). */
  definition: z.string().min(1),
});

export const ReferenceMeasurementSchema = z.strictObject({
  referenceId: z.string().min(1),
  shotId: z.string().min(1),
  device: z.strictObject({
    make: z.string().min(1),
    model: z.string().min(1),
    firmware: z.string().nullable(),
  }),
  metrics: z.record(z.string(), ReferenceMetricValueSchema),
  conventions: ReferenceConventionsSchema,
  notes: z.string(),
});

export type ReferenceConventions = z.infer<typeof ReferenceConventionsSchema>;
export type ReferenceMeasurement = z.infer<typeof ReferenceMeasurementSchema>;

// ---------------------------------------------------------------------------
// Our metric definitions
// ---------------------------------------------------------------------------

export const COMPARABLE_METRICS = [
  "ballSpeed",
  "verticalLaunch",
  "horizontalLaunch",
  "totalSpin",
  "spinAxis",
  "carry",
  "carryLateral",
  "total",
  "apexHeight",
  "descentAngle",
] as const;

export type ComparableMetric = (typeof COMPARABLE_METRICS)[number];

export type ReferenceMetricDefinition = {
  /** The definition id a reference metric must declare to be compared with ours. */
  readonly definitionId: string;
  readonly description: string;
  /** SI unit of our value; reference values are converted into it. */
  readonly siUnit: UnitId;
  /** Which declared sign convention applies, if the metric is signed. */
  readonly signConvention: "horizontalAngleSign" | "spinAxisSign" | "lateralSign" | null;
  /** Whether the metric is evaluated at landing, so the carry/landing definition matters. */
  readonly evaluatedAtLanding: boolean;
};

export const REFERENCE_METRIC_DEFINITIONS: Readonly<Record<ComparableMetric, ReferenceMetricDefinition>> = Object.freeze({
  ballSpeed: {
    definitionId: "glm:ball-speed",
    description: "|v| of the ball centre at the launch reference time.",
    siUnit: "m/s",
    signConvention: null,
    evaluatedAtLanding: false,
  },
  verticalLaunch: {
    definitionId: "glm:vertical-launch-angle",
    description: "atan2(vz, sqrt(vx^2 + vy^2)) at launch; positive = upward.",
    siUnit: "rad",
    signConvention: null,
    evaluatedAtLanding: false,
  },
  horizontalLaunch: {
    definitionId: "glm:horizontal-launch-angle",
    description: "atan2(vy, vx) at launch relative to the target line; positive = LEFT.",
    siUnit: "rad",
    signConvention: "horizontalAngleSign",
    evaluatedAtLanding: false,
  },
  totalSpin: {
    definitionId: "glm:total-spin",
    description: "|omega|, magnitude of the 3D angular velocity at launch.",
    siUnit: "rad/s",
    signConvention: null,
    evaluatedAtLanding: false,
  },
  spinAxis: {
    definitionId: "glm:spin-axis-tilt",
    description: "Tilt of the spin axis about the launch velocity; positive = ball curves RIGHT.",
    siUnit: "rad",
    signConvention: "spinAxisSign",
    evaluatedAtLanding: false,
  },
  carry: {
    definitionId: "glm:carry",
    description: "Horizontal distance from launch to first ground contact.",
    siUnit: "m",
    signConvention: null,
    evaluatedAtLanding: true,
  },
  carryLateral: {
    definitionId: "glm:carry-lateral",
    description: "Signed offset from the target line at first ground contact; positive = LEFT.",
    siUnit: "m",
    signConvention: "lateralSign",
    evaluatedAtLanding: true,
  },
  total: {
    definitionId: "glm:total",
    description: "Horizontal distance from launch to the final resting position.",
    siUnit: "m",
    signConvention: null,
    evaluatedAtLanding: false,
  },
  apexHeight: {
    definitionId: "glm:apex-height",
    description: "Maximum ball-centre height minus launch ball-centre height.",
    siUnit: "m",
    signConvention: null,
    evaluatedAtLanding: false,
  },
  descentAngle: {
    definitionId: "glm:descent-angle",
    description: "Angle of the velocity below horizontal at first ground contact.",
    siUnit: "rad",
    signConvention: null,
    evaluatedAtLanding: true,
  },
});

/**
 * Membership in the unit table by value. (@glm/units isUnitId uses `in`, which also accepts
 * Object.prototype names such as "constructor" or "toString".)
 */
const KNOWN_UNITS: ReadonlySet<string> = new Set(UNIT_IDS);

function isKnownUnit(unit: string): unit is UnitId {
  return KNOWN_UNITS.has(unit);
}

function isComparableMetric(name: string): name is ComparableMetric {
  return (COMPARABLE_METRICS as readonly string[]).includes(name);
}

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------

export type IncompatibleMetric = { readonly metric: string; readonly reason: string };

export type NormalizedReference = {
  /** SI values in our sign conventions, only for compatible metrics. */
  readonly values: Partial<Record<ComparableMetric, number>>;
  /** One human-readable line per unit conversion or sign flip applied. */
  readonly conversionsApplied: string[];
  readonly incompatible: IncompatibleMetric[];
};

/** Reason a declared convention makes a metric incomparable, or null if it is fine. */
function conventionGate(metric: ComparableMetric, c: ReferenceConventions): string | null {
  const def = REFERENCE_METRIC_DEFINITIONS[metric];
  if (def.evaluatedAtLanding) {
    if (c.carryDefinition === "landing-at-launch-height") {
      return (
        "reference evaluates landing where the ball descends through launch height; ours uses first ground contact. " +
        "These agree only when our shot landed at launch height (flat ground at tee height) — the caller must " +
        "establish that before comparing"
      );
    }
    if (c.carryDefinition === "unknown") return "reference landing (carry) definition is unknown";
  }
  if (metric === "ballSpeed" && c.ballSpeedReference === "unknown") {
    return "reference ball-speed measurement point is unknown (ours: ball centre)";
  }
  return null;
}

function flipNeeded(metric: ComparableMetric, c: ReferenceConventions): string | null {
  const convention = REFERENCE_METRIC_DEFINITIONS[metric].signConvention;
  if (convention === "horizontalAngleSign" && c.horizontalAngleSign === "right-positive") {
    return "reference right-positive -> ours left-positive";
  }
  if (convention === "lateralSign" && c.lateralSign === "right-positive") {
    return "reference right-positive -> ours left-positive";
  }
  if (convention === "spinAxisSign" && c.spinAxisSign === "left-positive") {
    return "reference left-positive -> ours positive = curves right";
  }
  return null;
}

function metricOrder(name: string): number {
  const i = (COMPARABLE_METRICS as readonly string[]).indexOf(name);
  return i === -1 ? COMPARABLE_METRICS.length : i;
}

/**
 * Validates a reference measurement and converts every compatible metric to SI in our
 * sign conventions. Throws if the record itself is malformed.
 */
export function normalizeReference(ref: ReferenceMeasurement): NormalizedReference {
  const parsed = ReferenceMeasurementSchema.safeParse(ref);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    throw new Error(
      `normalizeReference: invalid reference measurement at ${(first?.path ?? []).join(".") || "(root)"}: ` +
        `${first?.message ?? "invalid"}`,
    );
  }
  const { metrics, conventions } = parsed.data;
  const values: Partial<Record<ComparableMetric, number>> = {};
  const conversionsApplied: string[] = [];
  const incompatible: IncompatibleMetric[] = [];

  const names = Object.keys(metrics).sort((a, b) => metricOrder(a) - metricOrder(b) || (a < b ? -1 : a > b ? 1 : 0));
  for (const name of names) {
    const m = metrics[name] as z.infer<typeof ReferenceMetricValueSchema>;
    if (!isComparableMetric(name)) {
      incompatible.push({ metric: name, reason: `not a comparable metric (comparable: ${COMPARABLE_METRICS.join(", ")})` });
      continue;
    }
    const def = REFERENCE_METRIC_DEFINITIONS[name];
    if (m.definition !== def.definitionId) {
      incompatible.push({
        metric: name,
        reason:
          `definition "${m.definition}" differs from ours "${def.definitionId}" (${def.description}) ` +
          "and no documented conversion exists",
      });
      continue;
    }
    const gate = conventionGate(name, conventions);
    if (gate !== null) {
      incompatible.push({ metric: name, reason: gate });
      continue;
    }
    if (!isKnownUnit(m.unit)) {
      incompatible.push({ metric: name, reason: `unknown unit "${m.unit}"` });
      continue;
    }
    if (dimensionOf(m.unit) !== dimensionOf(def.siUnit)) {
      incompatible.push({
        metric: name,
        reason: `unit "${m.unit}" is a ${dimensionOf(m.unit)}, but ${name} is a ${dimensionOf(def.siUnit)} (${def.siUnit})`,
      });
      continue;
    }
    let value = convert(m.value, m.unit, def.siUnit);
    if (m.unit !== def.siUnit) conversionsApplied.push(`${name}: ${m.value} ${m.unit} -> ${value} ${def.siUnit}`);
    const flip = flipNeeded(name, conventions);
    if (flip !== null) {
      value = value === 0 ? 0 : -value;
      conversionsApplied.push(`${name}: sign flipped (${flip})`);
    }
    values[name] = value;
  }
  return { values, conversionsApplied, incompatible };
}

// ---------------------------------------------------------------------------
// Comparison
// ---------------------------------------------------------------------------

export type ReferenceComparisonRow = {
  readonly metric: string;
  readonly ours: number | null;
  readonly reference: number | null;
  /** ours - reference, SI, our sign conventions; null when not compared. */
  readonly error: number | null;
  readonly note: string;
};

/**
 * One row per metric present on either side (comparable metrics in canonical order, then
 * any incompatible non-comparable metric names). `ours` must already be SI in our sign
 * conventions (e.g. radians for angles, rad/s for spin).
 */
export function compareToReference(
  ours: Partial<Record<ComparableMetric, number | null>>,
  normalized: NormalizedReference,
): ReferenceComparisonRow[] {
  const incompatibleBy = new Map(normalized.incompatible.map((i) => [i.metric, i.reason]));
  const rows: ReferenceComparisonRow[] = [];
  for (const metric of COMPARABLE_METRICS) {
    const hasOurs = Object.prototype.hasOwnProperty.call(ours, metric);
    const oursValue = ours[metric] ?? null;
    const refValue = normalized.values[metric] ?? null;
    const reason = incompatibleBy.get(metric);
    if (!hasOurs && refValue === null && reason === undefined) continue;
    if (oursValue !== null && !Number.isFinite(oursValue)) {
      throw new Error(`compareToReference: our ${metric} is not finite (${oursValue})`);
    }
    let note: string;
    let error: number | null = null;
    if (reason !== undefined) note = `not compared: reference incompatible — ${reason}`;
    else if (refValue === null) note = "not compared: no reference value";
    else if (oursValue === null) note = "not compared: no value from our system";
    else {
      error = oursValue - refValue;
      note = `ours - reference, ${REFERENCE_METRIC_DEFINITIONS[metric].siUnit}`;
    }
    rows.push({ metric, ours: oursValue, reference: reason !== undefined ? null : refValue, error, note });
  }
  for (const { metric, reason } of normalized.incompatible) {
    if (isComparableMetric(metric)) continue;
    rows.push({ metric, ours: null, reference: null, error: null, note: `not compared: ${reason}` });
  }
  return rows;
}
