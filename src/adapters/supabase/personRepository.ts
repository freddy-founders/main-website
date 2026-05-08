import type { SupabaseClient } from '@supabase/supabase-js';
import type { PersonSummary } from '../../domain/people';
import type { PersonRepository } from '../../ports/people';
import type { Database } from './database.types';

export class SupabasePersonRepository implements PersonRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async listPublicPeople(): Promise<PersonSummary[]> {
    const { data, error } = await this.client
      .from('people')
      .select('*')
      .eq('publication_status', 'published')
      .eq('visibility', 'public')
      .eq('public_directory_consent', true)
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      role: row.role ?? 'Member',
      companyName: row.company_name ?? undefined,
      topics: row.topics ?? [],
      publicationStatus: row.publication_status,
      visibility: row.visibility,
      publicDirectoryConsent: row.public_directory_consent,
    }));
  }

  async getPublicPersonBySlug(slug: string): Promise<PersonSummary | null> {
    const people = await this.listPublicPeople();
    return people.find((person) => person.slug === slug) ?? null;
  }
}
