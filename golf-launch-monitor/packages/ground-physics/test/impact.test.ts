import { describe, expect, it } from "vitest";
import { addScaled, createRng, cross, dot, normalize, scale, vec3 } from "@glm/core-math";
import { SURFACE_TYPES, type Vec3 } from "@glm/shared-types";
import { getSurface, SURFACE_CATALOG, withSurfaceOverrides } from "@glm/terrain-engine";
import {
  effectiveRestitution,
  effectiveRollingResistance,
  MOISTURE_RESTITUTION_REDUCTION,
  resolveImpact,
} from "../src/index";
import { G, K, kineticEnergy, R, TEST_BALL } from "./helpers";

const UP = vec3(0, 0, 1);
const m = TEST_BALL.massKg;
const I = TEST_BALL.momentOfInertiaKgM2;
const green = getSurface("green");

describe("effectiveRestitution", () => {
  it("is clamp(base - slope v, min, base), reduced by moisture", () => {
    // Green: base 0.45, slope 0.022 s/m, min 0.12.
    expect(effectiveRestitution(green, 0)).toBeCloseTo(0.45, 15);
    expect(effectiveRestitution(green, 5)).toBeCloseTo(0.34, 15);
    expect(effectiveRestitution(green, -5)).toBeCloseTo(0.34, 15);
    expect(effectiveRestitution(green, 40)).toBeCloseTo(0.12, 15);
    const wet = withSurfaceOverrides(green, { moistureSoftness: 1 });
    expect(effectiveRestitution(wet, 5)).toBeCloseTo(0.34 * (1 - MOISTURE_RESTITUTION_REDUCTION), 15);
    expect(effectiveRestitution(withSurfaceOverrides(green, { moistureSoftness: 0.5 }), 40)).toBeCloseTo(0.12 * 0.85, 15);
    expect(() => effectiveRestitution(green, Number.NaN)).toThrow(RangeError);
  });

  it("orders surfaces at a typical landing speed", () => {
    expect(effectiveRestitution(getSurface("cart-path"), 10)).toBeGreaterThan(effectiveRestitution(getSurface("fairway-firm"), 10));
    expect(effectiveRestitution(getSurface("fairway-firm"), 10)).toBeGreaterThan(effectiveRestitution(getSurface("rough"), 10));
    expect(effectiveRestitution(getSurface("rough"), 10)).toBeGreaterThan(effectiveRestitution(getSurface("bunker"), 10));
  });

  it("moisture raises rolling resistance by up to 50 %", () => {
    expect(effectiveRollingResistance(green)).toBe(green.rollingResistance);
    expect(effectiveRollingResistance(withSurfaceOverrides(green, { moistureSoftness: 1 }))).toBeCloseTo(1.5 * green.rollingResistance, 15);
  });
});

