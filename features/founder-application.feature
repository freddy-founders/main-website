@capability.auth-access
Feature: Founder application intake
  Applying for access creates pending founder/company requests only after required trust checks pass.

  Background:
    Given the Freddy Founders auth state is reset

  @auth @application @action.submit-application
  Scenario: Complete founder application creates only a pending application
    When "founder@example.com" submits a complete founder application
    Then an application for "founder@example.com" is pending
    And no usable account exists for "founder@example.com"
    And no session exists for "founder@example.com"
    And "founder@example.com" is not eligible for password login

  @auth @application @action.submit-application
  Scenario Outline: Required application fields must be present
    When "founder@example.com" submits an application missing "<field>"
    Then the application is rejected before becoming pending
    And no usable account exists for "founder@example.com"

    Examples:
      | field           |
      | name            |
      | email           |
      | company website |
      | Town/City       |

  @auth @application @action.submit-application
  Scenario: Founder affirmation is required
    When "founder@example.com" submits an application without founder affirmation
    Then the application is rejected before becoming pending
    And no usable account exists for "founder@example.com"

  @auth @application @action.submit-application
  Scenario: Public directory consent is hidden and defaults off
    When "founder@example.com" submits a complete founder application
    Then an application for "founder@example.com" is pending
    And the application records public directory consent as false

  @auth @application @action.submit-application
  Scenario: Company website metadata scrape must succeed before deterministic business validation
    When "founder@example.com" submits an application whose company website cannot be scraped
    Then the application is rejected before becoming pending
    And no fallback company name is derived from the submitted domain

  @auth @application @action.submit-application
  Scenario: Scrapeable metadata alone is not enough to accept an application
    When "founder@example.com" submits an application whose company website scrapes but cannot be validated as a business
    Then the application is rejected before becoming pending
    And no pending application is created without business validation

  @auth @application @action.submit-application
  Scenario: Deterministic business validation permits a scraped website to become a pending application
    When "founder@example.com" submits an application whose company website scrapes and validates as a business
    Then an application for "founder@example.com" is pending

  @auth @pages
  Scenario: Register page uses the compact approval application contract
    Then the register form requires name, email, company website, Town/City, and founder affirmation
    And the register form does not ask for company name
    And the register form does not ask for public directory consent
    And the founder affirmation copy is "I am a founder of this company"
    And the Town/City dropdown for "fred" includes "Fredericton, NB"
    And the Town/City search Enter key for "Fredericton" selects "Fredericton, NB"
    And "Fredericton" is not accepted as a final Town/City value

  @auth @pages
  Scenario: Auth form inputs preserve typed casing
    Then auth text inputs preserve typed casing

  @auth @reapplication @action.submit-application
  Scenario: Pending email cannot create a second active application
    Given a pending application exists for "founder@example.com"
    When "founder@example.com" submits a complete founder application
    Then only one active pending application exists for "founder@example.com"
    And the second application is blocked

  @auth @reapplication @action.submit-application
  Scenario: Archived applicant can submit a fresh application
    Given an archived application exists for "founder@example.com"
    When "founder@example.com" submits a complete founder application
    Then an application for "founder@example.com" is pending
    And the archived application remains in history for "founder@example.com"

  @auth @reapplication @action.submit-application
  Scenario: Approved member cannot apply again
    Given an active approved member account exists for "founder@example.com"
    When "founder@example.com" submits a complete founder application
    Then the application is rejected before becoming pending
    And the existing approved account remains active for "founder@example.com"

  @auth @reapplication @action.submit-application
  Scenario: Deactivated former member is not treated as a fresh applicant
    Given a deactivated member account exists for "founder@example.com"
    When "founder@example.com" submits a complete founder application
    Then the request is flagged as a deactivated former member request
    And no fresh pending application is created for "founder@example.com"
