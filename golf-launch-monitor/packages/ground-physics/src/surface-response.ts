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
 * resolveImpact passes the normal speed into the crater-TILTED contact plane (Penner's v'),
 * the argument of Penner's (2002) turf fit whose shape the green row follows
 * (docs/terrain-model.md §2, §3).
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

/**
 * Low-speed rolling-resistance coefficient c0 (deceleration / g on flat ground as v -> 0)
 * including moisture. The roll integrator multiplies it by (1 + beta v^2), beta from
 * @glm/terrain-engine (ROLLING_RESISTANCE_BETA_S2_PER_M2).
 */
export function effectiveRollingResistance(surface: SurfaceProperties): number {
  const moisture = clamp(surface.moistureSoftness, 0, 1);
  return Math.max(0, surface.rollingResistance) * (1 + MOISTURE_ROLLING_RESISTANCE_GAIN * moisture);
}
