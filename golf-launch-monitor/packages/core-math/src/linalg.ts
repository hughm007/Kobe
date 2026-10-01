import type { Matrix, Vec3 } from "@glm/shared-types";

/** Mutable dense row-major matrix used inside numerical routines. */
export type MutableMatrix = number[][];

export function zeros(rows: number, cols: number): MutableMatrix {
  return Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
}

export function identity(n: number): MutableMatrix {
  const m = zeros(n, n);
  for (let i = 0; i < n; i++) (m[i] as number[])[i] = 1;
  return m;
}

export function cloneMatrix(a: Matrix): MutableMatrix {
  return a.map((row) => row.slice());
}

export function rows(a: Matrix): number {
  return a.length;
}

export function cols(a: Matrix): number {
  return a.length === 0 ? 0 : (a[0] as ReadonlyArray<number>).length;
}

function at(a: Matrix, i: number, j: number): number {
  return (a[i] as ReadonlyArray<number>)[j] as number;
}

export function transpose(a: Matrix): MutableMatrix {
  const r = rows(a);
  const c = cols(a);
  const out = zeros(c, r);
  for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) (out[j] as number[])[i] = at(a, i, j);
  return out;
}

export function matMul(a: Matrix, b: Matrix): MutableMatrix {
  const r = rows(a);
  const n = cols(a);
  const c = cols(b);
  if (rows(b) !== n) throw new Error(`matMul: inner dimensions differ (${n} vs ${rows(b)})`);
  const out = zeros(r, c);
  for (let i = 0; i < r; i++) {
    const outRow = out[i] as number[];
    for (let k = 0; k < n; k++) {
      const aik = at(a, i, k);
      if (aik === 0) continue;
      const bRow = b[k] as ReadonlyArray<number>;
      for (let j = 0; j < c; j++) outRow[j] = (outRow[j] as number) + aik * (bRow[j] as number);
    }
  }
  return out;
}

export function matVec(a: Matrix, v: ReadonlyArray<number>): number[] {
  const r = rows(a);
  const c = cols(a);
  if (v.length !== c) throw new Error(`matVec: dimension mismatch (${c} vs ${v.length})`);
  const out = new Array<number>(r).fill(0);
  for (let i = 0; i < r; i++) {
    let s = 0;
    const row = a[i] as ReadonlyArray<number>;
    for (let j = 0; j < c; j++) s += (row[j] as number) * (v[j] as number);
    out[i] = s;
  }
  return out;
}

export function addMatrices(a: Matrix, b: Matrix): MutableMatrix {
  return a.map((row, i) => row.map((v, j) => v + at(b, i, j)));
}

export function scaleMatrix(a: Matrix, s: number): MutableMatrix {
  return a.map((row) => row.map((v) => v * s));
}

/** (A + A^T) / 2, to remove round-off asymmetry from covariance matrices. */
export function symmetrize(a: Matrix): MutableMatrix {
  const n = rows(a);
  const out = zeros(n, n);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) (out[i] as number[])[j] = 0.5 * (at(a, i, j) + at(a, j, i));
  return out;
}

/** Extract the square block [start, start+size) x [start, start+size). */
export function subMatrix(a: Matrix, start: number, size: number): MutableMatrix {
  const out = zeros(size, size);
  for (let i = 0; i < size; i++) for (let j = 0; j < size; j++) (out[i] as number[])[j] = at(a, start + i, start + j);
  return out;
}

/**
 * Cholesky factorisation A = L L^T for a symmetric positive-definite matrix.
 * Returns null if A is not (numerically) positive definite.
 */
export function cholesky(a: Matrix): MutableMatrix | null {
  const n = rows(a);
  const l = zeros(n, n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = at(a, i, j);
      for (let k = 0; k < j; k++) sum -= at(l, i, k) * at(l, j, k);
      if (i === j) {
        if (!(sum > 0) || !Number.isFinite(sum)) return null;
        (l[i] as number[])[i] = Math.sqrt(sum);
      } else {
        (l[i] as number[])[j] = sum / at(l, j, j);
      }
    }
  }
  return l;
}

