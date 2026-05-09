import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import { InMemoryAuthAccessRepository } from '../../src/adapters/memory/authAccessRepository';
import { createAuthAccessService, type AuthAccessService } from '../../src/application/authAccess';
import { normalizeAuthEmail, type AccessStateReview } from '../../src/domain/authAccess';
import type { FreddyWorld } from '../support/world';

type AuthScenarioState = {
  service: AuthAccessService;
  lastApplicationAttempt: ReturnType<AuthAccessService['submitFounderApplication']> | null;
  lastLoginRequest: ReturnType<AuthAccessService['requestMagicLoginLink']> | null;
  lastAccess: 'granted' | 'denied' | null;
  lastPermission: boolean | null;
  lastMagicLoginResult: 'authenticated' | 'rejected' | null;
  lastReview: AccessStateReview | null;
};

const states = new WeakMap<FreddyWorld, AuthScenarioState>();

function createState(): AuthScenarioState {
  return {
    service: createAuthAccessService(new InMemoryAuthAccessRepository()),
    lastApplicationAttempt: null,
    lastLoginRequest: null,
    lastAccess: null,
    lastPermission: null,
    lastMagicLoginResult: null,
    lastReview: null,
  };
}

function stateFor(world: FreddyWorld): AuthScenarioState {
  let state = states.get(world);

  if (!state) {
    state = createState();
    states.set(world, state);
  }

  return state;
}

function completeApplicationFor(service: AuthAccessService, email: string) {
  return service.completeFounderApplication(email);
}

Given('the Freddy Founders auth state is reset', function (this: FreddyWorld) {
  const state = createState();
  state.service.reset();
  states.set(this, state);
  this.loginRequired = false;
  this.roleChangeAllowed = false;
});

When('an anonymous visitor opens {string}', function (this: FreddyWorld, route: string) {
  const boundary = stateFor(this).service.openAnonymous(route);
  this.loginRequired = boundary.loginRequired;
  stateFor(this).lastAccess = boundary.publicRoute ? 'granted' : 'denied';
});

Then('the route is public', function (this: FreddyWorld) {
  assert.equal(stateFor(this).lastAccess, 'granted');
});

Then('the route renders outside the private app shell', function (this: FreddyWorld) {
  assert.equal(stateFor(this).lastAccess, 'granted');
});

When(
  '{string} submits a complete founder application',
  function (this: FreddyWorld, email: string) {
    const state = stateFor(this);
    state.lastApplicationAttempt = state.service.submitFounderApplication(
      completeApplicationFor(state.service, email),
    );
  },
);

When(
  '{string} submits a complete founder application without public directory consent',
  function (this: FreddyWorld, email: string) {
    const state = stateFor(this);
    state.lastApplicationAttempt = state.service.submitFounderApplication({
      ...completeApplicationFor(state.service, email),
      publicDirectoryConsent: false,
    });
  },
);

When(
  '{string} submits an application missing {string}',
  function (this: FreddyWorld, email: string, field: string) {
    const state = stateFor(this);
    const input = completeApplicationFor(state.service, email);

    if (field === 'name') input.name = '';
    if (field === 'email') input.email = '';
    if (field === 'company name') input.companyName = '';
    if (field === 'company website') input.companyWebsiteUrl = '';
    if (field === 'Atlantic Canada tie') input.atlanticCanadaTie = '';

    state.lastApplicationAttempt = state.service.submitFounderApplication(input);
  },
);

When(
  '{string} submits an application without founder affirmation',
  function (this: FreddyWorld, email: string) {
    const state = stateFor(this);
    state.lastApplicationAttempt = state.service.submitFounderApplication({
      ...completeApplicationFor(state.service, email),
      founderAffirmed: false,
    });
  },
);

Given('a pending application exists for {string}', function (this: FreddyWorld, email: string) {
  const state = stateFor(this);
  const result = state.service.createPendingApplication(email);
  assert.equal(result.accepted, true);
});

Given('an archived application exists for {string}', function (this: FreddyWorld, email: string) {
  stateFor(this).service.createArchivedApplication(email);
});

Given(
  '{string} exists for {string}',
  function (this: FreddyWorld, fixtureState: string, email: string) {
    const service = stateFor(this).service;

    if (fixtureState === 'unknown email') return;
    if (fixtureState === 'pending application') {
      service.createPendingApplication(email);
      return;
    }
    if (fixtureState === 'archived application') {
      service.createArchivedApplication(email);
      return;
    }
    if (fixtureState === 'deactivated member') {
      service.createAccount(email, 'member', 'deactivated');
      return;
    }

    throw new Error(`Unknown auth fixture state: ${fixtureState}`);
  },
);

