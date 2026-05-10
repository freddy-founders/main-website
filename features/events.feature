@capability.member-events
Feature: Private events
  Events are a private app surface for approved Freddy Founders members.

  @action.navigate-events @action.register-external-event
  Scenario: Member can browse events and register externally
    Given the app is private
    And an approved member is logged in
    When the member lists events
    Then the member sees at least one event
    And an event can expose an external registration action
