import type { SurfaceProperties, SurfaceType, TerrainQuery, TerrainSample } from "@glm/shared-types";
import { assertFiniteQuery } from "./plane";
import { resolveSurface } from "./surfaces";
import { TERRAIN_MODEL_VERSION } from "./version";

export type PolygonPoint = { readonly x: number; readonly y: number };

export type SurfaceRegion = {
  /** Simple or self-intersecting polygon in the XY plane (world frame, m); closed implicitly. */
  readonly polygon: readonly PolygonPoint[];
  readonly surface: SurfaceType | SurfaceProperties;
};

export type RegionTerrainOptions = {
  readonly id: string;
  /** Defaults to TERRAIN_MODEL_VERSION. */
  readonly version?: string;
  /** Supplies geometry (height, normal) everywhere and the surface outside every region. */
  readonly base: TerrainQuery;
  /** Later regions take precedence where regions overlap. */
  readonly regions: readonly SurfaceRegion[];
};

/**
 * Even-odd (crossing-number) point-in-polygon test. Edges are half-open in y, so a point on
 * a shared edge belongs to exactly one of two adjacent polygons (deterministic, not symmetric).
 */
export function pointInPolygon(x: number, y: number, polygon: readonly PolygonPoint[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i] as PolygonPoint;
    const b = polygon[j] as PolygonPoint;
    if (a.y > y !== b.y > y) {
      const xCross = a.x + ((y - a.y) * (b.x - a.x)) / (b.y - a.y);
      if (x < xCross) inside = !inside;
    }
  }
  return inside;
}

type PreparedRegion = {
  readonly polygon: readonly PolygonPoint[];
  readonly surface: SurfaceProperties;
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
};

/**
 * Terrain whose geometry comes from `base` and whose surface is overridden inside polygons.
 * This is the course-surface layer: a height map (future) supplies geometry, polygons supply
 * fairway/green/bunker/water outlines.
 */
export function createRegionTerrain(options: RegionTerrainOptions): TerrainQuery {
  const prepared: PreparedRegion[] = options.regions.map((region, index) => {
    if (region.polygon.length < 3) {
      throw new RangeError(`createRegionTerrain: region ${index} needs at least 3 vertices`);
    }
    const polygon = region.polygon.map((p) => {
      if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) {
        throw new RangeError(`createRegionTerrain: region ${index} has a non-finite vertex`);
      }
      return Object.freeze({ x: p.x, y: p.y });
    });
    // Plain loop: a Math.min(...spread) overflows the call stack on large surveyed polygons.
    let minX = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    for (const p of polygon) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    return Object.freeze({
      polygon: Object.freeze(polygon),
      surface: resolveSurface(region.surface),
      minX,
      maxX,
      minY,
      maxY,
    });
  });
  const base = options.base;

  return Object.freeze({
    id: options.id,
    version: options.version ?? TERRAIN_MODEL_VERSION,
    sample(xM: number, yM: number): TerrainSample {
      assertFiniteQuery(xM, yM);
      const geometry = base.sample(xM, yM);
      for (let i = prepared.length - 1; i >= 0; i--) {
        const region = prepared[i] as PreparedRegion;
        if (xM < region.minX || xM > region.maxX || yM < region.minY || yM > region.maxY) continue;
        if (pointInPolygon(xM, yM, region.polygon)) {
          return Object.freeze({ heightM: geometry.heightM, normal: geometry.normal, surface: region.surface });
        }
      }
      return geometry;
    },
  });
}
