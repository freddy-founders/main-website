import { registrationRequests } from '../../application/fixtures';
import { canAccessAdmin, type AccountRole, type RegistrationRequest } from '../../domain/accounts';
import type { RegistrationRequestRepository } from '../../ports/registrationRequests';

export class InMemoryRegistrationRequestRepository implements RegistrationRequestRepository {
  constructor(private readonly records: RegistrationRequest[] = registrationRequests) {}

  async listPendingRegistrationRequests(role: AccountRole | null): Promise<RegistrationRequest[]> {
    if (!canAccessAdmin(role)) {
      return [];
    }

    return this.records.filter((request) => request.status === 'pending');
  }
}
