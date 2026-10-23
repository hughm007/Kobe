import { dataOriginBanner } from "@glm/presentation";
import type { DataOrigin } from "@glm/shared-types";

/** High-contrast notice for any non-live data. Live data renders nothing. */
export function OriginBanner({ origin, compact = false }: { readonly origin: DataOrigin; readonly compact?: boolean }) {
  const text = dataOriginBanner(origin);
  if (text === null) return null;
  return (
    <div className={`origin-banner${compact ? " origin-banner-compact" : ""}`} data-origin={origin} role="note">
      <span className="origin-banner-mark" aria-hidden="true">
        ⚠
      </span>
      <span>{text}</span>
    </div>
  );
}
