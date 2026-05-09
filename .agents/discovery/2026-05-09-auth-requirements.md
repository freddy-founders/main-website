# Discovery: Freddy Founders Auth Requirements

## Problem Statement

Freddy Founders is a private community of Atlantic Canadian founders. The auth system currently risks mixing three separate jobs — applying for access, approving access, and logging in as an approved member — which can let unapproved people receive login/signup links or make the operator unable to trust the access state. The problem is primarily for the operator/owner, with secondary impact on applicants and admins.

Evidence: user input during this discovery; observed production behavior where an unapproved email received a Supabase magic link; market research showing private communities commonly separate application, approval/invite, and login; Supabase auth documentation indicating OTP login can create users unless prevented.

## Jobs to Be Done

### Functional Jobs

- Applicant: submit an application for access to a private founder community.
- Admin: review applications and choose whether to approve or ignore them.
- Admin/operator: know exactly who has access and why.
- Approved member: log into the private app without re-applying.
- Organizer: operate community surfaces without being able to create admins or grant full access.

### Emotional Jobs

- Applicant wants the process to feel legitimate and private, not like joining a public directory.
- Admin wants confidence that approval is meaningful and cannot be bypassed.
- Operator wants to trust that no stranger can self-create access.
- Approved member wants login to feel boring, clear, and reliable.

### Social Jobs

- Applicants want to be perceived as legitimate Atlantic Canadian founders.
- Admins want to maintain the quality and trust of the community.
- Freddy Founders wants to signal selectivity without promising a review timeline or status transparency.

### Related Jobs

- Maintain a private member directory.
- Maintain member roles: `member < organizer < admin`.
- Track ownership as a singleton capability on top of admin.
- Keep an audit trail of access-changing actions.

## Personas

### Primary Persona: Operator/Owner

**Goals**
- Trust that private app access cannot be bypassed.
- See who has access, what role they have, and how that access was granted.
- Avoid accidental account creation, incorrect redirects, or unclear auth states.

**Context**
- Operates a small private founder community.
- Needs enough control for trust, not enterprise identity ceremony.

**Behaviors**
- Checks pending applications.
- Needs confidence that production auth links and app access are correct.
- Cares more about correctness than admin review speed for v0.

**Pain Points**
- Unapproved emails receiving magic/signup links.
- Auth redirects pointing at localhost.
- Inability to tell whether an account/profile/application is actually approved.

### Secondary Persona: Applicant Founder

**Goals**
- Apply for access once with enough information to be evaluated.
- Know that the application was received.

**Context**
- Not yet a member.
- May not know whether they qualify.

**Behaviors**
- Submits application with identity, company, website, Atlantic Canada tie, and founder affirmation.
- Waits; no public status tracking is promised.

**Pain Points**
- Being shown login/signup language before approval.
- Thinking application means immediate access.
- Not knowing whether the community is public or private.

### Secondary Persona: Reviewing Admin

**Goals**
- Review applications and approve or ignore them.
- Avoid accidentally creating access for the wrong person.
- Maintain member roles safely.

**Context**
- Small-volume manual review.
- Review speed is not the primary v0 outcome.

**Behaviors**
- Reads application rows.
- Approves legitimate applicants.
- Archives/ignores applications that should not become members.

**Pain Points**
- Ambiguous pending/approved/account states.
- No audit trail for access changes.

### Secondary Persona: Approved Member

**Goals**
- Log in after approval.
- Access Events, People, Companies, and permitted member surfaces.

**Context**
- Already approved.
- May use magic-link login.

**Behaviors**
- Enters email on login page.
- Receives a magic login link only if approved.

**Pain Points**
- Confusing login vs application flow.
- Links pointing to localhost or incorrect callback URLs.

### Secondary Persona: Organizer

**Goals**
- Help operate community activity without full admin power.

**Context**
- Has more capability than a member but less than an admin.

**Behaviors**
- May operate events or member-facing surfaces.
- Must not approve applications, create admins, or grant full app access.

**Pain Points**
- Role boundaries unclear between organizer and admin.

### Key Scenarios

#### Scenario 1: Unapproved founder applies

A founder hears about Freddy Founders and visits the site. They see that it is a private community of Atlantic Canadian founders and choose to apply for access. They submit name, email, company name, company website, Atlantic Canada tie, founder affirmation, and optional public directory consent. They receive only a receipt-style confirmation; they are not promised a timeline or status page, and they cannot enter private app surfaces.

#### Scenario 2: Admin approves an application

