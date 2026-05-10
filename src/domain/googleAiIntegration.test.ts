import { describe, expect, it } from 'vitest';
import {
  buildGoogleAiIntegrationStatusCopy,
  googleAiIntegrationContract,
  missingGoogleAiIntegrationConfig,
  normalizeGoogleAiModelId,
  type GoogleAiIntegrationStatus,
} from './googleAiIntegration';

const baseStatus: GoogleAiIntegrationStatus = {
  configured: true,
  connected: true,
  missingConfig: [],
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

  it('reports missing server-side Gemini API key config', () => {
    expect(missingGoogleAiIntegrationConfig({ GEMINI_API_KEY: '' })).toEqual(['GEMINI_API_KEY']);
    expect(missingGoogleAiIntegrationConfig({ GEMINI_API_KEY: 'secret-key' })).toEqual([]);
  });

  it('summarizes configured and missing configuration states', () => {
    expect(buildGoogleAiIntegrationStatusCopy(baseStatus)).toBe(
      googleAiIntegrationContract.configuredCopy,
    );
    expect(buildGoogleAiIntegrationStatusCopy({ ...baseStatus, configured: false })).toBe(
      googleAiIntegrationContract.missingConfigCopy,
    );
  });
});
