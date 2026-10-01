import { describe, expect, it } from "vitest";
import { addScaled, createRng, cross, dot, norm, normalize, scale, vec3 } from "@glm/core-math";
import { SURFACE_TYPES, type SurfaceProperties, type Vec3 } from "@glm/shared-types";
import { getSurface, SURFACE_CATALOG, withSurfaceOverrides } from "@glm/terrain-engine";
import {
  ballConstants,
  CRATER_MAX_ANGLE_DEG,
  CRATER_REFERENCE_FIRMNESS,
  craterAngleRad,
  craterScale,
  effectiveRestitution,
  effectiveRollingResistance,
  MOISTURE_RESTITUTION_REDUCTION,
  resolveImpact,
  type ImpactInput,
} from "../src/index";
import { G, K, kineticEnergy, R, TEST_BALL } from "./helpers";

const UP = vec3(0, 0, 1);
const m = TEST_BALL.massKg;
const I = TEST_BALL.momentOfInertiaKgM2;
const DEG = Math.PI / 180;
const green = getSurface("green");
/** Any surface with firmness 1 has no crater: the plain rigid-surface impulse. */
const rigid = (surface: SurfaceProperties) => withSurfaceOverrides(surface, { firmness: 1 });
const rigidGreen = rigid(green);
const PLAYABLE = SURFACE_TYPES.filter((t) => !SURFACE_CATALOG[t].terminal);

/** Landing moving +X at `speed` and `deg` below horizontal, spin about +Y (backspin < 0). */
function landing(speed: number, deg: number, omegaY = 0): Pick<ImpactInput, "velocityMps" | "angularVelocityRadPerSec"> {
  return { velocityMps: vec3(speed * Math.cos(deg * DEG), 0, -speed * Math.sin(deg * DEG)), angularVelocityRadPerSec: vec3(0, omegaY, 0) };
}

/**
 * The glm-ground-0.1.0 impact, verbatim algebra: rigid sphere, Coulomb friction, restitution on
 * the plain normal speed. The crater model must reproduce it exactly when theta_c = 0.
 */
function referenceRigidImpact(input: ImpactInput) {
  const { velocityMps: v, angularVelocityRadPerSec: omega, surface } = input;
  const n = normalize(input.normal) as Vec3;
  const { massKg: mm, radiusM: r, inertiaKgM2: II } = ballConstants(input.ballProfile);
  const vn = dot(v, n);
  const vt = addScaled(v, n, -vn);
  const slip = addScaled(vt, cross(omega, scale(n, -r)), 1);
  const slipSpeed = norm(slip);
  const normalSpeed = -vn;
  const e = effectiveRestitution(surface, normalSpeed);
  const jn = mm * (1 + e) * normalSpeed;
  const mu = Math.max(0, surface.slidingFriction);
  let jt = 0;
  let regime = "rolling-at-separation";
  let vOut = vt;
  let omegaOut = omega;
  const slipDir = slipSpeed < 1e-12 ? null : normalize(slip);
  if (slipDir !== null) {
    const jStop = slipSpeed / (1 / mm + (r * r) / II);
    if (jStop <= mu * jn) jt = jStop;
    else {
      jt = mu * jn;
      regime = "sliding";
    }
    vOut = addScaled(vt, slipDir, -jt / mm);
    omegaOut = addScaled(omega, cross(n, slipDir), (r * jt) / II);
  }
  vOut = addScaled(vOut, n, e * normalSpeed);
  return { velocityMps: vOut, angularVelocityRadPerSec: omegaOut, regime, normalSpeed, restitution: e, jn, jt };
}

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

  it("moisture raises the low-speed rolling resistance by up to 50 %", () => {
    expect(effectiveRollingResistance(green)).toBe(green.rollingResistance);
    expect(effectiveRollingResistance(withSurfaceOverrides(green, { moistureSoftness: 1 }))).toBeCloseTo(1.5 * green.rollingResistance, 15);
  });
});

