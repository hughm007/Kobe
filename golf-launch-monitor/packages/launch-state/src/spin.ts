import { cholesky, isFiniteVec, median, medianAbsoluteDeviation, norm } from "@glm/core-math";
import { MEASURED_SOURCES } from "@glm/shared-types";
import type {
  ClubCategory,
  ConfidenceFactor,
  Matrix,
  Measurement,
  MeasurementSource,
  SpinMode,
  SpinObservation,
  Vec3,
} from "@glm/shared-types";
import { FACTOR_WEIGHTS } from "./confidence";
import { DEG_PER_RAD, RAD_PER_DEG, RAD_PER_SEC_PER_RPM, RPM_PER_RAD_PER_SEC, uniqueStrings } from "./constants";
import { angularVelocityFromSpin, deriveSpinAxisTiltDeg, deriveTotalSpinRpm, launchDirectionFrame } from "./derive";
import { combineSources, isAvailable, makeMeasurement, unavailableMeasurement } from "./measurement";

/**
 * Spin resolution (docs/spin-measurement.md):
 *   MODE 1 measured  - a spin observation of this shot that passes the quality gate;
 *   MODE 2 estimated - from the player's own measured history, else from a per-club prior;
 *   MODE 3           - generic fallback ONLY if the user allowed it, otherwise unavailable.
 * Spin is never reported as measured when the gate fails, and estimated spin always carries
 * an estimated source label, a wide uncertainty and a warning. Values that also depend on the
 * launch velocity (the spin-vector direction; the generic-fallback magnitude) follow the
 * derived-value rules: combineSources([mode label, velocity source]) and min confidence, so a
 * synthetic or manual velocity yields a "synthetic" / "manual" spin vector.
 */

export type PlayerSpinHistoryEntry = {
  readonly clubCategory: ClubCategory;
  readonly ballSpeedMps: number;
  readonly totalSpinRadPerSec: number;
  readonly spinAxisTiltRad: number;
  readonly source: MeasurementSource;
};

export type SpinResolutionInput = {
  readonly spinObservations: readonly SpinObservation[];
  readonly velocity: Measurement<Vec3>;
  readonly clubCategory: ClubCategory | null;
  readonly playerSpinHistory: readonly PlayerSpinHistoryEntry[];
  readonly allowGenericFallback: boolean;
  /** Label for spin measured by this sensor stream, e.g. "measured-camera" or "synthetic". */
  readonly measuredSource: MeasurementSource;
};

export type SpinResolution = {
  readonly spinMode: SpinMode;
  readonly angularVelocity: Measurement<Vec3>;
  readonly totalSpinRpm: Measurement<number>;
  readonly spinAxisTiltDeg: Measurement<number>;
  readonly warnings: string[];
  readonly confidenceFactor: ConfidenceFactor;
};

/**
 * Quality gate for MODE 1 (provisional engineering values, to be tuned on reference data):
 * - minValidObservationCount: orientation estimates contributing to the rotation fit;
 * - maxFitResidualRad: RMS rotational-fit residual (~3.4 deg);
 * - maxRelativeSigma: sigma(|w|) / max(|w|, sigmaReferenceRadPerSec); the floor keeps the
 *   gate meaningful for genuine low-spin (knuckleball) shots;
 * - maxPlausibleSpinRadPerSec: 15,000 rpm, above any full-swing golf shot;
 * - blockingFlags: adapter flags that make a rotation estimate untrustworthy.
 */
export const SPIN_QUALITY_THRESHOLDS = Object.freeze({
  minValidObservationCount: 4,
  maxFitResidualRad: 0.06,
  maxRelativeSigma: 0.15,
  sigmaReferenceRadPerSec: 100,
  maxPlausibleSpinRadPerSec: 15000 * RAD_PER_SEC_PER_RPM,
  blockingFlags: Object.freeze(["occluded", "aliasing-risk", "ambiguous-rotation", "insufficient-features", "motion-blur"]),
});

