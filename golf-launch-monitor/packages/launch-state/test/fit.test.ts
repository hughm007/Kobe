import { cholesky, norm } from "@glm/core-math";
import type { BallPosition3dObservation, Vec3 } from "@glm/shared-types";
import { describe, expect, it } from "vitest";
import {
  deriveBallSpeedMps,
  fitLaunchState,
  gravityOnlyTrajectoryModel,
  INSUFFICIENT_FRAMES_WARNING,
  type LaunchFitSuccess,
  makeMeasurement,
  MAX_OUTLIER_NOISE_SCALE,
  type TrajectoryModel,
} from "../src/index";
import { G, gravityTruth, syntheticTrack } from "./helpers";

const model = gravityOnlyTrajectoryModel(G);

function expectSuccess(fit: ReturnType<typeof fitLaunchState>): LaunchFitSuccess {
  if (!fit.ok) throw new Error(`expected a successful fit, got: ${fit.reason}`);
  return fit;
}

function paramErrors(fit: LaunchFitSuccess, p: Vec3, v: Vec3): { err: number[]; sigma: number[] } {
  const est = [fit.positionM.x, fit.positionM.y, fit.positionM.z, fit.velocityMps.x, fit.velocityMps.y, fit.velocityMps.z];
  const truth = [p.x, p.y, p.z, v.x, v.y, v.z];
  return {
    err: est.map((e, i) => e - (truth[i] as number)),
    sigma: fit.covariance6.map((row, i) => Math.sqrt(row[i] as number)),
  };
}

describe("gravityOnlyTrajectoryModel", () => {
  it("is p0 + v0 t - 0.5 g t^2 Z", () => {
    const [p] = gravityOnlyTrajectoryModel(9.8).predict({ x: 1, y: 2, z: 3 }, { x: 10, y: -1, z: 5 }, [0.5]);
    expect(p).toEqual({ x: 6, y: 1.5, z: 3 + 2.5 - 0.5 * 9.8 * 0.25 });
    expect(() => gravityOnlyTrajectoryModel(Number.NaN)).toThrow();
  });
});

