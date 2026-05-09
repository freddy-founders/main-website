# QA: Private Community Auth Lifecycle

**Date:** 2026-05-09
**Feature:** Freddy Founders private-community auth lifecycle: public application intake, approved-member-only login, private route gating, admin approval/archive, and deactivation.
**Prod target:** https://freddyfounders.com
**Result:** 6/6 passed · 0 failed · 0 skipped · 1 partial-pass coverage note

---

## Pre-flight Notes

### Test infrastructure

| Control                     | Status | Selector                                                                                                                                 | Notes                                                                                                                                                          |
| --------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Login email                 | ✅     | role `textbox`, accessible name `EMAIL`; CSS `input[name="email"]`                                                                       | Public `/login`, outside private app chrome.                                                                                                                   |
| Send magic link             | ✅     | role `button`, accessible name `SEND MAGIC LINK`; CSS `button[type="submit"]`                                                            | User-facing response is intentionally generic.                                                                                                                 |
| Application fields          | ✅     | accessible names `NAME`, `EMAIL`, `COMPANY`, `COMPANY WEBSITE`, `ATLANTIC CANADA TIE`, `FOUNDER AFFIRMATION`, `PUBLIC DIRECTORY CONSENT` | No `data-testid`; used labels/names and stable form names.                                                                                                     |
| Apply for access            | ✅     | role `button`, accessible name `APPLY FOR ACCESS`                                                                                        | Public `/register`, outside private app chrome.                                                                                                                |
| Private-route redirect      | ✅     | URL/state observation                                                                                                                    | `/events`, `/people`, `/companies`, `/admin` redirect anonymous visitors to `/login`.                                                                          |
| Admin approval/archive      | ✅     | row text + button text `APPROVE` / `ARCHIVE`                                                                                             | Admin UI has no test IDs; used `li.ff-row` text matching.                                                                                                      |
| Member deactivation         | ✅     | row text + button text `DEACTIVATE`                                                                                                      | First attempt used case-sensitive text and missed; retried with observed lower-case row text successfully.                                                     |
| Approved-member email inbox | ❌     | n/a                                                                                                                                      | No mailbox/tooling for a real delivered magic-link email to `@example.com`; used Supabase Admin `generateLink` to validate production callback/private access. |

### Log events

| Event                              | Trigger                                                          | Payload fields                                                                                                    |
| ---------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `access_audit.action = approve`    | Admin approves a pending registration request through Worker API | `actor_profile_id`, `target_profile_id`, `target_email`, `action`, `metadata.registrationRequestId`, `created_at` |
| `access_audit.action = archive`    | Admin archives a pending registration request through Worker API | `actor_profile_id`, `target_email`, `action`, `metadata.registrationRequestId`, `created_at`                      |
| `access_audit.action = deactivate` | Admin deactivates an active profile through Worker API           | `actor_profile_id`, `target_profile_id`, `target_email`, `action`, `created_at`                                   |
| `profile_role_audit`               | Role changes through `set_profile_role(...)`                     | `actor_profile_id`, `target_profile_id`, `previous_role`, `next_role`, `reason`, `created_at`                     |

⚠️ Gaps:

- Public application submission writes `registration_requests` and pending/private company state, but does not emit a named telemetry event.
- Failed/unapproved login requests intentionally create no account and emit no app-level audit event. This matches the current production implementation, but leaves failed-login attempts silent in `access_audit`.
- Successful production login-link sends via browser `sendMagicLink(...)` do not write `access_audit`. The product-backed in-memory BDD model has `login-link send`, but the Supabase production adapter does not currently call `record_access_audit(...)`.
- No Cloudflare historical error-log query/runbook was found; validation used browser observation, Supabase tables, and Supabase Auth table checks.

### Observability

- Query method: `mise exec -- supabase db query --linked --output json "<sql>"`
- Log/data sinks:
  - `public.access_audit`
  - `public.profile_role_audit`
  - `public.registration_requests`
  - `public.profiles`
  - `auth.users`
  - `auth.audit_log_entries` where available
- No durable external log aggregator/runbook was found for Worker runtime errors.

### Prod state before testing