export type ClubSpinPrior = {
  readonly totalSpinRpm: number;
  /** One-sigma relative spread used for the estimate. */
  readonly relativeSigma: number;
  readonly basis: string;
};

/**
 * Per-category spin-rate priors, seeded from widely published TrackMan PGA Tour averages
 * (driver 2686, 3-wood 3655, hybrid 4437, 3-iron 4630, 4-iron 4836, 5-iron 5361, 6-iron 6231,
 * 7-iron 7097, 8-iron 7998, 9-iron 8647, PW 9304 rpm). Mapping onto ClubCategory:
 *   driver -> driver; fairway-wood -> 3-wood; hybrid -> hybrid;
 *   long-iron -> mean(3-, 4-iron); mid-iron -> mean(5-, 6-, 7-iron);
 *   short-iron -> mean(8-, 9-iron); wedge -> PW (the only wedge in the table);
 *   putter -> no prior (a putt has no meaningful launch spin estimate).
 * Tour averages are a poor predictor for an individual amateur (different speed, attack angle,
 * strike and ball), hence the 35 % relative sigma, the low confidence and the
 * "estimated-club-model" label. These are priors, never measurements or club distances.
 */
export const CLUB_SPIN_PRIORS: Readonly<Record<ClubCategory, ClubSpinPrior | null>> = Object.freeze({
  driver: { totalSpinRpm: 2686, relativeSigma: 0.35, basis: "TrackMan PGA Tour average: driver" },
  "fairway-wood": { totalSpinRpm: 3655, relativeSigma: 0.35, basis: "TrackMan PGA Tour average: 3-wood" },
  hybrid: { totalSpinRpm: 4437, relativeSigma: 0.35, basis: "TrackMan PGA Tour average: hybrid" },
  "long-iron": { totalSpinRpm: (4630 + 4836) / 2, relativeSigma: 0.35, basis: "TrackMan PGA Tour average: mean of 3- and 4-iron" },
  "mid-iron": {
    totalSpinRpm: (5361 + 6231 + 7097) / 3,
    relativeSigma: 0.35,
    basis: "TrackMan PGA Tour average: mean of 5-, 6- and 7-iron",
  },
  "short-iron": { totalSpinRpm: (7998 + 8647) / 2, relativeSigma: 0.35, basis: "TrackMan PGA Tour average: mean of 8- and 9-iron" },
  wedge: { totalSpinRpm: 9304, relativeSigma: 0.35, basis: "TrackMan PGA Tour average: pitching wedge" },
  putter: null,
});

export const PLAYER_HISTORY_MIN_ENTRIES = 5;
/** History shots must be within +/-15 % of this shot's ball speed. */
export const PLAYER_HISTORY_SPEED_TOLERANCE = 0.15;
/** sigma = max(1.4826 * MAD, 10 % of the median); 1.4826 * MAD estimates sigma for normal data. */
export const PLAYER_HISTORY_MIN_RELATIVE_SIGMA = 0.1;
/** Floor on the tilt sigma from history (provisional): 10 % of a ~0 deg median is meaningless. */
export const PLAYER_HISTORY_TILT_SIGMA_FLOOR_RAD = 2 * RAD_PER_DEG;

/** Generic MODE-3 spin parameter S = r w / |v| (user-allowed fallback only). */
export const GENERIC_SPIN_PARAMETER = 0.15;
/** Ball radius for the generic fallback, m (1.68 in diameter). */
export const GENERIC_FALLBACK_BALL_RADIUS_M = 0.021335;
export const GENERIC_FALLBACK_RELATIVE_SIGMA = 0.5;

export const SPIN_CONFIDENCE = Object.freeze({
  playerModel: 0.5,
  clubModel: 0.25,
  genericFallback: 0.1,
});

export const SPIN_FACTOR_SCORES = Object.freeze({
  measuredMin: 0.8,
  playerModel: 0.55,
  clubModel: 0.3,
  genericFallback: 0.1,
  unavailable: 0,
});

