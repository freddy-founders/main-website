import {
  accountCanOpenRoute,
  canRequestMagicLoginLink,
  magicLinkCanAuthenticate,
  missingFounderApplicationField,
  normalizeAuthEmail,
  parseAuthRole,
  productionAuthCallbackUrl,
  productionLoginUrl,
  roleCanPerformAction,
  routeBoundaryForAnonymous,
  type AccessDecision,
  type AccessStateReview,
  type ApplicationAttemptResult,
  type AuthAccountRecord,
  type AuthApplicationRecord,
  type AuthAuditEntry,
  type AuthMagicLinkRecord,
  type FounderAccessApplicationInput,
  type LoginRequestResult,
  type MagicLoginResult,
} from '../domain/authAccess';
import type { AccountRole } from '../domain/accounts';
import type { AuthAccessRepository } from '../ports/authAccess';

const defaultActor = 'admin@example.com';

function nowIso(): string {
  return new Date().toISOString();
}

function latestByCreatedAt<T extends { createdAt?: string; issuedAt?: string }>(
  records: T[],
): T | null {
  return records.at(-1) ?? null;
}

function completeFounderApplication(email: string): FounderAccessApplicationInput {
  return {
    name: 'Founder Applicant',
    email,
    companyName: 'Applicant Co',
    companyWebsiteUrl: 'https://applicant.example',
    atlanticCanadaTie: 'Building from Atlantic Canada.',
    founderAffirmed: true,
    publicDirectoryConsent: true,
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
    options: Partial<Pick<AuthAccountRecord, 'isOwner' | 'fromApplication'>> = {},
  ): AuthAccountRecord {
    const existing = repository.getAccount(email);
    const account = {
      email: normalizeAuthEmail(email),
      role,
      status,
      isOwner: options.isOwner ?? existing?.isOwner ?? false,
      fromApplication: options.fromApplication ?? existing?.fromApplication ?? false,
      createdAt: existing?.createdAt ?? nowIso(),
    } satisfies AuthAccountRecord;
    repository.upsertAccount(account);
    return account;
  }

  function issueMagicLink(email: string): AuthMagicLinkRecord {
    for (const link of repository.listMagicLinks(email).filter((record) => !record.used)) {
      repository.updateMagicLink({ ...link, superseded: true });
    }

    const link = {
      id: repository.nextMagicLinkId(),
      email: normalizeAuthEmail(email),
      redirectTo: productionAuthCallbackUrl,
      expired: false,
      used: false,
      superseded: false,
      issuedAt: nowIso(),
    } satisfies AuthMagicLinkRecord;
    repository.addMagicLink(link);
    return link;
  }

  function latestMagicLinkFor(email: string): AuthMagicLinkRecord | null {
    return repository.listMagicLinks(email).at(-1) ?? null;
  }

  function useMagicLink(link: AuthMagicLinkRecord | null): MagicLoginResult {
    if (!link) {
      return 'rejected';
    }

    const account = repository.getAccount(link.email);

    if (!magicLinkCanAuthenticate(link, account)) {
      return 'rejected';
    }

    repository.updateMagicLink({ ...link, used: true });
    repository.createSession(link.email);
    return 'authenticated';
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
        companyName: input.companyName.trim(),
        companyWebsiteUrl: input.companyWebsiteUrl.trim(),
        atlanticCanadaTie: input.atlanticCanadaTie.trim(),
        status: 'pending',
        createdAt: nowIso(),
      });

      return {
        email: normalizedEmail,
        accepted: true,
        blockedReason: null,
      };
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
        status: 'archived',
        createdAt: nowIso(),
      });
    },

    createAccount(
      email: string,
      role: AccountRole,
      status: AuthAccountRecord['status'] = 'active',
    ) {
      return upsertAccount(email, role, status, { fromApplication: true });
    },

    createOwnerAdmin(email: string) {
      return upsertAccount(email, 'admin', 'active', { isOwner: true });
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

    canRequestMagicLink(email: string): boolean {
      return canRequestMagicLoginLink(repository.getAccount(email));
    },

    approveApplication(email: string) {
      const application = requirePendingApplication(email);
      repository.updateApplication({ ...application, status: 'approved' });
      upsertAccount(email, 'member', 'active', { fromApplication: true });
      repository.addNotice({
        email: normalizeAuthEmail(email),
        kind: 'approval',
        loginUrl: productionLoginUrl,
        includesMagicSignInLink: false,
        sentAt: nowIso(),
      });
      addAuditEntry('approve', email);
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

    requestMagicLoginLink(email: string): LoginRequestResult {
      const normalizedEmail = normalizeAuthEmail(email);
      const accountExistedBefore = Boolean(repository.getAccount(normalizedEmail));
      const sent = this.canRequestMagicLink(normalizedEmail);

      if (sent) {
        issueMagicLink(normalizedEmail);
        addAuditEntry('login-link send', normalizedEmail);
      }

      return {
        email: normalizedEmail,
        sent,
        accountCreated: !accountExistedBefore && Boolean(repository.getAccount(normalizedEmail)),
        genericResponse: true,
      };
    },

    issueFreshMagicLoginLink(email: string) {
      if (!repository.getAccount(email)) {
        upsertAccount(email, 'member', 'active', { fromApplication: true });
      }

      return issueMagicLink(email);
    },

    markLatestMagicLink(email: string, state: 'expired' | 'used') {
      const link = latestMagicLinkFor(email);

      if (!link) {
        throw new Error(`Magic link not found for ${email}`);
      }

      repository.updateMagicLink({
        ...link,
        expired: state === 'expired' ? true : link.expired,
        used: state === 'used' ? true : link.used,
      });
    },

    issueSecondMagicLoginLink(email: string) {
      return issueMagicLink(email);
    },

    useLatestMagicLoginLink(email: string): MagicLoginResult {
      return useMagicLink(latestMagicLinkFor(email));
    },

    useFirstMagicLoginLink(email: string): MagicLoginResult {
      return useMagicLink(repository.listMagicLinks(email).at(0) ?? null);
    },

    latestMagicLinkFor,

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

      if (action === 'login-link send') {
        upsertAccount(email, 'member', 'active');
        this.requestMagicLoginLink(email);
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
