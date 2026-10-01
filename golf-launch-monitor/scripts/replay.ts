/**
 * Replays a recorded or synthetic JSON Lines file through the shot pipeline and prints a
 * table; optionally writes the full shot records as a JSON export.
 *
 *   npx tsx scripts/replay.ts datasets/synthetic/range-fixtures.jsonl [--json out.json] [--mc 100]
 */
import { writeFileSync } from "node:fs";
import { shotsToJson } from "@glm/persistence";
import { readReplayFile } from "@glm/sensor-adapters/node";
import { formatDistance, formatHorizontalAngle, formatSpeed, formatSpinRate, IMPERIAL_GOLF_UNITS } from "@glm/units";
import { runReplay } from "./datasets";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
if (!file) {
  console.error("usage: npx tsx scripts/replay.ts <replay.jsonl> [--json out.json] [--mc samples]");
  process.exit(2);
}
const jsonOut = args.includes("--json") ? args[args.indexOf("--json") + 1] : undefined;
const mc = args.includes("--mc") ? Number(args[args.indexOf("--mc") + 1]) : 100;

const replay = await readReplayFile(file);
for (const w of replay.warnings) console.warn(`warning: ${w}`);
console.log(`${replay.header.description}\norigin: ${replay.header.dataOrigin}, observations: ${replay.observations.length}\n`);
const records = await runReplay(replay, mc);
const deg = (v: number | null) => (v === null ? null : (v * Math.PI) / 180);
const rpmToRad = (v: number | null) => (v === null ? null : (v * 2 * Math.PI) / 60);
for (const r of records) {
  const m = r.result?.metrics;
  const units = IMPERIAL_GOLF_UNITS;
  console.log(
    [
      r.shotId.padEnd(16),
      r.launch.validity.padEnd(11),
      formatSpeed(r.launch.ballSpeedMps.value, units).padStart(11),
      `${r.launch.verticalLaunchAngleDeg.value?.toFixed(1) ?? "—"}°`.padStart(7),
      formatHorizontalAngle(deg(r.launch.horizontalLaunchAngleDeg.value)).padStart(9),
      formatSpinRate(rpmToRad(r.launch.totalSpinRpm.value)).padStart(11),
      `carry ${formatDistance(m?.carryM.value ?? null, units)}`.padStart(14),
      `total ${formatDistance(m?.totalM.value ?? null, units)}`.padStart(14),
      r.simulationSkippedReason ? `skipped: ${r.simulationSkippedReason}` : "",
    ].join("  "),
  );
}
if (jsonOut) {
  writeFileSync(jsonOut, shotsToJson(records, { exportedUtc: new Date().toISOString(), softwareVersion: "replay-cli" }));
  console.log(`\nwrote ${jsonOut}`);
}
