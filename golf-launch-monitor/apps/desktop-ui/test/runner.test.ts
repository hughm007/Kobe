import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ShotRecordSchema } from "@glm/shared-types";
import { describe, expect, it } from "vitest";
import { NOT_CONFIGURED_MESSAGE } from "../src/worker/host";
import { errorsOf, exchange, shotsOf, TEST_MC_SAMPLES, testPipelineSettings, testRunner } from "./helpers";

const here = dirname(fileURLToPath(import.meta.url));
const replayText = readFileSync(join(here, "../../../datasets/synthetic/range-fixtures.jsonl"), "utf8");

describe("in-process pipeline runner (real packages, end to end)", () => {
  it("produces a schema-valid synthetic ShotRecord for a fixture, with busy bracketing and health", async () => {
    const runner = testRunner();
    const messages = await exchange(runner, [
      { type: "configure", config: testPipelineSettings() },
      { type: "hit-synthetic", fixtureId: "standard-7-iron", seed: 7, noisePreset: "clean" },
    ]);
    expect(errorsOf(messages)).toEqual([]);
    const shots = shotsOf(messages);
    expect(shots).toHaveLength(1);
    const r = shots[0]!;
    expect(() => ShotRecordSchema.parse(r)).not.toThrow();
    expect(r.dataOrigin).toBe("synthetic");
    expect(r.launch.dataOrigin).toBe("synthetic");
    expect(r.sessionId).toBe("session-test");
    expect(r.shotId).toBe("shot-0001");
    // Provenance: a synthetic stream is never labelled measured.
    for (const m of [r.launch.ballSpeedMps, r.launch.velocityMps, r.launch.totalSpinRpm]) {
      expect(m.source).toBe("synthetic");
      expect(m.source.startsWith("measured")).toBe(false);
    }
    expect(r.launch.spinMode).toBe("measured");
    expect(r.result).not.toBeNull();
    expect(r.result!.metrics.carryM.dependsOnSynthetic).toBe(true);
    expect(r.result!.metrics.carryM.interval?.sampleCount).toBe(TEST_MC_SAMPLES);
    expect(r.result!.metrics.carryM.value!).toBeGreaterThan(0);
    // Ball speed recovered from the fixture's 120 mph within the generator's noise.
    expect(r.launch.ballSpeedMps.value!).toBeCloseTo(120 * 0.44704, 0);
    expect(r.rawObservations).toBeNull();
    expect(r.scoring.eligible).toBe(false);
    const busy = messages.filter((m) => m.type === "busy").map((m) => (m.type === "busy" ? m.busy : null));
    expect(busy).toEqual([true, false]);
    const health = messages.find((m) => m.type === "health");
    expect(health?.type === "health" && health.adapterKind).toBe("synthetic");
    runner.dispose();
  });

  it("is deterministic for the same fixture, seed and preset (ids/clock aside)", async () => {
    const hit = async () =>
      shotsOf(
        await exchange(testRunner(), [
          { type: "configure", config: testPipelineSettings({ monteCarloSamples: 0 }) },
          { type: "hit-synthetic", fixtureId: "draw-driver", seed: 3, noisePreset: "realistic" },
        ]),
      )[0]!;
    const a = await hit();
    const b = await hit();
    expect(a.launch.velocityMps.value).toEqual(b.launch.velocityMps.value);
    expect(a.result?.metrics.carryM.value).toBe(b.result?.metrics.carryM.value);
    // A right-handed draw: spin axis tilted left (negative), ball curves LEFT (curve is +left).
    expect(b.launch.spinAxisTiltDeg.value!).toBeLessThan(0);
    expect(b.result!.metrics.curveM.value!).toBeGreaterThan(0);
  });

  it("reports an error, not a shot, before it is configured", async () => {
    const messages = await exchange(testRunner(), [
      { type: "hit-synthetic", fixtureId: "standard-7-iron", seed: 1, noisePreset: "clean" },
    ]);
    expect(shotsOf(messages)).toEqual([]);
    expect(errorsOf(messages)).toEqual([NOT_CONFIGURED_MESSAGE]);
  });

  it("rejects an invalid configuration and an unknown fixture with the package's message", async () => {
    const runner = testRunner();
    const bad = { ...testPipelineSettings(), environment: { indoorMode: true, windMps: { x: 3, y: 0, z: 0 } } };
    const messages = await exchange(runner, [
      { type: "configure", config: bad },
      { type: "configure", config: testPipelineSettings() },
      { type: "hit-synthetic", fixtureId: "no-such-fixture", seed: 1, noisePreset: "clean" },
    ]);
    const errors = errorsOf(messages);
    expect(errors).toHaveLength(2);
    expect(errors[0]).toMatch(/indoorMode/);
    expect(errors[1]).toMatch(/Unknown synthetic fixture "no-such-fixture"/);
    expect(shotsOf(messages)).toEqual([]);
  });

  it("no-spin-observed without a club: spin unavailable, simulation skipped with a reason", async () => {
    const [r] = shotsOf(
      await exchange(testRunner(), [
        { type: "configure", config: testPipelineSettings() },
        { type: "hit-synthetic", fixtureId: "straight-driver", seed: 5, noisePreset: "no-spin-observed" },
      ]),
    );
    expect(r!.launch.spinMode).toBe("unavailable");
    expect(r!.launch.totalSpinRpm.value).toBeNull();
    expect(r!.result).toBeNull();
    expect(r!.simulationSkippedReason).toMatch(/spin unavailable/i);
  });

  it("retains raw observations only with consent", async () => {
    const [r] = shotsOf(
      await exchange(testRunner(), [
        { type: "configure", config: testPipelineSettings({ storeRawObservations: true, monteCarloSamples: 0 }) },
        { type: "hit-synthetic", fixtureId: "standard-7-iron", seed: 2, noisePreset: "clean" },
      ]),
    );
    expect(r!.rawObservations!.length).toBeGreaterThan(10);
  });

  it("plays a replay file one shot at a time and keeps its synthetic origin", async () => {
    const runner = testRunner();
    const loaded = await exchange(runner, [
      { type: "configure", config: testPipelineSettings({ monteCarloSamples: 0 }) },
      { type: "load-replay", text: replayText, fileName: "range-fixtures.jsonl" },
    ]);
    const info = loaded.find((m) => m.type === "replay-loaded");
    expect(info?.type).toBe("replay-loaded");
    if (info?.type !== "replay-loaded") return;
    expect(info.shotCount).toBe(7);
    expect(info.fileName).toBe("range-fixtures.jsonl");
    expect(info.header.recordedDataOrigin).toBe("synthetic");
    expect(info.header.playbackDataOrigin).toBe("synthetic");
    expect(info.header.hasSyntheticTruth).toBe(true);

    const first = await exchange(runner, [{ type: "replay-next-shot" }]);
    const [shot] = shotsOf(first);
    expect(shot!.dataOrigin).toBe("synthetic");
    expect(shot!.launch.ballSpeedMps.source).toBe("synthetic");
    expect(first).toContainEqual({ type: "replay-progress", delivered: 1, shotCount: 7, exhausted: false });

    const rest = await exchange(runner, Array.from({ length: 7 }, () => ({ type: "replay-next-shot" as const })));
    expect(shotsOf(rest)).toHaveLength(6);
    const progress = rest.filter((m) => m.type === "replay-progress");
    expect(progress.at(-1)).toEqual({ type: "replay-progress", delivered: 7, shotCount: 7, exhausted: true });
    expect(errorsOf(rest)).toEqual([]);
  });

  it("reports a malformed replay file with its line number", async () => {
    const messages = await exchange(testRunner(), [
      { type: "configure", config: testPipelineSettings() },
      { type: "load-replay", text: "{not json\n" },
    ]);
    expect(errorsOf(messages)[0]).toMatch(/line 1/);
  });

  it("manual entry produces a MANUAL record whose launch matches the typed values", async () => {
    const [r] = shotsOf(
      await exchange(testRunner(), [
        { type: "configure", config: testPipelineSettings({ monteCarloSamples: 0 }) },
        {
          type: "manual-launch",
          ballSpeedMph: 150,
          verticalLaunchDeg: 12,
          horizontalLaunchDegLeftPositive: -3,
          totalSpinRpm: 3000,
          spinAxisDegRightPositive: 5,
        },
      ]),
    );
    expect(r!.dataOrigin).toBe("manual");
    expect(r!.launch.ballSpeedMps.source).toBe("manual");
    expect(r!.launch.ballSpeedMps.value!).toBeCloseTo(150 * 0.44704, 1);
    expect(r!.launch.verticalLaunchAngleDeg.value!).toBeCloseTo(12, 1);
    // -3 = 3° RIGHT in the left-positive convention.
    expect(r!.launch.horizontalLaunchAngleDeg.value!).toBeCloseTo(-3, 1);
    expect(r!.launch.totalSpinRpm.value!).toBeCloseTo(3000, -1);
    expect(r!.launch.spinAxisTiltDeg.value!).toBeCloseTo(5, 0);
    // Typed-in spin is MANUAL too (not relabelled synthetic, never measured).
    for (const m of [r!.launch.angularVelocityRadPerSec, r!.launch.totalSpinRpm, r!.launch.spinAxisTiltDeg]) {
      expect(m.source).toBe("manual");
    }
    expect(r!.launch.warnings.join(" ")).not.toMatch(/relabelled/);
  });

  it("manual entry with spin but no axis is rejected, nothing is fabricated", async () => {
    const messages = await exchange(testRunner(), [
      { type: "configure", config: testPipelineSettings({ monteCarloSamples: 0 }) },
      {
        type: "manual-launch",
        ballSpeedMph: 150,
        verticalLaunchDeg: 12,
        horizontalLaunchDegLeftPositive: 0,
        totalSpinRpm: 3000,
        spinAxisDegRightPositive: null,
      },
    ]);
    expect(shotsOf(messages)).toEqual([]);
    expect(errorsOf(messages)[0]).toMatch(/both total spin and spin axis/);
  });
});
