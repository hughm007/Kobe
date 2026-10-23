/**
 * CSV and JSON export of shot records.
 *
 * CSV: one row per shot, RFC 4180 (comma separator, CRLF line ends, quoted fields where
 * needed). Every column name states its unit and, where signed, its sign convention.
 * Values are SI as stored (m, m/s, s), except angles and spin: LaunchState already carries
 * golfer-facing *Deg / *Rpm scalars (documented contract exception), and ShotMetrics
 * radians are converted to degrees for the *_deg columns. Unavailable values are empty
 * cells, never "null" or "NaN".
 *
 * JSON: a versioned envelope around the full, schema-valid records; parseShotExportJson
 * validates everything on the way back in.
 */
import { z } from "zod";
import {
  COORDINATE_SYSTEM_VERSION,
  deepFreeze,
  IsoUtcTimestampSchema,
  SCHEMA_VERSION,
  ShotRecordSchema,
  type CalculatedValue,
  type Measurement,
  type ShotRecord,
} from "@glm/shared-types";
import { convert, UNIT_IDS, type UnitId } from "@glm/units";
import { formatIssuePath } from "./record-codec";

export class ShotExportError extends Error {
  override readonly name = "ShotExportError";
}

/** Own-key lookup: plain `in` would also accept Object.prototype names like "constructor". */
const KNOWN_UNITS: ReadonlySet<string> = new Set(UNIT_IDS);

