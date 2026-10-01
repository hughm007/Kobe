/** Version of the bounce / skid / roll model (docs/terrain-model.md). Bump on any behaviour change. */
export const GROUND_MODEL_VERSION = "glm-ground-0.3.0-provisional";

export type GroundSettings = {
  /** Fixed integration step for the skid/roll phase, s. */
  readonly rollTimestepS: number;
  /** A rolling ball slower than this, on a slope it cannot roll down, is at rest, m/s. */
  readonly restSpeedMps: number;
  /**
   * Outgoing normal speed below which a contact ends the bouncing phase and the ball starts
   * skidding/rolling, m/s. PROVISIONAL: 0.25 m/s gives a hop apex of v^2/(2g) ~= 3 mm
   * (~15 % of the ball radius, below turf blade height) and a hop of ~50 ms, which a
   * rigid-surface impulse model cannot meaningfully resolve.
   */
  readonly minBounceNormalSpeedMps: number;
  /**
   * Fastest tangential speed at which a low contact may enter the skid/roll phase, m/s.
   * PROVISIONAL (engineering choice, not fitted). Above it, a contact whose outgoing normal speed
   * is at or below minBounceNormalSpeedMps keeps skipping with exactly that normal speed (energy
   * taken from the tangential motion, so the total never increases) instead of rolling. Without
   * it, a grazing landing at 50 m/s was a long Coulomb skid with no crater losses while a
   * landing 0.01 deg steeper hopped and lost speed at every crater impact, so total jumped by
   * ~125 m (2.6x). With it the hop/roll decision is continuous in the outgoing normal speed until
   * the ball has slowed to this speed. 15 m/s is above the tangential speed at which normal
   * full-swing landings (descent > ~20 deg) reach the bounce threshold, so it does not change them.
   */
  readonly maxRollEntrySpeedMps: number;
  /** Upper bound on resolved bounces before the ball is forced into the roll phase. */
  readonly maxBounces: number;
  /** Contact-point slip speed below which sliding becomes rolling, m/s. */
  readonly slipToRollToleranceMps: number;
};

export const DEFAULT_GROUND_SETTINGS: GroundSettings = Object.freeze({
  rollTimestepS: 0.001,
  restSpeedMps: 0.01,
  minBounceNormalSpeedMps: 0.25,
  maxRollEntrySpeedMps: 15,
  maxBounces: 20,
  slipToRollToleranceMps: 1e-3,
});
