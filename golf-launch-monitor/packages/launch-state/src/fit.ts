import { cholesky, clamp, invertSpd, median, solveLinear, subMatrix } from "@glm/core-math";
import type { MutableMatrix } from "@glm/core-math";
import type { BallPosition3dObservation, LaunchFitDiagnostics, Matrix, Vec3 } from "@glm/shared-types";
import { uniqueStrings } from "./constants";

/**
 * Multi-frame launch-state fit (docs/vision-pipeline.md, Stage E).
 *
 * Estimates the launch position p0 and velocity v0 at a reference time from post-impact 3D
 * ball positions by weighted nonlinear least squares. Each residual is whitened with the
 * Cholesky factor of that observation's reported covariance, so anisotropic stereo noise
 * (depth is typically much worse than lateral) is weighted correctly. The trajectory model is
 * injected so the pipeline can plug in drag/lift-aware propagation without this package
 * depending on @glm/ballistics.
 */

export interface TrajectoryModel {
  readonly id: string;
  /** Ball-center positions at times dtS (seconds after the reference time) for state (p0, v0). */
  predict(p0: Vec3, v0: Vec3, dtS: readonly number[]): Vec3[];
}

/** p(t) = p0 + v0 t - 0.5 g t^2 Z. Adequate for seeding; it ignores drag (~1 % speed over 20 ms). */
export function gravityOnlyTrajectoryModel(gravityMps2: number): TrajectoryModel {
  if (!(Number.isFinite(gravityMps2) && gravityMps2 >= 0)) {
    throw new Error(`gravityOnlyTrajectoryModel: gravity must be finite and >= 0, got ${gravityMps2}`);
  }
  const g = gravityMps2;
  return Object.freeze({
    id: `gravity-only(g=${g})`,
    predict(p0: Vec3, v0: Vec3, dtS: readonly number[]): Vec3[] {
      return dtS.map((t) => ({ x: p0.x + v0.x * t, y: p0.y + v0.y * t, z: p0.z + v0.z * t - 0.5 * g * t * t }));
    },
  });
}

export type LaunchFitOptions = {
  readonly trajectoryModel: TrajectoryModel;
  /** Session-clock time the fitted state refers to. Default: earliest observation time. */
  readonly referenceTimeS?: number | null;
  /** Floor for outlier rejection (and below it the fit is flagged). Default 3, minimum 2. */
  readonly minObservations?: number;
  /**
   * Whitened residual norm above which an observation is an outlier. Default 4.0. Applied as
   * outlierThresholdSigma * outlierNoiseScale (see LaunchFitSuccess.outlierNoiseScale).
   */
  readonly outlierThresholdSigma?: number;
  /** Levenberg-Marquardt iterations per fit. Default 50. */
  readonly maxIterations?: number;
};

export type LaunchFitSuccess = {
  readonly ok: true;
  readonly positionM: Vec3;
  readonly velocityMps: Vec3;
  /** 6x6 covariance, order px, py, pz, vx, vy, vz (m, m/s). Inflated by max(1, chi2/dof). */
  readonly covariance6: number[][];
  readonly referenceTimeS: number;
  readonly diagnostics: LaunchFitDiagnostics;
  readonly inlierSequences: number[];
  /** Every observation not used: invalid, before the reference time, non-PD covariance, outlier. */
  readonly rejectedSequences: number[];
  readonly qualityFlags: string[];
  readonly warnings: string[];
  /** Whitened chi-square of the inliers at the solution. */
  readonly chiSquare: number;
  /** 3 * inliers - 6. */
  readonly degreesOfFreedom: number;
  /** Factor the covariance was multiplied by: max(1, chi2/dof), or 1 when dof = 0. */
  readonly covarianceScale: number;
  /**
   * Robust noise scale the outlier threshold was multiplied by: clamp(s, 1,
   * MAX_OUTLIER_NOISE_SCALE), s = sqrt(median standardised norm^2 / median of chi2(3)) at the
   * outlier-screened fit (1 when outlier rejection did not run). Above 1 only when the reported
   * covariances are optimistic for the whole track (or by sampling noise at small n).
   */
  readonly outlierNoiseScale: number;
};

export type LaunchFitFailure = {
  readonly ok: false;
  readonly reason: string;
  readonly qualityFlags: string[];
  readonly warnings: string[];
};

