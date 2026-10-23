/**
 * Measurement / CalculatedValue -> DisplayValue, without losing provenance.
 *
 * Rules:
 * - The badge is derived from the value's own source and can only be kept or downgraded here.
 * - A null / unavailable value renders "—", never a number, and is badged UNAVAILABLE. A null
 *   calculated value keeps its basis' secondary badges (ESTIMATED, SYNTHETIC, ...) so the
 *   provenance of the attempted calculation is not lost.
 * - LaunchState scalar fields are stored in degrees / rpm / deg/s (contract exception,
 *   docs/coordinate-system.md §2); ShotMetrics are SI. Each metric knows its stored unit
 *   (definitions.ts), converts to SI, and only then calls an SI formatter from @glm/units.
 * - Contract-invariant violations (null value with a measured source, confidence outside
 *   [0, 1], non-finite values, an incompatible unit label) throw: a wrong number on screen is
 *   worse than a crash in a test. Problems with optional uncertainty data only drop the range
 *   and add a "presentation:" quality flag.
 */
import type {
  CalculatedValue,
  CalculationInput,
  DataOrigin,
  LaunchState,
  Measurement,
  MeasurementSource,
  ShotMetrics,
  Validity,
} from "@glm/shared-types";
import { deepFreeze, ESTIMATED_SOURCES, MEASURED_SOURCES } from "@glm/shared-types";
import {
  convert,
  degToRad,
  dimensionOf,
  formatAngle,
  formatAngularRate,
  formatDistance,
  formatDuration,
  formatHeight,
  formatHorizontalAngle,
  formatLateral,
  formatRange,
  formatRatio,
  formatShortLength,
  formatSidespin,
  formatSpeed,
  formatSpinAxis,
  formatSpinRate,
  type PercentileInterval,
  type Precision,
  radToDeg,
  type RangeKind,
  roundHalfAwayFromZero,
  rpmToRadPerSec,
  shouldShowRange,
  UNAVAILABLE_TEXT,
  UNIT_IDS,
  type UnitId,
  type UnitSystem,
} from "@glm/units";
import {
  type FormatKind,
  LAUNCH_FIELD_FOR_METRIC,
  type LaunchField,
  METRIC_DEFINITIONS,
  type MetricDefinition,
  type MetricId,
  SHOT_METRICS_FIELD_FOR_METRIC,
  type ShotMetricsField,
} from "./definitions";
import {
  adjectiveForSource,
  badgeForSource,
  type ConfidenceLabel,
  confidenceLabel,
  PROVENANCE_SEVERITY,
  type ProvenanceBadge,
  statusForSource,
  worstBadge,
} from "./provenance";

export type DisplayTooltip = {
  readonly definition: string;
  readonly units: string;
  readonly status: string;
  readonly dependencies: readonly string[];
  readonly confidence: string;
  readonly limitations: readonly string[];
};

export type DisplayValue = {
  readonly metricId: MetricId;
  readonly label: string;
  readonly text: string;
  /** Golfer range ("163–171 yd") when the uncertainty is too wide for one number; else null. */
  readonly rangeText: string | null;
  readonly available: boolean;
  readonly badge: ProvenanceBadge;
  readonly secondaryBadges: readonly ProvenanceBadge[];
  /** Raw provenance, e.g. "measured-camera" or "calculated from: velocityMps (synthetic), ...". */
  readonly sourceDetail: string;
  readonly confidence: number;
  readonly confidenceLabel: ConfidenceLabel;
  readonly qualityFlags: readonly string[];
  readonly tooltip: DisplayTooltip;
};

/** z such that ±z·σ covers 90 % of a normal distribution (p05..p95). */
export const NORMAL_Z_90 = 1.6448536269514722;

// ---------------------------------------------------------------------------
// Units: declared unit label -> stored (field) unit -> SI
// ---------------------------------------------------------------------------

type StoredUnit = LaunchField["unit"] | ShotMetricsField["unit"];

/** Spellings accepted as "the field's own unit" without conversion. */
const UNIT_ALIASES: Readonly<Record<StoredUnit, readonly string[]>> = {
  "m/s": ["m/s", "mps"],
  deg: ["deg", "°", "degree", "degrees"],
  rpm: ["rpm", "rev/min"],
  "deg/s": ["deg/s", "°/s"],
  m: ["m"],
  "1": ["1", "", "ratio", "dimensionless", "x"],
  s: ["s"],
  rad: ["rad"],
  "rad/s": ["rad/s"],
};

/**
 * Own-key membership test. (`isUnitId` from @glm/units uses `in`, which also accepts
 * prototype keys such as "constructor"; see the contract notes.)
 */
const isKnownUnit = (unit: string): unit is UnitId => (UNIT_IDS as readonly string[]).includes(unit);

/**
 * Converter from a declared unit label to the field's stored unit, or null if the label is
 * neither an accepted spelling nor a known unit of the same dimension.
 */
function toStoredConverter(declared: string, stored: StoredUnit): ((v: number) => number) | null {
  if (typeof declared !== "string") return null;
  if (UNIT_ALIASES[stored].includes(declared)) return (v) => v;
  if (!isKnownUnit(declared)) return null;
  if (stored === "deg/s") {
    return dimensionOf(declared) === "angular-speed" ? (v) => radToDeg(convert(v, declared, "rad/s")) : null;
  }
  if (stored === "1" || !isKnownUnit(stored)) return null;
  return dimensionOf(declared) === dimensionOf(stored) ? (v) => convert(v, declared, stored) : null;
}

