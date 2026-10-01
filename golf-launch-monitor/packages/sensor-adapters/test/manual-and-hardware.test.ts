import { RawSensorObservationSchema, SensorCapabilitiesSchema, SensorConfigurationSchema } from "@glm/shared-types";
import type { RawSensorObservation, SensorAdapter } from "@glm/shared-types";
import { describe, expect, it } from "vitest";
import {
  CameraLaunchMonitorAdapter,
  createReplayHeader,
  HardwareNotAvailableError,
  HybridFusionAdapter,
  MANUAL_SPIN_PLACEHOLDER_FIT_RESIDUAL_RAD,
  MANUAL_SPIN_PLACEHOLDER_OBSERVATION_COUNT,
  ManualEntryAdapter,
  parseReplay,
  RadarLaunchMonitorAdapter,
  ReentrantEmissionError,
  SensorStateError,
  serializeReplay,
} from "../src/index";
import { ofKind, straightLine } from "./helpers";

const CALIBRATION_INPUT = {
  kind: "full" as const,
  pattern: { type: "checkerboard" as const, squaresX: 9, squaresY: 6, squareSizeM: 0.025, markerSizeM: null, dictionary: null },
  imagePaths: [],
  knownLengthM: null,
};

describe("ManualEntryAdapter (developer testing only)", () => {
  it("is labelled manual / non-hardware and says so in health", async () => {
    const adapter = new ManualEntryAdapter({ propagate: straightLine });
    expect(adapter.id).toBe("manual-dev");
    expect(adapter.capabilities).toMatchObject({
      kind: "manual",
      isHardware: false,
      dataOrigin: "manual",
      measuresSpin: true,
      measuresClubData: false,
      nominalFrameRateHz: 1000,
    });
    expect(SensorCapabilitiesSchema.safeParse(adapter.capabilities).success).toBe(true);
    expect(SensorConfigurationSchema.safeParse(adapter.getConfiguration()).success).toBe(true);
    expect(adapter.getConfiguration().kind).toBe("manual");
    expect(adapter.getConfiguration().description).toMatch(/DEVELOPER TESTING ONLY/);
    const health = await adapter.getHealth();
    expect(health.status).toBe("disconnected");
    expect(health.messages.join(" ")).toMatch(/FOR DEVELOPER TESTING ONLY/);
    expect(health.messages.join(" ")).toMatch(/never be presented as hardware/);
    await adapter.connect();
    expect((await adapter.getHealth()).status).toBe("ok");
    const calibration = await adapter.calibrate(CALIBRATION_INPUT);
    expect(calibration).toMatchObject({ record: null, status: "none" });
  });

  it("emits address, manual trigger, 10 noise-free frames at 1000 fps and spin when given", async () => {
    const adapter = new ManualEntryAdapter({ propagate: straightLine, sensorId: "dev-a" });
    const received: RawSensorObservation[] = [];
    adapter.subscribeToObservations((o) => received.push(o));
    await adapter.connect();
    expect(() => adapter.submitManualLaunch({ velocityMps: { x: 50, y: 0, z: 10 }, angularVelocityRadPerSec: null, launchTimeS: 1 })).toThrow(
      SensorStateError,
    );
    await adapter.startCapture();

    const velocity = { x: 50, y: 2, z: 10 };
    const omega = { x: 0, y: -250, z: 30 };
    const emitted = adapter.submitManualLaunch({ velocityMps: velocity, angularVelocityRadPerSec: omega, launchTimeS: 3 });
    expect(received).toEqual(emitted);
    expect(emitted.map((o) => o.kind)).toEqual([
      "ball-address",
      "trigger",
      ...Array.from({ length: 10 }, () => "ball-position-3d"),
      "spin",
    ]);
    expect(emitted.map((o) => o.sequence)).toEqual(Array.from({ length: 13 }, (_, i) => i));
    for (const o of emitted) {
      expect(o.sensorId).toBe("dev-a");
      expect(RawSensorObservationSchema.safeParse(o).success).toBe(true);
    }
    const [trigger] = ofKind(emitted, "trigger");
    expect(trigger).toMatchObject({ triggerSource: "manual", timestampS: 3, confidence: 1 });
    const [address] = ofKind(emitted, "ball-address");
    expect(address!.timestampS).toBeCloseTo(2.9, 12);
    expect(address!.positionM).toEqual({ x: 0, y: 0, z: 0 });
    ofKind(emitted, "ball-position-3d").forEach((frame, k) => {
      const dt = (k + 1) / 1000;
      expect(frame.frameIndex).toBe(k + 1);
      expect(frame.timestampS).toBeCloseTo(3 + dt, 12);
      // Noise-free: exactly the propagated truth.
      expect(frame.positionM.x).toBeCloseTo(50 * dt, 12);
      expect(frame.positionM.y).toBeCloseTo(2 * dt, 12);
      expect(frame.positionM.z).toBeCloseTo(10 * dt, 12);
      expect(frame.covarianceM2).toEqual([
        [1e-8, 0, 0],
        [0, 1e-8, 0],
        [0, 0, 1e-8],
      ]);
    });
    const [spin] = ofKind(emitted, "spin");
    expect(spin).toMatchObject({ method: "synthetic", qualityFlags: ["manual-entry"], angularVelocityRadPerSec: omega });

    // Without spin: no spin observation; sequences continue.
    const second = adapter.submitManualLaunch({ velocityMps: velocity, angularVelocityRadPerSec: null, launchTimeS: 10 });
    expect(ofKind(second, "spin")).toHaveLength(0);
    expect(second).toHaveLength(12);
    expect(second[0]!.sequence).toBe(13);
  });

  it("refuses a launch time that would break timestamp monotonicity", async () => {
    const adapter = new ManualEntryAdapter({ propagate: straightLine });
    await adapter.connect();
    await adapter.startCapture();
    adapter.submitManualLaunch({ velocityMps: { x: 40, y: 0, z: 8 }, angularVelocityRadPerSec: null, launchTimeS: 5 });
    expect(() =>
      adapter.submitManualLaunch({ velocityMps: { x: 40, y: 0, z: 8 }, angularVelocityRadPerSec: null, launchTimeS: 5.05 }),
    ).toThrow(/too early/);
    expect(() =>
      adapter.submitManualLaunch({ velocityMps: { x: Number.NaN, y: 0, z: 8 }, angularVelocityRadPerSec: null, launchTimeS: 9 }),
    ).toThrow(/velocityMps/);
  });

  it("normalises -0 so a manual session round-trips through a replay file exactly", async () => {
    const adapter = new ManualEntryAdapter({ propagate: straightLine, launchPositionM: { x: -0, y: 0, z: -0 } });
    const received: RawSensorObservation[] = [];
    adapter.subscribeToObservations((o) => received.push(o));
    await adapter.connect();
    await adapter.startCapture();
    adapter.submitManualLaunch({ velocityMps: { x: 50, y: -0, z: 10 }, angularVelocityRadPerSec: { x: -0, y: -250, z: -0 }, launchTimeS: 1 });
    const [address] = ofKind(received, "ball-address");
    const [spin] = ofKind(received, "spin");
    const firstFrame = ofKind(received, "ball-position-3d")[0]!;
    expect(Object.is(address!.positionM.x, -0)).toBe(false);
    expect(Object.is(spin!.angularVelocityRadPerSec.x, -0)).toBe(false);
    expect(Object.is(firstFrame.positionM.y, -0)).toBe(false);
    expect(spin).toMatchObject({
      validObservationCount: MANUAL_SPIN_PLACEHOLDER_OBSERVATION_COUNT,
      fitResidualRad: MANUAL_SPIN_PLACEHOLDER_FIT_RESIDUAL_RAD,
    });
    const header = createReplayHeader({
      dataOrigin: "manual",
      description: "Manual developer session.",
      sensorConfiguration: adapter.getConfiguration(),
      calibration: null,
      syntheticTruth: null,
      createdUtc: "2026-10-01T18:00:00.000Z",
    });
    expect(parseReplay(serializeReplay({ header, observations: received })).observations).toEqual(received);
    // A manual stream can never be written as a live recording.
    expect(() =>
      createReplayHeader({ ...header, dataOrigin: "live", sensorConfiguration: adapter.getConfiguration(), createdUtc: header.createdUtc }),
    ).toThrow(/kind is "manual"/);
  });

  it("stops delivering when a subscriber stops capture and refuses re-entrant submissions", async () => {
    const adapter = new ManualEntryAdapter({ propagate: straightLine });
    const received: RawSensorObservation[] = [];
    const errors: unknown[] = [];
    adapter.subscribeToObservations((o) => {
      received.push(o);
      if (o.kind !== "trigger") return;
      try {
        adapter.submitManualLaunch({ velocityMps: { x: 40, y: 0, z: 8 }, angularVelocityRadPerSec: null, launchTimeS: 20 });
      } catch (error) {
        errors.push(error);
      }
      void adapter.stopCapture();
    });
    await adapter.connect();
    await adapter.startCapture();
    const delivered = adapter.submitManualLaunch({ velocityMps: { x: 40, y: 0, z: 8 }, angularVelocityRadPerSec: null, launchTimeS: 5 });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(ReentrantEmissionError);
    expect(adapter.state).toBe("connected");
    expect(delivered.map((o) => o.kind)).toEqual(["ball-address", "trigger"]);
    expect(received).toEqual(delivered);
  });
});

