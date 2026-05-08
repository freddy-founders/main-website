Feature: Public events
  Events are the public front page for Freddy Founders.

  Scenario: Visitor can browse events and register externally
    Given public browsing is open
    When a visitor lists public events
    Then the visitor sees at least one event without signing in
    And an event can expose an external registration action
