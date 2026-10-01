import { AirFlightResultSchema } from "@glm/shared-types";
import type { BallAerodynamicsProfile, EnvironmentProfile, SimulationSettings, TerrainQuery } from "@glm/shared-types";
import { describe, expect, it } from "vitest";
import {
  createEnvironmentProfile,
  DEFAULT_INDOOR_ENVIRONMENT,
  DEFAULT_SIMULATION_SETTINGS,
  getBallProfile,
  PHYSICS_MODEL_VERSION,
  propagatePositions,
  simulateFlightSegment,
} from "../src/index";
import type { BallState, FlightSegmentResult } from "../src/index";
import { DEG, flatTerrain, launchState, planeTerrain } from "./helpers";

const profile = getBallProfile("premium-urethane-baseline");
const r = profile.diameterM / 2;
/** Flat range at launch height: the ball center starts at z = 0, so the ground is z = -r. */
const range = flatTerrain(-r);
const g = DEFAULT_INDOOR_ENVIRONMENT.gravityMps2;

function fly(
  initial: BallState,
  overrides: {
    environment?: EnvironmentProfile;
    settings?: Partial<SimulationSettings>;
    terrain?: TerrainQuery;
    startTimeS?: number;
    phase?: "air" | "bounce-air";
  } = {},
): FlightSegmentResult {
  return simulateFlightSegment(initial, {
    environment: overrides.environment ?? DEFAULT_INDOOR_ENVIRONMENT,
    ballProfile: profile,
    terrain: overrides.terrain ?? range,
    settings: { ...DEFAULT_SIMULATION_SETTINGS, ...overrides.settings },
    ...(overrides.startTimeS !== undefined ? { startTimeS: overrides.startTimeS } : {}),
    ...(overrides.phase !== undefined ? { phase: overrides.phase } : {}),
  });
}

function carryM(result: FlightSegmentResult): number {
  const c = result.contact;
  if (c === null) throw new Error("expected ground contact");
  return Math.hypot(c.state.positionM.x, c.state.positionM.y);
}

const driver = (spinRpm = 2686, tiltDeg = 0): BallState => launchState(167, 10.9, spinRpm, tiltDeg);

describe("near-vacuum analytic projectile", () => {
  const vacuum: EnvironmentProfile = { ...DEFAULT_INDOOR_ENVIRONMENT, airDensityKgM3: 1e-9 };

  it("landing time and range match the closed form within 1e-4 relative", () => {
    const v = 40;
    const angle = 30 * DEG;
    const initial: BallState = {
      positionM: { x: 0, y: 0, z: 0 },
      velocityMps: { x: v * Math.cos(angle), y: 0, z: v * Math.sin(angle) },
      angularVelocityRadPerSec: { x: 0, y: 0, z: 0 },
    };
    const result = fly(initial, { environment: vacuum });
    const tFlight = (2 * v * Math.sin(angle)) / g;
    const rangeM = v * Math.cos(angle) * tFlight;
    expect(result.airFlight.termination).toBe("ground-contact");
    expect(Math.abs(result.airFlight.flightTimeS / tFlight - 1)).toBeLessThan(1e-4);
    expect(Math.abs(carryM(result) / rangeM - 1)).toBeLessThan(1e-4);
    // Contact time is located to <= 1e-6 s.
    expect(Math.abs(result.airFlight.flightTimeS - tFlight)).toBeLessThan(1e-6);
    // Apex h = (v sin a)^2 / 2g.
    expect(result.airFlight.apex.heightAboveLaunchM).toBeCloseTo((v * Math.sin(angle)) ** 2 / (2 * g), 5);
  });

  it("locates a drop's contact time to <= 1e-6 s with the ball within one radius of the ground", () => {
    const h = 1.0;
    const initial: BallState = {
      positionM: { x: 0, y: 0, z: h + r },
      velocityMps: { x: 0, y: 0, z: 0 },
      angularVelocityRadPerSec: { x: 0, y: 0, z: 0 },
    };
    const result = fly(initial, { environment: vacuum, terrain: flatTerrain(0) });
    const tContact = Math.sqrt((2 * h) / g);
    const contact = result.contact;
    expect(contact).not.toBeNull();
    expect(Math.abs((contact?.timeS ?? 0) - tContact)).toBeLessThan(1e-6);
    const gap = (contact?.state.positionM.z ?? 0) - r;
    expect(gap).toBeLessThanOrEqual(0);
    expect(gap).toBeGreaterThan(-g * tContact * 1e-6);
  });
});

