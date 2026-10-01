/**
 * Golfer-facing and engineering formatting of SI values (docs/coordinate-system.md §9).
 *
 * Every formatter takes an SI value, or `null` for "no value", and returns display text.
 * - `null` renders as an em dash (U+2014), never as a number.
 * - NaN / ±Infinity THROW. A non-finite value reaching the display layer is an upstream bug;
 *   rendering "NaN yd" (or quietly hiding it) would conceal that bug from the golfer and us.
 * - Signed horizontal quantities are shown as a magnitude with an explicit `L` / `R` label,
 *   because the internal conventions differ between quantities (lateral and horizontal angle
 *   are +left, spin-axis tilt is +right) and a bare sign would be ambiguous (§3, §4.3).
 * - All rounding goes through `roundHalfAwayFromZero` so output is deterministic and never "-0".
 * - Number text uses "." as the decimal point and "," as the thousands separator, built by
 *   hand rather than `toLocaleString`, so output does not depend on the runtime locale.
 */
import {
  celsiusToFahrenheit,
  DEG_PER_RAD,
  metersToFeet,
  metersToInches,
  metersToYards,
  MPS_PER_MPH,
  mpsToKmh,
  mpsToMph,
  pascalsToHpa,
  pascalsToInHg,
  RAD_PER_DEG,
  radPerSecToRpm,
  radToDeg,
  rpmToRadPerSec,
} from "./conversions";

// ---------------------------------------------------------------------------
// Unit systems and precision
// ---------------------------------------------------------------------------

export type DistanceDisplayUnit = "yd" | "m";
export type HeightDisplayUnit = "yd" | "ft" | "m";
export type SpeedDisplayUnit = "mph" | "km/h" | "m/s";
export type TemperatureDisplayUnit = "degC" | "degF";
export type PressureDisplayUnit = "hPa" | "inHg";

/** The golfer's chosen display units. Internal values are always SI regardless. */
export type UnitSystem = {
  readonly distance: DistanceDisplayUnit;
  readonly height: HeightDisplayUnit;
  readonly speed: SpeedDisplayUnit;
  readonly temperature: TemperatureDisplayUnit;
  readonly pressure: PressureDisplayUnit;
};

/** US golf convention: yards for distance, feet for apex height, mph for speed. */
export const IMPERIAL_GOLF_UNITS: UnitSystem = Object.freeze({
  distance: "yd",
  height: "ft",
  speed: "mph",
  temperature: "degF",
  pressure: "inHg",
});

export const METRIC_UNITS: UnitSystem = Object.freeze({
  distance: "m",
  height: "m",
  speed: "km/h",
  temperature: "degC",
  pressure: "hPa",
});

/**
 * - golfer: the rounded, unit-converted values a golfer reads (§9 "Golfer display").
 * - engineering: SI (m, m/s, s) or degrees / rpm at higher resolution (§9 "Engineering display").
 */
export type Precision = "golfer" | "engineering";

/** Rendered in place of any value that does not exist. Em dash, U+2014. */
export const UNAVAILABLE_TEXT = "—";
/** Joins the two ends of a range. En dash, U+2013. */
export const RANGE_SEPARATOR = "–";
export const DEGREE_SIGN = "°";

// ---------------------------------------------------------------------------
// Rounding
// ---------------------------------------------------------------------------

/**
 * Significant digits kept before rounding. A double carries ~15.95 decimal digits, so
 * normalizing to 15 discards only the last-few-ulp noise left by unit conversion
 * (e.g. 6435 rpm -> rad/s -> rpm = 6434.999999999999) while never touching a digit that a
 * sensor could resolve. Without it, conversion noise flips exact ties the wrong way.
 */
export const ROUNDING_SIGNIFICANT_DIGITS = 15;
const MAX_ROUNDING_DECIMALS = 20;

/** Multiply by 10^places by editing the decimal exponent, so the shift itself is exact. */
function shiftDecimal(value: number, places: number): number {
  const [mantissa, exponent = "0"] = String(value).split("e");
  return Number(`${mantissa}e${Number(exponent) + places}`);
}

