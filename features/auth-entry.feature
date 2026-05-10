@capability.auth-access
Feature: Public auth entry
  Freddy Founders keeps login and application entry public while private app routes stay gated.

  Background:
    Given the Freddy Founders auth state is reset

  @auth @boundary @action.navigate-login @action.navigate-register
  Scenario Outline: Public auth entry routes are reachable outside the private app shell
    When an anonymous visitor opens "<route>"
    Then the route is public
    And the route renders outside the private app shell

    Examples:
      | route     |
      | /login    |
      | /register |

  @auth @boundary
  Scenario Outline: Anonymous visitors cannot enter private app routes
    When an anonymous visitor opens "<route>"
    Then login is required

    Examples:
      | route      |
      | /events    |
      | /people    |
      | /companies |
      | /admin     |