describe("spin, curvature, wind and density effects", () => {
  it("backspin raises apex and carry versus zero spin at the same speed and launch", () => {
    const spun = fly(driver(2686));
    const knuckle = fly(driver(0));
    expect(spun.airFlight.apex.heightAboveLaunchM).toBeGreaterThan(knuckle.airFlight.apex.heightAboveLaunchM + 5);
    expect(carryM(spun)).toBeGreaterThan(carryM(knuckle) + 20);
  });

  it("positive tilt curves right (final y < 0), negative tilt curves left, mirror-symmetric", () => {
    const fade = fly(driver(2686, 10));
    const draw = fly(driver(2686, -10));
    const yFade = fade.contact?.state.positionM.y ?? 0;
    const yDraw = draw.contact?.state.positionM.y ?? 0;
    expect(yFade).toBeLessThan(-5);
    expect(yDraw).toBeGreaterThan(5);
    expect(yFade).toBeCloseTo(-yDraw, 6);
    expect(fade.contact?.state.positionM.x).toBeCloseTo(draw.contact?.state.positionM.x ?? 0, 6);
    // Straight shot stays on the target line.
    expect(Math.abs(fly(driver()).contact?.state.positionM.y ?? 1)).toBeLessThan(1e-9);
  });

  it("headwind shortens carry and tailwind lengthens it", () => {
    const calm = carryM(fly(driver()));
    const head = carryM(fly(driver(), { environment: createEnvironmentProfile({ windMps: { x: -5, y: 0, z: 0 }, indoorMode: false }) }));
    const tail = carryM(fly(driver(), { environment: createEnvironmentProfile({ windMps: { x: 5, y: 0, z: 0 }, indoorMode: false }) }));
    expect(head).toBeLessThan(calm - 5);
    expect(tail).toBeGreaterThan(calm + 5);
  });

  it("a crosswind from the left (-Y wind) pushes the ball right", () => {
    const cross = fly(driver(), { environment: createEnvironmentProfile({ windMps: { x: 0, y: -5, z: 0 }, indoorMode: false }) });
    expect(cross.contact?.state.positionM.y ?? 0).toBeLessThan(-3);
  });

  it("lower air density at altitude (1600 m) lengthens driver carry", () => {
    const sea = carryM(fly(driver()));
    const altitudeEnv = createEnvironmentProfile({ altitudeM: 1600 });
    expect(altitudeEnv.airDensityKgM3).toBeLessThan(DEFAULT_INDOOR_ENVIRONMENT.airDensityKgM3 * 0.86);
    const high = carryM(fly(driver(), { environment: altitudeEnv }));
    expect(high / sea).toBeGreaterThan(1.02);
  });
});

