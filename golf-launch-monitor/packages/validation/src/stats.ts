/**
 * Accuracy statistics over signed errors (prediction - reference). Missing values are
 * skipped and counted, never treated as zero: a zero-filled error would silently make a
 * system look more accurate than it is.
 */
import { mean, meanAbsolute, median, quantile, rootMeanSquare, standardDeviation } from "@glm/core-math";

export type ErrorStats = {
  readonly n: number;
  /** Mean signed error (prediction - reference). */
  readonly bias: number;
  /** Mean absolute error. */
  readonly mae: number;
  /** Root-mean-square error. */
  readonly rmse: number;
  readonly medianSigned: number;
  readonly medianAbs: number;
  /** 95th percentile of |error| (linear interpolation, Hyndman-Fan type 7). */
  readonly p95Abs: number;
  /** Sample standard deviation (n - 1) of the signed errors; 0 when n = 1. */
  readonly standardDeviation: number;
};

function assertFinite(values: readonly number[], fn: string): void {
  values.forEach((v, i) => {
    if (!Number.isFinite(v)) throw new Error(`${fn}: error[${i}] is not finite (${v})`);
  });
}

/** Summary statistics of signed errors. Throws on empty or non-finite input. */
export function errorStats(errors: readonly number[]): ErrorStats {
  if (errors.length === 0) throw new Error("errorStats: no errors to summarize (input is empty)");
  assertFinite(errors, "errorStats");
  const abs = errors.map((e) => Math.abs(e));
  return {
    n: errors.length,
    bias: mean(errors),
    mae: meanAbsolute(errors),
    rmse: rootMeanSquare(errors),
    medianSigned: median(errors),
    medianAbs: median(abs),
    p95Abs: quantile(abs, 0.95),
    standardDeviation: standardDeviation(errors),
  };
}

export type PredictionPair = { readonly predicted: number | null; readonly reference: number | null };

/**
 * Signed errors `predicted - reference` for pairs where both sides exist. Pairs with a
 * null on either side are skipped and counted. Non-finite numbers throw (they are bugs,
 * not missing data).
 */
export function pairedErrors(pairs: readonly PredictionPair[]): { errors: number[]; skipped: number } {
  const errors: number[] = [];
  let skipped = 0;
  pairs.forEach((pair, i) => {
    if (pair.predicted === null || pair.reference === null) {
      skipped += 1;
      return;
    }
    if (!Number.isFinite(pair.predicted) || !Number.isFinite(pair.reference)) {
      throw new Error(`pairedErrors: pair[${i}] has a non-finite value (${pair.predicted}, ${pair.reference})`);
    }
    errors.push(pair.predicted - pair.reference);
  });
  return { errors, skipped };
}

export type GroupedErrorStats = ErrorStats & { readonly skipped: number };

export type GroupedErrorStatsOptions = {
  /**
   * What to do with a group whose every error is null: "throw" (default) so that a group
   * never disappears silently, or "omit" to leave it out of the result.
   */
  readonly emptyGroups?: "throw" | "omit";
};

/**
 * errorStats per group. Keys of the result are sorted. Rows whose error is null are
 * counted in the group's `skipped`.
 */
export function groupedErrorStats<T>(
  rows: readonly T[],
  key: (row: T) => string,
  error: (row: T) => number | null,
  options: GroupedErrorStatsOptions = {},
): Record<string, GroupedErrorStats> {
  const groups = new Map<string, { errors: number[]; skipped: number }>();
  for (const row of rows) {
    const k = key(row);
    let g = groups.get(k);
    if (g === undefined) {
      g = { errors: [], skipped: 0 };
      groups.set(k, g);
    }
    const e = error(row);
    if (e === null) g.skipped += 1;
    else g.errors.push(e);
  }
  const entries: [string, GroupedErrorStats][] = [];
  for (const k of [...groups.keys()].sort()) {
    const g = groups.get(k) as { errors: number[]; skipped: number };
    if (g.errors.length === 0) {
      if ((options.emptyGroups ?? "throw") === "omit") continue;
      throw new Error(
        `groupedErrorStats: group "${k}" has no non-null errors (${g.skipped} skipped); ` +
          'pass { emptyGroups: "omit" } to leave such groups out',
      );
    }
    entries.push([k, { ...errorStats(g.errors), skipped: g.skipped }]);
  }
  // fromEntries defines own properties, so a group named "__proto__" is kept (plain
  // assignment would set the prototype and drop the group silently).
  return Object.fromEntries(entries);
}

