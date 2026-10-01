import {
  deepFreeze,
  SURFACE_TYPES,
  SurfacePropertiesSchema,
  type LieType,
  type SurfaceProperties,
  type SurfaceType,
} from "@glm/shared-types";
import { DEFAULT_GREEN_STIMP_FT, rollingResistanceFromStimp, stimpFromRollingResistance } from "./stimp";
import { TERRAIN_MODEL_VERSION } from "./version";

/**
 * Surface catalog (docs/terrain-model.md §2).
 *
 * EVERY value here is a provisional model parameter, chosen to be physically ORDERED (firm
 * surfaces bounce higher and roll farther than soft ones), not fit to measurements. Basis per
 * parameter family:
 * - restitution: the green row is a linear fit, over 2-15 m/s, to the shape of Penner's (2002)
 *   turf restitution e = 0.510 - 0.0375 v' + 0.000903 v'^2 (secondary source, not verified on
 *   page). Penner's v' is the normal speed in a frame tilted by his crater angle; this model has
 *   no crater, so the fit is applied to the plain normal speed — an uncalibrated simplification
 *   (doc §2). Other turf rows are judgement, ordered by firmness (firmness order => restitution
 *   order across playable rows; tested).
 * - slidingFriction: putting-surface lab values span 0.11-0.40 (Griffiths & McKenzie,
 *   secondary source, not verified on page); turf values are placed in/above that band.
 * - rollingResistance (deceleration / g): green from the Stimp relation at 10 ft; other
 *   surfaces as Stimp-equivalent guesses (see the doc table).
 * - moistureSoftness: 0 for every playable surface, so catalog values are the dry reference.
 * Terminal surfaces (water, out-of-bounds, penalty-area) stop the ball on entry; their other
 * physical values are placeholders that the ground model never uses.
 */

type CatalogRow = Omit<SurfaceProperties, "type" | "version" | "provisional">;

const GREEN_ROLLING_RESISTANCE = rollingResistanceFromStimp(DEFAULT_GREEN_STIMP_FT);

