import type { ShotRecord, UncertaintyInterval } from "@glm/shared-types";
import type { UnitSystem } from "@glm/units";
import {
  type Axis,
  linearScale,
  pathData,
  type PathPoint,
  type Scale,
  tracerAxes,
  tracerBounds,
  tracerSegments,
  type TracerSegments,
} from "../charts/tracer";
import { noFlightReason } from "./ShotCard";

const W = 960;
const M = { left: 80, right: 24, top: 18, bottom: 52 };
const SIDE_H = 250;
const TOP_H = 230;

/** Only SI-metre intervals are drawn; anything else is ignored rather than guessed. */
function metreInterval(interval: UncertaintyInterval | undefined): UncertaintyInterval | null {
  return interval !== undefined && interval.unit === "m" ? interval : null;
}

type GridProps = {
  readonly xAxis: Axis;
  readonly yAxis: Axis;
  readonly sx: Scale;
  readonly sy: Scale;
  readonly height: number;
  readonly xTitle: string;
  readonly yTitle: string;
};

function Grid({ xAxis, yAxis, sx, sy, height, xTitle, yTitle }: GridProps) {
  const midY = (M.top + height - M.bottom) / 2;
  return (
    <g className="grid">
      {xAxis.ticks.map((t) => (
        <g key={`x${t.label}`}>
          <line x1={sx(t.valueM)} x2={sx(t.valueM)} y1={M.top} y2={height - M.bottom} className="grid-line" />
          <text x={sx(t.valueM)} y={height - M.bottom + 21} className="tick" textAnchor="middle">
            {t.label}
          </text>
        </g>
      ))}
      {yAxis.ticks.map((t) => (
        <g key={`y${t.label}`}>
          <line x1={M.left} x2={W - M.right} y1={sy(t.valueM)} y2={sy(t.valueM)} className="grid-line" />
          <text x={M.left - 8} y={sy(t.valueM) + 5} className="tick" textAnchor="end">
            {t.label}
          </text>
        </g>
      ))}
      <text x={(M.left + W - M.right) / 2} y={height - 6} className="axis-title" textAnchor="middle">
        {xTitle}
      </text>
      <text x={14} y={midY} className="axis-title" textAnchor="middle" transform={`rotate(-90 14 ${midY})`}>
        {yTitle}
      </text>
    </g>
  );
}

type PathsProps = {
  readonly segments: TracerSegments;
  readonly px: (p: PathPoint) => number;
  readonly py: (p: PathPoint) => number;
};

function Paths({ segments, px, py }: PathsProps) {
  return (
    <g>
      <path d={pathData(segments.carry, px, py)} className="trace trace-carry" />
      {segments.bounces.map((b, i) => (
        <path key={`b${i}`} d={pathData(b, px, py)} className="trace trace-bounce" />
      ))}
      {segments.rolls.map((r, i) => (
        <path key={`r${i}`} d={pathData(r, px, py)} className="trace trace-roll" />
      ))}
      <circle cx={px(segments.landing)} cy={py(segments.landing)} r={7} className="marker marker-landing" />
      <rect x={px(segments.rest) - 6} y={py(segments.rest) - 6} width={12} height={12} className="marker marker-rest" />
    </g>
  );
}

