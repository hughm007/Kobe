import type { MetricId } from "@glm/presentation";
import type { Club, Player, ShotRecord } from "@glm/shared-types";
import type { Precision, UnitSystem } from "@glm/units";
import { useCallback, useRef, useState } from "react";
import { CARD_LABELS } from "../display/shot-display";
import { ErrorBoundary } from "./ErrorBoundary";
import { MetricDetailPanel } from "./MetricDetailPanel";
import { presentShot, ShotCard } from "./ShotCard";
import { ShotTracer } from "./ShotTracer";

export type ShotViewProps = {
  readonly record: ShotRecord;
  readonly unitSystem: UnitSystem;
  readonly precision: Precision;
  readonly players?: readonly Player[];
  readonly bag?: readonly Club[];
  readonly shotNumber?: number;
  readonly showTracer?: boolean;
  /** Shown next to player and club, e.g. that a replayed shot's player/club come from Setup. */
  readonly attributionNote?: string;
};

const NONE: readonly never[] = [];

/** Shot card + tracer + metric detail panel for one record (no app context needed). */
export function ShotView(props: ShotViewProps) {
  return (
    <ErrorBoundary label="This shot" resetKey={props.record.shotId}>
      <ShotViewInner {...props} />
    </ErrorBoundary>
  );
}

function ShotViewInner({
  record,
  unitSystem,
  precision,
  players = NONE,
  bag = NONE,
  shotNumber,
  showTracer = true,
  attributionNote,
}: ShotViewProps) {
  const [selected, setSelected] = useState<MetricId | null>(null);
  // Return keyboard focus to the tile that opened the panel.
  const opener = useRef<HTMLElement | null>(null);
  const close = useCallback(() => {
    setSelected(null);
    opener.current?.focus();
  }, []);
  const select = useCallback((id: MetricId) => {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSelected((cur) => (cur === id ? null : id));
  }, []);
  const display = presentShot(record, unitSystem, precision);
  const selectedValue = selected === null ? undefined : (display.launch[selected] ?? display.flight?.[selected]);
  return (
    <div className={`shot-view${selectedValue ? " with-detail" : ""}`}>
      <div className="shot-main">
        <ShotCard
          record={record}
          display={display}
          players={players}
          bag={bag}
          selectedMetric={selected}
          onSelectMetric={select}
          {...(shotNumber !== undefined ? { shotNumber } : {})}
          {...(attributionNote !== undefined ? { attributionNote } : {})}
        />
        {showTracer && <ShotTracer record={record} unitSystem={unitSystem} />}
      </div>
      {selectedValue !== undefined && (
        <MetricDetailPanel value={selectedValue} label={CARD_LABELS[selectedValue.metricId] ?? selectedValue.label} onClose={close} />
      )}
    </div>
  );
}
