/**
 * PLAUSIBILITY ENVELOPE — a sanity check, NOT validation.
 *
 * Targets are widely published TrackMan PGA Tour averages (secondary sources). The same
 * averages were used to CHOOSE the provisional baseline parameters, so passing here cannot
 * be evidence of accuracy; it only guards against regressions that would make the default
 * physics implausible. TrackMan carry/height assume landing at launch height on flat ground,
 * so the ground here is the plane z = -r under a ball center launched from z = 0.
 */
import type { BallAerodynamicsProfile } from "@glm/shared-types";
import { describe, expect, it } from "vitest";
import {
  computeAcceleration,
  DEFAULT_INDOOR_ENVIRONMENT,
  DEFAULT_SIMULATION_SETTINGS,
  getBallProfile,
  simulateFlightSegment,
} from "../src/index";
import { flatTerrain, launchState, METERS_PER_YARD } from "./helpers";

const profile = getBallProfile("premium-urethane-baseline");
const terrain = flatTerrain(-profile.diameterM / 2);

function metrics(speedMph: number, launchDeg: number, spinRpm: number, ballProfile: BallAerodynamicsProfile = profile) {
  const result = simulateFlightSegment(launchState(speedMph, launchDeg, spinRpm), {
    environment: DEFAULT_INDOOR_ENVIRONMENT,
    ballProfile,
    terrain,
    settings: DEFAULT_SIMULATION_SETTINGS,
  });
  const contact = result.contact;
  if (contact === null) throw new Error("no landing");
  const v = contact.state.velocityMps;
  return {
    carryYd: Math.hypot(contact.state.positionM.x, contact.state.positionM.y) / METERS_PER_YARD,
    apexYd: result.airFlight.apex.heightAboveLaunchM / METERS_PER_YARD,
    descentDeg: (Math.atan2(-v.z, Math.hypot(v.x, v.y)) * 180) / Math.PI,
  };
}

describe("plausibility envelope (sanity check, not validation)", () => {
  it("driver tour average: 167 mph, 10.9 deg, 2686 rpm -> carry 275 yd +/-6 %, apex 32 yd +/-20 %, descent 37 +/-6 deg", () => {
    const m = metrics(167, 10.9, 2686);
    expect(m.carryYd).toBeGreaterThan(275 * 0.94);
    expect(m.carryYd).toBeLessThan(275 * 1.06);
    expect(m.apexYd).toBeGreaterThan(32 * 0.8);
    expect(m.apexYd).toBeLessThan(32 * 1.2);
    expect(Math.abs(m.descentDeg - 37)).toBeLessThan(6);
  });

  it("7-iron tour average: 120 mph, 16.3 deg, 7097 rpm -> carry 172 yd +/-6 %, apex 32 yd +/-20 %, descent 50 +/-6 deg", () => {
    const m = metrics(120, 16.3, 7097);
    expect(m.carryYd).toBeGreaterThan(172 * 0.94);
    expect(m.carryYd).toBeLessThan(172 * 1.06);
    expect(m.apexYd).toBeGreaterThan(32 * 0.8);
    expect(m.apexYd).toBeLessThan(32 * 1.2);
    expect(Math.abs(m.descentDeg - 50)).toBeLessThan(6);
  });

  it("cannot identify the parameters: distinctly different drag/lift sets pass the same envelope", () => {
    const variant = (clCoefficient: number, clExponent: number, cdSupercritical: number, cdSpinSlope: number): BallAerodynamicsProfile => ({
      ...profile,
      dragModelParams: { ...profile.dragModelParams, cdSupercritical, cdSpinSlope },
      liftModelParams: { ...profile.liftModelParams, clCoefficient, clExponent },
    });
    const launches = [launchState(167, 10.9, 2686), launchState(120, 16.3, 7097)];
    for (const alt of [variant(0.4, 0.4, 0.2, 0.2), variant(0.6, 0.6, 0.18, 0.3)]) {
      const d = metrics(167, 10.9, 2686, alt);
      const i = metrics(120, 16.3, 7097, alt);
      expect(Math.abs(d.carryYd / 275 - 1)).toBeLessThan(0.06);
      expect(Math.abs(d.apexYd / 32 - 1)).toBeLessThan(0.2);
      expect(Math.abs(d.descentDeg - 37)).toBeLessThan(6);
      expect(Math.abs(i.carryYd / 172 - 1)).toBeLessThan(0.06);
      expect(Math.abs(i.apexYd / 32 - 1)).toBeLessThan(0.2);
      expect(Math.abs(i.descentDeg - 50)).toBeLessThan(6);
      // ...although its launch-state coefficients differ from the baseline's.
      let maxDragDiff = 0;
      let maxLiftDiff = 0;
      for (const l of launches) {
        const base = computeAcceleration(l.velocityMps, l.angularVelocityRadPerSec, DEFAULT_INDOOR_ENVIRONMENT, profile);
        const other = computeAcceleration(l.velocityMps, l.angularVelocityRadPerSec, DEFAULT_INDOOR_ENVIRONMENT, alt);
        maxDragDiff = Math.max(maxDragDiff, Math.abs(other.dragCoefficient - base.dragCoefficient));
        maxLiftDiff = Math.max(maxLiftDiff, Math.abs(other.liftCoefficient - base.liftCoefficient));
      }
      expect(maxDragDiff).toBeGreaterThan(0.014);
      expect(maxLiftDiff).toBeGreaterThan(0.016);
    }
  });
});
