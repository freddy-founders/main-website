# Discovery: Lightweight Community Hub for a Professional Network

## Problem Statement

A small-to-growing professional networking community currently lives in email, leaving event context, introductions, resources, and updates scattered across many threads. This creates disproportionate organizer burden, makes community knowledge hard for members to discover, and causes the community to look less alive and legitimate than it actually is.

The primary v1 problem is to give organizers a lightweight owned hub that makes the community’s current activity and context discoverable, while giving members a polished place to understand what is happening and who to meet without digging through email.

## Jobs to Be Done

### Organizer / Community Steward jobs

- When preparing for an event, the organizer needs to publish and reshare event context from one canonical place so they do not repeatedly hunt through old email threads.
- When community activity changes, the organizer needs to update events, resources, and people context in as few places as possible so the hub stays current without becoming another heavy admin burden.
- When introducing or onboarding members, the organizer needs lightweight people/context pages so introductions feel intentional without requiring a full social platform.
- When sharing the community publicly or semi-publicly, the organizer needs the hub to feel active and legitimate so the community looks as alive as it actually is.

### Member jobs

- When deciding whether to attend or engage, a member needs to quickly find upcoming events, purpose, intended audience, and participation context without searching email.
- When joining for the first time, a new member needs to understand what the community is, who matters, what to do next, and how to participate without prior thread history.
- When re-engaging after being passive, a member needs a lightweight way to see what is current and whether anything relevant is happening.

### Emotional and social jobs

- The organizer should feel in control of the community’s public/current story.
- Members should feel connected, in-the-loop, and confident that the community is real and active.
- The community should look polished and credible without feeling like a heavy platform or noisy chat app.

## Personas

### Primary Persona: Community Steward

- **Goals:** keep the community coherent, current, and legitimate; publish important information once; reduce repeated replies and thread hunting; make events and introductions easy to discover.
- **Context:** manages a professional/networking community from email threads and ad hoc tools; likely resource-constrained; wants a polished public-facing home without adopting a heavy platform.
- **Behaviors today:** sends event/context emails, replies manually, forwards links, re-explains what the community is, tracks member/context details informally.
- **Pain points:** information scattered, repeated admin, unclear source of truth, difficulty making real activity visible, no low-friction way for new or passive members to orient.
- **Success state:** the steward can share one hub link and trust that it explains the community, points to the next relevant event/action, and reflects current activity.

### Secondary Persona: New Member Without Context

- **Goals:** understand what this community is, whether it is active, who to meet, and what to do next.
- **Context:** arrives from an invite, email, or shared link; does not know history or key people.
- **Behaviors today:** searches inbox, asks organizer, skims old emails, may lurk or disengage.
- **Pain points:** cannot see current events, introductions, or resources in one place; unclear participation path.
- **Success state:** within a short first visit, the new member understands the community promise, sees evidence of recent activity, and knows the next action to take.

### Secondary Persona: Passive / Alumni Member

- **Goals:** stay lightly informed, know if something relevant is happening, re-engage when useful.
- **Context:** not checking every thread; may still value the network.
- **Pain points:** email overload, missed context, no lightweight way to browse what changed.
- **Success state:** can skim the hub periodically and see current events/resources without needing a digest or login.

## Desired Outcomes

Exact 1–10 importance and satisfaction ratings were not collected. The table below preserves the qualitative provisional ratings accepted during discovery.

| ID  | Outcome statement                                                                                           | Provisional importance | Provisional current satisfaction | Opportunity        |
| --- | ----------------------------------------------------------------------------------------------------------- | ---------------------: | -------------------------------: | ------------------ |
| O1  | Minimize the time organizers spend locating and resharing information from email threads.                   |                   High |                              Low | Underserved        |
| O2  | Minimize the number of places organizers must update to keep events, resources, and member context current. |                   High |                              Low | Underserved        |
| O3  | Minimize the time members spend finding upcoming events and the context needed to decide whether to attend. |            Medium-high |                              Low | Likely underserved |
| O4  | Minimize the time new members take to understand who to meet and what to do next.                           |                   High |                              Low | Underserved        |
| O5  | Maximize the visibility of real community activity so the community feels alive and legitimate.             |                   High |                              Low | Underserved        |
| O6  | Minimize manual follow-up needed to keep passive/alumni members informed.                                   |           Lower for v1 |                   Unknown/medium | Later / optional   |