/** Solve L L^T x = b given the Cholesky factor L. */
export function solveCholesky(l: Matrix, b: ReadonlyArray<number>): number[] {
  const n = rows(l);
  const y = new Array<number>(n).fill(0);
  for (let i = 0; i < n; i++) {
    let s = b[i] as number;
    for (let k = 0; k < i; k++) s -= at(l, i, k) * (y[k] as number);
    y[i] = s / at(l, i, i);
  }
  const x = new Array<number>(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = y[i] as number;
    for (let k = i + 1; k < n; k++) s -= at(l, k, i) * (x[k] as number);
    x[i] = s / at(l, i, i);
  }
  return x;
}

/** Inverse of a symmetric positive-definite matrix, or null if not positive definite. */
export function invertSpd(a: Matrix): MutableMatrix | null {
  const l = cholesky(a);
  if (!l) return null;
  const n = rows(a);
  const inv = zeros(n, n);
  for (let j = 0; j < n; j++) {
    const e = new Array<number>(n).fill(0);
    e[j] = 1;
    const col = solveCholesky(l, e);
    for (let i = 0; i < n; i++) (inv[i] as number[])[j] = col[i] as number;
  }
  return symmetrize(inv);
}

/**
 * Solve A x = b by Gaussian elimination with partial pivoting.
 * Returns null if A is singular to working precision.
 */
export function solveLinear(a: Matrix, b: ReadonlyArray<number>): number[] | null {
  const n = rows(a);
  const m = cloneMatrix(a);
  const x = b.slice() as number[];
  const scaleRef = Math.max(1e-300, ...a.flatMap((r) => r.map((v) => Math.abs(v))));
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(at(m, r, col)) > Math.abs(at(m, pivot, col))) pivot = r;
    if (Math.abs(at(m, pivot, col)) <= 1e-13 * scaleRef) return null;
    if (pivot !== col) {
      [m[col], m[pivot]] = [m[pivot] as number[], m[col] as number[]];
      [x[col], x[pivot]] = [x[pivot] as number, x[col] as number];
    }
    const pivotRow = m[col] as number[];
    for (let r = col + 1; r < n; r++) {
      const row = m[r] as number[];
      const factor = (row[col] as number) / (pivotRow[col] as number);
      if (factor === 0) continue;
      for (let c = col; c < n; c++) row[c] = (row[c] as number) - factor * (pivotRow[c] as number);
      x[r] = (x[r] as number) - factor * (x[col] as number);
    }
  }
  for (let r = n - 1; r >= 0; r--) {
    let s = x[r] as number;
    const row = m[r] as number[];
    for (let c = r + 1; c < n; c++) s -= (row[c] as number) * (x[c] as number);
    x[r] = s / (row[r] as number);
  }
  return x;
}

/** General matrix inverse via column-wise solves, or null if singular. */
export function invert(a: Matrix): MutableMatrix | null {
  const n = rows(a);
  const inv = zeros(n, n);
  for (let j = 0; j < n; j++) {
    const e = new Array<number>(n).fill(0);
    e[j] = 1;
    const col = solveLinear(a, e);
    if (!col) return null;
    for (let i = 0; i < n; i++) (inv[i] as number[])[j] = col[i] as number;
  }
  return inv;
}

/** Multiply a 3x3 matrix by a Vec3. */
export function mat3MulVec3(m: Matrix, v: Vec3): Vec3 {
  const r = matVec(m, [v.x, v.y, v.z]);
  return { x: r[0] as number, y: r[1] as number, z: r[2] as number };
}

/** Diagonal of a square matrix. */
export function diagonal(a: Matrix): number[] {
  return a.map((row, i) => row[i] as number);
}

/** J * C * J^T: propagate a covariance C through a linear(ised) map with Jacobian J. */
export function propagateCovariance(jacobian: Matrix, covariance: Matrix): MutableMatrix {
  return symmetrize(matMul(matMul(jacobian, covariance), transpose(jacobian)));
}
