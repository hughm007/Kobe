import { type DisplayValue, type MetricId, presentLaunchState, presentShotMetrics } from "@glm/presentation";
import type { Club, Player, ShotRecord } from "@glm/shared-types";
import type { Precision, UnitSystem } from "@glm/units";
import {
  type CardMetric,
  clubText,
  FLIGHT_CARD_METRICS,
  LAUNCH_CARD_METRICS,
  overallConfidenceText,
  playerText,
  shotShapeText,
  shotTimeText,
  spinSource,
} from "../display/shot-display";
import { MetricTile } from "./MetricTile";
import { OriginBanner } from "./OriginBanner";
import { ValidityBannerView } from "./ValidityBannerView";

export type ShotCardProps = {
  readonly record: ShotRecord;
  /** From presentShot(record, units, precision). */
  readonly display: ShotDisplay;
  readonly players: readonly Player[];
  readonly bag: readonly Club[];
  readonly selectedMetric: MetricId | null;
  readonly onSelectMetric: (metricId: MetricId) => void;
  readonly shotNumber?: number;
  readonly attributionNote?: string;
};

export type ShotDisplay = {
  readonly launch: Partial<Record<MetricId, DisplayValue>>;
  /** null when the shot was not simulated (invalid launch, missing spin, ...). */
  readonly flight: Partial<Record<MetricId, DisplayValue>> | null;
};

/**
 * All provenance-preserving formatting is delegated to @glm/presentation. An invalid shot never
 * shows flight numbers, even if a result object were present.
 */
export function presentShot(record: ShotRecord, unitSystem: UnitSystem, precision: Precision): ShotDisplay {
  const simulated = record.result !== null && record.launch.validity !== "invalid";
  return {
    launch: presentLaunchState(record.launch, unitSystem, precision),
    flight: simulated ? presentShotMetrics(record.result!.metrics, unitSystem, precision, record.dataOrigin) : null,
  };
}

/** Why a shot has no flight numbers (the pipeline's reason, verbatim when it gave one). */
export function noFlightReason(record: ShotRecord): string {
  if (record.simulationSkippedReason !== null) return record.simulationSkippedReason;
  if (record.launch.validity === "invalid") return `Invalid shot: ${record.launch.rejectionReasons.join("; ") || "rejected"}`;
  return "The shot was not simulated.";
}

function Tiles({
  metrics,
  values,
  selected,
  onSelect,
  hero,
}: {
  readonly metrics: readonly CardMetric[];
  readonly values: Partial<Record<MetricId, DisplayValue>>;
  readonly selected: MetricId | null;
  readonly onSelect: (id: MetricId) => void;
  readonly hero: boolean;
}) {
  return (
    <>
      {metrics
        .filter((m) => m.hero === hero)
        .map((m) => {
          const value = values[m.id];
          if (value === undefined) return null;
          return <MetricTile key={m.id} value={value} label={m.label} hero={hero} selected={selected === m.id} onSelect={onSelect} />;
        })}
    </>
  );
}

export function ShotCard({ record, display, players, bag, selectedMetric, onSelectMetric, shotNumber, attributionNote }: ShotCardProps) {
  const { launch } = record;
  const spin = spinSource(record, display.launch.totalSpin);
  return (
    <article className="shot-card" aria-label={`Shot ${shotNumber ?? ""}`.trim()}>
      <OriginBanner origin={record.dataOrigin} compact />
      <header className="shot-card-header">
        <div className="shot-meta">
          {shotNumber !== undefined && <span className="shot-number">Shot {shotNumber}</span>}
          <span>{shotTimeText(record)}</span>
          <span>{clubText(record, bag)}</span>
          <span>{playerText(record, players)}</span>
          {attributionNote !== undefined && <span className="attribution-note">({attributionNote})</span>}
          <span className="shot-shape">{shotShapeText(record)}</span>
        </div>
        <div className="shot-status">
          <span className={`pill pill-${launch.validity}`}>Validity: {launch.validity}</span>
          <span
            className="pill pill-confidence"
            title="Confidence in the launch data of this shot (ball speed, launch angles, spin) from the fit, sensor, calibration and spin quality."
          >
            Launch data: {overallConfidenceText(launch.overallConfidence)}
          </span>
          {record.result !== null && (
            <span
              className="pill pill-confidence"
              title="Confidence in the calculated flight and roll (carry, total, apex...). Capped by the provisional ball-aerodynamics and ground models and by the spin that drove them; not validated against real shots."
            >
              Flight model: {overallConfidenceText(record.result.simulationConfidence)}
            </span>
          )}
          <span className="pill pill-spin" title={spin.detail}>
            {spin.label}
          </span>
        </div>
      </header>

      <ValidityBannerView launch={launch} />

      <div className="tiles tiles-hero">
        {display.flight !== null && (
          <Tiles metrics={FLIGHT_CARD_METRICS} values={display.flight} selected={selectedMetric} onSelect={onSelectMetric} hero />
        )}
        <Tiles metrics={LAUNCH_CARD_METRICS} values={display.launch} selected={selectedMetric} onSelect={onSelectMetric} hero />
      </div>

      {display.flight === null && (
        <div className="skipped" role="status">
          <h3>No carry, total or flight numbers for this shot</h3>
          <p className="skipped-reason">{noFlightReason(record)}</p>
        </div>
      )}

      <div className="tiles">
        <Tiles metrics={LAUNCH_CARD_METRICS} values={display.launch} selected={selectedMetric} onSelect={onSelectMetric} hero={false} />
        {display.flight !== null && (
          <Tiles metrics={FLIGHT_CARD_METRICS} values={display.flight} selected={selectedMetric} onSelect={onSelectMetric} hero={false} />
        )}
      </div>

      {display.flight !== null && record.result !== null && record.result.warnings.length > 0 && (
        <section className="sim-notes" aria-label="Simulation notes">
          <h3>Simulation notes</h3>
          <ul>
            {record.result.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
