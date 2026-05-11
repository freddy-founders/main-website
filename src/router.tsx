import {
  type DependencyList,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useState,
} from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import {
  approveRegistrationRequest,
  archiveRegistrationRequest,
  getGoogleAiIntegrationStatus,
  deactivateProfile,
  listPendingRegistrationRequests,
  listProfiles,
  removeGoogleAiApiKey,
  resetProfilePassword,
  saveGoogleAiApiKey,
  setProfileRole,
} from './application/admin';
import { completePasswordReset, getCurrentSession, signInWithPassword } from './application/auth';
import { listPublicCompanies } from './application/companies';
import { listPublicEvents } from './application/events';
import { listPublicPeople } from './application/people';
import { createRegistrationRequest } from './application/registrationRequests';
import {
  AuthEntryShell,
  Autocomplete,
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
  TextInput,
  Topbar,
} from './design';
import type { ProfileAccount, RegistrationRequest } from './domain/accounts';
import type { CompanySummary } from './domain/companies';
import type { EventRegistrationAction, EventSummary } from './domain/events';
import type { PersonSummary } from './domain/people';
import { filterAtlanticTownCities, isCanonicalAtlanticTownCity } from './domain/atlanticTownCities';
import {
  loginPageContract,
  passwordResetPageContract,
  registerPageContract,
} from './domain/authPages';
import {
  buildGoogleAiIntegrationStatusCopy,
  defaultGoogleAiModel,
  googleAiIntegrationContract,
  type GoogleAiIntegrationStatus,
} from './domain/googleAiIntegration';
import { userActions } from './domain/userActions';

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

  if (session.passwordResetRequired) {
    return <Navigate to="/reset-password" replace />;
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
      <Route path="/reset-password" element={<PasswordResetPage />} />
      <Route path="/auth/callback" element={<LoginCallbackPage />} />
      <Route
        path="/admin"
        element={
          <PrivateApp>
            <AdminPage />
          </PrivateApp>
        }
      />
      <Route
        path="/admin/integrations"
        element={
          <PrivateApp>
            <AdminIntegrationsPage />
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
          <ButtonLink
            href={event.registrationAction.url}
            data-user-action={userActions.registerExternalEvent}
          >
            {event.registrationAction.label}
          </ButtonLink>
        ) : event.registrationAction.kind === 'future-internal' ? (
          <Notice>Internal RSVP is not available yet.</Notice>
        ) : (
          <Notice>{event.registrationAction.label}</Notice>
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

function destinationForSession(session: Awaited<ReturnType<typeof getCurrentSession>>): string {
  if (!session) return '/login';
  if (session.passwordResetRequired) return '/reset-password';
  return session.role === 'admin' ? '/admin' : '/events';
}

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('Checking credentials...');

    try {
      const result = await signInWithPassword(email, password);

      if (result === 'authenticated') {
        const session = await getCurrentSession();
        navigate(destinationForSession(session), { replace: true });
        return;
      }

      setStatus(loginPageContract.invalidCredentialsNotice);
    } catch {
      setStatus(loginPageContract.invalidCredentialsNotice);
    }
  }

  return (
    <AuthEntryShell
      eyebrow={loginPageContract.eyebrow}
      title={loginPageContract.title}
      subtitle={loginPageContract.subtitle}
      secondary={
        <>
          <p>{loginPageContract.secondaryPrompt}</p>
          <ButtonLink
            href="/register"
            tone="neutral"
            data-user-action={userActions.navigateRegister}
          >
            {loginPageContract.secondaryLinkLabel}
          </ButtonLink>
        </>
      }
      footer={loginPageContract.footer}
    >
      <form onSubmit={handleSubmit} data-user-action={userActions.submitLogin}>
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
          <Field label={loginPageContract.passwordLabel}>
            <TextInput
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
            />
          </Field>
          <Button type="submit" data-user-action={userActions.submitLogin}>
            {loginPageContract.primaryActionLabel}
          </Button>
          {status ? <Notice>{status}</Notice> : null}
        </FieldGrid>
      </form>
    </AuthEntryShell>
  );
}

