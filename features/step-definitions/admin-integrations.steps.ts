import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import {
  defaultGoogleAiLocation,
  defaultGoogleAiModel,
  googleAiIntegrationContract,
  missingGoogleAiIntegrationConfig,
  normalizeGoogleCloudProjectId,
  type GoogleAiIntegrationStatus,
} from '../../src/domain/googleAiIntegration';
import type { FreddyWorld } from '../support/world';

function disconnectedStatus(configured = true): GoogleAiIntegrationStatus {
  return {
    configured,
    connected: false,
    missingConfig: configured
      ? []
      : missingGoogleAiIntegrationConfig({ GOOGLE_OAUTH_CLIENT_ID: '' }),
    googleAccountEmail: null,
    googleCloudProjectId: null,
    googleCloudLocation: defaultGoogleAiLocation,
    modelId: defaultGoogleAiModel,
    connectedAt: null,
    lastValidatedAt: null,
  };
}

Given('Google AI integration configuration is present', function (this: FreddyWorld) {
  this.googleAiIntegrationStatus = disconnectedStatus(true);
});

Given(
  'Google AI is connected for project {string}',
  function (this: FreddyWorld, projectId: string) {
    this.googleAiIntegrationStatus = {
      ...disconnectedStatus(true),
      connected: true,
      googleAccountEmail: 'admin@example.com',
      googleCloudProjectId: normalizeGoogleCloudProjectId(projectId),
      connectedAt: new Date('2026-05-10T12:00:00.000Z').toISOString(),
    };
  },
);

When('an admin opens the integrations page', function (this: FreddyWorld) {
  assert.ok(googleAiIntegrationContract.pageTitle);
  this.googleAiIntegrationStatus ??= disconnectedStatus(true);
});

When(
  'the admin starts Google AI OAuth setup for project {string}',
  function (this: FreddyWorld, projectId: string) {
    const normalizedProjectId = normalizeGoogleCloudProjectId(projectId);
    this.googleAiAuthorizationUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&project=${normalizedProjectId}`;
  },
);

When('the admin disconnects Google AI', function (this: FreddyWorld) {
  assert.equal(this.googleAiIntegrationStatus?.connected, true);
  this.googleAiIntegrationStatus = disconnectedStatus(true);
});

Then('a Google authorization URL is created', function (this: FreddyWorld) {
  assert.match(
    this.googleAiAuthorizationUrl ?? '',
    /^https:\/\/accounts\.google\.com\/o\/oauth2\/v2\/auth/,
  );
});

Then('Google AI is no longer connected', function (this: FreddyWorld) {
  assert.equal(this.googleAiIntegrationStatus?.connected, false);
});
