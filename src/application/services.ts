import { getEventRegistrationAction } from '../domain/events';
import type { AccountRole } from '../domain/accounts';
import type { CompanyRepository } from '../ports/companies';
import type { EventRepository } from '../ports/events';
import type { PersonRepository } from '../ports/people';
import type { RegistrationRequestRepository } from '../ports/registrationRequests';

export interface ApplicationPorts {
  events: EventRepository;
  people: PersonRepository;
  companies: CompanyRepository;
  registrationRequests: RegistrationRequestRepository;
}

export function createApplicationServices(ports: ApplicationPorts) {
  return {
    events: {
      async listPublicEvents() {
        const events = await ports.events.listPublicEvents();
        return events.map((event) => ({
          ...event,
          registrationAction: getEventRegistrationAction(event),
        }));
      },
      async getPublicEventBySlug(slug: string) {
        const event = await ports.events.getPublicEventBySlug(slug);
        return event
          ? {
              ...event,
              registrationAction: getEventRegistrationAction(event),
            }
          : null;
      },
      async hasExternalEventRegistration() {
        const events = await ports.events.listPublicEvents();
        return events.some((event) => getEventRegistrationAction(event).kind === 'external');
      },
    },
    people: {
      listPublicPeople: () => ports.people.listPublicPeople(),
      getPublicPersonBySlug: (slug: string) => ports.people.getPublicPersonBySlug(slug),
      async publicPeopleExcludePrivateRecords() {
        const people = await ports.people.listPublicPeople();
        return people.every(
          (person) => person.visibility === 'public' && person.publicDirectoryConsent,
        );
      },
    },
    companies: {
      listPublicCompanies: () => ports.companies.listPublicCompanies(),
      getPublicCompanyBySlug: (slug: string) => ports.companies.getPublicCompanyBySlug(slug),
    },
    admin: {
      listPendingRegistrationRequests: (role: AccountRole | null) =>
        ports.registrationRequests.listPendingRegistrationRequests(role),
    },
  };
}

export type ApplicationServices = ReturnType<typeof createApplicationServices>;
