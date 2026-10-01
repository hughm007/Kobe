/**
 * Sorting for the session-history table. Sorts on the stored SI values (never on display text);
 * unavailable values always sort last, whichever the direction, so "—" never masquerades as
 * the smallest number.
 */
import type { ShotRecord } from "@glm/shared-types";

export const SHOT_SORT_KEYS = ["time", "ballSpeed", "launchAngle", "spin", "carry", "total", "offline", "confidence"] as const;
export type ShotSortKey = (typeof SHOT_SORT_KEYS)[number];
export type SortDirection = "asc" | "desc";

export function shotSortValue(record: ShotRecord, key: ShotSortKey): number | null {
  const m = record.result?.metrics;
  switch (key) {
    case "time": {
      const t = Date.parse(record.createdUtc);
      return Number.isNaN(t) ? null : t;
    }
    case "ballSpeed":
      return record.launch.ballSpeedMps.value;
    case "launchAngle":
      return record.launch.verticalLaunchAngleDeg.value;
    case "spin":
      return record.launch.totalSpinRpm.value;
    case "carry":
      return m?.carryM.value ?? null;
    case "total":
      return m?.totalM.value ?? null;
    case "offline": {
      // Distance from the target line, either side.
      const v = m?.totalLateralM.value ?? null;
      return v === null ? null : Math.abs(v);
    }
    case "confidence":
      return record.launch.overallConfidence;
  }
}

export function sortShots(records: readonly ShotRecord[], key: ShotSortKey, direction: SortDirection): ShotRecord[] {
  const sign = direction === "asc" ? 1 : -1;
  return records
    .map((record, index) => ({ record, index, value: shotSortValue(record, key) }))
    .sort((a, b) => {
      if (a.value === null && b.value === null) return a.index - b.index;
      if (a.value === null) return 1;
      if (b.value === null) return -1;
      return a.value === b.value ? a.index - b.index : sign * (a.value - b.value);
    })
    .map((e) => e.record);
}
