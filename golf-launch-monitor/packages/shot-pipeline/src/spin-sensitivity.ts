import { cholesky, sub } from "@glm/core-math";
import {
  angularVelocityFromSpin,
  fitLaunchState,
  GENERIC_FALLBACK_RELATIVE_SIGMA,
  GENERIC_SPIN_PARAMETER,
  type LaunchFitSuccess,
  type LaunchValueAdjustment,
  type SpinResolution,
  type TrajectoryModel,
} from "@glm/launch-state";
import type { BallPosition3dObservation, Matrix, Vec3 } from "@glm/shared-types";

/**
 * How the drag/lift refit's launch state depends on a spin that was NOT measured.
 *
 * The refit (process.ts) needs a spin vector for its Magnus term. Over a 20-60 ms capture
 * window ~2 g of lift moves the fitted vertical velocity by ~0.1-0.35 deg of launch angle, so an
 * estimated (club / player model), assumed (generic fallback) or absent (zero) spin biases the
 * "measured" ball speed and launch angles by far more than the fit covariance says. This module
 * refits the same inlier observations under alternative spin hypotheses and turns the spread of
 * the fitted state into extra covariance (sigma-point style), so the reported intervals include
 * the spin assumption:
 * - spin available (estimated / fallback): sigma points omega_c +- L_k (L = chol(Cov_omega)),
 *   weight 1/2 each (~ J Cov_omega J^T), plus the zero-spin hypothesis with weight 1 (model choice:
 *   the prior can be wrong by more than its sigma, e.g. a wedge prior on a driver; the truth then
 *   lies between omega_c and 0 and stays inside the interval);
 * - spin unavailable (refit assumed omega = 0): backspin of spin parameter
 *   UNAVAILABLE_SPIN_PARAMETER at tilts 0 and +-UNAVAILABLE_SPIN_TILT_DEG, weight 1/3 each.
 * Measured spin is not handled here (its own covariance is small and already in the fit input).
 */

/** Upper plausible spin parameter S = omega r / v for the spin-unavailable hypotheses: the generic
 * fallback's S plus two of its relative sigmas (provisional; engineering bound, not fitted). */
export const UNAVAILABLE_SPIN_PARAMETER = GENERIC_SPIN_PARAMETER * (1 + 2 * GENERIC_FALLBACK_RELATIVE_SIGMA);
/** Spin-axis tilts of the spin-unavailable hypotheses, deg (provisional). */
export const UNAVAILABLE_SPIN_TILT_DEG = 30;
/** Outlier threshold for hypothesis refits: the central fit's inlier set is kept fixed. */
const FIXED_INLIERS_THRESHOLD_SIGMA = 1e9;

export const LAUNCH_FIT_SPIN_WARNING =
  "Launch speed and angles depend on the unmeasured spin through the drag/lift refit; their uncertainty includes that spin's uncertainty.";

type Hypothesis = { readonly omega: Vec3; readonly weight: number };

export type SpinSensitivityInput = {
  /** Every ball observation given to the central refit (its inliers are reused). */
  readonly observations: readonly BallPosition3dObservation[];
  /** The central refit (with the spin the pipeline resolved, or zero). */
  readonly central: LaunchFitSuccess;
  /** The spin resolution that fed the central refit. */
  readonly spin: SpinResolution;
  readonly ballRadiusM: number;
  readonly trajectoryModelFor: (angularVelocityRadPerSec: Vec3) => TrajectoryModel;
  /** Same timestamp uncertainty as the central fit (LaunchFitOptions.timestampSigmaS). */
  readonly timestampSigmaS?: number;
};

