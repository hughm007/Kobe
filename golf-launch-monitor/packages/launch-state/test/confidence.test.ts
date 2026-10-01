import type { BallAddressObservation, ConfidenceFactor, LaunchFitDiagnostics, SensorHealth } from "@glm/shared-types";
import { describe, expect, it } from "vitest";
import {
  aggregateConfidence,
  ballZoneFactor,
  calibrationFactor,
  CONFIDENCE_INVALID_BELOW,
  CONFIDENCE_VALID_AT_OR_ABOVE,
  fitQualityFactor,
  observationCountFactor,
  sensorHealthFactor,
  SYNC_DRIFT_WARNING,
  triggerFactor,
} from "../src/index";

const f = (id: string, score: number, weight = 1, blocking = false, detail = `${id} detail`): ConfidenceFactor => ({
  id,
  label: id,
  score,
  weight,
  detail,
  blocking,
});
const LIVE_MEASURED = { spinMode: "measured", dataOrigin: "live" } as const;

describe("aggregateConfidence", () => {
  it("is the weighted geometric mean of factor scores", () => {
    expect(aggregateConfidence([f("a", 0.81), f("b", 1)], LIVE_MEASURED).overallConfidence).toBeCloseTo(0.9, 12);
    expect(aggregateConfidence([f("a", 0.5, 3), f("b", 1, 1)], LIVE_MEASURED).overallConfidence).toBeCloseTo(0.5 ** 0.75, 12);
    expect(aggregateConfidence([f("a", 0.6, 2), f("b", 0.9, 1)], LIVE_MEASURED).overallConfidence).toBeCloseTo(
      Math.exp((2 * Math.log(0.6) + Math.log(0.9)) / 3),
      12,
    );
  });

  it("a zero-score factor with weight > 0 forces 0 (and invalid); with weight 0 it is ignored", () => {
    const zero = aggregateConfidence([f("a", 1), f("spin", 0, 1.5, false, "Spin unavailable.")], LIVE_MEASURED);
    expect(zero.overallConfidence).toBe(0);
    expect(zero.validity).toBe("invalid");
    expect(zero.rejectionReasons.join(" ")).toMatch(/below the minimum 0\.35.*Spin unavailable/);
    expect(aggregateConfidence([f("a", 0.9), f("b", 0, 0)], LIVE_MEASURED).overallConfidence).toBeCloseTo(0.9, 12);
  });

  it("any blocking factor makes the state invalid with its detail as a rejection reason", () => {
    const r = aggregateConfidence([f("a", 1), f("zone", 0.9, 1, true, "Ball was outside calibrated hitting zone.")], LIVE_MEASURED);
    expect(r.validity).toBe("invalid");
    expect(r.overallConfidence).toBeGreaterThan(0.9);
    expect(r.rejectionReasons).toEqual(["Ball was outside calibrated hitting zone."]);
  });

  it("applies the documented thresholds", () => {
    expect(CONFIDENCE_INVALID_BELOW).toBe(0.35);
    expect(CONFIDENCE_VALID_AT_OR_ABOVE).toBe(0.7);
    expect(aggregateConfidence([f("a", 0.349)], LIVE_MEASURED).validity).toBe("invalid");
    expect(aggregateConfidence([f("a", 0.35)], LIVE_MEASURED).validity).toBe("provisional");
    expect(aggregateConfidence([f("a", 0.699)], LIVE_MEASURED).validity).toBe("provisional");
    expect(aggregateConfidence([f("a", 0.7)], LIVE_MEASURED).validity).toBe("valid");
    expect(aggregateConfidence([f("a", 0.95)], { spinMode: "estimated", dataOrigin: "live" }).validity).toBe("provisional");
    expect(aggregateConfidence([f("a", 0.95)], { spinMode: "assumed-generic-fallback", dataOrigin: "live" }).validity).toBe("provisional");
    expect(aggregateConfidence([f("a", 0.95)], { spinMode: "measured", dataOrigin: "manual" }).validity).toBe("provisional");
    expect(aggregateConfidence([f("a", 0.95)], { spinMode: "measured", dataOrigin: "synthetic" }).validity).toBe("valid");
  });

  it("surfaces weak non-blocking factors as warnings and validates inputs", () => {
    const r = aggregateConfidence([f("a", 0.6, 1, false, "weak thing"), f("b", 0.95, 1, false, "fine thing")], LIVE_MEASURED);
    expect(r.warnings).toEqual(["weak thing"]);
    expect(aggregateConfidence([], LIVE_MEASURED).validity).toBe("invalid");
    expect(() => aggregateConfidence([f("a", 1.2)], LIVE_MEASURED)).toThrow(/score/);
    expect(() => aggregateConfidence([f("a", Number.NaN)], LIVE_MEASURED)).toThrow(/score/);
    expect(() => aggregateConfidence([f("a", 0.5, -1)], LIVE_MEASURED)).toThrow(/weight/);
  });
});

