import { norm } from "@glm/core-math";
import type { Measurement, SpinObservation, Vec3 } from "@glm/shared-types";
import { describe, expect, it } from "vitest";
import {
  angularVelocityFromSpin,
  CLUB_MODEL_SPIN_WARNING,
  CLUB_SPIN_PRIORS,
  GENERIC_FALLBACK_SPIN_WARNING,
  makeMeasurement,
  PLAYER_MODEL_SPIN_WARNING,
  type PlayerSpinHistoryEntry,
  resolveSpin,
  SPIN_QUALITY_THRESHOLDS,
  SPIN_UNAVAILABLE_WARNING,
  spinAxisTiltRad,
  type SpinResolutionInput,
  unavailableMeasurement,
} from "../src/index";

const DEG = Math.PI / 180;
const RPM = 60 / (2 * Math.PI);
const V: Vec3 = { x: 66, y: -2, z: 13 }; // ~67.3 m/s, slightly right of target
const SPEED = norm(V);

const velocity = (source: "measured-camera" | "synthetic" = "measured-camera"): Measurement<Vec3> =>
  makeMeasurement<Vec3>({
    value: V,
    unit: "m/s",
    source,
    confidence: 0.9,
    uncertainty: {
      covariance: [
        [0.04, 0, 0],
        [0, 0.04, 0],
        [0, 0, 0.04],
      ],
      unit: "m/s",
    },
  });

function spinObservation(overrides: Partial<SpinObservation> = {}): SpinObservation {
  return {
    kind: "spin",
    sensorId: "cam",
    sequence: 1,
    timestampS: 1.0,
    method: "marked-ball",
    angularVelocityRadPerSec: angularVelocityFromSpin({ totalSpinRadPerSec: 290, spinAxisTiltRad: 6 * DEG, velocity: V }),
    covarianceRad2PerS2: [
      [16, 0, 0],
      [0, 16, 0],
      [0, 0, 16],
    ],
    validObservationCount: 12,
    fitResidualRad: 0.01,
    qualityFlags: [],
    ...overrides,
  };
}

function input(overrides: Partial<SpinResolutionInput> = {}): SpinResolutionInput {
  return {
    spinObservations: [],
    velocity: velocity(),
    clubCategory: "driver",
    playerSpinHistory: [],
    allowGenericFallback: false,
    measuredSource: "measured-camera",
    ...overrides,
  };
}

function history(rpms: readonly number[], tiltsDeg: readonly number[], extra: Partial<PlayerSpinHistoryEntry> = {}): PlayerSpinHistoryEntry[] {
  return rpms.map((rpm, i) => ({
    clubCategory: "driver",
    ballSpeedMps: SPEED * (1 + 0.01 * (i - 2)),
    totalSpinRadPerSec: rpm / RPM,
    spinAxisTiltRad: (tiltsDeg[i] as number) * DEG,
    source: "measured-camera",
    ...extra,
  }));
}

