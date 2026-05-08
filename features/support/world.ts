import { setWorldConstructor, World } from '@cucumber/cucumber';
import type { RegistrationRequest } from '../../src/domain/accounts';
import type { CompanySummary } from '../../src/domain/companies';
import type { EventRegistrationAction, EventSummary } from '../../src/domain/events';
import type { PersonSummary } from '../../src/domain/people';

export type PublicEventView = EventSummary & {
  registrationAction: EventRegistrationAction;
};

export class FreddyWorld extends World {
  events: PublicEventView[] = [];
  people: PersonSummary[] = [];
  companies: CompanySummary[] = [];
  registrationRequests: RegistrationRequest[] = [];
}

setWorldConstructor(FreddyWorld);
