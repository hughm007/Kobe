import { RawSensorObservationSchema, SensorCapabilitiesSchema } from "@glm/shared-types";
import type { RawSensorObservation } from "@glm/shared-types";
import { describe, expect, it } from "vitest";
import {
  defaultSyntheticSensorConfiguration,
  generateSyntheticSession,
  ReentrantEmissionError,
  SensorStateError,
  SyntheticSensorAdapter,
} from "../src/index";
import type { SyntheticShotSpec } from "../src/index";
import { makeSpec, ofKind, straightLine } from "./helpers";

const SHOTS: readonly SyntheticShotSpec[] = [
  makeSpec({ label: "one", launchTimeS: 1, seed: 1 }),
  makeSpec({ label: "two", launchTimeS: 1, seed: 2 }),
  makeSpec({ label: "three", launchTimeS: 1, seed: 3 }),
];
const CALIBRATION_INPUT = {
  kind: "full" as const,
  pattern: { type: "charuco" as const, squaresX: 5, squaresY: 7, squareSizeM: 0.03, markerSizeM: 0.022, dictionary: "DICT_5X5_100" },
  imagePaths: [],
  knownLengthM: null,
};

function collect(adapter: SyntheticSensorAdapter): RawSensorObservation[] {
  const received: RawSensorObservation[] = [];
  adapter.subscribeToObservations((o) => received.push(o));
  return received;
}

describe("SyntheticSensorAdapter: capabilities and configuration", () => {
  it("declares an honest software sensor", () => {
    const adapter = new SyntheticSensorAdapter({ shots: SHOTS, propagate: straightLine });
    expect(adapter.id).toBe("synthetic-1");
    expect(adapter.capabilities).toEqual({
      kind: "synthetic",
      isHardware: false,
      dataOrigin: "synthetic",
      observationKinds: ["health", "ball-address", "trigger", "ball-position-3d", "spin"],
      measuresBallPosition3d: true,
      measuresSpin: true,
      measuresClubData: false,
      providesTrigger: true,
      requiresCalibration: false,
      nominalFrameRateHz: 1000,
    });
    expect(SensorCapabilitiesSchema.safeParse(adapter.capabilities).success).toBe(true);
    expect(adapter.getConfiguration()).toEqual(defaultSyntheticSensorConfiguration("synthetic-1"));
  });

  it("reports measuresSpin false and no spin kind when no shot observes spin", () => {
    const adapter = new SyntheticSensorAdapter({
      sensorId: "nospin",
      shots: [makeSpec({}, { spin: null, frameRateHz: 500 })],
      propagate: straightLine,
    });
    expect(adapter.capabilities.measuresSpin).toBe(false);
    expect(adapter.capabilities.observationKinds).not.toContain("spin");
    expect(adapter.capabilities.nominalFrameRateHz).toBe(500);
    expect(adapter.getConfiguration().sensorId).toBe("nospin");
  });

  it("reports a null frame rate with no shots and rejects a mismatched configuration", () => {
    expect(new SyntheticSensorAdapter({ shots: [], propagate: straightLine }).capabilities.nominalFrameRateHz).toBeNull();
    expect(
      () =>
        new SyntheticSensorAdapter({
          sensorId: "a",
          configuration: defaultSyntheticSensorConfiguration("b"),
          shots: SHOTS,
          propagate: straightLine,
        }),
    ).toThrow(/does not match/);
  });

  it("refuses a configuration that describes hardware or does not say it is synthetic", () => {
    const camera = { ...defaultSyntheticSensorConfiguration("s"), kind: "camera" as const, description: "Stereo camera rig" };
    expect(() => new SyntheticSensorAdapter({ sensorId: "s", configuration: camera, shots: SHOTS, propagate: straightLine })).toThrow(
      /configuration\.kind must be "synthetic", got "camera"/,
    );
    const unlabelled = { ...defaultSyntheticSensorConfiguration("s"), description: "Range sensor" };
    expect(
      () => new SyntheticSensorAdapter({ sensorId: "s", configuration: unlabelled, shots: SHOTS, propagate: straightLine }),
    ).toThrow(/configuration\.description must state that the data are synthetic/);
    const custom = { ...defaultSyntheticSensorConfiguration("s"), version: "synthetic-custom", description: "Custom SYNTHETIC rig model." };
    expect(new SyntheticSensorAdapter({ sensorId: "s", configuration: custom, shots: SHOTS, propagate: straightLine }).getConfiguration()).toBe(
      custom,
    );
  });
});