export const PLAYER_MODEL_SPIN_WARNING = "Spin estimated from player profile; shot-shape accuracy reduced.";
export const CLUB_MODEL_SPIN_WARNING = "Spin estimated from club model; shot-shape accuracy reduced.";
export const CLUB_MODEL_AXIS_WARNING =
  "Spin axis cannot be estimated from a club model; zero axis tilt (no curve) is assumed for simulation.";
export const GENERIC_FALLBACK_SPIN_WARNING =
  "Generic spin assumption in use (user-allowed fallback); carry, curve, descent and roll are generic, not specific to this shot.";
export const SPIN_UNAVAILABLE_WARNING = "Spin unavailable; carry, curve, descent and roll cannot be calculated credibly.";

const SPIN_FACTOR_ID = "spin-quality";
const SPIN_FACTOR_LABEL = "Spin";

function spinFactor(score: number, detail: string): ConfidenceFactor {
  return { id: SPIN_FACTOR_ID, label: SPIN_FACTOR_LABEL, score, weight: FACTOR_WEIGHTS.spinQuality, detail, blocking: false };
}

/**
 * Spin-unavailable factor (score 0, weight 0, non-blocking). Exported for builders that receive
 * no resolution.
 *
 * Product decision: unavailable spin does NOT invalidate a launch state. Ball speed and launch
 * angles are still genuine measurements; the launch state is "provisional" (spinMode is not
 * "measured") and every spin-dependent output (carry, curve, descent, roll) is withheld by the
 * shot simulator instead. Weight 0 keeps the missing spin from dragging the confidence of the
 * values that were measured to zero. Consequence: a launch with no spin can carry a higher
 * overall confidence than one using the generic fallback; that is intended, because it asserts
 * nothing about spin while the fallback asserts a generic value that drives the simulation.
 */
export function unavailableSpinFactor(): ConfidenceFactor {
  return { ...spinFactor(SPIN_FACTOR_SCORES.unavailable, SPIN_UNAVAILABLE_WARNING), weight: 0 };
}

const ALLOWED_MEASURED_LABELS: ReadonlySet<MeasurementSource> = new Set<MeasurementSource>([
  ...MEASURED_SOURCES,
  "synthetic",
  "manual",
]);

function covarianceIsPd(cov: Matrix): boolean {
  if (cov.length !== 3 || cov.some((row) => row.length !== 3 || row.some((v) => !Number.isFinite(v)))) return false;
  return cholesky(cov) !== null;
}

function sigmaOfMagnitude(w: Vec3, cov: Matrix): number {
  const s = norm(w);
  const g = s > 0 ? [w.x / s, w.y / s, w.z / s] : [1 / Math.sqrt(3), 1 / Math.sqrt(3), 1 / Math.sqrt(3)];
  let q = 0;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) q += (g[i] as number) * ((cov[i] as ReadonlyArray<number>)[j] as number) * (g[j] as number);
  return Math.sqrt(Math.max(0, q));
}

