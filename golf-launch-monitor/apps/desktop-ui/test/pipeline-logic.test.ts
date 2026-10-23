import { createEnvironmentProfile } from "@glm/ballistics";
import { DEFAULT_SYNTHETIC_NOISE, defaultSyntheticSensorConfiguration, validateSyntheticNoiseModel } from "@glm/sensor-adapters";
import type { Player } from "@glm/shared-types";
import { describe, expect, it } from "vitest";
import { buildPipelineConfig, buildPipelineSettings, clampMonteCarloSamples, MAX_MONTE_CARLO_SAMPLES } from "../src/pipeline/config";
import { checkEnvironment, DEFAULT_ENVIRONMENT_SETTINGS, environmentInput, windVectorFrom } from "../src/pipeline/environment";
import { manualLaunchVectors } from "../src/pipeline/manual";
import { getNoisePreset, NOISE_PRESETS } from "../src/pipeline/noise-presets";
import { sourceAvailability } from "../src/pipeline/sources";
import { DEFAULT_BAG } from "../src/state/settings";
import { NOISE_PRESET_IDS } from "../src/worker/protocol";

const lefty: Player = { id: "p1", displayName: "L", handedness: "left", createdUtc: "2026-10-01T00:00:00.000Z" };
const driver = DEFAULT_BAG.find((c) => c.category === "driver")!;

describe("environment settings -> EnvironmentInput", () => {
  it("omits blank fields so the factory labels them DEFAULT", () => {
    expect(environmentInput(DEFAULT_ENVIRONMENT_SETTINGS)).toEqual({ indoorMode: true });
    const profile = createEnvironmentProfile(environmentInput(DEFAULT_ENVIRONMENT_SETTINGS));
    expect(Object.values(profile.fieldSources).every((s) => s === "default")).toBe(true);
  });

  it("uses pressure OR altitude, never both", () => {
    const both = { ...DEFAULT_ENVIRONMENT_SETTINGS, pressurePa: 90000, altitudeM: 1500 };
    expect(environmentInput({ ...both, pressureSource: "pressure" })).toEqual({ indoorMode: true, pressurePa: 90000 });
    expect(environmentInput({ ...both, pressureSource: "altitude" })).toEqual({ indoorMode: true, altitudeM: 1500 });
    const check = checkEnvironment({ ...both, pressureSource: "altitude" });
    expect(check.ok && check.profile.fieldSources.pressurePa).toBe("derived");
    // Thinner air at altitude: density below the sea-level default.
    const seaLevel = checkEnvironment(DEFAULT_ENVIRONMENT_SETTINGS);
    expect(check.ok && seaLevel.ok && check.profile.airDensityKgM3 < seaLevel.profile.airDensityKgM3).toBe(true);
  });

  it("never sends wind indoors, and converts wind FROM a direction into the world frame", () => {
    const windy = { ...DEFAULT_ENVIRONMENT_SETTINGS, windSpeedMps: 5, windFromDeg: 180 };
    expect(environmentInput(windy).windMps).toBeUndefined();
    expect(environmentInput({ ...windy, indoor: false }).windMps).toEqual({ x: 5, y: 0, z: 0 });
    // Headwind blows toward the golfer (-X); wind from the right blows toward the left (+Y).
    expect(windVectorFrom(4, 0)).toEqual({ x: -4, y: 0, z: 0 });
    expect(windVectorFrom(4, 90)).toEqual({ x: 0, y: 4, z: 0 });
    expect(windVectorFrom(4, 270)).toEqual({ x: 0, y: -4, z: 0 });
  });

  it("reports the ballistics validation message for impossible values", () => {
    const bad = checkEnvironment({ ...DEFAULT_ENVIRONMENT_SETTINGS, temperatureC: 90 });
    expect(bad.ok).toBe(false);
    expect(!bad.ok && bad.error).toMatch(/temperatureC must be in \[-40, 55\]/);
  });
});

describe("pipeline settings and config", () => {
  const selections = {
    sessionId: "s1",
    player: lefty,
    club: driver,
    ballProfileId: "range-ball-practice",
    environment: DEFAULT_ENVIRONMENT_SETTINGS,
    monteCarloSamples: 100,
    allowGenericSpinFallback: false,
    retainRawObservations: false,
  };

  it("maps player handedness and club category; no player means right-handed labels", () => {
    const s = buildPipelineSettings(selections);
    expect(s).toMatchObject({ playerId: "p1", handedness: "left", clubId: driver.id, clubCategory: "driver" });
    const none = buildPipelineSettings({ ...selections, player: null, club: null });
    expect(none).toMatchObject({ playerId: null, handedness: "right", clubId: null, clubCategory: null });
  });

  it("builds a PipelineConfig with the chosen ball, consent flags and injected ids", () => {
    const settings = buildPipelineSettings({ ...selections, allowGenericSpinFallback: true, retainRawObservations: true, monteCarloSamples: 37 });
    let n = 0;
    const config = buildPipelineConfig(
      settings,
      { sensorConfiguration: defaultSyntheticSensorConfiguration(), dataOrigin: "synthetic", calibration: null },
      { nextShotId: () => `x${++n}`, nowUtc: () => "2026-10-01T00:00:00.000Z" },
    );
    expect(config.ballProfile.id).toBe("range-ball-practice");
    expect(config.handedness).toBe("left");
    expect(config.clubCategory).toBe("driver");
    expect(config.allowGenericSpinFallback).toBe(true);
    expect(config.storeRawObservations).toBe(true);
    expect(config.simulationSettings.monteCarloSamples).toBe(37);
    expect(config.dataOrigin).toBe("synthetic");
    expect(config.calibration).toBeNull();
    expect(config.nextShotId()).toBe("x1");
    expect(config.environment.airDensityKgM3).toBeGreaterThan(1.1);
  });

  it("generic fallback and raw retention stay OFF unless explicitly enabled", () => {
    const s = buildPipelineSettings(selections);
    expect(s.allowGenericSpinFallback).toBe(false);
    expect(s.storeRawObservations).toBe(false);
  });

  it("clamps Monte Carlo samples to a sane integer range", () => {
    expect(clampMonteCarloSamples(-5)).toBe(0);
    expect(clampMonteCarloSamples(12.6)).toBe(13);
    expect(clampMonteCarloSamples(1e9)).toBe(MAX_MONTE_CARLO_SAMPLES);
    expect(clampMonteCarloSamples(Number.NaN)).toBe(100);
  });

  it("an unknown ball profile throws instead of silently substituting one", () => {
    const settings = buildPipelineSettings({ ...selections, ballProfileId: "nope" });
    expect(() =>
      buildPipelineConfig(
        settings,
        { sensorConfiguration: defaultSyntheticSensorConfiguration(), dataOrigin: "synthetic", calibration: null },
        { nextShotId: () => "x", nowUtc: () => "2026-10-01T00:00:00.000Z" },
      ),
    ).toThrow(/Unknown ball profile id "nope"/);
  });
});