const CATALOG_ROWS: Record<SurfaceType, CatalogRow> = {
  // Teeing ground: fairway-height turf, slightly softer from traffic/divots.
  tee: {
    firmness: 0.55,
    restitutionBase: 0.42,
    restitutionSpeedSlope: 0.022,
    restitutionMin: 0.11,
    slidingFriction: 0.4,
    rollingResistance: 0.13,
    moistureSoftness: 0,
    stimpFt: null,
    terminal: false,
  },
  // Synthetic hitting mat over a pad: firmer and livelier than turf, thick pile slows rolling.
  "range-mat": {
    firmness: 0.85,
    restitutionBase: 0.6,
    restitutionSpeedSlope: 0.012,
    restitutionMin: 0.3,
    slidingFriction: 0.45,
    rollingResistance: 0.1,
    moistureSoftness: 0,
    stimpFt: null,
    terminal: false,
  },
  // Dry, closely mown, firm fairway: highest-bounce turf and longest turf roll after the green.
  "fairway-firm": {
    firmness: 0.75,
    restitutionBase: 0.5,
    restitutionSpeedSlope: 0.02,
    restitutionMin: 0.15,
    slidingFriction: 0.4,
    rollingResistance: 0.09,
    moistureSoftness: 0,
    stimpFt: null,
    terminal: false,
  },
  // Typical fairway: restitution just below the green fit, Stimp-equivalent about 4.7 ft.
  "fairway-normal": {
    firmness: 0.6,
    restitutionBase: 0.42,
    restitutionSpeedSlope: 0.022,
    restitutionMin: 0.12,
    slidingFriction: 0.4,
    rollingResistance: 0.12,
    moistureSoftness: 0,
    stimpFt: null,
    terminal: false,
  },
  // Soft (recently irrigated / lush) fairway: absorbs more energy, rolls less.
  "fairway-soft": {
    firmness: 0.4,
    restitutionBase: 0.32,
    restitutionSpeedSlope: 0.02,
    restitutionMin: 0.08,
    slidingFriction: 0.45,
    rollingResistance: 0.17,
    moistureSoftness: 0,
    stimpFt: null,
    terminal: false,
  },
  // Intermediate cut between fairway and rough.
  "first-cut": {
    firmness: 0.5,
    restitutionBase: 0.36,
    restitutionSpeedSlope: 0.022,
    restitutionMin: 0.1,
    slidingFriction: 0.45,
    rollingResistance: 0.2,
    moistureSoftness: 0,
    stimpFt: null,
    terminal: false,
  },
  // Long grass cushions the impact and drags on a rolling ball.
  rough: {
    firmness: 0.3,
    restitutionBase: 0.25,
    restitutionSpeedSlope: 0.02,
    restitutionMin: 0.06,
    slidingFriction: 0.5,
    rollingResistance: 0.35,
    moistureSoftness: 0,
    stimpFt: null,
    terminal: false,
  },
  // Loose sand: the softest surface, very little rebound (balls often plug), almost no roll.
  bunker: {
    firmness: 0.1,
    restitutionBase: 0.1,
    restitutionSpeedSlope: 0.01,
    restitutionMin: 0.02,
    slidingFriction: 0.6,
    rollingResistance: 0.8,
    moistureSoftness: 0,
    stimpFt: null,
    terminal: false,
  },
  // Putting green: Penner-shaped restitution, lowest rolling resistance (Stimp 10 ft default).
  // Firmness is descriptive and placed to match its restitution (between firm and normal
  // fairway); whether real greens bounce livelier than fairways is not established here.
  green: {
    firmness: 0.65,
    restitutionBase: 0.45,
    restitutionSpeedSlope: 0.022,
    restitutionMin: 0.12,
    slidingFriction: 0.3,
    rollingResistance: GREEN_ROLLING_RESISTANCE,
    moistureSoftness: 0,
    stimpFt: DEFAULT_GREEN_STIMP_FT,
    terminal: false,
  },
  // Collar around the green: green-like bounce, roughly half the green speed (Stimp-eq. ~5 ft).
  fringe: {
    firmness: 0.5,
    restitutionBase: 0.4,
    restitutionSpeedSlope: 0.022,
    restitutionMin: 0.11,
    slidingFriction: 0.35,
    rollingResistance: 0.11,
    moistureSoftness: 0,
    stimpFt: null,
    terminal: false,
  },
  // Asphalt/concrete: firmest, highest restitution (golf-ball-on-rigid-surface regime), small
  // speed dependence. Rolling resistance kept just above the green's (aggregate texture); a
  // smooth path could roll faster — unknown, not measured.
  "cart-path": {
    firmness: 1,
    restitutionBase: 0.78,
    restitutionSpeedSlope: 0.004,
    restitutionMin: 0.6,
    slidingFriction: 0.55,
    rollingResistance: 0.06,
    moistureSoftness: 0,
    stimpFt: null,
    terminal: false,
  },
  // Terminal: the ball is lost on entry. Physical values are unused placeholders.
  water: {
    firmness: 0,
    restitutionBase: 0,
    restitutionSpeedSlope: 0,
    restitutionMin: 0,
    slidingFriction: 0,
    rollingResistance: 0,
    moistureSoftness: 1,
    stimpFt: null,
    terminal: true,
  },
  // Terminal for simulation purposes (out of play). Placeholder rough-like values.
  "out-of-bounds": {
    firmness: 0.3,
    restitutionBase: 0.25,
    restitutionSpeedSlope: 0.02,
    restitutionMin: 0.06,
    slidingFriction: 0.5,
    rollingResistance: 0.35,
    moistureSoftness: 0,
    stimpFt: null,
    terminal: true,
  },
  // Ground under a tree canopy (pine straw / bare soil / thin grass). Canopy collisions are
  // NOT modelled; this is only the ground beneath.
  trees: {
    firmness: 0.45,
    restitutionBase: 0.35,
    restitutionSpeedSlope: 0.02,
    restitutionMin: 0.08,
    slidingFriction: 0.5,
    rollingResistance: 0.25,
    moistureSoftness: 0,
    stimpFt: null,
    terminal: false,
  },
  // Terminal for simulation purposes (penalty relief applies). Placeholder rough-like values.
  "penalty-area": {
    firmness: 0.3,
    restitutionBase: 0.25,
    restitutionSpeedSlope: 0.02,
    restitutionMin: 0.06,
    slidingFriction: 0.5,
    rollingResistance: 0.35,
    moistureSoftness: 0,
    stimpFt: null,
    terminal: true,
  },
};

/** Surfaces that can never be played across: the ball is lost or out of play on entry. */
const ALWAYS_TERMINAL: readonly SurfaceType[] = ["water", "out-of-bounds"];

/**
 * Largest relative disagreement allowed between a stored stimpFt and rollingResistance
 * (converted at STIMPMETER_RELEASE_SPEED_MPS). Covers rounding of a hand-entered pair; a
 * larger gap would display one green speed while the physics rolls at another.
 */
const STIMP_CONSISTENCY_TOLERANCE = 0.01;

/** Validates contract schema plus cross-field rules the schema cannot express. */
function validateSurface(candidate: unknown): SurfaceProperties {
  const parsed = SurfacePropertiesSchema.parse(candidate);
  if (parsed.restitutionMin > parsed.restitutionBase) {
    throw new RangeError(
      `Surface "${parsed.type}": restitutionMin (${parsed.restitutionMin}) must be <= restitutionBase (${parsed.restitutionBase})`,
    );
  }
  for (const [key, value] of Object.entries(parsed)) {
    if (typeof value === "number" && !Number.isFinite(value)) {
      throw new RangeError(`Surface "${parsed.type}": ${key} must be finite, got ${value}`);
    }
  }
  if (ALWAYS_TERMINAL.includes(parsed.type) && !parsed.terminal) {
    throw new RangeError(`Surface "${parsed.type}" must be terminal (the ball cannot be played across it)`);
  }
  if (parsed.stimpFt !== null) {
    const implied = rollingResistanceFromStimp(parsed.stimpFt);
    if (!(Math.abs(parsed.rollingResistance - implied) <= STIMP_CONSISTENCY_TOLERANCE * implied)) {
      throw new RangeError(
        `Surface "${parsed.type}": rollingResistance ${parsed.rollingResistance} disagrees with stimpFt ${parsed.stimpFt} ` +
          `(implies ${implied.toFixed(5)}); give one of them, or set stimpFt to null`,
      );
    }
  }
  return parsed;
}

