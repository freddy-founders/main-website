import type { ReactNode } from 'react';

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
