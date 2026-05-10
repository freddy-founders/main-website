import {
  accountCanOpenRoute,
  canAttemptPasswordLogin,
  canCompletePasswordReset,
  missingFounderApplicationField,
  normalizeAuthEmail,
  passwordLoginCanAuthenticate,
  parseAuthRole,
  productionLoginUrl,
  roleCanPerformAction,
  routeBoundaryForAnonymous,
  type AccessDecision,
  type AccessStateReview,
  type ApplicationAttemptResult,
  type AuthAccountRecord,
  type AuthApplicationRecord,
  type AuthAuditEntry,
  type FounderAccessApplicationInput,
  type PasswordLoginRequestResult,
  type TemporaryPasswordIssueResult,
} from '../domain/authAccess';
import type { AccountRole } from '../domain/accounts';
import type { AuthAccessRepository } from '../ports/authAccess';

const defaultActor = 'admin@example.com';
const defaultMemberPassword = 'member-password';

function nowIso(): string {
  return new Date().toISOString();
}

function latestByCreatedAt<T extends { createdAt?: string }>(records: T[]): T | null {
  return records.at(-1) ?? null;
}

function completeFounderApplication(email: string): FounderAccessApplicationInput {
  return {
    name: 'Founder Applicant',
    email,
    companyWebsiteUrl: 'https://applicant.example',
    townCity: 'Fredericton, NB',
    founderAffirmed: true,
  };
}

