Feature: Public people directory
  People is a public-safe Bookface-like directory, not a social feed.

  Scenario: Visitor sees only consented public people
    Given public browsing is open
    When a visitor lists public people
    Then only consented public people are returned