- Existing pending registration requests before this QA run: 2.
- Published/testable private data existed:
  - `events_published = 4`
  - `people_member_visible = 1`
  - `companies_published = 1`
- Profiles before QA-created setup:
  - `profiles_active = 0`
  - `profiles_deactivated = 0`
- Recent app access audit before QA-created setup:
  - `audit_recent = 0`
- Notable false-failure risk: the admin page already had two unrelated pending applications, so pending count was expected to remain nonzero after QA-created applications were approved/archived.

### QA data cleanup

After evidence collection, QA-created production data was cleaned up:

```json
{
  "authUsersFound": 3,
  "accessAuditDeleted": true,
  "registrationRequestsDeleted": true,
  "companiesDeleted": true,
  "remaining": { "profiles": 0, "registrationRequests": 0, "accessAudit": 0, "companies": 0 }
}
```

---

## Test Results

### Scenario 1: Applicant applies for access and receives only a receipt

**Status:** ✅ PASS
**User goal:** A founder can apply publicly and receives a receipt without gaining private app access.
**Notes:** Browser submitted `/register` with name, email, company, company website, Atlantic Canada tie, and founder affirmation. The page showed `Application received. Admins will review the company and founder claim.` Opening `/events` immediately afterward redirected back to `/login`.
**Log evidence:** Supabase query returned only a pending registration request; no profile, auth user, or access audit existed for the applicant.

```json
{
  "record_type": "registration_request",
  "email": "qa-apply-20260509080725@example.com",
  "status": "pending",
  "company_domain": "qa-apply-20260509080725.example.com",
  "atlantic_canada_tie": "QA smoke applicant based in Atlantic Canada.",
  "extra": "false"
}
```

---

### Scenario 2: Unapproved email tries to log in

**Status:** ✅ PASS
**User goal:** An unknown/unapproved visitor cannot create an account or receive usable access by entering an email on `/login`.
**Notes:** Browser submitted `qa-unapproved-20260509080725@example.com` on `/login`. The response stayed generic: `If approved, check your email for a Freddy Founders login link. Otherwise, apply for access.` No create-account language appeared.
**Log evidence:** Supabase query returned no rows for `auth.users`, `profiles`, `registration_requests`, `access_audit`, or relevant `auth.audit_log_entries` for the unapproved email.

```json
{ "rows": [] }
```

---

### Scenario 3: Anonymous visitor opens private app pages

**Status:** ✅ PASS
**User goal:** An anonymous visitor cannot browse Events, People, Companies, or Admin.
**Notes:** Browser opened `/events`, `/people`, `/companies`, and `/admin`. Each route redirected to `https://freddyfounders.com/login`, showed private-community login copy, and did not show private app navigation. Direct anonymous Supabase REST read of `events` also returned an empty array despite published events existing.
**Log evidence:** Supabase snapshot confirmed published events existed and no auth audit errors appeared during the redirect checks.

```json
[
  { "metric": "published_events", "count": 4 },
  { "metric": "auth_audit_route_errors_10m", "count": 0 }
]
```

Anonymous REST check:

```json
{ "status": 200, "rows": 0, "bodyType": "array" }
```

---

### Scenario 4: Approved member logs in and reaches Events

**Status:** ✅ PASS (partial)
**User goal:** An approved member can use a production magic link and reach the private Events app.
**Notes:** Created an approved active member profile for `qa-member-20260509080725@example.com` via Supabase service-role setup, generated a production magic link with redirect `https://freddyfounders.com/auth/callback`, opened it in the browser, and landed on `/events`. The Events board displayed private content including `JUNE OPERATOR DINNER: AI WORKFLOWS IN LOCAL SERVICES` and primary nav.
**Partial coverage note:** This validated production callback/session/private access, but did not validate actual email delivery from the `/login` form because no test mailbox was available.
**Log evidence:** Supabase query confirmed an auth user and active `member` profile existed. No app-level `access_audit` event is emitted for production login-link sends in the current implementation.

```json
[
  {
    "record_type": "auth_user",
    "email": "qa-member-20260509080725@example.com",
    "status": "exists"
  },
  {
    "record_type": "profile",
    "email": "qa-member-20260509080725@example.com",
    "status": "member",
    "extra": "active"
  }
]
```

