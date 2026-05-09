import type {
  AuthAccountRecord,
  AuthApplicationRecord,
  AuthAuditEntry,
  AuthMagicLinkRecord,
  AuthNoticeRecord,
  AuthNotificationRecord,
} from '../../domain/authAccess';
import { normalizeAuthEmail } from '../../domain/authAccess';
import type { AuthAccessRepository } from '../../ports/authAccess';

export class InMemoryAuthAccessRepository implements AuthAccessRepository {
  private applications: AuthApplicationRecord[] = [];
  private accounts = new Map<string, AuthAccountRecord>();
  private sessions = new Set<string>();
  private magicLinks: AuthMagicLinkRecord[] = [];
  private notices: AuthNoticeRecord[] = [];
  private notifications: AuthNotificationRecord[] = [];
  private auditEntries: AuthAuditEntry[] = [];

  reset(): void {
    this.applications = [];
    this.accounts = new Map();
    this.sessions = new Set();
    this.magicLinks = [];
    this.notices = [];
    this.notifications = [];
    this.auditEntries = [];
  }

  nextApplicationId(): string {
    return `application-${this.applications.length + 1}`;
  }

  nextMagicLinkId(): string {
    return `magic-link-${this.magicLinks.length + 1}`;
  }

  listApplications(): AuthApplicationRecord[] {
    return this.applications.map((application) => ({ ...application }));
  }

  addApplication(record: AuthApplicationRecord): void {
    this.applications.push({ ...record, email: normalizeAuthEmail(record.email) });
  }

  updateApplication(record: AuthApplicationRecord): void {
    const index = this.applications.findIndex((application) => application.id === record.id);

    if (index === -1) {
      throw new Error(`Application not found: ${record.id}`);
    }

    this.applications[index] = { ...record, email: normalizeAuthEmail(record.email) };
  }

  getAccount(email: string): AuthAccountRecord | null {
    const account = this.accounts.get(normalizeAuthEmail(email));
    return account ? { ...account } : null;
  }

  listAccounts(): AuthAccountRecord[] {
    return [...this.accounts.values()].map((account) => ({ ...account }));
  }

  upsertAccount(record: AuthAccountRecord): void {
    this.accounts.set(normalizeAuthEmail(record.email), {
      ...record,
      email: normalizeAuthEmail(record.email),
    });
  }

  hasSession(email: string): boolean {
    return this.sessions.has(normalizeAuthEmail(email));
  }

  createSession(email: string): void {
    this.sessions.add(normalizeAuthEmail(email));
  }

  listMagicLinks(email?: string): AuthMagicLinkRecord[] {
    const normalizedEmail = email ? normalizeAuthEmail(email) : null;
    return this.magicLinks
      .filter((link) => !normalizedEmail || link.email === normalizedEmail)
      .map((link) => ({ ...link }));
  }

  addMagicLink(record: AuthMagicLinkRecord): void {
    this.magicLinks.push({ ...record, email: normalizeAuthEmail(record.email) });
  }

  updateMagicLink(record: AuthMagicLinkRecord): void {
    const index = this.magicLinks.findIndex((link) => link.id === record.id);

    if (index === -1) {
      throw new Error(`Magic link not found: ${record.id}`);
    }

    this.magicLinks[index] = { ...record, email: normalizeAuthEmail(record.email) };
  }

  listNotices(email?: string): AuthNoticeRecord[] {
    const normalizedEmail = email ? normalizeAuthEmail(email) : null;
    return this.notices
      .filter((notice) => !normalizedEmail || notice.email === normalizedEmail)
      .map((notice) => ({ ...notice }));
  }

  addNotice(record: AuthNoticeRecord): void {
    this.notices.push({ ...record, email: normalizeAuthEmail(record.email) });
  }

  listNotifications(email?: string): AuthNotificationRecord[] {
    const normalizedEmail = email ? normalizeAuthEmail(email) : null;
    return this.notifications
      .filter((notification) => !normalizedEmail || notification.email === normalizedEmail)
      .map((notification) => ({ ...notification }));
  }

  addNotification(record: AuthNotificationRecord): void {
    this.notifications.push({ ...record, email: normalizeAuthEmail(record.email) });
  }

  listAuditEntries(): AuthAuditEntry[] {
    return this.auditEntries.map((entry) => ({ ...entry }));
  }

  addAuditEntry(record: AuthAuditEntry): void {
    this.auditEntries.push({ ...record, target: normalizeAuthEmail(record.target) });
  }
}
