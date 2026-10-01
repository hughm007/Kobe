import type { Vec3 } from "@glm/shared-types";

export const ZERO: Vec3 = Object.freeze({ x: 0, y: 0, z: 0 });
export const UNIT_X: Vec3 = Object.freeze({ x: 1, y: 0, z: 0 });
export const UNIT_Y: Vec3 = Object.freeze({ x: 0, y: 1, z: 0 });
export const UNIT_Z: Vec3 = Object.freeze({ x: 0, y: 0, z: 1 });

export function vec3(x: number, y: number, z: number): Vec3 {
  return { x, y, z };
}

export function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function scale(a: Vec3, s: number): Vec3 {
  return { x: a.x * s, y: a.y * s, z: a.z * s };
}

/** a + b * s */
export function addScaled(a: Vec3, b: Vec3, s: number): Vec3 {
  return { x: a.x + b.x * s, y: a.y + b.y * s, z: a.z + b.z * s };
}

export function negate(a: Vec3): Vec3 {
  return { x: -a.x, y: -a.y, z: -a.z };
}

export function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

/** Right-handed cross product a x b. */
export function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function normSq(a: Vec3): number {
  return a.x * a.x + a.y * a.y + a.z * a.z;
}

export function norm(a: Vec3): number {
  return Math.hypot(a.x, a.y, a.z);
}

/** Horizontal (XY-plane) magnitude. */
export function horizontalNorm(a: Vec3): number {
  return Math.hypot(a.x, a.y);
}

export function distance(a: Vec3, b: Vec3): number {
  return norm(sub(a, b));
}

/** Horizontal (XY-plane) distance between two points. */
export function horizontalDistance(a: Vec3, b: Vec3): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Unit vector in the direction of `a`, or null if |a| <= epsilon. Callers must handle the
 * degenerate case explicitly instead of receiving a silent NaN.
 */
export function normalize(a: Vec3, epsilon = 1e-12): Vec3 | null {
  const n = norm(a);
  if (!(n > epsilon)) return null;
  return { x: a.x / n, y: a.y / n, z: a.z / n };
}

export function lerp(a: Vec3, b: Vec3, t: number): Vec3 {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t };
}

export function isFiniteVec(a: Vec3): boolean {
  return Number.isFinite(a.x) && Number.isFinite(a.y) && Number.isFinite(a.z);
}

export function approxEqualVec(a: Vec3, b: Vec3, tolerance: number): boolean {
  return Math.abs(a.x - b.x) <= tolerance && Math.abs(a.y - b.y) <= tolerance && Math.abs(a.z - b.z) <= tolerance;
}

export function toArray(a: Vec3): [number, number, number] {
  return [a.x, a.y, a.z];
}

export function fromArray(values: ArrayLike<number>, offset = 0): Vec3 {
  return { x: values[offset] as number, y: values[offset + 1] as number, z: values[offset + 2] as number };
}

/**
 * Rotate vector `v` about unit axis `axis` by `angleRad` using the right-hand rule
 * (Rodrigues' rotation formula).
 */
export function rotateAboutAxis(v: Vec3, axis: Vec3, angleRad: number): Vec3 {
  const c = Math.cos(angleRad);
  const s = Math.sin(angleRad);
  const kxv = cross(axis, v);
  const kdv = dot(axis, v);
  return {
    x: v.x * c + kxv.x * s + axis.x * kdv * (1 - c),
    y: v.y * c + kxv.y * s + axis.y * kdv * (1 - c),
    z: v.z * c + kxv.z * s + axis.z * kdv * (1 - c),
  };
}
