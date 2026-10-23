/**
 * App settings persisted to localStorage. Every read is validated field by field: a missing,
 * corrupt or unavailable store (private mode, quota, disabled storage) yields defaults and the
 * app still renders; a write failure is reported, never thrown.
 */
import { DEFAULT_BALL_PROFILE_ID, BALL_PROFILE_IDS } from "@glm/ballistics";
import { CLUB_CATEGORIES, type Club, type ClubCategory } from "@glm/shared-types";
import { SYNTHETIC_FIXTURES } from "@glm/shot-pipeline";
import { clampMonteCarloSamples, DEFAULT_MONTE_CARLO_SAMPLES } from "../pipeline/config";
import { DEFAULT_ENVIRONMENT_SETTINGS, type EnvironmentSettings } from "../pipeline/environment";
import type { SoftwareSourceId } from "../pipeline/sources";
import { isNoisePresetId, type NoisePresetId } from "../worker/protocol";

export type UnitPreference = "imperial" | "metric";
export type PrecisionPreference = "golfer" | "engineering";
export type ThemePreference = "dark" | "light";

export type AppSettings = {
  readonly units: UnitPreference;
  readonly precision: PrecisionPreference;
  readonly theme: ThemePreference;
  /** Enables manual entry. */
  readonly developerMode: boolean;
  /** Spin MODE 3. Default OFF: a generic spin is not about this shot. */
  readonly allowGenericSpinFallback: boolean;
  /** Diagnostic consent to keep raw observations in shot records. Default OFF. */
  readonly retainRawObservations: boolean;
  /** No effect until course play exists (Phase 5). Default OFF. */
  readonly allowProvisionalInCasual: boolean;
  readonly monteCarloSamples: number;
  /** ISO time the safety checklist was acknowledged; null = not yet. */
  readonly safetyAcknowledgedUtc: string | null;
  readonly dataSource: SoftwareSourceId;
  readonly playerId: string | null;
  readonly clubId: string | null;
  readonly ballProfileId: string;
  readonly environment: EnvironmentSettings;
  /** The bag: labels, categories and optional static loft. Never distances. */
  readonly bag: readonly Club[];
  readonly fixtureId: string;
  readonly noisePreset: NoisePresetId;
};

export const SETTINGS_STORAGE_KEY = "glm.desktop-ui.settings.v1";

/** Static lofts are left unknown (null): the app never invents equipment data. */
export const DEFAULT_BAG: readonly Club[] = Object.freeze([
  { id: "club-driver", label: "Driver", category: "driver", staticLoftDeg: null },
  { id: "club-3w", label: "3 Wood", category: "fairway-wood", staticLoftDeg: null },
  { id: "club-hybrid", label: "Hybrid", category: "hybrid", staticLoftDeg: null },
  { id: "club-5i", label: "5 Iron", category: "mid-iron", staticLoftDeg: null },
  { id: "club-7i", label: "7 Iron", category: "mid-iron", staticLoftDeg: null },
  { id: "club-9i", label: "9 Iron", category: "short-iron", staticLoftDeg: null },
  { id: "club-pw", label: "Pitching Wedge", category: "wedge", staticLoftDeg: null },
]);

export const DEFAULT_SETTINGS: AppSettings = Object.freeze({
  units: "imperial",
  precision: "golfer",
  theme: "dark",
  developerMode: false,
  allowGenericSpinFallback: false,
  retainRawObservations: false,
  allowProvisionalInCasual: false,
  monteCarloSamples: DEFAULT_MONTE_CARLO_SAMPLES,
  safetyAcknowledgedUtc: null,
  dataSource: "synthetic",
  playerId: null,
  clubId: null,
  ballProfileId: DEFAULT_BALL_PROFILE_ID,
  environment: DEFAULT_ENVIRONMENT_SETTINGS,
  bag: DEFAULT_BAG,
  fixtureId: "standard-7-iron",
  noisePreset: "clean",
});

/** The part of the Storage API we use. */
export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

/** localStorage if the browser allows it, else null (accessing it can itself throw). */
export function browserStorage(): StorageLike | null {
  try {
    const storage = (globalThis as { localStorage?: StorageLike }).localStorage;
    return storage ?? null;
  } catch {
    return null;
  }
}

type Raw = Readonly<Record<string, unknown>>;

const isRecord = (v: unknown): v is Raw => typeof v === "object" && v !== null && !Array.isArray(v);
const finiteOrNull = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

function pick<T>(raw: Raw, key: string, valid: (v: unknown) => v is T, fallback: T): T {
  const v = raw[key];
  return valid(v) ? v : fallback;
}

const isBool = (v: unknown): v is boolean => typeof v === "boolean";
const oneOf =
  <T extends string>(values: readonly T[]) =>
  (v: unknown): v is T =>
    typeof v === "string" && (values as readonly string[]).includes(v);
