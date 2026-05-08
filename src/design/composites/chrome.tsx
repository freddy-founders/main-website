import type { ReactNode } from 'react';
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
