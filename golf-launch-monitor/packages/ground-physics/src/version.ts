/** Version of the bounce / skid / roll model (docs/terrain-model.md). Bump on any behaviour change. */
export const GROUND_MODEL_VERSION = "glm-ground-0.1.0-provisional";

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
  /** Upper bound on resolved bounces before the ball is forced into the roll phase. */
  readonly maxBounces: number;
  /** Contact-point slip speed below which sliding becomes rolling, m/s. */
  readonly slipToRollToleranceMps: number;
};

export const DEFAULT_GROUND_SETTINGS: GroundSettings = Object.freeze({
  rollTimestepS: 0.001,
  restSpeedMps: 0.01,
  minBounceNormalSpeedMps: 0.25,
  maxBounces: 20,
  slipToRollToleranceMps: 1e-3,
});
