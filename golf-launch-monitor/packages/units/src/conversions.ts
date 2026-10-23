/**
 * Exact unit conversion constants and functions. Internal computation is SI; these are
 * used only at display/export boundaries (docs/coordinate-system.md §9).
 */

/** International yard (exact, 1959 agreement). */
export const METERS_PER_YARD = 0.9144;
/** International foot (exact). */
export const METERS_PER_FOOT = 0.3048;
/** International inch (exact). */
export const METERS_PER_INCH = 0.0254;
export const METERS_PER_MILLIMETER = 0.001;
/** 1 mph = 1609.344 m / 3600 s (exact). */
export const MPS_PER_MPH = 0.44704;
/** 1 km/h = 1000 m / 3600 s. */
export const MPS_PER_KMH = 1000 / 3600;
export const RAD_PER_DEG = Math.PI / 180;
export const DEG_PER_RAD = 180 / Math.PI;
/** 1 rpm = 2*pi rad / 60 s. */
export const RAD_PER_SEC_PER_RPM = (2 * Math.PI) / 60;
/** Conventional inch of mercury at 0 °C, standard gravity (Pa). */
export const PA_PER_INHG = 3386.389;
export const PA_PER_HPA = 100;
export const KELVIN_OFFSET = 273.15;
export const KG_PER_GRAM = 0.001;

export const metersToYards = (m: number): number => m / METERS_PER_YARD;
export const yardsToMeters = (yd: number): number => yd * METERS_PER_YARD;
export const metersToFeet = (m: number): number => m / METERS_PER_FOOT;
export const feetToMeters = (ft: number): number => ft * METERS_PER_FOOT;
export const metersToInches = (m: number): number => m / METERS_PER_INCH;
export const inchesToMeters = (inch: number): number => inch * METERS_PER_INCH;
export const metersToMillimeters = (m: number): number => m / METERS_PER_MILLIMETER;
export const millimetersToMeters = (mm: number): number => mm * METERS_PER_MILLIMETER;

export const mpsToMph = (mps: number): number => mps / MPS_PER_MPH;
export const mphToMps = (mph: number): number => mph * MPS_PER_MPH;
export const mpsToKmh = (mps: number): number => mps / MPS_PER_KMH;
export const kmhToMps = (kmh: number): number => kmh * MPS_PER_KMH;

export const radToDeg = (rad: number): number => rad * DEG_PER_RAD;
export const degToRad = (deg: number): number => deg * RAD_PER_DEG;

export const radPerSecToRpm = (radPerSec: number): number => radPerSec / RAD_PER_SEC_PER_RPM;
export const rpmToRadPerSec = (rpm: number): number => rpm * RAD_PER_SEC_PER_RPM;

export const celsiusToKelvin = (c: number): number => c + KELVIN_OFFSET;
export const kelvinToCelsius = (k: number): number => k - KELVIN_OFFSET;
export const celsiusToFahrenheit = (c: number): number => (c * 9) / 5 + 32;
export const fahrenheitToCelsius = (f: number): number => ((f - 32) * 5) / 9;

export const pascalsToInHg = (pa: number): number => pa / PA_PER_INHG;
export const inHgToPascals = (inHg: number): number => inHg * PA_PER_INHG;
export const pascalsToHpa = (pa: number): number => pa / PA_PER_HPA;
export const hpaToPascals = (hpa: number): number => hpa * PA_PER_HPA;

// ---------------------------------------------------------------------------
// Dimension-checked generic conversion
// ---------------------------------------------------------------------------

export type Dimension = "length" | "speed" | "angle" | "angular-speed" | "pressure" | "temperature" | "mass" | "time" | "density";

type LinearUnit = { readonly dimension: Dimension; readonly toSi: number };
type AffineUnit = { readonly dimension: "temperature"; readonly toSi: (v: number) => number; readonly fromSi: (v: number) => number };

const LINEAR_UNITS = {
  m: { dimension: "length", toSi: 1 },
  mm: { dimension: "length", toSi: METERS_PER_MILLIMETER },
  yd: { dimension: "length", toSi: METERS_PER_YARD },
  ft: { dimension: "length", toSi: METERS_PER_FOOT },
  in: { dimension: "length", toSi: METERS_PER_INCH },
  "m/s": { dimension: "speed", toSi: 1 },
  mph: { dimension: "speed", toSi: MPS_PER_MPH },
  "km/h": { dimension: "speed", toSi: MPS_PER_KMH },
  rad: { dimension: "angle", toSi: 1 },
  deg: { dimension: "angle", toSi: RAD_PER_DEG },
  "rad/s": { dimension: "angular-speed", toSi: 1 },
  rpm: { dimension: "angular-speed", toSi: RAD_PER_SEC_PER_RPM },
  Pa: { dimension: "pressure", toSi: 1 },
  hPa: { dimension: "pressure", toSi: PA_PER_HPA },
  inHg: { dimension: "pressure", toSi: PA_PER_INHG },
  kg: { dimension: "mass", toSi: 1 },
  g: { dimension: "mass", toSi: KG_PER_GRAM },
  s: { dimension: "time", toSi: 1 },
  ms: { dimension: "time", toSi: 0.001 },
  "kg/m^3": { dimension: "density", toSi: 1 },
} as const satisfies Record<string, LinearUnit>;

const AFFINE_UNITS = {
  K: { dimension: "temperature", toSi: (v: number) => v, fromSi: (v: number) => v },
  degC: { dimension: "temperature", toSi: celsiusToKelvin, fromSi: kelvinToCelsius },
  degF: {
    dimension: "temperature",
    toSi: (v: number) => celsiusToKelvin(fahrenheitToCelsius(v)),
    fromSi: (v: number) => celsiusToFahrenheit(kelvinToCelsius(v)),
  },
} as const satisfies Record<string, AffineUnit>;

export type UnitId = keyof typeof LINEAR_UNITS | keyof typeof AFFINE_UNITS;

export const UNIT_IDS: readonly UnitId[] = [
  ...(Object.keys(LINEAR_UNITS) as UnitId[]),
  ...(Object.keys(AFFINE_UNITS) as UnitId[]),
];

export function isUnitId(value: string): value is UnitId {
  return value in LINEAR_UNITS || value in AFFINE_UNITS;
}

export function dimensionOf(unit: UnitId): Dimension {
  return unit in LINEAR_UNITS
    ? LINEAR_UNITS[unit as keyof typeof LINEAR_UNITS].dimension
    : AFFINE_UNITS[unit as keyof typeof AFFINE_UNITS].dimension;
}

/**
 * Convert `value` from one unit to another. Throws on a dimension mismatch (e.g. m -> mph)
 * and on non-finite input, so a bad conversion can never silently produce a number.
 */
export function convert(value: number, from: UnitId, to: UnitId): number {
  if (!Number.isFinite(value)) throw new Error(`convert: non-finite value ${value}`);
  const fromDim = dimensionOf(from);
  const toDim = dimensionOf(to);
  if (fromDim !== toDim) throw new Error(`convert: cannot convert ${from} (${fromDim}) to ${to} (${toDim})`);
  if (from === to) return value;
  const si =
    from in LINEAR_UNITS
      ? value * LINEAR_UNITS[from as keyof typeof LINEAR_UNITS].toSi
      : AFFINE_UNITS[from as keyof typeof AFFINE_UNITS].toSi(value);
  return to in LINEAR_UNITS
    ? si / LINEAR_UNITS[to as keyof typeof LINEAR_UNITS].toSi
    : AFFINE_UNITS[to as keyof typeof AFFINE_UNITS].fromSi(si);
}
