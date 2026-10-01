import { createRng, isFiniteVec } from "@glm/core-math";
import type { Rng } from "@glm/core-math";
import { deepFreeze } from "@glm/shared-types";
import type {
  Matrix,
  RawSensorObservation,
  SensorConfiguration,
  SensorHealth,
  SyntheticTruth,
  Vec3,
} from "@glm/shared-types";
import { REPLAY_SHOT_GAP_S, vecWithoutNegativeZero as cleanVec, withoutNegativeZero as clean } from "./adapter-support";
import { formatIsoUtc } from "./clock";
import { flattenSyntheticNoiseModel, validateSyntheticNoiseModel } from "./synthetic-noise";
import type { SyntheticNoiseModel } from "./synthetic-noise";

/**
 * Ball-flight truth, injected so this package does not depend on a physics model.
 * Returns the ball-center position at launch + dtS[i] for each i. Callers pass dtS sorted
 * ascending with every value >= 0 (propagators may integrate forward incrementally).
 */
export type TruthPropagator = (p0: Vec3, v0: Vec3, omega0: Vec3, dtS: readonly number[]) => Vec3[];

export type SyntheticShotSpec = {
  readonly label: string;
  /** True ball-center position at launch, world frame, m. */
  readonly positionM: Vec3;
  /** True launch velocity, m/s. */
  readonly velocityMps: Vec3;
  /** True launch angular velocity, rad/s. */
  readonly angularVelocityRadPerSec: Vec3;
  /** True launch time on the session clock, s. */
  readonly launchTimeS: number;
  /** Seed for createRng; the generated observations are a pure function of (spec, propagator). */
  readonly seed: number;
  readonly noise: SyntheticNoiseModel;
};

export type SyntheticShotGenerationOptions = {
  readonly sensorId: string;
  /** Sequence number of the first emitted observation; the rest follow consecutively. */
  readonly firstSequence: number;
  /**
   * Unix ms that session time 0 maps to, used only for the health observation's checkedUtc.
   * Default 0 (1970-01-01), which makes synthetic health timestamps obviously synthetic.
   */
  readonly sessionEpochUnixMs?: number;
};

export type SyntheticShotGeneration = {
  readonly observations: RawSensorObservation[];
  readonly truth: SyntheticTruth;
  readonly nextSequence: number;
};

/** Health observation precedes launch by this much, s. */
export const SYNTHETIC_HEALTH_LEAD_S = 0.5;
/** Ball-address observation precedes launch by this much, s. */
export const SYNTHETIC_ADDRESS_LEAD_S = 0.1;

export const SYNTHETIC_HEALTH_MESSAGE =
  "Synthetic sensor: observations are generated from an injected ball-flight model plus configured noise. They are not measurements of a real golf shot.";

function requireFiniteVec(context: string, field: string, v: Vec3): void {
  if (v === null || typeof v !== "object" || !isFiniteVec(v)) {
    throw new RangeError(`${context}: ${field} must be a finite Vec3, got ${JSON.stringify(v)}`);
  }
}

export function validateSyntheticShotSpec(spec: SyntheticShotSpec): void {
  const context = `SyntheticShotSpec ${JSON.stringify(spec.label)}`;
  if (typeof spec.label !== "string") throw new RangeError(`${context}: label must be a string`);
  requireFiniteVec(context, "positionM", spec.positionM);
  requireFiniteVec(context, "velocityMps", spec.velocityMps);
  requireFiniteVec(context, "angularVelocityRadPerSec", spec.angularVelocityRadPerSec);
  if (typeof spec.launchTimeS !== "number" || !Number.isFinite(spec.launchTimeS)) {
    throw new RangeError(`${context}: launchTimeS must be a finite number, got ${spec.launchTimeS}`);
  }
  if (!Number.isSafeInteger(spec.seed)) {
    throw new RangeError(`${context}: seed must be a safe integer, got ${spec.seed}`);
  }
  validateSyntheticNoiseModel(spec.noise, context);
}

