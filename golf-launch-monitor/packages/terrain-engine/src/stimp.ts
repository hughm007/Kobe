/**
 * Speed-dependent rolling resistance and the Stimpmeter relation (docs/terrain-model.md §4, §5).
 *
 * A rolling ball on level ground decelerates at
 *
 *   a(v) = c0 g (1 + beta v^2)
 *
 * where c0 = SurfaceProperties.rollingResistance is the LOW-SPEED coefficient and beta is
 * ROLLING_RESISTANCE_BETA_S2_PER_M2 (shared by this relation and the roll integrator in
 * @glm/ground-physics). Integrating v dv / a(v) from v0 to 0 gives the stopping distance
 *
 *   d = ln(1 + beta v0^2) / (2 c0 g beta)        (-> v0^2 / (2 c0 g) as beta -> 0)
 *
 * and, for a Stimpmeter reading (d = stimpFt * 0.3048 m at the release speed v0),
 *
 *   c0 = ln(1 + beta v0^2) / (2 g beta d).
 *
 * The speed term is bounded by the sliding friction mu (rollingDecelerationCoefficient): a
 * rolling ball never decelerates faster than a sliding one. The bound only binds above
 * rollingResistanceBoundSpeedMps (5.8 m/s on the normal fairway, 8.4 m/s on the green), far
 * above the Stimp release speed, so the Stimp relation above is exact as written.
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

/**
 * beta as REPORTED for Penner's green rolling-friction relation rho = (0.7028/s)(1 + 0.0065 v^2)
 * (s = Stimp reading in ft), attributed to Penner (2002) by US patents 7713148 / 8444149 /
 * 8757625 — secondary source, not verified on page, not traced to the paper.
 *
 * The relation is self-consistent only with v in ft/s: with deceleration (5/7) rho g,
 * g = 32.17 ft/s^2 and the 6 ft/s Stimp release it reproduces roll distance = s to 0.2 %
 * (with v in m/s it misses by 10 %), and its distance-averaged rho at 12 ft and 4 ft gives
 * Penner's quoted range 0.065-0.196. Hence the unit s^2/ft^2 (tested).
 */
export const PENNER_ROLLING_BETA_S2_PER_FT2 = 0.0065;

/**
 * beta in a(v) = c0 g (1 + beta v^2), s^2/m^2: the reported value converted from s^2/ft^2,
 * 0.0065 / 0.3048^2 = 0.06997. PROVISIONAL: fitted (reportedly) on a green at putting speeds
 * (<= ~2 m/s) and EXTRAPOLATED here to every surface and to fairway roll speeds. Unbounded,
 * (1 + beta v^2) would reach x7.6 at the straight driver's 9.7 m/s roll-phase start and x19.6 at
 * the knuckleball's 16.3 m/s; rollingDecelerationCoefficient bounds it at mu / c0 (x3.3 on the
 * normal fairway). No data checks that extrapolation.
 */
export const ROLLING_RESISTANCE_BETA_S2_PER_M2 = PENNER_ROLLING_BETA_S2_PER_FT2 / (METERS_PER_FOOT * METERS_PER_FOOT);

function assertPositiveFinite(name: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive finite number, got ${value}`);
  }
}

/** Multiplier (1 + beta v^2) on the low-speed rolling deceleration at speed v (m/s). */
export function rollingResistanceSpeedFactor(speedMps: number): number {
  if (!Number.isFinite(speedMps)) throw new RangeError(`speedMps must be finite, got ${speedMps}`);
  return 1 + ROLLING_RESISTANCE_BETA_S2_PER_M2 * speedMps * speedMps;
}

function assertNonNegativeFinite(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be non-negative and finite, got ${value}`);
  }
}

/**
 * Rolling-deceleration coefficient at speed v (deceleration / g_n on level ground), used by the
 * roll integrator in @glm/ground-physics:
 *
 *   c(v) = min(c0 (1 + beta v^2), max(c0, mu))
 *
 * Bound (mechanics, not a fit): with rolling resistance as the moment of the contact pressure
 * acting ahead of the centre (the usual picture on a deformable surface), the only force
 * decelerating a rolling ball on level ground is contact friction, which Coulomb's law bounds
 * at mu m g_n. A ball asked to decelerate harder slips and then decelerates at exactly mu g_n,
 * so a rolling ball never decelerates faster than a sliding one. A surface whose low-speed c0
 * already reaches mu (the bunker's sand-ploughing guess) keeps c0 at every speed. c0, the Stimp
 * relation and the rest thresholds are unchanged. `slidingFriction` = +Infinity gives the
 * unbounded relation.
 */
