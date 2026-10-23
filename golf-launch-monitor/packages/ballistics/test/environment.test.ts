import { EnvironmentProfileSchema } from "@glm/shared-types";
import { describe, expect, it } from "vitest";
import {
  computeAirDynamicViscosity,
  computeMoistAirDensity,
  createEnvironmentProfile,
  DEFAULT_INDOOR_ENVIRONMENT,
  ENVIRONMENT_MODEL_VERSION,
  saturationVaporPressurePa,
  stationPressureFromAltitude,
} from "../src/index";
import type { EnvironmentInput } from "../src/index";

describe("moist-air density", () => {
  it("dry air at 20 C, 101325 Pa is ~1.2041 kg/m^3 (within 0.2 %)", () => {
    const rho = computeMoistAirDensity({ temperatureC: 20, pressurePa: 101325, relativeHumidity: 0 });
    expect(Math.abs(rho / 1.2041 - 1)).toBeLessThan(0.002);
    // Exact ideal-gas value for the stated constants.
    expect(rho).toBeCloseTo(101325 / (287.058 * 293.15), 12);
  });

  it("humidity LOWERS density at fixed temperature and pressure", () => {
    const dry = computeMoistAirDensity({ temperatureC: 30, pressurePa: 101325, relativeHumidity: 0 });
    const half = computeMoistAirDensity({ temperatureC: 30, pressurePa: 101325, relativeHumidity: 0.5 });
    const saturated = computeMoistAirDensity({ temperatureC: 30, pressurePa: 101325, relativeHumidity: 1 });
    expect(half).toBeLessThan(dry);
    expect(saturated).toBeLessThan(half);
    // ~1-2 % effect at 30 C: humidity matters but is not dominant.
    expect(1 - saturated / dry).toBeGreaterThan(0.01);
    expect(1 - saturated / dry).toBeLessThan(0.03);
  });

  it("saturation vapour pressure follows Buck: 611.21 Pa at 0 C, ~2339 Pa at 20 C", () => {
    expect(saturationVaporPressurePa(0)).toBeCloseTo(611.21, 6);
    expect(Math.abs(saturationVaporPressurePa(20) / 2339 - 1)).toBeLessThan(0.005);
    expect(saturationVaporPressurePa(30)).toBeGreaterThan(saturationVaporPressurePa(20));
  });

  it("rejects bad inputs with actionable messages", () => {
    expect(() => computeMoistAirDensity({ temperatureC: 20, pressurePa: 101325, relativeHumidity: 50 })).toThrow(
      /relativeHumidity must be a fraction/,
    );
    expect(() => computeMoistAirDensity({ temperatureC: 20, pressurePa: -1, relativeHumidity: 0.5 })).toThrow(/pressurePa/);
    expect(() => saturationVaporPressurePa(Number.NaN)).toThrow(/temperatureC/);
  });
});

describe("viscosity and ISA pressure", () => {
  it("Sutherland viscosity at 20 C is ~1.81e-5 Pa*s and rises with temperature", () => {
    const mu = computeAirDynamicViscosity(20);
    expect(Math.abs(mu / 1.81e-5 - 1)).toBeLessThan(0.01);
    expect(computeAirDynamicViscosity(0)).toBeCloseTo(1.716e-5, 12);
    expect(computeAirDynamicViscosity(35)).toBeGreaterThan(mu);
  });

  it("ISA station pressure at 1500 m is ~84.56 kPa", () => {
    expect(Math.abs(stationPressureFromAltitude(1500) - 84556)).toBeLessThan(10);
    expect(stationPressureFromAltitude(0)).toBe(101325);
    expect(stationPressureFromAltitude(1500, 102000)).toBeCloseTo(84556 * (102000 / 101325), -1);
  });

  it("throws outside the 0..11 km troposphere", () => {
    expect(() => stationPressureFromAltitude(-1)).toThrow(/altitudeM must be in \[0, 11000\]/);
    expect(() => stationPressureFromAltitude(11001)).toThrow(/ISA troposphere/);
    expect(() => stationPressureFromAltitude(Number.NaN)).toThrow();
  });
});

