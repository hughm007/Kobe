import { mean, standardDeviation } from "@glm/core-math";
import { RawSensorObservationSchema, SyntheticTruthSchema } from "@glm/shared-types";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_SYNTHETIC_NOISE,
  defaultSyntheticSensorConfiguration,
  formatIsoUtc,
  generateSyntheticSession,
  generateSyntheticShot,
  MIN_REPORTED_VARIANCE,
  REPLAY_SHOT_GAP_S,
  splitReplayIntoShots,
} from "../src/index";
import type { TruthPropagator } from "../src/index";
import { LAUNCH_OMEGA, LAUNCH_VELOCITY, makeSpec, ofKind, straightLine, truthAt } from "./helpers";

const OPTIONS = { sensorId: "synthetic-test", firstSequence: 0 };

describe("generateSyntheticShot: determinism", () => {
  it("is a pure function of spec + seed", () => {
    const a = generateSyntheticShot(makeSpec({ seed: 7 }), straightLine, OPTIONS);
    const b = generateSyntheticShot(makeSpec({ seed: 7 }), straightLine, OPTIONS);
    expect(b).toEqual(a);
  });

  it("produces different noise for a different seed", () => {
    const a = generateSyntheticShot(makeSpec({ seed: 7 }), straightLine, OPTIONS);
    const b = generateSyntheticShot(makeSpec({ seed: 8 }), straightLine, OPTIONS);
    expect(b.observations.length).toBe(a.observations.length);
    const pa = ofKind(a.observations, "ball-position-3d").map((o) => o.positionM.x);
    const pb = ofKind(b.observations, "ball-position-3d").map((o) => o.positionM.x);
    expect(pb).not.toEqual(pa);
    expect(b.truth.seed).toBe(8);
  });

  it("keeps the other frames' noise unchanged when only the dropout probability changes", () => {
    const clean = generateSyntheticShot(makeSpec({ seed: 3 }), straightLine, OPTIONS);
    const lossy = generateSyntheticShot(makeSpec({ seed: 3 }, { dropoutProbability: 0.5 }), straightLine, OPTIONS);
    const cleanByFrame = new Map(ofKind(clean.observations, "ball-position-3d").map((o) => [o.frameIndex, o.positionM]));
    const lossyFrames = ofKind(lossy.observations, "ball-position-3d");
    expect(lossyFrames.length).toBeLessThan(DEFAULT_SYNTHETIC_NOISE.frameCount);
    for (const frame of lossyFrames) expect(frame.positionM).toEqual(cleanByFrame.get(frame.frameIndex));
  });
});

