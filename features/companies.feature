Feature: Public companies directory
  Companies is a compact YC-style directory, not a vendor marketplace.

  Scenario: Visitor can browse public company rows
    Given public browsing is open
    When a visitor lists public companies
    Then the visitor sees public company directory rows
