import type { SupabaseClient } from '@supabase/supabase-js';
import {
  canAccessAdmin,
  type AccountRole,
  type RegistrationRequest,
  type RegistrationRequestInput,
} from '../../domain/accounts';
import type { RegistrationRequestRepository } from '../../ports/registrationRequests';
import type { Database } from './database.types';

export class SupabaseRegistrationRequestRepository implements RegistrationRequestRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async createRegistrationRequest(input: RegistrationRequestInput): Promise<void> {
    const response = await fetch('/api/registration-requests', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(payload?.error ?? 'Could not submit application.');
    }
  }

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
      companyName: row.company_name ?? row.company_domain,
      companyWebsiteUrl: row.company_website_url,
      townCity: row.atlantic_canada_tie,
      companyDomain: row.company_domain,
      publicDirectoryConsent: false,
      isCompanyFounder: row.is_company_founder,
      status: row.status,
      createdAt: row.created_at,
    }));
  }
}
