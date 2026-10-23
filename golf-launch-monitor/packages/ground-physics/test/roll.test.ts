import { describe, expect, it } from "vitest";
import { distance, vec3 } from "@glm/core-math";
import type { TerrainQuery } from "@glm/shared-types";
import {
  createFlatRangeTerrain,
  createPlaneTerrain,
  createRegionTerrain,
  flatRollingDistanceM,
  getSurface,
  ROLLING_RESISTANCE_BETA_S2_PER_M2 as BETA,
  rollingResistanceBoundSpeedMps,
  STIMPMETER_RELEASE_SPEED_MPS,
  withSurfaceOverrides,
} from "@glm/terrain-engine";
import { simulateRoll, type RollInput, type RollSettings } from "../src/index";
import { G, K, R, TEST_BALL, UNIFORM_BALL } from "./helpers";

const SETTINGS: RollSettings = {
  timestepS: 0.001,
  maxTimeS: 60,
  outputSampleIntervalS: 0.01,
  restSpeedMps: 0.01,
  slipToRollToleranceMps: 1e-3,
};

const flat = (surface: "green" | "fairway-normal" | "rough" = "green") => createFlatRangeTerrain({ ballRadiusM: R, surface });

function roll(overrides: Partial<RollInput> & Pick<RollInput, "velocityMps">): ReturnType<typeof simulateRoll> {
  return simulateRoll({
    positionM: vec3(0, 0, 0),
    angularVelocityRadPerSec: vec3(0, 0, 0),
    terrain: flat(),
    ballProfile: TEST_BALL,
    gravityMps2: G,
    startTimeS: 0,
    settings: SETTINGS,
    ...overrides,
  });
}

/** Plane through the flat-range ground point, descending toward +X at `deg` degrees. */
function incline(deg: number): TerrainQuery {
  const th = (deg * Math.PI) / 180;
  return createPlaneTerrain({
    id: `incline-${deg}`,
    pointOnPlaneM: vec3(0, 0, -R),
    normal: vec3(Math.sin(th), 0, Math.cos(th)),
    surface: "green",
  });
}

