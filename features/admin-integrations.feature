@capability.admin-integrations
Feature: Admin integrations
  Admins can inspect and manage server-owned provider configuration for company intelligence.

  @action.navigate-admin-integrations
  Scenario: Admin can inspect Gemini API key setup
    Given Google AI API key configuration is present
    When an admin opens the integrations page
    Then Google AI validation is enabled through the server key

  @action.save-google-ai-api-key
  Scenario: Admin can save a Gemini API key
    Given Google AI key storage configuration is present
    When an admin opens the integrations page
    And the admin saves a Gemini API key
    Then Google AI validation is enabled through the saved admin key

  @action.remove-google-ai-api-key
  Scenario: Admin can remove a saved Gemini API key
    Given Google AI is enabled through a saved admin key
    When the admin removes the saved Gemini API key
    Then deterministic website evidence remains the fallback

  Scenario: Admin sees deterministic fallback when Gemini API key is missing
    Given Google AI API key configuration is missing
    When an admin opens the integrations page
    Then deterministic website evidence remains the fallback