describe("generateSyntheticShot: stream structure", () => {
  const spec = makeSpec({ launchTimeS: 2, seed: 99 });
  const { observations, nextSequence, truth } = generateSyntheticShot(spec, straightLine, {
    sensorId: "synthetic-test",
    firstSequence: 17,
  });

  it("emits health, address, trigger, 20 frames and spin with consecutive sequences in time order", () => {
    expect(observations.map((o) => o.kind)).toEqual([
      "health",
      "ball-address",
      "trigger",
      ...Array.from({ length: 20 }, () => "ball-position-3d"),
      "spin",
    ]);
    expect(observations.map((o) => o.sequence)).toEqual(Array.from({ length: 24 }, (_, i) => 17 + i));
    expect(nextSequence).toBe(41);
    for (let i = 1; i < observations.length; i++) {
      expect(observations[i]!.timestampS).toBeGreaterThanOrEqual(observations[i - 1]!.timestampS);
    }
    expect(observations.every((o) => o.sensorId === "synthetic-test")).toBe(true);
  });

  it("places health at launch - 0.5 s and address at launch - 0.1 s with the configured flags", () => {
    const [health] = ofKind(observations, "health");
    expect(health!.timestampS).toBeCloseTo(1.5, 12);
    expect(health!.health.status).toBe("ok");
    expect(health!.health.calibrationStatus).toBe("none");
    expect(health!.health.checkedUtc).toBe("1970-01-01T00:00:01.500Z");
    expect(health!.health.messages.join(" ")).toMatch(/not measurements/);

    const [address] = ofKind(observations, "ball-address");
    expect(address!.timestampS).toBeCloseTo(1.9, 12);
    expect(address!.inHittingZone).toBe(true);
    expect(address!.stationary).toBe(true);
    expect(address!.ballCount).toBe(1);
    expect(address!.confidence).toBe(1);
    // Address position = truth + 1 mm noise: within 5 sigma per axis, but not exactly truth.
    expect(Math.abs(address!.positionM.x)).toBeLessThan(0.005);
    expect(address!.positionM).not.toEqual(spec.positionM);
  });

  it("reports frame k at launch + (startDelayFrames + k) / fps with honest covariance and no 2D data", () => {
    const frames = ofKind(observations, "ball-position-3d");
    frames.forEach((frame, k) => {
      expect(frame.frameIndex).toBe(1 + k);
      expect(frame.timestampS).toBeCloseTo(2 + (1 + k) / 1000, 12);
      expect(frame.covarianceM2).toEqual([
        [1e-6, 0, 0],
        [0, 1e-6, 0],
        [0, 0, 1e-6],
      ]);
      expect(frame.reprojectionErrorPx).toBeNull();
      expect(frame.detectionConfidence).toBe(1);
      expect(frame.cameraIds).toEqual([]);
    });
  });

  it("emits a synthetic spin observation after the last frame", () => {
    const [spin] = ofKind(observations, "spin");
    const lastFrame = ofKind(observations, "ball-position-3d").at(-1)!;
    expect(spin!.timestampS).toBeGreaterThan(lastFrame.timestampS);
    expect(spin!.timestampS).toBeCloseTo(2 + 21 / 1000, 12);
    expect(spin!.method).toBe("synthetic");
    expect(spin!.covarianceRad2PerS2).toEqual([
      [36, 0, 0],
      [0, 36, 0],
      [0, 0, 36],
    ]);
    expect(spin!.validObservationCount).toBe(20);
    expect(spin!.fitResidualRad).toBe(0.01);
    expect(spin!.qualityFlags).toEqual(["synthetic"]);
    for (const axis of ["x", "y", "z"] as const) {
      expect(Math.abs(spin!.angularVelocityRadPerSec[axis] - LAUNCH_OMEGA[axis])).toBeLessThan(5 * 6);
    }
  });

  it("returns truth separately, with the noise model flattened to numbers", () => {
    expect(SyntheticTruthSchema.safeParse(truth).success).toBe(true);
    expect(truth.label).toBe("test-shot");
    expect(truth.velocityMps).toEqual(LAUNCH_VELOCITY);
    expect(truth.angularVelocityRadPerSec).toEqual(LAUNCH_OMEGA);
    expect(truth.launchTimeS).toBe(2);
    expect(truth.seed).toBe(99);
    expect(truth.noiseModel["positionSigmaM.x"]).toBe(0.001);
    expect(truth.noiseModel["frameRateHz"]).toBe(1000);
    expect(truth.noiseModel["spin.observed"]).toBe(1);
    expect(truth.noiseModel["spin.sigmaRadPerSec"]).toBe(6);
    expect(truth.noiseModel["triggerSources.count"]).toBe(1);
    expect(truth.noiseModel["address.inHittingZone"]).toBe(1);
    expect(Object.isFrozen(truth)).toBe(true);
  });

  it("never leaks truth into the observation stream", () => {
    const allowedKeys = new Set([
      "kind",
      "sensorId",
      "sequence",
      "timestampS",
      "health",
      "positionM",
      "stationary",
      "inHittingZone",
      "ballCount",
      "confidence",
      "triggerSource",
      "frameIndex",
      "covarianceM2",
      "reprojectionErrorPx",
      "detectionConfidence",
      "cameraIds",
      "method",
      "angularVelocityRadPerSec",
      "covarianceRad2PerS2",
      "validObservationCount",
      "fitResidualRad",
      "qualityFlags",
    ]);
    for (const observation of observations) {
      for (const key of Object.keys(observation)) expect(allowedKeys.has(key)).toBe(true);
    }
    const text = JSON.stringify(observations);
    for (const leak of ["velocityMps", "noiseModel", "seed", "label", "truth", "test-shot"]) {
      expect(text).not.toContain(leak);
    }
    // The spin observation is noisy, never the exact truth vector.
    expect(ofKind(observations, "spin")[0]!.angularVelocityRadPerSec).not.toEqual(LAUNCH_OMEGA);
  });

  it("emits observations that all pass RawSensorObservationSchema and are frozen", () => {
    for (const observation of observations) {
      expect(RawSensorObservationSchema.safeParse(observation).success).toBe(true);
      expect(Object.isFrozen(observation)).toBe(true);
    }
  });
});

