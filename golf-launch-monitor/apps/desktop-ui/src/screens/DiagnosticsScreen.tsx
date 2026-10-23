import { ENVIRONMENT_MODEL_VERSION, PHYSICS_MODEL_VERSION } from "@glm/ballistics";
import { ESTIMATOR_VERSION } from "@glm/launch-state";
import { INDEXED_DB_VERSION, type IntegrityReport, SHOT_EXPORT_FORMAT_VERSION } from "@glm/persistence";
import { COORDINATE_SYSTEM_VERSION, REPLAY_FORMAT_VERSION, SCHEMA_VERSION } from "@glm/shared-types";
import { physicsVersionTag, SOFTWARE_VERSION } from "@glm/shot-pipeline";
import { TERRAIN_MODEL_VERSION } from "@glm/terrain-engine";
import { useEffect, useState } from "react";
import { useApp } from "../state/AppContext";

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function HealthCard() {
  const { state, actions } = useApp();
  const info = state.health;
  useEffect(() => {
    actions.requestHealth();
  }, [actions]);
  const health = info?.health ?? null;
  return (
    <section className="card">
      <h2>Sensor adapter health</h2>
      {health === null ? (
        <p className="muted">No adapter has run yet in this session. Hit or replay a shot, then refresh.</p>
      ) : (
        <>
          <dl className="kv">
            <dt>Adapter</dt>
            <dd>
              {health.sensorId} ({info?.adapterKind ?? "unknown"})
            </dd>
            <dt>Status</dt>
            <dd>
              <span className={`pill pill-health-${health.status}`}>{health.status}</span>
            </dd>
            <dt>Calibration</dt>
            <dd>{health.calibrationStatus}</dd>
            <dt>Checked</dt>
            <dd>{health.checkedUtc}</dd>
          </dl>
          {health.messages.length > 0 && (
            <ul>
              {health.messages.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          )}
          {health.metrics.length === 0 ? (
            <p className="muted small">This adapter reports no health metrics (software adapters have no camera to monitor).</p>
          ) : (
            <table className="table table-dense">
              <thead>
                <tr>
                  <th scope="col">Metric</th>
                  <th scope="col">Value</th>
                  <th scope="col">Status</th>
                  <th scope="col">Detail</th>
                </tr>
              </thead>
              <tbody>
                {health.metrics.map((m) => (
                  <tr key={m.id}>
                    <td>{m.label}</td>
                    <td className="num">{m.value === null ? "—" : `${m.value} ${m.unit}`}</td>
                    <td>{m.status}</td>
                    <td>{m.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
      <button type="button" className="button-ghost" onClick={actions.requestHealth}>
        Refresh health
      </button>
    </section>
  );
}

function PipelineCard() {
  const { state } = useApp();
  return (
    <section className="card">
      <h2>Pipeline</h2>
      <dl className="kv">
        <dt>Runs in</dt>
        <dd>
          {state.runnerKind === "worker"
            ? "Web Worker (UI stays responsive during Monte Carlo)"
            : "UI thread (fallback: Web Workers unavailable; the UI may pause while a shot is processed)"}
        </dd>
        <dt>Busy</dt>
        <dd>{state.busy ? "yes" : "no"}</dd>
        <dt>Last processing time</dt>
        <dd>{state.lastProcessingMs === null ? "—" : `${Math.round(state.lastProcessingMs)} ms`}</dd>
        <dt>Monte Carlo samples</dt>
        <dd>{state.settings.monteCarloSamples}</dd>
        <dt>Session</dt>
        <dd>
          <code>{state.sessionId}</code> ({state.shots.length} shots)
        </dd>
      </dl>
    </section>
  );
}

function StorageCard() {
  const { runtime, state } = useApp();
  const [report, setReport] = useState<IntegrityReport | null>(null);
  const [counts, setCounts] = useState<{ players: number; sessions: number; shots: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const check = async () => {
    try {
      const [r, players, sessions, shots] = await Promise.all([
        runtime.repository.integrityReport(),
        runtime.repository.listPlayers(),
        runtime.repository.listSessions(),
        runtime.repository.listShots(),
      ]);
      setReport(r);
      setCounts({ players: players.length, sessions: sessions.length, shots: shots.length });
      setError(null);
    } catch (e) {
      setError(errorText(e));
    }
  };
  return (
    <section className="card">
      <h2>Local storage</h2>
      <p>{runtime.storageDescription}</p>
      {!runtime.storagePersistent && <p className="notice notice-warn">Shots are NOT persisted in this browser.</p>}
      <p className="muted small">
        Settings: {runtime.settingsStorage === null ? "local storage unavailable — settings reset on reload" : "saved in local storage"}.
        {state.storageError !== null && ` Last problem: ${state.storageError}`}
      </p>
      <button type="button" onClick={() => void check()}>
        Run integrity check
      </button>
      {error !== null && (
        <p className="notice notice-error" role="alert">
          Integrity check failed: {error}
        </p>
      )}
      {report !== null && counts !== null && (
        <div data-testid="integrity-report">
          <p>
            {counts.players} player(s), {counts.sessions} session(s), {counts.shots} valid shot(s).{" "}
            {report.corruptKeys.length === 0 ? "No corrupt records." : `${report.corruptKeys.length} corrupt record(s), excluded from lists:`}
          </p>
          {report.corruptKeys.length > 0 && (
            <ul>
              {report.corruptKeys.map((k) => (
                <li key={k}>
                  <code>{k}</code>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

function VersionsCard() {
  const rows: readonly [string, string][] = [
    ["Application", SOFTWARE_VERSION],
    ["Record schema", SCHEMA_VERSION],
    ["Coordinate system", COORDINATE_SYSTEM_VERSION],
    ["Replay format", REPLAY_FORMAT_VERSION],
    ["Physics (air + ground)", physicsVersionTag()],
    ["Air model", PHYSICS_MODEL_VERSION],
    ["Environment model", ENVIRONMENT_MODEL_VERSION],
    ["Launch estimator", ESTIMATOR_VERSION],
    ["Terrain model", TERRAIN_MODEL_VERSION],
    ["IndexedDB schema", String(INDEXED_DB_VERSION)],
    ["Export format", String(SHOT_EXPORT_FORMAT_VERSION)],
  ];
  return (
    <section className="card">
      <h2>Versions</h2>
      <table className="table table-dense">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k}>
              <th scope="row">{k}</th>
              <td>
                <code>{v}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function DiagnosticsScreen() {
  return (
    <div className="screen">
      <h1>Diagnostics</h1>
      <div className="grid-2">
        <HealthCard />
        <PipelineCard />
        <StorageCard />
        <VersionsCard />
      </div>
    </div>
  );
}