/** Two orthographic views of the simulated trajectory. No 3D engine in Phase 1. */
export function ShotTracer({ record, unitSystem }: { readonly record: ShotRecord; readonly unitSystem: UnitSystem }) {
  const result = record.launch.validity === "invalid" ? null : record.result;
  if (result === null) {
    return (
      <section className="tracer tracer-empty" aria-label="Shot tracer">
        <p>No trajectory to draw: {noFlightReason(record)}</p>
      </section>
    );
  }
  const segments = tracerSegments(result);
  const carryInterval = metreInterval(result.metrics.carryM.interval);
  const lateralInterval = metreInterval(result.metrics.carryLateralM.interval);
  const bounds = tracerBounds(segments, carryInterval, lateralInterval);
  const axes = tracerAxes(bounds, unitSystem);
  const sx = linearScale(axes.x.minM, axes.x.maxM, M.left, W - M.right);
  const sz = linearScale(axes.z.minM, axes.z.maxM, SIDE_H - M.bottom, M.top);
  // +Y (golfer's left) is drawn UP in the top view.
  const sy = linearScale(axes.y.minM, axes.y.maxM, TOP_H - M.bottom, M.top);
  const d = unitSystem.distance;
  const h = unitSystem.height;

  let band = null;
  if (carryInterval !== null) {
    const yLo = lateralInterval?.p05 ?? segments.landing.y - 0.5;
    const yHi = lateralInterval?.p95 ?? segments.landing.y + 0.5;
    const x0 = sx(carryInterval.p05);
    const x1 = sx(carryInterval.p95);
    const top = sy(yHi);
    const bottom = sy(yLo);
    // Label inside the plot: right-aligned to the band's right edge when that is in the right
    // half (driver shots), else left-aligned after it; below the band when there is no room
    // above it (the view title sits in the top-right corner).
    const anchorEnd = x1 > (M.left + W - M.right) / 2;
    const labelX = anchorEnd ? Math.min(x1, W - M.right - 4) : x1 + 6;
    const labelY = top - 6 > M.top + 30 ? top - 6 : Math.min(bottom + 16, TOP_H - M.bottom - 4);
    band = (
      <g>
        <rect x={x0} y={top} width={Math.max(2, x1 - x0)} height={Math.max(2, bottom - top)} className="mc-band" />
        <text x={labelX} y={labelY} className="band-label" textAnchor={anchorEnd ? "end" : "start"}>
          Carry p05–p95 (Monte Carlo n={carryInterval.sampleCount})
        </text>
      </g>
    );
  }

  return (
    <figure className="tracer" aria-label="Shot tracer: side and top views">
      <svg viewBox={`0 0 ${W} ${SIDE_H}`} role="img" aria-label="Side view: height against downrange distance">
        <Grid xAxis={axes.x} yAxis={axes.z} sx={sx} sy={sz} height={SIDE_H} xTitle={`Downrange (${d})`} yTitle={`Height (${h})`} />
        <line x1={M.left} x2={W - M.right} y1={sz(0)} y2={sz(0)} className="ground-line" />
        <Paths segments={segments} px={(p) => sx(p.x)} py={(p) => sz(Math.max(0, p.z))} />
        <text x={W - M.right} y={M.top + 12} className="view-title" textAnchor="end">
          SIDE VIEW
        </text>
      </svg>
      <svg viewBox={`0 0 ${W} ${TOP_H}`} role="img" aria-label="Top view: left and right of the target line against downrange distance">
        <Grid xAxis={axes.x} yAxis={axes.y} sx={sx} sy={sy} height={TOP_H} xTitle={`Downrange (${d})`} yTitle={`Left / right (${d})`} />
        {band}
        <line x1={sx(0)} x2={W - M.right} y1={sy(0)} y2={sy(0)} className="target-line" />
        <Paths segments={segments} px={(p) => sx(p.x)} py={(p) => sy(p.y)} />
        <text x={W - M.right} y={M.top + 12} className="view-title" textAnchor="end">
          TOP VIEW · target line dashed
        </text>
      </svg>
      <figcaption className="tracer-legend">
        <span className="legend legend-carry">Carry (air)</span>
        <span className="legend legend-bounce">Bounce</span>
        <span className="legend legend-roll">Roll</span>
        <span className="legend legend-landing">Landing</span>
        <span className="legend legend-rest">Rest</span>
        {carryInterval !== null && <span className="legend legend-band">Carry 90% band</span>}
        <span className="legend-note">Simulated by the flight and ground models (CALCULATED), not observed.</span>
      </figcaption>
    </figure>
  );
}
