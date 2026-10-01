import { describe, expect, it } from "vitest";
import { SURFACE_TYPES, SurfacePropertiesSchema, type SurfaceType } from "@glm/shared-types";
import {
  createFlatRangeTerrain,
  createPlaneTerrain,
  createRegionTerrain,
  DEFAULT_GREEN_STIMP_FT,
  flatRollingDistanceM,
  getSurface,
  PENNER_ROLLING_BETA_S2_PER_FT2,
  pointInPolygon,
  ROLLING_RESISTANCE_BETA_S2_PER_M2,
  rollingDecelerationCoefficient,
  rollingResistanceBoundSpeedMps,
  rollingResistanceFromStimp,
  rollingResistanceSpeedFactor,
  STANDARD_GRAVITY_MPS2,
  stimpFromRollingResistance,
  STIMPMETER_RELEASE_SPEED_MPS,
  SURFACE_CATALOG,
  surfaceToLie,
  TERRAIN_MODEL_VERSION,
  withSurfaceOverrides,
} from "../src/index";

const NON_TERMINAL = SURFACE_TYPES.filter((t) => !SURFACE_CATALOG[t].terminal);

describe("surface catalog", () => {
  it("has every SurfaceType, schema-valid, provisional, versioned and deep-frozen", () => {
    expect(TERRAIN_MODEL_VERSION).toBe("glm-terrain-0.2.0");
    expect(Object.keys(SURFACE_CATALOG).sort()).toEqual([...SURFACE_TYPES].sort());
    for (const type of SURFACE_TYPES) {
      const s = SURFACE_CATALOG[type];
      expect(s.type).toBe(type);
      expect(s.provisional).toBe(true);
      expect(s.version).toBe(TERRAIN_MODEL_VERSION);
      expect(() => SurfacePropertiesSchema.parse(s)).not.toThrow();
      expect(s.restitutionMin).toBeLessThanOrEqual(s.restitutionBase);
      expect(Object.isFrozen(s)).toBe(true);
    }
    expect(Object.isFrozen(SURFACE_CATALOG)).toBe(true);
  });

  it("marks exactly water, out-of-bounds and penalty-area terminal", () => {
    const terminal = SURFACE_TYPES.filter((t) => SURFACE_CATALOG[t].terminal).sort();
    expect(terminal).toEqual(["out-of-bounds", "penalty-area", "water"]);
  });

  it("is physically ordered", () => {
    const max = (key: "firmness" | "restitutionBase" | "rollingResistance", types: readonly SurfaceType[]) =>
      types.reduce((best, t) => (SURFACE_CATALOG[t][key] > SURFACE_CATALOG[best][key] ? t : best));
    const min = (key: "firmness" | "restitutionBase" | "rollingResistance", types: readonly SurfaceType[]) =>
      types.reduce((best, t) => (SURFACE_CATALOG[t][key] < SURFACE_CATALOG[best][key] ? t : best));
    // Cart path: firmest and liveliest surface.
    expect(max("firmness", SURFACE_TYPES)).toBe("cart-path");
    expect(max("restitutionBase", SURFACE_TYPES)).toBe("cart-path");
    // Bunker: softest, deadest, slowest; rough next slowest among playable turf.
    expect(min("firmness", NON_TERMINAL)).toBe("bunker");
    expect(min("restitutionBase", NON_TERMINAL)).toBe("bunker");
    expect(max("rollingResistance", NON_TERMINAL)).toBe("bunker");
    expect(max("rollingResistance", NON_TERMINAL.filter((t) => t !== "bunker"))).toBe("rough");
    // Green: lowest rolling resistance of any playable surface.
    expect(min("rollingResistance", NON_TERMINAL)).toBe("green");
    // Fairway firmness grades consistently.
    const f = (t: SurfaceType) => SURFACE_CATALOG[t];
    expect(f("fairway-firm").restitutionBase).toBeGreaterThan(f("fairway-normal").restitutionBase);
    expect(f("fairway-normal").restitutionBase).toBeGreaterThan(f("fairway-soft").restitutionBase);
    expect(f("fairway-firm").rollingResistance).toBeLessThan(f("fairway-normal").rollingResistance);
    expect(f("fairway-normal").rollingResistance).toBeLessThan(f("fairway-soft").rollingResistance);
    expect(f("rough").rollingResistance).toBeGreaterThan(f("first-cut").rollingResistance);
    expect(f("first-cut").rollingResistance).toBeGreaterThan(f("fairway-normal").rollingResistance);
  });

  it("orders restitution by firmness: a firmer playable surface never bounces less", () => {
    for (const a of NON_TERMINAL) {
      for (const b of NON_TERMINAL) {
        if (SURFACE_CATALOG[a].firmness > SURFACE_CATALOG[b].firmness) {
          expect(SURFACE_CATALOG[a].restitutionBase, `${a} vs ${b}`).toBeGreaterThanOrEqual(SURFACE_CATALOG[b].restitutionBase);
        }
      }
    }
    // Firmness sets the crater size (ground-physics craterScale): the green is the reference
    // (0.5), every fairway and the tee are firmer, the mat firmer still, the cart path rigid.
    expect(SURFACE_CATALOG.green.firmness).toBe(0.5);
    const f = (t: SurfaceType) => SURFACE_CATALOG[t].firmness;
    expect(f("fairway-normal")).toBeGreaterThan(f("green"));
    expect(f("tee")).toBeGreaterThan(f("green"));
    expect(f("fairway-soft")).toBeLessThan(f("green"));
    expect([f("fairway-soft"), f("fairway-normal"), f("fairway-firm"), f("range-mat"), f("cart-path")]).toEqual([0.4, 0.75, 0.85, 0.9, 1]);
    // The green keeps the liveliest restitution among surfaces at or below its firmness.
    for (const t of NON_TERMINAL) if (f(t) <= f("green")) expect(SURFACE_CATALOG[t].restitutionBase).toBeLessThanOrEqual(SURFACE_CATALOG.green.restitutionBase);
  });

  it("derives the green rolling resistance from the default Stimp", () => {
    const green = getSurface("green");
    expect(DEFAULT_GREEN_STIMP_FT).toBe(10);
    expect(green.stimpFt).toBe(10);
    expect(green.rollingResistance).toBe(rollingResistanceFromStimp(10));
    expect(green.rollingResistance).toBeCloseTo(0.05033, 5);
    for (const t of SURFACE_TYPES) if (t !== "green") expect(SURFACE_CATALOG[t].stimpFt).toBeNull();
  });

  it("getSurface returns the catalog entry and rejects unknown types", () => {
    expect(getSurface("rough")).toBe(SURFACE_CATALOG.rough);
    expect(() => getSurface("lava" as SurfaceType)).toThrow(/Unknown surface/);
  });

  it("rejects inherited Object.prototype keys as surface types", () => {
    for (const key of ["constructor", "__proto__", "toString", "hasOwnProperty"]) {
      expect(() => getSurface(key as SurfaceType)).toThrow(/Unknown surface type/);
      expect(() => createFlatRangeTerrain({ ballRadiusM: 0.02, surface: key as SurfaceType })).toThrow(/Unknown surface type/);
    }
  });
});