describe("createEnvironmentProfile", () => {
  it("fills defaults with fieldSource 'default' and computes density/viscosity", () => {
    const env = createEnvironmentProfile({});
    expect(env).toEqual(DEFAULT_INDOOR_ENVIRONMENT);
    expect(env.version).toBe(ENVIRONMENT_MODEL_VERSION);
    expect(env.temperatureC).toBe(20);
    expect(env.relativeHumidity).toBe(0.5);
    expect(env.altitudeM).toBe(0);
    expect(env.pressurePa).toBe(101325);
    expect(env.windMps).toEqual({ x: 0, y: 0, z: 0 });
    expect(env.indoorMode).toBe(true);
    expect(env.gravityMps2).toBe(9.80665);
    expect(env.fieldSources).toEqual({
      temperatureC: "default",
      pressurePa: "default",
      relativeHumidity: "default",
      altitudeM: "default",
      windMps: "default",
    });
    expect(env.airDensityKgM3).toBe(computeMoistAirDensity({ temperatureC: 20, pressurePa: 101325, relativeHumidity: 0.5 }));
    expect(env.airDensityKgM3).toBeGreaterThan(1.19);
    expect(env.airDensityKgM3).toBeLessThan(1.2041);
    expect(env.airDynamicViscosityPaS).toBe(computeAirDynamicViscosity(20));
    expect(EnvironmentProfileSchema.safeParse(env).success).toBe(true);
  });

  it("is deep-frozen", () => {
    const env = createEnvironmentProfile({ temperatureC: 25 });
    expect(Object.isFrozen(env)).toBe(true);
    expect(Object.isFrozen(env.windMps)).toBe(true);
    expect(Object.isFrozen(env.fieldSources)).toBe(true);
  });

  it("marks supplied fields 'user' unless overridden", () => {
    const env = createEnvironmentProfile({
      temperatureC: 28,
      relativeHumidity: 0.7,
      pressurePa: 99000,
      fieldSources: { pressurePa: "sensor" },
    });
    expect(env.fieldSources.temperatureC).toBe("user");
    expect(env.fieldSources.relativeHumidity).toBe("user");
    expect(env.fieldSources.pressurePa).toBe("sensor");
    expect(env.fieldSources.altitudeM).toBe("default");
    expect(env.fieldSources.windMps).toBe("default");
    expect(env.airDensityKgM3).toBeCloseTo(computeMoistAirDensity({ temperatureC: 28, pressurePa: 99000, relativeHumidity: 0.7 }), 12);
  });

  it("derives pressure from altitude when pressure is missing", () => {
    const env = createEnvironmentProfile({ altitudeM: 1500 });
    expect(env.pressurePa).toBe(stationPressureFromAltitude(1500));
    expect(env.fieldSources.pressurePa).toBe("derived");
    expect(env.fieldSources.altitudeM).toBe("user");
    expect(env.airDensityKgM3).toBeLessThan(DEFAULT_INDOOR_ENVIRONMENT.airDensityKgM3 * 0.86);
  });

  it("prefers a supplied pressure over altitude derivation", () => {
    const env = createEnvironmentProfile({ altitudeM: 1500, pressurePa: 90000 });
    expect(env.pressurePa).toBe(90000);
    expect(env.fieldSources.pressurePa).toBe("user");
  });

  it("never accepts density or viscosity as input", () => {
    const env = createEnvironmentProfile({ airDensityKgM3: 5, airDynamicViscosityPaS: 1 } as unknown as EnvironmentInput);
    expect(env.airDensityKgM3).toBe(DEFAULT_INDOOR_ENVIRONMENT.airDensityKgM3);
    expect(env.airDynamicViscosityPaS).toBe(DEFAULT_INDOOR_ENVIRONMENT.airDynamicViscosityPaS);
  });

  it("accepts outdoor wind and requires indoorMode false for it", () => {
    const env = createEnvironmentProfile({ windMps: { x: -4, y: 1, z: 0 }, indoorMode: false });
    expect(env.windMps).toEqual({ x: -4, y: 1, z: 0 });
    expect(env.fieldSources.windMps).toBe("user");
    expect(() => createEnvironmentProfile({ windMps: { x: -4, y: 0, z: 0 } })).toThrow(/pass indoorMode: false/);
  });

  it("validates ranges with actionable errors", () => {
    expect(() => createEnvironmentProfile({ temperatureC: 80 })).toThrow(/temperatureC must be in \[-40, 55\]/);
    expect(() => createEnvironmentProfile({ relativeHumidity: 55 })).toThrow(/a fraction: 0.5 means 50 %/);
    expect(() => createEnvironmentProfile({ pressurePa: 1013 })).toThrow(/1 hPa = 100 Pa/);
    expect(() => createEnvironmentProfile({ altitudeM: 12000 })).toThrow(/altitudeM must be in/);
    expect(() => createEnvironmentProfile({ gravityMps2: 1.62 })).toThrow(/gravityMps2/);
    expect(() => createEnvironmentProfile({ windMps: { x: 100, y: 0, z: 0 }, indoorMode: false })).toThrow(/\|windMps\|/);
    expect(() => createEnvironmentProfile({ windMps: { x: Number.NaN, y: 0, z: 0 }, indoorMode: false })).toThrow(/finite/);
    expect(() => createEnvironmentProfile({ temperatureC: Number.NaN })).toThrow(/temperatureC/);
  });

  it("refuses provenance for values that were not supplied", () => {
    expect(() => createEnvironmentProfile({ fieldSources: { pressurePa: "sensor" } })).toThrow(
      /fieldSources.pressurePa = "sensor" was given but pressurePa was not supplied/,
    );
  });

  it("below-sea-level altitude needs a measured pressure", () => {
    expect(() => createEnvironmentProfile({ altitudeM: -60 })).toThrow(/supply a measured pressurePa/);
    const env = createEnvironmentProfile({ altitudeM: -60, pressurePa: 102050 });
    expect(env.pressurePa).toBe(102050);
  });
});

