import type { AccountRole } from './accounts';

export type AuthApplicationStatus = 'pending' | 'approved' | 'archived';
export type AuthAccountStatus = 'active' | 'deactivated';
export type AccessDecision = 'granted' | 'denied';
export type MagicLoginResult = 'authenticated' | 'rejected';
export type ApplicationBlockReason =
  | 'missing-field'
  | 'founder-affirmation-required'
  | 'duplicate-pending'
  | 'already-approved'
  | 'deactivated-former-member';

export interface FounderAccessApplicationInput {
  name: string;
  email: string;
  companyName: string;
  companyWebsiteUrl: string;
  atlanticCanadaTie: string;
  founderAffirmed: boolean;
  publicDirectoryConsent: boolean;
}

export interface AuthApplicationRecord extends FounderAccessApplicationInput {
  id: string;
  email: string;
  status: AuthApplicationStatus;
  createdAt: string;
}

export interface AuthAccountRecord {
  email: string;
  role: AccountRole;
  status: AuthAccountStatus;
  isOwner: boolean;
  fromApplication: boolean;
  createdAt: string;
}

export interface AuthNoticeRecord {
  email: string;
  kind: 'approval';
  loginUrl: string;
  includesMagicSignInLink: boolean;
  sentAt: string;
}

export interface AuthNotificationRecord {
  email: string;
  kind: string;
  sentAt: string;
}

export interface AuthMagicLinkRecord {
  id: string;
  email: string;
  redirectTo: string;
  expired: boolean;
  used: boolean;
  superseded: boolean;
  issuedAt: string;
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

export interface LoginRequestResult {
  email: string;
  sent: boolean;
  accountCreated: boolean;
  genericResponse: boolean;
}

export interface AccessStateReview {
  pendingApplications: AuthApplicationRecord[];
  approvedMembers: AuthAccountRecord[];
  roles: Array<{ email: string; role: AccountRole }>;
  applicationHistory: AuthApplicationRecord[];
}

export const authPublicRoutes = ['/login', '/register'] as const;
export const privateAppRoutes = ['/events', '/people', '/companies', '/admin'] as const;
export const productionOrigin = 'https://freddyfounders.com';
export const productionLoginUrl = `${productionOrigin}/login`;
export const productionAuthCallbackUrl = `${productionOrigin}/auth/callback`;

export function normalizeAuthEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function routeBoundaryForAnonymous(route: string): RouteBoundaryDecision {
  const publicRoute = authPublicRoutes.includes(route as (typeof authPublicRoutes)[number]);

  return {
    route,
    publicRoute,
    outsidePrivateShell: publicRoute,
    loginRequired: privateAppRoutes.includes(route as (typeof privateAppRoutes)[number]),
  };
}

export function accountCanOpenRoute(
  account: AuthAccountRecord | null | undefined,
  route: string,
): AccessDecision {
  if (authPublicRoutes.includes(route as (typeof authPublicRoutes)[number])) {
    return 'granted';
  }

  if (
    !privateAppRoutes.includes(route as (typeof privateAppRoutes)[number]) ||
    account?.status !== 'active'
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
  if (input.companyName.trim().length === 0) return 'company name';
  if (input.companyWebsiteUrl.trim().length === 0) return 'company website';
  if (input.atlanticCanadaTie.trim().length === 0) return 'Atlantic Canada tie';
  return null;
}

export function canRequestMagicLoginLink(account: AuthAccountRecord | null | undefined): boolean {
  return account?.status === 'active';
}

export function magicLinkCanAuthenticate(
  link: AuthMagicLinkRecord | null | undefined,
  account: AuthAccountRecord | null | undefined,
): boolean {
  return Boolean(
    link && !link.expired && !link.used && !link.superseded && account?.status === 'active',
  );
}
