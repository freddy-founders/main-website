@capability.member-directory
Feature: Private companies directory
  Companies is a member-visible YC-style directory, not a public vendor marketplace.

  @action.navigate-companies
  Scenario: Member can browse company rows
    Given the app is private
    And an approved member is logged in
    When the member lists companies
    Then the member sees company directory rows