An admin reviews pending applications. They decide a founder should be admitted. On approval, the system creates/enables a user account/profile with `member` role and sends an approval notice containing a normal `/login` URL. The notice is not a magic sign-in link. The applicant can then request a login magic link from `/login`.

#### Scenario 3: Admin ignores an application

An admin reviews an application and decides not to act on it. The admin archives/ignores it internally. The applicant receives no notification. The application leaves the active pending queue. The same email can submit a fresh application later; the old archived application remains in history.

#### Scenario 4: Unapproved email tries to log in

Someone enters an unknown or unapproved email on the login page. The system shows a generic safe message: if approved, check email; otherwise apply for access. No usable magic link is sent. No auth account is created.

#### Scenario 5: Approved member logs in

An approved member enters their email on the login page. The system sends a magic link that returns to the production Freddy Founders app, not localhost. The member enters the private app after verification.

#### Scenario 6: Operator audits access

The operator opens admin governance and sees members, roles, linked application history, and an audit log of approvals, ignores, role changes, and login-link requests. This allows the operator to answer: who has access, what role do they have, and why?

## Desired Outcomes

### Outcome Statements

| ID | Outcome | Importance | Current Satisfaction | Opportunity |
|----|---------|------------|----------------------|-------------|
| O1 | Minimize the chance that an unapproved person receives a usable login/account. | High | 1-2 / broken | Highest |
| O2 | Minimize the time it takes for an admin to decide approve vs ignore. | Lower for v0 | Not scored | Low v0 priority |
| O3 | Minimize ambiguity for applicants after submitting an application. | Medium | Not scored | Bound by no-status choice |
| O4 | Minimize login confusion for approved members. | High | 3-4 / weak | High |
| O5 | Minimize risk that an admin grants the wrong role/access. | Medium-high | Not scored | Medium |
| O6 | Minimize auth redirects to non-production URLs. | High | Implied weak by observed localhost link | High |
| O7 | Maximize operator confidence in the current access state. | High | 1-2 / broken | Highest |

### Underserved Outcomes

Primary underserved outcomes:

1. O1 — prevent unapproved login/account creation.
2. O7 — operator trust in access state.
3. O4 — approved member login clarity.
4. O6 — production-correct auth redirects.

Admin review speed is explicitly not a v0 priority.

## Market Landscape

Private community platforms commonly separate access control into application/request, approval/invite, login, roles, and member management.

- Mighty Networks supports screening questions and explicit approval before access; approved users can then create/login to accounts.
- Circle private communities often use application/vetting before inviting members, and track invited/pending activation states.
- Discourse can be configured as private/login-required and supports manual approval before new users can log in.
- Slack-style communities are invite-based and can require admin approval for invitations.
- Supabase OTP login defaults can create users unless `shouldCreateUser` is disabled; redirect URLs require project-level URL configuration.

### Gaps and Whitespace

Freddy Founders should not copy a broad community platform. Its whitespace is a strict, lightweight founder-community gate:

- application is public;
- app is private;
- login never creates accounts;
- approval creates access;
- ignored applications disappear from active review without public status;
- operator can audit access.

### Table Stakes vs Differentiators

**Table stakes**
- Private app gate.
- Public application form.
- Admin approval/ignore queue.
- Approved-member login.
- Correct production auth redirects.
- Role boundaries.
- Member/access visibility.

**Differentiators for this product**
- Founder/company-specific application requirements.
- Atlantic Canada tie required at application time.
- No self-serve account creation from login.
- Approval notice without auto-login link.
- Lightweight auditability without enterprise IAM complexity.

## Constraints

### Hard Constraints

- Public anonymous surfaces are only login and application/register.
- Private surfaces require approved member authentication.
- Login must not create accounts.
- Application must not create usable access.
- Approval creates/enables account/profile as `member`.
- Approval notice includes normal `/login` URL only, not a magic sign-in link.
- Ignored applications are archived internally with no notification.
- Same email can submit a fresh application after an old application is ignored/archived.
- Roles remain `member < organizer < admin`.
- Owner is not a role; owner is a singleton capability on top of admin.

### Out of Scope for v0

- Public application status tracking.
- Automatic rejection emails.
- Paid membership/paywall flows.
- Social/OAuth login.
- Optimizing admin review speed.
- Enterprise identity management.

### Assumptions and Risk