Given(
  /^an active approved "?([^\"]+)"? account exists for "([^"]+)"$/,
  function (this: FreddyWorld, role: string, email: string) {
    stateFor(this).service.createAccount(
      email,
      role === 'admin' ? 'admin' : role === 'organizer' ? 'organizer' : 'member',
    );
  },
);

Given(
  'a deactivated member account exists for {string}',
  function (this: FreddyWorld, email: string) {
    stateFor(this).service.createAccount(email, 'member', 'deactivated');
  },
);

Given('{string} is the owner admin', function (this: FreddyWorld, email: string) {
  stateFor(this).service.createOwnerAdmin(email);
});

Then('an application for {string} is pending', function (this: FreddyWorld, email: string) {
  assert.equal(stateFor(this).service.applicationFor(email)?.status, 'pending');
});

Then('the application for {string} is approved', function (this: FreddyWorld, email: string) {
  assert.equal(stateFor(this).service.applicationFor(email)?.status, 'approved');
});

Then('the application for {string} is archived', function (this: FreddyWorld, email: string) {
  assert.equal(stateFor(this).service.applicationFor(email)?.status, 'archived');
});

Then(
  'the application for {string} is not in the active pending queue',
  function (this: FreddyWorld, email: string) {
    assert.equal(stateFor(this).service.activePendingApplicationCount(email), 0);
  },
);

Then(
  'the application remains in history for {string}',
  function (this: FreddyWorld, email: string) {
    assert.ok(stateFor(this).service.applicationFor(email));
  },
);

Then(
  'the archived application remains in history for {string}',
  function (this: FreddyWorld, email: string) {
    assert.ok(
      stateFor(this)
        .service.applicationsFor(email)
        .some((application) => application.status === 'archived'),
    );
  },
);

Then('no usable account exists for {string}', function (this: FreddyWorld, email: string) {
  assert.notEqual(stateFor(this).service.accountFor(email)?.status, 'active');
});

Then('no session exists for {string}', function (this: FreddyWorld, email: string) {
  assert.equal(stateFor(this).service.hasSession(email), false);
});

Then(
  '{string} is not eligible for a magic login link',
  function (this: FreddyWorld, email: string) {
    assert.equal(stateFor(this).service.canRequestMagicLink(email), false);
  },
);

Then('the application is rejected before becoming pending', function (this: FreddyWorld) {
  assert.equal(stateFor(this).lastApplicationAttempt?.accepted, false);
});

Then('the application records public directory consent as false', function (this: FreddyWorld) {
  const email = stateFor(this).lastApplicationAttempt?.email;
  assert.ok(email, 'expected an application attempt');
  assert.equal(stateFor(this).service.applicationFor(email)?.publicDirectoryConsent, false);
});

Then(
  'only one active pending application exists for {string}',
  function (this: FreddyWorld, email: string) {
    assert.equal(stateFor(this).service.activePendingApplicationCount(email), 1);
  },
);

Then('the second application is blocked', function (this: FreddyWorld) {
  assert.equal(stateFor(this).lastApplicationAttempt?.blockedReason, 'duplicate-pending');
});

Then(
  'the existing approved account remains active for {string}',
  function (this: FreddyWorld, email: string) {
    assert.equal(stateFor(this).service.accountFor(email)?.status, 'active');
  },
);

Then('the request is flagged as a deactivated former member request', function (this: FreddyWorld) {
  assert.equal(stateFor(this).lastApplicationAttempt?.blockedReason, 'deactivated-former-member');
});

Then(
  'no fresh pending application is created for {string}',
  function (this: FreddyWorld, email: string) {
    assert.equal(stateFor(this).service.activePendingApplicationCount(email), 0);
  },
);

When('an admin approves the application for {string}', function (this: FreddyWorld, email: string) {
  stateFor(this).service.approveApplication(email);
});

When('an admin archives the application for {string}', function (this: FreddyWorld, email: string) {
  stateFor(this).service.archiveApplication(email);
});

Then(
  'the approved member account for {string} is active',
  function (this: FreddyWorld, email: string) {
    const account = stateFor(this).service.accountFor(email);
    assert.equal(account?.status, 'active');
    assert.equal(account?.role, 'member');
  },
);

Then(
  'the account role for {string} is {string}',
  function (this: FreddyWorld, email: string, role: string) {
    assert.equal(stateFor(this).service.accountFor(email)?.role, role);
  },
);

Then('{string} has role {string}', function (this: FreddyWorld, email: string, role: string) {
  assert.equal(stateFor(this).service.accountFor(email)?.role, role);
});

