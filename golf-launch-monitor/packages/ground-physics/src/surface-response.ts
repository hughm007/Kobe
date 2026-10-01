import type { SurfaceProperties } from "@glm/shared-types";

/**
 * Moisture rule (PROVISIONAL, not fit to data): a saturated surface (moistureSoftness = 1)
 * returns 30 % less normal velocity and has 50 % more rolling resistance than the dry
 * reference values stored in the catalog. Both effects are linear in moistureSoftness.
 * Sliding friction is not modified (wet-turf friction is not modelled).
 */
export const MOISTURE_RESTITUTION_REDUCTION = 0.3;
export const MOISTURE_ROLLING_RESISTANCE_GAIN = 0.5;

function clamp(value: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, value));
}

/**
 * Normal coefficient of restitution for an impact at the given normal speed:
 *
 *   e_dry = clamp(restitutionBase - restitutionSpeedSlope * v_n, restitutionMin, restitutionBase)
 *   e     = e_dry * (1 - MOISTURE_RESTITUTION_REDUCTION * moistureSoftness)
 *
 * The decrease with impact speed follows the shape of Penner's (2002) turf fit, but v_n here is
 * the plain normal speed: Penner evaluates his fit at the normal speed in a frame tilted by his
 * crater angle, which this model does not have (docs/terrain-model.md §2) — uncalibrated.
 */
export function effectiveRestitution(surface: SurfaceProperties, normalImpactSpeedMps: number): number {
  if (!Number.isFinite(normalImpactSpeedMps)) {
    throw new RangeError(`normalImpactSpeedMps must be finite, got ${normalImpactSpeedMps}`);
  }
  const speed = Math.abs(normalImpactSpeedMps);
  const hi = surface.restitutionBase;
  const lo = Math.min(surface.restitutionMin, hi);
  const eDry = clamp(hi - surface.restitutionSpeedSlope * speed, lo, hi);
  const moisture = clamp(surface.moistureSoftness, 0, 1);
  return clamp(eDry * (1 - MOISTURE_RESTITUTION_REDUCTION * moisture), 0, 1);
}

/** Rolling-resistance coefficient (deceleration / g on flat ground) including moisture. */
export function effectiveRollingResistance(surface: SurfaceProperties): number {
  const moisture = clamp(surface.moistureSoftness, 0, 1);
  return Math.max(0, surface.rollingResistance) * (1 + MOISTURE_ROLLING_RESISTANCE_GAIN * moisture);
}
