import type { CalibrationStatus } from "@glm/shared-types";
import { useApp } from "../state/AppContext";

const STATUS_MEANING: readonly { readonly status: CalibrationStatus; readonly meaning: string }[] = [
  { status: "green", meaning: "Valid, high confidence: all calibration checks passed." },
  { status: "yellow", meaning: "Usable with warnings: some checks are marginal; shots are flagged." },
  { status: "red", meaning: "Invalid: blocks accurate mode until the bay is recalibrated." },
  { status: "none", meaning: "No calibration exists (synthetic / replay / developer mode)." },
];

export const PHASE2_REQUIREMENTS: readonly string[] = [
  "A printed ChArUco board of known square and marker size, mounted flat and rigid.",
  "Intrinsic calibration per camera with focus, zoom and exposure locked (pinhole + Brown–Conrady distortion).",
  "Extrinsic (stereo) calibration relating every camera to the world frame.",
  "Target-line calibration: the world +X axis aligned to the physical target line (alignment stick, laser or target marker).",
  "Reprojection-error targets met per camera, with a known-length check confirming scale.",
  "Re-validation whenever a camera moves or a device setting changes.",
];

export function CalibrationScreen() {
  const { state } = useApp();
  const replay = state.replay;
  const replayCal = state.settings.dataSource === "replay" && replay !== null ? replay.header : null;
  const status: CalibrationStatus = replayCal?.calibrationStatus ?? "none";
  return (
    <div className="screen">
      <h1>Calibration</h1>
      <section className={`card calibration calibration-${status}`} aria-label="Calibration status">
        <div className="calibration-status">
          <span className={`status-dot status-${status}`} aria-hidden="true" />
          <div>
            <h2>
              {replayCal !== null && replayCal.calibrationVersion !== null
                ? `Replay calibration ${replayCal.calibrationVersion}: ${status.toUpperCase()}`
                : "No calibration: synthetic/replay mode"}
            </h2>
            <p>
              Phase 1 runs without cameras or radar, so there is nothing to calibrate. Synthetic and developer data use no calibration;
              a replay reports the calibration recorded in its file, if any.
            </p>
          </div>
        </div>
        <dl className="status-legend">
          {STATUS_MEANING.map((s) => (
            <div key={s.status} className={s.status === status ? "current" : undefined}>
              <dt>
                <span className={`status-dot status-${s.status}`} aria-hidden="true" /> {s.status.toUpperCase()}
              </dt>
              <dd>{s.meaning}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="card">
        <h2>What Phase 2 calibration will require</h2>
        <ul>
          {PHASE2_REQUIREMENTS.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <div className="button-row">
          <button type="button" disabled aria-describedby="wizard-why">
            Start intrinsic calibration
          </button>
          <button type="button" disabled aria-describedby="wizard-why">
            Start extrinsic / target-line calibration
          </button>
        </div>
        <p id="wizard-why" className="muted">
          Disabled: no camera driver exists yet, so the calibration wizard cannot capture images. See docs/sensor-specification.md.
        </p>
      </section>
    </div>
  );
}
