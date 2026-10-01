/** Descriptive statistics. All functions throw on empty input rather than returning NaN. */

function requireNonEmpty(values: ReadonlyArray<number>, fn: string): void {
  if (values.length === 0) throw new Error(`${fn}: input is empty`);
}

export function sum(values: ReadonlyArray<number>): number {
  // Neumaier compensated summation for reproducible accuracy.
  let s = 0;
  let c = 0;
  for (const v of values) {
    const t = s + v;
    c += Math.abs(s) >= Math.abs(v) ? s - t + v : v - t + s;
    s = t;
  }
  return s + c;
}

export function mean(values: ReadonlyArray<number>): number {
  requireNonEmpty(values, "mean");
  return sum(values) / values.length;
}

/** Sample variance (n - 1 denominator). Returns 0 for a single value. */
export function variance(values: ReadonlyArray<number>): number {
  requireNonEmpty(values, "variance");
  if (values.length === 1) return 0;
  const m = mean(values);
  return sum(values.map((v) => (v - m) * (v - m))) / (values.length - 1);
}

export function standardDeviation(values: ReadonlyArray<number>): number {
  return Math.sqrt(variance(values));
}

/**
 * Quantile with linear interpolation between order statistics (Hyndman & Fan type 7,
 * the default in R and NumPy). `q` in [0, 1].
 */
export function quantile(values: ReadonlyArray<number>, q: number): number {
  requireNonEmpty(values, "quantile");
  if (!(q >= 0 && q <= 1)) throw new Error(`quantile: q must be in [0, 1], got ${q}`);
  const sorted = values.slice().sort((a, b) => a - b);
  const h = (sorted.length - 1) * q;
  const lo = Math.floor(h);
  const hi = Math.ceil(h);
  const vlo = sorted[lo] as number;
  const vhi = sorted[hi] as number;
  return vlo + (h - lo) * (vhi - vlo);
}

export function median(values: ReadonlyArray<number>): number {
  return quantile(values, 0.5);
}

export function rootMeanSquare(values: ReadonlyArray<number>): number {
  requireNonEmpty(values, "rootMeanSquare");
  return Math.sqrt(sum(values.map((v) => v * v)) / values.length);
}

export function meanAbsolute(values: ReadonlyArray<number>): number {
  requireNonEmpty(values, "meanAbsolute");
  return sum(values.map((v) => Math.abs(v))) / values.length;
}

/** Median absolute deviation from the median (unscaled). */
export function medianAbsoluteDeviation(values: ReadonlyArray<number>): number {
  const m = median(values);
  return median(values.map((v) => Math.abs(v - m)));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