describe("resolveSpin MODE 1: measured", () => {
  it("uses a spin observation that passes the quality gate, labelled with the stream's source", () => {
    const r = resolveSpin(input({ spinObservations: [spinObservation()] }));
    expect(r.spinMode).toBe("measured");
    expect(r.angularVelocity.source).toBe("measured-camera");
    expect(r.totalSpinRpm.source).toBe("measured-camera");
    expect(r.totalSpinRpm.value).toBeCloseTo(290 * RPM, 6);
    expect(r.totalSpinRpm.uncertainty?.sigma).toBeCloseTo(4 * RPM, 6); // isotropic 4 rad/s
    expect(r.spinAxisTiltDeg.value).toBeCloseTo(6, 9);
    expect(r.spinAxisTiltDeg.source).toBe("measured-camera");
    expect(r.warnings).toEqual([]);
    expect(r.confidenceFactor.id).toBe("spin-quality");
    expect(r.confidenceFactor.score).toBeGreaterThanOrEqual(0.8);
    expect(r.confidenceFactor.blocking).toBe(false);
  });

  it("keeps synthetic provenance for a synthetic stream and never labels synthetic observations measured", () => {
    const synth = resolveSpin(input({ spinObservations: [spinObservation({ method: "synthetic" })], measuredSource: "synthetic", velocity: velocity("synthetic") }));
    expect(synth.angularVelocity.source).toBe("synthetic");
    expect(synth.totalSpinRpm.source).toBe("synthetic");
    expect(synth.spinAxisTiltDeg.source).toBe("synthetic");
    const mislabelled = resolveSpin(input({ spinObservations: [spinObservation({ method: "synthetic" })], measuredSource: "measured-camera" }));
    expect(mislabelled.angularVelocity.source).toBe("synthetic");
    expect(mislabelled.warnings.join(" ")).toMatch(/relabelled as synthetic/);
  });

  it("picks the best passing observation (smallest covariance)", () => {
    const noisy = spinObservation({ sequence: 1, covarianceRad2PerS2: [[100, 0, 0], [0, 100, 0], [0, 0, 100]] });
    const tight = spinObservation({
      sequence: 2,
      angularVelocityRadPerSec: angularVelocityFromSpin({ totalSpinRadPerSec: 300, spinAxisTiltRad: 0, velocity: V }),
    });
    const r = resolveSpin(input({ spinObservations: [noisy, tight] }));
    expect(r.totalSpinRpm.value).toBeCloseTo(300 * RPM, 6);
  });

  it("never reports measured spin when the gate fails; falls back to estimation with an explanation", () => {
    const failures: [Partial<SpinObservation>, RegExp][] = [
      [{ validObservationCount: 2 }, /valid rotation observations/],
      [{ fitResidualRad: SPIN_QUALITY_THRESHOLDS.maxFitResidualRad * 2 }, /rotation-fit residual/],
      [{ qualityFlags: ["occluded"] }, /occluded/],
      [{ qualityFlags: ["aliasing-risk"] }, /aliasing-risk/],
      [{ covarianceRad2PerS2: [[16, 20, 0], [20, 16, 0], [0, 0, 16]] }, /not positive definite/],
      [{ covarianceRad2PerS2: [[3600, 0, 0], [0, 3600, 0], [0, 0, 3600]] }, /uncertainty/],
    ];
    for (const [override, reason] of failures) {
      const r = resolveSpin(input({ spinObservations: [spinObservation(override)] }));
      expect(r.spinMode).toBe("estimated");
      expect(r.angularVelocity.source).toBe("estimated-club-model");
      expect(r.totalSpinRpm.source).not.toMatch(/^measured/);
      const explanation = r.warnings.find((w) => w.startsWith("Spin measurement rejected"));
      expect(explanation).toMatch(reason);
      expect(explanation).toMatch(/not reported as measured/);
    }
  });

  it("rejects estimated or unavailable labels for measured spin", () => {
    expect(() => resolveSpin(input({ measuredSource: "estimated-club-model" }))).toThrow(/measuredSource/);
    expect(() => resolveSpin(input({ measuredSource: "unavailable" }))).toThrow(/measuredSource/);
  });

  it("a measured ~0 rpm (knuckleball) spin keeps its rate but reports no spin axis", () => {
    const r = resolveSpin(input({ spinObservations: [spinObservation({ angularVelocityRadPerSec: { x: 2, y: -3, z: 1 } })] }));
    expect(r.spinMode).toBe("measured");
    expect(r.totalSpinRpm.value).toBeCloseTo(Math.hypot(2, 3, 1) * RPM, 6);
    expect(r.spinAxisTiltDeg.value).toBeNull();
    expect(r.spinAxisTiltDeg.qualityFlags).toContain("spin-axis-undefined-spin-below-noise");
  });
});

