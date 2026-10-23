/**
 * Deterministic train / validation / held-out-test partitioning.
 *
 * A shot's partition depends only on (salt, shotId), so it never changes when the dataset
 * grows or is re-ordered, and the same shot can never leak between partitions across runs.
 * Access to the held-out set requires an explicit acknowledgement and is logged, so that
 * tuning against it is loud rather than accidental.
 */

export type DatasetPartition = "training" | "validation" | "held-out-test";

export type PartitionFractions = {
  readonly training: number;
  readonly validation: number;
  readonly heldOutTest: number;
};

export const DEFAULT_PARTITION_FRACTIONS: PartitionFractions = Object.freeze({
  training: 0.6,
  validation: 0.2,
  heldOutTest: 0.2,
});

const FNV_OFFSET_BASIS_32 = 0x811c9dc5;
const FNV_PRIME_32 = 0x01000193;

/** FNV-1a 32-bit hash of the UTF-8 bytes of `text`, as an unsigned integer. */
export function fnv1a32(text: string): number {
  let hash = FNV_OFFSET_BASIS_32;
  for (const byte of new TextEncoder().encode(text)) {
    hash ^= byte;
    hash = Math.imul(hash, FNV_PRIME_32) >>> 0;
  }
  return hash >>> 0;
}

const FRACTION_KEYS = ["training", "validation", "heldOutTest"] as const;

/**
 * Fractions often come from config/JSON, so check each expected key explicitly: a missing
 * or misspelled key must throw, not turn the sum into NaN and silently empty a partition.
 */
function assertFractions(f: PartitionFractions): void {
  const given = (f ?? {}) as Partial<Record<string, unknown>>;
  for (const name of FRACTION_KEYS) {
    const v = given[name];
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 1) {
      throw new Error(`partition fraction ${name} must be a number in [0, 1], got ${String(v)}`);
    }
  }
  const total = f.training + f.validation + f.heldOutTest;
  if (!(Math.abs(total - 1) <= 1e-9)) throw new Error(`partition fractions must sum to 1 (±1e-9), got ${total}`);
}

/** MurmurHash3 32-bit finalizer: a bijective avalanche mix of a 32-bit value. */
export function fmix32(value: number): number {
  let h = value >>> 0;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b) >>> 0;
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35) >>> 0;
  h ^= h >>> 16;
  return h >>> 0;
}

/**
 * Identifier of the exact shot -> partition mapping implemented here. Any other tool that
 * must reproduce these partitions (and so never train on this held-out set) has to
 * implement exactly this algorithm; bump the id if the mapping ever changes.
 *
 *   u = fmix32(fnv1a32(UTF-8 bytes of salt + ":" + shotId)) / 2^32
 *   u < training -> "training"; u < training + validation -> "validation"; else "held-out-test"
 */
export const PARTITION_ALGORITHM = "glm-partition-fnv1a32-fmix32-v1";

/**
 * Uniform position of a shot in [0, 1): fmix32(fnv1a32(salt + ":" + shotId)) / 2^32
 * (see PARTITION_ALGORITHM).
 *
 * Why the finalizer (a deliberate refinement of "FNV-1a over salt:shotId"): FNV-1a's top
 * bits are poorly mixed when ids differ only in their last characters (sequential ids such
 * as "shot-17"). Measured with "shot-0".."shot-9999" and salt "glm-v1", plain
 * fnv1a32 / 2^32 put 63.0 % of shots in a 60 % training split (~6 binomial sd off); after
 * fmix32 it is 59.9 %. fmix32 is a bijection, so this changes only how hashes map to
 * [0, 1), not which inputs collide.
 */
export function partitionUnit(shotId: string, salt: string): number {
  return fmix32(fnv1a32(`${salt}:${shotId}`)) / 2 ** 32;
}

/**
 * Partition of one shot: u = partitionUnit(shotId, salt), then u < training -> "training",
 * u < training + validation -> "validation", else "held-out-test".
 */
export function assignPartition(
  shotId: string,
  salt: string,
  fractions: PartitionFractions = DEFAULT_PARTITION_FRACTIONS,
): DatasetPartition {
  assertFractions(fractions);
  const u = partitionUnit(shotId, salt);
  if (u < fractions.training) return "training";
  if (u < fractions.training + fractions.validation) return "validation";
  return "held-out-test";
}

/** The only accepted held-out access request. Both strings must match exactly. */
export type HeldOutAccess = {
  readonly purpose: "final-accuracy-report";
  readonly acknowledgement: "I will not tune models on these results";
};

export type HeldOutAccessLogEntry = { readonly purpose: string; readonly count: number };

export class PartitionedDataset<T extends { readonly shotId: string }> {
  // ECMAScript private fields: unlike TypeScript `private`, they are unreachable at run
  // time, so the held-out items are only available through the guarded, logged accessor.
  readonly #parts: Readonly<Record<DatasetPartition, readonly T[]>>;
  readonly #accessLog: HeldOutAccessLogEntry[] = [];

  constructor(items: readonly T[], salt: string, fractions: PartitionFractions = DEFAULT_PARTITION_FRACTIONS) {
    assertFractions(fractions);
    const seen = new Set<string>();
    const parts: Record<DatasetPartition, T[]> = { training: [], validation: [], "held-out-test": [] };
    for (const item of items) {
      if (seen.has(item.shotId)) throw new Error(`PartitionedDataset: duplicate shotId "${item.shotId}"`);
      seen.add(item.shotId);
      parts[assignPartition(item.shotId, salt, fractions)].push(item);
    }
    this.#parts = {
      training: Object.freeze(parts.training),
      validation: Object.freeze(parts.validation),
      "held-out-test": Object.freeze(parts["held-out-test"]),
    };
  }

  training(): readonly T[] {
    return this.#parts.training;
  }

  validation(): readonly T[] {
    return this.#parts.validation;
  }

  /** Partition sizes; counts reveal nothing that could be tuned against. */
  sizes(): { readonly training: number; readonly validation: number; readonly heldOutTest: number } {
    return {
      training: this.#parts.training.length,
      validation: this.#parts.validation.length,
      heldOutTest: this.#parts["held-out-test"].length,
    };
  }

  /**
   * The held-out test set, for the final accuracy report only. Throws unless the request
   * carries exactly the documented purpose and acknowledgement; every access is logged.
   */
  heldOutTest(access: HeldOutAccess): readonly T[] {
    const a = access as { purpose?: unknown; acknowledgement?: unknown } | null | undefined;
    if (a?.purpose !== "final-accuracy-report") {
      throw new Error(
        `held-out test set refused: purpose ${JSON.stringify(a?.purpose)} is not "final-accuracy-report". ` +
          "Use training() / validation() for development and tuning.",
      );
    }
    if (a.acknowledgement !== "I will not tune models on these results") {
      throw new Error(
        'held-out test set refused: acknowledgement must be exactly "I will not tune models on these results"',
      );
    }
    const items = this.#parts["held-out-test"];
    this.#accessLog.push(Object.freeze({ purpose: a.purpose, count: items.length }));
    return items;
  }

  heldOutAccessLog(): readonly HeldOutAccessLogEntry[] {
    return Object.freeze([...this.#accessLog]);
  }
}