| Assumption | Risk | Notes |
|------------|------|-------|
| Admin approval volume is low enough for manual review. | Medium | User deprioritized review speed. |
| Applicants do not need a public status page. | Medium | Could create uncertainty but is intentional. |
| Approval notice without magic link is acceptable. | Low | Explicitly chosen by user. |
| Archived applications can coexist with fresh applications from same email. | Medium | Requires clear admin history semantics. |
| Magic-link auth remains preferred for approved-member login. | Medium | Needs correct no-auto-signup behavior. |

## Requirements

### R1 — Public/Auth Surface Boundary

**Trace:** O1, O4, O7; Operator/Owner; Approved Member.

The login and application pages must be public and outside the in-app chrome. Events, People, Companies, and Admin must require authenticated approved-member access.

**Acceptance Criteria**

- Anonymous visitor to `/events`, `/people`, `/companies`, or `/admin` is redirected to `/login` or shown a login-required state.
- Anonymous visitor can access `/login`.
- Anonymous visitor can access `/register` or equivalent application page.
- Login and application pages do not show the in-app navigation/chrome used by private app surfaces.

### R2 — Application Intake Required Fields

**Trace:** Functional job: Applicant applies for access; O1, O3.

The application form must collect the minimum data needed to evaluate founder/community fit.

**Required fields**

- Name.
- Email.
- Company name.
- Company website/domain.
- Atlantic Canada location/community tie.
- Founder affirmation: applicant affirms they are a founder of the company.

**Optional fields**

- Public directory consent.

**Explicitly not v0 fields**

- Role/title.
- Founder context free-text.
- Topics/interests.

**Acceptance Criteria**

- Application cannot be submitted without every required field.
- Application can be submitted without public directory consent.
- Application confirmation says the application was received and does not promise timeline/status.
- Application submission does not create usable app access.

### R3 — Application Is Not Account Creation

**Trace:** O1, O7; Operator/Owner.

Submitting an application must create a pending application record only. It must not create a usable auth account, member profile, session, or login entitlement.

**Acceptance Criteria**

- After applying, the applicant cannot access private routes.
- After applying, the applicant cannot receive a login magic link unless approved.
- Application record has status `pending` or equivalent active-review state.

### R4 — Login Only Works for Approved Accounts

**Trace:** O1, O4, O7; Approved Member; Operator/Owner.

The login flow must only send magic links to approved/enabled accounts. Unknown, unapproved, pending, ignored, or archived applicant emails must not receive magic links and must not cause account creation.

**Acceptance Criteria**

- Unknown email submitted to login creates no auth user/account.
- Unknown email submitted to login receives no usable magic link.
- Pending applicant email submitted to login receives no usable magic link.
- Ignored/archived applicant email submitted to login receives no usable magic link unless later approved.
- The user-facing login response is generic: if approved, check email; otherwise apply for access.

### R5 — Approval Creates Member Access

**Trace:** O1, O4, O7; Reviewing Admin; Approved Member.

An admin can approve a pending application. Approval must create or enable the user account/profile as a `member` and send an approval notice containing a normal `/login` URL. The approval notice must not be a magic sign-in link.

**Acceptance Criteria**

- Approved application leaves active pending queue.
- Approved applicant has an account/profile with `member` role.
- Approved applicant can request a magic login link from `/login`.
- Approval sends a notice email that includes a normal login URL.
- Approval notice does not contain a one-time magic sign-in token/link.

### R6 — Ignore/Archive Application

**Trace:** O2, O7; Reviewing Admin; Applicant.

An admin can ignore/archive an application. Ignoring removes it from active pending review, sends no applicant notification, and preserves history. The same email can submit a fresh application later.

**Acceptance Criteria**

- Ignored application no longer appears in active pending queue.
- Ignored application remains visible in historical/admin audit context.
- Applicant receives no automatic ignored/rejected email.
- Same email can submit a new application after prior application was ignored/archived.

### R7 — Access State Visibility and Audit

**Trace:** O7; Operator/Owner.

Admins/operators must be able to see the current access state and the history of access-changing actions.

**Required visibility**

- Members list.
- Each member's role.
- Whether a member came from an application.
- Application linkage/history where applicable.
- Audit log entries for approvals, ignores/archives, role changes, and login-link requests.

**Acceptance Criteria**

- Each access-changing audit entry includes actor, target, action, timestamp.
- Admin can answer: who has app access, what role do they have, and why?
- Operator can distinguish pending applications from approved members and archived applications.

### R8 — Role Boundaries

**Trace:** O5, O7; Reviewing Admin; Organizer.

Roles and permissions are cumulative: `member < organizer < admin`. Owner is a singleton capability on top of admin, not a fourth role.

**Acceptance Criteria**