function PasswordResetPage() {
  const { loading, session } = useCurrentSession();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 8) {
      setStatus(passwordResetPageContract.minimumLengthNotice);
      return;
    }

    if (password !== confirmation) {
      setStatus(passwordResetPageContract.mismatchNotice);
      return;
    }

    try {
      await completePasswordReset(password);
      setStatus(passwordResetPageContract.successNotice);
      const nextSession = await getCurrentSession();
      navigate(destinationForSession(nextSession), { replace: true });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not update password.');
    }
  }

  if (loading) {
    return (
      <AuthEntryShell
        eyebrow={passwordResetPageContract.eyebrow}
        title={passwordResetPageContract.title}
        subtitle="Checking account state..."
      >
        <Notice>Checking Freddy Founders access...</Notice>
      </AuthEntryShell>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!session.passwordResetRequired) {
    return <Navigate to={destinationForSession(session)} replace />;
  }

  return (
    <AuthEntryShell
      eyebrow={passwordResetPageContract.eyebrow}
      title={passwordResetPageContract.title}
      subtitle={passwordResetPageContract.subtitle}
      footer="Choose a permanent password before entering the private app."
    >
      <form onSubmit={handleSubmit} data-user-action={userActions.completePasswordReset}>
        <FieldGrid>
          <Field label={passwordResetPageContract.passwordLabel}>
            <TextInput
              type="password"
              name="new-password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
            />
          </Field>
          <Field label={passwordResetPageContract.confirmPasswordLabel}>
            <TextInput
              type="password"
              name="confirm-new-password"
              autoComplete="new-password"
              required
              value={confirmation}
              onChange={(event) => setConfirmation(event.currentTarget.value)}
            />
          </Field>
          <Button type="submit" data-user-action={userActions.completePasswordReset}>
            {passwordResetPageContract.primaryActionLabel}
          </Button>
          {status ? <Notice>{status}</Notice> : null}
        </FieldGrid>
      </form>
    </AuthEntryShell>
  );
}

function LoginCallbackPage() {
  return <Navigate to="/login" replace />;
}

function RegisterPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [townCityInput, setTownCityInput] = useState('');
  const [isTownCityDropdownOpen, setTownCityDropdownOpen] = useState(false);
  const townCityOptions = shouldOpenTownCityDropdown(townCityInput)
    ? filterAtlanticTownCities(townCityInput).map((value) => ({ value }))
    : [];
  const isTownCityAutocompleteOpen =
    isTownCityDropdownOpen && shouldOpenTownCityDropdown(townCityInput);

  function selectedTownCityValue(value: string): string | null {
    const trimmedValue = value.trim();
    return isCanonicalAtlanticTownCity(trimmedValue) ? trimmedValue : null;
  }

  function shouldOpenTownCityDropdown(value: string): boolean {
    return value.trim().length > 0 && selectedTownCityValue(value) === null;
  }

  function updateTownCitySearch(value: string) {
    setTownCityInput(value);
    setTownCityDropdownOpen(shouldOpenTownCityDropdown(value));
  }

  function selectTownCity(value: string) {
    setTownCityInput(value);
    setTownCityDropdownOpen(false);
  }

  function handleTownCitySearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setTownCityDropdownOpen(false);
      return;
    }

    if (event.key !== 'Enter') return;

    const currentValue = event.currentTarget.value;
    const selectedValue = selectedTownCityValue(currentValue);
    if (selectedValue) return;

    event.preventDefault();
    const topTownCity = filterAtlanticTownCities(currentValue)[0];
    if (topTownCity) selectTownCity(topTownCity);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const townCitySelection = selectedTownCityValue(String(form.get('town-city') ?? ''));
    if (!townCitySelection) {
      setTownCityDropdownOpen(shouldOpenTownCityDropdown(townCityInput));
      setStatus('Choose a Town/City from the Atlantic Canada list.');
      return;
    }

    setStatus('Submitting application...');

    try {
      await createRegistrationRequest({
        name: String(form.get('name') ?? ''),
        email: String(form.get('email') ?? ''),
        companyWebsiteUrl: String(form.get('company-website-url') ?? ''),
        townCity: townCitySelection,
        isCompanyFounder: form.get('is-company-founder') === 'on',
      });
      formElement.reset();
      setTownCityInput('');
      setTownCityDropdownOpen(false);
      setStatus(registerPageContract.successNotice);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not submit application.');
    }
  }

  return (
    <AuthEntryShell
      eyebrow={registerPageContract.eyebrow}
      title={registerPageContract.title}
      subtitle={registerPageContract.subtitle}
      secondary={
        <>
          <p>{registerPageContract.secondaryPrompt}</p>
          <ButtonLink href="/login" tone="neutral" data-user-action={userActions.navigateLogin}>
            {registerPageContract.secondaryLinkLabel}
          </ButtonLink>
        </>
      }
      footer={registerPageContract.footer}
    >
      <form onSubmit={handleSubmit} data-user-action={userActions.submitApplication}>
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
          <Field label="Company website">
            <TextInput
              type="text"
              inputMode="url"
              name="company-website-url"
              placeholder="agentmaple.com"
              autoComplete="url"
              required
            />
          </Field>
          <Field label={registerPageContract.townCityLabel}>
            <Autocomplete
              emptyLabel="No matching Atlantic municipalities."
              listboxId="atlantic-town-city-options"
              listLabel="Available Atlantic municipalities"
              onSelect={selectTownCity}
              open={isTownCityAutocompleteOpen}
              options={townCityOptions}
            >
              <TextInput
                name="town-city"
                aria-autocomplete="list"
                aria-controls="atlantic-town-city-options"
                aria-expanded={isTownCityAutocompleteOpen}
                aria-haspopup="listbox"
                autoComplete="off"
                placeholder="Search municipality"
                role="combobox"
                value={townCityInput}
                onBlur={() => setTownCityDropdownOpen(false)}
                onChange={(event) => updateTownCitySearch(event.target.value)}
                onFocus={(event) =>
                  setTownCityDropdownOpen(shouldOpenTownCityDropdown(event.target.value))
                }
                onKeyDown={handleTownCitySearchKeyDown}
                required
              />
            </Autocomplete>
          </Field>
          <Field label={registerPageContract.founderAffirmationLabel}>
            <TextInput type="checkbox" name="is-company-founder" required />
          </Field>
          <Button type="submit" data-user-action={userActions.submitApplication}>
            {registerPageContract.primaryActionLabel}
          </Button>
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
      const result = await approveRegistrationRequest(request.id);
      setActionStatus(`Approved ${request.email}. Temporary password: ${result.temporaryPassword}`);
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

  async function handleResetProfilePassword(profile: ProfileAccount) {
    setActionStatus(`Issuing temporary password for ${profile.email}...`);
    try {
      const result = await resetProfilePassword(profile.id);
      setActionStatus(`Temporary password for ${profile.email}: ${result.temporaryPassword}`);
      setRefreshKey((value) => value + 1);
    } catch (error) {
      setActionStatus(error instanceof Error ? error.message : 'Could not reset password.');
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
        <ButtonLink
          href="/admin/integrations"
          tone="neutral"
          data-user-action={userActions.navigateAdminIntegrations}
        >
          Manage integrations
        </ButtonLink>
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
                  <Button
                    type="button"
                    data-user-action={userActions.approveRegistrationRequest}
                    onClick={() => handleApproveRequest(request)}
                  >
                    Approve
                  </Button>
                  <Button
                    type="button"
                    tone="neutral"
                    data-user-action={userActions.archiveRegistrationRequest}
                    onClick={() => handleArchiveRequest(request)}
                  >
                    Archive
                  </Button>
                </>
              }
            >
              {request.townCity}
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
              meta={`${profile.email} / ${profile.role} / ${profile.accessStatus}${profile.passwordResetRequired ? ' / password reset required' : ''}${profile.isOwner ? ' / owner' : ''}`}
              actions={
                <>
                  {profile.role !== 'organizer' ? (
                    <Button
                      type="button"
                      tone="neutral"
                      data-user-action={userActions.promoteOrganizer}
                      onClick={() => handleSetProfileRole(profile, 'organizer')}
                    >
                      Make organizer
                    </Button>
                  ) : null}
                  {profile.role !== 'admin' ? (
                    <Button
                      type="button"
                      data-user-action={userActions.promoteAdmin}
                      onClick={() => handleSetProfileRole(profile, 'admin')}
                    >
                      Make admin
                    </Button>
                  ) : null}
                  {!profile.isOwner && profile.role !== 'member' ? (
                    <Button
                      type="button"
                      tone="neutral"
                      data-user-action={userActions.demoteMember}
                      onClick={() => handleSetProfileRole(profile, 'member')}
                    >
                      Demote to member
                    </Button>
                  ) : null}
                  {!profile.isOwner && profile.accessStatus === 'active' ? (
                    <Button
                      type="button"
                      tone="neutral"
                      data-user-action={userActions.deactivateProfile}
                      onClick={() => handleDeactivateProfile(profile)}
                    >
                      Deactivate
                    </Button>
                  ) : null}
                  {profile.accessStatus === 'active' ? (
                    <Button
                      type="button"
                      tone="neutral"
                      data-user-action={userActions.resetMemberPassword}
                      onClick={() => handleResetProfilePassword(profile)}
                    >
                      Reset password
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

function AdminIntegrationsPage() {
  const session = useAsyncValue(getCurrentSession, []);
  const role = session?.role ?? null;
  const [refreshKey, setRefreshKey] = useState(0);
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const integrationStatus = useAsyncValue<GoogleAiIntegrationStatus>(getGoogleAiIntegrationStatus, [
    refreshKey,
  ]);

  async function handleSaveApiKey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setActionStatus('Saving Gemini API key...');

    try {
      await saveGoogleAiApiKey({
        apiKey: String(formData.get('gemini-api-key') ?? ''),
        modelId: String(formData.get('gemini-model-id') ?? ''),
      });
      form.reset();
      setActionStatus('Gemini API key saved.');
      setRefreshKey((value) => value + 1);
    } catch (error) {
      setActionStatus(error instanceof Error ? error.message : 'Could not save Gemini API key.');
    }
  }

  async function handleRemoveApiKey() {
    setActionStatus('Removing saved Gemini API key...');

    try {
      await removeGoogleAiApiKey();
      setActionStatus('Saved Gemini API key removed.');
      setRefreshKey((value) => value + 1);
    } catch (error) {
      setActionStatus(error instanceof Error ? error.message : 'Could not remove Gemini API key.');
    }
  }

  if (role !== 'admin') {
    return (
      <PageShell>
        <Panel title={googleAiIntegrationContract.pageTitle} eyebrow="Admin Only">
          <Notice>Admin access required. Sign in with an admin account to continue.</Notice>
        </Panel>
        <Rail
          title="Integration boundary"
          copy="Provider credentials can change application-intake behavior, so integrations are admin-only."
          stats={[{ value: role ?? 'NONE', label: 'Session role' }]}
        />
      </PageShell>
    );
  }

  const statusCopy = integrationStatus
    ? buildGoogleAiIntegrationStatusCopy(integrationStatus)
    : 'Loading Google AI integration status...';

  return (
    <PageShell>
      <Panel
        title={googleAiIntegrationContract.pageTitle}
        eyebrow={googleAiIntegrationContract.pageEyebrow}
      >
        <Notice>{statusCopy}</Notice>
        {actionStatus ? <Notice>{actionStatus}</Notice> : null}
        <FieldList
          items={[
            'Provider / Gemini API key with Google Search grounding',
            `Source / ${integrationStatus?.apiKeySource ?? 'loading'}`,
            `Fingerprint / ${integrationStatus?.keyFingerprint ?? 'Not saved'}`,
            `Model / ${integrationStatus?.modelId ?? defaultGoogleAiModel}`,
            `Missing config / ${
              integrationStatus && integrationStatus.missingConfig.length > 0
                ? integrationStatus.missingConfig.join(', ')
                : 'None'
            }`,
          ]}
        />
      </Panel>
      <Panel title={googleAiIntegrationContract.setupTitle} eyebrow="Admin Managed Secret">
        <p>
          Paste a Gemini API key here to store it encrypted server-side. The key is never rendered
          back to the browser; only its fingerprint is shown after saving.
        </p>
        <form onSubmit={handleSaveApiKey} data-user-action={userActions.saveGoogleAiApiKey}>
          <FieldGrid>
            <Field label={googleAiIntegrationContract.apiKeyLabel}>
              <TextInput
                type="password"
                name="gemini-api-key"
                autoComplete="off"
                placeholder="AIza..."
                required
              />
            </Field>
            <Field label={googleAiIntegrationContract.modelLabel}>
              <TextInput
                name="gemini-model-id"
                placeholder={integrationStatus?.modelId ?? defaultGoogleAiModel}
                defaultValue={integrationStatus?.modelId ?? defaultGoogleAiModel}
                required
              />
            </Field>
            <Button type="submit" data-user-action={userActions.saveGoogleAiApiKey}>
              {googleAiIntegrationContract.saveActionLabel}
            </Button>
          </FieldGrid>
        </form>
      </Panel>
      <Panel title="Remove saved key" eyebrow="Provider Control">
        <p>
          Removing the saved admin-managed key returns intake to deterministic website evidence
          unless a Worker-level GEMINI_API_KEY secret is still configured.
        </p>
        <Button
          type="button"
          tone="neutral"
          data-user-action={userActions.removeGoogleAiApiKey}
          onClick={handleRemoveApiKey}
        >
          {googleAiIntegrationContract.removeActionLabel}
        </Button>
      </Panel>
      <Rail
        title="Credential model"
        copy="Freddy stores the admin-entered Gemini key encrypted in Supabase using a Worker-only encryption secret. The browser can submit or remove the key, but it can never read it back."
        stats={[
          { value: integrationStatus?.connected ? 'YES' : 'NO', label: 'Enabled' },
          { value: integrationStatus?.configured ? 'YES' : 'NO', label: 'Configured' },
        ]}
      />
    </PageShell>
  );
}

export function AppRouter() {
  return <Shell />;
}
