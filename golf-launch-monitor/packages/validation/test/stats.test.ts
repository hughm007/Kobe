import { describe, expect, it } from "vitest";
import {
  accuracyTableMarkdown,
  binLabel,
  errorStats,
  formatStat,
  groupedErrorStats,
  intervalCoverage,
  pairedErrors,
} from "../src/index";

describe("errorStats", () => {
  it("matches hand-computed values (odd n)", () => {
    // errors 2, -1, 3, 5, -4: sum 5, |e| sum 15, e^2 sum 55, deviations from 1: 1,-2,2,4,-5 -> SS 50.
    const s = errorStats([2, -1, 3, 5, -4]);
    expect(s.n).toBe(5);
    expect(s.bias).toBe(1);
    expect(s.mae).toBe(3);
    expect(s.rmse).toBeCloseTo(Math.sqrt(11), 14);
    expect(s.medianSigned).toBe(2); // sorted -4, -1, 2, 3, 5
    expect(s.medianAbs).toBe(3); // sorted 1, 2, 3, 4, 5
    expect(s.p95Abs).toBeCloseTo(4.8, 14); // h = 4 * 0.95 = 3.8 -> 4 + 0.8 * (5 - 4)
    expect(s.standardDeviation).toBeCloseTo(Math.sqrt(12.5), 14);
  });

  it("matches hand-computed values (even n) and keeps the sign of the bias", () => {
    const s = errorStats([1, 3, -2, -10]);
    expect(s.bias).toBe(-2);
    expect(s.medianSigned).toBe(-0.5); // sorted -10, -2, 1, 3
    expect(s.medianAbs).toBe(2.5); // sorted 1, 2, 3, 10
    expect(s.p95Abs).toBeCloseTo(8.95, 14); // h = 3 * 0.95 = 2.85 -> 3 + 0.85 * 7
    expect(s.rmse).toBeCloseTo(Math.sqrt(114 / 4), 14);
  });

  it("has zero spread for a single error", () => {
    expect(errorStats([-0.5])).toEqual({
      n: 1,
      bias: -0.5,
      mae: 0.5,
      rmse: 0.5,
      medianSigned: -0.5,
      medianAbs: 0.5,
      p95Abs: 0.5,
      standardDeviation: 0,
    });
  });

  it("throws on empty or non-finite input", () => {
    expect(() => errorStats([])).toThrow(/empty/);
    expect(() => errorStats([1, Number.NaN])).toThrow(/error\[1\] is not finite/);
  });
});

describe("pairedErrors", () => {
  it("computes predicted - reference and skips (never zero-fills) missing pairs", () => {
    const result = pairedErrors([
      { predicted: 10, reference: 8 },
      { predicted: null, reference: 5 },
      { predicted: 3, reference: null },
      { predicted: 1, reference: 4 },
      { predicted: null, reference: null },
    ]);
    expect(result).toEqual({ errors: [2, -3], skipped: 3 });
    const s = errorStats(result.errors);
    expect(s.n).toBe(2); // zero-filling would have given n = 5 and a bias of -0.2
    expect(s.bias).toBe(-0.5);
  });

  it("treats a zero as data, not as missing", () => {
    expect(pairedErrors([{ predicted: 0, reference: 0 }])).toEqual({ errors: [0], skipped: 0 });
  });

  it("throws on NaN instead of treating it as missing", () => {
    expect(() => pairedErrors([{ predicted: Number.NaN, reference: 1 }])).toThrow(/pair\[0\]/);
  });
});

