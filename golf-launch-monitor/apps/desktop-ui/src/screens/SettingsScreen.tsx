import { type ReactNode, useEffect, useId, useState } from "react";
import { DEFAULT_MONTE_CARLO_SAMPLES, MAX_MONTE_CARLO_SAMPLES } from "../pipeline/config";
import { useApp } from "../state/AppContext";
import type { AppSettings } from "../state/settings";

function Toggle({
  checked,
  onChange,
  label,
  children,
}: {
  readonly checked: boolean;
  readonly onChange: (v: boolean) => void;
  readonly label: string;
  readonly children: ReactNode;
}) {
  const id = useId();
  return (
    <div className="setting">
      <label className="check" htmlFor={id}>
        <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-describedby={`${id}-d`} />
        <span className="setting-label">{label}</span>
      </label>
      <div id={`${id}-d`} className="setting-desc">
        {children}
      </div>
    </div>
  );
}

function Choice<K extends keyof AppSettings>({
  name,
  label,
  value,
  options,
  onChange,
}: {
  readonly name: K;
  readonly label: string;
  readonly value: AppSettings[K];
  readonly options: readonly { readonly value: AppSettings[K]; readonly label: string }[];
  readonly onChange: (v: AppSettings[K]) => void;
}) {
  return (
    <fieldset className="setting">
      <legend className="setting-label">{label}</legend>
      <div className="segmented">
        {options.map((o) => (
          <label key={String(o.value)} className={`segment${o.value === value ? " segment-on" : ""}`}>
            <input type="radio" name={String(name)} checked={o.value === value} onChange={() => onChange(o.value)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Monte Carlo sample count. Typing only edits local text; the value is committed on blur or
 * Enter, so clearing the field to retype never sends 0 (which would silently switch ranges off).
 * Blank or non-numeric text reverts to the current value.
 */
function MonteCarloField({ value, onCommit }: { readonly value: number; readonly onCommit: (n: number) => void }) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);
  const commit = () => {
    const t = text.trim();
    const n = Number(t);
    if (t === "" || !Number.isFinite(n)) {
      setText(String(value));
      return;
    }
    const clamped = Math.min(MAX_MONTE_CARLO_SAMPLES, Math.max(0, Math.round(n)));
    setText(String(clamped));
    if (clamped !== value) onCommit(clamped);
  };
  return (
    <input
      id="mc-samples"
      type="number"
      min={0}
      max={MAX_MONTE_CARLO_SAMPLES}
      step={10}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
      }}
    />
  );
}

export function SettingsScreen() {
  const { state, actions } = useApp();
  const s = state.settings;
  const patch = actions.patchSettings;
  return (
    <div className="screen settings">
      <h1>Settings</h1>
      <section className="card">
        <h2>Display</h2>
        <Choice
          name="units"
          label="Units"
          value={s.units}
          options={[
            { value: "imperial", label: "Imperial golf (yd, ft, mph)" },
            { value: "metric", label: "Metric (m, km/h)" },
          ]}
          onChange={(units) => patch({ units })}
        />
        <Choice
          name="precision"
          label="Precision"
          value={s.precision}
          options={[
            { value: "golfer", label: "Golfer (rounded)" },
            { value: "engineering", label: "Engineering (SI, 3 dp)" },
          ]}
          onChange={(precision) => patch({ precision })}
        />
        <Choice
          name="theme"
          label="Theme"
          value={s.theme}
          options={[
            { value: "dark", label: "Dark" },
            { value: "light", label: "Light" },
          ]}
          onChange={(theme) => patch({ theme })}
        />
      </section>
      <section className="card">
        <h2>Physics and data</h2>
        <Toggle
          label="Allow generic spin fallback"
          checked={s.allowGenericSpinFallback}
          onChange={(v) => patch({ allowGenericSpinFallback: v })}
        >
          <p>
            Off by default. When spin is neither observed nor estimable from a club, the shot is not simulated. Turning this on lets the
            pipeline assume a GENERIC spin that is not about your shot: carry, curve, descent and roll then become generic, are badged ASSUMED,
            carry very low confidence, and the shot is provisional.
          </p>
        </Toggle>
        <Toggle
          label="Retain raw observations (diagnostic consent)"
          checked={s.retainRawObservations}
          onChange={(v) => patch({ retainRawObservations: v })}
        >
          <p>Off by default. When on, every shot record keeps its raw sensor observations (local only) for diagnosis and re-processing.</p>
        </Toggle>
        <Toggle
          label="Allow provisional shots in casual scoring"
          checked={s.allowProvisionalInCasual}
          onChange={(v) => patch({ allowProvisionalInCasual: v })}
        >
          <p>Off by default. This has no effect yet: course play and scoring arrive in Phase 5.</p>
        </Toggle>
        <div className="setting">
          <label className="setting-label" htmlFor="mc-samples">
            Monte Carlo samples
          </label>
          <MonteCarloField value={s.monteCarloSamples} onCommit={(monteCarloSamples) => patch({ monteCarloSamples })} />
          <p className="setting-desc">
            Default {DEFAULT_MONTE_CARLO_SAMPLES}. Propagates launch uncertainty to carry/total ranges; more samples give steadier
            ranges but take longer (the work runs off the UI thread). 0 disables ranges entirely. Applied when you leave the field or press
            Enter.
          </p>
        </div>
      </section>
      <section className="card">
        <h2>Developer</h2>
        <Toggle label="Developer mode" checked={s.developerMode} onChange={(v) => patch({ developerMode: v })}>
          <p>Enables manual entry of launch conditions on the Setup and Range screens. Manual shots are labelled MANUAL, never measured.</p>
        </Toggle>
      </section>
    </div>
  );
}
