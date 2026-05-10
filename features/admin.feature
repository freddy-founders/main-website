@capability.admin-governance
Feature: Admin maintenance
  Admin is for simple maintenance and pending registration review.

  Scenario: Admin can review pending registration requests
    When an admin asks for pending registration requests
    Then pending registration requests are returned for review
