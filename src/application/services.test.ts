import { describe, expect, it } from 'vitest';
import { createApplicationServices, type ApplicationPorts } from './services';
import type { CompanySummary } from '../domain/companies';
import type { EventSummary } from '../domain/events';
import type { PersonSummary } from '../domain/people';

const eventRecords: EventSummary[] = [
  {
    id: 'evt-1',
    slug: 'open-event',
    title: 'Open Event',
    startsAt: '2026-06-01T12:00:00.000Z',
    locationLabel: 'Fredericton',
    summary: 'Open registration event.',
    registrationMode: 'external',
    registrationUrl: 'https://example.com/open-event',
    registrationLabel: 'Register',
    capacityStatus: 'open',
    publicationStatus: 'published',
    visibility: 'public',
  },
];

const personRecords: PersonSummary[] = [
  {
    id: 'person-1',
    slug: 'public-founder',
    name: 'Public Founder',
    role: 'Founder',
    topics: ['AI'],
    publicationStatus: 'published',
    visibility: 'public',
    publicDirectoryConsent: true,
  },
];

const companyRecords: CompanySummary[] = [
  {
    id: 'company-1',
    slug: 'public-company',
    name: 'Public Company',
    tagline: 'Public-safe company row.',
    category: 'B2B SaaS',
    relatedPeople: ['Public Founder'],
    publicationStatus: 'published',
    visibility: 'public',
  },
];

function createPortsFixture(): ApplicationPorts {
  return {
    auth: {
      async getCurrentSession() {
        return null;
      },
      async signInWithEmail() {},
      async signOut() {},
    },
    events: {
      async listPublicEvents() {
        return eventRecords;
      },
      async getPublicEventBySlug(slug) {
        return eventRecords.find((event) => event.slug === slug) ?? null;
      },
    },
    people: {
      async listPublicPeople() {
        return personRecords;
      },
      async getPublicPersonBySlug(slug) {
        return personRecords.find((person) => person.slug === slug) ?? null;
      },
    },
    companies: {
      async listPublicCompanies() {
        return companyRecords;
      },
      async getPublicCompanyBySlug(slug) {
        return companyRecords.find((company) => company.slug === slug) ?? null;
      },
    },
    registrationRequests: {
      async createRegistrationRequest() {},
      async listPendingRegistrationRequests(role) {
        if (role !== 'admin') {
          return [];
        }

        return [
          {
            id: 'request-1',
            name: 'Pending Founder',
            email: 'pending@example.com',
            companyName: 'Example Co',
            companyWebsiteUrl: 'https://example.com',
            companyDomain: 'example.com',
            role: 'Founder',
            topics: ['Fundraising'],
            publicDirectoryConsent: false,
            isCompanyFounder: true,
            status: 'pending',
            createdAt: '2026-05-08T00:00:00.000Z',
          },
        ];
      },
    },
  };
}

describe('application services', () => {
  it('adds registration actions without making UI depend on event internals', async () => {
    const services = createApplicationServices(createPortsFixture());

    await expect(services.events.hasExternalEventRegistration()).resolves.toBe(true);
    await expect(services.events.listPublicEvents()).resolves.toMatchObject([
      {
        slug: 'open-event',
        registrationAction: {
          kind: 'external',
          url: 'https://example.com/open-event',
        },
      },
    ]);
  });

  it('keeps admin registration review behind an admin role', async () => {
    const services = createApplicationServices(createPortsFixture());

    await expect(services.admin.listPendingRegistrationRequests(null)).resolves.toEqual([]);
    await expect(services.admin.listPendingRegistrationRequests('admin')).resolves.toHaveLength(1);
  });

  it('normalizes founder registration requests before the adapter boundary', async () => {
    const ports = createPortsFixture();
    let capturedCompanyDomain = '';
    ports.registrationRequests.createRegistrationRequest = async (input) => {
      capturedCompanyDomain = input.companyDomain;
    };
    const services = createApplicationServices(ports);

    await services.registrationRequests.createRegistrationRequest({
      name: ' Pending Founder ',
      email: 'PENDING@EXAMPLE.COM',
      companyName: ' Example Co ',
      companyWebsiteUrl: 'www.example.com/join',
      role: ' Founder ',
      founderContext: ' Building in Fredericton. ',
      topics: [' AI ', ''],
      publicDirectoryConsent: false,
      isCompanyFounder: true,
    });

    expect(capturedCompanyDomain).toBe('example.com');
  });

  it('rejects registration requests without founder affirmation', async () => {
    const services = createApplicationServices(createPortsFixture());

    await expect(
      services.registrationRequests.createRegistrationRequest({
        name: 'Pending Founder',
        email: 'pending@example.com',
        companyName: 'Example Co',
        companyWebsiteUrl: 'https://example.com',
        topics: [],
        publicDirectoryConsent: false,
        isCompanyFounder: false,
      }),
    ).rejects.toThrow('Founder affirmation is required.');
  });
});
