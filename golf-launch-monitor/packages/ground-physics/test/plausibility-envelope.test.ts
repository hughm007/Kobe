/**
 * PLAUSIBILITY ENVELOPE — a sanity check, NOT validation.
 *
 * Targets are common knowledge, not a sourced dataset: tour drives are commonly quoted as
 * running ~20-30 yd past carry on firm fairways, and high-spin mid irons stop within a few
 * yards. The SAME targets were used to choose provisional parameters (the fairway's crater
 * size, i.e. its firmness), so passing here is not evidence of accuracy; it only guards
 * against regressions to implausible ground behaviour (docs/terrain-model.md §7.3). Drivers
 * reach the envelope only through the speed-dependent rolling resistance beta (extrapolated
 * from putting speeds, bounded by mu): with constant rolling resistance they run 57-66 yd in
 * the full stack (doc §7.3 attribution table).
 *
 * Landing states are illustrative, shaped on the synthetic fixture landings. Hops are
 * gravity-only (no drag or lift), so they run longer than in the full simulator, much longer
 * for fast, shallow landings that skip (knuckleball: ~159 yd here, ~83 yd in the full stack).
 * Ground travel = signed along-track displacement first contact -> rest (bounce + roll).
 */
import { describe, expect, it } from "vitest";
import { isFiniteVec, vec3 } from "@glm/core-math";
import type { SurfaceProperties, SurfaceType, TerrainQuery } from "@glm/shared-types";
import { createFlatRangeTerrain, createPlaneTerrain, getSurface, withSurfaceOverrides } from "@glm/terrain-engine";
import { groundDistances, simulateGroundMotion } from "../src/index";
import { G, gravityHop, R, TEST_BALL } from "./helpers";

const YD = 0.9144;
const DEG = Math.PI / 180;

type Landing = {
  readonly speedMps: number;
  readonly descentDeg: number;
  /** Backspin magnitude, rad/s (about -Y for a ball travelling +X). */
  readonly backspinRadPerSec: number;
  /** Landing heading, deg left of +X. */
  readonly headingDeg?: number;
  /** Spin-axis tilt, deg; positive curves right (coordinate-system.md §4.3). */
  readonly axisTiltDeg?: number;
};

const DRIVER: Landing = { speedMps: 25, descentDeg: 37, backspinRadPerSec: 250 };
const SEVEN_IRON: Landing = { speedMps: 20, descentDeg: 50, backspinRadPerSec: 600 };

const HIGH_SEVEN_IRON: Landing = { speedMps: 21, descentDeg: 56, backspinRadPerSec: 700 };
const LOW_SEVEN_IRON: Landing = { speedMps: 21, descentDeg: 38, backspinRadPerSec: 470 };
const KNUCKLEBALL: Landing = { speedMps: 36, descentDeg: 17, backspinRadPerSec: 0 };

function flat(surface: SurfaceType | SurfaceProperties = "fairway-normal"): TerrainQuery {
  return createFlatRangeTerrain({ ballRadiusM: R, surface });
}

/** Plane through the flat-range ground point, rising toward +X (uphill) at `deg` (negative: downhill). */
function slope(deg: number): TerrainQuery {
  return createPlaneTerrain({
    id: `slope-${deg}`,
    pointOnPlaneM: vec3(0, 0, -R),
    normal: vec3(-Math.sin(deg * DEG), 0, Math.cos(deg * DEG)),
    surface: "fairway-normal",
  });
}