## Market Landscape

The market has many adjacent tools, but most solve either broad community management, event logistics, or communication reach. The whitespace for this project is narrower: a lightweight, polished, organizer-first owned community hub for a small/growing professional network.

### Landscape map

- **Circle / Mighty Networks:** broad all-in-one community platforms with spaces, member profiles/directories, events, courses, notifications, monetization, and sometimes email tools. Strong but potentially too heavy or expensive for a lightweight professional-network hub.
- **Hivebrite / association platforms / Raklet / Member365:** deeper membership/community management; better fit for associations or larger organizations; often expensive, sales-led, and setup-heavy.
- **Luma / Meetup / Eventbrite:** strong for event discovery and registration; weaker as a durable community memory, member context, and resource hub.
- **Slack / Discord:** lively interaction, but can recreate the “threads everywhere” problem through channel noise, notification overload, and poor durable discoverability.
- **Email/newsletters:** excellent reach and low adoption friction; weak as a source of truth because knowledge and decisions remain scattered across inboxes.

### Strategic whitespace

A lightweight, polished, organizer-first owned community hub for a small/growing professional network, focused on making events, introductions, resources, and current community context discoverable without becoming a heavy platform, chat app, or monetization stack.

## Constraints

### Hard constraints

- Launch should be small and simple.
- Ongoing admin burden must be low.
- Polished public brand matters more than deep platform features.
- Avoid member login/accounts unless absolutely necessary.
- v1 can be hub-only without automated email sending.
- The site should work for small-to-growing scale while avoiding heavyweight assumptions.

### Explicit scope boundaries for v1

Out of scope for v1:

- Paid memberships, ticketing, payments, subscriptions.
- Native mobile app or push notifications.
- Automated email digest/broadcast bridge.
- Full threaded discussion forum or chat app replacement unless scope changes later.
- Full member account system unless necessary for privacy or access control.

### Assumptions and risks

| Assumption                                                               | Risk       | Notes                                                                                |
| ------------------------------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------ |
| A custom owned site is worth building even though tools may be “enough.” | Medium     | User values branded legitimacy and lightweight organizer-first experience.           |
| Hub-only v1 can still solve enough pain without email bridge.            | Medium     | Email remains where members currently are; future email bridge may become important. |
| Organizer is primary persona.                                            | Low        | Explicitly confirmed.                                                                |
| Events and member intros are primary activity rhythm.                    | Low        | Explicitly confirmed.                                                                |
| Public/no-login access is acceptable for core content.                   | Medium     | Must verify privacy needs for member/person context.                                 |
| Small-to-growing scale is enough for v1.                                 | Low-medium | Scale unknown; avoid heavyweight features.                                           |

## Requirements

Each requirement traces to a job or outcome and includes testable acceptance criteria.

### Functional Requirements

#### FR1 — Owned community home / source of truth

- **Trace:** O1, O2, O5; organizer job; member discoverability job.
- **Requirement:** The website must provide a polished public community home that clearly states what the community is, shows that it is active, and links to current events, people/introduction context, and resources from one place.
- **Acceptance criteria:**
  - A first-time visitor can identify the community purpose, next relevant event/action, and how to participate from the homepage without reading email.
  - Homepage content distinguishes current/upcoming activity from archival content.
  - The site does not require member login to view basic community orientation and public activity.

#### FR2 — Events and meetups hub

- **Trace:** O3, O5; event/member rhythm.
- **Requirement:** The website must list upcoming community events/meetups with enough context for a member to decide whether to attend.
- **Acceptance criteria:**
  - Each event can show title, date/time, location or format, description/context, intended audience, host/contact, and status.
  - Upcoming events are visible together and ordered by date.
  - Past events are not mixed with upcoming events in a way that confuses members.
  - No paid ticketing, subscriptions, or payment flow is required for v1.