describe("fitLaunchState", () => {
  it("recovers the exact state from noise-free observations", () => {
    const track = syntheticTrack({ seed: 1, count: 8, noise: false });
    const fit = expectSuccess(fitLaunchState(track.observations, { trajectoryModel: model }));
    expect(fit.referenceTimeS).toBe(track.t0);
    expect(norm({ x: fit.velocityMps.x - track.v0.x, y: fit.velocityMps.y - track.v0.y, z: fit.velocityMps.z - track.v0.z })).toBeLessThan(1e-7);
    expect(norm({ x: fit.positionM.x - track.p0.x, y: fit.positionM.y - track.p0.y, z: fit.positionM.z - track.p0.z })).toBeLessThan(1e-9);
    expect(fit.diagnostics.converged).toBe(true);
    expect(fit.diagnostics.rmsResidualM).toBeLessThan(1e-9);
    expect(fit.covarianceScale).toBe(1);
  });

  it("recovers truth from noisy gravity-only observations within 3 sigma of the reported covariance", () => {
    // Fixed-seed spot checks on a contiguous seed range (none excluded); statistical
    // calibration over many seeds is the next test. 5 seeds x 6 parameters = 30 z-scores: a
    // calibrated fit exceeds 3 sigma with probability 0.27 % each, so allow at most one
    // 3-sigma excursion and none beyond 4 sigma. (Seed 12 has one: px at -3.25 sigma.)
    let beyond3 = 0;
    for (const seed of [10, 11, 12, 13, 14]) {
      const track = syntheticTrack({ seed, count: 10 });
      const fit = expectSuccess(fitLaunchState(track.observations, { trajectoryModel: model }));
      const { err, sigma } = paramErrors(fit, track.p0, track.v0);
      err.forEach((e, i) => {
        expect(Math.abs(e)).toBeLessThan(4 * (sigma[i] as number));
        if (Math.abs(e) > 3 * (sigma[i] as number)) beyond3++;
      });
      // Errors are not trivially zero: the test would catch a fit that ignored the data.
      expect(Math.max(...err.slice(3).map(Math.abs))).toBeGreaterThan(1e-3);
      expect(fit.diagnostics.converged).toBe(true);
      expect(fit.inlierSequences).toHaveLength(10);
      expect(fit.rejectedSequences).toEqual([]);
    }
    expect(beyond3).toBeLessThanOrEqual(1);
  });

  it("reports a CALIBRATED covariance: 1-sigma ball-speed coverage over 300 seeded trials is 0.68 +/- 0.07", () => {
    const trials = 300;
    let covered = 0;
    let falseRejections = 0;
    const paramWithin1 = new Array<number>(6).fill(0);
    const paramWithin3 = new Array<number>(6).fill(0);
    for (let s = 0; s < trials; s++) {
      const track = syntheticTrack({ seed: 1000 + s, count: 10 });
      const fit = expectSuccess(fitLaunchState(track.observations, { trajectoryModel: model }));
      falseRejections += fit.rejectedSequences.length;
      const { err, sigma } = paramErrors(fit, track.p0, track.v0);
      err.forEach((e, i) => {
        if (Math.abs(e) <= (sigma[i] as number)) paramWithin1[i]++;
        if (Math.abs(e) <= 3 * (sigma[i] as number)) paramWithin3[i]++;
      });
      const speed = deriveBallSpeedMps(
        makeMeasurement<Vec3>({
          value: fit.velocityMps,
          unit: "m/s",
          source: "synthetic",
          confidence: 1,
          uncertainty: { covariance: fit.diagnostics.velocityCovarianceM2PerS2, unit: "m/s" },
        }),
      );
      if (Math.abs((speed.value as number) - norm(track.v0)) <= (speed.uncertainty?.sigma as number)) covered++;
    }
    const coverage = covered / trials;
    expect(coverage).toBeGreaterThan(0.61);
    expect(coverage).toBeLessThan(0.75);
    // Every fitted parameter is calibrated too, not just the derived speed.
    for (let i = 0; i < 6; i++) {
      expect((paramWithin1[i] as number) / trials).toBeGreaterThan(0.61);
      expect((paramWithin1[i] as number) / trials).toBeLessThan(0.75);
      expect((paramWithin3[i] as number) / trials).toBeGreaterThanOrEqual(0.99);
    }
    // Honest noise, no outliers: a 4-sigma test on chi2(3)-distributed standardised norms
    // rejects ~0.1 % of 3000 observations (~3). Raw whitened norms of excluded end-of-track
    // observations (an extrapolation) were rejected ~10x as often.
    expect(falseRejections).toBeLessThanOrEqual(6);
  });

  it("inflates the covariance by chi2/dof when the reported noise is optimistic, without discarding data", () => {
    const track = syntheticTrack({ seed: 77, count: 12 });
    const optimistic = track.observations.map((o) => ({ ...o, covarianceM2: o.covarianceM2.map((row) => row.map((x) => x / 9)) }));
    const honest = expectSuccess(fitLaunchState(track.observations, { trajectoryModel: model }));
    const fit = expectSuccess(fitLaunchState(optimistic, { trajectoryModel: model }));
    expect(fit.covarianceScale).toBeGreaterThan(4);
    expect(fit.qualityFlags).toContain("position-noise-understated");
    expect(fit.rejectedSequences).toEqual([]);
    // The outlier threshold followed the actual scatter (3x the reported sigma), within the cap.
    expect(fit.outlierNoiseScale).toBeGreaterThan(2);
    expect(fit.outlierNoiseScale).toBeLessThanOrEqual(MAX_OUTLIER_NOISE_SCALE);
    expect(honest.outlierNoiseScale).toBeLessThan(1.5);
    // Inflated covariance is comparable to the honest one (same data, same weighting shape).
    const ratio = (fit.covariance6[3]![3] as number) / (honest.covariance6[3]![3] as number);
    expect(ratio).toBeGreaterThan(0.5);
    expect(ratio).toBeLessThan(2);
  });

  it("rejects injected outliers and still recovers the truth", () => {
    const track = syntheticTrack({ seed: 21, count: 12 });
    const corrupted = track.observations.map((o) => {
      if (o.sequence === 4) return { ...o, positionM: { ...o.positionM, z: o.positionM.z + 0.04 } };
      if (o.sequence === 9) return { ...o, positionM: { ...o.positionM, y: o.positionM.y - 0.03 } };
      return o;
    });
    const naive = expectSuccess(fitLaunchState(corrupted, { trajectoryModel: model, outlierThresholdSigma: 1e9 }));
    expect(naive.rejectedSequences).toEqual([]);
    const fit = expectSuccess(fitLaunchState(corrupted, { trajectoryModel: model }));
    expect(fit.rejectedSequences).toEqual([4, 9]);
    expect(fit.inlierSequences).not.toContain(4);
    expect(fit.inlierSequences).toHaveLength(10);
    expect(fit.qualityFlags).toContain("outliers-rejected");
    expect(fit.warnings.some((w) => w.includes("outlier") && w.includes("4, 9"))).toBe(true);
    expect(fit.diagnostics.observationCount).toBe(12);
    expect(fit.diagnostics.inlierCount).toBe(10);
    const { err, sigma } = paramErrors(fit, track.p0, track.v0);
    err.forEach((e, i) => expect(Math.abs(e)).toBeLessThan(3 * (sigma[i] as number)));
    // The naive fit is pulled far away by the outliers.
    const naiveErr = paramErrors(naive, track.p0, track.v0).err;
    expect(Math.max(...naiveErr.slice(3).map(Math.abs))).toBeGreaterThan(Math.max(...err.slice(3).map(Math.abs)) * 3);
  });

  it("rejects two adjacent outliers at the end of the track (masking) and keeps the fit calibrated", () => {
    // The last two frames carry the most leverage on vz: an all-data fit absorbs most of their
    // offset, so naive residual screening misses them. Over 100 seeds each: both outliers are
    // rejected and the velocity stays within 3 reported sigma.
    const cases = [
      { count: 10, shiftM: 0.03, bad: [8, 9] }, // ~7-20 sigma in z
      { count: 8, shiftM: 0.1, bad: [6, 7] },
    ];
    for (const { count, shiftM, bad } of cases) {
      const trials = 100;
      let caught = 0;
      let exact = 0;
      let covered = 0;
      for (let s = 0; s < trials; s++) {
        const track = syntheticTrack({ seed: 500 + s, count });
        const corrupted = track.observations.map((o) =>
          bad.includes(o.sequence) ? { ...o, positionM: { ...o.positionM, z: o.positionM.z + shiftM } } : o,
        );
        const fit = expectSuccess(fitLaunchState(corrupted, { trajectoryModel: model }));
        if (bad.every((b) => fit.rejectedSequences.includes(b))) caught++;
        if (fit.rejectedSequences.length === bad.length) exact++;
        const { err, sigma } = paramErrors(fit, track.p0, track.v0);
        if ([3, 4, 5].every((i) => Math.abs(err[i] as number) <= 3 * (sigma[i] as number))) covered++;
      }
      expect(caught).toBeGreaterThanOrEqual(97);
      expect(exact).toBeGreaterThanOrEqual(97);
      expect(covered).toBeGreaterThanOrEqual(95);
    }
  });

  it("reports the effective outlier threshold (sigma x robust noise scale) in the warning", () => {
    const track = syntheticTrack({ seed: 9001, count: 10 });
    const corrupted = track.observations.map((o) =>
      o.sequence >= 8 ? { ...o, positionM: { ...o.positionM, z: o.positionM.z + 0.03 } } : o,
    );
    const fit = expectSuccess(fitLaunchState(corrupted, { trajectoryModel: model }));
    expect(fit.rejectedSequences).toEqual([8, 9]);
    expect(fit.outlierNoiseScale).toBeGreaterThan(1);
    const effective = (4 * fit.outlierNoiseScale).toFixed(2);
    expect(fit.warnings.some((w) => w.includes(`above ${effective} sigma (4 sigma x robust noise scale`))).toBe(true);
    const { err, sigma } = paramErrors(fit, track.p0, track.v0);
    err.forEach((e, i) => expect(Math.abs(e)).toBeLessThan(3 * (sigma[i] as number)));
  });

  it("does not reject outliers with fewer than 5 observations", () => {
    const track = syntheticTrack({ seed: 22, count: 4, noise: false });
    const corrupted = track.observations.map((o) => (o.sequence === 2 ? { ...o, positionM: { ...o.positionM, z: o.positionM.z + 0.05 } } : o));
    const fit = expectSuccess(fitLaunchState(corrupted, { trajectoryModel: model }));
    expect(fit.rejectedSequences).toEqual([]);
    expect(fit.inlierSequences).toEqual([0, 1, 2, 3]);
  });

  it("never rejects below minObservations", () => {
    const track = syntheticTrack({ seed: 23, count: 6, noise: false });
    // Every point disagrees wildly: rejection must stop at the floor.
    const scrambled = track.observations.map((o, i) => ({ ...o, positionM: { ...o.positionM, z: o.positionM.z + (i % 2 ? 0.05 : -0.05) * i } }));
    const fit = expectSuccess(fitLaunchState(scrambled, { trajectoryModel: model, minObservations: 4 }));
    expect(fit.inlierSequences).toHaveLength(4);
    expect(fit.rejectedSequences).toHaveLength(2);
    expect(fit.qualityFlags).toContain("outliers-rejected");
  });

  it("allows exactly two observations but flags a minimal two-frame fit", () => {
    const track = syntheticTrack({ seed: 3, count: 2, noise: false, frameIntervalS: 0.004 });
    const fit = expectSuccess(fitLaunchState(track.observations, { trajectoryModel: model }));
    expect(fit.qualityFlags).toContain("minimal-two-frame-fit");
    expect(fit.warnings).toContain(INSUFFICIENT_FRAMES_WARNING);
    expect(fit.degreesOfFreedom).toBe(0);
    expect(fit.covarianceScale).toBe(1);
    expect(Math.abs(fit.velocityMps.x - track.v0.x)).toBeLessThan(1e-6);
    expect(Math.abs(fit.velocityMps.z - track.v0.z)).toBeLessThan(1e-6);
    expect(cholesky(fit.covariance6)).not.toBeNull();
  });

  it("warns about insufficient frames below 6 observations only", () => {
    const five = expectSuccess(fitLaunchState(syntheticTrack({ seed: 4, count: 5 }).observations, { trajectoryModel: model }));
    expect(five.warnings).toContain(INSUFFICIENT_FRAMES_WARNING);
    expect(five.qualityFlags).not.toContain("minimal-two-frame-fit");
    const six = expectSuccess(fitLaunchState(syntheticTrack({ seed: 4, count: 6 }).observations, { trajectoryModel: model }));
    expect(six.warnings).not.toContain(INSUFFICIENT_FRAMES_WARNING);
  });

  it("fails with fewer than two usable observations", () => {
    const one = fitLaunchState(syntheticTrack({ seed: 5, count: 1 }).observations, { trajectoryModel: model });
    expect(one.ok).toBe(false);
    if (!one.ok) {
      expect(one.reason).toMatch(/Fewer than two usable/);
      expect(one.qualityFlags).toContain("insufficient-observations");
    }
    const none = fitLaunchState([], { trajectoryModel: model });
    expect(none.ok).toBe(false);
    if (!none.ok) expect(none.reason).toMatch(/No post-impact ball positions/);
  });

  it("excludes observations earlier than the reference time, with a warning", () => {
    const track = syntheticTrack({ seed: 6, count: 10 });
    const ref = track.t0 + 2 * 0.002;
    const fit = expectSuccess(fitLaunchState(track.observations, { trajectoryModel: model, referenceTimeS: ref }));
    expect(fit.referenceTimeS).toBe(ref);
    expect(fit.rejectedSequences).toEqual([0, 1]);
    expect(fit.inlierSequences).toEqual([2, 3, 4, 5, 6, 7, 8, 9]);
    expect(fit.qualityFlags).toContain("observations-before-reference-excluded");
    expect(fit.warnings.some((w) => w.includes("earlier than the launch reference time"))).toBe(true);
    // The state refers to the reference time, not the first observation.
    const truthAtRef = gravityTruth(track.p0, track.v0, ref - track.t0);
    const vAtRef = { x: track.v0.x, y: track.v0.y, z: track.v0.z - G * (ref - track.t0) };
    const { err, sigma } = paramErrors(fit, truthAtRef, vAtRef);
    err.forEach((e, i) => expect(Math.abs(e)).toBeLessThan(3 * (sigma[i] as number)));
  });

  it("extrapolates to a reference time before the first observation (launch at address)", () => {
    const track = syntheticTrack({ seed: 7, count: 8, noise: false });
    const ref = track.t0 - 0.003;
    const fit = expectSuccess(fitLaunchState(track.observations, { trajectoryModel: model, referenceTimeS: ref }));
    const p = gravityTruth(track.p0, track.v0, -0.003);
    expect(Math.abs(fit.positionM.x - p.x)).toBeLessThan(1e-8);
    expect(Math.abs(fit.velocityMps.z - (track.v0.z + G * 0.003))).toBeLessThan(1e-6);
    expect(fit.rejectedSequences).toEqual([]);
  });

  it("rejects an observation whose covariance is not positive definite", () => {
    const track = syntheticTrack({ seed: 8, count: 9 });
    const bad = track.observations.map((o) =>
      o.sequence === 3
        ? {
            ...o,
            covarianceM2: [
              [1e-6, 2e-6, 0],
              [2e-6, 1e-6, 0],
              [0, 0, 1e-6],
            ],
          }
        : o,
    );
    const fit = expectSuccess(fitLaunchState(bad, { trajectoryModel: model }));
    expect(fit.rejectedSequences).toEqual([3]);
    expect(fit.inlierSequences).not.toContain(3);
    expect(fit.qualityFlags).toContain("non-pd-covariance-rejected");
    expect(fit.warnings.some((w) => w.includes("not symmetric positive definite"))).toBe(true);
    expect(fit.diagnostics.observationCount).toBe(8);
  });

  it("rejects observations with a null covariance or position (and null entries) instead of throwing", () => {
    const track = syntheticTrack({ seed: 8, count: 9 });
    const bad = track.observations.map((o) =>
      o.sequence === 2 ? { ...o, covarianceM2: null } : o.sequence === 5 ? { ...o, positionM: null } : o,
    ) as unknown as BallPosition3dObservation[];
    const fit = expectSuccess(fitLaunchState([...bad, null as unknown as BallPosition3dObservation], { trajectoryModel: model }));
    expect(fit.rejectedSequences).toEqual([2, 5]);
    expect(fit.inlierSequences).toHaveLength(7);
    expect(fit.qualityFlags).toContain("non-pd-covariance-rejected");
    expect(fit.qualityFlags).toContain("malformed-observations-rejected");
    expect(fit.warnings.some((w) => w.startsWith("Rejected 2 malformed ball position(s)"))).toBe(true);
  });

  it("populates diagnostics consistently", () => {
    const track = syntheticTrack({ seed: 9, count: 10 });
    const fit = expectSuccess(fitLaunchState(track.observations, { trajectoryModel: model }));
    const d = fit.diagnostics;
    expect(d.model).toBe(model.id);
    expect(d.observationCount).toBe(10);
    expect(d.inlierCount).toBe(10);
    expect(d.timeSpanS).toBeCloseTo(0.018, 12);
    expect(d.iterations).toBeGreaterThanOrEqual(1);
    const pred = model.predict(fit.positionM, fit.velocityMps, track.observations.map((o) => o.timestampS - fit.referenceTimeS));
    const res = track.observations.map((o, i) => norm({ x: o.positionM.x - pred[i]!.x, y: o.positionM.y - pred[i]!.y, z: o.positionM.z - pred[i]!.z }));
    expect(d.rmsResidualM).toBeCloseTo(Math.sqrt(res.reduce((s, r) => s + r * r, 0) / res.length), 12);
    expect(d.maxResidualM).toBeCloseTo(Math.max(...res), 12);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        expect(d.positionCovarianceM2[i]![j]).toBe(fit.covariance6[i]![j]);
        expect(d.velocityCovarianceM2PerS2[i]![j]).toBe(fit.covariance6[i + 3]![j + 3]);
        expect(fit.covariance6[i]![j]).toBeCloseTo(fit.covariance6[j]![i]!, 15);
      }
    }
    expect(cholesky(fit.covariance6)).not.toBeNull();
    expect(fit.chiSquare).toBeGreaterThan(0);
    expect(fit.degreesOfFreedom).toBe(24);
  });

  it("uses the injected trajectory model (e.g. aero-aware) through predict()", () => {
    let calls = 0;
    const drag = 0.4; // 1/s, linear drag toy model with an exact closed form
    const dragModel: TrajectoryModel = {
      id: "toy-linear-drag",
      predict(p0, v0, dtS) {
        calls++;
        return dtS.map((t) => {
          const f = (1 - Math.exp(-drag * t)) / drag;
          return { x: p0.x + v0.x * f, y: p0.y + v0.y * f, z: p0.z + v0.z * f };
        });
      },
    };
    const p0 = { x: 0, y: 0, z: 0 };
    const v0 = { x: 70, y: -3, z: 15 };
    const observations: BallPosition3dObservation[] = dragModel.predict(p0, v0, [0, 0.003, 0.006, 0.009, 0.012, 0.015]).map((p, i) => ({
      kind: "ball-position-3d",
      sensorId: "s",
      sequence: i,
      timestampS: 2 + i * 0.003,
      frameIndex: i,
      positionM: p,
      covarianceM2: [
        [1e-6, 0, 0],
        [0, 1e-6, 0],
        [0, 0, 1e-6],
      ],
      reprojectionErrorPx: null,
      detectionConfidence: 1,
      cameraIds: ["a"],
    }));
    calls = 0;
    const fit = expectSuccess(fitLaunchState(observations, { trajectoryModel: dragModel }));
    expect(calls).toBeGreaterThan(12);
    expect(fit.diagnostics.model).toBe("toy-linear-drag");
    expect(Math.abs(fit.velocityMps.x - 70)).toBeLessThan(1e-6);
    expect(Math.abs(fit.velocityMps.y + 3)).toBeLessThan(1e-6);
  });

  it("returns a failure (not a throw) when the model cannot predict, and throws on invalid options", () => {
    const broken: TrajectoryModel = { id: "broken", predict: () => { throw new Error("boom"); } };
    const fit = fitLaunchState(syntheticTrack({ seed: 10, count: 6 }).observations, { trajectoryModel: broken });
    expect(fit.ok).toBe(false);
    expect(() => fitLaunchState([], { trajectoryModel: model, minObservations: 1 })).toThrow(/minObservations/);
    expect(() => fitLaunchState([], { trajectoryModel: model, outlierThresholdSigma: 0 })).toThrow(/outlierThresholdSigma/);
    expect(() => fitLaunchState([], { trajectoryModel: model, referenceTimeS: Number.NaN })).toThrow(/referenceTimeS/);
  });
});