export function rollingDecelerationCoefficient(rollingResistance: number, speedMps: number, slidingFriction: number): number {
  assertNonNegativeFinite("rollingResistance", rollingResistance);
  if (!Number.isFinite(speedMps)) throw new RangeError(`speedMps must be finite, got ${speedMps}`);
  if (Number.isNaN(slidingFriction) || slidingFriction < 0) {
    throw new RangeError(`slidingFriction must be non-negative, got ${slidingFriction}`);
  }
  return Math.min(rollingResistance * rollingResistanceSpeedFactor(speedMps), Math.max(rollingResistance, slidingFriction));
}

/**
 * Speed (m/s) above which the mu bound of rollingDecelerationCoefficient binds:
 * sqrt((mu / c0 - 1) / beta) for mu > c0; 0 if c0 >= mu (no speed term); +Infinity for c0 = 0.
 */
export function rollingResistanceBoundSpeedMps(rollingResistance: number, slidingFriction: number): number {
  assertNonNegativeFinite("rollingResistance", rollingResistance);
  if (Number.isNaN(slidingFriction) || slidingFriction < 0) {
    throw new RangeError(`slidingFriction must be non-negative, got ${slidingFriction}`);
  }
  if (rollingResistance === 0) return Number.POSITIVE_INFINITY;
  if (slidingFriction <= rollingResistance) return 0;
  return Math.sqrt((slidingFriction / rollingResistance - 1) / ROLLING_RESISTANCE_BETA_S2_PER_M2);
}

/**
 * Closed-form distance (m) for a ball ROLLING at `speedMps` on level ground to stop under
 * a(v) = c(v) g with c(v) = rollingDecelerationCoefficient(c0, v, mu). Unbounded (the default,
 * mu = +Infinity) it is ln(1 + beta v0^2) / (2 c0 g beta). Above the bound speed v_b the ball
 * decelerates at max(c0, mu) g, so
 *
 *   d = (v0^2 - v_b^2) / (2 max(c0, mu) g) + ln(1 + beta v_b^2) / (2 c0 g beta)      (v0 > v_b)
 *
 * Infinite for c0 = 0.
 */
export function flatRollingDistanceM(
  rollingResistance: number,
  speedMps: number,
  gravityMps2: number = STANDARD_GRAVITY_MPS2,
  slidingFriction: number = Number.POSITIVE_INFINITY,
): number {
  assertNonNegativeFinite("rollingResistance", rollingResistance);
  if (!Number.isFinite(speedMps)) throw new RangeError(`speedMps must be finite, got ${speedMps}`);
  assertPositiveFinite("gravityMps2", gravityMps2);
  if (speedMps === 0) return 0;
  if (rollingResistance === 0) return Number.POSITIVE_INFINITY;
  const beta = ROLLING_RESISTANCE_BETA_S2_PER_M2;
  const v0 = Math.abs(speedMps);
  const vb = Math.min(v0, rollingResistanceBoundSpeedMps(rollingResistance, slidingFriction));
  const bounded = (v0 * v0 - vb * vb) / (2 * Math.max(rollingResistance, slidingFriction) * gravityMps2);
  return bounded + Math.log1p(beta * vb * vb) / (2 * rollingResistance * gravityMps2 * beta);
}

/**
 * Low-speed rolling-resistance coefficient c0 implied by a Stimpmeter reading: the ball leaves
 * the ramp rolling at `releaseSpeedMps` and rolls stimpFt * 0.3048 m on a level green under
 * a(v) = c0 g (1 + beta v^2), so c0 = ln(1 + beta v0^2) / (2 g beta d). The ramp-exit skid is
 * ignored.
 */
export function rollingResistanceFromStimp(
  stimpFt: number,
  releaseSpeedMps: number = STIMPMETER_RELEASE_SPEED_MPS,
): number {
  assertPositiveFinite("stimpFt", stimpFt);
  assertPositiveFinite("releaseSpeedMps", releaseSpeedMps);
  const distanceM = stimpFt * METERS_PER_FOOT;
  const beta = ROLLING_RESISTANCE_BETA_S2_PER_M2;
  return Math.log1p(beta * releaseSpeedMps * releaseSpeedMps) / (2 * STANDARD_GRAVITY_MPS2 * beta * distanceM);
}

/** Inverse of rollingResistanceFromStimp: Stimp reading (ft) implied by the low-speed coefficient c0. */
export function stimpFromRollingResistance(
  rollingResistance: number,
  releaseSpeedMps: number = STIMPMETER_RELEASE_SPEED_MPS,
): number {
  assertPositiveFinite("rollingResistance", rollingResistance);
  assertPositiveFinite("releaseSpeedMps", releaseSpeedMps);
  return flatRollingDistanceM(rollingResistance, releaseSpeedMps) / METERS_PER_FOOT;
}
