import { describe, expect, it } from "vitest";
import {
  degToRad,
  feetToMeters,
  formatAngle,
  formatAngularRate,
  formatDistance,
  formatDuration,
  formatHeight,
  formatHorizontalAngle,
  formatLateral,
  formatPressure,
  formatRange,
  formatRatio,
  formatShortLength,
  formatSidespin,
  formatSpeed,
  formatSpinAxis,
  formatSpinRate,
  formatTemperature,
  IMPERIAL_GOLF_UNITS,
  inchesToMeters,
  METERS_PER_YARD,
  METRIC_UNITS,
  mphToMps,
  RANGE_THRESHOLD_ANGLE_RAD,
  RANGE_THRESHOLD_DISTANCE_M,
  RANGE_THRESHOLD_DISTANCE_RELATIVE,
  RANGE_THRESHOLD_DISTANCE_YD,
  RANGE_THRESHOLD_DURATION_S,
  RANGE_THRESHOLD_LATERAL_M,
  RANGE_THRESHOLD_SPEED_MPS,
  RANGE_THRESHOLD_SPIN_RAD_PER_SEC,
  roundHalfAwayFromZero,
  rpmToRadPerSec,
  shouldShowRange,
  UNAVAILABLE_TEXT,
  type Precision,
  RANGE_THRESHOLD_RELATIVE_TOLERANCE,
  type UnitSystem,
  yardsToMeters,
} from "../src/index";

const I = IMPERIAL_GOLF_UNITS;
const M = METRIC_UNITS;
const EM_DASH = "—";
const EN_DASH = "–";

describe("roundHalfAwayFromZero", () => {
  it("rounds ties away from zero symmetrically (Math.round(-2.5) would give -2)", () => {
    expect(roundHalfAwayFromZero(2.5, 0)).toBe(3);
    expect(roundHalfAwayFromZero(-2.5, 0)).toBe(-3);
    expect(roundHalfAwayFromZero(0.5, 0)).toBe(1);
    expect(roundHalfAwayFromZero(-0.5, 0)).toBe(-1);
    expect(roundHalfAwayFromZero(2.4999, 0)).toBe(2);
    expect(roundHalfAwayFromZero(-2.4999, 0)).toBe(-2);
  });

  it("rounds the decimal a human reads, not its binary approximation", () => {
    // toFixed gets all of these wrong because the doubles sit just below the tie.
    expect((1.005).toFixed(2)).toBe("1.00");
    expect(roundHalfAwayFromZero(1.005, 2)).toBe(1.01);
    expect((2.675).toFixed(2)).toBe("2.67");
    expect(roundHalfAwayFromZero(2.675, 2)).toBe(2.68);
    expect((1.45).toFixed(1)).toBe("1.4");
    expect(roundHalfAwayFromZero(1.45, 1)).toBe(1.5);
    expect(roundHalfAwayFromZero(-1.005, 2)).toBe(-1.01);
  });

  it("absorbs unit-conversion noise at ties (6435 rpm -> rad/s -> rpm)", () => {
    const noisy = 6434.999999999999;
    expect(roundHalfAwayFromZero(noisy, -1)).toBe(6440);
    expect(roundHalfAwayFromZero(0.1 + 0.2, 16)).toBe(0.3);
  });

  it("never returns -0", () => {
    expect(Object.is(roundHalfAwayFromZero(-0.04, 1), 0)).toBe(true);
    expect(Object.is(roundHalfAwayFromZero(-0, 3), 0)).toBe(true);
    expect(Object.is(roundHalfAwayFromZero(-0.4, 0), 0)).toBe(true);
    expect(Object.is(roundHalfAwayFromZero(-4, -1), 0)).toBe(true);
  });

  it("supports negative decimals (tens, hundreds)", () => {
    expect(roundHalfAwayFromZero(6434, -1)).toBe(6430);
    expect(roundHalfAwayFromZero(6435, -1)).toBe(6440);
    expect(roundHalfAwayFromZero(-6435, -1)).toBe(-6440);
    expect(roundHalfAwayFromZero(149, -2)).toBe(100);
    expect(roundHalfAwayFromZero(150, -2)).toBe(200);
  });

  it("handles exponent-notation magnitudes", () => {
    expect(roundHalfAwayFromZero(1.5e-7, 7)).toBe(2e-7);
    expect(roundHalfAwayFromZero(1.4e-7, 7)).toBe(1e-7);
    expect(roundHalfAwayFromZero(1e-7, 3)).toBe(0);
    expect(roundHalfAwayFromZero(1e21, 2)).toBe(1e21);
    expect(roundHalfAwayFromZero(1e300, 20)).toBe(1e300);
    expect(roundHalfAwayFromZero(123.456, 0)).toBe(123);
  });

  it("throws on non-finite values and invalid decimals", () => {
    expect(() => roundHalfAwayFromZero(Number.NaN, 1)).toThrow(RangeError);
    expect(() => roundHalfAwayFromZero(Number.POSITIVE_INFINITY, 1)).toThrow(/non-finite/);
    expect(() => roundHalfAwayFromZero(1, 1.5)).toThrow(/decimals/);
    expect(() => roundHalfAwayFromZero(1, 21)).toThrow(/decimals/);
    expect(() => roundHalfAwayFromZero(1, -21)).toThrow(/decimals/);
  });
});

