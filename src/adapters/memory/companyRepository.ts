import { companies } from '../../application/fixtures';
import type { CompanySummary } from '../../domain/companies';
import { isPubliclyVisible } from '../../domain/visibility';
import type { CompanyRepository } from '../../ports/companies';

export class InMemoryCompanyRepository implements CompanyRepository {
  constructor(private readonly records: CompanySummary[] = companies) {}

  async listPublicCompanies(): Promise<CompanySummary[]> {
    return this.records.filter(isPubliclyVisible);
  }

  async getPublicCompanyBySlug(slug: string): Promise<CompanySummary | null> {
    const companies = await this.listPublicCompanies();
    return companies.find((company) => company.slug === slug) ?? null;
  }
}
