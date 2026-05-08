import type { AccountRole } from '../domain/accounts';

export interface AuthSession {
  userId: string;
  email: string;
  role: AccountRole;
}

export interface AuthPort {
  getCurrentSession(): Promise<AuthSession | null>;
  signInWithEmail(email: string): Promise<void>;
  signOut(): Promise<void>;
}
