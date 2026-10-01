/**
 * Test-local terrain and launch helpers. Not a terrain engine: just enough geometry to
 * exercise contact detection.
 */
import type { SurfaceProperties, TerrainQuery, Vec3 } from "@glm/shared-types";
import type { BallState } from "../src/index";

export const TEST_SURFACE: SurfaceProperties = Object.freeze({
  type: "fairway-normal",
  version: "test",
  firmness: 0.5,
  restitutionBase: 0.5,
  restitutionSpeedSlope: 0.01,
  restitutionMin: 0.1,
  slidingFriction: 0.4,
  rollingResistance: 0.1,
  moistureSoftness: 0,
  stimpFt: null,
  terminal: false,
  provisional: true,
});

/** Horizontal plane z = heightM. */
export function flatTerrain(heightM: number): TerrainQuery {
  const normal = Object.freeze({ x: 0, y: 0, z: 1 });
  return {
    id: "test-flat",
    version: "1",
    sample: () => ({ heightM, normal, surface: TEST_SURFACE }),
  };
}

/** Plane z = z0 + slopeX * x + slopeY * y with its exact unit normal. */
export function planeTerrain(z0: number, slopeX: number, slopeY: number): TerrainQuery {
  const n = Math.hypot(slopeX, slopeY, 1);
  const normal = Object.freeze({ x: -slopeX / n, y: -slopeY / n, z: 1 / n });
  return {
    id: "test-plane",
    version: "1",
    sample: (x: number, y: number) => ({ heightM: z0 + slopeX * x + slopeY * y, normal, surface: TEST_SURFACE }),
  };
}

export const MPS_PER_MPH = 0.44704;
export const METERS_PER_YARD = 0.9144;
export const RAD_PER_SEC_PER_RPM = (2 * Math.PI) / 60;
export const DEG = Math.PI / 180;

function normalize(a: Vec3): Vec3 {
  const n = Math.hypot(a.x, a.y, a.z);
  return { x: a.x / n, y: a.y / n, z: a.z / n };
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x };
}

/**
 * Spin vector per docs/coordinate-system.md §4.3:
 * omega = |omega| (cos(tilt) r_hat - sin(tilt) u_hat) + rifle * d_hat.
 */
export function spinVector(velocity: Vec3, spinRpm: number, tiltRad: number, rifleRpm = 0): Vec3 {
  const d = normalize(velocity);
  const r = normalize(cross(d, { x: 0, y: 0, z: 1 }));
  const u = cross(r, d);
  const w = spinRpm * RAD_PER_SEC_PER_RPM;
  const rifle = rifleRpm * RAD_PER_SEC_PER_RPM;
  const c = Math.cos(tiltRad);
  const s = Math.sin(tiltRad);
  return {
    x: w * (c * r.x - s * u.x) + rifle * d.x,
    y: w * (c * r.y - s * u.y) + rifle * d.y,
    z: w * (c * r.z - s * u.z) + rifle * d.z,
  };
}

/** Ball at the origin launched along +X (positive horizontal angle = left, +Y). */
export function launchState(speedMph: number, launchDeg: number, spinRpm: number, tiltDeg = 0, horizontalDeg = 0): BallState {
  const v = speedMph * MPS_PER_MPH;
  const a = launchDeg * DEG;
  const h = horizontalDeg * DEG;
  const velocityMps = { x: v * Math.cos(a) * Math.cos(h), y: v * Math.cos(a) * Math.sin(h), z: v * Math.sin(a) };
  return {
    positionM: { x: 0, y: 0, z: 0 },
    velocityMps,
    angularVelocityRadPerSec: spinVector(velocityMps, spinRpm, tiltDeg * DEG),
  };
}
