import { describe, expect, it } from "vitest";
import { dot, horizontalDistance, isFiniteVec, vec3 } from "@glm/core-math";
import { GroundMotionResultSchema, type TerrainQuery } from "@glm/shared-types";
import { createFlatRangeTerrain, createRegionTerrain, getSurface, withSurfaceOverrides } from "@glm/terrain-engine";
import {
  DEFAULT_GROUND_SETTINGS,
  GROUND_MODEL_VERSION,
  groundDistances,
  simulateGroundMotion,
  type GroundMotionInput,
  type HopSimulator,
} from "../src/index";
import { G, gravityHop, R, TEST_BALL } from "./helpers";

const green = createFlatRangeTerrain({ ballRadiusM: R, surface: "green" });

function landing(terrain: TerrainQuery, velocity = vec3(8, 0, -6), spin = vec3(0, -200, 0), at = vec3(0, 0, 0), timeS = 4.5) {
  return {
    timeS,
    positionM: at,
    velocityMps: velocity,
    angularVelocityRadPerSec: spin,
    terrain: terrain.sample(at.x, at.y),
  };
}

function run(overrides: Partial<GroundMotionInput> = {}, terrain: TerrainQuery = green) {
  return simulateGroundMotion({
    firstContact: landing(terrain),
    terrain,
    ballProfile: TEST_BALL,
    gravityMps2: G,
    hop: gravityHop(terrain, R),
    settings: { maxGroundTimeS: 30, outputSampleIntervalS: 0.01 },
    ...overrides,
  });
}

describe("ground model constants", () => {
  it("exposes the version and documented defaults", () => {
    expect(GROUND_MODEL_VERSION).toBe("glm-ground-0.3.0-provisional");
    expect(DEFAULT_GROUND_SETTINGS).toEqual({
      rollTimestepS: 0.001,
      restSpeedMps: 0.01,
      minBounceNormalSpeedMps: 0.25,
      maxRollEntrySpeedMps: 15,
      maxBounces: 20,
      slipToRollToleranceMps: 1e-3,
    });
  });
});

