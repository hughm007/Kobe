import { clamp } from "@glm/core-math";
import type {
  BallAddressObservation,
  CalibrationStatus,
  ConfidenceFactor,
  DataOrigin,
  LaunchFitDiagnostics,
  SensorHealth,
  SpinMode,
  Validity,
} from "@glm/shared-types";
import { uniqueStrings } from "./constants";

/**
 * Confidence and validity model.
 *
 * overallConfidence = weighted geometric mean of factor scores, prod(s_i ^ (w_i / sum w)).
 * A geometric mean is used (not arithmetic) so that one very weak link drags the whole launch
 * state down instead of being averaged away; a 0-score factor with weight > 0 forces 0.
 *
 * validity:
 * - "invalid"     if any factor is blocking, or overall < CONFIDENCE_INVALID_BELOW;
 * - "provisional" if overall < CONFIDENCE_VALID_AT_OR_ABOVE, or spin was not measured, or the
 *                 data are manually entered (a manual shot is never a validated measurement);
 * - "valid"       otherwise.
 *
 * All thresholds, weights and score ramps below are PROVISIONAL engineering choices. They
 * are not derived from reference data yet and must be re-tuned against the validation dataset.
 */

/** Overall confidence below this: the launch state is rejected. */
export const CONFIDENCE_INVALID_BELOW = 0.35;
/** Overall confidence at or above this (with measured spin, non-manual data): valid. */
export const CONFIDENCE_VALID_AT_OR_ABOVE = 0.7;
/** A non-blocking factor scoring below this surfaces its detail as a warning. */
export const FACTOR_WARNING_BELOW = 0.7;

export const CONFIDENCE_THRESHOLDS = Object.freeze({
  invalidBelow: CONFIDENCE_INVALID_BELOW,
  validAtOrAbove: CONFIDENCE_VALID_AT_OR_ABOVE,
  factorWarningBelow: FACTOR_WARNING_BELOW,
});

/** Relative weights of the standard factors (provisional). */
export const FACTOR_WEIGHTS = Object.freeze({
  calibration: 1.5,
  fitQuality: 2,
  observationCount: 1,
  trigger: 0.5,
  ballZone: 1,
  sensorHealth: 1,
  spinQuality: 1.5,
});

export const SYNC_DRIFT_WARNING = "Camera synchronization drift detected; launch direction may be unreliable.";
export const OUTSIDE_HITTING_ZONE_MESSAGE = "Ball was outside calibrated hitting zone.";
export const MULTIPLE_BALLS_MESSAGE = "Multiple balls detected in the hitting zone.";

export type ConfidenceAggregate = {
  readonly overallConfidence: number;
  readonly validity: Validity;
  readonly warnings: string[];
  readonly rejectionReasons: string[];
};

function factor(
  id: string,
  label: string,
  score: number,
  weight: number,
  detail: string,
  blocking = false,
): ConfidenceFactor {
  return { id, label, score: clamp(score, 0, 1), weight, detail, blocking };
}

function validateFactor(f: ConfidenceFactor): void {
  if (!(Number.isFinite(f.score) && f.score >= 0 && f.score <= 1)) {
    throw new Error(`aggregateConfidence: factor "${f.id}" score must be in [0, 1], got ${f.score}`);
  }
  if (!(Number.isFinite(f.weight) && f.weight >= 0)) {
    throw new Error(`aggregateConfidence: factor "${f.id}" weight must be finite and >= 0, got ${f.weight}`);
  }
}

