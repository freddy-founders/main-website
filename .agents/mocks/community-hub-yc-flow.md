# PRD + Mocks: Freddy Founders — Bookface + Events + Companies + Auth MVP

Date: 2026-05-08
Discovery: `.agents/discovery/2026-05-08-community-hub.md`
HTML Mock: `.agents/mocks/community-hub-yc-flow.html`
HTML Spec: `.agents/mocks/community-hub-yc-flow-spec.html`

## Product Summary

Freddy Founders should be a simple public index of **Events**, **People**, and **Companies**.

The product shape is **Bookface + Events + Companies**:

- **Bookface influence**: useful people and company directories with search, filters, concise context, and trust boundaries.
- **Hacker News influence**: compact, text-first lists with useful metadata, plain titles, and no unnecessary product chrome.
- **Events layer**: upcoming events are the public default, with RSVP/register as the main action.

This is not a full community platform. It should feel sparse, current, useful, and easy to maintain.

## MVP Scope

### In

- **Events** — default public front page
- **Event Detail** — optional page for events that need more context
- **People** — Bookface-like public-safe directory/index
- **Person Detail / Row Expansion** — optional profile-lite view
- **Companies** — public-safe index of companies, funds, studios, and operator groups
- **Company Detail** — optional profile-lite company view
- **Login** — simple returning-member/admin authentication entry
- **Registration** — lightweight account request / create account surface
- **Admin Maintenance** — simple internal CRUD for Events, People, and Companies
- RSVP/register CTA or link for events
- Event ↔ Person and Event ↔ Company links with relevance labels and visibility/consent

### Out

- feed/posts/comments
- voting/ranking/karma
- discussion forum
- resources library
- payment/ticketing
- social graph
- messaging
- unmoderated social accounts or profile dashboards
- full private community platform
- complex admin dashboard unless maintenance burden proves it necessary

## Core Product Rules

- Public navigation should be: **Events / People / Companies / Login / Register**.
- Events is the default public front page.
- People is a directory/index, not a feed.
- Detail pages are optional and should exist only when rows cannot carry enough context.
- RSVP/register is the strongest action on event-bearing pages.
- People data must be public-safe, consent-aware, and intentionally sparse.
- Company data must be public-safe, consent-aware, and intentionally sparse.
- Public browsing should still work without login; auth exists for members/admins and account/profile maintenance.
- Avoid fancy UI unless it improves scanning or trust.
- On desktop, public list pages should use a right sidebar for page context, filters, visible fields, lightweight stats, and boundaries. On mobile, this sidebar stacks below main content.

## Core Entity Model

### Event

- title
- date/time
- location or format
- host/contact
- one-line fit/context
- short description / why attend
- intended audience
- status: open / full / closed / past / draft
- RSVP/register URL or action
- visibility state

### Person

- name
- company / role / affiliation
- location if useful
- short relevance blurb
- topic tags / areas of expertise
- public-safe link/contact path if allowed
- visibility/consent state

### Company

- name
- logo/initial mark if available
- tagline
- longer public-safe description if needed
- industry/category
- location/HQ or remote status
- founded/year if useful
- stage/status
- team size range if public-safe
- topic tags / areas of activity
- related public people/founders if approved
- related upcoming events if useful
- public-safe website/contact path if allowed
- visibility/consent state

### Account

- name
- email
- password or magic-link/OAuth credential
- role/status: visitor / member / organizer / admin / pending approval
- company affiliation if relevant
- profile edit permissions
- notification/RSVP preferences
- consent to public directory display

### EventPersonLink

- event id
- person id
- relevance label: host / speaker / attending / good to ask about X / featured
- visibility/consent state
- optional display note
- source: organizer-curated / RSVP / manual note

### EventCompanyLink

- event id
- company id
- relevance label: host company / sponsor / member company / case example / featured
- visibility/consent state
- optional display note
- source: organizer-curated / public event context / manual note

## Screen Inventory

1. **Events**
2. **Event Detail**
3. **People**
4. **Person Detail / Row Expansion**
5. **Companies**
6. **Company Detail**
7. **Login**
8. **Registration**
9. **Admin Maintenance**

