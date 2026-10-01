/**
 * Environment model: moist-air density, air viscosity, ISA station pressure, and the
 * EnvironmentProfile factory (docs/physics-model.md §7).
 *
 * Air density and viscosity are ALWAYS computed here from temperature, pressure, and
 * humidity; they are never accepted as inputs, so a profile cannot carry a density that
 * disagrees with its own thermodynamic state.
 */
import { deepFreeze } from "@glm/shared-types";
import type { EnvironmentFieldSource, EnvironmentProfile, Vec3 } from "@glm/shared-types";
import { ENVIRONMENT_MODEL_VERSION } from "./versions";

/** Specific gas constant of dry air, J/(kg*K). */
export const R_DRY_AIR = 287.058;
/** Specific gas constant of water vapour, J/(kg*K). */
export const R_WATER_VAPOR = 461.495;
export const KELVIN_OFFSET = 273.15;

/** Sutherland's law constants for air. */
export const SUTHERLAND_MU0_PAS = 1.716e-5;
export const SUTHERLAND_T0_K = 273.15;
export const SUTHERLAND_S_K = 110.4;

/** ISA troposphere constants. */
export const ISA_SEA_LEVEL_PRESSURE_PA = 101325;
export const ISA_SEA_LEVEL_TEMPERATURE_K = 288.15;
export const ISA_LAPSE_RATE_K_PER_M = 0.0065;
/** g0*M/(R*L) for the ISA troposphere. */
export const ISA_PRESSURE_EXPONENT = 5.25588;
export const ISA_TROPOSPHERE_TOP_M = 11000;

export const STANDARD_GRAVITY_MPS2 = 9.80665;

/** Validation ranges applied by createEnvironmentProfile (inclusive). */
export const ENVIRONMENT_LIMITS = {
  temperatureC: { min: -40, max: 55 },
  pressurePa: { min: 30000, max: 115000 },
  relativeHumidity: { min: 0, max: 1 },
  altitudeM: { min: -500, max: 9000 },
  windSpeedMps: { min: 0, max: 40 },
  gravityMps2: { min: 9.5, max: 10.0 },
} as const;

/**
 * Saturation vapour pressure over liquid water, Pa (Buck 1981 / Arden Buck equation):
 * p_sat[hPa] = 6.1121 * exp((18.678 - T/234.5) * (T / (257.14 + T))), T in deg C.
 * The fit is published for roughly -40..+50 deg C; values outside are extrapolations.
 */
export function saturationVaporPressurePa(temperatureC: number): number {
  if (!Number.isFinite(temperatureC) || temperatureC < -80 || temperatureC > 70) {
    throw new RangeError(
      `saturationVaporPressurePa: temperatureC must be a finite value in [-80, 70] deg C, got ${temperatureC}`,
    );
  }
  const t = temperatureC;
  return 100 * 6.1121 * Math.exp((18.678 - t / 234.5) * (t / (257.14 + t)));
}

export type MoistAirInput = {
  readonly temperatureC: number;
  /** Absolute (station) pressure, Pa. */
  readonly pressurePa: number;
  /** 0 to 1. */
  readonly relativeHumidity: number;
};

/**
 * Moist-air density as an ideal-gas mixture of dry air and water vapour, kg/m^3:
 * rho = p_d / (R_d T) + p_v / (R_v T), p_v = RH * p_sat(T), p_d = p - p_v.
 * Humid air is LESS dense than dry air at the same pressure because water vapour
 * (M = 18 g/mol) displaces heavier N2/O2 (M ~ 29 g/mol). The vapour-pressure enhancement
 * factor and air compressibility (both < 0.5 % effects) are neglected.
 */
export function computeMoistAirDensity(input: MoistAirInput): number {
  const { temperatureC, pressurePa, relativeHumidity } = input;
  if (!Number.isFinite(pressurePa) || pressurePa <= 0) {
    throw new RangeError(`computeMoistAirDensity: pressurePa must be a positive finite number, got ${pressurePa}`);
  }
  if (!Number.isFinite(relativeHumidity) || relativeHumidity < 0 || relativeHumidity > 1) {
    throw new RangeError(
      `computeMoistAirDensity: relativeHumidity must be a fraction in [0, 1] (e.g. 0.5 for 50 %), got ${relativeHumidity}`,
    );
  }
  const temperatureK = temperatureC + KELVIN_OFFSET;
  const vaporPa = relativeHumidity * saturationVaporPressurePa(temperatureC);
  if (vaporPa >= pressurePa) {
    throw new RangeError(
      `computeMoistAirDensity: vapour pressure ${vaporPa.toFixed(1)} Pa exceeds total pressure ${pressurePa} Pa; check units (pressure must be absolute Pa)`,
    );
  }
  const dryPa = pressurePa - vaporPa;
  return dryPa / (R_DRY_AIR * temperatureK) + vaporPa / (R_WATER_VAPOR * temperatureK);
}