/** Reasons a spin observation fails the MODE-1 gate (empty = passes). */
export function assessSpinObservation(o: SpinObservation): string[] {
  const t = SPIN_QUALITY_THRESHOLDS;
  const reasons: string[] = [];
  if (!isFiniteVec(o.angularVelocityRadPerSec)) return ["angular velocity is not finite"];
  if (!covarianceIsPd(o.covarianceRad2PerS2)) reasons.push("covariance is not positive definite");
  if (!(o.validObservationCount >= t.minValidObservationCount)) {
    reasons.push(`only ${o.validObservationCount} valid rotation observations (minimum ${t.minValidObservationCount})`);
  }
  if (!(o.fitResidualRad <= t.maxFitResidualRad)) {
    reasons.push(`rotation-fit residual ${o.fitResidualRad.toFixed(3)} rad exceeds ${t.maxFitResidualRad} rad`);
  }
  const blocking = o.qualityFlags.filter((f) => t.blockingFlags.includes(f));
  if (blocking.length > 0) reasons.push(`quality flags ${blocking.join(", ")}`);
  const magnitude = norm(o.angularVelocityRadPerSec);
  if (magnitude > t.maxPlausibleSpinRadPerSec) {
    reasons.push(`spin ${Math.round(magnitude * RPM_PER_RAD_PER_SEC)} rpm is implausible`);
  }
  if (covarianceIsPd(o.covarianceRad2PerS2)) {
    const relative = sigmaOfMagnitude(o.angularVelocityRadPerSec, o.covarianceRad2PerS2) / Math.max(magnitude, t.sigmaReferenceRadPerSec);
    if (!(relative <= t.maxRelativeSigma)) {
      reasons.push(`spin-rate uncertainty ${(relative * 100).toFixed(0)} % exceeds ${t.maxRelativeSigma * 100} %`);
    }
  }
  return reasons;
}

/** 0 (at the gate limits) .. 1 (perfect) quality of a passing observation. */
function measuredQuality(o: SpinObservation): number {
  const t = SPIN_QUALITY_THRESHOLDS;
  const magnitude = norm(o.angularVelocityRadPerSec);
  const relative = sigmaOfMagnitude(o.angularVelocityRadPerSec, o.covarianceRad2PerS2) / Math.max(magnitude, t.sigmaReferenceRadPerSec);
  const qSigma = Math.min(1, relative / t.maxRelativeSigma);
  const qResidual = Math.min(1, o.fitResidualRad / t.maxFitResidualRad);
  return 1 - Math.max(qSigma, qResidual);
}

function trace(m: Matrix): number {
  return m.reduce((s, row, i) => s + (row[i] as number), 0);
}

function velocityProvenanceFlags(velocity: Measurement<Vec3>): string[] {
  return MEASURED_SOURCES.has(velocity.source) ? [] : [`spin-frame-from-${velocity.source}-velocity`];
}

type EstimatedLabel = "estimated-player-model" | "estimated-club-model" | "assumed-generic-fallback";

/**
 * Provenance and confidence of an estimated value that also depends on the launch velocity
 * (the spin-vector direction always does; the generic-fallback magnitude does too): derived-value
 * rules, i.e. combineSources([mode label, velocity source]) and min(mode, velocity) confidence.
 * With a measured velocity the label is the mode label; a synthetic or manual velocity makes it
 * "synthetic" / "manual", never an estimate that looks sensor-backed.
 */
function velocityDependent(
  label: EstimatedLabel,
  modeConfidence: number,
  velocity: Measurement<Vec3>,
): { source: Exclude<MeasurementSource, "unavailable">; confidence: number } {
  return {
    source: combineSources([label, velocity.source]) as Exclude<MeasurementSource, "unavailable">,
    confidence: Math.min(modeConfidence, velocity.confidence),
  };
}

function unavailableResolution(warnings: string[], flags: readonly string[]): SpinResolution {
  const f = uniqueStrings(["spin-unavailable", ...flags]);
  return {
    spinMode: "unavailable",
    angularVelocity: unavailableMeasurement<Vec3>("rad/s", f),
    totalSpinRpm: unavailableMeasurement<number>("rpm", f),
    spinAxisTiltDeg: unavailableMeasurement<number>("deg", f),
    warnings: uniqueStrings([...warnings, SPIN_UNAVAILABLE_WARNING]),
    confidenceFactor: unavailableSpinFactor(),
  };
}

/** Isotropic covariance sigma^2 I (rad/s)^2: magnitude, tilt and rifle spin all uncertain. */
function isotropic(sigma: number): number[][] {
  const v = sigma * sigma;
  return [
    [v, 0, 0],
    [0, v, 0],
    [0, 0, v],
  ];
}