---

### Scenario 5: Admin approves one application and archives another

**Status:** ✅ PASS
**User goal:** An admin can review pending applications and choose approve or archive, with durable access/audit state.
**Notes:** Browser signed in as `qa-admin-20260509080725@example.com`, opened `/admin`, approved `QA Apply Founder`, and archived `QA Archive Founder`. The UI showed `Approved qa-apply-20260509080725@example.com. They can now request a login link.` and `Archived qa-archive-20260509080725@example.com.` The approved applicant appeared in People + Roles as active `member`; archived applicant left the active pending queue.
**Log evidence:** Supabase query confirmed approved/archived registration states, an active member profile for the approved applicant, and `access_audit` rows for both `approve` and `archive`.

```json
[
  {
    "record_type": "access_audit",
    "email": "qa-apply-20260509080725@example.com",
    "status": "approve",
    "extra": "{\"registrationRequestId\": \"6d0c4100-bd1d-44fa-bb08-b3b2d034dadb\"}"
  },
  {
    "record_type": "access_audit",
    "email": "qa-archive-20260509080725@example.com",
    "status": "archive",
    "extra": "{\"registrationRequestId\": \"54701954-442b-42cb-bc71-db2148840936\"}"
  },
  {
    "record_type": "profile",
    "email": "qa-apply-20260509080725@example.com",
    "status": "member",
    "related": "active"
  },
  {
    "record_type": "registration_request",
    "email": "qa-apply-20260509080725@example.com",
    "status": "approved"
  },
  {
    "record_type": "registration_request",
    "email": "qa-archive-20260509080725@example.com",
    "status": "archived"
  }
]
```

---

### Scenario 6: Deactivated member loses access

**Status:** ✅ PASS
**User goal:** A deactivated former member is visible as deactivated and cannot enter the private app.
**Notes:** Admin deactivated `qa-member-20260509080725@example.com`. The admin UI showed `Deactivated qa-member-20260509080725@example.com.` and the profile row changed to `MEMBER / DEACTIVATED`. A fresh browser tab using a generated magic link for that deactivated user landed on `/login`; opening `/events` also redirected to `/login`.
**Log evidence:** Supabase query confirmed the profile became `deactivated` and `access_audit.action = deactivate` was written.

```json
[
  {
    "record_type": "access_audit",
    "email": "qa-member-20260509080725@example.com",
    "status": "deactivate",
    "related": "42137946-75b5-4b9a-8fa7-267c1f2a198e"
  },
  {
    "record_type": "profile",
    "email": "qa-member-20260509080725@example.com",
    "status": "member",
    "related": "deactivated"
  }
]
```

---

## Coverage Gaps

- Real delivered email contents were not validated. The run validated generated Supabase magic links and redirect behavior, but not mailbox delivery, approval notice copy, or absence of localhost in an actual received email.
- There is no production app-level audit row for failed login attempts or successful login-link sends, even though the product-backed BDD model includes `login-link send` as an audit action.
- Role promotion/demotion and owner transfer were not part of this browser QA pass.
- Used/expired/superseded magic-link lifecycle was not exhaustively browser-tested beyond deactivated-user rejection.
- No Cloudflare runtime log query was available for historical Worker exceptions.

## Regression Checklist

1. Anonymous `/events`, `/people`, `/companies`, and `/admin` redirect to `/login`.
2. `/login` and `/register` render outside private app chrome.
3. Complete founder application creates only a pending registration request and no auth user/profile.
4. Unknown/unapproved login shows generic copy and creates no auth user/profile.
5. Approved active member magic link returns to `https://freddyfounders.com/auth/callback` and reaches `/events`.
6. Admin can approve a pending application; applicant becomes active `member`; `access_audit.approve` is written.
7. Admin can archive a pending application; it leaves active pending queue; `access_audit.archive` is written.
8. Admin can deactivate an active member; member is shown as deactivated; `access_audit.deactivate` is written.
9. Deactivated member cannot request/use app access and is redirected to `/login`.
