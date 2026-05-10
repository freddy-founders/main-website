@capability.admin-governance
Feature: Admin governance
  Admin governance enforces role permissions and singleton-owner invariants.

  Background:
    Given the Freddy Founders auth state is reset

  @auth @permissions
  Scenario Outline: Member permissions are read-only plus RSVP
    When a "member" attempts to "<action>"
    Then permission is "<permission>"

    Examples:
      | action         | permission |
      | read events    | granted    |
      | read people    | granted    |
      | read companies | granted    |
      | RSVP           | granted    |
      | create events  | denied     |
      | edit events    | denied     |
      | delete events  | denied     |
      | change roles   | denied     |

  @auth @permissions
  Scenario Outline: Organizer permissions are event operations without governance
    When an "organizer" attempts to "<action>"
    Then permission is "<permission>"

    Examples:
      | action               | permission |
      | read events          | granted    |
      | read people          | granted    |
      | read companies       | granted    |
      | RSVP                 | granted    |
      | create events        | granted    |
      | edit events          | granted    |
      | delete events        | granted    |
      | approve applications | denied     |
      | archive applications | denied     |
      | create admins        | denied     |
      | enter admin          | denied     |

  @auth @permissions @action.approve-registration-request @action.archive-registration-request @action.promote-organizer @action.promote-admin @action.demote-member @action.deactivate-profile
  Scenario Outline: Admin permissions include content CRUD and access governance
    When an "admin" attempts to "<action>"
    Then permission is "granted"

    Examples:
      | action               |
      | read events          |
      | read people          |
      | read companies       |
      | RSVP                 |
      | create events        |
      | edit events          |
      | delete events        |
      | create people        |
      | edit people          |
      | delete people        |
      | create companies     |
      | edit companies       |
      | delete companies     |
      | approve applications |
      | archive applications |
      | create admins        |
      | deactivate members   |
      | enter admin          |

  @auth @owner
  Scenario: Owner is an admin with all admin permissions
    Given "owner@example.com" is the owner admin
    Then "owner@example.com" has role "admin"
    And "owner@example.com" has all admin permissions

  @auth @owner @action.demote-member
  Scenario: Owner cannot self-demote before transferring ownership
    Given "owner@example.com" is the owner admin
    When "owner@example.com" attempts to demote themselves to "member"
    Then the role change is rejected
    And "owner@example.com" remains the owner admin

  @auth @owner
  Scenario: Ownership transfer keeps the previous owner as an admin
    Given "owner@example.com" is the owner admin
    And an active approved admin account exists for "next-owner@example.com"
    When "owner@example.com" transfers ownership to "next-owner@example.com"
    Then "next-owner@example.com" is recorded as the owner admin
    And "owner@example.com" has role "admin"
    And "owner@example.com" is not the owner