/**
 * Smallest variance the generator reports: m^2 for positions, (rad/s)^2 for spin. A noise-free
 * setting (sigma 0) or reportedCovarianceScale 0 would otherwise report an all-zero covariance,
 * which claims a perfect measurement and is singular (estimators reject covariances that are
 * not positive definite). 1e-12 is a 1 um position sigma (1e-6 rad/s for spin), far below any
 * realistic test setting, so those are reported unchanged. Only the REPORTED covariance is
 * floored; the injected noise stays exactly as configured.
 */
export const MIN_REPORTED_VARIANCE = 1e-12;

function reportedVariance(variance: number): number {
  return Math.max(variance, MIN_REPORTED_VARIANCE);
}

function gaussianVec(rng: Rng, sigma: Vec3): Vec3 {
  return { x: rng.normal() * sigma.x, y: rng.normal() * sigma.y, z: rng.normal() * sigma.z };
}

/** Uniform direction on the unit sphere (normalised isotropic Gaussian). Always draws 3 normals. */
function randomUnitVector(rng: Rng): Vec3 {
  const x = rng.normal();
  const y = rng.normal();
  const z = rng.normal();
  const n = Math.hypot(x, y, z);
  return n > 1e-12 ? { x: x / n, y: y / n, z: z / n } : { x: 1, y: 0, z: 0 };
}

function diag3(a: number, b: number, c: number): Matrix {
  return [
    [clean(a), 0, 0],
    [0, clean(b), 0],
    [0, 0, clean(c)],
  ];
}

type FrameDraw = {
  readonly frameIndex: number;
  readonly nominalTimeS: number;
  /** True time since launch at which the frame was exposed, clamped to >= 0. */
  readonly trueDtS: number;
  readonly dropped: boolean;
  readonly outlier: boolean;
  readonly noise: Vec3;
  readonly outlierDirection: Vec3;
};

/** An observation awaiting its sequence number; `order` breaks timestamp ties stably. */
type Draft = {
  readonly timestampS: number;
  readonly order: number;
  readonly build: (sequence: number) => RawSensorObservation;
};

/**
 * Generate the raw observation stream of one synthetic shot.
 *
 * Emitted (sorted by timestampS, then by the order below; sequences consecutive from
 * options.firstSequence):
 * 1. health (status ok, calibrationStatus "none") at launch - 0.5 s;
 * 2. ball-address at launch - 0.1 s: true launch position + per-axis position noise;
 * 3. one trigger per noise.triggerSources entry at launch + latency + N(0, latencySigma);
 * 4. for k = 0..frameCount-1: nominal time tn = launch + (startDelayFrames + k) / frameRateHz,
 *    true time = tn + N(0, timestampJitterS). The position is the propagated truth at the TRUE
 *    time plus per-axis noise, reported at the NOMINAL time tn (that mismatch is the sync
 *    error). A frame whose jittered true time precedes launch sees the ball still at its
 *    launch position (dt clamped to 0). Frames are dropped with dropoutProbability; kept
 *    frames get a gross error of outlierMagnitudeM in a uniformly random direction with
 *    outlierProbability. Reported covariance = diag(sigma^2) * reportedCovarianceScale, each
 *    variance floored at MIN_REPORTED_VARIANCE.
 * 5. if noise.spin is set: one spin observation (method "synthetic") one frame period after
 *    the last nominal frame time: true omega + N(0, sigma) per axis, covariance diag(sigma^2)
 *    floored at MIN_REPORTED_VARIANCE.
 *
 * Determinism: all randomness comes from createRng(spec.seed) in a fixed draw order. Each
 * frame always consumes the same draws (jitter, dropout, outlier, 3 noise, 3 direction)
 * whether or not it is dropped, so changing a probability does not reshuffle the noise of
 * the other frames. The propagator is called exactly once with every needed dt, sorted
 * ascending. The observations never contain truth; truth is returned separately.
 */