Then('an approval notice is sent to {string}', function (this: FreddyWorld, email: string) {
  assert.ok(
    stateFor(this)
      .service.noticesFor(email)
      .some((notice) => notice.kind === 'approval'),
  );
});

Then(
  'the approval notice contains the normal login URL {string}',
  function (this: FreddyWorld, loginUrl: string) {
    assert.ok(
      stateFor(this)
        .service.noticesFor('')
        .some((notice) => notice.loginUrl === loginUrl),
    );
  },
);

Then('the approval notice does not contain a magic sign-in link', function (this: FreddyWorld) {
  assert.ok(
    stateFor(this)
      .service.noticesFor('')
      .every((notice) => !notice.includesMagicSignInLink),
  );
});

Then('no applicant notification is sent to {string}', function (this: FreddyWorld, email: string) {
  assert.equal(stateFor(this).service.notificationsFor(email).length, 0);
});

When('{string} requests a magic login link', function (this: FreddyWorld, email: string) {
  const state = stateFor(this);
  state.lastLoginRequest = state.service.requestMagicLoginLink(email);
});

Then('a magic login link is sent to {string}', function (this: FreddyWorld, email: string) {
  const state = stateFor(this);
  assert.equal(state.lastLoginRequest?.email, normalizeAuthEmail(email));
  assert.equal(state.lastLoginRequest.sent, true);
  assert.ok(state.service.latestMagicLinkFor(email));
});

Then('no magic login link is sent to {string}', function (this: FreddyWorld, email: string) {
  const state = stateFor(this);
  assert.equal(state.lastLoginRequest?.email, normalizeAuthEmail(email));
  assert.equal(state.lastLoginRequest.sent, false);
  assert.equal(state.service.latestMagicLinkFor(email), null);
});

Then('the login response is generic and safe', function (this: FreddyWorld) {
  assert.equal(stateFor(this).lastLoginRequest?.genericResponse, true);
});

Then(
  'no account is created by the login request for {string}',
  function (this: FreddyWorld, _email: string) {
    assert.equal(stateFor(this).lastLoginRequest?.accountCreated, false);
  },
);

Given('a fresh magic login link exists for {string}', function (this: FreddyWorld, email: string) {
  stateFor(this).service.issueFreshMagicLoginLink(email);
});

When(
  'the magic login link for {string} becomes {string}',
  function (this: FreddyWorld, email: string, linkState: string) {
    if (linkState !== 'expired' && linkState !== 'used') {
      throw new Error(`Unknown magic-link state: ${linkState}`);
    }

    stateFor(this).service.markLatestMagicLink(email, linkState);
  },
);

When('{string} uses that magic login link', function (this: FreddyWorld, email: string) {
  const state = stateFor(this);
  state.lastMagicLoginResult = state.service.useLatestMagicLoginLink(email);
});

When(
  'a second magic login link is issued for {string}',
  function (this: FreddyWorld, email: string) {
    stateFor(this).service.issueSecondMagicLoginLink(email);
  },
);

Then('the magic login attempt is rejected safely', function (this: FreddyWorld) {
  assert.equal(stateFor(this).lastMagicLoginResult, 'rejected');
});

Then(
  'the first magic login link for {string} is rejected safely',
  function (this: FreddyWorld, email: string) {
    assert.equal(stateFor(this).service.useFirstMagicLoginLink(email), 'rejected');
  },
);

Then(
  'the latest magic login link for {string} can authenticate the member',
  function (this: FreddyWorld, email: string) {
    assert.equal(stateFor(this).service.useLatestMagicLoginLink(email), 'authenticated');
  },
);

Then(
  'the magic login link for {string} redirects to {string}',
  function (this: FreddyWorld, email: string, redirectBase: string) {
    assert.ok(
      stateFor(this).service.latestMagicLinkFor(email)?.redirectTo.startsWith(redirectBase),
    );
  },
);

Then(
  'the magic login email for {string} does not contain localhost',
  function (this: FreddyWorld, email: string) {
    const redirectTo = stateFor(this).service.latestMagicLinkFor(email)?.redirectTo ?? '';
    assert.equal(redirectTo.includes('localhost'), false);
    assert.equal(redirectTo.includes('127.0.0.1'), false);
  },
);

When('{string} opens {string}', function (this: FreddyWorld, email: string, route: string) {
  const state = stateFor(this);
  state.lastAccess = state.service.openRoute(email, route);
});

Then('access is granted', function (this: FreddyWorld) {
  assert.equal(stateFor(this).lastAccess, 'granted');
});

Then('access is {string}', function (this: FreddyWorld, expectedAccess: string) {
  assert.equal(stateFor(this).lastAccess, expectedAccess);
});