/**
 * Label of the half-open bin [edges[i], edges[i+1]) containing `value`, e.g. "40–50 m/s".
 * Values below the first edge are "< first"; values at or above the last edge are "≥ last".
 */
export function binLabel(value: number, edges: readonly number[], unitLabel: string): string {
  if (!Number.isFinite(value)) throw new Error(`binLabel: value is not finite (${value})`);
  if (edges.length === 0) throw new Error("binLabel: at least one edge is required");
  edges.forEach((edge, i) => {
    if (!Number.isFinite(edge)) throw new Error(`binLabel: edge[${i}] is not finite`);
    if (i > 0 && !(edge > (edges[i - 1] as number))) throw new Error("binLabel: edges must be strictly increasing");
  });
  const suffix = unitLabel === "" ? "" : ` ${unitLabel}`;
  const first = edges[0] as number;
  const last = edges[edges.length - 1] as number;
  if (value < first) return `< ${first}${suffix}`;
  if (value >= last) return `≥ ${last}${suffix}`;
  for (let i = 0; i < edges.length - 1; i++) {
    const lo = edges[i] as number;
    const hi = edges[i + 1] as number;
    if (value >= lo && value < hi) return `${lo}–${hi}${suffix}`;
  }
  throw new Error("binLabel: unreachable");
}

export type IntervalRow = { readonly lower: number; readonly upper: number; readonly truth: number };

/**
 * Fraction of rows whose truth lies inside the closed interval [lower, upper]. For a
 * well-calibrated p05..p95 interval this should be close to 0.90.
 */
export function intervalCoverage(rows: readonly IntervalRow[]): number {
  if (rows.length === 0) throw new Error("intervalCoverage: input is empty");
  let inside = 0;
  rows.forEach((r, i) => {
    if (!Number.isFinite(r.lower) || !Number.isFinite(r.upper) || !Number.isFinite(r.truth)) {
      throw new Error(`intervalCoverage: row[${i}] has a non-finite value`);
    }
    if (r.lower > r.upper) throw new Error(`intervalCoverage: row[${i}] has lower > upper`);
    if (r.truth >= r.lower && r.truth <= r.upper) inside += 1;
  });
  return inside / rows.length;
}

/** Fixed 4-significant-figure formatting without exponents in the common range. */
export function formatStat(x: number): string {
  if (x === 0) return "0";
  // Choose the format from the value as rounded to 4 significant figures: 9999.95 rounds
  // to 1.000e4, which toPrecision(4) would print in exponent notation.
  const abs = Math.abs(Number(x.toPrecision(4)));
  if (abs >= 1e4) return x.toFixed(0);
  if (abs < 1e-4) return x.toExponential(3);
  return x.toPrecision(4);
}

function escapeCell(text: string): string {
  return text.replace(/\|/g, "\\|").replace(/[\r\n]+/g, " ");
}

export type AccuracyTableRow = { readonly group: string; readonly stats: ErrorStats; readonly unit: string };

/** GitHub-flavoured Markdown table of error statistics, one row per group, in input order. */
export function accuracyTableMarkdown(rows: readonly AccuracyTableRow[]): string {
  const header = "| Group | n | Bias | MAE | RMSE | Median | Median abs | P95 abs | SD | Unit |";
  const rule = "|---|---:|---:|---:|---:|---:|---:|---:|---:|---|";
  const body = rows.map(({ group, stats: s, unit }) =>
    [
      escapeCell(group),
      String(s.n),
      formatStat(s.bias),
      formatStat(s.mae),
      formatStat(s.rmse),
      formatStat(s.medianSigned),
      formatStat(s.medianAbs),
      formatStat(s.p95Abs),
      formatStat(s.standardDeviation),
      escapeCell(unit),
    ].join(" | "),
  );
  return [header, rule, ...body.map((b) => `| ${b} |`)].join("\n") + "\n";
}
