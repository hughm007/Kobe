/**
 * Registry of aerodynamic coefficient models and spin-decay models (docs/physics-model.md §3).
 *
 * A ball profile selects models by id and supplies their parameters. Model ids name a
 * FUNCTIONAL FORM; changing a form's equation requires a new id (and a physics version
 * bump), never an in-place edit, so stored shot records stay interpretable.
 */
import type { BallAerodynamicsProfile, NumericRange } from "@glm/shared-types";

/** Air-relative state seen by a coefficient model. */
export type AeroState = {
  /** |v_ball - wind|, m/s. */
  readonly speedMps: number;
  /** rho * |v_air| * d / mu. */
  readonly reynolds: number;
  /** S = |omega_perp| * r / |v_air| (spin component perpendicular to the air velocity only). */
  readonly spinParameter: number;
};

export interface CoefficientModel {
  readonly id: string;
  readonly description: string;
  readonly requiredParams: readonly string[];
  /** Range over which the functional form has literature support (coefficients are still provisional). */
  readonly validity: { readonly reynolds: NumericRange; readonly spinParameter: NumericRange };
  /** Throws if parameter values are physically meaningless (presence is checked separately). */
  validateParams?(params: Readonly<Record<string, number>>): void;
  evaluate(state: AeroState, params: Readonly<Record<string, number>>): number;
}

export type SpinDecayInput = {
  /** Air-relative ball speed, m/s. */
  readonly speedMps: number;
  /** |omega| (total, including rifle spin), rad/s. */
  readonly angularSpeedRadPerSec: number;
  readonly airDensityKgM3: number;
};

export interface SpinDecayModel {
  readonly id: string;
  readonly description: string;
  readonly requiredParams: readonly string[];
  validateParams?(params: Readonly<Record<string, number>>): void;
  /** d|omega|/dt, rad/s^2. Always <= 0 (aerodynamic torque only removes spin). */
  angularDeceleration(input: SpinDecayInput, profile: BallAerodynamicsProfile): number;
}

function requirePositive(modelId: string, params: Readonly<Record<string, number>>, names: readonly string[]): void {
  for (const name of names) {
    const value = params[name] as number;
    if (!(value > 0)) throw new RangeError(`${modelId}: parameter ${name} must be > 0, got ${value}`);
  }
}

function requireNonNegative(modelId: string, params: Readonly<Record<string, number>>, names: readonly string[]): void {
  for (const name of names) {
    const value = params[name] as number;
    if (!(value >= 0)) throw new RangeError(`${modelId}: parameter ${name} must be >= 0, got ${value}`);
  }
}

/**
 * C_D = cdSupercritical + cdCrisisRise / (1 + exp((Re - reCritical) / reWidth)) + cdSpinSlope * S
 *
 * Logistic drag rise below the dimpled-ball critical Reynolds number (drag crisis) plus
 * linear growth of drag with spin parameter (spin-induced wake asymmetry / induced drag).
 */
export const DRAG_RE_SPIN_V0: CoefficientModel = Object.freeze({
  id: "drag-re-spin-v0",
  description:
    "C_D = cdSupercritical + cdCrisisRise/(1+exp((Re-reCritical)/reWidth)) + cdSpinSlope*S: logistic drag-crisis rise below the dimpled-ball critical Re plus linear spin-induced drag",
  requiredParams: Object.freeze(["cdSupercritical", "cdCrisisRise", "reCritical", "reWidth", "cdSpinSlope"]),
  validity: Object.freeze({
    reynolds: Object.freeze({ min: 4.0e4, max: 2.5e5 }),
    spinParameter: Object.freeze({ min: 0, max: 0.4 }),
  }),
  validateParams(params: Readonly<Record<string, number>>): void {
    requirePositive("drag-re-spin-v0", params, ["cdSupercritical", "reCritical", "reWidth"]);
    requireNonNegative("drag-re-spin-v0", params, ["cdCrisisRise", "cdSpinSlope"]);
  },
  evaluate(state: AeroState, p: Readonly<Record<string, number>>): number {
    const x = (state.reynolds - (p["reCritical"] as number)) / (p["reWidth"] as number);
    // exp overflows to Infinity for very large x, giving a 0 crisis term: no NaN.
    const crisis = (p["cdCrisisRise"] as number) / (1 + Math.exp(x));
    return (p["cdSupercritical"] as number) + crisis + (p["cdSpinSlope"] as number) * Math.max(0, state.spinParameter);
  },
});

