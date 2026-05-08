Feature: Lightweight auth surfaces
  Login and registration exist without creating a public browsing wall.

  Scenario: Visitor cannot see admin registration review data
    Given public browsing is open
    When a visitor asks for pending registration requests
    Then no pending registration requests are returned

  Scenario: Founder signup creates a pending company-bound registration request
    Given public browsing is open
    When a founder requests access for company website "https://newco.example"
    Then an admin sees a pending founder request for domain "newco.example"

  Scenario: Non-founders cannot request access
    Given public browsing is open
    When a non-founder tries to request access for company website "https://operator.example"
    Then the signup request is rejected
