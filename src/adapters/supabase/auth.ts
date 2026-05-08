import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuthPort, AuthSession } from '../../ports/auth';
import type { Database } from './database.types';
import { normalizeAccountRole } from '../../domain/accounts';

export class SupabaseAuthPort implements AuthPort {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async getCurrentSession(): Promise<AuthSession | null> {
    const { data: sessionData, error: sessionError } = await this.client.auth.getSession();

    if (sessionError) {
      throw sessionError;
    }

    const session = sessionData.session;

    if (!session?.user.email) {
      return null;
    }

    const { data: profile, error: profileError } = await this.client
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    return {
      userId: session.user.id,
      email: session.user.email,
      role: normalizeAccountRole(profile?.role),
    };
  }

  async signInWithEmail(email: string, redirectTo?: string): Promise<void> {
    const { error } = await this.client.auth.signInWithOtp({
      email,
      options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
    });

    if (error) {
      throw error;
    }
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();

    if (error) {
      throw error;
    }
  }
}
