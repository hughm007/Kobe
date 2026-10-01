import { LaunchStateSchema, MEASUREMENT_SOURCES, type MeasurementSource, ShotMetricsSchema } from "@glm/shared-types";
import { degToRad, IMPERIAL_GOLF_UNITS, METRIC_UNITS, mphToMps, yardsToMeters } from "@glm/units";
import { describe, expect, it } from "vitest";
import {
  type DisplayValue,
  METRIC_DEFINITIONS,
  type MetricId,
  presentCalculated,
  presentLaunchState,
  presentMeasurement,
  presentShotMetrics,
} from "../src/index";
import { calc, interval, makeLaunch, makeShotMetrics, meas, unavailable } from "./fixtures";

const I = IMPERIAL_GOLF_UNITS;
const EM_DASH = "—";

function expectUnavailable(dv: DisplayValue | undefined, secondaryBadges: readonly string[] = []): void {
  expect(dv).toBeDefined();
  const d = dv as DisplayValue;
  expect(d.text).toBe(EM_DASH);
  expect(d.text).not.toMatch(/\d/);
  expect(d.rangeText).toBeNull();
  expect(d.available).toBe(false);
  expect(d.badge).toBe("UNAVAILABLE");
  expect(d.secondaryBadges).toEqual(secondaryBadges);
  expect(d.confidence).toBe(0);
  expect(d.confidenceLabel).toBe("none");
}

describe("fixtures are valid contract objects", () => {
  it("LaunchState and ShotMetrics fixtures pass the shared-types schemas", () => {
    expect(LaunchStateSchema.safeParse(makeLaunch()).success).toBe(true);
    expect(ShotMetricsSchema.safeParse(makeShotMetrics()).success).toBe(true);
  });
});

