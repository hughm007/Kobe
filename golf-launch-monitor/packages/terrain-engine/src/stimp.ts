/**
 * Stimpmeter <-> rolling-resistance conversion (docs/terrain-model.md §5).
 *
 * A ball leaving the Stimpmeter at speed v0 that rolls d on a flat green has a mean rolling
 * deceleration a = v0^2 / (2 d) (constant-deceleration kinematics). The contract's rolling-
 * resistance coefficient is defined as c = a / g on flat ground, so
 *
 *   c = v0^2 / (2 * d * g),   d = stimpFt * 0.3048 m.
 */

/** Exact international foot, m. Duplicated from @glm/units to keep this package dependency-light. */
const METERS_PER_FOOT = 0.3048;

/** Standard gravity (CGPM 1901), m/s^2. Reference g for the dimensionless coefficient. */
export const STANDARD_GRAVITY_MPS2 = 9.80665;

/**
 * Speed at which the ball leaves the Stimpmeter and rolls onto the green: 6.00 ft/s = 1.83 m/s.
 * Basis: USGA Stimpmeter description and Penner (2002) "The physics of putting" as quoted in
 * search results — secondary source, not verified on page. Other sources quote 1.94 m/s or
 * 2.41 m/s; treat this as PROVISIONAL.
 */
export const STIMPMETER_RELEASE_SPEED_MPS = 1.83;

/** Default green speed used for the catalog green, ft. A mid-range modern green; provisional. */
export const DEFAULT_GREEN_STIMP_FT = 10;

function assertPositiveFinite(name: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive finite number, got ${value}`);
  }
}

/**
 * Rolling-resistance coefficient c (deceleration / g) implied by a Stimpmeter reading.
 * Assumes the ball rolls the whole Stimp distance at constant deceleration on a level green
 * (ramp-exit skid and speed-dependent deceleration are ignored).
 */
export function rollingResistanceFromStimp(
  stimpFt: number,
  releaseSpeedMps: number = STIMPMETER_RELEASE_SPEED_MPS,
): number {
  assertPositiveFinite("stimpFt", stimpFt);
  assertPositiveFinite("releaseSpeedMps", releaseSpeedMps);
  const distanceM = stimpFt * METERS_PER_FOOT;
  return (releaseSpeedMps * releaseSpeedMps) / (2 * distanceM * STANDARD_GRAVITY_MPS2);
}

/** Inverse of rollingResistanceFromStimp: Stimp reading (ft) implied by coefficient c. */
export function stimpFromRollingResistance(
  rollingResistance: number,
  releaseSpeedMps: number = STIMPMETER_RELEASE_SPEED_MPS,
): number {
  assertPositiveFinite("rollingResistance", rollingResistance);
  assertPositiveFinite("releaseSpeedMps", releaseSpeedMps);
  const distanceM = (releaseSpeedMps * releaseSpeedMps) / (2 * rollingResistance * STANDARD_GRAVITY_MPS2);
  return distanceM / METERS_PER_FOOT;
}
