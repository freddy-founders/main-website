# Freddy Founders — Agent-Facing Product PRD

Date: 2026-05-08
Status: Current working product brief for AI agents operating in this repo.

## Purpose

This document tells an AI agent how to use the community-hub artifacts in this repo correctly.

It is not just a product summary. It is a **working instruction manual** for how to:

- understand the current product shape
- interpret the discovery doc correctly
- use the mock and sidecar spec together
- avoid reintroducing superseded ideas
- keep product docs and mocks in sync when making changes

---

## Repo artifact map

### Primary files

- Discovery / research base:
  - `.agents/discovery/2026-05-08-community-hub.md`
- Current product PRD:
  - `.agents/mocks/community-hub-yc-flow.md`
- Current sidecar page-by-page spec:
  - `.agents/mocks/community-hub-yc-flow-spec.html`
- Current interactive visual mock:
  - `.agents/mocks/community-hub-yc-flow.html`
- Session decisions / supersession log:
  - `.agents/decisions.md`
- Hard naming constraint:
  - `.agents/constraints.md`

### What each file is for

- **Discovery doc** = problem framing, original jobs-to-be-done, constraints, research rationale, and earlier product thinking.
- **PRD markdown** = current canonical written product scope.
- **Spec HTML** = current page-by-page user stories, affordances, content, and design review surface.
- **Mock HTML** = current visual and interaction reference.
- **Decisions** = what changed during iterative design and what older ideas are now wrong.
- **Constraints** = hard invariants, especially naming.

---

## Source-of-truth order

If files conflict, use this order:

1. `.agents/constraints.md`
2. latest relevant entries in `.agents/decisions.md`
3. this file
4. `.agents/mocks/community-hub-yc-flow.md`
5. `.agents/mocks/community-hub-yc-flow-spec.html`
6. `.agents/mocks/community-hub-yc-flow.html`
7. `.agents/discovery/2026-05-08-community-hub.md`

### Why this order exists

The discovery doc is valuable, but it contains earlier assumptions and broader ideas that were later narrowed or replaced during mock/spec iteration.

The markdown PRD, sidecar spec, mock, and decisions represent the **current resolved direction**.

---

## Critical interpretation rule

Treat the discovery doc as **problem truth**, not always **solution truth**.

Use the discovery doc for:

- why the product exists
- organizer pain
- member pain
- trust/privacy concerns
- low-burden admin goals
- why events and context matter

Do **not** blindly use the discovery doc for:

- exact page inventory
- current navigation
- current entity model
- whether auth exists
- whether resources/forum/home/calendar should exist

Those were refined later.

---

## Current product shape

Freddy Founders is a **lightweight public network hub** centered on:

- Events
- People
- Companies
- lightweight auth

It is intentionally **not** a full community platform.

### Core principle

Build a sparse, useful index of:

- what is happening
- who is relevant
- which companies are in the network
- how a returning member/admin gets access

### Current MVP pages

1. Events
2. Event Detail
3. People
4. Person Detail / Row Expansion
5. Companies
6. Company Detail
7. Login
8. Registration
9. Admin Maintenance

### Current public nav

- Events
- People
- Companies
- Login
- Register

### Current internal nav intent

- Events
- People
- Companies
- Admin

---

## Non-negotiable product rules

### Community identity

- Community name must be **Freddy Founders**.

### Public access

- Public browsing should remain available without login.
- Login/Register should exist, but should **not** create a login wall.

### Event priority

- Events are the default public front page.
- RSVP/Register is the strongest public action.

### Directory behavior

- People is a Bookface-like public-safe directory.
- Companies is a YC Companies-style directory.
- Neither should become a feed, social network, or marketplace.

### Detail pages

- Detail pages are optional, utility-first context surfaces.
- They should exist only when the list row is not enough.

### Admin

- Admin is maintenance-oriented, not dashboard-oriented.
- It should stay simple unless explicit evidence says otherwise.

---

## What is superseded and must not come back

Unless the user explicitly asks for it again, do **not** reintroduce:

- Home as the main public front page
- Calendar as a separate main page
- News as the main front page
- Forum/posts/comments
- Resources library as MVP
- broader “community hub” sprawl
- social graph / follows / likes / messaging
- voting/ranking/karma
- payment/ticketing platform behavior
- exhaustive member account dashboards
- Organizations as the primary label

Use **Companies**, not Organizations, in the current product language.

---

## How to use each artifact correctly

## 1. Discovery doc

Read it first when you need:

- product rationale
- why the organizer burden matters
- what member orientation problem exists
- trust/privacy context
- original research framing

But before changing product scope, cross-check the decisions and current PRD.

### Discovery items that are still valuable

- organizer-first framing
- email chaos as root problem
- legitimacy / credibility / “community looks alive” need
- low-burden maintenance requirement
- privacy-conscious people context
- mobile-friendly public browsing

### Discovery items that are partially stale

These are useful historically but not current solution truth:

- broader home/resource/orientation concepts
- stronger anti-auth assumptions
- resource/announcement hub emphasis
- earlier page inventory ideas

---

## 2. PRD markdown

This is the main current scope reference.

Use it for:

- page inventory
- entity model
- current acceptance criteria
- current auth scope
- page-level functionality
- non-goals

If you are implementing or revising the product, this should usually be your first detailed reference after reading decisions.

---

## 3. Sidecar spec HTML

Use this for:

- per-page user stories
- affordances
- page content expectations
- page-design summaries
- review-friendly product discussion

This is especially useful when you need to answer:

- what should this page do?
- what should appear in the sidebar?
- what should not be included?

Think of it as the fastest human-reviewable breakdown of page intent.

