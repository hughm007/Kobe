import { BALL_PROFILES } from "@glm/ballistics";
import { presentShotMetrics } from "@glm/presentation";
import { SYNTHETIC_FIXTURES } from "@glm/shot-pipeline";
import { type FormEvent, useState } from "react";
import { BadgeRow } from "../components/Badge";
import { ShotView } from "../components/ShotView";
import { ValueText } from "../components/ValueText";
import { NOISE_PRESETS } from "../pipeline/noise-presets";
import { useApp } from "../state/AppContext";
import { currentShot } from "../state/reducer";
import { NOISE_PRESET_IDS, type NoisePresetId } from "../worker/protocol";

function SafetyGate() {
  const { actions } = useApp();
  return (
    <div className="screen">
      <h1>Range</h1>
      <section className="card gate" role="alert">
        <h2>Range locked: safety checklist not acknowledged</h2>
        <p>Before hitting any shot, check the impact screen, swing clearance, shank zone, cameras, cables and lighting.</p>
        <button type="button" className="button-primary" onClick={() => actions.navigate("safety")}>
          Open the safety checklist
        </button>
      </section>
    </div>
  );
}

/** "high-7-iron" -> "High 7 iron" (labels only; the id is what the pipeline receives). */
function fixtureLabel(id: string): string {
  const words = id.replace(/-/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function SyntheticControls() {
  const { state, actions, environmentCheck } = useApp();
  const { settings } = state;
  const preset = NOISE_PRESETS.find((p) => p.id === settings.noisePreset);
  const fixture = SYNTHETIC_FIXTURES.find((f) => f.id === settings.fixtureId);
  return (
    <section className="card controls" aria-label="Synthetic shot controls">
      <h2>Synthetic shot</h2>
      <div className="field">
        <label htmlFor="fixture">Fixture</label>
        <select id="fixture" value={settings.fixtureId} onChange={(e) => actions.patchSettings({ fixtureId: e.target.value })}>
          {SYNTHETIC_FIXTURES.map((f) => (
            <option key={f.id} value={f.id}>
              {fixtureLabel(f.id)}
            </option>
          ))}
        </select>
        {fixture !== undefined && <p className="field-help">{fixture.description}</p>}
      </div>
      <div className="field">
        <label htmlFor="noise">Noise preset</label>
        <select
          id="noise"
          value={settings.noisePreset}
          onChange={(e) => {
            const id = e.target.value;
            if ((NOISE_PRESET_IDS as readonly string[]).includes(id)) actions.patchSettings({ noisePreset: id as NoisePresetId });
          }}
        >
          {NOISE_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        {preset !== undefined && <p className="field-help">{preset.description}</p>}
      </div>
      <div className="field">
        <label htmlFor="seed">Seed (auto-increments)</label>
        <input
          id="seed"
          type="number"
          min={0}
          step={1}
          value={state.nextSeed}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isSafeInteger(n) && n >= 0) actions.setSeed(n);
          }}
        />
      </div>
      <button
        type="button"
        className="button-primary button-hit"
        disabled={state.busy || !environmentCheck.ok}
        onClick={actions.hitSynthetic}
      >
        Hit synthetic shot
      </button>
      <p className="muted">Generated for testing from the selected fixture; never a measurement.</p>
    </section>
  );
}