describe("simulateGroundMotion with a gravity-only hop", () => {
  const result = run();

  it("bounces several times with decreasing heights, then rolls to a finite rest", () => {
    expect(result.modelVersion).toBe(GROUND_MODEL_VERSION);
    expect(result.bounces.length).toBeGreaterThanOrEqual(3);
    const n = vec3(0, 0, 1);
    const apexHeights = result.bounces.map((b) => dot(b.outgoingVelocityMps, n) ** 2 / (2 * G));
    for (let i = 1; i < apexHeights.length; i++) expect(apexHeights[i]!).toBeLessThan(apexHeights[i - 1]!);
    result.bounces.forEach((b, i) => {
      expect(b.index).toBe(i);
      expect(b.surface).toBe("green");
      // Every bounce but the last hops; the last is too weak and hands over to the roll.
      if (i < result.bounces.length - 1) expect(b.outgoingVelocityMps.z).toBeGreaterThan(DEFAULT_GROUND_SETTINGS.minBounceNormalSpeedMps);
      else expect(b.outgoingVelocityMps.z).toBeLessThanOrEqual(DEFAULT_GROUND_SETTINGS.minBounceNormalSpeedMps);
    });
    // Bounce times follow the hop flight times.
    for (let i = 1; i < result.bounces.length; i++) {
      const prev = result.bounces[i - 1]!;
      expect(result.bounces[i]!.timeS - prev.timeS).toBeCloseTo((2 * prev.outgoingVelocityMps.z) / G, 9);
    }
    expect(result.termination).toBe("rest");
    expect(result.finalSurface).toBe("green");
    expect(result.rollStartPositionM).not.toBeNull();
    expect(isFiniteVec(result.restPositionM)).toBe(true);
    expect(result.restPositionM.x).toBeGreaterThan(result.rollStartPositionM!.x);
    expect(result.rollStartPositionM!.x).toBeGreaterThan(0);
    expect(result.restTimeS).toBeGreaterThan(result.bounces[result.bounces.length - 1]!.timeS);
    expect(Math.abs(result.restPositionM.y)).toBeLessThan(1e-12);
  });

  it("produces schema-valid, deep-frozen output with strictly increasing sample times", () => {
    expect(() => GroundMotionResultSchema.parse(result)).not.toThrow();
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.bounces[0]?.outgoingVelocityMps)).toBe(true);
    expect(Object.isFrozen(result.samples)).toBe(true);
    for (let i = 1; i < result.samples.length; i++) expect(result.samples[i]!.tS).toBeGreaterThan(result.samples[i - 1]!.tS);
    // Hop samples (bounce-air) come before roll samples; no roll sample precedes a hop sample.
    const phases = result.samples.map((s) => s.phase);
    expect(phases).toContain("bounce-air");
    expect(phases).toContain("roll");
    expect(phases.lastIndexOf("bounce-air")).toBeLessThan(phases.indexOf("roll"));
    expect(result.samples[0]!.tS).toBeGreaterThanOrEqual(4.5);
    expect(result.samples[result.samples.length - 1]!.tS).toBe(result.restTimeS);
  });

  it("is deterministic", () => {
    expect(run()).toEqual(result);
  });

  it("splits ground distance into bounce and roll", () => {
    const d = groundDistances(vec3(0, 0, 0), result);
    expect(d.bounceDistanceM).toBeCloseTo(result.rollStartPositionM!.x, 12);
    expect(d.rollDistanceM).toBeCloseTo(result.restPositionM.x - result.rollStartPositionM!.x, 12);
    expect(d.bounceDistanceM + d.rollDistanceM).toBeCloseTo(horizontalDistance(vec3(0, 0, 0), result.restPositionM), 9);
  });

  it("caps bounces at maxBounces", () => {
    const capped = run({ settings: { maxGroundTimeS: 30, outputSampleIntervalS: 0.01, maxBounces: 1 } });
    expect(capped.bounces).toHaveLength(1);
    expect(capped.bounces[0]!.outgoingVelocityMps.z).toBeGreaterThan(DEFAULT_GROUND_SETTINGS.minBounceNormalSpeedMps);
    expect(capped.termination).toBe("rest");
    expect(capped.samples.every((s) => s.phase === "roll")).toBe(true);
  });

  it("stops with max-time when the ground budget runs out", () => {
    const short = run({ settings: { maxGroundTimeS: 0.05, outputSampleIntervalS: 0.01 } });
    expect(short.termination).toBe("max-time");
    expect(short.restTimeS).toBeLessThanOrEqual(4.5 + 0.05 + 1e-12);
    expect(short.samples.every((s) => s.tS <= 4.55 + 1e-12)).toBe(true);
  });
});