---

## 4. Interactive mock HTML

Use this for:

- current navigation labels
- current page order
- visual information hierarchy
- copy tone
- desktop/mobile states
- current relationship between list pages and detail pages

Do not treat it as a frontend codebase or reusable implementation architecture.
It is a prototype and behavior reference.

### Important mock interpretation rules

- Public list pages use the right-rail layout.
- Right-rail content should match the spec, not literal Reddit sections.
- Event Detail and Person Detail were previously liked by the user; preserve their utility-first direction unless explicitly asked to change it.
- Login and Registration are lightweight auth surfaces, not onboarding funnels.

---

## Current page contracts

## Events

Purpose:

- public front page
- fast scan of upcoming events
- fast RSVP/Register action

Must communicate:

- what is happening next
- whether it is open/full/past
- enough context to decide whether to click through

## Event Detail

Purpose:

- explain why to attend
- explain who it is for
- show relevant people tied to that event

Must not become:

- a marketing landing page
- a social discussion page

## People

Purpose:

- public-safe person directory
- who is worth meeting and why

Must behave like:

- concise Bookface-style utility directory

Must not become:

- a feed
- LinkedIn clone
- messaging surface

## Person Detail

Purpose:

- profile-lite extension of a person row
- explain why this person matters
- connect person to events/topics

## Companies

Purpose:

- YC Companies-style public company directory
- help a user scan what each company does, where it sits, and why it is relevant

Must emphasize:

- company name
- short tagline
- industry/category
- location
- status/stage
- related people/events

Must not become:

- vendor marketplace
- sponsor wall
- marketing gallery

## Company Detail

Purpose:

- YC-style profile-lite company page
- summary, facts, related people, related events, optional public updates

Must feel like:

- a compact reference page
- not a brochure page

## Login

Purpose:

- returning member/admin entry

Must communicate:

- public browsing still works without login
- login is for account-linked actions

## Registration

Purpose:

- lightweight account creation or request access
- capture enough context for trust and consent

Must communicate:

- registration does not auto-publish a public profile
- public display is consent-based / approval-based

## Admin Maintenance

Purpose:

- maintain events, people, companies, links, and pending registrations/accounts

Must prioritize:

- low admin burden
- explicit visibility/consent
- simple CRUD
- pending registration review

Must not become:

- analytics dashboard
- moderation suite
- heavyweight ops center

---

## Current entity model

Use these as the working objects:

- Event
- Person
- Company
- Account
- EventPersonLink
- EventCompanyLink

### Important relationship rule

People and companies are not independent social entities with their own full product loops.
They exist to support:

- event discovery
- trust/context
- introductions
- network legitimacy

---

## Agent workflow for future edits

When making changes, follow this order:

1. Read:
   - `.agents/constraints.md`
   - relevant `.agents/decisions.md` entries
   - `.agents/community-hub-agent-prd.md`
   - `.agents/mocks/community-hub-yc-flow.md`
2. Use the discovery doc only for rationale and unresolved context.
3. Inspect the sidecar spec and mock before editing.
4. If product behavior changes, update **all relevant artifacts together**:
   - PRD markdown
   - sidecar spec HTML
   - mock HTML
   - decisions if the change establishes a new durable rule
5. Verify the mock still switches pages and the copy matches the new scope.

### Sync rule

If you change page inventory, navigation labels, entity names, or current scope, do not update just one file.
Keep the markdown PRD, sidecar spec, and mock synchronized.

---

## How an implementation agent should use this package

If an agent is asked to implement the product in code, it should:

1. Use the discovery doc to understand the why.
2. Use this file to understand source-of-truth precedence.
3. Use `community-hub-yc-flow.md` as the canonical current feature spec.
4. Use `community-hub-yc-flow-spec.html` for page-by-page details.
5. Use `community-hub-yc-flow.html` for layout, copy, and navigation behavior.
6. Use `decisions.md` to avoid implementing superseded concepts.

### Implementation bias

Prefer:

- simple public pages
- text-first dense lists
- low-burden admin flows
- consent-aware public data
- progressive disclosure

Avoid:

- speculative extra features
- account-heavy architecture beyond current auth needs
- heavy personalization
- community-platform sprawl

---

## Known tensions an agent should resolve carefully

### Discovery vs current scope

The discovery doc contains broader hub concepts.
Current scope is intentionally narrower.
Prefer the narrower current scope.

### Public browsing vs auth

Auth now exists, but the public site should remain open.
Do not accidentally turn Login/Register into a gate for core public content.

### Useful company/person context vs privacy

The product becomes more useful with richer people/company context.
But public display must stay sparse, approved, and consent-aware.

### Richer admin vs low burden

It is easy to bloat admin once accounts and links exist.
Resist that unless the user explicitly asks for more.

---

## Change checklist for future agents

Before finishing any change, confirm:

- Does Freddy Founders remain the community name?
- Did I preserve Events as the front page?
- Did I keep People and Companies as utility directories, not feeds?
- Did I keep public browsing open if touching auth?
- Did I preserve consent-aware public display?
- Did I avoid reviving forum/resources/home/calendar unless explicitly requested?
- Did I update PRD markdown, sidecar spec, and mock together?
- Did I check decisions for conflicts?

---

## Short version

If you only remember five things:

1. **Discovery explains the problem; current PRD/mock explain the solution.**
2. **Events / People / Companies / Login / Register is the current public shape.**
3. **People is Bookface-like; Companies is YC Companies-like.**
4. **Public browsing stays open; auth is lightweight.**
5. **Keep markdown PRD, sidecar spec, mock, and decisions in sync.**
