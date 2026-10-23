import type { ShotRecord } from "@glm/shared-types";
import { IMPERIAL_GOLF_UNITS, METRIC_UNITS } from "@glm/units";
import { beforeAll, describe, expect, it } from "vitest";
import {
  BEHIND_TEE_TOLERANCE_M,
  buildAxis,
  lateralLabel,
  linearScale,
  MIN_LATERAL_HALF_WIDTH_M,
  niceStep,
  pathData,
  tracerAxes,
  tracerBounds,
  tracerSegments,
} from "../src/charts/tracer";
import { syntheticRecord } from "./helpers";

describe("axis helpers", () => {
  it("niceStep picks 1/2/5 x 10^k with at most maxTicks intervals", () => {
    expect(niceStep(100, 5)).toBe(20);
    expect(niceStep(230, 8)).toBe(50);
    expect(niceStep(7, 4)).toBe(2);
    expect(niceStep(0.9, 4)).toBe(0.5);
    expect(niceStep(0, 4)).toBe(1);
  });

  it("buildAxis widens to whole ticks in display units and keeps metres internally", () => {
    const axis = buildAxis(0, 150, "yd", 6); // 150 m = 164.04 yd
    expect(axis.unit).toBe("yd");
    expect(axis.ticks[0]!.label).toBe("0");
    expect(axis.ticks.at(-1)!.label).toBe("200");
    expect(axis.ticks.map((t) => t.label)).toEqual(["0", "50", "100", "150", "200"]);
    expect(axis.maxM).toBeCloseTo(200 * 0.9144, 9);
    expect(axis.ticks[1]!.valueM).toBeCloseTo(50 * 0.9144, 9);
  });

  it("lateral labels use L / R, never a bare signed number (+Y is left)", () => {
    expect(lateralLabel(10, 0)).toBe("10 L");
    expect(lateralLabel(-10, 0)).toBe("10 R");
    expect(lateralLabel(0, 0)).toBe("0");
    const axis = buildAxis(-12, 12, "yd", 4, lateralLabel);
    expect(axis.ticks.map((t) => t.label)).toEqual(["20 R", "10 R", "0", "10 L", "20 L"]);
  });

  it("linearScale maps and can invert direction (SVG y grows downward)", () => {
    const up = linearScale(0, 10, 200, 0);
    expect(up(0)).toBe(200);
    expect(up(10)).toBe(0);
    expect(up(5)).toBe(100);
    expect(linearScale(3, 3, 0, 100)(3)).toBe(50);
    expect(pathData([{ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 2 }], (p) => p.x * 10, (p) => p.z * 10)).toBe("M0.0,0.0 L10.0,20.0");
  });
});

describe("tracer bounds near the tee", () => {
  const seg = (x0: number) => {
    const p = (x: number, y: number, z: number) => ({ x, y, z });
    const landing = p(150, -3, 0);
    return { carry: [p(x0, 0, 0), p(75, -1, 30), landing], bounces: [], rolls: [], landing, rest: p(160, -4, 0) };
  };

  it("a fitted launch point a hair behind the tee does not push the axis to -50 yd", () => {
    const bounds = tracerBounds(seg(-0.0003), null, null);
    expect(bounds.xMinM).toBe(0);
    expect(tracerAxes(bounds, IMPERIAL_GOLF_UNITS).x.ticks[0]!.label).toBe("0");
  });

  it("a ball that really starts or runs backwards still gets a negative axis", () => {
    expect(BEHIND_TEE_TOLERANCE_M).toBe(1);
    const bounds = tracerBounds(seg(-5), null, null);
    expect(bounds.xMinM).toBe(-5);
    expect(Number(tracerAxes(bounds, IMPERIAL_GOLF_UNITS).x.ticks[0]!.label)).toBeLessThan(0);
  });
});

describe("tracer geometry from a real simulated shot", () => {
  let fade: ShotRecord;
  beforeAll(async () => {
    fade = await syntheticRecord("fade-driver", "clean", 21, { monteCarloSamples: 12 });
  });

  it("splits air / bounce / roll and ends at the rest position", () => {
    const result = fade.result!;
    const seg = tracerSegments(result);
    expect(seg.carry[0]!.x).toBeCloseTo(result.airFlight.samples[0]!.positionM.x, 9);
    expect(seg.carry.at(-1)).toEqual(seg.landing);
    expect(seg.landing).toEqual(result.landing.positionM);
    expect(seg.rest).toEqual(result.finalPositionM);
    expect(Math.max(...seg.carry.map((p) => p.z))).toBeGreaterThan(5);
    // Structure only (the ground model is under revision): ground segments start at the landing
    // point and the last one ends exactly at rest.
    const ground = [...seg.bounces, ...seg.rolls];
    if (result.groundMotion.samples.some((s) => s.phase !== "air")) {
      expect(ground.length).toBeGreaterThan(0);
      expect(ground.some((g) => g[0]!.x === seg.landing.x && g[0]!.y === seg.landing.y)).toBe(true);
      const lastRun = [...seg.bounces, ...seg.rolls].find((g) => g.at(-1)!.x === seg.rest.x && g.at(-1)!.y === seg.rest.y);
      expect(lastRun).toBeDefined();
    }
  });

  it("bounds cover the trajectory and the Monte Carlo band; axes are labelled in the chosen units", () => {
    const result = fade.result!;
    const seg = tracerSegments(result);
    const carry = result.metrics.carryM.interval ?? null;
    const lateral = result.metrics.carryLateralM.interval ?? null;
    const bounds = tracerBounds(seg, carry, lateral);
    expect(bounds.xMaxM).toBeGreaterThan(result.finalPositionM.x);
    if (carry) expect(bounds.xMaxM).toBeGreaterThanOrEqual(carry.p95);
    expect(bounds.yHalfM).toBeGreaterThanOrEqual(MIN_LATERAL_HALF_WIDTH_M);
    const imperial = tracerAxes(bounds, IMPERIAL_GOLF_UNITS);
    expect(imperial.x.unit).toBe("yd");
    expect(imperial.z.unit).toBe("ft");
    expect(imperial.y.ticks.some((t) => t.label.endsWith(" L"))).toBe(true);
    expect(imperial.y.ticks.some((t) => t.label.endsWith(" R"))).toBe(true);
    const metric = tracerAxes(bounds, METRIC_UNITS);
    expect(metric.x.unit).toBe("m");
    expect(metric.z.unit).toBe("m");
  });

  it("a right-handed fade curves right: rest is right of where the start line would carry it", () => {
    // Positive spin-axis tilt = curves right; curve is +left, so it is negative.
    expect(fade.launch.spinAxisTiltDeg.value!).toBeGreaterThan(0);
    expect(fade.result!.metrics.curveM.value!).toBeLessThan(0);
  });
});
