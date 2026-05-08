import type { PersonSummary } from '../domain/people';

export interface PersonRepository {
  listPublicPeople(): Promise<PersonSummary[]>;
  getPublicPersonBySlug(slug: string): Promise<PersonSummary | null>;
}
