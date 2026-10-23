import type { DisplayValue, MetricId } from "@glm/presentation";
import { BadgeRow } from "./Badge";
import { ValueText } from "./ValueText";

export type MetricTileProps = {
  readonly value: DisplayValue;
  readonly label: string;
  readonly hero?: boolean;
  readonly selected?: boolean;
  readonly onSelect: (metricId: MetricId) => void;
};

/**
 * One metric: a button that opens the detail panel. A wide interval shows the range
 * (DisplayValue.rangeText) instead of a single number; unavailable shows "—".
 */
export function MetricTile({ value, label, hero = false, selected = false, onSelect }: MetricTileProps) {
  const shown = value.rangeText ?? value.text;
  return (
    <button
      type="button"
      className={`tile${hero ? " tile-hero" : ""}${value.available ? "" : " tile-unavailable"}${selected ? " tile-selected" : ""}`}
      aria-haspopup="dialog"
      aria-pressed={selected}
      data-metric={value.metricId}
      onClick={() => onSelect(value.metricId)}
    >
      <span className="tile-label">{label}</span>
      <span className="tile-value" data-testid={`metric-${value.metricId}`}>
        <ValueText text={shown} />
      </span>
      {value.rangeText !== null && <span className="tile-note">90% range</span>}
      <BadgeRow value={value} />
    </button>
  );
}