describe("resolveSpin MODE 2: estimated", () => {
  it("player history takes precedence over the club prior", () => {
    const h = history([2500, 2600, 2700, 2800, 2900], [-4, -2, 0, 2, 6]);
    const r = resolveSpin(input({ playerSpinHistory: h }));
    expect(r.spinMode).toBe("estimated");
    expect(r.totalSpinRpm.source).toBe("estimated-player-model");
    expect(r.angularVelocity.source).toBe("estimated-player-model");
    expect(r.spinAxisTiltDeg.source).toBe("estimated-player-model");
    expect(r.totalSpinRpm.value).toBeCloseTo(2700, 6);
    // MAD = 100 rpm -> 148.3 rpm < 10 % of 2700 -> sigma = 270 rpm.
    expect(r.totalSpinRpm.uncertainty?.sigma).toBeCloseTo(270, 6);
    expect(r.spinAxisTiltDeg.value).toBeCloseTo(0, 9);
    // Tilt MAD = 2 deg -> 2.965 deg.
    expect(r.spinAxisTiltDeg.uncertainty?.sigma).toBeCloseTo(1.4826 * 2, 6);
    expect(r.warnings).toContain(PLAYER_MODEL_SPIN_WARNING);
    expect(r.confidenceFactor.score).toBe(0.55);
    expect(norm(r.angularVelocity.value as Vec3) * RPM).toBeCloseTo(2700, 6);
  });

  it("uses 1.4826 * MAD when it exceeds 10 % of the median", () => {
    const r = resolveSpin(input({ playerSpinHistory: history([2000, 2400, 2700, 3000, 3600], [1, 3, 4, 5, 9]) }));
    expect(r.totalSpinRpm.value).toBeCloseTo(2700, 6);
    expect(r.totalSpinRpm.uncertainty?.sigma).toBeCloseTo(1.4826 * 300, 6);
    expect(r.spinAxisTiltDeg.value).toBeCloseTo(4, 9);
    expect(spinAxisTiltRad(r.angularVelocity.value as Vec3, V)! / DEG).toBeCloseTo(4, 9);
  });

  it("history only counts measured shots of the same category within +/-15 % ball speed", () => {
    const good = history([2600, 2700, 2800, 2650], [0, 0, 0, 0]);
    const ignored: PlayerSpinHistoryEntry[] = [
      ...history([2700], [0], { source: "synthetic" }),
      ...history([2700], [0], { source: "estimated-player-model" }),
      ...history([2700], [0], { clubCategory: "hybrid" }),
      ...history([2700], [0], { ballSpeedMps: SPEED * 1.2 }),
    ];
    const r = resolveSpin(input({ playerSpinHistory: [...good, ...ignored] }));
    expect(r.totalSpinRpm.source).toBe("estimated-club-model");
    expect(r.warnings.join(" ")).toMatch(/has 4 measured driver shot/);
  });

  it("club priors are labelled estimated-club-model, with the tilt unavailable and zero tilt assumed", () => {
    const r = resolveSpin(input({ clubCategory: "mid-iron" }));
    expect(r.spinMode).toBe("estimated");
    expect(r.totalSpinRpm.source).toBe("estimated-club-model");
    expect(r.totalSpinRpm.value).toBeCloseTo((5361 + 6231 + 7097) / 3, 9);
    expect(r.totalSpinRpm.uncertainty?.sigma).toBeCloseTo(0.35 * ((5361 + 6231 + 7097) / 3), 9);
    expect(r.spinAxisTiltDeg.value).toBeNull();
    expect(r.spinAxisTiltDeg.source).toBe("unavailable");
    expect(r.angularVelocity.source).toBe("estimated-club-model");
    expect(r.angularVelocity.qualityFlags).toContain("spin-axis-assumed-zero");
    expect(spinAxisTiltRad(r.angularVelocity.value as Vec3, V)).toBeCloseTo(0, 12);
    expect(r.warnings).toContain(CLUB_MODEL_SPIN_WARNING);
    expect(r.confidenceFactor.score).toBe(0.3);
    expect(r.totalSpinRpm.confidence).toBeLessThan(0.5);
  });

  it("documents the tour-average mapping and has no putter prior", () => {
    expect(CLUB_SPIN_PRIORS.driver?.totalSpinRpm).toBe(2686);
    expect(CLUB_SPIN_PRIORS["fairway-wood"]?.totalSpinRpm).toBe(3655);
    expect(CLUB_SPIN_PRIORS.hybrid?.totalSpinRpm).toBe(4437);
    expect(CLUB_SPIN_PRIORS["long-iron"]?.totalSpinRpm).toBe(4733);
    expect(CLUB_SPIN_PRIORS["short-iron"]?.totalSpinRpm).toBe(8322.5);
    expect(CLUB_SPIN_PRIORS.wedge?.totalSpinRpm).toBe(9304);
    expect(CLUB_SPIN_PRIORS.putter).toBeNull();
    for (const prior of Object.values(CLUB_SPIN_PRIORS)) if (prior) expect(prior.relativeSigma).toBe(0.35);
  });
});