describe("presentMeasurement: provenance travels from sensor value to display", () => {
  it("each source maps to its badge and is echoed verbatim in sourceDetail", () => {
    const expected: Record<Exclude<MeasurementSource, "unavailable">, string> = {
      "measured-camera": "MEASURED",
      "measured-radar": "MEASURED",
      "measured-hybrid": "MEASURED",
      "estimated-player-model": "ESTIMATED",
      "estimated-club-model": "ESTIMATED",
      "assumed-generic-fallback": "ASSUMED",
      manual: "MANUAL",
      synthetic: "SYNTHETIC",
    };
    for (const source of MEASUREMENT_SOURCES) {
      if (source === "unavailable") continue;
      const dv = presentMeasurement("totalSpin", meas(6430, "rpm", source, 0.6), I);
      expect(dv.badge, source).toBe(expected[source]);
      expect(dv.sourceDetail).toBe(source);
      expect(dv.secondaryBadges).toEqual([]);
      expect(dv.text).toBe("6,430 rpm");
      expect(dv.confidence).toBe(0.6);
      expect(dv.confidenceLabel).toBe("medium");
    }
  });

  it("synthetic and estimated values never show MEASURED", () => {
    expect(presentMeasurement("ballSpeed", meas(70.1, "m/s", "synthetic"), I).badge).toBe("SYNTHETIC");
    expect(presentMeasurement("totalSpin", meas(6430, "rpm", "estimated-club-model"), I).badge).toBe("ESTIMATED");
    expect(presentMeasurement("totalSpin", meas(6430, "rpm", "estimated-player-model"), I).badge).toBe("ESTIMATED");
    expect(presentMeasurement("totalSpin", meas(6430, "rpm", "estimated-club-model"), I).tooltip.status).toMatch(
      /^Estimated .*not measured$/,
    );
  });

  it("unavailable renders an em dash, never a number", () => {
    const dv = presentMeasurement("totalSpin", unavailable("rpm", ["spin-not-observed"]), I);
    expectUnavailable(dv);
    expect(dv.sourceDetail).toBe("unavailable");
    expect(dv.qualityFlags).toEqual(["spin-not-observed"]);
    expect(dv.tooltip.status).toMatch(/^Unavailable/);
  });

  it("LaunchState angle fields are DEGREES (16.2 -> '16.2°', not 928.2°)", () => {
    expect(presentMeasurement("verticalLaunch", meas(16.2, "deg"), I).text).toBe("16.2°");
    expect(presentMeasurement("verticalLaunch", meas(16.2, "deg"), I, "engineering").text).toBe("16.200°");
    expect(presentMeasurement("spinAxis", meas(3.4, "deg"), I).text).toBe("3.4° R");
    expect(presentMeasurement("spinAxis", meas(-3.4, "deg"), I).text).toBe("3.4° L");
  });

  it("horizontal launch is +left: -2.1 deg -> '2.1° R', +2.1 deg -> '2.1° L'", () => {
    expect(presentMeasurement("horizontalLaunch", meas(-2.1, "deg"), I).text).toBe("2.1° R");
    expect(presentMeasurement("horizontalLaunch", meas(2.1, "deg"), I).text).toBe("2.1° L");
    expect(presentMeasurement("horizontalLaunch", meas(0.04, "deg"), I).text).toBe("0.0°");
  });

  it("LaunchState spin is RPM (6430 -> '6,430 rpm', not 61,400 rpm) and speed is m/s", () => {
    expect(presentMeasurement("totalSpin", meas(6430, "rpm"), I).text).toBe("6,430 rpm");
    expect(presentMeasurement("totalSpin", meas(6430, "rpm"), I, "engineering").text).toBe("6430.0 rpm");
    expect(presentMeasurement("ballSpeed", meas(74.6559, "m/s"), I).text).toBe("167.0 mph");
    expect(presentMeasurement("ballSpeed", meas(70.1, "m/s"), METRIC_UNITS).text).toBe("252.4 km/h");
    expect(presentMeasurement("ballSpeed", meas(70.1, "m/s"), I, "engineering").text).toBe("70.100 m/s");
  });

  it("a different but compatible declared unit is converted explicitly; an incompatible one throws", () => {
    expect(presentMeasurement("verticalLaunch", meas(degToRad(16.2), "rad"), I).text).toBe("16.2°");
    expect(presentMeasurement("ballSpeed", meas(167, "mph"), I).text).toBe("167.0 mph");
    expect(presentMeasurement("closureRate", meas(degToRad(2450), "rad/s"), I).text).toBe("2,450 °/s");
    expect(() => presentMeasurement("verticalLaunch", meas(16.2, "m/s"), I)).toThrow(/not compatible/);
    expect(() => presentMeasurement("verticalLaunch", meas(16.2, "constructor"), I)).toThrow(/not compatible/);
    expect(() => presentMeasurement("totalSpin", meas(6430, "furlongs"), I)).toThrow(/not compatible/);
  });

  it("enforces Measurement invariants instead of rendering a contradiction", () => {
    const nullMeasured = { value: null, unit: "rpm", source: "measured-camera", confidence: 0.8, qualityFlags: [] } as const;
    expect(() => presentMeasurement("totalSpin", nullMeasured, I)).toThrow(/provenance invariant/);
    const valueUnavailable = { value: 2500, unit: "rpm", source: "unavailable", confidence: 0, qualityFlags: [] } as const;
    expect(() => presentMeasurement("totalSpin", valueUnavailable, I)).toThrow(/provenance invariant/);
    expect(() => presentMeasurement("totalSpin", meas(6430, "rpm", "measured-camera", 1.2), I)).toThrow(/confidence/);
    expect(() => presentMeasurement("totalSpin", { ...unavailable("rpm"), confidence: 0.3 }, I)).toThrow(/confidence 0/);
    expect(() => presentMeasurement("totalSpin", meas(Number.NaN, "rpm"), I)).toThrow(/finite/);
  });

  it("refuses calculated metrics (they have no LaunchState field)", () => {
    expect(() => presentMeasurement("carry", meas(150, "m"), I)).toThrow(/calculated metric/);
  });

  it("shows a range only when the measurement's 90 % interval is wide", () => {
    const wide = presentMeasurement(
      "totalSpin",
      meas(6430, "rpm", "estimated-club-model", 0.5, { uncertainty: { sigma: 400, unit: "rpm" } }),
      I,
    );
    // 6430 ± 1.645·400 = 5772.1 .. 7087.9 rpm
    expect(wide.rangeText).toBe("5,770–7,090 rpm");
    expect(wide.text).toBe("6,430 rpm");
    expect(wide.tooltip.confidence).toContain("5,770–7,090 rpm");

    const narrow = presentMeasurement("totalSpin", meas(6430, "rpm", "measured-camera", 0.9, { uncertainty: { sigma: 50, unit: "rpm" } }), I);
    expect(narrow.rangeText).toBeNull();
    expect(narrow.tooltip.confidence).toMatch(/^High \(0\.90\); 90% interval/);

    const stated = presentMeasurement(
      "horizontalLaunch",
      meas(-1.0, "deg", "measured-camera", 0.9, { uncertainty: { lower: -2.5, upper: 0.5, unit: "deg" } }),
      I,
    );
    expect(stated.rangeText).toBe("0.5° L–2.5° R");

    const radSigma = presentMeasurement(
      "verticalLaunch",
      meas(16.2, "deg", "measured-camera", 0.9, { uncertainty: { sigma: degToRad(1), unit: "rad" } }),
      I,
    );
    expect(radSigma.rangeText).toBe("14.6–17.8°");
  });

  it("an incompatible uncertainty unit drops the range with a flag but keeps the value", () => {
    const dv = presentMeasurement(
      "totalSpin",
      meas(6430, "rpm", "measured-camera", 0.9, { uncertainty: { sigma: 400, unit: "m" }, qualityFlags: ["glare"] }),
      I,
    );
    expect(dv.text).toBe("6,430 rpm");
    expect(dv.rangeText).toBeNull();
    expect(dv.qualityFlags[0]).toBe("glare");
    expect(dv.qualityFlags[1]).toMatch(/^presentation: uncertainty unit "m"/);
  });

  it("a normal-approximation range for spin or speed never shows a negative number", () => {
    // 2000 ± 1.645·1500 rpm would be -467..4467 rpm.
    const spin = presentMeasurement(
      "totalSpin",
      meas(2000, "rpm", "assumed-generic-fallback", 0.2, { uncertainty: { sigma: 1500, unit: "rpm" } }),
      I,
    );
    expect(spin.rangeText).toBe("0–4,470 rpm");
    expect(spin.qualityFlags.some((f) => f.startsWith("presentation: interval lower end below 0 clamped to 0"))).toBe(true);
    expect(spin.tooltip.confidence).toContain("normal approximation), lower end clamped at 0 0–4,470 rpm");
    const speed = presentMeasurement("ballSpeed", meas(3, "m/s", "estimated-club-model", 0.2, { uncertainty: { sigma: 3, unit: "m/s" } }), I);
    expect(speed.rangeText).toBe("0.0–17.7 mph");
    expect(speed.rangeText).not.toMatch(/-/);
    // Signed angles keep their negative end.
    const attack = presentMeasurement("attackAngle", meas(-1, "deg", "measured-radar", 0.9, { uncertainty: { sigma: 2, unit: "deg" } }), I);
    expect(attack.rangeText).toBe("-4.3–2.3°");
    expect(attack.qualityFlags).toEqual([]);
  });

  it("a stated interval that excludes the value is not shown", () => {
    const dv = presentMeasurement(
      "verticalLaunch",
      meas(5, "deg", "measured-camera", 0.9, { uncertainty: { lower: 8, upper: 12, unit: "deg" } }),
      I,
    );
    expect(dv.text).toBe("5.0°");
    expect(dv.rangeText).toBeNull();
    expect(dv.qualityFlags).toEqual(["presentation: value outside its stated uncertainty interval; range not shown"]);
    // A bound equal to the value (after a rad -> deg round trip) is still inside.
    const edge = presentMeasurement(
      "verticalLaunch",
      meas(16.2, "deg", "measured-camera", 0.9, { uncertainty: { lower: degToRad(16.2), upper: degToRad(18.2), unit: "rad" } }),
      I,
    );
    expect(edge.rangeText).toBe("16.2–18.2°");
    expect(edge.qualityFlags).toEqual([]);
  });

  it("tooltip confidence never contradicts the label (0.795 is 'Medium (0.79)', not 'Medium (0.80)')", () => {
    const tip = (c: number) => presentMeasurement("totalSpin", meas(6430, "rpm", "measured-camera", c), I).tooltip.confidence;
    expect(tip(0.795)).toBe("Medium (0.79)");
    expect(tip(0.7999)).toBe("Medium (0.79)");
    expect(tip(0.8)).toBe("High (0.80)");
    expect(tip(0.495)).toBe("Low (0.49)");
    expect(tip(0.5)).toBe("Medium (0.50)");
    expect(tip(0.004)).toBe("Low (<0.01)");
    expect(tip(0.005)).toBe("Low (0.01)");
    expect(tip(0.29)).toBe("Low (0.29)");
    expect(tip(1)).toBe("High (1.00)");
  });

  it("rejects an invalid precision even when the value is unavailable", () => {
    expect(() => presentMeasurement("clubSpeed", unavailable("m/s"), I, "bogus" as never)).toThrow(/unknown precision/);
    expect(() => presentCalculated("carry", calc(null, "m"), I, "bogus" as never)).toThrow(/unknown precision/);
    expect(() => presentLaunchState(makeLaunch({ totalSpinRpm: unavailable("rpm") }), I, "bogus" as never)).toThrow(
      /unknown precision/,
    );
  });

  it("refuses display-derived backspin / sidespin (they need both spin inputs: use presentLaunchState)", () => {
    expect(() => presentMeasurement("sidespin", meas(400, "rpm"), I)).toThrow(/display-derived metric/);
    expect(() => presentMeasurement("backspin", meas(6000, "rpm"), I)).toThrow(/display-derived metric/);
  });

  it("returns a deeply frozen value with a complete tooltip", () => {
    const dv = presentMeasurement("verticalLaunch", meas(16.2, "deg"), I);
    expect(Object.isFrozen(dv)).toBe(true);
    expect(Object.isFrozen(dv.tooltip)).toBe(true);
    expect(Object.isFrozen(dv.qualityFlags)).toBe(true);
    expect(dv.label).toBe(METRIC_DEFINITIONS.verticalLaunch.label);
    expect(dv.tooltip.definition).toBe(METRIC_DEFINITIONS.verticalLaunch.definition);
    expect(dv.tooltip.units).toBe("Shown in degrees; stored as deg in LaunchState.verticalLaunchAngleDeg; positive = upward");
    expect(dv.tooltip.dependencies).toEqual(["velocityMps"]);
    expect(dv.tooltip.limitations.length).toBeGreaterThan(0);
    expect(dv.tooltip.status).toBe("Measured by camera");
  });
});