/**
 * Dynamic viscosity of air, Pa*s, by Sutherland's law:
 * mu = mu0 * (T/T0)^1.5 * (T0 + S) / (T + S). Humidity's effect on viscosity (~1 %) is neglected.
 */
export function computeAirDynamicViscosity(temperatureC: number): number {
  const temperatureK = temperatureC + KELVIN_OFFSET;
  if (!Number.isFinite(temperatureK) || temperatureK <= 0) {
    throw new RangeError(`computeAirDynamicViscosity: temperatureC must be finite and above absolute zero, got ${temperatureC}`);
  }
  return (
    SUTHERLAND_MU0_PAS *
    Math.pow(temperatureK / SUTHERLAND_T0_K, 1.5) *
    ((SUTHERLAND_T0_K + SUTHERLAND_S_K) / (temperatureK + SUTHERLAND_S_K))
  );
}

/**
 * Station (absolute) pressure from altitude using the ISA troposphere:
 * p = p0 * (1 - L*h/T0)^(g0*M/(R*L)). Valid for 0..11 km only (throws outside).
 * `seaLevelPressurePa` lets a caller pass a reported sea-level pressure (QNH); the ISA
 * temperature profile is still assumed, so the result is an approximation. A real station
 * pressure reading should always be preferred over this derivation.
 */
export function stationPressureFromAltitude(altitudeM: number, seaLevelPressurePa = ISA_SEA_LEVEL_PRESSURE_PA): number {
  if (!Number.isFinite(altitudeM) || altitudeM < 0 || altitudeM > ISA_TROPOSPHERE_TOP_M) {
    throw new RangeError(
      `stationPressureFromAltitude: altitudeM must be in [0, ${ISA_TROPOSPHERE_TOP_M}] m (ISA troposphere), got ${altitudeM}; ` +
        "for sites below sea level supply a measured pressurePa instead",
    );
  }
  if (!Number.isFinite(seaLevelPressurePa) || seaLevelPressurePa <= 0) {
    throw new RangeError(`stationPressureFromAltitude: seaLevelPressurePa must be a positive finite number, got ${seaLevelPressurePa}`);
  }
  const ratio = 1 - (ISA_LAPSE_RATE_K_PER_M * altitudeM) / ISA_SEA_LEVEL_TEMPERATURE_K;
  return seaLevelPressurePa * Math.pow(ratio, ISA_PRESSURE_EXPONENT);
}

type FieldSources = EnvironmentProfile["fieldSources"];

export type EnvironmentInput = {
  readonly temperatureC?: number;
  /** Absolute (station) pressure, Pa — NOT the sea-level-corrected pressure of a weather report. */
  readonly pressurePa?: number;
  /** 0 to 1. */
  readonly relativeHumidity?: number;
  readonly altitudeM?: number;
  /** World-frame wind velocity (direction the air moves toward), m/s. */
  readonly windMps?: Vec3;
  readonly indoorMode?: boolean;
  readonly gravityMps2?: number;
  /**
   * Overrides the provenance of SUPPLIED fields (default "user"): "user", "sensor" or
   * "derived". Omit a field (never pass null) to get its default with fieldSource "default".
   */
  readonly fieldSources?: Partial<FieldSources>;
};

export const ENVIRONMENT_DEFAULTS = {
  temperatureC: 20,
  relativeHumidity: 0.5,
  altitudeM: 0,
  pressurePa: ISA_SEA_LEVEL_PRESSURE_PA,
  windMps: { x: 0, y: 0, z: 0 },
  indoorMode: true,
  gravityMps2: STANDARD_GRAVITY_MPS2,
} as const;

