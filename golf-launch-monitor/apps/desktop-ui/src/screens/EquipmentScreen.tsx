import { BALL_PROFILES } from "@glm/ballistics";
import { CLUB_CATEGORIES, type Club, type ClubCategory } from "@glm/shared-types";
import { useApp } from "../state/AppContext";

const isCategory = (v: string): v is ClubCategory => (CLUB_CATEGORIES as readonly string[]).includes(v);

function ClubRow({ club, onChange, onRemove }: { readonly club: Club; readonly onChange: (c: Club) => void; readonly onRemove: () => void }) {
  return (
    <tr>
      <td>
        <input aria-label="Club label" value={club.label} maxLength={40} onChange={(e) => onChange({ ...club, label: e.target.value })} />
      </td>
      <td>
        <select
          aria-label="Club category"
          value={club.category}
          onChange={(e) => {
            if (isCategory(e.target.value)) onChange({ ...club, category: e.target.value });
          }}
        >
          {CLUB_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </td>
      <td>
        <input
          aria-label="Static loft in degrees (optional)"
          inputMode="decimal"
          placeholder="unknown"
          defaultValue={club.staticLoftDeg ?? ""}
          onBlur={(e) => {
            const t = e.target.value.trim();
            const n = Number(t);
            if (t === "") onChange({ ...club, staticLoftDeg: null });
            else if (Number.isFinite(n) && n >= 0 && n <= 90) onChange({ ...club, staticLoftDeg: n });
            else e.target.value = club.staticLoftDeg === null ? "" : String(club.staticLoftDeg);
          }}
        />
      </td>
      <td>
        <button type="button" className="button-ghost" onClick={onRemove} aria-label={`Remove ${club.label}`}>
          Remove
        </button>
      </td>
    </tr>
  );
}

export function EquipmentScreen() {
  const { state, actions, runtime } = useApp();
  const bag = state.settings.bag;
  const setBag = (next: readonly Club[]) => {
    const clubId = next.some((c) => c.id === state.settings.clubId) ? state.settings.clubId : null;
    actions.patchSettings({ bag: next, clubId });
  };
  return (
    <div className="screen">
      <h1>Equipment</h1>
      <section className="card">
        <h2>Bag</h2>
        <p className="muted">
          Label, category and optional static loft only. Clubs never carry a distance: carry and total always come from the launch
          state and the physics model. The category lets the pipeline estimate spin (clearly labelled ESTIMATED) when spin is not observed.
        </p>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Label</th>
              <th scope="col">Category</th>
              <th scope="col">Static loft (°, optional)</th>
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {bag.map((club) => (
              <ClubRow
                key={club.id}
                club={club}
                onChange={(c) => setBag(bag.map((x) => (x.id === c.id ? c : x)))}
                onRemove={() => setBag(bag.filter((x) => x.id !== club.id))}
              />
            ))}
          </tbody>
        </table>
        <button
          type="button"
          onClick={() => setBag([...bag, { id: `club-${runtime.newId()}`, label: "New club", category: "mid-iron", staticLoftDeg: null }])}
        >
          Add club
        </button>
      </section>
      <section className="card">
        <h2>Ball profiles</h2>
        <p className="muted">
          No profile is universal and none is fit to measured data yet. Each states its limitations; warnings are shown whenever it is selected.
        </p>
        <div className="ball-grid">
          {BALL_PROFILES.map((b) => (
            <article key={b.id} className={`ball${b.id === state.settings.ballProfileId ? " ball-selected" : ""}`}>
              <h3>{b.name}</h3>
              <p className="muted small">
                <code>
                  {b.id}@{b.version}
                </code>{" "}
                · source {b.source} · confidence ceiling {Math.round(b.confidenceCeiling * 100)}%
              </p>
              <p className="small">
                Applicable: {b.applicableSpeedRangeMps.min}–{b.applicableSpeedRangeMps.max} m/s ball speed,{" "}
                {b.applicableSpinRangeRpm.min}–{b.applicableSpinRangeRpm.max} rpm spin
              </p>
              <h4>Warnings</h4>
              <ul className="warning-list">
                {b.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
              <h4>Limitations</h4>
              <ul className="small">
                {b.limitations.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
              <button
                type="button"
                disabled={b.id === state.settings.ballProfileId}
                onClick={() => actions.patchSettings({ ballProfileId: b.id })}
              >
                {b.id === state.settings.ballProfileId ? "Selected" : "Use this ball"}
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