describe("hardware stubs", () => {
  const stubs: [string, () => SensorAdapter, string][] = [
    ["camera", () => new CameraLaunchMonitorAdapter(), "camera"],
    ["radar", () => new RadarLaunchMonitorAdapter(), "radar"],
    ["hybrid", () => new HybridFusionAdapter({ sensorId: "hybrid-bay-3" }), "hybrid"],
  ];

  for (const [name, make, kind] of stubs) {
    it(`${name}: honest hardware capabilities and a clearly labelled placeholder configuration`, () => {
      const adapter = make();
      expect(adapter.capabilities.kind).toBe(kind);
      expect(adapter.capabilities.isHardware).toBe(true);
      expect(adapter.capabilities.dataOrigin).toBe("live");
      expect(adapter.capabilities.requiresCalibration).toBe(true);
      expect(adapter.capabilities.measuresClubData).toBe(false);
      expect(adapter.capabilities.nominalFrameRateHz).toBeNull();
      expect(SensorCapabilitiesSchema.safeParse(adapter.capabilities).success).toBe(true);
      const config = adapter.getConfiguration();
      expect(SensorConfigurationSchema.safeParse(config).success).toBe(true);
      expect(config.kind).toBe(kind);
      expect(config.description).toMatch(/^PLACEHOLDER/);
      expect(config.version).toBe(`placeholder-${kind}-0`);
      expect(config.sensorId).toBe(adapter.id);
    });

    it(`${name}: connect, startCapture and calibrate reject with HardwareNotAvailableError`, async () => {
      const adapter = make();
      await expect(adapter.connect()).rejects.toThrow(HardwareNotAvailableError);
      await expect(adapter.connect()).rejects.toThrow(/no .* driver is implemented yet.*docs\/sensor-specification\.md/);
      await expect(adapter.startCapture()).rejects.toThrow(HardwareNotAvailableError);
      await expect(adapter.calibrate(CALIBRATION_INPUT)).rejects.toThrow(HardwareNotAvailableError);
      await expect(adapter.stopCapture()).resolves.toBeUndefined();
      await expect(adapter.disconnect()).resolves.toBeUndefined();
    });

    it(`${name}: reports disconnected and never emits`, async () => {
      const adapter = make();
      const health = await adapter.getHealth();
      expect(health.status).toBe("disconnected");
      expect(health.calibrationStatus).toBe("none");
      expect(health.sensorId).toBe(adapter.id);
      expect(health.messages[0]).toMatch(/placeholder/);
      const received: RawSensorObservation[] = [];
      const unsubscribe = adapter.subscribeToObservations((o) => received.push(o));
      await adapter.connect().catch(() => undefined);
      await adapter.startCapture().catch(() => undefined);
      expect(received).toHaveLength(0);
      unsubscribe();
    });
  }

  it("the error names the sensor kind", async () => {
    const error = await new RadarLaunchMonitorAdapter().connect().then(
      () => null,
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(HardwareNotAvailableError);
    expect((error as HardwareNotAvailableError).sensorKind).toBe("radar");
    expect((error as HardwareNotAvailableError).name).toBe("HardwareNotAvailableError");
  });
});
