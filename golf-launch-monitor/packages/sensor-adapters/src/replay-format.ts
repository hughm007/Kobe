/**
 * Replay file format (JSON Lines, UTF-8):
 *
 *   line 1      {"type":"header", formatVersion, coordinateSystemVersion, dataOrigin, ...}
 *   line 2..N   {"type":"observation","observation":{...RawSensorObservation}}
 *
 * The header appears exactly once, on line 1. Blank lines are allowed only at the end of the
 * file. Every line is validated against the shared zod schemas. The format and coordinate
 * system versions must match this build exactly: an older or newer file is rejected with an
 * actionable error rather than silently migrated. Provenance must be consistent: a "live" or
 * "replay" file must describe a camera/radar/hybrid sensor and may not contain synthetic or
 * manual triggers or synthetic spin (see HARDWARE_SENSOR_KINDS below).
 */
import {
  COORDINATE_SYSTEM_VERSION,
  deepFreeze,
  REPLAY_FORMAT_VERSION,
  ReplayHeaderSchema,
  ReplayObservationRecordSchema,
} from "@glm/shared-types";
import type {
  CalibrationRecord,
  DataOrigin,
  IsoUtcTimestamp,
  RawSensorObservation,
  ReplayHeader,
  ReplayObservationRecord,
  SensorConfiguration,
  SensorKind,
  SyntheticTruth,
  TriggerSource,
} from "@glm/shared-types";

export type ReplayContent = {
  readonly header: ReplayHeader;
  readonly observations: readonly RawSensorObservation[];
};

export type ParsedReplay = {
  header: ReplayHeader;
  observations: RawSensorObservation[];
  /** Non-fatal findings (e.g. non-monotonic timestamps), each naming its line. */
  warnings: string[];
};

export type ReplayIssue = { readonly path: string; readonly message: string };

/**
 * Thrown for any malformed or incompatible replay. `lineNumber` is 1-based (null = whole
 * file); `source` is the file path when known. The message names both.
 */
export class ReplayFormatError extends Error {
  override readonly name = "ReplayFormatError";
  readonly lineNumber: number | null;
  readonly issues: readonly ReplayIssue[];
  /** The problem description without the location prefix. */
  readonly detail: string;
  readonly source: string | null;

  constructor(detail: string, lineNumber: number | null, issues: readonly ReplayIssue[] = [], source: string | null = null) {
    const where = lineNumber === null ? "Replay" : `Replay line ${lineNumber}`;
    super(`${source === null ? "" : `${source}: `}${where}: ${detail}`);
    this.lineNumber = lineNumber;
    this.issues = issues;
    this.detail = detail;
    this.source = source;
  }
}

type ZodLikeIssue = { readonly path: readonly PropertyKey[]; readonly message: string };

function toIssues(issues: readonly ZodLikeIssue[]): ReplayIssue[] {
  return issues.map((issue) => ({
    path: issue.path.length === 0 ? "(root)" : issue.path.map((p) => String(p)).join("."),
    message: issue.message,
  }));
}

function describeIssues(issues: readonly ReplayIssue[]): string {
  return issues.map((i) => `${i.path}: ${i.message}`).join("; ");
}

/**
 * Version checks shared by reading and writing. Versions are checked before
 * full schema validation so an old file gets the actionable "wrong version" message rather
 * than a list of unrelated schema differences.
 */
