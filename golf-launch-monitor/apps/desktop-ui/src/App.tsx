import { useEffect } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Nav } from "./components/Nav";
import { OriginBanner } from "./components/OriginBanner";
import { CalibrationScreen } from "./screens/CalibrationScreen";
import { DiagnosticsScreen } from "./screens/DiagnosticsScreen";
import { EquipmentScreen } from "./screens/EquipmentScreen";
import { HistoryScreen } from "./screens/HistoryScreen";
import { PlayersScreen } from "./screens/PlayersScreen";
import { RangeScreen } from "./screens/RangeScreen";
import { SafetyScreen } from "./screens/SafetyScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { SetupScreen } from "./screens/SetupScreen";
import { ShotReviewScreen } from "./screens/ShotReviewScreen";
import { AppProvider, type AppRuntime, useApp } from "./state/AppContext";
import { activeDataOrigin, type ScreenId } from "./state/reducer";

function Screen({ id }: { readonly id: ScreenId }) {
  switch (id) {
    case "safety":
      return <SafetyScreen />;
    case "setup":
      return <SetupScreen />;
    case "calibration":
      return <CalibrationScreen />;
    case "range":
      return <RangeScreen />;
    case "review":
      return <ShotReviewScreen />;
    case "history":
      return <HistoryScreen />;
    case "players":
      return <PlayersScreen />;
    case "equipment":
      return <EquipmentScreen />;
    case "diagnostics":
      return <DiagnosticsScreen />;
    case "settings":
      return <SettingsScreen />;
  }
}

function Shell() {
  const { state, actions } = useApp();
  // A new screen starts at its top (e.g. "Open full shot review" from the bottom of the Range).
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [state.screen]);
  return (
    <div className="app">
      <header className="topbar">
        <OriginBanner origin={activeDataOrigin(state)} />
        <div className="topbar-row">
          <span className="app-title">Range Monitor</span>
          <span className="app-subtitle">Phase 1 · synthetic / replay / developer data only · no hardware</span>
          <span className={`busy${state.busy ? " busy-on" : ""}`} role="status" aria-live="polite">
            {state.busy ? `Processing shot… (Monte Carlo n=${state.settings.monteCarloSamples})` : "Ready"}
          </span>
        </div>
      </header>
      <div className="layout">
        <Nav />
        <main className="content" id="main">
          {state.lastError !== null && (
            <div className="notice notice-error" role="alert">
              <span>{state.lastError}</span>
              <button type="button" className="button-ghost" onClick={actions.dismissError}>
                Dismiss
              </button>
            </div>
          )}
          {state.storageError !== null && (
            <div className="notice notice-warn" role="status">
              {state.storageError}
            </div>
          )}
          <ErrorBoundary label="This screen" resetKey={state.screen}>
            <Screen id={state.screen} />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export function App({ runtime }: { readonly runtime: AppRuntime }) {
  return (
    <AppProvider runtime={runtime}>
      <Shell />
    </AppProvider>
  );
}