/**
 * C_L = min(clMax, clCoefficient * S^clExponent), S >= 0.
 * Power-law form reported by Smits & Smith (1994); coefficients are provisional.
 */
export const LIFT_SPIN_POWER_V0: CoefficientModel = Object.freeze({
  id: "lift-spin-power-v0",
  description:
    "C_L = min(clMax, clCoefficient*S^clExponent) for S >= 0 (power-law form after Smits & Smith 1994; coefficients provisional; no reverse-Magnus regime)",
  requiredParams: Object.freeze(["clCoefficient", "clExponent", "clMax"]),
  validity: Object.freeze({
    reynolds: Object.freeze({ min: 4.0e4, max: 2.5e5 }),
    spinParameter: Object.freeze({ min: 0.02, max: 0.4 }),
  }),
  validateParams(params: Readonly<Record<string, number>>): void {
    requirePositive("lift-spin-power-v0", params, ["clCoefficient", "clExponent"]);
    requireNonNegative("lift-spin-power-v0", params, ["clMax"]);
  },
  evaluate(state: AeroState, p: Readonly<Record<string, number>>): number {
    const s = state.spinParameter;
    if (!(s > 0)) return 0;
    return Math.min(p["clMax"] as number, (p["clCoefficient"] as number) * Math.pow(s, p["clExponent"] as number));
  },
});

/**
 * Aerodynamic spin-down torque I*domega/dt = -r*rho*A*C_M*v^2 with C_M = cmSpinSlope*S
 * (form after Tavares, Shannon & Melvin 1999), i.e.
 * domega/dt = -rho*A*cmSpinSlope*r^2*omega*v / I. Time constant I/(rho*A*cm*r^2*v) ∝ 1/v.
 */
export const SPIN_DECAY_MOMENT_V0: SpinDecayModel = Object.freeze({
  id: "spin-decay-moment-v0",
  description:
    "I*domega/dt = -r*rho*A*C_M*v^2 with C_M = cmSpinSlope*S (Tavares et al. 1999 form) => domega/dt = -rho*A*cmSpinSlope*r^2*omega*v/I",
  requiredParams: Object.freeze(["cmSpinSlope"]),
  validateParams(params: Readonly<Record<string, number>>): void {
    requireNonNegative("spin-decay-moment-v0", params, ["cmSpinSlope"]);
  },
  angularDeceleration(input: SpinDecayInput, profile: BallAerodynamicsProfile): number {
    const r = profile.diameterM / 2;
    const cm = profile.spinDecayModelParams["cmSpinSlope"] as number;
    const rate =
      (input.airDensityKgM3 * profile.crossSectionAreaM2 * cm * r * r * input.angularSpeedRadPerSec * input.speedMps) /
      profile.momentOfInertiaKgM2;
    return rate > 0 ? -rate : 0;
  },
});

/** domega/dt = -omega / tauS. Simple comparison model with a speed-independent time constant. */
export const SPIN_DECAY_EXPONENTIAL_V0: SpinDecayModel = Object.freeze({
  id: "spin-decay-exponential-v0",
  description: "domega/dt = -omega/tauS (speed-independent exponential decay; comparison model)",
  requiredParams: Object.freeze(["tauS"]),
  validateParams(params: Readonly<Record<string, number>>): void {
    requirePositive("spin-decay-exponential-v0", params, ["tauS"]);
  },
  angularDeceleration(input: SpinDecayInput, profile: BallAerodynamicsProfile): number {
    const rate = input.angularSpeedRadPerSec / (profile.spinDecayModelParams["tauS"] as number);
    return rate > 0 ? -rate : 0;
  },
});