function groundTravel(landing: Landing, terrain: TerrainQuery = flat()) {
  const h = (landing.headingDeg ?? 0) * DEG;
  const tilt = (landing.axisTiltDeg ?? 0) * DEG;
  const th = landing.descentDeg * DEG;
  const s = landing.speedMps;
  const w = landing.backspinRadPerSec;
  const velocity = vec3(s * Math.cos(th) * Math.cos(h), s * Math.cos(th) * Math.sin(h), -s * Math.sin(th));
  // w (cos(tilt) r - sin(tilt) u) with r the horizontal right of the heading; u taken as +Z here.
  const spin = vec3(w * Math.sin(h) * Math.cos(tilt), -w * Math.cos(h) * Math.cos(tilt), -w * Math.sin(tilt));
  const at = vec3(0, 0, terrain.sample(0, 0).heightM + R);
  const result = simulateGroundMotion({
    firstContact: { timeS: 6, positionM: at, velocityMps: velocity, angularVelocityRadPerSec: spin, terrain: terrain.sample(at.x, at.y) },
    terrain,
    ballProfile: TEST_BALL,
    gravityMps2: G,
    hop: gravityHop(terrain, R),
    settings: { maxGroundTimeS: 60, outputSampleIntervalS: 0.05 },
  });
  expect(result.termination).toBe("rest");
  expect(isFiniteVec(result.restPositionM)).toBe(true);
  const d = groundDistances(at, result);
  return { yd: (d.bounceDistanceM + d.rollDistanceM) / YD, bounceYd: d.bounceDistanceM / YD, rollYd: d.rollDistanceM / YD };
}

describe("ground plausibility envelope on a flat normal fairway (sanity check, not validation)", () => {
  it("straight driver (25 m/s at 37 deg, 250 rad/s) runs 10-40 yd", () => {
    const d = groundTravel(DRIVER);
    expect(d.yd).toBeGreaterThan(10);
    expect(d.yd).toBeLessThan(40);
    expect(d.bounceYd).toBeGreaterThan(0);
    expect(d.rollYd).toBeGreaterThan(0);
  });

  it("draw and fade drivers run like the straight one", () => {
    const straight = groundTravel(DRIVER).yd;
    const draw = groundTravel({ ...DRIVER, headingDeg: 3, axisTiltDeg: -6 }).yd;
    const fade = groundTravel({ ...DRIVER, descentDeg: 39, backspinRadPerSec: 270, headingDeg: -3, axisTiltDeg: 6 }).yd;
    for (const yd of [draw, fade]) {
      expect(yd).toBeGreaterThan(10);
      expect(yd).toBeLessThan(40);
      expect(Math.abs(yd - straight)).toBeLessThan(5);
    }
  });

  it("standard 7-iron (20 m/s at 50 deg, 600 rad/s) stops within 0-10 yd", () => {
    const d = groundTravel(SEVEN_IRON);
    expect(d.yd).toBeGreaterThanOrEqual(0);
    expect(d.yd).toBeLessThan(10);
  });

  it("high 7-iron (21 m/s at 56 deg, 700 rad/s) stops within 0-6 yd without spinning back", () => {
    const d = groundTravel(HIGH_SEVEN_IRON);
    expect(d.bounceYd).toBeGreaterThanOrEqual(0);
    expect(d.rollYd).toBeGreaterThanOrEqual(0);
    expect(d.yd).toBeLessThan(6);
  });

  it("low 7-iron (21 m/s at 38 deg, 470 rad/s) runs 3-25 yd", () => {
    const d = groundTravel(LOW_SEVEN_IRON);
    expect(d.yd).toBeGreaterThan(3);
    expect(d.yd).toBeLessThan(25);
  });

  it("zero-spin knuckleball (36 m/s at 17 deg) runs a finite distance, under twice its ~93 yd carry", () => {
    const d = groundTravel(KNUCKLEBALL);
    expect(Number.isFinite(d.yd)).toBe(true);
    expect(d.yd).toBeGreaterThan(0);
    expect(d.yd).toBeLessThan(2 * 93);
  });
});

