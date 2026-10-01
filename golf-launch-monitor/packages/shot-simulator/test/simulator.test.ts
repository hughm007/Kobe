import { DEFAULT_INDOOR_ENVIRONMENT, DEFAULT_SIMULATION_SETTINGS, getBallProfile } from "@glm/ballistics";
import { buildLaunchState, fitLaunchState, gravityOnlyTrajectoryModel, resolveSpin, launchMeasurementsFromFit } from "@glm/launch-state";
import type { BallPosition3dObservation, LaunchState, SpinObservation, Vec3 } from "@glm/shared-types";
import { createFlatRangeTerrain, createRegionTerrain } from "@glm/terrain-engine";
import { describe, expect, it } from "vitest";
import { signedOffsetFromLine, simulateShot, simulationBlocker, type SimulationContext } from "../src/index";

const env = DEFAULT_INDOOR_ENVIRONMENT;
const ball = getBallProfile("premium-urethane-baseline");
const range = createFlatRangeTerrain({ ballRadiusM: ball.diameterM / 2 });
const ctx = (overrides: Partial<SimulationContext> = {}): SimulationContext => ({
  environment: env,
  ballProfile: ball,
  terrain: range,
  settings: { ...DEFAULT_SIMULATION_SETTINGS, monteCarloSamples: 0 },
  ...overrides,
});

/** A synthetic launch state built through the real fit + spin + build path (noise-free track). */
function launchFrom(
  velocity: Vec3,
  spin: { omega: Vec3; observed: boolean; clubCategory?: "driver" | null },
): LaunchState {
  const model = gravityOnlyTrajectoryModel(env.gravityMps2);
  const dts = Array.from({ length: 12 }, (_, k) => (k + 1) / 1000);
  const positions = model.predict({ x: 0, y: 0, z: 0 }, velocity, dts);
  const observations: BallPosition3dObservation[] = positions.map((p, k) => ({
    kind: "ball-position-3d",
    sensorId: "syn",
    sequence: k,
    timestampS: dts[k] as number,
    frameIndex: k,
    positionM: p,
    covarianceM2: [
      [1e-8, 0, 0],
      [0, 1e-8, 0],
      [0, 0, 1e-8],
    ],
    reprojectionErrorPx: null,
    detectionConfidence: 1,
    cameraIds: [],
  }));
  const fit = fitLaunchState(observations, { trajectoryModel: model, referenceTimeS: 0 });
  if (!fit.ok) throw new Error(fit.reason);
  const spinObservations: SpinObservation[] = spin.observed
    ? [
        {
          kind: "spin",
          sensorId: "syn",
          sequence: 99,
          timestampS: 0.02,
          method: "synthetic",
          angularVelocityRadPerSec: spin.omega,
          covarianceRad2PerS2: [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
          ],
          validObservationCount: 20,
          fitResidualRad: 0.01,
          qualityFlags: [],
        },
      ]
    : [];
  const resolved = resolveSpin({
    spinObservations,
    velocity: launchMeasurementsFromFit(fit, "synthetic").velocityMps,
    clubCategory: spin.clubCategory ?? null,
    playerSpinHistory: [],
    allowGenericFallback: false,
    measuredSource: "synthetic",
  });
  return buildLaunchState({
    shotId: "s1",
    sessionId: "sess",
    playerId: null,
    timestampUtc: "2026-01-01T00:00:00.000Z",
    handedness: "right",
    clubId: null,
    ballId: ball.id,
    dataOrigin: "synthetic",
    calibrationVersion: "uncalibrated",
    sensorConfigurationVersion: "synthetic-config-1",
    ballProfileVersion: ball.version,
    physicsModelVersion: "test",
    fit,
    measuredSource: "synthetic",
    spin: resolved,
    extraFactors: [],
  });
}

const driverV: Vec3 = { x: 73.3, y: 0, z: 14.1 };
const backspin: Vec3 = { x: 0, y: -281, z: 0 };

