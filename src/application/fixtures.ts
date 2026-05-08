import type { RegistrationRequest } from '../domain/accounts';
import type { CompanySummary } from '../domain/companies';
import type { EventSummary } from '../domain/events';
import type { PersonSummary } from '../domain/people';

export const events: EventSummary[] = [
  {
    id: 'evt-founder-breakfast',
    slug: 'founder-breakfast',
    title: 'Founder Breakfast',
    startsAt: '2026-06-04T12:30:00.000Z',
    locationLabel: 'Downtown Fredericton',
    summary: 'A focused morning table for founders comparing current operating constraints.',
    registrationMode: 'external',
    registrationUrl: 'https://example.com/freddy-founders-breakfast',
    registrationLabel: 'Register externally',
    capacityStatus: 'open',
    publicationStatus: 'published',
    visibility: 'public',
  },
  {
    id: 'evt-operator-roundtable',
    slug: 'operator-roundtable',
    title: 'Operator Roundtable',
    startsAt: '2026-06-18T21:00:00.000Z',
    locationLabel: 'Fredericton Knowledge Park',
    summary: 'A small operator session for hiring, GTM, and finance questions.',
    registrationMode: 'disabled',
    registrationLabel: 'Coming soon',
    capacityStatus: 'limited',
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
    role: 'Founder',
    founderContext: 'Exploring Freddy Founders membership.',
    topics: ['Fundraising'],
    publicDirectoryConsent: false,
    status: 'pending',
    createdAt: '2026-05-08T00:00:00.000Z',
  },
];