describe("timestampSigmaS option", () => {
  it("rejects a negative or non-finite timestamp sigma", () => {
    const obs = [] as never[];
    expect(() => fitLaunchState(obs, { trajectoryModel: gravityOnlyTrajectoryModel(9.81), timestampSigmaS: -1e-6 })).toThrow(/timestampSigmaS/);
    expect(() => fitLaunchState(obs, { trajectoryModel: gravityOnlyTrajectoryModel(9.81), timestampSigmaS: Number.NaN })).toThrow(/timestampSigmaS/);
  });

  it("adds sigma_t^2 v v^T: along-track velocity variance scales by (sp^2 + st^2 |v|^2) / sp^2, cross-track unchanged", () => {
    // Noise-free straight track (g = 0) so chi^2 = 0 and no covariance inflation interferes.
    const v: Vec3 = { x: 60, y: 0, z: 0 };
    const sp = 0.001;
    const st = 50e-6;
    const obs: BallPosition3dObservation[] = Array.from({ length: 12 }, (_, k) => ({
      kind: "ball-position-3d",
      sensorId: "s",
      sequence: k,
      timestampS: k / 1000,
      frameIndex: k,
      positionM: { x: v.x * (k / 1000), y: 0, z: 0 },
      covarianceM2: [
        [sp * sp, 0, 0],
        [0, sp * sp, 0],
        [0, 0, sp * sp],
      ],
      reprojectionErrorPx: null,
      detectionConfidence: 1,
      cameraIds: [],
    }));
    const model = gravityOnlyTrajectoryModel(0);
    const exact = fitLaunchState(obs, { trajectoryModel: model });
    const jittered = fitLaunchState(obs, { trajectoryModel: model, timestampSigmaS: st });
    if (!exact.ok || !jittered.ok) throw new Error("fit failed");
    const vx = (f: typeof exact) => f.diagnostics.velocityCovarianceM2PerS2[0]![0]!;
    const vy = (f: typeof exact) => f.diagnostics.velocityCovarianceM2PerS2[1]![1]!;
    expect(vx(jittered) / vx(exact)).toBeCloseTo((sp * sp + st * st * v.x * v.x) / (sp * sp), 6);
    expect(vy(jittered) / vy(exact)).toBeCloseTo(1, 9);
    expect(jittered.velocityMps.x).toBeCloseTo(60, 9);
    expect(jittered.qualityFlags).toContain("timestamp-uncertainty-propagated");
    expect(exact.qualityFlags).not.toContain("timestamp-uncertainty-propagated");
  });
});