/**
 * Round to `decimals` decimal places (negative = tens, hundreds, ...), ties away from zero.
 *
 * Why not `Math.round(x * 100) / 100` or `toFixed`:
 * - Deterministic, symmetric tie rule: 2.5 -> 3 and -2.5 -> -3 (Math.round gives -2).
 * - Never returns -0: a value that rounds to zero returns +0, so nothing displays "-0".
 * - Rounds the decimal number a human reads, not its binary approximation: 1.005 is stored as
 *   1.00499999999999989..., which `toFixed(2)` turns into "1.00". Here the value is first
 *   normalized to ROUNDING_SIGNIFICANT_DIGITS and then shifted by editing its decimal
 *   exponent (exact), so 1.005 -> 1.01, 2.675 -> 2.68, 1.45 -> 1.5 (1 dp).
 *   Caveat: a value that genuinely differs from a tie only beyond the 15th significant digit is
 *   treated as the tie; that is far below any physical resolution in this system.
 *
 * Throws on non-finite input and on non-integer or out-of-range `decimals` (|decimals| <= 20).
 */
export function roundHalfAwayFromZero(value: number, decimals: number): number {
  if (!Number.isFinite(value)) throw new RangeError(`roundHalfAwayFromZero: non-finite value ${value}`);
  if (!Number.isInteger(decimals) || Math.abs(decimals) > MAX_ROUNDING_DECIMALS) {
    throw new RangeError(`roundHalfAwayFromZero: decimals must be an integer in [-20, 20], got ${decimals}`);
  }
  const magnitude = Math.abs(value);
  if (magnitude === 0) return 0;
  const normalized = Number(magnitude.toPrecision(ROUNDING_SIGNIFICANT_DIGITS));
  const shifted = shiftDecimal(normalized, decimals);
  // Beyond 2^53 a double has no fractional part at this scale: it is already rounded.
  const rounded =
    Number.isFinite(shifted) && shifted < Number.MAX_SAFE_INTEGER
      ? shiftDecimal(Math.round(shifted), -decimals)
      : normalized;
  if (rounded === 0) return 0;
  return value < 0 ? -rounded : rounded;
}

/** Insert "," every three integer digits. Locale-independent by construction. */
function groupThousands(text: string): string {
  const negative = text.startsWith("-");
  const unsigned = negative ? text.slice(1) : text;
  const [integerPart = "", fractionPart] = unsigned.split(".");
  let grouped = "";
  for (let i = 0; i < integerPart.length; i++) {
    if (i > 0 && (integerPart.length - i) % 3 === 0) grouped += ",";
    grouped += integerPart[i];
  }
  return `${negative ? "-" : ""}${grouped}${fractionPart === undefined ? "" : `.${fractionPart}`}`;
}

/** Fixed-point text after half-away-from-zero rounding. Never "-0". */
function fixed(value: number, decimals: number, group = false): string {
  const text = roundHalfAwayFromZero(value, decimals).toFixed(Math.max(decimals, 0));
  return group ? groupThousands(text) : text;
}

/** Returns false for null; throws for anything that is not a finite number. */
function present(value: number | null | undefined, fn: string): value is number {
  if (value === null) return false;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new RangeError(`${fn}: value must be a finite number or null, got ${String(value)}`);
  }
  return true;
}

function assertPrecision(precision: Precision, fn: string): void {
  if (precision !== "golfer" && precision !== "engineering") {
    throw new RangeError(`${fn}: unknown precision "${String(precision)}"`);
  }
}

function unknownUnit(fn: string, unit: string): never {
  throw new RangeError(`${fn}: unknown display unit "${unit}"`);
}

// ---------------------------------------------------------------------------
// Per-quantity numeric rules (§9). Each returns [display value, decimals, unit text, group].
// ---------------------------------------------------------------------------

type Scaled = { readonly value: number; readonly decimals: number; readonly unit: string; readonly group: boolean };