describe("withSurfaceOverrides", () => {
  it("applies overrides, re-versions, freezes, and leaves the base untouched", () => {
    const base = getSurface("fairway-normal");
    const wet = withSurfaceOverrides(base, { moistureSoftness: 0.8, slidingFriction: 0.5 });
    expect(wet.moistureSoftness).toBe(0.8);
    expect(wet.slidingFriction).toBe(0.5);
    expect(wet.restitutionBase).toBe(base.restitutionBase);
    expect(wet.version).toBe(`${TERRAIN_MODEL_VERSION}+custom`);
    expect(Object.isFrozen(wet)).toBe(true);
    expect(base.moistureSoftness).toBe(0);
    // Re-overriding does not stack suffixes; an explicit version wins; a no-op keeps it.
    expect(withSurfaceOverrides(wet, { firmness: 0.1 }).version).toBe(`${TERRAIN_MODEL_VERSION}+custom`);
    expect(withSurfaceOverrides(base, { firmness: 0.1, version: "site-fit-3" }).version).toBe("site-fit-3");
    expect(withSurfaceOverrides(base, {}).version).toBe(TERRAIN_MODEL_VERSION);
  });

  it("keeps Stimp and rolling resistance consistent on greens", () => {
    const fast = withSurfaceOverrides(getSurface("green"), { stimpFt: 13 });
    expect(fast.rollingResistance).toBeCloseTo(rollingResistanceFromStimp(13), 15);
    const slow = withSurfaceOverrides(getSurface("green"), { rollingResistance: 0.1 });
    expect(slow.stimpFt).toBeCloseTo(stimpFromRollingResistance(0.1), 12);
    // Non-green surfaces keep stimpFt null when rolling resistance changes.
    expect(withSurfaceOverrides(getSurface("rough"), { rollingResistance: 0.5 }).stimpFt).toBeNull();
  });

  it("rejects invalid values", () => {
    const base = getSurface("green");
    expect(() => withSurfaceOverrides(base, { restitutionBase: 1.5 })).toThrow();
    expect(() => withSurfaceOverrides(base, { slidingFriction: -0.1 })).toThrow();
    expect(() => withSurfaceOverrides(base, { restitutionMin: 0.9 })).toThrow(/restitutionMin/);
    expect(() => withSurfaceOverrides(base, { rollingResistance: Number.POSITIVE_INFINITY })).toThrow();
  });

  it("treats type and provisional as provenance and never passes a catalog row off as fitted", () => {
    const green = getSurface("green");
    // Clearing provisional needs an explicit, new version.
    expect(() => withSurfaceOverrides(green, { provisional: false })).toThrow(/explicit new version/);
    expect(() => withSurfaceOverrides(green, { provisional: false, version: TERRAIN_MODEL_VERSION })).toThrow(/explicit new version/);
    const fitted = withSurfaceOverrides(green, { provisional: false, version: "site-fit-7" });
    expect(fitted.provisional).toBe(false);
    expect(fitted.version).toBe("site-fit-7");
    // Hand-modifying a fitted surface makes it custom and provisional again.
    const tweaked = withSurfaceOverrides(fitted, { slidingFriction: 0.35 });
    expect(tweaked.version).toBe("site-fit-7+custom");
    expect(tweaked.provisional).toBe(true);
    // A type change re-versions.
    const relabelled = withSurfaceOverrides(green, { type: "fringe" });
    expect(relabelled.type).toBe("fringe");
    expect(relabelled.version).toBe(`${TERRAIN_MODEL_VERSION}+custom`);
  });

  it("keeps water and out-of-bounds terminal", () => {
    const green = getSurface("green");
    expect(() => withSurfaceOverrides(green, { type: "water" })).toThrow(/must be terminal/);
    expect(() => withSurfaceOverrides(getSurface("water"), { terminal: false })).toThrow(/must be terminal/);
    expect(() => withSurfaceOverrides(getSurface("out-of-bounds"), { terminal: false })).toThrow(/must be terminal/);
    expect(() => createFlatRangeTerrain({ ballRadiusM: 0.02, surface: { ...getSurface("water"), terminal: false } })).toThrow(/must be terminal/);
    // A playable penalty area is allowed (documented), and re-versioned.
    const playable = withSurfaceOverrides(getSurface("penalty-area"), { terminal: false });
    expect(playable.terminal).toBe(false);
    expect(playable.version).toBe(`${TERRAIN_MODEL_VERSION}+custom`);
  });

  it("rejects a stimpFt / rollingResistance pair that disagrees", () => {
    const green = getSurface("green");
    // c = 0.2 implies about 2.8 ft, not 13 ft.
    expect(() => withSurfaceOverrides(green, { stimpFt: 13, rollingResistance: 0.2 })).toThrow(/disagrees with stimpFt/);
    const both = withSurfaceOverrides(green, { stimpFt: 13, rollingResistance: rollingResistanceFromStimp(13) * 1.005 });
    expect(both.stimpFt).toBe(13);
    // Zero rolling resistance has no finite Stimp equivalent: the reading must be cleared explicitly.
    expect(() => withSurfaceOverrides(green, { rollingResistance: 0 })).toThrow(/disagrees with stimpFt/);
    const frictionless = withSurfaceOverrides(green, { rollingResistance: 0, stimpFt: null });
    expect(frictionless.rollingResistance).toBe(0);
    expect(frictionless.stimpFt).toBeNull();
    // Explicit properties are held to the same rule.
    expect(() => createFlatRangeTerrain({ ballRadiusM: 0.02, surface: { ...green, stimpFt: 13 } })).toThrow(/disagrees with stimpFt/);
  });
});