function checkHeaderVersions(raw: Record<string, unknown>, lineNumber: number): void {
  if (raw.formatVersion !== REPLAY_FORMAT_VERSION) {
    throw new ReplayFormatError(
      `unsupported formatVersion ${JSON.stringify(raw.formatVersion)}; this reader supports only ${JSON.stringify(REPLAY_FORMAT_VERSION)}. ` +
        "Replays are never migrated silently: convert the file with an explicit migration step or re-record it.",
      lineNumber,
      [{ path: "formatVersion", message: `expected ${REPLAY_FORMAT_VERSION}` }],
    );
  }
  if (raw.coordinateSystemVersion !== COORDINATE_SYSTEM_VERSION) {
    throw new ReplayFormatError(
      `coordinateSystemVersion ${JSON.stringify(raw.coordinateSystemVersion)} does not match ${JSON.stringify(COORDINATE_SYSTEM_VERSION)} ` +
        "(docs/coordinate-system.md). Its observations would be read in the wrong frame; transform the file to " +
        `${COORDINATE_SYSTEM_VERSION} with an explicit migration step. No silent migration is performed.`,
      lineNumber,
      [{ path: "coordinateSystemVersion", message: `expected ${COORDINATE_SYSTEM_VERSION}` }],
    );
  }
}

/**
 * Provenance rules. A "live" recording (or a "replay" of one) is played back as measured data:
 * downstream labels its values measured-camera/radar/hybrid from sensorConfiguration.kind. So a
 * live/replay file must describe a physical sensor and may not carry observations that are
 * generated or typed in by construction (synthetic/manual triggers, synthetic spin). Without
 * these checks, synthetic observations written under a live header would be laundered into
 * "measured" values.
 */
const HARDWARE_SENSOR_KINDS: readonly SensorKind[] = ["camera", "radar", "hybrid"];
const NON_MEASURED_TRIGGER_SOURCES: readonly TriggerSource[] = ["synthetic", "manual"];

function recordsMeasurements(dataOrigin: DataOrigin): boolean {
  return dataOrigin === "live" || dataOrigin === "replay";
}

function checkObservationProvenance(header: ReplayHeader, observation: RawSensorObservation, lineNumber: number): void {
  if (!recordsMeasurements(header.dataOrigin)) return;
  const origin = JSON.stringify(header.dataOrigin);
  if (observation.kind === "trigger" && NON_MEASURED_TRIGGER_SOURCES.includes(observation.triggerSource)) {
    throw new ReplayFormatError(
      `a ${origin} replay cannot contain a ${JSON.stringify(observation.triggerSource)} trigger: it was not produced by a physical sensor. ` +
        'Write generated or hand-entered data with dataOrigin "synthetic" or "manual".',
      lineNumber,
      [{ path: "observation.triggerSource", message: `not allowed when dataOrigin is ${header.dataOrigin}` }],
    );
  }
  if (observation.kind === "spin" && observation.method === "synthetic") {
    throw new ReplayFormatError(
      `a ${origin} replay cannot contain a spin observation with method "synthetic": it is not a measurement. ` +
        'Write generated or hand-entered data with dataOrigin "synthetic" or "manual".',
      lineNumber,
      [{ path: "observation.method", message: `"synthetic" is not allowed when dataOrigin is ${header.dataOrigin}` }],
    );
  }
}

