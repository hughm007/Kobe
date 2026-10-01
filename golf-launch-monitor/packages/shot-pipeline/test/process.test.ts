import { DEFAULT_INDOOR_ENVIRONMENT, getBallProfile } from "@glm/ballistics";
import { ManualEntryAdapter, defaultSyntheticSensorConfiguration } from "@glm/sensor-adapters";
import type { LaunchState, RawSensorObservation, SensorConfiguration, ShotResult } from "@glm/shared-types";
import { describe, expect, it } from "vitest";
import {
  createRangePipelineConfig,
  createTruthPropagator,
  deterministicIds,
  fixtureLaunchVectors,
  getFixture,
  measuredSourceFor,
  physicsVersionTag,
  scoringEligibility,
  ShotPipeline,
} from "../src/index";

const camera: SensorConfiguration = { ...defaultSyntheticSensorConfiguration("cam"), kind: "camera", description: "camera rig" };

describe("measuredSourceFor", () => {
  it("never labels synthetic or manual streams as measured, whatever the configuration says", () => {
    expect(measuredSourceFor("synthetic", camera)).toBe("synthetic");
    expect(measuredSourceFor("manual", camera)).toBe("manual");
  });

  it("maps hardware configurations to their measured label", () => {
    expect(measuredSourceFor("live", camera)).toBe("measured-camera");
    expect(measuredSourceFor("replay", { ...camera, kind: "radar" })).toBe("measured-radar");
    expect(measuredSourceFor("live", { ...camera, kind: "hybrid" })).toBe("measured-hybrid");
    expect(() => measuredSourceFor("replay", { ...camera, kind: "replay" })).toThrow(/original device/);
  });
});

describe("scoringEligibility", () => {
  const launch = (validity: LaunchState["validity"]) => ({ validity }) as LaunchState;
  const result = {} as ShotResult;
  it("only valid, simulated, live shots are eligible", () => {
    expect(scoringEligibility("live", launch("valid"), result).eligible).toBe(true);
    expect(scoringEligibility("live", launch("provisional"), result).eligible).toBe(false);
    expect(scoringEligibility("live", launch("invalid"), result).eligible).toBe(false);
    expect(scoringEligibility("live", launch("valid"), null).eligible).toBe(false);
    for (const origin of ["synthetic", "manual", "replay"] as const) {
      expect(scoringEligibility(origin, launch("valid"), result).eligible).toBe(false);
    }
  });
});

describe("physicsVersionTag", () => {
  it("records the air model, ground model and shot simulator versions", () => {
    expect(physicsVersionTag().split("+")).toHaveLength(3);
    expect(physicsVersionTag()).toMatch(/glm-physics-.*\+glm-ground-.*\+glm-shot-sim-/);
  });
});

describe("manual developer entry through the pipeline", () => {
  it("labels typed-in launch and spin values MANUAL (never synthetic or measured) and stays provisional", async () => {
    const env = DEFAULT_INDOOR_ENVIRONMENT;
    const ball = getBallProfile("premium-urethane-baseline");
    const adapter = new ManualEntryAdapter({ propagate: createTruthPropagator(env, ball) });
    const config = createRangePipelineConfig({
      sessionId: "manual-session",
      environment: env,
      sensorConfiguration: adapter.getConfiguration(),
      dataOrigin: "manual",
      ...deterministicIds(),
      simulationSettings: { monteCarloSamples: 0 },
    });
    const pipeline = new ShotPipeline(adapter, config);
    const records: Parameters<Parameters<ShotPipeline["onShot"]>[0]>[0][] = [];
    pipeline.onShot((r) => records.push(r));
    pipeline.attach();
    await adapter.connect();
    await adapter.startCapture();
    const { velocityMps, angularVelocityRadPerSec } = fixtureLaunchVectors(getFixture("standard-7-iron"));
    adapter.submitManualLaunch({ velocityMps, angularVelocityRadPerSec, launchTimeS: 2 });
    pipeline.flush();
    expect(records).toHaveLength(1);
    const launch = records[0]!.launch;
    expect(launch.dataOrigin).toBe("manual");
    expect(launch.velocityMps.source).toBe("manual");
    expect(launch.angularVelocityRadPerSec.source).toBe("manual");
    expect(launch.totalSpinRpm.source).toBe("manual");
    expect(launch.validity).toBe("provisional");
    expect(records[0]!.scoring.eligible).toBe(false);
  });
});

describe("launch reference time", () => {
  it("is the moment the fitted track passes the address position, not the trigger time", async () => {
    // A trigger that fires 2 ms late must not move the launch point: the reference time is
    // refined to the closest approach to the verified address position.
    const env = DEFAULT_INDOOR_ENVIRONMENT;
    const ball = getBallProfile("premium-urethane-baseline");
    const propagate = createTruthPropagator(env, ball);
    const { velocityMps, angularVelocityRadPerSec } = fixtureLaunchVectors(getFixture("straight-driver"));
    const launchTimeS = 3;
    const dts = Array.from({ length: 15 }, (_, k) => (k + 1) / 1000);
    const positions = propagate({ x: 0, y: 0, z: 0 }, velocityMps, angularVelocityRadPerSec, dts);
    let sequence = 0;
    const observations: RawSensorObservation[] = [
      { kind: "ball-address", sensorId: "syn", sequence: sequence++, timestampS: launchTimeS - 0.1, positionM: { x: 0, y: 0, z: 0 }, stationary: true, inHittingZone: true, ballCount: 1, confidence: 1 },
      { kind: "trigger", sensorId: "syn", sequence: sequence++, timestampS: launchTimeS + 0.002, triggerSource: "synthetic", confidence: 1 },
      ...positions.map((p, k): RawSensorObservation => ({
        kind: "ball-position-3d",
        sensorId: "syn",
        sequence: sequence++,
        timestampS: launchTimeS + (dts[k] as number),
        frameIndex: k + 1,
        positionM: p,
        covarianceM2: [
          [1e-8, 0, 0],
          [0, 1e-8, 0],
          [0, 0, 1e-8],
        ],
        reprojectionErrorPx: null,
        detectionConfidence: 1,
        cameraIds: [],
      })),
      { kind: "spin", sensorId: "syn", sequence: sequence++, timestampS: launchTimeS + 0.02, method: "synthetic", angularVelocityRadPerSec, covarianceRad2PerS2: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], validObservationCount: 20, fitResidualRad: 0.01, qualityFlags: [] },
    ];
    const sensorConfiguration = defaultSyntheticSensorConfiguration("syn");
    const config = createRangePipelineConfig({
      sessionId: "ref-time",
      environment: env,
      sensorConfiguration,
      dataOrigin: "synthetic",
      ...deterministicIds(),
      simulationSettings: { monteCarloSamples: 0 },
    });
    const adapterStub = { getConfiguration: () => sensorConfiguration, subscribeToObservations: () => () => undefined } as never;
    const pipeline = new ShotPipeline(adapterStub, config);
    const records: { launch: LaunchState }[] = [];
    pipeline.onShot((r) => records.push(r));
    for (const o of observations) pipeline.ingest(o);
    pipeline.flush();
    const launch = records[0]!.launch;
    // Without the refinement the reference would sit 2 ms (~15 cm of ball travel) late; the
    // linearised closest-approach step brings it to within ~10 us (< 1 mm of travel).
    expect(Math.abs(launch.launchTimeS! - launchTimeS)).toBeLessThan(3e-5);
    const p = launch.ballPositionM.value!;
    expect(Math.hypot(p.x, p.y, p.z)).toBeLessThan(0.002);
  });
});
