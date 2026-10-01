import type { ShotRecord } from "@glm/shared-types";
import { beforeAll, describe, expect, it } from "vitest";
import { shotSortValue, sortShots } from "../src/display/sort";
import { activeDataOrigin, appReducer, type AppState, createInitialState } from "../src/state/reducer";
import {
  DEFAULT_SETTINGS,
  loadSettings,
  sanitizeSettings,
  saveSettings,
  SETTINGS_STORAGE_KEY,
} from "../src/state/settings";
import { sessionRecordFor } from "../src/storage/repository";
import { memoryStorage, syntheticRecord } from "./helpers";

function initial(patch: Partial<AppState["settings"]> = {}): AppState {
  return createInitialState({
    settings: { ...DEFAULT_SETTINGS, ...patch },
    sessionId: "session-test",
    sessionStartedUtc: "2026-10-01T12:00:00.000Z",
    runnerKind: "in-process",
  });
}

let a: ShotRecord;
let b: ShotRecord;
let noSpin: ShotRecord;

beforeAll(async () => {
  [a, b, noSpin] = await Promise.all([
    syntheticRecord("standard-7-iron", "clean", 1, { monteCarloSamples: 0 }),
    syntheticRecord("straight-driver", "clean", 2, { monteCarloSamples: 0 }),
    syntheticRecord("straight-driver", "no-spin-observed", 3, { monteCarloSamples: 0 }),
  ]);
});

describe("settings persistence", () => {
  it("defaults: synthetic source, golfer precision, dark theme, safety not acknowledged, honest toggles off", () => {
    expect(DEFAULT_SETTINGS).toMatchObject({
      dataSource: "synthetic",
      precision: "golfer",
      theme: "dark",
      developerMode: false,
      allowGenericSpinFallback: false,
      retainRawObservations: false,
      allowProvisionalInCasual: false,
      monteCarloSamples: 100,
      safetyAcknowledgedUtc: null,
    });
    expect(DEFAULT_SETTINGS.bag.every((c) => c.staticLoftDeg === null)).toBe(true);
    expect(DEFAULT_SETTINGS.bag.every((c) => !("distance" in c))).toBe(true);
  });

  it("round-trips through storage", () => {
    const storage = memoryStorage();
    const s = { ...DEFAULT_SETTINGS, units: "metric" as const, monteCarloSamples: 250, safetyAcknowledgedUtc: "2026-10-01T12:00:00.000Z" };
    expect(saveSettings(storage, s)).toBe(true);
    expect(loadSettings(storage)).toEqual(s);
  });

  it("missing, corrupt or throwing storage yields defaults; a failed write returns false", () => {
    expect(loadSettings(null)).toBe(DEFAULT_SETTINGS);
    expect(loadSettings(memoryStorage({ [SETTINGS_STORAGE_KEY]: "{not json" }))).toBe(DEFAULT_SETTINGS);
    const throwing = {
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    };
    expect(loadSettings(throwing)).toBe(DEFAULT_SETTINGS);
    expect(saveSettings(throwing, DEFAULT_SETTINGS)).toBe(false);
  });

  it("sanitizes field by field and never restores manual entry without developer mode", () => {
    const s = sanitizeSettings({
      units: "furlongs",
      monteCarloSamples: -3,
      dataSource: "manual",
      developerMode: false,
      clubId: "not-in-bag",
      ballProfileId: "made-up-ball",
      fixtureId: "nope",
      noisePreset: "loud",
      safetyAcknowledgedUtc: "yesterday-ish",
      environment: { indoor: false, temperatureC: "warm", windSpeedMps: 3 },
      bag: [{ id: "a", label: "A", category: "driver", staticLoftDeg: 10.5 }, { id: "b", label: "B", category: "spoon" }],
    });
    expect(s.units).toBe("imperial");
    expect(s.monteCarloSamples).toBe(0);
    expect(s.dataSource).toBe("synthetic");
    expect(s.clubId).toBeNull();
    expect(s.ballProfileId).toBe(DEFAULT_SETTINGS.ballProfileId);
    expect(s.fixtureId).toBe(DEFAULT_SETTINGS.fixtureId);
    expect(s.noisePreset).toBe("clean");
    expect(s.safetyAcknowledgedUtc).toBeNull();
    expect(s.environment).toMatchObject({ indoor: false, temperatureC: null, windSpeedMps: 3 });
    expect(s.bag).toEqual([{ id: "a", label: "A", category: "driver", staticLoftDeg: 10.5 }]);
    expect(sanitizeSettings({ dataSource: "manual", developerMode: true }).dataSource).toBe("manual");
  });
});

