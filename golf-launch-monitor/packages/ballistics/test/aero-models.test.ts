import { BallAerodynamicsProfileSchema } from "@glm/shared-types";
import type { BallAerodynamicsProfile } from "@glm/shared-types";
import { describe, expect, it } from "vitest";
import {
  BALL_PROFILES,
  computeAcceleration,
  DEFAULT_BALL_PROFILE_ID,
  DEFAULT_INDOOR_ENVIRONMENT,
  getBallProfile,
  getDragModel,
  getLiftModel,
  getSpinDecayModel,
  resolveProfileModels,
} from "../src/index";
import type { AeroState } from "../src/index";

const baseline = getBallProfile(DEFAULT_BALL_PROFILE_ID);
const drag = getDragModel("drag-re-spin-v0");
const lift = getLiftModel("lift-spin-power-v0");
const state = (reynolds: number, spinParameter: number): AeroState => ({ speedMps: 50, reynolds, spinParameter });

describe("model registry", () => {
  it("throws a clear error on unknown ids, listing registered ids", () => {
    expect(() => getDragModel("drag-magic")).toThrow(/Unknown drag model id "drag-magic".*drag-re-spin-v0/);
    expect(() => getLiftModel("lift-magic")).toThrow(/Unknown lift model id "lift-magic".*lift-spin-power-v0/);
    expect(() => getSpinDecayModel("decay-magic")).toThrow(
      /Unknown spin-decay model id "decay-magic".*spin-decay-moment-v0, spin-decay-exponential-v0/,
    );
  });

  it("throws if a profile lacks a required parameter", () => {
    const { reWidth: _omit, ...partial } = baseline.dragModelParams;
    const broken: BallAerodynamicsProfile = { ...baseline, dragModelParams: partial };
    expect(() => resolveProfileModels(broken)).toThrow(/drag-re-spin-v0" requires parameter\(s\) reWidth/);
    expect(() => computeAcceleration({ x: 50, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, DEFAULT_INDOOR_ENVIRONMENT, broken)).toThrow(
      /reWidth/,
    );
    const noTau: BallAerodynamicsProfile = { ...baseline, spinDecayModelId: "spin-decay-exponential-v0" };
    expect(() => resolveProfileModels(noTau)).toThrow(/requires parameter\(s\) tauS/);
  });

  it("throws on an unknown model id inside a profile and on invalid parameter values", () => {
    expect(() => resolveProfileModels({ ...baseline, liftModelId: "nope" })).toThrow(/Unknown lift model id "nope"/);
    expect(() => resolveProfileModels({ ...baseline, dragModelParams: { ...baseline.dragModelParams, reWidth: 0 } })).toThrow(
      /reWidth must be > 0/,
    );
    expect(() =>
      resolveProfileModels({ ...baseline, liftModelParams: { ...baseline.liftModelParams, clExponent: Number.NaN } }),
    ).toThrow(/clExponent must be a finite number/);
  });
});

describe("drag-re-spin-v0", () => {
  const p = baseline.dragModelParams;

  it("rises below the dimpled-ball critical Reynolds number", () => {
    const sub = drag.evaluate(state(4e4, 0), p);
    const sup = drag.evaluate(state(1.5e5, 0), p);
    expect(sub).toBeGreaterThan(sup + 0.2);
    // Far above the crisis, C_D is the supercritical value (Re-independent).
    expect(drag.evaluate(state(2e5, 0), p)).toBeCloseTo(p["cdSupercritical"] as number, 5);
    // Monotone decreasing through the crisis.
    const res = [3e4, 5e4, 6.5e4, 8e4, 1e5, 1.5e5];
    const cds = res.map((re) => drag.evaluate(state(re, 0), p));
    for (let i = 1; i < cds.length; i++) expect(cds[i]).toBeLessThan(cds[i - 1] as number);
    // At reCritical the crisis term is exactly half the rise.
    expect(drag.evaluate(state(p["reCritical"] as number, 0), p)).toBeCloseTo(
      (p["cdSupercritical"] as number) + 0.5 * (p["cdCrisisRise"] as number),
      12,
    );
  });

  it("grows linearly with spin parameter", () => {
    const c0 = drag.evaluate(state(1.5e5, 0), p);
    const c3 = drag.evaluate(state(1.5e5, 0.3), p);
    expect(c3 - c0).toBeCloseTo(0.3 * (p["cdSpinSlope"] as number), 12);
  });

  it("never returns NaN for extreme Reynolds numbers", () => {
    expect(Number.isFinite(drag.evaluate(state(1e300, 0), p))).toBe(true);
    expect(Number.isFinite(drag.evaluate(state(0, 0), p))).toBe(true);
  });
});

describe("lift-spin-power-v0", () => {
  const p = baseline.liftModelParams;

  it("increases with spin parameter and is capped at clMax", () => {
    const values = [0.02, 0.05, 0.1, 0.2, 0.3].map((s) => lift.evaluate(state(1.5e5, s), p));
    for (let i = 1; i < values.length; i++) expect(values[i]).toBeGreaterThan(values[i - 1] as number);
    expect(lift.evaluate(state(1.5e5, 0.1), p)).toBeCloseTo((p["clCoefficient"] as number) * Math.pow(0.1, p["clExponent"] as number), 12);
    expect(lift.evaluate(state(1.5e5, 1.0), p)).toBe(p["clMax"]);
    expect(lift.evaluate(state(1.5e5, 5.0), p)).toBe(p["clMax"]);
  });

  it("is zero without spin and never negative (no reverse-Magnus regime in v0)", () => {
    expect(lift.evaluate(state(1.5e5, 0), p)).toBe(0);
    expect(lift.evaluate(state(1.5e5, -0.1), p)).toBe(0);
    expect(lift.evaluate(state(5.5e4, 0.05), p)).toBeGreaterThan(0);
  });
});

describe("spin-decay models", () => {
  const moment = getSpinDecayModel("spin-decay-moment-v0");
  const rho = DEFAULT_INDOOR_ENVIRONMENT.airDensityKgM3;

  it("moment model: domega/dt = -rho*A*cm*r^2*omega*v/I with tau ∝ 1/v", () => {
    const omega = 300;
    const v = 44.704; // 100 mph
    const rate = moment.angularDeceleration({ speedMps: v, angularSpeedRadPerSec: omega, airDensityKgM3: rho }, baseline);
    const r = baseline.diameterM / 2;
    const expected = -(rho * baseline.crossSectionAreaM2 * 0.012 * r * r * omega * v) / baseline.momentOfInertiaKgM2;
    expect(rate).toBeCloseTo(expected, 12);
    const tau = -omega / rate;
    // Literature (secondary): ~18.9 s (Tavares et al.) to ~23.8 s (Smits & Smith) at 100 mph.
    expect(tau).toBeGreaterThan(17);
    expect(tau).toBeLessThan(24);
    const fast = moment.angularDeceleration({ speedMps: 2 * v, angularSpeedRadPerSec: omega, airDensityKgM3: rho }, baseline);
    expect(fast / rate).toBeCloseTo(2, 12);
    expect(moment.angularDeceleration({ speedMps: 0, angularSpeedRadPerSec: omega, airDensityKgM3: rho }, baseline)).toBe(0);
  });

  it("exponential model: domega/dt = -omega/tauS", () => {
    const expo = getSpinDecayModel("spin-decay-exponential-v0");
    const profile: BallAerodynamicsProfile = {
      ...baseline,
      spinDecayModelId: expo.id,
      spinDecayModelParams: { tauS: 20 },
    };
    expect(expo.angularDeceleration({ speedMps: 60, angularSpeedRadPerSec: 400, airDensityKgM3: rho }, profile)).toBe(-20);
    expect(expo.angularDeceleration({ speedMps: 60, angularSpeedRadPerSec: 0, airDensityKgM3: rho }, profile)).toBe(0);
  });
});

describe("shipped ball profiles", () => {
  it("ships exactly the four documented profiles, all source 'default' and schema-valid", () => {
    expect(BALL_PROFILES.map((p) => p.id)).toEqual([
      "premium-urethane-baseline",
      "two-piece-distance-baseline",
      "range-ball-practice",
      "generic-fallback",
    ]);
    for (const p of BALL_PROFILES) {
      expect(p.source).toBe("default");
      expect(BallAerodynamicsProfileSchema.safeParse(p).success).toBe(true);
      expect(() => resolveProfileModels(p)).not.toThrow();
      expect(p.massKg).toBe(0.04593);
      expect(p.diameterM).toBe(0.04267);
      expect(p.crossSectionAreaM2).toBeCloseTo((Math.PI * 0.04267 ** 2) / 4, 15);
      expect(p.momentOfInertiaKgM2).toBeCloseTo(0.4 * 0.04593 * (0.04267 / 2) ** 2, 15);
      expect(p.limitations.some((l) => /NOT fit to measured/.test(l))).toBe(true);
      expect(p.limitations.some((l) => /Reverse Magnus/.test(l))).toBe(true);
      expect(p.limitations.some((l) => /4e4 < Re < 2.5e5/.test(l))).toBe(true);
      expect(p.warnings.length).toBeGreaterThan(0);
      expect(Object.isFrozen(p)).toBe(true);
      expect(Object.isFrozen(p.dragModelParams)).toBe(true);
    }
  });

  it("profiles 2-4 share the baseline aerodynamics and say so", () => {
    for (const p of BALL_PROFILES.slice(1)) {
      expect(p.dragModelParams).toEqual(baseline.dragModelParams);
      expect(p.liftModelParams).toEqual(baseline.liftModelParams);
      expect(p.spinDecayModelParams).toEqual(baseline.spinDecayModelParams);
      expect(p.limitations.some((l) => /EXACTLY the same aerodynamic parameters as premium-urethane-baseline/.test(l))).toBe(true);
      expect(p.confidenceCeiling).toBeLessThan(baseline.confidenceCeiling);
    }
  });

  it("range and fallback profiles carry low confidence ceilings and prominent warnings", () => {
    const range = getBallProfile("range-ball-practice");
    expect(range.confidenceCeiling).toBeLessThanOrEqual(0.5);
    expect(range.warnings[0]).toMatch(/vary widely/);
    expect(getBallProfile("generic-fallback").confidenceCeiling).toBeLessThanOrEqual(0.4);
  });

  it("getBallProfile throws on unknown ids", () => {
    expect(() => getBallProfile("pro-v-9000")).toThrow(/Unknown ball profile id "pro-v-9000".*premium-urethane-baseline/);
  });
});