---

# 1. Events

## Purpose

Default public front page. Show a compact, HN-like list of upcoming events with enough metadata for users to decide whether to RSVP or open details.

## Primary user stories

- As a visitor, I can immediately see what events are coming up.
- As a founder/member, I can scan upcoming events and decide what is relevant to me.
- As a visitor, I can RSVP/register without digging through email.
- As a returning member, I can distinguish upcoming, full, closed, and past events quickly.
- As an organizer, I can share one public URL as the canonical events source.

## Required functionality

- Show upcoming events first.
- Show past/archived events lower on the page or behind a secondary section.
- Allow simple grouping by month/date if it improves scanability.
- Each event row must be useful without requiring a detail page.
- Each upcoming event row must expose RSVP/Register when available.
- Event titles should be plain, specific, and non-marketing.
- Event rows can link to Event Detail only when more context is useful.

## Event row content

- date/time
- title
- location or format
- host
- one-line fit/context
- status: open / full / closed / past
- RSVP/Register action
- Details action if needed
- optional people signal: “host + 2 relevant people” / “3 people to meet”

## Affordances

- compact text rows
- date/month separators
- status tags
- RSVP/Register button or link
- Details link
- people count/link when an event has people context
- clear archived/past treatment

## Page design

- **Top bar**: Freddy Founders wordmark/name, nav links for Events, People, and Companies, optional Login.
- **No title banner**: page title, subtitle, and lightweight stats should move into the right sidebar on desktop.
- **Primary list**: dense event rows, HN-like, newest/upcoming first.
- **Row hierarchy**: title first, then metadata; RSVP must be visually findable but not flashy.
- **Metadata style**: small monospace or muted text for date, place, host, status.
- **Right sidebar**: right-rail layout with spec-aligned page context, lightweight stats, filters, visible fields, and boundaries.
- **Empty state**: “No upcoming events. Check back soon.” plus past events if available.

## Right sidebar content

- community blurb: what Freddy Founders is
- lightweight stats: upcoming events, public people, event-linked companies if useful
- filters: upcoming / open / in person / remote / past
- visible fields: date/time, location/format, host, status, fit/context, RSVP/Register, details when useful
- boundaries: no feed/comments/voting, no payment/ticketing flow, RSVP only if likely attending

## Non-goals

- no feed
- no comments
- no voting/ranking
- no elaborate landing page hero
- no payment/ticketing flow

## Acceptance criteria

- A first-time visitor can understand the next event and primary action in under 10 seconds.
- A returning member can scan all upcoming events without opening every detail page.
- The page works as the public homepage.

---

# 2. Event Detail

## Purpose

Optional page for events that need more than a compact row. It should answer: **why attend?** and **who might I meet?**

## Primary user stories

- As a visitor, I can understand whether this event is for me before I RSVP.
- As a founder/member, I can see who is relevant to meet at this event.
- As a visitor, I can understand the event format and expectations.
- As an organizer, I can attach public-safe people context to an event.
- As an organizer, I can keep event context concise and current.

## Required functionality

- Show full event basics: title, date/time, location/format, host, status.
- Keep RSVP/Register as the primary action.
- Explain “why attend?” in short practical copy.
- Show intended audience / fit.
- Show optional “people connected to this event” module.
- Keep people context event-specific.
- Link back to Events and optionally onward to People.

## Event detail content

- title
- date/time
- location or format
- host/contact
- one-line fit/context
- why attend
- intended audience
- event status
- RSVP/register action
- people-at-event module when available

## People-at-event module

Each linked person should show:

- name
- role/company
- relevance label: host / speaker / attending / good to ask about X / featured
- short display note if useful
- visibility/consent state internally
- optional link to People or Person Detail

## Affordances

- prominent RSVP/Register action
- Details-to-Events back link
- people-at-event compact rows
- relevance labels
- status tag
- shareable event URL

## Page design