function storedToSi(value: number, stored: StoredUnit): number {
  switch (stored) {
    case "deg":
    case "deg/s":
      return degToRad(value);
    case "rpm":
      return rpmToRadPerSec(value);
    default:
      return value;
  }
}

function requireConverter(declared: string, stored: StoredUnit, context: string): (v: number) => number {
  const converter = toStoredConverter(declared, stored);
  if (converter === null) {
    throw new RangeError(`${context}: unit "${declared}" is not compatible with the field unit "${stored}"`);
  }
  return converter;
}

// ---------------------------------------------------------------------------
// Formatting by kind
// ---------------------------------------------------------------------------

function formatSi(kind: FormatKind, si: number | null, system: UnitSystem, precision: Precision): string {
  switch (kind) {
    case "distance":
      return formatDistance(si, system, precision);
    case "height":
      return formatHeight(si, system, precision);
    case "lateral":
      return formatLateral(si, system, precision);
    case "speed":
      return formatSpeed(si, system, precision);
    case "angle":
      return formatAngle(si, precision);
    case "horizontal-angle":
      return formatHorizontalAngle(si, precision);
    case "spin-axis":
      return formatSpinAxis(si, precision);
    case "spin":
      return formatSpinRate(si, precision);
    case "side-spin":
      return formatSidespin(si, precision);
    case "duration":
      return formatDuration(si, precision);
    case "ratio":
      return formatRatio(si, precision);
    case "angular-rate":
      return formatAngularRate(si, precision);
    case "short-length":
      return formatShortLength(si, system, precision);
    default:
      throw new RangeError(`formatSi: unknown format kind "${String(kind)}"`);
  }
}

const RANGE_KIND_FOR_FORMAT: Readonly<Partial<Record<FormatKind, RangeKind>>> = {
  distance: "distance",
  height: "height",
  lateral: "lateral",
  speed: "speed",
  angle: "angle",
  "horizontal-angle": "horizontal-angle",
  "spin-axis": "spin-axis",
  spin: "spin",
  "side-spin": "side-spin",
  duration: "duration",
};

function displayUnitLabel(kind: FormatKind, system: UnitSystem, precision: Precision): string {
  const eng = precision === "engineering";
  switch (kind) {
    case "distance":
      return eng ? "m" : system.distance;
    case "height":
      return eng ? "m" : system.height;
    case "lateral":
      return eng ? "m, signed (+ = left)" : `${system.distance}, labelled L / R`;
    case "speed":
      return eng ? "m/s" : system.speed;
    case "angle":
      return "degrees";
    case "horizontal-angle":
    case "spin-axis":
      return "degrees, labelled L / R";
    case "spin":
      return "rpm";
    case "side-spin":
      return "rpm, labelled L / R";
    case "duration":
      return "s";
    case "ratio":
      return "ratio (dimensionless)";
    case "angular-rate":
      return "degrees per second";
    case "short-length":
      return eng ? "m" : system.distance === "yd" ? "in" : "cm";
    default:
      throw new RangeError(`displayUnitLabel: unknown format kind "${String(kind)}"`);
  }
}

function unitsTooltip(def: MetricDefinition, system: UnitSystem, precision: Precision, storedAs: string): string {
  const parts = [`Shown in ${displayUnitLabel(def.formatKind, system, precision)}`, `stored as ${storedAs}`];
  if (def.signConvention !== null) parts.push(def.signConvention);
  return parts.join("; ");
}

/**
 * Confidence to 2 dp, kept on the same side of the label thresholds as the unrounded value:
 * 0.795 prints "0.79" beside "Medium" (rounding to "0.80" would contradict ">= 0.80 is high"),
 * and 0.004 prints "<0.01" beside "Low" (not "0.00", which reads as "none").
 */
function confidenceNumberText(confidence: number, label: ConfidenceLabel): string {
  const rounded = roundHalfAwayFromZero(confidence, 2);
  if (confidenceLabel(rounded) === label) return rounded.toFixed(2);
  // The thresholds (0.8, 0.5) lie on the 2-dp grid, so rounding can only cross one upward,
  // or fall from "low" to 0.
  return rounded > confidence ? (rounded - 0.01).toFixed(2) : "<0.01";
}

function confidenceText(confidence: number, label: ConfidenceLabel, intervalNote: string | null): string {
  const name = label.charAt(0).toUpperCase() + label.slice(1);
  const base = `${name} (${confidenceNumberText(confidence, label)})`;
  return intervalNote === null ? base : `${base}; ${intervalNote}`;
}

type RangeResult = { readonly rangeText: string | null; readonly intervalText: string | null };

/**
 * Range text for an SI interval. `intervalText` (tooltip) is always produced; `rangeText`
 * only when shouldShowRange says a single number would be false precision AND the two ends
 * do not render identically (a "2–2 yd" range carries no information).
 */