When(
  /^an? "([^"]+)" attempts to "([^"]+)"$/,
  function (this: FreddyWorld, role: string, action: string) {
    const state = stateFor(this);
    state.lastPermission = state.service.roleCanPerformAction(role, action);
  },
);

Then('permission is {string}', function (this: FreddyWorld, expectedPermission: string) {
  assert.equal(stateFor(this).lastPermission, expectedPermission === 'granted');
});

Then('{string} has all admin permissions', function (this: FreddyWorld, email: string) {
  const state = stateFor(this);
  assert.equal(state.service.accountFor(email)?.role, 'admin');
  for (const action of [
    'approve applications',
    'archive applications',
    'create admins',
    'deactivate members',
  ]) {
    assert.equal(state.service.roleCanPerformAction('admin', action), true);
  }
});

When(
  '{string} attempts to demote themselves to {string}',
  function (this: FreddyWorld, email: string, role: string) {
    this.roleChangeAllowed = stateFor(this).service.attemptSelfDemotion(email, role);
  },
);

Then('{string} remains the owner admin', function (this: FreddyWorld, email: string) {
  const account = stateFor(this).service.accountFor(email);
  assert.equal(account?.isOwner, true);
  assert.equal(account?.role, 'admin');
});

When(
  '{string} transfers ownership to {string}',
  function (this: FreddyWorld, currentOwnerEmail: string, nextOwnerEmail: string) {
    stateFor(this).service.transferOwnership(currentOwnerEmail, nextOwnerEmail);
  },
);

Then('{string} is recorded as the owner admin', function (this: FreddyWorld, email: string) {
  const account = stateFor(this).service.accountFor(email);
  assert.equal(account?.isOwner, true);
  assert.equal(account?.role, 'admin');
});

Then('{string} is not the owner', function (this: FreddyWorld, email: string) {
  assert.equal(stateFor(this).service.accountFor(email)?.isOwner, false);
});

When('an admin deactivates {string}', function (this: FreddyWorld, email: string) {
  stateFor(this).service.deactivateMember(email);
});

Then('{string} is deactivated', function (this: FreddyWorld, email: string) {
  assert.equal(stateFor(this).service.accountFor(email)?.status, 'deactivated');
});

Then('{string} cannot enter private app routes', function (this: FreddyWorld, email: string) {
  const service = stateFor(this).service;
  for (const route of ['/events', '/people', '/companies', '/admin']) {
    assert.equal(service.openRoute(email, route), 'denied');
  }
});

Then(
  'the old magic login link for {string} is rejected safely',
  function (this: FreddyWorld, email: string) {
    assert.equal(stateFor(this).service.useFirstMagicLoginLink(email), 'rejected');
  },
);

Then(
  '{string} appears as deactivated in admin access state',
  function (this: FreddyWorld, email: string) {
    assert.equal(stateFor(this).service.accountFor(email)?.status, 'deactivated');
  },
);

When('an admin reviews the access state', function (this: FreddyWorld) {
  const state = stateFor(this);
  state.lastReview = state.service.reviewAccessState();
});

Then('pending applications are visible', function (this: FreddyWorld) {
  assert.ok((stateFor(this).lastReview?.pendingApplications.length ?? 0) > 0);
});

Then('approved members are visible', function (this: FreddyWorld) {
  assert.ok((stateFor(this).lastReview?.approvedMembers.length ?? 0) > 0);
});

Then('member roles are visible', function (this: FreddyWorld) {
  assert.ok((stateFor(this).lastReview?.roles.length ?? 0) > 0);
});

Then('application history is visible', function (this: FreddyWorld) {
  assert.ok((stateFor(this).lastReview?.applicationHistory.length ?? 0) > 0);
});

Given('the auth audit log is empty', function (this: FreddyWorld) {
  stateFor(this).service.clearAuditLog();
});

When(
  'an admin performs the audit action {string} for {string}',
  function (this: FreddyWorld, action: string, email: string) {
    stateFor(this).service.performAuditAction(action, email);
  },
);

Then(
  'an audit entry exists for {string} on {string}',
  function (this: FreddyWorld, action: string, email: string) {
    assert.ok(
      stateFor(this)
        .service.auditEntries()
        .some((entry) => entry.action === action && entry.target === normalizeAuthEmail(email)),
    );
  },
);

Then('the audit entry includes actor, target, action, and timestamp', function (this: FreddyWorld) {
  const entry = stateFor(this).service.auditEntries().at(-1);
  assert.ok(entry?.actor);
  assert.ok(entry?.target);
  assert.ok(entry?.action);
  assert.ok(entry?.timestamp);
});
