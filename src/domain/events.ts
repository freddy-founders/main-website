import type { PublicVisibility, PublicationStatus } from './visibility';

export type EventRegistrationMode = 'external' | 'disabled' | 'internal';
export type EventCapacityStatus = 'open' | 'limited' | 'full' | 'waitlist' | 'unknown';

export interface EventSummary {
  id: string;
  slug: string;
  title: string;
  startsAt: string;
  endsAt?: string;
  locationLabel: string;
  summary: string;
  registrationMode: EventRegistrationMode;
  registrationUrl?: string;
  registrationLabel?: string;
  capacityStatus: EventCapacityStatus;
  publicationStatus: PublicationStatus;
  visibility: PublicVisibility;
}

export type EventRegistrationAction =
  | {
      kind: 'external';
      label: string;
      url: string;
      capacityStatus: EventCapacityStatus;
    }
  | {
      kind: 'disabled';
      label: string;
      reason: string;
      capacityStatus: EventCapacityStatus;
    }
  | {
      kind: 'future-internal';
      label: string;
      capacityStatus: EventCapacityStatus;
    };

export function getEventRegistrationAction(event: EventSummary): EventRegistrationAction {
  if (event.registrationMode === 'external' && event.registrationUrl) {
    return {
      kind: 'external',
      label: event.registrationLabel ?? 'Register',
      url: event.registrationUrl,
      capacityStatus: event.capacityStatus,
    };
  }

  if (event.registrationMode === 'internal') {
    return {
      kind: 'future-internal',
      label: event.registrationLabel ?? 'RSVP',
      capacityStatus: event.capacityStatus,
    };
  }

  return {
    kind: 'disabled',
    label: event.registrationLabel ?? 'Registration closed',
    reason: 'Registration is not currently available for this event.',
    capacityStatus: event.capacityStatus,
  };
}
