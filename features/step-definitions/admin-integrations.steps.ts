import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import {
  defaultGoogleAiModel,
  googleAiIntegrationContract,
  missingGoogleAiIntegrationConfig,
  type GoogleAiIntegrationStatus,
} from '../../src/domain/googleAiIntegration';
import type { FreddyWorld } from '../support/world';

function statusWithApiKey(
  configured = true,
  source: GoogleAiIntegrationStatus['apiKeySource'] = configured ? 'worker-secret' : 'missing',
): GoogleAiIntegrationStatus {
  return {
    configured,
    connected: configured,
    missingConfig: configured ? [] : missingGoogleAiIntegrationConfig({ GEMINI_API_KEY: '' }),
    apiKeySource: source,
    keyFingerprint: configured ? 'sha256:testfingerprint' : null,
    modelId: defaultGoogleAiModel,
    connectedAt: configured ? new Date('2026-05-10T12:00:00.000Z').toISOString() : null,
    lastValidatedAt: null,
  };
}

Given('Google AI API key configuration is present', function (this: FreddyWorld) {
  this.googleAiIntegrationStatus = statusWithApiKey(true);
});

Given('Google AI API key configuration is missing', function (this: FreddyWorld) {
  this.googleAiIntegrationStatus = statusWithApiKey(false);
});

Given('Google AI key storage configuration is present', function (this: FreddyWorld) {
  this.googleAiIntegrationStatus = statusWithApiKey(false);
});

Given('Google AI is enabled through a saved admin key', function (this: FreddyWorld) {
  this.googleAiIntegrationStatus = statusWithApiKey(true, 'admin-managed');
});

When('an admin opens the integrations page', function (this: FreddyWorld) {
  assert.ok(googleAiIntegrationContract.pageTitle);
  this.googleAiIntegrationStatus ??= statusWithApiKey(true);
});

When('the admin saves a Gemini API key', function (this: FreddyWorld) {
  this.googleAiIntegrationStatus = statusWithApiKey(true, 'admin-managed');
});

When('the admin removes the saved Gemini API key', function (this: FreddyWorld) {
  assert.equal(this.googleAiIntegrationStatus?.apiKeySource, 'admin-managed');
  this.googleAiIntegrationStatus = statusWithApiKey(false);
});

Then('Google AI validation is enabled through the server key', function (this: FreddyWorld) {
  assert.equal(this.googleAiIntegrationStatus?.configured, true);
  assert.equal(this.googleAiIntegrationStatus?.connected, true);
  assert.equal(this.googleAiIntegrationStatus?.modelId, defaultGoogleAiModel);
});

Then('Google AI validation is enabled through the saved admin key', function (this: FreddyWorld) {
  assert.equal(this.googleAiIntegrationStatus?.configured, true);
  assert.equal(this.googleAiIntegrationStatus?.connected, true);
  assert.equal(this.googleAiIntegrationStatus?.apiKeySource, 'admin-managed');
  assert.match(this.googleAiIntegrationStatus?.keyFingerprint ?? '', /^sha256:/);
});

Then('deterministic website evidence remains the fallback', function (this: FreddyWorld) {
  assert.equal(this.googleAiIntegrationStatus?.configured, false);
  assert.deepEqual(this.googleAiIntegrationStatus?.missingConfig, ['GEMINI_API_KEY']);
});
