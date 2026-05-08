import type { AccountRole, RegistrationRequest } from '../domain/accounts';

export interface RegistrationRequestRepository {
  listPendingRegistrationRequests(role: AccountRole | null): Promise<RegistrationRequest[]>;
}
