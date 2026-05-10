@capability.auth-access
Feature: Approved-member login
  Only approved active members can authenticate with email and password.

  Background:
    Given the Freddy Founders auth state is reset

  @auth @login @action.submit-login
  Scenario: Approved active member can log in with email and password
    Given an active approved member account exists for "member@example.com"
    When "member@example.com" logs in with password "member-password"
    Then a member session exists for "member@example.com"
    And the login response is authenticated

  @auth @login @action.submit-login
  Scenario Outline: Non-approved login requests never create access
    Given "<state>" exists for "visitor@example.com"
    When "visitor@example.com" logs in with password "member-password"
    Then no member session exists for "visitor@example.com"
    And the login response says the credentials are invalid
    And the invalid login notice is "Invalid email or password, or this account does not have access. Apply for access or reach out to an administrator."
    And no account is created by the login request for "visitor@example.com"

    Examples:
      | state                |
      | unknown email        |
      | pending application  |
      | archived application |
      | deactivated member   |

  @auth @password-reset @action.submit-login @action.complete-password-reset
  Scenario: Temporary password requires a new password before private access
    Given an active approved member account requiring password reset exists for "member@example.com"
    When "member@example.com" logs in with their temporary password
    Then the login response requires password reset
    And "member@example.com" can open the password reset route
    And "member@example.com" cannot enter private app routes
    When "member@example.com" completes the password reset with "new-member-password"
    Then password reset is no longer required for "member@example.com"
    And "member@example.com" can enter private app routes

  @auth @password-reset @action.reset-member-password
  Scenario: Admin password reset issues a temporary password
    Given an active approved member account exists for "member@example.com"
    When an admin resets the password for "member@example.com"
    Then a temporary password is issued for "member@example.com"
    And password reset is required for "member@example.com"
