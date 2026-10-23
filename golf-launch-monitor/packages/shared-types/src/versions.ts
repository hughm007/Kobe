/**
 * Version identifiers for contracts defined in this package.
 *
 * Model versions (physics, ground, estimator) live with the package that implements the
 * model, so that changing a model forces a version bump in the same commit.
 */

/** Version of the world coordinate convention in docs/coordinate-system.md. */
export const COORDINATE_SYSTEM_VERSION = "glm-world-1.0";

/** Version of the persisted data contracts (shot records, replay files, exports). */
export const SCHEMA_VERSION = "glm-schema-0.1.0";

/** Version of the replay file format (JSON Lines). */
export const REPLAY_FORMAT_VERSION = "glm-replay-1";
