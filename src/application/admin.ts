import { applicationServices } from './container';
import { getCurrentSession } from './auth';
import type {
  GoogleAiIntegrationStatus,
  StartGoogleAiIntegrationInput,
  StartGoogleAiIntegrationResult,
} from '../domain/googleAiIntegration';
export { canAccessAdmin } from '../domain/accounts';

export type TemporaryPasswordResponse = {
  temporaryPassword: string;
};

export const listPendingRegistrationRequests =
  applicationServices.admin.listPendingRegistrationRequests;
export const listProfiles = applicationServices.admin.listProfiles;
export const setProfileRole = applicationServices.admin.setProfileRole;
export const transferOwnership = applicationServices.admin.transferOwnership;

export async function approveRegistrationRequest(
  requestId: string,
): Promise<TemporaryPasswordResponse> {
  return adminApiPost<TemporaryPasswordResponse>(
    `/api/admin/registration-requests/${requestId}/approve`,
  );
}

export async function archiveRegistrationRequest(requestId: string): Promise<void> {
  await adminApiPost(`/api/admin/registration-requests/${requestId}/archive`);
}

export async function deactivateProfile(profileId: string): Promise<void> {
  await adminApiPost(`/api/admin/profiles/${profileId}/deactivate`);
}

export async function resetProfilePassword(profileId: string): Promise<TemporaryPasswordResponse> {
  return adminApiPost<TemporaryPasswordResponse>(`/api/admin/profiles/${profileId}/reset-password`);
}

export async function getGoogleAiIntegrationStatus(): Promise<GoogleAiIntegrationStatus> {
  return adminApiGet<GoogleAiIntegrationStatus>('/api/admin/integrations/google-ai');
}

export async function startGoogleAiIntegration(
  input: StartGoogleAiIntegrationInput,
): Promise<StartGoogleAiIntegrationResult> {
  return adminApiPost<StartGoogleAiIntegrationResult>(
    '/api/admin/integrations/google-ai/oauth/start',
    input,
  );
}

export async function disconnectGoogleAiIntegration(): Promise<void> {
  await adminApiPost('/api/admin/integrations/google-ai/disconnect');
}

async function adminApiPost<T = void>(path: string, body?: unknown): Promise<T> {
  const session = await getCurrentSession();

  if (!session?.accessToken) {
    throw new Error('Admin session token is required.');
  }

  const headers: Record<string, string> = {
    authorization: `Bearer ${session.accessToken}`,
  };

  if (body !== undefined) {
    headers['content-type'] = 'application/json';
  }

  const response = await fetch(path, {
    method: 'POST',
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error ?? `Admin API request failed with ${response.status}.`);
  }

  return (payload ?? undefined) as T;
}

async function adminApiGet<T>(path: string): Promise<T> {
  const session = await getCurrentSession();

  if (!session?.accessToken) {
    throw new Error('Admin session token is required.');
  }

  const response = await fetch(path, {
    method: 'GET',
    headers: {
      authorization: `Bearer ${session.accessToken}`,
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error ?? `Admin API request failed with ${response.status}.`);
  }

  return payload as T;
}