describe("groupedErrorStats", () => {
  type Row = { club: string; error: number | null };
  const rows: Row[] = [
    { club: "7i", error: 1 },
    { club: "driver", error: -2 },
    { club: "7i", error: null },
    { club: "7i", error: 3 },
    { club: "putter", error: null },
  ];

  it("computes stats per group with skipped counts, sorted keys", () => {
    const g = groupedErrorStats(rows, (r) => r.club, (r) => r.error, { emptyGroups: "omit" });
    expect(Object.keys(g)).toEqual(["7i", "driver"]);
    expect(g["7i"]?.n).toBe(2);
    expect(g["7i"]?.bias).toBe(2);
    expect(g["7i"]?.skipped).toBe(1);
    expect(g["7i"]?.rmse).toBeCloseTo(Math.sqrt(5), 14);
    expect(g.driver).toMatchObject({ n: 1, bias: -2, mae: 2, skipped: 0 });
  });

  it("keeps a group whose key is an Object.prototype name such as __proto__", () => {
    const g = groupedErrorStats(["__proto__", "a", "constructor"], (k) => k, () => 1);
    expect(Object.keys(g)).toEqual(["__proto__", "a", "constructor"]);
    expect(Object.getOwnPropertyDescriptor(g, "__proto__")?.value).toMatchObject({ n: 1, bias: 1, skipped: 0 });
    expect(g.constructor).toMatchObject({ n: 1 });
  });

  it("refuses by default to drop a group that has only missing errors", () => {
    expect(() => groupedErrorStats(rows, (r) => r.club, (r) => r.error)).toThrow(/group "putter".*1 skipped/);
  });
});

describe("binLabel", () => {
  const edges = [40, 50, 60, 70];
  it("labels half-open bins and open-ended tails", () => {
    expect(binLabel(45, edges, "m/s")).toBe("40–50 m/s");
    expect(binLabel(40, edges, "m/s")).toBe("40–50 m/s");
    expect(binLabel(50, edges, "m/s")).toBe("50–60 m/s");
    expect(binLabel(69.999, edges, "m/s")).toBe("60–70 m/s");
    expect(binLabel(39.9, edges, "m/s")).toBe("< 40 m/s");
    expect(binLabel(70, edges, "m/s")).toBe("≥ 70 m/s");
    expect(binLabel(2500, [0, 2000, 3000], "rpm")).toBe("2000–3000 rpm");
    expect(binLabel(12.5, [10, 15], "")).toBe("10–15");
  });

  it("rejects bad edges and values", () => {
    expect(() => binLabel(1, [], "m")).toThrow(/at least one edge/);
    expect(() => binLabel(1, [1, 1], "m")).toThrow(/strictly increasing/);
    expect(() => binLabel(Number.NaN, edges, "m")).toThrow(/not finite/);
  });
});

describe("intervalCoverage", () => {
  it("counts truths inside the closed interval", () => {
    expect(
      intervalCoverage([
        { lower: 0, upper: 1, truth: 0.5 },
        { lower: 0, upper: 1, truth: 1 },
        { lower: 0, upper: 1, truth: 1.5 },
        { lower: 2, upper: 3, truth: 1 },
      ]),
    ).toBe(0.5);
  });

  it("rejects empty input and inverted intervals", () => {
    expect(() => intervalCoverage([])).toThrow(/empty/);
    expect(() => intervalCoverage([{ lower: 2, upper: 1, truth: 1 }])).toThrow(/lower > upper/);
  });
});

describe("accuracyTableMarkdown", () => {
  it("renders a Markdown table with escaped group names", () => {
    const md = accuracyTableMarkdown([{ group: "7-iron | wet", stats: errorStats([2, -1, 3, 5, -4]), unit: "m" }]);
    expect(md).toBe(
      [
        "| Group | n | Bias | MAE | RMSE | Median | Median abs | P95 abs | SD | Unit |",
        "|---|---:|---:|---:|---:|---:|---:|---:|---:|---|",
        "| 7-iron \\| wet | 5 | 1.000 | 3.000 | 3.317 | 2.000 | 3.000 | 4.800 | 3.536 | m |",
        "",
      ].join("\n"),
    );
  });

  it("formats numbers without spurious exponents", () => {
    expect(formatStat(0)).toBe("0");
    expect(formatStat(12345.6)).toBe("12346");
    expect(formatStat(1234.56)).toBe("1235");
    expect(formatStat(-0.5)).toBe("-0.5000");
    expect(formatStat(0.00001234)).toBe("1.234e-5");
    // Values that round up to 1e4 at 4 significant figures.
    expect(formatStat(9999.95)).toBe("10000");
    expect(formatStat(-9999.7)).toBe("-10000");
    expect(formatStat(9999.4)).toBe("9999");
  });
});
