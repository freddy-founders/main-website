export const defaultGoogleAiModel = 'gemini-2.5-flash';

export const googleAiIntegrationContract = {
  pageTitle: 'Google AI Integration',
  pageEyebrow: 'Admin Only',
  statusTitle: 'Company Intelligence',
  setupTitle: 'Gemini API Key',
  modelLabel: 'Gemini model',
  apiKeyLabel: 'Gemini API key',
  saveActionLabel: 'Save Gemini API key',
  removeActionLabel: 'Remove saved key',
  configuredCopy:
    'Google AI is configured through a server-side Gemini API key for company website validation and enrichment.',
  disconnectedCopy:
    'Google AI is not configured. Freddy Founders will keep using deterministic website evidence until an admin saves a Gemini API key or GEMINI_API_KEY is set.',
  missingConfigCopy:
    'Google AI key storage is incomplete. Set INTEGRATION_SECRET_ENCRYPTION_KEY before saving keys from the admin page, or set GEMINI_API_KEY as a Cloudflare secret.',
} as const;

export type GoogleAiIntegrationConfigKey = 'GEMINI_API_KEY' | 'INTEGRATION_SECRET_ENCRYPTION_KEY';

export type GoogleAiApiKeySource = 'admin-managed' | 'worker-secret' | 'missing';

export type GoogleAiIntegrationStatus = {
  configured: boolean;
  connected: boolean;
  missingConfig: GoogleAiIntegrationConfigKey[];
  apiKeySource: GoogleAiApiKeySource;
  keyFingerprint: string | null;
  modelId: string;
  connectedAt: string | null;
  lastValidatedAt: string | null;
};

export type SaveGoogleAiApiKeyInput = {
  apiKey: string;
  modelId?: string;
};

export function missingGoogleAiIntegrationConfig(
  env: Partial<Record<GoogleAiIntegrationConfigKey, string | undefined>>,
  hasSavedApiKey = false,
): GoogleAiIntegrationConfigKey[] {
  const missing: GoogleAiIntegrationConfigKey[] = [];

  if (!hasValue(env.GEMINI_API_KEY) && !hasSavedApiKey) {
    missing.push('GEMINI_API_KEY');
  }

  if (hasSavedApiKey && !hasValue(env.INTEGRATION_SECRET_ENCRYPTION_KEY)) {
    missing.push('INTEGRATION_SECRET_ENCRYPTION_KEY');
  }

  return missing;
}

export function normalizeGeminiApiKey(value: string): string {
  const normalized = value.trim();

  if (normalized.length < 20 || /\s/.test(normalized)) {
    throw new Error('Gemini API key must be a single non-empty key value.');
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
  if (!status.configured) return googleAiIntegrationContract.disconnectedCopy;
  return googleAiIntegrationContract.configuredCopy;
}

function hasValue(value: string | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}
