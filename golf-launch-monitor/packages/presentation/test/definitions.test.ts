import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ShotMetricsSchema } from "@glm/shared-types";
import { describe, expect, it } from "vitest";
import {
  LAUNCH_FIELD_FOR_METRIC,
  METRIC_DEFINITIONS,
  METRIC_IDS,
  type MetricId,
  SHOT_METRICS_FIELD_FOR_METRIC,
} from "../src/index";
import { makeLaunch } from "./fixtures";

const here = dirname(fileURLToPath(import.meta.url));
const doc = readFileSync(join(here, "../../../docs/coordinate-system.md"), "utf8");

describe("METRIC_DEFINITIONS", () => {
  it("defines every MetricId exactly once, keyed by its own id", () => {
    expect(METRIC_IDS).toHaveLength(31);
    expect(new Set(METRIC_IDS).size).toBe(31);
    expect(Object.keys(METRIC_DEFINITIONS).sort()).toEqual([...METRIC_IDS].sort());
    for (const id of METRIC_IDS) expect(METRIC_DEFINITIONS[id].id).toBe(id);
  });

  it("every definition has a label, a non-empty definition, dependencies and limitations", () => {
    for (const id of METRIC_IDS) {
      const d = METRIC_DEFINITIONS[id];
      expect(d.label.trim().length, id).toBeGreaterThan(0);
      expect(d.shortLabel.trim().length, id).toBeGreaterThan(0);
      expect(d.definition.trim().length, id).toBeGreaterThan(10);
      expect(d.internalUnit.length, id).toBeGreaterThan(0);
      expect(d.dependsOn.length, id).toBeGreaterThan(0);
      expect(d.limitations.length, id).toBeGreaterThan(0);
      for (const l of d.limitations) expect(l.trim().length, id).toBeGreaterThan(10);
    }
  });

  it("internal units are SI (never deg or rpm)", () => {
    for (const id of METRIC_IDS) {
      expect(["m", "s", "rad", "m/s", "rad/s", "1"], id).toContain(METRIC_DEFINITIONS[id].internalUnit);
    }
  });

  it("§5 flight-metric definitions match docs/coordinate-system.md verbatim", () => {
    const section = doc.slice(doc.indexOf("## 5."), doc.indexOf("## 6."));
    const rows = new Map<string, string>();
    for (const line of section.split("\n")) {
      const match = /^\| ([^|]+?) \| (.+) \|$/.exec(line);
      if (match === null || match[1] === "Metric" || match[1]?.startsWith("---")) continue;
      rows.set(match[1] as string, (match[2] as string).replaceAll("**", ""));
    }
    const docName: Record<string, MetricId> = {
      Carry: "carry",
      "Carry lateral (offline at carry)": "carryLateral",
      Total: "total",
      "Total lateral (offline at rest)": "totalLateral",
      "Apex height": "apexHeight",
      "Descent angle": "descentAngle",
      "Landing direction": "landingDirection",
      Curve: "curve",
      "Bounce distance": "bounceDistance",
      "Roll distance": "rollDistance",
    };
    expect([...rows.keys()].sort()).toEqual(Object.keys(docName).sort());
    for (const [name, text] of rows) {
      const id = docName[name] as MetricId;
      expect(METRIC_DEFINITIONS[id].definition.startsWith(text), `${id}: "${text}"`).toBe(true);
    }
    expect(METRIC_DEFINITIONS.carry.definition).toBe("Horizontal distance from launch to first ground contact.");
    expect(METRIC_DEFINITIONS.total.definition).toContain("more model-dependent than carry");
    expect(METRIC_DEFINITIONS.total.definition).toContain("ground conditions drive bounce and roll");
  });

  it("sign conventions follow the coordinate-system doc", () => {
    expect(METRIC_DEFINITIONS.horizontalLaunch.signConvention).toMatch(/positive = left/);
    expect(METRIC_DEFINITIONS.carryLateral.signConvention).toMatch(/positive = left/);
    expect(METRIC_DEFINITIONS.spinAxis.signConvention).toMatch(/curves right/);
    expect(METRIC_DEFINITIONS.sidespin.signConvention).toMatch(/curves right/);
    expect(METRIC_DEFINITIONS.carry.signConvention).toBeNull();
  });

  it("categories", () => {
    const byCategory = (c: string) => METRIC_IDS.filter((id) => METRIC_DEFINITIONS[id].category === c);
    expect(byCategory("launch")).toEqual(["ballSpeed", "verticalLaunch", "horizontalLaunch", "totalSpin", "spinAxis"]);
    expect(byCategory("display-derived")).toEqual(["backspin", "sidespin"]);
    expect(byCategory("calculated")).toHaveLength(14);
    expect(byCategory("club-delivery")).toHaveLength(10);
  });

  it("every stored metric has exactly one data source; display-derived metrics have none (never stored, §4.1)", () => {
    for (const id of METRIC_IDS) {
      const launch = LAUNCH_FIELD_FOR_METRIC[id] !== undefined;
      const shot = SHOT_METRICS_FIELD_FOR_METRIC[id] !== undefined;
      const category = METRIC_DEFINITIONS[id].category;
      if (category === "display-derived") {
        expect(launch || shot, id).toBe(false);
        continue;
      }
      expect(launch !== shot, id).toBe(true);
      expect(shot, id).toBe(category === "calculated");
    }
  });

  it("LaunchState fields exist and their stored unit matches the field-name suffix (deg/rpm contract exception)", () => {
    const launch = makeLaunch() as unknown as Record<string, unknown>;
    const suffixUnit: readonly (readonly [RegExp, string])[] = [
      [/DegPerSec$/, "deg/s"],
      [/Deg$/, "deg"],
      [/Rpm$/, "rpm"],
      [/Mps$/, "m/s"],
      [/M$/, "m"],
    ];
    for (const id of METRIC_IDS) {
      const f = LAUNCH_FIELD_FOR_METRIC[id];
      if (f === undefined) continue;
      expect(f.field in launch, `${id} -> ${f.field}`).toBe(true);
      const expectedUnit = suffixUnit.find(([re]) => re.test(f.field))?.[1] ?? "1";
      expect(f.unit, f.field).toBe(expectedUnit);
    }
    expect(LAUNCH_FIELD_FOR_METRIC.verticalLaunch).toEqual({ field: "verticalLaunchAngleDeg", unit: "deg" });
    expect(LAUNCH_FIELD_FOR_METRIC.totalSpin).toEqual({ field: "totalSpinRpm", unit: "rpm" });
  });

  it("ShotMetrics fields cover the contract exactly and are SI", () => {
    const fields = METRIC_IDS.flatMap((id) => {
      const f = SHOT_METRICS_FIELD_FOR_METRIC[id];
      return f === undefined ? [] : [f.field];
    });
    expect(fields.sort()).toEqual(Object.keys(ShotMetricsSchema.shape).sort());
    expect(SHOT_METRICS_FIELD_FOR_METRIC.descentAngle).toEqual({ field: "descentAngleRad", unit: "rad" });
    expect(SHOT_METRICS_FIELD_FOR_METRIC.spinAtLanding).toEqual({ field: "spinAtLandingRadPerSec", unit: "rad/s" });
  });

  it("is immutable", () => {
    expect(Object.isFrozen(METRIC_DEFINITIONS)).toBe(true);
    expect(Object.isFrozen(METRIC_DEFINITIONS.carry)).toBe(true);
    expect(Object.isFrozen(METRIC_DEFINITIONS.carry.limitations)).toBe(true);
    expect(Object.isFrozen(LAUNCH_FIELD_FOR_METRIC.ballSpeed)).toBe(true);
  });
});
