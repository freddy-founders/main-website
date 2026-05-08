import type { SupabaseClient } from '@supabase/supabase-js';
import type { EventSummary } from '../../domain/events';
import type { EventRepository } from '../../ports/events';
import type { Database } from './database.types';

export class SupabaseEventRepository implements EventRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async listPublicEvents(): Promise<EventSummary[]> {
    const { data, error } = await this.client
      .from('events')
      .select('*')
      .eq('publication_status', 'published')
      .eq('visibility', 'public')
      .order('starts_at', { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      startsAt: row.starts_at,
      locationLabel: row.location_label ?? 'Location TBD',
      summary: row.summary ?? '',
      registrationMode: row.registration_mode,
      registrationUrl: row.registration_url ?? undefined,
      registrationLabel: row.registration_label ?? undefined,
      capacityStatus: row.capacity_status,
      publicationStatus: row.publication_status,
      visibility: row.visibility,
    }));
  }

  async getPublicEventBySlug(slug: string): Promise<EventSummary | null> {
    const events = await this.listPublicEvents();
    return events.find((event) => event.slug === slug) ?? null;
  }
}
