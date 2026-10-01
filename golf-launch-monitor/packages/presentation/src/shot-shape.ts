/**
 * Golfer shot-shape label from spin-axis tilt (docs/coordinate-system.md §6).
 * Handedness never changes the physics sign; it only swaps the words:
 * a right-curving ball (positive tilt) is a fade/slice for a right-hander and a draw/hook for a
 * left-hander.
 */
import type { Handedness } from "@glm/shared-types";
import { degToRad } from "@glm/units";

export type ShotShape = "straight" | "draw" | "fade" | "hook" | "slice" | "unknown";

/** |tilt| <= this is "straight". */
export const SHOT_SHAPE_STRAIGHT_MAX_DEG = 2;
/** |tilt| > this is a hook / slice rather than a draw / fade. */
export const SHOT_SHAPE_SEVERE_MIN_DEG = 12;
export const SHOT_SHAPE_STRAIGHT_MAX_RAD = degToRad(SHOT_SHAPE_STRAIGHT_MAX_DEG);
export const SHOT_SHAPE_SEVERE_MIN_RAD = degToRad(SHOT_SHAPE_SEVERE_MIN_DEG);

/**
 * Classify by spin-axis tilt alone (radians, positive = curves right). Start direction is not
 * considered, so a push-fade and a pull-fade are both "fade". null -> "unknown"; non-finite throws.
 */
export function shotShapeLabel(spinAxisTiltRad: number | null, handedness: Handedness): ShotShape {
  if (handedness !== "right" && handedness !== "left") {
    throw new RangeError(`shotShapeLabel: unknown handedness "${String(handedness)}"`);
  }
  if (spinAxisTiltRad === null) return "unknown";
  if (typeof spinAxisTiltRad !== "number" || !Number.isFinite(spinAxisTiltRad)) {
    throw new RangeError(`shotShapeLabel: tilt must be a finite number or null, got ${String(spinAxisTiltRad)}`);
  }
  const magnitude = Math.abs(spinAxisTiltRad);
  if (magnitude <= SHOT_SHAPE_STRAIGHT_MAX_RAD) return "straight";
  const severe = magnitude > SHOT_SHAPE_SEVERE_MIN_RAD;
  const curvesRight = spinAxisTiltRad > 0;
  // Right-handed: right curve = fade/slice. Left-handed: right curve = draw/hook.
  const awayFromBody = curvesRight === (handedness === "right");
  if (awayFromBody) return severe ? "slice" : "fade";
  return severe ? "hook" : "draw";
}