describe("SyntheticSensorAdapter: lifecycle", () => {
  it("rejects invalid transitions with SensorStateError", async () => {
    const adapter = new SyntheticSensorAdapter({ shots: SHOTS, propagate: straightLine });
    await expect(adapter.startCapture()).rejects.toThrow(SensorStateError);
    await expect(adapter.startCapture()).rejects.toThrow(/startCapture\(\) while disconnected\. Call connect\(\) first/);
    await expect(adapter.stopCapture()).rejects.toThrow(SensorStateError);
    expect(() => adapter.emitNextShot()).toThrow(/emitNextShot\(\) while disconnected/);

    await adapter.connect();
    expect(adapter.state).toBe("connected");
    await expect(adapter.connect()).rejects.toThrow(/already connected/);
    expect(() => adapter.emitNextShot()).toThrow(/Call startCapture\(\) first/);

    await adapter.startCapture();
    expect(adapter.state).toBe("capturing");
    await expect(adapter.startCapture()).rejects.toThrow(/already running/);
    await adapter.stopCapture();
    expect(adapter.state).toBe("connected");

    await adapter.startCapture();
    await adapter.disconnect();
    expect(adapter.state).toBe("disconnected");
    await adapter.disconnect(); // idempotent
  });

  it("reports disconnected health before connect and ok after, never claiming a measurement", async () => {
    const adapter = new SyntheticSensorAdapter({
      shots: SHOTS,
      propagate: straightLine,
      clock: () => "2026-10-01T12:00:00.000Z",
    });
    const before = await adapter.getHealth();
    expect(before.status).toBe("disconnected");
    expect(before.checkedUtc).toBe("2026-10-01T12:00:00.000Z");
    await adapter.connect();
    const after = await adapter.getHealth();
    expect(after.status).toBe("ok");
    expect(after.calibrationStatus).toBe("none");
    expect(after.messages.join(" ")).toMatch(/not measurements/);
  });

  it("calibrate() reports that calibration is not used", async () => {
    const adapter = new SyntheticSensorAdapter({ shots: SHOTS, propagate: straightLine });
    await expect(adapter.calibrate(CALIBRATION_INPUT)).resolves.toEqual({
      record: null,
      status: "none",
      messages: ["Synthetic adapter does not use calibration."],
    });
  });
});