describe("generateSyntheticShot: noise statistics", () => {
  it("position error per axis has sample std within 10 % of the configured sigma", () => {
    const sigma = { x: 0.001, y: 0.002, z: 0.0005 };
    const { observations } = generateSyntheticShot(
      makeSpec({ seed: 2024 }, { frameCount: 4000, positionSigmaM: sigma, reportedCovarianceScale: 2.5 }),
      straightLine,
      OPTIONS,
    );
    const frames = ofKind(observations, "ball-position-3d");
    expect(frames).toHaveLength(4000);
    for (const axis of ["x", "y", "z"] as const) {
      const errors = frames.map((f) => f.positionM[axis] - truthAt(f.frameIndex / 1000)[axis]);
      const std = standardDeviation(errors);
      expect(Math.abs(std / sigma[axis] - 1)).toBeLessThan(0.1);
      // Unbiased: |mean| well inside 4 standard errors.
      expect(Math.abs(mean(errors))).toBeLessThan((4 * sigma[axis]) / Math.sqrt(errors.length));
    }
    // Reported covariance = diag(sigma^2) * scale (mis-reported by 2.5x on purpose).
    const cov = frames[0]!.covarianceM2;
    expect(cov[0]![0]).toBeCloseTo(2.5e-6, 15);
    expect(cov[1]![1]).toBeCloseTo(1e-5, 15);
    expect(cov[2]![2]).toBeCloseTo(6.25e-7, 15);
    expect(cov[0]![1]).toBe(0);
  });

  it("reports nominal timestamps while positions follow the jittered true times", () => {
    const jitter = 1e-4;
    const { observations } = generateSyntheticShot(
      makeSpec({ seed: 77 }, { frameCount: 3000, startDelayFrames: 5, positionSigmaM: { x: 0, y: 0, z: 0 }, timestampJitterS: jitter }),
      straightLine,
      OPTIONS,
    );
    const frames = ofKind(observations, "ball-position-3d");
    const offsets = frames.map((f) => {
      const nominalDt = f.frameIndex / 1000;
      // Reported time is exactly nominal.
      expect(f.timestampS).toBeCloseTo(2 + nominalDt, 12);
      // Noise-free straight line: x position reveals the true exposure time.
      const trueDt = f.positionM.x / LAUNCH_VELOCITY.x;
      return trueDt - nominalDt;
    });
    expect(Math.abs(standardDeviation(offsets) / jitter - 1)).toBeLessThan(0.1);
    expect(Math.abs(mean(offsets))).toBeLessThan((4 * jitter) / Math.sqrt(offsets.length));
    expect(offsets.filter((o) => Math.abs(o) > 1e-9).length).toBeGreaterThan(2900);
  });

  it("clamps jittered times before launch to the launch position (dt >= 0 for the propagator)", () => {
    const seen: number[][] = [];
    const recording: TruthPropagator = (p0, v0, w0, dts) => {
      seen.push([...dts]);
      return straightLine(p0, v0, w0, dts);
    };
    const { observations } = generateSyntheticShot(
      makeSpec({ seed: 5 }, { frameCount: 50, startDelayFrames: 0, positionSigmaM: { x: 0, y: 0, z: 0 }, timestampJitterS: 0.002 }),
      recording,
      OPTIONS,
    );
    expect(seen).toHaveLength(1);
    const dts = seen[0]!;
    expect(dts).toHaveLength(50);
    expect(Math.min(...dts)).toBe(0);
    for (let i = 1; i < dts.length; i++) expect(dts[i]!).toBeGreaterThanOrEqual(dts[i - 1]!);
    for (const frame of ofKind(observations, "ball-position-3d")) expect(frame.positionM.x).toBeGreaterThanOrEqual(0);
  });

  it("spin and trigger-latency noise have sample std within 10 % of the configured sigma", () => {
    const spinSigma = 6;
    const latencyS = 0.002;
    const latencySigmaS = 0.0005;
    const spinErrors = { x: [] as number[], y: [] as number[], z: [] as number[] };
    const latencyErrors: number[] = [];
    for (let seed = 1; seed <= 2000; seed++) {
      const { observations } = generateSyntheticShot(
        makeSpec(
          { seed },
          {
            frameCount: 0,
            spin: { sigmaRadPerSec: spinSigma, validObservationCount: 20, fitResidualRad: 0.01, qualityFlags: [] },
            triggerSources: [{ source: "microphone", latencyS, latencySigmaS, confidence: 1 }],
          },
        ),
        straightLine,
        OPTIONS,
      );
      const [spin] = ofKind(observations, "spin");
      for (const axis of ["x", "y", "z"] as const) spinErrors[axis].push(spin!.angularVelocityRadPerSec[axis] - LAUNCH_OMEGA[axis]);
      latencyErrors.push(ofKind(observations, "trigger")[0]!.timestampS - 2 - latencyS);
    }
    for (const axis of ["x", "y", "z"] as const) {
      expect(Math.abs(standardDeviation(spinErrors[axis]) / spinSigma - 1)).toBeLessThan(0.1);
      expect(Math.abs(mean(spinErrors[axis]))).toBeLessThan((4 * spinSigma) / Math.sqrt(2000));
    }
    expect(Math.abs(standardDeviation(latencyErrors) / latencySigmaS - 1)).toBeLessThan(0.1);
    expect(Math.abs(mean(latencyErrors))).toBeLessThan((4 * latencySigmaS) / Math.sqrt(2000));
  });

  it("floors the reported variance so a noise-free setting never reports a singular covariance", () => {
    const { observations } = generateSyntheticShot(
      makeSpec(
        { seed: 4 },
        {
          positionSigmaM: { x: 0, y: 0.002, z: 0 },
          spin: { sigmaRadPerSec: 0, validObservationCount: 20, fitResidualRad: 0, qualityFlags: [] },
        },
      ),
      straightLine,
      OPTIONS,
    );
    const frames = ofKind(observations, "ball-position-3d");
    expect(MIN_REPORTED_VARIANCE).toBe(1e-12);
    expect(frames[0]!.covarianceM2).toEqual([
      [1e-12, 0, 0],
      [0, 4e-6, 0], // realistic sigmas are reported unchanged
      [0, 0, 1e-12],
    ]);
    // Only the report is floored: the x positions are still exactly the truth.
    frames.forEach((f) => expect(f.positionM.x).toBe(truthAt(f.frameIndex / 1000).x));
    const [spin] = ofKind(observations, "spin");
    expect(spin!.covarianceRad2PerS2).toEqual([
      [1e-12, 0, 0],
      [0, 1e-12, 0],
      [0, 0, 1e-12],
    ]);
    expect(spin!.angularVelocityRadPerSec).toEqual(LAUNCH_OMEGA);
    const scaledToZero = generateSyntheticShot(makeSpec({ seed: 4 }, { reportedCovarianceScale: 0 }), straightLine, OPTIONS);
    expect(ofKind(scaledToZero.observations, "ball-position-3d")[0]!.covarianceM2[1]![1]).toBe(1e-12);
  });

  it("drops frames and injects outliers at roughly the configured rates", () => {
    const frameCount = 10000;
    const { observations } = generateSyntheticShot(
      makeSpec({ seed: 31337 }, { frameCount, dropoutProbability: 0.1, outlierProbability: 0.05, outlierMagnitudeM: 0.5 }),
      straightLine,
      OPTIONS,
    );
    const frames = ofKind(observations, "ball-position-3d");
    // Binomial(10000, 0.9): sd = 30; allow 5 sd.
    expect(frames.length).toBeGreaterThan(9000 - 150);
    expect(frames.length).toBeLessThan(9000 + 150);
    // Dropped frames leave gaps in frameIndex.
    const indices = new Set(frames.map((f) => f.frameIndex));
    expect(indices.size).toBe(frames.length);
    const errors = frames.map((f) => {
      const t = truthAt(f.frameIndex / 1000);
      return Math.hypot(f.positionM.x - t.x, f.positionM.y - t.y, f.positionM.z - t.z);
    });
    const outliers = errors.filter((e) => e > 0.1);
    const outlierRate = outliers.length / frames.length;
    expect(outlierRate).toBeGreaterThan(0.04);
    expect(outlierRate).toBeLessThan(0.06);
    // Outlier magnitude 0.5 m plus 1 mm noise per axis.
    for (const e of outliers) expect(Math.abs(e - 0.5)).toBeLessThan(0.01);
    // Inliers keep 1 mm noise.
    expect(Math.max(...errors.filter((e) => e <= 0.1))).toBeLessThan(0.01);
    for (const frame of frames.slice(0, 200)) expect(RawSensorObservationSchema.safeParse(frame).success).toBe(true);
  });
});