describe("product-spec examples hold exactly", () => {
  it('carry "167 yd"', () => {
    expect(formatDistance(152.705, I)).toBe("167 yd");
    expect(formatDistance(yardsToMeters(167), I)).toBe("167 yd");
  });
  it('launch "16.2°"', () => {
    expect(formatAngle(degToRad(16.2))).toBe("16.2°");
  });
  it('spin "6,430 rpm"', () => {
    expect(formatSpinRate(rpmToRadPerSec(6430))).toBe("6,430 rpm");
    expect(formatSpinRate(rpmToRadPerSec(6427))).toBe("6,430 rpm");
    expect(formatSpinRate(rpmToRadPerSec(6434))).toBe("6,430 rpm");
    // A tie survives the rpm -> rad/s -> rpm round trip and rounds away from zero.
    expect(formatSpinRate(rpmToRadPerSec(6435))).toBe("6,440 rpm");
  });
  it('direction "2.1° R" (horizontal angle is +left, so -2.1° is right)', () => {
    expect(formatHorizontalAngle(degToRad(-2.1))).toBe("2.1° R");
    expect(formatHorizontalAngle(degToRad(2.1))).toBe("2.1° L");
  });
  it(`range "163–171 yd" with an en dash and one unit`, () => {
    const text = formatRange(yardsToMeters(163), yardsToMeters(171), "distance", I);
    expect(text).toBe("163–171 yd");
    expect(text).toContain(EN_DASH);
    expect(text.match(/yd/g)).toHaveLength(1);
  });
});

describe("null renders an em dash; non-finite throws", () => {
  const PRECISIONS: readonly Precision[] = ["golfer", "engineering"];
  const formatters: readonly (readonly [string, (v: number | null, p: Precision) => string])[] = [
    ["formatDistance", (v, p) => formatDistance(v, I, p)],
    ["formatHeight", (v, p) => formatHeight(v, I, p)],
    ["formatLateral", (v, p) => formatLateral(v, I, p)],
    ["formatSpeed", (v, p) => formatSpeed(v, I, p)],
    ["formatAngle", (v, p) => formatAngle(v, p)],
    ["formatHorizontalAngle", (v, p) => formatHorizontalAngle(v, p)],
    ["formatSpinAxis", (v, p) => formatSpinAxis(v, p)],
    ["formatSpinRate", (v, p) => formatSpinRate(v, p)],
    ["formatSidespin", (v, p) => formatSidespin(v, p)],
    ["formatDuration", (v, p) => formatDuration(v, p)],
    ["formatRatio", (v, p) => formatRatio(v, p)],
    ["formatAngularRate", (v, p) => formatAngularRate(v, p)],
    ["formatShortLength", (v, p) => formatShortLength(v, I, p)],
    ["formatTemperature", (v, p) => formatTemperature(v, I, p)],
    ["formatPressure", (v, p) => formatPressure(v, I, p)],
  ];
  for (const [name, fn] of formatters) {
    for (const precision of PRECISIONS) {
      it(`${name}(null, "${precision}") -> "—"`, () => {
        expect(fn(null, precision)).toBe(EM_DASH);
        expect(UNAVAILABLE_TEXT).toBe(EM_DASH);
      });
      it(`${name}(…, "${precision}") throws on NaN / ±Infinity and never prints "NaN"`, () => {
        expect(() => fn(Number.NaN, precision)).toThrow(RangeError);
        expect(() => fn(Number.POSITIVE_INFINITY, precision)).toThrow(/finite/);
        expect(() => fn(Number.NEGATIVE_INFINITY, precision)).toThrow(/finite/);
      });
    }
  }
  it("throws on undefined (missing is not the same as unavailable)", () => {
    expect(() => formatDistance(undefined as unknown as null, I)).toThrow(/finite number or null/);
  });
  it("throws on an unknown display unit or precision", () => {
    const bogus = { ...I, distance: "furlong" } as unknown as UnitSystem;
    expect(() => formatDistance(100, bogus)).toThrow(/unknown display unit "furlong"/);
    expect(() => formatAngle(1, "approximate" as never)).toThrow(/unknown precision/);
  });
});

