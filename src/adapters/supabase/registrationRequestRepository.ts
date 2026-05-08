import type { SupabaseClient } from '@supabase/supabase-js';
import { canAccessAdmin, type AccountRole, type RegistrationRequest } from '../../domain/accounts';
import type { RegistrationRequestRepository } from '../../ports/registrationRequests';
import type { Database } from './database.types';

export class SupabaseRegistrationRequestRepository implements RegistrationRequestRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async listPendingRegistrationRequests(role: AccountRole | null): Promise<RegistrationRequest[]> {
    if (!canAccessAdmin(role)) {
      return [];
    }

    const { data, error } = await this.client
      .from('registration_requests')
      .select('*')
      .eq('status', 'pending');

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      companyName: row.company_name ?? undefined,
      role: row.role ?? undefined,
      founderContext: row.founder_context ?? undefined,
      topics: row.topics ?? [],
      publicDirectoryConsent: row.public_directory_consent,
      status: row.status,
      createdAt: row.created_at,
    }));
  }
}