describe("generateSyntheticShot: configuration variants", () => {
  it("emits no spin observation when spin is not observed", () => {
    const { observations, truth } = generateSyntheticShot(makeSpec({}, { spin: null }), straightLine, OPTIONS);
    expect(ofKind(observations, "spin")).toHaveLength(0);
    expect(truth.noiseModel["spin.observed"]).toBe(0);
    expect(truth.noiseModel["spin.sigmaRadPerSec"]).toBeUndefined();
  });

  it("emits one trigger per configured source with latency and jitter", () => {
    const { observations } = generateSyntheticShot(
      makeSpec(
        { launchTimeS: 10, seed: 11 },
        {
          triggerSources: [
            { source: "microphone", latencyS: 0.003, latencySigmaS: 0, confidence: 0.8 },
            { source: "ball-motion", latencyS: 0.001, latencySigmaS: 0.0002, confidence: 0.95 },
          ],
        },
      ),
      straightLine,
      OPTIONS,
    );
    const triggers = ofKind(observations, "trigger");
    expect(triggers).toHaveLength(2);
    const microphone = triggers.find((t) => t.triggerSource === "microphone")!;
    const motion = triggers.find((t) => t.triggerSource === "ball-motion")!;
    expect(microphone.timestampS).toBeCloseTo(10.003, 12);
    expect(microphone.confidence).toBe(0.8);
    expect(Math.abs(motion.timestampS - 10.001)).toBeLessThan(5 * 0.0002);
    expect(motion.timestampS).not.toBe(10.001);
    for (const o of observations) expect(RawSensorObservationSchema.safeParse(o).success).toBe(true);
  });

  it("reports address flags from the noise model", () => {
    const { observations } = generateSyntheticShot(
      makeSpec({}, { address: { inHittingZone: false, ballCount: 2, stationary: false } }),
      straightLine,
      OPTIONS,
    );
    const [address] = ofKind(observations, "ball-address");
    expect(address).toMatchObject({ inHittingZone: false, ballCount: 2, stationary: false });
  });

  it("rejects invalid specs with the offending field named", () => {
    expect(() => generateSyntheticShot(makeSpec({}, { frameRateHz: 0 }), straightLine, OPTIONS)).toThrow(/frameRateHz/);
    expect(() => generateSyntheticShot(makeSpec({}, { dropoutProbability: 1.5 }), straightLine, OPTIONS)).toThrow(
      /dropoutProbability/,
    );
    expect(() => generateSyntheticShot(makeSpec({ seed: 1.5 }), straightLine, OPTIONS)).toThrow(/seed/);
    expect(() =>
      generateSyntheticShot(makeSpec({ velocityMps: { x: Number.NaN, y: 0, z: 0 } }), straightLine, OPTIONS),
    ).toThrow(/velocityMps/);
    expect(() => generateSyntheticShot(makeSpec(), straightLine, { sensorId: "", firstSequence: 0 })).toThrow(/sensorId/);
  });

  it("rejects a propagator that returns the wrong number of positions", () => {
    const broken: TruthPropagator = (p0) => [p0];
    expect(() => generateSyntheticShot(makeSpec(), broken, OPTIONS)).toThrow(/propagator returned 1 positions for 20 times/);
  });
});