function scaleDistance(meters: number, system: UnitSystem, precision: Precision, fn: string): Scaled {
  if (precision === "engineering") return { value: meters, decimals: 3, unit: "m", group: false };
  switch (system.distance) {
    case "yd":
      return { value: metersToYards(meters), decimals: 0, unit: "yd", group: false };
    case "m":
      return { value: meters, decimals: 0, unit: "m", group: false };
    default:
      return unknownUnit(fn, system.distance);
  }
}

function scaleHeight(meters: number, system: UnitSystem, precision: Precision, fn: string): Scaled {
  if (precision === "engineering") return { value: meters, decimals: 3, unit: "m", group: false };
  switch (system.height) {
    case "ft":
      return { value: metersToFeet(meters), decimals: 0, unit: "ft", group: false };
    case "yd":
      return { value: metersToYards(meters), decimals: 0, unit: "yd", group: false };
    case "m":
      return { value: meters, decimals: 1, unit: "m", group: false };
    default:
      return unknownUnit(fn, system.height);
  }
}

function scaleSpeed(mps: number, system: UnitSystem, precision: Precision, fn: string): Scaled {
  if (precision === "engineering") return { value: mps, decimals: 3, unit: "m/s", group: false };
  switch (system.speed) {
    case "mph":
      return { value: mpsToMph(mps), decimals: 1, unit: "mph", group: false };
    case "km/h":
      return { value: mpsToKmh(mps), decimals: 1, unit: "km/h", group: false };
    case "m/s":
      return { value: mps, decimals: 1, unit: "m/s", group: false };
    default:
      return unknownUnit(fn, system.speed);
  }
}

function scaleAngle(rad: number, precision: Precision): Scaled {
  return { value: radToDeg(rad), decimals: precision === "golfer" ? 1 : 3, unit: DEGREE_SIGN, group: false };
}

/** Golfer spin is rounded to the nearest 10 rpm (decimals = -1) with a thousands separator. */
function scaleSpin(radPerSec: number, precision: Precision): Scaled {
  return precision === "golfer"
    ? { value: radPerSecToRpm(radPerSec), decimals: -1, unit: "rpm", group: true }
    : { value: radPerSecToRpm(radPerSec), decimals: 1, unit: "rpm", group: false };
}

function scaleDuration(seconds: number, precision: Precision): Scaled {
  return { value: seconds, decimals: precision === "golfer" ? 1 : 3, unit: "s", group: false };
}

/** Angle-like units hug the number ("16.2°"); everything else takes a space ("167 yd"). */
function withUnit(numberText: string, unit: string): string {
  return unit === DEGREE_SIGN ? `${numberText}${unit}` : `${numberText} ${unit}`;
}

function scalar(s: Scaled): string {
  return withUnit(fixed(s.value, s.decimals, s.group), s.unit);
}

/**
 * Magnitude with an explicit side label. Zero (after rounding) gets no label, so a straight
 * shot reads "0 yd" / "0.0°", never "0 yd L" or "-0".
 */
function sided(s: Scaled, signedValue: number, positiveLabel: "L" | "R", negativeLabel: "L" | "R"): string {
  const magnitude = roundHalfAwayFromZero(Math.abs(s.value), s.decimals);
  const text = withUnit(fixed(magnitude, s.decimals, s.group), s.unit);
  if (magnitude === 0) return text;
  return `${text} ${signedValue > 0 ? positiveLabel : negativeLabel}`;
}

// ---------------------------------------------------------------------------
// Public formatters
// ---------------------------------------------------------------------------

/** Horizontal distance. Golfer: yd or m, 0 dp ("167 yd"). Engineering: m, 3 dp ("152.705 m"). */
export function formatDistance(meters: number | null, system: UnitSystem, precision: Precision = "golfer"): string {
  assertPrecision(precision, "formatDistance");
  if (!present(meters, "formatDistance")) return UNAVAILABLE_TEXT;
  return scalar(scaleDistance(meters, system, precision, "formatDistance"));
}

/** Height. Golfer: ft or yd 0 dp, m 1 dp. Engineering: m, 3 dp. */
export function formatHeight(meters: number | null, system: UnitSystem, precision: Precision = "golfer"): string {
  assertPrecision(precision, "formatHeight");
  if (!present(meters, "formatHeight")) return UNAVAILABLE_TEXT;
  return scalar(scaleHeight(meters, system, precision, "formatHeight"));
}

