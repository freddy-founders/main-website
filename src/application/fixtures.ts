import type { RegistrationRequest } from '../domain/accounts';
import type { CompanySummary } from '../domain/companies';
import type { EventSummary } from '../domain/events';
import type { PersonSummary } from '../domain/people';

export const events: EventSummary[] = [
  {
    id: 'evt-june-operator-dinner',
    slug: 'june-operator-dinner',
    title: 'June Operator Dinner: AI Workflows in Local Services',
    startsAt: '2026-06-13T18:30:00.000-03:00',
    locationLabel: 'Fredericton',
    summary:
      'Small dinner for founders and operators building repeatable sales, service delivery, and AI-assisted workflows.',
    registrationMode: 'internal',
    registrationLabel: 'RSVP',
    capacityStatus: 'open',
    publicationStatus: 'published',
    visibility: 'public',
  },
  {
    id: 'evt-hiring-first-sales',
    slug: 'hiring-first-sales',
    title: 'Hiring First Sales: Founder Office Hours',
    startsAt: '2026-06-26T12:00:00.000-03:00',
    locationLabel: 'Zoom',
    summary:
      'Peer session for founders moving from founder-led sales into first sales hire systems and expectations.',
    registrationMode: 'external',
    registrationUrl: 'https://example.com/freddy-founders-sales-office-hours',
    registrationLabel: 'Register',
    capacityStatus: 'open',
    publicationStatus: 'published',
    visibility: 'public',
  },
  {
    id: 'evt-founder-breakfast-pricing',
    slug: 'founder-breakfast-pricing',
    title: 'Founder Breakfast: Pricing and Unit Economics',
    startsAt: '2026-07-09T08:30:00.000-03:00',
    locationLabel: 'Fredericton',
    summary:
      'Small breakfast for founders comparing pricing models, margins, and finance operating rhythms.',
    registrationMode: 'disabled',
    registrationLabel: 'Waitlist',
    capacityStatus: 'waitlist',
    publicationStatus: 'published',
    visibility: 'public',
  },
  {
    id: 'evt-local-services-roundtable',
    slug: 'local-services-roundtable',
    title: 'Local Services Operator Roundtable',
    startsAt: '2026-04-22T16:00:00.000-03:00',
    locationLabel: 'Fredericton',
    summary: 'Archived operator session for local services founders.',
    registrationMode: 'disabled',
    registrationLabel: 'Past',
    capacityStatus: 'unknown',
    publicationStatus: 'published',
    visibility: 'public',
  },
];

export const people: PersonSummary[] = [
  {
    id: 'per-amelia-foster',
    slug: 'amelia-foster',
    name: 'Amelia Foster',
    role: 'Founder',
    companyName: 'River Signal Labs',
    locationLabel: 'Fredericton, NB',
    founderContext: 'Building workflow tools for field teams.',
    topics: ['B2B SaaS', 'Construction', 'AI'],
    publicationStatus: 'published',
    visibility: 'public',
    publicDirectoryConsent: true,
  },
  {
    id: 'per-private-founder',
    slug: 'private-founder',
    name: 'Private Founder',
    role: 'Founder',
    companyName: 'Stealth Co',
    topics: ['Privacy'],
    publicationStatus: 'published',
    visibility: 'private',
    publicDirectoryConsent: false,
  },
];

export const companies: CompanySummary[] = [
  {
    id: 'co-river-signal-labs',
    slug: 'river-signal-labs',
    name: 'River Signal Labs',
    tagline: 'Operational intelligence for field-heavy companies.',
    category: 'B2B SaaS',
    stage: 'Seed',
    locationLabel: 'Fredericton, NB',
    websiteUrl: 'https://example.com',
    relatedPeople: ['Amelia Foster'],
    publicationStatus: 'published',
    visibility: 'public',
  },
];

export const registrationRequests: RegistrationRequest[] = [
  {
    id: 'req-demo',
    name: 'Pending Member',
    email: 'pending@example.com',
    companyName: 'Example Co',
    companyWebsiteUrl: 'https://example.com',
    companyDomain: 'example.com',
    role: 'Founder',
    founderContext: 'Exploring Freddy Founders membership.',
    topics: ['Fundraising'],
    publicDirectoryConsent: false,
    isCompanyFounder: true,
    status: 'pending',
    createdAt: '2026-05-08T00:00:00.000Z',
  },
];