export const DEFAULT_MIN_OBSERVATIONS = 3;
export const DEFAULT_OUTLIER_THRESHOLD_SIGMA = 4.0;
export const DEFAULT_MAX_ITERATIONS = 50;
/** Outlier rejection runs only with at least this many usable observations. */
export const OUTLIER_REJECTION_MIN_OBSERVATIONS = 5;
export const MAX_OUTLIER_ROUNDS = 3;
/** Fewer inliers than this: "Insufficient post-impact frames for high-confidence ball speed." */
export const HIGH_CONFIDENCE_MIN_OBSERVATIONS = 6;
/** Central-difference steps for the Jacobian through the trajectory model. */
export const JACOBIAN_STEP_POSITION_M = 1e-6;
export const JACOBIAN_STEP_VELOCITY_MPS = 1e-5;
/** Median of a chi-square distribution with 3 degrees of freedom (whitened 3D residual norm^2). */
export const CHI2_3DOF_MEDIAN = 2.365974;
/** chi2/dof above this adds a warning that the reported position noise was optimistic. */
export const NOISE_UNDERSTATED_CHI2_PER_DOF = 4;
/**
 * Cap on the robust noise scale applied to the outlier threshold (provisional). Reported
 * covariances optimistic by more than 3x in sigma are treated as a fault: the excess is
 * rejected rather than absorbed, and the fit is flagged "position-noise-understated".
 */
export const MAX_OUTLIER_NOISE_SCALE = 3;
/** Least-trimmed-squares start: C-steps are run from this many of the best elemental pairs. */
export const LTS_START_CANDIDATES = 10;
export const LTS_MAX_CSTEPS = 20;
/** Ridge added to the 3x3 residual covariance when standardising residual norms. */
const STANDARDIZE_RIDGE = 1e-9;

export const INSUFFICIENT_FRAMES_WARNING = "Insufficient post-impact frames for high-confidence ball speed.";

type Candidate = {
  readonly obs: BallPosition3dObservation;
  readonly dt: number;
  /** Lower Cholesky factor of the observation covariance. */
  readonly l: MutableMatrix;
};

type Params = number[]; // [px, py, pz, vx, vy, vz]

type SolveResult = {
  readonly theta: Params;
  readonly iterations: number;
  readonly converged: boolean;
};

const toVec = (a: ReadonlyArray<number>, offset: number): Vec3 => ({
  x: a[offset] as number,
  y: a[offset + 1] as number,
  z: a[offset + 2] as number,
});

/** Solve L w = e for lower-triangular 3x3 L (whitening). */
function whiten(l: Matrix, e: Vec3): [number, number, number] {
  const r0 = l[0] as ReadonlyArray<number>;
  const r1 = l[1] as ReadonlyArray<number>;
  const r2 = l[2] as ReadonlyArray<number>;
  const w0 = e.x / (r0[0] as number);
  const w1 = (e.y - (r1[0] as number) * w0) / (r1[1] as number);
  const w2 = (e.z - (r2[0] as number) * w0 - (r2[1] as number) * w1) / (r2[2] as number);
  return [w0, w1, w2];
}

function isFiniteVec3(v: Vec3 | null | undefined): v is Vec3 {
  return typeof v === "object" && v !== null && Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z);
}

/** Cholesky factor of a finite, symmetric, positive-definite 3x3 covariance; otherwise null. */
function covarianceFactor(cov: Matrix | null | undefined): MutableMatrix | null {
  if (!Array.isArray(cov) || cov.length !== 3) return null;
  let scale = 0;
  for (const row of cov) {
    if (!Array.isArray(row) || row.length !== 3) return null;
    for (const v of row) {
      if (!Number.isFinite(v)) return null;
      scale = Math.max(scale, Math.abs(v));
    }
  }
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < i; j++) {
      const a = (cov[i] as ReadonlyArray<number>)[j] as number;
      const b = (cov[j] as ReadonlyArray<number>)[i] as number;
      if (Math.abs(a - b) > 1e-9 * scale) return null;
    }
  }
  return cholesky(cov);
}

class FitProblem {
  private readonly model: TrajectoryModel;
  private readonly set: readonly Candidate[];
  private readonly dts: readonly number[];

  constructor(model: TrajectoryModel, set: readonly Candidate[]) {
    this.model = model;
    this.set = set;
    this.dts = set.map((c) => c.dt);
  }

  /** Model prediction, or null if the model throws or returns anything non-finite. */
  predict(theta: Params): Vec3[] | null {
    let out: Vec3[];
    try {
      out = this.model.predict(toVec(theta, 0), toVec(theta, 3), this.dts);
    } catch {
      return null;
    }
    if (!Array.isArray(out) || out.length !== this.set.length) return null;
    for (const p of out) if (!isFiniteVec3(p)) return null;
    return out;
  }

  /** Whitened residuals L^-1 (pred - obs), stacked, or null if the model fails. */
  residuals(theta: Params): number[] | null {
    const pred = this.predict(theta);
    if (!pred) return null;
    const r: number[] = [];
    this.set.forEach((c, i) => {
      const p = pred[i] as Vec3;
      const o = c.obs.positionM;
      r.push(...whiten(c.l, { x: p.x - o.x, y: p.y - o.y, z: p.z - o.z }));
    });
    return r;
  }