function hypotheses(input: SpinSensitivityInput): Hypothesis[] {
  const omega = input.spin.angularVelocity.value;
  if (omega !== null) {
    const out: Hypothesis[] = [{ omega: { x: 0, y: 0, z: 0 }, weight: 1 }];
    const cov = input.spin.angularVelocity.uncertainty?.covariance;
    const l = cov ? cholesky(cov) : null;
    if (l) {
      for (let k = 0; k < 3; k++) {
        const col = { x: l[0]?.[k] ?? 0, y: l[1]?.[k] ?? 0, z: l[2]?.[k] ?? 0 };
        out.push({ omega: { x: omega.x + col.x, y: omega.y + col.y, z: omega.z + col.z }, weight: 0.5 });
        out.push({ omega: { x: omega.x - col.x, y: omega.y - col.y, z: omega.z - col.z }, weight: 0.5 });
      }
    }
    return out;
  }
  const v = input.central.velocityMps;
  const speed = Math.hypot(v.x, v.y, v.z);
  const spin = (UNAVAILABLE_SPIN_PARAMETER * speed) / input.ballRadiusM;
  const tilts = [0, UNAVAILABLE_SPIN_TILT_DEG, -UNAVAILABLE_SPIN_TILT_DEG];
  try {
    return tilts.map((t) => ({
      omega: angularVelocityFromSpin({ totalSpinRadPerSec: spin, spinAxisTiltRad: (t * Math.PI) / 180, velocity: v }),
      weight: 1 / tilts.length,
    }));
  } catch {
    // Vertical or zero launch velocity: no launch-direction frame, no meaningful hypothesis.
    return [];
  }
}

function addOuter(acc: number[][], d: Vec3, w: number): void {
  const a = [d.x, d.y, d.z];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) (acc[i] as number[])[j] = (acc[i]?.[j] ?? 0) + w * (a[i] as number) * (a[j] as number);
}

/**
 * Extra position/velocity covariance and provenance flags for a refit whose spin was not
 * measured (see module comment). Returns an empty adjustment for measured spin.
 */
export function launchFitSpinSensitivity(input: SpinSensitivityInput): LaunchValueAdjustment {
  const mode = input.spin.spinMode;
  if (mode === "measured") return {};
  const omega = input.spin.angularVelocity;
  const flags = [omega.value === null ? "launch-fit-assumes-zero-spin" : `launch-fit-uses-${omega.source}-spin`];
  const inliers = new Set(input.central.inlierSequences);
  const observations = input.observations.filter((o) => inliers.has(o.sequence));
  const posCov = [0, 1, 2].map(() => [0, 0, 0]);
  const velCov = [0, 1, 2].map(() => [0, 0, 0]);
  let failed = 0;
  const hs = hypotheses(input);
  for (const h of hs) {
    const fit = fitLaunchState(observations, {
      trajectoryModel: input.trajectoryModelFor(h.omega),
      referenceTimeS: input.central.referenceTimeS,
      outlierThresholdSigma: FIXED_INLIERS_THRESHOLD_SIGMA,
      timestampSigmaS: input.timestampSigmaS ?? 0,
    });
    if (!fit.ok) {
      failed += 1;
      continue;
    }
    addOuter(posCov, sub(fit.positionM, input.central.positionM), h.weight);
    addOuter(velCov, sub(fit.velocityMps, input.central.velocityMps), h.weight);
  }
  const complete = hs.length > 0 && failed === 0;
  if (!complete) flags.push("launch-fit-spin-sensitivity-incomplete");
  return {
    extraPositionCovarianceM2: posCov as Matrix,
    extraVelocityCovarianceM2PerS2: velCov as Matrix,
    qualityFlags: flags,
    // Without the full spread the interval may still be too narrow: say so in the confidence.
    ...(complete ? {} : { confidenceCap: 0.5 }),
  };
}

/** Merges per-value adjustments: lowest cap, summed extra covariance, all flags. */
export function mergeLaunchValueAdjustments(...parts: readonly LaunchValueAdjustment[]): LaunchValueAdjustment {
  const caps = parts.map((p) => p.confidenceCap).filter((c): c is number => c !== undefined);
  const sum = (key: "extraPositionCovarianceM2" | "extraVelocityCovarianceM2PerS2"): Matrix | undefined => {
    const ms = parts.map((p) => p[key]).filter((m): m is Matrix => m !== undefined);
    if (ms.length === 0) return undefined;
    return [0, 1, 2].map((i) => [0, 1, 2].map((j) => ms.reduce((s, m) => s + (m[i]?.[j] ?? 0), 0)));
  };
  const pos = sum("extraPositionCovarianceM2");
  const vel = sum("extraVelocityCovarianceM2PerS2");
  return {
    ...(caps.length > 0 ? { confidenceCap: Math.min(...caps) } : {}),
    ...(pos ? { extraPositionCovarianceM2: pos } : {}),
    ...(vel ? { extraVelocityCovarianceM2PerS2: vel } : {}),
    qualityFlags: [...new Set(parts.flatMap((p) => p.qualityFlags ?? []))],
  };
}
