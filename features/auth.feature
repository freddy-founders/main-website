Feature: Lightweight auth surfaces
  Login and registration exist without creating a public browsing wall.

  Scenario: Visitor cannot see admin registration review data
    Given public browsing is open
    When a visitor asks for pending registration requests
    Then no pending registration requests are returned
