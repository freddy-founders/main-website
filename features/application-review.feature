@capability.auth-access
Feature: Admin application review
  Admin review turns pending applications into member access or archives them silently.

  Background:
    Given the Freddy Founders auth state is reset

  @auth @approval @action.approve-registration-request
  Scenario: Admin approval creates member access without logging the applicant in
    Given a pending application exists for "founder@example.com"
    When an admin approves the application for "founder@example.com"
    Then the application for "founder@example.com" is approved
    And the approved member account for "founder@example.com" is active
    And the account role for "founder@example.com" is "member"
    And an approval notice is sent to "founder@example.com"
    And the approval notice contains the normal login URL "https://freddyfounders.com/login"
    And the approval notice contains a temporary password
    And password reset is required for "founder@example.com"
    And no session exists for "founder@example.com"

  @auth @approval @action.archive-registration-request
  Scenario: Admin archives an application without notifying the applicant
    Given a pending application exists for "founder@example.com"
    When an admin archives the application for "founder@example.com"
    Then the application for "founder@example.com" is archived
    And the application for "founder@example.com" is not in the active pending queue
    And the application remains in history for "founder@example.com"
    And no applicant notification is sent to "founder@example.com"
