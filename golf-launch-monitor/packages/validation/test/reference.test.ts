import { describe, expect, it } from "vitest";
import {
  compareToReference,
  normalizeReference,
  REFERENCE_METRIC_DEFINITIONS,
  type ReferenceMeasurement,
} from "../src/index";

const D = (m: keyof typeof REFERENCE_METRIC_DEFINITIONS) => REFERENCE_METRIC_DEFINITIONS[m].definitionId;
const DEG = Math.PI / 180;

function makeRef(overrides: Partial<ReferenceMeasurement> = {}): ReferenceMeasurement {
  return {
    referenceId: "ref-1",
    shotId: "shot-1",
    device: { make: "Example", model: "LM-1", firmware: null },
    metrics: {
      ballSpeed: { value: 150, unit: "mph", definition: D("ballSpeed") },
      verticalLaunch: { value: 12, unit: "deg", definition: D("verticalLaunch") },
      horizontalLaunch: { value: 2, unit: "deg", definition: D("horizontalLaunch") },
      totalSpin: { value: 3000, unit: "rpm", definition: D("totalSpin") },
      spinAxis: { value: -4, unit: "deg", definition: D("spinAxis") },
      carry: { value: 250, unit: "yd", definition: D("carry") },
      carryLateral: { value: 5, unit: "yd", definition: D("carryLateral") },
      total: { value: 270, unit: "yd", definition: D("total") },
      apexHeight: { value: 90, unit: "ft", definition: D("apexHeight") },
      descentAngle: { value: 40, unit: "deg", definition: D("descentAngle") },
    },
    conventions: {
      horizontalAngleSign: "right-positive",
      spinAxisSign: "left-positive",
      lateralSign: "right-positive",
      carryDefinition: "first-ground-contact",
      ballSpeedReference: "ball-center",
    },
    notes: "",
    ...overrides,
  };
}

describe("normalizeReference", () => {
  it("converts to SI with exact factors and flips signs into our conventions", () => {
    const n = normalizeReference(makeRef());
    expect(n.incompatible).toEqual([]);
    expect(n.values.ballSpeed).toBeCloseTo(150 * 0.44704, 12); // 67.056 m/s
    expect(n.values.verticalLaunch).toBeCloseTo(12 * DEG, 14);
    // 2 deg RIGHT (right-positive) is -2 deg in our left-positive convention.
    expect(n.values.horizontalLaunch).toBeCloseTo(-2 * DEG, 14);
    expect(n.values.totalSpin).toBeCloseTo((3000 * 2 * Math.PI) / 60, 10); // 314.159 rad/s
    // -4 in a left-positive axis convention is a 4 deg axis tilted to curve RIGHT: +4 for us.
    expect(n.values.spinAxis).toBeCloseTo(4 * DEG, 14);
    expect(n.values.carry).toBeCloseTo(228.6, 10);
    expect(n.values.carryLateral).toBeCloseTo(-4.572, 10);
    expect(n.values.total).toBeCloseTo(246.888, 10);
    expect(n.values.apexHeight).toBeCloseTo(27.432, 10);
    expect(n.values.descentAngle).toBeCloseTo(40 * DEG, 14);
  });

  it("records every unit conversion and every sign flip", () => {
    const n = normalizeReference(makeRef());
    const flips = n.conversionsApplied.filter((c) => c.includes("sign flipped"));
    expect(flips).toEqual([
      "horizontalLaunch: sign flipped (reference right-positive -> ours left-positive)",
      "spinAxis: sign flipped (reference left-positive -> ours positive = curves right)",
      "carryLateral: sign flipped (reference right-positive -> ours left-positive)",
    ]);
    expect(n.conversionsApplied).toContain("ballSpeed: 150 mph -> 67.056 m/s");
    expect(n.conversionsApplied.filter((c) => !c.includes("sign flipped"))).toHaveLength(10);
  });

  it("applies no flips and no conversions when the reference already matches us", () => {
    const n = normalizeReference(
      makeRef({
        metrics: {
          horizontalLaunch: { value: 0.01, unit: "rad", definition: D("horizontalLaunch") },
          spinAxis: { value: 0.05, unit: "rad", definition: D("spinAxis") },
          carryLateral: { value: -3, unit: "m", definition: D("carryLateral") },
        },
        conventions: {
          horizontalAngleSign: "left-positive",
          spinAxisSign: "right-positive",
          lateralSign: "left-positive",
          carryDefinition: "first-ground-contact",
          ballSpeedReference: "ball-center",
        },
      }),
    );
    expect(n.conversionsApplied).toEqual([]);
    expect(n.values).toEqual({ horizontalLaunch: 0.01, spinAxis: 0.05, carryLateral: -3 });
  });

  it("marks unknown units, wrong dimensions and foreign definitions incompatible", () => {
    const n = normalizeReference(
      makeRef({
        metrics: {
          carry: { value: 250, unit: "furlongs", definition: D("carry") },
          ballSpeed: { value: 70, unit: "m", definition: D("ballSpeed") },
          apexHeight: { value: 30, unit: "m", definition: "apex-height-above-ground" },
          total: { value: 250, unit: "m", definition: D("total") },
        },
      }),
    );
    expect(n.values).toEqual({ total: 250 });
    expect(n.incompatible.map((i) => i.metric)).toEqual(["ballSpeed", "carry", "apexHeight"]);
    expect(n.incompatible[0]?.reason).toMatch(/unit "m" is a length, but ballSpeed is a speed/);
    expect(n.incompatible[1]?.reason).toMatch(/unknown unit "furlongs"/);
    expect(n.incompatible[2]?.reason).toMatch(/definition "apex-height-above-ground" differs.*no documented conversion/);
  });

  it("treats Object.prototype names as unknown units, not as units of an undefined dimension", () => {
    const n = normalizeReference(
      makeRef({
        metrics: {
          carry: { value: 250, unit: "constructor", definition: D("carry") },
          total: { value: 250, unit: "toString", definition: D("total") },
          apexHeight: { value: 30, unit: "__proto__", definition: D("apexHeight") },
        },
      }),
    );
    expect(n.values).toEqual({});
    expect(n.incompatible).toEqual([
      { metric: "carry", reason: 'unknown unit "constructor"' },
      { metric: "total", reason: 'unknown unit "toString"' },
      { metric: "apexHeight", reason: 'unknown unit "__proto__"' },
    ]);
  });

  it("refuses landing-at-launch-height carry (and other landing metrics) against our first-contact definition", () => {
    const n = normalizeReference(
      makeRef({
        conventions: {
          horizontalAngleSign: "right-positive",
          spinAxisSign: "right-positive",
          lateralSign: "right-positive",
          carryDefinition: "landing-at-launch-height",
          ballSpeedReference: "ball-center",
        },
      }),
    );
    expect(n.incompatible.map((i) => i.metric)).toEqual(["carry", "carryLateral", "descentAngle"]);
    for (const i of n.incompatible) expect(i.reason).toMatch(/only when our shot landed at launch height/);
    expect(n.values.carry).toBeUndefined();
    expect(n.values.total).toBeCloseTo(246.888, 10); // total is unaffected by the landing definition
  });

  it("refuses unknown carry definitions and unknown ball-speed reference points", () => {
    const n = normalizeReference(
      makeRef({
        conventions: {
          horizontalAngleSign: "right-positive",
          spinAxisSign: "right-positive",
          lateralSign: "right-positive",
          carryDefinition: "unknown",
          ballSpeedReference: "unknown",
        },
      }),
    );
    expect(n.incompatible.map((i) => i.metric)).toEqual(["ballSpeed", "carry", "carryLateral", "descentAngle"]);
    expect(n.incompatible[0]?.reason).toMatch(/ball-speed measurement point is unknown/);
    expect(n.incompatible[1]?.reason).toMatch(/landing \(carry\) definition is unknown/);
  });

  it("reports metrics we cannot compare and rejects malformed records", () => {
    const n = normalizeReference(makeRef({ metrics: { smashFactor: { value: 1.48, unit: "m", definition: "x" } } }));
    expect(n.incompatible).toEqual([
      { metric: "smashFactor", reason: expect.stringMatching(/not a comparable metric/) as unknown as string },
    ]);
    expect(() => normalizeReference({ ...makeRef(), shotId: "" })).toThrow(/invalid reference measurement at shotId/);
    expect(() =>
      normalizeReference(makeRef({ metrics: { carry: { value: Number.NaN, unit: "m", definition: D("carry") } } })),
    ).toThrow(/metrics\.carry\.value/);
  });
});

