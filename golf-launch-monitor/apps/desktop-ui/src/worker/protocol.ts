/**
 * Messages between the UI thread and the shot-pipeline worker. Everything here must survive
 * structured cloning: no functions, no class instances. Ids and clocks are injected on the
 * worker side (the pipeline packages never read clocks themselves).
 */
import type { EnvironmentInput } from "@glm/ballistics";
import type {
  CalibrationStatus,
  ClubCategory,
  DataOrigin,
  Handedness,
  SensorHealth,
  SensorKind,
  ShotRecord,
} from "@glm/shared-types";

export const NOISE_PRESET_IDS = ["clean", "realistic", "poor-sync", "no-spin-observed"] as const;
export type NoisePresetId = (typeof NOISE_PRESET_IDS)[number];

/** Serialisable pipeline settings: PipelineConfig minus objects the worker builds itself. */
export type PipelineSettings = {
  readonly sessionId: string;
  readonly playerId: string | null;
  readonly handedness: Handedness;
  readonly clubId: string | null;
  readonly clubCategory: ClubCategory | null;
  readonly ballProfileId: string;
  /** Passed to createEnvironmentProfile; omitted fields become defaults (fieldSource "default"). */
  readonly environment: EnvironmentInput;
  readonly monteCarloSamples: number;
  readonly allowGenericSpinFallback: boolean;
  readonly storeRawObservations: boolean;
};

/** Developer-only manual entry, in golfer terms (signs per docs/coordinate-system.md). */
export type ManualLaunchFields = {
  readonly ballSpeedMph: number;
  readonly verticalLaunchDeg: number;
  /** Positive = LEFT of the target line (internal convention). */
  readonly horizontalLaunchDegLeftPositive: number;
  /** null = spin not entered (no spin observation is emitted). */
  readonly totalSpinRpm: number | null;
  /** Positive = curves RIGHT. null = not entered. */
  readonly spinAxisDegRightPositive: number | null;
};

export type UiToWorkerMessage =
  | { readonly type: "configure"; readonly config: PipelineSettings }
  | {
      readonly type: "hit-synthetic";
      readonly fixtureId: string;
      readonly seed: number;
      readonly noisePreset: NoisePresetId;
    }
  | { readonly type: "load-replay"; readonly text: string; readonly fileName?: string }
  | { readonly type: "replay-next-shot" }
  | ({ readonly type: "manual-launch" } & ManualLaunchFields)
  | { readonly type: "request-health" };

/** What the UI may show about a loaded replay file (never its synthetic truth values). */
export type ReplayHeaderSummary = {
  readonly formatVersion: string;
  readonly coordinateSystemVersion: string;
  /** dataOrigin written in the file header. */
  readonly recordedDataOrigin: DataOrigin;
  /** dataOrigin the shots get on playback ("live" recordings become "replay"). */
  readonly playbackDataOrigin: DataOrigin;
  readonly createdUtc: string;
  readonly description: string;
  readonly sensorId: string;
  readonly sensorKind: SensorKind;
  readonly sensorDescription: string;
  readonly sensorConfigurationVersion: string;
  readonly calibrationVersion: string | null;
  readonly calibrationStatus: CalibrationStatus;
  /** Synthetic files carry ground truth for validation tooling; the pipeline never reads it. */
  readonly hasSyntheticTruth: boolean;
};

export type ShotSourceKind = "synthetic" | "replay" | "manual";

export type WorkerToUiMessage =
  | {
      readonly type: "shot";
      readonly record: ShotRecord;
      /** Wall time the pipeline spent on this shot (fit + simulation + Monte Carlo), ms. */
      readonly processingMs: number;
      readonly source: ShotSourceKind;
    }
  | { readonly type: "error"; readonly message: string }
  | {
      readonly type: "replay-loaded";
      readonly fileName: string | null;
      readonly shotCount: number;
      readonly header: ReplayHeaderSummary;
      readonly warnings: readonly string[];
    }
  | { readonly type: "replay-progress"; readonly delivered: number; readonly shotCount: number; readonly exhausted: boolean }
  | { readonly type: "busy"; readonly busy: boolean }
  | { readonly type: "health"; readonly health: SensorHealth | null; readonly adapterKind: SensorKind | null };

export function isNoisePresetId(value: unknown): value is NoisePresetId {
  return typeof value === "string" && (NOISE_PRESET_IDS as readonly string[]).includes(value);
}
