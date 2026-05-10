@capability.admin-integrations
Feature: Admin integrations
  Admins can connect app-owned provider integrations for server-side company intelligence.

  @action.navigate-admin-integrations @action.connect-google-ai-integration
  Scenario: Admin can start Google AI OAuth setup
    Given Google AI integration configuration is present
    When an admin opens the integrations page
    And the admin starts Google AI OAuth setup for project "freddy-founders-123"
    Then a Google authorization URL is created

  @action.disconnect-google-ai-integration
  Scenario: Admin can disconnect Google AI
    Given Google AI is connected for project "freddy-founders-123"
    When the admin disconnects Google AI
    Then Google AI is no longer connected