describe("distance and height", () => {
  it("golfer distance: yd or m, 0 dp; engineering m, 3 dp", () => {
    expect(formatDistance(152.705, M)).toBe("153 m");
    expect(formatDistance(152.705, I, "engineering")).toBe("152.705 m");
    expect(formatDistance(152.705, M, "engineering")).toBe("152.705 m");
    expect(formatDistance(0, I)).toBe("0 yd");
    expect(formatDistance(-0.2, I)).toBe("0 yd");
    expect(formatDistance(yardsToMeters(0.5), I)).toBe("1 yd");
    expect(formatDistance(yardsToMeters(-0.5), I)).toBe("-1 yd");
    expect(formatDistance(1000 * METERS_PER_YARD, I)).toBe("1000 yd");
  });

  it("golfer height: ft 0 dp, yd 0 dp, m 1 dp; engineering m 3 dp", () => {
    const h = 29.87;
    expect(formatHeight(h, I)).toBe("98 ft");
    expect(formatHeight(h, { ...I, height: "yd" })).toBe("33 yd");
    expect(formatHeight(h, M)).toBe("29.9 m");
    expect(formatHeight(h, I, "engineering")).toBe("29.870 m");
    expect(formatHeight(feetToMeters(100), I)).toBe("100 ft");
  });
});

describe("lateral (+left): magnitude with L / R, zero without a label", () => {
  it("golfer", () => {
    expect(formatLateral(yardsToMeters(12), I)).toBe("12 yd L");
    expect(formatLateral(yardsToMeters(-3), I)).toBe("3 yd R");
    expect(formatLateral(-3.0, M)).toBe("3 m R");
    expect(formatLateral(yardsToMeters(11.6), I)).toBe("12 yd L");
  });
  it("rounds-to-zero is '0 yd' with no L/R and no '-0'", () => {
    expect(formatLateral(0, I)).toBe("0 yd");
    expect(formatLateral(-0, I)).toBe("0 yd");
    expect(formatLateral(yardsToMeters(0.49), I)).toBe("0 yd");
    expect(formatLateral(yardsToMeters(-0.49), I)).toBe("0 yd");
    expect(formatLateral(yardsToMeters(-0.5), I)).toBe("1 yd R");
  });
  it("engineering: signed m 3 dp, explicit + for left", () => {
    expect(formatLateral(3.658, I, "engineering")).toBe("+3.658 m");
    expect(formatLateral(-0.9144, I, "engineering")).toBe("-0.914 m");
    expect(formatLateral(-0.0001, I, "engineering")).toBe("0.000 m");
    expect(formatLateral(-0, I, "engineering")).toBe("0.000 m");
  });
});

describe("speed", () => {
  it("golfer 1 dp in mph / km/h / m/s; engineering m/s 3 dp", () => {
    expect(formatSpeed(mphToMps(167), I)).toBe("167.0 mph");
    expect(formatSpeed(74.6559, I)).toBe("167.0 mph");
    expect(formatSpeed(70.1, M)).toBe("252.4 km/h");
    expect(formatSpeed(70.1, { ...M, speed: "m/s" })).toBe("70.1 m/s");
    expect(formatSpeed(70.1, I, "engineering")).toBe("70.100 m/s");
    expect(formatSpeed(mphToMps(0.04), I)).toBe("0.0 mph");
    expect(formatSpeed(mphToMps(-0.04), I)).toBe("0.0 mph");
  });
});