function rangeFor(
  def: MetricDefinition,
  interval: PercentileInterval | null,
  system: UnitSystem,
  precision: Precision,
): RangeResult {
  const kind = RANGE_KIND_FOR_FORMAT[def.formatKind];
  if (kind === undefined || interval === null) return { rangeText: null, intervalText: null };
  const intervalText = formatRange(interval.p05, interval.p95, kind, system, precision);
  if (!shouldShowRange(interval, kind)) return { rangeText: null, intervalText };
  const lowText = formatSi(def.formatKind, interval.p05, system, precision);
  const highText = formatSi(def.formatKind, interval.p95, system, precision);
  return { rangeText: lowText === highText ? null : intervalText, intervalText };
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

/** Finite and lo <= mid <= hi: a 90 % interval must contain its centre value. */
function isOrderedFinite(lo: number, mid: number, hi: number): boolean {
  return [lo, mid, hi].every(isFiniteNumber) && lo <= mid && mid <= hi;
}

/**
 * Format kinds that are magnitudes and can never be negative: horizontal distances (§5), apex
 * height (maximum minus launch height), speeds, spin rates, durations.
 */
const NON_NEGATIVE_KINDS: ReadonlySet<FormatKind> = new Set(["distance", "height", "speed", "spin", "duration"]);
/** Distance-formatted metrics that are signed along-track displacements (spin-back < 0). */
const SIGNED_DISTANCE_METRICS: ReadonlySet<string> = new Set(["bounceDistance", "rollDistance"]);

/**
 * A magnitude's interval must not reach below 0. The ±1.645σ normal approximation does when
 * σ exceeds ~61 % of the value (e.g. a wide player-model spin estimate), and the golfer must never
 * read "-470 rpm". The lower end is clamped at 0 and flagged; an interval whose centre is itself
 * negative is contradictory and dropped.
 */
function clampNonNegative(
  def: MetricDefinition,
  interval: PercentileInterval | null,
  flags: string[],
): { interval: PercentileInterval | null; clamped: boolean } {
  if (
    interval === null ||
    !NON_NEGATIVE_KINDS.has(def.formatKind) ||
    SIGNED_DISTANCE_METRICS.has(def.id) ||
    interval.p05 >= 0
  ) {
    return { interval, clamped: false };
  }
  if (interval.p50 < 0) {
    flags.push(`presentation: negative interval for a non-negative quantity (${def.label}); range not shown`);
    return { interval: null, clamped: false };
  }
  flags.push(`presentation: interval lower end below 0 clamped to 0 (${def.label} cannot be negative)`);
  return { interval: { ...interval, p05: 0 }, clamped: true };
}

const CLAMPED_NOTE = ", lower end clamped at 0";

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function assertPrecision(precision: Precision, context: string): void {
  if (precision !== "golfer" && precision !== "engineering") {
    throw new RangeError(`${context}: unknown precision "${String(precision)}"`);
  }
}

function assertConfidence(confidence: number, context: string): void {
  if (typeof confidence !== "number" || !Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
    throw new RangeError(`${context}: confidence must be in [0, 1], got ${String(confidence)}`);
  }
}

/** Enforces the Measurement<T> provenance invariants (shared-types/measurement.ts). */
function assertMeasurement(m: Measurement<number>, context: string): void {
  if (m === null || typeof m !== "object") throw new TypeError(`${context}: not a Measurement`);
  badgeForSource(m.source); // throws on an unknown source
  const isNull = m.value === null;
  if (isNull !== (m.source === "unavailable")) {
    throw new RangeError(
      `${context}: provenance invariant violated (value ${isNull ? "null" : String(m.value)} with source "${m.source}")`,
    );
  }
  assertConfidence(m.confidence, context);
  if (isNull && m.confidence !== 0) throw new RangeError(`${context}: unavailable value must have confidence 0`);
  if (!isNull && (typeof m.value !== "number" || !Number.isFinite(m.value))) {
    throw new RangeError(`${context}: value must be a finite number, got ${String(m.value)}`);
  }
}

// ---------------------------------------------------------------------------
// Measurements (LaunchState fields)
// ---------------------------------------------------------------------------

function launchFieldFor(metricId: MetricId, fn: string): { def: MetricDefinition; field: LaunchField } {
  const def = METRIC_DEFINITIONS[metricId];
  if (def === undefined) throw new RangeError(`${fn}: unknown metric "${String(metricId)}"`);
  const field = LAUNCH_FIELD_FOR_METRIC[metricId];
  if (field === undefined) {
    throw new RangeError(`${fn}: "${metricId}" is a ${def.category} metric, not a LaunchState measurement`);
  }
  return { def, field };
}

/** 90 % interval in SI from a Measurement's uncertainty (stated bounds, else ±1.645σ). */
function measurementInterval(
  m: Measurement<number>,
  valueStored: number,
  field: LaunchField,
  flags: string[],
): { interval: PercentileInterval; note: string } | null {
  const u = m.uncertainty;
  if (u === undefined) return null;
  const toStored = toStoredConverter(u.unit, field.unit);
  if (toStored === null) {
    flags.push(`presentation: uncertainty unit "${u.unit}" incompatible with "${field.unit}"; range not shown`);
    return null;
  }
  const p50 = storedToSi(valueStored, field.unit);
  if (u.lower !== undefined && u.upper !== undefined) {
    const lo = storedToSi(toStored(u.lower), field.unit);
    const hi = storedToSi(toStored(u.upper), field.unit);
    if (![lo, hi].every(isFiniteNumber) || lo > hi) {
      flags.push("presentation: invalid uncertainty bounds; range not shown");
      return null;
    }
    // Slack for unit-conversion noise when the value sits exactly on a bound.
    const slack = 1e-9 * Math.max(Math.abs(lo), Math.abs(hi));
    if (p50 < lo - slack || p50 > hi + slack) {
      flags.push("presentation: value outside its stated uncertainty interval; range not shown");
      return null;
    }
    return { interval: { p05: Math.min(lo, p50), p50, p95: Math.max(hi, p50) }, note: "stated interval" };
  }
  if (u.sigma !== undefined) {
    if (!Number.isFinite(u.sigma) || u.sigma < 0) {
      flags.push("presentation: invalid uncertainty sigma; range not shown");
      return null;
    }
    // Every stored unit is a pure scale of SI, so a spread converts like a value.
    const half = NORMAL_Z_90 * toStored(u.sigma);
    const lo = storedToSi(valueStored - half, field.unit);
    const hi = storedToSi(valueStored + half, field.unit);
    return { interval: { p05: lo, p50, p95: hi }, note: "90% interval (±1.645σ, normal approximation)" };
  }
  return null;
}

type OriginAdjusted = { readonly badge: ProvenanceBadge; readonly conflict: string | null };

/**
 * Data-origin guard: a measured-* label on a shot whose stream is synthetic or a developer
 * manual entry contradicts the product law ("synthetic data is never measured-*"). The display
 * downgrades it to the origin's badge and says why; it never upgrades.
 */
function adjustForOrigin(source: MeasurementSource, origin: DataOrigin | null): OriginAdjusted {
  const badge = badgeForSource(source);
  if (badge !== "MEASURED" || origin === null) return { badge, conflict: null };
  if (origin === "synthetic" || origin === "manual") {
    const shown: ProvenanceBadge = origin === "synthetic" ? "SYNTHETIC" : "MANUAL";
    return {
      badge: shown,
      conflict: `presentation: source "${source}" conflicts with dataOrigin "${origin}"; shown as ${shown}`,
    };
  }
  return { badge, conflict: null };
}

/**
 * Per-value flag for a shot the validity check did not pass, so a value read on its own (outside
 * the validityBanner) still says it belongs to a provisional or rejected shot.
 */
function validityFlag(validity: Validity | null): string | null {
  switch (validity) {
    case null:
    case "valid":
      return null;
    case "provisional":
      return "presentation: launch provisional; see validityBanner";
    case "invalid":
      return "presentation: launch invalid (shot rejected); see validityBanner";
    default:
      throw new RangeError(`presentLaunchState: unknown validity "${String(validity)}"`);
  }
}

function measurementDisplay(
  metricId: MetricId,
  m: Measurement<number>,
  system: UnitSystem,
  precision: Precision,
  launch: LaunchState | null,
  fn: string,
): DisplayValue {
  const { def, field } = launchFieldFor(metricId, fn);
  const context = `${fn}(${metricId})`;
  assertPrecision(precision, context);
  assertMeasurement(m, context);
  const origin = launch === null ? null : launch.dataOrigin;
  const { badge, conflict } = adjustForOrigin(m.source, origin);
  const flags: string[] = [...m.qualityFlags];
  if (conflict !== null) flags.push(conflict);
  const shotFlag = validityFlag(launch === null ? null : launch.validity);
  if (shotFlag !== null) flags.push(shotFlag);
  const storedAs = `${field.unit} in LaunchState.${field.field}`;

  if (m.value === null) {
    return deepFreeze({
      metricId,
      label: def.label,
      text: UNAVAILABLE_TEXT,
      rangeText: null,
      available: false,
      badge: "UNAVAILABLE",
      secondaryBadges: [],
      sourceDetail: m.source,
      confidence: 0,
      confidenceLabel: "none",
      qualityFlags: flags,
      tooltip: {
        definition: def.definition,
        units: unitsTooltip(def, system, precision, storedAs),
        status: statusForSource(m.source),
        dependencies: def.dependsOn,
        confidence: confidenceText(0, "none", null),
        limitations: def.limitations,
      },
    }) as DisplayValue;
  }

  const valueStored = requireConverter(m.unit, field.unit, context)(m.value);
  const si = storedToSi(valueStored, field.unit);
  const stated = measurementInterval(m, valueStored, field, flags);
  const { interval, clamped } = clampNonNegative(def, stated?.interval ?? null, flags);
  const note = `${stated?.note}${clamped ? CLAMPED_NOTE : ""}`;
  const { rangeText, intervalText } = rangeFor(def, interval, system, precision);
  const label = confidenceLabel(m.confidence);
  const status =
    conflict === null
      ? statusForSource(m.source)
      : `Labelled "${m.source}", but this shot's data origin is ${origin}; shown as ${badge}`;

  return deepFreeze({
    metricId,
    label: def.label,
    text: formatSi(def.formatKind, si, system, precision),
    rangeText,
    available: true,
    badge,
    secondaryBadges: [],
    sourceDetail: conflict === null ? m.source : `${m.source} (dataOrigin: ${origin})`,
    confidence: m.confidence,
    confidenceLabel: label,
    qualityFlags: flags,
    tooltip: {
      definition: def.definition,
      units: unitsTooltip(def, system, precision, storedAs),
      status,
      dependencies: def.dependsOn,
      confidence: confidenceText(m.confidence, label, intervalText === null ? null : `${note} ${intervalText}`),
      limitations: def.limitations,
    },
  }) as DisplayValue;
}

/**
 * Present one LaunchState measurement. `m.value` is in the LaunchState field's unit for that
 * metric (LAUNCH_FIELD_FOR_METRIC: degrees for angles, rpm for spin, m/s for speed, deg/s for
 * closure rate). A different but compatible `m.unit` (e.g. "rad") is converted explicitly; an
 * incompatible one throws. Calculated metrics throw: use presentCalculated.
 */
export function presentMeasurement(
  metricId: MetricId,
  m: Measurement<number>,
  system: UnitSystem,
  precision: Precision = "golfer",
): DisplayValue {
  return measurementDisplay(metricId, m, system, precision, null, "presentMeasurement");
}

// ---------------------------------------------------------------------------
// Calculated values (ShotMetrics)
// ---------------------------------------------------------------------------

/** Golfer nouns for input fields, so status reads "depends on estimated spin". */
const INPUT_NOUNS: Readonly<Record<string, string>> = {
  angularVelocityRadPerSec: "spin",
  totalSpinRpm: "spin",
  spinAxisTiltDeg: "spin axis",
  velocityMps: "launch velocity",
  ballSpeedMps: "ball speed",
  verticalLaunchAngleDeg: "launch angle",
  horizontalLaunchAngleDeg: "launch direction",
  ballPositionM: "launch position",
};

const nounFor = (field: string): string => INPUT_NOUNS[field] ?? field;

const isEstimatedLike = (source: MeasurementSource): boolean => ESTIMATED_SOURCES.has(source) || source === "manual";

/** Secondary badges, ordered by PROVENANCE_SEVERITY, deduplicated. */
function orderedBadges(badges: Iterable<ProvenanceBadge>): ProvenanceBadge[] {
  const set = new Set(badges);
  return PROVENANCE_SEVERITY.filter((b) => set.has(b));
}

function calculatedBasis(c: CalculatedValue<number>, flags: string[], origin: DataOrigin | null) {
  const declared: readonly CalculationInput[] = c.inputs;
  for (const input of declared) badgeForSource(input.source); // throws on an unknown source
  // Never lose provenance: the input list and the summary flags are OR-ed together.
  if (!c.dependsOnEstimated && declared.some((i) => isEstimatedLike(i.source))) {
    flags.push("presentation: dependsOnEstimated=false contradicts the input list; treated as true");
  }
  if (!c.dependsOnSynthetic && declared.some((i) => i.source === "synthetic")) {
    flags.push("presentation: dependsOnSynthetic=false contradicts the input list; treated as true");
  }
  // Data-origin guard, same rule as adjustForOrigin: on a synthetic or manual stream a measured-*
  // input label is treated as the origin's source, and the stream itself is always reflected.
  const originSource: MeasurementSource | null = origin === "synthetic" || origin === "manual" ? origin : null;
  const relabelled = originSource === null ? [] : declared.filter((i) => MEASURED_SOURCES.has(i.source));
  if (originSource !== null && relabelled.length > 0) {
    const fields = relabelled.map((i) => i.field).join(", ");
    flags.push(`presentation: measured-* inputs (${fields}) conflict with dataOrigin "${origin}"; treated as ${originSource}`);
  }
  const inputs: readonly CalculationInput[] =
    relabelled.length === 0
      ? declared
      : declared.map((i) => (MEASURED_SOURCES.has(i.source) ? { field: i.field, source: originSource as MeasurementSource } : i));
  const estimatedInputs = inputs.filter((i) => isEstimatedLike(i.source));
  const syntheticInputs = inputs.filter((i) => i.source === "synthetic");
  const originNotDeclared =
    (originSource === "synthetic" && !c.dependsOnSynthetic && syntheticInputs.length === 0) ||
    (originSource === "manual" && !inputs.some((i) => i.source === "manual"));
  if (originNotDeclared) {
    flags.push(`presentation: calculated value on a ${origin} data stream does not declare it; treated as ${originSource}`);
  }
  const dependsOnEstimated = c.dependsOnEstimated || estimatedInputs.length > 0 || originSource === "manual";
  const dependsOnSynthetic = c.dependsOnSynthetic || syntheticInputs.length > 0 || originSource === "synthetic";

  const secondary: ProvenanceBadge[] = [];
  if (dependsOnEstimated) secondary.push("ESTIMATED");
  if (inputs.some((i) => i.source === "assumed-generic-fallback")) secondary.push("ASSUMED");
  if (inputs.some((i) => i.source === "manual") || originSource === "manual") secondary.push("MANUAL");
  if (dependsOnSynthetic) secondary.push("SYNTHETIC");

  const phrases: string[] = [];
  for (const input of inputs) {
    if (MEASURED_SOURCES.has(input.source)) continue;
    const phrase = `${adjectiveForSource(input.source)} ${nounFor(input.field)}`;
    if (!phrases.includes(phrase)) phrases.push(phrase);
  }
  if (originSource === "manual" && !inputs.some((i) => i.source === "manual")) phrases.push("manually entered inputs");
  else if (dependsOnEstimated && estimatedInputs.length === 0) phrases.push("estimated inputs");
  if (dependsOnSynthetic && syntheticInputs.length === 0) phrases.push("synthetic inputs");

  const status =
    phrases.length > 0
      ? `Calculated; depends on ${phrases.join(", ")}`
      : inputs.length > 0
        ? "Calculated from measured inputs"
        : "Calculated";
  // sourceDetail echoes the declared labels verbatim; a relabelling is stated, not hidden.
  const inputList =
    declared.length > 0 ? declared.map((i) => `${i.field} (${i.source})`).join(", ") : "(inputs not listed)";
  const originNote = relabelled.length > 0 || originNotDeclared ? `; dataOrigin: ${origin}` : "";
  const sourceDetail = `calculated from: ${inputList}; model ${c.modelVersion}${originNote}`;
  return { secondaryBadges: orderedBadges(secondary), status, phrases, sourceDetail };
}

/**
 * Present one calculated value. `c.value` is SI in the ShotMetrics field's unit
 * (SHOT_METRICS_FIELD_FOR_METRIC: m, s, rad, m/s, rad/s). Badge CALCULATED with ESTIMATED /
 * ASSUMED / MANUAL / SYNTHETIC secondary badges from its basis; a range when the Monte Carlo
 * interval is wide.
 *
 * When the model produced no value: text "—", available false, badge UNAVAILABLE (deliberately
 * not CALCULATED: nothing was calculated, and every "—" in the UI carries the same badge), but the
 * basis' secondary badges and wording are kept, e.g. UNAVAILABLE + [SYNTHETIC].
 *
 * `dataOrigin` (the shot's LaunchState.dataOrigin, optional): on a synthetic or manual stream,
 * measured-* input labels are treated as the origin's source and the origin's badge is always
 * shown, mirroring presentLaunchState.
 */
export function presentCalculated(
  metricId: MetricId,
  c: CalculatedValue<number>,
  system: UnitSystem,
  precision: Precision = "golfer",
  dataOrigin: DataOrigin | null = null,
): DisplayValue {
  const def = METRIC_DEFINITIONS[metricId];
  if (def === undefined) throw new RangeError(`presentCalculated: unknown metric "${String(metricId)}"`);
  const field = SHOT_METRICS_FIELD_FOR_METRIC[metricId];
  if (field === undefined) {
    throw new RangeError(`presentCalculated: "${metricId}" is a ${def.category} metric, not a calculated ShotMetrics value`);
  }
  const context = `presentCalculated(${metricId})`;
  assertPrecision(precision, context);
  if (dataOrigin !== null && !["live", "replay", "synthetic", "manual"].includes(dataOrigin)) {
    throw new RangeError(`${context}: unknown data origin "${String(dataOrigin)}"`);
  }
  if (c === null || typeof c !== "object" || c.kind !== "calculated") {
    throw new TypeError(`${context}: not a CalculatedValue`);
  }
  assertConfidence(c.confidence, context);
  if (c.value !== null && (typeof c.value !== "number" || !Number.isFinite(c.value))) {
    throw new RangeError(`${context}: value must be a finite number or null, got ${String(c.value)}`);
  }

  const flags: string[] = [...c.qualityFlags];
  const basis = calculatedBasis(c, flags, dataOrigin);
  const storedAs = `${field.unit} in ShotMetrics.${field.field}`;

  if (c.value === null) {
    return deepFreeze({
      metricId,
      label: def.label,
      text: UNAVAILABLE_TEXT,
      rangeText: null,
      available: false,
      badge: "UNAVAILABLE",
      secondaryBadges: basis.secondaryBadges,
      sourceDetail: basis.sourceDetail,
      confidence: 0,
      confidenceLabel: "none",
      qualityFlags: flags,
      tooltip: {
        definition: def.definition,
        units: unitsTooltip(def, system, precision, storedAs),
        status:
          (c.qualityFlags.length > 0
            ? `Not available; ${c.qualityFlags.join(", ")}`
            : "Not available; the model produced no value") +
          (basis.phrases.length > 0 ? ` (calculation depends on ${basis.phrases.join(", ")})` : ""),
        dependencies: def.dependsOn,
        confidence: confidenceText(0, "none", null),
        limitations: def.limitations,
      },
    }) as DisplayValue;
  }

  const si = requireConverter(c.unit, field.unit, context)(c.value);
  let interval: PercentileInterval | null = null;
  if (c.interval !== undefined) {
    const toSi = toStoredConverter(c.interval.unit, field.unit);
    if (toSi === null) {
      flags.push(`presentation: interval unit "${c.interval.unit}" incompatible with "${field.unit}"; range not shown`);
    } else {
      const candidate = { p05: toSi(c.interval.p05), p50: toSi(c.interval.p50), p95: toSi(c.interval.p95) };
      if (isOrderedFinite(candidate.p05, candidate.p50, candidate.p95)) interval = candidate;
      else flags.push("presentation: invalid uncertainty interval; range not shown");
    }
  }
  const bounded = clampNonNegative(def, interval, flags);
  const { rangeText, intervalText } = rangeFor(def, bounded.interval, system, precision);
  const label = confidenceLabel(c.confidence);

  return deepFreeze({
    metricId,
    label: def.label,
    text: formatSi(def.formatKind, si, system, precision),
    rangeText,
    available: true,
    badge: "CALCULATED",
    secondaryBadges: basis.secondaryBadges,
    sourceDetail: basis.sourceDetail,
    confidence: c.confidence,
    confidenceLabel: label,
    qualityFlags: flags,
    tooltip: {
      definition: def.definition,
      units: unitsTooltip(def, system, precision, storedAs),
      status: basis.status,
      dependencies: def.dependsOn,
      confidence: confidenceText(
        c.confidence,
        label,
        intervalText === null
          ? null
          : `90% interval (Monte Carlo, n=${c.interval?.sampleCount}${bounded.clamped ? CLAMPED_NOTE : ""}) ${intervalText}`,
      ),
      limitations: def.limitations,
    },
  }) as DisplayValue;
}

// ---------------------------------------------------------------------------
// Whole launch state / shot metrics
// ---------------------------------------------------------------------------

/** LaunchState measurement fields presented directly, in display order. */
const LAUNCH_MEASUREMENTS: readonly (readonly [MetricId, (l: LaunchState) => Measurement<number>])[] = [
  ["ballSpeed", (l) => l.ballSpeedMps],
  ["verticalLaunch", (l) => l.verticalLaunchAngleDeg],
  ["horizontalLaunch", (l) => l.horizontalLaunchAngleDeg],
  ["totalSpin", (l) => l.totalSpinRpm],
  ["spinAxis", (l) => l.spinAxisTiltDeg],
  ["clubSpeed", (l) => l.clubSpeedMps],
  ["smashFactor", (l) => l.smashFactor],
  ["attackAngle", (l) => l.attackAngleDeg],
  ["clubPath", (l) => l.clubPathDeg],
  ["faceToTarget", (l) => l.faceToTargetDeg],
  ["faceToPath", (l) => l.faceToPathDeg],
  ["dynamicLoft", (l) => l.dynamicLoftDeg],
  ["dynamicLie", (l) => l.dynamicLieDeg],
  ["closureRate", (l) => l.closureRateDegPerSec],
  ["lowPoint", (l) => l.lowPointM],
];

const BADGE_ADJECTIVE: Readonly<Partial<Record<ProvenanceBadge, string>>> = {
  MEASURED: "measured",
  ESTIMATED: "estimated",
  ASSUMED: "assumed",
  MANUAL: "manually entered",
  SYNTHETIC: "synthetic",
  UNAVAILABLE: "unavailable",
};

/**
 * |omega x v-hat| / |omega|: the share of the spin that is perpendicular to the launch velocity
 * (1 when there is no rifle spin). Null when either vector is unavailable or degenerate.
 */
function perpendicularSpinFraction(launch: LaunchState): number | null {
  const w = launch.angularVelocityRadPerSec.value;
  const v = launch.velocityMps.value;
  if (w === null || v === null) return null;
  const wn = Math.hypot(w.x, w.y, w.z);
  const vn = Math.hypot(v.x, v.y, v.z);
  if (!(wn > 0) || !(vn > 0)) return null;
  const cx = (w.y * v.z - w.z * v.y) / vn;
  const cy = (w.z * v.x - w.x * v.z) / vn;
  const cz = (w.x * v.y - w.y * v.x) / vn;
  return Math.min(1, Math.hypot(cx, cy, cz) / wn);
}

/**
 * Backspin / sidespin for golfer familiarity (§4.3): |omega_perp|·cos(tilt), |omega_perp|·sin(tilt).
 * Badge = the worse of the two inputs; the other non-measured input badge is kept as a
 * secondary badge; confidence = the lower of the two. No range: the joint uncertainty of
 * total and tilt is not propagated here (see limitations).
 */
function spinComponentDisplay(
  metricId: "backspin" | "sidespin",
  launch: LaunchState,
  system: UnitSystem,
  precision: Precision,
): DisplayValue {
  const def = METRIC_DEFINITIONS[metricId];
  const total = launch.totalSpinRpm;
  const tilt = launch.spinAxisTiltDeg;
  assertPrecision(precision, `presentLaunchState(${metricId})`);
  assertMeasurement(total, `presentLaunchState(${metricId}: totalSpinRpm)`);
  assertMeasurement(tilt, `presentLaunchState(${metricId}: spinAxisTiltDeg)`);
  const totalAdj = adjustForOrigin(total.source, launch.dataOrigin);
  const tiltAdj = adjustForOrigin(tilt.source, launch.dataOrigin);
  const flags: string[] = [];
  for (const f of [...total.qualityFlags, ...tilt.qualityFlags]) if (!flags.includes(f)) flags.push(f);
  if (totalAdj.conflict !== null) flags.push(`totalSpinRpm: ${totalAdj.conflict}`);
  if (tiltAdj.conflict !== null) flags.push(`spinAxisTiltDeg: ${tiltAdj.conflict}`);
  const shotFlag = validityFlag(launch.validity);
  if (shotFlag !== null) flags.push(shotFlag);
  const sourceDetail = `display-derived from: totalSpinRpm (${total.source}), spinAxisTiltDeg (${tilt.source})`;
  const storedAs = "not stored; derived from LaunchState.totalSpinRpm and LaunchState.spinAxisTiltDeg";

  if (total.value === null || tilt.value === null) {
    const missing = [total.value === null ? "total spin" : null, tilt.value === null ? "spin-axis tilt" : null]
      .filter((s): s is string => s !== null)
      .join(" and ");
    return deepFreeze({
      metricId,
      label: def.label,
      text: UNAVAILABLE_TEXT,
      rangeText: null,
      available: false,
      badge: "UNAVAILABLE",
      secondaryBadges: [],
      sourceDetail,
      confidence: 0,
      confidenceLabel: "none",
      qualityFlags: flags,
      tooltip: {
        definition: def.definition,
        units: unitsTooltip(def, system, precision, storedAs),
        status: `Unavailable; requires both total spin and spin-axis tilt (${missing} unavailable)`,
        dependencies: def.dependsOn,
        confidence: confidenceText(0, "none", null),
        limitations: def.limitations,
      },
    }) as DisplayValue;
  }

  const totalRpm = requireConverter(total.unit, "rpm", `presentLaunchState(${metricId}: totalSpinRpm)`)(total.value);
  const tiltDeg = requireConverter(tilt.unit, "deg", `presentLaunchState(${metricId}: spinAxisTiltDeg)`)(tilt.value);
  const tiltRad = degToRad(tiltDeg);
  // §4.3: the components split the spin PERPENDICULAR to the flight direction; rifle spin
  // (about the flight direction) belongs to neither. Use the stored vectors when available.
  const perpendicularFraction = perpendicularSpinFraction(launch);
  if (perpendicularFraction === null) flags.push("presentation: rifle spin not evaluated (spin or velocity vector unavailable)");
  const perpendicularRpm = totalRpm * (perpendicularFraction ?? 1);
  const componentRpm =
    metricId === "backspin" ? perpendicularRpm * Math.cos(tiltRad) : perpendicularRpm * Math.sin(tiltRad);
  const badge = worstBadge([totalAdj.badge, tiltAdj.badge]);
  const secondaryBadges = orderedBadges([totalAdj.badge, tiltAdj.badge].filter((b) => b !== badge && b !== "MEASURED"));
  const confidence = Math.min(total.confidence, tilt.confidence);
  const label = confidenceLabel(confidence);

  return deepFreeze({
    metricId,
    label: def.label,
    text: formatSi(def.formatKind, rpmToRadPerSec(componentRpm), system, precision),
    rangeText: null,
    available: true,
    badge,
    secondaryBadges,
    sourceDetail,
    confidence,
    confidenceLabel: label,
    qualityFlags: flags,
    tooltip: {
      definition: def.definition,
      units: unitsTooltip(def, system, precision, storedAs),
      status:
        `Derived for display from ${BADGE_ADJECTIVE[totalAdj.badge]} total spin and ` +
        `${BADGE_ADJECTIVE[tiltAdj.badge]} spin-axis tilt; not an independent measurement`,
      dependencies: def.dependsOn,
      confidence: `${confidenceText(confidence, label, null)}; lower of total-spin and spin-axis confidence`,
      limitations: def.limitations,
    },
  }) as DisplayValue;
}

/**
 * Every golfer-facing launch metric: ball speed, launch angles, total spin, spin axis,
 * display-derived backspin / sidespin, and all club-delivery fields (unavailable ones render
 * "—"). Measured-* values on a synthetic or manual data stream are downgraded, never shown as
 * MEASURED. On a provisional or invalid shot every value carries a "presentation: launch ..."
 * quality flag; the validityBanner remains the primary notice.
 */
export function presentLaunchState(
  launch: LaunchState,
  system: UnitSystem,
  precision: Precision = "golfer",
): Partial<Record<MetricId, DisplayValue>> {
  const out: Partial<Record<MetricId, DisplayValue>> = {};
  for (const [metricId, get] of LAUNCH_MEASUREMENTS) {
    out[metricId] = measurementDisplay(metricId, get(launch), system, precision, launch, "presentLaunchState");
  }
  out.backspin = spinComponentDisplay("backspin", launch, system, precision);
  out.sidespin = spinComponentDisplay("sidespin", launch, system, precision);
  return Object.freeze(out);
}

const SHOT_METRICS_ENTRIES: readonly (readonly [MetricId, keyof ShotMetrics])[] = (
  Object.entries(SHOT_METRICS_FIELD_FOR_METRIC) as [MetricId, ShotMetricsField][]
).map(([id, f]) => [id, f.field] as const);

/**
 * Every calculated flight metric in ShotMetrics. Pass the shot's LaunchState.dataOrigin so a
 * synthetic or manual stream is reflected even if the inputs are mislabelled (see presentCalculated).
 */
export function presentShotMetrics(
  metrics: ShotMetrics,
  system: UnitSystem,
  precision: Precision = "golfer",
  dataOrigin: DataOrigin | null = null,
): Partial<Record<MetricId, DisplayValue>> {
  const out: Partial<Record<MetricId, DisplayValue>> = {};
  for (const [metricId, field] of SHOT_METRICS_ENTRIES) {
    out[metricId] = presentCalculated(metricId, metrics[field], system, precision, dataOrigin);
  }
  return Object.freeze(out);
}
