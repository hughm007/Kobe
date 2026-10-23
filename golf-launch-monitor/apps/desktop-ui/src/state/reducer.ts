/**
 * App state and its pure reducer. Side effects (worker messages, IndexedDB, localStorage) live
 * in AppContext; this module only decides the next state.
 */
import type { DataOrigin, Player, SensorHealth, SensorKind, ShotRecord } from "@glm/shared-types";
import type { EnvironmentSettings } from "../pipeline/environment";
import type { SoftwareSourceId } from "../pipeline/sources";
import type { ReplayHeaderSummary } from "../worker/protocol";
import type { RunnerKind } from "../worker/runner-api";
import type { AppSettings } from "./settings";

export const SCREEN_IDS = [
  "safety",
  "setup",
  "calibration",
  "range",
  "review",
  "history",
  "players",
  "equipment",
  "diagnostics",
  "settings",
] as const;
export type ScreenId = (typeof SCREEN_IDS)[number];

export type ReplayInfo = {
  readonly fileName: string | null;
  readonly shotCount: number;
  readonly delivered: number;
  readonly exhausted: boolean;
  readonly header: ReplayHeaderSummary;
  readonly warnings: readonly string[];
};

export type HealthInfo = {
  readonly health: SensorHealth | null;
  readonly adapterKind: SensorKind | null;
};

export type AppState = {
  readonly settings: AppSettings;
  readonly screen: ScreenId;
  readonly sessionId: string;
  readonly sessionStartedUtc: string;
  /** Shots of the current session, oldest first. */
  readonly shots: readonly ShotRecord[];
  /** Shot shown on the Range screen (normally the latest). */
  readonly currentShotId: string | null;
  /** Shot opened on the Shot review screen (may come from a stored session). */
  readonly reviewShot: ShotRecord | null;
  readonly busy: boolean;
  readonly lastProcessingMs: number | null;
  readonly lastError: string | null;
  readonly replay: ReplayInfo | null;
  /** Seed for the next synthetic shot; auto-increments after each hit. */
  readonly nextSeed: number;
  readonly health: HealthInfo | null;
  readonly players: readonly Player[];
  readonly runnerKind: RunnerKind;
  /** Last persistence problem (IndexedDB or localStorage), shown on Diagnostics and as a notice. */
  readonly storageError: string | null;
};

export type AppAction =
  | { readonly type: "navigate"; readonly screen: ScreenId }
  | {
      readonly type: "settings-patched";
      readonly patch: Partial<AppSettings>;
      /** Used only if the patch changes the data source (a session never mixes data streams). */
      readonly nextSession: { readonly sessionId: string; readonly utc: string };
    }
  | { readonly type: "environment-patched"; readonly patch: Partial<EnvironmentSettings> }
  | { readonly type: "safety-acknowledged"; readonly utc: string }
  | { readonly type: "data-source-changed"; readonly source: SoftwareSourceId; readonly sessionId: string; readonly utc: string }
  | { readonly type: "session-started"; readonly sessionId: string; readonly utc: string }
  | { readonly type: "shot-received"; readonly record: ShotRecord; readonly processingMs: number }
  | { readonly type: "busy"; readonly busy: boolean }
  | { readonly type: "error"; readonly message: string }
  | { readonly type: "error-dismissed" }
  | { readonly type: "replay-loaded"; readonly info: Omit<ReplayInfo, "delivered" | "exhausted">; readonly sessionId: string; readonly utc: string }
  | { readonly type: "replay-progress"; readonly delivered: number; readonly exhausted: boolean }
  | { readonly type: "seed-set"; readonly seed: number }
  | { readonly type: "health"; readonly info: HealthInfo }
  | { readonly type: "players-loaded"; readonly players: readonly Player[] }
  | { readonly type: "player-saved"; readonly player: Player }
  | { readonly type: "player-deleted"; readonly playerId: string; readonly deletedShots: boolean }
  | { readonly type: "review-shot"; readonly record: ShotRecord }
  | { readonly type: "current-shot"; readonly shotId: string }
  | { readonly type: "session-deleted"; readonly sessionId: string }
  | { readonly type: "storage-error"; readonly message: string | null };

export type InitialStateInput = {
  readonly settings: AppSettings;
  readonly sessionId: string;
  readonly sessionStartedUtc: string;
  readonly runnerKind: RunnerKind;
};

export function createInitialState(input: InitialStateInput): AppState {
  return {
    settings: input.settings,
    screen: input.settings.safetyAcknowledgedUtc === null ? "safety" : "range",
    sessionId: input.sessionId,
    sessionStartedUtc: input.sessionStartedUtc,
    shots: [],
    currentShotId: null,
    reviewShot: null,
    busy: false,
    lastProcessingMs: null,
    lastError: null,
    replay: null,
    nextSeed: 1,
    health: null,
    players: [],
    runnerKind: input.runnerKind,
    storageError: null,
  };
}

