import type { ScreenId } from "../state/reducer";
import { useApp } from "../state/AppContext";

type NavItem = { readonly id: ScreenId; readonly label: string; readonly hint?: string };

export const NAV_ITEMS: readonly NavItem[] = [
  { id: "safety", label: "Safety" },
  { id: "setup", label: "Setup" },
  { id: "calibration", label: "Calibration" },
  { id: "range", label: "Range" },
  { id: "review", label: "Shot review" },
  { id: "history", label: "Session history" },
  { id: "players", label: "Players" },
  { id: "equipment", label: "Equipment" },
  { id: "diagnostics", label: "Diagnostics" },
  { id: "settings", label: "Settings" },
];

const FUTURE_ITEMS = [
  { label: "Course play", phase: "Phase 5 — not built yet" },
  { label: "Putting", phase: "Phase 6 — not built yet" },
] as const;

export function Nav() {
  const { state, actions } = useApp();
  const unacknowledged = state.settings.safetyAcknowledgedUtc === null;
  return (
    <nav className="sidenav" aria-label="Main">
      <ul>
        {NAV_ITEMS.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="nav-item"
              aria-current={state.screen === item.id ? "page" : undefined}
              onClick={() => actions.navigate(item.id)}
            >
              {item.label}
              {item.id === "safety" && unacknowledged && <span className="nav-flag">required</span>}
              {item.id === "range" && unacknowledged && <span className="nav-flag nav-flag-muted">locked</span>}
            </button>
          </li>
        ))}
      </ul>
      <ul className="nav-future" aria-label="Not built yet">
        {FUTURE_ITEMS.map((f) => (
          <li key={f.label}>
            <button type="button" className="nav-item" disabled aria-disabled="true" title={f.phase}>
              {f.label}
              <span className="nav-phase">{f.phase}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
