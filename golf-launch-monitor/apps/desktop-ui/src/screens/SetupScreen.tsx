import { BALL_PROFILES } from "@glm/ballistics";
import type { EnvironmentFieldSource, EnvironmentProfile } from "@glm/shared-types";
import { convert, formatPressure, formatSpeed, formatTemperature, type UnitSystem } from "@glm/units";
import { useEffect, useState } from "react";
import { NumberField } from "../components/NumberField";
import type { EnvironmentSettings } from "../pipeline/environment";
import {
  DATA_SOURCES,
  type HardwareSourceId,
  isSoftwareSource,
  probeHardwareSources,
  sourceAvailability,
} from "../pipeline/sources";
import { useApp } from "../state/AppContext";

const WIND_DIRECTIONS: readonly { readonly deg: number; readonly label: string }[] = [
  { deg: 0, label: "From the target (headwind)" },
  { deg: 45, label: "From front-right" },
  { deg: 90, label: "From the right" },
  { deg: 135, label: "From behind-right" },
  { deg: 180, label: "From behind (tailwind)" },
  { deg: 225, label: "From behind-left" },
  { deg: 270, label: "From the left" },
  { deg: 315, label: "From front-left" },
];

const SOURCE_TEXT: Readonly<Record<EnvironmentFieldSource, string>> = {
  default: "DEFAULT — not entered",
  user: "entered",
  derived: "derived",
  sensor: "sensor",
};