- **No title banner**: event name, short explanation, and lightweight stats should sit in the right sidebar on desktop.
- **Primary action zone**: RSVP/Register near the top of the main content and repeated near bottom if page is long.
- **Context block**: short “why attend?” paragraph, not marketing copy.
- **Fit block**: who should attend / what to expect.
- **People block**: compact list of relevant people with relevance labels.
- **Layout**: one-column on mobile; on desktop, event overview and stats live in the right sidebar.
- **Tone**: practical, direct, founder-network utility.

## Non-goals

- no discussion thread
- no attendee social feed
- no full event platform
- no long marketing landing page

## Acceptance criteria

- User can decide whether to RSVP without email context.
- Relevant people are clearly tied to this specific event.
- Private or uncertain people data is not exposed publicly.

---

# 3. People

## Purpose

Bookface-like public-safe directory/index of people in and around Freddy Founders.

## Primary user stories

- As a visitor, I can see who is in the community.
- As a founder/member, I can find people by role, company, expertise, or event relevance.
- As a founder/member, I can understand why someone is worth meeting without reading a long profile.
- As a visitor, I can see which people are connected to upcoming events.
- As an organizer, I can keep people context lightweight and safe.

## Required functionality

- Show compact public-safe person rows/cards.
- Support simple search/filter by name, company, role, topic, location, or event relevance.
- Show only people who are approved for public display.
- Avoid implying the directory is exhaustive if it is curated/featured.
- Link to related events when relevant.
- Link to Person Detail or expand row only when more context is useful.

## Person row content

- name
- company / role / affiliation
- location if useful
- short relevance blurb
- topic tags
- related upcoming event(s), if any
- public-safe link/contact path if allowed

## Filters

- topic/expertise
- company
- role/category
- event relevance
- location
- public/featured status for admin use

## Affordances

- search input
- filter chips
- compact person rows/cards
- topic tags
- related event links
- optional “view more” / row expansion

## Page design

- **Top bar**: same as Events.
- **No title banner**: page title, description, and lightweight stats should move into the right sidebar on desktop.
- **Search/filter area**: can sit in the right sidebar on desktop and above the list on mobile.
- **Directory list**: compact rows, not social cards.
- **Row hierarchy**: name first, then role/company, then relevance/tags.
- **Event relevance**: show small linked event references where useful.
- **Right sidebar**: right-rail layout with title/context, filters, visible fields, lightweight stats, and visibility notes.

## Right sidebar content

- directory filters: topic, company, role/category, event relevance, location
- visible fields: name, role/company, location, relevance blurb, tags, related events, public-safe contact path
- boundaries: public-safe only, no private-member exposure, concise relevance over full bios
- lightweight stats: public people, topic count, event-linked people

## Non-goals

- no social feed
- no messaging
- no LinkedIn-style exhaustive profiles
- no private-member exposure
- no self-serve account assumptions

## Acceptance criteria

- User can answer “who is in this network?” quickly.
- User can answer “who should I meet about X?” without reading long bios.
- People stays simple enough for an organizer to maintain.

---

# 4. Person Detail / Row Expansion

## Purpose

Optional profile-lite surface for a person when a directory row is not enough. This can be a dedicated page or an expandable row.

## Primary user stories

- As a visitor, I can understand what a person works on and why they are relevant.
- As a founder/member, I can see which events this person is connected to.
- As a founder/member, I can decide whether this person is worth meeting or asking about a topic.
- As an organizer, I can expose concise public context without creating a full profile system.

## Required functionality

- Show public-safe profile fields only.
- Show related upcoming events.
- Show topic tags / expertise.
- Keep copy short and utility-first.
- Provide a public-safe contact path only if approved.
- Fall back to row expansion if a full page is unnecessary.

## Content

- name
- role/company/affiliation
- location if useful
- short bio/relevance
- topic tags
- related events
- public-safe external link/contact path if allowed

## Affordances

- expand/collapse row or profile-lite page link
- related event links
- topic tags
- optional external link
- back to People

## Page design

- **No title banner**: person name, short bio, and key facts should move into the right sidebar on desktop.
- **If row expansion**: open inline under the person row; keep it short.
- **If dedicated page**: main content stays utility-first while the sidebar carries profile summary and facts.
- **No social decoration**: no cover photos, activity feed, follower counts, or endorsements.
- **Utility-first order**: name → role/company → why relevant → events/topics.