export function resolveSpin(input: SpinResolutionInput): SpinResolution {
  if (!ALLOWED_MEASURED_LABELS.has(input.measuredSource)) {
    throw new Error(
      `resolveSpin: measuredSource must be a measured-*, "synthetic" or "manual" label, got "${input.measuredSource}"`,
    );
  }
  const warnings: string[] = [];
  const velocity = input.velocity;

  // MODE 1: measured spin.
  const assessed = input.spinObservations.map((o) => ({ o, reasons: assessSpinObservation(o) }));
  const passing = assessed
    .filter((a) => a.reasons.length === 0)
    .map((a) => a.o)
    .sort(
      (a, b) =>
        trace(a.covarianceRad2PerS2) - trace(b.covarianceRad2PerS2) ||
        a.fitResidualRad - b.fitResidualRad ||
        b.validObservationCount - a.validObservationCount ||
        a.sequence - b.sequence,
    );
  const best = passing[0];
  if (best) {
    // A synthetic rotation estimate is never labelled measured, whatever the stream claims.
    const source: Exclude<MeasurementSource, "unavailable"> =
      best.method === "synthetic" ? "synthetic" : (input.measuredSource as Exclude<MeasurementSource, "unavailable">);
    if (best.method === "synthetic" && input.measuredSource !== "synthetic") {
      warnings.push("Synthetic spin observation relabelled as synthetic (it was not measured).");
    }
    const quality = measuredQuality(best);
    // 0.57 at the gate limits .. 0.95 for a perfect rotation fit (provisional mapping).
    const confidence = 0.95 * (1 - 0.4 * (1 - quality));
    const angularVelocity = makeMeasurement<Vec3>({
      value: best.angularVelocityRadPerSec,
      unit: "rad/s",
      source,
      confidence,
      uncertainty: { covariance: best.covarianceRad2PerS2, unit: "rad/s" },
      qualityFlags: [...best.qualityFlags, `spin-method-${best.method}`],
    });
    const score = SPIN_FACTOR_SCORES.measuredMin + (1 - SPIN_FACTOR_SCORES.measuredMin) * quality;
    return {
      spinMode: "measured",
      angularVelocity,
      totalSpinRpm: deriveTotalSpinRpm(angularVelocity),
      spinAxisTiltDeg: deriveSpinAxisTiltDeg(angularVelocity, velocity),
      warnings: uniqueStrings(warnings),
      confidenceFactor: spinFactor(
        score,
        `Spin measured (${best.method}, ${best.validObservationCount} rotation observations, residual ${best.fitResidualRad.toFixed(3)} rad).`,
      ),
    };
  }
  for (const a of assessed) {
    warnings.push(`Spin measurement rejected (sequence ${a.o.sequence}): ${a.reasons.join("; ")}. Spin is not reported as measured.`);
  }

  // Estimation needs a launch direction to orient the spin vector.
  const frame = isAvailable(velocity) ? launchDirectionFrame(velocity.value) : null;
  if (!isAvailable(velocity) || !frame) {
    warnings.push("Spin could not be estimated because the launch velocity is unavailable or vertical.");
    return unavailableResolution(warnings, ["spin-estimation-no-launch-direction"]);
  }
  const v = velocity.value;
  const speed = norm(v);
  const vFlags = velocityProvenanceFlags(velocity);

  // MODE 2a: the player's own measured spin history for this club category and speed band.
  if (input.clubCategory !== null) {
    const category = input.clubCategory;
    const matching = input.playerSpinHistory.filter(
      (e) =>
        MEASURED_SOURCES.has(e.source) &&
        e.clubCategory === category &&
        Number.isFinite(e.ballSpeedMps) &&
        Number.isFinite(e.totalSpinRadPerSec) &&
        Number.isFinite(e.spinAxisTiltRad) &&
        e.totalSpinRadPerSec >= 0 &&
        Math.abs(e.ballSpeedMps - speed) <= PLAYER_HISTORY_SPEED_TOLERANCE * speed,
    );
    if (matching.length >= PLAYER_HISTORY_MIN_ENTRIES) {
      return playerModelResolution(matching, velocity, frame, vFlags, warnings);
    }
    if (matching.length > 0) {
      warnings.push(
        `Player spin history has ${matching.length} measured ${category} shot(s) at this ball speed; ${PLAYER_HISTORY_MIN_ENTRIES} are required.`,
      );
    }

    // MODE 2b: per-club prior.
    const prior = CLUB_SPIN_PRIORS[category];
    if (prior) {
      const spin = prior.totalSpinRpm * RAD_PER_SEC_PER_RPM;
      const sigma = prior.relativeSigma * spin;
      const flags = ["club-spin-prior", `club-spin-prior-${category}`, ...vFlags];
      return {
        spinMode: "estimated",
        angularVelocity: makeMeasurement<Vec3>({
          value: angularVelocityFromSpin({ totalSpinRadPerSec: spin, spinAxisTiltRad: 0, velocity: v }),
          unit: "rad/s",
          ...velocityDependent("estimated-club-model", SPIN_CONFIDENCE.clubModel, velocity),
          uncertainty: { covariance: isotropic(sigma), unit: "rad/s" },
          qualityFlags: [...flags, "spin-axis-assumed-zero"],
        }),
        totalSpinRpm: makeMeasurement<number>({
          value: prior.totalSpinRpm,
          unit: "rpm",
          source: "estimated-club-model",
          confidence: SPIN_CONFIDENCE.clubModel,
          uncertainty: { sigma: prior.relativeSigma * prior.totalSpinRpm, unit: "rpm" },
          qualityFlags: flags,
        }),
        spinAxisTiltDeg: unavailableMeasurement<number>("deg", ["spin-axis-not-estimable-from-club-model"]),
        warnings: uniqueStrings([...warnings, CLUB_MODEL_SPIN_WARNING, CLUB_MODEL_AXIS_WARNING]),
        confidenceFactor: spinFactor(SPIN_FACTOR_SCORES.clubModel, CLUB_MODEL_SPIN_WARNING),
      };
    }
    warnings.push(`No spin prior exists for club category "${category}".`);
  } else {
    warnings.push("Club category unknown; spin cannot be estimated from a player or club model.");
  }

  // MODE 3: generic fallback, only with explicit user permission.
  if (input.allowGenericFallback) {
    const spin = (GENERIC_SPIN_PARAMETER * speed) / GENERIC_FALLBACK_BALL_RADIUS_M;
    const sigma = GENERIC_FALLBACK_RELATIVE_SIGMA * spin;
    const flags = ["generic-spin-assumption", ...vFlags];
    return {
      spinMode: "assumed-generic-fallback",
      angularVelocity: makeMeasurement<Vec3>({
        value: angularVelocityFromSpin({ totalSpinRadPerSec: spin, spinAxisTiltRad: 0, velocity: v }),
        unit: "rad/s",
        ...velocityDependent("assumed-generic-fallback", SPIN_CONFIDENCE.genericFallback, velocity),
        uncertainty: { covariance: isotropic(sigma), unit: "rad/s" },
        qualityFlags: [...flags, "spin-axis-assumed-zero"],
      }),
      // |w| = S |v| / r: the magnitude is derived from the launch speed.
      totalSpinRpm: makeMeasurement<number>({
        value: spin * RPM_PER_RAD_PER_SEC,
        unit: "rpm",
        ...velocityDependent("assumed-generic-fallback", SPIN_CONFIDENCE.genericFallback, velocity),
        uncertainty: { sigma: sigma * RPM_PER_RAD_PER_SEC, unit: "rpm" },
        qualityFlags: flags,
      }),
      spinAxisTiltDeg: unavailableMeasurement<number>("deg", ["spin-axis-not-estimable-generic-fallback"]),
      warnings: uniqueStrings([...warnings, GENERIC_FALLBACK_SPIN_WARNING]),
      confidenceFactor: spinFactor(SPIN_FACTOR_SCORES.genericFallback, GENERIC_FALLBACK_SPIN_WARNING),
    };
  }

  return unavailableResolution(warnings, []);
}

