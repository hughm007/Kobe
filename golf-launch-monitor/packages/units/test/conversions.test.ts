import { describe, expect, it } from "vitest";
import {
  celsiusToFahrenheit,
  celsiusToKelvin,
  convert,
  DEG_PER_RAD,
  degToRad,
  dimensionOf,
  fahrenheitToCelsius,
  feetToMeters,
  hpaToPascals,
  inchesToMeters,
  inHgToPascals,
  isUnitId,
  KELVIN_OFFSET,
  KG_PER_GRAM,
  kelvinToCelsius,
  kmhToMps,
  METERS_PER_FOOT,
  METERS_PER_INCH,
  METERS_PER_MILLIMETER,
  METERS_PER_YARD,
  metersToFeet,
  metersToInches,
  metersToMillimeters,
  metersToYards,
  millimetersToMeters,
  mphToMps,
  MPS_PER_KMH,
  MPS_PER_MPH,
  mpsToKmh,
  mpsToMph,
  PA_PER_HPA,
  PA_PER_INHG,
  pascalsToHpa,
  pascalsToInHg,
  RAD_PER_DEG,
  RAD_PER_SEC_PER_RPM,
  radPerSecToRpm,
  radToDeg,
  rpmToRadPerSec,
  UNIT_IDS,
  type UnitId,
  yardsToMeters,
} from "../src/index";

/** |a - b| <= rel * max(|a|, |b|, 1): tolerant of last-ulp noise, nothing more. */
function expectClose(actual: number, expected: number, rel = 1e-14): void {
  const scale = Math.max(Math.abs(actual), Math.abs(expected), 1);
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(rel * scale);
}

describe("exact conversion constants (docs/coordinate-system.md §9)", () => {
  it("length constants are the exact international definitions", () => {
    expect(METERS_PER_YARD).toBe(0.9144);
    expect(METERS_PER_FOOT).toBe(0.3048);
    expect(METERS_PER_INCH).toBe(0.0254);
    expect(METERS_PER_MILLIMETER).toBe(0.001);
  });

  it("speed constants: 1 mph = 0.44704 m/s exactly, 1 km/h = 1/3.6 m/s", () => {
    expect(MPS_PER_MPH).toBe(0.44704);
    expect(MPS_PER_KMH).toBe(1000 / 3600);
    // 1 mph = 1609.344 m / 3600 s
    expectClose(MPS_PER_MPH, 1609.344 / 3600);
  });

  it("angle and angular-speed constants", () => {
    expect(RAD_PER_DEG).toBe(Math.PI / 180);
    expect(DEG_PER_RAD).toBe(180 / Math.PI);
    expectClose(RAD_PER_DEG * DEG_PER_RAD, 1);
    expect(RAD_PER_SEC_PER_RPM).toBe((2 * Math.PI) / 60);
  });

  it("pressure, temperature and mass constants", () => {
    expect(PA_PER_INHG).toBe(3386.389);
    expect(PA_PER_HPA).toBe(100);
    expect(KELVIN_OFFSET).toBe(273.15);
    expect(KG_PER_GRAM).toBe(0.001);
  });
});

