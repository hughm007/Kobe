import type { Vec3 } from "@glm/shared-types";
import { describe, expect, it } from "vitest";
import {
  computeAcceleration,
  createEnvironmentProfile,
  DEFAULT_INDOOR_ENVIRONMENT,
  getBallProfile,
  getLiftModel,
} from "../src/index";
import { DEG, spinVector } from "./helpers";

const profile = getBallProfile("premium-urethane-baseline");
const env = DEFAULT_INDOOR_ENVIRONMENT;
const ZERO: Vec3 = { x: 0, y: 0, z: 0 };
const norm = (a: Vec3): number => Math.hypot(a.x, a.y, a.z);
const allFinite = (r: ReturnType<typeof computeAcceleration>): boolean =>
  [r.gravity, r.drag, r.lift, r.total].every((v) => Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z)) &&
  [r.airSpeedMps, r.reynolds, r.spinParameter, r.dragCoefficient, r.liftCoefficient].every(Number.isFinite);

describe("computeAcceleration", () => {
  it("no spin => no lift; drag opposes velocity; gravity is -Z", () => {
    const a = computeAcceleration({ x: 60, y: 0, z: 10 }, ZERO, env, profile);
    expect(a.lift).toEqual(ZERO);
    expect(a.liftCoefficient).toBe(0);
    expect(a.spinParameter).toBe(0);
    expect(a.gravity).toEqual({ x: 0, y: 0, z: -9.80665 });
    // Drag antiparallel to v.
    expect(a.drag.x / 60).toBeCloseTo(a.drag.z / 10, 12);
    expect(a.drag.x).toBeLessThan(0);
    const speed = Math.hypot(60, 10);
    const expectedMag = (0.5 * env.airDensityKgM3 * profile.crossSectionAreaM2 * a.dragCoefficient * speed * speed) / profile.massKg;
    expect(norm(a.drag)).toBeCloseTo(expectedMag, 10);
    expect(a.reynolds).toBeCloseTo((env.airDensityKgM3 * speed * profile.diameterM) / env.airDynamicViscosityPaS, 6);
    expect(a.total.z).toBeCloseTo(a.drag.z + a.lift.z - 9.80665, 12);
  });

  it("backspin (omega along -Y) with v along +X gives +Z lift of the model magnitude", () => {
    const v = 60;
    const w = 300;
    const a = computeAcceleration({ x: v, y: 0, z: 0 }, { x: 0, y: -w, z: 0 }, env, profile);
    expect(a.lift.x).toBeCloseTo(0, 15);
    expect(a.lift.y).toBeCloseTo(0, 15);
    expect(a.lift.z).toBeGreaterThan(0);
    const s = (w * profile.diameterM) / 2 / v;
    expect(a.spinParameter).toBeCloseTo(s, 14);
    const cl = getLiftModel(profile.liftModelId).evaluate(
      { speedMps: v, reynolds: a.reynolds, spinParameter: s },
      profile.liftModelParams,
    );
    expect(a.liftCoefficient).toBeCloseTo(cl, 14);
    expect(a.lift.z).toBeCloseTo((0.5 * env.airDensityKgM3 * profile.crossSectionAreaM2 * cl * v * v) / profile.massKg, 10);
  });

  it("topspin (omega along +Y) gives downward force", () => {
    const a = computeAcceleration({ x: 40, y: 0, z: 0 }, { x: 0, y: 200, z: 0 }, env, profile);
    expect(a.lift.z).toBeLessThan(0);
  });

  it("positive spin-axis tilt (coordinate-system.md §4.3) gives a rightward (-Y) force; negative gives +Y", () => {
    const vel = { x: 60, y: 0, z: 12 };
    const right = computeAcceleration(vel, spinVector(vel, 3000, 20 * DEG), env, profile);
    const left = computeAcceleration(vel, spinVector(vel, 3000, -20 * DEG), env, profile);
    expect(right.lift.y).toBeLessThan(0);
    expect(left.lift.y).toBeGreaterThan(0);
    expect(right.lift.y).toBeCloseTo(-left.lift.y, 12);
    // Lift stays perpendicular to the air velocity.
    expect(right.lift.x * vel.x + right.lift.y * vel.y + right.lift.z * vel.z).toBeCloseTo(0, 9);
    // Tilt rotates, but does not change, the perpendicular spin: same |lift|.
    const flat = computeAcceleration(vel, spinVector(vel, 3000, 0), env, profile);
    expect(norm(right.lift)).toBeCloseTo(norm(flat.lift), 10);
  });

  it("rifle spin parallel to v produces no lift and does not enter the spin parameter", () => {
    const vel = { x: 50, y: 5, z: 20 };
    const speed = norm(vel);
    const rifleOnly = { x: (400 * vel.x) / speed, y: (400 * vel.y) / speed, z: (400 * vel.z) / speed };
    const a = computeAcceleration(vel, rifleOnly, env, profile);
    expect(a.spinParameter).toBeLessThan(1e-12);
    expect(norm(a.lift)).toBeLessThan(1e-9);

    const back = spinVector(vel, 2500, 0);
    const mixed = spinVector(vel, 2500, 0, 1500);
    const ab = computeAcceleration(vel, back, env, profile);
    const am = computeAcceleration(vel, mixed, env, profile);
    expect(am.spinParameter).toBeCloseTo(ab.spinParameter, 12);
    expect(am.lift.x).toBeCloseTo(ab.lift.x, 10);
    expect(am.lift.y).toBeCloseTo(ab.lift.y, 10);
    expect(am.lift.z).toBeCloseTo(ab.lift.z, 10);
  });

  it("uses air-relative velocity: tailwind reduces drag, headwind increases it", () => {
    const vel = { x: 50, y: 0, z: 0 };
    const tail = createEnvironmentProfile({ windMps: { x: 5, y: 0, z: 0 }, indoorMode: false });
    const head = createEnvironmentProfile({ windMps: { x: -5, y: 0, z: 0 }, indoorMode: false });
    const calm = computeAcceleration(vel, ZERO, DEFAULT_INDOOR_ENVIRONMENT, profile);
    const withTail = computeAcceleration(vel, ZERO, tail, profile);
    const withHead = computeAcceleration(vel, ZERO, head, profile);
    expect(withTail.airSpeedMps).toBeCloseTo(45, 12);
    expect(withHead.airSpeedMps).toBeCloseTo(55, 12);
    expect(Math.abs(withTail.drag.x)).toBeLessThan(Math.abs(calm.drag.x));
    expect(Math.abs(withHead.drag.x)).toBeGreaterThan(Math.abs(calm.drag.x));
  });

  it("Magnus direction is unit(omega x v_AIR), not omega x v_ball (crosswind, vertical spin axis)", () => {
    // v_ball = (40, 0, 0), wind = (0, 10, 0) => v_air = (40, -10, 0); omega = (0, 0, 300) is
    // perpendicular to v_air, so omega x v_air = (3000, 12000, 0) => direction (1, 4, 0)/sqrt(17).
    // Using the ball velocity instead would give (0, 1, 0).
    const windy = createEnvironmentProfile({ windMps: { x: 0, y: 10, z: 0 }, indoorMode: false });
    const vBall = { x: 40, y: 0, z: 0 };
    const vAir = { x: 40, y: -10, z: 0 };
    const a = computeAcceleration(vBall, { x: 0, y: 0, z: 300 }, windy, profile);
    const mag = norm(a.lift);
    expect(a.lift.x / mag).toBeCloseTo(1 / Math.sqrt(17), 12);
    expect(a.lift.y / mag).toBeCloseTo(4 / Math.sqrt(17), 12);
    expect(Math.abs(a.lift.z)).toBe(0);
    // Perpendicular to the air velocity, NOT to the ball velocity.
    expect((a.lift.x * vAir.x + a.lift.y * vAir.y) / (mag * norm(vAir))).toBeCloseTo(0, 12);
    expect((a.lift.x * vBall.x) / (mag * norm(vBall))).toBeCloseTo(1 / Math.sqrt(17), 12);
    // Magnitude and S also use the air speed.
    const airSpeed = Math.sqrt(1700);
    expect(a.airSpeedMps).toBeCloseTo(airSpeed, 12);
    expect(a.spinParameter).toBeCloseTo((300 * profile.diameterM) / 2 / airSpeed, 12);
    expect(mag).toBeCloseTo(
      (0.5 * windy.airDensityKgM3 * profile.crossSectionAreaM2 * a.liftCoefficient * airSpeed * airSpeed) / profile.massKg,
      10,
    );
  });

  it("throws on non-finite inputs and on inputs whose forces overflow (never returns NaN)", () => {
    expect(() => computeAcceleration({ x: Number.NaN, y: 0, z: 0 }, ZERO, env, profile)).toThrow(/must have finite components/);
    expect(() => computeAcceleration({ x: 50, y: 0, z: 0 }, { x: 0, y: Number.POSITIVE_INFINITY, z: 0 }, env, profile)).toThrow(
      /must have finite components/,
    );
    expect(() => computeAcceleration({ x: 1e160, y: 0, z: 0 }, { x: 0, y: -300, z: 0 }, env, profile)).toThrow(
      /overflow double precision/,
    );
    // Large but representable speeds stay finite.
    expect(allFinite(computeAcceleration({ x: 1e100, y: 0, z: 0 }, { x: 0, y: -300, z: 0 }, env, profile))).toBe(true);
  });

  it("a crosswind on a ball at rest produces drag along the wind", () => {
    const windy = createEnvironmentProfile({ windMps: { x: 0, y: 8, z: 0 }, indoorMode: false });
    const a = computeAcceleration(ZERO, ZERO, windy, profile);
    expect(a.drag.y).toBeGreaterThan(0);
    expect(Math.abs(a.drag.x)).toBe(0);
  });

  it("is safe at zero and tiny air speed (no NaN, no lift)", () => {
    const spin = { x: 0, y: -300, z: 0 };
    const atRest = computeAcceleration(ZERO, spin, env, profile);
    expect(allFinite(atRest)).toBe(true);
    expect(atRest.lift).toEqual(ZERO);
    expect(atRest.spinParameter).toBe(0);
    expect(atRest.total).toEqual({ x: 0, y: 0, z: -9.80665 });
    const tiny = computeAcceleration({ x: 1e-8, y: 0, z: 0 }, spin, env, profile);
    expect(allFinite(tiny)).toBe(true);
    expect(tiny.lift).toEqual(ZERO);
    const withWind = createEnvironmentProfile({ windMps: { x: 3, y: 0, z: 0 }, indoorMode: false });
    const movingWithAir = computeAcceleration({ x: 3, y: 0, z: 0 }, spin, withWind, profile);
    expect(allFinite(movingWithAir)).toBe(true);
    expect(movingWithAir.lift).toEqual(ZERO);
    const tinySpin = computeAcceleration({ x: 50, y: 0, z: 0 }, { x: 0, y: -1e-12, z: 0 }, env, profile);
    expect(tinySpin.lift).toEqual(ZERO);
  });
});