describe("craterScale", () => {
  it("is (1 - firmness) / (1 - reference): 1 for the catalog green, 0 for a rigid surface, larger when softer", () => {
    expect(CRATER_REFERENCE_FIRMNESS).toBe(0.5);
    expect(CRATER_REFERENCE_FIRMNESS).toBe(SURFACE_CATALOG.green.firmness);
    expect(craterScale(green)).toBe(1);
    expect(craterScale(getSurface("cart-path"))).toBe(0);
    expect(craterScale(getSurface("fairway-normal"))).toBeCloseTo(0.5, 15);
    expect(craterScale(getSurface("fairway-firm"))).toBeCloseTo(0.3, 15);
    expect(craterScale(getSurface("fairway-soft"))).toBeCloseTo(1.2, 15);
    expect(craterScale(getSurface("bunker"))).toBeCloseTo(1.8, 15);
    expect(craterScale({ firmness: 0 })).toBe(2);
    // Out-of-range firmness is clamped to [0, 1]; non-finite throws.
    expect(craterScale({ firmness: 1.5 })).toBe(0);
    expect(() => craterScale({ firmness: Number.NaN })).toThrow(RangeError);
    for (const a of PLAYABLE) {
      for (const b of PLAYABLE) {
        if (SURFACE_CATALOG[a].firmness > SURFACE_CATALOG[b].firmness) expect(craterScale(SURFACE_CATALOG[a])).toBeLessThan(craterScale(SURFACE_CATALOG[b]));
      }
    }
  });
});

describe("craterAngleRad (Penner's critical angle)", () => {
  it("is 15.4 deg at Penner's reference impact (18.6 m/s, 44.4 deg) on the reference green", () => {
    expect(craterAngleRad(green, 18.6, 44.4 * DEG)).toBeCloseTo(15.4 * DEG, 14);
  });

  it("is linear in impact speed, impact angle and craterScale (below the caps)", () => {
    expect(craterAngleRad(green, 9.3, 44.4 * DEG)).toBeCloseTo(7.7 * DEG, 14);
    expect(craterAngleRad(green, 18.6, 22.2 * DEG)).toBeCloseTo(7.7 * DEG, 14);
    expect(craterAngleRad(getSurface("fairway-normal"), 18.6, 44.4 * DEG)).toBeCloseTo(7.7 * DEG, 14);
    expect(craterAngleRad(getSurface("fairway-soft"), 18.6, 44.4 * DEG)).toBeCloseTo(1.2 * 15.4 * DEG, 14);
  });

  it("is zero on a rigid surface, for a vertical drop and at zero speed", () => {
    expect(craterAngleRad(getSurface("cart-path"), 30, 45 * DEG)).toBe(0);
    expect(craterAngleRad(green, 20, Math.PI / 2)).toBe(0);
    expect(craterAngleRad(green, 0, 45 * DEG)).toBe(0);
  });

  it("clamps to min(CRATER_MAX_ANGLE, theta_i, 90 deg - theta_i)", () => {
    expect(CRATER_MAX_ANGLE_DEG).toBe(30);
    const bunker = getSurface("bunker");
    // Fast 45 deg landing in sand: raw 15.4 * (30/18.6) * (45/44.4) * 1.8 = 45.3 deg -> 30 deg.
    expect(craterAngleRad(bunker, 30, 45 * DEG)).toBeCloseTo(30 * DEG, 14);
    // Fast shallow landing in sand: raw 13.4 deg > theta_i = 10 deg -> 10 deg.
    expect(craterAngleRad(bunker, 40, 10 * DEG)).toBeCloseTo(10 * DEG, 14);
    // Steep fast landing on the green: raw 41.9 deg, 90 - 75 = 15 deg binds.
    expect(craterAngleRad(green, 30, 75 * DEG)).toBeCloseTo(15 * DEG, 14);
    for (let i = 0; i <= 90; i += 5) {
      const thetaC = craterAngleRad(bunker, 60, i * DEG);
      expect(thetaC).toBeLessThanOrEqual(Math.min(30, i, 90 - i) * DEG + 1e-15);
    }
  });

  it("rejects invalid input", () => {
    expect(() => craterAngleRad(green, -1, 0.5)).toThrow(RangeError);
    expect(() => craterAngleRad(green, 10, -0.1)).toThrow(RangeError);
    expect(() => craterAngleRad(green, 10, 2)).toThrow(RangeError);
    expect(() => craterAngleRad(green, Number.NaN, 0.5)).toThrow(RangeError);
  });
});

