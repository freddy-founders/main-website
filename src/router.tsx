import { useEffect, useState } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { listPendingRegistrationRequests } from './application/admin';
import { listPublicCompanies } from './application/companies';
import { listPublicEvents } from './application/events';
import { listPublicPeople } from './application/people';
import type { RegistrationRequest } from './domain/accounts';
import type { CompanySummary } from './domain/companies';
import type { EventRegistrationAction, EventSummary } from './domain/events';
import type { PersonSummary } from './domain/people';

type PublicEventView = EventSummary & {
  registrationAction: EventRegistrationAction;
};

function useAsyncList<T>(loader: () => Promise<T[]>): T[] {
  const [items, setItems] = useState<T[]>([]);

  useEffect(() => {
    let active = true;

    loader().then((loadedItems) => {
      if (active) {
        setItems(loadedItems);
      }
    });

    return () => {
      active = false;
    };
  }, [loader]);

  return items;
}

function Shell() {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">Freddy Founders</div>
        <nav className="nav" aria-label="Primary navigation">
          <NavLink to="/events">Events</NavLink>
          <NavLink to="/people">People</NavLink>
          <NavLink to="/companies">Companies</NavLink>
          <NavLink to="/login">Login</NavLink>
          <NavLink to="/register">Register</NavLink>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Navigate to="/events" replace />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/people" element={<PeoplePage />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </div>
  );
}

function EventsPage() {
  const events = useAsyncList<PublicEventView>(listPublicEvents);

  return (
    <main className="main-grid">
      <section className="panel" aria-labelledby="events-heading">
        <div className="panel-header">
          <h1 id="events-heading">Events</h1>
        </div>
        <ul className="row-list">
          {events.map((event) => (
            <li className="row" key={event.id}>
              <div className="row-title">{event.title}</div>
              <div>{event.summary}</div>
              <div className="meta">
                {new Date(event.startsAt).toLocaleDateString()} · {event.locationLabel} ·{' '}
                {event.capacityStatus}
              </div>
              {event.registrationAction.kind === 'external' ? (
                <div className="actions">
                  <a className="button" href={event.registrationAction.url}>
                    {event.registrationAction.label}
                  </a>
                </div>
              ) : (
                <div className="notice">{event.registrationAction.label}</div>
              )}
            </li>
          ))}
        </ul>
      </section>
      <aside className="rail" aria-label="Events context">
        <div className="rail-section">
          <h2>Public events</h2>
        </div>
        <div className="notice">
          Events are the front page. Registration stays external or disabled until the internal RSVP
          seam is explicitly activated.
        </div>
      </aside>
    </main>
  );
}

function PeoplePage() {
  const people = useAsyncList<PersonSummary>(listPublicPeople);

  return (
    <main className="main-grid">
      <section className="panel" aria-labelledby="people-heading">
        <div className="panel-header">
          <h1 id="people-heading">People</h1>
        </div>
        <ul className="row-list">
          {people.map((person) => (
            <li className="row" key={person.id}>
              <div className="row-title">{person.name}</div>
              <div>{person.founderContext}</div>
              <div className="meta">
                {person.role} · {person.companyName ?? 'Independent'} · {person.topics.join(', ')}
              </div>
            </li>
          ))}
        </ul>
      </section>
      <aside className="rail" aria-label="People context">
        <div className="rail-section">
          <h2>Directory rules</h2>
        </div>
        <div className="notice">
          Public people rows must be published, public, and consented for directory display.
        </div>
      </aside>
    </main>
  );
}

function CompaniesPage() {
  const companies = useAsyncList<CompanySummary>(listPublicCompanies);

  return (
    <main className="main-grid">
      <section className="panel" aria-labelledby="companies-heading">
        <div className="panel-header">
          <h1 id="companies-heading">Companies</h1>
        </div>
        <ul className="row-list">
          {companies.map((company) => (
            <li className="row" key={company.id}>
              <div className="row-title">{company.name}</div>
              <div>{company.tagline}</div>
              <div className="meta">
                {company.category} · {company.stage ?? 'stage unknown'} ·{' '}
                {company.locationLabel ?? 'location unknown'}
              </div>
            </li>
          ))}
        </ul>
      </section>
      <aside className="rail" aria-label="Companies context">
        <div className="rail-section">
          <h2>YC-style index</h2>
        </div>
        <div className="notice">
          Companies are a compact network directory, not a vendor marketplace or marketing site.
        </div>
      </aside>
    </main>
  );
}

function LoginPage() {
  return (
    <main className="main-grid">
      <section className="panel" aria-labelledby="login-heading">
        <div className="panel-header">
          <h1 id="login-heading">Login</h1>
        </div>
        <form className="form-grid">
          <label className="field">
            <span>Email</span>
            <input type="email" name="email" autoComplete="email" />
          </label>
          <button className="button" type="button">
            Continue
          </button>
        </form>
      </section>
      <aside className="rail" aria-label="Login context">
        <div className="rail-section">
          <h2>No browsing wall</h2>
        </div>
        <div className="notice">Public Events, People, and Companies remain available.</div>
      </aside>
    </main>
  );
}

function RegisterPage() {
  return (
    <main className="main-grid">
      <section className="panel" aria-labelledby="register-heading">
        <div className="panel-header">
          <h1 id="register-heading">Register</h1>
        </div>
        <form className="form-grid">
          <label className="field">
            <span>Name</span>
            <input name="name" autoComplete="name" />
          </label>
          <label className="field">
            <span>Email</span>
            <input type="email" name="email" autoComplete="email" />
          </label>
          <label className="field">
            <span>Company / Role</span>
            <input name="company-role" />
          </label>
          <label className="field">
            <span>Founder context</span>
            <textarea name="founder-context" rows={4} />
          </label>
          <button className="button" type="button">
            Request access
          </button>
        </form>
      </section>
      <aside className="rail" aria-label="Registration context">
        <div className="rail-section">
          <h2>Consent-aware</h2>
        </div>
        <div className="notice">
          Registration creates an account request. Public directory display is not automatic.
        </div>
      </aside>
    </main>
  );
}

function AdminPage() {
  const requests = useAsyncList<RegistrationRequest>(() =>
    listPendingRegistrationRequests('admin'),
  );

  return (
    <main className="main-grid">
      <section className="panel" aria-labelledby="admin-heading">
        <div className="panel-header">
          <h1 id="admin-heading">Admin Maintenance</h1>
        </div>
        <ul className="row-list">
          {requests.map((request) => (
            <li className="row" key={request.id}>
              <div className="row-title">{request.name}</div>
              <div>{request.founderContext}</div>
              <div className="meta">{request.status} · registration request</div>
            </li>
          ))}
        </ul>
      </section>
      <aside className="rail" aria-label="Admin context">
        <div className="rail-section">
          <h2>Maintenance only</h2>
        </div>
        <div className="notice">
          Admin should stay focused on Events, People, Companies, and pending registrations.
        </div>
      </aside>
    </main>
  );
}

export function AppRouter() {
  return <Shell />;
}
