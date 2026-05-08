import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import { listPendingRegistrationRequests } from '../../src/application/admin';
import { listPublicCompanies } from '../../src/application/companies';
import { listPublicEvents } from '../../src/application/events';
import { listPublicPeople } from '../../src/application/people';
import { createRegistrationRequest } from '../../src/application/registrationRequests';
import type { FreddyWorld } from '../support/world';

Given('public browsing is open', function () {
  // This is the product contract: public list pages must not require a session.
});

When('a visitor lists public events', async function (this: FreddyWorld) {
  this.events = await listPublicEvents();
});

Then('the visitor sees at least one event without signing in', function (this: FreddyWorld) {
  assert.ok(this.events.length > 0, 'expected at least one public event');
});

Then('an event can expose an external registration action', function (this: FreddyWorld) {
  assert.ok(
    this.events.some((event) => event.registrationAction.kind === 'external'),
    'expected at least one external registration action',
  );
});

When('a visitor lists public people', async function (this: FreddyWorld) {
  this.people = await listPublicPeople();
});

Then('only consented public people are returned', function (this: FreddyWorld) {
  assert.ok(this.people.length > 0, 'expected at least one public person');
  assert.ok(
    this.people.every((person) => person.visibility === 'public' && person.publicDirectoryConsent),
    'expected all visible people to be public and consented',
  );
});

When('a visitor lists public companies', async function (this: FreddyWorld) {
  this.companies = await listPublicCompanies();
});

Then('the visitor sees public company directory rows', function (this: FreddyWorld) {
  assert.ok(this.companies.length > 0, 'expected at least one public company');
  assert.ok(
    this.companies.every((company) => company.visibility === 'public'),
    'expected all company rows to be public',
  );
});

When('a visitor asks for pending registration requests', async function (this: FreddyWorld) {
  this.registrationRequests = await listPendingRegistrationRequests(null);
});

Then('no pending registration requests are returned', function (this: FreddyWorld) {
  assert.equal(this.registrationRequests.length, 0);
});

When('an admin asks for pending registration requests', async function (this: FreddyWorld) {
  this.registrationRequests = await listPendingRegistrationRequests('admin');
});

Then('pending registration requests are returned for review', function (this: FreddyWorld) {
  assert.ok(
    this.registrationRequests.length > 0,
    'expected admin to see pending registration requests',
  );
});

When(
  'a founder requests access for company website {string}',
  async function (this: FreddyWorld, companyWebsiteUrl: string) {
    await createRegistrationRequest({
      name: 'New Founder',
      email: 'new-founder@example.com',
      companyName: 'New Co',
      companyWebsiteUrl,
      role: 'Founder',
      founderContext: 'Building a company in Fredericton.',
      topics: ['AI'],
      publicDirectoryConsent: false,
      isCompanyFounder: true,
    });
  },
);

When(
  'a non-founder tries to request access for company website {string}',
  async function (this: FreddyWorld, companyWebsiteUrl: string) {
    try {
      await createRegistrationRequest({
        name: 'Operator',
        email: 'operator@example.com',
        companyName: 'Operator Co',
        companyWebsiteUrl,
        role: 'Operator',
        founderContext: 'I work with founders.',
        topics: ['Operations'],
        publicDirectoryConsent: false,
        isCompanyFounder: false,
      });
    } catch (error) {
      this.registrationError = error;
    }
  },
);

Then(
  'an admin sees a pending founder request for domain {string}',
  async function (this: FreddyWorld, companyDomain: string) {
    this.registrationRequests = await listPendingRegistrationRequests('admin');
    assert.ok(
      this.registrationRequests.some(
        (request) => request.companyDomain === companyDomain && request.isCompanyFounder,
      ),
      `expected a pending founder request for ${companyDomain}`,
    );
  },
);

Then('the signup request is rejected', function (this: FreddyWorld) {
  assert.ok(this.registrationError instanceof Error, 'expected registration to fail');
});
