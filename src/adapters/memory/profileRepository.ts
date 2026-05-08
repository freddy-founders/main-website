import { profileAccounts } from '../../application/fixtures';
import {
  canAccessAdmin,
  canPromoteToRole,
  type AccountRole,
  type ProfileAccount,
  type SetProfileRoleInput,
  type TransferOwnershipInput,
} from '../../domain/accounts';
import type { ProfileRepository } from '../../ports/profiles';

export class InMemoryProfileRepository implements ProfileRepository {
  constructor(private readonly records: ProfileAccount[] = profileAccounts) {}

  async listProfiles(actorRole: AccountRole | null): Promise<ProfileAccount[]> {
    if (!canAccessAdmin(actorRole)) {
      return [];
    }

    return this.records;
  }

  async setProfileRole(actorRole: AccountRole | null, input: SetProfileRoleInput): Promise<void> {
    const target = this.records.find((record) => record.id === input.targetProfileId);

    if (!target) {
      throw new Error('Target profile not found.');
    }

    if (!canPromoteToRole(actorRole, input.role) && input.role !== 'member') {
      throw new Error('Insufficient role permission.');
    }

    if (target.isOwner && input.role !== 'admin') {
      throw new Error('Owner must remain an admin. Transfer ownership first.');
    }

    if (target.role === 'admin' && input.role !== 'admin') {
      const adminCount = this.records.filter((record) => record.role === 'admin').length;
      if (adminCount <= 1) {
        throw new Error('Cannot demote the last admin.');
      }
    }

    target.role = input.role;
  }

  async transferOwnership(actorIsOwner: boolean, input: TransferOwnershipInput): Promise<void> {
    if (!actorIsOwner) {
      throw new Error('Only the current owner can transfer ownership.');
    }

    const currentOwner = this.records.find((record) => record.isOwner);
    const nextOwner = this.records.find((record) => record.id === input.targetProfileId);

    if (!nextOwner) {
      throw new Error('Target profile not found.');
    }

    if (currentOwner) {
      currentOwner.isOwner = false;
      currentOwner.role = 'admin';
    }

    nextOwner.isOwner = true;
    nextOwner.role = 'admin';
  }
}
