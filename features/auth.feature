Feature: Private community auth surfaces
  Freddy Founders is a private community of Atlantic Canadian founders.

  Scenario: Visitor cannot enter the app without logging in
    Given the app is private
    When a visitor opens the private app route "/events"
    Then login is required

  Scenario: Founder application creates a pending company-bound request
    Given the app is private
    When a founder applies for access with company website "https://newco.example"
    Then an admin sees a pending founder request for domain "newco.example"

  Scenario: Non-founders cannot apply for access
    Given the app is private
    When a non-founder tries to apply for access with company website "https://operator.example"
    Then the application request is rejected

  Scenario: Admin page is admin-only
    Given the app is private
    When an organizer asks for profile governance
    Then no profiles are returned

  Scenario: Only admins can create admins
    Given the app is private
    When an organizer tries to promote a member to admin
    Then the role change is rejected

  Scenario: Admins can review profile governance
    Given the app is private
    When an admin asks for profile governance
    Then profiles are returned for admin governance