describe("named conversion functions: exact anchor values", () => {
  it("yards", () => {
    expect(yardsToMeters(1)).toBe(0.9144);
    expect(metersToYards(0.9144)).toBe(1);
    expectClose(yardsToMeters(167), 152.7048);
    expectClose(metersToYards(91.44), 100);
  });

  it("feet and inches agree with the yard (3 ft = 36 in = 1 yd)", () => {
    expect(feetToMeters(1)).toBe(0.3048);
    expect(metersToFeet(0.3048)).toBe(1);
    expectClose(feetToMeters(3), yardsToMeters(1));
    expect(inchesToMeters(1)).toBe(0.0254);
    expect(metersToInches(0.0254)).toBe(1);
    expectClose(inchesToMeters(12), feetToMeters(1));
    expectClose(inchesToMeters(36), 0.9144);
    expectClose(metersToFeet(1), 3.280839895013123);
  });

  it("millimetres (ball diameter 42.67 mm)", () => {
    expect(metersToMillimeters(1)).toBe(1000);
    expectClose(millimetersToMeters(42.67), 0.04267);
  });

  it("speed", () => {
    expect(mphToMps(1)).toBe(0.44704);
    expect(mpsToMph(0.44704)).toBe(1);
    expectClose(mphToMps(100), 44.704);
    expectClose(mpsToKmh(10), 36);
    expectClose(kmhToMps(36), 10);
    // 1 mph = 1.609344 km/h exactly
    expectClose(mpsToKmh(mphToMps(1)), 1.609344);
  });

  it("angles", () => {
    expectClose(degToRad(180), Math.PI);
    expectClose(degToRad(90), Math.PI / 2);
    expectClose(radToDeg(Math.PI), 180);
    expectClose(radToDeg(1), 57.29577951308232);
    expect(degToRad(0)).toBe(0);
    expectClose(degToRad(-16.2), -0.2827433388230814);
  });

  it("spin: 60 rpm = 2π rad/s, 3000 rpm = 100π rad/s", () => {
    expectClose(rpmToRadPerSec(60), 2 * Math.PI);
    expectClose(radPerSecToRpm(2 * Math.PI), 60);
    expectClose(rpmToRadPerSec(3000), 100 * Math.PI);
    expectClose(radPerSecToRpm(100 * Math.PI), 3000);
  });

  it("temperature (affine): 0 °C = 32 °F = 273.15 K; -40 °C = -40 °F; 100 °C = 212 °F", () => {
    expect(celsiusToKelvin(0)).toBe(273.15);
    expect(kelvinToCelsius(273.15)).toBe(0);
    expect(celsiusToFahrenheit(0)).toBe(32);
    expect(celsiusToFahrenheit(100)).toBe(212);
    expect(celsiusToFahrenheit(-40)).toBe(-40);
    expect(fahrenheitToCelsius(32)).toBe(0);
    expect(fahrenheitToCelsius(212)).toBe(100);
    expect(fahrenheitToCelsius(-40)).toBe(-40);
    expectClose(celsiusToFahrenheit(15), 59);
  });

  it("pressure: 1 inHg = 3386.389 Pa, 1013.25 hPa = 101325 Pa ≈ 29.92 inHg", () => {
    expect(inHgToPascals(1)).toBe(3386.389);
    expect(pascalsToInHg(3386.389)).toBe(1);
    expect(pascalsToHpa(101325)).toBe(1013.25);
    expect(hpaToPascals(1013.25)).toBe(101325);
    expectClose(pascalsToInHg(101325), 29.921252401894762);
  });
});

describe("round trips: inverse(forward(v)) === v up to last-ulp noise", () => {
  const values = [-1234.5, -16.2, -1, -0.001, 0, 1e-9, 0.5, 1, 6.3, 70.1, 152.705, 6430, 101325, 1e6];
  // Affine (temperature) pairs add and subtract an offset of ~273, so a tiny input keeps an
  // absolute error of ~ulp(273) ≈ 6e-14; their tolerance is scaled by the offset.
  const pairs: readonly (readonly [string, (v: number) => number, (v: number) => number, number?])[] = [
    ["m<->yd", metersToYards, yardsToMeters],
    ["m<->ft", metersToFeet, feetToMeters],
    ["m<->in", metersToInches, inchesToMeters],
    ["m<->mm", metersToMillimeters, millimetersToMeters],
    ["m/s<->mph", mpsToMph, mphToMps],
    ["m/s<->km/h", mpsToKmh, kmhToMps],
    ["rad<->deg", radToDeg, degToRad],
    ["rad/s<->rpm", radPerSecToRpm, rpmToRadPerSec],
    ["degC<->K", celsiusToKelvin, kelvinToCelsius, 1e-14 * 460],
    ["degC<->degF", celsiusToFahrenheit, fahrenheitToCelsius, 1e-14 * 460],
    ["Pa<->inHg", pascalsToInHg, inHgToPascals],
    ["Pa<->hPa", pascalsToHpa, hpaToPascals],
  ];
  for (const [name, forward, inverse, rel] of pairs) {
    it(name, () => {
      for (const v of values) {
        expectClose(inverse(forward(v)), v, rel);
        expectClose(forward(inverse(v)), v, rel);
      }
    });
  }
});

