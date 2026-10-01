import { useEffect, useId, useState } from "react";

export type NumberFieldProps = {
  readonly label: string;
  /** Display unit shown after the input. */
  readonly unit: string;
  /** Stored (usually SI) value, or null when blank. */
  readonly value: number | null;
  readonly onChange: (value: number | null) => void;
  readonly toDisplay?: (stored: number) => number;
  readonly fromDisplay?: (display: number) => number;
  readonly decimals?: number;
  readonly placeholder?: string;
  readonly help?: string;
  readonly disabled?: boolean;
  readonly step?: number;
};

const identity = (v: number) => v;

function displayText(value: number | null, toDisplay: (v: number) => number, decimals: number): string {
  if (value === null) return "";
  return String(Number(toDisplay(value).toFixed(decimals)));
}

/**
 * Number input in display units that stores the converted value. Blank means "not entered"
 * (null), never 0; text that is not a number is flagged and not committed.
 */
export function NumberField({
  label,
  unit,
  value,
  onChange,
  toDisplay = identity,
  fromDisplay = identity,
  decimals = 2,
  placeholder,
  help,
  disabled = false,
  step,
}: NumberFieldProps) {
  const id = useId();
  const external = displayText(value, toDisplay, decimals);
  const [text, setText] = useState(external);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) setText(external);
  }, [external, focused]);
  const trimmed = text.trim();
  const invalid = trimmed !== "" && !Number.isFinite(Number(trimmed));
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="field-input">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={text}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={invalid}
          aria-describedby={help ? `${id}-help` : undefined}
          data-step={step}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => {
            const next = e.target.value;
            setText(next);
            const t = next.trim();
            if (t === "") onChange(null);
            else if (Number.isFinite(Number(t))) onChange(fromDisplay(Number(t)));
          }}
        />
        <span className="field-unit">{unit}</span>
      </div>
      {invalid && <p className="field-error">Enter a number, or leave blank.</p>}
      {help && (
        <p id={`${id}-help`} className="field-help">
          {help}
        </p>
      )}
    </div>
  );
}
