import type { AuthPort, AuthSession, AuthSignInResult } from '../../ports/auth';

export class InMemoryAuthPort implements AuthPort {
  private currentSession: AuthSession | null = null;

  async getCurrentSession(): Promise<AuthSession | null> {
    return this.currentSession;
  }

  async signInWithPassword(email: string, password: string): Promise<AuthSignInResult> {
    if (password.trim().length === 0) {
      return 'invalid-credentials';
    }

    this.currentSession = {
      userId: `memory:${email}`,
      email,
      role: email.endsWith('@admin.test') ? 'admin' : 'member',
      passwordResetRequired: false,
      accessToken: `memory-token:${email}`,
    };

    return 'authenticated';
  }

  async completePasswordReset(): Promise<void> {
    if (this.currentSession) {
      this.currentSession = { ...this.currentSession, passwordResetRequired: false };
    }
  }

  async signOut(): Promise<void> {
    this.currentSession = null;
  }
}