export function aggregateConfidence(
  factors: readonly ConfidenceFactor[],
  context: { readonly spinMode: SpinMode; readonly dataOrigin: DataOrigin },
): ConfidenceAggregate {
  factors.forEach(validateFactor);
  const warnings: string[] = [];
  const rejectionReasons: string[] = [];

  const weighted = factors.filter((f) => f.weight > 0);
  const totalWeight = weighted.reduce((s, f) => s + f.weight, 0);
  let overall: number;
  if (totalWeight <= 0) {
    overall = 0;
    rejectionReasons.push("No confidence evidence was supplied for this launch state.");
  } else if (weighted.some((f) => f.score === 0)) {
    overall = 0;
  } else {
    overall = Math.exp(weighted.reduce((s, f) => s + f.weight * Math.log(f.score), 0) / totalWeight);
  }
  overall = clamp(overall, 0, 1);

  for (const f of factors) {
    if (f.blocking) rejectionReasons.push(f.detail);
    else if (f.weight > 0 && f.score < FACTOR_WARNING_BELOW) warnings.push(f.detail);
  }

  let validity: Validity;
  if (factors.some((f) => f.blocking)) {
    validity = "invalid";
  } else if (overall < CONFIDENCE_INVALID_BELOW) {
    validity = "invalid";
    if (totalWeight > 0) {
      const weakest = weighted.slice().sort((a, b) => a.score - b.score)[0] as ConfidenceFactor;
      rejectionReasons.push(
        `Overall launch confidence ${overall.toFixed(2)} is below the minimum ${CONFIDENCE_INVALID_BELOW} (weakest factor: ${weakest.label} - ${weakest.detail})`,
      );
    }
  } else if (overall < CONFIDENCE_VALID_AT_OR_ABOVE || context.spinMode !== "measured" || context.dataOrigin === "manual") {
    validity = "provisional";
    if (context.dataOrigin === "manual") warnings.push("Manually entered launch data is provisional and never a validated measurement.");
  } else {
    validity = "valid";
  }

  return {
    overallConfidence: overall,
    validity,
    warnings: uniqueStrings(warnings),
    rejectionReasons: uniqueStrings(rejectionReasons),
  };
}

// ---------------------------------------------------------------------------
// Factor builders
// ---------------------------------------------------------------------------

/**
 * Calibration status. Red is blocking for live/replay data. "none" is acceptable only for
 * synthetic/manual origin (those values do not pass through a calibrated sensor).
 */
export function calibrationFactor(status: CalibrationStatus, dataOrigin: DataOrigin): ConfidenceFactor {
  const id = "calibration";
  const label = "Calibration";
  const w = FACTOR_WEIGHTS.calibration;
  const sensorData = dataOrigin === "live" || dataOrigin === "replay";
  switch (status) {
    case "green":
      return factor(id, label, 1, w, "Calibration verified (green).");
    case "yellow":
      return factor(id, label, 0.6, w, "Calibration is marginal (yellow); recalibration recommended.");
    case "red":
      return sensorData
        ? factor(id, label, 0, w, "Calibration failed (red); recalibrate before measuring shots.", true)
        : factor(id, label, 0.5, w, `Calibration is red, but ${dataOrigin} data does not depend on it.`);
    case "none":
      return sensorData
        ? factor(id, label, 0, w, "No calibration; measured shots cannot be trusted without one.", true)
        : factor(id, label, 1, w, `No calibration required for ${dataOrigin} data.`);
  }
}

/**
 * Provisional fit-quality ramps (engineering judgement, not sourced or fit to data; revisit with
 * Phase 2 stereo measurements). Residual: ~3 mm RMS is the assumed target for good stereo
 * triangulation at 1-2 m; 20 mm means the trajectory model or the detections are wrong. Velocity sigma
 * sqrt(trace(Cov_v)): 0.2 m/s (~0.45 mph) is good, 1.5 m/s (~3.4 mph) is poor.
 * chi2/dof: up to 4 (residual scatter <= 2x the reported noise; the fit's
 * "position-noise-understated" flag starts above it) is not penalised; 9 (3x, the fit's cap on
 * the robust outlier noise scale) is poor. A large chi2/dof means the residuals are not
 * explained by the reported noise (unmodelled error or retained outliers), which the
 * chi2/dof covariance inflation alone does not make trustworthy.
 */
export const FIT_QUALITY_THRESHOLDS = Object.freeze({
  goodRmsResidualM: 0.003,
  poorRmsResidualM: 0.02,
  goodVelocitySigmaMps: 0.2,
  poorVelocitySigmaMps: 1.5,
  minInlierFraction: 0.6,
  goodChiSquarePerDof: 4,
  poorChiSquarePerDof: 9,
});

