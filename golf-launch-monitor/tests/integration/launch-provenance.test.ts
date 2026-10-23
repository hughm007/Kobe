/**
 * Per-value provenance of the fitted launch values (ball speed, launch angles):
 * - the drag/lift refit's dependence on an unmeasured spin is flagged and carried into the
 *   reported uncertainty (regression: a wedge spin prior on a driver moved VLA by 0.22 deg while
 *   the stated 90 % half-width was 0.05 deg, at confidence 1.00 with no flag);
 * - calibration and sensor-health evidence caps each value's confidence (regression: ball speed
 *   and launch direction read "High (1.00)" next to a sync-drift warning).
 */
import { defaultSyntheticSensorConfiguration, generateSyntheticSession } from "@glm/sensor-adapters";
import type { CalibrationRecord, ClubCategory, RawSensorObservation, SensorConfiguration, ShotRecord } from "@glm/shared-types";
import {
  createRangePipelineConfig,
  deterministicIds,
  fixtureLaunchVectors,
  fixtureShotSpec,
  getFixture,
  type PipelineConfig,
  ShotPipeline,
} from "@glm/shot-pipeline";
import { describe, expect, it } from "vitest";
import { ENV, noise, TRUTH } from "./helpers";

const Z90 = 1.6448536269514722;
const SYN = defaultSyntheticSensorConfiguration("syn");

function process(
  observations: readonly RawSensorObservation[],
  sensorConfiguration: SensorConfiguration,
  overrides: Partial<PipelineConfig>,
): ShotRecord {
  const config = createRangePipelineConfig({
    sessionId: "prov",
    environment: ENV,
    sensorConfiguration,
    dataOrigin: overrides.dataOrigin ?? "synthetic",
    ...deterministicIds(),
    simulationSettings: { monteCarloSamples: 0 },
    overrides,
  });
  const stub = { getConfiguration: () => sensorConfiguration, subscribeToObservations: () => () => undefined } as never;
  const pipeline = new ShotPipeline(stub, config);
  const records: ShotRecord[] = [];
  pipeline.onShot((r) => records.push(r));
  for (const o of observations) pipeline.ingest(o);
  pipeline.flush();
  expect(records).toHaveLength(1);
  return records[0]!;
}

function syntheticNoSpin(fixtureId: string, seed: number, frameCount = 20) {
  const spec = fixtureShotSpec(getFixture(fixtureId), { seed, noise: noise({ spin: null, frameCount }) });
  return generateSyntheticSession([spec], TRUTH, { sensorId: "syn" });
}

describe("refit dependence on unmeasured spin", () => {
  const cases: { fixtureId: string; club: ClubCategory | null }[] = [
    { fixtureId: "straight-driver", club: null },
    { fixtureId: "straight-driver", club: "wedge" },
    { fixtureId: "straight-driver", club: "driver" },
    { fixtureId: "standard-7-iron", club: null },
    { fixtureId: "standard-7-iron", club: "driver" },
  ];
  for (const { fixtureId, club } of cases) {
    it(`${fixtureId}, club ${club ?? "none"}: true VLA inside the reported 90 % interval, dependence flagged`, () => {
      const fixture = getFixture(fixtureId);
      const session = syntheticNoSpin(fixtureId, 3, 60);
      const record = process(session.observations, SYN, { clubCategory: club });
      const vla = record.launch.verticalLaunchAngleDeg;
      expect(record.launch.spinMode).toBe(club === null ? "unavailable" : "estimated");
      const sigma = vla.uncertainty?.sigma as number;
      expect(Math.abs((vla.value as number) - fixture.verticalLaunchDeg)).toBeLessThan(Z90 * sigma);
      const flag = club === null ? "launch-fit-assumes-zero-spin" : "launch-fit-uses-estimated-club-model-spin";
      for (const m of [record.launch.velocityMps, record.launch.ballSpeedMps, vla, record.launch.horizontalLaunchAngleDeg]) {
        expect(m.qualityFlags).toContain(flag);
      }
      // The speed interval covers the truth too.
      const speed = record.launch.ballSpeedMps;
      const trueSpeed = Math.hypot(...Object.values(fixtureLaunchVectors(fixture).velocityMps));
      expect(Math.abs((speed.value as number) - trueSpeed)).toBeLessThan(Z90 * (speed.uncertainty?.sigma as number));
    });
  }

  it("measured spin adds no spin-dependence flag", () => {
    const spec = fixtureShotSpec(getFixture("straight-driver"), { seed: 3 });
    const session = generateSyntheticSession([spec], TRUTH, { sensorId: "syn" });
    const record = process(session.observations, SYN, {});
    expect(record.launch.spinMode).toBe("measured");
    expect(record.launch.velocityMps.qualityFlags.some((f) => f.startsWith("launch-fit-"))).toBe(false);
  });
});

describe("calibration and sensor-health evidence on each launch value", () => {
  const camera: SensorConfiguration = {
    sensorId: "cam-rig",
    version: "camera-config-A",
    kind: "camera",
    description: "stereo rig",
    cameras: [],
    triggerSources: ["synthetic"],
    frameBuffer: { preTriggerS: 0.25, postTriggerS: 0.5 },
    storeRawCaptures: false,
  };
  const calibration = (status: CalibrationRecord["status"]) => ({ version: "cal-1", status }) as unknown as CalibrationRecord;

  function liveShot(status: CalibrationRecord["status"], drift: "ok" | "fail") {
    const spec = fixtureShotSpec(getFixture("draw-driver"), { seed: 5 });
    const session = generateSyntheticSession([spec], TRUTH, { sensorId: "cam-rig" });
    const observations = session.observations.map((o): RawSensorObservation => {
      // A live device would report its own rotation method; the synthetic label would be relabelled.
      if (o.kind === "spin") return { ...o, method: "marked-ball" };
      if (o.kind === "health") {
        return {
          ...o,
          health: {
            ...o.health,
            calibrationStatus: status,
            metrics: [{ id: "sync-drift", label: "Sync drift", value: 3, unit: "ms", status: drift, detail: "3 ms drift" }],
          },
        };
      }
      return o;
    });
    return process(observations, camera, { dataOrigin: "live", calibration: calibration(status) }).launch;
  }

  it("green calibration and healthy sync: launch values keep full confidence and no evidence flags", () => {
    const launch = liveShot("green", "ok");
    expect(launch.ballSpeedMps.source).toBe("measured-camera");
    expect(launch.ballSpeedMps.confidence).toBeGreaterThan(0.9);
    expect(launch.ballSpeedMps.qualityFlags.some((f) => f.startsWith("calibration-") || f.startsWith("sync-drift"))).toBe(false);
  });

  it("yellow calibration + failed sync drift: every launch value capped at 0.40 and flagged", () => {
    const launch = liveShot("yellow", "fail");
    for (const m of [launch.velocityMps, launch.ballSpeedMps, launch.verticalLaunchAngleDeg, launch.horizontalLaunchAngleDeg]) {
      expect(m.source).toBe("measured-camera");
      expect(m.confidence).toBeLessThanOrEqual(0.4 + 1e-12);
      expect(m.qualityFlags).toEqual(expect.arrayContaining(["calibration-yellow", "sync-drift-fail"]));
    }
  });

  it("red calibration (invalid shot): launch values have confidence 0, never 'High'", () => {
    const launch = liveShot("red", "ok");
    expect(launch.validity).toBe("invalid");
    expect(launch.ballSpeedMps.confidence).toBe(0);
    expect(launch.horizontalLaunchAngleDeg.confidence).toBe(0);
    expect(launch.ballSpeedMps.qualityFlags).toContain("calibration-red");
  });
});