describe("speed-dependent rolling resistance (beta)", () => {
  it("converts Penner's reported beta from s^2/ft^2 to SI", () => {
    expect(PENNER_ROLLING_BETA_S2_PER_FT2).toBe(0.0065);
    expect(ROLLING_RESISTANCE_BETA_S2_PER_M2).toBeCloseTo(0.0065 / (0.3048 * 0.3048), 15);
    expect(ROLLING_RESISTANCE_BETA_S2_PER_M2).toBeCloseTo(0.069965, 6);
    expect(rollingResistanceSpeedFactor(0)).toBe(1);
    expect(rollingResistanceSpeedFactor(-2)).toBeCloseTo(1 + 4 * ROLLING_RESISTANCE_BETA_S2_PER_M2, 15);
    expect(rollingResistanceSpeedFactor(10)).toBeCloseTo(7.9965, 3);
    expect(() => rollingResistanceSpeedFactor(Number.NaN)).toThrow(RangeError);
  });

  it("pins the unit: the reported relation reproduces the Stimp definition only with v in ft/s", () => {
    // rho = (0.7028 / s)(1 + 0.0065 v^2), deceleration (5/7) rho g; roll distance from the 6 ft/s
    // release, integral of v dv / a(v) = s ln(1 + beta v0^2) / (2 beta (5/7) 0.7028 g).
    const rollFt = (stimpFt: number, v0: number, g: number) =>
      (stimpFt * Math.log1p(PENNER_ROLLING_BETA_S2_PER_FT2 * v0 * v0)) / (2 * PENNER_ROLLING_BETA_S2_PER_FT2 * (5 / 7) * 0.7028 * g);
    const gFt = STANDARD_GRAVITY_MPS2 / 0.3048;
    // ft/s units: distance = Stimp reading within 0.5 %.
    expect(Math.abs(rollFt(10, 6, gFt) / 10 - 1)).toBeLessThan(0.005);
    // Same numbers read as m/s (v0 = 1.83 m/s, g in m/s^2, distance in m) miss the reading by > 9 %.
    const rollM = rollFt(10, STIMPMETER_RELEASE_SPEED_MPS, STANDARD_GRAVITY_MPS2);
    expect(Math.abs(rollM / (10 * 0.3048) - 1)).toBeGreaterThan(0.09);
    // Distance-averaged rho (mean v^2 over the roll distance = v0^2 / 2) at 12 ft and 4 ft gives
    // Penner's quoted range 0.065-0.196.
    expect((0.7028 / 12) * (1 + (PENNER_ROLLING_BETA_S2_PER_FT2 * 36) / 2)).toBeCloseTo(0.065, 3);
    expect((0.7028 / 4) * (1 + (PENNER_ROLLING_BETA_S2_PER_FT2 * 36) / 2)).toBeCloseTo(0.196, 3);
  });

  it("gives the closed-form flat stopping distance ln(1 + beta v^2) / (2 c0 g beta)", () => {
    const beta = ROLLING_RESISTANCE_BETA_S2_PER_M2;
    expect(flatRollingDistanceM(0.1, 3, 9.81)).toBeCloseTo(Math.log(1 + beta * 9) / (2 * 0.1 * 9.81 * beta), 12);
    // Speed dependence shortens fast rolls: at 8 m/s, 38 % of the constant-resistance distance.
    expect(flatRollingDistanceM(0.12, 8) / (64 / (2 * 0.12 * STANDARD_GRAVITY_MPS2))).toBeCloseTo(0.3798, 3);
    // ...and barely changes putting-speed rolls (-> v^2 / (2 c g) as beta v^2 -> 0).
    expect(flatRollingDistanceM(0.05, 0.1) / (0.01 / (2 * 0.05 * STANDARD_GRAVITY_MPS2))).toBeCloseTo(1, 3);
    expect(flatRollingDistanceM(0.05, 0)).toBe(0);
    expect(flatRollingDistanceM(0, 2)).toBe(Number.POSITIVE_INFINITY);
    expect(() => flatRollingDistanceM(-0.1, 2)).toThrow(RangeError);
    expect(() => flatRollingDistanceM(0.1, 2, 0)).toThrow(RangeError);
  });
});

