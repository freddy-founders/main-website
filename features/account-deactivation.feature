@capability.auth-access
Feature: Account deactivation
  Deactivated members lose private app access and password-login eligibility.

  Background:
    Given the Freddy Founders auth state is reset

  @auth @deactivation @action.deactivate-profile
  Scenario: Deactivated member loses access and login eligibility
    Given an active approved member account exists for "member@example.com"
    When an admin deactivates "member@example.com"
    Then "member@example.com" is deactivated
    And "member@example.com" cannot enter private app routes
    And "member@example.com" is not eligible for password login
    And "member@example.com" appears as deactivated in admin access state
