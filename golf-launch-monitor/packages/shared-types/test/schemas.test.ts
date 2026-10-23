import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  buildJsonSchemas,
  deepFreeze,
  EXPORTED_SCHEMAS,
  measurementSchema,
  RawSensorObservationSchema,
  ReplayRecordSchema,
  Vec3Schema,
} from "../src/index";

const NumberMeasurement = measurementSchema(z.number());
const Vec3Measurement = measurementSchema(Vec3Schema);

describe("Measurement provenance invariants", () => {
  it("accepts a measured value with confidence", () => {
    const result = NumberMeasurement.safeParse({
      value: 70.1,
      unit: "m/s",
      source: "measured-camera",
      confidence: 0.9,
      uncertainty: { sigma: 0.3, unit: "m/s" },
      qualityFlags: [],
    });
    expect(result.success).toBe(true);
  });

  it("accepts an unavailable value that is null with zero confidence", () => {
    const result = NumberMeasurement.safeParse({
      value: null,
      unit: "rpm",
      source: "unavailable",
      confidence: 0,
      qualityFlags: ["spin-not-measured"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a null value that claims to be measured (no silent fabrication of provenance)", () => {
    const result = NumberMeasurement.safeParse({
      value: null,
      unit: "rpm",
      source: "measured-camera",
      confidence: 0.8,
      qualityFlags: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a numeric value labelled unavailable (no silent fabrication of values)", () => {
    const result = NumberMeasurement.safeParse({
      value: 2500,
      unit: "rpm",
      source: "unavailable",
      confidence: 0,
      qualityFlags: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects unavailable values with nonzero confidence", () => {
    const result = NumberMeasurement.safeParse({
      value: null,
      unit: "rpm",
      source: "unavailable",
      confidence: 0.2,
      qualityFlags: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects confidence outside [0, 1] and non-finite values", () => {
    expect(
      NumberMeasurement.safeParse({ value: 1, unit: "m", source: "manual", confidence: 1.2, qualityFlags: [] })
        .success,
    ).toBe(false);
    expect(
      NumberMeasurement.safeParse({ value: Number.NaN, unit: "m", source: "manual", confidence: 1, qualityFlags: [] })
        .success,
    ).toBe(false);
    expect(
      Vec3Measurement.safeParse({
        value: { x: Number.POSITIVE_INFINITY, y: 0, z: 0 },
        unit: "m",
        source: "synthetic",
        confidence: 1,
        qualityFlags: [],
      }).success,
    ).toBe(false);
  });

  it("rejects unknown sources and unknown fields", () => {
    expect(
      NumberMeasurement.safeParse({ value: 1, unit: "m", source: "guessed", confidence: 1, qualityFlags: [] })
        .success,
    ).toBe(false);
    expect(
      NumberMeasurement.safeParse({
        value: 1,
        unit: "m",
        source: "manual",
        confidence: 1,
        qualityFlags: [],
        sneaky: true,
      }).success,
    ).toBe(false);
  });
});

describe("observation and replay schemas", () => {
  it("discriminates observations by kind", () => {
    const ok = RawSensorObservationSchema.safeParse({
      kind: "ball-position-3d",
      sensorId: "synthetic-1",
      sequence: 3,
      timestampS: 0.002,
      frameIndex: 2,
      positionM: { x: 0.1, y: 0, z: 0.02 },
      covarianceM2: [
        [1e-6, 0, 0],
        [0, 1e-6, 0],
        [0, 0, 1e-6],
      ],
      reprojectionErrorPx: null,
      detectionConfidence: 1,
      cameraIds: [],
    });
    expect(ok.success).toBe(true);
    const wrongKind = RawSensorObservationSchema.safeParse({ kind: "telepathy", sensorId: "x", sequence: 0, timestampS: 0 });
    expect(wrongKind.success).toBe(false);
  });

  it("parses a replay observation record", () => {
    const ok = ReplayRecordSchema.safeParse({
      type: "observation",
      observation: {
        kind: "trigger",
        sensorId: "synthetic-1",
        sequence: 0,
        timestampS: 0,
        triggerSource: "synthetic",
        confidence: 1,
      },
    });
    expect(ok.success).toBe(true);
  });
});

describe("deepFreeze", () => {
  it("freezes nested objects and arrays", () => {
    const value = deepFreeze({ a: { b: [1, 2, { c: 3 }] } });
    expect(Object.isFrozen(value)).toBe(true);
    expect(Object.isFrozen(value.a)).toBe(true);
    expect(Object.isFrozen(value.a.b)).toBe(true);
    expect(Object.isFrozen(value.a.b[2])).toBe(true);
    expect(() => {
      (value as unknown as { a: { b: number[] } }).a.b.push(4);
    }).toThrow();
  });
});

describe("generated JSON Schema files", () => {
  it("are up to date with the zod schemas (run `npm run schemas:generate` if this fails)", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const generated = buildJsonSchemas();
    for (const name of Object.keys(EXPORTED_SCHEMAS) as (keyof typeof generated)[]) {
      const onDisk = readFileSync(join(here, "..", "schemas", `${name}.schema.json`), "utf8");
      expect(onDisk).toBe(`${JSON.stringify(generated[name], null, 2)}\n`);
    }
  });
});