describe("rolling deceleration bounded by sliding friction", () => {
  const beta = ROLLING_RESISTANCE_BETA_S2_PER_M2;

  it("is min(c0 (1 + beta v^2), max(c0, mu)): a rolling ball never decelerates faster than a sliding one", () => {
    // Below the bound: the plain speed-dependent coefficient.
    expect(rollingDecelerationCoefficient(0.12, 4, 0.4)).toBeCloseTo(0.12 * (1 + beta * 16), 15);
    // Above it: exactly mu (normal fairway at the straight driver's ~9.8 m/s roll-phase start, where
    // the unbounded factor would be ~7.7).
    expect(rollingDecelerationCoefficient(0.12, 9.77, 0.4)).toBe(0.4);
    expect(0.12 * rollingResistanceSpeedFactor(9.77)).toBeCloseTo(0.921, 3);
    // c0 >= mu (bunker guess): stays c0 at every speed, never reduced below the low-speed value.
    expect(rollingDecelerationCoefficient(0.8, 0, 0.6)).toBe(0.8);
    expect(rollingDecelerationCoefficient(0.8, 20, 0.6)).toBe(0.8);
    // +Infinity: the unbounded relation.
    expect(rollingDecelerationCoefficient(0.12, 9.77, Number.POSITIVE_INFINITY)).toBeCloseTo(0.12 * (1 + beta * 9.77 ** 2), 14);
    expect(() => rollingDecelerationCoefficient(-0.1, 1, 0.4)).toThrow(RangeError);
    expect(() => rollingDecelerationCoefficient(0.1, Number.NaN, 0.4)).toThrow(RangeError);
    expect(() => rollingDecelerationCoefficient(0.1, 1, Number.NaN)).toThrow(RangeError);
    expect(() => rollingDecelerationCoefficient(0.1, 1, -0.4)).toThrow(RangeError);
  });

  it("binds above sqrt((mu / c0 - 1) / beta): 5.77 m/s on the normal fairway, 8.42 m/s on the green", () => {
    const normal = getSurface("fairway-normal");
    const vNormal = rollingResistanceBoundSpeedMps(normal.rollingResistance, normal.slidingFriction);
    expect(vNormal).toBeCloseTo(Math.sqrt((0.4 / 0.12 - 1) / beta), 12);
    expect(vNormal).toBeCloseTo(5.775, 3);
    expect(rollingDecelerationCoefficient(0.12, vNormal, 0.4)).toBeCloseTo(0.4, 12);
    const green = getSurface("green");
    expect(rollingResistanceBoundSpeedMps(green.rollingResistance, green.slidingFriction)).toBeCloseTo(8.420, 3);
    // Far above the Stimp release speed, so the Stimp relation is unaffected.
    expect(rollingResistanceBoundSpeedMps(green.rollingResistance, green.slidingFriction)).toBeGreaterThan(4 * STIMPMETER_RELEASE_SPEED_MPS);
    expect(rollingResistanceBoundSpeedMps(0.8, 0.6)).toBe(0);
    expect(rollingResistanceBoundSpeedMps(0, 0.4)).toBe(Number.POSITIVE_INFINITY);
    expect(rollingResistanceBoundSpeedMps(0.12, Number.POSITIVE_INFINITY)).toBe(Number.POSITIVE_INFINITY);
  });

  it("gives the bounded flat stopping distance in closed form, continuous at the bound speed", () => {
    const g = STANDARD_GRAVITY_MPS2;
    const [c0, mu] = [0.12, 0.4];
    const vb = rollingResistanceBoundSpeedMps(c0, mu);
    for (const v0 of [12, 16.5]) {
      const expected = (v0 * v0 - vb * vb) / (2 * mu * g) + Math.log1p(beta * vb * vb) / (2 * c0 * g * beta);
      expect(flatRollingDistanceM(c0, v0, g, mu)).toBeCloseTo(expected, 12);
      // Longer than the unbounded roll (which would decelerate the fast ball harder than sliding).
      expect(flatRollingDistanceM(c0, v0, g, mu)).toBeGreaterThan(flatRollingDistanceM(c0, v0, g));
    }
    // 9.77 m/s: 15.23 m bounded vs 12.38 m unbounded.
    expect(flatRollingDistanceM(c0, 9.77, g, mu)).toBeCloseTo(15.227, 3);
    expect(flatRollingDistanceM(c0, 9.77, g)).toBeCloseTo(12.379, 3);
    // Below the bound speed the mu argument changes nothing; continuous across it.
    expect(flatRollingDistanceM(c0, 4, g, mu)).toBe(flatRollingDistanceM(c0, 4, g));
    expect(flatRollingDistanceM(c0, vb * (1 + 1e-9), g, mu)).toBeCloseTo(flatRollingDistanceM(c0, vb, g), 6);
    // c0 >= mu: constant deceleration c0 g.
    expect(flatRollingDistanceM(0.8, 3, g, 0.6)).toBeCloseTo(9 / (2 * 0.8 * g), 12);
  });
});

