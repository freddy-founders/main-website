import { registrationRequests } from '../../application/fixtures';
import {
  canAccessAdmin,
  type AccountRole,
  type RegistrationRequest,
  type RegistrationRequestDraft,
} from '../../domain/accounts';
import type { RegistrationRequestRepository } from '../../ports/registrationRequests';

export class InMemoryRegistrationRequestRepository implements RegistrationRequestRepository {
  constructor(private readonly records: RegistrationRequest[] = registrationRequests) {}

  async createRegistrationRequest(input: RegistrationRequestDraft): Promise<void> {
    this.records.push({
      ...input,
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
