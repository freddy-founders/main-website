import type { SupabaseClient } from '@supabase/supabase-js';
import {
  canAccessAdmin,
  type AccountRole,
  type RegistrationRequest,
  type RegistrationRequestDraft,
} from '../../domain/accounts';
import type { RegistrationRequestRepository } from '../../ports/registrationRequests';
import type { Database } from './database.types';

export class SupabaseRegistrationRequestRepository implements RegistrationRequestRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async createRegistrationRequest(input: RegistrationRequestDraft): Promise<void> {
    const { error } = await this.client.rpc('submit_founder_registration_request', {
      request_name: input.name,
      request_email: input.email,
      request_company_name: input.companyName,
      request_company_website_url: input.companyWebsiteUrl,
      request_company_domain: input.companyDomain,
      request_role: input.role ?? null,
      request_founder_context: input.founderContext ?? null,
      request_topics: input.topics,
      request_public_directory_consent: input.publicDirectoryConsent,
      request_is_company_founder: input.isCompanyFounder,
    });

    if (error) {
      throw error;
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
      companyDomain: row.company_domain,
      role: row.role ?? undefined,
      founderContext: row.founder_context ?? undefined,
      topics: row.topics ?? [],
      publicDirectoryConsent: row.public_directory_consent,
      isCompanyFounder: row.is_company_founder,
      status: row.status,
      createdAt: row.created_at,
    }));
  }
}