  /** Whitened Jacobian (3m x 6) by central differences through the trajectory model. */
  jacobian(theta: Params): number[][] | null {
    const m = this.set.length;
    const jac: number[][] = Array.from({ length: 3 * m }, () => new Array<number>(6).fill(0));
    for (let k = 0; k < 6; k++) {
      const h = k < 3 ? JACOBIAN_STEP_POSITION_M : JACOBIAN_STEP_VELOCITY_MPS;
      const plus = theta.slice();
      const minus = theta.slice();
      plus[k] = (plus[k] as number) + h;
      minus[k] = (minus[k] as number) - h;
      const pp = this.predict(plus);
      const pm = this.predict(minus);
      if (!pp || !pm) return null;
      for (let i = 0; i < m; i++) {
        const a = pp[i] as Vec3;
        const b = pm[i] as Vec3;
        const w = whiten((this.set[i] as Candidate).l, {
          x: (a.x - b.x) / (2 * h),
          y: (a.y - b.y) / (2 * h),
          z: (a.z - b.z) / (2 * h),
        });
        for (let row = 0; row < 3; row++) (jac[3 * i + row] as number[])[k] = w[row] as number;
      }
    }
    return jac;
  }
}

function sumSquares(r: ReadonlyArray<number>): number {
  let s = 0;
  for (const v of r) s += v * v;
  return s;
}

function normalMatrix(jac: ReadonlyArray<ReadonlyArray<number>>): number[][] {
  const h = Array.from({ length: 6 }, () => new Array<number>(6).fill(0));
  for (const row of jac) {
    for (let i = 0; i < 6; i++) {
      const ri = row[i] as number;
      if (ri === 0) continue;
      const hi = h[i] as number[];
      for (let j = 0; j < 6; j++) hi[j] = (hi[j] as number) + ri * (row[j] as number);
    }
  }
  return h;
}

function gradient(jac: ReadonlyArray<ReadonlyArray<number>>, r: ReadonlyArray<number>): number[] {
  const g = new Array<number>(6).fill(0);
  jac.forEach((row, i) => {
    const ri = r[i] as number;
    for (let k = 0; k < 6; k++) g[k] = (g[k] as number) + (row[k] as number) * ri;
  });
  return g;
}

/**
 * Initial state from a per-axis weighted polynomial fit (quadratic with >= 4 observations,
 * otherwise linear). The quadratic term absorbs gravity/drag curvature so v0 starts close.
 */
function initialGuess(set: readonly Candidate[]): Params | null {
  const degree = set.length >= 4 ? 2 : 1;
  const theta: Params = new Array<number>(6).fill(0);
  const axes = ["x", "y", "z"] as const;
  for (let axis = 0; axis < 3; axis++) {
    const n = degree + 1;
    const a = Array.from({ length: n }, () => new Array<number>(n).fill(0));
    const b = new Array<number>(n).fill(0);
    for (const c of set) {
      const variance = ((c.obs.covarianceM2[axis] as ReadonlyArray<number>)[axis] as number) || 1;
      const w = 1 / variance;
      const basis = [1, c.dt, c.dt * c.dt].slice(0, n);
      const y = c.obs.positionM[axes[axis] as "x" | "y" | "z"];
      for (let i = 0; i < n; i++) {
        b[i] = (b[i] as number) + w * (basis[i] as number) * y;
        for (let j = 0; j < n; j++) (a[i] as number[])[j] = ((a[i] as number[])[j] as number) + w * (basis[i] as number) * (basis[j] as number);
      }
    }
    let coef = solveLinear(a, b);
    if (!coef && degree === 2) {
      const a1 = [
        [(a[0] as number[])[0] as number, (a[0] as number[])[1] as number],
        [(a[1] as number[])[0] as number, (a[1] as number[])[1] as number],
      ];
      coef = solveLinear(a1, [b[0] as number, b[1] as number]);
    }
    if (!coef) return null;
    theta[axis] = coef[0] as number;
    theta[axis + 3] = coef[1] as number;
  }
  return theta;
}

