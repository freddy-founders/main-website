@capability.auth-access @capability.admin-governance
Feature: Access audit trail
  Access-changing actions leave reviewable state and audit evidence.

  Background:
    Given the Freddy Founders auth state is reset

  @auth @audit
  Scenario: Admin can see the current access state
    Given a pending application exists for "pending@example.com"
    And an archived application exists for "archived@example.com"
    And an active approved member account exists for "member@example.com"
    When an admin reviews the access state
    Then pending applications are visible
    And approved members are visible
    And member roles are visible
    And application history is visible

  @auth @audit @action.approve-registration-request @action.archive-registration-request @action.promote-organizer @action.promote-admin @action.demote-member @action.submit-login @action.reset-member-password
  Scenario Outline: Access-changing actions create audit entries
    Given the auth audit log is empty
    When an admin performs the audit action "<action>" for "target@example.com"
    Then an audit entry exists for "<action>" on "target@example.com"
    And the audit entry includes actor, target, action, and timestamp

    Examples:
      | action                |
      | approve               |
      | archive               |
      | role change           |
      | password login        |
      | password reset issued |
