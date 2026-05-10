export const googleAiIntegrationProvider = 'google_vertex_ai' as const;
export const defaultGoogleAiLocation = 'global';
export const defaultGoogleAiModel = 'gemini-2.5-flash';

export const googleAiIntegrationContract = {
  pageTitle: 'Google AI Integration',
  pageEyebrow: 'Admin Only',
  statusTitle: 'Company Intelligence',
  connectTitle: 'Connect Google AI',
  disconnectTitle: 'Disconnect Google AI',
  projectIdLabel: 'Google Cloud project ID',
  locationLabel: 'Vertex AI location',
  modelLabel: 'Gemini model',
  connectActionLabel: 'Connect Google AI',
  disconnectActionLabel: 'Disconnect Google AI',
  connectedCopy:
    'Google AI is connected for server-side company website validation and enrichment.',
  disconnectedCopy:
    'Google AI is not connected. Freddy Founders will keep using deterministic website evidence until an admin connects Google AI.',
  missingConfigCopy:
    'Worker Google OAuth configuration is incomplete. Set the required Cloudflare secrets before connecting Google AI.',
} as const;

export type GoogleAiIntegrationConfigKey =
  | 'GOOGLE_OAUTH_CLIENT_ID'
  | 'GOOGLE_OAUTH_CLIENT_SECRET'
  | 'INTEGRATION_TOKEN_ENCRYPTION_KEY';

export type GoogleAiIntegrationStatus = {
  configured: boolean;
  connected: boolean;
  missingConfig: GoogleAiIntegrationConfigKey[];
  googleAccountEmail: string | null;
  googleCloudProjectId: string | null;
  googleCloudLocation: string;
  modelId: string;
  connectedAt: string | null;
  lastValidatedAt: string | null;
};

export type StartGoogleAiIntegrationInput = {
  googleCloudProjectId: string;
  googleCloudLocation?: string;
  modelId?: string;
};

export type StartGoogleAiIntegrationResult = {
  authorizationUrl: string;
};

const requiredGoogleAiIntegrationConfigKeys = [
  'GOOGLE_OAUTH_CLIENT_ID',
  'GOOGLE_OAUTH_CLIENT_SECRET',
  'INTEGRATION_TOKEN_ENCRYPTION_KEY',
] as const satisfies readonly GoogleAiIntegrationConfigKey[];

export function missingGoogleAiIntegrationConfig(
  env: Partial<Record<GoogleAiIntegrationConfigKey, string | undefined>>,
): GoogleAiIntegrationConfigKey[] {
  return requiredGoogleAiIntegrationConfigKeys.filter((key) => !hasValue(env[key]));
}

export function normalizeGoogleCloudProjectId(value: string): string {
  const normalized = value.trim().toLowerCase();

  if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(normalized)) {
    throw new Error('Google Cloud project ID must be 6-30 lowercase letters, digits, or hyphens.');
  }

  return normalized;
}

export function normalizeGoogleCloudLocation(value: string | undefined): string {
  const normalized = (value ?? defaultGoogleAiLocation).trim().toLowerCase();

  if (!/^(global|[a-z]+-[a-z]+\d+)$/.test(normalized)) {
    throw new Error('Vertex AI location must be global or a region such as us-central1.');
  }

  return normalized;
}

export function normalizeGoogleAiModelId(value: string | undefined): string {
  const normalized = (value ?? defaultGoogleAiModel).trim();

  if (!/^gemini-[a-z0-9.-]+$/.test(normalized)) {
    throw new Error('Google AI model must be a Gemini model ID.');
  }

  return normalized;
}

export function buildGoogleAiIntegrationStatusCopy(status: GoogleAiIntegrationStatus): string {
  if (!status.configured) return googleAiIntegrationContract.missingConfigCopy;
  if (!status.connected) return googleAiIntegrationContract.disconnectedCopy;
  return googleAiIntegrationContract.connectedCopy;
}

function hasValue(value: string | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}