function DataSourcePicker() {
  const { state, actions } = useApp();
  const [probe, setProbe] = useState<Record<HardwareSourceId, string> | null>(null);
  useEffect(() => {
    let live = true;
    void probeHardwareSources().then((r) => {
      if (live) setProbe(r);
    });
    return () => {
      live = false;
    };
  }, []);
  return (
    <fieldset className="card">
      <legend>Data source</legend>
      <div className="source-list">
        {DATA_SOURCES.map((source) => {
          const availability = sourceAvailability(source.id, state.settings.developerMode);
          const id = `source-${source.id}`;
          const hardwareMessage = source.hardware ? (probe?.[source.id as HardwareSourceId] ?? "Checking for a driver…") : null;
          return (
            <div key={source.id} className={`source${availability.enabled ? "" : " source-disabled"}`}>
              <input
                id={id}
                type="radio"
                name="data-source"
                value={source.id}
                checked={state.settings.dataSource === source.id}
                disabled={!availability.enabled}
                aria-describedby={`${id}-desc`}
                onChange={() => {
                  if (isSoftwareSource(source.id)) actions.setDataSource(source.id);
                }}
              />
              <label htmlFor={id}>
                <span className="source-label">{source.label}</span>
                {source.hardware && <span className="pill pill-disabled">Not available</span>}
              </label>
              <div id={`${id}-desc`} className="source-desc">
                <p>{source.description}</p>
                {availability.reason !== null && <p className="source-reason">{availability.reason}</p>}
                {hardwareMessage !== null && (
                  <p className="source-reason" data-testid={`hardware-message-${source.id}`}>
                    {hardwareMessage}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="muted">Changing the data source starts a new session; a session never mixes data streams.</p>
    </fieldset>
  );
}

function EquipmentPickers() {
  const { state, actions } = useApp();
  const { settings } = state;
  const ball = BALL_PROFILES.find((b) => b.id === settings.ballProfileId);
  return (
    <section className="card">
      <h2>Player, club and ball</h2>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="setup-player">Player</label>
          <select
            id="setup-player"
            value={settings.playerId ?? ""}
            onChange={(e) => actions.patchSettings({ playerId: e.target.value === "" ? null : e.target.value })}
          >
            <option value="">No player (right-handed shape labels)</option>
            {state.players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.displayName} ({p.handedness}-handed)
              </option>
            ))}
          </select>
          <p className="field-help">Handedness changes draw/fade wording only, never the physics.</p>
        </div>
        <div className="field">
          <label htmlFor="setup-club">Club</label>
          <select
            id="setup-club"
            value={settings.clubId ?? ""}
            onChange={(e) => actions.patchSettings({ clubId: e.target.value === "" ? null : e.target.value })}
          >
            <option value="">No club selected</option>
            {settings.bag.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label} ({c.category})
              </option>
            ))}
          </select>
          <p className="field-help">
            When spin is not observed, a club lets the pipeline ESTIMATE spin from a club model (wide uncertainty, provisional shot).
            Clubs never carry a distance.
          </p>
        </div>
        <div className="field">
          <label htmlFor="setup-ball">Ball profile</label>
          <select id="setup-ball" value={settings.ballProfileId} onChange={(e) => actions.patchSettings({ ballProfileId: e.target.value })}>
            {BALL_PROFILES.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          {ball !== undefined && (
            <ul className="warning-list">
              {ball.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Wind as the profile holds it (world frame, the direction the air moves TOWARD; +X downrange,
 * +Y left), described as the direction it blows FROM, clockwise from the target.
 */
function windText(profile: EnvironmentProfile, system: UnitSystem): string {
  if (profile.indoorMode) return "none (indoor)";
  const w = profile.windMps;
  const speed = Math.hypot(w.x, w.y, w.z);
  if (speed === 0) return "none";
  // Inverse of windVectorFrom: x = -s·cos(from), y = s·sin(from).
  const fromDeg = ((Math.atan2(w.y, -w.x) * 180) / Math.PI + 360) % 360;
  const named = WIND_DIRECTIONS.find((d) => Math.abs(((fromDeg - d.deg + 540) % 360) - 180) < 0.5);
  const direction = named !== undefined ? named.label.charAt(0).toLowerCase() + named.label.slice(1) : `from ${Math.round(fromDeg)}° clockwise of the target`;
  return `${formatSpeed(speed, system)} ${direction}`;
}

function DerivedEnvironment({ profile, system }: { readonly profile: EnvironmentProfile; readonly system: UnitSystem }) {
  const rows: readonly [string, string, EnvironmentFieldSource][] = [
    ["Temperature", formatTemperature(profile.temperatureC, system), profile.fieldSources.temperatureC],
    ["Station pressure", formatPressure(profile.pressurePa, system), profile.fieldSources.pressurePa],
    ["Relative humidity", `${Math.round(profile.relativeHumidity * 100)} %`, profile.fieldSources.relativeHumidity],
    [
      "Altitude",
      `${Math.round(convert(profile.altitudeM, "m", system.height === "m" ? "m" : "ft"))} ${system.height === "m" ? "m" : "ft"}`,
      profile.fieldSources.altitudeM,
    ],
    ["Wind", windText(profile, system), profile.fieldSources.windMps],
  ];
  return (
    <div className="derived">
      <p className="derived-density">
        Air density <strong data-testid="air-density">{profile.airDensityKgM3.toFixed(3)} kg/m³</strong>
        <span className="pill">derived from temperature, pressure and humidity</span>
      </p>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Field</th>
            <th scope="col">Value used</th>
            <th scope="col">Source</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, value, source]) => (
            <tr key={name}>
              <th scope="row">{name}</th>
              <td>{value}</td>
              <td>
                <span className={`pill pill-source-${source}`}>{SOURCE_TEXT[source]}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EnvironmentForm() {
  const { state, actions, unitSystem, environmentCheck } = useApp();
  const env = state.settings.environment;
  const patch = (p: Partial<EnvironmentSettings>) => actions.patchEnvironment(p);
  const tUnit = unitSystem.temperature;
  const pUnit = unitSystem.pressure;
  const altUnit = unitSystem.height === "m" ? "m" : "ft";
  const speedUnit = unitSystem.speed;
  return (
    <section className="card">
      <h2>Environment</h2>
      <label className="check">
        <input type="checkbox" checked={env.indoor} onChange={(e) => patch({ indoor: e.target.checked })} />
        <span>Indoor (no wind)</span>
      </label>
      <div className="form-grid">
        <NumberField
          label="Temperature"
          unit={tUnit === "degF" ? "°F" : "°C"}
          value={env.temperatureC}
          toDisplay={(c) => convert(c, "degC", tUnit)}
          fromDisplay={(v) => convert(v, tUnit, "degC")}
          decimals={1}
          placeholder="default"
          onChange={(v) => patch({ temperatureC: v })}
        />
        <NumberField
          label="Relative humidity"
          unit="%"
          value={env.relativeHumidity}
          toDisplay={(f) => f * 100}
          fromDisplay={(p) => p / 100}
          decimals={0}
          placeholder="default"
          onChange={(v) => patch({ relativeHumidity: v })}
        />
        <fieldset className="field">
          <legend>Pressure from</legend>
          <label className="check">
            <input
              type="radio"
              name="pressure-source"
              checked={env.pressureSource === "pressure"}
              onChange={() => patch({ pressureSource: "pressure" })}
            />
            <span>Barometer reading (station pressure)</span>
          </label>
          <label className="check">
            <input
              type="radio"
              name="pressure-source"
              checked={env.pressureSource === "altitude"}
              onChange={() => patch({ pressureSource: "altitude" })}
            />
            <span>Site altitude (standard atmosphere)</span>
          </label>
        </fieldset>
        {env.pressureSource === "pressure" ? (
          <NumberField
            label="Station pressure (absolute, not sea-level corrected)"
            unit={pUnit}
            value={env.pressurePa}
            toDisplay={(pa) => convert(pa, "Pa", pUnit)}
            fromDisplay={(v) => convert(v, pUnit, "Pa")}
            decimals={pUnit === "inHg" ? 2 : 0}
            placeholder="default"
            onChange={(v) => patch({ pressurePa: v })}
          />
        ) : (
          <NumberField
            label="Altitude"
            unit={altUnit}
            value={env.altitudeM}
            toDisplay={(m) => convert(m, "m", altUnit)}
            fromDisplay={(v) => convert(v, altUnit, "m")}
            decimals={0}
            placeholder="default"
            onChange={(v) => patch({ altitudeM: v })}
          />
        )}
        {!env.indoor && (
          <>
            <NumberField
              label="Wind speed"
              unit={speedUnit}
              value={env.windSpeedMps}
              toDisplay={(mps) => convert(mps, "m/s", speedUnit)}
              fromDisplay={(v) => convert(v, speedUnit, "m/s")}
              decimals={1}
              placeholder="none"
              onChange={(v) => patch({ windSpeedMps: v })}
            />
            <div className="field">
              <label htmlFor="wind-from">Wind direction</label>
              <select id="wind-from" value={env.windFromDeg} onChange={(e) => patch({ windFromDeg: Number(e.target.value) })}>
                {WIND_DIRECTIONS.map((w) => (
                  <option key={w.deg} value={w.deg}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>
      <p className="field-help">Blank fields use documented defaults and are labelled DEFAULT below. Air density is never typed in.</p>
      {environmentCheck.ok ? (
        <DerivedEnvironment profile={environmentCheck.profile} system={unitSystem} />
      ) : (
        <p className="notice notice-error" role="alert">
          Invalid environment — shots are blocked until this is fixed: {environmentCheck.error}
        </p>
      )}
    </section>
  );
}

export function SetupScreen() {
  return (
    <div className="screen">
      <h1>Setup</h1>
      <DataSourcePicker />
      <EquipmentPickers />
      <EnvironmentForm />
    </div>
  );
}
