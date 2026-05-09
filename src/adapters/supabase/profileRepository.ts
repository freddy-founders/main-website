import type { SupabaseClient } from '@supabase/supabase-js';
import {
  canAccessAdmin,
  normalizeAccountRole,
  type AccountRole,
  type ProfileAccount,
} from '../../domain/accounts';
import type { ProfileRepository } from '../../ports/profiles';
import type { Database } from './database.types';

export class SupabaseProfileRepository implements ProfileRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async listProfiles(actorRole: AccountRole | null): Promise<ProfileAccount[]> {
    if (!canAccessAdmin(actorRole)) {
      return [];
    }

    const [{ data: profiles, error: profilesError }, { data: settings, error: settingsError }] =
      await Promise.all([
        this.client.from('profiles').select('*').order('created_at', { ascending: true }),
        this.client.from('site_settings').select('owner_profile_id').maybeSingle(),
      ]);

    if (profilesError) {
      throw profilesError;
    }

    if (settingsError) {
      throw settingsError;
    }

    const ownerProfileId = settings?.owner_profile_id ?? null;

    return (profiles ?? []).map((profile) => ({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: normalizeAccountRole(profile.role),
      isOwner: profile.id === ownerProfileId,
      accessStatus: profile.access_status === 'deactivated' ? 'deactivated' : 'active',
      createdAt: profile.created_at,
    }));
  }

  async setProfileRole(
    _: AccountRole | null,
    input: { targetProfileId: string; role: AccountRole },
  ) {
    const { error } = await this.client.rpc('set_profile_role', {
      target_profile_id: input.targetProfileId,
      next_role: input.role,
      reason: null,
    });

    if (error) {
      throw error;
    }
  }

  async transferOwnership(_: boolean, input: { targetProfileId: string }) {
    const { error } = await this.client.rpc('transfer_site_owner', {
      target_profile_id: input.targetProfileId,
    });

    if (error) {
      throw error;
    }
  }
}
