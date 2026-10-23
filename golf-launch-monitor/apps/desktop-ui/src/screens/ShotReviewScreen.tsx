import { type DisplayValue, METRIC_DEFINITIONS, type MetricId } from "@glm/presentation";
import type { Measurement, ShotRecord, Vec3 } from "@glm/shared-types";
import type { Precision, UnitSystem } from "@glm/units";
import { useState } from "react";
import { BadgeRow } from "../components/Badge";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { OriginBanner } from "../components/OriginBanner";
import { noFlightReason, presentShot } from "../components/ShotCard";
import { ValidityBannerView } from "../components/ValidityBannerView";
import { ValueText } from "../components/ValueText";
import { CARD_LABELS, overallConfidenceText, shotShapeText, spinSource } from "../display/shot-display";
import { useApp } from "../state/AppContext";
import { currentShot } from "../state/reducer";

function DisplayTable({ caption, values }: { readonly caption: string; readonly values: Partial<Record<MetricId, DisplayValue>> }) {
  const rows = Object.values(values).filter((v): v is DisplayValue => v !== undefined);
  return (
    <div className="table-scroll">
      <table className="table table-dense">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Metric</th>
            <th scope="col">Value</th>
            <th scope="col">Provenance</th>
            <th scope="col">Status</th>
            <th scope="col">Confidence / uncertainty</th>
            <th scope="col">Source detail &amp; flags</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((v) => (
            <tr key={v.metricId}>
              <th scope="row">
                {CARD_LABELS[v.metricId] ?? v.label}
                <span className="muted small"> {METRIC_DEFINITIONS[v.metricId].category}</span>
              </th>
              <td className="num value-cell">
                <ValueText text={v.text} />
                {v.rangeText !== null && (
                  <div className="muted small">
                    90% range <ValueText text={v.rangeText} />
                  </div>
                )}
              </td>
              <td>
                <BadgeRow value={v} />
              </td>
              <td>{v.tooltip.status}</td>
              <td>{v.tooltip.confidence}</td>
              <td>
                <code className="wrap small">{v.sourceDetail}</code>
                {v.qualityFlags.length > 0 && (
                  <ul className="small">
                    {v.qualityFlags.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const vecText = (v: Vec3, dp: number): string => `(${v.x.toFixed(dp)}, ${v.y.toFixed(dp)}, ${v.z.toFixed(dp)})`;

function sigmaText(m: Measurement<Vec3>): string {
  const u = m.uncertainty;
  if (u === undefined) return "none stated";
  if (u.covariance !== undefined) {
    const d = u.covariance.map((row, i) => Math.sqrt(Math.max(0, row[i] ?? 0)));
    return `σ per axis (${d.map((x) => x.toPrecision(3)).join(", ")}) ${u.unit.replace(/\^2$/, "")}`;
  }
  if (u.sigma !== undefined) return `σ ${u.sigma.toPrecision(3)} ${u.unit}`;
  return "interval only";
}

function VectorTable({ record }: { readonly record: ShotRecord }) {
  const l = record.launch;
  const rows: readonly [string, Measurement<Vec3>, number][] = [
    ["Ball position at launch (m)", l.ballPositionM, 4],
    ["Launch velocity (m/s)", l.velocityMps, 3],
    ["Angular velocity / spin vector (rad/s)", l.angularVelocityRadPerSec, 2],
  ];
  return (
    <div className="table-scroll">
      <table className="table table-dense">
        <caption>Authoritative SI launch vectors (world frame: +X downrange, +Y left, +Z up)</caption>
        <thead>
          <tr>
            <th scope="col">Quantity</th>
            <th scope="col">Value (x, y, z)</th>
            <th scope="col">Source</th>
            <th scope="col">Confidence</th>
            <th scope="col">Uncertainty</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, m, dp]) => (
            <tr key={name}>
              <th scope="row">{name}</th>
              <td className="num">{m.value === null ? "—" : vecText(m.value, dp)}</td>
              <td>
                <code>{m.source}</code>
              </td>
              <td className="num">{m.confidence.toFixed(2)}</td>
              <td>{sigmaText(m)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FitDiagnostics({ record }: { readonly record: ShotRecord }) {
  const f = record.launch.fitDiagnostics;
  if (f === null) return <p className="muted">No launch fit diagnostics (the fit did not run or failed).</p>;
  return (
    <dl className="kv">
      <dt>Model</dt>
      <dd>{f.model}</dd>
      <dt>Observations</dt>
      <dd>{f.observationCount}</dd>
      <dt>Inliers</dt>
      <dd>{f.inlierCount}</dd>
      <dt>RMS residual</dt>
      <dd>{(f.rmsResidualM * 1000).toFixed(2)} mm</dd>
      <dt>Max residual</dt>
      <dd>{(f.maxResidualM * 1000).toFixed(2)} mm</dd>
      <dt>Time span</dt>
      <dd>{(f.timeSpanS * 1000).toFixed(1)} ms</dd>
      <dt>Iterations</dt>
      <dd>
        {f.iterations} ({f.converged ? "converged" : "did not converge"})
      </dd>
    </dl>
  );
}

/** How a non-live stream is described when the estimator's verbatim text says "measured". */
const ORIGIN_WORD: Readonly<Record<ShotRecord["dataOrigin"], string | null>> = Object.freeze({
  live: null,
  replay: "replayed",
  synthetic: "synthetic",
  manual: "manually entered",
});

/**
 * Factor details are the estimator's verbatim text (@glm/launch-state). Its "Spin measured (...)"
 * means "taken from the stream's own spin observation"; on a non-live stream that is annotated
 * right next to it so the review never presents such a value as a measurement.
 */
function FactorDetail({ detail, origin }: { readonly detail: string; readonly origin: ShotRecord["dataOrigin"] }) {
  const word = ORIGIN_WORD[origin];
  const needsNote = word !== null && /\bmeasured\b/i.test(detail);
  return (
    <>
      <span className="factor-detail">{detail}</span>
      {needsNote && (
        <span className="factor-note">
          {" "}
          (estimator wording: on this {word} shot it means the data stream&apos;s own spin observation was used; not measured by a sensor)
        </span>
      )}
    </>
  );
}

function ConfidenceFactors({ record }: { readonly record: ShotRecord }) {
  return (
    <div className="table-scroll">
      <table className="table table-dense">
        <caption>
          Confidence factors — overall {overallConfidenceText(record.launch.overallConfidence)}
        </caption>
        <thead>
          <tr>
            <th scope="col">Id</th>
            <th scope="col">Factor</th>
            <th scope="col">Score</th>
            <th scope="col">Weight</th>
            <th scope="col">Blocking</th>
            <th scope="col">Detail</th>
          </tr>
        </thead>
        <tbody>
          {record.launch.confidenceFactors.map((f) => (
            <tr key={f.id} className={f.blocking ? "row-blocking" : undefined}>
              <td>
                <code>{f.id}</code>
              </td>
              <td>{f.label}</td>
              <td className="num">{f.score.toFixed(2)}</td>
              <td className="num">{f.weight.toFixed(2)}</td>
              <td>{f.blocking ? "YES" : "no"}</td>
              <td>
              <FactorDetail detail={f.detail} origin={record.dataOrigin} />
            </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Versions({ record }: { readonly record: ShotRecord }) {
  const l = record.launch;
  const rows: readonly [string, string][] = [
    ["Coordinate system", l.coordinateSystemVersion],
    ["Calibration", l.calibrationVersion],
    ["Sensor configuration", `${l.sensorConfigurationVersion} (${record.sensorConfiguration.kind}: ${record.sensorConfiguration.description})`],
    ["Ball profile", l.ballProfileVersion],
    ["Physics model", l.physicsModelVersion],
    ["Estimator", l.estimatorVersion],
    ["Software", record.softwareVersion],
    ["Record schema", record.schemaVersion],
  ];
  return (
    <dl className="kv">
      {rows.map(([k, v]) => (
        <div key={k} className="kv-row">
          <dt>{k}</dt>
          <dd>
            <code className="wrap">{v}</code>
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ReviewBody({ record, unitSystem, precision }: { readonly record: ShotRecord; readonly unitSystem: UnitSystem; readonly precision: Precision }) {
  const display = presentShot(record, unitSystem, precision);
  const spin = spinSource(record, display.launch.totalSpin);
  const physics = record.result?.physics ?? null;
  return (
    <>
      <OriginBanner origin={record.dataOrigin} compact />
      <ValidityBannerView launch={record.launch} />
      <section className="card">
        <h2>Launch values and their provenance</h2>
        <p className="muted">
          Spin: <strong data-testid="review-spin-source">{spin.badge ?? "—"}</strong> ({spin.detail}) · {shotShapeText(record)} · launch
          reference time{" "}
          {record.launch.launchTimeS === null ? "—" : `${record.launch.launchTimeS.toFixed(4)} s (session clock)`}
        </p>
        <DisplayTable caption="Every LaunchState metric (club-delivery fields are unavailable without a club sensor)" values={display.launch} />
        <VectorTable record={record} />
      </section>
      <section className="card">
        <h2>Flight and ground results</h2>
        {display.flight === null ? (
          <p className="skipped-reason">No flight results: {noFlightReason(record)}</p>
        ) : (
          <DisplayTable caption="Calculated by the flight and ground models" values={display.flight} />
        )}
        {physics !== null && (
          <dl className="kv">
            <dt>Ball profile</dt>
            <dd>
              {physics.ballProfileId}@{physics.ballProfileVersion}
            </dd>
            <dt>Ground model</dt>
            <dd>{physics.groundModelVersion}</dd>
            <dt>Terrain</dt>
            <dd>
              {physics.terrainId}@{physics.terrainVersion}
            </dd>
            <dt>Air density</dt>
            <dd>{physics.environment.airDensityKgM3.toFixed(4)} kg/m³ (derived)</dd>
            <dt>Monte Carlo</dt>
            <dd>
              {physics.settings.monteCarloSamples} samples, seed {physics.settings.monteCarloSeed}
            </dd>
            <dt>Final lie</dt>
            <dd>{record.result?.finalLie}</dd>
          </dl>
        )}
      </section>
      <section className="card">
        <h2>Launch fit diagnostics</h2>
        <FitDiagnostics record={record} />
      </section>
      <section className="card">
        <ConfidenceFactors record={record} />
      </section>
      <section className="card">
        <h2>Versions</h2>
        <Versions record={record} />
      </section>
      <section className="card">
        <h2>Evidence and scoring</h2>
        <dl className="kv">
          <dt>Data origin</dt>
          <dd>{record.dataOrigin}</dd>
          <dt>Raw observations</dt>
          <dd data-testid="raw-observations">
            {record.rawObservations === null
              ? "not retained (diagnostic consent is off)"
              : `${record.rawObservations.length} retained`}
          </dd>
          <dt>Simulation</dt>
          <dd>{record.simulationSkippedReason === null ? "simulated" : `skipped: ${record.simulationSkippedReason}`}</dd>
          <dt>Scoring</dt>
          <dd>
            {record.scoring.eligible ? "eligible" : "not eligible"} — {record.scoring.reason}
          </dd>
        </dl>
      </section>
      <details className="card json-view">
        <summary>Full shot record (JSON)</summary>
        <pre>{JSON.stringify(record, null, 2)}</pre>
      </details>
    </>
  );
}

export function ShotReviewScreen() {
  const { state, unitSystem } = useApp();
  const record = state.reviewShot ?? currentShot(state);
  const [engineering, setEngineering] = useState(state.settings.precision === "engineering");
  return (
    <div className="screen review">
      <header className="screen-header">
        <h1>Shot review</h1>
        <label className="check">
          <input type="checkbox" checked={engineering} onChange={(e) => setEngineering(e.target.checked)} />
          <span>Engineering precision (SI, 3 dp)</span>
        </label>
      </header>
      {record === null ? (
        <p className="muted">No shot selected. Hit a shot on the Range screen or pick one in Session history.</p>
      ) : (
        <>
          <p className="muted">
            Shot <code>{record.shotId}</code> · session <code>{record.sessionId}</code> · {record.createdUtc}
          </p>
          <ErrorBoundary label="This shot" resetKey={record.shotId}>
            <ReviewBody record={record} unitSystem={unitSystem} precision={engineering ? "engineering" : "golfer"} />
          </ErrorBoundary>
        </>
      )}
    </div>
  );
}
