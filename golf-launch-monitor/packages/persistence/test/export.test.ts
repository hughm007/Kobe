import { describe, expect, it } from "vitest";
import { COORDINATE_SYSTEM_VERSION, SCHEMA_VERSION, type ShotRecord } from "@glm/shared-types";
import { IMPERIAL_GOLF_UNITS } from "@glm/units";
import {
  csvQuote,
  type CsvDisplayUnits,
  guardFormula,
  parseShotExportJson,
  SHOT_CSV_COLUMNS,
  shotCsvColumns,
  ShotExportError,
  shotsToCsv,
  shotsToJson,
} from "../src/index";
import { calculated, makeShot } from "./fixtures";

/** Minimal strict RFC 4180 parser (test oracle). Requires CRLF record separators. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let i = 0;
  let quoted = false;
  while (i < text.length) {
    const ch = text[i] as string;
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i += 2;
      } else if (ch === '"') {
        quoted = false;
        i += 1;
      } else {
        field += ch;
        i += 1;
      }
    } else if (ch === '"') {
      if (field !== "") throw new Error(`quote inside unquoted field at ${i}`);
      quoted = true;
      i += 1;
    } else if (ch === ",") {
      row.push(field);
      field = "";
      i += 1;
    } else if (ch === "\r" && text[i + 1] === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i += 2;
    } else if (ch === "\r" || ch === "\n") {
      throw new Error(`bare line break outside quotes at ${i}`);
    } else {
      field += ch;
      i += 1;
    }
  }
  if (quoted) throw new Error("unterminated quote");
  if (field !== "" || row.length > 0) throw new Error("missing trailing CRLF");
  return rows;
}

function table(csv: string): Record<string, string>[] {
  const [header, ...rows] = parseCsv(csv);
  return rows.map((r) => {
    expect(r.length).toBe(header?.length);
    return Object.fromEntries((header ?? []).map((h, i) => [h, r[i] as string]));
  });
}

const REQUIRED_COLUMNS = [
  "shot_id", "session_id", "created_utc", "data_origin", "player_id", "club_id", "validity", "overall_confidence",
  "spin_mode", "ball_speed_mps", "ball_speed_source", "vertical_launch_deg", "vertical_launch_source",
  "horizontal_launch_deg_left_positive", "horizontal_launch_source", "total_spin_rpm", "total_spin_source",
  "spin_axis_deg_right_positive", "spin_axis_source", "carry_m", "carry_p05_m", "carry_p95_m",
  "carry_depends_on_estimated", "carry_depends_on_synthetic", "total_m", "total_p05_m", "total_p95_m",
  "carry_lateral_m_left_positive", "total_lateral_m_left_positive", "apex_height_m", "descent_angle_deg",
  "flight_time_s", "curve_m_left_positive", "bounce_distance_m", "roll_distance_m", "landing_speed_mps",
  "simulation_confidence", "physics_model_version", "estimator_version", "calibration_version",
  "sensor_configuration_version", "ball_profile_version", "coordinate_system_version", "warnings",
  "rejection_reasons", "simulation_skipped_reason",
];

describe("SHOT_CSV_COLUMNS", () => {
  it("contains every required column exactly once, each with a description", () => {
    const names = SHOT_CSV_COLUMNS.map((c) => c.name);
    for (const required of REQUIRED_COLUMNS) expect(names).toContain(required);
    expect(new Set(names).size).toBe(names.length);
    for (const c of SHOT_CSV_COLUMNS) expect(c.description.length).toBeGreaterThan(5);
    expect(Object.isFrozen(SHOT_CSV_COLUMNS)).toBe(true);
  });

  it("states the sign convention in every signed lateral/horizontal/axis column name", () => {
    const signed = SHOT_CSV_COLUMNS.filter((c) => /lateral|horizontal|curve|spin_axis_deg/.test(c.name) && c.kind === "number");
    expect(signed.map((c) => c.name)).toEqual([
      "horizontal_launch_deg_left_positive",
      "spin_axis_deg_right_positive",
      "carry_lateral_m_left_positive",
      "total_lateral_m_left_positive",
      "curve_m_left_positive",
    ]);
  });
});

describe("shotsToCsv", () => {
  it("writes a header equal to SHOT_CSV_COLUMNS, CRLF line ends, and a trailing CRLF", () => {
    const csv = shotsToCsv([makeShot({ shotId: "a", sessionId: "s" }), makeShot({ shotId: "b", sessionId: "s" })]);
    const lines = csv.split("\r\n");
    expect(lines).toHaveLength(4); // header, 2 rows, "" after the final CRLF
    expect(lines[3]).toBe("");
    expect(lines[0]).toBe(SHOT_CSV_COLUMNS.map((c) => c.name).join(","));
    expect(csv.replace(/\r\n/g, "")).not.toMatch(/[\r\n]/);
    expect(shotsToCsv([])).toBe(`${SHOT_CSV_COLUMNS.map((c) => c.name).join(",")}\r\n`);
  });

  it("writes SI / contract values with the documented conversions", () => {
    const [row] = table(shotsToCsv([makeShot({ shotId: "a", sessionId: "s", playerId: "p1" })]));
    expect(row?.shot_id).toBe("a");
    expect(row?.player_id).toBe("p1");
    expect(row?.ball_speed_mps).toBe("52.21");
    expect(row?.ball_speed_source).toBe("synthetic");
    expect(row?.vertical_launch_deg).toBe("16.7"); // LaunchState already in degrees: unchanged
    expect(row?.total_spin_rpm).toBe("5733");
    expect(row?.spin_axis_deg_right_positive).toBe("-2.25");
    expect(row?.carry_m).toBe("150.25");
    expect(row?.carry_p05_m).toBe("145.5");
    expect(row?.carry_p95_m).toBe("155");
    expect(row?.carry_depends_on_estimated).toBe("false");
    expect(row?.carry_depends_on_synthetic).toBe("true");
    expect(row?.flight_time_s).toBe("6.25");
    // ShotMetrics stores radians: pi/4 rad must be written as 45 degrees.
    expect(Number(row?.descent_angle_deg)).toBeCloseTo(45, 12);
    expect(row?.simulation_confidence).toBe("0.75");
    expect(row?.ground_model_version).toBe("test-ground-0");
    expect(row?.coordinate_system_version).toBe(COORDINATE_SYSTEM_VERSION);
  });

  it("never alters negative numbers in numeric columns", () => {
    const [row] = table(shotsToCsv([makeShot({ shotId: "a", sessionId: "s" })]));
    expect(row?.horizontal_launch_deg_left_positive).toBe("-1.5");
    expect(row?.carry_lateral_m_left_positive).toBe("-3.5");
    expect(row?.curve_m_left_positive).toBe("-1.25");
  });

  it("writes unavailable values as empty cells, never null or NaN", () => {
    const shot = makeShot({
      shotId: "nores",
      sessionId: "s",
      withResult: false,
      simulationSkippedReason: "spin unavailable",
      launchOverrides: {
        totalSpinRpm: { value: null, unit: "rpm", source: "unavailable", confidence: 0, qualityFlags: [] },
        clubId: null,
      },
    });
    const csv = shotsToCsv([shot]);
    expect(csv).not.toMatch(/null|NaN|undefined/);
    const [row] = table(csv);
    expect(row?.total_spin_rpm).toBe("");
    expect(row?.total_spin_source).toBe("unavailable");
    expect(row?.club_id).toBe("");
    expect(row?.player_id).toBe("");
    for (const c of ["carry_m", "carry_p05_m", "total_m", "descent_angle_deg", "simulation_confidence"]) {
      expect(row?.[c]).toBe("");
    }
    expect(row?.carry_depends_on_estimated).toBe("");
    expect(row?.ground_model_version).toBe("");
    expect(row?.physics_model_version).toBe("test-physics-0"); // falls back to the launch state's
    expect(row?.simulation_skipped_reason).toBe("spin unavailable");
  });

  it("quotes fields containing comma, quote, CR or LF and doubles embedded quotes", () => {
    const shot = makeShot({
      shotId: "q",
      sessionId: "s",
      launchOverrides: { warnings: ['ball "partly" occluded, frame 3'], rejectionReasons: ["line1\nline2", "cr\rhere"] },
      resultWarnings: ["outside, profile range"],
    });
    const csv = shotsToCsv([shot]);
    expect(csv).toContain('"ball ""partly"" occluded, frame 3; outside, profile range"');
    const [row] = table(csv);
    expect(row?.warnings).toBe('ball "partly" occluded, frame 3; outside, profile range');
    expect(row?.rejection_reasons).toBe("line1\nline2; cr\rhere");
    expect(csvQuote("plain")).toBe("plain");
    expect(csvQuote('a"b')).toBe('"a""b"');
    expect(csvQuote("a,b")).toBe('"a,b"');
  });

  it("neutralizes formula injection in text cells only", () => {
    const shot = makeShot({
      shotId: "=1+1",
      sessionId: "@SUM(A1)",
      playerId: "+cmd",
      launchOverrides: { clubId: "-2+3", warnings: ["\tTAB", '=HYPERLINK("http://x","y")'] },
    });
    const [row] = table(shotsToCsv([shot]));
    expect(row?.shot_id).toBe("'=1+1");
    expect(row?.session_id).toBe("'@SUM(A1)");
    expect(row?.player_id).toBe("'+cmd");
    expect(row?.club_id).toBe("'-2+3");
    expect(row?.warnings).toBe("'\tTAB; =HYPERLINK(\"http://x\",\"y\")");
    expect(row?.horizontal_launch_deg_left_positive).toBe("-1.5");
    expect(guardFormula("\rx")).toBe("'\rx");
    expect(guardFormula("safe=1")).toBe("safe=1");
    expect(guardFormula("")).toBe("");
  });

  it("appends display-unit columns computed with exact conversions", () => {
    const options = { displayUnits: { distance: "yd", speed: "mph" } } as const;
    const csv = shotsToCsv([makeShot({ shotId: "a", sessionId: "s" })], options);
    const header = parseCsv(csv)[0];
    expect(header).toEqual(shotCsvColumns(options).map((c) => c.name));
    const extra = header?.slice(SHOT_CSV_COLUMNS.length);
    expect(extra).toEqual([
      "ball_speed_mph",
      "carry_yd",
      "carry_p05_yd",
      "carry_p95_yd",
      "total_yd",
      "total_p05_yd",
      "total_p95_yd",
      "carry_lateral_yd_left_positive",
      "total_lateral_yd_left_positive",
      "apex_height_yd",
      "curve_yd_left_positive",
      "bounce_distance_yd",
      "roll_distance_yd",
      "landing_speed_mph",
    ]);
    const [row] = table(csv);
    expect(Number(row?.carry_yd)).toBeCloseTo(150.25 / 0.9144, 10);
    expect(Number(row?.carry_lateral_yd_left_positive)).toBeCloseTo(-3.5 / 0.9144, 10);
    expect(Number(row?.ball_speed_mph)).toBeCloseTo(52.21 / 0.44704, 10);
    expect(row?.carry_m).toBe("150.25"); // SI columns unchanged

    const kmh = table(shotsToCsv([makeShot({ shotId: "a", sessionId: "s" })], { displayUnits: { distance: "m", speed: "km/h" } }));
    expect(Object.keys(kmh[0] ?? {}).slice(SHOT_CSV_COLUMNS.length)).toEqual(["ball_speed_kmh", "landing_speed_kmh"]);
    expect(Number(kmh[0]?.ball_speed_kmh)).toBeCloseTo(52.21 * 3.6, 10);

    expect(shotCsvColumns({ displayUnits: { distance: "m", speed: "m/s" } })).toHaveLength(SHOT_CSV_COLUMNS.length);
  });

  it("uses the height unit of a full unit system for apex height", () => {
    const csv = shotsToCsv([makeShot({ shotId: "a", sessionId: "s" })], { displayUnits: IMPERIAL_GOLF_UNITS });
    const [row] = table(csv);
    const extra = parseCsv(csv)[0]?.slice(SHOT_CSV_COLUMNS.length);
    expect(extra).toContain("apex_height_ft");
    expect(extra).not.toContain("apex_height_yd");
    expect(extra).toContain("carry_yd");
    expect(Number(row?.apex_height_ft)).toBeCloseTo(28.5 / 0.3048, 10);
    const metricHeight = shotCsvColumns({ displayUnits: { distance: "yd", speed: "mph", height: "m" } }).map((c) => c.name);
    expect(metricHeight).not.toContain("apex_height_yd");
    expect(metricHeight).toContain("carry_yd");
  });

  it("rejects unknown display units instead of writing columns named *_undefined", () => {
    const shot = makeShot({ shotId: "a", sessionId: "s" });
    const bad = (u: unknown) => ({ displayUnits: u as CsvDisplayUnits });
    expect(() => shotsToCsv([shot], bad({ distance: "ft", speed: "mph" }))).toThrow(
      /displayUnits\.distance must be one of yd, m; got "ft"/,
    );
    expect(() => shotsToCsv([shot], bad({ distance: "yd" }))).toThrow(/displayUnits\.speed must be one of/);
    expect(() => shotCsvColumns(bad({ distance: "m", speed: "m/s", height: "km" }))).toThrow(ShotExportError);
  });

  it("converts from a value's declared unit and refuses unknown or incompatible units", () => {
    const inFeet = makeShot({ shotId: "ft", sessionId: "s", metricOverrides: { apexHeightM: calculated(100, "ft") } });
    expect(table(shotsToCsv([inFeet]))[0]?.apex_height_m).toBe(String(100 * 0.3048));
    const unknown = makeShot({ shotId: "u", sessionId: "s", metricOverrides: { carryM: calculated(150, "furlong") } });
    expect(() => shotsToCsv([unknown])).toThrow(/shot "u", column carry_m: value has unknown unit "furlong"/);
    const wrongDim = makeShot({ shotId: "w", sessionId: "s", metricOverrides: { carryM: calculated(150, "mph") } });
    expect(() => shotsToCsv([wrongDim])).toThrow(ShotExportError);
    const protoName = makeShot({ shotId: "p", sessionId: "s", metricOverrides: { carryM: calculated(150, "constructor") } });
    expect(() => shotsToCsv([protoName])).toThrow(/column carry_m: value has unknown unit "constructor"/);
  });

  it("refuses to export a record that fails schema validation", () => {
    const bad = structuredClone(makeShot({ shotId: "bad", sessionId: "s" }));
    (bad.launch as { overallConfidence: number }).overallConfidence = Number.NaN;
    expect(() => shotsToCsv([bad])).toThrow(/records\[0\] \(shot "bad"\).*launch\.overallConfidence/);
  });
});

describe("JSON export", () => {
  const META = { exportedUtc: "2026-10-01T18:00:00.000Z", softwareVersion: "0.1.0-test" };

  it("writes the versioned envelope and round-trips records exactly", () => {
    const shots = [
      makeShot({ shotId: "a", sessionId: "s", playerId: "p" }),
      makeShot({ shotId: "b", sessionId: "s", withResult: false }),
    ];
    const text = shotsToJson(shots, META);
    const envelope = JSON.parse(text) as Record<string, unknown>;
    expect(Object.keys(envelope)).toEqual([
      "format",
      "formatVersion",
      "schemaVersion",
      "coordinateSystemVersion",
      "exportedUtc",
      "softwareVersion",
      "records",
    ]);
    expect(envelope.format).toBe("glm-shot-export");
    expect(envelope.formatVersion).toBe(1);
    expect(envelope.schemaVersion).toBe(SCHEMA_VERSION);
    expect(envelope.coordinateSystemVersion).toBe(COORDINATE_SYSTEM_VERSION);
    expect(envelope.exportedUtc).toBe(META.exportedUtc);
    expect(shotsToJson(shots, META)).toBe(text); // deterministic

    const parsed = parseShotExportJson(text);
    expect(parsed.records).toEqual(shots);
    expect(Object.isFrozen(parsed.records[0]?.launch)).toBe(true);
    expect(parsed.meta).toEqual({
      format: "glm-shot-export",
      formatVersion: 1,
      schemaVersion: SCHEMA_VERSION,
      coordinateSystemVersion: COORDINATE_SYSTEM_VERSION,
      exportedUtc: META.exportedUtc,
      softwareVersion: META.softwareVersion,
    });
  });

  it("rejects bad export metadata and foreign coordinate systems on export", () => {
    const shot = makeShot({ shotId: "a", sessionId: "s" });
    expect(() => shotsToJson([shot], { ...META, exportedUtc: "now" })).toThrow(/exportedUtc/);
    expect(() => shotsToJson([shot], { ...META, softwareVersion: "" })).toThrow(/softwareVersion/);
    const old = makeShot({ shotId: "old", sessionId: "s", launchOverrides: { coordinateSystemVersion: "glm-world-0.9" } });
    expect(() => shotsToJson([old], META)).toThrow(/shot "old".*glm-world-0\.9/);
    const oldSchema = { ...makeShot({ shotId: "v0", sessionId: "s" }), schemaVersion: "glm-schema-0.0.1" };
    expect(() => shotsToJson([oldSchema], META)).toThrow(/shot "v0"\) has schemaVersion "glm-schema-0\.0\.1".*migrate the record first/);
  });

  it("rejects an imported record whose schemaVersion differs from the envelope's", () => {
    const e = JSON.parse(shotsToJson([makeShot({ shotId: "a", sessionId: "s" })], META)) as { records: { schemaVersion: string }[] };
    (e.records[0] as { schemaVersion: string }).schemaVersion = "glm-schema-0.0.1";
    expect(() => parseShotExportJson(JSON.stringify(e))).toThrow(
      /records\[0\] \(shot "a"\): schemaVersion "glm-schema-0\.0\.1" does not match the envelope's/,
    );
  });

  it("gives actionable errors for malformed files", () => {
    const good = shotsToJson([makeShot({ shotId: "a", sessionId: "s" })], META);
    const edit = (f: (e: Record<string, unknown>) => void): string => {
      const e = JSON.parse(good) as Record<string, unknown>;
      f(e);
      return JSON.stringify(e);
    };
    expect(() => parseShotExportJson("{oops")).toThrow(/not valid JSON/);
    expect(() => parseShotExportJson("[]")).toThrow(/not a valid shot export envelope/);
    expect(() => parseShotExportJson(edit((e) => delete e.records))).toThrow(/records/);
    expect(() => parseShotExportJson(edit((e) => (e.format = "other")))).toThrow(/format is "other"/);
    expect(() => parseShotExportJson(edit((e) => (e.formatVersion = 2)))).toThrow(/formatVersion 2 is not supported/);
    expect(() => parseShotExportJson(edit((e) => (e.schemaVersion = "glm-schema-9")))).toThrow(/migrate the file first/);
    expect(() => parseShotExportJson(edit((e) => (e.coordinateSystemVersion = "x")))).toThrow(/sign conventions/);
  });

  it("validates every record and reports each problem by index and shot id", () => {
    const text = shotsToJson(
      [makeShot({ shotId: "a", sessionId: "s" }), makeShot({ shotId: "b", sessionId: "s" }), makeShot({ shotId: "c", sessionId: "s" })],
      META,
    );
    const e = JSON.parse(text) as { records: Record<string, unknown>[] };
    (e.records[0] as { launch: { validity: string } }).launch.validity = "great";
    (e.records[2] as { shotId: string }).shotId = "b";
    let message = "";
    try {
      parseShotExportJson(JSON.stringify(e));
    } catch (error) {
      expect(error).toBeInstanceOf(ShotExportError);
      message = (error as Error).message;
    }
    expect(message).toMatch(/2 invalid record\(s\)/);
    expect(message).toMatch(/records\[0\] \(shot "a"\): launch\.validity/);
    expect(message).toMatch(/records\[2\] \(shot "b"\): duplicate shotId/);
  });

  it("export -> import -> CSV yields the same CSV as exporting the originals", () => {
    const shots: ShotRecord[] = [makeShot({ shotId: "a", sessionId: "s" }), makeShot({ shotId: "b", sessionId: "s", withResult: false })];
    const reimported = parseShotExportJson(shotsToJson(shots, META)).records;
    expect(shotsToCsv(reimported)).toBe(shotsToCsv(shots));
  });
});
