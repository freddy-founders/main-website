import type { AccountRole } from './accounts';
import { isKnownAtlanticTownCity } from './atlanticTownCities';

export type AuthApplicationStatus = 'pending' | 'approved' | 'archived';
export type AuthAccountStatus = 'active' | 'deactivated';
export type AccessDecision = 'granted' | 'denied';
export type PasswordLoginResult = 'authenticated' | 'reset-required' | 'rejected';
export type ApplicationBlockReason =
  | 'missing-field'
  | 'founder-affirmation-required'
  | 'website-scrape-failed'
  | 'business-validation-failed'
  | 'duplicate-pending'
  | 'already-approved'
  | 'deactivated-former-member';

export interface FounderAccessApplicationInput {
  name: string;
  email: string;
  companyWebsiteUrl: string;
  townCity: string;
  founderAffirmed: boolean;
}

export interface AuthApplicationRecord extends FounderAccessApplicationInput {
  id: string;
  email: string;
  publicDirectoryConsent: false;
  status: AuthApplicationStatus;
  createdAt: string;
}

export interface AuthAccountRecord {
  email: string;
  role: AccountRole;
  status: AuthAccountStatus;
  isOwner: boolean;
  fromApplication: boolean;
  password: string | null;
  temporaryPassword: string | null;
  passwordResetRequired: boolean;
  createdAt: string;
}

export interface AuthNoticeRecord {
  email: string;
  kind: 'approval' | 'password-reset';
  loginUrl: string;
  includesTemporaryPassword: boolean;
  sentAt: string;
}

export interface AuthNotificationRecord {
  email: string;
  kind: string;
  sentAt: string;
}

export interface AuthAuditEntry {
  actor: string;
  target: string;
  action: string;
  timestamp: string;
}

export interface RouteBoundaryDecision {
  route: string;
  publicRoute: boolean;
  outsidePrivateShell: boolean;
  loginRequired: boolean;
}

export interface ApplicationAttemptResult {
  email: string;
  accepted: boolean;
  blockedReason: ApplicationBlockReason | null;
}

export interface PasswordLoginRequestResult {
  email: string;
  authenticated: boolean;
  accountCreated: boolean;
  status: 'authenticated' | 'reset-required' | 'missing-account' | 'invalid-credentials';
}

export interface TemporaryPasswordIssueResult {
  email: string;
  temporaryPassword: string;
}

export interface AccessStateReview {
  pendingApplications: AuthApplicationRecord[];
  approvedMembers: AuthAccountRecord[];
  roles: Array<{ email: string; role: AccountRole }>;
  applicationHistory: AuthApplicationRecord[];
}

export const authPublicRoutes = ['/login', '/register'] as const;
export const passwordResetRoute = '/reset-password';
export const privateAppRoutes = ['/events', '/people', '/companies', '/admin'] as const;
export const productionOrigin = 'https://freddyfounders.com';
export const productionLoginUrl = `${productionOrigin}/login`;

export function normalizeAuthEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function routeBoundaryForAnonymous(route: string): RouteBoundaryDecision {
  const publicRoute = authPublicRoutes.includes(route as (typeof authPublicRoutes)[number]);

  return {
    route,
    publicRoute,
    outsidePrivateShell: publicRoute,
    loginRequired:
      privateAppRoutes.includes(route as (typeof privateAppRoutes)[number]) ||
      route === passwordResetRoute,
  };
}

export function accountCanOpenRoute(
  account: AuthAccountRecord | null | undefined,
  route: string,
): AccessDecision {
  if (authPublicRoutes.includes(route as (typeof authPublicRoutes)[number])) {
    return 'granted';
  }

  if (!account || account.status !== 'active') {
    return 'denied';
  }

  if (route === passwordResetRoute) {
    return account.passwordResetRequired ? 'granted' : 'denied';
  }

  if (
    !privateAppRoutes.includes(route as (typeof privateAppRoutes)[number]) ||
    account.passwordResetRequired
  ) {
    return 'denied';
  }

  if (route === '/admin') {
    return account.role === 'admin' ? 'granted' : 'denied';
  }

  return 'granted';
}

export function roleCanPerformAction(role: AccountRole, action: string): boolean {
  const normalizedAction = action.trim().toLowerCase();

  if (['read events', 'read people', 'read companies', 'rsvp'].includes(normalizedAction)) {
    return true;
  }

  if (['create events', 'edit events', 'delete events'].includes(normalizedAction)) {
    return role === 'organizer' || role === 'admin';
  }

  if (
    [
      'create people',
      'edit people',
      'delete people',
      'create companies',
      'edit companies',
      'delete companies',
      'approve applications',
      'archive applications',
      'create admins',
      'deactivate members',
      'enter admin',
      'change roles',
      'reset passwords',
    ].includes(normalizedAction)
  ) {
    return role === 'admin';
  }

  return false;
}

export function parseAuthRole(role: string): AccountRole {
  if (role === 'member' || role === 'organizer' || role === 'admin') {
    return role;
  }

  throw new Error(`Unknown account role: ${role}`);
}

export function missingFounderApplicationField(
  input: FounderAccessApplicationInput,
): string | null {
  if (input.name.trim().length === 0) return 'name';
  if (input.email.trim().length === 0) return 'email';
  if (input.companyWebsiteUrl.trim().length === 0) return 'company website';
  if (input.townCity.trim().length === 0) return 'Town/City';
  if (!isKnownAtlanticTownCity(input.townCity)) return 'Town/City';
  return null;
}

export function canAttemptPasswordLogin(account: AuthAccountRecord | null | undefined): boolean {
  return account?.status === 'active';
}

export function passwordLoginCanAuthenticate(
  account: AuthAccountRecord | null | undefined,
  password: string,
): PasswordLoginResult {
  if (!account || account.status !== 'active') {
    return 'rejected';
  }

  if (account.passwordResetRequired) {
    return account.temporaryPassword && password === account.temporaryPassword
      ? 'reset-required'
      : 'rejected';
  }

  return account.password && password === account.password ? 'authenticated' : 'rejected';
}

export function canCompletePasswordReset(account: AuthAccountRecord | null | undefined): boolean {
  return Boolean(account?.status === 'active' && account.passwordResetRequired);
}
