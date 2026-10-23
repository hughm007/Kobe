/**
 * Provenance badges and confidence labels. A badge is a pure function of the value's
 * MeasurementSource: the display layer can only ever keep or DOWNGRADE provenance, never
 * upgrade it (an estimated or synthetic value can never render as MEASURED).
 */
import type { MeasurementSource } from "@glm/shared-types";

export type ProvenanceBadge = "MEASURED" | "ESTIMATED" | "ASSUMED" | "CALCULATED" | "SYNTHETIC" | "MANUAL" | "UNAVAILABLE";

export function badgeForSource(source: MeasurementSource): ProvenanceBadge {
  switch (source) {
    case "measured-camera":
    case "measured-radar":
    case "measured-hybrid":
      return "MEASURED";
    case "estimated-player-model":
    case "estimated-club-model":
      return "ESTIMATED";
    case "assumed-generic-fallback":
      return "ASSUMED";
    case "synthetic":
      return "SYNTHETIC";
    case "manual":
      return "MANUAL";
    case "unavailable":
      return "UNAVAILABLE";
    default:
      throw new RangeError(`badgeForSource: unknown measurement source "${String(source)}"`);
  }
}

/**
 * Badge precedence when a displayed value combines several inputs, best first; the combination
 * shows the WORST input. This is the same rule as combineSources in @glm/launch-state:
 * - MANUAL / SYNTHETIC: where the data stream came from (typed in / generated for testing).
 * - ESTIMATED: a model of this shot/player with stated uncertainty.
 * - ASSUMED: a generic value that is not about this shot or player at all.
 * Model-derived labels outrank stream-origin labels so that an estimate is always shown as an
 * estimate; the synthetic or manual origin is shown separately by dataOriginBanner and the
 * secondary badges, so it is never lost.
 * CALCULATED is not a source and sits outside this ordering.
 */
export const PROVENANCE_SEVERITY: readonly ProvenanceBadge[] = Object.freeze([
  "MEASURED",
  "MANUAL",
  "SYNTHETIC",
  "ESTIMATED",
  "ASSUMED",
  "UNAVAILABLE",
]);

/** The least trustworthy of the given source badges. Throws on an empty list or CALCULATED. */
export function worstBadge(badges: readonly ProvenanceBadge[]): ProvenanceBadge {
  if (badges.length === 0) throw new RangeError("worstBadge: no badges given");
  let worst = -1;
  for (const badge of badges) {
    const rank = PROVENANCE_SEVERITY.indexOf(badge);
    if (rank < 0) throw new RangeError(`worstBadge: "${badge}" is not a source badge`);
    worst = Math.max(worst, rank);
  }
  return PROVENANCE_SEVERITY[worst] as ProvenanceBadge;
}

export type ConfidenceLabel = "high" | "medium" | "low" | "none";

/** confidence >= 0.8 -> high. */
export const CONFIDENCE_HIGH_MIN = 0.8;
/** confidence >= 0.5 -> medium. Anything above 0 below that is low; exactly 0 is none. */
export const CONFIDENCE_MEDIUM_MIN = 0.5;

export function confidenceLabel(confidence: number): ConfidenceLabel {
  if (typeof confidence !== "number" || !Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
    throw new RangeError(`confidenceLabel: confidence must be in [0, 1], got ${String(confidence)}`);
  }
  if (confidence >= CONFIDENCE_HIGH_MIN) return "high";
  if (confidence >= CONFIDENCE_MEDIUM_MIN) return "medium";
  if (confidence > 0) return "low";
  return "none";
}

/** Golfer-readable sentence for a value's source, used as the tooltip status. */
export function statusForSource(source: MeasurementSource): string {
  switch (source) {
    case "measured-camera":
      return "Measured by camera";
    case "measured-radar":
      return "Measured by radar";
    case "measured-hybrid":
      return "Measured by camera and radar (hybrid)";
    case "estimated-player-model":
      return "Estimated from the player model; not measured";
    case "estimated-club-model":
      return "Estimated from the club model; not measured";
    case "assumed-generic-fallback":
      return "Assumed generic value (allowed by the user); not measured or estimated for this shot";
    case "manual":
      return "Entered manually; not measured";
    case "synthetic":
      return "Synthetic, generated for testing; not measured";
    case "unavailable":
      return "Unavailable; not measured or estimated for this shot";
    default:
      throw new RangeError(`statusForSource: unknown measurement source "${String(source)}"`);
  }
}

/** Adjective used when a calculated value names an input ("depends on estimated spin"). */
export function adjectiveForSource(source: MeasurementSource): string {
  switch (source) {
    case "measured-camera":
    case "measured-radar":
    case "measured-hybrid":
      return "measured";
    case "estimated-player-model":
    case "estimated-club-model":
      return "estimated";
    case "assumed-generic-fallback":
      return "assumed";
    case "manual":
      return "manually entered";
    case "synthetic":
      return "synthetic";
    case "unavailable":
      return "unavailable";
    default:
      throw new RangeError(`adjectiveForSource: unknown measurement source "${String(source)}"`);
  }
}
