import { type DependencyList, type FormEvent, useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { listPendingRegistrationRequests } from './application/admin';
import { getCurrentSession, sendMagicLink } from './application/auth';
import { listPublicCompanies } from './application/companies';
import { listPublicEvents } from './application/events';
import { listPublicPeople } from './application/people';
import { createRegistrationRequest } from './application/registrationRequests';
import {
  AppChrome,
  BoardAside,
  BoardColumn,
  BoardSection,
  Button,
  ButtonLink,
  ChipBar,
  FieldList,
  Field,
  FieldGrid,
  PageShell,
  ScheduleMarker,
  ScheduleRow,
  SpecPanel,
  Panel,
  Notice,
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

function useAsyncList<T>(loader: () => Promise<T[]>, deps: DependencyList = [loader]): T[] {
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
  }, deps);

  return items;
}

function useAsyncValue<T>(loader: () => Promise<T>, deps: DependencyList = [loader]): T | null {
  const [value, setValue] = useState<T | null>(null);

  useEffect(() => {
    let active = true;

    loader().then((loadedValue) => {
      if (active) {
        setValue(loadedValue);
      }
    });

    return () => {
      active = false;
    };
  }, deps);

  return value;
}

const halifaxDate = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: 'short',
  timeZone: 'America/Halifax',
  weekday: 'short',
});

const halifaxTime = new Intl.DateTimeFormat('en-CA', {
  hour: '2-digit',
  hour12: false,
  minute: '2-digit',
  timeZone: 'America/Halifax',
});

function eventMarkerParts(startsAt: string) {
  const date = new Date(startsAt);
  const parts = Object.fromEntries(
    halifaxDate.formatToParts(date).map((part) => [part.type, part.value]),
  );

  return {
    day: parts.day ?? '',
    month: (parts.month ?? '').toUpperCase(),
    time: halifaxTime.format(date),
    weekday: (parts.weekday ?? '').toUpperCase(),
  };
}

function eventMeta(event: EventSummary): string {
  return `${event.locationLabel} / public / ${event.capacityStatus}`;
}

function eventTags(event: EventSummary) {
  return [
    {
      label: event.capacityStatus,
      tone: event.capacityStatus === 'open' ? 'success' : 'neutral',
    } as const,
    { label: event.registrationMode === 'external' ? 'register first' : 'rsvp seam' },
  ];
}

function byStartDateAscending(left: EventSummary, right: EventSummary): number {
  return new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime();
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
  const people = useAsyncList<PersonSummary>(listPublicPeople);
  const today = new Date('2026-05-08T00:00:00.000-03:00').getTime();
  const upcomingEvents = events
    .filter((event) => new Date(event.startsAt).getTime() >= today)
    .sort(byStartDateAscending);
  const pastEvents = events
    .filter((event) => new Date(event.startsAt).getTime() < today)
    .sort(byStartDateAscending);

  return (
    <PageShell>
      <BoardColumn>
        <BoardSection label="Upcoming Events" meta="Default List">
          {upcomingEvents.map((event) => (
            <EventScheduleRow key={event.id} event={event} />
          ))}
        </BoardSection>
        <BoardSection label="Past" meta="Archive" tone="black">
          {pastEvents.map((event) => (
            <EventScheduleRow key={event.id} event={event} compact />
          ))}
        </BoardSection>
      </BoardColumn>
      <BoardAside>
        <SpecPanel
          eyebrow="Events"
          title="Events"
          context="Upcoming Freddy Founders events. Plain rows, useful metadata, RSVP/register first. No feed, no comments, no ranking."
          notes={['Default public front page', 'Public / no login needed']}
          stats={[
            { value: String(upcomingEvents.length).padStart(2, '0'), label: 'Upcoming events' },
            { value: String(people.length).padStart(2, '0'), label: 'Public people' },
          ]}
        />
        <BoardSection label="Filters" meta="Events" tone="black">
          <ChipBar
            chips={[
              { label: 'Upcoming', active: true },
              { label: 'Open' },
              { label: 'In person' },
              { label: 'Remote' },
              { label: 'Past' },
            ]}
          />
        </BoardSection>
        <BoardSection label="Rows Show" meta="Event Fields" tone="black">
          <FieldList
            items={[
              'Date/time, location or format, host, and status.',
              'One-line fit/context plus RSVP/register action.',
              'Small tags for capacity and routing cues.',
            ]}
          />
        </BoardSection>
      </BoardAside>
    </PageShell>
  );
}