/**
 * Lateral offset, input signed +left (§5).
 * Golfer: magnitude in the distance unit with L / R ("12 yd L", "3 yd R"; "0 yd" when it rounds
 * to zero). Engineering: signed m, 3 dp, explicit "+" for left ("+3.658 m", "-0.914 m"), per §9.
 */
export function formatLateral(
  metersLeftPositive: number | null,
  system: UnitSystem,
  precision: Precision = "golfer",
): string {
  assertPrecision(precision, "formatLateral");
  if (!present(metersLeftPositive, "formatLateral")) return UNAVAILABLE_TEXT;
  const s = scaleDistance(metersLeftPositive, system, precision, "formatLateral");
  if (precision === "engineering") {
    const text = fixed(s.value, s.decimals);
    return withUnit(roundHalfAwayFromZero(s.value, s.decimals) > 0 ? `+${text}` : text, s.unit);
  }
  return sided(s, metersLeftPositive, "L", "R");
}

/** Speed. Golfer: mph / km/h / m/s, 1 dp ("167.0 mph"). Engineering: m/s, 3 dp. */
export function formatSpeed(mps: number | null, system: UnitSystem, precision: Precision = "golfer"): string {
  assertPrecision(precision, "formatSpeed");
  if (!present(mps, "formatSpeed")) return UNAVAILABLE_TEXT;
  return scalar(scaleSpeed(mps, system, precision, "formatSpeed"));
}

/** Signed angle (vertical launch, descent, attack, ...). Golfer 1 dp ("16.2°"), engineering 3 dp. */
export function formatAngle(rad: number | null, precision: Precision = "golfer"): string {
  assertPrecision(precision, "formatAngle");
  if (!present(rad, "formatAngle")) return UNAVAILABLE_TEXT;
  return scalar(scaleAngle(rad, precision));
}

/** Horizontal angle, input +left (§3): "2.1° L" / "2.1° R" / "0.0°". */
export function formatHorizontalAngle(radLeftPositive: number | null, precision: Precision = "golfer"): string {
  assertPrecision(precision, "formatHorizontalAngle");
  if (!present(radLeftPositive, "formatHorizontalAngle")) return UNAVAILABLE_TEXT;
  return sided(scaleAngle(radLeftPositive, precision), radLeftPositive, "L", "R");
}

/** Spin-axis tilt, input +right = ball curves right (§4.3): "3.4° R" / "3.4° L" / "0.0°". */
export function formatSpinAxis(radRightPositive: number | null, precision: Precision = "golfer"): string {
  assertPrecision(precision, "formatSpinAxis");
  if (!present(radRightPositive, "formatSpinAxis")) return UNAVAILABLE_TEXT;
  return sided(scaleAngle(radRightPositive, precision), radRightPositive, "R", "L");
}

/** Spin rate. Golfer: rpm to the nearest 10 with "," grouping ("6,430 rpm"). Engineering: rpm 1 dp. */
export function formatSpinRate(radPerSec: number | null, precision: Precision = "golfer"): string {
  assertPrecision(precision, "formatSpinRate");
  if (!present(radPerSec, "formatSpinRate")) return UNAVAILABLE_TEXT;
  return scalar(scaleSpin(radPerSec, precision));
}

/**
 * Display-derived sidespin, input +right = curves right (§4.3): "430 rpm R" / "430 rpm L" /
 * "0 rpm". Same rounding as `formatSpinRate`.
 */
export function formatSidespin(radPerSecRightPositive: number | null, precision: Precision = "golfer"): string {
  assertPrecision(precision, "formatSidespin");
  if (!present(radPerSecRightPositive, "formatSidespin")) return UNAVAILABLE_TEXT;
  return sided(scaleSpin(radPerSecRightPositive, precision), radPerSecRightPositive, "R", "L");
}