function playerModelResolution(
  entries: readonly PlayerSpinHistoryEntry[],
  velocity: Measurement<Vec3> & { value: Vec3 },
  frame: NonNullable<ReturnType<typeof launchDirectionFrame>>,
  vFlags: readonly string[],
  warnings: readonly string[],
): SpinResolution {
  const rates = entries.map((e) => e.totalSpinRadPerSec);
  const tilts = entries.map((e) => e.spinAxisTiltRad);
  const spin = median(rates);
  const tilt = median(tilts);
  const sigmaSpin = Math.max(1.4826 * medianAbsoluteDeviation(rates), PLAYER_HISTORY_MIN_RELATIVE_SIGMA * spin);
  const sigmaTilt = Math.max(
    1.4826 * medianAbsoluteDeviation(tilts),
    PLAYER_HISTORY_MIN_RELATIVE_SIGMA * Math.abs(tilt),
    PLAYER_HISTORY_TILT_SIGMA_FLOOR_RAD,
  );
  const omega = angularVelocityFromSpin({ totalSpinRadPerSec: spin, spinAxisTiltRad: tilt, velocity: velocity.value });

  // Cov = sS^2 jS jS^T + sA^2 jA jA^T + sS^2 d d^T, with jS = dw/dS, jA = dw/dalpha. Rifle spin
  // is not estimated; giving it the spin-rate variance keeps the covariance positive definite
  // without changing the first-order sigma of |w| or of the tilt (both are orthogonal to d).
  const c = Math.cos(tilt);
  const s = Math.sin(tilt);
  const jS = [c * frame.r.x - s * frame.u.x, c * frame.r.y - s * frame.u.y, c * frame.r.z - s * frame.u.z];
  const jA = [spin * (-s * frame.r.x - c * frame.u.x), spin * (-s * frame.r.y - c * frame.u.y), spin * (-s * frame.r.z - c * frame.u.z)];
  const d = [frame.d.x, frame.d.y, frame.d.z];
  const cov = [0, 1, 2].map((i) =>
    [0, 1, 2].map(
      (j) =>
        sigmaSpin * sigmaSpin * ((jS[i] as number) * (jS[j] as number) + (d[i] as number) * (d[j] as number)) +
        sigmaTilt * sigmaTilt * (jA[i] as number) * (jA[j] as number),
    ),
  );
  const flags = ["player-spin-model", `player-history-n-${entries.length}`, ...vFlags];
  return {
    spinMode: "estimated",
    angularVelocity: makeMeasurement<Vec3>({
      value: omega,
      unit: "rad/s",
      ...velocityDependent("estimated-player-model", SPIN_CONFIDENCE.playerModel, velocity),
      uncertainty: { covariance: cov, unit: "rad/s" },
      qualityFlags: flags,
    }),
    totalSpinRpm: makeMeasurement<number>({
      value: spin * RPM_PER_RAD_PER_SEC,
      unit: "rpm",
      source: "estimated-player-model",
      confidence: SPIN_CONFIDENCE.playerModel,
      uncertainty: { sigma: sigmaSpin * RPM_PER_RAD_PER_SEC, unit: "rpm" },
      qualityFlags: flags,
    }),
    spinAxisTiltDeg: makeMeasurement<number>({
      value: tilt * DEG_PER_RAD,
      unit: "deg",
      source: "estimated-player-model",
      confidence: SPIN_CONFIDENCE.playerModel,
      uncertainty: { sigma: sigmaTilt * DEG_PER_RAD, unit: "deg" },
      qualityFlags: flags,
    }),
    warnings: uniqueStrings([...warnings, PLAYER_MODEL_SPIN_WARNING]),
    confidenceFactor: spinFactor(SPIN_FACTOR_SCORES.playerModel, PLAYER_MODEL_SPIN_WARNING),
  };
}
