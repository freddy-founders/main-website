export type AccountRole = 'visitor' | 'member' | 'organizer' | 'admin';
export type RegistrationRequestStatus = 'pending' | 'approved' | 'rejected';

export function canAccessAdmin(role: AccountRole | null): boolean {
  return role === 'admin' || role === 'organizer';
}

export interface RegistrationRequestInput {
  name: string;
  email: string;
  companyName?: string;
  role?: string;
  founderContext?: string;
  topics: string[];
  publicDirectoryConsent: boolean;
}

export interface RegistrationRequest extends RegistrationRequestInput {
  id: string;
  status: RegistrationRequestStatus;
  createdAt: string;
}