describe("simulateRoll on flat ground", () => {
  it("stops a rolling ball at the closed-form distance within 0.1 % (speed-dependent resistance, bounded by mu)", () => {
    let boundedCases = 0;
    for (const surface of ["green", "fairway-normal", "rough"] as const) {
      const { rollingResistance: c, slidingFriction: mu } = getSurface(surface);
      // Above vb the deceleration is mu g (a rolling ball never decelerates faster than a sliding one).
      const vb = rollingResistanceBoundSpeedMps(c, mu);
      for (const v0 of [1, 2.5, 4, 8, 12]) {
        const res = roll({ terrain: flat(surface), velocityMps: vec3(v0, 0, 0), angularVelocityRadPerSec: vec3(0, v0 / R, 0) });
        // dv/dt = -c g (1 + beta v^2) below vb: distance ln(1 + beta v^2) / (2 c g beta), time
        // atan(sqrt(beta) v) / (c g sqrt(beta)); above vb, dv/dt = -mu g.
        const v = Math.min(v0, vb);
        const expected = (v0 * v0 - v * v) / (2 * mu * G) + Math.log1p(BETA * v * v) / (2 * c * G * BETA);
        const expectedTime = (v0 - v) / (mu * G) + Math.atan(Math.sqrt(BETA) * v) / (c * G * Math.sqrt(BETA));
        if (v0 > vb) boundedCases++;
        expect(flatRollingDistanceM(c, v0, G, mu)).toBeCloseTo(expected, 12);
        expect(res.termination).toBe("rest");
        expect(Math.abs(res.restPositionM.x - expected) / expected).toBeLessThan(0.001);
        expect(res.restTimeS).toBeCloseTo(expectedTime, 1);
        // Shorter than a constant-resistance roll, increasingly so with speed.
        expect(res.restPositionM.x).toBeLessThan((v0 * v0) / (2 * c * G));
        // Never shorter than a ball decelerating at mu g throughout.
        expect(res.restPositionM.x).toBeGreaterThan((v0 * v0) / (2 * mu * G));
        expect(res.skidDistanceM).toBe(0);
        expect(res.rollStartPositionM).toEqual(vec3(0, 0, 0));
        expect(res.finalSurface).toBe(surface);
      }
    }
    // green 12 m/s; normal fairway 8 and 12 m/s; rough 2.5-12 m/s.
    expect(boundedCases).toBe(7);
  });

  it("never decelerates a rolling ball faster than mu g (fairway-normal at 12 m/s), and matches c0 (1 + beta v^2) g below the bound", () => {
    const { rollingResistance: c, slidingFriction: mu } = getSurface("fairway-normal");
    const res = roll({ terrain: flat("fairway-normal"), velocityMps: vec3(12, 0, 0), angularVelocityRadPerSec: vec3(0, 12 / R, 0) });
    const decel = (i: number) => {
      const a = res.samples[i]!;
      const b = res.samples[i + 1]!;
      return { v: (a.velocityMps.x + b.velocityMps.x) / 2, a: -(b.velocityMps.x - a.velocityMps.x) / (b.tS - a.tS) };
    };
    const fast = decel(0);
    expect(fast.v).toBeGreaterThan(11);
    expect(fast.a).toBeCloseTo(mu * G, 6);
    // Unbounded, the deceleration at ~12 m/s would be c (1 + beta v^2) g ~ 11.3 m/s^2, 2.9x mu g.
    expect(c * (1 + BETA * fast.v * fast.v) * G).toBeGreaterThan(2.5 * mu * G);
    const slowIndex = res.samples.findIndex((s) => s.velocityMps.x < 3);
    const slow = decel(slowIndex);
    expect(slow.a).toBeCloseTo(c * (1 + BETA * slow.v * slow.v) * G, 2);
    expect(slow.a).toBeLessThan(mu * G);
  });

  it("a simulated Stimpmeter roll reproduces the Stimp distance within 1 %", () => {
    for (const stimpFt of [8, 10, 13]) {
      const surface = stimpFt === 10 ? getSurface("green") : withSurfaceOverrides(getSurface("green"), { stimpFt });
      expect(surface.stimpFt).toBe(stimpFt);
      const v0 = STIMPMETER_RELEASE_SPEED_MPS;
      const res = roll({
        terrain: createFlatRangeTerrain({ ballRadiusM: R, surface }),
        velocityMps: vec3(v0, 0, 0),
        angularVelocityRadPerSec: vec3(0, v0 / R, 0),
        gravityMps2: 9.80665,
      });
      expect(res.termination).toBe("rest");
      expect(Math.abs(res.restPositionM.x / (stimpFt * 0.3048) - 1)).toBeLessThan(0.01);
    }
  });

  it("rolls along +Y with spin about -X (omega = n x v / r)", () => {
    const res = roll({ velocityMps: vec3(0, 2, 0), angularVelocityRadPerSec: vec3(-2 / R, 0, 0) });
    expect(res.restPositionM.x).toBeCloseTo(0, 12);
    expect(res.restPositionM.y).toBeGreaterThan(3.5);
    const mid = res.samples[10];
    expect(mid?.angularVelocityRadPerSec.x).toBeLessThan(0);
    expect(mid?.angularVelocityRadPerSec.x).toBeCloseTo(-(mid?.velocityMps.y ?? 0) / R, 9);
  });

  it("skids a no-spin ball into pure roll at v0 / (1 + k) with k from the profile", () => {
    const v0 = 2;
    const mu = getSurface("green").slidingFriction;
    for (const ball of [TEST_BALL, UNIFORM_BALL]) {
      const k = ball.momentOfInertiaKgM2 / (ball.massKg * R * R);
      const res = roll({ ballProfile: ball, velocityMps: vec3(v0, 0, 0) });
      const vRoll = v0 / (1 + k);
      // Skid distance from constant deceleration mu g: (v0^2 - vRoll^2) / (2 mu g).
      expect(res.skidDistanceM).toBeCloseTo((v0 * v0 - vRoll * vRoll) / (2 * mu * G), 9);
      const start = res.rollStartPositionM;
      expect(start).not.toBeNull();
      expect(start?.x).toBeCloseTo(res.skidDistanceM, 12);
      // First sample after roll onset: v = omega r, and v just below v0/(1+k).
      const after = res.samples.find((s) => s.positionM.x > (start?.x ?? 0));
      expect(after?.velocityMps.x).toBeCloseTo(after!.angularVelocityRadPerSec.y * R, 9);
      expect(Math.abs((after?.velocityMps.x ?? 0) - vRoll) / vRoll).toBeLessThan(0.01);
    }
    expect(K).not.toBeCloseTo(0.4, 3);
    const uniform = roll({ ballProfile: UNIFORM_BALL, velocityMps: vec3(v0, 0, 0) });
    expect(uniform.skidDistanceM).toBeCloseTo((v0 * v0 * (1 - 25 / 49)) / (2 * mu * G), 9); // = 12 v0^2 / (49 mu g)
    expect(uniform.skidDistanceM).toBeCloseTo((12 * v0 * v0) / (49 * mu * G), 9);
  });

  it("strong backspin while skidding reverses the ball (spin-back)", () => {
    const w = -400;
    const res = roll({ velocityMps: vec3(1, 0, 0), angularVelocityRadPerSec: vec3(0, w, 0) });
    // Rolling velocity after the skid: (v - k r |omega|) / (1 + k) < 0.
    const vRoll = (1 - K * R * 400) / (1 + K);
    expect(vRoll).toBeLessThan(0);
    const start = res.rollStartPositionM;
    const idx = res.samples.findIndex((s) => s.positionM.x < (start?.x ?? 0) - 1e-6);
    expect(res.samples[idx]?.velocityMps.x).toBeCloseTo(vRoll, 2);
    expect(res.restPositionM.x).toBeLessThan(start?.x ?? 0);
    expect(res.termination).toBe("rest");
  });

  it("projects the centre onto the surface and removes the normal velocity", () => {
    const res = roll({ positionM: vec3(0, 0, 0.005), velocityMps: vec3(1, 0, 0.7), angularVelocityRadPerSec: vec3(0, 1 / R, 0) });
    const first = res.samples[0];
    expect(first?.positionM.z).toBeCloseTo(0, 14);
    expect(first?.velocityMps.z).toBe(0);
    for (const s of res.samples) expect(s.positionM.z).toBeCloseTo(0, 12);
  });

  it("emits strictly increasing absolute-time roll samples and is deterministic", () => {
    const input = { velocityMps: vec3(3, 0.5, 0), angularVelocityRadPerSec: vec3(0, -50, 20), startTimeS: 6.25 };
    const a = roll(input);
    const b = roll(input);
    expect(a).toEqual(b);
    expect(a.samples[0]?.tS).toBe(6.25);
    for (let i = 1; i < a.samples.length; i++) {
      expect(a.samples[i]!.tS).toBeGreaterThan(a.samples[i - 1]!.tS);
      expect(a.samples[i]!.phase).toBe("roll");
    }
    expect(a.samples[a.samples.length - 1]?.tS).toBe(a.restTimeS);
    expect(a.samples[a.samples.length - 1]?.positionM).toEqual(a.restPositionM);
    expect(Object.isFrozen(a.samples)).toBe(true);
  });

  it("validates settings and state", () => {
    expect(() => roll({ velocityMps: vec3(1, 0, 0), settings: { ...SETTINGS, timestepS: 0 } })).toThrow(RangeError);
    expect(() => roll({ velocityMps: vec3(1, 0, 0), settings: { ...SETTINGS, outputSampleIntervalS: -1 } })).toThrow(RangeError);
    expect(() => roll({ velocityMps: vec3(Number.NaN, 0, 0) })).toThrow(RangeError);
    expect(() => roll({ velocityMps: vec3(1, 0, 0), gravityMps2: 0 })).toThrow(RangeError);
    expect(() => roll({ velocityMps: vec3(1, 0, 0), startTimeS: -1 })).toThrow(/startTimeS must be finite and >= 0/);
  });

  it("does not hang when the output interval is below one ulp of t (at most one sample per step)", () => {
    const res = roll({
      velocityMps: vec3(1, 0, 0),
      angularVelocityRadPerSec: vec3(0, 1 / R, 0),
      startTimeS: 5,
      settings: { ...SETTINGS, outputSampleIntervalS: 1e-17 },
    });
    expect(res.termination).toBe("rest");
    const steps = Math.ceil((res.restTimeS - 5) / SETTINGS.timestepS);
    expect(res.samples.length).toBeGreaterThan(steps - 2);
    expect(res.samples.length).toBeLessThanOrEqual(steps + 2);
    for (let i = 1; i < res.samples.length; i++) expect(res.samples[i]!.tS).toBeGreaterThan(res.samples[i - 1]!.tS);
    // Same rest point as with a normal interval: sampling never changes the integration.
    const normal = roll({ velocityMps: vec3(1, 0, 0), angularVelocityRadPerSec: vec3(0, 1 / R, 0), startTimeS: 5 });
    expect(res.restPositionM).toEqual(normal.restPositionM);
  });

  it("normalises a non-unit terrain normal and rejects a degenerate one", () => {
    const base = flat();
    const scaled: TerrainQuery = { id: "scaled", version: "t", sample: (x, y) => ({ ...base.sample(x, y), normal: vec3(0, 0, 2) }) };
    const v0 = 2;
    const a = roll({ terrain: scaled, velocityMps: vec3(v0, 0, 0), angularVelocityRadPerSec: vec3(0, v0 / R, 0) });
    const b = roll({ velocityMps: vec3(v0, 0, 0), angularVelocityRadPerSec: vec3(0, v0 / R, 0) });
    expect(a.restPositionM).toEqual(b.restPositionM);
    const flatNormal: TerrainQuery = { id: "bad", version: "t", sample: (x, y) => ({ ...base.sample(x, y), normal: vec3(1, 0, 0) }) };
    expect(() => roll({ terrain: flatNormal, velocityMps: vec3(1, 0, 0) })).toThrow(/terrain normal must be/);
    const zero: TerrainQuery = { id: "zero", version: "t", sample: (x, y) => ({ ...base.sample(x, y), normal: vec3(0, 0, 0) }) };
    expect(() => roll({ terrain: zero, velocityMps: vec3(1, 0, 0) })).toThrow(/terrain normal must be/);
  });

  it("reports max-time when the time budget runs out", () => {
    const res = roll({ velocityMps: vec3(3, 0, 0), angularVelocityRadPerSec: vec3(0, 3 / R, 0), settings: { ...SETTINGS, maxTimeS: 0.5 } });
    expect(res.termination).toBe("max-time");
    expect(res.restTimeS).toBeCloseTo(0.5, 9);
  });
});