describe("simulateGroundMotion terminal surfaces and hop failures", () => {
  const pond = createRegionTerrain({
    id: "pond",
    base: green,
    regions: [{ polygon: [vec3(1, -5, 0), vec3(9, -5, 0), vec3(9, 5, 0), vec3(1, 5, 0)], surface: "water" }],
  });

  it("ends immediately when the first contact is on a terminal surface", () => {
    const first = landing(pond, vec3(8, 0, -6), vec3(0, 0, 0), vec3(2, 0, 0));
    const res = run({ firstContact: first, terrain: pond, hop: gravityHop(pond, R) }, pond);
    expect(res.termination).toBe("terminal-surface");
    expect(res.bounces).toHaveLength(0);
    expect(res.samples).toHaveLength(0);
    expect(res.restPositionM).toEqual(vec3(2, 0, 0));
    expect(res.restTimeS).toBe(4.5);
    expect(res.finalSurface).toBe("water");
    expect(res.rollStartPositionM).toBeNull();
    expect(groundDistances(vec3(2, 0, 0), res)).toEqual({ bounceDistanceM: 0, rollDistanceM: 0 });
  });

  it("ends when a bounce lands in water", () => {
    const res = run({ firstContact: landing(pond, vec3(10, 0, -8), vec3(0, 0, 0)), terrain: pond, hop: gravityHop(pond, R) }, pond);
    expect(res.bounces).toHaveLength(1);
    expect(res.termination).toBe("terminal-surface");
    expect(res.finalSurface).toBe("water");
    expect(res.restPositionM.x).toBeGreaterThan(1);
  });

  it("throws on a hop numerical failure and reports max-time when a hop never lands", () => {
    const failing: HopSimulator = () => ({ samples: [], contact: null, termination: "numerical-failure" });
    expect(() => run({ hop: failing })).toThrow(/numerical-failure/);
    const lost: HopSimulator = (state, t0) => ({
      samples: [{ tS: t0 + 0.1, ...state, phase: "bounce-air" }],
      contact: null,
      termination: "max-time",
    });
    const res = run({ hop: lost });
    expect(res.termination).toBe("max-time");
    expect(res.bounces).toHaveLength(1);
    expect(res.restTimeS).toBeCloseTo(4.6, 12);
  });

  it("rejects hops that return relative, backward or out-of-window times instead of dropping samples", () => {
    const honest = gravityHop(green, R);
    const relative: HopSimulator = (state, t0) => {
      const out = honest(state, t0);
      return { ...out, samples: out.samples.map((s) => ({ ...s, tS: s.tS - t0 })) };
    };
    expect(() => run({ hop: relative })).toThrow(/outside .*must be absolute/);
    const backward: HopSimulator = (state, t0) => {
      const out = honest(state, t0);
      return { samples: [], termination: out.termination, contact: { ...out.contact!, timeS: t0 - 1 } };
    };
    expect(() => run({ hop: backward })).toThrow(/contact time .* not after its start/);
    const zeroLength: HopSimulator = (state, t0) => ({ ...honest(state, t0), samples: [], contact: { ...honest(state, t0).contact!, timeS: t0 } });
    expect(() => run({ hop: zeroLength })).toThrow(/not after its start/);
    const pastContact: HopSimulator = (state, t0) => {
      const out = honest(state, t0);
      const last = out.samples[out.samples.length - 1]!;
      return { ...out, samples: [...out.samples, { ...last, tS: last.tS + 0.5 }] };
    };
    expect(() => run({ hop: pastContact })).toThrow(/outside/);
    const shuffled: HopSimulator = (state, t0) => {
      const out = honest(state, t0);
      return { ...out, samples: [...out.samples].reverse() };
    };
    expect(() => run({ hop: shuffled })).toThrow(/before the previous sample/);
    const nonFinite: HopSimulator = (state, t0) => ({ ...honest(state, t0), samples: [{ tS: Number.NaN, ...state, phase: "bounce-air" }] });
    expect(() => run({ hop: nonFinite })).toThrow(/outside/);
  });

  it("keeps every honest hop sample (only the shared contact instant is de-duplicated)", () => {
    const res = run();
    const hopSampleCount = res.samples.filter((s) => s.phase === "bounce-air").length;
    // Re-run the same hops to count what they returned.
    let returned = 0;
    let hops = 0;
    const honest = gravityHop(green, R);
    const counting: HopSimulator = (state, t0) => {
      const out = honest(state, t0);
      returned += out.samples.length;
      hops++;
      return out;
    };
    run({ hop: counting });
    // Each hop after the first starts at the previous hop's contact instant: one duplicate each.
    expect(hopSampleCount).toBe(returned - (hops - 1));
  });

  it("rejects a negative first-contact time and produces schema-valid output otherwise", () => {
    expect(() => run({ firstContact: landing(green, vec3(8, 0, -6), vec3(0, -200, 0), vec3(0, 0, 0), -1) })).toThrow(/>= 0/);
    const atZero = run({ firstContact: landing(green, vec3(8, 0, -6), vec3(0, -200, 0), vec3(0, 0, 0), 0) });
    expect(GroundMotionResultSchema.safeParse(atZero).success).toBe(true);
  });

  it("validates settings", () => {
    expect(() => run({ settings: { maxGroundTimeS: -1, outputSampleIntervalS: 0.01 } })).toThrow(RangeError);
    expect(() => run({ settings: { maxGroundTimeS: 1, outputSampleIntervalS: 0.01, maxBounces: 0 } })).toThrow(RangeError);
  });
});