function newSession(state: AppState, sessionId: string, utc: string): AppState {
  return { ...state, sessionId, sessionStartedUtc: utc, shots: [], currentShotId: null };
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "navigate":
      return { ...state, screen: action.screen };
    case "settings-patched": {
      const merged = { ...state.settings, ...action.patch };
      // Turning developer mode off also turns its tool off.
      const dataSource = !merged.developerMode && merged.dataSource === "manual" ? "synthetic" : merged.dataSource;
      const next = { ...state, settings: { ...merged, dataSource } };
      if (dataSource === state.settings.dataSource) return next;
      // A session holds one data stream: a source change (here or via data-source-changed) starts a new session.
      return newSession(next, action.nextSession.sessionId, action.nextSession.utc);
    }
    case "environment-patched":
      return { ...state, settings: { ...state.settings, environment: { ...state.settings.environment, ...action.patch } } };
    case "safety-acknowledged":
      return {
        ...state,
        settings: { ...state.settings, safetyAcknowledgedUtc: action.utc },
        screen: state.screen === "safety" ? "range" : state.screen,
      };
    case "data-source-changed":
      if (action.source === state.settings.dataSource) return state;
      // A session holds one data stream: switching source starts a new session.
      return newSession({ ...state, settings: { ...state.settings, dataSource: action.source } }, action.sessionId, action.utc);
    case "session-started":
      return newSession(state, action.sessionId, action.utc);
    case "shot-received": {
      const { record } = action;
      // Shots of a session that is no longer current (e.g. after a source switch) are stored, not shown.
      if (record.sessionId !== state.sessionId) return { ...state, lastProcessingMs: action.processingMs };
      return {
        ...state,
        shots: [...state.shots.filter((s) => s.shotId !== record.shotId), record],
        currentShotId: record.shotId,
        lastProcessingMs: action.processingMs,
        lastError: null,
      };
    }
    case "busy":
      return { ...state, busy: action.busy };
    case "error":
      return { ...state, lastError: action.message };
    case "error-dismissed":
      return { ...state, lastError: null };
    case "replay-loaded":
      return {
        ...newSession(state, action.sessionId, action.utc),
        replay: { ...action.info, delivered: 0, exhausted: action.info.shotCount === 0 },
        lastError: null,
      };
    case "replay-progress":
      return state.replay === null
        ? state
        : { ...state, replay: { ...state.replay, delivered: action.delivered, exhausted: action.exhausted } };
    case "seed-set":
      return { ...state, nextSeed: Number.isSafeInteger(action.seed) && action.seed >= 0 ? action.seed : state.nextSeed };
    case "health":
      return { ...state, health: action.info };
    case "players-loaded":
      return { ...state, players: action.players };
    case "player-saved": {
      const exists = state.players.some((p) => p.id === action.player.id);
      const players = exists
        ? state.players.map((p) => (p.id === action.player.id ? action.player : p))
        : [...state.players, action.player];
      return { ...state, players };
    }
    case "player-deleted": {
      const players = state.players.filter((p) => p.id !== action.playerId);
      const settings =
        state.settings.playerId === action.playerId ? { ...state.settings, playerId: null } : state.settings;
      const shots = action.deletedShots ? state.shots.filter((s) => s.launch.playerId !== action.playerId) : state.shots;
      const currentShotId = shots.some((s) => s.shotId === state.currentShotId) ? state.currentShotId : (shots.at(-1)?.shotId ?? null);
      const reviewShot =
        action.deletedShots && state.reviewShot?.launch.playerId === action.playerId ? null : state.reviewShot;
      return { ...state, players, settings, shots, currentShotId, reviewShot };
    }
    case "review-shot":
      return { ...state, reviewShot: action.record, screen: "review" };
    case "current-shot":
      return state.shots.some((s) => s.shotId === action.shotId) ? { ...state, currentShotId: action.shotId } : state;
    case "session-deleted": {
      const reviewShot = state.reviewShot?.sessionId === action.sessionId ? null : state.reviewShot;
      if (action.sessionId !== state.sessionId) return { ...state, reviewShot };
      return { ...state, reviewShot, shots: [], currentShotId: null };
    }
    case "storage-error":
      return { ...state, storageError: action.message };
    default: {
      const unknown: never = action;
      throw new Error(`appReducer: unknown action ${JSON.stringify(unknown)}`);
    }
  }
}

export function currentShot(state: AppState): ShotRecord | null {
  return state.shots.find((s) => s.shotId === state.currentShotId) ?? null;
}

/** Origin of the data stream the app is currently set up for. Phase 1 has no live source. */
export function activeDataOrigin(state: AppState): DataOrigin {
  switch (state.settings.dataSource) {
    case "synthetic":
      return "synthetic";
    case "manual":
      return "manual";
    case "replay":
      return state.replay?.header.playbackDataOrigin ?? "replay";
  }
}
