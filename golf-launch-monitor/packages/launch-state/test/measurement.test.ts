import { MEASUREMENT_SOURCES } from "@glm/shared-types";
import type { MeasurementSource, Vec3 } from "@glm/shared-types";
import { describe, expect, it } from "vitest";
import { combineSources, ESTIMATOR_VERSION, isAvailable, makeMeasurement, unavailableMeasurement } from "../src/index";

describe("ESTIMATOR_VERSION", () => {
  it("is the documented estimator id", () => {
    expect(ESTIMATOR_VERSION).toBe("glm-launch-fit-0.1.0");
  });
});

describe("makeMeasurement", () => {
  it("builds a deep-frozen copy and leaves the caller's objects mutable", () => {
    const value = { x: 1, y: 2, z: 3 };
    const covariance = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ];
    const m = makeMeasurement<Vec3>({
      value,
      unit: "m/s",
      source: "measured-camera",
      confidence: 0.8,
      uncertainty: { covariance, unit: "m/s" },
      qualityFlags: ["a", "a", "b"],
    });
    expect(m.value).toEqual({ x: 1, y: 2, z: 3 });
    expect(m.source).toBe("measured-camera");
    expect(m.confidence).toBe(0.8);
    expect(m.qualityFlags).toEqual(["a", "b"]);
    expect(Object.isFrozen(m)).toBe(true);
    expect(Object.isFrozen(m.value)).toBe(true);
    expect(Object.isFrozen(m.uncertainty)).toBe(true);
    expect(Object.isFrozen(m.uncertainty?.covariance?.[0])).toBe(true);
    expect(Object.isFrozen(value)).toBe(false);
    expect(Object.isFrozen(covariance)).toBe(false);
    expect("uncertainty" in makeMeasurement({ value: 1, unit: "m", source: "manual", confidence: 1 })).toBe(false);
  });

  it("rejects NaN and Infinity anywhere in the value", () => {
    const base = { unit: "m/s", source: "measured-camera" as const, confidence: 0.5 };
    expect(() => makeMeasurement({ ...base, value: Number.NaN })).toThrow(/not finite/);
    expect(() => makeMeasurement({ ...base, value: Number.POSITIVE_INFINITY })).toThrow(/not finite/);
    expect(() => makeMeasurement({ ...base, value: { x: 1, y: Number.NaN, z: 0 } })).toThrow(/value\.y/);
    expect(() => makeMeasurement({ ...base, value: { heelToe: 1, lowHigh: -Infinity } })).toThrow(/lowHigh/);
  });

  it("rejects null/undefined values (missing data must be unavailableMeasurement)", () => {
    expect(() => makeMeasurement({ value: null, unit: "m", source: "manual", confidence: 1 })).toThrow(/unavailableMeasurement/);
    expect(() => makeMeasurement({ value: undefined, unit: "m", source: "manual", confidence: 1 })).toThrow();
    expect(() => makeMeasurement({ value: { x: 1, y: null, z: 0 }, unit: "m", source: "manual", confidence: 1 })).toThrow();
  });

  it("rejects confidence outside [0, 1] or non-finite", () => {
    const base = { value: 1, unit: "m", source: "manual" as const };
    expect(() => makeMeasurement({ ...base, confidence: 1.0000001 })).toThrow(/confidence/);
    expect(() => makeMeasurement({ ...base, confidence: -0.1 })).toThrow(/confidence/);
    expect(() => makeMeasurement({ ...base, confidence: Number.NaN })).toThrow(/confidence/);
    expect(makeMeasurement({ ...base, confidence: 0 }).confidence).toBe(0);
    expect(makeMeasurement({ ...base, confidence: 1 }).confidence).toBe(1);
  });

  it("rejects an 'unavailable' source, unknown sources and invalid uncertainty", () => {
    expect(() =>
      makeMeasurement({ value: 1, unit: "m", source: "unavailable" as unknown as "manual", confidence: 0 }),
    ).toThrow(/unavailable/);
    expect(() => makeMeasurement({ value: 1, unit: "m", source: "guessed" as unknown as "manual", confidence: 0.5 })).toThrow(
      /unknown source/,
    );
    expect(() =>
      makeMeasurement({ value: 1, unit: "m", source: "manual", confidence: 0.5, uncertainty: { sigma: Number.NaN, unit: "m" } }),
    ).toThrow(/sigma/);
    expect(() =>
      makeMeasurement({ value: 1, unit: "m", source: "manual", confidence: 0.5, uncertainty: { sigma: -1, unit: "m" } }),
    ).toThrow(/sigma/);
    expect(() =>
      makeMeasurement({
        value: 1,
        unit: "m",
        source: "manual",
        confidence: 0.5,
        uncertainty: { covariance: [[1, Number.POSITIVE_INFINITY]], unit: "m" },
      }),
    ).toThrow(/covariance/);
  });
});

