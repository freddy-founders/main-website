import { describe, expect, it } from 'vitest';
import { getEventRegistrationAction, type EventSummary } from './events';

const baseEvent: EventSummary = {
  id: 'evt-test',
  slug: 'test-event',
  title: 'Test Event',
  startsAt: '2026-06-01T12:00:00.000Z',
  locationLabel: 'Fredericton',
  summary: 'A test event.',
  registrationMode: 'disabled',
  capacityStatus: 'unknown',
  publicationStatus: 'published',
  visibility: 'public',
};

describe('getEventRegistrationAction', () => {
  it('returns an external action when an event has external registration configured', () => {
    const action = getEventRegistrationAction({
      ...baseEvent,
      registrationMode: 'external',
      registrationUrl: 'https://example.com/register',
      registrationLabel: 'Register externally',
      capacityStatus: 'open',
    });

    expect(action).toEqual({
      kind: 'external',
      label: 'Register externally',
      url: 'https://example.com/register',
      capacityStatus: 'open',
    });
  });

  it('keeps internal RSVP as a future seam instead of enabling it implicitly', () => {
    const action = getEventRegistrationAction({
      ...baseEvent,
      registrationMode: 'internal',
      registrationLabel: 'RSVP',
      capacityStatus: 'limited',
    });

    expect(action).toEqual({
      kind: 'future-internal',
      label: 'RSVP',
      capacityStatus: 'limited',
    });
  });

  it('returns a disabled action when registration is not available', () => {
    const action = getEventRegistrationAction(baseEvent);

    expect(action.kind).toBe('disabled');
    expect(action.label).toBe('Registration closed');
  });
});
