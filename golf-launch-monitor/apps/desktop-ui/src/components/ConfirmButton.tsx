import { type ReactNode, useState } from "react";

export type ConfirmButtonProps = {
  readonly label: string;
  readonly confirmLabel: string;
  readonly question: ReactNode;
  readonly onConfirm: () => void | Promise<void>;
  readonly disabled?: boolean;
  /** Extra controls shown with the question (e.g. "also delete shots"). */
  readonly extra?: ReactNode;
};

/** Two-step destructive action, inline and keyboard accessible (no window.confirm). */
export function ConfirmButton({ label, confirmLabel, question, onConfirm, disabled = false, extra }: ConfirmButtonProps) {
  const [asking, setAsking] = useState(false);
  const [working, setWorking] = useState(false);
  if (!asking) {
    return (
      <button type="button" className="button-danger" disabled={disabled} onClick={() => setAsking(true)}>
        {label}
      </button>
    );
  }
  return (
    <div className="confirm" role="group" aria-label={label}>
      <p className="confirm-question">{question}</p>
      {extra}
      <div className="button-row">
        <button
          type="button"
          className="button-danger"
          disabled={working}
          onClick={async () => {
            setWorking(true);
            try {
              await onConfirm();
            } finally {
              setWorking(false);
              setAsking(false);
            }
          }}
        >
          {confirmLabel}
        </button>
        <button type="button" className="button-ghost" onClick={() => setAsking(false)} autoFocus>
          Cancel
        </button>
      </div>
    </div>
  );
}
