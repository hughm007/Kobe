import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { COORDINATE_SYSTEM_VERSION, REPLAY_FORMAT_VERSION } from "@glm/shared-types";
import type { CalibrationRecord, RawSensorObservation, SensorConfiguration } from "@glm/shared-types";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createReplayHeader,
  defaultSyntheticSensorConfiguration,
  generateSyntheticSession,
  parseReplay,
  ReentrantEmissionError,
  ReplayFormatError,
  ReplaySensorAdapter,
  replayShotEndIndices,
  SensorStateError,
  serializeReplay,
  splitReplayIntoShots,
  SyntheticSensorAdapter,
} from "../src/index";
import type { ReplayContent } from "../src/index";
import { readReplayFile, writeReplayFile } from "../src/node";
import { makeSpec, ofKind, straightLine } from "./helpers";

const CREATED = "2026-10-01T18:00:00.000Z";

const SESSION = generateSyntheticSession(
  [
    makeSpec({ label: "a", launchTimeS: 1, seed: 10 }),
    makeSpec(
      { label: "b", launchTimeS: 1, seed: 11 },
      {
        // Two trigger sources: one trigger group, still one shot.
        triggerSources: [
          { source: "microphone", latencyS: 0.001, latencySigmaS: 0, confidence: 0.9 },
          { source: "ball-motion", latencyS: 0.004, latencySigmaS: 0, confidence: 0.7 },
        ],
      },
    ),
    makeSpec({ label: "c", launchTimeS: 1, seed: 12 }, { spin: null, dropoutProbability: 0.2 }),
  ],
  straightLine,
  { sensorId: "synthetic-1" },
);

function syntheticReplay(): ReplayContent {
  return {
    header: createReplayHeader({
      dataOrigin: "synthetic",
      description: "Synthetic test session (3 shots).",
      sensorConfiguration: defaultSyntheticSensorConfiguration("synthetic-1"),
      calibration: null,
      syntheticTruth: SESSION.truths,
      createdUtc: CREATED,
    }),
    observations: SESSION.observations,
  };
}

const CAMERA_CONFIG: SensorConfiguration = {
  sensorId: "camera-rig-test",
  version: "camera-config-test-1",
  kind: "camera",
  description: "Test fixture configuration for replay tests.",
  cameras: [
    {
      cameraId: "cam-left",
      model: "fixture",
      resolution: { widthPx: 1280, heightPx: 800 },
      frameRateHz: 240,
      exposureUs: 100,
      shutter: "global",
      syncMode: "hardware",
      fixedFocus: true,
    },
  ],
  triggerSources: ["microphone"],
  frameBuffer: { preTriggerS: 0.25, postTriggerS: 0.5 },
  storeRawCaptures: true,
};

const CALIBRATION: CalibrationRecord = {
  version: "cal-fixture-1",
  createdUtc: "2026-09-30T10:00:00.000Z",
  sensorConfigurationVersion: "camera-config-test-1",
  coordinateSystemVersion: COORDINATE_SYSTEM_VERSION,
  pattern: { type: "charuco", squaresX: 5, squaresY: 7, squareSizeM: 0.03, markerSizeM: 0.022, dictionary: "DICT_5X5_100" },
  intrinsics: [],
  extrinsics: [],
  worldFrame: null,
  quality: {
    rmsReprojectionErrorPx: 0.4,
    perCamera: [],
    stereoEpipolarErrorPx: null,
    knownLengthRelativeError: null,
    targetLineErrorRad: null,
    evaluatedUtc: "2026-09-30T10:00:00.000Z",
  },
  status: "yellow",
  statusReasons: ["fixture"],
  artifactPaths: [],
};

/**
 * Format fixture for a live camera recording: the synthetic SESSION stream relabelled with
 * microphone triggers and marked-ball spin so that it is consistent with a live header. It
 * exercises the file format and the dataOrigin mapping only; it is not measured data.
 */
const LIVE_FIXTURE_OBSERVATIONS: readonly RawSensorObservation[] = SESSION.observations.map((o): RawSensorObservation => {
  if (o.kind === "trigger" && o.triggerSource === "synthetic") return { ...o, triggerSource: "microphone" };
  if (o.kind === "spin") return { ...o, method: "marked-ball", qualityFlags: [] };
  return o;
});