/** Duration. Golfer 1 dp ("6.3 s"), engineering 3 dp. */
export function formatDuration(seconds: number | null, precision: Precision = "golfer"): string {
  assertPrecision(precision, "formatDuration");
  if (!present(seconds, "formatDuration")) return UNAVAILABLE_TEXT;
  return scalar(scaleDuration(seconds, precision));
}

/** Dimensionless ratio such as smash factor. Golfer 2 dp ("1.48"), engineering 3 dp. */
export function formatRatio(value: number | null, precision: Precision = "golfer"): string {
  assertPrecision(precision, "formatRatio");
  if (!present(value, "formatRatio")) return UNAVAILABLE_TEXT;
  return fixed(value, precision === "golfer" ? 2 : 3);
}

/**
 * Angular rate shown in degrees per second (club-face closure rate). Golfer: 0 dp with ","
 * grouping ("2,450 °/s"). Engineering: 3 dp.
 */
export function formatAngularRate(radPerSec: number | null, precision: Precision = "golfer"): string {
  assertPrecision(precision, "formatAngularRate");
  if (!present(radPerSec, "formatAngularRate")) return UNAVAILABLE_TEXT;
  const degPerSec = radPerSec * DEG_PER_RAD;
  return precision === "golfer"
    ? `${fixed(degPerSec, 0, true)} ${DEGREE_SIGN}/s`
    : `${fixed(degPerSec, 3)} ${DEGREE_SIGN}/s`;
}

/**
 * Short signed length such as club low point. Golfer: inches (distance unit yd) or cm
 * (distance unit m), 1 dp. Engineering: m, 3 dp. Sign is passed through unchanged.
 */
export function formatShortLength(meters: number | null, system: UnitSystem, precision: Precision = "golfer"): string {
  assertPrecision(precision, "formatShortLength");
  if (!present(meters, "formatShortLength")) return UNAVAILABLE_TEXT;
  if (precision === "engineering") return `${fixed(meters, 3)} m`;
  switch (system.distance) {
    case "yd":
      return `${fixed(metersToInches(meters), 1)} in`;
    case "m":
      return `${fixed(meters * 100, 1)} cm`;
    default:
      return unknownUnit("formatShortLength", system.distance);
  }
}

/** Air temperature, input °C (EnvironmentProfile.temperatureC). Golfer 0 dp; engineering °C 2 dp. */
export function formatTemperature(celsius: number | null, system: UnitSystem, precision: Precision = "golfer"): string {
  assertPrecision(precision, "formatTemperature");
  if (!present(celsius, "formatTemperature")) return UNAVAILABLE_TEXT;
  if (precision === "engineering") return `${fixed(celsius, 2)} ${DEGREE_SIGN}C`;
  switch (system.temperature) {
    case "degF":
      return `${fixed(celsiusToFahrenheit(celsius), 0)} ${DEGREE_SIGN}F`;
    case "degC":
      return `${fixed(celsius, 0)} ${DEGREE_SIGN}C`;
    default:
      return unknownUnit("formatTemperature", system.temperature);
  }
}

/** Absolute air pressure, input Pa. Golfer: hPa 0 dp or inHg 2 dp. Engineering: Pa 0 dp. */
export function formatPressure(pascals: number | null, system: UnitSystem, precision: Precision = "golfer"): string {
  assertPrecision(precision, "formatPressure");
  if (!present(pascals, "formatPressure")) return UNAVAILABLE_TEXT;
  if (precision === "engineering") return `${fixed(pascals, 0)} Pa`;
  switch (system.pressure) {
    case "hPa":
      return `${fixed(pascalsToHpa(pascals), 0)} hPa`;
    case "inHg":
      return `${fixed(pascalsToInHg(pascals), 2)} inHg`;
    default:
      return unknownUnit("formatPressure", system.pressure);
  }
}

// ---------------------------------------------------------------------------
// Ranges
// ---------------------------------------------------------------------------

/**
 * Quantity kinds that can be shown as a range. The first six are the baseline set; the
 * signed-angle, sidespin and duration kinds extend it so every calculated metric can show one.
 */
export type RangeKind =
  | "distance"
  | "height"
  | "lateral"
  | "speed"
  | "spin"
  | "angle"
  | "horizontal-angle"
  | "spin-axis"
  | "side-spin"
  | "duration";