/** Levenberg-Marquardt (Marquardt diagonal scaling) on the whitened residuals. */
function solve(problem: FitProblem, init: Params, maxIterations: number): SolveResult | null {
  let theta = init.slice();
  let r = problem.residuals(theta);
  if (!r) return null;
  let cost = sumSquares(r);
  let lambda = 1e-3;
  let converged = false;
  let iterations = 0;

  for (let iter = 0; iter < maxIterations; iter++) {
    iterations = iter + 1;
    const jac = problem.jacobian(theta);
    if (!jac) return null;
    const h = normalMatrix(jac);
    const g = gradient(jac, r);
    let accepted: { theta: Params; r: number[]; cost: number; step: number[] } | null = null;
    for (let attempt = 0; attempt < 30 && !accepted; attempt++) {
      const a = h.map((row, i) => row.map((v, j) => (i === j ? v * (1 + lambda) : v)));
      const step = solveLinear(
        a,
        g.map((v) => -v),
      );
      if (step && step.every(Number.isFinite)) {
        const candidate = theta.map((v, k) => v + (step[k] as number));
        const rc = problem.residuals(candidate);
        if (rc) {
          const cc = sumSquares(rc);
          if (cc <= cost) {
            accepted = { theta: candidate, r: rc, cost: cc, step };
            lambda = Math.max(lambda / 10, 1e-12);
            break;
          }
        }
      }
      lambda *= 10;
    }
    if (!accepted) {
      // No damped step lowers the cost: we are at a minimum to working precision.
      converged = true;
      break;
    }
    const decrease = cost - accepted.cost;
    const stepSmall = accepted.step.every((s, k) => Math.abs(s) <= 1e-12 + 1e-10 * Math.abs(theta[k] as number));
    theta = accepted.theta;
    r = accepted.r;
    cost = accepted.cost;
    // Cost is a chi-square (dimensionless): a decrease below 1e-9 chi^2 is numerically nothing.
    if (stepSmall || decrease <= 1e-9 * Math.max(1, cost)) {
      converged = true;
      break;
    }
  }
  return { theta, iterations, converged };
}

/**
 * The fit linearised at theta0: whitened residuals r(theta0 + S d) ~ r0 + Js d, where
 * Js = J S and S = diag(1 / column norm). The column scaling equalises metres and m/s
 * parameters so the small elemental solves stay well conditioned.
 */
type LinearizedFit = {
  readonly theta0: Params;
  readonly r0: readonly number[];
  readonly js: readonly (readonly number[])[];
  readonly colScale: readonly number[];
};

function linearize(problem: FitProblem, theta0: Params): LinearizedFit | null {
  const r0 = problem.residuals(theta0);
  const jac = problem.jacobian(theta0);
  if (!r0 || !jac) return null;
  const colScale = [0, 1, 2, 3, 4, 5].map((k) => {
    const n = Math.sqrt(jac.reduce((s, row) => s + (row[k] as number) ** 2, 0));
    return n > 0 && Number.isFinite(n) ? 1 / n : Number.NaN;
  });
  if (!colScale.every(Number.isFinite)) return null;
  const js = jac.map((row) => row.map((v, k) => v * (colScale[k] as number)));
  return { theta0, r0, js, colScale };
}

/** Least-squares step d using only the given observations' rows; null if singular. */
function linearizedSolve(lin: LinearizedFit, obsIdx: readonly number[]): number[] | null {
  const a = Array.from({ length: 6 }, () => new Array<number>(6).fill(0));
  const b = new Array<number>(6).fill(0);
  for (const i of obsIdx) {
    for (let row = 3 * i; row < 3 * i + 3; row++) {
      const jr = lin.js[row] as ReadonlyArray<number>;
      const rr = lin.r0[row] as number;
      for (let p = 0; p < 6; p++) {
        const jp = jr[p] as number;
        b[p] = (b[p] as number) - jp * rr;
        const ap = a[p] as number[];
        for (let q = 0; q < 6; q++) ap[q] = (ap[q] as number) + jp * (jr[q] as number);
      }
    }
  }
  const d = solveLinear(a, b);
  return d && d.every(Number.isFinite) ? d : null;
}

/** Per-observation squared whitened residual norm of the linearised model at step d. */
function linearizedNormsSq(lin: LinearizedFit, d: readonly number[], count: number): number[] {
  const out = new Array<number>(count).fill(0);
  for (let row = 0; row < 3 * count; row++) {
    const jr = lin.js[row] as ReadonlyArray<number>;
    let e = lin.r0[row] as number;
    for (let p = 0; p < 6; p++) e += (jr[p] as number) * (d[p] as number);
    const i = Math.floor(row / 3);
    out[i] = (out[i] as number) + e * e;
  }
  return out;
}

/** Indices of the h smallest values (ties by index), returned in ascending index order. */
function smallestIndices(values: readonly number[], h: number): number[] {
  return values
    .map((_, i) => i)
    .sort((a, b) => (values[a] as number) - (values[b] as number) || a - b)
    .slice(0, h)
    .sort((a, b) => a - b);
}

function sumSmallest(values: readonly number[], h: number): number {
  return values
    .slice()
    .sort((a, b) => a - b)
    .slice(0, h)
    .reduce((s, v) => s + v, 0);
}

