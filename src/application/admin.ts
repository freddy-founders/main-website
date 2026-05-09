import { applicationServices } from './container';
import { getCurrentSession } from './auth';
export { canAccessAdmin } from '../domain/accounts';

export const listPendingRegistrationRequests =
  applicationServices.admin.listPendingRegistrationRequests;
export const listProfiles = applicationServices.admin.listProfiles;
export const setProfileRole = applicationServices.admin.setProfileRole;
export const transferOwnership = applicationServices.admin.transferOwnership;

export async function approveRegistrationRequest(requestId: string): Promise<void> {
  await adminApiPost(`/api/admin/registration-requests/${requestId}/approve`);
}

export async function archiveRegistrationRequest(requestId: string): Promise<void> {
  await adminApiPost(`/api/admin/registration-requests/${requestId}/archive`);
}

export async function deactivateProfile(profileId: string): Promise<void> {
  await adminApiPost(`/api/admin/profiles/${profileId}/deactivate`);
}

async function adminApiPost(path: string): Promise<void> {
  const session = await getCurrentSession();

  if (!session?.accessToken) {
    throw new Error('Admin session token is required.');
  }

  const response = await fetch(path, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error ?? `Admin API request failed with ${response.status}.`);
  }
}
