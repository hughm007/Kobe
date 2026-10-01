/**
 * Primitive building blocks shared by every contract.
 *
 * All vectors are expressed in the world frame defined in docs/coordinate-system.md
 * unless a type explicitly says otherwise (e.g. camera-frame pixel coordinates).
 */

/** A 3-vector. Units are carried by the field name that holds it (e.g. `positionM`). */
export type Vec3 = {
  readonly x: number;
  readonly y: number;
  readonly z: number;
};

/** Dense row-major matrix, e.g. a 3x3 covariance. */
export type Matrix = ReadonlyArray<ReadonlyArray<number>>;

/** ISO-8601 UTC timestamp string, e.g. "2026-10-01T18:00:00.000Z". */
export type IsoUtcTimestamp = string;

/** Recursively readonly view of a type. Contracts are immutable once produced. */
export type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends ReadonlyArray<infer R>
    ? ReadonlyArray<DeepReadonly<R>>
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

/** Inclusive numeric range. */
export type NumericRange = {
  readonly min: number;
  readonly max: number;
};

/**
 * Recursively freezes a value in place and returns it typed as deeply readonly.
 * Factories that produce contract objects call this so that downstream code cannot
 * mutate a launch state or shot result after it has been recorded.
 */
export function deepFreeze<T>(value: T): DeepReadonly<T> {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value as object)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value as DeepReadonly<T>;
}
