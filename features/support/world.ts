import { setWorldConstructor, World } from '@cucumber/cucumber';
import type { ProfileAccount, RegistrationRequest } from '../../src/domain/accounts';
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
  registrationError: unknown = null;
  profiles: ProfileAccount[] = [];
  roleChangeAllowed = false;
  memberLoggedIn = false;
  loginRequired = false;
}

setWorldConstructor(FreddyWorld);