describe("resolveImpact: crater-tilted contact plane", () => {
  it("reproduces Penner's tilted-frame normal speed v' = |v_t| sin(theta_c) + |v_n| cos(theta_c) at his reference impact", () => {
    const input = { ...landing(18.6, 44.4, -484), normal: UP, surface: green, ballProfile: TEST_BALL };
    const out = resolveImpact(input);
    const thetaC = 15.4 * DEG;
    expect(out.impactAngleRad).toBeCloseTo(44.4 * DEG, 14);
    expect(out.craterAngleRad).toBeCloseTo(thetaC, 14);
    const vt = 18.6 * Math.cos(44.4 * DEG);
    const vn = 18.6 * Math.sin(44.4 * DEG);
    expect(out.normalImpactSpeedMps).toBeCloseTo(vn, 13);
    expect(out.effectiveNormalImpactSpeedMps).toBeCloseTo(vt * Math.sin(thetaC) + vn * Math.cos(thetaC), 13);
    expect(out.effectiveNormalImpactSpeedMps).toBeCloseTo(18.6 * Math.sin(59.8 * DEG), 13); // 16.07 m/s
    // Tilted toward the incoming ball (which travels +X): n' = (-sin, 0, cos).
    expect(out.effectiveNormal.x).toBeCloseTo(-Math.sin(thetaC), 14);
    expect(out.effectiveNormal.y).toBe(0);
    expect(out.effectiveNormal.z).toBeCloseTo(Math.cos(thetaC), 14);
    // Restitution on v' (the catalog line floors at 0.12 there; Penner's polynomial gives 0.141).
    expect(out.restitution).toBe(effectiveRestitution(green, out.effectiveNormalImpactSpeedMps));
    expect(out.restitution).toBeCloseTo(0.12, 15);
    expect(dot(out.velocityMps, out.effectiveNormal)).toBeCloseTo(0.12 * out.effectiveNormalImpactSpeedMps, 12);
  });

  it("tilts toward the incoming ball for any heading", () => {
    const out = resolveImpact({ velocityMps: vec3(0, -12, -9), angularVelocityRadPerSec: vec3(0, 0, 0), normal: UP, surface: green, ballProfile: TEST_BALL });
    expect(out.craterAngleRad).toBeGreaterThan(0);
    expect(out.effectiveNormal.x).toBeCloseTo(0, 15);
    expect(out.effectiveNormal.y).toBeCloseTo(Math.sin(out.craterAngleRad), 14); // ball moves -Y: n' leans +Y
  });

  it("a rigid surface (firmness 1, craterScale 0) reproduces the plain rigid-surface model exactly", () => {
    const rng = createRng(7);
    const rand = (lo: number, hi: number) => lo + (hi - lo) * rng.nextFloat();
    const rigidSurfaces = [getSurface("cart-path"), ...PLAYABLE.map((t) => rigid(SURFACE_CATALOG[t]))];
    for (let i = 0; i < 500; i++) {
      const surface = rigidSurfaces[rng.nextInt(rigidSurfaces.length)] ?? rigidGreen;
      const n = normalize(vec3(rand(-0.4, 0.4), rand(-0.4, 0.4), 1)) as Vec3;
      let v = vec3(rand(-30, 30), rand(-30, 30), rand(-30, 30));
      if (dot(v, n) > -0.01) v = addScaled(v, n, -2 * dot(v, n) - 1);
      const input = { velocityMps: v, angularVelocityRadPerSec: vec3(rand(-900, 900), rand(-900, 900), rand(-900, 900)), normal: n, surface, ballProfile: TEST_BALL };
      const out = resolveImpact(input);
      const ref = referenceRigidImpact(input);
      expect(out.craterAngleRad).toBe(0);
      expect(out.effectiveNormal).toEqual(normalize(n)); // the input normal, normalised once more
      expect(out.velocityMps).toEqual(ref.velocityMps);
      expect(out.angularVelocityRadPerSec).toEqual(ref.angularVelocityRadPerSec);
      expect(out.regime).toBe(ref.regime);
      expect(out.restitution).toBe(ref.restitution);
      expect(out.normalImpactSpeedMps).toBe(ref.normalSpeed);
      expect(out.effectiveNormalImpactSpeedMps).toBe(ref.normalSpeed);
      expect(out.normalImpulseNs).toBe(ref.jn);
      expect(out.tangentialImpulseNs).toBe(ref.jt);
    }
  });

  it("removes far more horizontal speed than the rigid surface and rebounds more steeply", () => {
    const fairway = getSurface("fairway-normal");
    const input = { ...landing(25, 37, -250), normal: UP, ballProfile: TEST_BALL };
    const crater = resolveImpact({ ...input, surface: fairway });
    const flat = resolveImpact({ ...input, surface: rigid(fairway) });
    expect(crater.craterAngleRad).toBeCloseTo(15.4 * (25 / 18.6) * (37 / 44.4) * 0.5 * DEG, 14);
    expect(crater.velocityMps.x).toBeLessThan(0.85 * flat.velocityMps.x);
    expect(crater.velocityMps.z / crater.velocityMps.x).toBeGreaterThan(1.5 * (flat.velocityMps.z / flat.velocityMps.x));
    // A deeper crater (softer surface) removes more.
    const soft = resolveImpact({ ...input, surface: getSurface("fairway-soft") });
    expect(soft.velocityMps.x).toBeLessThan(crater.velocityMps.x);
  });

  it("lets a steep, high-spin iron check on the green where the rigid surface releases it forward", () => {
    const input = { ...landing(22.8, 56.7, -701), normal: UP, ballProfile: TEST_BALL };
    expect(resolveImpact({ ...input, surface: rigidGreen }).velocityMps.x).toBeGreaterThan(3);
    const crater = resolveImpact({ ...input, surface: green });
    expect(crater.velocityMps.x).toBeLessThan(-1.5);
    expect(crater.velocityMps.z).toBeGreaterThan(0);
  });

  it("frictionless crater: keeps spin and the velocity component in the tilted plane", () => {
    const ice = withSurfaceOverrides(green, { slidingFriction: 0 });
    const w = vec3(30, -200, 50);
    const v = vec3(10, 2, -8);
    const out = resolveImpact({ velocityMps: v, angularVelocityRadPerSec: w, normal: UP, surface: ice, ballProfile: TEST_BALL });
    const n1 = out.effectiveNormal;
    expect(out.craterAngleRad).toBeGreaterThan(0);
    expect(out.angularVelocityRadPerSec).toEqual(w);
    const inPlane = (u: Vec3) => addScaled(u, n1, -dot(u, n1));
    const a = inPlane(v);
    const b = inPlane(out.velocityMps);
    expect(Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)).toBeLessThan(1e-12);
    expect(dot(out.velocityMps, n1)).toBeCloseTo(out.restitution * out.effectiveNormalImpactSpeedMps, 12);
  });

  it("never increases energy, reverses the tilted-frame normal speed by e, and conserves angular momentum about the contact point -r n'", () => {
    const rng = createRng(20261001);
    const rand = (lo: number, hi: number) => lo + (hi - lo) * rng.nextFloat();
    const angularMomentumAboutContact = (v: Vec3, w: Vec3, n: Vec3): Vec3 => {
      const orbital = scale(cross(scale(n, R), v), m);
      return { x: orbital.x + I * w.x, y: orbital.y + I * w.y, z: orbital.z + I * w.z };
    };
    let tilted = 0;
    for (let i = 0; i < 2000; i++) {
      const surface = getSurface(PLAYABLE[rng.nextInt(PLAYABLE.length)] ?? "green");
      const n = normalize(vec3(rand(-0.5, 0.5), rand(-0.5, 0.5), 1)) as Vec3;
      let v = vec3(rand(-30, 30), rand(-30, 30), rand(-30, 30));
      // Reflect separating draws so every case is an incoming impact (v . n <= -1 + 0.01).
      if (dot(v, n) > -0.01) v = addScaled(v, n, -2 * dot(v, n) - 1);
      const w = vec3(rand(-1000, 1000), rand(-1000, 1000), rand(-1000, 1000));
      const out = resolveImpact({ velocityMps: v, angularVelocityRadPerSec: w, normal: n, surface, ballProfile: TEST_BALL });
      const n1 = out.effectiveNormal;
      if (out.craterAngleRad > 0) tilted++;
      // Geometry: unit n' in the plane of n and v, cos(theta_c) from n, leaning against v_t.
      const vn = dot(v, n);
      const vt = addScaled(v, n, -vn);
      const thetaI = Math.atan2(-vn, norm(vt));
      expect(out.impactAngleRad).toBeCloseTo(thetaI, 12);
      expect(out.craterAngleRad).toBe(craterAngleRad(surface, norm(v), out.impactAngleRad));
      expect(out.craterAngleRad).toBeLessThanOrEqual(Math.min(CRATER_MAX_ANGLE_DEG * DEG, thetaI, Math.PI / 2 - thetaI) + 1e-12);
      expect(norm(n1)).toBeCloseTo(1, 14);
      expect(dot(n1, n)).toBeCloseTo(Math.cos(out.craterAngleRad), 12);
      expect(dot(n1, cross(n, v)) / norm(v)).toBeCloseTo(0, 12);
      expect(dot(n1, vt)).toBeLessThanOrEqual(1e-12);
      // Tilted-frame normal speed: Penner's v', never below the true normal speed.
      const vPrime = norm(vt) * Math.sin(out.craterAngleRad) + -vn * Math.cos(out.craterAngleRad);
      expect(out.effectiveNormalImpactSpeedMps).toBeCloseTo(vPrime, 10);
      expect(out.effectiveNormalImpactSpeedMps).toBeCloseTo(-dot(v, n1), 10);
      expect(out.effectiveNormalImpactSpeedMps).toBeGreaterThanOrEqual(out.normalImpactSpeedMps - 1e-12);
      expect(out.restitution).toBe(effectiveRestitution(surface, out.effectiveNormalImpactSpeedMps));
      // Impulse invariants in the tilted frame.
      const before = kineticEnergy(m, I, v, w);
      const after = kineticEnergy(m, I, out.velocityMps, out.angularVelocityRadPerSec);
      expect(after).toBeLessThanOrEqual(before * (1 + 1e-12));
      expect(dot(out.velocityMps, n1)).toBeCloseTo(out.restitution * out.effectiveNormalImpactSpeedMps, 9);
      expect(dot(out.velocityMps, n1)).toBeGreaterThanOrEqual(0);
      const l0 = angularMomentumAboutContact(v, w, n1);
      const l1 = angularMomentumAboutContact(out.velocityMps, out.angularVelocityRadPerSec, n1);
      const scaleL = Math.hypot(l0.x, l0.y, l0.z) + 1e-12;
      expect(Math.hypot(l1.x - l0.x, l1.y - l0.y, l1.z - l0.z) / scaleL).toBeLessThan(1e-10);
      expect(out.tangentialImpulseNs).toBeLessThanOrEqual(surface.slidingFriction * out.normalImpulseNs * (1 + 1e-12));
      expect(out.normalImpulseNs).toBeCloseTo(m * (1 + out.restitution) * out.effectiveNormalImpactSpeedMps, 12);
    }
    expect(tilted).toBeGreaterThan(1500);
  });

  it("leaves a separating ball unchanged and validates input", () => {
    const out = resolveImpact({ velocityMps: vec3(3, 0, 1), angularVelocityRadPerSec: vec3(0, 10, 0), normal: UP, surface: green, ballProfile: TEST_BALL });
    expect(out.velocityMps).toEqual(vec3(3, 0, 1));
    expect(out.angularVelocityRadPerSec).toEqual(vec3(0, 10, 0));
    expect(out.normalImpulseNs).toBe(0);
    expect(out.craterAngleRad).toBe(0);
    expect(out.effectiveNormal).toEqual(UP);
    // Unnormalised normal is normalised.
    const a = resolveImpact({ velocityMps: vec3(4, 1, -6), angularVelocityRadPerSec: vec3(0, -100, 0), normal: vec3(0, 0, 7), surface: green, ballProfile: TEST_BALL });
    const b = resolveImpact({ velocityMps: vec3(4, 1, -6), angularVelocityRadPerSec: vec3(0, -100, 0), normal: UP, surface: green, ballProfile: TEST_BALL });
    expect(a).toEqual(b);
    expect(() => resolveImpact({ velocityMps: vec3(0, 0, -1), angularVelocityRadPerSec: vec3(0, 0, 0), normal: vec3(0, 0, 0), surface: green, ballProfile: TEST_BALL })).toThrow(RangeError);
    expect(() => resolveImpact({ velocityMps: vec3(Number.NaN, 0, -1), angularVelocityRadPerSec: vec3(0, 0, 0), normal: UP, surface: green, ballProfile: TEST_BALL })).toThrow(RangeError);
    expect(() => resolveImpact({ velocityMps: vec3(0, 0, -1), angularVelocityRadPerSec: vec3(0, 0, 0), normal: UP, surface: green, ballProfile: { ...TEST_BALL, massKg: 0 } })).toThrow(RangeError);
  });

  it("is deterministic", () => {
    const input = { ...landing(21, 52, -650), normal: normalize(vec3(0.05, -0.02, 1)) as Vec3, surface: getSurface("fairway-normal"), ballProfile: TEST_BALL };
    expect(resolveImpact(input)).toEqual(resolveImpact(input));
  });
});

