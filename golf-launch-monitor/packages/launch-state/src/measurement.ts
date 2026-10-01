import { deepFreeze, MEASURED_SOURCES, MEASUREMENT_SOURCES } from "@glm/shared-types";
import type { Measurement, MeasurementSource, Uncertainty } from "@glm/shared-types";
import { uniqueStrings } from "./constants";

/**
 * Measurement<T> factories. Every value this package emits is built here so that the
 * provenance invariants (value === null <=> source "unavailable", unavailable => confidence 0,
 * confidence in [0, 1], no NaN/Infinity) hold by construction, not by convention.
 */

export type MakeMeasurementInput<T> = {
  readonly value: T;
  readonly unit: string;
  readonly source: Exclude<MeasurementSource, "unavailable">;
  readonly confidence: number;
  readonly uncertainty?: Uncertainty;
  readonly qualityFlags?: readonly string[];
};

const KNOWN_SOURCES: ReadonlySet<string> = new Set(MEASUREMENT_SOURCES);

function assertFiniteDeep(value: unknown, path: string): void {
  if (value === null || value === undefined) {
    throw new Error(`makeMeasurement: ${path} is ${String(value)}; use unavailableMeasurement for missing values`);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error(`makeMeasurement: ${path} is not finite (${value})`);
    return;
  }
  if (typeof value === "string" || typeof value === "boolean") return;
  if (Array.isArray(value)) {
    value.forEach((v, i) => assertFiniteDeep(v, `${path}[${i}]`));
    return;
  }
  if (typeof value === "object") {
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) assertFiniteDeep(v, `${path}.${key}`);
    return;
  }
  throw new Error(`makeMeasurement: ${path} has unsupported type ${typeof value}`);
}

function validateUncertainty(u: Uncertainty): void {
  if (typeof u.unit !== "string" || u.unit.length === 0) throw new Error("makeMeasurement: uncertainty.unit is required");
  if (u.sigma !== undefined && !(Number.isFinite(u.sigma) && u.sigma >= 0)) {
    throw new Error(`makeMeasurement: uncertainty.sigma must be finite and >= 0, got ${u.sigma}`);
  }
  if (u.lower !== undefined && !Number.isFinite(u.lower)) throw new Error("makeMeasurement: uncertainty.lower is not finite");
  if (u.upper !== undefined && !Number.isFinite(u.upper)) throw new Error("makeMeasurement: uncertainty.upper is not finite");
  if (u.lower !== undefined && u.upper !== undefined && u.lower > u.upper) {
    throw new Error("makeMeasurement: uncertainty.lower must be <= uncertainty.upper");
  }
  if (u.covariance !== undefined) {
    const n = u.covariance.length;
    for (const row of u.covariance) {
      if (row.length !== n) throw new Error("makeMeasurement: uncertainty.covariance must be square");
      for (const v of row) if (!Number.isFinite(v)) throw new Error("makeMeasurement: uncertainty.covariance is not finite");
    }
  }
}

/**
 * Builds an available (non-null) measurement. Throws on a null/undefined value, any
 * non-finite number anywhere in the value or uncertainty, confidence outside [0, 1], or an
 * "unavailable" source. The result is a deep-frozen copy; the caller's objects are not frozen.
 */
export function makeMeasurement<T>(input: MakeMeasurementInput<T>): Measurement<T> {
  assertFiniteDeep(input.value, "value");
  if (typeof input.unit !== "string" || input.unit.length === 0) throw new Error("makeMeasurement: unit is required");
  const source = input.source as MeasurementSource;
  if (!KNOWN_SOURCES.has(source)) throw new Error(`makeMeasurement: unknown source "${String(source)}"`);
  if (source === "unavailable") {
    throw new Error('makeMeasurement: source "unavailable" requires a null value; use unavailableMeasurement');
  }
  if (!(Number.isFinite(input.confidence) && input.confidence >= 0 && input.confidence <= 1)) {
    throw new Error(`makeMeasurement: confidence must be in [0, 1], got ${input.confidence}`);
  }
  if (input.uncertainty !== undefined) validateUncertainty(input.uncertainty);
  const flags = input.qualityFlags ?? [];
  for (const f of flags) if (typeof f !== "string") throw new Error("makeMeasurement: quality flags must be strings");

  const measurement: Measurement<T> = {
    value: structuredClone(input.value),
    unit: input.unit,
    source,
    confidence: input.confidence,
    ...(input.uncertainty !== undefined ? { uncertainty: structuredClone(input.uncertainty) } : {}),
    qualityFlags: uniqueStrings(flags),
  };
  return deepFreeze(measurement) as Measurement<T>;
}

/**
 * A value that could not be obtained. `qualityFlags` should say why (e.g.
 * "spin-axis-undefined-vertical-velocity"); the value is null and the confidence 0.
 */
export function unavailableMeasurement<T>(unit: string, qualityFlags: readonly string[]): Measurement<T> {
  if (typeof unit !== "string" || unit.length === 0) throw new Error("unavailableMeasurement: unit is required");
  const measurement: Measurement<T> = {
    value: null,
    unit,
    source: "unavailable",
    confidence: 0,
    qualityFlags: uniqueStrings(qualityFlags),
  };
  return deepFreeze(measurement) as Measurement<T>;
}

/** True when the measurement carries a value (and is therefore not "unavailable"). */
export function isAvailable<T>(m: Measurement<T>): m is Measurement<T> & { value: T } {
  return m.value !== null && m.value !== undefined && m.source !== "unavailable";
}

/**
 * Provenance precedence for derived values, worst first. A value computed from several inputs
 * is only as trustworthy as its least trustworthy input, so the label of the "worst" input wins
 * and provenance can never be upgraded (e.g. estimated + measured -> estimated).
 *
 * Model-derived labels (assumed / estimated) outrank stream-origin labels (synthetic / manual):
 * a spin rate taken from a club prior and oriented by a synthetic launch velocity is first and
 * foremost an ESTIMATE and must be shown as one. The synthetic origin is not lost: it is carried
 * by the shot's dataOrigin, the data-origin banner, and CalculatedValue.dependsOnSynthetic.
 */
const SOURCE_PRECEDENCE: readonly MeasurementSource[] = [
  "unavailable",
  "assumed-generic-fallback",
  "estimated-club-model",
  "estimated-player-model",
  "synthetic",
  "manual",
];

/**
 * Provenance of a value derived from several inputs:
 * any "unavailable" -> "unavailable"; else any "assumed-generic-fallback"; else any
 * "estimated-club-model"; else any "estimated-player-model"; else any "synthetic" ->
 * "synthetic"; else any "manual" -> "manual"; else (all measured) one kind -> that kind, mixed
 * kinds -> "measured-hybrid". Throws on empty input or an unknown label.
 */
export function combineSources(sources: readonly MeasurementSource[]): MeasurementSource {
  if (sources.length === 0) throw new Error("combineSources: at least one source is required");
  for (const s of sources) if (!KNOWN_SOURCES.has(s)) throw new Error(`combineSources: unknown source "${String(s)}"`);
  for (const candidate of SOURCE_PRECEDENCE) if (sources.includes(candidate)) return candidate;
  const kinds = new Set(sources);
  for (const k of kinds) if (!MEASURED_SOURCES.has(k)) throw new Error(`combineSources: unexpected source "${k}"`);
  return kinds.size === 1 ? (sources[0] as MeasurementSource) : "measured-hybrid";
}
