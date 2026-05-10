import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { userActions } from '../../domain/userActions';

export function AppChrome({ children }: { children: ReactNode }) {
  return <div className="ff-app">{children}</div>;
}

export function Topbar() {
  return (
    <header className="ff-topbar">
      <div className="ff-mark ff-mono" aria-label="Freddy Founders mark">
        FF
      </div>
      <div className="ff-command-line">
        <div className="ff-brand">Freddy Founders</div>
        <nav className="ff-primary-nav" aria-label="Primary navigation">
          <span className="ff-primary-separator" aria-hidden="true">
            /
          </span>
          <NavLink to="/events" data-user-action={userActions.navigateEvents}>
            Events
          </NavLink>
          <span className="ff-primary-separator" aria-hidden="true">
            /
          </span>
          <NavLink to="/people" data-user-action={userActions.navigatePeople}>
            People
          </NavLink>
          <span className="ff-primary-separator" aria-hidden="true">
            /
          </span>
          <NavLink to="/companies" data-user-action={userActions.navigateCompanies}>
            Companies
          </NavLink>
        </nav>
      </div>
      <nav className="ff-auth-nav" aria-label="Account navigation">
        <NavLink to="/login" data-user-action={userActions.navigateLogin}>
          Login
        </NavLink>
        <NavLink to="/register" data-user-action={userActions.navigateRegister}>
          Register
        </NavLink>
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