function ReplayControls() {
  const { state, actions, environmentCheck } = useApp();
  const replay = state.replay;
  return (
    <section className="card controls" aria-label="Replay controls">
      <h2>Replay file</h2>
      <div className="field">
        <label htmlFor="replay-file">Load a replay (.jsonl)</label>
        <input
          id="replay-file"
          type="file"
          accept=".jsonl,.json,.txt,application/json"
          disabled={state.busy || !environmentCheck.ok}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file === undefined) return;
            actions.loadReplayText(await file.text(), file.name);
            e.target.value = "";
          }}
        />
      </div>
      {replay === null ? (
        <p className="muted">No replay loaded. Files stay on this computer; nothing is uploaded.</p>
      ) : (
        <>
          <dl className="kv">
            <dt>File</dt>
            <dd>{replay.fileName ?? "(unnamed)"}</dd>
            <dt>Description</dt>
            <dd>{replay.header.description}</dd>
            <dt>Recorded origin</dt>
            <dd>{replay.header.recordedDataOrigin}</dd>
            <dt>Played back as</dt>
            <dd>{replay.header.playbackDataOrigin}</dd>
            <dt>Recorded</dt>
            <dd>{replay.header.createdUtc}</dd>
            <dt>Sensor</dt>
            <dd>
              {replay.header.sensorKind}: {replay.header.sensorDescription}
            </dd>
            <dt>Calibration</dt>
            <dd>{replay.header.calibrationVersion === null ? "none in file" : `${replay.header.calibrationVersion} (${replay.header.calibrationStatus})`}</dd>
            <dt>Shots</dt>
            <dd data-testid="replay-progress">
              {replay.delivered} of {replay.shotCount} played
            </dd>
          </dl>
          <p className="field-help" data-testid="replay-attribution">
            {REPLAY_ATTRIBUTION_NOTE}
          </p>
          {replay.warnings.length > 0 && (
            <ul className="warning-list" aria-label="Replay file warnings">
              {replay.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          )}
          <button
            type="button"
            className="button-primary button-hit"
            disabled={state.busy || replay.exhausted || !environmentCheck.ok}
            onClick={actions.replayNextShot}
          >
            {replay.exhausted ? "Replay finished" : "Next shot"}
          </button>
        </>
      )}
    </section>
  );
}

/** Replay files carry no player or club, so replayed shots are attributed from the current Setup. */
export const REPLAY_ATTRIBUTION_NOTE =
  "Player, handedness and club for replayed shots come from the current Setup, not from the file.";

type ManualText = { speed: string; vla: string; hla: string; spin: string; axis: string };

function parseOptional(text: string): number | null {
  return text.trim() === "" ? null : Number(text);
}

function ManualControls() {
  const { state, actions, environmentCheck } = useApp();
  const [form, setForm] = useState<ManualText>({ speed: "", vla: "", hla: "", spin: "", axis: "" });
  const set = (k: keyof ManualText) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    actions.submitManual({
      ballSpeedMph: Number(form.speed),
      verticalLaunchDeg: Number(form.vla),
      horizontalLaunchDegLeftPositive: Number(form.hla),
      totalSpinRpm: parseOptional(form.spin),
      spinAxisDegRightPositive: parseOptional(form.axis),
    });
  };
  return (
    <form className="card controls manual" aria-label="Manual entry" onSubmit={submit}>
      <h2>Manual entry</h2>
      <p className="notice notice-warn">DEVELOPER TESTING ONLY — typed values are labelled MANUAL and are never measurements.</p>
      <div className="field">
        <label htmlFor="m-speed">Ball speed (mph)</label>
        <input id="m-speed" inputMode="decimal" required value={form.speed} onChange={set("speed")} />
      </div>
      <div className="field">
        <label htmlFor="m-vla">Launch angle (° up)</label>
        <input id="m-vla" inputMode="decimal" required value={form.vla} onChange={set("vla")} />
      </div>
      <div className="field">
        <label htmlFor="m-hla">Launch direction (°, + = LEFT of target)</label>
        <input id="m-hla" inputMode="decimal" required value={form.hla} onChange={set("hla")} placeholder="e.g. 0" />
      </div>
      <div className="field">
        <label htmlFor="m-spin">Total spin (rpm, blank = not provided)</label>
        <input id="m-spin" inputMode="decimal" value={form.spin} onChange={set("spin")} />
      </div>
      <div className="field">
        <label htmlFor="m-axis">Spin axis (°, + = curves RIGHT, blank = not provided)</label>
        <input id="m-axis" inputMode="decimal" value={form.axis} onChange={set("axis")} />
      </div>
      <button type="submit" className="button-primary" disabled={state.busy || !environmentCheck.ok}>
        Submit manual launch
      </button>
    </form>
  );
}

