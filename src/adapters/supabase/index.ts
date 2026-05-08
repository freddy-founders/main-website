import type { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseCompanyRepository } from './companyRepository';
import type { Database } from './database.types';
import { SupabaseEventRepository } from './eventRepository';
import { SupabasePersonRepository } from './personRepository';
import { SupabaseRegistrationRequestRepository } from './registrationRequestRepository';

export function createSupabaseAdapters(client: SupabaseClient<Database>) {
  return {
    events: new SupabaseEventRepository(client),
    people: new SupabasePersonRepository(client),
    companies: new SupabaseCompanyRepository(client),
    registrationRequests: new SupabaseRegistrationRequestRepository(client),
  };
}
