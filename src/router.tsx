import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { listPendingRegistrationRequests } from './application/admin';
import { listPublicCompanies } from './application/companies';
import { listPublicEvents } from './application/events';
import { listPublicPeople } from './application/people';
import {
  AppChrome,
  Button,
  ButtonLink,
  Field,
  Notice,
  PageShell,
  Panel,
  Rail,
  Row,
  RowList,
  TagList,
  TextArea,
  TextInput,
  Topbar,
} from './design';
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
    <AppChrome>
      <Topbar />
      <Routes>
        <Route path="/" element={<Navigate to="/events" replace />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/people" element={<PeoplePage />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </AppChrome>
  );
}

function EventsPage() {
  const events = useAsyncList<PublicEventView>(listPublicEvents);

  return (
    <PageShell>
      <Panel title="Upcoming Events" eyebrow="Default List">
        <RowList>
          {events.map((event) => (
            <Row
              key={event.id}
              title={event.title}
              meta={`${new Date(event.startsAt).toLocaleDateString()} / ${event.locationLabel} / ${event.capacityStatus}`}
              actions={
                event.registrationAction.kind === 'external' ? (
                  <ButtonLink href={event.registrationAction.url}>
                    {event.registrationAction.label}
                  </ButtonLink>
                ) : (
                  <Notice>{event.registrationAction.label}</Notice>
                )
              }
            >
              {event.summary}
            </Row>
          ))}
        </RowList>
      </Panel>
      <Rail
        title="Public events"
        copy="Events are the front page. Registration stays external or disabled until the internal RSVP seam is explicitly activated."
        stats={[
          { value: String(events.length).padStart(2, '0'), label: 'Upcoming events' },
          { value: '00', label: 'Internal RSVPs' },
        ]}
      />
    </PageShell>
  );
}

function PeoplePage() {
  const people = useAsyncList<PersonSummary>(listPublicPeople);

  return (
    <PageShell>
      <Panel title="Directory" eyebrow="Public-Safe Rows">
        <RowList>
          {people.map((person) => (
            <Row
              key={person.id}
              title={person.name}
              meta={`${person.role} / ${person.companyName ?? 'Independent'} / ${person.locationLabel ?? 'Location Hidden'}`}
              actions={<TagList items={person.topics} />}
            >
              {person.founderContext}
            </Row>
          ))}
        </RowList>
      </Panel>
      <Rail
        title="Directory rules"
        copy="People rows must be published, public, and consented for directory display. This is context, not a social feed."
        stats={[
          { value: String(people.length).padStart(2, '0'), label: 'Public people' },
          { value: 'YES', label: 'Consent gate' },
        ]}
      />
    </PageShell>
  );
}

function CompaniesPage() {
  const companies = useAsyncList<CompanySummary>(listPublicCompanies);

  return (
    <PageShell>
      <Panel title="Companies" eyebrow="YC-Style Directory">
        <RowList>
          {companies.map((company) => (
            <Row
              key={company.id}
              title={company.name}
              meta={`${company.category} / ${company.stage ?? 'Stage Unknown'} / ${company.locationLabel ?? 'Location Unknown'}`}
              actions={<TagList items={company.relatedPeople} />}
            >
              {company.tagline}
            </Row>
          ))}
        </RowList>
      </Panel>
      <Rail
        title="Company index"
        copy="Companies are a compact network directory, not a vendor marketplace or marketing landing page."
        stats={[
          { value: String(companies.length).padStart(2, '0'), label: 'Public companies' },
          { value: 'NO', label: 'Marketplace' },
        ]}
      />
    </PageShell>
  );
}

function LoginPage() {
  return (
    <PageShell>
      <Panel title="Login" eyebrow="Returning Member / Admin">
        <div className="ff-field-grid">
          <Field label="Email">
            <TextInput
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@company.com"
            />
          </Field>
          <Button type="button">Continue</Button>
        </div>
      </Panel>
      <Rail
        title="No browsing wall"
        copy="Public Events, People, and Companies remain available. Login is for returning members, organizers, and admins."
      />
    </PageShell>
  );
}

function RegisterPage() {
  return (
    <PageShell>
      <Panel title="Registration" eyebrow="Request Account">
        <div className="ff-field-grid">
          <Field label="Name">
            <TextInput name="name" autoComplete="name" placeholder="Full name" />
          </Field>
          <Field label="Email">
            <TextInput
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@company.com"
            />
          </Field>
          <Field label="Company / Role">
            <TextInput name="company-role" placeholder="Company / founder, operator, investor" />
          </Field>
          <Field label="Founder context">
            <TextArea
              name="founder-context"
              rows={4}
              placeholder="What context should organizers review?"
            />
          </Field>
          <Button type="button">Request access</Button>
        </div>
      </Panel>
      <Rail
        title="Consent-aware"
        copy="Registration creates an account request. Public directory display is reviewed and consent-aware, not automatic."
      />
    </PageShell>
  );
}

function AdminPage() {
  const requests = useAsyncList<RegistrationRequest>(() =>
    listPendingRegistrationRequests('admin'),
  );

  return (
    <PageShell>
      <Panel title="Admin Maintenance" eyebrow="Simple CRUD">
        <RowList>
          {requests.map((request) => (
            <Row
              key={request.id}
              title={request.name}
              meta={`${request.status} / registration request`}
            >
              {request.founderContext}
            </Row>
          ))}
        </RowList>
      </Panel>
      <Rail
        title="Maintenance only"
        copy="Admin should stay focused on Events, People, Companies, and pending registrations. No dashboard sprawl."
        stats={[
          { value: String(requests.length).padStart(2, '0'), label: 'Pending' },
          { value: 'CRUD', label: 'Scope' },
        ]}
      />
    </PageShell>
  );
}

export function AppRouter() {
  return <Shell />;
}
