import { cross, createRng, norm, sampleMultivariateNormal, standardDeviation } from "@glm/core-math";
import type { Measurement, Vec3 } from "@glm/shared-types";
import { describe, expect, it } from "vitest";
import {
  angularVelocityFromSpin,
  ballSpeedMps,
  deriveBallSpeedMps,
  deriveHorizontalLaunchAngleDeg,
  deriveSpinAxisTiltDeg,
  deriveTotalSpinRpm,
  deriveVerticalLaunchAngleDeg,
  horizontalLaunchAngleRad,
  launchDirectionFrame,
  makeMeasurement,
  spinAxisTiltRad,
  spinComponentsRpm,
  spinRateRadPerSec,
  unavailableMeasurement,
  UNPROPAGATED_UNCERTAINTY_CONFIDENCE_SCALE,
  verticalLaunchAngleRad,
} from "../src/index";
import { rotatedCovariance } from "./helpers";

const DEG = Math.PI / 180;
const RPM = 60 / (2 * Math.PI);

function velocityFromAngles(speed: number, vlaDeg: number, hlaDegLeft: number): Vec3 {
  const a = vlaDeg * DEG;
  const h = hlaDegLeft * DEG;
  return { x: speed * Math.cos(a) * Math.cos(h), y: speed * Math.cos(a) * Math.sin(h), z: speed * Math.sin(a) };
}

function vectorMeasurement(value: Vec3, covariance?: number[][], extra?: Partial<Measurement<Vec3>>): Measurement<Vec3> {
  return makeMeasurement<Vec3>({
    value,
    unit: "m/s",
    source: (extra?.source as "measured-camera" | undefined) ?? "measured-camera",
    confidence: extra?.confidence ?? 0.9,
    ...(covariance ? { uncertainty: { covariance, unit: "m/s" } } : {}),
    qualityFlags: extra?.qualityFlags ?? [],
  });
}

function expectUnavailable(m: Measurement<number>, flag: string): void {
  expect(m.value).toBeNull();
  expect(m.source).toBe("unavailable");
  expect(m.confidence).toBe(0);
  expect(m.qualityFlags).toContain(flag);
  expect(m.uncertainty).toBeUndefined();
}

describe("ball speed and launch angles (docs/coordinate-system.md §3)", () => {
  it("ball speed is |v|", () => {
    expect(ballSpeedMps({ x: 3, y: 4, z: 12 })).toBe(13);
    const m = deriveBallSpeedMps(vectorMeasurement({ x: 3, y: 4, z: 12 }));
    expect(m.value).toBe(13);
    expect(m.unit).toBe("m/s");
  });

  it("vertical launch angle is atan2(vz, |v_xy|), positive up", () => {
    expect(verticalLaunchAngleRad({ x: 10, y: 0, z: 10 })).toBeCloseTo(Math.PI / 4, 14);
    expect(verticalLaunchAngleRad({ x: 3, y: 4, z: -5 })).toBeCloseTo(-Math.PI / 4, 14);
    expect(deriveVerticalLaunchAngleDeg(vectorMeasurement({ x: 10, y: 0, z: 10 })).value).toBeCloseTo(45, 12);
    expect(deriveVerticalLaunchAngleDeg(vectorMeasurement({ x: 0, y: 0, z: 5 })).value).toBeCloseTo(90, 12);
    expect(deriveVerticalLaunchAngleDeg(vectorMeasurement(velocityFromAngles(70, 12.5, -3))).value).toBeCloseTo(12.5, 10);
  });

  it("horizontal launch angle is atan2(vy, vx): positive = LEFT (+Y), negative = right", () => {
    expect(horizontalLaunchAngleRad({ x: 10, y: 10, z: 3 })).toBeCloseTo(Math.PI / 4, 14);
    expect(deriveHorizontalLaunchAngleDeg(vectorMeasurement({ x: 10, y: 10, z: 0 })).value).toBeCloseTo(45, 12);
    expect(deriveHorizontalLaunchAngleDeg(vectorMeasurement({ x: 10, y: -10, z: 0 })).value).toBeCloseTo(-45, 12);
    expect(deriveHorizontalLaunchAngleDeg(vectorMeasurement(velocityFromAngles(70, 10, 2.1))).value).toBeCloseTo(2.1, 10);
    expect(deriveHorizontalLaunchAngleDeg(vectorMeasurement(velocityFromAngles(70, 10, -2.1))).value).toBeCloseTo(-2.1, 10);
  });

  it("returns unavailable (never NaN) for zero or vertical velocity", () => {
    expectUnavailable(deriveVerticalLaunchAngleDeg(vectorMeasurement({ x: 0, y: 0, z: 0 })), "vertical-launch-angle-undefined-zero-velocity");
    expectUnavailable(deriveHorizontalLaunchAngleDeg(vectorMeasurement({ x: 0, y: 0, z: 0 })), "horizontal-launch-angle-undefined-zero-velocity");
    expectUnavailable(
      deriveHorizontalLaunchAngleDeg(vectorMeasurement({ x: 0, y: 0, z: 30 })),
      "horizontal-launch-angle-undefined-vertical-velocity",
    );
  });
});