function buildCatalog(): Readonly<Record<SurfaceType, SurfaceProperties>> {
  const catalog = {} as Record<SurfaceType, SurfaceProperties>;
  for (const type of SURFACE_TYPES) {
    catalog[type] = validateSurface({
      type,
      version: TERRAIN_MODEL_VERSION,
      ...CATALOG_ROWS[type],
      provisional: true,
    });
  }
  return deepFreeze(catalog);
}

/** Every SurfaceType with its provisional properties. Deep-frozen. */
export const SURFACE_CATALOG: Readonly<Record<SurfaceType, SurfaceProperties>> = buildCatalog();

const SURFACE_TYPE_SET: ReadonlySet<unknown> = new Set(SURFACE_TYPES);

export function getSurface(type: SurfaceType): SurfaceProperties {
  // Membership test, not `catalog[type] !== undefined`: inherited keys such as "constructor"
  // or "__proto__" are not surface types.
  if (!SURFACE_TYPE_SET.has(type)) throw new RangeError(`Unknown surface type: ${String(type)}`);
  return SURFACE_CATALOG[type];
}

/** Fields whose change makes a surface differ from its base (re-versioned to "+custom"). */
const PROVENANCE_KEYS = [
  "type",
  "provisional",
  "firmness",
  "restitutionBase",
  "restitutionSpeedSlope",
  "restitutionMin",
  "slidingFriction",
  "rollingResistance",
  "moistureSoftness",
  "stimpFt",
  "terminal",
] as const satisfies readonly (keyof SurfaceProperties)[];

/**
 * Returns a validated, deep-frozen copy of `base` with `overrides` applied.
 *
 * Provenance: if any value other than `version` changes (type and provisional included) and
 * `overrides.version` is not given, the version becomes `${base.version}+custom` and the
 * result is provisional, so a modified surface never carries the catalog version or passes
 * as a fitted one. Clearing `provisional` requires an explicit new `version` naming the fit.
 * Green speed consistency: overriding `stimpFt` alone re-derives `rollingResistance`;
 * overriding `rollingResistance` alone on a surface with a Stimp reading re-derives `stimpFt`;
 * giving both requires them to agree (validateSurface). Water and out-of-bounds stay terminal.
 */
export function withSurfaceOverrides(
  base: SurfaceProperties,
  overrides: Partial<SurfaceProperties>,
): SurfaceProperties {
  const merged: Record<string, unknown> = { ...base, ...overrides };

  if (
    overrides.provisional === false &&
    base.provisional &&
    (overrides.version === undefined || overrides.version === base.version)
  ) {
    throw new RangeError(
      `withSurfaceOverrides: provisional: false needs an explicit new version naming the fit (base version "${base.version}")`,
    );
  }

  const hasStimp = overrides.stimpFt !== undefined;
  const hasRolling = overrides.rollingResistance !== undefined;
  if (hasStimp && !hasRolling && overrides.stimpFt !== null) {
    merged["rollingResistance"] = rollingResistanceFromStimp(overrides.stimpFt as number);
  } else if (hasRolling && !hasStimp && base.stimpFt !== null && (overrides.rollingResistance as number) > 0) {
    // Inverse derivation keeps the green's displayed Stimp honest.
    merged["stimpFt"] = stimpFromRollingResistance(overrides.rollingResistance as number);
  }

  const changed = PROVENANCE_KEYS.some((key) => merged[key] !== base[key]);
  if (changed && overrides.version === undefined) {
    if (!base.version.endsWith("+custom")) merged["version"] = `${base.version}+custom`;
    // Hand-modified values are not a fitted surface, whatever the base was.
    merged["provisional"] = true;
  }
  return deepFreeze(validateSurface(merged));
}

/** Resolves a surface given either a catalog type or explicit (validated) properties. */
export function resolveSurface(surface: SurfaceType | SurfaceProperties): SurfaceProperties {
  if (typeof surface === "string") return getSurface(surface);
  return deepFreeze(validateSurface(surface));
}

/** Golfer-facing lie for a ground surface. */
export function surfaceToLie(type: SurfaceType): LieType {
  switch (type) {
    case "range-mat":
      return "range";
    case "tee":
      return "tee";
    case "fairway-firm":
    case "fairway-normal":
    case "fairway-soft":
      return "fairway";
    case "first-cut":
      return "first-cut";
    case "rough":
      return "rough";
    case "bunker":
      return "bunker";
    case "green":
      return "green";
    case "fringe":
      return "fringe";
    case "cart-path":
      return "cart-path";
    case "water":
      return "water";
    case "out-of-bounds":
      return "out-of-bounds";
    case "trees":
      return "trees";
    case "penalty-area":
      return "penalty-area";
    default: {
      const unreachable: never = type;
      void unreachable;
      return "unknown";
    }
  }
}
