import {
  type BallState,
  PHYSICS_MODEL_VERSION,
  simulateFlightSegment,
} from "@glm/ballistics";
import { createRng, normSq, quantile, sampleMultivariateNormal, scale } from "@glm/core-math";
import { GROUND_MODEL_VERSION, type HopSimulator, simulateGroundMotion } from "@glm/ground-physics";
import {
  type AirFlightResult,
  type BallAerodynamicsProfile,
  deepFreeze,
  type EnvironmentProfile,
  type GroundMotionResult,
  type LandingResult,
  type LaunchState,
  type Matrix,
  type Penalty,
  type ShotResult,
  ShotResultSchema,
  type SimulationSettings,
  type TerrainQuery,
  type Vec3,
} from "@glm/shared-types";
import { surfaceToLie } from "@glm/terrain-engine";
import { buildShotMetrics, computeRawMetrics, RAW_METRIC_KEYS, type RawMetrics } from "./metrics";

export const SHOT_SIMULATOR_VERSION = "glm-shot-sim-0.1.0";

/** Monte Carlo trajectories use at least this RK4 step (s) to bound cost; see docs/physics-model.md. */
export const MONTE_CARLO_MIN_TIMESTEP_S = 0.004;

export type SimulationContext = {
  readonly environment: EnvironmentProfile;
  readonly ballProfile: BallAerodynamicsProfile;
  readonly terrain: TerrainQuery;
  readonly settings: SimulationSettings;
};

export type SimulationOutcome =
  | { readonly ok: true; readonly result: ShotResult }
  | { readonly ok: false; readonly reason: string };

type Trajectory = {
  readonly airFlight: AirFlightResult;
  readonly landing: LandingResult;
  readonly groundMotion: GroundMotionResult;
};

/**
 * Simulates air flight from `initial` to first contact, then bounce and roll to rest.
 * Returns a reason string instead of a trajectory when flight never reaches the ground.
 */
export function simulateTrajectory(initial: BallState, ctx: SimulationContext): Trajectory | string {
  const flight = simulateFlightSegment(initial, {
    environment: ctx.environment,
    ballProfile: ctx.ballProfile,
    terrain: ctx.terrain,
    settings: ctx.settings,
    startTimeS: 0,
    phase: "air",
  });
  if (!flight.contact) {
    return `Air flight ended without ground contact (termination: ${flight.airFlight.termination}).`;
  }
  const contact = flight.contact;
  const landing: LandingResult = {
    timeS: contact.timeS,
    positionM: contact.state.positionM,
    velocityMps: contact.state.velocityMps,
    angularVelocityRadPerSec: contact.state.angularVelocityRadPerSec,
    surface: contact.terrain.surface.type,
    surfaceNormal: contact.terrain.normal,
  };

  const hop: HopSimulator = (state, startTimeS) => {
    const segment = simulateFlightSegment(state, {
      environment: ctx.environment,
      ballProfile: ctx.ballProfile,
      terrain: ctx.terrain,
      settings: ctx.settings,
      startTimeS,
      phase: "bounce-air",
    });
    return {
      samples: segment.airFlight.samples,
      termination: segment.airFlight.termination,
      contact: segment.contact
        ? {
            timeS: segment.contact.timeS,
            positionM: segment.contact.state.positionM,
            velocityMps: segment.contact.state.velocityMps,
            angularVelocityRadPerSec: segment.contact.state.angularVelocityRadPerSec,
            terrain: segment.contact.terrain,
          }
        : null,
    };
  };

  const groundMotion = simulateGroundMotion({
    firstContact: {
      timeS: contact.timeS,
      positionM: contact.state.positionM,
      velocityMps: contact.state.velocityMps,
      angularVelocityRadPerSec: contact.state.angularVelocityRadPerSec,
      terrain: contact.terrain,
    },
    terrain: ctx.terrain,
    ballProfile: ctx.ballProfile,
    gravityMps2: ctx.environment.gravityMps2,
    hop,
    settings: {
      maxGroundTimeS: ctx.settings.maxGroundTimeS,
      outputSampleIntervalS: ctx.settings.outputSampleIntervalS,
    },
  });

  return { airFlight: flight.airFlight, landing, groundMotion };
}