export function generateSyntheticShot(
  spec: SyntheticShotSpec,
  propagate: TruthPropagator,
  options: SyntheticShotGenerationOptions,
): SyntheticShotGeneration {
  validateSyntheticShotSpec(spec);
  if (typeof propagate !== "function") throw new TypeError("generateSyntheticShot: propagate must be a function");
  if (typeof options.sensorId !== "string" || options.sensorId.length === 0) {
    throw new RangeError("generateSyntheticShot: options.sensorId must be a non-empty string");
  }
  if (!Number.isSafeInteger(options.firstSequence) || options.firstSequence < 0) {
    throw new RangeError(`generateSyntheticShot: options.firstSequence must be an integer >= 0, got ${options.firstSequence}`);
  }
  const epochMs = options.sessionEpochUnixMs ?? 0;
  const { noise, launchTimeS } = spec;
  const sensorId = options.sensorId;
  const sigma: Vec3 = noise.positionSigmaM;
  const rng = createRng(spec.seed);

  // --- Random draws, in a fixed order -------------------------------------------------
  const addressNoise = gaussianVec(rng, sigma);
  const triggerTimes = noise.triggerSources.map((t) => launchTimeS + t.latencyS + rng.normal() * t.latencySigmaS);
  const frames: FrameDraw[] = [];
  for (let k = 0; k < noise.frameCount; k++) {
    const frameIndex = noise.startDelayFrames + k;
    const nominalDtS = frameIndex / noise.frameRateHz;
    const jitterS = rng.normal() * noise.timestampJitterS;
    const uDropout = rng.nextFloat();
    const uOutlier = rng.nextFloat();
    const frameNoise = gaussianVec(rng, sigma);
    const outlierDirection = randomUnitVector(rng);
    frames.push({
      frameIndex,
      nominalTimeS: launchTimeS + nominalDtS,
      trueDtS: Math.max(0, nominalDtS + jitterS),
      dropped: uDropout < noise.dropoutProbability,
      outlier: uOutlier < noise.outlierProbability,
      noise: frameNoise,
      outlierDirection,
    });
  }
  const spinNoise = noise.spin === null ? null : gaussianVec(rng, { x: noise.spin.sigmaRadPerSec, y: noise.spin.sigmaRadPerSec, z: noise.spin.sigmaRadPerSec });

  // --- Truth propagation: one call, dt ascending ----------------------------------------
  const order = frames.map((_, i) => i).sort((a, b) => frames[a]!.trueDtS - frames[b]!.trueDtS || a - b);
  const dts = order.map((i) => frames[i]!.trueDtS);
  const truePositions = new Array<Vec3>(frames.length);
  if (frames.length > 0) {
    const propagated = propagate(spec.positionM, spec.velocityMps, spec.angularVelocityRadPerSec, dts);
    if (!Array.isArray(propagated) || propagated.length !== dts.length) {
      throw new RangeError(
        `generateSyntheticShot: propagator returned ${Array.isArray(propagated) ? propagated.length : typeof propagated} positions for ${dts.length} times`,
      );
    }
    order.forEach((frameIdx, j) => {
      const p = propagated[j]!;
      if (p === null || typeof p !== "object" || !isFiniteVec(p)) {
        throw new RangeError(`generateSyntheticShot: propagator returned a non-finite position for dt=${dts[j]} s`);
      }
      truePositions[frameIdx] = p;
    });
  }

  // --- Observation drafts --------------------------------------------------------------
  const drafts: Draft[] = [];
  const addDraft = (timestampS: number, build: (sequence: number) => RawSensorObservation): void => {
    drafts.push({ timestampS, order: drafts.length, build });
  };

  const healthTimeS = launchTimeS - SYNTHETIC_HEALTH_LEAD_S;
  addDraft(healthTimeS, (sequence) => {
    const health: SensorHealth = {
      sensorId,
      status: "ok",
      checkedUtc: formatIsoUtc(epochMs + healthTimeS * 1000),
      metrics: [],
      messages: [SYNTHETIC_HEALTH_MESSAGE],
      calibrationStatus: "none",
    };
    return { kind: "health", sensorId, sequence, timestampS: healthTimeS, health };
  });

  const addressTimeS = launchTimeS - SYNTHETIC_ADDRESS_LEAD_S;
  addDraft(addressTimeS, (sequence) => ({
    kind: "ball-address",
    sensorId,
    sequence,
    timestampS: addressTimeS,
    positionM: cleanVec({
      x: spec.positionM.x + addressNoise.x,
      y: spec.positionM.y + addressNoise.y,
      z: spec.positionM.z + addressNoise.z,
    }),
    stationary: noise.address.stationary,
    inHittingZone: noise.address.inHittingZone,
    ballCount: noise.address.ballCount,
    confidence: 1,
  }));

  noise.triggerSources.forEach((trigger, i) => {
    const timestampS = triggerTimes[i]!;
    addDraft(timestampS, (sequence) => ({
      kind: "trigger",
      sensorId,
      sequence,
      timestampS,
      triggerSource: trigger.source,
      confidence: trigger.confidence,
    }));
  });

  const scale = noise.reportedCovarianceScale;
  const covarianceM2 = diag3(
    reportedVariance(sigma.x * sigma.x * scale),
    reportedVariance(sigma.y * sigma.y * scale),
    reportedVariance(sigma.z * sigma.z * scale),
  );
  frames.forEach((frame, i) => {
    if (frame.dropped) return;
    const truth = truePositions[i]!;
    const outlierM = frame.outlier ? noise.outlierMagnitudeM : 0;
    const positionM = cleanVec({
      x: truth.x + frame.noise.x + frame.outlierDirection.x * outlierM,
      y: truth.y + frame.noise.y + frame.outlierDirection.y * outlierM,
      z: truth.z + frame.noise.z + frame.outlierDirection.z * outlierM,
    });
    addDraft(frame.nominalTimeS, (sequence) => ({
      kind: "ball-position-3d",
      sensorId,
      sequence,
      timestampS: frame.nominalTimeS,
      frameIndex: frame.frameIndex,
      positionM,
      covarianceM2,
      reprojectionErrorPx: null,
      detectionConfidence: 1,
      cameraIds: [],
    }));
  });

  if (noise.spin !== null && spinNoise !== null) {
    const spin = noise.spin;
    const s2 = reportedVariance(spin.sigmaRadPerSec * spin.sigmaRadPerSec);
    const timestampS = launchTimeS + (noise.startDelayFrames + noise.frameCount) / noise.frameRateHz;
    const omega = spec.angularVelocityRadPerSec;
    addDraft(timestampS, (sequence) => ({
      kind: "spin",
      sensorId,
      sequence,
      timestampS,
      method: "synthetic",
      angularVelocityRadPerSec: cleanVec({ x: omega.x + spinNoise.x, y: omega.y + spinNoise.y, z: omega.z + spinNoise.z }),
      covarianceRad2PerS2: diag3(s2, s2, s2),
      validObservationCount: spin.validObservationCount,
      fitResidualRad: spin.fitResidualRad,
      qualityFlags: [...spin.qualityFlags],
    }));
  }

  drafts.sort((a, b) => a.timestampS - b.timestampS || a.order - b.order);
  const observations = drafts.map((draft, i) => {
    const observation = draft.build(options.firstSequence + i);
    deepFreeze(observation);
    return observation;
  });

  const truth: SyntheticTruth = deepFreeze<SyntheticTruth>({
    label: spec.label,
    positionM: cleanVec(spec.positionM),
    velocityMps: cleanVec(spec.velocityMps),
    angularVelocityRadPerSec: cleanVec(spec.angularVelocityRadPerSec),
    launchTimeS,
    seed: spec.seed,
    noiseModel: flattenSyntheticNoiseModel(noise),
  });

  return { observations, truth, nextSequence: options.firstSequence + observations.length };
}

