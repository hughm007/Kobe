import { COORDINATE_SYSTEM_VERSION, LaunchStateSchema, SCHEMA_VERSION } from "@glm/shared-types";
import type { LaunchState, MeasurementSource, SpinObservation, Vec3 } from "@glm/shared-types";
import { describe, expect, it } from "vitest";
import {
  angularVelocityFromSpin,
  ballZoneFactor,
  type BuildLaunchStateInput,
  buildLaunchState,
  calibrationFactor,
  ESTIMATOR_VERSION,
  fitLaunchState,
  fitQualityFactor,
  gravityOnlyTrajectoryModel,
  launchMeasurementsFromFit,
  type LaunchFitSuccess,
  resolveSpin,
  SPIN_UNAVAILABLE_WARNING,
  triggerFactor,
} from "../src/index";
import { G, syntheticTrack } from "./helpers";

const model = gravityOnlyTrajectoryModel(G);
const RPM = 60 / (2 * Math.PI);

function okFit(seed = 41, count = 10): { fit: LaunchFitSuccess; v0: Vec3 } {
  const track = syntheticTrack({ seed, count });
  const fit = fitLaunchState(track.observations, { trajectoryModel: model });
  if (!fit.ok) throw new Error(fit.reason);
  return { fit, v0: track.v0 };
}

function spinObs(v: Vec3, method: SpinObservation["method"]): SpinObservation {
  return {
    kind: "spin",
    sensorId: "s",
    sequence: 99,
    timestampS: 10.01,
    method,
    angularVelocityRadPerSec: angularVelocityFromSpin({ totalSpinRadPerSec: 285, spinAxisTiltRad: -0.05, velocity: v }),
    covarianceRad2PerS2: [
      [25, 0, 0],
      [0, 25, 0],
      [0, 0, 25],
    ],
    validObservationCount: 20,
    fitResidualRad: 0.01,
    qualityFlags: ["synthetic"],
  };
}

function baseInput(overrides: Partial<BuildLaunchStateInput>): BuildLaunchStateInput {
  const { fit } = okFit();
  return {
    shotId: "shot-1",
    sessionId: "session-1",
    playerId: "player-1",
    timestampUtc: "2026-10-01T18:00:00.000Z",
    handedness: "right",
    clubId: "club-driver",
    ballId: "ball-1",
    dataOrigin: "synthetic",
    calibrationVersion: "cal-1",
    sensorConfigurationVersion: "sensor-1",
    ballProfileVersion: "ball-1@1",
    physicsModelVersion: "physics-test",
    fit,
    measuredSource: "synthetic",
    spin: null,
    extraFactors: [calibrationFactor("none", "synthetic"), triggerFactor(0.95)],
    ...overrides,
  };
}

function expectDeepFrozen(value: unknown, path = "state"): void {
  if (value === null || typeof value !== "object") return;
  expect(Object.isFrozen(value), path).toBe(true);
  for (const [k, v] of Object.entries(value)) expectDeepFrozen(v, `${path}.${k}`);
}

const NUMBER_FIELDS = [
  "ballSpeedMps",
  "verticalLaunchAngleDeg",
  "horizontalLaunchAngleDeg",
  "totalSpinRpm",
  "spinAxisTiltDeg",
] as const;
const CLUB_FIELDS = [
  "clubSpeedMps",
  "smashFactor",
  "attackAngleDeg",
  "clubPathDeg",
  "faceToTargetDeg",
  "faceToPathDeg",
  "dynamicLoftDeg",
  "dynamicLieDeg",
  "impactLocationMm",
  "closureRateDegPerSec",
  "lowPointM",
] as const;

