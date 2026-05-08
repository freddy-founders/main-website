import type { CompanySummary } from '../domain/companies';

export interface CompanyRepository {
  listPublicCompanies(): Promise<CompanySummary[]>;
  getPublicCompanyBySlug(slug: string): Promise<CompanySummary | null>;
}