describe("groundDistances", () => {
  const along = (v: { x: number; y: number; z: number }) => [{ incomingVelocityMps: v }];

  it("assigns everything to bounce when the ball never rolled", () => {
    // Landing heading (3, 4)/5: the (3, 4) displacement projects to exactly 5.
    const d = groundDistances(vec3(1, 1, 0), { rollStartPositionM: null, restPositionM: vec3(4, 5, -1), bounces: along(vec3(6, 8, -5)) });
    expect(d).toEqual({ bounceDistanceM: 5, rollDistanceM: 0 });
  });

  it("projects horizontal displacement on the landing heading, ignoring height and sideways motion", () => {
    const d = groundDistances(vec3(0, 0, 0), {
      rollStartPositionM: vec3(3, 4, 2),
      restPositionM: vec3(10, -2, -7),
      bounces: along(vec3(20, 0, -15)),
    });
    expect(d.bounceDistanceM).toBe(3);
    expect(d.rollDistanceM).toBe(7);
  });

  it("falls back to the target line (+X) without a usable landing heading", () => {
    const res = { rollStartPositionM: vec3(-1, 5, 0), restPositionM: vec3(-3, 9, 0) };
    expect(groundDistances(vec3(0, 0, 0), { ...res, bounces: [] })).toEqual({ bounceDistanceM: -1, rollDistanceM: -2 });
    expect(groundDistances(vec3(0, 0, 0), { ...res, bounces: along(vec3(0, 0, -9)) })).toEqual({ bounceDistanceM: -1, rollDistanceM: -2 });
  });

  it("reports spin-back as negative distance, and bounce + roll equals the net ground displacement", () => {
    // Steep wedge-like landing with strong backspin on a RIGID green (firmness 1, no crater):
    // skids forward, then spins back.
    const rigidGreen = createFlatRangeTerrain({ ballRadiusM: R, surface: withSurfaceOverrides(getSurface("green"), { firmness: 1 }) });
    const th = (60 * Math.PI) / 180;
    const first = landing(rigidGreen, vec3(12 * Math.cos(th), 0, -12 * Math.sin(th)), vec3(0, -900, 0));
    const res = run({ firstContact: first, terrain: rigidGreen, hop: gravityHop(rigidGreen, R) }, rigidGreen);
    expect(res.termination).toBe("rest");
    expect(res.rollStartPositionM!.x).toBeGreaterThan(0.5);
    expect(res.restPositionM.x).toBeLessThan(0);
    const d = groundDistances(first.positionM, res);
    expect(d.bounceDistanceM).toBeCloseTo(res.rollStartPositionM!.x, 12);
    expect(d.rollDistanceM).toBeLessThan(0);
    expect(d.rollDistanceM).toBeCloseTo(res.restPositionM.x - res.rollStartPositionM!.x, 12);
    expect(d.bounceDistanceM + d.rollDistanceM).toBeCloseTo(res.restPositionM.x - first.positionM.x, 12);
    expect(d.bounceDistanceM + d.rollDistanceM).toBeLessThan(0);
  });

  it("with the crater: bounces forward then runs back on a firm green, checks at the pitch mark on the softer reference green", () => {
    const th = (60 * Math.PI) / 180;
    const velocity = vec3(12 * Math.cos(th), 0, -12 * Math.sin(th));
    const firm = createFlatRangeTerrain({ ballRadiusM: R, surface: withSurfaceOverrides(getSurface("green"), { firmness: 0.85 }) });
    const onFirm = run({ firstContact: landing(firm, velocity, vec3(0, -900, 0)), terrain: firm, hop: gravityHop(firm, R) }, firm);
    expect(onFirm.bounces[0]!.outgoingVelocityMps.x).toBeGreaterThan(0.5);
    expect(onFirm.restPositionM.x).toBeLessThan(-1);
    const onGreen = run({ firstContact: landing(green, velocity, vec3(0, -900, 0)) });
    expect(onGreen.bounces[0]!.outgoingVelocityMps.x).toBeLessThan(0);
    for (const res of [onFirm, onGreen]) {
      expect(res.termination).toBe("rest");
      const d = groundDistances(vec3(0, 0, 0), res);
      expect(d.rollDistanceM).toBeLessThan(0);
      expect(d.bounceDistanceM + d.rollDistanceM).toBeCloseTo(res.restPositionM.x, 12);
    }
  });
});
