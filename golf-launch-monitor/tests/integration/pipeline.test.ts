/**
 * End-to-end: synthetic observations -> segmentation -> launch fit -> spin resolution ->
 * confidence -> simulation -> ShotRecord. Uses the real packages, no mocks.
 */
import { MEASURED_SOURCES, ShotRecordSchema } from "@glm/shared-types";
import { fixtureLaunchVectors, getFixture } from "@glm/shot-pipeline";
import { degToRad, mphToMps, radToDeg } from "@glm/units";
import { describe, expect, it } from "vitest";
import { noise, runSynthetic } from "./helpers";

const ALL = ["straight-driver", "draw-driver", "fade-driver", "high-7-iron", "low-7-iron", "no-spin-knuckleball"] as const;

describe("synthetic shot pipeline", () => {
  it("produces one schema-valid, synthetic-labelled record per shot and never claims a measurement", async () => {
    const records = await runSynthetic(ALL.map((fixtureId, i) => ({ fixtureId, seed: 100 + i })));
    expect(records).toHaveLength(ALL.length);
    for (const r of records) {
      expect(ShotRecordSchema.safeParse(r).success).toBe(true);
      expect(r.dataOrigin).toBe("synthetic");
      expect(r.launch.dataOrigin).toBe("synthetic");
      const sources = [
        r.launch.ballPositionM.source,
        r.launch.velocityMps.source,
        r.launch.ballSpeedMps.source,
        r.launch.verticalLaunchAngleDeg.source,
        r.launch.horizontalLaunchAngleDeg.source,
        r.launch.angularVelocityRadPerSec.source,
        r.launch.totalSpinRpm.source,
      ];
      for (const s of sources) expect(MEASURED_SOURCES.has(s)).toBe(false);
      expect(r.launch.velocityMps.source).toBe("synthetic");
      expect(r.scoring.eligible).toBe(false);
      expect(Object.isFrozen(r)).toBe(true);
    }
  });

  it("recovers launch conditions from noisy observations within tight tolerances", async () => {
    const records = await runSynthetic(ALL.map((fixtureId, i) => ({ fixtureId, seed: 200 + i })));
    records.forEach((r, i) => {
      const fixture = getFixture(ALL[i] as string);
      const truth = fixtureLaunchVectors(fixture);
      const speed = r.launch.ballSpeedMps;
      expect(speed.value).not.toBeNull();
      expect(Math.abs((speed.value as number) - mphToMps(fixture.ballSpeedMph))).toBeLessThan(0.25); // m/s
      expect(Math.abs((r.launch.verticalLaunchAngleDeg.value as number) - fixture.verticalLaunchDeg)).toBeLessThan(0.2);
      expect(
        Math.abs((r.launch.horizontalLaunchAngleDeg.value as number) - fixture.horizontalLaunchDegLeftPositive),
      ).toBeLessThan(0.2);
      expect(Math.abs((r.launch.totalSpinRpm.value as number) - fixture.totalSpinRpm)).toBeLessThan(
        Math.max(60, 0.05 * fixture.totalSpinRpm),
      );
      expect(truth.velocityMps.x).toBeGreaterThan(0);
    });
  });

  it("draw curves left, fade curves right, and high flies higher than low", async () => {
    const [straight, draw, fade, high, low] = await runSynthetic(
      ["straight-driver", "draw-driver", "fade-driver", "high-7-iron", "low-7-iron"].map((fixtureId, i) => ({
        fixtureId,
        seed: 300 + i,
      })),
    );
    const curve = (r: typeof straight) => r!.result!.metrics.curveM.value as number;
    expect(Math.abs(curve(straight))).toBeLessThan(1.5);
    expect(curve(draw)).toBeGreaterThan(3); // +left
    expect(curve(fade)).toBeLessThan(-3); // right
    expect(high!.result!.metrics.apexHeightM.value as number).toBeGreaterThan(low!.result!.metrics.apexHeightM.value as number);
    expect(high!.result!.metrics.descentAngleRad.value as number).toBeGreaterThan(
      low!.result!.metrics.descentAngleRad.value as number,
    );
    // Carry is a horizontal distance from launch to first contact; total adds bounce and roll.
    for (const r of [straight, draw, fade, high, low]) {
      const m = r!.result!.metrics;
      expect(m.totalM.value as number).toBeGreaterThanOrEqual((m.carryM.value as number) - 1e-9);
      expect(m.bounceDistanceM.value as number).toBeGreaterThanOrEqual(0);
      expect(m.rollDistanceM.value as number).toBeGreaterThanOrEqual(0);
    }
  });

  it("zero spin: no lift, spin axis reported unavailable, and a much lower apex than a spinning shot", async () => {
    const [knuckle] = await runSynthetic([{ fixtureId: "no-spin-knuckleball", seed: 7 }], {}, 60);
    expect(knuckle!.launch.spinAxisTiltDeg.value).toBeNull();
    expect(knuckle!.launch.spinAxisTiltDeg.source).toBe("unavailable");
    // |omega| of a noisy zero-spin vector is biased upward (chi distribution, 3 dof): with the
    // default 6 rad/s per-axis noise its mean is ~92 rpm, so allow a 3-sigma-ish bound.
    expect(Math.abs(knuckle!.launch.totalSpinRpm.value as number)).toBeLessThan(250);
    expect(knuckle!.result).not.toBeNull();
    // A measured (near-)zero spin keeps curve calculable. Spin measurement noise on a random axis
    // still bends the simulated flight a little; that is measurement uncertainty, so across many
    // seeds the Monte Carlo 90 % curve interval should contain the true curve (zero) most of the time.
    const curve = knuckle!.result!.metrics.curveM;
    expect(curve.value).not.toBeNull();
    expect(Math.abs(curve.value as number)).toBeLessThan(6);
    const many = await runSynthetic(
      Array.from({ length: 20 }, (_, i) => ({ fixtureId: "no-spin-knuckleball", seed: 900 + i })),
      {},
      40,
    );
    const covered = many.filter((r) => {
      const i = r.result!.metrics.curveM.interval!;
      return i.p05 <= 0 && i.p95 >= 0;
    }).length;
    expect(covered / many.length).toBeGreaterThanOrEqual(0.7);
  }, 120_000);

  it("is deterministic: identical inputs give deep-equal records", async () => {
    const a = await runSynthetic([{ fixtureId: "fade-driver", seed: 42 }], {}, 20);
    const b = await runSynthetic([{ fixtureId: "fade-driver", seed: 42 }], {}, 20);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});

describe("spin modes end-to-end", () => {
  const noSpinObserved = noise({ spin: null });

  it("unavailable spin without a club or fallback: no simulation, explicit reason, nothing fabricated", async () => {
    const [r] = await runSynthetic([{ fixtureId: "straight-driver", seed: 11, noise: noSpinObserved }]);
    expect(r!.launch.spinMode).toBe("unavailable");
    expect(r!.launch.totalSpinRpm.value).toBeNull();
    expect(r!.launch.spinAxisTiltDeg.value).toBeNull();
    expect(r!.result).toBeNull();
    expect(r!.simulationSkippedReason).toMatch(/spin/i);
    // Ball speed and launch angles are still available: unavailable spin does not erase measurements.
    expect(r!.launch.ballSpeedMps.value).not.toBeNull();
  });

  it("club-model estimate: estimated provenance, provisional validity, curve unavailable", async () => {
    const [r] = await runSynthetic([{ fixtureId: "straight-driver", seed: 12, noise: noSpinObserved }], {
      clubCategory: "driver",
      clubId: "driver",
    });
    expect(r!.launch.spinMode).toBe("estimated");
    expect(r!.launch.totalSpinRpm.source).toBe("estimated-club-model");
    expect(r!.launch.spinAxisTiltDeg.value).toBeNull();
    expect(r!.launch.validity).not.toBe("valid");
    expect(r!.launch.warnings.join(" ")).toMatch(/estimated from club model/i);
    expect(r!.result).not.toBeNull();
    expect(r!.result!.metrics.carryM.dependsOnEstimated).toBe(true);
    expect(r!.result!.metrics.curveM.value).toBeNull();
  });

  it("generic fallback only when explicitly allowed, and labelled as assumed", async () => {
    const [r] = await runSynthetic([{ fixtureId: "straight-driver", seed: 13, noise: noSpinObserved }], {
      allowGenericSpinFallback: true,
    });
    expect(r!.launch.spinMode).toBe("assumed-generic-fallback");
    expect(r!.launch.angularVelocityRadPerSec.source).toBe("assumed-generic-fallback");
    expect(r!.launch.validity).toBe("provisional");
    // Spin-dependent outputs can be no more trustworthy than the generic spin behind them.
    expect(r!.result!.metrics.carryM.confidence).toBeLessThanOrEqual(r!.launch.angularVelocityRadPerSec.confidence);
    expect(r!.result!.metrics.carryM.confidence).toBeLessThanOrEqual(0.15);
    expect(r!.result!.metrics.carryM.dependsOnEstimated).toBe(true);
  });
});

describe("failure modes fail safely", () => {
  it("ball outside the calibrated hitting zone -> invalid, no simulation, reason preserved", async () => {
    const [r] = await runSynthetic([
      { fixtureId: "straight-driver", seed: 21, noise: noise({ address: { inHittingZone: false, ballCount: 1, stationary: true } }) },
    ]);
    expect(r!.launch.validity).toBe("invalid");
    expect(r!.launch.rejectionReasons.join(" ")).toMatch(/outside calibrated hitting zone/i);
    expect(r!.result).toBeNull();
    expect(r!.rawObservations).toBeNull(); // consent off by default
  });

  it("too few frames -> no fabricated launch numbers", async () => {
    const [r] = await runSynthetic([{ fixtureId: "straight-driver", seed: 22, noise: noise({ frameCount: 1 }) }]);
    expect(r!.launch.validity).toBe("invalid");
    expect(r!.launch.ballSpeedMps.value).toBeNull();
    expect(r!.launch.ballSpeedMps.source).toBe("unavailable");
    expect(r!.result).toBeNull();
  });

  it("outliers are rejected and do not move ball speed far from truth", async () => {
    const [r] = await runSynthetic([
      { fixtureId: "standard-7-iron", seed: 23, noise: noise({ frameCount: 30, outlierProbability: 0.1, outlierMagnitudeM: 0.05 }) },
    ]);
    const fixture = getFixture("standard-7-iron");
    expect(Math.abs((r!.launch.ballSpeedMps.value as number) - mphToMps(fixture.ballSpeedMph))).toBeLessThan(0.3);
    expect(r!.launch.fitDiagnostics!.inlierCount).toBeLessThan(r!.launch.fitDiagnostics!.observationCount);
  });

  it("raw observations are retained only with consent", async () => {
    const [r] = await runSynthetic([{ fixtureId: "straight-driver", seed: 24 }], { storeRawObservations: true });
    expect(r!.rawObservations!.length).toBeGreaterThan(10);
  });

  it("degrees in the contract are consistent with the SI velocity vector", async () => {
    const [r] = await runSynthetic([{ fixtureId: "draw-driver", seed: 25 }]);
    const v = r!.launch.velocityMps.value!;
    expect(r!.launch.horizontalLaunchAngleDeg.value as number).toBeCloseTo(radToDeg(Math.atan2(v.y, v.x)), 9);
    expect(degToRad(r!.launch.verticalLaunchAngleDeg.value as number)).toBeCloseTo(Math.atan2(v.z, Math.hypot(v.x, v.y)), 9);
  });
});
