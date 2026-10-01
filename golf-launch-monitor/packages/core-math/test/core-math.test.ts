import { describe, expect, it } from "vitest";
import {
  cholesky,
  createRng,
  cross,
  invert,
  invertSpd,
  matMul,
  mean,
  median,
  normalize,
  quantile,
  rotateAboutAxis,
  sampleMultivariateNormal,
  solveLinear,
  standardDeviation,
  UNIT_X,
  UNIT_Y,
  UNIT_Z,
  vec3,
} from "../src/index";

describe("vec3", () => {
  it("cross product is right-handed", () => {
    expect(cross(UNIT_X, UNIT_Y)).toEqual(UNIT_Z);
    expect(cross(UNIT_Y, UNIT_Z)).toEqual(UNIT_X);
    expect(cross(UNIT_Z, UNIT_X)).toEqual(UNIT_Y);
  });

  it("normalize returns null for degenerate vectors instead of NaN", () => {
    expect(normalize(vec3(0, 0, 0))).toBeNull();
    expect(normalize(vec3(3, 4, 0))).toEqual(vec3(0.6, 0.8, 0));
  });

  it("rotateAboutAxis follows the right-hand rule", () => {
    const r = rotateAboutAxis(UNIT_X, UNIT_Z, Math.PI / 2);
    expect(r.x).toBeCloseTo(0, 12);
    expect(r.y).toBeCloseTo(1, 12);
    expect(r.z).toBeCloseTo(0, 12);
  });
});

describe("linear algebra", () => {
  const spd = [
    [4, 12, -16],
    [12, 37, -43],
    [-16, -43, 98],
  ];

  it("cholesky reproduces the matrix and rejects indefinite input", () => {
    const l = cholesky(spd);
    expect(l).not.toBeNull();
    const llt = matMul(l!, l!.map((_, i) => l!.map((row) => row[i] as number)));
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) expect(llt[i]![j]).toBeCloseTo(spd[i]![j]!, 10);
    expect(
      cholesky([
        [1, 2],
        [2, 1],
      ]),
    ).toBeNull();
  });

  it("invertSpd and invert produce the identity", () => {
    for (const inv of [invertSpd(spd), invert(spd)]) {
      expect(inv).not.toBeNull();
      const p = matMul(spd, inv!);
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) expect(p[i]![j]).toBeCloseTo(i === j ? 1 : 0, 9);
    }
  });

  it("solveLinear handles pivoting and reports singular systems", () => {
    const x = solveLinear(
      [
        [0, 1],
        [1, 0],
      ],
      [2, 3],
    );
    expect(x).toEqual([3, 2]);
    expect(
      solveLinear(
        [
          [1, 2],
          [2, 4],
        ],
        [1, 2],
      ),
    ).toBeNull();
  });
});

describe("rng", () => {
  it("is deterministic for a given seed and differs across seeds", () => {
    const a = createRng(42);
    const b = createRng(42);
    const c = createRng(43);
    const sa = Array.from({ length: 5 }, () => a.nextFloat());
    const sb = Array.from({ length: 5 }, () => b.nextFloat());
    const sc = Array.from({ length: 5 }, () => c.nextFloat());
    expect(sa).toEqual(sb);
    expect(sa).not.toEqual(sc);
    for (const v of sa) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("normal deviates have approximately zero mean and unit variance", () => {
    const rng = createRng(7);
    const xs = Array.from({ length: 20000 }, () => rng.normal());
    expect(Math.abs(mean(xs))).toBeLessThan(0.03);
    expect(Math.abs(standardDeviation(xs) - 1)).toBeLessThan(0.03);
  });

  it("multivariate normal samples reproduce the covariance", () => {
    const rng = createRng(11);
    const cov = [
      [4, 1.2],
      [1.2, 1],
    ];
    const samples = Array.from({ length: 20000 }, () => sampleMultivariateNormal(rng, [10, -2], cov));
    const xs = samples.map((s) => s[0] as number);
    const ys = samples.map((s) => s[1] as number);
    const mx = mean(xs);
    const my = mean(ys);
    const cxy = mean(samples.map((s) => ((s[0] as number) - mx) * ((s[1] as number) - my)));
    expect(mx).toBeCloseTo(10, 1);
    expect(my).toBeCloseTo(-2, 1);
    expect(standardDeviation(xs)).toBeCloseTo(2, 1);
    expect(cxy).toBeCloseTo(1.2, 1);
  });
});

describe("stats", () => {
  it("quantile uses type-7 interpolation", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(quantile([1, 2, 3, 4], 0.5)).toBe(2.5);
    expect(quantile([0, 10], 0.95)).toBeCloseTo(9.5, 12);
  });

  it("throws on empty input instead of returning NaN", () => {
    expect(() => mean([])).toThrow();
    expect(() => quantile([], 0.5)).toThrow();
  });
});