/** Goodness-of-fit statistics of a launch fit (LaunchFitSuccess carries both). */
export type FitStatistics = { readonly chiSquare: number; readonly degreesOfFreedom: number };

/** 1 at or below `good`, linearly down to 0.3 at `poor`, then 0.3 * poor / x (floor 0.1). */
function ramp(x: number, good: number, poor: number): number {
  if (!Number.isFinite(x)) return 0.1;
  if (x <= good) return 1;
  if (x >= poor) return Math.max(0.1, (0.3 * poor) / x);
  return 1 - (0.7 * (x - good)) / (poor - good);
}

/**
 * Launch-fit quality from the contract diagnostics and, when given (pass the LaunchFitSuccess),
 * the whitened chi-square: min of the residual, velocity-sigma, inlier and chi2/dof scores,
 * halved if the fit did not converge.
 */
export function fitQualityFactor(diagnostics: LaunchFitDiagnostics, statistics?: FitStatistics | null): ConfidenceFactor {
  const t = FIT_QUALITY_THRESHOLDS;
  const velCov = diagnostics.velocityCovarianceM2PerS2;
  let trace = 0;
  for (let i = 0; i < 3; i++) trace += ((velCov[i] as ReadonlyArray<number> | undefined)?.[i] as number | undefined) ?? Number.NaN;
  const velocitySigma = Math.sqrt(trace);
  const sResidual = ramp(diagnostics.rmsResidualM, t.goodRmsResidualM, t.poorRmsResidualM);
  const sVelocity = ramp(velocitySigma, t.goodVelocitySigmaMps, t.poorVelocitySigmaMps);
  const inlierFraction = diagnostics.observationCount > 0 ? diagnostics.inlierCount / diagnostics.observationCount : 0;
  const sInliers = inlierFraction >= 0.8 ? 1 : inlierFraction >= t.minInlierFraction ? 0.7 : 0.4;
  const sConverged = diagnostics.converged ? 1 : 0.5;
  const chi2PerDof =
    statistics && statistics.degreesOfFreedom > 0 ? statistics.chiSquare / statistics.degreesOfFreedom : null;
  const sNoise = chi2PerDof === null ? 1 : ramp(chi2PerDof, t.goodChiSquarePerDof, t.poorChiSquarePerDof);
  const score = clamp(Math.min(sResidual, sVelocity, sInliers, sNoise) * sConverged, 0.05, 1);
  const parts = [
    `RMS residual ${(diagnostics.rmsResidualM * 1000).toFixed(1)} mm`,
    `velocity sigma ${Number.isFinite(velocitySigma) ? velocitySigma.toFixed(2) : "unknown"} m/s`,
    ...(chi2PerDof === null ? [] : [`chi^2/dof ${Number.isFinite(chi2PerDof) ? chi2PerDof.toFixed(1) : "unknown"}`]),
    `${diagnostics.inlierCount}/${diagnostics.observationCount} inliers`,
    diagnostics.converged ? "converged" : "not converged",
  ];
  const prefix = score < FACTOR_WARNING_BELOW ? "Launch fit quality is low" : "Launch fit";
  return factor("fit-quality", "Launch fit quality", score, FACTOR_WEIGHTS.fitQuality, `${prefix}: ${parts.join(", ")}.`);
}

/** Post-impact ball positions used by the fit (inliers). */
export function observationCountFactor(count: number): ConfidenceFactor {
  const id = "observation-count";
  const label = "Post-impact frames";
  const w = FACTOR_WEIGHTS.observationCount;
  if (!Number.isFinite(count) || count < 2) {
    return factor(id, label, 0, w, "Fewer than two post-impact ball positions; launch state cannot be measured.", true);
  }
  if (count >= 6) return factor(id, label, 1, w, `${count} post-impact ball positions.`);
  const score = count === 2 ? 0.35 : count === 3 ? 0.5 : count === 4 ? 0.65 : 0.8;
  return factor(id, label, score, w, "Insufficient post-impact frames for high-confidence ball speed.");
}

