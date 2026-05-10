import assert from 'node:assert/strict';

import { InMemoryAuthAccessRepository } from '../src/adapters/memory/authAccessRepository.ts';
import { createAuthAccessService } from '../src/application/authAccess.ts';
import { userActions, userActionWorkflows } from '../src/domain/userActions.ts';

const workflows = Object.values(userActionWorkflows);
const drivers = {
  'auth-access': createAuthAccessDriver(),
  'admin-governance': createAdminGovernanceDriver(),
};

const results = [];

for (const workflow of workflows) {
  const driver = drivers[workflow.id];

  if (!driver) {
    throw new Error(`No executable model driver is registered for workflow "${workflow.id}".`);
  }

  for (const transition of workflow.transitions) {
    const context = driver.createContext(transition.from, transition.action);
    const initialState = driver.currentState(context);
    assert.equal(
      initialState,
      transition.from,
      `${workflow.id}: expected seed state ${transition.from}, got ${initialState}`,
    );

    driver.applyAction(context, transition.action);
    const actualState = driver.currentState(context);
    assert.equal(
      actualState,
      transition.to,
      `${workflow.id}: ${transition.from} --${transition.action}--> expected ${transition.to}, got ${actualState}`,
    );

    results.push(`${workflow.id}: ${transition.from} --${transition.action}--> ${transition.to}`);
  }

  for (const forbidden of workflow.forbiddenTransitions) {
    const context = driver.createContext(forbidden.state, forbidden.action);
    const initialState = driver.currentState(context);
    assert.equal(
      initialState,
      forbidden.state,
      `${workflow.id}: expected forbidden seed state ${forbidden.state}, got ${initialState}`,
    );

    try {
      driver.applyAction(context, forbidden.action);
    } catch (error) {
      if (!(error instanceof Error)) throw error;
    }

    const actualState = driver.currentState(context);
    assert.equal(
      actualState,
      forbidden.state,
      `${workflow.id}: forbidden ${forbidden.state} --${forbidden.action}--> changed state to ${actualState}; ${forbidden.reason}`,
    );

    results.push(`${workflow.id}: blocked ${forbidden.state} --${forbidden.action}`);
  }
}

console.log(`Executable model tests passed for ${workflows.length} workflows.`);
console.log(`Covered ${results.length} model edges.`);

function createAuthAccessDriver() {
  return {
    createContext(state, action) {
      const repository = new InMemoryAuthAccessRepository();
      const service = createAuthAccessService(repository);
      const email = modelEmail('auth', state, action);
      seedAuthAccessState(service, email, state);
      return { email, service };
    },
    currentState({ email, service }) {
      return authAccessStateFor(service, email);
    },
    applyAction({ email, service }, action) {
      applyAuthAccessAction(service, email, action);
    },
  };
}

function seedAuthAccessState(service, email, state) {
  if (state === 'anonymous') return;

  if (state === 'pending-application') {
    service.createPendingApplication(email);
    return;
  }

  if (state === 'archived-application') {
    service.createArchivedApplication(email);
    return;
  }

  if (state === 'approved-member') {
    service.createAccount(email, 'member', 'active');
    return;
  }

  if (state === 'password-reset-required') {
    const result = service.createAccountRequiringPasswordReset(email);
    const login = service.requestPasswordLogin(email, result.temporaryPassword);
    assert.equal(login.status, 'reset-required');
    return;
  }

  if (state === 'member-session') {
    service.createAccount(email, 'member', 'active');
    assert.equal(service.requestPasswordLogin(email, 'member-password').status, 'authenticated');
    return;
  }

  if (state === 'deactivated-member') {
    service.createAccount(email, 'member', 'deactivated');
    return;
  }

  throw new Error(`Unknown auth-access seed state: ${state}`);
}

