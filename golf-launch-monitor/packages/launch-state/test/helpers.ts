import { createRng, matMul, sampleMultivariateNormal, transpose } from "@glm/core-math";
import type { Rng } from "@glm/core-math";
import type { BallPosition3dObservation, Vec3 } from "@glm/shared-types";

export const G = 9.80665;

/** Random rotation matrix from a normalised Gaussian quaternion (uniform on SO(3)). */
export function randomRotation(rng: Rng): number[][] {
  let w = rng.normal();
  let x = rng.normal();
  let y = rng.normal();
  let z = rng.normal();
  const n = Math.hypot(w, x, y, z);
  w /= n;
  x /= n;
  y /= n;
  z /= n;
  return [
    [1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y)],
    [2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x)],
    [2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y)],
  ];
}

/** R diag(s^2) R^T: an anisotropic SPD covariance (stereo depth noise is typically largest). */
export function rotatedCovariance(rng: Rng, sigmas: readonly [number, number, number]): number[][] {
  const r = randomRotation(rng);
  const d = [
    [sigmas[0] ** 2, 0, 0],
    [0, sigmas[1] ** 2, 0],
    [0, 0, sigmas[2] ** 2],
  ];
  const c = matMul(matMul(r, d), transpose(r));
  return c.map((row, i) => row.map((_, j) => 0.5 * ((c[i] as number[])[j] as number) + 0.5 * ((c[j] as number[])[i] as number)));
}

export function gravityTruth(p0: Vec3, v0: Vec3, t: number): Vec3 {
  return { x: p0.x + v0.x * t, y: p0.y + v0.y * t, z: p0.z + v0.z * t - 0.5 * G * t * t };
}

export type SyntheticTrack = {
  readonly observations: BallPosition3dObservation[];
  readonly p0: Vec3;
  readonly v0: Vec3;
  readonly t0: number;
};

/**
 * Noisy gravity-only ball positions generated IN THE TEST with a seeded RNG. Each observation
 * gets its own anisotropic covariance and noise drawn from exactly that covariance, so the
 * reported noise is honest and the fit covariance should be calibrated.
 */
export function syntheticTrack(options: {
  readonly seed: number;
  readonly count: number;
  readonly frameIntervalS?: number;
  readonly t0?: number;
  readonly p0?: Vec3;
  readonly v0?: Vec3;
  readonly sigmasM?: readonly [number, number, number];
  readonly noise?: boolean;
}): SyntheticTrack {
  const rng = createRng(options.seed);
  const dt = options.frameIntervalS ?? 0.002;
  const t0 = options.t0 ?? 10;
  const p0 = options.p0 ?? { x: 0.05, y: -0.01, z: 0.02 };
  const v0 = options.v0 ?? { x: 68, y: 2.4, z: 13.5 };
  const sigmas = options.sigmasM ?? [0.0015, 0.002, 0.004];
  const observations: BallPosition3dObservation[] = [];
  for (let i = 0; i < options.count; i++) {
    const t = t0 + i * dt;
    const truth = gravityTruth(p0, v0, t - t0);
    const cov = rotatedCovariance(rng, sigmas);
    const noise = options.noise === false ? [0, 0, 0] : sampleMultivariateNormal(rng, [0, 0, 0], cov);
    observations.push({
      kind: "ball-position-3d",
      sensorId: "test-stereo",
      sequence: i,
      timestampS: t,
      frameIndex: i,
      positionM: { x: truth.x + (noise[0] as number), y: truth.y + (noise[1] as number), z: truth.z + (noise[2] as number) },
      covarianceM2: cov,
      reprojectionErrorPx: 0.3,
      detectionConfidence: 0.95,
      cameraIds: ["left", "right"],
    });
  }
  return { observations, p0, v0, t0 };
}