describe("createEnvironmentProfile provenance integrity", () => {
  it("rejects null fields instead of labelling a made-up default as user data", () => {
    const nullable = ["temperatureC", "pressurePa", "relativeHumidity", "altitudeM", "windMps", "indoorMode", "gravityMps2", "fieldSources"];
    for (const name of nullable) {
      expect(() => createEnvironmentProfile({ [name]: null } as unknown as EnvironmentInput)).toThrow(
        new RegExp(`${name} is null; omit the field to use the default`),
      );
    }
    // An omitted field, by contrast, is a default and is labelled as one.
    const env = createEnvironmentProfile({ temperatureC: undefined });
    expect(env.temperatureC).toBe(20);
    expect(env.fieldSources.temperatureC).toBe("default");
  });

  it("never labels a supplied value 'default' and rejects invalid or unknown provenance overrides", () => {
    expect(() => createEnvironmentProfile({ temperatureC: 31, fieldSources: { temperatureC: "default" } })).toThrow(
      /fieldSources.temperatureC = "default" is reserved/,
    );
    expect(() =>
      createEnvironmentProfile({ temperatureC: 25, fieldSources: { temperatureC: "measured" } as unknown as EnvironmentInput["fieldSources"] }),
    ).toThrow(/must be one of "user", "sensor", "derived" for a supplied value, got "measured"/);
    expect(() =>
      createEnvironmentProfile({ fieldSources: { airDensityKgM3: "sensor" } as unknown as EnvironmentInput["fieldSources"] }),
    ).toThrow(/fieldSources.airDensityKgM3 is not a provenance field/);
    expect(() => createEnvironmentProfile({ indoorMode: "false" } as unknown as EnvironmentInput)).toThrow(/indoorMode must be a boolean/);
  });

  it("accepts 'derived' for a value the caller computed (e.g. station pressure from a reported QNH)", () => {
    const pressurePa = stationPressureFromAltitude(1200, 102300);
    const env = createEnvironmentProfile({ pressurePa, fieldSources: { pressurePa: "derived" } });
    expect(env.pressurePa).toBe(pressurePa);
    expect(env.fieldSources.pressurePa).toBe("derived");
    expect(env.fieldSources.temperatureC).toBe("default");
    expect(EnvironmentProfileSchema.safeParse(env).success).toBe(true);
    const sensed = createEnvironmentProfile({ temperatureC: 12.5, fieldSources: { temperatureC: "sensor" } });
    expect(sensed.fieldSources.temperatureC).toBe("sensor");
    expect(EnvironmentProfileSchema.safeParse(sensed).success).toBe(true);
  });
});
