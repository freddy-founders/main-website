import type { AuthPort, AuthSession } from '../../ports/auth';

export class InMemoryAuthPort implements AuthPort {
  private currentSession: AuthSession | null = null;

  async getCurrentSession(): Promise<AuthSession | null> {
    return this.currentSession;
  }

  async signInWithEmail(email: string): Promise<void> {
    this.currentSession = {
      userId: `memory:${email}`,
      email,
      role: email.endsWith('@admin.test') ? 'admin' : 'member',
      accessToken: `memory-token:${email}`,
    };
  }

  async signOut(): Promise<void> {
    this.currentSession = null;
  }
}
