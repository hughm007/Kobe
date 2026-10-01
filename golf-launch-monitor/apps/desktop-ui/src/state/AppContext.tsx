/**
 * React context: one reducer for UI state, plus the side effects around it (pipeline runner
 * messages, IndexedDB, localStorage, file downloads). Components call the action helpers and
 * never talk to the worker or storage directly.
 */
import type { LocalRepository } from "@glm/persistence";
import { shotsToCsv, shotsToJson } from "@glm/persistence";
import type { Player, Session, ShotRecord } from "@glm/shared-types";
import { SOFTWARE_VERSION } from "@glm/shot-pipeline";
import { IMPERIAL_GOLF_UNITS, METRIC_UNITS, type UnitSystem } from "@glm/units";
import {
  createContext,
  type Dispatch,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { buildPipelineSettings } from "../pipeline/config";
import { checkEnvironment, type EnvironmentCheck, type EnvironmentSettings } from "../pipeline/environment";
import type { SoftwareSourceId } from "../pipeline/sources";
import { fileStamp } from "../storage/download";
import { sessionRecordFor } from "../storage/repository";
import type { ManualLaunchFields, WorkerToUiMessage } from "../worker/protocol";
import type { PipelineRunner } from "../worker/runner-api";
import { type AppAction, appReducer, type AppState, createInitialState, type ScreenId } from "./reducer";
import { type AppSettings, loadSettings, saveSettings, type StorageLike } from "./settings";

/** Everything the app needs from its environment; tests inject in-process/in-memory versions. */
export type AppRuntime = {
  readonly runner: PipelineRunner;
  readonly repository: LocalRepository;
  readonly storageDescription: string;
  readonly storagePersistent: boolean;
  readonly settingsStorage: StorageLike | null;
  readonly newId: () => string;
  readonly nowUtc: () => string;
  readonly download: (fileName: string, text: string, mimeType: string) => void;
};

export type AppActions = {
  navigate(screen: ScreenId): void;
  patchSettings(patch: Partial<AppSettings>): void;
  patchEnvironment(patch: Partial<EnvironmentSettings>): void;
  acknowledgeSafety(): void;
  setDataSource(source: SoftwareSourceId): void;
  startNewSession(): void;
  hitSynthetic(): void;
  setSeed(seed: number): void;
  loadReplayText(text: string, fileName: string | null): void;
  replayNextShot(): void;
  submitManual(fields: ManualLaunchFields): void;
  requestHealth(): void;
  dismissError(): void;
  reviewShot(record: ShotRecord): void;
  showShot(shotId: string): void;
  savePlayer(player: Player): Promise<void>;
  deletePlayer(playerId: string, deleteShots: boolean): Promise<number>;
  deleteSession(sessionId: string): Promise<number>;
  exportShots(records: readonly ShotRecord[], format: "csv" | "json", label: string): void;
};

export type AppContextValue = {
  readonly state: AppState;
  readonly dispatch: Dispatch<AppAction>;
  readonly runtime: AppRuntime;
  readonly actions: AppActions;
  readonly unitSystem: UnitSystem;
  readonly environmentCheck: EnvironmentCheck;
};

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const value = useContext(AppContext);
  if (value === null) throw new Error("useApp must be used inside <AppProvider>");
  return value;
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function AppProvider({ runtime, children }: { readonly runtime: AppRuntime; readonly children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, runtime, (rt) =>
    createInitialState({
      settings: loadSettings(rt.settingsStorage),
      sessionId: rt.newId(),
      sessionStartedUtc: rt.nowUtc(),
      runnerKind: rt.runner.kind,
    }),
  );
  const stateRef = useRef(state);
  stateRef.current = state;
  /** Sessions already written to the repository, with the shots written for them. */
  const sessionShots = useRef(new Map<string, { startedUtc: string; shots: ShotRecord[] }>());

  const persistShot = useCallback(
    async (record: ShotRecord) => {
      const current = stateRef.current;
      try {
        await runtime.repository.saveShot(record);
        let entry = sessionShots.current.get(record.sessionId);
        if (entry === undefined) {
          const startedUtc = record.sessionId === current.sessionId ? current.sessionStartedUtc : record.createdUtc;
          entry = { startedUtc, shots: [] };
          sessionShots.current.set(record.sessionId, entry);
        }
        entry.shots.push(record);
        const session: Session | null = sessionRecordFor(record.sessionId, entry.startedUtc, entry.shots);
        if (session !== null) await runtime.repository.saveSession(session);
        dispatch({ type: "storage-error", message: null });
      } catch (error) {
        dispatch({ type: "storage-error", message: `Could not save shot ${record.shotId}: ${errorText(error)}` });
      }
    },
    [runtime.repository],
  );

  // Worker / in-process pipeline messages.
  useEffect(() => {
    const onMessage = (message: WorkerToUiMessage) => {
      switch (message.type) {
        case "shot":
          dispatch({ type: "shot-received", record: message.record, processingMs: message.processingMs });
          void persistShot(message.record);
          return;
        case "busy":
          dispatch({ type: "busy", busy: message.busy });
          return;
        case "error":
          dispatch({ type: "error", message: message.message });
          return;
        case "replay-loaded":
          dispatch({
            type: "replay-loaded",
            info: { fileName: message.fileName, shotCount: message.shotCount, header: message.header, warnings: message.warnings },
            sessionId: runtime.newId(),
            utc: runtime.nowUtc(),
          });
          return;
        case "replay-progress":
          dispatch({ type: "replay-progress", delivered: message.delivered, exhausted: message.exhausted });
          return;
        case "health":
          dispatch({ type: "health", info: { health: message.health, adapterKind: message.adapterKind } });
          return;
      }
    };
    return runtime.runner.onMessage(onMessage);
  }, [runtime, persistShot]);

  // The runner outlives the provider (StrictMode remounts effects); its owner disposes it.

  // Players from local storage.
  useEffect(() => {
    let cancelled = false;
    runtime.repository
      .listPlayers()
      .then((players) => {
        if (!cancelled) dispatch({ type: "players-loaded", players });
      })
      .catch((error: unknown) => dispatch({ type: "storage-error", message: `Could not load players: ${errorText(error)}` }));
    return () => {
      cancelled = true;
    };
  }, [runtime.repository]);

  // Settings -> localStorage.
  useEffect(() => {
    if (!saveSettings(runtime.settingsStorage, state.settings) && runtime.settingsStorage !== null) {
      dispatch({ type: "storage-error", message: "Settings could not be saved to local storage; they will reset on reload." });
    }
  }, [runtime.settingsStorage, state.settings]);

  // Theme.
  useEffect(() => {
    document.documentElement.dataset.theme = state.settings.theme;
  }, [state.settings.theme]);

  const { settings } = state;
  const environmentCheck = useMemo(() => checkEnvironment(settings.environment), [settings.environment]);
  const player = state.players.find((p) => p.id === settings.playerId) ?? null;
  const club = settings.bag.find((c) => c.id === settings.clubId) ?? null;
  const pipelineSettings = useMemo(
    () =>
      buildPipelineSettings({
        sessionId: state.sessionId,
        player,
        club,
        ballProfileId: settings.ballProfileId,
        environment: settings.environment,
        monteCarloSamples: settings.monteCarloSamples,
        allowGenericSpinFallback: settings.allowGenericSpinFallback,
        retainRawObservations: settings.retainRawObservations,
      }),
    [
      state.sessionId,
      player,
      club,
      settings.ballProfileId,
      settings.environment,
      settings.monteCarloSamples,
      settings.allowGenericSpinFallback,
      settings.retainRawObservations,
    ],
  );
  const configKey = JSON.stringify(pipelineSettings);

  // Keep the pipeline configured; an invalid environment is never sent (Setup shows the error).
  useEffect(() => {
    if (environmentCheck.ok) runtime.runner.send({ type: "configure", config: JSON.parse(configKey) });
  }, [runtime.runner, configKey, environmentCheck.ok]);

  const actions = useMemo<AppActions>(() => {
    const send = runtime.runner.send.bind(runtime.runner);
    const blockedReason = (): string | null => {
      const s = stateRef.current.settings;
      if (s.safetyAcknowledgedUtc === null) return "Acknowledge the safety checklist before hitting shots.";
      const env = checkEnvironment(s.environment);
      if (!env.ok) return `Environment settings are invalid: ${env.error}`;
      return null;
    };
    const guarded = (run: () => void) => {
      const reason = blockedReason();
      if (reason !== null) dispatch({ type: "error", message: reason });
      else run();
    };
    return {
      navigate: (screen) => dispatch({ type: "navigate", screen }),
      patchSettings: (patch) =>
        dispatch({ type: "settings-patched", patch, nextSession: { sessionId: runtime.newId(), utc: runtime.nowUtc() } }),
      patchEnvironment: (patch) => dispatch({ type: "environment-patched", patch }),
      acknowledgeSafety: () => dispatch({ type: "safety-acknowledged", utc: runtime.nowUtc() }),
      setDataSource: (source) =>
        dispatch({ type: "data-source-changed", source, sessionId: runtime.newId(), utc: runtime.nowUtc() }),
      startNewSession: () => dispatch({ type: "session-started", sessionId: runtime.newId(), utc: runtime.nowUtc() }),
      hitSynthetic: () =>
        guarded(() => {
          const s = stateRef.current;
          send({ type: "hit-synthetic", fixtureId: s.settings.fixtureId, seed: s.nextSeed, noisePreset: s.settings.noisePreset });
          dispatch({ type: "seed-set", seed: s.nextSeed + 1 });
        }),
      setSeed: (seed) => dispatch({ type: "seed-set", seed }),
      loadReplayText: (text, fileName) =>
        guarded(() => send(fileName === null ? { type: "load-replay", text } : { type: "load-replay", text, fileName })),
      replayNextShot: () => guarded(() => send({ type: "replay-next-shot" })),
      submitManual: (fields) =>
        guarded(() => {
          if (!stateRef.current.settings.developerMode) {
            dispatch({ type: "error", message: "Manual entry requires developer mode (Settings)." });
            return;
          }
          send({ type: "manual-launch", ...fields });
        }),
      requestHealth: () => send({ type: "request-health" }),
      dismissError: () => dispatch({ type: "error-dismissed" }),
      reviewShot: (record) => dispatch({ type: "review-shot", record }),
      showShot: (shotId) => dispatch({ type: "current-shot", shotId }),
      savePlayer: async (p) => {
        await runtime.repository.savePlayer(p);
        dispatch({ type: "player-saved", player: p });
      },
      deletePlayer: async (playerId, deleteShots) => {
        const { deletedShots } = await runtime.repository.deletePlayer(playerId, { deleteShots });
        dispatch({ type: "player-deleted", playerId, deletedShots: deleteShots });
        return deletedShots;
      },
      deleteSession: async (sessionId) => {
        const { deletedShots } = await runtime.repository.deleteSession(sessionId);
        sessionShots.current.delete(sessionId);
        dispatch({ type: "session-deleted", sessionId });
        if (sessionId === stateRef.current.sessionId) {
          dispatch({ type: "session-started", sessionId: runtime.newId(), utc: runtime.nowUtc() });
        }
        return deletedShots;
      },
      exportShots: (records, format, label) => {
        try {
          const now = runtime.nowUtc();
          const s = stateRef.current.settings;
          const units = s.units === "metric" ? METRIC_UNITS : IMPERIAL_GOLF_UNITS;
          const base = `glm-shots-${label}-${fileStamp(now)}`;
          if (format === "csv") {
            runtime.download(`${base}.csv`, shotsToCsv(records, { displayUnits: units }), "text/csv");
          } else {
            runtime.download(
              `${base}.json`,
              shotsToJson(records, { exportedUtc: now, softwareVersion: SOFTWARE_VERSION }),
              "application/json",
            );
          }
        } catch (error) {
          dispatch({ type: "error", message: `Export failed: ${errorText(error)}` });
        }
      },
    };
  }, [runtime]);

  const unitSystem = settings.units === "metric" ? METRIC_UNITS : IMPERIAL_GOLF_UNITS;
  const value = useMemo<AppContextValue>(
    () => ({ state, dispatch, runtime, actions, unitSystem, environmentCheck }),
    [state, runtime, actions, unitSystem, environmentCheck],
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
