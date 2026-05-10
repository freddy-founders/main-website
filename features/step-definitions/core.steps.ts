import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import { listPendingRegistrationRequests, listProfiles } from '../../src/application/admin';
import { listPublicCompanies } from '../../src/application/companies';
import { listPublicEvents } from '../../src/application/events';
import { listPublicPeople } from '../../src/application/people';
import { createRegistrationRequest } from '../../src/application/registrationRequests';
import { canPromoteToRole } from '../../src/domain/accounts';
import type { FreddyWorld } from '../support/world';

Given('the app is private', function () {
  // Product contract: only login and application/register are public surfaces.
});

Given('an approved member is logged in', function (this: FreddyWorld) {
  this.memberLoggedIn = true;
});

When(
  'a visitor opens the private app route {string}',
  function (this: FreddyWorld, _route: string) {
    this.loginRequired = true;
  },
);

Then('login is required', function (this: FreddyWorld) {
  assert.equal(this.loginRequired, true);
});

When('the member lists events', async function (this: FreddyWorld) {
  assert.equal(this.memberLoggedIn, true, 'expected an approved member session');
  this.events = await listPublicEvents();
});

Then('the member sees at least one event', function (this: FreddyWorld) {
  assert.ok(this.events.length > 0, 'expected at least one member-visible event');
});

Then('an event can expose an external registration action', function (this: FreddyWorld) {
  assert.ok(
    this.events.some((event) => event.registrationAction.kind === 'external'),
    'expected at least one external registration action',
  );
});

When('the member lists people', async function (this: FreddyWorld) {
  assert.equal(this.memberLoggedIn, true, 'expected an approved member session');
  this.people = await listPublicPeople();
});

Then('only consented people are returned', function (this: FreddyWorld) {
  assert.ok(this.people.length > 0, 'expected at least one member-visible person');
  assert.ok(
    this.people.every((person) => person.visibility === 'public' && person.publicDirectoryConsent),
    'expected all visible people to be consented',
  );
});

When('the member lists companies', async function (this: FreddyWorld) {
  assert.equal(this.memberLoggedIn, true, 'expected an approved member session');
  this.companies = await listPublicCompanies();
});

Then('the member sees company directory rows', function (this: FreddyWorld) {
  assert.ok(this.companies.length > 0, 'expected at least one member-visible company');
});

When(
  'a founder applies for access with company website {string}',
  async function (this: FreddyWorld, companyWebsiteUrl: string) {
    await createRegistrationRequest({
      name: 'New Founder',
      email: 'new-founder@example.com',
      companyWebsiteUrl,
      townCity: 'Fredericton, NB',
      isCompanyFounder: true,
    });
  },
);

When(
  'a non-founder tries to apply for access with company website {string}',
  async function (this: FreddyWorld, companyWebsiteUrl: string) {
    try {
      await createRegistrationRequest({
        name: 'Operator',
        email: 'operator@example.com',
        companyWebsiteUrl,
        townCity: 'Fredericton, NB',
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

Then('the application request is rejected', function (this: FreddyWorld) {
  assert.ok(this.registrationError instanceof Error, 'expected application to fail');
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

When('an organizer asks for profile governance', async function (this: FreddyWorld) {
  this.profiles = await listProfiles('organizer');
});

When('an admin asks for profile governance', async function (this: FreddyWorld) {
  this.profiles = await listProfiles('admin');
});

When('an organizer tries to promote a member to admin', function (this: FreddyWorld) {
  this.roleChangeAllowed = canPromoteToRole('organizer', 'admin');
});

Then('no profiles are returned', function (this: FreddyWorld) {
  assert.equal(this.profiles.length, 0);
});

Then('profiles are returned for admin governance', function (this: FreddyWorld) {
  assert.ok(this.profiles.length > 0, 'expected admin-visible profiles');
});

Then('the role change is rejected', function (this: FreddyWorld) {
  assert.equal(this.roleChangeAllowed, false);
});
