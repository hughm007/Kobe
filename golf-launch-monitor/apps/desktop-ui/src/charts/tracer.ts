/**
 * Pure geometry for the 2D shot tracer (side view x–z, top view x–y). World frame per
 * docs/coordinate-system.md: +X downrange, +Y LEFT, +Z up. In the top view the golfer faces
 * +X (to the right of the screen), so their left (+Y) is drawn UP.
 * Axes are labelled in display units; positions stay SI until mapped to pixels.
 */
import type { ShotResult, TrajectorySample, UncertaintyInterval } from "@glm/shared-types";
import { convert, type UnitSystem } from "@glm/units";

export type PathPoint = { readonly x: number; readonly y: number; readonly z: number };

export type TracerSegments = {
  /** Air flight from launch to first ground contact. */
  readonly carry: readonly PathPoint[];
  /** Airborne hops after first contact. */
  readonly bounces: readonly (readonly PathPoint[])[];
  /** Rolling runs. */
  readonly rolls: readonly (readonly PathPoint[])[];
  readonly landing: PathPoint;
  readonly rest: PathPoint;
};

const point = (p: { readonly x: number; readonly y: number; readonly z: number }): PathPoint => ({ x: p.x, y: p.y, z: p.z });

/** Splits the trajectory by phase; each segment starts where the previous one ended. */
export function tracerSegments(result: ShotResult): TracerSegments {
  const landing = point(result.landing.positionM);
  const rest = point(result.finalPositionM);
  const carry = [...result.airFlight.samples.map((s) => point(s.positionM)), landing];
  const bounces: PathPoint[][] = [];
  const rolls: PathPoint[][] = [];
  let previous: PathPoint = landing;
  let run: { phase: TrajectorySample["phase"]; points: PathPoint[] } | null = null;
  const close = () => {
    if (run === null || run.points.length < 2) return;
    (run.phase === "roll" ? rolls : bounces).push(run.points);
  };
  for (const sample of result.groundMotion.samples) {
    if (sample.phase === "air") continue;
    const p = point(sample.positionM);
    if (run === null || run.phase !== sample.phase) {
      close();
      run = { phase: sample.phase, points: [previous] };
    }
    run.points.push(p);
    previous = p;
  }
  if (run !== null && (previous.x !== rest.x || previous.y !== rest.y)) run.points.push(rest);
  close();
  return { carry, bounces, rolls, landing, rest };
}

export type DisplayLengthUnit = "yd" | "ft" | "m";

export type AxisTick = { readonly valueM: number; readonly label: string };

export type Axis = {
  readonly minM: number;
  readonly maxM: number;
  readonly unit: DisplayLengthUnit;
  readonly ticks: readonly AxisTick[];
};

/** Smallest 1/2/5 x 10^k step that divides `span` into at most `maxTicks` intervals. */
export function niceStep(span: number, maxTicks = 6): number {
  if (!(span > 0) || !Number.isFinite(span)) return 1;
  const raw = span / Math.max(1, maxTicks);
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  for (const m of [1, 2, 5, 10]) {
    if (m * magnitude >= raw * (1 - 1e-12)) return m * magnitude;
  }
  return 10 * magnitude;
}

function decimalsFor(step: number): number {
  return step >= 1 ? 0 : Math.min(6, Math.ceil(-Math.log10(step) - 1e-9));
}

export type TickLabeller = (valueDisplay: number, decimals: number) => string;

const plainLabel: TickLabeller = (v, d) => (Math.abs(v) < 10 ** -(d + 1) ? 0 : v).toFixed(d);

/** Lateral labels follow the golfer convention: magnitude with L / R, centre "0". */
export const lateralLabel: TickLabeller = (v, d) => {
  const text = Math.abs(v).toFixed(d);
  if (Number(text) === 0) return "0";
  return v > 0 ? `${text} L` : `${text} R`;
};