export const RANGE_KINDS: readonly RangeKind[] = Object.freeze([
  "distance",
  "height",
  "lateral",
  "speed",
  "spin",
  "angle",
  "horizontal-angle",
  "spin-axis",
  "side-spin",
  "duration",
]);

/**
 * Format a range from SI end points (low <= high, e.g. p05..p95).
 *
 * Unsided kinds share the unit once: "163–171 yd", "15.8–16.6°", "6,200–6,600 rpm".
 * Sided kinds (golfer lateral, horizontal angle, spin axis, sidespin) keep an L / R label on
 * each end and are ordered LEFT end first, i.e. in the order the golfer sees them on screen
 * looking down the target line: lateral p05 = 3.66 m right, p95 = 1.83 m left -> "2 yd L–4 yd R".
 * Engineering lateral stays signed and numeric-ordered ("-3.658–+1.829 m").
 */
export function formatRange(
  lowSi: number,
  highSi: number,
  kind: RangeKind,
  system: UnitSystem,
  precision: Precision = "golfer",
): string {
  assertPrecision(precision, "formatRange");
  if (!present(lowSi, "formatRange") || !present(highSi, "formatRange")) {
    throw new RangeError("formatRange: both ends must be finite numbers");
  }
  if (lowSi > highSi) throw new RangeError(`formatRange: low (${lowSi}) > high (${highSi})`);

  const joinSided = (leftEnd: string, rightEnd: string): string => `${leftEnd}${RANGE_SEPARATOR}${rightEnd}`;
  const shared = (lo: Scaled, hi: Scaled): string =>
    withUnit(`${fixed(lo.value, lo.decimals, lo.group)}${RANGE_SEPARATOR}${fixed(hi.value, hi.decimals, hi.group)}`, lo.unit);

  switch (kind) {
    case "distance":
      return shared(scaleDistance(lowSi, system, precision, "formatRange"), scaleDistance(highSi, system, precision, "formatRange"));
    case "height":
      return shared(scaleHeight(lowSi, system, precision, "formatRange"), scaleHeight(highSi, system, precision, "formatRange"));
    case "speed":
      return shared(scaleSpeed(lowSi, system, precision, "formatRange"), scaleSpeed(highSi, system, precision, "formatRange"));
    case "spin":
      return shared(scaleSpin(lowSi, precision), scaleSpin(highSi, precision));
    case "angle":
      return shared(scaleAngle(lowSi, precision), scaleAngle(highSi, precision));
    case "duration":
      return shared(scaleDuration(lowSi, precision), scaleDuration(highSi, precision));
    case "lateral":
      if (precision === "engineering") {
        const lo = scaleDistance(lowSi, system, precision, "formatRange");
        const hi = scaleDistance(highSi, system, precision, "formatRange");
        const signed = (s: Scaled): string => {
          const text = fixed(s.value, s.decimals);
          return roundHalfAwayFromZero(s.value, s.decimals) > 0 ? `+${text}` : text;
        };
        return withUnit(`${signed(lo)}${RANGE_SEPARATOR}${signed(hi)}`, lo.unit);
      }
      // +left: the larger value is the left end.
      return joinSided(formatLateral(highSi, system, precision), formatLateral(lowSi, system, precision));
    case "horizontal-angle":
      return joinSided(formatHorizontalAngle(highSi, precision), formatHorizontalAngle(lowSi, precision));
    case "spin-axis":
      // +right: the smaller value is the left end.
      return joinSided(formatSpinAxis(lowSi, precision), formatSpinAxis(highSi, precision));
    case "side-spin":
      return joinSided(formatSidespin(lowSi, precision), formatSidespin(highSi, precision));
    default:
      throw new RangeError(`formatRange: unknown kind "${String(kind)}"`);
  }
}

/**
 * Width thresholds of the 90 % interval (p95 - p05) above which a single golfer number would be
 * false precision, so the display shows a range instead. Values in golfer units, with exact SI
 * equivalents. Product-spec values except DURATION, which is provisional (5x the 0.1 s display
 * resolution; ~8 % of a 6 s flight, the same order as the 3 % carry rule).
 */
