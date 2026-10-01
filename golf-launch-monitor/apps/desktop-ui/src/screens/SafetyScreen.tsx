import { useState } from "react";
import { useApp } from "../state/AppContext";

export const SAFETY_CHECKLIST: readonly { readonly id: string; readonly text: string }[] = [
  { id: "screen-rated", text: "The impact screen or net is rated for real golf balls at full swing speed." },
  { id: "clearance", text: "There is enough overhead and side-to-side clearance for a full swing with every club." },
  { id: "shank-zone", text: "The shank zone (to the side of the hitting area) is kept clear of people, pets and cameras." },
  { id: "cameras", text: "Cameras and sensors are mounted outside the likely shank and ricochet zones." },
  { id: "cables", text: "Cables are managed and there are no trip hazards near the hitting area." },
  { id: "no-unrated", text: "Real balls are never hit into an unrated screen, wall, window or ceiling." },
  { id: "lighting", text: "Lighting does not shine into the golfer's eyes or blind anyone in the room." },
];

export const PRODUCT_LIMITS: readonly string[] = [
  "For practice and casual simulation only.",
  "Not for betting, certified competition, handicapping or any safety-critical decision.",
  "Phase 1 has no hardware: every number on screen is synthetic, replayed or typed in, and is labelled as such.",
];

export function SafetyScreen() {
  const { state, actions } = useApp();
  const acknowledged = state.settings.safetyAcknowledgedUtc;
  const [checked, setChecked] = useState<ReadonlySet<string>>(() => new Set(acknowledged ? SAFETY_CHECKLIST.map((c) => c.id) : []));
  const all = SAFETY_CHECKLIST.every((c) => checked.has(c.id));
  return (
    <div className="screen">
      <h1>Safety</h1>
      <p className="lead">Check your hitting bay before every session. The Range screen stays locked until this checklist is acknowledged once.</p>
      <fieldset className="checklist">
        <legend>Hitting-bay checklist</legend>
        {SAFETY_CHECKLIST.map((item) => (
          <label key={item.id} className="check">
            <input
              type="checkbox"
              checked={checked.has(item.id)}
              onChange={(e) => {
                const next = new Set(checked);
                if (e.target.checked) next.add(item.id);
                else next.delete(item.id);
                setChecked(next);
              }}
            />
            <span>{item.text}</span>
          </label>
        ))}
      </fieldset>
      <section className="card">
        <h2>Product limits</h2>
        <ul>
          {PRODUCT_LIMITS.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </section>
      {acknowledged === null ? (
        <div className="button-row">
          <button type="button" className="button-primary button-large" disabled={!all} onClick={actions.acknowledgeSafety}>
            I have checked my bay — acknowledge
          </button>
          {!all && <span className="muted">Tick every item to continue.</span>}
        </div>
      ) : (
        <p className="notice notice-ok" role="status">
          Acknowledged on {new Date(acknowledged).toLocaleString()}. Re-check the list whenever the bay changes.
        </p>
      )}
    </div>
  );
}