export function createAuthAccessService(repository: AuthAccessRepository) {
  function addAuditEntry(action: string, target: string, actor = defaultActor): AuthAuditEntry {
    const entry = {
      actor: normalizeAuthEmail(actor),
      target: normalizeAuthEmail(target),
      action,
      timestamp: nowIso(),
    } satisfies AuthAuditEntry;
    repository.addAuditEntry(entry);
    return entry;
  }

  function applicationsFor(email: string): AuthApplicationRecord[] {
    const normalizedEmail = normalizeAuthEmail(email);
    return repository
      .listApplications()
      .filter((application) => application.email === normalizedEmail);
  }

  function pendingApplicationsFor(email: string): AuthApplicationRecord[] {
    return applicationsFor(email).filter((application) => application.status === 'pending');
  }

  function latestApplicationFor(email: string): AuthApplicationRecord | null {
    return latestByCreatedAt(applicationsFor(email));
  }

  function requirePendingApplication(email: string): AuthApplicationRecord {
    const application = pendingApplicationsFor(email).at(-1);

    if (!application) {
      throw new Error(`Pending application not found for ${email}`);
    }

    return application;
  }

  function upsertAccount(
    email: string,
    role: AccountRole,
    status: AuthAccountRecord['status'] = 'active',
    options: Partial<
      Pick<
        AuthAccountRecord,
        'isOwner' | 'fromApplication' | 'password' | 'temporaryPassword' | 'passwordResetRequired'
      >
    > = {},
  ): AuthAccountRecord {
    const existing = repository.getAccount(email);
    const account = {
      email: normalizeAuthEmail(email),
      role,
      status,
      isOwner: options.isOwner ?? existing?.isOwner ?? false,
      fromApplication: options.fromApplication ?? existing?.fromApplication ?? false,
      password: options.password ?? existing?.password ?? defaultMemberPassword,
      temporaryPassword: options.temporaryPassword ?? existing?.temporaryPassword ?? null,
      passwordResetRequired:
        options.passwordResetRequired ?? existing?.passwordResetRequired ?? false,
      createdAt: existing?.createdAt ?? nowIso(),
    } satisfies AuthAccountRecord;
    repository.upsertAccount(account);
    return account;
  }

  function issueTemporaryPassword(email: string, kind: 'approval' | 'password-reset') {
    const account = repository.getAccount(email);
    if (!account || account.status !== 'active') {
      throw new Error(`Active account not found for ${email}`);
    }

    const temporaryPassword = repository.nextTemporaryPassword();
    repository.upsertAccount({
      ...account,
      temporaryPassword,
      passwordResetRequired: true,
    });
    repository.addNotice({
      email: normalizeAuthEmail(email),
      kind,
      loginUrl: productionLoginUrl,
      includesTemporaryPassword: true,
      sentAt: nowIso(),
    });
    addAuditEntry(
      kind === 'approval' ? 'temporary password issued' : 'password reset issued',
      email,
    );

    return {
      email: normalizeAuthEmail(email),
      temporaryPassword,
    } satisfies TemporaryPasswordIssueResult;
  }

  return {
    reset() {
      repository.reset();
    },

    completeFounderApplication,

    openAnonymous(route: string) {
      return routeBoundaryForAnonymous(route);
    },

    submitFounderApplication(input: FounderAccessApplicationInput): ApplicationAttemptResult {
      const normalizedEmail = normalizeAuthEmail(input.email);
      const existingAccount = repository.getAccount(normalizedEmail);
      const missingField = missingFounderApplicationField(input);
      let blockedReason: ApplicationAttemptResult['blockedReason'] = null;

      if (missingField) {
        blockedReason = 'missing-field';
      } else if (!input.founderAffirmed) {
        blockedReason = 'founder-affirmation-required';
      } else if (existingAccount?.status === 'deactivated') {
        blockedReason = 'deactivated-former-member';
      } else if (existingAccount?.status === 'active') {
        blockedReason = 'already-approved';
      } else if (pendingApplicationsFor(normalizedEmail).length > 0) {
        blockedReason = 'duplicate-pending';
      }

      if (blockedReason) {
        return {
          email: normalizedEmail,
          accepted: false,
          blockedReason,
        };
      }

      repository.addApplication({
        ...input,
        id: repository.nextApplicationId(),
        email: normalizedEmail,
        name: input.name.trim(),
        companyWebsiteUrl: input.companyWebsiteUrl.trim(),
        townCity: input.townCity.trim(),
        publicDirectoryConsent: false,
        status: 'pending',
        createdAt: nowIso(),
      });

      return {
        email: normalizedEmail,
        accepted: true,
        blockedReason: null,
      };
    },

    submitFounderApplicationAfterWebsiteValidation(
      input: FounderAccessApplicationInput,
      scrapeSucceeded: boolean,
      businessValidated: boolean,
    ): ApplicationAttemptResult {
      if (!scrapeSucceeded) {
        return {
          email: normalizeAuthEmail(input.email),
          accepted: false,
          blockedReason: 'website-scrape-failed',
        };
      }

      if (!businessValidated) {
        return {
          email: normalizeAuthEmail(input.email),
          accepted: false,
          blockedReason: 'business-validation-failed',
        };
      }

      return this.submitFounderApplication(input);
    },

    createPendingApplication(email: string) {
      return this.submitFounderApplication(completeFounderApplication(email));
    },

    createArchivedApplication(email: string) {
      const input = completeFounderApplication(email);
      repository.addApplication({
        ...input,
        id: repository.nextApplicationId(),
        email: normalizeAuthEmail(email),
        publicDirectoryConsent: false,
        status: 'archived',
        createdAt: nowIso(),
      });
    },

    createAccount(
      email: string,
      role: AccountRole,
      status: AuthAccountRecord['status'] = 'active',
    ) {
      return upsertAccount(email, role, status, {
        fromApplication: true,
        password: defaultMemberPassword,
        passwordResetRequired: false,
        temporaryPassword: null,
      });
    },

    createAccountRequiringPasswordReset(email: string, role: AccountRole = 'member') {
      const account = upsertAccount(email, role, 'active', {
        fromApplication: true,
        password: defaultMemberPassword,
        passwordResetRequired: false,
        temporaryPassword: null,
      });
      const result = issueTemporaryPassword(account.email, 'password-reset');
      return { account: repository.getAccount(email), ...result };
    },

    createOwnerAdmin(email: string) {
      return upsertAccount(email, 'admin', 'active', {
        isOwner: true,
        password: defaultMemberPassword,
      });
    },

    applicationFor(email: string) {
      return latestApplicationFor(email);
    },

    applicationsFor,

    activePendingApplicationCount(email: string): number {
      return pendingApplicationsFor(email).length;
    },

    accountFor(email: string) {
      return repository.getAccount(email);
    },

    hasSession(email: string): boolean {
      return repository.hasSession(email);
    },

    canAttemptPasswordLogin(email: string): boolean {
      return canAttemptPasswordLogin(repository.getAccount(email));
    },

    approveApplication(email: string) {
      const application = requirePendingApplication(email);
      repository.updateApplication({ ...application, status: 'approved' });
      upsertAccount(email, 'member', 'active', {
        fromApplication: true,
        password: defaultMemberPassword,
        passwordResetRequired: false,
        temporaryPassword: null,
      });
      const temporaryPassword = issueTemporaryPassword(email, 'approval');
      addAuditEntry('approve', email);
      return temporaryPassword;
    },

    archiveApplication(email: string) {
      const application = requirePendingApplication(email);
      repository.updateApplication({ ...application, status: 'archived' });
      addAuditEntry('archive', email);
    },

    noticesFor(email: string) {
      return repository.listNotices(email);
    },

    notificationsFor(email: string) {
      return repository.listNotifications(email);
    },

    requestPasswordLogin(email: string, password: string): PasswordLoginRequestResult {
      const normalizedEmail = normalizeAuthEmail(email);
      const accountExistedBefore = Boolean(repository.getAccount(normalizedEmail));
      const account = repository.getAccount(normalizedEmail);

      if (!canAttemptPasswordLogin(account)) {
        return {
          email: normalizedEmail,
          authenticated: false,
          accountCreated: !accountExistedBefore && Boolean(repository.getAccount(normalizedEmail)),
          status: 'missing-account',
        };
      }

      const loginResult = passwordLoginCanAuthenticate(account, password);
      if (loginResult === 'rejected') {
        return {
          email: normalizedEmail,
          authenticated: false,
          accountCreated: false,
          status: 'invalid-credentials',
        };
      }

      repository.createSession(normalizedEmail);
      addAuditEntry('password login', normalizedEmail);

      return {
        email: normalizedEmail,
        authenticated: true,
        accountCreated: false,
        status: loginResult === 'reset-required' ? 'reset-required' : 'authenticated',
      };
    },

    resetMemberPassword(email: string) {
      return issueTemporaryPassword(email, 'password-reset');
    },

    completePasswordReset(email: string, newPassword: string): boolean {
      const normalizedEmail = normalizeAuthEmail(email);
      const account = repository.getAccount(normalizedEmail);

      if (
        !account ||
        !repository.hasSession(normalizedEmail) ||
        !canCompletePasswordReset(account)
      ) {
        return false;
      }

      repository.upsertAccount({
        ...account,
        password: newPassword,
        temporaryPassword: null,
        passwordResetRequired: false,
      });
      addAuditEntry('password reset complete', normalizedEmail, normalizedEmail);
      return true;
    },

    openRoute(email: string, route: string): AccessDecision {
      return accountCanOpenRoute(repository.getAccount(email), route);
    },

    roleCanPerformAction(role: string, action: string): boolean {
      return roleCanPerformAction(parseAuthRole(role), action);
    },

    attemptSelfDemotion(email: string, targetRole: string): boolean {
      const account = repository.getAccount(email);
      const nextRole = parseAuthRole(targetRole);

      if (!account) {
        return false;
      }

      if (account.isOwner && nextRole !== 'admin') {
        return false;
      }

      repository.upsertAccount({ ...account, role: nextRole });
      addAuditEntry('role change', email, email);
      return true;
    },

    transferOwnership(currentOwnerEmail: string, nextOwnerEmail: string) {
      const currentOwner = repository.getAccount(currentOwnerEmail);
      const nextOwner = repository.getAccount(nextOwnerEmail);

      if (!currentOwner?.isOwner) {
        throw new Error('Only the current owner can transfer ownership.');
      }

      if (!nextOwner) {
        throw new Error('Target owner account not found.');
      }

      repository.upsertAccount({ ...currentOwner, role: 'admin', isOwner: false });
      repository.upsertAccount({ ...nextOwner, role: 'admin', status: 'active', isOwner: true });
      addAuditEntry('ownership transfer', nextOwnerEmail, currentOwnerEmail);
    },

    deactivateMember(email: string) {
      const account = repository.getAccount(email);

      if (!account) {
        throw new Error(`Account not found for ${email}`);
      }

      if (account.isOwner) {
        throw new Error('The singleton owner cannot be deactivated.');
      }

      repository.upsertAccount({ ...account, status: 'deactivated' });
      addAuditEntry('deactivate', email);
    },

    reviewAccessState(): AccessStateReview {
      const applications = repository.listApplications();
      const accounts = repository.listAccounts();

      return {
        pendingApplications: applications.filter((application) => application.status === 'pending'),
        approvedMembers: accounts.filter((account) => account.status === 'active'),
        roles: accounts.map((account) => ({ email: account.email, role: account.role })),
        applicationHistory: applications,
      };
    },

    clearAuditLog() {
      const applications = repository.listApplications();
      const accounts = repository.listAccounts();
      repository.reset();
      for (const application of applications) repository.addApplication(application);
      for (const account of accounts) repository.upsertAccount(account);
    },

    performAuditAction(action: string, email: string) {
      if (action === 'approve') {
        this.createPendingApplication(email);
        this.approveApplication(email);
        return;
      }

      if (action === 'archive') {
        this.createPendingApplication(email);
        this.archiveApplication(email);
        return;
      }

      if (action === 'role change') {
        upsertAccount(email, 'member', 'active');
        upsertAccount(email, 'organizer', 'active');
        addAuditEntry(action, email);
        return;
      }

      if (action === 'password login') {
        upsertAccount(email, 'member', 'active', { password: defaultMemberPassword });
        this.requestPasswordLogin(email, defaultMemberPassword);
        return;
      }

      if (action === 'password reset issued') {
        upsertAccount(email, 'member', 'active', { password: defaultMemberPassword });
        this.resetMemberPassword(email);
        return;
      }

      throw new Error(`Unknown audit action: ${action}`);
    },

    auditEntries() {
      return repository.listAuditEntries();
    },
  };
}

export type AuthAccessService = ReturnType<typeof createAuthAccessService>;