/** Why a launch state cannot be simulated, or null if it can. */
export function simulationBlocker(launch: LaunchState): string | null {
  if (launch.validity === "invalid") {
    const reasons = launch.rejectionReasons.length > 0 ? launch.rejectionReasons.join("; ") : "no reason recorded";
    return `Launch state is invalid: ${reasons}`;
  }
  if (launch.ballPositionM.value === null) return "Launch position unavailable.";
  if (launch.velocityMps.value === null) return "Launch velocity unavailable.";
  if (launch.angularVelocityRadPerSec.value === null || launch.spinMode === "unavailable") {
    return (
      "Spin unavailable; carry, curve, descent and roll cannot be calculated credibly. " +
      "Measure spin, select a club for an estimate, or explicitly allow the generic spin fallback."
    );
  }
  return null;
}

type MonteCarloSummary = {
  readonly intervals: Partial<Record<keyof RawMetrics, { p05: number; p50: number; p95: number; sampleCount: number }>>;
  readonly flags: readonly string[];
};

function regularizedCovariance(cov: Matrix | undefined): Matrix | null {
  if (!cov || cov.length !== 3) return null;
  const trace = (cov[0]?.[0] ?? 0) + (cov[1]?.[1] ?? 0) + (cov[2]?.[2] ?? 0);
  if (!(trace > 0)) return null;
  // Tiny diagonal jitter keeps a numerically semi-definite covariance factorable.
  const jitter = trace * 1e-12;
  return cov.map((row, i) => row.map((v, j) => v + (i === j ? jitter : 0)));
}

/**
 * Propagates launch uncertainty (velocity covariance, spin covariance or relative spin sigma)
 * through the full air + ground simulation. Deterministic for a given seed.
 * Launch position uncertainty (millimetres) is ignored: its effect on distances is negligible.
 */
export function runMonteCarlo(launch: LaunchState, ctx: SimulationContext): MonteCarloSummary {
  const n = ctx.settings.monteCarloSamples;
  const flags: string[] = [];
  if (n <= 0) return { intervals: {}, flags: ["monte-carlo-disabled"] };
  const p0 = launch.ballPositionM.value;
  const v0 = launch.velocityMps.value;
  const w0 = launch.angularVelocityRadPerSec.value;
  if (!p0 || !v0 || !w0) return { intervals: {}, flags: ["monte-carlo-skipped-missing-launch"] };

  const velocityCov = regularizedCovariance(launch.velocityMps.uncertainty?.covariance);
  if (!velocityCov) flags.push("no-velocity-covariance");
  const spinCov = regularizedCovariance(launch.angularVelocityRadPerSec.uncertainty?.covariance);
  const spinSigma = launch.angularVelocityRadPerSec.uncertainty?.sigma;
  const spinRateRadPerSec = Math.sqrt(normSq(w0));
  const spinRelativeSigma =
    !spinCov && spinSigma !== undefined && spinRateRadPerSec > 0 ? spinSigma / spinRateRadPerSec : null;
  if (!spinCov && spinRelativeSigma === null) flags.push("no-spin-uncertainty");
  if (!velocityCov && !spinCov && spinRelativeSigma === null) {
    return { intervals: {}, flags: [...flags, "monte-carlo-skipped-no-uncertainty"] };
  }

  const mcCtx: SimulationContext = {
    ...ctx,
    settings: {
      ...ctx.settings,
      timestepS: Math.max(ctx.settings.timestepS, MONTE_CARLO_MIN_TIMESTEP_S),
      outputSampleIntervalS: Math.max(ctx.settings.outputSampleIntervalS, 1),
    },
  };
  const rng = createRng(ctx.settings.monteCarloSeed);
  const columns = new Map<keyof RawMetrics, number[]>();
  let failures = 0;

  for (let i = 0; i < n; i++) {
    let v: Vec3 = v0;
    if (velocityCov) {
      const s = sampleMultivariateNormal(rng, [v0.x, v0.y, v0.z], velocityCov);
      v = { x: s[0] as number, y: s[1] as number, z: s[2] as number };
    }
    let w: Vec3 = w0;
    if (spinCov) {
      const s = sampleMultivariateNormal(rng, [w0.x, w0.y, w0.z], spinCov);
      w = { x: s[0] as number, y: s[1] as number, z: s[2] as number };
    } else if (spinRelativeSigma !== null) {
      // Scale the spin magnitude, keeping the axis; a negative factor would flip the spin, so clamp at 0.
      w = scale(w0, Math.max(0, 1 + spinRelativeSigma * rng.normal()));
    }
    const trajectory = simulateTrajectory({ positionM: p0, velocityMps: v, angularVelocityRadPerSec: w }, mcCtx);
    if (typeof trajectory === "string") {
      failures++;
      continue;
    }
    const raw = computeRawMetrics(p0, v, trajectory.airFlight, trajectory.landing, trajectory.groundMotion);
    for (const key of RAW_METRIC_KEYS) {
      const value = raw[key];
      if (value === null) continue;
      let column = columns.get(key);
      if (!column) {
        column = [];
        columns.set(key, column);
      }
      column.push(value);
    }
  }
  if (failures > 0) flags.push(`monte-carlo-failed-samples:${failures}`);
  flags.push(`monte-carlo-samples:${n}`);

  const intervals: MonteCarloSummary["intervals"] = {};
  for (const [key, column] of columns) {
    if (column.length < Math.max(10, Math.ceil(0.5 * n))) continue;
    intervals[key] = {
      p05: quantile(column, 0.05),
      p50: quantile(column, 0.5),
      p95: quantile(column, 0.95),
      sampleCount: column.length,
    };
  }
  return { intervals, flags };
}

