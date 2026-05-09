export type AccountRole = 'member' | 'organizer' | 'admin';
export type RegistrationRequestStatus = 'pending' | 'approved' | 'archived' | 'rejected';

export function normalizeAccountRole(role: string | null | undefined): AccountRole {
  if (role === 'admin' || role === 'organizer') {
    return role;
  }

  return 'member';
}

export function canAccessAdmin(role: AccountRole | null): boolean {
  return role === 'admin';
}

export function canPromoteToRole(actorRole: AccountRole | null, targetRole: AccountRole): boolean {
  if (targetRole === 'admin') {
    return actorRole === 'admin';
  }

  if (targetRole === 'organizer') {
    return actorRole === 'admin' || actorRole === 'organizer';
  }

  return false;
}

export interface ProfileAccount {
  id: string;
  email: string;
  name: string;
  role: AccountRole;
  isOwner: boolean;
  accessStatus: 'active' | 'deactivated';
  createdAt: string;
}

export interface SetProfileRoleInput {
  targetProfileId: string;
  role: AccountRole;
}

export interface TransferOwnershipInput {
  targetProfileId: string;
}

export interface RegistrationRequestInput {
  name: string;
  email: string;
  companyName: string;
  companyWebsiteUrl: string;
  role?: string;
  founderContext?: string;
  atlanticCanadaTie: string;
  topics?: string[];
  publicDirectoryConsent: boolean;
  isCompanyFounder: boolean;
}

export interface RegistrationRequestDraft extends RegistrationRequestInput {
  companyDomain: string;
}

export interface RegistrationRequest extends RegistrationRequestDraft {
  id: string;
  status: RegistrationRequestStatus;
  createdAt: string;
}

export function normalizeCompanyDomain(companyWebsiteUrl: string): string {
  const rawValue = companyWebsiteUrl.trim();

  if (rawValue.length === 0) {
    throw new Error('Company website is required.');
  }

  const url = new URL(rawValue.includes('://') ? rawValue : `https://${rawValue}`);
  return url.hostname.toLowerCase().replace(/^www\./, '');
}

export function companySlugFromDomain(companyDomain: string): string {
  return companyDomain
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function prepareFounderRegistrationRequest(
  input: RegistrationRequestInput,
): RegistrationRequestDraft {
  if (!input.isCompanyFounder) {
    throw new Error('Founder affirmation is required.');
  }

  if (input.name.trim().length === 0) {
    throw new Error('Name is required.');
  }

  if (input.email.trim().length === 0) {
    throw new Error('Email is required.');
  }

  if (input.companyName.trim().length === 0) {
    throw new Error('Company name is required.');
  }

  if (input.atlanticCanadaTie.trim().length === 0) {
    throw new Error('Atlantic Canada tie is required.');
  }

  const companyDomain = normalizeCompanyDomain(input.companyWebsiteUrl);
  const atlanticCanadaTie = input.atlanticCanadaTie.trim();

  return {
    ...input,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    companyName: input.companyName.trim(),
    companyWebsiteUrl: input.companyWebsiteUrl.trim(),
    role: input.role?.trim() || undefined,
    founderContext: atlanticCanadaTie,
    atlanticCanadaTie,
    topics: input.topics?.map((topic) => topic.trim()).filter(Boolean) ?? [],
    companyDomain,
  };
}
