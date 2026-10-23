import { describe, expect, it } from "vitest";
import {
  assignPartition,
  fmix32,
  fnv1a32,
  PARTITION_ALGORITHM,
  PartitionedDataset,
  partitionUnit,
  type DatasetPartition,
  type PartitionFractions,
} from "../src/index";

const IDS = Array.from({ length: 10_000 }, (_, i) => `shot-${i}`);

describe("fnv1a32", () => {
  it("matches the published FNV-1a 32-bit test vectors", () => {
    expect(fnv1a32("")).toBe(0x811c9dc5);
    expect(fnv1a32("a")).toBe(0xe40c292c);
    expect(fnv1a32("foobar")).toBe(0xbf9cf968);
  });

  it("fmix32 matches the MurmurHash3 finalizer reference values", () => {
    expect(fmix32(0)).toBe(0);
    expect(fmix32(1)).toBe(0x514e28b7);
  });

  it("hashes UTF-8 bytes (non-ASCII differs from its Latin-1 code unit)", () => {
    expect(fnv1a32("é")).not.toBe(fnv1a32("Ã©"));
    expect(fnv1a32("é")).toBe(fnv1a32("é"));
  });
});

describe("assignPartition", () => {
  it("is deterministic and depends on salt + ':' + shotId", () => {
    const first = IDS.map((id) => assignPartition(id, "glm-v1"));
    const second = IDS.map((id) => assignPartition(id, "glm-v1"));
    expect(second).toEqual(first);
    const u = fmix32(fnv1a32("glm-v1:shot-0")) / 2 ** 32;
    expect(partitionUnit("shot-0", "glm-v1")).toBe(u);
    const expected: DatasetPartition = u < 0.6 ? "training" : u < 0.8 ? "validation" : "held-out-test";
    expect(first[0]).toBe(expected);
  });

  it("pins the published algorithm with literal test vectors (other tools must reproduce these)", () => {
    expect(PARTITION_ALGORITHM).toBe("glm-partition-fnv1a32-fmix32-v1");
    // fnv1a32("glm-v1:shot-k") and fmix32 of it, computed independently of partitionUnit.
    expect(fnv1a32("glm-v1:shot-0")).toBe(0x758e9d98);
    expect(fnv1a32("glm-v1:shot-5")).toBe(0x7a8ea577);
    expect(partitionUnit("shot-0", "glm-v1")).toBe(0x4ea580e5 / 2 ** 32);
    expect(partitionUnit("shot-2", "glm-v1")).toBe(0xc87323b5 / 2 ** 32);
    expect(partitionUnit("shot-5", "glm-v1")).toBe(0xf1048033 / 2 ** 32);
    expect(IDS.slice(0, 8).map((id) => assignPartition(id, "glm-v1"))).toEqual([
      "training",
      "training",
      "validation",
      "training",
      "training",
      "held-out-test",
      "training",
      "training",
    ]);
  });

  it("needs the fmix32 step: plain FNV-1a / 2^32 is biased on sequential ids", () => {
    // The documented reason PARTITION_ALGORITHM is not plain FNV-1a: consecutive ids give
    // nearly consecutive hashes (shot-0 -> 0x758e9d98, shot-5 -> 0x7a8ea577).
    let plainTraining = 0;
    for (const id of IDS) if (fnv1a32(`glm-v1:${id}`) / 2 ** 32 < 0.6) plainTraining += 1;
    expect(plainTraining).toBe(6303); // 6.2 binomial sd above the requested 6000
  });

  it("approximates the requested fractions over 10k sequential ids", () => {
    const counts = { training: 0, validation: 0, "held-out-test": 0 };
    for (const id of IDS) counts[assignPartition(id, "glm-v1")] += 1;
    // Binomial sd: 49 (p = 0.6) and 40 (p = 0.2) at n = 10k; allow ~3.5 sd.
    expect(Math.abs(counts.training / 1e4 - 0.6)).toBeLessThan(0.017);
    expect(Math.abs(counts.validation / 1e4 - 0.2)).toBeLessThan(0.014);
    expect(Math.abs(counts["held-out-test"] / 1e4 - 0.2)).toBeLessThan(0.014);

    const custom = { training: 0.8, validation: 0.1, heldOutTest: 0.1 };
    let heldOut = 0;
    for (const id of IDS) if (assignPartition(id, "glm-v1", custom) === "held-out-test") heldOut += 1;
    expect(Math.abs(heldOut / 1e4 - 0.1)).toBeLessThan(0.011);
  });

  it("re-shuffles under a different salt", () => {
    let changed = 0;
    for (const id of IDS) if (assignPartition(id, "salt-a") !== assignPartition(id, "salt-b")) changed += 1;
    // Independent assignments differ with probability 1 - (0.36 + 0.04 + 0.04) = 0.56.
    expect(changed / IDS.length).toBeGreaterThan(0.5);
    expect(changed / IDS.length).toBeLessThan(0.62);
  });

  it("validates fractions", () => {
    expect(() => assignPartition("x", "s", { training: 0.5, validation: 0.3, heldOutTest: 0.3 })).toThrow(/sum to 1/);
    expect(() => assignPartition("x", "s", { training: 1.2, validation: -0.1, heldOutTest: -0.1 })).toThrow(/\[0, 1\]/);
    expect(assignPartition("x", "s", { training: 0.1 + 0.2, validation: 0.7, heldOutTest: 0 })).not.toBe("held-out-test");
    expect(IDS.slice(0, 200).every((id) => assignPartition(id, "s", { training: 1, validation: 0, heldOutTest: 0 }) === "training")).toBe(true);
  });

  it("rejects missing, misspelled or non-numeric fractions instead of summing to NaN", () => {
    const missing = { training: 0.6, validation: 0.6 } as unknown as PartitionFractions;
    const misspelled = { training: 0.6, validation: 0.2, heldOutTset: 0.2 } as unknown as PartitionFractions;
    const text = { training: "0.6", validation: 0.2, heldOutTest: 0.2 } as unknown as PartitionFractions;
    expect(() => assignPartition("x", "s", missing)).toThrow(/heldOutTest must be a number in \[0, 1\], got undefined/);
    expect(() => new PartitionedDataset([{ shotId: "x" }], "s", misspelled)).toThrow(/heldOutTest/);
    expect(() => assignPartition("x", "s", text)).toThrow(/training must be a number/);
    expect(() => assignPartition("x", "s", { training: Number.NaN, validation: 0.5, heldOutTest: 0.5 })).toThrow(/training/);
  });
});

