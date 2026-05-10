import type { AccountRole } from '../domain/accounts';

export interface AuthSession {
  userId: string;
  email: string;
  role: AccountRole;
  passwordResetRequired: boolean;
  accessToken?: string;
}

export type AuthSignInResult = 'authenticated' | 'missing-account' | 'invalid-credentials';

export interface AuthPort {
  getCurrentSession(): Promise<AuthSession | null>;
  signInWithPassword(email: string, password: string): Promise<AuthSignInResult>;
  completePasswordReset(newPassword: string): Promise<void>;
  signOut(): Promise<void>;
}