describe("presentCalculated", () => {
  it("measured basis: CALCULATED, no secondary badges", () => {
    const dv = presentCalculated("carry", calc(152.705, "m"), I);
    expect(dv.text).toBe("167 yd");
    expect(dv.badge).toBe("CALCULATED");
    expect(dv.secondaryBadges).toEqual([]);
    expect(dv.available).toBe(true);
    expect(dv.tooltip.status).toBe("Calculated from measured inputs");
    expect(dv.sourceDetail).toBe(
      "calculated from: velocityMps (measured-camera), angularVelocityRadPerSec (measured-camera); model flight-test-1",
    );
  });

  it("carries ESTIMATED and SYNTHETIC from its basis and spells it out", () => {
    const dv = presentCalculated(
      "carry",
      calc(152.705, "m", {
        inputs: [
          { field: "velocityMps", source: "synthetic" },
          { field: "angularVelocityRadPerSec", source: "estimated-club-model" },
        ],
        dependsOnEstimated: true,
        dependsOnSynthetic: true,
      }),
      I,
    );
    expect(dv.badge).toBe("CALCULATED");
    expect(dv.secondaryBadges).toEqual(["ESTIMATED", "SYNTHETIC"]);
    expect(dv.sourceDetail.startsWith("calculated from: velocityMps (synthetic), angularVelocityRadPerSec (estimated-club-model)")).toBe(true);
    expect(dv.tooltip.status).toBe("Calculated; depends on synthetic launch velocity, estimated spin");
  });

  it('"Calculated; depends on estimated spin"', () => {
    const dv = presentCalculated(
      "total",
      calc(160.2, "m", {
        inputs: [
          { field: "velocityMps", source: "measured-radar" },
          { field: "angularVelocityRadPerSec", source: "estimated-player-model" },
        ],
        dependsOnEstimated: true,
      }),
      I,
    );
    expect(dv.secondaryBadges).toEqual(["ESTIMATED"]);
    expect(dv.tooltip.status).toBe("Calculated; depends on estimated spin");
  });

  it("assumed and manual inputs add their own badge beside ESTIMATED", () => {
    const assumed = presentCalculated(
      "carry",
      calc(150, "m", { inputs: [{ field: "angularVelocityRadPerSec", source: "assumed-generic-fallback" }], dependsOnEstimated: true }),
      I,
    );
    expect(assumed.secondaryBadges).toEqual(["ESTIMATED", "ASSUMED"]);
    expect(assumed.tooltip.status).toBe("Calculated; depends on assumed spin");
    const manual = presentCalculated(
      "carry",
      calc(150, "m", { inputs: [{ field: "velocityMps", source: "manual" }], dependsOnEstimated: true }),
      I,
    );
    expect(manual.secondaryBadges).toEqual(["ESTIMATED", "MANUAL"]);
  });

  it("never loses provenance when the summary flags contradict the input list", () => {
    const dv = presentCalculated(
      "carry",
      calc(150, "m", {
        inputs: [
          { field: "velocityMps", source: "synthetic" },
          { field: "angularVelocityRadPerSec", source: "estimated-club-model" },
        ],
        dependsOnEstimated: false,
        dependsOnSynthetic: false,
      }),
      I,
    );
    expect(dv.secondaryBadges).toEqual(["ESTIMATED", "SYNTHETIC"]);
    expect(dv.qualityFlags.filter((f) => f.startsWith("presentation: depends"))).toHaveLength(2);

    const flagOnly = presentCalculated("carry", calc(150, "m", { inputs: [], dependsOnSynthetic: true }), I);
    expect(flagOnly.secondaryBadges).toEqual(["SYNTHETIC"]);
    expect(flagOnly.tooltip.status).toBe("Calculated; depends on synthetic inputs");
  });

  it("null value renders an em dash and UNAVAILABLE, even with an interval, keeping its basis badges", () => {
    const dv = presentCalculated(
      "carry",
      calc(null, "m", { interval: interval(140, 150, 160, "m"), qualityFlags: ["no-ground-contact"], dependsOnEstimated: true }),
      I,
    );
    expectUnavailable(dv, ["ESTIMATED"]);
    expect(dv.tooltip.status).toBe("Not available; no-ground-contact (calculation depends on estimated inputs)");
    expect(dv.sourceDetail).toMatch(/^calculated from: /);

    const measured = presentCalculated("carry", calc(null, "m"), I);
    expectUnavailable(measured);
    expect(measured.tooltip.status).toBe("Not available; the model produced no value");

    const synthetic = presentCalculated(
      "carry",
      calc(null, "m", { inputs: [{ field: "velocityMps", source: "synthetic" }], dependsOnSynthetic: true }),
      I,
    );
    expectUnavailable(synthetic, ["SYNTHETIC"]);
    expect(synthetic.tooltip.status).toBe(
      "Not available; the model produced no value (calculation depends on synthetic launch velocity)",
    );
  });

  it("a magnitude's range never goes below 0: the lower end is clamped and flagged", () => {
    // Monte Carlo p05 below 0 for a non-negative distance (malformed upstream): clamp, flag.
    const roll = presentCalculated("rollDistance", calc(2.4, "m", { interval: interval(-1, 2.4, 6, "m") }), I);
    expect(roll.rangeText).toBe("0–7 yd");
    expect(roll.qualityFlags.some((f) => f.startsWith("presentation: interval lower end below 0 clamped to 0"))).toBe(true);
    expect(roll.tooltip.confidence).toContain("lower end clamped at 0) 0–7 yd");
    // Signed quantities are not clamped.
    const lateral = presentCalculated("carryLateral", calc(-1, "m", { interval: interval(-5, -1, 3, "m") }), I);
    expect(lateral.rangeText).toBe("3 yd L–5 yd R");
    expect(lateral.qualityFlags).toEqual([]);
    // Centre below 0 for a magnitude is contradictory: no range at all.
    const neg = presentCalculated("carry", calc(1, "m", { interval: interval(-9, -1, 4, "m") }), I);
    expect(neg.rangeText).toBeNull();
    expect(neg.qualityFlags.some((f) => f.startsWith("presentation: negative interval for a non-negative quantity"))).toBe(true);
  });

  it("presentCalculated with a dataOrigin: measured-* inputs on a synthetic / manual stream are relabelled", () => {
    const synthetic = presentCalculated("carry", calc(152.705, "m"), I, "golfer", "synthetic");
    expect(synthetic.badge).toBe("CALCULATED");
    expect(synthetic.secondaryBadges).toEqual(["SYNTHETIC"]);
    expect(synthetic.tooltip.status).toBe("Calculated; depends on synthetic launch velocity, synthetic spin");
    expect(synthetic.sourceDetail).toBe(
      "calculated from: velocityMps (measured-camera), angularVelocityRadPerSec (measured-camera); model flight-test-1; dataOrigin: synthetic",
    );
    expect(synthetic.qualityFlags.some((f) => f.includes('conflict with dataOrigin "synthetic"'))).toBe(true);

    const noInputs = presentCalculated("carry", calc(150, "m", { inputs: [] }), I, "golfer", "synthetic");
    expect(noInputs.secondaryBadges).toEqual(["SYNTHETIC"]);
    expect(noInputs.tooltip.status).toBe("Calculated; depends on synthetic inputs");

    const manual = presentCalculated("carry", calc(152.705, "m"), I, "golfer", "manual");
    expect(manual.secondaryBadges).toEqual(["ESTIMATED", "MANUAL"]);
    expect(manual.tooltip.status).toBe("Calculated; depends on manually entered launch velocity, manually entered spin");

    for (const origin of ["live", "replay", null] as const) {
      const dv = presentCalculated("carry", calc(152.705, "m"), I, "golfer", origin);
      expect(dv.secondaryBadges).toEqual([]);
      expect(dv.qualityFlags).toEqual([]);
      expect(dv.tooltip.status).toBe("Calculated from measured inputs");
    }
    // Honest synthetic labels raise no conflict flag.
    const honest = presentCalculated(
      "carry",
      calc(150, "m", { inputs: [{ field: "velocityMps", source: "synthetic" }], dependsOnSynthetic: true }),
      I,
      "golfer",
      "synthetic",
    );
    expect(honest.secondaryBadges).toEqual(["SYNTHETIC"]);
    expect(honest.qualityFlags).toEqual([]);
    expect(() => presentCalculated("carry", calc(150, "m"), I, "golfer", "simulated" as never)).toThrow(/unknown data origin/);
  });

  it("ranges only when wide: '163–171 yd' for an 8 yd carry interval", () => {
    const wide = presentCalculated(
      "carry",
      calc(152.705, "m", { interval: interval(yardsToMeters(163), 152.705, yardsToMeters(171), "m") }),
      I,
    );
    expect(wide.text).toBe("167 yd");
    expect(wide.rangeText).toBe("163–171 yd");
    expect(wide.tooltip.confidence).toContain("Monte Carlo, n=500");

    const narrow = presentCalculated("carry", calc(152.705, "m", { interval: interval(151.9, 152.705, 153.5, "m") }), I);
    expect(narrow.rangeText).toBeNull();
    expect(narrow.tooltip.confidence).toContain("166–168 yd");

    const engineering = presentCalculated(
      "carry",
      calc(152.705, "m", { interval: interval(yardsToMeters(163), 152.705, yardsToMeters(171), "m") }),
      I,
      "engineering",
    );
    expect(engineering.text).toBe("152.705 m");
    expect(engineering.rangeText).toBe("149.047–156.362 m");
  });

  it("relative 3 % rule triggers for short heights; identical ends collapse to no range", () => {
    // 1.0 m width > 3 % of 29.87 m (0.90 m) although < 3 yd
    const apex = presentCalculated("apexHeight", calc(29.87, "m", { interval: interval(29.4, 29.87, 30.4, "m") }), I);
    expect(apex.text).toBe("98 ft");
    expect(apex.rangeText).toBe("96–100 ft");
    // 0.1 m width > 3 % of 2 m, but both ends display "2 yd": no information in a range
    const bounce = presentCalculated("bounceDistance", calc(2.0, "m", { interval: interval(1.95, 2.0, 2.05, "m") }), I);
    expect(bounce.text).toBe("2 yd");
    expect(bounce.rangeText).toBeNull();
  });

  it("lateral ranges keep L / R per end", () => {
    const dv = presentCalculated(
      "carryLateral",
      calc(-1, "m", { interval: interval(yardsToMeters(-4), -1, yardsToMeters(2), "m") }),
      I,
    );
    expect(dv.text).toBe("1 yd R");
    expect(dv.rangeText).toBe("2 yd L–4 yd R");
  });

  it("converts a compatible interval unit, flags an incompatible one", () => {
    const yd = presentCalculated("carry", calc(152.705, "m", { interval: interval(163, 167, 171, "yd") }), I);
    expect(yd.rangeText).toBe("163–171 yd");
    const bad = presentCalculated("carry", calc(152.705, "m", { interval: interval(163, 167, 171, "mph") }), I);
    expect(bad.rangeText).toBeNull();
    expect(bad.qualityFlags.some((f) => f.startsWith('presentation: interval unit "mph"'))).toBe(true);
  });

  it("ShotMetrics angles are RADIANS (descentAngleRad 0.6458 -> '37.0°')", () => {
    expect(presentCalculated("descentAngle", calc(0.6458, "rad"), I).text).toBe("37.0°");
    expect(presentCalculated("descentAngle", calc(37.0016, "deg"), I).text).toBe("37.0°");
    expect(presentCalculated("landingDirection", calc(-0.035, "rad"), I).text).toBe("2.0° R");
    expect(presentCalculated("spinAtLanding", calc(560, "rad/s"), I).text).toBe("5,350 rpm");
  });

  it("rejects non-calculated metrics, bad confidence, non-finite values and non-calculated objects", () => {
    expect(() => presentCalculated("ballSpeed", calc(70, "m/s"), I)).toThrow(/launch metric/);
    expect(() => presentCalculated("carry", calc(150, "m", { confidence: 1.5 }), I)).toThrow(/confidence/);
    expect(() => presentCalculated("carry", calc(Number.NaN, "m"), I)).toThrow(/finite/);
    expect(() => presentCalculated("carry", { ...calc(150, "m"), kind: "measured" } as never, I)).toThrow(/not a CalculatedValue/);
    expect(() => presentCalculated("carry", calc(150, "rad"), I)).toThrow(/not compatible/);
  });
});

