import { deepFreeze, type SurfaceProperties, type SurfaceType, type TerrainQuery, type TerrainSample, type Vec3 } from "@glm/shared-types";
import { isFiniteVec, normalize } from "@glm/core-math";
import { resolveSurface } from "./surfaces";
import { TERRAIN_MODEL_VERSION } from "./version";

export type PlaneTerrainOptions = {
  readonly id: string;
  /** Defaults to TERRAIN_MODEL_VERSION. */
  readonly version?: string;
  /** Any point on the ground plane, m (world frame). */
  readonly pointOnPlaneM: Vec3;
  /** Outward (upward) plane normal; normalised here. Must have a positive z component. */
  readonly normal: Vec3;
  readonly surface: SurfaceType | SurfaceProperties;
};

export function assertFiniteQuery(xM: number, yM: number): void {
  if (!Number.isFinite(xM) || !Number.isFinite(yM)) {
    throw new RangeError(`Terrain query must be finite, got (${xM}, ${yM})`);
  }
}

/**
 * Infinite tilted plane: n . (p - p0) = 0, so height z(x, y) = p0.z - (n.x (x - p0.x) +
 * n.y (y - p0.y)) / n.z. The normal must point upward (n.z > 0) so the plane is a height
 * field; a vertical or overhanging plane is rejected.
 */
export function createPlaneTerrain(options: PlaneTerrainOptions): TerrainQuery {
  const { id, pointOnPlaneM: p0 } = options;
  if (!isFiniteVec(p0)) throw new RangeError("createPlaneTerrain: pointOnPlaneM must be finite");
  if (!isFiniteVec(options.normal)) throw new RangeError("createPlaneTerrain: normal must be finite");
  const unit = normalize(options.normal);
  if (unit === null) throw new RangeError("createPlaneTerrain: normal must be non-zero");
  if (!(unit.z > 0)) {
    throw new RangeError(`createPlaneTerrain: normal must have a positive z component, got ${unit.z}`);
  }
  const normal: Vec3 = deepFreeze({ x: unit.x, y: unit.y, z: unit.z });
  const surface = resolveSurface(options.surface);
  const version = options.version ?? TERRAIN_MODEL_VERSION;
  const p0Copy = { x: p0.x, y: p0.y, z: p0.z };

  return Object.freeze({
    id,
    version,
    sample(xM: number, yM: number): TerrainSample {
      assertFiniteQuery(xM, yM);
      const heightM = p0Copy.z - (normal.x * (xM - p0Copy.x) + normal.y * (yM - p0Copy.y)) / normal.z;
      return Object.freeze({ heightM, normal, surface });
    },
  });
}

export type FlatRangeTerrainOptions = {
  readonly ballRadiusM: number;
  /** Height of the ball's lowest point above the ground at address, m. Default 0 (ball on the ground). */
  readonly teeHeightM?: number;
  readonly surface?: SurfaceType | SurfaceProperties;
  /** Defaults to "flat-range". */
  readonly id?: string;
};

/**
 * Level range. The world origin is the ball CENTER at address (docs/coordinate-system.md §1),
 * so the ground plane is z = -(ballRadius + teeHeight).
 */
export function createFlatRangeTerrain(options: FlatRangeTerrainOptions): TerrainQuery {
  const { ballRadiusM } = options;
  const teeHeightM = options.teeHeightM ?? 0;
  if (!Number.isFinite(ballRadiusM) || ballRadiusM <= 0) {
    throw new RangeError(`createFlatRangeTerrain: ballRadiusM must be positive, got ${ballRadiusM}`);
  }
  if (!Number.isFinite(teeHeightM) || teeHeightM < 0) {
    throw new RangeError(`createFlatRangeTerrain: teeHeightM must be >= 0, got ${teeHeightM}`);
  }
  return createPlaneTerrain({
    id: options.id ?? "flat-range",
    pointOnPlaneM: { x: 0, y: 0, z: -(ballRadiusM + teeHeightM) },
    normal: { x: 0, y: 0, z: 1 },
    surface: options.surface ?? "fairway-normal",
  });
}