export const RANGE_THRESHOLD_DISTANCE_YD = 3;
/** 3 yd = 3 * 0.9144 m exactly. */
export const RANGE_THRESHOLD_DISTANCE_M = 2.7432;
/** Distance/height also show a range when the width exceeds this fraction of |p50|. */
export const RANGE_THRESHOLD_DISTANCE_RELATIVE = 0.03;
export const RANGE_THRESHOLD_LATERAL_YD = 3;
export const RANGE_THRESHOLD_LATERAL_M = 2.7432;
export const RANGE_THRESHOLD_SPEED_MPH = 1;
export const RANGE_THRESHOLD_SPEED_MPS = MPS_PER_MPH;
export const RANGE_THRESHOLD_SPIN_RPM = 300;
export const RANGE_THRESHOLD_SPIN_RAD_PER_SEC = rpmToRadPerSec(RANGE_THRESHOLD_SPIN_RPM);
export const RANGE_THRESHOLD_ANGLE_DEG = 1;
export const RANGE_THRESHOLD_ANGLE_RAD = RANGE_THRESHOLD_ANGLE_DEG * RAD_PER_DEG;
export const RANGE_THRESHOLD_DURATION_S = 0.5;
/**
 * Relative slack on every threshold comparison, so "width > threshold" means what it says in
 * golfer units. Widths are differences of SI end points that were usually converted from golfer
 * units, and an interval exactly at a threshold arrives a few ulps above it
 * (yardsToMeters(163) - yardsToMeters(160) = 2.7432000000000016 m > 2.7432 m). 1e-9 absorbs that
 * noise and is far below any physical resolution (3 yd · 1e-9 ≈ 3 nm).
 */
export const RANGE_THRESHOLD_RELATIVE_TOLERANCE = 1e-9;

/** Strictly wider than `threshold`, ignoring floating-point noise at the threshold itself. */
function exceeds(width: number, threshold: number): boolean {
  return width > threshold * (1 + RANGE_THRESHOLD_RELATIVE_TOLERANCE);
}

export type PercentileInterval = { readonly p05: number; readonly p50: number; readonly p95: number };

/**
 * True when the 90 % interval is wide enough that a single number would be false precision.
 * All values are SI (m, m/s, rad, rad/s, s). `undefined` (no interval) -> false. A width exactly
 * at a threshold (within RANGE_THRESHOLD_RELATIVE_TOLERANCE) does not show a range.
 * Throws on non-finite percentiles or p95 < p05.
 */
export function shouldShowRange(interval: PercentileInterval | undefined, kind: RangeKind): boolean {
  if (interval === undefined) return false;
  const { p05, p50, p95 } = interval;
  if (![p05, p50, p95].every((v) => typeof v === "number" && Number.isFinite(v))) {
    throw new RangeError(`shouldShowRange: non-finite percentile in ${JSON.stringify(interval)}`);
  }
  if (p95 < p05) throw new RangeError(`shouldShowRange: p95 (${p95}) < p05 (${p05})`);
  const width = p95 - p05;
  switch (kind) {
    case "distance":
    case "height":
      return exceeds(width, RANGE_THRESHOLD_DISTANCE_M) || exceeds(width, RANGE_THRESHOLD_DISTANCE_RELATIVE * Math.abs(p50));
    case "lateral":
      return exceeds(width, RANGE_THRESHOLD_LATERAL_M);
    case "speed":
      return exceeds(width, RANGE_THRESHOLD_SPEED_MPS);
    case "spin":
    case "side-spin":
      return exceeds(width, RANGE_THRESHOLD_SPIN_RAD_PER_SEC);
    case "angle":
    case "horizontal-angle":
    case "spin-axis":
      return exceeds(width, RANGE_THRESHOLD_ANGLE_RAD);
    case "duration":
      return exceeds(width, RANGE_THRESHOLD_DURATION_S);
    default:
      throw new RangeError(`shouldShowRange: unknown kind "${String(kind)}"`);
  }
}
