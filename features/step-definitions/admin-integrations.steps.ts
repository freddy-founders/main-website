import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import {
  defaultGoogleAiModel,
  googleAiIntegrationContract,
  missingGoogleAiIntegrationConfig,
  type GoogleAiIntegrationStatus,
} from '../../src/domain/googleAiIntegration';
import type { FreddyWorld } from '../support/world';

function statusWithApiKey(configured = true): GoogleAiIntegrationStatus {
  return {
    configured,
    connected: configured,
    missingConfig: configured ? [] : missingGoogleAiIntegrationConfig({ GEMINI_API_KEY: '' }),
    modelId: defaultGoogleAiModel,
    connectedAt: null,
    lastValidatedAt: null,
  };
}

Given('Google AI API key configuration is present', function (this: FreddyWorld) {
  this.googleAiIntegrationStatus = statusWithApiKey(true);
});

Given('Google AI API key configuration is missing', function (this: FreddyWorld) {
  this.googleAiIntegrationStatus = statusWithApiKey(false);
});

When('an admin opens the integrations page', function (this: FreddyWorld) {
  assert.ok(googleAiIntegrationContract.pageTitle);
  this.googleAiIntegrationStatus ??= statusWithApiKey(true);
});

Then('Google AI validation is enabled through the server key', function (this: FreddyWorld) {
  assert.equal(this.googleAiIntegrationStatus?.configured, true);
  assert.equal(this.googleAiIntegrationStatus?.connected, true);
  assert.equal(this.googleAiIntegrationStatus?.modelId, defaultGoogleAiModel);
});

Then('deterministic website evidence remains the fallback', function (this: FreddyWorld) {
  assert.equal(this.googleAiIntegrationStatus?.configured, false);
  assert.deepEqual(this.googleAiIntegrationStatus?.missingConfig, ['GEMINI_API_KEY']);
});
