import { people } from '../../application/fixtures';
import type { PersonSummary } from '../../domain/people';
import { isPubliclyVisible } from '../../domain/visibility';
import type { PersonRepository } from '../../ports/people';

export class InMemoryPersonRepository implements PersonRepository {
  constructor(private readonly records: PersonSummary[] = people) {}

  async listPublicPeople(): Promise<PersonSummary[]> {
    return this.records.filter(
      (person) => isPubliclyVisible(person) && person.publicDirectoryConsent,
    );
  }

  async getPublicPersonBySlug(slug: string): Promise<PersonSummary | null> {
    const people = await this.listPublicPeople();
    return people.find((person) => person.slug === slug) ?? null;
  }
}