const isStringOrNull = (v: unknown): v is string | null => v === null || (typeof v === "string" && v.length > 0);

function sanitizeEnvironment(raw: unknown): EnvironmentSettings {
  if (!isRecord(raw)) return DEFAULT_ENVIRONMENT_SETTINGS;
  const d = DEFAULT_ENVIRONMENT_SETTINGS;
  return {
    indoor: pick(raw, "indoor", isBool, d.indoor),
    temperatureC: finiteOrNull(raw.temperatureC),
    relativeHumidity: finiteOrNull(raw.relativeHumidity),
    pressureSource: pick(raw, "pressureSource", oneOf(["pressure", "altitude"] as const), d.pressureSource),
    pressurePa: finiteOrNull(raw.pressurePa),
    altitudeM: finiteOrNull(raw.altitudeM),
    windSpeedMps: finiteOrNull(raw.windSpeedMps),
    windFromDeg: finiteOrNull(raw.windFromDeg) ?? d.windFromDeg,
  };
}

function sanitizeClub(raw: unknown): Club | null {
  if (!isRecord(raw)) return null;
  const { id, label, category } = raw;
  if (typeof id !== "string" || id.length === 0 || typeof label !== "string") return null;
  if (!(CLUB_CATEGORIES as readonly string[]).includes(category as string)) return null;
  return { id, label, category: category as ClubCategory, staticLoftDeg: finiteOrNull(raw.staticLoftDeg) };
}

function sanitizeBag(raw: unknown): readonly Club[] {
  if (!Array.isArray(raw)) return DEFAULT_BAG;
  const clubs: Club[] = [];
  for (const item of raw) {
    const club = sanitizeClub(item);
    if (club !== null && !clubs.some((c) => c.id === club.id)) clubs.push(club);
  }
  return clubs;
}

/** Field-by-field validation; anything unrecognised falls back to its default. */
export function sanitizeSettings(raw: unknown): AppSettings {
  if (!isRecord(raw)) return DEFAULT_SETTINGS;
  const d = DEFAULT_SETTINGS;
  const developerMode = pick(raw, "developerMode", isBool, d.developerMode);
  const bag = sanitizeBag(raw.bag);
  const requestedSource = pick(raw, "dataSource", oneOf(["synthetic", "replay", "manual"] as const), d.dataSource);
  const clubId = pick(raw, "clubId", isStringOrNull, d.clubId);
  const fixtureId = pick(raw, "fixtureId", (v): v is string => typeof v === "string", d.fixtureId);
  const ballProfileId = pick(raw, "ballProfileId", (v): v is string => typeof v === "string", d.ballProfileId);
  const safety = raw.safetyAcknowledgedUtc;
  return {
    units: pick(raw, "units", oneOf(["imperial", "metric"] as const), d.units),
    precision: pick(raw, "precision", oneOf(["golfer", "engineering"] as const), d.precision),
    theme: pick(raw, "theme", oneOf(["dark", "light"] as const), d.theme),
    developerMode,
    allowGenericSpinFallback: pick(raw, "allowGenericSpinFallback", isBool, d.allowGenericSpinFallback),
    retainRawObservations: pick(raw, "retainRawObservations", isBool, d.retainRawObservations),
    allowProvisionalInCasual: pick(raw, "allowProvisionalInCasual", isBool, d.allowProvisionalInCasual),
    monteCarloSamples: clampMonteCarloSamples(finiteOrNull(raw.monteCarloSamples) ?? d.monteCarloSamples),
    safetyAcknowledgedUtc: typeof safety === "string" && !Number.isNaN(Date.parse(safety)) ? safety : null,
    // Manual entry is a developer tool: never restored without developer mode.
    dataSource: requestedSource === "manual" && !developerMode ? "synthetic" : requestedSource,
    playerId: pick(raw, "playerId", isStringOrNull, d.playerId),
    clubId: clubId !== null && bag.some((c) => c.id === clubId) ? clubId : null,
    ballProfileId: BALL_PROFILE_IDS.includes(ballProfileId) ? ballProfileId : d.ballProfileId,
    environment: sanitizeEnvironment(raw.environment),
    bag,
    fixtureId: SYNTHETIC_FIXTURES.some((f) => f.id === fixtureId) ? fixtureId : d.fixtureId,
    noisePreset: pick(raw, "noisePreset", isNoisePresetId, d.noisePreset),
  };
}

export function loadSettings(storage: StorageLike | null): AppSettings {
  if (storage === null) return DEFAULT_SETTINGS;
  try {
    const text = storage.getItem(SETTINGS_STORAGE_KEY);
    return text === null ? DEFAULT_SETTINGS : sanitizeSettings(JSON.parse(text));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Returns false (never throws) when the settings could not be stored. */
export function saveSettings(storage: StorageLike | null, settings: AppSettings): boolean {
  if (storage === null) return false;
  try {
    storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}
