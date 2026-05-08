export { createBrowserSupabaseClient, getSupabaseBrowserConfig } from './client';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseAuthPort } from './auth';
import { SupabaseCompanyRepository } from './companyRepository';
import type { Database } from './database.types';
import { SupabaseEventRepository } from './eventRepository';
import { SupabasePersonRepository } from './personRepository';
import { SupabaseRegistrationRequestRepository } from './registrationRequestRepository';

export function createSupabaseAdapters(client: SupabaseClient<Database>) {
  return {
    auth: new SupabaseAuthPort(client),
    events: new SupabaseEventRepository(client),
    people: new SupabasePersonRepository(client),
    companies: new SupabaseCompanyRepository(client),
    registrationRequests: new SupabaseRegistrationRequestRepository(client),
  };
}
