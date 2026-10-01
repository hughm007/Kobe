/**
 * Replay mode: recorded observation files are first-class inputs. These tests check the
 * round trip, provenance across replay, and estimator accuracy against the synthetic truth
 * stored in the header (truth is read only by validation code, never by the pipeline).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ballSpeedMps, horizontalLaunchAngleRad, verticalLaunchAngleRad } from "@glm/launch-state";
import { parseReplay, serializeReplay } from "@glm/sensor-adapters";
import { radToDeg } from "@glm/units";
import { describe, expect, it } from "vitest";
import { DATASET_NAME, runReplay } from "../../scripts/datasets";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const text = readFileSync(join(root, "datasets", "synthetic", `${DATASET_NAME}.jsonl`), "utf8");

describe("replay files", () => {
  it("parse and re-serialize byte-identically", () => {
    const replay = parseReplay(text);
    expect(serializeReplay({ header: replay.header, observations: replay.observations })).toBe(text);
  });

  it("carry synthetic provenance through the replay and never become measured", async () => {
    const records = await runReplay(parseReplay(text), 0);
    expect(records.length).toBe(parseReplay(text).header.syntheticTruth!.length);
    for (const r of records) {
      expect(r.dataOrigin).toBe("synthetic");
      expect(r.launch.ballSpeedMps.source).toBe("synthetic");
    }
  });

  it("estimated launch conditions match the header truth (validation use of truth only)", async () => {
    const replay = parseReplay(text);
    const records = await runReplay(replay, 0);
    replay.header.syntheticTruth!.forEach((truth, i) => {
      const launch = records[i]!.launch;
      expect(Math.abs((launch.ballSpeedMps.value as number) - ballSpeedMps(truth.velocityMps))).toBeLessThan(0.25);
      expect(
        Math.abs((launch.verticalLaunchAngleDeg.value as number) - radToDeg(verticalLaunchAngleRad(truth.velocityMps))),
      ).toBeLessThan(0.2);
      expect(
        Math.abs((launch.horizontalLaunchAngleDeg.value as number) - radToDeg(horizontalLaunchAngleRad(truth.velocityMps))),
      ).toBeLessThan(0.2);
    });
  });
});
