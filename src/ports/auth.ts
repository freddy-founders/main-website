import type { AccountRole } from '../domain/accounts';

export interface AuthSession {
  userId: string;
  email: string;
  role: AccountRole;
  accessToken?: string;
}

export interface AuthPort {
  getCurrentSession(): Promise<AuthSession | null>;
  signInWithEmail(email: string, redirectTo?: string): Promise<void>;
  signOut(): Promise<void>;
}
