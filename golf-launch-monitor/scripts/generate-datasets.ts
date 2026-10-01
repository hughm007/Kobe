/**
 * Regenerates the synthetic replay dataset and its golden summary:
 *   datasets/synthetic/range-fixtures.jsonl
 *   datasets/golden-tests/range-fixtures.golden.json
 * Run with `npm run datasets:generate`, then REVIEW the diff: a golden change means a model,
 * estimator, or fixture changed and must be explained in the commit.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseReplay } from "@glm/sensor-adapters";
import { buildSyntheticReplayText, DATASET_NAME, runReplay, summarize } from "./datasets";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const replayPath = join(root, "datasets", "synthetic", `${DATASET_NAME}.jsonl`);
const goldenPath = join(root, "datasets", "golden-tests", `${DATASET_NAME}.golden.json`);

const text = await buildSyntheticReplayText();
mkdirSync(dirname(replayPath), { recursive: true });
writeFileSync(replayPath, text);
console.log(`wrote ${replayPath}`);

const replay = parseReplay(text);
const labels = (replay.header.syntheticTruth ?? []).map((t) => t.label);
const records = await runReplay(replay);
mkdirSync(dirname(goldenPath), { recursive: true });
writeFileSync(goldenPath, `${JSON.stringify(summarize(records, labels), null, 2)}\n`);
console.log(`wrote ${goldenPath} (${records.length} shots)`);