describe("signedOffsetFromLine", () => {
  it("is +left of the line, -right, and null for a vertical direction", () => {
    expect(signedOffsetFromLine({ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 10, y: 2, z: 0 })).toBeCloseTo(2, 12);
    expect(signedOffsetFromLine({ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 10, y: -3, z: 0 })).toBeCloseTo(-3, 12);
    // Start line angled left: a point on that line has zero curve.
    expect(signedOffsetFromLine({ x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 5 }, { x: 4, y: 4, z: 0 })).toBeCloseTo(0, 12);
    expect(signedOffsetFromLine({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, { x: 1, y: 1, z: 0 })).toBeNull();
  });
});

describe("simulationBlocker", () => {
  it("blocks unavailable spin with an actionable reason and never fabricates a result", () => {
    const launch = launchFrom(driverV, { omega: backspin, observed: false });
    expect(launch.spinMode).toBe("unavailable");
    expect(simulationBlocker(launch)).toMatch(/Spin unavailable/);
    const outcome = simulateShot(launch, ctx());
    expect(outcome.ok).toBe(false);
  });

  it("blocks invalid launch states and quotes their rejection reasons", () => {
    const launch = launchFrom(driverV, { omega: backspin, observed: true });
    const invalid = { ...launch, validity: "invalid" as const, rejectionReasons: ["Ball was outside calibrated hitting zone."] };
    expect(simulationBlocker(invalid)).toMatch(/outside calibrated hitting zone/);
  });
});

describe("simulateShot", () => {
  it("produces a schema-valid, frozen result whose metrics carry provenance and the model version", () => {
    const outcome = simulateShot(launchFrom(driverV, { omega: backspin, observed: true }), ctx());
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    const r = outcome.result;
    expect(Object.isFrozen(r)).toBe(true);
    expect(r.metrics.carryM.dependsOnSynthetic).toBe(true);
    expect(r.metrics.carryM.dependsOnEstimated).toBe(false);
    expect(r.metrics.carryM.modelVersion).toMatch(/glm-shot-sim-/);
    expect(r.metrics.totalM.qualityFlags).toContain("ground-model-provisional");
    expect(r.metrics.carryM.value as number).toBeGreaterThan(200);
    expect(r.finalLie).toBe("fairway");
    expect(r.penalties).toEqual([]);
    // Ground metrics are capped below flight metrics by the provisional ground-model factor.
    expect(r.metrics.totalM.confidence).toBeLessThan(r.metrics.carryM.confidence + 1e-12);
  });

  it("estimated spin: curve unavailable (no fabricated zero) and confidence capped by the spin's own", () => {
    const launch = launchFrom(driverV, { omega: backspin, observed: false, clubCategory: "driver" });
    expect(launch.spinMode).toBe("estimated");
    const outcome = simulateShot(launch, ctx());
    if (!outcome.ok) throw new Error(outcome.reason);
    const m = outcome.result.metrics;
    expect(m.curveM.value).toBeNull();
    expect(m.curveM.qualityFlags).toContain("spin-axis-unavailable");
    expect(m.carryM.dependsOnEstimated).toBe(true);
    expect(m.carryM.confidence).toBeLessThanOrEqual(launch.angularVelocityRadPerSec.confidence);
    expect(m.carryLateralM.qualityFlags).toContain("spin-axis-assumed-zero");
  });

  it("assigns a penalty when the ball finishes in water", () => {
    const water = createRegionTerrain({
      id: "water-test",
      base: range,
      regions: [{ polygon: [{ x: 150, y: -100 }, { x: 400, y: -100 }, { x: 400, y: 100 }, { x: 150, y: 100 }], surface: "water" }],
    });
    const outcome = simulateShot(launchFrom(driverV, { omega: backspin, observed: true }), ctx({ terrain: water }));
    if (!outcome.ok) throw new Error(outcome.reason);
    expect(outcome.result.finalLie).toBe("water");
    expect(outcome.result.penalties.map((p) => p.kind)).toEqual(["water"]);
  });

  it("Monte Carlo is deterministic for a seed and brackets the nominal carry", () => {
    const launch = launchFrom(driverV, { omega: backspin, observed: true });
    const settings = { ...DEFAULT_SIMULATION_SETTINGS, monteCarloSamples: 40, monteCarloSeed: 7 };
    const a = simulateShot(launch, ctx({ settings }));
    const b = simulateShot(launch, ctx({ settings }));
    if (!a.ok || !b.ok) throw new Error("simulation failed");
    expect(a.result.metrics.carryM.interval).toEqual(b.result.metrics.carryM.interval);
    const i = a.result.metrics.carryM.interval!;
    expect(i.sampleCount).toBe(40);
    expect(i.p05).toBeLessThanOrEqual(i.p50);
    expect(i.p50).toBeLessThanOrEqual(i.p95);
    expect(a.result.metrics.carryM.value as number).toBeGreaterThan(i.p05 - 1);
    expect(a.result.metrics.carryM.value as number).toBeLessThan(i.p95 + 1);
  });
});