describe("spin rate and spin-axis tilt (docs/coordinate-system.md §4)", () => {
  it("total spin rpm = |w| * 60 / (2 pi)", () => {
    const w = { x: 0, y: -2 * Math.PI * 50, z: 0 }; // 50 rev/s
    expect(spinRateRadPerSec(w)).toBeCloseTo(2 * Math.PI * 50, 12);
    expect(deriveTotalSpinRpm(vectorMeasurement(w)).value).toBeCloseTo(3000, 9);
    expect(deriveTotalSpinRpm(vectorMeasurement(w)).unit).toBe("rpm");
    expect(deriveTotalSpinRpm(vectorMeasurement({ x: 100, y: -200, z: 200 })).value).toBeCloseTo(300 * RPM, 9);
  });

  it("launch-direction frame for v = +X is d = +X, r = -Y (golfer's right), u = +Z", () => {
    const f = launchDirectionFrame({ x: 50, y: 0, z: 0 });
    expect(f).not.toBeNull();
    expect(f!.d).toEqual({ x: 1, y: 0, z: 0 });
    expect(f!.r.x).toBeCloseTo(0, 15);
    expect(f!.r.y).toBeCloseTo(-1, 15);
    expect(f!.u.z).toBeCloseTo(1, 15);
    expect(launchDirectionFrame({ x: 0, y: 0, z: 0 })).toBeNull();
    expect(launchDirectionFrame({ x: 0, y: 0, z: -20 })).toBeNull();
  });

  it("pure backspin with v = +X is w || -Y with zero tilt", () => {
    const v = { x: 60, y: 0, z: 0 };
    const w = { x: 0, y: -280, z: 0 };
    expect(spinAxisTiltRad(w, v)).toBeCloseTo(0, 15);
    // Magnus direction w x v points up (lift).
    expect(cross(w, v).z).toBeGreaterThan(0);
    const c = spinComponentsRpm(w, v)!;
    expect(c.backspinRpm).toBeCloseTo(280 * RPM, 9);
    expect(c.sidespinRpm).toBeCloseTo(0, 9);
    expect(c.riflingRpm).toBeCloseTo(0, 9);
  });

  it("positive tilt with v = +X has w.z < 0 and curves the ball RIGHT (-Y)", () => {
    const v = { x: 60, y: 0, z: 0 };
    const w = angularVelocityFromSpin({ totalSpinRadPerSec: 300, spinAxisTiltRad: 10 * DEG, velocity: v });
    expect(w.z).toBeLessThan(0);
    expect(w.y).toBeLessThan(0);
    expect(w.z).toBeCloseTo(-300 * Math.sin(10 * DEG), 10);
    expect(cross(w, v).y).toBeLessThan(0); // Magnus force component toward the golfer's right
    expect(spinComponentsRpm(w, v)!.sidespinRpm).toBeGreaterThan(0);
    const left = angularVelocityFromSpin({ totalSpinRadPerSec: 300, spinAxisTiltRad: -10 * DEG, velocity: v });
    expect(left.z).toBeGreaterThan(0);
    expect(cross(left, v).y).toBeGreaterThan(0);
  });

  it("tilt round-trips through angularVelocityFromSpin over the launch/aim/tilt grid to 1e-9", () => {
    let checked = 0;
    for (let vla = 0; vla <= 45; vla += 5) {
      for (let hla = -15; hla <= 15; hla += 5) {
        for (let tilt = -30; tilt <= 30; tilt += 5) {
          const v = velocityFromAngles(70, vla, hla);
          const total = 300;
          const w = angularVelocityFromSpin({ totalSpinRadPerSec: total, spinAxisTiltRad: tilt * DEG, velocity: v });
          expect(Math.abs((spinAxisTiltRad(w, v) as number) - tilt * DEG)).toBeLessThan(1e-9);
          expect(Math.abs(norm(w) - total)).toBeLessThan(1e-9);
          const c = spinComponentsRpm(w, v)!;
          expect(Math.abs(c.backspinRpm - total * RPM * Math.cos(tilt * DEG))).toBeLessThan(1e-9);
          expect(Math.abs(c.sidespinRpm - total * RPM * Math.sin(tilt * DEG))).toBeLessThan(1e-9);
          expect(Math.abs(c.riflingRpm)).toBeLessThan(1e-9);
          const viaMeasurement = deriveSpinAxisTiltDeg(vectorMeasurement(w), vectorMeasurement(v)).value as number;
          expect(Math.abs(viaMeasurement - tilt)).toBeLessThan(1e-9);
          checked++;
        }
      }
    }
    expect(checked).toBe(10 * 7 * 13);
  });

  it("rifle spin (about the flight direction) does not change the tilt", () => {
    const v = velocityFromAngles(65, 14, -4);
    const base = angularVelocityFromSpin({ totalSpinRadPerSec: 250, spinAxisTiltRad: 12 * DEG, velocity: v });
    const withRifle = angularVelocityFromSpin({ totalSpinRadPerSec: 250, spinAxisTiltRad: 12 * DEG, velocity: v, riflingRadPerSec: 80 });
    expect(norm(withRifle)).toBeCloseTo(250, 9);
    expect(spinAxisTiltRad(withRifle, v)).toBeCloseTo(12 * DEG, 12);
    expect(spinComponentsRpm(withRifle, v)!.riflingRpm).toBeCloseTo(80 * RPM, 9);
    const d = launchDirectionFrame(v)!.d;
    const shifted = { x: base.x + 150 * d.x, y: base.y + 150 * d.y, z: base.z + 150 * d.z };
    expect(spinAxisTiltRad(shifted, v)).toBeCloseTo(12 * DEG, 12);
    // Pure rifle spin has no defined tilt.
    expect(spinAxisTiltRad({ x: 200 * d.x, y: 200 * d.y, z: 200 * d.z }, v)).toBeNull();
  });

  it("undefined frames return null / throw instead of a number", () => {
    expect(spinAxisTiltRad({ x: 0, y: -300, z: 0 }, { x: 0, y: 0, z: 0 })).toBeNull();
    expect(spinAxisTiltRad({ x: 0, y: -300, z: 0 }, { x: 0, y: 0, z: 40 })).toBeNull();
    expect(spinComponentsRpm({ x: 0, y: -300, z: 0 }, { x: 0, y: 0, z: 40 })).toBeNull();
    expect(() => angularVelocityFromSpin({ totalSpinRadPerSec: 300, spinAxisTiltRad: 0, velocity: { x: 0, y: 0, z: 40 } })).toThrow(
      /frame undefined/,
    );
    expect(() =>
      angularVelocityFromSpin({ totalSpinRadPerSec: 100, spinAxisTiltRad: 0, velocity: { x: 40, y: 0, z: 0 }, riflingRadPerSec: 120 }),
    ).toThrow(/rifling/);
  });
});