function authAccessStateFor(service, email) {
  const account = service.accountFor(email);

  if (account?.status === 'deactivated') return 'deactivated-member';
  if (account?.status === 'active' && account.passwordResetRequired) {
    return 'password-reset-required';
  }
  if (account?.status === 'active' && service.hasSession(email)) return 'member-session';
  if (account?.status === 'active') return 'approved-member';
  const application = service.applicationFor(email);

  if (application?.status === 'pending') return 'pending-application';
  if (application?.status === 'archived') return 'archived-application';
  if (application?.status === 'approved') return 'approved-member';

  return 'anonymous';
}

function applyAuthAccessAction(service, email, action) {
  if (action === userActions.submitApplication) {
    service.submitFounderApplicationAfterWebsiteValidation(
      service.completeFounderApplication(email),
      true,
      true,
    );
    return;
  }

  if (action === userActions.approveRegistrationRequest) {
    service.approveApplication(email);
    return;
  }

  if (action === userActions.archiveRegistrationRequest) {
    service.archiveApplication(email);
    return;
  }

  if (action === userActions.submitLogin) {
    const account = service.accountFor(email);
    const password = account?.passwordResetRequired
      ? (account.temporaryPassword ?? 'missing-temporary-password')
      : 'member-password';
    service.requestPasswordLogin(email, password);
    return;
  }

  if (action === userActions.completePasswordReset) {
    service.completePasswordReset(email, 'new-member-password');
    return;
  }

  if (action === userActions.resetMemberPassword) {
    service.resetMemberPassword(email);
    return;
  }

  if (action === userActions.deactivateProfile) {
    service.deactivateMember(email);
    return;
  }

  throw new Error(`Action ${action} is not executable in auth-access model tests.`);
}

function createAdminGovernanceDriver() {
  return {
    createContext(state, action) {
      const repository = new InMemoryAuthAccessRepository();
      const service = createAuthAccessService(repository);
      const email = modelEmail('admin', state, action);
      seedAdminGovernanceState(service, email, state);
      return { email, service };
    },
    currentState({ email, service }) {
      return adminGovernanceStateFor(service, email);
    },
    applyAction({ email, service }, action) {
      applyAdminGovernanceAction(service, email, action);
    },
  };
}

function seedAdminGovernanceState(service, email, state) {
  if (state === 'member') {
    service.createAccount(email, 'member', 'active');
    return;
  }

  if (state === 'organizer') {
    service.createAccount(email, 'organizer', 'active');
    return;
  }

  if (state === 'admin') {
    service.createAccount(email, 'admin', 'active');
    return;
  }

  if (state === 'owner-admin') {
    service.createOwnerAdmin(email);
    return;
  }

  if (state === 'deactivated') {
    service.createAccount(email, 'member', 'deactivated');
    return;
  }

  throw new Error(`Unknown admin-governance seed state: ${state}`);
}

function adminGovernanceStateFor(service, email) {
  const account = service.accountFor(email);

  if (!account) throw new Error(`Missing account for ${email}`);
  if (account.status === 'deactivated') return 'deactivated';
  if (account.isOwner && account.role === 'admin') return 'owner-admin';

  return account.role;
}

function applyAdminGovernanceAction(service, email, action) {
  if (action === userActions.promoteOrganizer) {
    service.attemptSelfDemotion(email, 'organizer');
    return;
  }

  if (action === userActions.promoteAdmin) {
    service.attemptSelfDemotion(email, 'admin');
    return;
  }

  if (action === userActions.demoteMember) {
    service.attemptSelfDemotion(email, 'member');
    return;
  }

  if (action === userActions.deactivateProfile) {
    service.deactivateMember(email);
    return;
  }

  throw new Error(`Action ${action} is not executable in admin-governance model tests.`);
}

function modelEmail(prefix, state, action) {
  return `${prefix}-${slug(state)}-${slug(action)}@model.test`;
}

function slug(value) {
  return value.replace(/[^a-z0-9]+/g, '-');
}