function liveHeader(dataOrigin: "live" | "replay" = "live") {
  return createReplayHeader({
    dataOrigin,
    description: "Test fixture labelled live to exercise dataOrigin mapping.",
    sensorConfiguration: CAMERA_CONFIG,
    calibration: CALIBRATION,
    syntheticTruth: null,
    createdUtc: CREATED,
  });
}

function liveFixtureReplay(): ReplayContent {
  return { header: liveHeader(), observations: LIVE_FIXTURE_OBSERVATIONS };
}

function lines(text: string): string[] {
  return text.split("\n");
}

function expectFormatError(fn: () => unknown, lineNumber: number | null, pattern: RegExp): ReplayFormatError {
  let caught: unknown = null;
  try {
    fn();
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(ReplayFormatError);
  const error = caught as ReplayFormatError;
  expect(error.lineNumber).toBe(lineNumber);
  expect(error.message).toMatch(pattern);
  return error;
}

describe("replay format: round trip", () => {
  it("serialize -> parse is lossless", () => {
    const replay = syntheticReplay();
    const text = serializeReplay(replay);
    expect(lines(text)).toHaveLength(SESSION.observations.length + 2); // header + records + trailing ""
    expect(text.endsWith("\n")).toBe(true);
    expect(JSON.parse(lines(text)[0]!)).toMatchObject({
      type: "header",
      formatVersion: REPLAY_FORMAT_VERSION,
      coordinateSystemVersion: COORDINATE_SYSTEM_VERSION,
      dataOrigin: "synthetic",
    });
    const parsed = parseReplay(text);
    expect(parsed.header).toEqual(replay.header);
    expect(parsed.observations).toEqual(replay.observations);
    expect(parsed.warnings).toEqual([]);
    expect(Object.isFrozen(parsed.header)).toBe(true);
    expect(Object.isFrozen(parsed.observations[0])).toBe(true);
  });

  it("accepts CRLF line endings and blank trailing lines", () => {
    const text = serializeReplay(syntheticReplay());
    const crlf = `${text.replace(/\n/g, "\r\n")}\r\n\n  \n`;
    const parsed = parseReplay(crlf);
    expect(parsed.observations).toEqual(SESSION.observations);
  });

  it("round-trips a replay with a calibration record", () => {
    const replay = liveFixtureReplay();
    const parsed = parseReplay(serializeReplay(replay));
    expect(parsed.header).toEqual(replay.header);
    expect(parsed.observations).toEqual(replay.observations);
  });

  it("createReplayHeader fills the versions and rejects inconsistent headers", () => {
    const header = syntheticReplay().header;
    expect(header.formatVersion).toBe(REPLAY_FORMAT_VERSION);
    expect(header.coordinateSystemVersion).toBe(COORDINATE_SYSTEM_VERSION);
    expect(() =>
      createReplayHeader({
        dataOrigin: "live",
        description: "x",
        sensorConfiguration: CAMERA_CONFIG,
        calibration: null,
        syntheticTruth: SESSION.truths,
        createdUtc: CREATED,
      }),
    ).toThrow(/syntheticTruth is only allowed in synthetic replays/);
    expect(() =>
      createReplayHeader({
        dataOrigin: "synthetic",
        description: "x",
        sensorConfiguration: CAMERA_CONFIG,
        calibration: null,
        syntheticTruth: null,
        createdUtc: "yesterday",
      }),
    ).toThrow(/createdUtc/);
  });

  it("serializeReplay refuses to write an invalid observation and names its line", () => {
    const bad = { ...SESSION.observations[1]!, sequence: -1 } as RawSensorObservation;
    const error = expectFormatError(
      () => serializeReplay({ header: syntheticReplay().header, observations: [SESSION.observations[0]!, bad] }),
      3,
      /Replay line 3: .*observation\.sequence/,
    );
    expect(error.issues[0]!.path).toBe("observation.sequence");
  });
});

describe("replay format: errors carry line numbers", () => {
  const text = serializeReplay(syntheticReplay());

  it("bad JSON", () => {
    const l = lines(text);
    l[2] = "{not json";
    expectFormatError(() => parseReplay(l.join("\n")), 3, /Replay line 3: invalid JSON/);
  });

  it("schema violation names the zod issue path", () => {
    const l = lines(text);
    const record = JSON.parse(l[2]!) as { observation: { kind: string; positionM: { x: unknown } } };
    expect(record.observation.kind).toBe("ball-address");
    record.observation.positionM.x = "oops";
    l[2] = JSON.stringify(record);
    const error = expectFormatError(() => parseReplay(l.join("\n")), 3, /observation\.positionM\.x/);
    expect(error.issues.map((i) => i.path)).toContain("observation.positionM.x");
  });

  it("unknown extra fields are rejected (strict schemas)", () => {
    const l = lines(text);
    const record = JSON.parse(l[4]!) as { observation: Record<string, unknown> };
    record.observation.velocityMps = { x: 1, y: 2, z: 3 };
    l[4] = JSON.stringify(record);
    expectFormatError(() => parseReplay(l.join("\n")), 5, /Replay line 5: observation record failed schema validation/);
  });

  it("missing header", () => {
    const l = lines(text).slice(1);
    expectFormatError(() => parseReplay(l.join("\n")), 1, /first line must be the replay header.*"observation"/);
  });

  it("duplicated header", () => {
    const l = lines(text);
    l.splice(3, 0, l[0]!);
    expectFormatError(() => parseReplay(l.join("\n")), 4, /Replay line 4: duplicate header/);
  });

  it("wrong formatVersion is rejected with an actionable message (no silent migration)", () => {
    const l = lines(text);
    const header = JSON.parse(l[0]!) as Record<string, unknown>;
    header.formatVersion = "glm-replay-0";
    l[0] = JSON.stringify(header);
    const error = expectFormatError(() => parseReplay(l.join("\n")), 1, /unsupported formatVersion "glm-replay-0"/);
    expect(error.message).toContain(REPLAY_FORMAT_VERSION);
    expect(error.message).toMatch(/never migrated silently/);
  });

  it("wrong coordinateSystemVersion is rejected with an actionable message", () => {
    const l = lines(text);
    const header = JSON.parse(l[0]!) as Record<string, unknown>;
    header.coordinateSystemVersion = "glm-world-0.9";
    l[0] = JSON.stringify(header);
    const error = expectFormatError(() => parseReplay(l.join("\n")), 1, /coordinateSystemVersion "glm-world-0.9"/);
    expect(error.message).toContain(COORDINATE_SYSTEM_VERSION);
    expect(error.message).toContain("docs/coordinate-system.md");
  });

  it("header schema violation", () => {
    const l = lines(text);
    const header = JSON.parse(l[0]!) as Record<string, unknown>;
    header.dataOrigin = "measured";
    l[0] = JSON.stringify(header);
    expectFormatError(() => parseReplay(l.join("\n")), 1, /header failed schema validation: dataOrigin/);
  });

  it("empty file and blank lines inside the body", () => {
    expectFormatError(() => parseReplay(""), 1, /empty/);
    expectFormatError(() => parseReplay("\n\n"), 1, /empty/);
    const l = lines(text);
    l.splice(5, 0, "");
    expectFormatError(() => parseReplay(l.join("\n")), 6, /blank line/);
  });
});

describe("replay format: provenance cannot be laundered", () => {
  const SYNTHETIC_CONFIG = defaultSyntheticSensorConfiguration("synthetic-1");

  it("a live or replay header must describe a camera, radar or hybrid sensor", () => {
    const cases = [
      ["live", "synthetic"],
      ["live", "manual"],
      ["live", "replay"],
      ["replay", "synthetic"],
      ["replay", "manual"],
    ] as const;
    for (const [dataOrigin, kind] of cases) {
      const error = expectFormatError(
        () =>
          createReplayHeader({
            dataOrigin,
            description: "x",
            sensorConfiguration: { ...SYNTHETIC_CONFIG, kind, triggerSources: [] },
            calibration: null,
            syntheticTruth: null,
            createdUtc: CREATED,
          }),
        1,
        new RegExp(`dataOrigin "${dataOrigin}" needs the configuration of the physical sensor.*kind is "${kind}"`),
      );
      expect(error.issues[0]!.path).toBe("sensorConfiguration.kind");
    }
    // Synthetic and manual replays are never labelled measured, whatever device they simulate.
    const header = createReplayHeader({
      dataOrigin: "synthetic",
      description: "Synthetic data rendered for a simulated camera rig.",
      sensorConfiguration: CAMERA_CONFIG,
      calibration: null,
      syntheticTruth: null,
      createdUtc: CREATED,
    });
    expect(header.dataOrigin).toBe("synthetic");
  });

  it("a live header cannot declare synthetic or manual trigger sources", () => {
    for (const source of ["synthetic", "manual"] as const) {
      const error = expectFormatError(
        () =>
          createReplayHeader({
            dataOrigin: "live",
            description: "x",
            sensorConfiguration: { ...CAMERA_CONFIG, triggerSources: ["microphone", source] },
            calibration: null,
            syntheticTruth: null,
            createdUtc: CREATED,
          }),
        1,
        new RegExp(`cannot declare the "${source}" trigger source`),
      );
      expect(error.issues[0]!.path).toBe("sensorConfiguration.triggerSources.1");
    }
  });

  it("serializeReplay refuses a synthetic adapter's stream under a live camera header", () => {
    const adapter = new SyntheticSensorAdapter({ shots: [makeSpec()], propagate: straightLine });
    const error = expectFormatError(
      () => serializeReplay({ header: liveHeader(), observations: adapter.getGeneratedObservations() }),
      4, // health (line 2), address (3), trigger (4)
      /Replay line 4: a "live" replay cannot contain a "synthetic" trigger/,
    );
    expect(error.issues[0]!.path).toBe("observation.triggerSource");
  });

  it("refuses synthetic spin and manual triggers in live and replay files", () => {
    const syntheticSpin = LIVE_FIXTURE_OBSERVATIONS.map((o) => (o.kind === "spin" ? { ...o, method: "synthetic" as const } : o));
    const spinLine = syntheticSpin.findIndex((o) => o.kind === "spin") + 2;
    const spinError = expectFormatError(
      () => serializeReplay({ header: liveHeader(), observations: syntheticSpin }),
      spinLine,
      /spin observation with method "synthetic"/,
    );
    expect(spinError.issues[0]!.path).toBe("observation.method");

    const manualTrigger = LIVE_FIXTURE_OBSERVATIONS.map((o) => (o.kind === "trigger" ? { ...o, triggerSource: "manual" as const } : o));
    expectFormatError(
      () => serializeReplay({ header: liveHeader("replay"), observations: manualTrigger }),
      4,
      /a "replay" replay cannot contain a "manual" trigger/,
    );
  });

  it("parseReplay rejects a synthetic file whose header was edited to claim a live recording", () => {
    const l = lines(serializeReplay(syntheticReplay()));
    const header = JSON.parse(l[0]!) as Record<string, unknown>;
    header.dataOrigin = "live";
    header.syntheticTruth = null;
    l[0] = JSON.stringify(header);
    expectFormatError(() => parseReplay(l.join("\n")), 1, /sensorConfiguration\.kind is "synthetic"/);
    header.sensorConfiguration = CAMERA_CONFIG;
    l[0] = JSON.stringify(header);
    expectFormatError(() => parseReplay(l.join("\n")), 4, /Replay line 4: a "live" replay cannot contain a "synthetic" trigger/);
  });
});

describe("replay format: warnings", () => {
  it("non-monotonic timestamps and sequences are warnings, not errors", () => {
    const observations = [...SESSION.observations];
    const swapped = observations[4]!;
    observations[4] = observations[5]!;
    observations[5] = swapped;
    const parsed = parseReplay(serializeReplay({ header: syntheticReplay().header, observations }));
    expect(parsed.observations).toEqual(observations);
    expect(parsed.warnings).toHaveLength(2);
    expect(parsed.warnings[0]).toMatch(/^line 7: timestamp .* is earlier than .* on line 6/);
    expect(parsed.warnings[1]).toMatch(/^line 7: sequence 4 .* does not increase after 5 on line 6/);
  });
});

describe("replay shot segmentation", () => {
  it("splits a synthetic session into its shots, keeping multi-source trigger groups together", () => {
    const shots = splitReplayIntoShots(SESSION.observations);
    expect(shots).toHaveLength(3);
    shots.forEach((shot, i) => expect(shot).toEqual(SESSION.shots[i]!.observations));
    expect(ofKind(shots[1]!, "trigger")).toHaveLength(2);
  });

  it("treats a replay without triggers as one shot and an empty replay as none", () => {
    const noTriggers = SESSION.observations.filter((o) => o.kind !== "trigger");
    expect(replayShotEndIndices(noTriggers)).toEqual([noTriggers.length]);
    expect(replayShotEndIndices([])).toEqual([]);
  });
});

describe("ReplaySensorAdapter", () => {
  it("emits the same observations in file order and keeps the synthetic origin", async () => {
    const parsed = parseReplay(serializeReplay(syntheticReplay()));
    const adapter = new ReplaySensorAdapter(parsed);
    expect(adapter.id).toBe("synthetic-1");
    expect(adapter.capabilities).toMatchObject({
      kind: "replay",
      isHardware: false,
      dataOrigin: "synthetic",
      measuresBallPosition3d: true,
      measuresSpin: true,
      providesTrigger: true,
      requiresCalibration: false,
      nominalFrameRateHz: null,
    });
    expect(adapter.getConfiguration()).toEqual(parsed.header.sensorConfiguration);
    const received: RawSensorObservation[] = [];
    adapter.subscribeToObservations((o) => received.push(o));
    await expect(adapter.startCapture()).rejects.toThrow(SensorStateError);
    await adapter.connect();
    await adapter.startCapture();
    expect(received).toEqual(SESSION.observations);
    expect(adapter.emitNextShot()).toBe(false);
  });

  it("maps a live recording to dataOrigin replay and reports the header calibration", async () => {
    const adapter = new ReplaySensorAdapter(parseReplay(serializeReplay(liveFixtureReplay())), { sensorId: "replay-x" });
    expect(adapter.id).toBe("replay-x");
    expect(adapter.capabilities.dataOrigin).toBe("replay");
    expect(adapter.capabilities.nominalFrameRateHz).toBe(240);
    expect(adapter.getConfiguration()).toEqual(CAMERA_CONFIG);
    const result = await adapter.calibrate({
      kind: "full",
      pattern: CALIBRATION.pattern,
      imagePaths: [],
      knownLengthM: null,
    });
    expect(result.status).toBe("yellow");
    expect(result.record).toEqual(CALIBRATION);
    expect(result.messages[0]).toMatch(/cannot recalibrate/);
    expect((await adapter.getHealth()).status).toBe("disconnected");
    await adapter.connect();
    const health = await adapter.getHealth();
    expect(health.status).toBe("ok");
    expect(health.calibrationStatus).toBe("yellow");
    expect(health.messages[0]).toMatch(/not a live measurement/);
  });

  it("reports calibration none when the replay has no calibration", async () => {
    const adapter = new ReplaySensorAdapter(syntheticReplay());
    const result = await adapter.calibrate({ kind: "full", pattern: CALIBRATION.pattern, imagePaths: [], knownLengthM: null });
    expect(result).toMatchObject({ record: null, status: "none" });
    expect((await adapter.getHealth()).calibrationStatus).toBe("none");
  });

  it("emitNextShot delivers one shot per call", async () => {
    const adapter = new ReplaySensorAdapter(syntheticReplay(), { startCaptureEmits: "none" });
    expect(adapter.shotCount).toBe(3);
    const received: RawSensorObservation[] = [];
    adapter.subscribeToObservations((o) => received.push(o));
    await adapter.connect();
    expect(() => adapter.emitNextShot()).toThrow(SensorStateError);
    await adapter.startCapture();
    expect(received).toHaveLength(0);
    for (let i = 0; i < 3; i++) {
      const before = received.length;
      expect(adapter.emitNextShot()).toBe(true);
      expect(received.slice(before)).toEqual(SESSION.shots[i]!.observations);
    }
    expect(adapter.emitNextShot()).toBe(false);
    adapter.reset();
    expect(adapter.emitNextShot()).toBe(true);
    expect(received.slice(SESSION.observations.length)).toEqual(SESSION.shots[0]!.observations);
  });

  it("rejects replays whose versions do not match", () => {
    const replay = syntheticReplay();
    expectFormatError(
      () => new ReplaySensorAdapter({ ...replay, header: { ...replay.header, formatVersion: "glm-replay-0" } }),
      1,
      /unsupported formatVersion "glm-replay-0"/,
    );
    expectFormatError(
      () => new ReplaySensorAdapter({ ...replay, header: { ...replay.header, coordinateSystemVersion: "glm-world-0.9" } }),
      1,
      /coordinateSystemVersion "glm-world-0.9"/,
    );
  });

  it("re-checks in-memory content, so synthetic data cannot be relabelled as a live recording", () => {
    const replay = syntheticReplay();
    expectFormatError(
      () => new ReplaySensorAdapter({ ...replay, header: { ...replay.header, dataOrigin: "live" } }),
      1,
      /syntheticTruth is only allowed in synthetic replays/,
    );
    expectFormatError(
      () => new ReplaySensorAdapter({ ...replay, header: { ...replay.header, dataOrigin: "live", syntheticTruth: null } }),
      1,
      /sensorConfiguration\.kind is "synthetic"/,
    );
    expectFormatError(
      () => new ReplaySensorAdapter({ header: liveHeader(), observations: SESSION.observations }),
      4,
      /a "live" replay cannot contain a "synthetic" trigger/,
    );
  });

  it("halts delivery when a subscriber stops capture or disconnects, and resumes without loss", async () => {
    const adapter = new ReplaySensorAdapter(syntheticReplay());
    const received: RawSensorObservation[] = [];
    const later: RawSensorObservation[] = [];
    let action: "stop" | "disconnect" | null = "stop";
    adapter.subscribeToObservations((o) => {
      received.push(o);
      if (o.kind !== "trigger" || action === null) return;
      if (action === "stop") void adapter.stopCapture();
      else void adapter.disconnect();
      action = action === "stop" ? "disconnect" : null;
    });
    adapter.subscribeToObservations((o) => later.push(o));
    await adapter.connect();

    await adapter.startCapture();
    expect(adapter.state).toBe("connected");
    expect(received.map((o) => o.kind)).toEqual(["health", "ball-address", "trigger"]);
    // The in-flight observation still reaches every subscriber.
    expect(later).toEqual(received);

    await adapter.startCapture(); // resumes after the first trigger, stops at shot 2's first trigger
    expect(adapter.state).toBe("disconnected");
    const shot2FirstTrigger = SESSION.observations.indexOf(ofKind(SESSION.shots[1]!.observations, "trigger")[0]!);
    expect(received).toEqual(SESSION.observations.slice(0, shot2FirstTrigger + 1));

    await adapter.connect();
    await adapter.startCapture();
    expect(received).toEqual(SESSION.observations);
    expect(later).toEqual(SESSION.observations);
  });

  it("refuses emitNextShot(), reset() and startCapture() from inside a callback", async () => {
    const adapter = new ReplaySensorAdapter(syntheticReplay(), { startCaptureEmits: "none" });
    const errors: unknown[] = [];
    const later: RawSensorObservation[] = [];
    adapter.subscribeToObservations((o) => {
      if (o.kind !== "trigger") return;
      for (const call of [() => adapter.emitNextShot(), () => adapter.reset()]) {
        try {
          call();
        } catch (error) {
          errors.push(error);
        }
      }
      adapter.startCapture().catch((error: unknown) => errors.push(error));
    });
    adapter.subscribeToObservations((o) => later.push(o));
    await adapter.connect();
    await adapter.startCapture();
    expect(adapter.emitNextShot()).toBe(true);
    await Promise.resolve();
    expect(errors).toHaveLength(3);
    for (const error of errors) expect(error).toBeInstanceOf(ReentrantEmissionError);
    expect((errors[0] as Error).message).toMatch(/cannot call emitNextShot\(\) from inside an observation callback/);
    expect(later).toEqual(SESSION.shots[0]!.observations);
    expect(adapter.state).toBe("capturing");
  });
});

describe("node replay file IO", () => {
  let dir = "";
  beforeAll(async () => {
    dir = await mkdtemp(join(tmpdir(), "glm-sensor-adapters-"));
  });
  afterAll(async () => {
    if (dir !== "") await rm(dir, { recursive: true, force: true });
  });

  it("writes and reads back an identical replay", async () => {
    const path = join(dir, "session.glm-replay.jsonl");
    const replay = syntheticReplay();
    await writeReplayFile(path, replay);
    expect(await readdir(dir)).toEqual(["session.glm-replay.jsonl"]);
    expect(await readFile(path, "utf8")).toBe(serializeReplay(replay));
    const parsed = await readReplayFile(path);
    expect(parsed.header).toEqual(replay.header);
    expect(parsed.observations).toEqual(replay.observations);
    expect(parsed.warnings).toEqual([]);
  });

  it("prefixes format errors with the file path and keeps the line number", async () => {
    const path = join(dir, "broken.jsonl");
    const l = serializeReplay(syntheticReplay()).split("\n");
    l[3] = "not json";
    await writeFile(path, l.join("\n"), "utf8");
    const error = await readReplayFile(path).then(
      () => null,
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(ReplayFormatError);
    expect((error as ReplayFormatError).lineNumber).toBe(4);
    expect((error as ReplayFormatError).message).toContain(`${path}: Replay line 4: invalid JSON`);
  });

  it("propagates file-system errors", async () => {
    await expect(readReplayFile(join(dir, "missing.jsonl"))).rejects.toThrow(/ENOENT/);
  });
});