function validateHeader(raw: unknown, lineNumber: number): ReplayHeader {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw) || (raw as { type?: unknown }).type !== "header") {
    const found = raw !== null && typeof raw === "object" ? (raw as { type?: unknown }).type : raw;
    throw new ReplayFormatError(
      `the first line must be the replay header (an object with "type":"header"); found ${JSON.stringify(found) ?? String(found)}`,
      lineNumber,
      [{ path: "type", message: 'expected "header"' }],
    );
  }
  checkHeaderVersions(raw as Record<string, unknown>, lineNumber);
  const parsed = ReplayHeaderSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = toIssues(parsed.error.issues);
    throw new ReplayFormatError(`header failed schema validation: ${describeIssues(issues)}`, lineNumber, issues);
  }
  const header: ReplayHeader = parsed.data;
  if (header.syntheticTruth !== null && header.dataOrigin !== "synthetic") {
    throw new ReplayFormatError(
      `syntheticTruth is only allowed in synthetic replays, but dataOrigin is ${JSON.stringify(header.dataOrigin)}`,
      lineNumber,
      [{ path: "syntheticTruth", message: "must be null unless dataOrigin is synthetic" }],
    );
  }
  if (recordsMeasurements(header.dataOrigin)) {
    const configuration = header.sensorConfiguration;
    if (!HARDWARE_SENSOR_KINDS.includes(configuration.kind)) {
      throw new ReplayFormatError(
        `dataOrigin ${JSON.stringify(header.dataOrigin)} needs the configuration of the physical sensor that recorded the data ` +
          `(kind camera, radar or hybrid), but sensorConfiguration.kind is ${JSON.stringify(configuration.kind)}. ` +
          'Label generated or hand-entered data with dataOrigin "synthetic" or "manual"; a replay header describes the original device, never "replay".',
        lineNumber,
        [{ path: "sensorConfiguration.kind", message: "must be camera, radar or hybrid when dataOrigin is live or replay" }],
      );
    }
    const index = configuration.triggerSources.findIndex((source) => NON_MEASURED_TRIGGER_SOURCES.includes(source));
    if (index >= 0) {
      throw new ReplayFormatError(
        `dataOrigin ${JSON.stringify(header.dataOrigin)} cannot declare the ${JSON.stringify(configuration.triggerSources[index])} trigger source: ` +
          'synthetic and manual triggers do not come from a physical sensor. Use dataOrigin "synthetic" or "manual".',
        lineNumber,
        [{ path: `sensorConfiguration.triggerSources.${index}`, message: "synthetic/manual trigger sources need dataOrigin synthetic or manual" }],
      );
    }
  }
  if (header.calibration !== null && header.calibration.coordinateSystemVersion !== COORDINATE_SYSTEM_VERSION) {
    throw new ReplayFormatError(
      `calibration ${JSON.stringify(header.calibration.version)} uses coordinateSystemVersion ` +
        `${JSON.stringify(header.calibration.coordinateSystemVersion)}, expected ${JSON.stringify(COORDINATE_SYSTEM_VERSION)}`,
      lineNumber,
      [{ path: "calibration.coordinateSystemVersion", message: `expected ${COORDINATE_SYSTEM_VERSION}` }],
    );
  }
  return header;
}

function validateObservationRecord(raw: unknown, lineNumber: number): RawSensorObservation {
  if (raw !== null && typeof raw === "object" && (raw as { type?: unknown }).type === "header") {
    throw new ReplayFormatError("duplicate header: the header must appear exactly once, on line 1", lineNumber, [
      { path: "type", message: 'unexpected "header"' },
    ]);
  }
  const parsed = ReplayObservationRecordSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = toIssues(parsed.error.issues);
    throw new ReplayFormatError(`observation record failed schema validation: ${describeIssues(issues)}`, lineNumber, issues);
  }
  return parsed.data.observation;
}

/** Per-sensor monotonicity findings. They are warnings: the file order is preserved as recorded. */
class MonotonicityTracker {
  private readonly last = new Map<string, { timestampS: number; sequence: number; lineNumber: number }>();
  readonly warnings: string[] = [];

  check(observation: RawSensorObservation, lineNumber: number): void {
    const previous = this.last.get(observation.sensorId);
    if (previous !== undefined) {
      if (observation.timestampS < previous.timestampS) {
        this.warnings.push(
          `line ${lineNumber}: timestamp ${observation.timestampS} s of sensor ${JSON.stringify(observation.sensorId)} is earlier than ` +
            `${previous.timestampS} s on line ${previous.lineNumber} (non-monotonic timestamps; file order kept).`,
        );
      }
      if (observation.sequence <= previous.sequence) {
        this.warnings.push(
          `line ${lineNumber}: sequence ${observation.sequence} of sensor ${JSON.stringify(observation.sensorId)} does not increase ` +
            `after ${previous.sequence} on line ${previous.lineNumber}.`,
        );
      }
    }
    this.last.set(observation.sensorId, { timestampS: observation.timestampS, sequence: observation.sequence, lineNumber });
  }
}