describe("SyntheticSensorAdapter: emission", () => {
  it("startCapture emits every shot in time order with consecutive sequences (synchronously)", async () => {
    const adapter = new SyntheticSensorAdapter({ shots: SHOTS, propagate: straightLine });
    const received = collect(adapter);
    await adapter.connect();
    const pending = adapter.startCapture();
    // Delivered synchronously inside startCapture(), before the promise is awaited.
    expect(received.length).toBe(72);
    await pending;
    expect(received.map((o) => o.sequence)).toEqual(Array.from({ length: 72 }, (_, i) => i));
    for (let i = 1; i < received.length; i++) expect(received[i]!.timestampS).toBeGreaterThanOrEqual(received[i - 1]!.timestampS);
    for (const o of received) expect(RawSensorObservationSchema.safeParse(o).success).toBe(true);
    const triggers = ofKind(received, "trigger").map((t) => t.timestampS);
    expect(triggers[0]).toBeCloseTo(1, 12);
    expect(triggers[1]).toBeCloseTo(6, 12);
    expect(triggers[2]).toBeCloseTo(11, 12);
    expect(adapter.getSyntheticTruth().map((t) => t.launchTimeS)).toEqual([1, 6, 11]);
    expect(adapter.getSyntheticTruth().map((t) => t.label)).toEqual(["one", "two", "three"]);
    expect(adapter.emitNextShot()).toBe(false);
    expect(received).toEqual([...adapter.getGeneratedObservations()]);
  });

  it("matches generateSyntheticSession exactly", async () => {
    const adapter = new SyntheticSensorAdapter({ sensorId: "s", shots: SHOTS, propagate: straightLine, shotSpacingS: 7 });
    const session = generateSyntheticSession(SHOTS, straightLine, { sensorId: "s", shotSpacingS: 7 });
    const received = collect(adapter);
    await adapter.connect();
    await adapter.startCapture();
    expect(received).toEqual(session.observations);
    expect(adapter.getSyntheticTruth()).toEqual(session.truths);
  });

  it("emitNextShot delivers one shot at a time, returns false when exhausted, and reset() rewinds", async () => {
    const adapter = new SyntheticSensorAdapter({ shots: SHOTS, propagate: straightLine, startCaptureEmits: "none" });
    const received = collect(adapter);
    await adapter.connect();
    await adapter.startCapture();
    expect(received).toHaveLength(0);
    expect(adapter.remainingShotCount).toBe(3);

    expect(adapter.emitNextShot()).toBe(true);
    expect(received).toHaveLength(24);
    expect(ofKind(received, "trigger")).toHaveLength(1);
    expect(received[0]!.kind).toBe("health");
    expect(received.at(-1)!.kind).toBe("spin");

    expect(adapter.emitNextShot()).toBe(true);
    expect(adapter.emitNextShot()).toBe(true);
    expect(received).toHaveLength(72);
    expect(adapter.emitNextShot()).toBe(false);
    expect(adapter.remainingShotCount).toBe(0);

    const firstPass = [...received];
    adapter.reset();
    expect(adapter.emitNextShot()).toBe(true);
    expect(received.slice(72)).toEqual(firstPass.slice(0, 24));
  });
});

describe("SyntheticSensorAdapter: lifecycle changes during delivery", () => {
  it("disconnect() inside a callback halts delivery; reconnecting delivers the rest exactly once", async () => {
    const adapter = new SyntheticSensorAdapter({ shots: SHOTS, propagate: straightLine });
    const received: RawSensorObservation[] = [];
    const later: RawSensorObservation[] = [];
    let disconnected = false;
    adapter.subscribeToObservations((o) => {
      received.push(o);
      if (o.kind === "trigger" && !disconnected) {
        disconnected = true;
        void adapter.disconnect();
      }
    });
    adapter.subscribeToObservations((o) => later.push(o));
    await adapter.connect();
    await adapter.startCapture();
    expect(adapter.state).toBe("disconnected");
    expect(received.map((o) => o.kind)).toEqual(["health", "ball-address", "trigger"]);
    expect(later).toEqual(received); // the in-flight observation reached every subscriber
    expect(adapter.remainingShotCount).toBe(3);

    await adapter.connect();
    await adapter.startCapture();
    expect(received).toEqual([...adapter.getGeneratedObservations()]);
    expect(later).toEqual(received);
    expect(adapter.remainingShotCount).toBe(0);
  });

  it("stopCapture() inside emitNextShot() halts mid-shot; the next call completes that shot", async () => {
    const adapter = new SyntheticSensorAdapter({ shots: SHOTS, propagate: straightLine, startCaptureEmits: "none" });
    const received = collect(adapter);
    let stopped = false;
    adapter.subscribeToObservations((o) => {
      if (o.kind === "ball-position-3d" && !stopped) {
        stopped = true;
        void adapter.stopCapture();
      }
    });
    await adapter.connect();
    await adapter.startCapture();
    expect(adapter.emitNextShot()).toBe(true);
    expect(adapter.state).toBe("connected");
    expect(received).toHaveLength(4);
    expect(() => adapter.emitNextShot()).toThrow(SensorStateError);

    await adapter.startCapture();
    expect(adapter.emitNextShot()).toBe(true);
    expect(received).toHaveLength(24);
    expect(received).toEqual(adapter.getGeneratedObservations().slice(0, 24));
    expect(adapter.remainingShotCount).toBe(2);
  });

  it("refuses emitNextShot(), reset() and startCapture() from inside a callback, keeping time order", async () => {
    const adapter = new SyntheticSensorAdapter({ shots: SHOTS, propagate: straightLine, startCaptureEmits: "none" });
    const errors: unknown[] = [];
    adapter.subscribeToObservations((o) => {
      if (o.kind !== "trigger") return;
      for (const call of [() => adapter.emitNextShot(), () => adapter.reset()]) {
        try {
          call();
        } catch (error) {
          errors.push(error);
        }
      }
    });
    const later = collect(adapter);
    await adapter.connect();
    await adapter.startCapture();
    adapter.emitNextShot();
    adapter.emitNextShot();
    expect(errors).toHaveLength(4);
    for (const error of errors) expect(error).toBeInstanceOf(ReentrantEmissionError);
    expect(later).toEqual(adapter.getGeneratedObservations().slice(0, 48));
    for (let i = 1; i < later.length; i++) expect(later[i]!.timestampS).toBeGreaterThanOrEqual(later[i - 1]!.timestampS);

    // stop + restart from inside a callback: the restart is refused, capture stays stopped.
    const restarted = new SyntheticSensorAdapter({ shots: SHOTS, propagate: straightLine });
    const restartErrors: unknown[] = [];
    restarted.subscribeToObservations((o) => {
      if (o.kind !== "trigger" || restartErrors.length > 0) return;
      void restarted.stopCapture();
      restarted.startCapture().catch((error: unknown) => restartErrors.push(error));
    });
    const seen = collect(restarted);
    await restarted.connect();
    await restarted.startCapture();
    await Promise.resolve();
    expect(restartErrors).toHaveLength(1);
    expect(restartErrors[0]).toBeInstanceOf(ReentrantEmissionError);
    expect(restarted.state).toBe("connected");
    expect(seen).toHaveLength(3);
  });
});

