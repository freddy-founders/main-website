import { InMemoryAuthPort } from './auth';
import { InMemoryCompanyRepository } from './companyRepository';
import { InMemoryEventRepository } from './eventRepository';
import { InMemoryPersonRepository } from './personRepository';
import { InMemoryProfileRepository } from './profileRepository';
import { InMemoryRegistrationRequestRepository } from './registrationRequestRepository';

export function createInMemoryAdapters() {
  return {
    auth: new InMemoryAuthPort(),
    events: new InMemoryEventRepository(),
    people: new InMemoryPersonRepository(),
    companies: new InMemoryCompanyRepository(),
    registrationRequests: new InMemoryRegistrationRequestRepository(),
    profiles: new InMemoryProfileRepository(),
  };
}