- Only admins can approve applications.
- Only admins can create/promote admins.
- Member access is read-only plus RSVP capability on private app surfaces.
- Members cannot create, edit, or delete events.
- Members cannot change any user's role.
- Members cannot access Admin governance.
- Organizers can access Events, People, and Companies.
- Organizers can create, edit, and delete events.
- Organizers cannot approve or archive applications.
- Organizers cannot create or promote admins.
- Organizers cannot access Admin governance.
- Admins have full Events/People/Companies CRUD plus role/access governance.
- Owner has all admin permissions.
- Owner must remain admin.
- Demotion or transfer rules must not leave the system without an admin/owner.


### R8a — Deactivated Access State

**Trace:** O1, O4, O7; Operator/Owner; Approved Member.

Deactivated is a distinct blocked-access state. A deactivated former member must not be treated as a fresh applicant, must not be able to request login links, and must not be able to use previously issued links.

**Acceptance Criteria**

- Admin can mark an active member as deactivated.
- Deactivated members cannot request magic login links.
- Deactivated members cannot enter private routes.
- A previously issued but not-yet-used magic link is rejected after deactivation.
- Deactivated former members are visible as deactivated in admin/operator access state views.
### R9 — Production Redirect Correctness

**Trace:** O4, O6; Approved Member; Operator/Owner.

Production auth emails and callbacks must resolve to the canonical production app domain. Production emails must never send users to localhost.

**Acceptance Criteria**

- Production magic-link redirect target starts with `https://freddyfounders.com`.
- Production approval notice login URL starts with `https://freddyfounders.com`.
- No production auth email contains `localhost` or `127.0.0.1`.
- Local development may use localhost/127.0.0.1 only in local environment configuration.

### R10 — Auth Language

**Trace:** O3, O4; Applicant; Approved Member.

Public auth surfaces must use application/private-community language, not generic social signup language.

**Required language**

- Login page states: "Freddy Founders is a private community of Atlantic Canadian founders."
- Application page uses "apply" / "application" / "request access" language.
- Public surfaces avoid implying instant membership or self-serve account creation.

**Acceptance Criteria**

- Login page does not use "create account" as the primary action.
- Application confirmation does not say the applicant can now log in.
- Application page does not promise review timeline or public status tracking.


## BDD Coverage Matrix

The auth and role system should be covered as a full state/transition matrix, not just happy paths.

### A. Public Entry Boundary

- Anonymous can access `/login`.
- Anonymous can access `/register`.
- Anonymous is blocked or redirected from `/events`.
- Anonymous is blocked or redirected from `/people`.
- Anonymous is blocked or redirected from `/companies`.
- Anonymous is blocked or redirected from `/admin`.
- Login and application pages render outside the private app shell.

### B. Application Intake

- Founder can apply with all required fields.
- Missing required field blocks application.
- Founder affirmation is required.
- Atlantic Canada tie is required.
- Public directory consent is optional.
- Applying creates a pending application only.
- Applying creates no usable account, session, or magic-link eligibility.

### C. Duplicate and Reapplication Rules

- Same email cannot create a second active pending application.
- Archived/ignored same email can submit a fresh application.
- Approved email cannot apply again.
- Deactivated former member is handled differently than a fresh applicant.

### D. Approval and Archive Transitions

- Admin approves a pending application.
- Approval creates/enables a `member` account/profile by default.
- Approval sends notice-of-approval email.
- Approval notice contains normal `/login` URL only.
- Approval notice does not create a logged-in session.
- Approval notice contains no magic sign-in link.
- Admin archives/ignores a pending application.
- Archived application leaves active queue and remains in history.

### E. Login Request Gating

- Approved member requests magic link and link is sent.
- Unknown email requests login and no link is sent.
- Pending applicant requests login and no link is sent.
- Archived/ignored applicant requests login and no link is sent.
- Deactivated former member requests login and no link is sent.
- Login response remains generic/safe and does not expose approval state.

### F. Magic-Link Lifecycle

- Magic link redirects to the correct production app URL.
- Production auth email never contains localhost/127.0.0.1.
- Expired link is rejected safely.
- Used link is rejected safely.
- Second link invalidates the first link.

### G. Post-Login Access

- Approved member can access Events.
- Approved member can access People.
- Approved member can access Companies.
- Member cannot access Admin governance.
- Organizer can access Events, People, and Companies.
- Organizer cannot access Admin governance.
- Admin can access Admin governance.

### H. Role and Permission Governance

