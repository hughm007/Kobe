import { ESTIMATED_SOURCES, MEASURED_SOURCES, MEASUREMENT_SOURCES, type MeasurementSource } from "@glm/shared-types";
import { describe, expect, it } from "vitest";
import {
  badgeForSource,
  CONFIDENCE_HIGH_MIN,
  CONFIDENCE_MEDIUM_MIN,
  confidenceLabel,
  type ProvenanceBadge,
  PROVENANCE_SEVERITY,
  statusForSource,
  worstBadge,
} from "../src/index";

describe("badgeForSource", () => {
  const expected: Record<MeasurementSource, ProvenanceBadge> = {
    "measured-camera": "MEASURED",
    "measured-radar": "MEASURED",
    "measured-hybrid": "MEASURED",
    "estimated-player-model": "ESTIMATED",
    "estimated-club-model": "ESTIMATED",
    "assumed-generic-fallback": "ASSUMED",
    manual: "MANUAL",
    synthetic: "SYNTHETIC",
    unavailable: "UNAVAILABLE",
  };

  it("maps every MeasurementSource to its badge", () => {
    for (const source of MEASUREMENT_SOURCES) expect(badgeForSource(source)).toBe(expected[source]);
  });

  it("only measured-* sources ever produce MEASURED (synthetic, estimated, assumed, manual never do)", () => {
    for (const source of MEASUREMENT_SOURCES) {
      expect(badgeForSource(source) === "MEASURED").toBe(MEASURED_SOURCES.has(source));
    }
    expect(badgeForSource("synthetic")).not.toBe("MEASURED");
    for (const source of ESTIMATED_SOURCES) expect(badgeForSource(source)).not.toBe("MEASURED");
  });

  it("never returns CALCULATED for a raw source", () => {
    for (const source of MEASUREMENT_SOURCES) expect(badgeForSource(source)).not.toBe("CALCULATED");
  });

  it("throws on an unknown source rather than guessing", () => {
    expect(() => badgeForSource("measured-psychic" as MeasurementSource)).toThrow(/unknown measurement source/);
  });

  it("has a non-empty status sentence for every source, and only measured ones say 'Measured'", () => {
    for (const source of MEASUREMENT_SOURCES) {
      const status = statusForSource(source);
      expect(status.length).toBeGreaterThan(5);
      expect(status.startsWith("Measured")).toBe(MEASURED_SOURCES.has(source));
    }
    expect(statusForSource("synthetic")).toContain("not measured");
  });
});

describe("worstBadge", () => {
  it("orders MEASURED < ESTIMATED < MANUAL < ASSUMED < SYNTHETIC < UNAVAILABLE", () => {
    expect(PROVENANCE_SEVERITY).toEqual(["MEASURED", "ESTIMATED", "MANUAL", "ASSUMED", "SYNTHETIC", "UNAVAILABLE"]);
    expect(worstBadge(["MEASURED", "MEASURED"])).toBe("MEASURED");
    expect(worstBadge(["MEASURED", "ESTIMATED"])).toBe("ESTIMATED");
    expect(worstBadge(["ESTIMATED", "SYNTHETIC"])).toBe("SYNTHETIC");
    expect(worstBadge(["ASSUMED", "MANUAL"])).toBe("ASSUMED");
    expect(worstBadge(["UNAVAILABLE", "MEASURED"])).toBe("UNAVAILABLE");
  });

  it("rejects CALCULATED and empty input", () => {
    expect(() => worstBadge([])).toThrow(/no badges/);
    expect(() => worstBadge(["MEASURED", "CALCULATED"])).toThrow(/not a source badge/);
  });
});

describe("confidenceLabel", () => {
  it("documented thresholds: >= 0.8 high, >= 0.5 medium, > 0 low, 0 none", () => {
    expect(CONFIDENCE_HIGH_MIN).toBe(0.8);
    expect(CONFIDENCE_MEDIUM_MIN).toBe(0.5);
    expect(confidenceLabel(1)).toBe("high");
    expect(confidenceLabel(0.8)).toBe("high");
    expect(confidenceLabel(0.7999)).toBe("medium");
    expect(confidenceLabel(0.5)).toBe("medium");
    expect(confidenceLabel(0.4999)).toBe("low");
    expect(confidenceLabel(1e-9)).toBe("low");
    expect(confidenceLabel(0)).toBe("none");
  });

  it("throws outside [0, 1] or on NaN", () => {
    expect(() => confidenceLabel(-0.1)).toThrow(RangeError);
    expect(() => confidenceLabel(1.1)).toThrow(RangeError);
    expect(() => confidenceLabel(Number.NaN)).toThrow(RangeError);
  });
});
