import { type DependencyList, type FormEvent, type ReactNode, useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import {
  approveRegistrationRequest,
  archiveRegistrationRequest,
  deactivateProfile,
  listPendingRegistrationRequests,
  listProfiles,
  setProfileRole,
} from './application/admin';
import { getCurrentSession, sendMagicLink } from './application/auth';
import { listPublicCompanies } from './application/companies';
import { listPublicEvents } from './application/events';
import { listPublicPeople } from './application/people';
import { createRegistrationRequest } from './application/registrationRequests';
import {
  AuthEntryShell,
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
import type { ProfileAccount, RegistrationRequest } from './domain/accounts';
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

function useCurrentSession() {
  const [state, setState] = useState<{
    loading: boolean;
    session: Awaited<ReturnType<typeof getCurrentSession>>;
  }>({
    loading: true,
    session: null,
  });

  useEffect(() => {
    let active = true;

    getCurrentSession().then((session) => {
      if (active) {
        setState({ loading: false, session });
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return state;
}

function PrivateRoute({ children }: { children: ReactNode }) {
  const { loading, session } = useCurrentSession();

  if (loading) {
    return (
      <PageShell>
        <Panel title="Loading" eyebrow="Private Community">
          <Notice>Checking Freddy Founders access...</Notice>
        </Panel>
      </PageShell>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
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
  return `${event.locationLabel} / member / ${event.capacityStatus}`;
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

function PrivateApp({ children }: { children: ReactNode }) {
  return (
    <AppChrome>
      <Topbar />
      <PrivateRoute>{children}</PrivateRoute>
    </AppChrome>
  );
}

function Shell() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/events" replace />} />
      <Route
        path="/events"
        element={
          <PrivateApp>
            <EventsPage />
          </PrivateApp>
        }
      />
      <Route
        path="/people"
        element={
          <PrivateApp>
            <PeoplePage />
          </PrivateApp>
        }
      />
      <Route
        path="/companies"
        element={
          <PrivateApp>
            <CompaniesPage />
          </PrivateApp>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/callback" element={<LoginCallbackPage />} />
      <Route
        path="/admin"
        element={
          <PrivateApp>
            <AdminPage />
          </PrivateApp>
        }
      />
    </Routes>
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
          notes={['Private member app surface', 'Login required']}
          stats={[
            { value: String(upcomingEvents.length).padStart(2, '0'), label: 'Upcoming events' },
            { value: String(people.length).padStart(2, '0'), label: 'Member-visible people' },
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
      <Panel title="Directory" eyebrow="Member-Visible Rows">
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
        copy="People rows must be published and consented for member directory display. This is context, not a social feed."
        stats={[
          { value: String(people.length).padStart(2, '0'), label: 'Member-visible people' },
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
          { value: String(companies.length).padStart(2, '0'), label: 'Member companies' },
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
    setStatus('If this email has approved access, a login link has been sent.');

    try {
      await sendMagicLink(email, `${window.location.origin}/auth/callback`);
    } catch {
      setStatus('If this email has approved access, a login link has been sent.');
    }
  }

  return (
    <AuthEntryShell
      eyebrow="Private community"
      title="Member login"
      subtitle="You will receive a login link to your email."
      secondary={
        <>
          <p>Need access?</p>
          <ButtonLink href="/register" tone="neutral">
            Apply for access
          </ButtonLink>
        </>
      }
      footer="Access is approval-based. Login never creates a new account."
    >
      <form onSubmit={handleSubmit}>
        <FieldGrid>
          <Field label="Email address">
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
          <Button type="submit">Send login link</Button>
          {status ? <Notice>{status}</Notice> : null}
        </FieldGrid>
      </form>
    </AuthEntryShell>
  );
}

function LoginCallbackPage() {
  const { loading, session } = useCurrentSession();

  if (loading) {
    return (
      <AuthEntryShell
        eyebrow="Private community"
        title="Completing login"
        subtitle="Checking Freddy Founders access..."
      >
        <Notice>Hold tight while we verify this login link.</Notice>
      </AuthEntryShell>
    );
  }

  return <Navigate to={session?.role === 'admin' ? '/admin' : '/events'} replace />;
}

function RegisterPage() {
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setStatus('Submitting application...');

    try {
      await createRegistrationRequest({
        name: String(form.get('name') ?? ''),
        email: String(form.get('email') ?? ''),
        companyName: String(form.get('company-name') ?? ''),
        companyWebsiteUrl: String(form.get('company-website-url') ?? ''),
        atlanticCanadaTie: String(form.get('atlantic-canada-tie') ?? ''),
        role: '',
        founderContext: '',
        topics: [],
        publicDirectoryConsent: form.get('public-directory-consent') === 'on',
        isCompanyFounder: form.get('is-company-founder') === 'on',
      });
      formElement.reset();
      setStatus('Application received. Admins will review it.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not submit application.');
    }
  }

  return (
    <AuthEntryShell
      eyebrow="Request access"
      title="Apply for access"
      subtitle="Freddy Founders is a private community for Atlantic Canadian founders."
      secondary={
        <>
          <p>Already approved?</p>
          <ButtonLink href="/login" tone="neutral">
            Return to login
          </ButtonLink>
        </>
      }
      footer="Submitting an application does not create login access."
    >
      <form onSubmit={handleSubmit}>
        <FieldGrid>
          <Field label="Name">
            <TextInput name="name" autoComplete="name" placeholder="Full name" required />
          </Field>
          <Field label="Email address">
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
          <Field label="Atlantic Canada tie">
            <TextArea
              name="atlantic-canada-tie"
              rows={3}
              placeholder="Where are you based, or what is your Atlantic Canada community tie?"
              required
            />
          </Field>
          <Field label="Founder affirmation">
            <TextInput type="checkbox" name="is-company-founder" required />
          </Field>
          <details>
            <summary>Optional visibility</summary>
            <FieldGrid>
              <Field label="Public directory consent">
                <TextInput type="checkbox" name="public-directory-consent" />
              </Field>
            </FieldGrid>
          </details>
          <Button type="submit">Submit application</Button>
          {status ? <Notice>{status}</Notice> : null}
        </FieldGrid>
      </form>
    </AuthEntryShell>
  );
}

function AdminPage() {
  const session = useAsyncValue(getCurrentSession, []);
  const role = session?.role ?? null;
  const [refreshKey, setRefreshKey] = useState(0);
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const requests = useAsyncList<RegistrationRequest>(
    () => listPendingRegistrationRequests(role),
    [role, refreshKey],
  );
  const profiles = useAsyncList<ProfileAccount>(() => listProfiles(role), [role, refreshKey]);

  async function handleSetProfileRole(profile: ProfileAccount, nextRole: ProfileAccount['role']) {
    await setProfileRole(role, {
      targetProfileId: profile.id,
      role: nextRole,
    });
    setRefreshKey((value) => value + 1);
  }

  async function handleApproveRequest(request: RegistrationRequest) {
    setActionStatus(`Approving ${request.email}...`);
    try {
      await approveRegistrationRequest(request.id);
      setActionStatus(`Approved ${request.email}. They can now request a login link.`);
      setRefreshKey((value) => value + 1);
    } catch (error) {
      setActionStatus(error instanceof Error ? error.message : 'Could not approve application.');
    }
  }

  async function handleArchiveRequest(request: RegistrationRequest) {
    setActionStatus(`Archiving ${request.email}...`);
    try {
      await archiveRegistrationRequest(request.id);
      setActionStatus(`Archived ${request.email}.`);
      setRefreshKey((value) => value + 1);
    } catch (error) {
      setActionStatus(error instanceof Error ? error.message : 'Could not archive application.');
    }
  }

  async function handleDeactivateProfile(profile: ProfileAccount) {
    setActionStatus(`Deactivating ${profile.email}...`);
    try {
      await deactivateProfile(profile.id);
      setActionStatus(`Deactivated ${profile.email}.`);
      setRefreshKey((value) => value + 1);
    } catch (error) {
      setActionStatus(error instanceof Error ? error.message : 'Could not deactivate profile.');
    }
  }

  if (role !== 'admin') {
    return (
      <PageShell>
        <Panel title="Admin Maintenance" eyebrow="Admin Only">
          <Notice>Admin access required. Sign in with an admin account to continue.</Notice>
        </Panel>
        <Rail
          title="Access boundary"
          copy="Organizers can help operate the community, but the admin page and admin creation are admin-only."
          stats={[{ value: role ?? 'NONE', label: 'Session role' }]}
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Panel title="Admin Maintenance" eyebrow="Admin Only">
        {session ? (
          <Notice>
            Signed in as {session.email} / {session.role}
          </Notice>
        ) : null}
        {actionStatus ? <Notice>{actionStatus}</Notice> : null}
        <RowList>
          {requests.map((request) => (
            <Row
              key={request.id}
              title={request.name}
              meta={`${request.status} / ${request.companyDomain} / founder: ${
                request.isCompanyFounder ? 'yes' : 'no'
              }`}
              actions={
                <>
                  <Button type="button" onClick={() => handleApproveRequest(request)}>
                    Approve
                  </Button>
                  <Button
                    type="button"
                    tone="neutral"
                    onClick={() => handleArchiveRequest(request)}
                  >
                    Archive
                  </Button>
                </>
              }
            >
              {request.atlanticCanadaTie}
            </Row>
          ))}
        </RowList>
      </Panel>
      <Panel title="People + Roles" eyebrow="Admin Governance">
        <RowList>
          {profiles.map((profile) => (
            <Row
              key={profile.id}
              title={profile.name}
              meta={`${profile.email} / ${profile.role} / ${profile.accessStatus}${profile.isOwner ? ' / owner' : ''}`}
              actions={
                <>
                  {profile.role !== 'organizer' ? (
                    <Button
                      type="button"
                      tone="neutral"
                      onClick={() => handleSetProfileRole(profile, 'organizer')}
                    >
                      Make organizer
                    </Button>
                  ) : null}
                  {profile.role !== 'admin' ? (
                    <Button type="button" onClick={() => handleSetProfileRole(profile, 'admin')}>
                      Make admin
                    </Button>
                  ) : null}
                  {!profile.isOwner && profile.role !== 'member' ? (
                    <Button
                      type="button"
                      tone="neutral"
                      onClick={() => handleSetProfileRole(profile, 'member')}
                    >
                      Demote to member
                    </Button>
                  ) : null}
                  {!profile.isOwner && profile.accessStatus === 'active' ? (
                    <Button
                      type="button"
                      tone="neutral"
                      onClick={() => handleDeactivateProfile(profile)}
                    >
                      Deactivate
                    </Button>
                  ) : null}
                </>
              }
            >
              {profile.isOwner
                ? 'Site owner. Owner is a singleton capability on top of admin.'
                : 'Cumulative role: member < organizer < admin.'}
            </Row>
          ))}
        </RowList>
      </Panel>
      <Rail
        title="Maintenance only"
        copy="Admin is the only role that can create admins. Organizers can promote members to organizers through the backend role boundary, not this admin-only page."
        stats={[
          { value: String(requests.length).padStart(2, '0'), label: 'Pending' },
          { value: String(profiles.length).padStart(2, '0'), label: 'Profiles' },
        ]}
      />
    </PageShell>
  );
}

export function AppRouter() {
  return <Shell />;
}
