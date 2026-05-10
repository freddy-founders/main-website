import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuthPort, AuthSession, AuthSignInResult } from '../../ports/auth';
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
      .select('role, access_status, password_reset_required')
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
      passwordResetRequired: profile.password_reset_required,
      accessToken: session.access_token,
    };
  }

  async signInWithPassword(email: string, password: string): Promise<AuthSignInResult> {
    const normalizedEmail = email.trim().toLowerCase();
    const { data: canRequestLogin, error: eligibilityError } = await this.client.rpc(
      'can_request_member_login',
      {
        request_email: normalizedEmail,
      },
    );

    if (eligibilityError) {
      throw eligibilityError;
    }

    if (canRequestLogin !== true) {
      return 'missing-account';
    }

    const { error } = await this.client.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      return 'invalid-credentials';
    }

    return 'authenticated';
  }

  async completePasswordReset(newPassword: string): Promise<void> {
    const { error: updateError } = await this.client.auth.updateUser({ password: newPassword });

    if (updateError) {
      throw updateError;
    }

    const { error: profileError } = await this.client.rpc('complete_required_password_reset');

    if (profileError) {
      throw profileError;
    }
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();

    if (error) {
      throw error;
    }
  }
}
