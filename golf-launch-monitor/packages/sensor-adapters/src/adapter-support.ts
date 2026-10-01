import type { ObservationKind, RawSensorObservation, Vec3 } from "@glm/shared-types";

/**
 * What startCapture() delivers for the software adapters:
 * - "all" (default): every not-yet-emitted shot, synchronously, before the promise resolves;
 * - "none": nothing; shots are delivered one at a time with emitNextShot() (interactive UIs).
 */
export type StartCaptureEmission = "all" | "none";

/**
 * Replay shot segmentation gap, s: a health, ball-address or trigger observation more than this
 * long after the current shot's most recent trigger starts a new shot (see replayShotEndIndices).
 * The synthetic session generator enforces it too, so a recorded synthetic session splits back
 * into exactly the shots that were generated.
 */
export const REPLAY_SHOT_GAP_S = 1;

const KIND_ORDER: readonly ObservationKind[] = [
  "health",
  "ball-address",
  "trigger",
  "ball-detection-2d",
  "ball-position-3d",
  "spin",
];

/** Distinct observation kinds present, in a canonical order. */
export function observationKindsOf(observations: Iterable<RawSensorObservation>): ObservationKind[] {
  const present = new Set<ObservationKind>();
  for (const observation of observations) present.add(observation.kind);
  return KIND_ORDER.filter((kind) => present.has(kind));
}

/** JSON cannot represent -0 (it is written as 0); normalising keeps replay round trips exact. */
export function withoutNegativeZero(value: number): number {
  return value === 0 ? 0 : value;
}

/** Vec3 copy with -0 components replaced by 0. */
export function vecWithoutNegativeZero(v: Vec3): Vec3 {
  return { x: withoutNegativeZero(v.x), y: withoutNegativeZero(v.y), z: withoutNegativeZero(v.z) };
}
