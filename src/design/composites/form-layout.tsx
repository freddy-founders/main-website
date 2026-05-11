import type { ReactNode } from 'react';

export interface AutocompleteOption {
  value: string;
  label?: string;
}

export function Autocomplete({
  children,
  emptyLabel = 'No matches found.',
  listLabel,
  listboxId,
  onSelect,
  open,
  options,
}: {
  children: ReactNode;
  emptyLabel?: string;
  listLabel?: string;
  listboxId: string;
  onSelect: (value: string) => void;
  open: boolean;
  options: AutocompleteOption[];
}) {
  return (
    <div className="ff-autocomplete">
      {children}
      {open ? (
        <div id={listboxId} aria-label={listLabel} className="ff-autocomplete-list" role="listbox">
          {options.length > 0 ? (
            options.map((option) => (
              <button
                key={option.value}
                className="ff-autocomplete-option"
                onClick={() => onSelect(option.value)}
                onMouseDown={(event) => event.preventDefault()}
                role="option"
                type="button"
              >
                {option.label ?? option.value}
              </button>
            ))
          ) : (
            <div className="ff-autocomplete-empty">{emptyLabel}</div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="ff-field-grid">{children}</div>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="ff-field">
      <span>{label}</span>
      {children}
    </label>
  );
}
