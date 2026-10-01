import type { Matrix } from "@glm/shared-types";
import { cholesky } from "./linalg";

/**
 * Deterministic pseudo-random generator (xoshiro128** seeded via splitmix32).
 * Every stochastic computation in the product (synthetic noise, Monte Carlo uncertainty)
 * takes an explicit seed so that results are reproducible bit-for-bit.
 */
export interface Rng {
  /** Uniform 32-bit unsigned integer. */
  nextUint32(): number;
  /** Uniform double in [0, 1) with 53 bits of randomness. */
  nextFloat(): number;
  /** Standard normal deviate (mean 0, standard deviation 1). */
  normal(): number;
  /** Uniform integer in [0, maxExclusive). */
  nextInt(maxExclusive: number): number;
}

function splitmix32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x9e3779b9) >>> 0;
    let z = state;
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b) >>> 0;
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35) >>> 0;
    return (z ^ (z >>> 16)) >>> 0;
  };
}

function rotl(x: number, k: number): number {
  return ((x << k) | (x >>> (32 - k))) >>> 0;
}

export function createRng(seed: number): Rng {
  if (!Number.isInteger(seed)) throw new Error(`createRng: seed must be an integer, got ${seed}`);
  const init = splitmix32(seed);
  let s0 = init();
  let s1 = init();
  let s2 = init();
  let s3 = init();
  if ((s0 | s1 | s2 | s3) === 0) s0 = 1;
  let spareNormal: number | null = null;

  const nextUint32 = (): number => {
    const result = Math.imul(rotl(Math.imul(s1, 5) >>> 0, 7), 9) >>> 0;
    const t = (s1 << 9) >>> 0;
    s2 = (s2 ^ s0) >>> 0;
    s3 = (s3 ^ s1) >>> 0;
    s1 = (s1 ^ s2) >>> 0;
    s0 = (s0 ^ s3) >>> 0;
    s2 = (s2 ^ t) >>> 0;
    s3 = rotl(s3, 11);
    return result;
  };

  const nextFloat = (): number => {
    const hi = nextUint32() >>> 5; // 27 bits
    const lo = nextUint32() >>> 6; // 26 bits
    return (hi * 67108864 + lo) / 9007199254740992;
  };

  const normal = (): number => {
    if (spareNormal !== null) {
      const v = spareNormal;
      spareNormal = null;
      return v;
    }
    let u1 = nextFloat();
    while (u1 <= Number.MIN_VALUE) u1 = nextFloat();
    const u2 = nextFloat();
    const r = Math.sqrt(-2 * Math.log(u1));
    const theta = 2 * Math.PI * u2;
    spareNormal = r * Math.sin(theta);
    return r * Math.cos(theta);
  };

  const nextInt = (maxExclusive: number): number => {
    if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
      throw new Error(`nextInt: maxExclusive must be a positive integer, got ${maxExclusive}`);
    }
    return Math.floor(nextFloat() * maxExclusive);
  };

  return { nextUint32, nextFloat, normal, nextInt };
}

/**
 * Draw a sample from N(mean, covariance). Throws if the covariance is not positive
 * definite; callers should regularise singular covariances explicitly.
 */
export function sampleMultivariateNormal(rng: Rng, mean: ReadonlyArray<number>, covariance: Matrix): number[] {
  const l = cholesky(covariance);
  if (!l) throw new Error("sampleMultivariateNormal: covariance is not positive definite");
  const n = mean.length;
  const z = Array.from({ length: n }, () => rng.normal());
  const out = mean.slice() as number[];
  for (let i = 0; i < n; i++) {
    let s = 0;
    const row = l[i] as number[];
    for (let k = 0; k <= i; k++) s += (row[k] as number) * (z[k] as number);
    out[i] = (out[i] as number) + s;
  }
  return out;
}
