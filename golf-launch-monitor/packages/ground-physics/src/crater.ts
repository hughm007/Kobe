import type { SurfaceProperties } from "@glm/shared-types";

/**
 * Turf-deformation ("crater") tilt of the effective contact plane, after Penner (2002), "The run
 * of a golf ball" (docs/terrain-model.md §3.1). SECONDARY SOURCE, not verified on page: the
 * law and its reference point are known only from search snippets and code that cites Penner.
 *
 *   theta_c = 15.4 deg * (v_i / 18.6 m/s) * (theta_i / 44.4 deg) * craterScale(surface)
 *
 * v_i = impact speed, theta_i = impact angle below the local surface plane. Penner reportedly
 * fitted the law to one measured impact on a typical green (Haake's data, 18.6 m/s at 44.4 deg).
 */
export const CRATER_REFERENCE_ANGLE_DEG = 15.4;
export const CRATER_REFERENCE_SPEED_MPS = 18.6;
export const CRATER_REFERENCE_IMPACT_ANGLE_DEG = 44.4;

/**
 * Firmness at which craterScale = 1, i.e. the surface Penner's fit is taken to describe.
 * PROVISIONAL JUDGEMENT: the catalog green's firmness (Penner's reference impact was on "a
 * typical green"); firmness has no measured stiffness behind it.
 */
export const CRATER_REFERENCE_FIRMNESS = 0.5;

/**
 * Absolute cap on theta_c, deg. PROVISIONAL JUDGEMENT: twice Penner's reference angle. The law
 * is a one-point linear fit; beyond ~2x its reference the "crater" would be a buried ball
 * (plugging), which this model does not represent.
 */
export const CRATER_MAX_ANGLE_DEG = 30;

const DEG = Math.PI / 180;

/**
 * Crater-size multiplier from firmness: (1 - firmness) / (1 - CRATER_REFERENCE_FIRMNESS).
 * 1 at the reference (green) firmness, larger for softer surfaces, 0 for a rigid surface
 * (firmness 1, e.g. the cart path), which reproduces the plain rigid-surface impact exactly.
 * PROVISIONAL JUDGEMENT: linear in (1 - firmness) is the simplest monotone map through those
 * anchors; it is not fit to any turf data.
 */
export function craterScale(surface: Pick<SurfaceProperties, "firmness">): number {
  const firmness = surface.firmness;
  if (!Number.isFinite(firmness)) throw new RangeError(`craterScale: firmness must be finite, got ${firmness}`);
  const f = Math.min(1, Math.max(0, firmness));
  return (1 - f) / (1 - CRATER_REFERENCE_FIRMNESS);
}

/**
 * Crater angle theta_c (rad) for an impact at speed `impactSpeedMps` and angle `impactAngleRad`
 * below the surface plane (0 = grazing, pi/2 = vertical). Clamped to
 *
 *   theta_c <= min(CRATER_MAX_ANGLE, theta_i, pi/2 - theta_i)
 *
 * - theta_i: the crater's mean slope never exceeds the path that dug it. Penner's reference has
 *   theta_c / theta_i = 0.35; the cap only binds for fast, shallow landings on soft surfaces,
 *   where the extrapolated linear law would describe a buried ball.
 * - pi/2 - theta_i: in the tilted frame the incidence angle theta_i + theta_c stays <= 90 deg,
 *   so the incoming tangential velocity never reverses (the ball never strikes the "back" of the
 *   crater wall), and a vertical drop (symmetric crater) gets no tilt, continuously.
 *   Consequence: once it binds (theta_i > 90 deg / (1 + 0.347 (v_i / 18.6 m/s) craterScale),
 *   ~61 deg at 25 m/s on the green) theta_c falls as theta_i rises, so the backward kick
 *   shrinks and a steeper landing finishes slightly LESS far behind its pitch mark (tested).
 */
export function craterAngleRad(
  surface: Pick<SurfaceProperties, "firmness">,
  impactSpeedMps: number,
  impactAngleRad: number,
): number {
  if (!Number.isFinite(impactSpeedMps) || impactSpeedMps < 0) {
    throw new RangeError(`craterAngleRad: impactSpeedMps must be finite and >= 0, got ${impactSpeedMps}`);
  }
  if (!Number.isFinite(impactAngleRad) || impactAngleRad < 0 || impactAngleRad > Math.PI / 2 + 1e-12) {
    throw new RangeError(`craterAngleRad: impactAngleRad must be in [0, pi/2], got ${impactAngleRad}`);
  }
  const thetaI = Math.min(impactAngleRad, Math.PI / 2);
  const raw =
    CRATER_REFERENCE_ANGLE_DEG *
    DEG *
    (impactSpeedMps / CRATER_REFERENCE_SPEED_MPS) *
    (thetaI / (CRATER_REFERENCE_IMPACT_ANGLE_DEG * DEG)) *
    craterScale(surface);
  return Math.max(0, Math.min(raw, CRATER_MAX_ANGLE_DEG * DEG, thetaI, Math.PI / 2 - thetaI));
}