describe("PartitionedDataset", () => {
  const items = IDS.slice(0, 2000).map((shotId, i) => ({ shotId, carryM: i }));
  const ACCESS = { purpose: "final-accuracy-report", acknowledgement: "I will not tune models on these results" } as const;

  it("partitions every item exactly once, consistent with assignPartition, independent of order", () => {
    const ds = new PartitionedDataset(items, "glm-v1");
    const held = ds.heldOutTest(ACCESS);
    const all = [...ds.training(), ...ds.validation(), ...held].map((x) => x.shotId).sort();
    expect(all).toEqual([...IDS.slice(0, 2000)].sort());
    for (const x of ds.validation()) expect(assignPartition(x.shotId, "glm-v1")).toBe("validation");
    const reversed = new PartitionedDataset([...items].reverse(), "glm-v1");
    expect(new Set(reversed.training().map((x) => x.shotId))).toEqual(new Set(ds.training().map((x) => x.shotId)));
    expect(ds.sizes().training + ds.sizes().validation + ds.sizes().heldOutTest).toBe(2000);
    expect(Object.isFrozen(ds.training())).toBe(true);
  });

  it("refuses held-out access without the exact purpose and acknowledgement", () => {
    const ds = new PartitionedDataset(items, "glm-v1");
    const wrongPurpose = { ...ACCESS, purpose: "hyperparameter-search" } as unknown as typeof ACCESS;
    const wrongAck = { ...ACCESS, acknowledgement: "ok" } as unknown as typeof ACCESS;
    expect(() => ds.heldOutTest(wrongPurpose)).toThrow(/"hyperparameter-search" is not "final-accuracy-report"/);
    expect(() => ds.heldOutTest(wrongAck)).toThrow(/acknowledgement/);
    expect(() => ds.heldOutTest(undefined as unknown as typeof ACCESS)).toThrow(/refused/);
    expect(ds.heldOutAccessLog()).toEqual([]);
  });

  it("logs every successful held-out access", () => {
    const ds = new PartitionedDataset(items, "glm-v1");
    const n = ds.heldOutTest(ACCESS).length;
    ds.heldOutTest(ACCESS);
    expect(n).toBe(ds.sizes().heldOutTest);
    expect(n).toBeGreaterThan(0);
    const log = ds.heldOutAccessLog();
    expect(log).toEqual([
      { purpose: "final-accuracy-report", count: n },
      { purpose: "final-accuracy-report", count: n },
    ]);
    expect(Object.isFrozen(log)).toBe(true);
  });

  it("keeps the held-out items and the access log unreachable except through the guard", () => {
    const ds = new PartitionedDataset(items, "glm-v1");
    const loose = ds as unknown as Record<string, unknown>;
    expect(loose.parts).toBeUndefined();
    expect(loose.accessLog).toBeUndefined();
    expect(Object.getOwnPropertyNames(ds)).toEqual([]);
    expect(JSON.stringify(ds)).toBe("{}");
    expect(ds.heldOutAccessLog()).toEqual([]);
  });

  it("rejects duplicate shot ids", () => {
    expect(() => new PartitionedDataset([{ shotId: "a" }, { shotId: "a" }], "s")).toThrow(/duplicate shotId "a"/);
  });
});