describe("convert(): dimension-checked generic conversion", () => {
  const sample = [-273.15, -40, -1, 0, 0.5, 1, 16.2, 152.705, 6430, 101325];

  it("UNIT_IDS lists every unit exactly once and each has a dimension", () => {
    expect(UNIT_IDS).toHaveLength(23);
    expect(new Set(UNIT_IDS).size).toBe(UNIT_IDS.length);
    for (const u of UNIT_IDS) {
      expect(isUnitId(u)).toBe(true);
      expect(typeof dimensionOf(u)).toBe("string");
    }
    expect(isUnitId("furlong")).toBe(false);
    expect(isUnitId("")).toBe(false);
    expect(dimensionOf("yd")).toBe("length");
    expect(dimensionOf("rpm")).toBe("angular-speed");
    expect(dimensionOf("degF")).toBe("temperature");
    expect(dimensionOf("inHg")).toBe("pressure");
    expect(dimensionOf("kg/m^3")).toBe("density");
  });

  it("is the identity for a unit to itself", () => {
    for (const u of UNIT_IDS) for (const v of sample) expect(convert(v, u, u)).toBe(v);
  });

  it("round-trips every ordered pair of same-dimension units", () => {
    for (const a of UNIT_IDS) {
      for (const b of UNIT_IDS) {
        if (dimensionOf(a) !== dimensionOf(b)) continue;
        for (const v of sample) {
          const there = convert(v, a, b);
          expect(Number.isFinite(there)).toBe(true);
          expectClose(convert(there, b, a), v, dimensionOf(a) === "temperature" ? 1e-14 * 460 : 1e-14);
        }
      }
    }
  });

  it("agrees with the named functions and exact anchors", () => {
    expect(convert(1, "yd", "m")).toBe(0.9144);
    expect(convert(0.9144, "m", "yd")).toBe(1);
    expectClose(convert(1, "yd", "ft"), 3);
    expectClose(convert(1, "ft", "in"), 12);
    expect(convert(1000, "mm", "m")).toBe(1);
    expect(convert(100, "mph", "m/s")).toBe(mphToMps(100));
    expectClose(convert(1, "mph", "km/h"), 1.609344);
    expect(convert(6430, "rpm", "rad/s")).toBe(rpmToRadPerSec(6430));
    expectClose(convert(180, "deg", "rad"), Math.PI);
    expect(convert(20, "degC", "degF")).toBe(68);
    expect(convert(0, "K", "degC")).toBe(-273.15);
    expectClose(convert(68, "degF", "K"), 293.15);
    expectClose(convert(1, "inHg", "hPa"), 33.86389);
    expect(convert(1013.25, "hPa", "Pa")).toBe(101325);
    expect(convert(1, "g", "kg")).toBe(0.001);
    expect(convert(1500, "ms", "s")).toBe(1.5);
    expect(convert(1.225, "kg/m^3", "kg/m^3")).toBe(1.225);
  });

  it("throws on every cross-dimension pair", () => {
    let pairs = 0;
    for (const a of UNIT_IDS) {
      for (const b of UNIT_IDS) {
        if (dimensionOf(a) === dimensionOf(b)) continue;
        pairs++;
        expect(() => convert(1, a, b)).toThrow(/cannot convert/);
      }
    }
    expect(pairs).toBeGreaterThan(400);
    expect(() => convert(1, "m", "mph")).toThrow("convert: cannot convert m (length) to mph (speed)");
    expect(() => convert(1, "deg", "rpm")).toThrow(/angle.*angular-speed/);
    expect(() => convert(1, "degC", "Pa")).toThrow(/temperature.*pressure/);
  });

  it("throws on NaN and ±Infinity, even unit-to-itself", () => {
    const bad: readonly [number, UnitId, UnitId][] = [
      [Number.NaN, "m", "yd"],
      [Number.NaN, "m", "m"],
      [Number.POSITIVE_INFINITY, "mph", "m/s"],
      [Number.NEGATIVE_INFINITY, "degC", "degF"],
      [Number.NaN, "rpm", "rad/s"],
    ];
    for (const [v, from, to] of bad) expect(() => convert(v, from, to)).toThrow(/non-finite/);
  });
});
