import { describe, expect, it } from 'vitest';
import {
  buildGoogleAiIntegrationStatusCopy,
  googleAiIntegrationContract,
  missingGoogleAiIntegrationConfig,
  normalizeGoogleAiModelId,
  normalizeGoogleCloudLocation,
  normalizeGoogleCloudProjectId,
  type GoogleAiIntegrationStatus,
} from './googleAiIntegration';

const baseStatus: GoogleAiIntegrationStatus = {
  configured: true,
  connected: false,
  missingConfig: [],
  googleAccountEmail: null,
  googleCloudProjectId: null,
  googleCloudLocation: 'global',
  modelId: 'gemini-2.5-flash',
  connectedAt: null,
  lastValidatedAt: null,
};

describe('Google AI integration contract', () => {
  it('normalizes Google Cloud project IDs for OAuth setup', () => {
    expect(normalizeGoogleCloudProjectId(' Freddy-Founders-123 ')).toBe('freddy-founders-123');
  });

  it('rejects invalid Google Cloud project IDs', () => {
    expect(() => normalizeGoogleCloudProjectId('123-invalid')).toThrow(/project ID/);
    expect(() => normalizeGoogleCloudProjectId('freddy_underscore')).toThrow(/project ID/);
  });

  it('defaults and validates Vertex AI locations', () => {
    expect(normalizeGoogleCloudLocation(undefined)).toBe('global');
    expect(normalizeGoogleCloudLocation(' us-central1 ')).toBe('us-central1');
    expect(() => normalizeGoogleCloudLocation('fredericton')).toThrow(/location/);
  });

  it('defaults and validates Gemini model IDs', () => {
    expect(normalizeGoogleAiModelId(undefined)).toBe('gemini-2.5-flash');
    expect(normalizeGoogleAiModelId('gemini-3-flash')).toBe('gemini-3-flash');
    expect(() => normalizeGoogleAiModelId('claude-4')).toThrow(/Gemini/);
  });

  it('reports missing server-side OAuth and encryption config', () => {
    expect(
      missingGoogleAiIntegrationConfig({
        GOOGLE_OAUTH_CLIENT_ID: 'client-id',
        GOOGLE_OAUTH_CLIENT_SECRET: '',
      }),
    ).toEqual(['GOOGLE_OAUTH_CLIENT_SECRET', 'INTEGRATION_TOKEN_ENCRYPTION_KEY']);
  });

  it('summarizes configured, connected, and disconnected states', () => {
    expect(buildGoogleAiIntegrationStatusCopy(baseStatus)).toBe(
      googleAiIntegrationContract.disconnectedCopy,
    );
    expect(buildGoogleAiIntegrationStatusCopy({ ...baseStatus, configured: false })).toBe(
      googleAiIntegrationContract.missingConfigCopy,
    );
    expect(buildGoogleAiIntegrationStatusCopy({ ...baseStatus, connected: true })).toBe(
      googleAiIntegrationContract.connectedCopy,
    );
  });
});