- Member is read-only plus RSVP.
- Member cannot create, edit, or delete events.
- Organizer can create, edit, and delete events.
- Organizer cannot approve or archive applications.
- Organizer cannot create/promote admins.
- Admin can approve/archive applications.
- Admin can create/promote admins.
- Admin can deactivate members.

### I. Owner Invariants

- Owner is also admin.
- Owner cannot self-demote.
- Owner must transfer ownership first.
- Ownership transfer preserves admin capability on previous owner.

### J. Deactivation Lifecycle

- Admin deactivates active member.
- Deactivated member loses private app access.
- Deactivated member cannot request login link.
- Deactivated member cannot use an old still-valid login link.

### K. Audit and Visibility

- Admin sees pending applications.
- Admin sees approved members list.
- Admin sees role list.
- Admin sees application linkage/history.
- Approval creates audit entry.
- Archive/ignore creates audit entry.
- Role change creates audit entry.
- Login-link send creates audit entry.
- Each audit entry includes actor, target, action, and timestamp.
## Open Questions

- What exact email text should the approval notice use?
- Should admins receive email notification on every new application, or is dashboard review enough for v0?
- What should happen if an approved member later loses founder/company eligibility?
- Should archived applications be searchable/filterable by applicant email/domain in v0?
- Should login-link request audit include failed/unapproved attempts, or only successful sends?

---

## Appendix A: Market Research

### Private Community Platforms

Research summary:

- Mighty Networks supports private/invite-only communities, screening questions, and approval before members gain access. Hosts can require questions and approval, and approval can trigger member access.
- Circle private communities commonly use application/vetting before invitation and provide member/invited management states.
- Discourse can be configured as a private community with login required and `must_approve_users`, so users require approval before login.
- Slack-style communities are invite-based; stricter setups can require admin approval for invitations.

Sources:

- Supabase JavaScript Auth `signInWithOtp` reference: https://supabase.com/docs/reference/javascript/auth-signinwithotp
- Supabase Auth redirect URL docs: https://supabase.com/docs/guides/auth/redirect-urls
- Supabase local config docs: https://supabase.com/docs/guides/local-development/cli/config
- Circle community/private invite research source: https://circle.so/
- Mighty Networks private/access approval research source: https://www.mightynetworks.com/
- Discourse private community / approval research source: https://meta.discourse.org/
- Slack invitation/admin approval research source: https://slack.com/help/

## Appendix B: JTBD Research

Raw job statements derived from user input + research:

- When I apply to a private community, I want to know my request was received, so I do not accidentally think I am already a member.
- When I review applicants, I want approval to be the only path to access, so community trust is preserved.
- When I operate the community, I want to see every access-changing action, so I can trust the gate.
- When I am approved, I want login to work without re-applying, so I can enter the community smoothly.
- When I try to login with an unapproved email, the system should not create an account or leak whether I exist.

User language captured:

- "anyone can apply, admins can approve, or ignore applications"
- "the email to members on approval should just be a 'notice of approval' no login link"
- "the app is private, and requires applying for access"
- "we should use 'application' language"

## Appendix C: Outcome Analysis

Prioritization input from user:

- Top outcomes: O1, O4, O7.
- Least important v0: O2 admin review speed.
- Satisfaction ratings:
  - O1 prevent unapproved login/account creation: 1-2 / broken.
  - O4 approved member login clarity: 3-4 / weak.
  - O7 operator trust in access state: 1-2 / broken.

Opportunity ranking:

1. O1 — highest urgency.
2. O7 — highest urgency.
3. O4 — high urgency.
4. O6 — high urgency due observed localhost redirect.
5. O5 — medium.
6. O3 — medium but constrained by no status tracking.
7. O2 — low for v0.

## Appendix D: Competitive Analysis

### Mighty Networks

Pattern: private/invite-only network; hosts can ask screening questions and require approval; approved members receive access. Useful precedent for application + manual approval + member login separation.

### Circle

Pattern: private community access often uses applications/vetting before invites; admin/member management tracks invited/pending states. Useful precedent for separating application from actual account activation.

### Discourse

Pattern: private communities can require login for content and require moderator approval before new users can log in. Useful precedent for `login required` + `must approve users` as two distinct controls.

### Slack

Pattern: workspace access is invite-based; stricter organizations can require admin approval for invites. Useful precedent for admin-controlled access and role hierarchy.

### Supabase Auth

Relevant behavior: OTP/magic-link login can create users by default unless configured otherwise, and redirect URLs must be configured/allowed. This directly supports requirements R4 and R9.