describe("Stimpmeter conversion", () => {
  it("gives c0 = ln(1 + beta v0^2) / (2 g beta d) with v0 = 1.83 m/s", () => {
    expect(STIMPMETER_RELEASE_SPEED_MPS).toBe(1.83);
    const beta = ROLLING_RESISTANCE_BETA_S2_PER_M2;
    expect(rollingResistanceFromStimp(10)).toBeCloseTo(Math.log(1 + beta * 1.83 * 1.83) / (2 * 9.80665 * beta * 3.048), 14);
    expect(rollingResistanceFromStimp(10)).toBeCloseTo(0.050330, 6);
    // 10 % below the constant-deceleration value v0^2 / (2 d g) = 0.05602: the ball decelerates
    // harder while fast, so the low-speed coefficient that rolls the same distance is smaller.
    expect(rollingResistanceFromStimp(10) / (1.83 ** 2 / (2 * 3.048 * 9.80665))).toBeCloseTo(0.8984, 4);
    // Faster green (longer Stimp) => smaller coefficient, still inversely proportional to d.
    expect(rollingResistanceFromStimp(12) / rollingResistanceFromStimp(6)).toBeCloseTo(0.5, 14);
    // A faster release no longer scales as v0^2: ln(1 + 4 beta v0^2) / ln(1 + beta v0^2) < 4.
    const ratio = rollingResistanceFromStimp(10, 2 * 1.83) / rollingResistanceFromStimp(10);
    expect(ratio).toBeCloseTo(Math.log1p(4 * beta * 1.83 ** 2) / Math.log1p(beta * 1.83 ** 2), 12);
    expect(ratio).toBeLessThan(4);
    expect(ratio).toBeCloseTo(3.141, 3);
  });

  it("round-trips, and the Stimp distance is the closed-form rolling distance", () => {
    for (const stimp of [4, 7.5, 10, 12.3, 14]) {
      expect(stimpFromRollingResistance(rollingResistanceFromStimp(stimp))).toBeCloseTo(stimp, 12);
      expect(stimpFromRollingResistance(rollingResistanceFromStimp(stimp, 1.94), 1.94)).toBeCloseTo(stimp, 12);
      const c0 = rollingResistanceFromStimp(stimp);
      expect(flatRollingDistanceM(c0, STIMPMETER_RELEASE_SPEED_MPS)).toBeCloseTo(stimp * 0.3048, 12);
    }
    expect(stimpFromRollingResistance(0.05032958123910552)).toBeCloseTo(10, 9);
  });

  it("rejects non-positive input", () => {
    expect(() => rollingResistanceFromStimp(0)).toThrow(RangeError);
    expect(() => rollingResistanceFromStimp(-3)).toThrow(RangeError);
    expect(() => stimpFromRollingResistance(0)).toThrow(RangeError);
    expect(() => rollingResistanceFromStimp(10, Number.NaN)).toThrow(RangeError);
  });
});

