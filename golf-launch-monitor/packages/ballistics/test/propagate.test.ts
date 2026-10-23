import { describe, expect, it } from "vitest";
import {
  DEFAULT_INDOOR_ENVIRONMENT,
  DEFAULT_SIMULATION_SETTINGS,
  getBallProfile,
  propagatePositions,
  simulateFlightSegment,
} from "../src/index";
import { flatTerrain, launchState } from "./helpers";

const profile = getBallProfile("premium-urethane-baseline");
const env = DEFAULT_INDOOR_ENVIRONMENT;
const launch = launchState(150, 12.5, 3200, 6, -2);

describe("propagatePositions", () => {
  const flight = simulateFlightSegment(launch, {
    environment: env,
    ballProfile: profile,
    terrain: flatTerrain(-profile.diameterM / 2),
    settings: { ...DEFAULT_SIMULATION_SETTINGS, outputSampleIntervalS: 0.0137 },
  });
  const samples = flight.airFlight.samples;

  it("matches simulateFlightSegment sample positions bit-for-bit at regular sample times", () => {
    const regular = samples.slice(0, -1); // all but the final (contact) sample
    const positions = propagatePositions(
      launch.positionM,
      launch.velocityMps,
      launch.angularVelocityRadPerSec,
      regular.map((s) => s.tS),
      env,
      profile,
    );
    expect(positions).toHaveLength(regular.length);
    positions.forEach((p, i) => expect(p).toEqual(regular[i]?.positionM));
  });

  it("matches the located contact position to sub-micrometre precision", () => {
    const contact = flight.contact;
    if (contact === null) throw new Error("no contact");
    const [p] = propagatePositions(launch.positionM, launch.velocityMps, launch.angularVelocityRadPerSec, [contact.timeS], env, profile);
    expect(p?.x).toBeCloseTo(contact.state.positionM.x, 7);
    expect(p?.y).toBeCloseTo(contact.state.positionM.y, 7);
    expect(p?.z).toBeCloseTo(contact.state.positionM.z, 7);
  });

  it("ignores the ground and supports repeated and zero times", () => {
    const positions = propagatePositions(
      launch.positionM,
      launch.velocityMps,
      launch.angularVelocityRadPerSec,
      [0, 0, 0.5, 0.5, 12],
      env,
      profile,
    );
    expect(positions[0]).toEqual(launch.positionM);
    expect(positions[1]).toEqual(launch.positionM);
    expect(positions[2]).toEqual(positions[3]);
    expect(positions[4]?.z).toBeLessThan(-10); // well below any ground: no contact handling
    expect(propagatePositions(launch.positionM, launch.velocityMps, launch.angularVelocityRadPerSec, [], env, profile)).toEqual([]);
  });

  it("converges with a finer timestep option", () => {
    const times = [0.1, 1.234, 3.3];
    const coarse = propagatePositions(launch.positionM, launch.velocityMps, launch.angularVelocityRadPerSec, times, env, profile);
    const fine = propagatePositions(launch.positionM, launch.velocityMps, launch.angularVelocityRadPerSec, times, env, profile, {
      timestepS: 0.00025,
    });
    coarse.forEach((p, i) => {
      const q = fine[i];
      expect(Math.hypot(p.x - (q?.x ?? 0), p.y - (q?.y ?? 0), p.z - (q?.z ?? 0))).toBeLessThan(1e-6);
    });
  });

  it("throws on negative, non-finite, or decreasing times and on a bad timestep", () => {
    const call = (dt: number[], timestepS?: number) =>
      propagatePositions(
        launch.positionM,
        launch.velocityMps,
        launch.angularVelocityRadPerSec,
        dt,
        env,
        profile,
        timestepS === undefined ? undefined : { timestepS },
      );
    expect(() => call([-0.1])).toThrow(/dtS\[0\] must be a finite time >= 0/);
    expect(() => call([0.1, Number.NaN])).toThrow(/dtS\[1\]/);
    expect(() => call([0.2, 0.1])).toThrow(/non-decreasing/);
    expect(() => call([0.1], 0)).toThrow(/timestepS/);
  });

  it("is deterministic", () => {
    const times = [0.05, 0.75, 2.5];
    const a = propagatePositions(launch.positionM, launch.velocityMps, launch.angularVelocityRadPerSec, times, env, profile);
    const b = propagatePositions(launch.positionM, launch.velocityMps, launch.angularVelocityRadPerSec, times, env, profile);
    expect(a).toEqual(b);
  });
});