describe("ground travel moves in the physical direction", () => {
  const strictlyDecreasing = (values: readonly number[]) => {
    for (let i = 1; i < values.length; i++) expect(values[i]!).toBeLessThan(values[i - 1]!);
  };

  it("a steeper landing runs less", () => {
    strictlyDecreasing([30, 37, 45].map((descentDeg) => groundTravel({ ...DRIVER, descentDeg }).yd));
    strictlyDecreasing([45, 50, 55].map((descentDeg) => groundTravel({ ...SEVEN_IRON, descentDeg }).yd));
  });

  it("KNOWN LIMITATION (docs §3.1): beyond the 90 deg - theta_i clamp a steeper landing finishes less far behind its pitch mark", () => {
    // 25 m/s, 250 rad/s on the green: the clamp binds above 90 / (1 + 0.347 (v / 18.6 m/s) craterScale) = 61 deg.
    const green = flat("green");
    const at = (descentDeg: number) => groundTravel({ ...DRIVER, descentDeg }, green).yd;
    strictlyDecreasing([30, 40, 50, 60, 65].map(at));
    const [steep65, steep85] = [at(65), at(85)];
    expect(steep65).toBeLessThan(0);
    expect(steep85).toBeLessThan(0);
    // The crater's backward kick shrinks toward the symmetric vertical-drop limit (theta_c -> 0).
    expect(steep85).toBeGreaterThan(steep65);
  });

  it("more backspin runs less", () => {
    strictlyDecreasing([150, 250, 400].map((backspinRadPerSec) => groundTravel({ ...DRIVER, backspinRadPerSec }).yd));
    strictlyDecreasing([400, 600, 800].map((backspinRadPerSec) => groundTravel({ ...SEVEN_IRON, backspinRadPerSec }).yd));
  });

  it("catalog rows: a softer row runs less and a firmer one more (rows also differ in c0, restitution and mu)", () => {
    for (const landing of [DRIVER, SEVEN_IRON]) {
      const [soft, normal, firm] = (["fairway-soft", "fairway-normal", "fairway-firm"] as const).map((s) => groundTravel(landing, flat(s)).yd);
      expect(soft!).toBeLessThan(normal!);
      expect(firm!).toBeGreaterThan(normal!);
      expect(groundTravel(landing, flat("rough")).yd).toBeLessThan(normal!);
    }
  });

  it("firmness alone (crater size only): a softer fairway runs less for drivers and irons", () => {
    const base = getSurface("fairway-normal");
    const atFirmness = (landing: Landing, firmness: number) => groundTravel(landing, flat(withSurfaceOverrides(base, { firmness }))).yd;
    for (const landing of [DRIVER, SEVEN_IRON, HIGH_SEVEN_IRON, LOW_SEVEN_IRON]) {
      strictlyDecreasing([0.8, 0.7, 0.5, 0.3].map((f) => atFirmness(landing, f)));
    }
    for (const landing of [SEVEN_IRON, HIGH_SEVEN_IRON, LOW_SEVEN_IRON]) {
      strictlyDecreasing([1, 0.9, 0.8].map((f) => atFirmness(landing, f)));
    }
    // KNOWN LIMITATION (docs §7.3, §9): above firmness 0.8 a drag-free driver no longer gains
    // (35.4 yd rigid vs 36.8 yd at 0.8); with real flight hops it does (full stack, doc §7.3).
    expect(Math.abs(atFirmness(DRIVER, 1) - atFirmness(DRIVER, 0.8))).toBeLessThan(2);
  });

  it("KNOWN LIMITATION (docs §7.3, §9): a fast, shallow, spinless landing skips off the crater ramp, and without air drag a softer fairway then runs FARTHER", () => {
    const base = getSurface("fairway-normal");
    const atFirmness = (firmness: number) => groundTravel(KNUCKLEBALL, flat(withSurfaceOverrides(base, { firmness }))).yd;
    const [soft, rigid] = [atFirmness(0.5), atFirmness(1)];
    expect(soft).toBeGreaterThan(rigid);
    expect(soft).toBeGreaterThan(200);
    expect(rigid).toBeLessThan(150);
  });

  it("an uphill landing runs less, a downhill one more", () => {
    for (const landing of [DRIVER, SEVEN_IRON]) {
      strictlyDecreasing([-4, 0, 3, 6].map((deg) => groundTravel(landing, deg === 0 ? flat() : slope(deg)).yd));
    }
  });
});