## Non-goals

- no wall/feed
- no private messages
- no follower graph
- no full member account dashboard
- no long biography unless explicitly useful

## Acceptance criteria

- User can understand why the person appears in the directory.
- User can find related events from the person context.
- The surface does not imply a social network.

---

# 5. Companies

## Purpose

YC Companies-style public directory for companies connected to Freddy Founders. Its job is not “community flavor”; it should let a visitor scan what each company does, where it is based, what category it belongs to, its status/stage, and which people/events connect to it.

## Primary user stories

- As a visitor, I can see which companies are connected to the community.
- As a founder/member, I can find companies by industry, location, event relevance, or public people.
- As a founder/member, I can understand why a company appears without reading marketing copy.
- As a visitor, I can see which companies are connected to upcoming events.
- As an organizer, I can keep company context lightweight, useful, and consent-safe.

## Required functionality

- Show compact YC-like company rows/cards.
- Support search by company name, tagline, founder/person, industry, location, stage/status, and event relevance.
- Provide directory filters similar to YC Companies: sort/top/featured, hiring/open-to-help, category/industry, location/HQ region, company size/stage/status, and related event.
- Show only companies approved for public display.
- Avoid implying the list is exhaustive or a vendor marketplace.
- Link to related events and public people when relevant.
- Link to Company Detail or expand row only when more context is useful.

## Company row content

- logo/initial mark if available
- company name
- short tagline: what the company does in one sentence
- industry/category
- location/HQ or remote status
- stage/status: active, public-safe, hiring/open-to-help, alumni/member/partner if relevant
- cohort/batch/community marker if Freddy Founders ever uses one
- team size range if public-safe
- topic tags
- related upcoming event(s), if any
- related public people/founders, if approved
- public-safe website/contact path if allowed

## Filters

- sort/top/featured
- hiring/open-to-help
- industry/category
- location/HQ region
- company size/stage/status
- event relevance
- related people/founders

## Affordances

- search input
- filter chips / sidebar filters
- compact YC-like company cards or rows
- logo/initial mark
- tagline and metadata chips
- related event links
- related public people/founder links
- optional “view company” / row expansion

## Page design

- **Top bar**: same as Events and People, with Companies in public nav.
- **No title banner**: page title, description, and lightweight stats should move into the right sidebar on desktop.
- **Search/filter area**: can sit in the right sidebar on desktop and above the list on mobile.
- **Company list**: compact YC-like rows/cards, not marketing cards.
- **Row hierarchy**: company name → tagline → industry/location/status → related people/events.
- **Right sidebar**: rail with page context, YC-like filters, visible fields, stats, and public-safe boundaries.

## Right sidebar content

- page context: this is the Freddy Founders company directory, inspired by YC Startup Directory
- directory filters: top/featured, hiring/open-to-help, industry/category, location, size/stage/status, event relevance, related people
- visible fields: logo/initial, name, tagline, category, location, status, team size if public-safe, related events/people
- lightweight stats: public companies, event-linked companies, hiring/open-to-help companies
- boundaries: not a vendor marketplace, no private CRM notes, no implied endorsement

## Non-goals

- no sales/vendor marketplace
- no exhaustive company directory
- no marketing landing pages
- no reviews/ratings
- no private CRM notes
- no implied endorsement

## Acceptance criteria

- User can answer “which companies are in this network?” quickly.
- User can answer “which companies are connected to this event/topic?” without browsing long profiles.
- Companies stays simple enough for an organizer to maintain.

---

# 6. Company Detail

## Purpose

Optional YC-like company profile when a directory row is not enough. It should answer: **what does this company do, what public facts matter, who is connected, and which events/news make it relevant here?**

## Primary user stories

- As a visitor, I can understand what a company does and why it is relevant.
- As a founder/member, I can see which public people and events connect to this company.
- As a founder/member, I can decide whether the company is worth knowing about for a topic or event.
- As an organizer, I can expose concise public company context without creating a marketing page.

## Required functionality