describe("presentLaunchState", () => {
  const LAUNCH_IDS: readonly MetricId[] = [
    "ballSpeed",
    "verticalLaunch",
    "horizontalLaunch",
    "totalSpin",
    "spinAxis",
    "clubSpeed",
    "smashFactor",
    "attackAngle",
    "clubPath",
    "faceToTarget",
    "faceToPath",
    "dynamicLoft",
    "dynamicLie",
    "closureRate",
    "lowPoint",
    "backspin",
    "sidespin",
  ];

  it("covers launch, display-derived spin components and every club-delivery field", () => {
    const out = presentLaunchState(makeLaunch(), I);
    expect(Object.keys(out).sort()).toEqual([...LAUNCH_IDS].sort());
    expect(out.ballSpeed?.text).toBe("156.8 mph");
    expect(out.verticalLaunch?.text).toBe("16.2°");
    expect(out.horizontalLaunch?.text).toBe("2.1° R");
    expect(out.totalSpin?.text).toBe("6,430 rpm");
    expect(out.spinAxis?.text).toBe("3.4° R");
    for (const id of ["clubSpeed", "smashFactor", "attackAngle", "closureRate", "lowPoint"] as const) {
      expectUnavailable(out[id]);
    }
    expect(Object.isFrozen(out)).toBe(true);
  });

  it("backspin = total·cos(tilt), sidespin = total·sin(tilt) with an L / R label", () => {
    const out = presentLaunchState(makeLaunch(), I);
    // 6430·cos 3.4° = 6418.7 rpm; 6430·sin 3.4° = 381.3 rpm, tilt +right
    expect(out.backspin?.text).toBe("6,420 rpm");
    expect(out.sidespin?.text).toBe("380 rpm R");
    expect(out.backspin?.badge).toBe("MEASURED");
    expect(METRIC_DEFINITIONS.backspin.category).toBe("display-derived");
    expect(out.sidespin?.sourceDetail).toBe("display-derived from: totalSpinRpm (measured-camera), spinAxisTiltDeg (measured-camera)");
    const left = presentLaunchState(makeLaunch({ spinAxisTiltDeg: meas(-3.4, "deg") }), I);
    expect(left.sidespin?.text).toBe("380 rpm L");
    const straight = presentLaunchState(makeLaunch({ spinAxisTiltDeg: meas(0, "deg") }), I);
    expect(straight.sidespin?.text).toBe("0 rpm");
    expect(straight.backspin?.text).toBe("6,430 rpm");
  });

  it("spin components take the worst input provenance and keep the other as a secondary badge", () => {
    const est = presentLaunchState(makeLaunch({ spinAxisTiltDeg: meas(3.4, "deg", "estimated-club-model", 0.4) }), I);
    expect(est.backspin?.badge).toBe("ESTIMATED");
    expect(est.backspin?.secondaryBadges).toEqual([]);
    expect(est.backspin?.confidence).toBe(0.4);
    expect(est.backspin?.confidenceLabel).toBe("low");
    expect(est.sidespin?.tooltip.status).toBe(
      "Derived for display from measured total spin and estimated spin-axis tilt; not an independent measurement",
    );
    const mixed = presentLaunchState(
      makeLaunch({
        totalSpinRpm: meas(6430, "rpm", "synthetic"),
        spinAxisTiltDeg: meas(3.4, "deg", "estimated-club-model"),
      }),
      I,
    );
    expect(mixed.sidespin?.badge).toBe("SYNTHETIC");
    expect(mixed.sidespin?.secondaryBadges).toEqual(["ESTIMATED"]);
  });

  it("spin components are unavailable when the tilt (or total) is unavailable", () => {
    const out = presentLaunchState(makeLaunch({ spinAxisTiltDeg: unavailable("deg") }), I);
    expectUnavailable(out.backspin);
    expectUnavailable(out.sidespin);
    expect(out.backspin?.tooltip.status).toBe(
      "Unavailable; requires both total spin and spin-axis tilt (spin-axis tilt unavailable)",
    );
    expect(out.totalSpin?.text).toBe("6,430 rpm");
    const noSpin = presentLaunchState(makeLaunch({ totalSpinRpm: unavailable("rpm"), spinAxisTiltDeg: unavailable("deg") }), I);
    expect(noSpin.backspin?.tooltip.status).toContain("total spin and spin-axis tilt unavailable");
  });

  it("an all-unavailable launch never renders a number", () => {
    const out = presentLaunchState(
      makeLaunch({
        ballSpeedMps: unavailable("m/s"),
        verticalLaunchAngleDeg: unavailable("deg"),
        horizontalLaunchAngleDeg: unavailable("deg"),
        totalSpinRpm: unavailable("rpm"),
        spinAxisTiltDeg: unavailable("deg"),
      }),
      I,
    );
    for (const id of LAUNCH_IDS) expectUnavailable(out[id]);
  });

  it("formats club-delivery fields from their stored units", () => {
    const out = presentLaunchState(
      makeLaunch({
        clubSpeedMps: meas(mphToMps(105), "m/s", "measured-radar"),
        smashFactor: meas(1.475, "", "measured-radar"),
        attackAngleDeg: meas(-3.24, "deg", "measured-radar"),
        clubPathDeg: meas(2, "deg", "measured-radar"),
        faceToTargetDeg: meas(0, "deg", "measured-radar"),
        faceToPathDeg: meas(-1.5, "deg", "measured-radar"),
        dynamicLoftDeg: meas(20.1, "deg", "measured-radar"),
        dynamicLieDeg: meas(1.2, "deg", "measured-radar"),
        closureRateDegPerSec: meas(2450, "deg/s", "measured-radar"),
        lowPointM: meas(0.0254, "m", "measured-radar"),
      }),
      I,
    );
    expect(out.clubSpeed?.text).toBe("105.0 mph");
    expect(out.smashFactor?.text).toBe("1.48");
    expect(out.attackAngle?.text).toBe("-3.2°");
    expect(out.clubPath?.text).toBe("2.0° L");
    expect(out.faceToTarget?.text).toBe("0.0°");
    expect(out.faceToPath?.text).toBe("1.5° R");
    expect(out.dynamicLoft?.text).toBe("20.1°");
    expect(out.dynamicLie?.text).toBe("1.2°");
    expect(out.closureRate?.text).toBe("2,450 °/s");
    expect(out.lowPoint?.text).toBe("1.0 in");
    expect(out.clubSpeed?.badge).toBe("MEASURED");
  });

  it("measured-* labels on a synthetic or manual data stream are downgraded, never shown as MEASURED", () => {
    const synthetic = presentLaunchState(makeLaunch({ dataOrigin: "synthetic" }), I);
    for (const dv of Object.values(synthetic)) expect(dv?.badge).not.toBe("MEASURED");
    expect(synthetic.ballSpeed?.badge).toBe("SYNTHETIC");
    expect(synthetic.ballSpeed?.sourceDetail).toBe("measured-camera (dataOrigin: synthetic)");
    expect(synthetic.ballSpeed?.qualityFlags.some((f) => f.includes('conflicts with dataOrigin "synthetic"'))).toBe(true);
    expect(synthetic.backspin?.badge).toBe("SYNTHETIC");

    const manual = presentLaunchState(makeLaunch({ dataOrigin: "manual" }), I);
    expect(manual.verticalLaunch?.badge).toBe("MANUAL");

    const replay = presentLaunchState(makeLaunch({ dataOrigin: "replay" }), I);
    expect(replay.verticalLaunch?.badge).toBe("MEASURED");

    const honest = presentLaunchState(
      makeLaunch({ dataOrigin: "synthetic", ballSpeedMps: meas(70.1, "m/s", "synthetic") }),
      I,
    );
    expect(honest.ballSpeed?.badge).toBe("SYNTHETIC");
    expect(honest.ballSpeed?.qualityFlags).toEqual([]);
  });

  it("every value of a provisional or invalid shot carries a validity flag", () => {
    const invalid = presentLaunchState(makeLaunch({ validity: "invalid", rejectionReasons: ["Ball left the field of view"] }), I);
    for (const id of LAUNCH_IDS) {
      expect(invalid[id]?.qualityFlags, id).toContain("presentation: launch invalid (shot rejected); see validityBanner");
    }
    const provisional = presentLaunchState(makeLaunch({ validity: "provisional", warnings: ["Only 4 frames tracked"] }), I);
    expect(provisional.ballSpeed?.qualityFlags).toEqual(["presentation: launch provisional; see validityBanner"]);
    expect(provisional.sidespin?.qualityFlags).toEqual(["presentation: launch provisional; see validityBanner"]);
    const valid = presentLaunchState(makeLaunch(), I);
    for (const id of LAUNCH_IDS) expect(valid[id]?.qualityFlags, id).toEqual([]);
    expect(() => presentLaunchState(makeLaunch({ validity: "constructor" as never }), I)).toThrow(/unknown validity/);
  });

  it("engineering precision", () => {
    const out = presentLaunchState(makeLaunch(), I, "engineering");
    expect(out.verticalLaunch?.text).toBe("16.200°");
    expect(out.ballSpeed?.text).toBe("70.100 m/s");
    expect(out.totalSpin?.text).toBe("6430.0 rpm");
  });
});