function checkRange(name: string, value: number, range: { readonly min: number; readonly max: number }, hint: string): void {
  if (!Number.isFinite(value) || value < range.min || value > range.max) {
    throw new RangeError(`createEnvironmentProfile: ${name} must be in [${range.min}, ${range.max}]${hint}, got ${value}`);
  }
}

const FIELD_SOURCE_FIELDS: readonly (keyof FieldSources)[] = [
  "temperatureC",
  "pressurePa",
  "relativeHumidity",
  "altitudeM",
  "windMps",
];

/**
 * Provenance a caller may state for a value it SUPPLIES. "default" is reserved for values the
 * factory fills in (a supplied value is never a default); "derived" is allowed for values the
 * caller computed from other quantities (e.g. station pressure from a reported QNH).
 */
const SUPPLIED_FIELD_SOURCES: readonly EnvironmentFieldSource[] = ["user", "sensor", "derived"];

/** Input fields that may be omitted but never null (null would hide an unavailable value). */
const NULL_REJECTED_FIELDS: readonly (keyof EnvironmentInput)[] = [
  "temperatureC",
  "pressurePa",
  "relativeHumidity",
  "altitudeM",
  "windMps",
  "indoorMode",
  "gravityMps2",
  "fieldSources",
];

/**
 * Rejects null fields. Values are resolved by omission (undefined => default, fieldSource
 * "default"); treating null as "missing" for the value but "supplied" for provenance would
 * label a made-up default as user data, so null is refused outright.
 */
function rejectNullFields(input: EnvironmentInput): void {
  const record = input as Readonly<Record<string, unknown>>;
  for (const name of NULL_REJECTED_FIELDS) {
    if (record[name] === null) {
      throw new RangeError(
        `createEnvironmentProfile: ${name} is null; omit the field to use the default (fieldSource "default") ` +
          "or supply a value. An unavailable measurement must not be passed as null",
      );
    }
  }
}

function validateFieldSourceOverrides(overrides: Partial<FieldSources> | undefined): void {
  if (overrides === undefined) return;
  for (const key of Object.keys(overrides)) {
    if (!(FIELD_SOURCE_FIELDS as readonly string[]).includes(key)) {
      throw new RangeError(
        `createEnvironmentProfile: fieldSources.${key} is not a provenance field (allowed: ${FIELD_SOURCE_FIELDS.join(", ")})`,
      );
    }
  }
}

function resolveSource(
  field: keyof FieldSources,
  supplied: boolean,
  overrides: Partial<FieldSources> | undefined,
  fallback: EnvironmentFieldSource,
): EnvironmentFieldSource {
  const override = overrides?.[field];
  if (override === undefined) return supplied ? "user" : fallback;
  if (!supplied) {
    throw new Error(
      `createEnvironmentProfile: fieldSources.${field} = "${override}" was given but ${field} was not supplied; ` +
        "provenance can only be stated for a value that is actually provided",
    );
  }
  if (override === "default") {
    throw new RangeError(
      `createEnvironmentProfile: fieldSources.${field} = "default" is reserved for values the factory fills in; ` +
        `omit ${field} to use the default instead of supplying a value`,
    );
  }
  if (!SUPPLIED_FIELD_SOURCES.includes(override)) {
    throw new RangeError(
      `createEnvironmentProfile: fieldSources.${field} must be one of ${SUPPLIED_FIELD_SOURCES.map((v) => `"${v}"`).join(", ")} ` +
        `for a supplied value, got ${JSON.stringify(override)}`,
    );
  }
  return override;
}

/**
 * Builds a validated, deep-frozen EnvironmentProfile.
 *
 * - Missing (undefined) fields take ENVIRONMENT_DEFAULTS with fieldSource "default";
 *   supplied fields get "user" unless `fieldSources` overrides them with "user", "sensor"
 *   or "derived". Null fields, unknown or invalid overrides, and a "default" override for a
 *   supplied value are rejected, so a made-up value can never carry user/sensor provenance.
 * - Missing pressure with a supplied altitude is derived from the ISA troposphere
 *   (fieldSource "derived"); with neither, 101325 Pa "default".
 * - airDensityKgM3 and airDynamicViscosityPaS are always computed.
 */