describe("plane terrain", () => {
  it("normalises the normal and evaluates the plane height", () => {
    // 45-degree plane descending toward +X through (1, 0, 2): z = 2 - (x - 1).
    const t = createPlaneTerrain({ id: "p", pointOnPlaneM: { x: 1, y: 0, z: 2 }, normal: { x: 3, y: 0, z: 3 }, surface: "green" });
    const s = t.sample(4, 7);
    expect(s.heightM).toBeCloseTo(-1, 14);
    expect(s.normal.x).toBeCloseTo(Math.SQRT1_2, 15);
    expect(s.normal.z).toBeCloseTo(Math.SQRT1_2, 15);
    expect(s.surface).toBe(SURFACE_CATALOG.green);
    expect(t.id).toBe("p");
    expect(t.version).toBe(TERRAIN_MODEL_VERSION);
    expect(Object.isFrozen(s)).toBe(true);
  });

  it("has slope tan(theta) for normal (sin, 0, cos) and handles a cross slope", () => {
    const theta = (5 * Math.PI) / 180;
    const t = createPlaneTerrain({
      id: "slope",
      version: "v-test",
      pointOnPlaneM: { x: 0, y: 0, z: 0 },
      normal: { x: Math.sin(theta), y: 0, z: Math.cos(theta) },
      surface: "fairway-normal",
    });
    expect(t.version).toBe("v-test");
    expect(t.sample(10, 0).heightM).toBeCloseTo(-10 * Math.tan(theta), 12);
    expect(t.sample(10, 55).heightM).toBeCloseTo(-10 * Math.tan(theta), 12);
    const cross = createPlaneTerrain({ id: "c", pointOnPlaneM: { x: 0, y: 0, z: 1 }, normal: { x: 0, y: -0.1, z: 1 }, surface: "rough" });
    // Normal leaning toward -Y => ground rises toward +Y: z = 1 + 0.1 y.
    expect(cross.sample(3, 2).heightM).toBeCloseTo(1.2, 12);
  });

  it("accepts explicit surface properties and rejects bad normals and queries", () => {
    const custom = withSurfaceOverrides(getSurface("green"), { stimpFt: 12 });
    const t = createPlaneTerrain({ id: "c", pointOnPlaneM: { x: 0, y: 0, z: 0 }, normal: { x: 0, y: 0, z: 1 }, surface: custom });
    expect(t.sample(0, 0).surface.stimpFt).toBe(12);
    const bad = (normal: { x: number; y: number; z: number }) =>
      createPlaneTerrain({ id: "b", pointOnPlaneM: { x: 0, y: 0, z: 0 }, normal, surface: "green" });
    expect(() => bad({ x: 1, y: 0, z: 0 })).toThrow(/positive z/);
    expect(() => bad({ x: 0, y: 0, z: -1 })).toThrow(/positive z/);
    expect(() => bad({ x: 0, y: 0, z: 0 })).toThrow(/non-zero/);
    expect(() => t.sample(Number.NaN, 0)).toThrow(RangeError);
  });
});