describe("resolveImpact: rigid-surface impulse algebra (theta_c = 0)", () => {
  it("vertical drop without spin rebounds at e*v (height ratio e^2), crater or not", () => {
    const vIn = 5;
    for (const surface of [green, rigidGreen]) {
      const out = resolveImpact({ velocityMps: vec3(0, 0, -vIn), angularVelocityRadPerSec: vec3(0, 0, 0), normal: UP, surface, ballProfile: TEST_BALL });
      const e = 0.34;
      expect(out.craterAngleRad).toBe(0);
      expect(out.impactAngleRad).toBeCloseTo(Math.PI / 2, 15);
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
    }
  });

  it("frictionless rigid surface preserves tangential velocity and spin", () => {
    const ice = withSurfaceOverrides(rigidGreen, { slidingFriction: 0 });
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
    const out = resolveImpact({ velocityMps: vec3(10, 0, -10), angularVelocityRadPerSec: vec3(0, 0, 0), normal: UP, surface: rigidGreen, ballProfile: TEST_BALL });
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
    const slick = withSurfaceOverrides(rigidGreen, { slidingFriction: 0.1 });
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
    const vIn = landing(15, 75).velocityMps;
    const run = (wy: number) =>
      resolveImpact({ velocityMps: vIn, angularVelocityRadPerSec: vec3(0, wy, 0), normal: UP, surface: rigidGreen, ballProfile: TEST_BALL });
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
    const ice = withSurfaceOverrides(rigidGreen, { slidingFriction: 0 });
    const noGrip = resolveImpact({ velocityMps: vIn, angularVelocityRadPerSec: vec3(0, -700, 0), normal: UP, surface: ice, ballProfile: TEST_BALL });
    expect(noGrip.velocityMps.x).toBeCloseTo(vIn.x, 14);
  });

  it("works on a tilted surface normal: a no-spin ball dropped on a slope gains spin about the slope axis", () => {
    const theta = 10 * DEG;
    const n = vec3(Math.sin(theta), 0, Math.cos(theta)); // slope descending toward +X
    for (const surface of [rigidGreen, green]) {
      const out = resolveImpact({ velocityMps: vec3(0, 0, -6), angularVelocityRadPerSec: vec3(0, 0, 0), normal: n, surface, ballProfile: TEST_BALL });
      // Tangential part of a vertical drop points downhill (+X along the slope): forward roll about +Y.
      expect(out.angularVelocityRadPerSec.y).toBeGreaterThan(0);
      expect(out.velocityMps.x).toBeGreaterThan(0);
      expect(dot(out.velocityMps, out.effectiveNormal)).toBeCloseTo(out.restitution * out.effectiveNormalImpactSpeedMps, 12);
      if (surface === rigidGreen) expect(dot(out.velocityMps, n)).toBeCloseTo(out.restitution * 6 * Math.cos(theta), 12);
      // The crater tilts back up the slope, against the downhill tangential velocity.
      else expect(out.effectiveNormal.x).toBeLessThan(n.x);
    }
  });
});
