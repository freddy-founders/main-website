import { registrationRequests } from '../../application/fixtures';
import {
  canAccessAdmin,
  prepareFounderRegistrationRequest,
  type AccountRole,
  type RegistrationRequest,
  type RegistrationRequestInput,
} from '../../domain/accounts';
import type { RegistrationRequestRepository } from '../../ports/registrationRequests';

export class InMemoryRegistrationRequestRepository implements RegistrationRequestRepository {
  constructor(private readonly records: RegistrationRequest[] = registrationRequests) {}

  async createRegistrationRequest(input: RegistrationRequestInput): Promise<void> {
    const draft = prepareFounderRegistrationRequest(input, {
      companyName: 'Memory Scraped Company',
    });

    this.records.push({
      ...draft,
      id: `request-${this.records.length + 1}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  }

  async listPendingRegistrationRequests(role: AccountRole | null): Promise<RegistrationRequest[]> {
    if (!canAccessAdmin(role)) {
      return [];
    }

    return this.records.filter((request) => request.status === 'pending');
  }
}