describe("noise presets", () => {
  it("offers exactly the four presets, each a valid generator setting", () => {
    expect(NOISE_PRESETS.map((p) => p.id)).toEqual([...NOISE_PRESET_IDS]);
    for (const p of NOISE_PRESETS) expect(() => validateSyntheticNoiseModel(p.noise)).not.toThrow();
  });

  it("clean is the generator default; no-spin-observed emits no spin; poor-sync jitters timestamps", () => {
    expect(getNoisePreset("clean").noise).toEqual(DEFAULT_SYNTHETIC_NOISE);
    expect(getNoisePreset("no-spin-observed").noise.spin).toBeNull();
    expect(getNoisePreset("poor-sync").noise.timestampJitterS).toBeGreaterThan(DEFAULT_SYNTHETIC_NOISE.timestampJitterS);
    expect(getNoisePreset("realistic").noise.positionSigmaM.x).toBeGreaterThan(DEFAULT_SYNTHETIC_NOISE.positionSigmaM.x);
    expect(() => getNoisePreset("loud" as never)).toThrow(/Unknown noise preset/);
  });
});

describe("manual entry conversion", () => {
  it("uses the +left horizontal convention and |v| equals the typed speed", () => {
    const r = manualLaunchVectors({
      ballSpeedMph: 100,
      verticalLaunchDeg: 10,
      horizontalLaunchDegLeftPositive: 5,
      totalSpinRpm: null,
      spinAxisDegRightPositive: null,
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const v = r.velocityMps;
    expect(Math.hypot(v.x, v.y, v.z)).toBeCloseTo(44.704, 9);
    expect(v.y).toBeGreaterThan(0); // left
    expect((Math.atan2(v.z, Math.hypot(v.x, v.y)) * 180) / Math.PI).toBeCloseTo(10, 9);
    expect(r.angularVelocityRadPerSec).toBeNull();
  });

  it("builds a spin vector whose tilt sign makes a positive axis curve right (ω has -Y and -Z parts for v ∥ +X)", () => {
    const r = manualLaunchVectors({
      ballSpeedMph: 100,
      verticalLaunchDeg: 0,
      horizontalLaunchDegLeftPositive: 0,
      totalSpinRpm: 3000,
      spinAxisDegRightPositive: 10,
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const w = r.angularVelocityRadPerSec!;
    expect(Math.hypot(w.x, w.y, w.z)).toBeCloseTo((3000 * 2 * Math.PI) / 60, 6);
    expect(w.y).toBeLessThan(0); // backspin
    expect(w.z).toBeLessThan(0); // tilted right
  });

  it("zero spin is a zero vector; half-entered spin and out-of-range values are rejected", () => {
    const zero = manualLaunchVectors({ ballSpeedMph: 90, verticalLaunchDeg: 15, horizontalLaunchDegLeftPositive: 0, totalSpinRpm: 0, spinAxisDegRightPositive: 0 });
    expect(zero.ok && zero.angularVelocityRadPerSec).toEqual({ x: 0, y: 0, z: 0 });
    const half = manualLaunchVectors({ ballSpeedMph: 90, verticalLaunchDeg: 15, horizontalLaunchDegLeftPositive: 0, totalSpinRpm: 2500, spinAxisDegRightPositive: null });
    expect(half.ok).toBe(false);
    const bad = manualLaunchVectors({ ballSpeedMph: Number.NaN, verticalLaunchDeg: 95, horizontalLaunchDegLeftPositive: 0, totalSpinRpm: null, spinAxisDegRightPositive: null });
    expect(!bad.ok && bad.errors).toHaveLength(2);
  });
});

describe("data sources", () => {
  it("hardware sources are never selectable in Phase 1; manual needs developer mode", () => {
    for (const id of ["camera", "radar", "hybrid"] as const) {
      expect(sourceAvailability(id, true).enabled).toBe(false);
      expect(sourceAvailability(id, true).reason).toMatch(/No hardware driver exists yet/);
    }
    expect(sourceAvailability("manual", false).enabled).toBe(false);
    expect(sourceAvailability("manual", true).enabled).toBe(true);
    expect(sourceAvailability("synthetic", false).enabled).toBe(true);
    expect(sourceAvailability("replay", false).enabled).toBe(true);
  });
});