export function createEnvironmentProfile(input: EnvironmentInput): EnvironmentProfile {
  if (input === null || typeof input !== "object") {
    throw new TypeError(`createEnvironmentProfile: input must be an object (use {} for all defaults), got ${String(input)}`);
  }
  rejectNullFields(input);
  const limits = ENVIRONMENT_LIMITS;
  const overrides = input.fieldSources;
  validateFieldSourceOverrides(overrides);

  const temperatureC = input.temperatureC ?? ENVIRONMENT_DEFAULTS.temperatureC;
  checkRange("temperatureC", temperatureC, limits.temperatureC, " deg C");

  const relativeHumidity = input.relativeHumidity ?? ENVIRONMENT_DEFAULTS.relativeHumidity;
  checkRange("relativeHumidity", relativeHumidity, limits.relativeHumidity, " (a fraction: 0.5 means 50 %)");

  const altitudeM = input.altitudeM ?? ENVIRONMENT_DEFAULTS.altitudeM;
  checkRange("altitudeM", altitudeM, limits.altitudeM, " m");

  let pressurePa: number;
  let pressureFallback: EnvironmentFieldSource = "default";
  if (input.pressurePa !== undefined) {
    pressurePa = input.pressurePa;
  } else if (input.altitudeM !== undefined) {
    pressurePa = stationPressureFromAltitude(altitudeM);
    pressureFallback = "derived";
  } else {
    pressurePa = ENVIRONMENT_DEFAULTS.pressurePa;
  }
  checkRange(
    "pressurePa",
    pressurePa,
    limits.pressurePa,
    " Pa (absolute station pressure; 1 hPa = 100 Pa, 1 inHg = 3386.389 Pa)",
  );

  const wind = input.windMps ?? ENVIRONMENT_DEFAULTS.windMps;
  if (!Number.isFinite(wind.x) || !Number.isFinite(wind.y) || !Number.isFinite(wind.z)) {
    throw new RangeError(`createEnvironmentProfile: windMps components must be finite m/s, got (${wind.x}, ${wind.y}, ${wind.z})`);
  }
  const windSpeed = Math.hypot(wind.x, wind.y, wind.z);
  checkRange("|windMps|", windSpeed, limits.windSpeedMps, " m/s");

  const indoorMode = input.indoorMode ?? ENVIRONMENT_DEFAULTS.indoorMode;
  if (typeof indoorMode !== "boolean") {
    throw new TypeError(`createEnvironmentProfile: indoorMode must be a boolean, got ${JSON.stringify(indoorMode)}`);
  }
  if (indoorMode && windSpeed > 0) {
    throw new Error(
      `createEnvironmentProfile: windMps is non-zero (${windSpeed.toFixed(2)} m/s) but indoorMode is ${
        input.indoorMode === undefined ? "true (the default)" : "true"
      }; pass indoorMode: false for outdoor conditions, or omit windMps`,
    );
  }

  const gravityMps2 = input.gravityMps2 ?? ENVIRONMENT_DEFAULTS.gravityMps2;
  checkRange("gravityMps2", gravityMps2, limits.gravityMps2, " m/s^2");

  const fieldSources: FieldSources = {
    temperatureC: resolveSource("temperatureC", input.temperatureC !== undefined, overrides, "default"),
    pressurePa: resolveSource("pressurePa", input.pressurePa !== undefined, overrides, pressureFallback),
    relativeHumidity: resolveSource("relativeHumidity", input.relativeHumidity !== undefined, overrides, "default"),
    altitudeM: resolveSource("altitudeM", input.altitudeM !== undefined, overrides, "default"),
    windMps: resolveSource("windMps", input.windMps !== undefined, overrides, "default"),
  };

  const profile: EnvironmentProfile = {
    version: ENVIRONMENT_MODEL_VERSION,
    temperatureC,
    pressurePa,
    relativeHumidity,
    altitudeM,
    airDensityKgM3: computeMoistAirDensity({ temperatureC, pressurePa, relativeHumidity }),
    airDynamicViscosityPaS: computeAirDynamicViscosity(temperatureC),
    windMps: { x: wind.x, y: wind.y, z: wind.z },
    gravityMps2,
    indoorMode,
    fieldSources,
  };
  return deepFreeze(profile);
}

/** 20 deg C, 50 % RH, 101325 Pa, no wind, indoor, standard gravity. Every field source "default". */
export const DEFAULT_INDOOR_ENVIRONMENT: EnvironmentProfile = createEnvironmentProfile({});
