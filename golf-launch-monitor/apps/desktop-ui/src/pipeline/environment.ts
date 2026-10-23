/**
 * Setup-screen environment settings -> EnvironmentInput for createEnvironmentProfile.
 *
 * A blank field is OMITTED (never sent as null or a guessed number), so the ballistics package
 * fills its documented default and labels it fieldSource "default"; the UI shows that label.
 * Air density is always derived by @glm/ballistics, never entered.
 */
import { createEnvironmentProfile, type EnvironmentInput } from "@glm/ballistics";
import type { EnvironmentProfile, Vec3 } from "@glm/shared-types";

export type PressureSource = "pressure" | "altitude";

export type EnvironmentSettings = {
  readonly indoor: boolean;
  readonly temperatureC: number | null;
  /** 0..1 (the UI edits percent). */
  readonly relativeHumidity: number | null;
  /** Which input determines station pressure: a barometer reading OR the site altitude (ISA). */
  readonly pressureSource: PressureSource;
  /** Absolute (station) pressure, Pa; used only when pressureSource is "pressure". */
  readonly pressurePa: number | null;
  /** Used only when pressureSource is "altitude". */
  readonly altitudeM: number | null;
  /** Outdoor only. null = no wind entered. */
  readonly windSpeedMps: number | null;
  /** Direction the wind blows FROM, degrees clockwise from the target: 0 = headwind, 90 = from the right, 180 = tailwind. */
  readonly windFromDeg: number;
};

export const DEFAULT_ENVIRONMENT_SETTINGS: EnvironmentSettings = Object.freeze({
  indoor: true,
  temperatureC: null,
  relativeHumidity: null,
  pressureSource: "pressure",
  pressurePa: null,
  altitudeM: null,
  windSpeedMps: null,
  windFromDeg: 0,
});

/**
 * World-frame wind velocity (the direction the air moves TOWARD; +X downrange, +Y left) for a
 * wind blowing FROM `fromDeg` (clockwise from the target as the golfer faces it):
 * from the target (0°) the air moves toward the golfer (-X); from the right (90°) it moves
 * toward the golfer's left (+Y); from behind (180°) it moves downrange (+X).
 */
export function windVectorFrom(speedMps: number, fromDeg: number): Vec3 {
  const a = (fromDeg * Math.PI) / 180;
  const clean = (v: number): number => (Math.abs(v) < 1e-12 ? 0 : v);
  return { x: clean(-speedMps * Math.cos(a)), y: clean(speedMps * Math.sin(a)), z: 0 };
}

export function environmentInput(env: EnvironmentSettings): EnvironmentInput {
  const input: { -readonly [K in keyof EnvironmentInput]: EnvironmentInput[K] } = { indoorMode: env.indoor };
  if (env.temperatureC !== null) input.temperatureC = env.temperatureC;
  if (env.relativeHumidity !== null) input.relativeHumidity = env.relativeHumidity;
  if (env.pressureSource === "pressure" && env.pressurePa !== null) input.pressurePa = env.pressurePa;
  if (env.pressureSource === "altitude" && env.altitudeM !== null) input.altitudeM = env.altitudeM;
  // Wind exists only outdoors; indoors it is never sent (the factory rejects indoor wind).
  if (!env.indoor && env.windSpeedMps !== null && env.windSpeedMps > 0) {
    input.windMps = windVectorFrom(env.windSpeedMps, env.windFromDeg);
  }
  return input;
}

export type EnvironmentCheck =
  | { readonly ok: true; readonly profile: EnvironmentProfile }
  | { readonly ok: false; readonly error: string };

/** Builds the profile exactly as the worker will, so the Setup screen can show density or the error. */
export function checkEnvironment(env: EnvironmentSettings): EnvironmentCheck {
  try {
    return { ok: true, profile: createEnvironmentProfile(environmentInput(env)) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