/** Parse and validate a replay file's text. Throws ReplayFormatError naming the 1-based line. */
export function parseReplay(text: string): ParsedReplay {
  if (typeof text !== "string") throw new TypeError("parseReplay: text must be a string");
  const body = text.startsWith("﻿") ? text.slice(1) : text;
  const lines = body.split("\n").map((line) => (line.endsWith("\r") ? line.slice(0, -1) : line));
  let lastContentIndex = lines.length - 1;
  while (lastContentIndex >= 0 && lines[lastContentIndex]!.trim() === "") lastContentIndex -= 1;
  if (lastContentIndex < 0) {
    throw new ReplayFormatError("file is empty; line 1 must be the replay header", 1);
  }

  const parseJson = (index: number): unknown => {
    const line = lines[index]!;
    if (line.trim() === "") {
      throw new ReplayFormatError("blank line inside the replay (blank lines are allowed only at the end of the file)", index + 1);
    }
    try {
      return JSON.parse(line) as unknown;
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new ReplayFormatError(`invalid JSON: ${reason}`, index + 1);
    }
  };

  const header = validateHeader(parseJson(0), 1);
  const observations: RawSensorObservation[] = [];
  const tracker = new MonotonicityTracker();
  for (let i = 1; i <= lastContentIndex; i++) {
    const observation = validateObservationRecord(parseJson(i), i + 1);
    checkObservationProvenance(header, observation, i + 1);
    tracker.check(observation, i + 1);
    deepFreeze(observation);
    observations.push(observation);
  }
  deepFreeze(header);
  return { header, observations, warnings: tracker.warnings };
}

/**
 * Serialize a replay to JSON Lines (one record per line, trailing newline). The content is
 * validated exactly as parseReplay would validate it, so a written file is always readable;
 * errors name the line the offending record would occupy.
 */
export function serializeReplay(replay: ReplayContent): string {
  const header = validateHeader(replay.header, 1);
  const lines = [JSON.stringify(header)];
  replay.observations.forEach((observation, i) => {
    const record: ReplayObservationRecord = { type: "observation", observation };
    validateObservationRecord(record, i + 2);
    checkObservationProvenance(header, observation, i + 2);
    lines.push(JSON.stringify(record));
  });
  return `${lines.join("\n")}\n`;
}

/**
 * Check in-memory replay content (e.g. handed to ReplaySensorAdapter without going through
 * parseReplay) with the same header rules as parseReplay (versions, schema, origin
 * consistency) and the same per-observation provenance rules. Observation schemas are not
 * re-validated here. Errors name the line each record would occupy in a file. Returns the
 * header as validated.
 */
export function checkReplayContent(replay: ReplayContent): ReplayHeader {
  const header = validateHeader(replay.header, 1);
  replay.observations.forEach((observation, i) => checkObservationProvenance(header, observation, i + 2));
  return header;
}

export type CreateReplayHeaderInput = {
  readonly dataOrigin: DataOrigin;
  readonly description: string;
  readonly sensorConfiguration: SensorConfiguration;
  readonly calibration: CalibrationRecord | null;
  readonly syntheticTruth: readonly SyntheticTruth[] | null;
  /** Passed in by the caller: library code never reads the wall clock. */
  readonly createdUtc: IsoUtcTimestamp;
};

/** Build a validated, frozen header stamped with the current format and coordinate versions. */
export function createReplayHeader(input: CreateReplayHeaderInput): ReplayHeader {
  const header: ReplayHeader = {
    type: "header",
    formatVersion: REPLAY_FORMAT_VERSION,
    coordinateSystemVersion: COORDINATE_SYSTEM_VERSION,
    dataOrigin: input.dataOrigin,
    createdUtc: input.createdUtc,
    description: input.description,
    sensorConfiguration: input.sensorConfiguration,
    calibration: input.calibration,
    syntheticTruth: input.syntheticTruth === null ? null : [...input.syntheticTruth],
  };
  return deepFreeze(validateHeader(header, 1)) as ReplayHeader;
}
