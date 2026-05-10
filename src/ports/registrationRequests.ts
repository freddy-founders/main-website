import type {
  AccountRole,
  RegistrationRequest,
  RegistrationRequestInput,
} from '../domain/accounts';

export interface RegistrationRequestRepository {
  createRegistrationRequest(input: RegistrationRequestInput): Promise<void>;
  listPendingRegistrationRequests(role: AccountRole | null): Promise<RegistrationRequest[]>;
}