describe("app reducer", () => {
  it("starts on the safety screen until acknowledged, then on the range", () => {
    expect(initial().screen).toBe("safety");
    expect(initial({ safetyAcknowledgedUtc: "2026-10-01T12:00:00.000Z" }).screen).toBe("range");
    const acked = appReducer(initial(), { type: "safety-acknowledged", utc: "2026-10-01T12:05:00.000Z" });
    expect(acked.settings.safetyAcknowledgedUtc).toBe("2026-10-01T12:05:00.000Z");
    expect(acked.screen).toBe("range");
  });

  it("appends shots of the current session and selects the newest; ignores shots of another session", () => {
    let s = appReducer(initial(), { type: "shot-received", record: a, processingMs: 12 });
    s = appReducer(s, { type: "shot-received", record: b, processingMs: 30 });
    expect(s.shots.map((r) => r.shotId)).toEqual([a.shotId, b.shotId]);
    expect(s.currentShotId).toBe(b.shotId);
    expect(s.lastProcessingMs).toBe(30);
    const other = appReducer(s, { type: "shot-received", record: { ...a, shotId: "x", sessionId: "other" }, processingMs: 5 });
    expect(other.shots).toHaveLength(2);
  });

  it("switching data source starts a new session; the same source is a no-op", () => {
    const s = appReducer(initial(), { type: "shot-received", record: a, processingMs: 1 });
    expect(appReducer(s, { type: "data-source-changed", source: "synthetic", sessionId: "n", utc: "u" })).toBe(s);
    const next = appReducer(s, { type: "data-source-changed", source: "replay", sessionId: "n2", utc: "2026-10-01T13:00:00.000Z" });
    expect(next.sessionId).toBe("n2");
    expect(next.shots).toEqual([]);
    expect(next.settings.dataSource).toBe("replay");
    expect(activeDataOrigin(next)).toBe("replay");
  });

  it("turning developer mode off leaves manual entry AND starts a new session (a session never mixes streams)", () => {
    const manual = appReducer(initial({ developerMode: true, dataSource: "manual" }), {
      type: "shot-received",
      record: { ...a, dataOrigin: "manual" },
      processingMs: 1,
    });
    expect(manual.shots).toHaveLength(1);
    const s = appReducer(manual, {
      type: "settings-patched",
      patch: { developerMode: false },
      nextSession: { sessionId: "after-dev-off", utc: "2026-10-01T13:00:00.000Z" },
    });
    expect(s.settings.developerMode).toBe(false);
    expect(s.settings.dataSource).toBe("synthetic");
    expect(activeDataOrigin(s)).toBe("synthetic");
    expect(s.sessionId).toBe("after-dev-off");
    expect(s.sessionStartedUtc).toBe("2026-10-01T13:00:00.000Z");
    expect(s.shots).toEqual([]);
    expect(s.currentShotId).toBeNull();
    // A late shot of the manual session is no longer shown in the new session.
    expect(appReducer(s, { type: "shot-received", record: { ...b, sessionId: manual.sessionId }, processingMs: 1 }).shots).toEqual([]);
  });

  it("a settings patch that does not change the data source keeps the session and its shots", () => {
    const s = appReducer(initial(), { type: "shot-received", record: a, processingMs: 1 });
    const next = appReducer(s, {
      type: "settings-patched",
      patch: { units: "metric", developerMode: true },
      nextSession: { sessionId: "unused", utc: "2026-10-01T13:00:00.000Z" },
    });
    expect(next.sessionId).toBe(s.sessionId);
    expect(next.shots).toEqual(s.shots);
    expect(next.settings.units).toBe("metric");
    // Patching the source directly also starts a new session.
    const replay = appReducer(next, {
      type: "settings-patched",
      patch: { dataSource: "replay" },
      nextSession: { sessionId: "via-patch", utc: "2026-10-01T13:01:00.000Z" },
    });
    expect(replay.sessionId).toBe("via-patch");
    expect(replay.shots).toEqual([]);
  });

  it("seed only accepts non-negative integers", () => {
    const s = appReducer(initial(), { type: "seed-set", seed: 42 });
    expect(s.nextSeed).toBe(42);
    expect(appReducer(s, { type: "seed-set", seed: -1 }).nextSeed).toBe(42);
    expect(appReducer(s, { type: "seed-set", seed: 1.5 }).nextSeed).toBe(42);
  });

  it("deleting a player clears the selection and, if asked, their shots", () => {
    const withPlayer = appReducer(initial({ playerId: "p1" }), {
      type: "players-loaded",
      players: [{ id: "p1", displayName: "P", handedness: "right", createdUtc: "2026-10-01T12:00:00.000Z" }],
    });
    const s = appReducer(withPlayer, { type: "player-deleted", playerId: "p1", deletedShots: true });
    expect(s.players).toEqual([]);
    expect(s.settings.playerId).toBeNull();
  });
});

describe("history sorting", () => {
  it("sorts on SI values with unavailable values last in either direction", () => {
    expect(shotSortValue(noSpin, "carry")).toBeNull();
    const asc = sortShots([b, noSpin, a], "carry", "asc");
    const desc = sortShots([b, noSpin, a], "carry", "desc");
    // A 7-iron carries less than a driver, whatever the current ground model.
    expect(asc.map((r) => r.shotId)).toEqual([a.shotId, b.shotId, noSpin.shotId]);
    expect(desc.map((r) => r.shotId)).toEqual([b.shotId, a.shotId, noSpin.shotId]);
    const bySpeed = sortShots([a, b], "ballSpeed", "desc");
    expect(bySpeed[0]!.shotId).toBe(b.shotId);
  });
});

describe("session records", () => {
  it("derive origin, versions and players from the shots; empty sessions are not stored", () => {
    expect(sessionRecordFor("s", "2026-10-01T12:00:00.000Z", [])).toBeNull();
    const session = sessionRecordFor(a.sessionId, "2026-10-01T12:00:00.000Z", [a, b]);
    expect(session).toMatchObject({
      id: a.sessionId,
      dataOrigin: "synthetic",
      sensorConfigurationVersion: a.sensorConfiguration.version,
      calibrationVersion: "uncalibrated",
      playerIds: [],
      endedUtc: null,
    });
  });
});