function isKnownUnit(unit: string): unit is UnitId {
  return KNOWN_UNITS.has(unit);
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

export type CsvColumnKind = "text" | "number" | "boolean";

export type ShotCsvColumn = {
  readonly name: string;
  readonly description: string;
  readonly kind: CsvColumnKind;
};

/** A raw value plus the unit it is declared in (null for text/boolean/dimensionless). */
type Cell = { readonly value: string | number | boolean | null; readonly unit: string | null };

type ColumnDef = ShotCsvColumn & {
  /** Unit the column is written in; values are converted into it from their declared unit. */
  readonly columnUnit: UnitId | null;
  readonly get: (r: ShotRecord) => Cell;
};

const text = (value: string | null): Cell => ({ value, unit: null });
const fromMeasurement = (m: Measurement<number>): Cell => ({ value: m.value, unit: m.unit });
const fromCalculated = (c: CalculatedValue<number> | undefined): Cell =>
  c === undefined ? { value: null, unit: null } : { value: c.value, unit: c.unit };

function joinList(items: readonly string[]): string {
  return items.join("; ");
}

function uniqueInOrder(items: readonly string[]): string[] {
  return [...new Set(items)];
}

function col(
  name: string,
  kind: CsvColumnKind,
  columnUnit: UnitId | null,
  description: string,
  get: (r: ShotRecord) => Cell,
): ColumnDef {
  return { name, kind, columnUnit, description, get };
}

const COLUMN_DEFS: readonly ColumnDef[] = [
  col("shot_id", "text", null, "Shot record id.", (r) => text(r.shotId)),
  col("session_id", "text", null, "Session id.", (r) => text(r.sessionId)),
  col("created_utc", "text", null, "Record creation time, ISO-8601 UTC.", (r) => text(r.createdUtc)),
  col("data_origin", "text", null, "live | replay | synthetic | manual.", (r) => text(r.dataOrigin)),
  col("player_id", "text", null, "Player id from the launch state; empty if unknown.", (r) => text(r.launch.playerId)),
  col("club_id", "text", null, "Club id from the launch state; empty if unknown.", (r) => text(r.launch.clubId)),
  col("validity", "text", null, "Launch-state validity: valid | provisional | invalid.", (r) => text(r.launch.validity)),
  col("overall_confidence", "number", null, "Launch-state overall confidence, 0..1.", (r) => ({
    value: r.launch.overallConfidence,
    unit: null,
  })),
  col("spin_mode", "text", null, "measured | estimated | assumed-generic-fallback | unavailable.", (r) =>
    text(r.launch.spinMode),
  ),
  col("ball_speed_mps", "number", "m/s", "Ball speed at launch, m/s.", (r) => fromMeasurement(r.launch.ballSpeedMps)),
  col("ball_speed_source", "text", null, "Provenance of ball speed.", (r) => text(r.launch.ballSpeedMps.source)),
  col("vertical_launch_deg", "number", "deg", "Vertical launch angle, degrees, positive = upward.", (r) =>
    fromMeasurement(r.launch.verticalLaunchAngleDeg),
  ),
  col("vertical_launch_source", "text", null, "Provenance of vertical launch angle.", (r) =>
    text(r.launch.verticalLaunchAngleDeg.source),
  ),
  col(
    "horizontal_launch_deg_left_positive",
    "number",
    "deg",
    "Horizontal launch angle, degrees, POSITIVE = LEFT of the target line (world +Y).",
    (r) => fromMeasurement(r.launch.horizontalLaunchAngleDeg),
  ),
  col("horizontal_launch_source", "text", null, "Provenance of horizontal launch angle.", (r) =>
    text(r.launch.horizontalLaunchAngleDeg.source),
  ),
  col("total_spin_rpm", "number", "rpm", "Total spin rate |omega|, rpm.", (r) => fromMeasurement(r.launch.totalSpinRpm)),
  col("total_spin_source", "text", null, "Provenance of total spin.", (r) => text(r.launch.totalSpinRpm.source)),
  col(
    "spin_axis_deg_right_positive",
    "number",
    "deg",
    "Spin-axis tilt about the launch velocity, degrees, POSITIVE = ball curves RIGHT.",
    (r) => fromMeasurement(r.launch.spinAxisTiltDeg),
  ),
  col("spin_axis_source", "text", null, "Provenance of spin-axis tilt.", (r) => text(r.launch.spinAxisTiltDeg.source)),
  col("carry_m", "number", "m", "Horizontal distance from launch to first ground contact, m.", (r) =>
    fromCalculated(r.result?.metrics.carryM),
  ),
  col("carry_p05_m", "number", "m", "Carry 5th percentile from Monte Carlo propagation, m.", (r) =>
    intervalCell(r.result?.metrics.carryM, "p05"),
  ),
  col("carry_p95_m", "number", "m", "Carry 95th percentile from Monte Carlo propagation, m.", (r) =>
    intervalCell(r.result?.metrics.carryM, "p95"),
  ),
  col("carry_depends_on_estimated", "boolean", null, "true if carry depends on an estimated/assumed/manual input.", (r) => ({
    value: r.result?.metrics.carryM.dependsOnEstimated ?? null,
    unit: null,
  })),
  col("carry_depends_on_synthetic", "boolean", null, "true if carry depends on a synthetic input.", (r) => ({
    value: r.result?.metrics.carryM.dependsOnSynthetic ?? null,
    unit: null,
  })),
  col("total_m", "number", "m", "Horizontal distance from launch to rest, m.", (r) => fromCalculated(r.result?.metrics.totalM)),
  col("total_p05_m", "number", "m", "Total 5th percentile, m.", (r) => intervalCell(r.result?.metrics.totalM, "p05")),
  col("total_p95_m", "number", "m", "Total 95th percentile, m.", (r) => intervalCell(r.result?.metrics.totalM, "p95")),
  col(
    "carry_lateral_m_left_positive",
    "number",
    "m",
    "Offset from the target line at first contact, m, POSITIVE = LEFT.",
    (r) => fromCalculated(r.result?.metrics.carryLateralM),
  ),
  col("total_lateral_m_left_positive", "number", "m", "Offset from the target line at rest, m, POSITIVE = LEFT.", (r) =>
    fromCalculated(r.result?.metrics.totalLateralM),
  ),
  col("apex_height_m", "number", "m", "Maximum ball-centre height above launch height, m.", (r) =>
    fromCalculated(r.result?.metrics.apexHeightM),
  ),
  col("descent_angle_deg", "number", "deg", "Velocity angle below horizontal at first contact, degrees.", (r) =>
    fromCalculated(r.result?.metrics.descentAngleRad),
  ),
  col("flight_time_s", "number", "s", "Air time from launch to first contact, s.", (r) =>
    fromCalculated(r.result?.metrics.flightTimeS),
  ),
  col(
    "curve_m_left_positive",
    "number",
    "m",
    "Landing offset from the start line (launch direction), m, POSITIVE = LEFT.",
    (r) => fromCalculated(r.result?.metrics.curveM),
  ),
  col("bounce_distance_m", "number", "m", "Horizontal distance from first contact to start of rolling, m.", (r) =>
    fromCalculated(r.result?.metrics.bounceDistanceM),
  ),
  col("roll_distance_m", "number", "m", "Horizontal distance covered while rolling, m.", (r) =>
    fromCalculated(r.result?.metrics.rollDistanceM),
  ),
  col("landing_speed_mps", "number", "m/s", "Ball speed at first contact, m/s.", (r) =>
    fromCalculated(r.result?.metrics.landingSpeedMps),
  ),
  col("simulation_confidence", "number", null, "Simulation confidence, 0..1.", (r) => ({
    value: r.result?.simulationConfidence ?? null,
    unit: null,
  })),
  col(
    "physics_model_version",
    "text",
    null,
    "Physics model version that produced the result (launch state's if not simulated).",
    (r) => text(r.result?.physics.physicsModelVersion ?? r.launch.physicsModelVersion),
  ),
  col("ground_model_version", "text", null, "Ground (bounce/roll) model version; empty if not simulated.", (r) =>
    text(r.result?.physics.groundModelVersion ?? null),
  ),
  col("estimator_version", "text", null, "Launch-state estimator version.", (r) => text(r.launch.estimatorVersion)),
  col("calibration_version", "text", null, "Calibration version.", (r) => text(r.launch.calibrationVersion)),
  col("sensor_configuration_version", "text", null, "Sensor configuration version.", (r) =>
    text(r.launch.sensorConfigurationVersion),
  ),
  col(
    "ball_profile_version",
    "text",
    null,
    "Ball aerodynamics profile version used (launch state's if not simulated).",
    (r) => text(r.result?.physics.ballProfileVersion ?? r.launch.ballProfileVersion),
  ),
  col("coordinate_system_version", "text", null, "World coordinate convention version.", (r) =>
    text(r.launch.coordinateSystemVersion),
  ),
  col("software_version", "text", null, "Software version that produced the record.", (r) => text(r.softwareVersion)),
  col("schema_version", "text", null, "Record schema version.", (r) => text(r.schemaVersion)),
  col("warnings", "text", null, "Launch-state then result warnings, '; '-separated.", (r) =>
    text(joinList(uniqueInOrder([...r.launch.warnings, ...(r.result?.warnings ?? [])]))),
  ),
  col("rejection_reasons", "text", null, "Launch-state rejection reasons, '; '-separated.", (r) =>
    text(joinList(r.launch.rejectionReasons)),
  ),
  col("simulation_skipped_reason", "text", null, "Why the shot was not simulated; empty if it was.", (r) =>
    text(r.simulationSkippedReason),
  ),
];

function intervalCell(c: CalculatedValue<number> | undefined, which: "p05" | "p95"): Cell {
  if (c?.interval === undefined) return { value: null, unit: null };
  return { value: c.interval[which], unit: c.interval.unit };
}

/** The fixed SI columns, in output order. */
export const SHOT_CSV_COLUMNS: readonly ShotCsvColumn[] = deepFreeze(
  COLUMN_DEFS.map(({ name, description, kind }) => ({ name, description, kind })),
) as readonly ShotCsvColumn[];

// ---------------------------------------------------------------------------
// Display-unit columns
// ---------------------------------------------------------------------------

/**
 * Display units for the extra CSV columns. Structurally compatible with the @glm/units
 * UnitSystem, so a golfer's full unit system can be passed as-is.
 */
export type CsvDisplayUnits = {
  readonly distance: "yd" | "m";
  readonly speed: "mph" | "km/h" | "m/s";
  /** Unit for apex height (e.g. "ft" in IMPERIAL_GOLF_UNITS); defaults to `distance`. */
  readonly height?: "yd" | "ft" | "m";
};

export type ShotsToCsvOptions = {
  /** Appends converted copies of distance/speed columns (only where the unit differs from SI). */
  readonly displayUnits?: CsvDisplayUnits;
};

const UNIT_TOKEN: Partial<Record<UnitId, string>> = { m: "m", yd: "yd", ft: "ft", "m/s": "mps", mph: "mph", "km/h": "kmh" };

const DISPLAY_CHOICES = {
  distance: ["yd", "m"],
  speed: ["mph", "km/h", "m/s"],
  height: ["yd", "ft", "m"],
} as const;

/** Length columns that are heights (shown in `height` units when given). */
const HEIGHT_COLUMNS: ReadonlySet<string> = new Set(["apex_height_m"]);

/** Display units come from settings/UI state; an unknown choice must not produce "carry_undefined". */
function assertDisplayUnits(units: CsvDisplayUnits): void {
  const check = (field: keyof typeof DISPLAY_CHOICES, value: unknown, optional: boolean): void => {
    if (optional && value === undefined) return;
    if (!(DISPLAY_CHOICES[field] as readonly unknown[]).includes(value)) {
      throw new ShotExportError(
        `shotsToCsv: displayUnits.${field} must be one of ${DISPLAY_CHOICES[field].join(", ")}; got ${JSON.stringify(value)}`,
      );
    }
  };
  check("distance", units.distance, false);
  check("speed", units.speed, false);
  check("height", units.height, true);
}

function displayColumns(units: CsvDisplayUnits | undefined): ColumnDef[] {
  if (units === undefined) return [];
  assertDisplayUnits(units);
  const out: ColumnDef[] = [];
  for (const def of COLUMN_DEFS) {
    let target: UnitId | null = null;
    if (def.columnUnit === "m") {
      const unit = HEIGHT_COLUMNS.has(def.name) ? (units.height ?? units.distance) : units.distance;
      if (unit !== "m") target = unit;
    }
    if (def.columnUnit === "m/s" && units.speed !== "m/s") target = units.speed;
    if (target === null) continue;
    const from = UNIT_TOKEN[def.columnUnit as UnitId] as string;
    const to = UNIT_TOKEN[target] as string;
    // carry_m -> carry_yd, carry_lateral_m_left_positive -> carry_lateral_yd_left_positive
    const name = def.name.replace(new RegExp(`_${from}(?=_|$)`), `_${to}`);
    out.push({
      ...def,
      name,
      columnUnit: target,
      description: `${def.description.replace(/, (m|m\/s)(?=[,.])/, "")} Display copy in ${target}.`,
    });
  }
  return out;
}

/** All columns for the given options (the fixed SI columns, then any display columns). */
export function shotCsvColumns(options: ShotsToCsvOptions = {}): readonly ShotCsvColumn[] {
  return [...SHOT_CSV_COLUMNS, ...displayColumns(options.displayUnits).map(({ name, description, kind }) => ({ name, description, kind }))];
}

// ---------------------------------------------------------------------------
// CSV encoding
// ---------------------------------------------------------------------------

/** Characters that make spreadsheets interpret a cell as a formula (OWASP CSV injection). */
const FORMULA_TRIGGERS = new Set(["=", "+", "-", "@", "\t", "\r"]);

/** RFC 4180 field quoting: quote if the field contains comma, quote, CR or LF. */
export function csvQuote(field: string): string {
  return /[",\r\n]/.test(field) ? `"${field.replace(/"/g, '""')}"` : field;
}

/** Neutralizes spreadsheet formulas in TEXT cells only; numeric cells are never altered. */
export function guardFormula(field: string): string {
  return field.length > 0 && FORMULA_TRIGGERS.has(field[0] as string) ? `'${field}` : field;
}

function formatCell(def: ColumnDef, record: ShotRecord): string {
  const { value, unit } = def.get(record);
  if (value === null) return "";
  if (def.kind === "text") return csvQuote(guardFormula(String(value)));
  if (def.kind === "boolean") return value ? "true" : "false";
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ShotExportError(`shot "${record.shotId}", column ${def.name}: non-finite value ${String(value)}`);
  }
  let out = value;
  if (def.columnUnit !== null) {
    if (unit === null || !isKnownUnit(unit)) {
      throw new ShotExportError(
        `shot "${record.shotId}", column ${def.name}: value has unknown unit "${String(unit)}"; refusing to write it as ${def.columnUnit}`,
      );
    }
    try {
      out = convert(value, unit, def.columnUnit);
    } catch (error) {
      throw new ShotExportError(`shot "${record.shotId}", column ${def.name}: ${(error as Error).message}`);
    }
  }
  // Number#toString is the shortest round-trip representation; normalize -0 to 0.
  return String(out === 0 ? 0 : out);
}

function validateRecords(records: readonly ShotRecord[], context: string): void {
  records.forEach((record, i) => {
    const parsed = ShotRecordSchema.safeParse(record);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      const id = (record as { shotId?: unknown } | null)?.shotId;
      throw new ShotExportError(
        `${context}: records[${i}] (shot ${JSON.stringify(id ?? null)}) is not a valid ShotRecord at ` +
          `${formatIssuePath(first?.path ?? [])}: ${first?.message ?? "invalid"}`,
      );
    }
  });
}

/**
 * Serializes shot records as RFC 4180 CSV (CRLF line ends, header row first, trailing CRLF).
 * Records are validated first; an invalid record or a value with an unknown/incompatible
 * unit throws ShotExportError rather than writing a mislabelled number.
 */
export function shotsToCsv(records: readonly ShotRecord[], options: ShotsToCsvOptions = {}): string {
  validateRecords(records, "shotsToCsv");
  const defs = [...COLUMN_DEFS, ...displayColumns(options.displayUnits)];
  const lines = [defs.map((d) => csvQuote(d.name)).join(",")];
  for (const record of records) lines.push(defs.map((d) => formatCell(d, record)).join(","));
  return `${lines.join("\r\n")}\r\n`;
}

// ---------------------------------------------------------------------------
// JSON export / import
// ---------------------------------------------------------------------------

export const SHOT_EXPORT_FORMAT = "glm-shot-export";
export const SHOT_EXPORT_FORMAT_VERSION = 1;

export type ShotExportMeta = {
  readonly format: typeof SHOT_EXPORT_FORMAT;
  readonly formatVersion: typeof SHOT_EXPORT_FORMAT_VERSION;
  readonly schemaVersion: string;
  readonly coordinateSystemVersion: string;
  readonly exportedUtc: string;
  readonly softwareVersion: string;
};

/**
 * Serializes records in the versioned JSON envelope. `exportedUtc` is an input (not read
 * from a clock) so exports are reproducible. Every record must use this software's schema
 * version and coordinate system: the envelope declares one of each for all of them.
 */
export function shotsToJson(
  records: readonly ShotRecord[],
  meta: { readonly exportedUtc: string; readonly softwareVersion: string },
): string {
  if (!IsoUtcTimestampSchema.safeParse(meta.exportedUtc).success) {
    throw new ShotExportError(`shotsToJson: exportedUtc must be an ISO-8601 UTC timestamp, got ${JSON.stringify(meta.exportedUtc)}`);
  }
  if (typeof meta.softwareVersion !== "string" || meta.softwareVersion.length === 0) {
    throw new ShotExportError("shotsToJson: softwareVersion must be a non-empty string");
  }
  validateRecords(records, "shotsToJson");
  records.forEach((r, i) => {
    if (r.schemaVersion !== SCHEMA_VERSION) {
      throw new ShotExportError(
        `shotsToJson: records[${i}] (shot "${r.shotId}") has schemaVersion "${r.schemaVersion}", ` +
          `but this export declares "${SCHEMA_VERSION}"; migrate the record first`,
      );
    }
    if (r.launch.coordinateSystemVersion !== COORDINATE_SYSTEM_VERSION) {
      throw new ShotExportError(
        `shotsToJson: records[${i}] (shot "${r.shotId}") uses coordinate system "${r.launch.coordinateSystemVersion}", ` +
          `but this export declares "${COORDINATE_SYSTEM_VERSION}"; migrate the record first`,
      );
    }
  });
  const envelope = {
    format: SHOT_EXPORT_FORMAT,
    formatVersion: SHOT_EXPORT_FORMAT_VERSION,
    schemaVersion: SCHEMA_VERSION,
    coordinateSystemVersion: COORDINATE_SYSTEM_VERSION,
    exportedUtc: meta.exportedUtc,
    softwareVersion: meta.softwareVersion,
    records,
  };
  return `${JSON.stringify(envelope, null, 2)}\n`;
}

const EnvelopeSchema = z.strictObject({
  format: z.string(),
  formatVersion: z.number(),
  schemaVersion: z.string(),
  coordinateSystemVersion: z.string(),
  exportedUtc: IsoUtcTimestampSchema,
  softwareVersion: z.string().min(1),
  records: z.array(z.unknown()),
});

/**
 * Parses and fully validates a JSON export. Throws ShotExportError listing every problem
 * found (envelope fields, then each invalid record by index and shot id). Returned records
 * are deep-frozen.
 */
export function parseShotExportJson(text: string): { records: ShotRecord[]; meta: ShotExportMeta } {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (error) {
    throw new ShotExportError(`not a shot export: file is not valid JSON (${(error as Error).message})`);
  }
  const envelope = EnvelopeSchema.safeParse(raw);
  if (!envelope.success) {
    const problems = envelope.error.issues.map((i) => `${formatIssuePath(i.path)}: ${i.message}`);
    throw new ShotExportError(`not a valid shot export envelope: ${problems.join("; ")}`);
  }
  const e = envelope.data;
  const problems: string[] = [];
  if (e.format !== SHOT_EXPORT_FORMAT) {
    problems.push(`format is "${e.format}", expected "${SHOT_EXPORT_FORMAT}"`);
  }
  if (e.formatVersion !== SHOT_EXPORT_FORMAT_VERSION) {
    problems.push(`formatVersion ${e.formatVersion} is not supported (this software reads ${SHOT_EXPORT_FORMAT_VERSION})`);
  }
  if (e.schemaVersion !== SCHEMA_VERSION) {
    problems.push(`schemaVersion "${e.schemaVersion}" differs from this software's "${SCHEMA_VERSION}"; migrate the file first`);
  }
  if (e.coordinateSystemVersion !== COORDINATE_SYSTEM_VERSION) {
    problems.push(
      `coordinateSystemVersion "${e.coordinateSystemVersion}" differs from this software's "${COORDINATE_SYSTEM_VERSION}"; ` +
        "sign conventions may differ, so the records cannot be read as-is",
    );
  }
  if (problems.length > 0) throw new ShotExportError(`unsupported shot export: ${problems.join("; ")}`);

  const records: ShotRecord[] = [];
  const seen = new Set<string>();
  e.records.forEach((candidate, i) => {
    const id = (candidate as { shotId?: unknown } | null)?.shotId;
    const label = `records[${i}] (shot ${JSON.stringify(id ?? null)})`;
    const parsed = ShotRecordSchema.safeParse(candidate);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      const more = parsed.error.issues.length > 1 ? ` (and ${parsed.error.issues.length - 1} more)` : "";
      problems.push(`${label}: ${formatIssuePath(first?.path ?? [])}: ${first?.message ?? "invalid"}${more}`);
      return;
    }
    const record = parsed.data as ShotRecord;
    if (record.schemaVersion !== e.schemaVersion) {
      problems.push(`${label}: schemaVersion "${record.schemaVersion}" does not match the envelope's "${e.schemaVersion}"`);
      return;
    }
    if (record.launch.coordinateSystemVersion !== COORDINATE_SYSTEM_VERSION) {
      problems.push(`${label}: launch.coordinateSystemVersion "${record.launch.coordinateSystemVersion}" does not match the envelope`);
      return;
    }
    if (seen.has(record.shotId)) {
      problems.push(`${label}: duplicate shotId`);
      return;
    }
    seen.add(record.shotId);
    records.push(deepFreeze(record) as ShotRecord);
  });
  if (problems.length > 0) {
    throw new ShotExportError(`shot export contains ${problems.length} invalid record(s): ${problems.join("; ")}`);
  }

  const meta: ShotExportMeta = deepFreeze({
    format: SHOT_EXPORT_FORMAT,
    formatVersion: SHOT_EXPORT_FORMAT_VERSION,
    schemaVersion: e.schemaVersion,
    coordinateSystemVersion: e.coordinateSystemVersion,
    exportedUtc: e.exportedUtc,
    softwareVersion: e.softwareVersion,
  });
  return { records, meta };
}
