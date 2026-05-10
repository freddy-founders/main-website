export const defaultGoogleAiModel = 'gemini-2.5-flash';

export const googleAiIntegrationContract = {
  pageTitle: 'Google AI Integration',
  pageEyebrow: 'Admin Only',
  statusTitle: 'Company Intelligence',
  setupTitle: 'Gemini API Key',
  modelLabel: 'Gemini model',
  configuredCopy:
    'Google AI is configured through a server-side Gemini API key for company website validation and enrichment.',
  disconnectedCopy:
    'Google AI is not configured. Freddy Founders will keep using deterministic website evidence until GEMINI_API_KEY is set.',
  missingConfigCopy:
    'Worker Gemini API key configuration is incomplete. Set GEMINI_API_KEY as a Cloudflare secret before using Google AI.',
} as const;

export type GoogleAiIntegrationConfigKey = 'GEMINI_API_KEY';

export type GoogleAiIntegrationStatus = {
  configured: boolean;
  connected: boolean;
  missingConfig: GoogleAiIntegrationConfigKey[];
  modelId: string;
  connectedAt: string | null;
  lastValidatedAt: string | null;
};

const requiredGoogleAiIntegrationConfigKeys = [
  'GEMINI_API_KEY',
] as const satisfies readonly GoogleAiIntegrationConfigKey[];

export function missingGoogleAiIntegrationConfig(
  env: Partial<Record<GoogleAiIntegrationConfigKey, string | undefined>>,
): GoogleAiIntegrationConfigKey[] {
  return requiredGoogleAiIntegrationConfigKeys.filter((key) => !hasValue(env[key]));
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
  return googleAiIntegrationContract.configuredCopy;
}

function hasValue(value: string | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}
