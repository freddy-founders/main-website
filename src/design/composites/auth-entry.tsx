import type { ReactNode } from 'react';

export interface AuthEntryShellProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  secondary?: ReactNode;
  footer?: ReactNode;
}

export function AuthEntryShell({
  eyebrow,
  title,
  subtitle,
  children,
  secondary,
  footer,
}: AuthEntryShellProps) {
  return (
    <main className="ff-auth-entry">
      <section className="ff-auth-stack" aria-labelledby="auth-entry-title">
        <div className="ff-auth-brand" aria-label="Freddy Founders">
          <span className="ff-auth-mark">FF</span>
          <span>Freddy Founders</span>
        </div>
        <div className="ff-auth-card">
          <div className="ff-auth-card-head">
            <span>{eyebrow}</span>
            <strong id="auth-entry-title">{title}</strong>
            <p>{subtitle}</p>
          </div>
          <div className="ff-auth-card-body">{children}</div>
          {secondary ? <div className="ff-auth-secondary">{secondary}</div> : null}
        </div>
        {footer ? <div className="ff-auth-footer">{footer}</div> : null}
      </section>
    </main>
  );
}