#### FR3 — New-member orientation path

- **Trace:** O4; new member persona.
- **Requirement:** The website must include a clear “start here” path for new members to understand who to meet and what to do next.
- **Acceptance criteria:**
  - A new member can find the community purpose, participation expectations, next event, and primary contact/intro path within two clicks from the homepage.
  - The orientation path avoids assuming knowledge from prior email threads.

#### FR4 — Member/introduction context

- **Trace:** O4, O5; professional networking rhythm.
- **Requirement:** The website must provide lightweight member or people context sufficient to support introductions/networking, without requiring self-serve member accounts in v1 unless later deemed necessary.
- **Acceptance criteria:**
  - The site exposes at least organizer/host/key-member profiles or categories relevant to introductions.
  - Profile/context entries can include name, role/affiliation, areas of interest, and how/when to connect, subject to privacy decisions.
  - The requirement must not imply full social networking, private messaging, or account management for v1.

#### FR5 — Resources and announcements hub

- **Trace:** O1, O2, O5; email chaos pain.
- **Requirement:** The website must provide a central place for important resources, links, and announcements so they are not only discoverable through email.
- **Acceptance criteria:**
  - Current resources/announcements are browsable from the homepage or a clearly labeled hub page.
  - Each resource/announcement has a title, short description/context, and date or status where relevant.
  - A member can find a known current resource without searching email.

#### FR6 — Organizer-first content maintenance

- **Trace:** O1, O2; primary persona.
- **Requirement:** Updating events, resources, announcements, and people context must be designed around low organizer burden.
- **Acceptance criteria:**
  - The final product plan should avoid duplicate data entry for the same event/resource/person.
  - The organizer should have a clearly defined, minimal set of content objects to maintain: events, people/intro context, resources/announcements, and community basics.
  - If implementation choices create ongoing manual work, that work must be explicit and justified.

#### FR7 — Optional email bridge excluded from v1

- **Trace:** O6; explicit scope boundary.
- **Requirement:** Automated email digest/broadcast functionality is out of scope for v1, but should be preserved as a future option.
- **Acceptance criteria:**
  - Requirements do not require sending automated emails, managing subscribers, or generating digests.
  - The final product notes that email remains a reach channel but v1 focuses on a hub-only source of truth.

### Non-Functional Requirements

#### NFR1 — Polished branded experience

- **Trace:** social job; hard constraint.
- **Acceptance:** The site should feel like an owned, legitimate community home, not a generic tool dump or bare link list.

#### NFR2 — Mobile-friendly public browsing

- **Trace:** member experience.
- **Acceptance:** Core pages must be usable on mobile screen widths for browsing events, orientation, and resources.

#### NFR3 — Low complexity / fast launch

- **Trace:** hard constraints.
- **Acceptance:** v1 should avoid native mobile apps, payment flows, complex auth, full discussion forums, and heavy platform features.

#### NFR4 — Privacy-conscious people context

- **Trace:** member profiles + no-account constraint.
- **Acceptance:** Any public member/person data needs explicit consent/privacy decisions before implementation.

## Open Questions

- What is the community’s name, brand, voice, and public/private boundary?
- Which content should be public vs members-only?
- Who can be listed in people/member context, and what consent is needed?
- Does v1 need RSVP/contact capture, or just event information?
- What exact content source/workflow will organizers use to update the hub?
- What are exact 1–10 importance/satisfaction ratings for O1–O6?
- What counts as “launched” for the first version: public landing page, usable organizer-maintained hub, or invite-only member pilot?
- What minimum admin workflow is needed for organizers: edit event, publish announcement, add person, or all three?
- Does the first-time member flow need to collect an intro request, or simply guide the member to contact the organizer?

---

## Appendix A — Research Notes

External research consistently supports these pain patterns:

- Email/listservs are reachable but poor as durable community infrastructure: information gets buried, archives/search are weak, reply-all dynamics create hesitation/noise, and members avoid posting because they do not want to “spam” everyone.
- Community managers struggle with sustaining participation, moving members beyond passive broadcast recipients, onboarding members clearly, and centralizing scattered communication.
- Modern community platforms commonly include events, member directories/profiles, announcements/resources, onboarding flows, and email digests; however, these suites can be heavy relative to a small professional network’s needs.

Representative sources reviewed during planning:

- Mailing list/listserv problems: Mailman/list.org, StackExchange/ServerFault discussions, QiqoChat/listserv commentary, University of Washington/MIT mailing list discussion research snippets.
- Community manager challenges: Higher Logic, MemberLounge, Kannect, Sogolytics, Community Roundtable.
- Community platform feature tables: Circle, BetterMode, Heartbeat, MemberSpace, Thri.co, OnlineMemberDirectory.
- Newsletter/community framing: Beehiiv, Inbox Collective, Hivebrite re-engagement material.

## Appendix B — JTBD Evidence

### Evidence from user input

- The community is a professional/networking community.
- It currently lives mostly in email.
- The pain is “many threads going on, it’s disorganized and undiscoverable.”
- Organizer is primary for v1, with new member and passive/alumni member as important secondary perspectives.
- The important rhythms are events/meetups and member introductions/networking.
- The desired shape is “a nice hub for a community that lives currently in email.”
- Tools might be enough, but an owned website is desirable because it creates a branded home, existing tools feel heavy/noisy, and a lightweight organizer-first experience matters.

### Key scenarios

1. **Organizer preparing for an event:** The organizer needs to answer repeated questions about when the event is, who should attend, what the theme is, and who will be there. Today, the answers are spread across past emails and replies; the hub should make the current event context visible in one canonical place.
2. **New member joins from an email invite:** The new member clicks through and needs to understand the community, upcoming opportunities, and people worth meeting. Today, they only have email fragments; the hub should orient them quickly.
3. **Passive member re-engages:** A member who has not been active wants to know what has been happening. Today they must search email threads; the hub should show signs of recent life and provide current resources/events.

## Appendix C — ODI Analysis

The highest opportunity areas are organizer information retrieval/admin burden, first-time member orientation, and visible community legitimacy. Exact ODI scores require future 1–10 importance and satisfaction ratings.

### Opportunity interpretation

- **O1 and O2:** likely highest v1 priority because they address the primary persona and the core source-of-truth problem.
- **O4:** high priority because the first-time member experience determines whether the hub can replace scattered email context.
- **O5:** high priority because legitimacy is a core reason to own a branded hub rather than use a generic tool.
- **O3:** important but should be handled through lightweight event context before adding advanced RSVP or ticketing features.
- **O6:** lower v1 priority because automated email digest/broadcast was explicitly excluded from v1.

## Appendix D — Competitive Analysis

### All-in-one community platforms

Circle and Mighty Networks offer broad functionality: spaces, discussions, member profiles, events, notifications, monetization, and sometimes courses or email integrations. They are strong when a community wants an operating platform, but can be too heavy for a small professional network that primarily needs a credible hub and source of truth.

### Association and membership platforms

Hivebrite, Raklet, Member365, and similar tools fit larger associations, alumni communities, and organizations with more complex membership operations. They are often sales-led, setup-heavy, and deeper than needed for a low-burden v1.

### Event-first tools

Luma, Meetup, and Eventbrite are good at event discovery and registration. They do not naturally solve durable community memory, lightweight member/introduction context, or a branded source-of-truth hub.

### Chat/community channels

Slack and Discord can support live interaction, but they risk recreating the same “threads everywhere” problem. They are weak for durable, public orientation and can become noisy for passive or first-time members.

### Email and newsletters

Email remains valuable for reach and reminders, but it is not sufficient as the durable home. It keeps context fragmented across inboxes and old threads. For v1, email should remain a channel while the website becomes the source of truth.
