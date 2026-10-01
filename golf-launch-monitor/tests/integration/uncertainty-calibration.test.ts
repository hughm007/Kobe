/**
 * The uncertainty the product reports must be honest: across many seeded synthetic shots,
 * the stated 1-sigma launch uncertainty should contain the truth about 68 % of the time, and
 * the Monte Carlo 90 % carry interval should contain the true carry about 90 % of the time.
 * (Synthetic truth uses the same physics model, so this checks the estimator and the
 * uncertainty propagation, not the physics model's real-world accuracy.)
 */
import { ballSpeedMps, verticalLaunchAngleRad } from "@glm/launch-state";
import { simulateShot } from "@glm/shot-simulator";
import { fixtureLaunchVectors, getFixture } from "@glm/shot-pipeline";
import { createFlatRangeTerrain } from "@glm/terrain-engine";
import { DEFAULT_SIMULATION_SETTINGS } from "@glm/ballistics";
import { radToDeg } from "@glm/units";
import { describe, expect, it } from "vitest";
import { BALL, ENV, noise, runSynthetic } from "./helpers";

describe("reported uncertainty is calibrated (synthetic)", () => {
  it("1-sigma ball speed and launch angle intervals cover the truth ~68 % of the time", async () => {
    const fixture = getFixture("straight-driver");
    const truth = fixtureLaunchVectors(fixture);
    const trueSpeed = ballSpeedMps(truth.velocityMps);
    const trueVla = radToDeg(verticalLaunchAngleRad(truth.velocityMps));
    const records = await runSynthetic(Array.from({ length: 80 }, (_, i) => ({ fixtureId: fixture.id, seed: 5000 + i })));
    let speedHits = 0;
    let vlaHits = 0;
    for (const r of records) {
      const s = r.launch.ballSpeedMps;
      const a = r.launch.verticalLaunchAngleDeg;
      if (Math.abs((s.value as number) - trueSpeed) <= (s.uncertainty?.sigma as number)) speedHits++;
      if (Math.abs((a.value as number) - trueVla) <= (a.uncertainty?.sigma as number)) vlaHits++;
    }
    // Binomial(80, 0.68): mean 54.4, sd 4.2 -> accept 3 sd either side.
    expect(speedHits / records.length).toBeGreaterThan(0.52);
    expect(speedHits / records.length).toBeLessThan(0.84);
    expect(vlaHits / records.length).toBeGreaterThan(0.52);
    expect(vlaHits / records.length).toBeLessThan(0.84);
  });

  it("regression (spec §7): timestamp jitter is propagated, so coverage stays ~68 % at 50 us jitter", async () => {
    const fixture = getFixture("straight-driver");
    const truth = fixtureLaunchVectors(fixture);
    const trueSpeed = ballSpeedMps(truth.velocityMps);
    const trueVla = radToDeg(verticalLaunchAngleRad(truth.velocityMps));
    const jitterS = 50e-6;
    const shots = Array.from({ length: 80 }, (_, i) => ({ fixtureId: fixture.id, seed: 5000 + i, noise: noise({ timestampJitterS: jitterS }) }));
    const coverage = (records: Awaited<ReturnType<typeof runSynthetic>>) => {
      let speed = 0;
      let vla = 0;
      for (const r of records) {
        const s = r.launch.ballSpeedMps;
        const a = r.launch.verticalLaunchAngleDeg;
        if (Math.abs((s.value as number) - trueSpeed) <= (s.uncertainty?.sigma as number)) speed++;
        if (Math.abs((a.value as number) - trueVla) <= (a.uncertainty?.sigma as number)) vla++;
      }
      return { speed: speed / records.length, vla: vla / records.length };
    };
    // Timestamps treated as exact: the along-track (speed) sigma is understated (~40 % coverage).
    const exact = coverage(await runSynthetic(shots));
    expect(exact.speed).toBeLessThan(0.52);
    // Propagated (errors-in-variables): both back inside the Binomial(80, 0.68) 3-sd band.
    const records = await runSynthetic(shots, { timestampSigmaS: jitterS });
    expect(records[0]!.launch.velocityMps.qualityFlags).toContain("timestamp-uncertainty-propagated");
    const propagated = coverage(records);
    expect(propagated.speed).toBeGreaterThan(0.52);
    expect(propagated.speed).toBeLessThan(0.84);
    expect(propagated.vla).toBeGreaterThan(0.52);
    expect(propagated.vla).toBeLessThan(0.84);
  }, 120_000);

  it("the Monte Carlo 90 % carry interval covers the true carry most of the time", async () => {
    const fixture = getFixture("standard-7-iron");
    const truth = fixtureLaunchVectors(fixture);
    const records = await runSynthetic(
      Array.from({ length: 24 }, (_, i) => ({ fixtureId: fixture.id, seed: 7000 + i })),
      {},
      40,
    );
    const first = records[0]!;
    const trueResult = simulateShot(
      {
        ...first.launch,
        ballPositionM: { ...first.launch.ballPositionM, value: { x: 0, y: 0, z: 0 } },
        velocityMps: { ...first.launch.velocityMps, value: truth.velocityMps },
        angularVelocityRadPerSec: { ...first.launch.angularVelocityRadPerSec, value: truth.angularVelocityRadPerSec },
      },
      {
        environment: ENV,
        ballProfile: BALL,
        terrain: createFlatRangeTerrain({ ballRadiusM: BALL.diameterM / 2 }),
        settings: { ...DEFAULT_SIMULATION_SETTINGS, monteCarloSamples: 0 },
      },
    );
    expect(trueResult.ok).toBe(true);
    const trueCarry = trueResult.ok ? (trueResult.result.metrics.carryM.value as number) : NaN;
    let hits = 0;
    for (const r of records) {
      const interval = r.result!.metrics.carryM.interval!;
      if (trueCarry >= interval.p05 && trueCarry <= interval.p95) hits++;
    }
    // Nominal 90 %; with 40-sample percentile estimates and 24 trials accept >= 70 %.
    expect(hits / records.length).toBeGreaterThanOrEqual(0.7);
  }, 120_000);
});