describe("unavailableMeasurement / isAvailable", () => {
  it("is null with confidence 0, frozen, and keeps the reason flags", () => {
    const m = unavailableMeasurement<number>("rpm", ["spin-not-measured"]);
    expect(m.value).toBeNull();
    expect(m.source).toBe("unavailable");
    expect(m.confidence).toBe(0);
    expect(m.qualityFlags).toEqual(["spin-not-measured"]);
    expect(Object.isFrozen(m)).toBe(true);
    expect(isAvailable(m)).toBe(false);
  });

  it("isAvailable is true only for valued measurements", () => {
    expect(isAvailable(makeMeasurement({ value: 0, unit: "m", source: "synthetic", confidence: 0.2 }))).toBe(true);
    // A malformed object claiming a value with an unavailable source is not available.
    expect(isAvailable({ value: 3, unit: "m", source: "unavailable", confidence: 0, qualityFlags: [] })).toBe(false);
  });
});

describe("combineSources", () => {
  // Lower rank = less trustworthy. A derived value must take the lowest rank among its inputs.
  const rank = (s: MeasurementSource): number =>
    ({
      unavailable: 0,
      "assumed-generic-fallback": 1,
      "estimated-club-model": 2,
      "estimated-player-model": 3,
      synthetic: 4,
      manual: 5,
      "measured-camera": 6,
      "measured-radar": 6,
      "measured-hybrid": 6,
    })[s];

  it("applies the documented precedence", () => {
    expect(combineSources(["measured-camera", "unavailable", "synthetic"])).toBe("unavailable");
    expect(combineSources(["measured-camera", "synthetic", "manual"])).toBe("synthetic");
    // Model-derived labels outrank stream-origin labels: an estimate stays visibly an estimate.
    expect(combineSources(["manual", "estimated-club-model"])).toBe("estimated-club-model");
    expect(combineSources(["synthetic", "assumed-generic-fallback"])).toBe("assumed-generic-fallback");
    expect(combineSources(["synthetic", "estimated-player-model"])).toBe("estimated-player-model");
    expect(combineSources(["estimated-player-model", "assumed-generic-fallback"])).toBe("assumed-generic-fallback");
    expect(combineSources(["estimated-player-model", "estimated-club-model", "measured-radar"])).toBe("estimated-club-model");
    expect(combineSources(["measured-camera", "estimated-player-model"])).toBe("estimated-player-model");
  });

  it("merges measured kinds: same kind stays, mixed kinds become measured-hybrid", () => {
    expect(combineSources(["measured-camera"])).toBe("measured-camera");
    expect(combineSources(["measured-camera", "measured-camera"])).toBe("measured-camera");
    expect(combineSources(["measured-radar", "measured-radar"])).toBe("measured-radar");
    expect(combineSources(["measured-camera", "measured-radar"])).toBe("measured-hybrid");
    expect(combineSources(["measured-hybrid", "measured-camera"])).toBe("measured-hybrid");
  });

  it("never upgrades provenance for any pair or triple of inputs", () => {
    for (const a of MEASUREMENT_SOURCES) {
      for (const b of MEASUREMENT_SOURCES) {
        const pair = combineSources([a, b]);
        expect(rank(pair)).toBe(Math.min(rank(a), rank(b)));
        for (const c of MEASUREMENT_SOURCES) {
          expect(rank(combineSources([a, b, c]))).toBe(Math.min(rank(a), rank(b), rank(c)));
        }
      }
    }
  });

  it("throws on empty input and unknown labels", () => {
    expect(() => combineSources([])).toThrow(/at least one/);
    expect(() => combineSources(["measured-camera", "measured-lidar" as MeasurementSource])).toThrow(/unknown source/);
  });
});