describe("angles", () => {
  it("formatAngle: signed, golfer 1 dp, engineering 3 dp", () => {
    expect(formatAngle(degToRad(16.2), "engineering")).toBe("16.200°");
    expect(formatAngle(0.6458)).toBe("37.0°");
    expect(formatAngle(degToRad(-3.24))).toBe("-3.2°");
    expect(formatAngle(degToRad(-0.04))).toBe("0.0°");
  });

  it("formatHorizontalAngle: +left -> L, zero -> '0.0°'", () => {
    expect(formatHorizontalAngle(0)).toBe("0.0°");
    expect(formatHorizontalAngle(degToRad(-0.04))).toBe("0.0°");
    expect(formatHorizontalAngle(degToRad(0.05))).toBe("0.1° L");
    expect(formatHorizontalAngle(degToRad(-2.1), "engineering")).toBe("2.100° R");
  });

  it("formatSpinAxis: +right -> R (positive tilt curves right, §4.3)", () => {
    expect(formatSpinAxis(degToRad(3.4))).toBe("3.4° R");
    expect(formatSpinAxis(degToRad(-3.4))).toBe("3.4° L");
    expect(formatSpinAxis(0)).toBe("0.0°");
    expect(formatSpinAxis(-0)).toBe("0.0°");
    expect(formatSpinAxis(degToRad(2.1))).toBe("2.1° R");
  });
});

describe("spin, duration and the other quantities", () => {
  it("spin: golfer nearest 10 rpm with locale-independent ',' grouping; engineering 1 dp", () => {
    expect(formatSpinRate(rpmToRadPerSec(2486))).toBe("2,490 rpm");
    expect(formatSpinRate(rpmToRadPerSec(994))).toBe("990 rpm");
    expect(formatSpinRate(rpmToRadPerSec(995))).toBe("1,000 rpm");
    expect(formatSpinRate(rpmToRadPerSec(123456789))).toBe("123,456,790 rpm");
    expect(formatSpinRate(0)).toBe("0 rpm");
    expect(formatSpinRate(rpmToRadPerSec(6430.04), "engineering")).toBe("6430.0 rpm");
    expect(formatSpinRate(rpmToRadPerSec(12345.65), "engineering")).toBe("12345.7 rpm");
  });

  it("sidespin: +right -> R, zero has no label", () => {
    expect(formatSidespin(rpmToRadPerSec(432))).toBe("430 rpm R");
    expect(formatSidespin(rpmToRadPerSec(-1234))).toBe("1,230 rpm L");
    expect(formatSidespin(rpmToRadPerSec(4))).toBe("0 rpm");
    expect(formatSidespin(rpmToRadPerSec(-432.06), "engineering")).toBe("432.1 rpm L");
  });

  it("duration, ratio, angular rate, short length", () => {
    expect(formatDuration(6.25)).toBe("6.3 s");
    expect(formatDuration(6.25, "engineering")).toBe("6.250 s");
    expect(formatRatio(1.475)).toBe("1.48");
    expect(formatRatio(1.4755, "engineering")).toBe("1.476");
    expect(formatAngularRate(degToRad(2450))).toBe("2,450 °/s");
    expect(formatAngularRate(degToRad(2450), "engineering")).toBe("2450.000 °/s");
    expect(formatShortLength(inchesToMeters(1.25), I)).toBe("1.3 in");
    expect(formatShortLength(-0.03, M)).toBe("-3.0 cm");
    expect(formatShortLength(-0.03, I, "engineering")).toBe("-0.030 m");
  });

  it("temperature and pressure", () => {
    expect(formatTemperature(22.2222, I)).toBe("72 °F");
    expect(formatTemperature(22.5, M)).toBe("23 °C");
    expect(formatTemperature(-0.4, M)).toBe("0 °C");
    expect(formatTemperature(15, I, "engineering")).toBe("15.00 °C");
    expect(formatPressure(101325, I)).toBe("29.92 inHg");
    expect(formatPressure(101325, M)).toBe("1013 hPa");
    expect(formatPressure(101325, M, "engineering")).toBe("101325 Pa");
  });
});

