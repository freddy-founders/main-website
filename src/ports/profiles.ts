import type {
  AccountRole,
  ProfileAccount,
  SetProfileRoleInput,
  TransferOwnershipInput,
} from '../domain/accounts';

export interface ProfileRepository {
  listProfiles(actorRole: AccountRole | null): Promise<ProfileAccount[]>;
  setProfileRole(actorRole: AccountRole | null, input: SetProfileRoleInput): Promise<void>;
  transferOwnership(actorIsOwner: boolean, input: TransferOwnershipInput): Promise<void>;
}
