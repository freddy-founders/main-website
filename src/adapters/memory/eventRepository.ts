import { events } from '../../application/fixtures';
import type { EventSummary } from '../../domain/events';
import { isPubliclyVisible } from '../../domain/visibility';
import type { EventRepository } from '../../ports/events';

export class InMemoryEventRepository implements EventRepository {
  constructor(private readonly records: EventSummary[] = events) {}

  async listPublicEvents(): Promise<EventSummary[]> {
    return this.records.filter(isPubliclyVisible);
  }

  async getPublicEventBySlug(slug: string): Promise<EventSummary | null> {
    const events = await this.listPublicEvents();
    return events.find((event) => event.slug === slug) ?? null;
  }
}
