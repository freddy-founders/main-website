import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

export function AppChrome({ children }: { children: ReactNode }) {
  return <div className="ff-app">{children}</div>;
}

export function Topbar() {
  return (
    <header className="ff-topbar">
      <div className="ff-mark ff-mono">F</div>
      <div className="ff-brand-block">
        <div className="ff-brand">Freddy Founders</div>
        <div className="ff-brand-subtitle ff-mono">Events / People / Companies</div>
      </div>
      <nav className="ff-nav" aria-label="Primary navigation">
        <NavLink to="/events">Events</NavLink>
        <NavLink to="/people">People</NavLink>
        <NavLink to="/companies">Companies</NavLink>
        <NavLink to="/login">Login</NavLink>
        <NavLink to="/register">Register</NavLink>
      </nav>
    </header>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <main className="ff-shell">
      <div className="ff-stripe" />
      <section className="ff-grid-public">{children}</section>
    </main>
  );
}

interface PanelProps {
  title: string;
  eyebrow?: string;
  tone?: 'default' | 'accent';
  children: ReactNode;
}

export function Panel({ title, eyebrow = 'DEFAULT LIST', tone = 'accent', children }: PanelProps) {
  return (
    <section className="ff-panel" aria-labelledby={`${slugify(title)}-heading`}>
      <div className="ff-panel-head" data-tone={tone}>
        <span id={`${slugify(title)}-heading`}>[ {title} ]</span>
        <span>{eyebrow}</span>
      </div>
      <div className="ff-panel-body">{children}</div>
    </section>
  );
}

interface RailProps {
  title: string;
  copy: string;
  stats?: Array<{ label: string; value: string }>;
  children?: ReactNode;
}

export function Rail({ title, copy, stats = [], children }: RailProps) {
  return (
    <aside className="ff-rail" aria-label={`${title} context`}>
      <div className="ff-rail-section">
        <div className="ff-rail-title">{title}</div>
        <div className="ff-rail-copy">{copy}</div>
      </div>
      {stats.length > 0 ? (
        <div className="ff-stat-grid ff-mono">
          {stats.map((stat) => (
            <div className="ff-stat" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      ) : null}
      {children}
    </aside>
  );
}

export function RowList({ children }: { children: ReactNode }) {
  return <ul className="ff-row-list">{children}</ul>;
}

export function Row({
  title,
  meta,
  children,
  actions,
}: {
  title: string;
  meta?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <li className="ff-row">
      <div className="ff-row-title">{title}</div>
      {children ? <div className="ff-row-copy">{children}</div> : null}
      {meta ? <Meta>{meta}</Meta> : null}
      {actions ? <div className="ff-actions">{actions}</div> : null}
    </li>
  );
}

export function Meta({ children }: { children: ReactNode }) {
  return <div className="ff-meta">{children}</div>;
}

export function ButtonLink({
  tone = 'primary',
  ...props
}: ComponentPropsWithoutRef<'a'> & { tone?: 'primary' | 'neutral' | 'success' }) {
  return <a className="ff-button" data-tone={tone} {...props} />;
}

export function Button({
  tone = 'primary',
  ...props
}: ComponentPropsWithoutRef<'button'> & { tone?: 'primary' | 'neutral' | 'success' }) {
  return <button className="ff-button" data-tone={tone} {...props} />;
}

export function Tag({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'accent' | 'success';
  children: ReactNode;
}) {
  return (
    <span className="ff-tag" data-tone={tone === 'neutral' ? undefined : tone}>
      {children}
    </span>
  );
}

export function TagList({ items }: { items: string[] }) {
  return (
    <div className="ff-tag-list">
      {items.map((item) => (
        <Tag key={item}>{item}</Tag>
      ))}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="ff-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function TextInput(props: ComponentPropsWithoutRef<'input'>) {
  return <input className="ff-input" {...props} />;
}

export function TextArea(props: ComponentPropsWithoutRef<'textarea'>) {
  return <textarea className="ff-input" {...props} />;
}

export function Notice({ children }: { children: ReactNode }) {
  return <div className="ff-notice">{children}</div>;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