describe("Measurement-level derivations: provenance and unavailability", () => {
  it("derived values inherit provenance via combineSources, min confidence and all quality flags", () => {
    const v = vectorMeasurement(velocityFromAngles(70, 12, 1), undefined, { source: "measured-camera", confidence: 0.9, qualityFlags: ["vflag"] });
    const w = makeMeasurement<Vec3>({
      value: angularVelocityFromSpin({ totalSpinRadPerSec: 280, spinAxisTiltRad: 5 * DEG, velocity: v.value as Vec3 }),
      unit: "rad/s",
      source: "measured-radar",
      confidence: 0.7,
      qualityFlags: ["wflag"],
    });
    const tilt = deriveSpinAxisTiltDeg(w, v);
    expect(tilt.source).toBe("measured-hybrid");
    expect(tilt.confidence).toBe(0.7);
    expect(tilt.qualityFlags).toEqual(expect.arrayContaining(["vflag", "wflag"]));
    expect(tilt.value).toBeCloseTo(5, 9);

    const synthetic = makeMeasurement<Vec3>({ value: v.value as Vec3, unit: "m/s", source: "synthetic", confidence: 1 });
    expect(deriveBallSpeedMps(synthetic).source).toBe("synthetic");
    expect(deriveSpinAxisTiltDeg(w, synthetic).source).toBe("synthetic");
    const estimated = makeMeasurement<Vec3>({ value: w.value as Vec3, unit: "rad/s", source: "estimated-player-model", confidence: 0.5 });
    expect(deriveSpinAxisTiltDeg(estimated, v).source).toBe("estimated-player-model");
    expect(deriveTotalSpinRpm(estimated).source).toBe("estimated-player-model");
  });

  it("unavailable inputs give unavailable outputs with a specific flag, never numbers", () => {
    const missingV = unavailableMeasurement<Vec3>("m/s", ["launch-fit-failed"]);
    for (const m of [deriveBallSpeedMps(missingV), deriveVerticalLaunchAngleDeg(missingV), deriveHorizontalLaunchAngleDeg(missingV)]) {
      expectUnavailable(m, "velocity-unavailable");
      expect(m.qualityFlags).toContain("launch-fit-failed");
    }
    const missingW = unavailableMeasurement<Vec3>("rad/s", ["spin-unavailable"]);
    expectUnavailable(deriveTotalSpinRpm(missingW), "angular-velocity-unavailable");
    const v = vectorMeasurement({ x: 60, y: 0, z: 10 });
    expectUnavailable(deriveSpinAxisTiltDeg(missingW, v), "angular-velocity-unavailable");
    const w = vectorMeasurement({ x: 0, y: -300, z: 0 });
    expectUnavailable(deriveSpinAxisTiltDeg(w, missingV), "velocity-unavailable");
  });

  it("undefined spin axis is reported with a specific reason", () => {
    const w = vectorMeasurement({ x: 0, y: -300, z: 10 });
    expectUnavailable(deriveSpinAxisTiltDeg(w, vectorMeasurement({ x: 0, y: 0, z: 25 })), "spin-axis-undefined-vertical-velocity");
    expectUnavailable(deriveSpinAxisTiltDeg(w, vectorMeasurement({ x: 0, y: 0, z: 0 })), "spin-axis-undefined-zero-velocity");
    expectUnavailable(
      deriveSpinAxisTiltDeg(vectorMeasurement({ x: 250, y: 0, z: 0 }), vectorMeasurement({ x: 60, y: 0, z: 0 })),
      "spin-axis-undefined-no-perpendicular-spin",
    );
    // Measured ~0 rpm (knuckleball): perpendicular spin is within its own noise -> no axis.
    const noisyZero = makeMeasurement<Vec3>({
      value: { x: 3, y: -5, z: 4 },
      unit: "rad/s",
      source: "synthetic",
      confidence: 0.9,
      uncertainty: { covariance: [[36, 0, 0], [0, 36, 0], [0, 0, 36]], unit: "rad/s" },
    });
    expectUnavailable(deriveSpinAxisTiltDeg(noisyZero, vectorMeasurement({ x: 60, y: 0, z: 10 })), "spin-axis-undefined-spin-below-noise");
    expect(deriveTotalSpinRpm(noisyZero).value).toBeCloseTo(norm({ x: 3, y: -5, z: 4 }) * RPM, 9);
  });

  it("an indefinite covariance is flagged instead of producing a NaN sigma", () => {
    const m = makeMeasurement<Vec3>({
      value: { x: 60, y: 0, z: 10 },
      unit: "m/s",
      source: "measured-camera",
      confidence: 0.9,
      uncertainty: { covariance: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]], unit: "m/s" },
    });
    const speed = deriveBallSpeedMps(m);
    expect(speed.value).toBeCloseTo(Math.hypot(60, 10), 12);
    expect(speed.uncertainty).toBeUndefined();
    expect(speed.qualityFlags).toContain("uncertainty-covariance-invalid");
    // A value whose uncertainty could not be propagated does not keep full confidence.
    expect(speed.confidence).toBeCloseTo(0.9 * UNPROPAGATED_UNCERTAINTY_CONFIDENCE_SCALE, 12);
    expect(speed.confidence).toBeLessThan(0.9);
  });

  it("a singular Jacobian lowers the confidence; a value whose input has no covariance does not", () => {
    const vertical = (withCovariance: boolean) =>
      makeMeasurement<Vec3>({
        value: { x: 0, y: 0, z: 30 },
        unit: "m/s",
        source: "measured-camera",
        confidence: 0.8,
        ...(withCovariance ? { uncertainty: { covariance: [[0.01, 0, 0], [0, 0.01, 0], [0, 0, 0.01]], unit: "m/s" } } : {}),
      });
    const singular = deriveVerticalLaunchAngleDeg(vertical(true));
    expect(singular.value).toBeCloseTo(90, 12);
    expect(singular.qualityFlags).toContain("uncertainty-not-propagated-singular-jacobian");
    expect(singular.uncertainty).toBeUndefined();
    expect(singular.confidence).toBeCloseTo(0.4, 12);
    const noCovariance = deriveVerticalLaunchAngleDeg(vertical(false));
    expect(noCovariance.qualityFlags).not.toContain("uncertainty-not-propagated-singular-jacobian");
    expect(noCovariance.confidence).toBe(0.8);
  });

  it("non-finite input values (bypassing the factory) become unavailable, not NaN", () => {
    const corrupt = { value: { x: Number.NaN, y: 0, z: 1 }, unit: "m/s", source: "measured-camera", confidence: 0.9, qualityFlags: [] } as const;
    expectUnavailable(deriveBallSpeedMps(corrupt as unknown as Measurement<Vec3>), "velocity-non-finite");
  });
});