- Show public-safe company profile fields only.
- Show concise company summary/tagline and longer description.
- Show YC-like fact fields: founded/year, stage/status, team size range, location/HQ, industry/category, website.
- Show related public people/founders if approved.
- Show related upcoming events.
- Show optional public updates/news only when useful.
- Show topic tags / areas of activity.
- Keep copy short and utility-first.
- Provide a public-safe website/contact path only if approved.
- Fall back to row expansion if a full page is unnecessary.

## Content

- name
- logo/initial mark if available
- tagline
- longer public-safe description
- founded/year if useful
- stage/status
- team size range if public-safe
- location/HQ or remote status
- industry/category
- topic tags
- related public people/founders
- related events
- optional public updates/news
- public-safe website/contact path if allowed

## Affordances

- profile-lite page link or row expansion
- company website/contact link
- related event links
- related person/founder links
- topic/category tags
- small fact table
- back to Companies

## Page design

- **No title banner**: company name, tagline, and key facts should move into the right-side profile summary on desktop.
- **If row expansion**: open inline under the company row; keep it short.
- **If dedicated page**: main content mirrors YC company detail: summary/description, people/founders, related events, optional updates/news.
- **Side summary**: logo/initial, name, tagline, website/contact, founded/stage/team/location/status facts, category tags.
- **No marketing decoration**: no hero image, testimonials, ratings, pricing, or long company story.
- **Utility-first order**: name → tagline → facts → why relevant → people/events/updates.

## Non-goals

- no vendor marketplace
- no reviews/ratings
- no private CRM notes
- no long company profile
- no implied endorsement

## Acceptance criteria

- User can understand why the company appears in the directory.
- User can find related people and events from the company context.
- The surface does not imply a marketing profile or vendor marketplace.

---

# 7. Login

## Purpose

Simple authentication entry for returning members, organizers, and admins. Public browsing should not require login.

## Primary user stories

- As a returning member, I can log in to manage my RSVP/profile context.
- As an organizer/admin, I can log in to reach maintenance tools.
- As a visitor, I can recover my account or move to registration if I do not have one.
- As a public browser, I can understand that Events, People, and Companies remain viewable without logging in.

## Required functionality

- Email + password or magic link entry.
- Clear Login action.
- Link to Registration.
- Forgot password / send magic link affordance.
- Role-aware post-login destination: member profile/RSVP context or Admin Maintenance for admins.
- Error state for invalid credentials without leaking account existence.

## Content

- email field
- password or magic link field
- login button
- register link
- forgot password link
- public browsing reassurance
- privacy/public-directory reminder

## Page design

- **No marketing hero**: keep the surface compact and utilitarian.
- **Main card**: login form and secondary account links.
- **Side/facts rail**: explain what logging in enables: RSVP history, profile/company edits, admin maintenance if permitted.
- **Tone**: practical and calm; do not make login feel required for browsing.

## Non-goals

- no social login wall
- no member feed/dashboard
- no complex account settings
- no forced login for public browsing

## Acceptance criteria

- User can see how to log in or register in under 5 seconds.
- Public visitors are not confused into thinking browsing requires an account.
- Admins can understand login is the route to maintenance.

---

# 8. Registration

## Purpose

Lightweight create-account / request-access surface for people who want to participate beyond public browsing.

## Primary user stories

- As a visitor, I can create or request an account without emailing the organizer.
- As a prospective member, I can provide enough context for approval and directory safety.
- As a founder/member, I can indicate my company affiliation and interests.
- As an organizer, I can capture consent and avoid accidental public exposure.

## Required functionality

- Name, email, password/magic-link setup.
- Company/role/affiliation field.
- Reason for joining / what I am building field.
- Optional topic interests.
- Public directory consent checkbox.
- Submit registration / request access action.
- Link back to Login.
- Pending approval or email verification state.

## Content

- name
- email
- password or account setup method
- company / role / affiliation
- location if useful
- founder/operator context
- topics/interests
- consent to public profile/company display
- submit action

## Page design

- **No growth funnel**: simple form, not a marketing conversion page.
- **Progressive disclosure**: only ask fields needed for access, consent, and useful directory context.
- **Trust copy**: clearly say public directory display is optional/approved, not automatic.
- **Post-submit state**: “Check email” or “Pending organizer review.”