/**
 * Leverage-standardised squared residual norms. With whitened residual r_i, whitened Jacobian
 * block J_i and M_i = J_i (J_S^T J_S)^-1 J_i^T over the fit set S, the residual covariance is
 * I - M_i for an observation in S and I + M_i (prediction) for one outside S, so
 * r_i^T (I -/+ M_i)^-1 r_i is chi2(3) under the reported noise either way. Raw whitened norms
 * are biased low for in-fit high-leverage observations (an outlier at the end of the track
 * absorbs its own residual) and high for excluded ones (an excluded end-of-track observation is
 * an extrapolation and could never be re-admitted). Returns null if S does not determine the
 * six parameters. `d` is the linearised step at which the residuals are evaluated.
 */
function standardizedNormsSq(lin: LinearizedFit, d: readonly number[], inSet: readonly boolean[]): number[] | null {
  const count = inSet.length;
  const a = Array.from({ length: 6 }, () => new Array<number>(6).fill(0));
  for (let i = 0; i < count; i++) {
    if (!inSet[i]) continue;
    for (let row = 3 * i; row < 3 * i + 3; row++) {
      const jr = lin.js[row] as ReadonlyArray<number>;
      for (let p = 0; p < 6; p++) {
        const ap = a[p] as number[];
        for (let q = 0; q < 6; q++) ap[q] = (ap[q] as number) + (jr[p] as number) * (jr[q] as number);
      }
    }
  }
  const aInv = invertSpd(a);
  if (!aInv) return null;
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const rows = [0, 1, 2].map((k) => lin.js[3 * i + k] as ReadonlyArray<number>);
    const e = rows.map((jr, k) => {
      let v = lin.r0[3 * i + k] as number;
      for (let p = 0; p < 6; p++) v += (jr[p] as number) * (d[p] as number);
      return v;
    });
    const sign = inSet[i] ? -1 : 1;
    const c = rows.map((jk, k) =>
      rows.map((jl, l) => {
        let m = 0;
        for (let p = 0; p < 6; p++) {
          const ap = aInv[p] as ReadonlyArray<number>;
          let t = 0;
          for (let q = 0; q < 6; q++) t += (ap[q] as number) * (jl[q] as number);
          m += (jk[p] as number) * t;
        }
        // Tiny ridge: an observation the fit set determines exactly (leverage 1) has zero
        // residual in that direction and no information about it.
        return (k === l ? 1 + STANDARDIZE_RIDGE : 0) + sign * m;
      }),
    );
    const l = cholesky(c);
    if (!l) {
      out.push(0);
      continue;
    }
    const w = whiten(l, { x: e[0] as number, y: e[1] as number, z: e[2] as number });
    out.push(w[0] * w[0] + w[1] * w[1] + w[2] * w[2]);
  }
  return out;
}

/**
 * Least-trimmed-squares start for outlier rejection, so outliers cannot hide by dragging the
 * initial fit towards themselves (masking: two adjacent outliers at the end of a short track
 * have enough leverage to absorb most of their own residual). On the fit linearised at the
 * all-data solution (exact for gravity-only; the aero curvature over a few tens of ms is
 * negligible at this step), every elemental pair of observations (2 x 3 equations = 6
 * parameters) is solved exactly and scored by the sum of its h smallest squared whitened norms,
 * h = floor((n + 3) / 2). Concentration steps (Rousseeuw & Van Driessen, FAST-LTS) from the
 * best LTS_START_CANDIDATES pairs then refit on the h best observations until the subset is
 * stable. Tolerates up to n - h outliers. Deterministic. Cost O(n^3 log n) (all pairs),
 * a few ms for the 5-40 post-impact frames of a launch. Returns the leverage-standardised
 * squared norms of ALL observations at the best LTS solution and its parameters.
 */
function leastTrimmedSquaresStart(lin: LinearizedFit, count: number): { normsSq: number[]; theta: Params } | null {
  const h = Math.floor((count + 3) / 2);
  const starts: { d: number[]; score: number }[] = [];
  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      const d = linearizedSolve(lin, [i, j]);
      if (!d) continue;
      starts.push({ d, score: sumSmallest(linearizedNormsSq(lin, d, count), h) });
    }
  }
  starts.sort((a, b) => a.score - b.score);
  let best: { d: number[]; subset: number[]; objective: number } | null = null;
  for (const start of starts.slice(0, LTS_START_CANDIDATES)) {
    let d = start.d;
    let normsSq = linearizedNormsSq(lin, d, count);
    let subset: number[] | null = null;
    for (let step = 0; step < LTS_MAX_CSTEPS; step++) {
      const next = smallestIndices(normsSq, h);
      if (subset && next.every((v, k) => v === (subset as number[])[k])) break;
      const nd = linearizedSolve(lin, next);
      if (!nd) break;
      subset = next;
      d = nd;
      normsSq = linearizedNormsSq(lin, d, count);
    }
    if (!subset) continue;
    const objective = sumSmallest(normsSq, h);
    if (!best || objective < best.objective) best = { d, subset, objective };
  }
  if (!best) return null;
  const inSet = new Array<boolean>(count).fill(false);
  for (const i of best.subset) inSet[i] = true;
  const normsSq = standardizedNormsSq(lin, best.d, inSet);
  if (!normsSq) return null;
  const step = best.d;
  return { normsSq, theta: lin.theta0.map((v, k) => v + (step[k] as number) * (lin.colScale[k] as number)) };
}