describe("simulateRoll on inclines", () => {
  const c = getSurface("green").rollingResistance;

  it("keeps rolling down a slope steeper than the resistance can hold (8 deg)", () => {
    const deg = 8;
    const th = (deg * Math.PI) / 180;
    expect(Math.sin(th) / (1 + K)).toBeGreaterThan(c * Math.cos(th));
    const res = roll({ terrain: incline(deg), velocityMps: vec3(0, 0, 0), settings: { ...SETTINGS, maxTimeS: 2 } });
    expect(res.termination).toBe("max-time");
    const last = res.samples[res.samples.length - 1]!;
    const speed = Math.hypot(last.velocityMps.x, last.velocityMps.y, last.velocityMps.z);
    // dv/dt = A - B v^2 from rest: v(t) = sqrt(A/B) tanh(sqrt(A B) t).
    const A = (G * Math.sin(th)) / (1 + K) - c * G * Math.cos(th);
    const B = c * G * Math.cos(th) * BETA;
    const expected = Math.sqrt(A / B) * Math.tanh(Math.sqrt(A * B) * 2);
    expect(Math.abs(speed - expected) / expected).toBeLessThan(0.005);
    expect(speed).toBeLessThan(A * 2); // below the constant-resistance speed
    expect(last.velocityMps.x).toBeGreaterThan(0); // downhill is +X
    expect(last.velocityMps.z).toBeLessThan(0);
    // Stays on the plane: centre at distance r along the normal.
    expect(last.positionM.z).toBeCloseTo(-R + R / Math.cos(th) - last.positionM.x * Math.tan(th), 9);
  });

  it("rolls up a steep slope, stops momentarily and comes back down", () => {
    const res = roll({ terrain: incline(8), velocityMps: vec3(-1.5, 0, 0), settings: { ...SETTINGS, maxTimeS: 3 } });
    const minX = Math.min(...res.samples.map((s) => s.positionM.x));
    expect(minX).toBeLessThan(-0.3);
    expect(res.samples[res.samples.length - 1]!.velocityMps.x).toBeGreaterThan(0);
  });

  it("stops on a gentle slope (1 deg) where resistance holds the ball", () => {
    const deg = 1;
    const th = (deg * Math.PI) / 180;
    const terrain = incline(deg);
    // At rest on the slope: stays at rest immediately.
    const still = roll({ terrain, velocityMps: vec3(0, 0, 0) });
    expect(still.termination).toBe("rest");
    expect(still.restTimeS).toBe(0);
    // Rolling downhill at 1 m/s: decelerates at D + C v^2 with D = c g cos - g sin / (1 + k) and
    // C = c g cos beta, so it stops after ln(1 + C v0^2 / D) / (2 C).
    const v0 = 1;
    const vAlong = vec3(v0 * Math.cos(th), 0, -v0 * Math.sin(th));
    const res = roll({ terrain, velocityMps: vAlong, angularVelocityRadPerSec: vec3(0, v0 / R, 0) });
    const D = c * G * Math.cos(th) - (G * Math.sin(th)) / (1 + K);
    const C = c * G * Math.cos(th) * BETA;
    const expected = Math.log1p((C * v0 * v0) / D) / (2 * C);
    expect(res.termination).toBe("rest");
    const travelled = distance(res.samples[0]!.positionM, res.restPositionM);
    expect(Math.abs(travelled - expected) / expected).toBeLessThan(0.01);
  });
});

describe("simulateRoll terminal surfaces", () => {
  it("stops the ball on entry to water", () => {
    const terrain = createRegionTerrain({
      id: "pond",
      base: flat(),
      regions: [{ polygon: [vec3(3, -10, 0), vec3(20, -10, 0), vec3(20, 10, 0), vec3(3, 10, 0)], surface: "water" }],
    });
    const res = roll({ terrain, velocityMps: vec3(3, 0, 0), angularVelocityRadPerSec: vec3(0, 3 / R, 0) });
    expect(res.termination).toBe("terminal-surface");
    expect(res.finalSurface).toBe("water");
    expect(res.restPositionM.x).toBeGreaterThanOrEqual(3);
    expect(res.restPositionM.x).toBeLessThan(3 + 3 * SETTINGS.timestepS + 1e-9);
    // Starting in water ends immediately.
    const wet = roll({ terrain, positionM: vec3(5, 0, 0), velocityMps: vec3(1, 0, 0) });
    expect(wet.termination).toBe("terminal-surface");
    expect(wet.restTimeS).toBe(0);
    expect(wet.samples).toHaveLength(1);
  });
});
