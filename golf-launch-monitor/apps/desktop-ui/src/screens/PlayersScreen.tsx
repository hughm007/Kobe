import type { Handedness, Player } from "@glm/shared-types";
import { type FormEvent, useId, useState } from "react";
import { ConfirmButton } from "../components/ConfirmButton";
import { useApp } from "../state/AppContext";

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function PlayerForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  readonly initial: { readonly displayName: string; readonly handedness: Handedness };
  readonly submitLabel: string;
  readonly onSubmit: (displayName: string, handedness: Handedness) => Promise<void>;
  readonly onCancel?: () => void;
}) {
  const [name, setName] = useState(initial.displayName);
  const [hand, setHand] = useState<Handedness>(initial.handedness);
  const [error, setError] = useState<string | null>(null);
  const group = useId();
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed === "") {
      setError("Enter a name.");
      return;
    }
    try {
      await onSubmit(trimmed, hand);
      setError(null);
      if (onCancel === undefined) setName("");
    } catch (err) {
      setError(errorText(err));
    }
  };
  return (
    <form className="inline-form" onSubmit={submit} aria-label={submitLabel}>
      <div className="field">
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
        </label>
      </div>
      <fieldset className="field">
        <legend>Handedness</legend>
        <label className="check">
          <input type="radio" name={group} checked={hand === "right"} onChange={() => setHand("right")} /> <span>Right-handed</span>
        </label>
        <label className="check">
          <input type="radio" name={group} checked={hand === "left"} onChange={() => setHand("left")} /> <span>Left-handed</span>
        </label>
      </fieldset>
      <div className="button-row">
        <button type="submit" className="button-primary">
          {submitLabel}
        </button>
        {onCancel !== undefined && (
          <button type="button" className="button-ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
      {error !== null && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

function PlayerRow({ player }: { readonly player: Player }) {
  const { state, actions } = useApp();
  const [editing, setEditing] = useState(false);
  const [deleteShots, setDeleteShots] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  if (editing) {
    return (
      <li className="card">
        <PlayerForm
          initial={player}
          submitLabel="Save player"
          onCancel={() => setEditing(false)}
          onSubmit={async (displayName, handedness) => {
            await actions.savePlayer({ ...player, displayName, handedness });
            setEditing(false);
          }}
        />
      </li>
    );
  }
  return (
    <li className="card player-row">
      <div>
        <strong className="player-name">{player.displayName}</strong> <span className="pill">{player.handedness}-handed</span>
        {state.settings.playerId === player.id && <span className="pill pill-valid">selected</span>}
      </div>
      <div className="button-row">
        <button type="button" onClick={() => actions.patchSettings({ playerId: player.id })}>
          Select
        </button>
        <button type="button" className="button-ghost" onClick={() => setEditing(true)}>
          Edit
        </button>
        <ConfirmButton
          label="Delete player"
          confirmLabel="Delete player"
          question={`Delete ${player.displayName}?`}
          extra={
            <label className="check">
              <input type="checkbox" checked={deleteShots} onChange={(e) => setDeleteShots(e.target.checked)} />
              <span>Also delete every stored shot by this player</span>
            </label>
          }
          onConfirm={async () => {
            try {
              const n = await actions.deletePlayer(player.id, deleteShots);
              setMessage(deleteShots ? `Deleted with ${n} shot(s).` : null);
            } catch (e) {
              setMessage(`Could not delete: ${errorText(e)}`);
            }
          }}
        />
      </div>
      {message !== null && <p className="muted">{message}</p>}
    </li>
  );
}

export function PlayersScreen() {
  const { state, actions, runtime } = useApp();
  return (
    <div className="screen">
      <h1>Players</h1>
      <section className="card">
        <h2>Add a player</h2>
        <PlayerForm
          initial={{ displayName: "", handedness: "right" }}
          submitLabel="Add player"
          onSubmit={async (displayName, handedness) => {
            await actions.savePlayer({ id: runtime.newId(), displayName, handedness, createdUtc: runtime.nowUtc() });
          }}
        />
        <p className="muted small">Players are stored only on this computer. Handedness changes draw/fade labels, never physics.</p>
      </section>
      {state.players.length === 0 ? (
        <p className="muted">No players yet.</p>
      ) : (
        <ul className="player-list">
          {state.players.map((p) => (
            <PlayerRow key={p.id} player={p} />
          ))}
        </ul>
      )}
    </div>
  );
}
