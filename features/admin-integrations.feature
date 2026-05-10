@capability.admin-integrations
Feature: Admin integrations
  Admins can inspect server-owned provider configuration for company intelligence.

  @action.navigate-admin-integrations
  Scenario: Admin can inspect Gemini API key setup
    Given Google AI API key configuration is present
    When an admin opens the integrations page
    Then Google AI validation is enabled through the server key

  Scenario: Admin sees deterministic fallback when Gemini API key is missing
    Given Google AI API key configuration is missing
    When an admin opens the integrations page
    Then deterministic website evidence remains the fallback