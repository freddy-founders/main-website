Feature: Private community auth and role state machine
  Freddy Founders is a private community. Applying for access, approving access,
  approved-member login, role permissions, and deactivation are separate states.

  Background:
    Given the Freddy Founders auth state is reset

  @auth @boundary
  Scenario Outline: Public auth entry routes are reachable outside the private app shell
    When an anonymous visitor opens "<route>"
    Then the route is public
    And the route renders outside the private app shell

    Examples:
      | route     |
      | /login    |
      | /register |

  @auth @boundary
  Scenario Outline: Anonymous visitors cannot enter private app routes
    When an anonymous visitor opens "<route>"
    Then login is required

    Examples:
      | route      |
      | /events    |
      | /people    |
      | /companies |
      | /admin     |

  @auth @application
  Scenario: Complete founder application creates only a pending application
    When "founder@example.com" submits a complete founder application
    Then an application for "founder@example.com" is pending
    And no usable account exists for "founder@example.com"
    And no session exists for "founder@example.com"
    And "founder@example.com" is not eligible for a magic login link

  @auth @application
  Scenario Outline: Required application fields must be present
    When "founder@example.com" submits an application missing "<field>"
    Then the application is rejected before becoming pending
    And no usable account exists for "founder@example.com"

    Examples:
      | field               |
      | name                |
      | email               |
      | company name        |
      | company website     |
      | Atlantic Canada tie |

  @auth @application
  Scenario: Founder affirmation is required
    When "founder@example.com" submits an application without founder affirmation
    Then the application is rejected before becoming pending
    And no usable account exists for "founder@example.com"

  @auth @application
  Scenario: Public directory consent is optional
    When "founder@example.com" submits a complete founder application without public directory consent
    Then an application for "founder@example.com" is pending
    And the application records public directory consent as false

  @auth @reapplication
  Scenario: Pending email cannot create a second active application
    Given a pending application exists for "founder@example.com"
    When "founder@example.com" submits a complete founder application
    Then only one active pending application exists for "founder@example.com"
    And the second application is blocked

  @auth @reapplication
  Scenario: Archived applicant can submit a fresh application
    Given an archived application exists for "founder@example.com"
    When "founder@example.com" submits a complete founder application
    Then an application for "founder@example.com" is pending
    And the archived application remains in history for "founder@example.com"

  @auth @reapplication
  Scenario: Approved member cannot apply again
    Given an active approved member account exists for "founder@example.com"
    When "founder@example.com" submits a complete founder application
    Then the application is rejected before becoming pending
    And the existing approved account remains active for "founder@example.com"

  @auth @reapplication
  Scenario: Deactivated former member is not treated as a fresh applicant
    Given a deactivated member account exists for "founder@example.com"
    When "founder@example.com" submits a complete founder application
    Then the request is flagged as a deactivated former member request
    And no fresh pending application is created for "founder@example.com"

  @auth @approval
  Scenario: Admin approval creates member access without logging the applicant in
    Given a pending application exists for "founder@example.com"
    When an admin approves the application for "founder@example.com"
    Then the application for "founder@example.com" is approved
    And the approved member account for "founder@example.com" is active
    And the account role for "founder@example.com" is "member"
    And an approval notice is sent to "founder@example.com"
    And the approval notice contains the normal login URL "https://freddyfounders.com/login"
    And the approval notice does not contain a magic sign-in link
    And no session exists for "founder@example.com"

  @auth @approval
  Scenario: Admin archives an application without notifying the applicant
    Given a pending application exists for "founder@example.com"
    When an admin archives the application for "founder@example.com"
    Then the application for "founder@example.com" is archived
    And the application for "founder@example.com" is not in the active pending queue
    And the application remains in history for "founder@example.com"
    And no applicant notification is sent to "founder@example.com"

  @auth @login
  Scenario: Approved active member can request a magic login link
    Given an active approved member account exists for "member@example.com"
    When "member@example.com" requests a magic login link
    Then a magic login link is sent to "member@example.com"
    And the login response is generic and safe

  @auth @login
  Scenario Outline: Non-approved login requests never send a usable magic link
    Given "<state>" exists for "visitor@example.com"
    When "visitor@example.com" requests a magic login link
    Then no magic login link is sent to "visitor@example.com"
    And the login response is generic and safe
    And no account is created by the login request for "visitor@example.com"

    Examples:
      | state                  |
      | unknown email          |
      | pending application    |
      | archived application   |
      | deactivated member     |

  @auth @magic-link
  Scenario: Production magic links redirect to Freddy Founders
    Given an active approved member account exists for "member@example.com"
    When "member@example.com" requests a magic login link
    Then the magic login link for "member@example.com" redirects to "https://freddyfounders.com"
    And the magic login email for "member@example.com" does not contain localhost

  @auth @magic-link
  Scenario Outline: Used or expired magic links are rejected safely
    Given a fresh magic login link exists for "member@example.com"
    When the magic login link for "member@example.com" becomes "<link state>"
    And "member@example.com" uses that magic login link
    Then the magic login attempt is rejected safely

    Examples:
      | link state |
      | expired    |
      | used       |

  @auth @magic-link
  Scenario: A second magic link invalidates the first link
    Given a fresh magic login link exists for "member@example.com"
    When a second magic login link is issued for "member@example.com"
    Then the first magic login link for "member@example.com" is rejected safely
    And the latest magic login link for "member@example.com" can authenticate the member

  @auth @access
  Scenario Outline: Approved active roles can enter member app surfaces
    Given an active approved "<role>" account exists for "person@example.com"
    When "person@example.com" opens "<route>"
    Then access is granted

    Examples:
      | role      | route      |
      | member    | /events    |
      | member    | /people    |
      | member    | /companies |
      | organizer | /events    |
      | organizer | /people    |
      | organizer | /companies |
      | admin     | /events    |
      | admin     | /people    |
      | admin     | /companies |

  @auth @access
  Scenario Outline: Admin governance is admin-only
    Given an active approved "<role>" account exists for "person@example.com"
    When "person@example.com" opens "/admin"
    Then access is "<access>"

    Examples:
      | role      | access  |
      | member    | denied  |
      | organizer | denied  |
      | admin     | granted |

  @auth @permissions
  Scenario Outline: Member permissions are read-only plus RSVP
    When a "member" attempts to "<action>"
    Then permission is "<permission>"

    Examples:
      | action        | permission |
      | read events   | granted    |
      | read people   | granted    |
      | read companies| granted    |
      | RSVP          | granted    |
      | create events | denied     |
      | edit events   | denied     |
      | delete events | denied     |
      | change roles  | denied     |

  @auth @permissions
  Scenario Outline: Organizer permissions are event operations without governance
    When an "organizer" attempts to "<action>"
    Then permission is "<permission>"

    Examples:
      | action               | permission |
      | read events          | granted    |
      | read people          | granted    |
      | read companies       | granted    |
      | RSVP                 | granted    |
      | create events        | granted    |
      | edit events          | granted    |
      | delete events        | granted    |
      | approve applications | denied     |
      | archive applications | denied     |
      | create admins        | denied     |
      | enter admin          | denied     |

  @auth @permissions
  Scenario Outline: Admin permissions include content CRUD and access governance
    When an "admin" attempts to "<action>"
    Then permission is "granted"

    Examples:
      | action               |
      | read events          |
      | read people          |
      | read companies       |
      | RSVP                 |
      | create events        |
      | edit events          |
      | delete events        |
      | create people        |
      | edit people          |
      | delete people        |
      | create companies     |
      | edit companies       |
      | delete companies     |
      | approve applications |
      | archive applications |
      | create admins        |
      | deactivate members   |
      | enter admin          |

  @auth @owner
  Scenario: Owner is an admin with all admin permissions
    Given "owner@example.com" is the owner admin
    Then "owner@example.com" has role "admin"
    And "owner@example.com" has all admin permissions

  @auth @owner
  Scenario: Owner cannot self-demote before transferring ownership
    Given "owner@example.com" is the owner admin
    When "owner@example.com" attempts to demote themselves to "member"
    Then the role change is rejected
    And "owner@example.com" remains the owner admin

  @auth @owner
  Scenario: Ownership transfer keeps the previous owner as an admin
    Given "owner@example.com" is the owner admin
    And an active approved admin account exists for "next-owner@example.com"
    When "owner@example.com" transfers ownership to "next-owner@example.com"
    Then "next-owner@example.com" is recorded as the owner admin
    And "owner@example.com" has role "admin"
    And "owner@example.com" is not the owner

  @auth @deactivation
  Scenario: Deactivated member loses access and login eligibility
    Given an active approved member account exists for "member@example.com"
    And a fresh magic login link exists for "member@example.com"
    When an admin deactivates "member@example.com"
    Then "member@example.com" is deactivated
    And "member@example.com" cannot enter private app routes
    And "member@example.com" is not eligible for a magic login link
    And the old magic login link for "member@example.com" is rejected safely
    And "member@example.com" appears as deactivated in admin access state

  @auth @audit
  Scenario: Admin can see the current access state
    Given a pending application exists for "pending@example.com"
    And an archived application exists for "archived@example.com"
    And an active approved member account exists for "member@example.com"
    When an admin reviews the access state
    Then pending applications are visible
    And approved members are visible
    And member roles are visible
    And application history is visible

  @auth @audit
  Scenario Outline: Access-changing actions create audit entries
    Given the auth audit log is empty
    When an admin performs the audit action "<action>" for "target@example.com"
    Then an audit entry exists for "<action>" on "target@example.com"
    And the audit entry includes actor, target, action, and timestamp

    Examples:
      | action          |
      | approve         |
      | archive         |
      | role change     |
      | login-link send |