function penaltiesFor(ground: GroundMotionResult): Penalty[] {
  switch (ground.finalSurface) {
    case "water":
      return [{ kind: "water", strokes: 1, reason: "Ball came to rest in water." }];
    case "out-of-bounds":
      return [{ kind: "out-of-bounds", strokes: 1, reason: "Ball finished out of bounds (stroke and distance)." }];
    case "penalty-area":
      return [{ kind: "penalty-area", strokes: 1, reason: "Ball finished in a penalty area." }];
    default:
      return [];
  }
}

/**
 * Turns a launch state into a complete physical ShotResult with per-metric provenance and
 * Monte Carlo uncertainty intervals. Never fabricates spin: an unavailable spin returns a
 * reason instead of a result.
 */
export function simulateShot(launch: LaunchState, ctx: SimulationContext): SimulationOutcome {
  const blocker = simulationBlocker(launch);
  if (blocker) return { ok: false, reason: blocker };
  const p0 = launch.ballPositionM.value as Vec3;
  const v0 = launch.velocityMps.value as Vec3;
  const w0 = launch.angularVelocityRadPerSec.value as Vec3;

  const trajectory = simulateTrajectory({ positionM: p0, velocityMps: v0, angularVelocityRadPerSec: w0 }, ctx);
  if (typeof trajectory === "string") return { ok: false, reason: trajectory };

  const raw = computeRawMetrics(p0, v0, trajectory.airFlight, trajectory.landing, trajectory.groundMotion);
  const monteCarlo = runMonteCarlo(launch, ctx);
  const { metrics, simulationConfidence, warnings } = buildShotMetrics({
    launch,
    raw,
    intervals: monteCarlo.intervals,
    monteCarloFlags: monteCarlo.flags,
    environment: ctx.environment,
    ballProfile: ctx.ballProfile,
    modelVersion: `${PHYSICS_MODEL_VERSION}+${GROUND_MODEL_VERSION}`,
  });

  const allWarnings = [
    ...warnings,
    ...trajectory.airFlight.applicabilityWarnings,
    ...ctx.ballProfile.warnings,
  ];

  const result: ShotResult = {
    launch,
    airFlight: trajectory.airFlight,
    landing: trajectory.landing,
    groundMotion: trajectory.groundMotion,
    finalPositionM: trajectory.groundMotion.restPositionM,
    finalLie: surfaceToLie(trajectory.groundMotion.finalSurface),
    penalties: penaltiesFor(trajectory.groundMotion),
    scoringEvent: null,
    simulationConfidence,
    metrics,
    physics: {
      physicsModelVersion: PHYSICS_MODEL_VERSION,
      groundModelVersion: GROUND_MODEL_VERSION,
      ballProfileId: ctx.ballProfile.id,
      ballProfileVersion: ctx.ballProfile.version,
      environment: ctx.environment,
      terrainId: ctx.terrain.id,
      terrainVersion: ctx.terrain.version,
      settings: ctx.settings,
    },
    warnings: Array.from(new Set(allWarnings)),
  };
  // Schema validation guards against NaN or contract drift reaching storage or the UI.
  ShotResultSchema.parse(result);
  return { ok: true, result: deepFreeze(result) as ShotResult };
}