describe("integrator properties", () => {
  it("timestep convergence: driver carry at dt = 1 ms vs 0.25 ms within 0.05 m", () => {
    const coarse = carryM(fly(driver(), { settings: { timestepS: 0.001 } }));
    const fine = carryM(fly(driver(), { settings: { timestepS: 0.00025 } }));
    expect(Math.abs(coarse - fine)).toBeLessThan(0.05);
  });

  it("is deterministic: two runs are deep-equal", () => {
    const a = fly(driver(2900, 4), { startTimeS: 0.25 });
    const b = fly(driver(2900, 4), { startTimeS: 0.25 });
    expect(a).toEqual(b);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("reports numerical failure without NaN positions", () => {
    const initial: BallState = {
      positionM: { x: 0, y: 0, z: 0 },
      velocityMps: { x: 1e200, y: 0, z: 1e199 },
      angularVelocityRadPerSec: { x: 0, y: -100, z: 0 },
    };
    const result = fly(initial);
    expect(result.airFlight.termination).toBe("numerical-failure");
    expect(result.contact).toBeNull();
    expect(Number.isFinite(result.airFlight.flightTimeS)).toBe(true);
    for (const s of result.airFlight.samples) {
      expect(Number.isFinite(s.positionM.x) && Number.isFinite(s.positionM.y) && Number.isFinite(s.positionM.z)).toBe(true);
    }
    expect(result.airFlight.applicabilityWarnings.some((w) => /numerical failure/.test(w))).toBe(true);
  });

  it("stops at maxFlightTimeS with termination max-time", () => {
    const result = fly(driver(), { settings: { maxFlightTimeS: 1.0005 } });
    expect(result.airFlight.termination).toBe("max-time");
    expect(result.contact).toBeNull();
    expect(result.airFlight.flightTimeS).toBeCloseTo(1.0005, 12);
    const last = result.airFlight.samples[result.airFlight.samples.length - 1];
    expect(last?.tS).toBeCloseTo(1.0005, 12);
  });

  it("rejects invalid settings and non-finite initial states", () => {
    expect(() => fly(driver(), { settings: { timestepS: 0 } })).toThrow(/timestepS/);
    expect(() => fly(driver(), { settings: { timestepS: 0.5 } })).toThrow(/timestepS/);
    expect(() => fly(driver(), { settings: { outputSampleIntervalS: -1 } })).toThrow(/outputSampleIntervalS/);
    expect(() => fly(driver(), { settings: { maxFlightTimeS: Number.POSITIVE_INFINITY } })).toThrow(/maxFlightTimeS/);
    const bad: BallState = { ...driver(), velocityMps: { x: Number.NaN, y: 0, z: 0 } };
    expect(() => fly(bad)).toThrow(/finite/);
    expect(() => fly(driver(), { startTimeS: -5 })).toThrow(/startTimeS must be a finite time >= 0/);
    expect(() => fly(driver(), { startTimeS: Number.NaN })).toThrow(/startTimeS/);
  });
});

describe("spin-decay stiffness (spin may only decay)", () => {
  const spinMag = (w: { x: number; y: number; z: number }): number => Math.hypot(w.x, w.y, w.z);
  const withDecay = (id: string, params: Record<string, number>, extra: Partial<BallAerodynamicsProfile> = {}): BallAerodynamicsProfile => ({
    ...profile,
    ...extra,
    spinDecayModelId: id,
    spinDecayModelParams: params,
  });
  const flyWith = (ballProfile: BallAerodynamicsProfile, initial: BallState, settings: Partial<SimulationSettings> = {}): FlightSegmentResult =>
    simulateFlightSegment(initial, {
      environment: DEFAULT_INDOOR_ENVIRONMENT,
      ballProfile,
      terrain: range,
      settings: { ...DEFAULT_SIMULATION_SETTINGS, ...settings },
    });

  it("rejects a decay time constant shorter than 4 timesteps instead of letting RK4 amplify the spin", () => {
    // RK4 on domega/dt = -omega/tau amplifies once h/tau > ~2.785: tauS = 1e-4 s at dt = 1 ms
    // previously produced ~3e9 rad/s of spin at "ground contact" with no warning.
    const stiff = withDecay("spin-decay-exponential-v0", { tauS: 1e-4 });
    expect(() => flyWith(stiff, driver())).toThrow(/time constant of 0.000100 s .* shorter than 4 timesteps/);
    expect(() =>
      propagatePositions(driver().positionM, driver().velocityMps, driver().angularVelocityRadPerSec, [0.1], DEFAULT_INDOOR_ENVIRONMENT, stiff),
    ).toThrow(/shorter than 4 timesteps/);
    // The same parameters resolve with a fine enough step.
    expect(flyWith(stiff, driver(), { timestepS: 2.5e-5, maxFlightTimeS: 0.05 }).airFlight.termination).toBe("max-time");
  });

  it("a short but resolvable time constant decays the spin monotonically", () => {
    const quick = withDecay("spin-decay-exponential-v0", { tauS: 0.004 });
    const result = flyWith(quick, driver());
    expect(result.airFlight.termination).toBe("ground-contact");
    const mags = result.airFlight.samples.map((x) => spinMag(x.angularVelocityRadPerSec));
    for (let i = 1; i < mags.length; i++) expect(mags[i] as number).toBeLessThanOrEqual(mags[i - 1] as number);
    // 0.1 s = 25 time constants: e^-25 ~ 1.4e-11.
    const at01 = result.airFlight.samples.find((x) => Math.abs(x.tS - 0.1) < 1e-9);
    expect(spinMag(at01?.angularVelocityRadPerSec ?? { x: 1, y: 1, z: 1 }) / (mags[0] as number)).toBeLessThan(1e-10);
  });

  it("decay that becomes unresolvable during flight (above the profile's speed range) is a numerical failure, not a landing", () => {
    // Moment model with an absurd cmSpinSlope: h/tau = 0.15 at 1 m/s (the profile's top speed,
    // so the parameter check passes) but h/tau grows with speed. Without the run-time check a
    // ball falling from 100 m would pass h/tau ~ 2.785 near 18.6 m/s, where RK4 amplifies the
    // spin; the flight must stop once h/tau > 1 (near 6.7 m/s).
    const h = 0.05;
    const env = DEFAULT_INDOOR_ENVIRONMENT;
    const cm = ((0.15 / h) * profile.momentOfInertiaKgM2) / (env.airDensityKgM3 * profile.crossSectionAreaM2 * r * r * 1);
    const stiffAtSpeed = withDecay("spin-decay-moment-v0", { cmSpinSlope: cm }, { applicableSpeedRangeMps: { min: 0.5, max: 1 } });
    const result = flyWith(
      stiffAtSpeed,
      { positionM: { x: 0, y: 0, z: 100 }, velocityMps: { x: 1, y: 0, z: 0 }, angularVelocityRadPerSec: { x: 0, y: -300, z: 0 } },
      { timestepS: h },
    );
    const af = result.airFlight;
    expect(af.termination).toBe("numerical-failure");
    expect(result.contact).toBeNull();
    expect(
      af.applicabilityWarnings.filter((w) => /time constant fell below one timestep .* too stiff for timestepS 0.05 s/.test(w)),
    ).toHaveLength(1);
    const last = af.samples[af.samples.length - 1];
    const speed = Math.hypot(last?.velocityMps.x ?? 0, last?.velocityMps.y ?? 0, last?.velocityMps.z ?? 0);
    // Stops at the first step whose start has h/tau > 1, i.e. air speed just above 1/0.15 m/s.
    expect(speed).toBeGreaterThan(1 / 0.15);
    expect(speed).toBeLessThan(1 / 0.15 + 0.5);
    const mags = af.samples.map((x) => spinMag(x.angularVelocityRadPerSec));
    for (let i = 1; i < mags.length; i++) expect(mags[i] as number).toBeLessThanOrEqual(mags[i - 1] as number);
    // propagatePositions throws on the same condition.
    expect(() =>
      propagatePositions({ x: 0, y: 0, z: 100 }, { x: 1, y: 0, z: 0 }, { x: 0, y: -300, z: 0 }, [3], env, stiffAtSpeed, { timestepS: h }),
    ).toThrow(/spin decay could not be integrated .* fell below one timestep/);
  });
});

describe("ground contact on terrain", () => {
  it("sloped plane: contact is one radius from the plane ALONG ITS NORMAL, not vertically", () => {
    const slope = 0.2;
    const plane = planeTerrain(-1, slope, 0);
    const result = fly(launchState(120, 16.3, 7097), { terrain: plane });
    const c = result.contact;
    expect(c).not.toBeNull();
    if (c === null) return;
    const n = { x: -slope / Math.hypot(slope, 1), y: 0, z: 1 / Math.hypot(slope, 1) };
    expect(c.terrain.normal.x).toBeCloseTo(n.x, 15);
    expect(c.terrain.normal.z).toBeCloseTo(n.z, 15);
    const p = c.state.positionM;
    const heightBelow = -1 + slope * p.x;
    const perpendicular = (p.z - heightBelow) * n.z;
    const vertical = p.z - heightBelow;
    expect(Math.abs(perpendicular - r)).toBeLessThan(1e-5);
    expect(vertical - r).toBeGreaterThan(3e-4);
    // Lands on the upslope well short of the flat-ground carry.
    expect(p.x).toBeLessThan(carryM(fly(launchState(120, 16.3, 7097))));
  });

  it("a ball starting slightly below a flat ground but moving up separates and flies normally", () => {
    const start = driver();
    const result = fly({ ...start, positionM: { x: 0, y: 0, z: -0.002 } });
    expect(result.airFlight.termination).toBe("ground-contact");
    expect(carryM(result)).toBeGreaterThan(200);
  });

  it("bounce-air: starts in contact moving away, reports the NEXT contact with absolute times", () => {
    const start: BallState = {
      positionM: { x: 50, y: 0, z: 0 },
      velocityMps: { x: 5, y: 0, z: 3 },
      angularVelocityRadPerSec: { x: 0, y: -100, z: 0 },
    };
    const result = fly(start, { phase: "bounce-air", startTimeS: 6.5 });
    const af = result.airFlight;
    expect(af.termination).toBe("ground-contact");
    expect(af.flightTimeS).toBeGreaterThan(0.95 * ((2 * 3) / g));
    expect(af.flightTimeS).toBeLessThan(1.05 * ((2 * 3) / g));
    expect(af.samples[0]?.tS).toBe(6.5);
    expect(af.samples.every((s) => s.phase === "bounce-air")).toBe(true);
    expect(result.contact?.timeS).toBeCloseTo(6.5 + af.flightTimeS, 12);
    expect(af.apex.timeS).toBeGreaterThan(6.5);
  });

  it("bounce-air with negligible outward speed reports contact after exactly one step (no zero-length segment)", () => {
    const start: BallState = {
      positionM: { x: 50, y: 0, z: 0 },
      velocityMps: { x: 1, y: 0, z: 1e-5 },
      angularVelocityRadPerSec: { x: 0, y: 0, z: 0 },
    };
    const result = fly(start, { phase: "bounce-air", startTimeS: 3 });
    expect(result.airFlight.flightTimeS).toBe(DEFAULT_SIMULATION_SETTINGS.timestepS);
    expect(result.contact?.timeS).toBeCloseTo(3.001, 12);
  });

  it("a segment starting on the ground moving INTO it (topped shot) reports contact at its start, not a step later embedded", () => {
    const a = -5 * DEG;
    const initial: BallState = {
      positionM: { x: 3, y: 1, z: 0 },
      velocityMps: { x: 70 * Math.cos(a), y: 0, z: 70 * Math.sin(a) },
      angularVelocityRadPerSec: { x: 0, y: -200, z: 0 },
    };
    for (const startTimeS of [0, 1.25]) {
      const result = fly(initial, { startTimeS });
      expect(result.airFlight.termination).toBe("ground-contact");
      expect(result.contact?.timeS).toBe(startTimeS);
      expect(result.airFlight.flightTimeS).toBe(0);
      expect(result.contact?.state).toEqual(initial);
      expect(result.airFlight.samples).toHaveLength(1);
      expect(result.airFlight.samples[0]?.tS).toBe(startTimeS);
      expect(result.airFlight.apex.heightAboveLaunchM).toBe(0);
    }
    expect(AirFlightResultSchema.safeParse(fly(initial).airFlight).success).toBe(true);
  });

  it("a segment starting just above the ground (within the separation tolerance) moving into it locates the crossing", () => {
    const a = -5 * DEG;
    const vz = 70 * Math.sin(a);
    const gap0 = 5e-10;
    const result = fly({
      positionM: { x: 0, y: 0, z: gap0 },
      velocityMps: { x: 70 * Math.cos(a), y: 0, z: vz },
      angularVelocityRadPerSec: { x: 0, y: -200, z: 0 },
    });
    const c = result.contact;
    expect(c).not.toBeNull();
    expect(Math.abs((c?.timeS ?? 1) - gap0 / -vz)).toBeLessThan(1e-6);
    const gap = (c?.state.positionM.z ?? 0) + r - r;
    expect(gap).toBeLessThanOrEqual(0);
    expect(gap).toBeGreaterThan(-1e-6);
  });

  it("an air segment starting on the ground moving along it (putt) hands over after one step", () => {
    const result = fly({
      positionM: { x: 0, y: 0, z: 0 },
      velocityMps: { x: 2, y: 0, z: 0 },
      angularVelocityRadPerSec: { x: 0, y: 0, z: 0 },
    });
    expect(result.airFlight.termination).toBe("ground-contact");
    expect(result.airFlight.flightTimeS).toBe(DEFAULT_SIMULATION_SETTINGS.timestepS);
  });
});

describe("AirFlightResult contents", () => {
  const result = fly(driver(), { startTimeS: 0.5 });
  const af = result.airFlight;

  it("records model provenance and validates against the shared schema", () => {
    expect(af.modelVersion).toBe(PHYSICS_MODEL_VERSION);
    expect(af.integrator).toEqual({ method: "rk4", timestepS: 0.001 });
    expect(af.dragModelId).toBe("drag-re-spin-v0");
    expect(af.liftModelId).toBe("lift-spin-power-v0");
    expect(af.spinDecayModelId).toBe("spin-decay-moment-v0");
    expect(AirFlightResultSchema.safeParse(af).success).toBe(true);
    expect(Object.isFrozen(af)).toBe(true);
    expect(Object.isFrozen(af.samples[3])).toBe(true);
    expect(Object.isFrozen(result.contact?.state.positionM)).toBe(true);
  });

  it("samples every outputSampleIntervalS on the absolute clock plus initial and contact states", () => {
    const samples = af.samples;
    expect(samples[0]?.tS).toBe(0.5);
    expect(samples[1]?.tS).toBeCloseTo(0.51, 12);
    expect(samples[100]?.tS).toBeCloseTo(1.5, 12);
    for (let i = 1; i < samples.length; i++) {
      expect((samples[i]?.tS ?? 0) - (samples[i - 1]?.tS ?? 0)).toBeGreaterThan(0);
      expect((samples[i]?.tS ?? 0) - (samples[i - 1]?.tS ?? 0)).toBeLessThanOrEqual(0.01 + 1e-9);
    }
    const last = samples[samples.length - 1];
    expect(last?.tS).toBe(result.contact?.timeS);
    expect(last?.positionM).toEqual(result.contact?.state.positionM);
    expect(af.flightTimeS).toBeCloseTo((result.contact?.timeS ?? 0) - 0.5, 12);
    expect(samples.every((s) => s.phase === "air")).toBe(true);
  });

  it("apex is the maximum height of the segment", () => {
    const maxSampleZ = Math.max(...af.samples.map((s) => s.positionM.z));
    expect(af.apex.positionM.z).toBeGreaterThanOrEqual(maxSampleZ - 1e-9);
    expect(af.apex.positionM.z - maxSampleZ).toBeLessThan(1e-3);
    expect(af.apex.heightAboveLaunchM).toBe(af.apex.positionM.z);
    expect(af.apex.timeS).toBeGreaterThan(0.5);
    expect(af.apex.timeS).toBeLessThan(result.contact?.timeS ?? 0);
  });

  it("spin magnitude decays while the spin axis direction is preserved", () => {
    const spin0 = af.samples[0]?.angularVelocityRadPerSec;
    const spin1 = result.contact?.state.angularVelocityRadPerSec;
    if (spin0 === undefined || spin1 === undefined) throw new Error("missing spin");
    const m0 = Math.hypot(spin0.x, spin0.y, spin0.z);
    const m1 = Math.hypot(spin1.x, spin1.y, spin1.z);
    expect(m1).toBeLessThan(m0 * 0.9);
    expect(m1).toBeGreaterThan(m0 * 0.5);
    const cosAngle = (spin0.x * spin1.x + spin0.y * spin1.y + spin0.z * spin1.z) / (m0 * m1);
    expect(cosAngle).toBeCloseTo(1, 12);
  });

  it("warns once about launch conditions outside the profile and model ranges", () => {
    expect(af.applicabilityWarnings).toEqual([]);
    const extreme = fly(launchState(220, 10, 12000));
    const w = extreme.airFlight.applicabilityWarnings;
    expect(w.filter((x) => /ball speed .* above the applicable range/.test(x))).toHaveLength(1);
    expect(w.filter((x) => /spin 12000 rpm is above the applicable range/.test(x))).toHaveLength(1);
    expect(w.filter((x) => /Reynolds number .* drag-re-spin-v0 .* and lift-spin-power-v0/.test(x))).toHaveLength(1);
    const knuckle = fly(driver(0)).airFlight.applicabilityWarnings;
    expect(knuckle.some((x) => /spin parameter 0.000 is outside the validity range of lift-spin-power-v0/.test(x))).toBe(true);
  });
});