describe("SyntheticSensorAdapter: subscriptions", () => {
  it("delivers to multiple subscribers and Unsubscribe really stops delivery", async () => {
    const adapter = new SyntheticSensorAdapter({ shots: SHOTS, propagate: straightLine, startCaptureEmits: "none" });
    const a: RawSensorObservation[] = [];
    const b: RawSensorObservation[] = [];
    const unsubscribeA = adapter.subscribeToObservations((o) => a.push(o));
    adapter.subscribeToObservations((o) => b.push(o));
    await adapter.connect();
    await adapter.startCapture();
    adapter.emitNextShot();
    expect(a).toHaveLength(24);
    expect(b).toHaveLength(24);
    unsubscribeA();
    unsubscribeA(); // idempotent
    adapter.emitNextShot();
    expect(a).toHaveLength(24);
    expect(b).toHaveLength(48);
  });

  it("unsubscribing inside a callback stops delivery immediately", async () => {
    const adapter = new SyntheticSensorAdapter({ shots: SHOTS, propagate: straightLine });
    const seen: RawSensorObservation[] = [];
    const unsubscribe = adapter.subscribeToObservations((o) => {
      seen.push(o);
      if (seen.length === 3) unsubscribe();
    });
    await adapter.connect();
    await adapter.startCapture();
    expect(seen).toHaveLength(3);
  });

  it("isolates a throwing subscriber and records lastError", async () => {
    const adapter = new SyntheticSensorAdapter({ shots: SHOTS, propagate: straightLine });
    const boom = new Error("subscriber failure");
    adapter.subscribeToObservations(() => {
      throw boom;
    });
    const received = collect(adapter);
    expect(adapter.lastError).toBeNull();
    await adapter.connect();
    await expect(adapter.startCapture()).resolves.toBeUndefined();
    expect(received).toHaveLength(72);
    expect(adapter.lastError).toBe(boom);
    expect(adapter.subscriberErrorCount).toBe(72);
  });

  it("rejects a non-function callback", () => {
    const adapter = new SyntheticSensorAdapter({ shots: SHOTS, propagate: straightLine });
    expect(() => adapter.subscribeToObservations(42 as unknown as () => void)).toThrow(TypeError);
  });
});
