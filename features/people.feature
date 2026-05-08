Feature: Private people directory
  People is a member-visible Bookface-like directory, not a public social feed.

  Scenario: Member sees only consented people
    Given the app is private
    And an approved member is logged in
    When the member lists people
    Then only consented people are returned
