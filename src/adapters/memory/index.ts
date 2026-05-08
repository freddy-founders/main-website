import { InMemoryCompanyRepository } from './companyRepository';
import { InMemoryEventRepository } from './eventRepository';
import { InMemoryPersonRepository } from './personRepository';
import { InMemoryRegistrationRequestRepository } from './registrationRequestRepository';

export function createInMemoryAdapters() {
  return {
    events: new InMemoryEventRepository(),
    people: new InMemoryPersonRepository(),
    companies: new InMemoryCompanyRepository(),
    registrationRequests: new InMemoryRegistrationRequestRepository(),
  };
}