describe("compareToReference", () => {
  it("computes ours - reference only for compatible metrics with values on both sides", () => {
    const normalized = normalizeReference(
      makeRef({
        metrics: {
          ballSpeed: { value: 150, unit: "mph", definition: D("ballSpeed") },
          carry: { value: 250, unit: "yd", definition: D("carry") },
          total: { value: 270, unit: "yd", definition: D("total") },
          apexHeight: { value: 30, unit: "m", definition: "apex-height-above-ground" },
          clubSpeed: { value: 100, unit: "mph", definition: "club-speed" },
        },
      }),
    );
    const rows = compareToReference({ ballSpeed: 66, carry: null, apexHeight: 29, totalSpin: 300 }, normalized);
    expect(rows.map((r) => r.metric)).toEqual(["ballSpeed", "totalSpin", "carry", "total", "apexHeight", "clubSpeed"]);
    const by = Object.fromEntries(rows.map((r) => [r.metric, r]));
    expect(by.ballSpeed?.error).toBeCloseTo(66 - 67.056, 10);
    expect(by.ballSpeed?.note).toBe("ours - reference, m/s");
    expect(by.totalSpin).toMatchObject({ ours: 300, reference: null, error: null, note: "not compared: no reference value" });
    expect(by.carry).toMatchObject({ ours: null, error: null, note: "not compared: no value from our system" });
    expect(by.carry?.reference).toBeCloseTo(228.6, 10);
    expect(by.total).toMatchObject({ ours: null, error: null });
    expect(by.apexHeight).toMatchObject({ ours: 29, reference: null, error: null });
    expect(by.apexHeight?.note).toMatch(/^not compared: reference incompatible — definition/);
    expect(by.clubSpeed?.note).toMatch(/not a comparable metric/);
  });

  it("compares in our sign convention (a right-positive reference is flipped first)", () => {
    const normalized = normalizeReference(
      makeRef({ metrics: { carryLateral: { value: 3, unit: "m", definition: D("carryLateral") } } }),
    );
    // Reference says 3 m RIGHT; we measured 2.5 m right = -2.5 (left-positive): error +0.5 m (we are 0.5 m further left).
    const [row] = compareToReference({ carryLateral: -2.5 }, normalized);
    expect(row).toEqual({
      metric: "carryLateral",
      ours: -2.5,
      reference: -3,
      error: 0.5,
      note: "ours - reference, m",
    });
  });
});
