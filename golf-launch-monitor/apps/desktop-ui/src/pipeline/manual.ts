/**
 * Developer manual entry: golfer-terms fields -> world-frame SI vectors for ManualEntryAdapter.
 * Signs follow docs/coordinate-system.md (horizontal launch +left; spin-axis tilt +right).
 * The bounds below are input sanity checks for a typing UI, not physical claims.
 */
import { angularVelocityFromSpin } from "@glm/launch-state";
import type { Vec3 } from "@glm/shared-types";
import { degToRad, mphToMps, rpmToRadPerSec } from "@glm/units";
import type { ManualLaunchFields } from "../worker/protocol";

export const MANUAL_LIMITS = Object.freeze({
  ballSpeedMph: { min: 1, max: 250 },
  verticalLaunchDeg: { min: -20, max: 80 },
  horizontalLaunchDeg: { min: -45, max: 45 },
  totalSpinRpm: { min: 0, max: 15000 },
  spinAxisDeg: { min: -89, max: 89 },
});

export type ManualVectors =
  | { readonly ok: true; readonly velocityMps: Vec3; readonly angularVelocityRadPerSec: Vec3 | null }
  | { readonly ok: false; readonly errors: readonly string[] };

function checkRange(errors: string[], name: string, value: number, range: { min: number; max: number }): void {
  if (typeof value !== "number" || !Number.isFinite(value) || value < range.min || value > range.max) {
    errors.push(`${name} must be a number from ${range.min} to ${range.max}.`);
  }
}

export function manualLaunchVectors(fields: ManualLaunchFields): ManualVectors {
  const errors: string[] = [];
  checkRange(errors, "Ball speed (mph)", fields.ballSpeedMph, MANUAL_LIMITS.ballSpeedMph);
  checkRange(errors, "Launch angle (°)", fields.verticalLaunchDeg, MANUAL_LIMITS.verticalLaunchDeg);
  checkRange(errors, "Launch direction (°, + = left)", fields.horizontalLaunchDegLeftPositive, MANUAL_LIMITS.horizontalLaunchDeg);
  const spinGiven = fields.totalSpinRpm !== null;
  const axisGiven = fields.spinAxisDegRightPositive !== null;
  if (spinGiven) checkRange(errors, "Total spin (rpm)", fields.totalSpinRpm as number, MANUAL_LIMITS.totalSpinRpm);
  if (axisGiven) checkRange(errors, "Spin axis (°, + = curves right)", fields.spinAxisDegRightPositive as number, MANUAL_LIMITS.spinAxisDeg);
  // A spin vector needs both magnitude and axis; inventing the missing half would fabricate spin.
  if (spinGiven !== axisGiven) {
    errors.push("Enter both total spin and spin axis, or leave both blank (spin not provided).");
  }
  if (errors.length > 0) return { ok: false, errors };

  const speed = mphToMps(fields.ballSpeedMph);
  const vla = degToRad(fields.verticalLaunchDeg);
  const hla = degToRad(fields.horizontalLaunchDegLeftPositive);
  const velocityMps: Vec3 = {
    x: speed * Math.cos(vla) * Math.cos(hla),
    y: speed * Math.cos(vla) * Math.sin(hla),
    z: speed * Math.sin(vla),
  };
  if (!spinGiven) return { ok: true, velocityMps, angularVelocityRadPerSec: null };
  const totalRpm = fields.totalSpinRpm as number;
  const angularVelocityRadPerSec =
    totalRpm === 0
      ? { x: 0, y: 0, z: 0 }
      : angularVelocityFromSpin({
          totalSpinRadPerSec: rpmToRadPerSec(totalRpm),
          spinAxisTiltRad: degToRad(fields.spinAxisDegRightPositive as number),
          velocity: velocityMps,
        });
  return { ok: true, velocityMps, angularVelocityRadPerSec };
}
