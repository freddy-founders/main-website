import { describe, expect, it } from 'vitest';
import {
  buildGoogleAiIntegrationStatusCopy,
  googleAiIntegrationContract,
  missingGoogleAiIntegrationConfig,
  normalizeGeminiApiKey,
  normalizeGoogleAiModelId,
  type GoogleAiIntegrationStatus,
} from './googleAiIntegration';

const baseStatus: GoogleAiIntegrationStatus = {
  configured: true,
  connected: true,
  missingConfig: [],
  apiKeySource: 'admin-managed',
  keyFingerprint: 'sha256:example',
  modelId: 'gemini-2.5-flash',
  connectedAt: null,
  lastValidatedAt: null,
};

describe('Google AI integration contract', () => {
  it('defaults and validates Gemini model IDs', () => {
    expect(normalizeGoogleAiModelId(undefined)).toBe('gemini-2.5-flash');
    expect(normalizeGoogleAiModelId('gemini-3-flash')).toBe('gemini-3-flash');
    expect(() => normalizeGoogleAiModelId('claude-4')).toThrow(/Gemini/);
  });

  it('reports missing server-side Gemini API key or key-storage config', () => {
    expect(missingGoogleAiIntegrationConfig({ GEMINI_API_KEY: '' })).toEqual(['GEMINI_API_KEY']);
    expect(
      missingGoogleAiIntegrationConfig({ INTEGRATION_SECRET_ENCRYPTION_KEY: '' }, true),
    ).toEqual(['INTEGRATION_SECRET_ENCRYPTION_KEY']);
    expect(missingGoogleAiIntegrationConfig({ GEMINI_API_KEY: 'secret-key' })).toEqual([]);
    expect(
      missingGoogleAiIntegrationConfig({ INTEGRATION_SECRET_ENCRYPTION_KEY: 'secret-key' }, true),
    ).toEqual([]);
  });

  it('normalizes Gemini API keys without allowing whitespace or blanks', () => {
    expect(normalizeGeminiApiKey('  gemini_test_key_value_12345  ')).toBe(
      'gemini_test_key_value_12345',
    );
    expect(() => normalizeGeminiApiKey('short')).toThrow(/Gemini API key/);
    expect(() => normalizeGeminiApiKey('AIza Sy Example Key')).toThrow(/Gemini API key/);
  });

  it('summarizes configured and missing configuration states', () => {
    expect(buildGoogleAiIntegrationStatusCopy(baseStatus)).toBe(
      googleAiIntegrationContract.configuredCopy,
    );
    expect(buildGoogleAiIntegrationStatusCopy({ ...baseStatus, configured: false })).toBe(
      googleAiIntegrationContract.disconnectedCopy,
    );
  });
});
