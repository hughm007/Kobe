import type { DisplayValue } from "@glm/presentation";
import type { DataOrigin, Session, ShotRecord } from "@glm/shared-types";
import { useEffect, useMemo, useState } from "react";
import { BadgeRow } from "../components/Badge";
import { ConfirmButton } from "../components/ConfirmButton";
import { OriginBanner } from "../components/OriginBanner";
import { presentShot } from "../components/ShotCard";
import { ValueText } from "../components/ValueText";
import { clubText, shotTimeText } from "../display/shot-display";
import { type ShotSortKey, type SortDirection, sortShots } from "../display/sort";
import { useApp } from "../state/AppContext";

type Column = { readonly key: ShotSortKey | null; readonly label: string };

const COLUMNS: readonly Column[] = [
  { key: "time", label: "Time" },
  { key: null, label: "Club" },
  { key: null, label: "Validity" },
  { key: "confidence", label: "Launch confidence" },
  { key: "ballSpeed", label: "Ball speed" },
  { key: "launchAngle", label: "Launch" },
  { key: "spin", label: "Spin" },
  { key: "carry", label: "Carry" },
  { key: "total", label: "Total" },
  { key: "offline", label: "Offline at rest" },
];

/** A value with its provenance badges; unavailable renders "—" with its UNAVAILABLE badge. */
function ValueCell({ value, fallback }: { readonly value: DisplayValue | undefined; readonly fallback: string }) {
  if (value === undefined) return <td className="num muted">{fallback}</td>;
  return (
    <td className="num value-cell">
      <span className="value-text">
        <ValueText text={value.rangeText ?? value.text} />
      </span>
      <BadgeRow value={value} />
    </td>
  );
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function HistoryScreen() {
  const { state, runtime, actions, unitSystem } = useApp();
  const [sessions, setSessions] = useState<readonly Session[]>([]);
  /** null = follow the current session (also after it is deleted and replaced). */
  const [selected, setSelected] = useState<string | null>(null);
  const [stored, setStored] = useState<readonly ShotRecord[]>([]);
  const [sort, setSort] = useState<{ key: ShotSortKey; dir: SortDirection }>({ key: "time", dir: "asc" });
  const [refresh, setRefresh] = useState(0);
  const [problem, setProblem] = useState<string | null>(null);
  const isCurrent = selected === null || selected === state.sessionId;
  const selectedId = isCurrent ? state.sessionId : (selected as string);

  useEffect(() => {
    let live = true;
    runtime.repository
      .listSessions()
      .then((s) => live && setSessions(s))
      .catch((e: unknown) => live && setProblem(`Could not list sessions: ${errorText(e)}`));
    return () => {
      live = false;
    };
  }, [runtime.repository, refresh, state.shots.length]);

  useEffect(() => {
    if (isCurrent) return;
    let live = true;
    runtime.repository
      .listShots({ sessionId: selectedId })
      .then((s) => live && setStored(s))
      .catch((e: unknown) => live && setProblem(`Could not load shots: ${errorText(e)}`));
    return () => {
      live = false;
    };
  }, [runtime.repository, selectedId, isCurrent, refresh]);

  const shots = isCurrent ? state.shots : stored;
  const numbered = useMemo(() => new Map(shots.map((s, i) => [s.shotId, i + 1])), [shots]);
  const sorted = useMemo(() => sortShots(shots, sort.key, sort.dir), [shots, sort]);
  const otherSessions = sessions.filter((s) => s.id !== state.sessionId);
  // One banner per data origin present, so a listing can never hide a stream behind another's banner.
  const origins = useMemo(() => [...new Set(shots.map((s) => s.dataOrigin))] as DataOrigin[], [shots]);

  const toggleSort = (key: ShotSortKey) =>
    setSort((cur) => (cur.key === key ? { key, dir: cur.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  return (
    <div className="screen">
      <h1>Session history</h1>
      {problem !== null && (
        <p className="notice notice-error" role="alert">
          {problem}
        </p>
      )}
      <section className="card toolbar">
        <div className="field">
          <label htmlFor="history-session">Session</label>
          <select
            id="history-session"
            value={selectedId}
            onChange={(e) => setSelected(e.target.value === state.sessionId ? null : e.target.value)}
          >
            <option value={state.sessionId}>Current session ({state.shots.length} shots)</option>
            {otherSessions.map((s) => (
              <option key={s.id} value={s.id}>
                {new Date(s.startedUtc).toLocaleString()} — {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="button-row">
          <button type="button" disabled={shots.length === 0} onClick={() => actions.exportShots(shots, "csv", isCurrent ? "current" : selectedId)}>
            Export CSV
          </button>
          <button type="button" disabled={shots.length === 0} onClick={() => actions.exportShots(shots, "json", isCurrent ? "current" : selectedId)}>
            Export JSON
          </button>
          {isCurrent && (
            <button type="button" className="button-ghost" onClick={actions.startNewSession}>
              Start new session
            </button>
          )}
          <ConfirmButton
            label="Delete session"
            confirmLabel="Delete session and shots"
            disabled={!isCurrent && !sessions.some((s) => s.id === selectedId)}
            question={`Delete this session and its ${shots.length} shot(s) from this computer? This cannot be undone.`}
            onConfirm={async () => {
              try {
                await actions.deleteSession(selectedId);
                setSelected(null);
                setRefresh((n) => n + 1);
              } catch (e) {
                setProblem(`Could not delete the session: ${errorText(e)}`);
              }
            }}
          />
        </div>
        <p className="muted small">Exports are written to your downloads folder. CSV columns state their units and sign conventions.</p>
      </section>

      {origins.map((origin) => (
        <OriginBanner key={origin} origin={origin} compact />
      ))}
      {shots.length === 0 ? (
        <p className="muted">No shots in this session.</p>
      ) : (
        <div className="table-scroll">
          <table className="table history-table">
            <thead>
              <tr>
                <th scope="col">#</th>
                {COLUMNS.map((c) =>
                  c.key === null ? (
                    <th key={c.label} scope="col">
                      {c.label}
                    </th>
                  ) : (
                    <th
                      key={c.label}
                      scope="col"
                      aria-sort={sort.key === c.key ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                    >
                      <button type="button" className="sort-button" onClick={() => toggleSort(c.key as ShotSortKey)}>
                        {c.label}
                        <span aria-hidden="true">{sort.key === c.key ? (sort.dir === "asc" ? " ▲" : " ▼") : ""}</span>
                      </button>
                    </th>
                  ),
                )}
                <th scope="col">Review</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s) => {
                const d = presentShot(s, unitSystem, "golfer");
                const flight = d.flight;
                return (
                  <tr key={s.shotId}>
                    <td className="num">{numbered.get(s.shotId)}</td>
                    <td>{shotTimeText(s)}</td>
                    <td>{clubText(s, state.settings.bag)}</td>
                    <td>
                      <span className={`pill pill-${s.launch.validity}`}>{s.launch.validity}</span>
                    </td>
                    <td className="num">{Math.round(s.launch.overallConfidence * 100)}%</td>
                    <ValueCell value={d.launch.ballSpeed} fallback="—" />
                    <ValueCell value={d.launch.verticalLaunch} fallback="—" />
                    <ValueCell value={d.launch.totalSpin} fallback="—" />
                    <ValueCell value={flight?.carry} fallback="not simulated" />
                    <ValueCell value={flight?.total} fallback="—" />
                    <ValueCell value={flight?.totalLateral} fallback="—" />
                    <td>
                      <button type="button" className="button-ghost" onClick={() => actions.reviewShot(s)}>
                        Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