## Non-goals

- no open social-network signup
- no public profile auto-publish
- no invite/referral gamification
- no onboarding wizard

## Acceptance criteria

- User can understand what registration is for before submitting.
- Registration collects enough context for safe public directory participation.
- Public display requires explicit consent/approval.

---

# 9. Admin Maintenance

## Purpose

Simple internal maintenance surface for keeping public Events, People, Companies, and account registrations accurate.

## Primary user stories

- As an organizer, I can create and edit an event.
- As an organizer, I can create and edit a public-safe person row.
- As an organizer, I can create and edit a public-safe company row.
- As an organizer, I can link people and companies to events with relevance labels.
- As an organizer, I can control whether a person, company, or event link is public.
- As an organizer, I can spot missing required fields before publishing.
- As an organizer, I can review pending registrations and public-directory consent before approval.

## Required functionality

- CRUD for Events.
- CRUD for People.
- CRUD for Companies.
- Create/edit EventPersonLink and EventCompanyLink records.
- Set relevance labels for people and companies connected to events.
- Track visibility/consent states.
- Warn on missing date/time, RSVP/register, company relevance, or visibility approval.
- Preview public rows before publishing.
- Review pending registrations and approval/consent state.

## Admin objects

### Event editor fields

- title
- date/time
- location/format
- host/contact
- one-line fit/context
- why attend
- intended audience
- status
- RSVP/register URL/action
- visibility state

### Person editor fields

- name
- company/role/affiliation
- location if useful
- relevance blurb
- topic tags
- public-safe contact/link
- visibility/consent state

### Company editor fields

- name
- industry/category
- location if useful
- relevance blurb
- topic tags
- related people
- public-safe website/contact
- visibility/consent state

### Account / registration fields

- name
- email
- company/role/affiliation
- reason for joining / founder context
- approval status
- public directory consent
- role: member / organizer / admin

### Event-person / event-company link fields

- event
- person or company
- relevance label
- display note
- visibility/consent state

## Affordances

- Events table/list
- People table/list
- Companies table/list
- Registrations/accounts table/list
- create/edit forms
- link person or company to event action
- approve/decline registration action
- visibility/consent selector
- missing-field warnings
- public preview
- publish/save draft actions

## Page design

- **Navigation**: internal tabs or columns for Events, People, Companies, Links, and Accounts.
- **Default view**: current upcoming events, recently edited people/companies, and pending registrations.
- **Forms**: plain, low-burden, required fields clearly marked.
- **Warnings**: inline, practical, and specific.
- **Preview**: show how the public event row, people row, company row, and event context links will appear.
- **No dashboard bloat**: this is maintenance, not analytics or moderation.

## Non-goals

- no moderation system
- no complex issue tracker
- no analytics dashboard
- no email campaign management
- no payment/ticketing admin

## Acceptance criteria

- Organizer can create/update an event with RSVP in under 5 minutes.
- Organizer can create/update a public person row without creating an account system.
- Organizer can create/update a public company row without creating a vendor directory.
- Organizer can link a person or company to an event with relevance and visibility controls.
- Private or unapproved people/company/account context cannot accidentally appear publicly.

---

## Open Questions

- Should event RSVP/register deep-link externally or use a lightweight internal form?
- Should Person Detail and Company Detail be dedicated pages or only row expansions?
- Which People filters are truly needed for first mock: topic, company, role, event, location?
- Which Company filters are truly needed for first mock: industry, location, event, people, host status?
- Should Events use month sections or pure upcoming-date sorting?
- What exact visibility/consent states should Admin expose?
- Should registration be instant email verification or organizer-approved by default?

## Mock Sync Notes

The current visual mock should be resynced to this nine-page spec:

- Events is the only public front page and event list.
- People is the main person directory page.
- Companies is the main company/group directory page.
- Event Detail, Person Detail, and Company Detail are optional context surfaces.
- Login and Registration are lightweight auth/account surfaces, not a social dashboard.
- Admin is simple maintenance only.
- Remove any feed/forum/resource/dashboard/marketplace assumptions.