describe("first-order uncertainty propagation agrees with Monte Carlo (within 10 %)", () => {
  const N = 20000;
  const rng = createRng(20261001);
  const v0 = velocityFromAngles(62, 14, 3);
  const covV = rotatedCovariance(rng, [0.3, 0.5, 0.8]);
  const w0 = angularVelocityFromSpin({ totalSpinRadPerSec: 320, spinAxisTiltRad: 8 * DEG, velocity: v0 });
  const covW = rotatedCovariance(rng, [6, 9, 12]).map((row) => row.map((x) => x));
  const vM = makeMeasurement<Vec3>({ value: v0, unit: "m/s", source: "synthetic", confidence: 1, uncertainty: { covariance: covV, unit: "m/s" } });
  const wM = makeMeasurement<Vec3>({ value: w0, unit: "rad/s", source: "synthetic", confidence: 1, uncertainty: { covariance: covW, unit: "rad/s" } });
  const toVec = (a: number[]): Vec3 => ({ x: a[0] as number, y: a[1] as number, z: a[2] as number });
  const vSamples = Array.from({ length: N }, () => toVec(sampleMultivariateNormal(rng, [v0.x, v0.y, v0.z], covV)));
  const wSamples = Array.from({ length: N }, () => toVec(sampleMultivariateNormal(rng, [w0.x, w0.y, w0.z], covW)));

  const within10 = (analytic: number | undefined, mc: number): void => {
    expect(analytic).toBeDefined();
    expect(Math.abs((analytic as number) / mc - 1)).toBeLessThan(0.1);
  };

  it("ball speed, vertical and horizontal launch angle", () => {
    const speed = deriveBallSpeedMps(vM);
    within10(speed.uncertainty?.sigma, standardDeviation(vSamples.map(norm)));
    expect(speed.uncertainty?.unit).toBe("m/s");
    const vla = deriveVerticalLaunchAngleDeg(vM);
    within10(vla.uncertainty?.sigma, standardDeviation(vSamples.map((v) => verticalLaunchAngleRad(v) / DEG)));
    expect(vla.uncertainty?.unit).toBe("deg");
    const hla = deriveHorizontalLaunchAngleDeg(vM);
    within10(hla.uncertainty?.sigma, standardDeviation(vSamples.map((v) => horizontalLaunchAngleRad(v) / DEG)));
  });

  it("total spin rpm", () => {
    const total = deriveTotalSpinRpm(wM);
    within10(total.uncertainty?.sigma, standardDeviation(wSamples.map((w) => norm(w) * RPM)));
    expect(total.uncertainty?.unit).toBe("rpm");
  });

  it("spin-axis tilt from angular-velocity noise, launch-velocity noise, and both", () => {
    const vExact = makeMeasurement<Vec3>({ value: v0, unit: "m/s", source: "synthetic", confidence: 1 });
    const wExact = makeMeasurement<Vec3>({ value: w0, unit: "rad/s", source: "synthetic", confidence: 1 });
    const tiltDeg = (w: Vec3, v: Vec3): number => (spinAxisTiltRad(w, v) as number) / DEG;

    const onlyW = deriveSpinAxisTiltDeg(wM, vExact);
    within10(onlyW.uncertainty?.sigma, standardDeviation(wSamples.map((w) => tiltDeg(w, v0))));
    expect(onlyW.qualityFlags).toContain("uncertainty-partial");

    // Exaggerate the velocity covariance so its (small) effect on the tilt is measurable.
    const bigCovV = covV.map((row) => row.map((x) => x * 25));
    const vBig = makeMeasurement<Vec3>({ value: v0, unit: "m/s", source: "synthetic", confidence: 1, uncertainty: { covariance: bigCovV, unit: "m/s" } });
    const vBigSamples = vSamples.map((v) => ({ x: v0.x + 5 * (v.x - v0.x), y: v0.y + 5 * (v.y - v0.y), z: v0.z + 5 * (v.z - v0.z) }));
    const onlyV = deriveSpinAxisTiltDeg(wExact, vBig);
    const mcOnlyV = standardDeviation(vBigSamples.map((v) => tiltDeg(w0, v)));
    expect(mcOnlyV).toBeGreaterThan(0.05);
    within10(onlyV.uncertainty?.sigma, mcOnlyV);

    const both = deriveSpinAxisTiltDeg(wM, vBig);
    within10(both.uncertainty?.sigma, standardDeviation(wSamples.map((w, i) => tiltDeg(w, vBigSamples[i] as Vec3))));
    expect(both.qualityFlags).not.toContain("uncertainty-partial");
  });
});