describe("formatRange", () => {
  it("shares the unit once for unsided kinds", () => {
    expect(formatRange(yardsToMeters(163), yardsToMeters(171), "distance", M)).toBe("149–156 m");
    expect(formatRange(feetToMeters(88), feetToMeters(97), "height", I)).toBe("88–97 ft");
    expect(formatRange(mphToMps(165.2), mphToMps(168.9), "speed", I)).toBe("165.2–168.9 mph");
    expect(formatRange(rpmToRadPerSec(6200), rpmToRadPerSec(6600), "spin", I)).toBe("6,200–6,600 rpm");
    expect(formatRange(degToRad(15.8), degToRad(16.6), "angle", I)).toBe("15.8–16.6°");
    expect(formatRange(5.9, 6.7, "duration", I)).toBe("5.9–6.7 s");
    expect(formatRange(149.1, 156.4, "distance", I, "engineering")).toBe("149.100–156.400 m");
  });

  it("lateral keeps L / R on each end, left end first", () => {
    // p05 = 4 yd right, p95 = 2 yd left
    expect(formatRange(yardsToMeters(-4), yardsToMeters(2), "lateral", I)).toBe("2 yd L–4 yd R");
    expect(formatRange(yardsToMeters(1), yardsToMeters(6), "lateral", I)).toBe("6 yd L–1 yd L");
    expect(formatRange(yardsToMeters(-6), yardsToMeters(0), "lateral", I)).toBe("0 yd–6 yd R");
    expect(formatRange(-3.658, 1.829, "lateral", I, "engineering")).toBe("-3.658–+1.829 m");
  });

  it("signed angle kinds keep labels and screen order", () => {
    expect(formatRange(degToRad(-3), degToRad(2), "horizontal-angle", I)).toBe("2.0° L–3.0° R");
    expect(formatRange(degToRad(-3), degToRad(2), "spin-axis", I)).toBe("3.0° L–2.0° R");
    expect(formatRange(rpmToRadPerSec(-200), rpmToRadPerSec(600), "side-spin", I)).toBe("200 rpm L–600 rpm R");
  });

  it("throws on non-finite ends, low > high, or an unknown kind", () => {
    expect(() => formatRange(Number.NaN, 1, "distance", I)).toThrow(RangeError);
    expect(() => formatRange(2, 1, "distance", I)).toThrow(/low .* > high/);
    expect(() => formatRange(1, 2, "volume" as never, I)).toThrow(/unknown kind/);
  });
});

