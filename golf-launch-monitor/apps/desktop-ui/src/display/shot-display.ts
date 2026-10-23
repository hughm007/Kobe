/**
 * Shot-card composition: which metrics appear, in what order, under which golfer label.
 * All formatting and provenance come from @glm/presentation; this module only selects and
 * labels.
 */
import { confidenceLabel, type DisplayValue, type MetricId, shotShapeLabel, type ShotShape } from "@glm/presentation";
import type { Club, Player, ShotRecord, SpinMode } from "@glm/shared-types";
import { degToRad } from "@glm/units";

export type CardMetric = {
  readonly id: MetricId;
  /** Golfer wording on the card; the detail panel also shows the presentation label. */
  readonly label: string;
  readonly hero: boolean;
};

export const LAUNCH_CARD_METRICS: readonly CardMetric[] = Object.freeze([
  { id: "ballSpeed", label: "Ball speed", hero: true },
  { id: "verticalLaunch", label: "Launch angle", hero: false },
  { id: "horizontalLaunch", label: "Launch direction", hero: false },
  { id: "totalSpin", label: "Spin rate", hero: false },
  { id: "spinAxis", label: "Spin axis", hero: false },
]);

export const FLIGHT_CARD_METRICS: readonly CardMetric[] = Object.freeze([
  { id: "carry", label: "Carry", hero: true },
  { id: "total", label: "Total", hero: true },
  { id: "apexHeight", label: "Apex", hero: false },
  { id: "descentAngle", label: "Descent angle", hero: false },
  { id: "carryLateral", label: "Offline at carry", hero: false },
  { id: "totalLateral", label: "Offline at rest", hero: false },
  { id: "curve", label: "Curve", hero: false },
  { id: "bounceDistance", label: "Bounce", hero: false },
  { id: "rollDistance", label: "Roll", hero: false },
]);

export const CARD_LABELS: Readonly<Partial<Record<MetricId, string>>> = Object.freeze(
  Object.fromEntries([...LAUNCH_CARD_METRICS, ...FLIGHT_CARD_METRICS].map((m) => [m.id, m.label])),
);

const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/** "High · 92%" — label thresholds from @glm/presentation; the percent is the stored score. */
export function overallConfidenceText(confidence: number): string {
  const label = confidenceLabel(confidence);
  return `${capitalize(label)} · ${Math.round(confidence * 100)}%`;
}

export function shotShape(record: ShotRecord): ShotShape {
  const tilt = record.launch.spinAxisTiltDeg.value;
  return shotShapeLabel(tilt === null ? null : degToRad(tilt), record.launch.handedness);
}

export function shotShapeText(record: ShotRecord): string {
  const shape = shotShape(record);
  const hand = record.launch.handedness === "left" ? "left-handed" : "right-handed";
  if (shape === "unknown") return "Shape unknown (spin axis unavailable)";
  return `${capitalize(shape)} (${hand})`;
}

export function clubText(record: ShotRecord, bag: readonly Club[]): string {
  const id = record.launch.clubId;
  if (id === null) return "No club selected";
  return bag.find((c) => c.id === id)?.label ?? `Club ${id} (not in bag)`;
}

export function playerText(record: ShotRecord, players: readonly Player[]): string {
  const id = record.launch.playerId;
  if (id === null) return "No player selected";
  return players.find((p) => p.id === id)?.displayName ?? `Player ${id} (deleted)`;
}

/** Local time of day for a shot, e.g. "14:05:09". */
export function shotTimeText(record: ShotRecord): string {
  const d = new Date(record.createdUtc);
  return Number.isNaN(d.getTime()) ? record.createdUtc : d.toLocaleTimeString([], { hour12: false });
}

/**
 * How the pipeline obtained spin, in words that never claim a measurement. The raw SpinMode
 * "measured" only means "taken from the data stream's own spin observation"; whether that stream
 * was a sensor, a synthetic generator or typed in is the provenance badge's job.
 */
const SPIN_MODE_WORDING: Readonly<Record<SpinMode, string>> = Object.freeze({
  measured: "taken from the shot data's own spin observation",
  estimated: "estimated from a model",
  "assumed-generic-fallback": "generic value assumed (fallback allowed in Settings)",
  unavailable: "not available for this shot",
});

export type SpinSource = {
  /** Provenance badge of the displayed total spin (SYNTHETIC, MANUAL, ESTIMATED, ...). */
  readonly badge: DisplayValue["badge"] | null;
  /** Short pill text, e.g. "Spin source: SYNTHETIC". */
  readonly label: string;
  /** Sentence for tooltips and the review: provenance status plus how spin was obtained. */
  readonly detail: string;
};

/**
 * Spin provenance for the card and review headers, derived from the provenance-aware
 * DisplayValue of total spin (@glm/presentation), never from the raw SpinMode enum, so a
 * synthetic, replayed or typed-in spin can never read as "measured".
 */
export function spinSource(record: ShotRecord, totalSpin: DisplayValue | undefined): SpinSource {
  const how = SPIN_MODE_WORDING[record.launch.spinMode];
  if (totalSpin === undefined) return { badge: null, label: "Spin source: —", detail: `Spin ${how}.` };
  return {
    badge: totalSpin.badge,
    label: `Spin source: ${totalSpin.badge}`,
    detail: `${totalSpin.tooltip.status}; spin ${how}.`,
  };
}