function EventScheduleRow({
  event,
  compact = false,
}: {
  event: PublicEventView;
  compact?: boolean;
}) {
  const marker = eventMarkerParts(event.startsAt);

  return (
    <ScheduleRow
      marker={
        <ScheduleMarker
          day={marker.day}
          month={marker.month}
          time={compact ? undefined : marker.time}
          weekday={marker.weekday}
        />
      }
      title={event.title}
      meta={eventMeta(event)}
      tags={compact ? [] : eventTags(event)}
      actions={
        event.registrationAction.kind === 'external' ? (
          <>
            <ButtonLink href={event.registrationAction.url}>
              {event.registrationAction.label}
            </ButtonLink>
            <Button type="button" tone="neutral">
              Details
            </Button>
          </>
        ) : event.registrationAction.kind === 'future-internal' ? (
          <>
            <Button type="button">{event.registrationAction.label}</Button>
            <Button type="button" tone="neutral">
              Details
            </Button>
          </>
        ) : (
          <>
            <Button type="button" tone="neutral">
              {event.registrationAction.label}
            </Button>
            <Button type="button" tone="neutral">
              Details
            </Button>
          </>
        )
      }
    >
      {compact ? undefined : event.summary}
    </ScheduleRow>
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
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('Sending magic link...');

    try {
      await sendMagicLink(email, `${window.location.origin}/admin`);
      setStatus('Check your email for the Freddy Founders login link.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not send login link.');
    }
  }

  return (
    <PageShell>
      <Panel title="Login" eyebrow="Returning Member / Admin">
        <form onSubmit={handleSubmit}>
          <FieldGrid>
            <Field label="Email">
              <TextInput
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@company.com"
                required
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
              />
            </Field>
            <Button type="submit">Send magic link</Button>
            {status ? <Notice>{status}</Notice> : null}
          </FieldGrid>
        </form>
      </Panel>
      <Rail
        title="No browsing wall"
        copy="Public Events, People, and Companies remain available. Login is for returning members, organizers, and admins."
      />
    </PageShell>
  );
}

function RegisterPage() {
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setStatus('Submitting founder/company request...');

    try {
      await createRegistrationRequest({
        name: String(form.get('name') ?? ''),
        email: String(form.get('email') ?? ''),
        companyName: String(form.get('company-name') ?? ''),
        companyWebsiteUrl: String(form.get('company-website-url') ?? ''),
        role: String(form.get('role') ?? ''),
        founderContext: String(form.get('founder-context') ?? ''),
        topics: String(form.get('topics') ?? '')
          .split(',')
          .map((topic) => topic.trim())
          .filter(Boolean),
        publicDirectoryConsent: form.get('public-directory-consent') === 'on',
        isCompanyFounder: form.get('is-company-founder') === 'on',
      });
      formElement.reset();
      setStatus('Request received. Organizers will review the company and founder claim.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not submit registration request.');
    }
  }

  return (
    <PageShell>
      <Panel title="Registration" eyebrow="Founder Company Request">
        <form onSubmit={handleSubmit}>
          <FieldGrid>
            <Field label="Name">
              <TextInput name="name" autoComplete="name" placeholder="Full name" required />
            </Field>
            <Field label="Email">
              <TextInput
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@company.com"
                required
              />
            </Field>
            <Field label="Company">
              <TextInput name="company-name" placeholder="Company name" required />
            </Field>
            <Field label="Company website">
              <TextInput
                type="url"
                name="company-website-url"
                placeholder="https://company.com"
                required
              />
            </Field>
            <Field label="Role">
              <TextInput name="role" placeholder="Founder / CEO / CTO" />
            </Field>
            <Field label="Topics">
              <TextInput name="topics" placeholder="AI, fundraising, local services" />
            </Field>
            <Field label="Founder context">
              <TextArea
                name="founder-context"
                rows={4}
                placeholder="What context should organizers review?"
              />
            </Field>
            <Field label="Founder affirmation">
              <TextInput type="checkbox" name="is-company-founder" required />
            </Field>
            <Field label="Public directory consent">
              <TextInput type="checkbox" name="public-directory-consent" />
            </Field>
            <Button type="submit">Request access</Button>
            {status ? <Notice>{status}</Notice> : null}
          </FieldGrid>
        </form>
      </Panel>
      <Rail
        title="Company-bound trust"
        copy="Signup creates a pending founder request and ensures a private company object from the website domain. Public directory display remains reviewed and consent-aware."
      />
    </PageShell>
  );
}

function AdminPage() {
  const session = useAsyncValue(getCurrentSession, []);
  const role = session?.role ?? null;
  const requests = useAsyncList<RegistrationRequest>(
    () => listPendingRegistrationRequests(role),
    [role],
  );

  return (
    <PageShell>
      <Panel title="Admin Maintenance" eyebrow="Simple CRUD">
        {session ? (
          <Notice>
            Signed in as {session.email} / {session.role}
          </Notice>
        ) : (
          <Notice>Sign in as an organizer or admin to review pending requests.</Notice>
        )}
        <RowList>
          {requests.map((request) => (
            <Row
              key={request.id}
              title={request.name}
              meta={`${request.status} / ${request.companyDomain} / founder: ${
                request.isCompanyFounder ? 'yes' : 'no'
              }`}
            >
              {request.founderContext}
            </Row>
          ))}
        </RowList>
      </Panel>
      <Rail
        title="Maintenance only"
        copy="Admin should stay focused on Events, People, Companies, and pending founder/company registrations. No dashboard sprawl."
        stats={[
          { value: String(requests.length).padStart(2, '0'), label: 'Pending' },
          { value: role ?? 'NONE', label: 'Session role' },
        ]}
      />
    </PageShell>
  );
}

export function AppRouter() {
  return <Shell />;
}