/** Impact trigger confidence; null = no trigger observed (impact time inferred from motion). */
export function triggerFactor(confidence: number | null): ConfidenceFactor {
  const id = "trigger";
  const label = "Impact trigger";
  const w = FACTOR_WEIGHTS.trigger;
  if (confidence === null) return factor(id, label, 0.5, w, "No impact trigger observed; impact time inferred from ball motion.");
  if (!(Number.isFinite(confidence) && confidence >= 0 && confidence <= 1)) {
    throw new Error(`triggerFactor: confidence must be in [0, 1], got ${confidence}`);
  }
  // Floor at 0.3: a weak trigger alone never zeroes a launch the ball positions support.
  const score = 0.3 + 0.7 * confidence;
  const detail =
    score < FACTOR_WARNING_BELOW
      ? `Impact trigger confidence is low (${confidence.toFixed(2)}).`
      : `Impact trigger confidence ${confidence.toFixed(2)}.`;
  return factor(id, label, score, w, detail);
}

/** Ball-at-address verification (Stage A). Outside the zone or multiple balls is blocking. */
export function ballZoneFactor(address: BallAddressObservation | null): ConfidenceFactor {
  const id = "ball-zone";
  const label = "Ball at address";
  const w = FACTOR_WEIGHTS.ballZone;
  if (address === null) return factor(id, label, 0.6, w, "Ball position at address was not verified.");
  if (address.ballCount > 1) return factor(id, label, 0, w, MULTIPLE_BALLS_MESSAGE, true);
  if (!address.inHittingZone) return factor(id, label, 0, w, OUTSIDE_HITTING_ZONE_MESSAGE, true);
  if (address.ballCount === 0) return factor(id, label, 0.4, w, "No ball was detected at address before impact.");
  if (!address.stationary) return factor(id, label, 0.5, w, "Ball was not stationary at address.");
  const c = Number.isFinite(address.confidence) ? clamp(address.confidence, 0, 1) : 0;
  const score = 0.5 + 0.5 * c;
  return factor(
    id,
    label,
    score,
    w,
    score < FACTOR_WARNING_BELOW ? "Ball at address was detected with low confidence." : "Ball verified stationary in the hitting zone.",
  );
}

const METRIC_SCORE = { ok: 1, unknown: 0.9, warn: 0.7, fail: 0.4 } as const;

/** Sensor health. Failed/disconnected sensors are blocking; sync drift gets the product warning. */
export function sensorHealthFactor(health: SensorHealth | null): ConfidenceFactor {
  const id = "sensor-health";
  const label = "Sensor health";
  const w = FACTOR_WEIGHTS.sensorHealth;
  if (health === null) return factor(id, label, 0.6, w, "Sensor health is unknown for this shot.");
  if (health.status === "failed" || health.status === "disconnected") {
    return factor(id, label, 0, w, `Sensor ${health.sensorId} is ${health.status}; shot cannot be measured.`, true);
  }
  const messages: string[] = [];
  let score = health.status === "degraded" ? 0.6 : 1;
  const syncDrift = health.metrics.find((m) => m.id === "sync-drift" && (m.status === "warn" || m.status === "fail"));
  if (syncDrift) {
    messages.push(SYNC_DRIFT_WARNING);
    score = Math.min(score, syncDrift.status === "fail" ? 0.4 : 0.6);
  }
  for (const m of health.metrics) {
    score = Math.min(score, METRIC_SCORE[m.status]);
    if (m !== syncDrift && (m.status === "warn" || m.status === "fail")) messages.push(`${m.label}: ${m.status} (${m.detail}).`);
  }
  if (health.status === "degraded" && messages.length === 0) messages.push(`Sensor ${health.sensorId} is degraded.`);
  const detail = messages.length > 0 ? messages.join(" ") : "All sensor health checks passed.";
  return factor(id, label, score, w, detail);
}