// ---------------------------------------------------------------------------------------
// Multi-shot sessions
// ---------------------------------------------------------------------------------------

export const DEFAULT_SYNTHETIC_SHOT_SPACING_S = 5;

export type SyntheticSessionOptions = {
  readonly sensorId: string;
  readonly firstSequence?: number;
  /** Shot i launches at i * shotSpacingS + its own spec.launchTimeS. Default 5 s. */
  readonly shotSpacingS?: number;
  readonly sessionEpochUnixMs?: number;
};

export type SyntheticSessionShot = {
  /** The spec actually generated, with launchTimeS re-timed into the session. */
  readonly spec: SyntheticShotSpec;
  readonly observations: readonly RawSensorObservation[];
  readonly truth: SyntheticTruth;
};

export type SyntheticSession = {
  readonly shots: readonly SyntheticSessionShot[];
  /** All shots' observations concatenated in time order. */
  readonly observations: readonly RawSensorObservation[];
  readonly truths: readonly SyntheticTruth[];
  readonly nextSequence: number;
};

/**
 * Generate several shots on one session clock with consecutive sequence numbers. Throws if
 * the spacing is too small:
 * - the shots' observation windows must stay disjoint, because interleaved shots would break
 *   per-sensor timestamp/sequence monotonicity;
 * - each shot's first observation must come more than REPLAY_SHOT_GAP_S (1 s) after the
 *   previous shot's last trigger, so a recorded session splits back into the same shots
 *   (replayShotEndIndices). With the default noise model that needs shotSpacingS > 1.5 s.
 */
