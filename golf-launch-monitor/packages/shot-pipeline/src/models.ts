import { propagatePositions } from "@glm/ballistics";
import type { TrajectoryModel } from "@glm/launch-state";
import type { TruthPropagator } from "@glm/sensor-adapters";
import type { BallAerodynamicsProfile, EnvironmentProfile, Vec3 } from "@glm/shared-types";

/**
 * Trajectory model for the launch fit that includes drag and Magnus lift for an assumed spin
 * vector. Over a 10-30 ms capture window drag alone changes a driver's speed by roughly 1 %,
 * so a gravity-only fit would bias ball speed low; this model removes that bias.
 */
export function createAeroTrajectoryModel(
  environment: EnvironmentProfile,
  ballProfile: BallAerodynamicsProfile,
  angularVelocityRadPerSec: Vec3,
  timestepS = 0.0005,
): TrajectoryModel {
  return {
    id: `aero-rk4:${ballProfile.id}`,
    predict: (p0, v0, dtS) => propagatePositions(p0, v0, angularVelocityRadPerSec, dtS, environment, ballProfile, { timestepS }),
  };
}

/** Ground-truth propagator for the synthetic generator (same physics as the simulator). */
export function createTruthPropagator(
  environment: EnvironmentProfile,
  ballProfile: BallAerodynamicsProfile,
  timestepS = 0.0002,
): TruthPropagator {
  return (p0, v0, omega0, dtS) => propagatePositions(p0, v0, omega0, dtS, environment, ballProfile, { timestepS });
}