describe("resolveSpin MODE 3: fallback or unavailable", () => {
  it("uses the generic fallback only when the user allowed it", () => {
    const denied = resolveSpin(input({ clubCategory: null, allowGenericFallback: false }));
    expect(denied.spinMode).toBe("unavailable");
    const allowed = resolveSpin(input({ clubCategory: null, allowGenericFallback: true }));
    expect(allowed.spinMode).toBe("assumed-generic-fallback");
    expect(allowed.totalSpinRpm.source).toBe("assumed-generic-fallback");
    expect(allowed.angularVelocity.source).toBe("assumed-generic-fallback");
    expect(allowed.totalSpinRpm.value).toBeCloseTo(((0.15 * SPEED) / 0.021335) * RPM, 6);
    expect(allowed.totalSpinRpm.confidence).toBeLessThanOrEqual(0.15);
    expect(allowed.angularVelocity.confidence).toBeLessThanOrEqual(0.15);
    expect(allowed.spinAxisTiltDeg.value).toBeNull();
    expect(allowed.angularVelocity.qualityFlags).toContain("spin-axis-assumed-zero");
    expect(allowed.warnings).toContain(GENERIC_FALLBACK_SPIN_WARNING);
    expect(allowed.confidenceFactor.score).toBe(0.1);
  });

  it("velocity-dependent estimates take the velocity's provenance and confidence (derived-value rules)", () => {
    const weakSynthetic = makeMeasurement<Vec3>({ value: V, unit: "m/s", source: "synthetic", confidence: 0.05 });
    // Club prior: the spin VECTOR is oriented by the velocity -> min confidence, but it is still
    // an estimate (model labels outrank stream-origin labels); the rate comes only from the prior.
    const club = resolveSpin(input({ clubCategory: "driver", velocity: weakSynthetic }));
    expect(club.spinMode).toBe("estimated");
    expect(club.angularVelocity.source).toBe("estimated-club-model");
    expect(club.angularVelocity.confidence).toBe(0.05);
    expect(club.totalSpinRpm.source).toBe("estimated-club-model");
    expect(club.totalSpinRpm.confidence).toBe(0.25);
    // Generic fallback: |w| = 0.15 |v| / r is derived from the speed too.
    const generic = resolveSpin(input({ clubCategory: null, allowGenericFallback: true, velocity: weakSynthetic }));
    expect(generic.angularVelocity.source).toBe("assumed-generic-fallback");
    expect(generic.totalSpinRpm.source).toBe("assumed-generic-fallback");
    expect(generic.totalSpinRpm.confidence).toBe(0.05);
    expect(generic.angularVelocity.confidence).toBe(0.05);
    // Player model: vector oriented by the velocity; rate and tilt from the history.
    const manual = makeMeasurement<Vec3>({ value: V, unit: "m/s", source: "manual", confidence: 0.4 });
    const player = resolveSpin(input({ velocity: manual, playerSpinHistory: history([2600, 2650, 2700, 2750, 2800], [0, 1, 2, 3, 4]) }));
    expect(player.angularVelocity.source).toBe("estimated-player-model");
    expect(player.angularVelocity.confidence).toBe(0.4);
    expect(player.totalSpinRpm.source).toBe("estimated-player-model");
    // A measured velocity keeps the plain estimated labels and the mode confidence.
    const live = resolveSpin(input({ clubCategory: "driver" }));
    expect(live.angularVelocity.source).toBe("estimated-club-model");
    expect(live.angularVelocity.confidence).toBe(0.25);
  });

  it("prefers the club prior over the generic fallback", () => {
    expect(resolveSpin(input({ allowGenericFallback: true })).totalSpinRpm.source).toBe("estimated-club-model");
  });

  it("unavailable: all three values unavailable, product warning, zero non-blocking factor", () => {
    const r = resolveSpin(input({ clubCategory: "putter" }));
    expect(r.spinMode).toBe("unavailable");
    for (const m of [r.angularVelocity, r.totalSpinRpm, r.spinAxisTiltDeg]) {
      expect(m.value).toBeNull();
      expect(m.source).toBe("unavailable");
      expect(m.confidence).toBe(0);
    }
    expect(r.warnings).toContain(SPIN_UNAVAILABLE_WARNING);
    expect(r.confidenceFactor).toMatchObject({ id: "spin-quality", score: 0, blocking: false });
  });

  it("cannot estimate spin without a launch direction", () => {
    const r = resolveSpin(input({ velocity: unavailableMeasurement<Vec3>("m/s", ["launch-fit-failed"]), allowGenericFallback: true }));
    expect(r.spinMode).toBe("unavailable");
    expect(r.warnings.join(" ")).toMatch(/launch velocity is unavailable/);
  });
});
