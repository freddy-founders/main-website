import type {
  AuthAccountRecord,
  AuthApplicationRecord,
  AuthAuditEntry,
  AuthNoticeRecord,
  AuthNotificationRecord,
} from '../domain/authAccess';

export interface AuthAccessRepository {
  reset(): void;

  nextApplicationId(): string;
  nextTemporaryPassword(): string;

  listApplications(): AuthApplicationRecord[];
  addApplication(record: AuthApplicationRecord): void;
  updateApplication(record: AuthApplicationRecord): void;

  getAccount(email: string): AuthAccountRecord | null;
  listAccounts(): AuthAccountRecord[];
  upsertAccount(record: AuthAccountRecord): void;

  hasSession(email: string): boolean;
  createSession(email: string): void;

  listNotices(email?: string): AuthNoticeRecord[];
  addNotice(record: AuthNoticeRecord): void;

  listNotifications(email?: string): AuthNotificationRecord[];
  addNotification(record: AuthNotificationRecord): void;

  listAuditEntries(): AuthAuditEntry[];
  addAuditEntry(record: AuthAuditEntry): void;
}