describe("factor builders", () => {
  it("calibrationFactor: red blocks live/replay; none is acceptable only for synthetic/manual", () => {
    expect(calibrationFactor("green", "live")).toMatchObject({ id: "calibration", score: 1, blocking: false });
    expect(calibrationFactor("yellow", "live")).toMatchObject({ score: 0.6, blocking: false });
    expect(calibrationFactor("red", "live").blocking).toBe(true);
    expect(calibrationFactor("red", "replay").blocking).toBe(true);
    expect(calibrationFactor("red", "synthetic").blocking).toBe(false);
    expect(calibrationFactor("none", "live").blocking).toBe(true);
    expect(calibrationFactor("none", "replay").blocking).toBe(true);
    expect(calibrationFactor("none", "synthetic")).toMatchObject({ score: 1, blocking: false });
    expect(calibrationFactor("none", "manual")).toMatchObject({ score: 1, blocking: false });
  });

  it("observationCountFactor rewards more post-impact frames", () => {
    expect(observationCountFactor(1)).toMatchObject({ score: 0, blocking: true });
    expect(observationCountFactor(2).score).toBe(0.35);
    expect(observationCountFactor(2).detail).toBe("Insufficient post-impact frames for high-confidence ball speed.");
    expect(observationCountFactor(3).score).toBeLessThan(observationCountFactor(5).score);
    expect(observationCountFactor(6)).toMatchObject({ score: 1, blocking: false });
  });

  it("triggerFactor maps trigger confidence and handles a missing trigger", () => {
    expect(triggerFactor(null).score).toBe(0.5);
    expect(triggerFactor(1).score).toBe(1);
    expect(triggerFactor(0).score).toBeCloseTo(0.3, 12);
    expect(() => triggerFactor(1.5)).toThrow();
  });

  const address = (o: Partial<BallAddressObservation> = {}): BallAddressObservation => ({
    kind: "ball-address",
    sensorId: "cam",
    sequence: 0,
    timestampS: 0,
    positionM: { x: 0, y: 0, z: 0 },
    stationary: true,
    inHittingZone: true,
    ballCount: 1,
    confidence: 0.95,
    ...o,
  });

  it("ballZoneFactor blocks outside-zone and multiple balls", () => {
    expect(ballZoneFactor(address())).toMatchObject({ id: "ball-zone", blocking: false });
    expect(ballZoneFactor(address()).score).toBeCloseTo(0.975, 12);
    expect(ballZoneFactor(address({ inHittingZone: false }))).toMatchObject({
      blocking: true,
      detail: "Ball was outside calibrated hitting zone.",
    });
    expect(ballZoneFactor(address({ ballCount: 2 })).blocking).toBe(true);
    expect(ballZoneFactor(null).blocking).toBe(false);
    expect(ballZoneFactor(address({ stationary: false })).score).toBe(0.5);
  });

  const health = (o: Partial<SensorHealth> = {}): SensorHealth => ({
    sensorId: "cam",
    status: "ok",
    checkedUtc: "2026-10-01T18:00:00.000Z",
    metrics: [],
    messages: [],
    calibrationStatus: "green",
    ...o,
  });

  it("sensorHealthFactor warns on sync drift and blocks failed sensors", () => {
    expect(sensorHealthFactor(health()).score).toBe(1);
    const drift = sensorHealthFactor(
      health({ metrics: [{ id: "sync-drift", label: "Sync drift", value: 0.002, unit: "s", status: "warn", detail: "2 ms" }] }),
    );
    expect(drift.detail).toBe(SYNC_DRIFT_WARNING);
    expect(drift.detail).toBe("Camera synchronization drift detected; launch direction may be unreliable.");
    expect(drift.score).toBeLessThan(0.7);
    expect(aggregateConfidence([drift], LIVE_MEASURED).warnings).toContain(SYNC_DRIFT_WARNING);
    expect(sensorHealthFactor(health({ status: "failed" })).blocking).toBe(true);
    expect(sensorHealthFactor(health({ status: "disconnected" })).blocking).toBe(true);
    expect(sensorHealthFactor(null)).toMatchObject({ score: 0.6, blocking: false });
  });

  const diagnostics = (o: Partial<LaunchFitDiagnostics> = {}): LaunchFitDiagnostics => ({
    model: "gravity-only",
    observationCount: 10,
    inlierCount: 10,
    timeSpanS: 0.02,
    rmsResidualM: 0.002,
    maxResidualM: 0.004,
    iterations: 3,
    converged: true,
    positionCovarianceM2: [[1e-6, 0, 0], [0, 1e-6, 0], [0, 0, 1e-6]],
    velocityCovarianceM2PerS2: [[0.01, 0, 0], [0, 0.01, 0], [0, 0, 0.01]],
    ...o,
  });

  it("fitQualityFactor scores residual, velocity uncertainty, inliers and convergence", () => {
    expect(fitQualityFactor(diagnostics()).score).toBe(1);
    const poorResidual = fitQualityFactor(diagnostics({ rmsResidualM: 0.02 }));
    expect(poorResidual.score).toBeCloseTo(0.3, 12);
    expect(poorResidual.detail).toMatch(/low/);
    expect(fitQualityFactor(diagnostics({ converged: false })).score).toBe(0.5);
    expect(fitQualityFactor(diagnostics({ inlierCount: 5 })).score).toBe(0.4);
    const poorVelocity = fitQualityFactor(diagnostics({ velocityCovarianceM2PerS2: [[0.75, 0, 0], [0, 0.75, 0], [0, 0, 0.75]] }));
    expect(poorVelocity.score).toBeCloseTo(0.3, 12);
  });

  it("fitQualityFactor penalises chi2/dof above the noise-understated threshold", () => {
    const d = diagnostics();
    // chi2/dof <= 4: no penalty (and no penalty without statistics or with dof = 0).
    expect(fitQualityFactor(d, { chiSquare: 24, degreesOfFreedom: 24 }).score).toBe(1);
    expect(fitQualityFactor(d, { chiSquare: 96, degreesOfFreedom: 24 }).score).toBe(1);
    expect(fitQualityFactor(d, { chiSquare: 50, degreesOfFreedom: 0 }).score).toBe(1);
    expect(fitQualityFactor(d, null).score).toBe(1);
    // chi2/dof = 6.5: halfway along the ramp 4 -> 9, i.e. 1 - 0.7 * 0.5.
    expect(fitQualityFactor(d, { chiSquare: 6.5 * 24, degreesOfFreedom: 24 }).score).toBeCloseTo(0.65, 12);
    // chi2/dof = 9.6 (residuals ~3x the reported noise): poor, flagged as low quality.
    const poor = fitQualityFactor(d, { chiSquare: 9.6 * 24, degreesOfFreedom: 24 });
    expect(poor.score).toBeCloseTo((0.3 * 9) / 9.6, 12);
    expect(poor.detail).toMatch(/low/);
    expect(poor.detail).toMatch(/chi\^2\/dof 9\.6/);
  });
});
