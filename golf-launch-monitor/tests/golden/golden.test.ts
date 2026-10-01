/**
 * Golden regression: the committed synthetic replay must reproduce the committed golden
 * summary. A failure means a model, estimator, or fixture changed. If the change is
 * intended, run `npm run datasets:generate`, review the diff, and explain it in the commit.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseReplay } from "@glm/sensor-adapters";
import { describe, expect, it } from "vitest";
import { buildSyntheticReplayText, DATASET_NAME, type GoldenFile, runReplay, summarize } from "../../scripts/datasets";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const replayText = readFileSync(join(root, "datasets", "synthetic", `${DATASET_NAME}.jsonl`), "utf8");
const golden = JSON.parse(
  readFileSync(join(root, "datasets", "golden-tests", `${DATASET_NAME}.golden.json`), "utf8"),
) as GoldenFile;

function expectClose(actual: unknown, expected: unknown, path: string): void {
  if (typeof expected === "number" && typeof actual === "number") {
    const tolerance = 1e-9 * Math.max(1, Math.abs(expected));
    if (Math.abs(actual - expected) > tolerance) {
      throw new Error(`${path}: expected ${expected}, got ${actual}`);
    }
    return;
  }
  expect(actual, path).toEqual(expected);
}

describe("golden synthetic replay", () => {
  it("the committed replay file is exactly what the generator produces (fixtures + truth model unchanged)", async () => {
    expect(await buildSyntheticReplayText()).toBe(replayText);
  });

  it("replaying it reproduces the golden summary", async () => {
    const replay = parseReplay(replayText);
    const labels = (replay.header.syntheticTruth ?? []).map((t) => t.label);
    const actual = summarize(await runReplay(replay, golden.monteCarloSamples), labels);
    const { shots: actualShots, ...actualMeta } = actual;
    const { shots: goldenShots, ...goldenMeta } = golden;
    expect(actualMeta).toEqual(goldenMeta);
    expect(actualShots.length).toBe(goldenShots.length);
    actualShots.forEach((shot, i) => {
      for (const [key, value] of Object.entries(goldenShots[i] as object)) {
        expectClose((shot as Record<string, unknown>)[key], value, `${shot.label}.${key}`);
      }
    });
  });

  it("deterministic replay: two runs give byte-identical shot records", async () => {
    const replay = parseReplay(replayText);
    const a = await runReplay(replay, 10);
    const b = await runReplay(replay, 10);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});