function SetupSummary() {
  const { state, actions, environmentCheck } = useApp();
  const { settings } = state;
  const player = state.players.find((p) => p.id === settings.playerId);
  const club = settings.bag.find((c) => c.id === settings.clubId);
  const ball = BALL_PROFILES.find((b) => b.id === settings.ballProfileId);
  return (
    <section className="card summary" aria-label="Current setup">
      <dl className="kv kv-compact">
        <dt>Player</dt>
        <dd>{player ? `${player.displayName} (${player.handedness})` : "none (right-handed labels)"}</dd>
        <dt>Club</dt>
        <dd>{club ? club.label : "none — unobserved spin stays unavailable"}</dd>
        <dt>Ball</dt>
        <dd>{ball?.name ?? settings.ballProfileId}</dd>
        <dt>Air</dt>
        <dd>
          {environmentCheck.ok
            ? `${environmentCheck.profile.indoorMode ? "indoor" : "outdoor"}, density ${environmentCheck.profile.airDensityKgM3.toFixed(3)} kg/m³`
            : "invalid — fix on Setup"}
        </dd>
        <dt>Monte Carlo</dt>
        <dd>{settings.monteCarloSamples === 0 ? "off (no uncertainty ranges)" : `${settings.monteCarloSamples} samples`}</dd>
        <dt>Spin fallback</dt>
        <dd>{settings.allowGenericSpinFallback ? "ALLOWED (generic spin is labelled ASSUMED)" : "off"}</dd>
      </dl>
      <button type="button" className="button-ghost" onClick={() => actions.navigate("setup")}>
        Change setup
      </button>
    </section>
  );
}

function RecentShots() {
  const { state, actions, unitSystem } = useApp();
  if (state.shots.length === 0) return null;
  const recent = state.shots.map((s, i) => ({ s, n: i + 1 })).slice(-12).reverse();
  return (
    <section className="card recent" aria-label="Recent shots this session">
      <h2>This session</h2>
      <ol className="recent-list">
        {recent.map(({ s, n }) => {
          const simulated = s.result !== null && s.launch.validity !== "invalid";
          const carry = simulated ? presentShotMetrics(s.result!.metrics, unitSystem, "golfer", s.dataOrigin).carry : undefined;
          return (
            <li key={s.shotId}>
              <button
                type="button"
                className="recent-item"
                aria-current={s.shotId === state.currentShotId ? "true" : undefined}
                onClick={() => actions.showShot(s.shotId)}
              >
                <span className="recent-n">#{n}</span>
                <span className="recent-value">
                  {carry ? (
                    <span>
                      <ValueText text={carry.rangeText ?? carry.text} /> carry
                    </span>
                  ) : (
                    "not simulated"
                  )}
                  {carry && <BadgeRow value={carry} />}
                </span>
                <span className={`pill pill-${s.launch.validity}`}>{s.launch.validity}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function RangeScreen() {
  const { state, actions, unitSystem } = useApp();
  if (state.settings.safetyAcknowledgedUtc === null) return <SafetyGate />;
  const shot = currentShot(state);
  const index = shot === null ? -1 : state.shots.indexOf(shot);
  const source = state.settings.dataSource;
  return (
    <div className="screen range">
      <h1 className="sr-only">Range</h1>
      <div className="range-side">
        {source === "synthetic" && <SyntheticControls />}
        {source === "replay" && <ReplayControls />}
        {source === "manual" && <ManualControls />}
        <SetupSummary />
        <RecentShots />
      </div>
      <div className="range-main">
        {shot === null ? (
          <section className="card empty">
            <h2>No shot yet</h2>
            <p>
              {source === "synthetic" && "Choose a fixture and press “Hit synthetic shot”."}
              {source === "replay" && "Load a replay file, then press “Next shot”."}
              {source === "manual" && "Enter launch conditions and submit."}
            </p>
          </section>
        ) : (
          <>
            <ShotView
              record={shot}
              unitSystem={unitSystem}
              precision={state.settings.precision}
              players={state.players}
              bag={state.settings.bag}
              shotNumber={index + 1}
              {...(source === "replay" ? { attributionNote: "player, handedness and club from current Setup, not from the replay file" } : {})}
            />
            <div className="button-row">
              <button type="button" className="button-ghost" onClick={() => actions.reviewShot(shot)}>
                Open full shot review
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