describe("buildLaunchState", () => {
  it("synthetic stream with measured (synthetic) spin: schema-valid, frozen, synthetic in -> synthetic out", () => {
    const { fit, v0 } = okFit();
    const { velocityMps } = launchMeasurementsFromFit(fit, "synthetic");
    const spin = resolveSpin({
      spinObservations: [spinObs(fit.velocityMps, "synthetic")],
      velocity: velocityMps,
      clubCategory: "driver",
      playerSpinHistory: [],
      allowGenericFallback: false,
      measuredSource: "synthetic",
    });
    const state = buildLaunchState(baseInput({ fit, spin }));

    expect(() => LaunchStateSchema.parse(state)).not.toThrow();
    expectDeepFrozen(state);
    expect(state.schemaVersion).toBe(SCHEMA_VERSION);
    expect(state.coordinateSystemVersion).toBe(COORDINATE_SYSTEM_VERSION);
    expect(state.estimatorVersion).toBe(ESTIMATOR_VERSION);
    expect(state.launchTimeS).toBe(fit.referenceTimeS);
    expect(state.spinMode).toBe("measured");

    for (const key of ["ballPositionM", "velocityMps", "angularVelocityRadPerSec", ...NUMBER_FIELDS] as const) {
      expect(state[key].source, key).toBe("synthetic");
      expect(state[key].value, key).not.toBeNull();
    }
    expect(state.ballSpeedMps.value).toBeCloseTo(Math.hypot(fit.velocityMps.x, fit.velocityMps.y, fit.velocityMps.z), 12);
    expect(Math.abs((state.ballSpeedMps.value as number) - Math.hypot(v0.x, v0.y, v0.z))).toBeLessThan(
      3 * (state.ballSpeedMps.uncertainty?.sigma as number),
    );
    expect(state.totalSpinRpm.value).toBeCloseTo(285 * RPM, 6);
    expect(state.velocityMps.uncertainty?.covariance).toEqual(fit.diagnostics.velocityCovarianceM2PerS2);
    expect(state.fitDiagnostics).toEqual(fit.diagnostics);
    for (const key of CLUB_FIELDS) {
      expect(state[key].value, key).toBeNull();
      expect(state[key].source, key).toBe("unavailable");
      expect(state[key].qualityFlags, key).toContain("no-club-sensor");
    }
    expect(state.confidenceFactors.map((c) => c.id)).toEqual(["fit-quality", "observation-count", "spin-quality", "calibration", "trigger"]);
    expect(state.validity).toBe("valid");
    expect(state.overallConfidence).toBeGreaterThan(0.7);
    expect(state.rejectionReasons).toEqual([]);
    // The caller's fit object is not frozen by the builder.
    expect(Object.isFrozen(fit.diagnostics)).toBe(false);
  });

  it("measured stream with club-model spin is provisional and keeps estimated provenance for spin only", () => {
    const { fit } = okFit(42);
    const { velocityMps } = launchMeasurementsFromFit(fit, "measured-camera");
    const spin = resolveSpin({
      spinObservations: [],
      velocity: velocityMps,
      clubCategory: "driver",
      playerSpinHistory: [],
      allowGenericFallback: false,
      measuredSource: "measured-camera",
    });
    const state = buildLaunchState(
      baseInput({
        fit,
        spin,
        dataOrigin: "live",
        measuredSource: "measured-camera",
        extraFactors: [calibrationFactor("green", "live"), triggerFactor(0.95)],
      }),
    );
    expect(state.velocityMps.source).toBe("measured-camera");
    expect(state.ballSpeedMps.source).toBe("measured-camera");
    expect(state.totalSpinRpm.source).toBe("estimated-club-model");
    expect(state.spinAxisTiltDeg.value).toBeNull();
    expect(state.spinMode).toBe("estimated");
    expect(state.validity).toBe("provisional");
    expect(state.warnings).toContain("Spin estimated from club model; shot-shape accuracy reduced.");
  });

  it("a failed fit yields an invalid state with every launch value unavailable (no fabricated numbers)", () => {
    const failed = fitLaunchState(syntheticTrack({ seed: 3, count: 1 }).observations, { trajectoryModel: model });
    expect(failed.ok).toBe(false);
    if (failed.ok) return;
    const state = buildLaunchState(baseInput({ fit: failed }));
    expect(() => LaunchStateSchema.parse(state)).not.toThrow();
    expectDeepFrozen(state);
    expect(state.validity).toBe("invalid");
    expect(state.overallConfidence).toBe(0);
    expect(state.rejectionReasons).toContain(failed.reason);
    expect(state.launchTimeS).toBeNull();
    expect(state.fitDiagnostics).toBeNull();
    expect(state.spinMode).toBe("unavailable");
    for (const key of ["ballPositionM", "velocityMps", "angularVelocityRadPerSec", ...NUMBER_FIELDS] as const) {
      expect(state[key].value, key).toBeNull();
      expect(state[key].source, key).toBe("unavailable");
      expect(state[key].confidence, key).toBe(0);
    }
    expect(state.ballSpeedMps.qualityFlags).toContain("launch-fit-failed");
  });

  it("an unresolved spin is unavailable: provisional (not invalid), product warning, kinematics kept", () => {
    const state = buildLaunchState(baseInput({ spin: null }));
    expect(state.spinMode).toBe("unavailable");
    expect(state.totalSpinRpm.value).toBeNull();
    expect(state.totalSpinRpm.source).toBe("unavailable");
    expect(state.warnings).toContain(SPIN_UNAVAILABLE_WARNING);
    // Missing spin withholds spin-dependent outputs; it does not discredit the measured ball data.
    expect(state.validity).toBe("provisional");
    expect(state.overallConfidence).toBeGreaterThan(0);
    expect(state.rejectionReasons).toEqual([]);
    const spinFactor = state.confidenceFactors.find((f) => f.id === "spin-quality");
    expect(spinFactor?.weight).toBe(0);
    expect(state.ballSpeedMps.value).not.toBeNull(); // launch kinematics are still reported
  });

  it("residuals far above the reported noise (chi2/dof) lower fit quality and the launch confidence", () => {
    const track = syntheticTrack({ seed: 41, count: 10 });
    // Reported sigma 3x too small: the covariance is inflated, but the fit is not trusted.
    const optimistic = track.observations.map((o) => ({ ...o, covarianceM2: o.covarianceM2.map((row) => row.map((x) => x / 9)) }));
    const fit = fitLaunchState(optimistic, { trajectoryModel: model });
    if (!fit.ok) throw new Error(fit.reason);
    expect(fit.chiSquare / fit.degreesOfFreedom).toBeGreaterThan(4);
    const honest = buildLaunchState(baseInput({}));
    const state = buildLaunchState(baseInput({ fit }));
    const quality = (s: LaunchState) => s.confidenceFactors.find((f) => f.id === "fit-quality")?.score as number;
    expect(quality(honest)).toBeGreaterThan(0.85);
    // The penalty comes from chi2/dof: the contract diagnostics alone would score it higher.
    expect(quality(state)).toBeLessThan(0.7);
    expect(quality(state)).toBeLessThan(fitQualityFactor(fit.diagnostics).score);
    expect(state.ballSpeedMps.confidence).toBeLessThan(0.7);
    expect(state.ballSpeedMps.confidence).toBeLessThan(honest.ballSpeedMps.confidence);
    expect(state.warnings.some((w) => /chi\^2\/dof/.test(w))).toBe(true);
  });

  it("a club-prior spin vector oriented by a synthetic velocity stays labelled as an estimate", () => {
    const { fit } = okFit();
    const { velocityMps } = launchMeasurementsFromFit(fit, "synthetic");
    const spin = resolveSpin({
      spinObservations: [],
      velocity: velocityMps,
      clubCategory: "driver",
      playerSpinHistory: [],
      allowGenericFallback: false,
      measuredSource: "synthetic",
    });
    const state = buildLaunchState(baseInput({ fit, spin }));
    expect(state.spinMode).toBe("estimated");
    expect(state.angularVelocityRadPerSec.source).toBe("estimated-club-model");
    expect(state.angularVelocityRadPerSec.confidence).toBeLessThanOrEqual(velocityMps.confidence);
    expect(state.totalSpinRpm.source).toBe("estimated-club-model");
    expect(state.spinAxisTiltDeg.value).toBeNull();
  });

  it("blocking extra factors invalidate the shot with their message", () => {
    const state = buildLaunchState(
      baseInput({
        extraFactors: [
          ballZoneFactor({
            kind: "ball-address",
            sensorId: "cam",
            sequence: 0,
            timestampS: 9.9,
            positionM: { x: 0.5, y: 0, z: 0 },
            stationary: true,
            inHittingZone: false,
            ballCount: 1,
            confidence: 0.9,
          }),
        ],
      }),
    );
    expect(state.validity).toBe("invalid");
    expect(state.rejectionReasons).toContain("Ball was outside calibrated hitting zone.");
  });

  it("rejects duplicate built-in factors and non-measured labels", () => {
    const { fit } = okFit();
    expect(() => buildLaunchState(baseInput({ extraFactors: [{ id: "fit-quality", label: "x", score: 1, weight: 1, detail: "x", blocking: false }] }))).toThrow(
      /built-in/,
    );
    expect(() => buildLaunchState(baseInput({ fit, measuredSource: "estimated-club-model" as MeasurementSource }))).toThrow(/measuredSource/);
  });

  it("never labels synthetic data as measured", () => {
    const { fit } = okFit();
    expect(() => buildLaunchState(baseInput({ fit, dataOrigin: "synthetic", measuredSource: "measured-camera" }))).toThrow(
      /requires measuredSource "synthetic"/,
    );
    // A spin resolution that claims measured-camera inside a synthetic launch state is refused.
    const { velocityMps } = launchMeasurementsFromFit(fit, "measured-camera");
    const measuredSpin = resolveSpin({
      spinObservations: [{ ...spinObs(fit.velocityMps, "marked-ball") }],
      velocity: velocityMps,
      clubCategory: "driver",
      playerSpinHistory: [],
      allowGenericFallback: false,
      measuredSource: "measured-camera",
    });
    expect(measuredSpin.angularVelocity.source).toBe("measured-camera");
    expect(() => buildLaunchState(baseInput({ fit, spin: measuredSpin }))).toThrow(/labelled "measured-camera" in a synthetic/);
  });

  it("validates the result against LaunchStateSchema (throws on contract violations)", () => {
    expect(() => buildLaunchState(baseInput({ shotId: "" }))).toThrow();
    expect(() => buildLaunchState(baseInput({ timestampUtc: "yesterday" }))).toThrow();
    const ok: LaunchState = buildLaunchState(baseInput({}));
    expect(ok.shotId).toBe("shot-1");
  });
});