const DRAG_MODELS: ReadonlyMap<string, CoefficientModel> = new Map([[DRAG_RE_SPIN_V0.id, DRAG_RE_SPIN_V0]]);
const LIFT_MODELS: ReadonlyMap<string, CoefficientModel> = new Map([[LIFT_SPIN_POWER_V0.id, LIFT_SPIN_POWER_V0]]);
const SPIN_DECAY_MODELS: ReadonlyMap<string, SpinDecayModel> = new Map([
  [SPIN_DECAY_MOMENT_V0.id, SPIN_DECAY_MOMENT_V0],
  [SPIN_DECAY_EXPONENTIAL_V0.id, SPIN_DECAY_EXPONENTIAL_V0],
]);

export const DRAG_MODEL_IDS: readonly string[] = Object.freeze([...DRAG_MODELS.keys()]);
export const LIFT_MODEL_IDS: readonly string[] = Object.freeze([...LIFT_MODELS.keys()]);
export const SPIN_DECAY_MODEL_IDS: readonly string[] = Object.freeze([...SPIN_DECAY_MODELS.keys()]);

function lookup<T>(kind: string, registry: ReadonlyMap<string, T>, id: string): T {
  const model = registry.get(id);
  if (model === undefined) {
    throw new Error(`Unknown ${kind} model id "${id}". Registered ${kind} models: ${[...registry.keys()].join(", ")}`);
  }
  return model;
}

export function getDragModel(id: string): CoefficientModel {
  return lookup("drag", DRAG_MODELS, id);
}

export function getLiftModel(id: string): CoefficientModel {
  return lookup("lift", LIFT_MODELS, id);
}

export function getSpinDecayModel(id: string): SpinDecayModel {
  return lookup("spin-decay", SPIN_DECAY_MODELS, id);
}

/**
 * Throws if `params` lacks any of the model's required parameters, if any value is not
 * finite, or if the model rejects the values.
 */
export function assertModelParams(
  model: { readonly id: string; readonly requiredParams: readonly string[]; validateParams?(p: Readonly<Record<string, number>>): void },
  params: Readonly<Record<string, number>>,
  context: string,
): void {
  const missing = model.requiredParams.filter((name) => !Object.prototype.hasOwnProperty.call(params, name));
  if (missing.length > 0) {
    throw new Error(
      `${context}: model "${model.id}" requires parameter(s) ${missing.join(", ")} which are missing (required: ${model.requiredParams.join(", ")})`,
    );
  }
  for (const name of model.requiredParams) {
    const value = params[name];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error(`${context}: model "${model.id}" parameter ${name} must be a finite number, got ${String(value)}`);
    }
  }
  model.validateParams?.(params);
}

export type ResolvedProfileModels = {
  readonly drag: CoefficientModel;
  readonly lift: CoefficientModel;
  readonly spinDecay: SpinDecayModel;
};

/**
 * Resolves the three models a ball profile names and checks their parameters. Throws a
 * descriptive Error on an unknown id or a missing/invalid parameter.
 */
export function resolveProfileModels(profile: BallAerodynamicsProfile): ResolvedProfileModels {
  const context = `ball profile "${profile.id}"`;
  const drag = getDragModel(profile.dragModelId);
  assertModelParams(drag, profile.dragModelParams, `${context} drag`);
  const lift = getLiftModel(profile.liftModelId);
  assertModelParams(lift, profile.liftModelParams, `${context} lift`);
  const spinDecay = getSpinDecayModel(profile.spinDecayModelId);
  assertModelParams(spinDecay, profile.spinDecayModelParams, `${context} spin decay`);
  return { drag, lift, spinDecay };
}
