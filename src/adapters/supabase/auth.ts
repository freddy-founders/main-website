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
      .select('role, access_status')
      .eq('id', session.user.id)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    if (!profile || profile.access_status !== 'active') {
      return null;
    }

    return {
      userId: session.user.id,
      email: session.user.email,
      role: normalizeAccountRole(profile.role),
      accessToken: session.access_token,
    };
  }

  async signInWithEmail(email: string, redirectTo?: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    const { data: profile, error: profileError } = await this.client
      .from('profiles')
      .select('id, access_status')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    if (!profile || profile.access_status !== 'active') {
      return;
    }

    const { error } = await this.client.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: false,
        ...(redirectTo ? { emailRedirectTo: redirectTo } : {}),
      },
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