describe("shouldShowRange thresholds", () => {
  const at = (width: number, p50: number) => ({ p05: p50 - width / 2, p50, p95: p50 + width / 2 });
  const eps = 1e-9;

  it("exports the product thresholds in SI", () => {
    expect(RANGE_THRESHOLD_DISTANCE_YD).toBe(3);
    expect(RANGE_THRESHOLD_DISTANCE_M).toBe(2.7432);
    expect(RANGE_THRESHOLD_DISTANCE_M).toBeCloseTo(3 * METERS_PER_YARD, 12);
    expect(RANGE_THRESHOLD_LATERAL_M).toBe(2.7432);
    expect(RANGE_THRESHOLD_DISTANCE_RELATIVE).toBe(0.03);
    expect(RANGE_THRESHOLD_SPEED_MPS).toBe(0.44704);
    expect(RANGE_THRESHOLD_SPIN_RAD_PER_SEC).toBeCloseTo(10 * Math.PI, 12);
    expect(RANGE_THRESHOLD_ANGLE_RAD).toBe(Math.PI / 180);
    expect(RANGE_THRESHOLD_DURATION_S).toBe(0.5);
  });

  it("undefined interval -> false", () => {
    expect(shouldShowRange(undefined, "distance")).toBe(false);
  });

  it("distance: width > 3 yd (absolute) ...", () => {
    // p50 = 200 m so the 3 % rule (6 m) is not the trigger
    expect(shouldShowRange(at(2.7432 - eps, 200), "distance")).toBe(false);
    expect(shouldShowRange(at(2.7432 + 1e-6, 200), "distance")).toBe(true);
  });

  it("... or width > 3 % of |p50| (short shots)", () => {
    expect(shouldShowRange(at(1.5, 40), "distance")).toBe(true); // 1.5 > 1.2
    expect(shouldShowRange(at(1.1, 40), "distance")).toBe(false);
    expect(shouldShowRange(at(1.5, 40), "height")).toBe(true);
    expect(shouldShowRange(at(1.5, -40), "height")).toBe(true); // uses |p50|
  });

  it("lateral: absolute 3 yd only (a lateral p50 near 0 must not trigger the relative rule)", () => {
    expect(shouldShowRange(at(0.5, 0.01), "lateral")).toBe(false);
    expect(shouldShowRange(at(2.75, 0), "lateral")).toBe(true);
  });

  it("speed > 1 mph, spin > 300 rpm, angle > 1°, duration > 0.5 s", () => {
    expect(shouldShowRange(at(mphToMps(0.99), 70), "speed")).toBe(false);
    expect(shouldShowRange(at(mphToMps(1.01), 70), "speed")).toBe(true);
    expect(shouldShowRange(at(rpmToRadPerSec(299), 300), "spin")).toBe(false);
    expect(shouldShowRange(at(rpmToRadPerSec(301), 300), "spin")).toBe(true);
    expect(shouldShowRange(at(rpmToRadPerSec(301), 0), "side-spin")).toBe(true);
    expect(shouldShowRange(at(degToRad(0.99), 0.3), "angle")).toBe(false);
    expect(shouldShowRange(at(degToRad(1.01), 0.3), "angle")).toBe(true);
    expect(shouldShowRange(at(degToRad(1.01), 0), "horizontal-angle")).toBe(true);
    expect(shouldShowRange(at(degToRad(1.01), 0), "spin-axis")).toBe(true);
    expect(shouldShowRange(at(0.49, 6), "duration")).toBe(false);
    expect(shouldShowRange(at(0.51, 6), "duration")).toBe(true);
  });

  it("an interval exactly at a threshold in golfer units shows no range (no float-noise flip)", () => {
    expect(RANGE_THRESHOLD_RELATIVE_TOLERANCE).toBe(1e-9);
    const conv = (lo: number, hi: number, f: (v: number) => number) => ({ p05: f(lo), p50: f((lo + hi) / 2), p95: f(hi) });
    // yardsToMeters(163) - yardsToMeters(160) = 2.7432000000000016 m: exactly 3 yd, not wider.
    expect(yardsToMeters(163) - yardsToMeters(160)).toBeGreaterThan(RANGE_THRESHOLD_DISTANCE_M);
    for (const [lo, hi] of [[160, 163], [167, 170], [200, 203], [250, 253]] as const) {
      expect(shouldShowRange(conv(lo, hi, yardsToMeters), "distance"), `${lo}-${hi} yd`).toBe(false);
      expect(shouldShowRange(conv(lo, hi + 0.01, yardsToMeters), "distance"), `${lo}-${hi}.01 yd`).toBe(true);
    }
    expect(shouldShowRange(conv(-1, 2, yardsToMeters), "lateral")).toBe(false);
    expect(shouldShowRange(conv(-1, 2.01, yardsToMeters), "lateral")).toBe(true);
    expect(shouldShowRange(conv(167, 168, mphToMps), "speed")).toBe(false);
    expect(shouldShowRange(conv(167, 168.01, mphToMps), "speed")).toBe(true);
    expect(shouldShowRange(conv(6300, 6600, rpmToRadPerSec), "spin")).toBe(false);
    expect(shouldShowRange(conv(6300, 6610, rpmToRadPerSec), "spin")).toBe(true);
    expect(shouldShowRange(conv(16.2, 17.2, degToRad), "angle")).toBe(false);
    expect(shouldShowRange(conv(16.2, 17.25, degToRad), "angle")).toBe(true);
    // Relative rule exactly at 3 % of |p50|: 1.5 m wide around 50 m.
    expect(shouldShowRange({ p05: 49.25, p50: 50, p95: 50.75 }, "height")).toBe(false);
    expect(shouldShowRange({ p05: 49.25, p50: 50, p95: 50.76 }, "height")).toBe(true);
  });

  it("throws on malformed intervals", () => {
    expect(() => shouldShowRange({ p05: 2, p50: 1.5, p95: 1 }, "distance")).toThrow(/p95/);
    expect(() => shouldShowRange({ p05: Number.NaN, p50: 1, p95: 2 }, "distance")).toThrow(/non-finite/);
    expect(() => shouldShowRange({ p05: 0, p50: 1, p95: 2 }, "volume" as never)).toThrow(/unknown kind/);
  });
});
