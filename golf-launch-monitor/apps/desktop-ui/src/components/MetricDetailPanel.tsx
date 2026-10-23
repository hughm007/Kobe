import { type DisplayValue, METRIC_DEFINITIONS } from "@glm/presentation";
import { useEffect, useId, useRef } from "react";
import { BadgeRow } from "./Badge";
import { ValueText } from "./ValueText";

export type MetricDetailPanelProps = {
  readonly value: DisplayValue;
  readonly label: string;
  readonly onClose: () => void;
};

/** Everything known about one displayed value: definition, units, status, dependencies, confidence, limitations. */
export function MetricDetailPanel({ value, label, onClose }: MetricDetailPanelProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const def = METRIC_DEFINITIONS[value.metricId];
  useEffect(() => {
    closeRef.current?.focus();
  }, [value.metricId]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const t = value.tooltip;
  return (
    <aside className="detail-panel" role="dialog" aria-modal="false" aria-labelledby={titleId}>
      <header className="detail-header">
        <div>
          <h3 id={titleId}>{label}</h3>
          {def.label !== label && <p className="detail-sub">{def.label}</p>}
        </div>
        <button ref={closeRef} type="button" className="button-ghost" onClick={onClose} aria-label="Close metric details">
          Close ✕
        </button>
      </header>
      <p className="detail-value">
        <span className="detail-value-main">
          <ValueText text={value.rangeText ?? value.text} />
        </span>
        {value.rangeText !== null && <span className="detail-value-point">model value {value.text}</span>}
      </p>
      <BadgeRow value={value} />
      <dl className="detail-list">
        <dt>Definition</dt>
        <dd>{t.definition}</dd>
        <dt>Units</dt>
        <dd>{t.units}</dd>
        <dt>Measured or calculated</dt>
        <dd>{t.status}</dd>
        <dt>Depends on</dt>
        <dd>
          <ul>
            {t.dependencies.map((d) => (
              <li key={d}>
                <code>{d}</code>
              </li>
            ))}
          </ul>
        </dd>
        <dt>Confidence</dt>
        <dd>{t.confidence}</dd>
        <dt>Limitations</dt>
        <dd>
          <ul>
            {t.limitations.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </dd>
        <dt>Provenance</dt>
        <dd>
          <code className="wrap">{value.sourceDetail}</code>
        </dd>
        {value.qualityFlags.length > 0 && (
          <>
            <dt>Quality flags</dt>
            <dd>
              <ul>
                {value.qualityFlags.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </dd>
          </>
        )}
      </dl>
    </aside>
  );
}