describe("generateSyntheticSession", () => {
  it("re-times shot i to i * spacing + launchTimeS with consecutive sequences", () => {
    const session = generateSyntheticSession(
      [makeSpec({ label: "a", launchTimeS: 1, seed: 1 }), makeSpec({ label: "b", launchTimeS: 1.5, seed: 2 })],
      straightLine,
      { sensorId: "s", shotSpacingS: 4, firstSequence: 3 },
    );
    expect(session.truths.map((t) => t.launchTimeS)).toEqual([1, 5.5]);
    expect(session.observations.map((o) => o.sequence)).toEqual(
      Array.from({ length: session.observations.length }, (_, i) => 3 + i),
    );
    expect(session.nextSequence).toBe(3 + session.observations.length);
    const trigger2 = ofKind(session.shots[1]!.observations, "trigger")[0]!;
    expect(trigger2.timestampS).toBeCloseTo(5.5, 12);
  });

  it("refuses spacing that would interleave shots", () => {
    expect(() =>
      generateSyntheticSession([makeSpec({ seed: 1 }), makeSpec({ seed: 2 })], straightLine, { sensorId: "s", shotSpacingS: 0.3 }),
    ).toThrow(/increase shotSpacingS/);
  });

  it("refuses spacing that a replay could not split back into the same shots", () => {
    const shots = [makeSpec({ seed: 1 }), makeSpec({ seed: 2 })];
    // Default model: the next shot's health observation is at launch - 0.5 s, so the shots are
    // separable only when spacing - 0.5 s > REPLAY_SHOT_GAP_S.
    expect(REPLAY_SHOT_GAP_S).toBe(1);
    for (const shotSpacingS of [0.8, 1.2, 1.5]) {
      expect(() => generateSyntheticSession(shots, straightLine, { sensorId: "s", shotSpacingS })).toThrow(
        /a replay of this session would merge the shots.*Increase shotSpacingS/,
      );
    }
    const session = generateSyntheticSession(shots, straightLine, { sensorId: "s", shotSpacingS: 1.6 });
    const replayShots = splitReplayIntoShots(session.observations);
    expect(replayShots).toHaveLength(2);
    replayShots.forEach((shot, i) => expect(shot).toEqual(session.shots[i]!.observations));
    // Shots without triggers cannot be segmented anyway, so no gap is required after them.
    const noTrigger = [makeSpec({ seed: 1 }, { triggerSources: [] }), makeSpec({ seed: 2 })];
    expect(generateSyntheticSession(noTrigger, straightLine, { sensorId: "s", shotSpacingS: 0.8 }).shots).toHaveLength(2);
  });
});

describe("defaultSyntheticSensorConfiguration", () => {
  it("is an honest synthetic configuration", () => {
    const config = defaultSyntheticSensorConfiguration();
    expect(config).toMatchObject({
      sensorId: "synthetic-1",
      kind: "synthetic",
      version: "synthetic-config-1",
      cameras: [],
      triggerSources: ["synthetic"],
      frameBuffer: { preTriggerS: 0.25, postTriggerS: 0.5 },
      storeRawCaptures: true,
    });
    expect(config.description).toMatch(/Not a measurement/);
    expect(defaultSyntheticSensorConfiguration("abc").sensorId).toBe("abc");
  });
});

describe("formatIsoUtc", () => {
  it("matches the ISO-8601 UTC rendering for representative instants", () => {
    const cases = [0, 500, -500, 946_684_800_000, 951_782_400_000, 1_759_341_600_123, 4_102_444_799_999];
    for (const ms of cases) expect(formatIsoUtc(ms)).toBe(new Date(ms).toISOString());
    expect(formatIsoUtc(951_782_400_000)).toBe("2000-02-29T00:00:00.000Z");
  });

  it("rejects non-finite input", () => {
    expect(() => formatIsoUtc(Number.NaN)).toThrow(RangeError);
  });
});
