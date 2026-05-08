import type {
  AccountRole,
  RegistrationRequest,
  RegistrationRequestDraft,
} from '../domain/accounts';

export interface RegistrationRequestRepository {
  createRegistrationRequest(input: RegistrationRequestDraft): Promise<void>;
  listPendingRegistrationRequests(role: AccountRole | null): Promise<RegistrationRequest[]>;
}
