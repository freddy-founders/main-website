import type { SupabaseClient } from '@supabase/supabase-js';
import type { CompanySummary } from '../../domain/companies';
import type { CompanyRepository } from '../../ports/companies';
import type { Database } from './database.types';

export class SupabaseCompanyRepository implements CompanyRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async listPublicCompanies(): Promise<CompanySummary[]> {
    const { data, error } = await this.client
      .from('companies')
      .select('*')
      .eq('publication_status', 'published')
      .eq('visibility', 'public')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      tagline: row.tagline ?? '',
      category: row.category ?? 'Uncategorized',
      stage: row.stage ?? undefined,
      locationLabel: row.location_label ?? undefined,
      websiteUrl: row.website_url ?? undefined,
      relatedPeople: [],
      publicationStatus: row.publication_status,
      visibility: row.visibility,
    }));
  }

  async getPublicCompanyBySlug(slug: string): Promise<CompanySummary | null> {
    const companies = await this.listPublicCompanies();
    return companies.find((company) => company.slug === slug) ?? null;
  }
}
