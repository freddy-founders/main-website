@capability.auth-access
Feature: Private app access
  Approved active roles can enter member app surfaces while non-admins stay out of admin governance.

  Background:
    Given the Freddy Founders auth state is reset

  @auth @access @action.navigate-events @action.navigate-people @action.navigate-companies
  Scenario Outline: Approved active roles can enter member app surfaces
    Given an active approved "<role>" account exists for "person@example.com"
    When "person@example.com" opens "<route>"
    Then access is granted

    Examples:
      | role      | route      |
      | member    | /events    |
      | member    | /people    |
      | member    | /companies |
      | organizer | /events    |
      | organizer | /people    |
      | organizer | /companies |
      | admin     | /events    |
      | admin     | /people    |
      | admin     | /companies |

  @auth @access
  Scenario Outline: Admin governance is admin-only
    Given an active approved "<role>" account exists for "person@example.com"
    When "person@example.com" opens "/admin"
    Then access is "<access>"

    Examples:
      | role      | access  |
      | member    | denied  |
      | organizer | denied  |
      | admin     | granted |