describe("resolveImpact", () => {
  it("vertical drop without spin rebounds at e*v (height ratio e^2)", () => {
    const vIn = 5;
    const out = resolveImpact({ velocityMps: vec3(0, 0, -vIn), angularVelocityRadPerSec: vec3(0, 0, 0), normal: UP, surface: green, ballProfile: TEST_BALL });
    const e = 0.34;
    expect(out.restitution).toBeCloseTo(e, 15);
    expect(out.normalImpactSpeedMps).toBe(vIn);
    expect(out.velocityMps.z).toBeCloseTo(e * vIn, 14);
    expect(out.velocityMps.x).toBe(0);
    expect(out.velocityMps.y).toBe(0);
    expect(out.angularVelocityRadPerSec).toEqual(vec3(0, 0, 0));
    const heightRatio = out.velocityMps.z ** 2 / (2 * G) / (vIn ** 2 / (2 * G));
    expect(heightRatio).toBeCloseTo(e * e, 14);
    expect(out.normalImpulseNs).toBeCloseTo(m * (1 + e) * vIn, 15);
    expect(out.tangentialImpulseNs).toBe(0);
    expect(out.regime).toBe("rolling-at-separation");
  });

  it("frictionless surface preserves tangential velocity and spin", () => {
    const ice = withSurfaceOverrides(green, { slidingFriction: 0 });
    const w = vec3(30, -200, 50);
    const out = resolveImpact({ velocityMps: vec3(10, 2, -8), angularVelocityRadPerSec: w, normal: UP, surface: ice, ballProfile: TEST_BALL });
    expect(out.velocityMps.x).toBe(10);
    expect(out.velocityMps.y).toBe(2);
    expect(out.velocityMps.z).toBeCloseTo(effectiveRestitution(ice, 8) * 8, 14);
    expect(out.angularVelocityRadPerSec).toEqual(w);
    expect(out.regime).toBe("sliding");
    expect(out.tangentialImpulseNs).toBe(0);
  });

  it("no-spin oblique landing gains forward spin (omega_y > 0) and stops slipping when friction suffices", () => {
    const out = resolveImpact({ velocityMps: vec3(10, 0, -10), angularVelocityRadPerSec: vec3(0, 0, 0), normal: UP, surface: green, ballProfile: TEST_BALL });
    // mu Jn/m = 0.3 * 1.23 * 10 = 3.69 > J*/m = 10 k / (1 + k) = 2.89 -> rolls at separation.
    expect(out.regime).toBe("rolling-at-separation");
    expect(out.velocityMps.x).toBeCloseTo(10 / (1 + K), 12);
    expect(out.angularVelocityRadPerSec.y).toBeGreaterThan(0);
    expect(out.angularVelocityRadPerSec.y).toBeCloseTo(out.velocityMps.x / R, 9);
    expect(out.angularVelocityRadPerSec.x).toBeCloseTo(0, 15);
    expect(out.angularVelocityRadPerSec.z).toBeCloseTo(0, 15);
    expect(out.tangentialImpulseNs).toBeCloseTo((m * 10 * K) / (1 + K), 14);
  });

  it("classifies a low-friction oblique landing as sliding with mu*Jn", () => {
    const slick = withSurfaceOverrides(green, { slidingFriction: 0.1 });
    const out = resolveImpact({ velocityMps: vec3(10, 0, -10), angularVelocityRadPerSec: vec3(0, 0, 0), normal: UP, surface: slick, ballProfile: TEST_BALL });
    const jn = m * 1.23 * 10;
    expect(out.regime).toBe("sliding");
    expect(out.normalImpulseNs).toBeCloseTo(jn, 14);
    expect(out.tangentialImpulseNs).toBeCloseTo(0.1 * jn, 14);
    expect(out.velocityMps.x).toBeCloseTo(10 - 0.1 * 1.23 * 10, 12);
    expect(out.angularVelocityRadPerSec.y).toBeCloseTo((R * 0.1 * jn) / I, 9);
    // Still slipping forward at separation.
    expect(out.velocityMps.x - out.angularVelocityRadPerSec.y * R).toBeGreaterThan(0);
  });

  it("strong backspin on a steep landing reverses horizontal velocity; topspin increases it", () => {
    const descent = (75 * Math.PI) / 180;
    const speed = 15;
    const vIn = vec3(speed * Math.cos(descent), 0, -speed * Math.sin(descent));
    const run = (wy: number) =>
      resolveImpact({ velocityMps: vIn, angularVelocityRadPerSec: vec3(0, wy, 0), normal: UP, surface: green, ballProfile: TEST_BALL });
    const back = run(-700); // ~6700 rpm backspin (omega_y < 0)
    const none = run(0);
    const top = run(300);
    expect(back.velocityMps.x).toBeLessThan(0); // check / spin-back
    expect(back.regime).toBe("sliding");
    expect(none.velocityMps.x).toBeGreaterThan(0);
    expect(none.velocityMps.x).toBeLessThan(vIn.x);
    expect(top.velocityMps.x).toBeGreaterThan(vIn.x);
    // Topspin case: friction stops the backward slip and leaves the ball rolling forward.
    expect(top.regime).toBe("rolling-at-separation");
    expect(top.velocityMps.x).toBeCloseTo(top.angularVelocityRadPerSec.y * R, 9);
    // Same backspin on a frictionless surface cannot reverse the ball.
    const ice = withSurfaceOverrides(green, { slidingFriction: 0 });
    const noGrip = resolveImpact({ velocityMps: vIn, angularVelocityRadPerSec: vec3(0, -700, 0), normal: UP, surface: ice, ballProfile: TEST_BALL });
    expect(noGrip.velocityMps.x).toBeCloseTo(vIn.x, 14);
  });

  it("never increases energy or normal momentum, and conserves angular momentum about the contact point", () => {
    const rng = createRng(20261001);
    const surfaces = SURFACE_TYPES.filter((t) => !SURFACE_CATALOG[t].terminal);
    const rand = (lo: number, hi: number) => lo + (hi - lo) * rng.nextFloat();
    const angularMomentumAboutContact = (v: Vec3, w: Vec3, n: Vec3): Vec3 => {
      const orbital = scale(cross(scale(n, R), v), m);
      return { x: orbital.x + I * w.x, y: orbital.y + I * w.y, z: orbital.z + I * w.z };
    };
    for (let i = 0; i < 2000; i++) {
      const surface = getSurface(surfaces[rng.nextInt(surfaces.length)] ?? "green");
      const n = normalize(vec3(rand(-0.5, 0.5), rand(-0.5, 0.5), 1)) as Vec3;
      let v = vec3(rand(-30, 30), rand(-30, 30), rand(-30, 30));
      // Reflect separating draws so every case is an incoming impact (v . n <= -1 + 0.01).
      if (dot(v, n) > -0.01) v = addScaled(v, n, -2 * dot(v, n) - 1);
      const w = vec3(rand(-1000, 1000), rand(-1000, 1000), rand(-1000, 1000));
      const out = resolveImpact({ velocityMps: v, angularVelocityRadPerSec: w, normal: n, surface, ballProfile: TEST_BALL });
      const before = kineticEnergy(m, I, v, w);
      const after = kineticEnergy(m, I, out.velocityMps, out.angularVelocityRadPerSec);
      expect(after).toBeLessThanOrEqual(before * (1 + 1e-12));
      expect(Math.abs(dot(out.velocityMps, n))).toBeLessThanOrEqual(Math.abs(dot(v, n)) * (1 + 1e-12));
      expect(dot(out.velocityMps, n)).toBeGreaterThanOrEqual(0);
      const l0 = angularMomentumAboutContact(v, w, n);
      const l1 = angularMomentumAboutContact(out.velocityMps, out.angularVelocityRadPerSec, n);
      const scaleL = Math.hypot(l0.x, l0.y, l0.z) + 1e-12;
      expect(Math.hypot(l1.x - l0.x, l1.y - l0.y, l1.z - l0.z) / scaleL).toBeLessThan(1e-10);
      expect(out.tangentialImpulseNs).toBeLessThanOrEqual(surface.slidingFriction * out.normalImpulseNs * (1 + 1e-12));
    }
  });

  it("leaves a separating ball unchanged and validates input", () => {
    const out = resolveImpact({ velocityMps: vec3(3, 0, 1), angularVelocityRadPerSec: vec3(0, 10, 0), normal: UP, surface: green, ballProfile: TEST_BALL });
    expect(out.velocityMps).toEqual(vec3(3, 0, 1));
    expect(out.normalImpulseNs).toBe(0);
    // Unnormalised normal is normalised.
    const a = resolveImpact({ velocityMps: vec3(4, 1, -6), angularVelocityRadPerSec: vec3(0, -100, 0), normal: vec3(0, 0, 7), surface: green, ballProfile: TEST_BALL });
    const b = resolveImpact({ velocityMps: vec3(4, 1, -6), angularVelocityRadPerSec: vec3(0, -100, 0), normal: UP, surface: green, ballProfile: TEST_BALL });
    expect(a).toEqual(b);
    expect(() => resolveImpact({ velocityMps: vec3(0, 0, -1), angularVelocityRadPerSec: vec3(0, 0, 0), normal: vec3(0, 0, 0), surface: green, ballProfile: TEST_BALL })).toThrow(RangeError);
    expect(() => resolveImpact({ velocityMps: vec3(Number.NaN, 0, -1), angularVelocityRadPerSec: vec3(0, 0, 0), normal: UP, surface: green, ballProfile: TEST_BALL })).toThrow(RangeError);
    expect(() => resolveImpact({ velocityMps: vec3(0, 0, -1), angularVelocityRadPerSec: vec3(0, 0, 0), normal: UP, surface: green, ballProfile: { ...TEST_BALL, massKg: 0 } })).toThrow(RangeError);
  });

  it("works on a tilted normal: a no-spin ball landing straight down a slope gains spin about the slope axis", () => {
    const theta = (10 * Math.PI) / 180;
    const n = vec3(Math.sin(theta), 0, Math.cos(theta)); // slope descending toward +X
    const out = resolveImpact({ velocityMps: vec3(0, 0, -6), angularVelocityRadPerSec: vec3(0, 0, 0), normal: n, surface: green, ballProfile: TEST_BALL });
    // Tangential part of a vertical drop points downhill (+X along the slope): forward roll about +Y.
    expect(out.angularVelocityRadPerSec.y).toBeGreaterThan(0);
    expect(out.velocityMps.x).toBeGreaterThan(0);
    expect(dot(out.velocityMps, n)).toBeCloseTo(out.restitution * 6 * Math.cos(theta), 12);
  });
});