describe("flat range terrain", () => {
  it("puts the ground at z = -(ballRadius + teeHeight)", () => {
    const r = 0.021335;
    const ground = createFlatRangeTerrain({ ballRadiusM: r });
    expect(ground.sample(150, -12).heightM).toBe(-r);
    expect(ground.sample(0, 0).normal).toEqual({ x: 0, y: 0, z: 1 });
    expect(ground.sample(0, 0).surface.type).toBe("fairway-normal");
    const teed = createFlatRangeTerrain({ ballRadiusM: r, teeHeightM: 0.03, surface: "range-mat" });
    expect(teed.sample(10, 0).heightM).toBeCloseTo(-(r + 0.03), 15);
    expect(teed.sample(10, 0).surface.type).toBe("range-mat");
    expect(ground.id).toBe("flat-range");
  });

  it("rejects non-physical dimensions", () => {
    expect(() => createFlatRangeTerrain({ ballRadiusM: 0 })).toThrow(RangeError);
    expect(() => createFlatRangeTerrain({ ballRadiusM: 0.02, teeHeightM: -0.01 })).toThrow(RangeError);
  });
});

describe("region terrain", () => {
  const theta = (2 * Math.PI) / 180;
  const base = createPlaneTerrain({
    id: "base",
    pointOnPlaneM: { x: 0, y: 0, z: 0 },
    normal: { x: Math.sin(theta), y: 0, z: Math.cos(theta) },
    surface: "fairway-normal",
  });
  const square = (x0: number, y0: number, x1: number, y1: number) => [
    { x: x0, y: y0 },
    { x: x1, y: y0 },
    { x: x1, y: y1 },
    { x: x0, y: y1 },
  ];
  const course = createRegionTerrain({
    id: "hole-1",
    base,
    regions: [
      { polygon: square(100, -10, 130, 10), surface: "green" },
      { polygon: square(95, -15, 105, -5), surface: "bunker" },
      { polygon: square(200, -50, 260, 50), surface: "water" },
    ],
  });

  it("overrides surfaces inside polygons, later regions winning, geometry from base", () => {
    expect(course.sample(50, 0).surface.type).toBe("fairway-normal");
    expect(course.sample(120, 0).surface.type).toBe("green");
    expect(course.sample(102, -8).surface.type).toBe("bunker"); // overlap: bunker listed later
    expect(course.sample(97, -12).surface.type).toBe("bunker");
    expect(course.sample(230, 0).surface.type).toBe("water");
    expect(course.sample(230, 0).surface.terminal).toBe(true);
    for (const [x, y] of [
      [50, 0],
      [120, 0],
      [102, -8],
    ] as const) {
      expect(course.sample(x, y).heightM).toBe(base.sample(x, y).heightM);
      expect(course.sample(x, y).normal).toEqual(base.sample(x, y).normal);
    }
    expect(course.id).toBe("hole-1");
  });

  it("uses the even-odd rule (pentagram centre is outside, points are inside)", () => {
    const star = [0, 2, 4, 1, 3].map((i) => ({
      x: Math.cos(Math.PI / 2 + (2 * Math.PI * i) / 5),
      y: Math.sin(Math.PI / 2 + (2 * Math.PI * i) / 5),
    }));
    expect(pointInPolygon(0, 0, star)).toBe(false);
    expect(pointInPolygon(0, 0.8, star)).toBe(true);
    const t = createRegionTerrain({ id: "star", base, regions: [{ polygon: star, surface: "bunker" }] });
    expect(t.sample(0, 0).surface.type).toBe("fairway-normal");
    expect(t.sample(0, 0.8).surface.type).toBe("bunker");
  });

  it("handles large surveyed polygons (no argument-spread stack overflow)", () => {
    const count = 200_000;
    const circle = Array.from({ length: count }, (_, i) => ({
      x: 500 + 20 * Math.cos((2 * Math.PI * i) / count),
      y: 20 * Math.sin((2 * Math.PI * i) / count),
    }));
    const t = createRegionTerrain({ id: "survey", base, regions: [{ polygon: circle, surface: "green" }] });
    expect(t.sample(500, 0).surface.type).toBe("green");
    expect(t.sample(500, 19.9).surface.type).toBe("green");
    expect(t.sample(500, 20.1).surface.type).toBe("fairway-normal");
    expect(t.sample(479.9, 0).surface.type).toBe("fairway-normal");
  });

  it("rejects degenerate polygons", () => {
    expect(() =>
      createRegionTerrain({ id: "x", base, regions: [{ polygon: [{ x: 0, y: 0 }, { x: 1, y: 1 }], surface: "green" }] }),
    ).toThrow(/3 vertices/);
  });
});

describe("surfaceToLie", () => {
  it("maps every surface to its lie", () => {
    const expected: Record<SurfaceType, string> = {
      tee: "tee",
      "range-mat": "range",
      "fairway-firm": "fairway",
      "fairway-normal": "fairway",
      "fairway-soft": "fairway",
      "first-cut": "first-cut",
      rough: "rough",
      bunker: "bunker",
      green: "green",
      fringe: "fringe",
      "cart-path": "cart-path",
      water: "water",
      "out-of-bounds": "out-of-bounds",
      trees: "trees",
      "penalty-area": "penalty-area",
    };
    for (const type of SURFACE_TYPES) expect(surfaceToLie(type)).toBe(expected[type]);
  });
});