/** Axis covering [minM, maxM] with nice ticks in `unit`; the range is widened to whole ticks. */
export function buildAxis(
  minM: number,
  maxM: number,
  unit: DisplayLengthUnit,
  maxTicks = 6,
  label: TickLabeller = plainLabel,
): Axis {
  const lo = convert(Math.min(minM, maxM), "m", unit);
  const hi = convert(Math.max(minM, maxM), "m", unit);
  const step = niceStep(hi - lo || 1, maxTicks);
  const first = Math.floor(lo / step + 1e-9) * step;
  const last = Math.ceil(hi / step - 1e-9) * step;
  const decimals = decimalsFor(step);
  const ticks: AxisTick[] = [];
  const count = Math.round((last - first) / step);
  for (let i = 0; i <= count; i++) {
    const v = first + i * step;
    ticks.push({ valueM: convert(v, unit, "m"), label: label(v, decimals) });
  }
  return { minM: convert(first, unit, "m"), maxM: convert(last, unit, "m"), unit, ticks };
}

export type Scale = (valueM: number) => number;

/** Maps [d0, d1] onto [r0, r1]; a degenerate domain maps to the middle of the range. */
export function linearScale(d0: number, d1: number, r0: number, r1: number): Scale {
  if (d1 === d0) return () => (r0 + r1) / 2;
  const k = (r1 - r0) / (d1 - d0);
  return (v) => r0 + (v - d0) * k;
}

export function pathData(points: readonly PathPoint[], sx: (p: PathPoint) => number, sy: (p: PathPoint) => number): string {
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${sx(p).toFixed(1)},${sy(p).toFixed(1)}`).join(" ");
}

export type TracerBounds = {
  readonly xMinM: number;
  readonly xMaxM: number;
  readonly zMaxM: number;
  /** Half-width of the top view, m (symmetric about the target line). */
  readonly yHalfM: number;
};

/** Minimum half-width of the top view so a straight shot is not drawn on a hair-thin strip. */
export const MIN_LATERAL_HALF_WIDTH_M = 10;
export const MIN_HEIGHT_M = 5;
/**
 * Points less than this far behind the tee (m) do not extend the axis below 0: the fitted launch
 * point is often a fraction of a millimetre negative, which would otherwise floor the axis to a
 * whole tick (-50 yd) and waste part of both views. A shot that really travels backwards still
 * gets a negative axis.
 */
export const BEHIND_TEE_TOLERANCE_M = 1;

export function tracerBounds(
  segments: TracerSegments,
  carryInterval: UncertaintyInterval | null,
  lateralInterval: UncertaintyInterval | null,
): TracerBounds {
  const all = [...segments.carry, ...segments.bounces.flat(), ...segments.rolls.flat(), segments.rest];
  let xMin = 0;
  let xMax = 1;
  let zMax = MIN_HEIGHT_M;
  let yAbs = MIN_LATERAL_HALF_WIDTH_M;
  for (const p of all) {
    xMin = Math.min(xMin, p.x);
    xMax = Math.max(xMax, p.x);
    zMax = Math.max(zMax, p.z);
    yAbs = Math.max(yAbs, Math.abs(p.y));
  }
  if (xMin > -BEHIND_TEE_TOLERANCE_M) xMin = 0;
  if (carryInterval !== null) xMax = Math.max(xMax, carryInterval.p95);
  if (lateralInterval !== null) yAbs = Math.max(yAbs, Math.abs(lateralInterval.p05), Math.abs(lateralInterval.p95));
  return { xMinM: xMin, xMaxM: xMax * 1.04, zMaxM: zMax * 1.1, yHalfM: yAbs * 1.15 };
}

export type TracerAxes = {
  readonly x: Axis;
  readonly z: Axis;
  readonly y: Axis;
};

export function tracerAxes(bounds: TracerBounds, system: UnitSystem): TracerAxes {
  const heightUnit: DisplayLengthUnit = system.height;
  return {
    x: buildAxis(bounds.xMinM, bounds.xMaxM, system.distance, 8),
    z: buildAxis(0, bounds.zMaxM, heightUnit, 4),
    y: buildAxis(-bounds.yHalfM, bounds.yHalfM, system.distance, 4, lateralLabel),
  };
}
