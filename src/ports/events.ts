import type { EventSummary } from '../domain/events';

export interface EventRepository {
  listPublicEvents(): Promise<EventSummary[]>;
  getPublicEventBySlug(slug: string): Promise<EventSummary | null>;
}