export function generateSyntheticSession(
  shots: readonly SyntheticShotSpec[],
  propagate: TruthPropagator,
  options: SyntheticSessionOptions,
): SyntheticSession {
  const spacing = options.shotSpacingS ?? DEFAULT_SYNTHETIC_SHOT_SPACING_S;
  if (typeof spacing !== "number" || !Number.isFinite(spacing) || spacing <= 0) {
    throw new RangeError(`generateSyntheticSession: shotSpacingS must be a finite number > 0, got ${spacing}`);
  }
  let sequence = options.firstSequence ?? 0;
  const generated: SyntheticSessionShot[] = [];
  let previousEnd = -Infinity;
  let previousTriggerS: number | null = null;
  shots.forEach((original, i) => {
    const spec: SyntheticShotSpec = { ...original, launchTimeS: i * spacing + original.launchTimeS };
    const result = generateSyntheticShot(spec, propagate, {
      sensorId: options.sensorId,
      firstSequence: sequence,
      ...(options.sessionEpochUnixMs !== undefined ? { sessionEpochUnixMs: options.sessionEpochUnixMs } : {}),
    });
    const first = result.observations[0];
    const last = result.observations[result.observations.length - 1];
    if (first !== undefined && last !== undefined) {
      if (!(first.timestampS > previousEnd)) {
        throw new RangeError(
          `generateSyntheticSession: shot ${i} (${JSON.stringify(spec.label)}) starts at ${first.timestampS} s, ` +
            `not after the previous shot's last observation at ${previousEnd} s; increase shotSpacingS (currently ${spacing} s).`,
        );
      }
      if (previousTriggerS !== null && !(first.timestampS - previousTriggerS > REPLAY_SHOT_GAP_S)) {
        throw new RangeError(
          `generateSyntheticSession: shot ${i} (${JSON.stringify(spec.label)}) starts at ${first.timestampS} s, only ` +
            `${first.timestampS - previousTriggerS} s after the previous shot's trigger at ${previousTriggerS} s; a replay of this ` +
            `session would merge the shots (replay segmentation needs more than ${REPLAY_SHOT_GAP_S} s). ` +
            `Increase shotSpacingS (currently ${spacing} s).`,
        );
      }
      previousEnd = last.timestampS;
    }
    const triggers = result.observations.filter((o) => o.kind === "trigger");
    if (triggers.length > 0) previousTriggerS = triggers[triggers.length - 1]!.timestampS;
    sequence = result.nextSequence;
    generated.push({ spec, observations: result.observations, truth: result.truth });
  });
  return {
    shots: generated,
    observations: generated.flatMap((s) => s.observations),
    truths: generated.map((s) => s.truth),
    nextSequence: sequence,
  };
}

/**
 * Configuration of the synthetic sensor. The description states plainly that the data are
 * generated, so a stored shot can never be mistaken for a measurement.
 */
export function defaultSyntheticSensorConfiguration(sensorId = "synthetic-1"): SensorConfiguration {
  return deepFreeze<SensorConfiguration>({
    sensorId,
    version: "synthetic-config-1",
    kind: "synthetic",
    description:
      "Synthetic sensor (software only): observations are generated from an injected ball-flight model plus a configured noise model. Not a measurement of any real shot; for testing and validation.",
    cameras: [],
    triggerSources: ["synthetic"],
    frameBuffer: { preTriggerS: 0.25, postTriggerS: 0.5 },
    storeRawCaptures: true,
  });
}