describe("presentShotMetrics", () => {
  it("presents every ShotMetrics field with SI-aware formatting", () => {
    const out = presentShotMetrics(makeShotMetrics(), I);
    expect(Object.keys(out)).toHaveLength(14);
    expect(out.carry?.text).toBe("167 yd");
    expect(out.carryLateral?.text).toBe("3 yd R");
    expect(out.total?.text).toBe("175 yd");
    expect(out.totalLateral?.text).toBe("4 yd R");
    expect(out.bounceDistance?.text).toBe("6 yd");
    expect(out.rollDistance?.text).toBe("3 yd");
    expect(out.apexHeight?.text).toBe("98 ft");
    expect(out.apexDistance?.text).toBe("97 yd");
    expect(out.flightTime?.text).toBe("6.3 s");
    expect(out.descentAngle?.text).toBe("37.0°");
    expect(out.landingSpeed?.text).toBe("50.1 mph");
    expect(out.landingDirection?.text).toBe("2.0° R");
    expect(out.curve?.text).toBe("2 yd R");
    expect(out.spinAtLanding?.text).toBe("5,350 rpm");
    for (const dv of Object.values(out)) {
      expect(dv?.badge).toBe("CALCULATED");
      expect(dv?.secondaryBadges).toEqual([]);
    }
  });

  it("metric units", () => {
    const out = presentShotMetrics(makeShotMetrics(), METRIC_UNITS);
    expect(out.carry?.text).toBe("153 m");
    expect(out.apexHeight?.text).toBe("29.9 m");
    expect(out.landingSpeed?.text).toBe("80.6 km/h");
  });

  it("an unavailable calculated metric renders an em dash", () => {
    const out = presentShotMetrics(makeShotMetrics({ rollDistanceM: calc(null, "m") }), I);
    expectUnavailable(out.rollDistance);
    expect(out.carry?.available).toBe(true);
  });

  it("passes the data origin through: a synthetic stream never shows a plain CALCULATED", () => {
    const out = presentShotMetrics(makeShotMetrics({ rollDistanceM: calc(null, "m") }), I, "golfer", "synthetic");
    for (const dv of Object.values(out)) expect(dv?.secondaryBadges).toContain("SYNTHETIC");
    expect(out.carry?.badge).toBe("CALCULATED");
    expectUnavailable(out.rollDistance, ["SYNTHETIC"]);
  });
});