function failure(reason: string, qualityFlags: string[], warnings: string[]): LaunchFitFailure {
  return { ok: false, reason, qualityFlags: uniqueStrings(qualityFlags), warnings: uniqueStrings(warnings) };
}

const seqList = (obs: readonly BallPosition3dObservation[]): string => obs.map((o) => o.sequence).join(", ");

/**
 * Fit launch position/velocity at the reference time to 3D ball positions.
 * See LaunchFitOptions for defaults. Never throws for bad data (returns a failure with a
 * reason); throws only for invalid options.
 */
export function fitLaunchState(
  observations: readonly BallPosition3dObservation[],
  options: LaunchFitOptions,
): LaunchFitSuccess | LaunchFitFailure {
  const model = options.trajectoryModel;
  if (!model || typeof model.predict !== "function") throw new Error("fitLaunchState: trajectoryModel is required");
  const minObservations = options.minObservations ?? DEFAULT_MIN_OBSERVATIONS;
  if (!Number.isInteger(minObservations) || minObservations < 2) {
    throw new Error(`fitLaunchState: minObservations must be an integer >= 2, got ${minObservations}`);
  }
  const threshold = options.outlierThresholdSigma ?? DEFAULT_OUTLIER_THRESHOLD_SIGMA;
  if (!(Number.isFinite(threshold) && threshold > 0)) {
    throw new Error(`fitLaunchState: outlierThresholdSigma must be > 0, got ${threshold}`);
  }
  const maxIterations = options.maxIterations ?? DEFAULT_MAX_ITERATIONS;
  if (!Number.isInteger(maxIterations) || maxIterations < 1) {
    throw new Error(`fitLaunchState: maxIterations must be an integer >= 1, got ${maxIterations}`);
  }
  const explicitRef = options.referenceTimeS ?? null;
  if (explicitRef !== null && !Number.isFinite(explicitRef)) {
    throw new Error(`fitLaunchState: referenceTimeS must be finite, got ${explicitRef}`);
  }

  const qualityFlags: string[] = [];
  const warnings: string[] = [];
  const rejected: BallPosition3dObservation[] = [];

  // Null/non-object entries are dropped (they carry no sequence to report).
  const objects = observations.filter((o) => typeof o === "object" && o !== null);
  const nonObjects = observations.length - objects.length;
  const sorted = objects.slice().sort((a, b) => a.timestampS - b.timestampS || a.sequence - b.sequence);
  const malformed = sorted.filter(
    (o) => o.kind !== "ball-position-3d" || !Number.isFinite(o.timestampS) || !isFiniteVec3(o.positionM),
  );
  if (malformed.length + nonObjects > 0) {
    rejected.push(...malformed);
    qualityFlags.push("malformed-observations-rejected");
    warnings.push(
      `Rejected ${malformed.length + nonObjects} malformed ball position(s)${malformed.length > 0 ? ` (sequence ${seqList(malformed)})` : ""}.`,
    );
  }
  const wellFormed = sorted.filter((o) => !malformed.includes(o));
  if (wellFormed.length === 0) {
    return failure(
      "No post-impact ball positions; launch state cannot be fitted.",
      [...qualityFlags, "insufficient-observations"],
      warnings,
    );
  }

  const referenceTimeS = explicitRef ?? (wellFormed[0] as BallPosition3dObservation).timestampS;
  const early = wellFormed.filter((o) => o.timestampS < referenceTimeS);
  if (early.length > 0) {
    rejected.push(...early);
    qualityFlags.push("observations-before-reference-excluded");
    warnings.push(
      `Excluded ${early.length} ball position(s) earlier than the launch reference time (sequence ${seqList(early)}).`,
    );
  }

  const candidates: Candidate[] = [];
  const nonPd: BallPosition3dObservation[] = [];
  for (const o of wellFormed) {
    if (o.timestampS < referenceTimeS) continue;
    const l = covarianceFactor(o.covarianceM2);
    if (!l) {
      nonPd.push(o);
      continue;
    }
    candidates.push({ obs: o, dt: o.timestampS - referenceTimeS, l });
  }
  if (nonPd.length > 0) {
    rejected.push(...nonPd);
    qualityFlags.push("non-pd-covariance-rejected");
    warnings.push(
      `Rejected ${nonPd.length} ball position(s) whose covariance is not symmetric positive definite (sequence ${seqList(nonPd)}).`,
    );
  }

  if (candidates.length < 2) {
    return failure(
      `Fewer than two usable post-impact ball positions (${candidates.length} usable); launch state cannot be fitted.`,
      [...qualityFlags, "insufficient-observations"],
      [...warnings, INSUFFICIENT_FRAMES_WARNING],
    );
  }
  const span = (candidates[candidates.length - 1] as Candidate).dt - (candidates[0] as Candidate).dt;
  if (!(span > 1e-9)) {
    return failure(
      "Usable ball positions span no time; launch velocity is unobservable.",
      [...qualityFlags, "zero-time-span"],
      warnings,
    );
  }

  const fitSet = (set: readonly Candidate[], init: Params | null): { problem: FitProblem; result: SolveResult } | null => {
    const start = init ?? initialGuess(set);
    if (!start) return null;
    const problem = new FitProblem(model, set);
    const result = solve(problem, start, maxIterations);
    return result ? { problem, result } : null;
  };

  let inliers: Candidate[] = candidates;
  let fit = fitSet(inliers, null);
  if (!fit) {
    return failure("Launch fit failed: the trajectory model produced no finite prediction.", [...qualityFlags, "fit-failed"], warnings);
  }

  // Robust outlier rejection (only with >= OUTLIER_REJECTION_MIN_OBSERVATIONS candidates).
  // 1. Least-trimmed-squares start (see leastTrimmedSquaresStart): a fit the outliers cannot
  //    drag towards themselves, and a robust noise scale s = sqrt(median(norm^2) / median of
  //    chi2(3)) over ALL candidates (a median, so a minority of outliers cannot inflate it),
  //    clamped to [1, MAX_OUTLIER_NOISE_SCALE]. s is re-estimated once, by the same median
  //    rule, at the first LTS-screened least-squares fit, and is FROZEN from then on (it is not
  //    re-estimated while further observations are removed).
  // 2. The rule: drop observations whose whitened residual norm, standardised by its own
  //    leverage-dependent covariance (see standardizedNormsSq), exceeds
  //    outlierThresholdSigma * s, refit, max MAX_OUTLIER_ROUNDS rounds (the LTS-scored round
  //    counts), never below minObservations. Each round re-scores EVERY candidate against the
  //    current fit, so a good observation outside the LTS subset is re-admitted. s > 1 only when
  //    the reported covariance is optimistic for the whole track; the threshold then follows the
  //    actual scatter, so the understatement inflates the covariance (chi2/dof) instead of
  //    discarding most of the data.
  const floor = Math.min(candidates.length, minObservations);
  const currentStandardizedNormsSq = (all: FitProblem, theta: Params, set: readonly Candidate[]): number[] | null => {
    const lin = linearize(all, theta);
    return lin ? standardizedNormsSq(lin, [0, 0, 0, 0, 0, 0], candidates.map((c) => set.includes(c))) : null;
  };
  const robustScale = (normsSq: readonly number[]): number =>
    clamp(Math.sqrt(median(normsSq) / CHI2_3DOF_MEDIAN), 1, MAX_OUTLIER_NOISE_SCALE);
  let noiseScale = 1;
  if (candidates.length >= OUTLIER_REJECTION_MIN_OBSERVATIONS) {
    const allProblem = new FitProblem(model, candidates);
    const lin = linearize(allProblem, fit.result.theta);
    const lts = lin ? leastTrimmedSquaresStart(lin, candidates.length) : null;
    if (lts) noiseScale = robustScale(lts.normsSq);
    for (let round = 0; round < MAX_OUTLIER_ROUNDS; round++) {
      const fromLts = round === 0 && lts !== null;
      const normsSq = fromLts ? lts.normsSq : currentStandardizedNormsSq(allProblem, fit.result.theta, inliers);
      if (!normsSq) break;
      // The LTS scale is biased low (its subset is chosen for small residuals), so it is
      // re-estimated ONCE, by the same median rule, at the least-squares fit on the LTS-screened
      // set (which the screened-out outliers no longer drag), then frozen.
      if (round === 1 && lts !== null) noiseScale = robustScale(normsSq);
      const limit = threshold * noiseScale;
      const norms = normsSq.map(Math.sqrt);
      const order = candidates.map((_, i) => i).sort((a, b) => (norms[a] as number) - (norms[b] as number) || a - b);
      let keep = order.filter((i) => (norms[i] as number) <= limit);
      if (keep.length < floor) keep = order.slice(0, floor);
      const keepSet = new Set(keep);
      const next = candidates.filter((_, i) => keepSet.has(i));
      if (next.length === inliers.length && next.every((c, i) => c === inliers[i])) {
        // Nothing to drop at the LTS fit: still verify against the least-squares fit.
        if (fromLts) continue;
        break;
      }
      const refit = fitSet(next, fromLts ? lts.theta : fit.result.theta);
      if (!refit) break;
      inliers = next;
      fit = refit;
    }
  }

  const outliers = candidates.filter((c) => !inliers.includes(c)).map((c) => c.obs);
  if (outliers.length > 0) {
    rejected.push(...outliers);
    qualityFlags.push("outliers-rejected");
    const limitText =
      noiseScale > 1
        ? `${(threshold * noiseScale).toFixed(2)} sigma (${threshold} sigma x robust noise scale ${noiseScale.toFixed(2)})`
        : `${threshold} sigma`;
    warnings.push(
      `Rejected ${outliers.length} outlier ball position(s) with whitened residual above ${limitText} (sequence ${seqList(outliers)}).`,
    );
  }

  const { problem, result } = fit;
  const theta = result.theta;
  const jac = problem.jacobian(theta);
  const r = problem.residuals(theta);
  const pred = problem.predict(theta);
  if (!jac || !r || !pred) {
    return failure("Launch fit failed: the trajectory model produced no finite prediction.", [...qualityFlags, "fit-failed"], warnings);
  }
  const information = normalMatrix(jac);
  const baseCovariance = invertSpd(information);
  if (!baseCovariance) {
    return failure(
      "Launch fit is degenerate (singular normal matrix); position and velocity are not jointly observable.",
      [...qualityFlags, "fit-degenerate"],
      warnings,
    );
  }

  const chiSquare = sumSquares(r);
  const dof = 3 * inliers.length - 6;
  const covarianceScale = dof > 0 ? Math.max(1, chiSquare / dof) : 1;
  const covariance6 = baseCovariance.map((row) => row.map((v) => v * covarianceScale));
  if (dof > 0 && chiSquare / dof > NOISE_UNDERSTATED_CHI2_PER_DOF) {
    qualityFlags.push("position-noise-understated");
    warnings.push(
      `Ball-position residuals exceed the reported noise (chi^2/dof = ${(chiSquare / dof).toFixed(1)}); launch uncertainty was inflated accordingly.`,
    );
  }

  const residualNormsM = inliers.map((c, i) => {
    const p = pred[i] as Vec3;
    return Math.hypot(p.x - c.obs.positionM.x, p.y - c.obs.positionM.y, p.z - c.obs.positionM.z);
  });
  const rmsResidualM = Math.sqrt(residualNormsM.reduce((s, e) => s + e * e, 0) / residualNormsM.length);
  const maxResidualM = Math.max(...residualNormsM);

  const n = inliers.length;
  if (n === 2) qualityFlags.push("minimal-two-frame-fit");
  if (n < minObservations) {
    qualityFlags.push("below-min-observations");
    warnings.push(`Launch fit used ${n} ball position(s); at least ${minObservations} are expected.`);
  }
  if (n < HIGH_CONFIDENCE_MIN_OBSERVATIONS) warnings.push(INSUFFICIENT_FRAMES_WARNING);
  if (!result.converged) {
    qualityFlags.push("fit-not-converged");
    warnings.push(`Launch fit did not converge within ${maxIterations} iterations.`);
  }

  const positionM = toVec(theta, 0);
  const velocityMps = toVec(theta, 3);
  if (!isFiniteVec3(positionM) || !isFiniteVec3(velocityMps) || !covariance6.every((row) => row.every(Number.isFinite))) {
    return failure("Launch fit produced non-finite values.", [...qualityFlags, "fit-failed"], warnings);
  }

  const diagnostics: LaunchFitDiagnostics = {
    model: model.id,
    observationCount: candidates.length,
    inlierCount: n,
    timeSpanS: (inliers[n - 1] as Candidate).obs.timestampS - (inliers[0] as Candidate).obs.timestampS,
    rmsResidualM,
    maxResidualM,
    iterations: result.iterations,
    converged: result.converged,
    positionCovarianceM2: subMatrix(covariance6, 0, 3),
    velocityCovarianceM2PerS2: subMatrix(covariance6, 3, 3),
  };

  return {
    ok: true,
    positionM,
    velocityMps,
    covariance6,
    referenceTimeS,
    diagnostics,
    inlierSequences: inliers.map((c) => c.obs.sequence),
    rejectedSequences: rejected.map((o) => o.sequence).sort((a, b) => a - b),
    qualityFlags: uniqueStrings(qualityFlags),
    warnings: uniqueStrings(warnings),
    chiSquare,
    degreesOfFreedom: dof,
    covarianceScale,
    outlierNoiseScale: noiseScale,
  };
}
